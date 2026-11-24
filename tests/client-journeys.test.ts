import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  portalClientFindFirst: vi.fn(),
  clientCreate: vi.fn(),
  clientUpdate: vi.fn(),
  cabinetFindUnique: vi.fn(),
  clientFindUnique: vi.fn(),
  taxDeclarationFindMany: vi.fn(),
  communicationFindMany: vi.fn(),
  communicationCreate: vi.fn(),
  accountingPeriodLockFindUnique: vi.fn(),
  tpeJournalCreateMany: vi.fn(),
  workPaperFindUnique: vi.fn(),
  workPaperUpsert: vi.fn(),
  documentFindUnique: vi.fn(),
  readPiece: vi.fn(),
  activeTenantSeen: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    client: { findUnique: mocks.clientFindUnique, create: mocks.clientCreate, update: mocks.clientUpdate },
    taxDeclaration: { findMany: mocks.taxDeclarationFindMany },
    communication: { findMany: mocks.communicationFindMany, create: mocks.communicationCreate },
    accountingPeriodLock: { findUnique: mocks.accountingPeriodLockFindUnique },
    tpeJournal: { createMany: mocks.tpeJournalCreateMany },
    workPaper: { findUnique: mocks.workPaperFindUnique, upsert: mocks.workPaperUpsert },
    document: { findUnique: mocks.documentFindUnique },
  },
  prismaSystem: {
    client: { findFirst: mocks.portalClientFindFirst },
    cabinet: { findUnique: mocks.cabinetFindUnique },
  },
}));

vi.mock("@/lib/api-auth", () => ({
  requireStaff: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439013", name: "Expert Démo", role: "ADMIN", cabinetId: "507f1f77bcf86cd799439012" }, denied: null })),
  requireWriteAccess: vi.fn(async () => ({ session: { id: "507f1f77bcf86cd799439013", name: "Expert Démo", role: "ADMIN", cabinetId: "507f1f77bcf86cd799439012" }, denied: null })),
}));

vi.mock("@/lib/audit", () => ({ AuditService: { log: vi.fn(async () => undefined) } }));

vi.mock("@/lib/stockage-pieces", () => ({
  lirePiece: mocks.readPiece,
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: () => false,
  getStripe: vi.fn(() => { throw new Error("Stripe should not be called in the isolated journey simulation"); }),
}));

import { GET as portalDashboard } from "@/app/api/portal/[token]/route";
import { GET as portalObligations } from "@/app/api/portal/obligations/route";
import { GET as portalMessagesGet, POST as portalMessagesPost } from "@/app/api/portal/communications/route";
import { POST as portalJournalUpload } from "@/app/api/portal/upload-journal/route";
import { GET as portalDocumentGet } from "@/app/api/portal/documents/[id]/route";
import { GET as dashboardPreferencesGet, PUT as dashboardPreferencesPut } from "@/app/api/portal/dashboard-preferences/route";
import { POST as identitySessionPost } from "@/app/api/portal/onboarding/identity-session/route";
import { POST as sepaSessionPost } from "@/app/api/portal/onboarding/sepa-session/route";
import { POST as registrationPost } from "@/app/api/auth/register/route";
import { POST as clientCreatePost } from "@/app/api/clients/route";
import { GET as portalLinkGet, POST as portalLinkPost } from "@/app/api/clients/[id]/portal-link/route";
import { getPortalTenantContext } from "@/lib/tenant-context";

const CLIENT_ID = "507f1f77bcf86cd799439011";
const CABINET_ID = "507f1f77bcf86cd799439012";
const TOKEN = "a".repeat(64);

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function body(response: Response) {
  return response.json();
}

