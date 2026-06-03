"use client";

import { useState, useEffect } from "react";
import {
    CalendarDays,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ChevronRight,
    RefreshCw,
    Globe,
    FileText,
    Bell,
    Filter,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FiscalObligation {
    id: string;
    country: string;
    code: string;
    label: string;
    dueDate: Date;
    daysLeft: number;
    type: "TVA" | "IS" | "IRPP" | "CNPS" | "PATENTE" | "AUTRE";
    amount?: number;
    status: "UPCOMING" | "URGENT" | "OVERDUE" | "DONE";
    description: string;
    clientCount: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
    CI: "🇨🇮", SN: "🇸🇳", CM: "🇨🇲", BF: "🇧🇫", ML: "🇲🇱",
    GN: "🇬🇳", BJ: "🇧🇯", TG: "🇹🇬", NE: "🇳🇪", GA: "🇬🇦"
};

const TYPE_COLORS: Record<string, string> = {
    TVA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    IRPP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CNPS: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    PATENTE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    AUTRE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

// Données statiques du référentiel fiscal OHADA
function generateObligations(): FiscalObligation[] {
    const now = new Date();
    const year = now.getFullYear();

    const obligations: Omit<FiscalObligation, "daysLeft" | "status">[] = [
        { id: "ci-tva-06", country: "CI", code: "TVA-JUN", label: "Déclaration TVA Juin 2026", dueDate: new Date(`${year}-07-15`), type: "TVA", description: "Déclaration et paiement TVA mensuelle — DGI Côte d'Ivoire", clientCount: 3 },
        { id: "sn-tva-06", country: "SN", code: "TVA-JUN", label: "Déclaration TVA Juin 2026", dueDate: new Date(`${year}-07-15`), type: "TVA", description: "Déclaration TVA mensuelle — DGID Sénégal", clientCount: 1 },
        { id: "cm-tva-06", country: "CM", code: "TVA-JUN", label: "Déclaration TVA Juin 2026", dueDate: new Date(`${year}-07-15`), type: "TVA", description: "Déclaration mensuelle TVA — DGI Cameroun", clientCount: 1 },
        { id: "ci-cnps-06", country: "CI", code: "CNPS-JUN", label: "Cotisations CNPS Juin 2026", dueDate: new Date(`${year}-07-10`), type: "CNPS", description: "Paiement cotisations sociales employeur — CNPS Côte d'Ivoire", clientCount: 2 },
        { id: "sn-ipres-06", country: "SN", code: "IPRES-JUN", label: "Cotisations IPRES/CSS Juin", dueDate: new Date(`${year}-07-10`), type: "CNPS", description: "Paiement mensuel IPRES et CSS — Sénégal", clientCount: 1 },
        { id: "bf-is-q2", country: "BF", code: "IS-ACOMPTE", label: "Acompte IS 2ème trimestre", dueDate: new Date(`${year}-06-30`), type: "IS", description: "Versement du 2ème acompte IS — DGI Burkina Faso", clientCount: 1 },
        { id: "ml-is-q2", country: "ML", code: "IS-ACOMPTE", label: "Acompte IS 2ème trimestre", dueDate: new Date(`${year}-06-30`), type: "IS", description: "2ème acompte IS 1/4 du montant annuel — DGI Mali", clientCount: 1 },
        { id: "ci-irpp-06", country: "CI", code: "IRPP-JUN", label: "Retenue à la source IRPP Juin", dueDate: new Date(`${year}-07-10`), type: "IRPP", description: "Versement IRPP retenu sur salaires — Employeurs CI", clientCount: 3 },
        { id: "all-patente", country: "CI", code: "PATENTE-2026", label: "Patente / Impôt Professionnel 2026", dueDate: new Date(`${year}-12-31`), type: "PATENTE", description: "Paiement annuel de la patente ou équivalent", clientCount: 5 },
        { id: "ci-is-annual", country: "CI", code: "IS-ANNUAL", label: "IS Exercice 2025 — Solde", dueDate: new Date(`${year}-04-30`), type: "IS", description: "Solde IS sur bénéfices 2025 après déduction acomptes", clientCount: 2, amount: 15000000 },
    ];

    return obligations.map(ob => {
        const diff = Math.ceil((ob.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let status: FiscalObligation["status"] = "UPCOMING";
        if (diff < 0) status = "OVERDUE";
        else if (diff <= 7) status = "URGENT";
        else if (diff <= 30) status = "UPCOMING";
        else status = "DONE";
        return { ...ob, daysLeft: diff, status };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
}

export default function FiscalObligationsPage() {
    const [obligations] = useState<FiscalObligation[]>(generateObligations);
    const [filterCountry, setFilterCountry] = useState("ALL");
    const [filterType, setFilterType] = useState("ALL");

    const countries = ["ALL", ...Array.from(new Set(obligations.map(o => o.country)))];
    const types = ["ALL", "TVA", "IS", "CNPS", "IRPP", "PATENTE"];

    const filtered = obligations.filter(ob => {
        if (filterCountry !== "ALL" && ob.country !== filterCountry) return false;
        if (filterType !== "ALL" && ob.type !== filterType) return false;
        return true;
    });

    const overdue = filtered.filter(o => o.status === "OVERDUE").length;
    const urgent = filtered.filter(o => o.status === "URGENT").length;
    const upcoming = filtered.filter(o => o.status === "UPCOMING").length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <CalendarDays className="w-40 h-40 text-amber-400" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-amber-600 rounded-2xl shadow-xl shadow-amber-600/30">
                            <CalendarDays className="w-8 h-8 text-white" />
                        </div>
                        Échéancier Fiscal OHADA
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Calendrier fiscal multi-pays — CI, SN, CM, BF, ML et toute la zone OHADA.
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-amber-600/30">
                        <Bell className="w-4 h-4" />
                        Activer Alertes
                    </button>
                </div>
            </div>

            {/* Alert Summary */}
            <div className="grid grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-[32px] border border-rose-500/20 bg-rose-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400" />
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">En retard</p>
                    </div>
                    <p className="text-4xl font-black text-rose-400">{overdue}</p>
                    <p className="text-xs text-rose-400/60 mt-1">obligation{overdue > 1 ? "s" : ""} dépassée{overdue > 1 ? "s" : ""}</p>
                </div>
                <div className="glass-card p-6 rounded-[32px] border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Urgentes ≤7j</p>
                    </div>
                    <p className="text-4xl font-black text-amber-400">{urgent}</p>
                    <p className="text-xs text-amber-400/60 mt-1">à traiter immédiatement</p>
                </div>
                <div className="glass-card p-6 rounded-[32px] border border-sky-500/20 bg-sky-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-sky-400" />
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">À venir</p>
                    </div>
                    <p className="text-4xl font-black text-sky-400">{upcoming}</p>
                    <p className="text-xs text-sky-400/60 mt-1">dans les 30 prochains jours</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2 items-center">
                    <Globe className="w-4 h-4 text-slate-500" />
                    {countries.map(c => (
                        <button
                            key={c}
                            onClick={() => setFilterCountry(c)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all",
                                filterCountry === c ? "bg-white text-slate-900 border-white" : "text-slate-400 border-white/5 hover:text-white"
                            )}
                        >
                            {c === "ALL" ? "Tous pays" : `${COUNTRY_FLAGS[c] || ""} ${c}`}
                        </button>
                    ))}
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex gap-2 items-center">
                    <Filter className="w-4 h-4 text-slate-500" />
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all",
                                filterType === t ? "bg-white text-slate-900 border-white" : "text-slate-400 border-white/5 hover:text-white"
                            )}
                        >
                            {t === "ALL" ? "Tous types" : t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                {filtered.map((ob, idx) => {
                    const isOverdue = ob.status === "OVERDUE";
                    const isUrgent = ob.status === "URGENT";

                    return (
                        <div
                            key={ob.id}
                            className={cn(
                                "glass-card p-6 rounded-[28px] border transition-all hover:scale-[1.005] cursor-pointer group",
                                isOverdue ? "border-rose-500/30 bg-rose-500/5" :
                                    isUrgent ? "border-amber-500/30 bg-amber-500/5" :
                                        "border-white/5 bg-slate-900/40"
                            )}
                        >
                            <div className="flex items-center gap-6">
                                {/* Day countdown */}
                                <div className={cn(
                                    "flex-none w-20 h-20 rounded-2xl flex flex-col items-center justify-center border",
                                    isOverdue ? "bg-rose-500/20 border-rose-500/30" :
                                        isUrgent ? "bg-amber-500/20 border-amber-500/30" :
                                            "bg-slate-800 border-white/5"
                                )}>
                                    {isOverdue ? (
                                        <AlertTriangle className="w-6 h-6 text-rose-400 mb-1" />
                                    ) : (
                                        <>
                                            <p className={cn("text-2xl font-black", isUrgent ? "text-amber-400" : "text-white")}>
                                                {Math.abs(ob.daysLeft)}
                                            </p>
                                            <p className="text-[8px] font-black uppercase text-slate-500">JOURS</p>
                                        </>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-3 flex-wrap mb-2">
                                        <span className="text-lg">{COUNTRY_FLAGS[ob.country] || "🌍"}</span>
                                        <h3 className="font-black text-white text-base">{ob.label}</h3>
                                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black border uppercase", TYPE_COLORS[ob.type])}>
                                            {ob.type}
                                        </span>
                                        {isOverdue && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-rose-500/20 text-rose-400 border-rose-500/30 uppercase">
                                                En Retard
                                            </span>
                                        )}
                                        {isUrgent && (
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-amber-500/20 text-amber-400 border-amber-500/30 uppercase animate-pulse">
                                                Urgent
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400">{ob.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <p className="text-xs text-slate-500 font-mono">
                                            📅 {ob.dueDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {ob.clientCount} client{ob.clientCount > 1 ? "s" : ""} concerné{ob.clientCount > 1 ? "s" : ""}
                                        </p>
                                        {ob.amount && (
                                            <p className="text-xs font-mono text-emerald-400">
                                                {ob.amount.toLocaleString()} FCFA estimé
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex-none flex flex-col gap-2">
                                    <button className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all",
                                        isOverdue ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-500" :
                                            isUrgent ? "bg-amber-600 text-white border-amber-500 hover:bg-amber-500" :
                                                "bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700"
                                    )}>
                                        {isOverdue ? "Traiter" : isUrgent ? "Préparer" : "Planifier"}
                                    </button>
                                    <button className="px-4 py-2 bg-transparent text-slate-500 text-[10px] font-black uppercase border border-white/5 rounded-xl hover:text-white hover:border-white/20 transition-all flex items-center gap-1 justify-center">
                                        <FileText className="w-3 h-3" /> Formulaire
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
