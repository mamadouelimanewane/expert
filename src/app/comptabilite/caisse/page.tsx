"use client";

import { useState, useCallback } from "react";
import {
    Wallet, AlertTriangle, ShieldCheck, Printer,
    RefreshCw, Plus, CheckCircle2, FileText, ArrowDownRight, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CaissePage() {
    const [clientId, setClientId] = useState("");
    const [soldeInitial, setSoldeInitial] = useState(500000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState<any | null>(null);

    // Billetage pour PV
    const [caissierNom, setCaissierNom] = useState("Amina DIOP");
    const [controleurNom, setControleurNom] = useState("Mamadou WANE");
    const [billets10000, setBillets10000] = useState(0);
    const [billets5000, setBillets5000] = useState(0);
    const [billets2000, setBillets2000] = useState(0);
    const [billets1000, setBillets1000] = useState(0);
    const [pieces500, setPieces500] = useState(0);
    const [pvResult, setPvResult] = useState<any | null>(null);

    const chargerCaisse = useCallback(async () => {
        if (!clientId.trim() || clientId.trim().length < 12) {
            setError("Veuillez renseigner un identifiant client valide (MongoDB ID).");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `/api/comptabilite/caisse?clientId=${encodeURIComponent(clientId.trim())}&soldeInitial=${soldeInitial}`
            );
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || "Erreur lors du chargement");
            setData(resData);
        } catch (err: any) {
            setError(err.message || "Erreur de chargement du brouillard de caisse.");
        } finally {
            setLoading(false);
        }
    }, [clientId, soldeInitial]);

    const etablirPV = async () => {
        if (!data) return;
        try {
            const res = await fetch("/api/comptabilite/caisse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: clientId.trim(),
                    dateArrete: new Date().toISOString().slice(0, 10),
                    caissierNom,
                    controleurNom,
                    soldeTheoriqueComptable: data.soldeFinalTheorique,
                    billetage: {
                        billets10000: Number(billets10000),
                        billets5000: Number(billets5000),
                        billets2000: Number(billets2000),
                        billets1000: Number(billets1000),
                        billets500: 0,
                        pieces500: Number(pieces500),
                        pieces250: 0,
                        pieces200: 0,
                        pieces100: 0,
                        pieces50: 0,
                        pieces25: 0,
                        pieces10: 0,
                        pieces5: 0,
                    },
                }),
            });
            const resData = await res.json();
            if (res.ok) setPvResult(resData.pv);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Wallet className="w-6 h-6 text-primary" />
                    Brouillard de Caisse, Billetage & Bouclier Anti-Caisse Négative
                </h2>
                <p className="page-subtitle">
                    Gestion rigoureuse du compte 571 (Caisse espèces), arrêté quotidien, billetage physique contradictoire et alerte anti-rejet fiscal de caisse créditrice.
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
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Solde Initial Caisse (FCFA)
                        </label>
                        <input
                            type="number"
                            value={soldeInitial}
                            onChange={(e) => setSoldeInitial(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl font-mono"
                        />
                    </div>
                </div>

                <button
                    onClick={chargerCaisse}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    Consulter le Brouillard
                </button>
            </div>

            {data && (
                <div className="space-y-6">
                    {/* Alerte Bouclier Anti-Caisse Négative */}
                    {!data.caisseSaine && data.alertesNegatives.length > 0 && (
                        <div className="p-5 rounded-2xl border border-rose-500/50 bg-rose-950/30 text-rose-200 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                                ALERTE FISCALE CRITIQUE : CAISSE CRÉDITRICE DÉTECTÉE
                            </div>
                            <p className="text-xs">
                                {data.alertesNegatives[0].risqueDescription}
                            </p>
                            <div className="text-xs bg-background/50 p-3 rounded-lg border border-rose-500/30 font-medium text-foreground">
                                <strong>Mesure de régularisation immédiate : </strong>
                                {data.alertesNegatives[0].solutionPreconisee}
                            </div>
                        </div>
                    )}

                    {/* KPI Caisse */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
                        <div className="p-4 rounded-2xl border border-border bg-card/60">
                            <span className="text-xs text-muted-foreground font-sans block">Solde d'Ouverture</span>
                            <span className="text-xl font-black text-foreground">
                                {data.soldeInitial.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl border border-border bg-card/60">
                            <span className="text-xs text-emerald-400 font-sans block flex items-center gap-1">
                                <ArrowDownRight className="w-3.5 h-3.5" /> Total Entrées
                            </span>
                            <span className="text-xl font-black text-emerald-400">
                                +{data.totalEntrees.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl border border-border bg-card/60">
                            <span className="text-xs text-rose-400 font-sans block flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5" /> Total Sorties
                            </span>
                            <span className="text-xl font-black text-rose-400">
                                -{data.totalSorties.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                        <div
                            className={cn(
                                "p-4 rounded-2xl border",
                                data.soldeFinalTheorique >= 0
                                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                                    : "border-rose-500/40 bg-rose-950/20 text-rose-300"
                            )}
                        >
                            <span className="text-xs font-sans block opacity-80">Solde Théorique de Caisse</span>
                            <span className="text-xl font-black">
                                {data.soldeFinalTheorique.toLocaleString("fr-FR")} F
                            </span>
                        </div>
                    </div>

                    {/* Journal des Opérations de Caisse */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Livre-Journal de Caisse (Brouillard)
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-muted-foreground uppercase border-b border-border/60">
                                    <tr>
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3">Pièce Justificative</th>
                                        <th className="py-2.5 px-3">Libellé de l'Opération</th>
                                        <th className="py-2.5 px-3 text-right text-emerald-400">Entrée</th>
                                        <th className="py-2.5 px-3 text-right text-rose-400">Sortie</th>
                                        <th className="py-2.5 px-3 text-right font-bold text-foreground">Solde Progressif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40 font-mono">
                                    {data.lignesAvecSolde.map((l: any) => (
                                        <tr key={l.id} className="hover:bg-muted/30 transition">
                                            <td className="py-2.5 px-3 text-muted-foreground">{l.date}</td>
                                            <td className="py-2.5 px-3 font-semibold text-foreground">{l.pieceJustificative}</td>
                                            <td className="py-2.5 px-3 font-sans text-foreground">{l.libelle}</td>
                                            <td className="py-2.5 px-3 text-right text-emerald-400">
                                                {l.entree > 0 ? `${l.entree.toLocaleString("fr-FR")} F` : "-"}
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-rose-400">
                                                {l.sortie > 0 ? `${l.sortie.toLocaleString("fr-FR")} F` : "-"}
                                            </td>
                                            <td
                                                className={cn(
                                                    "py-2.5 px-3 text-right font-black",
                                                    l.soldeProgressif >= 0 ? "text-foreground" : "text-rose-500 bg-rose-950/20"
                                                )}
                                            >
                                                {l.soldeProgressif.toLocaleString("fr-FR")} F
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section Billetage & PV de Caisse */}
                    <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">
                                    Inventaire Physique des Espèces & Billetage Contradictoire
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Comptage des coupures physiques pour l'arrêté de caisse contradictoire.
                                </p>
                            </div>
                            <button
                                onClick={etablirPV}
                                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 transition"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Établir & Signer le PV
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1">Billets de 10 000 F</label>
                                <input
                                    type="number"
                                    value={billets10000}
                                    onChange={(e) => setBillets10000(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1">Billets de 5 000 F</label>
                                <input
                                    type="number"
                                    value={billets5000}
                                    onChange={(e) => setBillets5000(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1">Billets de 2 000 F</label>
                                <input
                                    type="number"
                                    value={billets2000}
                                    onChange={(e) => setBillets2000(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1">Billets de 1 000 F</label>
                                <input
                                    type="number"
                                    value={billets1000}
                                    onChange={(e) => setBillets1000(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-muted-foreground mb-1">Pièces de 500 F</label>
                                <input
                                    type="number"
                                    value={pieces500}
                                    onChange={(e) => setPieces500(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background font-mono"
                                />
                            </div>
                        </div>

                        {pvResult && (
                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs space-y-2 mt-4 font-mono">
                                <div className="flex items-center justify-between text-emerald-300 font-bold font-sans">
                                    <span>Procès-Verbal de Caisse N° PV-{pvResult.dateArrete}</span>
                                    <span>{pvResult.estConforme ? "CONFORME" : "ÉCART CONSTATÉ"}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div>Solde Théorique : {pvResult.soldeTheoriqueComptable.toLocaleString("fr-FR")} F</div>
                                    <div>Solde Physique : {pvResult.soldePhysiqueConstate.toLocaleString("fr-FR")} F</div>
                                    <div className="font-bold">Écart : {pvResult.ecartCaisse.toLocaleString("fr-FR")} F</div>
                                </div>
                                <div className="text-muted-foreground font-sans text-[11px] pt-1 border-t border-border/40">
                                    Caissier : {pvResult.caissierNom} | Contrôleur : {pvResult.controleurNom} | {pvResult.observations}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
