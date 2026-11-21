/**
 * Prévision Cash 13 Semaines — Standard Tesorio/Cashforce
 * Cabinet Expert OHADA 360
 */

export interface SemaineFlux {
  semaine: number; // 1 à 13
  dateDebut: string;
  dateFin: string;
  encaissementsPrevisionnels_XOF: number;
  decaissementsPrevisionnels_XOF: number;
  soldeFin_XOF: number;
  alerteSolde: "POSITIF" | "TENDU" | "NEGATIF";
}

export interface PrevisionCash13S {
  societeRaisonSociale: string;
  exercice: string;
  semaines: SemaineFlux[];
  soldeInitial_XOF: number;
  soldeFinalPrevu_XOF: number;
  semainesCritiques: number[];
  conseilTresorier: string;
}

/**
 * Additionne 7 jours à une date ISO string et retourne la nouvelle date ISO string.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Génère la prévision de trésorerie sur 13 semaines glissantes.
 *
 * @param societeRaisonSociale  Raison sociale de la société
 * @param soldeInitial_XOF      Solde de trésorerie à la date de départ (XOF)
 * @param fluxHebdomadaires     Tableau de 13 objets { encaissements, decaissements }
 * @param dateDebut             Date de début au format "YYYY-MM-DD"
 * @returns PrevisionCash13S
 */
export function genererPrevisionCash13Semaines(
  societeRaisonSociale: string,
  soldeInitial_XOF: number,
  fluxHebdomadaires: Array<{ encaissements: number; decaissements: number }>,
  dateDebut: string
): PrevisionCash13S {
  if (fluxHebdomadaires.length !== 13) {
    throw new Error(
      `fluxHebdomadaires doit contenir exactement 13 éléments (reçu : ${fluxHebdomadaires.length})`
    );
  }

  const seuil20Pct = soldeInitial_XOF * 0.2;

  const semaines: SemaineFlux[] = [];
  let soldeCourant = soldeInitial_XOF;

  for (let i = 0; i < 13; i++) {
    const numeroSemaine = i + 1;
    const dateDebSemaine = addDays(dateDebut, i * 7);
    const dateFinSemaine = addDays(dateDebut, i * 7 + 6);

    const { encaissements, decaissements } = fluxHebdomadaires[i];
    soldeCourant = soldeCourant + encaissements - decaissements;

    let alerteSolde: "POSITIF" | "TENDU" | "NEGATIF";
    if (soldeCourant < 0) {
      alerteSolde = "NEGATIF";
    } else if (soldeCourant < seuil20Pct) {
      alerteSolde = "TENDU";
    } else {
      alerteSolde = "POSITIF";
    }

    semaines.push({
      semaine: numeroSemaine,
      dateDebut: dateDebSemaine,
      dateFin: dateFinSemaine,
      encaissementsPrevisionnels_XOF: encaissements,
      decaissementsPrevisionnels_XOF: decaissements,
      soldeFin_XOF: soldeCourant,
      alerteSolde,
    });
  }

  const soldeFinalPrevu_XOF = semaines[12].soldeFin_XOF;

  const semainesCritiques = semaines
    .filter((s) => s.alerteSolde !== "POSITIF")
    .map((s) => s.semaine);

  const conseilTresorier = genererConseil(
    semainesCritiques.length,
    soldeFinalPrevu_XOF,
    soldeInitial_XOF
  );

  // Exercice : année de la date de début
  const exercice = dateDebut.slice(0, 4);

  return {
    societeRaisonSociale,
    exercice,
    semaines,
    soldeInitial_XOF,
    soldeFinalPrevu_XOF,
    semainesCritiques,
    conseilTresorier,
  };
}

/**
 * Génère un conseil narratif adapté au contexte de trésorerie.
 */
function genererConseil(
  nbCritiques: number,
  soldeFinal: number,
  soldeInitial: number
): string {
  if (nbCritiques === 0) {
    return (
      "La trésorerie prévisionnelle est saine sur l'ensemble de l'horizon de 13 semaines. " +
      "Aucune tension n'est détectée. Profitez de cette période favorable pour négocier des " +
      "conditions de paiement plus avantageuses auprès de vos fournisseurs et constituer une " +
      "réserve de sécurité équivalente à au moins 4 semaines de charges fixes."
    );
  } else if (nbCritiques <= 2) {
    return (
      `Attention : ${nbCritiques} semaine(s) critique(s) identifiée(s). ` +
      "Des tensions ponctuelles de trésorerie sont anticipées. Il est recommandé d'accélérer " +
      "les encaissements clients (relances préventives, escompte), de décaler les décaissements " +
      "non urgents, et de prévoir une ligne de crédit court terme (facilité de caisse ou " +
      "découvert autorisé) pour couvrir les pointes de besoin."
    );
  } else if (nbCritiques <= 5) {
    return (
      `Alerte trésorerie : ${nbCritiques} semaines critiques détectées sur 13. ` +
      "La situation appelle une action correctrice immédiate : révision du plan de décaissement, " +
      "cession de créances clients (affacturage), mobilisation des avances sur marchés, et " +
      "concertation avec votre banque pour une ligne de trésorerie confirmée. " +
      "Un suivi hebdomadaire rigoureux est indispensable."
    );
  } else {
    return (
      `Situation critique : ${nbCritiques} semaines sur 13 présentent un solde tendu ou négatif. ` +
      "Une crise de trésorerie est imminente si aucune mesure structurelle n'est prise. " +
      "Engagez immédiatement : (1) négociation d'un moratoire avec les principaux fournisseurs, " +
      "(2) mobilisation d'un financement d'urgence (avance associés, prêt court terme), " +
      "(3) révision du plan de charge et report des investissements non critiques. " +
      "Consultez votre expert-comptable OHADA pour un diagnostic de prévention des difficultés " +
      "conformément à l'Acte Uniforme AUPCAP."
    );
  }
}
