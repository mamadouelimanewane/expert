"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    BarChart3,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Planning et charge de travail.
//
// La page affichait quatre collaborateurs et cinq missions inventés sur une
// grille de quatorze jours figée en « Février 2024 », avec une capacité
// d'équipe à 85 %, 640 heures planifiées et une alerte de surcharge nominative
// — le tout sans rapport avec les affectations enregistrées.
//
// Elle lit désormais /api/planning, qui renvoie les allocations réelles
// (ResourceAllocation) semaine par semaine, les collaborateurs actifs et les
// tâches non soldées. La grille suit la semaine du lundi au dimanche, comme
// l'API, et les indicateurs sont calculés sur les heures effectivement
// allouées.
// ─────────────────────────────────────────────────────────────────────────────

type Utilisateur = { id: string; firstName: string; lastName: string; role: string };

type Allocation = {
    id: string;
    dayOfWeek: number;
    durationHours: number;
    capacityHours: number;
    user: Utilisateur;
    task: { id: string; title: string; status: string } | null;
    mission: {
        id: string;
        title: string;
        client: { companyName: string | null; firstName: string | null; lastName: string | null } | null;
    } | null;
};

type Tache = {
    id: string;
    title: string;
    dueDate: string | null;
    estimatedHours?: number | null;
    mission: { id: string; title: string } | null;
};

const JOURS = [
    { index: 1, court: "Lun" },
    { index: 2, court: "Mar" },
    { index: 3, court: "Mer" },
    { index: 4, court: "Jeu" },
    { index: 5, court: "Ven" },
    { index: 6, court: "Sam" },
    { index: 0, court: "Dim" },
];

/** Couleur stable par collaborateur, dérivée de son identifiant. */
const PALETTE = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-cyan-500",
];

function couleurDe(id: string): string {
    let somme = 0;
    for (const c of id) somme += c.charCodeAt(0);
    return PALETTE[somme % PALETTE.length];
}

const initiales = (u: Utilisateur) =>
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";

const nomClient = (m: Allocation["mission"]) =>
    m?.client?.companyName ||
    [m?.client?.firstName, m?.client?.lastName].filter(Boolean).join(" ") ||
    null;

