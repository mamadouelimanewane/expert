import React from 'react';
import { ImportBalance } from '@/components/etats-financiers/ImportBalance';

export default function ImportPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Import des Données</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Chargez vos balances générales pour l'exercice N et N-1.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ImportBalance year="N (Exercice Courant)" />
                <ImportBalance year="N-1 (Exercice Précédent)" />
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                <h4 className="font-semibold">Format attendu :</h4>
                <ul className="mt-2 list-inside list-disc space-y-1">
                    <li>Fichier Excel (.xlsx) ou CSV</li>
                    <li>Colonnes : Compte, Intitulé, Solde Débit, Solde Crédit</li>
                    <li>Ne pas inclure les sous-totaux dans le fichier</li>
                </ul>
            </div>

            <div className="flex justify-end pt-4">
                <button className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
                    Analyser et Mapper
                </button>
            </div>
        </div>
    );
}
