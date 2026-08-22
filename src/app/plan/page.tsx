"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Search, X } from "lucide-react";
import { SECTIONS_NAVIGATION, TOUS_LES_ECRANS } from "@/lib/navigation/routes";

/**
 * Plan de l'application.
 *
 * La barre latérale expose une sélection d'écrans ; les autres n'étaient
 * accessibles qu'en saisissant leur URL à la main. Cette page inventorie la
 * totalité des écrans, par section, avec une recherche.
 *
 * L'inventaire est engendré depuis l'arborescence (`npm run routes:generate`)
 * et vérifié par un test : aucun écran ne peut être ajouté sans y figurer.
 */
export default function PlanPage() {
    const [recherche, setRecherche] = useState("");

    const sections = useMemo(() => {
        const normaliser = (texte: string) =>
            texte
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "");

        const terme = normaliser(recherche.trim());
        if (!terme) return SECTIONS_NAVIGATION;

        const correspond = (texte: string) => normaliser(texte).includes(terme);

        return SECTIONS_NAVIGATION.map((section) => ({
            ...section,
            pages: correspond(section.nom)
                ? section.pages
                : section.pages.filter((p) => correspond(p.label) || correspond(p.href)),
        })).filter((section) => section.pages.length > 0);
    }, [recherche]);

    const nbResultats = sections.reduce((total, s) => total + s.pages.length, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="mt-1 rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                        <LayoutGrid size={20} />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Plan de l&apos;application
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {TOUS_LES_ECRANS.length} écrans répartis en {SECTIONS_NAVIGATION.length}{" "}
                            sections. La barre latérale n&apos;en présente qu&apos;une sélection.
                        </p>
                    </div>
                </div>

                <label className="relative w-full max-w-sm">
                    <span className="sr-only">Rechercher un écran</span>
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="search"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        placeholder="Rechercher : bilan, paie, TVA, audit…"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--primary)] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    {recherche && (
                        <button
                            type="button"
                            onClick={() => setRecherche("")}
                            aria-label="Effacer la recherche"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                </label>
            </div>

            {recherche && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {nbResultats === 0
                        ? "Aucun écran ne correspond."
                        : `${nbResultats} écran${nbResultats > 1 ? "s" : ""} trouvé${nbResultats > 1 ? "s" : ""}.`}
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sections.map((section) => (
                    <section
                        key={section.nom}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                        <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                            {section.nom}
                            <span className="ml-2 font-normal normal-case tracking-normal text-slate-400">
                                {section.pages.length}
                            </span>
                        </h2>

                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                            {section.pages.map((page) => (
                                <li key={page.href}>
                                    <Link
                                        href={page.href}
                                        className="flex flex-col gap-0.5 px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                    >
                                        <span className="text-sm text-slate-800 dark:text-slate-200">
                                            {page.label}
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-400">
                                            {page.href}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
