"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, User, RefreshCw } from "lucide-react";

export default function AnomalyDetectionPage() {
    const [loading, setLoading] = useState(false);
    const [matricule, setMatricule] = useState("EMP-042");
    const [nomEmploye, setNomEmploye] = useState("Kouassi Koffi");
    const [periode, setPeriode] = useState("2025-01");
    const [salaireBase, setSalaireBase] = useState(650000);
    const [primes, setPrimes] = useState(80000);
    const [cotisationsPatronales, setCotisationsPatronales] = useState(145000);
    const [cotisationsSalariales, setCotisationsSalariales] = useState(72000);
    const [retenueFiscale, setRetenueFiscale] = useState(55000);
    const [netAPayer, setNetAPayer] = useState(603000);
    const [historiqueBrut, setHistoriqueBrut] = useState("500000, 520000, 510000");

    const [resultat, setResultat] = useState<any>(null);

    const lancerAnalyse = async () => {
        setLoading(true);
        try {
            const histArray = historiqueBrut
                .split(",")
                .map((v) => Number(v.trim()))
                .filter((v) => !isNaN(v) && v > 0);

            const res = await fetch("/api/payroll/anomaly-detection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bulletin: {
                        matricule,
                        nomEmploye,
                        periode,
                        salaireBase: Number(salaireBase),
                        primes: Number(primes),
                        cotisationsPatronales: Number(cotisationsPatronales),
                        cotisationsSalariales: Number(cotisationsSalariales),
                        retenueFiscale: Number(retenueFiscale),
                        netAPayer: Number(netAPayer),
                        historiqueBrut: histArray,
                    },
                }),
            });
            const data = await res.json();
            if (data.resultat) {
                setResultat(data.resultat);
            }
        } catch (err) {
            console.error("Erreur lors de l'analyse:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    <h1 className="page-title text-2xl font-bold tracking-tight">Détecteur d'Anomalies de Paie IA</h1>
                </div>
                <p className="page-subtitle text-sm text-muted-foreground">
                    Contrôle prédictif automatisé des équilibres contractuels, fiscaux et sociaux (CCNI / OHADA).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulaire de saisie du bulletin */}
                <div className="md:col-span-1 bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
                        <User className="w-4 h-4 text-primary" />
                        Données du bulletin
                    </h2>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="text-muted-foreground">Matricule & Période</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <input
                                    type="text"
                                    value={matricule}
                                    onChange={(e) => setMatricule(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                    placeholder="Matricule"
                                />
                                <input
                                    type="text"
                                    value={periode}
                                    onChange={(e) => setPeriode(e.target.value)}
                                    className="px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                    placeholder="AAAA-MM"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Nom du collaborateur</label>
                            <input
                                type="text"
                                value={nomEmploye}
                                onChange={(e) => setNomEmploye(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-muted-foreground">Salaire de Base (FCFA)</label>
                            <input
                                type="number"
                                value={salaireBase}
                                onChange={(e) => setSalaireBase(Number(e.target.value))}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div>
                            <label className="text-muted-foreground">Primes & Indemnités (FCFA)</label>
                            <input
                                type="number"
                                value={primes}
                                onChange={(e) => setPrimes(Number(e.target.value))}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">Cotis. Patronales</label>
                                <input
                                    type="number"
                                    value={cotisationsPatronales}
                                    onChange={(e) => setCotisationsPatronales(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground">Cotis. Salariales</label>
                                <input
                                    type="number"
                                    value={cotisationsSalariales}
                                    onChange={(e) => setCotisationsSalariales(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-muted-foreground">Retenue Fiscale</label>
                                <input
                                    type="number"
                                    value={retenueFiscale}
                                    onChange={(e) => setRetenueFiscale(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-muted-foreground">Net à Payer</label>
                                <input
                                    type="number"
                                    value={netAPayer}
                                    onChange={(e) => setNetAPayer(Number(e.target.value))}
                                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-semibold text-emerald-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-muted-foreground">Historique Bruts précédents (séparés par virgule)</label>
                            <input
                                type="text"
                                value={historiqueBrut}
                                onChange={(e) => setHistoriqueBrut(e.target.value)}
                                className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono text-[11px]"
                            />
                        </div>

                        <button
                            onClick={lancerAnalyse}
                            disabled={loading}
                            className="w-full mt-3 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Analyser avec le moteur IA
                        </button>
                    </div>
                </div>

                {/* Résultats de l'analyse */}
                <div className="md:col-span-2 space-y-4">
                    {resultat ? (
                        <>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Score de Risque</div>
                                    <div className="text-2xl font-bold mt-1 text-foreground flex items-baseline gap-2">
                                        <span>{resultat.scoreRisque}/100</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            resultat.niveauGlobal === "CRITIQUE" ? "bg-rose-500/20 text-rose-400" :
                                            resultat.niveauGlobal === "ELEVE" ? "bg-amber-500/20 text-amber-400" :
                                            resultat.niveauGlobal === "MOYEN" ? "bg-blue-500/20 text-blue-400" :
                                            "bg-emerald-500/20 text-emerald-400"
                                        }`}>
                                            {resultat.niveauGlobal}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Salaire Brut Total</div>
                                    <div className="text-xl font-bold mt-1 text-foreground">
                                        {resultat.salaireBrut.toLocaleString("fr-FR")} FCFA
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl border border-border bg-card/40">
                                    <div className="text-xs text-muted-foreground">Anomalies Détectées</div>
                                    <div className="text-xl font-bold mt-1 text-foreground">
                                        {resultat.anomalies.length}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card/40 border border-border rounded-xl p-5 space-y-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                                    Diagnostics et Préconisations de Contrôle
                                </h3>

                                {resultat.anomalies.length === 0 ? (
                                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        Aucune anomalie ni incohérence détectée. Le bulletin respecte les équilibres CCNI.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {resultat.anomalies.map((a: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                                                    a.niveau === "CRITIQUE" ? "bg-rose-500/10 border-rose-500/30 text-rose-200" :
                                                    a.niveau === "ELEVE" ? "bg-amber-500/10 border-amber-500/30 text-amber-200" :
                                                    "bg-blue-500/10 border-blue-500/30 text-blue-200"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between font-semibold">
                                                    <span className="flex items-center gap-1.5">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        {a.type}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background/50">
                                                        {a.niveau}
                                                    </span>
                                                </div>
                                                <p className="text-foreground/90">{a.description}</p>
                                                <div className="text-muted-foreground text-[11px] pt-1">
                                                    💡 <strong>Suggestion :</strong> {a.suggestionCorrection}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                            <Sparkles className="w-8 h-8 text-indigo-400/50 mb-3" />
                            <p>Renseignez les données du bulletin ou importez un lot pour déclencher l'audit automatisé.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
