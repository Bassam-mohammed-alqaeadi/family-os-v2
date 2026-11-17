/* أسطح وضع الطفل والمراهق + شاشة الحظر. المحادثة في screens-chat.js، والمكافآت في screens-rewards.js. */
'use strict';
/* ============ الطفل (القالب القياسي 7–12) ============ */
const kidId = () => PERSONA[S.persona].m;
const timeMood = k => { const l = left(k), w = fmOf(k) ? '' : winNow(k); return fmOf(k) ? ['wb_sunny', 'وقت حر الآن', 'استمتعي!'] : w === 'mode' ? [modeAct(k).i, modeAct(k).n, 'حتى ' + S.pm[k].until] : w === 'sleep' ? ['bedtime', 'حان وقت النوم', 'تصبحين على خير'] : w === 'school' ? ['school', 'وقت الدراسة', 'تطبيقات الدراسة مفتوحة'] : l > 45 ? ['wb_sunny', 'بقي وقت كثير', `${l} دقيقة`] : l > 0 ? ['hourglass_top', 'بقي وقت قليل', `${l} دقيقة`] : ['bedtime', 'انتهى وقت اليوم', 'نكمل غداً']; };
surface('c-home', {
  t: 'الرئيسية', sys: 'S1-01', p: 'child', bar: false, req: '01:2,4,7,15,18 10:25 05:2,7 06:6', st: 'un',
  note: 'UNKNOWN (Q-090): محتوى القالب القياسي غير محسوم — هذا اقتراح. الفكرة: «مسار اليوم» يحوّل المهام إلى محطات، والوقت المتبقي يُعرض بصورة ودّية لا برقم ضاغط. لا شاشات إدارية، لا مشتريات، لا روابط خارجية.',
  r() { const id = kidId(), m = M[id], k = S.kid[id], T = S.tasks.filter(t => t.kid === id && t.st !== 'CANCELLED' && t.st !== 'EXPIRED'), md = timeMood(id), pc = left(id) / (k.quota + k.extra);
    const cele = T.find(t => t.cele); if (cele) { cele.cele = 0; setTimeout(() => { rwCele(); if (RW().cele !== 'off') notif('أحسنتِ يا ' + m.n + '!', `اعتُمدت «${cele.t}» · +${cele.pts} نقاط`, 'celebration'); }, 250); }
    const req = S.reqs.find(r => r.kid === id && r.st !== 'PENDING' && !r.seen);
    return `<header class="bar"><button data-a="go:c-me" aria-label="ملفي" style="margin-inline-start:8px">${av(m)}</button><h2>أهلاً ${m.n}</h2><button class="chip go" data-a="tab:c-rewards" style="min-height:48px;padding:0 12px;font-size:15px">${coin()}&nbsp;${k.pts}</button>${sosBtn()}</header>
    <div class="khero">${ring(fmOf(id) ? 1 : pc, 92, 9, '#F3DC9B', ic(md[0]), '#ffffff2e')}<div style="position:relative;z-index:1"><h4>${md[1]}</h4><p>${md[2]}</p></div></div>
    ${req ? rwReqCard(id, req) : ''}
    <div class="fx sb" style="margin:4px 4px 6px"><b style="font-size:calc(18px*var(--ts)*var(--tk))">مسار اليوم</b>${rwHas(id) ? `<button class="chip ac" style="min-height:48px;padding:0 12px" data-a="go:streak">${ic('local_fire_department')}${k.streak ? rwDy(k.streak) + (k.streak > 2 && k.streak < 11 ? ' متتالية' : '') : 'ابدئي سلسلتك'}</button>` : ''}</div>
    <div class="path">${T.map(t => { const st = t.st === 'APPROVED' ? 'done' : t.st === 'SUBMITTED' ? 'wait' : ''; return `<button class="stop ${st}" style="--kc:${st ? '' : tkCat(t.cat)[2]}" data-a="go:c-task:${t.id}"><span class="nd">${ic(st === 'done' ? 'check' : st === 'wait' ? 'hourglass_top' : tkCat(t.cat)[1])}</span><span class="tx" style="text-align:start"><b>${t.t}</b><span>${st === 'done' ? 'تمّت' : st === 'wait' ? 'عند بابا للمراجعة' : t.note ? ic('reply') + 'أعيدي المحاولة' : coin() + ' ' + t.pts + ' نقاط'}</span></span></button>`; }).join('')}</div>
    ${tkNext(id)}
    ${chWidget(1)}
    <div class="fx sb" style="margin:14px 4px 8px"><b style="font-size:calc(18px*var(--ts)*var(--tk))">تطبيقاتي</b></div>
    <div class="qa" style="grid-template-columns:repeat(4,1fr)">${S.apps[id].map(a => { const dc = decide(id, a.id), ok = dc.ok; return `<button data-a="openApp:${a.id}" style="${ok ? '' : 'opacity:.6'}"><span class="qi">${ic(ok ? a.i : dc.why === 'blocked' || dc.why === 'mode' ? 'lock' : dc.why === 'sleep' ? 'bedtime' : dc.why === 'school' ? 'school' : 'hourglass_empty')}</span><span>${a.n}</span></button>`; }).join('')}</div>`; },
});
/* مهمة الطفل وتسليمها (S1-06): في screens-tasks.js */
surface('c-me', {
  t: 'ملفي', sys: 'S1-01', p: 'kid', req: '01:2,5,6,15,18 02:17',
  note: 'لا شاشات إدارية في وضع الطفل. قسم «للأهل» خلف بوابة الوالدين. صف «وضع الجهاز» يشرح ثبات الوضع بلا طلب رقم سري (ACC-019).',
  r() { const m = me(); return `<div class="c" style="padding:6px 0 12px">${av(m, 'xl')}<div class="b" style="font-size:calc(22px*var(--ts));margin-top:8px">${m.n}</div></div>${list(row('location_on', 'موقعي', 'أين أنا، ومن يرى مكاني', { a: 'go:map' }), row('handshake', 'ما اتفقنا عليه أنا وبابا', 'ماذا يرى بابا وماذا لا يرى', { a: 'go:consent-view' }), row('notifications', 'الإشعار الدائم', 'يعرض وقتك المتبقي', { a: 'go:persist' }), row('wand_stars', 'المساعد وأنا', 'ماذا فعل المساعد بخصوصي', { a: 'go:ai-mine' }), row('palette', 'لوني وصورتي', '', { a: 'askDad' }), row('front_hand', 'شيء ما أزعجني', 'أخبر بابا الآن', { a: 'reportGo', ic: 'var(--accent)' }))}${sec('للأهل')}${list(row('lock', 'إعدادات هذا الجهاز', 'تحتاج الرقم السري لبابا', { a: 'kidGate' }), row('mobile', `وضع الجهاز: ${mode() === 'teen' ? 'مراهق' : 'طفل'}`, 'ثابت · لا يتحول إلى وضع الأهل', { a: 'modeWhy' }))}${list(row('description', 'الشروط والخصوصية', '', { a: 'go:legal' }))}`; },
});
surface('kid-admin', {
  t: 'للأهل — هذا الجهاز', sys: 'S1-01', p: 'kid', req: '01:5,6,18,23 02:15 10:18,23',
  note: 'خلف بوابة الوالدين. «أوقف القواعد مؤقتاً» هو معنى «الخروج من وضع الطفل»: وضع حر بمدة محددة ينتهي وحده، لأن وضع الجهاز ثابت في المرحلة 1 (S1-01 REQ-018 · S1-10 Q-143). فك الإقران وإلغاء التثبيت يحتاجان اتصالاً لأن الخادم يتحقق منهما.',
  r() { const off = offline(), need = off ? ' · يحتاج اتصالاً' : ''; return callout('فُتحت بالرقم السري. تُغلق تلقائياً عند مغادرة الصفحة.', 'ok', 'lock_open') + list(row('lock_open', fmOf(kidId()) ? 'أعد القواعد الآن' : 'أوقف القواعد مؤقتاً', fmOf(kidId()) ? `وضع حر · بقي ${fmOf(kidId())} د` : 'وضع حر لمدة تختارها، ثم تعود القواعد وحدها' + need, { a: 'kidExit' }), row('pin', 'تغيير الرقم السري', 'على هذا الجهاز فقط', { a: 'kidPin' })) + sec('إزالة') + list(row('link_off', 'فكّ إقران هذا الجهاز', 'ليُقرن بعائلة أخرى' + need, { a: 'kidUnpair', ic: 'var(--danger)' }), row('delete_forever', 'إلغاء تثبيت التطبيق', 'يتوقف كل شيء على هذا الجهاز' + need, { a: 'kidUnpair', ic: 'var(--danger)' })); },
});
surface('kid-free', {
  kind: 'sheet', t: 'إيقاف القواعد مؤقتاً', sys: 'S1-10', p: 'kid', req: '10:18,19,20 01:6',
  note: 'المدخل الثاني للوضع الحر (Q-397 ب-02): من جهاز الطفل نفسه بعد رقم الأب السري. يخص طفل هذا الجهاز وحده. المدة يختارها الأب ولا مدة جاهزة: بلا مدة لا تفعيل. ينتهي وحده، ويُسجَّل، ولافتته تظهر هنا وفي لوحة الأهل.',
  r() { const n = S.fmN || 0; return `<h4>أوقف القواعد مؤقتاً</h4><p class="d">تتوقف حدود الوقت والحظر على هذا الجهاز للمدة التي تختارها، ثم تعود وحدها. زر الاستغاثة يبقى يعمل.</p>${durPick('fmN')}${btn(n ? `أوقف القواعد ${durTxt(n)}` : 'اختر المدة أولاً', n ? 'kidFreeGo' : 'noop', n ? '' : 'sec" disabled="', 'lock_open')}`; },
});

