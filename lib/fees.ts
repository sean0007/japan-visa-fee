// Japan residence permit fees (在留許可手数料), revised 2026-10-01.
// Pure functions + a dated rules table. Integer yen only.

export const RULES_AS_OF = "2026-10-11";
export const REFORM_DATE = "2026-10-01";
/** Earliest application date this tool covers (the ¥6,000 / ¥5,500 / ¥10,000 schedule). */
export const OLD_SCHEDULE_START = "2025-04-01";

export const PERMITS = ["extension", "change", "permanent"] as const;
export type Permit = (typeof PERMITS)[number];
export const METHODS = ["counter", "online"] as const;
export type Method = (typeof METHODS)[number];

export const DISCLAIMER =
  "Educational estimate, not immigration or legal advice. Fees are set by Japan's Immigration Services Agency (ISA) and can change; the amount on your ISA postcard or payment email is what you pay. Not affiliated with ISA or the Ministry of Justice.";

export const SOURCES = [
  "https://www.moj.go.jp/isa/01_00644.html",
  "https://www.moj.go.jp/isa/content/001469201.pdf",
  "https://www.moj.go.jp/isa/11_00107.html",
  "https://www.moj.go.jp/isa/01_00646.html",
  "https://www.moj.go.jp/isa/applications/faq/01_00650.html",
] as const;

export type Tier = {
  id: string;
  label: string;
  labelJa: string;
  /** Granted months: min exclusive / max inclusive rules encoded in matches(). */
  counterJPY: number;
  onlineJPY: number;
  onlineProcessingJPY: number;
  /** ISA's minimum-count revenue stamp combination for the counter fee. */
  stamps: number[];
  /** Typical granted period used for per-year math when the user picks the tier, not a month count. */
  typicalMonths: number;
};

export const TIERS: Tier[] = [
  { id: "up_to_3m", label: "3 months or less", labelJa: "3月以下", counterJPY: 10000, onlineJPY: 10000, onlineProcessingJPY: 330, stamps: [10000], typicalMonths: 3 },
  { id: "over_3m_to_6m", label: "Over 3 months, up to 6 months", labelJa: "3月超6月以下", counterJPY: 18000, onlineJPY: 15000, onlineProcessingJPY: 330, stamps: [10000, 8000], typicalMonths: 6 },
  { id: "over_6m_under_1y", label: "Over 6 months, under 1 year", labelJa: "6月超1年未満", counterJPY: 25000, onlineJPY: 21000, onlineProcessingJPY: 330, stamps: [20000, 5000], typicalMonths: 9 },
  { id: "1y", label: "1 year", labelJa: "1年", counterJPY: 33000, onlineJPY: 27000, onlineProcessingJPY: 330, stamps: [30000, 3000], typicalMonths: 12 },
  { id: "over_1y_under_3y", label: "Over 1 year, under 3 years", labelJa: "1年超3年未満", counterJPY: 48000, onlineJPY: 42000, onlineProcessingJPY: 330, stamps: [40000, 8000], typicalMonths: 15 },
  { id: "3y_under_5y", label: "3 years or more, under 5 years", labelJa: "3年以上5年未満", counterJPY: 64000, onlineJPY: 56000, onlineProcessingJPY: 550, stamps: [60000, 4000], typicalMonths: 36 },
  { id: "5y_plus", label: "5 years or more", labelJa: "5年以上", counterJPY: 75000, onlineJPY: 65000, onlineProcessingJPY: 550, stamps: [60000, 10000, 5000], typicalMonths: 60 },
];

export const PERMANENT = { counterJPY: 200000, stamps: [100000, 100000], oldCounterJPY: 10000, reducedJPY: 20000 };
export const OLD_SCHEDULE = { counterJPY: 6000, onlineJPY: 5500, permanentJPY: 10000 };
export const REDUCED_CHANGE_EXTENSION_JPY = 10000;

