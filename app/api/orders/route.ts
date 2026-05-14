import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// The SSE clients list for real-time kitchen updates
// We use global to persist this across hot reloads in dev
declare global {
  var sseClients: any[];
}

if (!global.sseClients) {
  global.sseClients = [];
}

// Function to notify all connected kitchen clients
const notifyKitchen = (event: string, data: any) => {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  global.sseClients.forEach(client => {
    try {
      client.enqueue(new TextEncoder().encode(message));
    } catch (e) {
      // client disconnected
    }
  });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get("all") === "true";

    let orders;
    if (getAll) {
      orders = [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Return all non-delivered/cancelled orders to the kitchen, sorted by date
      orders = db.orders.filter(o => o.status !== "entregado" && o.status !== "cancelado");
      orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.tableId || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const newOrder = {
      id: db.generateId("ord"),
      tableId: body.tableId,
      items: body.items,
      total: body.total,
      paymentMethod: body.paymentMethod,
      status: "pendiente" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);

    // Update table status
    const table = db.findById(db.tables, body.tableId);
    if (table) {
      table.status = "en_pedido";
    }

    // Trigger SSE real-time update
    notifyKitchen("new_order", newOrder);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating order" }, { status: 500 });
  }
}
