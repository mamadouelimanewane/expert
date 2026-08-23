import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { analyserRentabilite, synthetiserRentabilite } from "@/lib/rentabilite-mission";

// Boni/mali des missions budgétées.
//
// Le coût interne est calculé à partir du coût horaire de chaque collaborateur
// (User.costRate). Tant qu'un cabinet ne l'a pas paramétré, le boni/mali des
// missions qu'il a servies reste INDÉTERMINÉ — jamais affiché comme un boni
// maximal ou un coût nul.

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");

        const missions = await prisma.mission.findMany({
            where: {
                estimatedHours: { not: null },
                ...(clientId ? { clientId } : {}),
            },
            orderBy: { deadline: "asc" },
            take: 100,
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                timeEntries: {
                    select: { duration: true, userId: true, user: { select: { costRate: true } } },
                },
            },
        });

        const analyses = missions.map((m) => {
            const parIntervenant = new Map<string, { heures: number; coutHoraire: number | null }>();
            for (const t of m.timeEntries) {
                const courant = parIntervenant.get(t.userId) ?? { heures: 0, coutHoraire: t.user.costRate };
                courant.heures += t.duration;
                parIntervenant.set(t.userId, courant);
            }

            const analyse = analyserRentabilite({
                id: m.id,
                budgetHonoraires: m.fixedPrice ?? (m.hourlyRate ? m.hourlyRate * (m.estimatedHours ?? 0) : 0),
                budgetHeures: m.estimatedHours ?? 0,
                intervenants: [...parIntervenant.entries()].map(([userId, v]) => ({
                    userId,
                    heures: v.heures,
                    coutHoraire: v.coutHoraire,
                })),
            });

            return {
                ...analyse,
                titre: m.title,
                client:
                    m.client.companyName ||
                    [m.client.firstName, m.client.lastName].filter(Boolean).join(" ") ||
                    "Client sans nom",
                statutMission: m.status,
                deadline: m.deadline?.toISOString() ?? null,
            };
        });

        // Combien de collaborateurs actifs n'ont pas de coût horaire paramétré :
        // renseigne l'utilisateur sur la cause d'un taux d'indétermination élevé.
        const nbSansCoutHoraire = await prisma.user.count({
            where: { isActive: true, costRate: null, role: { in: ["EXPERT", "COLLABORATOR", "ASSISTANT"] } },
        });

        return NextResponse.json({
            missions: analyses,
            synthese: synthetiserRentabilite(analyses),
            nbCollaborateursSansCoutHoraire: nbSansCoutHoraire,
            aucuneDonnee: missions.length === 0,
        });
    } catch (error) {
        console.error("Erreur API boni-mali:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
