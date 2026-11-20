"use client";

import { useState, useCallback } from "react";
import {
    Coins, Scale, CheckCircle2, AlertCircle,
    ArrowUpRight, ArrowDownRight, Printer, RefreshCw,
    Building2, FileText, Check, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SmtPage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [categorie, setCategorie] = useState<"COMMERCE_NEGOCE" | "ARTISANAT" | "SERVICES">("COMMERCE_NEGOCE");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [etats, setEtats] = useState<any | null>(null);

    const chargerEtats = useCallback(async () => {
        if (!clientId.trim() || clientId.trim().length < 12) {
            setError("Veuillez renseigner un identifiant client valide (MongoDB ID).");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `/api/comptabilite/smt?clientId=${encodeURIComponent(clientId.trim())}&exercice=${exercice}&categorie=${categorie}`
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur de chargement");
            setEtats(data);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la génération des états SMT.");
        } finally {
            setLoading(false);
        }
    }, [clientId, exercice, categorie]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Coins className="w-6 h-6 text-primary" />
                    Système Minimal de Trésorerie (SMT SYSCOHADA)
                </h2>
                <p className="page-subtitle">
                    États financiers simplifiés légaux (AUDCIF art. 13 & 27) pour les TPE et micro-entreprises de l'espace OHADA sous les seuils de chiffre d'affaires.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Filtres de sélection */}
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
                            Secteur d'Activité Légal
                        </label>
                        <select
                            value={categorie}
                            onChange={(e: any) => setCategorie(e.target.value)}
                            className="px-3 py-2 text-sm bg-background border border-border rounded-xl"
                        >
                            <option value="COMMERCE_NEGOCE">Négoce & Vente Marchandises (Plafond 60M)</option>
                            <option value="ARTISANAT">Artisanat & Métiers (Plafond 40M)</option>
                            <option value="SERVICES">Prestations de Services (Plafond 30M)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Exercice
                        </label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={(e) => setExercice(Number(e.target.value))}
                            className="w-28 px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {etats && (
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold flex items-center gap-2 transition"
                        >
                            <Printer className="w-4 h-4" />
                            Imprimer la Liasse SMT
                        </button>
                    )}
                    <button
                        onClick={chargerEtats}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Générer la Liasse SMT
                    </button>
                </div>
            </div>

            {etats && (
                <div className="space-y-6">
                    {/* Diagnostic d'Éligibilité */}
                    <div
                        className={cn(
                            "p-5 rounded-2xl border flex items-center justify-between gap-4",
                            etats.diagnostic.estEligibleSMT
                                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                                : "bg-rose-950/20 border-rose-500/40 text-rose-200"
                        )}
                    >
                        <div className="space-y-1">
                            <span className="font-bold text-sm flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                Diagnostic d'Éligibilité au Régime SMT
                            </span>
                            <p className="text-xs opacity-90">{etats.diagnostic.recommandation}</p>
                        </div>
                        <div className="text-right font-mono">
                            <span className="text-xs text-muted-foreground block">CA Annuel Réalisé</span>
                            <span className="text-lg font-black text-foreground">
                                {Number(etats.diagnostic.chiffreAffairesTotal).toLocaleString("fr-FR")} F
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                                Seuil légal : {Number(etats.diagnostic.seuilLegal).toLocaleString("fr-FR")} F
                            </span>
                        </div>
                    </div>

                    {/* Compte de Résultat SMT */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                            <FileText className="w-4 h-4 text-primary" />
                            Compte de Résultat Simplifié SMT (SYSCOHADA)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                            {/* Colonne Recettes */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                    Recettes d'Exploitation Encaissées
                                </h4>
                                <div className="space-y-1.5 font-mono">
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Ventes de marchandises :</span>
                                        <span className="font-bold text-foreground">
                                            {Number(etats.compteResultat.recettesVentes).toLocaleString("fr-FR")} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Prestations de services :</span>
                                        <span className="font-bold text-foreground">
                                            {Number(etats.compteResultat.recettesServices).toLocaleString("fr-FR")} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
                                        <span>TOTAL RECETTES D'EXPLOITATION :</span>
                                        <span>{Number(etats.compteResultat.totalRecettesExploitation).toLocaleString("fr-FR")} F</span>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne Dépenses */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                                    Dépenses d'Exploitation Décaissées
                                </h4>
                                <div className="space-y-1.5 font-mono">
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Achats de marchandises :</span>
                                        <span className="font-bold text-foreground">
                                            {Number(etats.compteResultat.achatsMarchandises).toLocaleString("fr-FR")} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Loyers & charges locatives :</span>
                                        <span className="font-bold text-foreground">
                                            {Number(etats.compteResultat.loyersEtChargesLocatives).toLocaleString("fr-FR")} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Salaires du personnel :</span>
                                        <span className="font-bold text-foreground">
                                            {Number(etats.compteResultat.salairesEtChargesPersonnel).toLocaleString("fr-FR")} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Impôts & taxes acquittés :</span>
                                        <span className="font-bold text-foreground">
                                            {Number(etats.compteResultat.impotsEtTaxesPayes).toLocaleString("fr-FR")} F
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 font-bold">
                                        <span>TOTAL DÉPENSES D'EXPLOITATION :</span>
                                        <span>{Number(etats.compteResultat.totalDepensesExploitation).toLocaleString("fr-FR")} F</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Soldes intermédiaires */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono">
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-[11px] text-muted-foreground block">Excédent d'Exploitation</span>
                                <span className="text-base font-black text-emerald-400">
                                    {Number(etats.compteResultat.excedentTresorerieExploitation).toLocaleString("fr-FR")} F
                                </span>
                            </div>
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-[11px] text-muted-foreground block">Solde Investissement</span>
                                <span className="text-base font-black text-amber-400">
                                    {Number(etats.compteResultat.soldeInvestissement).toLocaleString("fr-FR")} F
                                </span>
                            </div>
                            <div className="p-3 bg-background rounded-xl border border-border">
                                <span className="text-[11px] text-muted-foreground block">Variation Nette de Trésorerie</span>
                                <span className="text-base font-black text-primary">
                                    {Number(etats.compteResultat.variationNetteTresorerie).toLocaleString("fr-FR")} F
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bilan SMT */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Scale className="w-4 h-4 text-primary" />
                                Bilan SMT (Équilibre Actif / Passif)
                            </h3>
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Bilan Équilibré (Écart 0 F)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                            {/* ACTIF */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] font-sans">
                                    Actif SMT
                                </h4>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Immobilisations nettes :</span>
                                        <span>{Number(etats.bilan.actif.immobilisations).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Stocks de marchandises :</span>
                                        <span>{Number(etats.bilan.actif.stocks).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Créances clients & tiers :</span>
                                        <span>{Number(etats.bilan.actif.creances).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Trésorerie active (banque/caisse) :</span>
                                        <span>{Number(etats.bilan.actif.tresorerieActif).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2.5 rounded-lg bg-card border border-border font-bold text-foreground text-sm">
                                        <span>TOTAL ACTIF :</span>
                                        <span>{Number(etats.bilan.actif.totalActif).toLocaleString("fr-FR")} F</span>
                                    </div>
                                </div>
                            </div>

                            {/* PASSIF */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] font-sans">
                                    Passif SMT
                                </h4>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Capitaux propres & Résultat :</span>
                                        <span>{Number(etats.bilan.passif.capitauxPropres).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Dettes financières (emprunts) :</span>
                                        <span>{Number(etats.bilan.passif.dettesFinancieres).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Dettes fournisseurs & fiscales :</span>
                                        <span>{Number(etats.bilan.passif.dettesExploitation).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2 rounded bg-background border border-border">
                                        <span className="text-muted-foreground">Trésorerie passive (découverts) :</span>
                                        <span>{Number(etats.bilan.passif.tresoreriePassif).toLocaleString("fr-FR")} F</span>
                                    </div>
                                    <div className="flex justify-between p-2.5 rounded-lg bg-card border border-border font-bold text-foreground text-sm">
                                        <span>TOTAL PASSIF :</span>
                                        <span>{Number(etats.bilan.passif.totalPassif).toLocaleString("fr-FR")} F</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
