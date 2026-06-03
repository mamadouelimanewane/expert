import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }

    // Récupérer les 3 derniers mois de flux validés
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const journals = await prisma.tpeJournal.findMany({
      where: { clientId, createdAt: { gte: threeMonthsAgo }, status: "APPROVED" }
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

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    const attestation = {
      clientName: client?.companyName || `${client?.firstName} ${client?.lastName}`,
      caTotal3Mois: totalEntrees,
      depenses3Mois: totalSorties,
      beneficeNet: totalEntrees - totalSorties,
      nbEcrituresValidees: nbJours,
      creditScore: score,
      creditRating: rating,
      dateGeneration: new Date().toLocaleDateString("fr-FR"),
      validePar: "Cabinet Expert-Comptable 360",
    };

    return NextResponse.json({ success: true, attestation });

  } catch (e) {
    console.error("[Credit Score Error]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
