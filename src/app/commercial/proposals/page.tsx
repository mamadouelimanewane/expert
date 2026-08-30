"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    MoreVertical,
    Zap,
    Send,
    Building2,
    CreditCard,
    ChevronRight,
    Eye,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Proposal {
    id: string;
    client: { companyName: string | null; firstName: string | null; lastName: string | null };
    expert: { firstName: string; lastName: string } | null;
    type: "ACCOUNTING" | "AUDIT" | "LEGAL" | "ADVISORY";
    title: string;
    amount: number;
    status: "DRAFT" | "SENT" | "SIGNED" | "EXPIRED";
    date: string;
}

const TYPE_LABEL: Record<string, string> = { ACCOUNTING: "Comptabilité", AUDIT: "Audit", LEGAL: "Juridique", ADVISORY: "Conseil" };
const STATUS_LABEL: Record<string, string> = { DRAFT: "Brouillon", SENT: "Envoyée", SIGNED: "Signée", EXPIRED: "Expirée" };

function clientName(c: { companyName: string | null; firstName: string | null; lastName: string | null }) {
    return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—";
}

export default function ProposalsHub() {
    const [view, setView] = useState<"list" | "builder">("list");
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState<any[]>([]);

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [builderClientId, setBuilderClientId] = useState("");
    const [builderTitle, setBuilderTitle] = useState("");
    const [builderAmount, setBuilderAmount] = useState("");
    const [builderDescription, setBuilderDescription] = useState("");
    const [saving, setSaving] = useState(false);

    const loadProposals = () => {
        fetch("/api/proposals")
            .then(res => res.json())
            .then(data => setProposals(data.proposals || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProposals();
        fetch("/api/clients").then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const handleCreate = async () => {
        if (!builderClientId || !builderTitle) return;
        setSaving(true);
        try {
            const typeMap: Record<string, string> = {
                "Expertise-Comptable": "ACCOUNTING",
                "Audit & Commissariat": "AUDIT",
                "Conseil & Advisory": "ADVISORY",
                "Juridique & Fiscal": "LEGAL",
            };
            await fetch("/api/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: builderTitle,
                    type: selectedTemplate ? typeMap[selectedTemplate] : "ACCOUNTING",
                    amount: builderAmount,
                    clientId: builderClientId,
                }),
            });
            setView("list");
            setBuilderClientId(""); setBuilderTitle(""); setBuilderAmount(""); setBuilderDescription(""); setSelectedTemplate(null);
            loadProposals();
        } finally {
            setSaving(false);
        }
    };

    const markSent = async (id: string) => {
        await fetch("/api/proposals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "SENT" }) });
        loadProposals();
    };

    const filtered = proposals.filter(p => clientName(p.client).toLowerCase().includes(search.toLowerCase()) || p.title.toLowerCase().includes(search.toLowerCase()));

    const totalCount = proposals.length;
    const signedCount = proposals.filter(p => p.status === "SIGNED").length;
    const pendingCount = proposals.filter(p => p.status === "SENT").length;
    const tauxConversion = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;
    const pipelineValue = proposals.filter(p => p.status !== "EXPIRED").reduce((s, p) => s + p.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <FileText className="w-64 h-64 text-primary" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                                Commercial & Contract Management
                            </span>
                        </div>
                        <h2 className="page-title leading-tight uppercase">
                            Lettres de <span className="text-primary">Mission & Devis</span>
                        </h2>
                        <p className="page-subtitle max-w-2xl">
                            Suivez vos propositions commerciales réelles et générez de nouvelles lettres de mission.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setView(view === "list" ? "builder" : "list")}
                            className="px-8 py-4 bg-primary hover:brightness-110 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-primary/30 active:scale-95"
                        >
                            {view === "list" ? <><Plus className="w-5 h-5" /> Nouvelle Proposition</> : <><History className="w-5 h-5" /> Voir l'historique</>}
                        </button>
                    </div>
                </div>
            </div>

            {view === "list" ? (
                <>
                    {/* Quick Stats (réelles) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <PropStat icon={Zap} label="Taux de Conversion" value={`${tauxConversion}%`} color="text-primary" />
                        <PropStat icon={Clock} label="En attente signature" value={String(pendingCount)} color="text-amber-400" />
                        <PropStat icon={CheckCircle2} label="Signées" value={String(signedCount)} color="text-emerald-400" />
                        <PropStat icon={CreditCard} label="Pipeline Commercial" value={`${(pipelineValue / 1000000).toFixed(1)}M`} unit=" F" color="text-cyan-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Proposals List */}
                        <div className="lg:col-span-8 apix-card flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Propositions</h3>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="bg-slate-800/80 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-primary/50 outline-none w-64" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filtered.map((prop) => (
                                    <div key={prop.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all group">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">{clientName(prop.client)}</h4>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                                        prop.type === "AUDIT" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            prop.type === "LEGAL" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                                "bg-primary/10 text-primary border-primary/20"
                                                    )}>
                                                        {TYPE_LABEL[prop.type]}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{prop.title}</p>
                                                <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-600">
                                                    <span className="flex items-center gap-1"><History className="w-3 h-3" /> Créée le {new Date(prop.date).toLocaleDateString("fr-FR")}</span>
                                                    {prop.expert && <span>Expert: {prop.expert.firstName} {prop.expert.lastName}</span>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Montant</p>
                                                    <p className="text-lg font-black text-white">{prop.amount.toLocaleString()} FCFA</p>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                                    prop.status === "SIGNED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        prop.status === "SENT" ? "bg-primary/10 text-primary border-primary/20" :
                                                            "bg-slate-700/10 text-slate-500 border-slate-700/20"
                                                )}>
                                                    {STATUS_LABEL[prop.status]}
                                                </span>
                                                {prop.status === "DRAFT" && (
                                                    <button onClick={() => markSent(prop.id)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5" title="Marquer comme envoyée">
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!loading && filtered.length === 0 && (
                                    <p className="text-center text-slate-500 py-10">Aucune proposition enregistrée.</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="apix-card">
                                <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Répartition par statut</h4>
                                <div className="space-y-4">
                                    {(["DRAFT", "SENT", "SIGNED", "EXPIRED"] as const).map(s => {
                                        const count = proposals.filter(p => p.status === s).length;
                                        return (
                                            <div key={s} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-300">{STATUS_LABEL[s]}</span>
                                                <span className="text-sm font-black text-white">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="apix-card animate-in zoom-in-95 duration-500">
                    <div className="flex justify-between items-center mb-12">
                        <button onClick={() => setView("list")} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all">
                            <ChevronRight className="w-4 h-4 rotate-180" /> Retour
                        </button>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nouvelle Proposition</h3>
                        <div className="w-24" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 max-w-4xl mx-auto">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Client</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <select value={builderClientId} onChange={e => setBuilderClientId(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none">
                                        <option value="">Sélectionner un client…</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Type de Mission</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Expertise-Comptable", "Audit & Commissariat", "Conseil & Advisory", "Juridique & Fiscal"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTemplate(t)}
                                            className={cn(
                                                "p-6 rounded-3xl border text-center transition-all",
                                                selectedTemplate === t ? "bg-primary/10 border-primary text-white shadow-xl" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                                            )}
                                        >
                                            <FileText className="w-6 h-6 mx-auto mb-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Titre de la proposition</label>
                                <input value={builderTitle} onChange={e => setBuilderTitle(e.target.value)} placeholder="Ex: Tenue Comptable & Reporting Périodique" className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Montant (FCFA)</label>
                                <input type="number" value={builderAmount} onChange={e => setBuilderAmount(e.target.value)} placeholder="3500000" className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={saving || !builderClientId || !builderTitle}
                                className="w-full py-5 bg-primary hover:brightness-110 disabled:opacity-40 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                            >
                                <Send className="w-4 h-4" /> {saving ? "Création…" : "Créer la Proposition"}
                            </button>
                        </div>

                        <div className="bg-slate-950/50 border border-white/5 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] p-4 sm:p-6 lg:p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-full max-w-sm aspect-[1/1.414] bg-white rounded-xl shadow-2xl relative p-8 text-slate-900 text-left">
                                <div className="border-b-4 border-primary pb-4 mb-6">
                                    <h4 className="font-black text-xl">LETTRE DE MISSION</h4>
                                    <p className="text-[10px] font-bold text-slate-500">{selectedTemplate || "Type de mission"}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Client :</strong> {clients.find(c => c.id === builderClientId)?.companyName || "—"}</p>
                                    <p><strong>Objet :</strong> {builderTitle || "—"}</p>
                                    <p><strong>Montant :</strong> {builderAmount ? `${parseInt(builderAmount).toLocaleString()} FCFA` : "—"}</p>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-6">Aperçu — la génération PDF complète n'est pas encore implémentée.</p>
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
        <div className="apix-card transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110 shadow-xl", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}
