"use client";

import { useState } from "react";
import Link from "next/link";
import {
  interpreterNoteVocaleTerroir,
  type NoteVocaleBrute,
  type RapportCopiloteVocal,
  type LangueTerroir,
} from "@/lib/ohada/copilote-vocal-terroir";

const NOTES_EXEMPLES: Record<LangueTerroir, NoteVocaleBrute> = {
  WOLOF: {
    idNote: "VOC-SN-01",
    commercantNom: "Modou Boutique Sandaga (Dakar)",
    telephone: "+221 77 111 22 33",
    dateReception: "2024-11-20 10:15",
    langueDetectee: "WOLOF",
    transcriptionPhonetique: "Dama jënd 5 sacu ceeb ci 35000 f cfa",
    dureeSecondes: 4,
  },
  DIOULA_NOUCHI: {
    idNote: "VOC-CI-02",
    commercantNom: "Bakary Marché Adjamé (Abidjan)",
    telephone: "+225 07 22 33 44",
    dateReception: "2024-11-20 11:30",
    langueDetectee: "DIOULA_NOUCHI",
    transcriptionPhonetique: "N'ye feere malo 50000 cfa",
    dureeSecondes: 3,
  },
  BAMBARA: {
    idNote: "VOC-ML-03",
    commercantNom: "Ousmane Marché Dibida (Bamako)",
    telephone: "+223 66 12 34 56",
    dateReception: "2024-11-20 14:00",
    langueDetectee: "BAMBARA",
    transcriptionPhonetique: "I ni ce, n'ye sanni sogo 20000 cfa la",
    dureeSecondes: 5,
  },
  HAOUSSA: {
    idNote: "VOC-NE-04",
    commercantNom: "Ibrahim Grand Marché (Niamey)",
    telephone: "+227 90 12 34 56",
    dateReception: "2024-11-20 16:45",
    langueDetectee: "HAOUSSA",
    transcriptionPhonetique: "Mun yi ciniki, na sayar da shinkafa 45000",
    dureeSecondes: 4,
  },
};

