"use client";

import { useState } from "react";
import {
    FileSignature,
    Plus,
    Search,
    Filter,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Eye,
    Download,
    MoreVertical,
    Sparkles,
    PenTool,
    Users,
    Calendar,
    FileText,
    RefreshCw,
    Mail,
    Copy,
    Gavel
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LettreMission {
    id: string;
    reference: string;
    client: string;
    type: string;
    montant: string;
    dateCreation: string;
    dateExpiration: string;
    status: "Brouillon" | "Envoyée" | "Signée" | "Expirée" | "Refusée";
    signataires: { nom: string; signed: boolean }[];
}

const MOCK_LETTRES: LettreMission[] = [
    {
        id: "LM-2024-001",
        reference: "LM-2024-001",
        client: "Société Industrielle du Bénin (SIB)",
        type: "Audit Légal Annuel",
        montant: "4 500 000 FCFA",
        dateCreation: "15/01/2024",
        dateExpiration: "15/02/2024",
        status: "Signée",
        signataires: [
            { nom: "M. Konan (DG)", signed: true },
            { nom: "Cabinet Expert", signed: true }
        ]
    },
    {
        id: "LM-2024-002",
        reference: "LM-2024-002",
        client: "Traoré Import-Export SARL",
        type: "Mission de Tenue Comptable",
        montant: "1 200 000 FCFA/an",
        dateCreation: "20/01/2024",
        dateExpiration: "20/02/2024",
        status: "Envoyée",
        signataires: [
            { nom: "Mme Traoré", signed: false },
            { nom: "Cabinet Expert", signed: true }
        ]
    },
    {
        id: "LM-2024-003",
        reference: "LM-2024-003",
        client: "TechStart Innovations",
        type: "Conseil Fiscal & Optimisation",
        montant: "2 800 000 FCFA",
        dateCreation: "01/02/2024",
        dateExpiration: "01/03/2024",
        status: "Brouillon",
        signataires: [
            { nom: "M. Ndao (CEO)", signed: false },
            { nom: "Cabinet Expert", signed: false }
        ]
    },
    {
        id: "LM-2024-004",
        reference: "LM-2024-004",
        client: "Groupe Distribution Sénégal",
        type: "Commissariat aux Comptes",
        montant: "8 500 000 FCFA",
        dateCreation: "10/12/2023",
        dateExpiration: "10/01/2024",
        status: "Expirée",
        signataires: [
            { nom: "Direction Financière", signed: false },
            { nom: "Cabinet Expert", signed: true }
        ]
    }
];

const TEMPLATES = [
    { name: "Audit Légal (CAC)", icon: FileSignature },
    { name: "Tenue Comptable", icon: FileText },
    { name: "Conseil Fiscal", icon: Sparkles },
    { name: "Mission Spéciale", icon: PenTool }
];

export default function LettresMissionPage() {
    const [filter, setFilter] = useState("tous");
    const [showNewModal, setShowNewModal] = useState(false);

    const filteredLettres = filter === "tous"
        ? MOCK_LETTRES
        : MOCK_LETTRES.filter(l => l.status.toLowerCase() === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Signée": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Envoyée": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            case "Brouillon": return "bg-slate-700 text-slate-400 border-slate-600";
            case "Expirée": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            case "Refusée": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-slate-700 text-slate-400 border-slate-600";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Signée": return <CheckCircle2 className="w-3 h-3" />;
            case "Envoyée": return <Send className="w-3 h-3" />;
            case "Brouillon": return <FileText className="w-3 h-3" />;
            case "Expirée": return <AlertCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative bg-slate-900/40 p-10 rounded-[50px] border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                    <FileSignature className="w-48 h-48 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-2xl shadow-indigo-600/30">
                                <FileSignature className="w-8 h-8 text-white" />
                            </div>
                            Lettres de Mission
                        </h2>
                        <p className="text-slate-400 mt-2 max-w-2xl font-medium text-lg leading-relaxed">
                            Créez, envoyez et faites signer vos lettres de mission avec signature électronique certifiée.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 flex items-center gap-3 transition-all">
                            <RefreshCw className="w-4 h-4 text-indigo-400" /> Renouveler
                        </button>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                        >
                            <Plus className="w-5 h-5" /> Nouvelle Lettre
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard label="Total Actives" value="12" trend="+2 ce mois" color="text-white" />
                <StatCard label="En Attente Signature" value="3" trend="Suivi requis" color="text-amber-400" />
                <StatCard label="Signées (2024)" value="24" trend="+18% vs 2023" color="text-emerald-400" />
                <StatCard label="CA Contractualisé" value="45.2M" unit="FCFA" color="text-indigo-400" />
            </div>

            {/* Templates Quick Access */}
            <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/20">
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Modèles Pré-définis (OHADA)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TEMPLATES.map((tpl, idx) => (
                        <button
                            key={idx}
                            className="p-6 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <tpl.icon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-white font-bold text-sm">{tpl.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Conforme OHADA</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* TEMPOLIA INSPIRED: Obligations Distribution Table */}
            <div className="glass-card p-10 rounded-[48px] border border-white/5 bg-slate-900/60 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Gavel className="w-48 h-48 text-indigo-400" />
                </div>

                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    Répartition des Obligations (Annexe Contractuelle)
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    <div className="space-y-6">
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                            Conformément aux standards professionnels, Tempolia et le Cabinet 360 automatisent la répartition des tâches pour éviter toute ambiguïté lors des contrôles qualité.
                        </p>
                        <div className="space-y-3">
                            <ObligationRow task="Collecte des pièces justificatives" owner="Client" status="Crucial" />
                            <ObligationRow task="Classement et archivage numérique" owner="Cabinet" status="Auto" />
                            <ObligationRow task="Déclarations Fiscales Mensuelles" owner="Cabinet" status="Légal" color="text-indigo-400" />
                            <ObligationRow task="Paiement des impôts et taxes" owner="Client" status="Final" />
                        </div>
                    </div>

                    <div className="bg-slate-950/40 p-8 rounded-[32px] border border-white/5 flex flex-col justify-center text-center">
                        <PenTool className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <h4 className="text-white font-bold text-lg mb-2">Éditeur de Modèle Word</h4>
                        <p className="text-xs text-slate-500 mb-6">Personnalisez vos clauses contractuelles. Importez votre propre modèle d'entête au format .docx.</p>
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Configurer le Modèle Maître
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40">
                    <div className="flex gap-2 flex-wrap">
                        {["tous", "brouillon", "envoyée", "signée", "expirée"].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === s ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-800 text-slate-500 hover:text-white"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher une lettre..."
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Référence / Client</th>
                                <th className="px-6 py-6">Type de Mission</th>
                                <th className="px-6 py-6 text-right">Honoraires</th>
                                <th className="px-6 py-6 text-center">Signataires</th>
                                <th className="px-6 py-6 text-center">Statut</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLettres.map((lettre) => (
                                <tr key={lettre.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
                                                <FileSignature className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-white block">{lettre.client}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lettre.reference} • {lettre.dateCreation}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-sm text-slate-300 font-medium">{lettre.type}</span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <span className="font-mono font-bold text-white">{lettre.montant}</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex justify-center -space-x-2">
                                            {lettre.signataires.map((sig, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-black",
                                                        sig.signed ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-400"
                                                    )}
                                                    title={`${sig.nom} - ${sig.signed ? "Signé" : "En attente"}`}
                                                >
                                                    {sig.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                            getStatusColor(lettre.status)
                                        )}>
                                            {getStatusIcon(lettre.status)}
                                            {lettre.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all" title="Voir">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {lettre.status === "Brouillon" && (
                                                <button className="p-2.5 hover:bg-indigo-500/10 rounded-xl text-indigo-400 transition-all" title="Envoyer">
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            )}
                                            {lettre.status === "Expirée" && (
                                                <button className="p-2.5 hover:bg-amber-500/10 rounded-xl text-amber-400 transition-all" title="Renouveler">
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all" title="Télécharger">
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
    );
}

function StatCard({ label, value, trend, unit, color }: any) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-baseline gap-1">
                <h4 className={cn("text-3xl font-black", color)}>{value}</h4>
                {unit && <span className="text-xs text-slate-600 font-bold">{unit}</span>}
            </div>
            {trend && <p className="text-[10px] text-slate-600 mt-2">{trend}</p>}
        </div>
    );
}

function ObligationRow({ task, owner, status, color = "text-white" }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-all hover:bg-white/10 group">
            <div className="flex items-center gap-4">
                <div className={cn("w-1.5 h-1.5 rounded-full", owner === "Cabinet" ? "bg-indigo-500" : "bg-amber-500")} />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{task}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{owner}</span>
                <span className={cn("px-2 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest border border-white/10", color)}>{status}</span>
            </div>
        </div>
    );
}
