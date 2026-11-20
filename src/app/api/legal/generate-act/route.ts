import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import {
    genererPVAGOA,
    genererStatutsSARL,
    genererBailCommercial,
    genererContratTravailCDI,
    type TypeActeOHADA,
} from "@/lib/ohada/legal-document-generator";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const { type, params, pays = "SN" } = body;

        let acte = null;
        switch (type as TypeActeOHADA) {
            case "PV_AGOA":
                acte = genererPVAGOA(params, pays);
                break;
            case "STATUTS_SARL":
                acte = genererStatutsSARL({ ...params, pays });
                break;
            case "BAIL_COMMERCIAL":
                acte = genererBailCommercial({ ...params, pays });
                break;
            case "CONTRAT_TRAVAIL_CDI":
                acte = genererContratTravailCDI({ ...params, pays });
                break;
            default:
                return NextResponse.json(
                    { error: `Type d'acte non supporté: ${type}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({ acte });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
