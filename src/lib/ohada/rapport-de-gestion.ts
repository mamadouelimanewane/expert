/**
 * Générateur Automatisé de Rapport de Gestion pour l'AGOA
 * Conforme à l'AUSCGIE (Art. 138 à 143 - Rapport annuel de gestion des dirigeants)
 * et au SYSCOHADA révisé (SIG, TFT et affectation du résultat).
 */

export interface DonneesEntite {
  raisonSociale: string;
  formeJuridique: "SA" | "SAS" | "SARL" | "SNC";
  capitalSocial_XOF: number;
  rccm: string;
  identifiantFiscal: string; // NINEA, NIU, IFU, etc.
  siegeSocial: string;
  exercice: number;
  dirigeant: {
    nom: string;
    titre: string; // "Directeur Général", "Gérant", "Président"
  };
}

export interface SoldesGestion {
  chiffreAffaires_XOF: number;
  valeurAjoutee_XOF: number;
  ebe_XOF: number;
  resultatExploitation_XOF: number;
  resultatFinancier_XOF: number;
  resultatHAO_XOF: number;
  impotSocietes_XOF: number;
  resultatNet_XOF: number;
  tresorerieNette_XOF: number;
}

export interface AffectationProposee {
  reportANouveauInitial_XOF: number;
  dotationReserveLegale_XOF?: number; // Calculé auto si absent (10% plafonné à 20% du capital)
  dotationReservesStatutaires_XOF: number;
  dividendesProposes_XOF: number;
}

export interface InputRapportGestion {
  entite: DonneesEntite;
  soldesN: SoldesGestion;
  soldesNMoins1: SoldesGestion;
  affectation: AffectationProposee;
  faitsMarquants?: string[];
  evenementsPostCloture?: string[];
  perspectivesN1?: string[];
}

export interface TableauAffectationResultat {
  beneficeNetExercice_XOF: number;
  reportANouveauAnterieur_XOF: number;
  beneficeDistribuable_XOF: number;
  reserveLegale_XOF: number;
  reserveStatutaire_XOF: number;
  dividendes_XOF: number;
  nouveauReportANouveau_XOF: number;
  tauxDistribution_pct: number;
}

export interface AnalyseSIG {
  croissanceCA_pct: number;
  margeEBE_pct: number;
  margeNette_pct: number;
  evolutionResultatNet_pct: number;
  commentaireActivite: string;
  commentaireRentabilite: string;
}

export interface RapportGestionComplet {
  entite: DonneesEntite;
  analyseSIG: AnalyseSIG;
  tableauAffectation: TableauAffectationResultat;
  texteIntegralRapport: string;
  resolutionsProposees: string[];
}

export function calculerEvolutionPct(n: number, n1: number): number {
  if (n1 === 0) return n > 0 ? 100 : 0;
  return Number((((n - n1) / Math.abs(n1)) * 100).toFixed(2));
}

export function calculerAffectationResultat(
  capitalSocial: number,
  beneficeNet: number,
  affectation: AffectationProposee
): TableauAffectationResultat {
  const reportAnterieur = affectation.reportANouveauInitial_XOF;
  const beneficeDistribuable = beneficeNet + reportAnterieur;

  let reserveLegale = 0;
  if (beneficeNet > 0) {
    if (affectation.dotationReserveLegale_XOF !== undefined) {
      reserveLegale = affectation.dotationReserveLegale_XOF;
    } else {
      // Art. 346 AUSCGIE : prélèvement de 10% sur les bénéfices nets diminués le cas échéant des pertes antérieures
      const assiette = Math.max(0, beneficeNet);
      reserveLegale = Math.round(assiette * 0.1);
      // Plafond de 20% du capital social
      const maxReserve = Math.round(capitalSocial * 0.2);
      if (reserveLegale > maxReserve) reserveLegale = maxReserve;
    }
  }

  const reserveStatutaire = Math.max(0, affectation.dotationReservesStatutaires_XOF);
  const dividendes = Math.max(0, affectation.dividendesProposes_XOF);

  const totalAffectations = reserveLegale + reserveStatutaire + dividendes;
  const nouveauReport = beneficeDistribuable - totalAffectations;

  const tauxDistribution =
    beneficeNet > 0 ? Number(((dividendes / beneficeNet) * 100).toFixed(2)) : 0;

  return {
    beneficeNetExercice_XOF: beneficeNet,
    reportANouveauAnterieur_XOF: reportAnterieur,
    beneficeDistribuable_XOF: beneficeDistribuable,
    reserveLegale_XOF: reserveLegale,
    reserveStatutaire_XOF: reserveStatutaire,
    dividendes_XOF: dividendes,
    nouveauReportANouveau_XOF: nouveauReport,
    tauxDistribution_pct: Math.min(100, Math.max(0, tauxDistribution)),
  };
}

