import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/users/${id}/toggle`, {
      method: "PATCH",
      headers: {
        Cookie: cookieHeader,
      },
    });

    const data = await readJson(backendRes);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { message: "No se pudo cambiar el estado" }, { status: backendRes.status });
    }

    return NextResponse.json(data ?? {});
  } catch (error) {
    console.error("[Users Toggle API PATCH] Error:", error);
    return NextResponse.json(
      { message: "Error de conexion con el servidor" },
      { status: 502 }
    );
  }
}