Object.assign(ACT, {
  reqSeen(id) { S.reqs.find(r => r.id === id).seen = 1; },
  /* فتح تطبيق: القرار من محرك التقييم نفسه (أول نوع مطابق في ترتيب الأب يفوز — S1-10 REQ-011) */
  openApp(aid) { const id = kidId(), a = appOf(id, aid), dc = decide(id, aid);
    if (!dc.ok) return void (S.full = { id: 'block', a: [aid] });
    if (dc.why === 'free') return toast('يفتح ' + a.n + ' · وقت حر');
    if (dc.why === 'app' && a.act === 'LIMIT') { const rem = a.lim - a.used;
      if (rem > 5) { const d = rem - 5; a.used += d; S.kid[id].used += d; if (!S.warned[id + ':' + aid]) { S.warned[id + ':' + aid] = 1; S.sheet = { id: 'warn5', a: [aid] }; } return; }
      S.kid[id].used += rem; a.used = a.lim; S.full = { id: 'block', a: [aid] }; return; }
    toast('يفتح ' + a.n); },
  reportGo() { toast('وصلت رسالتك إلى بابا. أنت بأمان.', null, 'front_hand'); },
  askDad() { toast(mode() === 'teen' ? 'يعدّلها والدك من جهازه' : 'اطلب من بابا', null, 'front_hand'); },
  kidGate() { gate('إعدادات الجهاز للأهل', () => go('kid-admin')); },
  kidExit() { const id = kidId(); if (fmOf(id)) { delete S.fm[id]; S.audit.unshift({ t: `أُلغي الوضع الحر لـ${M[id].n} من ${gateDev()}`, w: 'أحمد', at: 'الآن', k: 'protection.free_mode.activate', kid: id, ty: 'free', d: 0 }); return toast('عادت القواعد'); } if (offline()) return toast('إيقاف القواعد يحتاج اتصالاً · الخادم يتحقق منه', null, 'cloud_off'); S.fmN = 0; S.sheet = { id: 'kid-free', a: [] }; },
  kidFreeGo() { const id = kidId(), n = S.fmN; if (!n) return; S.sheet = null; S.fm[id] = n; delete S.pm[id]; S.fmN = 0; S.audit.unshift({ t: `فُعّل الوضع الحر لـ${M[id].n} ${durTxt(n)} من ${gateDev()}`, w: 'أحمد', at: 'الآن', k: 'protection.free_mode.activate', kid: id, ty: 'free', d: 0 }); toast(`القواعد متوقفة ${durTxt(n)}`, null, 'lock_open'); },
  kidPin() { pinSetOpen('change'); },
  kidUnpair() { if (offline()) return toast('يحتاج اتصالاً · الخادم يتحقق من هذه العملية', null, 'cloud_off'); gate('فكّ الإقران فعل حساس', () => confirmDlg('فكّ إقران هذا الجهاز؟', 'تتوقف القواعد عن العمل هنا، ويبقى ملف الطفل وقواعده محفوظة لتتبعه إلى جهازه القادم.', 'فكّ الإقران', () => { setPersona('guest'); render(); }, true), 'stepup'); },
});

