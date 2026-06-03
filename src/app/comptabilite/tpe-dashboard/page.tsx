"use client";

import { useState, useEffect } from "react";
import {
  Users, TrendingUp, Wallet, MessageCircle, Star, ShieldCheck,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Zap, BarChart3,
  FileText, Loader2, CheckCircle2, Building2, Phone, Plus, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Données Mock des TPE ---
const MOCK_TPE: any[] = [
  {
    id: "tpe-001", businessName: "Boutique Awa", owner: "Awa Diallo", phone: "+221 77 123 45 67",
    activity: "Commerce Général", since: "Jan 2026", country: "SN",
    creditScore: 87, creditRating: "A",
    weeklyCA: 450000, weeklyExpenses: 120000,
    totalJournals: 142, pendingJournals: 3,
    mobileMoneyVol: 1800000,
    trend: "UP", trendPct: 12,
    lastMessage: "J'ai vendu pour 80 000 aujourd'hui Alhamdulilah",
    lastActivity: "Il y a 2h"
  },
  {
    id: "tpe-002", businessName: "Atelier Moussa", owner: "Moussa Koné", phone: "+221 76 987 65 43",
    activity: "Artisanat / Couture", since: "Mar 2026", country: "SN",
    creditScore: 61, creditRating: "B",
    weeklyCA: 210000, weeklyExpenses: 95000,
    totalJournals: 78, pendingJournals: 12,
    mobileMoneyVol: 620000,
    trend: "DOWN", trendPct: 4,
    lastMessage: "J'ai payé 15 000 pour le tissu",
    lastActivity: "Il y a 5h"
  },
  {
    id: "tpe-003", businessName: "Pharmacie Dior", owner: "Dior Sene", phone: "+221 70 456 78 90",
    activity: "Santé / Parapharmacie", since: "Nov 2025", country: "SN",
    creditScore: 94, creditRating: "AAA",
    weeklyCA: 1200000, weeklyExpenses: 550000,
    totalJournals: 342, pendingJournals: 0,
    mobileMoneyVol: 5400000,
    trend: "UP", trendPct: 22,
    lastMessage: "Vente de médicaments: 150 000 F",
    lastActivity: "Il y a 30min"
  },
  {
    id: "tpe-004", businessName: "Transport Ibra", owner: "Ibrahima Ba", phone: "+221 78 321 09 87",
    activity: "Transport / Logistique", since: "Feb 2026", country: "SN",
    creditScore: 43, creditRating: "C",
    weeklyCA: 95000, weeklyExpenses: 88000,
    totalJournals: 22, pendingJournals: 8,
    mobileMoneyVol: 190000,
    trend: "DOWN", trendPct: 15,
    lastMessage: "Carburant: 20 000 F dépensé",
    lastActivity: "Il y a 1j"
  },
];

const RATING_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  AAA: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  A: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  B: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  C: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function TpeDashboard() {
  const [tpeList] = useState(MOCK_TPE);
  const [selected, setSelected] = useState<any>(MOCK_TPE[0]);
  const [search, setSearch] = useState("");
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const filtered = tpeList.filter(t =>
    t.businessName.toLowerCase().includes(search.toLowerCase()) ||
    t.owner.toLowerCase().includes(search.toLowerCase())
  );

  const totalCA = tpeList.reduce((a, t) => a + t.weeklyCA, 0);
  const totalEcritures = tpeList.reduce((a, t) => a + t.totalJournals, 0);
  const totalPending = tpeList.reduce((a, t) => a + t.pendingJournals, 0);

  const handleSendReport = async () => {
    setIsSendingReport(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSendingReport(false);
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  const handleGenerateCredit = () => {
    alert(`Attestation de Revenus Informels générée pour ${selected?.businessName}\n\nScore: ${selected?.creditRating} (${selected?.creditScore}/100)\nCA Hebdo: ${selected?.weeklyCA.toLocaleString()} F\n\nFichier prêt à être signé par l'Expert-Comptable.`);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center shadow-xl shadow-violet-500/10">
            <BarChart3 className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Dashboard BPO TPE</h2>
            <p className="text-slate-400 mt-1">Pilotez vos abonnés du secteur informel. Flux WhatsApp, scores de crédit et attestations en temps réel.</p>
          </div>
        </div>
        <button className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter un TPE
        </button>
      </div>

      {/* KPI Globaux */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "TPE Abonnés", val: tpeList.length, sub: "+1 ce mois", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
          { icon: TrendingUp, label: "CA Hebdo Cumulé", val: totalCA.toLocaleString() + " F", sub: "+18% vs semaine préc.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { icon: FileText, label: "Écritures Générées", val: totalEcritures, sub: `${totalPending} en attente`, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
          { icon: AlertTriangle, label: "En Attente Validation", val: totalPending, sub: "À traiter aujourd'hui", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        ].map((kpi, i) => (
          <div key={i} className={cn("rounded-[24px] border p-5", kpi.color)}>
            <kpi.icon className="w-5 h-5 mb-4" />
            <p className="text-3xl font-black tabular-nums">{kpi.val}</p>
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

          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filtered.map(tpe => {
              const r = RATING_STYLES[tpe.creditRating] || RATING_STYLES.C;
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
                      {tpe.creditRating}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <ScoreBar score={tpe.creditScore} color={tpe.creditRating === "AAA" ? "#10b981" : tpe.creditRating === "A" ? "#3b82f6" : tpe.creditRating === "B" ? "#f59e0b" : "#ef4444"} />
                    <span className={cn("ml-3 text-xs font-black shrink-0 flex items-center gap-1", tpe.trend === "UP" ? "text-emerald-400" : "text-rose-400")}>
                      {tpe.trend === "UP" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {tpe.trendPct}%
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-2">{tpe.lastActivity}</p>
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
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border", RATING_STYLES[selected.creditRating]?.bg, RATING_STYLES[selected.creditRating]?.text, RATING_STYLES[selected.creditRating]?.border)}>
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
                      disabled={isSendingReport}
                      className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 rounded-xl font-black text-xs transition-all flex items-center gap-2"
                    >
                      {reportSent
                        ? <><CheckCircle2 className="w-4 h-4" /> Envoyé !</>
                        : isSendingReport
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</>
                        : <><MessageCircle className="w-4 h-4" /> Rapport WhatsApp</>
                      }
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
                  <div className={cn("p-6 rounded-2xl border", RATING_STYLES[selected.creditRating]?.bg, RATING_STYLES[selected.creditRating]?.border)}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Score de Crédit IA</p>
                    <div className="flex items-end gap-3">
                      <span className={cn("text-6xl font-black tabular-nums", RATING_STYLES[selected.creditRating]?.text)}>
                        {selected.creditScore}
                      </span>
                      <div className="pb-1">
                        <p className={cn("text-2xl font-black", RATING_STYLES[selected.creditRating]?.text)}>{selected.creditRating}</p>
                        <p className="text-[10px] text-slate-500">/ 100 pts</p>
                      </div>
                    </div>
                    <ScoreBar score={selected.creditScore} color={selected.creditRating === "AAA" ? "#10b981" : selected.creditRating === "A" ? "#3b82f6" : selected.creditRating === "B" ? "#f59e0b" : "#ef4444"} />
                    <p className="text-xs text-slate-400 mt-3">
                      {selected.creditScore >= 80 ? "✅ Éligible au micro-crédit bancaire" :
                       selected.creditScore >= 60 ? "⚡ Profil en cours de consolidation" :
                       "⚠️ Profil à risque — accompagnement renforcé"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "CA Hebdomadaire", val: selected.weeklyCA.toLocaleString() + " F", icon: TrendingUp, color: "text-emerald-400" },
                      { label: "Dépenses Hebdo", val: selected.weeklyExpenses.toLocaleString() + " F", icon: Wallet, color: "text-rose-400" },
                      { label: "Bénéfice Estimé", val: (selected.weeklyCA - selected.weeklyExpenses).toLocaleString() + " F", icon: Star, color: "text-amber-400" },
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

              {/* Dernier message + activité */}
              <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Dernier message reçu
                </h4>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0">
                    {selected.businessName.charAt(0)}
                  </div>
                  <div className="flex-1 bg-slate-800/40 rounded-2xl rounded-tl-none p-4 border border-white/5">
                    <p className="text-white text-sm italic">"{selected.lastMessage}"</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold">via WhatsApp · {selected.lastActivity}</p>
                  </div>
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
