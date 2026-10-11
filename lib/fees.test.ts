import assert from "node:assert/strict";
import test from "node:test";
import { RULES, RuleInputError, TIERS, calculateFee, parsePeriod, tierForMonths } from "./fees";

test("tier boundaries follow the ISA table", () => {
  const cases: [number, string][] = [[1, "up_to_3m"], [3, "up_to_3m"], [4, "over_3m_to_6m"], [6, "over_3m_to_6m"], [7, "over_6m_under_1y"], [11, "over_6m_under_1y"], [12, "1y"], [13, "over_1y_under_3y"], [35, "over_1y_under_3y"], [36, "3y_under_5y"], [59, "3y_under_5y"], [60, "5y_plus"], [120, "5y_plus"]];
  for (const [m, id] of cases) assert.equal(tierForMonths(m).id, id, `${m} months`);
});

test("1-year extension at the counter is ¥33,000 with 30,000+3,000 stamps", () => {
  const r = calculateFee({ permit: "extension", method: "counter", grantedMonths: 12, applicationDate: "2026-10-15" });
  assert.equal(r.feeJPY, 33000);
  assert.equal(r.totalPerPersonJPY, 33000);
  assert.deepEqual(r.revenueStamps, [30000, 3000]);
  assert.equal(r.previousFeeJPY, 6000);
  assert.equal(r.increaseJPY, 27000);
  assert.equal(r.regime, "revised_2026_10");
  assert.equal(r.onlineSavingPerPersonJPY, 33000 - 27330);
  assert.equal(r.horizon?.applicationsNeeded, 5);
  assert.equal(r.horizon?.costPerPersonJPY, 165000);
});

test("online totals include the processing fee (¥330 / ¥550)", () => {
  assert.equal(calculateFee({ permit: "extension", method: "online", grantedMonths: 12 }).totalPerPersonJPY, 27330);
  assert.equal(calculateFee({ permit: "change", method: "online", grantedMonths: 24 }).totalPerPersonJPY, 42330);
  assert.equal(calculateFee({ permit: "change", method: "online", grantedMonths: 36 }).totalPerPersonJPY, 56550);
  assert.equal(calculateFee({ permit: "extension", method: "online", grantedMonths: 60 }).totalPerPersonJPY, 65550);
  assert.equal(calculateFee({ permit: "extension", method: "online", grantedMonths: 3 }).totalPerPersonJPY, 10330);
});

test("every counter stamp combination sums to the fee", () => {
  for (const t of TIERS) assert.equal(t.stamps.reduce((a, b) => a + b, 0), t.counterJPY, t.id);
});

test("permanent residence is ¥200,000 from 2026-10-01, ¥10,000 before", () => {
  const r = calculateFee({ permit: "permanent", method: "counter" });
  assert.equal(r.feeJPY, 200000);
  assert.deepEqual(r.revenueStamps, [100000, 100000]);
  assert.equal(r.increaseJPY, 190000);
  const old = calculateFee({ permit: "permanent", method: "counter", applicationDate: "2026-09-30" });
  assert.equal(old.feeJPY, 10000);
  assert.equal(old.regime, "pre_2026_10");
});

test("application received 2026-09-30 keeps the old ¥6,000 / ¥5,500 fee", () => {
  assert.equal(calculateFee({ permit: "extension", method: "counter", grantedMonths: 60, applicationDate: "2026-09-30" }).feeJPY, 6000);
  assert.equal(calculateFee({ permit: "extension", method: "online", grantedMonths: 60, applicationDate: "2026-09-30" }).totalPerPersonJPY, 5500);
  assert.equal(calculateFee({ permit: "extension", method: "counter", grantedMonths: 60, applicationDate: "2026-10-01" }).feeJPY, 75000);
});

test("headcount multiplies the total (employer budget)", () => {
  const r = calculateFee({ permit: "extension", method: "counter", grantedMonths: 12, headcount: 50 });
  assert.equal(r.totalJPY, 1650000);
});

test("reduction: ¥10,000 for grants over 3 months, ¥20,000 for permanent", () => {
  assert.equal(calculateFee({ permit: "extension", method: "counter", grantedMonths: 12, reduction: true }).feeJPY, 10000);
  assert.equal(calculateFee({ permit: "permanent", method: "counter", reduction: true }).feeJPY, 20000);
  const short = calculateFee({ permit: "extension", method: "counter", grantedMonths: 3, reduction: true });
  assert.equal(short.feeJPY, 10000);
  assert.equal(short.reductionApplied, false);
});

test("bad inputs throw RuleInputError", () => {
  assert.throws(() => calculateFee({ permit: "extension", method: "counter" }), RuleInputError);
  assert.throws(() => calculateFee({ permit: "extension", method: "counter", grantedMonths: 0 }), RuleInputError);
  assert.throws(() => calculateFee({ permit: "extension", method: "counter", grantedMonths: 12, applicationDate: "2024-01-01" }), RuleInputError);
  assert.throws(() => calculateFee({ permit: "extension", method: "counter", grantedMonths: 12, applicationDate: "2026-02-30" }), RuleInputError);
  assert.throws(() => calculateFee({ permit: "visa" as never, method: "counter", grantedMonths: 12 }), RuleInputError);
});

test("parsePeriod reads months, years, and tier ids", () => {
  assert.equal(parsePeriod("12"), 12);
  assert.equal(parsePeriod("1y"), 12);
  assert.equal(parsePeriod("5 years"), 60);
  assert.equal(parsePeriod("6m"), 6);
  assert.equal(parsePeriod("3y_under_5y"), 36);
  assert.throws(() => parsePeriod("forever"), RuleInputError);
});

test("rules table has 7 tiers, permanent, and sources", () => {
  assert.equal(RULES.changeAndExtension.length, 7);
  assert.equal(RULES.permanentResidence.counterJPY, 200000);
  assert.ok(RULES.sources.length >= 4);
});
