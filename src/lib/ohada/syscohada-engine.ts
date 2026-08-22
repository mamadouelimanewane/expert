import { ACCOUNT_RULES, ACTIF_LINES, PASSIF_LINES, RESULTAT_LINES } from "./plan";
import type {
    AccountRule,
    CompteBalance,
    CompteNonAffecte,
    ControleBalance,
    ControleEquilibre,
    FinancialStatement,
    LineDef,
    ReportLine,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Moteur de production des états financiers SYSCOHADA révisé (AUDCIF) à partir
// d'une balance générale.
//
// Garanties apportées par l'implémentation :
//   • chaque compte alimente exactement UNE ligne (préfixe le plus long) ;
//   • les amortissements et dépréciations sont SOUSTRAITS du brut, ils ne sont
//     jamais écartés du calcul ;
//   • les comptes de tiers sont reclassés selon le sens réel de leur solde ;
//   • tout compte non reconnu est remonté dans `comptesNonAffectes` plutôt que
//     silencieusement ignoré ;
//   • deux contrôles sont produits : équilibre de la balance source (débit =
//     crédit) et équilibre du bilan obtenu (actif = passif).
// ─────────────────────────────────────────────────────────────────────────────

/** Tolérance d'arrondi, en unité monétaire (FCFA). */
export const TOLERANCE = 1;

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Solde arithmétique du compte : toujours recalculé, jamais lu depuis la source. */
export function soldeDe(compte: CompteBalance): number {
    return round2((compte.debit || 0) - (compte.credit || 0));
}

/**
 * Retourne la règle applicable à un numéro de compte : celle dont le préfixe
 * correspondant est le plus long. `null` si aucun préfixe ne correspond.
 */
export function resolveRule(
    numero: string,
    rules: AccountRule[] = ACCOUNT_RULES
): AccountRule | null {
    let best: AccountRule | null = null;
    for (const rule of rules) {
        if (!numero.startsWith(rule.prefix)) continue;
        if (!best || rule.prefix.length > best.prefix.length) best = rule;
    }
    return best;
}

type Accumulator = {
    brut: Map<string, number>;
    amort: Map<string, number>;
    nonAffectes: CompteNonAffecte[];
};

function add(map: Map<string, number>, code: string, value: number): void {
    map.set(code, (map.get(code) ?? 0) + value);
}

/**
 * Ventile une balance sur les lignes d'états financiers.
 *
 * Les montants sont stockés en valeur de présentation : positifs pour une
 * ligne d'actif ou de charge alimentée par un solde débiteur, positifs
 * également pour une ligne de passif ou de produit alimentée par un solde
 * créditeur. Un solde de sens contraire produit donc une valeur négative,
 * ce qui est le comportement attendu (report à nouveau débiteur, perte…).
 */
export function ventiler(balance: CompteBalance[], lines: LineDef[]): Accumulator {
    const sensParCode = new Map(lines.map((l) => [l.code, l.sens]));
    const acc: Accumulator = { brut: new Map(), amort: new Map(), nonAffectes: [] };

    for (const compte of balance) {
        const numero = String(compte.numero ?? "").trim();
        if (!numero) continue;

        const solde = soldeDe(compte);
        const rule = resolveRule(numero);

        if (!rule) {
            if (Math.abs(solde) > 0) {
                acc.nonAffectes.push({ numero, intitule: compte.intitule ?? "", solde });
            }
            continue;
        }

        // Amortissement / dépréciation : solde créditeur → montant positif venant
        // en diminution du brut de la ligne d'actif rattachée.
        if (rule.depreciationOf) {
            if (sensParCode.has(rule.depreciationOf)) {
                add(acc.amort, rule.depreciationOf, -solde);
            }
            continue;
        }

        const code = solde >= 0 ? rule.debit : rule.credit;
        if (!code) {
            if (Math.abs(solde) > 0) {
                acc.nonAffectes.push({ numero, intitule: compte.intitule ?? "", solde });
            }
            continue;
        }

        // Une ligne du référentiel non déclarée dans `lines` (ex. ligne de bilan
        // rencontrée pendant le calcul du compte de résultat) est ignorée ici :
        // elle est traitée lors de la ventilation de l'autre état.
        const sens = sensParCode.get(code);
        if (!sens) continue;

        add(acc.brut, code, sens === "DEBIT" ? solde : -solde);
    }

    return acc;
}

/** Recalcule en place les lignes de total d'un état déjà matérialisé. */
function recalculerTotaux(lines: ReportLine[]): void {
    const byCode = new Map(lines.map((l) => [l.code, l]));
    const totaux = lines.filter((l) => l.children && l.children.length > 0);
    const resolved = new Set<string>();

    // Passes successives : un total dont un enfant est lui-même un total non
    // encore résolu attend la passe suivante. Les ensembles d'enfants étant
    // disjoints, aucun montant ne peut être compté deux fois.
    for (let pass = 0; pass < 10 && resolved.size < totaux.length; pass++) {
        for (const line of totaux) {
            if (resolved.has(line.code)) continue;

            const enfants = line.children!
                .map((c) => byCode.get(c))
                .filter((e): e is ReportLine => Boolean(e));

            if (enfants.some((e) => e.children && e.children.length > 0 && !resolved.has(e.code))) {
                continue;
            }

            line.brutN = round2(enfants.reduce((s, e) => s + e.brutN, 0));
            line.amortN = round2(enfants.reduce((s, e) => s + e.amortN, 0));
            line.netN = round2(enfants.reduce((s, e) => s + e.netN, 0));
            line.netN1 = round2(enfants.reduce((s, e) => s + e.netN1, 0));
            resolved.add(line.code);
        }
    }
}

/** Construit les lignes finales à partir des accumulateurs et résout les totaux. */
function materialiser(
    defs: LineDef[],
    accN: Accumulator,
    accN1: Accumulator
): ReportLine[] {
    const lines: ReportLine[] = defs.map((def) => {
        const brutN = round2(accN.brut.get(def.code) ?? 0);
        const amortN = round2(accN.amort.get(def.code) ?? 0);
        const brutN1 = round2(accN1.brut.get(def.code) ?? 0);
        const amortN1 = round2(accN1.amort.get(def.code) ?? 0);

        return {
            code: def.code,
            label: def.label,
            section: def.section,
            brutN,
            amortN,
            netN: round2(brutN - amortN),
            netN1: round2(brutN1 - amortN1),
            isTotal: def.isTotal,
            isSIG: def.isSIG,
            children: def.children,
        };
    });

    recalculerTotaux(lines);
    return lines;
}

/** Somme les valeurs d'une liste de codes pour l'exercice demandé. */
function sum(lines: Map<string, ReportLine>, codes: string[], key: "netN" | "netN1"): number {
    return codes.reduce((s, c) => s + (lines.get(c)?.[key] ?? 0), 0);
}

/**
 * Applique la cascade des soldes intermédiaires de gestion sur un exercice.
 * Renvoie le résultat net de l'exercice (ligne XI).
 */
function calculerSIG(byCode: Map<string, ReportLine>, key: "netN" | "netN1"): number {
    const set = (code: string, value: number): number => {
        const rounded = round2(value);
        const line = byCode.get(code);
        if (line) {
            line[key] = rounded;
            if (key === "netN") line.brutN = rounded;
        }
        return rounded;
    };
    const g = (code: string): number => byCode.get(code)?.[key] ?? 0;

    // Marge commerciale = ventes de marchandises - achats - variation de stocks
    const XA = set("XA", g("TA") - g("RA") - g("RB"));

    // Chiffre d'affaires
    set("XB", sum(byCode, ["TA", "TB", "TC", "TD"], key));

    // Valeur ajoutée = marge commerciale + autres produits d'exploitation
    //                  - consommations intermédiaires
    const produitsExploitation = sum(byCode, ["TB", "TC", "TD", "TE", "TF", "TG", "TH", "TI"], key);
    const consommations = sum(byCode, ["RC", "RD", "RE", "RF", "RG", "RH", "RI", "RJ"], key);
    const XC = set("XC", XA + produitsExploitation - consommations);

    // Excédent brut d'exploitation = valeur ajoutée - charges de personnel
    const XD = set("XD", XC - g("RK"));

    // Résultat d'exploitation = EBE + reprises - dotations
    const XE = set("XE", XD + g("TJ") - g("RL"));

    // Résultat financier
    const XF = set("XF", sum(byCode, ["TK", "TL", "TM"], key) - g("RM") - g("RN"));

    // Résultat des activités ordinaires
    const XG = set("XG", XE + XF);

    // Résultat hors activités ordinaires
    const XH = set("XH", g("TN") + g("TO") - g("RO") - g("RP"));

    // Résultat net = RAO + HAO - participation des travailleurs - impôt
    return set("XI", XG + XH - g("RQ") - g("RS"));
}

function controlerBalance(balance: CompteBalance[]): ControleBalance {
    const totalDebit = round2(balance.reduce((s, c) => s + (c.debit || 0), 0));
    const totalCredit = round2(balance.reduce((s, c) => s + (c.credit || 0), 0));
    const ecart = round2(totalDebit - totalCredit);
    return { totalDebit, totalCredit, ecart, equilibree: Math.abs(ecart) <= TOLERANCE };
}

/**
 * Produit le jeu complet d'états financiers SYSCOHADA révisé.
 *
 * @param balanceN  balance générale de l'exercice N
 * @param balanceN1 balance générale de l'exercice N-1 (facultative — les
 *                  colonnes N-1 restent alors à zéro)
 */
export function genererEtatsFinanciers(
    balanceN: CompteBalance[],
    balanceN1: CompteBalance[] = []
): FinancialStatement {
    const bilanDefs = [...ACTIF_LINES, ...PASSIF_LINES];

    const accBilanN = ventiler(balanceN, bilanDefs);
    const accBilanN1 = ventiler(balanceN1, bilanDefs);
    const accResN = ventiler(balanceN, RESULTAT_LINES);
    const accResN1 = ventiler(balanceN1, RESULTAT_LINES);

    // ── Compte de résultat ──────────────────────────────────────────────────
    const resultat = materialiser(RESULTAT_LINES, accResN, accResN1);
    const resByCode = new Map(resultat.map((l) => [l.code, l]));
    const resultatNet = calculerSIG(resByCode, "netN");
    const resultatNetN1 = calculerSIG(resByCode, "netN1");

    // ── Bilan ───────────────────────────────────────────────────────────────
    const actif = materialiser(ACTIF_LINES, accBilanN, accBilanN1);
    const passif = materialiser(PASSIF_LINES, accBilanN, accBilanN1);

    // Report du résultat au passif (ligne CJ).
    // Sur une balance avant affectation, le compte 13 est vide et le résultat
    // provient de la cascade des classes 6/7/8. Sur une balance après clôture,
    // le compte 13 est déjà servi et fait foi.
    const cj = passif.find((l) => l.code === "CJ");
    if (cj) {
        if (Math.abs(cj.netN) <= TOLERANCE) {
            cj.brutN = resultatNet;
            cj.netN = resultatNet;
        }
        if (Math.abs(cj.netN1) <= TOLERANCE) {
            cj.netN1 = resultatNetN1;
        }
        recalculerTotaux(passif);
    }

    const totalActif = actif.find((l) => l.code === "BZ")?.netN ?? 0;
    const totalPassif = passif.find((l) => l.code === "DZ")?.netN ?? 0;
    const ecart = round2(totalActif - totalPassif);

    const controleEquilibre: ControleEquilibre = {
        totalActif,
        totalPassif,
        ecart,
        equilibre: Math.abs(ecart) <= TOLERANCE,
    };

    // Un compte non affecté sur N ou sur N-1 n'est signalé qu'une fois.
    const nonAffectes = new Map<string, CompteNonAffecte>();
    for (const c of [...accBilanN.nonAffectes, ...accBilanN1.nonAffectes]) {
        if (!nonAffectes.has(c.numero)) nonAffectes.set(c.numero, c);
    }

    return {
        actif,
        passif,
        resultat,
        resultatNet,
        comptesNonAffectes: [...nonAffectes.values()].sort((a, b) =>
            a.numero.localeCompare(b.numero)
        ),
        controleBalance: controlerBalance(balanceN),
        controleEquilibre,
    };
}

// ── Compatibilité ascendante ────────────────────────────────────────────────
// Les anciens appels continuent de fonctionner, mais passent désormais par le
// moteur complet et bénéficient donc des corrections d'amortissement et de
// reclassement.

export function generateBilanActif(
    balanceN: CompteBalance[],
    balanceN1: CompteBalance[] = []
): ReportLine[] {
    return genererEtatsFinanciers(balanceN, balanceN1).actif;
}

export function generateBilanPassif(
    balanceN: CompteBalance[],
    balanceN1: CompteBalance[] = []
): ReportLine[] {
    return genererEtatsFinanciers(balanceN, balanceN1).passif;
}

export function generateCompteResultat(
    balanceN: CompteBalance[],
    balanceN1: CompteBalance[] = []
): ReportLine[] {
    return genererEtatsFinanciers(balanceN, balanceN1).resultat;
}

export { ACTIF_LINES, PASSIF_LINES, RESULTAT_LINES } from "./plan";
