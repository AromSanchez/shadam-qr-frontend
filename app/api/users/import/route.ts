import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/**
 * GET - Proxy to download the import template (.xlsx)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const backendRes = await fetch(`${BACKEND_URL}/users/import/template`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!backendRes.ok) {
      const text = await backendRes.text();
      return new NextResponse(text, {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = await backendRes.arrayBuffer();
    const contentType =
      backendRes.headers.get("Content-Type") ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const contentDisposition =
      backendRes.headers.get("Content-Disposition") ||
      'attachment; filename="plantilla_pensionistas.xlsx"';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("[Users Import Template] Error:", error);
    return NextResponse.json(
      { message: "Error de conexion con el servidor" },
      { status: 502 }
    );
  }
}

/**
 * POST - Proxy multipart form-data upload to backend
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    // Read the raw body as ArrayBuffer to forward as-is
    const body = await request.arrayBuffer();
    const contentType = request.headers.get("content-type") || "";

    const backendRes = await fetch(`${BACKEND_URL}/users/import`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Cookie: cookieHeader,
      },
      body: body,
    });

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await backendRes.text();

    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("[Users Import] Error:", error);
    return NextResponse.json(
      { message: "Error de conexion con el servidor" },
      { status: 502 }
    );
  }
}
