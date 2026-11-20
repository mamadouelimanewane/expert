"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

type Assessment = {
  acceptanceStatus: string;
  acceptanceRationale: string | null;
  independenceStatus: string;
  independenceRationale: string | null;
  updatedAt: string;
  assessedBy?: { firstName: string; lastName: string } | null;
} | null;

export default function AuditEngagementGate({ missionId }: { missionId: string }) {
  const [assessment, setAssessment] = useState<Assessment>(null);
  const [acceptanceStatus, setAcceptanceStatus] = useState("ACCEPTED");
  const [acceptanceRationale, setAcceptanceRationale] = useState("");
  const [independenceStatus, setIndependenceStatus] = useState("CLEAR");
  const [independenceRationale, setIndependenceRationale] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    setAssessment(null);
    fetch(`/api/audit/engagement-assessment?missionId=${encodeURIComponent(missionId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Évaluation indisponible.");
        if (!live) return;
        setAssessment(data.assessment);
        if (data.assessment) {
          setAcceptanceStatus(data.assessment.acceptanceStatus === "PENDING" ? "ACCEPTED" : data.assessment.acceptanceStatus);
          setAcceptanceRationale(data.assessment.acceptanceRationale ?? "");
          setIndependenceStatus(data.assessment.independenceStatus === "PENDING" ? "CLEAR" : data.assessment.independenceStatus);
          setIndependenceRationale(data.assessment.independenceRationale ?? "");
        } else {
          setAcceptanceStatus("ACCEPTED"); setAcceptanceRationale("");
          setIndependenceStatus("CLEAR"); setIndependenceRationale("");
        }
      })
      .catch((e) => live && setError(e instanceof Error ? e.message : "Évaluation indisponible."));
    return () => { live = false; };
  }, [missionId]);

  const save = async (check: "acceptance" | "independence") => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/audit/engagement-assessment", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId, check, status: check === "acceptance" ? acceptanceStatus : independenceStatus, rationale: check === "acceptance" ? acceptanceRationale : independenceRationale }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      setAssessment(data.assessment);
    } catch (e) { setError(e instanceof Error ? e.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  };

  return <section className="apix-card space-y-5">
    <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-400" /><div><h3 className="font-bold text-white">Acceptation et indépendance</h3><p className="text-xs text-slate-400">Évaluation préalable requise avant le démarrage des travaux.</p></div></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-semibold text-white">Acceptation du client et de la mission<select value={acceptanceStatus} onChange={(e) => setAcceptanceStatus(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm"><option value="ACCEPTED">Acceptée</option><option value="DECLINED">Refusée</option></select></label>
        <textarea value={acceptanceRationale} onChange={(e) => setAcceptanceRationale(e.target.value)} placeholder="Motif, diligences d’acceptation et réserves (10 caractères minimum)" className="min-h-24 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white" />
        <button disabled={busy || acceptanceRationale.trim().length < 10} onClick={() => void save("acceptance")} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Enregistrer l’acceptation</button>
      </div>
      <div className="space-y-3 rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-semibold text-white">Indépendance de l’équipe<select value={independenceStatus} onChange={(e) => setIndependenceStatus(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 p-2 text-sm"><option value="CLEAR">Aucun conflit identifié</option><option value="CONFLICT">Conflit ou menace identifié</option></select></label>
        <textarea value={independenceRationale} onChange={(e) => setIndependenceRationale(e.target.value)} placeholder="Déclarations vérifiées, menaces et mesures de sauvegarde (10 caractères minimum)" className="min-h-24 w-full rounded-lg border border-white/10 bg-slate-950 p-3 text-sm text-white" />
        <button disabled={busy || independenceRationale.trim().length < 10} onClick={() => void save("independence")} className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Enregistrer l’indépendance</button>
      </div>
    </div>
    {assessment && <p className="text-xs text-slate-500">Dernière évaluation : {assessment.assessedBy ? `${assessment.assessedBy.firstName} ${assessment.assessedBy.lastName} · ` : ""}{new Date(assessment.updatedAt).toLocaleString("fr-FR")}</p>}
    {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
  </section>;
}
