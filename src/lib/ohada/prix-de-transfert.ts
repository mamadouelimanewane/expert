// ─────────────────────────────────────────────────────────────────────────────
// Module Prix de Transfert & Management Fees Intragroupe — Espace OHADA / UEMOA
// Conforme aux directives OCDE, Directives UEMOA et CGI Nationaux (SN, CI, CM)
// ─────────────────────────────────────────────────────────────────────────────

export type TypeFluxIntragroupe =
  | "MANAGEMENT_FEES"              // Frais de direction générale, RH, juridique
  | "REDEVANCES_MARQUES_BREVETS"   // Royalties de propriété intellectuelle
  | "ASSISTANCE_TECHNIQUE_IT"      // Support applicatif, serveurs, ingénierie
  | "ACHATS_VENTES_MARCHANDISES"   // Flux de biens avec centrale d'achats
  | "INTERETS_COMPTE_COURANT";     // Prêts et avances de trésorerie intragroupe

export type MethodePrixTransfert =
  | "TNMM"                         // Transactional Net Margin Method (Marge nette)
  | "COST_PLUS"                    // Coût majoré (Markup standard 5-10%)
  | "RESALE_PRICE"                 // Prix de revente
  | "CUP";                         // Comparable Uncontrolled Price

export interface FluxIntragroupe {
  id: string;
  typeFlux: TypeFluxIntragroupe;
  entiteEmettrice: string;         // Ex: "Holding Europe SAS (France)"
  entiteBeneficiaire: string;      // Ex: "Filiale Dakar SA (Sénégal)"
  paysPartenaire: string;          // Code pays partenaire (ex: "FR", "US", "CI")
  montantFactureAnnuel: number;    // FCFA
  methodeUtilisee: MethodePrixTransfert;
  margeAppliqueeTaux: number;      // % (ex: 8% pour Cost Plus)
  cleRepartition: "CHIFFRE_AFFAIRES" | "EFFECTIF" | "COUTS_DIRECTS" | "TEMPS_PASSE";
  justificatifsDisponibles: boolean; // Livrables, time-sheets, rapports d'activité
  tauxRetenueSourceApplique: number; // % (ex: 10% selon convention fiscale bilatérale)
}

export interface AnalysePrixTransfert {
  flux: FluxIntragroupe;
  conformePleineConcurrence: boolean;
  intervallePleineConcurrence: { min: number; mediane: number; max: number }; // Fourchette interquartile %
  risqueFiscalNiveau: "FAIBLE" | "MODERE" | "ELEVE" | "CRITIQUE";
  plafondDeductibiliteLegal: number; // Plafond CGI (ex: 5% ou 10% du résultat/CA)
  montantPotentiellementReintegrable: number; // Montant exposé à redressement fiscal
  estimationRedressementAvecPenalites: number; // Redressement IS (30%) + Pénalités (25-50%)
  pointsDeVigilance: string[];
  recommandationsDocumentation: string[];
}

export interface SyntheseDossierPrixTransfert {
  totalFluxIntragroupe: number;
  montantTotalExposeRisque: number;
  redressementEstimeGlobal: number;
  scoreConformiteDossier: number; // 0 à 100%
  analysesFlux: AnalysePrixTransfert[];
  sommaireLocalFile: string;
}

// Fourchettes de pleine concurrence standardisées (Panel comparables OCDE / UEMOA)
const BENCHMARK_PLEINE_CONCURRENCE: Record<
  TypeFluxIntragroupe,
  { min: number; mediane: number; max: number; plafondPctCA: number }
> = {
  MANAGEMENT_FEES: { min: 3, mediane: 5, max: 8, plafondPctCA: 0.05 }, // 5% max du CA recommandé
  REDEVANCES_MARQUES_BREVETS: { min: 2, mediane: 4, max: 6, plafondPctCA: 0.04 },
  ASSISTANCE_TECHNIQUE_IT: { min: 4, mediane: 6, max: 9, plafondPctCA: 0.06 },
  ACHATS_VENTES_MARCHANDISES: { min: 5, mediane: 10, max: 15, plafondPctCA: 0.25 },
  INTERETS_COMPTE_COURANT: { min: 4, mediane: 6.5, max: 8.5, plafondPctCA: 0.03 },
};

