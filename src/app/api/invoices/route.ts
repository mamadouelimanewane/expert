import { NextResponse } from "next/server";

import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff, estIntrouvable } from "@/lib/api-auth";
import { parsePagination, reponsePaginee } from "@/lib/pagination";
import { invoiceCreateSchema, invoiceUpdateSchema, parseBody } from "@/lib/validation";

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pagination = parsePagination(searchParams);

    try {
        const where: any = {};
        if (status && status !== "tous") {
            const statusMap: Record<string, string> = {
                payee: "PAID",
                retard: "OVERDUE",
                brouillon: "DRAFT",
                envoyee: "SENT"
            };
            where.status = statusMap[status] || status.toUpperCase();
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
                where: { status: "PAID" }
            }),
            prisma.invoice.aggregate({
                _sum: { total: true },
                where: { status: { in: ["SENT", "OVERDUE"] } }
            }),
            prisma.invoice.count({ where: { status: "OVERDUE" } })
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
    } catch (error: any) {
        console.error("Invoices GET error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { data: body, invalid } = await parseBody(request, invoiceCreateSchema);
    if (invalid) return invalid;

    try {
        const subtotal = body.lines.reduce((acc, l) => acc + l.quantity * l.unitPrice, 0);
        const taxRate = body.taxRate ?? 18;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        const invoice = await creerFactureAvecNumero({
            issueDate: new Date(),
            dueDate: body.dueDate,
            status: "DRAFT",
            subtotal,
            taxRate,
            taxAmount,
            total,
            notes: body.notes ?? "",
            clientId: body.clientId
        });

        return NextResponse.json({ invoice }, { status: 201 });
    } catch (error: any) {
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
    data: Omit<Prisma.InvoiceUncheckedCreateInput, "invoiceNumber">
) {
    const annee = new Date().getFullYear();
    const base = await prisma.invoice.count();

    for (let tentative = 0; tentative < 5; tentative++) {
        const invoiceNumber = `FAC-${annee}-${String(base + 1 + tentative).padStart(3, "0")}`;
        try {
            return await prisma.invoice.create({
                data: { ...data, invoiceNumber },
                include: { client: { omit: { portalToken: true } } }
            });
        } catch (error: any) {
            // P2002 = violation de contrainte d'unicité
            if (error?.code !== "P2002") throw error;
        }
    }

    throw new Error("Impossible d'attribuer un numéro de facture unique après 5 tentatives");
}

export async function PATCH(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { data: body, invalid } = await parseBody(request, invoiceUpdateSchema);
    if (invalid) return invalid;

    try {
        const { id, status, paidDate } = body;

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status,
                ...(status === "PAID" && { paidDate: paidDate ?? new Date() })
            }
        });

        return NextResponse.json({ invoice });
    } catch (error: any) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
        }
        console.error("Invoice PATCH error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
