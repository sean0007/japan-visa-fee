import { METHODS, PERMITS, type Method, type Permit } from "./fees";

export const PUBLIC_URL = "https://japan-visa-fee.vercel.app";

/** Share links: /r?k=extension&m=12&a=counter&n=1[&d=YYYY-MM-DD] */
type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type Shared = { permit: Permit; grantedMonths: number; method: Method; headcount: number; applicationDate: string | null };

export const EXAMPLE_SHARED: Shared = { permit: "extension", grantedMonths: 12, method: "counter", headcount: 1, applicationDate: null };

export function parseShared(p: Params): Shared | null {
  const k = one(p, "k") ?? one(p, "permit");
  const permit = (PERMITS as readonly string[]).includes(k ?? "") ? (k as Permit) : null;
  if (!permit) return null;
  const a = one(p, "a") ?? one(p, "method") ?? "counter";
  const method = (METHODS as readonly string[]).includes(a) ? (a as Method) : "counter";
  const m = Number(one(p, "m") ?? one(p, "grantedMonths") ?? (permit === "permanent" ? "60" : ""));
  if (!Number.isInteger(m) || m < 1 || m > 600) return null;
  const nRaw = Number(one(p, "n") ?? one(p, "headcount") ?? "1");
  const headcount = Number.isInteger(nRaw) && nRaw >= 1 && nRaw <= 100000 ? nRaw : 1;
  const d = one(p, "d") ?? one(p, "applicationDate");
  const applicationDate = d && DATE.test(d) && d >= "2025-04-01" ? d : null;
  return { permit, grantedMonths: permit === "permanent" ? 60 : m, method, headcount, applicationDate };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("k", s.permit);
  if (s.permit !== "permanent") q.set("m", String(s.grantedMonths));
  q.set("a", s.method);
  if (s.headcount !== 1) q.set("n", String(s.headcount));
  if (s.applicationDate) q.set("d", s.applicationDate);
  return q.toString();
}

export const resultPath = (s: Shared) => `/r?${sharedQuery(s)}`;
export const ogPath = (s: Shared) => `/og?${sharedQuery(s)}`;
export const isExample = (s: Shared) => sharedQuery(s) === sharedQuery(EXAMPLE_SHARED);
export const yen = (n: number) => `¥${Math.round(n).toLocaleString("en-US")}`;

export const PERMIT_LABEL: Record<Permit, string> = {
  extension: "Extension of period of stay",
  change: "Change of status of residence",
  permanent: "Permanent residence",
};

export function periodLabel(months: number): string {
  if (months % 12 === 0) return `${months / 12} year${months === 12 ? "" : "s"}`;
  if (months > 12) return `${Math.floor(months / 12)}y ${months % 12}m`;
  return `${months} month${months === 1 ? "" : "s"}`;
}
