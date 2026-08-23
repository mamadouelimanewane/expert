import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { analyserProduit, synthetiser, type CategorieCout } from "@/lib/couts-production";
import { valeurNetteComptable, type MethodeAmortissement } from "@/lib/amortissement";

// Portefeuille de clients industriels.
//
// L'écran affichait cinq clients inventés avec leur chiffre d'affaires, leur
// marge, leur valeur de stock, leurs en-cours et une rotation de stock — aucune
// de ces valeurs n'existait dans le système.
//
// Le portefeuille est désormais construit sur les clients ayant réellement des
// produits ou des immobilisations enregistrés, avec ce qui est calculable pour
// chacun : marge issue de la comptabilité analytique et valeur nette comptable
// du parc immobilisé. Ce qui n'est pas suivi (stocks, en-cours, rotation) n'est
// pas affiché plutôt qu'estimé.

export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const clients = await prisma.client.findMany({
            where: {
                isActive: true,
                OR: [{ products: { some: {} } }, { fixedAssets: { some: {} } }],
            },
            orderBy: { companyName: "asc" },
            take: 100,
            select: {
                id: true,
                companyName: true,
                firstName: true,
                lastName: true,
                sector: true,
                country: true,
                products: {
                    where: { isActive: true },
                    include: {
                        costs: true,
                        volumes: { orderBy: { periode: "desc" }, take: 1 },
                    },
                },
                fixedAssets: {
                    where: { status: { not: "DISPOSED" } },
                },
            },
        });

        const maintenant = new Date();

        const portefeuille = clients.map((c) => {
            const analyses = c.products.map((p) =>
                analyserProduit({
                    reference: p.reference,
                    name: p.name,
                    family: p.family,
                    unit: p.unit,
                    sellingPrice: p.sellingPrice,
                    costs: p.costs.map((x) => ({
                        category: x.category as CategorieCout,
                        label: x.label,
                        unitCost: x.unitCost,
                    })),
                    quantite: p.volumes.length > 0 ? p.volumes[0].quantity : undefined,
                })
            );

            const synthese = synthetiser(analyses);

            const immobilisations = c.fixedAssets.map((a) =>
                valeurNetteComptable(
                    {
                        valeurOrigine: a.value,
                        dureeAnnees: a.usefulLifeYears,
                        methode: a.depreciationMethod as MethodeAmortissement,
                        valeurResiduelle: a.residualValue,
                        dateMiseEnService: a.serviceDate ?? a.purchaseDate,
                    },
                    maintenant
                )
            );

            const alertes: string[] = [];
            if (synthese.nbIndetermines > 0) {
                alertes.push(
                    `${synthese.nbIndetermines} produit(s) sans coût de revient établi.`
                );
            }
            if (synthese.nbAPerte > 0) {
                alertes.push(`${synthese.nbAPerte} produit(s) vendu(s) à perte.`);
            }
            const sansPlan = c.fixedAssets.filter((a) => !a.usefulLifeYears).length;
            if (sansPlan > 0) {
                alertes.push(`${sansPlan} immobilisation(s) sans plan d'amortissement.`);
            }

            return {
                id: c.id,
                nom:
                    c.companyName ||
                    [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                    "Client sans nom",
                secteur: c.sector,
                pays: c.country,

                nbProduits: analyses.length,
                chiffreAffaires: synthese.chiffreAffaires,
                margeTotale: synthese.margeTotale,
                tauxMarge: synthese.tauxMargeGlobal,

                nbImmobilisations: c.fixedAssets.length,
                valeurNetteComptable: immobilisations.reduce((s, x) => s + x.vnc, 0),
                dotationExercice: immobilisations.reduce((s, x) => s + x.dotationExercice, 0),

                alertes,
            };
        });

        return NextResponse.json({
            portefeuille,
            synthese: {
                nbClients: portefeuille.length,
                chiffreAffaires: portefeuille.reduce((s, c) => s + c.chiffreAffaires, 0),
                margeTotale: portefeuille.reduce((s, c) => s + c.margeTotale, 0),
                valeurNetteComptable: portefeuille.reduce((s, c) => s + c.valeurNetteComptable, 0),
                totalAlertes: portefeuille.reduce((s, c) => s + c.alertes.length, 0),
            },
            aucuneDonnee: portefeuille.length === 0,
        });
    } catch (error) {
        console.error("Erreur API portefeuille industriel:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
