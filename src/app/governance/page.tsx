"use client";

import { useState, useEffect } from "react";
import {
    Gavel,
    Users,
    FileText,
    Calendar,
    Plus,
    Search,
    ChevronRight,
    ArrowUpRight,
    Scale,
    History,
    MoreVertical,
    CheckCircle2,
    Clock,
    UserPlus,
    BookOpen,
    ShieldCheck,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeatmapClient {
    id: string;
    name: string;
    status: {
        ag: string;
        mandats: string;
        depot: string;
        kyc: string;
    };
}

function overallStatus(status: HeatmapClient["status"]): "Conforme" | "Alerte" | "Action Requise" {
    const values = Object.values(status);
    if (values.some(v => v === "late" || v === "invalid" || v === "expired")) return "Action Requise";
    if (values.some(v => v === "expiring" || v === "warning")) return "Alerte";
    return "Conforme";
}

export default function GovernancePage() {
    const [selectedTab, setSelectedTab] = useState<"entities" | "meetings" | "registers">("entities");
    const [entities, setEntities] = useState<HeatmapClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/governance/heatmap")
            .then(res => res.json())
            .then(data => setEntities(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = entities.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    const actionRequiredCount = entities.filter(e => overallStatus(e.status) === "Action Requise").length;
    const conformeCount = entities.filter(e => overallStatus(e.status) === "Conforme").length;
    const compliancePct = entities.length > 0 ? Math.round((conformeCount / entities.length) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <Scale className="w-40 h-40 text-primary" />
                </div>

                <div className="relative z-10">
                    <h2 className="page-title flex items-center gap-4">
                        <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/30">
                            <Gavel className="w-8 h-8 text-white" />
                        </div>
                        Gouvernance & Juridique
                    </h2>
                    <p className="page-subtitle max-w-2xl">
                        Secrétariat juridique automatisé conforme à l'AUSCGIE (OHADA).
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button disabled title="Non implémenté" className="px-6 py-3 bg-slate-800/50 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-2 cursor-not-allowed">
                        <BookOpen className="w-4 h-4" /> Registres Numériques
                    </button>
                    <button disabled title="Non implémenté" className="px-6 py-3 bg-primary/30 text-primary-foreground/70/50 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 cursor-not-allowed">
                        <Plus className="w-4 h-4" /> Créer un Acte
                    </button>
                </div>
            </div>

            {/* Quick Actions / KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="apix-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Dossiers en Action Requise</p>
                            <h3 className="text-2xl font-black text-white">{actionRequiredCount} Dossier{actionRequiredCount !== 1 ? "s" : ""}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-rose-400/80 font-bold uppercase tracking-widest">AG, mandats, dépôt de comptes ou KYC en retard</p>
                </div>

                <div className="apix-card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Conformité Compliance</p>
                            <h3 className="text-2xl font-black text-white">{compliancePct}%</h3>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${compliancePct}%` }} />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-primary shadow-xl shadow-primary/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-white">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-primary-foreground/70 font-black uppercase tracking-widest">Sociétés Suivies</p>
                            <h3 className="text-2xl font-black text-white">{entities.length}</h3>
                        </div>
                    </div>
                    <button disabled title="Non implémenté" className="w-full py-2 bg-white/5 text-white/40 text-[10px] font-black uppercase rounded-xl border border-white/10 cursor-not-allowed">
                        Consulter les archives
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 p-1 bg-slate-900 border border-white/5 rounded-3xl w-fit">
                {[
                    { id: "entities", label: "Sociétés & Mandats", icon: Users },
                    { id: "meetings", label: "Gestion des AG/CA", icon: Calendar },
                    { id: "registers", label: "Registres & Titres", icon: BookOpen },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id as any)}
                        className={cn(
                            "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3",
                            selectedTab === tab.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-slate-500 hover:text-slate-200"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            {selectedTab !== "entities" ? (
                <div className="apix-card text-center">
                    <p className="text-sm text-slate-500">
                        {selectedTab === "meetings"
                            ? "La gestion des Assemblées Générales et Conseils d'Administration n'est pas encore implémentée."
                            : "Les registres et titres numériques ne sont pas encore implémentés."}
                    </p>
                </div>
            ) : (
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher une société..."
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left apix-table">
                        <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Dénomination Sociale</th>
                                <th className="px-6 py-6 font-black text-center">AG</th>
                                <th className="px-6 py-6 font-black text-center">Mandats</th>
                                <th className="px-6 py-6 font-black text-center">Dépôt Comptes</th>
                                <th className="px-6 py-6 font-black text-center">KYC</th>
                                <th className="px-6 py-6 font-black">Statut Global</th>
                                <th className="px-8 py-6 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((entity) => {
                                const status = overallStatus(entity.status);
                                // Le vert n'est plus le repli : "inconnu" (aucun controle
                                // enregistre) s'affiche en gris, pas en conforme.
                                const dot = (v: string) => v === "late" || v === "invalid" || v === "expired" ? "bg-rose-500" : v === "expiring" || v === "warning" ? "bg-amber-500" : v === "valid" ? "bg-emerald-500" : "bg-slate-600";
                                return (
                                <tr key={entity.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-primary group-hover:scale-110 transition-transform">
                                                {entity.name[0]}
                                            </div>
                                            <span className="font-bold text-white block">{entity.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center"><div className={cn("w-2.5 h-2.5 rounded-full mx-auto", dot(entity.status.ag))} /></td>
                                    <td className="px-6 py-6 text-center"><div className={cn("w-2.5 h-2.5 rounded-full mx-auto", dot(entity.status.mandats))} /></td>
                                    <td className="px-6 py-6 text-center"><div className={cn("w-2.5 h-2.5 rounded-full mx-auto", dot(entity.status.depot))} /></td>
                                    <td className="px-6 py-6 text-center"><div className={cn("w-2.5 h-2.5 rounded-full mx-auto", dot(entity.status.kyc))} /></td>
                                    <td className="px-6 py-6">
                                        <div className={cn(
                                            "flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full border w-fit",
                                            status === "Conforme" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                status === "Alerte" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", status === "Conforme" ? "bg-emerald-500" : status === "Alerte" ? "bg-amber-500" : "bg-rose-500")} />
                                            {status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button disabled title="Non implémenté" className="p-2.5 rounded-xl text-slate-700 cursor-not-allowed border border-transparent">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button disabled title="Non implémenté" className="p-2.5 rounded-xl text-slate-700 cursor-not-allowed border border-transparent">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            {!loading && filtered.length === 0 && (
                                <tr><td colSpan={7} className="px-8 py-10 text-center text-sm text-slate-500">Aucune société trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {/* Modèles Juridiques — aucune génération automatique de documents juridiques
                (convocation, PV, rapport de gestion, contrat de cession) n'est encore
                implémentée : les cartes précédentes proposaient un faux CTA "Utiliser le
                modèle" sans backend, retiré. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TemplateCard title="Convocation AG" desc="AUSCGIE Art. 331" />
                <TemplateCard title="Procès-Verbal AG" desc="Non implémenté" />
                <TemplateCard title="Rapport de Gestion" desc="Non implémenté" />
                <TemplateCard title="Contrat de Cession" desc="Non implémenté" />
            </div>
        </div>
    );
}

function TemplateCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="apix-card opacity-60">
            <div className="p-3 bg-white/5 rounded-2xl text-slate-500 w-fit mb-4">
                <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-300 text-sm mb-1">{title}</h4>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{desc}</p>
        </div>
    );
}
