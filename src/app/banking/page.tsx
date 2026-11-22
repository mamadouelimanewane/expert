"use client";
import { toast } from "@/lib/toast";

import { useState, useEffect } from "react";
import {
    ArrowRightLeft,
    Banknote,
    Search,
    ShieldCheck,
    RefreshCw,
    Activity,
    CreditCard,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: "CREDIT" | "DEBIT";
    status: "PENDING" | "RECONCILED" | "IGNORED";
    invoiceId?: string;
    suggestions?: Array<{
        invoiceId: string;
        score: number;
        reasons: string[];
        exactAmount: boolean;
    }>;
}

interface Invoice {
    id: string;
    number: string;
    clientName: string;
    date: string;
    amount: number;
    outstandingAmount?: number;
    type: "SALE" | "PURCHASE";
    status: string;
}

export default function BankingPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedTx, setSelectedTx] = useState<string | null>(null);

    const fetchBankingData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/banking/transactions");
            if(res.ok) {
                const data = await res.json();
                setTransactions(data.transactions || []);
                setInvoices(data.pendingInvoices || []);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBankingData();
    }, []);

    // Cette fonction créait deux transactions bancaires fictives ("Virement
    // CLIENT OMEGA", "Achat Fournitures SONELEC") et les persistait réellement
    // en base à chaque clic sur "Import Relevé", polluant le vrai relevé
    // lettrable du cabinet. Aucune intégration bancaire réelle (agrégateur,
    // API banque) n'existe dans l'application : ce bouton ne doit donc rien
    // faire tant qu'une telle intégration n'est pas branchée.
    const handleSync = async () => {
        toast.info("Aucune intégration bancaire n'est configurée. Utilisez l'import CSV/Wave depuis Ingestion → Connecteurs pour charger de vraies transactions.", { title: "Synchronisation indisponible" });
    };

    const handleReconcile = async (txId: string, invId: string) => {
        try {
            const res = await fetch("/api/banking/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reconcile", transactionId: txId, invoiceId: invId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Le rapprochement a échoué.");
            toast.success("Mouvement associé. Vérifiez ensuite le règlement dans la facturation.");
            setSelectedTx(null);
            await fetchBankingData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Le rapprochement a échoué.");
        }
    };

    const mouvementSelectionne = transactions.find((t) => t.id === selectedTx);
    const factureSuggereeId = mouvementSelectionne?.suggestions?.[0]?.invoiceId ?? null;

    const pendingTxCount = transactions.filter(t => t.status === "PENDING").length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <Activity className="w-40 h-40 text-cyan-400" />
                </div>
                <div className="relative z-10">
                    <h2 className="page-title flex items-center gap-4">
                        <div className="p-3 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-600/30">
                            <ArrowRightLeft className="w-8 h-8 text-white" />
                        </div>
                        Banque & rapprochement
                    </h2>
                    <p className="page-subtitle max-w-2xl">
                        Importez vos relevés puis associez manuellement chaque encaissement à une facture ouverte.
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={handleSync}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all active:scale-95 shadow-xl"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-cyan-400", isLoading && "animate-spin")} />
                        Import Relevé
                    </button>
                </div>
            </div>

            {/* Split Screen Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
                
                {/* LEFT: Bank Transactions */}
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-slate-900/80 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Relevé Bancaire
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{pendingTxCount} en attente</p>
                        </div>
                        <Search className="w-5 h-5 text-slate-500" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-center text-slate-500 mt-10">Chargement...</p>
                        ) : transactions.map(tx => (
                            <div 
                                key={tx.id} 
                                onClick={() => tx.status === "PENDING" && tx.type === "CREDIT" && setSelectedTx(tx.id)}
                                className={cn(
                                    "p-4 rounded-2xl border transition-all",
                                    tx.status === "RECONCILED" ? "bg-emerald-500/5 border-emerald-500/20 opacity-50 cursor-not-allowed" : 
                                    selectedTx === tx.id ? "bg-primary/20 border-primary/50" : "bg-white/5 border-white/5",
                                    tx.status === "PENDING" && tx.type === "CREDIT" ? "cursor-pointer hover:bg-white/10" : "cursor-default"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white text-sm">{tx.description}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-mono">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("font-black font-mono", tx.type === "CREDIT" ? "text-emerald-400" : "text-rose-400")}>
                                            {tx.type === "CREDIT" ? "+" : "-"}{Math.abs(tx.amount).toLocaleString()}
                                        </p>
                                        {tx.status === "RECONCILED" && (
                                            <span className="text-[8px] mt-1 text-emerald-500 font-bold flex items-center gap-1 justify-end">
                                                <ShieldCheck className="w-2.5 h-2.5" /> Lettré
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Pending Invoices */}
                <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-slate-900/80 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-emerald-400" />
                                Factures en Attente
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sélectionnez pour lettrer</p>
                        </div>
                        <Search className="w-5 h-5 text-slate-500" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {isLoading ? (
                            <p className="text-center text-slate-500 mt-10">Chargement...</p>
                        ) : invoices.map(inv => {
                            const suggestion = mouvementSelectionne?.suggestions?.find((candidate) => candidate.invoiceId === inv.id);
                            const isSuggested = factureSuggereeId === inv.id;

                            return (
                                <div 
                                    key={inv.id}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all relative overflow-hidden",
                                        isSuggested ? "bg-cyan-500/10 border-cyan-500/50" : "bg-white/5 border-white/5"
                                    )}
                                >
                                    {suggestion && (
                                        <div className="absolute top-0 right-0 bg-cyan-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">
                                            Indice {suggestion.score}/100 · heuristique
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-white text-sm">{inv.clientName}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-mono">Facture {inv.number}</p>
                                            {suggestion && (
                                                <p className="text-[10px] text-cyan-200/80 mt-2 max-w-sm">
                                                    {suggestion.reasons.join(" · ")}
                                                </p>
                                            )}
                                            {suggestion && !suggestion.exactAmount && selectedTx && (
                                                <p className="mt-1 text-[10px] text-amber-200/80">Piste seulement : le lettrage partiel n’est pas encore activé.</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black font-mono text-white">
                                                {inv.amount.toLocaleString()}
                                            </p>
                                            {inv.outstandingAmount === 0 && (
                                                <p className="mt-1 max-w-40 text-[9px] text-amber-200/80">Mouvement déjà associé · confirmez le règlement dans la facturation</p>
                                            )}
                                            {selectedTx && mouvementSelectionne?.type === "CREDIT" && (
                                                <button
                                                    disabled={inv.outstandingAmount === 0 || Math.abs(mouvementSelectionne.amount - inv.amount) > 0.01}
                                                    onClick={() => handleReconcile(selectedTx, inv.id)}
                                                    className="mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 text-white text-[10px] font-black uppercase rounded-lg transition-all"
                                                >
                                                    Associer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {invoices.length === 0 && !isLoading && (
                            <div className="text-center p-4 sm:p-6 lg:p-10">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                                <p className="text-white font-bold">Toutes les factures sont payées !</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
