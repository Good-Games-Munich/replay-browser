import { env } from "@/env";
import Redis from "ioredis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const setKey = "test";
const redisSub = new Redis(env.REDIS_KV_URL);

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      redisSub.subscribe(setKey, (err) => {
        if (err) {
          console.log(err);
        }
      });

      redisSub.on("message", (channel, message) => {
        if (channel === setKey) {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        }
      });

      redisSub.on("end", () => {
        controller.close();
      });
    },
  });

  return new Response(readable, {
    // Set headers for Server-Sent Events (SSE) / stream from the server
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