export class RuleInputError extends Error {}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
function validDate(s: string): boolean {
  if (!DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Tier for a granted period in whole months. */
export function tierForMonths(months: number): Tier {
  if (!Number.isInteger(months) || months < 1 || months > 600) throw new RuleInputError("grantedMonths must be a whole number from 1 to 600 (e.g. 12 for 1 year, 36 for 3 years, 60 for 5 years)");
  if (months <= 3) return TIERS[0];
  if (months <= 6) return TIERS[1];
  if (months < 12) return TIERS[2];
  if (months === 12) return TIERS[3];
  if (months < 36) return TIERS[4];
  if (months < 60) return TIERS[5];
  return TIERS[6];
}

/** Accepts 12, "12", "1y", "3y", "5y", "6m", "3m", or a tier id. Returns months. */
export function parsePeriod(v: unknown): number {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim().toLowerCase();
  const tier = TIERS.find((t) => t.id === s);
  if (tier) return tier.typicalMonths;
  const m = s.match(/^(\d+)\s*(m|mo|month|months|y|yr|year|years)?$/);
  if (!m) throw new RuleInputError(`Cannot read granted period "${v}". Use months (12) or 3m, 6m, 1y, 3y, 5y.`);
  const n = Number(m[1]);
  return m[2] && m[2].startsWith("y") ? n * 12 : n;
}

export type FeeInput = {
  permit: Permit;
  method: Method;
  /** Granted period in months (change/extension). Ignored for permanent. */
  grantedMonths?: number;
  /** YYYY-MM-DD the application was RECEIVED. Omit = on/after 2026-10-01. */
  applicationDate?: string | null;
  headcount?: number;
  horizonYears?: number;
  /** Applicant falls under ISA's reduction guideline (hardship AND humanitarian). */
  reduction?: boolean;
};

export type FeeResult = ReturnType<typeof calculateFee>;

export function calculateFee(input: FeeInput) {
  const { permit, method } = input;
  if (!(PERMITS as readonly string[]).includes(permit)) throw new RuleInputError(`permit must be one of ${PERMITS.join(", ")}`);
  if (!(METHODS as readonly string[]).includes(method)) throw new RuleInputError(`method must be counter or online`);
  const applicationDate = input.applicationDate ? input.applicationDate : null;
  if (applicationDate !== null && !validDate(applicationDate)) throw new RuleInputError("applicationDate must be YYYY-MM-DD");
  if (applicationDate !== null && applicationDate < OLD_SCHEDULE_START)
    throw new RuleInputError(`This tool covers applications received from ${OLD_SCHEDULE_START}. Earlier applications used an older schedule.`);
  const headcount = input.headcount ?? 1;
  if (!Number.isInteger(headcount) || headcount < 1 || headcount > 100000) throw new RuleInputError("headcount must be a whole number from 1 to 100000");
  const horizonYears = input.horizonYears ?? 5;
  if (!Number.isInteger(horizonYears) || horizonYears < 1 || horizonYears > 30) throw new RuleInputError("horizonYears must be a whole number from 1 to 30");
  const reduction = input.reduction === true;

  const revised = applicationDate === null || applicationDate >= REFORM_DATE;
  const regime = revised ? ("revised_2026_10" as const) : ("pre_2026_10" as const);
  const notes: string[] = [];

  let tier: Tier | null = null;
  let grantedMonths: number | null = null;
  if (permit !== "permanent") {
    if (input.grantedMonths === undefined || input.grantedMonths === null) throw new RuleInputError("grantedMonths is required for extension or change (the period ISA actually grants, e.g. 12, 36, 60)");
    grantedMonths = input.grantedMonths;
    tier = tierForMonths(grantedMonths);
  }

  let feeJPY: number;
  let processingFeeJPY = 0;
  let stamps: number[] = [];
  let reductionApplied = false;

  if (permit === "permanent") {
    if (revised) {
      feeJPY = PERMANENT.counterJPY;
      stamps = [...PERMANENT.stamps];
      if (method === "online") notes.push("ISA's published table lists the ¥200,000 permanent residence fee for counter applications only; check ISA before applying online.");
      if (reduction) {
        feeJPY = PERMANENT.reducedJPY;
        stamps = [20000];
        reductionApplied = true;
      }
    } else {
      feeJPY = OLD_SCHEDULE.permanentJPY;
      stamps = [10000];
    }
  } else if (revised) {
    const t = tier as Tier;
    if (method === "counter") {
      feeJPY = t.counterJPY;
      stamps = [...t.stamps];
    } else {
      feeJPY = t.onlineJPY;
      processingFeeJPY = t.onlineProcessingJPY;
    }
    if (reduction && (grantedMonths as number) > 3) {
      feeJPY = REDUCED_CHANGE_EXTENSION_JPY;
      if (method === "counter") stamps = [10000];
      reductionApplied = true;
    }
  } else {
    feeJPY = method === "counter" ? OLD_SCHEDULE.counterJPY : OLD_SCHEDULE.onlineJPY;
    stamps = method === "counter" ? [6000] : [];
  }
  if (reduction && !reductionApplied) {
    notes.push(revised ? "Reduction applies only to change/extension grants over 3 months, or to permanent residence." : "The reduction scheme starts with applications received on or after 2026-10-01.");
  }
  if (reductionApplied) {
    notes.push("Reduction assumes ISA accepts you under its guideline: you must be in hardship comparable to public assistance AND need humanitarian consideration (e.g. recognized refugee, trafficking victim). Most applicants do not qualify.");
  }

  const totalPerPersonJPY = feeJPY + processingFeeJPY;
  const totalJPY = totalPerPersonJPY * headcount;

  // What the same grant cost on the pre-2026-10 schedule, for comparison.
  const previousFeeJPY = permit === "permanent" ? OLD_SCHEDULE.permanentJPY : method === "counter" ? OLD_SCHEDULE.counterJPY : OLD_SCHEDULE.onlineJPY;
  const increaseJPY = revised ? feeJPY - previousFeeJPY : 0;

  let perYearJPY: number | null = null;
  let horizon: { years: number; applicationsNeeded: number; costPerPersonJPY: number; costTotalJPY: number } | null = null;
  let onlineSavingPerPersonJPY: number | null = null;
  let alternatives: { tier: string; label: string; counterJPY: number; onlineTotalJPY: number; perYearCounterJPY: number }[] = [];
  if (permit !== "permanent" && tier && grantedMonths) {
    perYearJPY = Math.round((totalPerPersonJPY * 12) / grantedMonths);
    const applicationsNeeded = Math.ceil((horizonYears * 12) / grantedMonths);
    horizon = { years: horizonYears, applicationsNeeded, costPerPersonJPY: applicationsNeeded * totalPerPersonJPY, costTotalJPY: applicationsNeeded * totalJPY };
    if (revised && !reductionApplied) {
      onlineSavingPerPersonJPY = tier.counterJPY - (tier.onlineJPY + tier.onlineProcessingJPY);
    }
    if (revised) {
      alternatives = TIERS.filter((t) => t.typicalMonths >= 12).map((t) => ({
        tier: t.id,
        label: t.label,
        counterJPY: t.counterJPY,
        onlineTotalJPY: t.onlineJPY + t.onlineProcessingJPY,
        perYearCounterJPY: Math.round((t.counterJPY * 12) / t.typicalMonths),
      }));
    }
  }

  if (revised && applicationDate === null) notes.push("No applicationDate given, so the revised fees (applications received on or after 2026-10-01) are used.");
  if (!revised) notes.push("Application received by 2026-09-30: the old fee applies even if permission is granted on or after 2026-10-01.");
  if (permit !== "permanent") notes.push("The fee depends on the period ISA actually GRANTS, not the period you request. Your postcard (counter) or payment email (online) shows the final amount.");
  if (method === "counter") notes.push("Counter fees are paid with revenue stamps (収入印紙), bought with cash only. Buy them at a large post office before collecting your card; immigration-office shops run out.");
  else if (revised) notes.push("Online fees are paid by convenience store or bank payment only (no credit card, no QR code, no revenue stamps), plus the payment processing fee.");
  notes.push("You pay only when permission is granted. Applications for a Certificate of Eligibility are free.");

  return {
    rulesAsOf: RULES_AS_OF,
    currency: "JPY" as const,
    permit,
    method,
    applicationDate,
    regime,
    grantedMonths,
    tier: tier ? { id: tier.id, label: tier.label, labelJa: tier.labelJa } : null,
    feeJPY,
    processingFeeJPY,
    totalPerPersonJPY,
    headcount,
    totalJPY,
    revenueStamps: method === "counter" || permit === "permanent" ? stamps : [],
    paymentMethod: method === "counter" || permit === "permanent" ? "revenue_stamps_cash" : revised ? "convenience_store_or_bank" : "online_legacy",
    previousFeeJPY,
    increaseJPY,
    perYearJPY,
    horizon,
    onlineSavingPerPersonJPY,
    reductionApplied,
    alternatives,
    notes,
    sources: [...SOURCES],
  };
}

export const RULES = {
  rulesAsOf: RULES_AS_OF,
  title: "Japan residence permit fees (在留許可手数料) from 2026-10-01",
  effective: REFORM_DATE,
  appliesTo: "Applications RECEIVED on or after 2026-10-01. Applications received by 2026-09-30 pay the old fee even if granted later.",
  basis: "Amended Immigration Control Act Enforcement Order, Article 25(1). Change of status and extension fees depend on the period of stay GRANTED.",
  changeAndExtension: TIERS.map((t) => ({
    tier: t.id,
    period: t.label,
    periodJa: t.labelJa,
    counterJPY: t.counterJPY,
    onlineJPY: t.onlineJPY,
    onlineProcessingJPY: t.onlineProcessingJPY,
    onlineTotalJPY: t.onlineJPY + t.onlineProcessingJPY,
    counterStamps: t.stamps,
  })),
  permanentResidence: { counterJPY: PERMANENT.counterJPY, counterStamps: PERMANENT.stamps, before: PERMANENT.oldCounterJPY },
  before: { changeExtensionCounterJPY: OLD_SCHEDULE.counterJPY, changeExtensionOnlineJPY: OLD_SCHEDULE.onlineJPY, permanentJPY: OLD_SCHEDULE.permanentJPY, legalCaps: "Law now allows up to ¥100,000 (change/extension) and ¥300,000 (permanent)." },
  reduction: "Can be reduced to ¥10,000 (change/extension over 3 months) or ¥20,000 (permanent) only for people in hardship comparable to public assistance AND needing humanitarian consideration, per ISA guideline.",
  payment: {
    counter: "Revenue stamps (収入印紙), cash purchase only; ISA asks for the minimum-count stamp combination.",
    online: "Convenience store or bank payment via ISA's payment agent; no credit card or QR; processing fee ¥330 (up to under 3 years) or ¥550 (3 years or more).",
  },
  sources: [...SOURCES],
  disclaimer: DISCLAIMER,
};
