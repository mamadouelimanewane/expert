"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    AlertTriangle,
    Clock,
    Globe,
    FileText,
    Filter,
    Zap,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page générait localement dix obligations à dates, "clientCount" et
// montants entièrement fixes (ex : "5 clients concernés", "15 000 000 FCFA
// estimé"), sans jamais interroger le portefeuille réel. L'API réelle
// existe déjà (/api/fiscalite/obligations) : elle combine le catalogue
// réglementaire (src/lib/ohada/obligations-fiscales.ts, légitimement figé
// — ce sont des textes de loi) avec les déclarations réellement saisies pour
// calculer les volumes et montants par obligation. La page ne l'appelait
// simplement pas ; elle est maintenant branchée dessus.
// ─────────────────────────────────────────────────────────────────────────────

interface Obligation {
    id: string;
    titre: string;
    description: string;
    categorie: string;
    pays: string[];
    reference: string;
    periodicite: string;
    echeance: string;
    urgence: "DEPASSEE" | "IMMINENTE" | "PROCHE" | "NORMALE";
    nbDossiers: number;
    nbRestants: number;
    montantADeclarer: number;
    montantTotal: number;
    statut: "AUCUNE_DECLARATION" | "VALIDE" | "EN_COURS";
}

const COUNTRY_FLAGS: Record<string, string> = {
    CI: "🇨🇮", SN: "🇸🇳", CM: "🇨🇲", BF: "🇧🇫", ML: "🇲🇱",
    GN: "🇬🇳", BJ: "🇧🇯", TG: "🇹🇬", NE: "🇳🇪", GA: "🇬🇦"
};

