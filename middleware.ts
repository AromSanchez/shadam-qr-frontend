import { NextRequest, NextResponse } from "next/server";

/**
 * Decodes a JWT payload without signature verification.
 * Only used for routing decisions — real security lives in the backend.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Handle both standard base64 and base64url encoding
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Routes that require admin authentication
const PROTECTED_ROUTES = ["/portal", "/dashboard", "/recepcion"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path starts with any protected route
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Read access_token cookie
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    // No token → redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT to check role
  const payload = decodeJwtPayload(accessToken);

  if (!payload || payload.role !== "admin") {
    // Invalid token or non-admin role → redirect to login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin authenticated → allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/dashboard/:path*", "/recepcion/:path*"],
};
