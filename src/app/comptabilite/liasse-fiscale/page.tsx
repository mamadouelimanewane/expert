"use client";

import { Suspense } from "react";
import { LoadingState } from "@/components/ui/LoadingState";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    CheckCircle2,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    Table as TableIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ControlesBanner from "@/components/etats-financiers/ControlesBanner";

// ─────────────────────────────────────────────────────────────────────────────
// Liasse fiscale (DSF SYSCOHADA).
//
// Cette page était intégralement une maquette : taux d'avancement figés
// (« 85 % », « 40 % »), « score de cohérence IA : 92 % », une anomalie inventée
// sur le compte 601 avec un écart de 1 250 000 FCFA, et un tableau de bilan aux
// montants fabriqués (total actif 235 200 000 FCFA). Le tout sur la
// fonctionnalité mise en avant comme le cœur du produit.
//
// Elle s'appuie désormais sur le moteur SYSCOHADA (src/lib/ohada) : l'état des
// tableaux, les montants et les anomalies viennent des écritures réelles. Les
// tableaux que le moteur ne produit pas encore — flux de trésorerie et notes
// annexes — sont annoncés comme non disponibles, et non présentés « en cours ».
//
// Correctif ultérieur : les trois appels API se faisaient sans clientId ni
// période, ce qui agrégeait les écritures de TOUS les clients du cabinet
// dans une seule « liasse » — inutilisable en pratique, puisque chaque
// client doit avoir sa propre DSF. Un sélecteur de client et de période a
// été ajouté ; les appels API et les liens d'impression le respectent
// désormais.
// ─────────────────────────────────────────────────────────────────────────────

type EtatTableau = "COMPLET" | "ANOMALIE" | "VIDE" | "NON_IMPLEMENTE";

type Tableau = {
    id: string;
    titre: string;
    code: string;
    etat: EtatTableau;
    detail: string;
    lignesServies: number;
};

type LigneEtat = {
    code: string;
    label: string;
    brutN: number;
    amortN: number;
    netN: number;
    netN1: number;
    isTotal?: boolean;
    isSIG?: boolean;
};

