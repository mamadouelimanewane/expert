"use client";

import React from 'react';
import { FileSpreadsheet, Download, Printer } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useState, useEffect } from 'react';

export default function BilanPage() {
    const [actifData, setActifData] = useState<any[]>([]);
    const [passifData, setPassifData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBilan = async () => {
            try {
                const res = await fetch('/api/comptabilite/etats-financiers/bilan');
                const data = await res.json();
                if (data.actif && data.passif) {
                    setActifData(data.actif);
                    setPassifData(data.passif);
                }
            } catch (error) {
                console.error("Failed to fetch Bilan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBilan();
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
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bilan (SYSCOHADA)</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Comparatif Net N vs Net N-1 généré depuis la base de données
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
                <BilanTable title="ACTIF" data={actifData} headerColor="bg-emerald-600" />
                <BilanTable title="PASSIF" data={passifData} headerColor="bg-amber-600" />
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
                                    {(row.netN || 0).toLocaleString('fr-FR')}
                                </td>
                                <td className="px-4 py-3 text-right font-mono opacity-80">
                                    {(row.netN1 || 0).toLocaleString('fr-FR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
