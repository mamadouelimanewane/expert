import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { askNexus, isLLMConfigured, MESSAGE_LLM_NON_CONFIGURE } from "@/lib/llm";
import { requireStaff } from "@/lib/api-auth";

// Veille reglementaire assistee par IA.
//
// Aucun flux de veille legale externe (OHADA.org, journaux officiels
// nationaux) n'expose de RSS/API automatisable — recherche faite, aucune
// source fiable trouvee. Plutot qu'une fausse "detection automatique" de
// nouvelles lois, ce module aide le collaborateur a analyser MANUELLEMENT
// un texte qu'il a lui-meme repere (loi, decret, circulaire) : il colle le
// texte, l'IA en resume l'impact potentiel sur le portefeuille reel.

export async function POST(req: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const body = await req.json();
    const { texteLoi, pays } = body as { texteLoi?: string; pays?: string };

    if (!texteLoi || typeof texteLoi !== "string" || texteLoi.trim().length < 20) {
        return NextResponse.json({ error: "Collez le texte de la loi, du décret ou de la circulaire à analyser (20 caractères minimum)." }, { status: 400 });
    }

    if (!isLLMConfigured()) {
        return NextResponse.json({
            response: `${MESSAGE_LLM_NON_CONFIGURE}`,
            notConfigured: true,
        });
    }

    try {
        const repartitionParPays = await prisma.client.groupBy({
            by: ["country"],
            _count: { _all: true },
            where: { isActive: true },
        });
        const repartition = repartitionParPays
            .map((r) => `${r.country || "pays non renseigné"} : ${r._count._all} client(s)`)
            .join(", ");

        const systemPrompt = `Tu es Nexus Veille, l'assistant IA d'aide à l'analyse réglementaire du logiciel Cabinet 360 (experts-comptables OHADA/UEMOA).
Un collaborateur te soumet un texte de loi, décret ou circulaire qu'il a lui-même repéré (aucune veille automatique n'est connectée).

Répartition réelle du portefeuille de clients actifs par pays : ${repartition || "aucun client actif enregistré"}.

Analyse le texte fourni et réponds en français, en résumant :
1. La nature du changement réglementaire (impôt/taxe concerné, régime, date d'entrée en vigueur si mentionnée).
2. Le pays ou les pays de la zone OHADA/UEMOA concernés.
3. Un ordre de grandeur du nombre de clients du cabinet potentiellement concernés, basé UNIQUEMENT sur la répartition par pays ci-dessus — jamais un chiffre précis par secteur ou par régime fiscal individuel, que tu ne peux pas connaître. Dis explicitement que ceci est une estimation indicative, pas un recensement exact (le secteur d'activité et le régime fiscal de chaque client ne te sont pas fournis).
4. Les actions concrètes que le cabinet devrait envisager (vérification de dossiers, information des clients concernés, mise à jour de paramétrage).
Ne recommande jamais d'envoyer une notification automatique : le cabinet décide et agit lui-même.`;

        const question = pays
            ? `Pays concerné selon le collaborateur : ${pays}.\n\nTexte à analyser :\n${texteLoi}`
            : `Texte à analyser :\n${texteLoi}`;

        const response = await askNexus(question, systemPrompt);
        return NextResponse.json({ response });
    } catch (error) {
        console.error("[Nexus Veille] Error:", error);
        return NextResponse.json({ error: "Erreur lors de l'analyse." }, { status: 500 });
    }
}
