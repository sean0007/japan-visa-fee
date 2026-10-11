import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calculator } from "@/components/calculator";
import { calculateFee } from "@/lib/fees";
import { EXAMPLE_SHARED, PERMIT_LABEL, PUBLIC_URL, isExample, ogPath, parseShared, periodLabel, resultPath, yen } from "@/lib/share";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

type SP = Promise<Record<string, string | string[] | undefined>>;

function headline(s: NonNullable<ReturnType<typeof parseShared>>) {
  return `${PERMIT_LABEL[s.permit]}${s.permit === "permanent" ? "" : ` (${periodLabel(s.grantedMonths)})`}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const shared = parseShared(await searchParams);
  if (!shared) return { title: "Your result", robots: { index: false, follow: true } };
  const r = calculateFee(shared);
  const title = `${yen(r.totalPerPersonJPY)} Japan visa fee: ${headline(shared)}, ${shared.method}`;
  const description = `${r.regime === "revised_2026_10" ? "Revised fee from 2026-10-01" : "Old fee (received by 2026-09-30)"}${r.increaseJPY > 0 ? `, +${yen(r.increaseJPY)} vs before` : ""}${shared.headcount > 1 ? `. ${shared.headcount} people: ${yen(r.totalJPY)}` : ""}. Rules as of ${r.rulesAsOf}. Estimate only; ISA postcard is final.`;
  const url = `${PUBLIC_URL}${resultPath(shared)}`;
  const indexable = isExample(shared) || resultPath(shared) === "/r?k=permanent&a=counter";
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: `Japan Visa Fee Calculator · ${title}`, description, type: "website", url, images: [{ url: ogPath(shared), width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: `Japan Visa Fee Calculator · ${title}`, description, images: [ogPath(shared)] },
  };
}

export default async function ResultPage({ searchParams }: { searchParams: SP }) {
  const shared = parseShared(await searchParams);
  if (!shared) redirect("/");
  const r = calculateFee(shared);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Shared result · Japan Visa Fee</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          <span className="text-teal-200">{yen(r.totalPerPersonJPY)}</span> for {headline(shared).toLowerCase()}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {shared.method === "counter" ? "At the counter (revenue stamps)" : "Online (convenience store / bank, incl. processing fee)"}
          {r.increaseJPY > 0 ? ` · +${yen(r.increaseJPY)} vs the old fee` : ""}
          {shared.headcount > 1 ? ` · ${shared.headcount} people = ${yen(r.totalJPY)}` : ""} · rules as of {r.rulesAsOf}
        </p>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-muted underline underline-offset-2 hover:text-foreground">
            ← Start over
          </Link>
          {isExample(shared) ? null : (
            <>
              {" · "}
              <Link href={resultPath(EXAMPLE_SHARED)} className="text-muted underline underline-offset-2 hover:text-foreground">
                Open the example
              </Link>
            </>
          )}
        </p>
      </section>
      <section className="mt-8">
        <Calculator initial={shared} />
      </section>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
        {DISCLAIMER_SHORT} {HONESTY}
      </p>
    </div>
  );
}
