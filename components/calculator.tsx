"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { calculateFee, type Method, type Permit } from "@/lib/fees";
import { EXAMPLE_SHARED, PERMIT_LABEL, PUBLIC_URL, periodLabel, resultPath, yen, type Shared } from "@/lib/share";

const PERIODS = [
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "1 year" },
  { months: 15, label: "1 year 3 months" },
  { months: 36, label: "3 years" },
  { months: 60, label: "5 years" },
];

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [permit, setPermit] = useState<Permit>(start.permit);
  const [months, setMonths] = useState<number>(start.grantedMonths);
  const [method, setMethod] = useState<Method>(start.method);
  const [headcount, setHeadcount] = useState<string>(String(start.headcount));
  const [applicationDate, setApplicationDate] = useState<string>(start.applicationDate ?? "");

  const n = Math.max(1, Math.min(100000, Math.floor(Number(headcount) || 1)));
  const shared: Shared = { permit, grantedMonths: months, method, headcount: n, applicationDate: applicationDate && applicationDate >= "2025-04-01" ? applicationDate : null };
  const result = (() => {
    try {
      return calculateFee(shared);
    } catch {
      return null;
    }
  })();
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your application</p>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-foreground">Permission</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(["extension", "change", "permanent"] as Permit[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPermit(p)}
                aria-pressed={permit === p}
                className={`rounded-2xl border px-3 py-2 text-left text-sm ${permit === p ? "border-amber bg-amber/10 text-foreground" : "border-line text-muted hover:border-amber/50"}`}
              >
                {PERMIT_LABEL[p]}
                <span className="block text-xs text-muted">{p === "extension" ? "在留期間更新 (renewal)" : p === "change" ? "在留資格変更" : "永住許可"}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {permit !== "permanent" && (
          <label className="mt-5 block">
            <span className="text-sm font-medium text-foreground">Period of stay granted</span>
            <span className="mt-0.5 block text-xs text-muted">The fee follows the period ISA grants, not the one you ask for. Your postcard shows it.</span>
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={field}>
              {PERIODS.map((p) => (
                <option key={p.months} value={p.months}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-foreground">How you apply</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["counter", "online"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                aria-pressed={method === m}
                className={`rounded-full border px-4 py-1.5 text-sm ${method === m ? "border-amber bg-amber/10 text-foreground" : "border-line text-muted hover:border-amber/50"}`}
              >
                {m === "counter" ? "At the immigration counter" : "Online (在留申請オンライン)"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Application received on</span>
            <span className="mt-0.5 block text-xs text-muted">Optional. By 2026-09-30 = old fee.</span>
            <input type="date" value={applicationDate} min="2025-04-01" onChange={(e) => setApplicationDate(e.target.value)} className={`${field} font-mono`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">People</span>
            <span className="mt-0.5 block text-xs text-muted">Family or employees whose fees you pay</span>
            <input inputMode="numeric" value={headcount} onChange={(e) => setHeadcount(e.target.value)} className={`${field} font-mono`} />
          </label>
        </div>
      </div>

      <article data-testid="result-card" className="relative flex flex-col overflow-hidden rounded-3xl border border-line bg-black/50 lg:sticky lg:top-16 lg:self-start">
        <div className="p-5 sm:p-7">
          <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
            {PERMIT_LABEL[permit]}
            {permit === "permanent" ? "" : ` · ${periodLabel(months)}`}
          </p>
          {result ? (
            <>
              <h2 className="mt-2 font-display text-5xl text-teal-200">{yen(result.totalPerPersonJPY)}</h2>
              <p className="mt-2 text-sm text-muted">
                {result.processingFeeJPY > 0 ? `${yen(result.feeJPY)} fee + ${yen(result.processingFeeJPY)} processing · ` : ""}
                {result.regime === "revised_2026_10" ? "revised fee (from 2026-10-01)" : "old fee (received by 2026-09-30)"}
                {result.increaseJPY > 0 ? ` · +${yen(result.increaseJPY)} vs before` : ""}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {result.headcount > 1 && (
                  <div className="rounded-2xl border border-line p-3">
                    <dt className="text-xs text-muted">Total for {result.headcount} people</dt>
                    <dd className="font-mono text-foreground">{yen(result.totalJPY)}</dd>
                  </div>
                )}
                {result.perYearJPY !== null && (
                  <div className="rounded-2xl border border-line p-3">
                    <dt className="text-xs text-muted">Per year of stay</dt>
                    <dd className="font-mono text-foreground">{yen(result.perYearJPY)}</dd>
                  </div>
                )}
                {result.horizon && (
                  <div className="rounded-2xl border border-line p-3">
                    <dt className="text-xs text-muted">Over {result.horizon.years} years ({result.horizon.applicationsNeeded}×)</dt>
                    <dd className="font-mono text-foreground">{yen(result.horizon.costTotalJPY)}</dd>
                  </div>
                )}
                {result.onlineSavingPerPersonJPY !== null && method === "counter" && result.onlineSavingPerPersonJPY > 0 && (
                  <div className="rounded-2xl border border-teal-200/30 bg-teal-200/5 p-3">
                    <dt className="text-xs text-muted">Online would save</dt>
                    <dd className="font-mono text-foreground">{yen(result.onlineSavingPerPersonJPY)} / person</dd>
                  </div>
                )}
                {result.revenueStamps.length > 0 && (
                  <div className="col-span-2 rounded-2xl border border-amber/30 bg-amber/5 p-3">
                    <dt className="text-xs text-muted">Revenue stamps to buy (収入印紙, cash only)</dt>
                    <dd className="font-mono text-foreground">{result.revenueStamps.map(yen).join(" + ")}</dd>
                  </div>
                )}
              </dl>
              <ul className="mt-5 space-y-1.5 text-xs leading-relaxed text-muted">
                {result.notes.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-amber">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-4" data-testid="share-result">
                <p className="text-xs text-muted">Share this result. The link carries only these choices; nothing is stored.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ShareBar url={shareUrl} text={`Japan visa fee from Oct 2026: ${PERMIT_LABEL[permit]}${permit === "permanent" ? "" : `, ${periodLabel(months)}`} = ${yen(result.totalPerPersonJPY)}. Free calculator:`} />
                  <a href={resultPath(shared)} className="text-sm text-muted underline underline-offset-2 hover:text-foreground">
                    Open result page
                  </a>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">Pick a permission and period.</p>
          )}
        </div>
        <CardDisclaimer />
      </article>
    </div>
  );
}
