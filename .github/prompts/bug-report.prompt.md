---
description: Run a failing spec and write a bug report in the team template.
argument-hint: spec path, for example tests/seeded/stock-limit.spec.ts
agent: agent
tools: ['read', 'search', 'execute']
---
Spec to investigate: ${input:spec:tests/seeded/stock-limit.spec.ts}

Do not edit any file.

1. Run the spec with `npx playwright test <spec> --project=seeded` (use the default project if it is not under `tests/seeded/`).
2. Read the test and the failure. Find the story and acceptance criterion it checks in [docs/stories](../../docs/stories/).
3. Decide: application bug, test bug, environment issue, or unconfirmed. A failing test is a signal, not proof.
4. Fill in [bug-report.md](../../docs/templates/bug-report.md) completely, with exact status codes, messages, amounts, the command you ran, and file and line references.
5. Keep confirmed facts and guesses in separate sections.

Output only the completed report.
