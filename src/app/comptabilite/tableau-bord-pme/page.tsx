"use client";

import { useState, useCallback } from "react";
import {
    LayoutDashboard, TrendingUp, Target, Wallet,
    ShieldCheck, AlertTriangle, Printer, RefreshCw,
    Activity, Clock, DollarSign, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TableauBordPmePage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear());

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState<any | null>(null);

    const chargerTableauBord = useCallback(async () => {
        if (!clientId.trim() || clientId.trim().length < 12) {
            setError("Veuillez renseigner un identifiant client valide (MongoDB ID).");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `/api/comptabilite/dashboard-pme?clientId=${encodeURIComponent(clientId.trim())}&exercice=${exercice}`
            );
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || "Erreur de chargement");
            setData(resData);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération du tableau de bord PME.");
        } finally {
            setLoading(false);
        }
    }, [clientId, exercice]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                    Tableau de Bord Dirigeant & Pilotage Flash PME
                </h2>
                <p className="page-subtitle">
                    Indicateurs clés de gestion pour le chef d'entreprise : Point Mort (Seuil de Rentabilité), BFR en jours de CA, Trésorerie Nette et diagnostic synthétique de l'Expert-Comptable.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Filtres */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="w-64">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Identifiant Dossier Client (MongoDB ID) *
                        </label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="ex: 60c72b2f9b1d8b2bad592a88"
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Exercice
                        </label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={(e) => setExercice(Number(e.target.value))}
                            className="w-32 px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {data && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimer le Rapport Flash
                        </button>
                    )}
                    <button
                        onClick={chargerTableauBord}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Actualiser les Indicateurs
                    </button>
                </div>
            </div>

            {data && (
                <div className="space-y-6">
                    {/* Diagnostic Flash & Score de Santé */}
                    <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2 flex-1">
                            <span className="text-xs uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                                <Activity className="w-4 h-4" />
                                Avis d'Expertise & Diagnostic Financier Flash
                            </span>
                            <p className="text-sm font-medium text-foreground leading-relaxed">
                                {data.conseilExpert}
                            </p>
                        </div>
                        <div className="text-right border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8">
                            <span className="text-xs text-muted-foreground block font-medium">Score de Santé PME</span>
                            <span
                                className={cn(
                                    "text-4xl font-black font-mono",
                                    data.scoreSantePME >= 75
                                        ? "text-emerald-400"
                                        : data.scoreSantePME >= 50
                                        ? "text-amber-400"
                                        : "text-rose-400"
                                )}
                            >
                                {data.scoreSantePME} / 100
                            </span>
                        </div>
                    </div>

                    {/* Bloc 1 : Seuil de Rentabilité & Point Mort */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                            <Target className="w-4 h-4 text-primary" />
                            1. Seuil de Rentabilité & Point Mort (Date de Couverture des Charges Fixes)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Seuil de Rentabilité (FCFA)</span>
                                <span className="text-lg font-black text-foreground">
                                    {Number(data.pointMort.seuilRentabiliteFCFA).toLocaleString("fr-FR")} F
                                </span>
                                <span className="text-[11px] text-muted-foreground font-sans block mt-1">
                                    CA minimum d'équilibre
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Point Mort en Jours</span>
                                <span className="text-lg font-black text-primary">
                                    {data.pointMort.pointMortJours} jours
                                </span>
                                <span className="text-[11px] text-muted-foreground font-sans block mt-1">
                                    Date atteinte : <strong>{data.pointMort.datePointMortAtteint || "Non atteint"}</strong>
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Taux de Marge sur Coûts Variables</span>
                                <span className="text-lg font-black text-foreground">
                                    {data.pointMort.tauxMargeSurCoutVariable} %
                                </span>
                                <span className="text-[11px] text-muted-foreground font-sans block mt-1">
                                    MCV : {Number(data.pointMort.margeSurCoutVariable).toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div
                                className={cn(
                                    "p-4 rounded-xl border",
                                    data.pointMort.estBeneficiaire
                                        ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                                        : "bg-rose-950/20 border-rose-500/40 text-rose-300"
                                )}
                            >
                                <span className="font-sans block opacity-80">Résultat d'Exploitation</span>
                                <span className="text-lg font-black">
                                    {Number(data.pointMort.resultatExploitationPrevisionnel).toLocaleString("fr-FR")} F
                                </span>
                                <span className="font-sans text-[11px] block mt-1 opacity-80">
                                    {data.pointMort.estBeneficiaire ? "Bénéfice d'exploitation" : "Déficit d'exploitation"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bloc 2 : BFR & Rotation */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                            <Clock className="w-4 h-4 text-primary" />
                            2. Besoin en Fonds de Roulement (BFR) & Délais de Rotation
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">BFR en Montant</span>
                                <span className="text-lg font-black text-foreground">
                                    {Number(data.bfr.bfrMontant).toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">BFR en Jours de CA</span>
                                <span className="text-lg font-black text-foreground">
                                    {data.bfr.bfrJoursCA} jours
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Délai Clients (DSO)</span>
                                <span className="text-lg font-black text-amber-400">
                                    {data.bfr.rotationCreancesJours} jours
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Délai Fournisseurs (DPO)</span>
                                <span className="text-lg font-black text-emerald-400">
                                    {data.bfr.rotationDettesJours} jours
                                </span>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-background/50 border border-border text-xs text-muted-foreground">
                            <strong>Diagnostic BFR : </strong> {data.bfr.diagnosticBFR}
                        </div>
                    </div>

                    {/* Bloc 3 : Trésorerie Nette */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                            <Wallet className="w-4 h-4 text-primary" />
                            3. Trésorerie Nette & Autonomie Immédiate
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Trésorerie Active (Cash)</span>
                                <span className="text-lg font-black text-emerald-400">
                                    {Number(data.tresorerie.tresorerieActive).toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Concours Bancaires (Découverts)</span>
                                <span className="text-lg font-black text-rose-400">
                                    {Number(data.tresorerie.tresoreriePassive).toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Trésorerie Nette Disponible</span>
                                <span className="text-lg font-black text-foreground">
                                    {Number(data.tresorerie.tresorerieNette).toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-background border border-border">
                                <span className="text-muted-foreground font-sans block">Autonomie de Charges Fixes</span>
                                <span className="text-lg font-black text-primary">
                                    {data.tresorerie.autonomieTresorerieJours} jours
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
