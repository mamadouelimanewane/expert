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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        // Routes publiques : login et la landing page
        if (pathname === "/login" || pathname === "/" || pathname.startsWith("/api/auth")) {
          return true;
        }
        // Toutes les autres routes nécessitent une authentification
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
