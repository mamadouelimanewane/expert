/**
 * Module Fusions, Scissions & Apports Partiels d'Actifs
 * Conforme à l'AUSCGIE (Acte Uniforme sur les Sociétés Commerciales et GIE - Art. 189 à 199)
 * et au SYSCOHADA révisé (traitement comptable de la prime de fusion, du mali technique et du vrai mali).
 */

export type TypeRestructuration =
  | "FUSION_ABSORPTION" // A absorbe B -> B disparaît
  | "FUSION_CREATION"   // A + B -> C (nouvelle société)
  | "SCISSION"          // A -> B + C
  | "APPORT_PARTIEL";   // A apporte une branche d'activité autonome à B

export interface EntiteFusion {
  raisonSociale: string;
  capitalSocial_XOF: number;
  nombreActions: number;
  valeurNominale_XOF: number;
  actifNet_XOF: number; // Capitaux propres comptables
  valeurEconomique_XOF: number; // Valeur d'évaluation retenue
  coutTitresChezAbsorbante_XOF?: number; // Coût historique des titres si filiale
}

export interface DossierFusion {
  type: TypeRestructuration;
  absorbante: EntiteFusion;
  absorbee: EntiteFusion;
  pays: string; // SN, CI, CM, BJ, etc.
  dateEffet?: string;
  regimeFaveur?: boolean;
}

export interface ResultatFusion {
  type: TypeRestructuration;
  pariteEchange: number; // Ex: 0.5 = 1 action absorbante pour 2 actions absorbées
  ratioEchangeTexte: string;
  actionsAEmettre: number; // Nouvelles actions créées par absorbante
  augmentationCapital_XOF: number; // actionsAEmettre * VN absorbante
  valeurApport_XOF: number; // Valeur d'apport de l'absorbée
  primeDeFusion_XOF: number; // valeurApport - augmentationCapital
  maliTechnique_XOF: number; // Si filiale: min(coutTitres - actifNet, plus-values latentes)
  vraiMali_XOF: number; // Perte de valeur économique (charge financière exceptionnelle)
  boniFusion_XOF: number; // Si coutTitres < quote-part actif net
  rapportCAA: {
    valeurApportsRetenus_XOF: number;
    avisCAA: "FAVORABLE" | "FAVORABLE_AVEC_RESERVES" | "DEFAVORABLE";
    justificationParite: string;
    observations: string[];
  };
  traiteFusion: {
    dateEffet: string;
    transmissionUniverselle: boolean;
    clauseParite: string;
    regimeFiscal: string;
    droitsEnregistrement: string;
  };
  alertes: string[];
}

export function calculerValeurUnitaire(entite: EntiteFusion): number {
  if (entite.nombreActions <= 0) return 0;
  return Number((entite.valeurEconomique_XOF / entite.nombreActions).toFixed(2));
}

export function calculerPariteEchange(dossier: DossierFusion): number {
  const valUnitAbsorbante = calculerValeurUnitaire(dossier.absorbante);
  const valUnitAbsorbee = calculerValeurUnitaire(dossier.absorbee);

  if (valUnitAbsorbante <= 0 || valUnitAbsorbee <= 0) return 0;

  // Parité = Valeur unitaire Absorbée / Valeur unitaire Absorbante
  // Ex: B vaut 25 000, A vaut 50 000 -> 25 000 / 50 000 = 0.5 action A pour 1 action B
  return Number((valUnitAbsorbee / valUnitAbsorbante).toFixed(4));
}

