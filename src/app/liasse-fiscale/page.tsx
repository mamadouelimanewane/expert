import { redirect } from "next/navigation";

// Doublon dangereux de /comptabilite/liasse-fiscale : reclassait les comptes
// avec une heuristique maison (pas le moteur SYSCOHADA) et ne sauvegardait
// rien. Redirigé vers la version réelle plutôt que corrigé en place.
export default function LiasseFiscaleRedirect() {
    redirect("/comptabilite/liasse-fiscale");
}
