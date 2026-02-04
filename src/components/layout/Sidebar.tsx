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
    // --- 1. PILOTAGE & CORE (L'essentiel) ---
    { header: "PILOTAGE" },
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/dashboard" },
    { icon: Users, label: "Clients (CRM 360°)", href: "/clients" },
    { icon: Activity, label: "Supervision Live", href: "/supervision/timeline" },
    { icon: Sparkles, label: "IA Morning Brief", href: "/dashboard/morning-brief" },

    // --- 2. EXPERTISE COMPTABLE (Priorité Demandée) ---
    { header: "EXPERTISE COMPTABLE" },
    { icon: CalendarDays, label: "Fiscalité OHADA", href: "/fiscalite" },
    { icon: Clock, label: "Échéancier Fiscal", href: "/fiscalite/obligations" },
    { icon: FileSpreadsheet, label: "États Financiers", href: "/etats-financiers" },
    { icon: FileSpreadsheet, label: "Liasse Fiscale", href: "/comptabilite/liasse-fiscale" },
    { icon: Calculator, label: "Paie & Social", href: "/payroll" },
    { icon: RefreshCw, label: "Production & Révision", href: "/comptabilite/production" },
    { icon: FilePieChart, label: "Reporting Client", href: "/comptabilite/reporting" },
    { icon: ArrowRightLeft, label: "Banque & Lettrage", href: "/banking" },

    // --- 3. GESTION DU CABINET ---
    { header: "GESTION CABINET" },
    { icon: Briefcase, label: "Missions & Tâches", href: "/missions" },
    { icon: Clock, label: "Saisie des Temps", href: "/missions/timesheets" },
    { icon: Receipt, label: "Facturation & Honoraires", href: "/billing" },
    { icon: FileText, label: "Lettres de Mission", href: "/lettres-mission" },
    { icon: Wallet, label: "Notes de Frais", href: "/expenses" },

    // --- 4. AUDIT & CONFORMITÉ ---
    { header: "AUDIT & CONFORMITÉ" },
    { icon: ShieldAlert, label: "Audit & CAC", href: "/audit" },
    { icon: ShieldCheck, label: "Audit Légal IA", href: "/audit/ai-assisted" },
    { icon: UserCheck, label: "KYC & LCB-FT", href: "/compliance/kyc-screening" },
    { icon: Gavel, label: "Gouvernance & AG", href: "/governance" },
    { icon: Fingerprint, label: "Audit Forensique", href: "/audit/forensic" },

    // --- 5. CONSEIL & STRATÉGIE ---
    { header: "CONSEIL & STRATÉGIE" },
    { icon: Rocket, label: "Business Plan & Stratégie", href: "/strategy/business-plan" },
    { icon: Activity, label: "Valorisation & M&A", href: "/investment" },
    { icon: BrainCircuit, label: "Simulateur Stratégique", href: "/strategy/simulator" },
    { icon: Gem, label: "Wealth & Patrimoine", href: "/strategy/wealth" },
    { icon: BarChart3, label: "Business Intelligence", href: "/bi" },

    // --- 6. NEXUS AI & INNOVATION ---
    { header: "NEXUS INTELLIGENCE" },
    { icon: Sparkles, label: "Assistant IA Expert", href: "/assistant" },
    { icon: FileSearch, label: "Drop Zone Fiscale", href: "/fiscalite/drop-zone" },
    { icon: TrendingUp, label: "Credit Insights", href: "/analysis/credit-insights" },
    { icon: PenTool, label: "Nexus Legal Drafter", href: "/legal/drafting" },

    // --- 7. RESSOURCES ---
    { header: "RESSOURCES" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },
    { icon: GraduationCap, label: "Cabinet Academy", href: "/training/academy" },
    { icon: BookOpen, label: "Manuel Expert", href: "/documentation/full-manual" },
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
                    {menuItems.map((item: any, idx) => {
                        // Rendu des en-têtes de section
                        if (item.header) {
                            return (
                                <div key={`header-${idx}`} className="px-4 py-3 mt-6 mb-2">
                                    <h3 className="text-[10px] font-black pointer-events-none text-muted-foreground/60 uppercase tracking-[0.2em]">
                                        {item.header}
                                    </h3>
                                </div>
                            );
                        }

                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={`${item.href}-${idx}`}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full sidebar-active-indicator" />
                                )}
                                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                                <span className="font-medium text-xs">{item.label}</span>
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

