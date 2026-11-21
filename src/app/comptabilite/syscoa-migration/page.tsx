"use client";

import { useState } from "react";
import Link from "next/link";
import {
  migrerBalanceSYSCOA,
  type CompteSYSCOA,
  type RapportMigration,
} from "@/lib/ohada/syscoa-migration-engine";

const EXEMPLE_BALANCE_SYSCOA: CompteSYSCOA[] = [
  { numero: "101", libelle: "Capital social", solde_XOF: 100_000_000 },
  { numero: "111", libelle: "Prime d'émission", solde_XOF: 15_000_000 },
  { numero: "162", libelle: "Emprunts auprès des ét. de crédit", solde_XOF: 45_000_000 },
  { numero: "211", libelle: "Frais préliminaires", solde_XOF: 2_500_000 },
  { numero: "221", libelle: "Terrains agricoles", solde_XOF: 60_000_000 },
  { numero: "241", libelle: "Matériel industriel", solde_XOF: 35_000_000 },
  { numero: "311", libelle: "Marchandises A", solde_XOF: 28_000_000 },
  { numero: "411", libelle: "Clients ordinaires", solde_XOF: 38_500_000 },
  { numero: "421", libelle: "Personnel avances", solde_XOF: 4_200_000 },
  { numero: "521", libelle: "Banque locale", solde_XOF: 19_800_000 },
  { numero: "601", libelle: "Achats de matières", solde_XOF: 85_000_000 },
  { numero: "701", libelle: "Ventes de produits finis", solde_XOF: 210_000_000 },
  { numero: "999", libelle: "Compte non répertorié spécial", solde_XOF: 1_200_000 },
];

export default function SyscoaMigrationPage() {
  const [comptes, setComptes] = useState<CompteSYSCOA[]>(EXEMPLE_BALANCE_SYSCOA);
  const [nouveauNumero, setNouveauNumero] = useState("");
  const [nouveauLibelle, setNouveauLibelle] = useState("");
  const [nouveauSolde, setNouveauSolde] = useState<number | "">("");
  const [rapport, setRapport] = useState<RapportMigration | null>(() => {
    return migrerBalanceSYSCOA(EXEMPLE_BALANCE_SYSCOA);
  });
  const [loading, setLoading] = useState(false);

  const handleAjouterCompte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauNumero || !nouveauLibelle || nouveauSolde === "") return;
    const nouveauCompte: CompteSYSCOA = {
      numero: nouveauNumero.trim(),
      libelle: nouveauLibelle.trim(),
      solde_XOF: Number(nouveauSolde),
    };
    const miseAJour = [...comptes, nouveauCompte];
    setComptes(miseAJour);
    setNouveauNumero("");
    setNouveauLibelle("");
    setNouveauSolde("");
  };

  const handleSupprimerCompte = (index: number) => {
    const miseAJour = comptes.filter((_, i) => i !== index);
    setComptes(miseAJour);
  };

  const handleLancerMigration = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comptabilite/syscoa-migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comptes }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(migrerBalanceSYSCOA(comptes));
      }
    } catch {
      setRapport(migrerBalanceSYSCOA(comptes));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            <span>Transition Comptable UEMOA</span>
            <span>•</span>
            <span>SYSCOHADA Révisé 2017</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Migration Balance SYSCOA ➔ SYSCOHADA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reclassement automatisé des plans comptables antérieurs (SYSCOA pré-2001) vers le référentiel OHADA révisé
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/comptabilite/production"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Production Comptable
          </Link>
          <Link
            href="/liasse/mapping"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Mapping Balance ➔ Liasse →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne gauche : Saisie et balance source */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Ajouter un Compte SYSCOA
            </h2>
            <form onSubmit={handleAjouterCompte} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">N° Compte</label>
                  <input
                    type="text"
                    value={nouveauNumero}
                    onChange={(e) => setNouveauNumero(e.target.value)}
                    placeholder="ex: 411"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Intitulé SYSCOA</label>
                  <input
                    type="text"
                    value={nouveauLibelle}
                    onChange={(e) => setNouveauLibelle(e.target.value)}
                    placeholder="ex: Clients ordinaires"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Solde (XOF)</label>
                <input
                  type="number"
                  value={nouveauSolde}
                  onChange={(e) => setNouveauSolde(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="ex: 15000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                + Ajouter à la balance source
              </button>
            </form>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Balance Source SYSCOA ({comptes.length} comptes)
              </h3>
              <button
                type="button"
                onClick={handleLancerMigration}
                disabled={loading || comptes.length === 0}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition shadow-lg shadow-cyan-950/50"
              >
                {loading ? "Migration..." : "Lancer la Migration"}
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
              {comptes.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-cyan-400 shrink-0">{c.numero}</span>
                    <span className="text-slate-300 truncate">{c.libelle}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-slate-200">{c.solde_XOF.toLocaleString("fr-FR")} XOF</span>
                    <button
                      type="button"
                      onClick={() => handleSupprimerCompte(idx)}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite : Résultats du reclassement */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* KPIs de Migration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-medium text-slate-400 block">Comptes Traités</span>
                  <span className="text-xl font-black text-slate-100 mt-0.5 block">{rapport.totalComptes}</span>
                </div>
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-medium text-emerald-400 block">Reclassés Auto</span>
                  <span className="text-xl font-black text-emerald-400 mt-0.5 block">{rapport.comptesReclassesAuto}</span>
                </div>
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-medium text-amber-400 block">Manuel Requis</span>
                  <span className="text-xl font-black text-amber-400 mt-0.5 block">{rapport.comptesManuelRequis}</span>
                </div>
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-medium text-rose-400 block">Supprimés / Obs.</span>
                  <span className="text-xl font-black text-rose-400 mt-0.5 block">{rapport.comptesSupprimesOuFusionnes}</span>
                </div>
              </div>

              {/* Alertes de migration */}
              {rapport.alertesMigration.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    ⚠️ Alertes & Points d'Attention
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-300">
                    {rapport.alertesMigration.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tableau détaillé des reclassements */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Tableau de Reclassement SYSCOA ➔ SYSCOHADA
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Taux de conversion : {Math.round((rapport.comptesReclassesAuto / (rapport.totalComptes || 1)) * 100)}%
                  </span>
                </div>

                <div className="overflow-x-auto max-h-[460px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] sticky top-0">
                      <tr>
                        <th className="p-2.5">Source SYSCOA</th>
                        <th className="p-2.5">Cible SYSCOHADA</th>
                        <th className="p-2.5">Statut</th>
                        <th className="p-2.5 text-right">Solde XOF</th>
                        <th className="p-2.5">Note Technique</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {rapport.reclassements.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition">
                          <td className="p-2.5">
                            <span className="font-mono font-bold text-slate-300">{r.compteSource.numero}</span>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{r.compteSource.libelle}</div>
                          </td>
                          <td className="p-2.5">
                            <span className="font-mono font-bold text-cyan-400">{r.compteOHADA || "—"}</span>
                            <div className="text-[11px] text-slate-300 truncate max-w-xs">{r.libelleOHADA}</div>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                r.statutReclassement === "AUTOMATIQUE"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                  : r.statutReclassement === "MANUEL_REQUIS"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                  : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                              }`}
                            >
                              {r.statutReclassement === "AUTOMATIQUE"
                                ? "Auto"
                                : r.statutReclassement === "MANUEL_REQUIS"
                                ? "Manuel"
                                : "Supprimé"}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-right text-slate-200">
                            {r.compteSource.solde_XOF.toLocaleString("fr-FR")}
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-400 max-w-xs truncate">
                            {r.observation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
