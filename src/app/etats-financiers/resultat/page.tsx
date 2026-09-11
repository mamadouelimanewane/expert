"use client";

import { Suspense } from "react";
import { LoadingState } from "@/components/ui/LoadingState";

import { useSearchParams } from "next/navigation";

import React from 'react';
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

import { useCallback, useEffect, useState } from 'react';
import ControlesBanner from '@/components/etats-financiers/ControlesBanner';

// ─────────────────────────────────────────────────────────────────────────────
// Même correctif que /etats-financiers/bilan : cette page appelait l'API
// résultat sans clientId ni période, agrégeant tous les clients et toutes
// les périodes dans un seul compte de résultat sans signification.
// ─────────────────────────────────────────────────────────────────────────────

function ResultatPageContenu() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    // Pré-sélection par l'URL (?clientId=&periode=) : liens depuis l'import de
    // balance, la fiche client et la liasse.
    const params = useSearchParams();
    const [clientId, setClientId] = useState(params.get("clientId") ?? "");
    const [periode, setPeriode] = useState(params.get("periode") ?? new Date().toISOString().substring(0, 7));

    const [resultatData, setResultatData] = useState<any[]>([]);
    const [controles, setControles] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/clients?limit=200&isActive=true')
            .then((res) => res.json())
            .then((data) => {
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            })
            .catch((error) => console.error("Chargement du portefeuille :", error));
    }, []);

    const fetchResultat = useCallback(async () => {
        if (!clientId) {
            setResultatData([]);
            setControles(null);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/comptabilite/etats-financiers/resultat?clientId=${clientId}&periode=${periode}`);
            const data = await res.json();
            setResultatData(data.resultat ?? []);
            setControles(data.controles ?? null);
        } catch (error) {
            console.error("Failed to fetch Resultat:", error);
        } finally {
            setLoading(false);
        }
    }, [clientId, periode]);

    useEffect(() => { fetchResultat(); }, [fetchResultat]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Compte de Résultat</h2>
                    <p className="page-subtitle">
                        Formation du résultat net (H.T.)
                    </p>
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
                    <a
                        href={clientId ? `/etats-financiers/print/resultat?clientId=${clientId}&periode=${periode}` : undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!clientId}
                        className={clsx(
                            "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
                            clientId ? "hover:bg-slate-50" : "pointer-events-none opacity-50"
                        )}
                    >
                        <Printer size={16} /> Imprimer
                    </a>
                    <button disabled title="Non implémenté" className="flex items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500">
                        <Download size={16} /> Exporter Excel
                    </button>
                </div>
            </div>

            {!clientId ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
                    Sélectionnez un client pour afficher son compte de résultat.
                </div>
            ) : loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            ) : (
            <>
            <ControlesBanner controles={controles} />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="overflow-x-auto">
                <table className="apix-table w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">Réf</th>
                            <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">Libellé</th>
                            <th className="px-6 py-4 text-right font-medium text-slate-500 dark:text-slate-400">Exercice N</th>
                            <th className="px-6 py-4 text-right font-medium text-slate-500 dark:text-slate-400">Exercice N-1</th>
                            <th className="px-6 py-4 text-right font-medium text-slate-500 dark:text-slate-400">Variation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {resultatData.map((row, idx) => {
                            const variation = (row.netN || 0) - (row.netN1 || 0);
                            const isPositive = variation >= 0;
                            // XI = résultat net de l'exercice, seul total de niveau supérieur.
                            const resultatNet = row.code === 'XI';

                            return (
                                <tr
                                    key={row.code ?? idx}
                                    className={clsx(
                                        "transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                                        row.isSIG ? "bg-primary/30 font-bold dark:bg-primary/10" : "text-slate-600 dark:text-slate-300",
                                        resultatNet ? "border-t-2 border-slate-200 bg-primary text-base dark:border-slate-700 dark:bg-primary/20" : ""
                                    )}
                                >
                                    <td className="px-6 py-3 font-mono text-xs opacity-70">{row.code}</td>
                                    <td className="px-6 py-3">
                                        {row.label}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-slate-900 dark:text-white">
                                        {resultatNet ?
                                            <span className="text-primary dark:text-primary">{(row.netN || 0).toLocaleString('fr-FR')}</span> :
                                            (row.netN || 0).toLocaleString('fr-FR')
                                        }
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono opacity-80">
                                        {(row.netN1 || 0).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className={`flex items-center justify-end gap-1 font-mono text-xs ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {((variation / Math.abs(row.netN1 || 1)) * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table></div>
            </div>
            </>
            )}
        </div>
    );
}

// useSearchParams impose une frontière Suspense au build (prérendu statique).
export default function ResultatPage() {
    return (
        <Suspense fallback={<LoadingState label="Chargement…" />}>
            <ResultatPageContenu />
        </Suspense>
    );
}
