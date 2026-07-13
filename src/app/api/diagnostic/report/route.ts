import { NextResponse } from "next/server";
import { askNexus, isLLMConfigured } from "@/lib/llm";

const SYSTEM_PROMPT = `Tu es Nexus, l'assistant IA de diagnostic financier de Cabinet 360 pour experts-comptables en zone OHADA.
On te fournit le résultat structuré (JSON) d'un diagnostic financier déjà calculé (score global, sections avec scores/constats/recommandations, évolution pluriannuelle).
Ta tâche : rédiger un rapport narratif professionnel en français, structuré, basé STRICTEMENT sur les chiffres et constats fournis. N'invente aucun chiffre absent des données fournies.
Réponds UNIQUEMENT avec un objet JSON valide, sans balise markdown ni texte autour, avec exactement ces clés (chaînes de texte) :
executiveSummary, structureAnalysis, performanceAnalysis, complianceAnalysis, treasuryAnalysis, projections, conclusion.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, diagnostic } = body;

    if (!clientName || !diagnostic) {
      return NextResponse.json({ error: "clientName et diagnostic requis" }, { status: 400 });
    }

    if (!isLLMConfigured()) {
      return NextResponse.json(
        { error: "Génération IA non configurée (DEEPSEEK_API_KEY manquante).", notConfigured: true },
        { status: 503 }
      );
    }

    const userMessage = `Rédige le rapport de diagnostic financier pour le client "${clientName}".\n\nDonnées du diagnostic (JSON, ne pas inventer d'autres chiffres) :\n${JSON.stringify(diagnostic)}`;

    const raw = await askNexus(userMessage, SYSTEM_PROMPT);
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");

    let report;
    try {
      report = JSON.parse(cleaned);
    } catch {
      console.error("[Diagnostic Report] Réponse IA non-JSON:", raw);
      return NextResponse.json({ error: "Réponse IA non structurée, veuillez réessayer." }, { status: 502 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("[Diagnostic Report] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération du rapport IA" }, { status: 500 });
  }
}
