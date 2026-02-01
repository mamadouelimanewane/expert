import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function EtatsFinanciersPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-lg">
                <h2 className="text-3xl font-bold">Tableau de bord - Clôture 2024</h2>
                <p className="mt-2 text-indigo-100">
                    Générez vos états financiers conformes au SYSCOHADA Révisé.
                </p>
                <div className="mt-6 flex gap-4">
                    <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50">
                        Commencer une nouvelle clôture
                    </button>
                    <button className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                        Voir l'historique
                    </button>
                </div>
            </section>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <KPICard
                    title="Total Bilan"
                    value="145 250 000 FCFA"
                    trend="+12%"
                    isPositive={true}
                />
                <KPICard
                    title="Résultat Net"
                    value="24 800 000 FCFA"
                    trend="+5%"
                    isPositive={true}
                />
                <KPICard
                    title="Trésorerie Nette"
                    value="-1 200 000 FCFA"
                    trend="-2%"
                    isPositive={false}
                />
            </div>

            {/* Status Workflow */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">État d'avancement Clôture</h3>
                    <div className="space-y-4">
                        <Link href="/etats-financiers/import" className="block p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            <WorkflowStep title="Import de la Balance N" status="completed" date="01/02/2026" />
                        </Link>
                        <Link href="/etats-financiers/import" className="block p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            <WorkflowStep title="Import de la Balance N-1" status="completed" date="01/02/2026" />
                        </Link>
                        <Link href="/etats-financiers/bilan" className="block p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            <WorkflowStep title="Revue du Bilan Actif/Passif" status="warning" date="À valider" />
                        </Link>
                        <Link href="/etats-financiers/resultat" className="block p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors">
                            <WorkflowStep title="Génération du Compte de Résultat" status="pending" date="En attente" />
                        </Link>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Link
                            href="/etats-financiers/bilan"
                            className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                        >
                            Consulter le Bilan Interactif
                        </Link>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Actions requises</h3>
                    <div className="flex items-start gap-4 rounded-lg bg-amber-50 p-4 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                        <AlertCircle className="mt-1 h-5 w-5 shrink-0" />
                        <div>
                            <p className="font-semibold">3 Comptes non mappés</p>
                            <p className="mt-1 text-sm opacity-90">
                                Les comptes 471200, 658000 et 758000 n'ont pas de correspondance dans le paramétrage OHADA.
                            </p>
                            <button className="mt-3 text-sm font-semibold underline underline-offset-2">
                                Corriger le mapping
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Exports Normalisés (DGID)</h3>
                        <div className="space-y-3">
                            <a
                                href="/etats-financiers/print/bilan"
                                target="_blank"
                                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        📄
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Bilan (Actif/Passif)</p>
                                        <p className="text-xs text-slate-500">Format A4 Normalisé</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Imprimer &rarr;</span>
                            </a>

                            <a
                                href="/etats-financiers/print/resultat"
                                target="_blank"
                                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        📊
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Compte de Résultat</p>
                                        <p className="text-xs text-slate-500">Format A4 Normalisé</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Imprimer &rarr;</span>
                            </a>

                            <a
                                href="/etats-financiers/print/tft"
                                target="_blank"
                                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        💸
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Flux de Trésorerie (TFT)</p>
                                        <p className="text-xs text-slate-500">Format A4 Normalisé</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Imprimer &rarr;</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certification Badge */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900 p-6 text-white">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold">Moteur de calcul Certifié OHADA</h4>
                        <p className="text-sm text-slate-400">
                            Conformité stricte au Référentiel SYSCOHADA Révisé 2017 et AUDCIF.
                        </p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Version du moteur : 2.4.0.0</span>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, isPositive }: { title: string; value: string; trend: string; isPositive: boolean }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trend}
                </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

function WorkflowStep({ title, status, date }: { title: string; status: 'completed' | 'pending' | 'warning'; date: string }) {
    const icon = {
        completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        pending: <div className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    };

    return (
        <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
            <div className="flex items-center gap-3">
                {icon[status]}
                <span className={`text-sm font-medium ${status === 'pending' ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                    {title}
                </span>
            </div>
            <span className="text-sm text-slate-500">{date}</span>
        </div>
    );
}
