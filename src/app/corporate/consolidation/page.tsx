"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, FileSpreadsheet, Building2, Calculator, CheckCircle2, ChevronRight, Upload, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceLine {
  id: string;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
}

interface Entity {
  id: string;
  name: string;
  rccm: string | null;
  country: string | null;
  balanceLines: BalanceLine[];
}

// Parse un CSV de balance ("compte;libelle;debit;credit", en-tête optionnel).
// Accepte ; ou , comme séparateur. Les lignes sans compte sont ignorées.
function parseBalanceCSV(texte: string): { compte: string; libelle: string; debit: number; credit: number }[] {
  const lignes = texte.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sep = lignes[0]?.includes(";") ? ";" : ",";
  return lignes
    .map((ligne) => ligne.split(sep).map((c) => c.trim()))
    .filter((cols) => cols.length >= 3 && cols[0] && !/^compte$/i.test(cols[0]))
    .map((cols) => ({
      compte: cols[0],
      libelle: cols[1] ?? "",
      debit: parseFloat((cols[2] ?? "0").replace(",", ".")) || 0,
      credit: parseFloat((cols[3] ?? "0").replace(",", ".")) || 0,
    }));
}

interface Elimination {
  id: string;
  type: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  buyerEntity: Entity | null;
  sellerEntity: Entity | null;
}

