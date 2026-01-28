"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Mail,
    Briefcase,
    FileText,
    Settings,
    LogOut,
    BarChart3,
    Sparkles,
    ShieldAlert,
    MessageSquare,
    Workflow,
    Calendar,
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
    Building
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor, Palette } from "lucide-react";

const menuItems = [
    // 1. Cœur de Métier (Requested Order)
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/" },
    { icon: Users, label: "Clients (CRM 360°)", href: "/clients" },
    { icon: Briefcase, label: "Missions & Tâches", href: "/missions" },
    { icon: Gavel, label: "Gouvernance & AG", href: "/governance" },
    { icon: ShieldAlert, label: "Audit & Conformité", href: "/audit" },
    { icon: ArrowRightLeft, label: "Banque & Lettrage IA", href: "/banking" },
    { icon: Receipt, label: "Facturation & Finance", href: "/billing" },
    { icon: Calculator, label: "Paie & Social", href: "/payroll" },
    { icon: CalendarDays, label: "Fiscalité OHADA", href: "/fiscalite" },
    { icon: Wallet, label: "Frais & Missions", href: "/expenses" },
    { icon: Calendar, label: "Agenda Partagé", href: "/agenda" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },

    // 2. Innovation & Stratégie (Flat list for visibility)
    { icon: Sparkles, label: "NEXUS AI (Expérience)", href: "/nexus" },
    { icon: Rocket, label: "Business Plan & Stratégie", href: "/strategy/business-plan" },
    { icon: DollarSign, label: "Levée de Fonds & Investisseurs", href: "/strategy/fundraising" },
    { icon: Sparkles, label: "Assistant IA Expert", href: "/assistant" },
    { icon: TrendingUp, label: "Pilotage Associé", href: "/dashboard/partner" },
    { icon: BarChart3, label: "Business Intelligence", href: "/bi" },
    { icon: FileText, label: "GED Intelligente", href: "/documents" },
    { icon: PenTool, label: "Signatures Certifiées", href: "/signature" },
    { icon: LayoutDashboard, label: "Espace Client (Portail)", href: "/portal" },
    { icon: FileSpreadsheet, label: "Data Center & Éditions", href: "/data-center" },
    { icon: MessageSquare, label: "Communications Hub", href: "/communications" },
    { icon: Workflow, label: "Pipeline & Autom.", href: "/workflows" },
    { icon: Rocket, label: "Valorisation & M&A", href: "/investment" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-border/50 flex flex-col z-50 transition-all duration-300">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="font-bold text-white text-lg">C</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-slate-400">
                    CABINET 360
                </h1>
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
            <div className="p-4 sidebar-footer space-y-4 transition-colors duration-300">
                {/* Theme Switcher UI */}
                <div className="flex items-center justify-between px-2 py-2 bg-background/50 rounded-xl border border-border/50">
                    <button
                        onClick={() => setTheme('dark')}
                        className={cn("p-2 rounded-lg transition-all", theme === 'dark' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted")}
                        title="Mode Sombre"
                    >
                        <Moon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTheme('light')}
                        className={cn("p-2 rounded-lg transition-all", theme === 'light' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted")}
                        title="Mode Clair"
                    >
                        <Sun className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setTheme('corporate')}
                        className={cn("p-2 rounded-lg transition-all", theme === 'corporate' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-muted")}
                        title="Mode Corporate"
                    >
                        <Building className="w-4 h-4" />
                    </button>
                </div>

                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium text-sm">Paramètres</span>
                </Link>

                <div className="pt-2 border-t border-border/30 flex items-center gap-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center">
                        <span className="font-bold text-xs text-muted-foreground uppercase">EX</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-foreground truncate">Expert Principal</p>
                        <p className="text-[10px] text-muted-foreground truncate">admin@cabinet.com</p>
                    </div>
                    <button className="text-muted-foreground hover:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

