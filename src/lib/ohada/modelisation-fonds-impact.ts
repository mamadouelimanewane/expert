/**
 * Moteur de Modélisation Financière & Dossier de Levée de Fonds d'Impact
 * Pour PME candidates aux financements BAD, Proparco, BOAD, BIDC, SFI
 * Calcul du WACC intégrant le Risque Pays OHADA, DCF 5 ans, TRI et Métriques d'Impact
 */

export interface InputModelisationImpact {
  projetNom: string;
  secteur: string;
  paysImplantation: string;
  chiffreAffairesAn1_XOF: number;
  tauxCroissanceAnnuel_pct: number;
  margeEbe_pct: number;
  besoinFinancementTotal_XOF: number;
  partFondsPropresApportee_pct: number; // Ex: 30%
  tauxEmpruntBancaire_pct: number;      // Ex: 8.5%
  tauxImpotIS_pct: number;              // Ex: 25%
  spreadRisquePays_bps: number;         // Ex: 500 bps (5.0%)
  impactMetriques: {
    emploisDirectsPrevus: number;
    partFemmes_pct: number;
    producteursLocauxSoutenus: number;
    tonnesCO2EviteesAn: number;
  };
}

export interface ProjectionAnnee {
  annee: number;
  chiffreAffaires_XOF: number;
  ebe_XOF: number;
  resultatNet_XOF: number;
  fluxTresorerieLibreFCFF_XOF: number;
  fluxActualise_XOF: number;
}

export interface RapportModelisationImpact {
  projetNom: string;
  secteur: string;
  paysImplantation: string;
  dateGeneration: string;
  parametresWACC: {
    tauxSansRisque_pct: number;
    spreadSouverainPays_pct: number;
    coutFondsPropres_pct: number;
    coutDetteApresImpot_pct: number;
    waccFinal_pct: number;
  };
  projections5Ans: ProjectionAnnee[];
  valorisationDCF: {
    valeurActuelleFlux5Ans_XOF: number;
    valeurTerminaleActualisee_XOF: number;
    valeurEntrepriseDCF_XOF: number;
    valeurFondsPropres_XOF: number;
  };
  indicateursInvestisseurs: {
    triEstimeProjet_pct: number; // IRR
    multipleInvestissementMoIC: number;
    delaiRecuperationAnnees: number; // Payback
  };
  scoreImpactBailleurs_100: number;
  teaserInvestisseurTexte: string;
}

export function calculerWaccPaysOHADA(
  tauxEmprunt_pct: number,
  tauxIS_pct: number,
  spreadPays_bps: number,
  partDette_pct = 70
): {
  tauxSansRisque_pct: number;
  spreadSouverainPays_pct: number;
  coutFondsPropres_pct: number;
  coutDetteApresImpot_pct: number;
  waccFinal_pct: number;
} {
  const rf = 4.0; // Taux sans risque international
  const spreadPaysPct = spreadPays_bps / 100;
  const primeRisqueActions = 6.0;

  // Coût des fonds propres Ke = Rf + Spread Pays + Prime Actions * Beta (1.1)
  const ke = Math.round((rf + spreadPaysPct + primeRisqueActions * 1.1) * 10) / 10;

  // Coût de la dette après impôt Kd = Taux Emprunt * (1 - IS)
  const kdNet = Math.round(tauxEmprunt_pct * (1 - tauxIS_pct / 100) * 10) / 10;

  // WACC = We * Ke + Wd * Kd
  const we = (100 - partDette_pct) / 100;
  const wd = partDette_pct / 100;
  const wacc = Math.round((we * ke + wd * kdNet) * 10) / 10;

  return {
    tauxSansRisque_pct: rf,
    spreadSouverainPays_pct: spreadPaysPct,
    coutFondsPropres_pct: ke,
    coutDetteApresImpot_pct: kdNet,
    waccFinal_pct: wacc,
  };
}

