import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { TIERS } from "@/lib/fees";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, yen } from "@/lib/share";

const title = "How much is a Japan visa renewal from October 2026?";
const description =
  "Free Japan visa fee calculator for the October 1, 2026 revision: period-of-stay extension and change of status ¥10,000–¥75,000 by period granted (1 year ¥33,000 at the counter, ¥27,330 online), permanent residence ¥200,000. Revenue stamps, employer totals, free JSON API for AI agents. Not legal advice.";

export const metadata: Metadata = {
  title: { absolute: `${title} · Japan Visa Fee Calculator` },
  description,
  alternates: { canonical: "/" },
};

const faq: FaqItem[] = [
  {
    q: "How much is a Japan visa renewal from October 2026?",
    a: "For applications received on or after October 1, 2026, the fee for an extension of period of stay (在留期間更新) depends on the period granted. At the counter: ¥10,000 (3 months or less), ¥18,000 (up to 6 months), ¥25,000 (under 1 year), ¥33,000 (1 year), ¥48,000 (over 1 year, under 3 years), ¥64,000 (3 to under 5 years), ¥75,000 (5 years or more). Before, it was a flat ¥6,000.",
  },
  {
    q: "How much is a Japan visa renewal online?",
    a: "Online fees are lower: ¥10,000, ¥15,000, ¥21,000, ¥27,000, ¥42,000, ¥56,000, and ¥65,000 for the same seven period bands, plus a payment processing fee of ¥330 (under 3 years) or ¥550 (3 years or more). A 1-year online renewal costs ¥27,330 in total. Payment is by convenience store or bank only; no credit card or QR code.",
  },
  {
    q: "How much does Japan permanent residence cost now?",
    a: "¥200,000 for permanent residence permission (永住許可) applications received on or after October 1, 2026, up from ¥10,000. ISA's table lists it for counter applications. It is paid with revenue stamps (two ¥100,000 stamps) when permission is granted.",
  },
  {
    q: "Is the fee based on the period I request or the period granted?",
    a: "The period granted. You might ask for 5 years and be granted 1 year; you then pay the 1-year fee (¥33,000 at the counter). The postcard (counter) or payment email (online) from immigration shows the exact amount.",
  },
  {
    q: "I applied before October 1, 2026. Which fee do I pay?",
    a: "The old fee: ¥6,000 at the counter (¥5,500 online) for change or extension and ¥10,000 for permanent residence, as long as the application was received by September 30, 2026, even if permission is granted on or after October 1.",
  },
  {
    q: "Which revenue stamps do I need for a Japan visa renewal?",
    a: "ISA asks for the fewest stamps: ¥10,000 → 10,000; ¥18,000 → 10,000+8,000; ¥25,000 → 20,000+5,000; ¥33,000 → 30,000+3,000; ¥48,000 → 40,000+8,000; ¥64,000 → 60,000+4,000; ¥75,000 → 60,000+10,000+5,000; ¥200,000 → 100,000+100,000. Buy them with cash at a large post office before you go; immigration office shops run out.",
  },
  {
    q: "Is a 5-year visa cheaper per year than a 1-year visa in Japan?",
    a: "Yes. A 5-year grant costs ¥75,000 at the counter (¥15,000 per year) while renewing 1 year at a time costs ¥33,000 each year (¥165,000 over 5 years). Online, 5 years is ¥65,550 against ¥27,330 a year. You cannot choose the period; ISA decides based on your situation.",
  },
  {
    q: "Can the Japan residence fee be reduced or waived?",
    a: "Only in narrow cases: ISA can reduce the fee to ¥10,000 (change or extension over 3 months) or ¥20,000 (permanent residence) for people in hardship comparable to public assistance AND who need humanitarian consideration, such as recognized refugees or trafficking victims. Both conditions must be met.",
  },
  {
    q: "How much will my company pay for foreign employees' renewals?",
    a: "Multiply the fee by headcount. 50 staff renewing for 1 year at the counter cost ¥1,650,000 a year, against ¥300,000 under the old ¥6,000 fee. Online cuts that to ¥1,366,500. This calculator and its API take a headcount and a multi-year horizon.",
  },
  {
    q: "Is there a free Japan visa fee calculator API for AI agents?",
    a: `Yes. Free, no key, CORS open: GET ${PUBLIC_URL}/api/fee?permit=extension&grantedMonths=12&method=counter returns the fee, stamps, online price, and sources. Full table at ${PUBLIC_URL}/api/rules, OpenAPI at ${PUBLIC_URL}/openapi.json, and the japan_visa_fee_check tool on https://free-agent-tools.vercel.app/mcp.`,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · fees from Oct 1 2026</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">How much is a Japan visa renewal from October 2026?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          The flat ¥6,000 fee is gone. From October 1, 2026 you pay by the period of stay granted, up to ¥75,000, and ¥200,000 for permanent residence. Pick your case below.
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Full fee table (applications received from 2026-10-01)</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Period granted</th>
                <th className="px-4 py-3 font-medium">Counter</th>
                <th className="px-4 py-3 font-medium">Online (incl. processing)</th>
                <th className="px-4 py-3 font-medium">Stamps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TIERS.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3">
                    {t.label} <span className="text-muted">({t.labelJa})</span>
                  </td>
                  <td className="px-4 py-3 font-mono">{yen(t.counterJPY)}</td>
                  <td className="px-4 py-3 font-mono">{yen(t.onlineJPY + t.onlineProcessingJPY)}</td>
                  <td className="px-4 py-3 font-mono text-muted">{t.stamps.map((s) => s.toLocaleString("en-US")).join(" + ")}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-3">Permanent residence (永住許可)</td>
                <td className="px-4 py-3 font-mono">{yen(200000)}</td>
                <td className="px-4 py-3 text-muted">counter only in ISA table</td>
                <td className="px-4 py-3 font-mono text-muted">100,000 + 100,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          Before: ¥6,000 counter / ¥5,500 online for change or extension, ¥10,000 for permanent residence. Example shareable result:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            1-year renewal at the counter → ¥33,000
          </a>
          .
        </p>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Agent-callable JSON API</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Free, no key, CORS open.{" "}
          <code className="rounded bg-panel px-1.5 py-0.5 font-mono text-xs text-foreground">GET {PUBLIC_URL}/api/fee?permit=extension&amp;grantedMonths=12&amp;method=counter</code> or POST
          JSON. Also{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/api/rules">/api/rules</a>,{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/openapi.json">/openapi.json</a>,{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/llms.txt">/llms.txt</a>, and the MCP tool on{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://free-agent-tools.vercel.app/" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="Japan visa fee questions" />
    </div>
  );
}
