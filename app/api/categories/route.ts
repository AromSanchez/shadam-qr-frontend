import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// GET /api/categories
export async function GET() {
  try {
    // In a real app with MongoDB:
    // const categories = await Category.find({}).sort({ order: 1 });
    const categories = db.categories.sort((a, b) => a.order - b.order);
    
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newCategory = {
      id: db.generateId("cat"),
      name: body.name,
      order: body.order || db.categories.length + 1,
      active: body.active !== undefined ? body.active : true,
    };

    db.categories.push(newCategory);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating category" }, { status: 500 });
  }
}
