"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, Receipt, CheckCircle2, Send } from "lucide-react";
import { toast } from "@/lib/toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Facture d'honoraires : lecture, changement de statut, impression (window.print
// avec mise en page dédiée). Les lignes sont celles enregistrées à la création ;
// une facture antérieure au 11/09/2026 n'en a pas et affiche son total seul.
// ─────────────────────────────────────────────────────────────────────────────

type Ligne = { designation: string; quantity: number; unitPrice: number; amount: number };
type Facture = {
    id: string; invoiceNumber: string; issueDate: string; dueDate: string; paidDate?: string | null; status: string;
    subtotal: number; taxRate: number; taxAmount: number; total: number; notes?: string | null; lines?: Ligne[] | null;
    client: { id: string; companyName?: string | null; firstName?: string | null; lastName?: string | null; email: string; phone: string; address?: string | null; city?: string | null; country: string; rccm?: string | null; ninea?: string | null; ifu?: string | null; nif?: string | null; subjectToTva: boolean };
};

const STATUT: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-slate-100 text-slate-600" },
    SENT: { label: "Envoyée", cls: "bg-blue-100 text-blue-700" },
    PAID: { label: "Payée", cls: "bg-emerald-100 text-emerald-700" },
    OVERDUE: { label: "En retard", cls: "bg-rose-100 text-rose-700" },
    CANCELLED: { label: "Annulée", cls: "bg-slate-100 text-slate-500" },
};
const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const dateFr = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—");

