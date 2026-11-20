// ─────────────────────────────────────────────────────────────────────────────
// Module de Consolidation des Comptes en SYSCOHADA Révisé
// Conforme à l'AUDCIF (Art. 74 à 110 de l'Acte Uniforme OHADA - Comptes Consolidés)
// ─────────────────────────────────────────────────────────────────────────────

export type MethodeConsolidation =
  | "INTEGRATION_GLOBALE"      // Contrôle exclusif (> 50%)
  | "INTEGRATION_PROPORTIONNELLE" // Contrôle conjoint (partenariat 50/50)
  | "MISE_EN_EQUIVALENCE";     // Influence notable (>= 20%)

export interface FilialeConsolidation {
  id: string;
  raisonSociale: string;
  pays: string;
  devise: "XOF" | "XAF" | "EUR" | "USD" | "GNF";
  tauxConversionVersXOF: number; // 1 pour XOF/XAF, ~655.957 pour EUR...
  pourcentageDetention: number;  // % (ex: 80%)
  pourcentageControle: number;   // % (ex: 80%)
  methodeConsolidation: MethodeConsolidation;

  totalActifLocal: number;
  capitauxPropresLocaux: number;
  dettesLocales: number;
  chiffreAffairesLocal: number;
  resultatNetLocal: number;

  valeurTitresDansMere: number;  // Valeur comptable des titres chez la mère (FCFA)
}

export interface FluxReciproqueIntragroupe {
  id: string;
  societeA: string;
  societeB: string;
  typeFlux: "CREANCE_DETTE" | "ACHAT_VENTE" | "DIVIDENDE_INTERNE" | "MARGE_SUR_STOCK";
  montant: number; // FCFA
}

export interface BilanConsolide {
  totalActifConsolide: number;
  capitauxPropresPartDuGroupe: number;
  interetsMinoritairesCapitaux: number;
  dettesConsolidees: number;
  totalPassifConsolide: number;
  goodwillTotal: number;
}

export interface CompteResultatConsolide {
  chiffreAffairesConsolide: number;
  resultatNetConsolideTotal: number;
  partDuGroupe: number;
  partDesMinoritaires: number;
}

export interface DossierConsolidation {
  societeMere: {
    raisonSociale: string;
    totalActif: number;
    capitauxPropres: number;
    dettes: number;
    chiffreAffaires: number;
    resultatNet: number;
  };
  filiales: FilialeConsolidation[];
  operationsReciproques: FluxReciproqueIntragroupe[];
}

export interface RapportConsolidationSYSCOHADA {
  bilanConsolide: BilanConsolide;
  compteResultatConsolide: CompteResultatConsolide;
  tableauGoodwillParFiliale: { filiale: string; goodwill: number; methode: MethodeConsolidation }[];
  ecrituresElimination: { numero: number; libelle: string; montant: number }[];
  syntheseRapportAUDCIF: string;
}

