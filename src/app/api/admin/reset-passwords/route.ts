import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getToken } from "next-auth/jwt";


import prisma from "@/lib/prisma";
import { parseBody, resetPasswordsSchema } from "@/lib/validation";

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

  const { data, invalid } = await parseBody(req, resetPasswordsSchema);
  if (invalid) return invalid;

  const results = [];

  for (const email of data.emails) {
    const newPassword = randomBytes(18).toString("base64url");
    // Coût 12, aligné sur les scripts de seed et de rotation.
    const hashed = await bcrypt.hash(newPassword, 12);
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
