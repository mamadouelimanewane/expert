"use client";

import { useState } from "react";
import {
    BookOpen,
    Plus,
    Search,
    Wand2,
    ChevronRight,
    ArrowRight,
    CheckCircle2,
    FileEdit,
    Download,
    Share2,
    Users,
    Settings,
    GitGraph
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Procedure {
    id: string;
    title: string;
    cycle: "Achats" | "Ventes" | "Trésorerie" | "RH" | "Stocks";
    status: "Brouillon" | "Validé" | "En révision";
    lastUpdate: string;
}

const MOCK_PROCEDURES: Procedure[] = [
    { id: "1", title: "Circuit de validation des factures fournisseurs", cycle: "Achats", status: "Validé", lastUpdate: "15/01/2024" },
    { id: "2", title: "Procédure d'encaissement des chèques", cycle: "Trésorerie", status: "En révision", lastUpdate: "22/01/2024" },
    { id: "3", title: "Onboarding nouveaux collaborateurs", cycle: "RH", status: "Brouillon", lastUpdate: "26/01/2024" },
    { id: "4", title: "Inventaire tournant des stocks", cycle: "Stocks", status: "Validé", lastUpdate: "10/12/2023" },
];

export default function ProceduresPage() {
    const [selectedProc, setSelectedProc] = useState<Procedure | null>(MOCK_PROCEDURES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [procContent, setProcContent] = useState("");

    const generateProcedure = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setProcContent(`MANUEL DE PROCÉDURES : ${selectedProc?.title.toUpperCase()}

1. OBJET ET CHAMP D'APPLICATION
Cette procédure définit les étapes de validation des factures fournisseurs au sein de l'entité pour garantir l'exhaustivité et la réalité des charges.

2. ACTEURS CONCERNÉS
- Service Achat (Initiateur)
- Service Comptable (Vérification)
- Direction Financière (Approbation)

3. DESCRIPTION DU PROCESSUS
Étape 1 : Réception de la facture (Support physique ou numérique).
Étape 2 : Rapprochement avec le bon de commande et le bon de livraison.
Étape 3 : Apposition du "Bon à payer" par le responsable de service.
Étape 4 : Comptabilisation et programmation du règlement.

4. CONTRÔLES CLÉS
- Vérification de la conformité fiscale (NINEA, TVA).
- Séparation des tâches entre l'acheteur et le payeur.`);
            setIsGenerating(false);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-emerald-400" />
                        Conception de Manuels de Procédures
                    </h2>
                    <p className="text-slate-400 mt-1">Outil d'élaboration assistée par IA pour structurer le contrôle interne de vos clients.</p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all">
                        <GitGraph className="w-4 h-4" /> Visualiser Workflow
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                        <Plus className="w-4 h-4" /> Nouvelle Procédure
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar: Procedure List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input type="text" placeholder="Rechercher une procédure..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                    </div>

                    <div className="space-y-2">
                        {MOCK_PROCEDURES.map(proc => (
                            <div
                                key={proc.id}
                                onClick={() => setSelectedProc(proc)}
                                className={cn(
                                    "p-3 rounded-xl border cursor-pointer transition-all group",
                                    selectedProc?.id === proc.id ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{proc.cycle}</span>
                                    <span className={cn(
                                        "text-[8px] px-1.5 py-0.5 rounded-full font-bold border",
                                        proc.status === "Validé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                                    )}>{proc.status}</span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{proc.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedProc ? (
                        <>
                            <div className="glass-card rounded-2xl border border-slate-700/50 flex flex-col min-h-[500px] overflow-hidden">
                                <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileEdit className="w-5 h-5 text-emerald-400" />
                                        <h3 className="font-bold text-white">{selectedProc.title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={generateProcedure}
                                            disabled={isGenerating}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            <Wand2 className="w-3 h-3" /> {isGenerating ? "Rédaction..." : "Aide IA"}
                                        </button>
                                        <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 p-8 bg-slate-950/20 relative">
                                    {isGenerating && (
                                        <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-emerald-400 font-bold animate-pulse">L'IA structure la procédure selon les normes de contrôle interne...</span>
                                            </div>
                                        </div>
                                    )}
                                    <textarea
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 font-serif leading-relaxed text-sm resize-none"
                                        placeholder="Commencez à rédiger ou utilisez l'aide IA..."
                                        value={procContent}
                                        onChange={(e) => setProcContent(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* RACI Matrix Pre-view */}
                            <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Matrice des Responsabilités (RACI)
                                </h4>
                                <div className="grid grid-cols-4 gap-4">
                                    {["Acheteur", "Comptable", "DAF", "Directeur"].map((role) => (
                                        <div key={role} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                                            <p className="text-xs font-bold text-white mb-2">{role}</p>
                                            <div className="flex justify-center gap-1">
                                                {["R", "A", "C", "I"].map(l => (
                                                    <span key={l} className="w-5 h-5 rounded bg-slate-800 text-[10px] flex items-center justify-center text-slate-500 hover:bg-emerald-500 hover:text-white cursor-pointer transition-colors">
                                                        {l}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl p-12">
                            <BookOpen className="w-16 h-16 mb-4 opacity-10" />
                            <p>Sélectionnez une procédure pour l'éditer.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
