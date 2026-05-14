import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// GET /api/tables
export async function GET() {
  try {
    const tables = db.tables.sort((a, b) => a.number - b.number);
    return NextResponse.json(tables);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching tables" }, { status: 500 });
  }
}

// POST /api/tables
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.number) {
      return NextResponse.json({ error: "Table number is required" }, { status: 400 });
    }

    const newTable = {
      id: db.generateId("table"),
      number: Number(body.number),
      qrCode: `http://localhost:3000/menu/${body.number}`,
      status: body.status || "libre",
    };

    db.tables.push(newTable as any);

    return NextResponse.json(newTable, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating table" }, { status: 500 });
  }
}
