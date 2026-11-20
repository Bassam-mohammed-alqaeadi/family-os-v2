
const mentorCard = () => `<div class="card fx" style="background:linear-gradient(135deg,var(--primary-soft),var(--gold-soft));border-color:var(--gold)"><svg width="48" height="48" viewBox="0 0 64 64" aria-hidden="true" style="flex:none"><circle cx="32" cy="32" r="30" fill="#1F3A6B"/><circle cx="32" cy="28" r="14" fill="#FCFAED"/><circle cx="27" cy="26" r="2.2" fill="#0A152A"/><circle cx="37" cy="26" r="2.2" fill="#0A152A"/><path d="M26 33 Q32 38 38 33" stroke="#CF5B2C" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M18 16 Q32 6 46 16" stroke="#C8A24A" stroke-width="4" fill="none" stroke-linecap="round"/></svg><div class="grow"><b>المرشد الصغير معك</b><div class="sm muted">اختر نشاطاً ممتعاً أو افتح تطبيقات الدراسة المسموحة لك.</div></div></div>`;
ACT.tmTog = k => { S.tmExp = S.tmExp || {}; S.tmExp[k] = !S.tmExp[k]; };
/* أسطح وضع الطفل والمراهق + شاشة الحظر. المحادثة في screens-chat.js، والمكافآت في screens-rewards.js. */
'use strict';
/* ============ الطفل (القالب القياسي 7–12) ============ */
const kidId = () => PERSONA[S.persona].m;
/* طلب مفتوح من الابن عند أهله (مساعدة / تغيير صورته) */
const kidAsk = (id, k) => S.alerts.find(a => a.k === k && a.kid === id && a.open);
const timeMood = k => { const l = left(k), w = fmOf(k) ? '' : winNow(k); return fmOf(k) ? ['wb_sunny', 'وقت حر الآن', M[k].f ? 'استمتعي!' : 'استمتع!'] : w === 'mode' ? [modeAct(k).i, modeAct(k).n, 'حتى ' + S.pm[k].until] : w === 'sleep' ? ['bedtime', 'حان وقت النوم', M[k].f ? 'تصبحين على خير' : 'تصبح على خير'] : w === 'school' ? ['school', 'وقت الدراسة', 'تطبيقات الدراسة مفتوحة'] : l > 45 ? ['wb_sunny', 'بقي وقت كثير', `${l} دقيقة`] : l > 0 ? ['hourglass_top', 'بقي وقت قليل', `${l} دقيقة`] : ['bedtime', 'انتهى وقت اليوم', 'نكمل غداً']; };
surface('c-home', {
  t: 'الرئيسية', sys: 'S1-01', p: 'child', bar: false, req: '01:2,4,7,15,18 10:25 05:2,7 06:6',
  note: 'قالب الطفل: لكل ابن دون 13، ومنهم من هو دون 7 (Q-426). اعتمده المالك في 2026-11-18 (Q-426، يغلق Q-090). الفكرة: «مسار اليوم» يحوّل المهام إلى محطات، والوقت المتبقي يُعرض بصورة ودّية لا برقم ضاغط. لا شاشات إدارية، لا مشتريات، لا روابط خارجية.',
  r() { const id = kidId(), m = M[id], k = S.kid[id], T = S.tasks.filter(t => t.kid === id && t.st !== 'CANCELLED' && t.st !== 'EXPIRED'), md = timeMood(id), pc = left(id) / (k.quota + k.extra);
    const cele = T.find(t => t.cele); if (cele) { cele.cele = 0; setTimeout(() => { rwCele(); if (RW().cele !== 'off') { notif('أحسنتِ يا ' + m.n + '!', `اعتُمدت «${cele.t}» · +${cele.pts} نقاط`, 'celebration'); const p = $('#app .bar .chip.go'); if (p) p.classList.add('pls'); } }, 250); }
    const req = S.reqs.find(r => r.kid === id && r.st !== 'PENDING' && !r.seen);
    return `<header class="bar"><button data-a="go:c-me" aria-label="ملفي" style="margin-inline-start:8px">${av(m)}</button><h2>أهلاً ${m.n}</h2><button class="chip go" data-a="tab:c-rewards" style="min-height:48px;padding:0 12px;font-size:15px">${coin()}&nbsp;${k.pts}</button>${sosBtn()}</header>
    <div class="khero">${ring(fmOf(id) ? 1 : pc, 92, 9, '#F3DC9B', ic(md[0]), '#ffffff2e')}<div style="position:relative;z-index:1"><h4>${md[1]}</h4><p>${md[2]}</p></div></div>
    ${req ? rwReqCard(id, req) : ''}${(S.tamP || {})[id] ? `<div class="card tnsh krn">${ic('gpp_maybe')}<span><b>بابا يذكّرك</b><small>الحماية على جهازك تحتاج إعادة تشغيل. أعطيه الجهاز حين تريانه.</small></span></div>` : ''}${krCard(id)}
    <div class="fx sb" style="margin:4px 4px 8px"><b style="font-size:calc(18px*var(--ts)*var(--tk))">مسار اليوم</b>${rwHas(id) ? `<button class="chip ac" style="min-height:48px;padding:0 12px" data-a="go:streak">${ic('local_fire_department')}${k.streak ? rwDy(k.streak) + (k.streak > 2 && k.streak < 11 ? ' متتالية' : '') : 'ابدئي سلسلتك'}</button>` : ''}</div>
    <div class="path">${T.map(t => { const st = t.st === 'APPROVED' ? 'done' : t.st === 'SUBMITTED' ? 'wait' : ''; return `<button class="stop ${st}" style="--kc:${st ? '' : tkCat(t.cat)[2]}" data-a="go:c-task:${t.id}"><span class="nd">${ic(st === 'done' ? 'check' : st === 'wait' ? 'hourglass_top' : tkCat(t.cat)[1])}</span><span class="tx" style="text-align:start"><b>${t.t}</b><span>${st === 'done' ? 'تمّت' : st === 'wait' ? 'عند بابا للمراجعة' : t.note ? ic('reply') + 'أعيدي المحاولة' : coin() + ' ' + t.pts + ' نقاط'}</span></span></button>`; }).join('')}</div>
    ${tkNext(id)}
    ${chWidget(1)}
    <div class="fx sb" style="margin:16px 4px 8px"><b style="font-size:calc(18px*var(--ts)*var(--tk))">تطبيقاتي</b></div>
    <div class="qa" style="grid-template-columns:repeat(4,1fr)">${S.apps[id].map(a => { const dc = decide(id, a.id), ok = dc.ok; return `<button data-a="openApp:${a.id}" style="${ok ? '' : 'opacity:.6'}"><span class="qi">${ic(ok ? a.i : dc.why === 'blocked' || dc.why === 'mode' ? 'lock' : dc.why === 'sleep' ? 'bedtime' : dc.why === 'school' ? 'school' : 'hourglass_empty')}</span><span>${a.n}</span></button>`; }).join('')}</div>
    ${helpCard()}`; },
});
/* ============ «قواعدي» (Q-435): ما يضعه الأهل يظهر عند الابن ============
   كل تغيير يحفظه الأب أو البالغ المفوَّض في قواعد ابن بعينه يُكتب في سجل الحماية باسمه (xaud)،
   ومن السجل نفسه تُبنى بطاقة «قاعدة تغيّرت» في رئيسية الابن وقائمة «آخر التغييرات» هنا: لا نسخة ثانية تُنسى. */
