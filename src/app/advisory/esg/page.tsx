"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type InputESG,
  type RapportESG,
  genererRapportESG,
} from "@/lib/ohada/reporting-esg";

const DEFAULT_INPUT: InputESG = {
  raisonSociale: "SOCIÉTÉ AGRO-INDUSTRIELLE DU SAHEL SA",
  exercice: 2024,
  pays: "SN",
  ca_XOF: 2_500_000_000,
  effectifTotal: 150,
  consommationCarburantLitres: 45_000,
  consommationElectriciteKWh: 180_000,
  achatEnergieMWh: 20,
  nbContratsFormels: 135,
  nbFemmes: 55,
  nbAffiliesSante: 140,
  accidentsWork: 1,
  masseSalariale_XOF: 450_000_000,
  lcbftConforme: true,
  registreBeneficiairesEffectifs: true,
  administrateursIndependants_pct: 25,
  comiteAudit: true,
  codeEthiqueAdopte: true,
};

export default function ESGReportingPage() {
  const [form, setForm] = useState<InputESG>(DEFAULT_INPUT);
  const [rapport, setRapport] = useState<RapportESG | null>(() => genererRapportESG(DEFAULT_INPUT));
  const [loading, setLoading] = useState(false);

  const handleCalculer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/advisory/esg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        // Fallback local
        setRapport(genererRapportESG(form));
      }
    } catch {
      setRapport(genererRapportESG(form));
    } finally {
      setLoading(false);
    }
  };

  const getMaturiteBadge = (maturite: string) => {
    switch (maturite) {
      case "LEADER":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "AVANCE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "EN_PROGRESSION":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            <span>IFRS S1 / IFRS S2</span>
            <span>•</span>
            <span>Directive GIABA / OHADA</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Rapport ESG & Durabilité Extra-Financière
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bilan Carbone Scopes 1 & 2, Normes Sociales UEMOA, Gouvernance LCB-FT & Transparence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/advisory/due-diligence"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            ← Due Diligence M&A
          </Link>
          <Link
            href="/advisory/evaluation"
            className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            Évaluation DCF →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulaire de saisie */}
        <form onSubmit={handleCalculer} className="lg:col-span-5 space-y-6">
          {/* Identité */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              1. Périmètre & Profil Entité
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
                <input
                  type="text"
                  value={form.raisonSociale}
                  onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Exercice</label>
                  <input
                    type="number"
                    value={form.exercice}
                    onChange={(e) => setForm({ ...form, exercice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pays UEMOA / CEMAC</label>
                  <select
                    value={form.pays}
                    onChange={(e) => setForm({ ...form, pays: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="SN">Sénégal (SN)</option>
                    <option value="CI">Côte d'Ivoire (CI)</option>
                    <option value="CM">Cameroun (CM)</option>
                    <option value="BJ">Bénin (BJ)</option>
                    <option value="TG">Togo (TG)</option>
                    <option value="BF">Burkina Faso (BF)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Chiffre d'Affaires (XOF)</label>
                  <input
                    type="number"
                    value={form.ca_XOF}
                    onChange={(e) => setForm({ ...form, ca_XOF: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Effectif Total</label>
                  <input
                    type="number"
                    value={form.effectifTotal}
                    onChange={(e) => setForm({ ...form, effectifTotal: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pilier Environnemental */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>2. Pilier E — Climat & Carbone</span>
              <span className="text-xs text-slate-500 font-normal">IFRS S2</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Carburant (Litres gasoil/essence - Scope 1)
                </label>
                <input
                  type="number"
                  value={form.consommationCarburantLitres}
                  onChange={(e) => setForm({ ...form, consommationCarburantLitres: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Électricité réseau (kWh)</label>
                  <input
                    type="number"
                    value={form.consommationElectriciteKWh}
                    onChange={(e) => setForm({ ...form, consommationElectriciteKWh: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Énergie achetée (MWh - Scope 2)</label>
                  <input
                    type="number"
                    value={form.achatEnergieMWh || 0}
                    onChange={(e) => setForm({ ...form, achatEnergieMWh: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pilier Social */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              3. Pilier S — Social & Capital Humain
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Contrats écrits formels</label>
                <input
                  type="number"
                  value={form.nbContratsFormels}
                  onChange={(e) => setForm({ ...form, nbContratsFormels: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Femmes dans effectif</label>
                <input
                  type="number"
                  value={form.nbFemmes}
                  onChange={(e) => setForm({ ...form, nbFemmes: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Affiliés IPRES/CNPS/CSS</label>
                <input
                  type="number"
                  value={form.nbAffiliesSante}
                  onChange={(e) => setForm({ ...form, nbAffiliesSante: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Accidents du travail (AT)</label>
                <input
                  type="number"
                  value={form.accidentsWork}
                  onChange={(e) => setForm({ ...form, accidentsWork: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Pilier Gouvernance */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
              4. Pilier G — Gouvernance & Éthique
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.lcbftConforme}
                  onChange={(e) => setForm({ ...form, lcbftConforme: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Dispositif LCB-FT conforme (Directive GIABA 2023)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.registreBeneficiairesEffectifs}
                  onChange={(e) => setForm({ ...form, registreBeneficiairesEffectifs: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Registre des Bénéficiaires Effectifs tenu à jour</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.comiteAudit}
                  onChange={(e) => setForm({ ...form, comiteAudit: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Comité d'audit / Administrateur référent actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={form.codeEthiqueAdopte}
                  onChange={(e) => setForm({ ...form, codeEthiqueAdopte: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <span>Code d'éthique & politique anti-corruption validée</span>
              </label>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Administrateurs Indépendants</span>
                  <span>{form.administrateursIndependants_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.administrateursIndependants_pct}
                  onChange={(e) => setForm({ ...form, administrateursIndependants_pct: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            {loading ? "Génération..." : "Calculer & Évaluer le Score ESG"}
          </button>
        </form>

        {/* Dashboard de Restitution */}
        <div className="lg:col-span-7 space-y-6">
          {rapport && (
            <>
              {/* Score Global Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left space-y-1">
                    <span className="text-xs uppercase font-medium text-slate-400">Score Global ESG</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{rapport.scoreESG.global}</span>
                      <span className="text-lg text-slate-500 font-semibold">/ 100</span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getMaturiteBadge(rapport.niveauMaturite)}`}>
                      Maturité : {rapport.niveauMaturite}
                    </span>
                  </div>

                  {/* Détail E-S-G */}
                  <div className="w-full md:w-64 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-emerald-400">Environnement (E)</span>
                        <span>{rapport.scoreESG.E}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rapport.scoreESG.E}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-blue-400">Social (S)</span>
                        <span>{rapport.scoreESG.S}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${rapport.scoreESG.S}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-purple-400">Gouvernance (G)</span>
                        <span>{rapport.scoreESG.G}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${rapport.scoreESG.G}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bilan Carbone Scopes 1 & 2 */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-semibold text-slate-200 text-sm">
                    Bilan Émissions Carbone (GHG Protocol & IFRS S2)
                  </h3>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    Mix énergétique UEMOA
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Scope 1 (Carburant)</span>
                    <span className="text-lg font-bold text-white">{rapport.bilanCarbone.scope1Carburant_tCO2}</span>
                    <span className="text-[10px] text-slate-500 block">tCO2e</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Scope 1 (Électricité)</span>
                    <span className="text-lg font-bold text-white">{rapport.bilanCarbone.scope1Electricite_tCO2}</span>
                    <span className="text-[10px] text-slate-500 block">tCO2e</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-400 block mb-1">Scope 2 (Achats)</span>
                    <span className="text-lg font-bold text-white">{rapport.bilanCarbone.scope2Achats_tCO2}</span>
                    <span className="text-[10px] text-slate-500 block">tCO2e</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-emerald-400 block mb-1">Intensité Carbone</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {rapport.bilanCarbone.intensiteCarbone_tCO2parM_XOF}
                    </span>
                    <span className="text-[10px] text-slate-500 block">tCO2 / M XOF CA</span>
                  </div>
                </div>
              </div>

              {/* Indicateurs Sociaux & Gouvernance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                    KPIs Sociaux UEMOA
                  </h4>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Contrats formels</span>
                    <span className="font-semibold text-white">{rapport.indicateursSociaux.tauxContratsFormels_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Taux parité F/H</span>
                    <span className="font-semibold text-white">{rapport.indicateursSociaux.tauxPariteHF_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Couverture IPRES/CNPS</span>
                    <span className="font-semibold text-white">{rapport.indicateursSociaux.tauxCouvertureSante_pct}%</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Accidents de travail</span>
                    <span className={`font-semibold ${rapport.indicateursSociaux.accidentsWork > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {rapport.indicateursSociaux.accidentsWork}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                    Gouvernance & Conformité
                  </h4>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Conformité GIABA LCB-FT</span>
                    <span className={rapport.indicateursGouvernance.lcbftConforme ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                      {rapport.indicateursGouvernance.lcbftConforme ? "Conforme" : "Non-conforme"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Bénéficiaires Effectifs</span>
                    <span className={rapport.indicateursGouvernance.registreBeneficiairesEffectifs ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                      {rapport.indicateursGouvernance.registreBeneficiairesEffectifs ? "Déclarés" : "Manquant"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Comité d'Audit</span>
                    <span className={rapport.indicateursGouvernance.comiteAudit ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                      {rapport.indicateursGouvernance.comiteAudit ? "Opérationnel" : "Non constitué"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-slate-400">Administrateurs indép.</span>
                    <span className="font-semibold text-white">{rapport.indicateursGouvernance.administrateursIndependants_pct}%</span>
                  </div>
                </div>
              </div>

              {/* Recommandations Stratégiques */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <span>Recommandations d'Amélioration & Feuille de Route</span>
                  <span className="text-xs text-slate-500 font-normal">({rapport.referentielIFRS})</span>
                </h3>
                {rapport.recommandations.length === 0 ? (
                  <p className="text-xs text-emerald-400">
                    Excellente conformité ! Aucun écart critique relevé sur les 3 piliers.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {rapport.recommandations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
