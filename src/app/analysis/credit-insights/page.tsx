"use client";

import { useState } from "react";
import {
    TrendingUp,
    Search,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Target,
    Zap,
    AlertCircle,
    CheckCircle2,
    Building2,
    Users,
    Wallet,
    Info,
    ChevronRight,
    RefreshCw,
    Download,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditScore {
    id: string;
    entityName: string;
    type: "individual" | "business";
    score: number;
    trend: "up" | "down" | "stable";
    riskCategory: "excellent" | "good" | "fair" | "high_risk";
    factors: {
        label: string;
        impact: "positive" | "negative";
        description: string;
    }[];
    highlights: {
        label: string;
        value: string;
    }[];
}

const MOCK_SCORES: CreditScore[] = [
    {
        id: "CR-902",
        entityName: "Ousmane Tanor Sène",
        type: "individual",
        score: 742,
        trend: "up",
        riskCategory: "excellent",
        factors: [
            { label: "Stabilité Résidentielle", impact: "positive", description: "Même adresse depuis 8 ans" },
            { label: "Comportement Paiement", impact: "positive", description: "Aucun impayé sur les 24 derniers mois" },
            { label: "Endettement", impact: "negative", description: "Ratio d'endettement proche de 35%" }
        ],
        highlights: [
            { label: "Capacité Emprunt", value: "45M FCFA" },
            { label: "Score Nexus (Alt)", value: "Premium" },
            { label: "Validité", value: "30 Jours" }
        ]
    },
    {
        id: "CR-B14",
        entityName: "AgroBusiness West Africa SA",
        type: "business",
        score: 510,
        trend: "down",
        riskCategory: "fair",
        factors: [
            { label: "Santé Sectorielle", impact: "negative", description: "Baisse de croissance dans l'agro-export" },
            { label: "Contentieux", impact: "negative", description: "Un litige commercial en cours (OHADA)" },
            { label: "Volume Transactionnel", impact: "positive", description: "Flux constants malgré le litige" }
        ],
        highlights: [
            { label: "Limite Crédit", value: "120M FCFA" },
            { label: "Score Nexus (Alt)", value: "Standard" },
            { label: "Validité", value: "15 Jours" }
        ]
    }
];

export default function CreditInsightsPage() {
    const [selectedScore, setSelectedScore] = useState<CreditScore>(MOCK_SCORES[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCalculating, setIsCalculating] = useState(false);

    const getScoreColor = (category: string) => {
        switch (category) {
            case "excellent": return "text-emerald-400";
            case "good": return "text-blue-400";
            case "fair": return "text-amber-400";
            case "high_risk": return "text-rose-400";
            default: return "text-slate-400";
        }
    };

    const handleCalculate = () => {
        if (!searchQuery.trim()) return;
        setIsCalculating(true);
        setTimeout(() => {
            setIsCalculating(false);
            setSearchQuery("");
        }, 3000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <TrendingUp className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-500/20">
                                Scoring Alternatif IA
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-indigo-400">Credit Insights</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Évaluez la solvabilité avec des données alternatives (télécom, factures, comportement) pour une vision 360° du risque de crédit.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                        <Zap className="w-5 h-5" /> Calculer Score
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Overview */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl">
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    {selectedScore.type === "individual" ? <Users className="w-12 h-12" /> : <Building2 className="w-12 h-12" />}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white mb-2">{selectedScore.entityName}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: {selectedScore.id}</span>
                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400">
                                            <ArrowUpRight className="w-3 h-3" /> Tendance Positive
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn("text-6xl font-black leading-none mb-1", getScoreColor(selectedScore.riskCategory))}>
                                    {selectedScore.score}
                                </div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Score Nexus / 850</div>
                            </div>
                        </div>

                        {/* KPI Highlights */}
                        <div className="grid grid-cols-3 gap-4 mb-12">
                            {selectedScore.highlights.map((h, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-3xl text-center">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{h.label}</p>
                                    <p className="text-lg font-black text-white">{h.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Score Scale Overlay (Decorative) */}
                        <div className="relative pt-12">
                            <div className="h-2 bg-white/5 rounded-full mb-4 flex overflow-hidden">
                                <div className="w-[20%] bg-rose-500/40" />
                                <div className="w-[20%] bg-amber-500/40" />
                                <div className="w-[30%] bg-blue-500/40" />
                                <div className="w-[30%] bg-emerald-500/40" />
                            </div>
                            <div className="absolute top-10 flex -translate-x-1/2 flex-col items-center" style={{ left: `${(selectedScore.score / 850) * 100}%` }}>
                                <div className="w-1 h-6 bg-white shadow-xl shadow-indigo-500/50" />
                                <div className="mt-1 px-3 py-1 bg-white text-indigo-900 text-[10px] font-black uppercase rounded-md">Vous êtes ici</div>
                            </div>
                            <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest">
                                <span>Mauvais</span>
                                <span>Moyen</span>
                                <span>Bon</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                    </div>

                    {/* Contributing Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 p-8">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-400" /> Facteurs Positifs
                            </h4>
                            <div className="space-y-4">
                                {selectedScore.factors.filter(f => f.impact === "positive").map((f, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-tight mb-1">{f.label}</p>
                                            <p className="text-[10px] text-emerald-400/70 leading-relaxed">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 p-8">
                            <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400" /> Points d'Attention
                            </h4>
                            <div className="space-y-4">
                                {selectedScore.factors.filter(f => f.impact === "negative").map((f, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                                            <XCircle className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-tight mb-1">{f.label}</p>
                                            <p className="text-[10px] text-rose-400/70 leading-relaxed">{f.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Active Analysis Panel */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                        <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Search className="w-4 h-4 text-indigo-400" /> Rechercher Entity
                        </h4>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nom, NNI ou RCCM..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                onClick={handleCalculate}
                                disabled={isCalculating || !searchQuery.trim()}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10 flex items-center justify-center gap-3"
                            >
                                {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Générer Insight"}
                            </button>
                        </div>
                    </div>

                    {/* Recent Inquiries */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                        <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Demandes Récentes</h4>
                        <div className="space-y-4">
                            {MOCK_SCORES.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedScore(s)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                                        selectedScore.id === s.id ? "bg-indigo-600 shadow-xl shadow-indigo-600/30" : "bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className="text-left">
                                        <p className={cn("text-xs font-black uppercase", selectedScore.id === s.id ? "text-white" : "text-slate-200")}>{s.entityName}</p>
                                        <p className={cn("text-[9px] font-bold uppercase", selectedScore.id === s.id ? "text-indigo-200" : "text-slate-500")}>Scoré il y a 2h</p>
                                    </div>
                                    <span className={cn("text-lg font-black", selectedScore.id === s.id ? "text-white" : getScoreColor(s.riskCategory))}>{s.score}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="glass-card rounded-[32px] border border-indigo-500/20 bg-indigo-500/5 p-8">
                        <div className="flex items-start gap-4 mb-4">
                            <Info className="w-6 h-6 text-indigo-400 shrink-0" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Les scores Nexus utilisent des techniques de **Machine Learning** sur des données non-traditionnelles pour inclure les populations non-bancarisées.
                            </p>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all py-2 border-t border-white/5">
                            Méthodologie Nexus <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Export Actions */}
                    <div className="flex gap-4">
                        <button className="flex-1 py-4 glass-card bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white transition-all border border-white/5">
                            <Download className="w-4 h-4" /> PDF
                        </button>
                        <button className="flex-1 py-4 glass-card bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white transition-all border border-white/5">
                            <Eye className="w-4 h-4" /> Rapport
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
