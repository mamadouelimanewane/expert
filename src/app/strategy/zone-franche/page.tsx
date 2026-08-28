"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Anchor, TrendingUp, Calculator, CheckCircle2, AlertTriangle, Globe, Building2, Zap, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";



import { simulerZoneFranche, ZONES_FRANCHES } from "@/lib/ohada/zones-franches";
const AVANTAGES = [
  { label: "Exonération TVA", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "IS réduit ou nul", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Droits de douane 0%", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Rapatriement libre des bénéfices", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Pas de contrôle des changes", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Statut expatriés facilité", icon: CheckCircle2, color: "text-emerald-400" },
];

export default function ZoneFranchePage() {
  const [selectedZone, setSelectedZone] = useState(ZONES_FRANCHES[0]);
  const [chiffreAffaires, setChiffreAffaires] = useState("500000000");
  // Le taux de marge etait fige a 30 % sans etre affiche : il determine
  // pourtant a lui seul l'economie d'impot. Il est desormais saisi.
  const [tauxMarge, setTauxMarge] = useState("15");
  const [importations, setImportations] = useState("0");
  const [showSimulation, setShowSimulation] = useState(false);

  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [clientId, setClientId] = useState("");
  const [demande, setDemande] = useState<"idle" | "envoi" | "envoyee" | "erreur">("idle");

  useEffect(() => {
    fetch("/api/clients?limit=200&isActive=true")
      .then((r) => r.json())
      .then((d) =>
        setClients(
          (d.clients ?? []).map((c: Record<string, unknown>) => ({
            id: String(c.id),
            nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
          }))
        )
      )
      .catch((e) => console.error("Chargement du portefeuille :", e));
  }, []);

  const demanderAudit = async () => {
    if (!clientId) return;
    setDemande("envoi");
    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Audit d'éligibilité — Zone franche ${selectedZone.nom}`,
          clientId,
          type: "AUDIT",
          description: `Zone envisagée : ${selectedZone.nom} (${selectedZone.paysNom}). Simulation : CA ${chiffreAffaires} FCFA, marge nette ${tauxMarge}%, importations ${importations} FCFA.`,
        }),
      });
      setDemande(res.ok ? "envoyee" : "erreur");
    } catch {
      setDemande("erreur");
    }
  };

  const simulation = simulerZoneFranche(selectedZone, {
    chiffreAffaires: parseInt(chiffreAffaires) || 0,
    tauxMargeNette: parseFloat(tauxMarge) || 0,
    valeurImportations: parseInt(importations) || 0,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="p-4 sm:p-8 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[50px] bg-gradient-to-br from-slate-900/80 to-indigo-950/30 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Anchor className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-emerald-500/20">
              OHADA Zone Économique
            </span>
          </div>
          <h2 className="page-title">
            Simulateur Zone Franche <span className="text-indigo-400">UEMOA/CEMAC</span>
          </h2>
          <p className="page-subtitle max-w-2xl">
            Calculez les avantages fiscaux et douaniers liés à l'implantation de votre entreprise dans les zones franches d'Afrique de l'Ouest et Centrale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sélection Zone */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Zones Disponibles</h3>
          {ZONES_FRANCHES.map(zone => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={cn(
                "w-full p-4 rounded-2xl border text-left transition-all",
                selectedZone.id === zone.id
                  ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg"
                  : "bg-slate-900/20 border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{zone.drapeau}</span>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{zone.nom}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{zone.paysNom} \u00b7 IS {zone.tauxIS}% \u00b7 {zone.dureeAnnees} ans</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Détails & Simulateur */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fiche Zone */}
          <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-slate-900/20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{selectedZone.drapeau}</span>
              <div>
                <h3 className="text-xl font-black text-white">{selectedZone.nom}</h3>
                <p className="text-slate-400 text-sm font-medium">{selectedZone.paysNom} \u2014 Duree d'agrement : {selectedZone.dureeAnnees} ans</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "IS", value: `${selectedZone.tauxIS}%`, good: selectedZone.tauxIS < 20 },
                { label: "TVA", value: "0%", good: true },
                { label: "Douanes", value: "0%", good: true },
              ].map(item => (
                <div key={item.label} className={cn(
                  "p-4 rounded-2xl border text-center",
                  item.good ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                )}>
                  <p className="text-xs text-slate-500 font-black uppercase mb-1">{item.label}</p>
                  <p className={cn("text-2xl font-black", item.good ? "text-emerald-400" : "text-amber-400")}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVANTAGES.map(({ label, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", color)} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Simulateur */}
          <div className="glass-card p-4 sm:p-8 rounded-[32px] border border-white/5 bg-slate-900/20">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-indigo-400" /> Simulation d'économies fiscales
            </h3>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Chiffre d'Affaires Prévisionnel (FCFA/an)
              </label>
              <input
                type="number"
                value={chiffreAffaires}
                onChange={e => { setChiffreAffaires(e.target.value); setShowSimulation(false); }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Taux de marge nette attendu (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tauxMarge}
                onChange={e => { setTauxMarge(e.target.value); setShowSimulation(false); }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Determine le resultat imposable, et donc l&apos;economie d&apos;impot.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                Importations annuelles taxables (FCFA)
              </label>
              <input
                type="number"
                min="0"
                value={importations}
                onChange={e => { setImportations(e.target.value); setShowSimulation(false); }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="mt-1 text-[10px] text-slate-500">
                Assiette de l&apos;economie de droits de douane.
              </p>
            </div>

            <button
              onClick={() => setShowSimulation(true)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mb-6"
            >
              <Zap className="w-4 h-4" /> Calculer les économies
            </button>

            {showSimulation && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Resultat imposable retenu
                    </span>
                    <span className="text-sm font-black text-slate-300 tabular-nums">
                      {simulation.resultatImposable.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Economie IS ({simulation.tauxISDroitCommun}% &rarr; {simulation.tauxISZone}%)
                    </span>
                    <span className="text-lg font-black text-indigo-400 tabular-nums">
                      {Math.round(simulation.economieIS).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                      Economie droits de douane
                    </span>
                    <span className="text-lg font-black text-emerald-400 tabular-nums">
                      {Math.round(simulation.economieDouane).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-xs text-white font-black uppercase tracking-widest">
                      Total / an
                    </span>
                    <span className="text-2xl font-black text-white tabular-nums">
                      {Math.round(simulation.economieAnnuelle).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Sur {simulation.zone.dureeAnnees} ans d&apos;agrement</span>
                    <span className="tabular-nums">
                      {Math.round(simulation.economieTotale).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>

                {simulation.hypotheses.length > 0 && (
                  <ul className="space-y-2 rounded-2xl border border-white/5 bg-slate-900/40 p-4 text-[11px] leading-relaxed text-slate-400">
                    {simulation.hypotheses.map((h, i) => (
                      <li key={i} className="flex gap-2">
                        <span aria-hidden="true">&bull;</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200/70 leading-relaxed space-y-2">
                    {simulation.avertissements.map((a, i) => (
                      <p key={i}>{a}</p>
                    ))}
                    <p className="text-amber-400/80">
                      Source du regime : {simulation.zone.source}.
                    </p>
                  </div>
                </div>

                {demande === "envoyee" ? (
                  <div className="w-full py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mission d&apos;audit créée —{" "}
                    <Link href="/missions" className="underline">voir dans Missions</Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={clientId}
                      onChange={(e) => { setClientId(e.target.value); setDemande("idle"); }}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                    >
                      <option value="">Sélectionner le dossier client concerné…</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <button
                      onClick={demanderAudit}
                      disabled={!clientId || demande === "envoi"}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2"
                    >
                      <Globe className="w-4 h-4" /> {demande === "envoi" ? "Création…" : "Demander un Audit d'Éligibilité"} <ArrowRight className="w-4 h-4" />
                    </button>
                    {demande === "erreur" && <p className="text-xs text-red-400">Échec de la création de la mission. Réessayez.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
