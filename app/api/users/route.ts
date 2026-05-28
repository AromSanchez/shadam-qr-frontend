import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        name: body.name,
        dni: body.dni,
      }),
    });

    const data = await readJson(backendRes);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { message: "No se pudo crear el pensionista" }, { status: backendRes.status });
    }

    return NextResponse.json(data ?? {}, { status: 201 });
  } catch (error) {
    console.error("[Users API POST] Error:", error);
    return NextResponse.json(
      { message: "Error de conexion con el servidor" },
      { status: 502 }
    );
  }
}
