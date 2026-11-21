import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-helpers";
import {
  genererRapportDirection,
  type KPICabinet,
} from "@/lib/ohada/kpi-direction-cabinet";

export async function POST(req: Request) {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      cabinet?: string;
      kpis?: KPICabinet;
      kpisN1?: Partial<KPICabinet>;
    };

    if (!body || !body.kpis) {
      return NextResponse.json(
        { error: "KPIs du cabinet requis" },
        { status: 400 }
      );
    }

    const cabinet = body.cabinet || "Cabinet EXPERTISE OHADA 360";
    const rapport = genererRapportDirection(cabinet, body.kpis, body.kpisN1);
    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
