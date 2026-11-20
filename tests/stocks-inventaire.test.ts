import { describe, it, expect } from "vitest";
import {
    calculerInventaireStocks,
    type ArticleStockInventaire,
    type CategorieStock,
} from "@/lib/ohada/stocks-inventaire";

describe("Inventaire Intermittent & Variations de Stocks (SYSCOHADA)", () => {
    it("génère les écritures conformes d'annulation SI et de constatation SF avec calcul de variation", () => {
        const stockInitial: Record<CategorieStock, number> = {
            MARCHANDISES: 5_000_000,
            MATIERES_PREMIERES: 2_000_000,
            PRODUITS_FINIS: 0,
            EN_COURS: 0,
        };

        const articles: ArticleStockInventaire[] = [
            {
                id: "art1",
                reference: "SAC-RIZ-50",
                designation: "Sacs de riz parfumé 50kg",
                categorie: "MARCHANDISES",
                quantitePhysique: 200,
                prixUnitaireAchatCUMP: 22_500, // 4 500 000 F
            },
            {
                id: "art2",
                reference: "HUILE-20L",
                designation: "Bidons d'huile végétale 20L",
                categorie: "MARCHANDISES",
                quantitePhysique: 150,
                prixUnitaireAchatCUMP: 18_000, // 2 700 000 F
            },
            {
                id: "art3",
                reference: "EMBALLAGE",
                designation: "Cartons d'emballage neutres",
                categorie: "MATIERES_PREMIERES",
                quantitePhysique: 500,
                prixUnitaireAchatCUMP: 3_000, // 1 500 000 F
            },
        ];

        const res = calculerInventaireStocks({
            exercice: 2026,
            stockInitialParCategorie: stockInitial,
            articles,
            ventesExercice: 50_000_000,
            achatsExercice: 35_000_000,
        });

        // SF Marchandises = 4.5M + 2.7M = 7.2M
        // SF Matières = 1.5M
        // Total SF Brut = 8.7M
        expect(res.totalStockInitial).toBe(7_000_000);
        expect(res.totalStockFinalBrut).toBe(8_700_000);
        expect(res.variationGlobaleStock).toBe(1_700_000); // Stockage net

        // Vérification des écritures d'inventaire
        // Annulation Marchandises : D 6031 / C 311 (5 000 000)
        const annulationMarch = res.ecrituresCloture.find((e) => e.compteDebit === "6031" && e.compteCredit === "311");
        expect(annulationMarch?.montant).toBe(5_000_000);

        // Constatation Marchandises : D 311 / C 6031 (7 200 000)
        const constatMarch = res.ecrituresCloture.find((e) => e.compteDebit === "311" && e.compteCredit === "6031");
        expect(constatMarch?.montant).toBe(7_200_000);

        // Incidence Marge Commerciale :
        // Achats = 35M, Var Stock = +2.2M (7.2M - 5M)
        // Coût d'achat marchandises vendues (CAMV) = 35M - 2.2M = 32.8M
        // Marge Commerciale = 50M - 32.8M = 17.2M
        expect(res.impactMargeBrute.coutAchatMarchandisesVendues).toBe(32_800_000);
        expect(res.impactMargeBrute.margeCommerciale).toBe(17_200_000);
    });

    it("constate la dépréciation des stocks si la valeur réalisable nette est inférieure au coût d'achat", () => {
        const stockInitial: Record<CategorieStock, number> = {
            MARCHANDISES: 0,
            MATIERES_PREMIERES: 0,
            PRODUITS_FINIS: 0,
            EN_COURS: 0,
        };

        const articles: ArticleStockInventaire[] = [
            {
                id: "art-obs",
                reference: "PHONE-OBSOLETE",
                designation: "Smartphones 3G invendus fin de série",
                categorie: "MARCHANDISES",
                quantitePhysique: 50,
                prixUnitaireAchatCUMP: 60_000,       // Coût = 3 000 000 F
                valeurRealisableNette: 35_000,       // Valeur marché actuelle = 1 750 000 F
            },
        ];

        const res = calculerInventaireStocks({
            exercice: 2026,
            stockInitialParCategorie: stockInitial,
            articles,
        });

        // Dépréciation attendue : (60 000 - 35 000) * 50 = 25 000 * 50 = 1 250 000 F
        expect(res.totalDepreciations).toBe(1_250_000);
        expect(res.totalStockFinalNet).toBe(1_750_000);

        // Écriture de dotation : D 6593 / C 391
        const ecritureDeprec = res.ecrituresCloture.find((e) => e.compteDebit === "6593" && e.compteCredit === "391");
        expect(ecritureDeprec?.montant).toBe(1_250_000);
    });
});
