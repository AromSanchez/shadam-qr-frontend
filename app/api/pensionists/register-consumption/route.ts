import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function POST(request: Request) {
  try {
    const { pensionistId, mealType, validatedBy } = await request.json();

    if (!pensionistId || !mealType || !validatedBy) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    const pensionist = db.findById(db.pensionists, pensionistId);

    if (!pensionist) {
      return NextResponse.json({ error: "Pensionista no encontrado" }, { status: 404 });
    }

    // Determine the current date string (YYYY-MM-DD)
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    // Validation 3: Avoid duplicate consumption on the same day
    const alreadyConsumed = db.consumptions.find(
      c => c.pensionistId === pensionistId && 
           c.mealType === mealType && 
           c.date === dateStr &&
           c.status === "confirmado"
    );

    if (alreadyConsumed) {
      return NextResponse.json({ error: `Este pensionista ya registró ${mealType} hoy.` }, { status: 403 });
    }

    // Validation 4: Check if credits are available (for cupos plan)
    if (pensionist.planType === "cupos") {
      let hasCredits = false;
      if (mealType === "desayuno" && (pensionist.breakfastCredits || 0) > 0) hasCredits = true;
      if (mealType === "almuerzo" && (pensionist.lunchCredits || 0) > 0) hasCredits = true;
      if (mealType === "cena" && (pensionist.dinnerCredits || 0) > 0) hasCredits = true;

      if (!hasCredits) {
        return NextResponse.json({ error: `No tiene cupos disponibles para ${mealType}.` }, { status: 403 });
      }

      // Deduct credit
      if (mealType === "desayuno") pensionist.breakfastCredits = (pensionist.breakfastCredits || 0) - 1;
      if (mealType === "almuerzo") pensionist.lunchCredits = (pensionist.lunchCredits || 0) - 1;
      if (mealType === "cena") pensionist.dinnerCredits = (pensionist.dinnerCredits || 0) - 1;
    }

    // Register consumption
    const newConsumption = {
      id: db.generateId("cons"),
      pensionistId,
      mealType,
      date: dateStr,
      time: today.toLocaleTimeString(),
      validatedBy,
      status: "confirmado" as const,
      createdAt: today.toISOString()
    };

    db.consumptions.push(newConsumption);

    return NextResponse.json({
      message: "Consumo registrado correctamente",
      consumption: newConsumption,
      remainingCredits: {
        breakfast: pensionist.breakfastCredits,
        lunch: pensionist.lunchCredits,
        dinner: pensionist.dinnerCredits
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
