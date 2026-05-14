import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// The SSE notify function needs to be declared here as well, 
// or ideally extracted to a shared util. For now, we reuse the pattern.
const notifyKitchen = (event: string, data: any) => {
  if (!global.sseClients) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  global.sseClients.forEach(client => {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch (e) {}
  });
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const order = db.findById(db.orders, id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Trigger SSE real-time update
    notifyKitchen("order_updated", order);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Error updating order status" }, { status: 500 });
  }
}
