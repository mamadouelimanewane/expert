import type { FinancialStatement, ReportLine } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Tableau des Flux de Trésorerie (TFT), méthode indirecte simplifiée.
//
// Contrairement à la présentation SYSCOHADA intégrale (qui isole la CAFG par
// addition des dotations aux amortissements/provisions et distingue les
// acquisitions brutes des cessions d'immobilisations), ce moteur ne dispose
// que des DEUX bilans successifs déjà produits par syscohada-engine.ts — pas
// du détail des mouvements de l'exercice (tableau des immobilisations, état
// des cessions). Il calcule donc chaque flux comme une variation de postes
// du bilan entre N et N-1, ce qui garantit l'équilibre PAR CONSTRUCTION :
// pour un bilan équilibré à N et à N-1 (actif = passif), la somme des trois
// flux égale nécessairement la variation de trésorerie nette — c'est une
// identité comptable, pas une hypothèse. La preuve est vérifiée par
// tests/tft-engine.test.ts sur des balances aléatoires.
//
// Ce que ce tableau NE fait PAS : distinguer une dotation aux amortissements
// d'une cession d'immobilisation (les deux diminuent l'actif immobilisé net
// de la même façon dans "Variation des immobilisations nettes"), ni isoler
// un dividende versé du reste des mouvements de capitaux propres. C'est une
// limite assumée et documentée, pas une donnée inventée.
// ─────────────────────────────────────────────────────────────────────────────

export type LigneTFT = {
    code: string;
    label: string;
    montant: number;
    isTotal?: boolean;
};

export type TFTResult = {
    exploitation: LigneTFT[];
    fluxExploitation: number;
    investissement: LigneTFT[];
    fluxInvestissement: number;
    financement: LigneTFT[];
    fluxFinancement: number;
    variationTresorerie: number;
    tresorerieOuverture: number;
    tresorerieClotureCalculee: number;
    tresorerieClotureReelle: number;
    /** tresorerieClotureCalculee - tresorerieClotureReelle : doit être ~0. */
    ecartControle: number;
    equilibre: boolean;
};

const TOLERANCE = 1;

function trouver(lignes: ReportLine[], code: string): ReportLine | undefined {
    return lignes.find((l) => l.code === code);
}

function net(lignes: ReportLine[], code: string, colonne: "netN" | "netN1"): number {
    return trouver(lignes, code)?.[colonne] ?? 0;
}

/**
 * Construit le TFT à partir du bilan déjà calculé (actif/passif, N et N-1).
 * `statement` doit provenir de `genererEtatsFinanciers(balanceN, balanceN1)`
 * avec un N-1 réellement renseigné — sans lui, toutes les variations valent
 * simplement les soldes N (delta depuis zéro), ce qui n'a pas de sens.
 */
export function genererTFT(statement: FinancialStatement): TFTResult {
    const { actif, passif, resultatNet } = statement;

    const azN = net(actif, "AZ", "netN");
    const azN1 = net(actif, "AZ", "netN1");
    const bkN = net(actif, "BK", "netN");
    const bkN1 = net(actif, "BK", "netN1");
    const btN = net(actif, "BT", "netN");
    const btN1 = net(actif, "BT", "netN1");

    const cpN = net(passif, "CP", "netN");
    const cpN1 = net(passif, "CP", "netN1");
    const ddN = net(passif, "DD", "netN");
    const ddN1 = net(passif, "DD", "netN1");
    const dpN = net(passif, "DP", "netN");
    const dpN1 = net(passif, "DP", "netN1");
    const dtN = net(passif, "DT", "netN");
    const dtN1 = net(passif, "DT", "netN1");

    const bfrN = bkN - dpN;
    const bfrN1 = bkN1 - dpN1;
    const variationBFR = bfrN - bfrN1;

    const resultatExercice = resultatNet;
    const fluxExploitation = resultatExercice - variationBFR;

    const variationImmobilisations = azN - azN1;
    const fluxInvestissement = -variationImmobilisations;

    const variationCP = cpN - cpN1;
    const variationDD = ddN - ddN1;
    const autresCapitauxPropres = variationCP - resultatExercice;
    const fluxFinancement = autresCapitauxPropres + variationDD;

    const variationTresorerie = fluxExploitation + fluxInvestissement + fluxFinancement;

    const tresorerieOuverture = btN1 - dtN1;
    const tresorerieClotureCalculee = tresorerieOuverture + variationTresorerie;
    const tresorerieClotureReelle = btN - dtN;
    const ecartControle = tresorerieClotureCalculee - tresorerieClotureReelle;

    return {
        exploitation: [
            { code: "FA", label: "Résultat net de l'exercice", montant: resultatExercice },
            { code: "FB", label: "Variation du besoin en fonds de roulement (BFR)", montant: -variationBFR },
            { code: "ZA", label: "FLUX NET DE TRÉSORERIE D'EXPLOITATION", montant: fluxExploitation, isTotal: true },
        ],
        fluxExploitation,
        investissement: [
            { code: "FC", label: "Variation des immobilisations nettes", montant: fluxInvestissement },
            { code: "ZB", label: "FLUX NET DE TRÉSORERIE D'INVESTISSEMENT", montant: fluxInvestissement, isTotal: true },
        ],
        fluxInvestissement,
        financement: [
            { code: "FD", label: "Variation des capitaux propres (hors résultat de l'exercice)", montant: autresCapitauxPropres },
            { code: "FE", label: "Variation des dettes financières", montant: variationDD },
            { code: "ZC", label: "FLUX NET DE TRÉSORERIE DE FINANCEMENT", montant: fluxFinancement, isTotal: true },
        ],
        fluxFinancement,
        variationTresorerie,
        tresorerieOuverture,
        tresorerieClotureCalculee,
        tresorerieClotureReelle,
        ecartControle,
        equilibre: Math.abs(ecartControle) <= TOLERANCE,
    };
}
