"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Banknote, BriefcaseBusiness, CalendarClock, CheckCircle2, CircleAlert, Globe2, Landmark, Loader2, ReceiptText, ShieldCheck, Users } from "lucide-react";
import type { RegionalCapability } from "@/lib/regional-capabilities";

type Dashboard = {
  asOf: string;
  cabinet: { name: string; countryCode: string; countryName: string };
  metrics: {
    activeClients: number;
    activeMissions: number;
    overdueTasks: number;
    pendingInvoices: number;
    overdueAmount: number;
    pendingBankTransactions: number;
    openYearEndCloses: number;
    pendingCloseItems: number;
  };
  capabilities: RegionalCapability[];
};

const numberFormat = new Intl.NumberFormat("fr-FR");
const moneyFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

const statusStyle: Record<RegionalCapability["state"], string> = {
  "Disponible dans le code": "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  Partiel: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  "Non connecté": "border-slate-400/20 bg-slate-400/10 text-slate-200",
  "À cadrer": "border-violet-400/20 bg-violet-400/10 text-violet-200",
};

export default function RegionalisationPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/regionalisation/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Chargement indisponible.");
        if (active) setData(payload as Dashboard);
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Chargement indisponible."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const m = data?.metrics;
  const cards = [
    { label: "Clients actifs", value: m?.activeClients, href: "/clients", icon: Users, hint: "Portefeuille du cabinet" },
    { label: "Missions en cours", value: m?.activeMissions, href: "/missions", icon: BriefcaseBusiness, hint: "À planifier et superviser" },
    { label: "Tâches en retard", value: m?.overdueTasks, href: "/inbox", icon: CalendarClock, hint: "À réaffecter ou relancer", alert: Boolean(m?.overdueTasks) },
    { label: "Factures ouvertes", value: m?.pendingInvoices, href: "/billing", icon: ReceiptText, hint: `${moneyFormat.format(m?.overdueAmount ?? 0)} FCFA échus`, alert: Boolean(m?.pendingInvoices) },
    { label: "Mouvements à traiter", value: m?.pendingBankTransactions, href: "/banking", icon: Banknote, hint: "Relevés importés, sans auto-lettrage" },
    { label: "Clôtures annuelles ouvertes", value: m?.openYearEndCloses, href: "/comptabilite/cloture-annuelle", icon: ShieldCheck, hint: `${numberFormat.format(m?.pendingCloseItems ?? 0)} contrôles en attente` },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-7 text-white shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-12 opacity-10"><Globe2 className="h-64 w-64" /></div>
        <div className="relative max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Cabinet 360 · EMOA</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Cockpit de synchronisation</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Un point d’entrée pour relier le portefeuille, les missions, la clôture, les encaissements et les capacités régionales déjà présentes dans l’application.
          </p>
          {data && <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200"><Landmark className="h-4 w-4 text-cyan-300" />{data.cabinet.name} · {data.cabinet.countryName} ({data.cabinet.countryCode})</p>}
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}

      <section aria-labelledby="operations-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">Données du cabinet</p><h2 id="operations-heading" className="mt-1 text-2xl font-black">Priorités opérationnelles</h2></div>
          {data && <p className="text-right text-xs text-slate-500">Mis à jour {new Date(data.asOf).toLocaleString("fr-FR")}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, href, icon: Icon, hint, alert }) => (
            <Link key={label} href={href} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4"><span className={`rounded-2xl p-3 ${alert ? "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" : "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/10 dark:text-cyan-300"}`}><Icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-cyan-500" /></div>
              <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-1 text-3xl font-black tabular-nums">{loading ? <Loader2 className="h-8 w-8 animate-spin text-slate-400" /> : numberFormat.format(value ?? 0)}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="coverage-heading" className="space-y-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">Capacités et connecteurs</p><h2 id="coverage-heading" className="mt-1 text-2xl font-black">Couverture du pays sélectionné</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">Les statuts décrivent les modules et intégrations recensés dans le dépôt. Ils ne certifient ni la conformité réglementaire, ni la connexion à un établissement externe.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {(data?.capabilities ?? []).map((capability) => (
            <article key={capability.id} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-bold">{capability.name}</h3><span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusStyle[capability.state]}`}>{capability.state}</span></div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{capability.summary}</p>
              <Link href={capability.href} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:underline dark:text-cyan-300">Ouvrir le module <ArrowRight className="h-3.5 w-3.5" /></Link>
            </article>
          ))}
        </div>
        {!data && !loading && <p className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">Aucune capacité à afficher.</p>}
      </section>

      <section className="rounded-3xl border border-amber-300/50 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-100">
        <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Règle d’intégration :</strong> les suggestions d’audit, de rapprochement et d’IA restent des aides à la décision. Les paiements réels, déclarations et écritures nécessitent une validation explicite et une preuve liée au dossier.</p></div>
      </section>
    </main>
  );
}
