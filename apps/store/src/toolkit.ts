import type Anthropic from "@anthropic-ai/sdk";
import { config, paypal } from "@courier/shared";
import { PayPalAgentToolkit } from "@paypal/agent-toolkit/openai";

/**
 * PayPal's Agent Toolkit, as the shops' clerk uses it: only the actions the clerk needs, on the sandbox. The toolkit's
 * own tool definitions go to Claude, and its own code makes the calls. With the simulator, the same toolkit runs with
 * its requests pointed at the simulator's PayPal-shaped API, so the clerk's path is the same in the demo and the sandbox.
 */

const ACTIONS = {
  payments: { createRefund: true, getRefunds: true },
  shipment: { create: true, get: true, update: true },
  transactions: { list: true },
};

export type ToolkitMode = "sandbox" | "simulated";

export interface Toolkit {
  mode: ToolkitMode;
  /** The toolkit's tools, by name, for Claude's tool use. */
  tools(names: string[]): Anthropic.Tool[];
  /** Runs one toolkit tool. Callers check the arguments first: this sends them to PayPal as they are. */
  run(name: string, args: Record<string, unknown>): Promise<{ ok: true; data: any } | { ok: false; error: string }>;
}

function build(mode: ToolkitMode): Toolkit {
  const kit =
    mode === "sandbox"
      ? new PayPalAgentToolkit({
          clientId: config.paypal.clientId,
          clientSecret: config.paypal.clientSecret,
          configuration: { actions: ACTIONS, context: { sandbox: true } },
        })
      : new PayPalAgentToolkit({
          clientId: "simulated",
          clientSecret: "simulated",
          configuration: { actions: ACTIONS, context: { sandbox: true } },
        });
  if (mode === "simulated") {
    // Only where the requests go changes. The simulator takes the shared secret instead of a PayPal app token.
    kit.client.getBaseUrl = () => `${config.courier.url}/sim-paypal/rest`;
    kit.client.getHeaders = async () => ({
      "Content-Type": "application/json",
      "X-Internal-Secret": config.internalSecret,
    });
  }
  const all = kit.getTools();
  let calls = 0;
  return {
    mode,
    tools: (names) =>
      all
        .filter((t) => names.includes(t.function.name))
        .map((t) => {
          const { $schema: _, ...schema } = (t.function.parameters ?? {}) as Record<string, unknown>;
          return {
            name: t.function.name,
            description: `${t.function.description ?? ""}${mode === "simulated" ? " (Simulated PayPal: no real money.)" : ""}`,
            input_schema: schema as Anthropic.Tool.InputSchema,
          };
        }),
    run: async (name, args) => {
      const reply = await kit.handleToolCall({
        id: `clerk_${++calls}`,
        type: "function",
        function: { name, arguments: JSON.stringify(args) },
      });
      let data: any;
      try {
        data = JSON.parse(String(reply.content || "null"));
      } catch {
        data = reply.content;
      }
      // The toolkit reports failures as data rather than throwing: an LlmError ({ok: false}) or {error}.
      if (data && typeof data === "object" && (data.ok === false || data.error))
        return { ok: false, error: String(data.message ?? data.error?.message ?? "PayPal refused the call") };
      return { ok: true, data };
    },
  };
}

const kits = new Map<ToolkitMode, Toolkit>();

/** The toolkit for one order. Live PayPal has none: the clerk never moves real money. */
export function toolkitFor(who: { simulated?: boolean } | null | undefined): Toolkit | null {
  const mode: ToolkitMode | null =
    who?.simulated || paypal.mode === "simulated" ? "simulated" : paypal.mode === "sandbox" ? "sandbox" : null;
  if (!mode) return null;
  if (!kits.has(mode)) kits.set(mode, build(mode));
  return kits.get(mode)!;
}
