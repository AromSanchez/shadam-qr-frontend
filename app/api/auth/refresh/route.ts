import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    // Forward cookies from browser to backend
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Forward new Set-Cookie headers (new access_token)
    const response = NextResponse.json(data);
    const setCookies = backendRes.headers.getSetCookie();
    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("[Proxy] Refresh error:", error);
    return NextResponse.json(
      { message: "Error de conexión con el servidor" },
      { status: 502 }
    );
  }
}
