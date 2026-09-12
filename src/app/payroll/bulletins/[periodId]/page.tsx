"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { rubriquesBulletin, type BulletinEntree } from "@/lib/payroll/rubriques";
import { LEGISLATION_PAIE, type PaysSupporte } from "@/lib/payroll/engines";

/**
 * Bulletins de paie d'une période, prêts à imprimer ou enregistrer en PDF
 * (un bulletin par page A4). `?employeeId=` limite à un seul salarié.
 *
 * Document autonome : fond blanc, typographie fixe, aucune dépendance au
 * thème de l'application ; la barre d'action est masquée à l'impression.
 */

interface Payslip {
    id: string;
    absencesDays: number;
    overtimeHours: number;
    bonuses: number;
    baseSalary: number;
    transportAllowance: number;
    avantagesNature: number;
    country: string;
    detail: Record<string, number> | null;
    grossSalary: number;
    netSalary: number;
    taxableIncome: number;
    taxes: number;
    employeeSocials: number;
    employerSocials: number;
    employee: { id: string; firstName: string; lastName: string; position: string | null; maritalStatus: string | null; childrenCount: number; isCadre: boolean; sexe: string | null };
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

export default function BulletinsPage() {
    const { periodId } = useParams<{ periodId: string }>();
    const employeeId = useSearchParams()?.get("employeeId") ?? null;
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
    if (!periode) return <div className="p-8 text-sm bg-white min-h-screen">Chargement des bulletins…</div>;

    const bulletins = employeeId ? periode.payslips.filter((p) => p.employee.id === employeeId) : periode.payslips;
    const employeur = periode.client.companyName || `${periode.client.firstName ?? ""} ${periode.client.lastName ?? ""}`.trim();
    const identifiant =
        periode.client.country === "SN" && periode.client.ninea ? `NINEA ${periode.client.ninea}`
        : periode.client.ifu ? `IFU ${periode.client.ifu}`
        : periode.client.rccm ? `RCCM ${periode.client.rccm}` : "";

    return (
        <div className="bg-white text-slate-900 min-h-screen">
            <style>{`
                @page { size: A4; margin: 12mm; }
                @media print { .no-print { display: none !important; } .bulletin { page-break-after: always; break-after: page; } .bulletin:last-child { page-break-after: auto; } }
            `}</style>

            <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur">
                <p className="text-sm text-slate-600">
                    {bulletins.length} bulletin{bulletins.length > 1 ? "s" : ""} — {employeur}, {periode.periodName}
                </p>
                <div className="flex gap-2">
                    <a href={`/api/payroll/periodes/${periode.id}/export?format=xlsx`} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50">Excel</a>
                    <a href={`/api/payroll/periodes/${periode.id}/export?format=csv`} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50">CSV</a>
                    <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110">Imprimer / PDF</button>
                </div>
            </div>

            {bulletins.length === 0 && <p className="p-8 text-sm">Aucun bulletin pour cette sélection.</p>}

            {bulletins.map((p) => {
                const entree: BulletinEntree = {
                    pays: p.country,
                    baseSalary: p.baseSalary,
                    absencesDays: p.absencesDays,
                    overtimeHours: p.overtimeHours,
                    bonuses: p.bonuses,
                    transportAllowance: p.transportAllowance,
                    grossSalary: p.grossSalary,
                    taxableIncome: p.taxableIncome,
                    socialSecurity: p.employeeSocials,
                    taxes: p.taxes,
                    netSalary: p.netSalary,
                    employerContributions: p.employerSocials,
                    detail: p.detail,
                };
                const sections = rubriquesBulletin(entree);
                const legislation = LEGISLATION_PAIE[p.country as PaysSupporte] ?? p.country;
                const situation = `${(p.employee.maritalStatus ?? "CELIBATAIRE").toLowerCase()}${p.employee.sexe === "F" ? " (F)" : ""}, ${p.employee.childrenCount} enfant${p.employee.childrenCount > 1 ? "s" : ""} à charge${p.employee.isCadre ? ", cadre" : ""}`;

                return (
                    <article key={p.id} className="bulletin mx-auto max-w-[190mm] px-6 py-8 font-sans text-[11px] leading-snug">
                        <header className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-4">
                            <div>
                                <p className="text-lg font-black tracking-tight">{employeur}</p>
                                {periode.client.address && <p>{periode.client.address}{periode.client.city ? `, ${periode.client.city}` : ""}</p>}
                                {identifiant && <p>{identifiant}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black uppercase tracking-widest">Bulletin de paie</p>
                                <p className="font-bold">{periode.periodName}</p>
                                <p className="text-[10px] text-slate-500">{legislation}</p>
                            </div>
                        </header>

                        <section className="grid grid-cols-2 gap-4 mb-4 text-[11px]">
                            <div className="border border-slate-300 rounded p-3">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Salarié</p>
                                <p className="font-black text-sm">{p.employee.firstName} {p.employee.lastName}</p>
                                <p>{p.employee.position || "—"}</p>
                                <p className="text-slate-600">Situation : {situation}</p>
                            </div>
                            <div className="border border-slate-300 rounded p-3">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Période</p>
                                <p>Paie de <span className="font-bold">{periode.periodName}</span></p>
                                <p>Absences : {p.absencesDays} j · Heures sup. : {p.overtimeHours} h</p>
                                <p>Statut : {periode.status === "PAID" ? "payé" : "validé"} le {new Date(periode.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                        </section>

                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-100 text-[9px] uppercase tracking-wider">
                                    <th className="border border-slate-300 px-2 py-1 text-left w-12">Code</th>
                                    <th className="border border-slate-300 px-2 py-1 text-left">Rubrique</th>
                                    <th className="border border-slate-300 px-2 py-1 text-right w-24">Base</th>
                                    <th className="border border-slate-300 px-2 py-1 text-right w-16">Taux</th>
                                    <th className="border border-slate-300 px-2 py-1 text-right w-24">Part salariale</th>
                                    <th className="border border-slate-300 px-2 py-1 text-right w-24">Part patronale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((s) => (
                                    <SectionRows key={s.titre} titre={s.titre} rubriques={s.rubriques} />
                                ))}
                            </tbody>
                        </table>

                        <footer className="mt-6 grid grid-cols-3 gap-4 text-[10px]">
                            <div className="border border-slate-300 rounded p-3 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500">Net à payer</p>
                                <p className="text-lg font-black">{fmt(p.netSalary)} F CFA</p>
                            </div>
                            <div className="border border-slate-300 rounded p-3 text-center">
                                <p className="text-[9px] uppercase tracking-widest text-slate-500">Coût employeur</p>
                                <p className="text-lg font-black">{fmt(p.grossSalary + p.employerSocials)} F CFA</p>
                            </div>
                            <div className="border border-slate-300 rounded p-3 text-center text-slate-500">
                                <p className="text-[9px] uppercase tracking-widest">Signature employeur</p>
                                <div className="h-8" />
                            </div>
                        </footer>
                        <p className="mt-4 text-[9px] text-slate-400">
                            Bulletin établi par Cabinet 360 selon la législation indiquée. À conserver sans limitation de durée.
                        </p>
                    </article>
                );
            })}
        </div>
    );
}

function SectionRows({ titre, rubriques }: { titre: string; rubriques: ReturnType<typeof rubriquesBulletin>[number]["rubriques"] }) {
    return (
        <>
            <tr>
                <td colSpan={6} className="border border-slate-300 px-2 py-1 bg-slate-50 font-black uppercase text-[9px] tracking-widest">{titre}</td>
            </tr>
            {rubriques.map((r) => {
                const total = r.code === "199" || r.code === "999" || r.code === "960";
                return (
                    <tr key={r.code} className={total ? "font-black bg-slate-50" : ""}>
                        <td className="border border-slate-300 px-2 py-1 text-slate-500">{r.code}</td>
                        <td className="border border-slate-300 px-2 py-1">{r.libelle}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{r.base !== undefined ? fmt(r.base) : ""}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{pct(r.taux)}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{r.salarie !== undefined && r.salarie !== 0 ? fmt(r.salarie) : ""}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right tabular-nums">{r.employeur !== undefined && r.employeur !== 0 ? fmt(r.employeur) : ""}</td>
                    </tr>
                );
            })}
        </>
    );
}
