import { NextResponse } from "next/server";

// Using Edge runtime is generally better for SSE, but since we are using a global Node.js variable
// to store clients, we must use the Node.js runtime. 
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      if (global.sseClients) {
        global.sseClients.push(controller);
      }
      
      // Send initial heartbeat
      controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
    },
    cancel() {
      if (global.sseClients) {
        global.sseClients = global.sseClients.filter(c => c !== controller);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