export default function FacturePage() {
    const { id } = useParams<{ id: string }>();
    const [facture, setFacture] = useState<Facture | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [busy, setBusy] = useState(false);

    const charger = async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/invoices/${id}`);
            if (r.status === 404) { setNotFound(true); return; }
            const d = await r.json();
            setFacture(d.invoice);
        } finally { setLoading(false); }
    };
    useEffect(() => { charger(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

    const changerStatut = async (status: "SENT" | "PAID" | "CANCELLED") => {
        if (status === "CANCELLED" && !window.confirm("Annuler cette facture ? Elle reste consultable avec son numéro.")) return;
        setBusy(true);
        try {
            const r = await fetch("/api/invoices", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, ...(status === "PAID" ? { paidDate: new Date().toISOString() } : {}) }) });
            const d = await r.json();
            if (!r.ok) { toast.error(d.error || "Changement refusé"); return; }
            toast.success(status === "PAID" ? "Facture marquée payée" : status === "SENT" ? "Facture marquée envoyée" : "Facture annulée");
            await charger();
        } finally { setBusy(false); }
    };

    if (notFound) return <EmptyState icon={Receipt} title="Facture introuvable" action={{ label: "Retour à la facturation", href: "/billing" }} />;
    if (loading || !facture) return <LoadingState label="Chargement de la facture…" skeleton="rows" count={5} />;

    const c = facture.client;
    const nomClient = c.companyName || [c.firstName, c.lastName].filter(Boolean).join(" ");
    const lignes = Array.isArray(facture.lines) ? facture.lines : [];
    const enRetard = facture.status === "SENT" && new Date(facture.dueDate) < new Date();

    return (
        <div className="space-y-6">
            <style jsx global>{`
                @media print {
                    .facture-imprimable { box-shadow: none !important; border: 0 !important; max-width: none !important; }
                    body { background: #fff !important; }
                }
            `}</style>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                <div>
                    <Link href="/billing" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="w-3.5 h-3.5" /> Facturation</Link>
                    <h1 className="page-title text-2xl font-bold m-0 mt-1 flex items-center gap-2">
                        {facture.invoiceNumber}
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold", (STATUT[facture.status] ?? STATUT.DRAFT).cls)}>{enRetard ? "En retard" : (STATUT[facture.status] ?? STATUT.DRAFT).label}</span>
                    </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-bold text-sm"><Printer className="w-4 h-4" /> Imprimer / PDF</button>
                    {facture.status === "DRAFT" && <button onClick={() => changerStatut("SENT")} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"><Send className="w-4 h-4" /> Marquer envoyée</button>}
                    {(facture.status === "SENT" || facture.status === "OVERDUE") && <button onClick={() => changerStatut("PAID")} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm"><CheckCircle2 className="w-4 h-4" /> Marquer payée</button>}
                    {facture.status !== "PAID" && facture.status !== "CANCELLED" && <button onClick={() => changerStatut("CANCELLED")} disabled={busy} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-rose-600 text-sm">Annuler</button>}
                </div>
            </div>

            {/* Document */}
            <div className="facture-imprimable bg-white text-slate-900 rounded-2xl border border-border shadow-sm max-w-4xl mx-auto p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-slate-200">
                    <div>
                        <p className="text-2xl font-extrabold tracking-tight" style={{ color: "#006B3F" }}>CABINET<span style={{ color: "#F29400" }}>360</span></p>
                        <p className="text-xs text-slate-500 mt-1">Cabinet d&apos;expertise comptable · Zone OHADA</p>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Facture d&apos;honoraires</p>
                        <p className="text-xl font-extrabold">{facture.invoiceNumber}</p>
                        <p className="text-xs text-slate-500 mt-1">Émise le {dateFr(facture.issueDate)}</p>
                        <p className="text-xs text-slate-500">Échéance le {dateFr(facture.dueDate)}</p>
                        {facture.paidDate && <p className="text-xs font-bold text-emerald-700 mt-1">Réglée le {dateFr(facture.paidDate)}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Facturé à</p>
                        <p className="font-bold">{nomClient}</p>
                        <p className="text-sm text-slate-600">{[c.address, c.city, c.country].filter(Boolean).join(", ")}</p>
                        <p className="text-sm text-slate-600">{c.email} · {c.phone}</p>
                    </div>
                    <div className="sm:text-right text-sm text-slate-600">
                        {c.rccm && <p>RCCM {c.rccm}</p>}
                        {c.ninea && <p>NINEA {c.ninea}</p>}
                        {c.ifu && <p>IFU {c.ifu}</p>}
                        {c.nif && <p>NIF {c.nif}</p>}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-y border-slate-200 text-[11px] uppercase tracking-widest text-slate-500">
                                <th className="text-left py-2.5">Désignation</th>
                                <th className="text-right py-2.5 w-20">Qté</th>
                                <th className="text-right py-2.5 w-36">Prix unitaire</th>
                                <th className="text-right py-2.5 w-36">Montant HT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lignes.length > 0 ? lignes.map((l, i) => (
                                <tr key={i}>
                                    <td className="py-3">{l.designation || "Prestation"}</td>
                                    <td className="py-3 text-right tabular-nums">{l.quantity}</td>
                                    <td className="py-3 text-right tabular-nums">{l.unitPrice.toLocaleString("fr-FR")}</td>
                                    <td className="py-3 text-right tabular-nums font-medium">{(l.amount ?? l.quantity * l.unitPrice).toLocaleString("fr-FR")}</td>
                                </tr>
                            )) : (
                                <tr><td className="py-3" colSpan={3}>Honoraires — prestations du cabinet</td><td className="py-3 text-right tabular-nums font-medium">{facture.subtotal.toLocaleString("fr-FR")}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-4">
                    <dl className="w-full sm:w-72 text-sm space-y-1.5">
                        <div className="flex justify-between"><dt className="text-slate-500">Total HT</dt><dd className="tabular-nums">{fcfa(facture.subtotal)}</dd></div>
                        <div className="flex justify-between"><dt className="text-slate-500">TVA {facture.taxRate} %</dt><dd className="tabular-nums">{fcfa(facture.taxAmount)}</dd></div>
                        <div className="flex justify-between border-t border-slate-300 pt-2 text-base font-extrabold"><dt>Total TTC</dt><dd className="tabular-nums">{fcfa(facture.total)}</dd></div>
                    </dl>
                </div>

                {facture.notes && <p className="mt-6 text-sm text-slate-600 whitespace-pre-line border-t border-slate-100 pt-4">{facture.notes}</p>}
                <p className="mt-8 text-[11px] text-slate-400">Règlement à réception par virement ou Mobile Money (Wave, Orange Money, MTN MoMo). Montants en francs CFA (XOF).</p>
            </div>
        </div>
    );
}
