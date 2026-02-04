"use client";

import { useState } from "react";
import {
    Factory,
    Boxes,
    PackagePlus,
    TrendingUp,
    AlertTriangle,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    PackageCheck,
    Truck,
    Settings,
    BarChart4,
    Activity,
    Thermometer,
    Cog,
    Calculator
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Mock Data for Industrial Clients
const INDUSTRIAL_PORTFOLIO = [
    {
        id: "1",
        name: "Cimenterie d'Abidjan",
        sector: "Matériaux Construction",
        turnover: "1.2B FCFA",
        margin: "18%",
        stockValue: "450M FCFA",
        wip: "120M FCFA", // Work In Progress
        productionStatus: "Optimal",
        alerts: 0,
        costingMethod: "Standard Cost",
        stockRotation: 45 // days
    },
    {
        id: "2",
        name: "Agro-Industrie du Nord",
        sector: "Transformation Alimentaire",
        turnover: "850M FCFA",
        margin: "24%",
        stockValue: "180M FCFA",
        wip: "45M FCFA",
        productionStatus: "Warning",
        alerts: 2, // e.g. Perissable stock risk
        costingMethod: "FIFO",
        stockRotation: 12 // days (fast)
    },
    {
        id: "3",
        name: "Plastiques & Emballages SA",
        sector: "Manufacture",
        turnover: "2.1B FCFA",
        margin: "11%",
        stockValue: "800M FCFA",
        wip: "300M FCFA",
        productionStatus: "Critical",
        alerts: 4, // Machine downtime impact on finance
        costingMethod: "Weighted Avg",
        stockRotation: 60 // days
    }
];

export default function ManufacturingPortfolioPage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Industrial Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-orange-500/20">
                        <Factory className="w-3 h-3" /> Pôle Industrie
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Gestion Portefeuille Industriel
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Pilotage des coûts de production, valorisation des stocks et analyse de marge industrielle.
                        Vue consolidée des <span className="text-orange-400 font-bold">14 sites de production</span>.
                    </p>
                </div>

                {/* Background Decoration */}
                <Factory className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 text-orange-500/5 -z-0" />

                <div className="flex gap-3 z-10">
                    <Link href="/industries/manufacturing/machinery" className="px-6 py-3 bg-white/5 hover:bg-slate-800 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <Cog className="w-4 h-4" /> Parc Machines
                    </Link>
                    <button className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/25 flex items-center gap-2">
                        <BarChart4 className="w-4 h-4" /> Rapport de Gestion
                    </button>
                </div>
            </div>

            {/* KPIs Industriel Globaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard
                    label="Volume d'Affaires Industriel"
                    value="4.15 Milliards"
                    trend="+8.5% vs N-1"
                    icon={Factory}
                    color="text-orange-400"
                />
                <KpiCard
                    label="Valeur des Stocks (Brut)"
                    value="1.43 Milliards"
                    trend="En hausse (Sur-stockage ?)"
                    trendColor="text-rose-400"
                    icon={Boxes}
                    color="text-sky-400"
                />
                <KpiCard
                    label="Marge Brute Industrielle"
                    value="19.2%"
                    trend="-1.2% pts (Coût Énergie)"
                    trendColor="text-amber-400"
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <KpiCard
                    label="Encours de Production (WIP)"
                    value="465 Millions"
                    trend="Stable"
                    icon={PackagePlus}
                    color="text-violet-400"
                />
            </div>

            {/* Main Portfolio Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left: Client List & Status */}
                <div className="xl:col-span-2 glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/60">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-500" />
                                Clients Industriels
                            </h3>
                            <Link href="/industries/manufacturing/costing" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 border border-violet-500/20 px-3 py-1.5 rounded-lg bg-violet-500/10 transition-colors">
                                <Calculator className="w-3 h-3" /> Analytique Produit
                            </Link>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Agro</span>
                                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Manufacture</span>
                                <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Mines</span>
                            </div>
                        </div>
                        <Filter className="w-5 h-5 text-slate-500 cursor-pointer" />
                    </div>

                    <div className="p-6 grid gap-4">
                        {INDUSTRIAL_PORTFOLIO.map((client) => (
                            <div key={client.id} className="group p-6 rounded-3xl bg-slate-950/50 border border-white/5 hover:border-orange-500/30 transition-all hover:bg-slate-900/60 cursor-pointer">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                            client.sector === "Transformation Alimentaire" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                client.sector === "Matériaux Construction" ? "bg-slate-700/30 border-slate-600 text-slate-300" :
                                                    "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                        )}>
                                            <Factory className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{client.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{client.sector}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white">{client.turnover}</div>
                                        <div className="text-xs text-slate-500 font-bold">Chiffre d'Affaires</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-b border-white/5 bg-black/20 rounded-xl px-4">
                                    <MetricItem label="Marge Brute" value={client.margin} up={parseFloat(client.margin) > 15} />
                                    <MetricItem label="Valeur Stocks" value={client.stockValue} />
                                    <MetricItem label="Rotation Stock" value={`${client.stockRotation} Jours`} color={client.stockRotation > 50 ? "text-rose-400" : "text-emerald-400"} />
                                    <MetricItem label="Méthode Coût" value={client.costingMethod} icon={Settings} />
                                </div>

                                <div className="mt-4 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {client.productionStatus === "Critical" ? (
                                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <AlertTriangle className="w-3 h-3" /> Arrêt Production
                                            </span>
                                        ) : client.productionStatus === "Warning" ? (
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <Activity className="w-3 h-3" /> Risque Rupture
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <PackageCheck className="w-3 h-3" /> Production OK
                                            </span>
                                        )}
                                    </div>
                                    <button className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Voir Analytique <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Analytical Focus & Alerts */}
                <div className="space-y-6">

                    {/* Industrial Cost Structure */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <BarChart4 className="w-5 h-5 text-orange-400" />
                            Répartition des Coûts
                            <span className="text-xs text-slate-500 font-normal ml-auto">Moyenne Portefeuille</span>
                        </h3>

                        <div className="space-y-4">
                            <CostBar label="Matières Premières" percent={45} color="bg-sky-500" />
                            <CostBar label="Main d'Oeuvre Directe (MOD)" percent={20} color="bg-emerald-500" />
                            <CostBar label="Énergie & Fluides" percent={15} color="bg-amber-500" alert />
                            <CostBar label="Amortissements Industriels" percent={12} color="bg-violet-500" />
                            <CostBar label="Frais Généraux Usine" percent={8} color="bg-slate-500" />
                        </div>

                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <TrendIndicator up={false} />
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Alerte Énergie</p>
                                    <p className="text-xs text-amber-200 leading-relaxed">
                                        Le poste "Énergie" a augmenté de 12% sur le trimestre (Impact Cimenterie d'Abidjan). Réviser le prix de revient standard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Health */}
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-950/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Boxes className="w-32 h-32 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <Thermometer className="w-5 h-5 text-rose-400" />
                            Santé des Stocks
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase">Rotation Lente</p>
                                <p className="text-xl font-black text-rose-400 mt-1">450M</p>
                                <p className="text-[10px] text-rose-500/70 mt-1 font-bold"> &gt; 180 Jours</p>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase">Rupture</p>
                                <p className="text-xl font-black text-amber-400 mt-1">12 Art.</p>
                                <p className="text-[10px] text-amber-500/70 mt-1 font-bold">Impact Production</p>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest border border-white/5">
                            Lancer Inventaire Tournant
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, trend, trendColor = "text-emerald-400", icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform", color.replace("text-", "bg-").replace("400", "500/20"))}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                <div className={cn("text-[10px] font-black px-2 py-1 rounded-full bg-slate-800 border border-white/5", trendColor)}>
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
            </div>
        </div>
    );
}

function MetricItem({ label, value, up, color, icon: Icon }: any) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3" />} {label}
            </p>
            <p className={cn("font-bold text-sm", color ? color : "text-white")}>
                {value}
                {up !== undefined && (
                    <span className={cn("ml-1", up ? "text-emerald-400" : "text-rose-400")}>
                        {up ? "↑" : "↓"}
                    </span>
                )}
            </p>
        </div>
    );
}

function CostBar({ label, percent, color, alert }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className={cn("text-slate-300", alert && "text-amber-400")}>{label} {alert && "⚠️"}</span>
                <span className="text-white">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

function TrendIndicator({ up }: { up: boolean }) {
    return (
        <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            up ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
        )}>
            {up ? <ArrowUpRight className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
        </div>
    );
}
