import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.isActive) {
            return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
        }

        const isValid = await AuthService.comparePasswords(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
        }

        // Créer la session
        await AuthService.createSession({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        });

        // Logger la connexion
        await prisma.auditLog.create({
            data: {
                action: "LOGIN",
                entity: "User",
                entityId: user.id,
                userId: user.id,
                details: "Connexion réussie"
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });

    } catch (error) {
        console.error("[Login API] Error:", error);
        return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
    }
}
