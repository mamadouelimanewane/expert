import { describe, expect, it, vi } from "vitest";

const { documentFindFirst, documentFindMany, documentUpdateMany } = vi.hoisted(() => ({ documentFindFirst: vi.fn(), documentFindMany: vi.fn(), documentUpdateMany: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({ requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", name: "Expert", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })) }));
vi.mock("@/lib/prisma", () => ({ default: { document: { findFirst: documentFindFirst, findMany: documentFindMany, updateMany: documentUpdateMany } } }));
vi.mock("@/lib/audit", () => ({ AuditService: { log: vi.fn() } }));
vi.mock("@/lib/ocr-vision", () => ({ lireFactureParVision: vi.fn(), ocrDataDepuisFacture: vi.fn(), visionConfiguree: () => true, MODELE_VISION: "mock" }));
vi.mock("@/lib/stockage-pieces", () => ({ lirePiece: vi.fn() }));

import { POST as readWithAi } from "@/app/api/documents/[id]/relire-ia/route";
import { PATCH as reviewInvoice } from "@/app/api/documents/[id]/review/route";

const foreignId = "507f1f77bcf86cd799439099";
const context = { params: Promise.resolve({ id: foreignId }) };
describe("actions GED isolées par cabinet", () => {
  it("refuse la relecture IA d’une pièce étrangère", async () => {
    documentFindFirst.mockResolvedValueOnce(null);
    const response = await readWithAi(new Request("http://localhost", { method: "POST" }) as never, context);
    expect(response.status).toBe(404);
    expect(documentUpdateMany).not.toHaveBeenCalled();
  });

  it("refuse la validation OCR d’une facture étrangère", async () => {
    documentFindFirst.mockResolvedValueOnce(null);
    const response = await reviewInvoice(new Request("http://localhost", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ supplier: "Fournisseur SA", invoiceNumber: "F-100", date: "2026-10-01", totalTTC: 50000 }) }), context);
    expect(response.status).toBe(404);
    expect(documentFindMany).not.toHaveBeenCalled();
    expect(documentUpdateMany).not.toHaveBeenCalled();
  });
});
