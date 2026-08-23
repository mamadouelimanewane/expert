"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Cog,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Parc immobilisé et plan d'amortissement.
//
// Cette page présentait un parc de machines inventé — « Extrudeuse Plastique
// #A1 », état de santé 98 %, taux d'utilisation 85 %, historique de maintenance
// avec noms de techniciens — et des valeurs nettes comptables inscrites en dur
// (45 M, 12 M, 120 M FCFA). Les indicateurs annonçaient « 845 M FCFA de VNC »
// et « 12,5 GWh de consommation ».
//
// L'état de santé d'une machine, son taux d'utilisation et son historique de
// maintenance relèvent de la GMAO de l'industriel. Un cabinet comptable ne les
// détient pas, et il n'y a aucune raison qu'il les détienne un jour.
//
// Ce que le cabinet suit réellement, et ce que la page affiche désormais : la
// valeur d'origine, la méthode et la durée d'amortissement, la dotation de
// l'exercice et la valeur nette comptable — le travail comptable sur les
// immobilisations. Les immobilisations dépourvues de plan d'amortissement sont
// signalées : leur VNC n'est pas établie.
// ─────────────────────────────────────────────────────────────────────────────

type Immobilisation = {
    id: string;
    code: string;
    label: string;
    category: string;
    location: string | null;
    serialNumber: string | null;
    supplier: string | null;
    status: string;
    purchaseDate: string;
    serviceDate: string;
    valeurOrigine: number;
    methode: string;
    dureeAnnees: number | null;
    valeurResiduelle: number;
    cumulAmortissements: number;
    dotationExercice: number;
    valeurNetteComptable: number;
    planEtabli: boolean;
    anomalies: string[];
    client: { id: string; nom: string } | null;
};

type Synthese = {
    nombre: number;
    valeurOrigineTotale: number;
    cumulAmortissements: number;
    dotationExercice: number;
    valeurNetteComptable: number;
    sansPlanAmortissement: number;
    aVerifier: number;
    manquantes: number;
};

