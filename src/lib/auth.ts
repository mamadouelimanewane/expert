import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

// Empreinte bcrypt d'une valeur qui n'est le mot de passe d'aucun compte :
// elle sert uniquement a faire travailler bcrypt lorsque l'adresse saisie
// n'existe pas, afin que la reponse prenne le meme temps.
const EMPREINTE_LEURRE = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        _hp: { label: "Phone", type: "text" }, // honeypot
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        // Honeypot côté serveur : si _hp est rempli → bot
        if (credentials._hp && credentials._hp.trim() !== "") {
          // Délai artificiel pour ralentir l'attaquant, puis rejet silencieux
          await new Promise((r) => setTimeout(r, 2000));
          throw new Error("Identifiants incorrects ou compte inactif");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Le message d'echec ne doit pas distinguer « compte inexistant » de
        // « mot de passe faux » : la version precedente repondait
        // « Identifiants incorrects ou compte inactif » dans le premier cas et
        // « Mot de passe incorrect » dans le second, ce qui permettait
        // d'enumerer les adresses reellement inscrites depuis la page de
        // connexion. Le hachage est de plus toujours execute, pour ne pas
        // laisser le temps de reponse trahir l'existence du compte.
        const ECHEC = "Identifiants incorrects ou compte inactif";
        const empreinte = user?.password ?? EMPREINTE_LEURRE;
        const motDePasseValide = await bcrypt.compare(credentials.password, empreinte);

        if (!user || !user.isActive || !motDePasseValide) {
          throw new Error(ECHEC);
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
