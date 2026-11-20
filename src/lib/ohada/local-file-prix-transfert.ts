/**
 * Module Local File des Prix de Transfert & CbCR Dématérialisé
 * Conforme aux lois de finances récentes de l'espace UEMOA (Sénégal Art. 31 ter CGI, Côte d'Ivoire Art. 38 CGI)
 * et aux Principes applicables en matière de prix de transfert de l'OCDE.
 */

export type NatureFluxIntragroupe =
  | "MANAGEMENT_FEES"
  | "REDEVANCES_MARQUES"
  | "ASSISTANCE_TECHNIQUE_IT"
  | "PRET_INTRAGROUPE"
  | "VENTE_MARCHANDISES"
  | "ACHAT_INTRANTS";

export type MethodePrixTransfert =
  | "PRIX_COMPARABLE_CUP"
  | "COUT_MAJORE"
  | "PRIX_DE_REVENTE"
  | "MARGE_NETTE_TNMM"
  | "PARTAGE_BENEFICES";

export interface TransactionIntragroupeDetaillee {
  id: string;
  entiteLieeNom: string;
  paysResidenceLiee: string;
  lienCapital_pct: number; // Ex: 100% filiale, 51% mère
  natureFlux: NatureFluxIntragroupe;
  montantAnnuel_XOF: number;
  methodeRetenue: MethodePrixTransfert;
  tauxInteretApplique_pct?: number; // Si prêt
  cleRepartition?: string; // Si management fees
  substanceEconomiqueVerifiee: boolean;
  contratEcritExistant: boolean;
  documentationBenchmarkingDisponible: boolean;
}

export interface EntiteDeclarantePT {
  raisonSociale: string;
  ninea_niu: string;
  pays: string;
  exercice: number;
  chiffreAffaires_XOF: number;
  fraisGeneraux_XOF: number;
  tauxBceaoReference_pct: number; // Taux de référence BCEAO (ex: 5.5%)
  transactions: TransactionIntragroupeDetaillee[];
}

export interface AnalyseTransactionPT {
  transaction: TransactionIntragroupeDetaillee;
  conformePlafondLegal: boolean;
  plafondMaximalAdmis_XOF: number;
  montantExcedentaireReintegrable_XOF: number;
  risqueRappelIS_XOF: number; // 30% du surplus
  risqueBrs_XOF: number; // Retenue à la source (5% ou 20%)
  observationsLegales: string;
}

export interface DossierLocalFilePT {
  entite: EntiteDeclarantePT;
  totalFluxIntragroupe_XOF: number;
  totalExcedentReintegrable_XOF: number;
  expositionFiscaleTotale_XOF: number;
  analyses: AnalyseTransactionPT[];
  tauxConformiteGlobal_pct: number;
  avisDossier: "CONFORME" | "RISQUE_MODERE" | "RISQUE_CRITIQUE_REDRESSEMENT";
  texteIntegralLocalFile: string;
  recommandationsPrioritaires: string[];
}

