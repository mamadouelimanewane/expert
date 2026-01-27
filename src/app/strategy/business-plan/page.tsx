"use client";

import { useState } from "react";
import {
    TrendingUp,
    Target,
    Users,
    DollarSign,
    BarChart3,
    PieChart,
    Rocket,
    Globe,
    Zap,
    Download,
    Eye,
    ChevronRight,
    Edit3,
    Plus,
    Minus,
    Calculator,
    Shield,
    Lightbulb,
    Presentation,
    RefreshCw,
    Sparkles,
    Building2,
    Briefcase,
    LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "plan" | "finance" | "valuation" | "deck";

export default function BusinessPlanPage() {
    const [activeTab, setActiveTab] = useState<TabType>("plan");
    const [isGenerating, setIsGenerating] = useState(false);
    const [projectName, setProjectName] = useState("Africa Marketplace Neo");
    const [isEditMode, setIsEditMode] = useState(false);

    // Projections State
    const [projections, setProjections] = useState({
        revenueYear1: 150,
        growthRate: 45,
        ebitdaMargin: 15,
        cac: 12000,
        churn: 5
    });

    // Valuation Logic
    const calculateValuation = () => {
        // Simple mock calculation for DCF & Multiples
        const multiple = 8.5; // SaaS multiple
        const revYear5 = projections.revenueYear1 * Math.pow(1 + projections.growthRate / 100, 4);
        const exitValue = revYear5 * multiple;
        const postMoney = exitValue / Math.pow(1.2, 5); // 20% discount rate
        return {
            preMoney: Math.round(postMoney * 0.8),
            postMoney: Math.round(postMoney),
            exitValue: Math.round(exitValue)
        };
    };

    const valuation = calculateValuation();

    const generateAIPlan = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                            {projectName}
                            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 uppercase">Premium AI Plan</div>
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-slate-400 text-sm">Startup Valuation & Strategic Business Plan Lab</p>
                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                            <p className="text-indigo-400 text-sm font-medium">Secteur: Digital FinTech / OHADA Zone</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all">
                        <Eye className="w-4 h-4" />
                        Aperçu Client
                    </button>
                    <button
                        onClick={generateAIPlan}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isGenerating ? "Génération IA..." : "Optimiser via IA v4.5"}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 w-fit">
                <TabButton
                    active={activeTab === "plan"}
                    onClick={() => setActiveTab("plan")}
                    icon={Building2}
                    label="Plan Stratégique"
                />
                <TabButton
                    active={activeTab === "finance"}
                    onClick={() => setActiveTab("finance")}
                    icon={LineChart}
                    label="Modèle Financier"
                />
                <TabButton
                    active={activeTab === "valuation"}
                    onClick={() => setActiveTab("valuation")}
                    icon={Calculator}
                    label="Laboratoire de Valorisation"
                />
                <TabButton
                    active={activeTab === "deck"}
                    onClick={() => setActiveTab("deck")}
                    icon={Presentation}
                    label="Pitch Deck Preview"
                />
            </div>

            {/* Content Area */}
            <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "plan" && <PlanSection isEditMode={isEditMode} setIsEditMode={setIsEditMode} />}
                {activeTab === "finance" && <FinanceSection projections={projections} setProjections={setProjections} />}
                {activeTab === "valuation" && <ValuationSection valuation={valuation} />}
                {activeTab === "deck" && <DeckSection projectName={projectName} />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all",
                active
                    ? "bg-slate-800 text-white shadow-inner"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
            )}
        >
            <Icon className={cn("w-4 h-4", active ? "text-indigo-400" : "text-slate-600")} />
            {label}
        </button>
    );
}

// --- SUB-COMPONENTS ---

