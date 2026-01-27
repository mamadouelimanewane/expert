"use client";

import { useState } from "react";
import {
    Receipt,
    Plus,
    Filter,
    Download,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Mail,
    Smartphone,
    Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/fintech/PaymentModal";

interface Invoice {
    id: string;
    client: string;
    amount: string;
    date: string;
    dueDate: string;
    status: "payee" | "en_attente" | "retard" | "brouillon";
    type: "Honoraire" | "Audit" | "Conseil";
    isRecurring: boolean;
}

const MOCK_INVOICES: Invoice[] = [
    { id: "FAC-2024-042", client: "Société Ivoirienne de Banque", amount: "1 250 000", date: "15/05/2024", dueDate: "15/06/2024", status: "payee", type: "Honoraire", isRecurring: true },
    { id: "FAC-2024-045", client: "Traoré Import-Export", amount: "450 000", date: "20/05/2024", dueDate: "05/06/2024", status: "en_attente", type: "Honoraire", isRecurring: true },
    { id: "FAC-2024-048", client: "Tech Solutions Bénin", amount: "2 800 000", date: "10/05/2024", dueDate: "10/06/2024", status: "retard", type: "Audit", isRecurring: false },
    { id: "FAC-2024-050", client: "Boulangerie du Plateau", amount: "150 000", date: "22/05/2024", dueDate: "22/06/2024", status: "brouillon", type: "Conseil", isRecurring: false },
];

export default function BillingPage() {
    const [selectedInvoice, setSelectedInvoice] = useState<{ id: string, amount: string } | null>(null);
    const [filter, setFilter] = useState("tous");

    return (
        <div className="space-y-6">
            <PaymentModal
                isOpen={!!selectedInvoice}
                invoiceId={selectedInvoice?.id || ""}
                amount={selectedInvoice?.amount || ""}
                onClose={() => setSelectedInvoice(null)}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-indigo-400" />
                        Facturation & Honoraires
                    </h2>
                    <p className="text-slate-400 mt-1">Gérez vos factures, abonnements récurrents et encaissements.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 flex items-center gap-2 transition-all">
                        <Repeat className="w-4 h-4" />
                        Abonnements
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        Nouvelle Facture
                    </button>
                </div>
            </div>

            {/* KPI Overlays */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Encaissé ce mois</p>
                            <h3 className="text-3xl font-bold text-white mt-1">8.2M <span className="text-sm text-slate-500 italic">FCFA</span></h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs">
                        <span className="text-emerald-400 font-bold">+12%</span>
                        <span className="text-slate-500">vs mois dernier</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">En attente / Retard</p>
                            <h3 className="text-3xl font-bold text-rose-400 mt-1">3.4M <span className="text-sm text-slate-500 italic">FCFA</span></h3>
                        </div>
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>5 factures nécessitent une relance</span>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 bg-indigo-600 shadow-xl shadow-indigo-600/20">
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">Temps non facturé</p>
                    <h3 className="text-3xl font-bold text-white mt-1">4.2M <span className="text-sm text-indigo-200 italic">FCFA</span></h3>
                    <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 backdrop-blur-sm transition-all">
                        Facturer les heures
                    </button>
                </div>
            </div>

            {/* Invoice Table */}
            <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden text-white">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        {["tous", "payee", "retard", "brouillon"].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all",
                                    filter === s ? "bg-slate-800 text-white" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><Filter className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><Download className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/30 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Numéro / Date</th>
                                <th className="px-6 py-4">Client / Type</th>
                                <th className="px-6 py-4 text-right">Montant</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Échéance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {MOCK_INVOICES.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-800/20 group transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-200">{inv.id}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{inv.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{inv.client}</span>
                                            {inv.isRecurring && <Repeat className="w-3 h-3 text-indigo-400" />}
                                        </div>
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">{inv.type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-white">
                                        {inv.amount} FCFA
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit",
                                            inv.status === "payee" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                inv.status === "retard" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                    inv.status === "en_attente" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-slate-700 text-slate-400 border-slate-600"
                                        )}>
                                            {inv.status === "payee" && <CheckCircle2 className="w-3 h-3" />}
                                            {inv.status === "retard" && <AlertCircle className="w-3 h-3" />}
                                            {inv.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            {inv.dueDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {inv.status === "retard" && (
                                                <button className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors" title="Relancer client">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            )}
                                            {inv.status !== "payee" && inv.status !== "brouillon" && (
                                                <button
                                                    onClick={() => setSelectedInvoice({ id: inv.id, amount: inv.amount })}
                                                    className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors" title="Lien de paiement Mobile Money"
                                                >
                                                    <Smartphone className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
