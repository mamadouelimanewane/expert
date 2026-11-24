import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { genererFEC } from "@/lib/ohada/fec-export";
import type { LigneEcritureFEC } from "@/lib/ohada/fec-export";

/**
 * Génère le Fichier des Écritures Comptables (FEC) depuis le journal de production
 * pour un client et une période donnés.
 * GET /api/fiscalite/fec?clientId=&exercice=
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = Number(searchParams.get("exercice") || new Date().getFullYear());
    const format = searchParams.get("format") || "tab"; // "tab" ou "pipe"

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId manquant ou invalide." }, { status: 400 });
    }
    if (!Number.isInteger(exercice) || exercice < 2000 || exercice > 2100) {
        return NextResponse.json({ error: "Paramètre exercice invalide." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true, companyName: true, ninea: true, ifu: true, nif: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    const identifiantFiscal =
        client.ninea || client.ifu || client.nif || client.companyName || "CONTRIBUABLE";

    // Récupérer les écritures du journal de production pour l'exercice
    const debut = `${exercice}-01-01`;
    const fin = `${exercice}-12-31`;

    const ecritures = await prisma.tpeJournal.findMany({
        where: {
            clientId,
            status: "EXPORTED",
            source: { not: "WHATSAPP_TEST" },
            date: { gte: debut, lte: fin },
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        select: {
            id: true,
            date: true,
            debitCompte: true,
            debitIntitule: true,
            creditCompte: true,
            creditIntitule: true,
            montant: true,
            libelle: true,
        },
    });

    if (ecritures.length === 0) {
        return NextResponse.json(
            {
                error: `Aucune écriture comptable validée pour le client sur l'exercice ${exercice}.`,
                clientId,
                exercice,
            },
            { status: 404 }
        );
    }

    // Transformer en lignes FEC doubles (débit + crédit séparés)
    const lignesFEC: LigneEcritureFEC[] = [];
    ecritures.forEach((e, idx) => {
        const baseNum = String(idx + 1).padStart(6, "0");
        const journal = "OD";
        const ref = e.id;
        const libelle = (e.libelle as string) || "Écriture de production";
        const date = e.date;
        const montant = Number(e.montant) || 0;

        // Ligne débit
        lignesFEC.push({
            journalCode: journal,
            journalLib: journal,
            ecritureNum: baseNum,
            ecritureDate: date,
            compteNum: (e.debitCompte as string) || "471100",
            compteLib: (e.debitIntitule as string) || "Compte de transition",
            pieceRef: ref,
            pieceDate: date,
            ecritureLib: libelle,
            debit: montant,
            credit: 0,
            validDate: date,
        });

        // Ligne crédit
        lignesFEC.push({
            journalCode: journal,
            journalLib: journal,
            ecritureNum: baseNum,
            ecritureDate: date,
            compteNum: (e.creditCompte as string) || "471200",
            compteLib: (e.creditIntitule as string) || "Compte de transition",
            pieceRef: ref,
            pieceDate: date,
            ecritureLib: libelle,
            debit: 0,
            credit: montant,
            validDate: date,
        });
    });

    const resultat = genererFEC(
        identifiantFiscal.replace(/[^a-zA-Z0-9]/g, ""),
        exercice,
        lignesFEC,
        { separateur: format === "pipe" ? "|" : "\t" }
    );

    if (searchParams.get("download") === "1") {
        const contentType = "text/plain; charset=utf-8";
        return new NextResponse(resultat.contenuTexte, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${resultat.nomFichier}"`,
                "X-FEC-SHA256": resultat.rapport.empreinteSHA256,
                "X-FEC-Lignes": String(resultat.rapport.totalLignes),
                "X-FEC-Equilibre": resultat.rapport.ecartBalance === 0 ? "OUI" : "NON",
            },
        });
    }

    return NextResponse.json({ ...resultat.rapport, nomFichier: resultat.nomFichier, clientId, exercice });
}
