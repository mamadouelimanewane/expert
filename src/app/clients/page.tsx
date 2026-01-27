"use client";

import { useState } from "react";
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
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
    id: string;
    name: string;
    type: "Personne Morale" | "Personne Physique";
    sector: string;
    country: string;
    city: string;
    status: "Actif" | "Prospect" | "Inactif" | "Contentieux";
    healthScore: number;
    lastContact: string;
    arr: string; // Annual Recurring Revenue
    manager: string;
}

const MOCK_CLIENTS: Client[] = [
    { id: "CL-01", name: "Société Ivoirienne de Banque", type: "Personne Morale", sector: "Banque & Finance", country: "Côte d'Ivoire", city: "Abidjan", status: "Actif", healthScore: 95, lastContact: "Hier", arr: "12.5M", manager: "K. Touré" },
    { id: "CL-02", name: "Traoré Import-Export", type: "Personne Morale", sector: "Négoce Int.", country: "Mali", city: "Bamako", status: "Actif", healthScore: 82, lastContact: "Il y a 3j", arr: "4.8M", manager: "A. Koné" },
    { id: "CL-03", name: "Clinique des Mamelles", type: "Personne Morale", sector: "Santé", country: "Sénégal", city: "Dakar", status: "Contentieux", healthScore: 45, lastContact: "Il y a 15j", arr: "7.2M", manager: "P. Ndiaye" },
    { id: "CL-04", name: "M. Jean-Paul Ouedraogo", type: "Personne Physique", sector: "Investisseur", country: "Burkina Faso", city: "Ouagadougou", status: "Prospect", healthScore: 60, lastContact: "Aujourd'hui", arr: "0", manager: "E. Diop" },
    { id: "CL-05", name: "Tech Solutions Gabon", type: "Personne Morale", sector: "IT Services", country: "Gabon", city: "Libreville", status: "Actif", healthScore: 91, lastContact: "Il y a 2j", arr: "3.1M", manager: "K. Touré" },
];

export default function ClientsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tous");

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Header Premium */}
            <div className="relative p-10 rounded-[50px] bg-slate-900 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 bg-indigo-500 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div>
                        <div className="flex items-center gap-5 mb-4">
                            <div className="p-4 bg-blue-600 rounded-[24px] shadow-2xl shadow-blue-600/30">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tighter">Portefeuille Clients 360°</h2>
                        </div>
                        <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
                            Gestion centralisée des tiers, scoring de risque KYC et opportunités de cross-selling.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <KPICard label="Revenus Récurrents" value="34.2M" trend="+12%" icon={TrendingUp} color="text-emerald-400" />
                        <KPICard label="Clients Actifs" value="42" trend="+3" icon={Activity} color="text-indigo-400" />
                        <KPICard label="Risque Churn" value="2" trend="stable" icon={AlertCircle} color="text-rose-400" />
                    </div>
                </div>
            </div>

            {/* Actions & Fitlers */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-2 p-1 bg-slate-900 border border-white/10 rounded-2xl">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={cn("p-3 rounded-xl transition-all", viewMode === "grid" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn("p-3 rounded-xl transition-all", viewMode === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 max-w-2xl relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, RCCM, ville ou dirigeant..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                    <Briefcase className="w-4 h-4" /> Nouveau Dossier
                </button>
            </div>

            {/* Main Content */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {MOCK_CLIENTS.map((client) => (
                        <div key={client.id} className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/20 group hover:bg-slate-900/40 hover:scale-[1.02] transition-all relative overflow-hidden flex flex-col justify-between h-full">
                            <div className={cn(
                                "absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-20 rounded-full pointer-events-none transition-all",
                                client.healthScore > 80 ? "bg-emerald-500 group-hover:bg-emerald-400" :
                                    client.healthScore < 50 ? "bg-rose-500 group-hover:bg-rose-400" : "bg-amber-500 group-hover:bg-amber-400"
                            )} />

                            <div className="relative z-10 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg",
                                        client.type === "Personne Morale"
                                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                    )}>
                                        {client.type === "Personne Morale" ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                    </div>
                                    <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-white text-lg leading-tight mb-1">{client.name}</h3>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{client.sector}</p>
                            </div>

                            <div className="space-y-4 mb-6 relative z-10">
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {client.city}, {client.country}
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                    <span className="text-xs text-slate-500 font-bold uppercase">Santé Client</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-12 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", client.healthScore > 80 ? "bg-emerald-500" : client.healthScore < 50 ? "bg-rose-500" : "bg-amber-500")}
                                                style={{ width: `${client.healthScore}%` }}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-black",
                                            client.healthScore > 80 ? "text-emerald-400" : client.healthScore < 50 ? "text-rose-400" : "text-amber-400"
                                        )}>{client.healthScore}%</span>
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
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                    client.status === "Actif" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                        client.status === "Contentieux" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                            "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                )}>
                                    {client.status}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Add Client Card */}
                    <div className="glass-card p-6 rounded-[32px] border-2 border-dashed border-slate-700/50 hover:border-indigo-500/50 bg-slate-900/10 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all">
                        <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-indigo-600 transition-colors flex items-center justify-center shadow-2xl">
                            <Briefcase className="w-6 h-6 text-slate-400 group-hover:text-white" />
                        </div>
                        <p className="text-xs font-black text-slate-500 group-hover:text-indigo-400 uppercase tracking-widest">Nouveau Dossier</p>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Client / Secteur</th>
                                    <th className="px-6 py-6 font-black text-center">Pays</th>
                                    <th className="px-6 py-6 font-black text-center">Santé (IA)</th>
                                    <th className="px-6 py-6 font-black text-right">ARR (FCFA)</th>
                                    <th className="px-6 py-6 font-black">Manager</th>
                                    <th className="px-6 py-6 font-black text-center">Statut</th>
                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_CLIENTS.map((client) => (
                                    <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-slate-400">
                                                    {client.name[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{client.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{client.sector}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-white/5">
                                                <Globe className="w-3 h-3 text-indigo-400" />
                                                <span className="text-xs font-bold text-slate-300">{client.country}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "font-black text-sm",
                                                client.healthScore > 80 ? "text-emerald-400" :
                                                    client.healthScore < 50 ? "text-rose-400" : "text-amber-400"
                                            )}>{client.healthScore}/100</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono text-white font-bold">{client.arr}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white border border-white/10">
                                                    {client.manager[0]}
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium">{client.manager}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                                client.status === "Actif" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    client.status === "Contentieux" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                        "bg-slate-700/30 text-slate-400 border-slate-600/30"
                                            )}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
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

function KPICard({ label, value, trend, icon: Icon, color }: any) {
    return (
        <div className="glass-card px-6 py-4 rounded-[28px] border border-white/5 bg-slate-900/50 flex items-center gap-4 min-w-[200px]">
            <div className={cn("p-3 rounded-2xl bg-white/5", color)}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white tracking-tight">{value}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/5", color)}>
                        {trend}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon }: any) {
    return (
        <button className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all hover:scale-110 hover:shadow-lg border border-white/5">
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}
