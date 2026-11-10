import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { slugifyCabinet, PLAN_LIMITS } from "@/lib/tenant";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cabinetName, email, phone, country, dossiersCount, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse e-mail valide requise." }, { status: 400 });
    }

    const emailNormalise = email.trim().toLowerCase();
    const nomCabinetPropre = (cabinetName || "Cabinet").trim();

    // Vérifier si l'utilisateur existe déjà
    const existant = await prisma.user.findUnique({
      where: { email: emailNormalise },
      include: { cabinet: true },
    });

    if (existant) {
      return NextResponse.json({
        success: true,
        message: "Compte existant. Vous pouvez vous connecter directement.",
        email: existant.email,
        isNew: false,
      });
    }

    // Mot de passe par défaut ou généré aléatoirement
    const motDePasseFinal = password && password.length >= 8
      ? password
      : randomBytes(8).toString("hex") + "A1!";
    const hashedPassword = await bcrypt.hash(motDePasseFinal, 10);

    const [prenom, ...resteNom] = nomCabinetPropre.split(" ");
    const nomFamille = resteNom.join(" ") || "Expertise";

    // ── 1. Créer le Cabinet SaaS (tenant) ──────────────────────────────
    const slug = slugifyCabinet(nomCabinetPropre);
    const trialExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // +14 jours

    // Dédupliquer le slug en cas de collision
    let slugFinal = slug;
    const existing = await prisma.cabinet.findUnique({ where: { slug } });
    if (existing) {
      slugFinal = `${slug}-${randomBytes(3).toString("hex")}`;
    }

    const limits = PLAN_LIMITS.STARTER;
    const cabinet = await prisma.cabinet.create({
      data: {
        slug: slugFinal,
        nom: nomCabinetPropre,
        plan: "STARTER",
        statut: "TRIAL",
        trialExpiresAt,
        pays: country || "SN",
        phone: phone || null,
        maxDossiers: limits.dossiers,
        maxCollaborateurs: limits.collaborateurs,
      },
    });

    // ── 2. Créer le compte utilisateur EXPERT lié au cabinet ───────────
    const newUser = await prisma.user.create({
      data: {
        email: emailNormalise,
        password: hashedPassword,
        firstName: prenom || "Expert",
        lastName: nomFamille || "Cabinet 360",
        role: "EXPERT",
        phone: phone || null,
        isActive: true,
        cabinetId: cabinet.id,
      },
    });

    // ── 3. Notification d'accueil ───────────────────────────────────────
    try {
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: "Bienvenue sur Cabinet 360 SaaS",
          message: `Votre période d'essai de 14 jours pour ${nomCabinetPropre} est active. Explorez les modules et l'Usine IA pour TPE/PME.`,
          type: "INFO",
        },
      });
    } catch {
      // Non bloquant si le modèle notification requiert d'autres champs
    }

    return NextResponse.json({
      success: true,
      message: "Votre espace cabinet a été initialisé avec succès !",
      email: newUser.email,
      password: motDePasseFinal,
      cabinetSlug: slugFinal,
      trialExpiresAt: trialExpiresAt.toISOString(),
      isNew: true,
    });
  } catch (error: any) {
    console.error("[register] Erreur création compte essai :", error);
    return NextResponse.json(
      { error: "Impossible d'initialiser votre compte d'essai pour le moment. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
