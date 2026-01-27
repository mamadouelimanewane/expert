"use client";

import { useState } from "react";
import {
    PenTool,
    Mail,
    FileText,
    ScrollText,
    Plus,
    Search,
    Wand2,
    Download,
    Send,
    Inbox,
    History,
    CheckCircle2,
    Clock,
    ChevronRight,
    ShieldCheck,
    Languages,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "redaction" | "courrier";

interface Template {
    id: string;
    title: string;
    category: "AG" | "Contrat" | "Rapport" | "Courrier";
    desc: string;
}

const TEMPLATES: Template[] = [
    { id: "1", title: "PV d'Assemblée Générale Ordinaire (AGO)", category: "AG", desc: "Approbation des comptes annuels OHADA." },
    { id: "2", title: "Rapport de Gestion de la Gérance", category: "Rapport", desc: "Commentaire des SIG et de la situation financière." },
    { id: "3", title: "Contrat de Travail (CDI Dahir/Titre II)", category: "Contrat", desc: "Modèle conforme au code du travail local." },
    { id: "4", title: "Courrier de Mise en Demeure (Relance)", category: "Courrier", desc: "Relance formelle avant contentieux." },
    { id: "5", title: "Rapport Spécial du CAC", category: "Rapport", desc: "Sur les conventions réglementées." }
];

interface MailEntry {
    id: string;
    type: "Entrant" | "Sortant";
    subject: string;
    client: string;
    date: string;
    status: "reçu" | "envoyé" | "en_attente";
    tracking?: string;
}

const MOCK_MAIL: MailEntry[] = [
    { id: "M-001", type: "Entrant", subject: "Notification de Redressement", client: "Société Ivoirienne de Banque", date: "26/01/2024", status: "reçu" },
    { id: "M-002", type: "Sortant", subject: "Facture Honoraires Q1", client: "Traoré Import-Export", date: "25/01/2024", status: "envoyé", tracking: "DH-8829-CI" },
    { id: "M-003", type: "Entrant", subject: "Relevés Bancaires Originaux", client: "Boulangerie du Plateau", date: "24/01/2024", status: "reçu" },
];

export default function WritingCenterPage() {
    const [view, setView] = useState<ViewMode>("redaction");
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [content, setContent] = useState("");

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setContent(`PROCES VERBAL DE L'ASSEMBLEE GENERALE ORDINAIRE

SOCIÉTÉ : [RAISON_SOCIALE]
FORME : SARL
AU CAPITAL DE : [MONTANT] FCFA

L'an deux mille vingt-quatre, le [DATE], à [HEURE], les associés de la société se sont réunis au siège social en Assemblée Générale Ordinaire...

ORDRE DU JOUR :
1. Rapport de gestion de la gérance sur l'exercice clos le 31/12/2023.
2. Examen et approbation des comptes annuels (Bilan, Compte de Résultat, TAFIRE).
3. Affectation du résultat.
4. Quitus à la gérance.

RÉSOLUTIONS :
Première résolution : L'assemblée, après avoir entendu la lecture du rapport de gestion, approuve les comptes annuels tels qu'ils lui ont été présentés...`);
            setIsGenerating(false);
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <PenTool className="w-8 h-8 text-cyan-400" />
                        Rédaction & Gestion de Courrier
                    </h2>
                    <p className="text-slate-400 mt-1">Édition intelligente d'actes juridiques, PV, rapports et suivi des correspondances.</p>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setView("redaction")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2",
                            view === "redaction" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <ScrollText className="w-4 h-4" /> Rédaction IA
                    </button>
                    <button
                        onClick={() => setView("courrier")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2",
                            view === "courrier" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Mail className="w-4 h-4" /> Courrier
                    </button>
                </div>
            </div>

            {view === "redaction" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Template Menu */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input type="text" placeholder="Modèle d'acte..." className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
                        </div>

                        <div className="space-y-2">
                            {TEMPLATES.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => setSelectedTemplate(t)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all",
                                        selectedTemplate?.id === t.id ? "bg-cyan-500/10 border-cyan-500/50" : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-500/20">{t.category}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white leading-tight">{t.title}</h4>
                                    <p className="text-[10px] text-slate-500 mt-1">{t.desc}</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold">Modèle Perso</span>
                        </button>
                    </div>

                    {/* Editor Area */}
                    <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden min-h-[600px]">
                        {selectedTemplate ? (
                            <>
                                <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white">{selectedTemplate.title}</h3>
                                        <span className="text-xs text-slate-500 italic">v2024.1 (OHADA)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleGenerate} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2">
                                            <Wand2 className="w-4 h-4" /> Générer avec IA
                                        </button>
                                        <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 relative p-6 bg-white/5">
                                    {isGenerating && (
                                        <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                                                <span className="text-cyan-400 font-bold animate-pulse">L'IA rédige votre acte suivant les normes OHADA...</span>
                                            </div>
                                        </div>
                                    )}
                                    <textarea
                                        className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 font-serif leading-relaxed text-sm resize-none"
                                        placeholder="Le texte s'affichera ici..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>

                                <div className="p-3 bg-slate-900/50 border-t border-slate-700/50 flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                    <span>Mots: {content.split(' ').filter(x => x.length > 0).length}</span>
                                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Copie certifiée conforme</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <PenTool className="w-16 h-16 mb-4 opacity-10" />
                                <p>Sélectionnez un modèle pour commencer la rédaction.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === "courrier" && (
                <div className="space-y-6">
                    {/* Mail Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Non Traité</p>
                                <h4 className="text-2xl font-bold text-white">4</h4>
                            </div>
                            <Inbox className="w-8 h-8 text-rose-500 opacity-20" />
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Reçu Semaine</p>
                                <h4 className="text-2xl font-bold text-white">12</h4>
                            </div>
                            <History className="w-8 h-8 text-indigo-500 opacity-20" />
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Envoyé Courrier</p>
                                <h4 className="text-2xl font-bold text-white">8</h4>
                            </div>
                            <Send className="w-8 h-8 text-emerald-500 opacity-20" />
                        </div>
                        <button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl p-4 flex items-center justify-center gap-3 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all">
                            <Plus className="w-5 h-5" /> Enregistrer Courrier
                        </button>
                    </div>

                    {/* Mail List */}
                    <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Sens / Client</th>
                                    <th className="px-6 py-4">Objet</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Statut / Tracking</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {MOCK_MAIL.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-800/20 group transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-2 h-8 rounded-full",
                                                    m.type === "Entrant" ? "bg-amber-500" : "bg-emerald-500"
                                                )} />
                                                <div>
                                                    <p className="font-bold text-white">{m.client}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{m.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-200 font-medium">{m.subject}</td>
                                        <td className="px-6 py-4 text-slate-400">{m.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit",
                                                    m.status === "envoyé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                                                )}>
                                                    {m.status.replace("_", " ")}
                                                </span>
                                                {m.tracking && <span className="text-[10px] font-mono text-indigo-400">{m.tracking}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-700 text-slate-500 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
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
