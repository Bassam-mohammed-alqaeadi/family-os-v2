/* ============ S1-06 المهام والتقويم ============
   مهمة واحدة لفرد واحد: يسندها الأب، أو بالغ عنده الصلاحية، أو المساعد ضمن التفويض الذي يضعه المالك.
   التسليم بدليل ← تحقق المساعد أو اعتماد بالغ ← الإيداع عبر دفتر المكافآت (S1-05) حاملاً من أسند ومن تحقق والدليل.
   التقويم بالتاريخين، ثلاثة أشهر قادمة، والتذكير يصل صاحب الحدث والأب. */

const TST = { PENDING: ['قيد التنفيذ', 'ol', 'radio_button_unchecked'], SUBMITTED: ['بانتظار الاعتماد', 'in', 'pending'], APPROVED: ['منجزة', 'ok', 'check_circle'], CANCELLED: ['ملغاة', '', 'cancel'], EXPIRED: ['فاتت', '', 'timer_off'] };
const TK_PF = {
  photo: ['صورة', 'photo_camera', 'يصوّر ما أنجز. المساعد يتحقق من الصورة ويودِع النقاط، وما لم يجزم به يأتيك.'],
  audio: ['تسجيل صوتي', 'mic', 'يسجّل بصوته، للتلاوة والقراءة. يتحقق المساعد منه كما في الصورة.'],
  self: ['إقرار منه', 'thumb_up', 'يقول إنه أنجز، بلا دليل. لا تودَع نقطة حتى يعتمدها بالغ.'],
};
const TK_LV = {
  off: ['لا يُعدّ مهاماً', 'يتحقق من الإنجاز فقط. المهام منك وممن أذنت لهم من البالغين.', 'block', 'لا يُعدّ', 'يتحقق من الإنجاز فقط، والمهام من البالغين.'],
  suggest: ['يقترح وأنت تقرّر', 'يعرض عليك المهمة وسببها. لا تصل أبناءك حتى توافق.', 'wand_stars', 'يقترح', 'يعرض المهمة وسببها، ولا تصل الأبناء حتى يوافق بالغ عنده صلاحية المهام.'],
  assign: ['يسند مباشرة ضمن حدودك', 'يسند مهاماً صغيرة داخل الحدود التي تضعها، ويخبرك بكل مهمة. تلغيها متى شئت.', 'bolt', 'يسند', 'يسند مهاماً صغيرة داخل حدود وضعها المالك، وكل مهمة موسومة باسمه.'],
};
const TK_RR = { none: 'مرة واحدة', daily: 'كل يوم', school: 'أيام الدراسة', days: 'أيام أختارها' };
const TK_ER = { none: 'مرة واحدة', week: 'كل أسبوع', year: 'كل سنة' };
const TK_IDEA = [['ترتيب الغرفة', 'home', 'photo'], ['قراءة عشر صفحات', 'school', 'audio'], ['حفظ خمس آيات', 'deen', 'audio'], ['سقي النباتات', 'home', 'photo']];
const TK_CI = ['menu_book', 'pets', 'music_note', 'palette', 'bolt', 'flag', 'groups', 'bedtime'];
const TK_CC = ['#6B3FA0', '#2A9DB8', '#B8860B', '#A6324B', '#3F7D5C', '#5B6472'];
const TK_MAXSUB = 10, TK_MAXCAT = 12;

/* ---------- الحالة ---------- */
const TK = () => S.tk || (S.tk = {
  pts: 10, rem: 60, proof: 'photo', rec: true, cats: {}, n: 0, sure: true,
  ai: { lv: 'suggest', mx: 10, pd: 1, kids: ['layan', 'khaled'] },
  sug: [
    { id: 's1', kid: 'layan', t: 'مراجعة جدول الضرب قبل الاختبار', cat: 'school', pts: 10, proof: 'photo', dk: '2026-11-16', hm: '1700', rr: 'none', why: 'في التقويم اختبار رياضيات لليان يوم الأربعاء، ولا مهمة مراجعة قبله.', src: 'تقويم العائلة ومهام ليان هذا الأسبوع', st: 'new' },
    { id: 's2', kid: 'khaled', t: 'ترتيب مكتب الدراسة', cat: 'home', pts: 0, proof: 'photo', dk: '2026-11-15', hm: '1700', rr: 'none', why: 'عند خالد مراجعة فيزياء غداً، والمكتب المرتب يسهّلها.', src: 'مهام خالد هذا الأسبوع', st: 'new' },
    { id: 's3', kid: 'layan', t: 'قراءة عشر صفحات قبل النوم', cat: 'school', pts: 15, proof: 'audio', dk: '2026-11-15', hm: '2000', rr: 'none', why: 'أنجزت ليان واجباتها أربعة أيام متتالية، ولا مهمة قراءة لها هذا الأسبوع.', src: 'سجل مهام ليان في آخر سبعة أيام', st: 'new' },
  ],
});
const tkT = id => S.tasks.find(x => x.id === id);
const tkCat = id => CAT[id] || TK().cats[id] || CAT.home;
const tkCats = () => Object.entries(CAT).concat(Object.entries(TK().cats));
const tkTeen = id => M[id].role !== 'child';

