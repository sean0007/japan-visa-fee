import { ImageResponse } from "next/og";

export const alt = "Japan Visa Fee Calculator (October 2026)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "64px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.28em", textTransform: "uppercase", color: "#f0b429" }}>Free · Japan · From Oct 1 2026</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1050 }}>
            How much is a Japan visa renewal now?
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#9b9588", maxWidth: 1000, lineHeight: 1.35 }}>
            1 year ¥33,000 · 3 years ¥64,000 · 5 years ¥75,000 · Permanent residence ¥200,000 (counter)
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 22, color: "#9b9588" }}>
          <span style={{ color: "#99f6e4" }}>Online vs counter</span>
          <span>Revenue stamps</span>
          <span>Free JSON API · no login</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
