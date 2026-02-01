"use client";

import React from 'react';
import { LiasseHeader } from '@/components/etats-financiers/print/LiasseHeader';
import { clsx } from 'clsx';

const TFT_MOCK = [
    { code: "ZA", label: "Trésorerie nette au 1er Janvier (A)", netN: 8500000, netN1: 7000000 },
    { code: "FA", label: "Capacité d'Autofinancement Globale (C.A.F.G)", netN: 28000000, netN1: 25000000 },
    { code: "FB", label: "Variation du besoin en fonds de roulement", netN: -5000000, netN1: -4000000 },
    { code: "ZB", label: "FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS OPÉRATIONNELLES", netN: 23000000, netN1: 21000000, isTotal: true },

    { code: "FC", label: "Décaissements liés aux acquisitions d'immobilisations", netN: -12000000, netN1: -10000000 },
    { code: "FD", label: "Encaissements liés aux cessions d'immobilisations", netN: 1000000, netN1: 500000 },
    { code: "ZC", label: "FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS D'INVESTISSEMENT", netN: -11000000, netN1: -9500000, isTotal: true },

    { code: "FE", label: "Augmentation de capital par apports nouveaux", netN: 0, netN1: 0 },
    { code: "FF", label: "Dividendes versés", netN: -3000000, netN1: -2000000 },
    { code: "FG", label: "Emprunts contractés", netN: 5000000, netN1: 10000000 },
    { code: "FH", label: "Remboursements d'emprunts", netN: -10500000, netN1: -8000000 },
    { code: "ZD", label: "FLUX DE TRÉSORERIE PROVENANT DES ACTIVITÉS DE FINANCEMENT", netN: -8500000, netN1: 0, isTotal: true },

    { code: "ZE", label: "VARIATION DE LA TRÉSORERIE NETTE (ZB+ZC+ZD)", netN: 3500000, netN1: 11500000, isTotal: true },
    { code: "ZF", label: "Trésorerie nette au 31 Décembre (ZA+ZE)", netN: 12000000, netN1: 18500000, isTotal: true, level: 2 },
];

export default function PrintTFTPage() {
    return (
        <div className="font-serif text-[9px]">
            <LiasseHeader title="TABLEAU DES FLUX DE TRÉSORERIE (T.F.T.)" />

            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black px-1 py-1 w-12">REF</th>
                        <th className="border border-black px-2 py-1 text-left">LIBELLÉS</th>
                        <th className="border border-black px-2 py-1 w-28">EXERCICE N</th>
                        <th className="border border-black px-2 py-1 w-28">EXERCICE N-1</th>
                    </tr>
                </thead>
                <tbody>
                    {TFT_MOCK.map((row, idx) => (
                        <tr key={idx} className={clsx(
                            row.isTotal ? "font-bold bg-slate-50" : "",
                            row.level === 2 ? "bg-slate-200 text-[11px]" : ""
                        )}>
                            <td className="border border-black px-1 py-1 text-center font-mono">{row.code}</td>
                            <td className="border border-black px-2 py-1">
                                {row.isTotal ? row.label.toUpperCase() : row.label}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono">
                                {row.netN.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono">
                                {row.netN1.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-8 grid grid-cols-2 gap-8 print:break-inside-avoid">
                <div className="border border-black p-4 h-24 text-center">
                    <p className="underline font-bold mb-2">L'EXPERT COMPTABLE</p>
                </div>
                <div className="border border-black p-4 h-24 text-center">
                    <p className="underline font-bold mb-2">LE DIRIGEANT</p>
                </div>
            </div>
        </div>
    );
}
