import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { analyserOperationTransfrontaliere, CONVENTIONS_CATALOGUE } from "@/lib/ohada/conventions-fiscales";
import type { NatureFluxTransfrontalier } from "@/lib/ohada/conventions-fiscales";

/**
 * Moteur de Conventions Fiscales Internationales & Retenues Transfrontalières.
 * GET  /api/fiscalite/conventions → liste les conventions disponibles
 * POST /api/fiscalite/conventions → analyse une opération transfrontalière
 */
export async function GET(_request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    return NextResponse.json({
        conventions: CONVENTIONS_CATALOGUE.map((c) => ({
            id: c.id,
            titre: c.titre,
            paysSource: c.paysSource,
            paysBeneficiaire: c.paysBeneficiaire,
            dateEntreeVigueur: c.dateEntreeVigueur,
            estTraiteMultilateral: c.estTraiteMultilateral ?? false,
        })),
        naturesFlux: [
            { id: "DIVIDENDES", libelle: "Dividendes versés à des actionnaires étrangers" },
            { id: "INTERETS", libelle: "Intérêts sur emprunts ou obligations" },
            { id: "REDEVANCES_LOGICIELS_BREVETS", libelle: "Redevances de licences, brevets, logiciels" },
            { id: "ASSISTANCE_TECHNIQUE_MANAGEMENT_FEES", libelle: "Assistance technique, management fees, frais de siège" },
            { id: "PRESTATIONS_DE_SERVICES_GENERALES", libelle: "Prestations de services générales" },
            { id: "GAINS_IMMOBILIERS", libelle: "Gains sur cession d'immeubles" },
        ],
    });
}

export async function POST(request: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    let body: {
        paysSource?: string;
        paysBeneficiaire?: string;
        natureFlux?: string;
        montantBrutPaiement?: number;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
    }

    const { paysSource, paysBeneficiaire, natureFlux, montantBrutPaiement } = body;

    if (!paysSource || !paysBeneficiaire) {
        return NextResponse.json({ error: "paysSource et paysBeneficiaire requis." }, { status: 400 });
    }
    if (!natureFlux) {
        return NextResponse.json({ error: "natureFlux requis." }, { status: 400 });
    }
    if (!montantBrutPaiement || montantBrutPaiement <= 0) {
        return NextResponse.json({ error: "montantBrutPaiement invalide." }, { status: 400 });
    }

    const resultat = analyserOperationTransfrontaliere({
        paysSource: paysSource.toUpperCase(),
        paysBeneficiaire: paysBeneficiaire.toUpperCase(),
        natureFlux: natureFlux as NatureFluxTransfrontalier,
        montantBrutPaiement: Number(montantBrutPaiement),
    });

    return NextResponse.json({ resultat });
}
