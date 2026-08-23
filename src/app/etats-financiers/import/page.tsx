import Link from 'next/link';
import { ImportBalance } from '@/components/etats-financiers/ImportBalance';

// ─────────────────────────────────────────────────────────────────────────────
// Le fichier déposé restait en état React local (ImportBalance) : rien n'était
// jamais envoyé au serveur, et le bouton "Analyser et Mapper" n'avait aucun
// gestionnaire. Aucun pipeline ne convertit une balance générale importée en
// écritures exploitables par le moteur SYSCOHADA — le bilan et le compte de
// résultat réels sont calculés à partir des écritures du journal (voir
// /comptabilite/liasse-fiscale et /ingest/connectors), pas d'une balance
// importée directement. Le bouton est donc désactivé avec une explication
// plutôt que de simuler une analyse.
// ─────────────────────────────────────────────────────────────────────────────

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

            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <p className="font-semibold">Import de balance non disponible.</p>
                <p className="mt-1">
                    Le bilan et le compte de résultat sont calculés à partir des écritures du journal comptable. Pour
                    importer des transactions, utilisez{" "}
                    <Link href="/ingest/connectors" className="underline font-semibold">
                        Import Wave/CSV
                    </Link>{" "}
                    ou saisissez-les directement, puis générez la liasse depuis{" "}
                    <Link href="/comptabilite/liasse-fiscale" className="underline font-semibold">
                        Liasse Fiscale
                    </Link>
                    .
                </p>
            </div>

            <div className="flex justify-end pt-4">
                <button disabled title="Non implémenté" className="rounded-lg bg-slate-300 px-6 py-2.5 font-semibold text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500">
                    Analyser et Mapper (non disponible)
                </button>
            </div>
        </div>
    );
}
