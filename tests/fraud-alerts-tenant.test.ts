import { describe, expect, it, vi } from "vitest";

const { alertFindMany, alertFindFirst, alertUpdateMany, alertGroupBy, alertCreate, txFindMany, txFindFirst, txCreate, clientFindFirst } = vi.hoisted(() => ({
  alertFindMany: vi.fn(), alertFindFirst: vi.fn(), alertUpdateMany: vi.fn(), alertGroupBy: vi.fn(), alertCreate: vi.fn(), txFindMany: vi.fn(), txFindFirst: vi.fn(), txCreate: vi.fn(), clientFindFirst: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
  analyserEnum: (value: string, values: string[], label: string) => values.includes(value) ? ({ ok: true, valeur: value }) : ({ ok: false, raison: `${label} invalide` }),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  fraudAlert: { findMany: alertFindMany, findFirst: alertFindFirst, updateMany: alertUpdateMany, groupBy: alertGroupBy, create: alertCreate },
  bankTransaction: { findMany: txFindMany, findFirst: txFindFirst, create: txCreate },
  client: { findFirst: clientFindFirst },
} }));
vi.mock("@/lib/audit", () => ({ AuditService: { log: vi.fn() } }));

import { GET, PATCH, POST } from "@/app/api/audit/fraud-alerts/route";

const foreignId = "507f1f77bcf86cd799439099";
describe("alertes de fraude isolées par cabinet", () => {
  it("filtre la liste et son agrégation par cabinet", async () => {
    alertFindMany.mockResolvedValueOnce([]);
    alertGroupBy.mockResolvedValueOnce([]);
    const response = await GET(new Request("http://localhost/api/audit/fraud-alerts") as never);
    expect(response.status).toBe(200);
    expect(alertFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" } }));
    expect(alertGroupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" } }));
  });

  it("refuse de modifier une alerte étrangère", async () => {
    alertFindFirst.mockResolvedValueOnce(null);
    const response = await PATCH(new Request("http://localhost/api/audit/fraud-alerts", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: foreignId, status: "ECARTEE" }) }) as never);
    expect(response.status).toBe(404);
    expect(alertUpdateMany).not.toHaveBeenCalled();
  });

  it("refuse une alerte manuelle qui référence un client étranger", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await POST(new Request("http://localhost/api/audit/fraud-alerts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Alerte", description: "À vérifier", ruleTriggered: "TEST", clientId: foreignId }) }) as never);
    expect(response.status).toBe(404);
    expect(alertCreate).not.toHaveBeenCalled();
  });
});
