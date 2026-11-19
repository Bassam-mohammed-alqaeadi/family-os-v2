/* S1-10 — الحماية والفرض: الشاشات الست عشرة (S10-01…S10-16) ومحرك التقييم الذي تقرأ منه كل الأسطح.
   القاعدة الحاكمة: نمرّ على أنواع القواعد بترتيب الأب من الأعلى، وأول نوع ينطبق على اللحظة يحسم (REQ-011). */
'use strict';

/* ---------- ساعة النموذج والتنسيق ---------- */
const NOW = { d: 0, m: 17 * 60 + 12 };            // الأحد 5:12 م (يوافق تاريخ النموذج وبقية الأسطح)
const DAYN = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const WK = 10080;
const t2m = s => +s.slice(0, 2) * 60 + +s.slice(3);
const hm = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60); return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'ص' : 'م'}`; };
const durTxt = n => (n === 60 ? 'ساعة' : n === 120 ? 'ساعتين' : n % 60 === 0 && n <= 600 ? `${n / 60} ساعات` : n > 60 ? `${Math.floor(n / 60)} س و${n % 60} د` : `${n} دقيقة`);
const untilTxt = n => hm(NOW.m + n) + (NOW.m + n >= 1440 ? ' غداً' : '');
const arNorm = s => (s || '').toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
const kn = id => pname(M[id]);
const devOn = kid => S.kid[kid].online && S.kidOff !== kid;       // جهاز الطفل متصل؟ (الاستوديو يقطعه للتجربة)
ACT.noop = () => false;
/* تطبيق محظور دائماً لا يصير تطبيق دراسة: الصف يقول السبب ويدلّ على مكان تغييره (Q-435) */
ACT.sdWhy = () => { toast('محظور دائماً · غيّر قاعدته من «التطبيقات» أولاً', null, 'block'); return false; };

/* ---------- سجل الحماية (REQ-026): من غيّر، ماذا، متى، لأي طفل، ومن أي نوع ---------- */
function xaud(t, k, kid, ty, un) { S.audit.unshift({ t, w: me().n, at: 'الآن', k, kid, ty, d: 0, un }); }
/* بعد الحفظ: يسري الآن، أو ينتظر على الخادم حتى يتصل جهاز الطفل (REQ-017) */
function pushed(kid, msg, undo) { if (devOn(kid)) return toast(msg, undo); S.pendR[kid] = (S.pendR[kid] || 0) + 1; toast(`حُفظ · يسري عند اتصال جهاز ${kn(kid)}`, undo, 'cloud_upload'); }
const offNote = () => (offline() ? callout('الحفظ يحتاج اتصالاً. ترى الآن آخر ما حُفظ على هاتفك.', 'wa', 'cloud_off') : '');
const saveBar = (label, a, ok) => `<div class="btns" style="margin-top:16px">${btn(label, ok && !offline() ? a : 'noop', ok && !offline() ? '' : '" disabled="')}</div>`;

/* ---------- الجدول الأسبوعي: النوافذ على خط الأسبوع ---------- */
const spans = w => w.days.map(d => { const a = d * 1440 + t2m(w.s), e = t2m(w.e); return [a, d * 1440 + (e <= t2m(w.s) ? e + 1440 : e), d]; });
const hit = (a, b, c, d) => a < d && c < b;
const hitWk = (a, b, c, d) => (hit(a, b, c, d) ? [Math.max(a, c), Math.min(b, d)] : hit(a, b, c + WK, d + WK) ? [Math.max(a, c + WK), Math.min(b, d + WK)] : hit(a, b, c - WK, d - WK) ? [Math.max(a, c - WK), Math.min(b, d - WK)] : null);
const WT = { sleep: ['نوم', 'bedtime', 'sl', 'لا يُفتح أي تطبيق · زر الاستغاثة يعمل'], school: ['مدرسة', 'school', 'sc', 'تطبيقات الدراسة فقط'] };
const pmOf = k => (S.pm[k] ? S.pm[k].k : '');
/* الأوضاع: جاهزان ثابتان (دراسة، نوم) + أوضاع الأب الخاصة S.modes. الوضع الحر مسار وحده (S.fm).
   لكل طفل وضع واحد سارٍ على الأكثر، والوضع الساري يحسم قبل ترتيب القواعد (لا تعارض بين وضع وقاعدة). */
const MODE0 = { study: { id: 'study', n: 'وضع الدراسة', i: 'school', open: 'study' }, sleep: { id: 'sleep', n: 'وضع النوم', i: 'bedtime', open: 'none' } };
const modeOf = k => MODE0[k] || (S.modes || []).find(m => m.id === k) || null;
const modeAct = kid => (S.pm[kid] ? modeOf(S.pm[kid].k) : null);
const modeN = k => (k === 'free' ? 'وضع حر' : (modeOf(k) || { n: 'وضع' }).n);
const modeQ = k => (k === 'free' ? 'الوضع الحر' : MODE0[k] ? MODE0[k].n : `وضع «${(modeOf(k) || { n: '' }).n}»`);
const modeI = k => (k === 'free' ? 'lock_open' : (modeOf(k) || { i: 'bolt' }).i);
/* نافذة الجدول السارية الآن (الجدول وحده) */
function schedNow(kid) { const t = NOW.d * 1440 + NOW.m; const w = S.sched[kid].find(x => spans(x).some(([a, b]) => hitWk(a, b, t, t + 1))); return w ? w.type : ''; }
/* ما يحكم «الآن» كما يراه الطفل: الوضع الساري أولاً ثم نافذة الجدول. يرجع sleep | school | mode | '' */
function winNow(kid) { const m = modeAct(kid); if (m) return m.id === 'sleep' ? 'sleep' : m.id === 'study' ? 'school' : 'mode'; return schedNow(kid); }
/* أول نافذة في الجدول تبدأ قبل انتهاء المدة: [دقائق من الآن، النوع] أو null */
function crossOf(kid, n) { const t = NOW.d * 1440 + NOW.m; let best = null; S.sched[kid].forEach(x => spans(x).forEach(([a]) => { const d = (((a - t) % WK) + WK) % WK; if (d > 0 && d < n && (!best || d < best[0])) best = [d, x.type]; })); return best; }
/* هل يحتاج التقاطع قراراً من الأب؟ لا يحتاجه إن كان أثر الوضع هو أثر النافذة نفسها */
const crossAsk = (k, c) => { const m = modeOf(k); return !!c && !!m && !(m.open === 'none' && c[1] === 'sleep') && !(m.open === 'study' && c[1] === 'school'); };
function winEnd(kid) { const p = S.pm[kid]; if (p) return p.until; const t = NOW.d * 1440 + NOW.m; for (const x of S.sched[kid]) for (const [a, b] of spans(x)) { const h = hitWk(a, b, t, t + 1); if (h) return hm(t2m(x.e)); } return ''; }
/* كشف التداخل على خط الأسبوع لا في اليوم نفسه فقط (REQ-006): يرجع وصف أول تداخل أو '' */
function winClash(kid, w) {
  const mine = spans(w);
  for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) if (hitWk(mine[i][0], mine[i][1], mine[j][0], mine[j][1])) return `هذه النافذة تتداخل مع نفسها بين ${DAYN[mine[i][2]]} و${DAYN[mine[j][2]]}`;
  for (const o of S.sched[kid]) { if (o.id === w.id) continue; for (const x of mine) for (const y of spans(o)) { const h = hitWk(x[0], x[1], y[0], y[1]); if (h) return `تتداخل مع نافذة ${WT[o.type][0] === 'نوم' ? 'النوم' : 'المدرسة'} يوم ${DAYN[Math.floor((((h[0] % WK) + WK) % WK) / 1440)]} من ${hm(h[0])} إلى ${hm(h[1])}`; } }
  return '';
}
const daysTxt = d => { const k = d.slice().sort().join(''); return k === '0123456' ? 'كل يوم' : k === '01234' ? 'الأحد – الخميس' : k === '56' ? 'الجمعة والسبت' : d.slice().sort().map(i => DAYN[i]).join('، '); };
const winRange = w => `${hm(t2m(w.s))} – ${hm(t2m(w.e))}${t2m(w.e) <= t2m(w.s) ? ' (اليوم التالي)' : ''}`;
const winTxt = (kid, type) => { const w = S.sched[kid].find(x => x.type === type); return w ? `${hm(t2m(w.s))} – ${hm(t2m(w.e))}` : 'بلا نافذة'; };
const schedSum = kid => { const s = S.sched[kid]; return s.length ? s.map(w => `${WT[w.type][0]} ${hm(t2m(w.s))}`).join(' · ') : 'بلا نوافذ بعد'; };
/* الحد التالي بلغة الناس */
function nextEdge(kid) {
  if (fmOf(kid)) return `ينتهي الوضع الحر بعد ${fmOf(kid)} د`;
  const p = S.pm[kid]; if (p) return `ينتهي ${modeQ(p.k)} ${p.until}`;
  const w = schedNow(kid); if (w) return `تنتهي نافذة ${w === 'sleep' ? 'النوم' : 'المدرسة'} ${winEnd(kid)}`;
  const t = NOW.d * 1440 + NOW.m; let best = null;
  S.sched[kid].forEach(x => spans(x).forEach(([a]) => { const d = (((a - t) % WK) + WK) % WK; if (!best || d < best[0]) best = [d, x, a]; }));
  if (!best) return 'تُصفَّر الحصة عند منتصف الليل';
  const day = Math.floor(best[2] / 1440) % 7, same = day === NOW.d && best[0] < 1440, tom = day === (NOW.d + 1) % 7;
  return `وقت ${best[1].type === 'sleep' ? 'النوم' : 'المدرسة'} ${same ? '' : tom ? 'غداً ' : DAYN[day] + ' '}${hm(best[2])}`;
}

/* ---------- محرك التقييم (REQ-010/011/012 · §4-1 evaluateNow) ---------- */
const RANK = { sleep: ['النوم', 'bedtime'], school: ['المدرسة', 'school'], app: ['قواعد التطبيقات', 'apps'], quota: ['الحصة اليومية', 'hourglass_top'] };
const RANK0 = ['sleep', 'school', 'app', 'quota'];
const rankOf = kid => S.rankKid[kid] || S.rank;
const limLeft = a => Math.max(0, (a.lim || 0) - a.used);
/* القواعد الدائمة دون نوافذ الجدول: قاعدة التطبيق والحصة بترتيبهما عند هذا الطفل */
function limCheck(kid, a) {
  for (const t of rankOf(kid)) {
    if (t === 'app' && a.act) return a.act === 'ALLOW' ? { ok: true, why: 'app' } : a.act === 'BLOCK' ? { ok: false, why: 'blocked' } : { ok: limLeft(a) > 0, why: 'app' };
    if (t === 'quota') return { ok: left(kid) > 0, why: 'quota' };
  }
  return { ok: true, why: '' };
}
/* يرجع { ok, why }: why = free | mode | sleep | school | app | blocked | quota
   السلّم واحد لكل الشاشات: الوضع الحر ← الوضع الساري ← ترتيب القواعد. فلا يجتمع حكمان على تطبيق. */
function decide(kid, aid) {
  if (fmOf(kid)) return { ok: true, why: 'free' };                       // 1) الوضع الحر
  const a = appOf(kid, aid), m = modeAct(kid);
  if (m) {                                                               // 2) الوضع الساري يحسم وحده
    if (a.act === 'BLOCK') return { ok: false, why: 'blocked' };         //    المحظور محظور في كل وضع
    if (m.open === 'none') return { ok: false, why: m.id === 'sleep' ? 'sleep' : 'mode' };
    if (m.open === 'study') return a.study ? { ok: true, why: 'mode' } : { ok: false, why: 'school' };
    if (m.open === 'list') return !m.apps.includes(aid) ? { ok: false, why: 'mode' } : m.lim ? limCheck(kid, a) : { ok: true, why: 'mode' };
    return limCheck(kid, a);                                             //    all: الحدود باقية، والنوافذ متجاوَزة
  }
  const w = schedNow(kid);                                               // 3) ترتيب الأب: أول نوع مطابق يفوز
  for (const t of rankOf(kid)) {
    if (t === 'sleep' && w === 'sleep') return { ok: false, why: 'sleep' };
    if (t === 'school' && w === 'school') return { ok: !!a.study, why: 'school' };
    if (t === 'app' && a.act) return a.act === 'ALLOW' ? { ok: true, why: 'app' } : a.act === 'BLOCK' ? { ok: false, why: 'blocked' } : { ok: limLeft(a) > 0, why: 'app' };
    if (t === 'quota') return { ok: left(kid) > 0, why: 'quota' };
  }
  return { ok: true, why: '' };
}
const nApps = n => (n === 1 ? 'تطبيق واحد' : n === 2 ? 'تطبيقان' : n <= 10 ? n + ' تطبيقات' : n + ' تطبيقاً');
const modeShort = m => (m.open === 'none' ? 'لا يُفتح أي تطبيق' : m.open === 'study' ? 'تطبيقات الدراسة فقط' : m.open === 'all' ? 'كل التطبيقات بحدودها · يتجاوز النوم والمدرسة' : `${nApps(m.apps.length)} فقط · ${m.lim ? 'بحدودها' : 'بلا حد داخل الوضع'}`);
/* ما الذي يحكم الطفل الآن — لحالة الحماية ولوحة الأهل (REQ-025) */
function nowRule(kid) {
  if (fmOf(kid)) return ['lock_open', 'وضع حر', `كل القواعد متوقفة · بقي ${fmOf(kid)} د`, 'ac'];
  const m = modeAct(kid); if (m) return [m.i, modeQ(m.id), `${modeShort(m)} · حتى ${S.pm[kid].until}`, 'in'];
  const w = schedNow(kid), r = rankOf(kid), top = r.find(t => (t === 'sleep' && w === 'sleep') || (t === 'school' && w === 'school') || t === 'app' || t === 'quota');
  if (w === 'sleep' && top === 'sleep') return ['bedtime', 'وقت نوم', 'لا يُفتح أي تطبيق', 'in'];
  if (w === 'school' && top === 'school') return ['school', 'وقت مدرسة', 'تطبيقات الدراسة فقط', 'in'];
  return left(kid) > 0 ? ['wb_sunny', 'وقت متاح', `بقي ${left(kid)} د من الحصة اليومية`, 'ok'] : ['hourglass_empty', 'نفدت الحصة اليومية', 'تُفتح التطبيقات التي لها رصيد خاص فقط', 'wa'];
}

/* ---------- مكوّنات مشتركة ---------- */
const DUR = [[30, '30 دقيقة'], [60, 'ساعة'], [120, 'ساعتان'], [180, '3 ساعات']];
/* اختيار المدة: لا مدة جاهزة. بلا اختيار لا تفعيل (REQ-019/024). */
function durPick(key) { const n = S[key] || 0, custom = n && !DUR.some(d => d[0] === n); return `<div class="chs">${DUR.map(([v, t]) => `<button aria-pressed="${n === v}" data-a="set:${key}:${v}">${t}</button>`).join('')}</div><label class="fld"><span>أو اكتب المدة بالدقائق</span><input inputmode="numeric" dir="ltr" data-ch="durSet:${key}" value="${custom ? n : ''}" placeholder="مثال: 45"><small>من دقيقة إلى 1440 دقيقة (يوم كامل)</small></label>`; }
ACT.durSet = (key, v) => { const n = parseInt(v, 10); S[key] = n >= 1 && n <= 1440 ? n : 0; };
/* عدّاد دقائق: ناقص · رقم يُكتب · زائد */
const numStep = (v, a, unit, step = 5) => `<div class="stepper"><button data-a="${a}:-${step}" aria-label="أقل" ${v == null || v <= 0 ? 'disabled' : ''}>${ic('remove')}</button><label class="numf"><input inputmode="numeric" dir="ltr" data-ch="${a}:=" value="${v ?? ''}" placeholder="—" aria-label="${unit}"><small>${unit}</small></label><button data-a="${a}:${step}" aria-label="أكثر" ${v >= 1440 ? 'disabled' : ''}>${ic('add')}</button></div>`;
const stepV = (cur, op, val) => { let n = op === '=' ? parseInt(val, 10) : (cur ?? 0) + +op; if (isNaN(n)) return null; return Math.min(1440, Math.max(0, n)); };
const dayRow = (i, v, a, step, extra = '') => `<div class="dq"><b>${DAYN[i]}${i === NOW.d ? ' ' + chip('اليوم', 'in') : ''}${extra}</b><button data-a="${a}:${i}:-${step}" aria-label="أقل" ${v == null || v <= 0 ? 'disabled' : ''}>${ic('remove')}</button><span class="n">${v ?? '—'}<small>دقيقة</small></span><button data-a="${a}:${i}:${step}" aria-label="أكثر" ${v >= 1440 ? 'disabled' : ''}>${ic('add')}</button></div>`;
/* مبدّل الطفل: يغيّر وسيط الشاشة الحالية، ويحذّر إن كان فيها تعديل غير محفوظ */
const kidTabs = cur => `<div class="fch w">${KIDS.map(id => `<button aria-pressed="${cur === id}" data-a="pkid:${id}">${av(M[id], 'sm')}${kn(id)}</button>`).join('')}</div>`;
const iosNote = () => (S.os === 'ios' ? callout('على أجهزة iOS لا يستطيع التطبيق إغلاق التطبيقات. تُحفظ القواعد هنا وتتبع الطفل إلى أي جهاز Android يقترن به. ' + why('ios'), 'wa', 'ios') : '');
const searchBox = (ph, sel) => `<label class="fld srch"><input type="search" placeholder="${ph}" data-filter="${sel}" aria-label="${ph}"></label>`;

/* ---------- المسودات وتحذير المغادرة (DS-SE-06): لا ضياع صامت ---------- */
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DRAFT = {
  'app-rule': { key: 'ad', dirty: () => !!S.ad && !same(adOf(S.ad.kid, S.ad.id), S.ad) },
  quota: { key: 'qd', dirty: () => !!S.qd && !same(qOf(S.qd.kid), S.qd.v) },
  priority: { key: 'pd', dirty: () => !!S.pd && !same(pdSaved(S.pd.sc), S.pd.r) },
  'study-apps': { key: 'sd', dirty: () => !!S.sd && !same(sdOf(S.sd.kid), S.sd.on) },
  webfilter: { key: 'wr', dirty: () => !!S.wr && !same(wrOf(S.wr.kid), { kid: S.wr.kid, c: S.wr.c, f: S.wr.f }) },
};
const topId = () => S.stack[S.stack.length - 1].id;
function draftGuard(then) { const d = DRAFT[topId()]; if (!d || S.sheet || S.full) return false; if (!d.dirty()) { S[d.key] = null; return false; } confirmDlg('تغييرات غير محفوظة', 'عدّلت ولم تحفظ. إن خرجت ضاع ما عدّلته.', 'اخرج بلا حفظ', () => { S[d.key] = null; then(); }, 1); S.dlg.no = 'ابقَ'; return true; }
{ const prev = window.leaveGuard; window.leaveGuard = () => (prev && prev()) || draftGuard(() => back()); }
ACT.pkid = kid => { const sw = () => { S.ctlKid = kid; const t = S.stack[S.stack.length - 1]; t.a = [kid]; }; if (!draftGuard(sw)) sw(); };

/* حقول تُقرأ أثناء الكتابة بلا ضياع التركيز، وبحث يصفّي الصفوف في مكانها (تطبيع عربي — DS-RT-05) */
document.addEventListener('input', e => {
  const t = e.target; if (!t.closest || !t.closest('#phone')) return;
  if (t.dataset.filter) { const q = arNorm(t.value); let n = 0; document.querySelectorAll('#phone ' + t.dataset.filter).forEach(r => { const h = !!q && !arNorm(r.dataset.q).includes(q); r.hidden = h; if (!h) n++; }); document.querySelectorAll('#phone [data-grp]').forEach(g => { g.hidden = !g.querySelector('.row[data-q]:not([hidden])'); }); const z = document.querySelector('#phone [data-none]'); if (z) z.hidden = n > 0; return; }
  if (!t.dataset.ch) return;
  const [n, ...a] = t.dataset.ch.split(':'); if (!ACT[n]) return;
  let pos = null; try { pos = t.selectionStart; } catch (x) { }
  ACT[n](...a, t.value); render();
  const nx = document.querySelector(`#phone [data-ch="${t.dataset.ch}"]`); if (nx) { nx.focus(); try { if (pos != null) nx.setSelectionRange(pos, pos); } catch (x) { } }
});

