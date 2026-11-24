import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";
import {
    calculerTableauBordPME,
    type ParametresTableauBordPME,
} from "@/lib/ohada/tableau-bord-pme";
import { extraireIndicateursBalancePME } from "@/lib/ohada/tableau-bord-pme-data";

/**
 * API Tableau de Bord Dirigeant & Pilotage Flash PME
 * GET /api/comptabilite/dashboard-pme?clientId=&exercice=
 */
export async function GET(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const exerciceBrut = searchParams.get("exercice");
    const exercice = exerciceBrut ? Number(exerciceBrut) : new Date().getFullYear();

    if (!clientId || !isObjectId(clientId)) {
        return NextResponse.json({ error: "clientId invalide." }, { status: 400 });
    }
    if (!Number.isInteger(exercice) || exercice < 2000 || exercice > 2100) {
        return NextResponse.json({ error: "exercice invalide." }, { status: 400 });
    }

    const debutExercice = new Date(Date.UTC(exercice, 0, 1));
    const debutExerciceSuivant = new Date(Date.UTC(exercice + 1, 0, 1));
    const [facturesVente, derniereBalance] = await Promise.all([
        prisma.invoice.findMany({
            where: { clientId, issueDate: { gte: debutExercice, lt: debutExerciceSuivant }, status: { in: ["SENT", "PAID", "OVERDUE"] } },
            select: { subtotal: true },
        }),
        prisma.balanceImportee.findFirst({
            where: { clientId, periode: { gte: `${exercice}-01`, lte: `${exercice}-12` } },
            orderBy: { periode: "desc" },
            select: { periode: true, lignes: true, equilibree: true },
        }),
    ]);
    const caFactures = facturesVente.reduce((sum, invoice) => sum + invoice.subtotal, 0);
    const indicateursBalance = derniereBalance?.equilibree
        ? extraireIndicateursBalancePME(derniereBalance.lignes)
        : null;
    const zero = {
        chiffreAffairesHT: 0, achatsEtChargesVariables: 0, chargesFixesExploitation: 0,
        stocksActuels: 0, creancesClients: 0, dettesFournisseurs: 0, dettesFiscalesSociales: 0,
        disponibilitesBancaires: 0, encaissePhysiqueCaisse: 0, concoursBancairesCourants: 0,
    } satisfies ParametresTableauBordPME;
    const parametres: ParametresTableauBordPME = {
        ...(indicateursBalance ?? zero),
        chiffreAffairesHT: indicateursBalance?.chiffreAffairesHT || caFactures,
    };

    const synthese = calculerTableauBordPME(parametres, exercice);
    const estimationFiable = Boolean(indicateursBalance && derniereBalance?.periode === `${exercice}-12`);
    const avertissements = [
        ...(!derniereBalance ? ["Aucune balance importée pour cet exercice ; les indicateurs de bilan et de charges ne sont pas disponibles."] : []),
        ...(derniereBalance && !derniereBalance.equilibree ? ["La dernière balance importée est déséquilibrée ; elle n’est pas utilisée pour les indicateurs financiers."] : []),
        ...(derniereBalance?.equilibree && !indicateursBalance ? ["Les lignes de la balance ne peuvent pas être interprétées de façon sûre."] : []),
        ...(indicateursBalance && derniereBalance?.periode !== `${exercice}-12` ? [`La dernière balance équilibrée est celle de ${derniereBalance?.periode} ; un arrêté au 31 décembre est requis pour qualifier le diagnostic annuel.`] : []),
        ...(!indicateursBalance && caFactures === 0 ? ["Aucune facture de vente validée n’est disponible pour cet exercice."] : []),
    ];
    return NextResponse.json({
        ...synthese,
        estimationFiable,
        sources: { balance: derniereBalance?.periode ?? null, facturesVente: facturesVente.length },
        avertissements,
    });
}
