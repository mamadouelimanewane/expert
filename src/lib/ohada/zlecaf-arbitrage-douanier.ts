/**
 * Moteur ZLECAf & Arbitrage Douanier Intra-Africain — Cabinet Expert OHADA 360
 * Calcul des Règles d'Origine (RDO), Démantèlement Tarifaire et Optimisation des Corridors
 * Inspiré de Thomson Reuters ONESOURCE Global Trade & Descartes
 */

export type CorridorLogistique =
  | "DAKAR_BAMAKO"
  | "ABIDJAN_OUAGADOUGOU"
  | "DOUALA_NDJAMENA"
  | "COTONOU_NIAMEY"
  | "LOME_OUAGADOUGOU";

export interface InputArbitrageZLECAf {
  produitDesignation: string;
  codeSH6: string; // Système Harmonisé 6 chiffres
  paysOrigine: string;
  paysDestination: string;
  corridor: CorridorLogistique;
  valeurDepartUsine_XOF: number;
  valeurMatieresImporteesHorsZone_XOF: number;
  droitDouaneStandard_pct: number; // Taux TEC standard (ex: 10% ou 20%)
  tauxDroitZLECAf_pct?: number; // Taux préférentiel ZLECAf (ex: 0% ou 4% selon calendrier)
  volumeMarchandise_tonnes: number;
  fraisTransportEstimes_XOF: number;
}

export interface AnalyseRegleOrigine {
  tauxValeurAjouteeLocale_pct: number;
  seuilExigeZLECAf_pct: number;
  estEligibleZLECAf: boolean;
  critereRetenu: string;
  motifRejetOuValidation: string;
}

export interface ComparatifDouanierZLECAf {
  montantDroitStandard_XOF: number;
  montantDroitZLECAf_XOF: number;
  prelevementsStatistiquesEtComm_XOF: number; // PCS (0.5%), Redevance statistique (1%)
  totalFiscaliteStandard_XOF: number;
  totalFiscaliteZLECAf_XOF: number;
  economieDouaniereNette_XOF: number;
  tauxGainFiscal_pct: number;
}

export interface RapportArbitrageZLECAf {
  produitDesignation: string;
  codeSH6: string;
  paysOrigine: string;
  paysDestination: string;
  corridorNom: string;
  dateSimulation: string;
  regleOrigine: AnalyseRegleOrigine;
  comparatif: ComparatifDouanierZLECAf;
  certificatOrigineRecommande: {
    numeroCertificatProvisoire: string;
    autoriteCompetente: string;
    statutEligibilite: "ELIGIBLE_PREFERENTIEL" | "NON_ELIGIBLE_REGIME_GENERAL";
    declarationOrigineTexte: string;
  };
  recommandationsCorridor: string[];
}

const NOMS_CORRIDORS: Record<CorridorLogistique, string> = {
  DAKAR_BAMAKO: "Corridor Dakar — Bamako (Sénégal ➔ Mali)",
  ABIDJAN_OUAGADOUGOU: "Corridor Abidjan — Ouagadougou (Côte d'Ivoire ➔ Burkina Faso)",
  DOUALA_NDJAMENA: "Corridor Douala — N'Djamena (Cameroun ➔ Tchad)",
  COTONOU_NIAMEY: "Corridor Cotonou — Niamey (Bénin ➔ Niger)",
  LOME_OUAGADOUGOU: "Corridor Lomé — Ouagadougou (Togo ➔ Burkina Faso)",
};

export function evaluerReglesOrigineZLECAf(
  valeurDepartUsine_XOF: number,
  valeurMatieresImporteesHorsZone_XOF: number,
  seuilExige_pct = 35
): AnalyseRegleOrigine {
  if (valeurDepartUsine_XOF <= 0) {
    return {
      tauxValeurAjouteeLocale_pct: 0,
      seuilExigeZLECAf_pct: seuilExige_pct,
      estEligibleZLECAf: false,
      critereRetenu: "Valeur Ajoutée Locale (VAL)",
      motifRejetOuValidation: "Valeur départ usine invalide ou nulle.",
    };
  }

  const valeurAjoutee = valeurDepartUsine_XOF - Math.min(valeurDepartUsine_XOF, valeurMatieresImporteesHorsZone_XOF);
  const tauxVAL = Math.round((valeurAjoutee / valeurDepartUsine_XOF) * 1000) / 10;
  const eligible = tauxVAL >= seuilExige_pct;

  return {
    tauxValeurAjouteeLocale_pct: tauxVAL,
    seuilExigeZLECAf_pct: seuilExige_pct,
    estEligibleZLECAf: eligible,
    critereRetenu: "Valeur Ajoutée Locale (Règle des 35% ZLECAf)",
    motifRejetOuValidation: eligible
      ? `Produit originaire au sens de l'Annexe 2 ZLECAf : la valeur ajoutée locale (${tauxVAL}%) dépasse le seuil minimum de ${seuilExige_pct}%.`
      : `Produit non originaire : la valeur ajoutée locale (${tauxVAL}%) est inférieure au seuil de ${seuilExige_pct}%. Les intrants hors-zone représentent une part trop élevée.`,
  };
}

