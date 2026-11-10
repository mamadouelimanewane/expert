import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { slugifyCabinet } from "@/lib/tenant";

// ============================================================
// POST /api/admin/seed-demo  — ADMIN UNIQUEMENT
//
// Crée (ou réinitialise) le compte démo "demo@cabinet360.com"
// avec le mot de passe DEMO_PASSWORD (env var) ou la valeur
// par défaut DemoTrial2026! si la variable n'est pas définie.
//
// Ce endpoint est protégé par rôle ADMIN via le middleware et
// la vérification de session ci-dessous.
// ============================================================

const DEMO_EMAIL    = "demo@cabinet360.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "DemoTrial2026!";

export async function POST() {
  // Double vérification de session même si le middleware filtre déjà /api/admin
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  try {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    // ── 1. Créer ou retrouver le cabinet démo ──────────────────────────
    const slug = slugifyCabinet("Cabinet Démo 360");
    let cabinet = await prisma.cabinet.findUnique({ where: { slug } });

    if (!cabinet) {
      cabinet = await prisma.cabinet.create({
        data: {
          slug,
          nom: "Cabinet Démo 360",
          plan: "PRO",          // démo sur plan Pro pour montrer toutes les fonctionnalités
          statut: "ACTIVE",    // toujours actif, pas d'expiration pour la démo
          trialExpiresAt: null,
          pays: "SN",
          maxDossiers: 999_999,
          maxCollaborateurs: 999_999,
        },
      });
    }

    // ── 2. Créer ou mettre à jour l'utilisateur démo ───────────────────
    const demoUser = await prisma.user.upsert({
      where:  { email: DEMO_EMAIL },
      update: {
        password: hashedPassword,
        isActive: true,
        cabinetId: cabinet.id,
        firstName: "Expert",
        lastName: "Démo",
        role: "EXPERT",
      },
      create: {
        email:     DEMO_EMAIL,
        password:  hashedPassword,
        firstName: "Expert",
        lastName:  "Démo",
        role:      "EXPERT",
        isActive:  true,
        cabinetId: cabinet.id,
      },
    });

    console.log("[seed-demo] Compte démo initialisé :", demoUser.email);

    return NextResponse.json({
      success: true,
      message: "Compte démo initialisé avec succès.",
      email: DEMO_EMAIL,
      cabinetSlug: slug,
      note: "Le mot de passe est lu depuis la variable d'environnement DEMO_PASSWORD.",
    });
  } catch (error: any) {
    console.error("[seed-demo] Erreur :", error);
    return NextResponse.json(
      { error: "Impossible d'initialiser le compte démo.", detail: error?.message },
      { status: 500 }
    );
  }
}
