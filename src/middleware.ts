import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// ── User-Agents de bots connus à bloquer ──────────────────────────────────
const BOT_UA_PATTERNS = [
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /python-urllib/i,
  /scrapy/i,
  /httpx/i,
  /go-http-client/i,
  /java\/\d/i,
  /libwww-perl/i,
  /mechanize/i,
  /axios\/\d/i,          // scraping scripts Node.js
  /node-fetch/i,
  /okhttp/i,
  /aiohttp/i,
  /masscan/i,
  /zgrab/i,
  /nuclei/i,
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /dirbuster/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /mj12bot/i,
  /petalbot/i,
];

// ── Routes protégées par rate limiting ────────────────────────────────────
// /api/auth/callback/credentials = endpoint login NextAuth
const RATE_LIMITED_PATHS = [
  { path: "/api/auth/callback/credentials", limit: 8,  window: 60  }, // 8 tentatives/min
  { path: "/api/auth/signin",               limit: 8,  window: 60  },
  { path: "/api/",                          limit: 120, window: 60  }, // API générale 120 req/min
];

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isBotUserAgent(ua: string | null): boolean {
  if (!ua) return true; // pas d'UA = bot probable
  return BOT_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

function botResponse(reason: string) {
  return new NextResponse(
    JSON.stringify({ error: "Forbidden", reason }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }
  );
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

// ── Routes /api/ avec leur propre mécanisme d'authentification ────────────
// (pas de session NextAuth attendue) :
//  - /api/health          : health check public (Vercel)
//  - /api/auth            : endpoints internes NextAuth
//  - /api/portal          : portail client, authentifié par portalToken opaque
//  - /api/payments/webhook, /api/webhooks : webhooks providers (signature/verify_token)
const NO_SESSION_API_PREFIXES = [
  "/api/health",
  "/api/auth",
  "/api/portal",
  "/api/payments/webhook",
  "/api/webhooks",
];

function isNoSessionApiRoute(pathname: string): boolean {
  return NO_SESSION_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// ── Contrôle de rôle par préfixe de route API ──────────────────────────────
// Toute route /api/ non exclue ci-dessus doit être appelée par un utilisateur
// staff authentifié. STAFF_ROLES s'applique par défaut ; ROLE_RULES permet de
// restreindre davantage certains préfixes (ex: /api/admin → ADMIN uniquement).
const STAFF_ROLES = ["ADMIN", "EXPERT", "COLLABORATOR", "ASSISTANT"];

const ROLE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: "/api/admin", roles: ["ADMIN"] },
  { prefix: "/api/seed", roles: ["ADMIN"] },
];

function requiredRolesFor(pathname: string): string[] {
  for (const rule of ROLE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(rule.prefix + "/")) {
      return rule.roles;
    }
  }
  return STAFF_ROLES;
}

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;
    const ip = getClientIp(req);
    const ua = req.headers.get("user-agent");
    const method = req.method;

    // ── 1. DÉTECTION BOT USER-AGENT ────────────────────────────────────────
    // Exclure les routes NextAuth internes (_next, api/auth/session…)
    // On bloque sur les routes sensibles uniquement pour ne pas casser l'infra
    const isSensitiveRoute =
      pathname.startsWith("/api/") ||
      pathname === "/login" ||
      pathname === "/";

    if (isSensitiveRoute && method === "POST" && isBotUserAgent(ua)) {
      return botResponse("bot_user_agent");
    }

    // ── 2. RATE LIMITING ───────────────────────────────────────────────────
    for (const rule of RATE_LIMITED_PATHS) {
      if (pathname.startsWith(rule.path)) {
        const key = `rl:${rule.path}:${ip}`;
        const result = rateLimit(key, rule.limit, rule.window);
        if (!result.success) {
          const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
          const resp = new NextResponse(
            JSON.stringify({
              error: "Too Many Requests",
              retryAfter,
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfter),
                "X-RateLimit-Limit": String(rule.limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": String(result.resetAt),
              },
            }
          );
          return addSecurityHeaders(resp);
        }
        break;
      }
    }

    // ── 3. LOGIQUE AUTHENTIFICATION EXISTANTE ──────────────────────────────
    if ((pathname === "/login" || pathname === "/") && token) {
      const role = token.role as string;
      const dest = role === "EXPERT" || role === "ADMIN"
        ? "/dashboard"
        : "/comptabilite/production";
      const resp = NextResponse.redirect(new URL(dest, req.url));
      return addSecurityHeaders(resp);
    }

    if (pathname.startsWith("/api/") && !isNoSessionApiRoute(pathname)) {
      if (!token) {
        const resp = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return addSecurityHeaders(resp);
      }

      const role = token.role as string | undefined;
      const allowedRoles = requiredRolesFor(pathname);
      if (!role || !allowedRoles.includes(role)) {
        const resp = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return addSecurityHeaders(resp);
      }
    }

    const resp = NextResponse.next();
    return addSecurityHeaders(resp);
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        if (
          pathname === "/login" ||
          pathname === "/" ||
          pathname === "/api/health" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        if (pathname.startsWith("/api/")) {
          return true;
        }
        // Le portail client (/portal/*) n'est jamais authentifié par session
        // NextAuth : chaque page y lit son propre ?token=/[token] et appelle
        // /api/portal/[token] (déjà exempté ci-dessus), exactement comme
        // AppShell le traite déjà en route publique (isPublicRoute inclut
        // startsWith("/portal")). Sans cette exception, un client externe
        // sans identifiants staff — le seul public visé par ce lien — était
        // systématiquement rejeté vers /login : le portail client était
        // entièrement inaccessible à ses utilisateurs réels.
        if (pathname.startsWith("/portal")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Les ressources statiques servies depuis /public doivent être exclues :
    // sans cette exclusion, `authorized()` renvoyait false pour /sw.js et le
    // navigateur recevait une redirection 307 vers /login au lieu du script.
    // L'enregistrement du service worker échouait donc à chaque chargement.
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|robots\\.txt|api/auth/session|api/auth/csrf).*)",
  ],
};
