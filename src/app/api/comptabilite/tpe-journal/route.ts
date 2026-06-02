import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function getDefaultClient() {
    let client = await prisma.client.findFirst();
    if (!client) {
        client = await prisma.client.create({
            data: {
                type: 'ENTREPRISE',
                companyName: 'TPE Client Default',
                email: 'tpe@defaultclient.com',
                phone: '+225 00000000',
            }
        });
    }
    return client;
}

// GET: Récupérer tous les journaux TPE sauvegardés
export async function GET() {
    try {
        const journals = await prisma.tpeJournal.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        return NextResponse.json(journals);
    } catch (error) {
        console.error("Erreur GET TpeJournal:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// POST: Sauvegarder un batch d'écritures générées par le moteur OHADA
export async function POST(request: Request) {
    try {
        const { journal, businessName, periode } = await request.json();
        const client = await getDefaultClient();

        if (!journal || !Array.isArray(journal)) {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }

        // Bulk insert all journal lines
        const result = await prisma.tpeJournal.createMany({
            data: journal.map((line: any) => ({
                periode: periode || 'PERIODE-INCONNUE',
                businessName: businessName || 'Commerçant',
                date: line.date,
                libelle: line.libelle,
                entree: line.entree || 0,
                sortie: line.sortie || 0,
                debitCompte: line.debit_compte,
                debitIntitule: line.debit_intitule,
                creditCompte: line.credit_compte,
                creditIntitule: line.credit_intitule,
                montant: line.montant,
                status: 'PENDING',
                clientId: client.id,
            }))
        });

        return NextResponse.json({ 
            message: `${result.count} écritures enregistrées avec succès.`,
            count: result.count 
        }, { status: 201 });

    } catch (error) {
        console.error("Erreur POST TpeJournal:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PATCH: Marquer un batch comme "Exporté vers la Production"
export async function PATCH(request: Request) {
    try {
        const { periode } = await request.json();
        const result = await prisma.tpeJournal.updateMany({
            where: { periode, status: 'PENDING' },
            data: { status: 'EXPORTED', exportedAt: new Date() }
        });

        return NextResponse.json({ 
            message: `${result.count} écritures déversées dans la production.`,
            count: result.count 
        });
    } catch (error) {
        console.error("Erreur PATCH TpeJournal:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
