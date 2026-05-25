import { NextRequest, NextResponse } from "next/server";

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

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({
      role: "admin",
      name: "Administrador Shadam",
    });
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
