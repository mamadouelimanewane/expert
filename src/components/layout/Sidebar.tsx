"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Mail,
    Briefcase,
    FileText,
    Book,
    BookOpen,
    Settings,
    LogOut,
    BarChart3,
    Sparkles,
    ShieldAlert,
    MessageSquare,
    Workflow,
    Calendar,
    LayoutGrid,
    Activity,
    Calculator,
    Receipt,
    PenTool,
    Gavel,
    Rocket,
    Library,
    Wallet,
    TrendingUp,
    ArrowRightLeft,
    FileSpreadsheet,
    CalendarDays,
    DollarSign,
    Building,
    ClipboardCheck,
    RefreshCw,
    ShieldCheck,
    Clock,
    FilePieChart,
    LineChart,
    Building2,
    MessageCircle,
    UserCheck,
    FileSearch,
    Radar,
    Timer,
    Target,
    Factory,
    BrainCircuit,
    Leaf,
    Fingerprint,
    Gem,
    Coins,
    Microscope,
    GraduationCap,
    Gauge,
    Anchor,
    Network
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor, Palette, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const menuItems = [
    // 1. Cœur de Métier (Requested Order)
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/dashboard" },
    { icon: Sparkles, label: "IA Morning Brief", href: "/dashboard/morning-brief" },
    { icon: Activity, label: "Supervision Live", href: "/supervision/timeline" },
    { icon: Users, label: "Clients (CRM 360°)", href: "/clients" },
    { icon: Gauge, label: "Scoring Client IA", href: "/clients/scoring" },
    { icon: Rocket, label: "Onboarding Digital", href: "/onboarding/digital" },
    { icon: Factory, label: "Industrie & Manufacture", href: "/industries/manufacturing" },
    { icon: Briefcase, label: "Missions & Tâches", href: "/missions" },
    { icon: Building2, label: "Guichet Création", href: "/missions/creation" },
    { icon: MessageCircle, label: "Requêtes Clients", href: "/collaboration/requests" },
    { icon: Mail, label: "Triage & Emails (Karbon)", href: "/collaboration/triage" },
    { icon: Calendar, label: "Planning d'Équipe", href: "/missions/planning" },
    { icon: Users, label: "Plan de Charge (Beeye)", href: "/management/capacity-planning" },
    { icon: Clock, label: "Gestion des Temps", href: "/missions/timesheets" },
    { icon: TrendingUp, label: "Gestion Interne (Queoval)", href: "/management/practice" },
    { icon: TrendingUp, label: "Analyse Boni-Mali", href: "/missions/boni-mali" },
    { icon: Gavel, label: "Gouvernance & AG", href: "/governance" },
    { icon: LayoutGrid, label: "Heatmap Gouvernance", href: "/compliance/governance/heatmap" },
    { icon: ShieldAlert, label: "Audit & Conformité", href: "/audit" },
    { icon: UserCheck, label: "KYC & LCB-FT (Kanta)", href: "/compliance/kyc-screening" },
    { icon: Fingerprint, label: "Audit Forensique (Nexus)", href: "/audit/forensic" },
    { icon: ShieldCheck, label: "Audit Légal Nexus IA", href: "/audit/ai-assisted" },
    { icon: Microscope, label: "CAC Workbench (Audit)", href: "/audit/cac-suite" },
    { icon: ArrowRightLeft, label: "Banque & Lettrage IA", href: "/banking" },
    { icon: Receipt, label: "Facturation & Finance", href: "/billing" },
    { icon: FileText, label: "Lettres de Mission", href: "/lettres-mission" },
    { icon: TrendingUp, label: "Gestion Commerciale", href: "/prospects" },
    { icon: Calculator, label: "Paie & Social", href: "/payroll" },
    { icon: CalendarDays, label: "Fiscalité OHADA", href: "/fiscalite" },
    { icon: Clock, label: "Échéancier Fiscal", href: "/fiscalite/obligations" },
    { icon: FileSpreadsheet, label: "États Financiers", href: "/etats-financiers" },
    { icon: FileSpreadsheet, label: "Liasse Fiscale OHADA", href: "/comptabilite/liasse-fiscale" },
    { icon: ClipboardCheck, label: "Révision & Audit", href: "/comptabilite/revision" },
    { icon: FileSearch, label: "Cycles de Révision", href: "/comptabilite/revision-cycles" },
    { icon: RefreshCw, label: "Production Collaborative", href: "/comptabilite/production" },
    { icon: FilePieChart, label: "Reporting Automatique", href: "/comptabilite/reporting" },
    { icon: Wallet, label: "Frais & Missions", href: "/expenses" },
    { icon: Calendar, label: "Agenda Partagé", href: "/agenda" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },
    { icon: GraduationCap, label: "Cabinet Academy", href: "/training/academy" },
    { icon: ShieldAlert, label: "Contrôle Fiscal (Crise)", href: "/compliance/tax-audit" },
    { icon: Anchor, label: "Contentieux Douanier", href: "/compliance/customs" },

    // Accès rapide Documentation & Marketing

    { icon: Book, label: "Documentation & Marketing", href: "/documentation" },
    { icon: BookOpen, label: "Manuel Expert (Guide)", href: "/documentation/full-manual" },
    { icon: FileText, label: "Présentation Stratégique", href: "/presentation" },

    // 2. Innovation & Stratégie (Flat list for visibility)
    { icon: Sparkles, label: "NEXUS AI (Expérience)", href: "/nexus" },
    { icon: Rocket, label: "Business Plan & Stratégie", href: "/strategy/business-plan" },
    { icon: DollarSign, label: "Levée de Fonds & Investisseurs", href: "/strategy/fundraising" },
    { icon: BrainCircuit, label: "Simulateur Stratégique IA", href: "/strategy/simulator" },
    { icon: Gem, label: "Wealth & Patrimoine", href: "/strategy/wealth" },
    { icon: Sparkles, label: "Assistant IA Expert", href: "/assistant" },
    { icon: TrendingUp, label: "Pilotage Associé", href: "/analysis/profitability" },
    { icon: LineChart, label: "Trésorerie Prédictive IA", href: "/analysis/cash-flow-predictive" },
    { icon: Activity, label: "Simulateur Stress Cash", href: "/analysis/financial/stress-simulator" },
    { icon: PenTool, label: "Nexus Legal Drafter", href: "/legal/drafting" },
    { icon: BarChart3, label: "BI & Reporting (Finthesis)", href: "/bi/finthesis-reporting" },
    { icon: Leaf, label: "Sustainability Hub (ESG)", href: "/bi/sustainability" },
    { icon: BarChart3, label: "Business Intelligence", href: "/bi" },
    { icon: FileText, label: "GED Intelligente", href: "/documents" },
    { icon: PenTool, label: "Signatures Certifiées", href: "/signature" },
    { icon: Radar, label: "Radar Réussite Client", href: "/analysis/clients/radar" },
    { icon: LayoutDashboard, label: "Espace Client (Portail)", href: "/portal" },
    { icon: FileSpreadsheet, label: "Data Center & Éditions", href: "/data-center" },
    { icon: ShieldCheck, label: "KYC Intelligence Hub", href: "/compliance/kyc" },
    { icon: MessageSquare, label: "Communications Hub", href: "/communications" },
    { icon: Users, label: "Annuaire des Experts", href: "/annuaire" },
    { icon: Workflow, label: "Pipeline & Autom.", href: "/workflows" },
    { icon: Rocket, label: "Valorisation & M&A", href: "/investment" },
    { icon: FileText, label: "Lettres de Mission", href: "/commercial/proposals" },
    { icon: Calendar, label: "Planning & Ressources", href: "/production/planning" },
    { icon: Timer, label: "Saisie Rapide des Temps", href: "/time-entry" },
    { icon: Activity, label: "Dashboard Production", href: "/production/dashboard" },
    { icon: BarChart3, label: "GPAO & Rentabilité", href: "/production/analytics" },
    { icon: Target, label: "War Room Stratégique", href: "/analysis/deep/war-room" },
    { icon: ShieldCheck, label: "Souveraineté & Sécurité", href: "/settings/security" },

    // 3. NEXUS PREMIUM - Intelligence Avancée
    { icon: BrainCircuit, label: "Audit Intelligence IA", href: "/audit/intelligence" },
    { icon: FileSearch, label: "Drop Zone Fiscale", href: "/fiscalite/drop-zone" },
    { icon: BookOpen, label: "OHADA-Cite (Validation)", href: "/library/ohada-cite" },
    { icon: Book, label: "Clause Bank OHADA", href: "/library/clause-bank" },
    { icon: ShieldAlert, label: "Fraud Detection Hub", href: "/audit/fraud-detection" },
    { icon: Sparkles, label: "Nexus Counsel IA", href: "/assistant/cocounsel" },
    { icon: Workflow, label: "Client Workspaces", href: "/collaboration/workspaces" },

    // 4. NEXUS RISK - Strategic Intelligence
    { icon: Fingerprint, label: "Nexus ID Verify", href: "/compliance/id-verify" },
    { icon: ShieldAlert, label: "Financial Crime Hub", href: "/compliance/financial-crime" },
    { icon: TrendingUp, label: "Credit Insights IA", href: "/analysis/credit-insights" },
    { icon: Network, label: "Nexus Data Link", href: "/data/nexus-link" },

    // 5. NEXUS ELITE - Global Compliance
    { icon: BarChart3, label: "Nexus Performance", href: "/corporate/performance" },
    { icon: ClipboardCheck, label: "Nexus Audit Hub", href: "/corporate/audit-assurance" },
    { icon: Gavel, label: "Nexus Entity Hub", href: "/corporate/entity-hub" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Header / Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-card border-b border-border/50 flex items-center justify-between px-6 z-[60]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white text-lg">C</span>
                    </div>
                    <h1 className="text-lg font-bold">CABINET 360</h1>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-xl bg-primary/10 text-primary"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 h-screen w-64 glass border-r border-border/50 flex flex-col z-[58] transition-all duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                {/* Logo Section (Desktop only or keep for mobile drawer) */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-bold text-white text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-slate-400">
                        CABINET 360
                    </h1>
                    {/* Close button inside sidebar for mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden ml-auto p-1 text-muted-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={`${item.href}-${idx}`}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full sidebar-active-indicator" />
                                )}
                                <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Settings & Theme Swapper */}
                {/* Footer / Settings & Theme Swapper */}
                <div className="p-3 border-t border-border/10">
                    {/* Theme Switcher Compact */}
                    <div className="flex items-center justify-between px-1 py-1 bg-muted/30 rounded-lg mb-3">
                        <button
                            onClick={() => setTheme('dark')}
                            className={cn("p-1.5 rounded-md transition-all flex-1 flex justify-center", theme === 'dark' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Mode Sombre"
                        >
                            <Moon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setTheme('light')}
                            className={cn("p-1.5 rounded-md transition-all flex-1 flex justify-center", theme === 'light' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Mode Clair"
                        >
                            <Sun className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setTheme('corporate')}
                            className={cn("p-1.5 rounded-md transition-all flex-1 flex justify-center", theme === 'corporate' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                            title="Mode Corporate"
                        >
                            <Building className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Compact User Profile & Actions */}
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-white/10">
                            <span className="font-bold text-[10px] text-white">EP</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate leading-tight">Expert Principal</p>
                            <p className="text-[9px] text-muted-foreground truncate leading-tight opacity-80">admin@cabinet360.com</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Link
                                href="/settings"
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Paramètres"
                            >
                                <Settings className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={async () => {
                                    await fetch("/api/auth/logout", { method: "POST" });
                                    window.location.href = "/login";
                                }}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

