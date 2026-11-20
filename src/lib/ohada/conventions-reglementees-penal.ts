/**
 * Module Conventions Réglementées & Prévention du Risque Pénal (AUSCGIE)
 * Analyse des conventions visées aux articles 438 à 448 de l'AUSCGIE,
 * détection des interdictions absolues (comptes courants débiteurs - Art. 450 & 650),
 * et génération du Rapport Spécial du Commissaire aux Comptes (CAC - Art. 440 & 716).
 */

export type QualitePersonne =
  | "DIRECTEUR_GENERAL"
  | "ADMINISTRATEUR"
  | "GERANT"
  | "ACTIONNAIRE_SIGNIFICATIF" // Détenant plus de 10% des droits de vote
  | "CONJOINT_OU_PARENT_DIRIGEANT";

export type TypeOperationConvention =
  | "COMPTE_COURANT_ASSOCIE"
  | "CAUTION_AVAL_GARANTIE"
  | "PRESTATION_HONORAIRES"
  | "CESSION_ACQUISITION_ACTIF"
  | "BAIL_COMMERCIAL"
  | "ABANDON_CREANCE_AVEC_CLAUSE_RETOUR";

export interface ConventionSaisie {
  id: string;
  beneficiaireNom: string;
  qualite: QualitePersonne;
  personnePhysique: boolean; // Si true, compte courant débiteur interdit
  typeOperation: TypeOperationConvention;
  montant_XOF: number;
  soldeDebiteur: boolean; // Solde débiteur en compte 462/467
  autorisationPrealableCA: boolean;
  conditionsArmLength: boolean; // Conditions normales de marché
  dateConvention: string;
  interetSocialAvéré: boolean;
  description: string;
}

export interface AnalyseInfraction {
  typeInfraction: "INTERDICTION_ABSOLUE_ABS" | "DEFAUT_AUTORISATION_PREALABLE" | "PREJUDICE_SOCIAL" | "CONFORME";
  gravite: "CRITIQUE_PENALE" | "ELEVEE_NULLITE" | "MOYENNE" | "AUCUNE";
  articleAUSCGIE: string;
  constat: string;
  risqueDirigeant: string;
  obligationCAC: "REVELATION_PROCUREUR_ART716" | "MENTION_RAPPORT_SPECIAL" | "SANS_OBJET";
}

export interface RapportSpecialCAC {
  societeRaisonSociale: string;
  exercice: number;
  nombreConventionsTotales: number;
  nombreConventionsInterdites: number;
  conventionsAutorisees: {
    convention: ConventionSaisie;
    analyse: AnalyseInfraction;
  }[];
  conventionsNonAutorisees: {
    convention: ConventionSaisie;
    analyse: AnalyseInfraction;
  }[];
  conventionsInterdites: {
    convention: ConventionSaisie;
    analyse: AnalyseInfraction;
  }[];
  avisGeneralCAC: "FAVORABLE" | "FAVORABLE_AVEC_OBSERVATIONS" | "DEFAVORABLE_REVELATION_PROCUREUR";
  texteIntegralRapportSpecial: string;
  alertesPenales: string[];
}

export function analyserConvention(c: ConventionSaisie): AnalyseInfraction {
  // 1. Interdiction absolue : Comptes courants débiteurs personnes physiques (Art. 450 et 650 AUSCGIE)
  if (c.typeOperation === "COMPTE_COURANT_ASSOCIE" && c.personnePhysique && c.soldeDebiteur) {
    return {
      typeInfraction: "INTERDICTION_ABSOLUE_ABS",
      gravite: "CRITIQUE_PENALE",
      articleAUSCGIE: "Art. 450 & 650 AUSCGIE / Art. 891 (Abus de biens sociaux)",
      constat: `Solde débiteur de ${c.montant_XOF.toLocaleString("fr-FR")} XOF consenti à une personne physique (${c.beneficiaireNom}). Interdiction légale absolue d'ordre public.`,
      risqueDirigeant: "Nullité du découvert, obligation de remboursement immédiat avec intérêts, qualification pénale d'Abus de Biens Sociaux (1 à 5 ans de prison et amendes).",
      obligationCAC: "REVELATION_PROCUREUR_ART716",
    };
  }

  // 2. Cautions, avals ou garanties sans autorisation préalable du CA (Art. 449)
  if (c.typeOperation === "CAUTION_AVAL_GARANTIE" && !c.autorisationPrealableCA) {
    return {
      typeInfraction: "DEFAUT_AUTORISATION_PREALABLE",
      gravite: "ELEVEE_NULLITE",
      articleAUSCGIE: "Art. 449 AUSCGIE",
      constat: `Engagement de garantie ou caution de ${c.montant_XOF.toLocaleString("fr-FR")} XOF accordé sans autorisation préalable expresse du Conseil d'Administration.`,
      risqueDirigeant: "Inopposabilité de la garantie à la société, engagement de la responsabilité personnelle des dirigeants envers les créanciers.",
      obligationCAC: "MENTION_RAPPORT_SPECIAL",
    };
  }

  // 3. Conventions conclues sans autorisation préalable du CA (Art. 438)
  if (!c.autorisationPrealableCA) {
    const prejudice = !c.interetSocialAvéré || !c.conditionsArmLength;
    return {
      typeInfraction: prejudice ? "PREJUDICE_SOCIAL" : "DEFAUT_AUTORISATION_PREALABLE",
      gravite: prejudice ? "CRITIQUE_PENALE" : "MOYENNE",
      articleAUSCGIE: "Art. 438 et 443 AUSCGIE",
      constat: `Convention conclue avec ${c.beneficiaireNom} sans autorisation préalable du CA (Montant : ${c.montant_XOF.toLocaleString("fr-FR")} XOF).`,
      risqueDirigeant: prejudice
        ? "Action en nullité possible par tout actionnaire dans un délai de 3 ans et responsabilité civile pour faute de gestion."
        : "La convention produit ses effets mais doit être soumise à la ratification a posteriori de l'AG.",
      obligationCAC: prejudice ? "REVELATION_PROCUREUR_ART716" : "MENTION_RAPPORT_SPECIAL",
    };
  }

  // 4. Convention régulière autorisée
  return {
    typeInfraction: "CONFORME",
    gravite: "AUCUNE",
    articleAUSCGIE: "Art. 438 à 442 AUSCGIE",
    constat: `Convention régulièrement autorisée par le Conseil d'Administration avec intérêt social avéré.`,
    risqueDirigeant: "Aucun risque. Soumission ordinaire au vote d'approbation de l'AGOA.",
    obligationCAC: "MENTION_RAPPORT_SPECIAL",
  };
}

