import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLE_SHARED, isExample, parseShared, periodLabel, resultPath, sharedQuery } from "./share";

test("example shared round-trips", () => {
  const back = parseShared(new URLSearchParams(sharedQuery(EXAMPLE_SHARED)));
  assert.deepEqual(back, EXAMPLE_SHARED);
  assert.ok(back && isExample(back));
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?k=extension&m=12&a=counter");
});

test("parseShared accepts API-style names and headcount/date", () => {
  const s = parseShared({ permit: "change", grantedMonths: "36", method: "online", headcount: "29", applicationDate: "2026-10-20" });
  assert.deepEqual(s, { permit: "change", grantedMonths: 36, method: "online", headcount: 29, applicationDate: "2026-10-20" });
  assert.deepEqual(parseShared(new URLSearchParams(sharedQuery(s!))), s);
});

test("parseShared rejects junk", () => {
  assert.equal(parseShared({ k: "visa", m: "12" }), null);
  assert.equal(parseShared({ k: "extension", m: "abc" }), null);
  assert.equal(parseShared({}), null);
  assert.equal(parseShared({ k: "permanent" })?.permit, "permanent");
});

test("periodLabel", () => {
  assert.equal(periodLabel(12), "1 year");
  assert.equal(periodLabel(60), "5 years");
  assert.equal(periodLabel(6), "6 months");
  assert.equal(periodLabel(15), "1y 3m");
});
