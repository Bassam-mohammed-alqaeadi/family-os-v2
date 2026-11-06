// Validates every ```mermaid block in docs/:
//  1. fence balance (every opener has a closer), and
//  2. syntax, via mermaid.parse() under jsdom.
// Exits non-zero on any failure. Run from anywhere in the repo via:
//   cd scripts && npm install --no-audit --no-fund && node check-mermaid.mjs
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });

const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false });

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = execSync('git ls-files "docs/**/*.md"', { cwd: root, encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
let total = 0;
const failures = [];

for (const f of files) {
  const text = readFileSync(join(root, f), 'utf-8');
  const openers = (text.match(/^```mermaid\s*$/gm) || []).length;
  const blocks = [...text.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (openers !== blocks.length) {
    failures.push(`${f}: fence imbalance — ${openers} openers, ${blocks.length} closed blocks`);
  }
  for (const b of blocks) {
    total++;
    try {
      await mermaid.parse(b);
    } catch (e) {
      failures.push(`${f}: mermaid parse error — ${String(e.message || e).slice(0, 200)}`);
    }
  }
}

console.log(`mermaid: ${total} blocks checked in ${files.length} files`);
if (failures.length > 0) {
  for (const x of failures) console.error('FAIL ' + x);
  process.exit(1);
}
console.log('mermaid: OK');
