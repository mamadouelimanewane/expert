export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard, Users, Briefcase, Clock, Receipt, FileText,
  RefreshCw, FileSpreadsheet, CalendarDays, Calculator, FolderPlus, ArrowRightLeft,
  ShieldAlert, ShieldCheck, UserCheck, Gavel,
  Rocket, Radar, Scale, Activity, Globe,
  CreditCard, Landmark, Coins,
  TrendingUp, Download, Ship, Network, Leaf, UserPlus,
  BookOpen, GraduationCap, MessageCircle, Building2,
  Layers, Wallet, FileCheck, PenTool
} from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TaxDeclaration, Client } from "@prisma/client";
import { AuditService } from "@/lib/audit";

// ─────────────────────────────────────────────────────────────────────────────
// Hub principal du cabinet — c'est la page réelle vers laquelle /login
// redirige après connexion (voir router.push("/bi") dans src/app/login/
// page.tsx). Reprend le même contenu que /dashboard, qui devient un simple
// redirect ici pour éviter de maintenir deux copies du même Hub.
// ─────────────────────────────────────────────────────────────────────────────

type TaxDeclarationWithClient = TaxDeclaration & { client: Client | null };
type AuditLogWithUser = any;

const HUB_CATEGORIES = [
  {
    title: "Expertise & Production",
    color: "#F29400", // Orange principal APIX
    items: [
      { href: "/comptabilite/production", icon: RefreshCw, label: "Production & Révision", desc: "Supervision des balances et états comptables", color: "#38bdf8" },
      { href: "/comptabilite/liasse-fiscale", icon: FileSpreadsheet, label: "Liasse Fiscale Auto", desc: "Génération automatique des liasses SYSCOHADA", color: "#f43f5e" },
      { href: "/fiscalite", icon: CalendarDays, label: "Fiscalité & Simulateur", desc: "Calcul des taxes et calendrier des échéances", color: "#818cf8" },
      { href: "/payroll", icon: Calculator, label: "Paie & Social (SN)", desc: "Gestion des bulletins adaptés zone UEMOA", color: "#a78bfa" },
      { href: "/documents", icon: FolderPlus, label: "GED Intelligente OCR", desc: "Scanner intelligent avec reconnaissance locale", color: "#fb923c", badge: "IA" },
    ]
  },
  {
    title: "Pilotage & Cabinet",
    color: "#006B3F", // Vert principal APIX
    items: [
      { href: "/clients", icon: Users, label: "Portefeuille Clients", desc: "CRM 360° avec identifiants locaux NIF / NINEA", color: "#10b981", badge: "Live" },
      { href: "/missions", icon: Briefcase, label: "Missions & Tâches", desc: "Gestion opérationnelle, statuts et workflows", color: "#4ade80" },
      { href: "/timesheets", icon: Clock, label: "Suivi des Temps", desc: "Rentabilité collaborative par dossier client", color: "#2dd4bf" },
      { href: "/billing", icon: Receipt, label: "Facturation & Honoraires", desc: "Suivi des encaissements et taxes localisées", color: "#fcd34d" },
    ]
  },
  {
    title: "Portail Client & Onboarding",
    color: "#db2777", // Rose
    items: [
      { href: "/portal/dashboard", icon: LayoutDashboard, label: "Espace Client", desc: "Tableau de bord dédié, accès par lien personnel", color: "#ec4899" },
      { href: "/onboarding/digital", icon: UserPlus, label: "Onboarding Digital", desc: "Vérification d'identité et mandat SEPA (Stripe)", color: "#f472b6" },
      { href: "/portal/custom-dashboard", icon: PenTool, label: "Personnalisation Portail", desc: "Widgets configurables par le client, synchronisés serveur", color: "#f9a8d4" },
      { href: "/collaboration/requests", icon: MessageCircle, label: "Centre de Requêtes", desc: "Suivi des demandes de justificatifs et signatures", color: "#fbcfe8" },
    ]
  },
  {
    title: "États Financiers & Reporting",
    color: "#2563eb", // Bleu
    items: [
      { href: "/etats-financiers/bilan", icon: FileSpreadsheet, label: "Bilan SYSCOHADA", desc: "Actif/Passif comparatif N vs N-1, calculé depuis la balance", color: "#3b82f6" },
      { href: "/etats-financiers/resultat", icon: TrendingUp, label: "Compte de Résultat", desc: "Soldes intermédiaires de gestion réels par client", color: "#60a5fa" },
      { href: "/etats-financiers/tft", icon: ArrowRightLeft, label: "Flux de Trésorerie", desc: "Méthode indirecte, équilibre garanti par construction", color: "#93c5fd" },
      { href: "/fec-export", icon: Download, label: "Export FEC", desc: "Fichier des Écritures Comptables au format normé", color: "#bfdbfe" },
    ]
  },
  {
    title: "Fiscalité Internationale",
    color: "#0891b2", // Cyan
    items: [
      { href: "/douanes/simulateur", icon: Ship, label: "Simulateur Douanes", desc: "Droits de douane TEC CEDEAO/CEMAC en temps réel", color: "#06b6d4" },
      { href: "/strategy/zone-franche", icon: Globe, label: "Zones Franches", desc: "Avantages fiscaux UEMOA/CEMAC et demande d'audit", color: "#22d3ee" },
      { href: "/strategy/devises", icon: Coins, label: "Hub Multi-Devises", desc: "Conversion en temps réel USD/EUR/GNF/FCFA", color: "#67e8f9" },
      { href: "/nexus-fiscal", icon: Landmark, label: "Nexus Fiscal", desc: "Assistant IA spécialisé fiscalité OHADA/UEMOA", color: "#a5f3fc", badge: "IA" },
    ]
  },
  {
    title: "Audit & Gouvernance",
    color: "#8b5cf6", // Violet principal APIX
    items: [
      { href: "/audit", icon: ShieldAlert, label: "Audit FEC (Forensic)", desc: "Détection des anomalies et fraudes caisse", color: "#8b5cf6", badge: "IA" },
      { href: "/audit/ai-assisted", icon: ShieldCheck, label: "Audit Légal (CAC)", desc: "Planification et notes de synthèse des commissaires", color: "#ec4899" },
      { href: "/compliance/kyc-screening", icon: UserCheck, label: "Conformité KYC / LCB-FT", desc: "Règles anti-blanchiment BCEAO intégrées", color: "#22c55e" },
      { href: "/governance", icon: Gavel, label: "Gouvernance & AG", desc: "Secrétariat juridique, tenues de PV et assemblées", color: "#fb7185" },
    ]
  },
  {
    title: "Conformité & Risques",
    color: "#dc2626", // Rouge
    items: [
      { href: "/compliance", icon: Scale, label: "Hub Conformité", desc: "Revue légale multi-textes OHADA / CGI / UEMOA", color: "#ef4444" },
      { href: "/compliance/uemoa-score", icon: FileCheck, label: "Score UEMOA/BCEAO", desc: "Checklist de conformité, persistée par dossier client", color: "#f87171" },
      { href: "/analysis/deep", icon: Network, label: "Investigation OSINT", desc: "Criblage sanctions OFAC / OpenSanctions en temps réel", color: "#fca5a5" },
      { href: "/strategy/radar", icon: Radar, label: "Veille Réglementaire", desc: "Analyse d'impact assistée par IA sur le portefeuille", color: "#fed7aa" },
    ]
  },
  {
    title: "Stratégie & Fintech",
    color: "#475569", // Slate principal APIX
    items: [
      { href: "/investment", icon: Activity, label: "Valorisation & M&A", desc: "Simulateur de fusion-acquisition et due diligence", color: "#94a3b8" },
      { href: "/strategy/business-plan", icon: Rocket, label: "Business Plan", desc: "Génération de BP et radars fiscaux prédictifs", color: "#facc15" },
      { href: "/fintech/payments", icon: CreditCard, label: "Paiements Mobile Money", desc: "Génération de QR codes Wave, Orange, MTN", color: "#60a5fa" },
      { href: "/fintech/scoring", icon: Coins, label: "Score Solvabilité IA", desc: "Modélisation du risque crédit client", color: "#f87171" },
    ]
  },
  {
    title: "Groupe & Patrimoine",
    color: "#6366f1", // Indigo
    items: [
      { href: "/corporate/consolidation", icon: Layers, label: "Consolidation Groupe", desc: "Périmètre multi-sociétés, import de balances et éliminations", color: "#818cf8" },
      { href: "/corporate/entity-hub", icon: Building2, label: "Entity Hub", desc: "Pilotage des filiales et gouvernance juridique", color: "#a5b4fc" },
      { href: "/strategy/wealth", icon: Wallet, label: "Wealth Optimizer", desc: "Patrimoine dirigeant et simulateur rémunération/dividendes", color: "#c7d2fe" },
      { href: "/bi/sustainability", icon: Leaf, label: "Reporting RSE/ESG", desc: "Indicateurs environnement, social et gouvernance", color: "#e0e7ff" },
    ]
  },
  {
    title: "Bibliothèque & Formation",
    color: "#d97706", // Amber
    items: [
      { href: "/library/ohada-cite", icon: BookOpen, label: "Bibliothèque OHADA", desc: "Actes uniformes et jurisprudence CCJA référencés", color: "#f59e0b" },
      { href: "/library/clause-bank", icon: FileText, label: "Banque de Clauses", desc: "Modèles de clauses juridiques téléchargeables", color: "#fbbf24" },
      { href: "/training/academy", icon: GraduationCap, label: "Academy", desc: "Formation continue des collaborateurs du cabinet", color: "#fcd34d" },
      { href: "/signature/lettres-mission", icon: PenTool, label: "Signature Électronique", desc: "Validation par hash des lettres de mission", color: "#fde68a" },
    ]
  }
];

