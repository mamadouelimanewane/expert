"use client";

import React from 'react';
import { LiasseHeader } from '@/components/etats-financiers/print/LiasseHeader';
import { clsx } from 'clsx';

const COMPTE_RESULTAT = [
    { code: "TA", label: "Ventes de marchandises", netN: 150000000, netN1: 140000000 },
    { code: "TB", label: "Ventes de produits fabriqués", netN: 0, netN1: 0 },
    { code: "TC", label: "Travaux, services vendus", netN: 25000000, netN1: 20000000 },
    { code: "TD", label: "Produits accessoires", netN: 500000, netN1: 400000 },
    { code: "XA", label: "CHIFFRE D'AFFAIRES (A+B+C+D)", netN: 175500000, netN1: 160400000, isTotal: true },

    { code: "RA", label: "Achats de marchandises", netN: -80000000, netN1: -75000000 },
    { code: "RB", label: "Variation de stocks", netN: 2000000, netN1: 1500000 },
    { code: "XB", label: "MARGE COMMERCIALE", netN: 97500000, netN1: 86900000, isTotal: true },

    { code: "RC", label: "Transports", netN: -5000000, netN1: -4500000 },
    { code: "RD", label: "Services extérieurs", netN: -12000000, netN1: -10000000 },
    { code: "RE", label: "Impôts et taxes", netN: -1500000, netN1: -1200000 },
    { code: "RF", label: "Autres charges", netN: -800000, netN1: -700000 },
    { code: "XC", label: "VALEUR AJOUTÉE (XB+XB2-RC-RD-RE-RF)", netN: 78200000, netN1: 70500000, isTotal: true },

    { code: "RG", label: "Charges de personnel", netN: -35000000, netN1: -30000000 },
    { code: "XD", label: "EXCÉDENT BRUT D'EXPLOITATION", netN: 43200000, netN1: 40500000, isTotal: true },

    { code: "TI", label: "Reprises d'amortissements et provisions", netN: 2000000, netN1: 1800000 },
    { code: "RJ", label: "Dotations aux amortissements et provisions", netN: -7200000, netN1: -7300000 },
    { code: "XE", label: "RÉSULTAT D'EXPLOITATION", netN: 38000000, netN1: 35000000, isTotal: true },

    { code: "XF", label: "RÉSULTAT FINANCIER", netN: -2500000, netN1: -3000000, isTotal: true },
    { code: "XG", label: "RÉSULTAT DES ACTIVITÉS ORDINAIRES", netN: 35500000, netN1: 32000000, isTotal: true },

    { code: "XH", label: "RÉSULTAT HORS ACTIVITÉS ORDINAIRES", netN: 0, netN1: 500000, isTotal: true },
    { code: "RK", label: "Participation des travailleurs", netN: 0, netN1: 0 },
    { code: "RL", label: "Impôts sur le résultat", netN: -11000000, netN1: -10000000 },
    { code: "XI", label: "RÉSULTAT NET", netN: 24500000, netN1: 22500000, isTotal: true, level: 2 },
];

export default function PrintResultatPage() {
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
                    {COMPTE_RESULTAT.map((row, idx) => (
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
