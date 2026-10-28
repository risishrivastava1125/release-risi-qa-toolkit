// preToolUse hook: deny agent edits under app/ so a failing test is reported, not hidden.
// Handles both harness payloads (toolName/toolArgs and tool_name/tool_input); a crash must not block unrelated tools.
const fs = require('node:fs');
const path = require('node:path');

const allow = () => process.stdout.write('{}');

let event;
try {
  event = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  allow();
  process.exit(0);
}

const toolName = String(event.toolName ?? event.tool_name ?? '');
let args = event.toolArgs ?? event.tool_input ?? {};
if (typeof args === 'string') {
  // Raw patch text is not JSON; keep it so the file headers inside are still checked.
  try { args = JSON.parse(args); } catch { /* keep raw string */ }
}

const EDIT_TOOL = /edit|create|write|replace|patch|insert/i;
const PATH_KEY = /^(path|filepath|file_path|file|uri)$/i;
const PATCH_HEADER = /^\*\*\* (?:Add|Update|Delete) File:[ \t]*([^\r\n]+)/gm;

function collectPaths(value, out = []) {
  if (Array.isArray(value)) value.forEach((v) => collectPaths(v, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (PATH_KEY.test(k) && typeof v === 'string') out.push(v.replace(/^file:\/\//, ''));
      else collectPaths(v, out);
    }
  } else if (typeof value === 'string') {
    for (const m of value.matchAll(PATCH_HEADER)) out.push(m[1].trim());
  }
  return out;
}

const root = path.resolve(event.cwd || process.cwd());
const appDir = path.join(root, 'app') + path.sep;
// Case-insensitive file systems treat App/ and app/ as the same folder.
const norm = (p) => (process.platform === 'linux' ? p : p.toLowerCase());
const touchesApp = EDIT_TOOL.test(toolName)
  && collectPaths(args).some((p) => norm(path.resolve(root, p) + path.sep).startsWith(norm(appDir)));

if (touchesApp) {
  const reason = 'app/ is read-only for agents. Keep the failing test and report the application bug with docs/templates/bug-report.md.';
  process.stdout.write(JSON.stringify({
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
} else {
  allow();
}
