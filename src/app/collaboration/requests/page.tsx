"use client";

import { useState } from "react";
import {
    MessageSquare,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    Send,
    FileQuestion,
    Paperclip,
    Mail,
    Phone,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const REQUESTS = [
    {
        id: "REQ-001",
        client: "Société Ivoirienne de Banque",
        type: "Justificatif Manquant",
        details: "Transaction -50 000 FCFA (10/06/2024)",
        status: "pending",
        date: "Il y a 2h",
        priority: "high"
    },
    {
        id: "REQ-002",
        client: "Global Tech Solutions",
        type: "Signature Requise",
        details: "PV d'Assemblée Générale Ordinaire",
        status: "sent",
        date: "Il y a 1j",
        priority: "medium"
    },
    {
        id: "REQ-003",
        client: "Pharmacie du Plateau",
        type: "Information Manquante",
        details: "Matricule Nouveaux Employés",
        status: "replied",
        date: "Il y a 2j",
        priority: "low"
    },
    {
        id: "REQ-004",
        client: "Boulangerie Moderne",
        type: "Justificatif Manquant",
        details: "Facture Orange (Internet)",
        status: "completed",
        date: "Il y a 3j",
        priority: "low"
    }
];

export default function CollaborationRequestsPage() {
    const [filter, setFilter] = useState("all");

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Collaboration Client
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <MessageSquare className="w-10 h-10 text-emerald-500" />
                        Centre de Requêtes
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Gérez les demandes de justificatifs, signatures et informations manquantes.
                        Relancez vos clients en un clic par Email ou WhatsApp.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Nouvelle Requête
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "En attente client", value: "12", color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
                    { label: "Répondues", value: "5", color: "text-indigo-400", bg: "bg-indigo-500/10", icon: MessageSquare },
                    { label: "Traitées", value: "128", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
                    { label: "Urgent", value: "3", color: "text-rose-400", bg: "bg-rose-500/10", icon: AlertCircle },
                ].map((metric, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40 flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", metric.bg)}>
                            <metric.icon className={cn("w-6 h-6", metric.color)} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{metric.value}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{metric.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/30 p-2 rounded-xl border border-white/5">
                <div className="flex gap-2">
                    {["all", "pending", "replied", "completed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                filter === f ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {f === "all" ? "Toutes" : f === "pending" ? "En attente" : f === "replied" ? "Répondues" : "Terminées"}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher un dossier..."
                        className="w-full bg-slate-950 border-none rounded-lg pl-10 py-2 text-sm text-white placeholder:text-slate-600 focus:ring-0"
                    />
                </div>
            </div>

            {/* Request List */}
            <div className="glass-card rounded-3xl border border-white/5 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th className="p-6">Client</th>
                            <th className="p-6">Type de Requête</th>
                            <th className="p-6">Priorité</th>
                            <th className="p-6">Statut</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {REQUESTS.map((req) => (
                            <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                            {req.client.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{req.client}</p>
                                            <p className="text-xs text-slate-500">{req.date}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {req.type === "Justificatif Manquant" ? <FileQuestion className="w-4 h-4 text-amber-500" /> :
                                                req.type === "Signature Requise" ? <Paperclip className="w-4 h-4 text-indigo-500" /> :
                                                    <AlertCircle className="w-4 h-4 text-slate-500" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">{req.type}</p>
                                            <p className="text-xs text-slate-500 mt-1">{req.details}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                                        req.priority === "high" ? "bg-rose-500/10 text-rose-400" :
                                            req.priority === "medium" ? "bg-amber-500/10 text-amber-400" :
                                                "bg-slate-500/10 text-slate-400"
                                    )}>
                                        {req.priority === "high" ? "Haute" : req.priority === "medium" ? "Moyenne" : "Basse"}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-bold border",
                                        req.status === "pending" ? "bg-amber-500/5 border-amber-500/20 text-amber-400" :
                                            req.status === "sent" ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-400" :
                                                req.status === "replied" ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-400" :
                                                    "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                    )}>
                                        {req.status === "pending" ? "À Envoyer" :
                                            req.status === "sent" ? "Envoyé" :
                                                req.status === "replied" ? "Réponse Reçue" : "Traité"}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white" title="Envoyer Email">
                                            <Mail className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-emerald-900/30 hover:bg-emerald-800/50 text-emerald-400 rounded-lg" title="Relancer WhatsApp">
                                            <Phone className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 border border-white/10 hover:bg-white/5 rounded-lg text-slate-400" title="Voir Détails">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
