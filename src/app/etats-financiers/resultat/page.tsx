"use client";

import React from 'react';
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

import { useState, useEffect } from 'react';

export default function ResultatPage() {
    const [resultatData, setResultatData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResultat = async () => {
            try {
                const res = await fetch('/api/comptabilite/etats-financiers/resultat');
                const data = await res.json();
                if (data.resultat) {
                    setResultatData(data.resultat);
                }
            } catch (error) {
                console.error("Failed to fetch Resultat:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResultat();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compte de Résultat</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Formation du résultat net (H.T.)
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        <Printer size={16} /> Imprimer
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
                        <Download size={16} /> Exporter Excel
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <table className="w-full text-sm">
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
                            if (row.isHeader) {
                                return (
                                    <tr key={idx} className="bg-slate-50/50 dark:bg-slate-900/30">
                                        <td className="px-6 py-3 font-mono text-xs opacity-50">{row.code}</td>
                                        <td colSpan={4} className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200">{row.label}</td>
                                    </tr>
                                )
                            }

                            const variation = (row.netN || 0) - (row.netN1 || 0);
                            const isPositive = variation >= 0;

                            return (
                                <tr
                                    key={idx}
                                    className={clsx(
                                        "transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                                        row.isTotal ? "bg-indigo-50/30 font-bold dark:bg-indigo-900/10" : "text-slate-600 dark:text-slate-300",
                                        row.level === 2 ? "border-t-2 border-slate-200 bg-indigo-50 text-base dark:border-slate-700 dark:bg-indigo-900/20" : ""
                                    )}
                                >
                                    <td className="px-6 py-3 font-mono text-xs opacity-70">{row.code}</td>
                                    <td className="px-6 py-3">
                                        {row.label}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-slate-900 dark:text-white">
                                        {row.level === 2 ?
                                            <span className="text-indigo-600 dark:text-indigo-400">{(row.netN || 0).toLocaleString('fr-FR')}</span> :
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
                </table>
            </div>
        </div>
    );
}



