import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";
import { randomBytes } from "crypto";

// Jamais `secret` dans la liste : il n'est renvoyé qu'une fois, à la
// création (voir POST ci-dessous).
const SAFE_SELECT = {
  id: true,
  url: true,
  event: true,
  isActive: true,
  createdAt: true,
  createdBy: { select: { firstName: true, lastName: true } },
};

const HOTES_INTERDITS = /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|\[?::1\]?|\[?fc[0-9a-f]{2}:.*|\[?fe80:.*)$/i;

function analyserUrlWebhook(brut: unknown): { ok: true; url: string } | { ok: false; raison: string } {
  if (typeof brut !== "string" || brut.length > 2048) return { ok: false, raison: "URL invalide." };
  let u: URL;
  try { u = new URL(brut); } catch { return { ok: false, raison: "URL invalide." }; }
  if (u.protocol !== "https:") return { ok: false, raison: "Seules les URL https:// sont acceptées." };
  if (u.username || u.password) return { ok: false, raison: "Les identifiants dans l'URL ne sont pas acceptés." };
  if (HOTES_INTERDITS.test(u.hostname) || !u.hostname.includes(".")) {
    return { ok: false, raison: "L'URL doit pointer vers un hôte public (pas d'adresse locale ou privée)." };
  }
  return { ok: true, url: u.toString() };
}

export async function GET() {
  try {
    const webhooks = await prisma.webhook.findMany({ select: SAFE_SELECT, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("Erreur GET webhooks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { url, event } = body;

    if (!url || !event) {
      return NextResponse.json({ error: "URL et événement requis" }, { status: 400 });
    }
    // Le serveur appellera cette URL avec un secret : sans contrôle, un compte
    // staff pouvait enregistrer http://localhost/… ou une adresse privée et
    // faire sonder le réseau interne par l'application (SSRF).
    const controle = analyserUrlWebhook(url);
    if (!controle.ok) {
      return NextResponse.json({ error: controle.raison }, { status: 400 });
    }

    const secret = randomBytes(24).toString("hex");

    const webhook = await prisma.webhook.create({
      data: { url: controle.url, event, isActive: true, secret, createdById: session.id },
      select: SAFE_SELECT,
    });

    return NextResponse.json({ webhook, secret }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST webhooks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await AuthService.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    await prisma.webhook.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE webhooks:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
