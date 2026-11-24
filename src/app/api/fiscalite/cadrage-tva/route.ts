import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { effectuerCadrageTVA } from "@/lib/ohada/cadrage-tva";
import type { DeclarationTVAMensuelle } from "@/lib/ohada/cadrage-tva";
import type { CompteBalance } from "@/lib/ohada/types";
import type { PaysFiscal } from "@/lib/tax-simulator";

/**
 * Cadrage automatique TVA : croisement Balance Générale ↔ Déclarations mensuelles.
 * GET /api/fiscalite/cadrage-tva?clientId=&exercice=
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = Number(searchParams.get("exercice") || new Date().getFullYear());
    const prorataProvisoire = searchParams.get("prorataProvisoire")
        ? Number(searchParams.get("prorataProvisoire"))
        : undefined;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId manquant ou invalide." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true, companyName: true, country: true, fiscalRegime: true, taxProfile: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    const pays = (client.country || "SN").toLowerCase() as PaysFiscal;

    // 1. Récupérer la balance importée pour l'exercice (préférence) ou l'agréger depuis le journal
    const periode = `${exercice}`;
    const balanceImportee = await prisma.balanceImportee.findFirst({
        where: { clientId, periode: { startsWith: String(exercice) } },
        orderBy: { createdAt: "desc" },
        select: { lignes: true },
    });

    let balance: CompteBalance[] = [];
    if (balanceImportee?.lignes) {
        balance = balanceImportee.lignes as unknown as CompteBalance[];
    } else {
        // Agrégation depuis le journal
        const ecritures = await prisma.tpeJournal.findMany({
            where: {
                clientId,
                status: "EXPORTED",
                date: { gte: `${exercice}-01-01`, lte: `${exercice}-12-31` },
            },
            select: { debitCompte: true, debitIntitule: true, creditCompte: true, creditIntitule: true, montant: true, date: true },
        });

        const agregat = new Map<string, CompteBalance>();
        for (const e of ecritures) {
            const mont = Number(e.montant) || 0;
            if (e.debitCompte) {
                const num = e.debitCompte as string;
                const existing = agregat.get(num) || { numero: num, intitule: (e.debitIntitule as string) || num, debit: 0, credit: 0 };
                existing.debit += mont;
                agregat.set(num, existing);
            }
            if (e.creditCompte) {
                const num = e.creditCompte as string;
                const existing = agregat.get(num) || { numero: num, intitule: (e.creditIntitule as string) || num, debit: 0, credit: 0 };
                existing.credit += mont;
                agregat.set(num, existing);
            }
        }
        balance = Array.from(agregat.values());
    }

    // 2. Récupérer les déclarations de TVA enregistrées pour l'exercice
    const declarationsDB = await prisma.taxDeclaration.findMany({
        where: {
            clientId,
            type: "TVA",
            period: { startsWith: String(exercice) },
        },
        orderBy: { period: "asc" },
    });

    // Mapper vers l'interface attendue par le moteur
    const declarations: DeclarationTVAMensuelle[] = declarationsDB.map((d) => {
        const moisStr = d.period.split("-")[1] || "01";
        const mois = parseInt(moisStr, 10);
        const montant = Number(d.amount) || 0;
        // Approx: montant TVA nette = collectée - déductible
        // On utilise les calculationNotes si disponibles
        let notes: Record<string, number> = {};
        try {
            notes = JSON.parse((d.calculationNotes as string) || "{}");
        } catch { /* ignore */ }

        const tvaCollectee = notes.tvaCollectee ?? Math.round(montant * 1.2);
        const tvaDeductible = notes.tvaDeductible ?? Math.round(montant * 0.2);
        const caTotal = notes.caTotal ?? Math.round(tvaCollectee / 0.18);

        return {
            mois,
            periode: d.period,
            chiffreAffairesTaxableDeclare: notes.caTaxable ?? caTotal,
            chiffreAffairesExonereDeclare: notes.caExonere ?? 0,
            chiffreAffairesExportDeclare: notes.caExport ?? 0,
            chiffreAffairesTotalDeclare: caTotal,
            tvaCollecteeDeclaree: tvaCollectee,
            tvaDeductibleDeclaree: tvaDeductible,
            tvaNetteDueDeclaree: tvaCollectee - tvaDeductible,
            creditTVAReporte: notes.creditReporte ?? 0,
        };
    });

    if (balance.length === 0 && declarations.length === 0) {
        return NextResponse.json({
            message: "Aucune donnée comptable ni déclaration de TVA disponible pour cet exercice.",
            clientId,
            exercice,
        });
    }

    const synthese = effectuerCadrageTVA(pays, exercice, balance, declarations, {
        prorataProvisoire,
    });

    return NextResponse.json({
        client: { id: client.id, nom: client.companyName, pays: client.country },
        exercice,
        synthese,
        nbDeclarationsAnalysees: declarations.length,
        nbComptesBalance: balance.length,
    });
}
