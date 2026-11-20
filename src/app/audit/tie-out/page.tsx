"use client";

import { useState } from "react";
import Link from "next/link";
import {
  sceller,
  genererRapportTieOut,
  type SectionValidee,
  type LigneCloture,
  type RapportTieOut,
} from "@/lib/ohada/tie-out-integrite-cloture";

// Sections de démonstration — validées à la clôture
const SECTIONS_VALIDEES_DEMO: SectionValidee[] = [
  sceller("ACTIF_IMMOB", "BILAN — Actif immobilisé", "M. Amadou SOW, EC", "2024-11-28", [
    { compteOHADA: "211000", libelle: "Terrains", debit_XOF: 150_000_000, credit_XOF: 0 },
    { compteOHADA: "221000", libelle: "Bâtiments", debit_XOF: 85_000_000, credit_XOF: 0 },
    { compteOHADA: "241000", libelle: "Matériel de transport", debit_XOF: 32_000_000, credit_XOF: 0 },
  ]),
  sceller("ACTIF_CIRCULANT", "BILAN — Actif circulant", "M. Amadou SOW, EC", "2024-11-29", [
    { compteOHADA: "411000", libelle: "Clients", debit_XOF: 42_500_000, credit_XOF: 0 },
    { compteOHADA: "521000", libelle: "Banque CBAO", debit_XOF: 18_200_000, credit_XOF: 0 },
  ]),
  sceller("PASSIF", "BILAN — Passif", "Mme Fatou DIOP, EC", "2024-11-29", [
    { compteOHADA: "101000", libelle: "Capital social", debit_XOF: 0, credit_XOF: 200_000_000 },
    { compteOHADA: "401000", libelle: "Fournisseurs", debit_XOF: 0, credit_XOF: 35_000_000 },
  ]),
];

// Grand livre actuel : section ACTIF_IMMOB modifiée (terrain +15M)
const GRAND_LIVRE_ACTUEL: Map<string, LigneCloture[]> = new Map([
  ["ACTIF_IMMOB", [
    { compteOHADA: "211000", libelle: "Terrains", debit_XOF: 165_000_000, credit_XOF: 0 }, // ⚠ MODIFIÉ
    { compteOHADA: "221000", libelle: "Bâtiments", debit_XOF: 85_000_000, credit_XOF: 0 },
    { compteOHADA: "241000", libelle: "Matériel de transport", debit_XOF: 32_000_000, credit_XOF: 0 },
  ]],
  ["ACTIF_CIRCULANT", [
    { compteOHADA: "411000", libelle: "Clients", debit_XOF: 42_500_000, credit_XOF: 0 },
    { compteOHADA: "521000", libelle: "Banque CBAO", debit_XOF: 18_200_000, credit_XOF: 0 },
  ]],
  ["PASSIF", [
    { compteOHADA: "101000", libelle: "Capital social", debit_XOF: 0, credit_XOF: 200_000_000 },
    { compteOHADA: "401000", libelle: "Fournisseurs", debit_XOF: 0, credit_XOF: 35_000_000 },
  ]],
]);

