"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, Calendar, FileText, RefreshCw } from "lucide-react";

export default function ConformiteDashboardPage() {
    const [pays, setPays] = useState("SN");
    const [annee, setAnnee] = useState(2025);
    const [mois, setMois] = useState(1);
    const [declarationsDeposees, setDeclarationsDeposees] = useState<string[]>(["tva-mensuelle"]);
    const [loading, setLoading] = useState(false);
    const [tableau, setTableau] = useState<any>(null);

    const chargerTableau = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                pays,
                annee: annee.toString(),
                mois: mois.toString(),
                deposees: declarationsDeposees.join(","),
            });
            const res = await fetch(`/api/conformite/dashboard?${params.toString()}`);
            const data = await res.json();
            if (data.tableau) {
                setTableau(data.tableau);
            }
        } catch (err) {
            console.error("Erreur chargement conformite:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerTableau();
    }, [pays, annee, mois]);

    const toggleDeposee = (id: string) => {
        if (declarationsDeposees.includes(id)) {
            setDeclarationsDeposees(declarationsDeposees.filter((d) => d !== id));
        } else {
            setDeclarationsDeposees([...declarationsDeposees, id]);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <h1 className="page-title text-2xl font-bold tracking-tight">Tableau de Bord Conformité OHADA</h1>
                    </div>
                    <p className="page-subtitle text-sm text-muted-foreground mt-0.5">
                        Pilotage des échéances fiscales, déclarations sociales et scoring du risque pénalités.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={pays}
                        onChange={(e) => setPays(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                    >
                        <option value="SN">Sénégal (SN)</option>
                        <option value="CI">Côte d'Ivoire (CI)</option>
                        <option value="CM">Cameroun (CM)</option>
                        <option value="BJ">Bénin (BJ)</option>
                        <option value="TG">Togo (TG)</option>
                    </select>

                    <select
                        value={mois}
                        onChange={(e) => setMois(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Mois {i + 1}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={chargerTableau}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        Actualiser
                    </button>
                </div>
            </div>

            {tableau && (
                <>
                    {/* Cartes Scores & KPI */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-xl border border-border bg-card/40 flex items-center justify-between">
                            <div>
                                <div className="text-xs text-muted-foreground">Score Global</div>
                                <div className="text-3xl font-extrabold mt-1 text-foreground">
                                    {tableau.score.global}<span className="text-base text-muted-foreground font-normal">/100</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">Conformité statutaire</div>
                            </div>
                            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-400">
                                {tableau.score.global}%
                            </div>
                        </div>

                        <div className="p-5 rounded-xl border border-border bg-card/40">
                            <div className="text-xs text-muted-foreground">Score Fiscal</div>
                            <div className="text-2xl font-bold mt-1 text-foreground">
                                {tableau.score.fiscal}<span className="text-sm font-normal text-muted-foreground">/100</span>
                            </div>
                            <div className="text-[11px] text-emerald-400 mt-1">TVA, IS & Retenues</div>
                        </div>

                        <div className="p-5 rounded-xl border border-border bg-card/40">
                            <div className="text-xs text-muted-foreground">Score Social</div>
                            <div className="text-2xl font-bold mt-1 text-foreground">
                                {tableau.score.social}<span className="text-sm font-normal text-muted-foreground">/100</span>
                            </div>
                            <div className="text-[11px] text-blue-400 mt-1">Cotisations & Retraite</div>
                        </div>

                        <div className="p-5 rounded-xl border border-border bg-card/40">
                            <div className="text-xs text-muted-foreground">En Retard / Pénalités</div>
                            <div className="text-2xl font-bold mt-1 text-rose-400">
                                {tableau.score.detail.enRetard + tableau.score.detail.penalite}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">Déclarations à régulariser</div>
                        </div>
                    </div>

                    {/* Alertes prioritaires */}
                    {tableau.alertes.length > 0 && (
                        <div className="bg-card/40 border border-border rounded-xl p-4 space-y-2">
                            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                Notifications du système de vigilance
                            </div>
                            <div className="space-y-1">
                                {tableau.alertes.map((alt: string, i: number) => (
                                    <div key={i} className="text-xs text-muted-foreground">
                                        {alt}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Liste des échéances */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Calendrier des obligations du mois ({tableau.echeances.length})
                        </h2>

                        <div className="divide-y divide-border">
                            {tableau.echeances.map((ech: any) => {
                                const isDepose = declarationsDeposees.includes(ech.obligationId);
                                return (
                                    <div key={ech.obligationId} className="py-3.5 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-foreground">{ech.titre}</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    ech.statut === "DEPOSE" ? "bg-emerald-500/20 text-emerald-400" :
                                                    ech.statut === "URGENT" ? "bg-amber-500/20 text-amber-400" :
                                                    ech.statut === "EN_RETARD" || ech.statut === "PENALITE" ? "bg-rose-500/20 text-rose-400" :
                                                    "bg-blue-500/20 text-blue-400"
                                                }`}>
                                                    {ech.statut}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                                    {ech.categorie}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-3">
                                                <span>Échéance : {new Date(ech.dateEcheance).toLocaleDateString("fr-FR")}</span>
                                                <span>• Réf : {ech.reference}</span>
                                                {ech.penaliteEstimee && (
                                                    <span className="text-rose-400 font-medium">
                                                        ⚠️ Pénalité : {ech.penaliteEstimee.toLocaleString("fr-FR")} FCFA
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleDeposee(ech.obligationId)}
                                            className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium flex items-center gap-1.5 ${
                                                isDepose
                                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                    : "border-border text-muted-foreground hover:bg-secondary"
                                            }`}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {isDepose ? "Déposé" : "Marquer déposé"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
