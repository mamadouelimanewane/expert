import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page présentait des transactions frauduleuses fabriquées — entités
// fictives, mais accusations précises (« même adresse que l'employé »,
// « écart Loi de Benford ») avec un score de risque inventé.
//
// /audit/fraud-detection fait déjà exactement ce que cette page prétendait
// faire, sur les alertes réelles (FraudAlert). Trois pages (celle-ci,
// /audit/intelligence et la page /audit elle-même) redirigent vers cette
// seule implémentation réelle plutôt que de maintenir trois interfaces
// fictives à côté d'elle.
// ─────────────────────────────────────────────────────────────────────────────

export default function ForensicAuditRedirect() {
    redirect("/audit/fraud-detection");
}