/* ============ مدخل الحماية ============ */
const reviews = () => [...(S.rev13 >= 1 && !S.rvT ? [{ id: 'teen', k: 'teen', kid: 'layan', at: 'اليوم' }] : []), ...S.rv];
const tamOpen = kid => S.tam.filter(e => e.open && (!kid || e.kid === kid));
surface('protection', {
  t: 'الحماية ووقت الشاشة', sys: 'S1-10', p: 'adult', req: '10:1,2,6,10,18,24,25,27,28 09:8,9 01:19',
  note: 'مدخل واحد لكل ما يخص الحماية. تختار الطفل فترى ما يحكمه الآن ثم قواعده. ما يخص العائلة كلها في الأسفل. بطاقة «مراجعة القواعد» تظهر فقط حين يُقرن جهاز جديد أو يبلغ طفل 13.',
  r() { const id = S.ctlKid || 'layan', nr = nowRule(id), e = ENF[S.kid[id].enf], rv = reviews(), ap = S.apps[id];
    const R = (i, t, s, key, a, v, x) => row(i, t, s, { x3: x, a: can(key, id) ? a : 'denied:' + key, v: can(key, id) ? v : ic('lock') });
    return `${iosNote()}${rv.length ? `<button class="card fx" style="border-color:var(--info)" data-a="go:rules-review">${ic('rule')}<div class="grow"><b>${rv.length === 1 ? 'قواعد تحتاج مراجعتك' : rv.length + ' مراجعات للقواعد'}</b><div class="sm muted">${rv[0].k === 'teen' ? `بلغت ${kn(rv[0].kid)} 13 سنة` : `قُرن جهاز جديد لـ${kn(rv[0].kid)}`}</div></div>${ic('chevron_right')}</button>` : ''}
    ${kidTabs(id)}
    ${noDev(id) ? `<div class="card nodev">${ic('mobile_off')}<div class="grow"><b>لم يُقرن جهاز ${kn(id)} بعد</b><div class="sm muted">القواعد التي تضعها الآن تسري من لحظة الإقران.</div></div>${isOwner() ? btn('اقرن جهازه', 'go:pair-code:' + id, 'sm', 'devices') : ''}</div>` : ''}
    <button class="card fx" ${noDev(id) ? 'hidden' : ''} data-a="${can('protection.state.view', id) ? 'go:enf-state:' + id : 'denied:protection.state.view'}">${ic(nr[0])}<div class="grow"><b>الآن: ${nr[1]}</b><div class="sm muted">${nr[2]}</div><div class="sm muted">التالي: ${nextEdge(id)}</div></div>${chip(e[0], e[2], e[1])}</button>
    ${cfLine(id)}
    ${sec('قواعد ' + kn(id))}${list(
      R('apps', 'التطبيقات', `${ap.filter(a => a.act === 'LIMIT').length} بحدّ يومي · ${ap.filter(a => a.act === 'BLOCK').length} محظور · ${ap.filter(a => !a.act).length} بلا قاعدة`, 'protection.rule.view', `go:apps:${id}`),
      R('hourglass_top', 'الحصة اليومية', 'مجموع وقت الشاشة في اليوم', 'protection.rule.view', `go:quota:${id}`, S.kid[id].quota + ' د', 1),
      R('calendar_month', 'الجدول الأسبوعي', schedSum(id), 'protection.rule.view', `go:schedule:${id}`),
      R('travel_explore', 'تصفية الويب', `${wfCount(id)} فئات محظورة`, 'protection.filter.view', `go:webfilter:${id}`),
      R('gpp_maybe', 'تنبيهات العبث', tamOpen(id).length ? 'محاولة تعطيل تنتظر مراجعتك' : 'لا محاولات تعطيل', 'protection.tamper.view', `go:tamper:${id}`, tamOpen(id).length ? chip(String(tamOpen(id).length), 'wa') : ''))}
    ${sec('للعائلة كلها')}${list(
      row('bolt', 'الأوضاع', `دراسة · نوم · حر${S.modes.length ? ' · ' + S.modes.map(m => m.n).join(' · ') : ''}`, { a: 'go:presets:study' }),
      row('verified_user', 'حالة الحماية لكل الأطفال', 'كل جهاز في سطر: حالته وما يحكمه الآن', { x3: 1, a: can('protection.state.view') ? 'go:enf-all' : 'denied:protection.state.view', v: can('protection.state.view') ? '' : ic('lock') }),
      row('swap_vert', 'ترتيب أنواع القواعد', rankOf(id).map(k => RANK[k][0]).join(' ← '), { a: can('protection.priority.edit') ? 'go:priority' : 'denied:protection.priority.edit', v: can('protection.priority.edit') ? '' : ic('lock') }),
      row('receipt_long', 'سجل تغييرات الحماية', 'من غيّر، وماذا، ومتى', { x3: 1, a: can('protection.audit.view') ? 'go:prot-audit' : 'denied:protection.audit.view', v: can('protection.audit.view') ? '' : ic('lock') }))}`; },
});

/* ============ S10-01 قواعد التطبيقات ============ */
const ACTN = { ALLOW: ['مسموح دائماً', 'ok', 'check'], BLOCK: ['محظور', 'da', 'block'], LIMIT: ['حدّ يومي', 'in', 'timer'] };
surface('apps', {
  t: id => 'تطبيقات ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:1,2,3,5,7,12,25,27',
  note: 'S10-01. قاعدة واحدة لكل تطبيق: مسموح دائماً، أو حدّ يومي، أو محظور. التطبيق بلا قاعدة مسموح ويتبع الحصة اليومية. المتبقي اليوم ظاهر لكل تطبيق محدود. القواعد تتبع الطفل لا الجهاز.',
  r(id) { const A = S.apps[id], ruled = A.filter(a => a.act), nr = A.filter(a => !a.act), ed = can('protection.rule.edit', id), cr = can('protection.rule.create', id);
    const R = a => { const out = a.act === 'LIMIT' && limLeft(a) === 0; return `<button class="row" data-q="${a.n}" data-a="${a.act ? (ed || can('protection.rule.view', id) ? `go:app-rule:${id}:${a.id}` : 'denied:protection.rule.view') : cr ? `go:app-rule:${id}:${a.id}` : 'denied:protection.rule.create'}"><span class="lead">${ic(a.i)}</span><span class="tx"><b>${a.n}${a.study ? ' ' + chip('دراسة', 'in', 'school') : ''}${cfTag(id, 'app.' + a.id)}</b><span>${a.act === 'LIMIT' ? (out ? `نفد وقته اليوم · استُخدم ${a.used} من ${a.lim} د` : `بقي ${limLeft(a)} د اليوم · استُخدم ${a.used} من ${a.lim}`) : a.act === 'BLOCK' ? 'لا يُفتح' : a.act === 'ALLOW' ? `يُفتح دائماً · ${a.used} د اليوم` : `${a.used} د اليوم · يتبع الحصة اليومية`}</span></span>${a.act ? chip(ACTN[a.act][0], out ? 'ac' : ACTN[a.act][1], ACTN[a.act][2]) : chip('بلا قاعدة · مسموح', 'ol')}<span class="chev">${ic('chevron_right')}</span></button>`; };
    return `${iosNote()}${offline() ? callout('غير متصل: هذه آخر قواعد محفوظة على هاتفك. ' + age(S.kid[id].ago), 'nt', 'cloud_off') : ''}${kidTabs(id)}${searchBox('ابحث عن تطبيق', '.list .row[data-q]')}
    ${ruled.length ? sec('لها قاعدة') + `<div class="list">${ruled.map(R).join('')}</div>` : empty('apps', 'لم تضع قواعد بعد', 'كل التطبيقات مسموحة، ويحكمها مجموع الحصة اليومية.', '')}
    ${nr.length ? sec('بلا قاعدة') + `<div class="list">${nr.map(R).join('')}</div><p class="sm muted" style="margin:8px 4px 0">التطبيق بلا قاعدة مسموح. اضغطه لتضيف له قاعدة.</p>` : ''}
    <div data-none hidden>${empty('search_off', 'لا تطبيق بهذا الاسم', 'جرّب اسماً آخر.')}</div>
    ${sec('يخص ' + kn(id) + ' أيضاً')}${list(row('hourglass_top', 'الحصة اليومية', `بقي ${left(id)} د اليوم`, { a: `go:quota:${id}`, v: S.kid[id].quota + ' د' }), row('calendar_month', 'الجدول الأسبوعي', schedSum(id), { a: `go:schedule:${id}` }), row('swap_vert', 'ترتيب أنواع القواعد', 'أيها يحسم عند التعارض', { a: can('protection.priority.edit') ? 'go:priority:' + id : 'denied:protection.priority.edit' }), row('verified_user', 'حالة الحماية على الجهاز', ENF[S.kid[id].enf][0], { a: `go:enf-state:${id}` }), row('receipt_long', 'سجل التغييرات', '', { a: can('protection.audit.view') ? 'go:prot-audit:' + id : 'denied:protection.audit.view' }))}
    ${callout('القواعد تتبع ' + kn(id) + ' إلى أي جهاز يقترن به.', 'nt', 'devices')}`; },
});

