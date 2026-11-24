"use client";

import { useState, useCallback } from "react";
import {
    Scale,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Calculator,
    Loader2,
    TrendingDown,
    FileSpreadsheet,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaysFiscal } from "@/lib/tax-simulator";
import type { RapportCadragePaieCompta, LigneLivrePaieCumul, SoldesComptablesPaie, EcartCadrage } from "@/lib/payroll/cadrage-paie-compta";

const f = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

export default function CadragePaiePage() {
    const [pays, setPays] = useState<PaysFiscal>("sn");
    const [exercice, setExercice] = useState("");
    const [periode, setPeriode] = useState("");

    // Paie
    const [brut, setBrut] = useState("");
    const [patronal, setPatronal] = useState("");
    const [salarial, setSalarial] = useState("");
    const [impotsSal, setImpotsSal] = useState("");
    const [net, setNet] = useState("");
    const [acomptes, setAcomptes] = useState("");

    // Compta
    const [c661, setC661] = useState("");
    const [c664, setC664] = useState("");
    const [c422, setC422] = useState("");
    const [c43, setC43] = useState("");
    const [c447, setC447] = useState("");
    const [c421, setC421] = useState("");

    const [loading, setLoading] = useState(false);
    const [rapport, setRapport] = useState<RapportCadragePaieCompta | null>(null);
    const [error, setError] = useState("");

    const lancerCadrage = useCallback(async () => {
        const saisies = [exercice, periode, brut, patronal, salarial, impotsSal, net, acomptes, c661, c664, c422, c43, c447, c421];
        if (saisies.some((value) => value.trim() === "" || !Number.isFinite(Number(value)))) {
            setError("Saisissez la période et tous les montants du livre de paie et du grand livre à partir des écritures réelles.");
            return;
        }
        setLoading(true);
        setError("");
        setRapport(null);

        const paie: LigneLivrePaieCumul = {
            brutImposable: Number(brut),
            chargesPatronalesSociales: Number(patronal),
            chargesSalarialesSociales: Number(salarial),
            impotsRetenusSource: Number(impotsSal),
            netAPayer: Number(net),
            avancesEtAcomptes: Number(acomptes),
        };

        const compta: SoldesComptablesPaie = {
            solde661_Remunerations: Number(c661),
            solde664_ChargesSocialesPatronales: Number(c664),
            solde422_PersonnelRemunerationsDues: Number(c422),
            solde43_OrganismesSociaux: Number(c43),
            solde447_RetenuesFiscalesSalaires: Number(c447),
            solde421_AvancesAcomptes: Number(c421),
        };

        try {
            const res = await fetch("/api/payroll/cadrage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pays, exercice: Number(exercice), periodeOuMois: periode, paie, compta }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur de calcul du cadrage");
            setRapport(data.rapport);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    }, [pays, exercice, periode, brut, patronal, salarial, impotsSal, net, acomptes, c661, c664, c422, c43, c447, c421]);

    const badgeStatut = (statut: EcartCadrage["statut"]) => {
        switch (statut) {
            case "RISQUE_REDRESSEMENT":
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-950/70 text-red-300 border border-red-800">Écart Critique</span>;
            case "ANOMALIE_MINEURE":
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-950/70 text-yellow-300 border border-yellow-800">Anomalie Mineure</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800">Conforme</span>;
        }
    };

    return (
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="page-title text-2xl font-bold tracking-tight flex items-center gap-2">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                    Cadrage Paie vs Comptabilité (Comptes 66 / 42 / 43 / 44)
                </h1>
                <p className="page-subtitle text-xs text-muted-foreground mt-1">
                    Audit social et réconciliation systématique entre la masse salariale du livre de paie et le Grand Livre SYSCOHADA.
                </p>
                <p className="mt-2 text-xs text-amber-300">Saisissez les totaux extraits du livre de paie et du grand livre pour la même période. Aucun montant n’est prérempli.</p>
            </div>

            {/* Formulaire des masses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <label className="text-xs text-muted-foreground">Exercice<input type="number" value={exercice} onChange={(e) => setExercice(e.target.value)} className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2" /></label>
                <label className="text-xs text-muted-foreground">Période commune<input type="text" value={periode} onChange={(e) => setPeriode(e.target.value)} placeholder="Ex. janvier à décembre 2026" className="mt-1 w-full bg-background border border-border rounded-lg px-3 py-2" /></label>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Livre de Paie */}
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">1</span>
                            Totaux du Livre de Paie
                        </h2>
                        <select
                            value={pays}
                            onChange={(e) => setPays(e.target.value as PaysFiscal)}
                            className="bg-background border border-border rounded-lg px-2 py-1 text-xs"
                        >
                            <option value="sn">Sénégal (IPRES / CSS / VRS)</option>
                            <option value="ci">Côte d&apos;Ivoire (CNPS / CMU / ITS)</option>
                            <option value="cm">Cameroun (CNPS / IRPP)</option>
                            <option value="bj">Bénin (CNSS / IPTS)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Masse Salariale Brute</label>
                            <input
                                type="number"
                                value={brut}
                                onChange={(e) => setBrut(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Charges Patronales Sociales</label>
                            <input
                                type="number"
                                value={patronal}
                                onChange={(e) => setPatronal(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Charges Salariales Sociales</label>
                            <input
                                type="number"
                                value={salarial}
                                onChange={(e) => setSalarial(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Impôts Retenus (VRS / ITS)</label>
                            <input
                                type="number"
                                value={impotsSal}
                                onChange={(e) => setImpotsSal(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Net à Payer (Bulletins)</label>
                            <input
                                type="number"
                                value={net}
                                onChange={(e) => setNet(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Acomptes Déduits</label>
                            <input
                                type="number"
                                value={acomptes}
                                onChange={(e) => setAcomptes(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Grand Livre Comptable */}
                <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">2</span>
                        Soldes Comptables (SYSCOHADA)
                    </h2>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Compte 661 (Rémunérations)</label>
                            <input
                                type="number"
                                value={c661}
                                onChange={(e) => setC661(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Compte 664 (Charges Patronales)</label>
                            <input
                                type="number"
                                value={c664}
                                onChange={(e) => setC664(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Compte 422 (Rémunérations Dues)</label>
                            <input
                                type="number"
                                value={c422}
                                onChange={(e) => setC422(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Compte 43 (Organismes Sociaux)</label>
                            <input
                                type="number"
                                value={c43}
                                onChange={(e) => setC43(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Compte 447 (Impôts Retenus Salaires)</label>
                            <input
                                type="number"
                                value={c447}
                                onChange={(e) => setC447(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-muted-foreground mb-1 font-medium">Compte 421 (Avances & Acomptes)</label>
                            <input
                                type="number"
                                value={c421}
                                onChange={(e) => setC421(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={lancerCadrage}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
                    Exécuter le Cadrage Paie vs Comptabilité
                </button>
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>

            {/* Résultats du cadrage */}
            {rapport && (
                <div className="space-y-6 pt-4 border-t border-border">
                    {/* Score & KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Taux de Concordance</span>
                            <p className="text-2xl font-bold text-foreground mt-1">{rapport.tauxConformiteGlobal}%</p>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Total Écarts Absolus</span>
                            <p className={cn("text-2xl font-bold mt-1", rapport.totalEcartsAbsolus === 0 ? "text-emerald-400" : "text-amber-400")}>
                                {f(rapport.totalEcartsAbsolus)}
                            </p>
                        </div>
                        <div className="bg-card/60 border border-border p-4 rounded-xl">
                            <span className="text-xs text-muted-foreground uppercase font-medium">Niveau de Risque Social</span>
                            <p className="text-2xl font-bold text-foreground mt-1">{rapport.syntheseRisqueSocial}</p>
                        </div>
                    </div>

                    {/* Tableau des écarts */}
                    <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold flex items-center justify-between">
                            <span>Détail du Rapprochement par Poste</span>
                            <span className="text-xs text-muted-foreground">Période : {rapport.periodeOuMois}</span>
                        </h3>

                        <div className="space-y-3">
                            {rapport.ecarts.map((e, idx) => (
                                <div key={idx} className="p-3.5 bg-background/60 border border-border rounded-lg text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {badgeStatut(e.statut)}
                                            <span className="font-semibold text-foreground">{e.intitule}</span>
                                        </div>
                                        <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                                            {e.compteSYSCOHADA}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-muted-foreground pt-1">
                                        <div>Paie : <strong className="text-foreground">{f(e.montantPaie)}</strong></div>
                                        <div>Compta : <strong className="text-foreground">{f(e.montantComptabilite)}</strong></div>
                                        <div>Écart : <strong className={cn(e.ecart !== 0 ? "text-red-400" : "text-emerald-400")}>{f(e.ecart)}</strong></div>
                                    </div>
                                    <p className="text-muted-foreground pt-1 border-t border-border">{e.explication}</p>
                                    <p className="text-foreground/90 font-medium">Recommandation : {e.recommandation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
