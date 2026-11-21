"use client";

import { useState } from "react";
import Link from "next/link";
import {
  traiterCollecteWhatsApp,
  type PieceAttendueDossier,
  type MessageWhatsAppPiece,
  type RapportWhatsAppCollector,
} from "@/lib/ohada/agent-whatsapp-collector";

const PIECES_INITIALES: PieceAttendueDossier[] = [
  {
    idPiece: "PC-001",
    typePiece: "QUITTANCE_WAVE_ORANGE_MONEY",
    libelle: "Règlement SODATEL Fournisseur Internet",
    montantPrevu_XOF: 1_250_000,
    statut: "EN_ATTENTE_RELANCE",
    dateEcheance: "2024-11-20",
    nbRelancesEnvoyees: 1,
  },
  {
    idPiece: "PC-002",
    typePiece: "FACTURE_ACHAT_FOURNISSEUR",
    libelle: "Facture matériel Bureau Center SARL",
    montantPrevu_XOF: 450_000,
    statut: "EN_ATTENTE_RELANCE",
    dateEcheance: "2024-11-25",
    nbRelancesEnvoyees: 0,
  },
  {
    idPiece: "PC-003",
    typePiece: "QUITTANCE_BRS_OU_TVA",
    libelle: "Bordereau Quittance BRS Trésor Public",
    montantPrevu_XOF: 2_400_000,
    statut: "EN_ATTENTE_RELANCE",
    dateEcheance: "2024-11-15",
    nbRelancesEnvoyees: 2,
  },
  {
    idPiece: "PC-004",
    typePiece: "RELEVE_BANCAIRE_PDF",
    libelle: "Extrait bancaire CBAO Octobre 2024",
    statut: "RECUE_TRAITEE",
    dateEcheance: "2024-11-10",
    nbRelancesEnvoyees: 0,
  },
];

