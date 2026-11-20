"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Clock, AlertTriangle, ShieldAlert,
    CheckCircle2, ArrowRight, RefreshCw, Filter, FileSpreadsheet,
    Calendar, Check, Search, DollarSign, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LigneBalanceAgee {
    compteAuxiliaire: string;
    nomTiers: string;
    typeTiers: "CLIENT" | "FOURNISSEUR";
    nombreFactures: number;
    facturePlusAncienneDate?: string;
    nonEchu: number;
    retard0a30: number;
    retard31a60: number;
    retard61a90: number;
    retardPlus90: number;
    totalDu: number;
    statutRisque: "NORMAL" | "VIGILANCE" | "CONTENTIEUX_PROBABLE";
}

interface SyntheseBalanceAgee {
    dateArrete: string;
    typeTiers: "CLIENT" | "FOURNISSEUR";
    lignes: LigneBalanceAgee[];
    totaux: {
        nonEchu: number;
        retard0a30: number;
        retard31a60: number;
        retard61a90: number;
        retardPlus90: number;
        totalDu: number;
    };
    delaiMoyenJours: number;
    montantRisqueEleve: number;
}

interface PropositionReclassement {
    compteAuxiliaire: string;
    nomTiers: string;
    creanceTTC: number;
    creanceHT: number;
    tvaEstimee: number;
    tauxDepreciationPropose: number;
    montantDepreciation: number;
    motif: string;
}

