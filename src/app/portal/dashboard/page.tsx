"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FinancialHealthGauge } from "@/components/portal/FinancialHealthGauge";
import { ScoreEvolutionChart } from "@/components/portal/ScoreEvolutionChart";
import {
  TrendingUp, FileText, Bell, Banknote, Calendar,
  CheckCircle, Clock, ArrowRight, Upload, Smartphone,
  ChevronUp, ChevronDown, Award, AlertTriangle, Zap
} from "lucide-react";

// Données client connecté — en prod: session + API
const CLIENT = {
  name: "Tech Startup CI",
  sector: "Technologie",
  country: "CI",
  score: 88,
  rating: "AAA",
  eligible: true,
  evolution: [
    { month: "Jan", score: 70 }, { month: "Fév", score: 74 }, { month: "Mar", score: 78 },
    { month: "Avr", score: 81 }, { month: "Mai", score: 85 }, { month: "Jun", score: 88 },
  ],
};

const RECENT_ENTRIES = [
  { date: "2026-06-03", libelle: "Vente prestation conseil", montant: "+200,000 F", status: "validé" },
  { date: "2026-06-03", libelle: "Abonnement Orange Money", montant: "-25,000 F", status: "validé" },
  { date: "2026-06-02", libelle: "Recette vente logiciel", montant: "+150,000 F", status: "validé" },
  { date: "2026-06-01", libelle: "Achat fournitures bureau", montant: "-45,000 F", status: "en attente" },
];

const MISSIONS = [
  { title: "Déclaration TVA — Juin 2026", due: "J-12", urgent: false },
  { title: "Bilan annuel 2025 à finaliser", due: "J-45", urgent: false },
  { title: "Dépôt comptes RCCM", due: "J-5", urgent: true },
];

export default function PortailDashboard() {
  const [showNotif, setShowNotif] = useState(true);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">

      {/* Alerte Score */}
      {showNotif && (
        <div className="flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">🎉 Félicitations ! Votre score est passé à <span className="text-indigo-400">AAA (88/100)</span></p>
            <p className="text-slate-400 text-xs">Vous êtes maintenant éligible à un dossier de crédit automatique certifié par votre cabinet.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/fintech/credit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-colors">
              Dossier Crédit
            </Link>
            <button onClick={() => setShowNotif(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* Hero Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Score */}
        <div className="lg:col-span-1">
          <FinancialHealthGauge score={CLIENT.score} rating={CLIENT.rating} clientName={CLIENT.name} />
          {CLIENT.eligible && (
            <Link href="/fintech/credit"
              className="mt-3 flex items-center justify-center gap-2 py-3 w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors">
              <Banknote className="w-4 h-4" /> Générer mon Dossier Crédit <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Évolution + Actions rapides */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart évolution */}
          <div className="bg-slate-900/40 border border-white/5 rounded-[24px] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Évolution Score — 6 mois</p>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                <ChevronUp className="w-3.5 h-3.5" /> +18 pts en 6 mois
              </div>
            </div>
            <ScoreEvolutionChart data={CLIENT.evolution} color="#10b981" height={120} />
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Saisie Rapide", icon: Upload, href: "/portal/saisie", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
              { label: "Sync Mobile Money", icon: Smartphone, href: "/portal/saisie", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
              { label: "Dossier Crédit", icon: Banknote, href: "/fintech/credit", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${a.color} text-center transition-all hover:scale-[1.02] active:scale-95`}>
                <a.icon className="w-5 h-5" />
                <span className="text-xs font-black">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Missions & Dernières écritures */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Dernières écritures */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Mes Dernières Opérations
            </h3>
            <Link href="/portal/saisie" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              Ajouter <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {RECENT_ENTRIES.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.montant.startsWith("+") ? "bg-emerald-400" : "bg-rose-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{e.libelle}</p>
                  <p className="text-[10px] text-slate-500">{e.date}</p>
                </div>
                <span className={`text-xs font-black tabular-nums flex-shrink-0 ${e.montant.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{e.montant}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border flex-shrink-0 ${e.status === "validé" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Missions & Alertes fiscales */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Alertes & Échéances
            </h3>
            <Bell className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {MISSIONS.map((m, i) => (
              <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${m.urgent ? "bg-rose-500/5 border-rose-500/20" : "bg-slate-800/40 border-white/5"}`}>
                {m.urgent
                  ? <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  : <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{m.title}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-black border flex-shrink-0 ${m.urgent ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-slate-400 bg-slate-800 border-white/5"}`}>
                  {m.due}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
            <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-400 font-bold text-xs">Transmission automatique</p>
              <p className="text-slate-500 text-[10px] mt-0.5">Votre cabinet reçoit vos pièces en temps réel et traite vos déclarations avant chaque échéance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
