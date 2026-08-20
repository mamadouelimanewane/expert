export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import { 
  Plus, Scan, Lock, ArrowRight,
  LayoutDashboard, Users, Briefcase, Clock, Receipt, FileText,
  RefreshCw, FileSpreadsheet, CalendarDays, Calculator, FolderPlus, ArrowRightLeft,
  ShieldAlert, ShieldCheck, UserCheck, Gavel,
  Rocket, Radar, Scale, Activity, Globe,
  Smartphone, CreditCard, Landmark, Coins,
  BrainCircuit, Sparkles
} from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TaxDeclaration, Client } from "@prisma/client";
import { AuditService } from "@/lib/audit";

type TaxDeclarationWithClient = TaxDeclaration & { client: Client | null };
type AuditLogWithUser = any;

const HUB_CATEGORIES = [
  {
    title: "Pilotage & Cabinet",
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    items: [
      { href: "/clients", icon: Users, label: "Portefeuille Clients", desc: "CRM 360° et gestion des contacts", badge: "Live" },
      { href: "/missions", icon: Briefcase, label: "Missions & Tâches", desc: "Suivi opérationnel des processus" },
      { href: "/timesheets", icon: Clock, label: "Suivi des Temps", desc: "Rentabilité et time-tracking collaborateurs" },
      { href: "/billing", icon: Receipt, label: "Facturation & Honoraires", desc: "Suivi du chiffre d'affaires et encours" },
    ]
  },
  {
    title: "Production & Expertise",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    items: [
      { href: "/comptabilite/production", icon: RefreshCw, label: "Production & Révision", desc: "Supervision comptable au quotidien" },
      { href: "/comptabilite/liasse-fiscale", icon: FileSpreadsheet, label: "Liasse Fiscale Auto", desc: "Génération liasses SYSCOHADA" },
      { href: "/fiscalite", icon: CalendarDays, label: "Fiscalité & Simulateur", desc: "Calendrier et optimisation fiscale" },
      { href: "/payroll", icon: Calculator, label: "Paie & Social (SN)", desc: "Gestion des bulletins multi-pays" },
      { href: "/documents", icon: FolderPlus, label: "GED Intelligente OCR", desc: "Scanner intelligent et reconnaissance", badge: "IA" },
    ]
  },
  {
    title: "Audit, Risques & Gouvernance",
    color: "from-rose-500/20 to-red-500/20",
    borderColor: "border-rose-500/30",
    iconColor: "text-rose-400",
    items: [
      { href: "/audit", icon: ShieldAlert, label: "Audit FEC (Forensic)", desc: "Détection des anomalies comptables", badge: "IA" },
      { href: "/audit/ai-assisted", icon: ShieldCheck, label: "Audit Légal (CAC)", desc: "Outils de commissariat aux comptes" },
      { href: "/compliance/kyc-screening", icon: UserCheck, label: "Conformité KYC / LCB-FT", desc: "Vérification client et conformité" },
      { href: "/governance", icon: Gavel, label: "Gouvernance & AG", desc: "Secrétariat juridique et assemblées" },
    ]
  },
  {
    title: "Stratégie & Fintech",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    items: [
      { href: "/investment", icon: Activity, label: "Valorisation & M&A", desc: "Modélisation financière et conseil" },
      { href: "/strategy/business-plan", icon: Rocket, label: "Business Plan", desc: "Génération de BP et projections IA" },
      { href: "/fintech/payments", icon: CreditCard, label: "Hub Paiements Wave / OM", desc: "Mobile money & encaissement rapide", badge: "Fintech" },
      { href: "/fintech/scoring", icon: Coins, label: "Score Solvabilité IA", desc: "Analyse prédictive de crédit" },
    ]
  }
];

export default async function Home() {
  // Récupération des données réelles
  const [recentDeclarations, recentLogs] = await Promise.all([
    prisma.taxDeclaration.findMany({
      take: 4,
      orderBy: { dueDate: 'asc' },
      include: { client: true }
    }),
    AuditService.getRecentLogs(4)
  ]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/50 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-[-50%] right-[-10%] w-[50%] h-[150%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Cabinet Connecté & Intelligent
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Système Central d'Exploitation Cabinet
          </h2>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
            Accédez à l'ensemble des modules d'expertise, de pilotage financier, d'audit assisté par IA et de gestion de portefeuille client de la zone OHADA.
          </p>
          <div className="flex items-center gap-3 pt-4 flex-wrap">
            <a href="/dashboard/confidentiel" className="px-6 py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-amber-500/20 flex items-center justify-center gap-2 shadow-lg">
              <Lock className="w-4 h-4" /> Stats Confidentielles
            </a>
            <a href="/scan" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/5 flex items-center justify-center gap-2 shadow-lg">
              <Scan className="w-4 h-4" /> Scanner Pièce OCR
            </a>
          </div>
        </div>
      </div>

      {/* HUB DES MODULES (THEMES/BOXES SYSTEM) */}
      <div className="space-y-8">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Hub de Services Expert</h3>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">Sélectionnez un domaine fonctionnel pour accéder aux applications métiers correspondantes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {HUB_CATEGORIES.map((cat, catIdx) => (
            <div 
              key={catIdx} 
              className={`rounded-[32px] p-6 sm:p-8 bg-gradient-to-b ${cat.color} border ${cat.borderColor} shadow-xl flex flex-col justify-between`}
            >
              <div className="space-y-6">
                <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-current opacity-70" />
                  {cat.title}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cat.items.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <Link 
                        key={idx} 
                        href={item.href}
                        className="group p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900/90 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between h-36 relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                          <div className={`p-2.5 rounded-xl bg-slate-800 group-hover:scale-110 transition-transform ${cat.iconColor}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            {item.label}
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-2">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Data Insights & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">

        {/* Left Column: Deadlines Fiscales */}
        <div className="lg:col-span-2 glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white tracking-tight">Échéances Fiscales Récentes</h3>
            <Link href="/declarations" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">Voir le calendrier complet</Link>
          </div>

          <div className="space-y-4">
            {recentDeclarations.length > 0 ? recentDeclarations.map((task: TaxDeclarationWithClient, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/60 rounded-2xl transition-all border border-white/5 hover:border-indigo-500/30 cursor-pointer group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all shadow-inner uppercase">
                    {task.client?.country || "CI"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                      {task.client?.companyName || "Client inconnu"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{task.type} - {task.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-white">{format(new Date(task.dueDate), 'dd MMM', { locale: fr })}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Date limite</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${task.status === 'VALIDATED' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    task.status === 'PENDING' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-slate-800/80 text-slate-400 border-white/10"
                    }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-slate-500 font-medium">Aucune échéance fiscale à venir.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
          <h3 className="text-xl font-black text-white tracking-tight mb-8">Flux d'Activité Système</h3>
          <div className="pl-6 border-l-2 border-slate-800 space-y-8">
            {recentLogs.length > 0 ? recentLogs.map((act: AuditLogWithUser, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-all" />
                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{act.action}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{act.details || "Action effectuée dans le système"}</p>
                <p className="text-[9px] font-black text-slate-600 mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                  {format(new Date(act.createdAt), 'HH:mm', { locale: fr })} • {act.user?.firstName || "Système"}
                </p>
              </div>
            )) : (
              <div className="relative group">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-slate-900 bg-slate-700" />
                <p className="text-sm font-bold text-slate-500">En attente d'activités...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
