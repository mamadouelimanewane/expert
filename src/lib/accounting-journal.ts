import { createHash } from "node:crypto";

export type TpeJournalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPORTED";

const TRANSITIONS: Record<TpeJournalStatus, readonly TpeJournalStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["EXPORTED"],
  REJECTED: [],
  EXPORTED: [],
};

export function isTpeJournalTransitionAllowed(from: TpeJournalStatus, to: TpeJournalStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export type TpeJournalReversible = {
  id: string;
  periode: string;
  businessName: string;
  date: string;
  libelle: string;
  entree: number;
  sortie: number;
  debitCompte: string;
  debitIntitule: string;
  creditCompte: string;
  creditIntitule: string;
  montant: number;
  clientId: string;
};

/**
 * Build a stable, pending contra-entry. The deterministic ObjectId makes a
 * repeated request for the same original entry idempotent at the primary key;
 * the new line must still pass the normal human approval before posting.
 */
export function buildTpeJournalReversal(
  entry: TpeJournalReversible,
  reason: string,
  now = new Date(),
) {
  const motif = reason.trim();
  if (motif.length < 10 || motif.length > 500) {
    throw new Error("Le motif de contrepassation doit contenir entre 10 et 500 caractères.");
  }
  if (!Number.isFinite(entry.montant) || entry.montant <= 0) {
    throw new Error("Le montant de l'écriture d'origine est invalide.");
  }

  const id = createHash("sha256")
    .update(`cabinet360:tpe-reversal:${entry.id}`)
    .digest("hex")
    .slice(0, 24);
  const date = now.toISOString().slice(0, 10);
  const periode = date.slice(0, 7);

  return {
    id,
    periode,
    businessName: entry.businessName,
    date,
    libelle: `Contrepassation ${entry.id}`,
    entree: entry.sortie,
    sortie: entry.entree,
    debitCompte: entry.creditCompte,
    debitIntitule: entry.creditIntitule,
    creditCompte: entry.debitCompte,
    creditIntitule: entry.debitIntitule,
    montant: entry.montant,
    source: "REVERSAL",
    rawContent: motif,
    status: "PENDING",
    clientId: entry.clientId,
    reversedFromId: entry.id,
    reversalReason: motif,
    rejectedById: null,
    rejectedAt: null,
    approvedById: null,
    approvedAt: null,
    exportedAt: null,
  };
}
