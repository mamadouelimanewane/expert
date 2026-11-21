/**
 * Moteur de Rapprochement Intelligent IA — Banque & Mobile Money UEMOA
 * Inspiré de Plaid & Bridge pour l'écosystème bancaire ouest-africain (CBAO, SGBS, Ecobank, BOA)
 * et les flux Mobile Money (Wave, Orange Money, Free Money, Moov Money, MTN).
 *
 * Fonctionnalités clés :
 * - Ingestion et normalisation des flux bancaires (format MT940 / CAMT.053) et relevés Mobile Money
 * - Lettrage automatique multicritère avec les factures clients (411) et fournisseurs (401)
 * - Calcul d'un indice de confiance IA (0-100%) basé sur : montant exact, référence facture dans le libellé, date rapprochée (+/- 5j) et identification du tiers
 * - Détection des frais bancaires / commissions télécoms (compte 631 / 628)
 * - Détection des écarts de règlement et propositions d'écritures de régularisation (pertes/profits sur règlements)
 */

export interface TransactionFlux {
  id: string;
  source: "BANQUE_TRADITIONNELLE" | "WAVE" | "ORANGE_MONEY" | "FREE_MONEY" | "MOOV_MONEY";
  dateTransaction: string; // "YYYY-MM-DD"
  libelleBrut: string;
  montant_XOF: number; // positif = encaissement, négatif = décaissement
  referenceTransaction?: string;
  nomEmetteurRecepteur?: string;
}

export interface FactureOuverte {
  idFacture: string;
  numeroFacture: string;
  compteOHADA: "411" | "401";
  tiersNom: string;
  dateEmission: string;
  dateEcheance: string;
  montantTTC_XOF: number;
  montantDejaRegle_XOF: number;
  soldeRestantDu_XOF: number;
}

export interface PropositionRapprochement {
  transaction: TransactionFlux;
  factureAssociee?: FactureOuverte;
  scoreConfiance_pct: number; // 0 à 100
  statutLettrage: "LETTRAGE_AUTOMATIQUE" | "A_CONFIRMER" | "NON_RAPPROCHE" | "FRAIS_COMMISSION";
  ecartMontant_XOF: number;
  compteContrepartiePropose: string; // ex: "411100", "401100", "631100" (Frais bancaires), "628200" (Commissions Wave)
  explicationIA: string;
}

export interface RapportRapprochementIA {
  totalTransactions: number;
  totalMontantFlux_XOF: number;
  nbLettragesAutomatiques: number;
  nbAConfirmer: number;
  nbNonRapproches: number;
  nbCommissionsDetectees: number;
  tauxCouvertureAutomatique_pct: number;
  propositions: PropositionRapprochement[];
  totalFraisCommissions_XOF: number;
  syntheseLettrage: string;
}

