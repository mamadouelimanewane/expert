import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }

    const assets = await prisma.personalAsset.findMany({
      where: { clientId },
      orderBy: { estimatedValue: "desc" },
    });

    return NextResponse.json({ assets, total: assets.reduce((s, a) => s + a.estimatedValue, 0) });
  } catch (error) {
    console.error("Erreur GET wealth/assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await AuthService.requireAuth();
    const body = await req.json();
    const { clientId, label, type, estimatedValue, acquisitionDate, notes } = body;

    if (!clientId || !label || !estimatedValue) {
      return NextResponse.json({ error: "clientId, label et estimatedValue requis" }, { status: 400 });
    }

    const asset = await prisma.personalAsset.create({
      data: {
        clientId,
        label,
        type: type || "AUTRE",
        estimatedValue: Number(estimatedValue),
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : undefined,
        notes,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "Non authentifié") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    console.error("Erreur POST wealth/assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
