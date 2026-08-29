"use client";

import { useState, useEffect } from "react";
import {
    Check,
    Database,
    Wand2,
    Trash2,
    Loader2,
    MessageSquareText
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "input" | "review" | "success";

interface ClientOption {
    id: string;
    name: string;
}

interface JournalEntry {
    id: string;
    date: string;
    libelle: string;
    rawContent: string | null;
    entree: number;
    sortie: number;
    montant: number;
    debitCompte: string;
    debitIntitule: string;
    creditCompte: string;
    creditIntitule: string;
    confidenceScore: number;
    status: string;
}

export default function IngestPage() {
    const [step, setStep] = useState<Step>("input");
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientId, setClientId] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [rawMessages, setRawMessages] = useState("");
    const [processing, setProcessing] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [validatedCount, setValidatedCount] = useState(0);

    useEffect(() => {
        fetch("/api/clients?isActive=true")
            .then((r) => r.json())
            .then((data) => {
                const list: ClientOption[] = (data.clients || []).map((c: any) => ({
                    id: c.id,
                    name: c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
                }));
                setClients(list);
            })
            .catch(() => setClients([]));
    }, []);

    const handleClientChange = (id: string) => {
        setClientId(id);
        const c = clients.find((cl) => cl.id === id);
        setBusinessName(c?.name || "");
    };

    const startProcessing = async () => {
        setError(null);
        const lines = rawMessages.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!clientId) {
            setError("Sélectionnez un client avant de lancer l'imputation.");
            return;
        }
        if (lines.length === 0) {
            setError("Saisissez au moins une ligne (ex: \"Vendu 50000 de ciment\" ou \"Payé 10000 pour le transport\").");
            return;
        }

        setProcessing(true);
        const created: JournalEntry[] = [];
        try {
            for (const line of lines) {
                const res = await fetch("/api/tpe/process-flow", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId, businessName, rawMessage: line, source: "MANUAL" }),
                });
                const data = await res.json();
                if (res.ok && data.entry) {
                    created.push(data.entry);
                }
            }
            if (created.length === 0) {
                setError("Aucune écriture n'a pu être créée. Vérifiez le format des lignes saisies.");
                setProcessing(false);
                return;
            }
            setEntries(created);
            setStep("review");
        } catch {
            setError("Erreur réseau lors du traitement.");
        } finally {
            setProcessing(false);
        }
    };

    const validateEntry = async (id: string) => {
        const res = await fetch("/api/tpe/journals", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "APPROVED" }),
        });
        if (res.ok) {
            setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "APPROVED" } : e)));
            setValidatedCount((c) => c + 1);
        }
    };

    const rejectEntry = async (id: string) => {
        const res = await fetch("/api/tpe/journals", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: "REJECTED" }),
        });
        if (res.ok) {
            setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, status: "REJECTED" } : e)));
        }
    };

    const validateAll = async () => {
        const pending = entries.filter((e) => e.status === "PENDING");
        for (const e of pending) {
            await validateEntry(e.id);
        }
        setStep("success");
    };

    const resetFlow = () => {
        setStep("input");
        setEntries([]);
        setRawMessages("");
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <Database className="w-8 h-8 text-emerald-400" />
                        Import & Saisie Automatisée
                    </h2>
                    <p className="page-subtitle">Saisissez les recettes/dépenses transmises par le client (WhatsApp, dictée) avec imputation OHADA automatique.</p>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {["Saisie", "Revue", "Validation"].map((label, idx) => {
                    const stepIdx = step === "input" ? 0 : step === "review" ? 1 : 2;
                    const isActive = idx === stepIdx;
                    const isDone = idx < stepIdx;
                    return (
                        <div key={idx} className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" :
                                    isDone ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-500"
                            )}>
                                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={cn(
                                "text-sm font-medium hidden sm:block",
                                isActive ? "text-white" : isDone ? "text-emerald-400" : "text-slate-500"
                            )}>{label}</span>
                            {idx < 2 && <div className="w-8 h-0.5 bg-slate-800 mx-2" />}
                        </div>
                    );
                })}
            </div>

            <div className="glass-card rounded-2xl border border-slate-700/50 p-6 min-h-[300px] sm:min-h-[400px] flex flex-col">

                {/* STEP 1: INPUT */}
                {step === "input" && (
                    <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client</label>
                            <select
                                value={clientId}
                                onChange={(e) => handleClientChange(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="">— Sélectionner un client —</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquareText className="w-3.5 h-3.5" /> Écritures (une par ligne)
                            </label>
                            <textarea
                                value={rawMessages}
                                onChange={(e) => setRawMessages(e.target.value)}
                                rows={6}
                                placeholder={"Ex:\nVendu 50000 de ciment\nPayé 10000 pour le transport\nAcheté du stock 25000"}
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono resize-none"
                            />
                            <p className="text-[11px] text-slate-500">
                                Le moteur détecte automatiquement le sens (recette/dépense) et suggère les comptes OHADA correspondants.
                            </p>
                        </div>

                        {error && (
                            <p className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={startProcessing}
                                disabled={processing}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
                            >
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                Lancer l'imputation
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: REVIEW */}
                {step === "review" && (
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">Revue des Écritures</h3>
                                <p className="text-sm text-slate-400">
                                    <span className="text-emerald-400 font-bold">{entries.length}</span> écriture(s) créée(s) dans le journal de <span className="text-indigo-400">{businessName}</span>
                                </p>
                            </div>
                            <button
                                onClick={validateAll}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Tout valider
                            </button>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse apix-table">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-500">
                                        <th className="p-3 font-medium">Date</th>
                                        <th className="p-3 font-medium">Libellé Saisi</th>
                                        <th className="p-3 font-medium text-right">Montant</th>
                                        <th className="p-3 font-medium">Comptes OHADA (moteur)</th>
                                        <th className="p-3 font-medium text-center">Confiance</th>
                                        <th className="p-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {entries.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/30 group transition-colors">
                                            <td className="p-3 text-slate-300 font-mono text-xs">{tx.date}</td>
                                            <td className="p-3 text-white font-medium max-w-[220px] truncate" title={tx.rawContent || tx.libelle}>{tx.rawContent || tx.libelle}</td>
                                            <td className={cn(
                                                "p-3 text-right font-mono font-bold",
                                                tx.entree > 0 ? "text-emerald-400" : "text-white"
                                            )}>
                                                {(tx.entree > 0 ? tx.entree : tx.sortie).toLocaleString("fr-FR")} F
                                            </td>
                                            <td className="p-3">
                                                <span className="text-xs text-indigo-300 font-mono">{tx.debitCompte}</span>
                                                <span className="text-slate-600 mx-1">→</span>
                                                <span className="text-xs text-indigo-300 font-mono">{tx.creditCompte}</span>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{tx.debitIntitule} / {tx.creditIntitule}</p>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold inline-block min-w-[3rem]",
                                                    tx.confidenceScore > 0.9 ? "bg-emerald-500/10 text-emerald-400" :
                                                        tx.confidenceScore > 0.7 ? "bg-indigo-500/10 text-indigo-400" : "bg-rose-500/10 text-rose-400"
                                                )}>
                                                    {Math.round(tx.confidenceScore * 100)}%
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                {tx.status === "PENDING" ? (
                                                    <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => validateEntry(tx.id)} className="p-1.5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded transition-colors" title="Valider">
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => rejectEntry(tx.id)} className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 rounded transition-colors" title="Rejeter">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase px-2 py-1 rounded",
                                                        tx.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                                    )}>
                                                        {tx.status === "APPROVED" ? "Validé" : "Rejeté"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === "success" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                            <Database className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Importation Terminée</h3>
                        <p className="text-slate-400 mb-8">
                            <strong className="text-white">{entries.filter((e) => e.status === "APPROVED").length} écriture(s)</strong> validée(s) dans le journal de <br />
                            <span className="text-indigo-400">{businessName}</span>.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={resetFlow}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium border border-slate-700 transition-colors"
                            >
                                Importer d'autres écritures
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
