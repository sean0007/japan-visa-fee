import { ImageResponse } from "next/og";
import { calculateFee } from "@/lib/fees";
import { EXAMPLE_SHARED, PERMIT_LABEL, parseShared, periodLabel, yen } from "@/lib/share";

export async function GET(req: Request) {
  const shared = parseShared(new URL(req.url).searchParams) ?? EXAMPLE_SHARED;
  const r = calculateFee(shared);
  const stats = [
    { label: shared.method === "counter" ? "at the counter" : "online incl. processing", value: yen(r.totalPerPersonJPY) },
    { label: r.regime === "revised_2026_10" ? "vs before Oct 2026" : "old schedule", value: r.increaseJPY > 0 ? `+${yen(r.increaseJPY)}` : yen(r.previousFeeJPY) },
    { label: shared.headcount > 1 ? `total for ${shared.headcount} people` : "rules as of", value: shared.headcount > 1 ? yen(r.totalJPY) : r.rulesAsOf },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.24em", textTransform: "uppercase", color: "#f0b429" }}>Japan Visa Fee</div>
          <div style={{ display: "flex", fontSize: 22, color: "#9b9588" }}>fees from Oct 1, 2026</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, color: "#c9c3b6" }}>
            {PERMIT_LABEL[shared.permit]}
            {shared.permit === "permanent" ? "" : ` · ${periodLabel(shared.grantedMonths)} granted`}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 6 }}>
            <span style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.04em", color: "#99f6e4", lineHeight: 1 }}>{yen(r.feeJPY)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", flex: 1, border: "2px solid #23252c", borderRadius: 24, padding: "14px 20px", background: "#101218" }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: "#f3efe4" }}>{s.value}</span>
              <span style={{ fontSize: 20, color: "#9b9588" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6f6a60" }}>
          <span>japan-visa-fee.vercel.app · free, no login</span>
          <span>Not legal advice. ISA postcard is final.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
