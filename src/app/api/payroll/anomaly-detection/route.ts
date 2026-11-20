import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { analyserBulletin, analyserLot, genererRapportAnomalies, type BulletinInput } from "@/lib/payroll/anomaly-detector";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const { bulletins, bulletin } = body;

        if (Array.isArray(bulletins) && bulletins.length > 0) {
            const resultats = analyserLot(bulletins);
            const rapport = genererRapportAnomalies(resultats);

            const stats = {
                total: resultats.length,
                critiques: resultats.filter(r => r.niveauGlobal === "CRITIQUE").length,
                eleves: resultats.filter(r => r.niveauGlobal === "ELEVE").length,
                moyens: resultats.filter(r => r.niveauGlobal === "MOYEN").length,
                faibles: resultats.filter(r => r.niveauGlobal === "FAIBLE").length,
            };

            return NextResponse.json({ resultats, stats, rapport });
        }

        if (bulletin) {
            const resultat = analyserBulletin(bulletin as BulletinInput);
            return NextResponse.json({ resultat });
        }

        return NextResponse.json(
            { error: "Veuillez fournir un 'bulletin' ou une liste 'bulletins'." },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
