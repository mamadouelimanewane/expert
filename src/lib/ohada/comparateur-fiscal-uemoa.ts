/**
 * Comparateur de Pression Fiscale Sectorielle UEMOA & CEMAC
 * Analyse comparative des régimes d'Impôt sur les Sociétés (IS),
 * de l'Impôt Minimum Forfaitaire (IMF), et des retenues à la source sur dividendes.
 */

export type SecteurActivite = "SERVICES" | "COMMERCE" | "INDUSTRIE" | "MINES_ENERGIE" | "BTP";

export interface ParametresPaysFiscal {
  code: string;
  nom: string;
  zone: "UEMOA" | "CEMAC";
  tauxIsStandard: number; // Ex: 0.30 pour 30%
  tauxIsIndustrie?: number;
  tauxImf: number; // Ex: 0.005 pour 0.5%
  plancherImf_XOF: number;
  plafondImf_XOF: number;
  tauxRetenueDividendes: number; // Ex: 0.10 pour 10%
  tauxTvaStandard: number;
  notesSpecifiques: string;
}

export const REFERENTIEL_FISCAL_PAYS: Record<string, ParametresPaysFiscal> = {
  SN: {
    code: "SN",
    nom: "Sénégal",
    zone: "UEMOA",
    tauxIsStandard: 0.30,
    tauxIsIndustrie: 0.30,
    tauxImf: 0.005,
    plancherImf_XOF: 500_000,
    plafondImf_XOF: 20_000_000,
    tauxRetenueDividendes: 0.10,
    tauxTvaStandard: 0.18,
    notesSpecifiques: "IS à 30%, IMF 0.5% plafonné à 20M XOF. Retenue dividendes à 10%.",
  },
  CI: {
    code: "CI",
    nom: "Côte d'Ivoire",
    zone: "UEMOA",
    tauxIsStandard: 0.25,
    tauxIsIndustrie: 0.25,
    tauxImf: 0.005,
    plancherImf_XOF: 3_000_000,
    plafondImf_XOF: 35_000_000,
    tauxRetenueDividendes: 0.15,
    tauxTvaStandard: 0.18,
    notesSpecifiques: "IS très compétitif à 25%, IMF plancher 3M XOF. IRVM dividendes 15%.",
  },
  BJ: {
    code: "BJ",
    nom: "Bénin",
    zone: "UEMOA",
    tauxIsStandard: 0.30,
    tauxIsIndustrie: 0.25,
    tauxImf: 0.0075,
    plancherImf_XOF: 250_000,
    plafondImf_XOF: 15_000_000,
    tauxRetenueDividendes: 0.10,
    tauxTvaStandard: 0.18,
    notesSpecifiques: "Taux réduit de 25% pour l'industrie. Retenue dividendes standard 10%.",
  },
  TG: {
    code: "TG",
    nom: "Togo",
    zone: "UEMOA",
    tauxIsStandard: 0.27,
    tauxIsIndustrie: 0.27,
    tauxImf: 0.01,
    plancherImf_XOF: 200_000,
    plafondImf_XOF: 20_000_000,
    tauxRetenueDividendes: 0.13,
    tauxTvaStandard: 0.18,
    notesSpecifiques: "Taux IS intermédiaire à 27%. IMF standard 1%.",
  },
  BF: {
    code: "BF",
    nom: "Burkina Faso",
    zone: "UEMOA",
    tauxIsStandard: 0.275,
    tauxIsIndustrie: 0.275,
    tauxImf: 0.005,
    plancherImf_XOF: 300_000,
    plafondImf_XOF: 10_000_000,
    tauxRetenueDividendes: 0.125,
    tauxTvaStandard: 0.18,
    notesSpecifiques: "IS à 27.5%, IMF 0.5% plafonné à 10M XOF. IRVM dividendes 12.5%.",
  },
  ML: {
    code: "ML",
    nom: "Mali",
    zone: "UEMOA",
    tauxIsStandard: 0.30,
    tauxIsIndustrie: 0.30,
    tauxImf: 0.0075,
    plancherImf_XOF: 500_000,
    plafondImf_XOF: 15_000_000,
    tauxRetenueDividendes: 0.10,
    tauxTvaStandard: 0.18,
    notesSpecifiques: "IS à 30%, IMF 0.75%. Retenue dividendes 10%.",
  },
  CM: {
    code: "CM",
    nom: "Cameroun",
    zone: "CEMAC",
    tauxIsStandard: 0.33, // 30% + 10% CAC = 33%
    tauxIsIndustrie: 0.33,
    tauxImf: 0.022, // 2% + CAC = 2.2%
    plancherImf_XOF: 1_000_000,
    plafondImf_XOF: 50_000_000,
    tauxRetenueDividendes: 0.165, // 15% + CAC = 16.5%
    tauxTvaStandard: 0.1925,
    notesSpecifiques: "Zone CEMAC : IS 30% + centimes additionnels communaux (10%) = 33% effectif. Précompte/acompte 2.2%.",
  },
};

export interface InputComparateurFiscal {
  chiffreAffaires_XOF: number;
  resultatFiscal_XOF: number;
  secteur: SecteurActivite;
  tauxDistributionDividendes_pct?: number; // Défaut 50%
}

