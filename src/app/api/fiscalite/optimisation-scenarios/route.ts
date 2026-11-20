import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { simulerScenariosIS, type LevierFiscalInput } from "@/lib/ohada/optimisation-is-scenarios";
import type { PaysFiscal } from "@/lib/tax-simulator";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const {
            pays = "SN",
            exercice = 2024,
            chiffreAffairesHT = 100000000,
            resultatComptable = 10000000,
            leviers = {},
        } = body;

        const comparatif = simulerScenariosIS(
            pays as PaysFiscal,
            Number(exercice),
            Number(chiffreAffairesHT),
            Number(resultatComptable),
            leviers as LevierFiscalInput
        );

        return NextResponse.json({ comparatif });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
