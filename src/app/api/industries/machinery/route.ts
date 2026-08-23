import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import {
    genererPlanAmortissement,
    valeurNetteComptable,
    type MethodeAmortissement,
} from "@/lib/amortissement";

// Parc immobilisé et plan d'amortissement.
//
// L'écran affichait un parc de machines inventé, avec un « état de santé » en
// pourcentage, un taux d'utilisation et des dates de maintenance. Ces données
// relèvent de la GMAO de l'industriel, pas du cabinet comptable : elles ne sont
// dans aucun système ici et n'y seront pas.
//
// Ce que le cabinet suit réellement, et ce que cette route renvoie : la valeur
// d'origine, le plan d'amortissement, la dotation de l'exercice et la valeur
// nette comptable — c'est-à-dire le travail comptable sur les immobilisations.

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const categorie = searchParams.get("categorie");

        const immobilisations = await prisma.fixedAsset.findMany({
            where: {
                ...(clientId ? { clientId } : {}),
                ...(categorie ? { category: categorie } : {}),
                status: { not: "DISPOSED" },
            },
            orderBy: { purchaseDate: "desc" },
            take: 200,
            include: {
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
            },
        });

        const maintenant = new Date();

        const parc = immobilisations.map((a) => {
            const immo = {
                valeurOrigine: a.value,
                dureeAnnees: a.usefulLifeYears,
                methode: a.depreciationMethod as MethodeAmortissement,
                valeurResiduelle: a.residualValue,
                dateMiseEnService: a.serviceDate ?? a.purchaseDate,
            };

            const { vnc, cumul, dotationExercice, anomalies } = valeurNetteComptable(immo, maintenant);
            const plan = genererPlanAmortissement(immo);

            return {
                id: a.id,
                code: a.code,
                label: a.label,
                category: a.category,
                location: a.location,
                serialNumber: a.serialNumber,
                supplier: a.supplier,
                status: a.status,
                purchaseDate: a.purchaseDate.toISOString(),
                serviceDate: (a.serviceDate ?? a.purchaseDate).toISOString(),
                lastAuditDate: a.lastAuditDate?.toISOString() ?? null,

                valeurOrigine: a.value,
                methode: a.depreciationMethod,
                dureeAnnees: a.usefulLifeYears,
                valeurResiduelle: a.residualValue,
                cumulAmortissements: cumul,
                dotationExercice,
                valeurNetteComptable: vnc,
                /** `false` quand la durée d'utilité manque : la VNC n'est alors pas établie. */
                planEtabli: plan.lignes.length > 0,
                anomalies,

                client: a.client
                    ? {
                          id: a.client.id,
                          nom:
                              a.client.companyName ||
                              [a.client.firstName, a.client.lastName].filter(Boolean).join(" ") ||
                              "Client sans nom",
                      }
                    : null,
            };
        });

        const sansPlan = parc.filter((p) => !p.planEtabli);

        return NextResponse.json({
            parc,
            synthese: {
                nombre: parc.length,
                valeurOrigineTotale: parc.reduce((s, p) => s + p.valeurOrigine, 0),
                cumulAmortissements: parc.reduce((s, p) => s + p.cumulAmortissements, 0),
                dotationExercice: parc.reduce((s, p) => s + p.dotationExercice, 0),
                valeurNetteComptable: parc.reduce((s, p) => s + p.valeurNetteComptable, 0),
                sansPlanAmortissement: sansPlan.length,
                aVerifier: parc.filter((p) => p.status === "TO_VERIFY").length,
                manquantes: parc.filter((p) => p.status === "MISSING").length,
            },
            aucuneDonnee: parc.length === 0,
        });
    } catch (error) {
        console.error("Erreur API machinery:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
