"use client";

import React from 'react';
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

const COMPTE_RESULTAT = [
    { code: "TE", label: "PRODUITS D'EXPLOITATION", isHeader: true },
    { code: "TA", label: "Ventes de marchandises", netN: 150000000, netN1: 140000000 },
    { code: "TB", label: "Ventes de produits fabriqués", netN: 0, netN1: 0 },
    { code: "TC", label: "Travaux, services vendus", netN: 25000000, netN1: 20000000 },

    { code: "RE", label: "CHARGES D'EXPLOITATION", isHeader: true },
    { code: "RA", label: "Achats de marchandises", netN: -80000000, netN1: -75000000 },
    { code: "RB", label: "Variation de stocks", netN: 2000000, netN1: 1500000 },
    { code: "RC", label: "Transports", netN: -5000000, netN1: -4500000 },
    { code: "RD", label: "Services extérieurs", netN: -12000000, netN1: -10000000 },
    { code: "RE", label: "Impôts et taxe", netN: -1500000, netN1: -1200000 },
    { code: "RF", label: "Charges de personnel", netN: -35000000, netN1: -30000000 },

    { code: "XA", label: "VALEUR AJOUTEE (V.A.)", netN: 43500000, netN1: 40800000, isTotal: true },

    { code: "XF", label: "EXCEDENT BRUT D'EXPLOITATION (EBE)", netN: 43500000, netN1: 40800000, isTotal: true }, // Simplified

    { code: "RP", label: "RESULTAT D'EXPLOITATION", netN: 38000000, netN1: 35000000, isTotal: true },

    { code: "RF", label: "RESULTAT FINANCIER", netN: -2500000, netN1: -3000000, isTotal: true },

    { code: "RH", label: "RESULTAT HORS ACTIVITE ORDINAIRE", netN: 0, netN1: 500000, isTotal: true },

    { code: "RI", label: "Impôts sur le Résultat", netN: -11000000, netN1: -10000000 },

    { code: "RN", label: "RESULTAT NET", netN: 24500000, netN1: 22500000, isTotal: true, level: 2 },
];

export default function ResultatPage() {
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
                        {COMPTE_RESULTAT.map((row, idx) => {
                            const variation = row.netN - row.netN1;
                            const isPositive = variation >= 0;

                            if (row.isHeader) {
                                return (
                                    <tr key={idx} className="bg-slate-50/50 dark:bg-slate-900/30">
                                        <td className="px-6 py-3 font-mono text-xs opacity-50">{row.code}</td>
                                        <td colSpan={4} className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200">{row.label}</td>
                                    </tr>
                                )
                            }

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
                                            <span className="text-indigo-600 dark:text-indigo-400">{row.netN.toLocaleString('fr-FR')}</span> :
                                            row.netN.toLocaleString('fr-FR')
                                        }
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono opacity-80">
                                        {row.netN1.toLocaleString('fr-FR')}
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
