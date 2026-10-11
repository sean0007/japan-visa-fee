# Japan Visa Fee Calculator

Free calculator for Japan's residence permit fees (在留許可手数料) revised on **2026-10-01**: extension of period of stay (visa renewal), change of status, and permanent residence.

- Live: https://japan-visa-fee.vercel.app
- API: `GET/POST /api/fee`, `GET /api/rules`
- Agent docs: `/llms.txt`, `/openapi.json`, `/.well-known/ai-plugin.json`
- MCP tool: `japan_visa_fee_check` on https://free-agent-tools.vercel.app/mcp

**Educational estimate, not immigration or legal advice.** ISA decides the period granted; the postcard or payment email is final.

## Example

```
GET https://japan-visa-fee.vercel.app/api/fee?permit=extension&grantedMonths=12&method=counter
```
→ `feeJPY: 33000`, `revenueStamps: [30000, 3000]`, `increaseJPY: 27000`.

## Rules implemented (verified 2026-10-11 against ISA pages)

| Period granted | Counter | Online (+ processing) |
|---|---|---|
| ≤ 3 months | ¥10,000 | ¥10,000 + ¥330 |
| > 3 to ≤ 6 months | ¥18,000 | ¥15,000 + ¥330 |
| > 6 months, < 1 year | ¥25,000 | ¥21,000 + ¥330 |
| 1 year | ¥33,000 | ¥27,000 + ¥330 |
| > 1, < 3 years | ¥48,000 | ¥42,000 + ¥330 |
| ≥ 3, < 5 years | ¥64,000 | ¥56,000 + ¥550 |
| ≥ 5 years | ¥75,000 | ¥65,000 + ¥550 |
| Permanent residence | ¥200,000 | — |

- Applications **received** by 2026-09-30 pay the old fee (¥6,000 / ¥5,500 / ¥10,000) even if granted later.
- Counter stamp combinations from https://www.moj.go.jp/isa/01_00646.html.
- Reduction to ¥10,000 / ¥20,000 only under ISA's hardship + humanitarian guideline.

Sources: https://www.moj.go.jp/isa/01_00644.html · https://www.moj.go.jp/isa/content/001469201.pdf · https://www.moj.go.jp/isa/11_00107.html · https://www.moj.go.jp/isa/applications/faq/01_00650.html

## Dev

```
npm install
npm test
npm run build
```

MIT license.
