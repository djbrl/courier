// Runs the e2e and the MCP SDK client check against a throwaway server pair, so tests never touch your demo or
// sandbox data: simulated PayPal, deterministic intent rules, ports 4300/4400, data in data/test-run-4300 (wiped first).
//
//   npm test
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

// TEST_COURIER_PORT and TEST_STORE_PORT move the pair, so a second copy can run beside the first.
const COURIER_PORT = process.env.TEST_COURIER_PORT || "4300";
const STORE_PORT = process.env.TEST_STORE_PORT || "4400";
const COURIER_URL = `http://localhost:${COURIER_PORT}`;
const STORE_URL = `http://localhost:${STORE_PORT}`;
const DATA_DIR = `data/test-run-${COURIER_PORT}`;
const env = {
  ...process.env,
  PAYPAL_MODE: "simulated",
  // The scripted courier and the clerk's rules, whatever .env says: tests never call a model.
  ANTHROPIC_API_KEY: "",
  ANTHROPIC_AUTH_TOKEN: "",
  INTENT_CHECK: "on",
  INTENT_MODEL: "rules",
  // Parcels move a step a second, so the tests see one delivered.
  SHIPPING_STEP_SECONDS: "1",
  COURIER_PORT,
  STORE_PORT,
  COURIER_URL,
  STORE_URL,
  DATA_DIR,
};

async function up(url) {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${url} did not come up`);
}

for (const url of [COURIER_URL, STORE_URL]) {
  const busy = await fetch(url).then(
    () => true,
    () => false,
  );
  if (busy) {
    console.error(`${url} is already in use. Stop whatever runs there first.`);
    process.exit(1);
  }
}

rmSync(DATA_DIR, { recursive: true, force: true });
const servers = spawn(process.execPath, ["scripts/dev.mjs", "--no-watch"], {
  env,
  stdio: ["ignore", "ignore", "inherit"],
  detached: true,
});
const stop = () => {
  try {
    process.kill(-servers.pid, "SIGTERM");
  } catch {}
};
process.on("exit", stop);

const run = (script) =>
  new Promise((resolve) => {
    const child = spawn("npx", ["tsx", script], { env, stdio: "inherit" });
    child.on("exit", (code) => resolve(code ?? 1));
  });

let code = 1;
try {
  await up(`${COURIER_URL}/healthz`);
  await up(STORE_URL);
  code = await run("tests/e2e.ts");
  if (code === 0) code = await run("tests/mcp-client.ts");
} catch (error) {
  console.error(error.message);
} finally {
  stop();
}
process.exit(code);
