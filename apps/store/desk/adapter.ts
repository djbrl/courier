import type { AgAiEvent, AgLlmAdapter, AgLlmRequest, AgLlmResponse } from "ag-studio";

/**
 * Studio's model adapter, pointed at the store. The server runs each turn on Claude and streams back Studio's own
 * events as JSON lines, then the finished response; the key and the model never reach the browser.
 */
export function deskAdapter(endpoint: string): AgLlmAdapter {
  return {
    executeTurn(request: AgLlmRequest, options?: { signal?: AbortSignal }) {
      let resolve!: (response: AgLlmResponse) => void;
      let reject!: (error: Error) => void;
      const complete = new Promise<AgLlmResponse>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      // A failed turn is reported once, through `complete`; a reader that stops early must not leave it unhandled.
      complete.catch(() => {});

      async function* events(): AsyncIterableIterator<AgAiEvent> {
        let done: AgLlmResponse | null = null;
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
            signal: options?.signal,
          });
          if (!res.ok || !res.body) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.message ?? `The clerk is unavailable (${res.status}).`);
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          for (;;) {
            const { value, done: ended } = await reader.read();
            if (ended) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.trim()) continue;
              const event = JSON.parse(line);
              if (event.type === "__done") done = event.response;
              else if (event.type === "__error") throw new Error(event.message);
              else yield event as AgAiEvent;
            }
          }
          if (!done) throw new Error("The clerk stopped before finishing.");
          resolve(done);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      }

      const iterator = events();
      return { stream: { [Symbol.asyncIterator]: () => iterator }, complete };
    },
  };
}
