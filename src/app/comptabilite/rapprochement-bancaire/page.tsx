"use client";

import { useState, useCallback } from "react";
import {
    Building2, Scale, CheckCircle2, AlertCircle,
    Printer, RefreshCw, ShieldCheck, ArrowRightLeft, FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RapprochementBancairePage() {
    const [clientId, setClientId] = useState("");
    const [banque, setBanque] = useState("Société Générale Sénégal (SGBS)");
    const [soldeCompta, setSoldeCompta] = useState(4250000);
    const [soldeReleve, setSoldeReleve] = useState(5150000);
    const [dateRapprochement, setDateRapprochement] = useState(new Date().toISOString().slice(0, 10));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState<any | null>(null);
    const [scelle, setScelle] = useState(false);

    const chargerRapprochement = useCallback(async () => {
        if (!clientId.trim() || clientId.trim().length < 12) {
            setError("Veuillez renseigner un identifiant client valide (MongoDB ID).");
            return;
        }

        setLoading(true);
        setError("");
        setScelle(false);
        try {
            const res = await fetch(
                `/api/comptabilite/rapprochement-bancaire?clientId=${encodeURIComponent(clientId.trim())}&banque=${encodeURIComponent(banque)}&soldeCompta=${soldeCompta}&soldeReleve=${soldeReleve}&date=${dateRapprochement}`
            );
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || "Erreur de chargement");
            setData(resData);
        } catch (err: any) {
            setError(err.message || "Erreur lors du calcul du rapprochement bancaire.");
        } finally {
            setLoading(false);
        }
    }, [clientId, banque, soldeCompta, soldeReleve, dateRapprochement]);

    const scellerRapprochement = async () => {
        if (!data) return;
        try {
            const res = await fetch("/api/comptabilite/rapprochement-bancaire", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: clientId.trim(),
                    dateRapprochement,
                    nomBanque: banque,
                    soldeComptableRectifie: data.soldeComptableRectifie,
                    soldeBancaireRectifie: data.soldeBancaireRectifie,
                    ecartRapprochement: data.ecartRapprochement,
                }),
            });
            if (res.ok) setScelle(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <ArrowRightLeft className="w-6 h-6 text-primary" />
                    État de Rapprochement Bancaire Normé (SYSCOHADA)
                </h2>
                <p className="page-subtitle">
                    Tableau formel d'audit à double colonne : conciliation obligatoire entre le compte de trésorerie (521) et le relevé bancaire de clôture.
                </p>
            </div>

            {error && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Filtres & Paramètres */}
            <div className="p-6 rounded-2xl border border-border bg-card/40 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="w-60">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Identifiant Dossier Client *
                        </label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="ex: 60c72b2f9b1d8b2bad592a88"
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>

                    <div className="w-60">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Établissement Bancaire
                        </label>
                        <input
                            type="text"
                            value={banque}
                            onChange={(e) => setBanque(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Date de Clôture
                        </label>
                        <input
                            type="date"
                            value={dateRapprochement}
                            onChange={(e) => setDateRapprochement(e.target.value)}
                            className="px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Solde Compte 521 (Compta)
                        </label>
                        <input
                            type="number"
                            value={soldeCompta}
                            onChange={(e) => setSoldeCompta(Number(e.target.value))}
                            className="w-36 px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Solde Relevé (Banque)
                        </label>
                        <input
                            type="number"
                            value={soldeReleve}
                            onChange={(e) => setSoldeReleve(Number(e.target.value))}
                            className="w-36 px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
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
                            Imprimer
                        </button>
                    )}
                    <button
                        onClick={chargerRapprochement}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Rapprocher les Soldes
                    </button>
                </div>
            </div>

            {data && (
                <div className="space-y-6">
                    {/* Statut Équilibre de Rapprochement */}
                    <div
                        className={cn(
                            "p-5 rounded-2xl border flex items-center justify-between gap-4 font-mono",
                            data.estRapproche
                                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                                : "bg-rose-950/20 border-rose-500/40 text-rose-200"
                        )}
                    >
                        <div className="space-y-1 font-sans">
                            <span className="font-bold text-sm flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                {data.estRapproche
                                    ? "Concordance Parfaite Validée (Écart 0 F)"
                                    : "Écart de Rapprochement Constaté"}
                            </span>
                            <p className="text-xs opacity-90">
                                {data.estRapproche
                                    ? `Le solde rectifié du compte 521 (${data.soldeComptableRectifie.toLocaleString("fr-FR")} F) égale exactement le solde bancaire rectifié.`
                                    : `Un différentiel de ${data.ecartRapprochement.toLocaleString("fr-FR")} FCFA subsiste.`}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {data.estRapproche && !scelle && (
                                <button
                                    onClick={scellerRapprochement}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs font-sans transition"
                                >
                                    Sceller le Rapprochement
                                </button>
                            )}
                            {scelle && (
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/30 text-emerald-200 text-xs font-sans font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> Scellé & Archivé
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tableau Double Colonne Normé */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Colonne 1 : Comptabilité de l'Entreprise (Compte 521) */}
                        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                            <div className="border-b border-border pb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground">
                                    1. Compte {data.compteTresorerie} dans nos Livres
                                </h3>
                                <span className="text-xs text-muted-foreground font-mono">
                                    Initial : {data.soldeComptableAvant.toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div className="space-y-2 text-xs font-mono">
                                <span className="text-[11px] font-sans font-semibold text-muted-foreground uppercase">
                                    Ajustements à porter en comptabilité :
                                </span>

                                {data.operationsAJourComptabilite.length === 0 ? (
                                    <p className="text-muted-foreground text-[11px] py-2">Aucun ajustement requis.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {data.operationsAJourComptabilite.map((op: any) => (
                                            <div
                                                key={op.id}
                                                className="flex justify-between items-center p-2 rounded bg-background border border-border"
                                            >
                                                <div className="space-y-0.5">
                                                    <span className="font-sans text-foreground block font-medium">
                                                        {op.libelle}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {op.date} • {op.nature}
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "font-bold",
                                                        op.sens === "DEBIT" ? "text-emerald-400" : "text-rose-400"
                                                    )}
                                                >
                                                    {op.sens === "DEBIT" ? "+" : "-"}
                                                    {op.montant.toLocaleString("fr-FR")} F
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-3 rounded-xl bg-card border border-border flex justify-between items-center font-bold text-sm text-foreground pt-3 mt-4">
                                    <span className="font-sans">SOLDE COMPTABLE RECTIFIÉ :</span>
                                    <span className="text-primary">{data.soldeComptableRectifie.toLocaleString("fr-FR")} F</span>
                                </div>
                            </div>
                        </div>

                        {/* Colonne 2 : Relevé Bancaire (Banque) */}
                        <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                            <div className="border-b border-border pb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground">
                                    2. Relevé Bancaire ({data.nomBanque})
                                </h3>
                                <span className="text-xs text-muted-foreground font-mono">
                                    Initial : {data.soldeReleveBancaire.toLocaleString("fr-FR")} F
                                </span>
                            </div>

                            <div className="space-y-2 text-xs font-mono">
                                <span className="text-[11px] font-sans font-semibold text-muted-foreground uppercase">
                                    Opérations en suspens chez le banquier :
                                </span>

                                {data.operationsEnSuspenseBanque.length === 0 ? (
                                    <p className="text-muted-foreground text-[11px] py-2">Aucune opération en circulation.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {data.operationsEnSuspenseBanque.map((op: any) => (
                                            <div
                                                key={op.id}
                                                className="flex justify-between items-center p-2 rounded bg-background border border-border"
                                            >
                                                <div className="space-y-0.5">
                                                    <span className="font-sans text-foreground block font-medium">
                                                        {op.libelle}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {op.date} • {op.nature}
                                                    </span>
                                                </div>
                                                <span
                                                    className={cn(
                                                        "font-bold",
                                                        op.sens === "DEBIT" ? "text-emerald-400" : "text-rose-400"
                                                    )}
                                                >
                                                    {op.sens === "DEBIT" ? "+" : "-"}
                                                    {op.montant.toLocaleString("fr-FR")} F
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-3 rounded-xl bg-card border border-border flex justify-between items-center font-bold text-sm text-foreground pt-3 mt-4">
                                    <span className="font-sans">SOLDE BANCAIRE RECTIFIÉ :</span>
                                    <span className="text-primary">{data.soldeBancaireRectifie.toLocaleString("fr-FR")} F</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