const LIBELLE_STATUT: Record<string, { texte: string; classe: string }> = {
    FOUND: { texte: "Présente", classe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    TO_VERIFY: { texte: "À vérifier", classe: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    MISSING: { texte: "Manquante", classe: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    DISPOSED: { texte: "Cédée", classe: "bg-slate-700 text-slate-400 border-white/10" },
};

const LIBELLE_METHODE: Record<string, string> = {
    LINEAIRE: "Linéaire",
    DEGRESSIF: "Dégressif",
    NON_AMORTISSABLE: "Non amortissable",
};

const fcfa = (n: number) => Math.round(n).toLocaleString("fr-FR");

export default function MachineryPage() {
    const [parc, setParc] = useState<Immobilisation[]>([]);
    const [synthese, setSynthese] = useState<Synthese | null>(null);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [recherche, setRecherche] = useState("");
    const [selection, setSelection] = useState<string | null>(null);

    const charger = useCallback(async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await fetch("/api/industries/machinery");
            if (!res.ok) throw new Error(`Réponse ${res.status}`);
            const data = await res.json();
            const liste: Immobilisation[] = data.parc ?? [];
            setParc(liste);
            setSynthese(data.synthese ?? null);
            setAucuneDonnee(Boolean(data.aucuneDonnee));
            setSelection((prev) => (liste.some((x) => x.id === prev) ? prev : (liste[0]?.id ?? null)));
        } catch (e) {
            console.error("Chargement du parc immobilisé :", e);
            setErreur("Impossible de charger le parc immobilisé.");
            setParc([]);
            setSynthese(null);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        charger();
    }, [charger]);

    const resultats = useMemo(() => {
        const terme = recherche.trim().toLowerCase();
        if (!terme) return parc;
        return parc.filter((a) =>
            `${a.label} ${a.code} ${a.category} ${a.location ?? ""} ${a.serialNumber ?? ""}`
                .toLowerCase()
                .includes(terme)
        );
    }, [parc, recherche]);

    const active = parc.find((a) => a.id === selection) ?? null;

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-6 border-b border-white/5">
                <div>
                    <Link
                        href="/industries/manufacturing"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4 hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Retour industrie
                    </Link>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <Cog className="w-10 h-10 text-amber-500" />
                        Parc immobilisé
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-lg">
                        Valeur d&apos;origine, plan d&apos;amortissement, dotation de
                        l&apos;exercice et valeur nette comptable.
                    </p>
                </div>
            </div>

            {erreur && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                    {erreur}
                </div>
            )}

            {!chargement && !erreur && aucuneDonnee && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <span className="font-bold">Aucune immobilisation enregistrée.</span> Le parc est
                    vide parce que rien n&apos;a été saisi, et non parce que le client
                    n&apos;immobiliserait aucun bien.
                </div>
            )}

            {synthese && synthese.sansPlanAmortissement > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>
                        <span className="font-bold">
                            {synthese.sansPlanAmortissement} immobilisation
                            {synthese.sansPlanAmortissement > 1 ? "s" : ""} sans plan
                            d&apos;amortissement.
                        </span>{" "}
                        Faute de durée d&apos;utilité renseignée, leur valeur nette comptable ne peut
                        pas être calculée : elles figurent ici pour leur valeur d&apos;origine.
                    </p>
                </div>
            )}

            {/* Indicateurs, tous calculés sur le parc réel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Valeur nette comptable"
                    value={`${fcfa(synthese?.valeurNetteComptable ?? 0)} FCFA`}
                    icon={BarChart3}
                    color="text-emerald-400"
                />
                <MetricCard
                    title="Valeur d'origine"
                    value={`${fcfa(synthese?.valeurOrigineTotale ?? 0)} FCFA`}
                    icon={BarChart3}
                    color="text-sky-400"
                />
                <MetricCard
                    title="Dotation de l'exercice"
                    value={`${fcfa(synthese?.dotationExercice ?? 0)} FCFA`}
                    icon={BarChart3}
                    color="text-violet-400"
                />
                <MetricCard
                    title="À vérifier en inventaire"
                    value={String(synthese?.aVerifier ?? 0)}
                    icon={AlertTriangle}
                    color="text-amber-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="search"
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                                placeholder="Rechercher (libellé, code, catégorie, localisation, n° de série)…"
                                className="w-full bg-transparent border-none text-sm text-white pl-10 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {chargement ? (
                            <p className="text-sm text-slate-500">Chargement du parc…</p>
                        ) : resultats.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                {recherche
                                    ? "Aucune immobilisation ne correspond."
                                    : "Aucune immobilisation à afficher."}
                            </p>
                        ) : (
                            resultats.map((a) => {
                                const statut = LIBELLE_STATUT[a.status] ?? LIBELLE_STATUT.TO_VERIFY;
                                return (
                                    <div
                                        key={a.id}
                                        onClick={() => setSelection(a.id)}
                                        className={cn(
                                            "glass-card p-6 rounded-2xl border transition-all cursor-pointer hover:bg-slate-900/60 flex flex-col md:flex-row gap-6 items-start md:items-center",
                                            selection === a.id
                                                ? "bg-slate-800/60 border-amber-500/50"
                                                : "bg-slate-900/20 border-white/5"
                                        )}
                                    >
                                        <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border bg-slate-800/60 border-white/5">
                                            <Cog className="w-8 h-8 text-slate-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white truncate">
                                                    {a.label}
                                                </h3>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                                                    {a.code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-2">
                                                {a.category}
                                                {a.location ? ` • ${a.location}` : ""}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500">
                                                <span>
                                                    VNC :{" "}
                                                    <span
                                                        className={
                                                            a.planEtabli ? "text-white" : "text-amber-400"
                                                        }
                                                    >
                                                        {a.planEtabli ? `${fcfa(a.valeurNetteComptable)} F` : "non établie"}
                                                    </span>
                                                </span>
                                                <span>
                                                    Origine :{" "}
                                                    <span className="text-white">
                                                        {fcfa(a.valeurOrigine)} F
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={cn(
                                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase border",
                                                    statut.classe
                                                )}
                                            >
                                                {statut.texte}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                {LIBELLE_METHODE[a.methode] ?? a.methode}
                                                {a.dureeAnnees ? ` · ${a.dureeAnnees} ans` : ""}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Détail comptable */}
                <div className="glass-card rounded-[32px] border border-white/5 bg-slate-950/40 p-8 h-fit sticky top-8">
                    {active ? (
                        <div className="space-y-8">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Fiche d&apos;immobilisation
                                </p>
                                <h2 className="text-2xl font-black text-white leading-tight mb-1">
                                    {active.label}
                                </h2>
                                <p className="text-sm text-amber-500 font-mono">
                                    {active.serialNumber
                                        ? `N° de série ${active.serialNumber}`
                                        : "Numéro de série non renseigné"}
                                </p>
                            </div>

                            <dl className="space-y-3 rounded-2xl border border-white/5 bg-slate-900 p-4 text-sm">
                                {[
                                    ["Valeur d'origine", `${fcfa(active.valeurOrigine)} FCFA`],
                                    ["Méthode", LIBELLE_METHODE[active.methode] ?? active.methode],
                                    [
                                        "Durée d'utilité",
                                        active.dureeAnnees ? `${active.dureeAnnees} ans` : "Non renseignée",
                                    ],
                                    ["Valeur résiduelle", `${fcfa(active.valeurResiduelle)} FCFA`],
                                    [
                                        "Mise en service",
                                        new Date(active.serviceDate).toLocaleDateString("fr-FR"),
                                    ],
                                    [
                                        "Cumul amortissements",
                                        active.planEtabli
                                            ? `${fcfa(active.cumulAmortissements)} FCFA`
                                            : "Non établi",
                                    ],
                                    [
                                        "Dotation de l'exercice",
                                        active.planEtabli
                                            ? `${fcfa(active.dotationExercice)} FCFA`
                                            : "Non établie",
                                    ],
                                ].map(([libelle, valeur]) => (
                                    <div key={libelle} className="flex justify-between gap-3">
                                        <dt className="text-slate-400">{libelle}</dt>
                                        <dd className="text-right font-medium text-white">{valeur}</dd>
                                    </div>
                                ))}
                            </dl>

                            <div className="rounded-2xl border border-white/5 bg-slate-900 p-4">
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                                    Valeur nette comptable
                                </p>
                                <p
                                    className={cn(
                                        "text-3xl font-black tabular-nums",
                                        active.planEtabli ? "text-white" : "text-amber-400"
                                    )}
                                >
                                    {active.planEtabli
                                        ? `${fcfa(active.valeurNetteComptable)} F`
                                        : "Non établie"}
                                </p>
                            </div>

                            {active.anomalies.length > 0 && (
                                <ul className="space-y-1 rounded-2xl bg-amber-500/10 p-4 text-xs text-amber-300">
                                    {active.anomalies.map((a, i) => (
                                        <li key={i}>{a}</li>
                                    ))}
                                </ul>
                            )}

                            {/* L'historique de maintenance n'est pas suivi ici : c'est une
                                donnée de GMAO, hors du périmètre d'un cabinet comptable. */}
                            <p className="text-[11px] leading-relaxed text-slate-500">
                                L&apos;historique de maintenance et le taux d&apos;utilisation ne sont
                                pas suivis par l&apos;application : ces informations relèvent de la
                                gestion de production du client.
                            </p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                            <Cog className="w-24 h-24 text-slate-700 mb-4" />
                            <p className="text-slate-500 font-bold">
                                Sélectionnez une immobilisation pour afficher sa fiche comptable.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({
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
        <div className="glass-card p-6 rounded-2xl border border-white/5 bg-slate-900/40">
            <Icon className={cn("w-5 h-5 mb-4", color)} />
            <p className="text-xl font-black text-white tabular-nums">{value}</p>
            <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        </div>
    );
}
