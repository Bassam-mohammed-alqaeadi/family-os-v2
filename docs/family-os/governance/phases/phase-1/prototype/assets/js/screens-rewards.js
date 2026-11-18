/* S1-05 المكافآت: المحفظة والكسب والصرف وطلب الوقت والسلاسل والاعتراض وقواعد الأب.
   هذا أساس نظام مشترك: أي نظام يُضاف لاحقاً يودِع في المحفظة نفسها عبر عقد الكسب العام (REQ-004).
   المرحلة 1: المصدر الوحيد المسجَّل هو المهام (S1-06)، والمكافأة الوحيدة وقت إضافي للتطبيقات (Q-113). */
'use strict';

/* ---------- صياغة ---------- */
const rwPt = n => (n === 1 ? 'نقطة واحدة' : n === 2 ? 'نقطتان' : `${n} ${n >= 3 && n <= 10 ? 'نقاط' : 'نقطة'}`);
const rwMn = n => (n === 1 ? 'دقيقة واحدة' : n === 2 ? 'دقيقتان' : `${n} ${n >= 3 && n <= 10 ? 'دقائق' : 'دقيقة'}`);
const rwDy = n => (n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : `${n} ${n >= 3 && n <= 10 ? 'أيام' : 'يوماً'}`);
const rwTk = n => (n === 1 ? 'مهمة واحدة' : n === 2 ? 'مهمتان' : `${n} ${n <= 10 ? 'مهام' : 'مهمة'}`);
const gx = (id, m, f) => (M[id].f ? f : m);
const rwDad = () => (mode() === 'teen' ? 'والدك' : 'بابا');
const rwWho = (x, kidV) => (x === 'ai' ? 'المساعد' : !M[x] ? 'النظام' : !kidV ? M[x].n : x === 'ahmad' ? rwDad() : x === 'sara' ? (mode() === 'teen' ? 'والدتك' : 'ماما') : M[x].n);
const RW_BADGE = [[7, 'الفضية', '#8E99A8'], [30, 'الذهبية', '#C8A24A'], [90, 'الماسية', '#2A9DB8']];
const RW_CELE = { full: ['كامل', 'قصاصات ملونة وصوت قصير عند كل كسب'], light: ['خفيف', 'إشعار هادئ بلا قصاصات'], off: ['صامت', 'يتغيّر الرصيد فقط'] };

/* ---------- الحالة (تُبذر عند أول استعمال) ---------- */
/* جداول كل طفل في المكافآت تُنشأ عند أول حاجة: طفل يضيفه الأب يدخل بلا رصيد ولا حركات (Q-435) */
const rwSeed = R => { KIDS.forEach(id => { R.led[id] = R.led[id] || []; R.frz[id] = R.frz[id] || { n: 0, on: 0 }; }); return R; };
function RW() {
  if (S.rw) return rwSeed(S.rw);
  S.rw = {
    n: 100, bonus: 50, cele: 'full', src: { tasks: true },
    day: { layan: 1 },                       /* هل حُسب يوم اليوم في السلسلة؟ (أول كسب موثَّق في اليوم) */
    frz: { layan: { n: 0, on: 0 } },
    gt: [],                                            /* الوقت الممنوح اليوم: صرف نقاط أو منح مباشر */
    obj: [],
    dec: [
      { id: 'd1', kid: 'layan', t: 'قراءة 15 دقيقة', pts: 10, by: 'ai', why: 'التسجيل مدته 6 دقائق والمطلوب 15', ev: 'تسجيل صوتي مدته 6 دقائق', at: 'أمس 6:20 م' },
      { id: 'd2', kid: 'khaled', t: 'إخراج القمامة', pts: 0, by: 'sara', why: 'لم تُخرج في موعدها', ev: 'إقرار خالد بلا إثبات آخر', at: 'الأربعاء 9:30 م' },
    ],
    led: {
      layan: [
        { id: 'l6', k: 'task', n: 5, t: 'تنظيف الأسنان', as: 'sara', vf: 'ahmad', ev: 'إقرار ليان واعتماد أحمد', at: '4:10 م', d: 0, bal: 85 },
        { id: 'l5', k: 'task', n: 15, t: 'حفظ سورة الفلق', as: 'ahmad', vf: 'ai', ev: 'تسجيل صوتي: التلاوة كاملة بلا توقف', at: '2:30 م', d: 0, bal: 80, st1: 1 },
        { id: 'l4', k: 'spend', n: -10, t: 'وقت إضافي لـYouTube Kids', app: 'ytk', min: 10, at: '6:40 م', d: 1, bal: 65 },
        { id: 'l3', k: 'gift', n: 20, t: 'هدية', by: 'ahmad', why: 'ساعدتِ أخاكِ في واجبه', at: '5:15 م', d: 1, bal: 75 },
        { id: 'l2', k: 'task', n: 15, t: 'حلّ واجب الرياضيات', as: 'ahmad', vf: 'ai', ev: 'صورة الدفتر: الحل مكتوب كاملاً', at: '4:00 م', d: 1, bal: 55 },
        { id: 'l1', k: 'task', n: 10, t: 'صلاة المغرب في وقتها', as: 'ahmad', vf: 'sara', ev: 'إقرار ليان واعتماد سارة', at: '', d: 2, bal: 40 },
      ],
      khaled: [],
    },
  };
  return rwSeed(S.rw);
}
/* المحفظة للأطفال دون 13 فقط (Q-109). عند بلوغ 13 تُجمَّد: الرصيد محفوظ بلا كسب ولا صرف (Q-237). */
const rwFz = id => (id === 'layan' && S.rev13 >= 1) || (id === 'khaled' && S.kid.khaled.pts > 0);
const rwHas = id => M[id].role === 'child' && !rwFz(id);
const RWK = () => KIDS.filter(id => M[id].role === 'child');
const rwKid = a => (isAdult() ? (M[a] && KIDS.includes(a) ? a : 'layan') : kidId());
const rwCapLeft = id => Math.max(0, S.redeemCap - S.kid[id].spent);
const rwOut = id => S.apps[id].filter(a => a.act === 'LIMIT' && a.used >= a.lim);
/* التطبيقات التي يصح الصرف لها الآن: ما نفد حدّه، أو أي تطبيق مسموح إن نفدت الحصة اليومية كلها */
const rwCands = id => (left(id) <= 0 ? S.apps[id].filter(a => a.act !== 'BLOCK') : rwOut(id));
const rwWhen = e => (e.d === 0 ? (e.at === 'الآن' ? 'الآن' : e.at ? 'اليوم ' + e.at : 'اليوم') : e.d === 1 ? (e.at ? 'أمس ' + e.at : 'أمس') : `قبل ${rwDy(e.d).replace('يومان', 'يومين')}`);
function rwCele() { if (RW().cele === 'full') confetti(); }

/* ---------- الدفتر ---------- */
function rwPut(kid, e) {
  const R = RW(), k = S.kid[kid]; k.pts = Math.max(0, k.pts + (e.n || 0));
  const x = Object.assign({ id: 'n' + (++R.n), at: 'الآن', d: 0, bal: k.pts }, e); (R.led[kid] = R.led[kid] || []).unshift(x); return x;
}
/* كسب مهمة: أول كسب موثَّق في اليوم يمدّ السلسلة يوماً، وكل سبعة أيام متتالية تودِع مكافأة السلسلة */
function rwEarn(kid, e) {
  if (!rwHas(kid)) return null; const R = RW(), k = S.kid[kid], x = rwPut(kid, e); let b = null;
  if (!R.day[kid]) { R.day[kid] = 1; k.streak += 1; x.st1 = 1; if (k.streak % 7 === 0 && R.bonus > 0) b = rwPut(kid, { k: 'streak', n: R.bonus, t: `مكافأة سلسلة ${rwDy(k.streak)}` }); }
  return { x, b };
}
/* الإلغاء قيد تعويضي واحد مرتبط بالأصل، ولا ينزل الرصيد تحت الصفر، والإلغاء المكرر لا يخصم مرتين (REQ-018) */
function rwRev(kid, lid, by) {
  const R = RW(), k = S.kid[kid], e = R.led[kid].find(x => x.id === lid); if (!e || e.rev) return 0;
  const take = Math.min(e.n, k.pts), r = rwPut(kid, { k: 'rev', n: -take, t: e.k === 'gift' ? 'هدية' : e.t, of: e.id, by }); e.rev = r.id;
  if (e.st1) { k.streak = Math.max(0, k.streak - 1); R.day[kid] = 0; e.st1 = 0; }
  return take;
}
/* وقت إضافي ليوم واحد: يُحسب من الحد اليومي سواء جاء من صرف نقاط أو منح مباشر (Q-272). يعيد دالة التراجع. */
function rwTime(kid, aid, n, src) {
  const R = RW(), k = S.kid[kid], a = appOf(kid, aid), g = { kid, app: aid, n, src };
  if (a.act === 'LIMIT') a.lim += n; k.extra += n; k.spent += n; R.gt.push(g);
  return () => { if (a.act === 'LIMIT') a.lim -= n; k.extra -= n; k.spent -= n; R.gt.splice(R.gt.indexOf(g), 1); };
}
/* منتصف الليل: ينتهي الوقت الإضافي، يُصفَّر عدّاد اليوم، ويوم بلا كسب يقطع السلسلة إلا إذا جُمّدت */
function rwNextDay() {
  const R = RW(); R.gt.forEach(g => { const a = appOf(g.kid, g.app); if (a.act === 'LIMIT') a.lim -= g.n; S.kid[g.kid].extra -= g.n; }); R.gt = []; R.broke = {};
  KIDS.forEach(id => { const k = S.kid[id]; k.spent = 0; k.used = 0; S.apps[id].forEach(a => { a.used = 0; });
    if (M[id].role === 'child') { const f = R.frz[id]; if (!R.day[id] && !f.on && k.streak) { k.streak = 0; f.n = 0; R.broke[id] = 1; } f.on = 0; R.day[id] = 0; } });
  Object.values(R.led).forEach(L => L.forEach(e => { e.d += 1; if (e.at === 'الآن') e.at = ''; }));
  S.reqs.forEach(r => { if (r.st === 'PENDING') { r.st = 'EXPIRED'; r.seen = 1; } }); S.warned = {};
}

/* ---------- قطع عرض مشتركة ---------- */
const RW_IC = { task: 'task_alt', gift: 'redeem', streak: 'local_fire_department', spend: 'more_time', time: 'more_time', rev: 'undo', back: 'balance' };
function rwTitle(e, kidV) {
  return e.k === 'gift' ? `هدية من ${rwWho(e.by, kidV)}` : e.k === 'rev' ? `أُلغيت: ${e.t}` : e.k === 'back' ? `أُعيدت: ${e.t}` : e.k === 'time' ? `وقت من ${rwWho(e.by, kidV)}: ${rwMn(e.min)}` : e.t;
}
function rwRow(kid, e, kidV) {
  const sub = [rwWhen(e), e.k === 'task' ? (e.vf === 'ai' ? 'تحقق المساعد' : 'اعتمدها ' + rwWho(e.vf, kidV)) : e.k === 'gift' ? e.why : e.k === 'time' ? appOf(kid, e.app).n : '', e.rev ? 'أُلغي' : ''].filter(Boolean).join(' · ');
  const v = e.n ? `<b class="rwv ${e.n > 0 ? 'pos' : 'neg'}${e.rev ? ' off' : ''}">${e.n > 0 ? '+' : '−'}${Math.abs(e.n)}</b>` : '';
  return row(RW_IC[e.k], rwTitle(e, kidV), sub, { a: `go:rw-move:${kid}:${e.id}`, v, chev: false });
}
const rwMeter = (id, kidV) => { const k = S.kid[id], cl = rwCapLeft(id), f = M[id].f;
  return `<div class="card"><div class="fx sb"><b>${kidV ? 'وقتي الإضافي اليوم' : 'الوقت الإضافي اليوم'}</b><span class="sm muted">${k.spent} من ${S.redeemCap} دقيقة</span></div><div style="margin:8px 0 6px">${pbar(k.spent / S.redeemCap * 100, cl ? 'ok' : 'wa')}</div><span class="sm muted">${cl ? (kidV ? `بقي لك ${rwMn(cl)} اليوم.` : `بقي ${rwMn(cl)} من الحد.`) + ' ينتهي الوقت الإضافي عند منتصف الليل.' : kidV ? `${f ? 'أخذتِ' : 'أخذتَ'} كل وقتك الإضافي اليوم. يعود غداً.` : 'بلغ الحد اليومي. لا صرف ولا منح حتى الغد.'}</span></div>`; };
