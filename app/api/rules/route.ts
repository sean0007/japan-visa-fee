import { preflight, staticJson } from "@/lib/agent-api";
import { PUBLIC_URL } from "@/lib/api";
import { RULES } from "@/lib/fees";

export function GET() {
  return staticJson({ ...RULES, docs: `${PUBLIC_URL}/openapi.json`, calculator: `${PUBLIC_URL}/api/fee` });
}
export const OPTIONS = preflight;
