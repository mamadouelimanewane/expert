import { describe, expect, it } from "vitest";
import {
    consolidateBalances,
    consolider,
    type CompanyBalance,
    type Elimination,
} from "@/lib/consolidation-engine";

const societe = (
    id: string,
    nom: string,
    balances: { account: string; label: string; debit: number; credit: number }[],
    pourcentage?: number
): CompanyBalance => ({
    companyId: id,
    companyName: nom,
    pourcentageIntegration: pourcentage,
    balances,
});

const elim = (o: Partial<Elimination> & { amount: number; accountDebit: string; accountCredit: string }): Elimination => ({
    id: "E1",
    type: "INTRAGROUPE",
    buyerId: "A",
    sellerId: "B",
    ...o,
});

/** Mère et fille, avec une créance/dette réciproque de 500 000. */
const GROUPE: CompanyBalance[] = [
    societe("A", "Mère SA", [
        { account: "101", label: "Capital", debit: 0, credit: 5_000_000 },
        { account: "411", label: "Clients", debit: 800_000, credit: 0 },
        { account: "521", label: "Banque", debit: 4_200_000, credit: 0 },
    ]),
    societe("B", "Fille SARL", [
        { account: "101", label: "Capital", debit: 0, credit: 1_000_000 },
        { account: "401", label: "Fournisseurs", debit: 0, credit: 600_000 },
        { account: "521", label: "Banque", debit: 1_600_000, credit: 0 },
    ]),
];

const compte = (comptes: ReturnType<typeof consolidateBalances>, code: string) =>
    comptes.find((c) => c.account === code)!;

describe("cumul des balances", () => {
    it("agrège les comptes de même numéro", () => {
        const comptes = consolidateBalances(GROUPE, []);
        expect(compte(comptes, "101").credit).toBe(6_000_000);
        expect(compte(comptes, "521").debit).toBe(5_800_000);
    });

    it("présente le solde du bon côté", () => {
        const comptes = consolidateBalances(GROUPE, []);
        expect(compte(comptes, "101").consolidatedCredit).toBe(6_000_000);
        expect(compte(comptes, "101").consolidatedDebit).toBe(0);
        expect(compte(comptes, "521").consolidatedDebit).toBe(5_800_000);
        expect(compte(comptes, "521").consolidatedCredit).toBe(0);
    });

    it("équilibre la balance consolidée en l'absence d'élimination", () => {
        const { controles } = consolider(GROUPE, []);
        expect(controles.cumulEquilibre).toBe(true);
        expect(controles.consolideEquilibre).toBe(true);
        expect(controles.totalConsolideDebit).toBe(controles.totalConsolideCredit);
    });

    it("applique le pourcentage d'intégration proportionnelle", () => {
        const groupe = [
            societe("A", "Mère", [{ account: "521", label: "Banque", debit: 1_000_000, credit: 0 }]),
            societe("B", "Coentreprise", [{ account: "521", label: "Banque", debit: 1_000_000, credit: 0 }], 50),
        ];
        expect(compte(consolidateBalances(groupe, []), "521").consolidatedDebit).toBe(1_500_000);
    });

    it("signale un pourcentage d'intégration hors bornes", () => {
        const groupe = [societe("A", "Mère", [{ account: "521", label: "B", debit: 100, credit: 0 }], 150)];
        expect(consolider(groupe, []).controles.anomalies.join(" ")).toContain("hors bornes");
    });
});