const rwWeek = id => { const k = S.kid[id], R = RW(), pos = k.streak % 7, done = pos === 0 && k.streak && R.day[id] ? 7 : pos;
  return `<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(i => `<div class="${i < done ? 'on' : ''} ${i === done && !R.day[id] ? 'td' : ''}"><i>${i === 6 ? ic('redeem') : i < done ? ic('local_fire_department') : i + 1}</i>${i === 6 && R.bonus ? '+' + R.bonus : ''}</div>`).join('')}</div>`; };
function rwNoWallet(id) {
  const k = S.kid[id], f = M[id].f;
  if (M[id].role === 'child' || k.pts > 0) return `<div class="wallet fz"><small>رصيد محفوظ</small><div class="big">${k.pts} ${coin()}</div><small>محفظة مجمّدة</small></div>${callout(`بعد سن 13 لا تُكسب نقاط ولا تُصرف. رصيدك ${rwPt(k.pts)} محفوظ كما هو، و${rwDad()} يقرر ما يفعل به.`, 'nt', 'ac_unit')}`;
  return empty('stars', 'لا محفظة للمراهقين', `النقاط للأطفال دون 13 سنة. حين ينتهي وقت تطبيق ${f ? 'تطلبين' : 'تطلب'} وقتاً إضافياً من ${rwDad()} وهو يقرر.`);
}

/* بطاقة نتيجة طلب الوقت على رئيسية الطفل والمراهق: تُغلق بنقرة */
function rwReqCard(id, q) {
  const f = M[id].f, teen = M[id].role === 'teen', dad = teen ? 'والدك' : 'بابا', a = appOf(id, q.app), ok = q.st === 'GRANTED';
  const t = ok ? (teen ? `وافق ${dad}: ${rwMn(q.got)} إضافية` : `وافق ${dad}! +${q.got} دقيقة`) : q.st === 'EXPIRED' ? 'انتهى طلب الأمس بلا رد' : teen ? `لم يوافق ${dad} على الوقت الإضافي` : (f ? 'ليس الآن يا بطلة' : 'ليس الآن يا بطل');
  const s = ok ? `أُضيفت إلى ${a.n} وتنتهي عند منتصف الليل${q.got < q.min ? ` · طلبت${f ? 'ِ' : 'َ'} ${q.min}` : ''}` : q.st === 'EXPIRED' ? `${f ? 'اطلبي' : 'اطلب'} من جديد إن احتجت${f ? 'ِ' : 'َ'} وقتاً اليوم.` : q.task ? `${teen ? 'أسند لك' : 'أعطاك ' + dad} مهمة «${q.task}» بدلاً منه${teen ? '.' : `. ${f ? 'أنجزيها لتكسبي' : 'أنجزها لتكسب'} نقاطاً.`}` : teen || !rwHas(id) ? `${f ? 'تستطيعين' : 'تستطيع'} الطلب مرة أخرى لاحقاً.` : `${f ? 'تستطيعين' : 'تستطيع'} المحاولة لاحقاً أو تحويل نقاطك.`;
  return `<button class="card fx" style="border-color:var(--${ok ? 'success' : 'border-strong'})" data-a="reqSeen:${q.id}" aria-label="إخفاء">${ic(ok ? 'celebration' : q.st === 'EXPIRED' ? 'bedtime' : 'front_hand')}<div class="grow"><b>${t}</b><div class="sm muted">${s}</div></div>${ic('close')}</button>`;
}

/* ============ الطفل (7–12): محفظتي ============ */
surface('c-rewards', {
  t: 'مكافآتي', sys: 'S1-05', p: 'child', req: '05:1,2,3,5,7,8,9,10,12 01:4',
  note: 'S05-01. محفظة واحدة تجمع كل ما يكسبه الطفل من أي نظام، والمكافأة في المرحلة 1 وقت إضافي فقط: لا متجر ولا مشتريات. الرصيد يعمل دون اتصال. عدّاد «وقتي الإضافي اليوم» يجمع ما صُرف بالنقاط وما منحه الأب معاً. كل حركة تفتح تفصيلها ودليلها.',
  r() { const id = kidId(); if (!rwHas(id)) return rwNoWallet(id);
    const R = RW(), k = S.kid[id], f = M[id].f, L = R.led[id], out = rwCands(id), pend = S.reqs.find(r => r.kid === id && r.st === 'PENDING'), ob = R.obj.find(o => o.kid === id && o.st !== 'PENDING' && !o.seen), T = S.tasks.filter(t => t.kid === id && t.st === 'PENDING' && t.pts), sum = T.reduce((a, t) => a + t.pts, 0), toB = 7 - k.streak % 7;
    return `${offline() ? callout(`${f ? 'أنتِ' : 'أنت'} دون اتصال. هذا رصيدك المحفوظ على جهازك، وما ${f ? 'تفعلينه' : 'تفعله'} يُسجَّل عند عودة الاتصال.`, 'nt', 'cloud_off') : ''}
    <div class="wallet"><small>نقاطي</small><div class="big">${k.pts} ${coin()}</div><small>كل 10 نقاط = 10 دقائق من الوقت الإضافي</small></div>
    ${R.broke && R.broke[id] ? callout(`انقطعت سلسلتك أمس. ${f ? 'ابدئي' : 'ابدأ'} واحدة جديدة بمهمة اليوم.`, 'nt', 'local_fire_department') : ''}
    ${ob ? `<button class="card fx" style="border-color:var(--${ob.st === 'ACCEPTED' ? 'success' : 'border-strong'})" data-a="go:objection:${ob.sub}">${ic('balance')}<div class="grow"><b>${ob.st === 'ACCEPTED' ? `قبل ${rwDad()} اعتراضك` : `ردّ ${rwDad()} على اعتراضك`}</b><div class="sm muted">${ob.st === 'ACCEPTED' ? ob.eff : ob.why}</div></div></button>` : ''}
    ${pend ? `<div class="card fx">${ic('hourglass_top')}<div class="grow"><b>طلبك عند ${rwDad()}</b><div class="sm muted">${rwMn(pend.min)} لـ${appOf(id, pend.app).n} · ${offline() ? 'يُرسل عند عودة الاتصال' : 'سنخبرك حالما يرد'}</div></div></div>` : ''}
    ${btn(f ? 'حوّلي نقاطك إلى وقت' : 'حوّل نقاطك إلى وقت', 'go:redeem' + (out[0] ? ':' + out[0].id : ''), out.length && k.pts >= 10 && rwCapLeft(id) >= 10 ? 'ok' : 'sec', 'more_time')}${out.length && !pend && rwCapLeft(id) > 0 ? `<div class="gap"></div>${btn(f ? 'أو اطلبي وقتاً من بابا' : 'أو اطلب وقتاً من بابا', 'go:ask-time:' + out[0].id, 'txt', 'front_hand')}` : ''}<div class="gap"></div>
    ${rwMeter(id, 1)}
    <button class="card" data-a="go:streak"><div class="fx sb"><b>${ic('local_fire_department')} سلسلتي: ${k.streak ? rwDy(k.streak) : 'لم تبدأ بعد'}</b><span class="sm muted">${R.bonus ? `بقي ${rwDy(toB)} للمكافأة` : ''}</span></div>${rwWeek(id)}</button>
    ${list(row('task_alt', T.length ? `عندك ${rwTk(T.length)} اليوم` : 'لا مهام تنتظرك الآن', T.length ? `${f ? 'تكسبين' : 'تكسب'} بها ${rwPt(sum)}` : `حين يسند لك ${rwDad()} مهمة تظهر في «مسار اليوم»`, { a: 'tab:c-home' }))}
    ${sec('آخر الحركات', L.length > 4 ? 'كل الحركات' : '', 'go:rw-ledger')}${L.length ? list(L.slice(0, 4).map(e => rwRow(id, e, 1))) : empty('stars', 'لم تكسبي نقاطاً بعد', 'أنجزي مهمة من «مسار اليوم» لتبدأ محفظتك.', btn('شاهدي مهامك', 'tab:c-home', 'sm ton'))}
    ${list(row('balance', 'قرار لم يكن عادلاً؟', `${f ? 'أخبري' : 'أخبر'} ${rwDad()} بهدوء وهو يراجعه`, { a: 'go:objection' }))}`; },
});

/* ============ سجل الحركات (للطفل ولوليّه) ============ */
surface('rw-ledger', {
  t: a => (isAdult() ? 'حركات ' + M[rwKid(a)].n : 'كل الحركات'), sys: 'S1-05', p: 'any', a: ['layan'], req: '05:2,4,5',
  note: 'سجل واحد بالأحدث أولاً، يراه الطفل لمحفظته والأب لكل محفظة. كل سطر يذكر من أين جاءت النقاط ومن تحقق، ويفتح الدليل. المصدر يُعرض لأن المحفظة تستقبل من أي نظام مسجَّل.',
  r(a) { const id = rwKid(a), R = RW(), kidV = !isAdult(), L = (R.led[id] || []), fl = S.rwF || '';
    if (kidV && M[id].role !== 'child') return rwNoWallet(id);
    if (!kidV && !can('rewards.ledger.view', id)) return empty('lock_person', 'لا تملك عرض هذا السجل', 'ترى الرصيد فقط. اطلب من أحمد صلاحية «رؤية سجل النقاط».');
    const F = L.filter(e => (fl === 'in' ? e.n > 0 : fl === 'out' ? e.n < 0 : true)), G = [['اليوم', F.filter(e => e.d === 0)], ['أمس', F.filter(e => e.d === 1)], ['أقدم', F.filter(e => e.d > 1)]].filter(g => g[1].length);
    return `${seg([['', 'الكل'], ['in', kidV ? 'كسبت' : 'دخل'], ['out', kidV ? 'صرفت' : 'خرج']], fl, 'set:rwF')}${G.length ? G.map(g => sec(g[0]) + list(g[1].map(e => rwRow(id, e, kidV)))).join('') : empty('history', 'لا حركات هنا', fl ? 'جرّب تبويب «الكل».' : 'تظهر الحركات عند أول كسب.')}<p class="sm muted c" style="margin-top:10px">النقاط لا تنتهي. الوقت الإضافي وحده ينتهي عند منتصف الليل.</p>`; },
});
surface('rw-move', {
  kind: 'sheet', t: 'تفصيل حركة', sys: 'S1-05', p: 'any', a: ['layan', 'l5'], req: '05:2,5,17,18',
  note: 'S05-09 للأب وتفصيل الحركة للطفل. تعرض من أسند المهمة ومن تحقق منها ودليلها. المالك يلغي إيداعاً في يومه فقط بقيد تعويضي ظاهر، والرصيد لا ينزل تحت الصفر. الطفل يعترض على ما خُصم منه. الإلغاء يحتاج اتصالاً.',
  r(a, lid) { const id = rwKid(a), R = RW(), L = R.led[id] || [], e = L.find(x => x.id === lid) || L[0]; if (!e) return `<h4>لا حركة لعرضها</h4>${btn('حسناً', 'close')}`;
    const kidV = !isAdult(), o = e.of && L.find(x => x.id === e.of), ap = e.app && appOf(id, e.app), ob = R.obj.find(x => x.kid === id && x.sub === 'L' + e.id);
    const kv = [['متى', rwWhen(e)], e.k === 'task' && ['المصدر', 'المهام'], e.k === 'task' && ['من أسندها', rwWho(e.as, kidV)], e.k === 'task' && ['من تحقق منها', rwWho(e.vf, kidV)], e.ev && ['الدليل', e.ev], e.k === 'gift' && ['السبب', e.why || 'بلا سبب مذكور'], e.k === 'streak' && ['السبب', 'سبعة أيام إنجاز متتالية'], ap && ['التطبيق', ap.n], e.min && ['الوقت', rwMn(e.min) + (e.d === 0 ? ' · ينتهي عند منتصف الليل' : ' · انتهى أثره')], e.k === 'rev' && ['من ألغاه', rwWho(e.by, kidV)], e.k === 'rev' && o && ['الإيداع الأصلي', `+${o.n} · ${rwWhen(o)}`], e.k === 'back' && ['السبب', 'اعتراض مقبول'], e.n ? ['الرصيد بعدها', rwPt(e.bal)] : 0].filter(Boolean);
    const canRev = !kidV && can('rewards.grant.reverse') && e.n > 0 && !e.rev && (e.k === 'task' || e.k === 'gift');
    return `<div class="c"><span class="av xl" style="--c:${e.n < 0 ? 'var(--muted)' : '#C8A24A'};margin:0 auto 8px">${ic(RW_IC[e.k])}</span><h4>${rwTitle(e, kidV)}</h4>${e.n ? `<p class="rwbig ${e.n > 0 ? 'pos' : 'neg'}">${e.n > 0 ? '+' : '−'}${Math.abs(e.n)} ${coin()}</p>` : ''}${e.rev ? chip('أُلغي هذا الإيداع', 'wa', 'undo') : ''}</div>
    <div class="card flat rwkv">${kv.map(([x, y]) => `<div><span>${x}</span><b>${y}</b></div>`).join('')}</div>
    ${e.k === 'task' && e.vf === 'ai' && !kidV ? `<p class="sm muted" style="margin:0 4px 10px">أودعها المساعد بتفويضك بعد التحقق من الدليل. ${why('rwverify')}</p>` : ''}
    ${canRev ? (e.d > 0 ? `<p class="sm muted" style="margin:0 4px 10px">انتهت مهلة الإلغاء: الإيداع يُلغى في يومه فقط.</p>` : offline() ? callout('إلغاء الإيداع يحتاج اتصالاً، لأن الخادم يتحقق من الرصيد قبل الخصم.', 'wa', 'cloud_off') : btn('ألغِ هذا الإيداع', `rwRevAsk:${id}:${e.id}`, 'dng', 'undo')) : ''}
    ${kidV && e.k === 'rev' ? (ob ? btn('عرض اعتراضي', 'go:objection:L' + e.id, 'sec', 'balance') : btn(gx(id, 'اعترض على هذا', 'اعترضي على هذا'), 'go:objection:L' + e.id, 'sec', 'balance')) : ''}`; },
});

