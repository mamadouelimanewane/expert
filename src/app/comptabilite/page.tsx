"use client";

import {
    BarChart,
    Wallet,
    CreditCard,
    Download,
    Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/fintech/PaymentModal";
import { useState } from "react";

export default function ComptabilitePage() {
    const [selectedInvoice, setSelectedInvoice] = useState<{ id: string, amount: string } | null>(null);

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
                    <h2 className="text-3xl font-bold text-white tracking-tight">Comptabilité Cabinet</h2>
                    <p className="text-slate-400 mt-1">Suivi de la facturation et encaissement Mobile Money.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Nouvelle Facture
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-sm font-medium text-slate-400">CA Facturé (Mois)</p>
                    <h3 className="text-3xl font-bold text-white mt-1">12.5M <span className="text-lg text-slate-500">FCFA</span></h3>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-sm font-medium text-slate-400">Encaissé (Mobile Money)</p>
                    <h3 className="text-3xl font-bold text-emerald-400 mt-1">8.2M <span className="text-lg text-emerald-500/50">FCFA</span></h3>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
                    <p className="text-sm font-medium text-slate-400">Reste à recouvrer</p>
                    <h3 className="text-3xl font-bold text-rose-400 mt-1">4.3M <span className="text-lg text-rose-500/50">FCFA</span></h3>
                </div>
            </div>

            {/* Invoices List */}
            <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">Factures Récentes</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </div>

                <div className="space-y-4">
                    {[
                        { id: "F-2024-001", client: "Société Ivoirienne de Banque", amount: "2 500 000", date: "24/05/2024", status: "Payée" },
                        { id: "F-2024-002", client: "Traoré Import-Export", amount: "450 000", date: "22/05/2024", status: "En retard" },
                        { id: "F-2024-003", client: "Boulangerie du Plateau", amount: "150 000", date: "20/05/2024", status: "Envoyée" },
                    ].map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-800/40 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">{inv.client}</p>
                                    <p className="text-xs text-slate-500">{inv.id} • {inv.date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className="font-bold text-white text-right">{inv.amount} FCFA</span>
                                <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-semibold w-20 text-center",
                                    inv.status === "Payée" ? "bg-emerald-500/10 text-emerald-400" :
                                        inv.status === "En retard" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"
                                )}>
                                    {inv.status}
                                </span>
                                {inv.status !== "Payée" ? (
                                    <button
                                        onClick={() => setSelectedInvoice({ id: inv.id, amount: inv.amount })}
                                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs text-white font-medium transition-all"
                                    >
                                        Payer (Link)
                                    </button>
                                ) : (
                                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-all">
                                        <Download className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
