/* «عائلتي» — النموذج الأولي التفاعلي · النواة: الحالة، التنقل، المكوّنات، الطبقات.
   بلا مكتبات خارجية. كل البيانات المعروضة بيانات عرض توضيحية (عائلة افتراضية). */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- الأيقونات: Material Symbols Rounded عبر sprite ---------- */
const MIR = new Set(['arrow_back', 'arrow_forward', 'chevron_right', 'chevron_left', 'send', 'reply', 'logout', 'undo', 'open_in_new', 'keyboard_arrow_left', 'keyboard_arrow_right', 'directions_walk', 'arrow_right_alt', 'backspace', 'route', 'menu_book', 'checklist', 'receipt_long', 'chat', 'forum', 'sms', 'volume_up', 'help']);
function ic(n, c = '') {
  const base = n.replace('-fill', '');
  const id = window.FOS_ICONS[n] ? n : base;
  if (!window.FOS_ICONS[id]) console.warn('icon?', n);
  return `<svg class="ic ${MIR.has(base) ? 'mir ' : ''}${c}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}
function mountSprite() {
  const s = Object.entries(window.FOS_ICONS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 -960 960 960"><path d="${d}"/></symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${s}</svg>`);
}

/* ---------- الحالة المشتركة (عائلة واحدة — حالة واحدة تراها كل الشخصيات) ---------- */
const M = {
  ahmad: { id: 'ahmad', n: 'أحمد', en: 'Ahmad', rel: 'الأب · المالك', role: 'adult', owner: 1, c: '#1F3A6B', i: 'face_6' },
  sara: { id: 'sara', n: 'سارة', en: 'Sara', rel: 'الأم · بالغ مفوَّض', role: 'adult', c: '#7A3E65', i: 'face_3' },
  khaled: { id: 'khaled', n: 'خالد', en: 'Khaled', rel: 'مراهق · 15 سنة', role: 'teen', by: 2011, c: '#1C6E73', i: 'face_5' },
  layan: { id: 'layan', n: 'ليان', en: 'Layan', rel: 'طفلة · 9 سنوات', role: 'child', by: 2017, c: '#CF5B2C', i: 'face_4' },
  yusuf: { id: 'yusuf', n: 'يوسف', en: 'Yusuf', rel: 'طفل · 5 سنوات', role: 'child', by: 2021, mini: 1, c: '#1F6B3B', i: 'face_2' },
};
const KIDS = ['khaled', 'layan', 'yusuf'];
const PERSONA = {
  guest: { n: 'جهاز جديد', d: 'قبل الدخول: التهيئة والإقران', i: 'mobile', c: '#494536', mode: 'parent' },
  owner: { m: 'ahmad', n: 'أحمد — الأب', d: 'المالك · كل الصلاحيات', mode: 'parent' },
  delegate: { m: 'sara', n: 'سارة — بالغ مفوَّض', d: 'ترى ما مُنح لها فقط', mode: 'parent' },
  teen: { m: 'khaled', n: 'خالد — مراهق', d: '13–17 · استقلالية وشفافية', mode: 'teen' },
  child: { m: 'layan', n: 'ليان — طفلة', d: '7–12 · القالب القياسي', mode: 'child' },
  mini: { m: 'yusuf', n: 'يوسف — طفل صغير', d: 'دون 7 · القالب المبسّط', mode: 'mini' },
};
/* الرقم التجريبي لبوابة الوالدين. ليس 123456 لأنه نمط شائع ممنوع (S1-01 REQ-005). */
const DEMO_PIN = '482615';
const fresh = () => ({
  persona: 'owner', theme: 'light', lang: 'ar', ts: 1, net: 'on', lbw: false, stale: false, motion: 'on', plan: 'free', os: 'android', sys: 'ok',
  tpl: 'partner', privacy: false, freeMode: 0, preset: '', aiLevel: 'suggest', aiKill: false, checklist: { family: 1, pin: 1, child: 1, pair: 1, rules: 1, emergency: 0, adult: 1 },
  stack: [{ id: 'home', a: [] }], sheet: null, full: null, dlg: null,
  /* الهوية (S1-02): الدعوات المعلقة، جهة الاسترداد، الأجهزة الداخلة، البصمة مطفأة افتراضاً (Q-219) */
  invs: [{ c: 'MNSR-7K2P', d: 'اليوم', left: 7 }], rec: 'sara', sess: [{ n: 'Samsung Galaxy A54', i: 'mobile', cur: 1 }, { n: 'Lenovo Tab M10', i: 'tablet_android', at: 'آخر دخول قبل 3 أيام', pl: 'صنعاء' }], bio: false, bioChg: 0, exp: {}, unp: {}, delP: 0, recReq: null, pcSt: 'live',
  kid: {
    khaled: { quota: 180, used: 75, pts: 0, streak: 0, bat: 64, place: 'المدرسة', ago: 4, moving: false, online: true, enf: 'degraded', x: 68, y: 30, extra: 0, spent: 0 },
    layan: { quota: 120, used: 96, pts: 85, streak: 5, bat: 41, place: 'البيت', ago: 2, moving: false, online: true, enf: 'active', x: 36, y: 58, extra: 0, spent: 0 },
    yusuf: { quota: 60, used: 20, pts: 30, streak: 2, bat: 88, place: 'البيت', ago: 2, moving: false, online: true, enf: 'active', x: 40, y: 62, extra: 0, spent: 0 },
  },
  apps: {
    layan: [
      { id: 'ytk', n: 'YouTube Kids', i: 'smart_display', act: 'LIMIT', lim: 45, used: 45 },
      { id: 'mc', n: 'Minecraft', i: 'sports_esports', act: 'LIMIT', lim: 30, used: 12 },
      { id: 'mad', n: 'مدرستي', i: 'school', act: 'ALLOW', study: 1, used: 39 },
      { id: 'tt', n: 'TikTok', i: 'music_note', act: 'BLOCK', used: 0 },
    ],
    khaled: [
      { id: 'wa', n: 'WhatsApp', i: 'chat', act: 'ALLOW', used: 25 },
      { id: 'pubg', n: 'PUBG Mobile', i: 'sports_esports', act: 'LIMIT', lim: 60, used: 40 },
      { id: 'mad', n: 'مدرستي', i: 'school', act: 'ALLOW', study: 1, used: 10 },
    ],
    yusuf: [
      { id: 'ytk', n: 'YouTube Kids', i: 'smart_display', act: 'LIMIT', lim: 30, used: 20 },
      { id: 'draw', n: 'ألوان ورسم', i: 'palette', act: 'ALLOW', study: 1, used: 0 },
    ],
  },
  tasks: [
    { id: 't1', kid: 'layan', t: 'ترتيب الغرفة', cat: 'home', pts: 10, due: 'اليوم 5:00 م', proof: 'photo', st: 'SUBMITTED', ai: 'unsure', sub: ['ترتيب السرير', 'جمع الألعاب'] },
    { id: 't2', kid: 'layan', t: 'حلّ واجب الرياضيات', cat: 'school', pts: 15, due: 'اليوم 7:00 م', proof: 'photo', st: 'PENDING', rep: 'كل يوم دراسي' },
    { id: 't3', kid: 'layan', t: 'صلاة المغرب في وقتها', cat: 'deen', pts: 10, due: 'اليوم 5:40 م', proof: 'self', st: 'PENDING', rep: 'يومياً' },
    { id: 't4', kid: 'layan', t: 'تنظيف الأسنان', cat: 'self', pts: 5, due: 'اليوم 8:30 م', proof: 'self', st: 'APPROVED', rep: 'يومياً' },
    { id: 't5', kid: 'yusuf', t: 'جمع الألعاب في الصندوق', cat: 'home', pts: 5, due: 'اليوم', proof: 'self', st: 'PENDING' },
    { id: 't6', kid: 'yusuf', t: 'غسل اليدين قبل الأكل', cat: 'self', pts: 5, due: 'اليوم', proof: 'self', st: 'APPROVED' },
    { id: 't7', kid: 'khaled', t: 'مراجعة الفيزياء — الفصل 3', cat: 'school', pts: 0, due: 'غداً 4:00 م', proof: 'self', st: 'PENDING' },
    { id: 't8', kid: 'khaled', t: 'إخراج القمامة', cat: 'home', pts: 0, due: 'اليوم 9:00 م', proof: 'self', st: 'PENDING', rep: 'الأحد والأربعاء' },
  ],
  reqs: [],            // طلبات الوقت الإضافي
  alerts: [
    { id: 'a1', k: 'tamper', kid: 'khaled', t: 'تعطّلت خدمة الوصول على جهاز خالد', s: 'الحماية تعمل جزئياً · نحاول إعادة التفعيل تلقائياً', ago: 'قبل 12 د', p: 1, open: 1 },
    { id: 'a2', k: 'chat', kid: 'layan', t: 'رسالة تحتاج مراجعتك في محادثة ليان', s: 'رصدها المصنّف الآلي · قد يكون التقدير خاطئاً', ago: 'قبل ساعة', p: 2, open: 1 },
    { id: 'a3', k: 'perm', kid: null, t: 'محاولة وصول مرفوضة: سارة ← «تعديل الحصة اليومية»', s: 'المفتاح protection.quota.edit للمالك حصراً', ago: 'أمس 9:14 م', p: 3, open: 0 },
  ],
  outbox: [], sos: null, sms: { used: 14 }, aiUse: 212,
  audit: [
    { t: 'طُبّق قالب «شريك» على سارة', w: 'أحمد', at: 'أمس 8:02 م', k: 'roles.template.apply' },
    { t: 'عُدّلت الحصة اليومية لليان: 150 ← 120 د', w: 'أحمد', at: 'أمس 7:40 م', k: 'protection.quota.edit' },
    { t: 'رُفض: سارة حاولت «تعديل الحصة اليومية»', w: 'النظام', at: 'أمس 9:14 م', k: 'protection.quota.edit', deny: 1 },
  ],
  agent: [
    { id: 'g1', t: 'ملخّص يوم الأطفال', k: 'agent.summary.read', gate: 'بلا موافقة (قراءة)', at: 'اليوم 6:00 ص', undo: 0, st: 'تمّ' },
    { id: 'g2', t: 'تحقّق من صورة مهمة «ترتيب الغرفة»', k: 'agent.task.verify', gate: 'تعذّر الجزم ← أُحيل إليك', at: 'اليوم 3:12 م', undo: 0, st: 'محال' },
    { id: 'g3', t: 'اقتراح: تقديم نافذة النوم 30 دقيقة ليالي المدرسة', k: 'agent.rule.change', gate: 'يتطلب موافقتك', at: 'اليوم 3:30 م', undo: 0, st: 'بانتظارك' },
  ],
  chat: {
    majlis: [
      { f: 'sara', x: 'العشاء جاهز بعد المغرب إن شاء الله 🍲', at: '4:52', st: 2 },
      { f: 'khaled', x: 'سأتأخر عشر دقائق، عندي مراجعة', at: '4:55', st: 2 },
      { f: 'layan', k: 'img', x: 'رسمتي اليوم', at: '5:01', st: 2 },
      { f: 'ahmad', x: 'ما شاء الله يا ليان 👏', at: '5:03', st: 2 },
    ],
    parents: [
      { f: 'sara', x: 'موعد طبيب يوسف الخميس 4 العصر', at: '2:10', st: 2 },
      { f: 'ahmad', x: 'تمام، أضفته إلى التقويم', at: '2:14', st: 2 },
    ],
    'dm-layan': [
      { f: 'layan', x: 'بابا، خلّصت ترتيب غرفتي ✨', at: '3:10', st: 2 },
      { f: 'ahmad', x: 'أحسنتِ، سأراجع الصورة الآن', at: '3:15', st: 2 },
    ],
    'dm-khaled-layan': [
      { f: 'khaled', x: 'لا تدخلي غرفتي مرة ثانية!!', at: '1:02', st: 2, flag: 1 },
      { f: 'layan', x: 'آسفة، كنت أبحث عن قلمي', at: '1:04', st: 2 },
    ],
  },
  deleted: {}, pin: { bad: 0, lock: 0, code: DEMO_PIN, set: true }, sos2: false, num: 'latn', saver: 'auto', notifPerm: true, lastSync: null, rank: ['sleep', 'school', 'app', 'quota'], web: { safe: true, unknown: 'ALLOW', cats: { adult: 'BLOCK', gamble: 'BLOCK', social: 'ALERT', games: 'ALLOW', video: 'ALERT', news: 'ALLOW' } },
  redeemCap: 60, events: [{ d: 19, t: 'موعد طبيب يوسف', at: '4:00 م', rem: 60 }, { d: 21, t: 'اجتماع أولياء الأمور', at: '10:00 ص', rem: 1440 }], ob: {},
});
let S = fresh();

