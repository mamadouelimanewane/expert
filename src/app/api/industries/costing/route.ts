import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { analyserProduit, synthetiser, type CategorieCout } from "@/lib/couts-production";

// Comptabilité analytique : coût de revient et marge par produit.
//
// Les produits, leurs composantes de coût et leurs volumes sont désormais
// portés par le schéma (Product, CostComponent, ProductionVolume). L'écran
// affichait auparavant un catalogue inventé avec des marges inscrites en dur.

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");

        const produits = await prisma.product.findMany({
            where: {
                isActive: true,
                ...(clientId ? { clientId } : {}),
            },
            orderBy: { name: "asc" },
            take: 200,
            include: {
                costs: true,
                volumes: periode
                    ? { where: { periode } }
                    : { orderBy: { periode: "desc" }, take: 1 },
                client: { select: { id: true, companyName: true, firstName: true, lastName: true } },
            },
        });

        const analyses = produits.map((p) => {
            const quantite = p.volumes.length > 0 ? p.volumes[0].quantity : undefined;

            const analyse = analyserProduit({
                reference: p.reference,
                name: p.name,
                family: p.family,
                unit: p.unit,
                sellingPrice: p.sellingPrice,
                costs: p.costs.map((c) => ({
                    category: c.category as CategorieCout,
                    label: c.label,
                    unitCost: c.unitCost,
                })),
                quantite,
            });

            return {
                id: p.id,
                ...analyse,
                periode: p.volumes.length > 0 ? p.volumes[0].periode : null,
                client: p.client
                    ? {
                          id: p.client.id,
                          nom:
                              p.client.companyName ||
                              [p.client.firstName, p.client.lastName].filter(Boolean).join(" ") ||
                              "Client sans nom",
                      }
                    : null,
            };
        });

        return NextResponse.json({
            produits: analyses,
            synthese: synthetiser(analyses),
            // Sans produit enregistré, tous les compteurs sont nuls parce que
            // rien n'a été saisi — pas parce que l'activité serait nulle.
            aucuneDonnee: produits.length === 0,
        });
    } catch (error) {
        console.error("Erreur API costing:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
