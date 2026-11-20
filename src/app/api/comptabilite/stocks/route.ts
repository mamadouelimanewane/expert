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
    });

    let articles: ArticleStockInventaire[] = [];

    if (products.length > 0) {
        articles = products.map((p) => ({
            id: p.id,
            reference: p.sku || `REF-${p.id.slice(0, 6)}`,
            designation: p.name,
            categorie: "MARCHANDISES",
            quantitePhysique: 100, // Quantité par défaut
            prixUnitaireAchatCUMP: p.unitCost || 10_000,
        }));
    } else {
        // Catalogue type d'une PME de distribution ou négoce
        articles = [
            { id: "art-1", reference: "ALIM-001", designation: "Huile de palme raffinée bidon 20L", categorie: "MARCHANDISES", quantitePhysique: 120, prixUnitaireAchatCUMP: 16_500 },
            { id: "art-2", reference: "ALIM-002", designation: "Sucre cristallisé sac 50kg", categorie: "MARCHANDISES", quantitePhysique: 80, prixUnitaireAchatCUMP: 24_000 },
            { id: "art-3", reference: "ALIM-003", designation: "Lait concentré carton 48 boîtes", categorie: "MARCHANDISES", quantitePhysique: 65, prixUnitaireAchatCUMP: 19_500, valeurRealisableNette: 15_000 },
            { id: "art-4", reference: "EMB-001", designation: "Sacs polypropylène tissés 50kg", categorie: "MATIERES_PREMIERES", quantitePhysique: 1500, prixUnitaireAchatCUMP: 350 },
        ];
    }

    const stockInitialParCategorie: Record<CategorieStock, number> = {
        MARCHANDISES: 3_500_000,
        MATIERES_PREMIERES: 500_000,
        PRODUITS_FINIS: 0,
        EN_COURS: 0,
    };

    const resultat = calculerInventaireStocks({
        exercice,
        stockInitialParCategorie,
        articles,
        ventesExercice: 45_000_000,
        achatsExercice: 32_000_000,
    });

    return NextResponse.json(resultat);
}

export async function POST(request: NextRequest) {
    const { denied } = await requireWriteAccess();
    if (denied) return denied;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, exercice, stockInitialParCategorie, articles, ventesExercice, achatsExercice } = body;

    if (!clientId || !isObjectId(clientId) || !articles || !Array.isArray(articles)) {
        return NextResponse.json({ error: "Données d'inventaire invalides." }, { status: 400 });
    }

    const resultat = calculerInventaireStocks({
        exercice: Number(exercice) || new Date().getFullYear(),
        stockInitialParCategorie: stockInitialParCategorie || { MARCHANDISES: 0, MATIERES_PREMIERES: 0, PRODUITS_FINIS: 0, EN_COURS: 0 },
        articles,
        ventesExercice: Number(ventesExercice) || 0,
        achatsExercice: Number(achatsExercice) || 0,
    });

    await AuditService.log({
        action: "INVENTAIRE_STOCKS_CLOTURE",
        entityType: "Client",
        entityId: clientId,
        details: {
            exercice,
            totalStockFinalNet: resultat.totalStockFinalNet,
            variationGlobaleStock: resultat.variationGlobaleStock,
            nbEcrituresGenerees: resultat.ecrituresCloture.length,
        },
    });

    return NextResponse.json({ succes: true, resultat });
}
