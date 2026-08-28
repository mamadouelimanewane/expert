"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowUpRight,
    BarChart3,
    Clock,
    Search,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Boni / mali par mission.
//
// La page affichait quatre dossiers fictifs, une « marge globale cabinet »
// figée à +24,5 %, un boni total de « 12,5 M » sans rapport avec aucune
// donnée, et une alerte nominative sur un client inventé (« Orange Sénégal,
// mali de 200 000 FCFA »).
//
// Elle est alimentée par /api/missions/boni-mali : le budget d'honoraires de
// chaque mission est comparé au coût interne réel (temps saisi × coût horaire
// du collaborateur). Le coût horaire est un paramétrage du cabinet
// (User.costRate) — tant qu'il manque pour un intervenant, le boni/mali de la
// mission reste INDÉTERMINÉ, jamais estimé à zéro.
// ─────────────────────────────────────────────────────────────────────────────

type MissionRentabilite = {
    missionId: string;
    titre: string;
    client: string;
    budgetHonoraires: number;
    budgetHeures: number;
    heuresPassees: number;
    coutInterne: number | null;
    boniMali: number | null;
    tauxBoniMali: number | null;
    statut: "BONI" | "MALI" | "EQUILIBRE" | "INDETERMINE";
    intervenantsNonParametres: number;
    avertissements: string[];
};

type Synthese = {
    nbMissions: number;
    nbEvaluees: number;
    nbIndeterminees: number;
    nbBoni: number;
    nbMali: number;
    budgetHonorairesTotal: number;
    coutInterneTotal: number;
    boniMaliTotal: number;
};

const STATUT_STYLE: Record<MissionRentabilite["statut"], string> = {
    BONI: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MALI: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    EQUILIBRE: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    INDETERMINE: "bg-slate-800 text-slate-400 border-white/10",
};

const LIBELLE_STATUT: Record<MissionRentabilite["statut"], string> = {
    BONI: "Boni",
    MALI: "Mali",
    EQUILIBRE: "Équilibre",
    INDETERMINE: "Indéterminé",
};

