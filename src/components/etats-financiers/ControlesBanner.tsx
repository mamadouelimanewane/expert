"use client";

import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

type Controle = {
    balance?: { totalDebit: number; totalCredit: number; ecart: number; equilibree: boolean };
    equilibre?: { totalActif: number; totalPassif: number; ecart: number; equilibre: boolean };
    comptesNonAffectes?: { numero: string; intitule: string; solde: number }[];
};

const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

/**
 * Contrôles de cohérence des états financiers.
 *
 * Affichés systématiquement, y compris quand tout est correct : un expert doit
 * pouvoir constater que le contrôle a bien été effectué. Les anomalies ne sont
 * jamais corrigées silencieusement — le résultat net n'est plus calculé « par
 * différence » pour forcer l'équilibre du bilan.
 */
export default function ControlesBanner({ controles }: { controles?: Controle }) {
    if (!controles) return null;

    const { balance, equilibre, comptesNonAffectes = [] } = controles;
    const anomalies =
        (balance && !balance.equilibree) ||
        (equilibre && !equilibre.equilibre) ||
        comptesNonAffectes.length > 0;

    return (
        <div
            className={
                anomalies
                    ? "rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
                    : "rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"
            }
        >
            <div className="flex items-start gap-3">
                {anomalies ? (
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" size={18} />
                ) : (
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" size={18} />
                )}

                <div className="min-w-0 flex-1 space-y-2 text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {anomalies ? "Contrôles de cohérence : anomalies détectées" : "Contrôles de cohérence : conformes"}
                    </p>

                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                        {balance && (
                            <li>
                                Balance source — débit {fcfa(balance.totalDebit)} / crédit{" "}
                                {fcfa(balance.totalCredit)}
                                {balance.equilibree ? (
                                    <span className="text-emerald-700 dark:text-emerald-400"> · équilibrée</span>
                                ) : (
                                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                                        {" "}· écart de {fcfa(balance.ecart)}
                                    </span>
                                )}
                            </li>
                        )}

                        {equilibre && (
                            <li>
                                Bilan — actif {fcfa(equilibre.totalActif)} / passif {fcfa(equilibre.totalPassif)}
                                {equilibre.equilibre ? (
                                    <span className="text-emerald-700 dark:text-emerald-400"> · équilibré</span>
                                ) : (
                                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                                        {" "}· écart de {fcfa(equilibre.ecart)}
                                    </span>
                                )}
                            </li>
                        )}
                    </ul>

                    {comptesNonAffectes.length > 0 && (
                        <details className="rounded-lg bg-white/60 p-3 dark:bg-slate-900/40">
                            <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                                <HelpCircle size={14} />
                                {comptesNonAffectes.length} compte
                                {comptesNonAffectes.length > 1 ? "s" : ""} non rattaché
                                {comptesNonAffectes.length > 1 ? "s" : ""} au référentiel SYSCOHADA
                            </summary>
                            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                                Ces comptes n&apos;alimentent aucune ligne des états et expliquent tout ou
                                partie de l&apos;écart. Corrigez leur numérotation avant publication.
                            </p>
                            <ul className="mt-2 space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                                {comptesNonAffectes.slice(0, 25).map((c) => (
                                    <li key={c.numero} className="flex justify-between gap-4">
                                        <span className="truncate">
                                            {c.numero} — {c.intitule || "sans intitulé"}
                                        </span>
                                        <span className="shrink-0">{fcfa(c.solde)}</span>
                                    </li>
                                ))}
                                {comptesNonAffectes.length > 25 && (
                                    <li className="opacity-60">
                                        … et {comptesNonAffectes.length - 25} autre
                                        {comptesNonAffectes.length - 25 > 1 ? "s" : ""}
                                    </li>
                                )}
                            </ul>
                        </details>
                    )}
                </div>
            </div>
        </div>
    );
}