export default function CopiloteVocalTerroirPage() {
  const [langueChoisie, setLangueChoisie] = useState<LangueTerroir>("WOLOF");
  const [noteCourante, setNoteCourante] = useState<NoteVocaleBrute>(NOTES_EXEMPLES.WOLOF);
  const [soldeCaisse, setSoldeCaisse] = useState<number>(120_000);
  const [rapport, setRapport] = useState<RapportCopiloteVocal | null>(() => {
    return interpreterNoteVocaleTerroir(NOTES_EXEMPLES.WOLOF, 120_000);
  });
  const [loading, setLoading] = useState(false);
  const [enEcoute, setEnEcoute] = useState(false);

  const changerLangue = (langue: LangueTerroir) => {
    setLangueChoisie(langue);
    const n = NOTES_EXEMPLES[langue];
    setNoteCourante(n);
    setRapport(interpreterNoteVocaleTerroir(n, soldeCaisse));
  };

  const handleInterprete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/comptabilite/copilote-vocal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteCourante, soldeCaissePrecedent_XOF: soldeCaisse }),
      });
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        setRapport(interpreterNoteVocaleTerroir(noteCourante, soldeCaisse));
      }
    } catch {
      setRapport(interpreterNoteVocaleTerroir(noteCourante, soldeCaisse));
    } finally {
      setLoading(false);
    }
  };

  const simulerLectureAudio = () => {
    setEnEcoute(true);
    setTimeout(() => setEnEcoute(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              INCLUSION FINANCIÈRE SECTEUR INFORMEL
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              SYSCOHADA SMT (SYSTÈME MINIMAL DE TRÉSORERIE)
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Copilote Vocal « Terroir » & WhatsApp Audio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Compréhension NLP des notes vocales en Wolof, Dioula/Nouchi, Bambara et Haoussa ➔ Écritures de caisse automatiques
          </p>
        </div>
      </div>

      {/* Sélecteur de Langue du Terroir */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => changerLangue("WOLOF")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            langueChoisie === "WOLOF"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🇸🇳 Wolof (Sénégal)
        </button>
        <button
          onClick={() => changerLangue("DIOULA_NOUCHI")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            langueChoisie === "DIOULA_NOUCHI"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-900/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🇨🇮 Dioula / Nouchi (Côte d&apos;Ivoire)
        </button>
        <button
          onClick={() => changerLangue("BAMBARA")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            langueChoisie === "BAMBARA"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-900/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🇲🇱 Bambara (Mali / Burkina)
        </button>
        <button
          onClick={() => changerLangue("HAOUSSA")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            langueChoisie === "HAOUSSA"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          🇳🇪 Haoussa (Niger / Sahel)
        </button>
      </div>

      {/* Simulation Note Vocale Reçue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs text-slate-500 font-mono">ID Note : {noteCourante.idNote}</span>
            <h3 className="text-base font-bold text-white">{noteCourante.commercantNom}</h3>
            <p className="text-xs text-slate-400">{noteCourante.telephone} • {noteCourante.dateReception}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulerLectureAudio}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{enEcoute ? "🔊 Écoute en cours..." : "▶️ Écouter le message audio"}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Transcription phonétique & Text-to-Speech
          </label>
          <input
            type="text"
            value={noteCourante.transcriptionPhonetique}
            onChange={(e) => setNoteCourante({ ...noteCourante, transcriptionPhonetique: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={handleInterprete}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Interprétation..." : "Interpréter et imputer au journal SMT ⚡"}
        </button>
      </div>

      {/* Cartes KPI Imputation */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Nature Transaction SMT</p>
            <p
              className={`text-xl font-bold mt-2 ${
                rapport.ecriture.nature === "RECETTE_VENTE" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {rapport.ecriture.nature === "RECETTE_VENTE" ? "🟢 RECETTE / VENTE" : "🔴 DÉPENSE / ACHAT"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Marchandise : {rapport.ecriture.categorieMarchandise}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Montant Reconnu</p>
            <p className="text-3xl font-extrabold text-white mt-2 font-mono">
              {rapport.ecriture.montant_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-emerald-400 mt-1">Confiance IA : {rapport.confianceNlp_pct}%</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Solde Caisse Après</p>
            <p className="text-2xl font-bold text-cyan-400 mt-2 font-mono">
              {rapport.soldeCaisseEstimeApres_XOF.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-1">Compte Caisse 571</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Statut SMT</p>
            <p className="text-lg font-bold text-emerald-400 mt-2">✓ VALIDÉE AUTO</p>
            <p className="text-xs text-slate-500 mt-1">Livre de caisse à jour</p>
          </div>
        </div>
      )}

      {/* Écriture Comptable SYSCOHADA SMT */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>✍️ Écriture Comptable Système Minimal de Trésorerie (SMT)</span>
          </h2>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-white">{rapport.ecriture.libelleEnFrancais}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block font-sans">Journal :</span>
                <span className="font-bold text-white">{rapport.ecriture.journal}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Compte Débit :</span>
                <span className="font-bold text-cyan-400">{rapport.ecriture.compteDebit}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Compte Crédit :</span>
                <span className="font-bold text-amber-400">{rapport.ecriture.compteCredit}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Montant Net :</span>
                <span className="font-bold text-emerald-400">
                  {rapport.ecriture.montant_XOF.toLocaleString("fr-FR")} XOF
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Vocale Retour au Commerçant */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🗣️ Réponse Vocale Automatisée en Langue Locale</span>
            </h2>
            <span className="text-xs text-emerald-400 font-semibold">Envoyée par note audio WhatsApp</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between gap-4">
            <p className="text-sm text-slate-200 italic font-medium leading-relaxed">
              « {rapport.ecriture.confirmationVocaleRetour} »
            </p>
            <button
              onClick={simulerLectureAudio}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
            >
              🔊 Écouter la réponse
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
