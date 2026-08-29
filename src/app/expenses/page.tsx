"use client";

import { useState, useEffect } from "react";
import {
    Plane,
    Receipt,
    Plus,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
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
    ArrowRight,
    Users,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Expense {
    id: string;
    label: string;
    category: "TRANSPORT" | "HEBERGEMENT" | "RESTAURATION" | "FOURNITURES" | "AUTRE";
    amount: number;
    status: "EN_ATTENTE" | "APPROUVEE" | "REJETEE" | "REMBOURSEE";
    expenseDate: string;
    receiptUrl: string | null;
    notes: string | null;
    mission: { id: string; title: string } | null;
    user: { id: string; firstName: string; lastName: string } | null;
    approvedBy: { id: string; firstName: string; lastName: string } | null;
}

interface MissionOrder {
    id: string;
    reference: string;
    purpose: string;
    destination: string | null;
    startDate: string;
    endDate: string;
    status: "BROUILLON" | "VALIDE" | "TERMINE";
    estimatedCost: number | null;
    mission: { id: string; title: string } | null;
    user: { id: string; firstName: string; lastName: string } | null;
}

const CATEGORY_LABEL: Record<string, string> = {
    TRANSPORT: "Transport",
    HEBERGEMENT: "Hébergement",
    RESTAURATION: "Restauration",
    FOURNITURES: "Fournitures",
    AUTRE: "Autre",
};

const STATUS_LABEL: Record<string, string> = {
    EN_ATTENTE: "En attente",
    APPROUVEE: "Approuvé",
    REJETEE: "Rejeté",
    REMBOURSEE: "Remboursé",
};

const MO_STATUS_LABEL: Record<string, string> = {
    BROUILLON: "Brouillon",
    VALIDE: "Validé",
    TERMINE: "Terminé",
};

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<"notes" | "ordres">("notes");
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [missionOrders, setMissionOrders] = useState<MissionOrder[]>([]);
    const [missions, setMissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
    const [showNewOrderModal, setShowNewOrderModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [expenseForm, setExpenseForm] = useState({ label: "", category: "AUTRE", amount: "", expenseDate: "", missionId: "", notes: "" });
    const [orderForm, setOrderForm] = useState({ purpose: "", destination: "", startDate: "", endDate: "", estimatedCost: "", missionId: "" });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            fetch("/api/expenses").then(r => r.json()),
            fetch("/api/mission-orders").then(r => r.json()),
        ]).then(([expData, moData]) => {
            setExpenses(expData.expenses || []);
            setMissionOrders(moData.missionOrders || []);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
        fetch("/api/missions").then(r => r.json()).then(d => setMissions(d.missions || []));
    }, []);

    const handleCreateExpense = async () => {
        if (!expenseForm.label || !expenseForm.amount || !expenseForm.expenseDate) return;
        setSaving(true);
        try {
            await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseForm),
            });
            setShowNewExpenseModal(false);
            setExpenseForm({ label: "", category: "AUTRE", amount: "", expenseDate: "", missionId: "", notes: "" });
            loadData();
        } finally {
            setSaving(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!orderForm.purpose || !orderForm.startDate || !orderForm.endDate) return;
        setSaving(true);
        try {
            await fetch("/api/mission-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderForm),
            });
            setShowNewOrderModal(false);
            setOrderForm({ purpose: "", destination: "", startDate: "", endDate: "", estimatedCost: "", missionId: "" });
            loadData();
        } finally {
            setSaving(false);
        }
    };

    const updateExpenseStatus = async (id: string, status: string) => {
        await fetch("/api/expenses", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        loadData();
    };

    const filteredExpenses = expenses.filter(e =>
        e.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.mission?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.user ? `${e.user.firstName} ${e.user.lastName}` : "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // KPIs réels calculés à partir des notes de frais existantes
    const totalEngaged = expenses.reduce((s, e) => s + e.amount, 0);
    const pendingCount = expenses.filter(e => e.status === "EN_ATTENTE").length;
    const totalReimbursed = expenses.filter(e => e.status === "REMBOURSEE").reduce((s, e) => s + e.amount, 0);
    const totalMissionBudget = missionOrders.reduce((s, m) => s + (m.estimatedCost || 0), 0);

    // Répartition analytique réelle par catégorie
    const categoryTotals = expenses.reduce((acc: Record<string, number>, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {});
    const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const categoryColors: Record<string, string> = {
        TRANSPORT: "bg-blue-500",
        HEBERGEMENT: "bg-purple-500",
        RESTAURATION: "bg-orange-500",
        FOURNITURES: "bg-cyan-500",
        AUTRE: "bg-slate-500",
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <Wallet className="w-40 h-40 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="page-title flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                            <Plane className="w-8 h-8 text-white" />
                        </div>
                        Frais & Missions
                    </h2>
                    <p className="page-subtitle max-w-2xl">
                        Centralisation des notes de frais, ordres de mission et remboursements d'équipe.
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={() => setShowNewOrderModal(true)}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 flex items-center gap-3 transition-all active:scale-95 shadow-xl"
                    >
                        <Plane className="w-4 h-4 text-indigo-400" />
                        Nouvel Ordre de Mission
                    </button>
                    <button
                        onClick={() => setShowNewExpenseModal(true)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/30"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle Note
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="Total Engagé" value={(totalEngaged / 1000).toFixed(0) + "K"} currency="FCFA" icon={TrendingUp} color="text-indigo-400" bgColor="bg-indigo-500/10" />
                <KpiCard title="A Approuver" value={String(pendingCount)} subtext="Notes en attente" icon={Clock} color="text-amber-400" bgColor="bg-amber-500/10" />
                <KpiCard title="Budget Missions" value={(totalMissionBudget / 1000).toFixed(0) + "K"} currency="FCFA" subtext={`${missionOrders.length} ordre(s) de mission`} icon={Plane} color="text-cyan-400" bgColor="bg-cyan-500/10" />
                <KpiCard title="Remboursé (Total)" value={(totalReimbursed / 1000).toFixed(0) + "K"} currency="FCFA" icon={TrendingDown} color="text-emerald-400" bgColor="bg-emerald-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Validation Workflow */}
                <div className="lg:col-span-2 glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl relative overflow-hidden">
                    <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                        Circuit de Validation de Frais
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 hidden md:block -translate-y-1/2" />

                        <div className="relative z-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                                <FileText className="w-8 h-8 text-emerald-400" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Saisie Manuelle</p>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">Formulaire</span>
                        </div>

                        <div className="relative z-10 text-center space-y-3 p-4 bg-white/5 rounded-3xl border border-white/10 scale-110 shadow-2xl">
                            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Approbation Manager</p>
                            <span className="text-[8px] text-indigo-400 font-black uppercase">En cours ({pendingCount})</span>
                        </div>

                        <div className="relative z-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                <FileText className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Compta - Export FEC</p>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">Manuel</span>
                        </div>

                        <div className="relative z-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                <TrendingUp className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Remboursement</p>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">Virement</span>
                        </div>
                    </div>
                </div>

                {/* Expense Analytics Brief — réel */}
                <div className="glass-card p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 bg-slate-900/40">
                    <h3 className="text-xl font-black text-white mb-8">Répartition Analytique</h3>
                    {categoryEntries.length === 0 ? (
                        <p className="text-xs text-slate-500">Aucune note de frais enregistrée pour le moment.</p>
                    ) : (
                        <div className="space-y-6">
                            {categoryEntries.map(([cat, total]) => (
                                <div key={cat} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-3 h-3 rounded-full", categoryColors[cat] || "bg-slate-500")} />
                                        <span className="text-xs font-bold text-slate-300">{CATEGORY_LABEL[cat] || cat}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{totalEngaged > 0 ? Math.round((total / totalEngaged) * 100) : 0}%</span>
                                </div>
                            ))}
                        </div>
                    )}
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
            {loading ? (
                <div className="glass-card rounded-[40px] p-32 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : activeTab === "notes" ? (
                <div className="glass-card rounded-[40px] overflow-hidden border border-white/5 bg-slate-900/20 shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <div className="relative w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher par employé ou mission..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5"><Filter className="w-4 h-4" /></button>
                            <button className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white border border-white/5"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="apix-table w-full text-left">
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
                                {filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                    exp.category === "TRANSPORT" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                                                        exp.category === "HEBERGEMENT" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                                                            exp.category === "RESTAURATION" ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
                                                                "bg-slate-700/10 border-slate-700/20 text-slate-400"
                                                )}>
                                                    {exp.category === "TRANSPORT" && <Bus className="w-5 h-5" />}
                                                    {exp.category === "HEBERGEMENT" && <Hotel className="w-5 h-5" />}
                                                    {exp.category === "RESTAURATION" && <Utensils className="w-5 h-5" />}
                                                    {(exp.category === "AUTRE" || exp.category === "FOURNITURES") && <Receipt className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{exp.label}</span>
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                        {exp.user ? `${exp.user.firstName} ${exp.user.lastName} • ` : ""}{new Date(exp.expenseDate).toLocaleDateString("fr-FR")}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-xs font-bold text-slate-400">{exp.mission?.title || "—"}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-mono font-black text-white">{exp.amount.toLocaleString("fr-FR")} FCFA</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 w-fit",
                                                exp.status === "APPROUVEE" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                    exp.status === "REMBOURSEE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        exp.status === "REJETEE" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                            "bg-slate-800 text-slate-500 border-slate-700"
                                            )}>
                                                {exp.status === "APPROUVEE" && <CheckCircle2 className="w-3 h-3" />}
                                                {STATUS_LABEL[exp.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            {exp.receiptUrl ? (
                                                <div className="flex items-center gap-2 text-emerald-400/60 text-[10px] font-black uppercase">
                                                    <FileText className="w-3 h-3" />
                                                    Fourni
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-rose-400/60 text-[10px] font-black uppercase">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Manquant
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {exp.status === "EN_ATTENTE" ? (
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => updateExpenseStatus(exp.id, "APPROUVEE")}
                                                        className="p-2 hover:bg-emerald-500/10 rounded-xl text-emerald-400 transition-all" title="Approuver">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateExpenseStatus(exp.id, "REJETEE")}
                                                        className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-400 transition-all" title="Rejeter">
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : exp.status === "APPROUVEE" ? (
                                                <button
                                                    onClick={() => updateExpenseStatus(exp.id, "REMBOURSEE")}
                                                    className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-500/20 transition-all">
                                                    Marquer remboursé
                                                </button>
                                            ) : (
                                                <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredExpenses.length === 0 && (
                                    <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-500">Aucune note de frais enregistrée. Créez-en une avec « Nouvelle Note ».</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {missionOrders.map(om => (
                        <div key={om.id} className="glass-card rounded-[40px] p-8 border border-white/5 bg-slate-900/20 hover:bg-slate-900/40 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                <Plane className="w-32 h-32" />
                            </div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{om.reference}</span>
                                    <h3 className="text-xl font-bold text-white mt-1">{om.purpose}</h3>
                                </div>
                                <span className={cn(
                                    "px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                                    om.status === "VALIDE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-800 text-slate-500 border-slate-700"
                                )}>
                                    {MO_STATUS_LABEL[om.status]}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Destination</p>
                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                        <Bus className="w-4 h-4 text-cyan-400" />
                                        {om.destination || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-600 font-black uppercase mb-2">Période de Mission</p>
                                    <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        {new Date(om.startDate).toLocaleDateString("fr-FR")} - {new Date(om.endDate).toLocaleDateString("fr-FR")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-black text-indigo-400">
                                        {om.user?.firstName?.[0] || "?"}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{om.user ? `${om.user.firstName} ${om.user.lastName}` : "—"}</p>
                                        <p className="text-[9px] text-slate-500 font-black uppercase">Responsable Mission</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-600 font-black uppercase">Budget Estimé</p>
                                    <p className="text-lg font-black text-white">{om.estimatedCost ? om.estimatedCost.toLocaleString("fr-FR") + " FCFA" : "—"}</p>
                                </div>
                            </div>

                            {om.status === "BROUILLON" && (
                                <button
                                    onClick={async () => {
                                        await fetch("/api/mission-orders", {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ id: om.id, status: "VALIDE" }),
                                        });
                                        loadData();
                                    }}
                                    className="mt-8 w-full py-4 bg-white/[0.03] hover:bg-white/[0.08] text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3 group-hover:border-indigo-500/30">
                                    Valider l'ordre de mission <ArrowRight className="w-4 h-4 text-indigo-400" />
                                </button>
                            )}
                        </div>
                    ))}

                    <button onClick={() => setShowNewOrderModal(true)} className="h-full min-h-[300px] border-2 border-dashed border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-slate-600 hover:border-indigo-500/30 hover:text-indigo-400 transition-all group">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Plus className="w-8 h-8" />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-xs">Créer un Ordre de Mission</span>
                    </button>
                </div>
            )}

            {/* New Expense Modal */}
            {showNewExpenseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouvelle Note de Frais</h3>
                            <button onClick={() => setShowNewExpenseModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-3 mb-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-300">La lecture automatique de reçu (OCR) n'est pas encore disponible — saisissez les informations manuellement.</p>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Libellé de la dépense" value={expenseForm.label} onChange={e => setExpenseForm({ ...expenseForm, label: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                    {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <input type="number" placeholder="Montant (FCFA)" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <input type="date" value={expenseForm.expenseDate} onChange={e => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <select value={expenseForm.missionId} onChange={e => setExpenseForm({ ...expenseForm, missionId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Aucune mission associée</option>
                                {missions.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
                            </select>
                            <textarea placeholder="Notes (optionnel)" value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" rows={2} />
                            <button onClick={handleCreateExpense} disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {saving ? "Enregistrement…" : "Créer la note de frais"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Mission Order Modal */}
            {showNewOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Nouvel Ordre de Mission</h3>
                            <button onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <input placeholder="Objet de la mission" value={orderForm.purpose} onChange={e => setOrderForm({ ...orderForm, purpose: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <input placeholder="Destination" value={orderForm.destination} onChange={e => setOrderForm({ ...orderForm, destination: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={orderForm.startDate} onChange={e => setOrderForm({ ...orderForm, startDate: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                                <input type="date" value={orderForm.endDate} onChange={e => setOrderForm({ ...orderForm, endDate: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            </div>
                            <input type="number" placeholder="Budget estimé (FCFA)" value={orderForm.estimatedCost} onChange={e => setOrderForm({ ...orderForm, estimatedCost: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                            <select value={orderForm.missionId} onChange={e => setOrderForm({ ...orderForm, missionId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                                <option value="">Aucune mission associée</option>
                                {missions.map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
                            </select>
                            <button onClick={handleCreateOrder} disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                                {saving ? "Enregistrement…" : "Créer l'ordre de mission"}
                            </button>
                        </div>
                    </div>
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
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tighter">{value}</h3>
                    {currency && <span className="text-xs font-bold text-slate-600 italic">{currency}</span>}
                </div>
                {subtext && <p className="text-[10px] text-slate-500 font-medium mt-1">{subtext}</p>}
            </div>
        </div>
    );
}
