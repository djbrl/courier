// Bundles the shop desk (apps/store/desk) into packages/shared/assets/desk/, which is not committed.
// Usage: node scripts/build-desk.mjs            (once)
//        node scripts/build-desk.mjs --watch    (rebuild on change)
// scripts/dev.mjs runs it, so `npm run dev`, `npm run demo` and `npm start` always serve a fresh bundle.
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const watch = process.argv.includes("--watch");

/** @type {import("esbuild").BuildOptions} */
const options = {
  // desk-ops.js: the desk's everyday pages (AG Grid). desk.js: the report builder (AG Studio), loaded on Reports only.
  entryPoints: {
    "desk-ops": path.join(root, "apps/store/desk/ops.ts"),
    desk: path.join(root, "apps/store/desk/main.tsx"),
  },
  outdir: path.join(root, "packages/shared/assets/desk"),
  bundle: true,
  format: "iife",
  target: "es2022",
  jsx: "automatic",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  legalComments: "none",
  logLevel: "warning",
  define: { "process.env.NODE_ENV": JSON.stringify(watch ? "development" : "production") },
};

export async function buildDesk({ watch: keepWatching = false } = {}) {
  const started = Date.now();
  if (keepWatching) {
    const context = await esbuild.context(options);
    await context.watch();
    console.log(`[desk] watching, first build in ${Date.now() - started} ms`);
    return context;
  }
  await esbuild.build(options);
  console.log(`[desk] built in ${Date.now() - started} ms`);
  return null;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  buildDesk({ watch }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
