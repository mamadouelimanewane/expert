"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Mail,
    Briefcase,
    FileText,
    CalendarDays,
    Settings,
    LogOut,
    PieChart,
    FilePieChart,
    BarChart3,
    Sparkles,
    ScanLine,
    ShieldAlert,
    MessageSquare,
    Workflow,
    Calendar,
    FileCog,
    Activity,
    Database,
    Calculator,
    Clock,
    Stethoscope,
    ShieldCheck,
    Fingerprint,
    Package,
    Receipt,
    PenTool,
    BookOpen,
    Gavel,
    Gem,
    Globe,
    ClipboardList,
    Zap,
    Scale,
    Rocket,
    Library,
    Wallet,
    TrendingUp,
    ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/" },
    { icon: TrendingUp, label: "Pilotage Associé", href: "/dashboard/partner" },
    { icon: Users, label: "Clients (CRM)", href: "/clients" },
    { icon: Briefcase, label: "Missions & Tâches", href: "/missions" },
    { icon: Gavel, label: "Gouvernance & AG", href: "/governance" },
    { icon: Calculator, label: "Paie & Social", href: "/payroll" },
    { icon: ArrowRightLeft, label: "Banque & Lettrage IA", href: "/banking" },
    { icon: FileText, label: "GED Intelligente", href: "/documents" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },
    { icon: Sparkles, label: "Assistant IA Expert", href: "/assistant" },
    { icon: Workflow, label: "Pipeline & Autom.", href: "/workflows" },
    { icon: Zap, label: "Optimisation Fiscale", href: "/fiscalite/optimization" },
    { icon: Receipt, label: "Facturation & Finance", href: "/billing" },
    { icon: Wallet, label: "Frais & Missions", href: "/expenses" },
    { icon: ScanLine, label: "Scan OCR (IA)", href: "/scan" },
    { icon: BarChart3, label: "Analyse Balance/GL", href: "/analysis/deep" },
    { icon: FilePieChart, label: "Analyse Financière", href: "/analysis/financial" },
    { icon: Users, label: "Analyse Tiers", href: "/analysis/tiers" },
    { icon: ShieldAlert, label: "Audit & Conformité", href: "/audit" },
    { icon: Scale, label: "Audit Juridique (OHADA)", href: "/compliance" },
    { icon: ShieldCheck, label: "Missions CAC/Audit", href: "/audit/missions" },
    { icon: ClipboardList, label: "Kit Prép. Audit", href: "/audit/prep-kit" },
    { icon: Fingerprint, label: "Cartographie Risques IA", href: "/audit/ia-risks" },
    { icon: Package, label: "Audit Immob.", href: "/audit/fixed-assets" },
    { icon: MessageSquare, label: "Communications Hub", href: "/communications" },
    { icon: Mail, label: "Manager d'Emails IA", href: "/emails" },
    { icon: Calendar, label: "Agenda & Réunions", href: "/agenda" },
    { icon: FileCog, label: "Prép. Missions", href: "/preparation" },
    { icon: Calculator, label: "Déclarations Fiscales", href: "/declarations" },
    { icon: PenTool, label: "Rédaction IA", href: "/writing" },
    { icon: Stethoscope, label: "Diagnostic 360", href: "/diagnostic" },
    { icon: BookOpen, label: "Manuels de Procédures", href: "/procedures" },
    { icon: Clock, label: "Saisie des Temps", href: "/timesheets" },
    { icon: Activity, label: "Conseil (CFO)", href: "/advisory" },
    { icon: Rocket, label: "Valorisation & M&A IA", href: "/investment" },
    { icon: Gem, label: "Imagine: Simulateur", href: "/strategy/simulator" },
    { icon: Gavel, label: "Expertise Judiciaire", href: "/expert-judiciaire" },
    { icon: Globe, label: "Intelligence & Benchmarking", href: "/benchmarking" },
    { icon: Database, label: "Import Données", href: "/ingest" },
    { icon: LayoutDashboard, label: "Espace Client (Portail)", href: "/portal" },
    { icon: ShieldCheck, label: "Administration", href: "/settings/admin" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-slate-700/50 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="font-bold text-white text-lg">C</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    CABINET 360
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-white shadow-lg shadow-indigo-500/10 border border-primary/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />
                            )}
                            <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "group-hover:text-white")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-slate-700/50 space-y-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Paramètres</span>
                </Link>

                <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                        <span className="font-bold text-sm text-slate-300">EX</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Expert Principal</p>
                        <p className="text-xs text-slate-500 truncate">admin@cabinet.com</p>
                    </div>
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
