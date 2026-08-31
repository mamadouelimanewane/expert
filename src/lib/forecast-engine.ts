// ─────────────────────────────────────────────────────────────────────────────
// Projection de trésorerie à 13 semaines.
//
// L'implémentation précédente n'utilisait aucune donnée du dossier : elle
// partait du solde réel, puis ajoutait chaque semaine une variation fixe de
// 250 000 FCFA multipliée par un coefficient de scénario, plus une
// « volatilité » calculée par `Math.sin(i) * 500000`. Les trois courbes
// affichées à l'écran, et surtout la « date critique » de rupture de
// trésorerie renvoyée par detectCriticalPoints(), étaient donc le produit
// d'une sinusoïde — un cabinet pouvait annoncer à son client une date de
// cessation de paiements calculée sur rien.
//
// La projection repose désormais uniquement sur ce que l'application connaît
// réellement : le solde de départ et les factures clients non encore
// encaissées, positionnées à leur échéance. Les trois scénarios ne sont plus
// des coefficients arbitraires mais trois hypothèses de recouvrement
// explicites. Aucune charge récurrente (loyer, salaires, TVA) n'étant suivie
// par l'application, aucun décaissement n'est inventé : la projection est donc
// un plan d'encaissements, ce que l'appelant doit indiquer à l'utilisateur.
// ─────────────────────────────────────────────────────────────────────────────

export interface ForecastPoint {
  week: number;
  date: string;
  cash: number;
}

export type Scenario = "optimiste" | "realiste" | "pessimiste";

/** Encaissement attendu, tel qu'il ressort des factures non soldées. */
export interface EncaissementAttendu {
  /** Échéance de la facture (date ISO ou objet Date). */
  echeance: string | Date;
  montant: number;
  /** La facture est déjà échue et impayée. */
  enRetard: boolean;
}

export interface HypothesesProjection {
  /**
   * Retard moyen de règlement observé sur les factures déjà payées, en jours.
   * `null` si aucune facture payée ne permet de le mesurer — le scénario
   * réaliste se confond alors avec l'optimiste, et l'appelant doit le dire.
   */
  retardMoyenJours: number | null;
}

const SEMAINES = 13;
const MS_PAR_JOUR = 24 * 60 * 60 * 1000;

function decalageJours(scenario: Scenario, hypotheses: HypothesesProjection): number {
  // Optimiste : chaque client règle à l'échéance.
  if (scenario === "optimiste") return 0;
  // Réaliste et pessimiste : chaque client règle avec le retard moyen constaté.
  return hypotheses.retardMoyenJours ?? 0;
}

/**
 * Projette le solde de trésorerie semaine par semaine à partir du solde
 * courant et des encaissements attendus.
 *
 * @param soldeInitial  solde de trésorerie constaté aujourd'hui
 * @param encaissements factures non soldées, avec leur échéance
 * @param scenario      hypothèse de recouvrement
 * @param hypotheses    paramètres mesurés sur l'historique du dossier
 * @param aujourdHui    injectable pour les tests
 */
export function projeterTresorerie(
  soldeInitial: number,
  encaissements: EncaissementAttendu[],
  scenario: Scenario,
  hypotheses: HypothesesProjection,
  aujourdHui: Date = new Date()
): ForecastPoint[] {
  const depart = new Date(aujourdHui);
  depart.setHours(0, 0, 0, 0);

  const decalage = decalageJours(scenario, hypotheses);

  // Montant encaissé attendu par semaine (index 1..12 ; la semaine 0 est le
  // point de départ, avant tout encaissement).
  const parSemaine = new Array<number>(SEMAINES).fill(0);

  for (const e of encaissements) {
    const montant = Number(e.montant);
    if (!Number.isFinite(montant) || montant <= 0) continue;

    // Pessimiste : les créances déjà échues ne rentrent pas.
    if (scenario === "pessimiste" && e.enRetard) continue;

    const echeance = e.echeance instanceof Date ? e.echeance : new Date(e.echeance);
    if (isNaN(echeance.getTime())) continue;

    // Une créance déjà échue est attendue à partir d'aujourd'hui, pas dans le
    // passé ; sinon elle serait silencieusement perdue hors de l'horizon.
    const base = echeance.getTime() < depart.getTime() ? depart : echeance;
    const jours = Math.round((base.getTime() - depart.getTime()) / MS_PAR_JOUR) + decalage;
    const semaine = Math.max(1, Math.ceil((jours + 1) / 7));

    // Hors horizon de projection : l'encaissement n'est pas reporté sur la
    // dernière semaine, ce qui gonflerait artificiellement la fin de courbe.
    if (semaine >= SEMAINES) continue;

    parSemaine[semaine] += montant;
  }

  const points: ForecastPoint[] = [];
  let cumul = soldeInitial;

  for (let i = 0; i < SEMAINES; i++) {
    const date = new Date(depart.getTime() + i * 7 * MS_PAR_JOUR);
    cumul += parSemaine[i];
    points.push({
      week: i,
      date: date.toISOString().split("T")[0],
      cash: Math.round(cumul),
    });
  }

  return points;
}

export function detectCriticalPoints(forecast: ForecastPoint[]): { minCash: number; criticalDate: string | null } {
  // Une projection vide faisait planter la lecture de `forecast[0].cash`.
  if (!forecast || forecast.length === 0) {
    return { minCash: 0, criticalDate: null };
  }

  let minCash = forecast[0].cash;
  let criticalDate: string | null = null;

  for (const point of forecast) {
    if (point.cash < minCash) {
      minCash = point.cash;
    }
    if (point.cash < 0 && !criticalDate) {
      criticalDate = point.date;
    }
  }

  return { minCash, criticalDate };
}

/**
 * Retard moyen de règlement, en jours, mesuré sur les factures effectivement
 * payées. `null` quand aucune facture ne permet la mesure : il ne faut pas
 * retenir 0 par défaut, qui ferait passer une absence de mesure pour un
 * recouvrement parfaitement ponctuel.
 */
export function retardMoyenReglement(
  facturesPayees: { dueDate: string | Date; paidDate: string | Date | null }[]
): number | null {
  const retards: number[] = [];

  for (const f of facturesPayees) {
    if (!f.paidDate) continue;
    const echeance = f.dueDate instanceof Date ? f.dueDate : new Date(f.dueDate);
    const paiement = f.paidDate instanceof Date ? f.paidDate : new Date(f.paidDate);
    if (isNaN(echeance.getTime()) || isNaN(paiement.getTime())) continue;

    retards.push(Math.round((paiement.getTime() - echeance.getTime()) / MS_PAR_JOUR));
  }

  if (retards.length === 0) return null;

  const moyenne = retards.reduce((s, r) => s + r, 0) / retards.length;
  // Un règlement en avance ne fait pas rentrer l'argent plus tôt que prévu dans
  // la projection : le retard moyen est borné à zéro.
  return Math.max(0, Math.round(moyenne));
}
