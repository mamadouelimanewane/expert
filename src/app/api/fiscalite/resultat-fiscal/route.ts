import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import { determinerResultatFiscalEtIS, detecterAjustementsFiscauxAutomatiques } from "@/lib/ohada/resultat-fiscal";
import type { ParametresFiscaliteEntreprise, LigneAjustementFiscal } from "@/lib/ohada/resultat-fiscal";
import { obtenirBalance } from "@/lib/ohada/balance-source";
import type { PaysFiscal } from "@/lib/tax-simulator";

/**
 * Liquidation IS / Tableau 7 DSF (Résultat Fiscal & Impôt sur les Sociétés).
 * GET  /api/fiscalite/resultat-fiscal?clientId=&exercice=
 * POST /api/fiscalite/resultat-fiscal   → avec ajustements manuels
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exercice = Number(searchParams.get("exercice") || new Date().getFullYear());

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { companyName: true, country: true, fiscalRegime: true, taxProfile: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    const pays = (client.country || "SN").toLowerCase() as PaysFiscal;
    const periode = `${exercice}`;

    // Balance générale de l'exercice
    const { balance } = await obtenirBalance(clientId, periode);

    // Calculer résultat comptable depuis la balance (Classe 6 & 7)
    let totalCharges = 0;
    let totalProduits = 0;
    let chiffreAffairesHT = 0;

    for (const compte of balance) {
        const num = (compte.numero || "").trim();
        const solde = (compte.debit || 0) - (compte.credit || 0);
        if (num.startsWith("6")) totalCharges += Math.max(0, solde);
        if (num.startsWith("7")) totalProduits += Math.max(0, -solde);
        if (/^70[1-7]/.test(num)) chiffreAffairesHT += Math.max(0, -solde);
    }

    const resultatComptableAvantImpot = totalProduits - totalCharges;

    // Détection automatique des ajustements
    const ajustementsAuto = detecterAjustementsFiscauxAutomatiques(balance, {
        pays,
        exercice,
        chiffreAffairesHT,
        resultatComptableAvantImpot,
    });

    // Acomptes versés (déclarations IS VALIDATED de l'exercice)
    const acomptesVerses = await prisma.taxDeclaration
        .aggregate({
            where: {
                clientId,
                type: "IS",
                period: { startsWith: String(exercice) },
                status: "VALIDATED",
            },
            _sum: { amount: true },
        })
        .then((r) => Number(r._sum.amount) || 0);

    const liquidation = determinerResultatFiscalEtIS(
        {
            pays,
            exercice,
            chiffreAffairesHT,
            resultatComptableAvantImpot,
        },
        ajustementsAuto,
        acomptesVerses
    );

    return NextResponse.json({
        client: { nom: client.companyName, pays: client.country, regime: client.fiscalRegime },
        exercice,
        chiffreAffairesHT,
        resultatComptableAvantImpot,
        nbAjustementsAutomatiques: ajustementsAuto.length,
        liquidation,
        nbComptesBalance: balance.length,
        acomptesVerses,
        avertissement:
            balance.length === 0
                ? "Aucune balance disponible. Importez la balance générale de l'exercice pour obtenir une liquidation précise."
                : null,
    });
}

export async function POST(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    let body: {
        clientId?: string;
        exercice?: number;
        ajustementsManuels?: LigneAjustementFiscal[];
        acomptesVerses?: number;
        deficitsAnterieurs?: ParametresFiscaliteEntreprise["deficitsAnterieurs"];
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { clientId, exercice = new Date().getFullYear(), ajustementsManuels = [], acomptesVerses = 0 } = body;

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { companyName: true, country: true },
    });
    if (!client) return NextResponse.json({ error: "Client introuvable." }, { status: 404 });

    const pays = (client.country || "SN").toLowerCase() as PaysFiscal;
    const { balance } = await obtenirBalance(clientId, String(exercice));

    let chiffreAffairesHT = 0;
    let totalCharges = 0;
    let totalProduits = 0;

    for (const compte of balance) {
        const num = (compte.numero || "").trim();
        const solde = (compte.debit || 0) - (compte.credit || 0);
        if (num.startsWith("6")) totalCharges += Math.max(0, solde);
        if (num.startsWith("7")) totalProduits += Math.max(0, -solde);
        if (/^70[1-7]/.test(num)) chiffreAffairesHT += Math.max(0, -solde);
    }

    const resultatComptableAvantImpot = totalProduits - totalCharges;

    const ajustementsAuto = detecterAjustementsFiscauxAutomatiques(balance, {
        pays,
        exercice,
        chiffreAffairesHT,
        resultatComptableAvantImpot,
    });

    const liquidation = determinerResultatFiscalEtIS(
        {
            pays,
            exercice,
            chiffreAffairesHT,
            resultatComptableAvantImpot,
            ajustementsManuels,
            deficitsAnterieurs: body.deficitsAnterieurs,
        },
        ajustementsAuto,
        acomptesVerses
    );

    return NextResponse.json({ liquidation, chiffreAffairesHT, resultatComptableAvantImpot });
}
