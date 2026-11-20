import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { evaluerFeuillesTravail, type AnalyseSectionInput } from "@/lib/ohada/audit-ai-reasoning";

export async function POST(req: NextRequest) {
    const { denied } = await requireStaff();
    if (denied) return denied;

    try {
        const body = await req.json();
        const bilan = evaluerFeuillesTravail(body as AnalyseSectionInput);
        return NextResponse.json({ bilan });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Erreur interne" },
            { status: 500 }
        );
    }
}
