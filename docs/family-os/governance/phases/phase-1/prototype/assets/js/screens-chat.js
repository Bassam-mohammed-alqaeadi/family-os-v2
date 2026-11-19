/* S1-08 المحادثة العائلية: قائمة المحادثات (CH-01)، المحادثة (CH-02)، قناة الوالدين (CH-03)، محادثة ومجموعة جديدة (CH-04)،
   محادثات الأبناء (CH-05)، تنبيه المصنّف وما أوقفه (CH-06)، الحذف والإغلاق وإعادة الفتح (CH-07)، استرداد سجل قناة الوالدين (CH-08).
   ما ينتظر الإرسال (CH-09) يظهر داخل المحادثة وفي شاشة «البيانات والمزامنة» من الغلاف. بطاقة الرئيسية (CH-10) في screens-parent.js. */
'use strict';
const ALL = ['ahmad', 'sara', 'khaled', 'layan'];
const IMG_MAX = 10, VOICE_MAX = 5, CR_OTP = '246810';
const isMinor = id => M[id].role !== 'adult';
/* القنوات في الحالة (لا ثابت عام) كي تعود كما كانت عند كل بداية. */
function CHS() {
  if (!S.chs) {
    S.chs = {
      majlis: { n: 'مجلس العائلة', i: 'diversity_3', mem: ALL.slice(), k: 'majlis', d: 'كل أفراد العائلة' },
      parents: { n: 'قناة الوالدين', i: 'shield_lock', mem: ['ahmad', 'sara'], k: 'parents', d: 'للكبار فقط · مشفّرة من طرف إلى طرف' },
      'dm-layan': { mem: ['ahmad', 'layan'], k: 'dm' },
      'dm-khaled-layan': { mem: ['khaled', 'layan'], k: 'dm' },
    };
    S.chat.majlis.push({ f: 'khaled', x: 'وصلت البيت', at: '5:09', st: 2 });
    S.rd = {}; S.rd0 = {}; Object.keys(S.chs).forEach(id => { const n = (S.chat[id] || []).length; S.rd0[id] = id === 'majlis' ? n - 1 : n; }); S.review = S.review || []; S.cr = { step: 0, otp: '', bad: 0 }; if (S.typing === undefined) S.typing = true;
  }
  return S.chs;
}
const chOf = id => CHS()[id];
const chName = (id, u) => { const c = chOf(id); return c.n || c.mem.filter(x => x !== u).map(x => M[x].n).join(' و'); };
const msgsOf = id => { CHS(); return (S.chat[id] = S.chat[id] || []); };
/* ما يراه هذا المشاهد من الرسائل: ما أوقفه المصنّف يراه مرسله فقط، وما حذفه لنفسه لا يراه هو. */
const msgSeen = (m, u) => !(m.blk && m.f !== u) && !(m.hid || []).includes(u);
const chHasMinor = id => chOf(id).mem.some(isMinor);
const chClosable = id => { const c = chOf(id); return (c.k === 'dm' || c.k === 'group') && chHasMinor(id); };
/* ما وصل دون اتصال يُرسل عند عودته: الساعة تصير صحاً. */
function chSync() { if (offline()) return; Object.keys(CHS()).forEach(id => msgsOf(id).forEach(m => { if (m.q) { m.q = 0; m.st = 1; } })); }
const chRdKey = (id, u) => u + ':' + id;
function chUnread(id, u = me().id) {
  const ms = msgsOf(id), k = chRdKey(id, u), from = S.rd[k] !== undefined ? S.rd[k] : (S.rd0[id] || 0);
  return ms.slice(from).filter(m => m.f !== u && msgSeen(m, u)).length;
}
const chRead = id => { S.rd[chRdKey(id, me().id)] = msgsOf(id).length; };
/* ما أراه في قائمتي: أنا عضو فيه، وقناة الوالدين للكبار الذين سُمح لهم. */
const myChs = (u = me().id) => Object.keys(CHS()).filter(id => chOf(id).mem.includes(u) && (id !== 'parents' || (isAdult() && can('chat.parents.view'))));
const minorsSeen = () => (isAdult() ? KIDS.filter(k => can('chat.minor.view', k)) : []);
const kidChs = k => Object.keys(CHS()).filter(id => id !== 'parents' && id !== 'majlis' && chOf(id).mem.includes(k));
const prev = (m, id) => (m.del ? 'رسالة محذوفة' : m.blk ? 'لم تُسلَّم' : m.k === 'img' ? 'صورة' : m.k === 'voice' ? 'رسالة صوتية' : m.x);
function chLast(id, u = me().id) { const ms = msgsOf(id).filter(m => msgSeen(m, u)); return ms[ms.length - 1] || null; }
const chPending = () => Object.keys(CHS()).reduce((n, id) => n + msgsOf(id).filter(m => m.f === me().id && (m.q || m.fail)).length, 0);
const chFlags = k => kidChs(k).reduce((n, id) => n + msgsOf(id).filter(m => m.flag && !m.del).length, 0);
/* رسائل تحتاج المراجعة في كل ما يراه المشاهد من محادثات الأبناء، بلا عدّ المحادثة مرتين. */
const chFlagsAll = () => [...new Set(minorsSeen().flatMap(kidChs))].reduce((n, id) => n + msgsOf(id).filter(m => m.flag && !m.del).length, 0);
const chUnreadAll = () => myChs().reduce((n, id) => n + chUnread(id), 0);
const chAv = id => { const c = chOf(id), u = me().id; return c.k === 'dm' && c.mem.includes(u) ? av(M[c.mem.find(x => x !== u)]) : `<span class="av" style="--c:${id === 'parents' ? '#142749' : c.k === 'group' ? '#CF5B2C' : '#1F6B3B'}">${ic(c.i || (c.k === 'group' ? 'groups' : 'forum'))}</span>`; };

const cntMsg = (n, un) => (n === 1 ? 'رسالة واحدة' + (un ? ' غير مقروءة' : ' جديدة') : n === 2 ? 'رسالتان' + (un ? ' غير مقروءتين' : ' جديدتان') : `${n} ${n > 10 ? 'رسالة' : 'رسائل'}` + (un ? ' غير مقروءة' : ' جديدة'));
/* CH-10 ودجة الرئيسية: حتى خمس محادثات فيها جديد، صف لكل محادثة، عدد فقط بلا نص ولا صور. قناة الوالدين للكبار وحدهم. */
function chWidget(quiet) {
  const u = me().id, ids = myChs().filter(id => chUnread(id) && !chOf(id).closed).slice(0, 5);
  if (!ids.length && quiet) return '';
  return sec('المحادثات', 'الكل', 'tab:chat') + (ids.length ? list(ids.map(id => { const n = chUnread(id); return row('', chName(id, u), cntMsg(n, id !== 'parents') + (id === 'parents' ? ' · العدد فقط' : ''), { lead: chAv(id), a: 'openCh:' + id, chev: false, v: `<b class="unr" aria-hidden="true">${n}</b>` }); }))
    : `<button class="card fx" id="chw0" data-a="tab:chat">${ic('forum', '" style="color:var(--muted)')}<span class="grow sm muted" style="text-align:start">لا رسائل جديدة</span>${ic('chevron_left', '" style="color:var(--muted)')}</button>`);
}
/* CH-09 داخل «البيانات والمزامنة»: رسائلي التي لم تُرسل، بزر إعادة المحاولة لكل واحدة. نص قناة الوالدين لا يُعرض خارجها. */
function chOutbox() {
  const u = me().id, F = [];
  Object.keys(CHS()).forEach(id => msgsOf(id).forEach((m, i) => { if (m.f === u && m.fail) F.push([id, i, m]); }));
  if (!F.length) return '';
  return sec(F.length === 1 ? 'رسالة لم تُرسل' : 'رسائل لم تُرسل') + list(F.map(([id, i, m]) => row('error', chName(id, u), (id === 'parents' ? 'رسالة' : prev(m, id)) + ' · ' + m.at, { ic: 'var(--danger)', a: `msgRetry:${id}:${i}`, chev: false, v: '<span class="btn sm ton">أعد المحاولة</span>' })));
}

