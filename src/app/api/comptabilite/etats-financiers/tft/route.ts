import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { obtenirBalance } from "@/lib/ohada/balance-source";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";
import { genererTFT } from "@/lib/ohada/tft-engine";

// Tableau des Flux de Trésorerie — méthode indirecte simplifiée (tft-engine.ts).
// Contrairement au bilan/résultat, la période N-1 est ici OBLIGATOIRE : sans
// elle, toutes les variations ne seraient que les soldes N eux-mêmes.

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");
        const periodeN1 = searchParams.get("periodeN1");

        if (!clientId || !periode || !periodeN1) {
            return NextResponse.json({ error: "clientId, periode et periodeN1 sont requis" }, { status: 400 });
        }

        const [n, n1] = await Promise.all([obtenirBalance(clientId, periode), obtenirBalance(clientId, periodeN1)]);
        const statement = genererEtatsFinanciers(n.balance, n1.balance);

        if (!statement.controleEquilibre.equilibre) {
            return NextResponse.json({
                error: "Le bilan de la période N n'est pas équilibré (actif ≠ passif) : corrigez-le avant de calculer le TFT.",
                anomalies: statement.anomalies,
            }, { status: 422 });
        }

        const tft = genererTFT(statement);

        return NextResponse.json({
            tft,
            source: { type: n.source.type, detail: n.source, ecrituresN: n.source.type === "JOURNAL" ? n.source.ecritures : n.source.lignes, ecrituresN1: n1.source.type === "JOURNAL" ? n1.source.ecritures : n1.source.lignes, periode, periodeN1 },
            anomalies: statement.anomalies,
        });
    } catch (error) {
        console.error("Erreur API TFT:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
