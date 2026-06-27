import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

// Reset passwords pour tous les comptes de démo
// Accessible uniquement aux ADMIN authentifiés
export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const accounts = [
    { email: "expert@cabinet360.com", password: "expert2026", role: "EXPERT" },
    { email: "collaborator@cabinet360.com", password: "collab2026", role: "COLLABORATOR" },
  ];

  const results = [];

  for (const account of accounts) {
    const hashed = await bcrypt.hash(account.password, 10);
    const updated = await prisma.user.updateMany({
      where: { email: account.email },
      data: { password: hashed },
    });
    results.push({
      email: account.email,
      role: account.role,
      updated: updated.count > 0,
    });
  }

  return NextResponse.json({
    success: true,
    message: "Mots de passe réinitialisés",
    results,
  });
}
