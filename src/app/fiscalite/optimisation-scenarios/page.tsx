"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, ShieldAlert, CheckCircle2, Sliders, ArrowRight, RefreshCw } from "lucide-react";

export default function OptimisationISScenariosPage() {
    const [pays, setPays] = useState("SN");
    const [exercice, setExercice] = useState(2024);
    const [ca, setCa] = useState(250000000);
    const [resultatComptable, setResultatComptable] = useState(35000000);
    const [surcroitAmort, setSurcroitAmort] = useState(6000000);
    const [provisions, setProvisions] = useState(4000000);
    const [deficits, setDeficits] = useState(12000000);
    const [plusValues, setPlusValues] = useState(3000000);
    const [regimePME, setRegimePME] = useState(false);

    const [loading, setLoading] = useState(false);
    const [comparatif, setComparatif] = useState<any>(null);

    const lancerSimulation = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/fiscalite/optimisation-scenarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pays,
                    exercice: Number(exercice),
                    chiffreAffairesHT: Number(ca),
                    resultatComptable: Number(resultatComptable),
                    leviers: {
                        surcroitAmortissementEligible: Number(surcroitAmort),
                        provisionsDeductiblesJustifiees: Number(provisions),
                        deficitsAnterieursDisponibles: Number(deficits),
                        plusValuesReinvesties: Number(plusValues),
                        eligibleRegimePME: regimePME,
                        tauxPME: regimePME ? 20 : undefined,
                    },
                }),
            });
            const data = await res.json();
            if (data.comparatif) {
                setComparatif(data.comparatif);
            }
        } catch (err) {
            console.error("Erreur simulation scénarios IS:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Optimisation IS par Scénarios What-If</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Arbitrage multicritère entre déclaration spontanée, optimisation prudente et mobilisation active des déductions fiscales OHADA.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulaire des leviers fiscaux */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-primary" />
                        Leviers d'optimisation fiscale
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">Pays</label>
                                <select
                                    value={pays}
                                    onChange={(e) => setPays(e.target.value)}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                >
                                    <option value="SN">Sénégal (SN)</option>
                                    <option value="CI">Côte d'Ivoire (CI)</option>
                                    <option value="CM">Cameroun (CM)</option>
                                    <option value="BF">Burkina Faso (BF)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Exercice</label>
                                <input
                                    type="number"
                                    value={exercice}
                                    onChange={(e) => setExercice(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Chiffre d'affaires HT (Assiette IMF)</label>
                            <input
                                type="number"
                                value={ca}
                                onChange={(e) => setCa(Number(e.target.value))}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-muted-foreground">Résultat comptable avant impôt</label>
                            <input
                                type="number"
                                value={resultatComptable}
                                onChange={(e) => setResultatComptable(Number(e.target.value))}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-emerald-400"
                            />
                        </div>

                        <div className="border-t border-border pt-2 space-y-2.5">
                            <div>
                                <label className="text-muted-foreground">Surcroît amortissements accélérés (FCFA)</label>
                                <input
                                    type="number"
                                    value={surcroitAmort}
                                    onChange={(e) => setSurcroitAmort(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-muted-foreground">Provisions déductibles justifiées (FCFA)</label>
                                <input
                                    type="number"
                                    value={provisions}
                                    onChange={(e) => setProvisions(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-muted-foreground">Déficits reportables disponibles (FCFA)</label>
                                <input
                                    type="number"
                                    value={deficits}
                                    onChange={(e) => setDeficits(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-muted-foreground">Plus-values réinvesties (FCFA)</label>
                                <input
                                    type="number"
                                    value={plusValues}
                                    onChange={(e) => setPlusValues(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="regimePME"
                                    checked={regimePME}
                                    onChange={(e) => setRegimePME(e.target.checked)}
                                    className="rounded border-border"
                                />
                                <label htmlFor="regimePME" className="text-muted-foreground text-[11px]">
                                    Éligible régime d'incitation PME (Taux réduit)
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={lancerSimulation}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Simuler les 3 scénarios
                        </button>
                    </div>
                </div>

                {/* Comparatif des 3 scénarios */}
                <div className="md:col-span-2 space-y-4">
                    {comparatif ? (
                        <>
                            {/* Synthèse du conseil */}
                            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-2.5">
                                <TrendingUp className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-semibold text-amber-300">Recommandation Stratégique du Cabinet</div>
                                    <div className="mt-1 leading-relaxed text-[11px] text-foreground/90">
                                        {comparatif.syntheseConseil}
                                    </div>
                                </div>
                            </div>

                            {/* Cartes comparatives des scénarios */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Base */}
                                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">Scénario 1</span>
                                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">Base</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">Déclaration Spontanée</div>
                                    <div className="space-y-1 pt-1 text-xs">
                                        <div className="text-muted-foreground text-[11px]">IS Liquidé :</div>
                                        <div className="text-lg font-bold text-foreground">
                                            {comparatif.scenarios.base.isLiquide.toLocaleString("fr-FR")} F
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        Économie : 0 FCFA
                                    </div>
                                    <div className="pt-2 border-t border-border text-[10px] text-emerald-400">
                                        Risque contrôle : {comparatif.scenarios.base.scoreRisqueFiscal}/100
                                    </div>
                                </div>

                                {/* Prudent */}
                                <div className="p-4 rounded-xl border border-border bg-card/40 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">Scénario 2</span>
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Prudent</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">Optimisation Sécurisée</div>
                                    <div className="space-y-1 pt-1 text-xs">
                                        <div className="text-muted-foreground text-[11px]">IS Liquidé :</div>
                                        <div className="text-lg font-bold text-blue-400">
                                            {comparatif.scenarios.prudent.isLiquide.toLocaleString("fr-FR")} F
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-semibold">
                                        Gain : +{comparatif.scenarios.prudent.economieImpotVsBase.toLocaleString("fr-FR")} F
                                    </div>
                                    <div className="pt-2 border-t border-border text-[10px] text-blue-300">
                                        Risque contrôle : {comparatif.scenarios.prudent.scoreRisqueFiscal}/100
                                    </div>
                                </div>

                                {/* Optimisé Dynamique */}
                                <div className="p-4 rounded-xl border border-amber-500/40 bg-card/40 space-y-3 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl">
                                        MAX GAIN
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">Scénario 3</span>
                                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Dynamique</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">Mobilisation Totale</div>
                                    <div className="space-y-1 pt-1 text-xs">
                                        <div className="text-muted-foreground text-[11px]">IS Liquidé :</div>
                                        <div className="text-lg font-bold text-amber-400">
                                            {comparatif.scenarios.optimise.isLiquide.toLocaleString("fr-FR")} F
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-bold">
                                        Gain : +{comparatif.scenarios.optimise.economieImpotVsBase.toLocaleString("fr-FR")} F
                                    </div>
                                    <div className="pt-2 border-t border-border text-[10px] text-amber-300">
                                        Risque contrôle : {comparatif.scenarios.optimise.scoreRisqueFiscal}/100 ({comparatif.scenarios.optimise.niveauRisque})
                                    </div>
                                </div>
                            </div>

                            {/* Justifications légales */}
                            <div className="p-4 rounded-xl border border-border bg-card/40 space-y-2">
                                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    Arguments et fondements juridiques du Scénario Optimisé
                                </h3>
                                <div className="space-y-1 text-[11px] text-muted-foreground">
                                    {comparatif.scenarios.optimise.justificationsLegales.map((j: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <span className="text-emerald-400">•</span> {j}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <Sparkles className="w-8 h-8 text-amber-400/50 mb-3" />
                            <p>Renseignez les données d'exploitation et leviers pour projeter les 3 scénarios d'optimisation d'IS.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
