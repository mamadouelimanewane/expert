"use client";

import { useState } from "react";
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

interface LegalEntity {
    id: string;
    name: string;
    type: "SARL" | "SA" | "SAS" | "GIE";
    lastAG: string;
    nextAG: string;
    status: "Conforme" | "Alerte" | "Action Requise";
    manager: string;
}

const MOCK_ENTITIES: LegalEntity[] = [
    { id: "1", name: "Société Ivoirienne de Banque", type: "SA", lastAG: "15/04/2023", nextAG: "15/06/2024", status: "Action Requise", manager: "K. Touré" },
    { id: "2", name: "Traoré Import-Export", type: "SARL", lastAG: "20/05/2023", nextAG: "31/05/2024", status: "Alerte", manager: "A. Traoré" },
    { id: "3", name: "GDS Gabon", type: "SAS", lastAG: "10/06/2023", nextAG: "30/06/2024", status: "Conforme", manager: "M. Ndiaye" },
    { id: "4", name: "Boulangerie du Plateau", type: "SARL", lastAG: "12/03/2023", nextAG: "30/06/2024", status: "Conforme", manager: "J. Dupont" },
];

export default function GovernancePage() {
    const [selectedTab, setSelectedTab] = useState<"entities" | "meetings" | "registers">("entities");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Scale className="w-40 h-40 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                            <Gavel className="w-8 h-8 text-white" />
                        </div>
                        Gouvernance & Juridique
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Secrétariat juridique automatisé conforme à l'AUSCGIE (OHADA).
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-2 transition-all">
                        <BookOpen className="w-4 h-4" /> Registres Numériques
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                        <Plus className="w-4 h-4" /> Créer un Acte
                    </button>
                </div>
            </div>

            {/* Quick Actions / KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Échéances AG</p>
                            <h3 className="text-2xl font-black text-white">5 Dossiers</h3>
                        </div>
                    </div>
                    <p className="text-xs text-rose-400/80 font-bold uppercase tracking-widest">Action requise avant le 30 juin</p>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Conformité Compliance</p>
                            <h3 className="text-2xl font-black text-white">92%</h3>
                        </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-indigo-600 shadow-xl shadow-indigo-600/20">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-white">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest">Actes Générés (Mois)</p>
                            <h3 className="text-2xl font-black text-white">42 Actes</h3>
                        </div>
                    </div>
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase rounded-xl transition-all border border-white/10">
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
                            selectedTab === tab.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-500 hover:text-slate-200"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                    <div className="relative w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une société, un gérant..."
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Dénomination Sociale</th>
                                <th className="px-6 py-6 font-black text-center">Forme</th>
                                <th className="px-6 py-6 font-black">Dernière AG</th>
                                <th className="px-6 py-6 font-black">Date Limite AG</th>
                                <th className="px-6 py-6 font-black">Statut OHADA</th>
                                <th className="px-8 py-6 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {MOCK_ENTITIES.map((entity) => (
                                <tr key={entity.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-indigo-400 group-hover:scale-110 transition-transform">
                                                {entity.name[0]}
                                            </div>
                                            <div>
                                                <span className="font-bold text-white block">{entity.name}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Gérant: {entity.manager}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700 text-slate-300 font-black uppercase">{entity.type}</span>
                                    </td>
                                    <td className="px-6 py-6 font-mono text-xs text-slate-400">{entity.lastAG}</td>
                                    <td className="px-6 py-6 font-mono text-sm font-bold text-slate-200">{entity.nextAG}</td>
                                    <td className="px-6 py-6">
                                        <div className={cn(
                                            "flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full border w-fit",
                                            entity.status === "Conforme" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                entity.status === "Alerte" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", entity.status === "Conforme" ? "bg-emerald-500" : entity.status === "Alerte" ? "bg-amber-500" : "bg-rose-500")} />
                                            {entity.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-400 transition-all border border-transparent hover:border-white/5">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/5">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Smart Templates Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TemplateCard title="Convocation AG" desc="Conforme AUSCGIE Art. 331" />
                <TemplateCard title="Procès-Verbal AG" desc="Automatisation des quorums" />
                <TemplateCard title="Rapport de Gestion" desc="Génération via Balance" />
                <TemplateCard title="Contrat de Cession" desc="Modèle certifié OHADA" />
            </div>
        </div>
    );
}

function TemplateCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all cursor-pointer group">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400 w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{desc}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                Utiliser le modèle <ArrowRight className="w-3 h-3" />
            </div>
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    )
}
