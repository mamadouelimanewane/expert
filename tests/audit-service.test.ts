import { beforeEach, describe, expect, it, vi } from "vitest";

const { auditCreate, getSession, declarationFindMany, missionFindMany, journalFindMany } = vi.hoisted(() => ({ auditCreate: vi.fn(), getSession: vi.fn(), declarationFindMany: vi.fn(), missionFindMany: vi.fn(), journalFindMany: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ default: { auditLog: { create: auditCreate }, taxDeclaration: { findMany: declarationFindMany }, mission: { findMany: missionFindMany }, tpeJournal: { findMany: journalFindMany } } }));
vi.mock("@/lib/auth", () => ({ AuthService: { getSession } }));

import { AuditService } from "@/lib/audit";

describe("AuditService.log", () => {
  beforeEach(() => {
    auditCreate.mockReset().mockResolvedValue({ id: "audit-id" });
    getSession.mockReset().mockResolvedValue({ id: "0123456789abcdef01234567" });
    declarationFindMany.mockReset().mockResolvedValue([]);
    missionFindMany.mockReset().mockResolvedValue([]);
    journalFindMany.mockReset().mockResolvedValue([]);
  });

  it("normalise l'ancien format positionnel en journal structuré", async () => {
    const userId = "0123456789abcdef01234567";
    await AuditService.log(userId, "MISSION_SIZING_CALCUL", "missions", { heures: 12 });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "MISSION_SIZING_CALCUL",
        entity: "missions",
        details: JSON.stringify({ heures: 12 }),
        userId,
      }),
    });
  });

  it("préserve le format structuré utilisé par les nouvelles routes", async () => {
    await AuditService.log({ action: "CREATE", entity: "CLIENT", details: "Création" });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "CREATE", entity: "CLIENT", details: "Création" }),
    });
  });

  it("signale l'absence de données au lieu de créer un score de risque artificiel", async () => {
    const result = await AuditService.calculateRiskScore("507f1f77bcf86cd799439011");
    expect(result.globalScore).toBe("ND");
    expect(result.donneesDisponibles).toBe(0);
    expect(result.breakdown.every((item) => item.disponible === false)).toBe(true);
  });

  it("traite les montants ronds comme des signaux de revue, pas comme une preuve de fraude", async () => {
    journalFindMany.mockResolvedValueOnce([{ date: "2026-11-22", entree: 100_000, sortie: 0, status: "APPROVED" }]);
    const result = await AuditService.calculateRiskScore("507f1f77bcf86cd799439011");
    expect(result.breakdown.find((item) => item.category === "Contrôles à examiner")?.observations).toContain("ne constituent pas une preuve de fraude");
  });
});
