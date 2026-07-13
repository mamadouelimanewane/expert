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

    const secret = randomBytes(24).toString("hex");

    const webhook = await prisma.webhook.create({
      data: { url, event, isActive: true, secret, createdById: session.id },
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