const me = () => M[PERSONA[S.persona].m] || M.ahmad; /* الضيف بلا عضوية: لا يصل لشاشات العائلة أصلاً، والبديل يمنع الانهيار فقط */
const isAdult = () => S.persona === 'owner' || S.persona === 'delegate';
const isOwner = () => S.persona === 'owner';
const mode = () => PERSONA[S.persona].mode;
/* تقييم الصلاحية: المالك يملك الكل؛ المفوَّض يملك مفاتيح قالبه فقط؛ المفاتيح الحصرية لا تُمنح (S1-03 §5-3-ب). */
function can(key) {
  if (S.persona === 'owner') return true;
  if (S.persona !== 'delegate') return false;
  if (window.FOS_PERM.ownerOnly.includes(key)) return false;
  return S.tpl !== 'none' && window.FOS_PERM[S.tpl].includes(key);
}
const L = (ar, en) => (S.lang === 'en' && en ? en : ar);
const offline = () => S.net === 'off';
/* وسم الحداثة الصادق: لا تُعرض بيانات قديمة كأنها حية (S1-09 REQ-011). */
function age(min, word) {
  const stale = offline() || S.stale;
  const m = stale ? min + 42 : min;
  const txt = m < 1 ? 'الآن' : m < 60 ? `قبل ${m} د` : `قبل ${Math.round(m / 60)} س`;
  return `<span class="chip ${stale ? 'stale' : 'ol'}">${ic(stale ? 'history' : 'schedule')}${stale ? 'آخر تحديث ' : (word || '')}${txt}</span>`;
}
const dateAr = () => {
  const d = new Date(2026, 10, 15);
  let h = '5 جمادى الآخرة 1448';
  try { h = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(d).replace(' هـ', ''); } catch (e) { }
  return { g: 'الأحد 15 نوفمبر 2026', h: h + ' هـ', s: 'الأحد 15 نوفمبر · ' + h.replace(/\s*\d{4}.*$/, '') };
};
const CAT = { home: ['منزل', 'cleaning_services', '#1F3A6B'], school: ['مدرسة', 'school', '#2457A6'], deen: ['صلاة وقرآن', 'mosque', '#1F6B3B'], self: ['عناية ذاتية', 'self_care', '#CF5B2C'] };
const left = k => Math.max(0, S.kid[k].quota - S.kid[k].used) + S.kid[k].extra;

