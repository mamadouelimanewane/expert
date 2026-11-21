/**
 * Contrôleur de Légalité Statutaire & Conformité Actes Uniformes OHADA
 * Vérifie la conformité des statuts et décisions sociales selon l'AUSCGIE (Sociétés Commerciales et GIE)
 * et l'AUDCG (Droit Commercial Général) révisés.
 *
 * Règles clés vérifiées :
 * - Capital social minimum (SARL: 100 000 ou 1 000 000 FCFA selon pays, SA: 10 000 000 FCFA - Art. 311, 387)
 * - Valeur nominale minimale des actions/parts (SARL: >= 5 000 FCFA, SA: >= 10 000 FCFA)
 * - Commissaire aux comptes obligatoire (Art. 376 pour SARL, Art. 702 pour SA)
 * - Perte de plus de la moitié du capital social (Art. 664 pour SA, Art. 371 pour SARL)
 * - Révocation du gérant / dirigeant sans juste motif (Art. 326, 492)
 * - Clause léonine prohibée (Art. 54 : exclusion totale aux bénéfices ou aux pertes)
 */

export type FormeJuridiqueOHADA = "SARL" | "SAS" | "SA" | "SNC" | "GIE";

export interface StatutsSocieteInput {
  raisonSociale: string;
  formeJuridique: FormeJuridiqueOHADA;
  paysSiege: string; // "SN", "CI", "CM", etc.
  capitalSocial_XOF: number;
  valeurNominaleTitre_XOF: number;
  nombreAssocies: number;
  chiffreAffaires_XOF: number;
  effectifPermanent: number;
  totalBilan_XOF: number;
  presenceCAC: boolean;
  clauseExclusionBenefice: boolean;
  dureeSocieteAnnees: number; // max 99 ans (Art. 35)
  revocationDirigeantAdNutum: boolean;
  capitauxPropres_XOF: number;
}

export type GraviteNonConformite = "BLOQUANT_NULLITE" | "MAJEUR_SANCTION" | "AVERTISSEMENT" | "CONFORME";

export interface NonConformiteDetectee {
  code: string;
  articleAUSCGIE: string;
  intitule: string;
  description: string;
  gravite: GraviteNonConformite;
  recommandationLegalTech: string;
}

export interface RapportConformiteStatutaire {
  societeRaisonSociale: string;
  formeJuridique: FormeJuridiqueOHADA;
  conformeGlobalement: boolean;
  scoreConformite_100: number;
  nbNonConformitesBloquantes: number;
  nbNonConformitesMajeures: number;
  nbAvertissements: number;
  anomalies: NonConformiteDetectee[];
  obligationCAC: {
    obligatoire: boolean;
    motif: string;
    respecte: boolean;
  };
  situationCapitauxPropres: {
    perteSuperieureMoitieCapital: boolean;
    procedureArt664Requise: boolean;
    delaiRegularisationAns: number;
  };
  syntheseJuridique: string;
}

