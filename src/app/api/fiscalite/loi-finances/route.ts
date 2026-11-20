import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/api-auth";
import {
    simulerImpactLoiFinances,
    type ParamsSimulation,
    type DonneeClientSimulation,
} from "@/lib/ohada/loi-finances-simulator";
import { AuditService } from "@/lib/audit";

/**
 * API de simulation d'impact de projet ou décret de Loi de Finances.
 * POST /api/fiscalite/loi-finances
 * Body: {
 *   params: ParamsSimulation,
 *   clients?: DonneeClientSimulation[]
 * }
 */
export async function POST(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    let body: {
        params?: ParamsSimulation;
        clients?: DonneeClientSimulation[];
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { params, clients: clientsInputs } = body;

    if (!params) {
        return NextResponse.json({ error: "Paramètres de simulation manquants." }, { status: 400 });
    }

    const { pays, typeChangement, valeurActuelle, valeurProposee, exercice } = params;

    if (!pays || !["sn", "ci", "cm", "bj"].includes(pays.toLowerCase())) {
        return NextResponse.json({ error: "Pays invalide ou non supporté." }, { status: 400 });
    }

    if (!["IS_TAUX", "IMF_TAUX", "TVA_TAUX", "CREDIT_IMPOT"].includes(typeChangement)) {
        return NextResponse.json({ error: "Type de changement fiscal non supporté." }, { status: 400 });
    }

    if (typeof valeurActuelle !== "number" || typeof valeurProposee !== "number") {
        return NextResponse.json({ error: "valeurActuelle et valeurProposee doivent être numériques." }, { status: 400 });
    }

    let clientsPourSimulation: DonneeClientSimulation[] = [];

    // Si une liste personnalisée de clients est fournie
    if (clientsInputs && Array.isArray(clientsInputs) && clientsInputs.length > 0) {
        clientsPourSimulation = clientsInputs;
    } else {
        // Sinon charger les clients du cabinet dans le pays ciblé
        const dbClients = await prisma.client.findMany({
            where: {
                country: pays.toUpperCase(),
            },
            take: 100,
            select: {
                id: true,
                companyName: true,
                taxDeclarations: {
                    where: { period: { contains: String(exercice ?? new Date().getFullYear()) } },
                    take: 5,
                    select: { amount: true, type: true },
                },
            },
        });

        if (dbClients.length > 0) {
            clientsPourSimulation = dbClients.map((c) => {
                const totalIS = c.taxDeclarations
                    .filter((d) => d.type === "IS")
                    .reduce((sum, d) => sum + (d.amount || 0), 0);
                const totalTVA = c.taxDeclarations
                    .filter((d) => d.type === "TVA")
                    .reduce((sum, d) => sum + (d.amount || 0), 0);

                // Estimation du bénéfice à partir de l'IS antérieur ou valeur par défaut
                const resultatEstime = totalIS > 0 ? Math.round(totalIS / (valeurActuelle > 0 ? valeurActuelle : 0.3)) : 15_000_000;

                return {
                    clientId: c.id,
                    nom: c.companyName || "Client Sans Nom",
                    resultatFiscal: resultatEstime,
                    tvaCollectee: totalTVA > 0 ? totalTVA : undefined,
                };
            });
        } else {
            // Échantillon de démonstration représentatif du portefeuille PME / ETI
            clientsPourSimulation = [
                { clientId: "demo-pme-1", nom: "Société Commerciale Ouest SARL", resultatFiscal: 25_000_000, chiffreAffaires: 120_000_000 },
                { clientId: "demo-pme-2", nom: "Industrie Agroalimentaire SA", resultatFiscal: 85_000_000, chiffreAffaires: 450_000_000 },
                { clientId: "demo-pme-3", nom: "Services Logistiques Dakar", resultatFiscal: -12_000_000, chiffreAffaires: 65_000_000 },
                { clientId: "demo-pme-4", nom: "Cabinet d'Ingénierie & Tech", resultatFiscal: 42_000_000, chiffreAffaires: 180_000_000 },
                { clientId: "demo-pme-5", nom: "Distribution Matériaux BTP", resultatFiscal: 8_500_000, chiffreAffaires: 95_000_000 },
            ];
        }
    }

    const resultat = simulerImpactLoiFinances(params, clientsPourSimulation);

    await AuditService.log({
        action: "SIMULATION_LOI_FINANCES",
        entityType: "Cabinet",
        entityId: "simulation",
        details: {
            pays,
            typeChangement,
            valeurActuelle,
            valeurProposee,
            clientsConcernes: resultat.clientsConcernes,
            totalDelta: resultat.totalDelta,
        },
    });

    return NextResponse.json(resultat);
}
