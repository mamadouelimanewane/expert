"use client";

import { useState, useCallback } from "react";
import {
    CheckCircle2, AlertTriangle, XCircle, Download, RefreshCw,
    TrendingUp, TrendingDown, FileSearch, Scale, Loader2, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnomalieCadrage {
    code: string;
    gravite: "CRITIQUE" | "MAJEURE" | "MINEURE";
    libelle: string;
    description: string;
    ecart: number;
    recommandationExpert: string;
}

interface SyntheseCadrage {
    tauxTVANormal: number;
    caComptableClasse7: number;
    caTotalDeclareTVA: number;
    ecartChiffreAffaires: number;
    tauxCadrageCA: number;
    tvaCollecteeComptable4431: number;
    tvaCollecteeDeclareeCumul: number;
    ecartTVACollectee: number;
    tvaDeductibleComptable445: number;
    tvaDeductibleDeclareeCumul: number;
    ecartTVADeductible: number;
    prorata: {
        estEntrepriseMixte: boolean;
        tauxProrataProvisoire: number;
        tauxProrataDefinitif: number;
        variationProrata: number;
        regularisationTVAADeduireOuReverser: number;
    };
    anomalies: AnomalieCadrage[];
    statutCadrage: "CONFORME" | "A_JUSTIFIER" | "RISQUE_REDRESSEMENT_ELEVE";
    noteSynthese: string;
}

const f = (n: number) => Math.abs(n).toLocaleString("fr-FR") + " F";

const STATUT_CONFIG = {
    CONFORME: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2, label: "Conforme" },
    A_JUSTIFIER: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: AlertTriangle, label: "À justifier" },
    RISQUE_REDRESSEMENT_ELEVE: { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icon: XCircle, label: "Risque de redressement élevé" },
};

const GRAVITE_CONFIG = {
    CRITIQUE: "bg-rose-600/20 text-rose-200 border-rose-500/40",
    MAJEURE: "bg-amber-500/20 text-amber-200 border-amber-500/40",
    MINEURE: "bg-blue-500/20 text-blue-200 border-blue-500/40",
};

