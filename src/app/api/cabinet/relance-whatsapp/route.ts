import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  planifierRelances,
  marquerPieceRecue,
  type PieceManquante,
  type ConfigRelance,
} from "@/lib/ohada/relance-pieces-whatsapp";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action: "planifier" | "marquer_recue";
      pieces?: PieceManquante[];
      config?: ConfigRelance;
      pieceId?: string;
      plans?: ReturnType<typeof planifierRelances>;
      dateDepart?: string;
    };

    if (body.action === "planifier") {
      if (!body.pieces || !body.config) {
        return NextResponse.json({ error: "pieces et config requis" }, { status: 400 });
      }
      const plans = planifierRelances(body.pieces, body.config, body.dateDepart);
      return NextResponse.json(plans);
    }

    if (body.action === "marquer_recue") {
      if (!body.plans || !body.pieceId) {
        return NextResponse.json({ error: "plans et pieceId requis" }, { status: 400 });
      }
      const updated = marquerPieceRecue(body.plans, body.pieceId);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
