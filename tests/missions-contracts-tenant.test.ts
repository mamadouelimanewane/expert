import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, missionFindMany, missionFindFirst, missionCreate, letterFindMany, letterFindFirst, letterCreate, orderFindFirst, orderUpdateMany, auditLog } = vi.hoisted(() => ({
  clientFindFirst: vi.fn(), missionFindMany: vi.fn(), missionFindFirst: vi.fn(), missionCreate: vi.fn(), letterFindMany: vi.fn(), letterFindFirst: vi.fn(), letterCreate: vi.fn(), orderFindFirst: vi.fn(), orderUpdateMany: vi.fn(), auditLog: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  client: { findFirst: clientFindFirst },
  mission: { findMany: missionFindMany, findFirst: missionFindFirst, create: missionCreate },
  engagementLetter: { findMany: letterFindMany, findFirst: letterFindFirst, create: letterCreate },
  missionOrder: { findFirst: orderFindFirst, updateMany: orderUpdateMany },
} }));
vi.mock("@/lib/audit", () => ({ AuditService: { log: auditLog } }));

import { GET as listMissions, POST as createMission } from "@/app/api/missions/route";
import { POST as createLetter } from "@/app/api/engagement-letters/route";
import { PATCH as updateOrder } from "@/app/api/mission-orders/route";

const cabinetId = "507f1f77bcf86cd799439011";
const foreignId = "507f1f77bcf86cd799439099";

describe("missions et documents contractuels isolés par cabinet", () => {
  it("filtre la liste des missions par cabinet", async () => {
    missionFindMany.mockResolvedValueOnce([]);
    const response = await listMissions(new Request("http://localhost/api/missions") as never);
    expect(response.status).toBe(200);
    expect(missionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId } }));
  });

  it("refuse une mission rattachée à un client étranger", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await createMission(new Request("http://localhost/api/missions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Audit", clientId: foreignId }) }) as never);
    expect(response.status).toBe(404);
    expect(missionCreate).not.toHaveBeenCalled();
  });

  it("refuse une lettre de mission pour un client étranger", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await createLetter(new Request("http://localhost/api/engagement-letters", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scope: "Audit légal", clientId: foreignId }) }) as never);
    expect(response.status).toBe(404);
    expect(letterCreate).not.toHaveBeenCalled();
  });

  it("refuse de modifier un ordre de mission étranger", async () => {
    orderFindFirst.mockResolvedValueOnce(null);
    const response = await updateOrder(new Request("http://localhost/api/mission-orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: foreignId, status: "APPROUVE" }) }) as never);
    expect(response.status).toBe(404);
    expect(orderUpdateMany).not.toHaveBeenCalled();
  });
});
