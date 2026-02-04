"use client";

import { useState } from "react";
import {
    Target,
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    ArrowRight,
    TrendingUp,
    Users,
    Sparkles,
    MessageSquare,
    Building2,
    DollarSign,
    Zap,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Prospect {
    id: string;
    entreprise: string;
    contact: string;
    email: string;
    telephone: string;
    secteur: string;
    source: string;
    valeurEstimee: string;
    etape: "Prospect" | "Qualifié" | "Proposition" | "Négociation" | "Gagné" | "Perdu";
    prochainRdv: string | null;
    score: number;
}

const MOCK_PROSPECTS: Prospect[] = [
    {
        id: "P-001",
        entreprise: "Dakar Digital SA",
        contact: "Mme Fatou Diallo",
        email: "f.diallo@dakardigital.sn",
        telephone: "+221 77 123 4567",
        secteur: "Tech / Digital",
        source: "Recommandation",
        valeurEstimee: "3 500 000 FCFA",
        etape: "Proposition",
        prochainRdv: "2024-02-15",
        score: 85
    },
    {
        id: "P-002",
        entreprise: "Logistics Express",
        contact: "M. Amadou Kane",
        email: "a.kane@logex.com",
        telephone: "+221 76 987 6543",
        secteur: "Transport",
        source: "Salon Professionnel",
        valeurEstimee: "2 200 000 FCFA",
        etape: "Qualifié",
        prochainRdv: null,
        score: 62
    },
    {
        id: "P-003",
        entreprise: "Pharmacie Centrale Touba",
        contact: "Dr. Mbaye",
        email: "mbaye@pct.sn",
        telephone: "+221 78 456 7890",
        secteur: "Santé",
        source: "Site Web",
        valeurEstimee: "1 800 000 FCFA",
        etape: "Prospect",
        prochainRdv: "2024-02-10",
        score: 35
    },
    {
        id: "P-004",
        entreprise: "Groupe Immobilier Teranga",
        contact: "M. Oumar Ndiaye",
        email: "o.ndiaye@git.sn",
        telephone: "+221 70 111 2222",
        secteur: "Immobilier",
        source: "Partenariat BOA",
        valeurEstimee: "12 000 000 FCFA",
        etape: "Négociation",
        prochainRdv: "2024-02-08",
        score: 92
    }
];

const PIPELINE_STAGES = [
    { id: "Prospect", label: "Prospects", color: "bg-slate-500", count: 15 },
    { id: "Qualifié", label: "Qualifiés", color: "bg-indigo-500", count: 8 },
    { id: "Proposition", label: "Proposition", color: "bg-amber-500", count: 5 },
    { id: "Négociation", label: "Négociation", color: "bg-purple-500", count: 3 },
    { id: "Gagné", label: "Gagnés", color: "bg-emerald-500", count: 24 }
];

export default function ProspectsPage() {
    const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    const getProspectsByStage = (stage: string) => {
        return MOCK_PROSPECTS.filter(p => p.etape === stage);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative bg-slate-900/40 p-10 rounded-[50px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Target className="w-48 h-48 text-emerald-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-600/30">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            Gestion Commerciale (CRM)
                        </h2>
                        <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                            Suivez vos prospects, qualifiez les opportunités et développez votre portefeuille clients.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-1.5 bg-slate-800 border border-white/5 rounded-2xl flex gap-1">
                            <button
                                onClick={() => setViewMode("pipeline")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    viewMode === "pipeline" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                Pipeline
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    viewMode === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                Liste
                            </button>
                        </div>
                        <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/30 active:scale-95">
                            <Plus className="w-5 h-5" /> Nouveau Prospect
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard icon={Users} label="Prospects Actifs" value="48" color="text-white" />
                <StatCard icon={TrendingUp} label="Taux Conversion" value="32%" color="text-emerald-400" />
                <StatCard icon={Zap} label="Relances Auto" value="12" color="text-indigo-400" />
                <StatCard icon={Calendar} label="RDV Cette Semaine" value="7" color="text-amber-400" />
                <StatCard icon={Target} label="Objectif Atteint" value="78%" color="text-cyan-400" />
            </div>

            {/* Pipeline View */}
            {viewMode === "pipeline" && (
                <div className="overflow-x-auto pb-6">
                    <div className="flex gap-6 min-w-[1200px]">
                        {PIPELINE_STAGES.map((stage) => {
                            const prospects = getProspectsByStage(stage.id);
                            return (
                                <div key={stage.id} className="w-72 flex flex-col gap-4">
                                    {/* Stage Header */}
                                    <div className="flex items-center justify-between px-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px]", stage.color)} />
                                            <h3 className="font-black text-slate-200 uppercase tracking-widest text-[11px]">{stage.label}</h3>
                                            <span className="text-[10px] font-black text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-white/5">{stage.count}</span>
                                        </div>
                                    </div>

                                    {/* Prospects Cards */}
                                    <div className="flex-1 bg-slate-900/40 rounded-[32px] p-3 space-y-4 border border-white/5 min-h-[400px]">
                                        {prospects.length > 0 ? prospects.map((prospect) => (
                                            <ProspectCard key={prospect.id} prospect={prospect} stageColor={stage.color} />
                                        )) : (
                                            <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-[28px] flex flex-col items-center justify-center text-slate-600 gap-2">
                                                <Building2 className="w-6 h-6 opacity-20" />
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Aucun prospect</span>
                                            </div>
                                        )}

                                        <button className="w-full py-4 border border-dashed border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 hover:bg-white/5 transition-all">
                                            + Ajouter un prospect
                                        </button>
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
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Entreprise / Contact</th>
                                    <th className="px-6 py-6">Secteur</th>
                                    <th className="px-6 py-6 text-center">Score IA</th>
                                    <th className="px-6 py-6 text-right">Valeur Estimée</th>
                                    <th className="px-6 py-6 text-center">Étape</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_PROSPECTS.map((prospect) => (
                                    <tr key={prospect.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{prospect.entreprise}</span>
                                                    <span className="text-[10px] text-slate-500">{prospect.contact}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400 border border-white/5">{prospect.secteur}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn(
                                                    "text-lg font-black",
                                                    prospect.score >= 80 ? "text-emerald-400" :
                                                        prospect.score >= 50 ? "text-amber-400" : "text-slate-500"
                                                )}>{prospect.score}</span>
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            prospect.score >= 80 ? "bg-emerald-500" :
                                                                prospect.score >= 50 ? "bg-amber-500" : "bg-slate-600"
                                                        )}
                                                        style={{ width: `${prospect.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono font-bold text-white">{prospect.valeurEstimee}</span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                                                prospect.etape === "Gagné" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    prospect.etape === "Négociation" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                        prospect.etape === "Proposition" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-slate-700 text-slate-400 border-slate-600"
                                            )}>{prospect.etape}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all" title="Voir">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 hover:bg-indigo-500/10 rounded-xl text-indigo-400 transition-all" title="Appeler">
                                                    <Phone className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 hover:bg-emerald-500/10 rounded-xl text-emerald-400 transition-all" title="Email">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
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

function ProspectCard({ prospect, stageColor }: { prospect: Prospect, stageColor: string }) {
    return (
        <div className="group p-5 bg-slate-800/50 hover:bg-slate-800/80 rounded-2xl border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all shadow-lg relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full opacity-50", stageColor)} />

            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                        prospect.score >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            prospect.score >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                "bg-slate-700 text-slate-500 border-slate-600"
                    )}>
                        Score: {prospect.score}
                    </span>
                </div>
                <button className="text-slate-600 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            <h4 className="font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors text-sm leading-tight">{prospect.entreprise}</h4>
            <p className="text-xs text-slate-500 mb-4">{prospect.contact}</p>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs font-bold text-slate-400">{prospect.valeurEstimee}</span>
                <div className="flex items-center gap-3">
                    {/* AXONAUT INSPIRED: Automation Toggle */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20" title="Relance Automatique Active">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">AUTO</span>
                    </div>
                    {prospect.prochainRdv && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(prospect.prochainRdv).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
