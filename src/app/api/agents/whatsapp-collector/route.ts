import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  traiterCollecteWhatsApp,
  type PieceAttendueDossier,
  type MessageWhatsAppPiece,
} from "@/lib/ohada/agent-whatsapp-collector";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      clientNom?: string;
      exercice?: number;
      periode?: string;
      piecesAttendues?: PieceAttendueDossier[];
      messagesRecus?: MessageWhatsAppPiece[];
    };

    if (!body || !body.piecesAttendues) {
      return NextResponse.json(
        { error: "Liste des pièces attendues manquante" },
        { status: 400 }
      );
    }

    const rapport = traiterCollecteWhatsApp(
      body.clientNom || "DOSSIER DÉMO SA",
      body.exercice || new Date().getFullYear(),
      body.periode || "Mois en cours",
      body.piecesAttendues,
      body.messagesRecus || []
    );

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
