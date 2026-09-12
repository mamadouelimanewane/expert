"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText, History } from "lucide-react";

/**
 * Périodes de paie validées d'un dossier, avec impression des bulletins et
 * export du livre de paie. Rien n'était consultable après validation : les
 * bulletins enregistrés ne pouvaient ni s'imprimer ni s'exporter.
 */

interface Periode {
  id: string;
  periodName: string;
  status: string;
  createdAt: string;
  bulletins: number;
  totalBrut: number;
  totalNet: number;
  totalImpots: number;
  totalCotisations: number;
}

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");

export function HistoriquePaie({ clientId, version = 0 }: { clientId: string | null; version?: number }) {
  const [periodes, setPeriodes] = useState<Periode[]>([]);

  useEffect(() => {
    let actif = true;
    const charger = async () => {
      if (!clientId) { if (actif) setPeriodes([]); return; }
      try {
        const d = await (await fetch(`/api/payroll/periodes?clientId=${clientId}`)).json();
        if (actif) setPeriodes(d.periodes ?? []);
      } catch {
        if (actif) setPeriodes([]);
      }
    };
    void charger();
    return () => { actif = false; };
  }, [clientId, version]);

  if (!clientId || periodes.length === 0) return null;

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
      <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
        <History className="w-4 h-4 text-blue-400" /> Périodes validées
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
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {periodes.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-2 pr-3">
                  <p className="font-bold text-white capitalize">{p.periodName}</p>
                  <p className="text-[11px] text-slate-400">{p.status === "PAID" ? "Payée" : "Validée"} le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</p>
                </td>
                <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{p.bulletins}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(p.totalBrut)}</td>
                <td className="py-2 pr-3 text-right tabular-nums font-bold text-white">{fmt(p.totalNet)}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(p.totalImpots)}</td>
                <td className="py-2 pr-3 text-right tabular-nums text-slate-300">{fmt(p.totalCotisations)}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <a href={`/payroll/bulletins/${p.id}`} target="_blank" rel="noopener" title="Imprimer les bulletins (PDF)" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10">
                    <FileText className="w-4 h-4" /> Bulletins
                  </a>
                  <a href={`/api/payroll/periodes/${p.id}/export?format=xlsx`} title="Livre de paie Excel" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/5">
                    <FileSpreadsheet className="w-4 h-4" /> Excel
                  </a>
                  <a href={`/api/payroll/periodes/${p.id}/export?format=csv`} title="Livre de paie CSV" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-white/5">
                    CSV
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