describe("écritures d'élimination", () => {
    // Régression majeure : le solde consolidé s'écrivait
    // `debit - eliminationDebit + eliminationCredit - credit`. Les signes
    // étaient inversés, si bien qu'une élimination amplifiait le solde qu'elle
    // était censée annuler.
    it("annule une créance et une dette réciproques", () => {
        const eliminations = [
            elim({ amount: 600_000, accountDebit: "401", accountCredit: "411" }),
        ];
        const comptes = consolidateBalances(GROUPE, eliminations);

        // 401 : 600 000 au crédit, éliminé par un débit de 600 000 → soldé.
        expect(compte(comptes, "401").consolidatedCredit).toBe(0);
        expect(compte(comptes, "401").consolidatedDebit).toBe(0);

        // 411 : 800 000 au débit, réduit de 600 000 → 200 000.
        expect(compte(comptes, "411").consolidatedDebit).toBe(200_000);
    });

    it("ne fait jamais grossir le solde qu'elle élimine", () => {
        const avant = compte(consolidateBalances(GROUPE, []), "411").consolidatedDebit;
        const apres = compte(
            consolidateBalances(GROUPE, [elim({ amount: 300_000, accountDebit: "401", accountCredit: "411" })]),
            "411"
        ).consolidatedDebit;

        expect(apres).toBeLessThan(avant);
        expect(apres).toBe(avant - 300_000);
    });

    it("bascule le solde du côté opposé si l'élimination dépasse le solde", () => {
        const comptes = consolidateBalances(
            GROUPE,
            [elim({ amount: 1_000_000, accountDebit: "401", accountCredit: "411" })]
        );
        expect(compte(comptes, "411").consolidatedCredit).toBe(200_000);
        expect(compte(comptes, "411").consolidatedDebit).toBe(0);
    });

    it("conserve l'équilibre de la balance après une élimination équilibrée", () => {
        const { controles } = consolider(GROUPE, [
            elim({ amount: 600_000, accountDebit: "401", accountCredit: "411" }),
        ]);
        expect(controles.eliminationsEquilibrees).toBe(true);
        expect(controles.consolideEquilibre).toBe(true);
    });

    it("cumule plusieurs éliminations sur le même compte", () => {
        const comptes = consolidateBalances(GROUPE, [
            elim({ id: "E1", amount: 200_000, accountDebit: "401", accountCredit: "411" }),
            elim({ id: "E2", amount: 300_000, accountDebit: "401", accountCredit: "411" }),
        ]);
        expect(compte(comptes, "411").consolidatedDebit).toBe(300_000);
    });

    it("ignore une élimination de montant nul", () => {
        const sans = consolidateBalances(GROUPE, []);
        const avec = consolidateBalances(GROUPE, [
            elim({ amount: 0, accountDebit: "401", accountCredit: "411" }),
        ]);
        expect(avec).toEqual(sans);
    });
});

describe("contrôles de cohérence", () => {
    // Régression : une élimination portant sur un compte absent des balances
    // était silencieusement abandonnée, ce qui déséquilibrait la consolidation
    // sans aucune trace.
    it("crée le compte et signale une élimination sur un compte inconnu", () => {
        const { comptes, controles } = consolider(GROUPE, [
            elim({ amount: 100_000, accountDebit: "601", accountCredit: "411" }),
        ]);

        expect(comptes.some((c) => c.account === "601")).toBe(true);
        expect(controles.comptesCreesParElimination).toContain("601");
        expect(controles.anomalies.join(" ")).toContain("601");
        // L'équilibre reste vérifié malgré la création du compte.
        expect(controles.consolideEquilibre).toBe(true);
    });

    it("signale des éliminations qui ne respectent pas la partie double", () => {
        // On force le déséquilibre en supprimant le compte crédité du jeu.
        const { controles } = consolider(GROUPE, [
            { ...elim({ amount: 100_000, accountDebit: "401", accountCredit: "" }) },
        ]);
        expect(controles.anomalies.join(" ")).toContain("incomplète");
    });

    it("signale un cumul de balances déséquilibré", () => {
        const groupe = [
            societe("A", "Mère", [
                { account: "521", label: "Banque", debit: 1_000_000, credit: 0 },
                { account: "101", label: "Capital", debit: 0, credit: 900_000 },
            ]),
        ];
        const { controles } = consolider(groupe, []);
        expect(controles.cumulEquilibre).toBe(false);
        expect(controles.anomalies.join(" ")).toContain("pas équilibré");
    });

    it("ne remonte aucune anomalie sur un groupe sain", () => {
        const { controles } = consolider(GROUPE, [
            elim({ amount: 600_000, accountDebit: "401", accountCredit: "411" }),
        ]);
        expect(controles.anomalies).toEqual([]);
    });

    it("trie les comptes par numéro", () => {
        const comptes = consolidateBalances(GROUPE, []);
        const codes = comptes.map((c) => c.account);
        expect(codes).toEqual([...codes].sort());
    });

    it("accepte un groupe vide", () => {
        const { comptes, controles } = consolider([], []);
        expect(comptes).toEqual([]);
        expect(controles.consolideEquilibre).toBe(true);
    });
});
