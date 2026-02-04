"use client";

import { useState } from "react";
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
import { mockClients } from "@/data/mock-clients";

interface LegalStatute {
    id: string;
    source: "OHADA" | "CGI" | "UEMOA" | "Social";
    title: string;
    article: string;
    complianceStatus: "Conforme" | "Alerte" | "Risque";
    desc: string;
}

const COMPLIANCE_ITEMS: LegalStatute[] = [
    { id: "1", source: "OHADA", title: "Dépôt des comptes annuels", article: "Art. 269 AUDSCGIE", complianceStatus: "Alerte", desc: "Le dépôt des comptes doit se faire dans le mois suivant l'AG." },
    { id: "2", source: "CGI", title: "Retenue à la source (BNC)", article: "Art. 92 CGI CI", complianceStatus: "Conforme", desc: "Reversement effectué avant le 15 du mois suivant." },
    { id: "3", source: "OHADA", title: "Tenue des livres obligatoires", article: "Art. 13 AUDCIF", complianceStatus: "Risque", desc: "Livre d'inventaire non coté et non paraphé détecté." },
    { id: "4", source: "UEMOA", title: "Réglementation des changes", article: "Directrice 02/2004", complianceStatus: "Conforme", desc: "Déclaration des transferts hors zone UEMOA validée." },
];

export default function NexusComplianceHubPage() {
    const [activeTab, setActiveTab] = useState<"checkup" | "referentiel">("checkup");
    const [selectedClient, setSelectedClient] = useState(mockClients[0]);
    const [askingIA, setAskingIA] = useState(false);
    const [aiResponse, setAiResponse] = useState("");

    const handleAskAI = (e: React.FormEvent) => {
        e.preventDefault();
        setAskingIA(true);
        setTimeout(() => {
            setAskingIA(false);
            setAiResponse("Conformément aux directives de la CEMAC et de l'UEMOA, ainsi qu'aux Actes Uniformes OHADA, l'intégrité des données comptables repose sur le principe de non-altérabilité. L'Assistant IA suggère une revue immédiate du registre des assemblées pour le client " + selectedClient.name + " afin de valider la conformité aux nouvelles normes de gouvernance 2026.");
        }, 2000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
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
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase text-balance">
                            Nexus <span className="text-indigo-400">Legal & Risk Integrity</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Pilotage de la conformité multi-textes : OHADA, CGI, UEMOA & Réglementations sectorielles par Intelligence Artificielle.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedClient.id}
                            onChange={(e) => setSelectedClient(mockClients.find(c => c.id === e.target.value) || mockClients[0])}
                            className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-xs font-bold focus:ring-indigo-500 outline-none transition-all hover:bg-white/10 shadow-xl"
                        >
                            {mockClients.map(client => (
                                <option key={client.id} value={client.id} className="bg-slate-900">{client.name}</option>
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
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base de données Nexus • {selectedClient.country} v2026</p>
                                </div>
                                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">Scanner Tout</button>
                            </div>

                            <div className="divide-y divide-white/5">
                                {COMPLIANCE_ITEMS.map((item) => (
                                    <div key={item.id} className="p-8 flex gap-8 hover:bg-white/[0.02] transition-colors group items-center">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                                            item.complianceStatus === "Conforme" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                item.complianceStatus === "Alerte" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:scale-110"
                                        )}>
                                            {item.complianceStatus === "Conforme" ? <CheckCircle2 className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.source} • {item.article}</span>
                                                    <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none mt-1">{item.title}</h4>
                                                </div>
                                                <span className={cn(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase border",
                                                    item.complianceStatus === "Conforme" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 px-4" :
                                                        item.complianceStatus === "Alerte" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                                                )}>{item.complianceStatus}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"{item.desc}"</p>
                                        </div>
                                        <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
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
                                    placeholder="Interrogez le corpus juridique (ex: Clause de sortie en SAS OHADA...)"
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
                            <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl animate-in fade-in slide-in-from-top-4">
                                <p className="text-xs text-indigo-200 leading-relaxed font-medium">
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

                    <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40 shadow-xl">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Indice d'Intégrité Global</h4>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-4xl font-black text-white">74.8<span className="text-xs text-slate-500 ml-1">%</span></span>
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
