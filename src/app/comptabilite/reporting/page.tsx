"use client";

import { useEffect, useState } from "react";
import {
    Calendar,
    CheckCircle2,
    Download,
    FilePieChart,
    Loader2,
    Mail,
    Palette,
    Printer,
    Sparkles,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Rapport de gestion mensuel.
//
// Cette page générait, après un délai simulé, un rapport toujours au nom de
// « SOCIÉTÉ IVOIRIENNE DE BANQUE » (une institution réelle) avec un résumé
// exécutif « IA Nexus » entièrement rédigé à l'avance (« la trésorerie
// augmente de 12 % ») et des chiffres clés fixes (CA 142,5 M, EBE 42,8 M,
// trésorerie 24,5 M FCFA), présentés à côté d'un bouton « Envoyer au Client ».
// Un rapport destiné à un tiers externe portait donc des chiffres sans rapport
// avec sa situation réelle.
//
// Le client est désormais sélectionné dans le portefeuille réel, les chiffres
// clés proviennent du bilan et du compte de résultat effectivement calculés
// (/api/comptabilite/etats-financiers), et le résumé exécutif appelle Nexus
// (/api/nexus/chat) sur ces chiffres réels — qui répond honnêtement qu'il
// n'est pas configuré si aucune clé n'est renseignée, au lieu de simuler un
// texte.
// ─────────────────────────────────────────────────────────────────────────────

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
}

const TEMPLATES: ReportTemplate[] = [
    { id: "t1", name: "Elite Glass Platinum", description: "Design transparent avec effets de profondeur." },
    { id: "t2", name: "Midnight Modern", description: "Sombre, contrasté et ultra-lisible." },
    { id: "t3", name: "Solar White", description: "Clair, épuré, parfait pour l'impression." },
];

type ChiffresCles = { chiffreAffaires: number; ebe: number; tresorerieNette: number };

