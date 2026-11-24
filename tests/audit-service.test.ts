import { beforeEach, describe, expect, it, vi } from "vitest";

const { auditCreate, getSession } = vi.hoisted(() => ({ auditCreate: vi.fn(), getSession: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ default: { auditLog: { create: auditCreate } } }));
vi.mock("@/lib/auth", () => ({ AuthService: { getSession } }));

import { AuditService } from "@/lib/audit";

describe("AuditService.log", () => {
  beforeEach(() => {
    auditCreate.mockReset().mockResolvedValue({ id: "audit-id" });
    getSession.mockReset().mockResolvedValue({ id: "0123456789abcdef01234567" });
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
});