/* ---------- CH-01 قائمة المحادثات ---------- */
function chRow(id, obs) {
  const u = me().id, c = chOf(id), l = chLast(id), n = obs ? 0 : chUnread(id);
  const sub = c.closed ? 'مغلقة · لا إرسال فيها' : id === 'parents' ? 'مشفّرة · لا معاينة هنا' : !l ? 'لا رسائل بعد' : S.privacy && isAdult() ? '•••' : `${l.f === u ? 'أنت: ' : c.mem.length > 2 || obs ? M[l.f].n + ': ' : ''}${prev(l, id)}`;
  const fl = obs ? msgsOf(id).filter(m => m.flag && !m.del).length : 0;
  return row('', obs ? c.mem.map(x => M[x].n).join(' و') : chName(id, u), sub, { lead: chAv(id), a: `openCh:${id}`, chev: false,
    v: `<span class="chv">${l ? `<small>${l.at}</small>` : ''}${c.closed ? chip('مغلقة', 'stale', 'lock') : fl ? chip('للمراجعة', 'wa', 'chat_error') : id === 'parents' && !n ? ic('lock') : n ? `<b class="unr" aria-label="${n} غير مقروءة">${n}</b>` : ''}</span>` });
}
function chListBody() {
  const u = me().id, q = (S.chQ || '').trim().replace(/^ال/, ''), mine = myChs().filter(id => !q || chName(id, u).includes(q));
  if (!mine.length) return q ? empty('search', 'لا محادثة بهذا الاسم', 'جرّب اسم أحد أفراد العائلة.') : empty('forum', 'لا محادثات بعد', 'ابدأ محادثة مع أي فرد من العائلة.', btn('ابدأ محادثة', 'go:chat-new', 'sm', 'edit'));
  return list(mine.map(id => chRow(id)));
}
surface('chat', {
  t: 'المحادثات', sys: 'S1-08', p: 'any', req: '08:1,2,3,4,13,14,16',
  note: 'ثلاثة أنواع: مجلس العائلة، قناة الوالدين (لا تظهر للأبناء إطلاقاً، وبلا معاينة لمحتواها)، ومحادثات ثنائية يبدؤها أي فرد مع أي فرد. لكل صف: آخر رسالة ووقتها وعدد غير المقروء. محادثات الأبناء مدخل واحد للأهل. الابن يعلم أن محادثاته مرئية لوالده. جرّب من الاستوديو: تحميل المحادثات، وتعذّر جلبها، وقطع الاتصال.',
  act: () => `${isAdult() ? `<button class="ib" data-a="go:chat-settings" aria-label="إعدادات المحادثة">${ic('tune')}</button>` : ''}<button class="ib" data-a="go:chat-new" aria-label="محادثة جديدة">${ic('edit')}</button>`,
  r() {
    chSync(); const ad = isAdult(), pend = chPending(), kids = minorsSeen();
    if (S.chLoad) return `<div aria-busy="true"><div class="skel" style="height:46px;border-radius:var(--r-full)"></div>${[0, 1, 2, 3].map(() => '<div class="skel" style="height:64px"></div>').join('')}<p class="sm muted c" role="status">جارٍ جلب المحادثات…</p></div>`;
    if (S.chErr) return `<div class="card c">${ic('cloud_off', '" style="width:34px;height:34px;color:var(--warning)')}<p><b>تعذّر جلب المحادثات</b></p><p class="sm muted">رسائلك المحفوظة في هاتفك لم تُمس.</p>${btn('أعد المحاولة', 'set:chErr:false', 'sm sec', 'refresh')}</div>`;
    const flags = chFlagsAll(), rv = (S.review || []).length;
    return `${pend ? `<button class="callout wa" style="width:100%;text-align:start" data-a="go:outbox">${ic('schedule')}<div><b>${pend === 1 ? 'رسالة واحدة تنتظر الإرسال' : pend === 2 ? 'رسالتان تنتظران الإرسال' : pend + ' رسائل تنتظر الإرسال'}</b><br>افتح «البيانات والمزامنة»</div></button>` : ''}
    <label class="srch">${ic('search')}<input data-cq value="${S.chQ || ''}" placeholder="ابحث في المحادثات" autocomplete="off" aria-label="ابحث في المحادثات"></label>
    <div id="chl">${chListBody()}</div>
    ${ad ? (kids.length ? sec('إشراف') + list(row('visibility', 'محادثات الأبناء', flags ? `${flags === 1 ? 'رسالة واحدة تحتاج' : flags === 2 ? 'رسالتان تحتاجان' : flags + ' رسائل تحتاج'} مراجعتك` : 'للقراءة فقط · الأبناء يعلمون', { a: 'go:minor-chats:' + kids[0], v: flags ? chip(String(flags), 'wa', 'chat_error') : '' }), isOwner() && rv ? row('block', 'رسائل أوقفها المصنّف', 'لم تُسلَّم · تنتظر قرارك', { a: 'go:chat-review', v: chip(String(rv), 'da') }) : '') : '')
      : callout(mode() === 'teen' ? `محادثاتك داخل العائلة مرئية ${chSeers(me().id, 1)}. هذا متفق عليه عند إعداد جهازك.` : `${chSeers(me().id)} رؤية محادثاتك ${momSees(me().id) ? 'ليبقياك' : 'ليبقيك'} بأمان.`, 'nt', 'visibility')}`;
  },
});
document.addEventListener('input', e => {
  const t = e.target; if (!t || !t.matches) return;
  if (t.matches('[data-cq]')) { S.chQ = t.value; const l = document.querySelector('#phone #chl'); if (l) l.innerHTML = chListBody(); }
  if (t.matches('#cmp')) { const c = t.closest('.composer'); if (c) c.classList.toggle('has', !!t.value.trim()); S.cmpErr = ''; const e2 = document.querySelector('#phone .cmperr'); if (e2) e2.remove(); }
  if (t.matches('#clsWhy')) { S.clsWhy = t.value; const b = document.querySelector('#phone [data-a^="chCloseDo"]'); if (b) b.disabled = !t.value.trim() || offline(); }
  if (t.matches('#grpN')) { S.grp.n = t.value; const b = document.querySelector('#phone [data-a="grpMake"]'); if (b) b.disabled = !grpOk(); }
});