const ETAT: Record<EtatTableau, { libelle: string; classe: string }> = {
    COMPLET: {
        libelle: "Servi",
        classe: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    ANOMALIE: {
        libelle: "Anomalie",
        classe: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    VIDE: {
        libelle: "Vide",
        classe: "border-slate-400/30 bg-slate-400/10 text-slate-500 dark:text-slate-400",
    },
    NON_IMPLEMENTE: {
        libelle: "Non disponible",
        classe: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
};

const fcfa = (n: number) => Math.round(n).toLocaleString("fr-FR");

function LiasseFiscalePageContenu() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    // Pré-sélection par l'URL (?clientId=&periode=) : liens depuis l'import de
    // balance, la fiche client et la liasse.
    const params = useSearchParams();
    const [clientId, setClientId] = useState(params.get("clientId") ?? "");
    const [periode, setPeriode] = useState(params.get("periode") ?? new Date().toISOString().substring(0, 7));

    const [tableaux, setTableaux] = useState<Tableau[]>([]);
    const [selection, setSelection] = useState<string>("bilan-actif");
    const [controles, setControles] = useState<Record<string, unknown> | null>(null);
    const [anomalies, setAnomalies] = useState<string[]>([]);
    const [deposable, setDeposable] = useState(false);
    const [aucuneDonnee, setAucuneDonnee] = useState(false);
    const [source, setSource] = useState<{ ecritures: number; comptes: number } | null>(null);

    const [actif, setActif] = useState<LigneEtat[]>([]);
    const [passif, setPassif] = useState<LigneEtat[]>([]);
    const [resultat, setResultat] = useState<LigneEtat[]>([]);

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/clients?limit=200&isActive=true");
                if (!res.ok) return;
                const data = await res.json();
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            } catch (e) {
                console.error("Chargement du portefeuille :", e);
            }
        })();
    }, []);

    const charger = useCallback(async () => {
        if (!clientId) {
            setChargement(false);
            return;
        }
        setChargement(true);
        setErreur(null);
        try {
            const qs = `clientId=${clientId}&periode=${periode}`;
            const [rl, rb, rr] = await Promise.all([
                fetch(`/api/comptabilite/liasse-fiscale?${qs}`),
                fetch(`/api/comptabilite/etats-financiers/bilan?${qs}`),
                fetch(`/api/comptabilite/etats-financiers/resultat?${qs}`),
            ]);
            if (!rl.ok || !rb.ok || !rr.ok) {
                throw new Error(`Réponses ${rl.status} / ${rb.status} / ${rr.status}`);
            }

            const [dl, db, dr] = await Promise.all([rl.json(), rb.json(), rr.json()]);

            setTableaux(dl.tableaux ?? []);
            setControles(dl.controles ?? null);
            setAnomalies(dl.anomalies ?? []);
            setDeposable(Boolean(dl.deposable));
            setAucuneDonnee(Boolean(dl.aucuneDonnee));
            setSource(dl.source ?? null);

            setActif(db.actif ?? []);
            setPassif(db.passif ?? []);
            setResultat(dr.resultat ?? []);
        } catch (e) {
            console.error("Chargement de la liasse fiscale :", e);
            setErreur("Impossible de charger la liasse fiscale.");
        } finally {
            setChargement(false);
        }
    }, [clientId, periode]);

    useEffect(() => {
        charger();
    }, [charger]);

    const tableauSelectionne = tableaux.find((t) => t.id === selection) ?? null;

    const lignes: LigneEtat[] =
        selection === "bilan-actif"
            ? actif
            : selection === "bilan-passif"
              ? passif
              : selection === "compte-resultat"
                ? resultat
                : [];

    const afficheColonnesAmort = selection === "bilan-actif";

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <span className="mt-1 rounded-xl bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                        <FileSpreadsheet size={20} />
                    </span>
                    <div>
                        <h1 className="page-title">
                            Liasse fiscale SYSCOHADA
                        </h1>
                        <p className="page-subtitle">
                            États financiers du système normal, produits à partir des écritures
                            exportées.
                            {source ? ` ${source.ecritures} écriture${source.ecritures > 1 ? "s" : ""}, ${source.comptes} compte${source.comptes > 1 ? "s" : ""}.` : ""}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                        <option value="">Sélectionner un client</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <input
                        type="month"
                        value={periode}
                        onChange={(e) => setPeriode(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    />
                    {clientId && (
                        <>
                            <Link
                                href={`/etats-financiers/print/bilan?clientId=${clientId}&periode=${periode}`}
                                target="_blank"
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                            >
                                <Printer size={14} /> Bilan
                            </Link>
                            <Link
                                href={`/etats-financiers/print/resultat?clientId=${clientId}&periode=${periode}`}
                                target="_blank"
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                            >
                                <Printer size={14} /> Résultat
                            </Link>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={charger}
                        disabled={chargement || !clientId}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                        <RefreshCw size={14} className={chargement ? "animate-spin" : ""} />
                        Recalculer
                    </button>
                </div>
            </div>

            {!clientId && (
                <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Sélectionnez un client pour générer sa liasse fiscale.
                </div>
            )}

            {erreur && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    {erreur}
                </div>
            )}

            {clientId && !chargement && !erreur && aucuneDonnee && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    <strong className="font-semibold">Aucune écriture exportée.</strong> Les tableaux
                    sont vides parce que le journal ne contient rien pour ce périmètre, et non parce
                    que la liasse serait prête.
                </div>
            )}

            {clientId && !chargement && !erreur && !aucuneDonnee && (
                <div
                    className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-sm",
                        deposable
                            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                            : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                    )}
                >
                    {deposable ? (
                        <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        />
                    ) : (
                        <AlertTriangle
                            size={16}
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                        />
                    )}
                    <p className="text-slate-800 dark:text-slate-200">
                        {deposable ? (
                            <>
                                <strong className="font-semibold">
                                    Bilan et compte de résultat cohérents.
                                </strong>{" "}
                                Le tableau de flux et les notes annexes restent à établir avant dépôt.
                            </>
                        ) : (
                            <>
                                <strong className="font-semibold">Liasse non déposable en l&apos;état.</strong>{" "}
                                Traitez les points ci-dessous avant transmission.
                            </>
                        )}
                    </p>
                </div>
            )}

            {anomalies.length > 0 && (
                <ul className="space-y-2 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                    {anomalies.map((a, i) => (
                        <li key={i} className="flex gap-2">
                            <span aria-hidden="true">•</span>
                            <span>{a}</span>
                        </li>
                    ))}
                </ul>
            )}

            <ControlesBanner controles={controles as never} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                {/* État des tableaux */}
                <div className="space-y-2 lg:col-span-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Tableaux de la liasse
                    </h2>

                    {tableaux.map((t) => {
                        const etat = ETAT[t.etat];
                        const consultable = t.etat !== "NON_IMPLEMENTE";

                        return (
                            <button
                                key={t.id}
                                type="button"
                                disabled={!consultable}
                                onClick={() => setSelection(t.id)}
                                className={cn(
                                    "w-full rounded-xl border p-4 text-left transition-colors",
                                    selection === t.id && consultable
                                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950",
                                    !consultable && "cursor-not-allowed opacity-70"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {t.titre}
                                    </span>
                                    <span
                                        className={cn(
                                            "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                                            etat.classe
                                        )}
                                    >
                                        {etat.libelle}
                                    </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    {t.code}
                                    {t.lignesServies > 0 ? ` · ${t.lignesServies} lignes servies` : ""}
                                </p>
                                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                                    {t.detail}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {/* Tableau sélectionné */}
                <div className="lg:col-span-3">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
                            <TableIcon size={16} className="text-slate-400" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                {tableauSelectionne?.titre ?? "Sélectionnez un tableau"}
                            </h2>
                        </div>

                        {chargement ? (
                            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
                                Calcul en cours…
                            </p>
                        ) : lignes.length === 0 ? (
                            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
                                Aucune ligne à afficher pour ce tableau.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="apix-table w-full min-w-[640px] text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Réf</th>
                                            <th className="px-4 py-3 text-left font-medium">Libellé</th>
                                            {afficheColonnesAmort && (
                                                <>
                                                    <th className="px-4 py-3 text-right font-medium">Brut</th>
                                                    <th className="px-4 py-3 text-right font-medium">
                                                        Amort./Dépréc.
                                                    </th>
                                                </>
                                            )}
                                            <th className="px-4 py-3 text-right font-medium">Net N</th>
                                            <th className="px-4 py-3 text-right font-medium">Net N-1</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {lignes.map((l) => {
                                            const majeur = ["BZ", "DZ", "XI"].includes(l.code);
                                            return (
                                                <tr
                                                    key={l.code}
                                                    className={cn(
                                                        majeur
                                                            ? "border-t-2 border-slate-200 bg-slate-100 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                                            : l.isTotal || l.isSIG
                                                              ? "bg-slate-50/60 font-semibold text-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                                                              : "text-slate-600 dark:text-slate-300"
                                                    )}
                                                >
                                                    <td className="px-4 py-2.5 font-mono text-xs opacity-70">
                                                        {l.code}
                                                    </td>
                                                    <td className="px-4 py-2.5">{l.label}</td>
                                                    {afficheColonnesAmort && (
                                                        <>
                                                            <td className="px-4 py-2.5 text-right font-mono opacity-70">
                                                                {fcfa(l.brutN)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-mono opacity-70">
                                                                {l.amortN ? `(${fcfa(l.amortN)})` : "—"}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="px-4 py-2.5 text-right font-mono">
                                                        {fcfa(l.netN)}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-mono opacity-80">
                                                        {fcfa(l.netN1)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// useSearchParams impose une frontière Suspense au build (prérendu statique).
export default function LiasseFiscalePage() {
    return (
        <Suspense fallback={<LoadingState label="Chargement…" />}>
            <LiasseFiscalePageContenu />
        </Suspense>
    );
}
