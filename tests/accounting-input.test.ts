import { describe, expect, it } from "vitest";
import { classifyManualAccountingInput, parseSingleAccountingAmount } from "@/lib/accounting-input";

describe("pré-imputation manuelle prudente", () => {
  it("lit un montant entier explicite avec séparateurs de milliers", () => {
    expect(parseSingleAccountingAmount("Vendu 1.250.000 FCFA de marchandises")).toBe(1_250_000);
    expect(parseSingleAccountingAmount("Payé 50 000 pour le transport")).toBe(50_000);
  });

  it("refuse un montant absent ou plusieurs montants dans une même ligne", () => {
    expect(parseSingleAccountingAmount("Vendu des marchandises")).toBeNull();
    expect(parseSingleAccountingAmount("Vendu 50 000 et payé 10 000")).toBeNull();
  });

  it("pré-impute une opération reconnue comme brouillon à faire valider", () => {
    expect(classifyManualAccountingInput("Payé 15 000 pour le transport")).toMatchObject({
      ok: true,
      direction: "SORTIE",
      amount: 15_000,
      account: "613000",
      confidence: 0.65,
    });
  });

  it("garde une nature de dépense inconnue en compte d'attente avec une confiance faible", () => {
    expect(classifyManualAccountingInput("Payé 12 000 pour service divers")).toMatchObject({
      ok: true,
      direction: "SORTIE",
      amount: 12_000,
      account: "471000",
      confidence: 0.25,
    });
  });

  it("refuse une direction ambigüe ou non reconnue au lieu de créer une écriture", () => {
    expect(classifyManualAccountingInput("Vendu 50 000 puis payé 10 000")).toMatchObject({ ok: false });
    expect(classifyManualAccountingInput("Opération 50 000")).toMatchObject({ ok: false });
    expect(classifyManualAccountingInput("Payé sans indiquer de montant")).toMatchObject({ ok: false });
  });
});
