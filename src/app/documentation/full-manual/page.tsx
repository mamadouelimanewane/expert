"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Book,
    Search,
    ChevronRight,
    Download,
    Printer,
    BookOpen,
    Layers,
    Cpu,
    ShieldCheck,
    Zap,
    Scale,
    Activity,
    Globe,
    FileText,
    History,
    Briefcase,
    UserCheck,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "intro", title: "1. Introduction", icon: SparklesIcon },
    { id: "ui", title: "2. Interface Dashboard", icon: Layers },
    { id: "corp", title: "3. Nexus Corporate", icon: Globe },
    { id: "risk", title: "4. Risk & Compliance", icon: ShieldCheck },
    { id: "audit", title: "5. Audit & Assurance", icon: FileText },
    { id: "tax", title: "6. Tax Intelligence", icon: Zap },
    { id: "jud", title: "7. Judicial Command", icon: Scale },
    { id: "market", title: "8. Market Intel", icon: Activity },
    { id: "accounting", title: "9. Core Accounting", icon: Briefcase },
    { id: "conso", title: "10. Consolidation", icon: Layers },
    { id: "payroll", title: "11. Paie & Social", icon: UserCheck },
    { id: "comms", title: "12. Communications", icon: MessageSquare },
    { id: "academy", title: "13. Elite Academy", icon: BookOpen },
    { id: "ops", title: "14. Opérations", icon: Cpu },
];

