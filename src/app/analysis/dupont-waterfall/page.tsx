"use client";

import { useState } from "react";
import {
  genererRapportDuPontCashflow,
  calculerDuPont,
  type InputDuPont,
  type RapportDuPontCashflow,
} from "@/lib/ohada/dupont-cash-waterfall";

const INPUT_DEMO: InputDuPont = {
  exercice: 2024,
  resultatNet_XOF: 48_000_000,
  chiffreAffaires_XOF: 400_000_000,
  totalActif_XOF: 350_000_000,
  capitauxPropres_XOF: 120_000_000,
  exerciceN1: 2023,
  resultatNetN1_XOF: 32_000_000,
  chiffreAffairesN1_XOF: 380_000_000,
  totalActifN1_XOF: 340_000_000,
  capitauxPropresN1_XOF: 115_000_000,
};

const ALERTE_CONFIG = {
  SECURISE: { couleur: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icone: "🟢" },
  VIGILANCE: { couleur: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icone: "🟠" },
  CRITIQUE: { couleur: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icone: "🔴" },
  INSOLVABLE: { couleur: "text-rose-500", bg: "bg-rose-500/20 border-rose-500/50", icone: "💀" },
};

export default function DuPontCashWaterfallPage() {
  const [raisonSociale, setRaisonSociale] = useState("SAHEL INDUSTRIES SA");
  const [input, setInput] = useState<InputDuPont>(INPUT_DEMO);
  const [ebe, setEbe] = useState(95_000_000);
  const [variationBFR, setVariationBFR] = useState(-15_000_000);
  const [investissements, setInvestissements] = useState(30_000_000);
  const [emprunts, setEmprunts] = useState(20_000_000);
  const [impots, setImpots] = useState(8_000_000);
  const [tresorerie, setTresorerie] = useState(55_000_000);
  const [burn, setBurn] = useState(7_500_000);
  const [rapport, setRapport] = useState<RapportDuPontCashflow | null>(() =>
    genererRapportDuPontCashflow("SAHEL INDUSTRIES SA", INPUT_DEMO, 95_000_000, -15_000_000, 30_000_000, 20_000_000, 8_000_000, 55_000_000, 7_500_000)
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dupont" | "waterfall" | "runway">("dupont");

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/analysis/dupont-waterfall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ societeRaisonSociale: raisonSociale, inputDuPont: input, ebe_XOF: ebe, variationBFR_XOF: variationBFR, investissements_XOF: investissements, remboursementsEmprunts_XOF: emprunts, impots_XOF: impots, tresorerieActuelle_XOF: tresorerie, burnMensuel_XOF: burn }),
      });
      if (res.ok) setRapport(await res.json());
      else setRapport(genererRapportDuPontCashflow(raisonSociale, input, ebe, variationBFR, investissements, emprunts, impots, tresorerie, burn));
    } catch {
      setRapport(genererRapportDuPontCashflow(raisonSociale, input, ebe, variationBFR, investissements, emprunts, impots, tresorerie, burn));
    } finally {
      setLoading(false);
    }
  };

  const numInput = (label: string, val: number, setter: (v: number) => void) => (
    <div>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <input type="number" value={val} onChange={(e) => setter(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-violet-400 font-semibold mb-1">
          <span>Fathom / Syft Standard</span><span>•</span><span>DuPont ROE Decomposition</span><span>•</span><span>Cash Waterfall</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Cockpit DuPont & Cash Waterfall</h1>
        <p className="text-sm text-slate-400 mt-1">
          Décomposition ROE DuPont (Marge × Rotation × Levier), Waterfall de trésorerie EBE→net, Cash Runway en mois
        </p>
      </div>

      <form onSubmit={handleCalculer} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
            <input type="text" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Exercice</label>
            <input type="number" value={input.exercice} onChange={(e) => setInput({ ...input, exercice: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {numInput("Résultat Net (XOF)", input.resultatNet_XOF, (v) => setInput({ ...input, resultatNet_XOF: v }))}
          {numInput("Chiffre d'Affaires (XOF)", input.chiffreAffaires_XOF, (v) => setInput({ ...input, chiffreAffaires_XOF: v }))}
          {numInput("Total Actif (XOF)", input.totalActif_XOF, (v) => setInput({ ...input, totalActif_XOF: v }))}
          {numInput("Capitaux Propres (XOF)", input.capitauxPropres_XOF, (v) => setInput({ ...input, capitauxPropres_XOF: v }))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {numInput("EBE (XOF)", ebe, setEbe)}
          {numInput("Variation BFR (XOF, négatif=dégradation)", variationBFR, setVariationBFR)}
          {numInput("Investissements/Capex (XOF)", investissements, setInvestissements)}
          {numInput("Remboursements emprunts (XOF)", emprunts, setEmprunts)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {numInput("IS / IMF (XOF)", impots, setImpots)}
          {numInput("Trésorerie actuelle (XOF)", tresorerie, setTresorerie)}
          {numInput("Burn mensuel (XOF/mois)", burn, setBurn)}
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-violet-950/50">
          {loading ? "Calcul en cours..." : "Calculer DuPont & Waterfall"}
        </button>
      </form>

      {rapport && (
        <>
          {/* Synthèse */}
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-5">
            <p className="text-sm text-slate-300">{rapport.syntheseStrategique}</p>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-slate-800 gap-1">
            {(["dupont", "waterfall", "runway"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition ${activeTab === tab ? "border-violet-400 text-violet-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                {tab === "dupont" ? "🌳 Arbre DuPont" : tab === "waterfall" ? "💧 Cash Waterfall" : "⏱ Cash Runway"}
              </button>
            ))}
          </div>

          {/* Arbre DuPont */}
          {activeTab === "dupont" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "ROE", val: `${rapport.decompositionDuPont.roe_pct}%`, sub: rapport.decompositionDuPont.roeN1_pct !== undefined ? `N-1 : ${rapport.decompositionDuPont.roeN1_pct}%` : "", delta: rapport.decompositionDuPont.deltaRoe_pts, color: "text-violet-400", big: true },
                  { label: "Marge Nette", val: `${rapport.decompositionDuPont.margeNette_pct}%`, sub: "Résultat / CA", color: "text-blue-400" },
                  { label: "Rotation Actif", val: `${rapport.decompositionDuPont.rotationActif}x`, sub: "CA / Actif", color: "text-cyan-400" },
                  { label: "Levier Financier", val: `${rapport.decompositionDuPont.levierFinancier}x`, sub: "Actif / Capitaux propres", color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.label} className={`bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center ${item.big ? "border-violet-500/40 bg-violet-500/10" : ""}`}>
                    <div className={`font-black ${item.big ? "text-4xl" : "text-2xl"} ${item.color}`}>{item.val}</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
                    {item.delta !== undefined && (
                      <div className={`text-xs font-bold mt-2 ${item.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.delta >= 0 ? "▲" : "▼"} {Math.abs(item.delta).toFixed(1)} pts vs N-1
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Diagnostic DuPont</h3>
                <p className="text-sm text-slate-300">{rapport.decompositionDuPont.diagnosticDuPont}</p>
              </div>
            </div>
          )}

          {/* Waterfall */}
          {activeTab === "waterfall" && (
            <div className="space-y-3">
              {rapport.waterfall.etapes.map((etape, idx) => {
                const maxAbs = Math.max(...rapport.waterfall.etapes.map((e) => Math.abs(e.montant_XOF)));
                const largeur = maxAbs > 0 ? (Math.abs(etape.montant_XOF) / maxAbs) * 100 : 0;
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${etape.type === "TOTAL" ? "bg-violet-500/10 border-violet-500/30" : "bg-slate-900/60 border-slate-800"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${etape.type === "TOTAL" ? "text-violet-300" : etape.type === "POSITIF" ? "text-emerald-300" : "text-rose-300"}`}>
                        {etape.libelle}
                      </span>
                      <div className="text-right">
                        <span className={`font-bold font-mono text-sm ${etape.montant_XOF >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {etape.montant_XOF >= 0 ? "+" : ""}{etape.montant_XOF.toLocaleString("fr-FR")} XOF
                        </span>
                        <div className="text-xs text-slate-500 font-mono">Cumul : {etape.cumul_XOF.toLocaleString("fr-FR")}</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded h-2">
                      <div className={`h-2 rounded ${etape.montant_XOF >= 0 ? "bg-emerald-500" : "bg-rose-500"} ${etape.type === "TOTAL" ? "bg-violet-500" : ""}`}
                        style={{ width: `${largeur}%` }} />
                    </div>
                    {etape.commentaire && <p className="text-xs text-slate-500 mt-1">{etape.commentaire}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Cash Runway */}
          {activeTab === "runway" && (() => {
            const cfg = ALERTE_CONFIG[rapport.cashRunway.alerteNiveau];
            return (
              <div className="space-y-6">
                <div className={`rounded-2xl border p-8 text-center ${cfg.bg}`}>
                  <div className="text-6xl mb-4">{cfg.icone}</div>
                  <div className={`text-5xl font-black ${cfg.couleur}`}>{rapport.cashRunway.runwayMois} mois</div>
                  <div className="text-slate-300 text-lg mt-2">({rapport.cashRunway.runwayJours} jours)</div>
                  <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.couleur}`}>
                    {rapport.cashRunway.alerteNiveau}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xl font-black text-emerald-400">{rapport.cashRunway.tresorerieActuelle_XOF.toLocaleString("fr-FR")}</div>
                    <div className="text-xs text-slate-400 mt-1">Trésorerie disponible (XOF)</div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-xl font-black text-rose-400">{rapport.cashRunway.fluxMensuelNegatif_XOF.toLocaleString("fr-FR")}</div>
                    <div className="text-xs text-slate-400 mt-1">Burn mensuel (XOF/mois)</div>
                  </div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Diagnostic Cash Runway</h3>
                  <p className="text-sm text-slate-300">{rapport.cashRunway.narratifRunway}</p>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
