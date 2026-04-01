import prisma from './prisma';

export interface DiagnosticSection {
    title: string;
    score: number;
    status: "excellent" | "correct" | "critique";
    findings: string[];
    recommendations: string[];
    metrics?: { label: string; value: string; trend?: string }[];
    evolution?: { label: string; n: string; variation: string }[];
}

export class DiagnosticService {
    static async getDiagnosticForClient(clientId: string) {
        // 1. Fetch financial data (Historical balances)
        const financialData = await prisma.financialData.findMany({
            where: { clientId },
            orderBy: { year: 'asc' }
        });

        // 2. Fetch tax declarations for compliance
        const declarations = await prisma.taxDeclaration.findMany({
            where: { clientId }
        });

        // If no data is available in the DB, we return a structured empty state or sample
        if (financialData.length === 0) {
            return null;
        }

        const latest = financialData[financialData.length - 1];
        const previous = financialData.length > 1 ? financialData[financialData.length - 2] : null;

        // --- SECTION 1: STRUCTURE ---
        const autonomyRatio = latest.totalBilan > 0 ? (latest.equity / latest.totalBilan) : 0;
        const structureScore = autonomyRatio > 0.4 ? 85 : autonomyRatio > 0.2 ? 60 : 35;
        
        const structureSection: DiagnosticSection = {
            title: "Structure Financière & Solvabilité",
            score: structureScore,
            status: structureScore >= 75 ? "excellent" : structureScore >= 50 ? "correct" : "critique",
            findings: [
                `Fonds propres représentant ${Math.round(autonomyRatio * 100)}% du total bilan.`,
                latest.equity >= (previous?.equity || 0) ? "Structure de capital solide et en progression." : "Érosion légère des fonds propres détectée."
            ],
            recommendations: [
                structureScore < 60 ? "Procéder à une augmentation de capital." : "Maintenir la politique actuelle de mise en réserve.",
                "Optimiser la structure de la dette long terme."
            ],
            metrics: [
                { label: "Autonomie Financière", value: `${Math.round(autonomyRatio * 100)}%`, trend: latest.equity > (previous?.equity || 0) ? "+2%" : "-1%" }
            ]
        };

        // --- SECTION 2: PERFORMANCE ---
        const marginRatio = latest.ca > 0 ? (latest.netResult / latest.ca) : 0;
        const perfScore = marginRatio > 0.08 ? 80 : marginRatio > 0.04 ? 60 : 30;

        const performanceSection: DiagnosticSection = {
            title: "Performance Opérationnelle (SIG)",
            score: perfScore,
            status: perfScore >= 75 ? "excellent" : perfScore >= 50 ? "correct" : "critique",
            findings: [
                `Marge nette établie à ${Math.round(marginRatio * 1000) / 10}%.`,
                latest.ca > (previous?.ca || 0) ? `Croissance du CA de ${Math.round(((latest.ca - (previous?.ca || 0)) / (previous?.ca || 1)) * 100)}%.` : "Décroissance de l'activité."
            ],
            recommendations: [
                perfScore < 50 ? "Auditer les charges fixes (Personnel, Loyers)." : "Poursuivre le développement commercial.",
                "Améliorer le taux de marge brute par renégociation achats."
            ]
        };

        // --- SECTION 3: COMPLIANCE ---
        const lateDeclarations = declarations.filter(d => 
            d.status === 'PENDING' && new Date(d.dueDate) < new Date()
        ).length;
        const complianceScore = Math.max(20, 100 - (lateDeclarations * 20));

        const complianceSection: DiagnosticSection = {
            title: "Conformité Fiscale & Sociale",
            score: complianceScore,
            status: complianceScore >= 75 ? "excellent" : complianceScore >= 50 ? "correct" : "critique",
            findings: [
                lateDeclarations > 0 ? `${lateDeclarations} déclarations en retard détectées.` : "Aucun retard de déclaration majeur.",
                "Risque de redressement fiscal estimé comme modéré."
            ],
            recommendations: [
                lateDeclarations > 0 ? "Régulariser les déclarations PENDING immédiatement." : "Maintenir la veille fiscale active.",
                "Automatiser les rappels d'échéances."
            ]
        };

        // --- SECTION 4: TREASURY ---
        const treasuryScore = latest.netCash > (latest.ca * 0.05) ? 85 : latest.netCash > 0 ? 60 : 25;

        const treasurySection: DiagnosticSection = {
            title: "Trésorerie & BFR",
            score: treasuryScore,
            status: treasuryScore >= 75 ? "excellent" : treasuryScore >= 50 ? "correct" : "critique",
            findings: [
                `Trésorerie nette de ${latest.netCash.toLocaleString()} FCFA.`,
                `BFR représentant ${Math.round((latest.bfr / latest.ca) * 365)} jours de CA.`
            ],
            recommendations: [
                latest.bfr > (latest.ca * 0.2) ? "Mettre en place un affacturage." : "Gestion saine du besoin en fonds de roulement.",
                "Optimiser les placements court terme."
            ]
        };

        return {
            globalScore: Math.round((structureScore + perfScore + complianceScore + treasuryScore) / 4),
            sections: [structureSection, performanceSection, complianceSection, treasurySection],
            years: financialData.map(d => ({
                year: d.year.toString(),
                ca: d.ca,
                resultatNet: d.netResult,
                fondsPropresPct: Math.round((d.equity / d.totalBilan) * 100),
                bfr: Math.round((d.bfr / d.ca) * 365),
                tresorerie: d.netCash
            }))
        };
    }
}
