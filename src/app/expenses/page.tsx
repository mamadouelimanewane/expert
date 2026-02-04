"use client";

import { useState } from "react";
import {
    Plane,
    Receipt,
    Plus,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    FileText,
    TrendingUp,
    TrendingDown,
    Wallet,
    Bus,
    Hotel,
    Utensils,
    Sparkles,
    Search,
    ChevronRight,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Expense {
    id: string;
    employee: string;
    category: "Transport" | "Hébergement" | "Repas" | "Autre";
    amount: string;
    date: string;
    mission: string;
    status: "Approuvé" | "En attente" | "Rejeté" | "Remboursé";
    receipt?: boolean;
}

const MOCK_EXPENSES: Expense[] = [
    { id: "EXP-001", employee: "Jean Dupont", category: "Transport", amount: "45 000", date: "22/05/2024", mission: "Audit SIB Abidjan", status: "Approuvé", receipt: true },
    { id: "EXP-002", employee: "Marie Koné", category: "Hébergement", amount: "120 000", date: "20/05/2024", mission: "Inventaire GDS Gabon", status: "En attente", receipt: true },
    { id: "EXP-003", employee: "Paul Ndiaye", category: "Repas", amount: "12 500", date: "18/05/2024", mission: "Conseil Dakar", status: "Remboursé", receipt: true },
    { id: "EXP-004", employee: "Jean Dupont", category: "Autre", amount: "5 000", date: "23/05/2024", mission: "Audit SIB Abidjan", status: "En attente", receipt: false },
];

interface MissionOrder {
    id: string;
    title: string;
    employee: string;
    startDate: string;
    endDate: string;
    destination: string;
    budget: string;
    status: "Validé" | "Brouillon" | "Terminé";
}

const MOCK_MISSION_ORDERS: MissionOrder[] = [
    { id: "OM-2024-12", title: "Missions Audit Annuel", employee: "Jean Dupont", startDate: "01/06/2024", endDate: "15/06/2024", destination: "Abidjan, CI", budget: "850 000", status: "Validé" },
    { id: "OM-2024-15", title: "Expertise Acquisition", employee: "Marie Koné", startDate: "10/06/2024", endDate: "12/06/2024", destination: "Libreville, GA", budget: "400 000", status: "Brouillon" },
];

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<"notes" | "ordres">("notes");
    const [isCapturing, setIsCapturing] = useState(false);

    const handleOCR = () => {
        setIsCapturing(true);
        setTimeout(() => setIsCapturing(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Wallet className="w-40 h-40 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                            <Plane className="w-8 h-8 text-white" />
                        </div>
                        Frais & Missions
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Centralisation des notes de frais, ordres de mission et remboursements d'équipe.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={handleOCR}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 flex items-center gap-3 transition-all active:scale-95 shadow-xl"
                    >
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Scan Reçu (IA)
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/30">
                        <Plus className="w-5 h-5" />
                        Nouvelle Note
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Total Engagé (Mois)" value="2.4M" currency="FCFA" trend="+8%" icon={TrendingUp} color="text-indigo-400" bgColor="bg-indigo-500/10" />
                <KpiCard title="A Approuver" value="12" subtext="Notes en attente" icon={Clock} color="text-amber-400" bgColor="bg-amber-500/10" />
                <KpiCard title="Budget Missions" value="15.8M" currency="FCFA" subtext="Consommé : 64%" icon={Plane} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                <KpiCard title="Remboursé (Total)" value="840K" currency="FCFA" trend="-4%" icon={TrendingDown} color="text-emerald-400" bgColor="bg-emerald-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Validation Workflow */}
                <div className="lg:col-span-2 glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                        Circuit de Validation de Frais
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 hidden md:block -translate-y-1/2" />

                        <div className="relative z-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                <Sparkles className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Saisie & OCR</p>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">Automatique</span>
                        </div>

                        <div className="relative z-10 text-center space-y-3 p-4 bg-white/5 rounded-3xl border border-white/10 scale-110 shadow-2xl">
                            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Approbation Manager</p>
                            <span className="text-[8px] text-indigo-400 font-black uppercase">En cours (12)</span>
                        </div>

                        <div className="relative z-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                <FileText className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Compta - Export FEC</p>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">Planifié</span>
                        </div>

                        <div className="relative z-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                <TrendingUp className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Remboursement</p>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">Virement SEPA</span>
                        </div>
                    </div>
                </div>

                {/* Expense Analytics Brief */}
                <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/40">
                    <h3 className="text-xl font-black text-white mb-8">Répartition Analytique</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-slate-300">Transport</span>
                            </div>
                            <span className="text-xs font-black text-white">45%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-xs font-bold text-slate-300">Hébergement</span>
                            </div>
                            <span className="text-xs font-black text-white">32%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span className="text-xs font-bold text-slate-300">Repas</span>
                            </div>
                            <span className="text-xs font-black text-white">18%</span>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <button className="w-full text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline text-center">Voir l'analyse détaillée</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-4 p-1 bg-slate-900 border border-white/5 rounded-3xl w-fit">
                <button
                    onClick={() => setActiveTab("notes")}
                    className={cn(
                        "px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === "notes" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    Notes de Frais
                </button>
                <button
                    onClick={() => setActiveTab("ordres")}
                    className={cn(
                        "px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                        activeTab === "ordres" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    Ordres de Mission
                </button>
            </div>

            {/* Content Area */}
            {isCapturing ? (
                <div className="glass-card rounded-[40px] p-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-indigo-500/30 animate-pulse">
                    <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mb-8">
                        <Sparkles className="w-12 h-12 text-indigo-400 animate-spin" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Analyse IA du Reçu...</h3>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">Extraction automatique du montant, de la date et de la catégorie fiscale.</p>
                </div>
            ) : activeTab === "notes" ? (
                <div className="glass-card rounded-[40px] overflow-hidden border border-white/5 bg-slate-900/20 shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <div className="relative w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par employé ou mission..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5"><Filter className="w-4 h-4" /></button>
                            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Dépense / Catégorie</th>
                                    <th className="px-6 py-6 font-black">Mission Associée</th>
                                    <th className="px-6 py-6 font-black text-right">Montant</th>
                                    <th className="px-6 py-6 font-black">Statut</th>
                                    <th className="px-6 py-6 font-black">Justificatif</th>
                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_EXPENSES.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    exp.category === "Transport" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                                        exp.category === "Hébergement" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                                            exp.category === "Repas" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                                                                "bg-slate-700/10 border-slate-700/20 text-slate-400"
                                                )}>
                                                    {exp.category === "Transport" && <Bus className="w-5 h-5" />}
                                                    {exp.category === "Hébergement" && <Hotel className="w-5 h-5" />}
                                                    {exp.category === "Repas" && <Utensils className="w-5 h-5" />}
                                                    {exp.category === "Autre" && <Receipt className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{exp.employee}</span>
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{exp.date}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-bold text-slate-400">{exp.mission}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono font-black text-white">{exp.amount} FCFA</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 w-fit",
                                                exp.status === "Approuvé" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                    exp.status === "Remboursé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        exp.status === "Rejeté" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                            "bg-slate-800 text-slate-500 border-slate-700"
                                            )}>
                                                {exp.status === "Approuvé" && <CheckCircle2 className="w-3 h-3" />}
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            {exp.receipt ? (
                                                <div className="flex items-center gap-2 text-emerald-400/60 text-[10px] font-black uppercase">
                                                    <FileText className="w-3 h-3" />
                                                    OCR OK
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-rose-400/60 text-[10px] font-black uppercase">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Manquant
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {MOCK_MISSION_ORDERS.map(om => (
                        <div key={om.id} className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/20 hover:bg-slate-900/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                <Plane className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{om.id}</span>
                                    <h3 className="text-xl font-bold text-white mt-1">{om.title}</h3>
                                </div>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                    om.status === "Validé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-800 text-slate-500 border-slate-700"
                                )}>
                                    {om.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Destinations</p>
                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                        <Bus className="w-4 h-4 text-cyan-400" />
                                        {om.destination}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Période de Mission</p>
                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        {om.startDate} - {om.endDate}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-indigo-400">
                                        {om.employee[0]}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{om.employee}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase">Expert Senior</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-600 font-black uppercase">Budget Alloué</p>
                                    <p className="text-lg font-black text-white">{om.budget} FCFA</p>
                                </div>
                            </div>

                            <button className="mt-8 w-full py-4 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3 group-hover:border-indigo-500/30">
                                Détails du Budget & Justificatifs <ArrowRight className="w-4 h-4 text-indigo-400" />
                            </button>
                        </div>
                    ))}

                    <button className="h-full min-h-[300px] border-2 border-dashed border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500/30 hover:text-indigo-400 transition-all group">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-xs">Créer un Ordre de Mission</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function KpiCard({ title, value, currency, trend, subtext, icon: Icon, color, bgColor }: any) {
    return (
        <div className="glass-card p-6 rounded-[32px] border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:bg-slate-900/60 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl shadow-lg transition-transform group-hover:scale-110", bgColor, color)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                        trend.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
                    {currency && <span className="text-xs font-bold text-slate-600 italic">{currency}</span>}
                </div>
                {subtext && <p className="text-[10px] text-slate-500 font-medium mt-1">{subtext}</p>}
            </div>
        </div>
    );
}
