import { redirect } from "next/navigation";

// /bi est la page réelle vers laquelle /login redirige après connexion
// (voir router.push("/bi") dans src/app/login/page.tsx). Ce fichier
// dupliquait intégralement le même Hub de modules — plutôt que de
// maintenir deux copies à faire évoluer en parallèle, /dashboard redirige
// désormais vers la version canonique.
export default function DashboardRedirect() {
    redirect("/bi");
}
