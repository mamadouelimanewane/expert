"use client";
// Build: 2026-01-28 22:15

import { useEffect, useState } from "react";
import {
    Users,
    Building2,
    Search,
    Filter,
    MoreHorizontal,
    MapPin,
    Phone,
    Calendar,
    FileText,
    LayoutGrid,
    List,
    TrendingUp,
    Activity,
    AlertCircle,
    CheckCircle2,
    Globe,
    Briefcase,
    MessageSquare,
    Star,
    ArrowUpRight,
    PieChart,
    Download,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Client } from "@prisma/client";

interface ClientWithCount extends Client {
    _count?: {
        missions: number;
        invoices: number;
        declarations: number;
    };
}

export default function ClientsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<ClientWithCount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/clients");
            const data = await res.json();
            if (data.clients) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error("Failed to fetch clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const name = (client.companyName || `${client.firstName} ${client.lastName}` || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) ||
            (client.sector && client.sector.toLowerCase().includes(search)) ||
            (client.city && client.city.toLowerCase().includes(search));
    });

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Actions & Fitlers */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
                <div className="flex gap-2 p-1 bg-slate-900 border border-white/10 rounded-2xl self-start sm:self-auto">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-2 sm:p-3 rounded-xl transition-all", viewMode === "grid" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-2 sm:p-3 rounded-xl transition-all", viewMode === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <List className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                <div className="flex-1 w-full max-w-2xl relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, RCCM, ville..."
                        className="w-full pl-14 pr-6 py-3 sm:py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                    <Briefcase className="w-4 h-4" /> Nouveau Dossier
                </button>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 font-medium">Chargement de votre portefeuille...</p>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="glass-card p-12 rounded-[32px] border border-white/5 bg-slate-900/10 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
                        <Users className="w-10 h-10 text-slate-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Aucun client trouvé</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Commencez par ajouter votre premier client pour gérer ses missions et sa fiscalité.</p>
                    </div>
                    <button className="mt-4 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all border border-white/5">
                        Ajouter un client
                    </button>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClients.map((client) => {
                        const name = client.companyName || `${client.firstName} ${client.lastName}`;
                        // Derived health score for mock feel (in real app, this would be computed)
                        const healthScore = client.isActive ? 85 : 45;

                        return (
                            <div key={client.id} className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/20 group hover:bg-slate-900/40 hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col justify-between h-full min-h-[250px]">
                                <div className={cn(
                                    "absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 rounded-full pointer-events-none transition-all",
                                    healthScore > 80 ? "bg-emerald-500 group-hover:bg-emerald-400" : "bg-rose-500 group-hover:bg-rose-400"
                                )} />

                                <div className="relative z-10 mb-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg",
                                            client.type === "ENTREPRISE"
                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                        )}>
                                            {client.type === "ENTREPRISE" ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                        </div>
                                        <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-white text-base sm:text-lg leading-tight mb-1 line-clamp-2">{name}</h3>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{client.sector || "SECTEUR NON DEFINI"}</p>
                                </div>

                                <div className="space-y-4 mb-6 relative z-10">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {client.city ? `${client.city}, ` : ""}{client.country}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Santé Client</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-12 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", healthScore > 80 ? "bg-emerald-500" : "bg-rose-500")}
                                                    style={{ width: `${healthScore}%` }}
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black",
                                                healthScore > 80 ? "text-emerald-400" : "text-rose-400"
                                            )}>{healthScore}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 relative z-10">
                                    <div className="flex gap-1">
                                        <ActionButton icon={Phone} />
                                        <ActionButton icon={MessageSquare} />
                                        <ActionButton icon={FileText} />
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border",
                                        client.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                    )}>
                                        {client.isActive ? "Actif" : "Inactif"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Client Card */}
                    <div className="glass-card p-6 rounded-[32px] border-2 border-dashed border-slate-700/50 hover:border-indigo-500/50 bg-slate-900/10 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all min-h-[250px]">
                        <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-colors flex items-center justify-center shadow-2xl">
                            <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 group-hover:text-indigo-400 uppercase tracking-widest">Nouveau Dossier</p>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-2xl sm:rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Client / Secteur</th>
                                    <th className="px-6 py-6 font-black text-center">Pays</th>
                                    <th className="px-6 py-6 font-black text-center">Santé (IA)</th>
                                    <th className="px-6 py-6 font-black text-right whitespace-nowrap">Missions</th>
                                    <th className="px-6 py-6 font-black text-center">Statut</th>
                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredClients.map((client) => {
                                    const name = client.companyName || `${client.firstName} ${client.lastName}`;
                                    const healthScore = client.isActive ? 85 : 45;

                                    return (
                                        <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                                        {name[0]}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white block truncate max-w-[200px]">{name}</span>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{client.sector || "NON DEFINI"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/5">
                                                    <Globe className="w-3 h-3 text-indigo-400" />
                                                    <span className="text-[10px] font-bold text-slate-300">{client.country}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={cn(
                                                    "font-black text-sm",
                                                    healthScore > 80 ? "text-emerald-400" : "text-rose-400"
                                                )}>{healthScore}/100</span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <span className="font-mono text-white font-bold">{client._count?.missions || 0}</span>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                    client.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                                )}>
                                                    {client.isActive ? "Actif" : "Inactif"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bandeau de synthèse bas de page */}
            <div className="relative p-8 sm:p-12 rounded-[40px] bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-white/5 overflow-hidden shadow-2xl mt-12 animate-in slide-in-from-bottom-10 duration-1000">
                <div className="absolute -bottom-10 -left-10 p-20 opacity-10 bg-indigo-500 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-2">⭐ Portefeuille Clients 360°</h2>
                        <p className="text-slate-400 text-sm sm:text-base max-w-xl font-medium">
                            Gestion centralisée des tiers, scoring de risque KYC et opportunités de cross-selling.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-end gap-4 w-full lg:w-auto">
                        <KPICard label="Revenus Récurrents" value="34.2M" trend="+12%" icon={TrendingUp} color="text-emerald-400" />
                        <KPICard label="Clients Actifs" value="42" trend="+3" icon={Activity} color="text-indigo-400" />
                        <KPICard label="Risque Churn" value="2" trend="stable" icon={AlertCircle} color="text-rose-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface KPICardProps {
    label: string;
    value: string;
    trend: string;
    icon: any; // Type generic for Lucide icons
    color: string;
}

function KPICard({ label, value, trend, icon: Icon, color }: KPICardProps) {
    return (
        <div className="glass-card px-4 sm:px-6 py-4 rounded-2xl sm:rounded-[28px] border border-white/5 bg-slate-900/50 flex items-center gap-4 flex-1">
            <div className={cn("p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5", color)}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
                <p className="text-[8px] sm:text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-white tracking-tight">{value}</span>
                    <span className={cn("text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/5", color)}>
                        {trend}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon }: { icon: any }) {
    return (
        <button className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all hover:scale-110 hover:shadow-lg border border-white/5">
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}
