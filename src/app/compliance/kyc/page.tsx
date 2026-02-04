"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Users,
    AlertCircle,
    CheckCircle2,
    Search,
    Filter,
    ArrowRight,
    Download,
    FileText,
    Sparkles,
    Scale,
    Fingerprint,
    SearchCode,
    Activity,
    Lock,
    Eye,
    Landmark,
    Flag
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCClient {
    id: string;
    name: string;
    riskLevel: "Faible" | "Modéré" | "Élevé" | "Critique";
    lastReview: string;
    nextReview: string;
    uboIdentified: boolean;
    status: "Validé" | "En attente" | "Expire bientôt";
}

const MOCK_KYC: KYCClient[] = [
    { id: "1", name: "Société Ivoirienne de Banque", riskLevel: "Faible", lastReview: "12/01/2024", nextReview: "12/01/2025", uboIdentified: true, status: "Validé" },
    { id: "2", name: "Traoré Import-Export", riskLevel: "Modéré", lastReview: "05/11/2023", nextReview: "05/05/2024", uboIdentified: true, status: "Validé" },
    { id: "3", name: "Holding Africaine BTP", riskLevel: "Élevé", lastReview: "28/12/2023", nextReview: "28/03/2024", uboIdentified: false, status: "En attente" },
    { id: "4", name: "Mining Resources Ltd", riskLevel: "Critique", lastReview: "15/05/2023", nextReview: "15/02/2024", uboIdentified: true, status: "Expire bientôt" },
];

export default function KycIntelligenceHub() {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Premium - KYC/AML */}
            <div className="bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Fingerprint className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Compliance & LCB/FT
                            </span>
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                Standard CENTIF / GAFI
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            KYC <span className="text-indigo-400">Intelligence Hub</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Maîtrisez votre risque réglementaire. Identification des bénéficiaires effectifs, filtrage des listes de sanctions et scoring de risque en temps réel.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <PlusIcon className="w-5 h-5" /> Nouveau Dossier KYC
                        </button>
                    </div>
                </div>
            </div>

            {/* KYC Risk Radar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KycStatCard title="Total Dossiers" value="124" trend="+3" icon={Users} color="text-indigo-400" />
                <KycStatCard title="Risques Critiques" value="2" trend="stable" icon={Flag} color="text-rose-400" />
                <KycStatCard title="Revue Due" value="12" trend="Urgences" icon={AlertCircle} color="text-amber-400" />
                <KycStatCard title="Couverture UBO" value="94.2" unit="%" trend="+1.2%" icon={ShieldCheck} color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main KYC List */}
                <div className="lg:col-span-8 glass-card rounded-[48px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="w-6 h-6 text-indigo-400" />
                            Registre des Contrôles Clients
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                                <input placeholder="Rechercher client..." className="bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Entité</th>
                                    <th className="px-6 py-6 text-center">Niveau Risque</th>
                                    <th className="px-6 py-6 text-center">UBO</th>
                                    <th className="px-6 py-6">Dernière Revue</th>
                                    <th className="px-8 py-6 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_KYC.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-white group-hover:scale-110 transition-transform">
                                                    {client.name[0]}
                                                </div>
                                                <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                client.riskLevel === "Faible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    client.riskLevel === "Modéré" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
                                            )}>
                                                {client.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {client.uboIdentified ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-xs font-bold text-slate-300">{client.lastReview}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase truncate">Prochaine: {client.nextReview}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase",
                                                client.status === "Validé" ? "text-emerald-500" :
                                                    client.status === "En attente" ? "text-amber-500" : "text-rose-500"
                                            )}>{client.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Screening Insights */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform">
                            <SearchCode className="w-48 h-48 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                            <Sparkles className="w-6 h-6 text-indigo-400" />
                            Screening IA Global
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <ScreeningItem title="Listes de Sanctions" status="Sain" desc="Filtrage OFAC/UE/ONU" />
                            <ScreeningItem title="Personnalités Exposées (PPE)" status="2 Détectés" desc="Revue manuelle requise" color="amber" />
                            <ScreeningItem title="Adverse Media" status="Aucun match" desc="Presse & Web Analysis" />
                        </div>

                        <div className="mt-10 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl group cursor-pointer hover:bg-indigo-600/20 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Alerte IA Nexus</span>
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                            </div>
                            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                                "La société <b className="text-white">Holding Africaine BTP</b> présente une structure actionnariale complexe (3 niveaux de cascade). L'IA suggère une revue approfondie du bénéficiaire effectif résidant à Dubaï."
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-900/60 border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Landmark className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Obligations CENTIF</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Conformément à la Loi relative à la lutte contre le blanchiment de capitaux, votre registre KYC est audité tous les 6 mois.
                        </p>
                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                            Extraire le Registre LCB/FT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KycStatCard({ title, value, unit, trend, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full text-slate-500 uppercase">
                    {trend}
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}

function ScreeningItem({ title, status, desc, color = "emerald" }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
                <h4 className="text-xs font-black text-white uppercase tracking-tight">{title}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase">{desc}</p>
            </div>
            <span className={cn(
                "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                color === "emerald" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
            )}>
                {status}
            </span>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
