"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Receipt,
    Building2,
    Calendar,
    DollarSign,
    FileText,
    ArrowLeft,
    Save,
    Loader2,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
    id: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    type: string;
}

interface LineItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);

    const [formData, setFormData] = useState({
        clientId: "",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        taxRate: 18,
        notes: "",
        status: "DRAFT",
    });

    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: "", quantity: 1, unitPrice: 0 },
    ]);

    useEffect(() => {
        fetch("/api/clients")
            .then((r) => r.json())
            .then((d) => setClients(d.clients || d || []))
            .catch(() => {});
    }, []);

    const subtotal = lineItems.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;

    const updateLine = (idx: number, field: keyof LineItem, value: string | number) => {
        const updated = [...lineItems];
        updated[idx] = { ...updated[idx], [field]: value };
        setLineItems(updated);
    };

    const addLine = () => setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
    const removeLine = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx));

    const getClientName = (c: Client) =>
        c.type === "PARTICULIER" ? `${c.firstName} ${c.lastName}` : c.companyName || "—";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId) { setError("Sélectionnez un client."); return; }
        if (lineItems.every((l) => !l.description)) { setError("Ajoutez au moins une ligne."); return; }
        setIsLoading(true);
        setError(null);

        try {
            const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
            const res = await fetch("/api/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invoiceNumber,
                    clientId: formData.clientId,
                    dueDate: new Date(formData.dueDate).toISOString(),
                    subtotal,
                    taxRate: formData.taxRate,
                    taxAmount,
                    total,
                    notes: formData.notes,
                    status: formData.status,
                    lineItems,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Erreur lors de la création");
            }

            router.push("/billing");
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Impossible de créer la facture.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-3">
                        <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">Nouvelle Facture</h1>
                        <p className="text-slate-400 font-medium">Créez une facture conforme OHADA / TVA.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <p className="text-sm font-bold text-rose-200">{error}</p>
                    </div>
                )}

                {/* Client + Date + Statut */}
                <div className="glass-card rounded-[24px] p-6 border border-white/5 bg-slate-900/40 space-y-5">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Informations Générales
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400">Client *</label>
                            <select
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-medium text-sm appearance-none"
                                required
                            >
                                <option value="">Choisir un client...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{getClientName(c)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Date d&apos;échéance
                            </label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400">Taux TVA (%)</label>
                            <input
                                type="number"
                                value={formData.taxRate}
                                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                                min={0}
                                max={100}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400">Statut</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-medium text-sm appearance-none"
                            >
                                <option value="DRAFT">Brouillon</option>
                                <option value="SENT">Envoyée</option>
                                <option value="PAID">Payée</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Lignes de facturation */}
                <div className="glass-card rounded-[24px] p-6 border border-white/5 bg-slate-900/40 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Lignes de Prestation
                        </h2>
                        <button
                            type="button"
                            onClick={addLine}
                            className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Ajouter une ligne
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* En-tête tableau */}
                        <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-center">Qté</div>
                            <div className="col-span-3 text-right">Prix unitaire</div>
                            <div className="col-span-1" />
                        </div>

                        {lineItems.map((line, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-12 md:col-span-6">
                                    <input
                                        type="text"
                                        placeholder="Description de la prestation..."
                                        value={line.description}
                                        onChange={(e) => updateLine(idx, "description", e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <input
                                        type="number"
                                        min={1}
                                        value={line.quantity}
                                        onChange={(e) => updateLine(idx, "quantity", parseFloat(e.target.value) || 1)}
                                        className="w-full px-3 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white text-center outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="col-span-7 md:col-span-3">
                                    <input
                                        type="number"
                                        min={0}
                                        value={line.unitPrice}
                                        onChange={(e) => updateLine(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white text-right outline-none focus:border-emerald-500 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeLine(idx)}
                                        disabled={lineItems.length === 1}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            lineItems.length === 1
                                                ? "text-slate-700 cursor-not-allowed"
                                                : "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totaux + Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Notes */}
                    <div className="glass-card rounded-[24px] p-6 border border-white/5 bg-slate-900/40 space-y-3">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Notes internes</h2>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Conditions de paiement, références mission..."
                            rows={5}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500 transition-all font-medium text-sm resize-none"
                        />
                    </div>

                    {/* Récapitulatif */}
                    <div className="glass-card rounded-[24px] p-6 border border-white/5 bg-slate-900/40 space-y-4">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Récapitulatif
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Sous-total HT</span>
                                <span className="text-white font-bold">{subtotal.toLocaleString("fr-FR")} FCFA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">TVA ({formData.taxRate}%)</span>
                                <span className="text-amber-400 font-bold">{taxAmount.toLocaleString("fr-FR")} FCFA</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between">
                                <span className="text-white font-black">TOTAL TTC</span>
                                <span className="text-2xl font-black text-emerald-400">{total.toLocaleString("fr-FR")} FCFA</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <p className="text-xs text-emerald-300 font-medium">Conforme SYSCOHADA — TVA applicable zone OHADA</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Émettre la Facture
                    </button>
                </div>
            </form>
        </div>
    );
}
