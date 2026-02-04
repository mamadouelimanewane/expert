"use client";

import { useState } from "react";
import {
    ShieldAlert,
    Search,
    Filter,
    Globe,
    AlertCircle,
    CheckCircle2,
    XCircle,
    UserX,
    Building,
    ExternalLink,
    FileText,
    History,
    RefreshCw,
    Download,
    Eye,
    Landmark,
    Users,
    Activity,
    Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

import { NEXUS_SCREENING_DATA } from "@/data/nexus-risk-data";

export default function FinancialCrimeHubPage() {
    const [entities, setEntities] = useState<any[]>(NEXUS_SCREENING_DATA);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScreening, setIsScreening] = useState(false);

    const getRiskColor = (level: string) => {
        switch (level) {
            case "critical": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "high": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
            case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "low": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    const handleScreening = () => {
        if (!searchQuery.trim()) return;
        setIsScreening(true);
        setTimeout(() => {
            setIsScreening(false);
            setSearchQuery("");
        }, 3000);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <ShieldAlert className="w-64 h-64 text-rose-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-rose-500/20">
                                NEXUS Premium
                            </span>
                            <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-slate-500/20">
                                Financial Crime Compliance
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Financial <span className="text-rose-400">Crime Hub</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Screening mondial contre le blanchiment d'argent (AML), les sanctions et les personnes politiquement exposées (PEP).
                        </p>
                    </div>

                    <div className="flex bg-slate-900/40 p-2 rounded-3xl border border-white/5 shadow-inner">
                        <div className="px-6 py-3 text-center border-r border-white/5">
                            <div className="text-2xl font-black text-rose-400">1.2M+</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">PEP Profilés</div>
                        </div>
                        <div className="px-6 py-3 text-center">
                            <div className="text-2xl font-black text-white">200+</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Listes de Sanctions</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Search & Screening */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <Search className="w-5 h-5 text-rose-400" /> Lancer un Screening
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Nom du bénéficiaire effectif ou société..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Juridiction</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none">
                                        <option>Toutes</option>
                                        <option>UEMOA / CEDEAO</option>
                                        <option>Union Européenne</option>
                                        <option>États-Unis (OFAC)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Type d'Entité</label>
                                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none">
                                        <option>Toutes</option>
                                        <option>Particulier</option>
                                        <option>Entreprise</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleScreening}
                                disabled={isScreening || !searchQuery.trim()}
                                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-rose-600/30 disabled:opacity-50"
                            >
                                {isScreening ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                                {isScreening ? "Analyse en cours..." : "Exécuter Screening Global"}
                            </button>
                        </div>
                    </div>

                    {/* Stats/Status */}
                    <div className="glass-card p-6 rounded-[32px] bg-slate-900/40 border border-white/5">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Statistiques du Cabinet</h4>
                        <div className="space-y-3">
                            {[
                                { label: "Screenings ce mois", value: "342", icon: Activity, color: "text-blue-400" },
                                { label: "Alertes rouges (hits)", value: "14", icon: AlertCircle, color: "text-rose-400" },
                                { label: "Dossiers KYC validés", value: "298", icon: CheckCircle2, color: "text-emerald-400" },
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                                        <span className="text-xs font-bold text-slate-300">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-white">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Screening Activity */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Activités de Surveillance</h3>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {entities.map((entity: any) => (
                            <div
                                key={entity.id}
                                className={cn(
                                    "glass-card rounded-[32px] border p-6 transition-all hover:scale-[1.01] cursor-pointer",
                                    entity.status === "hit_detected" ? "border-rose-500/30 bg-rose-500/5 shadow-lg shadow-rose-900/10" :
                                        entity.status === "investigating" ? "border-amber-500/30 bg-amber-500/5" :
                                            "border-white/5 bg-slate-900/40"
                                )}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                                            entity.type === "individual" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                                        )}>
                                            {entity.type === "individual" ? <Users className="w-6 h-6" /> : <Building className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white">{entity.name}</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> {entity.country} • {entity.lastScreening}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase border", getRiskColor(entity.riskLevel))}>
                                        Risque {entity.riskLevel}
                                    </div>
                                </div>

                                {entity.hitDetails.length > 0 && (
                                    <div className="mb-6 space-y-2">
                                        {entity.hitDetails.map((hit: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                                                    <span className="text-[10px] font-bold text-slate-400">{hit.source}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-md font-black uppercase">{hit.category}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-white">{hit.matchProbability}% Match</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                                            <FileText className="w-3.5 h-3.5" /> Rapport Complet
                                        </button>
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                                            <History className="w-3.5 h-3.5" /> Historique
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        {entity.status === "hit_detected" && (
                                            <button className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black uppercase rounded-lg transition-all">
                                                Révoquer Accès
                                            </button>
                                        )}
                                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase rounded-lg border border-white/10 transition-all flex items-center gap-2">
                                            <Eye className="w-3.5 h-3.5" /> Gérer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Security Banner */}
                    <div className="glass-card p-6 rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">Audit Log Sécurisé</h4>
                                <p className="text-[10px] text-slate-500">Toutes les recherches sont enregistrées en blockchain pour conformité.</p>
                            </div>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
