// ─────────────────────────────────────────────────────────────────────────────
// Module Missions – Sizing Prédictif d'Honoraires & Sentinelle Budgétaire Boni/Mali
// Dimensionnement automatique à partir de la balance et alerte précoce de dérive
// ─────────────────────────────────────────────────────────────────────────────

export interface MetriquesDossierSizing {
  chiffreAffairesAnnuel: number;
  nombreEcrituresAnnuelles: number; // estimation ou comptage Grand Livre
  nombreComptesTiersActifs: number; // clients (411) + fournisseurs (401)
  nombreLignesImmobilisations: number; // classe 2
  nombreSalariesMensuel: number;
  complexiteFiscale: "STANDARD" | "INTERMEDIAIRE" | "COMPLEXE"; // ex: BRS, zones franches, opérations internationales
  typeMission: "TENUE_COMPTABLE" | "SURVEILLANCE_REVISION" | "COMMISSARIAT_AUX_COMPTES" | "AUDIT_CONTRACTUEL";
}

export interface TauxHorairesCabinet {
  tauxAssocie: number; // ex: 75 000 FCFA/h
  tauxManager: number; // ex: 45 000 FCFA/h
  tauxSenior: number; // ex: 25 000 FCFA/h
  tauxAssistant: number; // ex: 15 000 FCFA/h
}

export interface SizingMissionResult {
  heuresTotalesRecommandees: number;
  repartitionHeures: {
    associe: number;
    manager: number;
    senior: number;
    assistant: number;
  };
  coutDeRevientEstime: number;
  honorairesRecommandesHT: number;
  honorairesMensuelsHT: number;
  justificationMetriques: string[];
}

export interface DonneesSuiviMission {
  heuresBudgetees: number;
  heuresPasseesADate: number;
  avancementTravauxPourcentage: number; // 0 à 100%
  honorairesSignesHT: number;
  tauxHoraireMoyenCabinet: number;
}

export interface SentinelleBoniMaliResult {
  heuresAtterrissageProjettées: number;
  ecartHeuresFinal: number; // positif = dépassement (mali), négatif = économie (boni)
  impactFinancierFCFA: number;
  statutAlerte: "SOUS_CONTROLE" | "VIGILANCE_DERIVE" | "MALI_CRITIQUE";
  recommandationAction: string;
  projetAvenantLettreMission?: string;
}

const TAUX_DEFAUT: TauxHorairesCabinet = {
  tauxAssocie: 75_000,
  tauxManager: 45_000,
  tauxSenior: 25_000,
  tauxAssistant: 15_000,
};

/**
 * Calcule le dimensionnement horaire et tarifaire optimal d'une mission.
 */
export function calculerSizingMission(
  metriques: MetriquesDossierSizing,
  taux: TauxHorairesCabinet = TAUX_DEFAUT
): SizingMissionResult {
  let heuresBase = 0;

  // 1. Base selon le type de mission et le volume d'écritures
  if (metriques.typeMission === "TENUE_COMPTABLE") {
    // 1 heure pour 50 écritures en tenue
    heuresBase += Math.ceil(metriques.nombreEcrituresAnnuelles / 50);
  } else if (metriques.typeMission === "SURVEILLANCE_REVISION") {
    // 1 heure pour 150 écritures en révision
    heuresBase += Math.ceil(metriques.nombreEcrituresAnnuelles / 150);
  } else {
    // Audit / CAC : barème légal OHADA indexé sur le bilan/CA (base forfaitaire minimale de 60h)
    heuresBase += Math.max(60, Math.ceil(metriques.chiffreAffairesAnnuel / 50_000_000) * 10);
  }

  // 2. Complexité des tiers (lettrage, relances, circularisations)
  heuresBase += Math.ceil(metriques.nombreComptesTiersActifs * 0.4);

  // 3. Immobilisations (inventaire, amortissements)
  heuresBase += Math.ceil(metriques.nombreLignesImmobilisations * 0.3);

  // 4. Paie et déclarations sociales
  heuresBase += Math.ceil(metriques.nombreSalariesMensuel * 1.5 * 12 / 10);

  // 5. Coefficient de complexité fiscale
  const coeffFiscal =
    metriques.complexiteFiscale === "COMPLEXE" ? 1.3 : metriques.complexiteFiscale === "INTERMEDIAIRE" ? 1.15 : 1.0;

  const heuresTotales = Math.max(20, Math.round(heuresBase * coeffFiscal));

  // Répartition des profils :
  // Associé : 5% | Manager : 15% | Senior : 35% | Assistant : 45%
  const hAssocie = Math.max(1, Math.round(heuresTotales * 0.05));
  const hManager = Math.max(2, Math.round(heuresTotales * 0.15));
  const hSenior = Math.round(heuresTotales * 0.35);
  const hAssistant = Math.max(0, heuresTotales - (hAssocie + hManager + hSenior));

  const coutDeRevient =
    hAssocie * taux.tauxAssocie +
    hManager * taux.tauxManager +
    hSenior * taux.tauxSenior +
    hAssistant * taux.tauxAssistant;

  // Marge cible du cabinet : 35% de marge brute
  const honorairesRecommandesHT = Math.round(coutDeRevient * 1.35);
  const honorairesMensuelsHT = Math.round(honorairesRecommandesHT / 12);

  const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

  const justificationMetriques = [
    `Volume d'écritures : ${metriques.nombreEcrituresAnnuelles} lignes comptables annuelles`,
    `Portefeuille tiers : ${metriques.nombreComptesTiersActifs} comptes actifs suivis`,
    `Parc immobilisations : ${metriques.nombreLignesImmobilisations} lignes d'actifs amortissables`,
    `Gestion sociale : ${metriques.nombreSalariesMensuel} salariés mensualisés`,
    `Indice de complexité : coefficient ${coeffFiscal} appliqué`,
  ];

  return {
    heuresTotalesRecommandees: heuresTotales,
    repartitionHeures: {
      associe: hAssocie,
      manager: hManager,
      senior: hSenior,
      assistant: hAssistant,
    },
    coutDeRevientEstime: coutDeRevient,
    honorairesRecommandesHT,
    honorairesMensuelsHT,
    justificationMetriques,
  };
}

