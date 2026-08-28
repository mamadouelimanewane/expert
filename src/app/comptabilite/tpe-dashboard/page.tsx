"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Users, TrendingUp, Wallet, MessageCircle, Star, ShieldCheck,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Zap, BarChart3,
  FileText, Building2, Phone, Plus, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tpe = {
  id: string;
  businessName: string;
  owner: string;
  phone: string;
  activity: string;
  since: string;
  country: string;
  creditScore: number | null;
  creditRating: string | null;
  periodCA: number;
  periodExpenses: number;
  totalJournals: number;
  pendingJournals: number;
  mobileMoneyVol: number;
  trend: "UP" | "DOWN" | null;
  trendPct: number;
  lastEntry: { libelle: string; date: string } | null;
};

const RATING_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  AAA: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  A: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  B: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  C: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  NON_EVALUE: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
};

function ratingStyle(rating: string | null) {
  return (rating && RATING_STYLES[rating]) || RATING_STYLES.NON_EVALUE;
}

function ratingColor(rating: string | null) {
  return rating === "AAA" ? "#10b981" : rating === "A" ? "#3b82f6" : rating === "B" ? "#f59e0b" : rating === "C" ? "#ef4444" : "#64748b";
}

function ScoreBar({ score, color }: { score: number | null; color: string }) {
  return (
    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${score ?? 0}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function TpeDashboard() {
  const [tpeList, setTpeList] = useState<Tpe[]>([]);
  const [selected, setSelected] = useState<Tpe | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/comptabilite/tpe-stats").then(r => r.json()),
      fetch("/api/fintech/mobile-money").then(r => r.json()),
    ]).then(([clientsRes, tpeStats, mmTx]) => {
      const clients = clientsRes.clients || [];
      const stats: any[] = Array.isArray(tpeStats) ? tpeStats : [];
      const transactions: any[] = Array.isArray(mmTx?.transactions) ? mmTx.transactions : [];

      const list: Tpe[] = clients.map((c: any) => {
        const businessName = c.companyName || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();
        const stat = stats.find(s => s.businessName === businessName);
        const periodes = (stat?.periodes || []).slice().sort((a: any, b: any) => a.periode.localeCompare(b.periode));
        const lastPeriode = periodes[periodes.length - 1];
        const prevPeriode = periodes[periodes.length - 2];

        let trend: "UP" | "DOWN" | null = null;
        let trendPct = 0;
        if (lastPeriode && prevPeriode && prevPeriode.totalEntrees > 0) {
          const delta = ((lastPeriode.totalEntrees - prevPeriode.totalEntrees) / prevPeriode.totalEntrees) * 100;
          trend = delta >= 0 ? "UP" : "DOWN";
          trendPct = Math.round(Math.abs(delta));
        }

        const pendingJournals = periodes
          .filter((p: any) => p.status !== "EXPORTED")
          .reduce((a: number, p: any) => a + p.count, 0);

        const mobileMoneyVol = transactions
          .filter(t => t.clientId === c.id)
          .reduce((a, t) => a + (t.amount || 0), 0);

        return {
          id: c.id,
          businessName: businessName || "—",
          owner: c.type === "ENTREPRISE" ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "—" : businessName,
          phone: c.phone || "—",
          activity: c.sector || "—",
          since: c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "—",
          country: c.country || "—",
          creditScore: c.healthScore ?? null,
          creditRating: c.rating ?? null,
          periodCA: lastPeriode?.totalEntrees || 0,
          periodExpenses: lastPeriode?.totalSorties || 0,
          totalJournals: stat?.totalEcritures || 0,
          pendingJournals,
          mobileMoneyVol,
          trend,
          trendPct,
          lastEntry: null,
        };
      });

      setTpeList(list);
      setSelected(list[0] || null);
      setLoading(false);
    });
  }, []);

  const filtered = tpeList.filter(t =>
    t.businessName.toLowerCase().includes(search.toLowerCase()) ||
    t.owner.toLowerCase().includes(search.toLowerCase())
  );

  const totalCA = tpeList.reduce((a, t) => a + t.periodCA, 0);
  const totalEcritures = tpeList.reduce((a, t) => a + t.totalJournals, 0);
  const totalPending = tpeList.reduce((a, t) => a + t.pendingJournals, 0);

  const handleSendReport = () => {
    alert("L'envoi de rapport par WhatsApp Business n'est pas encore configuré (variable WHATSAPP_VERIFY_TOKEN manquante). Aucun message n'a été envoyé.");
  };

  const handleGenerateCredit = () => {
    if (!selected) return;
    if (selected.creditScore == null || selected.creditRating == null) {
      alert(`Impossible de générer une attestation pour ${selected.businessName} : aucun score de solvabilité n'a encore été évalué pour ce client.`);
      return;
    }
    alert(`Attestation de Revenus Informels — ${selected.businessName}\n\nScore: ${selected.creditRating} (${selected.creditScore}/100)\nCA de la période: ${selected.periodCA.toLocaleString()} F\n\nDonnées issues de la comptabilité TPE enregistrée. Brouillon à vérifier avant signature par l'Expert-Comptable — aucun fichier n'a été généré ou téléchargé.`);
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Chargement des TPE…</div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center shadow-xl shadow-violet-500/10">
            <BarChart3 className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h2 className="page-title">Dashboard BPO TPE</h2>
            <p className="page-subtitle">Pilotez vos abonnés du secteur informel. Flux WhatsApp, scores de crédit et attestations en temps réel.</p>
          </div>
        </div>
        <Link href="/clients/new" className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un TPE
        </Link>
      </div>

      {/* KPI Globaux */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "TPE Abonnés", val: tpeList.length, sub: "Clients actifs", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
          { icon: TrendingUp, label: "CA Cumulé (dernière période)", val: totalCA.toLocaleString() + " F", sub: "Somme des périodes les plus récentes", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { icon: FileText, label: "Écritures Générées", val: totalEcritures, sub: `${totalPending} en attente`, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { icon: AlertTriangle, label: "En Attente Validation", val: totalPending, sub: "Non encore exportées", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ].map((kpi, i) => (
          <div key={i} className={cn("rounded-[24px] border p-5", kpi.color)}>
            <kpi.icon className="w-5 h-5 mb-4" />
            <p className="text-xl sm:text-2xl lg:text-3xl font-black tabular-nums">{kpi.val}</p>
            <p className="text-xs font-bold mt-1 opacity-70">{kpi.label}</p>
            <p className="text-[10px] mt-2 opacity-50">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="grid lg:grid-cols-12 gap-8">

        {/* Liste des TPE */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-white/5 rounded-[28px] p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-2 max-h-[350px] sm:h-[450px] lg:h-[600px] overflow-y-auto custom-scrollbar">
            {filtered.map(tpe => {
              const r = ratingStyle(tpe.creditRating);
              const isSelected = selected?.id === tpe.id;
              return (
                <div
                  key={tpe.id}
                  onClick={() => setSelected(tpe)}
                  className={cn(
                    "cursor-pointer p-4 rounded-2xl border transition-all",
                    isSelected ? "bg-violet-600/10 border-violet-500/30" : "bg-slate-800/20 border-transparent hover:bg-slate-800/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0", r.bg, r.text)}>
                        {tpe.businessName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-bold text-sm truncate", isSelected ? "text-violet-300" : "text-white")}>{tpe.businessName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{tpe.activity}</p>
                      </div>
                    </div>
                    <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black border shrink-0", r.bg, r.text, r.border)}>
                      {tpe.creditRating ?? "N/É"}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <ScoreBar score={tpe.creditScore} color={ratingColor(tpe.creditRating)} />
                    {tpe.trend && (
                      <span className={cn("ml-3 text-xs font-black shrink-0 flex items-center gap-1", tpe.trend === "UP" ? "text-emerald-400" : "text-rose-400")}>
                        {tpe.trend === "UP" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tpe.trendPct}%
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-600 mt-2">Client depuis {tpe.since}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Détail TPE sélectionnée */}
        <div className="lg:col-span-8 space-y-6">
          {selected ? (
            <>
              {/* Fiche identité */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border", ratingStyle(selected.creditRating).bg, ratingStyle(selected.creditRating).text, ratingStyle(selected.creditRating).border)}>
                      {selected.businessName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{selected.businessName}</h3>
                      <p className="text-sm text-slate-400">{selected.owner} · {selected.activity}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {selected.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleSendReport}
                      title="Nécessite la configuration de l'API WhatsApp Business (WHATSAPP_VERIFY_TOKEN)"
                      className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 rounded-xl font-black text-xs transition-all flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Rapport WhatsApp
                    </button>
                    <button
                      onClick={handleGenerateCredit}
                      className="px-4 py-2.5 bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 text-violet-400 rounded-xl font-black text-xs transition-all flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" /> Attestation Crédit
                    </button>
                  </div>
                </div>

                {/* Score de Crédit */}
                <div className="mt-8 grid sm:grid-cols-2 gap-6">
                  <div className={cn("p-6 rounded-2xl border", ratingStyle(selected.creditRating).bg, ratingStyle(selected.creditRating).border)}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Score de Solvabilité</p>
                    <div className="flex items-end gap-3">
                      <span className={cn("text-xl sm:text-2xl lg:text-3xl sm:text-4xl lg:text-6xl font-black tabular-nums", ratingStyle(selected.creditRating).text)}>
                        {selected.creditScore ?? "—"}
                      </span>
                      <div className="pb-1">
                        <p className={cn("text-2xl font-black", ratingStyle(selected.creditRating).text)}>{selected.creditRating ?? "N/É"}</p>
                        <p className="text-[10px] text-slate-500">/ 100 pts</p>
                      </div>
                    </div>
                    <ScoreBar score={selected.creditScore} color={ratingColor(selected.creditRating)} />
                    <p className="text-xs text-slate-400 mt-3">
                      {selected.creditScore == null ? "— Non évalué : aucun score de solvabilité disponible pour ce client." :
                       selected.creditScore >= 80 ? "✅ Éligible au micro-crédit bancaire" :
                       selected.creditScore >= 60 ? "⚡ Profil en cours de consolidation" :
                       "⚠️ Profil à risque — accompagnement renforcé"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "CA (dernière période)", val: selected.periodCA.toLocaleString() + " F", icon: TrendingUp, color: "text-emerald-400" },
                      { label: "Dépenses (dernière période)", val: selected.periodExpenses.toLocaleString() + " F", icon: Wallet, color: "text-rose-400" },
                      { label: "Bénéfice Estimé", val: (selected.periodCA - selected.periodExpenses).toLocaleString() + " F", icon: Star, color: "text-amber-400" },
                      { label: "Volume Mobile Money", val: selected.mobileMoneyVol.toLocaleString() + " F", icon: Zap, color: "text-violet-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <item.icon className={cn("w-4 h-4", item.color)} />
                          <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                        </div>
                        <span className={cn("text-sm font-black tabular-nums", item.color)}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Canal de messagerie */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Messagerie WhatsApp
                </h4>
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-300">
                    Intégration WhatsApp Business à configurer (variable <code className="text-amber-200">WHATSAPP_VERIFY_TOKEN</code>) pour recevoir les messages de ce client ici.
                  </p>
                </div>
              </div>

              {/* Stats Écritures */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{selected.totalJournals}</p>
                    <p className="text-xs text-slate-400">Écritures générées</p>
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-amber-500/20 rounded-[24px] p-5 flex items-center gap-4 bg-amber-500/5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-400">{selected.pendingJournals}</p>
                    <p className="text-xs text-slate-400">En attente de validation</p>
                  </div>
                </div>
              </div>

            </>
          ) : (
            <div className="h-full flex items-center justify-center opacity-40">
              <p className="text-slate-400">Sélectionnez une TPE pour voir les détails</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