/* ============ S10-02 تحرير قاعدة تطبيق ============ */
const adOf = (kid, id) => { const a = appOf(kid, id); return { kid, id, act: a.act || '', lim: a.act === 'LIMIT' ? a.lim : null, per: a.limD ? 1 : 0, limD: a.limD ? a.limD.slice() : null, study: a.study ? 1 : 0 }; };
const adValid = d => d.act === 'ALLOW' || d.act === 'BLOCK' || (d.act === 'LIMIT' && (d.per ? d.limD.every(v => v != null) : d.lim != null));
surface('app-rule', {
  t: (kid, id) => 'قاعدة ' + appOf(kid, id).n, sys: 'S1-10', p: 'adult', a: ['layan', 'ytk'], req: '10:1,4,9,17,26',
  note: 'S10-02. ثلاثة خيارات بوصف كل منها. «حدّ يومي» يطلب الدقائق ولا يقترح رقماً: واحد لكل الأيام أو مختلف لكل يوم (0–1440). حفظ صريح مع تراجع 10 ثوانٍ، وتحذير عند الخروج بلا حفظ. الحذف بتأكيد يشرح الأثر وبالرقم السري. دون اتصال: الحفظ معطّل بشرح. وإن كان جهاز الطفل منقطعاً انتظر التغيير حتى يتصل.',
  r(kid, id) { const a = appOf(kid, id); if (!S.ad || S.ad.kid !== kid || S.ad.id !== id) S.ad = adOf(kid, id); const d = S.ad, isNew = !a.act, ok = isNew ? can('protection.rule.create', kid) : can('protection.rule.edit', kid), dirty = DRAFT['app-rule'].dirty();
    const R0 = rankOf(kid), shut = ['sleep', 'school'].filter(ty => S.sched[kid].some(w => w.type === ty) && R0.indexOf(ty) < R0.indexOf('app') && !(ty === 'school' && d.study)).map(ty => 'وقت ' + WTN[ty]);   /* Q-419: الوصف يقول ما يحدث فعلاً عند هذا الطفل */
    const O = [['ALLOW', 'check', 'مسموح دائماً', shut.length ? `يُفتح متى شاء عدا ${shut.join(' و')}، ولا تحدّه الحصة اليومية.` : 'يُفتح متى شاء، ولا تحدّه الحصة اليومية.'], ['LIMIT', 'timer', 'حدّ يومي بالدقائق', 'يُفتح حتى تنتهي دقائقه اليوم ثم يُغلق.'], ['BLOCK', 'block', 'محظور', 'لا يُفتح أبداً.']];
    return `<div class="fx" style="margin-bottom:12px"><span class="av" style="--c:var(--primary)">${ic(a.i)}</span><div class="grow"><b>${a.n}</b><div class="sm muted">${isNew ? `لا قاعدة له عند ${kn(kid)} · مسموح الآن` : `قاعدة ${kn(kid)} لهذا التطبيق`}</div></div>${dirty ? chip('غير محفوظ', 'wa') : ''}</div>
    ${dirty ? '' : cfHere(kid, 'app.' + id)}${ok ? '' : callout('ترى القاعدة ولا تعدّلها. ' + why('nd:' + (isNew ? 'protection.rule.create' : 'protection.rule.edit')), 'nt', 'lock')}${offNote()}
    ${O.map(([v, i, t, s]) => `<button class="opt" aria-pressed="${d.act === v}" data-a="${ok ? 'adAct:' + v : 'noop'}">${ic(d.act === v ? 'radio_button_checked' : 'radio_button_unchecked')}<span class="grow"><b>${t}</b><span>${s}</span></span>${ic(i)}</button>`).join('')}
    ${d.act === 'BLOCK' && S.modes.some(m => m.open === 'list' && m.apps.includes(id)) ? callout(`${a.n} ضمن ${S.modes.filter(m => m.open === 'list' && m.apps.includes(id)).map(m => modeQ(m.id)).join(' و')}. المحظور يبقى مغلقاً عند ${kn(kid)} في كل وضع عدا الوضع الحر.`, 'nt', 'bolt') : ''}
    ${d.act === 'LIMIT' ? `${sec('كم دقيقة في اليوم؟')}${d.per ? `<div class="list">${DAYN.map((_, i) => dayRow(i, d.limD[i], 'adDay', 5)).join('')}</div>` : `<div class="card">${numStep(d.lim, 'adLim', 'دقيقة في اليوم')}<div class="chs" style="margin-top:12px;justify-content:center">${[15, 30, 45, 60, 90, 120].map(v => `<button aria-pressed="${d.lim === v}" data-a="adLim:=:${v}">${v}</button>`).join('')}</div></div>`}
    ${list(row('calendar_month', 'حدّ مختلف لكل يوم', 'مثلاً أطول في الجمعة والسبت', { tg: !!d.per, ta: ok ? 'adPer' : 'noop' }))}
    <p class="sm muted" style="margin:8px 4px 0">${adValid(d) ? `ينبَّه ${kn(kid)} قبل انتهاء الوقت بخمس دقائق. صفر يعني لا يُفتح في ذلك اليوم.` : 'اختر عدد الدقائق لتحفظ. لا نقترح رقماً: القرار لك.'}</p>` : ''}
    ${d.act && d.act !== 'BLOCK' ? sec('وقت المدرسة') + list(row('school', 'تطبيق دراسة', 'يبقى مفتوحاً في نافذة المدرسة', { tg: !!d.study, ta: ok ? 'adStudy' : 'noop' })) : ''}
    ${callout(devOn(kid) ? `بعد الحفظ يسري على جهاز ${kn(kid)} خلال ثوانٍ.` : `جهاز ${kn(kid)} غير متصل الآن: يُحفظ التغيير ويسري عند أول اتصال.`, devOn(kid) ? 'nt' : 'wa', devOn(kid) ? 'sync' : 'cloud_off')}
    ${ok ? saveBar(isNew ? 'أضف القاعدة' : 'احفظ', 'adSave', dirty && adValid(d)) : ''}
    ${!isNew && can('protection.rule.delete', kid) ? `<div class="c" style="margin-top:12px">${btn('احذف القاعدة', offline() ? 'noop' : 'adDel', 'txt" style="color:var(--danger)' + (offline() ? '" disabled="' : ''), 'delete')}</div>` : ''}`; },
});
Object.assign(ACT, {
  adAct(v) { const d = S.ad; d.act = v; if (v !== 'LIMIT') { d.lim = null; d.per = 0; d.limD = null; } if (v === 'BLOCK') d.study = 0; },
  adLim(op, val) { S.ad.lim = stepV(S.ad.lim, op, val); },
  adDay(i, op) { S.ad.limD[+i] = stepV(S.ad.limD[+i], op); },
  adPer() { const d = S.ad; d.per = d.per ? 0 : 1; if (d.per) { d.limD = Array(7).fill(d.lim); } else { d.lim = d.limD[NOW.d]; d.limD = null; } },
  adStudy() { S.ad.study = S.ad.study ? 0 : 1; },
  adSave() { const d = S.ad; if (!adValid(d) || offline()) return; const a = appOf(d.kid, d.id), was = { act: a.act, lim: a.lim, limD: a.limD, study: a.study }, isNew = !a.act;
    a.act = d.act; a.study = d.study; if (d.act === 'LIMIT') { a.limD = d.per ? d.limD.slice() : undefined; a.lim = d.per ? d.limD[NOW.d] : d.lim; } else { delete a.lim; delete a.limD; }
    const un = () => { Object.assign(a, was); if (was.act === undefined) delete a.act; render(); };
    xaud(`${isNew ? 'أُضيفت قاعدة' : 'عُدّلت قاعدة'} ${a.n} لـ${M[d.kid].n}: ${ACTN[d.act][0]}${d.act === 'LIMIT' ? ` ${a.lim} د${d.per ? ' (يختلف بالأيام)' : ''}` : ''}${d.study ? ' · تطبيق دراسة' : ''}`, isNew ? 'protection.rule.create' : 'protection.rule.edit', d.kid, 'rule', un);
    S.ad = null; S.stack.pop(); anim = 'inb'; pushed(d.kid, `حُفظت القاعدة وسارية على جهاز ${kn(d.kid)}`, un); },
  adDel() { const d = S.ad, a = appOf(d.kid, d.id); gate('حذف قاعدة يغيّر ما يُفتح على جهاز الطفل', () => confirmDlg(`حذف قاعدة ${a.n}؟`, `سيُحذف ${a.act === 'LIMIT' ? 'حدّ' : 'قيد'} هذا التطبيق ويعود مسموحاً، ويحكمه مجموع الحصة اليومية.`, 'احذف القاعدة', () => { const was = { act: a.act, lim: a.lim, limD: a.limD, study: a.study }, un = () => { Object.assign(a, was); render(); }; delete a.act; delete a.lim; delete a.limD; a.study = 0; xaud(`حُذفت قاعدة ${a.n} لـ${M[d.kid].n}`, 'protection.rule.delete', d.kid, 'rule', un); S.ad = null; S.stack.pop(); pushed(d.kid, 'حُذفت القاعدة · عاد التطبيق مسموحاً', un); }, true), 'stepup'); },
});

/* ============ S10-03 الحصة اليومية الإجمالية ============ */
const qOf = kid => (S.kid[kid].qD ? S.kid[kid].qD.slice() : Array(7).fill(S.kid[kid].quota));
surface('quota', {
  t: id => 'حصة ' + M[id].n + ' اليومية', sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:2,10,26 03:20',
  note: 'S10-03. الحصة لكل يوم من أيام الأسبوع (0–1440)، والبداية 60 دقيقة لكل يوم (Q-223). الحساب ظاهر بأرقامه: المتبقي = الحصة + الإضافي − المستهلك. التعديل للأب وحده: جرّب بشخصية سارة لترى القفل. حفظ صريح.',
  r(id) { if (!S.qd || S.qd.kid !== id) S.qd = { kid: id, v: qOf(id) }; const k = S.kid[id], d = S.qd, own = can('protection.quota.edit', id), dirty = DRAFT.quota.dirty(), dflt = d.v.every(v => v === 60);
    return `${kidTabs(id)}${own ? '' : callout('الحصة يغيّرها الأب وحده. ترى القيم هنا. ' + why('nd:protection.quota.edit'), 'nt', 'lock')}${offNote()}${dirty ? '' : cfHere(id, 'quota')}
    <div class="card"><div class="sm muted">اليوم · ${DAYN[NOW.d]}</div><div class="fx sb" style="margin:8px 0"><b style="font-size:calc(24px*var(--ts))">بقي ${left(id)} دقيقة</b>${can('rewards.grant.create', id) ? btn('منح وقت', `go:grant-time:${id}`, 'sm ton') : ''}</div><div class="eq"><span><b>${k.quota}</b>الحصة</span><i>+</i><span><b>${k.extra}</b>الإضافي</span><i>−</i><span><b>${k.used}</b>المستهلك</span><i>=</i><span><b>${left(id)}</b>المتبقي</span></div><div class="xs muted" style="margin-top:8px">الإضافي: وقت منحتَه أو اشتراه بنقاطه. تُصفَّر الحصة عند منتصف الليل بتوقيت العائلة.</div></div>
    ${sec('الحصة لكل يوم', own && !dflt ? 'أعد الكل إلى 60' : '', 'qdReset')}<div class="list">${DAYN.map((_, i) => (own ? dayRow(i, d.v[i], 'qdDay', 15) : `<div class="dq"><b>${DAYN[i]}${i === NOW.d ? ' ' + chip('اليوم', 'in') : ''}</b><span class="n">${d.v[i]}<small>دقيقة</small></span>${ic('lock')}</div>`)).join('')}</div>
    <p class="sm muted" style="margin:8px 4px 0">${dflt ? 'هذه القيمة التي يبدأ بها كل طفل: 60 دقيقة لكل يوم.' : 'صفر يعني لا وقت شاشة في ذلك اليوم.'}</p>
    ${callout('الحصة تحكم التطبيقات التي ليس لها قاعدة خاصة. والتطبيق الذي له حدّ يتبع حدّه. ' + why('rank'), '', 'info')}
    ${own ? saveBar('احفظ الحصة', 'qdSave', dirty) : ''}`; },
});
Object.assign(ACT, {
  qdDay(i, op) { S.qd.v[+i] = stepV(S.qd.v[+i], op); },
  qdReset() { S.qd.v = Array(7).fill(60); },
  qdSave() { const d = S.qd, k = S.kid[d.kid], was = { quota: k.quota, qD: k.qD }, un = () => { k.quota = was.quota; k.qD = was.qD; render(); }; if (offline()) return; k.qD = d.v.slice(); k.quota = d.v[NOW.d]; xaud(`عُدّلت حصة ${M[d.kid].n} اليومية: اليوم ${was.quota} ← ${k.quota} د`, 'protection.quota.edit', d.kid, 'rule', un); S.qd = null; pushed(d.kid, `حُفظت الحصة وسارية على جهاز ${kn(d.kid)}`, un); },
});

/* ============ S10-04 الجدول الأسبوعي ============ */
function dayBar(kid, D) { const lo = D * 1440, segs = []; S.sched[kid].forEach(w => spans(w).forEach(([a, b]) => [0, -WK, WK].forEach(k => { const s = Math.max(a + k, lo), e = Math.min(b + k, lo + 1440); if (s < e) segs.push([s - lo, e - lo, w.type]); }))); return `<div class="sched">${segs.map(([s, e, t]) => `<i class="${WT[t][2]}" style="left:${s / 14.4}%;width:${(e - s) / 14.4}%"></i>`).join('')}${D === NOW.d ? `<u style="left:${NOW.m / 14.4}%"></u>` : ''}</div>`; }
surface('schedule', {
  t: id => 'جدول ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:6,7,8,9,14',
  note: 'S10-04. سبعة أيام تبدأ بالأحد، ومحور الوقت من اليسار إلى اليمين (Q-386). كل نافذة نوم أو مدرسة، بأيامها ووقتيها. النافذة التي تنتهي قبل أن تبدأ تمتد إلى اليوم التالي. طفل جديد يبدأ بلا نوافذ (Q-222). النافذتان المتداخلتان تُرفضان بذكر موضع التداخل.',
  r(id) { const W = S.sched[id], ed = can('protection.schedule.edit', id), st = S.apps[id].filter(a => a.study);
    return `${iosNote()}${kidTabs(id)}${offNote()}
    ${W.length ? `<div class="card"><div class="chips" style="margin-bottom:12px">${chip('نوم', '', 'bedtime')}${chip('مدرسة', 'in', 'school')}<span class="xs muted" style="align-self:center">الباقي وقت متاح</span></div><div class="wk">${DAYN.map((n, i) => `<b class="${i === NOW.d ? 'td' : ''}">${n}</b>${dayBar(id, i)}`).join('')}<span></span><div class="axis"><span>12 ص</span><span>6 ص</span><span>12 م</span><span>6 م</span><span>12 ص</span></div></div></div>
    ${sec('النوافذ')}${list(W.map(w => row(WT[w.type][1], `${w.type === 'sleep' ? 'نافذة نوم' : 'نافذة مدرسة'} · ${daysTxt(w.days)}${cfTag(id, 'win.' + w.id)}`, `${winRange(w)} · ${WT[w.type][3]}`, { a: ed ? `winOpen:${id}:${w.id}` : 'denied:protection.schedule.edit', v: ed ? '' : ic('lock') })))}` : empty('calendar_month', 'بلا نوافذ بعد', `أضف نافذة نوم أو مدرسة. إلى أن تضيف، تحكم ${kn(id)} حصته اليومية وقواعد تطبيقاته فقط.`)}
    ${ed ? `<div class="btns" style="margin-top:12px">${btn('نافذة نوم', `winOpen:${id}:new:sleep`, 'ton', 'add')}${btn('نافذة مدرسة', `winOpen:${id}:new:school`, 'ton', 'add')}</div>` : callout('تعديل الجدول ليس من صلاحياتك. ' + why('nd:protection.schedule.edit'), 'nt', 'lock')}
    ${sec('وقت المدرسة')}${list(row('school', 'تطبيقات الدراسة', st.length ? st.map(a => a.n).join('، ') : 'لم تُختر بعد: يُغلق كل شيء في وقت المدرسة', { a: `go:study-apps:${id}`, v: st.length ? String(st.length) : chip('لا شيء', 'wa') }))}
    ${callout('تغيير الجدول يسري فور وصوله إلى جهاز الطفل، ويعمل حتى دون إنترنت.', 'nt', 'sync')}`; },
});
surface('win-edit', {
  kind: 'sheet', t: 'نافذة في الجدول', sys: 'S1-10', p: 'adult', a: ['layan', 'w1'], req: '10:6,7,9',
  note: 'نوع النافذة، أيامها، ومن متى إلى متى. إن انتهت قبل أن تبدأ قلنا صراحة إنها تمتد إلى اليوم التالي. التداخل يُكشف أثناء التحرير ويُسمّى موضعه، والحفظ يُرفض حتى يُصحَّح. وإن كانت النافذة تشمل هذه اللحظة قلنا إن التطبيقات ستُغلق الآن.',
  r(kid, wid) { if (!S.wd || S.wd.kid !== kid || (wid !== 'new' && S.wd.id !== wid)) { const w = S.sched[kid].find(x => x.id === wid) || S.sched[kid][0]; if (!w) return ''; S.wd = { kid, id: w.id, type: w.type, days: w.days.slice(), s: w.s, e: w.e }; }
    const d = S.wd, isNew = !S.sched[kid].some(x => x.id === d.id), over = t2m(d.e) <= t2m(d.s), clash = d.days.length ? winClash(kid, d) : '', t = NOW.d * 1440 + NOW.m, nowIn = d.days.length && spans(d).some(([a, b]) => hitWk(a, b, t, t + 1)), ok = d.days.length && !clash && !offline();
    return `<h4>${isNew ? 'نافذة جديدة' : 'تعديل نافذة'} · ${kn(kid)}</h4>${seg([['sleep', 'نوم'], ['school', 'مدرسة']], d.type, 'wdType')}<p class="d">${d.type === 'sleep' ? 'في نافذة النوم لا يُفتح أي تطبيق. زر الاستغاثة يعمل دائماً.' : 'في نافذة المدرسة تُفتح تطبيقات الدراسة فقط.'}</p>
    <div class="fx sb" style="margin-bottom:8px"><b class="sm">الأيام</b><span>${btn('كل يوم', 'wdDays:0123456', 'sm txt" aria-pressed="' + (d.days.slice().sort().join('') === '0123456'))}${btn('الأحد–الخميس', 'wdDays:01234', 'sm txt" aria-pressed="' + (d.days.slice().sort().join('') === '01234'))}</span></div><div class="days">${DAYN.map((n, i) => `<button aria-pressed="${d.days.includes(i)}" data-a="wdDay:${i}" aria-label="${n}">${n.replace(/^ال/, '').slice(0, 3)}</button>`).join('')}</div>
    <div class="fx" style="gap:10px"><label class="fld grow"><span>من</span><input type="time" dir="ltr" data-ch="wdT:s" value="${d.s}"></label><label class="fld grow"><span>إلى</span><input type="time" dir="ltr" data-ch="wdT:e" value="${d.e}"></label></div>
    <p class="sm muted" style="margin:-4px 0 12px">${hm(t2m(d.s))} – ${hm(t2m(d.e))}${over ? ' · تمتد إلى اليوم التالي' : ''}</p>
    ${!d.days.length ? callout('اختر يوماً واحداً على الأقل.', 'wa', 'event_busy') : clash ? cfCard(cfClash(kid, d), { mode: 'inline' }) : nowIn ? callout(`هذه النافذة تشمل هذه اللحظة: عند الحفظ ${d.type === 'sleep' ? 'تُغلق التطبيقات' : 'تُغلق غير تطبيقات الدراسة'} على جهاز ${kn(kid)} فوراً.`, 'wa', 'bolt') : ''}
    ${offline() ? callout('الحفظ يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}
    ${btn(isNew ? 'أضف النافذة' : 'احفظ النافذة', ok ? 'wdSave' : 'noop', ok ? '' : '" disabled="')}${isNew ? '' : `<div class="c" style="margin-top:8px">${btn('احذف النافذة', offline() ? 'noop' : 'wdDel', 'txt" style="color:var(--danger)', 'delete')}</div>`}`; },
});
Object.assign(ACT, {
  winOpen(kid, wid, type) { S.wd = wid === 'new' ? { kid, id: 'w' + Date.now(), type, days: [], s: type === 'sleep' ? '21:00' : '07:30', e: type === 'sleep' ? '06:00' : '13:00' } : null; S.sheet = { id: 'win-edit', a: [kid, wid] }; },
  wdType(v) { S.wd.type = v; },
  wdDay(i) { i = +i; const d = S.wd.days; d.includes(i) ? d.splice(d.indexOf(i), 1) : d.push(i); },
  wdDays(s) { S.wd.days = s.split('').map(Number); },
  wdT(f, v) { if (/^\d\d:\d\d$/.test(v)) S.wd[f] = v; },
  wdSave() { const d = S.wd, L2 = S.sched[d.kid]; if (!d.days.length || winClash(d.kid, d) || offline()) return; const was = L2.map(w => ({ ...w, days: w.days.slice() })), i = L2.findIndex(w => w.id === d.id), nw = { id: d.id, type: d.type, days: d.days.slice().sort(), s: d.s, e: d.e }, un = () => { S.sched[d.kid] = was; render(); };
    if (i < 0) L2.push(nw); else L2[i] = nw; xaud(`${i < 0 ? 'أُضيفت' : 'عُدّلت'} نافذة ${d.type === 'sleep' ? 'نوم' : 'مدرسة'} لـ${M[d.kid].n}: ${daysTxt(nw.days)} ${winRange(nw)}`, 'protection.schedule.edit', d.kid, 'sched', un); S.sheet = null; S.wd = null; pushed(d.kid, `حُفظ الجدول وطُبّق على جهاز ${kn(d.kid)}`, un); },
  wdDel() { const d = S.wd; confirmDlg('حذف هذه النافذة؟', `لن يبقى ${d.type === 'sleep' ? 'وقت نوم' : 'وقت مدرسة'} في هذه الأيام على جهاز ${kn(d.kid)}.`, 'احذف النافذة', () => { const was = S.sched[d.kid].slice(), un = () => { S.sched[d.kid] = was; render(); }; S.sched[d.kid] = was.filter(w => w.id !== d.id); xaud(`حُذفت نافذة ${d.type === 'sleep' ? 'نوم' : 'مدرسة'} لـ${M[d.kid].n}`, 'protection.schedule.edit', d.kid, 'sched', un); S.sheet = null; S.wd = null; pushed(d.kid, 'حُذفت النافذة', un); }, true); },
});

