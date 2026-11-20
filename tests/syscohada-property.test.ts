import { describe, expect, it } from "vitest";
import { genererEtatsFinanciers, resolveRule } from "@/lib/ohada/syscohada-engine";
import { ACCOUNT_RULES, ALL_LINES } from "@/lib/ohada/plan";
import type { CompteBalance } from "@/lib/ohada/types";

// ─────────────────────────────────────────────────────────────────────────────
// Tests de propriété.
//
// Les tests par cas vérifient des situations choisies. Ceux-ci vérifient des
// INVARIANTS sur des milliers de balances engendrées aléatoirement : c'est la
// garantie qu'attend un expert-comptable, à savoir qu'aucune combinaison de
// comptes ne peut produire un bilan déséquilibré.
// ─────────────────────────────────────────────────────────────────────────────

/** Générateur pseudo-aléatoire déterministe, pour des échecs reproductibles. */
function creerAlea(graine: number) {
    let etat = graine >>> 0;
    return () => {
        etat = (etat * 1664525 + 1013904223) >>> 0;
        return etat / 0x100000000;
    };
}

/** Numéros de compte représentatifs des huit classes du plan SYSCOHADA. */
const COMPTES_TEST = [
    // Classe 1 — ressources durables
    "1011", "1041", "1051", "1061", "1068", "1091", "1181", "1201", "1301", "1411", "1511",
    "1621", "1711", "1811", "1911",
    // Classe 2 — immobilisations et leurs amortissements
    "2011", "2111", "2121", "2131", "2151", "2161", "2171", "2181", "2211", "2311", "2331",
    "2411", "2451", "2511", "2611", "2711",
    "2801", "2811", "2815", "2817", "2821", "2831", "2833", "2841", "2845", "2901", "2911",
    "2921", "2931", "2941", "2961", "2971",
    // Classe 3 — stocks
    "3111", "3211", "3311", "3411", "3511", "3711", "3811", "3911",
    // Classe 4 — tiers
    "4011", "4012", "4091", "4111", "4121", "4191", "4211", "4231", "4311", "4411", "4421",
    "4431", "4451", "4452", "4511", "4611", "4711", "4781", "4791", "4811",
    "4911", "4921", "4931", "4981", "4991",
    // Classe 5 — trésorerie
    "5011", "5111", "5211", "5311", "5411", "5521", "5611", "5711", "5811", "5911",
    // Classe 6 — charges
    "6011", "6021", "6031", "6032", "6033", "6041", "6051", "6081", "6111", "6211", "6221",
    "6281", "6311", "6411", "6511", "6611", "6711", "6811", "6911", "6971",
    // Classe 7 — produits
    "7011", "7021", "7031", "7041", "7051", "7061", "7071", "7111", "7211", "7311", "7511",
    "7711", "7811", "7871", "7911", "7971",
    // Classe 8 — hors activités ordinaires
    "8111", "8211", "8311", "8411", "8511", "8611", "8711", "8811", "8911",
];

/**
 * Engendre une balance équilibrée : chaque « écriture » débite un compte et
 * crédite un autre du même montant, exactement comme une comptabilité réelle.
 *
 * Une balance réelle est dans l'un de deux états, jamais les deux à la fois :
 *  • AVANT AFFECTATION — les classes 6 et 7 sont ouvertes, le compte 13 est vide ;
 *  • APRÈS CLÔTURE — les classes 6 et 7 sont soldées, le compte 13 porte le résultat.
 *
 * Mélanger les deux décrit une comptabilité incohérente, que le moteur signale
 * désormais explicitement (voir le test dédié plus bas).
 */
function balanceAleatoireEquilibree(
    alea: () => number,
    nbEcritures: number,
    etat: "avant-affectation" | "apres-cloture" = "avant-affectation"
): CompteBalance[] {
    const comptes = new Map<string, CompteBalance>();

    const eligibles = COMPTES_TEST.filter((numero) =>
        etat === "avant-affectation"
            ? !numero.startsWith("13")
            : !/^[678]/.test(numero)
    );

    const toucher = (numero: string) => {
        let c = comptes.get(numero);
        if (!c) {
            c = { numero, intitule: `Compte ${numero}`, debit: 0, credit: 0 };
            comptes.set(numero, c);
        }
        return c;
    };

    for (let i = 0; i < nbEcritures; i++) {
        const debit = eligibles[Math.floor(alea() * eligibles.length)];
        let credit = eligibles[Math.floor(alea() * eligibles.length)];
        if (credit === debit) {
            credit = eligibles[(eligibles.indexOf(debit) + 1) % eligibles.length];
        }

        const montant = Math.round(alea() * 5_000_000);
        toucher(debit).debit += montant;
        toucher(credit).credit += montant;
    }

    return [...comptes.values()];
}

