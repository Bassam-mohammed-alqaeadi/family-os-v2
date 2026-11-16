// يولّد assets/js/icons.js من حزمة @material-symbols/svg-400 (Rounded، Apache-2.0) حسب tools/icon-list.json.
// الاستخدام: node tools/build-icons.mjs <node_modules>/@material-symbols/svg-400/rounded
// يفشل إن غاب أي اسم — لا أيقونة بديلة صامتة.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const src = process.argv[2]; if (!src) { console.error('pass the rounded/ folder'); process.exit(1); }
const here = path.dirname(url.fileURLToPath(import.meta.url)), root = path.join(here, '..');
const list = JSON.parse(fs.readFileSync(path.join(here, 'icon-list.json'), 'utf8'));
const grab = n => { const f = path.join(src, n + '.svg'); if (!fs.existsSync(f)) return null; const m = fs.readFileSync(f, 'utf8').match(/<path d="([^"]+)"/); return m && m[1]; };
const out = {}, missing = [];
for (const n of [...list.fill, ...list.line]) { const d = grab(n); if (!d) missing.push(n); else out[n] = d; }
for (const n of list.fill) { const d = grab(n + '-fill'); if (!d) missing.push(n + '-fill'); else out[n + '-fill'] = d; }
if (missing.length) { console.error('MISSING:', missing.join(' ')); process.exit(2); }
fs.writeFileSync(path.join(root, 'assets/js/icons.js'),
  '/* Material Symbols Rounded 400 (Apache-2.0) — مولَّد من tools/build-icons.mjs؛ لا يُعدَّل يدوياً. viewBox="0 -960 960 960" */\nwindow.FOS_ICONS=' + JSON.stringify(out) + ';\n');
console.log('icons', Object.keys(out).length);