export default function ResourcePlanningPage() {
    const [semaine, setSemaine] = useState<Date>(() => new Date());
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
    const [taches, setTaches] = useState<Tache[]>([]);
    const [debutSemaine, setDebutSemaine] = useState<string>("");
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async (date: Date) => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch(`/api/planning?weekStart=${date.toISOString()}`);
            if (!res.ok) throw new Error(`Réponse ${res.status}`);

            const data = await res.json();
            setAllocations(data.allocations ?? []);
            setUtilisateurs(data.users ?? []);
            setTaches(data.tasks ?? []);
            setDebutSemaine(data.weekStart ?? "");
        } catch (e) {
            console.error("Chargement du planning :", e);
            setErreur("Impossible de charger le planning.");
            setAllocations([]);
            setUtilisateurs([]);
            setTaches([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger(semaine);
    }, [charger, semaine]);

    const decalerSemaine = (semaines: number) => {
        setSemaine((d) => {
            const suivant = new Date(d);
            suivant.setDate(suivant.getDate() + semaines * 7);
            return suivant;
        });
    };

    // ── Indicateurs calculés sur les allocations réelles ────────────────────
    const indicateurs = useMemo(() => {
        const heuresAllouees = allocations.reduce((s, a) => s + a.durationHours, 0);

        // Capacité : celle déclarée sur les allocations existantes, complétée
        // par 8 h par jour ouvré pour les collaborateurs sans affectation.
        const capaciteParUtilisateur = new Map<string, number>();
        for (const a of allocations) {
            capaciteParUtilisateur.set(
                a.user.id,
                (capaciteParUtilisateur.get(a.user.id) ?? 0) + a.capacityHours
            );
        }
        const capaciteTotale = utilisateurs.reduce(
            (s, u) => s + (capaciteParUtilisateur.get(u.id) ?? 40),
            0
        );

        const chargeParUtilisateur = new Map<string, { allouees: number; capacite: number }>();
        for (const a of allocations) {
            const courant = chargeParUtilisateur.get(a.user.id) ?? { allouees: 0, capacite: 0 };
            courant.allouees += a.durationHours;
            courant.capacite += a.capacityHours;
            chargeParUtilisateur.set(a.user.id, courant);
        }

        const surcharges = utilisateurs
            .map((u) => {
                const c = chargeParUtilisateur.get(u.id);
                if (!c || c.capacite === 0) return null;
                const taux = (c.allouees / c.capacite) * 100;
                return taux > 100 ? { utilisateur: u, taux, ...c } : null;
            })
            .filter((x): x is NonNullable<typeof x> => x !== null)
            .sort((a, b) => b.taux - a.taux);

        return {
            heuresAllouees,
            capaciteTotale,
            tauxOccupation: capaciteTotale > 0 ? (heuresAllouees / capaciteTotale) * 100 : 0,
            surcharges,
        };
    }, [allocations, utilisateurs]);

    const tachesNonAffectees = useMemo(() => {
        const affectees = new Set(allocations.map((a) => a.task?.id).filter(Boolean));
        return taches.filter((t) => !affectees.has(t.id)).slice(0, 5);
    }, [allocations, taches]);

    const libelleSemaine = debutSemaine
        ? (() => {
              const debut = new Date(debutSemaine);
              const fin = new Date(debut);
              fin.setDate(fin.getDate() + 6);
              const fmt = (d: Date) =>
                  d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
              return `${fmt(debut)} – ${fmt(fin)} ${fin.getFullYear()}`;
          })()
        : "…";

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="page-title flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30">
                            <CalendarIcon className="w-8 h-8 text-white" />
                        </div>
                        Planning &amp; charge de travail
                    </h2>
                    <p className="page-subtitle max-w-2xl">
                        Affectations enregistrées pour la semaine, et disponibilité des collaborateurs.
                    </p>
                </div>

                <div className="flex bg-slate-800 rounded-2xl p-1 border border-white/5">
                    <button
                        type="button"
                        onClick={() => decalerSemaine(-1)}
                        aria-label="Semaine précédente"
                        className="p-2 text-slate-500 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-xs font-black text-white uppercase tracking-widest flex items-center">
                        {libelleSemaine}
                    </span>
                    <button
                        type="button"
                        onClick={() => decalerSemaine(1)}
                        aria-label="Semaine suivante"
                        className="p-2 text-slate-500 hover:text-white"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {erreur && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {erreur}
                </div>
            )}

            {!chargement && !erreur && allocations.length === 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <span className="font-bold">Aucune affectation cette semaine.</span> La grille est
                    vide parce que rien n&apos;a été planifié, et non parce que l&apos;équipe serait
                    disponible.
                </div>
            )}

            {/* Indicateurs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox
                    icon={Users}
                    label="Taux d'occupation"
                    value={`${Math.round(indicateurs.tauxOccupation)}%`}
                    color="text-indigo-400"
                />
                <StatBox
                    icon={Clock}
                    label="Heures planifiées"
                    value={`${Math.round(indicateurs.heuresAllouees)} h`}
                    color="text-amber-400"
                />
                <StatBox
                    icon={BarChart3}
                    label="Capacité de l'équipe"
                    value={`${Math.round(indicateurs.capaciteTotale)} h`}
                    color="text-emerald-400"
                />
            </div>

            {/* Grille */}
            <div className="glass-card rounded-[40px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-slate-900/40">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest">
                        Collaborateurs ({utilisateurs.length})
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse apix-table">
                        <thead>
                            <tr className="bg-slate-900/60">
                                <th className="sticky left-0 z-20 bg-slate-900 p-6 text-left border-r border-white/5 min-w-[250px]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Nom / rôle
                                    </span>
                                </th>
                                {JOURS.map((j) => (
                                    <th
                                        key={j.index}
                                        className="p-4 border-r border-white/5 min-w-[110px] text-center"
                                    >
                                        <p
                                            className={cn(
                                                "text-[10px] font-black uppercase",
                                                j.index === 0 || j.index === 6
                                                    ? "text-rose-500"
                                                    : "text-slate-500"
                                            )}
                                        >
                                            {j.court}
                                        </p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {chargement ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-sm text-slate-500">
                                        Chargement du planning…
                                    </td>
                                </tr>
                            ) : utilisateurs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-sm text-slate-500">
                                        Aucun collaborateur actif.
                                    </td>
                                </tr>
                            ) : (
                                utilisateurs.map((u) => {
                                    const couleur = couleurDe(u.id);
                                    return (
                                        <tr
                                            key={u.id}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="sticky left-0 z-20 bg-slate-900/80 backdrop-blur-md p-6 border-r border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg",
                                                            couleur
                                                        )}
                                                    >
                                                        {initiales(u)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white">
                                                            {u.firstName} {u.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                                                            {u.role}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {JOURS.map((j) => {
                                                const duJour = allocations.filter(
                                                    (a) => a.user.id === u.id && a.dayOfWeek === j.index
                                                );
                                                const heures = duJour.reduce(
                                                    (s, a) => s + a.durationHours,
                                                    0
                                                );
                                                const capacite = duJour.reduce(
                                                    (s, a) => s + a.capacityHours,
                                                    0
                                                );
                                                const surcharge = capacite > 0 && heures > capacite;

                                                return (
                                                    <td
                                                        key={j.index}
                                                        className="p-1 border-r border-white/5 relative h-20 align-top"
                                                    >
                                                        {duJour.length > 0 && (
                                                            <div
                                                                className={cn(
                                                                    "absolute inset-1 rounded-lg p-2 flex flex-col justify-between overflow-hidden border",
                                                                    surcharge
                                                                        ? "bg-rose-500/20 border-rose-500/40"
                                                                        : `${couleur} bg-opacity-20 border-current`
                                                                )}
                                                                title={duJour
                                                                    .map(
                                                                        (a) =>
                                                                            `${a.mission?.title ?? a.task?.title ?? "Affectation"}${nomClient(a.mission) ? ` — ${nomClient(a.mission)}` : ""} (${a.durationHours} h)`
                                                                    )
                                                                    .join("\n")}
                                                            >
                                                                <p className="text-[8px] font-black uppercase text-white truncate">
                                                                    {duJour[0].mission?.title ??
                                                                        duJour[0].task?.title ??
                                                                        "Affectation"}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-white/80 tabular-nums">
                                                                    {heures} h
                                                                    {capacite > 0 ? ` / ${capacite}` : ""}
                                                                    {duJour.length > 1
                                                                        ? ` · ${duJour.length}`
                                                                        : ""}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {(j.index === 0 || j.index === 6) && (
                                                            <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alertes et tâches non affectées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="apix-card">
                    <h3 className="text-white font-black text-lg mb-6 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                        Alertes de surcharge
                    </h3>

                    {indicateurs.surcharges.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            Aucun collaborateur au-delà de sa capacité cette semaine.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {indicateurs.surcharges.map((s) => (
                                <div
                                    key={s.utilisateur.id}
                                    className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-white font-black",
                                                couleurDe(s.utilisateur.id)
                                            )}
                                        >
                                            {initiales(s.utilisateur)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">
                                                {s.utilisateur.firstName} {s.utilisateur.lastName}
                                            </p>
                                            <p className="text-[10px] text-amber-500 uppercase font-black">
                                                {Math.round(s.taux)} % de charge · {s.allouees} h pour{" "}
                                                {s.capacite} h
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="apix-card">
                    <h3 className="text-white font-black text-lg mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        Tâches non affectées
                    </h3>

                    {tachesNonAffectees.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            Toutes les tâches ouvertes sont affectées cette semaine.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {tachesNonAffectees.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-white">{t.title}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">
                                            {t.mission?.title ?? "Sans mission"}
                                            {t.dueDate
                                                ? ` · échéance ${new Date(t.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatBox({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="apix-card flex items-center gap-6">
            <div className="p-4 bg-white/5 rounded-2xl">
                <Icon className={cn("w-6 h-6", color)} />
            </div>
            <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {label}
                </p>
                <h4 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{value}</h4>
            </div>
        </div>
    );
}
