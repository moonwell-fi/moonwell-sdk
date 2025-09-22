import type { MoonwellClient } from "../client/createMoonwellClient.js";
import type { Environment, SupportedChains } from "../environments/index.js";
import { supportedChainsIds } from "../environments/index.js";

export type Diagnostics = {
  chainId: number;
  network: SupportedChains;
  action: string;
  error: string;
};

export type DiagnosticsHook = (diagnostics: Diagnostics[]) => void;

export type WithDiagnosticsHook = {
  onDiagnostics?: DiagnosticsHook;
};

export async function settleAcrossEnvironments<T>(
  client: MoonwellClient,
  actionName: string,
  environments: Environment[],
  run: (env: Environment, ...args: unknown[]) => Promise<T>,
): Promise<{ data: T[]; diagnostics: Diagnostics[] }> {
  const settled = await Promise.allSettled(environments.map(run));
  const data = settled
    .flatMap((s) => {
      console.log("settled data", s);
      return s;
    })
    .flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));

  const diagnostics = settled
    .map((s, i) =>
      s.status === "rejected"
        ? {
            chainId: environments[i].chainId,
            network: supportedChainsIds[environments[i].chainId],
            action: actionName,
            error: s.reason,
          }
        : undefined,
    )
    .filter((x): x is Diagnostics => !!x);

  console.log("diagnostics", actionName, settled, data, diagnostics);

  if (diagnostics.length) {
    if (client.onDiagnostics) {
      client.onDiagnostics(diagnostics);
    } else {
      console.warn(
        "moonwell-sdk: No diagnostics hook found, but some rpc node errors occurred",
        diagnostics,
      );
    }
  }

  return { data, diagnostics };
}
