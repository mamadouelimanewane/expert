import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { AccountingEngine } from "@/lib/accounting-engine";

// Import d'écritures depuis un export externe (Wave, CSV générique...).
//
// La page /ingest/connectors affichait après un délai simulé un tableau de
// cinq écritures fixes, annonçant « 342 écritures détectées, 100 % mappé
// automatiquement », avec un bouton « Valider & Intégrer au Grand Livre » qui
// n'écrivait rien nulle part.
//
// Cette route fait réellement ce que l'ancien tableau prétendait : chaque
// ligne passe par le même moteur d'imputation que le canal WhatsApp
// (AccountingEngine — règles, apprentissage, sinon compte d'attente 471), puis
// est décomposée en écritures équilibrées et insérée dans le journal en
// attente de validation. Aucun taux de réussite n'est affiché avant que le
// traitement ait réellement eu lieu.

type TransactionImport = {
    date: string;
    libelle: string;
    amount: number;
    type: "income" | "expense";
};

export async function POST(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { clientId, periode, transactions } = (await request.json()) as {
            clientId?: string;
            periode?: string;
            transactions?: TransactionImport[];
        };

        if (!clientId) {
            return NextResponse.json({ error: "clientId requis" }, { status: 400 });
        }
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return NextResponse.json({ error: "Aucune transaction à importer" }, { status: 400 });
        }
        if (transactions.length > 500) {
            return NextResponse.json({ error: "500 transactions au maximum par import" }, { status: 400 });
        }

        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
            return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
        }

        const businessName = client.companyName || [client.firstName, client.lastName].filter(Boolean).join(" ") || "Client";
        const periodeRetenue = periode || new Date().toISOString().substring(0, 7);

        let aQualifier = 0;
        const lignesJournal: {
            periode: string;
            businessName: string;
            date: string;
            libelle: string;
            entree: number;
            sortie: number;
            source: string;
            debitCompte: string;
            debitIntitule: string;
            creditCompte: string;
            creditIntitule: string;
            montant: number;
            clientId: string;
            status: string;
        }[] = [];

        for (const tx of transactions) {
            const montant = Math.abs(Number(tx.amount) || 0);
            if (montant === 0 || !tx.libelle) continue;

            const isRecette = tx.type === "income";
            const resultat = await AccountingEngine.processEntry(
                tx.libelle,
                isRecette ? montant : 0,
                isRecette ? 0 : montant,
                clientId
            );
            if (resultat.requiresReview) aQualifier++;

            const couples = AccountingEngine.toPairedEntries(resultat.lignes);
            couples.forEach((couple, index) => {
                lignesJournal.push({
                    periode: periodeRetenue,
                    businessName,
                    date: tx.date || new Date().toISOString().substring(0, 10),
                    libelle: couples.length > 1 ? `${tx.libelle} (${index + 1}/${couples.length})` : tx.libelle,
                    entree: index === 0 && isRecette ? montant : 0,
                    sortie: index === 0 && !isRecette ? montant : 0,
                    source: "IMPORT",
                    debitCompte: couple.debitCompte,
                    debitIntitule: couple.debitIntitule,
                    creditCompte: couple.creditCompte,
                    creditIntitule: couple.creditIntitule,
                    montant: couple.montant,
                    clientId,
                    status: "PENDING",
                });
            });
        }

        if (lignesJournal.length === 0) {
            return NextResponse.json({ error: "Aucune transaction exploitable après filtrage" }, { status: 400 });
        }

        await prisma.tpeJournal.createMany({ data: lignesJournal });

        return NextResponse.json(
            {
                importees: transactions.length,
                ecritures: lignesJournal.length,
                aQualifier,
                periode: periodeRetenue,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur POST ingest/import:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