export function verifierConformiteStatutsOHADA(input: StatutsSocieteInput): RapportConformiteStatutaire {
  const anomalies: NonConformiteDetectee[] = [];

  // 1. Durée de la société (Art. 35 : max 99 ans)
  if (input.dureeSocieteAnnees > 99) {
    anomalies.push({
      code: "DUREE_EXCESSIVE_ART35",
      articleAUSCGIE: "Art. 35 AUSCGIE",
      intitule: "Durée statutaire supérieure au maximum légal de 99 ans",
      description: `La durée stipulée (${input.dureeSocieteAnnees} ans) excède le plafond impératif de 99 ans.`,
      gravite: "BLOQUANT_NULLITE",
      recommandationLegalTech: "Réduire statutairement la durée de la société à 99 ans maximum.",
    });
  }

  // 2. Clause léonine prohibée (Art. 54)
  if (input.clauseExclusionBenefice) {
    anomalies.push({
      code: "CLAUSE_LEONINE_ART54",
      articleAUSCGIE: "Art. 54 AUSCGIE",
      intitule: "Clause léonine prohibée réputée non écrite",
      description: "Toute stipulation attribuant la totalité du profit ou exonérant totalement des pertes est nulle.",
      gravite: "BLOQUANT_NULLITE",
      recommandationLegalTech: "Supprimer purement et simplement la clause léonine des statuts.",
    });
  }

  // 3. Capital social minimum selon la forme juridique
  if (input.formeJuridique === "SA") {
    if (input.capitalSocial_XOF < 10_000_000) {
      anomalies.push({
        code: "CAPITAL_INSUFFISANT_SA_ART387",
        articleAUSCGIE: "Art. 387 AUSCGIE",
        intitule: "Capital minimum légal de la SA non atteint (10 000 000 FCFA)",
        description: `Le capital de ${input.capitalSocial_XOF.toLocaleString("fr-FR")} FCFA est inférieur au plancher d'ordre public de 10 000 000 FCFA.`,
        gravite: "BLOQUANT_NULLITE",
        recommandationLegalTech: "Augmenter le capital à 10 000 000 FCFA minimum ou transformer la société en SARL/SAS.",
      });
    }
  } else if (input.formeJuridique === "SARL") {
    // Par défaut 1 000 000 FCFA dans l'AUSCGIE, sauf législation nationale dérogatoire
    const seuilSARL = input.paysSiege === "SN" || input.paysSiege === "CI" ? 100_000 : 1_000_000;
    if (input.capitalSocial_XOF < seuilSARL) {
      anomalies.push({
        code: "CAPITAL_INSUFFISANT_SARL_ART311",
        articleAUSCGIE: "Art. 311 AUSCGIE & Lois nationales",
        intitule: `Capital minimum légal SARL non atteint (${seuilSARL.toLocaleString("fr-FR")} FCFA)`,
        description: `Le capital de ${input.capitalSocial_XOF.toLocaleString("fr-FR")} FCFA ne respecte pas le seuil territorial de ${seuilSARL.toLocaleString("fr-FR")} FCFA.`,
        gravite: "BLOQUANT_NULLITE",
        recommandationLegalTech: `Porter le capital au minimum de ${seuilSARL.toLocaleString("fr-FR")} FCFA.`,
      });
    }
  }

  // 4. Valeur nominale minimale des titres (Art. 312 SARL >= 5 000, Art. 387 SA >= 10 000)
  if (input.formeJuridique === "SA" && input.valeurNominaleTitre_XOF < 10_000) {
    anomalies.push({
      code: "VALEUR_NOMINALE_SA_ART387",
      articleAUSCGIE: "Art. 387 AUSCGIE",
      intitule: "Valeur nominale de l'action inférieure à 10 000 FCFA",
      description: `Valeur nominale actuelle : ${input.valeurNominaleTitre_XOF} FCFA. Minimum légal : 10 000 FCFA.`,
      gravite: "MAJEUR_SANCTION",
      recommandationLegalTech: "Regrouper les actions pour fixer une valeur nominale >= 10 000 FCFA.",
    });
  } else if (input.formeJuridique === "SARL" && input.valeurNominaleTitre_XOF < 5_000) {
    anomalies.push({
      code: "VALEUR_NOMINALE_SARL_ART312",
      articleAUSCGIE: "Art. 312 AUSCGIE",
      intitule: "Valeur nominale de la part sociale inférieure à 5 000 FCFA",
      description: `Valeur nominale actuelle : ${input.valeurNominaleTitre_XOF} FCFA. Minimum légal : 5 000 FCFA.`,
      gravite: "MAJEUR_SANCTION",
      recommandationLegalTech: "Ajuster la valeur nominale des parts à 5 000 FCFA minimum.",
    });
  }

  // 5. Commissaire aux comptes obligatoire (Art. 702 pour SA, Art. 376 pour SARL)
  let cacObligatoire = false;
  let motifCAC = "Pas d'obligation légale";
  if (input.formeJuridique === "SA") {
    cacObligatoire = true;
    motifCAC = "Obligatoire de plein droit pour toute Société Anonyme (Art. 702 AUSCGIE)";
  } else if (input.formeJuridique === "SARL") {
    // SARL dépasse 2 des 3 seuils : Total bilan > 125M, CA > 250M, Effectif > 50
    let seuilsDepasses = 0;
    if (input.totalBilan_XOF > 125_000_000) seuilsDepasses++;
    if (input.chiffreAffaires_XOF > 250_000_000) seuilsDepasses++;
    if (input.effectifPermanent > 50) seuilsDepasses++;
    if (input.capitalSocial_XOF >= 10_000_000 || seuilsDepasses >= 2) {
      cacObligatoire = true;
      motifCAC = "Seuils légaux franchis (Capital >= 10M ou 2 des 3 critères Bilan/CA/Effectif - Art. 376)";
    }
  }

  if (cacObligatoire && !input.presenceCAC) {
    anomalies.push({
      code: "DEFAUT_DESIGNATION_CAC_ART702",
      articleAUSCGIE: "Art. 376 & 702 AUSCGIE (Sanction pénale Art. 899)",
      intitule: "Défaut de désignation d'un Commissaire aux Comptes titulaire",
      description: `La désignation d'un CAC est obligatoire (${motifCAC}), mais aucun CAC n'est en fonction. Sanction pénale : emprisonnement et amende.`,
      gravite: "BLOQUANT_NULLITE",
      recommandationLegalTech: "Convoquer une AG extraordinaire pour désigner un CAC inscrit à l'Ordre national (ONECCA).",
    });
  }

  // 6. Situation des capitaux propres : perte > moitié du capital (Art. 664 pour SA, Art. 371 pour SARL)
  const perteSuperieureMoitie = input.capitauxPropres_XOF < input.capitalSocial_XOF / 2;
  if (perteSuperieureMoitie) {
    anomalies.push({
      code: "CAPITAUX_PROPRES_INFERIEURS_MOITIE_ART664",
      articleAUSCGIE: input.formeJuridique === "SA" ? "Art. 664 AUSCGIE" : "Art. 371 AUSCGIE",
      intitule: "Capitaux propres inférieurs à la moitié du capital social",
      description: `Capitaux propres (${input.capitauxPropres_XOF.toLocaleString("fr-FR")} FCFA) inférieurs à la moitié du capital (${(input.capitalSocial_XOF / 2).toLocaleString("fr-FR")} FCFA). Procédure de dissolution ou reconstitution requise.`,
      gravite: "MAJEUR_SANCTION",
      recommandationLegalTech: "Convoquer l'AGE dans les 4 mois de clôture pour statuer sur la dissolution anticipée ou la reconstitution sous 2 ans.",
    });
  }

  // 7. Révocation du gérant ad nutum prohibée en SARL (Art. 326 : juste motif requis)
  if (input.formeJuridique === "SARL" && input.revocationDirigeantAdNutum) {
    anomalies.push({
      code: "REVOCATION_GERANT_SANS_MOTIF_ART326",
      articleAUSCGIE: "Art. 326 AUSCGIE",
      intitule: "Stipulation de révocation du gérant ad nutum illicite",
      description: "En SARL, le gérant ne peut être révoqué que pour juste motif. Une clause de révocation discrétionnaire ouvre droit à dommages-intérêts.",
      gravite: "AVERTISSEMENT",
      recommandationLegalTech: "Harmoniser la clause avec l'Art. 326 en prévoyant l'exigence d'un juste motif.",
    });
  }

  const nbBloquantes = anomalies.filter((a) => a.gravite === "BLOQUANT_NULLITE").length;
  const nbMajeures = anomalies.filter((a) => a.gravite === "MAJEUR_SANCTION").length;
  const nbAvertissements = anomalies.filter((a) => a.gravite === "AVERTISSEMENT").length;

  let score = 100 - nbBloquantes * 35 - nbMajeures * 15 - nbAvertissements * 5;
  score = Math.max(0, Math.min(100, score));

  const conformeGlobalement = nbBloquantes === 0 && nbMajeures === 0;

  const syntheseJuridique = conformeGlobalement
    ? `Les statuts de ${input.societeRaisonSociale} (${input.formeJuridique}) sont conformes aux dispositions impératives de l'AUSCGIE.`
    : `Alerte de conformité juridique : ${nbBloquantes} clause(s) frappée(s) de nullité absolue et ${nbMajeures} anomalie(s) majeure(s) détectées au regard de l'AUSCGIE. Une mise en conformité statutaire s'impose.`;

  return {
    societeRaisonSociale: input.societeRaisonSociale,
    formeJuridique: input.formeJuridique,
    conformeGlobalement,
    scoreConformite_100: score,
    nbNonConformitesBloquantes: nbBloquantes,
    nbNonConformitesMajeures: nbMajeures,
    nbAvertissements,
    anomalies,
    obligationCAC: {
      obligatoire: cacObligatoire,
      motif: motifCAC,
      respecte: cacObligatoire ? input.presenceCAC : true,
    },
    situationCapitauxPropres: {
      perteSuperieureMoitieCapital: perteSuperieureMoitie,
      procedureArt664Requise: perteSuperieureMoitie,
      delaiRegularisationAns: 2,
    },
    syntheseJuridique,
  };
}