export function genererRapportSpecialCAC(
  societeRaisonSociale: string,
  exercice: number,
  conventions: ConventionSaisie[]
): RapportSpecialCAC {
  const analyses = conventions.map((c) => ({
    convention: c,
    analyse: analyserConvention(c),
  }));

  const autorisees = analyses.filter((a) => a.analyse.typeInfraction === "CONFORME");
  const interdites = analyses.filter((a) => a.analyse.typeInfraction === "INTERDICTION_ABSOLUE_ABS");
  const nonAutorisees = analyses.filter(
    (a) => a.analyse.typeInfraction === "DEFAUT_AUTORISATION_PREALABLE" || a.analyse.typeInfraction === "PREJUDICE_SOCIAL"
  );

  const alertesPenales: string[] = [];
  let avisCAC: RapportSpecialCAC["avisGeneralCAC"] = "FAVORABLE";

  if (interdites.length > 0) {
    avisCAC = "DEFAVORABLE_REVELATION_PROCUREUR";
    for (const item of interdites) {
      alertesPenales.push(
        `ALERTE PÉNALE (Art. 716 AUSCGIE) : Compte courant débiteur illicite au profit de ${item.convention.beneficiaireNom} (${item.convention.montant_XOF.toLocaleString("fr-FR")} XOF). Obligation de révélation au Procureur de la République.`
      );
    }
  } else if (nonAutorisees.length > 0) {
    avisCAC = "FAVORABLE_AVEC_OBSERVATIONS";
    alertesPenales.push(
      `${nonAutorisees.length} convention(s) conclue(s) sans autorisation préalable du Conseil d'Administration nécessitant une ratification expresse de l'AG.`
    );
  }

  const texteIntegral = `
RAPPORT SPÉCIAL DU COMMISSAIRE AUX COMPTES
SUR LES CONVENTIONS RÉGLEMENTÉES (ART. 440 AUSCGIE)
EXERCICE CLOS LE 31 DÉCEMBRE ${exercice}

À l'Assemblée Générale Ordinaire Annuelle de la société ${societeRaisonSociale},

En notre qualité de Commissaire aux Comptes de votre société, nous vous présentons notre rapport sur les conventions réglementées en application des articles 438 et suivants de l'Acte Uniforme relatif au Droit des Sociétés Commerciales et du GIE (AUSCGIE).

I. CONVENTIONS AUTORISÉES AU COURS DE L'EXERCICE ÉCOULÉ
${
  autorisees.length === 0
    ? "Aucune convention n'a été autorisée par votre Conseil d'Administration au cours de l'exercice."
    : autorisees
        .map(
          (item) =>
            `- Convention avec ${item.convention.beneficiaireNom} (${item.convention.qualite}) : ${item.convention.description}. Montant : ${item.convention.montant_XOF.toLocaleString("fr-FR")} XOF.`
        )
        .join("\n")
}

II. CONVENTIONS CONCLUES SANS AUTORISATION PRÉALABLE DU CONSEIL D'ADMINISTRATION
${
  nonAutorisees.length === 0
    ? "Néant. Aucune convention non autorisée constatée."
    : nonAutorisees
        .map(
          (item) =>
            `- ATTENTION : Opération conclue avec ${item.convention.beneficiaireNom} sans autorisation préalable du CA. Montant : ${item.convention.montant_XOF.toLocaleString("fr-FR")} XOF. Objet : ${item.convention.description}.`
        )
        .join("\n")
}

III. CONVENTIONS INTERDITES & ENGAGEMENTS ILLICITES (ART. 450 & 650 AUSCGIE)
${
  interdites.length === 0
    ? "Néant. Aucun compte courant débiteur d'associé personne physique ni caution illicite relevé."
    : interdites
        .map(
          (item) =>
            `- INFRACTION D'ORDRE PUBLIC : Compte courant débiteur consenti à ${item.convention.beneficiaireNom} (${item.convention.montant_XOF.toLocaleString("fr-FR")} XOF). En application de l'article 716 de l'AUSCGIE, cette irrégularité fait l'objet d'un signalement d'office au Procureur de la République.`
        )
        .join("\n")
}

Fait pour servir et valoir ce que de droit,
Le Commissaire aux Comptes
`.trim();

  return {
    societeRaisonSociale,
    exercice,
    nombreConventionsTotales: conventions.length,
    nombreConventionsInterdites: interdites.length,
    conventionsAutorisees: autorisees,
    conventionsNonAutorisees: nonAutorisees,
    conventionsInterdites: interdites,
    avisGeneralCAC: avisCAC,
    texteIntegralRapportSpecial: texteIntegral,
    alertesPenales,
  };
}
