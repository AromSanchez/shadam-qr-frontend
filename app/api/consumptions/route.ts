import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function GET() {
  try {
    // Return consumptions with pensionist details
    const consumptionsWithDetails = db.consumptions.map(c => {
      const pensionist = db.pensionists.find(p => p.id === c.pensionistId);
      return {
        ...c,
        pensionistName: pensionist?.fullName || "Desconocido",
        pensionistCode: pensionist?.code || "N/A"
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(consumptionsWithDetails);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching consumptions" }, { status: 500 });
  }
}