/* ---------- مكوّنات صغيرة ---------- */
const av = (m, c = '') => `<span class="av ${c}" style="--c:${m.c}">${ic(m.i)}</span>`;
const pname = m => (S.privacy && m.role !== 'adult' ? 'فرد' : L(m.n, m.en));
const chip = (t, c = '', i = '') => `<span class="chip ${c}">${i ? ic(i) : ''}${t}</span>`;
const tg = (on, a, lbl = '') => `<button class="tg" role="switch" aria-checked="${!!on}" aria-label="${lbl}" data-a="${a}"></button>`;
const btn = (t, a, c = '', i = '') => `<button class="btn ${c}" data-a="${a}">${i ? ic(i) : ''}${t}</button>`;
const sec = (t, more = '', a = '') => `<h3 class="sec"><span>${t}</span>${more ? `<button data-a="${a}">${more}</button>` : ''}</h3>`;
const callout = (t, c = '', i = 'info') => `<div class="callout ${c}">${ic(i)}<div>${t}</div></div>`;
const why = (id, t = 'لماذا؟') => `<button class="why" data-a="why:${id}">${ic('help')}${t}</button>`;
const seg = (opts, cur, a) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button aria-pressed="${v === cur}" data-a="${a}:${v}">${t}</button>`).join('')}</div>`;
const pbar = (pct, c = '') => `<div class="pbar ${c}"><i style="width:${Math.min(100, Math.max(0, pct))}%"></i></div>`;
const coin = () => `<span class="coin">${ic('star-fill')}</span>`;
function row(i, t, s, o = {}) {
  const tag = o.a ? 'button' : 'div';
  const lead = o.lead || (i ? `<span class="lead" ${o.ic ? `style="color:${o.ic}"` : ''}>${ic(i)}</span>` : '');
  const end = (o.v ? `<span class="val">${o.v}</span>` : '') + (o.tg !== undefined ? tg(o.tg, o.ta || '', t) : '') + (o.a && o.chev !== false ? `<span class="chev">${ic('chevron_right')}</span>` : '');
  return `<${tag} class="row ${i || o.lead ? '' : 'noic'} ${o.c || ''}" ${o.a ? `data-a="${o.a}"` : ''}>${lead}<span class="tx"><b>${t}</b>${s ? `<span>${s}</span>` : ''}</span>${end}</${tag}>`;
}
const list = (...rows) => `<div class="list">${rows.flat().filter(Boolean).join('')}</div>`;
function ring(pct, size, sw, color, inner, track = 'var(--sunken)') {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${track}" stroke-width="${sw}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${sw}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, Math.max(0, pct)))}"/></svg><div class="in">${inner}</div></div>`;
}
const empty = (i, t, s, cta = '') => `<div class="empty"><div class="em">${ic(i)}</div><b>${t}</b><div class="sm">${s}</div>${cta ? `<div style="margin-top:14px">${cta}</div>` : ''}</div>`;
/* شارات التوفر السبع الصادقة (settings-patterns.md) */
const AVAIL = {
  unavailable_on_device: ['غير متاح على هذا الجهاز', 'mobile_off', ''], pending_approval: ['بانتظار الموافقة', 'pending', 'wa'], not_delegated: ['غير مفوَّض لك', 'lock_person', ''],
  disabled_by_owner: ['أوقفه الأب', 'block', ''], requires_upgrade: ['يتطلب ترقية', 'arrow_circle_up', 'go'], coming_soon: ['قريباً', 'hourglass_empty', 'ol'],
};
const avail = k => chip(AVAIL[k][0], AVAIL[k][2], AVAIL[k][1]);