/* ============ القالب المبسّط (دون 7) ============ */
surface('m-home', {
  t: 'بيت', sys: 'S1-01', p: 'mini', bar: false, req: '01:2,4,7 05:2 06:6', st: 'un',
  note: 'UNKNOWN (Q-090): محتوى القالب المبسّط غير محسوم — اقتراح. بلاطات كبيرة (هدف لمس 72–88)، نص ×1.35، أيقونة مع كل كلمة، زر «بيت» واحد، والوقت بصورة شمس/قمر بلا أرقام. اسم كل بلاطة يُنطق بمقطع مسجّل ثابت عند لمسها (Q-411)، بلا نطق آلي؛ النموذج لا يشغّل صوتاً.',
  r() { const id = 'yusuf', k = S.kid[id], T = S.tasks.filter(t => t.kid === id && t.st === 'PENDING'), md = left(id) > 20 ? ['wb_sunny', '#C8A24A'] : left(id) > 0 ? ['wb_twilight', '#CF5B2C'] : ['bedtime', '#142749'];
    return `<header class="bar"><span style="margin-inline-start:8px">${av(M[id])}</span><h2>أهلاً يوسف</h2>${sosBtn()}</header>
    <div class="tiles"><div class="tile w" style="--kc:${md[1]}">${ic(md[0])}<span>${!fmOf(id) && winNow(id) === 'sleep' ? 'وقت النوم' : left(id) > 20 ? 'وقت اللعب' : left(id) > 0 ? 'قرب ينتهي' : 'نكمل بكرة'}</span></div>
    <button class="tile" style="--kc:#1F6B3B" data-a="go:m-task">${ic('task_alt')}<span>مهامي${T.length ? ` (${T.length})` : ''}</span></button>
    <button class="tile" style="--kc:#C8A24A" data-a="go:m-stars">${ic('star-fill')}<span>نجومي</span></button>
    <button class="tile" style="--kc:#2457A6" data-a="go:m-chat">${ic('forum')}<span>كلّم أهلي</span></button>
    <button class="tile" style="--kc:#7A3E65" data-a="openAppM">${ic('smart_display')}<span>أفلامي</span></button>
    <button class="tile w" style="--kc:#CF5B2C" data-a="reportGo">${ic('front_hand')}<span>شيء أزعجني</span></button></div>`; },
});
Object.assign(ACT, {
  openAppM() { if (!decide('yusuf', 'ytk').ok) return void (S.full = { id: 'block', a: ['ytk'] }); toast('يفتح YouTube Kids'); },
});

