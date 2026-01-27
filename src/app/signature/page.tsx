"use client";

import { useState } from "react";
import {
    ShieldCheck,
    PenTool,
    FileText,
    Users,
    Mail,
    Lock,
    Eye,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    Search,
    MoreVertical,
    History,
    Fingerprint,
    Smartphone,
    ArrowUpRight,
    Key,
    ExternalLink,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocToSign {
    id: string;
    title: string;
    owners: string[];
    sentDate: string;
    status: "Signé" | "En attente" | "Partiel";
    expiry: string;
    level: "Simple" | "Avancé" | "Qualifié";
}

const MOCK_DOCS: DocToSign[] = [
    { id: "SIG-001", title: "Lettre de Mission - Audit SIB", owners: ["M. Touré", "Assoc. Cabinet"], sentDate: "22/05/2024", status: "Partiel", expiry: "05/06/2024", level: "Qualifié" },
    { id: "SIG-002", title: "Approbation Comptes Annuels 2023", owners: ["J. Dupont"], sentDate: "20/05/2024", status: "Signé", expiry: "30/05/2024", level: "Avancé" },
    { id: "SIG-003", title: "Contrat de Travail - Junior", owners: ["P. Ndiaye", "RH Cabinet"], sentDate: "24/05/2024", status: "En attente", expiry: "10/06/2024", level: "Simple" },
];

export default function SignaturePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <Fingerprint className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                        <div className="p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/30">
                            <PenTool className="w-8 h-8 text-white" />
                        </div>
                        Signature Électronique Certifiée
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                        Faites signer vos documents juridiques et comptables avec une valeur probante certifiée (ISO/IEC 27001).
                    </p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all">
                        <Key className="w-4 h-4 text-indigo-400" /> Mes Certificats
                    </button>
                    <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95">
                        <Plus className="w-5 h-5" /> Signer un Document
                    </button>
                </div>
            </div>

            {/* Verification & Trust Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TrustCard icon={ShieldCheck} title="Valeur Probante" desc="Conforme aux règlements eIDAS & OHADA." color="text-indigo-400" />
                <TrustCard icon={Smartphone} title="Validation Mobile" desc="Double authentification par SMS/Email." color="text-cyan-400" />
                <TrustCard icon={History} title="Audit Trail" desc="Historique complet et scellé pour chaque acte." color="text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                        <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-6">Statistiques Signature</h4>
                        <div className="space-y-8">
                            <StatProgress label="Signatures Réussies" value={98} total={100} color="bg-emerald-500" />
                            <StatProgress label="Délai Moyen" value={4} total={24} unit="h" color="bg-indigo-500" />
                            <StatProgress label="Économie Papier" value={1250} total={1500} unit=" pages" color="bg-cyan-500" />
                        </div>
                    </div>

                    <div className="glass-card p-10 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[40px] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-40 h-40 text-white" />
                        </div>
                        <h4 className="text-white font-black text-xl mb-2 relative z-10">Lancer une Campagne</h4>
                        <p className="text-xs text-indigo-200 mb-6 relative z-10">Envoyez 100+ documents à signer en une fois.</p>
                        <button className="w-full py-4 bg-white text-indigo-900 font-black uppercase tracking-widest text-[10px] rounded-2xl relative z-10 hover:shadow-2xl transition-all">
                            Bulk Signing IA
                        </button>
                    </div>
                </div>

                {/* Main Documents Table */}
                <div className="lg:col-span-3 glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            Registre des Actes Signés
                        </h3>
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher un dossier..."
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6">Document</th>
                                    <th className="px-6 py-6 font-black">Signataires</th>
                                    <th className="px-6 py-6 font-black text-center">Niveau</th>
                                    <th className="px-6 py-6 font-black">Statut</th>
                                    <th className="px-8 py-6 font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {MOCK_DOCS.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{doc.title}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Réf: {doc.id} • {doc.sentDate}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-medium text-slate-400 text-xs">
                                            {doc.owners.join(" & ")}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={cn(
                                                "text-[9px] px-2 py-0.5 rounded-full font-black uppercase border",
                                                doc.level === "Qualifié" ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/5" : "border-slate-700 text-slate-500"
                                            )}>
                                                {doc.level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className={cn(
                                                "flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full border w-fit shadow-sm",
                                                doc.status === "Signé" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                    doc.status === "Partiel" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                        "bg-slate-800 text-slate-500 border-slate-700"
                                            )}>
                                                {doc.status === "Signé" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {doc.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TrustCard({ icon: Icon, title, desc, color }: any) {
    return (
        <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5 flex items-start gap-6 group hover:bg-slate-900/60 transition-all">
            <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">{title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

function StatProgress({ label, value, total, unit, color }: any) {
    const percentage = Math.round((value / total) * 100);
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-white">{value}{unit || ""}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px]", color)} style={{ width: `${percentage}%`, opacity: 0.8 }} />
            </div>
        </div>
    );
}
