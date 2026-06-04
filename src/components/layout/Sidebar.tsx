"use client";

import React from "react";
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
    Globe,
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
    Network,
    Plus,
    ScanLine,
    Mic,
    PlusCircle,
    Smartphone,
    CreditCard,
    Landmark,
    Ship,
    Scale,
    FolderPlus,
    Languages,
    FileDigit
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Monitor, Palette, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

const VOICE_WAVE_HEIGHTS = [14, 28, 42, 22, 38, 18, 46, 32, 20, 44, 26, 16];

type MenuItem = { header: string; icon?: never; label?: never; href?: never } | { icon: React.ComponentType<{ className?: string }>; label: string; href: string; header?: never };

const menuItems: MenuItem[] = [
    // --- 1. EXPERTISE & PRODUCTION COMPTABLE ---
    { header: "EXPERTISE & PRODUCTION" },
    { icon: RefreshCw, label: "Production & Révision", href: "/comptabilite/production" },
    { icon: FileSpreadsheet, label: "Liasse Fiscale Auto", href: "/comptabilite/liasse-fiscale" },
    { icon: CalendarDays, label: "Fiscalité & Simulateur", href: "/fiscalite" },
    { icon: Calculator, label: "Paie & Social (SN)", href: "/payroll" },
    { icon: FolderPlus, label: "GED Intelligente", href: "/documents" },
    { icon: ArrowRightLeft, label: "Banque & Lettrage", href: "/banking" },
    
    // --- 2. BPO & INCLUSION FINANCIÈRE (TPE) ---
    { header: "BPO TPE / INFORMEL" },
    { icon: MessageSquare, label: "Hub WhatsApp Bot", href: "/dashboard/whatsapp-bot" },
    { icon: FileDigit, label: "Usine Traitement IA", href: "/comptabilite/tpe-processing" },
    { icon: Users, label: "Abonnés TPE", href: "/comptabilite/tpe-dashboard" },

    // --- 3. MODULES EXPERTS & IA ---
    { header: "MODULES EXPERTS" },
    { icon: ShieldAlert, label: "Audit IA (FEC Analyzer)", href: "/audit" },
    { icon: Timer, label: "Suivi des Temps & Rentabilité", href: "/timesheets" },
    { icon: UserCheck, label: "Onboarding & KYC", href: "/onboarding" },
    { icon: Receipt, label: "Facturation & Honoraires", href: "/billing" },
    { icon: BarChart3, label: "Business Intelligence", href: "/bi" },
    { icon: FileText, label: "Rapport Santé PDF", href: "/comptabilite/health-report" },

    // --- 2. CŒUR DU MÉTIER & PILOTAGE ---
    { header: "PILOTAGE & CABINET" },
    { icon: LayoutDashboard, label: "Tableau de Bord", href: "/dashboard" },
    { icon: Users, label: "Clients (CRM 360°)", href: "/clients" },
    { icon: Activity, label: "Supervision Live", href: "/supervision/timeline" },
    { icon: Briefcase, label: "Missions & Tâches", href: "/missions" },
    { icon: Clock, label: "Saisie des Temps", href: "/missions/timesheets" },
    { icon: Receipt, label: "Facturation & Honoraires", href: "/billing" },
    { icon: FileText, label: "Lettres de Mission", href: "/lettres-mission" },

    { header: "FINTECH & MOBILE MONEY" },
    { icon: Smartphone, label: "Mobile Money", href: "/mobile-money" },
    { icon: CreditCard, label: "Paiements Intégrés", href: "/fintech/payments" },
    { icon: Landmark, label: "Dossier Crédit Auto", href: "/fintech/credit" },
    { icon: Coins, label: "Score Solvabilité IA", href: "/fintech/scoring" },

    // --- 4. ACCOMPAGNEMENT & DOUANES ---
    { header: "ACCOMPAGNEMENT & DOUANES" },
    { icon: FolderPlus, label: "Statut Entreprenant", href: "/accompagnement/entreprenant" },
    { icon: Ship, label: "Simulateur Douanier", href: "/douanes/simulateur" },
    { icon: Anchor, label: "Suivi Transitaire", href: "/douanes/transitaire" },

    // --- 5. STRATÉGIE & CONSEIL ---
    { header: "STRATÉGIE & CONSEIL" },
    { icon: Rocket, label: "Business Plan & Stratégie", href: "/strategy/business-plan" },
    { icon: Radar, label: "Radar Fiscal IA", href: "/strategy/radar" },
    { icon: Scale, label: "Simulateur Zone Franche", href: "/strategy/zone-franche" },
    { icon: Activity, label: "Valorisation & M&A", href: "/investment" },
    { icon: Globe, label: "Hub Multi-Devises", href: "/strategy/devises" },



    // --- 6. AUDIT & CONFORMITÉ ---
    { header: "AUDIT & CONFORMITÉ" },
    { icon: ShieldAlert, label: "Audit & CAC", href: "/audit" },
    { icon: ShieldCheck, label: "Audit Légal IA", href: "/audit/ai-assisted" },
    { icon: UserCheck, label: "KYC & LCB-FT", href: "/compliance/kyc-screening" },
    { icon: Gavel, label: "Gouvernance & AG", href: "/governance" },

    // --- 7. NEXUS INTELLIGENCE & OUTILS ---
    { header: "NEXUS INTELLIGENCE" },
    { icon: BrainCircuit, label: "Moteur IA & LLM", href: "/settings/ai" },
    { icon: Mic, label: "Nexus-Go (Vocal IA)", href: "/nexus-go" },
    { icon: Sparkles, label: "Assistant IA Expert", href: "/assistant" },
    { icon: MessageCircle, label: "Hub WhatsApp Bot PMI", href: "/dashboard/whatsapp-bot" },
    { icon: Languages, label: "Traduction Liasses", href: "/nexus/traduction" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [transcription, setTranscription] = useState("");
    const { data: session } = useSession();

    const startNexusGo = () => {
        setIsVoiceActive(true);
        setIsFabOpen(false);
        setTranscription("Initialisation de Nexus-Go...");
        
        setTimeout(() => setTranscription("Je vous écoute. Quelle est votre demande ?"), 1000);
        setTimeout(() => setTranscription("Analyse du dossier Traoré en cours..."), 3000);
        setTimeout(() => setTranscription("L'EBITDA du groupe Traoré est en hausse de 12.4% ce trimestre. Souhaitez-vous le rapport détaillé ?"), 5000);
    };

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false);
        setIsFabOpen(false);
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

                        const Icon = item.icon!;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={`${item.href}-${idx}`}
                                href={item.href!}
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
                            <span className="font-bold text-[10px] text-white">
                                {session?.user?.name ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "ME"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate leading-tight">{session?.user?.name || "Expert Comptable"}</p>
                            <p className="text-[9px] text-muted-foreground truncate leading-tight opacity-80">{session?.user?.email || ""}</p>
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
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Déconnexion"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Roaming FAB (Floating Action Button) */}
            <div className="lg:hidden fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
                {isFabOpen && (
                    <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <button className="flex items-center gap-3 bg-white text-indigo-600 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-100">
                            <ScanLine className="w-4 h-4" /> Scanner Facture
                        </button>
                        <button 
                            onClick={startNexusGo}
                            className="flex items-center gap-3 bg-white text-indigo-600 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-100"
                        >
                            <Mic className="w-4 h-4" /> Note Vocale IA
                        </button>
                        <button className="flex items-center gap-3 bg-white text-indigo-600 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-indigo-500/40 border border-indigo-100">
                            <PlusCircle className="w-4 h-4" /> Nouvelle Mission
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95",
                        isFabOpen 
                            ? "bg-slate-900 text-white rotate-45" 
                            : "bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-indigo-600/40 hover:shadow-indigo-600/60"
                    )}
                >
                    <Plus className={cn("w-7 h-7 transition-transform", isFabOpen ? "rotate-0" : "rotate-0")} />
                </button>
            </div>

            {/* Nexus-Go Voice Overlay */}
            {isVoiceActive && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-2xl" onClick={() => setIsVoiceActive(false)} />
                    
                    <div className="relative z-10 flex flex-col items-center text-center space-y-12 max-w-sm">
                        <div className="w-32 h-32 relative">
                            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20" />
                            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-40" />
                            <div className="relative w-full h-full bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                                <Mic className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Nexus-Go Active</h2>
                            <p className="text-indigo-200/60 font-medium text-sm italic min-h-[3rem] leading-relaxed">
                                &ldquo;{transcription}&rdquo;
                            </p>
                        </div>

                        <div className="flex gap-4 pt-12">
                            <button 
                                onClick={() => setIsVoiceActive(false)}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={() => setIsVoiceActive(false)}
                                className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/30 transition-all"
                            >
                                Terminer
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 text-center opacity-30">
                        <div className="flex justify-center gap-1">
                            {VOICE_WAVE_HEIGHTS.map((h, i) => (
                                <div key={i} className="w-1 bg-white rounded-full animate-voice-wave" style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

