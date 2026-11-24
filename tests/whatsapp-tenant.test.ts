import { beforeEach, describe, expect, it, vi } from "vitest";

const { clientFindFirst, journalCreateMany, processEntry, toPairedEntries } = vi.hoisted(() => ({
  clientFindFirst: vi.fn(), journalCreateMany: vi.fn(), processEntry: vi.fn(), toPairedEntries: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: { client: { findFirst: clientFindFirst }, tpeJournal: { createMany: journalCreateMany } } }));
vi.mock("@/lib/accounting-engine", () => ({ AccountingEngine: { processEntry: processEntry, toPairedEntries } }));
vi.mock("@/lib/whatsapp", () => ({ isWhatsAppConfigured: () => false, sendWhatsAppMessage: vi.fn() }));

import { processIncomingWhatsAppMessage } from "@/lib/whatsapp-processor";

describe("simulation WhatsApp isolée par cabinet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientFindFirst.mockResolvedValue({ id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011", phone: "+221 77 123 45 67", companyName: "Client test", firstName: "", lastName: "" });
    processEntry.mockResolvedValue({ lignes: [], confidence: 1, requiresReview: false });
    toPairedEntries.mockReturnValue([{ debitCompte: "521", debitIntitule: "Banque", creditCompte: "701", creditIntitule: "Ventes", montant: 25000 }]);
    journalCreateMany.mockResolvedValue({ count: 1 });
  });

  it("résout le client avec les deux identifiants de cabinet et dossier", async () => {
    await processIncomingWhatsAppMessage({ senderPhone: "+221 77 123 45 67", messageType: "text", textBody: "Vente reçue 25000 FCFA", simulate: true, cabinetId: "507f1f77bcf86cd799439011", clientId: "507f1f77bcf86cd799439022" });
    expect(clientFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "507f1f77bcf86cd799439022", cabinetId: "507f1f77bcf86cd799439011" } }));
    expect(journalCreateMany).toHaveBeenCalledWith(expect.objectContaining({ data: [expect.objectContaining({ cabinetId: "507f1f77bcf86cd799439011", clientId: "507f1f77bcf86cd799439022", source: "WHATSAPP_TEST" })] }));
  });

  it("n’écrit rien si le dossier n’existe pas dans le cabinet demandé", async () => {
    clientFindFirst.mockResolvedValueOnce(null);
    const result = await processIncomingWhatsAppMessage({ senderPhone: "+221 77 123 45 67", messageType: "text", textBody: "Vente reçue 25000 FCFA", simulate: true, cabinetId: "507f1f77bcf86cd799439011", clientId: "507f1f77bcf86cd799439022" });
    expect(result.status).toBe("unknown_client");
    expect(journalCreateMany).not.toHaveBeenCalled();
  });
});
