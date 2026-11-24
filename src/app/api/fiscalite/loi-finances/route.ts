import { NextRequest, NextResponse } from "next/server";
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
 *   clients: DonneeClientSimulation[]
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
    const paysNormalise = typeof pays === "string" ? pays.toLowerCase() : "";

    if (!["sn", "ci", "cm", "bj"].includes(paysNormalise)) {
        return NextResponse.json({ error: "Pays invalide ou non supporté." }, { status: 400 });
    }

    if (!["IS_TAUX", "IMF_TAUX", "TVA_TAUX", "CREDIT_IMPOT"].includes(typeChangement)) {
        return NextResponse.json({ error: "Type de changement fiscal non supporté." }, { status: 400 });
    }

    if (![valeurActuelle, valeurProposee].every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0)) {
        return NextResponse.json({ error: "valeurActuelle et valeurProposee doivent être numériques." }, { status: 400 });
    }
    if (typeChangement !== "CREDIT_IMPOT" && (valeurActuelle > 1 || valeurProposee > 1)) {
        return NextResponse.json({ error: "Les taux doivent être exprimés sous forme décimale, entre 0 et 1." }, { status: 400 });
    }
    if (!Number.isInteger(exercice) || exercice < 2000 || exercice > 2100) {
        return NextResponse.json({ error: "Exercice invalide." }, { status: 400 });
    }

    if (!Array.isArray(clientsInputs) || clientsInputs.length === 0 || clientsInputs.length > 500) {
        return NextResponse.json({ error: "Saisissez entre 1 et 500 entreprises avec leurs données comptables." }, { status: 400 });
    }
    const clientsPourSimulation = clientsInputs;
    const ids = new Set<string>();
    for (const client of clientsPourSimulation) {
        if (!client || typeof client.clientId !== "string" || !client.clientId.trim() || ids.has(client.clientId)) {
            return NextResponse.json({ error: "Chaque entreprise doit avoir un identifiant unique." }, { status: 400 });
        }
        ids.add(client.clientId);
        if (typeof client.nom !== "string" || !client.nom.trim() || client.nom.length > 160) {
            return NextResponse.json({ error: "Le nom de chaque entreprise est obligatoire (160 caractères maximum)." }, { status: 400 });
        }
        if (![client.resultatFiscal, client.chiffreAffaires, client.caTtc, client.tvaCollectee].every(
            (value) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 1_000_000_000_000_000
        ) || client.chiffreAffaires < 0 || client.caTtc < 0 || client.tvaCollectee < 0) {
            return NextResponse.json({ error: `Les montants comptables de ${client.nom} sont incomplets ou invalides.` }, { status: 400 });
        }
    }

    const resultat = simulerImpactLoiFinances({ ...params, pays: paysNormalise as ParamsSimulation["pays"] }, clientsPourSimulation);

    await AuditService.log({
        action: "SIMULATION_LOI_FINANCES",
        entity: "Cabinet",
        entityId: "simulation",
        details: JSON.stringify({
            pays,
            typeChangement,
            valeurActuelle,
            valeurProposee,
            clientsConcernes: resultat.clientsConcernes,
            totalDelta: resultat.totalDelta,
        }),
    });

    return NextResponse.json(resultat);
}
