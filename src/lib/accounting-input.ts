export type ManualAccountingInput =
  | {
      ok: true;
      direction: "ENTREE" | "SORTIE";
      amount: number;
      account: string;
      accountLabel: string;
      confidence: number;
      reason?: string;
    }
  | { ok: false; reason: string };

function texteSansAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Extract one explicit integer amount; ambiguous input is never guessed. */
export function parseSingleAccountingAmount(text: string): number | null {
  const matches = text.match(/\b\d{1,3}(?:[ \u00a0\u202f.,]\d{3})+\b|\b\d+\b/g) ?? [];
  if (matches.length !== 1) return null;
  const amount = Number(matches[0].replace(/\D/g, ""));
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

/** Conservative keyword pre-classifier used for a human-reviewed draft only. */
export function classifyManualAccountingInput(text: string): ManualAccountingInput {
  const normalized = texteSansAccents(text);
  const hasIncome = /\b(vendu|vente|recette|encaisse)\b/.test(normalized);
  const hasExpense = /\b(paye|achete|depense|achat)\b/.test(normalized);
  if (hasIncome === hasExpense) {
    return { ok: false, reason: "Précisez une seule opération : recette encaissée ou dépense payée." };
  }

  const amount = parseSingleAccountingAmount(text);
  if (amount === null) {
    return { ok: false, reason: "Un seul montant entier explicite est requis; aucune écriture n'a été créée." };
  }

  if (hasIncome) {
    return {
      ok: true,
      direction: "ENTREE",
      amount,
      account: "701000",
      accountLabel: "Ventes — imputation à vérifier",
      confidence: 0.65,
      reason: "Imputation provisoire par règle de mots-clés; validation humaine requise.",
    };
  }

  if (/\b(transport|livraison|carburant)\b/.test(normalized)) {
    return {
      ok: true,
      direction: "SORTIE",
      amount,
      account: "613000",
      accountLabel: "Transports — imputation à vérifier",
      confidence: 0.65,
      reason: "Imputation provisoire par règle de mots-clés; validation humaine requise.",
    };
  }
  if (/\b(marchandise|ciment|stock)\b/.test(normalized)) {
    return {
      ok: true,
      direction: "SORTIE",
      amount,
      account: "601000",
      accountLabel: "Achats de marchandises — imputation à vérifier",
      confidence: 0.65,
      reason: "Imputation provisoire par règle de mots-clés; validation humaine requise.",
    };
  }

  return {
    ok: true,
    direction: "SORTIE",
    amount,
    account: "471000",
    accountLabel: "Compte d'attente — à qualifier",
    confidence: 0.25,
    reason: "Nature de la dépense non reconnue; imputation en compte d'attente.",
  };
}
