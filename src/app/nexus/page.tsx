import { redirect } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Cette page simulait un centre de commandement Nexus entièrement scripté :
// un flux « live » citant un client fictif (« SOGECOM »), un scénario de
// fusion inventé avec un « Groupe Atlantique » (score 94/100, synergies
// « +450M FCFA »), des KPI globaux fixes (« CA Global 1.2 Md FCFA »,
// « Rétention 98,5 % »), une alerte d'audit chiffrée sans source et un faux
// statut système (« CPU 12 % / MEM 4.2GB »). Rien n'était calculé : les
// réponses de chat étaient choisies par mots-clés, pas générées. /assistant
// utilise déjà le vrai point d'entrée IA (/api/nexus/chat, qui répond
// honnêtement s'il n'est pas configuré). Redirection plutôt que
// reconstruction d'un second assistant scripté.
// ─────────────────────────────────────────────────────────────────────────────

export default function NexusHubRedirect() {
    redirect("/assistant");
}
