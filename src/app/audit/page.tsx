import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page (liée depuis la barre latérale sous « Audit & CAC » et « Audit IA
// — FEC Analyzer ») affichait quatre dossiers clients fabriqués avec des
// scores de conformité inventés (85, 96, 61, 44/100) et des anomalies
// comptables précises attribuées à des niveaux de confiance chiffrés
// (98 %, 91 %, 100 %) : doublons suspects, TVA incohérente, chèques sans
// provision, retards IPRES — aucune de ces analyses n'avait réellement eu
// lieu.
//
// /audit/fraud-detection fait exactement ce que cette page prétendait faire,
// sur des alertes réelles (FraudAlert, générées par un scan des transactions
// bancaires : dimanche, montant rond, montant atypique). Redirection plutôt
// que re-câblage, pour converger vers une seule implémentation réelle au lieu
// d'en maintenir plusieurs fictives.
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditRedirect() {
    redirect("/audit/fraud-detection");
}
