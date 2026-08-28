"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid, AlertTriangle, Smartphone,
  Clock, FileText, Building2, Globe, Loader2, XCircle,
  ShieldCheck, Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

const RATING_COLOR: Record<string, string> = {
  AAA: "#10b981", AA: "#6366f1", A: "#3b82f6", B: "#f59e0b", C: "#ef4444"
};

interface ClientData {
  id: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  sector?: string;
  country: string;
  rccm?: string;
  agStatus?: string | null;
  mandatStatus?: string | null;
  depotComptesStatus?: string | null;
  kycStatus?: string | null;
  healthScore?: number | null;
  rating?: string | null;
  tpeJournals: any[];
  missions: any[];
  declarations: any[];
  documents: any[];
  _count: { tpeJournals: number; missions: number; invoices: number };
}

function ScorePill({ rating }: { rating: string }) {
  const color = RATING_COLOR[rating] || "#64748b";
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black border" style={{ color, background: color + "15", borderColor: color + "30" }}>
      {rating}
    </span>
  );
}

function PortalDashboardInner() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/portal/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setClient(data.client);
      })
      .catch(() => setError("Impossible de charger votre espace."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-8">
        <div className="max-w-md w-full bg-slate-900/60 border border-white/5 rounded-[28px] p-10 text-center space-y-4">
          <LayoutGrid className="w-14 h-14 text-slate-600 mx-auto" />
          <h2 className="page-title-dark mb-0">Accès requis</h2>
          <p className="page-subtitle-dark mb-0">
            Cet espace client s'ouvre uniquement via le lien personnel fourni par votre cabinet comptable.
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-8">
        <div className="max-w-md w-full bg-slate-900/60 border border-rose-500/20 rounded-[28px] p-10 text-center space-y-4">
          <XCircle className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="page-title-dark mb-0">Espace inaccessible</h2>
          <p className="page-subtitle-dark mb-0">{error || "Lien invalide."}</p>
        </div>
      </div>
    );
  }

  const name = client.companyName || `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Client";
  const rating = client.rating || null;
  const score = client.healthScore ?? null;
  const color = rating ? (RATING_COLOR[rating] || "#64748b") : "#64748b";

  const alerts: string[] = [];
  if (client.agStatus === "late") alerts.push("Assemblée Générale en retard");
  if (client.mandatStatus === "expiring") alerts.push("Mandat du commissaire arrivant à expiration");
  if (client.depotComptesStatus === "late") alerts.push("Dépôt des comptes en retard");
  if (client.kycStatus === "invalid") alerts.push("Dossier KYC à mettre à jour");

  const pendingDocs = client.documents?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0c10] p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex gap-4 items-center">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black border"
            style={{ background: color + "15", borderColor: color + "30", color }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <h2 className="page-title-dark mb-0">{name}</h2>
            <p className="page-subtitle-dark mb-0 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> {client.country}
              {client.sector && <> · {client.sector}</>}
              {client.rccm && <> · RCCM: {client.rccm}</>}
            </p>
          </div>
        </div>
        <Link href={`/portal/saisie?token=${token}`} className="px-5 py-3 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-400 rounded-xl font-black text-xs transition-all flex items-center gap-2">
          <Smartphone className="w-4 h-4" /> Saisie Rapide
        </Link>
      </div>

      {/* Score + alertes */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 p-6 rounded-[24px] border" style={{ background: color + "08", borderColor: color + "25" }}>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Score Santé Financière</p>
          <div className="flex items-center gap-4">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black tabular-nums" style={{ color }}>{score ?? "—"}</p>
            <div>
              {rating ? <ScorePill rating={rating} /> : <span className="text-xs text-slate-500">Non évalué</span>}
              <p className="text-[10px] text-slate-500 mt-2">
                {score === null ? "Score en attente d'évaluation par votre cabinet" :
                 score >= 80 ? "✅ Excellent — Éligible financement" :
                 score >= 60 ? "⚡ Bon — Quelques axes d'amélioration" :
                 "⚠️ À surveiller — Plan de redressement recommandé"}
              </p>
            </div>
          </div>
          {score !== null && (
            <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex items-center gap-3">
            <Upload className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Écritures envoyées</p>
              <p className="text-sm font-black text-white">{client._count.tpeJournals}</p>
            </div>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Missions en cours</p>
              <p className="text-sm font-black text-white">{client._count.missions}</p>
            </div>
          </div>
          <div className={cn("p-3 rounded-xl border flex items-center gap-3", pendingDocs > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-slate-800/40 border-white/5")}>
            <FileText className={cn("w-4 h-4 shrink-0", pendingDocs > 0 ? "text-amber-400" : "text-slate-500")} />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Documents</p>
              <p className={cn("text-sm font-black", pendingDocs > 0 ? "text-amber-400" : "text-white")}>{pendingDocs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-[24px] p-5 space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Alertes Détectées
          </p>
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-rose-500/10 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <p className="text-sm font-bold text-rose-300">{a}</p>
            </div>
          ))}
        </div>
      )}

      {/* Missions en cours */}
      {client.missions.length > 0 && (
        <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-6">
          <h3 className="font-black flex items-center gap-2 text-sm mb-4 text-white">
            <Building2 className="w-4 h-4 text-indigo-400" /> Missions en Cours
          </h3>
          <div className="space-y-2">
            {client.missions.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <p className="text-xs font-bold flex-1 text-white">{m.title}</p>
                {m.deadline && (
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(m.deadline).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link href={`/portal/saisie?token=${token}`} className="p-5 rounded-2xl border transition-all hover:scale-[1.02] group flex items-center gap-3 text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
          <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <p className="font-black text-xs">Envoyer mes écritures</p>
        </Link>
        <div className="p-5 rounded-2xl border transition-all flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
          <ShieldCheck className="w-5 h-5" />
          <p className="font-black text-xs">Score & Attestation</p>
        </div>
      </div>
    </div>
  );
}

export default function PortalDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0c10]"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>}>
      <PortalDashboardInner />
    </Suspense>
  );
}
