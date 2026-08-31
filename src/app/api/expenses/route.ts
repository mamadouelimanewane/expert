import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { AuditService } from "@/lib/audit";
import { analyserMontant } from "@/lib/validation";
import { WRITE_ROLES } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const missionId = searchParams.get("missionId");

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (missionId) where.missionId = missionId;

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ expenses });
    } catch (error) {
        console.error("Erreur GET expenses:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { label, category, amount, expenseDate, missionId, receiptUrl, notes } = body;

        if (!label || !amount || !expenseDate) {
            return NextResponse.json({ error: "Champs requis manquants (libellé, montant, date)" }, { status: 400 });
        }

        const montant = analyserMontant(amount, { min: 0 });
        if (!montant.ok) {
            return NextResponse.json({ error: montant.raison }, { status: 400 });
        }

        const expense = await prisma.expense.create({
            data: {
                label,
                category: category || "AUTRE",
                amount: montant.valeur,
                expenseDate: new Date(expenseDate),
                missionId: missionId || null,
                receiptUrl: receiptUrl || null,
                notes: notes || null,
                status: "EN_ATTENTE",
                userId: session.id,
            },
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "CREATE",
            entity: "EXPENSE",
            entityId: expense.id,
            details: `Note de frais créée : ${label} (${expense.amount} FCFA)`,
        });

        return NextResponse.json({ expense }, { status: 201 });
    } catch (error) {
        console.error("Erreur POST expenses:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

const STATUTS_DEPENSE = ["EN_ATTENTE", "APPROUVEE", "REJETEE", "REMBOURSEE"];

// Statuts qui engagent financièrement le cabinet : ils relèvent d'une
// validation hiérarchique, pas du déclarant.
const STATUTS_VALIDATION = ["APPROUVEE", "REMBOURSEE"];

export async function PATCH(request: NextRequest) {
    try {
        const session = await AuthService.getSession();
        if (!session) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: "id et status requis" }, { status: 400 });
        }

        if (!STATUTS_DEPENSE.includes(status)) {
            return NextResponse.json({ error: "Statut inconnu." }, { status: 400 });
        }

        const existante = await prisma.expense.findUnique({
            where: { id },
            select: { id: true, userId: true },
        });
        if (!existante) {
            return NextResponse.json({ error: "Note de frais introuvable." }, { status: 404 });
        }

        // Aucune séparation des tâches n'était appliquée ici : tout compte
        // staff, y compris ASSISTANT et y compris le déclarant lui-même,
        // pouvait passer n'importe quelle note de frais à APPROUVEE ou
        // REMBOURSEE — `approvedById: session.id` enregistrant alors l'auteur
        // comme son propre approbateur.
        if (STATUTS_VALIDATION.includes(status)) {
            if (!WRITE_ROLES.includes(session.role as (typeof WRITE_ROLES)[number])) {
                return NextResponse.json(
                    { error: "Seuls un expert, un collaborateur ou un administrateur peuvent valider une note de frais." },
                    { status: 403 }
                );
            }
            if (existante.userId === session.id) {
                return NextResponse.json(
                    { error: "Vous ne pouvez pas valider votre propre note de frais." },
                    { status: 403 }
                );
            }
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                status,
                ...(status === "APPROUVEE" ? { approvedById: session.id } : {}),
            },
            include: {
                mission: { select: { id: true, title: true } },
                user: { select: { id: true, firstName: true, lastName: true } },
                approvedBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await AuditService.log({
            action: "UPDATE",
            entity: "EXPENSE",
            entityId: expense.id,
            details: `Statut de la note de frais mis à jour : ${status}`,
        });

        return NextResponse.json({ expense });
    } catch (error) {
        console.error("Erreur PATCH expenses:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
