import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function CabinetIndisponiblePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-8 shadow-lg dark:border-amber-900 dark:bg-slate-900">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <ShieldAlert aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold">Espace cabinet temporairement suspendu</h1>
        <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
          Nous renforçons l&apos;isolation des dossiers entre cabinets avant de rétablir l&apos;accès à cet espace. Vos identifiants restent valides, mais les données de cabinet ne sont pas accessibles pendant cette opération.
        </p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Cette suspension protège les informations comptables et les pièces des clients. Elle ne signifie pas que vos données ont été supprimées.
        </p>
        <Link href="/login" className="mt-7 inline-flex rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">
          Retour à la connexion
        </Link>
      </section>
    </main>
  );
}
