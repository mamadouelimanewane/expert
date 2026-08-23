"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    Scale,
    ShieldCheck,
    FileSearch,
    Book,
    Search,
    CheckCircle2,
    AlertTriangle,
    Zap,
    ArrowRight,
    Download,
    Gavel,
    Info,
    ExternalLink,
    Loader2,
    LayoutDashboard,
    SearchCode,
    ShieldAlert,
    Fingerprint,
    Globe,
    Cpu,
    Briefcase,
    History,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalStatute {
    id: string;
    source: "OHADA" | "CGI" | "UEMOA" | "SOCIAL";
    titre: string;
    article: string;
    description: string;
    pieceProbante: string;
    etat: "CONFORME" | "ALERTE" | "RISQUE" | "NON_EVALUE";
    etatLibelle: string;
    evalue: boolean;
}

type ClientCheckup = {
    id: string;
    nom: string;
    pays: string;
};



export default function NexusComplianceHubPage() {
    const [activeTab, setActiveTab] = useState<"checkup" | "referentiel">("checkup");
    const [clients, setClients] = useState<ClientCheckup[]>([]);
    const [clientId, setClientId] = useState("");
    const [obligations, setObligations] = useState<LegalStatute[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const [askingIA, setAskingIA] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const [aiNonConfigure, setAiNonConfigure] = useState(false);

    const selectedClient = clients.find(c => c.id === clientId) ?? null;

    // Portefeuille reel du cabinet.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) throw new Error(`Reponse ${res.status}`);
                const data = await res.json();
                const liste: ClientCheckup[] = (data.clients ?? []).map((c: Record<string, unknown>) => ({
                    id: String(c.id),
                    nom:
                        (c.companyName as string) ||
                        [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                        "Client sans nom",
                    pays: String(c.country ?? ""),
                }));
                setClients(liste);
                setClientId(prev => (liste.some(c => c.id === prev) ? prev : (liste[0]?.id ?? "")));
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
                setErreur("Impossible de charger le portefeuille clients.");
            }
        })();
    }, []);

    // Revue de conformite du client selectionne.
    const chargerCheckup = useCallback(async (id: string) => {
        setChargement(true);
        setErreur(null);
        try {
            const url = id ? `/api/compliance/checkup?clientId=${encodeURIComponent(id)}` : "/api/compliance/checkup";
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Reponse ${res.status}`);
            setObligations(data.obligations ?? []);
        } catch (e) {
            console.error("Chargement de la revue de conformite :", e);
            setErreur(e instanceof Error ? e.message : "Impossible de charger la revue de conformite.");
            setObligations([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => { chargerCheckup(clientId); }, [chargerCheckup, clientId]);

    // Appel reel a l'assistant Nexus. Sans DEEPSEEK_API_KEY, la route repond
    // qu'elle n'est pas configuree : on l'affiche tel quel plutot que de
    // fabriquer une reponse juridique.
    const [question, setQuestion] = useState("");

    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault();
        const texte = question.trim();
        if (!texte) return;

        setAskingIA(true);
        setAiResponse("");
        setAiNonConfigure(false);
        try {
            const contexte = selectedClient ? ` (client concerne : ${selectedClient.nom})` : "";
            const res = await fetch("/api/nexus/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: texte + contexte }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? `Reponse ${res.status}`);
            setAiResponse(data.response ?? "");
            setAiNonConfigure(Boolean(data.notConfigured));
        } catch (err) {
            console.error("Assistant Nexus :", err);
            setAiResponse(
                err instanceof Error ? err.message : "Echec de l'appel a l'assistant."
            );
            setAiNonConfigure(false);
        } finally {
            setAskingIA(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">

            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Global Risk & Integrity
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase text-balance">
                            Nexus <span className="text-indigo-400">Legal & Risk Integrity</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Pilotage de la conformité multi-textes : OHADA, CGI, UEMOA & Réglementations sectorielles par Intelligence Artificielle.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-indigo-500 outline-none transition-all hover:bg-white/10 shadow-xl"
                        >
                            {clients.map(client => (
                                <option key={client.id} value={client.id} className="bg-slate-900">{client.nom}</option>
                            ))}
                        </select>
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl transition-all shadow-indigo-600/30">
                            <History className="w-5 h-5" /> Historique des Audits
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Access Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/compliance/id-verify" className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Fingerprint className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">ID Verify</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Vérification d'identité & KYC Biométrique.</p>
                    </div>
                </Link>
                <Link href="/compliance/financial-crime" className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Financial Crime</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Screening sanctions, PEP & AML automatique.</p>
                    </div>
                </Link>
                <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <Gavel className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Regulatory Vault</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Bibliothèque intelligente des textes légaux.</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Elite Reporting</h4>
                        <p className="text-[10px] text-slate-500 leading-tight">Génération automatisée des rapports AUDCIF.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Diagnosis */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-white/5 rounded-[24px] w-fit">
                        {[
                            { id: "checkup", label: "Diagnostic Conformité", icon: SearchCode },
                            { id: "referentiel", label: "Référentiels Légaux", icon: Book },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3",
                                    activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "checkup" && (
                        <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Checklist de Conformité</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Referentiel OHADA / UEMOA{selectedClient ? ` \u2022 ${selectedClient.pays}` : ""}</p>
                                </div>
                                
                            </div>

                            {!chargement && !erreur && obligations.some(o => !o.evalue) && (
                                <div className="mx-8 mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                                    <span className="font-bold">
                                        {obligations.filter(o => !o.evalue).length} obligation(s) non evaluee(s).
                                    </span>{" "}
                                    L&apos;application ne se prononce que sur les points adosses a une donnee
                                    suivie sur la fiche client. Une obligation non evaluee n&apos;est ni
                                    conforme ni non conforme : elle reste a verifier.
                                </div>
                            )}

                            <div className="divide-y divide-white/5">
                                {chargement ? (
                                    <p className="p-8 text-sm text-slate-500">Chargement de la revue...</p>
                                ) : erreur ? (
                                    <p className="p-8 text-sm text-rose-400">{erreur}</p>
                                ) : obligations.length === 0 ? (
                                    <p className="p-8 text-sm text-slate-500">Aucune obligation applicable.</p>
                                ) : obligations.map((item) => (
                                    <div key={item.id} className="p-8 flex gap-8 hover:bg-white/[0.02] transition-colors group items-center">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                                            item.etat === "CONFORME" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                item.etat === "ALERTE" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    item.etat === "RISQUE" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                        "bg-slate-800 text-slate-500 border-white/5"
                                        )}>
                                            {item.etat === "CONFORME" ? <CheckCircle2 className="w-7 h-7" /> :
                                                item.etat === "NON_EVALUE" ? <Book className="w-7 h-7" /> :
                                                    <ShieldAlert className="w-7 h-7" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        {item.source} &bull; {item.article}
                                                    </span>
                                                    <h4 className="font-bold text-lg text-white uppercase tracking-tight leading-none mt-1">
                                                        {item.titre}
                                                    </h4>
                                                </div>
                                                <span className={cn(
                                                    "shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase border",
                                                    item.etat === "CONFORME" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" :
                                                        item.etat === "ALERTE" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" :
                                                            item.etat === "RISQUE" ? "text-rose-400 border-rose-500/20 bg-rose-500/5" :
                                                                "text-slate-500 border-white/10 bg-white/5"
                                                )}>
                                                    {item.etatLibelle}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                                                {item.description}
                                            </p>
                                            <p className="mt-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                                Piece probante : {item.pieceProbante}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "referentiel" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReferenceCard title="Code Général des Impôts" desc="Sénégal / Côte d'Ivoire v2026" icon={Book} color="text-rose-400" />
                            <ReferenceCard title="AUDSCGIE OHADA" desc="Sociétés Commerciales" icon={Gavel} color="text-indigo-400" />
                            <ReferenceCard title="Convention Fiscale" desc="Éviter la double imposition" icon={Globe} color="text-cyan-400" />
                            <ReferenceCard title="Réglementation Bancaire" desc="UEMOA / BCEAO" icon={ShieldCheck} color="text-amber-400" />
                        </div>
                    )}
                </div>

                {/* Right Panel: AI & Score */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-indigo-500/20 bg-gradient-to-br from-slate-900 to-indigo-900/30">
                        <div className="flex items-center gap-3 mb-8">
                            <Cpu className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Intelligence Nexus</h3>
                        </div>

                        <form onSubmit={handleAskAI} className="space-y-6">
                            <div className="relative group">
                                <textarea
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Interrogez l'assistant sur les donnees du cabinet"
                                    className="w-full h-40 bg-black/40 border border-white/5 rounded-3xl p-6 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500 outline-none resize-none transition-all group-hover:border-white/10"
                                />
                                <button
                                    type="submit"
                                    disabled={askingIA}
                                    className="absolute bottom-4 right-4 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {askingIA ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
                                </button>
                            </div>
                        </form>

                        {aiResponse && (
                            <div className={cn(
                                "mt-8 p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4",
                                aiNonConfigure
                                    ? "bg-amber-500/10 border-amber-500/20"
                                    : "bg-indigo-500/10 border-indigo-500/20"
                            )}>
                                <p className={cn(
                                    "text-xs leading-relaxed font-medium",
                                    aiNonConfigure ? "text-amber-200" : "text-indigo-200"
                                )}>
                                    {aiResponse}
                                </p>
                                <div className="mt-6 flex gap-3">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase rounded-lg border border-white/10 flex items-center gap-2">
                                        <Download className="w-3.5 h-3.5" /> Insérer Rapport
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[40px] border border-white/5 bg-slate-900/40 shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Indice d'Intégrité Global</h4>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">74.8<span className="text-xs text-slate-500 ml-1">%</span></span>
                            <div className="flex flex-col items-end">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-[9px] font-black text-emerald-400">+1.2%</span>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-6">
                            <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: '74.8%' }} />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-6 leading-relaxed italic">
                            Analyse consolidée basée sur 124 points de contrôle règlementaires.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReferenceCard({ title, desc, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group relative overflow-hidden h-64 flex flex-col justify-between shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                <Icon className="w-32 h-32" />
            </div>

            <div className="flex justify-between items-start">
                <div className={cn("p-4 rounded-2xl bg-white/5 transition-all group-hover:scale-110", color)}>
                    <Icon className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                    <ExternalLink className="w-5 h-5 text-white" />
                </div>
            </div>

            <div>
                <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight mb-2">{title}</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">{desc}</p>
            </div>
        </div>
    );
}
