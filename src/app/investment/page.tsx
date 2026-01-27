"use client";

import { useState } from "react";
import {
    Gem,
    TrendingUp,
    Target,
    ShieldCheck,
    Zap,
    ArrowRight,
    Download,
    BarChart,
    PieChart,
    Activity,
    Briefcase,
    Coins,
    History,
    Rocket,
    Search,
    ChevronRight,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValuationMetric {
    label: string;
    value: string;
    weight: number;
}

const SECTOR_MULTIPLES: Record<string, number> = {
    "Distribution / Retail": 5.5,
    "Services B2B": 4.2,
    "Industrie": 6.8,
    "Tech / Startup": 12.5,
    "Agro-industrie": 7.2
};

export default function InvestmentValuationPage() {
    const [sector, setSector] = useState("Distribution / Retail");
    const [ebitda, setEbitda] = useState(150000000); // 150M FCFA
    const [debt, setDebt] = useState(45000000); // 45M FCFA
    const [cash, setCash] = useState(12000000); // 12M FCFA
    const [isCalculating, setIsCalculating] = useState(false);

    // Computed Valuation
    const multiple = SECTOR_MULTIPLES[sector] || 5;
    const enterpriseValue = ebitda * multiple;
    const equityValue = enterpriseValue - debt + cash;

    const runValuationIA = () => {
        setIsCalculating(true);
        setTimeout(() => setIsCalculating(false), 1500);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Rocket className="w-8 h-8 text-indigo-400" />
                        Valorisation IA & Investment Readiness
                    </h2>
                    <p className="text-slate-400 mt-1">Outil de préparation aux levées de fonds, fusions-acquisitions et évaluation de la valeur d'entreprise.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={runValuationIA}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] transition-all"
                    >
                        <Zap className="w-4 h-4 fill-current" /> {isCalculating ? "Calcul des Multiples OHADA..." : "Lancer Valorisation IA"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Input & Leverages */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50 space-y-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Coins className="w-5 h-5 text-indigo-400" />
                            Données de Valorisation
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 ml-1">Secteur d'Activité</label>
                                <select
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                                >
                                    {Object.keys(SECTOR_MULTIPLES).map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            <DataInput label="EBITDA / EBE (FCFA)" value={ebitda} onChange={setEbitda} />
                            <DataInput label="Dette Nette (FCFA)" value={debt} onChange={setDebt} />
                            <DataInput label="Trésorerie Disponible (FCFA)" value={cash} onChange={setCash} />
                        </div>

                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <div className="flex justify-between items-center text-xs font-bold text-indigo-400 mb-2">
                                <span>Multiple Sectoriel OHADA</span>
                                <span>x {multiple}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                "Basé sur les dernières transactions observées en zone UEMOA ({sector})."
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Investment Readiness Score</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl font-bold text-white">84<span className="text-lg text-slate-600">/100</span></div>
                            <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">INVESTOR READY</div>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[84%]" />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 italic">"Votre structure financière et votre conformité juridique sont excellentes pour une due-diligence."</p>
                    </div>
                </div>

                {/* Right: Visualization & Deal Room */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Value Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-8 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/20 to-slate-950 overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                <History className="w-32 h-32 text-white" />
                            </div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Valeur d'Entreprise (EV)</p>
                            <h4 className="text-4xl font-bold text-white mb-2">
                                {(enterpriseValue / 1000000).toLocaleString()} <span className="text-sm">M</span>
                            </h4>
                            <p className="text-xs text-slate-500">FCFA • Estimation par multiples</p>
                        </div>

                        <div className="glass-card p-8 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/20 to-slate-950 overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                                <Gem className="w-32 h-32 text-white" />
                            </div>
                            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Valeur des Capitaux Propres</p>
                            <h4 className="text-4xl font-bold text-white mb-2">
                                {(equityValue / 1000000).toLocaleString()} <span className="text-sm">M</span>
                            </h4>
                            <p className="text-xs text-slate-500">FCFA • Valeur pour les actionnaires</p>
                        </div>
                    </div>

                    {/* Deal Room / Data Room Preview */}
                    <div className="glass-card rounded-3xl border border-slate-700/50 bg-slate-900/30 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="font-bold text-white flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-amber-500" />
                                VDR (Virtual Data Room) & Due Diligence
                            </h3>
                            <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg border border-slate-700">GÉRER ACCÈS INVESTISSEURS</button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: "Dossier Financier & Fiscal", status: "complete", count: 12 },
                                { label: "Dossier Juridique & Statuts", status: "complete", count: 8 },
                                { label: "Contrats Majeurs Clients", status: "warning", count: 4 },
                                { label: "Propriété Intellectuelle (OAPI)", status: "pending", count: 2 },
                            ].map((folder, i) => (
                                <div key={i} className="p-4 bg-slate-800/20 border border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-800/40 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            folder.status === "complete" ? "bg-emerald-500/10 text-emerald-500" :
                                                folder.status === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-slate-700 text-slate-500"
                                        )}>
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{folder.label}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{folder.count} DOCUMENTS</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Equity Cap Table Simulation */}
                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/30">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            Cap Table (Répartition de l'Actionnariat)
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: "Fondateur Principal", share: 55, value: "453M" },
                                { name: "Associé Historique", share: 30, value: "247M" },
                                { name: "Stock Options (ESOP)", share: 5, value: "41M" },
                                { name: "Pool Investissement (Libre)", share: 10, value: "82M" },
                            ].map((owner, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="w-full max-w-[120px] text-xs font-medium text-slate-400">{owner.name}</span>
                                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${owner.share}%` }} />
                                    </div>
                                    <span className="text-xs font-bold text-white w-10">{owner.share}%</span>
                                    <span className="text-xs font-mono font-bold text-indigo-400 w-16">{owner.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Simuler une nouvelle levée de fonds (Série A)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5 ml-1">{label}</label>
            <input
                type="number"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono focus:border-indigo-500 outline-none transition-all"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            />
        </div>
    );
}
