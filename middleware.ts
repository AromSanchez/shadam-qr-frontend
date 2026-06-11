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
const ADMIN_ROUTES = ["/portal", "/dashboard", "/recepcion"];

// Routes that require pensioner (or admin) authentication
const PENSIONER_ROUTES = ["/pensionista"];

// Routes that should NOT be protected under /pensionista
const PENSIONER_PUBLIC_ROUTES = ["/pensionista/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read access_token cookie
  const accessToken = request.cookies.get("access_token")?.value;

  // Check if the path is a pensioner public route (login)
  const isPensionerPublic = PENSIONER_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPensionerPublic) {
    return NextResponse.next();
  }

  // Check if it's a pensioner protected route
  const isPensionerProtected = PENSIONER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPensionerProtected) {
    if (!accessToken) {
      const loginUrl = new URL("/pensionista/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(accessToken);

    if (!payload || (payload.role !== "pensioner" && payload.role !== "admin")) {
      const loginUrl = new URL("/pensionista/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Check if the current path starts with any admin protected route
  const isAdminProtected = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isAdminProtected) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT to check role
  const payload = decodeJwtPayload(accessToken);

  if (!payload || payload.role !== "admin") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin authenticated → allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/dashboard/:path*",
    "/recepcion/:path*",
    "/pensionista",
    "/pensionista/((?!login).*)",
  ],
};