export default function CadrageTVAPage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<{ synthese: SyntheseCadrage; nbDeclarations: number } | null>(null);

    const analyser = useCallback(async () => {
        if (!clientId.trim()) { setError("Veuillez saisir un identifiant client."); return; }
        setLoading(true); setError(""); setResult(null);
        try {
            const r = await fetch(`/api/fiscalite/cadrage-tva?clientId=${clientId}&exercice=${exercice}`);
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Erreur serveur");
            setResult({ synthese: data.synthese, nbDeclarations: data.nbDeclarationsAnalysees });
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur lors de l'analyse");
        } finally {
            setLoading(false);
        }
    }, [clientId, exercice]);

    const synthese = result?.synthese;
    const statut = synthese ? STATUT_CONFIG[synthese.statutCadrage] : null;
    const StatutIcon = statut?.icon;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Scale className="w-6 h-6 text-primary" />
                    Cadrage TVA — Rapprochement Grand Livre / Déclarations
                </h2>
                <p className="page-subtitle">
                    Croisement automatique du chiffre d'affaires comptable (Classe 7) avec les 12 déclarations mensuelles de TVA.
                    Détecte les écarts exposant l'entreprise à un redressement fiscal.
                </p>
            </div>

            {/* Paramètres */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Paramètres d'analyse</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">ID Client</label>
                        <input
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                            placeholder="Identifiant MongoDB du client..."
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Exercice</label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={e => setExercice(Number(e.target.value))}
                            min={2020} max={2030}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white text-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={analyser}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
                    {loading ? "Analyse en cours..." : "Lancer le cadrage TVA"}
                </button>
                {error && (
                    <div className="flex gap-2 items-start rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Résultats */}
            {synthese && statut && StatutIcon && (
                <div className="space-y-6">
                    {/* Verdict */}
                    <div className={cn("flex items-center gap-4 rounded-2xl border p-5", statut.bg)}>
                        <StatutIcon className={cn("w-8 h-8 shrink-0", statut.color)} />
                        <div>
                            <div className={cn("font-bold text-lg", statut.color)}>{statut.label}</div>
                            <p className="text-sm text-slate-300 mt-1">{synthese.noteSynthese}</p>
                        </div>
                        <div className="ml-auto text-right">
                            <div className="text-xs text-slate-400">Taux de cadrage CA</div>
                            <div className={cn("text-2xl font-black", synthese.tauxCadrageCA >= 99 ? "text-emerald-400" : synthese.tauxCadrageCA >= 95 ? "text-amber-400" : "text-rose-400")}>
                                {synthese.tauxCadrageCA.toFixed(1)} %
                            </div>
                        </div>
                    </div>

                    {/* Tableau de rapprochement */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5">
                            <h3 className="font-bold text-white">Tableau de rapprochement</h3>
                            <p className="text-xs text-slate-400 mt-1">{result?.nbDeclarations} déclarations analysées — Exercice {exercice}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 text-xs text-slate-400 uppercase">
                                        <th className="text-left px-6 py-3">Rubrique</th>
                                        <th className="text-right px-4 py-3">Comptabilité</th>
                                        <th className="text-right px-4 py-3">Déclarations TVA</th>
                                        <th className="text-right px-6 py-3">Écart</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        {
                                            label: "Chiffre d'Affaires (HT)",
                                            compta: synthese.caComptableClasse7,
                                            declare: synthese.caTotalDeclareTVA,
                                            ecart: synthese.ecartChiffreAffaires,
                                        },
                                        {
                                            label: "TVA Collectée (c/ 4431)",
                                            compta: synthese.tvaCollecteeComptable4431,
                                            declare: synthese.tvaCollecteeDeclareeCumul,
                                            ecart: synthese.ecartTVACollectee,
                                        },
                                        {
                                            label: "TVA Déductible (c/ 445)",
                                            compta: synthese.tvaDeductibleComptable445,
                                            declare: synthese.tvaDeductibleDeclareeCumul,
                                            ecart: synthese.ecartTVADeductible,
                                        },
                                    ].map(row => (
                                        <tr key={row.label} className="hover:bg-white/2 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">{row.label}</td>
                                            <td className="text-right px-4 py-4 text-slate-300 font-mono">{f(row.compta)}</td>
                                            <td className="text-right px-4 py-4 text-slate-300 font-mono">{f(row.declare)}</td>
                                            <td className={cn("text-right px-6 py-4 font-mono font-bold", row.ecart === 0 ? "text-emerald-400" : Math.abs(row.ecart) > 1_000_000 ? "text-rose-400" : "text-amber-400")}>
                                                {row.ecart === 0 ? "✓ 0 F" : `${row.ecart > 0 ? "+" : "-"} ${f(row.ecart)}`}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Prorata TVA mixte */}
                    {synthese.prorata.estEntrepriseMixte && (
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5 space-y-3">
                            <h3 className="font-bold text-violet-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Prorata de TVA — Entreprise Mixte
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                {[
                                    { label: "Prorata provisoire", val: `${synthese.prorata.tauxProrataProvisoire} %` },
                                    { label: "Prorata définitif", val: `${synthese.prorata.tauxProrataDefinitif} %` },
                                    { label: "Variation", val: `${synthese.prorata.variationProrata > 0 ? "+" : ""}${synthese.prorata.variationProrata} pts` },
                                    {
                                        label: synthese.prorata.regularisationTVAADeduireOuReverser < 0 ? "Reversement TVA" : "Déduction complémentaire",
                                        val: f(Math.abs(synthese.prorata.regularisationTVAADeduireOuReverser)),
                                    },
                                ].map(item => (
                                    <div key={item.label} className="bg-slate-900/40 rounded-xl p-3">
                                        <div className="text-xs text-slate-400">{item.label}</div>
                                        <div className="text-lg font-bold text-violet-300 mt-1">{item.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Anomalies */}
                    {synthese.anomalies.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-white">Anomalies détectées ({synthese.anomalies.length})</h3>
                            {synthese.anomalies.map((anomalie, i) => (
                                <div key={i} className={cn("rounded-2xl border p-5 space-y-2", GRAVITE_CONFIG[anomalie.gravite])}>
                                    <div className="flex items-center gap-3">
                                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold border", GRAVITE_CONFIG[anomalie.gravite])}>
                                            {anomalie.gravite}
                                        </span>
                                        <span className="font-semibold">{anomalie.libelle}</span>
                                        <span className="ml-auto font-mono font-bold">{anomalie.ecart > 0 ? "+" : ""}{f(anomalie.ecart)}</span>
                                    </div>
                                    <p className="text-sm opacity-80">{anomalie.description}</p>
                                    <div className="flex items-start gap-2 text-xs mt-2 opacity-70">
                                        <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span>{anomalie.recommandationExpert}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
