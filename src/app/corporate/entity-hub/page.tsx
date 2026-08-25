"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Gavel,
    Building2,
    Scale,
    Users,
    FileText,
    Calendar,
    ArrowRight,
    ShieldCheck,
    Plus,
    CheckCircle2,
    AlertCircle,
    Download,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Entity {
    id: string;
    name: string;
    legalForm: string | null;
    governance: string;
    lastAG: string | null;
    nextAG: string | null;
    kycStatus: string | null;
}

export default function NexusEntityHubPage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/corporate/entity-hub")
            .then(r => r.json())
            .then(d => setEntities(d.entities ?? []))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
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
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-amber-400">Entity Hub</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Pilotez vos filiales, gérez vos organes de gouvernance et automatisez vos Assemblées Générales conformément à l'Acte Uniforme OHADA.
                        </p>
                    </div>

                    <Link href="/clients/new" className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-amber-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Ajouter une Filiale
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <Building2 className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1">{entities.length}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Entités sous Gestion</div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <Scale className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1">{entities.filter(e => e.nextAG).length}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AG à Planifier</div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1">{entities.filter(e => e.kycStatus === "valid").length}/{entities.length}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Conformité KYC Validée</div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Entities List */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Portefeuille Filiales</h3>
                    </div>

                    {entities.length === 0 ? (
                        <p className="text-center text-slate-500 py-10">Aucune entité entreprise enregistrée.</p>
                    ) : (
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
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{entity.legalForm || "Forme juridique non renseignée"} • ID: {entity.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {entity.kycStatus === "valid" ? (
                                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[9px] font-black text-emerald-500 uppercase">Conforme</span>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                                <span className="text-[9px] font-black text-amber-500 uppercase">KYC à vérifier</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Dernière AG</p>
                                        <p className="text-xs font-bold text-white">{entity.lastAG || "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Prochaine AG</p>
                                        <p className="text-xs font-bold text-amber-400">{entity.nextAG || "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Mode Gouv.</p>
                                        <p className="text-xs font-bold text-white uppercase">{entity.governance || "—"}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <button disabled title="Le registre social (mandataires, organes de gouvernance) n'est pas encore disponible." className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-600 cursor-not-allowed">
                                            <FileText className="w-3.5 h-3.5" /> Registre Social
                                        </button>
                                        <button disabled title="Le suivi de l'actionnariat n'est pas encore disponible." className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-600 cursor-not-allowed">
                                            <Users className="w-3.5 h-3.5" /> Actionnariat
                                        </button>
                                    </div>
                                    <button disabled title="La fiche détaillée par entité n'est pas encore disponible." className="flex items-center gap-2 px-6 py-2 bg-white/5 text-[9px] font-black uppercase text-slate-600 rounded-xl border border-white/10 cursor-not-allowed">
                                        Gérer Entity <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Right Panel: Calendar & Alerts */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Event Calendar Mini */}
                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-8">
                        <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-400" /> Échéancier Juridique
                        </h4>
                        <p className="text-xs text-slate-500 text-center py-6">
                            Aucune échéance enregistrée. Le suivi automatique des dates d'AG statutaires n'est pas encore configuré.
                        </p>
                    </div>

                    {/* Share/Export */}
                    <Link href="/corporate/entity-hub/print" target="_blank" className="w-full glass-card p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all">
                        <Download className="w-4 h-4" /> Générer Registre Global PDF
                    </Link>
                </div>
            </div>
            )}
        </div>
    );
}
