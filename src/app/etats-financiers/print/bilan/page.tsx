"use client";

import React, { useEffect } from 'react';
import { LiasseHeader } from '@/components/etats-financiers/print/LiasseHeader';
import { clsx } from 'clsx';

// Réutilisation des données mockées pour l'exemple
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

export default function PrintBilanPage() {

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
                    {BILAN_ACTIF.map((row, idx) => (
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
