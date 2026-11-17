/* يبني كل ملفات شعار «عائلتي» وأيقونة التطبيق من تعريف واحد (Q-398 · brand-and-logo.md §3–§4).
   التشغيل من أي مكان:  node client/assets/brand/tools/build-brand.mjs
   بلا اعتماديات. حدود الاسم مأخوذة من src/wordmark-paths.json (يولّده extract-wordmark.cjs). */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '../logo'), PROTO = path.join(here, '../../../../docs/family-os/governance/phases/phase-1/prototype/assets/brand');
const WM = JSON.parse(fs.readFileSync(path.join(OUT, 'src/wordmark-paths.json'), 'utf8'));

/* الألوان من color-tokens.md فقط */
const C = { navy: '#1F3A6B', navy700: '#142749', green: '#1F6B3B', green300: '#73AB82', orange: '#CF5B2C', orange400: '#E47951', gold: '#C8A24A', cream: '#FCFAED', white: '#FFFFFF' };
const PAL = {
  color: { roof: C.navy, a: C.orange, b: C.green, c: C.gold, text: C.navy },          /* على الكريمي أو الأبيض */
  dark: { roof: C.cream, a: C.orange400, b: C.green300, c: C.gold, text: C.cream },    /* على الكحلي والوضع الداكن */
  navy: { roof: C.navy, a: C.navy, b: C.navy, c: C.navy, text: C.navy },               /* أحادي كحلي */
  white: { roof: C.white, a: C.white, b: C.white, c: C.white, text: C.white },         /* أحادي أبيض */
};

/* الرمز: سقف واحد وتحته ثلاثة أفراد. صندوقه 364×337، والنقطة قطرها 74 وهي وحدة منطقة الأمان. */
const MW = 364, MH = 337, DOT = 74;
const mark = p => `<path d="M26 214V164L182 26 338 164v50" fill="none" stroke="${p.roof}" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/><circle cx="182" cy="186" r="37" fill="${p.a}"/><circle cx="108" cy="300" r="37" fill="${p.b}"/><circle cx="256" cy="300" r="37" fill="${p.c}"/>`;
const g = (x, y, s, inner) => `<g transform="translate(${r(x)} ${r(y)}) scale(${s})">${inner}</g>`;
const r = v => Math.round(v * 100) / 100;
const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const files = {};
const put = (name, s) => { files[name] = s; };

/* 2) الرمز وحده */
const symbol = p => svg(MW + 2 * DOT, MH + 2 * DOT, g(DOT, DOT, 1, mark(p)), 'عائلتي');
/* 3) الاسم وحده */
const word = (lang, p) => { const w = WM[lang], s = lang === 'ar' ? 0.2 : 0.15, pad = DOT * 0.6; return svg(w.w * s + 2 * pad, w.h * s + 2 * pad, g(pad, pad, s, `<path d="${w.d}" fill="${p.text}"/>`), lang === 'ar' ? 'عائلتي' : 'Family OS'); };
/* 1) الأفقي: في العربية الرمز يمين الاسم، وفي الإنجليزية يساره؛ الرمز نفسه لا يُعكس */
const horiz = (lang, p) => {
  const w = WM[lang], s = lang === 'ar' ? 0.232 : 0.168, ww = w.w * s, wh = w.h * s, gap = DOT * 1.15;
  const W = DOT + MW + gap + ww + DOT, H = MH + 2 * DOT;
  /* الاسم يُوسَّط بصرياً على جسم الحروف لا على الصندوق: العربية لها نازل، والإنجليزية نازل y */
  const wy = lang === 'ar' ? DOT + MH * 0.5 - wh * 0.47 : DOT + MH * 0.56 - wh * 0.5;
  const mx = lang === 'ar' ? DOT + ww + gap : DOT, wx = lang === 'ar' ? DOT : DOT + MW + gap;
  return svg(W, H, g(mx, DOT, 1, mark(p)) + g(wx, wy, s, `<path d="${w.d}" fill="${p.text}"/>`), lang === 'ar' ? 'عائلتي' : 'Family OS');
};

