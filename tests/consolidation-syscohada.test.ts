import { describe, it, expect } from "vitest";
import {
  consoliderComptesSYSCOHADA,
  type DossierConsolidation,
} from "@/lib/ohada/consolidation-syscohada";

describe("Consolidation des Comptes en SYSCOHADA Révisé (AUDCIF)", () => {
  const dossierGroupe: DossierConsolidation = {
    societeMere: {
      raisonSociale: "Holding Panafricaine SA (Dakar)",
      totalActif: 10_000_000_000,
      capitauxPropres: 6_000_000_000,
      dettes: 4_000_000_000,
      chiffreAffaires: 8_000_000_000,
      resultatNet: 800_000_000,
    },
    filiales: [
      {
        id: "FIL-1",
        raisonSociale: "Filiale Abidjan SA (Côte d'Ivoire)",
        pays: "Côte d'Ivoire",
        devise: "XOF",
        tauxConversionVersXOF: 1.0,
        pourcentageDetention: 80, // 80% -> Intégration Globale
        pourcentageControle: 80,
        methodeConsolidation: "INTEGRATION_GLOBALE",
        totalActifLocal: 4_000_000_000,
        capitauxPropresLocaux: 2_000_000_000,
        dettesLocales: 2_000_000_000,
        chiffreAffairesLocal: 3_500_000_000,
        resultatNetLocal: 400_000_000,
        valeurTitresDansMere: 1_800_000_000, // Coût d'achat titres = 1.8 Mds vs 80%*2Mds = 1.6 Mds -> Goodwill = 200M
      },
      {
        id: "FIL-2",
        raisonSociale: "JV Douala SARL (Cameroun)",
        pays: "Cameroun",
        devise: "XAF",
        tauxConversionVersXOF: 1.0,
        pourcentageDetention: 50, // 50/50 -> Intégration Proportionnelle
        pourcentageControle: 50,
        methodeConsolidation: "INTEGRATION_PROPORTIONNELLE",
        totalActifLocal: 2_000_000_000,
        capitauxPropresLocaux: 1_000_000_000,
        dettesLocales: 1_000_000_000,
        chiffreAffairesLocal: 1_200_000_000,
        resultatNetLocal: 150_000_000,
        valeurTitresDansMere: 500_000_000, // Goodwill = 500M - 50%*1Mds = 0
      },
    ],
    operationsReciproques: [
      {
        id: "OP-1",
        societeA: "Holding Panafricaine SA",
        societeB: "Filiale Abidjan SA",
        typeFlux: "CREANCE_DETTE",
        montant: 300_000_000, // 300M de compte courant intragroupe
      },
      {
        id: "OP-2",
        societeA: "Holding Panafricaine SA",
        societeB: "Filiale Abidjan SA",
        typeFlux: "ACHAT_VENTE",
        montant: 500_000_000, // 500M de ventes internes
      },
      {
        id: "OP-3",
        societeA: "Filiale Abidjan SA",
        societeB: "Holding Panafricaine SA",
        typeFlux: "DIVIDENDE_INTERNE",
        montant: 100_000_000, // 100M de dividendes internes
      },
    ],
  };

  it("calcule avec exactitude le goodwill et les écritures d'élimination", () => {
    const rapport = consoliderComptesSYSCOHADA(dossierGroupe);
    // Goodwill Filiale 1 = 1.8 Mds - 80% * 2.0 Mds = 200M
    expect(rapport.tableauGoodwillParFiliale[0].goodwill).toBe(200_000_000);
    expect(rapport.bilanConsolide.goodwillTotal).toBe(200_000_000);
    expect(rapport.ecrituresElimination).toHaveLength(3);
  });

  it("neutralise les flux réciproques dans le chiffre d'affaires consolidé", () => {
    const rapport = consoliderComptesSYSCOHADA(dossierGroupe);
    // CA Mère = 8 Mds + CA Abidjan 100% (3.5 Mds) + CA Douala 50% (600M) = 12.1 Mds
    // Moins Ventes internes (500M) = 11.6 Mds
    expect(rapport.compteResultatConsolide.chiffreAffairesConsolide).toBe(11_600_000_000);
  });

  it("répartit le résultat consolidé entre part du groupe et intérêts minoritaires", () => {
    const rapport = consoliderComptesSYSCOHADA(dossierGroupe);
    // Part minoritaires Abidjan = 20% * 400M = 80M
    expect(rapport.compteResultatConsolide.partDesMinoritaires).toBe(80_000_000);
    expect(rapport.compteResultatConsolide.partDuGroupe).toBeGreaterThan(800_000_000);
    expect(rapport.bilanConsolide.interetsMinoritairesCapitaux).toBe(400_000_000); // 20% de 2 Mds de capitaux propres
  });

  it("génère le rapport formel conforme à l'AUDCIF", () => {
    const rapport = consoliderComptesSYSCOHADA(dossierGroupe);
    expect(rapport.syntheseRapportAUDCIF).toContain("AUDCIF ART. 74 À 110");
    expect(rapport.syntheseRapportAUDCIF).toContain("Chiffre d'Affaires Consolidé");
  });
});
