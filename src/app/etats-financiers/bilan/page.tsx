"use client";

import React from 'react';
import { FileSpreadsheet, Download, Printer } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Mock Data for visualization
const BILAN_ACTIF = [
    { code: "AD", label: "Immobilisations Incorporelles", netN: 12500000, netN1: 15000000, isTotal: false },
    { code: "AE", label: "Immobilisations Corporelles", netN: 45000000, netN1: 38000000, isTotal: false },
    { code: "AF", label: "Immobilisations Financières", netN: 2000000, netN1: 2000000, isTotal: false },
    { code: "AX", label: "TOTAL ACTIF IMMOBILISÉ", netN: 59500000, netN1: 55000000, isTotal: true, level: 1 },

    { code: "BA", label: "Stocks et en-cours", netN: 28000000, netN1: 25000000, isTotal: false },
    { code: "BB", label: "Clients et comptes rattachés", netN: 35000000, netN1: 32000000, isTotal: false },
    { code: "BG", label: "Autres créances", netN: 5000000, netN1: 4500000, isTotal: false },
    { code: "BX", label: "TOTAL ACTIF CIRCULANT", netN: 68000000, netN1: 61500000, isTotal: true, level: 1 },

    { code: "BQ", label: "Trésorerie-Actif", netN: 12000000, netN1: 8500000, isTotal: false },
    { code: "BZ", label: "TOTAL GÉNÉRAL ACTIF", netN: 139500000, netN1: 125000000, isTotal: true, level: 2 },
];

const BILAN_PASSIF = [
    { code: "CA", label: "Capital", netN: 10000000, netN1: 10000000, isTotal: false },
    { code: "CD", label: "Report à Nouveau", netN: 15000000, netN1: 12000000, isTotal: false },
    { code: "CF", label: "Résultat net de l'exercice", netN: 24500000, netN1: 3000000, isTotal: false },
    { code: "CP", label: "TOTAL CAPITAUX PROPRES", netN: 49500000, netN1: 25000000, isTotal: true, level: 1 },

    { code: "DA", label: "Emprunts et dettes fin.", netN: 40000000, netN1: 50000000, isTotal: false },
    { code: "DF", label: "TOTAL DETTES FINANCIERES", netN: 40000000, netN1: 50000000, isTotal: true, level: 1 },

    { code: "DB", label: "Fournisseurs", netN: 35000000, netN1: 42000000, isTotal: false },
    { code: "DC", label: "Dettes fiscales et sociales", netN: 15000000, netN1: 8000000, isTotal: false },
    { code: "DP", label: "TOTAL PASSIF CIRCULANT", netN: 50000000, netN1: 50000000, isTotal: true, level: 1 },

    { code: "DZ", label: "TOTAL GÉNÉRAL PASSIF", netN: 139500000, netN1: 125000000, isTotal: true, level: 2 },
];

export default function BilanPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bilan (SYSCOHADA)</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Comparatif Net N vs Net N-1
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <BilanTable title="ACTIF" data={BILAN_ACTIF} headerColor="bg-emerald-600" />
                <BilanTable title="PASSIF" data={BILAN_PASSIF} headerColor="bg-amber-600" />
            </div>
        </div>
    );
}

function BilanTable({ title, data, headerColor }: { title: string, data: any[], headerColor: string }) {
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
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Net N</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Net N-1</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row, idx) => (
                            <tr
                                key={idx}
                                className={clsx(
                                    "transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50",
                                    row.isTotal && row.level === 2 ? "bg-slate-100 font-bold text-slate-900 dark:bg-slate-900 dark:text-white" : "",
                                    row.isTotal && row.level === 1 ? "bg-slate-50/50 font-semibold text-slate-800 dark:bg-slate-900/30 dark:text-slate-200" : "text-slate-600 dark:text-slate-300"
                                )}
                            >
                                <td className="px-4 py-3 font-mono text-xs opacity-70">{row.code}</td>
                                <td className="px-4 py-3">{row.label}</td>
                                <td className="px-4 py-3 text-right font-mono">
                                    {row.netN.toLocaleString('fr-FR')}
                                </td>
                                <td className="px-4 py-3 text-right font-mono opacity-80">
                                    {row.netN1.toLocaleString('fr-FR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