const STATUT_CONFIG = {
  CADRE_CONFORME: { label: "Conforme", couleur: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icone: "✓" },
  MODIFICATION_DETECTEE: { label: "Modifiée ⚠", couleur: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", icone: "⚠" },
  EN_ATTENTE_VALIDATION: { label: "En attente", couleur: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icone: "⏳" },
};

export default function TieOutIntegritePage() {
  const [raisonSociale, setRaisonSociale] = useState("SOCIÉTÉ INDUSTRIELLE SAHEL SA");
  const [exercice, setExercice] = useState(2024);
  const [rapport, setRapport] = useState<RapportTieOut | null>(() =>
    genererRapportTieOut("SOCIÉTÉ INDUSTRIELLE SAHEL SA", 2024, SECTIONS_VALIDEES_DEMO, GRAND_LIVRE_ACTUEL)
  );
  const [loading, setLoading] = useState(false);
  const [sectionSelectionnee, setSectionSelectionnee] = useState<SectionValidee | null>(
    rapport?.sections[0] ?? null
  );

  const handleVerifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const grandLivreObj: Record<string, LigneCloture[]> = {};
      GRAND_LIVRE_ACTUEL.forEach((v, k) => { grandLivreObj[k] = v; });
      const res = await fetch("/api/audit/tie-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ societeRaisonSociale: raisonSociale, exercice, sectionsValidees: SECTIONS_VALIDEES_DEMO, grandLivreActuel: grandLivreObj }),
      });
      if (res.ok) setRapport(await res.json());
      else setRapport(genererRapportTieOut(raisonSociale, exercice, SECTIONS_VALIDEES_DEMO, GRAND_LIVRE_ACTUEL));
    } catch {
      setRapport(genererRapportTieOut(raisonSociale, exercice, SECTIONS_VALIDEES_DEMO, GRAND_LIVRE_ACTUEL));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
            <span>FloQast Standard</span><span>•</span><span>Sceau Cryptographique SYSCOHADA</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tie-Out Anti-Altération — Gardien de Clôture</h1>
          <p className="text-sm text-slate-400 mt-1">
            Détecte toute modification post-validation des sections de liasse. Empreinte cryptographique par section.
          </p>
        </div>
        <Link href="/audit/snip-to-source" className="text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
          ← Snip-to-Source PAF
        </Link>
      </div>

      <form onSubmit={handleVerifier} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs text-slate-400 block mb-1">Raison Sociale</label>
          <input type="text" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div className="w-28">
          <label className="text-xs text-slate-400 block mb-1">Exercice</label>
          <input type="number" value={exercice} onChange={(e) => setExercice(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-sm transition">
          {loading ? "Vérification..." : "Vérifier l'intégrité"}
        </button>
      </form>

      {rapport && (
        <>
          {/* Conclusion globale */}
          <div className={`rounded-2xl border p-6 ${
            rapport.conclusionIntegrite === "INTEGRE"
              ? "bg-emerald-500/10 border-emerald-500/30"
              : rapport.conclusionIntegrite === "ALTERE"
              ? "bg-rose-500/10 border-rose-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{rapport.conclusionIntegrite === "INTEGRE" ? "🔒" : rapport.conclusionIntegrite === "ALTERE" ? "🔓" : "⚠️"}</span>
              <div>
                <div className={`text-xl font-black ${rapport.conclusionIntegrite === "INTEGRE" ? "text-emerald-400" : rapport.conclusionIntegrite === "ALTERE" ? "text-rose-400" : "text-amber-400"}`}>
                  {rapport.conclusionIntegrite === "INTEGRE" ? "CLÔTURE INTÈGRE" : rapport.conclusionIntegrite === "ALTERE" ? "CLÔTURE ALTÉRÉE" : "CLÔTURE PARTIELLE"}
                </div>
                <p className="text-sm text-slate-300 mt-1">{rapport.narratifTieOut}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5">
              {[
                { label: "Conformes", val: rapport.sectionsConformes, color: "text-emerald-400" },
                { label: "Modifiées", val: rapport.sectionsModifiees, color: "text-rose-400" },
                { label: "En attente", val: rapport.sectionsEnAttente, color: "text-amber-400" },
              ].map((s) => (
                <div key={s.label} className="text-center bg-slate-950/50 rounded-xl p-3">
                  <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections + Détail */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Sections de clôture</h3>
              {rapport.sections.map((section) => {
                const cfg = STATUT_CONFIG[section.statut];
                return (
                  <button
                    key={section.idSection}
                    type="button"
                    onClick={() => setSectionSelectionnee(section)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      sectionSelectionnee?.idSection === section.idSection
                        ? "border-cyan-500/60 bg-cyan-500/10"
                        : `${cfg.bg} hover:border-slate-600`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-white">{section.libelleSectionSYSCOHADA}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Validé par {section.valideurNom} le {section.dateValidation}</div>
                      </div>
                      <span className={`text-xs font-semibold ${cfg.couleur}`}>{cfg.icone} {cfg.label}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-2">FP: {section.fingerprint}</div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7">
              {sectionSelectionnee && (() => {
                const ecartsSection = rapport.ecarts.filter((e) =>
                  sectionSelectionnee.lignes.some((l) => l.compteOHADA === e.compteOHADA) ||
                  GRAND_LIVRE_ACTUEL.get(sectionSelectionnee.idSection)?.some((l) => l.compteOHADA === e.compteOHADA)
                );
                return (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
                    <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
                      {sectionSelectionnee.libelleSectionSYSCOHADA}
                    </h3>
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Lignes validées</h4>
                      {sectionSelectionnee.lignes.map((l) => {
                        const ecart = ecartsSection.find((e) => e.compteOHADA === l.compteOHADA);
                        return (
                          <div key={l.compteOHADA} className={`flex justify-between items-center p-2.5 rounded-lg text-xs ${ecart ? "bg-rose-500/10 border border-rose-500/30" : "bg-slate-950 border border-slate-800"}`}>
                            <span className="font-mono text-slate-400">{l.compteOHADA}</span>
                            <span className="text-slate-300 flex-1 mx-3">{l.libelle}</span>
                            <span className={`font-bold font-mono ${ecart ? "text-rose-300 line-through" : "text-emerald-300"}`}>
                              {(l.debit_XOF + l.credit_XOF).toLocaleString("fr-FR")} XOF
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {ecartsSection.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-rose-400 font-semibold">⚠ Écarts détectés</h4>
                        {ecartsSection.map((e, i) => (
                          <div key={i} className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="font-mono font-bold text-rose-400">{e.compteOHADA} — {e.libelle}</span>
                              <span className="text-rose-300 font-semibold">{e.natureDelta.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex gap-4 text-slate-300">
                              <span>Validé : <strong>{e.montantValide_XOF.toLocaleString("fr-FR")}</strong></span>
                              <span>Actuel : <strong className="text-rose-300">{e.montantActuel_XOF.toLocaleString("fr-FR")}</strong></span>
                              <span>Δ : <strong className="text-rose-400">{e.delta_XOF > 0 ? "+" : ""}{e.delta_XOF.toLocaleString("fr-FR")} XOF</strong></span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${e.risqueAudit === "CRITIQUE" ? "bg-rose-500/20 text-rose-400" : "bg-orange-500/20 text-orange-400"}`}>
                              Risque {e.risqueAudit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
