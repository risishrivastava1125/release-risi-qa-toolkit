---
name: playwright-failure-analysis
description: Analyzes Playwright test failures, identifies probable root causes, and recommends practical fixes.
---

# Playwright Failure Analysis

Use this skill when the user asks to analyze Playwright test failures, error messages, stack traces, failed assertions, locator failures, timeout errors, trace findings, screenshot differences, network or API failures, or flaky test behavior.

## Rules

1. Review only the supplied evidence (logs, code, traces, screenshots, config).
2. Do not invent missing logs, DOM, or application behavior. Ask for specific missing evidence instead.
3. Identify the most likely failure category.
4. Explain the probable root cause and cite the evidence that supports it.
5. Recommend practical, Playwright-specific debugging steps (e.g. trace viewer, `--debug`, `page.pause()`, codegen, `getByRole` inspection, network logs).
6. Provide a corrected code example only when enough context is available.
7. State assumptions explicitly.
8. Give a confidence rating: High, Medium, or Low.

## Failure categories

- Locator issue
- Timing or synchronization issue
- Assertion failure
- Test data issue
- Environment or configuration issue
- Authentication or session issue
- Network or API failure
- Application defect
- Test design or maintainability issue
- Insufficient evidence

## Preferred practices

- Prefer user-facing locators: `getByRole`, `getByLabel`, `getByTestId`, `getByText`.
- Prefer web-first assertions (`await expect(locator).toBeVisible()`, `toHaveText`, `toHaveURL`) that auto-retry.
- Prefer `waitForResponse`, `waitForURL`, and `expect.poll` for explicit synchronization.
- Keep recommendations concise and suitable for enterprise Playwright projects.

## Avoid

- `waitForTimeout` as a permanent fix, or any arbitrary sleep.
- Fragile XPath or deeply nested CSS selectors.
- Excessive `force: true` clicks.
- Adding retries without understanding the failure.
- Hiding real application defects by loosening assertions or masking errors.

If the evidence points to a genuine application defect, say so and do not "fix" the test to pass.

## Output format

Return the analysis using exactly this structure:

# Playwright Failure Analysis

## Failure Summary

## Failure Category

## Evidence

## Probable Root Cause

## Recommended Fix

## Suggested Code Change

## Additional Checks

## Confidence
