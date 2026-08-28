export const dynamic = 'force-dynamic';

import React from "react";
import Link from "next/link";
import {
  Scan, Lock, ArrowRight,
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

type TaxDeclarationWithClient = TaxDeclaration & { client: Client | null };
type AuditLogWithUser = any;

const HUB_CATEGORIES = [
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
    <div className="space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      
      {/* Header Banner - Matching APIX Linear Gradient & Circles */}
      <div 
        style={{ 
          marginBottom: '3rem', 
          background: 'linear-gradient(135deg, #006B3F 0%, #004b2c 100%)',
          padding: '3.5rem 3rem',
          borderRadius: '20px',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0, 107, 63, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', right: '50px', width: '100px', height: '100px', background: 'rgba(242, 148, 0, 0.1)', borderRadius: '50%' }}></div>

        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: 0, position: 'relative', zIndex: 10, lineHeight: 1.1 }} className="tracking-tight">
          Bienvenue sur le Hub Cabinet
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#e2e8f0', marginTop: '0.5rem', position: 'relative', zIndex: 10 }}>
          Gérez votre production, pilotez vos missions et automatisez vos flux avec l'écosystème Cabinet 360.
        </p>
        
        <div className="flex items-center gap-3 pt-6 relative z-10 flex-wrap">
          <a href="/dashboard/confidentiel" className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-full font-bold text-xs transition-all border border-amber-500/30 flex items-center justify-center gap-2 shadow-lg">
            <Lock className="w-4 h-4" /> Stats Confidentielles
          </a>
          <a href="/scan" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs transition-all border border-white/20 flex items-center justify-center gap-2 shadow-lg">
            <Scan className="w-4 h-4" /> Scanner Pièce OCR
          </a>
        </div>
      </div>

      {/* HUB DES MODULES - EXACT COPIED STYLE FROM APIX */}
      <div className="space-y-12">
        {HUB_CATEGORIES.map((category, catIdx) => (
          <div key={catIdx} className="space-y-6">
            
            {/* Category header with colored bar + bottom line border */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }} className="dark:border-white/10">
              <div style={{ width: '8px', height: '30px', background: category.color, borderRadius: '4px', flexShrink: 0 }}></div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: category.color, margin: 0 }}>
                {category.title}
              </h2>
            </div>
            
            {/* Grid container */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: '1.2rem'
            }}>
              {category.items.map((mod, index) => {
                const IconComponent = mod.icon;
                return (
                  <Link 
                    key={index} 
                    href={mod.href}
                    className="apix-hub-card"
                    style={{
                      ['--hover-color' as any]: mod.color,
                      ['--hover-color-30' as any]: `${mod.color}30`,
                      ['--hover-color-40' as any]: `${mod.color}40`
                    }}
                  >
                    {mod.badge && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#006B3F', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', boxShadow: '0 2px 4px rgba(0, 107, 63, 0.3)' }}>
                        {mod.badge}
                      </div>
                    )}

                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      background: `${mod.color}15`,
                      color: mod.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <IconComponent size={28} />
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.4rem' }} className="text-slate-900 dark:text-white">
                      {mod.label}
                    </h3>

                    <p style={{ fontSize: '0.85rem', lineHeight: '1.4', flex: 1 }} className="text-slate-500 dark:text-slate-400">
                      {mod.desc}
                    </p>

                    <div style={{
                      marginTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      color: mod.color,
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      gap: '0.5rem'
                    }}>
                      Accéder <ArrowRight size={18} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Live Data Insights & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">

        {/* Left Column: Deadlines Fiscales */}
        <div className="glass-card rounded-2xl p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Échéances Fiscales Récentes</h3>
            <Link href="/declarations" className="text-[10px] font-black uppercase tracking-widest text-[#006B3F] hover:text-[#004b2c] transition-colors dark:text-indigo-400">Voir le calendrier complet</Link>
          </div>

          <div className="space-y-4">
            {recentDeclarations.length > 0 ? recentDeclarations.map((task: TaxDeclarationWithClient, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 rounded-2xl transition-all border border-black/5 dark:border-white/5 hover:border-[#006B3F]/30 cursor-pointer group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 dark:text-slate-400 group-hover:bg-[#006B3F]/10 group-hover:text-[#006B3F] transition-all shadow-inner uppercase">
                    {task.client?.country || "CI"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-indigo-400 transition-colors truncate">
                      {task.client?.companyName || "Client inconnu"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{task.type} - {task.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-800 dark:text-white">{format(new Date(task.dueDate), 'dd MMM', { locale: fr })}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date limite</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${task.status === 'VALIDATED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                    task.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" :
                      "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-white/10"
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
        <div className="glass-card rounded-2xl p-8 border border-white/5 bg-slate-900/40 shadow-2xl">
          <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight mb-8">Flux d'Activité Système</h3>
          <div className="pl-6 border-l-2 border-slate-300 dark:border-slate-800 space-y-8">
            {recentLogs.length > 0 ? recentLogs.map((act: AuditLogWithUser, i: number) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-[#006B3F] shadow-[0_0_15px_rgba(0,107,63,0.5)] group-hover:scale-125 transition-all" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#006B3F] dark:group-hover:text-white transition-colors">{act.action}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{act.details || "Action effectuée dans le système"}</p>
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 mt-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-700 rounded-full" />
                  {format(new Date(act.createdAt), 'HH:mm', { locale: fr })} • {act.user?.firstName || "Système"}
                </p>
              </div>
            )) : (
              <div className="relative group">
                <div className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-slate-700" />
                <p className="text-sm font-bold text-slate-500">En attente d'activités...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
