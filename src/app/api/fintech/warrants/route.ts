import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  evaluerGageWarrantAgricole,
  type InputGageAgricole,
} from "@/lib/ohada/gages-warrants-agricoles";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      input?: InputGageAgricole;
      tonnesPourMainlevee?: number;
    };

    if (!body || !body.input) {
      return NextResponse.json(
        { error: "Données de portefeuille nanti manquantes" },
        { status: 400 }
      );
    }

    const rapport = evaluerGageWarrantAgricole(
      body.input,
      body.tonnesPourMainlevee || 50
    );

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