/* ============ S05-02 صرف وقت إضافي ============ */
surface('redeem', {
  kind: 'sheet', t: 'صرف النقاط', sys: 'S1-05', p: 'child', a: ['ytk'], req: '05:3,8,9,10 10:12',
  note: 'S05-02. الصرف للتطبيق الذي نفد وقته تحديداً، بخطوات 10 نقاط، وبسعر ثابت 10 نقاط = 10 دقائق. يظهر ما سيبقى في المحفظة وما بقي من حد اليوم قبل التأكيد. دون اتصال يُضاف الوقت فوراً على الجهاز ويُسجَّل لاحقاً. ما لم يُستخدم لا يعود نقاطاً.',
  r(aid) { const id = kidId(), k = S.kid[id], f = M[id].f, C = rwCands(id), cl = rwCapLeft(id), ok = btn('حسناً', 'close', 'sec');
    if (!rwHas(id)) return `<h4>لا محفظة للصرف منها</h4><p class="d">النقاط للأطفال دون 13 سنة.</p>${ok}`;
    if (!C.length) return `<h4>لا تطبيق يحتاج وقتاً الآن</h4><p class="d">${f ? 'تحوّلين' : 'تحوّل'} نقاطك حين ينتهي وقت تطبيق. ${f ? 'احتفظي' : 'احتفظ'} بها، فالنقاط لا تنتهي.</p>${ok}`;
    const a = C.find(x => x.id === S.rdA) || C.find(x => x.id === aid) || C[0];
    if (cl < 10) return `<h4>انتهى الوقت الإضافي لليوم</h4><p class="d">${f ? 'أخذتِ' : 'أخذتَ'} اليوم ${rwMn(k.spent)} إضافية، وهذا الحد الذي وضعه ${rwDad()}. نقاطك باقية معك، والصرف يعود غداً.</p>${ok}`;
    if (k.pts < 10) return `<h4>نقاطك لا تكفي الآن</h4><p class="d">معك ${rwPt(k.pts)}، والتحويل يبدأ من 10 نقاط.</p>${btn(f ? 'اطلبي وقتاً من بابا' : 'اطلب وقتاً من بابا', 'go:ask-time:' + a.id, '', 'front_hand')}<div class="gap"></div>${btn(f ? 'شاهدي مهامك' : 'شاهد مهامك', 'rwTasks', 'txt')}`;
    const max = Math.min(k.pts - k.pts % 10, cl - cl % 10), n = Math.min(Math.max(10, S.rdN || 10), max);
    return `<h4>وقت إضافي لـ${a.n}</h4><p class="d">كل 10 نقاط = 10 دقائق. ينتهي هذا الوقت عند منتصف الليل، وما لم ${f ? 'تستخدميه' : 'تستخدمه'} لا يعود نقاطاً.</p>
    ${C.length > 1 ? `<div class="chips" style="margin-bottom:12px">${C.map(x => `<button class="chip ${x.id === a.id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="set:rdA:${x.id}">${ic(x.i)}${x.n}</button>`).join('')}</div>` : ''}
    <div class="card flat"><div class="stepper"><button data-a="set:rdN:${n - 10}" aria-label="أقل" ${n <= 10 ? 'disabled' : ''}>${ic('remove')}</button><b>${n}<small>دقيقة = ${rwPt(n)}</small></b><button data-a="set:rdN:${n + 10}" aria-label="أكثر" ${n >= max ? 'disabled' : ''}>${ic('add')}</button></div></div>
    <div class="card flat rwkv"><div><span>معك الآن</span><b>${rwPt(k.pts)}</b></div><div><span>يبقى معك</span><b>${rwPt(k.pts - n)}</b></div><div><span>بقي من حد اليوم</span><b>${rwMn(cl)}</b></div></div>
    ${offline() ? callout(`${f ? 'أنتِ' : 'أنت'} دون اتصال. يُضاف الوقت الآن على جهازك، ويُسجَّل التحويل عند عودة الاتصال.`, 'nt', 'cloud_off') : ''}
    ${btn(`${f ? 'حوّلي' : 'حوّل'} ${rwPt(n)} إلى ${rwMn(n)}`, `rdGo:${a.id}:${n}`, 'ok', 'more_time')}`; },
});

/* ============ S05-03 طلب وقت إضافي ============ */
const rwAskOpts = id => { const cl = rwCapLeft(id), O = [10, 15, 30].filter(n => n <= cl); if (!O.length && cl > 0) O.push(cl); return O; };
const rwAskN = id => { const O = rwAskOpts(id); return O.includes(S.akN) ? S.akN : O[Math.min(1, O.length - 1)]; };
surface('ask-time', {
  kind: 'sheet', t: 'طلب وقت إضافي', sys: 'S1-05', p: 'kid', a: ['ytk'], req: '05:12,14',
  note: 'S05-03. الطلب يصل بطاقة «يتطلب انتباهك» عند الأب فوراً، ودون اتصال يُحفظ ويُرسل لاحقاً. المدد المعروضة لا تتجاوز ما بقي من حد اليوم. طلب واحد معلّق لكل تطبيق. المراهق يطلب وقتاً بلا نقاط. بدّل الشخصية إلى أحمد لتقرر، ثم عُد لترى النتيجة.',
  r(aid) { const id = kidId(), k = S.kid[id], f = M[id].f, teen = mode() === 'teen', a = appOf(id, aid) || S.apps[id][0], dad = rwDad(), pend = S.reqs.find(r => r.kid === id && r.app === a.id && r.st === 'PENDING'), O = rwAskOpts(id), n = rwAskN(id);
    if (pend) return `<h4>طلبك عند ${dad}</h4><p class="d">${f ? 'طلبتِ' : 'طلبتَ'} ${rwMn(pend.min)} لـ${a.n}. ${offline() ? 'يُرسل عند عودة الاتصال.' : 'سنخبرك حالما يرد.'}</p>${btn('حسناً', 'close', 'sec')}`;
    if (!O.length) return `<h4>انتهى الوقت الإضافي لليوم</h4><p class="d">${f ? 'أخذتِ' : 'أخذتَ'} اليوم ${rwMn(k.spent)} إضافية، وهذا الحد الذي وضعه ${dad}. يعود غداً.</p>${btn('حسناً', 'close', 'sec')}`;
    return `<h4>كم دقيقة ${f ? 'تريدين' : 'تريد'} لـ${a.n}؟</h4><p class="d">يصل طلبك إلى ${dad} وهو يقرر${teen ? '.' : `. قد يمنحك وقتاً، وقد يعطيك مهمة ${f ? 'تكسبين' : 'تكسب'} بها نقاطاً.`}</p>${seg(O.map(x => [x, x + ' دقيقة']), n, 'set:akN')}
    <label class="fld"><span>${f ? 'قولي' : 'قل'} ل${dad === 'بابا' ? 'بابا' : 'والدك'} لماذا (اختياري)</span><input id="akM" maxlength="60" placeholder="مثال: بقيت حلقة واحدة"></label>
    ${offline() ? callout('لا اتصال الآن. يُحفظ طلبك ويُرسل عند عودة الاتصال.', 'nt', 'cloud_off') : ''}${btn(f ? 'أرسلي الطلب' : 'أرسل الطلب', 'askGo:' + a.id, '', 'send')}
    ${rwHas(id) && k.pts >= 10 ? `<div class="gap"></div>${btn(`أو ${f ? 'حوّلي' : 'حوّل'} من نقاطك (معك ${k.pts})`, 'go:redeem:' + a.id, 'txt', 'stars')}` : ''}`; },
});

