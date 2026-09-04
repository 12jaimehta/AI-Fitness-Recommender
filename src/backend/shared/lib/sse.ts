import { ApiError } from "./errors";

export function wantsEventStream(request: Request) {
  return (request.headers.get("accept") || "").includes("text/event-stream");
}

export function sseResponse(work: (send: (data: unknown) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const send = (data: unknown) => {
        enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      enqueue(`: ${" ".repeat(2048)}\n\n`);

      try {
        await work(send);
      } catch (error) {
        if (closed) return;
        if (error instanceof ApiError) {
          const details = error.details;
          const code =
            details && typeof details === "object" && details !== null && "code" in details
              ? String((details as { code: unknown }).code)
              : typeof details === "string"
                ? details
                : undefined;
          send({ type: "error", error: error.message, status: error.status, code });
        } else {
          const message = error instanceof Error ? error.message : "Internal server error";
          console.error("SSE error:", error);
          send({ type: "error", error: message, status: 500 });
        }
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            /* already closed by the client */
          }
        }
      }
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
