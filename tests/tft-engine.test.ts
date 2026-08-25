import { describe, expect, it } from "vitest";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";
import { genererTFT } from "@/lib/ohada/tft-engine";
import type { CompteBalance } from "@/lib/ohada/types";

// ─────────────────────────────────────────────────────────────────────────────
// Le TFT (méthode indirecte simplifiée, tft-engine.ts) est construit comme une
// identité comptable : sa formule garantit que la somme des trois flux égale
// la variation de trésorerie nette pour tout bilan équilibré à N et à N-1.
// Ce test vérifie cet invariant sur des centaines de balances aléatoires,
// exactement comme tests/syscohada-property.test.ts le fait pour le bilan.
// ─────────────────────────────────────────────────────────────────────────────

function creerAlea(graine: number) {
    let etat = graine >>> 0;
    return () => {
        etat = (etat * 1664525 + 1013904223) >>> 0;
        return etat / 0x100000000;
    };
}

const COMPTES_TEST_AVANT_AFFECTATION = [
    "1011", "1041", "1061", "1091", "1181", "1201", "1411", "1511", "1621", "1711", "1811",
    "2011", "2111", "2131", "2151", "2181", "2211", "2311", "2411", "2511",
    "2811", "2815", "2817", "2821", "2841", "2911", "2921",
    "3111", "3211", "3411", "3511",
    "4011", "4111", "4191", "4211", "4411", "4431", "4711", "4811",
    "5011", "5111", "5211", "5611", "5811",
    "6011", "6021", "6111", "6211", "6411", "6811",
    "7011", "7021", "7111", "7211", "7511",
];

function balanceAleatoireEquilibree(alea: () => number, nbEcritures: number): CompteBalance[] {
    const comptes = new Map<string, CompteBalance>();
    const toucher = (numero: string) => {
        let c = comptes.get(numero);
        if (!c) {
            c = { numero, intitule: `Compte ${numero}`, debit: 0, credit: 0 };
            comptes.set(numero, c);
        }
        return c;
    };

    for (let i = 0; i < nbEcritures; i++) {
        const debit = COMPTES_TEST_AVANT_AFFECTATION[Math.floor(alea() * COMPTES_TEST_AVANT_AFFECTATION.length)];
        let credit = COMPTES_TEST_AVANT_AFFECTATION[Math.floor(alea() * COMPTES_TEST_AVANT_AFFECTATION.length)];
        if (credit === debit) {
            credit = COMPTES_TEST_AVANT_AFFECTATION[(COMPTES_TEST_AVANT_AFFECTATION.indexOf(debit) + 1) % COMPTES_TEST_AVANT_AFFECTATION.length];
        }
        const montant = Math.round(alea() * 5_000_000);
        toucher(debit).debit += montant;
        toucher(credit).credit += montant;
    }

    return [...comptes.values()];
}

describe("TFT — équilibre garanti par construction", () => {
    it("la somme des trois flux égale toujours la variation de trésorerie nette (500 paires de balances)", () => {
        const alea = creerAlea(20260825);
        let casTestes = 0;

        for (let i = 0; i < 500; i++) {
            const balanceN = balanceAleatoireEquilibree(alea, 15 + Math.floor(alea() * 20));
            const balanceN1 = balanceAleatoireEquilibree(alea, 15 + Math.floor(alea() * 20));

            const statement = genererEtatsFinanciers(balanceN, balanceN1);
            if (!statement.controleEquilibre.equilibre) continue; // bilan source déjà signalé déséquilibré, hors périmètre du TFT

            const tft = genererTFT(statement);
            casTestes++;

            expect(Math.abs(tft.ecartControle)).toBeLessThanOrEqual(1);
            expect(tft.equilibre).toBe(true);
            expect(Number.isFinite(tft.variationTresorerie)).toBe(true);
            expect(Number.isNaN(tft.variationTresorerie)).toBe(false);
        }

        expect(casTestes).toBeGreaterThan(400);
    });

    it("trésorerie de clôture calculée = ouverture + variation", () => {
        const alea = creerAlea(42);
        const balanceN = balanceAleatoireEquilibree(alea, 25);
        const balanceN1 = balanceAleatoireEquilibree(alea, 25);
        const tft = genererTFT(genererEtatsFinanciers(balanceN, balanceN1));

        expect(tft.tresorerieClotureCalculee).toBeCloseTo(tft.tresorerieOuverture + tft.variationTresorerie, 2);
    });

    it("sans N-1, la trésorerie d'ouverture est nulle et la variation reflète directement le solde N", () => {
        const alea = creerAlea(7);
        const balanceN = balanceAleatoireEquilibree(alea, 20);
        const tft = genererTFT(genererEtatsFinanciers(balanceN, []));

        expect(tft.tresorerieOuverture).toBe(0);
        expect(Math.abs(tft.ecartControle)).toBeLessThanOrEqual(1);
    });
});
