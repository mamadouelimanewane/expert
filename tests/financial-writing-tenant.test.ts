import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, clientFindMany, assetFindMany, financialFindMany, financialFindFirst, correspondenceFindMany } = vi.hoisted(() => ({
  clientFindFirst: vi.fn(), clientFindMany: vi.fn(), assetFindMany: vi.fn(), financialFindMany: vi.fn(), financialFindFirst: vi.fn(), correspondenceFindMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  client: { findFirst: clientFindFirst, findMany: clientFindMany },
  personalAsset: { findMany: assetFindMany },
  financialData: { findMany: financialFindMany, findFirst: financialFindFirst },
  correspondence: { findMany: correspondenceFindMany },
} }));
vi.mock("@/lib/audit", () => ({ AuditService: { log: vi.fn() } }));

import { GET as getAssets } from "@/app/api/wealth/assets/route";
import { GET as getRatios } from "@/app/api/analysis/financial-ratios/route";
import { GET as getBenchmark } from "@/app/api/benchmarking/route";
import { GET as getCorrespondences } from "@/app/api/writing/correspondences/route";

const foreignId = "507f1f77bcf86cd799439099";

describe("données financières et rédaction isolées par cabinet", () => {
  it("refuse les actifs patrimoniaux d’un client étranger avant lecture", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await getAssets(new Request(`http://localhost/api/wealth/assets?clientId=${foreignId}`) as never);
    expect(response.status).toBe(404);
    expect(assetFindMany).not.toHaveBeenCalled();
  });

  it("refuse une analyse financière d’un client étranger", async () => {
    clientFindMany.mockResolvedValueOnce([]);
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await getRatios(new Request(`http://localhost/api/analysis/financial-ratios?clientId=${foreignId}`) as never);
    expect(response.status).toBe(404);
    expect(financialFindMany).not.toHaveBeenCalled();
  });

  it("refuse le benchmarking d’un client étranger", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await getBenchmark(new Request(`http://localhost/api/benchmarking?clientId=${foreignId}`) as never);
    expect(response.status).toBe(404);
    expect(financialFindFirst).not.toHaveBeenCalled();
  });

  it("refuse de filtrer les courriers sur un client étranger", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await getCorrespondences(new Request(`http://localhost/api/writing/correspondences?clientId=${foreignId}`) as never);
    expect(response.status).toBe(404);
    expect(correspondenceFindMany).not.toHaveBeenCalled();
  });
});
