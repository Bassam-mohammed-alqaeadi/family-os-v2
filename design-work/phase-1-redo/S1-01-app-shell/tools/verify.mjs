// فحص ساكن: يطابق مصدر التتبع والنموذج مع ملفات الحوكمة. يفشل (exit 1) عند أي مخالفة.
// الاستخدام (من أي مكان): node design-work/phase-1-redo/S1-01-app-shell/tools/verify.mjs
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import vm from 'node:vm';
const here = path.dirname(url.fileURLToPath(import.meta.url)), root = path.join(here, '..'), repo = path.join(root, '../../..');
const G = path.join(repo, 'docs/family-os/governance');
const rd = f => fs.readFileSync(f, 'utf8');
const load = f => { const w = {}; vm.runInNewContext(rd(path.join(root, 'assets/js', f)), { window: w }); return w; };
const TR = load('trace.js').FOS_TRACE, GOV = load('gov-data.js').FOS_GOV, L = load('i18n.js').FOS_I18N, IC = load('icons.js').FOS_ICONS;
const spec = rd(path.join(G, 'phases/phase-1/S1-01-app-shell-and-platform/SPEC.md'));
const approved = spec.slice(0, spec.indexOf('\n## 9.')) ;                      // §1–§8 فقط
const ds = fs.readdirSync(path.join(G, 'design-system')).map(f => rd(path.join(G, 'design-system', f))).join('\n');
const log = rd(path.join(G, 'decisions/DECISIONS-LOG.md')), open = rd(path.join(G, 'OPEN-QUESTIONS.md'));
const app = rd(path.join(root, 'assets/js/app.js')), css = rd(path.join(root, 'assets/css/shell.css'));
const errs = []; const ok = (c, m) => { if (!c) errs.push(m); };
const out = [];

// 1) تغطية REQ و ACC
const reqs = Object.keys(GOV.REQ), accs = Object.keys(GOV.ACC);
const inSurf = (k, id) => TR.surfaces.some(s => s[k].includes(id));
for (const r of reqs) ok(inSurf('req', r) || TR.noUi.some(n => n.req === r), `REQ بلا مصير: ${r}`);
for (const a of accs) ok(inSurf('acc', a) || TR.accNoUi.some(n => n.acc === a) || TR.noUi.some(n => n.acc.includes(a)), `ACC بلا مصير: ${a}`);
out.push(`REQ ${reqs.length}/23 مغطاة (${reqs.filter(r => inSurf('req', r)).length} بواجهة، ${TR.noUi.length} بلا واجهة) · ACC ${accs.length}/22`);

// 2) كل معرّف مذكور موجود في مصدره
const row = id => new RegExp(`^\\| *\\*{0,2}${id}\\*{0,2} *\\|`, 'm');
let n = 0;
for (const s of TR.surfaces) {
  for (const r of s.req) { n++; ok(GOV.REQ[r], `${s.id}: ${r} غير موجود في §3`); }
  for (const a of s.acc) { n++; ok(GOV.ACC[a], `${s.id}: ${a} غير موجود في §8`); }
  for (const d of s.ds) { n++; ok(new RegExp(`\\b${d}:`).test(ds), `${s.id}: ${d} غير موجود في نظام التصميم`); }
  for (const q of s.dec) { n++; ok(row(q).test(log) || row(q).test(open), `${s.id}: ${q} غير موجود في سجل القرارات`); }
  if (s.anchor) { n++; ok(approved.includes(s.anchor), `${s.id}: ${s.anchor} غير مذكور في §1–§8 المعتمدة`); }
  ok(s.items.every(i => 'ADPU'.includes(i[0]) && i[1]), `${s.id}: بند بلا وسم`);
  ok(s.items.filter(i => i[0] === 'A').every(i => i[2] && i[2] !== '—'), `${s.id}: بند «معتمد» بلا مصدر`);
}
ok(!ds.includes('DS-ST-12:'), 'DS-ST-12 يجب ألا يوجد (Q-356)');
ok(!TR.surfaces.some(s => s.ds.includes('DS-ST-12')), 'لا يُستشهد بـ DS-ST-12');
out.push(`${n} مرجعاً (REQ/ACC/DS/قرار/معرّف شاشة) موجودة في مصادرها`);

