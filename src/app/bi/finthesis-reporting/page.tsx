import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait un tableau de bord visuel (CA, marge, EBE, trésorerie,
// pont de trésorerie, commentaire « expert ») entièrement fabriqué pour une
// société fictive « Global Tech Solutions » — mêmes chiffres et même mise en
// récit à chaque ouverture, sans lien vers aucun client réel. Elle
// duplique ce que /comptabilite/reporting fait déjà à partir du bilan et du
// compte de résultat réellement calculés (/api/comptabilite/etats-financiers)
// pour un client choisi. Redirection plutôt que re-câblage d'une seconde
// interface sur la même donnée.
// ─────────────────────────────────────────────────────────────────────────────

export default function FinthesisReportingRedirect() {
    redirect("/comptabilite/reporting");
}
