"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, Library, Scale, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque OHADA.
//
// La page affichait un catalogue figé dans le code et deux compteurs inventés
// (« 12 450 articles », « 320 modèles ») sans aucune source dans le système,
// ainsi qu'une liste de « mises à jour récentes » elle aussi fabriquée.
//
// Elle lit désormais les deux bases réellement persistées :
//   • LegalCitation — textes, jurisprudence CCJA, règlements, avec leur statut
//     de validité (en vigueur, modifié, abrogé) ;
//   • LegalClause — clauses types rattachées à un Acte uniforme.
//
// Les compteurs sont ceux des collections. Le statut d'abrogation est mis en
// avant : citer un article abrogé dans un acte engage la responsabilité du
// cabinet.
// ─────────────────────────────────────────────────────────────────────────────

type Citation = {
    id: string;
    reference: string;
    type: string;
    title: string;
    status: string;
    lastUpdate: string;
    source: string | null;
    notes: string | null;
};

type Clause = {
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
    acteUniforme: string | null;
    usageCount: number;
};

const LIBELLE_TYPE: Record<string, string> = {
    ACTE_UNIFORME: "Acte uniforme",
    CCJA: "Jurisprudence CCJA",
    TRAITE: "Traité",
    REGLEMENT: "Règlement",
};

