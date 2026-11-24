import { describe, expect, it, vi } from "vitest";

const { groupFindFirst, entityFindFirst, eliminationCreate, eliminationDeleteMany, balanceDeleteMany, balanceCreateMany, transaction } = vi.hoisted(() => ({
  groupFindFirst: vi.fn(), entityFindFirst: vi.fn(), eliminationCreate: vi.fn(), eliminationDeleteMany: vi.fn(), balanceDeleteMany: vi.fn(), balanceCreateMany: vi.fn(), transaction: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  consolidationGroup: { findFirst: groupFindFirst },
  consolidationEntity: { findFirst: entityFindFirst },
  consolidationElimination: { create: eliminationCreate, deleteMany: eliminationDeleteMany },
  consolidationBalanceLine: { deleteMany: balanceDeleteMany, createMany: balanceCreateMany },
  $transaction: transaction,
} }));

import { POST as createElimination, DELETE as deleteElimination } from "@/app/api/corporate/consolidation/eliminations/route";
import { POST as importBalance } from "@/app/api/corporate/consolidation/balance/route";

const foreignId = "507f1f77bcf86cd799439099";
describe("sous-routes de consolidation isolées par cabinet", () => {
  it("refuse une élimination pour un groupe étranger", async () => {
    groupFindFirst.mockResolvedValueOnce(null);
    const response = await createElimination(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ groupId: foreignId, debitAccount: "401", creditAccount: "701", amount: 1000 }) }) as never);
    expect(response.status).toBe(404);
    expect(eliminationCreate).not.toHaveBeenCalled();
  });

  it("ne supprime pas une élimination étrangère", async () => {
    eliminationDeleteMany.mockResolvedValueOnce({ count: 0 });
    const response = await deleteElimination(new Request(`http://localhost?id=${foreignId}`) as never);
    expect(response.status).toBe(404);
    expect(eliminationDeleteMany).toHaveBeenCalledWith({ where: { id: foreignId, cabinetId: "507f1f77bcf86cd799439011" } });
  });

  it("refuse l’import de balance dans une entité étrangère", async () => {
    entityFindFirst.mockResolvedValueOnce(null);
    const response = await importBalance(new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entityId: foreignId, lines: [{ compte: "401", libelle: "Fournisseur", debit: 0, credit: 1000 }] }) }) as never);
    expect(response.status).toBe(404);
    expect(transaction).not.toHaveBeenCalled();
  });
});
