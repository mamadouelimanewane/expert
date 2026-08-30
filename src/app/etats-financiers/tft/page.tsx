"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Printer, AlertTriangle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

// Tableau des Flux de Trésorerie — méthode indirecte simplifiée, calculée à
// partir de la variation entre le bilan de la période N et celui de la
// période N-1 (voir src/lib/ohada/tft-engine.ts pour la méthode exacte et
// ses limites par rapport à la présentation SYSCOHADA intégrale).

type LigneTFT = { code: string; label: string; montant: number; isTotal?: boolean };
type TFTData = {
    exploitation: LigneTFT[];
    investissement: LigneTFT[];
    financement: LigneTFT[];
    variationTresorerie: number;
    tresorerieOuverture: number;
    tresorerieClotureCalculee: number;
    tresorerieClotureReelle: number;
    ecartControle: number;
    equilibre: boolean;
};

function fcfa(n: number) {
    return Math.round(n).toLocaleString("fr-FR") + " FCFA";
}

function moisPrecedent(periode: string): string {
    const [a, m] = periode.split("-").map(Number);
    const date = new Date(a, m - 2, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function TFTPage() {
    const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
    const [clientId, setClientId] = useState("");
    const [periode, setPeriode] = useState(new Date().toISOString().substring(0, 7));
    const [periodeN1, setPeriodeN1] = useState(moisPrecedent(new Date().toISOString().substring(0, 7)));

    const [tft, setTft] = useState<TFTData | null>(null);
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/clients?limit=200&isActive=true")
            .then((res) => res.json())
            .then((data) => {
                setClients(
                    (data.clients ?? []).map((c: Record<string, unknown>) => ({
                        id: String(c.id),
                        nom: (c.companyName as string) || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Client sans nom",
                    }))
                );
            })
            .catch((error) => console.error("Chargement du portefeuille :", error));
    }, []);

    const fetchTft = useCallback(async () => {
        if (!clientId) {
            setTft(null);
            setErreur(null);
            return;
        }
        setLoading(true);
        setErreur(null);
        try {
            const res = await fetch(`/api/comptabilite/etats-financiers/tft?clientId=${clientId}&periode=${periode}&periodeN1=${periodeN1}`);
            const data = await res.json();
            if (!res.ok) {
                setErreur(data.error || "Erreur lors du calcul du TFT.");
                setTft(null);
                return;
            }
            setTft(data.tft);
        } catch (error) {
            console.error("Échec du calcul TFT :", error);
            setErreur("Impossible de calculer le TFT.");
        } finally {
            setLoading(false);
        }
    }, [clientId, periode, periodeN1]);

    useEffect(() => { fetchTft(); }, [fetchTft]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="page-title">Tableau des Flux de Trésorerie</h2>
                    <p className="page-subtitle">
                        Méthode indirecte simplifiée, calculée depuis la variation du bilan entre N et N-1
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                        <option value="">Sélectionner un client</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                    <input type="month" value={periodeN1} onChange={(e) => setPeriodeN1(e.target.value)} title="Période N-1" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" />
                    <span className="text-slate-400">→</span>
                    <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} title="Période N" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" />
                    <a
                        href={clientId ? `/etats-financiers/print/tft?clientId=${clientId}&periode=${periode}&periodeN1=${periodeN1}` : undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!clientId}
                        className={clsx(
                            "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
                            clientId ? "hover:bg-slate-50" : "pointer-events-none opacity-50"
                        )}
                    >
                        <Printer size={16} /> Imprimer
                    </a>
                    <button disabled title="Non implémenté" className="flex items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500">
                        <Download size={16} /> Exporter Excel
                    </button>
                </div>
            </div>

            {!clientId ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">
                    Sélectionnez un client pour calculer son TFT.
                </div>
            ) : loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            ) : erreur ? (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{erreur}</p>
                </div>
            ) : tft && (
                <>
                    <div className={clsx(
                        "flex items-center gap-3 rounded-xl border p-4 text-sm",
                        tft.equilibre
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    )}>
                        {tft.equilibre ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <p>
                            {tft.equilibre
                                ? "Trésorerie de clôture calculée cohérente avec le bilan."
                                : `Écart de contrôle : ${fcfa(tft.ecartControle)} — vérifiez l'équilibre des bilans N et N-1.`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <TFTSection title="Exploitation" lignes={tft.exploitation} color="bg-primary" />
                        <TFTSection title="Investissement" lignes={tft.investissement} color="bg-amber-600" />
                        <TFTSection title="Financement" lignes={tft.financement} color="bg-emerald-600" />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <div className="apix-table-wrapper">
                        <table className="apix-table w-full text-sm">
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <TFTRow label="Trésorerie nette à l'ouverture" montant={tft.tresorerieOuverture} />
                                <TFTRow label="Variation de la trésorerie nette" montant={tft.variationTresorerie} />
                                <TFTRow label="Trésorerie nette à la clôture" montant={tft.tresorerieClotureCalculee} bold />
                            </tbody>
                        </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function TFTSection({ title, lignes, color }: { title: string; lignes: LigneTFT[]; color: string }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className={`px-6 py-3 ${color} text-white`}>
                <h3 className="font-bold tracking-wide">{title}</h3>
            </div>
            <div className="apix-table-wrapper">
            <table className="apix-table w-full text-sm">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lignes.map((l) => (
                        <tr key={l.code} className={l.isTotal ? "bg-slate-50 dark:bg-slate-900 font-bold" : ""}>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{l.label}</td>
                            <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white whitespace-nowrap">{fcfa(l.montant)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

function TFTRow({ label, montant, bold }: { label: string; montant: number; bold?: boolean }) {
    return (
        <tr className={bold ? "bg-slate-50 dark:bg-slate-900 font-bold" : ""}>
            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{label}</td>
            <td className="px-6 py-4 text-right font-mono text-slate-900 dark:text-white whitespace-nowrap">{fcfa(montant)}</td>
        </tr>
    );
}