/* ---------- سجل الأسطح (شاشات / أوراق / طبقات كاملة) ---------- */
const SC = {};
/** def: {t عنوان, sys نظام, req 'NN:1,2 MM:3', st حالة (ok|pr|un), note, p شخصية, a وسائط افتراضية, r() عرض, kind: screen|sheet|full, bar, nonav, flush, foot} */
function surface(id, def) { def.id = id; def.kind = def.kind || 'screen'; SC[id] = def; }
const reqsOf = def => (def.req || '').split(/\s+/).filter(Boolean).flatMap(g => { const [s, ns] = g.split(':'); return ns.split(',').map(n => `S1-${s}/REQ-${String(n).padStart(3, '0')}`); });

const TABS = {
  parent: [['home', 'home', 'الرئيسية', 'Home'], ['family', 'groups', 'العائلة', 'Family'], ['chat', 'forum', 'المحادثات', 'Chats'], ['control', 'tune', 'التحكم', 'Control'], ['more', 'apps', 'المزيد', 'More']],
  teen: [['t-home', 'home', 'الرئيسية', 'Home'], ['chat', 'forum', 'المحادثات', 'Chats'], ['learn', 'school', 'تعلّم', 'Learn'], ['t-me', 'person', 'أنا', 'Me']],
  child: [['c-home', 'home', 'الرئيسية', 'Home'], ['chat', 'forum', 'المحادثات', 'Chats'], ['learn', 'sports_esports', 'العب وتعلّم', 'Play'], ['c-rewards', 'stars', 'مكافآتي', 'Rewards']],
  mini: [['m-home', 'home', 'بيت', 'Home']],
};
/* تبويبات البالغ المفوَّض تُشتق من منحه (S1-01 REQ-004): «الرئيسية» بمفتاح hub.dashboard.view، و«التحكم» بمفتاح hub.settings.view.
   «العائلة» و«المحادثات» و«المزيد» لكل بالغ عضو، وما بداخلها يُقفل مفتاحاً مفتاحاً. */
