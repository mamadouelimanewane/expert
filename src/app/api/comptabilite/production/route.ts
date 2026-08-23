import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { COMPTE_ATTENTE } from "@/lib/accounting-engine";
import { parsePagination, reponsePaginee } from "@/lib/pagination";

// File de production comptable : écritures en attente de révision.
//
// La page affichait quatre flux fictifs avec un « Matching IA (98 %) » inventé.
// Le statut réel se déduit de l'imputation : une écriture passée au compte
// d'attente 471 n'a pas pu être qualifiée par le moteur et doit être reprise
// par un collaborateur ; les autres ont été imputées par une règle.

type StatutRevision = "A_QUALIFIER" | "A_VALIDER" | "VALIDEE";

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");
        const filtre = searchParams.get("statut");
        const pagination = parsePagination(searchParams);

        const base = {
            source: { not: "WHATSAPP_TEST" },
            ...(clientId ? { clientId } : {}),
            ...(periode ? { periode } : {}),
        };

        const [ecritures, total, enAttente, qualifier, exportees] = await Promise.all([
            prisma.tpeJournal.findMany({
                where: {
                    ...base,
                    ...(filtre === "A_QUALIFIER"
                        ? { OR: [{ debitCompte: { startsWith: COMPTE_ATTENTE } }, { creditCompte: { startsWith: COMPTE_ATTENTE } }] }
                        : filtre === "A_VALIDER"
                          ? { status: "PENDING" }
                          : filtre === "VALIDEE"
                            ? { status: "EXPORTED" }
                            : {}),
                },
                orderBy: { createdAt: "desc" },
                skip: pagination.skip,
                take: pagination.take,
                select: {
                    id: true,
                    date: true,
                    periode: true,
                    libelle: true,
                    entree: true,
                    sortie: true,
                    montant: true,
                    debitCompte: true,
                    debitIntitule: true,
                    creditCompte: true,
                    creditIntitule: true,
                    status: true,
                    source: true,
                    confidenceScore: true,
                    businessName: true,
                    client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
                },
            }),
            prisma.tpeJournal.count({ where: base }),
            prisma.tpeJournal.count({ where: { ...base, status: "PENDING" } }),
            prisma.tpeJournal.count({
                where: {
                    ...base,
                    OR: [
                        { debitCompte: { startsWith: COMPTE_ATTENTE } },
                        { creditCompte: { startsWith: COMPTE_ATTENTE } },
                    ],
                },
            }),
            prisma.tpeJournal.count({ where: { ...base, status: "EXPORTED" } }),
        ]);

        const flux = ecritures.map((e) => {
            const enCompteAttente =
                e.debitCompte?.startsWith(COMPTE_ATTENTE) ||
                e.creditCompte?.startsWith(COMPTE_ATTENTE);

            const statut: StatutRevision = enCompteAttente
                ? "A_QUALIFIER"
                : e.status === "EXPORTED"
                  ? "VALIDEE"
                  : "A_VALIDER";

            return {
                id: e.id,
                date: e.date,
                periode: e.periode,
                libelle: e.libelle,
                montant: e.montant,
                sens: e.entree > 0 ? "RECETTE" : "DEPENSE",
                imputation: {
                    debit: e.debitCompte,
                    debitIntitule: e.debitIntitule,
                    credit: e.creditCompte,
                    creditIntitule: e.creditIntitule,
                },
                statut,
                // La confiance n'est affichée que si le moteur en a réellement
                // produit une ; on n'invente pas de pourcentage.
                confiance: e.confidenceScore > 0 ? e.confidenceScore : null,
                origine: e.source,
                client: e.client
                    ? {
                          id: e.client.id,
                          nom:
                              e.client.companyName ||
                              [e.client.firstName, e.client.lastName].filter(Boolean).join(" ") ||
                              e.businessName,
                      }
                    : { id: null, nom: e.businessName },
            };
        });

        return NextResponse.json({
            flux,
            pagination: reponsePaginee(flux, total, pagination),
            synthese: {
                total,
                aQualifier: qualifier,
                aValider: enAttente,
                validees: exportees,
            },
            aucuneDonnee: total === 0,
        });
    } catch (error) {
        console.error("Erreur API production comptable:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
