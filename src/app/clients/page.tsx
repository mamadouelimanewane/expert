"use client";

import { useState } from "react";
import { mockClients, Client } from "@/data/mock-clients";
import {
    Building2,
    User,
    Search,
    Filter,
    MoreHorizontal,
    MapPin,
    Phone,
    Calendar,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [clients, setClients] = useState<Client[]>(mockClients);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Clients</h2>
                    <p className="text-slate-400 mt-1">Gestion du portefeuille clients et fiches tiers.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25">
                    + Nouveau Client
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, pays..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors">
                    <Filter className="w-5 h-5" />
                    Filtres
                </button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <div key={client.id} className="glass-card rounded-2xl p-6 border border-slate-700/50 group hover:border-indigo-500/30 transition-all duration-300">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center border",
                                    client.type === "Personne Morale"
                                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                )}>
                                    {client.type === "Personne Morale" ? <Building2 className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">{client.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <MapPin className="w-3 h-3" />
                                        {client.city}, {client.country}
                                    </div>
                                </div>
                            </div>
                            <button className="text-slate-500 hover:text-white">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Identifiers & Details */}
                        <div className="space-y-3 mb-6">
                            <div className="p-3 bg-slate-900/50 rounded-lg space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Régime:</span>
                                    <span className="text-slate-200 font-medium">{client.regimeFiscal}</span>
                                </div>
                                {/* Specific Fields display logic */}
                                {client.rccm && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">RCCM:</span>
                                        <span className="text-slate-400 font-mono">{client.rccm}</span>
                                    </div>
                                )}
                                {client.ninea && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">NINEA:</span>
                                        <span className="text-slate-400 font-mono">{client.ninea}</span>
                                    </div>
                                )}
                                {client.cc && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">CC:</span>
                                        <span className="text-slate-400 font-mono">{client.cc}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Historique">
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Documents">
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Contact">
                                    <Phone className="w-4 h-4" />
                                </button>
                            </div>
                            <span className={cn(
                                "px-2 py-1 text-xs rounded-full font-medium border",
                                client.status === "Actif" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    client.status === "Prospect" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                        "bg-slate-700/30 text-slate-500 border-slate-600/30"
                            )}>
                                {client.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
