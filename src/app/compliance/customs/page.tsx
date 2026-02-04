"use client";

import { useState } from "react";
import {
    ShieldAlert,
    Anchor,
    Truck,
    AlertTriangle,
    FileText,
    CheckCircle2,
    Clock,
    ArrowRight,
    Landmark,
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
    Globe,
    Scale,
    Printer,
    Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRIES = [
    { id: "SN", name: "Sénégal", agent: "DGD Sénégal", port: "Port de Dakar", currency: "FCFA" },
    { id: "CI", name: "Côte d'Ivoire", agent: "DGD Côte d'Ivoire", port: "Port d'Abidjan", currency: "FCFA" }
];

const ACTIVE_LITIGATIONS = [
    {
        id: "CONT-2026-SN-001",
        client: "Dakar Port Logistics SA",
        type: "Contestation Valeur en Douane",
        status: "Recours Gracieux",
        startDate: "10/01/2026",
        deadline: "10/02/2026",
        daysLeft: 7,
        riskLevel: "High",
        inspector: "Inspecteur Col. Fall",
        phase: "Attente Décision DGD",
        infraction: "Sous-évaluation déclarée sur SH 8517",
        country: "SN"
    },
    {
        id: "CONT-2026-CI-042",
        client: "Abidjan Import Sarl",
        type: "Fausse Déclaration d'Espèce",
        status: "Négociation",
        startDate: "01/02/2026",
        deadline: "01/03/2026",
        daysLeft: 26,
        riskLevel: "Medium",
        inspector: "Inspecteur Touré",
        phase: "Proposition Transactionnelle",
        infraction: "SH 8708 déclaré en SH 8703 (Différentiel Taux)",
        country: "CI"
    },
    {
        id: "CONT-2025-SN-098",
        client: "Sénégal Solaire Pros",
        type: "Défaut d'Apurement",
        status: "Clôturé",
        startDate: "15/12/2025",
        deadline: "15/01/2026",
        daysLeft: 0,
        riskLevel: "Low",
        inspector: "Service des Enquêtes",
        phase: "Mainlevée Définitive",
        infraction: "Retard de justification de réexportation",
        country: "SN"
    }
];

const LITIGATION_PHASES = [
    { id: 1, name: "Constat Infraction", completed: true },
    { id: 2, name: "Procès-Verbal", completed: true },
    { id: 3, name: "Consultation Expert", completed: true },
    { id: 4, name: "Dépôt Mémoire", completed: false, current: true },
    { id: 5, name: "Comité de Règlement", completed: false },
    { id: 6, name: "Soumission Transaction", completed: false },
    { id: 7, name: "Mainlevée / Quittance", completed: false }
];

export default function CustomsLitigationPage() {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [selectedLitigation, setSelectedLitigation] = useState(ACTIVE_LITIGATIONS[0]);
    const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "builder" | "docs" | "letter">("overview");

    const generateAppealLetter = () => {
        const date = new Date().toLocaleDateString('fr-FR');
        const countryData = COUNTRIES.find(c => c.id === selectedLitigation.country) || COUNTRIES[0];

        return `À l'attention de Monsieur le Directeur Général des Douanes
Direction Générale des Douanes - ${countryData.name}

Objet : Recours gracieux relatif au contentieux n°${selectedLitigation.id}
Client : ${selectedLitigation.client}

Monsieur le Directeur Général,

Nous intervenons en qualité de conseil pour la société ${selectedLitigation.client}, ayant fait l'objet d'un procès-verbal d'infraction n°${selectedLitigation.id} en date du ${selectedLitigation.startDate} pour une présomption de ${selectedLitigation.type}.

Après analyse technique des éléments de fait et de droit, nous venons par la présente solliciter un examen bienveillant du dossier. En effet, les marchandises litigieuses, constituées de ${selectedLitigation.infraction.split(' (')[0]}, ont été déclarées conformément aux règles du Système Harmonisé (SH) et à la valeur transactionnelle réelle supportée par notre client.

Nous joignons à ce recours les factures pro-forma, les attestations de virement Swift et les contrats fournisseurs prouvant la sincérité de nos déclarations.

Dans l'attente d'une suite favorable, nous restons à votre disposition pour toute information complémentaire ou réunion technique de mise au point.

Veuillez agréer, Monsieur le Directeur Général, l'expression de notre haute considération.

Fait à ${countryData.id === 'SN' ? 'Dakar' : 'Abidjan'}, le ${date}`;
    };

    // Simulator State (Customs specific)
    const [simEntries, setSimEntries] = useState([
        { id: 1, label: "Droits de Douane (DD)", base: 50000000, rate: 20, penaltyRate: 100, isFixed: false },
        { id: 2, label: "Redevance Statistique (RS)", base: 50000000, rate: 1, penaltyRate: 0, isFixed: false },
        { id: 3, label: "TVA Importation", base: 60000000, rate: 18, penaltyRate: 0, isFixed: false }
    ]);

    const calculateDuties = (base: number, rate: number, pRate: number) => {
        const principal = (base * rate) / 100;
        const penalty = (principal * pRate) / 100;
        return { principal, penalty, total: principal + penalty };
    };

    const totalSim = simEntries.reduce((acc, entry) => {
        const res = calculateDuties(entry.base, entry.rate, entry.penaltyRate);
        return {
            principal: acc.principal + res.principal,
            penalty: acc.penalty + res.penalty,
            total: acc.total + res.total
        };
    }, { principal: 0, penalty: 0, total: 0 });

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-8 border-b border-white/5 relative overflow-hidden bg-gradient-to-r from-blue-500/5 via-transparent to-transparent rounded-3xl sm:rounded-[32px] px-6 sm:px-10 border-l-4 border-l-blue-500/50">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-blue-500/20">
                        <Anchor className="w-3 h-3" /> Contentieux Douanier (UEMOA)
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        Cellule de Crise Douanière
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-lg">
                        Gérez les litiges de vos clients avec les Douanes (Sénégal & Côte d'Ivoire).
                        Simulateur de droits compromis, mémoire de défense et recours administratifs.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Nouveau Contentieux
                    </button>
                    <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/5 w-fit">
                        {COUNTRIES.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCountry(c)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                    selectedCountry.id === c.id ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {c.id}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Active Litigations List */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-blue-400" /> Dossiers de Contentieux
                    </h3>

                    <div className="space-y-3">
                        {ACTIVE_LITIGATIONS.filter(l => l.country === selectedCountry.id || !selectedCountry).map((l) => (
                            <div
                                key={l.id}
                                onClick={() => setSelectedLitigation(l)}
                                className={cn(
                                    "p-5 rounded-2xl border cursor-pointer transition-all group",
                                    selectedLitigation.id === l.id ? "bg-slate-800/80 border-blue-500/40 shadow-lg" : "bg-slate-900/30 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors truncate max-w-[150px]">{l.client}</h4>
                                        <p className="text-[10px] text-slate-500 font-mono mt-1">{l.id}</p>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                                        l.status === "Recours Gracieux" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                            l.status === "Négociation" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    )}>
                                        {l.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3 bg-slate-950/50 p-2 rounded-lg">
                                    <Landmark className="w-3 h-3 text-blue-500" /> {l.type}
                                </div>

                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-600 font-bold uppercase">Risque</span>
                                    <span className={cn(
                                        "font-black tracking-widest",
                                        l.riskLevel === "High" ? "text-rose-500" : "text-amber-500"
                                    )}>{l.riskLevel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Contentieux Detail & Workflow */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Sub Navigation */}
                    <div className="flex gap-2 sm:gap-4 border-b border-white/5 mx-2 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile">
                        {[
                            { id: "overview", label: "Synthèse Dossier", icon: FileText },
                            { id: "simulator", label: "Droits Compromis", icon: CalcIcon },
                            { id: "builder", label: "Mémoire Défense", icon: FileSignature },
                            { id: "letter", label: "Recours DGD", icon: Mail },
                            { id: "docs", label: "Preuves & Pièces", icon: Upload }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "pb-4 px-2 flex items-center gap-2 font-bold text-xs sm:text-sm transition-all relative whitespace-nowrap",
                                    activeTab === tab.id ? "text-blue-400" : "text-slate-500 hover:text-white"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
                            </button>
                        ))}
                    </div>

                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="glass-card p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-white/5 bg-slate-900/40">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl sm:text-2xl font-black text-white">{selectedLitigation.client}</h2>
                                            <Globe className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <p className="text-slate-500 text-xs sm:text-sm font-medium">{selectedLitigation.infraction}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Inspecteur en charge</p>
                                        <p className="text-base sm:text-lg font-bold text-blue-400">{selectedLitigation.inspector}</p>
                                    </div>
                                </div>

                                {/* Litigation Timeline */}
                                <div className="relative pt-4 pb-8 overflow-x-auto no-scrollbar sm:overflow-visible">
                                    <div className="absolute top-8 left-0 right-0 h-1 bg-slate-800 rounded-full" />
                                    <div className="flex justify-between relative min-w-[500px] sm:min-w-0">
                                        {LITIGATION_PHASES.map((phase) => (
                                            <div key={phase.id} className="flex flex-col items-center z-10">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                                    phase.completed ? "bg-emerald-500 border-emerald-500" :
                                                        phase.current ? "bg-blue-500 border-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-slate-900 border-slate-700"
                                                )}>
                                                    {phase.completed ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                                                        phase.current ? <Timer className="w-4 h-4 text-white" /> :
                                                            <div className="w-2 h-2 rounded-full bg-slate-600" />}
                                                </div>
                                                <span className={cn(
                                                    "text-[8px] sm:text-[9px] font-black mt-3 text-center max-w-[70px] uppercase tracking-tighter",
                                                    phase.completed ? "text-emerald-400" : phase.current ? "text-blue-400" : "text-slate-600"
                                                )}>
                                                    {phase.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Scale className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Analyse Juridique</h4>
                                            <p className="text-xs text-slate-500">Qualification de l'infraction</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic">
                                        L'article 12 du Code des Douanes {selectedLitigation.country} stipule que la valeur transactionnelle est la base première, sauf preuve de fraude manifeste.
                                    </p>
                                </div>

                                <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl group hover:border-amber-500/30 transition-all">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Hammer className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Stratégie Défense</h4>
                                            <p className="text-xs text-slate-500">Prochaine étape : Transaction</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab("builder")} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        Préparez les arguments
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "simulator" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-black">
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-[32px]">
                                    <p className="text-[10px] text-slate-500 uppercase mb-1">Enjeux Principaux</p>
                                    <p className="text-2xl text-white">{totalSim.principal.toLocaleString()} FCFA</p>
                                </div>
                                <div className="p-6 bg-slate-900 border border-white/5 rounded-[32px]">
                                    <p className="text-[10px] text-red-400 uppercase mb-1">Amendes {selectedLitigation.riskLevel === 'High' ? '(Doubles)' : '(Min)'}</p>
                                    <p className="text-2xl text-red-500">{totalSim.penalty.toLocaleString()} FCFA</p>
                                </div>
                                <div className="p-6 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-600/20">
                                    <p className="text-[10px] text-blue-100 uppercase mb-1">Montant Transactionnel</p>
                                    <p className="text-2xl text-white">{(totalSim.total / 2).toLocaleString()} FCFA</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8">
                                <h3 className="font-bold text-white mb-6 flex justify-between">
                                    Simulation des Droits et Taxes Compromis
                                    <button className="text-xs text-blue-400 underline">Importer Déclaration (Sénégal/GAINDE)</button>
                                </h3>

                                <div className="space-y-4">
                                    {simEntries.map((entry) => {
                                        const res = calculateDuties(entry.base, entry.rate, entry.penaltyRate);
                                        return (
                                            <div key={entry.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div className="flex-1">
                                                    <p className="font-bold text-white text-sm">{entry.label}</p>
                                                    <p className="text-[10px] text-slate-500">Assiette : {entry.base.toLocaleString()} FCFA @ {entry.rate}%</p>
                                                </div>
                                                <div className="flex gap-8 text-right">
                                                    <div>
                                                        <p className="text-[9px] text-slate-600 uppercase font-black">Indue</p>
                                                        <p className="text-sm font-bold text-white">{res.principal.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-red-500/60 uppercase font-black">Amende</p>
                                                        <p className="text-sm font-bold text-red-400">{res.penalty.toLocaleString()}</p>
                                                    </div>
                                                    <button className="text-slate-800 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0" />
                                <p className="text-xs text-slate-400 italic">
                                    Note : En conformité avec le Règlement Européen et l'UEMOA, nous visons une réduction transactionnelle de 50% sur les amendes en invoquant la difficulté d'interprétation des nomenclatures.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "builder" && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-xl font-black text-white">Mémoire en Défense - Stratégie Douanière</h3>
                                    <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 transition-all">
                                        <Download className="w-4 h-4" /> Finaliser Mémoire (PDF)
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: "Point 1 : Valeur Transactionnelle", status: "Prêt", desc: "Justification du prix payé via Swift & contrats." },
                                        { title: "Point 2 : Erreur de Frappe (Good Faith)", status: "À revoir", desc: "Invoquer l'erreur matérielle sans intention de fraude." },
                                        { title: "Point 3 : Jurisprudence UEMOA", status: "Nouveau", desc: "Précédents jugés sur des cas de classification SH similaires." }
                                    ].map((pt, i) => (
                                        <div key={i} className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl hover:border-blue-500/40 transition-all cursor-pointer">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-white text-sm">{pt.title}</h4>
                                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold">{pt.status}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{pt.desc}</p>
                                        </div>
                                    ))}
                                    <button className="w-full py-4 border-2 border-dashed border-white/5 rounded-3xl text-slate-600 font-bold text-xs hover:text-slate-400 hover:border-white/10 transition-all">
                                        + Ajouter un argument technique
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "letter" && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-white">Modèle de Recours DGD</h3>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all"><Printer className="w-4 h-4" /></button>
                                        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
                                            <Download className="w-4 h-4" /> Télécharger Scellé
                                        </button>
                                    </div>
                                </div>

                                <div className="p-10 bg-[#fdfdfd] text-slate-800 rounded-2xl shadow-2xl font-serif text-sm leading-relaxed border-t-[16px] border-blue-900 min-h-[600px]">
                                    <div className="whitespace-pre-wrap opacity-90 italic">
                                        {generateAppealLetter()}
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
