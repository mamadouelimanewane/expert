import { describe, it, expect } from "vitest";
import {
    calculerAffectationResultat,
    genererLiasseAGOA,
    type DonneesSocieteAG,
    type DonneesFinancieresAG,
    type ConventionReglementee,
} from "@/lib/ohada/secretariat-juridique";

describe("Secrétariat Juridique & Assemblées Générales (AUSCGIE OHADA)", () => {
    const societe: DonneesSocieteAG = {
        raisonSociale: "Sénégal Digital Services SAS",
        formeJuridique: "SAS",
        capitalSocial: 10_000_000,
        valeurNominaleTitre: 10_000,
        nombreTitres: 1_000,
        rccm: "SN-DKR-2022-B-14520",
        identifiantFiscal: "00894521 2V2",
        siegeSocial: "Point E, Avenue Cheikh Anta Diop",
        ville: "Dakar",
        pays: "sn",
        dirigeantNom: "Cheikh Tidiane SECK",
        dirigeantQualite: "Président",
    };

    it("calcule la dotation à la réserve légale (10% plafonné à 20% du capital social selon AUSCGIE art. 346)", () => {
        // Capital = 10M -> Plafond 20% = 2 000 000 FCFA
        // Réserve existante = 1 500 000 FCFA -> Reste pour atteindre le plafond = 500 000 FCFA
        // Bénéfice = 8 000 000 FCFA -> 10% = 800 000 FCFA, mais plafonné à 500 000 FCFA !
        const financier: DonneesFinancieresAG = {
            exercice: 2026,
            dateAssemblee: "2026-06-15",
            resultatNetExercice: 8_000_000,
            reportANouveauExistant: 0,
            reserveLegaleExistante: 1_500_000,
            dividendeProposeParTitre: 4_000, // 4 000 000 bruts au total
        };

        const res = calculerAffectationResultat(societe, financier);

        expect(res.plafondReserveLegale20Pct).toBe(2_000_000);
        expect(res.dotationReserveLegaleRequise).toBe(500_000);
        expect(res.nouvelleReserveLegale).toBe(2_000_000);

        // Bénéfice distribuable = 8M - 500k = 7 500 000 F
        expect(res.beneficeDistribuable).toBe(7_500_000);

        // Dividendes : 4M brut -> IRVM Sénégal 10% = 400 000 F -> Net total = 3 600 000 F (3600 F/action)
        expect(res.dividendeTotalBrut).toBe(4_000_000);
        expect(res.retenueIRVMTotal).toBe(400_000);
        expect(res.dividendeNetTotal).toBe(3_600_000);
        expect(res.dividendeNetParTitre).toBe(3_600);

        // Solde Report à Nouveau = 7.5M - 4M = 3 500 000 F
        expect(res.soldeReportANouveauFinal).toBe(3_500_000);
    });

    it("apure en priorité les pertes antérieures avant toute distribution de dividende", () => {
        const financierAvecPertes: DonneesFinancieresAG = {
            exercice: 2026,
            dateAssemblee: "2026-06-20",
            resultatNetExercice: 5_000_000,
            reportANouveauExistant: -3_000_000, // Pertes antérieures
            reserveLegaleExistante: 0,
        };

        const res = calculerAffectationResultat(societe, financierAvecPertes);

        // Réserve légale = 10% de 5M = 500 000 F
        expect(res.dotationReserveLegaleRequise).toBe(500_000);

        // Reste après réserve = 4.5M -> Apurement complet des 3M de pertes
        expect(res.pertesAnterieuresApurees).toBe(3_000_000);

        // Base distribuable restante = 1 500 000 F
        expect(res.beneficeDistribuable).toBe(1_500_000);
    });

    it("génère les 4 résolutions types d'AGOA et le rapport spécial sur les conventions", () => {
        const financier: DonneesFinancieresAG = {
            exercice: 2026,
            dateAssemblee: "2026-06-15",
            resultatNetExercice: 6_000_000,
            reportANouveauExistant: 0,
            reserveLegaleExistante: 0,
        };

        const conventions: ConventionReglementee[] = [
            {
                id: "c1",
                personneConcernee: "Cheikh Tidiane SECK",
                qualite: "Président et Associé (40%)",
                natureConvention: "Bail commercial portant sur les locaux du siège",
                montantOuEngagement: 12_000_000,
                interetPourSociete: "Loyer aligné sur les prix de marché du quartier Point E",
            },
        ];

        const liasse = genererLiasseAGOA(societe, financier, conventions);

        expect(liasse.resolutions.length).toBe(4);
        expect(liasse.resolutions[0].titre).toContain("Approbation des comptes");
        expect(liasse.resolutions[1].titre).toContain("Affectation du résultat");
        expect(liasse.resolutions[2].titre).toContain("conventions réglementées");
        expect(liasse.resolutions[3].titre).toContain("formalités de dépôt");

        expect(liasse.rapportSpecialConventions).toBeDefined();
        expect(liasse.rapportSpecialConventions).toContain("Bail commercial");
        expect(liasse.pvCompletAssemblee).toContain("SÉNÉGAL DIGITAL SERVICES SAS");
        expect(liasse.formalitesDepotGreffe.delaiMois).toBe(1);
    });
});
