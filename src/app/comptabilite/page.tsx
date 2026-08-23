import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait trois factures entièrement fabriquées (dont une au nom
// de « Société Ivoirienne de Banque ») avec des KPI fixes (CA facturé,
// encaissé, reste à recouvrer), et son bouton « Payer » ouvrait le vrai
// composant PaymentModal — capable d'appeler /api/payments — avec un
// identifiant de facture inventé (« F-2024-002 ») qui ne correspond à aucune
// facture réelle. /billing fait déjà tout cela sur des factures réelles
// (/api/invoices, KPI agrégés côté serveur, PaymentModal branché sur de
// vrais identifiants). Redirection plutôt que doublon dangereux.
// ─────────────────────────────────────────────────────────────────────────────

export default function ComptabiliteRootRedirect() {
    redirect("/billing");
}
