import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page ne réagissait à aucune saisie : le champ « Cible » affichait
// systématiquement « Société Agro-Industrielle X », les curseurs (prime
// d'acquisition, synergies, coût de la dette) n'étaient reliés à rien, et le
// bouton « Recalculer l'impact » n'avait aucun gestionnaire — les résultats
// (« Valeur de l'Entité Fusionnée 8.4B », « Accrétion +12.4% », « Confiance
// IA: 92% »…) étaient fixes quel que soit le scénario. Aucun moteur de
// synergie de fusion/acquisition n'existe dans l'application
// (src/lib/valuation-engine.ts ne calcule que DCF, multiple d'EBITDA et ANR).
// /valorisation/transmission propose déjà ces trois méthodes sur des saisies
// utilisateur réellement prises en compte. Redirection plutôt que
// reconstruction d'un simulateur de fusion qui n'a pas d'équivalent réel.
// ─────────────────────────────────────────────────────────────────────────────

export default function InvestmentRedirect() {
    redirect("/valorisation/transmission");
}
