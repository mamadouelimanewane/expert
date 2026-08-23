import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPortalClient } from "@/lib/portal-auth";

// Calendrier des obligations fiscales du client, vu depuis le portail.
//
// La page affichait cinq échéances fictives — dont une TVA de 12 500 000 FCFA
// marquée « URGENT » à deux jours, et une autre marquée « RÉGLÉ » — pour
// n'importe quel client se connectant avec son lien. Un client externe pouvait
// croire avoir déjà payé une somme qu'il doit encore, ou l'inverse. C'est
// l'écran le plus sensible de l'application : il s'adresse à un tiers hors du
// cabinet, sans supervision d'un collaborateur au moment de la lecture.
//
// Renvoie désormais les déclarations réellement enregistrées pour ce client.

const LIBELLE_STATUT: Record<string, string> = {
    DRAFT: "EN PRÉPARATION",
    PENDING: "À VENIR",
    SUBMITTED: "TÉLÉTRANSMISE",
    VALIDATED: "RÉGLÉ",
    REJECTED: "REJETÉE",
};

export async function GET(req: Request) {
    const client = await getPortalClient(req);
    if (!client) {
        return NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
    }

    try {
        const declarations = await prisma.taxDeclaration.findMany({
            where: { clientId: client.id },
            orderBy: { dueDate: "asc" },
            take: 50,
        });

        const maintenant = Date.now();

        const obligations = declarations.map((d) => {
            const jours = Math.ceil((d.dueDate.getTime() - maintenant) / 86_400_000);
            const regle = d.status === "VALIDATED";

            return {
                id: d.id,
                type: `${d.type} — ${d.period}`,
                date: d.dueDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
                // Un montant non renseigné est affiché comme tel : jamais
                // remplacé par une valeur estimée non vérifiée.
                amount: d.amount != null ? `${d.amount.toLocaleString("fr-FR")} FCFA` : "À déterminer",
                status: regle ? "RÉGLÉ" : jours <= 3 ? "URGENT" : jours <= 14 ? "PROCHE" : LIBELLE_STATUT[d.status] ?? d.status,
                days: jours,
            };
        });

        return NextResponse.json({
            obligations,
            aucuneDonnee: declarations.length === 0,
        });
    } catch (error) {
        console.error("Erreur API portail obligations:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
