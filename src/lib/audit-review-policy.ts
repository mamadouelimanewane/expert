export const AUDIT_REVIEW_REFERENCE_TYPES = ["DOCUMENT", "WORK_PAPER", "TPE_JOURNAL"] as const;
export type AuditReviewReferenceType = (typeof AUDIT_REVIEW_REFERENCE_TYPES)[number];

export function canManageReviewResolution(role: string): boolean {
  return role === "ADMIN" || role === "EXPERT";
}

export function canReviewAuditSection(conclusion: string | null, itemStatuses: readonly string[]): boolean {
  return Boolean(conclusion) && itemStatuses.every((status) => status === "TERMINE");
}

export function evidenceVersionMatches(currentUpdatedAt: Date, suppliedVersion: string): boolean {
  return Number.isFinite(Date.parse(suppliedVersion)) && currentUpdatedAt.toISOString() === new Date(suppliedVersion).toISOString();
}

export type TpeJournalReviewEvidence = {
  createdAt: Date | string;
  periode: string;
  date: string;
  libelle: string;
  entree: number;
  sortie: number;
  debitCompte: string;
  debitIntitule: string;
  creditCompte: string;
  creditIntitule: string;
  montant: number;
  status: string;
  exportedAt: Date | string | null;
};

/** Fingerprint of the TPE journal content, which has no updatedAt field. */
export function tpeJournalReviewVersion(row: TpeJournalReviewEvidence): string {
  const createdAt = new Date(row.createdAt).toISOString();
  const exportedAt = row.exportedAt ? new Date(row.exportedAt).toISOString() : "";
  const content = JSON.stringify([
    row.periode, row.date, row.libelle, row.entree, row.sortie, row.debitCompte,
    row.debitIntitule, row.creditCompte, row.creditIntitule, row.montant, row.status, exportedAt,
  ]);
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) hash = Math.imul(hash ^ content.charCodeAt(i), 16777619);
  return `${createdAt}#${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function validReviewCommentText(value: unknown, min = 5, max = 5000): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}
