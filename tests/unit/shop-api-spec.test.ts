import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/* The shop SDKs are generated from sdk/src/spec/openapi.json, so it has to describe the routes Courier really serves. */

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

function served(): string[] {
  const routes: string[] = [];
  for (const [file, router] of [
    ["apps/courier/src/visas.ts", "internalRouter"],
    ["apps/courier/src/after-sale.ts", "afterSaleRouter"],
  ] as const) {
    for (const [, method, path] of read(file).matchAll(new RegExp(`${router}\\.(get|post)\\("([^"]+)"`, "g")))
      routes.push(`${method!.toUpperCase()} ${path!.replace(/:(\w+)/g, "{$1}")}`);
  }
  return routes.sort();
}

test("the shop API spec lists every route Courier serves to shops, and no others", () => {
  const spec = JSON.parse(read("sdk/src/spec/openapi.json")) as { paths: Record<string, Record<string, unknown>> };
  // Path parameters are named for what they hold in the spec ({visaId}), and ":id" in the routes.
  const described = Object.entries(spec.paths)
    .flatMap(([path, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} ${path.replace(/\{\w+\}/g, "{id}")}`))
    .sort();
  assert.deepEqual(described, served());
});

test("every operation in the shop API spec has an ID, a tag and the shop key", () => {
  const spec = JSON.parse(read("sdk/src/spec/openapi.json"));
  assert.deepEqual(spec.security, [{ shopKey: [] }]);
  assert.equal(spec.components.securitySchemes.shopKey.name, "X-Internal-Secret");
  for (const [path, ops] of Object.entries<Record<string, { operationId?: string; tags?: string[] }>>(spec.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      assert.ok(op.operationId, `${method} ${path} has no operationId`);
      assert.ok(op.tags?.length, `${method} ${path} has no tag`);
    }
  }
});
