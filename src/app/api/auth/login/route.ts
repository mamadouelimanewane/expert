import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AuthService } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
        }

        // --- MODE DÉMO / FALLBACK ---
        // Si les identifiants correspondent aux comptes de démo, on force le succès
        // Utile si la BDD de prod n'est pas encore seedée
        if (
            (email === "admin@cabinet360.com" && password === "Admin@2026!") ||
            (email === "expert@cabinet360.com" && password === "Expert@2026!")
        ) {
            const role = email.startsWith("admin") ? "ADMIN" : "EXPERT";
            const firstName = email.startsWith("admin") ? "Expert" : "Jean";
            const lastName = email.startsWith("admin") ? "Principal" : "Kouassi";

            // Simuler la création de session (à adapter selon votre implémentation AuthService)
            // Ici on suppose que AuthService.createSession gère l'état (cookies, jwt, etc.)
            await AuthService.createSession({
                id: "demo-user-id-" + role,
                email: email,
                role: role as any,
                firstName: firstName,
                lastName: lastName
            });

            return NextResponse.json({
                success: true,
                user: {
                    firstName,
                    lastName,
                    role
                }
            });
        }
        // --- FIN MODE DÉMO ---

        let user;
        try {
            user = await prisma.user.findUnique({
                where: { email }
            });
        } catch (dbError) {
            console.warn("Database connection failed, falling back to demo check already performed.");
            // Si la DB échoue et qu'on n'a pas matché le mode démo ci-dessus, on continue vers l'erreur
        }

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

        // Logger la connexion (si la DB est up)
        try {
            await prisma.auditLog.create({
                data: {
                    action: "LOGIN",
                    entity: "User",
                    entityId: user.id,
                    userId: user.id,
                    details: "Connexion réussie"
                }
            });
        } catch (e) {
            // Ignorer l'erreur de log si la DB est down
        }

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
        return NextResponse.json({
            error: `Erreur système: ${error instanceof Error ? error.message : String(error)}`
        }, { status: 500 });
    }
}
