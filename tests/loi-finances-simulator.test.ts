import { describe, it, expect } from "vitest";
import {
    simulerImpactLoiFinances,
    type ParamsSimulation,
    type DonneeClientSimulation,
} from "@/lib/ohada/loi-finances-simulator";

describe("Simulateur d'Impact de Loi de Finances (OHADA)", () => {
    it("calcule correctement une baisse de taux d'IS de 30% à 25% sur des entreprises bénéficiaires", () => {
        const params: ParamsSimulation = {
            pays: "sn",
            typeChangement: "IS_TAUX",
            valeurActuelle: 0.3,
            valeurProposee: 0.25,
            exercice: 2026,
        };

        const clients: DonneeClientSimulation[] = [
            {
                clientId: "client1",
                nom: "Société Alpha",
                resultatFiscal: 50_000_000,
                chiffreAffaires: 200_000_000,
            },
            {
                clientId: "client2",
                nom: "Société Bêta",
                resultatFiscal: 20_000_000,
                chiffreAffaires: 80_000_000,
            },
        ];

        const res = simulerImpactLoiFinances(params, clients);

        expect(res.clientsConcernes).toBe(2);
        // Alpha : Actuel = 15M (IMF = 1M), Simulé = 12.5M -> Delta = -2.5M
        expect(res.impacts[0].chargeActuelle).toBe(15_000_000);
        expect(res.impacts[0].chargeSimulee).toBe(12_500_000);
        expect(res.impacts[0].delta).toBe(-2_500_000);
        expect(res.impacts[0].deltaPct).toBe(-16.7);

        // Bêta : Actuel = 6M (IMF = 400k), Simulé = 5M -> Delta = -1M
        expect(res.impacts[1].chargeActuelle).toBe(6_000_000);
        expect(res.impacts[1].chargeSimulee).toBe(5_000_000);
        expect(res.impacts[1].delta).toBe(-1_000_000);

        expect(res.totalDelta).toBe(-3_500_000);
    });

    it("maintient l'IMF lorsque le bénéfice est trop faible ou déficitaire (aucun impact d'une baisse de taux IS)", () => {
        const params: ParamsSimulation = {
            pays: "ci",
            typeChangement: "IS_TAUX",
            valeurActuelle: 0.25,
            valeurProposee: 0.2,
            exercice: 2026,
        };

        // En CI, plancher IMF = 3 000 000 F
        const clients: DonneeClientSimulation[] = [
            {
                clientId: "clientDeficit",
                nom: "Entreprise en difficulté",
                resultatFiscal: -5_000_000,
                chiffreAffaires: 50_000_000,
                caTtc: 59_000_000,
            },
        ];

        const res = simulerImpactLoiFinances(params, clients);

        expect(res.impacts[0].chargeActuelle).toBe(3_000_000);
        expect(res.impacts[0].chargeSimulee).toBe(3_000_000);
        expect(res.impacts[0].delta).toBe(0);
        expect(res.impacts[0].detail.minimumAppliqueSimule).toBe(true);
    });

    it("applique correctement une mesure d'incitation fiscale par crédit d'impôt", () => {
        const params: ParamsSimulation = {
            pays: "sn",
            typeChangement: "CREDIT_IMPOT",
            valeurActuelle: 0,
            valeurProposee: 1_000_000, // Crédit d'impôt de 1 000 000 FCFA
            exercice: 2026,
        };

        const clients: DonneeClientSimulation[] = [
            {
                clientId: "clientInvestisseur",
                nom: "Tech Solar SARL",
                resultatFiscal: 20_000_000, // IS normal = 6 000 000
                chiffreAffaires: 50_000_000,
            },
        ];

        const res = simulerImpactLoiFinances(params, clients);

        expect(res.impacts[0].chargeActuelle).toBe(6_000_000);
        expect(res.impacts[0].chargeSimulee).toBe(5_000_000);
        expect(res.impacts[0].delta).toBe(-1_000_000);
    });

    it("simule la hausse d'un taux de TVA sur le volume de TVA collectée", () => {
        const params: ParamsSimulation = {
            pays: "sn",
            typeChangement: "TVA_TAUX",
            valeurActuelle: 0.18,
            valeurProposee: 0.2,
            exercice: 2026,
        };

        const clients: DonneeClientSimulation[] = [
            {
                clientId: "clientCommerce",
                nom: "Grande Distribution",
                resultatFiscal: 10_000_000,
                chiffreAffaires: 100_000_000,
                tvaCollectee: 18_000_000,
            },
        ];

        const res = simulerImpactLoiFinances(params, clients);

        expect(res.impacts[0].chargeActuelle).toBe(18_000_000);
        expect(res.impacts[0].chargeSimulee).toBe(20_000_000);
        expect(res.impacts[0].delta).toBe(2_000_000);
    });
});