export function consoliderComptesSYSCOHADA(
  dossier: DossierConsolidation
): RapportConsolidationSYSCOHADA {
  const mere = dossier.societeMere;

  // 1. Éliminations des flux réciproques
  let totalEliminationCreancesDettes = 0;
  let totalEliminationVentesInternes = 0;
  let totalEliminationDividendes = 0;
  let totalMargeSurStock = 0;

  const ecritures: { numero: number; libelle: string; montant: number }[] = [];
  let numEcriture = 1;

  for (const op of dossier.operationsReciproques) {
    if (op.typeFlux === "CREANCE_DETTE") {
      totalEliminationCreancesDettes += op.montant;
      ecritures.push({
        numero: numEcriture++,
        libelle: `Élimination créances/dettes réciproques entre ${op.societeA} et ${op.societeB}`,
        montant: op.montant,
      });
    } else if (op.typeFlux === "ACHAT_VENTE") {
      totalEliminationVentesInternes += op.montant;
      ecritures.push({
        numero: numEcriture++,
        libelle: `Élimination ventes/achats réciproques entre ${op.societeA} et ${op.societeB}`,
        montant: op.montant,
      });
    } else if (op.typeFlux === "DIVIDENDE_INTERNE") {
      totalEliminationDividendes += op.montant;
      ecritures.push({
        numero: numEcriture++,
        libelle: `Élimination dividendes intragroupes versés par ${op.societeB}`,
        montant: op.montant,
      });
    } else if (op.typeFlux === "MARGE_SUR_STOCK") {
      totalMargeSurStock += op.montant;
      ecritures.push({
        numero: numEcriture++,
        libelle: `Neutralisation marge interne non réalisée sur stocks`,
        montant: op.montant,
      });
    }
  }

  // 2. Traitement des filiales & Goodwill
  let actifFilialesConsolide = 0;
  let dettesFilialesConsolidees = 0;
  let caFilialesConsolide = 0;
  let resultatNetFilialesTotal = 0;
  let partGroupeResultatFiliales = 0;
  let partMinoritaireResultatFiliales = 0;
  let interetsMinoritairesCapitauxTotal = 0;
  let totalGoodwill = 0;
  let titresMereAEliminer = 0;

  const tableauGoodwill: { filiale: string; goodwill: number; methode: MethodeConsolidation }[] = [];

  for (const f of dossier.filiales) {
    const tx = f.tauxConversionVersXOF;
    const actifXOF = f.totalActifLocal * tx;
    const cpXOF = f.capitauxPropresLocaux * tx;
    const dettesXOF = f.dettesLocales * tx;
    const caXOF = f.chiffreAffairesLocal * tx;
    const rnXOF = f.resultatNetLocal * tx;

    const quotepartDetention = f.pourcentageDetention / 100;
    titresMereAEliminer += f.valeurTitresDansMere;

    // Calcul Goodwill = Coût Titres Mère - Quote-part de capitaux propres
    const quotePartCP = Math.round(cpXOF * quotepartDetention);
    const goodwill = Math.max(0, f.valeurTitresDansMere - quotePartCP);
    totalGoodwill += goodwill;

    tableauGoodwill.push({
      filiale: f.raisonSociale,
      goodwill,
      methode: f.methodeConsolidation,
    });

    if (f.methodeConsolidation === "INTEGRATION_GLOBALE") {
      // 100% de l'actif, des dettes et du CA
      actifFilialesConsolide += actifXOF;
      dettesFilialesConsolidees += dettesXOF;
      caFilialesConsolide += caXOF;
      resultatNetFilialesTotal += rnXOF;

      // Répartition Résultat & Capitaux Propres
      partGroupeResultatFiliales += Math.round(rnXOF * quotepartDetention);
      const partMinRN = rnXOF - Math.round(rnXOF * quotepartDetention);
      partMinoritaireResultatFiliales += partMinRN;

      // Intérêts minoritaires dans les capitaux propres
      const partMinCP = cpXOF - quotePartCP;
      interetsMinoritairesCapitauxTotal += partMinCP;

    } else if (f.methodeConsolidation === "INTEGRATION_PROPORTIONNELLE") {
      // Quote-part
      actifFilialesConsolide += Math.round(actifXOF * quotepartDetention);
      dettesFilialesConsolidees += Math.round(dettesXOF * quotepartDetention);
      caFilialesConsolide += Math.round(caXOF * quotepartDetention);
      resultatNetFilialesTotal += Math.round(rnXOF * quotepartDetention);
      partGroupeResultatFiliales += Math.round(rnXOF * quotepartDetention);

    } else if (f.methodeConsolidation === "MISE_EN_EQUIVALENCE") {
      // Actif : Seul la quote-part des titres mis en équivalence entre à l'actif
      actifFilialesConsolide += quotePartCP + goodwill;
      partGroupeResultatFiliales += Math.round(rnXOF * quotepartDetention);
      resultatNetFilialesTotal += Math.round(rnXOF * quotepartDetention);
    }
  }

  // 3. Agrégation du Bilan Consolidé
  // Actif Consolidé = Actif Mère + Actif Filiales + Goodwill - Titres Mère éliminés - Élimination créances réciproques - Marge stock
  const totalActifConsolide =
    mere.totalActif +
    actifFilialesConsolide +
    totalGoodwill -
    titresMereAEliminer -
    totalEliminationCreancesDettes -
    totalMargeSurStock;

  // Dettes Consolidées = Dettes Mère + Dettes Filiales - Élimination dettes réciproques
  const totalDettesConsolidees =
    mere.dettes + dettesFilialesConsolidees - totalEliminationCreancesDettes;

  // Capitaux Propres Part du Groupe = Capitaux Mère + Part Groupe Résultat Filiales - Dividendes internes - Marge stock
  const cpPartDuGroupe =
    mere.capitauxPropres +
    partGroupeResultatFiliales -
    totalEliminationDividendes -
    totalMargeSurStock;

  const totalPassifConsolide =
    cpPartDuGroupe + interetsMinoritairesCapitauxTotal + totalDettesConsolidees;

  // 4. Compte de Résultat Consolidé
  const caConsolide = mere.chiffreAffaires + caFilialesConsolide - totalEliminationVentesInternes;
  const resultatNetConsolide =
    mere.resultatNet +
    partGroupeResultatFiliales +
    partMinoritaireResultatFiliales -
    totalEliminationDividendes -
    totalMargeSurStock;

  const partGroupeRN =
    mere.resultatNet +
    partGroupeResultatFiliales -
    totalEliminationDividendes -
    totalMargeSurStock;

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const syntheseRapport =
    `RAPPORT SUR LES COMPTES CONSOLIDÉS SYSCOHADA (AUDCIF ART. 74 À 110)\n` +
    `Groupe : ${mere.raisonSociale} & Filiales\n` +
    `Nombre d'entités consolidées : ${dossier.filiales.length + 1}\n\n` +
    `1. BILAN CONSOLIDÉ :\n` +
    `- Total Actif Consolidé : ${fmt(totalActifConsolide)} FCFA\n` +
    `- Capitaux Propres Part du Groupe : ${fmt(cpPartDuGroupe)} FCFA\n` +
    `- Intérêts Minoritaires : ${fmt(interetsMinoritairesCapitauxTotal)} FCFA\n` +
    `- Dettes Consolidées : ${fmt(totalDettesConsolidees)} FCFA\n` +
    `- Écart d'acquisition (Goodwill consolidé) : ${fmt(totalGoodwill)} FCFA\n\n` +
    `2. COMPTE DE RÉSULTAT CONSOLIDÉ :\n` +
    `- Chiffre d'Affaires Consolidé : ${fmt(caConsolide)} FCFA\n` +
    `- Résultat Net Consolidé Global : ${fmt(resultatNetConsolide)} FCFA\n` +
    `  * Part du Groupe : ${fmt(partGroupeRN)} FCFA\n` +
    `  * Part des Minoritaires : ${fmt(partMinoritaireResultatFiliales)} FCFA\n\n` +
    `3. OPÉRATIONS RÉCIPROQUES NEUTRALISÉES :\n` +
    `- Élimination créances / dettes intragroupes : ${fmt(totalEliminationCreancesDettes)} FCFA\n` +
    `- Élimination chiffre d'affaires interne : ${fmt(totalEliminationVentesInternes)} FCFA\n` +
    `- Neutralisation dividendes intragroupes : ${fmt(totalEliminationDividendes)} FCFA`;

  return {
    bilanConsolide: {
      totalActifConsolide,
      capitauxPropresPartDuGroupe: cpPartDuGroupe,
      interetsMinoritairesCapitaux: interetsMinoritairesCapitauxTotal,
      dettesConsolidees: totalDettesConsolidees,
      totalPassifConsolide,
      goodwillTotal: totalGoodwill,
    },
    compteResultatConsolide: {
      chiffreAffairesConsolide: caConsolide,
      resultatNetConsolideTotal: resultatNetConsolide,
      partDuGroupe: partGroupeRN,
      partDesMinoritaires: partMinoritaireResultatFiliales,
    },
    tableauGoodwillParFiliale: tableauGoodwill,
    ecrituresElimination: ecritures,
    syntheseRapportAUDCIF: syntheseRapport,
  };
}
