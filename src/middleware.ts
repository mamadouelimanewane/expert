import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const pathname = req.nextUrl.pathname;

    // Redirection selon le rôle après login
    if (pathname === "/login" && token) {
      const role = token.role as string;
      if (role === "EXPERT" || role === "ADMIN") {
        return NextResponse.redirect(new URL("/bi", req.url));
      }
      return NextResponse.redirect(new URL("/comptabilite/production", req.url));
    }

    // Routes API sans token → 401 JSON (pas de redirect HTML)
    // /api/health et /api/auth sont publics
    if (
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/auth") &&
      pathname !== "/api/health" &&
      !token
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Routes publiques
        if (
          pathname === "/login" ||
          pathname === "/" ||
          pathname === "/api/health" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        // Routes API : laisser passer (le middleware ci-dessus gère le 401)
        if (pathname.startsWith("/api/")) {
          return true;
        }
        // Pages UI : authentification requise
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
