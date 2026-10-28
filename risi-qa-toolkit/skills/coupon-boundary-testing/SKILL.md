---
name: coupon-boundary-testing
description: "Use when designing, writing or reviewing tests for QA Mart coupon, discount, threshold, cap or rounding rules, such as SAVE10, FLAT100, WELCOME50, SUMMER25 or any 'X or more' rule (US-101)."
---
# Coupon boundary testing

Money rules fail at the edges, so test the edges on purpose. The source of truth is `docs/stories/US-101-coupon-story.md`; if the user's story differs, trust the story and note the difference.

## Rules (US-101)

| Code | Rule |
|---|---|
| SAVE10 | 10% off subtotal, rounded down to the rupee, capped at ₹200 |
| FLAT100 | ₹100 off when subtotal is ₹500 or more (500 is inclusive) |
| WELCOME50 | 50% off, capped at ₹250, first order only (asha is first order; ravi is returning) |
| SUMMER25 | Expired: "This coupon has expired" |
| Anything else | "Invalid coupon code" |
| All codes | Case-insensitive; surrounding spaces ignored |

## Steps

1. For each rule list boundaries: threshold (n-1, n, n+1), cap (cap-1, cap, cap+1 on the subtotal that produces it), rounding (a subtotal whose percentage has a fraction), and eligibility (first order versus returning shopper).
2. Build one matrix row per value with a one-line reason: `code | subtotal | shopper | expected discount | why`.
3. Confirm each row against the live API with the `qamart_validate_coupon` MCP tool (or `POST /api/coupons/validate` with `{ code, subtotal, email }`). Record the status and discount.
4. A row where the app disagrees with the rule is an application bug. Report it with `docs/templates/bug-report.md`. Do not change the expected value to match the app and do not edit `app/`.
5. Write the spec in `tests/lab/` as a loop over the matrix, using `tests/fixtures.ts` and `tests/test-data.ts`. Put the story id and AC number in each test title.

## Output

The filled matrix, the spec path, and the list of rows where the app disagrees with the rule.
