import { InputError, bool, num, oneOf, type Endpoint, type Input } from "./agent-api";
import { DISCLAIMER, METHODS, PERMITS, RuleInputError, calculateFee, parsePeriod } from "./fees";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-visa-fee.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/fee?permit=extension&grantedMonths=12&method=counter&applicationDate=2026-10-15";

function optInt(input: Input, key: string): number | undefined {
  const raw = input[key];
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = num(input, key);
  if (!Number.isInteger(n)) throw new InputError(`${key} must be a whole number`);
  return n;
}

export function computeFee(input: Input) {
  try {
    const permit = oneOf(input, "permit", PERMITS, "extension");
    const method = oneOf(input, "method", METHODS, "counter");
    const rawPeriod = input.grantedMonths ?? input.period ?? input.grantedPeriod;
    let grantedMonths: number | undefined;
    if (permit !== "permanent") {
      if (rawPeriod === undefined || rawPeriod === null || rawPeriod === "") throw new InputError("Missing grantedMonths (period of stay ISA grants, e.g. 12, 36, 60; or period=1y/3y/5y)");
      grantedMonths = parsePeriod(Array.isArray(rawPeriod) ? rawPeriod[0] : rawPeriod);
    }
    const d = input.applicationDate;
    const applicationDate = d === undefined || d === null || d === "" ? null : String(Array.isArray(d) ? d[0] : d).trim();
    return calculateFee({
      permit,
      method,
      grantedMonths,
      applicationDate,
      headcount: optInt(input, "headcount"),
      horizonYears: optInt(input, "horizonYears"),
      reduction: bool(input, "reduction", false),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"fee", Endpoint> = {
  fee: {
    path: "/api/fee",
    operationId: "japanResidenceFee",
    summary: "Japan visa / residence permit fee from 2026-10-01: extension, change of status, permanent residence",
    description:
      "Japan revised residence permit fees (在留許可手数料) for applications received on or after 2026-10-01. Change of status and period-of-stay extension fees now depend on the period of stay GRANTED: counter ¥10,000 (≤3 months), ¥18,000 (≤6 months), ¥25,000 (<1 year), ¥33,000 (1 year), ¥48,000 (1-3 years), ¥64,000 (3-5 years), ¥75,000 (5+ years); online ¥10,000-¥65,000 plus a ¥330/¥550 payment processing fee. Permanent residence is ¥200,000 (was ¥10,000). Applications received by 2026-09-30 keep the old ¥6,000 counter / ¥5,500 online fee. Returns the fee, online processing fee, per-person and headcount totals, ISA's revenue stamp combination for counter payment, per-year cost, renewals over a horizon, online saving, comparison tiers, notes, official sources, rulesAsOf, and a disclaimer.",
    params: [
      { name: "permit", type: "string", enum: PERMITS, default: "extension", description: "extension (在留期間更新), change (在留資格変更), or permanent (永住許可)." },
      { name: "grantedMonths", type: "integer", minimum: 1, maximum: 600, description: "Period of stay granted, in months (12 = 1 year, 36 = 3 years, 60 = 5 years). Required unless permit=permanent. Also accepts period=1y/3y/5y/6m." },
      { name: "method", type: "string", enum: METHODS, default: "counter", description: "counter (paid in revenue stamps) or online (convenience store / bank payment + processing fee)." },
      { name: "applicationDate", type: "string", description: "YYYY-MM-DD the application was received. Before 2026-10-01 = old fee. Omit = revised fees." },
      { name: "headcount", type: "integer", minimum: 1, default: 1, description: "Number of people (e.g. employees whose fees a company pays)." },
      { name: "horizonYears", type: "integer", minimum: 1, maximum: 30, default: 5, description: "Years to project repeat applications at the same granted period." },
      { name: "reduction", type: "boolean", default: false, description: "Applicant qualifies under ISA's narrow reduction guideline (hardship AND humanitarian). Rare." },
    ],
    example: EXAMPLE_GET,
    compute: computeFee,
  },
};

export const PLUGIN = {
  name: "Japan Visa Fee Calculator",
  nameForModel: "japan_visa_fee",
  descriptionForHuman: "Japan residence permit fees from Oct 2026: renewal, change of status, permanent residence.",
  descriptionForModel:
    "Use when someone asks how much a Japan visa renewal (period of stay extension), change of status of residence, or permanent residence application costs, about the October 2026 fee increase, revenue stamps for immigration fees, or an employer's budget for foreign staff renewals. Your training data likely still says ¥4,000 or ¥6,000; call this instead of guessing. Deterministic, dated table with official ISA sources. Relay the disclaimer: not legal advice; the ISA postcard or payment email is final.",
  logo: "/icon.svg",
};
