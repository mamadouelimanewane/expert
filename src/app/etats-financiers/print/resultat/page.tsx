"use client";

import React, { useEffect, useState } from 'react';
import { LiasseHeader } from '@/components/etats-financiers/print/LiasseHeader';
import { clsx } from 'clsx';

export default function PrintResultatPage() {
    const [compteResultat, setCompteResultat] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/comptabilite/etats-financiers/resultat')
            .then(res => res.json())
            .then(data => setCompteResultat(data.resultat || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-sm">Chargement…</div>;
    }

    return (
        <div className="font-serif text-[9px]">
            <LiasseHeader title="COMPTE DE RÉSULTAT" />

            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black px-1 py-1 w-10">REF</th>
                        <th className="border border-black px-2 py-1 text-left">LIBELLÉS</th>
                        <th className="border border-black px-2 py-1 w-24">EXERCICE N</th>
                        <th className="border border-black px-2 py-1 w-24">EXERCICE N-1</th>
                    </tr>
                </thead>
                <tbody>
                    {compteResultat.map((row, idx) => (
                        <tr key={idx} className={clsx(
                            row.isTotal ? "font-bold bg-slate-50" : "",
                            row.level === 2 ? "bg-slate-200 text-[11px]" : ""
                        )}>
                            <td className="border border-black px-1 py-1 text-center font-mono">{row.code}</td>
                            <td className="border border-black px-2 py-1">
                                {row.isTotal ? row.label.toUpperCase() : row.label}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono">
                                {Math.abs(row.netN || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                                {(row.netN || 0) < 0 ? " (X)" : ""}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono">
                                {Math.abs(row.netN1 || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                                {(row.netN1 || 0) < 0 ? " (X)" : ""}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-4 text-[8px] italic">
                <p>(X) Montant négatif ou solde créditeur pour les charges, montant négatif ou solde débiteur pour les produits.</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-8 print:break-inside-avoid">
                <div className="border border-black p-4 h-24 text-center">
                    <p className="underline font-bold mb-2">L'EXPERT COMPTABLE</p>
                    <p className="text-[8px] italic">(Cachet et Signature)</p>
                </div>
                <div className="border border-black p-4 h-24 text-center">
                    <p className="underline font-bold mb-2">LE DIRIGEANT</p>
                    <p className="text-[8px] italic">(Cachet et Signature)</p>
                </div>
            </div>
        </div>
    );
}
