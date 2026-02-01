export type CompteBalance = {
    numero: string;
    intitule: string;
    debit: number;
    credit: number;
    solde: number; // calculated: debit - credit
};

export type ReportLineCode = string; // e.g., "AD", "AE", "AFF" (Ref SYSCOHADA)

export type ReportLine = {
    code: ReportLineCode;
    label: string;
    noteRef?: string;
    netN: number;  // Net Year N
    netN1: number; // Net Year N-1
    brut?: number; // Gross N (Asset only)
    amortDep?: number; // Depreciation N (Asset only)
    isTotal?: boolean; // If true, result of other lines
    children?: ReportLineCode[]; // For totals, which lines to sum
};

export type FinancialStatement = {
    assets: ReportLine[]; // Bilan Actif
    liabilities: ReportLine[]; // Bilan Passif
    incomeStatement: ReportLine[]; // Compte de Résultat
};

export type MappingRule = {
    reportLineCode: ReportLineCode;
    accountPatterns: string[]; // e.g. ["21", "23"] startsWith logic
    subtractPatterns?: string[]; // e.g. ["281", "291"] for depreciation
    sign?: 1 | -1; // Multiplier
};
