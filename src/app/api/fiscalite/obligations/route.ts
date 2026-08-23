import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import {
    echeancePour,
    OBLIGATIONS_FISCALES,
    urgenceDe,
    type ObligationFiscale,
} from "@/lib/ohada/obligations-fiscales";

// Calendrier des obligations fiscales du cabinet.
//
// Le catalogue des obligations est une donnée réglementaire de référence ; les
// volumes et les montants, eux, sont calculés à partir des déclarations
// réellement saisies. La page affichait auparavant des compteurs figés
// (« 12 dossiers », « 4 800 000 F ») sans rapport avec le portefeuille.

const STATUTS_RESTANTS = ["DRAFT", "PENDING", "REJECTED"] as const;

function periodeDe(annee: number, mois: number): string {
    return `${annee}-${String(mois + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const paysFiltre = searchParams.get("pays")?.trim().toUpperCase() || null;

        const maintenant = new Date();
        const annee = Number(searchParams.get("annee")) || maintenant.getUTCFullYear();
        const mois =
            searchParams.get("mois") !== null
                ? Number(searchParams.get("mois"))
                : maintenant.getUTCMonth();

        const periode = periodeDe(annee, mois);

        // Déclarations de la période, groupées par type et par statut.
        const declarations = await prisma.taxDeclaration.findMany({
            where: {
                period: periode,
                ...(paysFiltre ? { client: { country: paysFiltre } } : {}),
            },
            select: {
                type: true,
                status: true,
                amount: true,
                clientId: true,
                client: { select: { country: true } },
            },
        });

        const catalogue: ObligationFiscale[] = paysFiltre
            ? OBLIGATIONS_FISCALES.filter((o) => o.pays.includes(paysFiltre))
            : OBLIGATIONS_FISCALES;

        const obligations = catalogue.map((obligation) => {
            const concernees = declarations.filter(
                (d) =>
                    obligation.typesDeclaration.includes(d.type) &&
                    obligation.pays.includes(d.client.country)
            );

            const restantes = concernees.filter((d) =>
                (STATUTS_RESTANTS as readonly string[]).includes(d.status)
            );

            const echeance = echeancePour(obligation, annee, mois);

            return {
                id: obligation.id,
                titre: obligation.titre,
                description: obligation.description,
                categorie: obligation.categorie,
                pays: obligation.pays,
                reference: obligation.reference,
                periodicite: obligation.periodicite,
                echeance: echeance.toISOString(),
                urgence: urgenceDe(echeance, maintenant),

                // Agrégats calculés sur les déclarations réelles.
                nbDossiers: new Set(concernees.map((d) => d.clientId)).size,
                nbRestants: new Set(restantes.map((d) => d.clientId)).size,
                montantADeclarer: restantes.reduce((s, d) => s + (d.amount ?? 0), 0),
                montantTotal: concernees.reduce((s, d) => s + (d.amount ?? 0), 0),
                statut:
                    concernees.length === 0
                        ? "AUCUNE_DECLARATION"
                        : restantes.length === 0
                          ? "VALIDE"
                          : "EN_COURS",
            };
        });

        const clientsActifs = await prisma.client.count({
            where: { isActive: true, ...(paysFiltre ? { country: paysFiltre } : {}) },
        });

        return NextResponse.json({
            periode,
            annee,
            mois,
            pays: paysFiltre,
            obligations,
            synthese: {
                clientsActifs,
                declarationsPeriode: declarations.length,
                montantADeclarer: obligations.reduce((s, o) => s + o.montantADeclarer, 0),
                obligationsImminentes: obligations.filter((o) => o.urgence === "IMMINENTE").length,
                obligationsDepassees: obligations.filter((o) => o.urgence === "DEPASSEE").length,
                dossiersRestants: obligations.reduce((s, o) => s + o.nbRestants, 0),
            },
            // Signalé à l'interface : sans déclaration saisie pour la période,
            // les compteurs sont nuls parce que la base est vide, pas parce que
            // le cabinet est à jour.
            aucuneDonnee: declarations.length === 0,
        });
    } catch (error) {
        console.error("Erreur API obligations fiscales:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
