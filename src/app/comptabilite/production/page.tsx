"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Table as TableIcon,
    BarChart3,
    History,
    Zap,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    Calendar,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_FLOWS = [
    { id: "1", client: "Société Ivoirienne de Banque", amount: "4 250 000", date: "27/01/2024", type: "Vente", status: "Matching IA (98%)", tags: ["Audit", "SIB"] },
    { id: "2", client: "Orange Sénégal", amount: "1 200 000", date: "26/01/2024", type: "Vente", status: "A réviser", tags: ["Télécoms"] },
    { id: "3", client: "Traoré Import-Export", amount: "890 000", date: "26/01/2024", type: "Achat", status: "Matching IA (95%)", tags: ["SYSCOHADA"] },
    { id: "4", client: "Boulangerie du Plateau", amount: "45 000", date: "25/01/2024", type: "Achat", status: "A réviser", tags: ["Frais"] },
];

export default function CollaborativeProductionPage() {
    const [activeView, setActiveView] = useState<"production" | "pilotage">("production");

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Pennylane Style Hero */}
            <div className="bg-slate-950 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                All-in-One Production
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Production Comptable <span className="text-indigo-400">Collaborative</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Accédez aux flux financiers de vos clients en temps réel. Pennylane synchronise la gestion client et la production cabinet dans un outil unique.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex">
                            <button
                                onClick={() => setActiveView("production")}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeView === "production" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white"
                                )}
                            >
                                Production
                            </button>
                            <button
                                onClick={() => setActiveView("pilotage")}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    activeView === "pilotage" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-white"
                                )}
                            >
                                Pilotage
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-time KPI Stream */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Flux à traiter" value="124" trend="-12" icon={RefreshCw} color="text-indigo-400" />
                <KpiCard title="Matching Auto IA" value="88%" trend="+5%" icon={Zap} color="text-amber-400" />
                <KpiCard title="Écarts Lettrage" value="12" subtext="Requérant attention" icon={AlertCircle} color="text-rose-400" />
                <KpiCard title="Temps de saisie sauvé" value="2.5h" subtext="Ce jour" icon={Clock} color="text-emerald-400" />
            </div>

            {/* Main Production Table (PENNYLANE STYLE) */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-6 bg-slate-900/60">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <TableIcon className="w-5 h-5 text-indigo-400" />
                            Flux Financiers Multi-Dossiers
                        </h3>
                        <div className="flex gap-2">
                            {["Tous", "Ventes", "Achats", "Banque"].map(tag => (
                                <button key={tag} className="px-4 py-1.5 bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher un client, un montant..."
                                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                        <button className="p-3 bg-slate-950 rounded-xl text-slate-500 hover:text-white border border-white/5"><Filter className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-6 py-6">Client / Dossier</th>
                                <th className="px-6 py-6 font-black text-right">Montant (FCFA)</th>
                                <th className="px-6 py-6">Nature</th>
                                <th className="px-6 py-6">Matching & Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {ALL_FLOWS.map((flow) => (
                                <tr key={flow.id} className="hover:bg-indigo-600/5 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-mono font-bold text-slate-500">{flow.date}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div>
                                            <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">{flow.client}</span>
                                            <div className="flex gap-1 mt-1">
                                                {flow.tags.map(tag => (
                                                    <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-slate-500 uppercase font-black">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className="font-bold text-white font-mono">{flow.amount}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            flow.type === "Vente" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            {flow.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                flow.status.includes("IA") ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-amber-500"
                                            )} />
                                            <span className="text-xs font-bold text-slate-400">{flow.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                                            Saisir <ArrowRight className="w-3 h-3 inline ml-2" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 360 Client View Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PieChart className="w-32 h-32 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-indigo-400" />
                        Pilotage par Portefeuille
                    </h3>
                    <div className="space-y-6">
                        <PortfolioProgress client="Telecom Afrique" progress={92} status="Prêt pour Clôture" />
                        <PortfolioProgress client="SIB" progress={45} status="En attente documents" color="bg-amber-500" />
                        <PortfolioProgress client="Orange Sénégal" progress={12} status="Retard Majeur" color="bg-rose-500" />
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-950/40">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <Zap className="w-6 h-6 text-amber-400" />
                        L'intelligence Pennylane x NEXUS
                    </h3>
                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            "J'ai identifié 14 factures récurrentes non synchronisées sur le dossier SIB. Voulez-vous que je génère les écritures d'abonnements correspondantes ?"
                        </p>
                        <div className="flex gap-4">
                            <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">Oui, Appliquer</button>
                            <button className="px-6 py-2.5 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Voir le détail</button>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center gap-4 text-xs font-bold text-slate-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Toutes les écritures sont synchronisées avec vos 300+ connecteurs.
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, trend, subtext, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-full",
                        trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
            {subtext && <p className="text-[10px] text-slate-600 font-bold mt-1">{subtext}</p>}
        </div>
    );
}

function PortfolioProgress({ client, progress, status, color = "bg-indigo-500" }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-white">{client}</span>
                <span className="text-slate-500 uppercase tracking-widest text-[9px]">{status}</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
