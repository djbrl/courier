import type { TokenProvider } from "./core/auth/credentials.js";
import type { CoreClientOptions } from "./core/client-options.js";

export type ClientOptions = SdkClientOptions & CoreClientOptions;

type SdkClientOptions = ServerOptions & {
  /** The shop's key, issued by Courier. */
  readonly shopKey?: TokenProvider | undefined;
};

type ServerOptions = {
  /** Courier's shop API. Point baseUrl at your Courier, ending in /internal. */
  readonly serverOptions?: {
    baseUrl?: string;
  };
};
