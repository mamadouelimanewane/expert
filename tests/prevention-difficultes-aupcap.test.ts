import { describe, it, expect } from "vitest";
import {
  calculerZScoreOHADA,
  simulerConcordatApurement,
  type DonneesFinancieresEntreprise,
  type ParametresConcordat,
} from "@/lib/ohada/prevention-difficultes-aupcap";

describe("AUPCAP : Prévention des Difficultés & Z-Score OHADA", () => {
  const entrepriseSaine: DonneesFinancieresEntreprise = {
    chiffreAffaires: 500_000_000,
    valeurAjoutee: 180_000_000,
    ebe: 90_000_000,
    resultatExploitation: 60_000_000,
    resultatNet: 40_000_000,
    totalActif: 400_000_000,
    actifCirculant: 150_000_000,
    tresorerieActif: 50_000_000,
    capitauxPropres: 220_000_000,
    dettesFinancieresLMT: 60_000_000,
    dettesFournisseurs: 70_000_000,
    dettesFiscalesSociales: 10_000_000,
    decouvertsBancaires: 0,
  };

  const entrepriseEnDifficulte: DonneesFinancieresEntreprise = {
    chiffreAffaires: 200_000_000,
    valeurAjoutee: 30_000_000,
    ebe: 5_000_000,
    resultatExploitation: -15_000_000,
    resultatNet: -25_000_000,
    totalActif: 180_000_000,
    actifCirculant: 40_000_000,
    tresorerieActif: 2_000_000, // actif dispo quasi nul
    capitauxPropres: 10_000_000,
    dettesFinancieresLMT: 80_000_000,
    dettesFournisseurs: 60_000_000,
    dettesFiscalesSociales: 35_000_000, // passif exigible immédiat
    decouvertsBancaires: 15_000_000,
  };

  it("identifie une entreprise financièrement saine avec un score élevé", () => {
    const res = calculerZScoreOHADA(entrepriseSaine);
    expect(res.scoreZ).toBeGreaterThan(2.0);
    expect(res.estEnCessationPaiements).toBe(false);
    expect(res.diagnostic).toBe("SAIN");
    expect(res.ratios.capaciteRemboursement).toBeGreaterThan(0.5);
  });

  it("détecte l'état de cessation des paiements et préconise le redressement judiciaire", () => {
    const res = calculerZScoreOHADA(entrepriseEnDifficulte);
    // actif disponible (2M) < passif exigible (35M fisc + 15M decouvert + 30M frs = 80M)
    expect(res.estEnCessationPaiements).toBe(true);
    expect(res.scoreZ).toBeLessThan(1.8);
    expect(res.procedureConseillee).toBe("REDRESSEMENT_JUDICIAIRE");
    expect(res.syntheseDiagnostic).toContain("cessation des paiements caractérisé");
  });

  it("simule un plan de concordat d'apurement viable avec apport en capital", () => {
    const params: ParametresConcordat = {
      dureeAnnees: 3,
      tauxAbandonNegocie: 20, // 20% d'abandon
      apportFondsPropres: 25_000_000,
      economiesStructureAnnuelles: 20_000_000,
    };

    const concordat = simulerConcordatApurement(entrepriseEnDifficulte, params);
    // Dettes totales = 80M + 60M + 35M + 15M = 190M
    expect(concordat.passifTotalTraite).toBe(190_000_000);
    // Abandon 20% = 38M
    expect(concordat.montantAbandonCreances).toBe(38_000_000);
    // Passif résiduel = 152M
    expect(concordat.passifResiduelARembourser).toBe(152_000_000);
    expect(concordat.dureeAnnees).toBe(3);
    expect(concordat.echeancierAnnuel).toHaveLength(3);
    expect(concordat.projetOffreConcordat).toContain("AUPCAP");
  });

  it("alerte sur la non-viabilité du plan si les cash-flows sont insuffisants", () => {
    const paramsInsuffisants: ParametresConcordat = {
      dureeAnnees: 1, // 1 an pour éponger tout le passif !
      tauxAbandonNegocie: 0,
      apportFondsPropres: 0,
      economiesStructureAnnuelles: 0,
    };

    const concordat = simulerConcordatApurement(entrepriseEnDifficulte, paramsInsuffisants);
    expect(concordat.viabilitePlan).toBe(false);
    expect(concordat.recommandationsJudiciaires.some(r => r.includes("ALERTE"))).toBe(true);
  });
});