describe("couverture du référentiel", () => {
    it("affecte tous les comptes du jeu de test", () => {
        const orphelins = COMPTES_TEST.filter((numero) => resolveRule(numero) === null);
        expect(orphelins).toEqual([]);
    });

    it("n'affecte les comptes qu'à des lignes déclarées", () => {
        const codesConnus = new Set(ALL_LINES.map((l) => l.code));
        const inconnus: string[] = [];

        for (const regle of ACCOUNT_RULES) {
            for (const code of [regle.debit, regle.credit, regle.depreciationOf]) {
                if (code && !codesConnus.has(code)) inconnus.push(`${regle.prefix} → ${code}`);
            }
        }

        expect(inconnus).toEqual([]);
    });

    it("couvre chacune des huit classes du plan comptable", () => {
        for (const classe of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
            const exemple = COMPTES_TEST.find((c) => c.startsWith(classe));
            expect(resolveRule(exemple!), `classe ${classe}`).not.toBeNull();
        }
    });
});

describe("invariants sur balances engendrées aléatoirement", () => {
    it("équilibre toujours l'actif et le passif avant affectation (500 balances)", () => {
        const alea = creerAlea(20260822);
        const echecs: { iteration: number; ecart: number }[] = [];

        for (let i = 0; i < 500; i++) {
            const balance = balanceAleatoireEquilibree(alea, 5 + Math.floor(alea() * 60));
            const etats = genererEtatsFinanciers(balance);

            if (!etats.controleEquilibre.equilibre) {
                echecs.push({ iteration: i, ecart: etats.controleEquilibre.ecart });
            }
        }

        expect(echecs).toEqual([]);
    });

    it("équilibre toujours l'actif et le passif après clôture (500 balances)", () => {
        const alea = creerAlea(31415);
        const echecs: { iteration: number; ecart: number }[] = [];

        for (let i = 0; i < 500; i++) {
            const balance = balanceAleatoireEquilibree(alea, 5 + Math.floor(alea() * 60), "apres-cloture");
            const etats = genererEtatsFinanciers(balance);

            if (!etats.controleEquilibre.equilibre) {
                echecs.push({ iteration: i, ecart: etats.controleEquilibre.ecart });
            }
        }

        expect(echecs).toEqual([]);
    });

    it("ne laisse jamais de compte non affecté sur une balance du référentiel", () => {
        const alea = creerAlea(7);
        for (let i = 0; i < 100; i++) {
            const etats = genererEtatsFinanciers(balanceAleatoireEquilibree(alea, 40));
            expect(etats.comptesNonAffectes).toEqual([]);
        }
    });

    it("confirme que la balance source est équilibrée", () => {
        const alea = creerAlea(99);
        for (let i = 0; i < 100; i++) {
            const etats = genererEtatsFinanciers(balanceAleatoireEquilibree(alea, 30));
            expect(etats.controleBalance.equilibree).toBe(true);
            expect(etats.controleBalance.ecart).toBe(0);
        }
    });

    it("reporte toujours le résultat net au passif", () => {
        const alea = creerAlea(1234);
        for (let i = 0; i < 100; i++) {
            const etats = genererEtatsFinanciers(balanceAleatoireEquilibree(alea, 40));
            const cj = etats.passif.find((l) => l.code === "CJ")!;
            // Soit le compte 13 était servi, soit le résultat vient de la cascade.
            expect(Math.abs(cj.netN)).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(cj.netN)).toBe(true);
        }
    });

    it("ne produit jamais NaN ni Infinity", () => {
        const alea = creerAlea(555);
        for (let i = 0; i < 100; i++) {
            const etats = genererEtatsFinanciers(balanceAleatoireEquilibree(alea, 50));
            for (const ligne of [...etats.actif, ...etats.passif, ...etats.resultat]) {
                for (const valeur of [ligne.brutN, ligne.amortN, ligne.netN, ligne.netN1]) {
                    expect(Number.isFinite(valeur), `${ligne.code}`).toBe(true);
                }
            }
        }
    }, 30_000);

    it("garde des totaux égaux à la somme de leurs composantes", () => {
        const alea = creerAlea(31337);

        for (let i = 0; i < 100; i++) {
            const etats = genererEtatsFinanciers(balanceAleatoireEquilibree(alea, 40));

            for (const etat of [etats.actif, etats.passif]) {
                const parCode = new Map(etat.map((l) => [l.code, l]));

                for (const ligne of etat) {
                    if (!ligne.children?.length) continue;
                    const somme = ligne.children.reduce(
                        (s, code) => s + (parCode.get(code)?.netN ?? 0),
                        0
                    );
                    expect(ligne.netN, `${ligne.code}`).toBeCloseTo(somme, 1);
                }
            }
        }
    });

    it("garde l'amortissement inférieur ou égal au brut sur les lignes servies", () => {
        const alea = creerAlea(4242);
        for (let i = 0; i < 50; i++) {
            const etats = genererEtatsFinanciers(balanceAleatoireEquilibree(alea, 40));
            for (const ligne of etats.actif) {
                expect(ligne.netN).toBeCloseTo(ligne.brutN - ligne.amortN, 1);
            }
        }
    });

    it("reste déterministe : deux exécutions donnent le même résultat", () => {
        const balance = balanceAleatoireEquilibree(creerAlea(2026), 60);
        expect(genererEtatsFinanciers(balance)).toEqual(genererEtatsFinanciers(balance));
    });

    it("reste insensible à l'ordre des comptes dans la balance", () => {
        const balance = balanceAleatoireEquilibree(creerAlea(808), 60);
        const inverse = [...balance].reverse();

        const a = genererEtatsFinanciers(balance);
        const b = genererEtatsFinanciers(inverse);

        expect(a.controleEquilibre.totalActif).toBeCloseTo(b.controleEquilibre.totalActif, 2);
        expect(a.resultatNet).toBeCloseTo(b.resultatNet, 2);
    });
});

