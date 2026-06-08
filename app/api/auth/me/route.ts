import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "No session active" }, { status: 401 });
    }

    const payload = decodeJwtPayload(accessToken);

    if (!payload || !payload.role) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    // For admin: return basic info from JWT
    if (payload.role === "admin") {
      return NextResponse.json({
        id: payload.sub,
        role: "admin",
        name: "Administrador",
      });
    }

    // For pensioner: fetch full profile from backend
    if (payload.role === "pensioner") {
      try {
        const cookieHeader = request.headers.get("cookie") || "";
        const backendRes = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Cookie: cookieHeader },
        });

        if (backendRes.ok) {
          const userData = await backendRes.json();
          return NextResponse.json(userData);
        }
      } catch {
        // Fallback to JWT payload data
      }

      return NextResponse.json({
        id: payload.sub,
        role: "pensioner",
      });
    }

    return NextResponse.json({ message: "Invalid role" }, { status: 401 });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
