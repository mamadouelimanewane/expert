"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, ScanLine, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Criblage LCB-FT (lutte contre le blanchiment et le financement du terrorisme).
//
// Cette page affichait des CORRESPONDANCES DE SANCTIONS FABRIQUÉES contre des
// personnes nommées : « Watchlist Sanctions ONU — Terrorism Finance, 95 % »,
// « PEP List Sahel, 100 % », « Interpol Red Notice — Financial Fraud, 88 % »,
// « OFAC SDN List — Money Laundering, 62 % ». Aucune de ces sources n'était
// interrogée : les résultats étaient inscrits dans un fichier du code.
//
// Attribuer à une personne identifiée une correspondance sur une liste de
// financement du terrorisme est une allégation grave. Produite par un logiciel
// professionnel, elle peut fonder une déclaration de soupçon, une rupture de
// relation d'affaires, ou un signalement. Elle ne peut pas être simulée.
//
// Aucun prestataire de criblage n'étant connecté, la page ne produit plus
// aucun résultat. Elle liste le portefeuille à cribler et renvoie vers les
// registres officiels, où la vérification doit être faite.
// ─────────────────────────────────────────────────────────────────────────────

type EntreeRegistre = {
    id: string;
    name: string;
    country: string;
    hasIdentifiers: boolean;
    lastUpdate: string;
    status: string;
};

/** Registres publics où le criblage doit être effectué, faute d'intégration. */
const SOURCES_OFFICIELLES = [
    {
        nom: "Sanctions du Conseil de sécurité des Nations unies",
        detail: "Liste consolidée, consultable et téléchargeable",
        url: "https://www.un.org/securitycouncil/content/un-sc-consolidated-list",
    },
    {
        nom: "OFAC — Specially Designated Nationals",
        detail: "Département du Trésor des États-Unis",
        url: "https://sanctionssearch.ofac.treas.gov/",
    },
    {
        nom: "Sanctions financières de l'Union européenne",
        detail: "Liste consolidée des gels d'avoirs",
        url: "https://www.sanctionsmap.eu/",
    },
    {
        nom: "GIABA — Groupe intergouvernemental d'action contre le blanchiment",
        detail: "Dispositif LCB-FT pour l'Afrique de l'Ouest",
        url: "https://www.giaba.org/",
    },
];

export default function FinancialCrimePage() {
    const [recherche, setRecherche] = useState("");
    const [registre, setRegistre] = useState<EntreeRegistre[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/compliance/kyc");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            setRegistre(data.registry ?? []);
        } catch (e) {
            console.error("Chargement du portefeuille à cribler :", e);
            setErreur("Impossible de charger le portefeuille clients.");
            setRegistre([]);
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

    const resultats = terme
        ? registre.filter((e) => normaliser(e.name).includes(terme))
        : registre;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-start gap-3">
                <span className="mt-1 rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                    <ShieldAlert size={20} />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Criblage LCB-FT
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Portefeuille à cribler et registres officiels de référence.
                    </p>
                </div>
            </div>

            {/* Ce que l'application ne fait pas, dit sans ambiguïté. */}
            <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm dark:border-rose-800 dark:bg-rose-950/30">
                <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400"
                    aria-hidden="true"
                />
                <div className="text-rose-900 dark:text-rose-200">
                    <p className="font-semibold">
                        Aucun criblage automatique n&apos;est effectué par cette application.
                    </p>
                    <p className="mt-1">
                        Elle n&apos;interroge aucune liste de sanctions, aucune base de personnes
                        politiquement exposées, aucun fichier de notices Interpol. Le criblage doit
                        être conduit sur les registres officiels ci-dessous, et son résultat consigné
                        au dossier permanent du client, daté et signé.
                    </p>
                </div>
            </div>

            {/* Registres officiels */}
            <section className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Où effectuer le criblage
                </h2>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {SOURCES_OFFICIELLES.map((s) => (
                        <a
                            key={s.url}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[var(--primary)] dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                    {s.nom}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {s.detail}
                                </p>
                            </div>
                            <ExternalLink size={14} className="mt-1 shrink-0 text-slate-400" />
                        </a>
                    ))}
                </div>
            </section>

            {/* Portefeuille à cribler */}
            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Portefeuille à cribler ({registre.length})
                    </h2>

                    <label className="relative w-full max-w-xs">
                        <span className="sr-only">Rechercher un client</span>
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            placeholder="Nom du client…"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-[var(--primary)] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                    </label>
                </div>

                {erreur && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                        {erreur}
                    </div>
                )}

                {chargement ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
                ) : resultats.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {terme ? "Aucun client ne correspond." : "Aucun client actif enregistré."}
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {resultats.map((e) => (
                            <li
                                key={e.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {e.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {e.country} ·{" "}
                                        {e.hasIdentifiers
                                            ? "Identifiants OHADA renseignés"
                                            : "Identifiants OHADA manquants"}
                                    </p>
                                </div>

                                <span
                                    className={cn(
                                        "shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-bold",
                                        e.status === "Validé"
                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : e.status === "Invalide"
                                              ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                              : "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
                                    )}
                                >
                                    {e.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ScanLine size={13} className="mt-0.5 shrink-0" />
                Le statut affiché est celui saisi sur la fiche client. Il ne préjuge d&apos;aucun
                résultat de criblage. Voir aussi{" "}
                <Link href="/compliance/id-verify" className="underline hover:text-[var(--primary)]">
                    l&apos;identification KYC
                </Link>
                .
            </p>
        </div>
    );
}
