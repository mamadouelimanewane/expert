import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

import { headers } from "next/headers";
import type { PrismaClient } from "@prisma/client";
import { construireClient } from "@/lib/prisma";
import { TENANT_PRISMA_MODELS } from "@/lib/tenant-models";
import { runWithPortalTenantContext } from "@/lib/tenant-context";

type OperationHook = (input: {
  model: string;
  operation: string;
  args: Record<string, unknown>;
  query: (args: Record<string, unknown>) => Promise<unknown>;
}) => Promise<unknown>;

const cabinetA = "507f1f77bcf86cd799439011";
const cabinetB = "507f1f77bcf86cd799439022";
const userA = "507f1f77bcf86cd799439031";
const userB = "507f1f77bcf86cd799439032";
let operation: OperationHook;
let base: Record<string, any>;

function contexte(cabinetId: string, userId: string, requestId: string) {
  vi.mocked(headers).mockResolvedValue(new Headers({
    "x-c360-cabinet-id": cabinetId,
    "x-c360-user-id": userId,
    "x-c360-role": "ADMIN",
    "x-c360-request-id": requestId,
  }) as never);
}

async function appliquer(
  cabinetId: string,
  userId: string,
  requestId: string,
  model: string,
  method: string,
  args: Record<string, unknown>,
) {
  contexte(cabinetId, userId, requestId);
  return operation({ model, operation: method, args, query: async (scoped) => scoped });
}

describe("cloisonnement Prisma entre cabinets", () => {
  beforeEach(() => {
    vi.mocked(headers).mockReset();
    base = {
      $extends: vi.fn((extension: any) => {
        operation = extension.query.$allOperations;
        return {};
      }),
      user: { findFirst: vi.fn(async ({ where }: any) => ({ id: where.id, role: "ADMIN" })) },
      cabinet: { findUnique: vi.fn(async () => ({ statut: "ACTIVE" })) },
      client: { findFirst: vi.fn(async () => null) },
    };
    construireClient(base as unknown as PrismaClient);
  });

  it("déduit automatiquement tous les modèles locataires du schéma Prisma", () => {
    expect(TENANT_PRISMA_MODELS.length).toBeGreaterThan(60);
    expect(TENANT_PRISMA_MODELS.map((model) => model.name)).toContain("YearEndClose");
    expect(TENANT_PRISMA_MODELS.map((model) => model.name)).toContain("AuditSample");
  });

  it("borne les recherches par identifiant au cabinet de la session", async () => {
    const result = await appliquer(cabinetA, userA, "request-a", "Client", "findUnique", {
      where: { id: "507f1f77bcf86cd799439099" },
    }) as { where: Record<string, string> };
    expect(result.where).toEqual({ id: "507f1f77bcf86cd799439099", cabinetId: cabinetA });
  });

  it("isole des lectures identiques sous deux cabinets distincts", async () => {
    const query = { where: { status: "ACTIVE" } };
    const resultA = await appliquer(cabinetA, userA, "request-a-2", "Client", "findMany", query) as { where: Record<string, string> };
    const resultB = await appliquer(cabinetB, userB, "request-b-2", "Client", "findMany", query) as { where: Record<string, string> };
    expect(resultA.where.cabinetId).toBe(cabinetA);
    expect(resultB.where.cabinetId).toBe(cabinetB);
  });

  it("force le cabinet de session à la création même si le corps en fournit un autre", async () => {
    const result = await appliquer(cabinetA, userA, "request-a-3", "Client", "create", {
      data: { nom: "Client test", cabinetId: cabinetB },
    }) as { data: Record<string, string> };
    expect(result.data.cabinetId).toBe(cabinetA);
  });

  it("rejette une relation vers un client d'un autre cabinet", async () => {
    base.client.findFirst.mockResolvedValue(null);
    await expect(appliquer(cabinetA, userA, "request-a-4", "Mission", "create", {
      data: { clientId: "507f1f77bcf86cd799439088", cabinetId: cabinetA },
    })).rejects.toThrow("Référence hors cabinet refusée.");
    expect(base.client.findFirst).toHaveBeenCalledWith({
      where: { id: "507f1f77bcf86cd799439088", cabinetId: cabinetA },
      select: { id: true },
    });
  });

  it("refuse toute requête quand l'utilisateur session ne possède pas le cabinet", async () => {
    base.user.findFirst.mockResolvedValue(null);
    await expect(appliquer(cabinetA, userB, "request-invalid", "Client", "findMany", {}))
      .rejects.toThrow("Session ou cabinet révoqué.");
  });

  it("limite la lecture des périodes clôturées du portail au client et au cabinet du jeton", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers() as never);
    const clientId = "507f1f77bcf86cd799439041";
    const result = await runWithPortalTenantContext(
      { cabinetId: cabinetA, clientId },
      () => operation({
        model: "AccountingPeriodLock",
        operation: "findUnique",
        args: { where: { clientId_periode: { clientId, periode: "2026-11" } } },
        query: async (scoped) => scoped,
      }),
    ) as { where: Record<string, any> };
    expect(result.where).toEqual({
      clientId_periode: { clientId, periode: "2026-11" },
      clientId,
      cabinetId: cabinetA,
    });
  });
});