describe("parcours clients isolés par le portail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.portalClientFindFirst.mockImplementation(async () => ({
      id: CLIENT_ID,
      cabinetId: CABINET_ID,
      portalEnabled: true,
      companyName: "Société Démo",
      firstName: "Aminata",
      lastName: "Ba",
      email: "client@example.test",
      stripeCustomerId: null,
    }));
    mocks.clientCreate.mockImplementation(async ({ data }: any) => ({ id: CLIENT_ID, ...data }));
    mocks.clientUpdate.mockImplementation(async ({ data, select }: any) => ({ id: CLIENT_ID, companyName: "Société Démo", ...data }));
    mocks.cabinetFindUnique.mockResolvedValue({ id: CABINET_ID, statut: "ACTIVE", trialExpiresAt: null });
    mocks.clientFindUnique.mockImplementation(async (args: any) => {
      mocks.activeTenantSeen(getPortalTenantContext());
      return {
        id: CLIENT_ID,
        companyName: "Société Démo",
        email: "client@example.test",
        portalEnabled: true,
        tpeJournals: [],
        missions: [],
        declarations: [],
        documents: [{ id: "507f1f77bcf86cd799439099", originalName: "balance.pdf", fileName: "stored.pdf", type: "BALANCE", status: "RECEIVED", fileUrl: "/unsafe-original-path", createdAt: new Date("2026-01-01T00:00:00.000Z") }],
        _count: { tpeJournals: 0, missions: 0, invoices: 0 },
      };
    });
    mocks.taxDeclarationFindMany.mockResolvedValue([]);
    mocks.communicationFindMany.mockImplementation(async () => {
      mocks.activeTenantSeen(getPortalTenantContext());
      return [{ id: "msg-1", sender: "accountant", content: "Merci, pièce reçue.", date: new Date("2026-01-01T12:30:00.000Z") }];
    });
    mocks.communicationCreate.mockImplementation(async ({ data }: any) => {
      mocks.activeTenantSeen(getPortalTenantContext());
      return { id: "msg-2", content: data.content, date: new Date("2026-01-01T12:45:00.000Z") };
    });
    mocks.accountingPeriodLockFindUnique.mockResolvedValue(null);
    mocks.tpeJournalCreateMany.mockImplementation(async () => {
      mocks.activeTenantSeen(getPortalTenantContext());
      return { count: 1 };
    });
    mocks.workPaperFindUnique.mockResolvedValue({ data: { widgets: ["missions", "documents"] } });
    mocks.workPaperUpsert.mockResolvedValue({});
    mocks.documentFindUnique.mockResolvedValue({ fileName: "stored.pdf", originalName: "balance.pdf", mimeType: "application/pdf", storageKey: "grid-key" });
    mocks.readPiece.mockResolvedValue({ contenu: Buffer.from("fixture-pdf"), mimeType: "application/pdf" });
  });

  it("refuse un portail sans jeton valide et un portail révoqué", async () => {
    const missing = await portalObligations(new NextRequest("https://local.test/api/portal/obligations"));
    expect(missing.status).toBe(401);
    expect(mocks.portalClientFindFirst).not.toHaveBeenCalled();

    mocks.portalClientFindFirst.mockResolvedValueOnce({ id: CLIENT_ID, cabinetId: CABINET_ID, portalEnabled: false });
    const revoked = await portalDashboard(new NextRequest("https://local.test"), { params: Promise.resolve({ token: TOKEN }) });
    expect(revoked.status).toBe(401);
    expect(mocks.clientFindUnique).not.toHaveBeenCalled();
  });

  it("ouvre le tableau de bord du client sans exposer le jeton et remplace les URL de fichiers", async () => {
    const response = await portalDashboard(new NextRequest("https://local.test"), { params: Promise.resolve({ token: TOKEN }) });
    const payload = await body(response);

    expect(response.status).toBe(200);
    expect(payload.client.email).toBe("client@example.test");
    expect(payload.client.portalToken).toBeUndefined();
    expect(payload.client.documents[0].fileUrl).toBe(`/api/portal/documents/507f1f77bcf86cd799439099?token=${TOKEN}`);
    expect(mocks.clientFindUnique.mock.calls[0][0].select.portalToken).toBeUndefined();
  });

  it("sert les obligations et les messages, puis accepte une réponse liée au client du jeton", async () => {
    mocks.taxDeclarationFindMany.mockResolvedValueOnce([{
      id: "tax-1", type: "TVA", period: "2026-01", dueDate: new Date(Date.now() + 30 * 86_400_000), amount: 45_000, status: "PENDING",
    }]);
    const obligations = await portalObligations(new NextRequest(`https://local.test/api/portal/obligations?token=${TOKEN}`));
    expect((await body(obligations)).obligations[0]).toMatchObject({ id: "tax-1", type: "TVA — 2026-01", amount: "45 000 FCFA" });

    const messages = await portalMessagesGet(new NextRequest(`https://local.test/api/portal/communications?token=${TOKEN}`));
    expect((await body(messages)).messages[0]).toMatchObject({ sender: "accountant", text: "Merci, pièce reçue." });

    const sent = await portalMessagesPost(jsonRequest(`https://local.test/api/portal/communications?token=${TOKEN}`, { text: "  Voici la pièce demandée.  ", clientId: "other-client" }));
    expect(sent.status).toBe(200);
    expect((await body(sent)).message.text).toBe("Voici la pièce demandée.");
    expect(mocks.communicationCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ clientId: CLIENT_ID, sender: "client", content: "Voici la pièce demandée." }) }));
    expect(mocks.activeTenantSeen).toHaveBeenCalledWith({ cabinetId: CABINET_ID, clientId: CLIENT_ID });
  });

  it("valide le dépôt du journal, rattache les lignes au jeton et rejette les lots invalides", async () => {
    const periodDate = `${new Date().toISOString().slice(0, 7)}-10`;
    const valid = await portalJournalUpload(jsonRequest(`https://local.test/api/portal/upload-journal?token=${TOKEN}`, {
      clientId: "other-client",
      entries: [{ date: periodDate, libelle: "Vente comptoir", entree: 125_000, sortie: 0 }],
    }));
    expect(valid.status).toBe(200);
    expect(await body(valid)).toMatchObject({ success: true, count: 1 });
    expect(mocks.tpeJournalCreateMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ clientId: CLIENT_ID, entree: 125_000, status: "PENDING" })] });

    mocks.tpeJournalCreateMany.mockClear();
    const invalid = await portalJournalUpload(jsonRequest(`https://local.test/api/portal/upload-journal?token=${TOKEN}`, {
      entries: [{ date: periodDate, libelle: "", entree: "montant inconnu", sortie: 0 }],
    }));
    expect(invalid.status).toBe(400);
    expect(mocks.tpeJournalCreateMany).not.toHaveBeenCalled();

    mocks.accountingPeriodLockFindUnique.mockResolvedValueOnce({ id: "period-lock" });
    const closed = await portalJournalUpload(jsonRequest(`https://local.test/api/portal/upload-journal?token=${TOKEN}`, {
      entries: [{ date: periodDate, libelle: "Vente comptoir", entree: 125_000, sortie: 0 }],
    }));
    expect(closed.status).toBe(409);
    expect(mocks.tpeJournalCreateMany).not.toHaveBeenCalled();
  });

  it("sert un document uniquement avec un jeton et un identifiant de pièce valides", async () => {
    const id = "507f1f77bcf86cd799439099";
    const unauthorized = await portalDocumentGet(new NextRequest(`https://local.test/api/portal/documents/${id}`), { params: Promise.resolve({ id }) });
    expect(unauthorized.status).toBe(401);

    const response = await portalDocumentGet(new NextRequest(`https://local.test/api/portal/documents/${id}?token=${TOKEN}`), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe("fixture-pdf");
  });

  it("sauvegarde les préférences du portail dans le dossier du client authentifié", async () => {
    const get = await dashboardPreferencesGet(new NextRequest(`https://local.test/api/portal/dashboard-preferences?token=${TOKEN}`));
    expect((await body(get)).widgets).toEqual(["missions", "documents"]);

    const put = await dashboardPreferencesPut(jsonRequest("https://local.test/api/portal/dashboard-preferences", { token: TOKEN, widgets: ["documents"] }));
    expect(put.status).toBe(200);
    expect(mocks.workPaperUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { clientId_type: { clientId: CLIENT_ID, type: "PORTAL_DASHBOARD" } },
      create: { clientId: CLIENT_ID, type: "PORTAL_DASHBOARD", data: { widgets: ["documents"] } },
    }));
  });

  it("bloque l'inscription publique et n'appelle pas les fournisseurs d'identité/paiement non configurés", async () => {
    const registration = await registrationPost();
    expect(registration.status).toBe(503);

    const identity = await identitySessionPost(jsonRequest("https://local.test/api/portal/onboarding/identity-session", { token: TOKEN }));
    const sepa = await sepaSessionPost(jsonRequest("https://local.test/api/portal/onboarding/sepa-session", { token: TOKEN }));
    expect(identity.status).toBe(503);
    expect(sepa.status).toBe(503);
  });

  it("simule le cycle cabinet : création du client, accès au lien portail, révocation et refus d'accès", async () => {
    const created = await clientCreatePost(jsonRequest("https://local.test/api/clients", {
      type: "ENTREPRISE",
      companyName: "Nouvelle Société",
      email: "nouveau-client@example.test",
      phone: "+221 77 000 00 00",
      country: "SN",
    }, { origin: "https://cabinet.local.test" }) as any);
    const creation = await body(created);
    expect(created.status).toBe(201);
    expect(creation.portalToken).toMatch(/^[a-f0-9]{64}$/);
    expect(creation.portalUrl).toContain(`/portal/${creation.portalToken}`);
    expect(creation.client.portalToken).toBeUndefined();
    expect(mocks.clientCreate.mock.calls[0][0].data.portalEnabled).toBe(true);

    mocks.clientFindUnique.mockResolvedValueOnce({ id: CLIENT_ID, companyName: "Nouvelle Société", portalToken: creation.portalToken, portalEnabled: true, portalCreatedAt: new Date() });
    const link = await portalLinkGet(new NextRequest("https://local.test/api/clients/" + CLIENT_ID + "/portal-link"), { params: Promise.resolve({ id: CLIENT_ID }) });
    expect((await body(link)).url).toContain(`/portal/${creation.portalToken}`);

    const revoke = await portalLinkPost(jsonRequest("https://local.test/api/clients/" + CLIENT_ID + "/portal-link", { action: "revoke" }), { params: Promise.resolve({ id: CLIENT_ID }) });
    expect(revoke.status).toBe(200);
    expect(mocks.clientUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { portalEnabled: false, portalToken: null } }));

    mocks.portalClientFindFirst.mockResolvedValueOnce({ id: CLIENT_ID, cabinetId: CABINET_ID, portalEnabled: false });
    const afterRevoke = await portalMessagesGet(new NextRequest(`https://local.test/api/portal/communications?token=${creation.portalToken}`));
    expect(afterRevoke.status).toBe(401);
  });
});
