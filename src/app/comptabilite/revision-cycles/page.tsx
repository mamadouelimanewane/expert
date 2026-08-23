import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page listait des cycles de révision (Achats, Ventes, Trésorerie…) avec
// un avancement, un nombre d'anomalies et un réviseur nommé — entièrement
// fabriqués — dupliquant ce que /comptabilite/revision fait déjà sur des
// données réelles (AuditSection / AuditChecklistItem, mission de type
// TENUE_COMPTABLE). Redirection plutôt que re-câblage, pour ne pas maintenir
// deux interfaces sur une seule donnée.
// ─────────────────────────────────────────────────────────────────────────────

export default function RevisionCyclesRedirect() {
    redirect("/comptabilite/revision");
}
