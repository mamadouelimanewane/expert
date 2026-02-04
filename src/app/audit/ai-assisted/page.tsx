"use client";

import { useState } from "react";
import {
    ShieldCheck,
    BrainCircuit,
    Zap,
    Target,
    AlertCircle,
    CheckCircle2,
    Search,
    Filter,
    ArrowRight,
    Download,
    Eye,
    RefreshCw,
    Layers,
    Activity,
    FileText,
    History,
    Sparkles,
    Scale,
    Users,
    LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AIAssistedAuditPage() {
    const [auditStatus, setAuditStatus] = useState("En cours");
    const [isScanning, setIsScanning] = useState(false);

    const handleAIAudit = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Premium - Audit CAC */}
            <div className="bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Audit Légal Assisté par IA
                            </span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
                                Certifié ISA
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                            Commissariat aux Comptes <span className="text-indigo-400">Nexus AI</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Révolutionnez votre audit légal. L'IA analyse 100% des écritures pour détecter les risques de fraude et d'erreurs significatives en temps réel.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAIAudit}
                            disabled={isScanning}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50"
                        >
                            {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            Lancer Scan IA Final (FEC)
                        </button>
                    </div>
                </div>
            </div>

            {/* Strategic Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <AuditKpiCard title="Écritures Analysées" value="100%" desc="Couverture intégrale" icon={Activity} color="text-indigo-400" />
                <AuditKpiCard title="Anomalies Potentielles" value="14" desc="2 Risques Majeurs" icon={AlertCircle} color="text-rose-400" />
                <AuditKpiCard title="Échantillonnage IA" value="124" desc="Lignes à vérifier" icon={Target} color="text-amber-400" />
                <AuditKpiCard title="Score Compliance" value="98.5" unit="%" desc="Conformité OHADA" icon={ShieldCheck} color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Risk Mapping */}
                <div className="lg:col-span-8 glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <Layers className="w-6 h-6 text-indigo-400" />
                            Cartographie des Risques par Cycle
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" /> Élevé
                            </span>
                            <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Modéré
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <CycleRiskItem title="Trésorerie & Banque" level={92} status="High" anomalies={5} />
                        <CycleRiskItem title="Ventes & Clients" level={45} status="Medium" anomalies={3} />
                        <CycleRiskItem title="Achats & Fournisseurs" level={78} status="High" anomalies={4} />
                        <CycleRiskItem title="Social & Paie" level={12} status="Low" anomalies={2} />
                    </div>

                    <div className="mt-12 p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-indigo-600/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                <Scale className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase">Génération Rapport d'Opinion</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Sans réserve, avec observations IA</p>
                            </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-indigo-400 group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>

                {/* AI Investigations */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <Search className="w-6 h-6 text-indigo-400" />
                            Investigations IA Nexus
                        </h3>

                        <div className="space-y-6">
                            <InvestigationItem
                                title="Loi de Benford"
                                result="Déviation détectée"
                                desc="Comptes 601 (Fournisseurs)"
                                type="danger"
                            />
                            <InvestigationItem
                                title="Doublons de Factures"
                                result="3 Suspects"
                                desc="Montant total : 4.560.000 FCFA"
                                type="warning"
                            />
                            <InvestigationItem
                                title="Écritures Manuelles (WE)"
                                result="12 entrées"
                                desc="Passées un Dimanche à 23h"
                                type="neutral"
                            />
                        </div>

                        <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all">
                            Voir le détail du contrôle
                        </button>
                    </div>

                    <div className="p-8 rounded-[40px] bg-indigo-900/20 border border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Co-Commissariat</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            Vous collaborez avec <b className="text-white">Grant Thornton</b> sur ce dossier. Tous les points d'audit sont synchronisés.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuditKpiCard({ title, value, unit, desc, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
                {unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
            </div>
            <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase tracking-widest">{desc}</p>
        </div>
    );
}

function CycleRiskItem({ title, level, status, anomalies }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-bold text-white">{title}</h4>
                <div className="flex items-center gap-4">
                    <span className="text-[8px] font-black text-slate-500 uppercase">{anomalies} anomalies</span>
                    <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                        status === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                            status === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>{status}</span>
                </div>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full transition-all duration-1000",
                        status === "High" ? "bg-rose-500" : status === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${level}%` }}
                />
            </div>
        </div>
    );
}

function InvestigationItem({ title, result, desc, type }: any) {
    return (
        <div className="flex gap-4 items-start group">
            <div className={cn(
                "w-2 h-2 rounded-full mt-2 ring-4 ring-opacity-10",
                type === "danger" ? "bg-rose-500 ring-rose-500/20" :
                    type === "warning" ? "bg-amber-500 ring-amber-500/20" : "bg-indigo-500 ring-indigo-500/20"
            )} />
            <div>
                <div className="flex justify-between items-center mb-0.5">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{title}</p>
                    <span className={cn("text-[9px] font-black uppercase", type === "danger" ? "text-rose-400" : "text-slate-500")}>{result}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}
