// يولّد assets/js/gov-data.js حرفياً من ملفات الحوكمة — لا يُعدَّل الناتج يدوياً.
//  - نصوص REQ-001…023 و ACC-001…022 من S1-01 SPEC §3 و§8.
//  - مجموعات مفاتيح القوالب الثلاثة من S1-03 SPEC §5-3-أ، ومفاتيح S1-01 الستة من S1-01 SPEC §6.
// الاستخدام (من جذر المستودع): node design-work/phase-1-redo/S1-01-app-shell/tools/build-data.mjs
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const here = path.dirname(url.fileURLToPath(import.meta.url)), root = path.join(here, '..'), repo = path.join(root, '../../..');
const P1 = path.join(repo, 'docs/family-os/governance/phases/phase-1');
const spec = fs.readFileSync(path.join(P1, 'S1-01-app-shell-and-platform/SPEC.md'), 'utf8');
const s103 = fs.readFileSync(path.join(P1, 'S1-03-family-roles-and-permissions/SPEC.md'), 'utf8').split('\n');
const pick = (re) => Object.fromEntries([...spec.matchAll(re)].map(m => [m[1], m[2].trim()]));
const REQ = pick(/^- \*\*(REQ-\d{3}):\*\* (.+)$/gm), ACC = pick(/^- \*\*(ACC-\d{3}):\*\* (.+)$/gm);
if (Object.keys(REQ).length !== 23 || Object.keys(ACC).length !== 22) { console.error('unexpected counts', Object.keys(REQ).length, Object.keys(ACC).length); process.exit(2); }
const TEMPLATES = {};
s103.forEach((l, i) => { const h = l.match(/^#### قالب .*\(`(partner|guardian|observer)`\) — (\d+) /); if (!h) return;
  const keys = []; for (let j = i + 1; j < s103.length && !s103[j].startsWith('#'); j++) { const m = s103[j].match(/^\|\s*`([a-z_.]+)`/); if (m) keys.push(m[1]); }
  if (keys.length !== +h[2]) { console.error('template count mismatch', h[1], keys.length, h[2]); process.exit(2); }
  TEMPLATES[h[1]] = keys; });
const sec6 = spec.slice(spec.indexOf('## 6. القواعد والصلاحيات'), spec.indexOf('## 7. الحالات الحدية'));
const SHELL_KEYS = [...sec6.matchAll(/^\| `(shell\.[a-z_.]+)` \| ([^|]+) \| ([^|]*) \|$/gm)].map(m => ({ key: m[1], holder: m[2].trim(), note: m[3].trim() }));
if (SHELL_KEYS.length !== 6) { console.error('shell keys', SHELL_KEYS.length); process.exit(2); }
fs.writeFileSync(path.join(root, 'assets/js/gov-data.js'),
  '/* مولَّد من tools/build-data.mjs حرفياً من S1-01 SPEC §3/§6/§8 و S1-03 SPEC §5-3-أ — لا يُعدَّل يدوياً. */\nwindow.FOS_GOV=' + JSON.stringify({ REQ, ACC, TEMPLATES, SHELL_KEYS }) + ';\n');
console.log('REQ', Object.keys(REQ).length, 'ACC', Object.keys(ACC).length, 'templates', Object.entries(TEMPLATES).map(([k, v]) => k + ':' + v.length).join(' '), 'shell keys', SHELL_KEYS.length);