/* ============ المراهق (13–17) ============ */
surface('t-home', {
  t: 'الرئيسية', sys: 'S1-01', p: 'teen', req: '01:2,4,7,15 10:25 06:6 03:15 07:3', st: 'un',
  note: 'UNKNOWN (Q-090): محتوى قالب المراهق غير محسوم — اقتراح. نبرة راشدة بلا تلعيب: أرقام مباشرة، شفافية كاملة عمّا يُشارَك، واستقلالية في إدارة مهامه.',
  r() { const id = 'khaled', k = S.kid[id], T = S.tasks.filter(t => t.kid === id && t.st !== 'CANCELLED' && t.st !== 'EXPIRED'), d = dateAr(), e = ENF[k.enf];
    const N = pnNew('khaled');
    return `<p class="sm muted" style="margin:0 4px 10px">${d.g} · ${d.h}</p>${N.length ? `<div class="callout in">${ic('key')}<div><b>${N[0].sn}</b><br>يسري الآن.<div style="margin-top:8px">${btn('عرض', 'go:t-me', 'sm sec')} ${btn('تمّ', 'pnSeen', 'sm txt')}</div></div></div>` : ''}<div class="card fx">${ring(left(id) / k.quota, 84, 8, 'var(--primary)', `<b style="font-size:22px;line-height:1">${left(id)}</b><span class="xs muted" style="position:absolute;bottom:18px">د</span>`)}<div class="grow"><b>${fmOf(id) ? 'وقت حر الآن' : winNow(id) === 'sleep' ? 'وقت نوم الآن' : winNow(id) === 'school' ? 'وقت مدرسة الآن' : `بقي ${left(id)} دقيقة اليوم`}</b><div class="sm muted">استخدمت ${k.used} من ${k.quota} · ${nextEdge(id)}</div></div></div>
    ${k.enf !== 'active' ? `<div class="callout wa">${ic('gpp_maybe')}<div><b>خدمة الوصول متوقفة على جهازك</b><br>قد يكون السبب تحديث النظام. أعد تفعيلها ليعود كل شيء طبيعياً. والدك يعلم بذلك.<div style="margin-top:8px">${btn('أعد التفعيل', 'teenFix', 'sm')}</div></div></div>` : ''}
    ${(r => (r ? rwReqCard(id, r) : ''))(S.reqs.find(r => r.kid === id && r.st !== 'PENDING' && !r.seen))}
    ${sec('مهامي', 'جديدة', 'teenTask')}${list(T.map(t => row(tkCat(t.cat)[1], t.t, t.due, { ic: tkCat(t.cat)[2], a: t.st === 'PENDING' && t.by === id ? 'teenDone:' + t.id : 'go:c-task:' + t.id, chev: false, v: t.st === 'PENDING' && t.by === id ? `<span class="btn sm ton">أنجزتها</span>` : t.st === 'PENDING' ? chip(t.note ? 'أُعيدت' : 'من والدك', t.note ? 'wa' : 'ol', t.note ? 'reply' : '') : chip(TST[t.st][0], TST[t.st][1], TST[t.st][2]) })))}
    ${tkNext(id)}
    ${chWidget(1)}
    ${sec('تطبيقاتي')}${list(S.apps[id].map(a => row(a.i, a.n, a.act === 'LIMIT' ? `${Math.max(0, a.lim - a.used)} دقيقة متبقية` : a.study ? 'متاح دائماً' : 'مسموح', { a: 'openApp:' + a.id, chev: false, v: a.act === 'LIMIT' ? `${a.used}/${a.lim}` : '' })))}
    ${sec('ما يُشارَك الآن')}<div class="card"><div class="chips">${chip('موقعك · ' + (offline() ? 'آخر موقع معروف' : 'الآن'), 'in', 'location_on')}${chip('وقت الشاشة', 'in', 'hourglass_top')}${chip('محادثات العائلة', 'in', 'forum')}</div><button class="why" style="margin-top:8px" data-a="tab:t-me">ماذا يرى أهلي بالضبط؟</button></div>`; },
});
surface('t-me', {
  t: 'أنا', sys: 'S1-03', p: 'teen', req: '03:15 02:17 08:12 01:5,6,18,21',
  note: 'شفافية للمراهق: الفئات التي تُتابَع لا المحتوى، وحالة المصنّف، وما فُوّض له. لا مشتريات ولا روابط خارجية.',
  r() { const m = me(); return `<div class="card fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n}</b><div class="sm muted">مراهق · 15 سنة</div></div></div>
    ${sec('ما يراه أهلي')}${list(row('hourglass_top', 'وقت الشاشة', 'المدة لكل تطبيق، لا ما تفعله داخله', { v: chip('يُشارَك', 'in') }), row('location_on', 'موقعي', 'الآن وسجل 7 أيام', { a: 'go:map', v: chip('يُشارَك', 'in') }), row('forum', 'محادثات العائلة', 'مرئية لوالدك', { v: chip('يُشارَك', 'in') }), row('chat_error', 'المصنّف الآلي للرسائل', (S.clsTeen ?? true) ? 'مفعّل · ينبّه والدك عند خطر فقط' : 'أوقفه والدك', { v: chip((S.clsTeen ?? true) ? 'مفعّل' : 'متوقف', (S.clsTeen ?? true) ? 'ok' : 'ol') }), row('travel_explore', 'المواقع', 'فئة الموقع، لا كل صفحة', { v: chip('يُشارَك', 'in') }))}
    ${sec('ما سُمح لي به')}${list(row('task_alt', `أنشئ مهامي بنفسي${pnNew('khaled').length ? ' ' + chip('جديد', 'in') : ''}`, S.teenTasks ? `مهامك أنت فقط · ${unTxt(S.teenUn).replace('تلغيها', 'يلغيها والدك')}` : 'لم يسمح بها والدك بعد', { v: S.teenTasks ? chip('مسموح', 'ok', 'check') : (S.preq.find(q => q.k === 'teen' && q.st === 'pending') ? chip('بانتظار والدك', 'wa', 'pending') : btn('اطلب', 'preqSend:teen', 'sm txt')) }), row('supervisor_account', 'الإشراف على إخوتي', 'لا يُفوَّض للمراهق', { v: ic('lock'), c: 'dis' }))}
    ${list(row('handshake', 'ما اتفقنا عليه', '', { a: 'go:consent-view' }), row('wand_stars', 'المساعد وأنا', 'ما فعله المساعد بخصوصي', { a: 'go:ai-mine' }), row('balance', 'ناقش قراراً', 'مهمة لم تُعتمد؟ اكتب لوالدك ما حدث', { a: 'go:objection' }), row('translate', 'اللغة والعرض', '', { a: 'go:display' }), row('lock', 'إعدادات الجهاز للأهل', 'تحتاج الرقم السري', { a: 'kidGate' }))}`; },
});
Object.assign(ACT, {
  teenFix() { tamBack('khaled', 'من جهاز خالد'); toast('عادت الخدمة · شكراً'); },
});
surface('learn', {
  t: () => (mode() === 'teen' ? 'تعلّم' : 'العب وتعلّم'), sys: 'S1-10', p: 'kid', req: '10:7,24 09:9', st: 'pr',
  note: 'مقترح: التبويب في التنقل المعتمد ومحتواه التعليمي في المرحلة 3. في المرحلة 1 يعرض تطبيقات الطفل التي سمح بها الأب فقط: الدراسة المفتوحة دائماً، ثم اللعب بوقته المتبقي. لا بلاطات «قريباً» (G-002).',
  r() { const id = kidId(), A = S.apps[id].filter(a => a.act !== 'BLOCK'), st = A.filter(a => a.study), pl = A.filter(a => !a.study), teen = mode() === 'teen';
    return `${st.length ? sec(teen ? 'تطبيقات الدراسة' : 'أتعلّم') + list(st.map(a => row(a.i, a.n, 'مفتوح حتى في وقت المدرسة', { a: 'openApp:' + a.id, v: chip('متاح', 'ok', 'check') }))) : ''}${pl.length && !teen ? sec('ألعب') + list(pl.map(a => row(a.i, a.n, a.act === 'LIMIT' ? `${Math.max(0, a.lim - a.used)} دقيقة متبقية اليوم` : 'مسموح', { a: 'openApp:' + a.id, v: a.act === 'LIMIT' && a.used >= a.lim ? chip('انتهى وقته', 'ol') : '' }))) : ''}${!st.length && (teen || !pl.length) ? empty('school', 'لا تطبيقات هنا بعد', teen ? 'حين يحدد والدك تطبيقات الدراسة تظهر هنا.' : 'اطلب من بابا أن يضيف تطبيقاتك.') : ''}`; },
});

