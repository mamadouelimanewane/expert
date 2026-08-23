import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait un solde de trésorerie fixe (42 500 000 FCFA) et des
// prévisions/entrées-sorties nommant des entités fictives (« SOCIETE
// IVOIRIENNE BANQUE », « TECHSTART INNOVATION », « ORANGE SENEGAL »,
// « MASSAR & CO », « TRAORE IMPORT ») présentées comme des transactions
// réelles à venir. /analysis/cash-forecast couvre déjà ce même besoin à
// partir de données réelles (solde bancaire agrégé, factures clients
// réellement impayées — voir son API pour le détail). Redirection plutôt
// que reconstruction d'une seconde prévision de trésorerie fabriquée.
// ─────────────────────────────────────────────────────────────────────────────

export default function CashFlowPredictiveRedirect() {
    redirect("/analysis/cash-forecast");
}
