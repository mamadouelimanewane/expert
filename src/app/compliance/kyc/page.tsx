"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Users,
    AlertCircle,
    CheckCircle2,
    Search,
    Sparkles,
    Fingerprint,
    Activity,
    Landmark,
    Flag,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KYCClient {
    id: string;
    name: string;
    country: string;
    hasIdentifiers: boolean;
    lastUpdate: string;
    status: "Validé" | "Invalide" | "Non renseigné";
}

interface Kpis {
    total: number;
    validCount: number;
    invalidCount: number;
    pendingCount: number;
    coveragePct: number | null;
}

export default function KycIntelligenceHub() {
    const [registry, setRegistry] = useState<KYCClient[]>([]);
    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/compliance/kyc");
                const data = await res.json();
                if (!res.ok || data.error) {
                    setError(data.error || "Erreur lors du chargement du registre KYC.");
                    return;
                }
                setRegistry(data.registry);
                setKpis(data.kpis);
            } catch (err) {
                console.error("Failed to load KYC registry", err);
                setError("Erreur de connexion au serveur.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = registry.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Premium - KYC/AML */}
            <div className="bg-slate-900/40 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-16 opacity-5 pointer-events-none">
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
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            KYC <span className="text-indigo-400">Intelligence Hub</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Registre de conformité client basé sur les dossiers réels du cabinet (statut KYC, identifiants réglementaires).
                        </p>
                    </div>
                </div>
            </div>

            {/* KYC KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KycStatCard title="Total Dossiers" value={kpis ? kpis.total : "—"} icon={Users} color="text-indigo-400" />
                <KycStatCard title="Dossiers Invalides" value={kpis ? kpis.invalidCount : "—"} icon={Flag} color="text-rose-400" />
                <KycStatCard title="Non Renseignés" value={kpis ? kpis.pendingCount : "—"} icon={AlertCircle} color="text-amber-400" />
                <KycStatCard title="Couverture KYC Validée" value={kpis && kpis.coveragePct !== null ? kpis.coveragePct : "—"} unit={kpis && kpis.coveragePct !== null ? "%" : ""} icon={ShieldCheck} color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main KYC List */}
                <div className="lg:col-span-8 glass-card rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl flex flex-col">
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40">
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="w-6 h-6 text-indigo-400" />
                            Registre des Contrôles Clients
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    placeholder="Rechercher client..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none w-64 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="py-24 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="py-24 flex flex-col items-center justify-center gap-3 text-center px-8">
                                <AlertTriangle className="w-10 h-10 text-amber-500" />
                                <p className="text-sm text-slate-300 max-w-md">{error}</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-24 text-center text-slate-500 text-sm">Aucun client ne correspond.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                        <tr>
                                            <th className="px-8 py-6">Entité</th>
                                            <th className="px-6 py-6 text-center">Identifiants (RCCM/NINEA)</th>
                                            <th className="px-6 py-6">Dernière mise à jour</th>
                                            <th className="px-8 py-6 text-right">Statut KYC</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filtered.map((client) => (
                                            <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-white group-hover:scale-110 transition-transform">
                                                            {client.name[0]}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors block">{client.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{client.country}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    {client.hasIdentifiers ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-xs font-bold text-slate-300">{client.lastUpdate}</p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase",
                                                        client.status === "Validé" ? "text-emerald-500" :
                                                            client.status === "Invalide" ? "text-rose-500" : "text-slate-500"
                                                    )}>{client.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Honest state: AI screening not connected */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-amber-500/20 bg-amber-500/5 text-center">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-amber-500" />
                        </div>
                        <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-2">Screening IA Global</h4>
                        <p className="text-[10px] text-amber-400/80 font-bold mt-2 leading-relaxed uppercase">
                            Filtrage listes de sanctions (OFAC/UE/ONU) non configuré — nécessite une intégration tierce.
                        </p>
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-900/60 border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Landmark className="w-5 h-5 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Obligations CENTIF</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Conformément à la Loi relative à la lutte contre le blanchiment de capitaux, le cabinet doit maintenir un registre KYC à jour pour chaque client actif.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KycStatCard({ title, value, unit, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-3xl bg-white/5 transition-transform group-hover:scale-110", color)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 tracking-tighter">{value}{unit || ""}</h3>
        </div>
    );
}