export default function ConsolidationPage() {
  const [step, setStep] = useState(1);
  const [group, setGroup] = useState<{ id: string; entities: Entity[]; eliminations: Elimination[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [entityForm, setEntityForm] = useState({ name: "", rccm: "", country: "" });
  const [showAddElimination, setShowAddElimination] = useState(false);
  const [elimForm, setElimForm] = useState({ type: "Ventes/Achats", buyerEntityId: "", sellerEntityId: "", debitAccount: "", creditAccount: "", amount: "" });
  const [importEnCours, setImportEnCours] = useState<string | null>(null);
  const [importErreur, setImportErreur] = useState<string | null>(null);

  const loadGroup = () => {
    fetch("/api/corporate/consolidation")
      .then(res => res.json())
      .then(data => setGroup(data.group))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGroup(); }, []);

  const addEntity = async () => {
    if (!entityForm.name || !group) return;
    await fetch("/api/corporate/consolidation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group.id, ...entityForm }),
    });
    setShowAddEntity(false);
    setEntityForm({ name: "", rccm: "", country: "" });
    loadGroup();
  };

  const addElimination = async () => {
    if (!elimForm.debitAccount || !elimForm.creditAccount || !elimForm.amount || !group) return;
    await fetch("/api/corporate/consolidation/eliminations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: group.id, ...elimForm }),
    });
    setShowAddElimination(false);
    setElimForm({ type: "Ventes/Achats", buyerEntityId: "", sellerEntityId: "", debitAccount: "", creditAccount: "", amount: "" });
    loadGroup();
  };

  const removeElimination = async (id: string) => {
    await fetch(`/api/corporate/consolidation/eliminations?id=${id}`, { method: "DELETE" });
    loadGroup();
  };

  const importerBalance = async (entityId: string, file: File) => {
    setImportEnCours(entityId);
    setImportErreur(null);
    try {
      const texte = await file.text();
      const lignes = parseBalanceCSV(texte);
      if (lignes.length === 0) {
        setImportErreur("Aucune ligne exploitable dans ce fichier (format attendu : compte;libellé;débit;crédit).");
        return;
      }
      const res = await fetch("/api/corporate/consolidation/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId, lines: lignes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setImportErreur(data.error || "Échec de l'import.");
        return;
      }
      loadGroup();
    } catch (e) {
      console.error("Import de balance :", e);
      setImportErreur("Impossible de lire ce fichier.");
    } finally {
      setImportEnCours(null);
    }
  };

  if (loading || !group) {
    return <div className="p-8 text-slate-400">Chargement…</div>;
  }

  const totalEliminations = group.eliminations.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="page-title flex items-center gap-3">
            <Layers className="w-6 h-6 text-indigo-500" /> Consolidation Multi-Sociétés
          </h2>
          <p className="page-subtitle">Périmètre de consolidation et éliminations intra-groupe réels</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-xl shadow-2xl relative">
        <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
        <div className="absolute top-1/2 left-10 h-1 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

        {[
          { num: 1, label: "Périmètre", icon: Building2 },
          { num: 2, label: "Balances", icon: Upload },
          { num: 3, label: "Éliminations", icon: FileSpreadsheet },
          { num: 4, label: "Synthèse", icon: Calculator }
        ].map(s => (
          <div key={s.num} className="relative z-10 flex flex-col items-center">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all",
              step > s.num ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
              step === s.num ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-110" :
              "bg-slate-800 text-slate-500 border border-slate-700"
            )}>
              {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
            </div>
            <p className={cn("text-xs font-bold mt-3 uppercase tracking-widest absolute top-12 whitespace-nowrap", step === s.num ? "text-indigo-400" : "text-slate-500")}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl mt-8 min-h-[400px]">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Périmètre de consolidation</h3>
              <button onClick={() => setShowAddEntity(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">+ Ajouter une entité</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.entities.map(entity => (
                <div key={entity.id} className="p-4 rounded-2xl border bg-slate-800/30 border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{entity.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{entity.rccm || "RCCM non renseigné"} • {entity.country || "—"}</p>
                  </div>
                </div>
              ))}
              {group.entities.length === 0 && (
                <p className="text-sm text-slate-500 col-span-2">Aucune entité dans le périmètre. Ajoutez-en une pour commencer.</p>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h3 className="text-xl font-black text-white mb-6">Importation des balances</h3>
            <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300">
                Format attendu : CSV avec colonnes <code className="font-mono">compte;libellé;débit;crédit</code> (en-tête optionnel).
                La synthèse à l&apos;étape 4 agrège les balances importées par compte et déduit les éliminations, mais ne produit pas
                un bilan/compte de résultat consolidé mis en forme SYSCOHADA — c&apos;est une balance consolidée avant retraitements.
              </p>
            </div>
            {importErreur && <p className="text-sm text-red-400 mb-4">{importErreur}</p>}
            <div className="space-y-4">
              {group.entities.map(entity => (
                <div key={entity.id} className="p-6 bg-slate-800/30 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{entity.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {entity.balanceLines.length > 0 ? `${entity.balanceLines.length} comptes importés` : "Balance N (SYSCOHADA) — aucun import"}
                    </p>
                  </div>
                  <label className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors",
                    importEnCours === entity.id ? "bg-slate-700 text-slate-400" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  )}>
                    <Upload className="w-4 h-4" /> {importEnCours === entity.id ? "Import…" : "Parcourir CSV"}
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      disabled={importEnCours !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) importerBalance(entity.id, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              ))}
              {group.entities.length === 0 && (
                <p className="text-sm text-slate-500">Ajoutez d&apos;abord des entités à l&apos;étape 1.</p>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Éliminations des opérations intra-groupe</h3>
              <button onClick={() => setShowAddElimination(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">+ Ajouter Élimination</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acheteur</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vendeur</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Compte D.</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Compte C.</th>
                    <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Montant (FCFA)</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {group.eliminations.map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/30">
                      <td className="py-4 text-sm text-slate-300">{e.type}</td>
                      <td className="py-4 text-sm font-bold text-white">{e.buyerEntity?.name || "—"}</td>
                      <td className="py-4 text-sm font-bold text-white">{e.sellerEntity?.name || "—"}</td>
                      <td className="py-4 text-xs font-mono text-indigo-400">{e.debitAccount}</td>
                      <td className="py-4 text-xs font-mono text-indigo-400">{e.creditAccount}</td>
                      <td className="py-4 text-sm font-black text-right text-white">{e.amount.toLocaleString()}</td>
                      <td className="py-4 text-right"><button onClick={() => removeElimination(e.id)} className="text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                  {group.eliminations.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-slate-500">Aucune élimination enregistrée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {step === 4 && (() => {
          const toutesLignes = group.entities.flatMap((e) => e.balanceLines);
          const parCompte = new Map<string, { libelle: string; debit: number; credit: number }>();
          for (const l of toutesLignes) {
            const entree = parCompte.get(l.compte) ?? { libelle: l.libelle, debit: 0, credit: 0 };
            entree.debit += l.debit;
            entree.credit += l.credit;
            if (!entree.libelle) entree.libelle = l.libelle;
            parCompte.set(l.compte, entree);
          }
          // Deduction des eliminations : chaque elimination retranche son montant
          // du compte debit et du compte credit qu'elle vise, dans la balance agregee.
          for (const e of group.eliminations) {
            const d = parCompte.get(e.debitAccount);
            if (d) d.debit = Math.max(0, d.debit - e.amount);
            const c = parCompte.get(e.creditAccount);
            if (c) c.credit = Math.max(0, c.credit - e.amount);
          }
          const comptesConsolides = Array.from(parCompte.entries())
            .map(([compte, v]) => ({ compte, ...v }))
            .sort((a, b) => a.compte.localeCompare(b.compte));
          const totalDebit = comptesConsolides.reduce((s, c) => s + c.debit, 0);
          const totalCredit = comptesConsolides.reduce((s, c) => s + c.credit, 0);

          return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div>
              <h3 className="text-xl font-black text-white">Balance consolidée (avant retraitements)</h3>
              <p className="text-sm text-slate-400 mt-1">
                {toutesLignes.length > 0
                  ? "Agrégation par compte des balances importées, éliminations intra-groupe déduites. Ne constitue pas un bilan/compte de résultat SYSCOHADA mis en forme."
                  : "Aucune balance importée (voir étape 2) : cette synthèse ne montre pour l'instant que les éliminations saisies."}
              </p>
            </div>

            {comptesConsolides.length > 0 && (
              <div className="bg-slate-950/50 rounded-2xl border border-white/5 p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Compte</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Libellé</th>
                      <th className="pb-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">Débit</th>
                      <th className="pb-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">Crédit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comptesConsolides.map((c) => (
                      <tr key={c.compte}>
                        <td className="py-3 text-xs font-mono text-indigo-400">{c.compte}</td>
                        <td className="py-3 text-sm text-slate-300">{c.libelle || "—"}</td>
                        <td className="py-3 text-sm text-right font-mono text-white">{c.debit.toLocaleString()}</td>
                        <td className="py-3 text-sm text-right font-mono text-white">{c.credit.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-white/10">
                      <td className="py-3 text-sm font-black text-white" colSpan={2}>TOTAL</td>
                      <td className="py-3 text-sm text-right font-black text-white">{totalDebit.toLocaleString()}</td>
                      <td className="py-3 text-sm text-right font-black text-white">{totalCredit.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">Éliminations intra-groupe</h4>
              <div className="bg-slate-950/50 rounded-2xl border border-white/5 p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 text-xs font-black text-white">Type</th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Comptes</th>
                      <th className="pb-3 text-[10px] font-black text-red-400 uppercase tracking-widest text-right">Montant Éliminé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {group.eliminations.map(e => (
                      <tr key={e.id}>
                        <td className="py-3 text-sm text-slate-300">{e.type}</td>
                        <td className="py-3 text-xs font-mono text-indigo-400">{e.debitAccount} / {e.creditAccount}</td>
                        <td className="py-3 text-sm text-right text-red-400">-{e.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-white/10">
                      <td className="py-3 text-sm font-black text-white" colSpan={2}>TOTAL ÉLIMINÉ</td>
                      <td className="py-3 text-sm text-right font-black text-red-400">-{totalEliminations.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
          );
        })()}

        <div className="mt-8 flex justify-end gap-4">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors">Précédent</button>
          )}
          {step < 4 && (
            <button onClick={() => setStep(step + 1)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors shadow-lg flex items-center gap-2">
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showAddEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Ajouter une entité</h3>
              <button onClick={() => setShowAddEntity(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Nom de l'entité" value={entityForm.name} onChange={e => setEntityForm({ ...entityForm, name: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              <input placeholder="RCCM" value={entityForm.rccm} onChange={e => setEntityForm({ ...entityForm, rccm: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              <input placeholder="Pays" value={entityForm.country} onChange={e => setEntityForm({ ...entityForm, country: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              <button onClick={addEntity} disabled={!entityForm.name} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs">Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {showAddElimination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Nouvelle élimination</h3>
              <button onClick={() => setShowAddElimination(false)} className="text-slate-400 hover:text-white p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Type (ex: Ventes/Achats)" value={elimForm.type} onChange={e => setElimForm({ ...elimForm, type: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              <select value={elimForm.buyerEntityId} onChange={e => setElimForm({ ...elimForm, buyerEntityId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                <option value="">Acheteur (optionnel)</option>
                {group.entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <select value={elimForm.sellerEntityId} onChange={e => setElimForm({ ...elimForm, sellerEntityId: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                <option value="">Vendeur (optionnel)</option>
                {group.entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Compte débit" value={elimForm.debitAccount} onChange={e => setElimForm({ ...elimForm, debitAccount: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
                <input placeholder="Compte crédit" value={elimForm.creditAccount} onChange={e => setElimForm({ ...elimForm, creditAccount: e.target.value })} className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              </div>
              <input type="number" placeholder="Montant (FCFA)" value={elimForm.amount} onChange={e => setElimForm({ ...elimForm, amount: e.target.value })} className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" />
              <button onClick={addElimination} disabled={!elimForm.debitAccount || !elimForm.creditAccount || !elimForm.amount} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-widest text-xs">Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