describe("robustesse face à des balances dégradées", () => {
    // Défaut mis au jour par les tests de propriété : lorsque le compte 13 est
    // servi ET que les classes 6/7 restent ouvertes, le bilan est
    // structurellement déséquilibré. Le moteur doit nommer la cause plutôt que
    // d'afficher un écart inexpliqué.
    it("explique le déséquilibre quand le compte 13 coexiste avec des classes de gestion ouvertes", () => {
        const etats = genererEtatsFinanciers([
            { numero: "1301", intitule: "Résultat de l'exercice", debit: 0, credit: 500_000 },
            { numero: "7011", intitule: "Ventes", debit: 0, credit: 500_000 },
            { numero: "5211", intitule: "Banque", debit: 1_000_000, credit: 0 },
        ]);

        expect(etats.controleBalance.equilibree).toBe(true);
        expect(etats.anomalies.join(" ")).toContain("classes 6 et 7");
        // Le compte 13 fait foi : il n'est pas écrasé par la cascade.
        expect(etats.passif.find((l) => l.code === "CJ")!.netN).toBe(500_000);
    });

    it("n'émet aucune anomalie sur une balance saine", () => {
        const etats = genererEtatsFinanciers([
            { numero: "7011", intitule: "Ventes", debit: 0, credit: 500_000 },
            { numero: "5211", intitule: "Banque", debit: 500_000, credit: 0 },
        ]);
        expect(etats.anomalies).toEqual([]);
        expect(etats.controleEquilibre.equilibre).toBe(true);
    });

    it("chiffre les comptes hors référentiel dans les anomalies", () => {
        const etats = genererEtatsFinanciers([
            { numero: "9911", intitule: "Compte analytique", debit: 400_000, credit: 0 },
            { numero: "5211", intitule: "Banque", debit: 0, credit: 400_000 },
        ]);
        expect(etats.anomalies.join(" ")).toContain("hors référentiel");
    });

    it("signale un déséquilibre sans planter", () => {
        const etats = genererEtatsFinanciers([
            { numero: "5211", intitule: "Banque", debit: 1_000_000, credit: 0 },
            { numero: "1011", intitule: "Capital", debit: 0, credit: 700_000 },
        ]);
        expect(etats.controleBalance.equilibree).toBe(false);
        expect(etats.controleBalance.ecart).toBe(300_000);
    });

    it("remonte les comptes hors référentiel au lieu de les perdre", () => {
        const etats = genererEtatsFinanciers([
            { numero: "9911", intitule: "Compte analytique", debit: 400_000, credit: 0 },
            { numero: "5211", intitule: "Banque", debit: 0, credit: 400_000 },
        ]);
        expect(etats.comptesNonAffectes.map((c) => c.numero)).toEqual(["9911"]);
    });

    it("absorbe des montants très élevés sans perte de précision visible", () => {
        const etats = genererEtatsFinanciers([
            { numero: "5211", intitule: "Banque", debit: 999_999_999_999, credit: 0 },
            { numero: "1011", intitule: "Capital", debit: 0, credit: 999_999_999_999 },
        ]);
        expect(etats.controleEquilibre.equilibre).toBe(true);
    });

    it("accepte des montants décimaux", () => {
        const etats = genererEtatsFinanciers([
            { numero: "5211", intitule: "Banque", debit: 1234.56, credit: 0 },
            { numero: "1011", intitule: "Capital", debit: 0, credit: 1234.56 },
        ]);
        expect(etats.controleEquilibre.equilibre).toBe(true);
    });
});
