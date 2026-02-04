"use client";

import { useState } from "react";
import {
    FileText,
    Plus,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Zap,
    Sparkles,
    Send,
    PenTool,
    Users,
    Building2,
    CreditCard,
    ChevronRight,
    Download,
    Eye,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Proposal {
    id: string;
    client: string;
    type: "Accounting" | "Audit" | "Legal" | "Advisory";
    title: string;
    amount: string;
    status: "Draft" | "Sent" | "Signed" | "Expired";
    date: string;
    expert: string;
}

const MOCK_PROPOSALS: Proposal[] = [
    { id: "PROP-2024-001", client: "Dakar Digital SA", type: "Accounting", title: "Tenue Comptable & Reporting Periodique", amount: "3 500 000 FCFA", status: "Signed", date: "2024-01-20", expert: "Awa D." },
    { id: "PROP-2024-002", client: "Logistics Express", type: "Audit", title: "Commissariat aux Comptes 2023-2025", amount: "12 000 000 FCFA", status: "Sent", date: "2024-02-01", expert: "Moussa S." },
    { id: "PROP-2024-003", client: "Pharmacie Touba", type: "Advisory", title: "Business Plan & Recherche de Financement", amount: "1 800 000 FCFA", status: "Draft", date: "2024-02-02", expert: "Jean-Paul M." },
];

export default function ProposalsHub() {
    const [view, setView] = useState<"list" | "builder">("list");
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header: Proposals & Engagement Letters */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <FileText className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Commercial & Contract Management
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                OHADA Compliant Templates
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Lettres de <span className="text-indigo-400">Mission & Devis</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Générez des propositions commerciales premium et des lettres de mission certifiées en quelques clics grâce à l'IA.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setView(view === "list" ? "builder" : "list")}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                        >
                            {view === "list" ? <><Plus className="w-5 h-5" /> Nouvelle Proposition</> : <><History className="w-5 h-5" /> Voir l'historique</>}
                        </button>
                    </div>
                </div>
            </div>

            {view === "list" ? (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <PropStat icon={Zap} label="Taux de Conversion" value="42%" color="text-indigo-400" />
                        <PropStat icon={Clock} label="En attente signature" value="12" color="text-amber-400" />
                        <PropStat icon={CheckCircle2} label="Signées ce mois" value="5" color="text-emerald-400" />
                        <PropStat icon={CreditCard} label="Pipeline Commercial" value="45.5M" unit="F" color="text-cyan-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Proposals List */}
                        <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 flex flex-col shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Propositions Récentes</h3>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <input placeholder="Rechercher..." className="bg-slate-800/80 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {MOCK_PROPOSALS.map((prop) => (
                                    <div key={prop.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{prop.client}</h4>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                                        prop.type === "Audit" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            prop.type === "Legal" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                                "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                    )}>
                                                        {prop.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{prop.title}</p>
                                                <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-600">
                                                    <span className="flex items-center gap-1"><History className="w-3 h-3" /> Créée le {prop.date}</span>
                                                    <span>Expert: {prop.expert}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Montant</p>
                                                    <p className="text-lg font-black text-white">{prop.amount}</p>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                                    prop.status === "Signed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        prop.status === "Sent" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]" :
                                                            "bg-slate-700/10 text-slate-500 border-slate-700/20"
                                                )}>
                                                    {prop.status}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar: Templates & AI */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card p-10 rounded-[48px] border border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-32 h-32 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                                    Nexus Draft AI
                                </h3>

                                <p className="text-xs text-slate-400 leading-relaxed font-medium mb-8">
                                    Laissez l'IA rédiger vos clauses spécifiques en se basant sur le secteur d'activité du client et la réglementation OHADA.
                                </p>

                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group/item">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-white uppercase">Expertise-Comptable</span>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group/item">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-white uppercase">Commissariat aux Comptes</span>
                                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-indigo-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 p-6 bg-indigo-600/20 border border-white/10 rounded-3xl text-center cursor-pointer hover:bg-indigo-600/30 transition-all">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Configurer les Honoraires Types</p>
                                    <CreditCard className="w-5 h-5 text-indigo-400 mx-auto mt-2" />
                                </div>
                            </div>

                            <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                        <PenTool className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h4 className="text-white font-black uppercase text-xs tracking-widest leading-relaxed">État des <br /> Signatures</h4>
                                </div>
                                <div className="space-y-4">
                                    <SignatureStatus name="Dakar Digital" status="signed" />
                                    <SignatureStatus name="Logistics Ex." status="pending" />
                                    <SignatureStatus name="Pharmacie Touba" status="none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass-card rounded-[60px] border border-white/5 bg-slate-900/40 p-12 shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-12">
                        <button onClick={() => setView("list")} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all">
                            <ChevronRight className="w-4 h-4 rotate-180" /> Retour
                        </button>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Générateur de Proposition IA</h3>
                        <div className="w-24" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Rechercher un Client / Prospect</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input placeholder="Ex: SOG GABON..." className="w-full bg-slate-800/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Type de Mission & Template</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Expertise-Comptable", "Audit & Commissariat", "Conseil & Advisory", "Juridique & Fiscal"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTemplate(t)}
                                            className={cn(
                                                "p-6 rounded-3xl border text-center transition-all",
                                                selectedTemplate === t ? "bg-indigo-600/10 border-indigo-500 text-white shadow-xl" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                                            )}
                                        >
                                            <FileText className="w-6 h-6 mx-auto mb-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Description des Besoins (IA Input)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Décrivez les spécificités de la mission pour que l'IA adapte les clauses..."
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-[32px] p-6 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-950/50 border border-white/5 rounded-[48px] p-10 relative flex flex-col items-center justify-center text-center">
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 rounded-full text-[8px] font-black text-white uppercase tracking-[0.3em] shadow-lg shadow-indigo-600/20">
                                Aperçu Interactive
                            </div>

                            <div className="w-full max-w-sm aspect-[1/1.414] bg-white rounded-xl shadow-2xl relative p-8 text-slate-900 text-left scale-90 sm:scale-100">
                                <div className="border-b-4 border-indigo-600 pb-4 mb-6">
                                    <h4 className="font-black text-xl">LETTRE DE MISSION</h4>
                                    <p className="text-[10px] font-bold text-slate-500">RÉF: PROP-2024-NEW</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-slate-200 rounded" />
                                    <div className="h-2 w-full bg-slate-100 rounded" />
                                    <div className="h-2 w-5/6 bg-slate-100 rounded" />
                                    <div className="h-2 w-full bg-slate-50 rounded" />
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <p className="text-[8px] font-black uppercase text-indigo-600 mb-4">Détail des prestations</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="font-bold">Tenue comptable</span>
                                            <span className="font-black">150 000 F/m</span>
                                        </div>
                                        <div className="flex justify-between text-[10px]">
                                            <span className="font-bold">Reporting Nexus IA</span>
                                            <span className="font-black">Inclus</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-8 left-8 right-8 flex justify-between gap-4">
                                    <div className="h-8 flex-1 bg-slate-50 border border-dashed border-slate-300 rounded flex items-center justify-center text-[6px] font-black text-slate-400">SIGNATURE CABINET</div>
                                    <div className="h-8 flex-1 bg-slate-50 border border-dashed border-slate-300 rounded flex items-center justify-center text-[6px] font-black text-slate-400">SIGNATURE CLIENT</div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4 w-full px-10">
                                <button className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                    <Download className="w-4 h-4" /> Télécharger PDF
                                </button>
                                <button className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3">
                                    <Send className="w-4 h-4" /> Envoyer & Signer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PropStat({ icon: Icon, label, value, unit, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-tighter">Live</div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}

function SignatureStatus({ name, status }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status === "signed" ? "bg-emerald-500" : status === "pending" ? "bg-amber-500" : "bg-slate-700"
                )} />
                <span className="text-xs font-bold text-slate-300 truncate w-32">{name}</span>
            </div>
            <span className={cn(
                "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                status === "signed" ? "bg-emerald-500/10 text-emerald-400" :
                    status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-500"
            )}>
                {status}
            </span>
        </div>
    );
}
