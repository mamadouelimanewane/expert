"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Target,
    Activity,
    Lightbulb,
    ArrowUpRight,
    PieChart,
    BarChart2,
    Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvisoryPage() {
    const [selectedClient, setSelectedClient] = useState("Société Ivoirienne de Banque");

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Activity className="w-8 h-8 text-fuchsia-500" />
                        Conseil & Stratégie (CFO)
                    </h2>
                    <p className="text-slate-400 mt-1">Tableau de bord de pilotage financier pour vos clients (Missions d'accompagnement).</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white hover:border-indigo-500 transition-colors cursor-pointer"
                    >
                        <option>Société Ivoirienne de Banque</option>
                        <option>Traoré Import-Export</option>
                    </select>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Partager au Client
                    </button>
                </div>
            </div>

            {/* Health Score & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card rounded-2xl p-6 border border-slate-700/50 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-900/20">
                    <div>
                        <h3 className="text-slate-400 font-medium mb-1">Score de Santé Financière</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-white">82</span>
                            <span className="text-xl text-slate-500">/100</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">+4 pts vs M-1</span>
                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs border border-slate-700">Secteur: 78/100</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            <strong className="text-white">Analyse IA :</strong> La trésorerie est solide (+15%). Attention cependant au délai de paiement client (DSO) qui s'allonge de 45 à 52 jours.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        Recommandations Stratégiques (IA)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: "Optimisation BFR", desc: "Le poste client augmente. Il est recommandé de relancer les factures > 60 jours.", impact: "High", gain: "Env. 3.5M FCFA" },
                            { title: "Renégociation Fournisseur", desc: "Le poste Achats Matières a bondi de 12%. Une renégociation avec 'Global Transit' est conseillée.", impact: "Medium", gain: "Env. 800K FCFA" },
                            { title: "Excédent de Trésorerie", desc: "15M FCFA dorment sur le compte courant. Un placement DAT à terme pourrait rapporter.", impact: "Low", gain: "3% annuel" }
                        ].map((rec, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 transition-colors cursor-pointer group">
                                <div className={cn(
                                    "w-1.5 h-12 rounded-full shrink-0",
                                    rec.impact === "High" ? "bg-rose-500" : rec.impact === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                                )} />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">{rec.title}</h4>
                                        <span className="text-xs font-mono text-emerald-400">{rec.gain}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">{rec.desc}</p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPIWidget title="Marge Brute" value="42%" trend="+2.1%" good={true} icon={PieChart} color="indigo" />
                <KPIWidget title="Résultat Net" value="12.4M" trend="-1.5%" good={false} icon={Target} color="rose" />
                <KPIWidget title="Dettes Fourn." value="45J" trend="+5J" good={false} icon={TrendingDown} color="amber" />
                <KPIWidget title="Trésorerie" value="18.2M" trend="+12%" good={true} icon={BarChart2} color="emerald" />
            </div>

            {/* Cash Flow Forecast Chart Mock */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Prévisions de Trésorerie (6 mois)
                    </h3>
                    <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-1 text-slate-400"><div className="w-3 h-3 bg-indigo-500 rounded" /> Réel</div>
                        <div className="flex items-center gap-1 text-slate-400"><div className="w-3 h-3 bg-emerald-500/50 border border-emerald-500 rounded border-dashed" /> Prévisionnel IA</div>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2">
                    {[40, 45, 38, 52, 48, 60, 65, 58, 72, 80, 75, 85].map((h, i) => (
                        <div key={i} className="w-full relative group">
                            <div
                                className={cn(
                                    "w-full rounded-t-lg transition-all duration-500 hover:opacity-80",
                                    i >= 6 ? "bg-emerald-500/20 border-t border-x border-emerald-500/50 dashed-border" : "bg-indigo-600"
                                )}
                                style={{ height: `${h}%` }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {i >= 6 ? "Prév: " : "Réel: "} {(h * 0.5).toFixed(1)}M
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-slate-500 uppercase font-bold tracking-wider">
                    <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
                    <span className="text-emerald-500">Juil</span><span className="text-emerald-500">Aoû</span><span className="text-emerald-500">Sep</span><span className="text-emerald-500">Oct</span><span className="text-emerald-500">Nov</span><span className="text-emerald-500">Déc</span>
                </div>
            </div>
        </div>
    );
}

function KPIWidget({ title, value, trend, good, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all">
            <div className="flex justify-between items-start mb-2">
                <div className={cn("p-2 rounded-lg", `bg-${color}-500/10 text-${color}-400`)}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5",
                    good ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                )}>
                    {good ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </span>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
            <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
    );
}
