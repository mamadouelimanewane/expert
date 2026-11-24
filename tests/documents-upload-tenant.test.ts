import { describe, expect, it, vi } from "vitest";

const { clientFindFirst, documentCreate } = vi.hoisted(() => ({ clientFindFirst: vi.fn(), documentCreate: vi.fn() }));
vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" }, denied: null })),
}));
vi.mock("@/lib/prisma", () => ({ default: { client: { findFirst: clientFindFirst }, document: { create: documentCreate } } }));
vi.mock("@/lib/ocr-engine", () => ({ processUploadedInvoice: vi.fn() }));
vi.mock("@/lib/uploads", () => ({ dossierUploads: () => "C:/tmp" }));
vi.mock("@/lib/stockage-pieces", () => ({ stockerPiece: vi.fn(), supprimerPiece: vi.fn(), lirePiece: vi.fn() }));
vi.mock("@/lib/audit", () => ({ AuditService: { log: vi.fn() } }));

import { POST } from "@/app/api/documents/route";

describe("téléversement de pièces isolé par cabinet", () => {
  it("refuse le stockage avant upload si le client appartient à un autre cabinet", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const form = new FormData();
    form.set("file", new Blob(["test"], { type: "application/pdf" }), "contrat.pdf");
    form.set("clientId", "507f1f77bcf86cd799439099");
    form.set("type", "CONTRAT");
    const response = await POST(new Request("http://localhost/api/documents", { method: "POST", body: form }) as never);
    expect(response.status).toBe(404);
    expect(clientFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "507f1f77bcf86cd799439099", cabinetId: "507f1f77bcf86cd799439011" } }));
    expect(documentCreate).not.toHaveBeenCalled();
  });
});