const krWho = w => { const tn = mode() === 'teen'; return w === 'أحمد' ? (tn ? 'والدك' : 'بابا') : w === 'سارة' ? (tn ? 'والدتك' : 'ماما') : w; };
const krTxt = (a, id) => a.t.replace(new RegExp('\\s*(لـ|ل)' + M[id].n + '(?![\\u0621-\\u064A])', 'g'), '');
const krLog = id => S.audit.filter(a => (a.kid || a.who) === id && /^protection\.(rule|schedule|filter|quota|priority|mode_preset|free_mode)/.test(a.k || '') && !a.deny && a.w !== 'النظام');
const krWait = id => !devOn(id) && (S.pendR[id] || 0) > 0;   /* جهاز الابن منقطع وتغيير ينتظره (S1-10 REQ-017): لا يُقال له «تغيّرت» قبل أن يستلمها */
const krNew = id => (krWait(id) ? [] : krLog(id).filter(a => a.at === 'الآن' && !a.ks));
const krCard = id => { const N = krNew(id); return N.length ? `<button class="card tnsh krn" data-a="go:my-rules">${ic('rule')}<span><b>${N.length === 1 ? 'قاعدة تغيّرت' : N.length + ' قواعد تغيّرت'}</b><small>${krWho(N[0].w)} · ${krTxt(N[0], id)}</small></span>${ic('chevron_right')}</button>` : ''; };
surface('my-rules', {
  t: 'قواعدي', sys: 'S1-10', p: 'kid', req: '10:17,25 01:15',
  note: 'للطفل والمراهق، قراءة فقط (Q-435): ما وضعه الأهل لجهازه بلغته هو: وقت اليوم، أوقات النوم والمدرسة، تطبيقاته وحدودها، والإنترنت. كل تغيير يحفظه الأب يظهر هنا فوراً، وله بطاقة «قاعدة تغيّرت» في الرئيسية حتى يضغط «فهمت». لا تعديل من هنا ولا شاشة إدارية (DS-SE-10): «الطفل يرى حالته في الغلاف بلا مفتاح». ومن أراد نقاش قاعدة يفتح محادثة والده.',
  r() { const id = kidId(), k = S.kid[id], tn = mode() === 'teen', dad = tn ? 'والدك' : 'بابا', N = krNew(id), Lg = krLog(id).slice(0, 4), W = S.sched[id], md = modeAct(id), fm = fmOf(id), q = qOf(id)[NOW.d], safe = wfFlagOf(id, 'safe'), dom = S.wdom[id];
    const an = a => (/[A-Za-z]/.test(a.n) ? `<span class="ltr">${a.n}</span>` : a.n);
    return `<p class="sub" style="text-align:start;margin-bottom:12px">ما وضعه أهلك لجهازك. يتغير من هاتف ${dad} فقط، وكل تغيير يظهر لك هنا.</p><div class="card blbal" style="margin-bottom:12px"><div class="g3"><div><b>${left(id)} د</b><span>باقي اليوم</span></div><div><b>${S.apps[id].filter(a=>a.act==='LIMIT').length}</b><span>تطبيقات بحدّ</span></div><div><b>${safe ? 'مفعّل' : 'متوقف'}</b><span>البحث الآمن</span></div></div></div>
    ${krWait(id) ? callout(`<b>جهازك غير متصل الآن</b><br>غيّر ${dad} شيئاً في قواعدك. ما تراه هنا يسري حين يتصل جهازك، وحتى ذلك الحين يعمل بقواعده السابقة.`, 'wa', 'cloud_off') : ''}
    ${N.length ? `<div class="card krnew">${ic('rule')}<div class="grow"><b>${N.length === 1 ? 'قاعدة تغيّرت' : N.length + ' قواعد تغيّرت'}</b>${N.map(a => `<div class="sm">${krWho(a.w)}: ${krTxt(a, id)}</div>`).join('')}</div>${btn('فهمت', 'krSeen', 'sm sec')}</div>` : ''}
    ${fm ? callout(`<b>وقت حر الآن</b><br>القواعد متوقفة، وتعود وحدها بعد ${fm} دقيقة.`, 'ok', 'lock_open') : md ? callout(`<b>${md.n} سارٍ الآن</b><br>حتى ${S.pm[id].until}، ثم تعود قواعدك كما هي.`, 'nt', md.i) : ''}
    ${sec('وقتي اليوم')}${list(row('hourglass_top', 'وقت الشاشة', `استخدمت ${k.used} من ${q + k.extra} دقيقة`, { chev: false, v: `<b>بقي ${left(id)} د</b>` }), k.extra ? row('more_time', 'وقت إضافي اليوم', 'من نقاطك أو من أهلك · ينتهي عند منتصف الليل', { chev: false, v: `+${k.extra} د` }) : '')}
    ${sec('أوقاتي')}${W.length ? list(W.map(w => row(WT[w.type][1], w.type === 'sleep' ? 'وقت النوم' : 'وقت المدرسة', `<span class="krt">${hm(t2m(w.s))} – ${hm(t2m(w.e))}</span> · ${daysTxt(w.days)}`, { chev: false }))) + `<p class="sm muted" style="margin:-2px 4px 0">${W.some(w => w.type === 'sleep') ? 'في وقت النوم لا يُفتح أي تطبيق، وزر الاستغاثة يعمل دائماً. ' : ''}${W.some(w => w.type === 'school') ? 'في وقت المدرسة تُفتح تطبيقات الدراسة فقط.' : ''}</p>` : `<div class="card flat c sm muted">لا وقت نوم ولا وقت مدرسة على جهازك الآن.</div>`}
    ${sec('تطبيقاتي')}${S.apps[id].length ? list(S.apps[id].map(a => row(a.i, an(a), a.act === 'BLOCK' ? 'لا يُفتح في أي وقت' : a.act === 'LIMIT' ? `حتى ${a.lim} دقيقة في اليوم` : a.study ? 'مفتوح دائماً، حتى في وقت المدرسة' : 'مسموح ضمن وقت اليوم', { chev: false, v: chip(a.act === 'BLOCK' ? 'محظور' : a.act === 'LIMIT' ? `${a.lim} د` : 'مسموح', a.act === 'BLOCK' ? 'da' : a.act === 'LIMIT' ? 'wa' : 'ok') }))) : `<div class="card flat c sm muted">تظهر تطبيقاتك هنا بعد اقتران جهازك.</div>`}
    ${sec('الإنترنت')}${list(row('travel_explore', 'البحث الآمن', safe ? 'يخفي النتائج غير اللائقة' : 'متوقف على جهازك', { chev: false, v: chip(safe ? 'مفعّل' : 'متوقف', safe ? 'ok' : 'ol') }), ...dom.map(x => row('public', `<span class="ltr">${x.d}</span>`, x.a === 'BLOCK' ? 'لا يُفتح' : x.a === 'ALLOW' ? 'مسموح دائماً' : `يُفتح، ويصل ${dad} تنبيه`, { chev: false, v: chip(x.a === 'BLOCK' ? 'محظور' : x.a === 'ALLOW' ? 'مسموح' : 'بتنبيه', x.a === 'BLOCK' ? 'da' : x.a === 'ALLOW' ? 'ok' : 'wa') })))}
    ${Lg.length ? sec('آخر التغييرات') + list(Lg.map(a => row('history', krTxt(a, id), `${krWho(a.w)} · ${a.at}`, { chev: false }))) : ''}
    ${list(row('forum', `اسأل ${dad} عن قاعدة`, 'تفتح محادثتك معه', { a: 'helpTalk:ahmad' }), row('visibility', tn ? 'ما يراه أهلي' : 'ماذا يرى بابا وماذا لا يرى', 'ما اتفقتما عليه عند إعداد جهازك', { a: 'go:consent-view' }))}`; },
});
/* مهمة الطفل وتسليمها (S1-06): في screens-tasks.js */
surface('c-me', {
  t: 'ملفي', sys: 'S1-01', p: 'kid', req: '01:2,5,6,15,18 02:17',
  note: 'لا شاشات إدارية في وضع الطفل. قسم «للأهل» خلف بوابة الوالدين. صف «وضع الجهاز» يشرح ثبات الوضع بلا طلب رقم سري (ACC-019).',
  r() { const m = me(), id = kidId(), ask = kidAsk(id, 'prof');
    /* ستة أبواب الطفل: [أيقونة، عنوان، شرح، فعل، شارة]. النص واحد في الشكلين. */
    const I = [['rule', 'قواعدي', 'وقتي، نومي، تطبيقاتي، والإنترنت', 'go:my-rules', krNew(id).length ? chip('جديد', 'in') : ''], ['location_on', 'موقعي', 'أين أنا، ومن يرى مكاني', 'go:map', ''], ['handshake', 'ما اتفقنا عليه أنا وبابا', 'ماذا يرى بابا وماذا لا يرى', 'go:consent-view', ''], ['notifications', 'الإشعار الدائم', 'يعرض وقتك المتبقي', 'go:persist', ''], ['wand_stars', 'المساعد وأنا', 'ماذا فعل المساعد بخصوصي', 'go:ai-mine', ''], ['palette', 'لوني وصورتي', ask ? 'وصل طلبك · يغيّرهما بابا من هاتفه' : 'اطلب من بابا أن يغيّرهما', 'askDad', ask ? chip('عند بابا', 'wa', 'pending') : '']];
    /* قالب الطفل (Q-449): بلاطات كبيرة بلون الطفل نفسه؛ «للأهل» يبقى قائمة هادئة. المراهق يبقى على القائمة. */
    const top = mode() === 'teen'
      ? `<div class="c" style="padding:6px 0 12px">${av(m, 'xl')}<div class="b" style="font-size:calc(24px*var(--ts));margin-top:8px">${m.n}</div></div>${list(...I.map(([i, t, s, a, c], k) => row(i, t + (k === 0 && c ? ' ' + c : ''), s, { a, v: k === 5 ? c : '' })), row('front_hand', 'أحتاج مساعدة', 'أكلّم أهلي، أو أخبرهم بما أزعجني', { a: 'go:kid-help', ic: 'var(--accent)' }))}`
      : `<div class="kme" style="--kc:${m.c}">${av(m, 'xl')}<b>${m.n}</b></div><div class="ktg" style="--kc:${m.c}">${I.map(([i, t, s, a, c]) => ktile(i, t, s, a, c)).join('')}</div>${helpCard()}`;
    return `${top}${sec('للأهل')}${list(row('lock', 'إعدادات هذا الجهاز', 'تحتاج الرقم السري لبابا', { a: 'kidGate' }), row('mobile', `وضع الجهاز: ${mode() === 'teen' ? 'مراهق' : 'طفل'}`, 'ثابت · لا يتحول إلى وضع الأهل', { a: 'modeWhy' }))}${list(row('description', 'الشروط والخصوصية', '', { a: 'go:legal' }))}`; },
});
/* بلاطة قالب الطفل (Q-449): زر مجسّم كمحطات «مسار اليوم»، ثم العنوان والشرح، وشارة في الزاوية. kc لون الزر، bar شريط اختياري. */
const ktile = (i, t, s, a, c = '', kc = '', bar = '') => `<button class="ktile" ${kc ? `style="--kc:${kc}"` : ''} data-a="${a}"><span class="nd">${ic(i)}</span><span class="tx"><b>${t}</b>${s ? `<span>${s}</span>` : ''}${bar}</span>${c ? `<i class="kc">${c}</i>` : ''}</button>`;
/* «أحتاج مساعدة» (child-mode-ui §10 · S1-07 §9): مدخل هادئ في آخر رئيسية الطفل والمراهق وفي ملفهما. غير زر الاستغاثة الطارئ. */
const helpCard = () => `<button class="card tnsh khelp" data-a="go:kid-help">${ic('front_hand')}<span><b>أحتاج مساعدة</b><small>أكلّم أهلي، أو أخبرهم بما أزعجني</small></span>${ic('chevron_right')}</button>`;
surface('kid-help', {
  kind: 'sheet', t: 'أحتاج مساعدة', sys: 'S1-01', p: 'kid', req: '01:2,7,15 07:7 08:1',
  note: 'للطفل والمراهق. ثلاثة أبواب بسيطة: أكلّم أحد والديّ (تفتح محادثته)، أو «شيء أزعجني» (رسالة قصيرة تصل الأب الآن بلا شرح)، أو «أنا في خطر» وهي الاستغاثة نفسها: تأكيد ثم عدّ 10 ثوانٍ يمكن الإلغاء خلاله (S1-07 REQ-007). لا لوم ولا تخويف في النص. تعمل دون اتصال إلا بدء محادثة جديدة.',
  r() { const tn = mode() === 'teen', dad = tn ? 'والدي' : 'بابا', mom = tn ? 'والدتي' : 'ماما';
    return `<h4>أحتاج مساعدة</h4><p class="d">اختر ما يناسبك الآن. أهلك معك.</p>
    ${list(row('forum', `أكلّم ${dad}`, 'تفتح محادثتك معه', { a: 'helpTalk:ahmad' }), row('forum', `أكلّم ${mom}`, 'تفتح محادثتك معها', { a: 'helpTalk:sara' }), row('front_hand', 'شيء أزعجني', `رسالة قصيرة تصل ${tn ? 'والدك' : 'بابا'} الآن · الشرح متى أردت`, { a: 'helpTell', ic: 'var(--accent)' }))}
    ${list(row('emergency_home', 'أنا في خطر', 'استغاثة تصل أهلك مع مكانك · 10 ثوانٍ للإلغاء', { a: 'helpSos', ic: 'var(--danger)' }))}`; },
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
  /* «شيء أزعجني» (S1-07 §9): تصل الأهل تنبيهاً عاجلاً يفتح محادثة الابن. بلا شرح مطلوب منه. */
  reportGo() { const id = kidId(), m = M[id], tn = mode() === 'teen'; if (!kidAsk(id, 'help')) S.alerts.unshift({ id: 'h' + (S.alerts.length + 1), k: 'help', kid: id, t: `${m.n} ${vb(m, 'يقول', 'تقول')}: شيء أزعجني`, s: `رسالة قصيرة بلا تفاصيل · ${vb(m, 'كلّمه', 'كلّمها')} بهدوء حين يناسبكما`, ago: 'الآن', p: 1, open: 1 }); queue('رسالة «شيء أزعجني»', 'S1-07'); toast(offline() ? `محفوظة · تصل ${tn ? 'والدك' : 'بابا'} عند عودة الاتصال` : `وصلت رسالتك إلى ${tn ? 'والدك' : 'بابا'}. أنت بأمان.`, null, 'front_hand'); },
  helpTalk(x) { ACT.dmStart(x); },
  helpTell() { S.sheet = null; ACT.reportGo(); },
  helpSos() { S.sheet = null; sosAsk(); },
  /* طلب تغيير اللون والصورة: يصل الأب تنبيهاً يفتح ملف الابن للتعديل (identity.child.profile.edit عند الأهل وحدهم). */
  askDad() { const id = kidId(), m = M[id], tn = mode() === 'teen'; if (kidAsk(id, 'prof')) return toast(`طلبك عند ${tn ? 'والدك' : 'بابا'} · يغيّرهما من هاتفه`, null, 'pending'); S.alerts.unshift({ id: 'h' + (S.alerts.length + 1), k: 'prof', kid: id, t: `${m.n} ${vb(m, 'يطلب', 'تطلب')} تغيير ${vb(m, 'لونه وصورته', 'لونها وصورتها')}`, s: 'يتغيران من ملف الطفل · يراهما أفراد العائلة فقط', ago: 'الآن', p: 3, open: 1 }); toast(`وصل طلبك إلى ${tn ? 'والدك' : 'بابا'}`, null, 'front_hand'); },
  krSeen() { krNew(kidId()).forEach(a => { a.ks = 1; }); },
  kidGate() { gate('إعدادات الجهاز للأهل', () => go('kid-admin')); },
  kidExit() { const id = kidId(); if (fmOf(id)) { delete S.fm[id]; S.audit.unshift({ t: `أُلغي الوضع الحر لـ${M[id].n} من ${gateDev()}`, w: 'أحمد', at: 'الآن', k: 'protection.free_mode.activate', kid: id, ty: 'free', d: 0 }); return toast('عادت القواعد'); } if (offline()) return toast('إيقاف القواعد يحتاج اتصالاً · الخادم يتحقق منه', null, 'cloud_off'); S.fmN = 0; S.sheet = { id: 'kid-free', a: [] }; },
  kidFreeGo() { const id = kidId(), n = S.fmN; if (!n) return; S.sheet = null; S.fm[id] = n; delete S.pm[id]; S.fmN = 0; S.audit.unshift({ t: `فُعّل الوضع الحر لـ${M[id].n} ${durTxt(n)} من ${gateDev()}`, w: 'أحمد', at: 'الآن', k: 'protection.free_mode.activate', kid: id, ty: 'free', d: 0 }); toast(`القواعد متوقفة ${durTxt(n)}`, null, 'lock_open'); },
  kidPin() { pinSetOpen('change'); },
  kidUnpair() { if (offline()) return toast('يحتاج اتصالاً · الخادم يتحقق من هذه العملية', null, 'cloud_off'); gate('فكّ الإقران فعل حساس', () => confirmDlg('فكّ إقران هذا الجهاز؟', 'تتوقف القواعد عن العمل هنا، ويبقى ملف الطفل وقواعده محفوظة لتتبعه إلى جهازه القادم.', 'فكّ الإقران', () => { setPersona('guest'); render(); }, true), 'stepup'); },
});