put('logo-symbol.svg', symbol(PAL.color));
put('logo-symbol-dark.svg', symbol(PAL.dark));
put('logo-symbol-mono-navy.svg', symbol(PAL.navy));
put('logo-symbol-mono-white.svg', symbol(PAL.white));
for (const lang of ['ar', 'en']) {
  put(`logo-horizontal-${lang}.svg`, horiz(lang, PAL.color));
  put(`logo-horizontal-${lang}-dark.svg`, horiz(lang, PAL.dark));
  put(`logo-horizontal-${lang}-mono-navy.svg`, horiz(lang, PAL.navy));
  put(`logo-horizontal-${lang}-mono-white.svg`, horiz(lang, PAL.white));
  put(`logo-wordmark-${lang}.svg`, word(lang, PAL.color));
  put(`logo-wordmark-${lang}-dark.svg`, word(lang, PAL.dark));
}

/* أيقونة التطبيق. الرمز داخل دائرة الأمان (قطر 66 من 108): نصف قطر صندوقه = 0.13 × 248 ≈ 32.2 < 33 */
const AS = 0.13, ax = (108 - MW * AS) / 2, ay = (108 - MH * AS) / 2 - 0.6;
const layer = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">${body}</svg>\n`;
put('icon/android-adaptive-foreground.svg', layer(g(ax, ay, AS, mark(PAL.dark))));
put('icon/android-adaptive-background.svg', layer(`<rect width="108" height="108" fill="${C.navy}"/>`));
put('icon/android-adaptive-foreground-on-cream.svg', layer(g(ax, ay, AS, mark(PAL.color))));
put('icon/android-adaptive-background-cream.svg', layer(`<rect width="108" height="108" fill="${C.cream}"/>`));
put('icon/android-themed-monochrome.svg', layer(g(ax, ay, AS, mark({ roof: '#000', a: '#000', b: '#000', c: '#000' }))));
/* iOS: مربع كامل بلا شفافية؛ النظام يقص الزوايا */
const IS = 1.62, ix = (1024 - MW * IS) / 2, iy = (1024 - MH * IS) / 2 - 6;
const ios = (bg, p) => svg(1024, 1024, `<rect width="1024" height="1024" fill="${bg}"/>` + g(ix, iy, IS, mark(p)), 'عائلتي');
put('icon/ios-app-icon.svg', ios(C.navy, PAL.dark));
put('icon/ios-app-icon-light.svg', ios(C.cream, PAL.color));
put('icon/ios-app-icon-tinted.svg', ios('#000000', PAL.white));
/* أيقونة الإشعار: 24×24 بيضاء على شفاف */
const NS = 20 / MW; put('icon/notification-small.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${g(2, (24 - MH * NS) / 2, r(NS * 10000) / 10000, mark(PAL.white))}</svg>\n`);
/* شاشة البدء: الرمز وحده على كريمي أو كحلي */
const splash = (bg, p) => svg(360, 640, `<rect width="360" height="640" fill="${bg}"/>` + g((360 - MW * 0.3) / 2, (640 - MH * 0.3) / 2, 0.3, mark(p)), 'عائلتي');
put('icon/splash-light.svg', splash(C.cream, PAL.color));
put('icon/splash-dark.svg', splash(C.navy, PAL.dark));

for (const [name, s] of Object.entries(files)) { const f = path.join(OUT, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); }
/* نسخة للتصميم الأساسي (المعاينة تخدم مجلده وحده) */
if (fs.existsSync(path.dirname(PROTO))) {
  fs.mkdirSync(PROTO, { recursive: true });
  for (const n of Object.keys(files)) fs.writeFileSync(path.join(PROTO, n.replace('icon/', 'icon-')), files[n]);
}
console.log(Object.keys(files).length + ' ملفاً في ' + path.relative(process.cwd(), OUT));
