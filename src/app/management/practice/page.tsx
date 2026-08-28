"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    LayoutDashboard,
    Target,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Pilotage du cabinet.
//
// Cette page affichait quatre indicateurs figés (CA « 45M FCFA », marge
// « 32% », taux de charge « 85% »), quatre dossiers fictifs dans le tableau de
// rentabilité, une charge d'équipe par rôle générique inventée (95/80/45/60 %)
// et une alerte de surcharge nommant une mission « Inventaire Stock » qui
// n'existe pas.
//
// Elle combine désormais /api/dashboard/executive (chiffre d'affaires,
// recouvrement, missions actives, alertes réelles, charge par collaborateur)
// et /api/missions/boni-mali (rentabilité par mission, déjà détaillée dans
// /missions/boni-mali).
// ─────────────────────────────────────────────────────────────────────────────

type Executive = {
    kpis: {
        recouvrement: number;
        caMois: number;
        croissance: number;
        missionsActives: number;
        alertes: number;
    };
    alertes: { id: string; text: string; type: string }[];
    collaborateurs: { id: string; name: string; hours: number; ca: number }[];
};

type MissionBoniMali = {
    missionId: string;
    titre: string;
    client: string;
    budgetHonoraires: number;
    tauxBoniMali: number | null;
    statut: "BONI" | "MALI" | "EQUILIBRE" | "INDETERMINE";
};

type SyntheseBoniMali = {
    budgetHonorairesTotal: number;
    boniMaliTotal: number;
    nbEvaluees: number;
};

const fcfa = (n: number) => Math.round(n).toLocaleString("fr-FR");

