import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { AccountingEngine } from "@/lib/accounting-engine";
import { analyserMontant, normaliserDateISO } from "@/lib/validation";

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

// Sens comptable accepté pour la colonne `type` du fichier importé. Toute autre
// valeur est refusée explicitement plutôt que traitée par défaut en dépense.
const SENS_RECETTE = new Set([
    "income", "recette", "recettes", "credit", "crédit", "in", "entree", "entrée", "encaissement", "vente",
]);
const SENS_DEPENSE = new Set([
    "expense", "depense", "dépense", "depenses", "dépenses", "debit", "débit", "out", "sortie", "decaissement", "décaissement", "achat",
]);

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

        const lignesRejetees: string[] = [];

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i] ?? {};
            const numero = i + 1;

            const libelle = typeof tx.libelle === "string" ? tx.libelle.trim() : "";
            if (!libelle) {
                lignesRejetees.push(`Ligne ${numero} : libellé manquant.`);
                continue;
            }

            // Number("1 250,00") vaut NaN, ramené à 0 par le `|| 0`, et la ligne
            // était abandonnée sans trace pendant que la réponse annonçait
            // `importees: transactions.length`.
            const analyse = analyserMontant(tx.amount);
            if (!analyse.ok) {
                lignesRejetees.push(`Ligne ${numero} (${libelle}) : ${analyse.raison}`);
                continue;
            }
            const montant = Math.abs(analyse.valeur);
            if (montant === 0) {
                lignesRejetees.push(`Ligne ${numero} (${libelle}) : montant nul.`);
                continue;
            }

            // Le sens comptable n'était pas vérifié : `tx.type === "income"`
            // traitait en DÉPENSE toute autre valeur — "INCOME", "credit",
            // "recette", ou un champ absent. Un export dont la colonne type est
            // en majuscules passait ainsi la totalité des encaissements au
            // débit des charges, TVA déductible comprise.
            const dateISO = tx.date === undefined || tx.date === null || tx.date === ""
                ? new Date().toISOString().substring(0, 10)
                : normaliserDateISO(tx.date);
            if (dateISO === null) {
                lignesRejetees.push(`Ligne ${numero} (${libelle}) : date illisible « ${tx.date} ».`);
                continue;
            }

            const sens = String(tx.type ?? "").trim().toLowerCase();
            const isRecette = SENS_RECETTE.has(sens);
            if (!isRecette && !SENS_DEPENSE.has(sens)) {
                lignesRejetees.push(
                    `Ligne ${numero} (${libelle}) : sens de l'opération non reconnu « ${tx.type ?? ""} ».`
                );
                continue;
            }
            const resultat = await AccountingEngine.processEntry(
                libelle,
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
                    date: dateISO,
                    libelle: couples.length > 1 ? `${libelle} (${index + 1}/${couples.length})` : libelle,
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

        if (lignesRejetees.length > 0) {
            // Tout ou rien : un import partiel laisserait l'opérateur croire le
            // fichier intégralement repris alors qu'il manquerait des opérations.
            return NextResponse.json(
                {
                    error: "Certaines lignes n'ont pas pu être lues : aucune écriture n'a été enregistrée.",
                    lignesRejetees,
                },
                { status: 400 }
            );
        }

        if (lignesJournal.length === 0) {
            return NextResponse.json({ error: "Aucune transaction exploitable après filtrage" }, { status: 400 });
        }

        await prisma.tpeJournal.createMany({ data: lignesJournal });

        return NextResponse.json(
            {
                importees: transactions.length,
                lignesRejetees: [],
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
