import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.fee;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} returns ¥33,000 with disclaimer and CORS`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.feeJPY, 33000);
  assert.deepEqual(body.revenueStamps, [30000, 3000]);
  assert.ok(body.sources.length);
  assert.ok(!("error" in body));
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const body = Object.fromEntries(url.searchParams);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("POST with numbers, period shorthand, and headcount", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ permit: "change", period: "3y", method: "online", headcount: 10 }) }));
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.totalPerPersonJPY, 56550);
  assert.equal(b.totalJPY, 565500);
});

test("permanent needs no period", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}?permit=permanent`));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).feeJPY, 200000);
});

test("missing grantedMonths returns 400 with an example", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error);
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.ok(body.example);
});

test("bad permit returns 400", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}?permit=tourist&grantedMonths=12`));
  assert.equal(res.status, 400);
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI spec lists /api/fee with GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { paths: Record<string, { get: unknown; post: unknown }> };
  assert.ok(spec.paths["/api/fee"]?.get);
  assert.ok(spec.paths["/api/fee"]?.post);
});