/* ---------- التاريخ والوقت ---------- */
const TK_TODAY = '2026-11-15', TK_END = '2027-02-15';
const TK_GM = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const TK_WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const tkKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const tkDt = k => { const [y, m, d] = String(k).split('-').map(Number); return new Date(y, m - 1, d); };
const tkAdd = (k, n) => { const d = tkDt(k); d.setDate(d.getDate() + n); return tkKey(d); };
const tkHj = (k, o = { day: 'numeric', month: 'long' }) => { try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', o).format(tkDt(k)).replace(/\s*هـ/, ''); } catch (e) { return ''; } };
const tkDayT = k => (k === TK_TODAY ? 'اليوم' : k === tkAdd(TK_TODAY, 1) ? 'غداً' : k === tkAdd(TK_TODAY, -1) ? 'أمس' : `${TK_WD[tkDt(k).getDay()]} ${tkDt(k).getDate()} ${TK_GM[tkDt(k).getMonth()]}`);
const tkLong = k => `${TK_WD[tkDt(k).getDay()]} ${tkDt(k).getDate()} ${TK_GM[tkDt(k).getMonth()]} ${tkDt(k).getFullYear()}`;
const tkTm = hm => { const h = +String(hm).slice(0, 2), m = String(hm).slice(2); return `${h % 12 || 12}:${m} ${h < 12 ? 'ص' : 'م'}`; };
const tkTmAdd = (hm, d) => { const v = Math.max(300, Math.min(1380, +String(hm).slice(0, 2) * 60 + +String(hm).slice(2) + d)); return String(Math.floor(v / 60)).padStart(2, '0') + String(v % 60).padStart(2, '0'); };
const tkRm = n => (+n >= 1440 ? 'قبل يوم' : +n === 60 ? 'قبل ساعة' : `قبل ${n} دقيقة`);
const tkDk = t => t.dk || (/غداً/.test(t.due) ? tkAdd(TK_TODAY, 1) : /أمس/.test(t.due) ? tkAdd(TK_TODAY, -1) : TK_TODAY);
const tkRR = t => t.rr || (t.rep === 'يومياً' ? 'daily' : t.rep === 'كل يوم دراسي' ? 'school' : t.rep ? 'days' : 'none');
const tkWd = t => (tkRR(t) === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : tkRR(t) === 'school' ? [0, 1, 2, 3, 4] : t.wd || [0, 3]);
const tkRepT = (rr, wd) => (rr === 'daily' ? 'يومياً' : rr === 'school' ? 'كل يوم دراسي' : rr === 'days' ? wd.slice().sort().map(d => TK_WD[d]).join(' و') : '');
function tkOn(t, k) { if (t.st === 'CANCELLED' || t.st === 'EXPIRED' || k > TK_END) return false; const d = tkDk(t); return tkRR(t) === 'none' ? d === k : k >= d && tkWd(t).includes(tkDt(k).getDay()); }
function tkEvOn(e, k) { if (k === e.dk) return true; if (k < e.dk || k > TK_END || !e.rr || e.rr === 'none') return false; const a = tkDt(e.dk), b = tkDt(k); return e.rr === 'week' ? a.getDay() === b.getDay() : a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

/* ---------- من أسند، وما الدليل، ولماذا وصلت إلى بالغ ---------- */
const tkEv = t => (t.proof === 'photo' ? 'صورة الإثبات' : t.proof === 'audio' ? 'تسجيل صوتي' : 'إقرار ' + M[t.kid].n);
const tkBy = (t, kidV) => (t.by === 'ai' ? 'المساعد، ضمن تفويض ' + (kidV ? rwDad() : 'المالك') : t.by === t.kid ? (kidV ? 'أنت' : M[t.kid].n + ' لنفسه') : rwWho(t.by || 'ahmad', kidV) + (t.sg ? ' · باقتراح من المساعد' : ''));
const tkWhyHere = t => (t.off ? 'سُلّمت دون اتصال · تصلك حين يعود' : t.re ? 'أُعيدت من قبل، فجاء التسليم الجديد إلى بالغ مباشرة' : t.proof === 'self' ? 'إقرار بلا دليل · الاعتماد لبالغ دائماً' : S.aiKill ? 'المساعد متوقف · القرار لك' : t.ai === 'unsure' ? `تعذّر على المساعد التحقق من ${t.proof === 'audio' ? 'التسجيل' : 'الصورة'} · القرار لك` : 'بانتظار اعتمادك');
function tkLog(g) { S.agent.unshift(Object.assign({ id: 'gt' + (++TK().n), at: 'الآن', undo: 0 }, g)); return S.agent[0]; }

/* الإيداع قيد واحد في دفتر المكافآت يحمل من أسند ومن تحقق والدليل. المراهق ومن جُمّدت محفظته بلا إيداع (Q-109). */
function tkCredit(t, vf) {
  const r = t.pts && RW().src.tasks ? rwEarn(t.kid, { k: 'task', n: t.pts, t: t.t, as: t.by || 'ahmad', vf, ev: tkEv(t) + (vf === 'ai' ? ' وتحقق المساعد' : ' واعتماد ' + M[vf].n) }) : null;
  t.st = 'APPROVED'; t.vf = vf; t.cele = r ? 1 : 0; t.lid = r ? r.x.id : null; t.bid = r && r.b ? r.b.id : null; return r;
}
function tkUncredit(t, by) { let n = 0; if (t.bid) n += rwRev(t.kid, t.bid, by); if (t.lid) n += rwRev(t.kid, t.lid, by); t.lid = t.bid = null; t.cele = 0; t.vf = null; return n; }

/* التسليم: دليل مباشر يتحقق منه المساعد ويعتمد، وما لم يجزم به يحال إلى بالغ. الإقرار وحده، وما أُعيد من قبل، يذهبان إلى بالغ دائماً (Q-110، Q-167). */
function tkSubmit(id) {
  const t = tkT(id), k = M[t.kid]; t.re = t.note ? 1 : t.re || 0; t.note = ''; S.tkP = null; S.sheet = null;
  if (queue('تسليم «' + t.t + '»', 'S1-06')) { t.st = 'SUBMITTED'; t.ai = ''; t.off = 1; toast('حُفظ التسليم · يُرسل عند الاتصال', null, 'cloud_upload'); return; }
  t.off = 0; const ai = !S.aiKill && t.proof !== 'self' && !t.re, what = t.proof === 'audio' ? 'تسجيل' : 'صورة';
  if (ai && TK().sure && !t.hard) {
    const r = tkCredit(t, 'ai'); t.cele = 0;
    tkLog({ t: `تحقّق من ${what} مهمة «${t.t}»`, k: 'agent.task.verify', gate: 'تحقق من الدليل ثم اعتمد بتفويضك', st: 'نُفّذ', kid: t.kid, need: 'tasks.approve', tid: t.id, ev: `${what === 'صورة' ? 'صورة الإثبات' : 'التسجيل الصوتي'} من ${k.n}: يطابق المطلوب في المهمة.`, res: r ? `اعتُمدت المهمة وأُودعت ${rwPt(t.pts)} في محفظة ${k.n}. تلغي التحقق في يومه من صفحة المهمة.` : 'اعتُمدت المهمة بلا نقاط.', kt: 'تحقق المساعد من مهمتك', kres: r ? `اعتُمدت «${t.t}» ودخلت نقاطها محفظتك.` : `اعتُمدت «${t.t}».` });
    if (r) rwCele(); toast(r ? `${vb(k, 'أحسنت', 'أحسنتِ')}! تحقق المساعد · +${rwPt(t.pts)}${r.b ? ` ومعها مكافأة السلسلة ${r.b.n}` : ''}` : `${vb(k, 'أحسنت', 'أحسنتِ')}! تحقق المساعد واعتُمدت`, null, 'celebration');
  } else {
    t.st = 'SUBMITTED'; t.ai = ai ? 'unsure' : '';
    if (ai) tkLog({ t: `تحقّق من ${what} مهمة «${t.t}»`, k: 'agent.task.verify', gate: 'تعذّر الجزم ← أُحيل إليك', st: 'محال', kid: t.kid, need: 'tasks.approve', tid: t.id, ev: `${what === 'صورة' ? 'صورة الإثبات' : 'التسجيل الصوتي'} من ${k.n}: لا يكفي للجزم.`, res: 'لم يجزم، فبقيت المهمة بانتظار اعتمادك ولم تودَع نقاط.', kt: 'نظر المساعد في مهمتك', kres: `لم يتأكد، فأرسلها إلى ${rwDad()}.` });
    toast(`أُرسلت! ${rwDad()} ${vb(M.ahmad, 'سيراجعها', 'ستراجعها')}`, null, 'check_circle');
  }
}

/* منتصف الليل بتوقيت العائلة (Q-123، Q-183): ما لم يُسلَّم من نسخة اليوم ينتهي ولا يتراكم، والمتكررة تبدأ نسخة جديدة وحدها.
   ما سُلّم في وقته يبقى بانتظار الاعتماد ولا يضيع بتأخر البالغ. */
function tkMidnight() {
  const old = [];
  S.tasks.forEach(t => { const rec = tkRR(t) !== 'none';
    if (t.st === 'PENDING') { if (rec) old.push(Object.assign({}, t, { id: t.id + 'x' + (++TK().n), st: 'EXPIRED', due: 'أمس', rr: 'none', wd: null, rep: tkRepT(tkRR(t), tkWd(t)) || t.rep })); else if (tkDk(t) <= TK_TODAY) t.st = 'EXPIRED'; if (rec) { t.note = ''; t.re = 0; t.dn = []; } }
    else if (t.st === 'APPROVED' && rec) { t.st = 'PENDING'; t.vf = t.lid = t.bid = null; t.re = 0; t.dn = []; t.ai = ''; } });
  S.tasks.push(...old); return old.length;
}

/* ---------- القوائم ---------- */
const tkSugs = () => (S.aiKill || TK().ai.lv === 'off' ? [] : TK().sug.filter(s => s.st === 'new' && can('tasks.create', s.kid)));
const tkAiToday = kid => S.tasks.filter(t => t.by === 'ai' && t.kid === kid && t.st !== 'CANCELLED').length;
const tkFits = (s, A = TK().ai) => A.kids.includes(s.kid) && s.pts <= A.mx && tkAiToday(s.kid) < A.pd;
const tkWhyNot = (s, A = TK().ai) => (!A.kids.includes(s.kid) ? `${M[s.kid].n} خارج من يسند لهم` : s.pts > A.mx ? `فوق حدّ ${rwPt(A.mx)}` : 'بلغ عدد مهامه اليوم');
function tkRowT(t) {
  const c = tkCat(t.cat), rep = tkRepT(tkRR(t), tkWd(t)) || t.rep || '';
  return row(c[1], t.t, [pname(M[t.kid]), t.due, rep && ic('repeat', 'xs') + rep, t.by === 'ai' && ic('wand_stars', 'xs') + 'من المساعد', t.hm && t.st === 'PENDING' && cfLive(t.kid).some(c => cfHas(c, 'task.' + t.id)) && ic('warning', 'xs') + 'متعارض'].filter(Boolean).join(' · '), { ic: c[2], a: t.st === 'SUBMITTED' && can('tasks.approve', t.kid) ? `go:task-review:${t.id}` : `go:task:${t.id}`, v: chip(TST[t.st][0], TST[t.st][1], TST[t.st][2]) });
}
function tkSugCard() {
  const P = tkSugs(); if (!P.length) return '';
  return `<div class="ai"><div class="lb">${ic('wand_stars')}اقتراحات المساعد</div><p>${P.length === 1 ? 'مهمة مقترحة' : P.length === 2 ? 'مهمتان مقترحتان' : P.length + ' مهام مقترحة'}، أولها «${P[0].t}» ل${pname(M[P[0].kid])}. لا تصل أبناءك حتى توافق.</p>${btn('راجع الاقتراحات', 'go:tk-ai', 'ton')}</div>`;
}
const tkFilter = V => `<div class="tkf"><button aria-pressed="${(S.tf || 'all') === 'all'}" data-a="set:tf:all">الكل</button>${V.map(id => `<button aria-pressed="${S.tf === id}" data-a="set:tf:${id}">${av(M[id], 'sm')}${pname(M[id])}</button>`).join('')}</div>`;

surface('tasks', {
  t: 'المهام والتقويم', sys: 'S1-06', p: 'adult', a: [''], req: '06:1,2,3,5,10,11,12,13,16 09:17',
  note: 'S06-01 وS06-06 في شاشة واحدة بتبويبين. المهام مرتبة بما يحتاج قراراً أولاً، ثم ما هو قيد التنفيذ، ثم المنجز، ثم ما فات أو أُلغي. اقتراحات المساعد بطاقة هادئة أعلى القائمة ولا تدخل «يتطلب انتباهك». البالغ المفوَّض يرى أبناء نطاقه فقط، ولا يظهر له زر لا يملك صلاحيته. القائمة تُقرأ دون اتصال.',
  act: () => (KIDS.some(id => can('tasks.create', id)) ? `<button class="ib" data-a="go:task-new" aria-label="مهمة جديدة">${ic('add')}</button>` : ''),
  r(kid) {
    const v = S.tv || 'tasks', V = KIDS.filter(id => can('tasks.view', id)); if (!S.tf && kid && V.includes(kid)) S.tf = kid;
    if (!V.length) return empty('lock_person', 'المهام ليست ضمن صلاحياتك', 'يمنحك المالك صلاحية المهام من «العائلة».');
    const f = V.includes(S.tf) ? S.tf : 'all', T = S.tasks.filter(t => V.includes(t.kid) && (f === 'all' || t.kid === f)), G = (...st) => T.filter(t => st.includes(t.st)), mk = KIDS.some(id => can('tasks.create', id));
    const grp = (h, L, more, a) => (L.length ? sec(h + ' · ' + L.length, more, a) + list(L.map(tkRowT)) : '');
    return seg([['tasks', 'المهام'], ['cal', 'التقويم']], v, 'set:tv') + tkFilter(V) + (v === 'cal' ? tkCal(can('calendar.event.create')) : `${tkSugCard()}
    ${T.length ? grp('تنتظر قرارك', G('SUBMITTED')) + grp('قيد التنفيذ', G('PENDING')) + grp('أُنجزت', G('APPROVED')) + grp('فاتت أو أُلغيت', G('EXPIRED', 'CANCELLED')) : empty('add_task', 'لا مهام بعد', mk ? 'أنشئ أول مهمة وحدّد نقاطها.' : 'حين تُسند مهمة تظهر هنا.', mk ? btn('أنشئ مهمة', 'go:task-new') : '')}
    ${G('EXPIRED').length ? `<p class="sm muted" style="margin:0 4px 10px">ما فات يومه ينتهي عند منتصف الليل ولا يتراكم. ${why('tkexp')}</p>` : ''}
    ${isOwner() ? list(row('tune', 'ضوابط المهام والتقويم', 'الافتراضات والفئات وتفويض المساعد', { a: 'go:tk-settings' })) : ''}`);
  },
});

/* ---------- التقويم المزدوج: الشهر الحالي وثلاثة أشهر قادمة ---------- */
function tkCal(add) {
  const mi = Math.max(0, Math.min(3, +S.tkM || 0)), base = new Date(2026, 10 + mi, 1), y = base.getFullYear(), m = base.getMonth(), n = new Date(y, m + 1, 0).getDate(), off = (base.getDay() + 1) % 7;
  const adult = isAdult(), V = adult ? KIDS.filter(id => can('tasks.view', id)) : [me().id], f = adult && V.includes(S.tf) ? S.tf : 'all';
  const evs = k => S.events.filter(e => tkEvOn(e, k) && (f === 'all' || e.who === 'all' || e.who === f));
  const tks = k => S.tasks.filter(t => V.includes(t.kid) && (f === 'all' || t.kid === f) && tkOn(t, k));
  const K = d => tkKey(new Date(y, m, d)), sel = S.tkDay && tkDt(S.tkDay).getMonth() === m && tkDt(S.tkDay).getFullYear() === y ? S.tkDay : mi === 0 ? TK_TODAY : K(1);
  const h1 = tkHj(K(1), { month: 'long' }), h2 = tkHj(K(n), { month: 'long' }), hy = tkHj(K(n), { year: 'numeric' });
  const cell = d => { const k = K(d), out = k > TK_END, E = !out && evs(k).length, T = !out && tks(k).length; return `<button class="${k === TK_TODAY ? 'td' : ''} ${k === sel ? 'sl' : ''} ${out ? 'o' : ''}" ${out ? 'disabled' : `data-a="tkDay:${k}"`} aria-label="${tkLong(k)}">${d}<small>${tkHj(k, { day: 'numeric' })}</small><i>${E ? '<u class="e"></u>' : ''}${T ? '<u class="t"></u>' : ''}</i></button>`; };
  const E = evs(sel), T = tks(sel);
  return `<div class="card tkcal"><div class="tkmh"><button class="ib" data-a="tkMon:-1" aria-label="الشهر السابق" ${mi === 0 ? 'disabled' : ''}>${ic('chevron_right')}</button><div class="c"><b>${TK_GM[m]} ${y}</b><span class="sm muted">${h1 === h2 ? h1 : h1 + ' – ' + h2} ${hy}</span></div><button class="ib" data-a="tkMon:1" aria-label="الشهر التالي" ${mi === 3 ? 'disabled' : ''}>${ic('chevron_left')}</button></div>
  <div class="cal">${['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'].map(d => `<span class="dn">${d}</span>`).join('')}${'<span></span>'.repeat(off)}${Array.from({ length: n }, (_, i) => cell(i + 1)).join('')}</div>
  <div class="tklg"><span><u class="e"></u>حدث</span><span><u class="t"></u>مهمة</span>${mi === 3 ? '<span>يُعرض حتى 15 فبراير: ثلاثة أشهر قادمة</span>' : ''}</div></div>
  ${sec(`${tkDayT(sel)} · ${tkHj(sel)}`, add ? 'حدث جديد' : '', add ? 'tkEvNew:' + sel : '')}
  ${E.length || T.length ? list(E.map(e => row('event', e.t + (adult ? cfEvTag(e) : ''), `${tkTm(e.hm)} · ${tkWho(e)}${e.loc ? ' · ' + e.loc : ''}`, { ic: 'var(--accent)', a: 'go:event:' + e.id })), T.map(t => row(tkCat(t.cat)[1], t.t, `${adult ? pname(M[t.kid]) + ' · ' : ''}مهمة${tkRR(t) !== 'none' ? ' متكررة' : ''}`, { ic: tkCat(t.cat)[2], a: adult ? 'go:task:' + t.id : sel === TK_TODAY ? 'go:c-task:' + t.id : '' }))) : `<div class="card flat c sm muted">لا شيء في هذا اليوم</div>`}`;
}
const tkWho = e => (e.who === 'all' ? 'العائلة كلها' : pname(M[e.who]));
const tkRemWho = (e, kidV) => (e.who === 'all' ? 'يصل كل أفراد العائلة' : kidV ? (e.who === me().id ? `يصلك أنت و${rwDad()}` : `يصل ${M[e.who].n} و${rwDad()}`) : e.who === 'ahmad' ? 'يصل أحمد وحده' : `يصل ${M[e.who].n} وأحمد فقط`);

surface('fam-cal', {
  t: 'تقويم العائلة', sys: 'S1-06', p: 'kid', req: '06:10,12,13',
  note: 'S06-06 للطفل والمراهق: عرض فقط. شهر مزدوج بالتاريخين وأحداث العائلة ومهامه هو. لا زر إنشاء.',
  r() { return tkCal(false); },
});

surface('event', {
  kind: 'sheet', t: 'حدث في التقويم', sys: 'S1-06', p: 'any', a: ['e1'], req: '06:12,13,14',
  note: 'S06-07 عرضاً. التاريخان معاً، ولمن الحدث، ومن يصله التذكير. التعديل والحذف لمن عنده صلاحية أحداث التقويم فقط، والطفل والمراهق يريانه عرضاً.',
  r(id) {
    const e = S.events.find(x => x.id === id); if (!e) return `<h4>لم يعد هذا الحدث في التقويم</h4><p class="d">ربما حُذف.</p>${btn('حسناً', 'close')}`;
    const kidV = !isAdult(), ed = can('calendar.event.create');
    return `<div class="fx" style="margin-bottom:10px"><span class="qi lg ac">${ic('event')}</span><div><h4 style="margin:0">${e.t}</h4><span class="sm muted">${tkWho(e)}</span></div></div>
    ${list(row('today', tkLong(e.dk), tkHj(e.dk, { day: 'numeric', month: 'long', year: 'numeric' }) + ' هـ'), row('schedule', tkTm(e.hm), e.rr && e.rr !== 'none' ? 'يتكرر ' + TK_ER[e.rr] : ''), e.loc ? row('location_on', e.loc, 'المكان') : '', row('alarm', 'التذكير ' + tkRm(e.rem), tkRemWho(e, kidV), { a: 'go:tk-remind:' + id }))}
    ${kidV ? '' : `<p class="sm muted" style="margin:0 4px 10px">أضافه ${M[e.by || 'ahmad'].n}.</p>${cfEvHere(e)}`}
    ${ed ? `<div class="btns">${btn('احذف', 'tkEvDel:' + id, 'dng sec')}${btn('عدّل', 'tkEvEdit:' + id, 'sec')}</div>` : ''}`;
  },
});
const tkEvD = (dk, id) => ({ id: id || '', t: '', dk: dk || TK_TODAY, hm: '1700', who: 'all', rem: TK().rem, loc: '', rr: 'none' });
surface('event-new', {
  kind: 'sheet', t: 'حدث تقويم', sys: 'S1-06', p: 'adult', req: '06:12,13,14',
  note: 'S06-07 وS06-08. عنوان، يوم بالتاريخين، وقت، لمن (فرد واحد أو العائلة كلها)، تذكير، مكان، تكرار. خيارات التذكير تشرح من يصله عند الاختيار. الإنشاء للأب أو لبالغ عنده الصلاحية.',
  r() {
    const d = S.ev = S.ev || tkEvD(S.tkDay), who = [['all', 'العائلة كلها']].concat(Object.keys(M).filter(id => M[id].role).map(id => [id, M[id].n]));
    return `<h4>${d.id ? 'تعديل الحدث' : 'حدث جديد'}</h4><p class="d">يظهر في تقويم العائلة بالتاريخين.</p>
    <label class="fld"><span>العنوان</span><input id="evT" maxlength="60" placeholder="مثال: زيارة الجدة" value="${d.t}"></label>
    <div class="fld"><span>اليوم</span>${tkStep('tkEvDay', `<b>${tkLong(d.dk)}</b><small>${tkHj(d.dk, { day: 'numeric', month: 'long', year: 'numeric' })} هـ</small>`, d.dk <= TK_TODAY, d.dk >= TK_END, 'اليوم')}</div>
    <div class="fld"><span>الوقت</span>${tkStep('tkEvTm', `<b>${tkTm(d.hm)}</b>`, d.hm <= '0500', d.hm >= '2300', 'الوقت')}</div>
    <div class="fld"><span>لمن؟</span><div class="chips tkp">${who.map(([id, n]) => `<button class="chip ${d.who === id ? 'in' : 'ol'}" data-a="tkEvSet:who:${id}">${id === 'all' ? ic('groups') : av(M[id], 'sm')}${n}</button>`).join('')}</div></div>
    <div class="fld"><span>التذكير</span>${seg([[15, '15 دقيقة'], [30, '30 دقيقة'], [60, 'ساعة'], [1440, 'يوم']], +d.rem, 'tkEvSet:rem')}<p class="xs muted" style="margin:-6px 4px 0">${tkRm(d.rem)} · ${tkRemWho(d, false)}. يصل ولو كان الجهاز بلا إنترنت.</p></div>
    <label class="fld"><span>المكان (اختياري)</span><input id="evL" maxlength="40" placeholder="مثال: بيت الجدة" value="${d.loc || ''}"></label>
    <div class="fld"><span>التكرار</span>${seg(Object.entries(TK_ER), d.rr, 'tkEvSet:rr')}</div>
    ${btn(offline() ? 'احفظ · يُرسل عند الاتصال' : d.id ? 'احفظ التعديل' : 'أضف الحدث', 'evSave', '', offline() ? 'cloud_upload' : '')}`;
  },
});
const tkStep = (a, mid, lo, hi, lbl) => `<div class="tkst"><button class="ib" data-a="${a}:-1" aria-label="${lbl} السابق" ${lo ? 'disabled' : ''}>${ic('chevron_right')}</button><div>${mid}</div><button class="ib" data-a="${a}:1" aria-label="${lbl} التالي" ${hi ? 'disabled' : ''}>${ic('chevron_left')}</button></div>`;
surface('tk-remind', {
  kind: 'sheet', t: 'كيف يصل التذكير', sys: 'S1-06', p: 'any', a: ['e1'], req: '06:14',
  note: 'S06-08 استلاماً. التذكير يصل صاحب الحدث والأب فقط (Q-281)، مرة واحدة في وقته، ويعمل دون اتصال لأن الجهاز يحفظ موعده. الخادم مالك الجدولة (Q-280). سلوك iOS الدقيق مسجّل في قائمة المرحلة.',
  r(id) {
    const e = S.events.find(x => x.id === id) || S.events[0], kidV = !isAdult(), own = e.who !== 'all' && M[e.who], when = +e.rem >= 1440 ? 'غداً' : +e.rem === 60 ? 'بعد ساعة' : `بعد ${e.rem} دقيقة`;
    const card = (to, txt) => `<div class="xs muted" style="margin:0 4px 4px">${to}</div><div class="tkn"><span class="qi ac">${ic('alarm')}</span><div><b>${txt}</b><span>${tkDayT(e.dk)} ${tkTm(e.hm)}${e.loc ? ' · ' + e.loc : ''}</span></div></div>`;
    return `<h4>كيف يصل التذكير</h4><p class="d">${tkRm(e.rem)} من «${e.t}».</p>
    ${kidV ? card('على جهازك', `${when}: ${e.t}`) : (own && e.who !== 'ahmad' ? card(`على جهاز ${own.n}`, `${when}: ${e.t}`) : '') + card(e.who === 'all' ? 'على أجهزة العائلة كلها' : 'على جهاز أحمد', own && e.who !== 'ahmad' ? `${when}: ${e.t} · ${own.n}` : `${when}: ${e.t}`)}
    ${list(row('groups', 'من يصله', tkRemWho(e, kidV)), row('cloud_off', 'يصل بلا إنترنت', 'الجهاز يحفظ الموعد وينبّه في وقته'), row('notifications', 'مرة واحدة', 'لا يتكرر ولا يلحّ'))}
    ${btn('حسناً', 'close', 'sec')}`;
  },
});

/* ---------- تفصيل المهمة (البالغ) ---------- */
const tkSay = t => (t.st === 'PENDING' ? (t.note ? `أُعيدت بملاحظة: «${t.note}»` : 'لم تُسلَّم بعد') : t.st === 'SUBMITTED' ? tkWhyHere(t) : t.st === 'APPROVED' ? (t.by === t.kid ? 'أنجزها بنفسه · مهمة شخصية بلا اعتماد' : t.vf === 'ai' ? 'تحقق منها المساعد واعتمدها بتفويض المالك' : t.vf ? 'اعتمدها ' + M[t.vf].n : 'اعتُمدت اليوم') : t.st === 'EXPIRED' ? 'فات يومها. انتهت عند منتصف الليل ولم تتراكم.' : 'أُلغيت. لا نقاط لها.');
surface('task', {
  t: 'مهمة', sys: 'S1-06', p: 'adult', a: ['t2'], req: '06:1,3,4,5,9,10,11',
  note: 'S06-03 للبالغ. كل ما في المهمة في صفحة واحدة: حالها بجملة، من أسندها، دليلها، تكرارها، تذكيرها. الأزرار بحسب الحال والصلاحية: تعديل وإلغاء ما دامت قيد التنفيذ، ومراجعة إن سُلّمت، وإلغاء التحقق في يومه للمالك وحده (Q-254). النقاط تثبت عند الإنشاء.',
  r(id) {
    const t = tkT(id); if (!t) return empty('task_alt', 'لم تعد هذه المهمة موجودة', 'ربما حُذفت.', btn('عُد إلى المهام', 'back', 'sec'));
    if (!can('tasks.view', t.kid)) return empty('lock_person', 'هذه المهمة خارج صلاحياتك', 'يمنحك المالك صلاحية مهام هذا الابن من «العائلة».');
    const k = M[t.kid], c = tkCat(t.cat), rep = tkRepT(tkRR(t), tkWd(t)) || t.rep || '', dn = t.dn || [], own = t.by === t.kid;
    return `<div class="card"><div class="fx top">${av(k)}<div class="grow"><b style="font-size:calc(18px*var(--ts))">${t.t}</b><div class="sm muted">${pname(k)} · ${t.due}</div><div class="chips" style="margin-top:6px">${chip(c[0], '', c[1])}${chip(TST[t.st][0], TST[t.st][1], TST[t.st][2])}${t.pts ? chip(rwPt(t.pts), 'go', 'star') : chip('بلا نقاط', 'ol')}</div></div></div><p class="sm" style="margin:10px 0 0">${tkSay(t)}</p></div>
    ${t.hm && t.st === 'PENDING' ? cfHere(t.kid, 'task.' + t.id, 1) : ''}${t.st === 'SUBMITTED' && can('tasks.approve', t.kid) ? btn('راجع التسليم', 'go:task-review:' + id, 'ok', 'task_alt') + '<div class="gap"></div>' : ''}
    ${list(row(t.by === 'ai' ? 'wand_stars' : 'person', 'من أسندها', tkBy(t, false), t.by === 'ai' ? { a: 'go:tk-ai' } : {}), row(TK_PF[t.proof][1], 'طريقة الإثبات', own ? 'مهمة شخصية: ينجزها بلا اعتماد' : t.proof === 'self' ? 'يعتمدها بالغ دائماً' : 'يتحقق المساعد، وما لم يجزم به يأتيك', { v: TK_PF[t.proof][0] }), row('repeat', 'التكرار', rep ? 'ما فات يومه ينتهي عند منتصف الليل ولا يتراكم' : '', { v: rep || 'مرة واحدة' }), row('alarm', 'التذكير', `يصل ${k.n}`, { v: tkRm(t.rem || TK().rem) }))}
    ${t.sub && t.sub.length ? sec(`قائمة الفحص · ${dn.filter(Boolean).length} من ${t.sub.length}`) + list(t.sub.map((s, i) => row(dn[i] ? 'check_box' : 'check_box_outline_blank', s, '', dn[i] ? { ic: 'var(--success)' } : {}))) : ''}
    ${(t.st === 'PENDING' || t.st === 'SUBMITTED') && !own ? `<div class="btns">${can('tasks.cancel', t.kid) ? btn('ألغِ المهمة', 'taskCancel:' + id, 'dng sec') : ''}${t.st === 'PENDING' && can('tasks.create', t.kid) ? btn('عدّل', 'go:task-new:' + id, 'sec', 'edit') : ''}</div>` : ''}
    ${t.st === 'APPROVED' && !own && can('tasks.revoke') ? btn('ألغِ التحقق', 'tkRevoke:' + id, 'dng sec', 'undo') + `<p class="xs muted c" style="margin:6px 0 0">في يومه فقط. تعود المهمة إلى ${k.n}${t.pts && rwHas(t.kid) ? ' وتُخصم نقاطها' : ''}.</p>` : ''}`;
  },
});

/* ---------- إنشاء مهمة وتعديلها ---------- */
function tkDraft(arg) {
  const ed = tkT(arg), K = KIDS.filter(id => can('tasks.create', id)), kid = K.includes(arg) ? arg : K.includes('layan') ? 'layan' : K[0];
  if (S.nt && (S.nt.id || '') === (ed ? ed.id : '') && (ed || !K.includes(arg) || S.nt.kid === arg || S.nt.dirty)) return S.nt;
  return (S.nt = ed ? { id: ed.id, t: ed.t, kid: ed.kid, cat: ed.cat, pts: ed.pts, proof: ed.proof, dk: tkDk(ed), hm: ed.hm || '1800', rr: tkRR(ed), wd: tkWd(ed).slice(), rem: ed.rem || TK().rem, sub: (ed.sub || []).slice() }
    : { t: '', kid, cat: 'home', pts: kid && tkTeen(kid) ? 0 : TK().pts, proof: TK().proof, dk: TK_TODAY, hm: '1800', rr: 'none', wd: [0, 3], rem: TK().rem, sub: [] });
}
function tkRead() { const n = S.nt; if (!n) return; const a = $('#ntT'), b = $('#ntI'); if (a) n.t = a.value; if (b) n.it = b.value; n.dirty = 1; }
surface('task-new', {
  t: 'مهمة جديدة', sys: 'S1-06', p: 'adult', req: '06:1,2,3,4,10,14,16',
  note: 'S06-02. عنوان، فرد واحد، فئة، نقاط، طريقة إثبات، موعد، تكرار، تذكير، قائمة فحص. كل طريقة إثبات تشرح نفسها عند الاختيار، والإقرار ليس الافتراضي أبداً (Q-228). مهام المراهق بلا نقاط وحقلها مقفل بسببه. عند التعديل تبقى النقاط كما ثبتت. دون اتصال تُحفظ المهمة وتُرسل عند عودته.',
  r(arg) {
    const K = KIDS.filter(id => can('tasks.create', id)); if (!K.length) return empty('lock_person', 'إنشاء المهام ليس ضمن صلاحياتك', 'يمنحك المالك هذه الصلاحية من «العائلة».');
    const n = tkDraft(arg), k = M[n.kid], teen = tkTeen(n.kid), rec = TK().rec, own = isOwner();
    return `<label class="fld"><span>ماذا يجب أن يُنجَز؟</span><input id="ntT" maxlength="60" placeholder="مثال: سقي النباتات" value="${n.t || ''}"></label>
    ${n.id ? '' : `<div class="chips tkp" style="margin:-6px 0 14px">${TK_IDEA.map((x, i) => `<button class="chip ol" data-a="tkIdea:${i}">${ic(tkCat(x[1])[1])}${x[0]}</button>`).join('')}</div>`}
    <div class="fld"><span>لمن؟ المهمة لفرد واحد</span><div class="chips tkp">${K.map(id => `<button class="chip ${n.kid === id ? 'in' : 'ol'}" ${n.id ? 'disabled' : ''} data-a="tkSet:kid:${id}">${av(M[id], 'sm')}${M[id].n}</button>`).join('')}</div></div>
    <div class="fld"><span>الفئة</span><div class="chips tkp">${tkCats().map(([id, c]) => `<button class="chip ${n.cat === id ? 'in' : 'ol'}" data-a="tkSet:cat:${id}">${ic(c[1])}${c[0]}</button>`).join('')}${own ? `<button class="chip ol" data-a="tkCatNew">${ic('add')}فئة</button>` : ''}</div></div>
    <div class="fld"><span>النقاط</span>${teen ? callout(`مهام ${k.n} بلا نقاط. ${why('rwteen')}`, 'nt', 'lock') : n.id ? callout(`${rwPt(n.pts)}. النقاط تثبت عند الإنشاء ولا تتغيّر بالتعديل.`, 'nt', 'lock') : seg([[5, '5'], [10, '10'], [15, '15'], [25, '25']], +n.pts, 'tkSet:pts')}</div>
    <div class="fld"><span>كيف ${vb(k, 'يثبت', 'تثبت')} الإنجاز؟</span><div class="tkch">${Object.entries(TK_PF).map(([p, x]) => `<button aria-pressed="${n.proof === p}" data-a="tkSet:proof:${p}"><span class="qi ${n.proof === p ? 'in' : ''}">${ic(x[1])}</span><span><b>${x[0]}</b><small>${x[2]}</small></span></button>`).join('')}</div></div>
    <div class="fld"><span>متى؟</span>${tkStep('tkDay2', `<b>${tkDayT(n.dk)}${n.dk === TK_TODAY || n.dk === tkAdd(TK_TODAY, 1) ? ' · ' + tkDt(n.dk).getDate() + ' ' + TK_GM[tkDt(n.dk).getMonth()] : ''}</b><small>${tkHj(n.dk)}</small>`, n.dk <= TK_TODAY, n.dk >= TK_END, 'اليوم')}<div style="height:8px"></div>${tkStep('tkTm2', `<b>${tkTm(n.hm)}</b><small>آخر وقت للتسليم</small>`, n.hm <= '0500', n.hm >= '2300', 'الوقت')}</div>
    <div class="fld"><span>التكرار</span>${rec ? seg(Object.entries(TK_RR), n.rr, 'tkSet:rr') + (n.rr === 'days' ? `<div class="chips tkp tkwd">${[6, 0, 1, 2, 3, 4, 5].map(d => `<button class="chip ${n.wd.includes(d) ? 'in' : 'ol'}" data-a="tkWdT:${d}">${TK_WD[d]}</button>`).join('')}</div>` : '') + (n.rr !== 'none' ? `<p class="xs muted" style="margin:0 4px">إن فات يوم انتهت مهمته عند منتصف الليل، ولا تتراكم. ${why('tkexp')}</p>` : '') : callout(`التكرار متوقف من ضوابط المهام.${own ? ' ' + `<button class="why" data-a="go:tk-settings">افتح الضوابط</button>` : ''}`, 'nt', 'lock')}</div>
    <div class="fld"><span>التذكير</span>${seg([[15, '15 دقيقة'], [30, '30 دقيقة'], [60, 'ساعة'], [1440, 'يوم']], +n.rem, 'tkSet:rem')}<p class="xs muted" style="margin:-6px 4px 0">${tkRm(n.rem)} من موعدها · يصل ${k.n}.</p></div>
    <div class="fld"><span>قائمة فحص (اختياري) · ${n.sub.length} من ${TK_MAXSUB}</span>${n.sub.length ? list(n.sub.map((s, i) => row('check_box_outline_blank', s, '', { v: `<button class="ib" data-a="tkSubDel:${i}" aria-label="احذف البند">${ic('close')}</button>` }))) : ''}${n.sub.length < TK_MAXSUB ? `<div class="tkadd"><input id="ntI" maxlength="40" placeholder="بند، مثال: ترتيب السرير" value="${n.it || ''}"><button class="btn sec" data-a="tkSubAdd">${ic('add')}أضف</button></div>` : `<p class="xs muted" style="margin:0 4px">بلغت القائمة حدّها: عشرة بنود.</p>`}</div>
    ${btn(offline() ? 'احفظ · تُرسل عند الاتصال' : n.id ? 'احفظ التعديل' : `أسند المهمة إلى ${k.n}`, 'ntSave', '', offline() ? 'cloud_upload' : '')}`;
  },
});

/* ---------- مراجعة التسليم ---------- */
const tkNotes = k => [`${vb(k, 'صوّر', 'صوّري')} المكان كله`, 'بقي جزء لم يكتمل', 'ليست هذه المهمة المطلوبة'];
surface('task-review', {
  kind: 'sheet', t: 'مراجعة تسليم مهمة', sys: 'S1-06', p: 'adult', a: ['t1'], req: '06:5,7,8,9 05:5 09:17',
  note: 'S06-04. الدليل، ثم ما قاله المساعد ولماذا وصلت المهمة إلى بالغ، ثم قائمة الفحص. الاعتماد يودِع النقاط عبر دفتر المكافآت. الإعادة تلزمها ملاحظة يقرؤها الطفل، وجمل جاهزة تختصرها. ما أُعيد مرة يأتي تسليمه التالي إلى بالغ مباشرة لا إلى المساعد.',
  r(id) {
    const t = tkT(id); if (!t || t.st !== 'SUBMITTED' || !can('tasks.approve', t.kid)) return `<h4>لا تسليم ينتظر في هذه المهمة</h4><p class="d">ربما اعتُمدت أو أُعيدت قبل قليل.</p>${btn('حسناً', 'close')}`;
    const k = M[t.kid], dn = t.dn || [], pts = t.pts && rwHas(t.kid) && RW().src.tasks, nt = S.rjN && S.rjN.id === id ? S.rjN.v : '';
    const evd = t.proof === 'photo' ? `<div class="ph tkev">${S.lbw ? ic('image') + 'الصورة لم تُحمَّل (نطاق منخفض)' : ic('photo_camera') + 'صورة الإثبات من ' + k.n}</div>` : t.proof === 'audio' ? `<div class="tkau">${ic('play_arrow')}<i></i><span>0:12</span></div>` : `<div class="card flat fx sm">${ic('thumb_up')}<span>${k.n} ${vb(k, 'يقول إنه أنجزها', 'تقول إنها أنجزتها')}. لا دليل مرفق.</span></div>`;
    return `<h4>«${t.t}»</h4><p class="d">${k.n} · ${tkCat(t.cat)[0]} · ${pts ? rwPt(t.pts) + ' عند الاعتماد' : t.pts && rwHas(t.kid) ? 'بلا نقاط: كسب النقاط من المهام متوقف' : 'بلا نقاط'}</p>
    ${evd}
    <div class="ai"><div class="lb">${ic('wand_stars')}${t.ai === 'unsure' ? 'تحقّق المساعد' : 'لماذا وصلت إليك'}</div><p style="margin:0">${t.ai === 'unsure' ? (t.id === 't1' ? 'لم أستطع الجزم من الصورة: السرير مرتّب، لكن جزءاً من الأرضية خارج الإطار. تركتُ القرار لك.' : 'لم أستطع الجزم من الدليل، فتركتُ القرار لك ولم أودِع شيئاً.') : tkWhyHere(t).replace(' · ', '. ') + '.'}</p></div>
    ${t.sub && t.sub.length ? sec(`قائمة الفحص · ${dn.filter(Boolean).length} من ${t.sub.length}`) + list(t.sub.map((s, i) => row(dn[i] ? 'check_circle' : 'radio_button_unchecked', s, '', dn[i] ? { ic: 'var(--success)' } : {}))) : ''}
    <div class="fld"><span>ملاحظة عند الإعادة</span><div class="chips tkp" style="margin-bottom:8px">${tkNotes(k).map((x, i) => `<button class="chip ol" data-a="tkNote:${id}:${i}">${x}</button>`).join('')}</div><input id="rejNote" maxlength="80" placeholder="${vb(k, 'يقرؤها', 'تقرؤها')} ${k.n} في مهمته${k.f ? 'ا' : ''}" value="${nt}"></div>
    <div class="btns">${btn(`أعِدها إلى ${k.n}`, `taskReject:${id}`, 'sec')}${btn(pts ? `اعتمد وأودع ${t.pts}` : 'اعتمد', `taskOk:${id}`, 'ok')}</div>`;
  },
});

/* ---------- الفئات ---------- */
surface('tk-cats', {
  t: 'فئات المهام', sys: 'S1-06', p: 'adult', req: '06:2',
  note: 'S06-05. أربع فئات أساسية لا تُحذف، ويضيف المالك فئاته حتى اثنتي عشرة فئة في المجموع. الفئة المستخدمة في مهام لا تُحذف حتى تُنقل مهامها. الاسم المكرر مرفوض.',
  r() {
    const own = isOwner(), C = Object.entries(TK().cats), used = id => S.tasks.filter(t => t.cat === id && t.st !== 'CANCELLED').length, tot = Object.keys(CAT).length + C.length;
    return `${sec('الأساسية')}${list(Object.entries(CAT).map(([id, c]) => row(c[1], c[0], used(id) ? `${used(id)} مهام` : 'لا مهام فيها', { ic: c[2], v: chip('ثابتة', 'ol', 'lock') })))}
    ${sec(`فئات العائلة · ${C.length}`)}${C.length ? list(C.map(([id, c]) => row(c[1], c[0], used(id) ? `${used(id)} مهام · لا تُحذف وهي مستخدمة` : 'لا مهام فيها', { ic: c[2], v: own && !used(id) ? `<button class="ib" data-a="tkCatDel:${id}" aria-label="احذف فئة ${c[0]}">${ic('delete')}</button>` : '' }))) : `<div class="card flat c sm muted">لم تُضف فئة بعد</div>`}
    ${own ? (tot < TK_MAXCAT ? btn('أضف فئة', 'tkCatNew', 'sec', 'add') : callout('بلغت الفئات حدّها: اثنتا عشرة فئة. احذف فئة غير مستخدمة لتضيف غيرها.', 'nt', 'lock')) : callout('إضافة الفئات للمالك وحده.', 'nt', 'lock')}`;
  },
});
surface('tk-cat-new', {
  kind: 'sheet', t: 'فئة جديدة', sys: 'S1-06', p: 'adult', req: '06:2',
  note: 'S06-05 إضافةً. اسم ورمز ولون. المعاينة تُظهر الفئة كما ستظهر في المهمة قبل الحفظ.',
  r() {
    const d = S.tkC = S.tkC || { n: '', i: TK_CI[0], c: TK_CC[0] };
    return `<h4>فئة جديدة</h4><p class="d">تظهر عند إنشاء أي مهمة.</p><label class="fld"><span>الاسم</span><input id="tkCN" maxlength="16" placeholder="مثال: رياضة" value="${d.n}"></label>
    <div class="fld"><span>الرمز</span><div class="tkpk">${TK_CI.map(i => `<button aria-pressed="${d.i === i}" data-a="tkCSet:i:${i}" aria-label="رمز">${ic(i)}</button>`).join('')}</div></div>
    <div class="fld"><span>اللون</span><div class="tkpk">${TK_CC.map((c, j) => `<button aria-pressed="${d.c === c}" data-a="tkCSet:c:${j}" aria-label="لون" style="--c:${c}"><i></i></button>`).join('')}</div></div>
    <div class="card flat fx sm"><span class="av sm" style="--c:${d.c}">${ic(d.i)}</span><span>${d.n || 'اسم الفئة'}</span></div>
    <div class="btns">${btn('إلغاء', 'close', 'sec')}${btn('أضف الفئة', 'tkCatSave')}</div>`;
  },
});

/* ---------- الضوابط ---------- */
const TK_ED = {
  pts: { t: 'النقاط الافتراضية للمهمة', d: 'ما يظهر محدَّداً عند إنشاء مهمة جديدة، ويغيّره المنشئ لكل مهمة.', o: [[5, '5'], [10, '10'], [15, '15'], [25, '25']], def: 10, lab: v => rwPt(+v), fx: v => `كل مهمة جديدة تبدأ بـ${rwPt(+v)}. المهام القائمة لا تتغيّر، ومهام المراهق تبقى بلا نقاط.` },
  proof: { t: 'طريقة الإثبات الافتراضية', d: 'ما يظهر محدَّداً عند إنشاء مهمة جديدة. الإقرار وحده ليس افتراضياً أبداً.', o: [['photo', 'صورة'], ['audio', 'تسجيل صوتي']], def: 'photo', lab: v => TK_PF[v][0], fx: v => `كل مهمة جديدة تبدأ بإثبات «${TK_PF[v][0]}». ${TK_PF[v][2]}` },
  rem: { t: 'التذكير الافتراضي', d: 'متى يصل التذكير قبل موعد المهمة أو الحدث، ويغيّره المنشئ لكل واحد.', o: [[15, '15 دقيقة'], [30, '30 دقيقة'], [60, 'ساعة'], [1440, 'يوم']], def: 60, lab: v => tkRm(v), fx: v => `كل مهمة أو حدث جديد يبدأ بتذكير ${tkRm(v)}. ما أُنشئ من قبل لا يتغيّر.` },
};
surface('tk-settings', {
  t: 'ضوابط المهام والتقويم', sys: 'S1-06', p: 'adult', req: '06:2,3,10,14,17,18 09:8',
  note: 'S06-09. الضوابط الخمسة في مكان واحد: النقاط الافتراضية، طريقة الإثبات الافتراضية، التذكير الافتراضي، تكرار المهام، الفئات. ومعها تفويض المساعد ومن ينشئ ويعتمد، ثم الثوابت بأسبابها. للمالك وحده، وهي نفسها التي تظهر في مركز التحكم.',
  r() {
    if (!isOwner()) return empty('lock_person', 'ضوابط المهام لأحمد وحده', 'تنشئين المهام وتعتمدينها بحسب صلاحياتك.');
    const K = TK(), fixed = t => chip(t, 'ol', 'lock'), nC = Object.keys(K.cats).length;
    return `${sec('عند إنشاء مهمة')}${list(row('star', 'النقاط الافتراضية', 'تتغيّر لكل مهمة عند إنشائها', { a: 'go:tk-edit:pts', v: rwPt(K.pts) }), row(TK_PF[K.proof][1], 'طريقة الإثبات الافتراضية', 'الإقرار وحده ليس افتراضياً أبداً', { a: 'go:tk-edit:proof', v: TK_PF[K.proof][0] }), row('alarm', 'التذكير الافتراضي', 'للمهام وأحداث التقويم', { a: 'go:tk-edit:rem', v: tkRm(K.rem) }), row('repeat', 'تكرار المهام', K.rec ? 'يظهر خيار التكرار عند إنشاء المهمة' : 'متوقف: كل مهمة جديدة مرة واحدة', { tg: K.rec, ta: 'tkRec' }))}
    ${sec('الفئات')}${list(row('category', 'فئات المهام', `أربع أساسية${nC ? ' و' + nC + ' من عندك' : ''}`, { a: 'go:tk-cats', v: 4 + nC }))}
    ${sec('المساعد')}${list(row('task_alt', 'يتحقق من الإنجاز', S.aiKill ? 'متوقف الآن: كل تسليم يأتيك' : 'يعتمد ما يجزم به ويحيل الباقي إليك', { a: 'go:ai' }), row('wand_stars', 'يُعدّ المهام', S.aiKill ? 'متوقف الآن' : TK_LV[K.ai.lv][1], { a: 'go:tk-ai', v: chip(TK_LV[K.ai.lv][3], K.ai.lv === 'off' ? 'ol' : 'in') }))}
    ${sec('من ينشئ ويعتمد')}${list(row('groups', 'البالغون', 'أنت، ومن أعطيته صلاحية المهام', { a: 'go:family' }), row('person', 'خالد ينشئ مهامه بنفسه', S.teenTasks ? 'مسموح · مهامه هو فقط، بلا اعتماد وبلا نقاط' : 'غير مسموح', { a: 'teenOpen:khaled' }))}
    ${sec('ثوابت')}${list(row('person', 'المهمة لفرد واحد', 'لا مهمة مشتركة بين اثنين', { v: fixed('ثابت') }), row('timer_off', 'ما فات لا يتراكم', `ينتهي عند منتصف الليل بتوقيت العائلة ${why('tkexp')}`, { v: fixed('ثابت') }), row('star', 'النقاط تثبت عند الإنشاء', 'تعديل المهمة لا يغيّر نقاطها', { v: fixed('ثابت') }), row('thumb_up', 'الإقرار لا يودِع وحده', `يعتمده بالغ دائماً ${why('tkproof')}`, { v: fixed('ثابت') }), row('undo', 'إلغاء التحقق', 'في يومه فقط، وللمالك وحده', { v: fixed('ثابت') }), row('today', 'التقويم بالتاريخين', 'هجري وميلادي · ثلاثة أشهر قادمة', { v: fixed('ثابت') }))}`;
  },
});
surface('tk-edit', {
  kind: 'sheet', t: 'تعديل ضابط مهام', sys: 'S1-06', p: 'adult', a: ['pts'], req: '06:3,14 09:8',
  note: 'ورقة التعديل نفسها في كل الأنظمة: القيمة الآن ومصدرها، أثر القيمة الجديدة بجملة، ثم حفظ صريح مع تراجع وسطر في السجل.',
  r(key) {
    const kk = TK_ED[key] ? key : 'pts', c = TK_ED[kk], cur = TK()[kk], d = S.tkE = S.tkE && S.tkE.k === kk ? S.tkE : { k: kk, v: cur }, ch = String(d.v) !== String(cur);
    return `<h4>${c.t}</h4><p class="d">${c.d}</p><div class="card flat fx sb sm"><span>القيمة الآن</span><span><b>${c.lab(cur)}</b> ${chip(cur === c.def ? 'افتراضي' : 'الأب', 'ol', 'person')}</span></div>
    <div class="fld"><span>القيمة الجديدة</span>${seg(c.o, isNaN(d.v) ? d.v : +d.v, 'tkEdPick')}</div>${callout(c.fx(d.v), ch ? '' : 'nt', 'visibility')}
    ${offline() && ch ? callout('أنت غير متصل. يُحفظ التغيير هنا ويُرسل عند عودة الاتصال.', 'wa', 'cloud_off') : ''}<div class="btns">${btn('إلغاء', 'tkEdCancel', 'sec')}${btn(offline() ? 'احفظ · يُرسل لاحقاً' : 'احفظ', 'tkEdSave', ch ? '' : '" disabled="')}</div>`;
  },
});

/* ---------- المساعد والمهام: التفويض وحدوده ---------- */
const tkAiD = () => { const A = TK().ai; return (S.tkA = S.tkA || { lv: A.lv, mx: A.mx, pd: A.pd, kids: A.kids.slice() }); };
const tkAiCh = () => { const A = TK().ai, d = tkAiD(); return d.lv !== A.lv || d.mx !== A.mx || d.pd !== A.pd || d.kids.slice().sort().join() !== A.kids.slice().sort().join(); };
surface('tk-ai', {
  t: 'المساعد والمهام', sys: 'S1-06', p: 'adult', req: '06:1,7,17,18 09:18',
  note: 'REQ-018 (Q-415): المساعد يُعدّ المهام بتفويض المالك. ثلاث درجات تشرح كل واحدة نفسها عند الاختيار: لا يُعدّ، يقترح والقرار للبالغ (الافتراضي)، يسند مباشرة ضمن حدود. الحدود ثلاثة: أقصى نقاط للمهمة، عدد المهام في اليوم لكل ابن، ومن يسند لهم. ما لا يفعله أبداً معروض ثابتاً. كل مهمة يسندها موسومة باسمه وتُلغى متى شاء البالغ. الاقتراح يعرض سببه وما استند إليه. مفتاح الإيقاف يوقف هذا كله.',
  r() {
    const A = TK().ai, own = isOwner(), d = tkAiD(), ch = tkAiCh(), P = tkSugs(), mine = S.tasks.filter(t => t.by === 'ai' && can('tasks.view', t.kid)), fixed = chip('لا يفعله', 'ol', 'lock');
    const lim = `${sec('حدود ما يسنده')}<div class="fld"><span>أقصى نقاط للمهمة الواحدة</span>${seg([[5, '5'], [10, '10'], [15, '15']], d.mx, 'tkAi:mx')}</div><div class="fld"><span>مهام في اليوم لكل ابن</span>${seg([[1, 'واحدة'], [2, 'اثنتان'], [3, 'ثلاث']], d.pd, 'tkAi:pd')}</div><div class="fld"><span>لمن يسند</span><div class="chips tkp">${KIDS.map(id => `<button class="chip ${d.kids.includes(id) ? 'in' : 'ol'}" data-a="tkAiKid:${id}">${av(M[id], 'sm')}${M[id].n}</button>`).join('')}</div></div>${callout(d.kids.length ? `أقصى ما يكسبه كل ابن في اليوم من مهام المساعد: ${rwPt(d.mx * d.pd)}. ${d.kids.includes('khaled') ? 'مهام خالد بلا نقاط.' : ''}` : 'لم تختر أحداً، فلن يسند المساعد شيئاً.', d.kids.length ? '' : 'wa', 'visibility')}`;
    return `${S.aiKill ? callout('المساعد متوقف من مفتاح الإيقاف: لا يقترح مهاماً ولا يسندها ولا يتحقق. <button class="why" data-a="go:ai">افتح المساعد</button>', 'wa', 'power_settings_new') : ''}
    ${own ? `${sec('كم تفوّضه في إعداد المهام؟')}<div class="tkch">${Object.entries(TK_LV).map(([k, x]) => `<button aria-pressed="${d.lv === k}" data-a="tkAi:lv:${k}"><span class="qi ${d.lv === k ? 'in' : ''}">${ic(x[2])}</span><span><b>${x[0]}${k === 'suggest' ? ' ' + chip('الافتراضي', 'ol') : ''}</b><small>${x[1]}</small></span></button>`).join('')}</div><p class="c" style="margin:-2px 0 10px">${why('tkai', 'ما الفرق بين الاقتراح والإسناد؟')}</p>
    ${d.lv === 'assign' ? lim : ''}
    ${ch ? `${offline() ? callout('أنت غير متصل. يُحفظ التغيير هنا ويُرسل عند عودة الاتصال.', 'wa', 'cloud_off') : ''}<div class="btns">${btn('إلغاء', 'tkAiCancel', 'sec')}${btn('احفظ التفويض', 'tkAiSave')}</div><div class="gap"></div>` : ''}`
      : callout(`${M.ahmad.n} جعل المساعد في المهام: <b>${TK_LV[A.lv][0].replace(' وأنت تقرّر', '').replace(' ضمن حدودك', ' ضمن حدود')}</b>. ${TK_LV[A.lv][4]}`, 'nt', 'wand_stars')}
    ${A.lv !== 'off' && !S.aiKill ? sec(`اقتراحات تنتظر${P.length ? ' · ' + P.length : ''}`) + (P.length ? list(P.map(s => row(tkCat(s.cat)[1], s.t, `${pname(M[s.kid])} · ${s.pts ? rwPt(s.pts) : 'بلا نقاط'}${A.lv === 'assign' && !tkFits(s) ? ' · ' + tkWhyNot(s) + '، فالقرار لك' : ''}`, { ic: tkCat(s.cat)[2], a: 'go:tk-sug:' + s.id }))) : `<div class="card flat c sm muted">لا اقتراح الآن</div>`) : ''}
    ${mine.length ? sec(`ما أسنده المساعد · ${mine.length}`) + list(mine.map(tkRowT)) : ''}
    ${sec('ما لا يفعله أبداً')}${list(row('cancel', 'لا يلغي مهمة ولا يعدّلها', 'الإلغاء والتعديل للبالغين', { v: fixed }), row('star', 'لا يمنح نقاطاً بلا مهمة', 'المنح لك ولمن أذنت له', { v: fixed }), row('thumb_up', 'لا يسند مهمة بإقرار فقط', 'كل ما يسنده له دليل: صورة أو تسجيل', { v: fixed }), row('visibility', 'لا يقرأ رسالة ولا يفتح صورة ليقترح', 'يستند إلى المهام والتقويم فقط', { v: fixed }))}
    ${list(row('tune', 'كل ما يفعله المساعد بدلك', 'الصلاحيات والسجل والإيقاف الفوري', { a: 'go:ai' }))}`;
  },
});
surface('tk-sug', {
  kind: 'sheet', t: 'اقتراح مهمة من المساعد', sys: 'S1-06', p: 'adult', a: ['s1'], req: '06:1,17,18 09:18',
  note: 'اقتراح واحد: المهمة كما ستُسند، ولماذا اقترحها، وإلى ماذا استند (بلا محتوى رسائل ولا صور). ثلاثة أفعال: أسندها كما هي، عدّل ثم أسند، ليس الآن. الموافقة تجعلها مهمة باسم البالغ الذي وافق، موسومة بأنها باقتراح من المساعد.',
  r(id) {
    const s = TK().sug.find(x => x.id === id); if (!s || s.st !== 'new' || !can('tasks.create', s.kid)) return `<h4>لم يعد هذا الاقتراح قائماً</h4><p class="d">ربما أُسند أو صُرف قبل قليل.</p>${btn('حسناً', 'close')}`;
    const k = M[s.kid], c = tkCat(s.cat);
    return `<div class="fx" style="margin-bottom:10px"><span class="qi lg in">${ic('wand_stars')}</span><div><h4 style="margin:0">${s.t}</h4><span class="sm muted">اقتراح ل${pname(k)}</span></div></div>
    <div class="chips" style="margin-bottom:10px">${chip(c[0], '', c[1])}${chip(s.pts ? rwPt(s.pts) : 'بلا نقاط', s.pts ? 'go' : 'ol', s.pts ? 'star' : '')}${chip(TK_PF[s.proof][0], 'ol', TK_PF[s.proof][1])}${chip(tkDayT(s.dk) + ' ' + tkTm(s.hm), 'ol', 'schedule')}${s.rr !== 'none' ? chip(TK_RR[s.rr], 'ol', 'repeat') : ''}</div>
    <div class="ai"><div class="lb">${ic('wand_stars')}لماذا يقترحها</div><p style="margin:0">${s.why}</p></div>
    ${list(row('visibility', 'إلى ماذا استند', s.src + '. لم يقرأ رسالة ولم يفتح صورة.'), row('person', 'إن وافقت', `تُسند باسمك، و${vb(k, 'يراها', 'تراها')} ${k.n} في مهام${k.f ? 'ها' : 'ه'} فوراً.`))}
    <div class="btns">${btn('ليس الآن', 'tkSugNo:' + id, 'sec')}${btn('أسندها', 'tkSugOk:' + id, 'ok')}</div><div style="height:8px"></div>${btn('عدّل ثم أسند', 'tkSugEdit:' + id, 'sec', 'edit')}`;
  },
});

/* ---------- الطفل والمراهق: المهمة وتسليمها ---------- */
surface('c-task', {
  kind: 'sheet', t: 'مهمة الطفل', sys: 'S1-06', p: 'kid', a: ['t2'], req: '06:4,6,7,8,9,11,16 05:5',
  note: 'S06-03 للطفل والمراهق. يرى من أسند المهمة، ويؤشر بنود الفحص، ثم يسلّم بالدليل المطلوب: يصوّر ويراجع صورته قبل الإرسال، أو يسجّل، أو يقرّ. الدليل يتحقق منه المساعد فتأتي النقاط فوراً، وما لم يجزم به يذهب إلى الأب. الإقرار يعتمده الأب دائماً. دون اتصال يُحفظ التسليم ويُرسل لاحقاً. المراهق بلا نقاط، ومهامه الشخصية ينجزها بلا اعتماد.',
  r(id) {
    const t = tkT(id); if (!t) return `<h4>لم تعد هذه المهمة موجودة</h4>${btn('حسناً', 'close')}`;
    const k = M[t.kid], c = tkCat(t.cat), P = S.tkP && S.tkP.id === id ? S.tkP : null, own = t.by === t.kid, pts = t.pts && rwHas(t.kid), dn = t.dn || [], g = (a, b) => vb(k, a, b), dad = rwDad();
    const teen = k.role === 'teen', rep = tkRepT(tkRR(t), tkWd(t)) || t.rep || '';
    const head = teen ? `<div class="fx" style="margin-bottom:10px"><span class="qi lg" style="background:${c[2]}1f;color:${c[2]}">${ic(c[1])}</span><div><h4 style="margin:0">${t.t}</h4><span class="sm muted">${own ? 'مهمة شخصية · أنشأتها أنت' : 'من ' + tkBy(t, true)}</span></div></div><div class="chips" style="margin-bottom:12px">${chip(t.due, 'ol', 'schedule')}${chip(c[0], '', c[1])}${rep ? chip(rep, 'ol', 'repeat') : ''}${t.rem ? chip(tkRm(t.rem), 'ol', 'notifications') : ''}</div>`
      : `<div class="c"><span class="av xl" style="--c:${c[2]};margin:0 auto 10px">${ic(c[1])}</span><h4>${t.t}</h4><p class="d">${t.due}${pts ? ` · ${coin()} ${rwPt(t.pts)} بعد التحقق` : ''}</p></div>`;
    if (P && P.step === 'cap') return `${head}<div class="tkcam">${ic('photo_camera')}<span>${g('وجّه', 'وجّهي')} الكاميرا إلى ما ${g('أنجزت', 'أنجزتِ')}</span></div><div class="btns">${btn('رجوع', 'tkPx', 'sec')}${btn(g('التقط', 'التقطي'), 'tkShot', 'ok', 'photo_camera')}</div>`;
    if (P && P.step === 'rec') return `${head}<div class="tkcam rec">${ic('mic')}<span>يسجّل الآن · 0:12</span></div><div class="btns">${btn('رجوع', 'tkPx', 'sec')}${btn(g('أنهِ التسجيل', 'أنهي التسجيل'), 'tkShot', 'ok', 'stop')}</div>`;
    if (P && P.step === 'ready') return `${head}${t.proof === 'photo' ? `<div class="ph tkev">${ic('image')}صورتك</div>` : `<div class="tkau">${ic('play_arrow')}<i></i><span>0:12</span></div>`}<p class="sm muted c" style="margin:0 0 10px">${offline() ? 'لا اتصال الآن. تُحفظ هنا وتُرسل حين يعود.' : (t.re || t.note) ? `${dad} طلب إعادتها، فتذهب إليه.` : 'المساعد يتحقق منها، وإن لم يتأكد أرسلها إلى ' + dad + '.'}</p><div class="btns">${btn(g('أعد', 'أعيدي'), 'tkCap:' + id, 'sec', 'replay')}${btn(g('أرسل', 'أرسلي'), 'tkSend:' + id, 'ok', 'send')}</div>`;
    const body = t.st === 'APPROVED' ? callout(own ? `${g('أنجزتها', 'أنجزتِها')}. مهمتك الشخصية لا تحتاج اعتماداً.` : `${g('أحسنت', 'أحسنتِ')}! ${t.vf === 'ai' ? 'تحقق منها المساعد' : 'اعتمدها ' + rwWho(t.vf || 'ahmad', true)}${pts ? ' ونقاطها في محفظتك.' : '.'}`, 'ok', 'celebration') + (own ? btn('لم أنجزها بعد', 'tkOwnUndo:' + id, 'sec') : '')
      : t.st === 'SUBMITTED' ? callout(t.off ? 'محفوظة في جهازك. تُرسل حين يعود الاتصال.' : t.ai === 'unsure' ? `نظر المساعد في ${t.proof === 'audio' ? 'تسجيلك' : 'صورتك'} ولم يتأكد، فأرسلها إلى ${dad}.` : `${g('أرسلتها', 'أرسلتِها')}. ${dad} يراجعها${pts ? '، ثم تأتي النقاط' : ''}.`, '', t.off ? 'cloud_upload' : 'hourglass_top')
      : t.st === 'EXPIRED' ? callout(`انتهى يوم هذه المهمة. لا بأس، مهمة اليوم ${g('بانتظارك', 'بانتظاركِ')}.`, 'nt', 'timer_off')
      : t.st === 'CANCELLED' ? callout(`أُلغيت هذه المهمة.`, 'nt', 'cancel')
      : own ? `<div class="btns">${btn('احذفها', 'tkOwnDel:' + id, 'dng sec')}${btn(g('أنجزتها', 'أنجزتُها'), 'teenDone:' + id, 'ok', 'check')}</div>`
      : t.proof === 'photo' ? btn(g('صوّر ما أنجزت', 'صوّري ما أنجزتِ'), 'tkCap:' + id, 'ok', 'photo_camera') : t.proof === 'audio' ? btn(g('سجّل بصوتك', 'سجّلي بصوتك'), 'tkCap:' + id, 'ok', 'mic')
      : btn('أنجزتها', 'tkSend:' + id, 'ok', 'thumb_up') + `<p class="sm muted c" style="margin:8px 0 0">${dad} يعتمدها${pts ? '، ثم تأتي النقاط' : ''}.</p>`;
    return `${head}${teen ? '' : `<p class="sm muted c" style="margin:-4px 0 10px">${own ? 'مهمة شخصية · أنشأتها أنت' : 'من ' + tkBy(t, true)}</p>`}
    ${t.note && t.st === 'PENDING' ? callout(`ملاحظة ${rwWho(t.nby || 'ahmad', true)}: ${t.note}`, 'wa', 'reply') : ''}
    ${t.sub && t.sub.length ? list(t.sub.map((s, i) => row(dn[i] ? 'check_box' : 'check_box_outline_blank', s, '', Object.assign({ chev: false }, t.st === 'PENDING' ? { a: `tkTick:${id}:${i}` } : {}, dn[i] ? { ic: 'var(--success)' } : {})))) : ''}
    ${body}`;
  },
});
surface('t-task-new', {
  kind: 'sheet', t: 'مهمة شخصية للمراهق', sys: 'S1-06', p: 'teen', req: '06:1,3,10,14',
  note: 'S06-02 بنطاق المراهق نفسه: عنوان وموعد وتكرار وتذكير. لا حقل نقاط ولا إسناد لغيره ولا اعتماد. تظهر فقط إن سمح بها والده، ووالده يراها في قائمة المهام.',
  r() {
    const d = S.tt = S.tt || { t: '', dk: TK_TODAY, rr: 'none', rem: 60 };
    if (!S.teenTasks) return `<h4>لم يسمح والدك بهذا بعد</h4><p class="d">تطلبه منه من «ملفي».</p>${btn('افتح ملفي', 'tab:t-me', 'sec')}`;
    return `<h4>مهمة شخصية</h4><p class="d">لك أنت. تنجزها بلا اعتماد، ووالدك يراها.</p><label class="fld"><span>ماذا ستنجز؟</span><input id="ttT" maxlength="60" placeholder="مثال: مراجعة الكيمياء" value="${d.t}"></label>
    <div class="fld"><span>متى؟</span>${seg([[TK_TODAY, 'اليوم'], [tkAdd(TK_TODAY, 1), 'غداً'], [tkAdd(TK_TODAY, 2), tkDayT(tkAdd(TK_TODAY, 2)).split(' ')[0]]], d.dk, 'tkTt:dk')}</div>
    <div class="fld"><span>التكرار</span>${seg([['none', 'مرة واحدة'], ['daily', 'كل يوم'], ['school', 'أيام الدراسة']], d.rr, 'tkTt:rr')}</div>
    <div class="fld"><span>التذكير</span>${seg([[15, '15 دقيقة'], [30, '30 دقيقة'], [60, 'ساعة'], [1440, 'يوم']], +d.rem, 'tkTt:rem')}</div>${btn('أضف المهمة', 'tkTtSave')}`;
  },
});
/* بطاقة «القادم في التقويم» في رئيسية الطفل والمراهق */
function tkNext(id) {
  const E = S.events.filter(e => e.who === 'all' || e.who === id).map(e => [e, [0, 1, 2, 3, 4, 5, 6, 7].map(n => tkAdd(TK_TODAY, n)).find(k => tkEvOn(e, k))]).filter(x => x[1]).sort((a, b) => (a[1] + a[0].hm < b[1] + b[0].hm ? -1 : 1))[0];
  return list(row('event', E ? E[0].t : 'تقويم العائلة', E ? `${tkDayT(E[1])} ${tkTm(E[0].hm)}` : 'لا مواعيد هذا الأسبوع', { ic: 'var(--accent)', a: 'go:fam-cal', v: E ? chip('التقويم', 'ol') : '' }));
}

/* ---------- لماذا؟ ---------- */
Object.assign(WHY, {
  tkai: ['ما الفرق بين الاقتراح والإسناد؟', '<b>يقترح</b>: يعرض عليك المهمة وسببها، ولا تصل أبناءك حتى توافق. تبقى كل مهمة باسمك.<br><br><b>يسند مباشرة</b>: يسند بنفسه داخل الحدود التي تضعها (أقصى نقاط، وعدد في اليوم، ولمن). كل مهمة يسندها موسومة باسمه، تصلك في السجل، وتلغيها متى شئت.<br><br>في الحالتين لا يلغي مهمة، ولا يمنح نقاطاً بلا مهمة، ولا يقرأ رسالة ليقترح. ومفتاح الإيقاف يوقفه فوراً.', 'S1-06 REQ-001، REQ-017 · Q-167'],
  tkexp: ['لماذا لا تتراكم المهام الفائتة؟', 'المهمة المتكررة لها نسخة لكل يوم. إن فات اليوم انتهت نسخته عند منتصف الليل بتوقيت العائلة، وجاءت نسخة اليوم الجديد وحدها.<br><br>بهذا لا يجد الطفل في الصباح خمس مهام متأخرة، ولا يكسب نقاط أيام لم ينجز فيها.', 'S1-06 REQ-011 · Q-123، Q-183'],
  tkproof: ['لماذا لا يودِع الإقرار نقاطاً؟', 'الإقرار قول بلا دليل. لو أودع نقاطاً وحده لصار الضغط على زر يساوي وقتاً إضافياً.<br><br>لذلك يعتمده بالغ دائماً. أما الصورة والتسجيل فيتحقق منهما المساعد ويعتمد، وما لم يجزم به يحيله إليك.', 'S1-06 REQ-006، REQ-008 · Q-110، Q-228'],
});

/* ---------- الأفعال ---------- */
Object.assign(ACT, {
  /* التقويم */
  tkDay(k) { S.tkDay = k; },
  tkMon(d) { S.tkM = Math.max(0, Math.min(3, (+S.tkM || 0) + +d)); S.tkDay = null; },
  tkEvNew(k) { if (!can('calendar.event.create')) return ACT.denied('calendar.event.create'); S.ev = tkEvD(k); S.sheet = { id: 'event-new', a: [] }; },
  tkEvEdit(id) { if (!can('calendar.event.create')) return ACT.denied('calendar.event.create'); const e = S.events.find(x => x.id === id); S.ev = Object.assign(tkEvD(), e); S.sheet = { id: 'event-new', a: [] }; },
  tkEvRead() { const d = S.ev; if (!d) return; const a = $('#evT'), b = $('#evL'); if (a) d.t = a.value; if (b) d.loc = b.value; },
  tkEvSet(k, v) { ACT.tkEvRead(); S.ev[k] = k === 'rem' ? +v : v; },
  tkEvDay(n) { ACT.tkEvRead(); const k = tkAdd(S.ev.dk, +n); if (k >= TK_TODAY && k <= TK_END) S.ev.dk = k; },
  tkEvTm(n) { ACT.tkEvRead(); S.ev.hm = tkTmAdd(S.ev.hm, +n * 30); },
  evSave() {
    if (!can('calendar.event.create')) return ACT.denied('calendar.event.create'); ACT.tkEvRead(); const d = S.ev, t = (d.t || '').trim(); if (!t) { toast('اكتب عنوان الحدث', null, 'error'); return; }
    const old = d.id ? S.events.find(x => x.id === d.id) : null, was = old ? Object.assign({}, old) : null, e = old || { id: d.nid || 'e' + Date.now(), by: me().id };
    Object.assign(e, { t, dk: d.dk, hm: d.hm, who: d.who, rem: +d.rem, loc: (d.loc || '').trim(), rr: d.rr }); if (!old) S.events.push(e);
    const off = queue(`حدث «${t}»`, 'S1-06'); audit(`${old ? 'تعديل' : 'إضافة'} حدث «${t}»`, 'calendar.event.create'); S.ev = null; S.sheet = null; S.tv = 'cal'; S.tkM = Math.max(0, Math.min(3, (tkDt(e.dk).getFullYear() - 2026) * 12 + tkDt(e.dk).getMonth() - 10)); S.tkDay = e.dk;
    toast(off ? 'حُفظ الحدث · يُرسل عند الاتصال' : old ? 'حُفظ تعديل الحدث' : `أُضيف الحدث · التذكير ${tkRm(e.rem)}`, () => { if (old) Object.assign(old, was); else S.events = S.events.filter(x => x !== e); render(); }, off ? 'cloud_upload' : 'check_circle');
  },
  tkEvDel(id) { if (!can('calendar.event.create')) return ACT.denied('calendar.event.create'); const e = S.events.find(x => x.id === id), i = S.events.indexOf(e); confirmDlg('حذف الحدث؟', `يُحذف «${e.t}»${e.rr && e.rr !== 'none' ? ' وكل تكراراته' : ''} من تقويم العائلة، ويُلغى تذكيره.`, 'احذف', () => { S.events.splice(i, 1); S.sheet = null; queue(`حذف حدث «${e.t}»`, 'S1-06'); audit(`حذف حدث «${e.t}»`, 'calendar.event.create'); toast('حُذف الحدث', () => { S.events.splice(i, 0, e); render(); }); }, true); },

  /* إنشاء المهمة */
  tkSet(k, v) { tkRead(); const n = S.nt; n[k] = k === 'pts' || k === 'rem' ? +v : v; if (k === 'kid') n.pts = tkTeen(v) ? 0 : n.pts || TK().pts; },
  tkIdea(i) { tkRead(); const x = TK_IDEA[+i], n = S.nt; n.t = x[0]; n.cat = x[1]; n.proof = x[2]; },
  tkDay2(d) { tkRead(); const k = tkAdd(S.nt.dk, +d); if (k >= TK_TODAY && k <= TK_END) S.nt.dk = k; },
  tkTm2(d) { tkRead(); S.nt.hm = tkTmAdd(S.nt.hm, +d * 30); },
  tkWdT(d) { tkRead(); const w = S.nt.wd, i = w.indexOf(+d); if (i < 0) w.push(+d); else w.splice(i, 1); },
  tkSubAdd() { tkRead(); const n = S.nt, v = (n.it || '').trim(); if (!v) { toast('اكتب البند أولاً', null, 'error'); return; } if (n.sub.length >= TK_MAXSUB) return; n.sub.push(v); n.it = ''; },
  tkSubDel(i) { tkRead(); S.nt.sub.splice(+i, 1); },
  tkCatNew() { if (!isOwner()) return ACT.denied('tasks.category.create'); if (S.nt) tkRead(); if (Object.keys(CAT).length + Object.keys(TK().cats).length >= TK_MAXCAT) { toast('بلغت الفئات حدّها: اثنتا عشرة فئة', null, 'error'); return; } S.tkC = null; S.sheet = { id: 'tk-cat-new', a: [] }; },
  ntSave() {
    tkRead(); const n = S.nt, t = (n.t || '').trim(), old = n.id ? tkT(n.id) : null;
    if (!can('tasks.create', n.kid)) return ACT.denied('tasks.create');
    if (!t) { toast('اكتب عنوان المهمة أولاً', null, 'error'); return; }
    if (n.rr === 'days' && !n.wd.length) { toast('اختر يوماً واحداً على الأقل', null, 'error'); return; }
    if (old && old.st !== 'PENDING') { toast('سُلّمت المهمة قبل الحفظ · راجع التسليم أولاً', null, 'error'); return; }
    const rr = TK().rec ? n.rr : 'none', f = { t, cat: n.cat, proof: n.proof, dk: n.dk, hm: n.hm, due: `${tkDayT(n.dk)} ${tkTm(n.hm)}`, rr, wd: n.wd.slice(), rep: tkRepT(rr, n.wd), rem: +n.rem, sub: n.sub.slice() };
    const was = old ? Object.assign({}, old) : null, x = old || { id: n.nid || 't' + Date.now(), kid: n.kid, by: me().id, pts: tkTeen(n.kid) ? 0 : n.pts, st: 'PENDING' };
    Object.assign(x, f); if (!old) { if (n.sg) { x.sg = 1; const s = TK().sug.find(q => q.id === n.sg); if (s) s.st = 'ok'; } S.tasks.unshift(x); }
    const off = queue('مهمة «' + t + '»', 'S1-06'), sg = n.sg; audit(`${old ? 'تعديل' : 'إسناد'} مهمة «${t}» ${old ? '' : 'إلى ' + M[x.kid].n}`, 'tasks.create'); S.nt = null; back();
    toast(off ? 'حُفظت المهمة في الصندوق الصادر' : old ? 'حُفظ تعديل المهمة' : `أُسندت المهمة إلى ${M[x.kid].n}`, () => { if (old) { Object.keys(old).forEach(k => delete old[k]); Object.assign(old, was); } else { S.tasks = S.tasks.filter(q => q !== x); const s = TK().sug.find(q => q.id === sg); if (s) s.st = 'new'; } render(); }, off ? 'cloud_upload' : 'check_circle');
  },

  /* الاعتماد والإعادة والإلغاء */
  taskOk(id) {
    const t = tkT(id); S.sheet = null;
    const r = tkCredit(t, me().id);
    queue(`اعتماد «${t.t}»`, 'S1-06');
    toast(`اعتُمدت المهمة${r ? ` · أُودعت ${rwPt(t.pts)} في محفظة ${M[t.kid].n}${r.b ? ` ومعها مكافأة السلسلة ${r.b.n}` : ''}` : t.pts && rwHas(t.kid) ? ' · بلا نقاط: كسب النقاط من المهام متوقف' : ''}`, () => { t.st = 'SUBMITTED'; tkUncredit(t, 'undo'); render(); });
  },
  tkNote(id, i) { S.rjN = { id, v: tkNotes(M[tkT(id).kid])[+i] }; },
  taskReject(id) {
    const t = tkT(id), k = M[t.kid], n = (($('#rejNote') || {}).value || (S.rjN && S.rjN.id === id ? S.rjN.v : '') || `${vb(k, 'أعد', 'أعيدي')} المحاولة بصورة أوضح`).trim(); t.st = 'PENDING'; t.note = n; t.nby = me().id; t.ai = ''; S.sheet = null; S.rjN = null;
    /* قرار عدم الاعتماد يدخل قائمة ما يصح الاعتراض عليه (S1-05 REQ-018) */
    RW().dec = RW().dec.filter(d => d.tid !== id); RW().dec.unshift({ id: 'd' + (++RW().n), tid: id, kid: t.kid, t: t.t, pts: t.pts, by: me().id, why: n, ev: tkEv(t), at: 'اليوم' });
    queue(`إعادة «${t.t}»`, 'S1-06'); toast('أُعيدت المهمة مع ملاحظتك');
  },
  taskCancel(id) {
    const t = tkT(id); if (!can('tasks.cancel', t.kid)) return ACT.denied('tasks.cancel'); const rep = tkRR(t) !== 'none';
    confirmDlg('إلغاء المهمة؟', `تُلغى «${t.t}»${rep ? ' وكل تكراراتها القادمة' : ''}، وتختفي من مهام ${M[t.kid].n}.${t.st === 'SUBMITTED' ? ' تسليمها الذي ينتظر لن يُراجَع، ولا نقاط عنه.' : ''} ما اعتُمد منها من قبل يبقى بنقاطه.`, 'ألغِ المهمة', () => { const was = t.st; t.st = 'CANCELLED'; queue(`إلغاء «${t.t}»`, 'S1-06'); audit(`إلغاء مهمة «${t.t}»`, 'tasks.cancel'); back(); toast('أُلغيت المهمة', () => { t.st = was; render(); }); }, true);
  },
  tkRevoke(id) {
    const t = tkT(id), k = M[t.kid]; if (!can('tasks.revoke')) return ACT.denied('tasks.revoke');
    if (offline()) { toast('إلغاء التحقق يحتاج اتصالاً · حاول حين يعود', null, 'cloud_off'); return; }
    const lid = t.lid || ((RW().led[t.kid] || []).find(e => e.k === 'task' && e.t === t.t && e.d === 0 && !e.rev) || {}).id;
    confirmDlg('إلغاء التحقق؟', `تعود «${t.t}» إلى ${k.n} ل${vb(k, 'يسلّمها', 'تسلّمها')} من جديد${lid ? `، وتُخصم ${rwPt(t.pts)} من ${vb(k, 'محفظته', 'محفظتها')}` : ''}. ${vb(k, 'يرى', 'ترى')} ${k.n} ذلك في مهام${k.f ? 'ها' : 'ه'}.`, 'ألغِ التحقق', () => {
      const vf = t.vf; t.lid = lid || null; const n = tkUncredit(t, me().id); t.st = 'PENDING'; t.re = 1; t.note = 'أُلغي التحقق. ' + vb(k, 'سلّمها', 'سلّميها') + ' من جديد.'; t.nby = me().id;
      audit(`إلغاء التحقق من «${t.t}»${vf === 'ai' ? ' (تحقق المساعد)' : ''}`, 'tasks.revoke'); back(); toast(`أُلغي التحقق${n ? ` · خُصمت ${rwPt(n)}` : ''}`, null, 'undo');
    }, true);
  },

  /* الطفل والمراهق */
  tkTick(id, i) { const t = tkT(id); t.dn = t.dn || []; t.dn[+i] = !t.dn[+i]; },
  tkCap(id) { const t = tkT(id); S.tkP = { id, step: t.proof === 'audio' ? 'rec' : 'cap' }; },
  tkShot() { const P = S.tkP; if (!P) return; P.step = 'ready'; },
  tkPx() { S.tkP = null; },
  tkSend(id) { tkSubmit(id); },
  cSubmit(id) { tkSubmit(id); },
  teenDone(id) { const t = tkT(id); if (t.by !== t.kid) return void (S.sheet = { id: 'c-task', a: [id] }); t.st = 'APPROVED'; S.sheet = null; toast('أُنجزت', () => { t.st = 'PENDING'; render(); }); },
  tkOwnUndo(id) { const t = tkT(id); if (t.by === t.kid) t.st = 'PENDING'; },
  tkOwnDel(id) { const t = tkT(id), i = S.tasks.indexOf(t); if (t.by !== t.kid) return; S.tasks.splice(i, 1); S.sheet = null; toast('حُذفت مهمتك', () => { S.tasks.splice(i, 0, t); render(); }); },
  teenTask() { if (!S.teenTasks) { toast('لم يسمح والدك بإنشاء المهام بعد · اطلبها من «ملفي»', null, 'lock'); return; } S.tt = null; S.sheet = { id: 't-task-new', a: [] }; },
  tkTt(k, v) { const a = $('#ttT'); if (a) S.tt.t = a.value; S.tt[k] = k === 'rem' ? +v : v; },
  tkTtSave() {
    const a = $('#ttT'), d = S.tt, t = ((a ? a.value : d.t) || '').trim(); if (!S.teenTasks) return; if (!t) { toast('اكتب عنوان المهمة أولاً', null, 'error'); return; }
    const x = { id: 't' + Date.now(), kid: 'khaled', by: 'khaled', t, cat: 'self', pts: 0, dk: d.dk, hm: '2000', due: tkDayT(d.dk), proof: 'self', st: 'PENDING', rr: d.rr, rep: tkRepT(d.rr, []), rem: +d.rem };
    S.tasks.unshift(x); const off = queue('مهمة «' + t + '»', 'S1-06'); S.tt = null; S.sheet = null; toast(off ? 'حُفظت مهمتك · تُرسل عند الاتصال' : 'أُضيفت مهمتك', () => { S.tasks = S.tasks.filter(q => q !== x); render(); }, off ? 'cloud_upload' : 'check_circle');
  },

  /* الفئات */
  tkCSet(k, v) { const a = $('#tkCN'); if (a) S.tkC.n = a.value; S.tkC[k] = k === 'c' ? TK_CC[+v] : v; },
  tkCatSave() {
    if (!isOwner()) return ACT.denied('tasks.category.create'); const a = $('#tkCN'), d = S.tkC, n = ((a ? a.value : d.n) || '').trim(); d.n = n;
    if (!n) { toast('اكتب اسم الفئة', null, 'error'); return; }
    if (tkCats().some(([, c]) => c[0] === n)) { toast('عندك فئة بهذا الاسم', null, 'error'); return; }
    if (tkCats().length >= TK_MAXCAT) { toast('بلغت الفئات حدّها: اثنتا عشرة فئة', null, 'error'); return; }
    const id = 'c' + (++TK().n); TK().cats[id] = [n, d.i, d.c]; if (S.nt) S.nt.cat = id; S.tkC = null; S.sheet = null; queue(`فئة «${n}»`, 'S1-06'); audit(`إضافة فئة مهام «${n}»`, 'tasks.category.create');
    toast(`أُضيفت فئة «${n}»`, () => { delete TK().cats[id]; if (S.nt && S.nt.cat === id) S.nt.cat = 'home'; render(); });
  },
  tkCatDel(id) { if (!isOwner()) return ACT.denied('tasks.category.create'); const c = TK().cats[id]; if (!c || S.tasks.some(t => t.cat === id && t.st !== 'CANCELLED')) return; delete TK().cats[id]; audit(`حذف فئة مهام «${c[0]}»`, 'tasks.category.create'); toast(`حُذفت فئة «${c[0]}»`, () => { TK().cats[id] = c; render(); }); },

  /* الضوابط */
  tkRec() { if (!isOwner()) return ACT.denied('shell.config.edit'); const K = TK(); K.rec = !K.rec; queue('ضابط تكرار المهام', 'S1-06'); audit(`تكرار المهام: ${K.rec ? 'مفعّل' : 'متوقف'}`, 'shell.config.edit'); toast(K.rec ? 'عاد خيار التكرار عند إنشاء المهام' : 'أُوقف التكرار للمهام الجديدة · القائمة لا تتغيّر', () => { K.rec = !K.rec; render(); }); },
  tkEdPick(v) { if (S.tkE) S.tkE.v = isNaN(v) ? v : +v; },
  tkEdCancel() { S.tkE = null; S.sheet = null; },
  tkEdSave() {
    if (!isOwner()) return ACT.denied('shell.config.edit'); const d = S.tkE, c = TK_ED[d.k], K = TK(), was = K[d.k]; if (String(was) === String(d.v)) return; K[d.k] = d.v; S.tkE = null; S.sheet = null;
    const off = queue(c.t, 'S1-06'); audit(`${c.t}: ${c.lab(d.v)}`, 'shell.config.edit'); toast(off ? `حُفظ «${c.t}» · يُرسل عند الاتصال` : `${c.t}: ${c.lab(d.v)}`, () => { K[d.k] = was; render(); }, off ? 'cloud_upload' : 'check_circle');
  },

  /* المساعد والمهام */
  tkAi(k, v) { if (!isOwner()) return ACT.denied('shell.config.edit'); const d = tkAiD(); d[k] = k === 'lv' ? v : +v; },
  tkAiKid(id) { if (!isOwner()) return ACT.denied('shell.config.edit'); const d = tkAiD(), i = d.kids.indexOf(id); if (i < 0) d.kids.push(id); else d.kids.splice(i, 1); },
  tkAiCancel() { S.tkA = null; },
  tkAiSave() {
    if (!isOwner()) return ACT.denied('shell.config.edit'); if (!tkAiCh()) return; const K = TK(), was = K.ai, d = S.tkA; K.ai = { lv: d.lv, mx: d.mx, pd: d.pd, kids: d.kids.slice() }; S.tkA = null;
    const made = d.lv === 'assign' && !S.aiKill && !offline() ? tkAiRun() : [], off = queue('تفويض المساعد في المهام', 'S1-06');
    audit(`تفويض المساعد في المهام: ${TK_LV[d.lv][0]}${d.lv === 'assign' ? ` (حتى ${rwPt(d.mx)} · ${d.pd} في اليوم)` : ''}`, 'shell.config.edit');
    toast(off ? 'حُفظ التفويض · يُرسل عند الاتصال' : made.length ? `حُفظ · أسند المساعد ${made.length === 1 ? 'مهمة واحدة' : made.length === 2 ? 'مهمتين' : made.length + ' مهام'} ضمن حدودك` : `المساعد الآن: ${TK_LV[d.lv][0]}`, () => { K.ai = was; made.forEach(([t, s, g]) => { S.tasks = S.tasks.filter(x => x !== t); s.st = 'new'; S.agent = S.agent.filter(x => x !== g); }); render(); }, off ? 'cloud_upload' : made.length ? 'wand_stars' : 'check_circle');
  },
  tkSugOk(id) {
    const s = TK().sug.find(x => x.id === id); if (!can('tasks.create', s.kid)) return ACT.denied('tasks.create');
    const t = tkFromSug(s, me().id); t.sg = 1; S.tasks.unshift(t); s.st = 'ok'; S.sheet = null; const off = queue('مهمة «' + s.t + '»', 'S1-06'); audit(`إسناد مهمة «${s.t}» إلى ${M[s.kid].n} باقتراح من المساعد`, 'tasks.create');
    toast(off ? 'حُفظت المهمة في الصندوق الصادر' : `أُسندت «${s.t}» إلى ${M[s.kid].n}`, () => { S.tasks = S.tasks.filter(x => x !== t); s.st = 'new'; render(); }, off ? 'cloud_upload' : 'check_circle');
  },
  tkSugNo(id) { const s = TK().sug.find(x => x.id === id); s.st = 'no'; S.sheet = null; toast('صُرف الاقتراح · لن يعيده المساعد هذا الأسبوع', () => { s.st = 'new'; render(); }); },
  tkSugEdit(id) { const s = TK().sug.find(x => x.id === id); if (!can('tasks.create', s.kid)) return ACT.denied('tasks.create'); S.nt = { sg: s.id, dirty: 1, t: s.t, kid: s.kid, cat: s.cat, pts: s.pts, proof: s.proof, dk: s.dk, hm: s.hm, rr: s.rr, wd: [0, 3], rem: TK().rem, sub: [] }; S.sheet = null; go('task-new'); },
});
const tkFromSug = (s, by) => ({ id: 't' + s.id + (++TK().n), kid: s.kid, by, t: s.t, cat: s.cat, pts: tkTeen(s.kid) ? 0 : s.pts, dk: s.dk, hm: s.hm, due: `${tkDayT(s.dk)} ${tkTm(s.hm)}`, proof: s.proof, st: 'PENDING', rr: s.rr, rep: tkRepT(s.rr, []), rem: TK().rem });
/* المساعد يسند ما يقع داخل الحدود، بترتيب الاقتراحات، ويسجّل كل مهمة في سجله (S1-09 REQ-018) */
function tkAiRun() {
  const A = TK().ai, made = [];
  TK().sug.filter(s => s.st === 'new' && s.proof !== 'self').forEach(s => { if (!tkFits(s)) return; const k = M[s.kid], t = tkFromSug(s, 'ai'); S.tasks.unshift(t); s.st = 'ai';
    const g = tkLog({ t: `أسند مهمة «${s.t}» إلى ${k.n}`, k: 'agent.plan.create', cap: 'يُعدّ المهام', op: 'assign', gate: `ضمن حدود تفويضك: حتى ${rwPt(A.mx)}، و${A.pd === 1 ? 'مهمة واحدة' : A.pd === 2 ? 'مهمتان' : 'ثلاث مهام'} في اليوم`, st: 'نُفّذ', kid: s.kid, need: 'tasks.view', tid: t.id, ev: `${s.why} استند إلى: ${s.src}. لم يقرأ رسالة ولم يفتح صورة.`, res: `المهمة عند ${k.n} الآن. تلغيها من صفحتها متى شئت.`, kt: 'أعدّ لك المساعد مهمة', kres: `«${s.t}» في مهامك، بإذن ${k.role === 'teen' ? 'والدك' : 'بابا'}.` });
    made.push([t, s, g]); });
  return made;
}