export default function ComptabiliteAuxiliairePage() {
    const [clientId, setClientId] = useState("");
    const [typeTiers, setTypeTiers] = useState<"CLIENT" | "FOURNISSEUR">("CLIENT");
    const [dateArrete, setDateArrete] = useState(new Date().toISOString().slice(0, 10));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState<{
        balanceAgee: SyntheseBalanceAgee;
        reclassements416: PropositionReclassement[];
    } | null>(null);

    const [activeTab, setActiveTab] = useState<"balance" | "contentieux" | "lettrage">("balance");

    const chargerDonnees = useCallback(async (cId?: string) => {
        const idCible = cId || clientId;
        if (!idCible || idCible.trim().length < 12) {
            setError("Veuillez saisir un identifiant client valide (MongoDB ObjectId).");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `/api/comptabilite/auxiliaire?clientId=${encodeURIComponent(idCible.trim())}&typeTiers=${typeTiers}&dateArrete=${dateArrete}`
            );
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || "Erreur de chargement");

            setData(resData);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération de la balance âgée.");
        } finally {
            setLoading(false);
        }
    }, [clientId, typeTiers, dateArrete]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Comptabilité Auxiliaire, Balance Âgée & Risques Tiers
                </h2>
                <p className="page-subtitle">
                    Surveillance du BFR, suivi de l'antériorité des créances et dettes (DSO/DPO), lettrage partiel et détection des créances douteuses (SYSCOHADA art. 416).
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Barre de filtres et paramètres */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 flex flex-wrap items-end gap-4 justify-between">
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
                            Type de Comptes
                        </label>
                        <div className="flex items-center rounded-xl border border-border bg-background p-1">
                            <button
                                type="button"
                                onClick={() => setTypeTiers("CLIENT")}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-medium transition",
                                    typeTiers === "CLIENT"
                                        ? "bg-primary text-primary-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Clients (411)
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeTiers("FOURNISSEUR")}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-xs font-medium transition",
                                    typeTiers === "FOURNISSEUR"
                                        ? "bg-primary text-primary-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Fournisseurs (401)
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Date d'Arrêté d'Antériorité
                        </label>
                        <input
                            type="date"
                            value={dateArrete}
                            onChange={(e) => setDateArrete(e.target.value)}
                            className="px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                </div>

                <button
                    onClick={() => chargerDonnees()}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Calculer la Balance Âgée
                </button>
            </div>

            {data && (
                <div className="space-y-6">
                    {/* Cartes KPI Synthétiques */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1">
                            <span className="text-xs text-muted-foreground font-medium block">
                                Total En-cours {typeTiers === "CLIENT" ? "Clients" : "Fournisseurs"}
                            </span>
                            <span className="text-xl font-black text-foreground">
                                {data.balanceAgee.totaux.totalDu.toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                                {data.balanceAgee.lignes.length} comptes actifs
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-1">
                            <span className="text-xs text-emerald-400 font-medium block">Non Échu (Sain)</span>
                            <span className="text-xl font-black text-emerald-400">
                                {data.balanceAgee.totaux.nonEchu.toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-[11px] text-emerald-500/70 block">
                                {data.balanceAgee.totaux.totalDu > 0
                                    ? Math.round((data.balanceAgee.totaux.nonEchu / data.balanceAgee.totaux.totalDu) * 100)
                                    : 0} % du total
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-1">
                            <span className="text-xs text-amber-400 font-medium block">Retard 1 à 60j</span>
                            <span className="text-xl font-black text-amber-400">
                                {(data.balanceAgee.totaux.retard0a30 + data.balanceAgee.totaux.retard31a60).toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-[11px] text-amber-500/70 block">À relancer sous quinzaine</span>
                        </div>

                        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-1">
                            <span className="text-xs text-rose-400 font-medium block">Retard Critique (&gt; 90j)</span>
                            <span className="text-xl font-black text-rose-400">
                                {data.balanceAgee.totaux.retardPlus90.toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-[11px] text-rose-500/70 block">Risque de non-recouvrement</span>
                        </div>

                        <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-1">
                            <span className="text-xs text-primary font-medium block flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {typeTiers === "CLIENT" ? "DSO (Délai Moyen Client)" : "DPO (Délai Fournisseur)"}
                            </span>
                            <span className="text-xl font-black text-foreground">
                                {data.balanceAgee.delaiMoyenJours} jours
                            </span>
                            <span className="text-[11px] text-muted-foreground block">Moyenne pondérée</span>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="flex border-b border-border gap-6 text-sm font-semibold">
                        <button
                            onClick={() => setActiveTab("balance")}
                            className={cn(
                                "pb-3 transition relative",
                                activeTab === "balance"
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Balance Âgée Détaillée ({data.balanceAgee.lignes.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("contentieux")}
                            className={cn(
                                "pb-3 transition relative flex items-center gap-2",
                                activeTab === "contentieux"
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Reclassements 416 & Dépréciations
                            {data.reclassements416.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                                    {data.reclassements416.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Contenu Onglet 1 : Tableau Balance Âgée */}
                    {activeTab === "balance" && (
                        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-muted-foreground uppercase border-b border-border/60">
                                        <tr>
                                            <th className="py-2.5 px-3">Compte / Tiers</th>
                                            <th className="py-2.5 px-3 text-right">Non Échu</th>
                                            <th className="py-2.5 px-3 text-right">0 à 30 jours</th>
                                            <th className="py-2.5 px-3 text-right">31 à 60 jours</th>
                                            <th className="py-2.5 px-3 text-right">61 à 90 jours</th>
                                            <th className="py-2.5 px-3 text-right text-rose-400">&gt; 90 jours</th>
                                            <th className="py-2.5 px-3 text-right font-bold text-foreground">Total Dû</th>
                                            <th className="py-2.5 px-3 text-center">Statut Risque</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40 font-mono">
                                        {data.balanceAgee.lignes.map((l) => (
                                            <tr key={l.compteAuxiliaire} className="hover:bg-muted/30 transition">
                                                <td className="py-3 px-3 font-sans">
                                                    <span className="font-bold text-foreground block">{l.nomTiers}</span>
                                                    <span className="text-[11px] text-muted-foreground font-mono">
                                                        {l.compteAuxiliaire} ({l.nombreFactures} fact.)
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right text-emerald-400">
                                                    {l.nonEchu > 0 ? `${l.nonEchu.toLocaleString("fr-FR")} F` : "-"}
                                                </td>
                                                <td className="py-3 px-3 text-right text-muted-foreground">
                                                    {l.retard0a30 > 0 ? `${l.retard0a30.toLocaleString("fr-FR")} F` : "-"}
                                                </td>
                                                <td className="py-3 px-3 text-right text-amber-400">
                                                    {l.retard31a60 > 0 ? `${l.retard31a60.toLocaleString("fr-FR")} F` : "-"}
                                                </td>
                                                <td className="py-3 px-3 text-right text-amber-500">
                                                    {l.retard61a90 > 0 ? `${l.retard61a90.toLocaleString("fr-FR")} F` : "-"}
                                                </td>
                                                <td className="py-3 px-3 text-right font-bold text-rose-400">
                                                    {l.retardPlus90 > 0 ? `${l.retardPlus90.toLocaleString("fr-FR")} F` : "-"}
                                                </td>
                                                <td className="py-3 px-3 text-right font-bold text-foreground">
                                                    {l.totalDu.toLocaleString("fr-FR")} F
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={cn(
                                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                            l.statutRisque === "NORMAL"
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                : l.statutRisque === "VIGILANCE"
                                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                        )}
                                                    >
                                                        {l.statutRisque === "NORMAL"
                                                            ? "Sain"
                                                            : l.statutRisque === "VIGILANCE"
                                                            ? "Vigilance"
                                                            : "Contentieux"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Contenu Onglet 2 : Reclassements 416 */}
                    {activeTab === "contentieux" && (
                        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-border">
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">
                                        Propositions d'Écritures de Clôture (SYSCOHADA art. 416 / 491)
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Créances excédant 90 jours à basculer en compte 416 et dotations aux dépréciations à constater en charge (compte 659).
                                    </p>
                                </div>
                            </div>

                            {data.reclassements416.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-4 text-center">
                                    Aucune créance douteuse détectée sur ce portefeuille.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {data.reclassements416.map((r, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <span className="font-bold text-sm text-foreground">{r.nomTiers}</span>
                                                <span className="text-muted-foreground block font-mono">
                                                    Compte : {r.compteAuxiliaire} | {r.motif}
                                                </span>
                                                <div className="flex gap-4 pt-1 font-mono text-[11px]">
                                                    <span>Créance TTC : <strong>{r.creanceTTC.toLocaleString("fr-FR")} F</strong></span>
                                                    <span>Base HT : <strong>{r.creanceHT.toLocaleString("fr-FR")} F</strong></span>
                                                    <span>TVA : <strong>{r.tvaEstimee.toLocaleString("fr-FR")} F</strong></span>
                                                </div>
                                            </div>

                                            <div className="text-right space-y-1">
                                                <span className="text-xs text-rose-400 font-bold block">
                                                    Dépréciation Proposée : {r.tauxDepreciationPropose} %
                                                </span>
                                                <span className="text-base font-black text-rose-300 font-mono block">
                                                    {r.montantDepreciation.toLocaleString("fr-FR")} F
                                                </span>
                                                <span className="text-[10px] text-muted-foreground block">
                                                    Écriture : D 659 / C 491
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