/* ============ S10-05 تطبيقات الدراسة ============ */
const sdOf = kid => S.apps[kid].filter(a => a.study).map(a => a.id).sort();
surface('study-apps', {
  t: id => 'تطبيقات الدراسة — ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:7,26',
  note: 'S10-05. تختار من تطبيقات جهاز الطفل ما يبقى مفتوحاً في وقت المدرسة. المحظور لا يُختار. العلامة لا تغيّر قاعدة التطبيق ولا حصته خارج وقت المدرسة. بحث بتطبيع عربي. حفظ صريح. إن لم تختر شيئاً قلنا الأثر صراحة: يُغلق كل شيء في وقت المدرسة.',
  r(id) { if (!S.sd || S.sd.kid !== id) S.sd = { kid: id, on: sdOf(id) }; const d = S.sd, ed = can('protection.rule.edit', id), dirty = DRAFT['study-apps'].dirty();
    return `${ed ? '' : callout('ترى القائمة ولا تعدّلها. ' + why('nd:protection.rule.edit'), 'nt', 'lock')}${offNote()}${searchBox('ابحث عن تطبيق', '.list .row[data-q]')}
    <div class="list">${S.apps[id].map(a => { const on = d.on.includes(a.id), bl = a.act === 'BLOCK'; return `<button class="row ${bl ? 'dis' : ''}" data-q="${a.n}" data-a="${bl ? 'sdWhy:' + a.id : !ed ? 'noop' : 'sdT:' + a.id}" role="checkbox" aria-checked="${on}"><span class="lead">${ic(a.i)}</span><span class="tx"><b>${a.n}</b><span>${bl ? 'محظور دائماً · لا يُفتح في أي وقت' : on ? 'يبقى مفتوحاً في وقت المدرسة' : 'يُغلق في وقت المدرسة'}</span></span>${ic(bl ? 'block' : on ? 'check_box' : 'check_box_outline_blank')}</button>`; }).join('')}</div>
    <div data-none hidden>${empty('search_off', 'لا تطبيق بهذا الاسم', 'جرّب اسماً آخر.')}</div>
    ${d.on.length ? '' : callout('لم تختر تطبيقات دراسة بعد: كل التطبيقات تُغلق في وقت المدرسة.', 'wa', 'school')}
    <p class="sm muted" style="margin:8px 4px 0">العلامة تفتح التطبيق في وقت المدرسة فقط. خارج وقت المدرسة يبقى على قاعدته وعلى الحصة اليومية كما كان.</p>
    ${ed ? saveBar('احفظ القائمة', 'sdSave', dirty) : ''}`; },
});
Object.assign(ACT, {
  sdT(aid) { const o = S.sd.on; o.includes(aid) ? o.splice(o.indexOf(aid), 1) : o.push(aid); o.sort(); },
  sdSave() { const d = S.sd, A = S.apps[d.kid], was = A.map(a => a.study), un = () => { A.forEach((a, i) => { a.study = was[i]; }); render(); }; if (offline()) return;
    A.forEach(a => { a.study = d.on.includes(a.id) ? 1 : 0; });   /* العلامة تعني شيئاً واحداً: يُفتح في وقت المدرسة. لا تنشئ قاعدة ولا تغيّر الحصة (Q-405) */
    xaud(`تطبيقات دراسة ${M[d.kid].n}: ${d.on.length ? A.filter(a => a.study).map(a => a.n).join('، ') : 'لا شيء'}`, 'protection.rule.edit', d.kid, 'rule', un); S.sd = null; pushed(d.kid, 'حُفظت قائمة تطبيقات الدراسة', un); },
});

/* ============ S10-06 ترتيب أنواع القواعد مع المعاينة ============ */
const pdSaved = sc => (sc === 'fam' ? S.rank : S.rankKid[sc] || S.rank).slice();
/* المعاينة بلغة صريحة (REQ-013): ماذا يحدث في كل وقت بهذا الترتيب. ترجع [نص، تحذير؟] لكل لحظة. */
function rankSay(r) {
  const walk = win => { let app = false; for (const t of r) { if (t === 'app') { app = true; continue; } if (t === 'quota') return [app, 'quota']; if (t === win) return [app, win]; } return [app, '']; };
  const end = { sleep: 'لا يُفتح أي تطبيق', school: 'تُفتح تطبيقات الدراسة فقط', quota: 'يُفتح ما دام في الحصة اليومية وقت', '': 'يُفتح' };
  const say = ([app, e]) => (app ? `التطبيق الذي له قاعدة يتبع قاعدته، وغيره ${end[e]}` : end[e]);
  const sl = walk('sleep'), sc = walk('school'), dy = walk('none'), appDead = r.indexOf('quota') < r.indexOf('app');
  const W = [];
  if (sl[1] !== 'sleep') W.push('ما دام في حصته اليومية وقت، تُفتح التطبيقات في وقت النوم.'); else if (sl[0]) W.push('بهذا الترتيب يستطيع طفلك استخدام رصيد تطبيقاته حتى بعد وقت النوم.');
  if (sc[1] !== 'school') W.push('ما دام في حصته اليومية وقت، تُفتح كل التطبيقات في وقت المدرسة.'); else if (sc[0]) W.push('التطبيق المسموح أو الذي له رصيد يُفتح في وقت المدرسة ولو لم يكن تطبيق دراسة.');
  if (appDead) W.push('قواعد التطبيقات تحت الحصة اليومية: الحظر والحدود لن يُنظر إليها ما دام في الحصة وقت، ولا بعد نفادها.');
  return { rows: [['bedtime', 'في وقت النوم', say(sl)], ['school', 'في وقت المدرسة', say(sc)], ['wb_sunny', 'في باقي اليوم', say(dy)]], warn: W };
}
surface('priority', {
  t: 'ترتيب أنواع القواعد', sys: 'S1-10', p: 'adult', a: ['fam'], req: '10:10,11,12,13,26',
  note: 'S10-06. الترتيب الجاهز يعمل بلا إعداد: النوم ثم المدرسة ثم قواعد التطبيقات ثم الحصة. نمرّ من الأعلى وأول نوع ينطبق على اللحظة يحسم. المعاينة تقول ما يحدث في وقت النوم ووقت المدرسة وباقي اليوم قبل الحفظ، وتحذّر بالأحمر إن فتح الترتيب تطبيقات في وقت النوم. للعائلة ترتيب، ولكل طفل ترتيب خاص إن أردت.',
  r(sc0) { const sc = M[sc0] ? sc0 : 'fam'; if (!S.pd || S.pd.sc !== sc) S.pd = { sc, r: pdSaved(sc) }; const d = S.pd, r = d.r, ed = can('protection.priority.edit'), own = sc !== 'fam' && !!S.rankKid[sc], follow = sc !== 'fam' && !own && same(r, S.rank), dirty = DRAFT.priority.dirty(), P = rankSay(r), dflt = same(r, RANK0);
    return `<div class="fch w"><button aria-pressed="${sc === 'fam'}" data-a="pdSc:fam">${ic('groups')}ترتيب العائلة</button>${KIDS.map(id => `<button aria-pressed="${sc === id}" data-a="pdSc:${id}">${av(M[id], 'sm')}${kn(id)}${S.rankKid[id] ? ' ·خاص' : ''}</button>`).join('')}</div>
    ${ed ? '' : callout('ترى الترتيب ولا تغيّره. ' + why('nd:protection.priority.edit'), 'nt', 'lock')}${offNote()}
    <p class="sm muted" style="margin:0 4px 12px">${sc === 'fam' ? 'يسري على كل طفل ليس له ترتيب خاص.' : own ? `ل${kn(sc)} ترتيب خاص يختلف عن العائلة.` : follow ? `${kn(sc)} يتبع ترتيب العائلة. غيّر الترتيب هنا ليصير له ترتيب خاص.` : `ترتيب خاص ب${kn(sc)} لم يُحفظ بعد.`} نمرّ من الأعلى، وأول نوع ينطبق على اللحظة يحسم.</p>
    <div class="list">${r.map((k, i) => `<div class="row"><span class="lead">${ic(RANK[k][1])}</span><span class="tx"><b>${i + 1}. ${RANK[k][0]}</b></span><button class="ib" data-a="${ed ? `pdMv:${i}:-1` : 'noop'}" aria-label="ارفع ${RANK[k][0]}" ${i && ed ? '' : 'disabled style="opacity:.3"'}>${ic('arrow_upward')}</button><button class="ib" data-a="${ed ? `pdMv:${i}:1` : 'noop'}" aria-label="أنزل ${RANK[k][0]}" ${i < 3 && ed ? '' : 'disabled style="opacity:.3"'}>${ic('arrow_downward')}</button></div>`).join('')}</div>
    ${sec('ماذا يحدث بهذا الترتيب')}<div class="list">${P.rows.map(([i, t, s]) => row(i, t, s + '.')).join('')}</div>
    ${P.warn.map(w => callout(w, 'da', 'warning')).join('')}
    <p class="sm muted" style="margin:8px 4px 0">الوقت الذي تمنحه أو يكسبه بنقاطه يزيد دقائق التطبيق فقط. لا يفتح شيئاً في وقت النوم أو المدرسة، ولا يغيّر هذا الترتيب.</p>
    ${ed ? `<div class="btns" style="margin-top:16px">${btn(sc !== 'fam' && own ? 'أعده إلى ترتيب العائلة' : 'الترتيب الجاهز', sc !== 'fam' && own ? 'pdDrop' : 'pdReset', 'sec' + ((sc !== 'fam' && own) || !dflt ? '' : '" disabled="'))}${btn('احفظ الترتيب', dirty && !offline() ? 'pdSave' : 'noop', dirty && !offline() ? '' : '" disabled="')}</div>` : ''}`; },
});
Object.assign(ACT, {
  pdSc(sc) { const sw = () => { S.stack[S.stack.length - 1].a = [sc]; S.pd = null; }; if (!draftGuard(sw)) sw(); },
  pdMv(i, d) { i = +i; const r = S.pd.r, j = i + +d; if (j < 0 || j > 3) return; [r[i], r[j]] = [r[j], r[i]]; },
  pdReset() { S.pd.r = RANK0.slice(); },
  pdDrop() { const sc = S.pd.sc, was = S.rankKid[sc], un = () => { S.rankKid[sc] = was; S.pd = null; render(); }; delete S.rankKid[sc]; S.pd = null; xaud(`أُعيد ${M[sc].n} إلى ترتيب العائلة`, 'protection.priority.edit', sc, 'rank', un); toast(`${kn(sc)} يتبع ترتيب العائلة الآن`, un); },
  pdSave() { const d = S.pd, P = rankSay(d.r); if (offline()) return; const go2 = () => { const fam = d.sc === 'fam', was = fam ? S.rank.slice() : S.rankKid[d.sc], un = () => { if (fam) S.rank = was; else if (was) S.rankKid[d.sc] = was; else delete S.rankKid[d.sc]; S.pd = null; render(); };
      if (fam) S.rank = d.r.slice(); else if (same(d.r, S.rank)) delete S.rankKid[d.sc]; else S.rankKid[d.sc] = d.r.slice();
      xaud(`${fam ? 'ترتيب العائلة' : 'ترتيب خاص ب' + M[d.sc].n}: ${d.r.map(k => RANK[k][0]).join(' ← ')}`, 'protection.priority.edit', fam ? null : d.sc, 'rank', un); S.pd = null; toast('حُفظ الترتيب ويُطبَّق فوراً عند التعارض', un); };
    if (P.warn.length && !S.cfSkip) { confirmDlg('احفظ هذا الترتيب؟', P.warn.join(' '), 'نعم، احفظ', go2, true); S.dlg.no = 'راجع الترتيب'; } else go2(); },
});

/* ============ S10-09 الوضع الحر + S10-10 الأوضاع الجاهزة ============ */
const PM = { study: ['وضع الدراسة', 'school', 'تطبيقات الدراسة فقط'], sleep: ['وضع النوم', 'bedtime', 'لا يُفتح أي تطبيق'], free: ['وضع حر', 'lock_open', 'تتوقف كل القواعد'] };
const MICON = ['star', 'route', 'mosque', 'menu_book', 'sports_esports', 'celebration', 'family_home', 'music_note'];
const anames = L => L.map(a => a.n).join('، ');
const allApps = () => { const o = {}; KIDS.forEach(k => S.apps[k].forEach(a => { const x = o[a.id] || (o[a.id] = { id: a.id, n: a.n, i: a.i, kids: [], bl: [] }); x.kids.push(k); if (a.act === 'BLOCK') x.bl.push(k); })); return Object.values(o); };
/* أثر وضع على طفل بعينه بلغة صريحة — يُعرض قبل الحفظ وقبل التطبيق (REQ-013 بالقياس) */
function modeLine(m, id) { const A = S.apps[id];
  if (m.open === 'none') return 'لا يُفتح أي تطبيق. زر الاستغاثة يعمل.';
  if (m.open === 'study') { const st = A.filter(a => a.study && a.act !== 'BLOCK'), o = A.length - st.length; return st.length ? `تُفتح تطبيقات الدراسة فقط: ${anames(st)}.${o ? ` ${o === 1 ? 'يُغلق التطبيق الآخر' : o === 2 ? 'يُغلق التطبيقان الآخران' : `تُغلق التطبيقات الأخرى (${o})`}.` : ''}` : `يُغلق كل شيء: لم تُختر تطبيقات دراسة ل${kn(id)}.`; }
  if (m.open === 'all') return 'تُفتح التطبيقات بحدودها وبالحصة كالعادة، ولا يغلقها وقت النوم أو المدرسة. المحظور يبقى مغلقاً.';
  const inM = A.filter(a => m.apps.includes(a.id)), bl = inM.filter(a => a.act === 'BLOCK'), op = inM.filter(a => a.act !== 'BLOCK'), out = m.lim ? op.filter(a => !limCheck(id, a).ok) : [], X = [];
  if (!inM.length) return `لا يُفتح شيء: لا تطبيق من هذا الوضع على جهاز ${kn(id)}.`;
  X.push(op.length ? `${op.length === 1 ? 'يُفتح' : 'تُفتح'} ${anames(op)} فقط، ${m.lim ? 'ما دام له وقت اليوم' : 'بلا حد ما دام الوضع سارياً'}.` : 'لا يُفتح شيء.');
  if (out.length) X.push(`${anames(out)}: نفد الوقت اليوم، فلن ${out.length === 1 ? 'يُفتح' : 'تُفتح'}.`);
  if (bl.length) X.push(`${anames(bl)} محظور عند ${kn(id)} ويبقى مغلقاً.`);
  return X.join(' '); }
