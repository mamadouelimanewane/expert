"use client";

import { useState, useRef, useEffect } from "react";
import {
    BarChart3,
    FileText,
    MessageSquare,
    UploadCloud,
    Download,
    Clock,
    CheckCircle2,
    Wallet,
    CreditCard,
    ArrowUpRight,
    Sparkles,
    Inbox,
    Calendar,
    ChevronRight,
    ShieldCheck,
    Video,
    HardDrive,
    Share2,
    MessageCircle,
    Phone,
    MonitorIcon,
    AtSign,
    LogOut,
    Bell,
    Settings,
    MoreVertical,
    Search,
    PieChart,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Portal
const CLIENT_INFO = {
    name: "Société Ivoirienne de Banque",
    id: "SIB-8829-CI",
    manager: "M. Kouassi Jean",
    plan: "Premium Expert",
    avatar: "S"
};

export default function ClientPortalPage() {
    const [activeTab, setActiveTab] = useState("synthèse");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B0F17] text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Top Navigation Bar */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5",
                scrolled ? "bg-[#0B0F17]/95 backdrop-blur-xl py-4 shadow-2xl" : "bg-transparent py-6"
            )}>
                <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-12">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <span className="font-black text-white text-lg">C</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white leading-none">Cabinet 360</h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Espace Client Sécurisé</p>
                            </div>
                        </div>

                        {/* Desktop Nav Tabs */}
                        <div className="hidden md:flex bg-white/5 p-1 rounded-2xl border border-white/5">
                            {[
                                { id: "synthèse", icon: BarChart3, label: "Vue d'ensemble" },
                                { id: "drive", icon: HardDrive, label: "Documents (GED)" },
                                { id: "communications", icon: MessageSquare, label: "Messagerie" },
                                { id: "finance", icon: Wallet, label: "Facturation" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                                        activeTab === tab.id
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0B0F17]" />
                        </button>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{CLIENT_INFO.name}</p>
                                <p className="text-[10px] text-slate-500">{CLIENT_INFO.manager}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-white font-bold text-sm group-hover:border-indigo-500 transition-colors">
                                {CLIENT_INFO.avatar}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SPACER for Fixed Header */}
            <div className="h-32" />

            <div className="max-w-[1400px] mx-auto px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* === TAB 1: SYNTHÈSE === */}
                {activeTab === "synthèse" && (
                    <div className="space-y-8">
                        {/* Welcome Banner */}
                        <div className="relative rounded-[40px] bg-gradient-to-r from-indigo-900/40 to-violet-900/40 border border-white/5 p-10 overflow-hidden">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="relative z-10 max-w-2xl">
                                <h2 className="text-3xl font-black text-white mb-2">Bonjour, {CLIENT_INFO.manager.split(' ')[1]} 👋</h2>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                                    Vos comptes sont à jour au 27 Janvier. Vous avez 3 actions requises concernant la clôture mensuelle.
                                </p>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 bg-white text-indigo-950 rounded-xl font-bold text-sm shadow-xl shadow-white/5 hover:scale-105 transition-transform flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Voir mes actions (3)
                                    </button>
                                    <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm border border-white/10 hover:bg-white/20 transition-all">
                                        Contacter mon expert
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Financial Health Cards */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <PortalCard title="Trésorerie Actuelle" value="24.5M" unit="FCFA" trend="+12%" trendUp={true} icon={Wallet} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                                <PortalCard title="Résultat Net (YTD)" value="8.2M" unit="FCFA" trend="+5%" trendUp={true} icon={Activity} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />

                                {/* Recent Activity Feed */}
                                <div className="md:col-span-2 glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-white text-lg">Activités Récentes</h3>
                                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Tout voir</button>
                                    </div>
                                    <div className="space-y-6">
                                        <ActivityItem title="TVA Mensuelle Validée" date="Aujourd'hui, 09:30" type="success" />
                                        <ActivityItem title="Facture Client F-2023-99 impayée" date="Hier" type="warning" />
                                        <ActivityItem title="Nouveau document : Bilan Provisoire" date="25 Janvier" type="info" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Next Steps & Assistant */}
                            <div className="space-y-6">
                                <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-2xl shadow-indigo-900/50 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <MessageSquare className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">Besoin d'aide ?</h3>
                                    <p className="text-indigo-100 text-sm mb-6 font-medium">L'Assistant IA connait tout votre dossier.</p>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                                        <span className="text-sm font-medium opacity-80">"Quel est mon résultat ce mois-ci ?"</span>
                                        <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-slate-900/40">
                                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-indigo-400" /> Agenda Fiscal
                                    </h3>
                                    <div className="space-y-4">
                                        <CalendarEvent day="15" month="JUIN" title="TVA & Taxes sur Salaires" desc="Date limite de déclaration" urgent />
                                        <CalendarEvent day="30" month="JUIN" title="Inventaire Physique" desc="Préparation pour audit" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 2: DRIVE (GED) === */}
                {activeTab === "drive" && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-white">Documents Partagés</h2>
                                <p className="text-slate-400">Accédez à tous vos bilans, liasses et contrats en toute sécurité.</p>
                            </div>
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all">
                                <UploadCloud className="w-4 h-4" /> Déposer un fichier
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {["Bilans & Comptes", "Fiscalité", "Juridique & Statuts", "Social & Paie"].map((folder, i) => (
                                <div key={i} className="glass-card p-6 rounded-[24px] border border-white/5 bg-slate-900/40 hover:bg-slate-800/60 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <HardDrive className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <p className="font-bold text-white text-lg">{folder}</p>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 font-bold uppercase tracking-wider">4 Dossiers</span>
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card rounded-[32px] border border-white/5 overflow-hidden bg-slate-900/20">
                            <div className="p-6 border-b border-white/5 flex items-center gap-4">
                                <Search className="w-5 h-5 text-slate-500" />
                                <input type="text" placeholder="Rechercher un document..." className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-600" />
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-4">Nom du Fichier</th>
                                        <th className="px-6 py-4">Catégorie</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Taille</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { name: "Liasse_Fiscale_2023_Definitive.pdf", cat: "Fiscalité", date: "20 Jan 2024", size: "4.2 MB" },
                                        { name: "Grand_Livre_Decembre_2023.xlsx", cat: "Comptabilité", date: "15 Jan 2024", size: "12.8 MB" },
                                        { name: "PV_Assemblee_Generale.pdf", cat: "Juridique", date: "05 Jan 2024", size: "1.5 MB" },
                                        { name: "Contrat_Travail_DirecteurCom.pdf", cat: "Social", date: "12 Dec 2023", size: "0.8 MB" },
                                    ].map((file, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{file.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-400">{file.cat}</td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">{file.date}</td>
                                            <td className="px-6 py-4 text-right text-xs font-mono text-slate-500">{file.size}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === TAB 3 & 4 (Placeholder for brevity, but framework is there) === */}
                {(activeTab === "communications" || activeTab === "finance") && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center mb-4">
                            {activeTab === "communications" ? <MessageSquare className="w-8 h-8 text-slate-500" /> : <Wallet className="w-8 h-8 text-slate-500" />}
                        </div>
                        <h3 className="text-xl font-bold text-white">Module en cours de chargement</h3>
                        <p className="text-slate-400 max-w-md">L'architecture est prête. Ce module sera activé dès que les données réelles seront connectées.</p>
                    </div>
                )}

            </div>
        </div>
    );
}

// === Sub Components ===

function PortalCard({ title, value, unit, trend, trendUp, icon: Icon, color, bg, border }: any) {
    return (
        <div className={cn("glass-card p-6 rounded-[32px] border transition-all hover:scale-[1.02]", border || "border-white/5", bg || "bg-slate-900/40")}>
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-2xl", color.replace("text-", "bg-") / 10 || "bg-white/5")}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
                {trend && (
                    <div className={cn("px-3 py-1 rounded-full text-xs font-black", trendUp ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
                <h4 className="text-3xl font-black text-white">{value}</h4>
                <span className="text-xs font-bold text-slate-500">{unit}</span>
            </div>
        </div>
    );
}

function ActivityItem({ title, date, type }: any) {
    const color = type === "success" ? "bg-emerald-500" : type === "warning" ? "bg-amber-500" : "bg-indigo-500";
    return (
        <div className="flex gap-4 items-start group">
            <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0 ring-4 ring-opacity-20 transition-all group-hover:scale-125", color, color.replace("bg-", "ring-"))} />
            <div>
                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{title}</p>
                <p className="text-xs text-slate-500 font-medium">{date}</p>
            </div>
        </div>
    );
}

function CalendarEvent({ day, month, title, desc, urgent }: any) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className={cn("px-4 py-2 rounded-xl text-center border", urgent ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-slate-800 border-white/5 text-slate-400")}>
                <p className="text-lg font-black">{day}</p>
                <p className="text-[9px] font-black uppercase">{month}</p>
            </div>
            <div>
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
    );
}
