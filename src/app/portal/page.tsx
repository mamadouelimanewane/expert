import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page affichait un espace client entièrement fictif, sans aucune
// lecture de token : nom de société fabriqué (« Société Ivoirienne de
// Banque », déjà rencontré comme fabrication ailleurs dans l'application),
// identifiant client inventé, chiffres et documents statiques. Elle n'était
// reliée depuis aucune autre page de l'application (aucun lien interne ne
// pointe vers /portal) — un prototype orphelin antérieur au vrai système de
// portail par token.
//
// /portal/dashboard est l'implémentation réelle : elle lit ?token=, appelle
// /api/portal/[token] et affiche un message explicite si le token est
// absent ou invalide. Redirection plutôt que re-câblage, pour ne pas
// maintenir deux points d'entrée sur la même donnée.
// ─────────────────────────────────────────────────────────────────────────────

export default async function PortalRootRedirect({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;
    redirect(token ? `/portal/dashboard?token=${encodeURIComponent(token)}` : "/portal/dashboard");
}
