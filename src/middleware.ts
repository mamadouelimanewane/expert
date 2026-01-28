import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/api/auth/login', '/api/payments/webhook'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Get the session cookie
    const session = request.cookies.get('cabinet360_session')?.value;

    // 1. If trying to access a protected path without a session, redirect to login
    if (!session && !isPublicPath && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. If already logged in and trying to access login page, redirect to dashboard
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
    ],
};