export function analyserTransactionIntragroupe(
  t: TransactionIntragroupeDetaillee,
  entite: EntiteDeclarantePT
): AnalyseTransactionPT {
  let plafond = Infinity;
  let excedent = 0;
  let obs = "";

  const ca = entite.chiffreAffaires_XOF;
  const fg = entite.fraisGeneraux_XOF;
  const tauxIS = 0.30;
  let tauxBrs = 0.05; // 5% standard UEMOA pour prestations étrangères

  if (t.natureFlux === "MANAGEMENT_FEES") {
    // Plafond fiscal légal : max 5% du CA ou 20% des frais généraux
    const plafondCa = Math.round(ca * 0.05);
    const plafondFg = Math.round(fg * 0.20);
    plafond = Math.min(plafondCa, plafondFg);
    if (t.montantAnnuel_XOF > plafond) {
      excedent = t.montantAnnuel_XOF - plafond;
      obs = `Dépassement du plafond légal de management fees (5% CA / 20% FG). Surplus non déductible : ${excedent.toLocaleString("fr-FR")} XOF.`;
    } else {
      obs = "Montant conforme aux ratios plafonds légaux de l'espace UEMOA.";
    }
  } else if (t.natureFlux === "REDEVANCES_MARQUES") {
    // Plafond de 4% du CA
    plafond = Math.round(ca * 0.04);
    if (t.montantAnnuel_XOF > plafond) {
      excedent = t.montantAnnuel_XOF - plafond;
      obs = `Redevances de marques excédant le plafond de 4% du CA de ${excedent.toLocaleString("fr-FR")} XOF.`;
    } else {
      obs = "Redevances dans les limites conventionnelles admises.";
    }
  } else if (t.natureFlux === "PRET_INTRAGROUPE") {
    // Taux max légal = Taux BCEAO + 2 points
    const tauxMaxLegal = entite.tauxBceaoReference_pct + 2.0;
    const tauxApplique = t.tauxInteretApplique_pct ?? 0;
    if (tauxApplique > tauxMaxLegal) {
      const ecartTaux = (tauxApplique - tauxMaxLegal) / 100;
      excedent = Math.round(t.montantAnnuel_XOF * ecartTaux);
      obs = `Taux d'intérêt de prêt intra-groupe (${tauxApplique}%) excédant le plafond légal BCEAO+2% (${tauxMaxLegal}%). Surplus d'intérêts : ${excedent.toLocaleString("fr-FR")} XOF.`;
    } else {
      obs = `Taux d'intérêt conforme au plafond légal de pleine concurrence (BCEAO + 2% = ${tauxMaxLegal}%).`;
    }
  } else {
    // Autres prestations : contrôle de substance et de contrat écrit
    if (!t.substanceEconomiqueVerifiee || !t.contratEcritExistant) {
      excedent = t.montantAnnuel_XOF;
      obs = "Défaut de contrat probant ou de preuve matérielle du service rendu. Risque de rejet total de la charge.";
    } else {
      obs = "Prestation documentée avec contrat formel et livrables archivés.";
    }
  }

  // Si paradis fiscal supposé
  if (["AE", "VG", "KY", "PA"].includes(t.paysResidenceLiee)) {
    tauxBrs = 0.20;
    obs += " Attention : pays à fiscalité privilégiée (taux BRS majoré à 20%).";
  }

  const rappelIS = Math.round(excedent * tauxIS);
  const rappelBrs = Math.round(excedent * tauxBrs);

  return {
    transaction: t,
    conformePlafondLegal: excedent === 0,
    plafondMaximalAdmis_XOF: plafond,
    montantExcedentaireReintegrable_XOF: excedent,
    risqueRappelIS_XOF: rappelIS,
    risqueBrs_XOF: rappelBrs,
    observationsLegales: obs,
  };
}

