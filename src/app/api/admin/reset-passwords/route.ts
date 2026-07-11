import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

// Réinitialise le mot de passe d'un ou plusieurs comptes staff avec un
// mot de passe aléatoire fort, généré à la volée et renvoyé une seule fois
// dans la réponse (jamais stocké en clair, jamais prévisible).
// Accessible uniquement aux ADMIN authentifiés.
// Body attendu : { emails: string[] }
export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const emails: string[] = Array.isArray(body.emails) ? body.emails : [];

  if (emails.length === 0) {
    return NextResponse.json({ error: "Le champ 'emails' (liste) est requis" }, { status: 400 });
  }

  const results = [];

  for (const email of emails) {
    const newPassword = randomBytes(12).toString("base64url");
    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.user.updateMany({
      where: { email },
      data: { password: hashed },
    });
    results.push({
      email,
      updated: updated.count > 0,
      // Communiqué une seule fois à l'admin : à transmettre au titulaire par un canal sécurisé.
      newPassword: updated.count > 0 ? newPassword : undefined,
    });
  }

  return NextResponse.json({
    success: true,
    message: "Mots de passe réinitialisés",
    results,
  });
}
