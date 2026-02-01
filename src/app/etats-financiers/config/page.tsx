import React from 'react';
import { Save } from 'lucide-react';

export default function ConfigPage() {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Paramétrage du Dossier</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Informations générales de l'entité pour l'entête des états financiers.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dénomination Sociale</label>
                            <input type="text" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" defaultValue="SOCIETE TALL MAKY" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sigle</label>
                            <input type="text" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" defaultValue="STM" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">NINEA / Identifiant Fiscal</label>
                            <input type="text" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" defaultValue="004512458" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Activite Principale</label>
                            <input type="text" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" defaultValue="COMMERCE GENERAL" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Adresse Complète</label>
                        <textarea className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" rows={3}>DAKAR SENEGAL</textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
                            <Save size={16} /> Enregistrer
                        </button>
                    </div>
                </form>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Paramètres Comptables</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Date de clôture</label>
                        <input type="date" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" defaultValue="2024-12-31" />
                    </div>
                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Durée Exercice (mois)</label>
                        <input type="number" className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" defaultValue="12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
