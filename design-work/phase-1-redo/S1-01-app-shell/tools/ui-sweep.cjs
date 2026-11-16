// فحص الواجهة في متصفح بلا رأس: يمر على كل سطح × حجم × لغة × سمة، ثم ينفّذ سيناريوهات المواصفة.
// الاعتماديات (خارج المستودع): puppeteer-core + @sparticuz/chromium.
// الاستخدام: NODE_PATH=<node_modules> LD_LIBRARY_PATH=<al2023 libs> node tools/ui-sweep.cjs [مجلد اللقطات]
const path = require('path'), fs = require('fs');
const puppeteer = require('puppeteer-core'); let chromium = require('@sparticuz/chromium'); chromium = chromium.default || chromium;
const root = path.join(__dirname, '..'), shots = process.argv[2];
let last = ''; const fails = []; const ok = (c, m) => { last = m; if (!c) fails.push(m); return c; };
(async () => {
  // مسار SwiftShader في @sparticuz/chromium يجمّد الصفحة ثوانيَ بعد كل تحميل (تتوقف المؤقتات)، فتفشل سيناريوهات التوقيت زوراً.
  // ثبت ذلك بصفحة ساكنة بلا أي تفاعل، ويزول مع ‎--disable-gpu. للتحقق: DEBUG_HB=1 يطبع أي توقف للمؤقتات يفوق 400ms.
  const baseArgs = [...chromium.args.filter(a => !/in-process-gpu|use-gl|use-angle|swiftshader|ignore-gpu/.test(a)), '--disable-gpu'];
  const browser = await puppeteer.launch({ args: [...baseArgs, '--allow-file-access-from-files'], executablePath: await chromium.executablePath(), headless: 'shell' });
  try {
    const page = await browser.newPage(); await page.setViewport({ width: 1760, height: 1000 });
    const errors = []; page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', e => errors.push(String(e)));
    if (process.env.DEBUG_HB) { page.on('console', m => { if (m.text().startsWith('HB')) console.log(m.text(), '| بعد:', last); }); await page.evaluateOnNewDocument(() => { new PerformanceObserver(li => li.getEntries().forEach(e => console.log('HB long', e.startTime | 0, e.duration | 0, e.name, JSON.stringify((e.attribution || []).map(a => a.containerType + ':' + a.name))))).observe({ entryTypes: ['longtask'] }); const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(() => { const t = performance.now(); try { return f(...a); } finally { const d = performance.now() - t; if (d > 200) console.log('HB timer-callback', d | 0, 'ms', String(f).slice(0, 160)); } }, ms); let l = performance.now(); setInterval(() => { const n = performance.now(); if (n - l > 400) console.log('HB gap', l | 0, n | 0); l = n; }, 25); }); }
    await page.goto('file://' + path.join(root, 'index.html')); await page.evaluate(() => document.fonts.ready);
    const fresh = async () => { await page.reload(); await page.evaluate(() => document.fonts.ready); };
    const A = (fn, ...a) => page.evaluate(fn, ...a);
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // فحوص هندسية على حالة الجهاز الحالية
    const geom = () => A(() => {
      const dev = document.getElementById('dev'), out = [], min = { owner: 48, delegate: 48, teen: 48, child: 56, minimal: 72 }[dev.dataset.profile];
      const sc = dev.getBoundingClientRect().width / dev.offsetWidth, dr = dev.getBoundingClientRect();
      for (const el of dev.querySelectorAll('.body,.main,.nav,.gate,.center,.dialog')) if (el.scrollWidth > el.clientWidth + 1) out.push('overflow-x ' + el.className);
      for (const el of dev.querySelectorAll('*')) { const r = el.getBoundingClientRect(); if (r.width && (r.left < dr.left - 1 || r.right > dr.right + 1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.ring')) { out.push('outside device: ' + (el.className.baseVal || el.className || el.tagName)); break; } }
      const topMost = el => { const r = el.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return h && (h === el || el.contains(h)); };
      const sos = document.getElementById('sos'); if (!sos) out.push('no SOS button'); else if (!topMost(sos)) out.push('SOS covered by another layer');
      // أهداف اللمس: العناصر التفاعلية الظاهرة في أعلى طبقة فقط
      for (const b of dev.querySelectorAll('button:not(.gh)')) { if (!b.offsetWidth || !topMost(b)) continue;
        const lim = b.closest('.nav,.tiles,.homebar') ? min : b.closest('.sos-card,.chips,.strip') ? 32 : 48;
        if (b.offsetHeight < lim - 0.5 || b.offsetWidth < Math.min(lim, 48) - 0.5) out.push(`touch target ${b.offsetWidth}x${b.offsetHeight} < ${lim}: ${b.dataset.k}`); }
      // لا نص أصغر من 12px (DS-TY-02)
      for (const el of dev.querySelectorAll('*')) if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(el).fontSize) < 12) { out.push('text < 12px: ' + el.className); break; }
      return out;
    });
    // 1) المسح
    const ids = await A(() => window.FOS_TRACE.surfaces.map(s => s.id)); let states = 0; if (process.env.SCENARIOS_ONLY) ids.length = 0;
    for (const theme of ['light', 'dark']) for (const lang of ['ar', 'en']) for (const size of ['compact', 'medium', 'expanded']) {
      for (const id of ids) {
        await fresh();
        await A((id, size, lang, theme) => { const { S, SHOW, render } = window.FOS_APP; S.size = size; S.lang = lang; S.theme = theme; SHOW[id](); render(); }, id, size, lang, theme);
        const vis = await A(() => window.FOS_APP.visible());
        ok(vis.includes(id), `${id} غير ظاهر بعد «اعرض» (${size}/${lang})`);
        for (const g of await geom()) fails.push(`${id} ${size}/${lang}/${theme}: ${g}`);
        states++;
        if (shots && theme === 'light' && ((lang === 'ar') || (lang === 'en' && size === 'compact' && ['SH-01', 'SH-10'].includes(id)))) { const el = await page.$('#dev'); await el.screenshot({ path: path.join(shots, `${id}-${size}-${lang}.png`) }); }
        if (shots && theme === 'dark' && lang === 'ar' && size === 'compact' && ['SH-01', 'SH-10', 'SH-14'].includes(id)) { const el = await page.$('#dev'); await el.screenshot({ path: path.join(shots, `${id}-${size}-dark.png`) }); }
      }
    }
    console.log('sweep states:', states);
    // 2) السيناريوهات
    await fresh();
    const nav = async (setup) => A(s => { const { S, render, navItems } = window.FOS_APP; new Function('S', 'GOV', s)(S, window.FOS_GOV); render(); return navItems().join(','); }, setup);
    const eq = (got, want, m) => ok(got === want, `${m}: got [${got}] want [${want}]`);
    eq(await nav("S.profile='owner'"), 'home,family,chat,control,more', 'تنقل المالك');
    eq(await nav("S.profile='delegate';S.grants=new Set(GOV.TEMPLATES.partner)"), 'home,chat,safety,control,more', 'مفوَّض — شريك');
    eq(await nav("S.grants=new Set(GOV.TEMPLATES.guardian)"), 'home,chat,safety,control,more', 'مفوَّض — وصي محدود');
    eq(await nav("S.grants=new Set(GOV.TEMPLATES.observer)"), 'home,chat,safety,more', 'مفوَّض — مراقب');
    eq(await nav("S.grants=new Set()"), 'chat,more', 'مفوَّض — بلا منح');
    ok(!(await A(() => !!document.querySelector('[data-k="row-platform"]') || window.FOS_APP.S.grants.has('shell.config.view'))), 'بلا منح: لا «المنصة»');
    eq(await nav("S.profile='teen';S.edu=false"), 'home,chat,me', 'مراهق — المرحلة 1');
    eq(await nav("S.edu=true"), 'home,chat,learn,me', 'مراهق — بعد تسجيل التعليم');
    eq(await nav("S.profile='child';S.edu=false"), 'home,chat,rewards', 'طفل — المرحلة 1');
    eq(await nav("S.profile='minimal'"), '', 'طفل دون 7 — بلا شريط');
    ok(await A(() => !document.querySelector('#dev .nav')), 'minimal: لا عنصر nav');
    // وضع الطفل: لا صف إداري ظاهر قبل البوابة (ACC-002)
    await A(() => { const { S, render } = window.FOS_APP; S.profile = 'teen'; S.tab.teen = 'me'; render(); });
    ok(await A(() => !document.querySelector('[data-k="row-platform"],[data-k="row-health"],[data-k="row-pin"]')), 'ACC-002: لا صف إداري في «أنا» قبل البوابة');
    // بوابة الوالدين
    const click = k => A(k => { const el = document.querySelector(`[data-k="${k}"]`); if (!el) throw new Error('no element ' + k); el.click(); }, k);
    const typePin = async p => { for (const d of p) await click('d' + d); await click('g-open'); };
    await click('row-ops'); await click('op-exit');
    ok(await A(() => document.querySelector('[data-k="g-open"]').disabled), 'زر «افتح» معطل قبل 6 أرقام');
    for (let i = 0; i < 4; i++) await typePin('135790');
    ok((await A(() => document.querySelector('.gmsg').textContent)).includes('بقيت محاولة واحدة'), 'بعد 4 أخطاء: بقيت محاولة واحدة');
    await typePin('135790');
    ok(await A(() => window.FOS_APP.S.gate.phase === 'locked'), '5 أخطاء ← قفل');
    ok(/^٠[٤٥]:[٠-٩]{2}$/.test(await A(() => document.getElementById('g-count').textContent)), 'عدّاد القفل 5 دقائق');
    await click('g-close'); await click('op-exit');
    ok(await A(() => window.FOS_APP.S.gate.phase === 'locked' && window.FOS_APP.S.audit[0].result === 'rejected_while_locked'), 'محاولة أثناء القفل تُرفض وتُسجَّل');
    if (shots) await (await page.$('#dev')).screenshot({ path: path.join(shots, 'gate-locked.png') });
    await click('b-skip');
    ok(await A(() => window.FOS_APP.S.gate.phase === 'pin'), 'بعد 5 دقائق تُفتح البوابة للإدخال');
    await typePin(await A(() => window.FOS_APP.DEMO_PIN));
    ok(await A(() => window.FOS_APP.S.gate.phase === 'proving'), 'PIN صحيح + عملية خادمية ← إثبات بتحدٍّ');
    await sleep(3000);
    ok(await A(() => window.FOS_APP.S.gate.phase === 'done'), 'اكتمل الإثبات');
    await click('g-back');
    await A(() => { window.FOS_APP.S.online = false; window.FOS_APP.render(); }); await click('op-unpair'); await typePin('246810');
    ok(await A(() => window.FOS_APP.S.gate.phase === 'needsOnline'), 'عملية خادمية دون اتصال لا تكتمل');
    await click('g-ok'); await click('op-admin'); await typePin('246810');
    ok(await A(() => !window.FOS_APP.S.gate && !!document.querySelector('[data-k="row-pin"]')), 'فتح إعداد إداري: PIN محلي يكفي دون اتصال');
    const acts = await A(() => window.FOS_APP.S.audit.map(a => a.action));
    for (const a of ['parent_gate.open', 'parent_gate.failed', 'parent_gate.locked']) ok(acts.includes(a), 'تدقيق: ' + a);
    // قواعد PIN
    const pp = p => A(p => window.FOS_APP.pinProblem(p), p);
    eq(await pp('12345'), 'pin.e.short', 'PIN قصير'); eq(await pp('123456'), 'pin.e.seq', '123456 مرفوض'); eq(await pp('111111'), 'pin.e.rep', 'مكرر مرفوض'); eq(await pp('199012'), 'pin.e.year', 'سنة ميلاد مرفوضة'); eq(String(await pp('246810')), 'null', 'PIN سليم مقبول');
    await click('row-pin');
    await A(() => { document.getElementById('pf-cur').value = '246810'; document.getElementById('pf-nw').value = '123456'; document.getElementById('pf-rep').value = '123456'; }); await click('pin-save');
    ok(await A(() => !!document.querySelector('#pe-nw')), 'نموذج تغيير PIN يرفض 123456 برسالة');
    await A(() => { document.getElementById('pf-nw').value = '908172'; document.getElementById('pf-rep').value = '908172'; }); await click('pin-save');
    ok(await A(() => window.FOS_APP.S.pin === '908172' && window.FOS_APP.S.audit[0].action === 'parent_gate.pin_changed'), 'تغيير PIN ينجح ويُسجَّل');
    // دون اتصال + Outbox + تعارض
    await fresh();
    await A(() => { const cb = document.querySelector('[data-bkey="online"]'); cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); });
    await click('b-write'); await click('b-write');
    ok((await A(() => document.querySelector('.strip .chip').textContent)) === 'فعلان بانتظار الإرسال', 'شارة Outbox بصيغة المثنى');
    ok(await A(() => !document.querySelector('.layer.full')), 'دون اتصال: بلا شاشة خطأ');
    await A(() => { const c = document.querySelector('[data-bkey="conflict"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); const cb = document.querySelector('[data-bkey="online"]'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); });
    ok(await A(() => window.FOS_APP.S.outbox.length === 0 && window.FOS_APP.S.dialog === 'merge'), 'عودة الاتصال: تفريغ دفعة واحدة + إشعار الدمج');
    if (shots) await (await page.$('#dev')).screenshot({ path: path.join(shots, 'merge.png') });
    // التحديث
    await fresh(); await click('b-update-forced');
    ok(await A(() => !!document.querySelector('.layer.full') && !document.querySelector('[data-k="u-later"]')), 'إلزامي: بلا مسار تجاوز');
    ok((await geom()).every(g => !g.includes('SOS')), 'إلزامي: SOS يبقى فوق الشاشة');
    await click('b-update-below_min'); ok(await A(() => !!document.querySelector('[data-k="u-later"]')), 'دون الحد الأدنى: حث');
    await A(() => { const cb = document.querySelector('[data-bkey="online"]'); cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); });
    ok(await A(() => !document.querySelector('.layer.full')), 'دون اتصال: يُؤجَّل فحص التحديث');
    // اللغة: تبديل فوري بلا فقد حالة
    await fresh(); await A(() => { window.FOS_APP.SHOW['SH-16'](); window.FOS_APP.render(); }); await click('lg-en');
    ok(await A(() => document.getElementById('dev').dir === 'ltr' && document.querySelector('.appbar h1').textContent === 'Language' && document.querySelector('[data-k="nav-home"]').textContent.trim().startsWith('Home')), 'English: LTR والنص مترجم والموضع محفوظ');
    ok(await A(() => { const d = document.getElementById('dev'), n = d.querySelector('.nav'); return n.getBoundingClientRect().left === d.getBoundingClientRect().left || d.dataset.size === 'compact'; }), 'اتجاه التنقل يتبع اللغة');
    // SOS: ضغط مطوّل 3 ثوانٍ
    await fresh();
    const box = await (await page.$('#sos')).boundingBox(), cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down(); await sleep(1200); await page.mouse.up();
    ok(await A(() => window.FOS_APP.S.sos === null), 'ضغطة قصيرة لا تفعّل SOS');
    await page.mouse.down(); await sleep(3200); await page.mouse.up();
    ok(await A(() => window.FOS_APP.S.sos && window.FOS_APP.S.sos.phase === 'window'), 'ضغط 3 ثوانٍ يفعّل SOS');
    if (shots) await (await page.$('#dev')).screenshot({ path: path.join(shots, 'sos-sent.png') });
    await click('sos-cancel'); await click('why-1'); ok(await A(() => window.FOS_APP.S.sos === null), 'إلغاء خاطئ بسبب خلال 10 ثوانٍ');
    await A(() => { const c = document.querySelector('[data-bkey="a11ySos"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); document.getElementById('sos').click(); });
    ok(await A(() => window.FOS_APP.S.dialog === 'sosConfirm' && !window.FOS_APP.S.sos), 'بديل الوصول: الخطوة الأولى لا تُرسل'); await click('sos-yes');
    ok(await A(() => !!window.FOS_APP.S.sos), 'بديل الوصول: «أرسل النداء» يُرسل');
    // SOS دون اتصال: لا يدّعي الغلاف إرسالاً
    await fresh(); await A(() => { const cb = document.querySelector('[data-bkey="online"]'); cb.checked = false; cb.dispatchEvent(new Event('change', { bubbles: true })); const c = document.querySelector('[data-bkey="a11ySos"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); document.getElementById('sos').click(); }); await click('sos-yes');
    ok(await A(() => { const h = document.querySelector('.sos-card .hd').textContent.trim(); return h === 'سجّلنا نداء الاستغاثة' && window.FOS_APP.S.outbox.length === 0; }), 'SOS دون اتصال: «سجّلنا» لا «أرسلنا»، ولا يدخل Outbox');
    if (shots) await (await page.$('#dev')).screenshot({ path: path.join(shots, 'sos-offline.png') });
    // رفض تبديل الوضع بلا PIN
    await fresh(); await A(() => { window.FOS_APP.SHOW['SH-12'](); window.FOS_APP.render(); });
    ok(await A(() => !!document.querySelector('.dialog') && !document.querySelector('.pad') && window.FOS_APP.S.audit[0].action === 'shell.mode.refused'), 'رفض تبديل الوضع برسالة بلا PIN ومع تدقيق');
    // الأمر والإقرار
    await fresh(); await click('b-cmd'); await sleep(2000);
    { const c = await A(() => JSON.stringify([window.FOS_APP.S.cmd, window.FOS_APP.S.profile, window.FOS_APP.S.online, window.FOS_APP.S.childOnline])); ok(c.includes('acked'), 'أمر ← إقرار: ' + c); }
    // لقطة المنصة كاملة
    if (shots) { await fresh(); await page.screenshot({ path: path.join(shots, 'bench.png') }); }
    ok(errors.length === 0, 'أخطاء console: ' + errors.slice(0, 5).join(' | '));
  } catch (e) { fails.push('EXCEPTION ' + (e.stack || e)); }
  await browser.close();
  const uniq = [...new Set(fails)];
  if (uniq.length) { console.log('FAIL ' + uniq.length); console.log(uniq.slice(0, 60).join('\n')); process.exit(1); }
  console.log('ui-sweep: OK'); process.exit(0);
})();
