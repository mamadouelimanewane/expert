"use client";

import { useState } from "react";
import {
    Search,
    Users,
    FileText,
    TrendingUp,
    Globe,
    Zap,
    Download,
    Mail,
    Phone,
    Linkedin,
    Plus,
    Filter,
    ArrowRight,
    Star,
    ShieldCheck,
    Briefcase,
    DollarSign,
    Target,
    BarChart3,
    Sparkles,
    RefreshCw,
    MessageSquare,
    Eye,
    ChevronDown,
    Building,
    CheckCircle2,
    Calendar,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page associait des noms de fonds d'investissement réels (Partech
// Africa, Launch Africa Ventures, Orange Ventures Africa, Norrsken22, Saviu
// Ventures, Janngo Capital) à des scores de correspondance ("98% Match",
// "Calculé par Neural IA") entièrement inventés, et simulait un "Intelligence
// Web Crawler" qui prétendait interroger Crunchbase/Tracxn/LinkedIn en
// temps réel avant d'ajouter deux nouveaux "investisseurs" en dur — aucune
// recherche n'a réellement lieu. La checklist de due diligence affichait
// des statuts "Validé"/"Brouillon" fixes comme si un vrai audit avait été
// mené, et un encart "IA-Dossier Synthesis" citait un score d'
// "Investability" de 82/100 sans base réelle. Le simulateur de pitch
// rejouait toujours la même conversation scriptée.
//
// Les fonds réels restent listés comme un répertoire de référence (une
// information publique légitime), mais sans score de correspondance
// inventé. La checklist démarre non évaluée. Le simulateur de pitch appelle
// désormais réellement /api/nexus/chat.
// ─────────────────────────────────────────────────────────────────────────────

type FundraisingTab = "research" | "investors" | "docs" | "simulator";

export default function FundraisingPage() {
    const [activeTab, setActiveTab] = useState<FundraisingTab>("investors");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="page-title flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                        Pôle Levée de Fonds & Financement
                    </h2>
                    <p className="page-subtitle italic">Répertoire d'investisseurs et suivi de due diligence.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 w-fit overflow-x-auto max-w-full">
                <TabButton
                    active={activeTab === "investors"}
                    onClick={() => setActiveTab("investors")}
                    icon={Users}
                    label="Recherche Investisseurs"
                />
                <TabButton
                    active={activeTab === "research"}
                    onClick={() => setActiveTab("research")}
                    icon={Search}
                    label="Dossiers de Recherche (DD)"
                />
                <TabButton
                    active={activeTab === "docs"}
                    onClick={() => setActiveTab("docs")}
                    icon={FileText}
                    label="Documents de Financement"
                />
                <TabButton
                    active={activeTab === "simulator"}
                    onClick={() => setActiveTab("simulator")}
                    icon={MessageSquare}
                    label="Pitch Simulator (Chat IA)"
                />
            </div>

            {/* Main Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "investors" && <InvestorSearchSection />}
                {activeTab === "research" && <ResearchDossierSection />}
                {activeTab === "docs" && <FinanceDocsSection />}
                {activeTab === "simulator" && <PitchSimulatorSection />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap",
                active
                    ? "bg-slate-800 text-white shadow-inner"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
            )}
        >
            <Icon className={cn("w-4 h-4", active ? "text-emerald-400" : "text-slate-600")} />
            {label}
            {badge && (
                <span className="ml-1 text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}

// --- SECTIONS ---

const REPERTOIRE_INVESTISSEURS = [
    { name: "Partech Africa", type: "VC", geo: "Global", ticket: "500k - 5M $", sector: "Fintech, Logistics" },
    { name: "Launch Africa Ventures", type: "VC / Angels", geo: "Pan-African", ticket: "100k - 300k $", sector: "Agnostic" },
    { name: "Orange Ventures Africa", type: "CVC", geo: "MEA", ticket: "1M - 10M $", sector: "Digital, Infrastructure" },
    { name: "Norrsken22", type: "Equity", geo: "Sub-Saharan Africa", ticket: "2M - 15M $", sector: "Tech Growth" },
    { name: "Saviu Ventures", type: "VC", geo: "Francophone Africa", ticket: "200k - 2M $", sector: "Retail, Fintech" },
    { name: "Janngo Capital", type: "Equity / Impact", geo: "West Africa", ticket: "50k - 500k $", sector: "Inclusion, Digital" },
];

function InvestorSearchSection() {
    const [recherche, setRecherche] = useState("");

    const filtres = REPERTOIRE_INVESTISSEURS.filter((inv) =>
        !recherche.trim() ||
        `${inv.name} ${inv.sector} ${inv.geo}`.toLowerCase().includes(recherche.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200">
                Répertoire de référence à but informatif — coordonnées et thèses d&apos;investissement à vérifier
                directement auprès de chaque fonds. Aucun score de correspondance n&apos;est calculé par l&apos;application.
            </div>

            {/* Filter Bar */}
            <div className="apix-card flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Rechercher par secteur, localisation..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                </div>
            </div>

            {/* Investor Cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filtres.map((inv, idx) => (
                    <div key={idx} className="apix-card transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xl">
                                {inv.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{inv.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{inv.type}</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {inv.geo}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SmallInfo label="Ticket Moyen (indicatif)" value={inv.ticket} />
                            <SmallInfo label="Secteurs" value={inv.sector} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SmallInfo({ label, value }: any) {
    return (
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
            <p className="text-[10px] text-slate-600 uppercase font-black mb-1 tracking-widest">{label}</p>
            <p className="text-xs text-slate-300 font-medium truncate">{value}</p>
        </div>
    );
}

const DUE_DILIGENCE_CHECKLIST = [
    { category: "Corporate & Legal", items: ["Structure Actionnariale", "Statuts OHADA à jour", "Contrats Clés (Clients/Fournisseurs)"] },
    { category: "Financial", items: ["États Financiers Y-1 à Y-3", "Tableau de Flux de Trésorerie", "Burn Rate Analysis"] },
    { category: "Intellectual Property", items: ["Marques Déposées (OAPI)", "Propriété du Code/Logiciel", "Brevets éventuels"] },
    { category: "Operations", items: ["Procédure KYC/KYB", "Système de Gestion des Risques", "Organigramme"] },
];

function ResearchDossierSection() {
    const [statuts, setStatuts] = useState<Record<string, "pending" | "draft" | "validated">>({});

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checklist Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="apix-card">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Checklist Due Diligence
                    </h3>
                    <div className="space-y-4">
                        {DUE_DILIGENCE_CHECKLIST.map((cat, idx) => {
                            const statut = statuts[cat.category] ?? "pending";
                            const cycler = () => {
                                const suivant: Record<string, "pending" | "draft" | "validated"> = { pending: "draft", draft: "validated", validated: "pending" };
                                setStatuts((prev) => ({ ...prev, [cat.category]: suivant[statut] }));
                            };
                            return (
                            <div key={idx} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-white uppercase text-xs tracking-widest">{cat.category}</h4>
                                    <button
                                        onClick={cycler}
                                        className={cn(
                                            "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                            statut === "validated" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                statut === "pending" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        )}
                                    >
                                        {statut === "validated" ? "VALIDE" : statut === "pending" ? "A FAIRE" : "BROUILLON"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {cat.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                <div className="apix-card">
                    <h4 className="font-bold text-white mb-4">Progression</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Cliquez sur le badge de chaque catégorie pour faire évoluer son statut. Aucune analyse
                        automatique de documents n&apos;est effectuée par l&apos;application.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FinanceDocsSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocTemplateCard
                title="Investment Memorandum"
                desc="Le document maître de 25-40 pages pour les institutionnels."
                tags={["SaaS", "Financials", "Strat"]}
            />
            <DocTemplateCard
                title="Term Sheet"
                desc="Modèle conforme au droit OHADA révisé (2024)."
                tags={["Secured", "Equity", "OAD"]}
            />
            <DocTemplateCard
                title="Executive Summary"
                desc="Teaser de 2 pages pour les premières approches investisseurs."
                tags={["Pitch", "Quick", "VC"]}
            />
            <DocTemplateCard
                title="Competitor Benchmarking"
                desc="Analyse SWOT comparative assistée par IA sur 8 rivaux."
                tags={["Market", "IA", "Bench"]}
            />
            <DocTemplateCard
                title="Financial Forecast OHADA"
                desc="Multi-currency model (EUR/XOF/USD) avec retraitements."
                tags={["Excel", "Forecast", "OHADA"]}
            />
        </div>
    );
}

function DocTemplateCard({ title, desc, tags }: any) {
    return (
        <div className="apix-card hover:border-emerald-500/50 transition-all flex flex-col justify-between">
            <div>
                <h4 className="font-bold text-white mb-2">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 italic">"{desc}"</p>
                <div className="flex gap-2 mb-6 max-w-full overflow-hidden">
                    {tags.map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded uppercase font-bold tracking-tighter shrink-0">{t}</span>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <button disabled title="Non implémenté" className="flex-1 py-2 bg-slate-800/50 text-slate-500 border border-slate-700 rounded-lg text-xs font-bold cursor-not-allowed">Générer (non disponible)</button>
            </div>
        </div>
    );
}

const SYSTEM_PITCH_VC =
    "Tu joues le rôle d'un investisseur VC exigeant, spécialisé dans les startups d'Afrique de l'Ouest. Réponds en français, " +
    "pose des questions difficiles mais réalistes sur le modèle économique, le risque juridique OHADA et la traction. Reste bref (3-4 phrases).";

function PitchSimulatorSection() {
    const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([
        { role: "assistant", text: "Bonjour, je joue le rôle d'un investisseur pour cette simulation. Présentez-moi votre projet." },
    ]);
    const [input, setInput] = useState("");
    const [envoiEnCours, setEnvoiEnCours] = useState(false);

    const envoyer = async () => {
        if (!input.trim() || envoiEnCours) return;
        const question = input;
        const historique = [...messages, { role: "user" as const, text: question }];
        setMessages(historique);
        setInput("");
        setEnvoiEnCours(true);
        try {
            const res = await fetch("/api/nexus/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: `${SYSTEM_PITCH_VC}\n\nHistorique : ${historique.map((m) => `${m.role}: ${m.text}`).join(" | ")}` }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", text: data.response || data.error || "Réponse indisponible." }]);
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", text: "Impossible de contacter l'assistant IA." }]);
        } finally {
            setEnvoiEnCours(false);
        }
    };

    return (
        <div className="max-w-3xl h-[350px] sm:h-[450px] lg:h-[600px]">
            {/* Chat Area */}
            <div className="flex flex-col h-full glass-card rounded-2xl border border-slate-700/50 overflow-hidden bg-slate-950/20">
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Simulateur de Pitch</p>
                            <p className="text-[10px] text-slate-500">Répond via l&apos;assistant IA (DeepSeek si configuré)</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.map((m, idx) => (
                        <div key={idx} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                                m.role === 'user' ? "bg-primary text-white shadow-xl" : "bg-slate-800 text-slate-300"
                            )}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {envoiEnCours && <p className="text-xs text-slate-500">L'investisseur réfléchit…</p>}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex gap-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && envoyer()}
                        placeholder="Répondre à l'investisseur..."
                        className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 text-sm text-white focus:outline-none placeholder:text-slate-500"
                    />
                    <button onClick={envoyer} disabled={envoiEnCours} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function FilterButton({ label }: { label: string }) {
    return (
        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold border border-slate-700 flex items-center gap-2 transition-all">
            {label} <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
    );
}
