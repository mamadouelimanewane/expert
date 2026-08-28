"use client";

import { useState, useEffect } from "react";
import {
    FileSignature,
    Plus,
    Search,
    Filter,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Download,
    MoreVertical,
    Sparkles,
    PenTool,
    Users,
    Calendar,
    FileText,
    RefreshCw,
    Mail,
    Copy,
    Gavel,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementLetter {
    id: string;
    reference: string;
    scope: string;
    fees: number | null;
    status: "BROUILLON" | "ENVOYEE" | "SIGNEE" | "EXPIREE";
    signedAt: string | null;
    signatoryName: string | null;
    client: { id: string; companyName: string | null; firstName: string | null; lastName: string | null } | null;
    mission: { id: string; title: string } | null;
    createdBy: { id: string; firstName: string; lastName: string } | null;
    createdAt: string;
}

const TEMPLATES = [
    { name: "Audit Légal (CAC)", icon: FileSignature },
    { name: "Tenue Comptable", icon: FileText },
    { name: "Conseil Fiscal", icon: Sparkles },
    { name: "Mission Spéciale", icon: PenTool }
];

function clientName(c: EngagementLetter["client"]): string {
    if (!c) return "Client non renseigné";
    return c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client";
}

export default function LettresMissionPage() {
    const [letters, setLetters] = useState<EngagementLetter[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("tous");
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ scope: "", fees: "", clientId: "", signatoryName: "" });

    const loadLetters = () => {
        fetch("/api/engagement-letters")
            .then(r => r.json())
            .then(d => setLetters(d.letters || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadLetters();
        fetch("/api/clients").then(r => r.json()).then(d => setClients(d.clients || []));
    }, []);

    const handleCreate = async () => {
        if (!form.scope || !form.clientId) return;
        setSaving(true);
        try {
            await fetch("/api/engagement-letters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setShowNewModal(false);
            setForm({ scope: "", fees: "", clientId: "", signatoryName: "" });
            loadLetters();
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        await fetch("/api/engagement-letters", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        loadLetters();
    };

    const filteredLettres = letters.filter(l => {
        if (filter !== "tous" && l.status.toLowerCase() !== filter) return false;
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return l.reference.toLowerCase().includes(term) || clientName(l.client).toLowerCase().includes(term) || l.scope.toLowerCase().includes(term);
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "SIGNEE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "ENVOYEE": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            case "BROUILLON": return "bg-slate-700 text-slate-400 border-slate-600";
            case "EXPIREE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-slate-700 text-slate-400 border-slate-600";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SIGNEE": return <CheckCircle2 className="w-3 h-3" />;
            case "ENVOYEE": return <Send className="w-3 h-3" />;
            case "BROUILLON": return <FileText className="w-3 h-3" />;
            case "EXPIREE": return <AlertCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    const statusLabel = (s: string) => ({ BROUILLON: "Brouillon", ENVOYEE: "Envoyée", SIGNEE: "Signée", EXPIREE: "Expirée" }[s] || s);

    // Stats réelles calculées à partir des lettres existantes
    const totalActives = letters.filter(l => l.status !== "EXPIREE").length;
    const enAttenteSignature = letters.filter(l => l.status === "ENVOYEE").length;
    const currentYear = new Date().getFullYear();
    const signeesCetteAnnee = letters.filter(l => l.status === "SIGNEE" && l.signedAt && new Date(l.signedAt).getFullYear() === currentYear).length;
    const caContractualise = letters.filter(l => l.status === "SIGNEE").reduce((s, l) => s + (l.fees || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <FileSignature className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="page-title flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-600/30">
                                <FileSignature className="w-8 h-8 text-white" />
                            </div>
                            Lettres de Mission
                        </h2>
                        <p className="page-subtitle">
                            Créez, envoyez et faites signer vos lettres de mission.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Nouvelle Lettre
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats — réelles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard label="Total Actives" value={String(totalActives)} color="text-white" />
                <StatCard label="En Attente Signature" value={String(enAttenteSignature)} trend={enAttenteSignature > 0 ? "Suivi requis" : undefined} color="text-amber-400" />
                <StatCard label={`Signées (${currentYear})`} value={String(signeesCetteAnnee)} color="text-emerald-400" />
                <StatCard label="CA Contractualisé" value={(caContractualise / 1000000).toFixed(1)} unit="M FCFA" color="text-indigo-400" />
            </div>

            {/* Templates Quick Access */}
            <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/20">
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Modèles Pré-définis (OHADA)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TEMPLATES.map((tpl, idx) => (
                        <button
                            key={idx}
                            onClick={() => setForm(f => ({ ...f, scope: tpl.name }))}
                            className="p-6 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <tpl.icon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-white font-bold text-sm">{tpl.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Conforme OHADA</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40">
                    <div className="flex gap-2 flex-wrap">
                        {["tous", "brouillon", "envoyee", "signee", "expiree"].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === s ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-800 text-slate-500 hover:text-white"
                                )}
                            >
                                {s === "tous" ? "tous" : statusLabel(s.toUpperCase())}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une lettre..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Référence / Client</th>
                                <th className="px-6 py-6">Objet de la Mission</th>
                                <th className="px-6 py-6 text-right">Honoraires</th>
                                <th className="px-6 py-6 text-center">Signataire</th>
                                <th className="px-6 py-6 text-center">Statut</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLettres.map((lettre) => (
                                <tr key={lettre.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                                                <FileSignature className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-white block">{clientName(lettre.client)}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lettre.reference} • {new Date(lettre.createdAt).toLocaleDateString("fr-FR")}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-sm text-slate-300 font-medium">{lettre.scope}</span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className="font-mono font-bold text-white">{lettre.fees ? lettre.fees.toLocaleString("fr-FR") + " FCFA" : "—"}</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-[11px] text-slate-400">{lettre.signatoryName || "—"}</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                            getStatusColor(lettre.status)
                                        )}>
                                            {getStatusIcon(lettre.status)}
                                            {statusLabel(lettre.status)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            {lettre.status === "BROUILLON" && (
                                                <button onClick={() => updateStatus(lettre.id, "ENVOYEE")} className="p-2.5 hover:bg-indigo-500/10 rounded-xl text-indigo-400 transition-all" title="Envoyer">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            )}
                                            {lettre.status === "ENVOYEE" && (
                                                <button onClick={() => updateStatus(lettre.id, "SIGNEE")} className="p-2.5 hover:bg-emerald-500/10 rounded-xl text-emerald-400 transition-all" title="Marquer signée">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {lettre.status === "EXPIREE" && (
                                                <button onClick={() => updateStatus(lettre.id, "BROUILLON")} className="p-2.5 hover:bg-amber-500/10 rounded-xl text-amber-400 transition-all" title="Renouveler">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLettres.length === 0 && (
                                <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-500">Aucune lettre de mission enregistrée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}
            </div>

            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouvelle Lettre de Mission</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Sélectionner un client…</option>
                                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}</option>)}
                            </select>
                            <input placeholder="Objet de la mission" value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Honoraires (FCFA)" value={form.fees} onChange={e => setForm({ ...form, fees: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input placeholder="Nom du signataire" value={form.signatoryName} onChange={e => setForm({ ...form, signatoryName: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <button onClick={handleCreate} disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {saving ? "Enregistrement…" : "Créer la lettre de mission"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, trend, unit, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-baseline gap-1">
                <h4 className={cn("text-xl sm:text-2xl lg:text-3xl font-black", color)}>{value}</h4>
                {unit && <span className="text-xs text-slate-600 font-bold">{unit}</span>}
            </div>
            {trend && <p className="text-[10px] text-slate-600 mt-2">{trend}</p>}
        </div>
    );
}
