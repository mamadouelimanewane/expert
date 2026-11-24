import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    calculerInventaireStocks,
    type ArticleStockInventaire,
    type CategorieStock,
} from "@/lib/ohada/stocks-inventaire";
import { AuditService } from "@/lib/audit";

/**
 * API Inventaire Intermittent & Variations de Stocks (SYSCOHADA)
 * GET  /api/comptabilite/stocks?clientId=&exercice=
 * POST /api/comptabilite/stocks (Calcul & génération des écritures d'inventaire)
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = Number(searchParams.get("exercice")) || new Date().getFullYear();

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    // Récupérer les produits existants du client
    const products = await prisma.product.findMany({
        where: { clientId },
        take: 50,
        include: { costs: true },
    });

    return NextResponse.json({
        clientId,
        exercice,
        message: "Aucun comptage physique ni CUMP ne sont enregistrés dans le catalogue produit. Saisissez les quantités réellement inventoriées, les CUMP et les soldes initiaux avant de calculer les écritures.",
        produits: products.map(({ id, reference, name }) => ({ id, reference, designation: name })),
    });
}

export async function POST(request: NextRequest) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Données d'inventaire invalides." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const { clientId, exercice, stockInitialParCategorie, articles, ventesExercice, achatsExercice } = input;

    if (typeof clientId !== "string" || !isObjectId(clientId) || !Array.isArray(articles) || articles.length === 0 || articles.length > 5000) {
        return NextResponse.json({ error: "Données d'inventaire invalides." }, { status: 400 });
    }

    const categories = ["MARCHANDISES", "MATIERES_PREMIERES", "PRODUITS_FINIS", "EN_COURS"] as const;
    const montants = [ventesExercice, achatsExercice];
    const soldes = stockInitialParCategorie as Partial<Record<CategorieStock, unknown>> | null;
    if (!Number.isInteger(exercice) || Number(exercice) < 2000 || Number(exercice) > 2100
        || !montants.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0)
        || !soldes || !categories.every((category) => typeof soldes[category] === "number" && Number.isFinite(soldes[category]) && Number(soldes[category]) >= 0)) {
        return NextResponse.json({ error: "L'exercice, les soldes initiaux, les ventes et les achats doivent être renseignés avec des valeurs réelles et valides." }, { status: 400 });
    }
    const articlesValides = articles.every((article) => {
        if (!article || typeof article !== "object") return false;
        const item = article as Record<string, unknown>;
        return typeof item.id === "string" && item.id.trim() !== ""
            && typeof item.reference === "string" && item.reference.trim() !== ""
            && typeof item.designation === "string" && item.designation.trim() !== ""
            && categories.includes(item.categorie as (typeof categories)[number])
            && typeof item.quantitePhysique === "number" && Number.isFinite(item.quantitePhysique) && item.quantitePhysique >= 0
            && typeof item.prixUnitaireAchatCUMP === "number" && Number.isFinite(item.prixUnitaireAchatCUMP) && item.prixUnitaireAchatCUMP >= 0
            && (item.valeurRealisableNette === undefined || (typeof item.valeurRealisableNette === "number" && Number.isFinite(item.valeurRealisableNette) && item.valeurRealisableNette >= 0));
    });
    if (!articlesValides) return NextResponse.json({ error: "Chaque article doit avoir une référence, une désignation, une catégorie, une quantité physique et un CUMP valides." }, { status: 400 });

    const resultat = calculerInventaireStocks({
        exercice: Number(exercice),
        stockInitialParCategorie: soldes as Record<CategorieStock, number>,
        articles: articles as ArticleStockInventaire[],
        ventesExercice: ventesExercice as number,
        achatsExercice: achatsExercice as number,
    });

    await AuditService.log({
        action: "INVENTAIRE_STOCKS_CLOTURE",
        entity: "Client",
        entityId: clientId,
        details: JSON.stringify({
            exercice,
            totalStockFinalNet: resultat.totalStockFinalNet,
            variationGlobaleStock: resultat.variationGlobaleStock,
            nbEcrituresGenerees: resultat.ecrituresCloture.length,
        }),
    });

    return NextResponse.json({ succes: true, resultat });
}
