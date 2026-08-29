"use client";

import { useState, useEffect } from "react";
import {
    Target,
    Plus,
    Search,
    Phone,
    Mail,
    Calendar,
    MoreVertical,
    Users,
    TrendingUp,
    Building2,
    Eye,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Prospect {
    id: string;
    entreprise: string;
    contact: string | null;
    email: string | null;
    telephone: string | null;
    secteur: string | null;
    source: string | null;
    valeurEstimee: number;
    etape: "PROSPECT" | "QUALIFIE" | "PROPOSITION" | "NEGOCIATION" | "GAGNE" | "PERDU";
    prochainRdv: string | null;
    score: number;
}

const PIPELINE_STAGES = [
    { id: "PROSPECT", label: "Prospects", color: "bg-slate-500" },
    { id: "QUALIFIE", label: "Qualifiés", color: "bg-indigo-500" },
    { id: "PROPOSITION", label: "Proposition", color: "bg-amber-500" },
    { id: "NEGOCIATION", label: "Négociation", color: "bg-purple-500" },
    { id: "GAGNE", label: "Gagnés", color: "bg-emerald-500" },
];
const STAGE_LABEL: Record<string, string> = { PROSPECT: "Prospect", QUALIFIE: "Qualifié", PROPOSITION: "Proposition", NEGOCIATION: "Négociation", GAGNE: "Gagné", PERDU: "Perdu" };

export default function ProspectsPage() {
    const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showNewModal, setShowNewModal] = useState(false);
    const [form, setForm] = useState({ entreprise: "", contact: "", email: "", telephone: "", secteur: "", source: "", valeurEstimee: "", prochainRdv: "" });
    const [saving, setSaving] = useState(false);

    const loadProspects = () => {
        fetch("/api/prospects")
            .then(res => res.json())
            .then(data => setProspects(data.prospects || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadProspects(); }, []);

    const handleCreate = async () => {
        if (!form.entreprise) return;
        setSaving(true);
        try {
            await fetch("/api/prospects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            setShowNewModal(false);
            setForm({ entreprise: "", contact: "", email: "", telephone: "", secteur: "", source: "", valeurEstimee: "", prochainRdv: "" });
            loadProspects();
        } finally {
            setSaving(false);
        }
    };

    const advanceStage = async (prospect: Prospect) => {
        const order = PIPELINE_STAGES.map(s => s.id);
        const idx = order.indexOf(prospect.etape);
        if (idx === -1 || idx === order.length - 1) return;
        await fetch("/api/prospects", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: prospect.id, etape: order[idx + 1] }),
        });
        loadProspects();
    };

    const getProspectsByStage = (stage: string) => prospects.filter(p => p.etape === stage);
    const filteredList = prospects.filter(p => p.entreprise.toLowerCase().includes(search.toLowerCase()));

    const totalActifs = prospects.filter(p => p.etape !== "GAGNE" && p.etape !== "PERDU").length;
    const gagnes = prospects.filter(p => p.etape === "GAGNE").length;
    const clos = prospects.filter(p => p.etape === "GAGNE" || p.etape === "PERDU").length;
    const tauxConversion = clos > 0 ? Math.round((gagnes / clos) * 100) : 0;
    const rdvThisWeek = prospects.filter(p => {
        if (!p.prochainRdv) return false;
        const d = new Date(p.prochainRdv);
        const now = new Date();
        const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return d >= now && d <= in7;
    }).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
                    <Target className="w-48 h-48 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="page-title flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-600/30">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            Gestion Commerciale (CRM)
                        </h2>
                        <p className="page-subtitle">
                            Suivez vos prospects, qualifiez les opportunités et développez votre portefeuille clients.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-1.5 bg-slate-800 border border-white/5 rounded-2xl flex gap-1">
                            <button onClick={() => setViewMode("pipeline")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "pipeline" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                                Pipeline
                            </button>
                            <button onClick={() => setViewMode("list")} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                                Liste
                            </button>
                        </div>
                        <button onClick={() => setShowNewModal(true)} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/30 active:scale-95">
                            <Plus className="w-5 h-5" /> Nouveau Prospect
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats (réelles) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Prospects Actifs" value={String(totalActifs)} color="text-white" />
                <StatCard icon={TrendingUp} label="Taux Conversion" value={`${tauxConversion}%`} color="text-emerald-400" />
                <StatCard icon={Calendar} label="RDV (7 jours)" value={String(rdvThisWeek)} color="text-amber-400" />
                <StatCard icon={Target} label="Gagnés" value={String(gagnes)} color="text-cyan-400" />
            </div>

            {/* Pipeline View */}
            {viewMode === "pipeline" && (
                <div className="overflow-x-auto pb-6">
                    <div className="flex gap-6 min-w-[1200px]">
                        {PIPELINE_STAGES.map((stage) => {
                            const stageProspects = getProspectsByStage(stage.id);
                            return (
                                <div key={stage.id} className="w-72 flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px]", stage.color)} />
                                            <h3 className="font-black text-slate-200 uppercase tracking-widest text-[11px]">{stage.label}</h3>
                                            <span className="text-[10px] font-black text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-white/5">{stageProspects.length}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-slate-900/40 rounded-[32px] p-3 space-y-4 border border-white/5 min-h-[280px] sm:h-[350px] lg:h-[400px] overflow-y-auto">
                                        {stageProspects.length > 0 ? stageProspects.map((prospect) => (
                                            <ProspectCard key={prospect.id} prospect={prospect} stageColor={stage.color} onAdvance={() => advanceStage(prospect)} />
                                        )) : (
                                            <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-[28px] flex flex-col items-center justify-center text-slate-600 gap-2">
                                                <Building2 className="w-6 h-6 opacity-20" />
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Aucun prospect</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Users className="w-5 h-5 text-emerald-400" />
                            Liste des Prospects
                        </h3>
                        <div className="relative w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left apix-table">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Entreprise / Contact</th>
                                    <th className="px-6 py-6">Secteur</th>
                                    <th className="px-6 py-6 text-center">Score</th>
                                    <th className="px-6 py-6 text-right">Valeur Estimée</th>
                                    <th className="px-6 py-6 text-center">Étape</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredList.map((prospect) => (
                                    <tr key={prospect.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{prospect.entreprise}</span>
                                                    <span className="text-[10px] text-slate-500">{prospect.contact || "—"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400 border border-white/5">{prospect.secteur || "—"}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn("text-lg font-black", prospect.score >= 80 ? "text-emerald-400" : prospect.score >= 50 ? "text-amber-400" : "text-slate-500")}>{prospect.score}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono font-bold text-white">{prospect.valeurEstimee.toLocaleString()} FCFA</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                                prospect.etape === "GAGNE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    prospect.etape === "NEGOCIATION" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                        prospect.etape === "PROPOSITION" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-slate-700 text-slate-400 border-slate-600"
                                            )}>{STAGE_LABEL[prospect.etape]}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                {prospect.telephone && (
                                                    <a href={`tel:${prospect.telephone}`} className="p-2.5 hover:bg-indigo-500/10 rounded-xl text-indigo-400 transition-all" title="Appeler">
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {prospect.email && (
                                                    <a href={`mailto:${prospect.email}`} className="p-2.5 hover:bg-emerald-500/10 rounded-xl text-emerald-400 transition-all" title="Email">
                                                        <Mail className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredList.length === 0 && (
                                    <tr><td colSpan={6} className="px-8 py-10 text-center text-slate-500">Aucun prospect enregistré.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showNewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouveau Prospect</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Entreprise *" value={form.entreprise} onChange={e => setForm({ ...form, entreprise: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input placeholder="Secteur" value={form.secteur} onChange={e => setForm({ ...form, secteur: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Source" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input type="number" placeholder="Valeur estimée (FCFA)" value={form.valeurEstimee} onChange={e => setForm({ ...form, valeurEstimee: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <input type="date" value={form.prochainRdv} onChange={e => setForm({ ...form, prochainRdv: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <button onClick={handleCreate} disabled={saving || !form.entreprise} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {saving ? "Enregistrement…" : "Créer le prospect"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, color }: any) {
    return (
        <div className="glass-card p-5 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl">
                <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h4 className={cn("text-xl font-black", color)}>{value}</h4>
                    {unit && <span className="text-[10px] text-slate-600 font-bold">{unit}</span>}
                </div>
            </div>
        </div>
    );
}

function ProspectCard({ prospect, stageColor, onAdvance }: { prospect: Prospect, stageColor: string, onAdvance: () => void }) {
    return (
        <div className="group p-5 bg-slate-800/50 hover:bg-slate-800/80 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all shadow-lg relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50", stageColor)} />

            <div className="flex items-start justify-between mb-3">
                <span className={cn(
                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                    prospect.score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        prospect.score >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-slate-700 text-slate-500 border-slate-600"
                )}>
                    Score: {prospect.score}
                </span>
                {prospect.etape !== "GAGNE" && prospect.etape !== "PERDU" && (
                    <button onClick={onAdvance} title="Faire avancer" className="text-slate-600 hover:text-emerald-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                )}
            </div>

            <h4 className="font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors text-sm leading-tight">{prospect.entreprise}</h4>
            <p className="text-xs text-slate-500 mb-4">{prospect.contact || "—"}</p>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs font-bold text-slate-400">{prospect.valeurEstimee.toLocaleString()} FCFA</span>
                {prospect.prochainRdv && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(prospect.prochainRdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </div>
                )}
            </div>
        </div>
    );
}
