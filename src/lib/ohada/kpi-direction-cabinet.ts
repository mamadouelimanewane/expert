// ─────────────────────────────────────────────────────────────────────────────
// KPIs Tableau de Bord Direction Executive — Cabinet Expert OHADA 360
// Module de pilotage pour associés / partners
// ─────────────────────────────────────────────────────────────────────────────

export interface KPICabinet {
  periode: string; // ex: "Novembre 2024"
  // Facturation & Recouvrement
  factureEmises_XOF: number;
  factureEncaissees_XOF: number;
  enCoursRecouvrement_XOF: number;
  tauxRecouvrement_pct: number;
  // Work In Progress (WIP)
  wip_XOF: number; // Travaux en cours non facturés
  wipParCollaborateur: Array<{
    nom: string;
    wip_XOF: number;
    objectif_XOF: number;
  }>;
  // Rentabilité missions
  nbMissionsActives: number;
  nbMissionsEnRetard: number;
  margeGlobaleMissions_pct: number;
  // Délais
  delaiMoyenRecouvrement_jours: number;
  delaiMoyenProduction_jours: number;
  // Alertes
  alertes: Array<{ niveau: "INFO" | "WARNING" | "CRITICAL"; message: string }>;
}

export interface RapportDirectionCabinet {
  cabinet: string;
  kpis: KPICabinet;
  scorePerformanceGlobal: number; // 0-100
  tendance: "HAUSSE" | "STABLE" | "BAISSE";
  recommandationsDirection: string[];
  narratifExecutif: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calcul du score de performance global (0-100)
// ─────────────────────────────────────────────────────────────────────────────

function calculerScore(kpis: KPICabinet): number {
  // Composante 1 : Taux de recouvrement (30 pts)
  // 100% → 30 pts, 60% → 0 pt (seuil critique), interpolation linéaire
  const scoreRecouvrement = Math.max(
    0,
    Math.min(30, ((kpis.tauxRecouvrement_pct - 60) / 40) * 30)
  );

  // Composante 2 : Marge globale missions (30 pts)
  // 50%+ → 30 pts, 0% → 0 pt
  const scoreMarge = Math.max(
    0,
    Math.min(30, (kpis.margeGlobaleMissions_pct / 50) * 30)
  );

  // Composante 3 : Délai moyen de production (20 pts)
  // ≤ 15 j → 20 pts, 60 j+ → 0 pt
  const scoreDelai = Math.max(
    0,
    Math.min(20, ((60 - kpis.delaiMoyenProduction_jours) / 45) * 20)
  );

  // Composante 4 : WIP sain — ratio WIP / factures émises (20 pts)
  // WIP ≤ 20% des factures émises → 20 pts, ≥ 80% → 0 pt
  const ratioWip =
    kpis.factureEmises_XOF > 0
      ? kpis.wip_XOF / kpis.factureEmises_XOF
      : 0;
  const scoreWip = Math.max(
    0,
    Math.min(20, ((0.8 - ratioWip) / 0.6) * 20)
  );

  return Math.round(scoreRecouvrement + scoreMarge + scoreDelai + scoreWip);
}

// ─────────────────────────────────────────────────────────────────────────────
// Détermination de la tendance (N vs N-1)
// ─────────────────────────────────────────────────────────────────────────────

function determinerTendance(
  kpis: KPICabinet,
  kpisN1?: Partial<KPICabinet>
): "HAUSSE" | "STABLE" | "BAISSE" {
  if (!kpisN1 || kpisN1.tauxRecouvrement_pct === undefined) return "STABLE";

  const delta = kpis.tauxRecouvrement_pct - kpisN1.tauxRecouvrement_pct;
  if (delta > 2) return "HAUSSE";
  if (delta < -2) return "BAISSE";
  return "STABLE";
}

// ─────────────────────────────────────────────────────────────────────────────
// Génération des alertes automatiques
// ─────────────────────────────────────────────────────────────────────────────

function genererAlertes(
  kpis: KPICabinet
): Array<{ niveau: "INFO" | "WARNING" | "CRITICAL"; message: string }> {
  const alertes: Array<{
    niveau: "INFO" | "WARNING" | "CRITICAL";
    message: string;
  }> = [...kpis.alertes];

  // CRITICAL : taux de recouvrement < 60%
  if (kpis.tauxRecouvrement_pct < 60) {
    alertes.push({
      niveau: "CRITICAL",
      message: `Taux de recouvrement critique : ${kpis.tauxRecouvrement_pct.toFixed(1)}% (seuil : 60%). Action immédiate requise.`,
    });
  }

  // WARNING : missions en retard > 20% des missions actives
  if (
    kpis.nbMissionsActives > 0 &&
    kpis.nbMissionsEnRetard / kpis.nbMissionsActives > 0.2
  ) {
    const pct = (
      (kpis.nbMissionsEnRetard / kpis.nbMissionsActives) *
      100
    ).toFixed(1);
    alertes.push({
      niveau: "WARNING",
      message: `${pct}% des missions sont en retard (${kpis.nbMissionsEnRetard}/${kpis.nbMissionsActives}). Revoir le planning de production.`,
    });
  }

  // WARNING : délai de recouvrement élevé
  if (kpis.delaiMoyenRecouvrement_jours > 90) {
    alertes.push({
      niveau: "WARNING",
      message: `Délai moyen de recouvrement élevé : ${kpis.delaiMoyenRecouvrement_jours} jours. Intensifier les relances.`,
    });
  }

  // INFO : WIP important
  if (
    kpis.factureEmises_XOF > 0 &&
    kpis.wip_XOF / kpis.factureEmises_XOF > 0.5
  ) {
    alertes.push({
      niveau: "INFO",
      message: `WIP représente ${((kpis.wip_XOF / kpis.factureEmises_XOF) * 100).toFixed(0)}% des factures émises. Accélérer la facturation.`,
    });
  }

  return alertes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommandations adaptées au score
// ─────────────────────────────────────────────────────────────────────────────

function genererRecommandations(
  score: number,
  kpis: KPICabinet
): string[] {
  const reco: string[] = [];

  if (score < 40) {
    reco.push(
      "⚠️ Situation critique : mettre en place immédiatement un plan de redressement financier."
    );
    reco.push(
      "Convoquer une réunion d'urgence des associés pour réviser les priorités de recouvrement."
    );
  }

  if (score < 70) {
    reco.push(
      "Renforcer le suivi des encaissements : désigner un responsable recouvrement dédié."
    );
    reco.push(
      "Identifier les 10 créances les plus importantes et lancer des procédures de relance formelle."
    );
  }

  if (kpis.tauxRecouvrement_pct < 75) {
    reco.push(
      "Mettre en place des conditions de paiement plus strictes (acomptes, paiements échelonnés)."
    );
  }

  if (kpis.margeGlobaleMissions_pct < 25) {
    reco.push(
      "Revoir la tarification des missions : certains dossiers sont sous-facturés par rapport au temps passé."
    );
    reco.push(
      "Analyser les missions déficitaires et renégocier les honoraires ou clore les dossiers non rentables."
    );
  }

  if (kpis.delaiMoyenProduction_jours > 30) {
    reco.push(
      "Optimiser le workflow de production : déployer des outils de suivi de tâches et automatiser les relances internes."
    );
  }

  if (kpis.nbMissionsEnRetard > 0) {
    reco.push(
      `Traiter en priorité les ${kpis.nbMissionsEnRetard} mission(s) en retard pour préserver la satisfaction client.`
    );
  }

  if (score >= 70 && score < 85) {
    reco.push(
      "Cabinet en bonne santé : concentrer les efforts sur l'optimisation du WIP et la réduction des délais."
    );
  }

  if (score >= 85) {
    reco.push(
      "Excellente performance : documenter les bonnes pratiques et envisager le développement de nouveaux services."
    );
    reco.push(
      "Capitaliser sur la satisfaction client pour générer des recommandations et développer le portefeuille."
    );
  }

  return reco;
}

// ─────────────────────────────────────────────────────────────────────────────
// Narratif exécutif
// ─────────────────────────────────────────────────────────────────────────────

function genererNarratifExecutif(
  cabinet: string,
  kpis: KPICabinet,
  score: number,
  tendance: "HAUSSE" | "STABLE" | "BAISSE"
): string {
  const tendanceLabel =
    tendance === "HAUSSE"
      ? "en progression"
      : tendance === "BAISSE"
      ? "en recul"
      : "stable";

  const performance =
    score >= 85
      ? "excellente"
      : score >= 70
      ? "bonne"
      : score >= 55
      ? "satisfaisante"
      : score >= 40
      ? "préoccupante"
      : "critique";

  const formatXOF = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n) + " XOF";

  return (
    `Pour la période ${kpis.periode}, le cabinet ${cabinet} affiche une performance globale ${performance} ` +
    `(score : ${score}/100), ${tendanceLabel} par rapport à la période précédente. ` +
    `Le taux de recouvrement s'établit à ${kpis.tauxRecouvrement_pct.toFixed(1)}%, avec ` +
    `${formatXOF(kpis.factureEncaissees_XOF)} encaissés sur ${formatXOF(kpis.factureEmises_XOF)} facturés. ` +
    `Le WIP total représente ${formatXOF(kpis.wip_XOF)} de travaux en cours non facturés. ` +
    `Sur ${kpis.nbMissionsActives} missions actives, ${kpis.nbMissionsEnRetard} sont en retard, ` +
    `pour une marge globale de ${kpis.margeGlobaleMissions_pct.toFixed(1)}%. ` +
    `Le délai moyen de production est de ${kpis.delaiMoyenProduction_jours} jours.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fonction principale
// ─────────────────────────────────────────────────────────────────────────────

export function genererRapportDirection(
  cabinet: string,
  kpis: KPICabinet,
  kpisN1?: Partial<KPICabinet>
): RapportDirectionCabinet {
  const scorePerformanceGlobal = calculerScore(kpis);
  const tendance = determinerTendance(kpis, kpisN1);
  const alertesCompletes = genererAlertes(kpis);
  const recommandationsDirection = genererRecommandations(
    scorePerformanceGlobal,
    kpis
  );
  const narratifExecutif = genererNarratifExecutif(
    cabinet,
    kpis,
    scorePerformanceGlobal,
    tendance
  );

  return {
    cabinet,
    kpis: { ...kpis, alertes: alertesCompletes },
    scorePerformanceGlobal,
    tendance,
    recommandationsDirection,
    narratifExecutif,
  };
}
