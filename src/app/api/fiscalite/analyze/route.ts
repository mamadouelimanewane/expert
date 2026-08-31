import { NextResponse } from "next/server";
import { askNexus, isLLMConfigured } from "@/lib/llm";

import { requireStaff } from "@/lib/api-auth";
// Analyse fiscale d'un document fourni par l'utilisateur (contenu texte déjà extrait
// côté client d'un fichier Excel/CSV). Aucune opportunité n'est jamais inventée côté
// serveur : si l'IA n'est pas configurée, on le dit clairement plutôt que de renvoyer
// des données fictives.
const SYSTEM_PROMPT = `Tu es Nexus Fiscal, un assistant d'analyse fiscale pour un cabinet d'expertise comptable en zone OHADA.
On te fournit un extrait (texte ou tableau converti en texte) d'un document fiscal ou comptable déposé par l'utilisateur.
Analyse ce contenu et identifie, de façon structurée (titres, listes), des opportunités d'optimisation fiscale et des risques potentiels de redressement, avec une estimation d'impact chiffrée UNIQUEMENT si elle peut être déduite des données fournies (ne jamais inventer de montant).
Précise explicitement que chaque point doit être vérifié par l'expert-comptable avant toute décision, et indique clairement si le document ne contient pas assez d'information pour une analyse fiable.
Réponds en français.`;

export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

  // `await req.json()` etait hors du try : un corps mal forme remontait en
  // exception non capturee, donc en 500 generique de Next.
  let body: { content?: unknown; fileName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const { content, fileName } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Contenu du document requis" }, { status: 400 });
  }

  if (!isLLMConfigured()) {
    return NextResponse.json({
      response: "Intégration IA non configurée (DEEPSEEK_API_KEY manquante). Aucune analyse automatique du document n'est disponible.",
      notConfigured: true,
    });
  }

  try {
    const userMessage = `Fichier déposé : ${fileName || "document"}\n\nContenu extrait (tronqué si volumineux) :\n${content.slice(0, 12000)}`;
    const response = await askNexus(userMessage, SYSTEM_PROMPT);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("[Fiscalite Analyze] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'appel à l'assistant IA" }, { status: 500 });
  }
}
