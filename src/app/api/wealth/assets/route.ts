import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaff, requireWriteAccess } from "@/lib/api-auth";
import { isObjectId } from "@/lib/tenant-security";

export async function GET(req: NextRequest) {
  try {
    const { session, denied } = await requireStaff();
    if (denied) return denied;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId requis" }, { status: 400 });
    }
    if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide" }, { status: 400 });
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const assets = await prisma.personalAsset.findMany({
      where: { clientId, cabinetId: session.cabinetId },
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
    const { session, denied } = await requireWriteAccess();
    if (denied) return denied;
    const body = await req.json();
    const { clientId, label, type, estimatedValue, acquisitionDate, notes } = body;

    if (!clientId || !label || !estimatedValue) {
      return NextResponse.json({ error: "clientId, label et estimatedValue requis" }, { status: 400 });
    }
    if (!isObjectId(clientId)) return NextResponse.json({ error: "clientId invalide" }, { status: 400 });
    const client = await prisma.client.findFirst({ where: { id: clientId, cabinetId: session.cabinetId }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client introuvable dans ce cabinet." }, { status: 404 });

    const asset = await prisma.personalAsset.create({
      data: {
        cabinetId: session.cabinetId,
        clientId,
        label,
        type: type || "AUTRE",
        estimatedValue: Number(estimatedValue),
        acquisitionDate: acquisitionDate ? new Date(acquisitionDate) : undefined,
        notes,
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erreur POST wealth/assets:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
