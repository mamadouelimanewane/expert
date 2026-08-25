import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-auth";
import { cribleSanctions } from "@/lib/sanctions-screening";
import { AuditService } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const { denied } = await requireStaff();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { nom } = body as { nom?: string };
    if (!nom || nom.trim().length < 2) {
      return NextResponse.json({ error: "Nom requis (2 caractères minimum)" }, { status: 400 });
    }

    const resultats = await cribleSanctions(nom.trim());

    await AuditService.log({
      action: "SANCTIONS_CHECK",
      entity: "OSINT",
      entityId: nom.trim(),
      details: `Criblage sanctions pour "${nom.trim()}" : ${resultats.reduce((s, r) => s + r.correspondances.length, 0)} correspondance(s)`,
    });

    return NextResponse.json({ resultats });
  } catch (error) {
    console.error("Erreur POST sanctions-check:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
