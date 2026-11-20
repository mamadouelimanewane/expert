import { describe, it, expect } from "vitest";
import {
    verifierEligibiliteSMT,
    genererEtatsSMT,
    type FluxTresorerieSMT,
} from "@/lib/ohada/smt-engine";

describe("Système Minimal de Trésorerie SMT (SYSCOHADA révisé)", () => {
    it("détermine avec exactitude l'éligibilité légale selon le secteur et le chiffre d'affaires", () => {
        // Commerce de détail : seuil 60M
        const diagCommerceOk = verifierEligibiliteSMT(45_000_000, "COMMERCE_NEGOCE");
        expect(diagCommerceOk.estEligibleSMT).toBe(true);
        expect(diagCommerceOk.pourcentageSeuil).toBe(75);

        const diagCommerceKo = verifierEligibiliteSMT(65_000_000, "COMMERCE_NEGOCE");
        expect(diagCommerceKo.estEligibleSMT).toBe(false);
        expect(diagCommerceKo.recommandation).toContain("doit obligatoirement basculer");

        // Services : seuil 30M
        const diagServices = verifierEligibiliteSMT(28_000_000, "SERVICES");
        expect(diagServices.estEligibleSMT).toBe(true);
        expect(diagServices.seuilLegal).toBe(30_000_000);
    });

    it("génère un compte de résultat SMT et équilibre le bilan SMT par construction", () => {
        const flux: FluxTresorerieSMT[] = [
            {
                id: "f1",
                date: "2026-03-01",
                libelle: "Vente au comptant",
                categorie: "RECETTE_VENTES",
                montant: 20_000_000,
                modeReglement: "ESPECES",
            },
            {
                id: "f2",
                date: "2026-03-05",
                libelle: "Achat de marchandises chez grossiste",
                categorie: "ACHAT_MARCHANDISES",
                montant: 12_000_000,
                modeReglement: "BANQUE",
            },
            {
                id: "f3",
                date: "2026-03-10",
                libelle: "Paiement loyer boutique",
                categorie: "CHARGES_LOYER",
                montant: 1_200_000,
                modeReglement: "MOBILE_MONEY",
            },
            {
                id: "f4",
                date: "2026-03-25",
                libelle: "Salaire vendeur",
                categorie: "CHARGES_SALAIRES",
                montant: 800_000,
                modeReglement: "ESPECES",
            },
            {
                id: "f5",
                date: "2026-06-01",
                libelle: "Achat congélateur professionnel",
                categorie: "INVESTISSEMENT",
                montant: 1_500_000,
                modeReglement: "BANQUE",
            },
        ];

        const etats = genererEtatsSMT({
            exercice: 2026,
            categorie: "COMMERCE_NEGOCE",
            flux,
            inventaire: {
                stocksFinaux: 3_000_000,
                creancesClientsFin: 500_000,
                dettesFournisseursFin: 800_000,
                tresorerieInitiale: 2_000_000,
            },
        });

        // Vérification compte de résultat SMT
        expect(etats.compteResultat.totalRecettesExploitation).toBe(20_000_000);
        expect(etats.compteResultat.totalDepensesExploitation).toBe(14_000_000);
        expect(etats.compteResultat.excedentTresorerieExploitation).toBe(6_000_000);
        expect(etats.compteResultat.soldeInvestissement).toBe(-1_500_000);
        expect(etats.compteResultat.variationNetteTresorerie).toBe(4_500_000);

        // Trésorerie finale : 2M (initial) + 4.5M = 6.5M
        expect(etats.tresorerieFinExercice).toBe(6_500_000);

        // Bilan SMT : Total Actif = Total Passif
        expect(etats.bilan.actif.totalActif).toBe(etats.bilan.passif.totalPassif);
        expect(etats.bilan.equilibre).toBe(true);
        expect(etats.bilan.ecart).toBe(0);
    });
});
