import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    if (
      path === "/login" ||
      path === "/signup" ||
      path === "/" ||
      path === "/forget-password" ||
      path === "/reset-password" ||
      path === "/email-verified" ||
      path === "/change-email"
    ) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except those that start with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - manifest.json (PWA manifest)
    // - /android (PWA icons)
    // - /ios (PWA icons)
    // - /windows11 (PWA icons)
    // - workbox (service worker)
    // - sw.js (service worker)
    "/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|android|ios|windows11|workbox|sw\\.js).*)",
  ],
};
