import { describe, expect, it } from "vitest";
import { buildTpeJournalReversal, isTpeJournalTransitionAllowed } from "@/lib/accounting-journal";

const entry = {
  id: "507f1f77bcf86cd799439011",
  periode: "2026-04",
  businessName: "SARL Test",
  date: "2026-04-12",
  libelle: "Achat fournitures",
  entree: 0,
  sortie: 25_000,
  debitCompte: "601000",
  debitIntitule: "Achats",
  creditCompte: "571000",
  creditIntitule: "Caisse",
  montant: 25_000,
  clientId: "507f1f77bcf86cd799439012",
};

describe("contrepassation des écritures comptabilisées", () => {
  it("limite le cycle d'une écriture aux transitions de revue explicites", () => {
    expect(isTpeJournalTransitionAllowed("PENDING", "APPROVED")).toBe(true);
    expect(isTpeJournalTransitionAllowed("PENDING", "REJECTED")).toBe(true);
    expect(isTpeJournalTransitionAllowed("APPROVED", "EXPORTED")).toBe(true);
    expect(isTpeJournalTransitionAllowed("EXPORTED", "PENDING")).toBe(false);
    expect(isTpeJournalTransitionAllowed("EXPORTED", "APPROVED")).toBe(false);
    expect(isTpeJournalTransitionAllowed("REJECTED", "APPROVED")).toBe(false);
  });

  it("crée une écriture inverse en brouillon dans la période courante", () => {
    const now = new Date("2026-11-18T12:00:00.000Z");
    const reversal = buildTpeJournalReversal(entry, "Annulation validée après erreur de saisie", now);

    expect(reversal).toMatchObject({
      periode: "2026-11",
      date: "2026-11-18",
      businessName: entry.businessName,
      entree: 25_000,
      sortie: 0,
      debitCompte: "571000",
      creditCompte: "601000",
      montant: 25_000,
      status: "PENDING",
      source: "REVERSAL",
      reversedFromId: entry.id,
      reversalReason: "Annulation validée après erreur de saisie",
    });
    expect(reversal.id).toMatch(/^[a-f0-9]{24}$/);
  });

  it("génère le même identifiant pour rendre les reprises de requête idempotentes", () => {
    const reason = "Correction de l'écriture après revue.";
    expect(buildTpeJournalReversal(entry, reason).id).toBe(buildTpeJournalReversal(entry, reason).id);
  });

  it("refuse un motif trop court ou un montant non positif", () => {
    expect(() => buildTpeJournalReversal(entry, "erreur")).toThrow(/motif/);
    expect(() => buildTpeJournalReversal({ ...entry, montant: 0 }, "motif suffisamment détaillé")).toThrow(/montant/);
  });
});
