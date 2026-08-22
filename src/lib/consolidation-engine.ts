// ─────────────────────────────────────────────────────────────────────────────
// Consolidation des comptes d'un groupe.
//
// Corrections par rapport à la version précédente :
//
//  1. INVERSION DE SIGNE — le solde consolidé était calculé
//     `debit - eliminationDebit + eliminationCredit - credit`. Une écriture
//     d'élimination qui DÉBITE un compte doit AUGMENTER son solde débiteur,
//     pas le diminuer. Les signes étaient inversés, ce qui produisait des
//     comptes consolidés faux dès qu'une élimination existait.
//  2. ÉLIMINATIONS SILENCIEUSEMENT PERDUES — une élimination portant sur un
//     compte absent des balances individuelles était ignorée sans trace. Le
//     compte est désormais créé, et le total reste juste.
//  3. AUCUN CONTRÔLE D'ÉQUILIBRE — ni sur les balances agrégées, ni sur le jeu
//     d'éliminations. Les deux sont maintenant vérifiés et remontés.
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountBalance {
    account: string;
    label: string;
    debit: number;
    credit: number;
}

export interface CompanyBalance {
    companyId: string;
    companyName: string;
    /** Pourcentage d'intégration (100 = intégration globale). Défaut : 100. */
    pourcentageIntegration?: number;
    balances: AccountBalance[];
}

export interface Elimination {
    id: string;
    type: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    accountDebit: string;
    accountCredit: string;
}

export interface ConsolidatedAccount {
    account: string;
    label: string;
    debit: number;
    credit: number;
    eliminationDebit: number;
    eliminationCredit: number;
    consolidatedDebit: number;
    consolidatedCredit: number;
}

export interface ControleConsolidation {
    /** Cumul des balances individuelles avant élimination. */
    totalDebitCumule: number;
    totalCreditCumule: number;
    cumulEquilibre: boolean;
    /** Somme des éliminations, qui doit être équilibrée (partie double). */
    totalEliminationDebit: number;
    totalEliminationCredit: number;
    eliminationsEquilibrees: boolean;
    /** Balance consolidée finale. */
    totalConsolideDebit: number;
    totalConsolideCredit: number;
    consolideEquilibre: boolean;
    /** Comptes créés par une élimination sans exister dans aucune balance. */
    comptesCreesParElimination: string[];
    anomalies: string[];
}

export interface ResultatConsolidation {
    comptes: ConsolidatedAccount[];
    controles: ControleConsolidation;
}

/** Tolérance d'arrondi, en unité monétaire. */
const TOLERANCE = 1;

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Agrège les balances des entités du groupe et applique les écritures
 * d'élimination des opérations réciproques.
 */
export function consolidateBalances(
    companyBalances: CompanyBalance[],
    eliminations: Elimination[]
): ConsolidatedAccount[] {
    return consolider(companyBalances, eliminations).comptes;
}

/**
 * Même calcul que `consolidateBalances`, en renvoyant en plus les contrôles de
 * cohérence. À privilégier : une consolidation sans contrôle d'équilibre n'est
 * pas exploitable en revue.
 */
