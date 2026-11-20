"use client";

import { useState, useCallback } from "react";
import {
    Calculator, TrendingDown, TrendingUp, AlertTriangle,
    CheckCircle2, ChevronRight, Loader2, Info, PlusCircle, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LigneAjustement {
    id: string;
    code: string;
    libelle: string;
    type: string;
    montant: number;
    motif: string;
    referenceLegale: string;
}

interface LiquidationIS {
    pays: string;
    exercice: number;
    resultatComptable: number;
    totalReintegrations: number;
    reintegrations: LigneAjustement[];
    totalDeductions: number;
    deductions: LigneAjustement[];
    resultatFiscalAvantDeficit: number;
    deficitsImputes: number;
    resultatFiscalNetImposable: number;
    tauxISApplique: number;
    isBrut: number;
    impotMinimumForfaitaire: number;
    minimumApplique: boolean;
    isExigible: number;
    acomptesVerses: number;
    soldeDuOuCredit: number;
    referenceLegaleIS: string;
}

const f = (n: number) => Math.abs(n).toLocaleString("fr-FR") + " F";
const pct = (n: number) => `${(n * 100).toFixed(1)} %`;

export default function ResultatFiscalPage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ liquidation: LiquidationIS; caHT: number; nbAjustAuto: number; avertissement?: string } | null>(null);

    const analyser = useCallback(async () => {
        if (!clientId.trim()) { setError("Veuillez saisir un identifiant client."); return; }
        setLoading(true); setError(""); setResult(null);
        try {
            const r = await fetch(`/api/fiscalite/resultat-fiscal?clientId=${clientId}&exercice=${exercice}`);
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Erreur serveur");
            setResult({
                liquidation: data.liquidation,
                caHT: data.chiffreAffairesHT,
                nbAjustAuto: data.nbAjustementsAutomatiques,
                avertissement: data.avertissement,
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur lors de la liquidation");
        } finally {
            setLoading(false);
        }
    }, [clientId, exercice]);

    const liq = result?.liquidation;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-primary" />
                    Tableau 7 — Résultat Fiscal & Liquidation IS
                </h2>
                <p className="page-subtitle">
                    Passage du résultat comptable au résultat fiscal : réintégrations, déductions, déficits reportables.
                    Liquidation de l'Impôt sur les Sociétés et de l'Impôt Minimum Forfaitaire (IMF).
                </p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Paramètres</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ID Client</label>
                        <input value={clientId} onChange={e => setClientId(e.target.value)}
                            placeholder="Identifiant MongoDB du client..."
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Exercice</label>
                        <input type="number" value={exercice} onChange={e => setExercice(Number(e.target.value))}
                            min={2020} max={2030}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white text-sm" />
                    </div>
                </div>
                <button onClick={analyser} disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                    {loading ? "Calcul en cours..." : "Calculer la liquidation IS"}
                </button>
                {error && (
                    <div className="flex gap-2 items-start rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
                    </div>
                )}
                {result?.avertissement && (
                    <div className="flex gap-2 items-start rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" /><span>{result.avertissement}</span>
                    </div>
                )}
            </div>

            {liq && (
                <div className="space-y-6">
                    {/* Tableau de passage résultat comptable → fiscal */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white">Passage du Résultat Comptable au Résultat Fiscal</h3>
                            <span className="text-xs text-slate-400">{result?.nbAjustAuto} ajustement(s) automatique(s) détecté(s)</span>
                        </div>
                        <div className="p-6 space-y-2">
                            {[
                                { label: "Résultat comptable avant impôt", val: liq.resultatComptable, style: "text-white font-semibold" },
                                { label: `(+) Total réintégrations fiscales (${liq.reintegrations.length})`, val: liq.totalReintegrations, style: "text-rose-300" },
                                { label: `(-) Total déductions fiscales (${liq.deductions.length})`, val: -liq.totalDeductions, style: "text-emerald-300" },
                                { label: "= Résultat fiscal avant imputation déficits", val: liq.resultatFiscalAvantDeficit, style: "text-white font-bold border-t border-white/10 pt-2" },
                                { label: "(-) Déficits antérieurs imputés", val: -liq.deficitsImputes, style: "text-blue-300" },
                                { label: "= Résultat Fiscal Net Imposable (Base IS)", val: liq.resultatFiscalNetImposable, style: "text-primary font-black text-lg border-t border-white/10 pt-2" },
                            ].map(row => (
                                <div key={row.label} className={cn("flex justify-between items-center py-1 text-sm", row.style)}>
                                    <span>{row.label}</span>
                                    <span className="font-mono">{row.val < 0 ? "-" : ""}{f(row.val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Réintégrations détaillées */}
                    {liq.reintegrations.length > 0 && (
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                            <h3 className="font-bold text-rose-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Réintégrations Fiscales ({liq.reintegrations.length})
                            </h3>
                            <div className="space-y-2">
                                {liq.reintegrations.map((r) => (
                                    <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl bg-rose-500/5 border border-rose-500/10 p-3">
                                        <div>
                                            <div className="text-sm font-medium text-rose-200">{r.libelle}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{r.motif}</div>
                                            <div className="text-xs text-rose-400/70 mt-0.5">{r.referenceLegale}</div>
                                        </div>
                                        <div className="text-rose-300 font-mono font-bold whitespace-nowrap">+ {f(r.montant)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Déductions */}
                    {liq.deductions.length > 0 && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                            <h3 className="font-bold text-emerald-300 flex items-center gap-2">
                                <TrendingDown className="w-4 h-4" />
                                Déductions Fiscales ({liq.deductions.length})
                            </h3>
                            <div className="space-y-2">
                                {liq.deductions.map((d) => (
                                    <div key={d.id} className="flex items-start justify-between gap-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3">
                                        <div>
                                            <div className="text-sm font-medium text-emerald-200">{d.libelle}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{d.motif}</div>
                                        </div>
                                        <div className="text-emerald-300 font-mono font-bold whitespace-nowrap">- {f(d.montant)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Liquidation finale */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                            <h3 className="font-bold text-white">Liquidation de l'Impôt sur les Sociétés</h3>
                            <p className="text-xs text-slate-400 mt-1">{liq.referenceLegaleIS}</p>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                {[
                                    { label: "IS Calculé (barème)", val: f(liq.isBrut), sub: `Taux ${pct(liq.tauxISApplique)}`, color: "text-white" },
                                    { label: "IMF (minimum légal)", val: f(liq.impotMinimumForfaitaire), sub: liq.minimumApplique ? "⚡ Minimum appliqué" : "Non appliqué", color: liq.minimumApplique ? "text-amber-400" : "text-slate-400" },
                                    { label: "IS Exigible (Dû)", val: f(liq.isExigible), sub: `max(IS, IMF)`, color: "text-primary font-black" },
                                    { label: liq.soldeDuOuCredit >= 0 ? "Solde Dû au Trésor" : "Crédit IS restituable", val: f(Math.abs(liq.soldeDuOuCredit)), sub: `Après ${f(liq.acomptesVerses)} d'acomptes`, color: liq.soldeDuOuCredit >= 0 ? "text-rose-400" : "text-emerald-400" },
                                ].map(item => (
                                    <div key={item.label} className="bg-slate-800/40 border border-white/5 rounded-xl p-4">
                                        <div className="text-xs text-slate-400">{item.label}</div>
                                        <div className={cn("text-lg font-black mt-2 font-mono", item.color)}>{item.val}</div>
                                        <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