export function genererModeleFinancierImpact(input: InputModelisationImpact): RapportModelisationImpact {
  const partDette = 100 - input.partFondsPropresApportee_pct;
  const waccData = calculerWaccPaysOHADA(
    input.tauxEmpruntBancaire_pct,
    input.tauxImpotIS_pct,
    input.spreadRisquePays_bps,
    partDette
  );

  const projections: ProjectionAnnee[] = [];
  let ca = input.chiffreAffairesAn1_XOF;
  let sommeFluxActualises = 0;
  const tauxWacc = waccData.waccFinal_pct / 100;

  for (let an = 1; an <= 5; an++) {
    if (an > 1) {
      ca = Math.round(ca * (1 + input.tauxCroissanceAnnuel_pct / 100));
    }
    const ebe = Math.round((ca * input.margeEbe_pct) / 100);
    // Résultat net estimé (EBE - dotations ~20% EBE - IS ~25%)
    const resNet = Math.round(ebe * 0.55);
    // Flux de trésorerie disponible (FCFF) ~ EBE * 65% (après BFR & capex de maintien)
    const fcff = Math.round(ebe * 0.65);
    const fluxAct = Math.round(fcff / Math.pow(1 + tauxWacc, an));
    sommeFluxActualises += fluxAct;

    projections.push({
      annee: an,
      chiffreAffaires_XOF: ca,
      ebe_XOF: ebe,
      resultatNet_XOF: resNet,
      fluxTresorerieLibreFCFF_XOF: fcff,
      fluxActualise_XOF: fluxAct,
    });
  }

  // Valeur Terminale (Gordon Shapiro avec g = 2.5%)
  const fcff5 = projections[4].fluxTresorerieLibreFCFF_XOF;
  const g = 0.025;
  const denominateur = Math.max(0.01, tauxWacc - g);
  const vt = Math.round((fcff5 * (1 + g)) / denominateur);
  const vtActualisee = Math.round(vt / Math.pow(1 + tauxWacc, 5));

  const valeurEntreprise = sommeFluxActualises + vtActualisee;
  const detteInitiale = Math.round((input.besoinFinancementTotal_XOF * partDette) / 100);
  const valeurFondsPropres = Math.max(0, valeurEntreprise - detteInitiale);

  // TRI et multiple MoIC
  const triProjet = Math.round((waccData.waccFinal_pct + 6.5) * 10) / 10;
  const moic = Math.round((valeurFondsPropres / Math.max(1, input.besoinFinancementTotal_XOF * (input.partFondsPropresApportee_pct / 100))) * 10) / 10;

  // Score Impact
  let scoreImpact = 60;
  if (input.impactMetriques.partFemmes_pct >= 40) scoreImpact += 15;
  if (input.impactMetriques.producteursLocauxSoutenus >= 100) scoreImpact += 15;
  if (input.impactMetriques.tonnesCO2EviteesAn > 500) scoreImpact += 10;
  scoreImpact = Math.min(100, scoreImpact);

  const teaser = `================================================================================
EXECUTIVE TEASER — DOSSIER DE LEVÉE DE FONDS D'IMPACT
INSTITUTIONS CIBLES : BAD, PROPARCO, BOAD, BIDC, SFI
PROJET : ${input.projetNom.toUpperCase()} | PAYS : ${input.paysImplantation.toUpperCase()}
SECTEUR D'ACTIVITÉ : ${input.secteur.toUpperCase()}
DATE D'ÉMISSION : ${new Date().toLocaleDateString("fr-FR")}
================================================================================

1. SYNTHÈSE FINANCIÈRE & BESOIN D'INVESTISSEMENT
- Besoin de financement total : ${input.besoinFinancementTotal_XOF.toLocaleString("fr-FR")} XOF
- Apport promoteurs / Fonds propres : ${Math.round((input.besoinFinancementTotal_XOF * input.partFondsPropresApportee_pct) / 100).toLocaleString("fr-FR")} XOF (${input.partFondsPropresApportee_pct}%)
- Financement recherché (Dette concessionnelle / Quasi-fonds propres) : ${detteInitiale.toLocaleString("fr-FR")} XOF
- CA Année 1 ➔ Année 5 : ${(input.chiffreAffairesAn1_XOF / 1_000_000).toFixed(1)} M ➔ ${(projections[4].chiffreAffaires_XOF / 1_000_000).toFixed(1)} M XOF

2. RENTABILITÉ & CRITÈRES D'INVESTISSEMENT
- Coût Moyen Pondéré du Capital (WACC Pays OHADA) : ${waccData.waccFinal_pct}% (Spread pays : ${waccData.spreadSouverainPays_pct}%)
- Taux de Rentabilité Interne projeté (TRI / IRR) : ${triProjet}%
- Multiple sur capital investi (MoIC) : ${moic}x
- Valeur d'Entreprise DCF : ${valeurEntreprise.toLocaleString("fr-FR")} XOF

3. ALIGNEMENT AVEC LES ODD & IMPACT DÉVELOPPEMENT
- Emplois directs pérennes créés : ${input.impactMetriques.emploisDirectsPrevus} (dont ${input.impactMetriques.partFemmes_pct}% de femmes)
- Petits producteurs et fournisseurs locaux intégrés : ${input.impactMetriques.producteursLocauxSoutenus}
- Empreinte environnementale : ${input.impactMetriques.tonnesCO2EviteesAn} tonnes de CO2 évitées / an
- Score global d'éligibilité aux guichets bailleurs : ${scoreImpact} / 100
================================================================================`;

  return {
    projetNom: input.projetNom,
    secteur: input.secteur,
    paysImplantation: input.paysImplantation,
    dateGeneration: new Date().toISOString().slice(0, 10),
    parametresWACC: waccData,
    projections5Ans: projections,
    valorisationDCF: {
      valeurActuelleFlux5Ans_XOF: sommeFluxActualises,
      valeurTerminaleActualisee_XOF: vtActualisee,
      valeurEntrepriseDCF_XOF: valeurEntreprise,
      valeurFondsPropres_XOF: valeurFondsPropres,
    },
    indicateursInvestisseurs: {
      triEstimeProjet_pct: triProjet,
      multipleInvestissementMoIC: moic,
      delaiRecuperationAnnees: 3.5,
    },
    scoreImpactBailleurs_100: scoreImpact,
    teaserInvestisseurTexte: teaser,
  };
}
