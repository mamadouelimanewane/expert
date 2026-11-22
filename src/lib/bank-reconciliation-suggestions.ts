export type ReconciliationCandidate = {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  invoiceDate: Date | string;
  outstandingAmount: number;
};

export type ReconciliationSuggestion = ReconciliationCandidate & {
  score: number;
  reasons: string[];
  exactAmount: boolean;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Classe les factures ouvertes pour aider le collaborateur à rapprocher un
 * mouvement réel. Le score est explicatif : il ne déclenche jamais de lettrage.
 */
export function suggestInvoiceMatches(input: {
  description: string;
  amount: number;
  transactionDate: Date | string;
  candidates: ReconciliationCandidate[];
}): ReconciliationSuggestion[] {
  const description = normalize(input.description);
  const transactionDate = new Date(input.transactionDate).getTime();
  if (!Number.isFinite(transactionDate) || !Number.isFinite(input.amount)) return [];

  return input.candidates
    .map((candidate) => {
      const reasons: string[] = [];
      let confidence = 0;
      const amount = Math.abs(input.amount);
      const outstanding = Math.max(0, candidate.outstandingAmount);
      const exactAmount = Math.abs(amount - outstanding) <= 0.01;

      if (exactAmount) {
        confidence += 55;
        reasons.push("montant égal au solde restant");
      } else if (amount > 0 && amount < outstanding) {
        confidence += 15;
        reasons.push("montant compatible avec un règlement partiel");
      }

      const number = normalize(candidate.invoiceNumber);
      if (number && description.includes(number)) {
        confidence += 35;
        reasons.push("référence de facture trouvée dans le libellé");
      }

      const clientName = normalize(candidate.clientName);
      if (clientName.length >= 4 && description.includes(clientName)) {
        confidence += 30;
        reasons.push("nom du client trouvé dans le libellé");
      } else if (clientName.length >= 4) {
        const tokens = clientName.split(" ").filter((token) => token.length >= 4);
        if (tokens.some((token) => description.includes(token))) {
          confidence += 15;
          reasons.push("un élément du nom du client correspond au libellé");
        }
      }

      const invoiceDate = new Date(candidate.invoiceDate).getTime();
      const daysApart = Math.abs(transactionDate - invoiceDate) / 86_400_000;
      if (Number.isFinite(daysApart) && daysApart <= 7) {
        confidence += 10;
        reasons.push("date proche de l’émission de la facture");
      } else if (Number.isFinite(daysApart) && daysApart <= 45) {
        confidence += 5;
        reasons.push("date dans les 45 jours suivant l’émission");
      }

      return { ...candidate, score: Math.min(100, confidence), reasons, exactAmount };
    })
    .filter((candidate) => candidate.score >= 15)
    .sort((a, b) => b.score - a.score || Number(b.exactAmount) - Number(a.exactAmount))
    .slice(0, 5);
}
