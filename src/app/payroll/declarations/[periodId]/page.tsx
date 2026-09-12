"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { bordereauxDeclarations, type Bordereau } from "@/lib/payroll/declarations";
import { LEGISLATION_PAIE, type PaysSupporte } from "@/lib/payroll/engines";

/**
 * Déclarations sociales et fiscales pré-remplies d'une période de paie :
 * un bordereau par organisme (récapitulatif + annexe nominative), une page
 * A4 par bordereau. Document autonome, indépendant du thème de l'application.
 */

interface Payslip {
    id: string;
    grossSalary: number;
    taxableIncome: number;
    transportAllowance: number;
    employeeSocials: number;
    employerSocials: number;
    taxes: number;
    detail: Record<string, number> | null;
    employee: { firstName: string; lastName: string; position: string | null; isCadre: boolean };
}

interface Periode {
    id: string;
    periodName: string;
    status: string;
    createdAt: string;
    client: { companyName: string | null; firstName: string | null; lastName: string | null; address: string | null; city: string | null; country: string; ninea: string | null; rccm: string | null; ifu: string | null };
    payslips: Payslip[];
}

const fmt = (n: number) => Math.round(n).toLocaleString("fr-FR");
const pct = (t?: number) => (t === undefined ? "" : `${(t * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`);

