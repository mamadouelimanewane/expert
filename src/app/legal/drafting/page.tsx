"use client";

import { useEffect, useState } from "react";
import {
    BookOpen,
    CheckCircle2,
    FileText,
    Gavel,
    Loader2,
    PenTool,
    Scale,
    Search,
    Sparkles,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Rédaction d'actes juridiques.
//
// Quel que soit le type d'acte choisi, cette page générait après un délai
// simulé toujours le même procès-verbal complet — société « Dakar Digital
// SA », capital de 100 000 000 FCFA, date du 4 février 2024 — sans jamais
// interroger aucun client réel ni aucun moteur d'IA. Elle affirmait aussi
// qu'un bouton « Signer (Nexus ID) » signait le document et qu'il serait
// « automatiquement indexé dans le Hub de Classification », sans que rien de
// tout cela n'existe.
//
// Elle appelle désormais /api/nexus/chat, comme le reste de l'application :
// sans DEEPSEEK_API_KEY, la réponse le dit explicitement plutôt que de
// simuler un document. Le prompt n'inclut que les informations réellement
// enregistrées sur la fiche du client sélectionné.
// ─────────────────────────────────────────────────────────────────────────────

const ACT_TYPES = [
    {
        id: "ag_annuelle",
        label: "PV d'Assemblée Générale Annuelle",
        icon: FileText,
        desc: "Approbation des comptes, affectation du résultat, quitus aux dirigeants.",
    },
    {
        id: "changement_gerant",
        label: "Changement de Gérant / Dirigeant",
        icon: Scale,
        desc: "Démission, révocation ou nomination d'un nouveau mandataire social.",
    },
    {
        id: "augmentation_capital",
        label: "Augmentation de Capital",
        icon: Zap,
        desc: "Émission d'actions nouvelles, apport en numéraire ou en nature.",
    },
    {
        id: "statuts_maj",
        label: "Mise à jour des Statuts",
        icon: BookOpen,
        desc: "Refonte globale des statuts selon le dernier Acte Uniforme OHADA.",
    },
];

type ClientOption = { id: string; nom: string; rccm: string | null; country: string | null };

export default function LegalDraftingPage() {
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientId, setClientId] = useState("");
    const [selectedAct, setSelectedAct] = useState<string | null>(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftedContent, setDraftedContent] = useState<string | null>(null);
    const [nonConfigure, setNonConfigure] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) throw new Error(`Réponse ${res.status}`);
                const data = await res.json();
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom:
                            (c.companyName as string) ||
                            [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                            "Client sans nom",
                        rccm: (c.rccm as string) ?? null,
                        country: (c.country as string) ?? null,
                    }))
                );
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
            }
        })();
    }, []);

    const handleDraft = async () => {
        const acte = ACT_TYPES.find((a) => a.id === selectedAct);
        const client = clients.find((c) => c.id === clientId);
        if (!acte) return;

        setIsDrafting(true);
        setErreur(null);
        setDraftedContent(null);
        setNonConfigure(false);
        try {
            const contexteClient = client
                ? `Client : ${client.nom}${client.rccm ? `, RCCM ${client.rccm}` : ""}${client.country ? `, ${client.country}` : ""}.`
                : "Aucun client sélectionné : indique clairement les informations manquantes plutôt que de les inventer.";

            const res = await fetch("/api/nexus/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message:
                        `Rédige un projet de « ${acte.label} » conforme à l'Acte Uniforme OHADA relatif au droit des sociétés (AUSCGIE). ${contexteClient} ` +
                        `Signale explicitement entre crochets toute information nécessaire (capital social, date, forme juridique...) qui ne t'a pas été fournie, sans jamais l'inventer.`,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Réponse ${res.status}`);

            setDraftedContent(data.response ?? "");
            setNonConfigure(Boolean(data.notConfigured));
        } catch (e) {
            console.error("Rédaction de l'acte :", e);
            setErreur(e instanceof Error ? e.message : "Échec de la génération.");
        } finally {
            setIsDrafting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Gavel className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            Rédaction d&apos;Actes Assistée par IA
                        </span>
                    </div>
                    <h2 className="page-title">
                        Nexus <span className="text-indigo-400">Legal Drafter</span>
                    </h2>
                    <p className="page-subtitle">
                        Génère un projet d&apos;acte à partir des informations réellement enregistrées sur
                        la fiche du client. Toute information manquante est signalée, jamais inventée.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Sélection & Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                            Client
                        </label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full mb-8 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white"
                        >
                            <option value="">Aucun client (générique)</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nom}
                                </option>
                            ))}
                        </select>

                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <Search className="w-6 h-6 text-indigo-400" />
                            Type d&apos;Acte
                        </h3>

                        <div className="space-y-4">
                            {ACT_TYPES.map((act) => (
                                <button
                                    key={act.id}
                                    onClick={() => setSelectedAct(act.id)}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border text-left transition-all flex items-start gap-4",
                                        selectedAct === act.id
                                            ? "bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/20"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("p-3 rounded-2xl", selectedAct === act.id ? "bg-white/10" : "bg-white/5")}>
                                        <act.icon className={cn("w-5 h-5", selectedAct === act.id ? "text-white" : "text-indigo-400")} />
                                    </div>
                                    <div>
                                        <h4 className={cn("text-sm font-black uppercase tracking-tight", selectedAct === act.id ? "text-white" : "text-slate-200")}>
                                            {act.label}
                                        </h4>
                                        <p className={cn("text-[10px] mt-1 font-medium leading-relaxed", selectedAct === act.id ? "text-indigo-100" : "text-slate-500")}>
                                            {act.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedAct && (
                            <button
                                onClick={handleDraft}
                                disabled={isDrafting}
                                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                            >
                                {isDrafting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {isDrafting ? "Rédaction en cours…" : "Générer le Projet"}
                            </button>
                        )}
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Référentiel</p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SYSCOHADA révisé
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acte Uniforme Sociétés (AUSCGIE)
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 2. Éditeur & Aperçu */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl min-h-[350px] sm:h-[450px] lg:h-[600px] flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-slate-950/40 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <PenTool className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Éditeur d&apos;Actes Juridiques</h3>
                            </div>
                        </div>

                        <div className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto">
                            {isDrafting ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-pulse">
                                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                                        <Sparkles className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white uppercase mb-2">Rédaction en cours</h4>
                                </div>
                            ) : erreur ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <p className="text-rose-400 text-sm font-medium">{erreur}</p>
                                </div>
                            ) : draftedContent ? (
                                <>
                                    {nonConfigure && (
                                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                                            L&apos;assistant IA n&apos;est pas configuré (DEEPSEEK_API_KEY manquante).
                                        </div>
                                    )}
                                    <div className="bg-white rounded-lg p-4 sm:p-8 lg:p-12 text-slate-950 font-serif leading-relaxed text-sm shadow-inner whitespace-pre-wrap">
                                        {draftedContent}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <Gavel className="w-20 h-20 text-slate-700 mb-6" />
                                    <h4 className="text-xl font-black text-slate-600 uppercase">En attente de sélection</h4>
                                    <p className="text-slate-700 text-sm font-medium max-w-xs mx-auto">
                                        Sélectionnez un client et un type d&apos;acte pour lancer la génération.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
