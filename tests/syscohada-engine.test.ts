import { describe, expect, it } from "vitest";
import {
    genererEtatsFinanciers,
    resolveRule,
    soldeDe,
    ventiler,
} from "@/lib/ohada/syscohada-engine";
import { ACTIF_LINES, ALL_LINES, PASSIF_LINES, RESULTAT_LINES } from "@/lib/ohada/plan";
import type { CompteBalance, ReportLine } from "@/lib/ohada/types";

const c = (numero: string, intitule: string, debit: number, credit: number): CompteBalance => ({
    numero,
    intitule,
    debit,
    credit,
});

const net = (lines: ReportLine[], code: string): number =>
    lines.find((l) => l.code === code)?.netN ?? NaN;

const ligne = (lines: ReportLine[], code: string): ReportLine =>
    lines.find((l) => l.code === code)!;

/**
 * Balance générale complète et équilibrée (débit = crédit = 30 500 000 FCFA),
 * avant affectation du résultat. Sert de cas de référence à plusieurs tests.
 */
const BALANCE_REFERENCE: CompteBalance[] = [
    // Actif immobilisé
    c("2411", "Matériel et mobilier", 10_000_000, 0),
    c("2841", "Amortissements du matériel", 0, 4_000_000),
    // Actif circulant
    c("3111", "Stocks de marchandises", 3_000_000, 0),
    c("4111", "Clients", 5_000_000, 0),
    c("4011", "Fournisseur Alpha (avance versée)", 500_000, 0),
    // Trésorerie
    c("5211", "Banque", 2_500_000, 0),
    // Capitaux propres
    c("1011", "Capital social", 0, 10_000_000),
    c("1061", "Réserve légale", 0, 1_000_000),
    // Dettes
    c("1621", "Emprunt bancaire", 0, 2_000_000),
    c("4012", "Fournisseur Beta", 0, 3_000_000),
    c("4421", "TVA facturée due", 0, 800_000),
    // Charges
    c("6011", "Achats de marchandises", 6_000_000, 0),
    c("6611", "Salaires", 3_500_000, 0),
    // Produits
    c("7011", "Ventes de marchandises", 0, 9_700_000),
];

describe("intégrité du plan de correspondance", () => {
    it("n'utilise jamais deux fois le même code de ligne", () => {
        const codes = ALL_LINES.map((l) => l.code);
        const doublons = codes.filter((code, i) => codes.indexOf(code) !== i);
        expect(doublons).toEqual([]);
    });

    it("ne fait référence qu'à des codes enfants existants", () => {
        const connus = new Set(ALL_LINES.map((l) => l.code));
        for (const line of ALL_LINES) {
            for (const enfant of line.children ?? []) {
                expect(connus.has(enfant), `${line.code} → ${enfant}`).toBe(true);
            }
        }
    });

    it("garde des ensembles d'enfants disjoints au sein d'un même état", () => {
        // Deux totaux d'un même état ne doivent pas partager un enfant : c'est ce
        // qui garantissait autrefois l'absence de double comptage de la trésorerie.
        for (const etat of [ACTIF_LINES, PASSIF_LINES]) {
            const sommet = etat[etat.length - 1];
            const vus = new Set<string>();
            const descendre = (code: string) => {
                const line = etat.find((l) => l.code === code);
                if (!line) return;
                if (line.children?.length) {
                    line.children.forEach(descendre);
                } else {
                    expect(vus.has(code), `${code} agrégé deux fois`).toBe(false);
                    vus.add(code);
                }
            };
            descendre(sommet.code);
            expect(vus.size).toBeGreaterThan(0);
        }
    });

    it("retient toujours le préfixe le plus long", () => {
        expect(resolveRule("6011")?.prefix).toBe("601");
        expect(resolveRule("60311")?.prefix).toBe("6031");
        expect(resolveRule("2451")?.prefix).toBe("245");
        expect(resolveRule("6971")?.prefix).toBe("697");
        expect(resolveRule("7871")?.prefix).toBe("787");
    });

    it("ne reconnaît pas un compte hors référentiel", () => {
        expect(resolveRule("9999")).toBeNull();
    });
});

