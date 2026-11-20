import { describe, it, expect } from "vitest";
import {
    calculerTableauBordPME,
    type ParametresTableauBordPME,
} from "@/lib/ohada/tableau-bord-pme";

describe("Tableau de Bord Dirigeant & Pilotage Flash PME", () => {
    it("calcule correctement le seuil de rentabilité (point mort en FCFA et en jours de CA)", () => {
        const params: ParametresTableauBordPME = {
            chiffreAffairesHT: 100_000_000,
            achatsEtChargesVariables: 60_000_000, // Marge sur coût variable = 40M (40%)
            chargesFixesExploitation: 24_000_000, // Charges fixes annuelles
            stocksActuels: 10_000_000,
            creancesClients: 15_000_000,
            dettesFournisseurs: 12_000_000,
            dettesFiscalesSociales: 3_000_000,
            disponibilitesBancaires: 8_000_000,
            encaissePhysiqueCaisse: 1_500_000,
            concoursBancairesCourants: 0,
        };

        const res = calculerTableauBordPME(params, 2026);

        // Seuil de rentabilité = 24M / 0.40 = 60 000 000 FCFA
        expect(res.pointMort.margeSurCoutVariable).toBe(40_000_000);
        expect(res.pointMort.tauxMargeSurCoutVariable).toBe(40);
        expect(res.pointMort.seuilRentabiliteFCFA).toBe(60_000_000);

        // Point mort en jours = (60M / 100M) * 365 = 219 jours (vers août)
        expect(res.pointMort.pointMortJours).toBe(219);
        expect(res.pointMort.estBeneficiaire).toBe(true);
        expect(res.pointMort.resultatExploitationPrevisionnel).toBe(16_000_000);
    });

    it("mesure le BFR et identifie une trésorerie saine avec excellente autonomie", () => {
        const params: ParametresTableauBordPME = {
            chiffreAffairesHT: 120_000_000,
            achatsEtChargesVariables: 70_000_000,
            chargesFixesExploitation: 30_000_000,
            stocksActuels: 8_000_000,
            creancesClients: 12_000_000, // Actifs circulants = 20M
            dettesFournisseurs: 14_000_000,
            dettesFiscalesSociales: 2_000_000, // Passifs circulants = 16M
            disponibilitesBancaires: 15_000_000,
            encaissePhysiqueCaisse: 2_000_000,
            concoursBancairesCourants: 0,
        };

        const res = calculerTableauBordPME(params, 2026);

        // BFR = 20M - 16M = 4M
        expect(res.bfr.bfrMontant).toBe(4_000_000);
        expect(res.bfr.bfrJoursCA).toBe(12); // (4M / 120M) * 360 = 12 jours

        // Trésorerie nette = 17M
        expect(res.tresorerie.tresorerieNette).toBe(17_000_000);
        expect(res.tresorerie.alerteLiquidite).toBe("EXCELLENTE");
        expect(res.scoreSantePME).toBeGreaterThanOrEqual(80);
    });
});
