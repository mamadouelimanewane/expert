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
        const variationFondsPropres =
            previous && previous.equity > 0
                ? `${latest.equity >= previous.equity ? "+" : ""}${Math.round(((latest.equity - previous.equity) / previous.equity) * 100)}%`
                : null;
        const structureScore = autonomyRatio > 0.4 ? 85 : autonomyRatio > 0.2 ? 60 : 35;
        
        const structureSection: DiagnosticSection = {
            title: "Structure Financière & Solvabilité",
            score: structureScore,
            status: structureScore >= 75 ? "excellent" : structureScore >= 50 ? "correct" : "critique",
            findings: [
                latest.totalBilan > 0
                    ? `Fonds propres représentant ${Math.round(autonomyRatio * 100)}% du total bilan.`
                    : "Total bilan non renseigné : l'autonomie financière n'a pas pu être calculée.",
                previous === null
                    ? "Aucun exercice antérieur enregistré : l'évolution des fonds propres n'a pas pu être appréciée."
                    : latest.equity >= previous.equity
                        ? "Structure de capital solide et en progression."
                        : "Érosion des fonds propres constatée par rapport à l'exercice précédent."
            ],
            recommendations: [
                structureScore < 60 ? "Procéder à une augmentation de capital." : "Maintenir la politique actuelle de mise en réserve.",
                "Optimiser la structure de la dette long terme."
            ],
            metrics: [
                {
                    label: "Autonomie Financière",
                    value: latest.totalBilan > 0 ? `${Math.round(autonomyRatio * 100)}%` : "Indéterminée",
                    // La tendance affichait "+2%" ou "-1%" selon un simple booléen
                    // (fonds propres en hausse ou non) : un pourcentage inventé,
                    // présenté comme une métrique. Elle n'est renseignée que si
                    // l'exercice précédent existe et porte des fonds propres non nuls.
                    trend: variationFondsPropres ?? undefined,
                }
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
                latest.ca > 0
                    ? `Marge nette établie à ${Math.round(marginRatio * 1000) / 10}%.`
                    : "Chiffre d'affaires non renseigné : la marge nette n'a pas pu être calculée.",
                // La croissance divisait par `previous?.ca || 1` : sans exercice
                // antérieur, un CA de 50 000 000 FCFA s'affichait en croissance
                // de 5 000 000 000 %.
                previous === null || previous.ca <= 0
                    ? "Aucun exercice antérieur exploitable : l'évolution du chiffre d'affaires n'a pas pu être calculée."
                    : latest.ca > previous.ca
                        ? `Croissance du CA de ${Math.round(((latest.ca - previous.ca) / previous.ca) * 100)}%.`
                        : `Repli du CA de ${Math.abs(Math.round(((latest.ca - previous.ca) / previous.ca) * 100))}%.`
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
                // « Risque de redressement fiscal estimé comme modéré. » figurait
                // ici en dur, renvoyé quel que soit le dossier : aucune analyse
                // ne le produisait.
                lateDeclarations > 0 ? `${lateDeclarations} déclarations en retard détectées.` : "Aucun retard de déclaration majeur."
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
                // Sans garde, un CA à 0 (valeur par défaut du modèle) produisait
                // littéralement « BFR représentant NaN jours de CA. »
                latest.ca > 0
                    ? `BFR représentant ${Math.round((latest.bfr / latest.ca) * 365)} jours de CA.`
                    : "Chiffre d'affaires non renseigné : le BFR n'a pas pu être exprimé en jours de CA."
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
                fondsPropresPct: d.totalBilan > 0 ? Math.round((d.equity / d.totalBilan) * 100) : null,
                bfr: d.ca > 0 ? Math.round((d.bfr / d.ca) * 365) : null,
                tresorerie: d.netCash
            }))
        };
    }
}
