"use client";

import { useState } from "react";
import {
    BookOpen,
    Search,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    FileText,
    Scale,
    Copy,
    ExternalLink,
    RefreshCw,
    Info,
    Sparkles,
    Gavel,
    BookMarked,
    Link2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Citation {
    id: string;
    reference: string;
    type: "acte_uniforme" | "ccja" | "traite" | "reglement";
    title: string;
    status: "valid" | "modified" | "abrogated" | "pending";
    lastUpdate: string;
    source: string;
    notes?: string;
}

const MOCK_CITATIONS: Citation[] = [
    {
        id: "CIT-001",
        reference: "AUSCGIE Art. 347",
        type: "acte_uniforme",
        title: "Convocation de l'assemblée générale ordinaire",
        status: "valid",
        lastUpdate: "2024-09-12",
        source: "Acte Uniforme relatif au Droit des Sociétés Commerciales et du GIE"
    },
    {
        id: "CIT-002",
        reference: "AUDCG Art. 101",
        type: "acte_uniforme",
        title: "Formation du contrat commercial",
        status: "modified",
        lastUpdate: "2024-01-15",
        source: "Acte Uniforme relatif au Droit Commercial Général",
        notes: "Modifié par Acte Additionnel 2023/002"
    },
    {
        id: "CIT-003",
        reference: "Arrêt CCJA n°087/2023",
        type: "ccja",
        title: "Procédure d'injonction de payer - Compétence territoriale",
        status: "valid",
        lastUpdate: "2023-06-20",
        source: "Cour Commune de Justice et d'Arbitrage"
    },
    {
        id: "CIT-004",
        reference: "AUPSRVE Art. 28",
        type: "acte_uniforme",
        title: "Saisie-attribution des créances",
        status: "abrogated",
        lastUpdate: "2022-03-01",
        source: "Acte Uniforme portant organisation des Procédures Simplifiées de Recouvrement...",
        notes: "Abrogé et remplacé par Art. 28 bis"
    },
    {
        id: "CIT-005",
        reference: "Traité OHADA Art. 10",
        type: "traite",
        title: "Primauté du droit OHADA sur le droit national",
        status: "valid",
        lastUpdate: "1993-10-17",
        source: "Traité relatif à l'Harmonisation du Droit des Affaires en Afrique"
    },
];

export default function OhadaCitePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [citations, setCitations] = useState<Citation[]>(MOCK_CITATIONS);
    const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [documentText, setDocumentText] = useState("");

    const validCount = citations.filter(c => c.status === "valid").length;
    const modifiedCount = citations.filter(c => c.status === "modified").length;
    const abrogatedCount = citations.filter(c => c.status === "abrogated").length;

    const handleValidateDocument = () => {
        setIsValidating(true);
        setTimeout(() => {
            setIsValidating(false);
            setCitations(MOCK_CITATIONS);
        }, 2000);
    };

    const getStatusColor = (status: Citation["status"]) => {
        switch (status) {
            case "valid": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "modified": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "abrogated": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
            case "pending": return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    const getStatusIcon = (status: Citation["status"]) => {
        switch (status) {
            case "valid": return <CheckCircle2 className="w-4 h-4" />;
            case "modified": return <AlertTriangle className="w-4 h-4" />;
            case "abrogated": return <XCircle className="w-4 h-4" />;
            case "pending": return <RefreshCw className="w-4 h-4 animate-spin" />;
        }
    };

    const getTypeLabel = (type: Citation["type"]) => {
        switch (type) {
            case "acte_uniforme": return "Acte Uniforme";
            case "ccja": return "Jurisprudence CCJA";
            case "traite": return "Traité OHADA";
            case "reglement": return "Règlement";
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-10 rounded-[50px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <Scale className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Validation Juridique • OHADA
                            </span>
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-amber-500/20">
                                NEXUS Premium
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight leading-tight uppercase">
                            OHADA-<span className="text-indigo-400">Cite</span>
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg font-medium leading-relaxed max-w-2xl">
                            Validez automatiquement vos citations juridiques OHADA. Détection des textes abrogés, modifiés ou toujours en vigueur.
                        </p>
                    </div>
                </div>
            </div>

            {/* Document Input */}
            <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-8 shadow-2xl">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tighter">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Collez votre texte juridique pour validation
                </h3>
                <textarea
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Collez ici votre contrat, acte ou mémoire pour valider toutes les références OHADA citées..."
                    className="w-full h-40 bg-slate-800/50 border border-white/5 rounded-3xl px-6 py-4 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-4">
                    <p className="text-[10px] text-slate-500">Formats supportés: Texte brut, références directes (ex: AUSCGIE Art. 347)</p>
                    <button
                        onClick={handleValidateDocument}
                        disabled={isValidating}
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                    >
                        {isValidating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isValidating ? "Validation..." : "Valider les Citations"}
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-8 rounded-[40px] bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Citations Analysées</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{citations.length}</span>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">En Vigueur</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-400">{validCount}</span>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Modifiées</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-400">{modifiedCount}</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[40px] bg-rose-500/5 border border-rose-500/20">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Abrogées</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-rose-400">{abrogatedCount}</span>
                        <XCircle className="w-5 h-5 text-rose-500" />
                    </div>
                </div>
            </div>

            {/* Citations List */}
            <div className="glass-card rounded-[48px] border border-white/5 bg-slate-900/40 p-10 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <BookMarked className="w-6 h-6 text-indigo-400" />
                        Références OHADA Détectées
                    </h3>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {citations.filter(c =>
                        c.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.title.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((citation) => (
                        <div
                            key={citation.id}
                            onClick={() => setSelectedCitation(citation)}
                            className={cn(
                                "p-6 rounded-3xl border transition-all hover:scale-[1.01] cursor-pointer",
                                citation.status === "valid" ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30" :
                                    citation.status === "modified" ? "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30" :
                                        citation.status === "abrogated" ? "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30" :
                                            "bg-slate-500/5 border-slate-500/10"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <div className={cn("p-3 rounded-xl", getStatusColor(citation.status))}>
                                        {getStatusIcon(citation.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-lg font-black text-white">{citation.reference}</h4>
                                            <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", getStatusColor(citation.status))}>
                                                {citation.status === "valid" ? "En vigueur" :
                                                    citation.status === "modified" ? "Modifié" :
                                                        citation.status === "abrogated" ? "Abrogé" : "Vérification..."}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-2">{citation.title}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" />
                                                {getTypeLabel(citation.type)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3" />
                                                Màj: {citation.lastUpdate}
                                            </span>
                                        </div>
                                        {citation.notes && (
                                            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                                <p className="text-xs text-amber-400 flex items-start gap-2">
                                                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                                    {citation.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
