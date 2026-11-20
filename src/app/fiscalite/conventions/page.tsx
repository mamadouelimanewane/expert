"use client";

import { useState, useCallback } from "react";
import {
    Globe, AlertTriangle, CheckCircle2, Loader2,
    ArrowRightLeft, FileText, Shield, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const NATURES_FLUX = [
    { id: "DIVIDENDES", label: "Dividendes versés à des actionnaires étrangers" },
    { id: "INTERETS", label: "Intérêts sur emprunts et obligations" },
    { id: "REDEVANCES_LOGICIELS_BREVETS", label: "Redevances de licences, brevets, logiciels" },
    { id: "ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES", label: "Assistance technique & Management Fees" },
    { id: "PRESTATIONS_DE_SERVICES_GENERALES", label: "Prestations de services générales" },
    { id: "GAINS_IMMOBILIERS", label: "Gains sur cession d'immeubles" },
];

const PAYS_SOURCE = [
    { code: "SN", label: "🇸🇳 Sénégal" },
    { code: "CI", label: "🇨🇮 Côte d'Ivoire" },
    { code: "CM", label: "🇨🇲 Cameroun" },
    { code: "BJ", label: "🇧🇯 Bénin" },
];

const PAYS_BENEFICIAIRE = [
    { code: "SN", label: "🇸🇳 Sénégal (UEMOA)" },
    { code: "CI", label: "🇨🇮 Côte d'Ivoire (UEMOA)" },
    { code: "BJ", label: "🇧🇯 Bénin (UEMOA)" },
    { code: "BF", label: "🇧🇫 Burkina Faso (UEMOA)" },
    { code: "ML", label: "🇲🇱 Mali (UEMOA)" },
    { code: "NE", label: "🇳🇪 Niger (UEMOA)" },
    { code: "TG", label: "🇹🇬 Togo (UEMOA)" },
    { code: "FR", label: "🇫🇷 France" },
    { code: "MA", label: "🇲🇦 Maroc" },
    { code: "BE", label: "🇧🇪 Belgique" },
    { code: "CH", label: "🇨🇭 Suisse" },
    { code: "GB", label: "🇬🇧 Royaume-Uni" },
    { code: "US", label: "🇺🇸 États-Unis" },
    { code: "CN", label: "🇨🇳 Chine" },
    { code: "AE", label: "🇦🇪 Émirats arabes unis" },
    { code: "BR", label: "🇧🇷 Brésil" },
];

interface ResultatConvention {
    conventionTrouvee: boolean;
    nomConvention?: string;
    tauxRetenueDroitCommun: number;
    tauxRetenueApplicable: number;
    montantRetenuDroitCommun: number;
    montantRetenuConventionnel: number;
    economieFiscaleClient: number;
    articleApplicable?: string;
    justificatifsObligatoires: string[];
    avertissementExpert: string;
    paysSource: string;
    paysBeneficiaire: string;
    natureFlux: string;
    montantBrutPaiement: number;
}

const f = (n: number) => n.toLocaleString("fr-FR") + " F";

export default function ConventionsFiscalesPage() {
    const [paysSource, setPaysSource] = useState("SN");
    const [paysBeneficiaire, setPaysBeneficiaire] = useState("FR");
    const [natureFlux, setNatureFlux] = useState("REDEVANCES_LOGICIELS_BREVETS");
    const [montant, setMontant] = useState(10_000_000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resultat, setResultat] = useState<ResultatConvention | null>(null);

    const analyser = useCallback(async () => {
        setLoading(true); setError(""); setResultat(null);
        try {
            const r = await fetch("/api/fiscalite/conventions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paysSource, paysBeneficiaire, natureFlux, montantBrutPaiement: montant }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Erreur serveur");
            setResultat(data.resultat);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur lors de l'analyse");
        } finally {
            setLoading(false);
        }
    }, [paysSource, paysBeneficiaire, natureFlux, montant]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="page-title flex items-center gap-3">
                    <Globe className="w-6 h-6 text-primary" />
                    Conventions Fiscales Internationales
                </h2>
                <p className="page-subtitle">
                    Applique automatiquement le taux de retenue réduit prévu par la convention bilatérale ou le Traité UEMOA.
                    Calcule l'économie fiscale et liste les justificatifs exigibles par l'administration.
                </p>
            </div>

            {/* Simulateur */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Paramètres de l'opération transfrontalière</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pays de la Source (Payeur)</label>
                        <select value={paysSource} onChange={e => setPaysSource(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-white text-sm">
                            {PAYS_SOURCE.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pays du Bénéficiaire (Destinataire)</label>
                        <select value={paysBeneficiaire} onChange={e => setPaysBeneficiaire(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-white text-sm">
                            {PAYS_BENEFICIAIRE.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nature du Flux</label>
                        <select value={natureFlux} onChange={e => setNatureFlux(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-white text-sm">
                            {NATURES_FLUX.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Montant Brut HT (FCFA)</label>
                        <input
                            type="number"
                            value={montant}
                            onChange={e => setMontant(Number(e.target.value))}
                            min={0}
                            className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-white text-sm font-mono"
                        />
                    </div>
                </div>
                <button onClick={analyser} disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                    {loading ? "Analyse en cours..." : "Analyser l'opération"}
                </button>
                {error && (
                    <div className="flex gap-2 items-start rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
                    </div>
                )}
            </div>

            {/* Résultat */}
            {resultat && (
                <div className="space-y-5">
                    {/* En-tête résultat */}
                    <div className={cn(
                        "rounded-2xl border p-5 flex items-center gap-4",
                        resultat.conventionTrouvee ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                    )}>
                        {resultat.conventionTrouvee
                            ? <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                            : <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />}
                        <div>
                            <div className={cn("font-bold", resultat.conventionTrouvee ? "text-emerald-400" : "text-amber-400")}>
                                {resultat.conventionTrouvee ? `Convention applicable : ${resultat.nomConvention}` : "Aucune convention fiscale répertoriée"}
                            </div>
                            {resultat.articleApplicable && (
                                <div className="text-xs text-slate-400 mt-1">{resultat.articleApplicable}</div>
                            )}
                        </div>
                    </div>

                    {/* Chiffrage */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Taux Droit Commun", val: `${resultat.tauxRetenueDroitCommun} %`, color: "text-rose-400" },
                            { label: "Taux Conventionnel", val: `${resultat.tauxRetenueApplicable} %`, color: "text-emerald-400" },
                            { label: "Retenue Appliquée", val: f(resultat.montantRetenuConventionnel), color: "text-white" },
                            { label: "Économie Fiscale Client", val: f(resultat.economieFiscaleClient), color: "text-primary" },
                        ].map(item => (
                            <div key={item.label} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-center">
                                <div className="text-xs text-slate-400">{item.label}</div>
                                <div className={cn("text-xl font-black mt-2", item.color)}>{item.val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Justificatifs obligatoires */}
                    {resultat.justificatifsObligatoires.length > 0 && (
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                                <FileText className="w-4 h-4 text-primary" />
                                Justificatifs obligatoires à conserver
                            </h3>
                            <ul className="space-y-2">
                                {resultat.justificatifsObligatoires.map((j, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <span>{j}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Avertissement expert */}
                    <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
                        <Shield className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                        <p>{resultat.avertissementExpert}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
