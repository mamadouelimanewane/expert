import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page allait plus loin que les autres écrans de démonstration : elle
// associait des ENTREPRISES RÉELLES ET IDENTIFIABLES — Société Ivoirienne de
// Banque, Orange Sénégal, CFAO Motors — à des transactions frauduleuses
// fabriquées avec des scores de risque critiques (95/100, « compte personnel
// détecté », « absence de PV AG »). Publier une accusation de fraude nommant
// une entreprise réelle, même dans un outil de démonstration, est le contenu
// le plus dangereux rencontré dans cette base de code.
//
// /audit/fraud-detection fait la même chose sur des données réelles. Trois
// pages (celle-ci, /audit/forensic et la page /audit elle-même) redirigent
// vers cette seule implémentation réelle plutôt que de maintenir trois
// interfaces fictives à côté d'elle.
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditIntelligenceRedirect() {
    redirect("/audit/fraud-detection");
}
