import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
export async function POST(req: Request) {
    const { session, denied } = await requireStaff();
    if (denied) return denied;

  try {
    const { clientId } = await req.json();

    if (!isObjectId(clientId)) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }

    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet" }, { status: 404 });

    // Récupérer les 3 derniers mois de flux validés
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const journals = await prisma.tpeJournal.findMany({
      where: { clientId, cabinetId: session.cabinetId, createdAt: { gte: threeMonthsAgo }, status: "APPROVED", source: { not: "WHATSAPP_TEST" } }
    });

    const totalEntrees = journals.reduce((a, j) => a + j.entree, 0);
    const totalSorties = journals.reduce((a, j) => a + j.sortie, 0);
    const nbJours = journals.length;

    // Calcul du score simple (0-100)
    let score = 50;
    if (nbJours > 50) score += 15;
    if (totalEntrees > 1000000) score += 15;
    if (totalEntrees > totalSorties * 1.3) score += 10;
    if (nbJours > 100) score += 10;
    score = Math.min(100, score);

    const rating = score >= 85 ? "AAA" : score >= 70 ? "A" : score >= 50 ? "B" : "C";

    const indicateurInterne = {
      clientName: client?.companyName || `${client?.firstName} ${client?.lastName}`,
      caTotal3Mois: totalEntrees,
      depenses3Mois: totalSorties,
      beneficeNet: totalEntrees - totalSorties,
      nbEcrituresValidees: nbJours,
      creditScore: score,
      creditRating: rating,
      dateGeneration: new Date().toLocaleDateString("fr-FR"),
      nature: "estimation interne indicative, non normative et non certifiée",
      donneesLimitees: "calculée uniquement sur les écritures approuvées des trois derniers mois",
    };

    return NextResponse.json({ success: true, indicateurInterne });

  } catch (e) {
    console.error("[Credit Score Error]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
