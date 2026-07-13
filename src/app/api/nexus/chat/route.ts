import { NextResponse } from "next/server";
import { askNexus, isLLMConfigured } from "@/lib/llm";

const SYSTEM_PROMPT = `Tu es Nexus, l'assistant IA intégré au logiciel Cabinet 360 pour experts-comptables en zone OHADA.
Réponds en français, de façon concise et professionnelle, en te basant sur les données réelles du cabinet fournies ci-dessous.
Si une information n'est pas dans les données fournies, dis-le clairement plutôt que d'inventer un chiffre.`;

export async function POST(req: Request) {
  const body = await req.json();
  const { message } = body;

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  if (!isLLMConfigured()) {
    return NextResponse.json({
      response: "L'assistant Nexus IA n'est pas encore connecté à un moteur d'intelligence artificielle (DEEPSEEK_API_KEY manquante). Consultez directement les modules Fiscalité, Dashboard ou Clients pour vos données réelles.",
      suggestions: ["Voir le Dashboard Dirigeant", "Voir les échéances fiscales", "Voir la fiche client"],
      notConfigured: true,
    });
  }

  try {
    const response = await askNexus(message, SYSTEM_PROMPT);
    return NextResponse.json({ response, suggestions: [] });
  } catch (error) {
    console.error("[Nexus Chat] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'appel à l'assistant IA" }, { status: 500 });
  }
}
