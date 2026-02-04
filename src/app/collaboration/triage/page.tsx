"use client";

import { useState } from "react";
import {
    Inbox,
    CheckSquare,
    Mail,
    Clock,
    AlertCircle,
    User,
    ArrowRight,
    Star,
    MoreHorizontal,
    Search,
    Filter,
    CheckCircle2,
    MessageSquare,
    Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRIAGE_ITEMS = [
    {
        id: "1",
        type: "email",
        priority: "high",
        from: "Amadou Diallo (SIB)",
        subject: "Urgent : Pièces manquantes Audit 2024",
        preview: "Bonjour Maître, suite à notre échange téléphonique, voici les relevés manquants...",
        time: "10:45",
        status: "new",
        assignee: null
    },
    {
        id: "2",
        type: "task",
        priority: "medium",
        from: "Système (Boni/Mali)",
        subject: "Alerte Rentabilité : Dossier Orange CI",
        preview: "Le budget temps est dépassé de 15% sur la mission d'Audit Légal.",
        time: "09:30",
        status: "new",
        assignee: "Expert Principal"
    },
    {
        id: "3",
        type: "note",
        priority: "low",
        from: "Sophie Koné (Interne)",
        subject: "Note sur la réunion TVA",
        preview: "Les points à vérifier pour la déclaration de Juillet sont les suivants...",
        time: "Hier",
        status: "read",
        assignee: null
    },
    {
        id: "4",
        type: "email",
        priority: "medium",
        from: "Direction Générale Impôts",
        subject: "Accusé de réception - Liasse Fiscale",
        preview: "Votre dépôt a bien été enregistré sous le numéro REF-2024-8899...",
        time: "Hier",
        status: "read",
        assignee: null
    }
];

export default function TriagePage() {
    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8 animate-in fade-in duration-500">

            {/* Karbon-style Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-8 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
                        Gestion du Travail Unifiée
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Inbox className="w-10 h-10 text-sky-500" />
                        Triage & Mails
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Votre "Inbox Zéro" pour le cabinet. Centralisez Emails, Tâches et Notes internes.
                        Transformez chaque email en tâche assignable en un clic.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Créer Tâche
                    </button>
                    <button className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Nouveau Email
                    </button>
                </div>
            </div>

            {/* Triage Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar Filter */}
                <div className="space-y-2">
                    {["Triage (3)", "À faire", "Assigné à d'autres", "Brouillons", "Envoyés", "Terminés"].map((label, i) => (
                        <div key={i} className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all",
                            i === 0 ? "bg-sky-500/10 text-sky-400 font-bold" : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}>
                            <span>{label}</span>
                            {i === 0 && <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>}
                        </div>
                    ))}

                    <div className="pt-8 text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Espaces de Travail</div>
                    {["Audit & Légal", "Expertise Comptable", "Social & Paie", "Juridique"].map((space, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white cursor-pointer">
                            <div className={cn("w-2 h-2 rounded-full", ["bg-rose-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500"][i])} />
                            <span className="text-sm font-medium">{space}</span>
                        </div>
                    ))}
                </div>

                {/* Main Inbox List */}
                <div className="lg:col-span-3 space-y-4">

                    {/* Toolbar */}
                    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Rechercher dans Triage..." className="w-full bg-transparent border-none text-sm text-white pl-10 focus:ring-0" />
                        </div>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <button className="p-2 text-slate-400 hover:text-white"><Filter className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-white"><CheckCircle2 className="w-4 h-4" /></button>
                    </div>

                    {/* Timeline Items */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white mb-4">Aujourd'hui</h4>
                        {TRIAGE_ITEMS.slice(0, 2).map((item) => <TriageItem key={item.id} item={item} />)}

                        <h4 className="text-sm font-bold text-slate-500 mt-8 mb-4">Hier</h4>
                        {TRIAGE_ITEMS.slice(2).map((item) => <TriageItem key={item.id} item={item} />)}
                    </div>

                </div>
            </div>
        </div>
    );
}

function TriageItem({ item }: any) {
    return (
        <div className={cn(
            "group glass-card p-4 rounded-xl border transition-all cursor-pointer flex gap-4 items-start",
            item.status === "new" ? "bg-slate-800/40 border-sky-500/30 shadow-[0_0_15px_-5px_rgba(14,165,233,0.3)]" : "bg-slate-900/20 border-white/5 opacity-80 hover:opacity-100"
        )}>
            <div className="pt-1">
                {item.type === "email" ? <Mail className={cn("w-5 h-5", item.status === "new" ? "text-sky-400" : "text-slate-500")} /> :
                    item.type === "task" ? <CheckSquare className="w-5 h-5 text-emerald-400" /> :
                        <MessageSquare className="w-5 h-5 text-slate-500" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className={cn("font-bold text-sm", item.status === "new" ? "text-white" : "text-slate-400")}>
                        {item.from}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.time}</span>
                </div>
                <h4 className={cn("text-sm mb-1 truncate", item.status === "new" ? "font-bold text-white" : "font-medium text-slate-300")}>
                    {item.subject}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">{item.preview}</p>
            </div>

            <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.assignee && (
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white" title={`Assigné à ${item.assignee}`}>EP</div>
                )}
                <button className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"><Star className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"><Clock className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white"><ArrowRight className="w-4 h-4" /></button>
            </div>
        </div>
    );
}

