"use client";

import { useState } from "react";
import {
    Leaf,
    Wind,
    Droplets,
    Zap,
    Users,
    Scale,
    TrendingDown,
    Award,
    Download,
    Eye,
    Globe,
    TreePine,
    Activity,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const ESG_METRICS = [
    {
        id: "env",
        label: "Environnement",
        icon: Leaf,
        score: 72,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        details: [
            { label: "Emissions CO2 (Teq)", value: "142.5", trend: "-8%", status: "good" },
            { label: "Consommation Énergie", value: "850 kWh", trend: "+2%", status: "warning" },
            { label: "Recyclage Déchets", value: "65%", trend: "+12%", status: "good" }
        ]
    },
    {
        id: "soc",
        label: "Social / RH",
        icon: Users,
        score: 85,
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        details: [
            { label: "Index Égalité F/H", value: "92/100", trend: "Stable", status: "good" },
            { label: "Formation (heures/an)", value: "45h", trend: "+15%", status: "good" },
            { label: "Turnover Équipe", value: "4.2%", trend: "-1%", status: "good" }
        ]
    },
    {
        id: "gov",
        label: "Gouvernance",
        icon: Scale,
        score: 90,
        color: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        details: [
            { label: "Parité Conseil", value: "50/50", trend: "Optimal", status: "good" },
            { label: "Éthique & Anti-Corruption", value: "Certified", trend: "A+", status: "good" },
            { label: "Transparence Salaires", value: "Full", trend: "Auditée", status: "good" }
        ]
    }
];

export default function SustainabilityHubPage() {
    const [selectedCategory, setSelectedCategory] = useState("env");

    const activeData = ESG_METRICS.find(m => m.id === selectedCategory);

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Organic/Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-10 border-b border-white/5 relative overflow-hidden ring-1 ring-emerald-500/10 rounded-[40px] px-10 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <Globe className="w-3 h-3" /> Dashboard Durabilité & RSE
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-4">
                        Sustainability Hub
                    </h1>
                    <p className="text-slate-400 mt-4 max-w-2xl text-lg leading-relaxed">
                        Mesurez l'empreinte carbone et l'impact social de votre entreprise directement à partir de vos données comptables.
                        Préparez votre reporting <span className="text-emerald-400 font-bold">CSRD-Ready</span>.
                    </p>
                </div>

                {/* Floating "Green" Badge */}
                <div className="z-10 bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-3xl flex flex-col items-center gap-2 shadow-2xl">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="48" cy="48" r="42" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                            <circle cx="48" cy="48" r="42" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="264" strokeDashoffset="47" className="animate-pulse" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-2xl font-black text-white">82</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Score ESG</span>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Niveau Gold
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Interactive Categories */}
                <div className="lg:col-span-4 space-y-4">
                    {ESG_METRICS.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedCategory(m.id)}
                            className={cn(
                                "w-full text-left p-6 rounded-[32px] border transition-all duration-300 relative group overflow-hidden",
                                selectedCategory === m.id
                                    ? "bg-slate-900/80 border-emerald-500/30 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)]"
                                    : "bg-slate-900/20 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                                        <m.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{m.label}</h3>
                                        <p className="text-xs text-slate-500 font-medium">Auto-calculé via FEC</p>
                                    </div>
                                </div>
                                <div className={cn("text-2xl font-black", m.color)}>
                                    {m.score}%
                                </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="mt-6 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-700", m.id === "env" ? "bg-emerald-400" : m.id === "soc" ? "bg-sky-400" : "bg-violet-400")}
                                    style={{ width: selectedCategory === m.id ? `${m.score}%` : '20%' }}
                                />
                            </div>
                        </button>
                    ))}

                    {/* Carbon Offset Promotion */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-[32px] text-white shadow-xl shadow-emerald-900/20 mt-8 group cursor-pointer overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-150 transition-transform duration-700">
                            <TreePine className="w-24 h-24" />
                        </div>
                        <h4 className="font-black text-xl mb-2">Compensez vos émissions</h4>
                        <p className="text-xs text-emerald-50/80 mb-4 leading-relaxed">
                            Financez des projets de reforestation locaux en Côte d'Ivoire & au Sénégal directement depuis votre compte.
                        </p>
                        <button className="w-full py-3 bg-white text-emerald-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            Découvrir les projets <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Detailed Analysis View */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative min-h-[500px]">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                {activeData?.icon && <activeData.icon className={cn("w-6 h-6", activeData.color)} />}
                                Focus : {activeData?.label}
                            </h3>
                            <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">
                                <Download className="w-4 h-4" /> Rapport de Durabilité PDF
                            </button>
                        </div>

                        {/* Detailed Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {activeData?.details.map((detail, i) => (
                                <div key={i} className="p-6 bg-slate-950/60 border border-white/5 rounded-[32px] hover:border-emerald-500/20 transition-all group">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{detail.label}</p>
                                    <div className="text-2xl font-black text-white mb-1">{detail.value}</div>
                                    <div className={cn("text-xs font-bold flex items-center gap-1",
                                        detail.trend.includes('-') && selectedCategory === 'env' ? "text-emerald-400" :
                                            detail.trend.includes('+') && selectedCategory === 'env' ? "text-rose-400" : "text-emerald-400"
                                    )}>
                                        {detail.trend === "Stable" ? <Activity className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {detail.trend}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Visual Chart Area Placeholder */}
                        <div className="h-64 bg-slate-950/40 rounded-[32px] border border-white/5 p-8 flex flex-col justify-end">
                            <div className="flex justify-between items-end gap-1 h-full">
                                {[30, 45, 60, 55, 40, 35, 20, 25, 30, 28, 22, 18].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                        <div
                                            className={cn("w-full max-w-[42px] rounded-t-xl transition-all duration-700",
                                                i > 8 ? "bg-emerald-500/60 group-hover:bg-emerald-400" : "bg-slate-700/50 group-hover:bg-slate-600"
                                            )}
                                            style={{ height: `${h * 1.5}px` }}
                                        />
                                        <span className="text-[8px] font-bold text-slate-600 font-mono">M{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-6">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Conseil Expert IA</h4>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                                    Votre consommation d'énergie a diminué de 12% suite au changement des machines de production le mois dernier.
                                    Cela représente une économie fiscale potentielle de <span className="text-emerald-400 font-bold">1.2M FCFA</span> via le crédit d'impôt vert.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