/**
 * Sentinelle Boni/Mali : Détecte en temps réel les dérives de temps et prépare un avenant d'honoraires.
 */
export function evaluerSentinelleBoniMali(donnees: DonneesSuiviMission): SentinelleBoniMaliResult {
  const avancement = Math.max(1, donnees.avancementTravauxPourcentage);

  // Projection de l'atterrissage final : Heures consommées / (% avancement / 100)
  const heuresProjettées = Math.round((donnees.heuresPasseesADate / (avancement / 100)));
  const ecartHeuresFinal = heuresProjettées - donnees.heuresBudgetees;
  const impactFinancierFCFA = Math.round(ecartHeuresFinal * donnees.tauxHoraireMoyenCabinet);

  let statutAlerte: SentinelleBoniMaliResult["statutAlerte"] = "SOUS_CONTROLE";
  let recommandationAction = "La mission se déroule dans l'enveloppe budgétaire prévue.";
  let projetAvenantLettreMission: string | undefined = undefined;

  const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

  if (ecartHeuresFinal > donnees.heuresBudgetees * 0.25) {
    statutAlerte = "MALI_CRITIQUE";
    recommandationAction = `Dérive majeure constatée (+${ecartHeuresFinal} heures). Risque de mali de ${f(impactFinancierFCFA)}. Émettre immédiatement un avenant d'honoraires pour travaux complémentaires.`;

    projetAvenantLettreMission = `PROPOSITION D'AVENANT À LA LETTRE DE MISSION
RÉF : AV-${new Date().getFullYear()}-01

Cher Client,

Dans le cadre de notre mission de révision et supervision de vos comptes, nous constatons que les diligences requises ont excédé de manière significative le volume initialement convenu, en raison de travaux complémentaires non prévisibles (régularisations d'exercices antérieurs, complexité des rapprochements de trésorerie).

- Heures initialement prévues : ${donnees.heuresBudgetees} h
- Volume réel projeté : ${heuresProjettées} h (soit un dépassement de ${ecartHeuresFinal} h)
- Complément d'honoraires proposé : ${f(impactFinancierFCFA)} HT

Nous vous remercions de bien vouloir nous retourner le présent avenant signé afin de poursuivre les travaux dans les meilleures conditions.

Fait pour valoir ce que de droit.
L'Expert-Comptable Associé`;
  } else if (ecartHeuresFinal > donnees.heuresBudgetees * 0.1) {
    statutAlerte = "VIGILANCE_DERIVE";
    recommandationAction = `Léger dépassement prévisionnel (+${ecartHeuresFinal} h). Alerter le chef de mission pour réajuster la charge des assistants.`;
  } else if (ecartHeuresFinal < 0) {
    recommandationAction = `Boni d'heures prévisionnel de ${Math.abs(ecartHeuresFinal)} h (${f(Math.abs(impactFinancierFCFA))}). Excellente efficience sur le dossier.`;
  }

  return {
    heuresAtterrissageProjettées: heuresProjettées,
    ecartHeuresFinal,
    impactFinancierFCFA,
    statutAlerte,
    recommandationAction,
    projetAvenantLettreMission,
  };
}
