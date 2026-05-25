import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const response = NextResponse.json(data, { status: backendRes.status });
    const setCookies = backendRes.headers.getSetCookie();

    if (setCookies) {
      for (const cookie of setCookies) {
        response.headers.append("Set-Cookie", cookie);
      }
    }

    return response;
  } catch (error) {
    console.error("[Proxy Auth] Login error:", error);
    return NextResponse.json(
      { message: "Error de conexión con el servidor" },
      { status: 502 }
    );
  }
}