export function genererDossierLocalFilePT(entite: EntiteDeclarantePT): DossierLocalFilePT {
  const analyses = entite.transactions.map((t) =>
    analyserTransactionIntragroupe(t, entite)
  );

  const totalFlux = entite.transactions.reduce((acc, t) => acc + t.montantAnnuel_XOF, 0);
  const totalExcedent = analyses.reduce((acc, a) => acc + a.montantExcedentaireReintegrable_XOF, 0);
  const totalExposition = analyses.reduce(
    (acc, a) => acc + a.risqueRappelIS_XOF + a.risqueBrs_XOF,
    0
  );

  const nbConformes = analyses.filter((a) => a.conformePlafondLegal).length;
  const tauxConformite =
    entite.transactions.length > 0
      ? Math.round((nbConformes / entite.transactions.length) * 100)
      : 100;

  let avis: DossierLocalFilePT["avisDossier"] = "CONFORME";
  if (tauxConformite < 50 || totalExposition > 50_000_000) {
    avis = "RISQUE_CRITIQUE_REDRESSEMENT";
  } else if (tauxConformite < 80) {
    avis = "RISQUE_MODERE";
  }

  const recommandations: string[] = [];
  if (totalExcedent > 0) {
    recommandations.push(
      `Procéder à la réintégration extra-comptable spontanée de ${totalExcedent.toLocaleString("fr-FR")} XOF sur le tableau 13 de la liasse pour neutraliser les pénalités pour manquement délibéré.`
    );
  }
  if (analyses.some((a) => !a.transaction.contratEcritExistant)) {
    recommandations.push("Formaliser immédiatement des conventions de prestations de services écrites avec clauses d'indexation conformes aux principes OCDE.");
  }
  if (analyses.some((a) => !a.transaction.documentationBenchmarkingDisponible)) {
    recommandations.push("Réaliser une étude économique de comparables (Benchmarking de marge opérationnelle) pour sécuriser la méthode de prix de transfert.");
  }

  const texteIntegral = `
DOCUMENTATION DES PRIX DE TRANSFERT — FICHIER LOCAL (LOCAL FILE)
CONFORME À L'ARTICLE 31 TER DU CGI & PRINCIPES OCDE
EXERCICE CLOS LE 31 DÉCEMBRE ${entite.exercice}

ENTITÉ DÉCLARANTE :
Raison Sociale : ${entite.raisonSociale}
Identifiant Fiscal (NINEA/NIU) : ${entite.ninea_niu}
Pays de Résidence Fiscale : ${entite.pays}
Chiffre d'Affaires de l'Exercice : ${entite.chiffreAffaires_XOF.toLocaleString("fr-FR")} XOF

I. DESCRIPTION DES TRANSACTIONS INTRA-GROUPE CONTRÔLÉES
Nombre total de flux recensés : ${entite.transactions.length}
Montant global des flux intra-groupe : ${totalFlux.toLocaleString("fr-FR")} XOF

${analyses
  .map(
    (a, idx) => `
Transaction #${idx + 1} : ${a.transaction.natureFlux} avec ${a.transaction.entiteLieeNom} (${a.transaction.paysResidenceLiee})
- Montant annuel : ${a.transaction.montantAnnuel_XOF.toLocaleString("fr-FR")} XOF
- Méthode de pleine concurrence retenue : ${a.transaction.methodeRetenue}
- Statut de conformité : ${a.conformePlafondLegal ? "CONFORME" : "NON CONFORME (Excédent de " + a.montantExcedentaireReintegrable_XOF.toLocaleString("fr-FR") + " XOF)"}
- Analyse : ${a.observationsLegales}
`
  )
  .join("\n")}

II. SYNTHÈSE DE L'EXPOSITION FISCALE
- Base de redressement potentiel en cas de contrôle : ${totalExcedent.toLocaleString("fr-FR")} XOF
- Rappel d'Impôt sur les Sociétés estimé (30%) : ${analyses.reduce((acc, a) => acc + a.risqueRappelIS_XOF, 0).toLocaleString("fr-FR")} XOF
- Rappel de Retenue à la Source (BRS) estimé : ${analyses.reduce((acc, a) => acc + a.risqueBrs_XOF, 0).toLocaleString("fr-FR")} XOF
- Exposition globale de l'entreprise : ${totalExposition.toLocaleString("fr-FR")} XOF

III. CONCLUSION ET ATTESTATION DU DIRECTEUR FINANCIER / FISCALISTE
La présente documentation constitue le Fichier Local légal exigé par l'Administration Fiscale au titre de l'exercice ${entite.exercice}.
Avis de conformité globale : ${avis}.
`.trim();

  return {
    entite,
    totalFluxIntragroupe_XOF: totalFlux,
    totalExcedentReintegrable_XOF: totalExcedent,
    expositionFiscaleTotale_XOF: totalExposition,
    analyses,
    tauxConformiteGlobal_pct: tauxConformite,
    avisDossier: avis,
    texteIntegralLocalFile: texteIntegral,
    recommandationsPrioritaires: recommandations,
  };
}
