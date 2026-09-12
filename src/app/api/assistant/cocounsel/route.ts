import { NextResponse } from "next/server";
import { askNexus, isLLMConfigured, MESSAGE_LLM_NON_CONFIGURE } from "@/lib/llm";

import { requireStaff } from "@/lib/api-auth";
// Nexus Counsel s'appuie sur les connaissances générales du modèle DeepSeek, PAS sur une
// base documentaire OHADA/jurisprudence CCJA vérifiée et à jour en temps réel. Toute
// référence d'article ou de jurisprudence doit donc être systématiquement recoupée par
// l'utilisateur avant d'être utilisée dans un acte juridique.
const SYSTEM_PROMPT = `Tu es Nexus Counsel, un assistant de recherche juridique et fiscale pour un cabinet d'expertise comptable en zone OHADA (Actes Uniformes, droit fiscal UEMOA).
Réponds en français, de façon structurée (titres, listes).
IMPORTANT : tu n'as pas accès à une base documentaire OHADA vérifiée en temps réel. Si tu cites un article ou une jurisprudence, précise explicitement que la référence doit être vérifiée par l'utilisateur avant usage professionnel — ne présente jamais une citation comme certaine.`;

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
      response: `${MESSAGE_LLM_NON_CONFIGURE} Aucune réponse juridique ne peut être générée pour l'instant.`,
      notConfigured: true,
    });
  }

  try {
    const response = await askNexus(message, SYSTEM_PROMPT);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("[Cocounsel] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'appel à l'assistant IA" }, { status: 500 });
  }
}