export interface SimulationPaysFiscal {
  code: string;
  nom: string;
  zone: "UEMOA" | "CEMAC";
  tauxIsApplicable: number;
  montantIsTheorique_XOF: number;
  montantImf_XOF: number;
  impotSocieteDu_XOF: number; // max(IS, IMF)
  regimeApplique: "IS" | "IMF";
  dividendesNetsDistribues_XOF: number;
  retenueDividendes_XOF: number;
  totalPrelevementsDirects_XOF: number; // IS dû + Retenue dividendes
  tauxEffectifImposition_pct: number; // totalPrelevements / resultatFiscal (ou CA si déficit)
  rangCompetitivite: number;
}

export interface ResultatComparateurFiscal {
  classement: SimulationPaysFiscal[];
  meilleurPays: SimulationPaysFiscal;
  paysPlusCouteux: SimulationPaysFiscal;
  economieFiscaleMax_XOF: number;
  recommandations: string[];
}

export function calculerFiscalitePays(
  pays: ParametresPaysFiscal,
  input: InputComparateurFiscal
): Omit<SimulationPaysFiscal, "rangCompetitivite"> {
  const { chiffreAffaires_XOF, resultatFiscal_XOF, secteur } = input;
  const tauxDistrib = (input.tauxDistributionDividendes_pct ?? 50) / 100;

  // Taux IS selon secteur
  const tauxIs =
    secteur === "INDUSTRIE" && pays.tauxIsIndustrie ? pays.tauxIsIndustrie : pays.tauxIsStandard;

  // Calcul IS
  const isTheorique = resultatFiscal_XOF > 0 ? Math.round(resultatFiscal_XOF * tauxIs) : 0;

  // Calcul IMF
  let imfCalcule = Math.round(chiffreAffaires_XOF * pays.tauxImf);
  if (imfCalcule < pays.plancherImf_XOF) imfCalcule = pays.plancherImf_XOF;
  if (imfCalcule > pays.plafondImf_XOF) imfCalcule = pays.plafondImf_XOF;

  // L'impôt dû est le plus élevé entre IS et IMF
  const impotSocieteDu = Math.max(isTheorique, imfCalcule);
  const regimeApplique = isTheorique >= imfCalcule ? "IS" : "IMF";

  // Bénéfice net après IS disponible pour distribution
  const beneficeNet = Math.max(0, resultatFiscal_XOF - impotSocieteDu);
  const dividendesBruts = Math.round(beneficeNet * tauxDistrib);
  const retenueDividendes = Math.round(dividendesBruts * pays.tauxRetenueDividendes);
  const dividendesNets = dividendesBruts - retenueDividendes;

  const totalPrelevements = impotSocieteDu + retenueDividendes;

  // Taux effectif
  const baseTaux = resultatFiscal_XOF > 0 ? resultatFiscal_XOF : Math.max(1, chiffreAffaires_XOF);
  const tauxEffectif = Number(((totalPrelevements / baseTaux) * 100).toFixed(2));

  return {
    code: pays.code,
    nom: pays.nom,
    zone: pays.zone,
    tauxIsApplicable: tauxIs,
    montantIsTheorique_XOF: isTheorique,
    montantImf_XOF: imfCalcule,
    impotSocieteDu_XOF: impotSocieteDu,
    regimeApplique,
    dividendesNetsDistribues_XOF: dividendesNets,
    retenueDividendes_XOF: retenueDividendes,
    totalPrelevementsDirects_XOF: totalPrelevements,
    tauxEffectifImposition_pct: tauxEffectif,
  };
}

export function comparerFiscaliteRegionale(input: InputComparateurFiscal): ResultatComparateurFiscal {
  const codes = Object.keys(REFERENTIEL_FISCAL_PAYS);
  const simulations = codes.map((c) =>
    calculerFiscalitePays(REFERENTIEL_FISCAL_PAYS[c], input)
  );

  // Tri par total de prélèvements directs croissant (le moins cher en premier)
  simulations.sort((a, b) => a.totalPrelevementsDirects_XOF - b.totalPrelevementsDirects_XOF);

  const classement: SimulationPaysFiscal[] = simulations.map((s, idx) => ({
    ...s,
    rangCompetitivite: idx + 1,
  }));

  const meilleurPays = classement[0];
  const paysPlusCouteux = classement[classement.length - 1];
  const economieFiscaleMax =
    paysPlusCouteux.totalPrelevementsDirects_XOF - meilleurPays.totalPrelevementsDirects_XOF;

  const recommandations: string[] = [
    `Pour un résultat fiscal de ${input.resultatFiscal_XOF.toLocaleString(
      "fr-FR"
    )} XOF, ${meilleurPays.nom} offre la pression fiscale directe la plus faible (${meilleurPays.totalPrelevementsDirects_XOF.toLocaleString(
      "fr-FR"
    )} XOF, soit un taux effectif global de ${meilleurPays.tauxEffectifImposition_pct}%).`,
    `L'écart avec la juridiction la plus exigeante (${paysPlusCouteux.nom}) s'élève à ${economieFiscaleMax.toLocaleString(
      "fr-FR"
    )} XOF d'économies annuelles potentielles.`,
  ];

  if (input.secteur === "INDUSTRIE") {
    recommandations.push(
      "Dans le secteur industriel, le Bénin et la Côte d'Ivoire offrent des taux d'IS préférentiels à 25% très compétitifs."
    );
  }
  if (input.resultatFiscal_XOF <= 0) {
    recommandations.push(
      "En situation déficitaire, l'Impôt Minimum Forfaitaire (IMF) s'applique obligatoirement : comparer les plafonds maximaux de l'IMF entre États membres."
    );
  }

  return {
    classement,
    meilleurPays,
    paysPlusCouteux,
    economieFiscaleMax_XOF: economieFiscaleMax,
    recommandations,
  };
}
