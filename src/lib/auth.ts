import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          // Comptes de démo pour les tests
          if (credentials.email === "expert@gantic360.com" && credentials.password === "password") {
             return { id: "demo-expert", email: credentials.email, name: "Mamadou Eliman", role: "EXPERT" } as any;
          }
          if (credentials.email === "collab@gantic360.com" && credentials.password === "password") {
             return { id: "demo-collab", email: credentials.email, name: "Aminata Fall", role: "COLLABORATOR" } as any;
          }
          throw new Error("Identifiants incorrects ou compte inactif");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

// ──────────────────────────────────────────────
// AuthService — compatibilité avec le code existant
// Utilisé dans audit.ts, les API routes, etc.
// ──────────────────────────────────────────────
export class AuthService {
  /**
   * Récupère la session serveur courante (pour les Server Components & Route Handlers)
   */
  static async getSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return {
      id: (session.user as any).id as string,
      email: session.user.email as string,
      name: session.user.name as string,
      role: (session.user as any).role as string,
    };
  }

  /**
   * Vérifie si la session est valide côté serveur
   */
  static async requireAuth() {
    const session = await AuthService.getSession();
    if (!session) {
      throw new Error("Non authentifié");
    }
    return session;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  static async requireRole(roles: string[]) {
    const session = await AuthService.requireAuth();
    if (!roles.includes(session.role)) {
      throw new Error("Accès refusé : rôle insuffisant");
    }
    return session;
  }
}
