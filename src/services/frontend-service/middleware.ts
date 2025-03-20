import { NextResponse, type NextRequest } from "next/server";

// Test with standard edge runtime
export const runtime = "edge";

export function middleware(request: NextRequest) {
  // Simple logging header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-middleware-cache", "no-cache");

  // Just pass through all requests
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Simple matcher for home page only for testing
  matcher: "/",
};
