import { describe, expect, it } from "vitest";
import {
  AUDIT_REVIEW_REFERENCE_TYPES,
  canManageReviewResolution,
  canReviewAuditSection,
  evidenceVersionMatches,
  tpeJournalReviewVersion,
  validReviewCommentText,
} from "@/lib/audit-review-policy";

describe("règles des points de revue d'audit", () => {
  it("limite les références aux preuves prises en charge", () => {
    expect(AUDIT_REVIEW_REFERENCE_TYPES).toEqual(["DOCUMENT", "WORK_PAPER", "TPE_JOURNAL"]);
  });

  it("réserve la résolution et la réouverture à l'expert et à l'administrateur", () => {
    expect(canManageReviewResolution("EXPERT")).toBe(true);
    expect(canManageReviewResolution("ADMIN")).toBe(true);
    expect(canManageReviewResolution("COLLABORATOR")).toBe(false);
    expect(canManageReviewResolution("ASSISTANT")).toBe(false);
  });

  it("exige une conclusion et toutes les diligences terminées avant revue", () => {
    expect(canReviewAuditSection("SATISFAISANT", ["TERMINE", "TERMINE"])).toBe(true);
    expect(canReviewAuditSection(null, ["TERMINE"])).toBe(false);
    expect(canReviewAuditSection("RESERVE", ["TERMINE", "EN_COURS"])).toBe(false);
  });

  it("compare la version de preuve sans tolérer une modification", () => {
    const current = new Date("2026-11-18T10:00:00.000Z");
    expect(evidenceVersionMatches(current, "2026-11-18T10:00:00.000Z")).toBe(true);
    expect(evidenceVersionMatches(current, "2026-11-18T10:00:01.000Z")).toBe(false);
    expect(evidenceVersionMatches(current, "pas-une-date")).toBe(false);
  });

  it("empreinte le contenu des journaux TPE sans champ updatedAt", () => {
    const row = {
      createdAt: "2026-11-18T10:00:00.000Z", periode: "2026-11", date: "2026-11-01", libelle: "Vente",
      entree: 100, sortie: 0, debitCompte: "521", debitIntitule: "Caisse", creditCompte: "701",
      creditIntitule: "Ventes", montant: 100, status: "APPROVED", exportedAt: null,
    };
    expect(tpeJournalReviewVersion(row)).toBe(tpeJournalReviewVersion({ ...row }));
    expect(tpeJournalReviewVersion(row)).not.toBe(tpeJournalReviewVersion({ ...row, montant: 125 }));
  });

  it("valide les commentaires après suppression des espaces périphériques", () => {
    expect(validReviewCommentText("  préciser la pièce justificative  ")).toBe(true);
    expect(validReviewCommentText("    ")).toBe(false);
    expect(validReviewCommentText("abc", 3, 200)).toBe(true);
    expect(validReviewCommentText("x".repeat(201), 3, 200)).toBe(false);
  });
});
