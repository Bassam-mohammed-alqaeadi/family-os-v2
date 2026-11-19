// يقيس العرض المرسوم لكل مخطط في `S1-*/DIAGRAMS.md` (المرحلة 1).
//
// لماذا: المخطط الأعرض من الصفحة يُضغط عند العرض فيصغر خطه. المخطط الذي عرضه
// الطبيعي 1280 بكسل يُعرض بخط 11 تقريباً في صفحة عرضها 880؛ وما زاد لا يُقرأ.
// القياس هو قيمة العرض في `viewBox` بعد الرسم، بخط المشروع العربي نفسه.
//
// يحتاج متصفح Chrome أو Chromium (لا يدخل في فحوص CI):
//   cd scripts && npm install --no-audit --no-fund
//   npm install --no-save puppeteer            # ينزّل Chrome معه
//   node measure-diagrams.mjs
// أو بمتصفح موجود:
//   npm install --no-save puppeteer-core
//   CHROME_PATH=/path/to/chrome node measure-diagrams.mjs
//
// خيارات:
//   --limit=1280     الحد الأقصى للعرض (الافتراضي 1280)
//   --only=S1-06     نظام واحد
//   --all            اطبع كل مخطط لا المخالف فقط
//   --json=out.json  اكتب القياسات في ملف
// ERD مستثنى من الحد (يُطبع عرضه ولا يُحسب مخالفة).
// يخرج بغير الصفر إن تجاوز أي مخطط غير ERD الحد.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);
const phase = join(root, 'docs', 'family-os', 'governance', 'phases', 'phase-1');
const opt = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? true];
}));
const LIMIT = Number(opt.limit || 1280);

const require = createRequire(import.meta.url);
let puppeteer = null;
for (const name of ['puppeteer', 'puppeteer-core']) {
  try { puppeteer = require(name); break; } catch { /* جرّب التالي */ }
}
if (!puppeteer) {
  console.error('measure-diagrams: يلزم puppeteer أو puppeteer-core (انظر رأس الملف).');
  process.exit(2);
}
puppeteer = puppeteer.default || puppeteer;
const mermaidJs = join(here, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
if (!existsSync(mermaidJs)) {
  console.error('measure-diagrams: شغّل npm install في scripts/ أولاً.');
  process.exit(2);
}

const blocks = [];
for (const d of readdirSync(phase).filter((x) => /^S1-\d+/.test(x) && x.includes(opt.only || '')).sort()) {
  const lines = readFileSync(join(phase, d, 'DIAGRAMS.md'), 'utf8').split('\n');
  let heading = '';
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#')) heading = lines[i].replace(/^#+\s*/, '');
    if (lines[i].trim().startsWith('```mermaid')) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith('```')) j++;
      const code = lines.slice(i + 1, j).join('\n');
      const kind = code.split('\n').map((x) => x.trim()).find((x) => x && !x.startsWith('%%')) || '';
      blocks.push({ sys: d.slice(0, 5), line: i + 1, heading, kind: kind.split(/\s+/).slice(0, 2).join(' '), code });
      i = j;
    }
  }
}

const font = (w) => pathToFileURL(join(phase, 'prototype', 'assets', 'fonts', `ibm-plex-sans-arabic-arabic-${w}-normal.woff2`)).href;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:AR;src:url(${font(400)})}
@font-face{font-family:AR;font-weight:700;src:url(${font(700)})}
body{margin:0;font-family:AR,sans-serif}</style>
<script src="${pathToFileURL(mermaidJs).href}"></script></head><body><div id="o"></div></body></html>`;
const pagePath = join(tmpdir(), 'measure-diagrams.html');
writeFileSync(pagePath, html);

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  headless: process.env.CHROME_HEADLESS || true,
  args: ['--no-sandbox', '--disable-gpu', '--allow-file-access-from-files', ...(process.env.CHROME_ARGS || '').split(' ').filter(Boolean)],
});
const results = [];
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(pagePath).href);
  await page.evaluate(async () => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', fontFamily: 'AR, sans-serif' });
    await document.fonts.load('16px AR', 'مرحبا');
  });
  let n = 0;
  for (const b of blocks) {
    const r = await page.evaluate(async (code, id) => {
      try {
        const { svg } = await mermaid.render('m' + id, code);
        const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1].split(/\s+/).map(Number);
        return { w: Math.round(vb[2]), h: Math.round(vb[3]) };
      } catch (e) { return { err: String(e).slice(0, 120) }; }
    }, b.code, n++);
    results.push({ sys: b.sys, line: b.line, heading: b.heading, kind: b.kind, ...r });
  }
} finally {
  await browser.close();
}

const isErd = (r) => r.kind.startsWith('erDiagram');
const over = results.filter((r) => !r.err && !isErd(r) && r.w > LIMIT);
const errs = results.filter((r) => r.err);
for (const r of results) {
  const bad = r.err || (!isErd(r) && r.w > LIMIT);
  if (!opt.all && !bad && !isErd(r)) continue;
  const mark = r.err ? 'ERR ' : isErd(r) ? 'ERD ' : bad ? 'FAIL' : 'ok  ';
  console.log(`${mark} ${r.sys} سطر ${String(r.line).padStart(4)}  عرض ${String(r.w ?? '-').padStart(4)}  ${r.kind.padEnd(16)} ${r.heading.slice(0, 60)}`);
}
const bySys = {};
for (const r of results) {
  const s = (bySys[r.sys] ||= { n: 0, over: 0 });
  s.n++;
  if (over.includes(r)) s.over++;
}
console.log(Object.entries(bySys).map(([k, v]) => `${k}: ${v.over}/${v.n}`).join('  '));
if (opt.json) writeFileSync(opt.json, JSON.stringify(results, null, 1));
console.log(over.length || errs.length
  ? `measure-diagrams: ${over.length} مخططاً فوق ${LIMIT}، ${errs.length} لم يُرسم (من ${results.length})`
  : `measure-diagrams: OK (${results.length} مخططاً، الحد ${LIMIT}، ERD مستثنى)`);
process.exit(over.length || errs.length ? 1 : 0);
