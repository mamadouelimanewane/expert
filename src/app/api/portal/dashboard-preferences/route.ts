import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withPortalClient } from "@/lib/portal-auth";

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });
    const response = await withPortalClient(token, async (client) => {
      const preference = await prisma.workPaper.findUnique({
        where: { clientId_type: { clientId: client.id, type: "PORTAL_DASHBOARD" } },
      });
      return NextResponse.json({ widgets: (preference?.data as { widgets?: unknown } | undefined)?.widgets ?? null });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  } catch (error) {
    console.error("Erreur GET portal/dashboard-preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, widgets } = body;
    if (!token || widgets === undefined) return NextResponse.json({ error: "token et widgets requis" }, { status: 400 });
    if (JSON.stringify(widgets).length > 20_000) return NextResponse.json({ error: "Préférences trop volumineuses" }, { status: 413 });

    const response = await withPortalClient(token, async (client) => {
      await prisma.workPaper.upsert({
        where: { clientId_type: { clientId: client.id, type: "PORTAL_DASHBOARD" } },
        update: { data: { widgets } },
        create: { clientId: client.id, type: "PORTAL_DASHBOARD", data: { widgets } },
      });
      return NextResponse.json({ success: true });
    });
    return response ?? NextResponse.json({ error: "Portail introuvable ou désactivé" }, { status: 401 });
  } catch (error) {
    console.error("Erreur PUT portal/dashboard-preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
