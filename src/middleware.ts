import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Middleware minimaliste: protège uniquement /pro/**
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Vérifier les rôles pour les routes admin
    if (req.nextUrl.pathname.startsWith('/pro/admin')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/pro?error=unauthorized', req.url));
      }
    }

    // Headers de sécurité (réponse courante)
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Autoriser seulement si un token existe (sur /pro/** uniquement)
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/pro/:path*']
};
