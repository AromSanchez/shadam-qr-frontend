import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Mock validation: any password works for known emails
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "Usuario inactivo" }, { status: 403 });
    }

    // Set a mock session cookie
    const cookieStore = await cookies();
    cookieStore.set("session_id", user.id, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