const TYPE_COLORS: Record<string, string> = {
    TVA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IS: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    RAS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SOCIAL: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    BIC: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function FiscalObligationsPage() {
    const [obligations, setObligations] = useState<Obligation[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [filterCountry, setFilterCountry] = useState("ALL");
    const [filterType, setFilterType] = useState("ALL");

    useEffect(() => {
        (async () => {
            setChargement(true);
            try {
                const res = await fetch("/api/fiscalite/obligations");
                if (!res.ok) throw new Error(`Réponse ${res.status}`);
                const data = await res.json();
                setObligations(data.obligations ?? []);
                setAucuneDonnee(Boolean(data.aucuneDonnee));
            } catch (e) {
                console.error("Chargement des obligations fiscales :", e);
                setErreur("Impossible de charger l'échéancier fiscal.");
            } finally {
                setChargement(false);
            }
        })();
    }, []);

    const countries = useMemo(() => ["ALL", ...Array.from(new Set(obligations.flatMap((o) => o.pays)))], [obligations]);
    const types = ["ALL", "TVA", "IS", "SOCIAL", "RAS", "BIC"];

    const filtered = obligations.filter((ob) => {
        if (filterCountry !== "ALL" && !ob.pays.includes(filterCountry)) return false;
        if (filterType !== "ALL" && ob.categorie !== filterType) return false;
        return true;
    });

    const depassees = filtered.filter((o) => o.urgence === "DEPASSEE").length;
    const imminentes = filtered.filter((o) => o.urgence === "IMMINENTE").length;
    const proches = filtered.filter((o) => o.urgence === "PROCHE").length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <CalendarDays className="w-40 h-40 text-amber-400" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-amber-600 rounded-2xl shadow-xl shadow-amber-600/30">
                            <CalendarDays className="w-8 h-8 text-white" />
                        </div>
                        Échéancier Fiscal OHADA
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl font-medium">
                        Obligations réglementaires du mois, croisées avec les déclarations réellement saisies pour ce portefeuille.
                    </p>
                </div>
            </div>

            {aucuneDonnee && !chargement && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-sm text-amber-200">
                    Aucune déclaration saisie pour la période en cours : les compteurs ci-dessous sont à zéro parce que la base
                    est vide, pas parce que le cabinet est à jour.
                </div>
            )}
            {erreur && <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-300">{erreur}</div>}

            {chargement ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* Alert Summary */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-[32px] border border-rose-500/20 bg-rose-500/5">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertTriangle className="w-5 h-5 text-rose-400" />
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Dépassées</p>
                            </div>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-rose-400">{depassees}</p>
                        </div>
                        <div className="glass-card p-6 rounded-[32px] border border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-center gap-3 mb-3">
                                <Zap className="w-5 h-5 text-amber-400" />
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Imminentes ≤7j</p>
                            </div>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-400">{imminentes}</p>
                        </div>
                        <div className="glass-card p-6 rounded-[32px] border border-sky-500/20 bg-sky-500/5">
                            <div className="flex items-center gap-3 mb-3">
                                <Clock className="w-5 h-5 text-sky-400" />
                                <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Proches ≤21j</p>
                            </div>
                            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-sky-400">{proches}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex gap-2 items-center flex-wrap">
                            <Globe className="w-4 h-4 text-slate-500" />
                            {countries.map((c) => (
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
                        <div className="flex gap-2 items-center flex-wrap">
                            <Filter className="w-4 h-4 text-slate-500" />
                            {types.map((t) => (
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
                        {filtered.length === 0 ? (
                            <p className="text-center text-sm text-slate-500 py-10">Aucune obligation pour ce filtre.</p>
                        ) : (
                            filtered.map((ob) => {
                                const isOverdue = ob.urgence === "DEPASSEE";
                                const isUrgent = ob.urgence === "IMMINENTE";
                                const echeanceDate = new Date(ob.echeance);
                                const daysLeft = Math.ceil((echeanceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                                return (
                                    <div
                                        key={ob.id}
                                        className={cn(
                                            "glass-card p-6 rounded-[28px] border transition-all hover:scale-[1.005]",
                                            isOverdue ? "border-rose-500/30 bg-rose-500/5" : isUrgent ? "border-amber-500/30 bg-amber-500/5" : "border-white/5 bg-slate-900/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "flex-none w-20 h-20 rounded-2xl flex flex-col items-center justify-center border",
                                                isOverdue ? "bg-rose-500/20 border-rose-500/30" : isUrgent ? "bg-amber-500/20 border-amber-500/30" : "bg-slate-800 border-white/5"
                                            )}>
                                                {isOverdue ? (
                                                    <AlertTriangle className="w-6 h-6 text-rose-400 mb-1" />
                                                ) : (
                                                    <>
                                                        <p className={cn("text-2xl font-black", isUrgent ? "text-amber-400" : "text-white")}>{Math.abs(daysLeft)}</p>
                                                        <p className="text-[8px] font-black uppercase text-slate-500">JOURS</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-3 flex-wrap mb-2">
                                                    {ob.pays.slice(0, 3).map((p) => <span key={p} className="text-lg">{COUNTRY_FLAGS[p] || "🌍"}</span>)}
                                                    <h3 className="font-black text-white text-base">{ob.titre}</h3>
                                                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black border uppercase", TYPE_COLORS[ob.categorie])}>
                                                        {ob.categorie}
                                                    </span>
                                                    {isOverdue && <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-rose-500/20 text-rose-400 border-rose-500/30 uppercase">Dépassée</span>}
                                                    {isUrgent && <span className="px-2 py-0.5 rounded-full text-[9px] font-black border bg-amber-500/20 text-amber-400 border-amber-500/30 uppercase animate-pulse">Urgent</span>}
                                                </div>
                                                <p className="text-sm text-slate-400">{ob.description}</p>
                                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                    <p className="text-xs text-slate-500 font-mono">
                                                        📅 {echeanceDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        {ob.nbDossiers} dossier{ob.nbDossiers > 1 ? "s" : ""} concerné{ob.nbDossiers > 1 ? "s" : ""}
                                                        {ob.nbRestants > 0 && ` · ${ob.nbRestants} restant${ob.nbRestants > 1 ? "s" : ""}`}
                                                    </p>
                                                    {ob.montantADeclarer > 0 && (
                                                        <p className="text-xs font-mono text-emerald-400">{ob.montantADeclarer.toLocaleString()} FCFA restant à déclarer</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-600 flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {ob.reference}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