export default function HandbookPage() {
    const [activeSection, setActiveSection] = useState("intro");
    const [searchQuery, setSearchQuery] = useState("");

    const CurrentIcon = SECTIONS.find(s => s.id === activeSection)?.icon || Book;
    const currentTitle = SECTIONS.find(s => s.id === activeSection)?.title;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Elite Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Book className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Documentation Elite
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            Nexus <span className="text-indigo-400">Elite Handbook</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Le manuel d'exploitation complet (200+ pages) pour maîtriser chaque facette de l'intelligence Nexus.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/documentation/full-manual/pdf-export" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/10 transition-all flex items-center gap-2">
                            <Printer className="w-4 h-4" /> Imprimer PDF Premium
                        </Link>
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/30 transition-all">
                            Mode Sombre Intégral
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un terme..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
                        />
                    </div>

                    <div className="glass-card rounded-[32px] border border-white/5 bg-slate-900/40 p-4 space-y-1">
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group",
                                    activeSection === section.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                        : "text-slate-500 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <section.icon className={cn("w-5 h-5", activeSection === section.id ? "text-white" : "text-slate-600 group-hover:text-indigo-400")} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{section.title}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20">
                        <History className="w-8 h-8 text-indigo-400 mb-4" />
                        <h4 className="text-xs font-black text-white uppercase mb-2">Historique v2.0</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            Dernière mise à jour : 04 Février 2026. Ajout des modules Forensics IA et Blockchain Integrity Vault.
                        </p>
                    </div>
                </div>

                {/* Content Viewer */}
                <div className="lg:col-span-9">
                    <div className="glass-card rounded-[50px] border border-white/5 bg-slate-900/40 p-12 min-h-[800px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <CurrentIcon className="w-64 h-64 text-white" />
                        </div>

                        <div className="relative z-10 prose prose-invert max-w-none">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-4">
                                {currentTitle}
                                <span className="h-[1px] flex-1 bg-white/5" />
                            </h2>

                            <div className="space-y-8 text-slate-400 font-medium leading-relaxed">
                                {activeSection === "intro" && (
                                    <>
                                        <p className="text-xl">L’écosystème Nexus Elite redéfinit la pratique professionnelle du chiffre et du droit dans l’espace OHADA.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                                            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5">
                                                <h4 className="text-white font-black uppercase text-sm mb-4">Automatisation Totale</h4>
                                                <p className="text-xs leading-loose">Réduction de 70% du temps administratif via la synchronisation bancaire et l’importation intelligente de documents.</p>
                                            </div>
                                            <div className="p-8 bg-white/5 rounded-[40px] border border-white/5">
                                                <h4 className="text-white font-black uppercase text-sm mb-4">Crédibilité Augmentée</h4>
                                                <p className="text-xs leading-loose">Certification Blockchain pour chaque rapport émis, rendant vos conclusions inattaquables devant les tiers et administrations.</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeSection === "corp" && (
                                    <>
                                        <h3 className="text-white font-black uppercase text-lg mt-12 mb-6">3.1 Entity Hub : Pilotage centralisé</h3>
                                        <p>Ce module remplace le dossier permanent traditionnel. Il permet de gérer les statuts, les procès-verbaux d'AG et la structure du capital de chaque client.</p>

                                        <ul className="space-y-4">
                                            <li className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                                <span><strong>Ajouter Entité :</strong> Crée un coffre-fort numérique conforme aux normes de conservation de 10 ans.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                                <span><strong>Organes de Gestion :</strong> Alerte automatique 6 mois avant l'expiration d'un mandat de commissaire aux comptes ou de DG.</span>
                                            </li>
                                        </ul>

                                        <div className="mt-12 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[40px]">
                                            <h4 className="text-indigo-400 font-black uppercase text-xs mb-4 flex items-center gap-2">
                                                <Zap className="w-4 h-4" /> Conseil IA Nexus
                                            </h4>
                                            <p className="text-xs italic leading-relaxed text-indigo-200">
                                                "N'oubliez pas que pour les SAS OHADA, l'article 853-1 stipule une flexibilité maximale dans la rédaction des clauses de sortie. Utilisez notre générateur de clauses automatisé pour gagner du temps."
                                            </p>
                                        </div>
                                    </>
                                )}

                                {activeSection === "risk" && (
                                    <>
                                        <h3 className="text-white font-black uppercase text-lg mt-12 mb-6">4.1 ID Verify & Bio-KYC</h3>
                                        <p>Nexus Risk intègre une solution de KYC (Know Your Customer) biométrique ultra-moderne pour sécuriser l'onboarding client.</p>

                                        <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 my-8">
                                            <code className="text-indigo-400 text-xs">
                                                // Logique de vérification<br />
                                                if (match_score {" > "} 0.95 && !sanction_list_hit) &#123;<br />
                                                &nbsp;&nbsp;generate_integrity_cert();<br />
                                                &nbsp;&nbsp;anchor_to_blockchain();<br />
                                                &#125;
                                            </code>
                                        </div>
                                    </>
                                )}

                                {activeSection === "accounting" && (
                                    <>
                                        <h3 className="text-white font-black uppercase text-lg mt-12 mb-6">9.1 Saisie & Intelligence Comptable</h3>
                                        <p>Nexus Accounting automatise la production comptable via des algorithmes d'OCR et de révision prédictive.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                                            <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                                                <h4 className="text-indigo-400 font-bold text-xs uppercase mb-2">IA Match Bancaire</h4>
                                                <p className="text-[10px] text-slate-400">Rapprochement automatique des flux bancaires avec les factures de vente et d'achat avec un score de fiabilité.</p>
                                            </div>
                                            <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                                                <h4 className="text-emerald-400 font-bold text-xs uppercase mb-2">Génération Liasse</h4>
                                                <p className="text-[10px] text-slate-400">Édition automatique de la plaquette annuelle (Bilan, CR, TFT) conforme au SYSCOHADA révisé.</p>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 text-sm">
                                            <li className="flex gap-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                <span><strong>Saisie OCR :</strong> Capturez vos factures par simple glisser-déposer.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                <span><strong>Lettrage Auto :</strong> Plus de 80% des comptes clients/fournisseurs lettrés sans intervention humaine.</span>
                                            </li>
                                        </ul>
                                    </>
                                )}

                                {/* Placeholder for other sections - the real handbook is much longer but we show the UI structure here */}
                                <p className="italic text-slate-600 mt-20">Consultez le fichier HANDBOOK_EXPERTE_ELITE.md dans le dossier racine pour la version texte intégrale de 200+ sections.</p>
                            </div>

                            {/* Navigation Footer */}
                            <div className="mt-20 pt-12 border-t border-white/5 flex justify-between items-center">
                                <button
                                    onClick={() => {
                                        const prevIdx = (SECTIONS.findIndex(s => s.id === activeSection) - 1 + SECTIONS.length) % SECTIONS.length;
                                        setActiveSection(SECTIONS[prevIdx].id);
                                    }}
                                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4 rotate-180" /> Section Précédente
                                </button>
                                <button
                                    onClick={() => {
                                        const nextIdx = (SECTIONS.findIndex(s => s.id === activeSection) + 1) % SECTIONS.length;
                                        setActiveSection(SECTIONS[nextIdx].id);
                                    }}
                                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-black uppercase text-[10px] tracking-widest transition-all"
                                >
                                    Section Suivante <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
