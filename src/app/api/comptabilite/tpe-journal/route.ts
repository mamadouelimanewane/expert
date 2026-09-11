import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { requireStaff } from "@/lib/api-auth";
import { normaliserDateISO, normaliserPeriode } from "@/lib/validation";

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
        const { journal, businessName, periode: periodeBrute, clientId } = await request.json();
        // « JUIN-2026 » et « 2026-06 » désignaient deux périodes distinctes en
        // base : la première n'entrait jamais dans les états financiers.
        const periode = normaliserPeriode(periodeBrute);
        if (!periode) {
            return NextResponse.json({ error: "Période illisible : attendu AAAA-MM (ex. 2026-06)." }, { status: 400 });
        }

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

        // TpeJournal.date est une chaine ecrite telle quelle. L'export FEC la
        // compare ensuite lexicographiquement et la met en forme via new Date() :
        // une ligne saisie « 15/01/2026 » sortait de la periode demandee sans
        // signalement, ou produisait une colonne EcritureDate vide dans le
        // fichier remis a l'administration. Les dates sont donc normalisees ici,
        // et une date illisible fait rejeter le lot entier.
        const datesNormalisees = journal.map((line: any) => normaliserDateISO(line?.date));
        const lignesSansDate = datesNormalisees
            .map((d: string | null, i: number) => (d === null ? i + 1 : null))
            .filter((n: number | null): n is number => n !== null);
        if (lignesSansDate.length > 0) {
            return NextResponse.json(
                {
                    error: "Date illisible sur certaines lignes : aucune écriture n'a été enregistrée.",
                    lignes: lignesSansDate,
                },
                { status: 400 }
            );
        }

        // Bulk insert all journal lines
        const result = await prisma.tpeJournal.createMany({
            data: journal.map((line: any, index: number) => ({
                periode,
                businessName: businessName || client.companyName || 'Commerçant',
                date: datesNormalisees[index] as string,
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
        const { periode: periodeBrute, clientId } = await request.json().catch(() => ({}));
        const periode = typeof periodeBrute === "string" ? normaliserPeriode(periodeBrute) ?? periodeBrute.trim() : periodeBrute;

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

        // Les écritures validées une à une depuis « Abonnés TPE » passent en
        // APPROVED : elles n'étaient ensuite jamais déversées (le filtre ne
        // prenait que PENDING) et manquaient au bilan, au résultat et au FEC.
        const result = await prisma.tpeJournal.updateMany({
            where: { periode, clientId, status: { in: ['PENDING', 'APPROVED'] } },
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
