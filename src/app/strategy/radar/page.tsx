"use client";

import { useEffect, useState } from "react";
import { Radar, Loader2, AlertTriangle, Send } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Veille réglementaire assistée par IA.
//
// Cette page affirmait qu'une IA « surveille les lois de finances OHADA » et
// avait détecté des changements fictifs avec impact chiffré et bouton de
// notification client — recherche faite (OHADA.org, journaux officiels
// nationaux) : aucun flux de veille légale externe automatisable n'existe.
// Plutôt que de simuler une détection, la page devient un outil d'aide à
// l'analyse : le collaborateur colle lui-même un texte qu'il a repéré, et
// l'IA en résume l'impact potentiel sur le portefeuille réel du cabinet
// (voir /api/nexus/veille). Aucune notification n'est envoyée automatiquement.
// ─────────────────────────────────────────────────────────────────────────────

const PAYS = ["", "SN", "CI", "CM", "BJ", "BF", "ML", "TG", "NE"];

export default function RadarImpactPage() {
    const [texteLoi, setTexteLoi] = useState("");
    const [pays, setPays] = useState("");
    const [analyse, setAnalyse] = useState<string | null>(null);
    const [nonConfigure, setNonConfigure] = useState(false);
    const [enCours, setEnCours] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const [fournisseur, setFournisseur] = useState<{ provider: string | null; model: string | null; configured: boolean } | null>(null);
    const [consentement, setConsentement] = useState(false);

    useEffect(() => {
        fetch("/api/nexus/veille")
            .then(async (res) => {
                if (!res.ok) throw new Error("Impossible de vérifier la configuration IA.");
                const data = await res.json();
                setFournisseur(data.llm);
            })
            .catch((e) => setErreur(e instanceof Error ? e.message : "Configuration IA indisponible."));
    }, []);

    const analyser = async () => {
        if (texteLoi.trim().length < 20) {
            setErreur("Collez le texte de la loi, du décret ou de la circulaire à analyser (20 caractères minimum).");
            return;
        }
        if (!consentement) {
            setErreur("Confirmez la transmission au fournisseur IA pour continuer.");
            return;
        }
        setEnCours(true);
        setErreur(null);
        setAnalyse(null);
        try {
            const res = await fetch("/api/nexus/veille", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texteLoi, pays: pays || undefined, consentementTransmission: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Échec de l'analyse.");
            setAnalyse(data.response);
            setNonConfigure(Boolean(data.notConfigured));
        } catch (e) {
            setErreur(e instanceof Error ? e.message : "Échec de l'analyse.");
        } finally {
            setEnCours(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Radar className="w-8 h-8 text-rose-500" /> Veille réglementaire
                </h2>
                <p className="page-subtitle">
                    Aucune détection automatique de nouvelles lois n&apos;est disponible. Collez le texte d&apos;une loi, d&apos;un décret ou d&apos;une
                    circulaire que vous avez repéré : l&apos;IA en résume l&apos;impact potentiel sur le portefeuille réel du cabinet.
                </p>
            </div>

            <div className="apix-card space-y-4">
                <div className="flex justify-between items-center gap-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Texte à analyser</label>
                    <select value={pays} onChange={(e) => setPays(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white">
                        <option value="">Pays (optionnel)</option>
                        {PAYS.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <textarea
                    value={texteLoi}
                    onChange={(e) => setTexteLoi(e.target.value)}
                    placeholder="Collez ici le texte de la loi de finances, du décret ou de la circulaire…"
                    className="w-full h-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm text-slate-900 dark:text-white resize-none focus:outline-none focus:border-rose-500"
                />
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300">
                    <p>
                        Pour produire l&apos;analyse, le texte collé et un résumé de données du cabinet (nombre de clients, factures en retard, échéances fiscales et missions en cours) seront envoyés au fournisseur IA configuré
                        {fournisseur?.provider ? ` (${fournisseur.provider}${fournisseur.model ? ` · ${fournisseur.model}` : ""})` : ""}.
                        N&apos;incluez pas de données personnelles ou confidentielles inutiles.
                    </p>
                    <label className="mt-3 flex cursor-pointer items-start gap-2">
                        <input type="checkbox" checked={consentement} onChange={(e) => setConsentement(e.target.checked)} className="mt-1 accent-rose-500" />
                        <span>Je confirme que ce texte peut être transmis à ce fournisseur IA pour analyse.</span>
                    </label>
                </div>
                {erreur && <p className="text-sm text-red-400">{erreur}</p>}
                <button
                    onClick={analyser}
                    disabled={enCours || !consentement || !fournisseur?.configured}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all"
                >
                    {enCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {enCours ? "Analyse en cours…" : "Analyser l'impact potentiel"}
                </button>
            </div>

            {analyse && (
                <div className="apix-card space-y-3">
                    {nonConfigure && (
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                            <AlertTriangle className="w-3.5 h-3.5" /> Non configuré
                        </div>
                    )}
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{analyse}</p>
                </div>
            )}

            <p className="text-slate-500 text-xs">
                Le calendrier des échéances fiscales connues reste disponible depuis les modules Fiscalité.
            </p>
        </div>
    );
}
