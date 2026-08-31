import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPortalClient } from '@/lib/portal-auth';
import { analyserMontantOptionnel, normaliserDateISO } from '@/lib/validation';

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

    // Les montants arrivaient ici en `parseFloat(entry.entree) || 0` : une
    // recette saisie « 1 250 000 » par le client était enregistrée à 1 FCFA, et
    // une valeur illisible tombait silencieusement à 0. Le client repartait avec
    // un « success: true » sur un journal faux. Chaque ligne est désormais
    // vérifiée, et l'ensemble du dépôt est refusé si l'une d'elles ne peut pas
    // être lue — un import partiel serait pire, le client croyant tout déposé.
    const businessName = client.companyName || `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim();
    const periode = new Date().toISOString().substring(0, 7); // YYYY-MM
    const lignesRejetees: string[] = [];
    const tpeJournals = [];

    for (let index = 0; index < data.entries.length; index++) {
      const entry = data.entries[index] ?? {};
      const numero = index + 1;

      const libelle = typeof entry.libelle === "string" ? entry.libelle.trim() : "";
      if (!libelle) {
        lignesRejetees.push(`Ligne ${numero} : libellé manquant.`);
        continue;
      }

      const dateISO = normaliserDateISO(entry.date);
      if (dateISO === null) {
        lignesRejetees.push(`Ligne ${numero} (${libelle}) : date illisible « ${entry.date ?? ""} ».`);
        continue;
      }

      const entree = analyserMontantOptionnel(entry.entree, { min: 0 });
      if (!entree.ok) {
        lignesRejetees.push(`Ligne ${numero} (${libelle}) : entrée — ${entree.raison}`);
        continue;
      }

      const sortie = analyserMontantOptionnel(entry.sortie, { min: 0 });
      if (!sortie.ok) {
        lignesRejetees.push(`Ligne ${numero} (${libelle}) : sortie — ${sortie.raison}`);
        continue;
      }

      const montantEntree = entree.valeur ?? 0;
      const montantSortie = sortie.valeur ?? 0;
      if (montantEntree === 0 && montantSortie === 0) {
        lignesRejetees.push(`Ligne ${numero} (${libelle}) : aucun montant en entrée ni en sortie.`);
        continue;
      }

      tpeJournals.push({
        periode,
        businessName,
        date: dateISO,
        libelle,
        entree: montantEntree,
        sortie: montantSortie,
        debitCompte: "", // Will be assigned by engine
        debitIntitule: "",
        creditCompte: "",
        creditIntitule: "",
        montant: montantEntree || montantSortie,
        clientId: client.id,
        status: "PENDING",
      });
    }

    if (lignesRejetees.length > 0) {
      return NextResponse.json(
        {
          error: "Certaines lignes n'ont pas pu être lues : aucune écriture n'a été enregistrée.",
          lignesRejetees,
        },
        { status: 400 }
      );
    }

    if (tpeJournals.length === 0) {
      return NextResponse.json({ error: "Aucune écriture à enregistrer." }, { status: 400 });
    }

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
