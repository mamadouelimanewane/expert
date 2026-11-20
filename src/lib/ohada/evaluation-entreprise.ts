// ─────────────────────────────────────────────────────────────────────────────
// Module d'Évaluation d'Entreprise en Contexte Émergent / OHADA
// Méthodes DCF (avec Prime de Risque Pays UEMOA/CEMAC), Multiples BRVM et ANR
// ─────────────────────────────────────────────────────────────────────────────

export interface ParametresWACC {
  tauxSansRisque: number;          // Obligations d'État Trésor UEMOA (ex: 6.5%)
  betaSecteur: number;             // Bêta du secteur d'activité (ex: 1.1)
  primeRisqueMarche: number;       // Equity Risk Premium (ex: 6.0%)
  primeRisquePaysCRP: number;      // Country Risk Premium (ex: 3.5% pour le Sénégal, 3.2% CI)
  tauxInteretDette: number;        // Coût moyen de la dette bancaire (ex: 8.5%)
  tauxIS: number;                  // Taux IS (ex: 30%)
  proportionFondsPropres: number;  // E / (D + E), ex: 0.60
  proportionDette: number;         // D / (D + E), ex: 0.40
}

export interface ProjectionCashFlow {
  annee: number;
  chiffreAffaires: number;
  ebit: number;                    // Résultat d'Exploitation
  impotTheorique: number;          // EBIT × (1 - IS)
  dotationsAmortissements: number; // D&A
  capexInvestissements: number;    // Dépenses d'investissement
  variationBFR: number;            // Variation du besoin en fonds de roulement
  freeCashFlowToFirm: number;      // FCFF = EBIT(1-IS) + D&A - Capex - VarBFR
}

export interface ParametresEvaluationDCF {
  waccParams: ParametresWACC;
  tauxCroissancePerpetuelle: number; // g (ex: 2.5%)
  projections: ProjectionCashFlow[];
  tresorerieCloture: number;
  dettesFinancieresCloture: number;
}

export interface ParametresMultiples {
  ebitdaCible: number;             // FCFA
  multipleEbitdaSectoriel: number; // Ex: 6.5x (moyenne BRVM / transactions)
  decoteIlliquidite: number;       // % décote non-coté (ex: 25%)
  tresorerieNetteComptable: number;// Tréso - Dettes
}

export interface ParametresANR {
  actifNetComptable: number;       // Capitaux propres comptables (FCFA)
  plusValuesLatentesImmo: number;  // Terrains et immeubles réévalués
  provisionsNonJustifiees: number; // Réintégrations
  valeurFondsDeCommerce: number;   // Clientèle / Rente du Goodwill
}

export interface SyntheseEvaluationEntreprise {
  nomEntreprise: string;
  secteur: string;
  pays: string;

  // Détails DCF
  waccCalcule: number;             // %
  coutFondsPropres: number;        // %
  sommeFluxActualises: number;     // FCFA
  valeurTerminaleActualisee: number; // FCFA
  valeurEntrepriseDCF: number;     // FCFA
  equityValueDCF: number;          // FCFA

  // Détails Multiples
  equityValueMultiples: number;    // FCFA

  // Détails ANR
  equityValueANR: number;          // FCFA

  // Synthèse Multicritères
  valeurCentraleRetenue: number;   // Moyenne pondérée (50% DCF, 30% Multiples, 20% ANR)
  fourchetteBasse: number;         // -15%
  fourchetteHaute: number;         // +15%
  rapportEvaluationFormel: string;
}

export function calculerCoutCapitalWACC(p: ParametresWACC): { ke: number; kdApresImpot: number; wacc: number } {
  // Coût des fonds propres Ke = Rf + Beta × ERP + CRP
  const ke = p.tauxSansRisque + p.betaSecteur * p.primeRisqueMarche + p.primeRisquePaysCRP;

  // Coût de la dette après impôt Kd = TauxDette × (1 - IS)
  const kdApresImpot = p.tauxInteretDette * (1 - p.tauxIS);

  // WACC = (E/V) × Ke + (D/V) × Kd
  const wacc = p.proportionFondsPropres * ke + p.proportionDette * kdApresImpot;

  return {
    ke: Math.round(ke * 100) / 100,
    kdApresImpot: Math.round(kdApresImpot * 100) / 100,
    wacc: Math.round(wacc * 100) / 100,
  };
}

