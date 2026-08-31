import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireStaff } from "@/lib/api-auth";

// GET: Récupérer tous les journaux TPE sauvegardés
export async function GET() {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const journals = await prisma.tpeJournal.findMany({
            where: { source: { not: 'WHATSAPP_TEST' } },
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
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { journal, businessName, periode, clientId } = await request.json();

        if (!journal || !Array.isArray(journal)) {
            return NextResponse.json({ error: "Données invalides" }, { status: 400 });
        }

        // `clientId` est obligatoire : sans lui, les écritures étaient
        // silencieusement attribuées au premier client de la base (voire à un
        // client factice créé à la volée), quel que soit le TPE réellement
        // importé.
        if (!clientId) {
            return NextResponse.json({ error: "clientId requis" }, { status: 400 });
        }

        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        // Bulk insert all journal lines
        const result = await prisma.tpeJournal.createMany({
            data: journal.map((line: any) => ({
                periode: periode || 'PERIODE-INCONNUE',
                businessName: businessName || client.companyName || 'Commerçant',
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
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { periode, clientId } = await request.json().catch(() => ({}));

        // Sans strictUndefinedChecks, Prisma retire purement et simplement un
        // filtre valant undefined : un corps de requete sans periode transformait
        // cet updateMany en export de TOUTES les ecritures PENDING de TOUS les
        // clients. Et meme avec une periode valide, l'absence de portee client
        // deversait en production les ecritures de tout le portefeuille pour ce
        // mois-la. Les deux criteres sont desormais obligatoires et verifies.
        if (typeof periode !== "string" || periode.trim() === "") {
            return NextResponse.json({ error: "periode requise." }, { status: 400 });
        }
        if (typeof clientId !== "string" || clientId.length !== 24) {
            return NextResponse.json({ error: "clientId requis." }, { status: 400 });
        }

        const result = await prisma.tpeJournal.updateMany({
            where: { periode, clientId, status: 'PENDING' },
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
