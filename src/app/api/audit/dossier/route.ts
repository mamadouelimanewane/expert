import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_SECTIONS = [
  "Trésorerie",
  "Immobilisations",
  "Stocks",
  "Créances clients",
  "Dettes fournisseurs",
  "Capitaux propres",
  "Fiscalité",
  "Paie",
  "Achèvements",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get("missionId");

    const mission = missionId
      ? await prisma.mission.findUnique({
          where: { id: missionId },
          include: { client: { select: { companyName: true, firstName: true, lastName: true } }, assignedTo: { select: { firstName: true, lastName: true } } },
        })
      : await prisma.mission.findFirst({
          where: { type: "AUDIT" },
          include: { client: { select: { companyName: true, firstName: true, lastName: true } }, assignedTo: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: "desc" },
        });

    if (!mission) {
      return NextResponse.json({ error: "Aucune mission d'audit trouvée. Créez une mission de type AUDIT." }, { status: 404 });
    }

    let sections = await prisma.auditSection.findMany({
      where: { missionId: mission.id },
      orderBy: { order: "asc" },
      include: { items: true },
    });

    // Bootstrap : première ouverture du dossier pour cette mission, on crée les sections
    // standard (programme vide, à compléter par l'auditeur) — pas de constats fabriqués.
    if (sections.length === 0) {
      await prisma.auditSection.createMany({
        data: DEFAULT_SECTIONS.map((name, i) => ({ name, order: i, missionId: mission.id })),
      });
      sections = await prisma.auditSection.findMany({
        where: { missionId: mission.id },
        orderBy: { order: "asc" },
        include: { items: true },
      });
    }

    const sectionsOut = sections.map((s) => {
      const total = s.items.length;
      const done = s.items.filter((i) => i.status === "TERMINE").length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      return { id: s.id, name: s.name, progress, conclusion: s.conclusion, note: s.note };
    });

    const globalProgress = sectionsOut.length > 0
      ? Math.round(sectionsOut.reduce((sum, s) => sum + s.progress, 0) / sectionsOut.length)
      : 0;

    const checklists: Record<string, any[]> = {};
    for (const s of sections) {
      checklists[s.id] = s.items.map((i) => ({
        id: i.id,
        description: i.description,
        assertion: i.assertion,
        status: i.status,
        ref: i.ref,
        comment: i.comment,
      }));
    }

    return NextResponse.json({
      globalProgress,
      mission: {
        id: mission.id,
        name: mission.title,
        client: mission.client.companyName || `${mission.client.firstName ?? ""} ${mission.client.lastName ?? ""}`.trim(),
        auditor: mission.assignedTo ? `${mission.assignedTo.firstName} ${mission.assignedTo.lastName}` : "Non assigné",
        date: mission.deadline ? mission.deadline.toISOString() : null,
      },
      sections: sectionsOut,
      checklists,
    });
  } catch (error) {
    console.error("Erreur GET audit/dossier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Enregistre la conclusion d'une section
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sectionId, conclusion, note } = body;

    if (!sectionId) {
      return NextResponse.json({ error: "sectionId requis" }, { status: 400 });
    }

    const section = await prisma.auditSection.update({
      where: { id: sectionId },
      data: {
        ...(conclusion !== undefined && { conclusion }),
        ...(note !== undefined && { note }),
      },
    });

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error("Erreur POST audit/dossier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Met à jour un item de checklist (statut, référence, commentaire)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { itemId, status, ref, comment } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId requis" }, { status: 400 });
    }

    const item = await prisma.auditChecklistItem.update({
      where: { id: itemId },
      data: {
        ...(status !== undefined && { status }),
        ...(ref !== undefined && { ref }),
        ...(comment !== undefined && { comment }),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Erreur PATCH audit/dossier:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
