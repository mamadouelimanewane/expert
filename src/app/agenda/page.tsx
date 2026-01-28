"use client";

import { useState } from "react";
import {
    Calendar as CalendarIcon,
    Video,
    Mic,
    FileText,
    Clock,
    UserPlus,
    MoreVertical,
    Bot,
    CheckCircle,
    Share
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Meeting {
    id: string;
    title: string;
    client: string;
    date: string;
    time: string;
    duration: string;
    type: "virtuelle" | "presentiel";
    status: "planifie" | "termine";
    hasReport: boolean;
}

const MOCK_MEETINGS: Meeting[] = [
    { id: "1", title: "Revue mensuelle Comptable", client: "Société Ivoirienne de Banque", date: "25 Mai", time: "10:00", duration: "1h", type: "virtuelle", status: "planifie", hasReport: false },
    { id: "2", title: "Audit de stock physique", client: "Traoré Import-Export", date: "25 Mai", time: "14:30", duration: "3h", type: "presentiel", status: "planifie", hasReport: false },
    { id: "3", title: "Clôture Exercice 2023", client: "Boulangerie du Plateau", date: "24 Mai", time: "09:00", duration: "2h", type: "virtuelle", status: "termine", hasReport: true },
];

export default function AgendaPage() {
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(MOCK_MEETINGS[0]);
    const [reportMode, setReportMode] = useState(false);
    const [notes, setNotes] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateReport = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setNotes(`## COMPTE RENDU DE MISSION
Date: 25 Mai 2024
Client: Société Ivoirienne de Banque

**1. Points abordés**
- Revue des comptes d'attente
- Justification des soldes fournisseurs
- Point sur la déclaration TVA de Juin

**2. Décisions**
- Le client doit fournir les relevés manquants avant le 30/05.
- Validation du solde de caisse par Mr Konan.

**3. Prochaines étapes**
- Finalisation de la liasse fiscale : 15 Juin.
- Prochaine réunion : 20 Juin à 10h.
`);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Mobile Header */}
            <div className="lg:hidden">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CalendarIcon className="w-6 h-6 text-indigo-400" />
                    Agenda Partagé
                </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)]">
                {/* Sidebar: Calendar & List */}
                <div className="w-full lg:w-96 flex flex-col gap-4 sm:gap-6">
                    {/* Simple Calendar Widget */}
                    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white">Mai 2024</h3>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-slate-700 rounded text-slate-400">&lt;</button>
                                <button className="p-1 hover:bg-slate-700 rounded text-slate-400">&gt;</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs sm:text-sm">
                            {["L", "M", "M", "J", "V", "S", "D"].map(d => <span key={d} className="text-slate-500 text-[10px] sm:text-xs">{d}</span>)}
                            {/* Mock Calendar Grid */}
                            {Array.from({ length: 31 }, (_, i) => (
                                <div key={i} className={cn(
                                    "p-1 sm:p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors relative text-xs sm:text-sm",
                                    i + 1 === 25 ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30" : "text-slate-300"
                                )}>
                                    {i + 1}
                                    {(i + 1 === 25 || i + 1 === 24) && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meetings List */}
                    <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 overflow-hidden flex flex-col min-h-[300px] lg:min-h-0">
                        <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                Réunions du jour
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {MOCK_MEETINGS.map(meeting => (
                                <div
                                    key={meeting.id}
                                    onClick={() => setSelectedMeeting(meeting)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all",
                                        selectedMeeting?.id === meeting.id
                                            ? "bg-indigo-500/10 border-indigo-500/50"
                                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-white text-sm">{meeting.time}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                                            meeting.type === "virtuelle" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        )}>{meeting.type}</span>
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-200 truncate">{meeting.title}</h4>
                                    <p className="text-xs text-slate-500 truncate">{meeting.client}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: Meeting Room / Report */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-h-[600px] lg:min-h-0">
                    {selectedMeeting ? (
                        <>
                            {/* Header Card */}
                            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                                {/* Background Glow */}
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                                        <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedMeeting.title}</h2>
                                        <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
                                            {selectedMeeting.duration}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        {selectedMeeting.client}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:gap-3 relative z-10">
                                    {selectedMeeting.type === "virtuelle" && (
                                        <button className="px-4 sm:px-5 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 text-sm sm:text-base">
                                            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="hidden sm:inline">Rejoindre la visio</span>
                                            <span className="sm:hidden">Visio</span>
                                        </button>
                                    )}
                                    <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Report Editor */}
                            <div className="flex-1 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
                                <div className="p-3 sm:p-4 border-b border-slate-700/50 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                                    <div className="flex gap-2 sm:gap-4 overflow-x-auto w-full sm:w-auto">
                                        <button
                                            onClick={() => setReportMode(false)}
                                            className={cn(
                                                "text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors",
                                                !reportMode ? "text-indigo-400 border-indigo-500" : "text-slate-400 border-transparent hover:text-white"
                                            )}
                                        >
                                            Notes & Ordre du jour
                                        </button>
                                        <button
                                            onClick={() => setReportMode(true)}
                                            className={cn(
                                                "text-xs sm:text-sm font-medium pb-3 sm:pb-4 -mb-3 sm:-mb-4 border-b-2 transition-colors whitespace-nowrap",
                                                reportMode ? "text-indigo-400 border-indigo-500" : "text-slate-400 border-transparent hover:text-white"
                                            )}
                                        >
                                            Compte Rendu (Officiel)
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={generateReport}
                                            className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center gap-1 sm:gap-2 hover:shadow-lg transition-all whitespace-nowrap"
                                        >
                                            <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden sm:inline">Générer Rapport IA</span>
                                            <span className="sm:hidden">IA</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 p-4 sm:p-6 bg-slate-900/30 overflow-hidden">
                                    <div className="h-full flex flex-col gap-4">
                                        <div className="flex-1 relative group">
                                            {isGenerating && (
                                                <div className="absolute inset-0 z-10 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-emerald-400 text-sm font-medium animate-pulse">L'IA rédige le compte rendu...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <textarea
                                                className="w-full h-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-6 text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-mono text-xs sm:text-sm"
                                                placeholder={reportMode ? "Le rapport généré apparaîtra ici..." : "- Point 1...\n- Point 2..."}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                            <div className="hidden sm:flex absolute bottom-4 right-4 text-xs text-slate-500 gap-2">
                                                <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Dictée vocale</span>
                                                <span>•</span>
                                                <span>Sauvegardé</span>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                                            <button className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs sm:text-sm font-medium border border-slate-700 flex items-center justify-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Exporter PDF
                                            </button>
                                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                                <Share className="w-4 h-4" />
                                                Envoyer au Client
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>Sélectionnez une réunion pour voir les détails</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
