import { describe, expect, it, vi } from "vitest";

const { ruleFindMany, ruleFindFirst, ruleCreate, ruleUpdateMany, activationCreate, activationDeleteMany } = vi.hoisted(() => ({
  ruleFindMany: vi.fn(), ruleFindFirst: vi.fn(), ruleCreate: vi.fn(), ruleUpdateMany: vi.fn(), activationCreate: vi.fn(), activationDeleteMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", role: "EXPERT" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  regulatoryObligationRule: { findMany: ruleFindMany, findFirst: ruleFindFirst, create: ruleCreate, updateMany: ruleUpdateMany },
  regulatoryObligationActivation: { create: activationCreate, deleteMany: activationDeleteMany },
} }));
vi.mock("@/lib/audit", () => ({ AuditService: { log: vi.fn() } }));

import { GET, PATCH } from "@/app/api/conformite/regles/route";

const cabinetId = "507f1f77bcf86cd799439011";
const foreignId = "507f1f77bcf86cd799439099";
describe("règles réglementaires isolées par cabinet", () => {
  it("filtre le catalogue de règles par cabinet", async () => {
    ruleFindMany.mockResolvedValueOnce([]);
    const response = await GET(new Request("http://localhost/api/conformite/regles?country=SN"));
    expect(response.status).toBe(200);
    expect(ruleFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId, country: "SN" } }));
  });

  it("ne permet pas de revoir une règle étrangère", async () => {
    ruleFindFirst.mockResolvedValueOnce(null);
    const response = await PATCH(new Request("http://localhost/api/conformite/regles", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: foreignId, action: "VALIDATE", reviewComment: "Contrôle de source officielle effectué." }) }));
    expect(response.status).toBe(404);
    expect(ruleUpdateMany).not.toHaveBeenCalled();
    expect(activationCreate).not.toHaveBeenCalled();
  });
});
