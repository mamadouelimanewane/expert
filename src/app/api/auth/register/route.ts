import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cabinetName, email, phone, country, dossiersCount, password } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Adresse e-mail valide requise." }, { status: 400 });
    }

    const emailNormalise = email.trim().toLowerCase();

    // Vérifier si l'utilisateur existe déjà
    const existant = await prisma.user.findUnique({
      where: { email: emailNormalise },
    });

    if (existant) {
      return NextResponse.json({
        success: true,
        message: "Compte existant. Vous pouvez vous connecter directement.",
        email: existant.email,
        isNew: false,
      });
    }

    // Mot de passe par défaut ou généré
    const motDePasseFinal = password && password.length >= 8 
      ? password 
      : randomBytes(8).toString("hex") + "A1!";
    const hashedPassword = await bcrypt.hash(motDePasseFinal, 10);

    const nomCabinetPropre = (cabinetName || "Cabinet").trim();
    const [prenom, ...resteNom] = nomCabinetPropre.split(" ");
    const nomFamille = resteNom.join(" ") || "Expertise";

    // Créer le compte utilisateur EXPERT
    const newUser = await prisma.user.create({
      data: {
        email: emailNormalise,
        password: hashedPassword,
        firstName: prenom || "Expert",
        lastName: nomFamille || "Cabinet 360",
        role: "EXPERT",
        phone: phone || null,
        isActive: true,
      },
    });

    // Créer une notification d'accueil dans le système
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
