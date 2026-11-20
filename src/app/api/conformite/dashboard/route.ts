import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { genererTableauBord } from "@/lib/ohada/conformite-dashboard";

export async function GET(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const { searchParams } = new URL(req.url);
        const pays = searchParams.get("pays") || "SN";
        const annee = parseInt(searchParams.get("annee") || new Date().getFullYear().toString(), 10);
        const mois = parseInt(searchParams.get("mois") || (new Date().getMonth() + 1).toString(), 10);
        const deposeesParam = searchParams.get("deposees") || "";
        const deposees = deposeesParam ? deposeesParam.split(",").map(s => s.trim()) : [];

        const tableau = genererTableauBord(pays, annee, mois, deposees);

        return NextResponse.json({ tableau });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