export function consolider(
    companyBalances: CompanyBalance[],
    eliminations: Elimination[]
): ResultatConsolidation {
    const map = new Map<string, ConsolidatedAccount>();
    const comptesCreesParElimination: string[] = [];
    const anomalies: string[] = [];

    const toucher = (account: string, label: string): ConsolidatedAccount => {
        let acc = map.get(account);
        if (!acc) {
            acc = {
                account,
                label,
                debit: 0,
                credit: 0,
                eliminationDebit: 0,
                eliminationCredit: 0,
                consolidatedDebit: 0,
                consolidatedCredit: 0,
            };
            map.set(account, acc);
        }
        return acc;
    };

    // ── 1. Cumul des balances individuelles ─────────────────────────────────
    for (const comp of companyBalances) {
        const quotePart = (comp.pourcentageIntegration ?? 100) / 100;

        if (quotePart < 0 || quotePart > 1) {
            anomalies.push(
                `Pourcentage d'intégration hors bornes pour ${comp.companyName} : ${comp.pourcentageIntegration}%.`
            );
        }

        for (const bal of comp.balances) {
            const acc = toucher(bal.account, bal.label);
            acc.debit += (bal.debit || 0) * quotePart;
            acc.credit += (bal.credit || 0) * quotePart;
        }
    }

    const totalDebitCumule = round2([...map.values()].reduce((s, a) => s + a.debit, 0));
    const totalCreditCumule = round2([...map.values()].reduce((s, a) => s + a.credit, 0));

    // ── 2. Écritures d'élimination ──────────────────────────────────────────
    for (const elim of eliminations) {
        const montant = Number(elim.amount) || 0;
        if (montant === 0) continue;

        if (!elim.accountDebit || !elim.accountCredit) {
            anomalies.push(
                `Élimination ${elim.id} incomplète (compte de débit ou de crédit manquant) : ignorée.`
            );
            continue;
        }

        for (const [compte, champ] of [
            [elim.accountDebit, "eliminationDebit"],
            [elim.accountCredit, "eliminationCredit"],
        ] as const) {
            if (!map.has(compte)) {
                comptesCreesParElimination.push(compte);
            }
            const acc = toucher(compte, `Compte ${compte} (créé par élimination)`);
            acc[champ] += montant;
        }
    }

    const totalEliminationDebit = round2(
        [...map.values()].reduce((s, a) => s + a.eliminationDebit, 0)
    );
    const totalEliminationCredit = round2(
        [...map.values()].reduce((s, a) => s + a.eliminationCredit, 0)
    );

    // ── 3. Soldes consolidés ────────────────────────────────────────────────
    // Le solde net raisonne en une seule grandeur signée : une élimination qui
    // débite augmente le solde, une élimination qui crédite le diminue.
    for (const acc of map.values()) {
        acc.debit = round2(acc.debit);
        acc.credit = round2(acc.credit);
        acc.eliminationDebit = round2(acc.eliminationDebit);
        acc.eliminationCredit = round2(acc.eliminationCredit);

        const soldeNet =
            acc.debit - acc.credit + acc.eliminationDebit - acc.eliminationCredit;

        acc.consolidatedDebit = soldeNet > 0 ? round2(soldeNet) : 0;
        acc.consolidatedCredit = soldeNet < 0 ? round2(-soldeNet) : 0;
    }

    const comptes = [...map.values()].sort((a, b) => a.account.localeCompare(b.account));

    const totalConsolideDebit = round2(comptes.reduce((s, a) => s + a.consolidatedDebit, 0));
    const totalConsolideCredit = round2(comptes.reduce((s, a) => s + a.consolidatedCredit, 0));

    const cumulEquilibre = Math.abs(totalDebitCumule - totalCreditCumule) <= TOLERANCE;
    const eliminationsEquilibrees =
        Math.abs(totalEliminationDebit - totalEliminationCredit) <= TOLERANCE;
    const consolideEquilibre =
        Math.abs(totalConsolideDebit - totalConsolideCredit) <= TOLERANCE;

    if (!cumulEquilibre) {
        anomalies.push(
            `Le cumul des balances individuelles n'est pas équilibré (écart de ${round2(
                totalDebitCumule - totalCreditCumule
            )}).`
        );
    }
    if (!eliminationsEquilibrees) {
        anomalies.push(
            `Les écritures d'élimination ne respectent pas la partie double (écart de ${round2(
                totalEliminationDebit - totalEliminationCredit
            )}).`
        );
    }
    if (comptesCreesParElimination.length > 0) {
        anomalies.push(
            `Éliminations portant sur des comptes absents des balances individuelles : ${[
                ...new Set(comptesCreesParElimination),
            ].join(", ")}.`
        );
    }

    return {
        comptes,
        controles: {
            totalDebitCumule,
            totalCreditCumule,
            cumulEquilibre,
            totalEliminationDebit,
            totalEliminationCredit,
            eliminationsEquilibrees,
            totalConsolideDebit,
            totalConsolideCredit,
            consolideEquilibre,
            comptesCreesParElimination: [...new Set(comptesCreesParElimination)],
            anomalies,
        },
    };
}
