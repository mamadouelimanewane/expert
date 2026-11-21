/**
 * Agent IA Fiscal Defender — Cabinet Expert OHADA 360
 * Contrôle fiscal prédictif, calcul des risques de redressement DGID &
 * Génération autonome de mémoires de défense préventifs.
 *
 * Conforme aux Codes Généraux des Impôts (CGI) des pays OHADA / UEMOA
 * (Sénégal, Côte d'Ivoire, Cameroun, Bénin, Mali, etc.)
 */

export interface LigneRisqueFiscal {
  rubrique:
    | "AMORTISSEMENT_VEHICULE_TOURISME"
    | "CHARGES_NON_JUSTIFIEES_ART8"
    | "REMUNERATION_EXCESSIVE_DIRIGEANT"
    | "RETENUE_SOURCE_PRESTATAIRE_ETRANGER"
    | "ABANDON_CREANCE_SANS_CONTREPARTIE"
    | "DEFICIT_REPORTABLE_PRESCRIT";
  libelle: string;
  baseConcernee_XOF: number;
  tauxImposition_pct: number; // ex: 25% (IS UEMOA) ou 20% (BRS)
  tauxPenalite_pct: number;   // ex: 25% (droit commun) ou 50%
  justificationEntreprise: string;
}

export interface AnalyseLigneRisque {
  rubrique: string;
  libelle: string;
  baseRedressable_XOF: number;
  droitsSimples_XOF: number;
  penalitesEstimees_XOF: number;
  expositionTotale_XOF: number;
  degreRisque: "TRES_ELEVE" | "ELEVE" | "MODERE";
  recommandationImmediata: string;
}

export interface RapportFiscalDefender {
  clientNom: string;
  pays: string;
  exercice: number;
  dateAnalyse: string;
  scoreSecuriteFiscale_100: number; // Plus c'est haut, moins il y a de risque
  totalBaseRedressable_XOF: number;
  totalDroitsSimples_XOF: number;
  totalPenalites_XOF: number;
  risqueFiscalTotal_XOF: number;
  provisionRecommandee_XOF: number; // Compte 195
  lignesAnalysees: AnalyseLigneRisque[];
  memoireDefensePreventif: string;
  argumentsJuridiquesCGI: string[];
}

