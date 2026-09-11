import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { obtenirBalance } from "@/lib/ohada/balance-source";
import { genererEtatsFinanciers } from "@/lib/ohada/syscohada-engine";

// Compte de résultat SYSCOHADA révisé, produit par le moteur commun.
//
// Les soldes intermédiaires de gestion (marge commerciale, valeur ajoutée, EBE,
// résultat d'exploitation, financier, HAO, net) sont calculés en cascade sur la
// balance reconstituée à partir du journal, et non approximés ligne à ligne.

export async function GET(request: Request) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(request.url);
        const clientId = searchParams.get("clientId");
        const periode = searchParams.get("periode");
        const periodeN1 = searchParams.get("periodeN1");

        const [n, n1] = await Promise.all([
            obtenirBalance(clientId, periode),
            periodeN1 ? obtenirBalance(clientId, periodeN1) : Promise.resolve({ balance: [], source: { type: "JOURNAL" as const, ecritures: 0 } }),
        ]);
        const etats = genererEtatsFinanciers(n.balance, n1.balance);

        return NextResponse.json({
            resultat: etats.resultat,
            resultatNet: etats.resultatNet,
            controles: {
                balance: etats.controleBalance,
                comptesNonAffectes: etats.comptesNonAffectes,
                anomalies: etats.anomalies,
            },
            source: {
                type: n.source.type,
                detail: n.source,
                ecrituresN: n.source.type === "JOURNAL" ? n.source.ecritures : n.source.lignes,
                ecrituresN1: n1.source.type === "JOURNAL" ? n1.source.ecritures : n1.source.lignes,
                periode,
                periodeN1,
            },
        });
    } catch (error) {
        console.error("Erreur API Resultat:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
