import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPortalClient } from '@/lib/portal-auth';

export async function POST(req: Request) {
  try {
    const client = await getPortalClient(req);
    if (!client) {
      return NextResponse.json({ error: 'Portail introuvable ou désactivé' }, { status: 401 });
    }

    const data = await req.json();
    // Expected data format: { entries: [{ date, libelle, entree, sortie }] }
    // Le clientId n'est jamais accepté depuis le body : il est résolu via le portalToken.

    if (!data.entries || !Array.isArray(data.entries)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const tpeJournals = data.entries.map((entry: any) => {
      return {
        periode: new Date().toISOString().substring(0, 7), // YYYY-MM
        businessName: client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim(),
        date: entry.date,
        libelle: entry.libelle,
        entree: parseFloat(entry.entree) || 0,
        sortie: parseFloat(entry.sortie) || 0,
        debitCompte: "", // Will be assigned by engine
        debitIntitule: "",
        creditCompte: "",
        creditIntitule: "",
        montant: parseFloat(entry.entree) || parseFloat(entry.sortie) || 0,
        clientId: client.id,
        status: "PENDING"
      };
    });

    await prisma.tpeJournal.createMany({
      data: tpeJournals
    });

    // Optionnel : Déclencher le moteur d'affectation IA ici ou en background
    // Pour l'instant, c'est fait lors de la lecture côté cabinet

    return NextResponse.json({ success: true, count: tpeJournals.length });
  } catch (error) {
    console.error('Upload Journal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
