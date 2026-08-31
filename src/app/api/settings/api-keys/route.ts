import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { randomBytes, createHash } from "crypto";

// Sélection de champs sûre : jamais `hashedKey` (ni la clé en clair, qui
// n'existe qu'à l'instant de la création et n'est jamais persistée).
const SAFE_SELECT = {
  id: true,
  label: true,
  keyPrefix: true,
  scopes: true,
  status: true,
  lastUsedAt: true,
  createdAt: true,
  revokedAt: true,
  createdBy: { select: { firstName: true, lastName: true } },
};

// Une cle API donne un acces programmatique a l'ensemble des donnees du
// cabinet : sa creation et sa revocation sont des actes d'administration.
// Le GET n'effectuait aucune verification dans le handler (il ne dependait que
// du middleware), et POST/PATCH acceptaient tout compte staff, y compris
// ASSISTANT — qui pouvait donc emettre une cle ou revoquer celle d'un
// integrateur en production.
export async function GET() {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  try {
    const [apiKeys, logs] = await Promise.all([
      prisma.apiKey.findMany({ select: SAFE_SELECT, orderBy: { createdAt: "desc" } }),
      prisma.apiRequestLog.findMany({
        include: { apiKey: { select: { label: true, keyPrefix: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({ apiKeys, logs });
  } catch (error) {
    console.error("Erreur GET api-keys:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { session, denied } = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { label, scopes } = body;

    if (!label) {
      return NextResponse.json({ error: "Nom de la clé requis" }, { status: 400 });
    }

    // Clé en clair générée une seule fois : elle n'est jamais stockée, seul
    // son hash SHA-256 l'est. Elle est renvoyée exactement une fois dans
    // cette réponse — c'est le comportement attendu pour une clé API.
    const rawKey = randomBytes(32).toString("hex");
    const plaintextKey = `c360_live_sk_${rawKey}`;
    const hashedKey = createHash("sha256").update(plaintextKey).digest("hex");
    const keyPrefix = plaintextKey.slice(0, 20);

    const apiKey = await prisma.apiKey.create({
      data: {
        label,
        keyPrefix,
        hashedKey,
        scopes: Array.isArray(scopes) ? scopes : [],
        status: "ACTIVE",
        createdById: session.id,
      },
      select: SAFE_SELECT,
    });

    return NextResponse.json({ apiKey, plaintextKey }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST api-keys:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { denied } = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date() },
      select: SAFE_SELECT,
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("Erreur PATCH api-keys:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
