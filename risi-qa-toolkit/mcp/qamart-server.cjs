#!/usr/bin/env node
// QA Mart MCP server: read-only, stdio, newline-delimited JSON-RPC, no dependencies.
// Env: QAMART_URL (default http://127.0.0.1:3000), QAMART_REPORT (default <cwd>/reports/results.json).
// stdout carries protocol messages only; diagnostics go to stderr.
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const BASE = (process.env.QAMART_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const REPORT = process.env.QAMART_REPORT || path.join(process.cwd(), 'reports', 'results.json');
const PROTOCOL = '2024-11-05';
const MAX_FAILURES = 100;

const log = (...a) => console.error('[risi-qamart-mcp]', ...a);
const text = (value) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] });
const stripAnsi = (s) => String(s || '').replace(/\u001b\[[0-9;]*m/g, '');

async function post(route, body) {
  let res;
  try {
    res = await fetch(BASE + route, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    throw new Error(`QA Mart is not reachable at ${BASE}. Start it with "npm start". (${err.message})`);
  }
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function get(route) {
  let res;
  try {
    res = await fetch(BASE + route, { signal: AbortSignal.timeout(10000) });
  } catch (err) {
    throw new Error(`QA Mart is not reachable at ${BASE}. Start it with "npm start". (${err.message})`);
  }
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

function readReport() {
  if (!fs.existsSync(REPORT)) throw new Error(`No report at ${REPORT}. Run "npm test" first so the JSON reporter writes it.`);
  return JSON.parse(fs.readFileSync(REPORT, 'utf8'));
}

function* walkSpecs(suite, file) {
  const f = suite.file || file;
  for (const spec of suite.specs || []) yield { spec, file: f };
  for (const child of suite.suites || []) yield* walkSpecs(child, f);
}

function firstErrorLines(result) {
  const msg = stripAnsi((result.error && result.error.message) || (result.errors && result.errors[0] && result.errors[0].message) || '');
  const lines = msg.split('\n').map((l) => l.trim()).filter(Boolean);
  const expected = lines.find((l) => l.startsWith('Expected'));
  const received = lines.find((l) => l.startsWith('Received'));
  return [lines[0], expected, received].filter(Boolean).join(' | ').slice(0, 500);
}

function failures(report) {
  const out = [];
  for (const root of report.suites || []) {
    for (const { spec, file } of walkSpecs(root, root.file)) {
      for (const t of spec.tests || []) {
        const last = (t.results || []).slice(-1)[0] || {};
        if (last.status === 'failed' || last.status === 'timedOut') {
          out.push({ file, line: spec.line, title: spec.title, project: t.projectName, error: firstErrorLines(last) });
        }
      }
    }
  }
  return out;
}

const READ_ONLY = { readOnlyHint: true, destructiveHint: false };

const TOOLS = [
  {
    name: 'qamart_health', description: 'Check that the QA Mart app is running.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => text((await get('/api/health')).data),
  },
  {
    name: 'qamart_validate_coupon',
    description: 'Validate a coupon code for a subtotal in rupees against POST /api/coupons/validate. Read-only: it does not place an order.',
    inputSchema: {
      type: 'object', required: ['code', 'subtotal'], additionalProperties: false,
      properties: {
        code: { type: 'string', maxLength: 40 },
        subtotal: { type: 'number', minimum: 0, maximum: 1000000 },
        email: { type: 'string', maxLength: 120, description: 'Shopper email; matters for WELCOME50.' },
      },
    },
    run: async (a) => {
      if (typeof a.code !== 'string' || typeof a.subtotal !== 'number') throw new Error('code (string) and subtotal (number) are required.');
      const r = await post('/api/coupons/validate', { code: a.code, subtotal: a.subtotal, email: a.email || 'asha@qamart.test' });
      return text({ httpStatus: r.status, ...r.data });
    },
  },
  {
    name: 'tests_last_run_summary', description: 'Totals from the last Playwright run (reports/results.json).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => {
      const { stats } = readReport();
      return text({ report: REPORT, startTime: stats.startTime, durationMs: Math.round(stats.duration),
        passed: stats.expected, failed: stats.unexpected, flaky: stats.flaky, skipped: stats.skipped });
    },
  },
  {
    name: 'tests_list_failures', description: `Failed tests from the last run (up to ${MAX_FAILURES}): file, line, title, project and first error lines.`,
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => {
      const all = failures(readReport());
      return text({ total: all.length, truncated: all.length > MAX_FAILURES, failures: all.slice(0, MAX_FAILURES) });
    },
  },
];

function send(msg) { process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', ...msg })}\n`); }

async function handle({ id, method, params }) {
  const isRequest = id !== undefined && id !== null;
  try {
    if (method === 'initialize') {
      return send({ id, result: { protocolVersion: (params && params.protocolVersion) || PROTOCOL,
        capabilities: { tools: {} }, serverInfo: { name: 'risi-qamart', version: '1.1.0' } } });
    }
    if (method === 'ping') return send({ id, result: {} });
    if (method === 'tools/list') {
      return send({ id, result: { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema, annotations: READ_ONLY })) } });
    }
    if (method === 'tools/call') {
      const tool = TOOLS.find((t) => t.name === (params && params.name));
      if (!tool) return send({ id, error: { code: -32602, message: `Unknown tool: ${params && params.name}` } });
      try {
        return send({ id, result: await tool.run((params && params.arguments) || {}) });
      } catch (err) {
        return send({ id, result: { content: [{ type: 'text', text: err.message }], isError: true } });
      }
    }
    if (isRequest) return send({ id, error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (err) {
    log(err);
    if (isRequest) send({ id, error: { code: -32603, message: 'Internal error' } });
  }
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return send({ id: null, error: { code: -32700, message: 'Parse error' } }); }
  handle(msg);
});
rl.on('close', () => process.exit(0));
log(`ready, app at ${BASE}, report at ${REPORT}`);