/* ---------- CH-04 محادثة جديدة ومجموعة جديدة ---------- */
const dmId = (a, b) => Object.keys(CHS()).find(k => chOf(k).k === 'dm' && chOf(k).mem.includes(a) && chOf(k).mem.includes(b));
const grpOk = () => !!(S.grp && (S.grp.n || '').trim() && S.grp.mem.length >= 2);
surface('chat-new', {
  kind: 'sheet', t: 'محادثة جديدة', sys: 'S1-08', p: 'any', req: '08:1,2',
  note: 'أي فرد يبدأ محادثة مع أي فرد. المجموعة ينشئها صاحب العائلة ومن سُمح له. قناة الوالدين لا تُنشأ من هنا: تولد مع العائلة. بدء محادثة جديدة يحتاج اتصالاً؛ المحادثة القائمة تُفتح دونه.',
  r() { const u = me().id, off = offline();
    return `<h4>محادثة جديدة</h4><p class="d">مع أي فرد من العائلة.${isAdult() ? '' : momSees(me().id) ? ' والداك يستطيعان رؤيتها.' : ' والدك يستطيع رؤيتها.'}</p>
    ${list(ALL.filter(x => x !== u).map(x => { const has = dmId(u, x); return row('', pname(M[x]), has ? 'محادثة قائمة' : off ? 'بدء محادثة جديدة يحتاج اتصالاً' : M[x].rel, { lead: av(M[x]), a: has || !off ? 'dmStart:' + x : '', c: has || !off ? '' : 'dis' }); }))}
    ${isAdult() && can('chat.channel.create.group') ? `<div class="gap"></div>${btn('مجموعة جديدة', 'grpNew', off ? 'sec" disabled="' : 'sec', 'groups')}${off ? '<p class="xs muted c" style="margin-top:8px">إنشاء مجموعة يحتاج اتصالاً.</p>' : ''}` : ''}`; },
});
surface('chat-group', {
  kind: 'sheet', t: 'مجموعة جديدة', sys: 'S1-08', p: 'adult', req: '08:1',
  note: 'اسم المجموعة واختيار أفرادها (اثنان على الأقل غيرك). إن ضمّت ابناً فهي مرئية لوالده مثل كل محادثاته.',
  r() { const g = S.grp || (S.grp = { n: '', mem: [] }), u = me().id, kid = g.mem.some(isMinor);
    return `<h4>مجموعة جديدة</h4><label class="fld"><span>اسم المجموعة</span><input id="grpN" value="${g.n || ''}" maxlength="30" placeholder="مثال: رحلة الجمعة" autocomplete="off"></label>
    <p class="sm b" style="margin:12px 2px 8px">من فيها؟</p>${list(ALL.filter(x => x !== u).map(x => row('', pname(M[x]), M[x].rel, { lead: av(M[x]), tg: g.mem.includes(x), ta: 'grpT:' + x })))}
    <p class="xs muted" style="margin:8px 2px">${g.mem.length < 2 ? 'اختر فردين على الأقل. لمحادثة مع فرد واحد ابدأ محادثة ثنائية.' : kid ? 'فيها أبناء: يراها صاحب العائلة مثل كل محادثاتهم.' : 'أنت وهؤلاء فقط.'}</p>
    ${btn('أنشئ المجموعة', 'grpMake', grpOk() ? '' : '" disabled="', 'check')}`; },
});

/* ---------- CH-02 المحادثة (ومعها قناة الوالدين CH-03 بعد البوابة) ---------- */
const tick = m => (m.fail ? 'error' : m.st === 0 ? 'schedule' : m.st === 1 ? 'check' : 'done_all');
const tickTxt = m => (m.fail ? 'لم تُرسل' : m.st === 0 ? 'تنتظر الإرسال' : m.st === 1 ? 'أُرسلت' : 'قُرئت');
const EMO = ['👍', '❤️', '😂', '🤲', '🌹', '👏', '😢', '🙏'];
surface('thread', {
  t: id => { const c = chOf(id); return c.mem.includes(me().id) ? chName(id, me().id) : c.n || c.mem.map(x => M[x].n).join(' و'); }, sys: 'S1-08', p: 'any', a: ['majlis'], flush: true, req: '08:4,5,6,7,8,9,11,12,13,14,15 01:9',
  note: 'الرسالة تظهر فوراً بعلامة الساعة، ثم صح عند وصولها للخادم، ثم صحّان عند قراءتها. دون اتصال تبقى بالساعة وتُرسل بترتيبها عند عودته، وما فشل يحمل «أعد المحاولة». لمس أي رسالة يفتح إجراءاتها. المحادثة المغلقة تعرض من أغلقها وسببه، ولا يعيد فتحها إلا صاحب العائلة. وليّ الأمر يقرأ محادثات الأبناء ولا يكتب فيها. رسالة أوقفها المصنّف يراها مرسلها بنص صريح ولا تصل. قناة الوالدين: شارة التشفير، وبلا مصنّف. في توفير البيانات لا تُحمَّل الصورة إلا بالطلب. جرّب من الاستوديو: «يكتب الآن»، «فشل الإرسال»، «صورة أكبر من الحد»، «المصنّف يوقف الرسالة التالية».',
  act: id => `${id === 'parents' ? `<span class="chip ok" style="margin-inline-end:4px">${ic('encrypted')}مشفّرة</span>` : ''}<button class="ib" data-a="go:chat-info:${id}" aria-label="معلومات المحادثة">${ic('info')}</button>`,
  r(id) {
    chSync(); const u = me().id, c = chOf(id), obs = !c.mem.includes(u), ms = msgsOf(id); if (!obs) chRead(id);
    const seen = ms.map((m, i) => [m, i]).filter(x => msgSeen(x[0], u));
    const head = `${obs ? `<div class="sys lbw">${ic('visibility')}<span>تقرأ هذه المحادثة بصفتك وليّ الأمر · للقراءة فقط</span></div>` : ''}${c.closed ? `<div class="sys perm" role="status">${ic('lock')}<span>أغلق${M[c.closed.by].f ? 'ت' : ''} ${M[c.closed.by].n} هذه المحادثة: «${c.closed.why}»</span></div>` : ''}`;
    const sc = $('#scr'); if (!sc || sc.dataset.id !== 'thread' + id) setTimeout(() => { const e = $('#scr'); if (e && e.dataset.id === 'thread' + id) e.scrollTop = e.scrollHeight; }, 0);
    if (!seen.length) return `${head}${empty('forum', 'ابدأ المحادثة', id === 'parents' ? 'ما يُكتب هنا لا يقرؤه إلا الكبار، ولا يقرؤه الخادم.' : 'لا رسائل هنا بعد.')}`;
    const typ = S.typing && id === 'majlis' && !offline() && !obs && !c.closed ? `<span class="typing" role="status">${u === 'sara' ? 'خالد يكتب' : 'سارة تكتب'} الآن…</span>` : '';
    return `${head}<div class="thread"><span class="day">اليوم</span>${seen.map(([m, i]) => { const mine = m.f === u, f = M[m.f];
      if (m.del) return `<div class="msg del ${mine ? 'me' : ''}">${ic('block')} حُذفت هذه الرسالة<span class="mt">${m.at}</span></div>`;
      if (m.blk) return `<button class="msg me blk" style="text-align:start" data-a="msgAct:${id}:${i}">${ic('block')} <b>لم تُسلَّم هذه الرسالة.</b><br>${mode() === 'teen' ? 'أوقفها المصنّف الآلي وأحالها إلى والدك ليراجعها.' : 'أوقفناها وسيراها بابا.'}<span class="mt">${m.at}</span></button>`;
      const body = m.k === 'img' ? `<div class="ph">${S.lbw && !m.ld ? `${ic('image')}<span class="btn sm sec" data-a="imgLd:${id}:${i}">حمّل الصورة · 84 ك.ب</span>` : ic('image') + 'صورة'}</div>${m.x || ''}` : m.k === 'voice' ? `<div class="vo">${ic('play_arrow')}<i></i><span style="font-size:11px">${m.len || '0:07'}</span></div>` : m.x;
      return `<button class="msg ${mine ? 'me' : ''} ${m.fail ? 'fail' : ''}" style="--c:${f.c};text-align:start" data-a="msgAct:${id}:${i}">${(!mine && c.mem.length > 2) || obs ? `<span class="wh">${f.n}</span>` : ''}${body}${m.flag && isAdult() ? `<div style="margin-top:4px">${chip('رصدها المصنّف', 'wa', 'chat_error')}</div>` : ''}<span class="mt">${m.at}${mine ? `<span class="tk" aria-label="${tickTxt(m)}">${ic(tick(m))}</span>` : ''}</span>${m.fail ? `<span class="rt" data-a="msgRetry:${id}:${i}">${ic('refresh')}لم تُرسل · أعد المحاولة</span>` : ''}</button>`; }).join('')}${typ}</div>`;
  },
  foot(id) {
    const u = me().id, c = chOf(id), obs = !c.mem.includes(u), kid = !isAdult();
    if (obs) return chClosable(id) && !c.closed && can('chat.channel.close') ? `<div class="composer obs">${btn('أغلق هذه المحادثة', 'go:chat-close:' + id, 'sm sec', 'lock')}</div>` : c.closed && isOwner() ? `<div class="composer obs">${btn('أعد فتح المحادثة', 'chReopen:' + id, 'sm sec', 'lock_open')}</div>` : '';
    if (c.closed) return `<div class="composer obs"><p class="sm muted grow">لا يمكن الإرسال: المحادثة مغلقة.${isOwner() ? '' : ` ${M.ahmad.n} وحده يعيد فتحها.`}</p>${isOwner() ? btn('أعد فتحها', 'chReopen:' + id, 'sm sec', 'lock_open') : ''}</div>`;
    if (S.rec === id) return `<div class="composer rec" role="status"><button class="ib" data-a="recX" aria-label="ألغِ التسجيل">${ic('delete')}</button><span class="grow"><i class="recdot"></i> يسجّل… <span class="ltr">0:04</span></span><button class="ib snd" data-a="recSend:${id}" aria-label="أرسل التسجيل">${ic('send')}</button></div>`;
    return `${S.cmpErr ? `<p class="cmperr" role="alert">${ic('error')} ${S.cmpErr}</p>` : ''}${S.emo ? `<div class="emo" role="group" aria-label="رموز تعبيرية">${EMO.map(e => `<button data-a="emoAdd:${e}">${e}</button>`).join('')}</div>` : ''}
    <div class="composer"><button class="ib" data-a="emoT" aria-label="رموز تعبيرية" aria-pressed="${!!S.emo}">${ic('add')}</button><input id="cmp" placeholder="${mode() === 'child' ? 'اكتب رسالة لطيفة…' : 'اكتب رسالة…'}" autocomplete="off" aria-label="نص الرسالة"><button class="ib" data-a="sendK:${id}:img" aria-label="أرسل صورة">${ic('image')}</button><button class="ib mic" data-a="recGo:${id}" aria-label="سجّل رسالة صوتية">${ic('mic')}</button><button class="ib snd" data-a="send:${id}" aria-label="أرسل">${ic('send')}</button></div>`;
  },
});
surface('chat-info', {
  kind: 'sheet', t: 'معلومات المحادثة', sys: 'S1-08', p: 'any', a: ['dm-khaled-layan'], req: '08:3,4,10,11,13',
  note: 'من في المحادثة، ومن يراها، وحالتها. الإغلاق لمن سُمح له، وإعادة الفتح لصاحب العائلة وحده.',
  r(id) { const c = chOf(id), u = me().id, obs = !c.mem.includes(u), minor = chHasMinor(id);
    return `<h4>${c.n || c.mem.map(x => M[x].n).join(' و')}</h4><p class="d">${c.k === 'parents' ? 'للكبار فقط. مشفّرة من طرف إلى طرف: لا يقرؤها الخادم، ولا تظهر للأبناء، ولا يظهر نصها في الإشعارات.' : c.k === 'majlis' ? 'كل أفراد العائلة.' : c.k === 'group' ? 'مجموعة.' : 'محادثة بين اثنين.'}</p>
    ${list(c.mem.map(x => row('', x === u ? 'أنت' : pname(M[x]), M[x].rel, { lead: av(M[x]), chev: false })))}
    ${c.k === 'parents' ? '' : `<p class="xs muted" style="margin:8px 2px">${minor ? (isAdult() ? `فيها أبناء: يقرؤها ${M.ahmad.n} ومن سمح له، ويفحصها المصنّف الآلي.` : mode() === 'teen' ? 'والدك يستطيع قراءتها.' : 'بابا يستطيع قراءتها.') : 'بين الكبار: لا يراها غير أفرادها.'}</p>`}
    ${c.closed ? callout(`<b>مغلقة</b> · أغلق${M[c.closed.by].f ? 'تها' : 'ها'} ${M[c.closed.by].n}: «${c.closed.why}».${isOwner() ? '' : ` ${M.ahmad.n} وحده يعيد فتحها.`}`, 'wa', 'lock') + (isOwner() ? btn('أعد فتح المحادثة', 'chReopen:' + id, 'sec', 'lock_open') : '') : chClosable(id) && isAdult() && can('chat.channel.close') ? btn('أغلق هذه المحادثة', 'go:chat-close:' + id, 'sec', 'lock') : ''}`; },
});


