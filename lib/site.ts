export const SITE_NAME = "Japan Visa Fee Calculator";

export const SITE_TAGLINE =
  "From October 1, 2026, Japan charges residence permit fees by the period of stay granted: ¥33,000 for a 1-year renewal at the counter, up to ¥75,000 for 5 years, and ¥200,000 for permanent residence. See your exact fee, online price, revenue stamps, and employer total.";

export const DISCLAIMER_SHORT = "Educational estimate, not immigration or legal advice. Fees can change; your ISA postcard or payment email is final.";

export const HONESTY =
  "Fee table as of 2026-10-11 from the Immigration Services Agency of Japan (ISA). Not affiliated with ISA, the Ministry of Justice, or any visa office.";

export const SIBLING_TOOLS = [
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://hotel-ota-calculator.vercel.app", label: "Hotel OTA Calculator" },
  { href: "https://pitch-roast.vercel.app", label: "Pitch Roast" },
  { href: "https://fund-fix-flee.vercel.app", label: "Founder Scorecard" },
  { href: "https://saas-bill-cutter.vercel.app", label: "SaaS Bill Cutter" },
  { href: "https://ads-risk-check.vercel.app", label: "Ads Risk Check" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-visa-fee.vercel.app";
}
