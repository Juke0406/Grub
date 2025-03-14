import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Paths that should only be accessible in business portal
const BUSINESS_PATHS = [
    "/business",
    "/business/inventory",
    "/business/products",
    "/business/orders",
    "/business/analytics",
    "/settings/store",
    "/settings/hours",
];

// Paths that should only be accessible in user portal
const USER_PATHS = [
    "/browse",
    "/browse/all",
    "/browse/bakeries",
    "/browse/supermarkets",
    "/reservations",
    "/reservations/active",
    "/reservations/history",
    "/reservations/ratings",
    "/settings/profile",
];

export async function middleware(request: NextRequest) {
    const currentPortal = request.cookies.get("portal")?.value || "user";
    const path = request.nextUrl.pathname;
    const sessionCookie = getSessionCookie(request);
    
    if (!sessionCookie) {
        if (path === "/login" || path === "/signup" || path === "/" || path === "/forget-password" || path === "/reset-password") {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect /browse to /browse/all
    if (path === "/browse") {
        return NextResponse.redirect(new URL("/browse/all", request.url));
    }

    // Common paths accessible in both portals
    if (path === "/" || path === "/support" || path === "/feedback") {
        return NextResponse.next();
    }

    // Check if business path is being accessed from user portal
    if (
        currentPortal === "user" &&
        BUSINESS_PATHS.some((p) => path.startsWith(p))
    ) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user path is being accessed from business portal
    if (
        currentPortal === "business" &&
        USER_PATHS.some((p) => path.startsWith(p))
    ) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
