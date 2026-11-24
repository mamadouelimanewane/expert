import { NextResponse } from "next/server";

import { InvoiceStatus, type Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess, estIntrouvable } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { parsePagination, reponsePaginee } from "@/lib/pagination";
import { invoiceCreateSchema, invoiceUpdateSchema, parseBody } from "@/lib/validation";

export async function GET(request: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const pagination = parsePagination(searchParams);

    if (clientId && !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide" }, { status: 400 });
    }

    try {
        const where: Prisma.InvoiceWhereInput = { cabinetId: session.cabinetId };
        if (clientId) where.clientId = clientId;
        if (status && status !== "tous") {
            const statusMap: Record<string, InvoiceStatus> = {
                payee: "PAID",
                retard: "OVERDUE",
                brouillon: "DRAFT",
                envoyee: "SENT"
            };
            const resolvedStatus = statusMap[status] ?? status.toUpperCase();
            if (!Object.values(InvoiceStatus).includes(resolvedStatus as InvoiceStatus)) return NextResponse.json({ error: "Statut de facture invalide." }, { status: 400 });
            where.status = resolvedStatus as InvoiceStatus;
        }

        // Les KPI passent par `aggregate` et portent sur la totalité des
        // factures : la pagination ne concerne que la liste affichée.
        const [invoices, total, paidTotal, pendingTotal, overdueCount] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: { client: { omit: { portalToken: true } } },
                orderBy: { issueDate: "desc" },
                skip: pagination.skip,
                take: pagination.take
            }),
            prisma.invoice.count({ where }),
            prisma.invoice.aggregate({
                _sum: { total: true },
                where: { ...where, status: "PAID" }
            }),
            prisma.invoice.aggregate({
                _sum: { total: true },
                where: { ...where, status: { in: ["SENT", "OVERDUE"] } }
            }),
            prisma.invoice.count({ where: { ...where, status: "OVERDUE" } })
        ]);

        return NextResponse.json({
            invoices,
            pagination: reponsePaginee(invoices, total, pagination),
            kpis: {
                paid: paidTotal._sum.total || 0,
                pending: pendingTotal._sum.total || 0,
                overdueCount
            }
        });
    } catch (error: unknown) {
        console.error("Invoices GET error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const { data: body, invalid } = await parseBody(request, invoiceCreateSchema);
    if (invalid) return invalid;

    try {
        const client = await prisma.client.findFirst({ where: { id: body.clientId, cabinetId: session.cabinetId }, select: { id: true } });
        if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });
        const subtotal = body.lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
        const taxRate = body.taxRate ?? 18;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        const invoice = await creerFactureAvecNumero({
            cabinetId: session.cabinetId,
            issueDate: new Date(),
            dueDate: body.dueDate,
            status: "DRAFT",
            subtotal,
            taxRate,
            taxAmount,
            total,
            notes: body.notes ?? "",
            clientId: body.clientId,
            // Détail conservé pour l'édition de la facture (auparavant seuls
            // les totaux étaient stockés : une facture n'avait aucune ligne).
            lines: body.lines.map((l) => ({
                designation: l.designation ?? "",
                quantity: l.quantity,
                unitPrice: l.unitPrice,
                amount: Math.round(l.quantity * l.unitPrice * 100) / 100,
            })),
        }, session.cabinetId!);

        return NextResponse.json({ invoice }, { status: 201 });
    } catch (error: unknown) {
        console.error("Invoice POST error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * Crée la facture en attribuant son numéro séquentiel.
 *
 * `count() + 1` seul est sujet à une course : deux créations simultanées
 * calculent le même numéro et la seconde viole la contrainte d'unicité sur
 * `invoiceNumber`. On réessaie donc sur collision plutôt que de renvoyer une
 * erreur 500 à l'utilisateur.
 */
async function creerFactureAvecNumero(
    data: Omit<Prisma.InvoiceUncheckedCreateInput, "invoiceNumber">,
    cabinetId: string
) {
    const annee = new Date().getFullYear();
    const base = await prisma.invoice.count({ where: { cabinetId } });

    for (let tentative = 0; tentative < 5; tentative++) {
        const invoiceNumber = `FAC-${annee}-${String(base + 1 + tentative).padStart(3, "0")}`;
        try {
            return await prisma.invoice.create({
                data: { ...data, invoiceNumber },
                include: { client: { omit: { portalToken: true } } }
            });
        } catch (error: unknown) {
            // P2002 = violation de contrainte d'unicité
            if (typeof error !== "object" || error === null || (error as { code?: string }).code !== "P2002") throw error;
        }
    }

    throw new Error("Impossible d'attribuer un numéro de facture unique après 5 tentatives");
}

export async function PATCH(request: Request) {
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;

    const { data: body, invalid } = await parseBody(request, invoiceUpdateSchema);
    if (invalid) return invalid;

    try {
        const { id, status, paidDate } = body;

        const existing = await prisma.invoice.findFirst({ where: { id, cabinetId: session.cabinetId }, select: { id: true } });
        if (!existing) return NextResponse.json({ error: "Facture introuvable dans ce cabinet." }, { status: 404 });
        await prisma.invoice.updateMany({
            where: { id, cabinetId: session.cabinetId },
            data: {
                status,
                ...(status === "PAID" && { paidDate: paidDate ?? new Date() })
            }
        });
        const invoice = await prisma.invoice.findFirst({ where: { id, cabinetId: session.cabinetId } });
        if (!invoice) return NextResponse.json({ error: "Facture introuvable dans ce cabinet." }, { status: 404 });

        return NextResponse.json({ invoice });
    } catch (error: unknown) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
        }
        console.error("Invoice PATCH error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