export function evaluerEntreprise(
  nom: string,
  secteur: string,
  pays: string,
  dcfParams: ParametresEvaluationDCF,
  multiplesParams: ParametresMultiples,
  anrParams: ParametresANR
): SyntheseEvaluationEntreprise {
  // 1. Calcul WACC
  const { ke, wacc } = calculerCoutCapitalWACC(dcfParams.waccParams);
  const waccDecimal = wacc / 100;

  // 2. Calcul DCF
  let sommeFluxActu = 0;
  let dernierFlux = 0;
  const n = dcfParams.projections.length;

  for (let i = 0; i < n; i++) {
    const proj = dcfParams.projections[i];
    const facteurActualisation = Math.pow(1 + waccDecimal, proj.annee);
    sommeFluxActu += Math.round(proj.freeCashFlowToFirm / facteurActualisation);
    dernierFlux = proj.freeCashFlowToFirm;
  }

  // Valeur Terminale (Gordon Shapiro)
  const g = dcfParams.tauxCroissancePerpetuelle / 100;
  const fluxNormatifTerminal = dernierFlux * (1 + g);
  const valeurTerminaleNonActualisee = (waccDecimal - g) > 0 ? fluxNormatifTerminal / (waccDecimal - g) : 0;
  const facteurActuVT = Math.pow(1 + waccDecimal, n);
  const valeurTerminaleActualisee = Math.round(valeurTerminaleNonActualisee / facteurActuVT);

  const valeurEntrepriseDCF = sommeFluxActu + valeurTerminaleActualisee;
  const detteNetteComptable = dcfParams.dettesFinancieresCloture - dcfParams.tresorerieCloture;
  const equityValueDCF = valeurEntrepriseDCF - detteNetteComptable;

  // 3. Calcul Multiples BRVM (avec décote d'illiquidité)
  const decote = multiplesParams.decoteIlliquidite / 100;
  const evBruteMultiples = multiplesParams.ebitdaCible * multiplesParams.multipleEbitdaSectoriel;
  const evApresDecote = Math.round(evBruteMultiples * (1 - decote));
  const equityValueMultiples = evApresDecote + multiplesParams.tresorerieNetteComptable;

  // 4. Calcul Actif Net Réévalué (ANR)
  const equityValueANR =
    anrParams.actifNetComptable +
    anrParams.plusValuesLatentesImmo +
    anrParams.provisionsNonJustifiees +
    anrParams.valeurFondsDeCommerce;

  // 5. Synthèse Multicritères Pondérée (50% DCF + 30% Multiples + 20% ANR)
  const valeurCentrale = Math.round(
    equityValueDCF * 0.5 + equityValueMultiples * 0.3 + equityValueANR * 0.2
  );
  const fourchetteBasse = Math.round(valeurCentrale * 0.85);
  const fourchetteHaute = Math.round(valeurCentrale * 1.15);

  const fmt = (v: number) => v.toLocaleString("fr-FR");

  const rapport =
    `RAPPORT D'ÉVALUATION FINANCIÈRE DE TITRES — ${nom.toUpperCase()} (${pays})\n` +
    `Secteur d'activité : ${secteur}\n\n` +
    `1. PARAMÈTRES FINANCIERS & COÛT DU CAPITAL (WACC) :\n` +
    `- Taux sans risque (Obligations État UEMOA) : ${dcfParams.waccParams.tauxSansRisque}%\n` +
    `- Prime de Risque Pays (CRP ${pays}) : +${dcfParams.waccParams.primeRisquePaysCRP}%\n` +
    `- Coût des Fonds Propres (Ke) : ${ke}%\n` +
    `- Coût Moyen Pondéré du Capital (WACC) : ${wacc}%\n\n` +
    `2. RÉSULTATS PAR MÉTHODE VALORISÉE :\n` +
    `- Méthode DCF (Flux Actualisés) : ${fmt(equityValueDCF)} FCFA (EV : ${fmt(valeurEntrepriseDCF)} FCFA)\n` +
    `- Méthode des Multiples Boursiers BRVM (Multiple ${multiplesParams.multipleEbitdaSectoriel}x avec décote ${multiplesParams.decoteIlliquidite}%) : ${fmt(equityValueMultiples)} FCFA\n` +
    `- Méthode Patrimoniale (ANR Réévalué) : ${fmt(equityValueANR)} FCFA\n\n` +
    `3. FOURCHETTE DE VALEUR CENTRALE RECOMMANDÉE (Pondération 50/30/20) :\n` +
    `- VALEUR CENTRALE DES CAPITAUX PROPRES : ${fmt(valeurCentrale)} FCFA\n` +
    `- Fourchette de négociation : ${fmt(fourchetteBasse)} FCFA à ${fmt(fourchetteHaute)} FCFA.\n\n` +
    `Fait à titre d'expert financier selon les usages de l'Ordre National des Experts-Comptables (ONECCA).`;

  return {
    nomEntreprise: nom,
    secteur,
    pays,
    waccCalcule: wacc,
    coutFondsPropres: ke,
    sommeFluxActualises: sommeFluxActu,
    valeurTerminaleActualisee,
    valeurEntrepriseDCF,
    equityValueDCF,
    equityValueMultiples,
    equityValueANR,
    valeurCentraleRetenue: valeurCentrale,
    fourchetteBasse,
    fourchetteHaute,
    rapportEvaluationFormel: rapport,
  };
}
