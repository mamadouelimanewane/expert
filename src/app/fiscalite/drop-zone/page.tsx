"use client";

import { useState, useCallback } from "react";
import {
    Upload,
    FileText,
    Sparkles,
    Zap,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertTriangle,
    DollarSign,
    PiggyBank,
    Building2,
    Receipt,
    Calculator,
    ArrowRight,
    RefreshCw,
    Download,
    Eye,
    Lightbulb,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Opportunity {
    id: string;
    type: "savings" | "risk" | "optimization";
    title: string;
    description: string;
    impact: number;
    confidence: number;
    category: string;
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
    {
        id: "OPP-001",
        type: "savings",
        title: "Crédit d'impôt formation non réclamé",
        description: "Vos dépenses de formation de 4.5M FCFA ouvrent droit à un crédit d'impôt de 15% soit 675,000 FCFA.",
        impact: 675000,
        confidence: 95,
        category: "Formation"
    },
    {
        id: "OPP-002",
        type: "optimization",
        title: "Amortissement dérogatoire disponible",
        description: "Les immobilisations acquises en 2025 peuvent bénéficier d'un amortissement accéléré (Art. 18 CGI).",
        impact: 2400000,
        confidence: 88,
        category: "Immobilisations"
    },
    {
        id: "OPP-003",
        type: "risk",
        title: "Provision pour créances douteuses insuffisante",
        description: "3 clients présentent des retards > 180 jours. Provision déductible possible: 1.8M FCFA.",
        impact: 1800000,
        confidence: 75,
        category: "Provisions"
    },
    {
        id: "OPP-004",
        type: "savings",
        title: "Réduction de base IS - Zone franche",
        description: "Votre activité export (>50% CA) peut bénéficier d'une exonération partielle d'IS.",
        impact: 5200000,
        confidence: 70,
        category: "Export"
    },
    {
        id: "OPP-005",
        type: "optimization",
        title: "Intégration fiscale possible",
        description: "Détention >95% de la filiale SENEGAL TECH SA. Option intégration fiscale recommandée.",
        impact: 3500000,
        confidence: 82,
        category: "Groupe"
    },
];

export default function DropZoneFiscalePage() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setUploadedFile(file);
            runAnalysis();
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            runAnalysis();
        }
    };

    const runAnalysis = () => {
        setIsAnalyzing(true);
        setAnalysisComplete(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            setOpportunities(MOCK_OPPORTUNITIES);
        }, 3000);
    };

    const totalSavings = opportunities.reduce((acc, o) => acc + o.impact, 0);
    const savingsCount = opportunities.filter(o => o.type === "savings").length;
    const risksCount = opportunities.filter(o => o.type === "risk").length;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <PiggyBank className="w-64 h-64 text-emerald-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                            IA Fiscale • Détection Automatique
                        </span>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            NEXUS Premium
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                        Drop Zone <span className="text-emerald-400">Fiscale</span>
                    </h2>
                    <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                        Déposez vos déclarations fiscales ou liasses et laissez l'IA détecter automatiquement les opportunités d'optimisation et les risques de redressement.
                    </p>
                </div>
            </div>

            {/* Drop Zone */}
            {!analysisComplete && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                        "glass-card rounded-[48px] border-2 border-dashed p-20 text-center transition-all duration-300",
                        isDragging ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 bg-slate-900/40",
                        isAnalyzing && "pointer-events-none"
                    )}
                >
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
                                <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2">Analyse en cours...</h3>
                                <p className="text-slate-500">Nexus IA scanne votre document fiscal</p>
                            </div>
                            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 animate-pulse" style={{ width: "70%" }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className={cn(
                                "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                                isDragging ? "bg-emerald-500/20 scale-110" : "bg-white/5"
                            )}>
                                <Upload className={cn("w-12 h-12", isDragging ? "text-emerald-400" : "text-slate-500")} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    {isDragging ? "Déposez le fichier ici" : "Glissez-déposez votre liasse fiscale"}
                                </h3>
                                <p className="text-slate-500">Formats acceptés : PDF, Excel, XML (DSF)</p>
                            </div>
                            <label className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer transition-all shadow-lg shadow-emerald-600/30">
                                <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.xlsx,.xls,.xml" />
                                Ou sélectionner un fichier
                            </label>
                        </div>
                    )}
                </div>
            )}

            {/* Results */}
            {analysisComplete && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-card p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Économies Potentielles</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-400">{(totalSavings / 1000000).toFixed(1)}M</span>
                                <span className="text-xs text-emerald-500 font-bold">FCFA</span>
                            </div>
                        </div>
                        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Opportunités</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{opportunities.length}</span>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                        </div>
                        <div className="glass-card p-8 rounded-[40px] bg-amber-500/5 border border-amber-500/20">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Risques Détectés</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-amber-400">{risksCount}</span>
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            </div>
                        </div>
                        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Confiance Moyenne</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-indigo-400">
                                    {Math.round(opportunities.reduce((a, o) => a + o.confidence, 0) / opportunities.length)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Opportunities List */}
                    <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Lightbulb className="w-6 h-6 text-amber-400" />
                                Opportunités Détectées par Nexus IA
                            </h3>
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all">
                                <Download className="w-4 h-4" /> Exporter Rapport
                            </button>
                        </div>

                        <div className="space-y-4">
                            {opportunities.map((opp, i) => (
                                <div
                                    key={opp.id}
                                    className={cn(
                                        "p-6 rounded-3xl border transition-all hover:scale-[1.01] cursor-pointer",
                                        opp.type === "savings" ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" :
                                            opp.type === "risk" ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40" :
                                                "bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                opp.type === "savings" ? "bg-emerald-500/20" :
                                                    opp.type === "risk" ? "bg-amber-500/20" : "bg-indigo-500/20"
                                            )}>
                                                {opp.type === "savings" ? <PiggyBank className="w-5 h-5 text-emerald-400" /> :
                                                    opp.type === "risk" ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
                                                        <Target className="w-5 h-5 text-indigo-400" />}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white">{opp.title}</h4>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{opp.category}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn(
                                                "text-2xl font-black",
                                                opp.type === "savings" ? "text-emerald-400" :
                                                    opp.type === "risk" ? "text-amber-400" : "text-indigo-400"
                                            )}>
                                                {(opp.impact / 1000000).toFixed(1)}M
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-bold">FCFA d'impact</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{opp.description}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", opp.confidence > 80 ? "bg-emerald-500" : opp.confidence > 60 ? "bg-amber-500" : "bg-rose-500")}
                                                        style={{ width: `${opp.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{opp.confidence}% confiance</span>
                                            </div>
                                        </div>
                                        <button className="text-[10px] font-black text-white flex items-center gap-1 hover:text-indigo-400 transition-colors uppercase tracking-widest">
                                            Voir Détails <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="text-center">
                        <button
                            onClick={() => { setAnalysisComplete(false); setUploadedFile(null); setOpportunities([]); }}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
                        >
                            Analyser un autre document
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
