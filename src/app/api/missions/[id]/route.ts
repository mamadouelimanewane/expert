import { NextResponse } from "next/server";
import { MissionStatus, MissionType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { AuditService } from "@/lib/audit";
import { analyserEnum, estIntrouvable, requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { analyserMontantOptionnel, normaliserDateISO } from "@/lib/validation";
import { canManageReviewResolution } from "@/lib/audit-review-policy";

type Params = { params: Promise<{ id: string }> };

// Transitions de statut autorisées : une mission terminée ou annulée ne
// repasse pas « en cours » sans décision explicite (rouvrir = DRAFT).
const TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
    DRAFT: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["PENDING_REVIEW", "COMPLETED", "CANCELLED", "DRAFT"],
    PENDING_REVIEW: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
    COMPLETED: ["DRAFT"],
    CANCELLED: ["DRAFT"],
};

export async function GET(request: Request, { params }: Params) {
    const { denied } = await requireStaff();
    if (denied) return denied;
    try {
        const { id } = await params;
        const mission = await prisma.mission.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true, country: true, email: true, phone: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                tasks: { orderBy: { createdAt: "asc" } },
                timeEntries: { orderBy: { date: "desc" }, take: 50, include: { user: { select: { firstName: true, lastName: true } } } },
                expenses: { orderBy: { expenseDate: "desc" }, take: 50 },
                engagementLetters: { select: { id: true, reference: true, status: true, fees: true, signedAt: true } },
                documents: { select: { id: true, fileName: true, type: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 },
            },
        });
        if (!mission) {
            return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
        }
        const heures = mission.timeEntries.reduce((s, t) => s + (t.duration ?? 0), 0);
        const depenses = mission.expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
        return NextResponse.json({ mission, synthese: { heures, depenses } });
    } catch (error) {
        console.error("Erreur GET missions/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * PATCH { status?, title?, description?, type?, deadline?, budget?, assignedToId? }
 *
 * Le tableau kanban des missions était en lecture seule : aucune route ne
 * permettait de faire avancer une mission, qui restait « DRAFT » à vie.
 */
export async function PATCH(request: Request, { params }: Params) {
    const { denied, session } = await requireWriteAccess();
    if (denied) return denied;
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const actuelle = await prisma.mission.findUnique({ where: { id }, select: { status: true, title: true, type: true } });
        if (!actuelle) {
            return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
        }

        const data: Record<string, unknown> = {};

        if (body.status !== undefined) {
            const statut = analyserEnum(body.status, Object.values(MissionStatus), "Statut");
            if (!statut.ok) return NextResponse.json({ error: statut.raison }, { status: 400 });
            if (statut.valeur !== actuelle.status && !TRANSITIONS[actuelle.status].includes(statut.valeur)) {
                return NextResponse.json(
                    { error: `Passage ${actuelle.status} → ${statut.valeur} non autorisé. Transitions possibles : ${TRANSITIONS[actuelle.status].join(", ")}.` },
                    { status: 409 }
                );
            }
            if (statut.valeur === "COMPLETED" && actuelle.type === "AUDIT") {
                if (!canManageReviewResolution(session.role)) {
                    return NextResponse.json({ error: "Seul un expert ou administrateur peut clôturer une mission d’audit." }, { status: 403 });
                }
                const pointsOuverts = await prisma.auditReviewComment.count({ where: { missionId: id, status: "OPEN" } });
                if (pointsOuverts > 0) {
                    return NextResponse.json({
                        error: "Clôture impossible : résolvez ou archivez les points de revue encore ouverts.",
                        pointsDeRevueOuverts: pointsOuverts,
                    }, { status: 409 });
                }
                const [nombreSections, sectionsNonRevues, testsNonRevus] = await Promise.all([
                    prisma.auditSection.count({ where: { missionId: id } }),
                    prisma.auditSection.count({ where: { missionId: id, OR: [{ conclusion: null }, { reviewStatus: { not: "REVIEWED" } }] } }),
                    prisma.auditSample.count({ where: { missionId: id, status: "DRAFT" } }),
                ]);
                if (nombreSections === 0 || sectionsNonRevues > 0 || testsNonRevus > 0) {
                    return NextResponse.json({
                        error: "Clôture impossible : toutes les sections doivent être conclues et revues, ainsi que les tests d’échantillonnage.",
                        sectionsNonRevues: nombreSections === 0 ? 1 : sectionsNonRevues,
                        testsNonRevus,
                    }, { status: 409 });
                }
            }
            if (statut.valeur === "IN_PROGRESS" && actuelle.type === "AUDIT") {
                const assessment = await prisma.auditEngagementAssessment.findFirst({ where: { missionId: id }, select: { acceptanceStatus: true, independenceStatus: true } });
                if (assessment?.acceptanceStatus !== "ACCEPTED" || assessment.independenceStatus !== "CLEAR") {
                    return NextResponse.json({
                        error: "Démarrage bloqué : faites valider l’acceptation du client et l’indépendance de l’équipe avant les travaux.",
                        acceptationValidee: assessment?.acceptanceStatus === "ACCEPTED",
                        independanceValidee: assessment?.independenceStatus === "CLEAR",
                    }, { status: 409 });
                }
            }
            data.status = statut.valeur;
            if (statut.valeur === "COMPLETED") data.endDate = new Date();
            if (statut.valeur === "IN_PROGRESS" || statut.valeur === "DRAFT") data.endDate = null;
        }
        if (body.type !== undefined) {
            const type = analyserEnum(body.type, Object.values(MissionType), "Type de mission");
            if (!type.ok) return NextResponse.json({ error: type.raison }, { status: 400 });
            data.type = type.valeur;
        }
        if (body.title !== undefined) {
            const titre = String(body.title).trim();
            if (!titre || titre.length > 200) return NextResponse.json({ error: "Titre requis (200 caractères max)." }, { status: 400 });
            data.title = titre;
        }
        if (body.description !== undefined) {
            data.description = body.description === null ? null : String(body.description).slice(0, 5000);
        }
        if (body.deadline !== undefined) {
            if (body.deadline === null) data.deadline = null;
            else {
                const iso = normaliserDateISO(body.deadline);
                if (!iso) return NextResponse.json({ error: "Échéance invalide." }, { status: 400 });
                data.deadline = new Date(iso);
            }
        }
        if (body.budget !== undefined) {
            const budget = analyserMontantOptionnel(body.budget, { min: 0 });
            if (!budget.ok) return NextResponse.json({ error: budget.raison }, { status: 400 });
            data.fixedPrice = budget.valeur;
        }
        if (body.assignedToId !== undefined) {
            if (body.assignedToId === null) data.assignedToId = null;
            else {
                const user = await prisma.user.findUnique({ where: { id: String(body.assignedToId) }, select: { id: true } });
                if (!user) return NextResponse.json({ error: "Collaborateur introuvable." }, { status: 404 });
                data.assignedToId = user.id;
            }
        }
        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "Aucun champ à modifier." }, { status: 400 });
        }

        const mission = await prisma.mission.update({
            where: { id },
            data,
            include: { client: { select: { id: true, companyName: true } }, assignedTo: { select: { id: true, firstName: true, lastName: true } } },
        });
        await AuditService.log({
            action: "UPDATE",
            entity: "MISSION",
            entityId: id,
            oldValue: { status: actuelle.status },
            newValue: data,
            details: `Mission « ${actuelle.title} » modifiée par ${session?.name ?? "?"} : ${Object.keys(data).join(", ")}`,
        });
        return NextResponse.json({ mission });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
        }
        console.error("Erreur PATCH missions/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/** Annulation (pas de suppression : les temps saisis et factures restent rattachés). */
export async function DELETE(request: Request, { params }: Params) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;
    try {
        const { id } = await params;
        const mission = await prisma.mission.update({
            where: { id },
            data: { status: "CANCELLED" },
            select: { id: true, title: true, status: true },
        });
        await AuditService.log({ action: "DELETE", entity: "MISSION", entityId: id, details: `Mission annulée : ${mission.title}` });
        return NextResponse.json({ mission });
    } catch (error) {
        if (estIntrouvable(error)) {
            return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
        }
        console.error("Erreur DELETE missions/[id]:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
