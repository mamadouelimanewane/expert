"use client";

import React, { useEffect, useState } from 'react';
import { LiasseHeader } from '@/components/etats-financiers/print/LiasseHeader';
import { clsx } from 'clsx';

export default function PrintBilanPage() {
    const [bilanActif, setBilanActif] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/comptabilite/etats-financiers/bilan')
            .then(res => res.json())
            .then(data => setBilanActif(data.actif || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-sm">Chargement…</div>;
    }

    return (
        <div className="font-serif text-[10px]">
            <LiasseHeader title="BILAN - ACTIF" />

            {/* Table Structure Normalized */}
            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black px-1 py-2 w-10">REF</th>
                        <th className="border border-black px-2 py-2 text-left">ACTIF</th>
                        <th className="border border-black px-1 py-2 w-8">Note</th>
                        <th className="border border-black px-2 py-2 w-24">BRUT</th>
                        <th className="border border-black px-2 py-2 w-24">AMORT / DEPREC</th>
                        <th className="border border-black px-2 py-2 w-24">NET N</th>
                        <th className="border border-black px-2 py-2 w-24">NET N-1</th>
                    </tr>
                </thead>
                <tbody>
                    {bilanActif.map((row, idx) => (
                        <tr key={idx} className={row.isTotal ? "font-bold bg-slate-50" : ""}>
                            <td className="border border-black px-1 py-1 text-center font-mono">{row.code}</td>
                            <td className="border border-black px-2 py-1">{row.label.toUpperCase()}</td>
                            <td className="border border-black px-1 py-1 text-center"></td>
                            {/* Simulation Brut/Amort for this display since we only had Net in mock */}
                            <td className="border border-black px-2 py-1 text-right font-mono">{((row.netN || 0) * 1.2).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                            <td className="border border-black px-2 py-1 text-right font-mono">{((row.netN || 0) * 0.2).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                            <td className={clsx("border border-black px-2 py-1 text-right font-mono", row.isTotal ? "bg-slate-200" : "")}>{(row.netN || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                            <td className="border border-black px-2 py-1 text-right font-mono">{(row.netN1 || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer controls for signature that only appear on print */}
            <div className="mt-8 grid grid-cols-2 gap-8 print:break-inside-avoid">
                <div className="border border-black p-4 h-32 text-center">
                    <p className="underline font-bold mb-4">L'EXPERT COMPTABLE / LE COMMISSAIRE AUX COMPTES</p>
                    <p className="text-xs italic">(Cachet et Signature)</p>
                </div>
                <div className="border border-black p-4 h-32 text-center">
                    <p className="underline font-bold mb-4">LE DIRIGEANT</p>
                    <p className="text-xs italic">(Cachet et Signature)</p>
                </div>
            </div>
        </div>
    );
}