/* ---------- CH-07 إجراءات الرسالة: نسخ، حذف لنفسي، حذف للجميع، إعادة المحاولة ---------- */
surface('msg-actions', {
  kind: 'sheet', t: 'إجراءات الرسالة', sys: 'S1-08', p: 'any', a: ['dm-khaled-layan', '0'], req: '08:9,12,13,15',
  note: 'كل فرد يحذف رسالته من هاتفه فقط. الحذف للجميع لصاحب العائلة ومن سُمح له، بتأكيد يذكر الأثر ومدة المحو النهائي: 7 أيام، أو 30 يوماً لما رصده المصنّف. الحذف للجميع يحتاج اتصالاً. ما لا يملكه المشاهد لا يُعرض له.',
  r(id, i) { const m = msgsOf(id)[+i], u = me().id, mine = m.f === u, ad = isAdult(), any = ad && can('chat.message.delete.any'), obs = !chOf(id).mem.includes(u);
    if (m.blk) return `<h4>رسالة لم تُسلَّم</h4><div class="card flat">«${m.x}»</div>${callout(ad ? 'أوقفها المصنّف الآلي قبل أن تصل.' : mode() === 'teen' ? 'أوقفها المصنّف الآلي لأنها قد تؤذي. والدك سيراها ويقرر. إن رأيت أن هذا خطأ فحدّثه.' : 'أوقفنا هذه الرسالة لأنها قد تؤذي. بابا سيراها. إن كان هذا خطأ فأخبره.', 'wa', 'block')}${list(row('delete', 'احذفها من هاتفي', 'تبقى عند والدك للمراجعة', { a: `msgSelf:${id}:${i}` }))}`;
    return `<h4>${mine ? 'رسالتك' : 'رسالة ' + M[m.f].n}</h4><div class="card flat">${m.k === 'img' ? ic('image') + ' صورة' + (m.x ? ' · ' + m.x : '') : m.k === 'voice' ? ic('mic') + ' رسالة صوتية' : '«' + m.x + '»'}</div>
    ${m.flag && ad && can('chat.minor.view') ? callout('رصدها المصنّف الآلي. قد يكون تقديره خاطئاً.', 'wa', 'chat_error') : ''}
    ${list(m.fail ? row('refresh', 'أعد المحاولة', 'لم تُرسل بعد', { a: `msgRetry:${id}:${i}` }) : '',
      m.k ? '' : row('content_copy', 'انسخ النص', '', { a: `msgCopy:${id}:${i}`, chev: false }),
      m.flag && ad && can('chat.minor.view') ? row('chat_error', 'تفاصيل تنبيه المصنّف', 'الفئة والخطورة وما تستطيع فعله', { a: `go:chat-flag:${id}:${i}` }) : '',
      mine && (m.q || m.fail) ? row('delete', 'احذف الرسالة', 'لم تُرسل بعد: تُلغى ولا تصل لأحد', { a: `msgDrop:${id}:${i}`, ic: 'var(--danger)', chev: false }) : '',
      mine && !m.q && !m.fail && !obs ? row('delete', 'احذف من هاتفي فقط', ad ? 'تبقى عند الآخرين' : 'تبقى عند الآخرين، ووالدك ما زال يراها', { a: `msgSelf:${id}:${i}`, chev: false }) : '',
      any && !m.q && !m.fail ? row('delete', 'احذف للجميع', offline() ? 'يحتاج اتصالاً' : 'من الخادم ومن كل الأجهزة', { a: offline() ? '' : `msgDel:${id}:${i}`, c: offline() ? 'dis' : '', ic: 'var(--danger)', chev: false }) : '')}`; },
});
/* ---------- CH-07 إغلاق محادثة ابن ---------- */
const CLS_WHY = ['شجار بين الإخوة', 'كلام غير لائق', 'وقت للتهدئة'];
surface('chat-close', {
  kind: 'sheet', t: 'إغلاق محادثة', sys: 'S1-08', p: 'adult', a: ['dm-khaled-layan'], req: '08:4',
  note: 'السبب إلزامي ويراه أفراد المحادثة. الإغلاق يوقف الإرسال ولا يحذف شيئاً، وبلا مدة: لا يعيد فتحها إلا صاحب العائلة. يحتاج اتصالاً، ويُسجَّل.',
  r(id) { const c = chOf(id), off = offline(), w = (S.clsWhy || '').trim();
    return `<h4>إغلاق محادثة ${c.n || c.mem.map(x => M[x].n).join(' و')}</h4><p class="d">لن يستطيع أحد الإرسال فيها. الرسائل السابقة تبقى. ${isOwner() ? 'تعيد فتحها أنت متى شئت.' : `لا يعيد فتحها إلا ${M.ahmad.n}.`}</p>
    <p class="sm b" style="margin:4px 2px 8px">السبب (يراه ${c.mem.map(x => M[x].n).join(' و')})</p><div class="chips" style="margin-bottom:8px">${CLS_WHY.map(x => `<button class="chip ${w === x ? 'ac' : 'ol'}" style="min-height:40px" aria-pressed="${w === x}" data-a="clsWhy:${x}">${x}</button>`).join('')}</div>
    <label class="fld"><span>أو اكتب السبب</span><input id="clsWhy" value="${CLS_WHY.includes(w) ? '' : w}" maxlength="80" placeholder="سبب قصير" autocomplete="off"></label>
    ${off ? callout('الإغلاق يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}<div class="gap"></div>${btn('أغلق المحادثة', 'chCloseDo:' + id, 'dng' + (w && !off ? '' : '" disabled="'), 'lock')}`; },
});

