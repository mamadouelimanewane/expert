import prisma from "./prisma";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export function isLLMConfigured() {
  return !!process.env.DEEPSEEK_API_KEY;
}

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

/**
 * Interroge DeepSeek avec le contexte réel du cabinet. Lève une erreur si
 * DEEPSEEK_API_KEY n'est pas configurée — l'appelant doit gérer ce cas
 * (voir isLLMConfigured) plutôt que d'inventer une réponse.
 */
export async function askNexus(userMessage: string, systemPreamble: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY non configurée");
  }

  const context = await buildCabinetContext();

  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `${systemPreamble}\n\nDonnées réelles et à jour du cabinet (n'invente jamais de chiffres en dehors de ce contexte, et dis clairement quand une information n'est pas disponible) :\n${context}`,
        },
        { role: "user", content: userMessage },
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
