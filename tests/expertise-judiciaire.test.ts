import { describe, it, expect } from "vitest";
import {
    calculerPrejudiceFinancier,
    calculerEtatFraisExpertise,
    genererRapportExpertiseJudiciaire,
    type DossierExpertiseJudiciaire,
} from "@/lib/ohada/expertise-judiciaire";

describe("Module d'Expertise Comptable & Financière auprès des Tribunaux (OHADA)", () => {
    it("calcule avec exactitude le préjudice financier (damnum emergens, lucrum cessans, intérêts moratoires)", () => {
        const prejudice = calculerPrejudiceFinancier({
            chiffreAffairesHistoriqueMoyenFCFA: 100_000_000,
            chiffreAffairesReelConstatéFCFA: 60_000_000, // Perte de 40M de CA
            tauxMargeSurCoutVariablePourcentage: 30,     // Gain manqué = 40M * 30% = 12M
            dureePeriodePrejudiceMois: 12,
            fraisDirectsSubisFCFA: 3_000_000,           // Perte subie = 3M
            tauxInteretLegalPourcentage: 6,             // 6% par an
            dureeMoratoireAnnees: 2,                    // (12M + 3M) * 6% * 2 = 1.8M
        });

        expect(prejudice.gainManqueFCFA).toBe(12_000_000);
        expect(prejudice.perteSubieFCFA).toBe(3_000_000);
        expect(prejudice.interetsMoratoiresFCFA).toBe(1_800_000);
        expect(prejudice.prejudiceTotalFCFA).toBe(16_800_000);
    });

    it("calcule l'état de frais et la liquidation de taxe de l'expert judiciaire", () => {
        const dossierMock: Partial<DossierExpertiseJudiciaire> = {
            heuresPassees: 40,
            tauxHoraireExpertFCFA: 75_000, // 40 * 75k = 3 000 000 FCFA
            deboursEngagesFCFA: 450_000,
            consignationInitialeFCFA: 1_500_000,
        };

        const frais = calculerEtatFraisExpertise(dossierMock as DossierExpertiseJudiciaire);

        expect(frais.honorairesFCFA).toBe(3_000_000);
        expect(frais.deboursFCFA).toBe(450_000);
        expect(frais.totalTTCFCFA).toBe(3_450_000);
        expect(frais.consignationDejaPercueFCFA).toBe(1_500_000);
        expect(frais.soldeDemandeDeTaxeFCFA).toBe(1_950_000);
    });

    it("génère le rapport formel d'expertise judiciaire avec réponse contradictoire aux dires", () => {
        const dossier: DossierExpertiseJudiciaire = {
            id: "EXP-2024-001",
            tribunal: "Tribunal de Commerce Hors Classe de Dakar",
            chambre: "2ème Chambre Commerciale",
            numeroRG: "RG 142/2024",
            numeroOrdonnance: "ORD-89/2024",
            dateOrdonnance: "15 janvier 2024",
            magistratOrdonnateur: "M. le Juge Mamadou Diaw",
            expertNom: "Ousmane Kane",
            expertTitre: "Expert-comptable diplômé, Expert Judiciaire près la Cour d'Appel de Dakar",
            typeMission: "EVALUATION_PREJUDICE",
            libelleLitige: "Rupture brutale de relations commerciales établies et inexécution contractuelle",
            parties: [
                { qualite: "DEMANDEUR", nomOuDenomination: "Société Sénégalaise de Distribution (SSD SARL)", conseilAvocat: "Babacar Diop", adresse: "Dakar Plateau" },
                { qualite: "DEFENDEUR", nomOuDenomination: "Consortium Logistique Maritime (CLM SA)", conseilAvocat: "Aïssatou Ba", adresse: "Dakar Port" },
            ],
            consignationInitialeFCFA: 2_000_000,
            phaseActuelle: "DEPOT_RAPPORT_DEFINITIF",
            dires: [
                {
                    id: "DIRE-1",
                    dateReception: "10 octobre 2024",
                    auteur: "Maître Aïssatou Ba (Conseil du Défendeur)",
                    resumeArguments: "Contestation du taux de marge sur coût variable appliqué par l'expert",
                    reponseExpert: "L'expert confirme son chiffrage adossé aux déclarations fiscales certifiées 2021-2023.",
                    impactChiffrageFCFA: 0,
                },
            ],
            heuresPassees: 50,
            tauxHoraireExpertFCFA: 80_000,
            deboursEngagesFCFA: 500_000,
            prejudiceCalcule: {
                gainManqueFCFA: 24_000_000,
                perteSubieFCFA: 6_000_000,
                interetsMoratoiresFCFA: 3_600_000,
                prejudiceTotalFCFA: 33_600_000,
            },
            dateDepotPrevue: "15 novembre 2024",
        };

        const rapport = genererRapportExpertiseJudiciaire(dossier);

        expect(rapport.titre).toContain("Tribunal de Commerce Hors Classe de Dakar");
        expect(rapport.montantPrejudiceRetenuFCFA).toBe(33_600_000);
        expect(rapport.respectContradictoire).toBe(true);
        expect(rapport.diresTraites).toBe(1);
        expect(rapport.texteIntegral).toContain("RAPPORT D'EXPERTISE JUDICIAIRE FINANCIERE ET COMPTABLE");
        expect(rapport.texteIntegral).toContain("Ousmane Kane");
        expect(rapport.texteIntegral).toContain("RG 142/2024");
        expect(rapport.texteIntegral).toContain("Maître Aïssatou Ba");
        expect(rapport.texteIntegral).toContain("damnum emergens");
    });
});