// 3) الأيقونات المستعملة موجودة في الحزمة المولَّدة
const used = new Set([...app.matchAll(/\bic\('([a-z0-9_-]+)'/g)].map(m => m[1]));
[...app.matchAll(/icon: '([a-z0-9_]+)'/g)].forEach(m => used.add(m[1]));
const dest = app.match(/const DEST = \{([^}]+)\}/)[1]; [...dest.matchAll(/'([a-z_]+)'/g)].forEach(m => { used.add(m[1]); used.add(m[1] + '-fill'); });
for (const m of app.matchAll(/\bic\(([^()]*(?:\(\))?[^()]*\?[^()]*)\)/g)) for (const q of m[1].matchAll(/(===\s*)?'([a-z0-9_]+)'/g)) if (!q[1]) used.add(q[2]);
for (const m of app.matchAll(/\btoast\([^;]*?, '([a-z0-9_]+)'\)/g)) used.add(m[1]);                       // أيقونة الرسالة القصيرة
for (const m of (app.match(/const ops = \[(.*?)\];/) || ['', ''])[1].matchAll(/\['[a-z]+', '([a-z0-9_]+)'\]/g)) used.add(m[1]);   // أزواج [عملية، أيقونة] في صفحة «للوالدين»
used.add('info');                                                                                         // الأيقونة الافتراضية للرسالة القصيرة
if (process.argv.includes('--list-icons')) { console.log(JSON.stringify([...used].sort())); process.exit(0); }
for (const i of used) ok(IC[i], `أيقونة مفقودة: ${i}`);
out.push(`${used.size} أيقونة مستعملة، كلها من Material Symbols Rounded`);

// 4) الترجمة: مفاتيح متطابقة في اللغتين، وكل مفتاح مستعمل معرَّف
const ka = Object.keys(L.ar), ke = Object.keys(L.en);
ok(ka.length === ke.length && ka.every(k => k in L.en), 'مفاتيح ar و en غير متطابقة: ' + ka.filter(k => !(k in L.en)).concat(ke.filter(k => !(k in L.ar))).join(' '));
ok(Object.keys(L.plural.ar).join() === Object.keys(L.plural.en).join(), 'صيغ الجمع غير متطابقة');
const tk = new Set([...app.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)].map(m => m[1]));
for (const k of tk) ok(k.endsWith('.') || k in L.ar, `مفتاح ترجمة غير معرَّف: ${k}`);
const dyn = [...app.matchAll(/\bt\('([a-zA-Z0-9_.]+\.)' \+/g)].map(m => m[1]);
for (const p of dyn) ok(ka.some(k => k.startsWith(p)), `بادئة ترجمة بلا مفاتيح: ${p}`);
const pk = new Set([...app.matchAll(/\bpl\('([a-zA-Z]+)'/g)].map(m => m[1]));
for (const k of pk) ok(L.plural.ar[k], `صيغة جمع غير معرَّفة: ${k}`);
out.push(`${ka.length} مفتاح ترجمة × لغتان، ${tk.size} مستعملة مباشرة، ${Object.keys(L.plural.ar).length} صيغ جمع`);

// 5) ألوان :root كلها من color-tokens.md
const rootBlock = css.slice(css.indexOf(':root{'), css.indexOf('}', css.indexOf(':root{')));
const tokens = rd(path.join(G, 'design-system/color-tokens.md')).toUpperCase();
const hexes = [...rootBlock.matchAll(/#[0-9A-Fa-f]{6}/g)].map(m => m[0].toUpperCase());
for (const h of hexes) ok(tokens.includes(h), `لون ليس في color-tokens.md: ${h}`);
const devBlock = css.slice(css.indexOf('/* ───────── الجهاز'), css.indexOf('@media (max-width:1180px)'));
const raw = [...devBlock.matchAll(/#[0-9A-Fa-f]{3,6}\b/g)].map(m => m[0]).filter(h => !['#fff', '#FFF'].includes(h));
ok(raw.length === 0, 'ألوان خام داخل أنماط الجهاز (DS-CL-02): ' + raw.join(' '));
out.push(`${hexes.length} لوناً أولياً، كلها من color-tokens.md`);

// 6) قوالب المنح ومفاتيح الغلاف حرفية
ok(GOV.TEMPLATES.partner.length === 43 && GOV.TEMPLATES.guardian.length === 24 && GOV.TEMPLATES.observer.length === 10, 'أعداد مفاتيح القوالب');
ok(GOV.SHELL_KEYS.length === 6, 'مفاتيح S1-01 الستة');
out.push('قوالب المنح 43/24/10 ومفاتيح الغلاف 6 — حرفية من المواصفات');

console.log(out.map(x => '✔ ' + x).join('\n'));
if (errs.length) { console.error('\n✘ ' + errs.join('\n✘ ')); process.exit(1); }
console.log('\nverify: OK');
