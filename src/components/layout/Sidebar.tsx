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
import { Moon, Sun, Monitor, Palette, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

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
    { icon: FileSpreadsheet, label: "États Financiers", href: "/etats-financiers" },
    { icon: Wallet, label: "Frais & Missions", href: "/expenses" },
    { icon: Calendar, label: "Agenda Partagé", href: "/agenda" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },

    // Accès rapide Présentation
    { icon: FileText, label: "Présentation Stratégique", href: "/presentation" },

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
                            <p className="text-xs font-bold text-foreground truncate leading-tight">Expert P.</p>
                            <p className="text-[9px] text-muted-foreground truncate leading-tight opacity-80">admin@cab.com</p>
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

