// يولّد assets/js/icons.js من Material Symbols Rounded (وزن 400، Apache-2.0) — المصدر المعتمد في iconography.md §2.
// الاستخدام:  node tools/build-icons.mjs <node_modules>/@material-symbols/svg-400/rounded
// يُحزَّم المستعمل فقط: يمسح ملفات JS/HTML في النموذج ويلتقط كل سلسلة نصية تطابق اسم أيقونة موجودة.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const src = process.argv[2]; if (!src) { console.error('pass the rounded/ folder'); process.exit(1); }
const here = path.dirname(url.fileURLToPath(import.meta.url)), root = path.join(here, '..');
const files = ['index.html', ...fs.readdirSync(path.join(root, 'assets/js')).filter(f => f.endsWith('.js') && !['icons.js', 'req-data.js'].includes(f)).map(f => 'assets/js/' + f)];
const text = files.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const cand = new Set([...text.matchAll(/['"`#>:,\s-](?:i-)?([a-z][a-z0-9_]{2,})(-fill)?(?=['"`<:,\s])/g)].map(m => m[1]));
const grab = f => { const m = fs.readFileSync(f, 'utf8').match(/<path d="([^"]+)"/); return m && m[1]; };
const out = {};
for (const n of [...cand].sort()) {
  const a = path.join(src, n + '.svg'); if (!fs.existsSync(a)) continue;
  out[n] = grab(a);
  const b = path.join(src, n + '-fill.svg'); if (fs.existsSync(b) && text.includes(n + '-fill') || ['home','groups','forum','tune','apps','school','person','sports_esports','stars'].includes(n)) out[n + '-fill'] = grab(b);
}
fs.writeFileSync(path.join(root, 'assets/js/icons.js'), '/* Material Symbols Rounded (Apache-2.0) — مولَّد من tools/build-icons.mjs؛ لا يُعدَّل يدوياً. viewBox="0 -960 960 960" */\nwindow.FOS_ICONS=' + JSON.stringify(out) + ';\n');
console.log('icons', Object.keys(out).length, 'bytes', fs.statSync(path.join(root, 'assets/js/icons.js')).size);
