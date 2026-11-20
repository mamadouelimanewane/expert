"use client";

import { useState, useCallback } from "react";
import {
    AlertTriangle, Download, FileText, Loader2,
    CheckCircle2, XCircle, Hash, ArrowDownToLine, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

interface AnomalieFEC {
    code: string;
    libelle: string;
    description: string;
    gravite: "CRITIQUE" | "MAJEURE" | "MINEURE";
}

interface ResultatFEC {
    totalLignes: number;
    totalDebit: number;
    totalCredit: number;
    sha256: string;
    anomalies: AnomalieFEC[];
    exercice: number;
    clientId: string;
    format: "tab" | "pipe";
}

// --- Helpers ---

const f = (n: number) => Math.abs(n).toLocaleString("fr-FR") + " F";

const GRAVITE_CONFIG = {
    CRITIQUE: "bg-rose-600/20 text-rose-200 border-rose-500/40",
    MAJEURE: "bg-amber-500/20 text-amber-200 border-amber-500/40",
    MINEURE: "bg-blue-500/20 text-blue-200 border-blue-500/40",
};

// --- Composant principal ---

export default function FECPage() {
    const [clientId, setClientId] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [format, setFormat] = useState<"tab" | "pipe">("tab");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<ResultatFEC | null>(null);

    // Construit l'URL de base pour l'API FEC
    const buildUrl = useCallback(
        (download = false) =>
            `/api/fiscalite/fec?clientId=${encodeURIComponent(clientId)}&exercice=${exercice}&format=${format}${download ? "&download=1" : ""}`,
        [clientId, exercice, format]
    );

    // Génère et affiche le FEC (aperçu des métadonnées)
    const genererFEC = useCallback(async () => {
        if (!clientId.trim()) {
            setError("Veuillez saisir un identifiant client.");
            return;
        }
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const r = await fetch(buildUrl());
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Erreur serveur");
            setResult(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur lors de la génération du FEC");
        } finally {
            setLoading(false);
        }
    }, [clientId, buildUrl]);

    // Déclenche le téléchargement du fichier FEC
    const telechargerFEC = useCallback(() => {
        if (!clientId.trim()) {
            setError("Veuillez saisir un identifiant client.");
            return;
        }
        window.location.href = buildUrl(true);
    }, [clientId, buildUrl]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* En-tête */}
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    Fichier des Écritures Comptables (FEC)
                </h2>
                <p className="page-subtitle">
                    Génération du FEC conforme à l'article L47 A du LPF. Le fichier est utilisé
                    lors des contrôles fiscaux pour vérifier l'exactitude de la comptabilité.
                </p>
            </div>

            {/* Bannière d'avertissement officielle */}
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                <Shield className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                <span>
                    <strong>Document officiel :</strong> Le fichier FEC est un document officiel requis en cas de contrôle fiscal.
                    Ne transmettez que des FEC certifiés par le cabinet.
                </span>
            </div>

            {/* Paramètres */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                    Paramètres d'export
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Identifiant client */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            ID Client
                        </label>
                        <input
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                            placeholder="Identifiant MongoDB du client..."
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white text-sm"
                        />
                    </div>

                    {/* Exercice */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Exercice
                        </label>
                        <input
                            type="number"
                            value={exercice}
                            onChange={e => setExercice(Number(e.target.value))}
                            min={2020}
                            max={2030}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white text-sm"
                        />
                    </div>
                </div>

                {/* Sélecteur de format (onglets) */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Format du séparateur
                    </label>
                    <div className="inline-flex rounded-xl border border-white/10 overflow-hidden">
                        {(["tab", "pipe"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFormat(f)}
                                className={cn(
                                    "px-5 py-2.5 text-sm font-semibold transition-colors",
                                    format === f
                                        ? "bg-primary text-white"
                                        : "bg-slate-900 text-slate-400 hover:text-white"
                                )}
                            >
                                {f === "tab" ? "Tabulation (\\t)" : "Pipe (|)"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={genererFEC}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {loading ? "Génération en cours..." : "Générer FEC"}
                    </button>
                    <button
                        onClick={telechargerFEC}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 text-white px-6 py-3 font-semibold text-sm hover:bg-white/5 disabled:opacity-50 transition-colors"
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Télécharger FEC
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="flex gap-2 items-start rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* État vide (avant génération) */}
            {!loading && !result && !error && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-12 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-600" />
                    <p className="text-slate-400 text-sm">
                        Sélectionnez un client et un exercice, puis cliquez sur <strong className="text-slate-300">Générer FEC</strong>.
                    </p>
                </div>
            )}

            {/* Spinner de chargement */}
            {loading && (
                <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-12 gap-3 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Génération du FEC en cours, veuillez patienter…</span>
                </div>
            )}

            {/* Résultats */}
            {result && (
                <div className="space-y-6">
                    {/* Verdict global */}
                    <div className={cn(
                        "flex items-center gap-4 rounded-2xl border p-5",
                        result.anomalies.length === 0
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : result.anomalies.some(a => a.gravite === "CRITIQUE")
                                ? "bg-rose-500/10 border-rose-500/30"
                                : "bg-amber-500/10 border-amber-500/30"
                    )}>
                        {result.anomalies.length === 0 ? (
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                        ) : result.anomalies.some(a => a.gravite === "CRITIQUE") ? (
                            <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                        )}
                        <div>
                            <div className={cn(
                                "font-bold text-lg",
                                result.anomalies.length === 0 ? "text-emerald-400" :
                                    result.anomalies.some(a => a.gravite === "CRITIQUE") ? "text-rose-400" : "text-amber-400"
                            )}>
                                {result.anomalies.length === 0
                                    ? "FEC généré — Aucune anomalie détectée"
                                    : `FEC généré — ${result.anomalies.length} anomalie(s) détectée(s)`}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                Client {result.clientId} — Exercice {result.exercice} — Format {result.format === "tab" ? "Tabulation" : "Pipe"}
                            </p>
                        </div>
                    </div>

                    {/* Statistiques du FEC */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Total lignes", value: result.totalLignes.toLocaleString("fr-FR"), icon: FileText },
                            { label: "Total débit", value: f(result.totalDebit), icon: Download },
                            { label: "Total crédit", value: f(result.totalCredit), icon: Download },
                            { label: "Équilibre", value: result.totalDebit === result.totalCredit ? "✓ Équilibré" : "⚠ Déséquilibré", icon: CheckCircle2 },
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 space-y-1">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                <div className="text-lg font-black text-white font-mono">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Empreinte SHA-256 */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-2">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Empreinte d'intégrité SHA-256
                        </h3>
                        <code className="block text-xs font-mono text-emerald-300 bg-slate-900 rounded-xl px-4 py-3 break-all border border-white/5">
                            {result.sha256}
                        </code>
                        <p className="text-xs text-slate-500">
                            Cette empreinte certifie l'intégrité du fichier FEC. Conservez-la avec le fichier exporté.
                        </p>
                    </div>

                    {/* Anomalies */}
                    {result.anomalies.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-bold text-white">
                                Anomalies détectées ({result.anomalies.length})
                            </h3>
                            {result.anomalies.map((anomalie, i) => (
                                <div
                                    key={i}
                                    className={cn("rounded-2xl border p-5 space-y-2", GRAVITE_CONFIG[anomalie.gravite])}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "rounded-full px-2 py-0.5 text-xs font-bold border",
                                            GRAVITE_CONFIG[anomalie.gravite]
                                        )}>
                                            {anomalie.gravite}
                                        </span>
                                        <span className="font-semibold">{anomalie.libelle}</span>
                                        <code className="ml-auto text-xs font-mono opacity-60">{anomalie.code}</code>
                                    </div>
                                    <p className="text-sm opacity-80">{anomalie.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Bouton de téléchargement dans les résultats */}
                    <button
                        onClick={telechargerFEC}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-6 py-3 font-semibold text-sm hover:bg-emerald-500 transition-colors"
                    >
                        <ArrowDownToLine className="w-4 h-4" />
                        Télécharger le fichier FEC
                    </button>
                </div>
            )}
        </div>
    );
}
