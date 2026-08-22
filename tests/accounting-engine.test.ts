import { beforeEach, describe, expect, it, vi } from "vitest";

// Le moteur interroge Prisma pour connaître l'assujettissement TVA du client et
// les règles apprises. On simule ces deux accès : les tests portent sur la
// logique comptable, pas sur la base.
const prismaMock = {
    client: { findUnique: vi.fn() },
    accountingRuleMapping: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({
    default: prismaMock,
    prisma: prismaMock,
}));

const { AccountingEngine, COMPTE_ATTENTE } = await import("@/lib/accounting-engine");
type Ligne = { compte: string; intitule: string; debit: number; credit: number };

const assujetti = (valeur: boolean) => {
    prismaMock.client.findUnique.mockResolvedValue({ id: "c1", subjectToTva: valeur });
};

const somme = (lignes: Ligne[], champ: "debit" | "credit") =>
    Math.round(lignes.reduce((s, l) => s + l[champ], 0) * 100) / 100;

beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.accountingRuleMapping.findFirst.mockResolvedValue(null);
    assujetti(false);
});

describe("extraction du mot-clé d'apprentissage", () => {
    // Régression : la version précédente prenait le PREMIER mot du libellé.
    // « Paiement loyer janvier » produisait la clé « paiement », si bien qu'une
    // règle apprise sur « loyer » n'était jamais retrouvée.
    it("ignore les mots vides en tête de libellé", () => {
        expect(AccountingEngine.motCle("Paiement loyer janvier")).toBe("loyer");
        expect(AccountingEngine.motCle("Règlement facture Sonatel")).toBe("sonatel");
        expect(AccountingEngine.motCle("Virement salaire Fatou")).toBe("salaire");
    });

    it("normalise les accents et la casse", () => {
        expect(AccountingEngine.motCle("ÉLECTRICITÉ Senelec")).toBe("electricite");
    });

    it("retombe sur le premier mot si tout est vide de sens", () => {
        expect(AccountingEngine.motCle("achat")).toBe("achat");
    });

    it("accepte un libellé vide", () => {
        expect(AccountingEngine.motCle("")).toBe("");
    });
});

describe("imputation par règles métier", () => {
    it("impute un achat au compte 601", async () => {
        const r = await AccountingEngine.processEntry("Achat de marchandises", 0, 100_000, "c1");
        expect(r.source).toBe("RULE");
        expect(r.lignes.some((l) => l.compte === "601")).toBe(true);
        expect(r.requiresReview).toBe(false);
    });

    it("impute un loyer au compte 622", async () => {
        const r = await AccountingEngine.processEntry("Loyer du local", 0, 250_000, "c1");
        expect(r.lignes.some((l) => l.compte === "622")).toBe(true);
    });

    it("impute une recette au compte 701", async () => {
        const r = await AccountingEngine.processEntry("Vente du jour", 80_000, 0, "c1");
        expect(r.lignes.some((l) => l.compte === "701")).toBe(true);
    });

    it("ne confond pas une règle de recette avec une dépense", async () => {
        // « vente » est une règle de recette : sur une sortie, elle ne doit pas
        // s'appliquer, l'écriture part en attente.
        const r = await AccountingEngine.processEntry("Vente", 0, 50_000, "c1");
        expect(r.lignes.some((l) => l.compte === "701")).toBe(false);
    });

    it("privilégie une règle apprise sur les règles génériques", async () => {
        prismaMock.accountingRuleMapping.findFirst.mockResolvedValue({
            id: "r1",
            keyword: "senelec",
            debitCompte: "6051",
            creditCompte: "701",
            usageCount: 4,
        });

        const r = await AccountingEngine.processEntry("Facture Senelec", 0, 45_000, "c1");
        expect(r.source).toBe("ML_LEARNING");
        expect(r.confidence).toBe(1);
        expect(r.lignes.some((l) => l.compte === "6051")).toBe(true);
    });
});

describe("imputation impossible", () => {
    // Régression critique : `callOpenSourceLLM` n'interrogeait aucun modèle.
    // Elle attendait 600 ms puis renvoyait 632 ou 706 en dur, avec une
    // confiance de 0,9 — la plus haute du système. Le collaborateur lisait
    // « analysé par IA, confiance 90 % » sur une imputation arbitraire.
    it("part en compte d'attente au lieu d'inventer une imputation", async () => {
        const r = await AccountingEngine.processEntry("Opération XJ-4471 divers", 0, 90_000, "c1");

        expect(r.source).toBe("A_QUALIFIER");
        expect(r.confidence).toBe(0);
        expect(r.requiresReview).toBe(true);
        expect(r.lignes.some((l) => l.compte === COMPTE_ATTENTE)).toBe(true);
    });

    it("n'utilise plus les comptes 632 et 706 comme valeurs de repli", async () => {
        const r = await AccountingEngine.processEntry("Opération XJ-4471 divers", 0, 90_000, "c1");
        expect(r.lignes.some((l) => l.compte === "632")).toBe(false);
        expect(r.lignes.some((l) => l.compte === "706")).toBe(false);
    });

    it("explique pourquoi l'écriture doit être qualifiée", async () => {
        const r = await AccountingEngine.processEntry("Opération XJ-4471 divers", 0, 90_000, "c1");
        expect(r.reviewReason).toContain("qualifiée");
        expect(r.reviewReason).toContain(COMPTE_ATTENTE);
    });

    it("répond immédiatement, sans latence simulée", async () => {
        const depart = Date.now();
        await AccountingEngine.processEntry("Opération XJ-4471 divers", 0, 90_000, "c1");
        expect(Date.now() - depart).toBeLessThan(300);
    });
});