export function simulerArbitrageZLECAf(input: InputArbitrageZLECAf): RapportArbitrageZLECAf {
  const regleOrigine = evaluerReglesOrigineZLECAf(
    input.valeurDepartUsine_XOF,
    input.valeurMatieresImporteesHorsZone_XOF,
    35
  );

  const tauxDroitZLECAf = regleOrigine.estEligibleZLECAf ? (input.tauxDroitZLECAf_pct ?? 0) : input.droitDouaneStandard_pct;
  const baseCafEstimee = input.valeurDepartUsine_XOF + input.fraisTransportEstimes_XOF;

  const montantDroitStandard = Math.round((baseCafEstimee * input.droitDouaneStandard_pct) / 100);
  const montantDroitZLECAf = Math.round((baseCafEstimee * tauxDroitZLECAf) / 100);

  // Prélèvements statistiques (1%) + Prélèvement communautaire CEDEAO/UEMOA (0.5%) = 1.5%
  const prelevements = Math.round((baseCafEstimee * 1.5) / 100);

  const totalFiscaliteStandard = montantDroitStandard + prelevements;
  const totalFiscaliteZLECAf = montantDroitZLECAf + prelevements;
  const economieNette = totalFiscaliteStandard - totalFiscaliteZLECAf;
  const tauxGain = totalFiscaliteStandard > 0 ? Math.round((economieNette / totalFiscaliteStandard) * 1000) / 10 : 0;

  const comparatif: ComparatifDouanierZLECAf = {
    montantDroitStandard_XOF: montantDroitStandard,
    montantDroitZLECAf_XOF: montantDroitZLECAf,
    prelevementsStatistiquesEtComm_XOF: prelevements,
    totalFiscaliteStandard_XOF: totalFiscaliteStandard,
    totalFiscaliteZLECAf_XOF: totalFiscaliteZLECAf,
    economieDouaniereNette_XOF: economieNette,
    tauxGainFiscal_pct: tauxGain,
  };

  const codeAlea = Math.floor(100000 + Math.random() * 900000);
  const codePays = input.paysOrigine.normalize("NFD").replace(/[\u0300-\u036f]/g, "").slice(0, 2).toUpperCase();
  const numCertificat = `ZLECAF-${codePays}-${new Date().getFullYear()}-${codeAlea}`;

  const certificat = {
    numeroCertificatProvisoire: numCertificat,
    autoriteCompetente: `Direction Générale des Douanes & Ministère du Commerce (${input.paysOrigine})`,
    statutEligibilite: regleOrigine.estEligibleZLECAf
      ? ("ELIGIBLE_PREFERENTIEL" as const)
      : ("NON_ELIGIBLE_REGIME_GENERAL" as const),
    declarationOrigineTexte: regleOrigine.estEligibleZLECAf
      ? `L'exportateur des marchandises couvertes par le présent document déclare que, sauf indication claire du contraire, ces marchandises répondent aux conditions d'origine préférentielle au titre de l'Accord portant création de la Zone de Libre-Échange Continentale Africaine (ZLECAf) avec une valeur ajoutée locale certifiée de ${regleOrigine.tauxValeurAjouteeLocale_pct}%.`
      : `Les marchandises ne répondent pas aux critères d'origine préférentielle ZLECAf. Application du Tarif Extérieur Commun (TEC) de droit commun.`,
  };

  const recommandations: string[] = [];
  if (regleOrigine.estEligibleZLECAf) {
    recommandations.push(
      `Gain fiscal majeur de ${economieNette.toLocaleString("fr-FR")} XOF par opération grâce à l'abattement tarifaire ZLECAf.`
    );
    recommandations.push(
      `Faire viser le certificat d'origine dématérialisé auprès de la chambre de commerce ou de l'administration des douanes avant le départ du convoi.`
    );
  } else {
    recommandations.push(
      `Pour devenir éligible, substituer au moins ${Math.round(
        input.valeurMatieresImporteesHorsZone_XOF * 0.2
      ).toLocaleString("fr-FR")} XOF d'intrants importés hors-Afrique par des matières premières sourcées dans l'espace UEMOA/CEMAC.`
    );
  }
  recommandations.push(
    `Sur le ${NOMS_CORRIDORS[input.corridor]}, anticiper le passage frontière avec le manifeste électronique sous transit douanier TRIE / TIR.`
  );

  return {
    produitDesignation: input.produitDesignation,
    codeSH6: input.codeSH6,
    paysOrigine: input.paysOrigine,
    paysDestination: input.paysDestination,
    corridorNom: NOMS_CORRIDORS[input.corridor],
    dateSimulation: new Date().toISOString().slice(0, 10),
    regleOrigine,
    comparatif,
    certificatOrigineRecommande: certificat,
    recommandationsCorridor: recommandations,
  };
}
