"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/fintech/PaymentModal";

export default function BillingPage() {
    const [selectedInvoice, setSelectedInvoice] = useState<{ id: string, amount: string } | null>(null);
    const [filter, setFilter] = useState("tous");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [kpis, setKpis] = useState({ paid: 0, pending: 0, overdueCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, [filter]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/invoices?status=${filter}`);
            const data = await res.json();
            if (data.invoices) setInvoices(data.invoices);
            if (data.kpis) setKpis(data.kpis);
        } catch (error) {
            console.error("Failed to fetch billing data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PaymentModal
                isOpen={!!selectedInvoice}
                invoiceId={selectedInvoice?.id || ""}
                amount={selectedInvoice?.amount || ""}
                onClose={() => {
                    setSelectedInvoice(null);
                    fetchInvoices(); // Refresh after payment
                }}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
                        Facturation & Honoraires
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Gérez vos factures et encaissements.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <Link
                        href="/billing/new"
                        className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle Facture
                    </Link>
                </div>
            </div>

            {/* KPI réels, calculés côté serveur (/api/invoices) — les affirmations de
                collecte à 88%, de "Direct Debit" et de "Partenariat Wave Pro Connecté"
                étaient fabriquées : aucune de ces fonctionnalités n'existe. Le paiement
                à l'unité via Wave/Orange/MTN est réel (voir PaymentModal ci-dessous),
                mais aucun prélèvement récurrent automatisé n'est implémenté. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Encaissé</p>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">{(kpis.paid / 1000000).toFixed(1)}M <span className="text-sm text-slate-500 italic">FCFA</span></h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">En attente / Retard</p>
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-rose-400 mt-1">{(kpis.pending / 1000000).toFixed(1)}M <span className="text-sm text-slate-500 italic">FCFA</span></h3>
                        </div>
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>{kpis.overdueCount} facture{kpis.overdueCount > 1 ? "s" : ""} nécessitent une relance</span>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 flex items-start gap-6">
                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                    <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Paiement à l&apos;unité</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Chaque facture en retard peut être réglée via Wave, Orange Money ou MTN MoMo (bouton
                        &quot;Payer&quot; ci-dessous). Aucun prélèvement automatique récurrent (mandat SEPA ou Mobile
                        Money) n&apos;est implémenté à ce jour.
                    </p>
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-slate-500 font-medium">Chargement des données financières...</p>
                        </div>
                    ) : (
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
                                {invoices.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/20 group transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-200">{item.invoiceNumber}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{new Date(item.issueDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-white">{item.client?.companyName || "N/A"}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 w-fit uppercase">Honoraires</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-white">
                                            {(item.total || item.amount).toLocaleString()} FCFA
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit",
                                                (item.status === "PAID" || item.status === "ACTIVE") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    (item.status === "OVERDUE" || item.status === "CANCELED") ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                        "bg-slate-700 text-slate-400 border-slate-600"
                                            )}>
                                                {(item.status === "PAID" || item.status === "ACTIVE") && <CheckCircle2 className="w-3 h-3" />}
                                                {(item.status === "OVERDUE" || item.status === "CANCELED") && <AlertCircle className="w-3 h-3" />}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {item.status === "OVERDUE" && (
                                                    <button className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors" title="Relancer client">
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {item.status !== "PAID" && item.status !== "DRAFT" && (
                                                    <button
                                                        onClick={() => setSelectedInvoice({ id: item.id, amount: item.total.toLocaleString() })}
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
                    )}
                </div>
            </div>
        </div>
    );
}
