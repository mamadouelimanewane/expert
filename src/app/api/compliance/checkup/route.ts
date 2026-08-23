import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import {
    LIBELLE_CONFORMITE,
    obligationsLegalesPourPays,
    type EtatConformite,
} from "@/lib/ohada/obligations-legales";

// Revue de conformité légale d'un client.
//
// L'application ne se prononce que sur ce qu'elle sait réellement. Trois
// obligations sont adossées à des champs suivis sur la fiche client
// (dépôt des comptes, assemblée générale, mandat du commissaire aux comptes),
// une quatrième à la présence d'un identifiant RCCM. Pour toutes les autres,
// l'état reste « non évalué » : un constat de non-conformité engage le cabinet
// et ne peut pas être une valeur par défaut.

/** Traduit un champ de suivi de la fiche client en état de conformité. */
function depuisStatut(valeur: string | null | undefined): EtatConformite {
    switch ((valeur ?? "").trim().toLowerCase()) {
        case "valid":
        case "valide":
            return "CONFORME";
        case "expiring":
        case "expire_bientot":
            return "ALERTE";
        case "late":
        case "invalid":
        case "invalide":
            return "RISQUE";
        default:
            return "NON_EVALUE";
    }
}

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");

        const client = clientId
            ? await prisma.client.findUnique({
                  where: { id: clientId },
                  select: {
                      id: true,
                      companyName: true,
                      firstName: true,
                      lastName: true,
                      country: true,
                      type: true,
                      rccm: true,
                      ninea: true,
                      ifu: true,
                      nif: true,
                      agStatus: true,
                      mandatStatus: true,
                      depotComptesStatus: true,
                      kycStatus: true,
                  },
              })
            : null;

        if (clientId && !client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        const pays = client?.country ?? "";
        const catalogue = obligationsLegalesPourPays(pays);

        // Seules ces obligations sont adossées à une donnée réellement suivie.
        const etats: Record<string, EtatConformite> = client
            ? {
                  "depot-comptes": depuisStatut(client.depotComptesStatus),
                  "assemblee-generale": depuisStatut(client.agStatus),
                  "commissaire-comptes": depuisStatut(client.mandatStatus),
                  rccm: client.rccm ? "CONFORME" : "NON_EVALUE",
              }
            : {};

        const obligations = catalogue.map((o) => {
            const etat = etats[o.id] ?? "NON_EVALUE";
            return {
                id: o.id,
                source: o.source,
                titre: o.titre,
                article: o.article,
                description: o.description,
                pieceProbante: o.pieceProbante,
                etat,
                etatLibelle: LIBELLE_CONFORMITE[etat],
                // Rend explicite l'origine de l'état, pour qu'un « conforme »
                // ne soit jamais pris pour une vérification qui n'a pas eu lieu.
                evalue: etat !== "NON_EVALUE",
            };
        });

        const compte = (e: EtatConformite) => obligations.filter((o) => o.etat === e).length;

        return NextResponse.json({
            client: client
                ? {
                      id: client.id,
                      nom:
                          client.companyName ||
                          [client.firstName, client.lastName].filter(Boolean).join(" ") ||
                          "Client sans nom",
                      pays: client.country,
                      type: client.type,
                      identifiants: {
                          rccm: client.rccm,
                          ninea: client.ninea,
                          ifu: client.ifu,
                          nif: client.nif,
                      },
                      kycStatus: client.kycStatus,
                  }
                : null,
            obligations,
            synthese: {
                total: obligations.length,
                conformes: compte("CONFORME"),
                alertes: compte("ALERTE"),
                risques: compte("RISQUE"),
                nonEvaluees: compte("NON_EVALUE"),
            },
        });
    } catch (error) {
        console.error("Erreur API compliance/checkup:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