describe("éclatement de la TVA", () => {
    it("ne ventile pas la TVA pour un client non assujetti", async () => {
        assujetti(false);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 118_000, "c1");
        expect(r.lignes).toHaveLength(2);
        expect(r.lignes.some((l) => l.compte.startsWith("44"))).toBe(false);
    });

    it("ventile la TVA déductible sur un achat", async () => {
        assujetti(true);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 118_000, "c1");

        expect(r.lignes).toHaveLength(3);
        const tva = r.lignes.find((l) => l.compte === "4452")!;
        expect(tva.debit).toBeCloseTo(18_000, 0);

        const charge = r.lignes.find((l) => l.compte === "601")!;
        expect(charge.debit).toBeCloseTo(100_000, 0);
    });

    it("ventile la TVA collectée sur une vente", async () => {
        assujetti(true);
        const r = await AccountingEngine.processEntry("Vente du jour", 118_000, 0, "c1");

        const tva = r.lignes.find((l) => l.compte === "4431")!;
        expect(tva.credit).toBeCloseTo(18_000, 0);
        expect(r.lignes.find((l) => l.compte === "521")!.debit).toBe(118_000);
    });
});

describe("partie double", () => {
    it("produit toujours une écriture équilibrée", async () => {
        for (const tva of [false, true]) {
            assujetti(tva);
            for (const [entree, sortie] of [
                [0, 118_000],
                [118_000, 0],
                [0, 33_333],
                [7, 0],
                [0, 999_999],
            ]) {
                const r = await AccountingEngine.processEntry("Achat marchandises", entree, sortie, "c1");
                expect(somme(r.lignes, "debit")).toBeCloseTo(somme(r.lignes, "credit"), 2);
            }
        }
    });

    it("ne mélange jamais débit et crédit sur une même ligne", async () => {
        assujetti(true);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 118_000, "c1");
        for (const l of r.lignes) {
            expect(l.debit === 0 || l.credit === 0).toBe(true);
        }
    });
});

describe("décomposition en couples débit/crédit", () => {
    // Régression : l'appelant ne conservait que la PREMIÈRE et la DERNIÈRE
    // ligne du lot. Sur une écriture avec TVA, la ligne de TVA disparaissait
    // et la charge était enregistrée pour son montant TTC.
    it("conserve la ligne de TVA d'un achat", async () => {
        assujetti(true);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 118_000, "c1");
        const couples = AccountingEngine.toPairedEntries(r.lignes);

        expect(couples).toHaveLength(2);
        expect(couples.map((c) => c.debitCompte).sort()).toEqual(["4452", "601"]);
        expect(couples.every((c) => c.creditCompte === "521")).toBe(true);
    });

    it("conserve le montant total de l'écriture", async () => {
        assujetti(true);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 118_000, "c1");
        const total = AccountingEngine.toPairedEntries(r.lignes).reduce((s, c) => s + c.montant, 0);
        expect(total).toBeCloseTo(118_000, 2);
    });

    it("n'enregistre plus la charge pour son montant TTC", async () => {
        assujetti(true);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 118_000, "c1");
        const couples = AccountingEngine.toPairedEntries(r.lignes);
        const charge = couples.find((c) => c.debitCompte === "601")!;

        expect(charge.montant).toBeCloseTo(100_000, 0);
        expect(charge.montant).not.toBeCloseTo(118_000, 0);
    });

    it("produit un seul couple pour une écriture simple", async () => {
        assujetti(false);
        const r = await AccountingEngine.processEntry("Achat marchandises", 0, 50_000, "c1");
        const couples = AccountingEngine.toPairedEntries(r.lignes);

        expect(couples).toHaveLength(1);
        expect(couples[0].montant).toBe(50_000);
    });

    it("apparie correctement plusieurs débits et plusieurs crédits", () => {
        const lignes: Ligne[] = [
            { compte: "601", intitule: "Achats", debit: 300, credit: 0 },
            { compte: "602", intitule: "Fournitures", debit: 200, credit: 0 },
            { compte: "521", intitule: "Banque", debit: 0, credit: 400 },
            { compte: "571", intitule: "Caisse", debit: 0, credit: 100 },
        ];
        const couples = AccountingEngine.toPairedEntries(lignes);

        expect(couples.reduce((s, c) => s + c.montant, 0)).toBe(500);
        for (const c of couples) {
            expect(c.montant).toBeGreaterThan(0);
        }
    });

    it("renvoie une liste vide pour une écriture vide", () => {
        expect(AccountingEngine.toPairedEntries([])).toEqual([]);
    });
});
