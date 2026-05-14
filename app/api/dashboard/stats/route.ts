import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function GET() {
  try {
    const today = new URLSearchParams().get("date") || new Date().toISOString().split("T")[0];
    
    // Today's Sales
    const todayOrders = db.orders.filter(o => 
      o.createdAt.startsWith(today) && o.status !== "cancelado"
    );
    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // Today's Consumptions
    const todayConsumptionsCount = db.consumptions.filter(c => 
      c.createdAt.startsWith(today) && c.status === "confirmado"
    ).length;

    // Pensioners stats
    const totalPensionists = db.pensionists.length;
    const activePensionists = db.pensionists.filter(p => p.status === "active").length;
    const debtPensionists = db.pensionists.filter(p => (p.balance || 0) < 0).length;
    const totalDebt = db.pensionists.reduce((sum, p) => sum + ((p.balance || 0) < 0 ? Math.abs(p.balance || 0) : 0), 0);

    return NextResponse.json({
      todaySales,
      todayConsumptionsCount,
      totalPensionists,
      activePensionists,
      debtPensionists,
      totalDebt,
      orderCount: todayOrders.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 });
  }
}
