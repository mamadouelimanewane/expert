"use client";

import { useState } from "react";
import {
    Gavel,
    Building2,
    Scale,
    Users,
    FileText,
    Calendar,
    ArrowRight,
    Star,
    ShieldCheck,
    Search,
    Filter,
    Plus,
    Clock,
    CheckCircle2,
    ExternalLink,
    AlertCircle,
    LayoutDashboard,
    Briefcase,
    Zap,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

import { mockClients } from "@/data/mock-clients";

export default function NexusEntityHubPage() {
    const [entities, setEntities] = useState<any[]>(() => {
        // Transformation des clients "Personne Morale" en entités juridiques
        return mockClients
            .filter(c => c.type === "Personne Morale")
            .map(c => ({
                id: c.rccm || `ENT-${c.id}`,
                name: c.name,
                legalForm: c.regimeFiscal === "Réel Normal" ? "Société Anonyme" : "SARL",
                status: "active",
                governance: c.id === "1" ? "board" : "single_admin",
                lastAG: "2025-06-15",
                nextAG: "2026-06-15",
                shareholders: c.id === "1" ? 45 : 4,
                tasksCount: Math.floor(Math.random() * 3)
            }));
    });

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Gavel className="w-64 h-64 text-amber-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Legal Entity Management
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-amber-400">Entity Hub</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Pilotez vos filiales, gérez vos organes de gouvernance et automatisez vos Assemblées Générales conformément à l'Acte Uniforme OHADA.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-amber-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Ajouter une Filiale
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <Building2 className="w-6 h-6 text-amber-400" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase">Forte Croissance</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">28</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Entités sous Gestion</div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <Scale className="w-6 h-6 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-black uppercase">Période d'AG</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">14</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Instances Planifiées (Q2)</div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-black uppercase">100% Compliance</span>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">98%</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Indice de Santé Juridique</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Entities List */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Portefeuille Filiales</h3>
                        <div className="flex gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                            <span className="text-amber-400 underline underline-offset-4">Toutes</span>
                            <span className="hover:text-white cursor-pointer transition-all">Sénégal</span>
                            <span className="hover:text-white cursor-pointer transition-all">Régional (UEMOA)</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {entities.map(entity => (
                            <div key={entity.id} className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-6 group hover:border-amber-500/20 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all">
                                            <Building2 className="w-6 h-6 text-slate-400 group-hover:text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white">{entity.name}</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{entity.legalForm} • ID: {entity.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {entity.tasksCount > 0 && (
                                            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                                <span className="text-[9px] font-black text-amber-500 uppercase">{entity.tasksCount} Actions</span>
                                            </div>
                                        )}
                                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase">Conforme</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-6 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Dernière AG</p>
                                        <p className="text-xs font-bold text-white">{entity.lastAG}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Prochaine AG</p>
                                        <p className="text-xs font-bold text-amber-400">{entity.nextAG}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Actionnaires</p>
                                        <p className="text-xs font-bold text-white">{entity.shareholders}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Mode Gouv.</p>
                                        <p className="text-xs font-bold text-white uppercase">{entity.governance === 'board' ? 'CA' : 'Ad. Unique'}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all">
                                            <FileText className="w-3.5 h-3.5" /> Registre Social
                                        </button>
                                        <button className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all">
                                            <Users className="w-3.5 h-3.5" /> Actionnariat
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-white rounded-xl border border-white/10 transition-all">
                                        Gérer Entity <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Calendar & Alerts */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Event Calendar Mini */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                        <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-400" /> Échéancier Juridique
                        </h4>
                        <div className="space-y-4">
                            {[
                                { title: "Convocation AG - Omni", date: "15 Juin 2026", type: "AG", priority: "high" },
                                { title: "Dépôt des comptes - Dakar Digital", date: "30 Juin 2026", type: "Fiscale", priority: "medium" },
                                { title: "Renouvellement Mandat - UEMOA", date: "12 Avril 2026", type: "Board", priority: "low" },
                            ].map((event, i) => (
                                <div key={i} className="flex gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5">
                                    <div className={cn(
                                        "w-1 h-8 rounded-full",
                                        event.priority === 'high' ? 'bg-rose-500' : event.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                    )} />
                                    <div>
                                        <p className="text-xs text-white font-bold leading-none mb-1">{event.title}</p>
                                        <p className="text-[9px] text-slate-500">{event.date} • {event.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">
                            Voir Tout le Planning
                        </button>
                    </div>

                    {/* AI Document Analysis */}
                    <div className="glass-card rounded-[32px] border border-amber-500/20 bg-amber-500/5 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-5 h-5 text-amber-400" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Nexus Legisway IA</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
                            L'IA a détecté une non-conformité potentielle dans les nouveaux statuts de **Dakar Digital SAS** concernant les clauses de préemption.
                        </p>
                        <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white text-[9px] font-black uppercase rounded-2xl shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all">
                            Analyser les Risques
                        </button>
                    </div>

                    {/* Share/Export */}
                    <button className="w-full glass-card p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">
                        <Download className="w-4 h-4" /> Générer Registre Global PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
