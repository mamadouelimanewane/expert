import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }

    // Récupérer les journaux de la semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const journals = await prisma.tpeJournal.findMany({
      where: { clientId, createdAt: { gte: oneWeekAgo }, status: "APPROVED" }
    });

    const totalEntrees = journals.reduce((a, j) => a + j.entree, 0);
    const totalSorties = journals.reduce((a, j) => a + j.sortie, 0);
    const benefice = totalEntrees - totalSorties;

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const name = client?.companyName || `${client?.firstName} ${client?.lastName}`;

    const rapport = `📊 *Rapport Hebdomadaire — ${name}*\n\n` +
      `✅ Recettes : *${totalEntrees.toLocaleString()} FCFA*\n` +
      `📤 Dépenses : *${totalSorties.toLocaleString()} FCFA*\n` +
      `💰 Bénéfice estimé : *${benefice.toLocaleString()} FCFA*\n\n` +
      `📈 Écritures validées cette semaine : *${journals.length}*\n\n` +
      `_Généré automatiquement par votre Cabinet Expert-Comptable 🏛️_`;

    return NextResponse.json({ success: true, rapport, preview: { totalEntrees, totalSorties, benefice } });
  } catch (e) {
    console.error("[TPE Rapport Error]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