describe("solde et ventilation", () => {
    it("recalcule le solde au lieu de faire confiance à la source", () => {
        const compte: CompteBalance = { ...c("4111", "Clients", 900, 400), solde: 123456 };
        expect(soldeDe(compte)).toBe(500);
    });

    it("remonte les comptes qu'aucune règle ne sait affecter", () => {
        const { comptesNonAffectes } = genererEtatsFinanciers([
            c("9999", "Compte exotique", 250_000, 0),
            ...BALANCE_REFERENCE,
        ]);
        expect(comptesNonAffectes.map((x) => x.numero)).toContain("9999");
    });

    it("ignore un compte non affecté dont le solde est nul", () => {
        const { comptesNonAffectes } = genererEtatsFinanciers([c("9999", "Soldé", 100, 100)]);
        expect(comptesNonAffectes).toEqual([]);
    });

    it("n'affecte chaque compte qu'à une seule ligne", () => {
        const acc = ventiler([c("4421", "TVA due", 0, 800_000)], [...ACTIF_LINES, ...PASSIF_LINES]);
        const alimentees = [...acc.brut.entries()].filter(([, v]) => v !== 0);
        expect(alimentees).toHaveLength(1);
        expect(alimentees[0][0]).toBe("DK");
    });
});

describe("amortissements et dépréciations", () => {
    // Régression : l'ancien moteur EXCLUAIT les comptes d'amortissement du
    // calcul au lieu de les soustraire, et présentait donc le brut en net.
    it("soustrait les amortissements du brut au lieu de les écarter", () => {
        const { actif } = genererEtatsFinanciers([
            c("2411", "Matériel", 10_000_000, 0),
            c("2841", "Amortissements du matériel", 0, 4_000_000),
        ]);

        const am = ligne(actif, "AM");
        expect(am.brutN).toBe(10_000_000);
        expect(am.amortN).toBe(4_000_000);
        expect(am.netN).toBe(6_000_000);
    });

    it("répercute l'amortissement sur les totaux d'actif", () => {
        const { actif } = genererEtatsFinanciers([
            c("2411", "Matériel", 10_000_000, 0),
            c("2841", "Amortissements du matériel", 0, 4_000_000),
        ]);
        expect(net(actif, "AP")).toBe(6_000_000);
        expect(net(actif, "AZ")).toBe(6_000_000);
        expect(net(actif, "BZ")).toBe(6_000_000);
    });

    it("déprécie les stocks et les créances clients", () => {
        const { actif } = genererEtatsFinanciers([
            c("3111", "Stocks", 4_000_000, 0),
            c("3911", "Dépréciation des stocks", 0, 600_000),
            c("4111", "Clients", 2_000_000, 0),
            c("4911", "Dépréciation des comptes clients", 0, 300_000),
        ]);
        expect(net(actif, "BB")).toBe(3_400_000);
        expect(net(actif, "BI")).toBe(1_700_000);
    });
});

describe("reclassement des comptes de tiers selon le sens du solde", () => {
    // Régression : l'ancien mapping plaçait les classes 42/43/44/45/46/47 à la
    // fois à l'actif et au passif, comptant deux fois les mêmes comptes.
    it("classe un fournisseur débiteur en créance et un fournisseur créditeur en dette", () => {
        const { actif, passif } = genererEtatsFinanciers([
            c("4011", "Fournisseur débiteur", 500_000, 0),
            c("4012", "Fournisseur créditeur", 0, 3_000_000),
        ]);
        expect(net(actif, "BH")).toBe(500_000);
        expect(net(passif, "DJ")).toBe(3_000_000);
    });

    it("classe un client créditeur en avance reçue", () => {
        const { actif, passif } = genererEtatsFinanciers([
            c("4111", "Client débiteur", 5_000_000, 0),
            c("4191", "Client créditeur", 0, 900_000),
        ]);
        expect(net(actif, "BI")).toBe(5_000_000);
        expect(net(passif, "DI")).toBe(900_000);
    });

    it("classe un découvert bancaire en trésorerie-passif", () => {
        const { actif, passif } = genererEtatsFinanciers([
            c("5211", "Banque créditrice", 0, 1_200_000),
            c("5711", "Caisse", 350_000, 0),
        ]);
        expect(net(passif, "DR")).toBe(1_200_000);
        expect(net(actif, "BS")).toBe(350_000);
        expect(net(actif, "BT")).toBe(350_000);
    });

    it("ne compte jamais un compte de tiers des deux côtés du bilan", () => {
        const { actif, passif } = genererEtatsFinanciers([
            c("4421", "TVA due", 0, 800_000),
            c("4451", "TVA déductible", 450_000, 0),
        ]);
        expect(net(actif, "BJ")).toBe(450_000);
        expect(net(passif, "DK")).toBe(800_000);
    });
});

