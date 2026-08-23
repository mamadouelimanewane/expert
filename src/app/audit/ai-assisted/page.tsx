import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page ne faisait aucun appel réseau : quatre KPI fixes (« 98,5 % de
// conformité », « 14 anomalies »), une cartographie des risques par cycle à
// pourcentages inventés, de fausses investigations (loi de Benford, doublons
// de factures à 4 560 000 FCFA, écritures du dimanche soir) — et surtout
// affirmait « Vous collaborez avec Grant Thornton sur ce dossier » (un
// cabinet d'audit réel), une fausse relation professionnelle présentée comme
// un fait. /audit/fraud-detection fait déjà ce que le bouton « Lancer Scan IA
// Final » prétendait faire, sur de vraies alertes (modèle FraudAlert,
// /api/audit/fraud-alerts). Redirection plutôt que reconstruction d'un
// second scanner factice.
// ─────────────────────────────────────────────────────────────────────────────

export default function AIAssistedAuditRedirect() {
    redirect("/audit/fraud-detection");
}