const WTN = { sleep: 'النوم', school: 'المدرسة' };
function psLine(k, id, n) { const c = crossOf(id, n), ask = k !== 'free' && crossAsk(k, c), stop = ask && S.psX === 'stop', u = untilTxt(stop ? c[0] : n), wn = schedNow(id), cur = S.pm[id], X = [];
  X.push(k === 'free' ? `حتى ${u} تتوقف كل القواعد: الحدود والحظر والجدول. استخدامه يُحسب في التقارير ولا يُحدّ.` : `حتى ${u}: ${modeLine(modeOf(k), id)}`);
  if (k !== 'free' && fmOf(id)) X.push('ينتهي الوضع الحر الجاري.');
  if (cur && cur.k !== k) X.push(`ينتهي ${modeQ(cur.k)} الجاري: وضع واحد لكل طفل.`);
  if (cur && cur.k === k) X.push('سارٍ الآن: تبدأ مدته من جديد.');
  if (k !== 'free' && wn && crossAsk(k, [0, wn])) X.push(`الآن وقت ${WTN[wn]} في جدوله: الوضع يحلّ مكانه حتى ينتهي.`);
  if (ask) X.push(stop ? `يتوقف عند بدء وقت ${WTN[c[1]]} ${hm(NOW.m + c[0])}.` : S.psX === 'over' ? `<b>يستمر فوق وقت ${WTN[c[1]]} (${hm(NOW.m + c[0])}).</b>` : `<b>يبدأ وقت ${WTN[c[1]]} ${hm(NOW.m + c[0])} قبل انتهاء المدة.</b>`);
  if (k === 'free' && c) X.push(`يمتد فوق وقت ${WTN[c[1]]} (${hm(NOW.m + c[0])}).`);
  if (k === 'free' && tamOpen(id).length) X.push('تنبيه العبث المفتوح على جهازه يبقى.');
  return X.join(' '); }
surface('presets', {
  t: 'الأوضاع', sys: 'S1-10', p: 'adult', a: ['study'], req: '10:18,19,20,24,26,32,33 09:7 03:12',
  note: 'S10-09 + S10-10. وضعان جاهزان (دراسة، نوم) والوضع الحر، ثم أوضاع الأب الخاصة. تختار الطفل والمدة، ولا مدة جاهزة: بلا مدة لا يعمل الزر. قبل التطبيق ترى ما سيتغير لكل طفل باسمه ووقت الانتهاء. لكل طفل وضع واحد: تطبيق وضع ينهي السابق ويقال ذلك قبل التطبيق. وإن بدأ وقت النوم أو المدرسة قبل انتهاء المدة سُئل الأب: يتوقف الوضع عنده أم يستمر؟ الوضع لا يغيّر الجدول الأسبوعي، وينتهي وحده. الوضع الحر للأب وحده، لطفل واحد، وبالرقم السري. يحتاج اتصالاً.',
  r(k0) { const k = PM[k0] || modeOf(k0) ? k0 : 'study', cm = PM[k] ? null : modeOf(k), okM = k === 'free' ? isOwner() : can('protection.mode_preset.apply'), sel = (S.psK || []).filter(id => KIDS.includes(id)), n = S.psN || 0, act = KIDS.filter(id => fmOf(id) || S.pm[id]), busy = k === 'free' && sel.length === 1 && fmOf(sel[0]);
    const X = k !== 'free' && n ? sel.filter(id => crossAsk(k, crossOf(id, n))) : [], ready = okM && sel.length && n && !offline() && !busy && (!X.length || S.psX), mk = can('protection.rule.create');
    const tile = (m, t, i) => `<button aria-pressed="${k === m}" data-a="psM:${m}"><span class="qi">${ic(i)}</span>${t}</button>`;
    return `${act.length ? sec('مفعّل الآن') + list(act.map(id => { const f = fmOf(id), m = f ? 'free' : S.pm[id].k, may = f ? isOwner() : can('protection.mode_preset.apply'); return `<div class="row">${av(M[id], 'sm')}<span class="tx"><b>${kn(id)} · ${modeN(m)}</b><span>${f ? `ينتهي خلال ${f} د · تتوقف كل القواعد` : `حتى ${S.pm[id].until} · ${modeShort(modeOf(m))}`}</span></span>${may ? btn(f ? 'إلغاء' : 'أنهِ', f ? 'freeOff:' + id : 'pmOff:' + id, 'sm sec') : ic('lock')}</div>`; })) : ''}
    ${sec('جاهزة')}<div class="qa" style="grid-template-columns:repeat(3,1fr)">${Object.keys(PM).map(m => tile(m, PM[m][0], m === 'free' && !isOwner() ? 'lock' : PM[m][1])).join('')}</div>
    ${sec('أوضاعي', mk ? 'وضع جديد' : '', 'go:mode-edit:new')}${S.modes.length ? `<div class="qa" style="grid-template-columns:repeat(3,1fr)">${S.modes.map(m => tile(m.id, m.n, m.i)).join('')}</div>` : `<p class="sm muted" style="margin:0 4px">لا أوضاع خاصة بعد. ${mk ? 'أنشئ وضعاً باسمك وحدّد ما يُفتح فيه، ثم طبّقه متى شئت.' : 'ينشئها الأب.'}</p>`}
    <p class="sm muted" style="margin:12px 4px 0">${k === 'study' ? 'تُفتح تطبيقات الدراسة فقط.' : k === 'sleep' ? 'لا يُفتح أي تطبيق، وزر الاستغاثة يعمل.' : k === 'free' ? 'يوقف كل القواعد مؤقتاً لطفل واحد، ثم تعود وحدها. زر الاستغاثة يعمل كالعادة.' : `${modeQ(k)}: ${modeShort(cm)}.`}</p>${cm && can('protection.rule.edit') ? `<div style="margin:4px 0 0">${btn('عدّل هذا الوضع', 'go:mode-edit:' + k, 'sm txt', 'edit')}</div>` : ''}
    ${!okM ? callout(k === 'free' ? 'الوضع الحر يفعّله الأب وحده.' : 'تطبيق الأوضاع ليس من صلاحياتك. ' + why('nd:protection.mode_preset.apply'), 'nt', 'lock') : `${S.os === 'ios' ? callout('الأثر يظهر على أجهزة Android فقط. على iOS لا يستطيع التطبيق إغلاق التطبيقات. ' + why('ios'), 'wa', 'ios') : ''}
    ${sec(k === 'free' ? 'لمن؟ (طفل واحد)' : 'لمن؟')}<div class="chs">${KIDS.map(id => `<button aria-pressed="${sel.includes(id)}" data-a="psKid:${id}">${av(M[id], 'sm')}${kn(id)}</button>`).join('')}</div>
    ${busy ? callout(`الوضع الحر سارٍ ل${kn(sel[0])} · ينتهي خلال ${fmOf(sel[0])} د. ألغِه أولاً إن أردت مدة أخرى.`, 'nt', 'lock_open') : `${sec('كم المدة؟')}${durPick('psN')}
    ${X.length ? `${sec('يتقاطع مع الجدول')}<p class="sm muted" style="margin:0 4px 8px">وقت ${[...new Set(X.map(id => WTN[crossOf(id, n)[1]]))].join(' أو ')} عند ${X.map(kn).join(' و')} يبدأ قبل انتهاء المدة. اختر ما يحدث عنده:</p>${[['stop', 'يتوقف الوضع عند وقت الجدول', 'ينتهي الوضع حين يبدأ وقت النوم أو المدرسة، ويحكم الجدول.'], ['over', 'يستمر الوضع حتى نهاية المدة', 'يبقى الوضع سارياً فوق وقت الجدول، ثم يعود الجدول.']].map(([v, t, d]) => `<button class="opt" aria-pressed="${S.psX === v}" data-a="set:psX:${v}">${ic(S.psX === v ? 'radio_button_checked' : 'radio_button_unchecked')}<span class="grow"><b>${t}</b><span>${d}</span></span></button>`).join('')}` : ''}
    ${sec('ما الذي سيتغير')}${sel.length && n ? `<div class="list">${sel.map(id => `<div class="row">${av(M[id], 'sm')}<span class="tx"><b>${kn(id)}</b><span>${psLine(k, id, n)}</span></span></div>`).join('')}</div><p class="sm muted" style="margin:8px 4px 0">الجدول الأسبوعي والقواعد لا تتغير. ينتهي الوضع وحده، وتستطيع إنهاءه قبل ذلك.</p>` : `<p class="sm muted" style="margin:0 4px">اختر ${sel.length ? '' : 'الطفل و'}المدة لترى ما سيتغير قبل أن تطبّق.</p>`}
    ${offline() ? callout('تطبيق الوضع يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}
    <div class="btns" style="margin-top:16px">${btn(k === 'free' ? 'فعّل الوضع الحر بالرقم السري' : 'طبّق ' + modeQ(k), ready ? 'psGo:' + k : 'noop', ready ? '' : '" disabled="', k === 'free' ? 'lock' : '')}</div>${sel.length && n && X.length && !S.psX ? '<p class="sm muted c" style="margin-top:8px">اختر ما يحدث عند وقت الجدول لتطبّق.</p>' : ''}`}`}`; },
});
Object.assign(ACT, {
  psM(m) { S.stack[S.stack.length - 1].a = [m]; S.psX = ''; if (m === 'free' && (S.psK || []).length > 1) S.psK = []; },
  psKid(id) { const k = S.stack[S.stack.length - 1].a[0], o = S.psK || (S.psK = []); if (k === 'free') S.psK = o[0] === id ? [] : [id]; else o.includes(id) ? o.splice(o.indexOf(id), 1) : o.push(id); },
  psGo(k) { const sel = (S.psK || []).slice(), n = S.psN; if (!sel.length || !n || offline() || (k !== 'free' && !modeOf(k))) return;
    if (k !== 'free' && !S.psX && sel.some(id => crossAsk(k, crossOf(id, n)))) return;
    const run = () => { const snap = { fm: { ...S.fm }, pm: { ...S.pm } }, un = () => { S.fm = snap.fm; S.pm = snap.pm; render(); };   /* ذرّي: كل الحزمة أو لا شيء، والتراجع دفعة واحدة */
      sel.forEach(id => { let nn = n; if (k === 'free') { S.fm[id] = n; delete S.pm[id]; } else { const c = crossOf(id, n); if (crossAsk(k, c) && S.psX === 'stop') nn = c[0]; S.pm[id] = { k, left: nn, until: untilTxt(nn) }; delete S.fm[id]; }   /* وضع واحد لكل طفل: الجديد يحلّ مكان السابق */
        xaud(`${k === 'free' ? 'فُعّل الوضع الحر' : 'طُبّق ' + modeQ(k)} لـ${M[id].n} ${durTxt(nn)} · حتى ${untilTxt(nn)}`, k === 'free' ? 'protection.free_mode.activate' : 'protection.mode_preset.apply', id, k === 'free' ? 'free' : 'mode'); });
      S.psK = []; S.psN = 0; S.psX = ''; toast(`${k === 'free' ? 'الوضع الحر مفعّل' : 'طُبّق ' + modeQ(k)} · ${sel.map(kn).join('، ')}`, un, modeI(k)); };
    k === 'free' ? gate('الوضع الحر يوقف كل القواعد', run, 'stepup') : run(); },
  pmOff(id) { const was = S.pm[id]; if (!was) return; delete S.pm[id]; xaud(`أُنهي ${modeQ(was.k)} لـ${M[id].n} قبل وقته`, 'protection.mode_preset.apply', id, 'mode'); toast(`انتهى ${modeQ(was.k)} ل${kn(id)} · عادت قواعده`, () => { S.pm[id] = was; render(); }); },
});

/* ============ S10-17 وضع خاص: إنشاء وتعديل ============ */
const mdOf = id => { const m = S.modes.find(x => x.id === id); return m ? { id, n: m.n, i: m.i, open: m.open, apps: m.apps.slice().sort(), lim: m.lim ? 1 : 0 } : { id: 'new', n: '', i: 'star', open: '', apps: [], lim: 1 }; };
/* يرجع [الحقل، الرسالة] لأول نقص، أو null. الاسم لا يتكرر، فلا يلتبس وضعان في السجل ولا في اللوحة. */
function mdErr(d) { const n = d.n.trim(), q = arNorm(n).replace(/^وضع\s+/, ''), taken = ['الدراسه', 'النوم', 'حر', 'الحر', ...S.modes.filter(m => m.id !== d.id).map(m => arNorm(m.n).replace(/^وضع\s+/, ''))];
  if (!n) return ['n', 'اكتب اسماً للوضع.']; if (n.length > 24) return ['n', 'الاسم أطول من 24 حرفاً.']; if (taken.includes(q)) return ['n', 'عندك وضع بهذا الاسم. اختر اسماً آخر.'];
  if (!d.open) return ['open', 'اختر ماذا يُفتح في هذا الوضع.']; if (d.open === 'list' && !d.apps.length) return ['apps', 'اختر تطبيقاً واحداً على الأقل، أو اختر «لا شيء».']; return null; }