export default function ReportingAutomationPage() {
    const [clients, setClients] = useState<{ id: string; nom: string; email: string }[]>([]);
    const [envoiEnCours, setEnvoiEnCours] = useState(false);
    const [envoiResultat, setEnvoiResultat] = useState<{ succes: boolean; message: string } | null>(null);
    const [clientId, setClientId] = useState("");
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().substring(0, 7));
    const [selectedTemplate, setSelectedTemplate] = useState("t1");
    const [inclureSyntheseIA, setInclureSyntheseIA] = useState(true);

    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<"setup" | "preview">("setup");
    const [erreur, setErreur] = useState<string | null>(null);

    const [chiffres, setChiffres] = useState<ChiffresCles | null>(null);
    const [synthese, setSynthese] = useState<string>("");
    const [syntheseNonConfiguree, setSyntheseNonConfiguree] = useState(false);
    const [nomClient, setNomClient] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) return;
                const data = await res.json();
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                        email: String(c.email ?? ""),
                    }))
                );
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
            }
        })();
    }, []);

    const handleGenerate = async () => {
        if (!clientId) {
            setErreur("Sélectionnez un client avant de générer le rapport.");
            return;
        }

        setIsGenerating(true);
        setErreur(null);
        try {
            const [rb, rr] = await Promise.all([
                fetch(`/api/comptabilite/etats-financiers/bilan?clientId=${clientId}&periode=${selectedPeriod}`),
                fetch(`/api/comptabilite/etats-financiers/resultat?clientId=${clientId}&periode=${selectedPeriod}`),
            ]);
            const [db, dr] = await Promise.all([rb.json(), rr.json()]);
            if (!rb.ok) throw new Error(db.error ?? `Réponse ${rb.status}`);
            if (!rr.ok) throw new Error(dr.error ?? `Réponse ${rr.status}`);

            const trouver = (lignes: { code: string; netN: number }[], code: string) =>
                lignes.find((l: { code: string }) => l.code === code)?.netN ?? 0;

            const ca = trouver(dr.resultat ?? [], "XB");
            const ebe = trouver(dr.resultat ?? [], "XD");
            const tresoActif = trouver(db.actif ?? [], "BT");
            const tresoPassif = trouver(db.passif ?? [], "DT");

            const c: ChiffresCles = { chiffreAffaires: ca, ebe, tresorerieNette: tresoActif - tresoPassif };
            setChiffres(c);
            setNomClient(clients.find((cl) => cl.id === clientId)?.nom ?? "Client");

            if (inclureSyntheseIA) {
                const res = await fetch("/api/nexus/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message:
                            `Rédige un résumé exécutif court (5 lignes maximum) pour un rapport de gestion mensuel, sur la base de ces chiffres réels : ` +
                            `chiffre d'affaires ${c.chiffreAffaires.toLocaleString("fr-FR")} FCFA, excédent brut d'exploitation ${c.ebe.toLocaleString("fr-FR")} FCFA, ` +
                            `trésorerie nette ${c.tresorerieNette.toLocaleString("fr-FR")} FCFA. N'invente aucun autre chiffre ni aucune comparaison avec un mois antérieur si elle ne t'est pas fournie.`,
                    }),
                });
                const data = await res.json();
                setSynthese(data.response ?? "");
                setSyntheseNonConfiguree(Boolean(data.notConfigured));
            } else {
                setSynthese("");
                setSyntheseNonConfiguree(false);
            }

            setStep("preview");
        } catch (e) {
            console.error("Génération du rapport :", e);
            setErreur(e instanceof Error ? e.message : "Échec de la génération.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSendToClient = async () => {
        if (!chiffres) return;
        const client = clients.find((c) => c.id === clientId);
        if (!client?.email) {
            setEnvoiResultat({ succes: false, message: "Aucune adresse e-mail pour ce client." });
            return;
        }
        setEnvoiEnCours(true);
        setEnvoiResultat(null);
        try {
            const res = await fetch("/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: client.email,
                    subject: `Rapport de gestion — ${selectedPeriod}`,
                    text: `Bonjour,\n\nVoici votre rapport de gestion pour la période ${selectedPeriod} :\n\n- Chiffre d'affaires : ${chiffres.chiffreAffaires.toLocaleString("fr-FR")} FCFA\n- Excédent brut d'exploitation : ${chiffres.ebe.toLocaleString("fr-FR")} FCFA\n- Trésorerie nette : ${chiffres.tresorerieNette.toLocaleString("fr-FR")} FCFA\n\n${synthese ? `Résumé : ${synthese}\n\n` : ""}Cordialement,\nCabinet 360`,
                    context: { entity: "REPORT" },
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setEnvoiResultat({ succes: false, message: data.error || "Échec de l'envoi." });
                return;
            }
            setEnvoiResultat({ succes: true, message: `Rapport envoyé à ${client.email}.` });
        } catch (e) {
            console.error(e);
            setEnvoiResultat({ succes: false, message: "Erreur de connexion au serveur." });
        } finally {
            setEnvoiEnCours(false);
        }
    };

    const fcfa = (n: number) => `${(n / 1_000_000).toFixed(1)} M`;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <FilePieChart className="w-56 h-56 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                        Rapport de gestion
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-4">Génération de rapport</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Chiffres réellement calculés à partir du bilan et du compte de résultat du
                        client sélectionné.
                    </p>
                </div>
            </div>

            {erreur && <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-300">{erreur}</div>}

            {step === "setup" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white mb-6">Client</h3>
                            <select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full max-w-md bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                            >
                                <option value="">Sélectionner un client</option>
                                {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                        </div>

                        <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <Palette className="w-6 h-6 text-indigo-400" />
                                Style du rapport
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {TEMPLATES.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => setSelectedTemplate(tpl.id)}
                                        className={cn(
                                            "text-left p-5 rounded-2xl border transition-all",
                                            selectedTemplate === tpl.id ? "bg-indigo-600/20 border-indigo-500/50" : "bg-white/5 border-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-white text-sm">{tpl.name}</h4>
                                            {selectedTemplate === tpl.id && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                                        </div>
                                        <p className="text-xs text-slate-500">{tpl.description}</p>
                                    </button>
                                ))}
                            </div>

                            <label className="mt-8 flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 cursor-pointer">
                                <div>
                                    <h4 className="font-bold text-white text-sm">Synthèse exécutive (Nexus IA)</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Génère un court résumé sur les chiffres réels. Répond « non
                                        configuré » sans clé DeepSeek.
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={inclureSyntheseIA}
                                    onChange={(e) => setInclureSyntheseIA(e.target.checked)}
                                    className="w-5 h-5"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/60 shadow-2xl">
                            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Période
                            </h3>
                            <input
                                type="month"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white mb-8"
                            />

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !clientId}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                {isGenerating ? "Calcul en cours…" : "Générer le rapport"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === "preview" && chiffres && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                        <button onClick={() => setStep("setup")} className="text-slate-400 hover:text-white text-sm font-bold">
                            ← Modifier
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => window.print()} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                                <Printer className="w-4 h-4" /> Imprimer
                            </button>
                            <button disabled title="Export PDF non encore disponible" className="px-6 py-3 bg-white/50 text-indigo-950/50 rounded-xl font-bold text-xs flex items-center gap-2 cursor-not-allowed">
                                <Download className="w-4 h-4" /> Télécharger PDF
                            </button>
                            <button
                                onClick={handleSendToClient}
                                disabled={envoiEnCours}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" /> {envoiEnCours ? "Envoi..." : "Envoyer au Client"}
                            </button>
                        </div>
                    </div>
                    {envoiResultat && (
                        <p className={cn("text-xs text-right -mt-4", envoiResultat.succes ? "text-emerald-400" : "text-amber-400")}>
                            {envoiResultat.message}
                        </p>
                    )}

                    <div className="bg-white rounded-[40px] shadow-2xl p-8 sm:p-12 lg:p-20 text-slate-900 space-y-12">
                        <div className="flex justify-between items-end border-b-2 border-slate-950 pb-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-2">Synthèse de Gestion</p>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tighter">{nomClient}</h1>
                                <p className="text-slate-500 font-bold mt-2">Situation mensuelle — {selectedPeriod}</p>
                            </div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Généré par Cabinet 360</p>
                        </div>

                        {inclureSyntheseIA && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-black uppercase tracking-widest border-l-4 border-indigo-600 pl-6 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Résumé exécutif
                                </h2>
                                {syntheseNonConfiguree && (
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                        L&apos;assistant IA n&apos;est pas configuré (DEEPSEEK_API_KEY manquante).
                                    </p>
                                )}
                                <p className="text-base text-slate-700 leading-relaxed font-serif italic">{synthese}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Chiffre d&apos;affaires</p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-950">{fcfa(chiffres.chiffreAffaires)} <span className="text-xs text-slate-400">FCFA</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Excédent brut (EBE)</p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-950">{fcfa(chiffres.ebe)} <span className="text-xs text-slate-400">FCFA</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Trésorerie nette</p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-950">{fcfa(chiffres.tresorerieNette)} <span className="text-xs text-slate-400">FCFA</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