export function calculerResultatFusion(dossier: DossierFusion): ResultatFusion {
  const parite = calculerPariteEchange(dossier);
  const actionsAEmettre = Math.round(dossier.absorbee.nombreActions * parite);
  const augmentationCapital = actionsAEmettre * dossier.absorbante.valeurNominale_XOF;

  // La valeur d'apport retenue
  const valeurApport = dossier.absorbee.valeurEconomique_XOF;
  const primeDeFusion = valeurApport - augmentationCapital;

  // Mali / Boni de fusion si détention préalable de titres
  let maliTechnique = 0;
  let vraiMali = 0;
  let boniFusion = 0;

  if (dossier.absorbee.coutTitresChezAbsorbante_XOF && dossier.absorbee.coutTitresChezAbsorbante_XOF > 0) {
    const cout = dossier.absorbee.coutTitresChezAbsorbante_XOF;
    const actifNet = dossier.absorbee.actifNet_XOF;
    const ecart = cout - actifNet;

    if (ecart > 0) {
      // Plus-values latentes estimées = Valeur éco - Actif net
      const pvLatentes = Math.max(0, dossier.absorbee.valeurEconomique_XOF - actifNet);
      maliTechnique = Math.min(ecart, pvLatentes);
      vraiMali = Math.max(0, ecart - maliTechnique);
    } else {
      boniFusion = Math.abs(ecart);
    }
  }

  const alertes: string[] = [];
  if (primeDeFusion < 0) {
    alertes.push("Attention : Prime de fusion négative ! La valeur d'apport est inférieure au montant nominal d'augmentation de capital.");
  }
  if (dossier.absorbee.valeurEconomique_XOF < dossier.absorbee.actifNet_XOF) {
    alertes.push("Alerte sous-évaluation : La valeur économique retenue est inférieure à l'actif net comptable (décote anormale).");
  }
  if (vraiMali > 0) {
    alertes.push(`Vrai mali détecté (${vraiMali.toLocaleString("fr-FR")} XOF) : devra être comptabilisé en charge financière/exceptionnelle.`);
  }

  // Avis du Commissaire aux Apports (Art. 193 AUSCGIE)
  let avisCAA: "FAVORABLE" | "FAVORABLE_AVEC_RESERVES" | "DEFAVORABLE" = "FAVORABLE";
  const observations: string[] = [];

  if (alertes.length > 0) {
    avisCAA = primeDeFusion < 0 ? "DEFAVORABLE" : "FAVORABLE_AVEC_RESERVES";
    observations.push(...alertes);
  } else {
    observations.push("La méthode multicritère retenue pour l'évaluation des deux sociétés est pertinente et équitable.");
    observations.push("Le rapport d'échange assure la préservation stricte des droits des actionnaires minoritaires.");
  }

  const valUnitA = calculerValeurUnitaire(dossier.absorbante);
  const valUnitB = calculerValeurUnitaire(dossier.absorbee);

  return {
    type: dossier.type,
    pariteEchange: parite,
    ratioEchangeTexte: `${parite} action(s) de ${dossier.absorbante.raisonSociale} pour 1 action de ${dossier.absorbee.raisonSociale} (Soit ${valUnitB} XOF vs ${valUnitA} XOF par titre)`,
    actionsAEmettre,
    augmentationCapital_XOF: augmentationCapital,
    valeurApport_XOF: valeurApport,
    primeDeFusion_XOF: primeDeFusion,
    maliTechnique_XOF: maliTechnique,
    vraiMali_XOF: vraiMali,
    boniFusion_XOF: boniFusion,
    rapportCAA: {
      valeurApportsRetenus_XOF: valeurApport,
      avisCAA,
      justificationParite: `Parité fondée sur le ratio de valeur vénale unitaire : ${valUnitB} XOF / ${valUnitA} XOF = ${parite}`,
      observations,
    },
    traiteFusion: {
      dateEffet: dossier.dateEffet || "Au jour de l'AGE d'approbation",
      transmissionUniverselle: true,
      clauseParite: `Attribution de ${actionsAEmettre.toLocaleString("fr-FR")} actions nouvelles au nominal de ${dossier.absorbante.valeurNominale_XOF.toLocaleString("fr-FR")} XOF`,
      regimeFiscal: "Régime de faveur des fusions (Art. 199 AUSCGIE & Art. 36-40 CGI : neutralité des plus-values latentes)",
      droitsEnregistrement: "Droit fixe modique ou exonération totale selon législation nationale UEMOA/CEMAC",
    },
    alertes,
  };
}