export default function BoniMaliPage() {
    const [filtre, setFiltre] = useState<"tous" | "boni" | "mali">("tous");
    const [recherche, setRecherche] = useState("");
    const [missions, setMissions] = useState<MissionRentabilite[]>([]);
    const [synthese, setSynthese] = useState<Synthese | null>(null);
    const [sansCoutHoraire, setSansCoutHoraire] = useState(0);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/missions/boni-mali");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            setMissions(data.missions ?? []);
            setSynthese(data.synthese ?? null);
            setSansCoutHoraire(data.nbCollaborateursSansCoutHoraire ?? 0);
        } catch (e) {
            console.error("Chargement du boni/mali :", e);
            setErreur("Impossible de charger l'analyse de rentabilité.");
            setMissions([]);
            setSynthese(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const normaliser = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const terme = normaliser(recherche.trim());

    const visibles = missions
        .filter((m) => filtre === "tous" || m.statut.toLowerCase() === filtre)
        .filter((m) => !terme || normaliser(m.client).includes(terme) || normaliser(m.titre).includes(terme));

    const fcfa = (n: number) => Math.round(n).toLocaleString("fr-FR");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-slate-900/60 p-4 sm:p-6 lg:p-10 rounded-[20px] sm:rounded-[36px] lg:rounded-[48px] border border-white/5 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 sm:p-8 lg:p-12 opacity-5 pointer-events-none">
                    <TrendingUp className="w-64 h-64 text-indigo-400" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20">
                                Gestion interne &amp; boni-mali
                            </span>
                        </div>
                        <h2 className="page-title">
                            Analyse de <span className="text-indigo-400">rentabilité dossier</span>
                        </h2>
                        <p className="page-subtitle max-w-2xl">
                            Coût interne réel (temps saisi × coût horaire) comparé au budget
                            d&apos;honoraires de chaque mission budgétée.
                        </p>
                    </div>

                    {synthese && synthese.nbEvaluees > 0 && (
                        <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Boni/mali cumulé ({synthese.nbEvaluees} mission
                                {synthese.nbEvaluees > 1 ? "s" : ""} évaluée
                                {synthese.nbEvaluees > 1 ? "s" : ""})
                            </p>
                            <div className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        "text-xl sm:text-2xl lg:text-3xl font-black",
                                        synthese.boniMaliTotal >= 0 ? "text-emerald-400" : "text-rose-400"
                                    )}
                                >
                                    {synthese.boniMaliTotal >= 0 ? "+" : ""}
                                    {fcfa(synthese.boniMaliTotal)} F
                                </span>
                                <ArrowUpRight
                                    className={cn(
                                        "w-6 h-6",
                                        synthese.boniMaliTotal >= 0 ? "text-emerald-500" : "text-rose-500 rotate-90"
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {erreur && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {erreur}
                </div>
            )}

            {!chargement && !erreur && sansCoutHoraire > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <span className="font-bold">
                        {sansCoutHoraire} collaborateur{sansCoutHoraire > 1 ? "s" : ""} sans coût horaire
                        interne paramétré.
                    </span>{" "}
                    Le boni/mali des missions qu&apos;il{sansCoutHoraire > 1 ? "s" : ""} ont servies reste
                    indéterminé tant que ce paramétrage n&apos;est pas renseigné sur leur fiche.
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard
                    title="Missions budgétées"
                    value={String(synthese?.nbMissions ?? 0)}
                    icon={Clock}
                    color="text-indigo-400"
                />
                <KpiCard
                    title="Boni cumulé"
                    value={synthese ? `${fcfa(synthese.boniMaliTotal >= 0 ? synthese.boniMaliTotal : 0)} F` : "—"}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <KpiCard
                    title="Dossiers en mali"
                    value={String(synthese?.nbMali ?? 0)}
                    icon={AlertCircle}
                    color="text-rose-400"
                />
                <KpiCard
                    title="Non évaluables"
                    value={String(synthese?.nbIndeterminees ?? 0)}
                    icon={AlertCircle}
                    color="text-amber-400"
                />
            </div>

            {/* Table */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/60">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Performance par dossier
                        </h3>
                        <div className="flex gap-2">
                            {(["tous", "boni", "mali"] as const).map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setFiltre(tag)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filtre === tag
                                            ? "bg-indigo-600 text-white"
                                            : "bg-slate-800 text-slate-500 hover:text-white"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            placeholder="Filtrer par client ou mission…"
                            className="w-full bg-slate-950 border border-white/5 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="px-8 py-6">Client / mission</th>
                                <th className="px-6 py-6 text-center">Budget temps</th>
                                <th className="px-6 py-6 text-center">Temps passé</th>
                                <th className="px-6 py-6 text-right">Honoraires</th>
                                <th className="px-6 py-6 text-right">Rentabilité</th>
                                <th className="px-6 py-6 text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {chargement ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-500">
                                        Chargement…
                                    </td>
                                </tr>
                            ) : visibles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-10 text-center text-sm text-slate-500">
                                        Aucune mission budgétée à afficher.
                                    </td>
                                </tr>
                            ) : (
                                visibles.map((m) => (
                                    <tr
                                        key={m.missionId}
                                        className="hover:bg-indigo-600/5 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div>
                                                <span className="font-bold text-white block group-hover:text-indigo-400 transition-colors">
                                                    {m.client}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                    {m.titre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-xs font-mono font-bold text-slate-400">
                                                {m.budgetHeures} h
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span
                                                    className={cn(
                                                        "text-xs font-mono font-bold",
                                                        m.heuresPassees > m.budgetHeures
                                                            ? "text-rose-400"
                                                            : "text-emerald-400"
                                                    )}
                                                >
                                                    {m.heuresPassees} h
                                                </span>
                                                {m.budgetHeures > 0 && (
                                                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full transition-all",
                                                                m.heuresPassees > m.budgetHeures
                                                                    ? "bg-rose-500"
                                                                    : "bg-emerald-500"
                                                            )}
                                                            style={{
                                                                width: `${Math.min(100, (m.heuresPassees / m.budgetHeures) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="font-bold text-white font-mono">
                                                {fcfa(m.budgetHonoraires)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            {m.tauxBoniMali === null ? (
                                                <span className="text-xs font-bold text-slate-500 uppercase">
                                                    Indéterminé
                                                </span>
                                            ) : (
                                                <div className="flex flex-col items-end">
                                                    <span
                                                        className={cn(
                                                            "font-black text-sm",
                                                            m.tauxBoniMali >= 0 ? "text-emerald-400" : "text-rose-400"
                                                        )}
                                                    >
                                                        {m.tauxBoniMali >= 0 ? "+" : ""}
                                                        {m.tauxBoniMali.toFixed(1)}%
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                                                        {fcfa(m.boniMali ?? 0)} F
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                                                    STATUT_STYLE[m.statut]
                                                )}
                                            >
                                                {m.statut === "BONI" ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : m.statut === "MALI" ? (
                                                    <TrendingDown className="w-3 h-3" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-current" />
                                                )}
                                                {LIBELLE_STATUT[m.statut]}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function KpiCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}) {
    return (
        <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40 group hover:bg-slate-900/60 transition-all">
            <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform shadow-xl w-fit mb-6", color)}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{title}</p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1">{value}</h3>
        </div>
    );
}
