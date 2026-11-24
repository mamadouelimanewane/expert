import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, invoiceFindMany, invoiceCount, invoiceAggregate, invoiceFindFirst, invoiceCreate, invoiceUpdateMany } = vi.hoisted(() => ({
  clientFindFirst: vi.fn(), invoiceFindMany: vi.fn(), invoiceCount: vi.fn(), invoiceAggregate: vi.fn(), invoiceFindFirst: vi.fn(), invoiceCreate: vi.fn(), invoiceUpdateMany: vi.fn(),
}));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: {
  client: { findFirst: clientFindFirst },
  invoice: { findMany: invoiceFindMany, count: invoiceCount, aggregate: invoiceAggregate, findFirst: invoiceFindFirst, create: invoiceCreate, updateMany: invoiceUpdateMany },
} }));

import { GET, PATCH, POST } from "@/app/api/invoices/route";

const cabinetId = "507f1f77bcf86cd799439011";
const foreignId = "507f1f77bcf86cd799439099";
describe("factures isolées par cabinet", () => {
  it("filtre la liste et tous ses indicateurs par cabinet", async () => {
    invoiceFindMany.mockResolvedValueOnce([]);
    invoiceCount.mockResolvedValue(0);
    invoiceAggregate.mockResolvedValue({ _sum: { total: 0 } });
    const response = await GET(new Request("http://localhost/api/invoices") as never);
    expect(response.status).toBe(200);
    expect(invoiceFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId } }));
    expect(invoiceCount).toHaveBeenCalledWith(expect.objectContaining({ where: { cabinetId } }));
    expect(invoiceAggregate).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ cabinetId }) }));
  });

  it("refuse de créer une facture pour un client étranger", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const response = await POST(new Request("http://localhost/api/invoices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ clientId: foreignId, dueDate: "2026-12-01", lines: [{ designation: "Conseil", quantity: 1, unitPrice: 50000 }] }) }));
    expect(response.status).toBe(404);
    expect(invoiceCreate).not.toHaveBeenCalled();
  });

  it("refuse de modifier une facture étrangère", async () => {
    invoiceFindFirst.mockResolvedValueOnce(null);
    const response = await PATCH(new Request("http://localhost/api/invoices", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: foreignId, status: "PAID" }) }));
    expect(response.status).toBe(404);
    expect(invoiceUpdateMany).not.toHaveBeenCalled();
  });
});
