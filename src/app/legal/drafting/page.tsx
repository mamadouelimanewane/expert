"use client";

import { useState } from "react";
import {
    Sparkles,
    FileText,
    Gavel,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Zap,
    Scale,
    Signature,
    PenTool,
    ChevronRight,
    Search,
    BookOpen,
    Globe2,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACT_TYPES = [
    { id: "ag_annuelle", label: "PV d'Assemblée Générale Annuelle", icon: FileText, desc: "Approbation des comptes, affectation du résultat, quitus aux dirigeants." },
    { id: "changement_gerant", label: "Changement de Gérant / Dirigeant", icon: Scale, desc: "Démission, révocation ou nomination d'un nouveau mandataire social." },
    { id: "augmentation_capital", label: "Augmentation de Capital", icon: Zap, desc: "Émission d'actions nouvelles, apport en numéraire ou en nature." },
    { id: "statuts_maj", label: "Mise à jour des Statuts", icon: BookOpen, desc: "Refonte globale des statuts selon le dernier Acte Uniforme OHADA." },
];

export default function LegalDraftingPage() {
    const [selectedAct, setSelectedAct] = useState<string | null>(null);
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftedContent, setDraftedContent] = useState<string | null>(null);

    const handleDraft = () => {
        setIsDrafting(true);
        setTimeout(() => {
            setIsDrafting(false);
            setDraftedContent(`PROCES-VERBAL DE L'ASSEMBLEE GENERALE ORDINAIRE

SOCIÉTÉ : DAKAR DIGITAL SA
FORME : SOCIÉTÉ ANONYME AVEC CONSEIL D'ADMINISTRATION
CAPITAL : 100.000.000 FCFA
SIÈGE SOCIAL : DAKAR, SÉNÉGAL

L'an deux mille vingt-quatre, le quatre février à dix heures, les actionnaires de la société se sont réunis en Assemblée Générale Ordinaire au siège social...

ORDRE DU JOUR :
1. Rapport de gestion du Conseil d'Administration
2. Rapport du Commissaire aux Comptes sur les états financiers
3. Approbation des états financiers de l'exercice clos le 31 décembre 2023
4. Quitus aux administrateurs...

PREMIÈRE RÉSOLUTION :
L'Assemblée Générale, après avoir entendu la lecture du rapport de gestion et du rapport du commissaire aux comptes, approuve les états financiers...`);
        }, 2500);
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header: Legal Command Center */}
            <div className="bg-slate-900/60 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Gavel className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Rédaction d'Actes Assistée par IA
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-indigo-400">Legal Drafter</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Générez vos documents juridiques OHADA en quelques secondes. L'IA Nexus pré-rédige vos actes selon les protocoles de votre cabinet.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                            <ShieldCheck className="w-5 h-5" /> Bibliothèque de Modèles Cabinet
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 1. Selection & Configuration (Left) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
                            <Search className="w-6 h-6 text-indigo-400" />
                            Type d'Acte
                        </h3>

                        <div className="space-y-4">
                            {ACT_TYPES.map(act => (
                                <button
                                    key={act.id}
                                    onClick={() => setSelectedAct(act.id)}
                                    className={cn(
                                        "w-full p-6 rounded-3xl border text-left transition-all flex items-start gap-4",
                                        selectedAct === act.id
                                            ? "bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-900/20"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn("p-3 rounded-2xl", selectedAct === act.id ? "bg-white/10" : "bg-white/5")}>
                                        <act.icon className={cn("w-5 h-5", selectedAct === act.id ? "text-white" : "text-indigo-400")} />
                                    </div>
                                    <div>
                                        <h4 className={cn("text-sm font-black uppercase tracking-tight", selectedAct === act.id ? "text-white" : "text-slate-200")}>{act.label}</h4>
                                        <p className={cn("text-[10px] mt-1 font-medium leading-relaxed", selectedAct === act.id ? "text-indigo-100" : "text-slate-500")}>{act.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedAct && (
                            <button
                                onClick={handleDraft}
                                disabled={isDrafting}
                                className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-indigo-600/30"
                            >
                                {isDrafting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {isDrafting ? "Rédaction par Nexus..." : "Générer le Projet"}
                            </button>
                        )}
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">Normes de Rédaction</p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SYSCOHADA v2.0</li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acte Uniforme Sociétés (AUSCGIE)</li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-400"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standards Cabinet Kane</li>
                        </ul>
                    </div>
                </div>

                {/* 2. Editor & Preview (Right) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 shadow-2xl min-h-[600px] flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-white/5 bg-slate-950/40 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <PenTool className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Éditeur d'Actes Juridiques</h3>
                            </div>
                            {draftedContent && (
                                <div className="flex gap-3">
                                    <button className="px-6 py-2.5 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase border border-white/10">Exporter Docx</button>
                                    <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-900/20">Signer (Nexus ID)</button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-12 overflow-y-auto">
                            {isDrafting ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-pulse">
                                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                                        <Sparkles className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white uppercase mb-2">Nexus IA en cours de rédaction</h4>
                                    <p className="text-slate-500 text-sm font-medium">Analyse des clauses de l'AUSCGIE et application de votre style de cabinet...</p>
                                </div>
                            ) : draftedContent ? (
                                <div className="bg-white rounded-lg p-12 text-slate-950 font-serif leading-relaxed text-sm shadow-inner whitespace-pre-wrap">
                                    {draftedContent}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <Gavel className="w-20 h-20 text-slate-700 mb-6" />
                                    <h4 className="text-xl font-black text-slate-600 uppercase">En attente de sélection</h4>
                                    <p className="text-slate-700 text-sm font-medium max-w-xs mx-auto">Sélectionnez un type d'acte à gauche pour lancer la génération assistée.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                <Globe2 className="w-5 h-5 text-indigo-400" />
                            </div>
                            <p className="text-xs font-bold text-indigo-200">Ce document sera automatiquement indexé dans le Hub de Classification de votre client.</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-indigo-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
