"use client";

import { useState } from "react";
import Link from "next/link";
import {
  etablirRegistreBeneficiairesEffectifs,
  type ActionnaireEntite,
  type RapportRBE,
} from "@/lib/ohada/registre-beneficiaires-effectifs";

const ACTIONNAIRES_DEMO: ActionnaireEntite[] = [
  {
    id: "ACT-01",
    nomOuRaisonSociale: "Amadou DIOP",
    type: "PERSONNE_PHYSIQUE",
    nationaliteOuPaysImmatriculation: "Sénégalaise",
    partCapitalDirect_pct: 45,
    partDroitsVoteDirect_pct: 45,
  },
  {
    id: "ACT-02",
    nomOuRaisonSociale: "INVEST SAHEL HOLDING SA",
    type: "PERSONNE_MORALE",
    nationaliteOuPaysImmatriculation: "Côte d'Ivoire",
    partCapitalDirect_pct: 40,
    partDroitsVoteDirect_pct: 40,
    actionnairesParent: [
      {
        id: "PP-01",
        nomOuRaisonSociale: "Kouamé KOFFI",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Ivoirienne",
        partCapitalDirect_pct: 70, // 70% de 40% = 28% effectif (> 25%)
        partDroitsVoteDirect_pct: 70,
      },
      {
        id: "PP-02",
        nomOuRaisonSociale: "Aya TRAORE",
        type: "PERSONNE_PHYSIQUE",
        nationaliteOuPaysImmatriculation: "Ivoirienne",
        partCapitalDirect_pct: 30, // 30% de 40% = 12% effectif
        partDroitsVoteDirect_pct: 30,
      },
    ],
  },
  {
    id: "ACT-03",
    nomOuRaisonSociale: "Fatou SALL",
    type: "PERSONNE_PHYSIQUE",
    nationaliteOuPaysImmatriculation: "Sénégalaise",
    partCapitalDirect_pct: 15,
    partDroitsVoteDirect_pct: 15,
  },
];

export default function RegistreBeneficiairesEffectifsPage() {
  const [societeNom, setSocieteNom] = useState("DAKAR LOGISTIQUE & TRANSIT SAS");
  const [formeJuridique, setFormeJuridique] = useState("SAS");
  const [rccm, setRccm] = useState("SN.DKR.2024.B.1920");
  const [paysSiege, setPaysSiege] = useState("Sénégal");
  const [actionnaires] = useState<ActionnaireEntite[]>(ACTIONNAIRES_DEMO);
  const [rapport, setRapport] = useState<RapportRBE | null>(() => {
    return etablirRegistreBeneficiairesEffectifs(
      "DAKAR LOGISTIQUE & TRANSIT SAS",
      "SAS",
      "SN.DKR.2024.B.1920",
      "Sénégal",
      ACTIONNAIRES_DEMO
    );
  });
  const [loading, setLoading] = useState(false);
  const [copie, setCopie] = useState(false);

  const handleCalculer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/compliance/rbe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          societeNom,
          formeJuridique,
          rccm,
          paysSiege,
          actionnairesDirects: actionnaires,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(etablirRegistreBeneficiairesEffectifs(societeNom, formeJuridique, rccm, paysSiege, actionnaires));
      }
    } catch {
      setRapport(etablirRegistreBeneficiairesEffectifs(societeNom, formeJuridique, rccm, paysSiege, actionnaires));
    } finally {
      setLoading(false);
    }
  };

  const copierFormulaire = () => {
    if (rapport) {
      navigator.clipboard.writeText(rapport.texteFormulaireRCCM);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              AUDSCG ART. 747-1 & DÉCRETS RBE
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              CONFORMITÉ GAFI / LCB-FT
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Registre des Bénéficiaires Effectifs (RBE)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Identification des personnes physiques détenant plus de 25% du capital ou des droits de vote (détention directe & en cascade)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCalculer}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Calcul en cours..." : "Actualiser le Registre ⚡"}
          </button>
        </div>
      </div>

      {/* Cartes KPI RBE */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Bénéficiaires Effectifs</p>
            <p className="text-3xl font-extrabold text-blue-400 mt-2">{rapport.nbBeneficiairesEffectifs}</p>
            <p className="text-xs text-slate-500 mt-1">Personnes physiques &gt; 25%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Conformité AUDSCG</p>
            <p className="text-xl font-bold text-emerald-400 mt-2">
              {rapport.conformeObligationRBE ? "✓ REGISTRE CONFORME" : "NON CONFORME"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Registre RCCM prêt</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Alertes LCB-FT / GAFI</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.alertesLCBFT.length === 0 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {rapport.alertesLCBFT.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Points de vigilance</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Juridiction & RCCM</p>
            <p className="text-sm font-bold text-white mt-2 font-mono">{rapport.rccm}</p>
            <p className="text-xs text-slate-500 mt-1">{rapport.paysSiege}</p>
          </div>
        </div>
      )}

      {/* Liste des Bénéficiaires Effectifs identifiés */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👤 Personnes Physiques Contrôlant la Société (&gt; 25%)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rapport.beneficiairesIdentifies.map((b, i) => (
              <div
                key={i}
                className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      b.natureControle === "DETENTION_DIRECTE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : b.natureControle === "DETENTION_INDIRECTE"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {b.natureControle.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-slate-400">Nationalité : {b.nationalite}</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {b.prenom} {b.nom}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Résidence : {b.paysResidence}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block font-sans">Capital Détenu</span>
                    <span className="text-sm font-bold text-blue-400">{b.pourcentageCapitalEffectif_pct} %</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block font-sans">Droits de Vote</span>
                    <span className="text-sm font-bold text-indigo-400">{b.pourcentageDroitsVoteEffectif_pct} %</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="font-semibold text-slate-300">Justification légale :</span> {b.justificationRBE}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertes LCB-FT */}
      {rapport && rapport.alertesLCBFT.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🛡️ Alertes de Vigilance LCB-FT</span>
          </h2>
          <ul className="space-y-2">
            {rapport.alertesLCBFT.map((alt, idx) => (
              <li key={idx} className="text-xs text-amber-300 flex items-start gap-2 bg-amber-950/20 p-2.5 rounded border border-amber-800/30">
                <span className="text-amber-400 font-bold">⚠️</span>
                <span>{alt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulaire Officiel RCCM */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📋 Formulaire Déclaratif Officiel RBE</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prêt pour dépôt au Greffe du Tribunal de Commerce / RCCM
              </p>
            </div>
            <button
              onClick={copierFormulaire}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              {copie ? "✓ Déclaration copiée !" : "Copier le formulaire RBE 📋"}
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96">
            {rapport.texteFormulaireRCCM}
          </pre>
        </div>
      )}
    </div>
  );
}
