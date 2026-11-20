/**
 * Moteur d'Audit Forensique Intégral ISA 240 (Journal Entry Testing - JET)
 * Inspiré de MindBridge Ai.
 * Analyse 100% des écritures du grand livre avec Ensemble AI multi-points de contrôle :
 * Loi de Benford, écritures nocturnes/week-ends, montants ronds, seuils d'autorisation,
 * et contournement du contrôle interne (Management Override of Controls).
 */

export interface EcritureGrandLivreJET {
  id: string;
  dateComptable: string;
  heureSaisie: string; // "HH:MM" (ex: "23:45", "14:20")
  jourSemaine: number; // 0=Dimanche, 6=Samedi
  utilisateur: string;
  valideur?: string;
  journalCode: string;
  compteDebit: string;
  compteCredit: string;
  libelle: string;
  montant_XOF: number;
  hasPieceJustificative: boolean;
}

export type CodeControlePoint =
  | "LOI_BENFORD_ANOMALIE"
  | "HORAIRE_SUSPECT_NUIT_WEEKEND"
  | "CLOTURE_31_DECEMBRE_SANS_PIECE"
  | "MONTANT_ROND_ANORMAL"
  | "SEUIL_JUSTE_EN_DESSOUS"
  | "CROISEMENT_COMPTE_ATYPIQUE"
  | "CUMUL_SAISIE_VALIDATION";

export interface AlerteControlePoint {
  code: CodeControlePoint;
  libelle: string;
  poidsRisque: number;
  description: string;
}

export interface EcritureScoreeJET {
  ecriture: EcritureGrandLivreJET;
  scoreRisque: number; // 0 à 100
  niveauRisque: "CRITIQUE" | "ELEVE" | "MODERE" | "FAIBLE";
  controlesDeclenches: AlerteControlePoint[];
  explicationForensique: string;
}

export interface AnalyseBenfordChiffre {
  chiffre: number; // 1 à 9
  frequenceObservee_pct: number;
  frequenceTheoriqueBenford_pct: number;
  ecart_pct: number;
  anomalieDetectee: boolean;
}

export interface RapportForensiqueISA240 {
  societeRaisonSociale: string;
  exercice: number;
  totalEcrituresAuditees: number;
  montantTotalAudite_XOF: number;
  nbEcrituresCritiques: number;
  nbEcrituresElevees: number;
  nbEcrituresModerees: number;
  nbEcrituresFaibles: number;
  distributionBenford: AnalyseBenfordChiffre[];
  ecrituresScorees: EcritureScoreeJET[];
  syntheseISA240: string;
}

// Probabilités théoriques de la loi de Benford P(d) = log10(1 + 1/d)
export const FREQUENCES_BENFORD: Record<number, number> = {
  1: 30.1,
  2: 17.6,
  3: 12.5,
  4: 9.7,
  5: 7.9,
  6: 6.7,
  7: 5.8,
  8: 5.1,
  9: 4.6,
};

export function extrairePremierChiffre(montant: number): number | null {
  const str = Math.abs(montant).toString().replace(/^0+/, "");
  if (!str || str === "0") return null;
  const premierChar = str.charAt(0);
  const chiffre = parseInt(premierChar, 10);
  return chiffre >= 1 && chiffre <= 9 ? chiffre : null;
}

