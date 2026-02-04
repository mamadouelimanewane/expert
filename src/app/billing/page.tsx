"use client";

import { useEffect, useState } from "react";
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
    Repeat,
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

    const [view, setView] = useState<"invoices" | "subscriptions">("invoices");

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const endpoint = view === "invoices" ? `/api/invoices?status=${filter}` : `/api/subscriptions`;
            const res = await fetch(endpoint);
            const data = await res.json();
            if (data.invoices || data.subscriptions) setInvoices(data.invoices || data.subscriptions);
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
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-indigo-400" />
                        Facturation & Honoraires
                    </h2>
                    <p className="text-slate-400 mt-1">Gérez vos factures, abonnements récurrents et encaissements.</p>
                </div>

                <div className="flex gap-3">
                    <div className="p-1.5 bg-slate-900 border border-slate-700 rounded-2xl flex gap-1">
                        <button
                            onClick={() => setView("invoices")}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                view === "invoices" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            Factures
                        </button>
                        <button
                            onClick={() => setView("subscriptions")}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                view === "subscriptions" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <Repeat className="w-3.5 h-3.5" />
                                Abonnements
                            </div>
                        </button>
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all active:scale-95">
                        <Plus className="w-5 h-5" />
                        Nouvelle Facture
                    </button>
                </div>
            </div>

            {/* PENNYLANE INSPIRED: All-in-One Dashboard & Real-time Treasury */}
            <div className="bg-slate-950 p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <CreditCard className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between gap-12 relative z-10">
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase rounded tracking-widest border border-emerald-500/20">Synced Real-time</span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase rounded tracking-widest border border-indigo-500/20">360 View</span>
                        </div>
                        <h3 className="text-2xl font-black text-white leading-tight">La Trésorerie de vos Clients <span className="text-indigo-400">en un coup d'œil</span></h3>
                        <p className="text-slate-500 mt-2 text-sm font-medium">Pennylane fusionne la production comptable et le pilotage financier pour une collaboration sans friction.</p>

                        <div className="mt-8 flex gap-3">
                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">Analyser les Flux</button>
                            <button className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Relancer tous</button>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Collecte Documents</p>
                                <span className="text-indigo-400 font-bold text-xs">88%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[88%]" />
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2 font-medium">12 factures manquantes sur le portefeuille.</p>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Automatisation Paiements</p>
                                <span className="text-emerald-400 font-bold text-xs">Ready</span>
                            </div>
                            <button className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/10">Activer le Direct Debit</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Overlays */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Encaissé ce mois</p>
                            <h3 className="text-3xl font-bold text-white mt-1">{(kpis.paid / 1000000).toFixed(1)}M <span className="text-sm text-slate-500 italic">FCFA</span></h3>
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
                            <h3 className="text-3xl font-bold text-rose-400 mt-1">{(kpis.pending / 1000000).toFixed(1)}M <span className="text-sm text-slate-500 italic">FCFA</span></h3>
                        </div>
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <AlertCircle className="w-3 h-3" />
                        <span>{kpis.overdueCount} factures nécessitent une relance</span>
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

            {/* Automation & Fintech Controls (AXONAUT INSPIRED) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-amber-500/10 rounded-2xl">
                            <Repeat className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-white uppercase tracking-tighter">Relances Intelligentes (IA)</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Automatisez l'envoi des rappels par Email et WhatsApp dès que l'échéance est dépassée.
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actif</span>
                                </label>
                                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Configurer la fréquence</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl">
                            <CreditCard className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-white uppercase tracking-tighter">Prélèvements Automatiques</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Collectez vos honoraires directement via Mandat SEPA ou Mobile Money (Wave/Orange).
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                                    Partenariat Wave Pro Connecté
                                </span>
                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Gérer les Mandats</button>
                            </div>
                        </div>
                    </div>
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
                                    <th className="px-6 py-4">{view === "invoices" ? "Numéro / Date" : "Abonnement / Client"}</th>
                                    <th className="px-6 py-4">{view === "invoices" ? "Client / Type" : "Fréquence"}</th>
                                    <th className="px-6 py-4 text-right">Montant</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">{view === "invoices" ? "Échéance" : "Prochaine Facture"}</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {invoices.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-800/20 group transition-colors">
                                        <td className="px-6 py-4">
                                            {view === "invoices" ? (
                                                <>
                                                    <p className="font-bold text-slate-200">{item.invoiceNumber}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{new Date(item.issueDate).toLocaleDateString()}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-indigo-400">{item.name || "Abonnement Saisonnier"}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{item.client?.companyName}</p>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {view === "invoices" ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-white">{item.client?.companyName || "N/A"}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700 w-fit uppercase">Honoraires</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                                                    {item.frequency || "MENSUEL"}
                                                </span>
                                            )}
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
                                                {new Date(item.dueDate || item.nextBillingDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {view === "invoices" && item.status === "OVERDUE" && (
                                                    <button className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors" title="Relancer client">
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {view === "invoices" && item.status !== "PAID" && item.status !== "DRAFT" && (
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
