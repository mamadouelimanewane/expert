import { describe, expect, it } from "vitest";
import { suggestInvoiceMatches } from "@/lib/bank-reconciliation-suggestions";

const candidates = [
  {
    invoiceId: "invoice-1",
    invoiceNumber: "FAC-2026-0042",
    clientName: "Société Énergie Sahel",
    invoiceDate: "2026-03-10T00:00:00.000Z",
    outstandingAmount: 118_000,
  },
  {
    invoiceId: "invoice-2",
    invoiceNumber: "FAC-2026-0088",
    clientName: "Cabinet Atlas",
    invoiceDate: "2026-01-01T00:00:00.000Z",
    outstandingAmount: 72_000,
  },
];

describe("suggestInvoiceMatches", () => {
  it("explique une correspondance par référence, client, montant et proximité de date", () => {
    const suggestions = suggestInvoiceMatches({
      description: "REGLEMENT FAC-2026-0042 SOCIETE ENERGIE SAHEL",
      amount: 118_000,
      transactionDate: "2026-03-12T00:00:00.000Z",
      candidates,
    });

    expect(suggestions[0]).toMatchObject({
      invoiceId: "invoice-1",
      score: 100,
      exactAmount: true,
    });
    expect(suggestions[0].reasons).toEqual(expect.arrayContaining([
      "montant égal au solde restant",
      "référence de facture trouvée dans le libellé",
      "nom du client trouvé dans le libellé",
      "date proche de l’émission de la facture",
    ]));
  });

  it("classe les candidates par indice explicable et plafonne la liste à cinq", () => {
    const manyCandidates = Array.from({ length: 8 }, (_, index) => ({
      invoiceId: `invoice-${index}`,
      invoiceNumber: `FAC-${index}`,
      clientName: `Entreprise ${index}`,
      invoiceDate: "2026-03-10T00:00:00.000Z",
      outstandingAmount: index === 0 ? 118_000 : 140_000 + index,
    }));

    const suggestions = suggestInvoiceMatches({
      description: "FAC-0 ENTREPRISE 0",
      amount: 118_000,
      transactionDate: "2026-03-10T00:00:00.000Z",
      candidates: manyCandidates,
    });

    expect(suggestions).toHaveLength(5);
    expect(suggestions[0].invoiceId).toBe("invoice-0");
    expect(suggestions.every((suggestion, index) => index === 0 || suggestion.score <= suggestions[index - 1].score)).toBe(true);
  });

  it("n'affiche aucune piste lorsque la date du relevé est invalide", () => {
    expect(suggestInvoiceMatches({
      description: "FAC-2026-0042",
      amount: 118_000,
      transactionDate: "date-invalide",
      candidates,
    })).toEqual([]);
  });
});
