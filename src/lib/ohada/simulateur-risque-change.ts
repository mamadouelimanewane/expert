/**
 * Simulateur Multi-Devises & Risque de Change FCFA (Kyriba FX Standard)
 * Conçu pour les entreprises importatrices/exportatrices de la zone UEMOA/CEMAC.
 *
 * Gère :
 * - Parité fixe EUR/XOF (655,957 FCFA) et exposition USD, CNY, GBP
 * - Calcul de l'exposition nette en devises (Créances - Dettes en devises)
 * - Simulation de chocs de devises (+5%, +10%, +15%, -10%)
 * - Impact comptable SYSCOHADA :
 *   * Pertes de change certaines (Compte 676)
 *   * Gains de change certains (Compte 776)
 *   * Écarts de conversion Actif (Compte 476) et Passif (Compte 477)
 *   * Dotation aux provisions pour pertes de change (Compte 697 / 194)
 */

export interface PositionDevise {
  devise: "USD" | "EUR" | "CNY" | "GBP";
  coursSpotActuel_XOF: number;
  creancesDevise: number; // en unités de devises (ex: 500 000 USD)
  dettesDevise: number;   // en unités de devises (ex: 800 000 USD)
  coursComptabilise_XOF: number; // cours historique d'enregistrement
}

export interface SimulationChoc {
  variationDevise_pct: number; // ex: +10 pour appréciation de 10%
  nouveauCours_XOF: number;
  perteGainNet_XOF: number;
  impactCompteResultat: "GAIN_CHANGE" | "PERTE_CHANGE" | "NEUTRE";
  provisionRequise_XOF: number;
}

export interface AnalysePositionDevise {
  devise: "USD" | "EUR" | "CNY" | "GBP";
  coursSpotActuel_XOF: number;
  expositionNetteDevise: number; // créances - dettes
  expositionNette_XOF: number;
  sensibiliteParPourcent_XOF: number; // impact d'une variation de 1%
  ecartConversionLatente_XOF: number; // spot actuel vs cours comptabilisé
  typeEcart: "ECART_CONVERSION_ACTIF_476" | "ECART_CONVERSION_PASSIF_477" | "EQUILIBRE";
  provisionPerteChange_XOF: number;
  simulations: SimulationChoc[];
}

export interface RapportRisqueChange {
  societeRaisonSociale: string;
  exercice: number;
  positions: AnalysePositionDevise[];
  expositionGlobaleNette_XOF: number;
  impactGlobalLatent_XOF: number;
  provisionsTotalesRequises_XOF: number;
  niveauRisqueChange: "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";
  recommandationsCouverture: string[];
  syntheseTresorerie: string;
}

export const COURS_PARITES_DEFAUT: Record<string, number> = {
  EUR: 655.957,
  USD: 605.5,
  CNY: 83.2,
  GBP: 765.0,
};

export function analyserPositionDevise(pos: PositionDevise): AnalysePositionDevise {
  const expositionNetteDevise = pos.creancesDevise - pos.dettesDevise;
  const expositionNette_XOF = Math.round(expositionNetteDevise * pos.coursSpotActuel_XOF);
  const sensibiliteParPourcent_XOF = Math.round(expositionNette_XOF * 0.01);

  // Écart de conversion latente (Compte 476 ou 477)
  // Créances : si spot < comptabilisé -> perte latente (476)
  // Dettes : si spot > comptabilisé -> perte latente (476)
  const impactCreances = pos.creancesDevise * (pos.coursSpotActuel_XOF - pos.coursComptabilise_XOF);
  const impactDettes = pos.dettesDevise * (pos.coursSpotActuel_XOF - pos.coursComptabilise_XOF);
  const ecartConversionLatente_XOF = Math.round(impactCreances - impactDettes);

  let typeEcart: AnalysePositionDevise["typeEcart"] = "EQUILIBRE";
  let provisionPerteChange_XOF = 0;

  if (ecartConversionLatente_XOF < 0) {
    typeEcart = "ECART_CONVERSION_ACTIF_476";
    // En SYSCOHADA, perte latente au compte 476 oblige une provision au compte 194 / 697
    provisionPerteChange_XOF = Math.abs(ecartConversionLatente_XOF);
  } else if (ecartConversionLatente_XOF > 0) {
    typeEcart = "ECART_CONVERSION_PASSIF_477";
  }

  // Simulations de chocs (-10%, -5%, +5%, +10%, +15%)
  const variations = [-10, -5, 5, 10, 15];
  const simulations: SimulationChoc[] = variations.map((varPct) => {
    const nouveauCours_XOF = Math.round(pos.coursSpotActuel_XOF * (1 + varPct / 100) * 100) / 100;
    const perteGainNet_XOF = Math.round(expositionNetteDevise * (nouveauCours_XOF - pos.coursComptabilise_XOF));
    const impactCompteResultat =
      perteGainNet_XOF > 0 ? "GAIN_CHANGE" : perteGainNet_XOF < 0 ? "PERTE_CHANGE" : "NEUTRE";
    const provisionRequise_XOF = perteGainNet_XOF < 0 ? Math.abs(perteGainNet_XOF) : 0;

    return {
      variationDevise_pct: varPct,
      nouveauCours_XOF,
      perteGainNet_XOF,
      impactCompteResultat,
      provisionRequise_XOF,
    };
  });

  return {
    devise: pos.devise,
    coursSpotActuel_XOF: pos.coursSpotActuel_XOF,
    expositionNetteDevise,
    expositionNette_XOF,
    sensibiliteParPourcent_XOF,
    ecartConversionLatente_XOF,
    typeEcart,
    provisionPerteChange_XOF,
    simulations,
  };
}

