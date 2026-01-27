"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    ArrowRightLeft,
    Banknote,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Activity,
    Smartphone,
    CreditCard,
    Sparkles,
    ShieldCheck,
    Download,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: "Crédit" | "Débit";
    matchStatus: "Matching IA 98%" | "Manuel" | "Partiel" | "Non réconcilié";
    category: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "TR-001", date: "24/05/2024", description: "Virement CLIENT SIB", amount: "1 250 000", type: "Crédit", matchStatus: "Matching IA 98%", category: "Honoraires" },
    { id: "TR-002", date: "23/05/2024", description: "Facture ENEO ELECTRICITE", amount: "45 000", type: "Débit", matchStatus: "Partiel", category: "Charges" },
    { id: "TR-003", date: "22/05/2024", description: "Achat Fournitures Bureau", amount: "12 500", type: "Débit", matchStatus: "Non réconcilié", category: "Général" },
];

export default function BankingPage() {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Activity className="w-40 h-40 text-cyan-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-600/30">
                            <ArrowRightLeft className="w-8 h-8 text-white" />
                        </div>
                        Banque & Réconciliation IA
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Synchronisation bancaire automatique et lettrage intelligent des flux.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={handleSync}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all active:scale-95 shadow-xl"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-cyan-400", isSyncing && "animate-spin")} />
                        Synchroniser
                    </button>
                    <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-cyan-600/30">
                        <Plus className="w-4 h-4" />
                        Nouveau Compte
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Banknote className="w-20 h-20" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Trésorerie Globale</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-white tracking-tighter">124.5M</h3>
                        <span className="text-xs font-bold text-slate-600 italic">FCFA</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-lg border border-emerald-500/20">
                        <ArrowDownRight className="w-3 h-3" /> +5.4% ce mois
                    </div>
                </div>

                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 relative group overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Auto-Réconciliation (Matching IA)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-cyan-400 tracking-tighter">94.2%</h3>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium mt-2">Plus de 450 flux lettrés automatiquement cette semaine.</p>
                </div>

                <div className="glass-card p-8 rounded-[40px] border border-rose-500/10 bg-rose-500/[0.02] relative group overflow-hidden">
                    <p className="text-[10px] text-rose-400/80 font-black uppercase tracking-[0.2em] mb-2">Action Requise</p>
                    <div className="flex items-baseline gap-2 text-rose-400">
                        <h3 className="text-4xl font-black tracking-tighter">08</h3>
                        <span className="text-xs font-bold">flux manuels</span>
                    </div>
                    <button className="mt-4 text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2 hover:underline">
                        Traiter les écarts <Smartphone className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Bank Card & Sync Status */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-gradient-to-br from-indigo-600 to-indigo-900 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <CreditCard className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                            <p className="text-white/60 font-bold text-xs uppercase tracking-widest">Bank of Africa (BOA)</p>
                            <div>
                                <h4 className="text-white font-black text-2xl">Compte Principal</h4>
                                <p className="text-indigo-200 text-xs font-mono mt-1">**** **** **** 4290</p>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-white font-black text-xl">82.4M FCFA</p>
                                <div className="w-10 h-6 bg-amber-500 rounded-md shadow-inner" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40">
                        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-indigo-400" />
                            Statut Sync
                        </h4>
                        <div className="space-y-4">
                            <SyncItem label="BOA CI" status="Online" time="Il y a 2m" />
                            <SyncItem label="Ecobank Senegal" status="Online" time="Il y a 1h" />
                            <SyncItem label="Orange Money Business" status="Alerte" time="Auth requis" />
                        </div>
                    </div>
                </div>

                {/* Main Transaction Feed */}
                <div className="lg:col-span-3 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-indigo-400" />
                            Derniers Flux Bancaires
                        </h3>
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher une transaction..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Libellé / Date</th>
                                    <th className="px-6 py-6 font-black text-center">Catégorie</th>
                                    <th className="px-6 py-6 font-black text-right">Montant</th>
                                    <th className="px-6 py-6 font-black text-center">Réconciliation IA</th>
                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_TRANSACTIONS.map((tr) => (
                                    <tr key={tr.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div>
                                                <span className="font-bold text-white block">{tr.description}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tr.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700 text-slate-400 font-extrabold uppercase">{tr.category}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className={cn(
                                                "font-mono font-black text-base shadow-sm",
                                                tr.type === "Crédit" ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                {tr.type === "Débit" ? "-" : "+"} {tr.amount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                                    tr.matchStatus.includes("98") ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                                        tr.matchStatus === "Partiel" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                )}>
                                                    {tr.matchStatus}
                                                </span>
                                                {tr.matchStatus.includes("98") && (
                                                    <span className="text-[8px] text-emerald-500 font-bold flex items-center gap-1">
                                                        <ShieldCheck className="w-2.5 h-2.5" /> Lettré
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SyncItem({ label, status, time }: any) {
    return (
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", status === "Online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500")} />
                <span className="text-xs font-bold text-slate-200">{label}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium group-hover:text-slate-300 transition-colors uppercase">{time}</span>
        </div>
    );
}
