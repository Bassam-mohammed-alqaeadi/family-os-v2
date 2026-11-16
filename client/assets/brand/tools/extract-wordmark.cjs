/* يستخرج حدود كلمة «عائلتي» و«Family OS» من خط IBM Plex Sans Arabic (OFL 1.1) بعد التشكيل الصحيح،
   ويحفظها مسارات جاهزة في ../logo/src/wordmark-paths.json حتى لا يعتمد الشعار على خط مثبَّت.
   يحتاج: npm i wawoff2 harfbuzzjs — ويُشغَّل مرة واحدة عند تغيير الخط أو الاسم:
   node extract-wordmark.cjs [مجلد الخطوط] */
const fs = require('fs'), path = require('path');
(async () => {
  const wawoff = require('wawoff2');
  const hbM = await import(require('url').pathToFileURL(require.resolve('harfbuzzjs')).href); const hb = hbM.default || hbM;
  const dir = process.argv[2] || path.join(__dirname, '../../../../design-work/platform-prototype/assets/fonts/');
  async function shape(file, text) {
    const ttf = Buffer.from(await wawoff.decompress(fs.readFileSync(path.join(dir, file))));
    const face = new hb.Face(new hb.Blob(new Uint8Array(ttf)), 0), font = new hb.Font(face);
    const buf = new hb.Buffer(); buf.addText(text); buf.guessSegmentProperties(); hb.shape(font, buf);
    let x = 0, d = '', minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const g of buf.getGlyphInfosAndPositions()) {
      const p = font.glyphToPath(g.codepoint), ox = x + (g.xOffset || 0), oy = g.yOffset || 0;
      /* إزاحة كل إحداثي وقلب المحور الرأسي (الخط للأعلى، SVG للأسفل) */
      d += p.replace(/([MLQCZ])([^MLQCZ]*)/g, (m, c, a) => {
        const n = a.trim().split(/[ ,]+/).filter(Boolean).map(Number);
        for (let i = 0; i < n.length; i += 2) { n[i] += ox; n[i + 1] = -(n[i + 1] + oy); minX = Math.min(minX, n[i]); maxX = Math.max(maxX, n[i]); minY = Math.min(minY, n[i + 1]); maxY = Math.max(maxY, n[i + 1]); }
        return c + n.join(' ');
      });
      x += g.xAdvance;
    }
    const r = v => Math.round(v * 10) / 10;
    d = d.replace(/-?\d+(\.\d+)?/g, (v, _, i) => v).replace(/([MLQC])([^MLQCZ]*)/g, (m, c, a) => { const n = a.trim().split(' ').map(Number); for (let i = 0; i < n.length; i += 2) { n[i] = r(n[i] - minX); n[i + 1] = r(n[i + 1] - minY); } return c + n.join(' '); });
    return { text, font: file, w: r(maxX - minX), h: r(maxY - minY), d };
  }
  const out = {
    license: 'IBM Plex Sans Arabic — SIL Open Font License 1.1',
    ar: await shape('ibm-plex-sans-arabic-arabic-700-normal.woff2', 'عائلتي'),
    en: await shape('ibm-plex-sans-arabic-latin-700-normal.woff2', 'Family OS'),
  };
  fs.writeFileSync(path.join(__dirname, '../logo/src/wordmark-paths.json'), JSON.stringify(out));
  console.log('ar', out.ar.w, out.ar.h, 'en', out.en.w, out.en.h);
})().catch(e => { console.error(e); process.exit(1); });
