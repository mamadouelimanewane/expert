import { describe, expect, it, vi } from "vitest";

const { groupFindFirst, groupCreate, entityCreate, clientFindFirst } = vi.hoisted(() => ({ groupFindFirst: vi.fn(), groupCreate: vi.fn(), entityCreate: vi.fn(), clientFindFirst: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  consolidationGroup: { findFirst: groupFindFirst, create: groupCreate },
  consolidationEntity: { create: entityCreate },
  client: { findFirst: clientFindFirst },
} }));

import { GET, POST } from "@/app/api/corporate/consolidation/route";

describe("consolidation isolée par cabinet", () => {
  it("ne consulte que le groupe du cabinet et ne le crée pas au GET", async () => {
    groupFindFirst.mockResolvedValueOnce(null);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(groupFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId: "507f1f77bcf86cd799439011" } }));
    expect(groupCreate).not.toHaveBeenCalled();
  });

  it("refuse un groupe étranger avant de créer une entité", async () => {
    groupFindFirst.mockResolvedValueOnce(null);
    const response = await POST(new Request("http://localhost/api/corporate/consolidation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ groupId: "507f1f77bcf86cd799439099", name: "Filiale" }) }) as never);
    expect(response.status).toBe(404);
    expect(entityCreate).not.toHaveBeenCalled();
  });
});
