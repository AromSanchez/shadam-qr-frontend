import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Si son las credenciales de administrador correctas, simulamos el comportamiento del backend real
    if (email === "admin@system.com" && password === "admin123") {
      const response = NextResponse.json({
        first_login: false,
        role: "admin",
      });

      // Seteamos las cookies tal como lo haría el backend real para que el middleware las valide
      // Usamos un JWT mock simulado que contiene el rol de admin codificado en base64
      // Payload codificado: {"sub":1,"role":"admin"} -> eyJzdWIiOjEsInJvbGUiOiJhZG1pbiJ9
      const mockAccessToken = "header.eyJzdWIiOjEsInJvbGUiOiJhZG1pbiJ9.signature";
      
      response.cookies.set("access_token", mockAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60, // 15 minutos
        path: "/",
      });

      response.cookies.set("refresh_token", "mock_refresh_token_value", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { message: "Credenciales inválidas" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Mock Auth] Login error:", error);
    return NextResponse.json(
      { message: "Error interno del servidor mock" },
      { status: 500 }
    );
  }
}
