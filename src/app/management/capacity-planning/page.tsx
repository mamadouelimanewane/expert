"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Plan de charge de l'équipe.
//
// Quatre collaborateurs fictifs avec une charge en pourcentage inventée, une
// expertise et un « prochain créneau libre » fabriqués, et un message
// d'action nommant des dossiers qui n'existent pas (« Dossier SARL X »). Le
// taux de charge global (88 %) et le taux facturable (76 %) n'avaient aucune
// source.
//
// Alimentée par /api/planning — la même source que /missions/planning — en
// agrégeant les allocations de la semaine par collaborateur. Le taux
// facturable a été retiré : `TimeEntry` ne porte pas de champ facturable dans
// le schéma actuel, l'inventer aurait reproduit l'erreur corrigée ailleurs.
// ─────────────────────────────────────────────────────────────────────────────

type Utilisateur = { id: string; firstName: string; lastName: string; role: string };

type Allocation = {
    id: string;
    durationHours: number;
    capacityHours: number;
    user: Utilisateur;
    mission: { id: string; title: string } | null;
    task: { id: string; title: string } | null;
};

const initiales = (u: Utilisateur) =>
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";

export default function CapacityPlanningPage() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/planning");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            setAllocations(data.allocations ?? []);
            setUtilisateurs(data.users ?? []);
        } catch (e) {
            console.error("Chargement du plan de charge :", e);
            setErreur("Impossible de charger le plan de charge.");
            setAllocations([]);
            setUtilisateurs([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const parCollaborateur = useMemo(() => {
        return utilisateurs
            .map((u) => {
                const siennes = allocations.filter((a) => a.user.id === u.id);
                const heures = siennes.reduce((s, a) => s + a.durationHours, 0);
                const capacite = siennes.reduce((s, a) => s + a.capacityHours, 0) || 40;
                const charge = capacite > 0 ? Math.round((heures / capacite) * 100) : 0;

                const dossiers = new Set(
                    siennes.map((a) => a.mission?.title ?? a.task?.title).filter(Boolean)
                );

                return { utilisateur: u, heures, capacite, charge, nbDossiers: dossiers.size, dossiers: [...dossiers] };
            })
            .sort((a, b) => b.charge - a.charge);
    }, [allocations, utilisateurs]);

    const planifies = parCollaborateur.filter((c) => c.heures > 0);
    const surcharges = parCollaborateur.filter((c) => c.charge > 100);

    const heuresAllouees = allocations.reduce((s, a) => s + a.durationHours, 0);
    const capaciteTotale = utilisateurs.reduce((s, u) => {
        const siennes = allocations.filter((a) => a.user.id === u.id);
        return s + (siennes.reduce((s2, a) => s2 + a.capacityHours, 0) || 40);
    }, 0);
    const chargeGlobale = capaciteTotale > 0 ? Math.round((heuresAllouees / capaciteTotale) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border border-indigo-500/20">
                        <Users className="w-3 h-3" /> Planification RH
                    </div>
                    <h1 className="page-title">
                        Plan de charge de l&apos;équipe
                    </h1>
                    <p className="page-subtitle max-w-2xl">
                        Charge de la semaine en cours, calculée sur les affectations enregistrées.
                    </p>
                </div>
            </div>

            {erreur && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {erreur}
                </div>
            )}

            {!chargement && !erreur && allocations.length === 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <span className="font-bold">Aucune affectation cette semaine.</span> Le plan de
                    charge est vide parce que rien n&apos;a été planifié.
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CapacityKpi
                    title="Taux de charge global"
                    value={`${chargeGlobale}%`}
                    status={chargeGlobale > 100 ? "danger" : chargeGlobale > 85 ? "warning" : "success"}
                    subtitle="Sur la semaine en cours"
                />
                <CapacityKpi
                    title="Heures disponibles"
                    value={`${Math.max(0, Math.round(capaciteTotale - heuresAllouees))} h`}
                    status="success"
                    subtitle="Capacité restante sur la semaine"
                />
                <CapacityKpi
                    title="Collaborateurs surchargés"
                    value={String(surcharges.length)}
                    status={surcharges.length > 0 ? "danger" : "success"}
                    subtitle={`Sur ${planifies.length} collaborateur${planifies.length > 1 ? "s" : ""} planifié${planifies.length > 1 ? "s" : ""}`}
                />
            </div>

            {/* Répartition */}
            <div className="apix-card space-y-6">
                <h3 className="font-bold text-white text-xl flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Répartition par collaborateur
                </h3>

                {chargement ? (
                    <p className="text-sm text-slate-500">Chargement…</p>
                ) : parCollaborateur.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucun collaborateur actif.</p>
                ) : (
                    <div className="space-y-6">
                        {parCollaborateur.map((c) => (
                            <div key={c.utilisateur.id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-slate-400 text-xs">
                                            {initiales(c.utilisateur)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">
                                                {c.utilisateur.firstName} {c.utilisateur.lastName}
                                            </h4>
                                            <p className="text-xs text-slate-500">{c.utilisateur.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <span
                                            className={cn(
                                                "text-lg font-black",
                                                c.charge > 110
                                                    ? "text-rose-500"
                                                    : c.charge > 90
                                                      ? "text-amber-500"
                                                      : c.charge < 50
                                                        ? "text-slate-500"
                                                        : "text-emerald-500"
                                            )}
                                        >
                                            {c.charge}%
                                        </span>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Charge</p>
                                    </div>
                                </div>

                                <div className="relative h-8 bg-muted rounded-lg overflow-hidden flex border border-border">
                                    <div
                                        className={cn(
                                            "h-full flex items-center px-3 text-[10px] font-bold text-white/80 transition-all duration-1000",
                                            c.charge > 100
                                                ? "bg-rose-600"
                                                : c.charge > 85
                                                  ? "bg-amber-600"
                                                  : c.charge < 50
                                                    ? "bg-slate-700"
                                                    : "bg-emerald-600"
                                        )}
                                        style={{ width: `${Math.min(c.charge, 100)}%` }}
                                    >
                                        {c.nbDossiers > 0
                                            ? `${c.nbDossiers} dossier${c.nbDossiers > 1 ? "s" : ""} actif${c.nbDossiers > 1 ? "s" : ""}`
                                            : ""}
                                    </div>

                                    {c.charge > 100 && (
                                        <div className="h-full bg-rose-500/20 w-full flex items-center justify-center text-rose-500 text-[10px] font-black uppercase tracking-widest">
                                            Surcharge (+{c.charge - 100}%)
                                        </div>
                                    )}
                                </div>

                                {c.charge > 100 && c.dossiers.length > 0 && (
                                    <div className="mt-2 text-xs flex items-start gap-2 text-rose-400">
                                        <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                        <span>Dossiers concernés : {c.dossiers.join(", ")}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CapacityKpi({
    title,
    value,
    status,
    subtitle,
}: {
    title: string;
    value: string;
    status: "warning" | "danger" | "success" | "neutral";
    subtitle: string;
}) {
    return (
        <div className="apix-card">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{title}</p>
            <h3
                className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-black mb-1",
                    status === "warning"
                        ? "text-amber-400"
                        : status === "danger"
                          ? "text-rose-400"
                          : status === "success"
                            ? "text-emerald-400"
                            : "text-white"
                )}
            >
                {value}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>
    );
}