/* ============ S05-05 السلاسل ============ */
surface('streak', {
  t: a => (isAdult() ? 'سلسلة ' + M[rwKid(a)].n : 'سلسلتي'), sys: 'S1-05', p: 'any', a: ['layan'], req: '05:7',
  note: 'S05-05. أول مهمة معتمدة في اليوم تمدّ السلسلة يوماً. كل سبعة أيام متتالية تودِع مكافأة السلسلة، والشارات عند 7 و30 و90 يوماً. التجميد للمالك وحده: يوم واحد في كل مرة، ومرتان على الأكثر في السلسلة الواحدة، ولا يعيد سلسلة انقطعت.',
  r(a) { const id = rwKid(a); if (M[id].role !== 'child' || rwFz(id)) return rwNoWallet(id);
    const R = RW(), k = S.kid[id], z = R.frz[id], kidV = !isAdult(), f = M[id].f, own = can('rewards.streak.freeze'), toB = 7 - k.streak % 7;
    const st = R.day[id] ? 'يوم اليوم محسوب' : z.on ? 'اليوم مجمّد: السلسلة لا تنقطع' : k.streak ? (kidV ? `${f ? 'أنجزي' : 'أنجز'} مهمة اليوم لتستمر` : 'لم تُعتمد مهمة اليوم بعد') : (kidV ? `${f ? 'ابدئي' : 'ابدأ'} سلسلتك بمهمة اليوم` : 'لا سلسلة جارية');
    return `<div class="rwstk"><span class="fl ${k.streak ? '' : 'off'}">${ic('local_fire_department')}</span><b>${k.streak}</b><span>${k.streak ? (k.streak <= 10 && k.streak > 2 ? 'أيام متتالية' : k.streak === 1 ? 'يوم واحد' : k.streak === 2 ? 'يومان متتاليان' : 'يوماً متتالياً') : 'لم تبدأ بعد'}</span>${chip(st, R.day[id] ? 'ok' : z.on ? 'in' : 'ol', R.day[id] ? 'check' : z.on ? 'ac_unit' : 'schedule')}</div>
    <div class="card"><div class="fx sb"><b>${R.bonus ? `المكافأة القادمة: +${R.bonus} نقطة` : 'هذا الأسبوع'}</b><span class="sm muted">${R.bonus ? `بعد ${rwDy(toB).replace('يومان', 'يومين')}` : ''}</span></div>${rwWeek(id)}</div>
    ${sec('الشارات')}<div class="rwbdg">${RW_BADGE.map(([d, n, c]) => { const got = k.streak >= d; return `<div class="${got ? 'got' : ''}" style="--bc:${c}"><i>${ic('workspace_premium')}</i><b>${n}</b><span>${got ? (kidV ? (f ? 'نلتِها' : 'نلتَها') : (f ? 'نالتها' : 'نالها')) : `بقي ${rwDy(d - k.streak)}`}</span></div>`; }).join('')}</div>
    ${callout(`أول مهمة معتمدة في اليوم تمدّ السلسلة يوماً. يوم بلا مهمة معتمدة يقطعها، إلا إذا ${kidV ? 'جمّدها ' + rwDad() : 'جمّدتها'}.`, 'nt', 'info')}
    ${kidV ? (z.on ? callout(`جمّد ${rwDad()} سلسلتك اليوم. ${f ? 'استريحي' : 'استرح'}، لن تنقطع.`, 'in', 'ac_unit') : `<p class="sm muted c">في يوم مرض أو سفر يستطيع ${rwDad()} تجميد السلسلة يوماً.</p>`) : ''}
    ${!kidV && own ? sec('التجميد') + list(z.on ? row('ac_unit', 'مجمّدة اليوم', 'حتى منتصف الليل · يوم بلا مهمة لا يقطعها', { v: chip('مفعّل', 'in') }) : !k.streak ? row('ac_unit', 'لا سلسلة لتجميدها', 'التجميد يحفظ سلسلة جارية، ولا يعيد سلسلة انقطعت', { c: 'dis' }) : z.n >= 2 ? row('ac_unit', 'استُنفد التجميدان', 'مرتان على الأكثر في السلسلة الواحدة', { c: 'dis', v: '2 من 2' }) : row('ac_unit', 'جمّد السلسلة اليوم', 'ليوم مرض أو سفر · يوم واحد في كل مرة', { a: 'rwFreeze:' + id, v: `${z.n} من 2` }), can('rewards.settings.edit') ? row('local_fire_department', 'مكافأة السلسلة', 'كل سبعة أيام متتالية', { a: 'go:rw-edit:bonus', v: R.bonus ? R.bonus + ' نقطة' : 'بلا' }) : '') : ''}`; },
});

