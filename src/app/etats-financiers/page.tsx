import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait un « Total Bilan » et un « Résultat Net » fixes, un
// workflow de clôture à dates figées et une alerte « 3 Comptes non mappés »
// présentée comme un diagnostic réel, sans qu'aucune donnée n'ait été
// chargée. /comptabilite/liasse-fiscale calcule déjà le bilan et le compte
// de résultat à partir d'une balance réellement importée
// (/api/comptabilite/etats-financiers/{bilan,resultat}). Redirection plutôt
// que reconstruction d'un second tableau de clôture fabriqué.
// ─────────────────────────────────────────────────────────────────────────────

export default function EtatsFinanciersRedirect() {
    redirect("/comptabilite/liasse-fiscale");
}
