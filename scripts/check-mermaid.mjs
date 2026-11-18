// Validates every ```mermaid block in docs/:
//  1. fence balance (every opener has a closer),
//  2. syntax, via mermaid.parse() under jsdom, and
//  3. participant-declaration direction (R5-1, R2-CI-05): in sequence
//     diagrams a `participant <id> as <name>` / `actor <id> as <name>`
//     declaration must put the Latin identifier first and the Arabic
//     display name after `as` — the backwards form
//     `participant البوابة as S101` (Arabic first, Latin identifier
//     after `as`) fails. Only this direction rule is checked here;
//     no other semantic rules (Arabic labels are legitimate).
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

// R5-1 participant-declaration direction (R2-CI-05): a declaration
// `participant X as Y` / `actor X as Y` is backwards when X contains
// Arabic-script characters and Y is a bare Latin identifier. The
// correct form has the Latin identifier first. Quoted display names
// are unquoted before testing; Y must be a bare Latin identifier
// (e.g. `S101`, `Ktor`) to count as backwards — an Arabic Y, or a Y
// with spaces/punctuation, is a legitimate display name and passes.
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LATIN_ID = /^[A-Za-z][A-Za-z0-9_]*$/;
const DECL = /^\s*(participant|actor)\s+(.+?)\s+as\s+(.+?)\s*$/;
const unquote = (s) => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

for (const f of files) {
  const text = readFileSync(join(root, f), 'utf-8');
  const openers = (text.match(/^```mermaid\s*$/gm) || []).length;
  const matches = [...text.matchAll(/```mermaid\n([\s\S]*?)```/g)];
  const blocks = matches.map((m) => m[1]);
  if (openers !== blocks.length) {
    failures.push(`${f}: fence imbalance — ${openers} openers, ${blocks.length} closed blocks`);
  }
  for (const [bi, b] of blocks.entries()) {
    total++;
    try {
      await mermaid.parse(b);
    } catch (e) {
      failures.push(`${f}: mermaid parse error — ${String(e.message || e).slice(0, 200)}`);
    }
    // Direction check, sequence diagrams only (participant/actor
    // declarations exist only there).
    const firstLine = b.split('\n').find((l) => l.trim() !== '');
    if (firstLine && firstLine.trim() === 'sequenceDiagram') {
      const startLine = text.slice(0, matches[bi].index).split('\n').length + 1;
      for (const [li, line] of b.split('\n').entries()) {
        const m = DECL.exec(line);
        if (!m) continue;
        const x = unquote(m[2]);
        const y = unquote(m[3]);
        if (ARABIC.test(x) && LATIN_ID.test(y)) {
          failures.push(`${f}:${startLine + li}: backwards ${m[1]} declaration — '${m[1]} ${x} as ${y}' (R5-1: Latin identifier first, Arabic display name after 'as')`);
        }
      }
    }
  }
}

console.log(`mermaid: ${total} blocks checked in ${files.length} files`);
if (failures.length > 0) {
  for (const x of failures) console.error('FAIL ' + x);
  process.exit(1);
}
console.log('mermaid: OK');
