import { redirect } from "next/navigation";

// Doublon orphelin de /training/academy (memes donnees reelles, mais
// boutons Continuer/Commencer/Revoir sans onClick). Redirige vers la
// version reelle plutot que corrige en place.
export default function AcademyLmsRedirect() {
    redirect("/training/academy");
}