export function evaluerFluxIntragroupe(
  flux: FluxIntragroupe,
  chiffreAffairesBeneficiaire: number,
  resultatExploitationBeneficiaire: number,
  tauxIS = 0.30 // Taux IS standard SN/CI/CM
): AnalysePrixTransfert {
  const benchmark = BENCHMARK_PLEINE_CONCURRENCE[flux.typeFlux];
  const pointsDeVigilance: string[] = [];
  const recommandations: string[] = [];

  // 1. Contrôle de la marge appliquée par rapport à la fourchette interquartile
  const marge = flux.margeAppliqueeTaux;
  const conformePleineConcurrence = marge >= benchmark.min && marge <= benchmark.max;

  if (marge > benchmark.max) {
    pointsDeVigilance.push(
      `Marge de ${marge}% supérieure au benchmark de pleine concurrence (max ${benchmark.max}%). Risque de transfert indirect de bénéfices (Art. 17 CGI).`
    );
  } else if (marge < benchmark.min && flux.typeFlux !== "INTERETS_COMPTE_COURANT") {
    pointsDeVigilance.push(
      `Marge de ${marge}% inférieure au seuil de rémunération normale (${benchmark.min}%).`
    );
  }

  // 2. Contrôle du plafond de déductibilité fiscale
  const plafondLegal = Math.round(chiffreAffairesBeneficiaire * benchmark.plafondPctCA);
  let montantReintegrable = 0;

  if (flux.montantFactureAnnuel > plafondLegal) {
    montantReintegrable += (flux.montantFactureAnnuel - plafondLegal);
    pointsDeVigilance.push(
      `Le montant facturé (${flux.montantFactureAnnuel.toLocaleString("fr-FR")} FCFA) excède le plafond usuel de déductibilité (${plafondLegal.toLocaleString("fr-FR")} FCFA, soit ${benchmark.plafondPctCA * 100}% du CA).`
    );
  }

  // 3. Justificatifs de la réalité du service (absence de livrables = rejet total par le fisc)
  if (!flux.justificatifsDisponibles) {
    montantReintegrable = flux.montantFactureAnnuel; // Rejet total en cas d'acte anormal de gestion
    pointsDeVigilance.push(
      "DANGER ABSENCE DE PREUVES : Aucun livrable matériel ni feuille de temps documentant la réalité du service. Risque de rejet intégral de la déductibilité."
    );
  }

  // 4. Estimation du redressement fiscal avec pénalités
  // IS redressé = montantReintegrable * tauxIS (30%) + pénalité de mauvaise foi 25% + intérêts moratoires 10%
  const redressementIS = Math.round(montantReintegrable * tauxIS);
  const penalites = Math.round(redressementIS * 0.35); // 35% de majorations et intérêts
  const redressementTotal = redressementIS + penalites;

  // 5. Niveau de risque
  let risqueFiscal: AnalysePrixTransfert["risqueFiscalNiveau"] = "FAIBLE";
  if (!flux.justificatifsDisponibles) {
    risqueFiscal = "CRITIQUE";
  } else if (montantReintegrable > 0 || !conformePleineConcurrence) {
    risqueFiscal = montantReintegrable > 50_000_000 ? "ELEVE" : "MODERE";
  }

  // 6. Recommandations de documentation pour le Local File
  recommandations.push(
    `Constituer la convention d'assistance intragroupe écrite et préalable avec description détaillée des prestations.`
  );
  recommandations.push(
    `Archiver trimestriellement les livrables tangibles (comptes-rendus, notes techniques, tickets d'intervention IT).`
  );
  if (flux.cleRepartition === "CHIFFRE_AFFAIRES") {
    recommandations.push(
      `Pour la clé 'Chiffre d'Affaires', vérifier l'absence de double-emploi avec des prestations déjà rémunérées localement.`
    );
  }

  return {
    flux,
    conformePleineConcurrence,
    intervallePleineConcurrence: benchmark,
    risqueFiscalNiveau: risqueFiscal,
    plafondDeductibiliteLegal: plafondLegal,
    montantPotentiellementReintegrable: montantReintegrable,
    estimationRedressementAvecPenalites: redressementTotal,
    pointsDeVigilance,
    recommandationsDocumentation: recommandations,
  };
}

export function genererDossierPrixTransfert(
  fluxList: FluxIntragroupe[],
  chiffreAffairesBeneficiaire: number,
  resultatExploitationBeneficiaire: number
): SyntheseDossierPrixTransfert {
  const analyses = fluxList.map((f) =>
    evaluerFluxIntragroupe(f, chiffreAffairesBeneficiaire, resultatExploitationBeneficiaire)
  );

  const totalFlux = fluxList.reduce((s, f) => s + f.montantFactureAnnuel, 0);
  const totalExpose = analyses.reduce((s, a) => s + a.montantPotentiellementReintegrable, 0);
  const redressementTotal = analyses.reduce((s, a) => s + a.estimationRedressementAvecPenalites, 0);

  // Score de conformité (100 - déductions pour risques)
  let score = 100;
  for (const a of analyses) {
    if (a.risqueFiscalNiveau === "CRITIQUE") score -= 35;
    else if (a.risqueFiscalNiveau === "ELEVE") score -= 20;
    else if (a.risqueFiscalNiveau === "MODERE") score -= 10;
  }
  score = Math.max(0, Math.min(100, score));

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const sommaireLocalFile =
    `DOCUMENTATION LOCALE DES PRIX DE TRANSFERT (LOCAL FILE - DIRECTIVES UEMOA & OCDE)\n` +
    `Entité Déclarante : ${fluxList[0]?.entiteBeneficiaire || "Filiale Locale"}\n` +
    `Exercice Fiscal : Clos au 31 Décembre\n\n` +
    `1. SYNTHÈSE DES TRANSACTIONS INTRAGROUPES :\n` +
    `- Volume global des flux contrôlés : ${fmt(totalFlux)} FCFA\n` +
    `- Montant audité conforme pleine concurrence : ${fmt(totalFlux - totalExpose)} FCFA\n` +
    `- Exposition aux risques de réintégration : ${fmt(totalExpose)} FCFA\n` +
    `- Risque financier global estimé (IS + pénalités) : ${fmt(redressementTotal)} FCFA\n\n` +
    `2. ANALYSE DES MÉTHODES RETENUES :\n` +
    fluxList.map((f, i) => `  ${i + 1}. [${f.typeFlux}] Méthode ${f.methodeUtilisee} (Markup: ${f.margeAppliqueeTaux}%) - Rémunération : ${fmt(f.montantFactureAnnuel)} FCFA`).join("\n") +
    `\n\n3. CONCLUSION & ENGAGEMENTS DE DOCUMENTATION :\n` +
    `- Score de conformité du dossier documentaire : ${score}/100.\n` +
    `- Justificatifs matériels des prestations conservés conformément à l'Art. 18 du CGI pour présentation à toute réquisition de l'Administration Fiscale.`;

  return {
    totalFluxIntragroupe: totalFlux,
    montantTotalExposeRisque: totalExpose,
    redressementEstimeGlobal: redressementTotal,
    scoreConformiteDossier: score,
    analysesFlux: analyses,
    sommaireLocalFile,
  };
}
