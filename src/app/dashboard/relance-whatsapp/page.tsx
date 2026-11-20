"use client";

import { useState } from "react";
import {
  planifierRelances,
  marquerPieceRecue,
  type PieceManquante,
  type PlanRelanceComplet,
  type ConfigRelance,
} from "@/lib/ohada/relance-pieces-whatsapp";

const CONFIG_DEMO: ConfigRelance = {
  cabinetNom: "Cabinet EXPERTISE OHADA 360",
  cabinetTelephone: "+221 33 820 XX XX",
  expertComptableNom: "M. Ibrahima FALL, EC",
  delaiFinalAbandon_jours: 21,
};

const PIECES_DEMO: PieceManquante[] = [
  { pieceId: "PM-001", clientId: "CLI-01", clientNom: "SOCIÉTÉ COMMERCIALE SA", clientTelephone: "+221771234567", ecritureId: "ECR-2024-00891", description: "Facture fournisseur SODATEL N°2024-0891", montantRef_XOF: 3_500_000, compteOHADA: "401100", exercice: 2024, deadlineRelance: "2024-12-10", statut: "EN_ATTENTE" },
  { pieceId: "PM-002", clientId: "CLI-02", clientNom: "BOULANGERIE DAKAR CENTRAL", clientTelephone: "+221776543210", ecritureId: "ECR-2024-01245", description: "Contrat de bail commercial local N°3 Plateau", montantRef_XOF: 15_000_000, compteOHADA: "613100", exercice: 2024, deadlineRelance: "2024-12-05", statut: "EN_ATTENTE" },
  { pieceId: "PM-003", clientId: "CLI-03", clientNom: "IMPORT-EXPORT AFRICA SARL", clientTelephone: "+221785432109", ecritureId: "ECR-2024-00567", description: "Bordereau de déclaration douanière N°BDC-2024-889", montantRef_XOF: 8_750_000, compteOHADA: "604000", exercice: 2024, deadlineRelance: "2024-12-20", statut: "EN_ATTENTE" },
];

const URGENCE_CONFIG = {
  NORMAL: { label: "Normal", couleur: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  URGENT: { label: "Urgent", couleur: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  CRITIQUE: { label: "Critique", couleur: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
};

const CANAL_ICONE: Record<string, string> = {
  WHATSAPP: "📱",
  SMS: "💬",
  EMAIL: "📧",
  ALERTE_CABINET: "🔔",
};

export default function RelanceWhatsAppPage() {
  const [plans, setPlans] = useState<PlanRelanceComplet[]>(() =>
    planifierRelances(PIECES_DEMO, CONFIG_DEMO, "2024-12-08")
  );
  const [planSelectionne, setPlanSelectionne] = useState<PlanRelanceComplet | null>(plans[0]);
  const [messagePreview, setMessagePreview] = useState<string | null>(plans[0]?.relances[0]?.messagePret ?? null);
  const [loading, setLoading] = useState(false);

  const handleMarquerRecue = async (pieceId: string) => {
    const updated = marquerPieceRecue(plans, pieceId);
    setPlans(updated);
    if (planSelectionne?.piece.pieceId === pieceId) {
      setPlanSelectionne(updated.find((p) => p.piece.pieceId === pieceId) ?? null);
    }
  };

  const handlePlanClick = (plan: PlanRelanceComplet) => {
    setPlanSelectionne(plan);
    setMessagePreview(plan.relances[0]?.messagePret ?? null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-green-400 font-semibold mb-1">
          <span>Karbon / TaxDome Standard</span><span>•</span><span>Relance Multicanal Autonome</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Robot Relance Pièces WhatsApp</h1>
        <p className="text-sm text-slate-400 mt-1">
          T+0 WhatsApp → T+3 SMS → T+7 Relance 2 + Alerte cabinet → T+14 Dernier rappel. Auto-stop à réception.
        </p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En attente", val: plans.filter((p) => p.piece.statut !== "RECUE" && p.piece.statut !== "ABANDONNEE").length, color: "text-amber-400" },
          { label: "Critiques", val: plans.filter((p) => p.urgence === "CRITIQUE").length, color: "text-rose-400" },
          { label: "Reçues ✓", val: plans.filter((p) => p.piece.statut === "RECUE").length, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Liste des pièces */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Pièces manquantes ({plans.length})</h3>
          {plans.map((plan) => {
            const isRecue = plan.piece.statut === "RECUE";
            const cfg = URGENCE_CONFIG[plan.urgence];
            return (
              <div
                key={plan.piece.pieceId}
                className={`p-4 rounded-xl border transition ${
                  planSelectionne?.piece.pieceId === plan.piece.pieceId
                    ? "border-green-500/60 bg-green-500/10"
                    : isRecue
                    ? "border-slate-700 bg-slate-900/20 opacity-60"
                    : `${cfg.bg}`
                }`}
              >
                <button type="button" onClick={() => handlePlanClick(plan)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white truncate">{plan.piece.clientNom}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{plan.piece.description}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{plan.piece.montantRef_XOF.toLocaleString("fr-FR")} XOF · {plan.piece.compteOHADA}</div>
                    </div>
                    <div className="text-right shrink-0">
                      {isRecue ? (
                        <span className="text-xs font-bold text-emerald-400">✓ Reçue</span>
                      ) : (
                        <span className={`text-xs font-bold ${cfg.couleur}`}>{cfg.label}</span>
                      )}
                      <div className="text-[10px] text-slate-500 mt-1">Délai: {plan.piece.deadlineRelance}</div>
                    </div>
                  </div>
                </button>
                {!isRecue && (
                  <button
                    type="button"
                    onClick={() => handleMarquerRecue(plan.piece.pieceId)}
                    className="mt-3 w-full py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 transition"
                  >
                    ✓ Marquer comme reçue (auto-stop relances)
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Détail plan sélectionné */}
        <div className="lg:col-span-7 space-y-4">
          {planSelectionne && (
            <>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
                  Plan de relance — {planSelectionne.piece.clientNom}
                </h3>
                <div className="space-y-2">
                  {planSelectionne.relances.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessagePreview(r.messagePret)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition text-xs ${
                        r.annule
                          ? "border-slate-800 bg-slate-900/20 opacity-40"
                          : r.envoye
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
                      }`}
                    >
                      <span className="text-xl">{CANAL_ICONE[r.canal]}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-200">{r.canal.replace(/_/g, " ")} — J+{r.delaiJours}</div>
                        <div className="text-slate-500">{r.dateEnvoi}</div>
                      </div>
                      <span className={`font-semibold ${r.annule ? "text-slate-500" : r.envoye ? "text-emerald-400" : "text-amber-400"}`}>
                        {r.annule ? "Annulé" : r.envoye ? "✓ Envoyé" : "En attente"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prévisualisation message */}
              {messagePreview && (
                <div className="bg-slate-900/60 border border-green-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase tracking-wider text-green-400 font-semibold">📱 Prévisualisation Message WhatsApp</h4>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(messagePreview)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/30 transition font-semibold"
                    >
                      Copier
                    </button>
                  </div>
                  <div className="p-4 bg-[#DCF8C6] rounded-xl text-sm text-slate-900 font-sans whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow">
                    {messagePreview}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
