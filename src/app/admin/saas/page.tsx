"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ============================================================
// /admin/saas — Tableau de bord administrateur SaaS Cabinet 360
// Visible uniquement par les utilisateurs avec le rôle ADMIN.
// Affiche : cabinets inscrits, statuts, plans, MRR estimé.
// ============================================================

type SaasPlan   = "STARTER" | "PRO" | "ENTERPRISE";
type SaasStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

interface CabinetRow {
  id:               string;
  slug:             string;
  nom:              string;
  plan:             SaasPlan;
  statut:           SaasStatus;
  pays:             string;
  trialExpiresAt:   string | null;
  lastPaidAt:       string | null;
  lastPaidMonths:   number | null;
  maxDossiers:      number;
  maxCollaborateurs: number;
  utilisateurs:     number;
  createdAt:        string;
}

const TARIFS: Record<SaasPlan, number> = {
  STARTER:    49_000,
  PRO:        129_000,
  ENTERPRISE: 289_000,
};

const STATUT_BADGE: Record<SaasStatus, { label: string; classes: string }> = {
  TRIAL:     { label: "Essai",    classes: "bg-amber-100 text-amber-800 border border-amber-200" },
  ACTIVE:    { label: "Actif",    classes: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  PAST_DUE:  { label: "Impayé",   classes: "bg-red-100 text-red-800 border border-red-200" },
  CANCELLED: { label: "Annulé",   classes: "bg-gray-100 text-gray-600 border border-gray-200" },
};

const PLAN_BADGE: Record<SaasPlan, string> = {
  STARTER:    "bg-blue-50 text-blue-700 border border-blue-200",
  PRO:        "bg-purple-50 text-purple-700 border border-purple-200",
  ENTERPRISE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-SN").format(n) + " FCFA";
}

function dateLocale(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-SN");
}

export default function AdminSaasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cabinets,  setCabinets]  = useState<CabinetRow[]>([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Rediriger si non ADMIN
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session as any).user?.role !== "ADMIN") {
      router.push("/bi");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/cabinets?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setCabinets(data.cabinets || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError("Impossible de charger les cabinets."))
      .finally(() => setLoading(false));
  }, [status]);

  // Calculer le MRR estimé sur les abonnements actifs
  const mrrEstime = cabinets
    .filter((c) => c.statut === "ACTIVE")
    .reduce((sum, c) => sum + TARIFS[c.plan], 0);

  const nbActifs = cabinets.filter((c) => c.statut === "ACTIVE").length;
  const nbEssai  = cabinets.filter((c) => c.statut === "TRIAL").length;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-emerald-700 text-white px-6 py-5 flex items-center justify-between shadow">
        <div>
          <h1 className="text-xl font-bold">🏢 Tableau de bord SaaS</h1>
          <p className="text-emerald-200 text-sm mt-0.5">Administration Cabinet 360 — Abonnements &amp; Tenants</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/bi"
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            ← Tableau de bord
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">{error}</div>
        )}

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total cabinets", value: total,      icon: "🏢", color: "text-gray-700" },
            { label: "Actifs",         value: nbActifs,   icon: "✅", color: "text-emerald-700" },
            { label: "En essai",       value: nbEssai,    icon: "⏳", color: "text-amber-700" },
            { label: "MRR estimé",     value: fmt(mrrEstime), icon: "💰", color: "text-purple-700" },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Tableau des cabinets */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Cabinets inscrits ({total})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Cabinet", "Plan", "Statut", "Pays", "Utilisateurs", "Essai expire", "Dernier paiement", "Inscrit le"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cabinets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      Aucun cabinet inscrit pour le moment.
                    </td>
                  </tr>
                )}
                {cabinets.map((c) => {
                  const statut = STATUT_BADGE[c.statut];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 truncate max-w-[180px]">{c.nom}</div>
                        <div className="text-xs text-gray-400">{c.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_BADGE[c.plan]}`}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statut.classes}`}>
                          {statut.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.pays}</td>
                      <td className="px-4 py-3 text-center text-gray-700 font-medium">{c.utilisateurs}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dateLocale(c.trialExpiresAt)}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dateLocale(c.lastPaidAt)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateLocale(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <h3 className="mb-2 font-semibold">Création de démonstration suspendue</h3>
          <p>Le compte partagé avait un rôle avec accès en écriture. Il restera désactivé jusqu&apos;à la livraison d&apos;un tenant de démonstration isolé et en lecture seule.</p>
        </div>
      </main>
    </div>
  );
}