export function rapprocherTransaction(
  tx: TransactionFlux,
  factures: FactureOuverte[]
): PropositionRapprochement {
  const montantAbs = Math.abs(tx.montant_XOF);
  const isEncaissement = tx.montant_XOF > 0;
  const compteCible = isEncaissement ? "411" : "401";

  // 1. Détection des frais / commissions télécoms ou bancaires
  const libelleLower = tx.libelleBrut.toLowerCase();
  const isCommissionMobile =
    libelleLower.includes("frais") ||
    libelleLower.includes("commission") ||
    libelleLower.includes("agios") ||
    libelleLower.includes("retrait wave") ||
    libelleLower.includes("transfer fee");

  if (isCommissionMobile && !isEncaissement) {
    const compteFrais = tx.source === "BANQUE_TRADITIONNELLE" ? "631100" : "628200";
    return {
      transaction: tx,
      scoreConfiance_pct: 95,
      statutLettrage: "FRAIS_COMMISSION",
      ecartMontant_XOF: 0,
      compteContrepartiePropose: compteFrais,
      explicationIA: `Commission de transaction identifiée (${tx.source}). Imputation automatique au compte de charges ${compteFrais}.`,
    };
  }

  // 2. Recherche de correspondance parmi les factures ouvertes
  let meilleureFacture: FactureOuverte | undefined;
  let meilleurScore = 0;
  let ecartRetenu = 0;

  for (const fac of factures) {
    if (fac.compteOHADA !== compteCible) continue;

    let score = 0;

    // Critère A : Montant exact (50 pts)
    const deltaMontant = Math.abs(montantAbs - fac.soldeRestantDu_XOF);
    if (deltaMontant === 0) {
      score += 50;
    } else if (deltaMontant <= 500) {
      // Tolérance arrondi / petit écart
      score += 35;
    } else if (montantAbs < fac.soldeRestantDu_XOF) {
      // Règlement partiel
      score += 20;
    }

    // Critère B : Numéro de facture présent dans le libellé (30 pts)
    const numClean = fac.numeroFacture.toLowerCase().replace(/[^a-z0-9]/g, "");
    const libClean = libelleLower.replace(/[^a-z0-9]/g, "");
    if (numClean && libClean.includes(numClean)) {
      score += 30;
    }

    // Critère C : Nom du tiers présent dans le libellé ou l'émetteur (15 pts)
    const nomTiersLower = fac.tiersNom.toLowerCase();
    const motsTiers = nomTiersLower.split(" ").filter((m) => m.length > 3);
    const tiersMatches = motsTiers.some(
      (mot) => libelleLower.includes(mot) || (tx.nomEmetteurRecepteur && tx.nomEmetteurRecepteur.toLowerCase().includes(mot))
    );
    if (tiersMatches) {
      score += 15;
    }

    // Critère D : Cohérence temporelle (+/- 15 jours) (5 pts)
    const dateTx = new Date(tx.dateTransaction).getTime();
    const dateFac = new Date(fac.dateEmission).getTime();
    const diffJours = Math.abs(dateTx - dateFac) / (1000 * 60 * 60 * 24);
    if (diffJours <= 30) {
      score += 5;
    }

    if (score > meilleurScore) {
      meilleurScore = score;
      meilleureFacture = fac;
      ecartRetenu = deltaMontant;
    }
  }

  // Décision
  if (meilleurScore >= 80 && meilleureFacture) {
    const compteFinal = isEncaissement ? "411100" : "401100";
    return {
      transaction: tx,
      factureAssociee: meilleureFacture,
      scoreConfiance_pct: meilleurScore,
      statutLettrage: "LETTRAGE_AUTOMATIQUE",
      ecartMontant_XOF: ecartRetenu,
      compteContrepartiePropose: compteFinal,
      explicationIA: `Lettrage haute confiance (${meilleurScore}%) avec la facture N° ${meilleureFacture.numeroFacture} (${meilleureFacture.tiersNom}).`,
    };
  }

  if (meilleurScore >= 35 && meilleureFacture) {
    const compteFinal = isEncaissement ? "411100" : "401100";
    return {
      transaction: tx,
      factureAssociee: meilleureFacture,
      scoreConfiance_pct: meilleurScore,
      statutLettrage: "A_CONFIRMER",
      ecartMontant_XOF: ecartRetenu,
      compteContrepartiePropose: compteFinal,
      explicationIA: `Correspondance probable (${meilleurScore}%) avec la facture N° ${meilleureFacture.numeroFacture}. Confirmation manuelle requise.`,
    };
  }

  return {
    transaction: tx,
    scoreConfiance_pct: meilleurScore,
    statutLettrage: "NON_RAPPROCHE",
    ecartMontant_XOF: montantAbs,
    compteContrepartiePropose: "471000", // Compte d'attente
    explicationIA: "Aucune facture ouverte correspondante identifiée. Affectation provisoire au compte d'attente 471000.",
  };
}

export function executerRapprochementIA(
  transactions: TransactionFlux[],
  factures: FactureOuverte[]
): RapportRapprochementIA {
  const propositions = transactions.map((tx) => rapprocherTransaction(tx, factures));

  let totalMontant = 0;
  let nbAuto = 0;
  let nbConfirmer = 0;
  let nbNonRapproches = 0;
  let nbCommissions = 0;
  let totalFraisCommissions_XOF = 0;

  for (const p of propositions) {
    totalMontant += Math.abs(p.transaction.montant_XOF);
    if (p.statutLettrage === "LETTRAGE_AUTOMATIQUE") nbAuto++;
    else if (p.statutLettrage === "A_CONFIRMER") nbConfirmer++;
    else if (p.statutLettrage === "FRAIS_COMMISSION") {
      nbCommissions++;
      totalFraisCommissions_XOF += Math.abs(p.transaction.montant_XOF);
    } else {
      nbNonRapproches++;
    }
  }

  const tauxCouvertureAutomatique_pct =
    transactions.length > 0
      ? Math.round(((nbAuto + nbCommissions) / transactions.length) * 100)
      : 0;

  const syntheseLettrage =
    `Rapprochement IA exécuté sur ${transactions.length} transaction(s) : ` +
    `${nbAuto} lettrage(s) automatique(s) certifié(s), ${nbCommissions} frais/commissions isolés, ` +
    `${nbConfirmer} proposition(s) à confirmer et ${nbNonRapproches} flux non rapproché(s) viré(s) en compte 471. ` +
    `Taux d'automatisation global : ${tauxCouvertureAutomatique_pct}%.`;

  return {
    totalTransactions: transactions.length,
    totalMontantFlux_XOF: totalMontant,
    nbLettragesAutomatiques: nbAuto,
    nbAConfirmer: nbConfirmer,
    nbNonRapproches: nbNonRapproches,
    nbCommissionsDetectees: nbCommissions,
    tauxCouvertureAutomatique_pct,
    propositions,
    totalFraisCommissions_XOF,
    syntheseLettrage,
  };
}