function PlanSection({ isEditMode, setIsEditMode }: any) {
    const sections = [
        {
            title: "Vision & Proposition de Valeur",
            icon: Lightbulb,
            color: "text-amber-400 bg-amber-500/10",
            content: "Révolutionner l'accès au financement pour les PMEs de la zone OHADA via un marketplace intelligent de facturation et de crédit inter-entreprises. Notre solution réduit les délais de paiement de 65% en moyenne."
        },
        {
            title: "Analyse du Marché (TAM/SAM/SOM)",
            icon: Globe,
            color: "text-cyan-400 bg-cyan-500/10",
            content: "Marché total adressable : 45M de PMEs en Afrique de l'Ouest. Marché cible initial : Côte d'Ivoire, Sénégal, Cameroun. Une opportunité de 12.5 Mds $ de flux financiers non bancarisés."
        },
        {
            title: "Stratégie Go-to-Market",
            icon: Target,
            color: "text-rose-400 bg-rose-500/10",
            content: "Partenariats stratégiques avec les banques locales (API integration) et acquisition directe via marketing digital ciblé (SaaS B2B model). Objectif : 5,000 entreprises actives en Year 3."
        },
        {
            title: "Modèle Économique",
            icon: DollarSign,
            color: "text-emerald-400 bg-emerald-500/10",
            content: "Modèle transactionnel (0.5% à 1.5% par facture échangée) combiné à un abonnement premium SaaS pour les outils de gestion de trésorerie analytique."
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-indigo-400" />
                        Structure Stratégique
                    </h3>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                            isEditMode ? "bg-amber-500 border-amber-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400"
                        )}
                    >
                        {isEditMode ? "Sauvegarder" : "Mode Édition"}
                    </button>
                </div>

                {sections.map((s, idx) => (
                    <div key={idx} className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden group">
                        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", s.color)}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-white">{s.title}</h4>
                        </div>
                        <div className="p-6">
                            {isEditMode ? (
                                <textarea
                                    className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                                    defaultValue={s.content}
                                />
                            ) : (
                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                    "{s.content}"
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-8 h-full">
                    <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-indigo-400" />
                        Part de Marché Prévisionnelle
                    </h3>
                    <div className="relative h-[300px] flex items-center justify-center">
                        {/* Simulation d'un chart circulaire premium */}
                        <div className="w-48 h-48 rounded-full border-[16px] border-slate-800 relative flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[16px] border-indigo-500 border-t-transparent border-l-transparent rotate-[45deg]" />
                            <div className="text-center">
                                <p className="text-4xl font-bold text-white">12%</p>
                                <p className="text-xs text-slate-500 uppercase font-bold">SOM Target</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <MarketStat label="TAM" value="45.0M" sub="PMEs OHADA" color="bg-slate-700" />
                        <MarketStat label="SAM" value="12.5M" sub="Digital Ready" color="bg-indigo-900" />
                        <MarketStat label="SOM" value="1.5M" sub="Phase 1 (3 ans)" color="bg-indigo-600" />
                        <MarketStat label="LTV" value="4,500$" sub="Life Time Val" color="bg-rose-600" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MarketStat({ label, value, sub, color }: any) {
    return (
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
                <div className={cn("w-2 h-2 rounded-full", color)} />
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] text-slate-500">{sub}</p>
        </div>
    );
}

function FinanceSection({ projections, setProjections }: any) {
    const years = [1, 2, 3, 4, 5];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6 bg-slate-900/40">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-indigo-400" />
                        Paramètres du Modèle
                    </h4>
                    <div className="space-y-6">
                        <InputRange
                            label="Revenu Initiale (k$)"
                            value={projections.revenueYear1}
                            min={50} max={1000} step={10}
                            onChange={(v: number) => setProjections({ ...projections, revenueYear1: v })}
                        />
                        <InputRange
                            label="Taux de Croissance Annuel (%)"
                            value={projections.growthRate}
                            min={10} max={300} step={5}
                            onChange={(v: number) => setProjections({ ...projections, growthRate: v })}
                        />
                        <InputRange
                            label="Marge EBITDA (%)"
                            value={projections.ebitdaMargin}
                            min={-50} max={60} step={5}
                            onChange={(v: number) => setProjections({ ...projections, ebitdaMargin: v })}
                        />
                        <InputRange
                            label="Coût d'Acquisition Client ($)"
                            value={projections.cac}
                            min={500} max={50000} step={500}
                            onChange={(v: number) => setProjections({ ...projections, cac: v })}
                        />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6 h-full">
                    <h4 className="font-bold text-white mb-6">Projections Financières (5 ans)</h4>
                    <div className="h-[300px] flex items-end justify-between gap-4 px-4 border-b border-slate-700/50 pb-4">
                        {years.map(y => {
                            const rev = projections.revenueYear1 * Math.pow(1 + projections.growthRate / 100, y - 1);
                            const height = (rev / 2000) * 100; // Normalization for 2M$ max in display
                            return (
                                <div key={y} className="flex-1 flex flex-col items-center gap-2 group relative">
                                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-indigo-600 text-[10px] font-bold text-white px-2 py-1 rounded">
                                        {Math.round(rev).toLocaleString()} k$
                                    </div>
                                    <div
                                        className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t-lg transition-all duration-500 hover:scale-x-105"
                                        style={{ height: `${Math.min(height, 100)}%` }}
                                    />
                                    <span className="text-[10px] font-bold text-slate-500">YEAR {y}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] text-slate-500 uppercase tracking-wider">
                                    <th className="pb-4 font-bold">Indicateur (k$)</th>
                                    {years.map(y => <th key={y} className="pb-4 text-center">Y{y}</th>)}
                                </tr>
                            </thead>
                            <tbody className="text-sm font-mono text-slate-300">
                                <ProjectionRow label="Revenu" startValue={projections.revenueYear1} growth={projections.growthRate} />
                                <ProjectionRow label="EBITDA" startValue={projections.revenueYear1 * (projections.ebitdaMargin / 100)} growth={projections.growthRate} />
                                <ProjectionRow label="Fonds de Roulement" startValue={projections.revenueYear1 * 0.15} growth={projections.growthRate} />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectionRow({ label, startValue, growth }: any) {
    return (
        <tr className="border-t border-slate-800/50">
            <td className="py-3 text-slate-400 font-sans">{label}</td>
            {[0, 1, 2, 3, 4].map(i => (
                <td key={i} className="py-3 text-center text-white">
                    {Math.round(startValue * Math.pow(1 + growth / 100, i)).toLocaleString()}
                </td>
            ))}
        </tr>
    );
}

function InputRange({ label, value, min, max, step, onChange }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm text-slate-400">{label}</label>
                <span className="text-sm font-bold text-indigo-400">{value.toLocaleString()}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
        </div>
    );
}

function ValuationSection({ valuation }: any) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="glass-card rounded-3xl border border-slate-700/50 p-10 bg-gradient-to-br from-indigo-900/40 to-slate-900 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Shield className="w-32 h-32 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Startup Valuation Result</h3>
                    <p className="text-slate-400 text-sm mb-10">Méthode Combinée : Multiples SaaS (8.5x) + DCF (WACC 18%)</p>

                    <div className="space-y-8">
                        <div>
                            <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest mb-1">Pre-Money Valuation</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-5xl font-black text-white italic">{(valuation.preMoney / 1000).toFixed(1)}M</p>
                                <span className="text-xl font-bold text-slate-500">USD</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Terminale Value (Y5)</p>
                                <p className="text-xl font-bold text-white">{(valuation.exitValue / 1000).toFixed(1)}M $</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">WACC Appliqué</p>
                                <p className="text-xl font-bold text-emerald-400">18.5%</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-700/50">
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3">
                                <Briefcase className="w-5 h-5" />
                                Ouvrir "Investment Memorandum"
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-rose-400" />
                        Analyses des Risques & Scorecard
                    </h4>
                    <div className="space-y-4">
                        <RiskScore label="Qualité de l'Équipe" score={85} />
                        <RiskScore label="Traction & Go-To-Market" score={62} />
                        <RiskScore label="Barrière à l'Entrée" score={45} />
                        <RiskScore label="Sujétion Réglementaire (OHADA)" score={78} />
                    </div>
                    <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <p className="text-xs text-rose-400 leading-relaxed font-medium">
                            ⚠️ Attention : La dépendance aux régulations OHADA locales impose un risque juridique modéré. Valorisation ajustée de -10% pour ce facteur de risque.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RiskScore({ label, score }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{label}</span>
                <span className={cn(
                    "font-bold",
                    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"
                )}>{score}/100</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
                )} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

function DeckSection({ projectName }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                        <Presentation className="w-5 h-5 text-indigo-400" />
                        Pitch Deck Preview
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Structure de présentation optimisée pour investisseurs VC</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exporter .PPTX
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <SlidePreview
                    num="01"
                    title="The Problem"
                    desc="Complexity of B2B payments in Africa: High transaction costs, lack of trust, and 120-day payment cycles for SMEs."
                />
                <SlidePreview
                    num="02"
                    title="The Solution"
                    desc={`A unified marketplace for automated receivables and instant liquidity via factoring algorithms.`}
                    active
                />
                <SlidePreview
                    num="03"
                    title="Business Model"
                    desc="Freemium SaaS architecture + 1.2% success fee on funded invoices. High-scale recurring revenue model."
                />
                <SlidePreview
                    num="04"
                    title="Why Now?"
                    desc="Acceleration of digital payments in UEMOA zone and New OHADA Uniform Act for secure receivables."
                />
                <SlidePreview
                    num="05"
                    title="The Team"
                    desc="Combination of Fintech veterans (Ex-Paystack, Jumia) and top-tier African Financial Lawyers."
                />
                <div className="glass-card rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-8 gap-3 opacity-50">
                    <Plus className="w-8 h-8 text-slate-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Add Slide</p>
                </div>
            </div>
        </div>
    );
}

function SlidePreview({ num, title, desc, active }: any) {
    return (
        <div className={cn(
            "glass-card rounded-2xl border aspect-video overflow-hidden flex flex-col p-6 transition-all hover:scale-105 hover:shadow-2xl relative",
            active ? "border-indigo-500 bg-indigo-900/10" : "border-slate-700/50"
        )}>
            <span className="text-xs font-bold text-indigo-400 mb-2">SLIDE {num}</span>
            <h4 className="text-lg font-bold text-white mb-4">{title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-4">"{desc}"</p>
            {active && <div className="absolute top-4 right-4"><Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /></div>}
            <div className="absolute bottom-4 right-6 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <div className="w-4 h-1 rounded-full bg-indigo-500" />
            </div>
        </div>
    );
}