/* ---------- CH-05 محادثات الأبناء ---------- */
surface('minor-chats', {
  t: 'محادثات الأبناء', sys: 'S1-08', p: 'adult', a: ['layan'], req: '08:4,13',
  note: 'صاحب العائلة يرى محادثات كل ابن، والبالغ الآخر يرى من سُمح له برؤيتهم. تُفتح للقراءة فقط. قناة الوالدين لا تظهر هنا. مجلس العائلة ليس هنا: الأهل أعضاء فيه أصلاً.',
  r(id) {
    const kids = minorsSeen(); if (!kids.length) return empty('visibility_off', 'لا تملكين رؤية محادثات الأبناء', `${M.ahmad.n} هو من يسمح بها.`, why('nd:chat.minor.view'));
    const k = kids.includes(id) ? id : kids[0], m = M[k], cs = kidChs(k);
    return `${kids.length > 1 ? `<div class="fch">${kids.map(x => `<button aria-pressed="${x === k}" data-a="minorPick:${x}">${av(M[x], 'sm')}${pname(M[x])}</button>`).join('')}</div>` : ''}
    ${callout(`للقراءة فقط. ${pname(m)} ${vb(m, 'يعلم', 'تعلم')} أن ${vb(m, 'محادثاته', 'محادثاتها')} مرئية.`, 'nt', 'visibility')}
    ${cs.length ? list(cs.map(c => chRow(c, !chOf(c).mem.includes(me().id)))) : empty('forum', `لا محادثات ل${pname(m)} بعد`, 'تظهر هنا حين يبدأ محادثة مع أحد أفراد العائلة.')}
    ${kids.length < KIDS.length ? '<p class="xs muted" style="margin:8px 4px">يظهر من سُمح لكِ برؤية محادثاتهم فقط.</p>' : ''}`;
  },
});

/* ---------- CH-06 تنبيه المصنّف، وما أوقفه قبل التسليم ---------- */
/* فئات التنبيه (Q-413): قائمة مغلقة في المرحلة 1. الخطورة مستويان يراهما وليّ الأمر: متوسطة وعالية. */
const FLAG_CAT = { bully: ['تنمّر أو إهانة', 'متوسطة', 'wa'], threat: ['تهديد بالأذى', 'متوسطة', 'wa'], sexual: ['كلام غير لائق', 'متوسطة', 'wa'], distress: ['ضيق شديد', 'عالية', 'da'] };
const flagCat = m => { const k = S.flagCat || m.cat || 'bully'; return FLAG_CAT[k] ? k : 'bully'; };
const FLAG_TIPS = { distress: ['لا تؤجل الحديث: اليوم أفضل من الغد.', 'اسمع أكثر مما تتكلم، ولا تلُم.', 'إن ذُكر إيذاء النفس فاطلب مساعدة مختص.'], other: ['ابدأ بسؤال هادئ، لا باتهام.', 'اسمع القصة كاملة قبل أي قرار.', 'قل إن التنبيه آلي وقد يخطئ.'] };
surface('chat-flag', {
  t: 'تنبيه المصنّف', sys: 'S1-08', p: 'adult', a: ['dm-khaled-layan', '0'], req: '08:12,13',
  note: 'التنبيه يحمل الفئة والخطورة فقط. نص الرسالة لا يُعرض إلا بطلب صريح، ويُقرأ من الرسالة نفسها لا من التنبيه. المصنّف ينبّه ولا يعاقب، وتقديره قد يخطئ. أربع فئات تنبّه بعد وصول الرسالة: تنمّر أو إهانة، تهديد بالأذى، كلام غير لائق، ضيق شديد (Q-413). الضيق لا يُحجب أبداً: الرسالة تصل، والأهل يُنبَّهون فوراً، ولا يُعرض حذفها ولا إغلاق المحادثة. جرّب الفئات من الاستوديو.',
  r(id, i) {
    const m = msgsOf(id)[+i], c = chOf(id); if (!can('chat.minor.view', c.mem.find(isMinor))) return empty('visibility_off', 'لا تملكين رؤية هذه المحادثة', `${M.ahmad.n} هو من يسمح بها.`);
    if (!m || m.del) return empty('block', 'الرسالة غير متاحة', 'حُذفت الرسالة التي رصدها المصنّف، فلا شيء يُعرض.');
    if (!m.flag) return empty('check_circle', 'أُغلق هذا التنبيه', 'لا شيء ينتظر قرارك هنا.', btn('افتح المحادثة', 'go:thread:' + id, 'sm sec', 'forum'), 'off');
    const show = S.flagShow === id + i, off = offline(), ck = flagCat(m), fc = FLAG_CAT[ck], dis = ck === 'distress';
    return `<div class="card"><div class="chips">${chip(fc[0], fc[2], 'chat_error')}${chip('الخطورة: ' + fc[1], 'ol')}</div><p style="margin:12px 0 2px"><b>رسالة من ${M[m.f].n} في محادثة ${c.mem.map(x => M[x].n).join(' و')}</b></p><p class="sm muted">اليوم ${m.at} · رصدها المصنّف الآلي، وقد يكون تقديره خاطئاً.</p>${dis ? callout('الرسالة وصلت كما هي ولم يُحجب شيء. نبّهناك لتكون قريباً.', 'in', 'info') : ''}
    ${show ? `<div class="card flat" style="margin-top:12px">«${m.x}»</div>` : `<div class="gap"></div>${btn('اعرض الرسالة', 'flagShow:' + id + ':' + i, off ? 'sec" disabled="' : 'sec', 'visibility')}${off ? '<p class="xs muted c" style="margin-top:8px">عرض الرسالة يحتاج اتصالاً. التنبيه نفسه محفوظ في هاتفك.</p>' : ''}`}</div>
    ${sec('ماذا تفعل؟')}${list(row('forum', `تحدّث مع ${M[m.f].n}`, 'محادثة بينك وبينه', { a: 'dmStart:' + m.f }), row('visibility', 'افتح المحادثة كاملة', 'للقراءة فقط', { a: 'go:thread:' + id }), row('thumb_up', dis ? 'اطمأننت: أغلق التنبيه' : 'لا مشكلة: تجاهل التنبيه', 'يُسجَّل ذلك بلا نص الرسالة', { a: `flagOk:${id}:${i}`, chev: false }),
      !dis && can('chat.message.delete.any') ? row('delete', 'احذف الرسالة للجميع', off ? 'يحتاج اتصالاً' : 'يظهر مكانها «حُذفت هذه الرسالة»', { a: off ? '' : `msgDel:${id}:${i}`, c: off ? 'dis' : '', ic: 'var(--danger)', chev: false }) : '',
      !dis && can('chat.channel.close') && !c.closed ? row('lock', 'أغلق المحادثة', 'يوقف الإرسال فيها حتى يُعاد فتحها', { a: 'go:chat-close:' + id }) : '')}
    ${sec('قبل الحديث')}<div class="card flat" id="ftips"><ul style="margin:0;padding-inline-start:18px;line-height:1.9">${FLAG_TIPS[dis ? 'distress' : 'other'].map(t => `<li>${t}</li>`).join('')}</ul></div>
    <p class="xs muted" style="margin:12px 4px">المصنّف يفحص النص والصور في محادثات الأبناء، ولا يفحص الرسائل الصوتية. ${why('classifier', 'كيف يعمل؟')}</p>`;
  },
});
const RV_CAT = { harm: 'تشجيع على إيذاء النفس', groom: 'نمط استدراج', sexual: 'محتوى جنسي يخص قاصراً' };
surface('chat-review', {
  t: 'رسائل أوقفها المصنّف', sys: 'S1-08', p: 'owner', req: '08:12,15',
  note: 'ثلاث فئات خطيرة فقط تُوقف قبل أن تصل: محتوى جنسي يخص قاصراً، تشجيع على إيذاء النفس، نمط استدراج. الرسالة لا تصل ولا تختفي بصمت: تأتي هنا، ومرسلها يعلم. تبقى 30 يوماً ثم تُحذف نهائياً. جرّب من الاستوديو: «المصنّف يوقف الرسالة التالية» ثم أرسل من هاتف خالد.',
  r() {
    if (!isOwner()) return empty('lock', 'هذه القائمة لصاحب العائلة', `${M.ahmad.n} هو من يراجع ما أوقفه المصنّف.`);
    const R = S.review || []; if (!R.length) return empty('check_circle', 'لا رسائل موقوفة', 'لم يوقف المصنّف أي رسالة. ما يوقفه يظهر هنا ولا يصل إلى أحد.');
    return `${callout('هذه الرسائل <b>لم تصل</b> إلى أحد. مرسلها يعلم أنها أُوقفت وأنك ستراها.', 'wa', 'block')}${R.map((r, n) => { const c = chOf(r.ch), show = S.rvShow === r.id;
      return `<div class="card"><div class="chips">${chip(RV_CAT[r.cat], 'da', 'block')}${chip('الخطورة: عالية', 'ol')}</div><p style="margin:12px 0 2px"><b>من ${M[r.f].n} في محادثة ${c.mem.map(x => M[x].n).join(' و')}</b></p><p class="sm muted">${r.at} · لم تُسلَّم</p>
      ${show ? `<div class="card flat" style="margin:12px 0">«${r.x}»</div>` : ''}<div class="btns3">${show ? '' : btn('اعرض الرسالة', 'rvShow:' + r.id, 'sm sec', 'visibility')}${btn(`تحدّث مع ${M[r.f].n}`, 'dmStart:' + r.f, 'sm sec', 'forum')}${c.closed ? '' : btn('أغلق المحادثة', 'go:chat-close:' + r.ch, 'sm sec', 'lock')}${btn('تجاهل', 'rvOk:' + r.id, 'sm sec', 'thumb_up')}</div></div>`; }).join('')}
    <p class="xs muted" style="margin:12px 4px">تبقى هنا 30 يوماً ثم تُحذف نهائياً. التجاهل يُسجَّل بلا نص الرسالة.</p>`;
  },
});

