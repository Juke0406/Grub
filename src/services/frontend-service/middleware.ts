import { NextResponse } from "next/server";

// Minimal middleware implementation with a proper response
export function middleware() {
  return NextResponse.next();
}

// Export a specific matcher with source pattern
export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      has: [],
    },
  ],
};