/* ============ المراهق (13–17) ============ */
/* ---------- المراهق: الرئيسية و«أنا» ----------
   واجهة أقرب للكبار (child-mode-ui §3.3): ترويسة كحلية برقم واحد واضح، ثم يومه مرتباً بالوقت (مهامه ومواعيد العائلة معاً)،
   ثم تطبيقاته بما بقي لكل منها، ثم سطر واحد يقول ما يراه أهله. لا تلعيب ولا نقاط. */
const tnT = t => (t.hm ? tkTm(t.hm) : ((t.due || '').match(/\d+:\d+ [صم]/) || [''])[0]);
const tnK = x => { const m = /(\d+):(\d+) ([صم])/.exec(x); return m ? ((+m[1] % 12) + (m[3] === 'م' ? 12 : 0)) * 60 + +m[2] : 1439; };
function tnDay(id, k) {
  return S.events.filter(e => (e.who === 'all' || e.who === id) && tkEvOn(e, k)).map(e => ({ e, tm: tkTm(e.hm) }))
    .concat(S.tasks.filter(t => t.kid === id && tkOn(t, k)).map(t => ({ t, tm: tnT(t) }))).sort((x, y) => tnK(x.tm) - tnK(y.tm));
}
function tnNext(id) {
  const today = tnDay(id, TK_TODAY).map(x => (x.e || x.t).id), out = [];
  for (let n = 1; n <= 7 && out.length < 3; n++) { const k = tkAdd(TK_TODAY, n); tnDay(id, k).forEach(x => { const i = (x.e || x.t).id; if (!today.includes(i) && !out.some(o => (o.e || o.t).id === i) && out.length < 3) out.push(Object.assign({ k }, x)); }); }
  return out;
}
/* خط «الآن» داخل يوم المراهق: يفصل ما مضى عمّا بقي، ويقول متى التالي. */
const tnIn = n => (n < 60 ? `بعد ${n} د` : `بعد ${Math.floor(n / 60)} س${n % 60 ? ` و${n % 60} د` : ''}`);
function tnAgenda(TD) {
  const i = TD.findIndex(x => tnK(x.tm) >= NOW.m), nx = i < 0 ? null : TD[i];
  const line = `<div class="agn"><i></i><b>الآن · ${hm(NOW.m)}</b><small>${nx ? `التالي ${tnIn(tnK(nx.tm) - NOW.m)}` : 'لا شيء بقي اليوم'}</small></div>`;
  const R = TD.map((x, j) => tnRow(x, TK_TODAY, i < 0 || j < i));
  R.splice(i < 0 ? R.length : i, 0, line); return R.join('');
}
function tnRow(x, k, past) {
  const day = k !== TK_TODAY, [hh, ap] = x.tm.split(' '), tm = `<span class="agt">${day ? `<small>${tkDayT(k).split(' ')[0]}</small><b class="s">${x.tm}</b>` : `<b>${hh || '—'}</b><small>${ap || ''}</small>`}</span>`;
  if (x.e) return `<div class="ag ${past ? 'ps' : ''}">${tm}<i style="--c:var(--accent)"></i><button class="agm" data-a="go:event:${x.e.id}"><b>${x.e.t}</b><span>${[x.e.who === 'all' ? 'العائلة كلها' : 'موعدك', x.e.loc].filter(Boolean).join(' · ')}</span></button><span class="age">${ic('event')}</span></div>`;
  const t = x.t, own = t.by === t.kid, c = tkCat(t.cat), rep = tkRepT(tkRR(t), tkWd(t)) || t.rep || '', once = tkRR(t) === 'none', done = t.st === 'APPROVED' && (!day || once), st = day && !once ? 'PENDING' : t.st;
  return `<div class="ag ${done ? 'dn' : ''}">${tm}<i style="--c:${done ? 'var(--success)' : c[2]}"></i><button class="agm" data-a="go:c-task:${t.id}"><b>${t.t}</b><span>${[own ? 'مهمة شخصية' : c[0], rep].filter(Boolean).join(' · ')}</span></button>${done ? `<span class="age ok">${ic('check_circle')}</span>` : st === 'PENDING' && own ? `<button class="agc" data-a="teenDone:${t.id}" aria-label="أنجزتها: ${t.t}">${ic('check')}</button>` : st === 'PENDING' ? chip(t.note ? 'أُعيدت' : 'من والدك', t.note ? 'wa' : 'ol', t.note ? 'reply' : '') : chip(TST[st][0], TST[st][1], TST[st][2])}</div>`;
}
surface('t-home', {
  t: 'الرئيسية', sys: 'S1-01', p: 'teen', bar: false, flush: true, hero: true, req: '01:2,4,7,15 10:25 06:6 03:15 07:3',
  note: 'قالب المراهق (Q-090 — اعتمده المالك من الشاشة، Q-417): واجهة أقرب للكبار بلا تلعيب. ترويسة برقم واحد (ما بقي من وقت اليوم) وحال اللحظة، ثم «يومي» مرتباً بالوقت يجمع مهامه ومواعيد العائلة وفيه خط «الآن» يقول متى التالي، ثم القادم، ثم تطبيقاته بما بقي لكل منها، ثم سطر واحد يقول ما يراه أهله. مهمته الشخصية ينجزها بلمسة، ومهمة والده تفتح ورقتها.',
  r() { const id = 'khaled', m = M[id], k = S.kid[id], d = dateAr(), N = pnNew(id), tot = k.quota + k.extra, lf = left(id), w = winNow(id);
    const TD = tnDay(id, TK_TODAY), NX = tnNext(id), tl = TD.filter(x => x.t && x.t.st === 'PENDING').length, evn = TD.filter(x => x.e).length;
    const unr = myChs().filter(c => chUnread(c) && !chOf(c).closed).reduce((n, c) => n + chUnread(c), 0);
    const now = fmOf(id) ? ['وقت حر الآن', 'lock_open'] : w === 'sleep' ? ['وقت نوم الآن', 'bedtime'] : w === 'school' ? ['وقت مدرسة الآن', 'school'] : w === 'mode' ? ['وضع مؤقت الآن', 'timer'] : lf <= 0 ? ['انتهى وقت اليوم', 'hourglass_empty'] : ['متاح الآن', 'check_circle'];
    const ask = S.apps[id].find(a => a.act === 'LIMIT');
    return `<div class="hero tn"><div class="top"><button data-a="tab:t-me" aria-label="ملفي" style="margin-inline-start:8px">${av(m)}</button><div class="hi"><small>${d.s}</small><b>${L('مساء الخير، ' + m.n, 'Good evening, ' + m.en)}</b></div>${sosBtn()}</div>
      <div class="tnm"><div class="tnn"><b>${lf}</b><span>دقيقة باقية<br>من وقت اليوم</span></div><span class="tns ${now[1] === 'check_circle' || now[1] === 'lock_open' ? 'ok' : ''}">${ic(now[1])}${now[0]}</span></div>
      <div class="tnp"><i style="width:${Math.min(100, Math.round(k.used / Math.max(1, tot) * 100))}%;background:${lf / Math.max(1, tot) < .2 ? '#F6C38F' : '#8FD3A5'}"></i></div>
      <div class="tnc"><span>استخدمت ${k.used} من ${tot} د</span><span>${nextEdge(id)}</span></div>
      <div class="tnst"><div><b>${tl}</b><span>${tl === 1 ? 'مهمة باقية اليوم' : 'مهام باقية اليوم'}</span></div><div><b>${evn}</b><span>${evn === 1 ? 'موعد اليوم' : 'مواعيد اليوم'}</span></div><div><b>${unr}</b><span>${unr === 1 ? 'رسالة جديدة' : 'رسائل جديدة'}</span></div></div>
    </div><div style="padding:14px 16px 24px">
    ${N.length ? `<div class="callout in">${ic('key')}<div><b>${N[0].sn}</b><br>يسري الآن.<div style="margin-top:8px">${btn('عرض', 'go:t-me', 'sm sec')} ${btn('تمّ', 'pnSeen', 'sm txt')}</div></div></div>` : ''}
    ${k.enf !== 'active' ? `<div class="tnw">${ic('gpp_maybe')}<div><b>${(S.tamP || {})[id] ? 'والدك يذكّرك: أعد تفعيل خدمة الوصول' : 'خدمة الوصول متوقفة على جهازك'}</b><span>قد يكون السبب تحديث النظام. أعد تفعيلها ليعود كل شيء طبيعياً. ${(S.tamP || {})[id] ? 'وصلك تذكيره الآن.' : 'والدك يعلم بذلك.'}</span></div>${btn('أعد التفعيل', 'teenFix', 'sm')}</div>` : ''}
    ${(r => (r ? rwReqCard(id, r) : ''))(S.reqs.find(r => r.kid === id && r.st !== 'PENDING' && !r.seen))}
    <div class="qa tnq">${[['add_task', 'مهمة جديدة', 'teenTask', ''], ['calendar_month', 'التقويم', 'go:fam-cal', 'ac'], ['location_on', 'موقعي', 'go:map', 'ok'], ask ? ['more_time', 'اطلب وقتاً', 'go:ask-time:' + ask.id, 'go'] : 0].filter(Boolean).map(([i, t, a, c]) => `<button data-a="${a}"><span class="qi ${c}">${ic(i)}</span>${t}</button>`).join('')}</div>
    ${krCard(id)}${sec('يومي', 'التقويم', 'go:fam-cal')}${TD.length ? `<div class="agl">${tnAgenda(TD)}</div>` : `<div class="card flat c sm muted">لا مهام ولا مواعيد اليوم.</div>`}
    ${NX.length ? sec('القادم') + `<div class="agl">${NX.map(x => tnRow(x, x.k)).join('')}</div>` : ''}
    ${chWidget(1)}
    ${sec('تطبيقاتي')}<div class="tna">${S.apps[id].map(a => { const dc = decide(id, a.id), ok = dc.ok, lim = a.act === 'LIMIT', rest = Math.max(0, a.lim - a.used); return `<button data-a="openApp:${a.id}" class="${ok ? '' : 'off'}"><span class="qi">${ic(ok ? a.i : dc.why === 'blocked' || dc.why === 'mode' ? 'lock' : dc.why === 'sleep' ? 'bedtime' : dc.why === 'school' ? 'school' : 'hourglass_empty')}</span><b>${/[A-Za-z]/.test(a.n) ? `<span class="ltr">${a.n}</span>` : a.n}</b><small>${lim ? (rest ? `بقي ${rest} د` : 'انتهى وقته') : a.study ? 'متاح دائماً' : 'مسموح'}</small>${lim ? `<span class="pbar ${rest ? '' : 'wa'}"><i style="width:${Math.min(100, a.used / Math.max(1, a.lim) * 100)}%"></i></span>` : ''}</button>`; }).join('')}</div>
    <button class="card tnsh" data-a="tab:t-me">${ic('visibility')}<span><b>ما يراه أهلك الآن</b><small>موقعك${offline() ? ' (آخر موقع معروف)' : ''} · وقت الشاشة · محادثات العائلة</small></span>${ic('chevron_right')}</button>
    ${helpCard()}</div>`; },
});
surface('t-me', {
  t: 'أنا', sys: 'S1-03', p: 'teen', req: '03:15 02:17 08:12 01:5,6,18,21',
  note: 'شفافية للمراهق: لكل فئة تُتابَع سطر يقول ما يراه أهله وسطر يقول ما لا يرونه، ثم ما سُمح له به، ثم حقوقه (ما اتُّفق عليه، ما فعله المساعد بخصوصه، مناقشة قرار)، ثم الجهاز. لا مشتريات ولا روابط خارجية.',
  r() { const m = me(), on = S.clsTeen ?? true, ex = S.tmExp || {}, see = (y, n) => `<span class="tsee">${ic('visibility')}${y}</span>${n ? `<span class="tsee no">${ic('visibility_off')}${n}</span>` : ''}`;
    return `<div class="tnpf">${av(m, 'lg')}<div><b>${m.n}</b><span>15 سنة · حساب مراهق</span></div></div>
    ${sec('ما يراه أهلي')}<p class="sm muted" style="margin:-4px 4px 8px">الفئات التي تُتابَع، لا المحتوى.</p>${list(row('hourglass_top', 'وقت الشاشة', see('المدة لكل تطبيق', 'ما تفعله داخله'), { chev: false }), row('location_on', 'موقعي', see('الآن وسجل 7 أيام'), { a: 'go:map' }), row('forum', 'محادثات العائلة', see('مرئية ' + chSeers('khaled', 1)), { chev: false }), row('chat_error', 'المصنّف الآلي للرسائل', see(on ? 'مفعّل · ينبّه والدك عند خطر فقط' : 'أوقفه والدك'), { chev: false, v: chip(on ? 'مفعّل' : 'متوقف', on ? 'ok' : 'ol') }), row('travel_explore', 'المواقع', see('فئة الموقع', 'كل صفحة تفتحها'), { chev: false }))}
    ${sec('ما سُمح لي به')}${list(row('task_alt', `أنشئ مهامي بنفسي${pnNew('khaled').length ? ' ' + chip('جديد', 'in') : ''}`, S.teenTasks ? `مهامك أنت فقط · ${unTxt(S.teenUn).replace('تلغيها', 'يلغيها والدك')}` : 'لم يسمح بها والدك بعد', { v: S.teenTasks ? chip('مسموح', 'ok', 'check') : (S.preq.find(q => q.k === 'teen' && q.st === 'pending') ? chip('بانتظار والدك', 'wa', 'pending') : btn('اطلب', 'preqSend:teen', 'sm txt')) }), row('supervisor_account', 'الإشراف على إخوتي', 'لا يُفوَّض للمراهق', { v: ic('lock'), c: 'dis' }))}
    ${sec('حقوقي')}${list(row('rule', `قواعدي${krNew('khaled').length ? ' ' + chip('جديد', 'in') : ''}`, 'وقتي، نومي، تطبيقاتي، والإنترنت · قراءة فقط', { a: 'go:my-rules' }), row('handshake', 'ما اتفقنا عليه', 'ما وافقتَ عليه أنت ووالدك عند إعداد جهازك', { a: 'go:consent-view' }), row('wand_stars', 'المساعد وأنا', 'ما فعله المساعد بخصوصي', { a: 'go:ai-mine' }), row('balance', 'ناقش قراراً', 'مهمة لم تُعتمد؟ اكتب لوالدك ما حدث', { a: 'go:objection' }))}
    ${sec('المساعدة')}${list(row('front_hand', 'أحتاج مساعدة', 'أكلّم أهلي، أو أخبرهم بما أزعجني', { a: 'go:kid-help', ic: 'var(--accent)' }))}
    ${sec('الجهاز')}${list(row('translate', 'اللغة والعرض', '', { a: 'go:display' }), row('lock', 'إعدادات الجهاز للأهل', 'تحتاج الرقم السري', { a: 'kidGate' }))}`; },
});
Object.assign(ACT, {
  teenFix() { tamBack('khaled', 'من جهاز خالد'); toast('عادت الخدمة · شكراً'); },
});
surface('learn', {
  t: () => (mode() === 'teen' ? 'تعلّم' : 'العب وتعلّم'), sys: 'S1-10', p: 'kid', req: '10:7,24 09:9',
  note: 'معتمد (Q-397 · Q-417): التبويب في التنقل، ومحتواه التعليمي في المرحلة 3. في المرحلة 1 يعرض تطبيقات الطفل التي سمح بها الأب فقط: الدراسة المفتوحة دائماً، ثم اللعب بوقته المتبقي. لا بلاطات «قريباً» (G-002).',
  r() { const id = kidId(), A = S.apps[id].filter(a => a.act !== 'BLOCK'), st = A.filter(a => a.study), pl = A.filter(a => !a.study), teen = mode() === 'teen';
    if (teen) {
      const on = winNow(id) === 'school', sc = S.sched[id].find(x => x.type === 'school'), used = st.reduce((n, a) => n + (a.used || 0), 0);
      return `<div class="tnl ${on ? 'on' : ''}"><span class="qi ${on ? 'go' : 'ok'}">${ic('school')}</span><div><b>${on ? 'وقت مدرسة الآن' : 'تطبيقات الدراسة مفتوحة'}</b><span>${on ? 'تطبيقات الدراسة وحدها تعمل الآن.' : 'تبقى متاحة لك في وقت المدرسة أيضاً.'}</span>${on ? `<span>${nextEdge(id)}</span>` : ''}</div></div>
      ${st.length ? sec('تطبيقات الدراسة') + `<div class="tnla">${st.map(a => { const ok = decide(id, a.id).ok; return `<button data-a="openApp:${a.id}"><span class="qi">${ic(a.i)}</span><span class="tx"><b>${/[A-Za-z]/.test(a.n) ? `<span class="ltr">${a.n}</span>` : a.n}</b><small>${a.used ? `استخدمته ${a.used} د اليوم` : 'لم تفتحه اليوم'}</small></span><span class="go ${ok ? '' : 'off'}">${ok ? 'افتح' : 'مغلق الآن'}</span></button>`; }).join('')}</div>` : empty('school', 'لا تطبيقات دراسة بعد', 'حين يحدد والدك تطبيقات الدراسة تظهر هنا.')}
      ${sec('وقتي الدراسي')}${list(sc ? row('schedule', 'وقت المدرسة', daysTxt(sc.days), { v: winRange(sc) }) : row('schedule', 'وقت المدرسة', 'لم يحدده والدك بعد', {}), row('timer', 'في تطبيقات الدراسة اليوم', '', { v: `${used} د` }))}
      <p class="xs muted c" style="margin:12px 12px 0">والدك هو من يحدد تطبيقات الدراسة. إن احتجت تطبيقاً آخر فاطلبه منه.</p>`;
    }
    /* قالب الطفل (Q-449): كل تطبيق بلاطة. اللون للحالة: أخضر مفتوح للدراسة، كحلي للّعب، رمادي لما انتهى وقته؛ والشريط هو الوقت الباقي. */
    const end = a => a.act === 'LIMIT' && a.used >= a.lim;
    return `${mentorCard()}${sec('أنشطة تعليمية مقترحة')}${list(row('menu_book', 'تحدّي القراءة (10 دقائق)', 'قصة قصيرة + سؤالان للفهم', { v: avail('coming_soon'), chev: false }), row('calculate', 'مسابقة الحساب الذهني', '5 مسائل سريعة لتنشيط العقل', { v: avail('coming_soon'), chev: false }), row('mosque', 'حفظ ومراجعة السور', 'تلاوة قصيرة مع الترديد', { v: avail('coming_soon'), chev: false }))}${st.length ? sec(teen ? 'تطبيقات الدراسة' : 'أتعلّم') + `<div class="ktg app">${st.map(a => ktile(a.i, a.n, 'مفتوح حتى في وقت المدرسة', 'openApp:' + a.id, chip('متاح', 'ok', 'check'), '#1F6B3B')).join('')}</div>` : ''}${pl.length && !teen ? sec('ألعب') + `<div class="ktg app">${pl.map(a => ktile(a.i, a.n, a.act === 'LIMIT' ? `${Math.max(0, a.lim - a.used)} دقيقة متبقية اليوم` : 'مسموح', 'openApp:' + a.id, end(a) ? chip('انتهى وقته', '') : '', end(a) ? '#827B69' : '#1F3A6B', a.act === 'LIMIT' ? pbar((a.lim - a.used) / a.lim * 100) : '')).join('')}</div>` : ''}${!st.length && (teen || !pl.length) ? empty('school', 'لا تطبيقات هنا بعد', teen ? 'حين يحدد والدك تطبيقات الدراسة تظهر هنا.' : 'اطلب من بابا أن يضيف تطبيقاتك.') : ''}`; },
});

