import { NextResponse } from "next/server";
import { askNexus, isLLMConfigured } from "@/lib/llm";
import { requireStaff } from "@/lib/api-auth";
import { OBLIGATIONS_FISCALES } from "@/lib/ohada/obligations-fiscales";

// Nexus Fiscal : assistant IA specialise fiscalite OHADA/UEMOA, ancre sur le
// meme referentiel d'obligations que le module Fiscalite (pas invente),
// et sur les memes donnees reelles du cabinet que l'assistant Nexus general
// (askNexus injecte deja factures/declarations/missions reelles).

const REFERENTIEL = OBLIGATIONS_FISCALES.map(
    (o) => `- ${o.titre} (${o.categorie}, ${o.periodicite.toLowerCase()}, pays: ${o.pays.join("/")}) — ${o.reference}`
).join("\n");

const SYSTEM_PROMPT = `Tu es Nexus Fiscal, l'assistant IA specialise en fiscalite et obligations sociales OHADA/UEMOA du logiciel Cabinet 360.
Reponds en francais, de facon concise et professionnelle, a des questions de collaborateurs experts-comptables.

Referentiel des obligations fiscales et sociales suivies par le cabinet (source de verite pour les echeances et references legales — n'invente jamais une echeance ou un taux qui n'y figure pas) :
${REFERENTIEL}

Si une question porte sur un taux, un bareme ou une regle qui ne figure pas dans ce referentiel ni dans les donnees du cabinet fournies ci-dessous, dis-le clairement et invite a verifier aupres du Code General des Impots du pays concerne plutot que d'inventer un chiffre. Precise systematiquement que ta reponse est une aide a la decision, pas un avis fiscal opposable.`;

export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    if (!isLLMConfigured()) {
        return NextResponse.json({
            response: "Nexus Fiscal n'est pas encore connecté à un moteur d'intelligence artificielle (DEEPSEEK_API_KEY manquante). Consultez directement le calendrier des échéances dans le module Fiscalité.",
            notConfigured: true,
        });
    }

    try {
        const response = await askNexus(message, SYSTEM_PROMPT);
        return NextResponse.json({ response });
    } catch (error) {
        console.error("[Nexus Fiscal] Error:", error);
        return NextResponse.json({ error: "Erreur lors de l'appel à l'assistant IA" }, { status: 500 });
    }
}
