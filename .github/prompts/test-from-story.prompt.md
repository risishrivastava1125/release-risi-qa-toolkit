---
description: Turn a QA Mart story into a test-case table and a first Playwright spec.
argument-hint: story id, for example US-103
agent: agent
---
Story id: ${input:story:US-103}

1. Read the matching file in [docs/stories](../../docs/stories/). If none matches, say so and stop.
2. Write a test-case table in the format of [test-case.md](../../docs/templates/test-case.md): one row per acceptance criterion, plus negative and boundary cases. Name the technique for each row and whether it is UI or API.
3. Write `tests/lab/<story id lowercase>.spec.ts` for the highest-priority rows using [fixtures](../../tests/fixtures.ts) and [test data](../../tests/test-data.ts), with the story id and AC number in each test title.
4. Run `npm run typecheck`, `npm run lint:specs` and the new spec.
5. If a test fails because the app disagrees with the story, keep the test and report it. Do not weaken the assertion and do not edit `app/`.

Finish with the table, the spec path, and the failing tests with the story criterion each one breaks.
