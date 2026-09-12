import Anthropic from "@anthropic-ai/sdk";
import prisma from "./prisma";

/**
 * Moteur de langage de Nexus — Claude (Anthropic) en priorité, DeepSeek en
 * repli.
 *
 * Nexus tournait sur DeepSeek seul. La lecture des documents manuscrits
 * (ocr-vision.ts) utilisant déjà Claude, l'assistant est aligné sur le même
 * fournisseur : une seule clé à gérer, un modèle nettement plus fiable en
 * français juridique et comptable. Sans ANTHROPIC_API_KEY, DEEPSEEK_API_KEY
 * reste utilisée ; sans aucune des deux, chaque route répond qu'elle n'est
 * pas configurée — jamais une réponse inventée.
 *
 * Choix du modèle : ANTHROPIC_MODEL (défaut claude-opus-5) — les données
 * confiées sont celles d'un cabinet d'expertise comptable, la qualité prime
 * sur le coût.
 */

export type FournisseurLLM = "anthropic" | "deepseek";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const MODELE_ANTHROPIC = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export function fournisseurLLM(): FournisseurLLM | null {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  return null;
}

export function isLLMConfigured() {
  return fournisseurLLM() !== null;
}

/** Libellé du fournisseur actif, pour les écrans de paramétrage. */
export function descriptionLLM(): { provider: FournisseurLLM | null; model: string | null; configured: boolean } {
  const provider = fournisseurLLM();
  return {
    provider,
    model: provider === "anthropic" ? MODELE_ANTHROPIC : provider === "deepseek" ? "deepseek-chat" : null,
    configured: provider !== null,
  };
}

/** Message renvoyé par les routes quand aucun moteur n'est configuré. */
export const MESSAGE_LLM_NON_CONFIGURE =
  "L'assistant IA n'est pas connecté à un moteur (ANTHROPIC_API_KEY ou DEEPSEEK_API_KEY manquante).";

/**
 * Construit un résumé factuel et à jour du cabinet (issu de Prisma) à injecter
 * dans le prompt système, pour que Nexus IA réponde sur des données réelles
 * plutôt que d'inventer des chiffres.
 */
export async function buildCabinetContext() {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [clientCount, overdueInvoices, upcomingDeclarations, activeMissions] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.findMany({
      where: { status: "OVERDUE" },
      include: { client: { select: { companyName: true } } },
      take: 10,
    }),
    prisma.taxDeclaration.findMany({
      where: { status: "PENDING", dueDate: { lte: in7Days } },
      include: { client: { select: { companyName: true } } },
      take: 10,
    }),
    prisma.mission.findMany({
      where: { status: "IN_PROGRESS" },
      include: { client: { select: { companyName: true } } },
      take: 10,
    }),
  ]);

  const lines = [
    `Nombre total de clients au cabinet : ${clientCount}.`,
    overdueInvoices.length > 0
      ? `Factures impayées en retard : ${overdueInvoices.map(i => `${i.invoiceNumber} (${i.client.companyName || "client"}, ${i.total.toLocaleString("fr-FR")} FCFA)`).join("; ")}.`
      : "Aucune facture en retard.",
    upcomingDeclarations.length > 0
      ? `Déclarations fiscales dues sous 7 jours : ${upcomingDeclarations.map(d => `${d.type} (${d.client.companyName || "client"}, échéance ${new Date(d.dueDate).toLocaleDateString("fr-FR")})`).join("; ")}.`
      : "Aucune déclaration fiscale urgente sous 7 jours.",
    activeMissions.length > 0
      ? `Missions en cours : ${activeMissions.map(m => `${m.title} (${m.client.companyName || "client"})`).join("; ")}.`
      : "Aucune mission en cours.",
  ];

  return lines.join("\n");
}

// ── Appel bas niveau, indépendant du contexte cabinet ───────────────────────

export interface OptionsCompletion {
  /** Nombre maximal de jetons en sortie (défaut 1024). */
  maxTokens?: number;
  /** Demande une réponse JSON stricte (objet), sans texte autour. */
  json?: boolean;
}

let clientAnthropic: Anthropic | null = null;

/**
 * Envoie un prompt système + un message utilisateur au fournisseur actif et
 * renvoie le texte de la réponse. Lève une erreur si aucun fournisseur n'est
 * configuré — l'appelant doit tester isLLMConfigured() avant.
 */
export async function completer(systeme: string, utilisateur: string, options: OptionsCompletion = {}): Promise<string> {
  const fournisseur = fournisseurLLM();
  const maxTokens = options.maxTokens ?? 1024;

  if (fournisseur === "anthropic") {
    clientAnthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const consigneJson = options.json
      ? "\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans texte ni balise autour."
      : "";
    const reponse = await clientAnthropic.messages.create({
      model: MODELE_ANTHROPIC,
      max_tokens: maxTokens,
      system: systeme + consigneJson,
      messages: [{ role: "user", content: utilisateur }],
    });
    const texte = reponse.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    return options.json ? extraireJson(texte) : texte;
  }

  if (fournisseur === "deepseek") {
    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: maxTokens,
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: systeme },
          { role: "user", content: utilisateur },
        ],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur DeepSeek (${res.status}): ${errText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  throw new Error("Aucun moteur IA configuré (ANTHROPIC_API_KEY ou DEEPSEEK_API_KEY)");
}

/** Isole l'objet JSON d'une réponse qui pourrait l'entourer de texte ou de ```json. */
export function extraireJson(texte: string): string {
  const sansBalises = texte.replace(/```(?:json)?/gi, "").trim();
  const debut = sansBalises.indexOf("{");
  const fin = sansBalises.lastIndexOf("}");
  return debut >= 0 && fin > debut ? sansBalises.slice(debut, fin + 1) : sansBalises;
}

/**
 * Interroge Nexus avec le contexte réel du cabinet. Lève une erreur si aucun
 * fournisseur n'est configuré — l'appelant doit gérer ce cas (voir
 * isLLMConfigured) plutôt que d'inventer une réponse.
 */
export async function askNexus(userMessage: string, systemPreamble: string) {
  if (!isLLMConfigured()) {
    throw new Error("Aucun moteur IA configuré (ANTHROPIC_API_KEY ou DEEPSEEK_API_KEY)");
  }

  const context = await buildCabinetContext();

  return completer(
    `${systemPreamble}\n\nDonnées réelles et à jour du cabinet (n'invente jamais de chiffres en dehors de ce contexte, et dis clairement quand une information n'est pas disponible) :\n${context}`,
    userMessage
  );
}