export default async function BusinessIntelligencePage() {
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
    <div className="p-3 sm:p-6 lg:p-8 space-y-8 sm:space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto">

      {/* Bandeau d'identité — adaptatif mobile / desktop */}
      <div
        className="p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl text-white"
        style={{
          background: 'linear-gradient(135deg, #006B3F 0%, #009639 100%)',
        }}
      >
        <p role="heading" aria-level={1} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight m-0">
          CABINET<span style={{ color: '#F29400' }}>360</span>
        </p>
        <p className="text-sm sm:text-base lg:text-lg text-emerald-100 mt-2 font-medium">
          Plateforme complète de gestion pour cabinets d&apos;expertise comptable en zone OHADA.
        </p>
      </div>

      {/* HUB DES MODULES - RESPONSIVE GRID */}
      <div className="space-y-8 sm:space-y-12">
        {HUB_CATEGORIES.map((category, catIdx) => (
          <div key={catIdx} className="space-y-4 sm:space-y-6">

            {/* Category header with colored bar + bottom line border */}
            <div className="flex items-center gap-3 border-b-2 border-black/5 dark:border-white/10 pb-2.5">
              <div style={{ width: '6px', height: '24px', background: category.color, borderRadius: '4px', flexShrink: 0 }} className="sm:h-[30px] sm:w-[8px]"></div>
              <p role="heading" aria-level={2} className="text-lg sm:text-xl lg:text-2xl font-extrabold m-0" style={{ color: category.color }}>
                {category.title}
              </p>
            </div>

            {/* Grid container — 1 col mobile, 2 cols tablet, 4 cols desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {(() => {
                const COLS = 4;
                const total = category.items.length;
                const remainder = total % COLS;
                const spanCount = remainder > 0 && COLS % remainder === 0 ? COLS / remainder : 1;
                return category.items.map((mod, index) => {
                const IconComponent = mod.icon;
                const isInLastPartialRow = remainder > 0 && index >= total - remainder;
                return (
                  <Link
                    key={index}
                    href={mod.href}
                    // Le span de la dernière rangée ne vaut que pour la grille
                    // 4 colonnes (lg) : appliqué en style inline, il créait des
                    // colonnes implicites et écrasait la grille 1 colonne du mobile.
                    className={`apix-hub-card relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl transition-all duration-300 ${
                      isInLastPartialRow && spanCount === 4 ? "lg:col-span-4" : isInLastPartialRow && spanCount === 2 ? "lg:col-span-2" : ""
                    }`}
                    style={{
                      ['--hover-color' as any]: mod.color,
                      ['--hover-color-30' as any]: `${mod.color}30`,
                      ['--hover-color-40' as any]: `${mod.color}40`,
                    }}
                  >
                    {mod.badge && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#006B3F] text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider shadow-sm">
                        {mod.badge}
                      </div>
                    )}

                    <div>
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shrink-0"
                        style={{
                          background: `${mod.color}15`,
                          color: mod.color,
                        }}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold mb-1 sm:mb-1.5 text-slate-900 dark:text-white leading-snug">
                        {mod.label}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>

                    <div
                      className="mt-4 pt-2 flex items-center font-bold text-xs sm:text-sm gap-1.5"
                      style={{ color: mod.color }}
                    >
                      Accéder <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
                });
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Live Data Insights & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-4 sm:pt-6">

        {/* Left Column: Deadlines Fiscales */}
        <div className="apix-card p-4 sm:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">Échéances Fiscales Récentes</h3>
            <Link href="/declarations" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#006B3F] hover:text-[#004b2c] transition-colors dark:text-primary">Voir le calendrier complet</Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentDeclarations.length > 0 ? recentDeclarations.map((task: TaxDeclarationWithClient, i: number) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 rounded-xl sm:rounded-2xl transition-all border border-black/5 dark:border-white/5 hover:border-[#006B3F]/30 cursor-pointer group gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 group-hover:bg-[#006B3F]/10 group-hover:text-[#006B3F] transition-all shadow-inner uppercase shrink-0">
                    {task.client?.country || "CI"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm sm:text-base text-slate-800 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-primary transition-colors truncate">
                      {task.client?.companyName || "Client inconnu"}
                    </p>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">{task.type} - {task.period}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">{format(new Date(task.dueDate), 'dd MMM', { locale: fr })}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date limite</p>
                  </div>
                  <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shadow-sm ${task.status === 'VALIDATED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                    task.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" :
                      "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-white/10"
                    }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-slate-500 font-medium text-sm">Aucune échéance fiscale à venir.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="apix-card p-4 sm:p-6 rounded-2xl">
          <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight mb-6">Flux d'Activité Système</h3>
          <div className="pl-5 sm:pl-6 border-l-2 border-slate-300 dark:border-slate-800 space-y-6 sm:space-y-8">
            {recentLogs.length > 0 ? recentLogs.map((act: AuditLogWithUser, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[29px] sm:-left-[33px] top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-4 border-white dark:border-slate-900 bg-[#006B3F] shadow-[0_0_15px_rgba(0,107,63,0.5)] group-hover:scale-125 transition-all" />
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#006B3F] dark:group-hover:text-white transition-colors leading-snug">{act.action}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{act.details || "Action effectuée dans le système"}</p>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 mt-2 sm:mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-700 rounded-full" />
                  {format(new Date(act.createdAt), 'HH:mm', { locale: fr })} • {act.user?.firstName || "Système"}
                </p>
              </div>
            )) : (
              <div className="relative group">
                <div className="absolute -left-[29px] sm:-left-[33px] top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-4 border-white dark:border-slate-900 bg-slate-700" />
                <p className="text-sm font-bold text-slate-500">En attente d'activités...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
