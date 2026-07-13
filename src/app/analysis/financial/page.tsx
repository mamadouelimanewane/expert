"use client";

import { useState, useEffect, useCallback } from "react";
import {
    FilePieChart,
    FileText,
    Layers,
    Divide,
    Droplets,
    Scale,
    Target,
    Loader2,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ratios {
    year: number;
    isProjected: boolean;
    ca: number;
    ebitda: number;
    netResult: number;
    totalBilan: number;
    equity: number;
    debt: number;
    netCash: number;
    bfr: number;
    netMargin: number | null;
    ebitdaMargin: number | null;
    roe: number | null;
    roeTrend: "up" | "down" | "stable";
    financialAutonomy: number | null;
    assetTurnover: number | null;
    equityMultiplier: number | null;
    bfrDays: number | null;
    cashToAssets: number | null;
}

interface DuPont {
    netMargin: number;
    assetTurnover: number;
    equityMultiplier: number;
    roe: number;
}

interface Altman {
    value: number;
    zone: "danger" | "grey" | "safe";
    isApproximation: boolean;
}

interface CashFlow {
    openingCash: number;
    ebitda: number;
    bfrChange: number;
    residual: number;
    closingCash: number;
    netChange: number;
    previousYear: number;
}

interface FinancialRatiosData {
    clients: { id: string; name: string }[];
    selectedClientId: string | null;
    client: { id: string; name: string } | null;
    ratios: Ratios | null;
    dupont: DuPont | null;
    altman: Altman | null;
    cashflow: CashFlow | null;
    narrative: string;
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });

export default function FinancialAnalysisPage() {
    const [activeTab, setActiveTab] = useState<"bilan" | "cashflow" | "advanced" | "rapport">("bilan");
    const [data, setData] = useState<FinancialRatiosData | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback((clientId?: string) => {
        setLoading(true);
        const url = clientId ? `/api/analysis/financial-ratios?clientId=${clientId}` : "/api/analysis/financial-ratios";
        fetch(url).then((r) => r.json()).then(setData).finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading || !data) {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
    }

    const { ratios, dupont, altman, cashflow, narrative } = data;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FilePieChart className="w-8 h-8 text-purple-400" />
                        Analyse Financière Avancée
                    </h2>
                    <p className="text-slate-400 mt-1">Diagnostic à partir des données réelles (FinancialData) : Bilan, Cash Flow, DuPont & Z-Score approché.</p>
                </div>

                <div className="flex gap-2 items-center">
                    {data.clients.length > 0 && (
                        <select
                            value={data.selectedClientId ?? ""}
                            onChange={(e) => load(e.target.value)}
                            className="px-4 py-3 bg-slate-800 border border-white/10 rounded-2xl text-xs text-white outline-none"
                        >
                            {data.clients.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {!ratios ? (
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 p-16 text-center">
                    <Info className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm max-w-xl mx-auto whitespace-pre-line">{narrative}</p>
                </div>
            ) : (
                <>
                    {/* KPI Overlays */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <RatioCard label="Autonomie Financière" value={ratios.financialAutonomy} unit="%" desc="Part des capitaux propres dans le total bilan." />
                        <RatioCard label="Rentabilité Nette" value={ratios.netMargin} unit="%" desc="Résultat net rapporté au chiffre d'affaires." />
                        <RatioCard label="Marge EBITDA" value={ratios.ebitdaMargin} unit="%" desc="EBITDA rapporté au chiffre d'affaires." />
                        <RatioCard label="BFR" value={ratios.bfrDays} unit="j de CA" desc="Besoin en fonds de roulement exprimé en jours de CA." />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-700 rounded-2xl w-fit flex-wrap">
                        <button onClick={() => setActiveTab("bilan")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "bilan" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                            <Layers className="w-3 h-3 inline mr-2" /> Structure Bilan
                        </button>
                        <button onClick={() => setActiveTab("cashflow")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "cashflow" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                            <Droplets className="w-3 h-3 inline mr-2" /> Cash Flow
                        </button>
                        <button onClick={() => setActiveTab("advanced")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "advanced" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                            <Divide className="w-3 h-3 inline mr-2" /> DuPont & Z-Score
                        </button>
                        <button onClick={() => setActiveTab("rapport")} className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all", activeTab === "rapport" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                            <FileText className="w-3 h-3 inline mr-2" /> Rapport
                        </button>
                    </div>

                    <div className="min-h-[300px]">
                        {/* === TAB 1: BILAN === */}
                        {activeTab === "bilan" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-slate-700/50 bg-slate-900/40">
                                    <div className="flex justify-between items-center mb-10">
                                        <h3 className="font-bold text-white text-lg flex items-center gap-3">Structure Actif / Passif — Exercice {ratios.year}{ratios.isProjected ? " (projeté)" : ""}</h3>
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-white/5">TOTAL BILAN {fmt(ratios.totalBilan)} FCFA</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-16 h-64">
                                        {/* ACTIF - only real breakdown available: trésorerie vs reste */}
                                        <div className="flex flex-col h-full border-l-4 border-indigo-500/20 pl-6 relative">
                                            <div className="absolute -left-[11px] top-0 w-5 h-5 bg-indigo-500 rounded-full border-4 border-slate-900" />
                                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Actif</h4>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="flex-grow-[8] bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-center">
                                                    <span className="text-[10px] font-black text-indigo-300 uppercase">Autres Actifs (non détaillés)</span>
                                                    <span className="text-2xl font-black text-white">{fmt(ratios.totalBilan - ratios.netCash)}</span>
                                                </div>
                                                <div className="flex-grow-[2] bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 flex flex-col justify-center">
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase">Trésorerie Nette</span>
                                                    <span className="text-sm font-black text-white">{fmt(ratios.netCash)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* PASSIF */}
                                        <div className="flex flex-col h-full border-r-4 border-purple-500/20 pr-6 relative items-end">
                                            <div className="absolute -right-[11px] top-0 w-5 h-5 bg-purple-500 rounded-full border-4 border-slate-900" />
                                            <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4">Passif</h4>
                                            <div className="flex-1 flex flex-col gap-2 w-full">
                                                <div className="flex-grow-[6] bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 flex flex-col justify-center items-end">
                                                    <span className="text-[10px] font-black text-purple-300 uppercase">Capitaux Propres</span>
                                                    <span className="text-2xl font-black text-white">{fmt(ratios.equity)}</span>
                                                </div>
                                                <div className="flex-grow-[4] bg-slate-700/30 border border-slate-600/30 rounded-xl p-3 flex flex-col justify-center items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Dettes (Total Bilan - CP)</span>
                                                    <span className="text-lg font-black text-white">{fmt(ratios.debt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
                                        Le modèle de données ne distingue pas actif immobilisé / circulant ni dettes court terme / long terme : seuls la trésorerie nette et les capitaux propres sont isolés, le reste est présenté en agrégat.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="glass-card p-8 rounded-[40px] border border-purple-500/20 bg-gradient-to-br from-slate-900 to-purple-900/20 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />
                                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">{ratios.roe !== null ? `${ratios.roe}%` : "—"}</h3>
                                        <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-6">ROE (Return on Equity)</p>
                                        <div className="space-y-3 text-left">
                                            <ScoreRow label="Autonomie" score={ratios.financialAutonomy} />
                                            <ScoreRow label="Rentabilité" score={ratios.netMargin} />
                                            <ScoreRow label="Tréso./Actif" score={ratios.cashToAssets} />
                                        </div>
                                    </div>

                                    <div className="glass-card p-6 rounded-3xl border border-slate-700/50 bg-slate-900/40">
                                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase mb-4">
                                            <Target className="w-4 h-4 text-emerald-400" /> Constats
                                        </h4>
                                        <ul className="space-y-3">
                                            {ratios.financialAutonomy !== null && (
                                                <li className="text-xs text-slate-300 flex gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", ratios.financialAutonomy >= 30 ? "bg-emerald-400" : "bg-amber-400")} />
                                                    {ratios.financialAutonomy >= 30 ? "Autonomie financière solide (capitaux propres ≥ 30% du bilan)." : "Autonomie financière faible : dépendance importante aux dettes."}
                                                </li>
                                            )}
                                            {ratios.bfrDays !== null && (
                                                <li className="text-xs text-slate-300 flex gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", ratios.bfrDays <= 60 ? "bg-emerald-400" : "bg-amber-400")} />
                                                    {ratios.bfrDays <= 60 ? `BFR maîtrisé (${ratios.bfrDays} jours de CA).` : `BFR élevé (${ratios.bfrDays} jours de CA) : à surveiller.`}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* === TAB 2: CASH FLOW === */}
                        {activeTab === "cashflow" && (
                            <div className="glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-white/5 bg-slate-900/40">
                                {!cashflow ? (
                                    <div className="text-center py-16">
                                        <Info className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                                        <p className="text-slate-400 text-sm">Un seul exercice est disponible pour ce client. Ajoutez les données de l'exercice précédent pour générer un pont de trésorerie.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">Pont de Trésorerie {cashflow.previousYear} → {ratios.year}</h3>
                                                <p className="text-sm text-slate-500">EBITDA et variation du BFR réels ; le reste (investissement/financement) est présenté en résiduel, non détaillé dans le modèle de données.</p>
                                            </div>
                                            <div className={cn("px-4 py-2 bg-slate-800 rounded-xl text-xs font-mono border", cashflow.netChange >= 0 ? "text-emerald-400 border-emerald-500/20" : "text-rose-400 border-rose-500/20")}>
                                                Variation nette: {cashflow.netChange >= 0 ? "+" : ""}{fmt(cashflow.netChange)} FCFA
                                            </div>
                                        </div>

                                        {(() => {
                                            const maxAbs = Math.max(
                                                Math.abs(cashflow.openingCash),
                                                Math.abs(cashflow.ebitda),
                                                Math.abs(cashflow.bfrChange),
                                                Math.abs(cashflow.residual),
                                                Math.abs(cashflow.closingCash),
                                                1
                                            );
                                            return (
                                                <div className="grid grid-cols-5 gap-4">
                                                    <CashBar label={`Tréso. ${cashflow.previousYear}`} value={cashflow.openingCash} kind="neutral" maxAbs={maxAbs} />
                                                    <CashBar label="EBITDA" value={cashflow.ebitda} kind="positive" maxAbs={maxAbs} />
                                                    <CashBar label="Δ BFR" value={cashflow.bfrChange} kind={cashflow.bfrChange >= 0 ? "positive" : "negative"} maxAbs={maxAbs} />
                                                    <CashBar label="Autres flux (résiduel)" value={cashflow.residual} kind={cashflow.residual >= 0 ? "positive" : "negative"} maxAbs={maxAbs} />
                                                    <CashBar label={`Tréso. ${ratios.year}`} value={cashflow.closingCash} kind="final" maxAbs={maxAbs} />
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        )}

                        {/* === TAB 3: DUPONT & ALTMAN === */}
                        {activeTab === "advanced" && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-white/5 bg-slate-900/40">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Divide className="w-6 h-6 text-indigo-400" />
                                        <h3 className="text-xl font-bold text-white">Décomposition DuPont (ROE)</h3>
                                    </div>

                                    {!dupont ? (
                                        <p className="text-slate-500 text-sm text-center py-8">Données insuffisantes pour calculer la décomposition DuPont.</p>
                                    ) : (
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 text-center w-full">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Return On Equity (ROE)</p>
                                                <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">{dupont.roe}%</p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 w-full">
                                                <DuPontCard label="Marge Nette" value={`${dupont.netMargin}%`} desc="Efficacité Opérationnelle" color="text-emerald-400" />
                                                <div className="flex items-center justify-center text-slate-600 font-bold">×</div>
                                                <DuPontCard label="Rotation Actif" value={`${dupont.assetTurnover}`} desc="CA / Total Bilan" color="text-amber-400" />
                                                <div className="col-span-3 flex items-center justify-center text-slate-600 font-bold my-[-10px]">×</div>
                                                <div className="col-span-3 flex justify-center">
                                                    <DuPontCard label="Levier Financier" value={`${dupont.equityMultiplier}`} desc="Total Bilan / Capitaux Propres" color="text-purple-400" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="glass-card rounded-[40px] p-4 sm:p-6 lg:p-10 border border-white/5 bg-slate-900/40 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Scale className="w-6 h-6 text-emerald-400" />
                                        <h3 className="text-xl font-bold text-white">Z-Score Approché (Défaillance)</h3>
                                    </div>

                                    {!altman ? (
                                        <p className="text-slate-500 text-sm text-center py-8">Données insuffisantes pour estimer le Z-Score.</p>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <span className={cn(
                                                "text-2xl sm:text-3xl lg:text-5xl font-black",
                                                altman.zone === "safe" ? "text-emerald-400" : altman.zone === "grey" ? "text-amber-400" : "text-rose-400"
                                            )}>{altman.value}</span>
                                            <p className={cn(
                                                "text-[10px] font-bold uppercase mt-1",
                                                altman.zone === "safe" ? "text-emerald-400" : altman.zone === "grey" ? "text-amber-400" : "text-rose-400"
                                            )}>
                                                {altman.zone === "safe" ? "Zone Sûre" : altman.zone === "grey" ? "Zone Grise" : "Zone de Danger"}
                                            </p>

                                            <p className="text-center text-xs text-amber-300/80 max-w-sm leading-relaxed mt-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                                Score approché : le modèle FinancialData ne fournit pas la répartition actif circulant / dettes court terme ni l'historique des résultats reportés. Les composantes utilisent trésorerie+BFR, résultat net et EBITDA en proxys.
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 w-full mt-8">
                                                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex flex-col items-center">
                                                    <span className="text-xs text-slate-500 uppercase">Zone de Danger</span>
                                                    <span className="font-bold text-rose-400">Z &lt; 1.8</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 flex flex-col items-center">
                                                    <span className="text-xs text-slate-500 uppercase">Zone Grise</span>
                                                    <span className="font-bold text-amber-400">1.8 - 2.99</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* === TAB 4: REPORT === */}
                        {activeTab === "rapport" && (
                            <div className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/40 h-[350px] sm:h-[450px] lg:h-[600px] flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                                        <FileText className="w-5 h-5 text-purple-400" />
                                        Rapport Calculé à partir des Données Réelles
                                    </h3>
                                </div>
                                <div className="flex-1 bg-slate-950/50 rounded-2xl p-6 border border-white/5 font-mono text-sm text-slate-300 leading-loose overflow-y-auto whitespace-pre-line shadow-inner">
                                    {narrative}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// === Sub Components ===

function RatioCard({ label, value, unit, desc }: { label: string; value: number | null; unit: string; desc: string }) {
    return (
        <div className="glass-card p-5 rounded-3xl border border-slate-700/50 bg-slate-900/30">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-2xl font-black text-white mb-1">{value !== null ? `${value}${unit === "%" ? "%" : ""}` : "—"}{unit !== "%" && value !== null ? <span className="text-xs text-slate-500 ml-1">{unit}</span> : null}</div>
            <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
        </div>
    );
}

function ScoreRow({ label, score }: { label: string; score: number | null }) {
    const clamped = score !== null ? Math.max(0, Math.min(100, score)) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 w-20 uppercase">{label}</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${clamped}%` }} />
            </div>
            <span className="text-[10px] font-bold text-white w-10 text-right">{score !== null ? `${score}%` : "—"}</span>
        </div>
    );
}

function CashBar({ label, value, kind, maxAbs }: { label: string; value: number; kind: "neutral" | "positive" | "negative" | "final"; maxAbs: number }) {
    let colorClass = "bg-slate-500";
    if (kind === "positive") colorClass = "bg-emerald-500";
    if (kind === "negative") colorClass = "bg-rose-500";
    if (kind === "final") colorClass = "bg-blue-500";
    const height = Math.min(100, Math.max(6, (Math.abs(value) / maxAbs) * 100));
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="w-full h-32 flex items-end">
                <div className={cn("w-full rounded-t-lg", colorClass)} style={{ height: `${height}%`, opacity: 0.85 }} />
            </div>
            <span className={cn("text-xs font-black", value >= 0 ? "text-white" : "text-rose-300")}>{value >= 0 ? "+" : ""}{fmt(value)}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-center">{label}</span>
        </div>
    );
}

function DuPontCard({ label, value, desc, color }: { label: string; value: string; desc: string; color: string }) {
    return (
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center flex-1 min-w-[120px]">
            <span className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</span>
            <span className={cn("text-2xl font-black mb-1", color)}>{value}</span>
            <span className="text-[9px] text-slate-600 leading-tight">{desc}</span>
        </div>
    );
}