const TAB_KEY = { home: 'hub.dashboard.view', control: 'hub.settings.view' };
const tabsFor = () => (S.persona === 'delegate' ? TABS.parent.filter(t => !TAB_KEY[t[0]] || can(TAB_KEY[t[0]])) : TABS[mode()]);
const rootOf = p => (p === 'guest' ? 'ob-welcome' : (p === S.persona ? tabsFor() : TABS[PERSONA[p].mode])[0][0]);
const topE = () => S.stack[S.stack.length - 1];
let anim = '';
function go(id, ...a) { if (!SC[id]) return console.warn('screen?', id); const d = SC[id]; if (d.kind === 'sheet') { S.sheet = { id, a }; return; } if (d.kind === 'full') { S.full = { id, a }; return; } S.sheet = null; S.stack.push({ id, a }); anim = 'in'; }
function tab(id) { S.sheet = null; S.stack = [{ id, a: [] }]; anim = ''; }
function back() { if (S.dlg) { S.dlg = null; return; } if (S.sheet) { S.sheet = null; return; } if (S.full) { S.full = null; return; } if (S.stack.length > 1) { S.stack.pop(); anim = 'inb'; } }
function setPersona(p, keep) { S.persona = p; S.sheet = S.full = S.dlg = null; if (!keep) S.stack = [{ id: rootOf(p), a: [] }]; anim = ''; }

