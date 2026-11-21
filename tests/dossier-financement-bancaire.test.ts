import { describe, it, expect } from "vitest";
import {
  calculerMensualiteCredit,
  genererTableauAmortissement,
  evaluerDossierFinancementBancaire,
  type InputDossierFinancement,
} from "../src/lib/ohada/dossier-financement-bancaire";

const DOSSIER_TEST_SAIN: InputDossierFinancement = {
  societeRaisonSociale: "SOCIÉTÉ AGRO-INDUSTRIELLE DU SÉNÉGAL SA",
  formeJuridique: "SA",
  rccm: "SN.DKR.2020.B.4412",
  nineaOuIfu: "005432102V",
  secteurActivite: "Agro-Industrie & Conditionnement",
  anneeCreation: 2020,
  banqueSollicitee: "COMPAGNIE BANCAIRE DE L'AFRIQUE OCCIDENTALE (CBAO)",
  typeFinancement: "CREDIT_INVESTISSEMENT_CMT",
  montantDemande_XOF: 100_000_000,
  dureeMois: 36, // 3 ans
  tauxInteretAnnuel_pct: 8.5,
  differeAmortissementMois: 0,
  apportFondsPropres_XOF: 30_000_000, // 23% d'autofinancement
  objetFinancementDetaille: "Acquisition d'une chaîne automatisée de calibrage et d'emballage de fruits",
  donneesFinancieres: {
    chiffreAffairesN_XOF: 850_000_000,
    chiffreAffairesN1_XOF: 720_000_000,
    ebeN_XOF: 160_000_000, // EBE solide
    resultatNetN_XOF: 75_000_000,
    capitauxPropresN_XOF: 280_000_000,
    dettesFinancieresActuelles_XOF: 50_000_000,
    tresorerieActuelle_XOF: 45_000_000,
    impotISN_XOF: 25_000_000,
  },
  garanties: [
    {
      typeGarantie: "NANTISSEMENT_MATERIEL_FINANCE",
      intitule: "Gage avec inscription RCCM sur la chaîne industrielle neuve",
      valeurEstimee_XOF: 130_000_000,
      tauxCouvertureEstime_pct: 100,
    },
    {
      typeGarantie: "GARANTIE_FONGIP_FAGACE_ARIZ",
      intitule: "Garantie partielle de portefeuille FONGIP PME (50% en risque partagé)",
      valeurEstimee_XOF: 50_000_000,
      tauxCouvertureEstime_pct: 50,
    },
  ],
};

describe("Moteur Dossier de Financement Bancaire PME (OHADA / BCEAO)", () => {
  it("calcule avec rigueur la mensualité constante et le coût total du crédit", () => {
    // 100M à 8.5% sur 36 mois
    const { mensualite, coutTotalInterets } = calculerMensualiteCredit(100_000_000, 8.5, 36);
    expect(mensualite).toBeGreaterThan(3_100_000);
    expect(mensualite).toBeLessThan(3_200_000);
    expect(coutTotalInterets).toBeGreaterThan(12_000_000);
    expect(coutTotalInterets).toBeLessThan(15_000_000);
  });

  it("génère un tableau d'amortissement équilibré avec capital restant dû nul à terme", () => {
    const echeances = genererTableauAmortissement(60_000_000, 9.0, 12, 0);
    expect(echeances).toHaveLength(12);
    expect(echeances[0].capitalRestantDuDebut_XOF).toBe(60_000_000);
    expect(echeances[11].capitalRestantDuFin_XOF).toBe(0);
  });

  it("délivre un avis très favorable avec DSCR > 1.30 pour une entreprise rentable", () => {
    const rapport = evaluerDossierFinancementBancaire(DOSSIER_TEST_SAIN);
    expect(rapport.ratios.ratioDSCR).toBeGreaterThanOrEqual(1.3);
    expect(rapport.ratios.ratioDetteNetteSurEBE).toBeLessThan(2.5);
    expect(rapport.ratios.tauxCouvertureGaranties_pct).toBeGreaterThan(100);
    expect(rapport.ratios.avisComiteCredit).toBe("AVIS_TRES_FAVORABLE");
    expect(rapport.ratios.pointsFortsDossier.length).toBeGreaterThanOrEqual(3);
  });

  it("alerte sur la capacité de remboursement (DSCR faible) si le montant est excessif", () => {
    const dossierSurendette: InputDossierFinancement = {
      ...DOSSIER_TEST_SAIN,
      montantDemande_XOF: 500_000_000, // 500M au lieu de 100M -> dépassement capacité
      donneesFinancieres: {
        ...DOSSIER_TEST_SAIN.donneesFinancieres,
        ebeN_XOF: 40_000_000, // EBE insuffisant
        impotISN_XOF: 10_000_000,
      },
    };

    const rapport = evaluerDossierFinancementBancaire(dossierSurendette);
    expect(rapport.ratios.ratioDSCR).toBeLessThan(1.15);
    expect(rapport.ratios.avisComiteCredit).toBe("AVIS_RESERVE_RESTRUCTURATION_REQUISE");
    expect(rapport.ratios.pointsVigilance.length).toBeGreaterThan(0);
  });

  it("génère le mémorandum de crédit institutionnel avec la checklist des 12 pièces éliminatoires", () => {
    const rapport = evaluerDossierFinancementBancaire(DOSSIER_TEST_SAIN);
    expect(rapport.checklistPieces).toHaveLength(12);
    expect(rapport.checklistPieces.some((p) => p.designation.includes("ONECCA"))).toBe(true);
    expect(rapport.memorandumCreditBanque).toContain("MÉMORANDUM D'INFORMATION DE CRÉDIT");
    expect(rapport.memorandumCreditBanque).toContain("SOCIÉTÉ AGRO-INDUSTRIELLE DU SÉNÉGAL SA");
    expect(rapport.memorandumCreditBanque).toContain("CBAO");
    expect(rapport.memorandumCreditBanque).toContain("DSCR");
  });
});
