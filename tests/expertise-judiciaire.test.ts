import { describe, it, expect } from "vitest";
import {
    calculerPrejudiceFinancier,
    calculerEtatFraisExpertise,
    evaluerCessationPaiements,
    auditerContradictoire,
    genererReponseDireAvecIA,
    qualifierInfractionsPenales,
    genererRapportExpertiseJudiciaire,
    type DossierExpertiseJudiciaire,
} from "@/lib/ohada/expertise-judiciaire";

describe("Module d'Expertise Comptable & Financière auprès des Tribunaux (OHADA & IA)", () => {
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

    it("détermine la date de cessation des paiements et l'insuffisance d'actif selon l'AUPCAP", () => {
        const analyseAUPCAP = evaluerCessationPaiements({
            actifDisponibleFCFA: 15_000_000,
            passifExigibleFCFA: 60_000_000,
            dateApparitionDeficit: "2024-03-31",
            moratoiresObtenusFCFA: 10_000_000, // Passif net = 50M -> Insuffisance 35M
        });

        expect(analyseAUPCAP.estEnCessation).toBe(true);
        expect(analyseAUPCAP.insuffisanceActifFCFA).toBe(35_000_000);
        expect(analyseAUPCAP.dateCessationPreconisee).toBe("2024-03-31");
        expect(analyseAUPCAP.statutProcedure).toContain("CESSATION");
        expect(analyseAUPCAP.periodeSuspecteMaxMois).toBe(18);
    });

    it("qualifie les infractions financières pénales (Abus de biens sociaux art. 891 AUSCGIE)", () => {
        const analysePenale = qualifierInfractionsPenales([
            {
                descriptionFait: "Prélèvement personnel du gérant sur compte courant débiteur",
                comptesImpliques: ["4551"],
                montantConcerneFCFA: 45_000_000,
                beneficiaireIdentifie: "Gérant principal",
                absenceJustificatif: true,
            },
            {
                descriptionFait: "Écritures de nivellement fictives sans pièces justificatives",
                comptesImpliques: ["471"],
                montantConcerneFCFA: 12_000_000,
                beneficiaireIdentifie: "Tiers non identifié",
                absenceJustificatif: true,
            },
        ]);

        expect(analysePenale.qualificationLegale).toContain("Abus de Biens Sociaux");
        expect(analysePenale.articlesApplicables).toContain("AUSCGIE art. 891 (Usage des biens ou du crédit à des fins personnelles)");
        expect(analysePenale.gravite).toBe("TRES_GRAVE");
        expect(analysePenale.montantTotalLitigieuxFCFA).toBe(57_000_000);
        expect(analysePenale.noteOrientationParquet).toContain("Ministère Public");
    });

    it("génère une réfutation formelle assistée par IA au Dire d'un avocat", async () => {
        const reponse = await genererReponseDireAvecIA(
            "EVALUATION_PREJUDICE",
            "La méthode de marge sur coûts variables choisie par l'expert surévalue le préjudice en omettant les économies de salaires.",
            "L'expert a isolé les coûts strictement variables et certifié que la masse salariale était incompressible (CDI)."
        );

        expect(reponse.reponseProposee.length).toBeGreaterThan(50);
        expect(reponse.pointsJuridiques.length).toBeGreaterThanOrEqual(2);
        expect(reponse.source).toMatch(/IA_NEXUS|MOTEUR_DETERMINISTE/);
    });

    it("audite la sécurité juridique et la résistance procédurale du rapport (anti-nullité)", () => {
        const dossierValide: DossierExpertiseJudiciaire = {
            id: "EXP-OK",
            tribunal: "Tribunal de Commerce",
            chambre: "Chambre 1",
            numeroRG: "RG 1",
            numeroOrdonnance: "ORD 1",
            dateOrdonnance: "2024-01-01",
            magistratOrdonnateur: "Juge",
            expertNom: "Expert",
            expertTitre: "Expert Judiciaire",
            typeMission: "EVALUATION_PREJUDICE",
            libelleLitige: "Litige commercial",
            parties: [
                { qualite: "DEMANDEUR", nomOuDenomination: "Partie A", conseilAvocat: "Me A", adresse: "Dakar" },
                { qualite: "DEFENDEUR", nomOuDenomination: "Partie B", conseilAvocat: "Me B", adresse: "Dakar" },
            ],
            consignationInitialeFCFA: 1_000_000,
            phaseActuelle: "DEPOT_RAPPORT_DEFINITIF",
            dires: [
                {
                    id: "D1",
                    dateReception: "2024-02-01",
                    auteur: "Me B",
                    resumeArguments: "Contestation",
                    reponseExpert: "Réponse motivée fournie.",
                    impactChiffrageFCFA: 0,
                },
            ],
            heuresPassees: 20,
            tauxHoraireExpertFCFA: 50_000,
            deboursEngagesFCFA: 100_000,
            dateDepotPrevue: "2024-03-01",
        };

        const audit = auditerContradictoire(dossierValide);
        expect(audit.scoreSecuriteJuridique).toBe(100);
        expect(audit.risquesDeNullite.length).toBe(0);
        expect(audit.delaiDiresSuffisant).toBe(true);
    });

    it("calcule l'état de frais et génère le rapport formel complet", () => {
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

        const frais = calculerEtatFraisExpertise(dossier);
        expect(frais.honorairesFCFA).toBe(4_000_000);
        expect(frais.soldeDemandeDeTaxeFCFA).toBe(2_500_000); // 4M + 500k - 2M

        const rapport = genererRapportExpertiseJudiciaire(dossier);
        expect(rapport.montantPrejudiceRetenuFCFA).toBe(33_600_000);
        expect(rapport.respectContradictoire).toBe(true);
        expect(rapport.texteIntegral).toContain("RAPPORT D'EXPERTISE JUDICIAIRE FINANCIERE ET COMPTABLE");
    });
});