/* ---------- CH-08 استرداد سجل قناة الوالدين على جهاز جديد ---------- */
surface('chat-restore', {
  t: 'استرداد سجل قناة الوالدين', sys: 'S1-08', p: 'owner', req: '08:11,17',
  note: 'على جهاز جديد: الرقم السري، ثم رمز تحقق، ثم يُفك السجل على الهاتف نفسه. الخادم يسلّم نسخة مشفّرة لا يقرؤها. إن ضاع الرقم السري القديم فالسجل القديم لا يُسترد، ويُقال ذلك بلا وعد. الرمز التجريبي 246810. جرّب من الاستوديو: «السجل القديم لا يُسترد».',
  r() {
    CHS(); const r = S.cr; if (!isOwner()) return empty('lock', 'الاسترداد لصاحب العائلة', `${M.ahmad.n} وحده يسترد سجل قناة الوالدين.`);
    const steps = `<div class="steps3">${['الرقم السري', 'رمز التحقق', 'فك السجل'].map((t, i) => `<span class="${r.step > i ? 'dn' : r.step === i ? 'on' : ''}">${r.step > i ? ic('check') : i + 1}<small>${t}</small></span>`).join('')}</div>`;
    if (r.step === 9) return `<div class="empty">${art('lock', 'off')}<b>السجل القديم لا يمكن استرداده</b><div class="sm">تغيّر رقمك السري دون القديم، ومفتاح السجل كان مشتقاً منه. لا نملك نسخة نقرؤها ولا طريقاً آخر.<br><br>قناة الوالدين تعمل من الآن، وما يُكتب بعد اليوم محفوظ.</div><div style="margin-top:16px">${btn('افتح قناة الوالدين', 'openCh:parents', 'sm', 'forum')}</div></div>`;
    if (r.step === 3) return `${steps}<div class="empty">${art('check_circle', 'lit')}<b>عاد سجل قناة الوالدين</b><div class="sm">فُكّ على هذا الهاتف. لم يقرأه الخادم.</div><div style="margin-top:16px">${btn('افتح قناة الوالدين', 'openCh:parents', 'sm', 'forum')}</div></div>`;
    if (r.step === 2) return `${steps}<div class="card c" aria-busy="true"><div class="spin" style="display:inline-block">${ic('sync')}</div><p><b>نفك السجل على هذا الهاتف…</b></p><p class="sm muted">لا يغادر النص المفكوك هاتفك.</p></div>`;
    if (r.step === 1) return `${steps}<p class="ttl" style="text-align:start">أدخل رمز التحقق</p><p class="sub" style="text-align:start">أرسلناه إلى رقمك المسجَّل.</p>
      ${r.lock ? callout('خمس محاولات خاطئة. انتظر 15 دقيقة ثم اطلب رمزاً جديداً.', 'da', 'lock_clock') : `<div class="otp">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i === r.otp.length ? 'cur' : ''}">${r.otp[i] || ''}</i>`).join('')}</div>${r.bad ? `<p class="c sm" style="color:var(--danger);margin:-4px 0 12px" role="alert">الرمز غير صحيح. بقيت ${5 - r.bad} محاولات.</p>` : ''}
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="crK:${n}">${n}</button>`).join('')}<span></span><button data-a="crK:0">0</button><button class="gh" data-a="crK:b" aria-label="حذف">${ic('backspace')}</button></div>`}`;
    return `${steps}${callout('رسائل قناة الوالدين مشفّرة من طرف إلى طرف. على هاتف جديد تحتاج استردادها مرة واحدة.', '', 'encrypted')}
    ${list(row('lock', 'رقمك السري', 'يُشتق منه مفتاح السجل على هاتفك', { chev: false }), row('sms', 'رمز تحقق', 'يصلك على رقمك المسجَّل', { chev: false }), row('backup', 'فك السجل هنا', 'الخادم يسلّم نسخة مشفّرة لا يقرؤها', { chev: false }))}
    ${offline() ? callout('الاسترداد يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}<div class="gap"></div>${btn('ابدأ الاسترداد', 'crGo', offline() ? '" disabled="' : '', 'backup')}`;
  },
});

