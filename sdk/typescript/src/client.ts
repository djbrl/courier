import { buildAuthSchemes, type AuthSchemes } from "./auth-schemes.js";
import type { ClientOptions } from "./client-options.js";
import { buildCoreClientOptions } from "./core/client-options.js";
import { RawClient } from "./core/raw-client.js";
import * as host from "./core/runtime-environment.js";
import * as s from "./core/validation/index.js";
import { AfterSale } from "./resources/after-sale.js";
import { Approvals } from "./resources/approvals.js";
import { Connections } from "./resources/connections.js";
import { Errands } from "./resources/errands.js";
import { Reports } from "./resources/reports.js";
import { Spending } from "./resources/spending.js";
import { buildServers, type Servers } from "./servers.js";

/**
 * What a shop calls on Courier to serve AI shopping agents (couriers) safely.
 *
 * A courier arrives with a signed token from Courier. The shop verifies the token against Courier's
 * public keys (`/jwks.json`), then uses this API to:
 *
 * - check what the courier's errand still allows, and ask Courier before every hold or purchase;
 * - charge the person's saved PayPal, record what was paid, and release what wasn't;
 * - tell the errand about parcels and returns;
 * - report a courier that misbehaves.
 *
 * Limits are enforced by Courier in code. The shop never learns who the person is: it sees a
 * pairwise pseudonym (`sub`), the courier's name and the errand's limits.
 */
export class CourierShopsClient {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;
  #errands?: Errands;
  #connections?: Connections;
  #spending?: Spending;
  #approvals?: Approvals;
  #afterSale?: AfterSale;
  #reports?: Reports;

  constructor(options: ClientOptions = {}) {
    this.#rawClient = new RawClient({
      ...buildCoreClientOptions(options, "COURIER_SHOPS_CLIENT_LOG"),
      defaultHeaders: [
        { name: "User-Agent", value: "CourierShopsClient/1.0.0 TypeScript", schema: s.string() },
        { name: "X-APIMatic-Lang", value: "TypeScript", schema: s.string() },
        { name: "X-APIMatic-Package-Version", value: "1.0.0", schema: s.string() },
        { name: "X-APIMatic-Gen-Version", value: "4.0.0", schema: s.string() },
        { name: "X-APIMatic-OS", value: host.operatingSystem(), schema: s.optional(s.string()) },
        { name: "X-APIMatic-Runtime", value: host.runtimeDescription(), schema: s.optional(s.string()) },
      ],
      defaultQuery: [],
      defaultPathParams: [],
    });

    this.#servers = buildServers(options);

    this.#auth = buildAuthSchemes(options);
  }

  /**
   * What an errand allows and how much of it is left.
   */
  get errands(): Errands {
    return (this.#errands ??= new Errands(this.#rawClient, this.#servers, this.#auth));
  }

  /**
   * A person's Claude, connected to a shop between errands.
   */
  get connections(): Connections {
    return (this.#connections ??= new Connections(this.#rawClient, this.#servers, this.#auth));
  }

  /**
   * Ask before every hold or purchase, then charge, commit or release.
   */
  get spending(): Spending {
    return (this.#spending ??= new Spending(this.#rawClient, this.#servers, this.#auth));
  }

  /**
   * The person's answer when Courier asked them first.
   */
  get approvals(): Approvals {
    return (this.#approvals ??= new Approvals(this.#rawClient, this.#servers, this.#auth));
  }

  /**
   * Parcels, returns and other steps the person sees on their errand.
   */
  get afterSale(): AfterSale {
    return (this.#afterSale ??= new AfterSale(this.#rawClient, this.#servers, this.#auth));
  }

  /**
   * Report a courier that misbehaves.
   */
  get reports(): Reports {
    return (this.#reports ??= new Reports(this.#rawClient, this.#servers, this.#auth));
  }
}