/* ---------- الإشعارات والتراجع ---------- */
let toastT, toastUndo;
function toast(msg, undo, icn = 'check_circle') {
  clearTimeout(toastT); toastUndo = undo;
  $('#toast').innerHTML = `<div class="toast" role="status">${ic(icn)}<span>${msg}</span>${undo ? '<button data-a="undo">تراجع</button>' : ''}</div>`;
  toastT = setTimeout(() => { $('#toast').innerHTML = ''; toastUndo = null; }, undo ? 10000 : 3200);
}
function notif(title, body, icn = 'notifications', a = '') {
  $('#notif').innerHTML = `<button class="notif" data-a="${a || 'nclose'}"><span class="ap">${ic(icn)}</span><span><b>${title}</b>${body}</span></button>`;
  setTimeout(() => { $('#notif').innerHTML = ''; }, 5200);
}
function confetti() {
  if (S.motion === 'off') return;
  const cols = ['#C8A24A', '#CF5B2C', '#1F6B3B', '#2457A6', '#F3DC9B'];
  $('#fx').innerHTML = `<div class="confetti">${Array.from({ length: 34 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${cols[i % 5]};animation-delay:${Math.random() * .35}s;transform:rotate(${Math.random() * 90}deg)"></i>`).join('')}</div>`;
  setTimeout(() => { $('#fx').innerHTML = ''; }, 1700);
}
const audit = (t, k, deny) => S.audit.unshift({ t, w: me().n, at: 'الآن', k, deny });
/* الصندوق الصادر: الأفعال دون اتصال تُحفظ ثم تُرسل بالترتيب عند عودة الاتصال (S1-01 REQ-009). */
function queue(label, sys) { if (offline()) { S.outbox.push({ t: label, sys, at: 'الآن' }); return true; } return false; }
function flushOutbox() { const n = S.outbox.length; if (n) { S.outbox = []; S.lastSync = { n, at: 'الآن' }; toast(`أُرسلت ${n} ${n === 1 ? 'عملية معلّقة' : n === 2 ? 'عمليتان معلّقتان' : 'عمليات معلّقة'} بالترتيب`, null, 'cloud_done'); } }

/* ---------- بوابة الوالدين / الرفع الأمني (الرقم التجريبي في DEMO_PIN) ---------- */
let pinCb = null, pinBuf = '';
const gateDev = () => 'جهاز ' + me().n;
function gateLog(t) { S.audit.unshift({ t: `${t} · ${gateDev()}`, w: 'النظام', at: 'الآن', k: 'shell.parent_gate', deny: 1 }); }
function gate(reason, cb, kind = 'gate') { pinCb = cb; pinBuf = ''; if (S.pin.lock > 0) gateLog('محاولة فتح بوابة الوالدين أثناء القفل'); S.full = { id: 'pin', a: [reason, kind] }; }

/* ---------- العرض ---------- */
function banners() {
  let h = '';
  const kid = !isAdult() && S.persona !== 'guest';
  if (offline()) h += kid
    ? `<div class="sys off" role="status">${ic('cloud_off')}<span>غير متصل${S.outbox.length ? ' · ما فعلته يُرسل عند عودة الاتصال' : ' · كل شيء محفوظ'}</span></div>`
    : `<div class="sys off" role="status">${ic('cloud_off')}<span>${L('غير متصل', 'Offline')}${S.outbox.length ? ` · ${S.outbox.length} بانتظار الإرسال` : ' · تعمل بآخر بيانات محفوظة'}</span>${S.outbox.length ? '<button data-a="go:outbox">عرض</button>' : ''}</div>`;
  if (S.lbw && !offline()) h += `<div class="sys lbw" role="status">${ic('data_saver_on')}<span>توفير البيانات · الصور والخرائط عند الطلب</span></div>`;
  if (S.freeMode && S.persona !== 'guest') h += `<div class="sys free" role="status">${ic('lock_open')}<span>وضع حر — ينتهي خلال ${S.freeMode} د</span>${isOwner() ? '<button data-a="freeOff">إنهاء</button>' : ''}</div>`;
  /* الإصدار دون الحد الأدنى: حثّ غير حاجب (Q-069)، للبالغين فقط */
  if (S.sys === 'soft' && isAdult()) h += `<div class="sys upd" role="status">${ic('system_update_alt')}<span>حدّث التطبيق · هذا الإصدار قديم</span><button data-a="updGo">حدّث</button></div>`;
  /* غياب إذن الإشعارات: بانر صادق مع طريق الإصلاح */
  if (!S.notifPerm && S.persona !== 'guest') h += isAdult()
    ? `<div class="sys perm" role="status">${ic('notifications_off')}<span>الإشعارات متوقفة · لن تصلك تنبيهات أطفالك</span><button data-a="notifFix">فعّلها</button></div>`
    : `<div class="sys perm" role="status">${ic('notifications_off')}<span>الإشعارات متوقفة على هذا الجهاز · أخبر بابا</span></div>`;
  return h;
}
function sosBtn() { return `<button class="sos" data-hold="sos" aria-label="${S.sos2 ? 'استغاثة — اضغط ثم أكّد' : 'استغاثة — اضغط مطولاً 3 ثوانٍ'}"><i></i>${ic('emergency_home-fill')}<span>SOS</span></button>`; }
function appbar(d, t) {
  const root = S.stack.length === 1;
  const title = typeof d.t === 'function' ? d.t(...t.a) : d.t;
  return `<header class="bar">${root ? '' : `<button class="ib" data-a="back" aria-label="رجوع">${ic('arrow_back')}</button>`}<h2>${title}</h2>${d.act ? d.act(...t.a) : ''}${S.persona === 'guest' ? '' : sosBtn()}</header>`;
}
function navbar() {
  const tabs = tabsFor(), cur = S.stack[0].id;
  const att = isAdult() ? attention().length : 0;
  return `<nav class="nav" aria-label="التنقل الرئيسي">${tabs.map(([id, i, ar, en]) => `<button data-a="tab:${id}" aria-current="${cur === id ? 'page' : 'false'}"><span class="pl">${ic(cur === id ? i + '-fill' : i)}${id === 'home' && att ? `<span class="dot">${att}</span>` : ''}</span>${L(ar, en)}</button>`).join('')}</nav>`;
}
function render() {
  /* صلاحية سُحبت والمستخدم داخل تبويبها: يعود لأقرب تبويب مسموح مع رسالة */
  if (S.persona === 'delegate' && TAB_KEY[S.stack[0].id] && !can(TAB_KEY[S.stack[0].id])) { S.stack = [{ id: tabsFor()[0][0], a: [] }]; S.sheet = null; toast('لم يعد هذا القسم ضمن صلاحياتك', null, 'lock'); }
  const ph = $('#phone'), t = topE(), d = SC[t.id];
  ph.dataset.theme = S.theme; ph.dataset.mode = mode(); ph.dataset.motion = S.lbw ? 'off' : S.motion; ph.style.setProperty('--ts', S.ts);
  ph.dir = S.lang === 'en' ? 'ltr' : 'rtl'; ph.lang = S.lang;
  const old = $('#scr'), keep = old && old.dataset.id === t.id + t.a.join() ? old.scrollTop : 0;
  const hero = d.hero && !offline() && !(S.lbw) && !(S.freeMode && isAdult());
  $('#sbar').className = 'sbar' + (hero ? ' onhero' : '');
  $('#sbar').innerHTML = `<span>5:12</span><span class="g">${ic(offline() ? 'signal_wifi_off' : S.lbw ? 'signal_cellular_alt_1_bar' : 'wifi')}${ic(offline() ? 'signal_cellular_alt_1_bar' : 'signal_cellular_alt')}${ic('battery_5_bar')}</span>`;
  $('#app').innerHTML = banners() + (d.bar === false ? '' : appbar(d, t)) +
    `<main class="scr ${d.flush ? 'flush' : ''} ${anim}" id="scr" data-id="${t.id + t.a.join()}">${d.r(...t.a)}</main>` +
    (d.foot ? d.foot(...t.a) : '') + (S.stack.length === 1 && !d.nonav && S.persona !== 'guest' ? navbar() : '');
  $('#scr').scrollTop = keep; anim = '';
  renderOv();
  if (window.Studio) Studio.sync();
}
function renderOv() {
  let h = '';
  /* الورقة السفلية تعلو شاشة الحجب، لكنها تبقى تحت بوابة الرقم السري والاستغاثة وشاشات النظام */
  const up = S.sheet && S.full && !/^(pin|sos-|sys-)/.test(S.full.id);
  if (S.sheet) { const d = SC[S.sheet.id]; h += `<div class="scrim" ${up ? 'style="z-index:45"' : ''} data-a="scrimClose"><div class="sheet" role="dialog" aria-modal="true" data-stop>${d.r(...S.sheet.a)}</div></div>`; }
  if (S.full) { const d = SC[S.full.id]; h += `<div class="full ${d.cls || ''}" role="dialog" aria-modal="true">${d.r(...S.full.a)}</div>`; }
  if (S.dlg) h += `<div class="scrim mid" style="z-index:50"><div class="dlg" role="alertdialog" aria-modal="true"><h4>${S.dlg.t}</h4><p>${S.dlg.b}</p><div class="btns">${btn(S.dlg.no || 'إلغاء', 'dlgNo', 'sec')}${btn(S.dlg.yes, 'dlgYes', S.dlg.danger ? 'dng' : '')}</div></div></div>`;
  $('#ov').innerHTML = h;
  /* زر الاستغاثة يعلو الأوراق ونوافذ التأكيد (S1-01 REQ-007 · DS-SP-07) */
  sosLift(); clearTimeout(sosLiftT); sosLiftT = setTimeout(sosLift, 340);
}
/* طبقة الاستغاثة العليا: إن غطّت الزرَّ ورقةٌ أو نافذة تأكيد، أو خرج من الشاشة بالتمرير، تظهر نسخته في طبقة فوق كل شيء وفي موضعه نفسه.
   لا تظهر قبل العضوية، ولا داخل مسار الاستغاثة نفسه، ولا فوق نافذة تأكيد الاستغاثة. */
let sosLiftT;
function sosLift() {
  const ph = $('#phone'), L = $('#sosL'); if (!L) return;
  const off = S.persona === 'guest' || (S.full && /^(sos-|sys-first)/.test(S.full.id)) || (S.dlg && S.dlg.sos);
  if (off) { L.innerHTML = ''; L.className = ''; ph.dataset.sosup = ''; return; }
  const pr = ph.getBoundingClientRect(), k = pr.width / ph.offsetWidth || 1;
  const all = [...ph.querySelectorAll('.sos')].filter(e => !L.contains(e)).map(e => [e, e.getBoundingClientRect()]).filter(([, r]) => r.width > 0);
  const vis = all.filter(([, r]) => r.top >= pr.top && r.bottom <= pr.bottom);
  const free = vis.some(([e, r]) => { const t = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).find(x => !L.contains(x)); return t && (t === e || e.contains(t)); });
  if (free) { L.innerHTML = ''; L.className = ''; ph.dataset.sosup = ''; return; }
  /* الزر مغطّى في موضعه: نسخة فوقه تماماً. الزر خرج بالتمرير: شريط علوي مطويّ يحمل عنوان الشاشة والزر. */
  const at = vis.length ? vis[vis.length - 1][1] : null, sb = $('#sbar').getBoundingClientRect(), fl = !at && !S.sheet && !S.dlg && !S.full;
  const want = fl ? 'f' : 'b'; if (L.dataset.k !== want || !L.firstChild) { const d = SC[topE().id], tt = typeof d.t === 'function' ? d.t() : d.t; L.innerHTML = (fl ? `<b>${tt}</b>` : '') + sosBtn(); L.dataset.k = want; }
  L.classList.toggle('float', fl);
  L.style.top = ((at ? at.top - pr.top : sb.bottom - pr.top + (fl ? 0 : 8 * k)) / k) + 'px';
  const rtl = ph.dir !== 'ltr';
  L.style.left = fl ? '0' : at ? ((at.left - pr.left) / k) + 'px' : (rtl ? '12px' : 'auto'); L.style.right = fl ? '0' : at ? 'auto' : (rtl ? 'auto' : '12px');
  ph.dataset.sosup = '1';
}
addEventListener('scroll', e => { if (e.target && e.target.id === 'scr') sosLift(); }, true);
let dlgCb;
function confirmDlg(t, b, yes, cb, danger) { S.dlg = { t, b, yes, danger }; dlgCb = cb; }
/* السطح الظاهر حالياً (للوحة السياق في الاستوديو) */
const current = () => SC[(S.full || S.sheet || topE()).id];

/* ---------- الأفعال (تفويض أحداث) ---------- */
const ACT = {
  go: (id, ...a) => go(id, ...a.filter(x => typeof x === 'string')), tab: id => tab(id), back: () => back(),
  undo() { const u = toastUndo; $('#toast').innerHTML = ''; toastUndo = null; if (u) u(); },
  nclose() { $('#notif').innerHTML = ''; },
  scrimClose() { S.sheet = null; },
  close() { S.sheet = null; S.full = null; },
  dlgNo() { S.dlg = null; },
  dlgYes() { S.dlg = null; const c = dlgCb; dlgCb = null; if (c) c(); },
  why(id) { S.sheet = { id: 'why', a: [id] }; },
  set(k, v) { S[k] = v === 'true' ? true : v === 'false' ? false : isNaN(v) || v === '' ? v : +v; },
  flip(k) { S[k] = !S[k]; },
  freeOff() { S.freeMode = 0; audit('أُنهي الوضع الحر', 'protection.free_mode.activate'); toast('انتهى الوضع الحر · عادت القواعد'); },
  notifFix() { S.notifPerm = true; toast('فُعّلت الإشعارات', null, 'notifications_active'); },
  soon() { toast('خارج نطاق المرحلة 1 — يُضاف عبر سجل الخدمات لاحقاً', null, 'hourglass_empty'); },
  denied(key) { S.alerts.unshift({ id: 'a' + Date.now(), k: 'perm', kid: null, t: `محاولة وصول مرفوضة: ${me().n} ← ${key}`, s: 'سُجّلت في التدقيق وأُبلغ الأب', ago: 'الآن', p: 3, open: 1 }); S.audit.unshift({ t: `رُفض: ${me().n} حاول استخدام ${key}`, w: 'النظام', at: 'الآن', k: key, deny: 1 }); S.sheet = { id: 'why', a: ['nd:' + key] }; },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el || !el.closest('#phone')) return;
  if (el.dataset.a === 'scrimClose' && e.target.closest('[data-stop]')) return;
  const [n, ...a] = el.dataset.a.split(':');
  if (!ACT[n]) return console.warn('action?', n);
  const r = ACT[n](...a, el);
  if (r !== false) render();
});
/* الضغط المطوّل 3 ثوانٍ لزر الاستغاثة (S1-07 REQ-007)، وبديل الوصول: نقرة ثم تأكيد (components §5.5). */
let holdT;
function sosAsk() { confirmDlg('إرسال استغاثة؟', 'يبدأ عدّ تنازلي 10 ثوانٍ، ويمكنك الإلغاء خلاله.', 'نعم، استغاثة', () => ACT.sosStart(), true); S.dlg.sos = 1; render(); }
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-hold]'); if (!el) return;
  if (S.sos2) { const up = () => { removeEventListener('pointerup', up); sosAsk(); }; addEventListener('pointerup', up); return; }
  el.classList.add('holding');
  holdT = setTimeout(() => { el.classList.remove('holding'); document.querySelectorAll('.sos.holding').forEach(x => x.classList.remove('holding')); ACT.sosStart(); render(); }, 3000);
  const stop = () => { clearTimeout(holdT); if (el.classList.contains('holding')) { el.classList.remove('holding'); toast('استمر بالضغط 3 ثوانٍ لإرسال الاستغاثة', null, 'touch_app'); } removeEventListener('pointerup', stop); removeEventListener('pointercancel', stop); };
  addEventListener('pointerup', stop); addEventListener('pointercancel', stop);
});
/* لوحة المفاتيح وقارئ الشاشة لا يستطيعان الضغط المطوّل: Enter أو المسافة تفتح التأكيد */
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-hold]')) { e.preventDefault(); sosAsk(); } });

/* شكل الأرقام: إعداد شخصي يسري على كل العرض (typography §6 · DS-TY-06). الرموز والأكواد (.mono/.ltr) تبقى لاتينية. */
const AR_DIG = '٠١٢٣٤٥٦٧٨٩';
function numFix(root) {
  if (S.num !== 'arab' || S.lang === 'en') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (/\d/.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('.mono,.ltr,svg,input,textarea,[data-latn]')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const L2 = []; while (w.nextNode()) L2.push(w.currentNode);
  L2.forEach(n => { n.nodeValue = n.nodeValue.replace(/\d/g, d => AR_DIG[d]); });
}
addEventListener('DOMContentLoaded', () => {
  const ph = document.getElementById('phone'); if (!ph) return;
  new MutationObserver(ms => { if (S.num !== 'arab') return; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) numFix(n); else if (n.nodeType === 3 && n.parentElement && /\d/.test(n.nodeValue) && !n.parentElement.closest('.mono,.ltr,svg,input,textarea,[data-latn]')) n.nodeValue = n.nodeValue.replace(/\d/g, d => AR_DIG[d]); })); }).observe(ph, { childList: true, subtree: true });
});