export function genererRapportRisqueChange(
  societeRaisonSociale: string,
  exercice: number,
  positions: PositionDevise[]
): RapportRisqueChange {
  const analyses = positions.map(analyserPositionDevise);

  let expositionGlobaleNette_XOF = 0;
  let impactGlobalLatent_XOF = 0;
  let provisionsTotalesRequises_XOF = 0;

  for (const a of analyses) {
    expositionGlobaleNette_XOF += a.expositionNette_XOF;
    impactGlobalLatent_XOF += a.ecartConversionLatente_XOF;
    provisionsTotalesRequises_XOF += a.provisionPerteChange_XOF;
  }

  const expAbsolue = Math.abs(expositionGlobaleNette_XOF);
  let niveauRisqueChange: RapportRisqueChange["niveauRisqueChange"];
  if (expAbsolue > 250_000_000) niveauRisqueChange = "CRITIQUE";
  else if (expAbsolue > 100_000_000) niveauRisqueChange = "ELEVE";
  else if (expAbsolue > 25_000_000) niveauRisqueChange = "MODERE";
  else niveauRisqueChange = "FAIBLE";

  const recommandationsCouverture: string[] = [];
  if (expAbsolue > 50_000_000) {
    recommandationsCouverture.push("Mettre en place des contrats de change à terme (Forward FX) auprès de la banque teneuse de compte.");
    recommandationsCouverture.push("Négocier des clauses d'indexation de prix ou de partage du risque de change dans les contrats commerciaux.");
  }
  if (provisionsTotalesRequises_XOF > 0) {
    recommandationsCouverture.push(`Constater une dotation aux provisions pour pertes de change de ${provisionsTotalesRequises_XOF.toLocaleString("fr-FR")} FCFA (Comptes 697 / 194).`);
  }
  if (positions.some((p) => p.devise === "USD" && Math.abs(p.creancesDevise - p.dettesDevise) > 100_000)) {
    recommandationsCouverture.push("Ouvrir un compte en devises USD sous autorisation préalable de la BCEAO (réglementation des changes UEMOA).");
  }
  if (recommandationsCouverture.length === 0) {
    recommandationsCouverture.push("Exposition nette maîtrisée. Maintenir une surveillance trimestrielle des cours spot.");
  }

  const syntheseTresorerie =
    `Pour la société ${societeRaisonSociale}, l'exposition globale nette en devises est de ${expositionGlobaleNette_XOF.toLocaleString("fr-FR")} FCFA ` +
    `(Risque ${niveauRisqueChange}). ` +
    (impactGlobalLatent_XOF < 0
      ? `Une perte latente nette de ${Math.abs(impactGlobalLatent_XOF).toLocaleString("fr-FR")} FCFA est identifiée aux cours spot actuels, nécessitant une provision SYSCOHADA.`
      : `Un gain latent net de ${impactGlobalLatent_XOF.toLocaleString("fr-FR")} FCFA est constaté (compte 477 non comptabilisé en produit selon le principe de prudence).`);

  return {
    societeRaisonSociale,
    exercice,
    positions: analyses,
    expositionGlobaleNette_XOF,
    impactGlobalLatent_XOF,
    provisionsTotalesRequises_XOF,
    niveauRisqueChange,
    recommandationsCouverture,
    syntheseTresorerie,
  };
}
