"use client";

import React from 'react';
import { Download, Printer } from 'lucide-react';
import { clsx } from 'clsx';

import { useCallback, useEffect, useState } from 'react';
import ControlesBanner from '@/components/etats-financiers/ControlesBanner';

// ─────────────────────────────────────────────────────────────────────────────
// Cette page appelait l'API bilan sans clientId ni période : sans filtre,
// /api/comptabilite/etats-financiers/bilan agrège les écritures de TOUS les
// clients et de TOUTES les périodes — un bilan mélangeant plusieurs
// entreprises n'a aucun sens. Un sélecteur client + période a été ajouté,
// sur le même modèle que /comptabilite/liasse-fiscale ; rien n'est chargé
// tant qu'un client n'est pas sélectionné.
// ─────────────────────────────────────────────────────────────────────────────

export default function BilanPage() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [clientId, setClientId] = useState("");
    const [periode, setPeriode] = useState(new Date().toISOString().substring(0, 7));

    const [actifData, setActifData] = useState<any[]>([]);
    const [passifData, setPassifData] = useState<any[]>([]);
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

    const fetchBilan = useCallback(async () => {
        if (!clientId) {
            setActifData([]);
            setPassifData([]);
            setControles(null);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/comptabilite/etats-financiers/bilan?clientId=${clientId}&periode=${periode}`);
            const data = await res.json();
            setActifData(data.actif ?? []);
            setPassifData(data.passif ?? []);
            setControles(data.controles ?? null);
        } catch (error) {
            console.error("Failed to fetch Bilan:", error);
        } finally {
            setLoading(false);
        }
    }, [clientId, periode]);

    useEffect(() => { fetchBilan(); }, [fetchBilan]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Bilan (SYSCOHADA)</h2>
                    <p className="page-subtitle">
                        Comparatif Net N vs Net N-1 généré depuis la base de données
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
                        href={clientId ? `/etats-financiers/print/bilan?clientId=${clientId}&periode=${periode}` : undefined}
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
                    Sélectionnez un client pour afficher son bilan.
                </div>
            ) : loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    <ControlesBanner controles={controles} />
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <BilanTable title="ACTIF" data={actifData} headerColor="bg-emerald-600" showAmort />
                        <BilanTable title="PASSIF" data={passifData} headerColor="bg-amber-600" />
                    </div>
                </>
            )}
        </div>
    );
}

/** Codes des totaux généraux, mis en évidence en bas de chaque colonne. */
const TOTAUX_GENERAUX = new Set(['BZ', 'DZ']);

function BilanTable({ title, data, headerColor, showAmort }: { title: string, data: any[], headerColor: string, showAmort?: boolean }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className={`px-6 py-3 ${headerColor} text-white`}>
                <h3 className="font-bold tracking-wide">{title}</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Réf</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Libellé</th>
                            {showAmort && (
                                <>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Brut</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Amort./Dépréc.</th>
                                </>
                            )}
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Net N</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Net N-1</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row, idx) => {
                            const totalGeneral = TOTAUX_GENERAUX.has(row.code);
                            return (
                                <tr
                                    key={row.code ?? idx}
                                    className={clsx(
                                        "transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                                        totalGeneral
                                            ? "border-t-2 border-slate-200 bg-slate-100 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                            : row.isTotal
                                                ? "bg-slate-50/50 font-semibold text-slate-800 dark:bg-slate-900/30 dark:text-slate-200"
                                                : "text-slate-600 dark:text-slate-300"
                                    )}
                                >
                                    <td className="px-4 py-3 font-mono text-xs opacity-70">{row.code}</td>
                                    <td className="px-4 py-3">{row.label}</td>
                                    {showAmort && (
                                        <>
                                            <td className="px-4 py-3 text-right font-mono opacity-70">
                                                {(row.brutN || 0).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono opacity-70">
                                                {row.amortN ? `(${row.amortN.toLocaleString('fr-FR')})` : '—'}
                                            </td>
                                        </>
                                    )}
                                    <td className="px-4 py-3 text-right font-mono">
                                        {(row.netN || 0).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono opacity-80">
                                        {(row.netN1 || 0).toLocaleString('fr-FR')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
