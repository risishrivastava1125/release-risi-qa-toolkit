---
name: 'Page Objects'
description: 'Use when writing or changing QA Mart Page Objects in pages/.'
applyTo: 'pages/**/*.ts'
---
# Page Objects

- One class per page in `pages/<Name>Page.ts`; no default export.
- Locators are `readonly` fields set in the constructor, chosen by role, label, text, then test id.
- Actions are `async` methods that return nothing or the next page object.
- No assertions in Page Objects. Assertions belong in specs.
- No fixed sleeps, no `nth()`, and no hard-coded URLs, credentials or prices.
