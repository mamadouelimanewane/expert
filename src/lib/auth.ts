import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
const COOKIE_NAME = "cabinet360_session";

export interface SessionUser {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
}

export class AuthService {
    /**
     * Hache un mot de passe
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    /**
     * Vérifie un mot de passe
     */
    static async comparePasswords(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Génère un token JWT et l'enregistre dans un cookie
     */
    static async createSession(user: SessionUser) {
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1d" });

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 jour
            path: "/"
        });

        return token;
    }

    /**
     * Récupère la session actuelle
     */
    static async getSession(): Promise<SessionUser | null> {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;

        if (!token) return null;

        try {
            return jwt.verify(token, JWT_SECRET) as SessionUser;
        } catch (error) {
            return null;
        }
    }

    /**
     * Détruit la session
     */
    static async logout() {
        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME);
    }
}
