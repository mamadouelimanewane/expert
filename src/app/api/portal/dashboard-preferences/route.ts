import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Preferences d'affichage du tableau de bord portail, persistees cote
// serveur (et non plus seulement dans le navigateur du client) pour
// survivre a un changement d'appareil. Authentification par le token
// portail lui-meme (meme principe que /api/portal/[token]), pas de
// session staff : ce n'est pas une route interne au cabinet.

async function resoudreClient(token: string) {
  const client = await prisma.client.findFirst({ where: { portalToken: token } });
  if (!client) return { erreur: "Portail introuvable. Vérifiez votre lien d'accès.", status: 404 as const };
  if (!client.portalEnabled) return { erreur: "Ce portail a été désactivé par votre cabinet comptable.", status: 403 as const };
  return { client };
}

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });

    const resolu = await resoudreClient(token);
    if ("erreur" in resolu) return NextResponse.json({ error: resolu.erreur }, { status: resolu.status });

    const pref = await prisma.workPaper.findUnique({
      where: { clientId_type: { clientId: resolu.client.id, type: "PORTAL_DASHBOARD" } },
    });

    return NextResponse.json({ widgets: (pref?.data as { widgets?: unknown } | undefined)?.widgets ?? null });
  } catch (error) {
    console.error("Erreur GET portal/dashboard-preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, widgets } = body;
    if (!token || widgets === undefined) {
      return NextResponse.json({ error: "token et widgets requis" }, { status: 400 });
    }

    const resolu = await resoudreClient(token);
    if ("erreur" in resolu) return NextResponse.json({ error: resolu.erreur }, { status: resolu.status });

    await prisma.workPaper.upsert({
      where: { clientId_type: { clientId: resolu.client.id, type: "PORTAL_DASHBOARD" } },
      update: { data: { widgets } },
      create: { clientId: resolu.client.id, type: "PORTAL_DASHBOARD", data: { widgets } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur PUT portal/dashboard-preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
