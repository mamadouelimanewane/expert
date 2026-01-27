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

type FundraisingTab = "research" | "investors" | "docs" | "simulator";

export default function FundraisingPage() {
    const [activeTab, setActiveTab] = useState<FundraisingTab>("investors");
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleAIGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2500);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                        Pôle Levée de Fonds & Financement
                    </h2>
                    <p className="text-slate-400 mt-1 italic">Recherche stratégique d'investisseurs et ingénierie financière assistée par IA.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        Investor Meetings
                    </button>
                    <button
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isGenerating ? "Analyse IA..." : "Optimiser Dossier (IA)"}
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 w-fit overflow-x-auto max-w-full">
                <TabButton
                    active={activeTab === "investors"}
                    onClick={() => setActiveTab("investors")}
                    icon={Users}
                    label="Recherche Investisseurs"
                    badge="MATCHING"
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

function InvestorSearchSection() {
    const INVESTORS = [
        { name: "Partech Africa", type: "VC", geo: "Global", ticket: "500k - 5M", sector: "Fintech, Logistics", match: 98 },
        { name: "Launch Africa Ventures", type: "VC / Angels", geo: "Pan-African", ticket: "100k - 300k", sector: "Agnostic", match: 92 },
        { name: "Orange Ventures Africa", type: "CVC", geo: "MEA", ticket: "1M - 10M", sector: "Digital, Infrastructure", match: 85 },
        { name: "Norrsken22", type: "Equity", geo: "Sub-Saharan Africa", ticket: "2M - 15M", sector: "Tech Growth", match: 79 },
    ];

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="glass-card p-4 rounded-2xl border border-slate-700/50 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher par secteur, ticket moyen, localisation..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                </div>
                <div className="flex gap-2">
                    <FilterButton label="Type VC" />
                    <FilterButton label="Ticket Min" />
                    <FilterButton label="OHADA Focus" />
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        AI Matching
                    </button>
                </div>
            </div>

            {/* Investor Cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {INVESTORS.map((inv, idx) => (
                    <div key={idx} className="glass-card rounded-2xl border border-slate-700/50 p-6 hover:border-emerald-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
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
                            <div className="text-right">
                                <div className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                                    <Star className="w-4 h-4 fill-emerald-400" />
                                    {inv.match}% Match
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1 italic">Calculé par Neural IA</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <SmallInfo label="Ticket Moyen" value={inv.ticket} />
                            <SmallInfo label="Secteurs" value={inv.sector} />
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                                <Linkedin className="w-3 h-3" /> Profile
                            </button>
                            <button className="flex-1 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                                <Mail className="w-3 h-3" /> Pitcher (IA)
                            </button>
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

function ResearchDossierSection() {
    const DUE_DILIGENCE_CHECKLIST = [
        { category: "Corporate & Legal", items: ["Structure Actionnariale", "Statuts OHADA à jour", "Contrats Clés (Clients/Fournisseurs)"], status: "validated" },
        { category: "Financial", items: ["États Financiers Y-1 à Y-3", "Tableau de Flux de Trésorerie", "Burn Rate Analysis"], status: "pending" },
        { category: "Intellectual Property", items: ["Marques Déposées (OAPI)", "Propriété du Code/Logiciel", "Brevets éventuels"], status: "validated" },
        { category: "Operations", items: ["Procédure KYC/KYB", "Système de Gestion des Risques", "Organigramme"], status: "draft" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checklist Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6">
                    <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        Infrastructure Due Diligence (IA-Ready)
                    </h3>
                    <div className="space-y-4">
                        {DUE_DILIGENCE_CHECKLIST.map((cat, idx) => (
                            <div key={idx} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-white uppercase text-xs tracking-widest">{cat.category}</h4>
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                        cat.status === "validated" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                            cat.status === "pending" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    )}>
                                        {cat.status === "validated" ? "VALIDE" : cat.status === "pending" ? "A FAIRE" : "BROUILLON"}
                                    </span>
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
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6 bg-indigo-900/10 shadow-xl">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        IA-Dossier Synthesis
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">
                        "L'analyse de vos fichiers montre un manque de doc juridique OAPI. Votre score de 'Investability' est actuellement de 82/100. Une mise à jour des contrats fournisseurs augmenterait ce score de 5%."
                    </p>
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform hover:scale-105">
                        <ArrowRight className="w-4 h-4" /> Scanner Data Room Virtuelle
                    </button>
                </div>

                <div className="glass-card rounded-2xl border border-slate-700/50 p-6">
                    <h4 className="font-bold text-white mb-4">Exportation Stratégique</h4>
                    <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800 rounded-xl transition-colors text-xs text-slate-300">
                        Investment Memorandum PDF
                        <Download className="w-4 h-4 text-slate-500" />
                    </button>
                    <button className="w-full flex justify-between items-center p-3 hover:bg-slate-800 rounded-xl transition-colors text-xs text-slate-300">
                        Term Sheet OHADA Template
                        <Download className="w-4 h-4 text-slate-500" />
                    </button>
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
            <div className="glass-card rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-12 gap-3 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <Plus className="w-10 h-10 text-slate-500" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center leading-tight">Générer Nouveau Document<br /><span className="text-[10px] lowercase font-normal">via IA Prompt</span></p>
            </div>
        </div>
    );
}

function DocTemplateCard({ title, desc, tags }: any) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
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
                <button className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all">Générer IA</button>
                <button className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-all"><Download className="w-4 h-4 text-slate-400" /></button>
            </div>
        </div>
    );
}

function PitchSimulatorSection() {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Bonjour ! Je suis 'DeepInvestor', un simulateur d'investisseur VC spécialisé en Afrique. Prêt à pitcher votre concept 'Africa Marketplace Neo' ?" },
        { role: 'user', text: "Oui, nous révolutionnons le financement des PME avec un marketplace de facturation." },
        { role: 'assistant', text: "Intéressant. Mais comment gérez-vous le risque de défaut dans une zone juridique comme l'OHADA où le recouvrement peut être lent ?" }
    ]);
    const [input, setInput] = useState("");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Chat Area */}
            <div className="lg:col-span-3 flex flex-col glass-card rounded-2xl border border-slate-700/50 overflow-hidden bg-slate-950/20">
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white">Neural Pitch Simulator</p>
                            <p className="text-[10px] text-emerald-400">Mode: Tough VC Round A</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feedback Active
                    </span>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {messages.map((m, idx) => (
                        <div key={idx} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                                m.role === 'user' ? "bg-indigo-600 text-white shadow-xl" : "bg-slate-800 text-slate-300"
                            )}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex gap-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Répondre à l'investisseur..."
                        className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2 text-sm text-white focus:outline-none placeholder:text-slate-500"
                    />
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-emerald-500/10">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats/Feedback Sidebar */}
            <div className="space-y-6">
                <div className="glass-card rounded-2xl border border-slate-700/50 p-6 h-full">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Analysis Real-Time</h4>
                    <div className="space-y-6">
                        <StatProgress label="Confidence Level" score={72} color="bg-emerald-500" />
                        <StatProgress label="Clarity of Concept" score={88} color="bg-indigo-500" />
                        <StatProgress label="Financial Rigor" score={45} color="bg-rose-500" />
                    </div>

                    <div className="mt-12">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">Conseils de l'IA</h4>
                        <ul className="space-y-2 text-[10px] text-slate-400 italic">
                            <li className="flex gap-2">
                                <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" /> Focus davantage sur les garanties OHADA.
                            </li>
                            <li className="flex gap-2">
                                <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" /> Ton explication du CAC est trop vague.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatProgress({ label, score, color }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-white">{score}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
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
