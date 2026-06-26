"use client";

import { useState, useEffect } from "react";
import {
    Smartphone,
    RefreshCw,
    CheckCircle2,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    Filter,
    Activity,
    Zap,
    TrendingUp,
    AlertCircle,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMoneyTx {
    id: string;
    operator: string;
    reference: string;
    senderName?: string;
    senderPhone: string;
    amount: number;
    type: "IN" | "OUT";
    status: "PENDING" | "RECONCILED";
    transactionDate: string;
    reconciledAt?: string;
}

interface Stats {
    total: number;
    totalIn: number;
    totalOut: number;
    pending: number;
}

const OPERATOR_COLORS: Record<string, string> = {
    "Wave": "bg-sky-500/10 text-sky-400 border-sky-500/20",
    "Orange Money": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "MTN MoMo": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    "Airtel Money": "bg-red-500/10 text-red-400 border-red-500/20",
};

const OPERATOR_ICONS: Record<string, string> = {
    "Wave": "W",
    "Orange Money": "OM",
    "MTN MoMo": "MTN",
    "Airtel Money": "AM",
};

export default function MobileMoneyPage() {
    const [transactions, setTransactions] = useState<MobileMoneyTx[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, totalIn: 0, totalOut: 0, pending: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>("ALL");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/mobile-money");
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions || []);
                setStats(data.stats || { total: 0, totalIn: 0, totalOut: 0, pending: 0 });
            }
        } catch (err) {
            console.error("Mobile money fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/mobile-money", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "sync" })
            });
            if (res.ok) await fetchData();
        } catch (err) {
            console.error("Sync error:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleReconcile = async (txId: string) => {
        try {
            const res = await fetch("/api/mobile-money", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reconcile", transactionId: txId })
            });
            if (res.ok) await fetchData();
        } catch (err) {
            console.error("Reconcile error:", err);
        }
    };

    const filtered = transactions.filter(tx => {
        if (activeFilter === "ALL") return true;
        if (activeFilter === "IN") return tx.type === "IN";
        if (activeFilter === "OUT") return tx.type === "OUT";
        if (activeFilter === "PENDING") return tx.status === "PENDING";
        return tx.operator === activeFilter;
    });

    const netFlow = stats.totalIn - stats.totalOut;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <Smartphone className="w-40 h-40 text-emerald-400" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-600/30">
                            <Smartphone className="w-8 h-8 text-white" />
                        </div>
                        Mobile Money
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Historique et synchronisation des flux Wave, Orange Money, MTN MoMo.
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={handleSync}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-600/30"
                    >
                        <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                        Synchroniser
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Entrées"
                    value={stats.totalIn}
                    icon={<ArrowDownCircle className="w-5 h-5 text-emerald-400" />}
                    color="emerald"
                />
                <StatCard
                    label="Total Sorties"
                    value={stats.totalOut}
                    icon={<ArrowUpCircle className="w-5 h-5 text-rose-400" />}
                    color="rose"
                />
                <StatCard
                    label="Flux Net"
                    value={netFlow}
                    icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
                    color={netFlow >= 0 ? "cyan" : "rose"}
                />
                <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">En Attente</p>
                        <div className="p-2 rounded-xl bg-amber-500/10">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 tracking-tighter">{stats.pending}</div>
                    <p className="text-[10px] text-slate-500 mt-2">flux à rapprocher</p>
                </div>
            </div>

            {/* Operators Quick View */}
            <div className="grid grid-cols-3 gap-4">
                {["Wave", "Orange Money", "MTN MoMo"].map(op => {
                    const opTxs = transactions.filter(t => t.operator === op);
                    const opIn = opTxs.filter(t => t.type === "IN").reduce((acc, t) => acc + t.amount, 0);
                    return (
                        <button
                            key={op}
                            onClick={() => setActiveFilter(activeFilter === op ? "ALL" : op)}
                            className={cn(
                                "p-5 rounded-[28px] border text-left transition-all",
                                activeFilter === op
                                    ? "bg-white/10 border-white/20"
                                    : "bg-slate-900/40 border-white/5 hover:bg-white/5",
                                OPERATOR_COLORS[op]?.split(" ")[2] || "border-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border", OPERATOR_COLORS[op])}>
                                    {OPERATOR_ICONS[op]}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{op}</p>
                                    <p className="text-[10px] text-slate-500">{opTxs.length} flux</p>
                                </div>
                            </div>
                            <p className="font-black text-white font-mono text-lg">{opIn.toLocaleString()} <span className="text-slate-500 text-xs font-medium">FCFA</span></p>
                        </button>
                    );
                })}
            </div>

            {/* Transaction Table */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-slate-900/60 flex flex-wrap gap-4 items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Historique des Flux
                    </h3>
                    <div className="flex gap-2">
                        {["ALL", "IN", "OUT", "PENDING"].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border",
                                    activeFilter === f
                                        ? "bg-white text-slate-900 border-white"
                                        : "text-slate-400 border-white/5 hover:text-white hover:border-white/20"
                                )}
                            >
                                {f === "ALL" ? "Tous" : f === "IN" ? "Entrées" : f === "OUT" ? "Sorties" : "En attente"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-8 py-5">Opérateur</th>
                                <th className="px-6 py-5">Expéditeur</th>
                                <th className="px-6 py-5">Référence</th>
                                <th className="px-6 py-5 text-right">Montant</th>
                                <th className="px-6 py-5 text-center">Statut</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-8 py-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20 text-slate-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3" />
                                        <p className="text-sm">Chargement...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-20">
                                        <Smartphone className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold">Aucun flux Mobile Money trouvé</p>
                                        <button
                                            onClick={handleSync}
                                            className="mt-4 px-6 py-2 bg-emerald-600/20 text-emerald-400 rounded-xl text-sm font-black uppercase border border-emerald-500/20 hover:bg-emerald-600/30 transition-all"
                                        >
                                            Synchroniser maintenant
                                        </button>
                                    </td>
                                </tr>
                            ) : filtered.map(tx => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black", OPERATOR_COLORS[tx.operator] || "bg-slate-700/50 text-slate-300 border-slate-600")}>
                                            <span>{OPERATOR_ICONS[tx.operator] || tx.operator}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-bold text-white text-sm">{tx.senderName || "—"}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{tx.senderPhone}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-mono text-xs text-slate-400">{tx.reference}</p>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={cn("font-black font-mono text-base", tx.type === "IN" ? "text-emerald-400" : "text-rose-400")}>
                                            {tx.type === "IN" ? "+" : "-"}{tx.amount.toLocaleString()}
                                        </span>
                                        <p className="text-[9px] text-slate-600 font-bold">FCFA</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                            tx.status === "RECONCILED"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        )}>
                                            {tx.status === "RECONCILED" ? "Lettré" : "En attente"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs text-white font-semibold">
                                            {new Date(tx.transactionDate).toLocaleDateString("fr-FR")}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono">
                                            {new Date(tx.transactionDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {tx.status === "PENDING" ? (
                                            <button
                                                onClick={() => handleReconcile(tx.id)}
                                                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-[10px] font-black uppercase rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2 mx-auto"
                                            >
                                                <Zap className="w-3 h-3" /> Lettrer
                                            </button>
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500/50 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: "emerald" | "rose" | "cyan";
}) {
    const colorMap = {
        emerald: "text-emerald-400",
        rose: "text-rose-400",
        cyan: "text-cyan-400",
    };
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
                <div className="p-2 rounded-xl bg-white/5">{icon}</div>
            </div>
            <div className={cn("text-2xl font-black tracking-tighter font-mono", colorMap[color])}>
                {Math.abs(value).toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-600 mt-1 font-bold">FCFA</p>
        </div>
    );
}
