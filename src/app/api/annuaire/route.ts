import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

// Annuaire interne du cabinet.
//
// Lisible par tout collaborateur authentifié, contrairement à /api/admin/users
// qui est réservé aux administrateurs et expose l'état des comptes. On ne
// renvoie ici que ce qui sert à joindre un collègue : ni mot de passe, ni date
// de dernière connexion, ni statut d'activation.

const LIBELLE_ROLE: Record<string, string> = {
    ADMIN: "Administrateur",
    EXPERT: "Expert-comptable",
    COLLABORATOR: "Collaborateur",
    ASSISTANT: "Assistant",
};

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const recherche = searchParams.get("recherche")?.trim();
        const role = searchParams.get("role")?.trim().toUpperCase();

        const membres = await prisma.user.findMany({
            where: {
                isActive: true,
                ...(role && role !== "TOUS" ? { role: role as never } : {}),
                ...(recherche
                    ? {
                          OR: [
                              { firstName: { contains: recherche, mode: "insensitive" } },
                              { lastName: { contains: recherche, mode: "insensitive" } },
                              { email: { contains: recherche, mode: "insensitive" } },
                          ],
                      }
                    : {}),
            },
            orderBy: [{ role: "asc" }, { lastName: "asc" }],
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
                _count: {
                    select: {
                        assignedMissions: true,
                        createdMissions: true,
                    },
                },
            },
        });

        const initiales = (prenom: string, nom: string) =>
            `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase() || "?";

        return NextResponse.json({
            membres: membres.map((m) => ({
                id: m.id,
                nom: `${m.firstName} ${m.lastName}`.trim(),
                initiales: initiales(m.firstName, m.lastName),
                email: m.email,
                telephone: m.phone,
                avatar: m.avatar,
                role: m.role,
                roleLibelle: LIBELLE_ROLE[m.role] ?? m.role,
                missionsAssignees: m._count.assignedMissions,
                missionsCreees: m._count.createdMissions,
            })),
            total: membres.length,
            parRole: Object.entries(
                membres.reduce<Record<string, number>>((acc, m) => {
                    acc[m.role] = (acc[m.role] ?? 0) + 1;
                    return acc;
                }, {})
            ).map(([role, nombre]) => ({
                role,
                libelle: LIBELLE_ROLE[role] ?? role,
                nombre,
            })),
        });
    } catch (error) {
        console.error("Erreur API annuaire:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
