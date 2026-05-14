import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json({ error: "Código QR es requerido" }, { status: 400 });
    }

    const pensionist = db.pensionists.find(p => p.qrCode === qrCode);

    if (!pensionist) {
      return NextResponse.json({ error: "Pensionista no encontrado" }, { status: 404 });
    }

    // Validation 1: Status
    if (pensionist.status !== "active") {
      return NextResponse.json({ error: "No se puede registrar consumo. Usuario inactivo." }, { status: 403 });
    }

    // Validation 2: Date
    const now = new Date();
    const endDate = new Date(pensionist.endDate);
    if (now > endDate) {
      return NextResponse.json({ error: "No se puede registrar consumo. Plan vencido." }, { status: 403 });
    }

    // Include consumption history for the profile view
    const consumptions = db.consumptions
      .filter(c => c.pensionistId === pensionist.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      ...pensionist,
      consumptions
    });

  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