export function executerAuditFiscalDefender(
  clientNom: string,
  pays: string,
  exercice: number,
  lignes: LigneRisqueFiscal[]
): RapportFiscalDefender {
  const analyses: AnalyseLigneRisque[] = [];
  let totalBase = 0;
  let totalDroits = 0;
  let totalPenalites = 0;

  for (const l of lignes) {
    const droits = Math.round((l.baseConcernee_XOF * l.tauxImposition_pct) / 100);
    const penalites = Math.round((droits * l.tauxPenalite_pct) / 100);
    const expo = droits + penalites;

    totalBase += l.baseConcernee_XOF;
    totalDroits += droits;
    totalPenalites += penalites;

    let degre: AnalyseLigneRisque["degreRisque"] = "MODERE";
    let reco = "Conserver les pièces justificatives au dossier permanent.";

    if (l.rubrique === "AMORTISSEMENT_VEHICULE_TOURISME") {
      degre = "TRES_ELEVE";
      reco = "Réintégrer extra-comptablement au tableau 7 de la liasse pour éviter les pénalités de 25%.";
    } else if (l.rubrique === "RETENUE_SOURCE_PRESTATAIRE_ETRANGER") {
      degre = "TRES_ELEVE";
      reco = "Régulariser la retenue à la source (BRS) ou justifier de la convention fiscale bilatérale de non-double imposition.";
    } else if (l.rubrique === "CHARGES_NON_JUSTIFIEES_ART8") {
      degre = "ELEVE";
      reco = "Obtenir les factures certifiées normalisées conformes avant l'arrivée des vérificateurs.";
    }

    analyses.push({
      rubrique: l.rubrique,
      libelle: l.libelle,
      baseRedressable_XOF: l.baseConcernee_XOF,
      droitsSimples_XOF: droits,
      penalitesEstimees_XOF: penalites,
      expositionTotale_XOF: expo,
      degreRisque: degre,
      recommandationImmediata: reco,
    });
  }

  const risqueTotal = totalDroits + totalPenalites;
  // Score de sécurité : 100 réduit selon l'exposition
  let score = 100;
  if (totalBase > 0) {
    if (risqueTotal > 20_000_000) score = 40;
    else if (risqueTotal > 10_000_000) score = 60;
    else if (risqueTotal > 5_000_000) score = 75;
    else score = 88;
  }

  const provisionRecommandee = Math.round(totalDroits); // Provision prudentielle sur droits simples

  const argumentsJuridiquesCGI = [
    "Article 8 du Code Général des Impôts : Déductibilité subordonnée à l'intérêt direct de l'exploitation et à la production de pièces justificatives probantes.",
    "Règle de plafonnement fiscal des amortissements de véhicules de tourisme (Plafond légal 20 000 000 XOF TTC).",
    "Article 7 CGI & Jurisprudence OHADA : La rémunération des dirigeants est admise dès lors qu'elle correspond à un travail effectif et n'est pas disproportionnée eu égard aux résultats.",
    "Conventions fiscales internationales et régimes de retenue à la source sur prestations immatérielles étrangères (UEMOA / Non-résidents).",
  ];

  // Génération du mémoire de défense préventif
  const memoire = `================================================================================
MÉMOIRE EN DÉFENSE PRÉVENTIF — AUDIT PRÉDICTIF DGID
CONTRIBUABLE : ${clientNom.toUpperCase()}
EXERCICE CONTRÔLÉ : ${exercice} | JURIDICTION : ${pays.toUpperCase()}
DATE D'ÉMISSION : ${new Date().toLocaleDateString("fr-FR")}
RÉDIGÉ PAR : AGENT FISCAL DEFENDER (CABINET EXPERT OHADA 360)
================================================================================

I. EXPOSÉ SOMMAIRE DU LITIGE ET POSITION DE L'ADMINISTRATION
Dans le cadre des contrôles de cohérence prédictifs opérés sur les déclarations fiscales et la liasse
SYSCOHADA de la société ${clientNom}, une exposition fiscale potentielle s'élevant à un montant
global de ${risqueTotal.toLocaleString("fr-FR")} XOF (dont ${totalDroits.toLocaleString("fr-FR")} XOF en principal et ${totalPenalites.toLocaleString("fr-FR")} XOF en pénalités) a été identifiée.

II. MOTIFS DE FAIT ET DE DROIT PAR RUBRIQUE CONTESTÉE
${analyses
  .map(
    (a, idx) => `
${idx + 1}. ${a.libelle} (Base : ${a.baseRedressable_XOF.toLocaleString("fr-FR")} XOF)
   - Risque : ${a.degreRisque} | Rappel en droits : ${a.droitsSimples_XOF.toLocaleString("fr-FR")} XOF
   - Moyens de défense : La dépense a été engagée dans l'intérêt exclusif de l'entreprise
     et répond aux critères de déductibilité posés par le CGI.
   - Action préventive recommandée : ${a.recommandationImmediata}`
  )
  .join("\n")}

III. PROVISIONNEMENT ET RECOMMANDATION DU CABINET
À titre prudentiel et en vertu du principe SYSCOHADA de prudence comptable, il est recommandé
de doter une provision pour risques et charges fiscales (Compte 195) de ${provisionRecommandee.toLocaleString("fr-FR")} XOF
au titre de l'exercice ${exercice}.

IV. MOYENS DE DROIT ET FONDEMENTS LÉGAUX DU CGI
${argumentsJuridiquesCGI.map((arg, i) => `${i + 1}. ${arg}`).join("\n")}

Fait à Dakar / Abidjan, pour valoir ce que de droit.
P/O L'Expert-Comptable Référent.
================================================================================`;

  return {
    clientNom,
    pays,
    exercice,
    dateAnalyse: new Date().toISOString().slice(0, 10),
    scoreSecuriteFiscale_100: score,
    totalBaseRedressable_XOF: totalBase,
    totalDroitsSimples_XOF: totalDroits,
    totalPenalites_XOF: totalPenalites,
    risqueFiscalTotal_XOF: risqueTotal,
    provisionRecommandee_XOF: provisionRecommandee,
    lignesAnalysees: analyses,
    memoireDefensePreventif: memoire,
    argumentsJuridiquesCGI,
  };
}