/* ---------- إعدادات المحادثة (سطح التحكم §9-3) ---------- */
surface('chat-settings', {
  t: 'إعدادات المحادثة', sys: 'S1-08', p: 'adult', req: '08:3,4,11,12,13,15,17',
  note: 'المصنّف يعمل دائماً لمن دون 13، وللمراهق بمفتاح يملكه صاحب العائلة وحده (الافتراضي تشغيل)؛ إيقافه بتأكيد واتصال. الرسائل تبقى حتى يحذفها صاحب العائلة، والمحذوف يُمحى نهائياً بعد 7 أيام، وما رصده المصنّف بعد 30 يوماً.',
  r() { const own = isOwner(), on = S.clsTeen ?? true, rv = (S.review || []).length, kids = minorsSeen();
    return `${sec('الأمان')}${list(row('chat_error', 'المصنّف الآلي: ليان', 'دون 13 سنة: يعمل دائماً', { v: chip('دائم', 'ok', 'lock'), chev: false }),
      own ? row('chat_error', 'المصنّف الآلي: خالد', on ? 'ينبّهك عند رسالة مقلقة' : 'متوقف: لا تنبيهات عن رسائله', { tg: on, ta: 'clsT' }) : row('chat_error', 'المصنّف الآلي: خالد', `يتحكم به ${M.ahmad.n}`, { v: chip(on ? 'يعمل' : 'متوقف', on ? 'ok' : 'stale'), chev: false }),
      kids.length ? row('visibility', 'محادثات الأبناء', 'للقراءة فقط', { a: 'go:minor-chats:' + kids[0] }) : row('visibility_off', 'محادثات الأبناء', `${M.ahmad.n} هو من يسمح برؤيتها`, { v: avail('not_delegated'), chev: false }),
      own ? row('block', 'رسائل أوقفها المصنّف', rv ? 'لم تُسلَّم · تنتظر قرارك' : 'لا شيء الآن', { a: 'go:chat-review', v: rv ? chip(String(rv), 'da') : '' }) : '')}
    <p class="xs muted" style="margin:8px 4px">يفحص النص والصور في محادثات الأبناء بالاتجاهين، ولا يفحص الرسائل الصوتية ولا قناة الوالدين. ${why('classifier', 'كيف يعمل؟')}</p>
    ${can('chat.parents.view') ? sec('قناة الوالدين') + list(row('encrypted', 'مشفّرة من طرف إلى طرف', 'الخادم يحفظ نصاً مشفّراً لا يقرؤه', { v: chip('مشفّرة', 'ok'), chev: false }), row('lock', 'تُفتح بالرقم السري في كل مرة', 'ولا يظهر نصها في الإشعارات', { chev: false }), own ? row('backup', 'استرداد السجل على جهاز جديد', 'بالرقم السري ثم رمز تحقق', { a: 'go:chat-restore' }) : '') : ''}
    ${sec('حفظ الرسائل')}${list(row('database', 'الرسائل تبقى', `حتى يحذفها ${own ? 'صاحب العائلة' : M.ahmad.n}`, { v: 'دائماً', chev: false }), row('delete', 'ما حُذف للجميع', 'يُمحى نهائياً خلال 7 أيام', { chev: false }), row('chat_error', 'ما رصده المصنّف ثم حُذف', 'يبقى 30 يوماً للمراجعة ثم يُمحى', { chev: false }))}`; },
});