export function evaluerEcritureForensique(ecriture: EcritureGrandLivreJET): EcritureScoreeJET {
  const alertes: AlerteControlePoint[] = [];

  // 1. Horodatage suspect (Nuit entre 22h et 5h ou Week-end Samedi/Dimanche)
  const heureNum = parseInt(ecriture.heureSaisie.split(":")[0] || "12", 10);
  const isNuit = heureNum >= 22 || heureNum < 5;
  const isWeekend = ecriture.jourSemaine === 0 || ecriture.jourSemaine === 6;
  if (isNuit || isWeekend) {
    alertes.push({
      code: "HORAIRE_SUSPECT_NUIT_WEEKEND",
      libelle: "Écriture passée en horaires atypiques (Nuit ou Week-end)",
      poidsRisque: 25,
      description: `Écriture enregistrée le ${isWeekend ? "week-end" : ""} à ${ecriture.heureSaisie}. Risque élevé d'intervention clandestine.`,
    });
  }

  // 2. Écriture de clôture au 31 décembre sans pièce justificative
  if (ecriture.dateComptable.endsWith("-12-31") && !ecriture.hasPieceJustificative) {
    alertes.push({
      code: "CLOTURE_31_DECEMBRE_SANS_PIECE",
      libelle: "Ajustement de clôture au 31/12 sans pièce justificative probante",
      poidsRisque: 35,
      description: "Écriture passée le jour de la clôture sans justificatif formel (Présomption d'habillage de bilan).",
    });
  }

  // 3. Montants ronds anormaux (multiples exacts de 1 000 000 XOF pour montants ≥ 5M)
  if (ecriture.montant_XOF >= 5_000_000 && ecriture.montant_XOF % 1_000_000 === 0) {
    alertes.push({
      code: "MONTANT_ROND_ANORMAL",
      libelle: "Montant rond d'importance significative (Multiple de 1M XOF)",
      poidsRisque: 20,
      description: `Montant rond sans décimales (${ecriture.montant_XOF.toLocaleString("fr-FR")} XOF) atypique pour une opération commerciale réelle.`,
    });
  }

  // 4. Seuil juste en-dessous (ex: entre 9 500 000 et 9 999 999 XOF pour contourner seuil 10M)
  if (ecriture.montant_XOF >= 9_500_000 && ecriture.montant_XOF < 10_000_000) {
    alertes.push({
      code: "SEUIL_JUSTE_EN_DESSOUS",
      libelle: "Montant calibré juste en-dessous du seuil d'autorisation (10M XOF)",
      poidsRisque: 30,
      description: "Soupçon de fractionnement d'opération pour contourner la double signature obligatoire.",
    });
  }

  // 5. Croisement de comptes atypique (Débit Compte 6 Charges / Crédit Compte 5 Trésorerie sans passer par 401 Fournisseurs)
  if (ecriture.compteDebit.startsWith("6") && ecriture.compteCredit.startsWith("5")) {
    alertes.push({
      code: "CROISEMENT_COMPTE_ATYPIQUE",
      libelle: "Paiement direct de charges en trésorerie sans compte de tiers auxiliaire",
      poidsRisque: 25,
      description: "Règlement direct de charge (Comptes 6 ➔ 5) sans comptabilisation du fournisseur (Compte 401). Risque de décaissement fictif.",
    });
  }

  // 6. Cumul saisie et validation (même utilisateur)
  if (ecriture.valideur && ecriture.utilisateur === ecriture.valideur) {
    alertes.push({
      code: "CUMUL_SAISIE_VALIDATION",
      libelle: "Non-respect de la séparation des tâches (Saisie et validation par la même personne)",
      poidsRisque: 15,
      description: `L'utilisateur ${ecriture.utilisateur} a saisi et auto-validé l'écriture sans double regard.`,
    });
  }

  const scoreTotal = Math.min(100, alertes.reduce((acc, a) => acc + a.poidsRisque, 0));

  let niveau: EcritureScoreeJET["niveauRisque"] = "FAIBLE";
  if (scoreTotal >= 60) niveau = "CRITIQUE";
  else if (scoreTotal >= 40) niveau = "ELEVE";
  else if (scoreTotal >= 20) niveau = "MODERE";

  const explication = alertes.length > 0
    ? alertes.map((a) => a.libelle).join(" • ")
    : "Écriture conforme aux invariants opérationnels et aux règles de contrôle interne.";

  return {
    ecriture,
    scoreRisque: scoreTotal,
    niveauRisque: niveau,
    controlesDeclenches: alertes,
    explicationForensique: explication,
  };
}

export function analyserLoiBenford(ecritures: EcritureGrandLivreJET[]): AnalyseBenfordChiffre[] {
  const comptage: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  let totalValides = 0;

  for (const e of ecritures) {
    const premier = extrairePremierChiffre(e.montant_XOF);
    if (premier !== null && premier >= 1 && premier <= 9) {
      comptage[premier] = (comptage[premier] || 0) + 1;
      totalValides++;
    }
  }

  const resultat: AnalyseBenfordChiffre[] = [];
  for (let ch = 1; ch <= 9; ch++) {
    const obsPct = totalValides > 0 ? Number(((comptage[ch] / totalValides) * 100).toFixed(1)) : 0;
    const theoPct = FREQUENCES_BENFORD[ch];
    const ecart = Number(Math.abs(obsPct - theoPct).toFixed(1));
    // Anomalie si écart > 10 points
    const anomalie = totalValides >= 20 && ecart >= 10.0;

    resultat.push({
      chiffre: ch,
      frequenceObservee_pct: obsPct,
      frequenceTheoriqueBenford_pct: theoPct,
      ecart_pct: ecart,
      anomalieDetectee: anomalie,
    });
  }

  return resultat;
}

export function executerAuditForensiqueISA240(
  societeRaisonSociale: string,
  exercice: number,
  ecritures: EcritureGrandLivreJET[]
): RapportForensiqueISA240 {
  const ecrituresScorees = ecritures.map(evaluerEcritureForensique);
  ecrituresScorees.sort((a, b) => b.scoreRisque - a.scoreRisque);

  const nbCritiques = ecrituresScorees.filter((e) => e.niveauRisque === "CRITIQUE").length;
  const nbElevees = ecrituresScorees.filter((e) => e.niveauRisque === "ELEVE").length;
  const nbModerees = ecrituresScorees.filter((e) => e.niveauRisque === "MODERE").length;
  const nbFaibles = ecrituresScorees.filter((e) => e.niveauRisque === "FAIBLE").length;

  const montantTotal = ecritures.reduce((acc, e) => acc + e.montant_XOF, 0);
  const benford = analyserLoiBenford(ecritures);

  const synthese = `Audit forensique exhaustif réalisé sur 100% de la population (${ecritures.length} écritures, montant cumulé : ${montantTotal.toLocaleString("fr-FR")} XOF). ${nbCritiques} écriture(s) à risque critique et ${nbElevees} à risque élevé ont été identifiées pour investigation approfondie selon la norme ISA 240 (Fraude et contournement du contrôle interne).`;

  return {
    societeRaisonSociale,
    exercice,
    totalEcrituresAuditees: ecritures.length,
    montantTotalAudite_XOF: montantTotal,
    nbEcrituresCritiques: nbCritiques,
    nbEcrituresElevees: nbElevees,
    nbEcrituresModerees: nbModerees,
    nbEcrituresFaibles: nbFaibles,
    distributionBenford: benford,
    ecrituresScorees,
    syntheseISA240: synthese,
  };
}
