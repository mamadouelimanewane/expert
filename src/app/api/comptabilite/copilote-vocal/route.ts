import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  interpreterNoteVocaleTerroir,
  type NoteVocaleBrute,
} from "@/lib/ohada/copilote-vocal-terroir";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      note?: NoteVocaleBrute;
      soldeCaissePrecedent_XOF?: number;
    };

    if (!body || !body.note) {
      return NextResponse.json(
        { error: "Note vocale manquante" },
        { status: 400 }
      );
    }

    const rapport = interpreterNoteVocaleTerroir(
      body.note,
      body.soldeCaissePrecedent_XOF || 100_000
    );

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
