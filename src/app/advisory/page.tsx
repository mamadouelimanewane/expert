import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait un score de santé fixe (82/100), une « Analyse IA »
// rédigée à l'avance, trois recommandations à gains chiffrés inventés, quatre
// KPI fixes et un graphique de trésorerie simulé — pour un sélecteur limité à
// deux clients fictifs (« Société Ivoirienne de Banque », « Traoré
// Import-Export »). /comptabilite/health-report couvre déjà le score de
// santé sur le portefeuille réel (/api/clients/[id]/health-score), avec
// historique et recalcul réels. Redirection plutôt que reconstruction d'un
// second tableau de bord partiellement redondant.
// ─────────────────────────────────────────────────────────────────────────────

export default function AdvisoryRedirect() {
    redirect("/comptabilite/health-report");
}