DRAFT['mode-edit'] = { key: 'md', dirty: () => !!S.md && !same(mdOf(S.md.id), S.md) };
surface('mode-edit', {
  t: id => (S.modes.some(m => m.id === id) ? 'تعديل وضع' : 'وضع جديد'), sys: 'S1-10', p: 'adult', a: ['new'], req: '10:32,33,26',
  note: 'S10-17. الأب ينشئ وضعاً باسمه: اسم وأيقونة، ثم ماذا يُفتح فيه (لا شيء، تطبيقات يختارها، أو كل التطبيقات بحدودها مع تجاوز النوم والمدرسة). لا مدة في الوضع: تُختار عند كل تطبيق. قبل الحفظ يرى أثره على كل طفل باسمه. ما يمنع التعارض: الاسم لا يتكرر، المحظور يبقى مغلقاً في كل وضع، وفتح كل شيء بلا حدود للوضع الحر وحده. إن كان الوضع سارياً قيل إن التعديل يسري فوراً، والحذف ينهيه أولاً. حفظ صريح وتحذير عند الخروج.',
  r(id0) { const isNew = !S.modes.some(m => m.id === id0), mid = isNew ? 'new' : id0; if (!S.md || S.md.id !== mid) S.md = mdOf(mid); const d = S.md, ok = can(isNew ? 'protection.rule.create' : 'protection.rule.edit'), err = mdErr(d), dirty = DRAFT['mode-edit'].dirty(), on = isNew ? [] : KIDS.filter(k => pmOf(k) === mid), ne = err && err[0] === 'n' && d.n.trim() ? err[1] : '';
    const O = [['none', 'block', 'لا شيء', 'كل التطبيقات مغلقة. مثل وقت الطعام أو الصلاة.'], ['list', 'checklist', 'تطبيقات أختارها فقط', 'ما تختاره يُفتح، والباقي مغلق.'], ['all', 'wb_sunny', 'كل التطبيقات كالعادة', 'يتجاوز وقت النوم والمدرسة فقط. الحدود والحصة باقية. مثل سهرة العيد.']];
    const Lm = [[1, 'الحدود باقية', 'يُفتح التطبيق ما دام له وقت اليوم، ووقته يُحسب من حدّه ومن الحصة.'], [0, 'بلا حد داخل الوضع', 'يُفتح طول مدة الوضع ولو نفد وقته. الاستخدام يُحسب في التقارير ولا يُحدّ.']];
    return `${ok ? '' : callout('ترى الوضع ولا تعدّله. ' + why('nd:' + (isNew ? 'protection.rule.create' : 'protection.rule.edit')), 'nt', 'lock')}${offNote()}
    ${on.length ? callout(`سارٍ الآن على ${on.map(kn).join(' و')}: التعديل يسري فور الحفظ.`, 'nt', 'bolt') : ''}
    <label class="fld ${ne ? 'err' : ''}"><span>اسم الوضع</span><input id="mdN" data-ch="mdN" maxlength="30" autocomplete="off" placeholder="مثال: وقت الضيوف" value="${d.n}" ${ok ? '' : 'disabled'}><small>${ne || 'يظهر بهذا الاسم لك ولطفلك.'}</small></label>
    ${sec('الأيقونة')}<div class="chs">${MICON.map(i => `<button aria-pressed="${d.i === i}" data-a="${ok ? 'mdI:' + i : 'noop'}" aria-label="أيقونة ${MICON.indexOf(i) + 1}" style="padding:0 12px">${ic(i)}</button>`).join('')}</div>
    ${sec('ماذا يُفتح في هذا الوضع؟')}${O.map(([v, i, t, x]) => `<button class="opt" aria-pressed="${d.open === v}" data-a="${ok ? 'mdOpen:' + v : 'noop'}">${ic(d.open === v ? 'radio_button_checked' : 'radio_button_unchecked')}<span class="grow"><b>${t}</b><span>${x}</span></span>${ic(i)}</button>`).join('')}
    ${d.open === 'list' ? `${sec('التطبيقات المفتوحة')}<div class="list">${allApps().map(a => { const sel = d.apps.includes(a.id), dead = a.bl.length === a.kids.length; return `<button class="row ${dead ? 'dis' : ''}" data-a="${dead || !ok ? 'noop' : 'mdApp:' + a.id}" role="checkbox" aria-checked="${sel}"><span class="lead">${ic(a.i)}</span><span class="tx"><b>${a.n}</b><span>${dead ? 'محظور دائماً · لا يُفتح في أي وضع' : `على جهاز ${a.kids.map(kn).join(' و')}${a.bl.length ? ` · محظور عند ${a.bl.map(kn).join(' و')}` : ''}`}</span></span>${ic(dead ? 'block' : sel ? 'check_box' : 'check_box_outline_blank')}</button>`; }).join('')}</div>
    ${sec('حدود هذه التطبيقات داخل الوضع')}${Lm.map(([v, t, x]) => `<button class="opt" aria-pressed="${d.lim === v}" data-a="${ok ? 'mdLim:' + v : 'noop'}">${ic(d.lim === v ? 'radio_button_checked' : 'radio_button_unchecked')}<span class="grow"><b>${t}</b><span>${x}</span></span></button>`).join('')}` : ''}
    ${d.open && !(d.open === 'list' && !d.apps.length) ? `${sec('ماذا يحدث لكل طفل')}<div class="list">${KIDS.map(k => `<div class="row">${av(M[k], 'sm')}<span class="tx"><b>${kn(k)}</b><span>${modeLine(d, k)}</span></span></div>`).join('')}</div>` : ''}
    <p class="sm muted" style="margin:12px 4px 0">المدة تختارها في كل مرة تطبّق الوضع. المحظور يبقى مغلقاً، وزر الاستغاثة يعمل دائماً. لفتح كل شيء بلا حدود استعمل الوضع الحر.</p>
    ${ok ? saveBar(isNew ? 'أنشئ الوضع' : 'احفظ الوضع', 'mdSave', dirty && !err) + (err && (dirty || isNew) ? `<p class="sm muted c" style="margin-top:8px">${err[1]}</p>` : '') : ''}
    ${!isNew && can('protection.rule.delete') ? `<div class="c" style="margin-top:12px">${btn('احذف الوضع', offline() ? 'noop' : 'mdDel', 'txt" style="color:var(--danger)' + (offline() ? '" disabled="' : ''), 'delete')}</div>` : ''}`; },
});
Object.assign(ACT, {
  mdN(v) { S.md.n = String(v).replace(/[<>"&`]/g, ''); },
  mdI(i) { S.md.i = i; },
  mdOpen(o) { S.md.open = o; },
  mdApp(aid) { const o = S.md.apps; o.includes(aid) ? o.splice(o.indexOf(aid), 1) : o.push(aid); o.sort(); },
  mdLim(v) { S.md.lim = +v; },
  mdSave() { const d = S.md; if (!d || mdErr(d) || offline()) return; const isNew = d.id === 'new', was = JSON.stringify(S.modes), wpm = { ...S.pm }, un = () => { S.modes = JSON.parse(was); S.pm = wpm; render(); };
    const m = { id: isNew ? 'm' + (Math.max(0, ...S.modes.map(x => +x.id.slice(1))) + 1) : d.id, n: d.n.trim(), i: d.i, open: d.open, apps: d.open === 'list' ? d.apps.slice() : [], lim: d.open === 'list' ? d.lim : 1 };
    if (isNew) S.modes.push(m); else S.modes[S.modes.findIndex(x => x.id === m.id)] = m;
    xaud(`${isNew ? 'أُنشئ' : 'عُدّل'} وضع «${m.n}»: ${modeShort(m)}`, isNew ? 'protection.rule.create' : 'protection.rule.edit', undefined, 'mode', un);
    S.md = null; back(); const t = S.stack[S.stack.length - 1]; if (t.id === 'presets') { t.a = [m.id]; S.psX = ''; }
    toast(isNew ? `أُنشئ وضع «${m.n}» · طبّقه متى شئت` : `حُفظ وضع «${m.n}»`, un, m.i); },
  mdDel() { const d = S.md, m = S.modes.find(x => x.id === d.id); if (!m || offline()) return; const on = KIDS.filter(k => pmOf(k) === m.id);
    confirmDlg(`حذف وضع «${m.n}»؟`, `${on.length ? `سارٍ الآن على ${on.map(kn).join(' و')}: ينتهي وتعود القواعد والجدول. ` : ''}لا يتغير شيء في قواعد التطبيقات ولا في الجدول.`, 'احذف الوضع', () => { const was = JSON.stringify(S.modes), wpm = { ...S.pm }, un = () => { S.modes = JSON.parse(was); S.pm = wpm; render(); };
      S.modes = S.modes.filter(x => x.id !== m.id); on.forEach(k => delete S.pm[k]); xaud(`حُذف وضع «${m.n}»${on.length ? ` وانتهى عند ${on.map(k => M[k].n).join(' و')}` : ''}`, 'protection.rule.delete', undefined, 'mode', un);
      S.md = null; back(); const t = S.stack[S.stack.length - 1]; if (t.id === 'presets' && t.a[0] === m.id) t.a = ['study']; toast(`حُذف وضع «${m.n}»`, un, 'delete'); }, true); },
});

/* ============ S10-11 تنبيهات العبث وإعادة التفعيل ============ */
const TAM = {
  uninstall: ['محاولة حذف التطبيق من الجهاز', 'delete_forever', 'لم يُحذف: الحذف يحتاج الرقم السري للأب'],
  acc: ['توقف إذن مراقبة التطبيقات', 'visibility_off', 'إغلاق التطبيقات فوراً متوقف حتى يعود الإذن'],
  admin: ['سُحب إذن حماية التطبيق من الحذف', 'shield', 'صار حذف التطبيق من الجهاز ممكناً'],
  vpn: ['توقفت تصفية المواقع', 'public', 'تصفية المواقع متوقفة · قواعد التطبيقات تعمل'],
  bg: ['أوقف النظام عمل التطبيق في الخلفية', 'power_settings_new', 'قد يتأخر إغلاق التطبيقات'],
};
/* عادت الحماية: الحدث يُعلَّم «عادت»، والتنبيه يبقى عند الأب حتى يراجعه — لا يُسكَت من جهاز الطفل (REQ-022) */
function tamBack(kid, how) { if (S.tamP) delete S.tamP[kid]; S.tam.filter(e => e.kid === kid && e.st !== 'ok').forEach(e => { e.st = 'ok'; e.back = 'الآن'; }); S.kid[kid].enf = 'active'; S.alerts.filter(a => a.k === 'tamper' && a.kid === kid && a.open).forEach(a => { a.t = `عادت الحماية على جهاز ${M[kid].n}`; a.s = 'راجع ما حدث ثم علّمه محلولاً'; }); S.audit.unshift({ t: `عادت الحماية على جهاز ${M[kid].n} ${how}`, w: 'النظام', at: 'الآن', k: 'protection.tamper.view', kid, ty: 'tamper', d: 0 }); }
const tamKid = x => (M[x] && M[x].role !== 'adult' ? x : (S.alerts.find(a => a.id === x) || {}).kid || 'khaled');
surface('tamper', {
  t: 'تنبيهات العبث', sys: 'S1-10', p: 'adult', a: ['khaled'], req: '10:21,22,23,25 01:6 09:3',
  note: 'S10-11. خمسة أنواع من محاولات التعطيل، كل حدث بوقته وحالة إعادة التفعيل: نحاول، عادت، أو تعذّر. التطبيق يحاول وحده كل دقيقة. التنبيه لا يُسكَت من جهاز الطفل: حتى لو عادت الحماية يبقى عند الأب حتى يعلّمه محلولاً، وهذا للأب وحده. الصياغة تصف ما حدث بلا اتهام.',
  r(x) { const id = tamKid(x), E = S.tam.filter(e => e.kid === id), open = E.filter(e => e.open), bad = open.filter(e => e.st !== 'ok'), own = can('protection.tamper.resolve', id), off = offline();
    const stl = e => (e.st === 'ok' ? `عادت الحماية · ${e.back}` : e.st === 'failed' ? 'تعذّر إعادة التفعيل · يحتاج الجهاز نفسه' : `نحاول إعادة التفعيل… ${e.tries} محاولة حتى الآن، كل دقيقة`);
    return `${kidTabs(id)}${off ? callout('غير متصل: هذه آخر أحداث وصلت. ' + age(S.kid[id].ago), 'nt', 'cloud_off') : ''}
    ${!E.length ? empty('verified_user', 'كل شيء على ما يرام', `لم تُرصد محاولات تعطيل على جهاز ${kn(id)}.`) : `
    <div class="card fx" ${open.length ? 'style="border-color:var(--warning)"' : ''}>${av(M[id], 'lg')}<div class="grow"><b>${bad.length ? `الحماية تعمل جزئياً على جهاز ${kn(id)}` : open.length ? 'عادت الحماية · بانتظار مراجعتك' : 'الحماية تعمل'}</b><div class="sm muted">${bad.length ? TAM[bad[0].ty][2] : open.length ? 'التنبيه يبقى حتى تعلّمه محلولاً' : 'لا تنبيه مفتوح'}</div></div>${chip(bad.length ? 'مفتوح' : open.length ? 'للمراجعة' : 'محلول', bad.length ? 'wa' : open.length ? 'in' : 'ok')}</div>
    ${sec('ما الذي حدث')}<div class="card"><div class="tl">${E.map(e => `<div class="ev ${e.st === 'ok' ? 'ok' : e.st === 'failed' ? 'da' : 'wa'}"><b>${TAM[e.ty][0]}</b><span>${e.at}${e.open ? '' : ' · حُلّ'}</span><span>${stl(e)}</span></div>`).join('')}</div></div>
    ${bad.length ? `${sec('ما الذي يعمل الآن')}${list(row('check_circle', 'حساب الوقت والحصة اليومية', 'يعمل', { ic: 'var(--success)' }), row(bad.some(e => e.ty === 'acc' || e.ty === 'bg') ? 'error' : 'check_circle', 'إغلاق التطبيقات فوراً', bad.some(e => e.ty === 'acc' || e.ty === 'bg') ? 'متوقف حتى تعود الخدمة' : 'يعمل', { ic: bad.some(e => e.ty === 'acc' || e.ty === 'bg') ? 'var(--warning)' : 'var(--success)' }), row(bad.some(e => e.ty === 'vpn') ? 'error' : 'check_circle', 'تصفية المواقع', bad.some(e => e.ty === 'vpn') ? 'متوقفة' : 'تعمل', { ic: bad.some(e => e.ty === 'vpn') ? 'var(--warning)' : 'var(--success)' }), row('check_circle', 'زر الاستغاثة والموقع', 'يعملان', { ic: 'var(--success)' }))}
    ${callout(`تحدّث مع ${kn(id)} أولاً. كثيراً ما يكون السبب تحديثاً للنظام لا قصداً.`, '', 'forum')}<div class="btns">${btn('أرسل له تذكيراً', 'tamPing:' + id, 'sec')}${btn('أعد التفعيل الآن', off ? 'noop' : 'tamRetry:' + id, off ? '" disabled="' : '', 'refresh')}</div>` : ''}
    ${open.length ? `<div class="btns" style="margin-top:8px">${btn('علّمه محلولاً', own ? 'tamOk:' + id : 'denied:protection.tamper.resolve', own ? (bad.length ? 'sec' : '') : 'sec', own ? 'check' : 'lock')}</div>${own ? '' : '<p class="sm muted c" style="margin-top:8px">تعليم التنبيه محلولاً للأب وحده.</p>'}` : ''}`}
    ${sec('للعلم')}${list(row('delete_forever', 'حذف التطبيق من جهاز الطفل', 'يحتاج الرقم السري للأب دائماً', { v: ic('lock') }), row('verified_user', 'حالة الحماية على الجهاز', ENF[S.kid[id].enf][0], { a: 'go:enf-state:' + id }), row('receipt_long', 'سجل التغييرات', 'كل محاولة وكل إعادة تفعيل مسجّلة', { a: can('protection.audit.view') ? 'go:prot-audit:' + id : 'denied:protection.audit.view' }))}`; },
});
Object.assign(ACT, {
  /* التذكير يصل الابن فعلاً: سطر في رئيسيته حتى تعود الحماية، وقيد في السجل (Q-435) */
  tamPing(id) { S.tamP = S.tamP || {}; if (S.tamP[id]) return toast(`سبق أن وصل ${kn(id)} تذكيرك`, null, 'info'); S.tamP[id] = 1; xaud(`أُرسل تذكير إلى ${M[id].n} ليعيد تفعيل الحماية`, 'protection.tamper.view', id, 'tamper'); toast(`وصل ${kn(id)} تذكير لطيف`, null, 'notifications'); },
  tamRetry(id) { if (!devOn(id)) return toast(`جهاز ${kn(id)} غير متصل · نحاول عند اتصاله`, null, 'cloud_off'); tamBack(id, 'بطلب من لوحة الأهل'); toast('عادت الحماية', null, 'verified_user'); },
  tamOk(id) { const bad = S.tam.some(e => e.kid === id && e.open && e.st !== 'ok'), fin = () => { S.tam.filter(e => e.kid === id).forEach(e => { e.open = 0; }); S.alerts.filter(a => a.k === 'tamper' && a.kid === id).forEach(a => { a.open = 0; }); xaud(`عُلّم تنبيه العبث على جهاز ${M[id].n} محلولاً${bad ? ' والحماية لم تعد بعد' : ''}`, 'protection.tamper.resolve', id, 'tamper'); toast('عُلّم التنبيه محلولاً'); };
    if (bad) { confirmDlg('الحماية لم تعد بعد', 'تعليم التنبيه محلولاً يخفيه فقط ولا يعيد الحماية. التطبيق يواصل المحاولة كل دقيقة.', 'علّمه محلولاً', fin, true); } else fin(); },
});

/* ============ S10-12 حالة الفرض ============ */
surface('enf-state', {
  t: id => 'حالة الحماية — ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:14,15,16,17,25,27 01:22,23',
  note: 'S10-12 (مصطلح المسرد: «حالة الفرض»). ما يحكم الطفل الآن، والحد التالي، والمتبقي لكل تطبيق، والوضع الحر، والعبث، وآخر مزامنة. إن غُيّرت قاعدة وجهازه منقطع ظهر «تغيير بانتظار اتصال الجهاز». الحالة تصف ما يؤكده الجهاز لا ما أُرسل إليه. اقطع «جهاز ليان» من الاستوديو لترى الانتظار.',
  r(id) { const k = S.kid[id], e = ENF[k.enf], on = devOn(id), nr = nowRule(id), L2 = S.apps[id].filter(a => a.act === 'LIMIT'), pend = S.pendR[id] || 0, T = tamOpen(id);
    if (noDev(id)) return `${kidTabs(id)}${`<div class="card nodev">${ic('mobile_off')}<div class="grow"><b>لم يُقرن جهاز ${kn(id)} بعد</b><div class="sm muted">القواعد التي تضعها الآن تسري من لحظة الإقران.</div></div>${isOwner() ? btn('اقرن جهازه', 'go:pair-code:' + id, 'sm', 'devices') : ''}</div>`}${callout('حالة الحماية (ما يحكم الجهاز الآن، والمتبقي، وآخر مزامنة) تظهر هنا بعد أن يقترن الجهاز.', 'nt', 'info')}`;   /* طفل أُضيف ولم يُقرن جهازه: لا حالة تُعرض (Q-435) */
    return `${iosNote()}${kidTabs(id)}
    <div class="card fx"><span class="bigic" style="width:56px;height:56px;border-radius:var(--r-lg);margin:0">${ic(e[1])}</span><div class="grow"><b>${e[0]}</b><div class="sm muted">${on && !offline() ? 'الجهاز متصل ويطبّق آخر قواعدك' : 'الجهاز يطبّق آخر قواعد وصلته، حتى دون إنترنت'}</div></div>${age(on ? k.ago : k.ago + 95)}</div>
    ${pend ? callout(`<b>${pend === 1 ? 'تغيير واحد' : pend === 2 ? 'تغييران' : pend + ' تغييرات'} بانتظار اتصال الجهاز</b><br>حُفظ عندنا ويصل إلى جهاز ${kn(id)} عند أول اتصال.`, 'wa', 'cloud_upload') : ''}
    ${sec('الآن')}${list(row(nr[0], nr[1], nr[2], { v: chip('الآن', nr[3]) }), row('update', 'الحد التالي', nextEdge(id), {}), row('bolt', 'الوضع الساري', fmOf(id) ? `وضع حر · ينتهي خلال ${fmOf(id)} د` : S.pm[id] ? `${modeQ(S.pm[id].k)} · حتى ${S.pm[id].until}` : 'لا وضع مفعّل', { a: 'go:presets:' + (fmOf(id) ? 'free' : S.pm[id] ? S.pm[id].k : 'study') }), row('gpp_maybe', 'العبث', T.length ? (T.some(x => x.st !== 'ok') ? 'محاولة تعطيل مفتوحة' : 'عادت الحماية · بانتظار المراجعة') : 'لا شيء', { a: can('protection.tamper.view', id) ? 'go:tamper:' + id : 'denied:protection.tamper.view', v: T.length ? chip('مفتوح', 'wa') : '' }))}
    ${sec('المتبقي لكل تطبيق')}${L2.length ? list(L2.map(a => row(a.i, a.n, limLeft(a) ? `بقي ${limLeft(a)} د` : 'نفد وقته اليوم', { v: `${a.used} من ${a.lim}` }))) : '<p class="sm muted" style="margin:0 4px">لا تطبيق له حدّ يومي.</p>'}
    ${list(row('hourglass_top', 'الحصة اليومية', left(id) ? `بقي ${left(id)} د` : 'نفدت', { v: `${k.used} من ${k.quota + k.extra}` }))}
    ${sec('المزامنة')}${list(row('sync', 'آخر مزامنة للقواعد', on ? 'القواعد على الجهاز هي آخر ما حفظت' : 'الجهاز غير متصل الآن', { v: age(on ? k.ago : k.ago + 95) }))}<div class="btns" style="margin-top:12px">${btn('مزامنة الآن', offline() ? 'noop' : 'enfSync:' + id, 'sec' + (offline() ? '" disabled="' : ''), 'sync')}</div>
    <p class="sm muted" style="margin:12px 4px 0">الوقت يُحسب كل دقيقة على الجهاز نفسه، وتغيير ساعة الجهاز لا يؤخر الإغلاق. الحصص تُصفَّر عند منتصف الليل بتوقيت العائلة.</p>`; },
});
ACT.enfSync = id => { if (!devOn(id)) return toast(`جهاز ${kn(id)} غير متصل · تصل التغييرات عند اتصاله`, null, 'cloud_off'); S.kid[id].ago = 0; const n = S.pendR[id]; delete S.pendR[id]; toast(n ? 'وصلت التغييرات المنتظرة إلى الجهاز' : 'القواعد على الجهاز محدَّثة', null, 'cloud_done'); };
surface('enf-all', { t: 'حالة الحماية', sys: 'S1-10', p: 'adult', req: '10:25 09:1', note: 'حالة كل جهاز طفل في سطر، وما يحكمه الآن.', r() { return list(KIDS.map(id => { const e = ENF[S.kid[id].enf], nr = nowRule(id); return row('', kn(id), noDev(id) ? e[0] : `${e[0]} · الآن: ${nr[1]}`, { lead: av(M[id]), a: 'go:enf-state:' + id, v: chip('', e[2], e[1]) }); })); } });

/* ============ S10-13 سجل تدقيق الحماية ============ */
const PAT = [['all', 'كل الأنواع'], ['rule', 'قاعدة'], ['sched', 'جدول'], ['rank', 'ترتيب'], ['mode', 'وضع'], ['free', 'وضع حر'], ['tamper', 'عبث'], ['web', 'تصفية']];
const PATI = { rule: 'apps', sched: 'calendar_month', rank: 'swap_vert', mode: 'bolt', free: 'lock_open', tamper: 'gpp_maybe', web: 'travel_explore' };
const paList = f => S.audit.map((a, i) => [a, i]).filter(([a]) => /^protection\./.test(a.k || '') && (!f.kid || f.kid === 'all' || a.kid === f.kid) && (!f.ty || f.ty === 'all' || a.ty === f.ty) && (f.per == null || f.per === 'all' || (a.d || 0) <= +f.per));
surface('prot-audit', {
  t: 'سجل تغييرات الحماية', sys: 'S1-10', p: 'adult', a: ['all'], req: '10:26 03:18',
  note: 'S10-13. كل تغيير في القواعد والحصة والجدول والترتيب والأوضاع والعبث والتصفية: من غيّر وماذا ومتى، والأحدث أعلى. ثلاث تصفيات: بالطفل وبالنوع وبالفترة. «تراجع» حيث يمكن. للقراءة فقط: لا حذف.',
  r(kid0) { const f = S.paF || (S.paF = {}); if (f.src !== kid0) { f.kid = M[kid0] ? kid0 : 'all'; f.src = kid0; } const L2 = paList(f), any = S.audit.some(a => /^protection\./.test(a.k || '')), fc = (opts, cur, a) => `<div class="fch w">${opts.map(([k, t]) => `<button aria-pressed="${(cur ?? 'all') === k}" data-a="${a}:${k}">${t}</button>`).join('')}</div>`;
    return `${offline() ? callout('غير متصل: ترى الأحداث المحفوظة على هاتفك.', 'nt', 'cloud_off') : ''}${fc([['all', 'كل الأطفال'], ...KIDS.map(id => [id, kn(id)])], f.kid, 'paF:kid')}${fc(PAT, f.ty, 'paF:ty')}${fc([['all', 'كل الوقت'], ['0', 'اليوم'], ['7', '7 أيام']], f.per, 'paF:per')}
    ${L2.length ? `<div class="list">${L2.map(([a, i]) => `<div class="row"><span class="lead">${ic(PATI[a.ty] || 'receipt_long')}</span><span class="tx"><b>${a.t}</b><span>${a.w} · ${a.at}${a.undone ? ' · تُراجع عنه' : ''}</span></span>${a.un && !a.undone && !offline() ? btn('تراجع', 'paUndo:' + i, 'sm txt') : ''}</div>`).join('')}</div>` : empty('receipt_long', any ? 'لا تغييرات بهذه التصفية' : 'لا تغييرات بعد', any ? 'غيّر التصفية أو اعرض الكل.' : 'كل تغيير في قواعد الحماية يُكتب هنا.', any ? btn('اعرض الكل', 'paClear', 'sm sec') : '')}${can('roles.audit.view') ? `<button class="card fx" style="margin-top:12px" data-a="go:audit">${ic('key')}<div class="grow"><b>سجل الصلاحيات</b><div class="sm muted">من مُنح ماذا، ومن سُحب منه</div></div>${ic('chevron_right')}</button>` : ''}`; },
});
Object.assign(ACT, {
  paF(k, v) { (S.paF || (S.paF = {}))[k] = v; },
  paClear() { S.paF = { kid: 'all', src: (S.paF || {}).src }; },
  paUndo(i) { const a = S.audit[+i]; if (!a || !a.un || a.undone) return; a.un(); a.undone = 1; S.audit.unshift({ t: 'تراجع عن: ' + a.t, w: me().n, at: 'الآن', k: a.k, kid: a.kid, ty: a.ty, d: 0 }); toast('تُراجع عن التغيير'); },
});

/* ============ S10-14 مراجعة القواعد: بلوغ 13 واستبدال الجهاز ============ */
surface('rules-review', {
  t: 'مراجعة القواعد', sys: 'S1-10', p: 'adult', req: '10:27 02:9 03:3',
  note: 'S10-14. بطاقتان: طفل بلغ 13 وقواعده ما زالت سارية، وجهاز جديد قُرن فأُعيدت إليه القواعد نفسها. في كل بطاقة: «راجع القواعد» أو «أبقِها كما هي». شغّل «بلوغ 13» من الاستوديو لترى بطاقة ليان.',
  r() { const R2 = reviews(), ok = can('protection.rule.view');
    return R2.length ? R2.map(r => { const f = M[r.kid].f; return `<div class="card"><div class="fx top">${av(M[r.kid])}<div class="grow"><b>${r.k === 'teen' ? `${f ? 'بلغت' : 'بلغ'} ${kn(r.kid)} 13 سنة` : r.k === 'new' ? `اقترن جهاز ${kn(r.kid)}: اضبط قواعده` : `قُرن جهاز جديد ل${kn(r.kid)}`}</b><div class="sm muted" style="margin-top:2px">${r.k === 'teen' ? `${f ? 'قواعدها' : 'قواعده'} ما زالت سارية كما هي. ${f ? 'راجعها إن أردت أن تناسب سنّها' : 'راجعها إن أردت أن تناسب سنّه'}. كسب الوقت بالنقاط يتوقف للمراهقين، وحدود التطبيقات تستمر.` : r.k === 'new' ? `يعمل الآن بحصة ${S.kid[r.kid].quota} دقيقة في اليوم وبتصفية الويب الجاهزة. لا وقت نوم ولا وقت مدرسة ولا حدود تطبيقات بعد: ضعها الآن أو لاحقاً من «التحكم».` : `أُعيدت إليه ${f ? 'قواعدها' : 'قواعده'} نفسها: التطبيقات والحصة والجدول والتصفية. لا شيء يُبنى من جديد.`}</div><div class="xs muted" style="margin-top:4px">${r.at}</div></div></div><div class="btns" style="margin-top:12px">${btn('أبقِها كما هي', 'rvKeep:' + r.id, 'sec')}${btn('راجع القواعد', ok ? 'rvGo:' + r.id : 'denied:protection.rule.view')}</div></div>`; }).join('') : empty('task_alt', 'لا مراجعات معلقة', 'حين يُقرن جهاز جديد لطفل أو يبلغ 13 سنة تظهر هنا بطاقة لتراجع قواعده.'); },
});
const rvDone = (id, how) => { const r = reviews().find(x => x.id === id); if (!r) return null; if (id === 'teen') S.rvT = 1; else S.rv = S.rv.filter(x => x.id !== id); xaud(`مراجعة قواعد ${M[r.kid].n} (${r.k === 'teen' ? 'بلوغ 13' : r.k === 'new' ? 'طفل جديد' : 'جهاز جديد'}): ${how}`, 'protection.rule.view', r.kid, 'rule'); return r; };
ACT.psFor = kid => { S.psK = [kid]; S.psN = 0; S.psX = ''; go('presets', fmOf(kid) ? 'free' : pmOf(kid) || 'study'); };
Object.assign(ACT, {
  rvKeep(id) { if (rvDone(id, 'أُبقيت كما هي')) toast('أُبقيت القواعد كما هي'); },
  rvGo(id) { const r = rvDone(id, 'فُتحت للمراجعة'); if (r) { S.ctlKid = r.kid; go('apps', r.kid); } },
});

/* ============ S10-15 تصفية الويب + S10-16 تجاوزات النطاقات ============ */
/* [المعرّف الرقمي الثابت (REQ-028)، الاسم، المجموعة، الافتراضي]. الخمس الأولى محظورة نصاً في المصدر؛ والخمس التالية اقتراح ينتظر قرار المالك. */
const WCAT = [
  [14, 'محتوى إباحي', 0, 'BLOCK'], [12, 'محتوى للكبار', 0, 'BLOCK'], [7, 'قمار', 0, 'BLOCK'], [3, 'مخدرات', 0, 'BLOCK'], [1, 'كحول', 0, 'BLOCK'],
  [21, 'تبغ وتدخين', 0, 'BLOCK', 1], [23, 'عنف', 0, 'BLOCK', 1], [24, 'أسلحة', 0, 'BLOCK', 1], [15, 'ألفاظ بذيئة', 0, 'BLOCK', 1], [29, 'مواقع تجاوز الحجب', 0, 'BLOCK', 1],
  [19, 'شبكات التواصل', 1], [2, 'دردشة', 1], [30, 'منتديات', 1], [25, 'بريد إلكتروني', 1], [28, 'مشاركة ملفات', 1],
  [8, 'ألعاب', 2], [6, 'ترفيه', 2], [18, 'تسوّق', 2], [20, 'رياضة', 2], [22, 'سفر', 2],
  [4, 'تعليم', 3], [17, 'محركات بحث', 3], [13, 'أخبار', 3], [27, 'تقنية', 3], [31, 'ذكاء اصطناعي', 3], [10, 'صحة', 3], [16, 'دين', 3], [9, 'مواقع حكومية', 3], [26, 'أعمال', 3], [5, 'وظائف', 3],
];
const WGRP = ['غير لائق أو خطر', 'تواصل ومشاركة', 'ترفيه وتسوّق', 'معرفة وخدمات'];
const WACT = { BLOCK: ['حظر', 'da', 'block', 'لا يُفتح الموقع'], ALERT: ['تنبيه', 'wa', 'notifications', 'يُفتح ويصلك تنبيه'], ALLOW: ['سماح', 'ok', 'check', 'يُفتح بلا تنبيه'], IGNORE: ['تجاهل', 'ol', 'visibility_off', 'يُفتح ولا يظهر في التقارير'] };
const wDef = id => (WCAT.find(c => c[0] === +id)[3] || 'ALLOW');
/* خيارات التصفية بافتراضياتها الحرفية (REQ-030). الخامس (isCategoryList) لا يُعرض: معناه للأب غير محسوم في المواصفة (G-S10-15). */
const WFL = [['safe', 'البحث الآمن', 'يخفي النتائج غير اللائقة في محركات البحث', true], ['report', 'أبلغني بالمواقع المحظورة', 'يصلك تنبيه حين يحاول فتح موقع محظور', true], ['unknown', 'اسمح بالمواقع غير المصنّفة', 'مواقع لا نعرف فئتها. وهو مطفأ تُحظر.', false], ['search', 'تنبيهات البحث', 'يصلك تنبيه عن بعض كلمات البحث', false]];
const wfFlagOf = (kid, f) => S.wfl[kid][f] ?? WFL.find(x => x[0] === f)[3];
const wfCount = kid => WCAT.filter(c => (S.wfc[kid][c[0]] || wDef(c[0])) === 'BLOCK').length;
const wrOf = kid => ({ kid, c: { ...S.wfc[kid] }, f: { ...S.wfl[kid] } });
surface('webfilter', {
  t: id => 'تصفية الويب — ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:28,30,31,26',
  note: 'S10-15. ثلاثون فئة في أربع مجموعات، لكل فئة: حظر أو تنبيه أو سماح. عشر فئات محظورة من أول يوم (Q-405): خمس من المرجع (إباحي، للكبار، قمار، مخدرات، كحول) وخمس معها (تبغ، عنف، أسلحة، ألفاظ بذيئة، مواقع تجاوز الحجب)، والباقي سماح. الخيار الخامس في المرجع «قائمة فئات» لا يُعرض: معناه للأب غير محسوم. التعديل للأب وحده، بحفظ صريح وتحذير عند الخروج.',
  r(id) { if (!S.wr || S.wr.kid !== id) S.wr = wrOf(id); const d = S.wr, own = can('protection.filter.edit', id), dirty = DRAFT.webfilter.dirty(), val = c => d.c[c[0]] || wDef(c[0]), chg = WCAT.filter(c => d.c[c[0]] && d.c[c[0]] !== wDef(c[0])).length;
    return `${S.os === 'ios' ? callout('تصفية المواقع تعمل على أجهزة Android. على iOS تُحفظ القواعد ولا نعد بتطبيقها. ' + why('ios'), 'wa', 'ios') : ''}${kidTabs(id)}${own ? '' : callout('تصفية الويب يغيّرها الأب وحده. ترى القيم هنا. ' + why('nd:protection.filter.edit'), 'nt', 'lock')}${offNote()}
    ${sec('خيارات')}${list(WFL.map(([k, t, s]) => row('', t, s, { tg: d.f[k] ?? wfFlagOf(id, k), ta: own ? 'wrFlag:' + k : 'denied:protection.filter.edit' })))}
    ${list(row('public', 'مواقع مستثناة', S.wdom[id].length ? S.wdom[id].map(x => x.d).slice(0, 2).join('، ') : 'كل موقع يتبع فئته', { a: 'go:web-domains:' + id, v: String(S.wdom[id].length) }))}
    ${sec('فئات المواقع', own && chg ? 'أعد الافتراضي' : '', 'wrReset')}${searchBox('ابحث عن فئة', '.list .row[data-q]')}
    ${WGRP.map((g, gi) => `<div data-grp><p class="sm muted" style="margin:12px 4px 8px">${g}</p><div class="list">${WCAT.filter(c => c[2] === gi).map(c => { const v = val(c); return `<button class="row noic" data-q="${c[1]} ${g}" data-a="${own ? `go:wf-cat:${id}:${c[0]}` : 'denied:protection.filter.edit'}"><span class="tx"><b>${c[1]}</b><span>${c[3] === 'BLOCK' ? (v === 'BLOCK' ? 'محظور افتراضياً' : 'كان محظوراً افتراضياً · غيّرته') : v !== 'ALLOW' ? 'غيّرته' : WACT[v][3]}</span></span>${chip(WACT[v][0], WACT[v][1], WACT[v][2])}</button>`; }).join('')}</div></div>`).join('')}
    <div data-none hidden>${empty('search_off', 'لا فئة بهذا الاسم', 'جرّب اسماً آخر.')}</div>
    ${own ? saveBar('احفظ التصفية', 'wrSave', dirty) : ''}`; },
});
surface('wf-cat', {
  kind: 'sheet', t: 'إجراء فئة', sys: 'S1-10', p: 'owner', a: ['layan', '19'], req: '10:28',
  note: 'ثلاثة إجراءات بوصف كل منها. الاختيار يدخل المسودة ولا يُحفظ حتى تضغط «احفظ التصفية».',
  r(kid, cid) { const c = WCAT.find(x => x[0] === +cid) || WCAT[0], d = S.wr && S.wr.kid === kid ? S.wr : (S.wr = wrOf(kid)), v = d.c[c[0]] || wDef(c[0]);
    return `<h4>${c[1]}</h4><p class="d">ماذا يحدث حين يفتح ${kn(kid)} موقعاً من هذه الفئة؟${c[3] === 'BLOCK' ? ' الافتراضي: حظر.' : ''}</p>${['BLOCK', 'ALERT', 'ALLOW'].map(a => `<button class="opt" aria-pressed="${v === a}" data-a="wrCat:${c[0]}:${a}">${ic(v === a ? 'radio_button_checked' : 'radio_button_unchecked')}<span class="grow"><b>${WACT[a][0]}</b><span>${WACT[a][3]}</span></span>${ic(WACT[a][2])}</button>`).join('')}`; },
});
Object.assign(ACT, {
  wrFlag(k) { const d = S.wr; d.f[k] = !(d.f[k] ?? wfFlagOf(d.kid, k)); if (d.f[k] === WFL.find(x => x[0] === k)[3] && S.wfl[d.kid][k] === undefined) delete d.f[k]; },
  wrCat(cid, a) { const d = S.wr; if (a === wDef(cid) && S.wfc[d.kid][cid] === undefined) delete d.c[cid]; else d.c[cid] = a; S.sheet = null; },
  wrReset() { S.wr.c = {}; Object.keys(S.wfc[S.wr.kid]).forEach(k => { S.wr.c[k] = wDef(k); }); },
  wrSave() { const d = S.wr, kid = d.kid; if (offline()) return; const was = { c: S.wfc[kid], f: S.wfl[kid] }, un = () => { S.wfc[kid] = was.c; S.wfl[kid] = was.f; S.wr = null; render(); }, nC = WCAT.filter(c => (d.c[c[0]] || wDef(c[0])) !== (was.c[c[0]] || wDef(c[0]))), nF = WFL.filter(f => (d.f[f[0]] ?? f[3]) !== (was.f[f[0]] ?? f[3]));
    S.wfc[kid] = { ...d.c }; S.wfl[kid] = { ...d.f };
    xaud(`تصفية الويب ل${M[kid].n}: ${[...nC.map(c => `${c[1]} ← ${WACT[d.c[c[0]] || wDef(c[0])][0]}`), ...nF.map(f => `${f[1]} ← ${(d.f[f[0]] ?? f[3]) ? 'مفعّل' : 'مطفأ'}`)].join('، ')}`, 'protection.filter.edit', kid, 'web', un); S.wr = null; pushed(kid, `حُفظت قواعد التصفية وسارية على جهاز ${kn(kid)}`, un); },
});
const domFix = s => (s || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').replace(/[\/?#].*$/, '');
surface('web-domains', {
  t: id => 'مواقع مستثناة — ' + M[id].n, sys: 'S1-10', p: 'adult', a: ['layan'], req: '10:29,26',
  note: 'S10-16 (مصطلح المسرد: «تجاوزات النطاقات»). موقع بعينه بإجراء يفوز على إجراء فئته: سماح، حظر، تنبيه. حذف الاستثناء يعيد الموقع إلى فئته. الإجراء الرابع في المرجع («تجاهل») لا يُعرض: يُخفي عن الأب شيئاً من تصفح ولده (Q-405). التعديل للأب وحده، ويحتاج اتصالاً.',
  r(id) { const D = S.wdom[id], own = can('protection.filter.edit', id), n = S.wdN || { a: '' }, off = offline();
    return `${own ? '' : callout('المواقع المستثناة يغيّرها الأب وحده. ' + why('nd:protection.filter.edit'), 'nt', 'lock')}${off ? callout('الإضافة والحذف يحتاجان اتصالاً. ترى آخر ما حُفظ.', 'wa', 'cloud_off') : ''}
    ${callout('الاستثناء يفوز على فئة الموقع. مثال: تحظر «شبكات التواصل» وتسمح بموقع واحد منها.', 'nt', 'info')}
    ${D.length ? `${D.length > 4 ? searchBox('ابحث عن موقع', '.list .row[data-q]') : ''}<div class="list">${D.map((x, i) => `<div class="row" data-q="${x.d}"><span class="lead">${ic('public')}</span><span class="tx"><b><span class="ltr">${x.d}</span></b><span>${WACT[x.a][3]}</span></span>${chip(WACT[x.a][0], WACT[x.a][1], WACT[x.a][2])}${own && !off ? `<button class="ib" data-a="wdomDel:${id}:${i}" aria-label="احذف استثناء ${x.d}">${ic('delete')}</button>` : ''}</div>`).join('')}</div><div data-none hidden>${empty('search_off', 'لا موقع بهذا الاسم', '')}</div>` : empty('public', 'لا مواقع مستثناة', 'كل موقع يتبع إجراء فئته.')}
    ${own ? `${sec('أضف استثناء')}<label class="fld ${n.err ? 'err' : ''}"><span>عنوان الموقع</span><input id="wdomN" dir="ltr" inputmode="url" autocomplete="off" placeholder="example.com" value="${n.d || ''}"><small>${n.err || 'اكتب اسم الموقع فقط، بلا http ولا مسار.'}</small></label><div class="seg" role="group">${['ALLOW', 'BLOCK', 'ALERT'].map(a => `<button aria-pressed="${n.a === a}" data-a="wdomA:${a}">${WACT[a][0]}</button>`).join('')}</div><p class="sm muted" style="margin:-4px 4px 12px">${n.a ? WACT[n.a][3] + '.' : 'اختر ماذا يحدث حين يفتحه.'}</p>${btn('أضف استثناء', off ? 'noop' : 'wdomAdd:' + id, off ? '" disabled="' : '', 'add')}` : ''}`; },
});
Object.assign(ACT, {
  wdomA(a) { S.wdN = { ...(S.wdN || {}), a, d: ($('#wdomN') || {}).value || '', err: '' }; },
  wdomAdd(id) { const d = domFix(($('#wdomN') || {}).value), n = S.wdN || {}, bad = !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(d) ? 'هذا ليس عنوان موقع صحيحاً. مثال: example.com' : S.wdom[id].some(x => x.d === d) ? 'هذا الموقع مضاف من قبل.' : !n.a ? 'اختر الإجراء أولاً.' : '';
    if (bad) { S.wdN = { ...n, d, err: bad }; return; } if (offline()) return;
    const un = () => { S.wdom[id] = S.wdom[id].filter(x => x.d !== d); render(); }; S.wdom[id].push({ d, a: n.a }); S.wdN = null; xaud(`استثناء موقع ل${M[id].n}: ${d} ← ${WACT[n.a][0]}`, 'protection.filter.edit', id, 'web', un); pushed(id, `حُفظ الاستثناء وسارٍ على جهاز ${kn(id)}`, un); },
  wdomDel(id, i) { const x = S.wdom[id][+i]; confirmDlg(`حذف استثناء ${x.d}؟`, 'سيعود الموقع إلى إجراء فئته.', 'احذف الاستثناء', () => { const was = S.wdom[id].slice(), un = () => { S.wdom[id] = was; render(); }; S.wdom[id] = was.filter(y => y !== x); xaud(`حُذف استثناء موقع ل${M[id].n}: ${x.d}`, 'protection.filter.edit', id, 'web', un); pushed(id, 'حُذف الاستثناء · عاد الموقع إلى فئته', un); }, true); },
});

/* ============ S10-07 شاشة الحظر (للطفل) ============ */
surface('block', {
  kind: 'full', cls: 'dark', t: 'شاشة الحظر', sys: 'S1-10', p: 'kid', a: ['ytk'], req: '10:3,5,7,12,14 05:8,12 01:7',
  note: 'S10-07. تظهر فوراً وتعمل دون إنترنت. السبب بلغة صريحة حسب ما حسم: وضع فعّله الأب باسمه، وقت نوم، وقت مدرسة، نفد وقت التطبيق، نفدت الحصة، أو تطبيق محظور. «اطلب وقتاً إضافياً» يظهر حين ينفع فقط: الوقت الممنوح لا يفتح شيئاً في وقت النوم أو المدرسة. زر الاستغاثة دائماً. صياغتان: طفل ومراهق. بلا لوم.',
  r(aid) { const id = kidId(), m = M[id], f = m.f, a = appOf(id, aid) || S.apps[id].find(x => !decide(id, x.id).ok) || S.apps[id].find(x => x.act === 'LIMIT') || S.apps[id][0], dc = decide(id, a.id), y = dc.ok ? (a.act === 'BLOCK' ? 'blocked' : 'app') : dc.why, teen = mode() === 'teen', r = S.reqs.find(x => x.kid === id && x.app === a.id && x.st === 'PENDING'), ask = y === 'app' || y === 'quota', end = winEnd(id), ma = modeAct(id), mo = ma && ma.open === 'list' ? S.apps[id].filter(x => decide(id, x.id).ok) : [];
    const T = { sleep: ['bedtime', 'وقت نوم', teen ? `كل التطبيقات مغلقة حتى ${end}.` : `كل التطبيقات تنام الآن وتعود ${end}.`, 'وقت النوم'], school: ['school', 'وقت مدرسة — تطبيقات الدراسة فقط', `${a.n} يعود بعد ${end}. تطبيقات الدراسة مفتوحة.`, 'وقت المدرسة'], app: ['hourglass_empty', `نفد وقت ${a.n} اليوم`, teen ? 'وصلت إلى حدّه اليومي. يعود غداً.' : `${f ? 'لعبتِ' : 'لعبتَ'} وقته كله. يعود غداً من جديد!`, 'انتهى وقت اللعبة'], quota: ['hourglass_empty', 'نفدت حصتك اليومية', teen ? 'انتهى وقت الشاشة لليوم. يعود غداً.' : 'انتهى وقت الشاشة لليوم. نكمل غداً!', 'انتهى وقت اللعب'], mode: [ma ? ma.i : 'bolt', ma ? `الآن ${modeQ(ma.id)}` : 'وضع مؤقت', ma && ma.open === 'list' && mo.length ? `${a.n} يعود ${end}. المفتوح الآن: ${mo.map(x => x.n).join('، ')}.` : teen ? `كل التطبيقات مغلقة حتى ${end}.` : `كل التطبيقات مغلقة الآن وتعود ${end}.`, 'مقفل الآن'], blocked: ['lock', `${a.n} غير متاح`, teen ? 'اختار والدك ألا يُفتح هذا التطبيق.' : 'اختار بابا ألا يُفتح هذا التطبيق.', 'مقفل'] }[y];
    const wait = `<div style="background:#ffffff1a;border-radius:var(--r-lg);padding:14px;text-align:center;margin-bottom:12px">${ic('hourglass_top')}<b style="display:block;margin-top:8px">طلبك عند ${teen ? 'والدك' : 'بابا'}</b><span style="font-size:13px;opacity:.85">${offline() ? 'يُرسل عند عودة الاتصال' : 'سنخبرك حالما يرد'}</span></div>`;
    return `<div class="body" style="justify-content:center"><div class="bigic">${ic(T[0])}</div><p class="ttl">${T[1]}</p><p class="sub">${T[2]}</p>${ask ? `<p class="c" style="margin:-6px 0 16px;opacity:.85">المتبقي: 0 دقيقة</p>` : ''}
    ${!ask ? (y === 'school' ? btn(f ? 'افتحي تطبيقات الدراسة' : 'افتح تطبيقات الدراسة', 'blkLearn', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'school') : '') : r ? wait : `${btn(teen ? 'اطلب وقتاً إضافياً' : f ? 'اطلبي وقتاً إضافياً' : 'اطلب وقتاً إضافياً', 'go:ask-time:' + a.id, 'sec" style="background:#fff;color:#142749;box-shadow:none', 'front_hand')}<div class="gap"></div>${teen ? '' : btn(f ? 'استخدمي نقاطي' : 'استخدم نقاطي', 'blkRedeem', 'sec" style="box-shadow:inset 0 0 0 1.5px #ffffff80;color:#fff', 'stars')}`}
    <div class="gap"></div>${btn(y === 'sleep' || (y === 'mode' && !mo.length) ? 'حسناً' : 'افتح شيئاً آخر', 'close', 'txt" style="color:#fff;width:100%')}<div class="c" style="margin-top:16px">${sosBtn()}</div><div class="c" style="margin-top:16px"><button class="why" style="color:#D5DDEC" data-a="why:${y === 'sleep' ? 'sleep' : y === 'school' ? 'kidschool' : y === 'quota' ? 'kidquota' : y === 'blocked' ? 'kidblocked' : y === 'mode' ? 'kidmode' : 'kidlimit'}">${ic('help')}لماذا؟</button></div></div>`; },
});
/* ============ S10-08 التحذير قبل 5 دقائق (للطفل) ============ */
surface('warn5', {
  kind: 'sheet', t: 'بقي 5 دقائق', sys: 'S1-10', p: 'kid', a: ['mc'], req: '10:4 01:7',
  note: 'S10-08. يظهر مرة واحدة في اليوم لكل تطبيق حين يقترب من حدّه، ويعمل دون إنترنت. جملة واحدة وزر واحد، بلا لوم وبلا تفاصيل عن القاعدة. زر الاستغاثة ظاهر.',
  r(aid) { const id = kidId(), a = appOf(id, aid) || S.apps[id][0], teen = mode() === 'teen', f = M[id].f;
    return `<div class="c"><div class="bigic" style="width:72px;height:72px;border-radius:var(--r-xl);margin-bottom:12px">${ic('hourglass_top')}</div><h4>بقي 5 دقائق</h4><p class="d">${teen ? `ينتهي وقت ${a.n} بعد قليل.` : `ينتهي وقت ${a.n} بعد قليل. ${f ? 'أنهي ما تفعلين' : 'أنهِ ما تفعل'}.`}</p></div>${btn('حسناً', 'close')}<div class="c" style="margin-top:12px">${sosBtn()}</div>`; },
});
Object.assign(ACT, {
  blkLearn() { S.full = null; ACT.tab('learn'); },
});