describe("compte de résultat et soldes intermédiaires de gestion", () => {
    it("déroule la cascade des SIG", () => {
        const { resultat } = genererEtatsFinanciers(BALANCE_REFERENCE);

        expect(net(resultat, "TA")).toBe(9_700_000);
        expect(net(resultat, "RA")).toBe(6_000_000);
        expect(net(resultat, "XA")).toBe(3_700_000); // marge commerciale
        expect(net(resultat, "XB")).toBe(9_700_000); // chiffre d'affaires
        expect(net(resultat, "XC")).toBe(3_700_000); // valeur ajoutée
        expect(net(resultat, "RK")).toBe(3_500_000);
        expect(net(resultat, "XD")).toBe(200_000); // EBE
        expect(net(resultat, "XE")).toBe(200_000); // résultat d'exploitation
        expect(net(resultat, "XI")).toBe(200_000); // résultat net
    });

    it("isole le résultat financier et le résultat HAO", () => {
        const { resultat } = genererEtatsFinanciers([
            c("7011", "Ventes", 0, 5_000_000),
            c("6011", "Achats", 3_000_000, 0),
            c("6711", "Intérêts des emprunts", 400_000, 0),
            c("7711", "Revenus financiers", 0, 150_000),
            c("8211", "Produits de cession", 0, 700_000),
            c("8111", "Valeur comptable des cessions", 500_000, 0),
            c("8911", "Impôt sur le résultat", 300_000, 0),
            c("1011", "Capital", 0, 2_650_000),
        ]);

        expect(net(resultat, "XF")).toBe(-250_000); // 150 000 - 400 000
        expect(net(resultat, "XH")).toBe(200_000); // 700 000 - 500 000
        expect(net(resultat, "XG")).toBe(1_750_000); // 2 000 000 - 250 000
        expect(net(resultat, "XI")).toBe(1_650_000); // 1 750 000 + 200 000 - 300 000
    });

    it("produit un résultat net négatif en cas de perte", () => {
        const { resultat, passif } = genererEtatsFinanciers([
            c("7011", "Ventes", 0, 1_000_000),
            c("6011", "Achats", 1_800_000, 0),
            c("1011", "Capital", 0, 5_000_000),
            c("5211", "Banque", 4_200_000, 0),
        ]);
        expect(net(resultat, "XI")).toBe(-800_000);
        expect(net(passif, "CJ")).toBe(-800_000);
    });
});