export default function AgentWhatsAppCollectorPage() {
  const [clientNom, setClientNom] = useState("BAOBAB TECH DISTRIBUTION SARL");
  const [exercice, setExercice] = useState(2024);
  const [periode, setPeriode] = useState("Novembre 2024");
  const [pieces, setPieces] = useState<PieceAttendueDossier[]>(PIECES_INITIALES);
  const [messagesRecus, setMessagesRecus] = useState<MessageWhatsAppPiece[]>([]);
  const [rapport, setRapport] = useState<RapportWhatsAppCollector | null>(() => {
    return traiterCollecteWhatsApp(
      "BAOBAB TECH DISTRIBUTION SARL",
      2024,
      "Novembre 2024",
      PIECES_INITIALES,
      []
    );
  });
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const simulerReceptionWave = async () => {
    setLoading(true);
    const nouveauMsg: MessageWhatsAppPiece = {
      idMessage: `MSG-${Date.now()}`,
      expediteurNom: "M. KOUAME (Comptable Client)",
      telephone: "+221 77 456 78 90",
      dateReception: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      texteMessage: "Bonjour Cabinet, voici la capture du reçu Wave SODATEL validé ce matin.",
      donneesOCR: {
        typePieceDetectee: "QUITTANCE_WAVE_ORANGE_MONEY",
        montantExtrait_XOF: 1_250_000,
        referenceFactureOuTx: "WV-SN-2024-99812",
        tiersDetecte: "SODATEL",
        datePiece: new Date().toISOString().slice(0, 10),
        scoreConfianceOCR_pct: 95,
      },
    };

    const nouveauxMessages = [...messagesRecus, nouveauMsg];
    setMessagesRecus(nouveauxMessages);

    try {
      const res = await fetch("/api/agents/whatsapp-collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientNom,
          exercice,
          periode,
          piecesAttendues: pieces,
          messagesRecus: nouveauxMessages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRapport(data);
        setPieces(data.pieces);
      } else {
        const rep = traiterCollecteWhatsApp(clientNom, exercice, periode, pieces, nouveauxMessages);
        setRapport(rep);
        setPieces(rep.pieces);
      }
    } catch {
      const rep = traiterCollecteWhatsApp(clientNom, exercice, periode, pieces, nouveauxMessages);
      setRapport(rep);
      setPieces(rep.pieces);
    } finally {
      setLoading(false);
    }
  };

  const handleCopierMessage = (texte: string, idx: number) => {
    navigator.clipboard.writeText(texte);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* En-tête avec retour */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/agents/orchestrateur"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              ← Hub Orchestrateur
            </Link>
            <span className="text-slate-600">|</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AGENT WHATSAPP COLLECTOR
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
              KARBON & TAXDOME STANDARDS
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2">
            Collecte & Lettrage Omnicanal WhatsApp
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Relance autonome des justificatifs manquants, reconnaissance OCR mobile et propositions d&apos;imputation SYSCOHADA
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={simulerReceptionWave}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Traitement OCR..." : "Simuler reçu Wave entrant 📲"}
          </button>
        </div>
      </div>

      {/* Cartes KPI Dossier */}
      {rapport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Taux de Complétude Dossier</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${
                rapport.tauxCompletude_pct >= 80
                  ? "text-emerald-400"
                  : rapport.tauxCompletude_pct >= 50
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {rapport.tauxCompletude_pct} %
            </p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${rapport.tauxCompletude_pct}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Pièces Attendues</p>
            <p className="text-3xl font-extrabold text-white mt-2">{rapport.totalPiecesAttendues}</p>
            <p className="text-xs text-slate-500 mt-1">Pour la période {rapport.periode}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Collectées & Lettrées</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{rapport.piecesCollectees}</p>
            <p className="text-xs text-slate-500 mt-1">OCR et comptabilité à jour</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Pièces Manquantes</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-2">{rapport.piecesManquantes}</p>
            <p className="text-xs text-slate-500 mt-1">Relances ciblées programmées</p>
          </div>
        </div>
      )}

      {/* Liste des Pièces Attendues et Traitées */}
      {rapport && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📁 État d&apos;Avancement des Pièces du Dossier</span>
          </h2>

          <div className="space-y-3">
            {rapport.pieces.map((piece) => (
              <div
                key={piece.idPiece}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        piece.statut === "RECUE_TRAITEE"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : piece.statut === "RECUE_A_CONFIRMER"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {piece.statut.replace(/_/g, " ")}
                    </span>
                    <h3 className="text-sm font-bold text-white">{piece.libelle}</h3>
                  </div>

                  {piece.montantPrevu_XOF && (
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {piece.montantPrevu_XOF.toLocaleString("fr-FR")} XOF
                    </span>
                  )}
                </div>

                {/* Si proposition d'écriture comptable */}
                {piece.propositionEcriture && (
                  <div className="bg-slate-900 border border-slate-800/80 rounded p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                        ⚡ Proposition d&apos;écriture lettrée
                      </span>
                      <p className="text-slate-300 font-mono text-[11px]">
                        Journal : <strong className="text-white">{piece.propositionEcriture.journal}</strong> | Débit :{" "}
                        <strong className="text-cyan-400">{piece.propositionEcriture.debitCompte}</strong> | Crédit :{" "}
                        <strong className="text-amber-400">{piece.propositionEcriture.creditCompte}</strong>
                      </p>
                      <p className="text-slate-400 text-[11px]">{piece.propositionEcriture.libelle}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-semibold text-[10px] whitespace-nowrap">
                      ✓ Lettrage Prêt
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages de Relance WhatsApp Générés */}
      {rapport && rapport.messagesRelanceGeneres.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💬 Relance Autonome WhatsApp Programmée</span>
          </h2>

          <div className="space-y-4">
            {rapport.messagesRelanceGeneres.map((rel, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${
                        rel.niveauUrgence === "URGENT"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {rel.niveauUrgence}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">Destinataire : {rel.destinataire}</span>
                  </div>
                  <button
                    onClick={() => handleCopierMessage(rel.texteMessageWhatsApp, idx)}
                    className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
                  >
                    {copiedIndex === idx ? "✓ Message copié !" : "Copier le message WhatsApp 📋"}
                  </button>
                </div>

                <pre className="text-xs font-sans text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-3 rounded border border-slate-800/80">
                  {rel.texteMessageWhatsApp}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
