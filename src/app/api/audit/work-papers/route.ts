import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";

// Cahier de travail generique, persiste par client et par type d'outil
// (PREP_KIT, CAC_SUITE...). Le contenu (seuils, risques, procedures...) est
// stocke tel quel en JSON : la structure exacte differe par outil et reste
// definie cote page, pas ici.

const TYPES_AUTORISES = ["PREP_KIT", "CAC_SUITE", "UEMOA_SCORE", "RSE_ESG"];

export async function GET(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const type = searchParams.get("type");

    if (!clientId || !type || !TYPES_AUTORISES.includes(type)) {
      return NextResponse.json({ error: "clientId et type (valide) requis" }, { status: 400 });
    }

    const workPaper = await prisma.workPaper.findUnique({
      where: { clientId_type: { clientId, type } },
    });

    return NextResponse.json({ data: workPaper?.data ?? null });
  } catch (error) {
    console.error("Erreur GET audit/work-papers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { clientId, type, data } = body;

    if (!clientId || !type || !TYPES_AUTORISES.includes(type) || data === undefined) {
      return NextResponse.json({ error: "clientId, type (valide) et data requis" }, { status: 400 });
    }

    const workPaper = await prisma.workPaper.upsert({
      where: { clientId_type: { clientId, type } },
      update: { data },
      create: { clientId, type, data },
    });

    return NextResponse.json({ data: workPaper.data });
  } catch (error) {
    console.error("Erreur PUT audit/work-papers:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
