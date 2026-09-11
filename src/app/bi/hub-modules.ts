// Catalogue des modules du hub (/bi). Partagé entre le Server Component
// (page.tsx) et la grille client interactive (HubModules.tsx).
import {
  LayoutDashboard, Users, Briefcase, Clock, Receipt, FileText,
  RefreshCw, FileSpreadsheet, CalendarDays, Calculator, FolderPlus, ArrowRightLeft,
  ShieldAlert, ShieldCheck, UserCheck, Gavel,
  Rocket, Radar, Scale, Activity, Globe,
  CreditCard, Landmark, Coins,
  TrendingUp, Download, Ship, Network, Leaf, UserPlus,
  BookOpen, GraduationCap, MessageCircle, Building2,
  Layers, Wallet, FileCheck, PenTool
} from "lucide-react";

export interface HubModule {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
  badge?: string;
}

export interface HubCategory {
  title: string;
  color: string;
  items: HubModule[];
}

export const HUB_CATEGORIES: HubCategory[] = [
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
