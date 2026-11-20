import { describe, it, expect } from "vitest";
import {
  calculerAmortissementAnnuel,
  evaluerDossierCreditBceao,
  type DemandeCredit,
  type DonneesFinancieresBancaires,
} from "../src/lib/ohada/credit-notation-bceao";

const demandeStandard: DemandeCredit = {
  montant_XOF: 100_000_000,
  dureeMois: 60, // 5 ans
  differeMois: 0,
  tauxInteretAnnuel_pct: 8.0,
  objetFinancement: "EQUIPEMENT_MATERIEL",
  valeurGaranties_XOF: 130_000_000, // 130% de couverture
  typeGarantie: "NANTISSEMENT_MATERIEL",
};

const financierSolvable: DonneesFinancieresBancaires = {
  raisonSociale: "SOCIÉTÉ AGRO-TRANSFORMATION SA",
  secteur: "AGRO-INDUSTRIE",
  exercice: 2024,
  chiffreAffaires_XOF: 800_000_000,
  ebe_XOF: 120_000_000,
  rex_XOF: 85_000_000,
  resultatNet_XOF: 45_000_000,
  caf_XOF: 70_000_000,
  dettesFinancieresActuelles_XOF: 40_000_000,
  tresorerieNette_XOF: 25_000_000,
  capitauxPropres_XOF: 200_000_000,
  totalBilan_XOF: 500_000_000,
};

describe("Moteur de Notation Bancaire & Montage Crédit BCEAO / COBAC", () => {
  it("calcule les annuités constantes et amortissements avec exactitude", () => {
    const { annuiteMoyenne, tableau } = calculerAmortissementAnnuel(demandeStandard);
    expect(tableau.length).toBe(5);
    // Annuité constante pour 100M sur 5 ans à 8% ~ 25 045 645 XOF
    expect(annuiteMoyenne).toBeGreaterThan(24_000_000);
    expect(annuiteMoyenne).toBeLessThan(26_000_000);
    // Le solde de fin de la 5ème année doit être à 0
    expect(tableau[4].capitalFin_XOF).toBe(0);
  });

  it("attribue une note A ou A_PRIME et un avis favorable pour une entreprise saine", () => {
    const dossier = evaluerDossierCreditBceao(financierSolvable, demandeStandard);
    expect(dossier.scoreGlobal).toBeGreaterThanOrEqual(70);
    expect(["A_PRIME", "A"]).toContain(dossier.classeRisqueBceao);
    expect(dossier.avisComiteCredit).toBe("ACCORD_RECOMMANDE");
  });

  it("valide l'éligibilité au guichet refinancement bonifié PME de la BCEAO", () => {
    const dossier = evaluerDossierCreditBceao(financierSolvable, demandeStandard);
    expect(dossier.eligibiliteDispositifBceaoPme.eligible).toBe(true);
    expect(dossier.eligibiliteDispositifBceaoPme.criteresManquants.length).toBe(0);
    expect(dossier.eligibiliteDispositifBceaoPme.avantageTauxRefinancement).toContain("BCEAO");
  });

  it("dégrade la note et recommande le refus en cas de surendettement", () => {
    const financierSurendette: DonneesFinancieresBancaires = {
      ...financierSolvable,
      caf_XOF: 10_000_000, // Très faible CAF vs annuités
      ebe_XOF: 15_000_000,
      dettesFinancieresActuelles_XOF: 300_000_000, // Dettes énormes
      capitauxPropres_XOF: 20_000_000,
      totalBilan_XOF: 500_000_000,
    };
    const dossier = evaluerDossierCreditBceao(financierSurendette, demandeStandard);
    expect(dossier.scoreGlobal).toBeLessThan(50);
    expect(["C", "D_DEGRADE"]).toContain(dossier.classeRisqueBceao);
    expect(["ACCORD_SOUS_CONDITIONS", "REFUS_PROBABLE"]).toContain(dossier.avisComiteCredit);
  });
});
