import { describe, it, expect } from "vitest";
import {
    executerAuditFiscalAvance,
    type DonneesAuditFiscal,
} from "@/lib/ohada/audit-fiscal-avance";

describe("Audit Fiscal Avancé & Matrice des Risques Fiscaux (UEMOA / OHADA)", () => {
    it("détecte la non-déductibilité intégrale des intérêts CCA si le capital n'est pas intégralement libéré", () => {
        const donnees: DonneesAuditFiscal = {
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: 100_000_000,
            beneficeAvantFraisSiege: 20_000_000,
            capitalSocialTotal: 10_000_000,
            capitalSocialLibere: 5_000_000, // Capital libéré à 50% seulement !
            comptesCourants: {
                soldeMoyenAnnuel: 20_000_000,
                tauxInteretApplique: 6.0,
                tauxBCEAOMax: 5.5,
            },
            fraisDeSiegeComptabilises: 0,
            vehiculesTourisme: [],
            donsComptabilises: 0,
        };

        const res = executerAuditFiscalAvance(donnees);

        // 20M à 6% = 1 200 000 F d'intérêts versés -> 100% rejetés
        expect(res.anomalies.length).toBe(1);
        expect(res.anomalies[0].code).toBe("CCA_CAPITAL_NON_LIBERE");
        expect(res.anomalies[0].montantReintegrationFiscale).toBe(1_200_000);
        expect(res.anomalies[0].rappelImpotEstime).toBe(360_000); // 30% IS
        expect(res.anomalies[0].penalitesEstimees).toBe(90_000);  // 25% pénalité
        expect(res.anomalies[0].gravite).toBe("CRITIQUE");
    });

    it("plafonne les frais de siège à 10% du bénéfice au Sénégal et calcule l'excédent à réintégrer", () => {
        const donnees: DonneesAuditFiscal = {
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: 200_000_000,
            beneficeAvantFraisSiege: 30_000_000, // Plafond 10% = 3 000 000 F
            capitalSocialTotal: 10_000_000,
            capitalSocialLibere: 10_000_000,
            comptesCourants: {
                soldeMoyenAnnuel: 0,
                tauxInteretApplique: 0,
                tauxBCEAOMax: 5.5,
            },
            fraisDeSiegeComptabilises: 7_000_000, // Excédent = 4 000 000 F
            vehiculesTourisme: [],
            donsComptabilises: 0,
        };

        const res = executerAuditFiscalAvance(donnees);

        const anomalieSiege = res.anomalies.find((a) => a.code === "FRAIS_SIEGE_PLAFOND_DEPASSE");
        expect(anomalieSiege).toBeDefined();
        expect(anomalieSiege?.montantReintegrationFiscale).toBe(4_000_000);
        expect(anomalieSiege?.rappelImpotEstime).toBe(1_200_000); // 30% IS
    });

    it("réintègre la quote-part d'amortissement excédentaire sur véhicule de tourisme (plafond 15M)", () => {
        const donnees: DonneesAuditFiscal = {
            pays: "sn",
            exercice: 2026,
            chiffreAffairesHT: 80_000_000,
            beneficeAvantFraisSiege: 15_000_000,
            capitalSocialTotal: 5_000_000,
            capitalSocialLibere: 5_000_000,
            comptesCourants: { soldeMoyenAnnuel: 0, tauxInteretApplique: 0, tauxBCEAOMax: 5.5 },
            fraisDeSiegeComptabilises: 0,
            vehiculesTourisme: [
                {
                    immatriculation: "DK-9841-AH",
                    prixAcquisitionTTC: 25_000_000, // Plafond 15M -> Excédent base = 10M
                    tauxAmortissementAnnuel: 20,     // 20% de 10M = 2 000 000 F/an
                    dotationComptabilisee: 5_000_000,
                },
            ],
            donsComptabilises: 0,
        };

        const res = executerAuditFiscalAvance(donnees);

        const anomalieVehicule = res.anomalies.find((a) => a.domaine === "VEHICULES_TOURISME");
        expect(anomalieVehicule).toBeDefined();
        expect(anomalieVehicule?.montantReintegrationFiscale).toBe(2_000_000);
        expect(anomalieVehicule?.rappelImpotEstime).toBe(600_000);
    });
});
