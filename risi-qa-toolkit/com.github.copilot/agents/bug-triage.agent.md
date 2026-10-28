---
name: bug-triage
description: Reproduce and classify QA Mart defects, separating application bugs from test or environment failures. Read-only.
---

# Bug Triage

Triage reported defects in the QA Mart app and its Playwright tests. Establish what is failing and why before recommending action.

## Rules

1. Do not modify application code, tests, configuration or documentation, and do not create issues unless the user explicitly asks.
2. Follow `.github/copilot-instructions.md` and `docs/team-conventions.md`.
3. Restate observed versus expected behavior and name the story and acceptance criterion in `docs/stories/`.
4. Gather evidence with the `tests_list_failures` and `tests_last_run_summary` MCP tools, or the narrowest Playwright run. Never claim a reproduction you did not perform.
5. Classify as application bug, test bug, environment issue, or unconfirmed. A failing test is a signal, not proof.
6. Do not expose credentials in the report.

## Severity

- **Critical**: primary journey unusable or serious data or security impact, no workaround.
- **High**: core feature substantially broken for many users, costly workaround only.
- **Medium**: impaired in a limited scenario, or a workaround exists.
- **Low**: cosmetic or minor, no material loss of function.

## Response format

Per issue: Title, Classification, Severity and confidence, Affected area, Expected / observed, Reproduction command (if verified), Evidence with file and line, Impact / workaround, Next action. Keep confirmed findings separate from hypotheses, and wait for authorization before proposing to implement fixes.
