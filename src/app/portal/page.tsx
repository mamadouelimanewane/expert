"use client";

import { useState } from "react";
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
    AtSign
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ClientPortalPage() {
    const [activeTab, setActiveTab] = useState("synthèse");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Portal Header */}
            <div className="bg-slate-900/50 border-b border-white/5 p-6 mb-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <span className="text-xl font-bold text-white">S</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Espace Client : SIB</h1>
                            <p className="text-xs text-slate-500 font-medium">Société Ivoirienne de Banque • ID: 8829-CI</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 overflow-x-auto no-scrollbar max-w-full">
                        {["synthèse", "drive", "communications", "échanges", "finance"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap",
                                    activeTab === tab ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-8 pb-20">

                {/* SYNTHÈSE VIEW */}
                {activeTab === "synthèse" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Financial & Missions */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <PortalStatCard title="Solde Trésorerie" value="24.5M" sub="Actualisé à 08:30" icon={Wallet} color="text-emerald-400" />
                                <PortalStatCard title="TVA à régler" value="1.2M" sub="Échéance: 15 Juin" icon={Calendar} color="text-amber-400" />
                                <PortalStatCard title="Factures en attente" value="3" sub="Vérifier l'onglet finance" icon={CreditCard} color="text-rose-400" />
                            </div>

                            {/* Mission Progress */}
                            <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/30">
                                <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-indigo-400" />
                                    Travaux en cours au cabinet
                                </h3>
                                <div className="space-y-8">
                                    <ProgressMission label="Tenue Comptable - Mai 2024" progress={85} status="Finalisation des rapprochements" />
                                    <ProgressMission label="Audit Annuel Commissariat" progress={40} status="Sondages IA en cours" />
                                    <ProgressMission label="Déclaration Fiscalité Trimestrielle" progress={10} status="En attente de vos pièces" />
                                </div>
                            </div>
                        </div>

                        {/* Right: Messages & Quick Actions */}
                        <div className="space-y-8">
                            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-xl shadow-indigo-600/20">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5" />
                                    Assistant IA Expert
                                </h3>
                                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                    Besoin d'une réponse rapide sur un point de fiscalité OHADA ? Posez votre question ici.
                                </p>
                                <div className="relative">
                                    <input type="text" placeholder="Entrez votre question..." className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder:text-white/50 outline-none" />
                                    <button className="absolute right-2 top-2 p-1.5 bg-white text-indigo-600 rounded-lg hover:scale-105 transition-transform">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/50">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Video className="w-4 h-4 text-indigo-400" />
                                    Prochaines Réunions
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-xs font-bold text-white">Point Fiscal Trimestriel</p>
                                            <p className="text-[10px] text-slate-500">Aujourd'hui, 14:00 (Zoom)</p>
                                        </div>
                                        <button className="p-2 bg-indigo-600 rounded-lg text-white">
                                            <Video className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DRIVE VIEW */}
                {activeTab === "drive" && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <HardDrive className="w-6 h-6 text-indigo-400" />
                                Drive Sécurisé (Cloud Cabinet)
                            </h3>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2">
                                    <UploadCloud className="w-4 h-4" /> Upload
                                </button>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
                                    <Share2 className="w-4 h-4" /> Partager
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {["Comptabilité", "Fiscalité", "Social", "Juridique"].map((folder) => (
                                <div key={folder} className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-800 transition-all cursor-pointer group">
                                    <FileText className="w-10 h-10 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-white">{folder}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">12 Fichiers • 45 MB</p>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Nom du document</th>
                                        <th className="px-6 py-4">Date ajouté</th>
                                        <th className="px-6 py-4 text-right">Taille</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { name: "Liasse_Finale_2023.pdf", date: "20/01/2024", size: "2.4 MB" },
                                        { name: "Relevés_Janvier.zip", date: "05/02/2024", size: "15.8 MB" },
                                        { name: "Contrat_Bail.pdf", date: "12/12/2023", size: "1.2 MB" },
                                    ].map((file, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-slate-300 font-medium">{file.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">{file.date}</td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-500">{file.size}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* COMMUNICATIONS VIEW (HUB) */}
                {activeTab === "communications" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <CommChannelCard name="WhatsApp" icon={MessageCircle} color="bg-emerald-500" action="Ouvrir WhatsApp" />
                            <CommChannelCard name="Zoom Meetings" icon={Video} color="bg-blue-500" action="Lancer Zoom" />
                            <CommChannelCard name="Microsoft Teams" icon={MonitorIcon} color="bg-indigo-500" action="Ouvrir Teams" />
                            <CommChannelCard name="Support Email" icon={AtSign} color="bg-rose-500" action="Envoyer Email" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/30">
                                <h3 className="text-lg font-bold text-white mb-6">Fil d'actualité Cabinet-Client</h3>
                                <div className="space-y-6">
                                    {[
                                        { user: "Maître Camara", action: "a validé votre TVA Mensuelle", time: "Il y a 2h", type: "system" },
                                        { user: "Assistance", action: "a planifié une réunion Teams", time: "Il y a 5h", type: "meeting" },
                                        { user: "Serveur Drive", action: "Nouveau document partagé : 'Audit Immos'", time: "Hier", type: "file" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5 font-bold text-indigo-400">
                                                {item.user[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-200">
                                                    <span className="font-bold">{item.user}</span> {item.action}
                                                </p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/50">
                                <h3 className="text-white font-bold mb-4">Contact d'Urgence</h3>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center ring-2 ring-indigo-600/20">
                                            <Phone className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ligne Directe Expert</p>
                                            <p className="text-lg font-bold text-white">+225 07 00 00 00 00</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all">
                                        Lancer un appel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FINANCE VIEW */}
                {activeTab === "finance" && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-3 space-y-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-indigo-400" />
                                    Factures en attente de paiement
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { id: "FAC-2024-045", label: "Honoraires Mai", amount: "450 000 FCFA", due: "05/06" },
                                    ].map((inv, i) => (
                                        <div key={i} className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-white/5 rounded-2xl">
                                                    <FileText className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{inv.label}</p>
                                                    <p className="text-xs text-slate-500 uppercase">{inv.id} • Échéance: {inv.due}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <span className="text-xl font-bold text-white">{inv.amount}</span>
                                                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                                    Régler maintenant
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50 self-start">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Mode de paiement préféré</h4>
                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 mb-6">
                                    <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-bold text-xs text-white">W</div>
                                    <span className="text-sm font-medium">Wave Mobile Money</span>
                                </div>
                                <button className="w-full text-xs text-indigo-400 font-bold hover:underline">Modifier les préférences</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Persistent Bottom Bar (Mobile Ready) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-3 flex justify-between items-center shadow-2xl z-50">
                <div className="flex items-center gap-3 px-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Connecté à votre Expert</span>
                </div>
                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message Urgent
                </button>
            </div>
        </div>
    );
}

function PortalStatCard({ title, value, sub, icon: Icon, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                    <Icon className={cn("w-5 h-5", color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
                <h4 className="text-2xl font-bold text-white">{value}</h4>
                <span className="text-[10px] text-slate-600 uppercase font-bold">FCFA</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-2 italic">{sub}</p>
        </div>
    );
}

function ProgressMission({ label, progress, status }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-xs text-slate-500 italic mt-1">{status}</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}

function CommChannelCard({ name, icon: Icon, color, action }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50 transition-all group cursor-pointer text-center">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-opacity-20 transition-all group-hover:scale-110", color, color.replace('bg-', 'ring-'))}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-white mb-2">{name}</h4>
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                {action}
            </button>
        </div>
    );
}
