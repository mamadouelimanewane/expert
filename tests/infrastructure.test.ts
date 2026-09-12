import { describe, expect, it } from "vitest";
import {
    clientCreateSchema,
    invoiceCreateSchema,
    invoiceUpdateSchema,
    parseBody,
    resetPasswordsSchema,
} from "@/lib/validation";
import {
    LIMITE_MAX,
    LIMITE_PAR_DEFAUT,
    parsePagination,
    reponsePaginee,
} from "@/lib/pagination";
import { rateLimit, rateLimitMemoire, estRateLimitDistribue } from "@/lib/rate-limit";
import { balanceDepuisJournal } from "@/lib/ohada/balance-from-journal";

const requete = (corps: unknown) =>
    new Request("http://localhost/api/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: typeof corps === "string" ? corps : JSON.stringify(corps),
    });

// ═══════════════════════════════════════════════════════════════════════════
// Validation des corps de requête
// ═══════════════════════════════════════════════════════════════════════════

describe("validation des corps de requête", () => {
    it("rejette un corps qui n'est pas du JSON", async () => {
        const { data, invalid } = await parseBody(requete("ceci n'est pas du json"), clientCreateSchema);
        expect(data).toBeNull();
        expect(invalid!.status).toBe(400);
    });

    it("nomme les champs en défaut", async () => {
        const { invalid } = await parseBody(requete({ email: "pas-un-email" }), clientCreateSchema);
        const corps = await invalid!.json();

        expect(invalid!.status).toBe(400);
        expect(corps.details.map((d: { champ: string }) => d.champ)).toContain("email");
    });

    it("accepte un client valide et normalise les espaces", async () => {
        const { data, invalid } = await parseBody(
            requete({
                companyName: "  Traoré Import-Export  ",
                email: " contact@traore.sn ",
                phone: "+221 33 123 45 67",
                country: "sn",
            }),
            clientCreateSchema
        );

        expect(invalid).toBeNull();
        expect(data!.companyName).toBe("Traoré Import-Export");
        expect(data!.email).toBe("contact@traore.sn");
        expect(data!.country).toBe("SN");
    });

    it("exige une raison sociale ou un nom", async () => {
        const { invalid } = await parseBody(
            requete({ email: "a@b.sn", phone: "+221770000000" }),
            clientCreateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("refuse un régime fiscal hors nomenclature Prisma", async () => {
        const { invalid } = await parseBody(
            requete({
                companyName: "Test",
                email: "a@b.sn",
                phone: "+221770000000",
                fiscalRegime: "SYNTHETIQUE",
            }),
            clientCreateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("refuse un identifiant qui n'est pas un ObjectId", async () => {
        const { invalid } = await parseBody(
            requete({ clientId: "123", dueDate: "2026-12-31", lines: [{ quantity: 1, unitPrice: 1000 }] }),
            invoiceCreateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("exige au moins une ligne de facturation", async () => {
        const { invalid } = await parseBody(
            requete({
                clientId: "507f1f77bcf86cd799439011",
                dueDate: "2026-12-31",
                lines: [],
            }),
            invoiceCreateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("refuse une quantité nulle ou négative", async () => {
        for (const quantity of [0, -3]) {
            const { invalid } = await parseBody(
                requete({
                    clientId: "507f1f77bcf86cd799439011",
                    dueDate: "2026-12-31",
                    lines: [{ quantity, unitPrice: 1000 }],
                }),
                invoiceCreateSchema
            );
            expect(invalid!.status).toBe(400);
        }
    });

    it("refuse un prix unitaire négatif", async () => {
        const { invalid } = await parseBody(
            requete({
                clientId: "507f1f77bcf86cd799439011",
                dueDate: "2026-12-31",
                lines: [{ quantity: 1, unitPrice: -500 }],
            }),
            invoiceCreateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("refuse une date d'échéance invalide", async () => {
        const { invalid } = await parseBody(
            requete({
                clientId: "507f1f77bcf86cd799439011",
                dueDate: "pas-une-date",
                lines: [{ quantity: 1, unitPrice: 1000 }],
            }),
            invoiceCreateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("convertit la date ISO en objet Date", async () => {
        const { data } = await parseBody(
            requete({
                clientId: "507f1f77bcf86cd799439011",
                dueDate: "2026-12-31",
                lines: [{ quantity: 2, unitPrice: 1000 }],
            }),
            invoiceCreateSchema
        );
        expect(data!.dueDate).toBeInstanceOf(Date);
    });

    it("refuse un statut de facture inconnu", async () => {
        const { invalid } = await parseBody(
            requete({ id: "507f1f77bcf86cd799439011", status: "ARCHIVEE" }),
            invoiceUpdateSchema
        );
        expect(invalid!.status).toBe(400);
    });

    it("borne la réinitialisation de mots de passe", async () => {
        expect((await parseBody(requete({ emails: [] }), resetPasswordsSchema)).invalid).not.toBeNull();
        expect(
            (await parseBody(
                requete({ emails: Array.from({ length: 51 }, (_, i) => `a${i}@b.sn`) }),
                resetPasswordsSchema
            )).invalid
        ).not.toBeNull();
        expect(
            (await parseBody(requete({ emails: ["admin@cabinet360.com"] }), resetPasswordsSchema)).invalid
        ).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════════════════

describe("pagination", () => {
    const params = (qs: string) => parsePagination(new URLSearchParams(qs));

    it("applique les valeurs par défaut", () => {
        expect(params("")).toEqual({
            page: 1,
            limit: LIMITE_PAR_DEFAUT,
            skip: 0,
            take: LIMITE_PAR_DEFAUT,
        });
    });

    it("calcule le décalage", () => {
        expect(params("page=3&limit=20").skip).toBe(40);
    });

    it("plafonne la limite demandée", () => {
        expect(params(`limit=${LIMITE_MAX * 10}`).take).toBe(LIMITE_MAX);
    });

    it("ignore les valeurs absurdes", () => {
        for (const qs of ["page=0", "page=-5", "page=abc", "limit=0", "limit=-1", "limit=xyz"]) {
            const p = params(qs);
            expect(p.page).toBeGreaterThanOrEqual(1);
            expect(p.take).toBeGreaterThan(0);
            expect(p.skip).toBeGreaterThanOrEqual(0);
        }
    });

    it("décrit correctement la page courante", () => {
        const p = params("page=2&limit=50");
        const meta = reponsePaginee(new Array(50).fill(0), 230, p);

        expect(meta).toMatchObject({ total: 230, page: 2, limit: 50, pages: 5, hasMore: true, count: 50 });
    });

    it("indique la fin de liste sur la dernière page", () => {
        const p = params("page=5&limit=50");
        expect(reponsePaginee(new Array(30).fill(0), 230, p).hasMore).toBe(false);
    });

    it("renvoie au moins une page sur une liste vide", () => {
        expect(reponsePaginee([], 0, params("")).pages).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Limitation de débit
// ═══════════════════════════════════════════════════════════════════════════

describe("limitation de débit", () => {
    it("laisse passer jusqu'à la limite puis bloque", () => {
        const cle = `test:${Math.random()}`;
        for (let i = 0; i < 5; i++) {
            expect(rateLimitMemoire(cle, 5, 60).success).toBe(true);
        }
        expect(rateLimitMemoire(cle, 5, 60).success).toBe(false);
    });

    it("décompte les tentatives restantes", () => {
        const cle = `test:${Math.random()}`;
        expect(rateLimitMemoire(cle, 3, 60).remaining).toBe(2);
        expect(rateLimitMemoire(cle, 3, 60).remaining).toBe(1);
        expect(rateLimitMemoire(cle, 3, 60).remaining).toBe(0);
    });

    it("isole les clés les unes des autres", () => {
        const a = `test:a:${Math.random()}`;
        const b = `test:b:${Math.random()}`;
        rateLimitMemoire(a, 1, 60);
        expect(rateLimitMemoire(a, 1, 60).success).toBe(false);
        expect(rateLimitMemoire(b, 1, 60).success).toBe(true);
    });

    it("rouvre l'accès après expiration de la fenêtre", async () => {
        const cle = `test:${Math.random()}`;
        expect(rateLimitMemoire(cle, 1, 1).success).toBe(true);
        expect(rateLimitMemoire(cle, 1, 1).success).toBe(false);

        await new Promise((r) => setTimeout(r, 1100));
        expect(rateLimitMemoire(cle, 1, 1).success).toBe(true);
    });

    it("expose une date de réinitialisation dans le futur", () => {
        const r = rateLimitMemoire(`test:${Math.random()}`, 5, 60);
        expect(r.resetAt).toBeGreaterThan(Date.now());
    });

    it("sans Upstash configuré, la version asynchrone retombe sur le compteur local", async () => {
        expect(estRateLimitDistribue()).toBe(false);
        const cle = `test:${Math.random()}`;
        const r1 = await rateLimit(cle, 1, 60);
        const r2 = await rateLimit(cle, 1, 60);
        expect(r1).toMatchObject({ success: true, backend: "memoire" });
        expect(r2).toMatchObject({ success: false, backend: "memoire" });
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// Journal → balance
// ═══════════════════════════════════════════════════════════════════════════

describe("agrégation du journal en balance", () => {
    it("produit une balance équilibrée par construction", () => {
        const balance = balanceDepuisJournal([
            { debitCompte: "601", creditCompte: "521", montant: 100_000 },
            { debitCompte: "4452", creditCompte: "521", montant: 18_000 },
            { debitCompte: "521", creditCompte: "701", montant: 250_000 },
        ]);

        const debit = balance.reduce((s, c) => s + c.debit, 0);
        const credit = balance.reduce((s, c) => s + c.credit, 0);
        expect(debit).toBe(credit);
        expect(debit).toBe(368_000);
    });

    it("cumule les mouvements d'un même compte", () => {
        const balance = balanceDepuisJournal([
            { debitCompte: "601", creditCompte: "521", montant: 100_000 },
            { debitCompte: "601", creditCompte: "521", montant: 50_000 },
        ]);
        expect(balance.find((c) => c.numero === "601")!.debit).toBe(150_000);
        expect(balance.find((c) => c.numero === "521")!.credit).toBe(150_000);
    });

    // Régression : la route utilisait `entree + sortie` au lieu de `montant`,
    // ce qui doublait le montant des écritures portant les deux colonnes.
    it("s'appuie sur le montant de l'écriture", () => {
        const balance = balanceDepuisJournal([
            { debitCompte: "601", creditCompte: "521", montant: 100_000 },
        ]);
        expect(balance.find((c) => c.numero === "601")!.debit).toBe(100_000);
    });

    it("ignore une écriture incomplète plutôt que de la ventiler à moitié", () => {
        const balance = balanceDepuisJournal([
            { debitCompte: "601", creditCompte: null, montant: 100_000 },
            { debitCompte: "", creditCompte: "521", montant: 50_000 },
            { debitCompte: "601", creditCompte: "521", montant: 25_000 },
        ]);

        const debit = balance.reduce((s, c) => s + c.debit, 0);
        const credit = balance.reduce((s, c) => s + c.credit, 0);
        expect(debit).toBe(credit);
        expect(debit).toBe(25_000);
    });

    it("ignore les écritures de montant nul", () => {
        expect(
            balanceDepuisJournal([{ debitCompte: "601", creditCompte: "521", montant: 0 }])
        ).toEqual([]);
    });

    it("normalise les espaces autour des numéros de compte", () => {
        const balance = balanceDepuisJournal([
            { debitCompte: " 601 ", creditCompte: "521 ", montant: 10_000 },
            { debitCompte: "601", creditCompte: "521", montant: 10_000 },
        ]);
        expect(balance.filter((c) => c.numero === "601")).toHaveLength(1);
        expect(balance.find((c) => c.numero === "601")!.debit).toBe(20_000);
    });

    it("conserve les intitulés", () => {
        const balance = balanceDepuisJournal([
            {
                debitCompte: "601",
                debitIntitule: "Achats de marchandises",
                creditCompte: "521",
                creditIntitule: "Banque",
                montant: 10_000,
            },
        ]);
        expect(balance.find((c) => c.numero === "601")!.intitule).toBe("Achats de marchandises");
    });

    it("accepte un journal vide", () => {
        expect(balanceDepuisJournal([])).toEqual([]);
    });
});
