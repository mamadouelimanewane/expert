"use client";

import { useState } from "react";
import {
    ShieldAlert,
    FileSearch,
    AlertTriangle,
    Calendar,
    Users,
    FileText,
    CheckCircle2,
    Clock,
    ArrowRight,
    Building,
    Gavel,
    MessageSquare,
    Upload,
    Download,
    Timer,
    Zap,
    History,
    FileSignature,
    Hammer,
    Calculator as CalcIcon,
    PlusCircle,
    Trash2,
    Printer,
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVE_CONTROLS = [
    {
        id: "CTR-2026-001",
        client: "SARL Koné & Fils",
        type: "Contrôle Fiscal (DGID)",
        status: "En cours",
        startDate: "15/01/2026",
        deadline: "15/03/2026",
        daysLeft: 40,
        riskLevel: "High",
        agent: "Inspecteur M. Traoré",
        phase: "Réponse 1ère Mise en Demeure"
    },
    {
        id: "CTR-2025-042",
        client: "SA Import Export CI",
        type: "Contrôle CNPS",
        status: "Clôturé",
        startDate: "10/11/2025",
        deadline: "10/01/2026",
        daysLeft: 0,
        riskLevel: "Medium",
        agent: "Agent CNPS",
        phase: "Terminé - Rappel 2.5M"
    },
    {
        id: "CTR-2026-003",
        client: "SCI Les Palmiers",
        type: "Demande de Renseignement",
        status: "Nouveau",
        startDate: "01/02/2026",
        deadline: "01/03/2026",
        daysLeft: 26,
        riskLevel: "Low",
        agent: "Service Foncier",
        phase: "À traiter"
    }
];

const CONTROL_PHASES = [
    { id: 1, name: "Réception Avis", completed: true },
    { id: 2, name: "Analyse Préliminaire", completed: true },
    { id: 3, name: "Collecte Pièces", completed: true },
    { id: 4, name: "Rédaction Réponse", completed: false, current: true },
    { id: 5, name: "Envoi & Suivi", completed: false },
    { id: 6, name: "Négociation", completed: false },
    { id: 7, name: "Clôture", completed: false }
];

export default function TaxAuditAssistancePage() {
    const [selectedControl, setSelectedControl] = useState(ACTIVE_CONTROLS[0]);
    const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "builder" | "docs" | "letter">("overview");

    const generateWelcomeLetter = () => {
        const date = new Date().toLocaleDateString('fr-FR');
        return `À l'attention de ${selectedControl.agent}
DGID - Centre des Services Fiscaux

Objet : Accueil relatif au contrôle fiscal de la société ${selectedControl.client}

Monsieur l'Inspecteur,

Faisant suite à votre avis de vérification n°${selectedControl.id}, nous vous confirmons par la présente que la société ${selectedControl.client}, assistée par notre cabinet, se tient à votre entière disposition pour le bon déroulement de vos opérations de contrôle fixées au ${selectedControl.startDate}.

À cet effet, nous avons préparé un espace de travail dédié garantissant la confidentialité et l'accès sécurisé à l'ensemble des documents comptables et pièces justificatives prévus par l'Acte Uniforme OHADA.

Dans l'attente de vous recevoir, nous vous prions d'agréer, Monsieur l'Inspecteur, l'expression de notre considération distinguée.

Fait à Dakar, le ${date}`;
    };

    // Simulator State
    const [simEntries, setSimEntries] = useState([
        { id: 1, base: 10000000, rate: 18, penaltyRate: 25, label: "TVA sur ventes non déclarées" },
        { id: 2, base: 5000000, rate: 30, penaltyRate: 40, label: "Réintégration IS - Charges non justificées" }
    ]);

    const calculatePenalty = (base: number, rate: number, pRate: number) => {
        const principal = (base * rate) / 100;
        const penalty = (principal * pRate) / 100;
        return { principal, penalty, total: principal + penalty };
    };

    const totalSim = simEntries.reduce((acc, entry) => {
        const res = calculatePenalty(entry.base, entry.rate, entry.penaltyRate);
        return {
            principal: acc.principal + res.principal,
            penalty: acc.penalty + res.penalty,
            total: acc.total + res.total
        };
    }, { principal: 0, penalty: 0, total: 0 });

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-rose-500/5 via-transparent to-transparent rounded-3xl sm:rounded-[32px] px-6 sm:px-10 border-l-4 border-l-rose-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-rose-500/20">
                        <ShieldAlert className="w-3 h-3" /> Assistance Contrôle Fiscal
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Cellule de Crise Fiscale
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-lg">
                        Accompagnez vos clients lors des contrôles DGID, CNPS et douanes.
                        Suivez les délais, préparez les réponses et négociez les rappels.
                    </p>
                </div>

                <div className="flex gap-3 z-10 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Nouveau Contrôle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Active Controls List */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-rose-400" /> Dossiers Actifs
                    </h3>

                    {ACTIVE_CONTROLS.map((control) => (
                        <div
                            key={control.id}
                            onClick={() => setSelectedControl(control)}
                            className={cn(
                                "p-5 rounded-2xl border cursor-pointer transition-all group",
                                selectedControl.id === control.id ? "bg-slate-800/80 border-rose-500/40 shadow-lg" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors">{control.client}</h4>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1">{control.id}</p>
                                </div>
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                                    control.status === "En cours" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                        control.status === "Nouveau" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                            "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                )}>
                                    {control.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <Building className="w-3 h-3" /> {control.type}
                            </div>

                            {control.daysLeft > 0 && (
                                <div className="flex items-center justify-between mt-3 p-2 bg-slate-950/50 rounded-lg">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Échéance</span>
                                    <span className={cn(
                                        "text-sm font-black",
                                        control.daysLeft < 15 ? "text-rose-400" : control.daysLeft < 30 ? "text-amber-400" : "text-slate-300"
                                    )}>
                                        J-{control.daysLeft}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right: Control Detail & Workflow */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Sub Navigation */}
                    <div className="flex gap-4 border-b border-white/5 mx-4 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile">
                        {[
                            { id: "overview", label: "Vue d'Ensemble", icon: Building },
                            { id: "simulator", label: "Simulateur Rappel", icon: CalcIcon },
                            { id: "builder", label: "Rédaction Mémoire", icon: FileSignature },
                            { id: "letter", label: "Courrier Accueil", icon: Mail },
                            { id: "docs", label: "Pièces Jointes", icon: Upload }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "pb-4 px-2 flex items-center gap-2 font-bold text-sm transition-all relative whitespace-nowrap",
                                    activeTab === tab.id ? "text-rose-400" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                            </button>
                        ))}
                    </div>

                    {activeTab === "overview" && (
                        <>
                            {/* Control Header */}
                            <div className="glass-card p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-white/5 bg-slate-900/40">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl sm:text-2xl font-black text-white">{selectedControl.client}</h2>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                                                selectedControl.riskLevel === "High" ? "bg-rose-500 text-white" :
                                                    selectedControl.riskLevel === "Medium" ? "bg-amber-500 text-black" : "bg-slate-700 text-white"
                                            )}>
                                                Risque {selectedControl.riskLevel}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-xs sm:text-sm">{selectedControl.type} • {selectedControl.agent}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] text-slate-500 uppercase mb-1">Phase Actuelle</p>
                                        <p className="text-base sm:text-lg font-bold text-rose-400">{selectedControl.phase}</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="relative mt-8 pb-4 overflow-x-auto no-scrollbar sm:overflow-visible">
                                    <div className="absolute top-4 left-0 right-0 h-1 bg-slate-800 rounded-full" />
                                    <div className="flex justify-between relative min-w-[500px] sm:min-w-0">
                                        {CONTROL_PHASES.map((phase) => (
                                            <div key={phase.id} className="flex flex-col items-center z-10">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                                    phase.completed ? "bg-emerald-500 border-emerald-500" :
                                                        phase.current ? "bg-rose-500 border-rose-500 animate-pulse" : "bg-slate-900 border-slate-700"
                                                )}>
                                                    {phase.completed ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                                                        phase.current ? <Timer className="w-4 h-4 text-white" /> :
                                                            <div className="w-2 h-2 rounded-full bg-slate-600" />}
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-bold mt-2 text-center max-w-[60px]",
                                                    phase.completed ? "text-emerald-400" : phase.current ? "text-rose-400" : "text-slate-600"
                                                )}>
                                                    {phase.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-950/60 border border-white/5 rounded-[24px] hover:border-rose-500/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Pièces Justificatives</h4>
                                            <p className="text-xs text-slate-500">12 documents uploadés</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {["Factures", "Contrats", "Relevés", "PV AG"].map((doc, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] rounded-lg font-bold">{doc}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-950/60 border border-white/5 rounded-[24px] hover:border-rose-500/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Courriers & Réponses</h4>
                                            <p className="text-xs text-slate-500">Générer une réponse</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab("builder")} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" /> Rédiger Mémoire de Réponse
                                    </button>
                                </div>

                                <div className="p-6 bg-slate-950/60 border border-white/5 rounded-[24px] hover:border-rose-500/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                                            <CalcIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Estimation Rappel</h4>
                                            <p className="text-xs text-slate-500">Calcul des enjeux financiers</p>
                                        </div>
                                    </div>
                                    <div onClick={() => setActiveTab("simulator")} className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase mb-1">Montant Estimé</p>
                                            <p className="text-2xl font-black text-rose-400">18.5M FCFA</p>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-bold underline">Ouvrir Simulateur</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-950/60 border border-white/5 rounded-[24px] hover:border-rose-500/20 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Notes & Stratégie</h4>
                                            <p className="text-xs text-slate-500">Journal de bord du dossier</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic leading-relaxed">
                                        "Client a fourni relevés incomplets. Demander extraits bancaires 2023-2024. RDV prévu avec inspecteur le 20/02."
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "simulator" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Principal (Impôts)</p>
                                    <p className="text-2xl font-black text-white">{totalSim.principal.toLocaleString()} FCFA</p>
                                </div>
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Pénalités & Intérêts</p>
                                    <p className="text-2xl font-black text-rose-400">{totalSim.penalty.toLocaleString()} FCFA</p>
                                </div>
                                <div className="p-6 bg-rose-600 rounded-3xl shadow-xl shadow-rose-600/20">
                                    <p className="text-[10px] text-white/70 uppercase font-black mb-1">Estimation Totale</p>
                                    <p className="text-2xl font-black text-white">{totalSim.total.toLocaleString()} FCFA</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white">Détails des Rappels Estimés</h3>
                                    <button className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
                                        <PlusCircle className="w-4 h-4" /> Ajouter un grief
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {simEntries.map((entry) => {
                                        const res = calculatePenalty(entry.base, entry.rate, entry.penaltyRate);
                                        return (
                                            <div key={entry.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-white mb-1">{entry.label}</h4>
                                                    <div className="flex gap-4 text-[10px] text-slate-500 font-medium">
                                                        <span>Base: {entry.base.toLocaleString()}</span>
                                                        <span>Taux: {entry.rate}%</span>
                                                        <span>Pénalité: {entry.penaltyRate}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-500 uppercase">Impôt dû</p>
                                                        <p className="text-sm font-bold text-white">{res.principal.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-rose-500 uppercase font-bold">Pénalité</p>
                                                        <p className="text-sm font-bold text-rose-400">{res.penalty.toLocaleString()}</p>
                                                    </div>
                                                    <button className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900/40 border border-amber-500/20 rounded-[32px] flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-sm">
                                    <h4 className="font-bold text-amber-500">Risque de Taxation d'Office</h4>
                                    <p className="text-slate-400 mt-1 italic">
                                        En cas d'échec de la négociation sur les pénalités de 40%, le risque pourrait s'élever à 100% si un comportement frauduleux est invoqué par l'administration.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "builder" && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white">Mémoire en Réponse à l'Avis de Redressement</h3>
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                                        <Download className="w-4 h-4" /> Exporter Word / PDF
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl">
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-2">Contexte Juridique</p>
                                        <p className="text-sm text-slate-400 leading-relaxed italic">
                                            "En réponse à votre notification de redressement n° {selectedControl.id}, nous avons l'honneur de formulare les observations suivantes en application de l'Acte Uniforme OHADA portant organisation et simplification des procédures collectives."
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold text-white text-sm">Points de contestation argumentés :</h4>
                                        <div className="space-y-2">
                                            {[
                                                { title: "Contestation TVA sur avances clients", arg: "Preuve d'encaissement non constitutive de fait générateur au sens du CGI." },
                                                { title: "Justification des frais de déplacement", arg: "Ordres de missions et justificatifs conformes aux standards OHADA." },
                                                { title: "Demande de remise gracieuse des pénalités", arg: "Bonne foi du contribuable et première infraction constatée." }
                                            ].map((point, i) => (
                                                <div key={i} className="p-6 bg-slate-900 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h5 className="font-bold text-emerald-400 text-sm">{point.title}</h5>
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <p className="text-xs text-slate-500">{point.arg}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 font-bold text-xs hover:text-white hover:border-white/20 transition-all">
                                        + Ajouter un argumentaire juridique
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "letter" && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-white">Lettre d'Accueil de l'Inspecteur</h3>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-700 transition-all">
                                            <Printer className="w-4 h-4" /> Imprimer
                                        </button>
                                        <button className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20">
                                            <Download className="w-4 h-4" /> Télécharger Scellé
                                        </button>
                                    </div>
                                </div>

                                <div className="p-10 bg-white text-slate-900 rounded-2xl shadow-2xl font-serif text-sm leading-relaxed min-h-[500px] border-t-[12px] border-rose-600">
                                    <div className="whitespace-pre-wrap">
                                        {generateWelcomeLetter()}
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-slate-950/60 border border-white/5 rounded-2xl flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <ShieldAlert className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">Conseil de l'Expert</h4>
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                            "Cette lettre formalise la coopération du contribuable. Elle permet de limiter les risques de 'taxation d'office pour opposition' souvent invoqués lors des premières visites si l'accueil est jugé hostile."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
