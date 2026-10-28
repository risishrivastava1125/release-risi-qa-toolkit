# risi-qa-toolkit

## 1. Overview

An Agent Plugins 1.0 plugin for QA Mart: it reviews Playwright tests, analyzes failures, tests coupon boundaries, triages bugs, keeps agents out of `app/`, and exposes the app and the last test run through a read-only MCP server.

The plugin name must be lowercase kebab-case, otherwise the plugin is not listed.

## 2. Included components

| Type | Name | Purpose |
|------|------|---------|
| Skill (portable) | `playwright-failure-analysis` | Analyzes failures, finds probable root causes, recommends fixes |
| Skill (portable) | `coupon-boundary-testing` | Builds boundary matrices for the US-101 coupon rules and checks them against the API |
| Agent (Copilot-specific) | `test-reviewer` | Reviews Playwright tests for reliability and maintainability |
| Agent (Copilot-specific) | `bug-triage` | Classifies failures as app bug, test bug, environment issue or unconfirmed |
| Hook (`preToolUse`) | `scripts/guard-app.cjs` | Denies agent edits under `app/` |
| Hook (`postToolUse`) | `scripts/post-edit-checks.cjs` | Runs `lint:specs` and `typecheck` after spec or Page Object edits and feeds problems back |
| MCP server | `qamart` (`mcp/qamart-server.cjs`) | Read-only tools: `qamart_health`, `qamart_validate_coupon`, `tests_last_run_summary`, `tests_list_failures` |

Instructions and prompt files are not plugin components. They live in the repository under `.github/`:

| Type | File |
|------|------|
| Instructions (always on) | `.github/copilot-instructions.md` |
| Instructions (`applyTo`) | `.github/instructions/specs.instructions.md`, `.github/instructions/page-objects.instructions.md` |
| Prompts | `.github/prompts/bug-report.prompt.md`, `.github/prompts/test-from-story.prompt.md` |

Inheritance: `.github/copilot-instructions.md` applies to every request; the `applyTo` files add rules for matching files; an agent file may narrow them further but never relax them.

## 3. Folder structure

```
risi-qa-toolkit/
├── plugin.json
├── mcp.json
├── README.md
├── skills/
│   ├── playwright-failure-analysis/SKILL.md
│   └── coupon-boundary-testing/SKILL.md
├── com.github.copilot/
│   ├── agents/
│   │   ├── test-reviewer.agent.md
│   │   └── bug-triage.agent.md
│   └── hooks/hooks.json
├── mcp/qamart-server.cjs
└── scripts/
    ├── guard-app.cjs
    └── post-edit-checks.cjs
```

## 4. Local registration

Add this to your VS Code user settings (Windows). Replace the path with the actual absolute path of this folder.

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "C:\\absolute\\path\\to\\risi-qa-toolkit": true
  }
}
```

Unix/macOS:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "/absolute/path/to/risi-qa-toolkit": true
  }
}
```

The path must be replaced with the real absolute path on your machine.

Requirements: Node 20 or newer (the MCP server and hooks have no npm dependencies). Start QA Mart with `npm start` for the MCP tools that call the app, and run `npm test` to create `reports/results.json` for the test-result tools.

## 5. Verification

1. Reload or restart VS Code if required.
2. Open Extensions.
3. Enter `@agentPlugins`.
4. Check the Installed section for `risi-qa-toolkit`.
5. Open Chat > Open Customizations and confirm both skills, both agents and the hooks are visible.
6. Run **MCP: List Servers** and confirm `qamart` is running and lists four tools.
7. Disable the plugin and verify every component disappears; enable it and verify they return.

Plugin MCP servers run code on your machine without a trust prompt. Read `mcp/qamart-server.cjs` before enabling it. It is read-only: it never places orders, resets data or writes files.

## 6. Demo

1. `npm start` in one terminal and `npm run test:seeded` in another (5 failures are expected).
2. Ask: "Use the QA Mart MCP tools to list the failures from the last run, then use the bug-triage agent to classify the first one."
3. Ask: "Use the QA Mart MCP tools to check FLAT100 at 499, 500 and 501 rupees, then use the coupon-boundary-testing skill to build the matrix."
4. Ask an agent to change `app/server.js` and confirm the `guard-app` hook denies it.
5. Edit a spec so it uses `waitForTimeout` and confirm the `post-edit-checks` hook feeds the lint failure back.
6. Ask: "Use the test-reviewer agent to review tests/legacy."

## 7. Safety and guardrails

- `app/` is protected by a `preToolUse` hook; failing tests are reported with `docs/templates/bug-report.md`, never fixed by weakening them.
- The MCP server is read-only, validates its inputs, bounds its output, uses a 10 second request timeout, and keeps secrets out of tool output and logs.
- Agents and skills must not request or print credentials, cookies, tokens or storage state.
- The plugin writes nothing into its own folder.
- Review this test for weak locators, hard-coded waits, and flaky behavior.
- Analyze this failure and separate an application defect from a test automation defect.

## 7. Troubleshooting

- **Plugin not listed:** Check `chat.plugins.enabled`, the absolute plugin path, the plugin name, JSON validity, and VS Code experimental feature availability.
- **Skill not visible:** Confirm the folder is named `playwright-failure-analysis` and the `SKILL.md` frontmatter `name` matches exactly.
- **Agent not visible:** Confirm the file is under `com.github.copilot/agents` and uses the `.agent.md` extension.
- **Duplicate behavior:** Search for duplicate skill or agent copies under `.github` and other registered plugin locations.

## 8. Removal or disable

- Disable: set the path to `false` in `chat.pluginLocations`, or disable it from `@agentPlugins` in Extensions.
- Remove: delete the path entry from `chat.pluginLocations`, then delete this folder if no longer needed.

## 9. Safety notes

- The agent does not modify files unless explicitly asked.
- Do not paste credentials, tokens, cookies, or storage-state contents into prompts.
- Review suggested code changes before applying them.
