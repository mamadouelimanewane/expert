import { CompteBalance, FinancialStatement, MappingRule, ReportLine } from "./types";

// === MAPPING SIMPLIFIE SYSCOHADA REVISE ===
// Note: Dans une version production, ce mapping serait complet (centaines de règles)
// Ici on illustre la structure "Transformation Excel -> Code"

const ASSET_MAPPING: MappingRule[] = [
    // ACTIF IMMOBILISE
    { reportLineCode: "AD", accountPatterns: ["21"], subtractPatterns: ["281", "291"], sign: 1 }, // Immob Incorporelles
    { reportLineCode: "AE", accountPatterns: ["22", "23", "24"], subtractPatterns: ["282", "283", "284", "292", "293", "294"], sign: 1 }, // Immob Corporelles
    { reportLineCode: "AF", accountPatterns: ["26", "27"], subtractPatterns: ["296", "297"], sign: 1 }, // Immob Financieres

    // ACTIF CIRCULANT
    { reportLineCode: "BA", accountPatterns: ["31", "32", "33", "34", "35", "37", "38"], subtractPatterns: ["39"], sign: 1 }, // Stocks
    { reportLineCode: "BB", accountPatterns: ["41"], subtractPatterns: ["491"], sign: 1 }, // Clients
    { reportLineCode: "BG", accountPatterns: ["42", "43", "44", "45", "46", "47", "409"], subtractPatterns: ["492", "493", "494", "495", "496"], sign: 1 }, // Autres créances

    // TRESORERIE
    { reportLineCode: "BQ", accountPatterns: ["50", "51", "52", "53", "54", "55", "56", "57"], subtractPatterns: ["59"], sign: 1 }, // Trésorerie Actif
];

const LIABILITY_MAPPING: MappingRule[] = [
    // CAPITAUX PROPRES
    { reportLineCode: "CA", accountPatterns: ["10"], sign: -1 }, // Capital
    { reportLineCode: "CB", accountPatterns: ["11"], sign: -1 }, // Réserves
    { reportLineCode: "CD", accountPatterns: ["12"], sign: -1 }, // Report à nouveau
    { reportLineCode: "CF", accountPatterns: ["13"], sign: -1 }, // Résultat

    // DETTES FINANCIERES
    { reportLineCode: "DA", accountPatterns: ["16", "17"], sign: -1 }, // Emprunts

    // PASSIF CIRCULANT
    { reportLineCode: "DB", accountPatterns: ["40"], sign: -1 }, // Fournisseurs
    { reportLineCode: "DC", accountPatterns: ["42", "43", "44"], sign: -1 }, // Fiscal et Social
    { reportLineCode: "DD", accountPatterns: ["419", "45", "46", "47"], sign: -1 }, // Autres dettes
];

const INCOME_MAPPING: MappingRule[] = [
    { reportLineCode: "TA", accountPatterns: ["70"], sign: -1 }, // Ventes marchandises
    { reportLineCode: "TB", accountPatterns: ["71"], sign: -1 }, // Ventes produits fabriqués
    { reportLineCode: "TC", accountPatterns: ["72", "73", "75"], sign: -1 }, // Travaux et services
    { reportLineCode: "RA", accountPatterns: ["601", "602", "604", "605", "608"], sign: 1 }, // Achats Marchandises
    { reportLineCode: "RB", accountPatterns: ["603"], sign: 1 }, // Variation Stocks
    { reportLineCode: "RC", accountPatterns: ["61", "62", "63"], sign: 1 }, // Transports et services extérieurs
    { reportLineCode: "RD", accountPatterns: ["64"], sign: 1 }, // Impôts et taxes
    { reportLineCode: "RE", accountPatterns: ["66"], sign: 1 }, // Charges de personnel
];


// === MOTEUR DE CALCUL ===

export function calculateReportLine(
    rule: MappingRule,
    balance: CompteBalance[]
): number {
    let total = 0;

    // Filtre les comptes qui matchent les patterns (ex: commence par "21")
    const matchingAccounts = balance.filter(acc =>
        rule.accountPatterns.some(pattern => acc.numero.startsWith(pattern)) &&
        (!rule.subtractPatterns || !rule.subtractPatterns.some(sub => acc.numero.startsWith(sub)))
    );

    // Some the solde
    // Note: Dans la balance, par convention Debit = +, Credit = -
    // Si rule.sign = -1 (Passif/Produits), on inverse car on veut afficher en positif
    const rawSum = matchingAccounts.reduce((sum, acc) => sum + acc.solde, 0);

    return rawSum * rule.sign!;
}

export function generateBilanActif(balanceN: CompteBalance[], balanceN1: CompteBalance[]): ReportLine[] {
    const lines: ReportLine[] = [
        { code: "AD", label: "Immobilisations Incorporelles", netN: 0, netN1: 0 },
        { code: "AE", label: "Immobilisations Corporelles", netN: 0, netN1: 0 },
        { code: "AF", label: "Immobilisations Financières", netN: 0, netN1: 0 },
        { code: "AX", label: " TOTAL ACTIF IMMOBILISÉ", netN: 0, netN1: 0, isTotal: true, children: ["AD", "AE", "AF"] },

        { code: "BA", label: "Stocks et en-cours", netN: 0, netN1: 0 },
        { code: "BB", label: "Clients et comptes rattachés", netN: 0, netN1: 0 },
        { code: "BG", label: "Autres créances", netN: 0, netN1: 0 },
        { code: "BX", label: " TOTAL ACTIF CIRCULANT", netN: 0, netN1: 0, isTotal: true, children: ["BA", "BB", "BG"] },

        { code: "BQ", label: "Trésorerie-Actif", netN: 0, netN1: 0 },
        { code: "BX", label: " TOTAL TRÉSORERIE", netN: 0, netN1: 0, isTotal: true, children: ["BQ"] },

        { code: "BZ", label: " TOTAL GÉNÉRAL ACTIF", netN: 0, netN1: 0, isTotal: true, children: ["AX", "BX", "BQ"] }, // Simplified
    ];

    // Populate values
    return lines.map(line => {
        if (line.isTotal) return line; // Totals calculated in a second pass or frontend

        const rule = ASSET_MAPPING.find(r => r.reportLineCode === line.code);
        if (rule) {
            return {
                ...line,
                netN: calculateReportLine(rule, balanceN),
                netN1: calculateReportLine(rule, balanceN1)
            };
        }
        return line;
    });
}

// ... Similar functions would exist for Passif and Resultat
