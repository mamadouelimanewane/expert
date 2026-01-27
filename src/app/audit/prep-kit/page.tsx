"use client";

import { useState } from "react";
import {
    ClipboardList,
    FileText,
    Users,
    Wallet,
    Package,
    ShieldCheck,
    ArrowRight,
    Plus,
    Download,
    Link as LinkIcon,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Zap,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrepMissionDoc {
    id: string;
    title: string;
    category: "RH" | "Trésorerie" | "Immos" | "Stock" | "Ventes";
    type: "Questionnaire" | "Checklist" | "Lettre" | "Modèle";
    status: "available" | "ready";
}

const PREP_DOCS: PrepMissionDoc[] = [
    { id: "1", title: "Questionnaire de Contrôle Interne (QCI) - Cycle Paie", category: "RH", type: "Questionnaire", status: "ready" },
    { id: "2", title: "Liste des pièces à fournir - Audit Social", category: "RH", type: "Checklist", status: "available" },
    { id: "3", title: "Lettre de circularisation bancaire", category: "Trésorerie", type: "Lettre", status: "ready" },
    { id: "4", title: "Bénéficiaires Effectifs & KYC - Audit Cash", category: "Trésorerie", type: "Modèle", status: "available" },
    { id: "5", title: "Checklist Inventaire Physique (Procédure)", category: "Stock", type: "Checklist", status: "ready" },
    { id: "6", title: "PV de Constat de Stock Déprécié", category: "Stock", type: "Modèle", status: "available" },
    { id: "7", title: "Questionnaire Revue Cycle Ventes/Clients", category: "Ventes", type: "Questionnaire", status: "available" },
];

export default function AuditPrepKitPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
    const [activeDoc, setActiveDoc] = useState<PrepMissionDoc | null>(null);

    const categories = ["Tous", "RH", "Trésorerie", "Immos", "Stock", "Ventes"];

    const filteredDocs = selectedCategory === "Tous"
        ? PREP_DOCS
        : PREP_DOCS.filter(d => d.category === selectedCategory);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-indigo-400" />
                        Kit de Préparation Missions 360°
                    </h2>
                    <p className="text-slate-400 mt-1">Bibliothèque intelligente de documents préparatoires par cycle d'audit.</p>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all">
                        <Plus className="w-4 h-4" /> Créer un modèle
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all">
                        <Zap className="w-4 h-4 fill-current" /> Auto-générer Kit
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "px-5 py-2.5 rounded-2xl text-xs font-bold uppercase transition-all whitespace-nowrap border",
                            selectedCategory === cat
                                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                                : "bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700"
                        )}
                    >
                        {cat === "RH" && <Users className="w-3 h-3 inline mr-2" />}
                        {cat === "Trésorerie" && <Wallet className="w-3 h-3 inline mr-2" />}
                        {cat === "Stock" && <Package className="w-3 h-3 inline mr-2" />}
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Documents List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDocs.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => setActiveDoc(doc)}
                                className={cn(
                                    "glass-card p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4",
                                    activeDoc?.id === doc.id ? "bg-indigo-600/10 border-indigo-500" : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                                    doc.category === "RH" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                        doc.category === "Trésorerie" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                )}>
                                    {doc.type === "Questionnaire" ? <HelpCircle className="w-6 h-6" /> :
                                        doc.type === "Checklist" ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{doc.category} • {doc.type}</span>
                                        {doc.status === "ready" && <Zap className="w-3 h-3 text-indigo-400 fill-current animate-pulse" />}
                                    </div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight mb-2">
                                        {doc.title}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1">
                                            <LinkIcon className="w-3 h-3" /> Associer Mission
                                        </button>
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1">
                                            <Download className="w-3 h-3" /> Modèle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Insight Bar */}
                    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-6 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-400 text-sm">IA Booster : Génération de kit personnalisé</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                L'IA peut analyser le procès-verbal de l'an dernier et les statuts du client pour générer automatiquement tous les questionnaires préparatoires spécifiques à son activité (ex: Audit de stock pour un minotier).
                            </p>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap">
                            Scanner & Proposer
                        </button>
                    </div>
                </div>

                {/* Action Panel: Editor or Focus */}
                <div className="space-y-6">
                    {activeDoc ? (
                        <div className="glass-card rounded-2xl p-6 border border-slate-700/50 space-y-6">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-white text-lg leading-tight">{activeDoc.title}</h3>
                                <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-full font-bold">APERÇU</span>
                            </div>

                            <div className="space-y-4 pt-4">
                                <p className="text-xs text-slate-500 italic">Extrait du document :</p>
                                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                                    {activeDoc.category === "RH" ? (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <div className="w-4 h-4 rounded border border-slate-600 mt-1" />
                                                <p className="text-xs text-slate-300">Existe-t-il un registre unique du personnel à jour conformément au code du travail ?</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-4 h-4 rounded border border-slate-600 mt-1" />
                                                <p className="text-xs text-slate-300">Les déclarations CNPS/ITS sont-elles rapprochées mensuellement avec le Grand Livre ?</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <div className="w-4 h-4 rounded border border-slate-600 mt-1" />
                                                <p className="text-xs text-slate-300">L'entreprise dispose-t-elle de procédures écrites de gestion de caisse ?</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-4 h-4 rounded border border-slate-600 mt-1" />
                                                <p className="text-xs text-slate-300">Les signatures autorisées en banque sont-elles revues annuellement par la DG ?</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-4">
                                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                                    <FileText className="w-4 h-4" /> Utiliser ce modèle
                                </button>
                                <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-xl font-bold text-sm transition-all">
                                    Éditer le questionnaire
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl p-12 border border-slate-700/50 flex flex-col items-center justify-center text-center">
                            <AlertCircle className="w-12 h-12 text-slate-800 mb-4" />
                            <h3 className="font-bold text-slate-400">Sélectionnez un document</h3>
                            <p className="text-xs text-slate-600 mt-2">Cliquez sur un modèle à gauche pour voir son contenu et le préparer pour votre mission.</p>
                        </div>
                    )}

                    {/* Quick Link: Checklist Dossier Permanent */}
                    <div className="glass-card rounded-2xl p-6 border border-slate-700/50 bg-gradient-to-br from-slate-900 to-amber-900/10 group cursor-pointer hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Dossier Permanent (DP)</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Vérifier conformité 2024</p>
                            </div>
                            <ArrowRight className="ml-auto w-4 h-4 text-slate-600 group-hover:text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