describe("équilibre du bilan", () => {
    it("équilibre actif et passif sur une balance avant affectation", () => {
        const etats = genererEtatsFinanciers(BALANCE_REFERENCE);

        expect(etats.controleBalance.equilibree).toBe(true);
        expect(etats.controleEquilibre.equilibre).toBe(true);
        expect(etats.controleEquilibre.ecart).toBe(0);
        expect(etats.controleEquilibre.totalActif).toBe(17_000_000);
        expect(etats.controleEquilibre.totalPassif).toBe(17_000_000);
    });

    it("détaille correctement l'actif de la balance de référence", () => {
        const { actif } = genererEtatsFinanciers(BALANCE_REFERENCE);
        expect(net(actif, "AZ")).toBe(6_000_000);
        expect(net(actif, "BK")).toBe(8_500_000);
        expect(net(actif, "BT")).toBe(2_500_000);
        expect(net(actif, "BZ")).toBe(17_000_000);
    });

    it("détaille correctement le passif de la balance de référence", () => {
        const { passif } = genererEtatsFinanciers(BALANCE_REFERENCE);
        expect(net(passif, "CA")).toBe(10_000_000);
        expect(net(passif, "CJ")).toBe(200_000);
        expect(net(passif, "CP")).toBe(11_200_000);
        expect(net(passif, "DD")).toBe(2_000_000);
        expect(net(passif, "DP")).toBe(3_800_000);
        expect(net(passif, "DZ")).toBe(17_000_000);
    });

    it("reporte le résultat de l'exercice au passif", () => {
        const etats = genererEtatsFinanciers(BALANCE_REFERENCE);
        expect(etats.resultatNet).toBe(200_000);
        expect(net(etats.passif, "CJ")).toBe(etats.resultatNet);
    });

    it("conserve le compte 13 sur une balance après affectation", () => {
        const etats = genererEtatsFinanciers([
            c("1301", "Résultat net de l'exercice", 0, 200_000),
            c("1011", "Capital", 0, 10_000_000),
            c("5211", "Banque", 10_200_000, 0),
        ]);
        expect(net(etats.passif, "CJ")).toBe(200_000);
        expect(etats.controleEquilibre.equilibre).toBe(true);
    });

    it("signale une balance source déséquilibrée", () => {
        const etats = genererEtatsFinanciers([
            c("5211", "Banque", 1_000_000, 0),
            c("1011", "Capital", 0, 900_000),
        ]);
        expect(etats.controleBalance.equilibree).toBe(false);
        expect(etats.controleBalance.ecart).toBe(100_000);
    });

    it("déduit correctement le capital non appelé des capitaux propres", () => {
        const { passif } = genererEtatsFinanciers([
            c("1011", "Capital", 0, 10_000_000),
            c("1091", "Capital souscrit non appelé", 2_000_000, 0),
            c("5211", "Banque", 8_000_000, 0),
        ]);
        expect(net(passif, "CB")).toBe(-2_000_000);
        expect(net(passif, "CP")).toBe(8_000_000);
    });
});

describe("exercice comparatif N-1", () => {
    it("renseigne la colonne N-1 sans toucher à la colonne N", () => {
        const balanceN1: CompteBalance[] = [
            c("2411", "Matériel", 10_000_000, 0),
            c("2841", "Amortissements", 0, 2_000_000),
            c("1011", "Capital", 0, 8_000_000),
        ];
        const { actif } = genererEtatsFinanciers(BALANCE_REFERENCE, balanceN1);
        const am = ligne(actif, "AM");
        expect(am.netN).toBe(6_000_000);
        expect(am.netN1).toBe(8_000_000);
    });

    it("laisse la colonne N-1 à zéro quand aucune balance comparative n'est fournie", () => {
        const { actif } = genererEtatsFinanciers(BALANCE_REFERENCE);
        expect(ligne(actif, "AM").netN1).toBe(0);
        expect(net(actif, "BZ")).toBe(17_000_000);
    });
});

describe("robustesse", () => {
    it("accepte une balance vide", () => {
        const etats = genererEtatsFinanciers([]);
        expect(etats.controleEquilibre.equilibre).toBe(true);
        expect(etats.resultatNet).toBe(0);
        expect(etats.actif).toHaveLength(ACTIF_LINES.length);
        expect(etats.resultat).toHaveLength(RESULTAT_LINES.length);
    });

    it("ignore les numéros de compte vides et normalise les espaces", () => {
        const etats = genererEtatsFinanciers([
            { numero: "  ", intitule: "ligne parasite", debit: 999, credit: 0 },
            { numero: " 5211 ", intitule: "Banque", debit: 1_000_000, credit: 0 },
            c("1011", "Capital", 0, 1_000_000),
        ]);
        expect(net(etats.actif, "BS")).toBe(1_000_000);
        expect(etats.controleEquilibre.equilibre).toBe(true);
    });
});
