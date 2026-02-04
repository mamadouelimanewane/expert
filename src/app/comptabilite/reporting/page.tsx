"use client";

import { useState } from "react";
import {
    FileText,
    FilePieChart,
    Download,
    Mail,
    Eye,
    Zap,
    Sparkles,
    Calendar,
    ChevronRight,
    CheckCircle2,
    LayoutTemplate,
    Palette,
    Clock,
    Share2,
    Settings,
    Loader2,
    Printer,
    FileSignature
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    style: "Elite Glass" | "Minimalist" | "Corporate Luxury";
    image: string;
}

const TEMPLATES: ReportTemplate[] = [
    { id: "t1", name: "Elite Glass Platinum", description: "Design transparent avec effets de profondeur et néons.", style: "Elite Glass", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400" },
    { id: "t2", name: "Midnight Modern", description: "Sombre, contrasté et ultra-lisible.", style: "Corporate Luxury", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400" },
    { id: "t3", name: "Solar White", description: "Clair, épuré, parfait pour l'impression.", style: "Minimalist", image: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=400" },
];

export default function ReportingAutomationPage() {
    const [selectedPeriod, setSelectedPeriod] = useState("Mai 2024");
    const [selectedTemplate, setSelectedTemplate] = useState("t1");
    const [isGenerating, setIsGenerating] = useState(false);
    const [step, setStep] = useState<"setup" | "preview" | "done">("setup");

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setStep("preview");
        }, 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header SEPTEO Style */}
            <div className="bg-slate-900/40 p-10 rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <FilePieChart className="w-56 h-56 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                            Automatic Reporting
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Enhanced
                        </span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
                        Centre de <span className="text-indigo-400">Reporting Automatisé</span>
                    </h2>
                    <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                        Générez des rapports mensuels haut de gamme pour vos clients. Synthèse IA, graphiques dynamiques et exports PDF stylisés.
                    </p>
                </div>
            </div>

            {step === "setup" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Settings Panel */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <Palette className="w-6 h-6 text-indigo-400" />
                                1. Sélectionnez le Style du Rapport
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {TEMPLATES.map((tpl) => (
                                    <div
                                        key={tpl.id}
                                        onClick={() => setSelectedTemplate(tpl.id)}
                                        className={cn(
                                            "relative rounded-3xl overflow-hidden cursor-pointer group transition-all",
                                            selectedTemplate === tpl.id ? "ring-2 ring-indigo-500 scale-[1.02]" : "ring-1 ring-white/5 opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <div className="aspect-[4/5] bg-slate-800">
                                            <img src={tpl.image} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-5 flex flex-col justify-end">
                                                <h4 className="font-bold text-white text-sm">{tpl.name}</h4>
                                                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{tpl.description}</p>
                                            </div>
                                        </div>
                                        {selectedTemplate === tpl.id && (
                                            <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-600/50">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-[40px] border border-white/5 bg-slate-900/40">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-amber-400" />
                                2. Contenu & Synthèse IA
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inclusion IA</span>
                                            <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                                                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white text-sm">Génération de la Synthèse Stratégique</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">L'IA analysera les flux et les ratios pour rédiger un résumé exécutif personnalisé.</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dashboards</span>
                                            <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                                                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white text-sm">Visualisations Graphiques 3D</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Inclusion des graphiques de performance, trésorerie et rentabilité par axe.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/60 shadow-2xl">
                            <h3 className="text-lg font-black text-white mb-6">Période du Rapport</h3>
                            <div className="space-y-3">
                                {["Mars 2024", "Avril 2024", "Mai 2024", "T1 2024"].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setSelectedPeriod(p)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center",
                                            selectedPeriod === p ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                        )}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-widest">{p}</span>
                                        <Calendar className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>

                            <div className="mt-10 space-y-4">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/30 group disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />}
                                    Lancer la Génération IA
                                </button>
                                <p className="text-[10px] text-slate-600 text-center font-bold">Temps estimé : 15 secondes</p>
                            </div>
                        </div>

                        <div className="p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Derniers Rapports</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Avril 2024 - Elite</span>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-slate-700 hover:text-indigo-400" />
                                </div>
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Mars 2024 - Elite</span>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-slate-700 hover:text-indigo-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === "preview" && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep("setup")} className="p-2 hover:bg-white/5 rounded-xl text-slate-500">
                                <ChevronRight className="w-6 h-6 rotate-180" />
                            </button>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Prévisualisation du Rapport</h3>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                                <Printer className="w-4 h-4" /> Imprimer
                            </button>
                            <button className="px-6 py-3 bg-white text-indigo-950 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl">
                                <Download className="w-4 h-4" /> Télécharger PDF
                            </button>
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-indigo-600/30">
                                <Mail className="w-4 h-4" /> Envoyer au Client
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* THE REPORT PREVIEW (STYLED) */}
                        <div className="lg:col-span-8 bg-white rounded-[40px] shadow-2xl p-20 text-slate-900 space-y-16 min-h-[1000px] overflow-hidden relative">
                            {/* Watermark Effect */}
                            <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
                                <Sparkles className="w-[800px] h-[800px] text-slate-900" />
                            </div>

                            {/* Report Header */}
                            <div className="flex justify-between items-end border-b-2 border-slate-950 pb-12 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 mb-2">Synthèse de Gestion</p>
                                    <h1 className="text-5xl font-black text-slate-950 tracking-tighter">SOCIÉTÉ IVOIRIENNE DE BANQUE</h1>
                                    <p className="text-slate-500 font-bold mt-2">Situation Mensuelle — {selectedPeriod}</p>
                                </div>
                                <div className="text-right">
                                    <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 ml-auto">
                                        <span className="text-white font-black text-2xl">C</span>
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Généré par Cabinet 360 v2</p>
                                </div>
                            </div>

                            {/* Executive Summary AI */}
                            <div className="space-y-8 relative z-10">
                                <h2 className="text-xl font-black uppercase tracking-widest border-l-4 border-indigo-600 pl-6">I. Résumé Exécutif (IA NEXUS)</h2>
                                <p className="text-lg text-slate-700 leading-relaxed font-serif italic">
                                    "Le mois de Mai 2024 marque une consolidation significative de la trésorerie. L'augmentation de 12% du solde disponible s'explique par un recouvrement plus efficace des créances clients historiques. Néanmoins, une vigilance est de mise sur le poste 'Charges de Structure' qui dérive de 4% par rapport au budget prévisionnel."
                                </p>
                            </div>

                            {/* Key Figures Table Style */}
                            <div className="grid grid-cols-3 gap-12 relative z-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Chiffre d'Affaires</p>
                                    <p className="text-3xl font-black text-slate-950">142.5M <span className="text-xs text-slate-400">FCFA</span></p>
                                    <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[75%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Excédent Brut (EBE)</p>
                                    <p className="text-3xl font-black text-slate-950">42.8M <span className="text-xs text-slate-400">FCFA</span></p>
                                    <div className="w-full h-1 bg-indigo-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[60%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Trésorerie Nette</p>
                                    <p className="text-3xl font-black text-slate-950">24.5M <span className="text-xs text-slate-400">FCFA</span></p>
                                    <div className="w-full h-1 bg-amber-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500 w-[45%]" />
                                    </div>
                                </div>
                            </div>

                            {/* Graphical Mockup */}
                            <div className="h-80 bg-slate-50 rounded-[32px] border-2 border-slate-100 flex items-center justify-center relative z-10">
                                <div className="text-center space-y-4">
                                    <FilePieChart className="w-16 h-16 text-indigo-200 mx-auto" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Analyse Dynamique des Flux</p>
                                </div>
                            </div>
                        </div>

                        {/* Report Options Sidebar */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl">
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                    <Share2 className="w-6 h-6 text-indigo-400" />
                                    Actions de Diffusion
                                </h3>
                                <div className="space-y-4">
                                    <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all">
                                        <FileSignature className="w-4 h-4" /> Signature Expert
                                    </button>
                                    <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all border border-white/5">
                                        <Settings className="w-4 h-4" /> Modifier le Contenu
                                    </button>
                                </div>

                                <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Programmation</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Voulez-vous envoyer ce rapport chaque mois automatiquement ?
                                    </p>
                                    <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:underline">Activer l'envoi récursif</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
