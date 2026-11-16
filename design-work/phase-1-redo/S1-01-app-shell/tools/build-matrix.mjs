// يولّد 02-TRACE-MATRIX.md من assets/js/trace.js و gov-data.js — لا يُعدَّل الناتج يدوياً.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import vm from 'node:vm';
const here = path.dirname(url.fileURLToPath(import.meta.url)), root = path.join(here, '..');
const load = f => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js', f), 'utf8'), { window: w }); return w; };
const TR = load('trace.js').FOS_TRACE, GOV = load('gov-data.js').FOS_GOV;
const TAG = { A: 'معتمد', D: 'مشتق', P: 'مقترح', U: 'UNKNOWN' };
const cut = s => (s.length > 150 ? s.slice(0, 150) + '…' : s).replace(/\|/g, '/');
const where = (k, id) => TR.surfaces.filter(s => s[k].includes(id)).map(s => s.id).join(' · ');
const count = g => TR.surfaces.reduce((n, s) => n + s.items.filter(i => i[0] === g).length, 0);
let o = `# S1-01 — مصفوفة التتبع (مولَّدة)

> **الحالة:** مقترح تصميم — غير معتمد. مولَّد من \`assets/js/trace.js\` بالأداة \`tools/build-matrix.mjs\`؛ لا يُعدَّل يدوياً.
> **الوسوم:** معتمد = نص معتمد بمصدره · مشتق = استدلال من نص معتمد · مقترح = اقتراح تصميمي ينتظر حكم المالك · UNKNOWN = لا مصدر محكوم.

**الأعداد:** ${TR.surfaces.length} سطحاً · ${count('A')} بنداً معتمداً · ${count('D')} مشتقاً · ${count('P')} مقترحاً · ${count('U')} UNKNOWN · ${TR.findings.length} ملاحظات على الحوكمة.

## 1. المتطلبات ← الأسطح

| REQ | النص (حرفياً من SPEC §3، مقصوصاً) | السطح |
|---|---|---|
${Object.entries(GOV.REQ).map(([id, x]) => { const n = TR.noUi.find(v => v.req === id); return `| ${id} | ${cut(x)} | ${where('req', id) || ''}${n ? 'بلا واجهة — ' + n.why : ''} |`; }).join('\n')}

## 2. معايير القبول ← الأسطح

| ACC | النص (حرفياً من SPEC §8، مقصوصاً) | السطح |
|---|---|---|
${Object.entries(GOV.ACC).map(([id, x]) => { const n = TR.accNoUi.find(v => v.acc === id) || TR.noUi.find(v => v.acc.includes(id)); return `| ${id} | ${cut(x)} | ${where('acc', id) || ''}${n ? (where('acc', id) ? ' + ' : '') + 'بلا واجهة — ' + n.why : ''} |`; }).join('\n')}

## 3. الأسطح بنداً بنداً
`;
for (const s of TR.surfaces) {
  o += `\n### ${s.id} — ${s.title}\n\n- **المتطلبات:** ${s.req.join(' · ')}\n- **القبول:** ${s.acc.join(' · ')}\n- **نظام التصميم:** ${s.ds.join(' · ')}\n- **القرارات:** ${s.dec.join(' · ')}\n${s.anchor ? `- **معرّف مذكور في §1–§8:** ${s.anchor}\n` : ''}\n| الوسم | البند | المصدر |\n|---|---|---|\n${s.items.map(i => `| ${TAG[i[0]]} | ${i[1].replace(/\|/g, '/')} | ${i[2] || '—'} |`).join('\n')}\n`;
}
o += `\n## 4. ملاحظات على الحوكمة (تُرفع ولا تُصلَّح هنا)\n\n| المعرّف | النوع | الملاحظة | الموضع | ما اتُّبع |\n|---|---|---|---|---|\n${TR.findings.map(f => `| ${f.id} | ${f.kind} | ${f.text} | ${f.where} | ${f.used} |`).join('\n')}\n`;
fs.writeFileSync(path.join(root, '02-TRACE-MATRIX.md'), o);
console.log('matrix:', TR.surfaces.length, 'surfaces', 'A', count('A'), 'D', count('D'), 'P', count('P'), 'U', count('U'));
