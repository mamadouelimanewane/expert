"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, CheckCircle2, FileSpreadsheet, FileText, History, Landmark, Loader2, Trash2, Undo2, X } from "lucide-react";
import { MODES_PAIEMENT } from "@/lib/payroll/declarations";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/**
 * Périodes de paie d'un dossier : bulletins, déclarations pré-remplies,
 * ordre de paiement, livre de paie, puis suivi du règlement (constat du
 * paiement, annulation d'une période non payée pour la revalider).
 *
 * Le paiement est constaté à la main : l'application n'émet aucun virement,
 * la banque ou l'opérateur Mobile Money exécute l'ordre de paiement exporté.
 */

interface Periode {
  id: string;
  periodName: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  paymentMode: string | null;
  paymentRef: string | null;
  bulletins: number;
  totalBrut: number;
  totalNet: number;
  totalImpots: number;
  totalCotisations: number;
}

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");
const aujourdhui = () => new Date().toISOString().slice(0, 10);

export function HistoriquePaie({ clientId, version = 0, onChange }: { clientId: string | null; version?: number; onChange?: () => void }) {
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [paiement, setPaiement] = useState<{ id: string; date: string; mode: string; ref: string } | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(async () => {
    if (!clientId) return [] as Periode[];
    try {
      const d = await (await fetch(`/api/payroll/periodes?clientId=${clientId}`)).json();
      return (d.periodes ?? []) as Periode[];
    } catch {
      return [] as Periode[];
    }
  }, [clientId]);

  useEffect(() => {
    let actif = true;
    void charger().then((p) => { if (actif) setPeriodes(p); });
    return () => { actif = false; };
  }, [charger, version]);

  const rafraichir = async () => { setPeriodes(await charger()); onChange?.(); };

  const marquerPayee = async () => {
    if (!paiement) return;
    setEnCours(paiement.id);
    try {
      const res = await fetch(`/api/payroll/periodes/${paiement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paidAt: paiement.date, paymentMode: paiement.mode, paymentRef: paiement.ref || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Enregistrement impossible"); return; }
      toast.success("Paie marquée payée");
      setPaiement(null);
      await rafraichir();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setEnCours(null);
    }
  };

  const annulerPaiement = async (p: Periode) => {
    if (!confirm(`Annuler le constat de paiement de « ${p.periodName} » ? La période redevient « validée ».`)) return;
    setEnCours(p.id);
    try {
      const res = await fetch(`/api/payroll/periodes/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "VALIDATED" }) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Annulation impossible"); return; }
      toast.success("Constat de paiement annulé");
      await rafraichir();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setEnCours(null);
    }
  };

  const annulerPeriode = async (p: Periode) => {
    if (!confirm(`Annuler la paie « ${p.periodName} » (${p.bulletins} bulletins) ? Les bulletins seront supprimés ; vous pourrez revalider la période après correction.`)) return;
    setEnCours(p.id);
    try {
      const res = await fetch(`/api/payroll/periodes/${p.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Annulation impossible"); return; }
      toast.success("Période annulée");
      await rafraichir();
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setEnCours(null);
    }
  };

  if (!clientId || periodes.length === 0) return null;

  const lien = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold";

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
      <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
        <History className="w-4 h-4 text-blue-400" /> Périodes de paie
      </h3>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/5">
              <th className="py-2 pr-3">Période</th>
              <th className="py-2 pr-3 text-right">Bulletins</th>
              <th className="py-2 pr-3 text-right">Brut</th>
              <th className="py-2 pr-3 text-right">Net</th>
              <th className="py-2 pr-3 text-right">Impôts</th>
              <th className="py-2 pr-3 text-right">Cotisations</th>
              <th className="py-2">Documents</th>
              <th className="py-2 text-right">Règlement</th>
            </tr>
          </thead>
          <tbody>
            {periodes.map((p) => {
              const payee = p.status === "PAID";
              const occupe = enCours === p.id;
              return (
                <tr key={p.id} className="border-b border-white/5 align-top">
                  <td className="py-2 pr-3">
                    <p className="font-bold text-white capitalize">{p.periodName}</p>
                    {payee ? (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Payée le {new Date(p.paidAt ?? p.createdAt).toLocaleDateString("fr-FR")}
                        {p.paymentMode && ` · ${MODES_PAIEMENT[p.paymentMode] ?? p.paymentMode}`}
                        {p.paymentRef && ` · réf. ${p.paymentRef}`}
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-400">Validée le {new Date(p.createdAt).toLocaleDateString("fr-FR")} · paiement en attente</p>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{p.bulletins}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(p.totalBrut)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums font-bold text-white">{fmt(p.totalNet)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(p.totalImpots)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(p.totalCotisations)}</td>
                  <td className="py-2 whitespace-nowrap">
                    <a href={`/payroll/bulletins/${p.id}`} target="_blank" rel="noopener" title="Imprimer les bulletins (PDF)" className={cn(lien, "text-primary hover:bg-primary/10")}>
                      <FileText className="w-4 h-4" /> Bulletins
                    </a>
                    <a href={`/payroll/declarations/${p.id}`} target="_blank" rel="noopener" title="Bordereaux de déclarations sociales et fiscales pré-remplis" className={cn(lien, "text-primary hover:bg-primary/10")}>
                      <Landmark className="w-4 h-4" /> Déclarations
                    </a>
                    <a href={`/api/payroll/periodes/${p.id}/ordre-paiement?format=xlsx`} title="Ordre de paiement des salaires (banque / Mobile Money)" className={cn(lien, "text-slate-300 hover:bg-white/5")}>
                      <Banknote className="w-4 h-4" /> Ordre de paiement
                    </a>
                    <a href={`/api/payroll/periodes/${p.id}/export?format=xlsx`} title="Livre de paie Excel" className={cn(lien, "text-slate-300 hover:bg-white/5")}>
                      <FileSpreadsheet className="w-4 h-4" /> Livre de paie
                    </a>
                    <a href={`/api/payroll/periodes/${p.id}/export?format=csv`} title="Livre de paie CSV" className={cn(lien, "text-slate-300 hover:bg-white/5")}>
                      CSV
                    </a>
                  </td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {occupe ? (
                      <Loader2 className="w-4 h-4 animate-spin inline text-slate-400" />
                    ) : payee ? (
                      <button type="button" onClick={() => annulerPaiement(p)} title="Annuler le constat de paiement" className={cn(lien, "text-slate-300 hover:bg-white/5")}>
                        <Undo2 className="w-4 h-4" /> Annuler le paiement
                      </button>
                    ) : (
                      <>
                        <button type="button" onClick={() => setPaiement({ id: p.id, date: aujourdhui(), mode: "VIREMENT", ref: "" })} className={cn(lien, "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25")}>
                          <CheckCircle2 className="w-4 h-4" /> Marquer payée
                        </button>
                        <button type="button" onClick={() => annulerPeriode(p)} title="Annuler la période pour la revalider" className={cn(lien, "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paiement && (
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-white text-sm">Constater le paiement — {periodes.find((p) => p.id === paiement.id)?.periodName}</p>
            <button type="button" onClick={() => setPaiement(null)} aria-label="Fermer" className="p-1.5 rounded-lg text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-[11px] text-slate-400">
            Aucun virement n&apos;est émis par Cabinet 360 : exportez l&apos;ordre de paiement, exécutez-le auprès de la banque ou de l&apos;opérateur, puis constatez ici le règlement.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400">
              Date de paiement
              <input type="date" value={paiement.date} onChange={(e) => setPaiement({ ...paiement, date: e.target.value })} className="mt-1 w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            </label>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400">
              Mode de paiement
              <select value={paiement.mode} onChange={(e) => setPaiement({ ...paiement, mode: e.target.value })} className="mt-1 w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                {Object.entries(MODES_PAIEMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400">
              Référence (facultatif)
              <input value={paiement.ref} onChange={(e) => setPaiement({ ...paiement, ref: e.target.value })} placeholder="N° d'ordre, lot Wave…" className="mt-1 w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPaiement(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5">Annuler</button>
            <button type="button" onClick={marquerPayee} disabled={enCours !== null || !paiement.date} className={cn("px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5", enCours && "opacity-60")}>
              {enCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Confirmer le paiement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
