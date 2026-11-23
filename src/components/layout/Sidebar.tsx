"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    Briefcase,
    FileText,
    Settings,
    LogOut,
    Sparkles,
    ShieldAlert,
    MessageSquare,
    Calendar,
    LayoutGrid,
    Activity,
    Calculator,
    Receipt,
    Gavel,
    Globe,
    Rocket,
    Library,
    TrendingUp,
    ArrowRightLeft,
    FileSpreadsheet,
    CalendarDays,
    Building,
    RefreshCw,
    ShieldCheck,
    Clock,
    FilePieChart,
    UserCheck,
    Radar,
    BrainCircuit,
    Coins,
    Gauge,
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
    FileDigit,
    Bell,
    ClipboardCheck,
    Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hrefActif, ordonnerMenu, sousMenuPour, entreeSousMenuActive } from "@/lib/menu-sections";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Menu, X, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

type MenuItem = { header: string; icon?: never; label?: never; href?: never } | { icon: React.ComponentType<{ className?: string }>; label: string; href: string; header?: never };
type SearchResult = { id: string; type: "CLIENT" | "MISSION" | "FACTURE" | "DOCUMENT"; label: string; detail: string; href: string };

// Sélection dédoublonnée des écrans les plus utilisés (le plan complet est
// dans /plan). Chaque destination n'apparaît qu'une fois : les anciens
// doublons (/audit, /billing, /dashboard/whatsapp-bot, deux entrées « temps »)
// rendaient la barre illisible et faisaient hésiter sur le bon lien.
const menuItems: MenuItem[] = [
    { header: "PILOTAGE & CABINET" },
    { icon: Bell, label: "Boîte de réception", href: "/inbox" },
    { icon: Globe, label: "Cockpit EMOA", href: "/regionalisation" },
    { icon: LayoutGrid, label: "Hub des modules", href: "/bi" },
    { icon: Users, label: "Clients (CRM 360°)", href: "/clients" },
    { icon: Briefcase, label: "Missions & Tâches", href: "/missions" },
    { icon: Calendar, label: "Agenda partagé", href: "/agenda" },
    { icon: Clock, label: "Suivi des Temps & Rentabilité", href: "/timesheets" },
    { icon: Receipt, label: "Facturation & Honoraires", href: "/billing" },
    { icon: FileText, label: "Lettres de Mission", href: "/lettres-mission" },
    { icon: Activity, label: "Supervision Live", href: "/supervision/timeline" },
    { icon: ClipboardCheck, label: "Qualité du cabinet", href: "/qualite-cabinet" },
    { icon: FilePieChart, label: "Rapport mensuel", href: "/reporting/mensuel" },
    { icon: Bot, label: "Flotte Agents IA 360", href: "/agents/orchestrateur" },

    { header: "EXPERTISE & PRODUCTION" },
    { icon: RefreshCw, label: "Production & Révision", href: "/comptabilite/production" },
    { icon: ClipboardCheck, label: "Clôture annuelle", href: "/comptabilite/cloture-annuelle" },
    { icon: FileSpreadsheet, label: "Liasse Fiscale Auto", href: "/comptabilite/liasse-fiscale" },
    { icon: FilePieChart, label: "États Financiers SYSCOHADA", href: "/etats-financiers" },
    { icon: CalendarDays, label: "Fiscalité & Simulateur", href: "/fiscalite" },
    { icon: Calculator, label: "Paie & Social (SN)", href: "/payroll" },
    { icon: FolderPlus, label: "GED Intelligente", href: "/documents" },
    { icon: ArrowRightLeft, label: "Banque & Lettrage", href: "/banking" },
    { icon: Gauge, label: "Rapport Santé PDF", href: "/comptabilite/health-report" },

    { header: "AUDIT & CONFORMITÉ" },
    { icon: ShieldAlert, label: "Audit & CAC (FEC)", href: "/audit" },
    { icon: ShieldCheck, label: "Audit Légal IA", href: "/audit-legal" },
    { icon: UserCheck, label: "KYC & LCB-FT", href: "/compliance/kyc-screening" },
    { icon: Gavel, label: "Gouvernance & AG", href: "/governance" },

    { header: "STRATÉGIE & CONSEIL" },
    { icon: Rocket, label: "Business Plan & Stratégie", href: "/strategy/business-plan" },
    { icon: Radar, label: "Radar Fiscal IA", href: "/strategy/radar" },
    { icon: Scale, label: "Simulateur Zone Franche", href: "/strategy/zone-franche" },
    { icon: TrendingUp, label: "Valorisation & M&A", href: "/investment" },
    { icon: Globe, label: "Hub Multi-Devises", href: "/strategy/devises" },

    { header: "TPE, DOUANES & FINTECH" },
    { icon: Building, label: "Statut Entreprenant", href: "/accompagnement/entreprenant" },
    { icon: Ship, label: "Simulateur Douanier", href: "/douanes/simulateur" },
    { icon: Users, label: "Abonnés TPE", href: "/comptabilite/tpe-dashboard" },
    { icon: FileDigit, label: "Usine Traitement IA", href: "/comptabilite/tpe-processing" },
    { icon: MessageSquare, label: "Hub WhatsApp Bot", href: "/dashboard/whatsapp-bot" },
    { icon: Smartphone, label: "Mobile Money", href: "/mobile-money" },
    { icon: CreditCard, label: "Hub Paiements (Wave/OM)", href: "/fintech/payments" },
    { icon: Landmark, label: "Dossier Crédit Auto", href: "/fintech/credit" },
    { icon: Coins, label: "Score Solvabilité IA", href: "/fintech/scoring" },

    { header: "NEXUS INTELLIGENCE" },
    { icon: Sparkles, label: "Assistant IA Expert", href: "/assistant" },
    { icon: Mic, label: "Nexus-Go (Vocal IA)", href: "/nexus-go" },
    { icon: Library, label: "Bibliothèque OHADA", href: "/library" },
    { icon: BrainCircuit, label: "Moteur IA & LLM", href: "/settings/ai" },

    { header: "PLATEFORME & ÉCOSYSTÈME" },
    { icon: UserCheck, label: "Onboarding & KYC", href: "/onboarding" },
    { icon: Users, label: "Portail TPE / Client", href: "/portal/tpe-client" },
    { icon: FileDigit, label: "Developer Hub & API", href: "/settings/api-keys" },
    { icon: Network, label: "Plan de l'application", href: "/plan" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const { data: session } = useSession();

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsOpen(false);
        setIsFabOpen(false);
        setFilter("");
    }, [pathname]);

    useEffect(() => {
        const query = filter.trim();
        if (query.length < 2) { setSearchResults([]); setSearchLoading(false); return; }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error ?? "Recherche indisponible.");
                setSearchResults(data.results ?? []);
            } catch {
                if (!controller.signal.aborted) setSearchResults([]);
            } finally {
                if (!controller.signal.aborted) setSearchLoading(false);
            }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [filter]);

    // L'entrée active est ramenée dans la zone visible de la barre (utile
    // quand la section active est longue ou que l'utilisateur arrive par URL).
    const navRef = useRef<HTMLElement>(null);
    useEffect(() => {
        const actif = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
        actif?.scrollIntoView({ block: "nearest" });
    }, [pathname]);

    // Entrée active (href le plus long qui préfixe l'URL) et menu ordonné :
    // la section de l'écran ouvert en tête, filtre tolérant aux accents.
    // Logique dans src/lib/menu-sections.ts, couverte par les tests.
    const activeHref = hrefActif(menuItems, pathname);
    const { visibles: visibleItems, enTeteActif } = ordonnerMenu(menuItems, activeHref, filter, pathname);

    // Sous-menu contextuel : les écrans du module en cours, affichés sous
    // l'entrée active (ou sous l'en-tête de section si le module n'a pas
    // d'entrée dans le menu). Masqué pendant un filtre.
    const sousMenu = filter.trim() ? null : sousMenuPour(pathname);
    const sousActif = sousMenu ? entreeSousMenuActive(sousMenu.entrees, pathname) : null;
    const rendreSousMenu = () => sousMenu && (
        <div className="sidebar-submenu ml-4 pl-3 my-1 space-y-0.5" role="list" aria-label="Pages du module">
            {sousMenu.entrees.map((e) => (
                <Link key={e.href} href={e.href} role="listitem" aria-current={e.href === sousActif ? "page" : undefined}
                    className={cn("sidebar-sublink block px-3 py-1.5 rounded-md text-[11px] transition-colors", e.href === sousActif && "active")}>
                    {e.label}
                </Link>
            ))}
        </div>
    );
    // Le sous-menu s'accroche au lien actif ; sans lien actif, juste après
    // l'en-tête de la section active.
    const ancreSousMenu: "lien" | "entete" | null = sousMenu ? (activeHref ? "lien" : enTeteActif ? "entete" : null) : null;

    return (
        <>
            {/* Mobile Header / Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-card border-b border-border/50 flex items-center justify-between px-4 sm:px-6 z-[60] pt-safe">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md">
                        <span className="font-bold text-white text-base">C</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold tracking-tight">CABINET 360</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2.5 rounded-xl bg-primary/10 text-primary active:scale-95 transition-transform"
                    aria-label="Menu"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 h-screen w-72 max-w-[85vw] sm:w-64 sidebar-container flex flex-col z-[58] transition-all duration-300 lg:translate-x-0 pb-safe",
                isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="p-4 sm:p-6 flex items-center gap-3 pt-safe">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                        <span className="font-bold text-white text-base">C</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-slate-400">
                        CABINET 360
                    </span>
                    {/* Close button inside sidebar for mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden ml-auto p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
                        aria-label="Fermer le menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filtre rapide : une cinquantaine d'entrées, on tape deux
                    lettres plutôt que de faire défiler. */}
                <div className="px-4 pb-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            type="search"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Chercher modules, clients, missions…"
                            aria-label="Filtrer les modules ou chercher des dossiers"
                            className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-muted/40 border border-border/60 text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background outline-none transition-colors"
                        />
                        {filter.trim().length >= 2 && <div className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-[55vh] overflow-y-auto rounded-xl border border-border bg-background shadow-2xl" role="listbox" aria-label="Résultats de recherche">
                            {searchLoading ? <p className="p-3 text-xs text-muted-foreground">Recherche…</p> : searchResults.length === 0 ? <p className="p-3 text-xs text-muted-foreground">Aucun dossier correspondant. Les modules restent filtrés ci-dessous.</p> : searchResults.map((result) => <Link key={`${result.type}-${result.id}`} href={result.href} role="option" onClick={() => { setFilter(""); setIsOpen(false); }} className="block border-b border-border/50 p-3 last:border-0 hover:bg-muted/60 focus:bg-muted/60 outline-none">
                                <span className="block text-[9px] font-black uppercase tracking-widest text-primary">{result.type === "CLIENT" ? "Client" : result.type === "MISSION" ? "Mission" : result.type === "FACTURE" ? "Facture" : "Document"}</span>
                                <span className="mt-0.5 block truncate text-xs font-semibold text-foreground">{result.label}</span>
                                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{result.detail}</span>
                            </Link>)}
                        </div>}
                    </div>
                </div>

                {/* Navigation */}
                <nav ref={navRef} className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar" aria-label="Navigation principale">
                    {visibleItems.length === 0 && (
                        <p className="px-4 py-6 text-xs text-muted-foreground text-center">Aucune entrée ne correspond à « {filter} ».</p>
                    )}
                    {visibleItems.map((item, idx) => {
                        // Rendu des en-têtes de section
                        if (item.header) {
                            return (
                                <div key={`header-${idx}`}>
                                    <div className={cn("sidebar-header mb-2 px-4 py-1", idx === 0 ? "mt-1" : "mt-6")}>
                                        <h3 className={cn("text-[9px] font-black pointer-events-none uppercase tracking-[0.2em]", item === enTeteActif && "text-primary")}>
                                            {item.header}
                                        </h3>
                                    </div>
                                    {ancreSousMenu === "entete" && item === enTeteActif && rendreSousMenu()}
                                </div>
                            );
                        }

                        const Icon = item.icon!;
                        const isActive = item.href === activeHref;

                        return (
                            <div key={`${item.href}-${idx}`}>
                            <Link
                                href={item.href!}
                                aria-current={isActive && !sousActif ? "page" : undefined}
                                className={cn(
                                    "sidebar-link",
                                    isActive && "active"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full sidebar-active-indicator" />
                                )}
                                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                                <span className="font-medium text-xs">{item.label}</span>
                            </Link>
                            {ancreSousMenu === "lien" && isActive && rendreSousMenu()}
                            </div>
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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-white/10">
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
            {/* Voile sous le menu ouvert : les raccourcis blancs se lisaient
                mal par-dessus les cartes KPI, et un appui hors menu le ferme. */}
            {isFabOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-[65] bg-[rgba(15,23,42,0.45)] backdrop-blur-[2px] animate-in fade-in duration-200"
                    aria-hidden="true"
                    onClick={() => setIsFabOpen(false)}
                />
            )}
            <div className={cn("lg:hidden fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[70] flex-col items-end gap-3 pb-safe", isOpen ? "hidden" : "flex")}>
                {isFabOpen && (
                    <div className="flex flex-col items-end gap-3 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Ces raccourcis étaient de simples <button> sans action :
                            un appui ne faisait rien. Ils mènent désormais aux écrans
                            correspondants et referment le menu. */}
                        <Link href="/scan" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 bg-white text-primary px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-primary/40 border border-primary">
                            <ScanLine className="w-4 h-4" /> Scanner Facture
                        </Link>
                        {/* L'ancien overlay « Nexus-Go » jouait une transcription
                            scriptée avec des chiffres inventés ; /nexus-go utilise la
                            vraie reconnaissance vocale du navigateur. */}
                        <Link href="/nexus-go" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 bg-white text-primary px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-primary/40 border border-primary">
                            <Mic className="w-4 h-4" /> Note Vocale IA
                        </Link>
                        <Link href="/missions/new" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 bg-white text-primary px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-primary/40 border border-primary">
                            <PlusCircle className="w-4 h-4" /> Nouvelle Mission
                        </Link>
                        {/* Le bouton flottant Nexus est masqué sous lg (il doublait
                            celui-ci) : l'assistant s'ouvre d'ici, via un événement
                            écouté par NexusCopilot. */}
                        <button
                            type="button"
                            onClick={() => { setIsFabOpen(false); window.dispatchEvent(new CustomEvent("nexus:open")); }}
                            className="flex items-center gap-3 bg-primary text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl shadow-primary/40 border border-primary"
                        >
                            <Sparkles className="w-4 h-4" /> Assistant Nexus
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    aria-label={isFabOpen ? "Fermer les actions rapides" : "Actions rapides"}
                    aria-expanded={isFabOpen}
                    className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95",
                        isFabOpen 
                            ? "bg-slate-900 text-white rotate-45" 
                            : "bg-gradient-to-br from-primary to-violet-700 text-white shadow-primary/40 hover:shadow-primary/60"
                    )}
                >
                    <Plus className={cn("w-7 h-7 transition-transform", isFabOpen ? "rotate-0" : "rotate-0")} />
                </button>
            </div>

        </>
    );
}

