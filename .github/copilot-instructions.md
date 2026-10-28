# Copilot instructions: QA Mart Playwright tests

## Situation
- App under test: QA Mart, served by `app/server.js` at http://localhost:3000. Pages: /login, /products, /cart, /checkout, /confirmation. API: /api/login, /api/products, /api/coupons/validate, /api/orders.
- Stack: Playwright Test (TypeScript). The v2 redesign (`npm run test:v2`) changes classes, ids, DOM nesting and product order; accessible names do not change.

## Rules
- Page Objects live in `pages/<Name>Page.ts`, one class per page, with `readonly` locators and `async` actions. Assertions stay in specs.
- Specs live in `tests/<area>/<feature>.spec.ts` (lab work in `tests/lab/`). Shared fixtures are in `tests/fixtures.ts`; emails, passwords and prices come from `tests/test-data.ts`.
- Locator order: `getByRole`, `getByLabel`, `getByText`, `getByTestId`. Never XPath, CSS classes, ids, `nth()` or `first()`.
- Use web-first assertions. Never `waitForTimeout`, and never read a value then assert on it.
- Use `baseURL` with relative paths; never hard-code `http://localhost:3000`.
- Put the story id (for example `US-101 AC3`) in the describe or test title. One behavior per test.
- Never weaken an assertion or edit `app/` to make a test pass. Report application bugs with `docs/templates/bug-report.md`.
- Never put credentials, personal data or tokens in prompts, specs, logs or reports.
- Before handing work over run `npm run typecheck`, `npm run lint:specs` and `npm test`.