export default function PracticeManagementPage() {
    const [executive, setExecutive] = useState<Executive | null>(null);
    const [missions, setMissions] = useState<MissionBoniMali[]>([]);
    const [synthese, setSynthese] = useState<SyntheseBoniMali | null>(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const [rExec, rBoni] = await Promise.all([
                fetch("/api/dashboard/executive"),
                fetch("/api/missions/boni-mali"),
            ]);
            if (!rExec.ok || !rBoni.ok) throw new Error(`Réponses ${rExec.status} / ${rBoni.status}`);

            const [dExec, dBoni] = await Promise.all([rExec.json(), rBoni.json()]);
            setExecutive(dExec);
            setMissions((dBoni.missions ?? []).slice(0, 6));
            setSynthese(dBoni.synthese ?? null);
        } catch (e) {
            console.error("Chargement du pilotage cabinet :", e);
            setErreur("Impossible de charger les indicateurs du cabinet.");
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    // Marge moyenne pondérée par les honoraires, calculée sur les missions
    // dont le boni/mali a pu être établi — pas une moyenne des taux unitaires.
    const margeMoyenne =
        synthese && synthese.budgetHonorairesTotal > 0
            ? Math.round((synthese.boniMaliTotal / synthese.budgetHonorairesTotal) * 1000) / 10
            : null;

    const premiereAlerte = executive?.alertes[0] ?? null;
    const equipeParCharge = [...(executive?.collaborateurs ?? [])].sort((a, b) => b.hours - a.hours);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                    <LayoutDashboard className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="page-title">
                        Pilotage du cabinet
                    </h2>
                    <p className="page-subtitle">
                        Chiffre d&apos;affaires, rentabilité et charge de l&apos;équipe.
                    </p>
                </div>
            </div>

            {erreur && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {erreur}
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    label="Chiffre d'affaires du mois"
                    value={executive ? `${(executive.kpis.caMois / 1_000_000).toFixed(1)}M FCFA` : "—"}
                    trend={executive ? `${executive.kpis.croissance >= 0 ? "+" : ""}${executive.kpis.croissance}%` : null}
                    trendUp={(executive?.kpis.croissance ?? 0) >= 0}
                    color="text-indigo-400"
                />
                <MetricCard
                    label="Marge moyenne pondérée"
                    value={margeMoyenne !== null ? `${margeMoyenne >= 0 ? "+" : ""}${margeMoyenne}%` : "Indéterminée"}
                    color="text-amber-400"
                />
                <MetricCard
                    label="Taux de recouvrement"
                    value={executive ? `${executive.kpis.recouvrement}%` : "—"}
                    color="text-emerald-400"
                />
                <MetricCard
                    label="Missions actives"
                    value={executive ? String(executive.kpis.missionsActives) : "—"}
                    color="text-sky-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rentabilité par mission */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 bg-slate-900/40">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            <Target className="w-5 h-5 text-indigo-400" />
                            Rentabilité par mission (boni/mali)
                        </h3>
                        <a
                            href="/missions/boni-mali"
                            className="text-xs font-bold text-indigo-400 hover:text-white transition-colors"
                        >
                            Voir tout
                        </a>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="pb-4 pl-4">Client / mission</th>
                                    <th className="pb-4">Honoraires</th>
                                    <th className="pb-4">Rentabilité</th>
                                    <th className="pb-4 pr-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {chargement ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                                            Chargement…
                                        </td>
                                    </tr>
                                ) : missions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                                            Aucune mission budgétée.
                                        </td>
                                    </tr>
                                ) : (
                                    missions.map((m) => (
                                        <tr key={m.missionId} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 pl-4">
                                                <div className="font-bold text-white">{m.client}</div>
                                                <div className="text-xs text-slate-500">{m.titre}</div>
                                            </td>
                                            <td className="py-4 font-mono font-bold text-slate-300">
                                                {fcfa(m.budgetHonoraires)}
                                            </td>
                                            <td className="py-4">
                                                {m.tauxBoniMali === null ? (
                                                    <span className="text-xs font-bold text-slate-500 uppercase">
                                                        Indéterminée
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={cn(
                                                            "text-xs font-bold",
                                                            m.tauxBoniMali >= 0 ? "text-emerald-400" : "text-rose-400"
                                                        )}
                                                    >
                                                        {m.tauxBoniMali >= 0 ? "+" : ""}
                                                        {m.tauxBoniMali.toFixed(1)}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 pr-4">
                                                <span
                                                    className={cn(
                                                        "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest",
                                                        m.statut === "BONI"
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : m.statut === "MALI"
                                                              ? "bg-rose-500/10 text-rose-400"
                                                              : "bg-slate-800 text-slate-400"
                                                    )}
                                                >
                                                    {m.statut}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charge d'équipe */}
                <div className="glass-card p-8 rounded-[40px] border border-white/5 bg-slate-950/40">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Users className="w-5 h-5 text-sky-400" />
                        Charge de l&apos;équipe
                    </h3>

                    {equipeParCharge.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucun collaborateur avec des missions assignées.</p>
                    ) : (
                        <div className="space-y-5">
                            {equipeParCharge.slice(0, 6).map((c) => {
                                const maxHeures = Math.max(...equipeParCharge.map((x) => x.hours), 1);
                                return (
                                    <div key={c.id} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-300">{c.name}</span>
                                            <span className="text-white">{Math.round(c.hours)} h</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-sky-500 rounded-full"
                                                style={{ width: `${Math.round((c.hours / maxHeures) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {premiereAlerte && (
                        <div className="mt-8 p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-sky-400 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-white mb-1">
                                    {executive?.kpis.alertes} alerte{(executive?.kpis.alertes ?? 0) > 1 ? "s" : ""}{" "}
                                    en cours
                                </p>
                                <p className="text-[10px] text-sky-200 leading-relaxed">{premiereAlerte.text}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    trend,
    trendUp,
    color,
}: {
    label: string;
    value: string;
    trend?: string | null;
    trendUp?: boolean;
    color: string;
}) {
    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
            <div className="flex justify-between items-end">
                <h3 className={cn("text-2xl font-black", color)}>{value}</h3>
                {trend && (
                    <div
                        className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                            trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        )}
                    >
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}
