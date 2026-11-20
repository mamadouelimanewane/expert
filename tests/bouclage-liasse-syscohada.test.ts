import { describe, it, expect } from "vitest";
import {
  verifierBouclageLiasse,
  type BilanOHADA,
  type CompteResultatOHADA,
  type TftOHADA,
} from "@/lib/ohada/bouclage-liasse-syscohada";

describe("Bouclage Liasse Fiscale SYSCOHADA & Contrôle de Clôture", () => {
  const bilanSain: BilanOHADA = {
    actifImmobilise: 120_000_000,
    actifCirculant: 80_000_000,
    tresorerieActif: 30_000_000,
    totalActif: 230_000_000,

    capitauxPropresHorsResultat: 100_000_000,
    resultatNetExercice: 25_000_000,
    dettesFinancieresLMT: 50_000_000,
    dettesCirculantes: 50_000_000,
    tresoreriePassif: 5_000_000,
    totalPassif: 230_000_000,
  };

  const crSain: CompteResultatOHADA = {
    chiffreAffaires: 300_000_000,
    achatsConsommes: 140_000_000,
    margeCommerciale: 160_000_000,
    valeurAjoutee: 110_000_000,
    ebe: 55_000_000,
    resultatExploitation: 42_000_000,
    resultatFinancier: -6_000_000,
    resultatActivitesOrdinaires: 36_000_000,
    resultatHorsActivitesOrdinaires: 0,
    impotSurResultatIS: 11_000_000,
    resultatNet: 25_000_000,
  };

  const tftSain: TftOHADA = {
    tresorerieDebut: 15_000_000,
    fluxExploitation: 35_000_000,
    fluxInvestissement: -20_000_000,
    fluxFinancement: -5_000_000,
    variationTresorerie: 10_000_000,
    tresorerieFin: 25_000_000, // 30M actif - 5M passif = 25M
  };

  const isFiscal = 11_000_000;

  it("valide un bouclage parfait et recommande le visa de l'expert-comptable", () => {
    const rapport = verifierBouclageLiasse(bilanSain, crSain, tftSain, isFiscal);
    expect(rapport.estEquilibreBilan).toBe(true);
    expect(rapport.estCoherentResultat).toBe(true);
    expect(rapport.estCoherentTresorerie).toBe(true);
    expect(rapport.estCoherentImpotIS).toBe(true);
    expect(rapport.anomaliesBloquantes).toHaveLength(0);
    expect(rapport.scoreConformiteLiasse).toBe(100);
    expect(rapport.visaExpertComptableRecommande).toBe(true);
  });

  it("détecte un déséquilibre du bilan et bloque le visa", () => {
    const bilanDesequilibre: BilanOHADA = {
      ...bilanSain,
      totalActif: 235_000_000, // 5M d'écart
    };

    const rapport = verifierBouclageLiasse(bilanDesequilibre, crSain, tftSain, isFiscal);
    expect(rapport.estEquilibreBilan).toBe(false);
    expect(rapport.ecartBilan).toBe(5_000_000);
    expect(rapport.visaExpertComptableRecommande).toBe(false);
    expect(rapport.anomaliesBloquantes.some(a => a.includes("Déséquilibre du bilan"))).toBe(true);
  });

  it("détecte une discordance entre Résultat Net Bilan et Compte de Résultat", () => {
    const crDiscordant: CompteResultatOHADA = {
      ...crSain,
      resultatNet: 22_000_000, // 22M vs 25M au bilan
    };

    const rapport = verifierBouclageLiasse(bilanSain, crDiscordant, tftSain, isFiscal);
    expect(rapport.estCoherentResultat).toBe(false);
    expect(rapport.ecartResultatBilanCompteResultat).toBe(3_000_000);
    expect(rapport.anomaliesBloquantes.some(a => a.includes("Incohérence du résultat net"))).toBe(true);
  });

  it("détecte une discordance entre la trésorerie de clôture TFT et le Bilan", () => {
    const tftFaux: TftOHADA = {
      ...tftSain,
      tresorerieFin: 20_000_000, // 20M au lieu de 25M
    };

    const rapport = verifierBouclageLiasse(bilanSain, crSain, tftFaux, isFiscal);
    expect(rapport.estCoherentTresorerie).toBe(false);
    expect(rapport.ecartTresorerieBilanTFT).toBe(5_000_000);
    expect(rapport.pointsControle.find(p => p.id === "PC-04")?.statut).toBe("ANOMALIE");
  });
});
