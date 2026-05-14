import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function GET() {
  try {
    return NextResponse.json(db.pensionists);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching pensionists" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-generate QR code based on code (e.g., PEN-0002)
    const code = `PEN-${(db.pensionists.length + 1).toString().padStart(4, "0")}`;
    
    const newPensionist = {
      id: db.generateId("pen"),
      fullName: body.fullName,
      dni: body.dni,
      code: code,
      phone: body.phone || "",
      qrCode: code, // In a real app this could be a signed JWT or a URL
      planType: body.planType || "cupos",
      status: body.status || "active",
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      balance: body.balance || 0,
      breakfastCredits: body.breakfastCredits || 0,
      lunchCredits: body.lunchCredits || 0,
      dinnerCredits: body.dinnerCredits || 0,
      createdAt: new Date().toISOString(),
    };

    db.pensionists.push(newPensionist as any);

    return NextResponse.json(newPensionist, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating pensionist" }, { status: 500 });
  }
}