/* ============ S05-06 اعتراض الطفل ============ */
const RW_OBQ = ['أنجزتها كما طُلب', 'الدليل لم يكن واضحاً', 'لم أفهم السبب'];
function rwSub(kid, sid) {
  const R = RW(); if (String(sid)[0] === 'L') { const e = (R.led[kid] || []).find(x => 'L' + x.id === sid); return e && { id: sid, ty: 'rev', t: `أُلغيت نقاط «${e.t}»`, pts: -e.n, by: e.by, why: 'ألغى الإيداع', ev: '', at: rwWhen(e) }; }
  const d = R.dec.find(x => x.id === sid && x.kid === kid); return d && { id: d.id, ty: 'reject', t: `لم تُعتمد «${d.t}»`, task: d.t, pts: d.pts, by: d.by, why: d.why, ev: d.ev, at: d.at };
}
const rwSubs = kid => [...RW().dec.filter(d => d.kid === kid).map(d => rwSub(kid, d.id)), ...(RW().led[kid] || []).filter(e => e.k === 'rev' && e.by !== 'undo').map(e => rwSub(kid, 'L' + e.id))];
const rwObjSt = o => (!o ? '' : o.st === 'PENDING' ? chip('عند ' + rwDad(), 'wa', 'hourglass_top') : o.st === 'ACCEPTED' ? chip('قُبل', 'ok', 'check') : chip('لم يُقبل', 'ol'));
surface('objection', {
  kind: 'sheet', t: 'اعتراض على قرار', sys: 'S1-05', p: 'kid', a: ['d1'], req: '05:5,18',
  note: 'S05-06. الطفل يعترض على مهمة لم تُعتمد أو نقاط أُلغيت، بجملة جاهزة أو نص قصير محدود، ويصل الأب فوراً. قبول الاعتراض يعيد الحق لصاحبه: تُعتمد المهمة وتودَع نقاطها، أو تعود النقاط الملغاة. الرفض يصل الطفل بسببه. للمراهق القناة نفسها نقاشاً بلا نقاط. دون اتصال يُحفظ ويُرسل لاحقاً.',
  r(sid) { const id = kidId(), R = RW(), teen = mode() === 'teen', f = M[id].f, dad = rwDad();
    if (!sid || !rwSub(id, sid)) { const U = rwSubs(id);
      return `<h4>${teen ? 'ناقش قراراً' : 'قرار لم يكن عادلاً؟'}</h4><p class="d">${f ? 'اختاري' : 'اختر'} القرار ${f ? 'واكتبي' : 'واكتب'} ل${dad === 'بابا' ? 'بابا' : 'والدك'} ما حدث. يصله فوراً وهو يقرر.</p>${U.length ? list(U.map(s => row(s.ty === 'rev' ? 'undo' : 'task_alt', s.t, `${s.at} · ${rwWho(s.by, 1)}: ${s.why}`, { a: 'go:objection:' + s.id, v: rwObjSt(R.obj.find(o => o.kid === id && o.sub === s.id)) }))) : empty('balance', 'لا قرار يُعترض عليه الآن', 'حين لا تُعتمد مهمة أو تُلغى نقاط يظهر القرار هنا.')}`; }
    const s = rwSub(id, sid), o = R.obj.find(x => x.kid === id && x.sub === sid), q = S.obQ || '';
    const head = `<div class="card flat rwkv"><div><span>القرار</span><b>${s.t}</b></div><div><span>من قرره</span><b>${rwWho(s.by, 1)}</b></div><div><span>السبب المسجَّل</span><b>${s.why}</b></div><div><span>متى</span><b>${s.at}</b></div></div>`;
    if (o) { if (o.st !== 'PENDING') o.seen = 1;
      return `<h4>${o.st === 'PENDING' ? `اعتراضك عند ${dad}` : o.st === 'ACCEPTED' ? `قبل ${dad} اعتراضك` : `لم يقبل ${dad} الاعتراض`}</h4>${head}<div class="card flat sm">«${o.txt}»</div>${o.st === 'PENDING' ? callout(o.q ? 'لا اتصال الآن. يُرسل اعتراضك عند عودة الاتصال، ويصل حينها.' : `وصل اعتراضك. ${dad === 'بابا' ? 'بابا' : 'والدك'} يراجعه وسنخبرك بردّه.`, o.q ? 'nt' : 'in', o.q ? 'cloud_off' : 'hourglass_top') : o.st === 'ACCEPTED' ? callout(o.eff, 'ok', 'check_circle') : callout(`السبب: ${o.why}`, 'nt', 'reply')}${btn('حسناً', 'close', 'sec')}`; }
    return `<h4>${teen ? 'ناقش هذا القرار' : gx(id, 'اعترض على هذا القرار', 'اعترضي على هذا القرار')}</h4>${head}
    <div class="fld"><span>ما الذي حدث؟</span><div class="chips">${RW_OBQ.map((x, i) => `<button class="chip ${q === String(i) ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="rwObQ:${i}">${x}</button>`).join('')}</div></div>
    <label class="fld"><span>${f ? 'أضيفي' : 'أضف'} بكلماتك (اختياري)</span><textarea id="obT" maxlength="120" placeholder="جملة أو جملتان">${S.obT || ''}</textarea></label>
    ${offline() ? callout('لا اتصال الآن. يُحفظ اعتراضك ويُرسل عند عودة الاتصال.', 'nt', 'cloud_off') : ''}${btn(teen ? 'أرسل' : gx(id, 'أرسل اعتراضي', 'أرسلي اعتراضي'), 'rwObjGo:' + sid, '', 'send')}`; },
});


/* ============ الأهل: المكافآت ============ */
/* اختياران متجاوران يشرح كلٌّ منهما نفسه: النقاط تُدَّخر، والوقت يُستعمل اليوم (توجيه المالك: الفرق يجب أن يُلاحَظ بلا شرح خارجي) */
function rwGive(kid) {
  const a = kid ? ':' + kid : '', pts = kid ? rwHas(kid) : true;
  return `<div class="rwch">${pts ? `<button data-a="go:grant-points${a}"><span class="qi go">${ic('stars')}</span><b>امنح نقاطاً</b><small>تبقى في المحفظة، وتُصرف وقتاً متى شاء</small></button>` : ''}<button data-a="go:grant-time${a}"><span class="qi ac">${ic('more_time')}</span><b>امنح وقتاً</b><small>دقائق الآن لتطبيق واحد، تنتهي عند منتصف الليل</small></button></div><p class="c" style="margin:-2px 0 10px">${why('rwgive', 'ما الفرق بينهما؟')}</p>`;
}
surface('rewards-admin', {
  t: 'المكافآت', sys: 'S1-05', p: 'adult', req: '05:1,2,6,7,10,11,14,16,18 10:12',
  note: 'S05-01 بعرض الأهل. ما ينتظر قراراً أولاً (طلب وقت، اعتراض)، ثم محفظة كل طفل برصيدها وسلسلتها ووقتها الإضافي اليوم. المراهق بلا محفظة ويظهر بوقته الإضافي فقط. قواعد المكافآت للمالك وحده. البالغ المفوَّض يرى ما مُنح له فقط.',
  r() { const R = RW(), own = can('rewards.settings.view'), W = RWK().filter(id => can('rewards.wallet.view', id)), Q = can('rewards.time_request.decide') ? S.reqs.filter(r => r.st === 'PENDING') : [], O = can('rewards.objection.decide') ? R.obj.filter(o => o.st === 'PENDING') : [], G = KIDS.some(id => can('rewards.grant.create', id)), ai = W.flatMap(id => R.led[id].filter(e => e.vf === 'ai' && e.d === 0 && !e.rev)).length;
    return `${Q.length || O.length ? sec('ينتظر قرارك') + list(Q.map(r => row('more_time', `${M[r.kid].n} ${vb(M[r.kid], 'يطلب', 'تطلب')} ${rwMn(r.min)}`, `${appOf(r.kid, r.app).n} · نفد وقته اليوم`, { a: 'go:time-decide:' + r.id })), O.map(o => row('balance', `${M[o.kid].n} ${vb(M[o.kid], 'يعترض', 'تعترض')} على قرار`, rwSub(o.kid, o.sub).t, { a: 'go:obj-decide:' + o.id }))) : ''}
    ${sec('المحافظ')}${W.map(id => { const k = S.kid[id], fz = rwFz(id); return `<button class="card fx" data-a="go:wallet-admin:${id}">${av(M[id])}<div class="grow"><b>${pname(M[id])}</b><div class="sm muted">${fz ? 'محفظة مجمّدة منذ بلوغ 13' : `سلسلة ${k.streak ? rwDy(k.streak) : 'لم تبدأ'} · إضافي اليوم ${k.spent} من ${S.redeemCap} د`}</div></div><b style="font-size:calc(20px*var(--ts))">${k.pts}</b>${coin()}</button>`; }).join('')}
    ${can('rewards.wallet.view', 'khaled') ? `<button class="card fx" data-a="go:wallet-admin:khaled">${av(M.khaled)}<div class="grow"><b>${pname(M.khaled)}</b><div class="sm muted">${rwFz('khaled') ? `رصيد مجمّد ${rwPt(S.kid.khaled.pts)}` : 'لا محفظة للمراهقين'} · إضافي اليوم ${S.kid.khaled.spent} من ${S.redeemCap} د</div></div>${chip(rwFz('khaled') ? 'مجمّد' : 'بلا نقاط', 'ol')}</button>` : ''}
    ${G ? rwGive('') : ''}
    ${own ? sec('القواعد') + list(row('tune', 'قواعد المكافآت', `حد اليوم ${S.redeemCap} د · مكافأة السلسلة ${R.bonus ? R.bonus + ' نقطة' : 'بلا'}`, { a: 'go:rw-settings' }), row('wand_stars', 'ما أودعه المساعد', ai ? `${ai === 1 ? 'إيداع واحد' : ai === 2 ? 'إيداعان' : ai + ' إيداعات'} اليوم · تُلغى في يومها` : 'لا إيداع اليوم', { a: 'go:rw-ai' })) : `<p class="sm muted c" style="margin-top:8px">قواعد المكافآت يضبطها أحمد.</p>`}`; },
});
surface('wallet-admin', {
  t: id => (M[id].role === 'teen' ? 'وقت ' + M[id].n + ' الإضافي' : 'محفظة ' + M[id].n), sys: 'S1-05', p: 'adult', a: ['layan'], req: '05:1,2,5,6,7,9,11,18',
  note: 'محفظة طفل واحد كما يراها وليّه: الرصيد، الوقت الإضافي اليوم، السلسلة، ثم الحركات بدليلها. المنح لمن يملك صلاحيته، والسجل لمن يملك عرضه. المحفظة المجمّدة عند بلوغ 13 تبقى ظاهرة برصيدها، وللأب أن يمنح منها وقتاً. المراهق بلا محفظة: يظهر وقته الإضافي ومنحه فقط.',
  r(id) { id = KIDS.includes(id) ? id : 'layan'; const R = RW(), k = S.kid[id], m = M[id], teen = m.role === 'teen', fz = rwFz(id), L = R.led[id] || [], canL = can('rewards.ledger.view', id), canG = can('rewards.grant.create', id), Q = can('rewards.time_request.decide', id) ? S.reqs.filter(r => r.kid === id && r.st === 'PENDING') : [];
    if (!can('rewards.wallet.view', id)) return empty('lock_person', 'لا تملك عرض هذه المحفظة', 'اطلب من أحمد صلاحية «رؤية نقاط الأطفال».');
    const top = teen && !fz ? callout(`لا محفظة للمراهقين: ${m.n} لا يكسب نقاطاً ولا يصرفها. يطلب وقتاً إضافياً والقرار لك. ${why('rwteen')}`, 'nt', 'info')
      : `<div class="wallet ${fz ? 'fz' : ''}"><small>${fz ? 'رصيد مجمّد' : 'الرصيد'}</small><div class="big">${k.pts} ${coin()}</div><small>${fz ? 'محفوظ بلا كسب ولا صرف' : `يكفي ${rwMn(k.pts - k.pts % 10)} من الوقت الإضافي`}</small></div>${fz ? callout(`${teen ? 'بلغ' : 'بلغت'} ${m.n} 13 سنة فجُمّدت المحفظة. الرصيد لا يُصادَر، ولك أن تمنح منه وقتاً إضافياً حتى ينتهي. ${why('rwteen')}`, 'nt', 'ac_unit') : ''}`;
    return `${top}
    ${canG ? rwGive(id) : ''}
    ${Q.length ? list(Q.map(r => row('more_time', `${vb(m, 'يطلب', 'تطلب')} ${rwMn(r.min)} الآن`, appOf(id, r.app).n, { a: 'go:time-decide:' + r.id, v: chip('ينتظرك', 'wa') }))) : ''}
    ${rwMeter(id, 0)}
    ${rwHas(id) ? list(row('local_fire_department', 'السلسلة', R.frz[id].on ? 'مجمّدة اليوم' : R.day[id] ? 'يوم اليوم محسوب' : 'لم تُعتمد مهمة اليوم بعد', { a: 'go:streak:' + id, v: k.streak ? rwDy(k.streak) : 'لم تبدأ' })) : ''}
    ${teen && !L.length ? '' : canL ? sec('الحركات', L.length > 5 ? 'الكل' : '', 'go:rw-ledger:' + id) + (L.length ? list(L.slice(0, 5).map(e => rwRow(id, e, 0))) : empty('history', 'لا حركات بعد', 'تظهر عند أول مهمة معتمدة أو منحة.')) : `<p class="sm muted c" style="margin-top:8px">سجل الحركات يحتاج صلاحية «رؤية سجل النقاط».</p>`}`; },
});

/* ============ S05-04 منح نقاط ============ */
const RW_GQ = ['خُلق حسن', 'اجتهاد في الدراسة', 'مساعدة في البيت'];
surface('grant-points', {
  kind: 'sheet', t: 'منح نقاط', sys: 'S1-05', p: 'adult', a: ['layan'], req: '05:6,18',
  note: 'S05-04. مكافأة فورية بلا مهمة، بسقف 60 نقطة للمرة الواحدة، مع سبب يراه الطفل. التراجع خلال عشر ثوانٍ يلغيها بقيد ظاهر في السجل، وبعدها يلغيها المالك من تفصيل الحركة في يومها. للأطفال أصحاب المحافظ فقط. دون اتصال تُحفظ وتُرسل لاحقاً.',
  r(kid) { const W = RWK().filter(id => rwHas(id) && can('rewards.grant.create', id));
    if (!W.length) return `<h4>لا محفظة تُمنح الآن</h4><p class="d">منح النقاط للأطفال دون 13 سنة ممن تملك صلاحية المنح لهم.</p>${btn('حسناً', 'close', 'sec')}`;
    const g = S.gp = S.gp || { kid: W.includes(kid) ? kid : W[0], n: 10, why: '' }; if (!W.includes(g.kid)) g.kid = W[0]; const m = M[g.kid];
    return `<h4>امنح نقاطاً</h4><p class="d">تدخل محفظة ${m.n} وتبقى فيها، و${vb(m, 'يحوّلها', 'تحوّلها')} وقتاً متى ${vb(m, 'شاء', 'شاءت')}. ${vb(m, 'يراها', 'تراها')} مع السبب. أقصى ما يُمنح في المرة 60 نقطة.</p>${can('rewards.grant.create', g.kid) ? `<p style="margin:-6px 0 10px">${btn(`${vb(m, 'يحتاج', 'تحتاج')} وقتاً الآن؟ امنح وقتاً بدل النقاط`, 'rwSwap:time', 'txt', 'more_time')}</p>` : ''}
    ${W.length > 1 ? `<div class="chips" style="margin-bottom:12px">${W.map(id => `<button class="chip ${g.kid === id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px 0 4px" data-a="gpSet:kid:${id}">${av(M[id], 'sm')}&nbsp;${M[id].n}</button>`).join('')}</div>` : ''}
    <div class="card flat"><div class="stepper"><button data-a="gpSet:n:${g.n - 5}" aria-label="أقل" ${g.n <= 5 ? 'disabled' : ''}>${ic('remove')}</button><b>${g.n}<small>نقطة = ${rwMn(g.n)} وقتاً</small></b><button data-a="gpSet:n:${g.n + 5}" aria-label="أكثر" ${g.n >= 60 ? 'disabled' : ''}>${ic('add')}</button></div></div>
    <div class="fld"><span>السبب (${vb(m, 'يراه', 'تراه')} ${m.n})</span><div class="chips" style="margin-bottom:8px">${RW_GQ.map((x, i) => `<button class="chip ${g.why === x ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="gpSet:why:${i}">${x}</button>`).join('')}</div><input id="gpW" maxlength="60" placeholder="أو اكتب سبباً آخر" value="${RW_GQ.includes(g.why) ? '' : g.why}"></div>
    ${offline() ? callout('أنت غير متصل. تُحفظ المنحة وتصل المحفظة عند عودة الاتصال.', 'nt', 'cloud_off') : ''}${btn(`امنح ${m.n} ${rwPt(g.n)}`, 'gpGo', '', 'stars')}`; },
});
/* ============ REQ-011 منح وقت مباشر ============ */
surface('grant-time', {
  kind: 'sheet', t: 'منح وقت مباشر', sys: 'S1-05', p: 'adult', a: ['layan'], req: '05:10,11 10:12',
  note: 'منح مباشر بلا نقاط: يضاف إلى تطبيق واحد، ينتهي عند منتصف الليل، ويُحسب من الحد اليومي نفسه، فالمدد المعروضة لا تتجاوز ما بقي منه. للمراهق أيضاً لأنه وقت لا نقاط. إن كان للابن رصيد مجمّد فللأب أن يخصم المنحة منه.',
  r(kid) { const K = KIDS.filter(id => can('rewards.grant.create', id)); if (!K.length) return `<h4>لا تملك منح الوقت</h4>${btn('حسناً', 'close', 'sec')}`;
    const g = S.gt = S.gt || { kid: K.includes(kid) ? kid : K[0], n: 15 }; if (!K.includes(g.kid)) g.kid = K[0];
    const m = M[g.kid], k = S.kid[g.kid], ap = S.apps[g.kid].filter(a => a.act === 'LIMIT'), cl = rwCapLeft(g.kid), O = [10, 15, 30, 60].filter(n => n <= cl), fz = rwFz(g.kid) && k.pts > 0; g.app = ap.some(a => a.id === g.app) ? g.app : (ap[0] || {}).id; if (!O.includes(g.n)) g.n = O[Math.min(1, O.length - 1)];
    return `<h4>امنح وقتاً إضافياً</h4><p class="d">دقائق تضاف الآن إلى تطبيق واحد وتنتهي عند منتصف الليل. لا تدخل المحفظة، وتُحسب من حد اليوم. ${why('extra')}</p>
    <div class="chips" style="margin-bottom:10px">${K.map(id => `<button class="chip ${g.kid === id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px 0 4px" data-a="gtSet:kid:${id}">${av(M[id], 'sm')}&nbsp;${M[id].n}</button>`).join('')}</div>
    ${!ap.length ? callout(`لا تطبيق له حدّ وقت عند ${m.n}. الوقت الإضافي يضاف إلى تطبيق محدود فقط.`, 'nt', 'info') : `<div class="chips" style="margin-bottom:12px">${ap.map(a => `<button class="chip ${g.app === a.id ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" aria-pressed="${g.app === a.id}" data-a="gtSet:app:${a.id}">${ic(a.i)}${a.n}</button>`).join('')}</div>
    ${O.length ? seg(O.map(n => [n, n + ' د']), g.n, 'gtSet:n') : callout(`${vb(m, 'أخذ', 'أخذت')} ${m.n} اليوم كل الوقت الإضافي (${S.redeemCap} دقيقة). لتمنح أكثر ارفع الحد اليومي.${can('rewards.settings.edit') ? `<div style="margin-top:8px">${btn('غيّر الحد', 'go:ctl-edit:cap:' + g.kid, 'sm sec')}</div>` : ''}`, 'wa', 'hourglass_top')}
    <p class="sm muted c">${vb(m, 'أخذ', 'أخذت')} اليوم ${k.spent} من ${S.redeemCap} دقيقة إضافية</p>
    ${fz && O.length ? list(row('ac_unit', 'اخصمها من الرصيد المجمّد', `في المحفظة المجمّدة ${rwPt(k.pts)}`, { tg: !!g.fz, ta: 'gtSet:fz:' + (g.fz ? 0 : 1) })) : ''}
    ${offline() && O.length ? callout('أنت غير متصل. يُحفظ المنح ويصل جهاز الطفل عند عودة الاتصال.', 'nt', 'cloud_off') : ''}${O.length ? btn(`امنح ${m.n} ${rwMn(g.n)}`, 'gtGo', '', 'more_time') : btn('حسناً', 'close', 'sec')}`}
    ${rwHas(g.kid) ? `<p class="c" style="margin:8px 0 0">${btn(`تريد مكافأة ${vb(m, 'يدّخرها', 'تدّخرها')}؟ امنح نقاطاً`, 'rwSwap:points', 'txt', 'stars')}</p>` : ''}`; },
});

/* ============ S05-08 قرار طلب الوقت ============ */
const RW_SWAP = ['قراءة 15 دقيقة', 'ترتيب الغرفة', 'مساعدة في المطبخ'];
surface('time-decide', {
  kind: 'sheet', t: 'قرار طلب الوقت', sys: 'S1-05', p: 'adult', a: ['r0'], req: '05:10,11,12,13,14 10:12 09:17',
  note: 'S05-08. ثلاثة قرارات: منح وقت بلا نقاط، أو رفض مع مهمة بديلة تظهر عند الطفل فوراً بقيمتها، أو رفض فقط. المدد لا تتجاوز ما بقي من الحد اليومي. تظهر محفظة الطفل ليعرف الأب أنه يستطيع الصرف بنفسه. طلب سبق القرار عليه يعرض نتيجته الأولى. المراهق بلا مهمة بديلة لأن مهامه بلا نقاط.',
  r(id) {
    const r = S.reqs.find(x => x.id === id); if (!r) return `<h4>لا يوجد طلب معلّق</h4><p class="d">شغّل رحلة «نفد الوقت» من الاستوديو، أو انتقل إلى ليان واطلب وقتاً من شاشة الحظر.</p>`;
    const kid = r.kid, k = M[kid], a = appOf(kid, r.app), cl = rwCapLeft(kid), wal = rwHas(kid), td = S.td && S.td.id === id ? S.td : null;
    if (r.st !== 'PENDING') return `<h4>سبق القرار على هذا الطلب</h4><p class="d">${r.st === 'GRANTED' ? `مُنح ${k.n} ${rwMn(r.got)} لتطبيق ${a.n}.` : r.st === 'EXPIRED' ? 'انتهى اليوم قبل القرار، فسقط الطلب وحده.' : r.task ? `رُفض الطلب وأُسندت مهمة «${r.task}» بدلاً منه.` : 'رُفض الطلب.'}${r.by ? ` القرار من ${r.by}.` : ''}</p>${btn('حسناً', 'close', 'sec')}`;
    if (td) return `<h4>مهمة بدل الوقت</h4><p class="d">يُرفض الطلب، وتظهر المهمة عند ${k.n} فوراً بقيمتها. حين تُعتمد تدخل نقاطها المحفظة و${vb(k, 'يصرفها', 'تصرفها')} وقتاً متى ${vb(k, 'شاء', 'شاءت')}.</p>
      <div class="fld"><span>المهمة</span><div class="chips">${RW_SWAP.map((x, i) => `<button class="chip ${td.t === x ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="rwTdSet:t:${i}">${x}</button>`).join('')}</div></div>
      <div class="fld"><span>قيمتها · ${rwPt(td.pts)} = ${rwMn(td.pts)} وقتاً</span>${seg([[5, '5'], [10, '10'], [15, '15'], [25, '25']], td.pts, 'rwTdSet:pts')}</div>
      <div class="btns">${btn('رجوع', 'rwTdBack', 'sec')}${btn('أسند المهمة', 'rwTdGo', '', 'add_task')}</div>`;
    const O = [...new Set([10, 15, 30, 60, r.min])].filter(n => n <= cl).sort((x, y) => x - y), pick = O.includes(r.min) ? r.min : O[O.length - 1];
    return `<div class="fx" style="margin-bottom:10px">${av(k)}<div><h4>${k.n} ${vb(k, 'يطلب', 'تطلب')} ${rwMn(r.min)}</h4><span class="sm muted">${a.n} · استُخدم ${a.used} من ${a.lim || S.kid[kid].quota} د اليوم</span></div></div>
    ${r.msg ? `<div class="card flat sm">«${r.msg}»</div>` : ''}
    <div class="card flat rwkv"><div><span>إضافي اليوم</span><b>${S.kid[kid].spent} من ${S.redeemCap} د</b></div>${wal ? `<div><span>في ${vb(k, 'محفظته', 'محفظتها')}</span><b>${rwPt(S.kid[kid].pts)}</b></div>` : `<div><span>النقاط</span><b>بلا محفظة</b></div>`}</div>
    ${O.length ? `<p class="d">الوقت الممنوح يضاف إلى هذا التطبيق فقط، وينتهي عند منتصف الليل، ولا يفتحه أثناء النوم أو المدرسة. ${why('extra')}</p><div class="btns" style="margin-bottom:8px">${O.map(n => btn(`${n} د`, `reqGrant:${id}:${n}`, n === pick ? '' : 'ton')).join('')}</div>` : callout(`${vb(k, 'أخذ', 'أخذت')} ${k.n} اليوم كل الوقت الإضافي (${S.redeemCap} دقيقة). لتمنح أكثر ارفع الحد اليومي.${can('rewards.settings.edit') ? `<div style="margin-top:8px">${btn('غيّر الحد', 'go:ctl-edit:cap:' + kid, 'sm sec')}</div>` : ''}`, 'wa', 'hourglass_top')}
    ${wal && can('tasks.create', kid) ? btn('ارفض وأسند مهمة بدلاً منه', `rwTdTask:${id}`, 'sec', 'add_task') + '<div class="gap"></div>' : ''}${btn('ارفض فقط', `reqDeny:${id}`, 'txt')}`;
  },
});

/* ============ قرار الأب على اعتراض ============ */
const RW_NOQ = ['المهمة لم تكتمل كما طُلب', 'الدليل لا يُظهر الإنجاز', 'نتحدث عنها مساءً'];
surface('obj-decide', {
  kind: 'sheet', t: 'قرار على اعتراض', sys: 'S1-05', p: 'adult', a: [''], req: '05:5,18 09:17',
  note: 'الاعتراض يصل المالك بطاقة في «يتطلب انتباهك». يرى القرار الأصلي وسببه ودليله وكلام الطفل، ثم يقبل أو يرفض. القبول يعيد الحق: تُعتمد المهمة وتودَع نقاطها، أو تعود النقاط الملغاة. الرفض يلزمه سبب يقرؤه الطفل. القرار يحتاج اتصالاً.',
  r(oid) { const R = RW(), o = R.obj.find(x => x.id === oid) || R.obj.find(x => x.st === 'PENDING') || R.obj[0];
    if (!o) return `<h4>لا اعتراض ينتظرك</h4><p class="d">حين يعترض أحد الأبناء على مهمة لم تُعتمد أو نقاط أُلغيت يصلك هنا.</p>${btn('حسناً', 'close', 'sec')}`;
    const s = rwSub(o.kid, o.sub), k = M[o.kid], wal = rwHas(o.kid), d = S.od && S.od.id === o.id ? S.od : null;
    const eff = s.ty === 'rev' ? `تعود ${rwPt(s.pts)} إلى ${vb(k, 'محفظته', 'محفظتها')}.` : wal && s.pts ? `تُعتمد المهمة وتودَع ${rwPt(s.pts)} في ${vb(k, 'محفظته', 'محفظتها')}.` : 'تُسجَّل المهمة منجزة. لا نقاط لأن المراهق بلا محفظة.';
    const head = `<div class="fx" style="margin-bottom:10px">${av(k)}<div><h4>${k.n} ${vb(k, 'يعترض', 'تعترض')} على قرار</h4><span class="sm muted">${o.at}</span></div></div><div class="card flat rwkv"><div><span>القرار</span><b>${s.t}</b></div><div><span>من قرره</span><b>${rwWho(s.by)}</b></div><div><span>السبب المسجَّل</span><b>${s.why}</b></div>${s.ev ? `<div><span>الدليل</span><b>${s.ev}</b></div>` : ''}</div><div class="card flat sm">«${o.txt}»</div>`;
    if (o.st !== 'PENDING') return `${head}${callout(o.st === 'ACCEPTED' ? `قُبل الاعتراض. ${o.eff}` : `رُفض الاعتراض. السبب: ${o.why}`, o.st === 'ACCEPTED' ? 'ok' : 'nt', o.st === 'ACCEPTED' ? 'check_circle' : 'reply')}${btn('حسناً', 'close', 'sec')}`;
    if (!can('rewards.objection.decide')) return `${head}<p class="sm muted c">القرار على الاعتراض لأحمد وحده.</p>`;
    if (d) return `<h4>سبب الرفض</h4><p class="d">${vb(k, 'يقرؤه', 'تقرؤه')} ${k.n} كما تكتبه. جملة هادئة تكفي.</p><div class="chips" style="margin-bottom:8px">${RW_NOQ.map((x, i) => `<button class="chip ${d.why === x ? 'in' : 'ol'}" style="min-height:40px;padding:0 12px" data-a="rwOdSet:${i}">${x}</button>`).join('')}</div><label class="fld"><span>أو اكتب سبباً آخر</span><input id="odW" maxlength="80" value="${RW_NOQ.includes(d.why) ? '' : d.why}"></label><div class="btns">${btn('رجوع', 'rwOdBack', 'sec')}${btn('ارفض الاعتراض', 'rwObjNo:' + o.id)}</div>`;
    return `${head}${callout(`إن قبلت: ${eff}`, 'nt', 'visibility')}${offline() ? callout('القرار على الاعتراض يحتاج اتصالاً.', 'wa', 'cloud_off') : `<div class="btns">${btn('ارفضه مع السبب', 'rwOdStep:' + o.id, 'sec')}${btn('اقبل الاعتراض', 'rwObjYes:' + o.id, 'ok', 'check')}</div>`}`; },
});

/* ============ S05-07 قواعد المكافآت (للمالك) ============ */
surface('rw-settings', {
  t: 'قواعد المكافآت', sys: 'S1-05', p: 'adult', req: '05:4,7,9,10,17 09:8',
  note: 'S05-07. كل ما يضبطه المالك في مكان واحد: الحد اليومي للوقت الإضافي، مكافأة السلسلة، مصادر النقاط، شدة الاحتفال. وما لا يتغيّر معروض ثابتاً بسببه: سعر الصرف، انتهاء الوقت عند منتصف الليل، لا نقاط للمراهقين. قائمة المصادر فيها «المهام» وحدها في المرحلة 1، وكل نظام يُضاف لاحقاً يظهر مفتاحه هنا ويودِع في المحفظة نفسها.',
  r() { const R = RW();
    if (!can('rewards.settings.view')) return empty('lock_person', 'قواعد المكافآت لأحمد وحده', 'تستطيعين المنح والقرار على الطلبات بحسب صلاحياتك.');
    const fixed = t => chip(t, 'ol', 'lock');
    return `${sec('الوقت الإضافي')}${list(row('hourglass_top', 'الحد اليومي', 'أقصى وقت إضافي لكل ابن في اليوم، صرفاً أو منحاً', { a: 'go:ctl-edit:cap:layan', v: S.redeemCap + ' د' }), row('swap_horiz', 'سعر الصرف', `10 نقاط = 10 دقائق ${why('rwrate')}`, { v: fixed('ثابت') }), row('bedtime', 'نهاية الوقت الإضافي', 'منتصف الليل بتوقيت العائلة · ما لم يُستخدم لا يعود', { v: fixed('ثابت') }))}
    ${sec('السلسلة')}${list(row('local_fire_department', 'مكافأة السلسلة', 'تودَع كل سبعة أيام إنجاز متتالية', { a: 'go:rw-edit:bonus', v: R.bonus ? R.bonus + ' نقطة' : 'بلا' }), row('workspace_premium', 'الشارات', 'فضية 7 أيام · ذهبية 30 · ماسية 90', { v: fixed('ثابت') }), row('ac_unit', 'تجميد السلسلة', 'من صفحة سلسلة كل طفل · مرتان في السلسلة', { a: 'go:streak:layan' }))}
    ${sec('من أين تأتي النقاط')}${list(row('task_alt', 'المهام', R.src.tasks ? 'كل مهمة معتمدة تودِع نقاطها' : 'متوقف: المهام تُعتمد بلا نقاط', { tg: R.src.tasks, ta: 'rwSrc:tasks' }), row('redeem', 'منح الأهل', 'مكافأة بلا مهمة · حتى 60 نقطة في المرة', { v: fixed('دائم') }))}
    ${sec('من يسند ويتحقق')}${list(row('groups', 'البالغون', 'أنت، ومن أعطيته صلاحية المهام والمنح', { a: 'go:family' }), row('wand_stars', 'المساعد', S.aiKill ? 'متوقف الآن: لا يتحقق ولا يودِع' : 'يتحقق من الإنجاز ويودِع النقاط بتفويضك · تلغي إيداعه في يومه', { a: 'go:ai' }))}
    ${sec('الاحتفال')}${list(row('celebration', 'شدة الاحتفال', RW_CELE[R.cele][1], { a: 'go:rw-edit:cele', v: RW_CELE[R.cele][0] }))}
    ${sec('ثوابت')}${list(row('person', 'لا نقاط للمراهقين', `من بلغ 13 تُجمَّد محفظته برصيدها ${why('rwteen')}`, { v: fixed('ثابت') }), row('stars', 'النقاط لا تنتهي', 'تبقى في المحفظة حتى تُصرف', { v: fixed('ثابت') }))}`; },
});
const RW_ED = {
  bonus: { t: 'مكافأة السلسلة', d: 'نقاط تودَع في المحفظة كل سبعة أيام إنجاز متتالية.', o: [[0, 'بلا'], [25, '25'], [50, '50'], [75, '75'], [100, '100']], cur: () => RW().bonus, set: v => { RW().bonus = +v; }, lab: v => (+v ? v + ' نقطة' : 'بلا مكافأة'), def: 50,
    fx: v => (+v ? `كل سبعة أيام متتالية تودِع ${v} نقطة، أي ${rwMn(+v)} من الوقت الإضافي. تبدأ من المكافأة القادمة.` : 'السلسلة والشارات تبقى، بلا نقاط إضافية.') },
  cele: { t: 'شدة الاحتفال', d: 'ما يظهر للطفل عند كل كسب. يحترم دائماً إعداد «تقليل الحركة» في الجهاز.', o: Object.entries(RW_CELE).map(([k, v]) => [k, v[0]]), cur: () => RW().cele, set: v => { RW().cele = v; }, lab: v => RW_CELE[v][0], def: 'full',
    fx: v => RW_CELE[v][1] + '.' },
};
surface('rw-edit', {
  kind: 'sheet', t: 'تعديل قاعدة مكافآت', sys: 'S1-05', p: 'adult', a: ['bonus'], req: '05:7 09:8',
  note: 'ورقة التعديل نفسها التي في مركز التحكم: القيمة الآن ومصدرها، معاينة أثر القيمة الجديدة بجملة، ثم حفظ صريح مع تراجع وسطر في السجل. التراجع يعيد القيمة السابقة ولا يمس دفتر النقاط.',
  r(key) { const c = RW_ED[key] || RW_ED.bonus, kk = RW_ED[key] ? key : 'bonus', cur = c.cur(), d = S.rwD = (S.rwD && S.rwD.k === kk ? S.rwD : { k: kk, v: cur }), ch = String(d.v) !== String(cur);
    return `<h4>${c.t}</h4><p class="d">${c.d} يسري على كل الأطفال.</p><div class="card flat fx sb sm"><span>القيمة الآن</span><span><b>${c.lab(cur)}</b> ${chip(cur === c.def ? 'افتراضي' : 'الأب', 'ol', 'person')}</span></div>
    <div class="fld"><span>القيمة الجديدة</span>${seg(c.o, d.v, 'rwEdPick')}</div>${callout(c.fx(d.v), ch ? '' : 'nt', 'visibility')}
    ${offline() && ch ? callout('أنت غير متصل. يُحفظ التغيير هنا ويُرسل عند عودة الاتصال.', 'wa', 'cloud_off') : ''}<div class="btns">${btn('إلغاء', 'rwEdCancel', 'sec')}${btn(offline() ? 'احفظ · يُرسل لاحقاً' : 'احفظ', 'rwEdSave', ch ? '' : '" disabled="')}</div>`; },
});
surface('rw-ai', {
  t: 'ما أودعه المساعد', sys: 'S1-05', p: 'adult', req: '05:5,17,18',
  note: 'S05-09 قائمةً. المساعد يتحقق من إنجاز المهمة ثم يودِع نقاطها بتفويض الأب، وهذا استثناؤه الوحيد من قاعدة «لا يكافئ من تلقاء نفسه». كل إيداع هنا بدليله، والمالك يلغيه في يومه.',
  r() { const R = RW(), A = RWK().filter(id => can('rewards.ledger.view', id)).flatMap(id => R.led[id].filter(e => e.vf === 'ai').map(e => [id, e])).sort((x, y) => x[1].d - y[1].d);
    return `${callout(`المساعد يتحقق من الدليل ثم يودِع نقاط المهمة. ما لم يجزم به يحيله إليك ولا يودِع شيئاً. ${why('rwverify')}`, 'nt', 'wand_stars')}${A.length ? list(A.map(([id, e]) => row('task_alt', `${M[id].n}: ${e.t}`, `${rwWhen(e)} · ${e.ev}${e.rev ? ' · أُلغي' : ''}`, { a: `go:rw-move:${id}:${e.id}`, v: `<b class="rwv pos${e.rev ? ' off' : ''}">+${e.n}</b>`, chev: false }))) : empty('wand_stars', 'لا إيداع لمراجعته', 'حين يتحقق المساعد من مهمة ويودِع نقاطها تظهر هنا.')}${list(row('tune', 'ما يفعله المساعد بدلك', 'الصلاحيات والإيقاف الفوري', { a: 'go:ai' }))}`; },
});

/* ---------- لماذا؟ ---------- */
Object.assign(WHY, {
  rwgive: ['ما الفرق بين منح النقاط ومنح الوقت؟', '<b>النقاط</b> رصيد يدخل محفظة الطفل ويبقى فيها، ويحوّله وقتاً متى شاء. تناسب المكافأة على سلوك حسن.<br><br><b>الوقت</b> دقائق تضاف الآن إلى تطبيق تختاره، وتنتهي عند منتصف الليل. يناسب حاجة آنية، وهو طريق المراهق لأنه بلا محفظة.<br><br>كلاهما يظهر في سجل الطفل، ولك التراجع خلال عشر ثوانٍ.', 'S1-05 REQ-006 · REQ-011 · Q-272'],
  rwrate: ['لماذا السعر ثابت؟', 'كل 10 نقاط تساوي 10 دقائق دائماً، حتى يفهم الطفل قيمة ما يكسبه ولا يتغيّر عليه الحساب. ما تتحكم به أنت هو عدد نقاط كل مهمة والحد اليومي.', 'S1-05 REQ-008 · Q-111 · Q-279'],
  rwteen: ['لماذا لا نقاط للمراهقين؟', 'النقاط حافز للأطفال دون 13 سنة. المراهق تُدار مهامه بلا نقاط، ويطلب وقتاً إضافياً والقرار لوالده. من يبلغ 13 وفي محفظته رصيد يبقى رصيده محفوظاً ومجمّداً.', 'S1-05 §6 · Q-109 · Q-237'],
  rwverify: ['كيف يتحقق المساعد؟', 'يطابق الدليل المقدَّم بما طُلب في المهمة. إن كان واضحاً أودع النقاط وذكر الدليل في السجل، وإن شكّ أحال القرار إليك. إقرار الطفل وحده لا يودِع شيئاً. وكل إيداع منه تلغيه في يومه.', 'S1-05 REQ-005/017/018 · Q-110 · Q-167'],
});

/* ---------- الأفعال ---------- */
Object.assign(ACT, {
  rwTasks() { S.sheet = null; if (mode() === 'child') ACT.tab('c-home'); },
  blkRedeem() { const a = S.full && S.full.a && S.full.a[0]; S.full = null; S.rdA = ''; S.rdN = 10; S.sheet = { id: 'redeem', a: a ? [a] : [] }; },
  rdGo(aid, n) { n = +n; const id = kidId(), k = S.kid[id], a = appOf(id, aid);
    if (!rwHas(id) || n < 10 || n % 10 || n > k.pts || n > rwCapLeft(id)) return toast('تعذّر التحويل. راجعي الرصيد وحد اليوم.', null, 'error');
    rwPut(id, { k: 'spend', n: -n, t: `وقت إضافي لـ${a.n}`, app: aid, min: n }); rwTime(id, aid, n, 'REDEEM'); S.sheet = null; S.full = null; S.rdN = 10; S.rdA = '';
    const off = queue(`صرف ${n} نقطة لـ${a.n}`, 'S1-05'); rwCele(); toast(off ? `+${rwMn(n)} لـ${a.n} · يُسجَّل عند الاتصال` : `+${rwMn(n)} لـ${a.n} · حتى منتصف الليل`, null, off ? 'cloud_upload' : 'celebration'); },
  askGo(aid) { const id = kidId(), n = rwAskN(id); if (!n) return; if (S.reqs.some(r => r.kid === id && r.app === aid && r.st === 'PENDING')) { S.sheet = null; return; }
    S.reqs.push({ id: 'r' + Date.now(), kid: id, app: aid, min: n, msg: (($('#akM') || {}).value || '').trim(), st: 'PENDING' }); S.sheet = null; const off = queue('طلب وقت إضافي', 'S1-05');
    toast(off ? 'حُفظ طلبك · يُرسل عند الاتصال' : `وصل طلبك إلى ${rwDad()}`, null, off ? 'cloud_upload' : 'send'); },
  reqGrant(id, min) {
    const r = S.reqs.find(x => x.id === id); if (!r || r.st !== 'PENDING') return toast('سبق القرار على هذا الطلب', null, 'info'); min = +min;
    const a = appOf(r.kid, r.app); if (min > rwCapLeft(r.kid)) return toast(`بقي من حد اليوم ${rwMn(rwCapLeft(r.kid))} فقط`, null, 'error');
    r.st = 'GRANTED'; r.got = min; r.by = me().n; r.seen = 0; const un = rwTime(r.kid, r.app, min, 'DECISION'), e = rwHas(r.kid) ? rwPut(r.kid, { k: 'time', n: 0, min, app: r.app, by: me().id }) : null; S.sheet = null; S.td = null;
    const off = queue(`منح ${min} د لـ${M[r.kid].n}`, 'S1-05');
    audit(`مُنح${vb(M[r.kid], '', 'ت')} ${M[r.kid].n} ${min} دقيقة إضافية لتطبيق ${a.n}`, 'rewards.time_request.decide');
    toast(off ? 'محفوظ · يصل جهاز الطفل عند عودة الاتصال' : `مُنحت ${rwMn(min)} · تنتهي عند منتصف الليل`, () => { r.st = 'PENDING'; un(); if (e) { const L = RW().led[r.kid]; L.splice(L.indexOf(e), 1); } render(); }, off ? 'cloud_upload' : 'check_circle');
  },
  reqDeny(id, withTask) {
    const r = S.reqs.find(x => x.id === id); if (!r || r.st !== 'PENDING') return toast('سبق القرار على هذا الطلب', null, 'info');
    const tk = withTask && typeof withTask === 'object' && withTask.t ? withTask :   /* العنصر المضغوط يصل آخر وسيط: ليس مهمة (Q-435) */ withTask === '1' || withTask === 1 || withTask === true ? { t: RW_SWAP[0], pts: 15 } : null;
    r.st = 'DENIED'; r.by = me().n; r.seen = 0; S.sheet = null; S.td = null;
    if (tk) { S.tasks.unshift({ id: 't' + Date.now(), kid: r.kid, t: tk.t, cat: tk.t === RW_SWAP[0] ? 'school' : 'home', pts: tk.pts, due: 'اليوم', proof: 'self', st: 'PENDING', swap: 1 }); r.task = tk.t; toast(`رُفض الطلب وأُسندت «${tk.t}» إلى ${M[r.kid].n}`, null, 'add_task'); } else toast('رُفض الطلب · يصل الطفل بلطف');
    queue('قرار طلب وقت', 'S1-05'); audit(`رُفض طلب وقت إضافي من ${M[r.kid].n}${tk ? ` مع إسناد «${tk.t}»` : ''}`, 'rewards.time_request.decide');
  },
  rwTdTask(id) { S.td = { id, t: RW_SWAP[0], pts: 15 }; },
  rwTdSet(k, v) { if (!S.td) return; if (k === 't') S.td.t = RW_SWAP[+v]; else S.td.pts = +v; },
  rwTdBack() { S.td = null; },
  rwTdGo() { const d = S.td; if (d) ACT.reqDeny(d.id, { t: d.t, pts: d.pts }); },
  rwSwap(to) { const kid = (to === 'time' ? S.gp : S.gt || {}).kid || 'layan'; S.gp = null; S.gt = null; S.sheet = { id: to === 'time' ? 'grant-time' : 'grant-points', a: [kid] }; },
  gpSet(k, v) { const g = S.gp; if (!g) return; const typed = (($('#gpW') || {}).value || '').trim(); if (typed) g.why = typed;
    if (k === 'why') g.why = g.why === RW_GQ[+v] ? '' : RW_GQ[+v]; else if (k === 'n') g.n = Math.min(60, Math.max(5, +v)); else g[k] = v; },
  gpGo() { const g = S.gp; if (!g) return; const typed = (($('#gpW') || {}).value || '').trim(), w = typed || g.why || '';
    if (!rwHas(g.kid) || !can('rewards.grant.create', g.kid)) return ACT.denied('rewards.grant.create'); if (!(g.n > 0 && g.n <= 60)) return toast('النقاط بين 1 و60 في المرة', null, 'error');
    const e = rwPut(g.kid, { k: 'gift', n: g.n, t: 'هدية', by: me().id, why: w }), kid = g.kid, n = g.n; S.sheet = null; S.gp = null; const off = queue(`منح ${n} نقطة لـ${M[kid].n}`, 'S1-05');
    audit(`مُنح${vb(M[kid], '', 'ت')} ${M[kid].n} ${n} نقطة${w ? ' · ' + w : ''}`, 'rewards.grant.create');
    toast(off ? `محفوظ · تصل محفظة ${M[kid].n} عند الاتصال` : `أُودعت ${rwPt(n)} في محفظة ${M[kid].n}`, () => { rwRev(kid, e.id, 'undo'); audit(`تراجع عن منح ${n} نقطة لـ${M[kid].n}`, 'rewards.grant.reverse'); render(); }, off ? 'cloud_upload' : 'check_circle'); },
  gtSet(k, v) { const g = S.gt; if (!g) return; g[k] = k === 'fz' || k === 'n' ? +v : v; if (k === 'kid') { g.fz = 0; g.app = ''; } },
  gtGo() { const g = S.gt; if (!g) return; const k = S.kid[g.kid], a = appOf(g.kid, g.app), n = g.n;
    if (!can('rewards.grant.create', g.kid)) return ACT.denied('rewards.grant.create'); if (!a || !(n > 0) || n > rwCapLeft(g.kid)) return toast(`بقي من حد اليوم ${rwMn(rwCapLeft(g.kid))} فقط`, null, 'error');
    const fz = g.fz && rwFz(g.kid); if (fz && n > k.pts) return toast(`في الرصيد المجمّد ${rwPt(k.pts)} فقط`, null, 'error');
    const un = rwTime(g.kid, g.app, n, 'GRANT'), e = rwHas(g.kid) || fz ? rwPut(g.kid, { k: 'time', n: fz ? -n : 0, min: n, app: g.app, by: me().id }) : null, kid = g.kid; S.sheet = null; S.gt = null;
    const off = queue(`منح ${n} د لـ${M[kid].n}`, 'S1-05'); audit(`مُنح${vb(M[kid], '', 'ت')} ${M[kid].n} ${n} د لتطبيق ${a.n}${fz ? ' من الرصيد المجمّد' : ''}`, 'rewards.grant.create');
    toast(off ? 'محفوظ · يصل الجهاز عند الاتصال' : `مُنحت ${rwMn(n)} لـ${a.n}`, () => { un(); if (e) { if (fz) k.pts += n; const L = RW().led[kid]; L.splice(L.indexOf(e), 1); } render(); }, off ? 'cloud_upload' : 'check_circle'); },
  rwFreeze(id) { const R = RW(), z = R.frz[id], k = S.kid[id], m = M[id];
    if (!can('rewards.streak.freeze')) return ACT.denied('rewards.streak.freeze');
    if (R.day[id]) return toast('يوم اليوم محسوب في السلسلة · لا حاجة للتجميد', null, 'info'); if (z.on || z.n >= 2 || !k.streak) return;
    confirmDlg(`تجميد سلسلة ${m.n} اليوم؟`, `إن لم تُعتمد ${vb(m, 'له', 'لها')} مهمة اليوم بقيت ${vb(m, 'سلسلته', 'سلسلتها')} ${rwDy(k.streak)} كما هي. هذا التجميد ${z.n + 1} من 2 في هذه السلسلة.`, 'جمّد اليوم', () => { z.on = 1; z.n += 1; const off = queue(`تجميد سلسلة ${m.n}`, 'S1-05'); audit(`جُمّدت سلسلة ${m.n} ليوم واحد`, 'rewards.streak.freeze'); toast(off ? 'محفوظ · يُرسل عند الاتصال' : `جُمّدت سلسلة ${m.n} حتى منتصف الليل`, () => { z.on = 0; z.n -= 1; render(); }, 'ac_unit'); render(); }); },
  rwRevAsk(id, lid) { const R = RW(), e = R.led[id].find(x => x.id === lid), k = S.kid[id], m = M[id]; if (!e || e.rev) return toast('سبق إلغاء هذا الإيداع', null, 'info');
    if (!can('rewards.grant.reverse')) return ACT.denied('rewards.grant.reverse'); if (offline()) return toast('الإلغاء يحتاج اتصالاً', null, 'cloud_off');
    const take = Math.min(e.n, k.pts);
    confirmDlg('إلغاء هذا الإيداع؟', `${take < e.n ? `في المحفظة ${rwPt(k.pts)} فقط، فيُخصم ${take} ولا ينزل الرصيد تحت الصفر.` : `تُخصم ${rwPt(e.n)} من محفظة ${m.n}.`}${e.k === 'task' ? ` وتعود مهمة «${e.t}» إلى قائمة ${vb(m, 'مهامه', 'مهامها')} لتُعاد.` : ''}${e.st1 ? ' وتنقص السلسلة يوماً لأن هذه المهمة هي التي مدّتها اليوم.' : ''} ${vb(m, 'يرى', 'ترى')} ${m.n} الإلغاء في ${vb(m, 'سجله', 'سجلها')} و${vb(m, 'يستطيع', 'تستطيع')} الاعتراض.`, 'ألغِ الإيداع', () => { const t = rwRev(id, lid, me().id); S.sheet = null; audit(`أُلغي إيداع ${e.n} نقطة لـ${m.n}: ${e.k === 'gift' ? 'هدية' : e.t}`, 'rewards.grant.reverse'); toast(`أُلغي الإيداع · خُصمت ${rwPt(t)}`, null, 'undo'); render(); }, true); },
  rwObQ(i) { S.obT = ($('#obT') || {}).value || ''; S.obQ = S.obQ === String(i) ? '' : String(i); },
  rwObjGo(sid) { const id = kidId(), R = RW(), typed = (($('#obT') || {}).value || '').trim(), q = S.obQ !== '' && S.obQ != null ? RW_OBQ[+S.obQ] : '', txt = [q, typed].filter(Boolean).join('. ');
    if (!txt) return toast(gx(id, 'اختر جملة أو اكتب ما حدث', 'اختاري جملة أو اكتبي ما حدث'), null, 'error'); if (R.obj.some(o => o.kid === id && o.sub === sid)) return;
    const off = queue('اعتراض على قرار', 'S1-05'); R.obj.push({ id: 'o' + (++R.n), kid: id, sub: sid, txt, st: 'PENDING', at: 'الآن', q: off ? 1 : 0 }); S.obQ = ''; S.obT = '';
    toast(off ? 'حُفظ اعتراضك · يُرسل عند الاتصال' : `وصل اعتراضك إلى ${rwDad()}`, null, off ? 'cloud_upload' : 'balance'); },
  rwOdStep(id) { S.od = { id, why: '' }; },
  rwOdSet(i) { if (S.od) S.od.why = S.od.why === RW_NOQ[+i] ? '' : RW_NOQ[+i]; },
  rwOdBack() { S.od = null; },
  rwObjYes(oid) { const R = RW(), o = R.obj.find(x => x.id === oid); if (!o || o.st !== 'PENDING') return toast('سبق القرار على هذا الاعتراض', null, 'info');
    if (!can('rewards.objection.decide')) return ACT.denied('rewards.objection.decide'); if (offline()) return toast('القرار يحتاج اتصالاً', null, 'cloud_off');
    const s = rwSub(o.kid, o.sub), m = M[o.kid], wal = rwHas(o.kid); o.st = 'ACCEPTED'; o.by = me().n; o.seen = 0; S.sheet = null;
    if (s.ty === 'rev') { rwPut(o.kid, { k: 'back', n: s.pts, t: s.t.replace(/^أُلغيت نقاط /, ''), by: me().id }); o.eff = `عادت ${rwPt(s.pts)} إلى محفظتك.`; }
    else if (wal && s.pts) { rwEarn(o.kid, { k: 'task', n: s.pts, t: s.task, as: 'ahmad', vf: me().id, ev: 'اعتُمدت بعد اعتراض مقبول' }); o.eff = `اعتُمدت «${s.task}» ودخلت ${rwPt(s.pts)} محفظتك.`; }
    else o.eff = `سُجّلت «${s.task}» منجزة.`;
    audit(`قُبل اعتراض ${m.n}: ${s.t}`, 'rewards.objection.decide'); toast(`قُبل الاعتراض · ${vb(m, 'يصله', 'يصلها')} الخبر الآن`, null, 'check_circle'); },
  rwObjNo(oid) { const R = RW(), o = R.obj.find(x => x.id === oid), d = S.od; if (!o || o.st !== 'PENDING' || !d) return;
    if (!can('rewards.objection.decide')) return ACT.denied('rewards.objection.decide'); if (offline()) return toast('القرار يحتاج اتصالاً', null, 'cloud_off');
    const w = (($('#odW') || {}).value || '').trim() || d.why; if (!w) return toast('اكتب سبب الرفض أو اختر جملة', null, 'error');
    o.st = 'REJECTED'; o.why = w; o.by = me().n; o.seen = 0; S.od = null; S.sheet = null; audit(`رُفض اعتراض ${M[o.kid].n}: ${rwSub(o.kid, o.sub).t}`, 'rewards.objection.decide'); toast('رُفض الاعتراض · يصل الطفل مع السبب'); },
  rwSrc(k) { const R = RW(); if (!can('rewards.settings.edit')) return ACT.denied('rewards.settings.edit');
    const flip = () => { R.src[k] = !R.src[k]; queue('مصادر النقاط', 'S1-05'); audit(R.src[k] ? 'أُعيد كسب النقاط من المهام' : 'أُوقف كسب النقاط من المهام', 'rewards.settings.edit'); toast(R.src[k] ? 'المهام تودِع نقاطها من جديد' : 'المهام تُعتمد بلا نقاط حتى تعيده', () => { R.src[k] = !R.src[k]; render(); }); };
    if (R.src[k]) confirmDlg('إيقاف كسب النقاط من المهام؟', 'تبقى المهام تُسند وتُعتمد، لكن لا تودِع نقاطاً حتى تعيد تشغيله. ما في المحافظ يبقى كما هو ويُصرف.', 'أوقف', () => { flip(); render(); }); else flip(); },
  rwEdPick(v) { if (S.rwD) S.rwD.v = isNaN(v) ? v : +v; },
  rwEdCancel() { S.rwD = null; S.sheet = null; },
  rwEdSave() { const d = S.rwD, c = d && RW_ED[d.k]; if (!c) return; if (!can('rewards.settings.edit')) return ACT.denied('rewards.settings.edit');
    const was = c.cur(); if (String(d.v) === String(was)) return; c.set(d.v); S.rwD = null; S.sheet = null;
    const off = queue(`${c.t}: ${c.lab(d.v)}`, 'S1-05'); audit(`عُدّلت ${c.t}: ${c.lab(was)} ← ${c.lab(d.v)}`, 'rewards.settings.edit');
    toast(off ? 'محفوظ · يُرسل عند عودة الاتصال' : `${c.t}: ${c.lab(d.v)}`, () => { c.set(was); render(); }, off ? 'cloud_upload' : 'check_circle'); },
});
