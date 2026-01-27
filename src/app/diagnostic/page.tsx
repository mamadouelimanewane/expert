"use client";

import { useState } from "react";
import {
    Stethoscope,
    FileText,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Lightbulb,
    ArrowRight,
    Download,
    Share,
    Zap,
    Activity,
    Brain,
    Target,
    Shield,
    DollarSign,
    Users,
    TrendingDown,
    Sparkles,
    FileSpreadsheet,
    Eye,
    BarChart3,
    LineChart,
    Calendar,
    Edit3,
    Save,
    RefreshCw,
    Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface YearData {
    year: string;
    ca: number;
    resultatNet: number;
    fondsPropresPct: number;
    bfr: number;
    tresorerie: number;
}

interface DiagnosticSection {
    title: string;
    score: number;
    status: "excellent" | "correct" | "critique";
    findings: string[];
    recommendations: string[];
    metrics?: { label: string; value: string; trend?: string }[];
    evolution?: { label: string; n1: string; n: string; n1Proj?: string; variation: string }[];
}

const MOCK_YEARS: YearData[] = [
    { year: "N-1 (2023)", ca: 450, resultatNet: 35, fondsPropresPct: 42, bfr: 38, tresorerie: 27 },
    { year: "N (2024)", ca: 520, resultatNet: 42, fondsPropresPct: 45, bfr: 45, tresorerie: 22 },
    { year: "N+1 (2025 Proj.)", ca: 595, resultatNet: 51, fondsPropresPct: 48, bfr: 42, tresorerie: 28 }
];

const MOCK_DIAGNOSTIC: DiagnosticSection[] = [
    {
        title: "Structure Financière & Solvabilité",
        score: 85,
        status: "excellent",
        findings: [
            "Fonds propres solides représentant 45% du total bilan.",
            "Capacité d'autofinancement en progression de 12%.",
            "Ratio d'endettement maîtrisé à 0.35 (Norme OHADA: < 0.5)."
        ],
        recommendations: [
            "Envisager un investissement de croissance via levier bancaire modéré.",
            "Optimiser la gestion des excédents de trésorerie (placement court terme)."
        ],
        metrics: [
            { label: "Ratio d'Autonomie Financière", value: "45%", trend: "+3%" },
            { label: "CAF / CA", value: "12.5%", trend: "+1.2%" }
        ],
        evolution: [
            { label: "Fonds Propres / Total Bilan", n1: "42%", n: "45%", n1Proj: "48%", variation: "+6 pts" },
            { label: "Ratio d'Endettement", n1: "0.42", n: "0.35", n1Proj: "0.30", variation: "-0.12" }
        ]
    },
    {
        title: "Performance Opérationnelle (SIG)",
        score: 62,
        status: "correct",
        findings: [
            "Marge commerciale stable à 35% (Norme secteur : 38%).",
            "Charges de personnel en augmentation de 15% sans hausse corrélée du CA.",
            "EBE en baisse de 8% sur l'exercice."
        ],
        recommendations: [
            "Mettre en place un audit de productivité RH.",
            "Renégocier les contrats de sous-traitance pour améliorer la marge.",
            "Analyser la structure de coûts fixes vs variables."
        ],
        metrics: [
            { label: "Marge Commerciale", value: "35%", trend: "stable" },
            { label: "EBE / CA", value: "18%", trend: "-8%" }
        ],
        evolution: [
            { label: "Chiffre d'Affaires (M FCFA)", n1: "450", n: "520", n1Proj: "595", variation: "+32%" },
            { label: "Résultat Net (M FCFA)", n1: "35", n: "42", n1Proj: "51", variation: "+46%" },
            { label: "Marge Nette", n1: "7.8%", n: "8.1%", n1Proj: "8.6%", variation: "+0.8 pts" }
        ]
    },
    {
        title: "Conformité Fiscale & Sociale",
        score: 45,
        status: "critique",
        findings: [
            "Incohérence détectée entre la TVA déclarée et le CA comptabilisé (Écart 5M FCFA).",
            "Retards récurrents de paiement des cotisations sociales (CNPS).",
            "Absence de justificatifs pour 12% des charges déductibles."
        ],
        recommendations: [
            "Procéder à un cadrage de TVA immédiat pour corriger les déclarations.",
            "Mettre en place un calendrier de paiement automatisé pour éviter les pénalités.",
            "Constituer un dossier de justification exhaustif avant contrôle fiscal."
        ],
        metrics: [
            { label: "Risque Fiscal Estimé", value: "8.5M FCFA", trend: "critique" },
            { label: "Taux de Conformité", value: "45%", trend: "-12%" }
        ],
        evolution: [
            { label: "Taux de Conformité", n1: "57%", n: "45%", variation: "-12 pts" },
            { label: "Pénalités & Amendes (M FCFA)", n1: "1.2", n: "3.5", variation: "+192%" }
        ]
    },
    {
        title: "Trésorerie & BFR",
        score: 72,
        status: "correct",
        findings: [
            "BFR en hausse de 25% (ralentissement des encaissements clients).",
            "Délai moyen de paiement clients: 75 jours (Norme: 60j).",
            "Trésorerie nette positive mais en baisse de 18%."
        ],
        recommendations: [
            "Mettre en place une politique de relance clients plus agressive.",
            "Négocier des délais fournisseurs plus longs.",
            "Envisager l'affacturage pour les créances > 60 jours."
        ],
        metrics: [
            { label: "BFR (jours CA)", value: "45j", trend: "+10j" },
            { label: "Trésorerie Nette", value: "22M FCFA", trend: "-18%" }
        ],
        evolution: [
            { label: "BFR (jours CA)", n1: "38j", n: "45j", n1Proj: "42j", variation: "+7j" },
            { label: "Trésorerie Nette (M FCFA)", n1: "27", n: "22", n1Proj: "28", variation: "-19%" },
            { label: "Délai Clients (jours)", n1: "68", n: "75", n1Proj: "65", variation: "+7j" }
        ]
    }
];

export default function DiagnosticPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [diagnosticVisible, setDiagnosticVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");
    const [expandedSection, setExpandedSection] = useState<number | null>(null);
    const [showEvolution, setShowEvolution] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [reportContent, setReportContent] = useState({
        executiveSummary: "",
        structureAnalysis: "",
        performanceAnalysis: "",
        complianceAnalysis: "",
        treasuryAnalysis: "",
        projections: "",
        conclusion: ""
    });

    const runDiagnostic = () => {
        setIsGenerating(true);
        setDiagnosticVisible(false);
        setTimeout(() => {
            setIsGenerating(false);
            setDiagnosticVisible(true);
        }, 3500);
    };

    const generateReport = () => {
        setIsGeneratingReport(true);

        // Simulate AI processing with progressive content generation
        setTimeout(() => {
            setReportContent({
                executiveSummary: `À l'issue de notre analyse approfondie des états financiers de ${selectedClient} portant sur les exercices N-1 (2023), N (2024) et les projections N+1 (2025), nous avons établi un score global de santé financière de ${globalScore}/100, reflétant une situation globalement ${globalScore >= 75 ? "excellente" : globalScore >= 50 ? "satisfaisante" : "préoccupante"}.\n\nL'entreprise présente une structure financière solide avec un ratio d'autonomie financière de 45%, en progression constante depuis N-1 (42%). Le chiffre d'affaires a connu une croissance soutenue de +32% sur la période, passant de 450M FCFA (N-1) à 520M FCFA (N), avec une projection à 595M FCFA pour N+1.\n\n⚠️ Point d'attention majeur : La conformité fiscale et sociale présente des lacunes critiques (score 45/100) nécessitant une intervention immédiate pour éviter des risques de redressement estimés à 8.5M FCFA.`,

                structureAnalysis: `La structure financière de l'entreprise est particulièrement robuste. Les fonds propres représentent 45% du total bilan, soit 3 points de plus qu'en N-1, témoignant d'une politique de renforcement des capitaux propres cohérente.\n\nLe ratio d'endettement s'établit à 0.35, bien en deçà de la norme OHADA de 0.5, offrant ainsi une marge de manœuvre significative pour financer des investissements de croissance par effet de levier.\n\nL'analyse de la capacité d'autofinancement révèle une progression de 12%, démontrant la capacité de l'entreprise à générer des ressources internes pour financer son développement.\n\n💡 Recommandation stratégique : Envisager un investissement stratégique de croissance (acquisition, expansion géographique) en mobilisant un financement bancaire modéré, tout en maintenant le ratio d'endettement sous 0.45. Cette stratégie permettrait d'optimiser le retour sur capitaux propres tout en préservant la solidité financière.`,

                performanceAnalysis: `La performance opérationnelle présente des signaux mitigés nécessitant une attention particulière. Si le chiffre d'affaires progresse de manière satisfaisante (+15.6% en N), la marge commerciale stagne à 35%, soit 3 points sous la norme sectorielle (38%).\n\nL'analyse approfondie des Soldes Intermédiaires de Gestion révèle une dérive préoccupante des charges de personnel (+15% sans corrélation avec la croissance du CA), impactant négativement l'EBE qui recule de 8% sur l'exercice. Cette situation suggère une perte d'efficience opérationnelle qu'il convient de corriger rapidement.\n\nLe taux de marge nette s'établit à 8.1%, en légère progression par rapport à N-1 (7.8%), mais cette amélioration reste insuffisante au regard du potentiel de l'entreprise.\n\n💡 Plan d'action opérationnel : (1) Mettre en place un audit de productivité RH pour identifier les sources d'inefficience et optimiser l'organisation du travail. (2) Renégocier les contrats de sous-traitance pour améliorer la marge de 3 points et atteindre la norme sectorielle. (3) Analyser la structure de coûts fixes vs variables pour identifier les leviers d'optimisation.`,

                complianceAnalysis: `⚠️ Cet axe présente des risques majeurs nécessitant une action immédiate et constitue le point de vigilance critique de notre diagnostic.\n\nNotre analyse a révélé une incohérence de 5M FCFA entre la TVA déclarée et le chiffre d'affaires comptabilisé, exposant l'entreprise à un risque de redressement fiscal significatif. Cette situation résulte d'une défaillance dans les processus de contrôle interne et de rapprochement fiscal.\n\nDe plus, les retards récurrents de paiement des cotisations sociales (CNPS) ont généré des pénalités de 3.5M FCFA en N, contre 1.2M en N-1 (+192%), traduisant une dégradation préoccupante de la discipline de paiement. L'absence de justificatifs pour 12% des charges déductibles constitue un facteur de risque supplémentaire en cas de contrôle fiscal.\n\nLe taux de conformité global s'établit à 45%, en recul de 12 points par rapport à N-1, plaçant l'entreprise dans une zone de risque élevé.\n\n🚨 ACTIONS URGENTES (Priorité 1 - 30 jours) :\n1. Cadrage fiscal immédiat avec un expert-comptable pour corriger les déclarations de TVA et régulariser la situation\n2. Mise en place d'un calendrier de paiement automatisé pour les cotisations sociales avec provisions mensuelles\n3. Constitution d'un dossier de justification exhaustif pour toutes les charges déductibles\n4. Renforcement des procédures de contrôle interne fiscal et social\n5. Formation du personnel comptable aux obligations fiscales et sociales`,

                treasuryAnalysis: `La gestion de trésorerie reste globalement maîtrisée avec une trésorerie nette positive de 22M FCFA, bien qu'en baisse de 18% par rapport à N-1 (27M FCFA). Cette diminution s'explique principalement par la dégradation du Besoin en Fonds de Roulement.\n\nLe BFR a augmenté de 25%, passant de 38 à 45 jours de CA, principalement en raison d'un ralentissement des encaissements clients. Le délai moyen de paiement clients s'établit à 75 jours contre une norme de 60 jours, immobilisant ainsi des ressources financières importantes.\n\nL'analyse du cycle d'exploitation révèle un déséquilibre entre les délais clients et fournisseurs, impactant négativement la trésorerie disponible. Le ratio de liquidité générale reste néanmoins satisfaisant à 1.4, assurant une couverture adéquate des engagements à court terme.\n\n💡 Stratégie d'optimisation de trésorerie :\n1. Mettre en place une politique de relance clients plus agressive (relance à J+45, pénalités de retard à 2% par mois)\n2. Négocier des délais fournisseurs plus longs (passage de 30 à 45 jours) pour compenser l'allongement du poste clients\n3. Envisager l'affacturage pour les créances supérieures à 60 jours, permettant d'améliorer la trésorerie de 15M FCFA\n4. Optimiser la gestion des stocks pour réduire le BFR de 3 jours de CA`,

                projections: `Sur la base des tendances observées et en intégrant les recommandations formulées, nos projections pour N+1 (2025) anticipent une trajectoire de croissance rentable, conditionnée à la mise en œuvre effective du plan d'action.\n\nScénario central (probabilité 70%) :\n• Chiffre d'affaires de 595M FCFA (+14.4%), porté par la dynamique commerciale actuelle et l'expansion sur de nouveaux segments\n• Résultat net de 51M FCFA (+21.4%), grâce à l'optimisation des charges de personnel et l'amélioration de la marge commerciale\n• Renforcement des fonds propres à 48%, consolidant la structure financière et ouvrant des opportunités d'investissement\n• Amélioration du BFR à 42 jours (-3j) suite aux actions de recouvrement et à l'optimisation du cycle d'exploitation\n• Trésorerie nette remontant à 28M FCFA (+27%), reflétant l'amélioration du cycle d'exploitation et la maîtrise des investissements\n\nScénario optimiste (probabilité 20%) : En cas de mise en œuvre accélérée des recommandations, le résultat net pourrait atteindre 55M FCFA (+31%).\n\nScénario pessimiste (probabilité 10%) : En l'absence de correction de la situation fiscale, un redressement de 8.5M FCFA impacterait le résultat net à 42.5M FCFA (+1% seulement).\n\n✅ Ces projections sont conditionnées à la mise en œuvre effective des recommandations, notamment la régularisation fiscale (impact critique) et l'optimisation de la masse salariale (impact majeur).`,

                conclusion: `${selectedClient} présente des fondamentaux solides avec une croissance soutenue (+32% sur 3 ans) et une structure financière robuste (ratio d'autonomie de 45%). L'entreprise dispose d'atouts majeurs pour poursuivre son développement et renforcer sa position concurrentielle.\n\nToutefois, la situation de conformité fiscale et sociale nécessite une intervention urgente pour éviter des risques de redressement significatifs (8.5M FCFA) qui pourraient compromettre la trajectoire de croissance. Cette problématique constitue le facteur de risque principal identifié lors de notre diagnostic.\n\nPLAN D'ACTION STRATÉGIQUE PRIORITAIRE (90 jours) :\n\nPhase 1 - Urgence (J+30) :\n1. Cadrage fiscal immédiat : Régularisation TVA et constitution dossier justificatifs (Responsable : DAF, Budget : 2M FCFA)\n2. Automatisation paiements sociaux : Mise en place calendrier CNPS avec provisions mensuelles (Responsable : Comptabilité)\n3. Audit de conformité exhaustif : Revue complète des obligations fiscales et sociales (Responsable : Expert externe)\n\nPhase 2 - Optimisation (J+60) :\n4. Audit productivité RH : Analyse des écarts masse salariale / CA et plan d'optimisation (Responsable : DRH)\n5. Renégociation commerciale : Contrats sous-traitance et conditions fournisseurs (Responsable : Direction Achats)\n\nPhase 3 - Consolidation (J+90) :\n6. Optimisation recouvrement : Politique de relance clients renforcée et mise en place affacturage (Responsable : DAF)\n7. Tableau de bord de pilotage : Mise en place d'indicateurs de suivi mensuel (Responsable : Contrôle de gestion)\n\nIMPACT ATTENDU :\nLa mise en œuvre rigoureuse de ce plan d'action permettra de porter le score global de santé financière à 82/100 d'ici N+1, positionnant l'entreprise dans une trajectoire de croissance pérenne et sécurisée. Le retour sur investissement de ces actions est estimé à 15M FCFA sur l'exercice N+1.\n\nRECOMMANDATION FINALE :\nNous recommandons un suivi trimestriel de la mise en œuvre de ce plan d'action, avec des points d'étape formalisés auprès de la Direction Générale. Un audit de conformité annuel devra être institutionnalisé pour prévenir toute dérive future.`
            });

            setIsGeneratingReport(false);
            setShowReport(true);
        }, 3000);
    };

    const regenerateSection = (section: keyof typeof reportContent) => {
        // Simulate AI regeneration with enhanced content
        const enhancedContent = reportContent[section] + "\n\n[Contenu régénéré avec algorithme avancé GPT-4]";
        setReportContent(prev => ({ ...prev, [section]: enhancedContent }));
    };

    const globalScore = Math.round(MOCK_DIAGNOSTIC.reduce((acc, s) => acc + s.score, 0) / MOCK_DIAGNOSTIC.length);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Stethoscope className="w-8 h-8 text-rose-400" />
                        Diagnostic IA États Financiers
                    </h2>
                    <p className="text-slate-400 mt-1">Analyse médicale complète avec évolution pluriannuelle N-1, N, N+1.</p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:ring-1 focus:ring-rose-500 outline-none cursor-pointer"
                    >
                        <option>Société Ivoirienne de Banque</option>
                        <option>Traoré Import-Export</option>
                        <option>SOGECOM SA</option>
                    </select>
                    <button
                        onClick={runDiagnostic}
                        disabled={isGenerating}
                        className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow-lg shadow-rose-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        {isGenerating ? "Analyse..." : "Lancer Diagnostic"}
                    </button>
                </div>
            </div>

            {!diagnosticVisible && !isGenerating && (
                <div className="h-96 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-3xl p-12 bg-gradient-to-br from-slate-900/50 to-rose-900/5">
                    <div className="relative mb-6">
                        <Stethoscope className="w-20 h-20 text-slate-700 opacity-20" />
                        <Brain className="w-10 h-10 text-rose-500 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Prêt pour le Check-up Financier ?</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        L'IA va scanner l'intégralité du grand livre, de la balance et des journaux pour générer un rapport de diagnostic complet avec scoring prédictif et analyse pluriannuelle.
                    </p>
                </div>
            )}

            {isGenerating && (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-rose-500 animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Génération du rapport en cours...</h3>
                        <p className="text-slate-500 text-sm mt-2 italic">Analyse des flux, calcul des ratios OHADA et détection des zones de risques.</p>
                        <div className="mt-4 space-y-2 text-xs text-slate-600 font-mono">
                            <p className="animate-pulse">→ Scan du Grand Livre (2,450 écritures)...</p>
                            <p className="animate-pulse delay-100">→ Calcul des SIG et ratios de structure...</p>
                            <p className="animate-pulse delay-200">→ Analyse croisée N-1, N, N+1...</p>
                            <p className="animate-pulse delay-300">→ Détection d'anomalies par ML...</p>
                        </div>
                    </div>
                </div>
            )}

            {diagnosticVisible && (
                <div className="space-y-6 pb-12">
                    {/* Global Score Dashboard */}
                    <div className="glass-card rounded-2xl p-8 border border-slate-700/50 bg-gradient-to-br from-slate-900 to-indigo-900/10">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Score Global de Santé</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-white">{globalScore}</span>
                                    <span className="text-2xl text-slate-500">/100</span>
                                </div>
                            </div>
                            <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center border-4",
                                globalScore >= 75 ? "border-emerald-500 bg-emerald-500/10" :
                                    globalScore >= 50 ? "border-amber-500 bg-amber-500/10" :
                                        "border-rose-500 bg-rose-500/10"
                            )}>
                                <Activity className={cn(
                                    "w-12 h-12",
                                    globalScore >= 75 ? "text-emerald-500" :
                                        globalScore >= 50 ? "text-amber-500" :
                                            "text-rose-500"
                                )} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <QuickMetric icon={Shield} label="Solvabilité" value="85%" status="excellent" />
                            <QuickMetric icon={TrendingUp} label="Performance" value="62%" status="correct" />
                            <QuickMetric icon={AlertTriangle} label="Conformité" value="45%" status="critique" />
                            <QuickMetric icon={DollarSign} label="Trésorerie" value="72%" status="correct" />
                        </div>
                    </div>

                    {/* Evolution Pluriannuelle */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div
                            className="p-5 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                            onClick={() => setShowEvolution(!showEvolution)}
                        >
                            <h3 className="font-bold text-white flex items-center gap-3">
                                <LineChart className="w-5 h-5 text-indigo-400" />
                                Évolution Pluriannuelle (N-1, N, N+1)
                            </h3>
                            <Eye className={cn("w-5 h-5 text-slate-500 transition-transform", showEvolution ? "rotate-180" : "")} />
                        </div>

                        {showEvolution && (
                            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="grid grid-cols-3 gap-4">
                                    {MOCK_YEARS.map((year, i) => (
                                        <div key={i} className={cn(
                                            "p-4 rounded-xl border",
                                            i === 1 ? "bg-indigo-500/10 border-indigo-500/30" : "bg-slate-800/30 border-slate-700/30"
                                        )}>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                <span className="text-xs font-bold text-slate-400 uppercase">{year.year}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <MetricRow label="CA (M FCFA)" value={year.ca.toString()} />
                                                <MetricRow label="Résultat Net (M)" value={year.resultatNet.toString()} />
                                                <MetricRow label="Fonds Propres" value={`${year.fondsPropresPct}%`} />
                                                <MetricRow label="BFR (jours)" value={year.bfr.toString()} />
                                                <MetricRow label="Trésorerie (M)" value={year.tresorerie.toString()} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Visual Trend */}
                                <div className="p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                    <h4 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" /> Tendance CA & Résultat Net
                                    </h4>
                                    <div className="flex items-end justify-between gap-4 h-32">
                                        {MOCK_YEARS.map((year, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                <div className="w-full flex flex-col gap-1">
                                                    <div
                                                        className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-400"
                                                        style={{ height: `${(year.ca / 600) * 100}px` }}
                                                    />
                                                    <div
                                                        className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                                                        style={{ height: `${(year.resultatNet / 60) * 100}px` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold">{year.year.split(' ')[0]}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-indigo-500 rounded" />
                                            <span className="text-slate-400">CA</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-emerald-500 rounded" />
                                            <span className="text-slate-400">Résultat Net</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-4">
                        {MOCK_DIAGNOSTIC.map((section, idx) => (
                            <div key={idx} className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden group">
                                <div
                                    className="p-5 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 transition-colors"
                                    onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                                >
                                    <h3 className="font-bold text-white flex items-center gap-3">
                                        <div className={cn(
                                            "w-2 h-6 rounded-full shadow-lg",
                                            section.status === "excellent" ? "bg-emerald-500 shadow-emerald-500/50" :
                                                section.status === "correct" ? "bg-amber-500 shadow-amber-500/50" :
                                                    "bg-rose-500 shadow-rose-500/50"
                                        )} />
                                        {section.title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-400">Score: <span className={cn(
                                            section.status === "excellent" ? "text-emerald-400" :
                                                section.status === "correct" ? "text-amber-400" : "text-rose-400"
                                        )}>{section.score}%</span></span>
                                        <Eye className={cn("w-5 h-5 text-slate-500 transition-transform", expandedSection === idx ? "rotate-180" : "")} />
                                    </div>
                                </div>

                                {expandedSection === idx && (
                                    <div className="p-6 space-y-6 animate-in slide-in-from-top-2 fade-in duration-300">
                                        {/* Evolution Table */}
                                        {section.evolution && (
                                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 overflow-hidden">
                                                <div className="p-3 bg-slate-900/50 border-b border-slate-700/30">
                                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                        <TrendingUp className="w-3 h-3" /> Évolution Comparative
                                                    </h4>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-slate-700/30">
                                                                <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Indicateur</th>
                                                                <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">N-1</th>
                                                                <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">N</th>
                                                                {section.evolution.some(e => e.n1Proj) && (
                                                                    <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">N+1 (Proj.)</th>
                                                                )}
                                                                <th className="text-right p-3 text-xs font-bold text-slate-500 uppercase">Variation</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {section.evolution.map((evo, i) => (
                                                                <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                                                                    <td className="p-3 text-slate-300 font-medium">{evo.label}</td>
                                                                    <td className="p-3 text-right text-slate-400 font-mono">{evo.n1}</td>
                                                                    <td className="p-3 text-right text-white font-mono font-bold">{evo.n}</td>
                                                                    {evo.n1Proj && (
                                                                        <td className="p-3 text-right text-indigo-400 font-mono">{evo.n1Proj}</td>
                                                                    )}
                                                                    <td className={cn(
                                                                        "p-3 text-right font-bold font-mono",
                                                                        evo.variation.includes("+") && !evo.variation.includes("Pénalités") ? "text-emerald-400" :
                                                                            evo.variation.includes("-") || evo.variation.includes("critique") ? "text-rose-400" :
                                                                                "text-slate-400"
                                                                    )}>{evo.variation}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Metrics */}
                                        {section.metrics && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {section.metrics.map((m, i) => (
                                                    <div key={i} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{m.label}</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-white">{m.value}</span>
                                                            {m.trend && (
                                                                <span className={cn(
                                                                    "text-xs font-bold",
                                                                    m.trend.includes("+") ? "text-emerald-400" :
                                                                        m.trend === "stable" ? "text-slate-400" :
                                                                            m.trend === "critique" ? "text-rose-400" :
                                                                                "text-rose-400"
                                                                )}>{m.trend}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Findings */}
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <FileText className="w-3 h-3" /> Constats Clés
                                                </h4>
                                                <ul className="space-y-3">
                                                    {section.findings.map((f, i) => (
                                                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                                                            <ArrowRight className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Recommendations */}
                                            <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Lightbulb className="w-3 h-3 fill-current" /> Recommandations IA
                                                </h4>
                                                <ul className="space-y-3">
                                                    {section.recommendations.map((r, i) => (
                                                        <li key={i} className="text-sm text-slate-300 flex gap-2 font-medium">
                                                            <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                            {r}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions Footer */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={generateReport}
                            disabled={isGeneratingReport}
                            className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingReport ? (
                                <RefreshCw className="w-8 h-8 text-indigo-400 mb-3 animate-spin" />
                            ) : (
                                <Wand2 className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                            )}
                            <h4 className="font-bold text-white mb-1">
                                {isGeneratingReport ? "Génération IA..." : "Générer Rapport Premium IA"}
                            </h4>
                            <p className="text-xs text-slate-500">Rapport narratif de haute qualité (éditable)</p>
                        </button>
                        <button className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all group text-left">
                            <Share className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-white mb-1">Envoyer sur Portail Client</h4>
                            <p className="text-xs text-slate-500">Accès sécurisé en ligne</p>
                        </button>
                        <button className="p-6 glass-card rounded-2xl border border-slate-700/50 hover:border-rose-500/50 transition-all group text-left">
                            <FileSpreadsheet className="w-8 h-8 text-rose-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-white mb-1">Exporter Données Brutes</h4>
                            <p className="text-xs text-slate-500">Excel avec tous les calculs</p>
                        </button>
                    </div>
                </div>
            )}

            {/* PREMIUM AI REPORT MODAL - EDITABLE */}
            {showReport && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl flex overflow-hidden">
                        {/* Sidebar - Table of Contents */}
                        <div className="w-64 bg-slate-900 p-6 flex flex-col border-r border-slate-700">
                            <div className="mb-6">
                                <h3 className="text-white font-bold text-sm mb-2">TABLE DES MATIÈRES</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className={cn(
                                            "flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
                                            editMode ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        )}
                                    >
                                        {editMode ? <><Save className="w-3 h-3" /> Mode Édition</> : <><Edit3 className="w-3 h-3" /> Lecture</>}
                                    </button>
                                </div>
                            </div>

                            <nav className="space-y-2 flex-1 overflow-y-auto">
                                <TOCItem number="I" title="Synthèse Exécutive" />
                                <TOCItem number="II" title="Analyse Détaillée" />
                                <TOCItem number="II.A" title="Structure Financière" indent />
                                <TOCItem number="II.B" title="Performance" indent />
                                <TOCItem number="II.C" title="Conformité" indent />
                                <TOCItem number="II.D" title="Trésorerie" indent />
                                <TOCItem number="III" title="Projections N+1" />
                                <TOCItem number="IV" title="Conclusion" />
                            </nav>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <p className="text-xs text-slate-500 mb-2">Généré par</p>
                                <p className="text-white font-bold text-sm">Cabinet 360 AI v4.2</p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col">
                            {/* Header */}
                            <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">RAPPORT DE DIAGNOSTIC FINANCIER</h2>
                                    <p className="text-sm text-indigo-200 mt-1">Généré automatiquement par Cabinet 360 AI Engine - {new Date().toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button
                                    onClick={() => setShowReport(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Report Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-12 bg-white text-slate-900">
                                <div className="max-w-4xl mx-auto space-y-10">
                                    {/* Metadata */}
                                    <div className="flex justify-between items-start pb-6 border-b-2 border-slate-200">
                                        <div>
                                            <p className="text-sm text-slate-600 uppercase tracking-widest font-bold mb-1">Client</p>
                                            <p className="text-xl font-bold">{selectedClient}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-600 uppercase tracking-widest font-bold mb-1">Période</p>
                                            <p className="text-xl font-bold">2023-2025</p>
                                        </div>
                                    </div>

                                    {/* I. Executive Summary */}
                                    <EditableSection
                                        title="I. SYNTHÈSE EXÉCUTIVE"
                                        content={reportContent.executiveSummary}
                                        sectionKey="executiveSummary"
                                        editMode={editMode}
                                        onChange={(value) => setReportContent(prev => ({ ...prev, executiveSummary: value }))}
                                        onRegenerate={() => regenerateSection("executiveSummary")}
                                    />

                                    {/* II. Detailed Analysis */}
                                    <section>
                                        <h3 className="text-2xl font-black text-slate-900 mb-6 pb-3 border-b-2 border-slate-300">
                                            II. ANALYSE DÉTAILLÉE PAR AXE
                                        </h3>

                                        <EditableSection
                                            title="A. Structure Financière & Solvabilité (85/100)"
                                            content={reportContent.structureAnalysis}
                                            sectionKey="structureAnalysis"
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, structureAnalysis: value }))}
                                            onRegenerate={() => regenerateSection("structureAnalysis")}
                                            statusColor="emerald"
                                        />

                                        <EditableSection
                                            title="B. Performance Opérationnelle (62/100)"
                                            content={reportContent.performanceAnalysis}
                                            sectionKey="performanceAnalysis"
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, performanceAnalysis: value }))}
                                            onRegenerate={() => regenerateSection("performanceAnalysis")}
                                            statusColor="amber"
                                        />

                                        <EditableSection
                                            title="C. Conformité Fiscale & Sociale (45/100) - CRITIQUE"
                                            content={reportContent.complianceAnalysis}
                                            sectionKey="complianceAnalysis"
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, complianceAnalysis: value }))}
                                            onRegenerate={() => regenerateSection("complianceAnalysis")}
                                            statusColor="rose"
                                        />

                                        <EditableSection
                                            title="D. Trésorerie & BFR (72/100)"
                                            content={reportContent.treasuryAnalysis}
                                            sectionKey="treasuryAnalysis"
                                            editMode={editMode}
                                            onChange={(value) => setReportContent(prev => ({ ...prev, treasuryAnalysis: value }))}
                                            onRegenerate={() => regenerateSection("treasuryAnalysis")}
                                            statusColor="amber"
                                        />
                                    </section>

                                    {/* III. Projections */}
                                    <EditableSection
                                        title="III. PROJECTIONS N+1 ET SCÉNARIOS"
                                        content={reportContent.projections}
                                        sectionKey="projections"
                                        editMode={editMode}
                                        onChange={(value) => setReportContent(prev => ({ ...prev, projections: value }))}
                                        onRegenerate={() => regenerateSection("projections")}
                                    />

                                    {/* IV. Conclusion */}
                                    <EditableSection
                                        title="IV. CONCLUSION ET PLAN D'ACTION STRATÉGIQUE"
                                        content={reportContent.conclusion}
                                        sectionKey="conclusion"
                                        editMode={editMode}
                                        onChange={(value) => setReportContent(prev => ({ ...prev, conclusion: value }))}
                                        onRegenerate={() => regenerateSection("conclusion")}
                                    />

                                    {/* Signature */}
                                    <div className="mt-12 pt-8 border-t-2 border-slate-200 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mb-1">Généré par</p>
                                            <p className="text-lg font-bold">Cabinet 360 AI Engine v4.2</p>
                                            <p className="text-sm text-slate-500 italic">Expert-Comptable & Commissaire aux Comptes</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mb-1">Signature Électronique</p>
                                            <div className="w-40 h-20 border-2 border-dashed border-slate-300 rounded flex items-center justify-center">
                                                <Shield className="w-10 h-10 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                                <p className="text-xs text-slate-600 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                    Rapport généré avec algorithmes IA avancés (GPT-4 Turbo)
                                </p>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                                        Imprimer
                                    </button>
                                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Télécharger PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function QuickMetric({ icon: Icon, label, value, status }: any) {
    return (
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={cn(
                    "w-4 h-4",
                    status === "excellent" ? "text-emerald-500" :
                        status === "correct" ? "text-amber-500" :
                            "text-rose-500"
                )} />
                <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn(
                "text-2xl font-bold",
                status === "excellent" ? "text-emerald-400" :
                    status === "correct" ? "text-amber-400" :
                        "text-rose-400"
            )}>{value}</p>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">{label}</span>
            <span className="text-white font-bold font-mono">{value}</span>
        </div>
    );
}

function TOCItem({ number, title, indent = false }: { number: string; title: string; indent?: boolean }) {
    return (
        <a
            href={`#${number}`}
            className={cn(
                "block px-3 py-2 rounded-lg text-xs hover:bg-slate-800 transition-colors",
                indent ? "pl-6 text-slate-400" : "text-slate-300 font-bold"
            )}
        >
            <span className="text-indigo-400 mr-2">{number}</span>
            {title}
        </a>
    );
}

function EditableSection({ title, content, sectionKey, editMode, onChange, onRegenerate, statusColor }: {
    title: string;
    content: string;
    sectionKey: string;
    editMode: boolean;
    onChange: (value: string) => void;
    onRegenerate: () => void;
    statusColor?: "emerald" | "amber" | "rose";
}) {
    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h4 className={cn(
                    "text-lg font-bold flex items-center gap-2",
                    statusColor === "emerald" ? "text-emerald-700" :
                        statusColor === "amber" ? "text-amber-700" :
                            statusColor === "rose" ? "text-rose-700" :
                                "text-slate-900"
                )}>
                    {statusColor && (
                        <div className={cn(
                            "w-2 h-6 rounded",
                            statusColor === "emerald" ? "bg-emerald-500" :
                                statusColor === "amber" ? "bg-amber-500" :
                                    "bg-rose-500"
                        )} />
                    )}
                    {title}
                </h4>
                {editMode && (
                    <button
                        onClick={onRegenerate}
                        className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Régénérer
                    </button>
                )}
            </div>
            {editMode ? (
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[200px] p-4 border-2 border-indigo-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/50"
                />
            ) : (
                <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700">
                    {content}
                </div>
            )}
        </section>
    );
}
