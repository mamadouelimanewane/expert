"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Mail, Phone, Search, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Annuaire du cabinet.
//
// Cette page présentait auparavant un « annuaire officiel de plus de 50 experts
// certifiés OHADA » et revendiquait « 5 000+ clients actifs » — quatre profils
// inventés et des chiffres sans aucune source dans le système. Des affirmations
// de cette nature n'ont pas leur place dans un outil professionnel.
//
// Elle liste désormais les collaborateurs réels du cabinet (modèle User), avec
// ce qui sert à les joindre et leur charge de missions.
// ─────────────────────────────────────────────────────────────────────────────

type Membre = {
    id: string;
    nom: string;
    initiales: string;
    email: string;
    telephone: string | null;
    role: string;
    roleLibelle: string;
    missionsAssignees: number;
    missionsCreees: number;
};

type RepartitionRole = { role: string; libelle: string; nombre: number };

const COULEUR_ROLE: Record<string, string> = {
    ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    EXPERT: "bg-primary/10 text-primary border-primary/20",
    COLLABORATOR: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ASSISTANT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function AnnuairePage() {
    const [recherche, setRecherche] = useState("");
    const [roleFiltre, setRoleFiltre] = useState("TOUS");
    const [membres, setMembres] = useState<Membre[]>([]);
    const [parRole, setParRole] = useState<RepartitionRole[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async (terme: string, role: string) => {
        setChargement(true);
        setErreur(null);
        try {
            const params = new URLSearchParams();
            if (terme.trim()) params.set("recherche", terme.trim());
            if (role !== "TOUS") params.set("role", role);

            const res = await fetch(`/api/annuaire?${params.toString()}`);
            if (!res.ok) throw new Error(`Réponse ${res.status}`);

            const data = await res.json();
            setMembres(data.membres ?? []);
            setParRole(data.parRole ?? []);
        } catch (e) {
            console.error("Chargement de l'annuaire :", e);
            setErreur("Impossible de charger l'annuaire du cabinet.");
            setMembres([]);
            setParRole([]);
        } finally {
            setChargement(false);
        }
    }, []);

    // Recherche différée, pour ne pas interroger l'API à chaque frappe.
    useEffect(() => {
        const timer = setTimeout(() => charger(recherche, roleFiltre), 300);
        return () => clearTimeout(timer);
    }, [charger, recherche, roleFiltre]);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="mt-1 rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                        <Users2 size={20} />
                    </span>
                    <div>
                        <h1 className="page-title">
                            Annuaire du cabinet
                        </h1>
                        <p className="page-subtitle">
                            Collaborateurs actifs, leurs coordonnées et leur charge de missions.
                        </p>
                    </div>
                </div>

                <label className="relative w-full max-w-sm">
                    <span className="sr-only">Rechercher un collaborateur</span>
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="search"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Nom, prénom ou adresse email…"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--primary)] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                </label>
            </div>

            <div className="flex flex-wrap gap-2">
                {[{ role: "TOUS", libelle: "Tous", nombre: membres.length }, ...parRole].map((r) => (
                    <button
                        key={r.role}
                        type="button"
                        onClick={() => setRoleFiltre(r.role)}
                        className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                            roleFiltre === r.role
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                        )}
                    >
                        {r.libelle}
                        {r.role !== "TOUS" && (
                            <span className="ml-1.5 opacity-60">{r.nombre}</span>
                        )}
                    </button>
                ))}
            </div>

            {erreur && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    {erreur}
                </div>
            )}

            {chargement ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
            ) : membres.length === 0 && !erreur ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-slate-600 dark:text-slate-300">
                        {recherche || roleFiltre !== "TOUS"
                            ? "Aucun collaborateur ne correspond à cette recherche."
                            : "Aucun collaborateur actif n'est enregistré."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {membres.map((m) => (
                        <article
                            key={m.id}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="flex items-start gap-4">
                                <span
                                    aria-hidden="true"
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]"
                                >
                                    {m.initiales}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate font-semibold text-slate-900 dark:text-white">
                                        {m.nom}
                                    </h2>
                                    <span
                                        className={cn(
                                            "mt-1 inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                            COULEUR_ROLE[m.role] ??
                                                "border-slate-300 bg-slate-100 text-slate-600"
                                        )}
                                    >
                                        {m.roleLibelle}
                                    </span>
                                </div>
                            </div>

                            <dl className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <dt className="sr-only">Adresse email</dt>
                                    <Mail size={14} className="shrink-0 text-slate-400" />
                                    <dd className="min-w-0">
                                        <a
                                            href={`mailto:${m.email}`}
                                            className="truncate hover:text-[var(--primary)] hover:underline"
                                        >
                                            {m.email}
                                        </a>
                                    </dd>
                                </div>

                                {m.telephone && (
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <dt className="sr-only">Téléphone</dt>
                                        <Phone size={14} className="shrink-0 text-slate-400" />
                                        <dd>
                                            <a
                                                href={`tel:${m.telephone.replace(/\s/g, "")}`}
                                                className="hover:text-[var(--primary)] hover:underline"
                                            >
                                                {m.telephone}
                                            </a>
                                        </dd>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <dt className="sr-only">Missions</dt>
                                    <Briefcase size={14} className="shrink-0 text-slate-400" />
                                    <dd>
                                        {m.missionsAssignees} mission
                                        {m.missionsAssignees > 1 ? "s" : ""} assignée
                                        {m.missionsAssignees > 1 ? "s" : ""}
                                    </dd>
                                </div>
                            </dl>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