export default function DeclarationsPage() {
    const { periodId } = useParams<{ periodId: string }>();
    const [periode, setPeriode] = useState<Periode | null>(null);
    const [erreur, setErreur] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/payroll/periodes/${periodId}`)
            .then(async (r) => {
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || "Période introuvable");
                setPeriode(d.periode);
            })
            .catch((e: Error) => setErreur(e.message));
    }, [periodId]);

    if (erreur) return <div className="p-8 text-sm text-red-600 bg-white min-h-screen">{erreur}</div>;
    if (!periode) return <div className="p-8 text-sm bg-white min-h-screen">Chargement des déclarations…</div>;

    const bordereaux = bordereauxDeclarations(
        periode.client.country,
        periode.payslips.map((p) => ({
            salarie: `${p.employee.firstName} ${p.employee.lastName}`,
            poste: p.employee.position,
            isCadre: p.employee.isCadre,
            grossSalary: p.grossSalary,
            taxableIncome: p.taxableIncome,
            transportAllowance: p.transportAllowance,
            employeeSocials: p.employeeSocials,
            employerSocials: p.employerSocials,
            taxes: p.taxes,
            detail: p.detail,
        }))
    );
    const employeur = periode.client.companyName || `${periode.client.firstName ?? ""} ${periode.client.lastName ?? ""}`.trim();
    const identifiant =
        periode.client.country === "SN" && periode.client.ninea ? `NINEA ${periode.client.ninea}`
        : periode.client.ifu ? `IFU ${periode.client.ifu}`
        : periode.client.rccm ? `RCCM ${periode.client.rccm}` : "";
    const legislation = LEGISLATION_PAIE[periode.client.country as PaysSupporte] ?? periode.client.country;
    const masseSalariale = periode.payslips.reduce((a, p) => a + p.grossSalary, 0);
    const totalGeneral = bordereaux.reduce((a, b) => a + b.total, 0);

    return (
        <div className="bg-white text-slate-900 min-h-screen">
            <style>{`
                @page { size: A4; margin: 12mm; }
                @media print { .no-print { display: none !important; } .bordereau { page-break-after: always; break-after: page; } .bordereau:last-child { page-break-after: auto; } }
            `}</style>

            <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur">
                <p className="text-sm text-slate-600">
                    {bordereaux.length} bordereau{bordereaux.length > 1 ? "x" : ""} — {employeur}, {periode.periodName} · total à verser {fmt(totalGeneral)} F CFA
                </p>
                <div className="flex gap-2">
                    <a href={`/payroll/bulletins/${periode.id}`} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50">Bulletins</a>
                    <a href={`/api/payroll/periodes/${periode.id}/export?format=xlsx`} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50">Excel</a>
                    <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110">Imprimer / PDF</button>
                </div>
            </div>

            {bordereaux.length === 0 && <p className="p-8 text-sm">Aucun bulletin dans cette période.</p>}

            {bordereaux.map((b) => (
                <BordereauA4
                    key={b.organisme}
                    b={b}
                    employeur={employeur}
                    adresse={[periode.client.address, periode.client.city].filter(Boolean).join(", ")}
                    identifiant={identifiant}
                    periodName={periode.periodName}
                    legislation={legislation}
                    masseSalariale={masseSalariale}
                />
            ))}
        </div>
    );
}

function BordereauA4({ b, employeur, adresse, identifiant, periodName, legislation, masseSalariale }: { b: Bordereau; employeur: string; adresse: string; identifiant: string; periodName: string; legislation: string; masseSalariale: number }) {
    const numerique = (i: number) => i > 0 && typeof b.nominatif[0]?.[i] === "number";
    const totalColonne = (i: number) => b.nominatif.reduce((a, l) => a + (Number(l[i]) || 0), 0);
    const cellule = "border border-slate-300 px-1.5 py-0.5";
    return (
        <article className="bordereau mx-auto max-w-[190mm] px-6 py-8 font-sans text-[11px] leading-snug">
            <header className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
                <div>
                    <p className="text-lg font-black tracking-tight">{employeur}</p>
                    {adresse && <p>{adresse}</p>}
                    {identifiant && <p>{identifiant}</p>}
                </div>
                <div className="text-right">
                    <p className="text-base font-black uppercase tracking-widest">{b.titre}</p>
                    <p className="font-bold">{b.destinataire}</p>
                    <p className="text-[10px] text-slate-500">{legislation}</p>
                </div>
            </header>

            <section className="grid grid-cols-3 gap-4 mb-4">
                <div className="border border-slate-300 rounded p-3">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Période</p>
                    <p className="font-black text-sm capitalize">{periodName}</p>
                    {b.reference && <p className="text-slate-600">{b.reference}</p>}
                </div>
                <div className="border border-slate-300 rounded p-3">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Effectif déclaré</p>
                    <p className="font-black text-sm">{b.effectif} salarié{b.effectif > 1 ? "s" : ""}</p>
                    <p className="text-slate-600">Masse salariale brute : {fmt(masseSalariale)} F</p>
                </div>
                <div className="border border-slate-300 rounded p-3 text-center">
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Montant à verser</p>
                    <p className="text-lg font-black">{fmt(b.total)} F CFA</p>
                </div>
            </section>

            <table className="w-full border-collapse mb-5">
                <thead>
                    <tr className="bg-slate-100 text-[9px] uppercase tracking-wider">
                        <th className="border border-slate-300 px-2 py-1 text-left">Cotisation / retenue</th>
                        <th className="border border-slate-300 px-2 py-1 text-right w-24">Assiette</th>
                        <th className="border border-slate-300 px-2 py-1 text-right w-16">Taux sal.</th>
                        <th className="border border-slate-300 px-2 py-1 text-right w-16">Taux pat.</th>
                        <th className="border border-slate-300 px-2 py-1 text-right w-24">Part salariale</th>
                        <th className="border border-slate-300 px-2 py-1 text-right w-24">Part patronale</th>
                        <th className="border border-slate-300 px-2 py-1 text-right w-24">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {b.lignes.map((l) => (
                        <tr key={l.libelle}>
                            <td className="border border-slate-300 px-2 py-1">{l.libelle}</td>
                            <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{l.assiette !== undefined ? fmt(l.assiette) : ""}</td>
                            <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{pct(l.tauxSalarial)}</td>
                            <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{pct(l.tauxPatronal)}</td>
                            <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{l.salarial ? fmt(l.salarial) : ""}</td>
                            <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{l.patronal ? fmt(l.patronal) : ""}</td>
                            <td className="border border-slate-300 px-2 py-1 text-right tabular-nums font-bold">{fmt(l.total)}</td>
                        </tr>
                    ))}
                    <tr className="font-black bg-slate-50">
                        <td className="border border-slate-300 px-2 py-1" colSpan={4}>TOTAL {b.organisme}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{fmt(b.totalSalarial)}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{fmt(b.totalPatronal)}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{fmt(b.total)}</td>
                    </tr>
                </tbody>
            </table>

            <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Annexe nominative</p>
            <table className="w-full border-collapse text-[10px]">
                <thead>
                    <tr className="bg-slate-100 text-[8px] uppercase tracking-wider">
                        {b.colonnes.map((c, i) => (
                            <th key={c} className={`${cellule} py-1 ${i === 0 ? "text-left" : "text-right"}`}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {b.nominatif.map((l, k) => (
                        <tr key={k}>
                            {l.map((v, i) => (
                                <td key={i} className={`${cellule} ${i === 0 ? "" : "text-right tabular-nums"}`}>{typeof v === "number" && b.colonnes[i] !== "Parts" ? fmt(v) : v}</td>
                            ))}
                        </tr>
                    ))}
                    <tr className="font-black bg-slate-50">
                        {b.colonnes.map((c, i) => (
                            <td key={c} className={`${cellule} ${i === 0 ? "" : "text-right tabular-nums"}`}>{i === 0 ? "TOTAL" : numerique(i) && c !== "Parts" ? fmt(totalColonne(i)) : ""}</td>
                        ))}
                    </tr>
                </tbody>
            </table>

            <footer className="mt-6 grid grid-cols-2 gap-4 text-[10px]">
                <div className="border border-slate-300 rounded p-3 text-slate-500">
                    <p className="text-[9px] uppercase tracking-widest">Fait à ……………………, le ……………………</p>
                    <div className="h-10" />
                    <p className="text-[9px] uppercase tracking-widest">Signature et cachet de l&apos;employeur</p>
                </div>
                <div className="border border-slate-300 rounded p-3 text-slate-500">
                    <p className="text-[9px] uppercase tracking-widest">Cadre réservé à l&apos;organisme</p>
                    <div className="h-16" />
                </div>
            </footer>
            <p className="mt-4 text-[9px] text-slate-400">
                Bordereau pré-rempli par Cabinet 360 à partir des bulletins validés ; à reporter sur le formulaire ou le portail de l&apos;organisme. Les taux et plafonds appliqués sont ceux de la législation indiquée et doivent être vérifiés par le déclarant.
            </p>
        </article>
    );
}