/* من يرى محادثات الابن (Q-435): الأب دائماً، والأم ما دامت عندها «قراءة محادثات الأطفال» لهذا الابن. سحب الصلاحية يغيّر ما يُقال للابن فوراً. */
const momSees = id => { const g = S.g['chat.minor.view']; return !S.removed.sara && gLive(g) && (g.sc === 'all' || (Array.isArray(g.sc) && g.sc.includes(id))); };
const chSeers = (id, teen) => (teen ? (momSees(id) ? 'لوالدك ووالدتك' : 'لوالدك') : (momSees(id) ? 'بابا وماما يستطيعان' : 'بابا يستطيع'));
function chLog(t, k) { S.audit.unshift({ t, w: me().n, at: 'الآن', k }); }
/* وصول الرسالة: للخادم ثم مقروءة. تُستدعى بمؤقت في العرض ومباشرة في الفحص. */
function chDeliver(m, read) { if (m.q || m.fail || m.blk || m.del) return; m.st = read ? 2 : Math.max(m.st, 1); }
Object.assign(ACT, {
  openCh(id) { if (id === 'parents') return gate('قناة الوالدين محمية', () => { S.sheet = null; go('thread', id); }); go('thread', id); },
  dmStart(x) { S.sheet = null; const u = me().id; let id = dmId(u, x); if (!id) { if (offline()) { toast('بدء محادثة جديدة يحتاج اتصالاً', null, 'cloud_off'); return; } id = `dm-${u}-${x}`; CHS()[id] = { mem: [u, x], k: 'dm' }; } msgsOf(id); go('thread', id); },
  grpNew() { S.grp = { n: '', mem: [] }; S.sheet = { id: 'chat-group', a: [] }; },
  grpT(x) { const g = S.grp, i = g.mem.indexOf(x); if (i >= 0) g.mem.splice(i, 1); else g.mem.push(x); },
  grpMake() { if (!grpOk()) return false; if (offline()) { toast('إنشاء مجموعة يحتاج اتصالاً', null, 'cloud_off'); return; } const u = me().id, id = 'grp-' + Object.keys(CHS()).length; CHS()[id] = { n: S.grp.n.trim(), mem: [u, ...S.grp.mem], k: 'group', i: 'groups' }; S.chat[id] = []; S.grp = null; S.sheet = null; chLog(`أنشأ مجموعة «${chOf(id).n}»`, 'chat.channel.create.group'); toast('أُنشئت المجموعة', null, 'groups'); go('thread', id); },
  send(id, kind, len, txt) {
    kind = typeof kind === 'string' ? kind : ''; len = typeof len === 'string' ? len : ''; txt = typeof txt === 'string' ? txt : '';
    const el = $('#cmp'), c = chOf(id), u = me().id, x = kind ? '' : txt || (el ? el.value.trim() : ''); if (!x && !kind) return false;
    if (c.closed || !c.mem.includes(u)) { toast('لا يمكن الإرسال: المحادثة مغلقة', null, 'lock'); return; }
    if (kind === 'img' && S.bigMedia) { S.cmpErr = `الصورة أكبر من ${IMG_MAX} م.ب. اختر صورة أصغر.`; return; }
    S.cmpErr = ''; S.emo = false; const m = { f: u, x, at: '5:12', st: 0, k: kind || '', len }; msgsOf(id).push(m); chRead(id);
    if (queue('رسالة إلى ' + (c.n || chName(id, u)), 'S1-08')) { m.q = 1; S.outbox[S.outbox.length - 1].m = m; }
    else if (S.blockNext && id !== 'parents' && chHasMinor(id) && !kind) { S.blockNext = false; m.blk = 1; (S.review = S.review || []).unshift({ id: 'rv' + Date.now(), ch: id, f: u, x, cat: 'harm', at: 'اليوم 5:12' }); S.alerts.unshift({ id: 'cb' + Date.now(), k: 'chat', kid: u, t: `رسالة من ${M[u].n} أوقفها المصنّف قبل أن تصل`, s: 'لم تُسلَّم · تنتظر قرارك', ago: 'الآن', p: 1, open: 1, rv: 1 }); }
    else if (S.sendFail) setTimeout(() => { m.fail = 1; render(); }, 400);
    else { setTimeout(() => { chDeliver(m); render(); }, 500); setTimeout(() => { chDeliver(m, 1); render(); }, 1500); }
    setTimeout(() => { const s = $('#scr'); if (s) s.scrollTop = s.scrollHeight; const i = $('#cmp'); if (i) i.focus(); }, 0);
  },
  sendK(id, k) { return ACT.send(id, k); },
  recGo(id) { if (chOf(id).closed) return false; S.rec = id; S.emo = false; },
  recX() { S.rec = null; toast('أُلغي التسجيل', null, 'delete'); },
  recSend(id) { S.rec = null; ACT.send(id, 'voice', '0:04'); },
  emoT() { S.emo = !S.emo; },
  emoAdd(e) { const i = $('#cmp'); if (i) { i.value += e; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); } return false; },
  imgLd(id, i) { msgsOf(id)[+i].ld = 1; },
  msgAct(id, i) { const m = msgsOf(id)[+i]; if (!m || m.del) return false; S.sheet = { id: 'msg-actions', a: [id, i] }; },
  msgCopy() { S.sheet = null; toast('نُسخ النص', null, 'content_copy'); },
  msgRetry(id, i) { const m = msgsOf(id)[+i]; S.sheet = null; if (offline()) { m.fail = 0; m.q = 1; m.st = 0; queue('رسالة إلى ' + chName(id, me().id), 'S1-08'); S.outbox[S.outbox.length - 1].m = m; toast('لا اتصال الآن: تُرسل عند عودته', null, 'cloud_off'); return; } if (S.sendFail) { toast('تعذّر الإرسال مرة أخرى. سنحاول تلقائياً.', null, 'error'); return; } m.fail = 0; m.st = 1; toast('أُرسلت', null, 'check'); },
  msgDrop(id, i) { const ms = msgsOf(id), m = ms[+i]; S.sheet = null; ms.splice(+i, 1); S.outbox = S.outbox.filter(o => o.m !== m); toast('أُلغيت الرسالة قبل إرسالها', null, 'delete'); },
  msgSelf(id, i) { const m = msgsOf(id)[+i], u = me().id; S.sheet = null; (m.hid = m.hid || []).push(u); toast('حُذفت من هاتفك فقط', () => { m.hid = m.hid.filter(x => x !== u); render(); }, 'delete'); },
  msgDel(id, i) {
    const m = msgsOf(id)[+i]; if (!can('chat.message.delete.any')) return ACT.denied('chat.message.delete.any'); S.sheet = null;
    confirmDlg('حذف الرسالة للجميع؟', `تُحذف من الخادم ومن كل الأجهزة، ويظهر مكانها «حُذفت هذه الرسالة». ${m.flag ? 'رصدها المصنّف: تبقى 30 يوماً للمراجعة ثم تُمحى نهائياً.' : 'تُمحى نهائياً خلال 7 أيام.'} لا تراجع بعد الحذف.`, 'احذف للجميع', () => {
      if (offline()) { toast('الحذف للجميع يحتاج اتصالاً', null, 'cloud_off'); return; }
      m.del = me().id; m.flag = 0; S.alerts.filter(a => a.k === 'chat' && !a.rv).forEach(a => { a.open = 0; }); chLog(`حذف رسالة ${M[m.f].n} للجميع`, 'chat.message.delete.any'); toast('حُذفت الرسالة للجميع', null, 'delete'); }, true);
  },
  flagShow(id, i) { if (offline()) return false; S.flagShow = id + i; chLog('عرض رسالة رصدها المصنّف', 'chat.minor.view'); },
  flagOk(id, i) { msgsOf(id)[+i].flag = 0; S.sheet = null; S.alerts.filter(a => a.k === 'chat' && !a.rv).forEach(a => { a.open = 0; }); chLog('تجاهل تنبيه المصنّف', 'chat.minor.view'); toast('أُغلق التنبيه', null, 'thumb_up'); },
  rvShow(id) { S.rvShow = id; chLog('عرض رسالة أوقفها المصنّف', 'chat.minor.view'); },
  rvOk(id) { S.review = S.review.filter(r => r.id !== id); S.alerts.filter(a => a.rv).forEach(a => { a.open = 0; }); chLog('تجاهل رسالة أوقفها المصنّف', 'chat.minor.view'); toast('أُزيلت من القائمة', null, 'thumb_up'); },
  minorPick(k) { const t = S.stack[S.stack.length - 1]; t.a = [k]; },
  clsWhy(x) { S.clsWhy = S.clsWhy === x ? '' : x; },
  chCloseDo(id) {
    const w = (S.clsWhy || '').trim(), c = chOf(id); if (!w) return false; if (!can('chat.channel.close')) return ACT.denied('chat.channel.close');
    if (offline()) { toast('الإغلاق يحتاج اتصالاً', null, 'cloud_off'); return; }
    c.closed = { by: me().id, why: w }; S.clsWhy = ''; S.sheet = null; if (S.rec === id) S.rec = null; chLog(`أغلق محادثة ${c.mem.map(x => M[x].n).join(' و')}: ${w}`, 'chat.channel.close'); toast('أُغلقت المحادثة', null, 'lock');
  },
  chReopen(id) {
    const c = chOf(id); if (!isOwner()) { toast(`${M.ahmad.n} وحده يعيد فتح المحادثة`, null, 'lock'); S.audit.unshift({ t: 'محاولة إعادة فتح محادثة مغلقة', w: me().n, at: 'الآن', k: 'chat.channel.close', deny: 1 }); return; }
    if (offline()) { toast('إعادة الفتح تحتاج اتصالاً', null, 'cloud_off'); return; }
    S.sheet = null; confirmDlg('إعادة فتح المحادثة؟', `يعود الإرسال فوراً بين ${c.mem.map(x => M[x].n).join(' و')}.`, 'أعد فتحها', () => { c.closed = null; chLog(`أعاد فتح محادثة ${c.mem.map(x => M[x].n).join(' و')}`, 'chat.channel.close'); toast('عاد الإرسال في المحادثة', null, 'lock_open'); });
  },
  clsT() {
    if (!isOwner()) return false; const on = S.clsTeen ?? true;
    if (offline()) { toast('تغيير المصنّف يحتاج اتصالاً', null, 'cloud_off'); return; }
    if (!on) { S.clsTeen = true; chLog('شغّل المصنّف لمحادثات خالد', 'chat.classifier.teen'); toast('المصنّف يعمل لمحادثات خالد', null, 'chat_error'); return; }
    confirmDlg('إيقاف المصنّف لمحادثات خالد؟', 'لن يصلك تنبيه عن رسائله، ولن تُوقف رسالة خطيرة قبل وصولها. محادثاته تبقى مرئية لك. يبقى المصنّف يعمل لليان.', 'أوقف المصنّف', () => { S.clsTeen = false; chLog('أوقف المصنّف لمحادثات خالد', 'chat.classifier.teen'); toast('أُوقف المصنّف لمحادثات خالد', null, 'chat_error'); }, true);
  },
  crGo() { if (offline()) return false; CHS(); S.cr = { step: 0, otp: '', bad: 0 }; gate('استرداد سجل قناة الوالدين', () => { S.cr.step = S.crDead ? 9 : 1; }, 'stepup'); },
  crK(d) {
    CHS(); const r = S.cr; if (r.lock || r.step !== 1) return false; if (d === 'b') { r.otp = r.otp.slice(0, -1); return; } if (r.otp.length >= 6) return false; r.otp += d; if (r.otp.length < 6) return;
    if (r.otp !== CR_OTP) { r.otp = ''; r.bad++; S.audit.unshift({ t: 'رمز استرداد خاطئ لسجل قناة الوالدين', w: me().n, at: 'الآن', k: 'chat.parents.view', deny: 1 }); if (r.bad >= 5) r.lock = true; return; }
    r.step = 2; setTimeout(() => { crDone(); render(); }, 1300);
  },
});
function crDone() { if (S.cr.step === 2) { S.cr.step = 3; chLog('استرد سجل قناة الوالدين على هذا الجهاز', 'chat.parents.view'); } }