export function genererRapportGestion(input: InputRapportGestion): RapportGestionComplet {
  const { entite, soldesN, soldesNMoins1, affectation } = input;

  const croissanceCA = calculerEvolutionPct(
    soldesN.chiffreAffaires_XOF,
    soldesNMoins1.chiffreAffaires_XOF
  );
  const margeEBE =
    soldesN.chiffreAffaires_XOF > 0
      ? Number(((soldesN.ebe_XOF / soldesN.chiffreAffaires_XOF) * 100).toFixed(2))
      : 0;
  const margeNette =
    soldesN.chiffreAffaires_XOF > 0
      ? Number(((soldesN.resultatNet_XOF / soldesN.chiffreAffaires_XOF) * 100).toFixed(2))
      : 0;
  const evolutionRN = calculerEvolutionPct(
    soldesN.resultatNet_XOF,
    soldesNMoins1.resultatNet_XOF
  );

  let commentaireActivite = `Le chiffre d'affaires de l'exercice clos le 31 décembre ${entite.exercice} s'établit à ${soldesN.chiffreAffaires_XOF.toLocaleString(
    "fr-FR"
  )} XOF, contre ${soldesNMoins1.chiffreAffaires_XOF.toLocaleString(
    "fr-FR"
  )} XOF lors de l'exercice précédent, soit une variation de ${croissanceCA > 0 ? "+" : ""}${croissanceCA}%.`;

  let commentaireRentabilite = `L'Excédent Brut d'Exploitation (EBE) ressort à ${soldesN.ebe_XOF.toLocaleString(
    "fr-FR"
  )} XOF, traduisant un taux de marge brute d'exploitation de ${margeEBE}%. Le résultat net de l'exercice s'élève à ${soldesN.resultatNet_XOF.toLocaleString(
    "fr-FR"
  )} XOF (${evolutionRN > 0 ? "+" : ""}${evolutionRN}% par rapport à N-1).`;

  const tableauAffectation = calculerAffectationResultat(
    entite.capitalSocial_XOF,
    soldesN.resultatNet_XOF,
    affectation
  );

  const faits = input.faitsMarquants || [
    "Poursuite du plan de modernisation des équipements et des systèmes d'information.",
    "Renforcement de la conformité aux exigences réglementaires OHADA et fiscales nationales.",
  ];

  const perspectives = input.perspectivesN1 || [
    "Consolidation des positions sur les marchés stratégiques de l'UEMOA.",
    "Maîtrise rigoureuse du Besoin en Fonds de Roulement (BFR) et de l'exposition au risque de crédit.",
  ];

  const resolutionsProposees = [
    `PREMIÈRE RÉSOLUTION : Approbation des comptes annuels (Bilan, Compte de résultat, TFT et Notes annexes) de l'exercice clos le 31 décembre ${entite.exercice}.`,
    `DEUXIÈME RÉSOLUTION : Quitus entier et sans réserve aux dirigeants (${entite.dirigeant.titre}) pour l'exécution de leur mandat au cours de l'exercice écoulé.`,
    `TROISIÈME RÉSOLUTION : Affectation du résultat d'un montant de ${soldesN.resultatNet_XOF.toLocaleString(
      "fr-FR"
    )} XOF : dotation réserve légale (${tableauAffectation.reserveLegale_XOF.toLocaleString(
      "fr-FR"
    )} XOF), distribution de dividendes (${tableauAffectation.dividendes_XOF.toLocaleString(
      "fr-FR"
    )} XOF) et solde en report à nouveau (${tableauAffectation.nouveauReportANouveau_XOF.toLocaleString(
      "fr-FR"
    )} XOF).`,
  ];

  const texteIntegral = `
RAPPORT DE GESTION DU CONSEIL D'ADMINISTRATION / DE LA GÉRANCE
À L'ASSEMBLÉE GÉNÉRALE ORDINAIRE ANNUELLE
EXERCICE CLOS LE 31 DÉCEMBRE ${entite.exercice}

Mesdames, Messieurs les Actionnaires / Associés,

Conformément aux dispositions des statuts et des articles 138 et suivants de l'Acte Uniforme relatif au Droit des Sociétés Commerciales et du GIE (AUSCGIE), nous avons l'honneur de vous présenter notre rapport sur l'activité de la société ${
    entite.raisonSociale
  } au cours de l'exercice clos le 31 décembre ${entite.exercice}.

I. ACTIVITÉ ET SITUATION FINANCIÈRE DE LA SOCIÉTÉ
${commentaireActivite}
${commentaireRentabilite}

II. FAITS MARQUANTS DE L'EXERCICE
${faits.map((f) => `- ${f}`).join("\n")}

III. ÉVÉNEMENTS IMPORTANTS POSTÉRIEURS À LA CLÔTURE
${(input.evenementsPostCloture || ["Néant. Aucun événement de nature à modifier la situation financière."]).map((e) => `- ${e}`).join("\n")}

IV. PERSPECTIVES D'AVENIR
${perspectives.map((p) => `- ${p}`).join("\n")}

V. AFFECTATION DU RÉSULTAT
Le bénéfice net de l'exercice s'établit à ${soldesN.resultatNet_XOF.toLocaleString(
    "fr-FR"
  )} XOF.
Nous vous proposons de l'affecter comme suit :
- Dotation à la Réserve Légale (10% - Art. 346 AUSCGIE) : ${tableauAffectation.reserveLegale_XOF.toLocaleString(
    "fr-FR"
  )} XOF
- Dotation aux Réserves Statutaires : ${tableauAffectation.reserveStatutaire_XOF.toLocaleString(
    "fr-FR"
  )} XOF
- Distribution de Dividendes : ${tableauAffectation.dividendes_XOF.toLocaleString(
    "fr-FR"
  )} XOF
- Solde affecté au Report à Nouveau : ${tableauAffectation.nouveauReportANouveau_XOF.toLocaleString(
    "fr-FR"
  )} XOF

Fait à ${entite.siegeSocial},
Le Conseil d'Administration / La Direction Générale
`.trim();

  return {
    entite,
    analyseSIG: {
      croissanceCA_pct: croissanceCA,
      margeEBE_pct: margeEBE,
      margeNette_pct: margeNette,
      evolutionResultatNet_pct: evolutionRN,
      commentaireActivite,
      commentaireRentabilite,
    },
    tableauAffectation,
    texteIntegralRapport: texteIntegral,
    resolutionsProposees,
  };
}