const STATUT: Record<string, { libelle: string; classe: string }> = {
    VALID: {
        libelle: "En vigueur",
        classe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    MODIFIED: {
        libelle: "Modifié",
        classe: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    ABROGATED: {
        libelle: "Abrogé",
        classe: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    PENDING: {
        libelle: "En attente",
        classe: "border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-300",
    },
};

export default function LibraryPage() {
    const [recherche, setRecherche] = useState("");
    const [onglet, setOnglet] = useState<"citations" | "clauses">("citations");
    const [typeFiltre, setTypeFiltre] = useState("TOUS");

    const [citations, setCitations] = useState<Citation[]>([]);
    const [clauses, setClauses] = useState<Clause[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const [rc, rl] = await Promise.all([
                fetch("/api/library/citations"),
                fetch("/api/library/clauses"),
            ]);
            if (!rc.ok || !rl.ok) throw new Error(`Réponses ${rc.status} / ${rl.status}`);

            const [dc, dl] = await Promise.all([rc.json(), rl.json()]);
            setCitations(dc.citations ?? []);
            setClauses(dl.clauses ?? []);
        } catch (e) {
            console.error("Chargement de la bibliothèque :", e);
            setErreur("Impossible de charger la bibliothèque OHADA.");
            setCitations([]);
            setClauses([]);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const normaliser = (t: string) =>
        t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

    const terme = normaliser(recherche.trim());

    const citationsFiltrees = useMemo(
        () =>
            citations.filter((c) => {
                const typeOk = typeFiltre === "TOUS" || c.type === typeFiltre;
                if (!typeOk) return false;
                if (!terme) return true;
                return [c.reference, c.title, c.source ?? "", c.notes ?? ""].some((v) =>
                    normaliser(v).includes(terme)
                );
            }),
        [citations, typeFiltre, terme]
    );

    const clausesFiltrees = useMemo(
        () =>
            clauses.filter((c) => {
                if (!terme) return true;
                return [c.title, c.category, c.subcategory ?? "", c.acteUniforme ?? ""].some((v) =>
                    normaliser(v).includes(terme)
                );
            }),
        [clauses, terme]
    );

    const abroges = citations.filter((c) => c.status === "ABROGATED").length;
    const modifies = citations.filter((c) => c.status === "MODIFIED").length;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-start gap-3">
                <span className="mt-1 rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                    <Library size={20} />
                </span>
                <div>
                    <h1 className="page-title">
                        Bibliothèque OHADA
                    </h1>
                    <p className="page-subtitle">
                        Textes, jurisprudence et clauses types du cabinet, avec leur statut de validité.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: "Références", valeur: citations.length, icone: Scale },
                    { label: "Clauses types", valeur: clauses.length, icone: FileText },
                    { label: "Textes modifiés", valeur: modifies, icone: AlertTriangle },
                    { label: "Textes abrogés", valeur: abroges, icone: AlertTriangle },
                ].map((k) => (
                    <div
                        key={k.label}
                        className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                        <k.icone size={16} className="mb-3 text-slate-400" />
                        <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                            {k.valeur}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {k.label}
                        </p>
                    </div>
                ))}
            </div>

            {abroges > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm dark:border-rose-800 dark:bg-rose-950/30">
                    <AlertTriangle
                        size={16}
                        className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400"
                    />
                    <p className="text-rose-900 dark:text-rose-200">
                        <strong className="font-semibold">
                            {abroges} référence{abroges > 1 ? "s" : ""} abrogée{abroges > 1 ? "s" : ""}
                        </strong>{" "}
                        dans la base. Vérifiez qu&apos;aucun acte en cours de rédaction ne s&apos;y
                        appuie.
                    </p>
                </div>
            )}

            <label className="relative block max-w-xl">
                <span className="sr-only">Rechercher dans la bibliothèque</span>
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="search"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder="Référence, intitulé, Acte uniforme…"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--primary)] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
            </label>

            <div className="flex flex-wrap gap-2">
                {(
                    [
                        { cle: "citations", libelle: `Références (${citationsFiltrees.length})` },
                        { cle: "clauses", libelle: `Clauses types (${clausesFiltrees.length})` },
                    ] as const
                ).map((t) => (
                    <button
                        key={t.cle}
                        type="button"
                        onClick={() => setOnglet(t.cle)}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                            onglet === t.cle
                                ? "bg-[var(--primary)] text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                        )}
                    >
                        {t.libelle}
                    </button>
                ))}
            </div>

            {onglet === "citations" && (
                <div className="flex flex-wrap gap-2">
                    {["TOUS", "ACTE_UNIFORME", "CCJA", "TRAITE", "REGLEMENT"].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTypeFiltre(t)}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                typeFiltre === t
                                    ? "border-[var(--primary)] text-[var(--primary)]"
                                    : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
                            )}
                        >
                            {t === "TOUS" ? "Tous les types" : LIBELLE_TYPE[t]}
                        </button>
                    ))}
                </div>
            )}

            {erreur && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    {erreur}
                </div>
            )}

            {chargement ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
            ) : onglet === "citations" ? (
                citationsFiltrees.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucune référence ne correspond.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {citationsFiltrees.map((c) => {
                            const statut = STATUT[c.status] ?? STATUT.PENDING;
                            return (
                                <li
                                    key={c.id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <span className="font-mono text-xs font-bold text-[var(--primary)]">
                                            {c.reference}
                                        </span>
                                        <span
                                            className={cn(
                                                "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                                                statut.classe
                                            )}
                                        >
                                            {statut.libelle}
                                        </span>
                                    </div>

                                    <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">
                                        {c.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {LIBELLE_TYPE[c.type] ?? c.type}
                                        {c.source ? ` · ${c.source}` : ""}
                                    </p>

                                    {c.notes && (
                                        <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                            {c.notes}
                                        </p>
                                    )}

                                    <p className="mt-2 text-[11px] text-slate-400">
                                        Mise à jour :{" "}
                                        {new Date(c.lastUpdate).toLocaleDateString("fr-FR", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )
            ) : clausesFiltrees.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucune clause ne correspond.
                </p>
            ) : (
                <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {clausesFiltrees.map((c) => (
                        <li
                            key={c.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {c.category}
                                {c.subcategory ? ` · ${c.subcategory}` : ""}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px]">
                                {c.acteUniforme && (
                                    <span className="rounded-md bg-[var(--primary)]/10 px-2 py-0.5 font-mono font-bold text-[var(--primary)]">
                                        {c.acteUniforme}
                                    </span>
                                )}
                                <span className="text-slate-400">
                                    Utilisée {c.usageCount} fois
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
