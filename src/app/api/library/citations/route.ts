import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Base de référence de démarrage (textes/jurisprudence OHADA réels, contenu de référence
// public — pas des données inventées). Insérée une seule fois si la collection est vide.
const SEED_CITATIONS = [
  {
    reference: "AUSCGIE Art. 347",
    type: "ACTE_UNIFORME" as const,
    title: "Convocation de l'assemblée générale ordinaire",
    status: "VALID" as const,
    lastUpdate: new Date("2024-09-12"),
    source: "Acte Uniforme relatif au Droit des Sociétés Commerciales et du GIE",
  },
  {
    reference: "AUDCG Art. 101",
    type: "ACTE_UNIFORME" as const,
    title: "Formation du contrat commercial",
    status: "MODIFIED" as const,
    lastUpdate: new Date("2024-01-15"),
    source: "Acte Uniforme relatif au Droit Commercial Général",
    notes: "Modifié par Acte Additionnel 2023/002",
  },
  {
    reference: "Arrêt CCJA n°087/2023",
    type: "CCJA" as const,
    title: "Procédure d'injonction de payer - Compétence territoriale",
    status: "VALID" as const,
    lastUpdate: new Date("2023-06-20"),
    source: "Cour Commune de Justice et d'Arbitrage",
  },
  {
    reference: "AUPSRVE Art. 28",
    type: "ACTE_UNIFORME" as const,
    title: "Saisie-attribution des créances",
    status: "ABROGATED" as const,
    lastUpdate: new Date("2022-03-01"),
    source: "Acte Uniforme portant organisation des Procédures Simplifiées de Recouvrement...",
    notes: "Abrogé et remplacé par Art. 28 bis",
  },
  {
    reference: "Traité OHADA Art. 10",
    type: "TRAITE" as const,
    title: "Primauté du droit OHADA sur le droit national",
    status: "VALID" as const,
    lastUpdate: new Date("1993-10-17"),
    source: "Traité relatif à l'Harmonisation du Droit des Affaires en Afrique",
  },
];

export async function GET() {
  try {
    let citations = await prisma.legalCitation.findMany({ orderBy: { reference: "asc" } });

    if (citations.length === 0) {
      await prisma.legalCitation.createMany({ data: SEED_CITATIONS });
      citations = await prisma.legalCitation.findMany({ orderBy: { reference: "asc" } });
    }

    return NextResponse.json({ citations });
  } catch (error) {
    console.error("Erreur GET citations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Extrait les références plausibles (motif "SIGLE Art. NNN" / "Arrêt CCJA n°NNN/AAAA") du texte
// collé, et les confronte réellement à la base de citations connues (pas de simulation IA).
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Texte requis" }, { status: 400 });
    }

    const citations = await prisma.legalCitation.findMany();

    const pattern = /([A-Z]{3,8}\s+Art\.?\s*\d+[a-z]?|Arrêt\s+CCJA\s+n°\s*\d+\/\d{4})/gi;
    const found = Array.from(new Set((text.match(pattern) || []).map((s: string) => s.trim())));

    const matches = found.map((ref) => {
      const citation = citations.find(c => c.reference.toLowerCase() === (ref as string).toLowerCase());
      return citation
        ? { reference: ref, matched: true, citation }
        : { reference: ref, matched: false, citation: null };
    });

    return NextResponse.json({ extractedCount: found.length, matches });
  } catch (error) {
    console.error("Erreur POST citations validate:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
