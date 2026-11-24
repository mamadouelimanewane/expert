import { describe, expect, it, vi } from "vitest";

const { auditCreate, auditFindMany, declarationsFindMany, missionsFindMany, journalsFindMany } = vi.hoisted(() => ({ auditCreate: vi.fn(), auditFindMany: vi.fn(), declarationsFindMany: vi.fn(), missionsFindMany: vi.fn(), journalsFindMany: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ default: {
  auditLog: { create: auditCreate, findMany: auditFindMany },
  taxDeclaration: { findMany: declarationsFindMany },
  mission: { findMany: missionsFindMany },
  tpeJournal: { findMany: journalsFindMany },
} }));
vi.mock("@/lib/auth", () => ({ AuthService: { getSession: vi.fn(async () => ({ id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" })) } }));

import { AuditService } from "@/lib/audit";

describe("service de journal d’audit tenant-aware", () => {
  it("attache le cabinet courant à chaque événement d’audit", async () => {
    await AuditService.log({ action: "CREATE", entity: "MISSION" });
    expect(auditCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ cabinetId: "507f1f77bcf86cd799439011" }) }));
  });

  it("filtre les événements récents par cabinet", async () => {
    auditFindMany.mockResolvedValueOnce([]);
    await AuditService.getRecentLogs(5, "507f1f77bcf86cd799439011");
    expect(auditFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" }, take: 5 }));
  });

  it("scinde le score de risque sur le cabinet et le client", async () => {
    declarationsFindMany.mockResolvedValueOnce([]);
    missionsFindMany.mockResolvedValueOnce([]);
    journalsFindMany.mockResolvedValueOnce([]);
    await AuditService.calculateRiskScore("507f1f77bcf86cd799439033", "507f1f77bcf86cd799439011");
    for (const query of [declarationsFindMany, missionsFindMany, journalsFindMany]) {
      expect(query).toHaveBeenCalledWith({ where: { clientId: "507f1f77bcf86cd799439033", cabinetId: "507f1f77bcf86cd799439011" } });
    }
  });
});
