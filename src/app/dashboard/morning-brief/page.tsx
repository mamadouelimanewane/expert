"use client";

import { useState, useEffect } from "react";
import {
    Sparkles,
    Calendar,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Zap,
    Users,
    ArrowRight,
    FileText,
    Gavel,
    Clock,
    CheckCircle2,
    Briefcase,
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MorningBriefPage() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [briefs, setBriefs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        fetch("/api/dashboard/morning-brief")
            .then(res => res.json())
            .then(data => {
                setBriefs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => clearInterval(timer);
    }, []);

    const metrics = [
        { label: "Alertes Rentabilité", value: "3", color: "text-rose-400" },
        { label: "Missions en Retard", value: "1", color: "text-amber-400" },
        { label: "Briefings IA Actifs", value: briefs.length.toString(), color: "text-emerald-400" },
    ];

    return (
        <div className="min-h-screen space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Ultra Premium Header */}
            <div className="relative p-12 rounded-[60px] overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none group">
                    <Sparkles className="w-64 h-64 text-indigo-400 animate-pulse" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-full border border-indigo-500/30 backdrop-blur-md">
                            IA Générative • Morning Briefing
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {currentTime.toLocaleTimeString()}
                        </div>
                    </div>

                    <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
                        Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Collaborateur</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                        Voici votre synthèse stratégique du <span className="text-white font-bold">{currentTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>. Nexus a analysé les dernières réformes et flux client pour vous.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-12 relative z-10">
                    {metrics.map((m, i) => (
                        <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl backdrop-blur-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                            <div className={cn("text-3xl font-black", m.color)}>{m.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Priorités Stratégiques IA */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Zap className="w-6 h-6 text-amber-400" /> Priorités du Cabinet (Réel)
                        </h3>

                        <div className="space-y-6">
                            {loading ? (
                                <div className="py-10 flex justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-amber-500 rounded-full" /></div>
                            ) : briefs.length > 0 ? (
                                briefs.map((brief) => (
                                    <BriefItem
                                        key={brief.id}
                                        type={brief.type}
                                        color={brief.type === 'FISCAL' ? 'indigo' : brief.type === 'URGENT' ? 'rose' : 'emerald'}
                                        title={brief.title}
                                        desc={brief.content}
                                        action="Analyser Impact"
                                    />
                                ))
                            ) : (
                                <p className="text-slate-500 italic text-center py-10">Aucun briefing disponible aujourd'hui.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Dernière Jurisprudence OHADA</h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border-l-2 border-indigo-500">
                                    <p className="text-xs font-bold text-white mb-1">Responsabilité des dirigeants</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Nouvel arrêt de la CCJA sur l'action en comblement de passif. Impact direct sur vos missions de commissariat.</p>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Agenda de l'Associé</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">14:00</div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase">Comité Associés</p>
                                        <p className="text-[10px] text-slate-500 font-bold">Revue Profitabilité Q1</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 font-black text-xs">16:30</div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-tighter">BIDC - Sign. Rapport</p>
                                        <p className="text-[10px] text-slate-500 font-bold">Commissariat aux comptes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Console: Cabinet Health & Comms */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-gradient-to-b from-indigo-500/5 to-transparent text-center">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-indigo-500/20">
                            <TrendingUp className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Santé du Cabinet</h4>
                        <div className="text-5xl font-black text-white tracking-widest uppercase mb-4">92%</div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                            Facturation en hausse de 12% <br /> par rapport au mois dernier.
                        </p>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full mt-8 overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[92%] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Collaborateurs Clés
                        </h4>
                        <div className="space-y-4">
                            <UserStatus name="A. Fall" role="Senior Manager" status="En ligne" performance="+8%" />
                            <UserStatus name="K. Diop" role="Audit Junior" status="En mission" performance="-2%" />
                            <UserStatus name="M. Diagne" role="Expert Fiscal" status="Occupé" performance="+15%" />
                        </div>
                    </div>

                    <button className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 text-white font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95">
                        <Mail className="w-4 h-4" /> Notifier l'Équipe (Briefing)
                    </button>
                </div>
            </div>
        </div>
    );
}

function BriefItem({ type, title, desc, action, color }: any) {
    const colors: any = {
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };

    return (
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", colors[color])}>
                    {type}
                </span>
                <button className="text-[10px] font-black text-slate-600 group-hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest">
                    {action} <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            <h4 className="text-lg font-black text-white mb-2">{title}</h4>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function UserStatus({ name, role, status, performance }: any) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-white text-xs">
                    {name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                    <h5 className="text-xs font-black text-white">{name}</h5>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{role}</p>
                </div>
            </div>
            <div className="text-right">
                <div className={cn("text-[9px] font-black uppercase mb-1", performance.startsWith('+') ? "text-emerald-400" : "text-rose-400")}>
                    {performance}
                </div>
                <div className="text-[8px] text-slate-600 font-black uppercase">{status}</div>
            </div>
        </div>
    );
}
