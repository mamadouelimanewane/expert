"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LiasseHeader } from '@/components/etats-financiers/print/LiasseHeader';
import { clsx } from 'clsx';

// ─────────────────────────────────────────────────────────────────────────────
// Cette page appelait l'API bilan sans clientId ni période : sans filtre,
// /api/comptabilite/etats-financiers/bilan agrège les écritures de TOUS les
// clients et de TOUTES les périodes — un bilan mélangeant plusieurs
// entreprises n'a aucun sens et ne doit pas être imprimable comme document
// officiel. Les colonnes BRUT et AMORT/DÉPRÉC. étaient en outre calculées
// par une formule arbitraire (netN × 1,2 et netN × 0,2, cf. commentaire
// d'origine "Simulation... since we only had Net in mock") alors que le
// moteur SYSCOHADA (src/lib/ohada/syscohada-engine.ts) calcule déjà de
// vrais brutN/amortN par ligne — l'API les renvoyait, la page ne les
// utilisait simplement pas.
// ─────────────────────────────────────────────────────────────────────────────

function PrintBilanInner() {
    const searchParams = useSearchParams();
    const clientId = searchParams?.get('clientId') || '';
    const periode = searchParams?.get('periode') || '';

    const [bilanActif, setBilanActif] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!clientId || !periode) {
            setLoading(false);
            return;
        }
        fetch(`/api/comptabilite/etats-financiers/bilan?clientId=${clientId}&periode=${periode}`)
            .then(res => res.json())
            .then(data => setBilanActif(data.actif || []))
            .finally(() => setLoading(false));
    }, [clientId, periode]);

    if (!clientId || !periode) {
        return <div className="p-8 text-sm">Client et période requis (paramètres ?clientId=&amp;periode= manquants).</div>;
    }

    if (loading) {
        return <div className="p-8 text-sm">Chargement…</div>;
    }

    return (
        <div className="font-serif text-[10px]">
            <LiasseHeader title="BILAN - ACTIF" />

            <table className="w-full border-collapse border border-black">
                <thead>
                    <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-black px-1 py-2 w-10">REF</th>
                        <th className="border border-black px-2 py-2 text-left">ACTIF</th>
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
                            <td className="border border-black px-2 py-1 text-right font-mono">{(row.brutN || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                            <td className="border border-black px-2 py-1 text-right font-mono">{(row.amortN || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                            <td className={clsx("border border-black px-2 py-1 text-right font-mono", row.isTotal ? "bg-slate-200" : "")}>{(row.netN || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                            <td className="border border-black px-2 py-1 text-right font-mono">{(row.netN1 || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

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

export default function PrintBilanPage() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">Chargement…</div>}>
            <PrintBilanInner />
        </Suspense>
    );
}
