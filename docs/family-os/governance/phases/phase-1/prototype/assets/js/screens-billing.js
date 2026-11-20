/* S1-04 الخطط والاشتراكات: الخطة والاستهلاك، المقارنة، تأكيد التغيير، الدفع (متجر وبطاقة في الخليج، ومحافظ يمنية وحدها في اليمن — Q-422)،
   تعبئة الرسائل النصية، التجربة، المهلة والعودة إلى المجانية، بطاقة بلوغ الحد، إدارة الاشتراك، سجل المدفوعات.
   ثوابت لا تُكسر: الأمان لا يتوقف على الخطة · لا تتغير الخطة قبل تحقق الخادم من الدفع · لا شيء من هذا يظهر لطفل أو مراهق.
   سوق العائلة (اليمن أو الخليج) يأتي من بلدها، لا من اختيار داخل الشاشة؛ في النموذج يُبدَّل من لوحة الضبط. */
'use strict';

/* ---------- الكتالوج (في المنتج يُقرأ من الخادم) ---------- */
const BL_PR = { basic: { m: [9.99, 300], y: [89.99, 2700] }, premium: { m: [19.99, 600], y: [179.99, 5400] } };   /* [الخليج ر.س، اليمن ريال] */
const BL_TOP = [5.99, 250];                                   /* حزمة 50 رسالة نصية */
const BL_RANK = { free: 0, basic: 1, premium: 2 };
const BL_CH = {
  gplay: ['Google Play', 'android'], appstore: ['App Store', 'ios'], card: ['بطاقة بنكية', 'credit_card'],
  jaib: ['محفظة جيب', 'account_balance_wallet'], onecash: ['محفظة ون كاش', 'account_balance_wallet'], mahfathati: ['محفظتي', 'account_balance_wallet'],
};
const BL_AI = { free: 'يكفي للتحقق من المهام', basic: 'تحقق من المهام ومساعدة محدودة', premium: 'كل ما يفعله المساعد' };
const BL_WAL = ['jaib', 'onecash', 'mahfathati'];             /* قائمة محافظ اليمن، وهي طريق الدفع الوحيد فيه (Q-422): في المنتج تُقرأ من الخادم، فتُضاف محفظة بلا تحديث للتطبيق (Q-421) */
const BL_FLOW = ['plans', 'plan-change', 'pay', 'pay-wallet', 'topup', 'trial', 'plan-grace', 'plan-manage'];

/* ---------- الحالة ---------- */
function BL() {
  if (S.bl) return S.bl;
  const paid = S.plan !== 'free' && !S.planSt, ch = blYE() ? BL_WAL[0] : blStore();
  S.bl = {
    yr: 0, cyr: 0, ch: '', end: '', noAuto: 0, tmp: 0, trialUsed: !!S.planSt, trialEnd: '', graceEnd: '', gWhy: S.planSt === 'grace' ? 'end' : '', back: null,
    pend: null, rej: null, down: null, fell: null, ask: [], pay: null, pm: '', pw: { ref: '', err: '' }, busy: '', trSeen: 0,
    rc: paid ? [{ id: 'r1', t: `الخطة ${PLAN[S.plan].n} · شهر`, amt: blAmt(blPrice(S.plan, 0)), ch, st: 'ok', at: '15 نوفمبر · 9:02 ص', ref: '70451288' }] : [],
  };
  return S.bl;
}
const blYE = () => (S.reg || 'YE') === 'YE';
const blStore = () => (S.os === 'ios' ? 'appstore' : 'gplay');
const blNum = n => (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2));
const blAmt = n => `${blNum(n)} ${blYE() ? 'ريال' : 'ر.س'}`;
const blPrice = (k, yr) => BL_PR[k][yr ? 'y' : 'm'][blYE() ? 1 : 0];
const blSave = k => Math.round((BL_PR[k].m[blYE() ? 1 : 0] * 12 - BL_PR[k].y[blYE() ? 1 : 0]) * 100) / 100;
const blDate = k => { const d = tkDt(k); return `${d.getDate()} ${TK_GM[d.getMonth()]}${d.getFullYear() !== 2026 ? ' ' + d.getFullYear() : ''}`; };
const blAddM = (k, n) => { const d = tkDt(k); d.setMonth(d.getMonth() + n); return tkKey(d); };
const blDays = k => Math.round((tkDt(k) - tkDt(TK_TODAY)) / 864e5);
const blLeft = k => { const n = blDays(k); return n <= 0 ? 'تنتهي اليوم' : 'بقي ' + rwDy(n); };
const blMask = r => '••••' + String(r).slice(-4);
const blSt = () => S.planSt || '';
const blChan = () => BL().ch || (blYE() ? BL_WAL[0] : blStore());
const blAuto = () => S.plan !== 'free' && !blSt() && ['gplay', 'appstore'].includes(blChan()) && !BL().noAuto;
const blEnd = () => { const b = BL(); return blSt() === 'trial' ? (b.trialEnd || tkAdd(TK_TODAY, 5)) : blSt() === 'grace' ? (b.graceEnd || tkAdd(TK_TODAY, 3)) : (b.end || '2026-12-15'); };
const blCanV = () => isAdult() && (can('hub.plan.view') || can('billing.manage'));
const blCanM = () => isAdult() && can('billing.manage');
const blMonthEnd = () => { const d = tkDt(TK_TODAY); return tkKey(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
const blNextMonth = () => tkAdd(blMonthEnd(), 1);
/* الرسائل النصية: حصة الخطة أولاً، ثم رصيد التعبئة، ثم ثلاث رسائل احتياطية للاستغاثة وحدها */
const blSms = () => { const q = PLAN[S.plan].sms, top = S.smsTop || 0, used = S.smsOut ? q + top : S.sms.used; return { q, used: Math.min(used, q), left: Math.max(0, q - used), top: Math.max(0, top - Math.max(0, used - q)), em: smsEm() }; };
const blMemN = () => Object.keys(M).length + (S.memX || 0);   /* العائلة التجريبية أربعة؛ memX مقعد خامس مفترض لعرض حالة «العائلة مكتملة» (Q-431) */
const blItem = (w, yr) => (w === 'topup' ? { t: 'حزمة 50 رسالة نصية', n: BL_TOP[blYE() ? 1 : 0], per: '' } : { t: `الخطة ${PLAN[w].n}`, n: blPrice(w, yr), per: yr ? 'سنة' : 'شهر' });
const blMethods = () => (blYE() ? BL_WAL.slice() : [blStore(), 'card']);
const blHow = () => (blYE() ? 'اختر المحفظة' : 'طريقة الدفع');   /* في اليمن القائمة كلها محافظ */
/* بطاقة تسمّي طرق الدفع في سوق العائلة قبل أي اختيار: في أول شاشة الفوترة وفي شاشة الخطط. في اليمن قائمة المحافظ، وجيب أولها. */
const blWays = () => `<div class="card flat blhow"><b>${ic('account_balance_wallet')} ${blYE() ? 'محافظ الدفع' : 'طرق الدفع'}</b><div class="chips">${blMethods().map(id => chip(BL_CH[id][0], 'in', BL_CH[id][1])).join('')}</div></div>`;
const blPm = () => { const b = BL(), L = blMethods(); return L.includes(b.pm) ? b.pm : L[0]; };
const blIsStore = ch => ['gplay', 'appstore', 'card'].includes(ch);
/* ما بقي من فترة مدفوعة عند الترقية يتحول إلى أيام على الخطة الجديدة بقيمته: لا مال يُردّ ولا يوم يضيع (Q-420).
   في متجر المنصة يحسب المتجر ذلك بنظامه، فلا نحسبه نحن. المصدر: الخطة السارية، أو الخطة المدفوعة المحفوظة أثناء التجربة. */
const blDay = (k, yr) => blPrice(k, yr) / (yr ? 365 : 30);
function blCredit(k, yr, ch) {
  const b = BL(), st = blSt(), src = !st && S.plan !== 'free' ? { plan: S.plan, end: blEnd(), cyr: b.cyr } : b.back;
  if (!src || !BL_PR[k] || BL_RANK[k] <= BL_RANK[src.plan] || ['gplay', 'appstore'].includes(ch)) return null;
  const left = Math.max(0, blDays(src.end)); if (!left) return null;
  return { from: src.plan, left, add: Math.floor(left * blDay(src.plan, src.cyr) / blDay(k, yr)) };
}
const blHome = () => { S.sheet = null; S.stack = S.stack.filter(s => !BL_FLOW.includes(s.id)); if (!S.stack.some(s => s.id === 'plan')) S.stack.push({ id: 'plan', a: [] }); };
const blRc = (t, amt, ch, st, ref) => BL().rc.unshift({ id: 'r' + Date.now() + BL().rc.length, t, amt, ch, st, at: 'اليوم · 5:12 م', ref });
const blNo = manage => (!isAdult() ? empty('lock', 'هذه الصفحة للأهل', '') : manage ? empty('lock_person', `يديرها ${M.ahmad.n} وحده`, 'تغيير الخطة والدفع لصاحب العائلة. تستطيعين رؤية الخطة وما استُهلك منها.', btn('الخطة والاستهلاك', 'blToPlan', 'sm sec t48')) : empty('lock_person', 'ليست ضمن صلاحياتك', `رؤية الخطة يمنحها ${M.ahmad.n}.`));
const blOff = t => callout(t || 'يحتاج اتصالاً بالإنترنت. لا يبدأ دفع ولا تتغير خطة دون الخادم.', 'wa', 'cloud_off');
const blSafe = () => `<p class="xs muted c blsafe">${ic('verified_user')} الاستغاثة والموقع والمحادثة والمهام مجانية دائماً، في كل الخطط.</p>`;

/* ---------- تفعيل بعد تحقق الخادم ---------- */
function blDone(w, yr, ch, tmp) {
  const b = BL(), it = blItem(w, yr);
  if (w === 'topup') {
    if (S.smsOut) { S.sms.used = PLAN[S.plan].sms + (S.smsTop || 0); S.smsOut = false; }
    S.smsTop = (S.smsTop || 0) + 50; blRc(it.t, blAmt(it.n), ch, 'ok', b.pend ? b.pend.ref : '');
    audit('شراء حزمة 50 رسالة نصية', 'billing.topup.buy'); b.pay = null; blHome(); toast('أُضيفت 50 رسالة إلى رصيد هذا الشهر'); return;
  }
  const same = S.plan === w && !blSt(), from = same ? blEnd() : TK_TODAY;   /* تجديد مبكر للخطة نفسها: الفترة الجديدة تبدأ بعد الحالية */
  const cr = same ? null : blCredit(w, yr, ch);
  S.plan = w; S.planSt = ''; b.yr = b.cyr = yr ? 1 : 0; b.ch = ch; b.end = tkAdd(blAddM(from, yr ? 12 : 1), cr ? cr.add : 0); b.noAuto = 0; b.down = null; b.fell = null; b.rej = null; b.back = null; b.gWhy = ''; b.tmp = tmp ? 1 : 0; b.pay = null;
  blRc(`${it.t} · ${it.per}`, blAmt(it.n), ch, tmp ? 'tmp' : 'ok', b.pend ? b.pend.ref : '');
  audit(same ? `تجديد الخطة ${PLAN[w].n}` : `تغيير الخطة إلى ${PLAN[w].n}${cr && cr.add ? ` · أُضيف ${rwDy(cr.add)} عمّا بقي من ${PLAN[cr.from].n}` : ''}`, 'billing.manage'); blHome();
  toast(tmp ? `فُعّلت الخطة ${PLAN[w].n} مؤقتاً · نعيد التحقق من الإيصال` : same ? `جُدّدت الخطة ${PLAN[w].n} حتى ${blDate(b.end)}` : `تمت الترقية · الخطة ${PLAN[w].n} فعّالة الآن${cr && cr.add ? ` · أُضيف ${rwDy(cr.add)}` : ''}`);
}
/* العودة إلى المجانية: كتابة واحدة، بلا قفل ولا حذف */
function blFall() {
  const b = BL(), from = S.plan, why = b.gWhy;
  if (b.back) { S.plan = b.back.plan; b.end = b.back.end; b.ch = b.back.ch; b.yr = b.cyr = b.back.cyr; b.back = null; S.planSt = ''; b.fell = { from, to: S.plan, why }; }
  else { S.plan = 'free'; S.planSt = ''; b.end = ''; b.ch = ''; b.fell = { from, to: 'free', why }; }
  b.down = null; b.noAuto = 0; b.gWhy = ''; b.graceEnd = ''; b.trialEnd = '';
  S.audit.unshift({ t: `انتهت الخطة ${PLAN[from].n} · عادت العائلة إلى ${PLAN[S.plan].n}`, w: 'النظام', at: 'الآن', k: 'billing.manage' });
}

/* ---------- أجزاء مشتركة ---------- */
function blCard() {
  const b = BL(), p = PLAN[S.plan], st = blSt(), paid = S.plan !== 'free', e = blDate(blEnd());
  const chipS = st === 'trial' ? chip('تجربة · ' + blLeft(blEnd()), 'go', 'redeem') : st === 'grace' ? chip('مهلة · ' + blLeft(blEnd()), 'wa', 'schedule') : b.tmp ? chip('تفعيل مؤقت', 'wa', 'schedule') : paid && !blAuto() && b.noAuto ? chip('لن تتجدد', '') : chip('فعّالة', 'ok', 'check_circle');
  const line = st === 'trial' ? `تجربة مجانية تنتهي ${e} · لا نخصم شيئاً بعدها`
    : st === 'grace' ? `انتهى الاشتراك · ميزاتك باقية حتى ${e}`
      : !paid ? 'بلا تكلفة وبلا مدة'
        : b.down ? `تنتقل إلى ${PLAN[b.down.to].n} في ${e}`
          : blAuto() ? `تتجدد من نفسها في ${e} · عبر ${BL_CH[blChan()][0]}`
            : b.noAuto ? `أُلغي التجديد · ميزاتك باقية حتى ${e}` : `تنتهي ${e} · لا تتجدد من نفسها`;
  return `<div class="blc plt ${paid ? 'pd' : ''}"><div class="fx sb top"><div><small>خطة العائلة</small><h5>${p.n}</h5></div>${chipS}</div><p>${line}</p>${paid && !st ? `<p class="pr">${blAmt(blPrice(S.plan, b.cyr))} ${b.cyr ? 'في السنة' : 'في الشهر'}</p>` : ''}${wmark(S.plan === 'premium' ? 5 : paid ? 3 : 1)}</div>`;
}
const blMeter = (i, t, n, pct, c, sub, a) => `<${a ? 'button' : 'div'} class="blm" ${a ? `data-a="${a}"` : ''}><span class="lead ${toneOf(i)}">${ic(i)}</span><span class="tx"><span class="hd"><b>${t}</b><span>${n}</span></span>${pct === null ? '' : pbar(pct, c)}${sub ? `<small>${sub}</small>` : ''}</span>${a ? `<span class="chev">${ic('chevron_right')}</span>` : ''}</${a ? 'button' : 'div'}>`;
function blUsage(own) {
  const p = PLAN[S.plan], m = blMemN(), s = blSms(), ai = S.aiUse, full = p.mem !== Infinity && m >= p.mem, part = S.blSt === 'part';
  const sp = s.used / s.q, ap = ai / p.ai, sc = s.left + s.top === 0 ? 'da' : sp >= .8 && !s.top ? 'wa' : '', ac = ap >= 1 ? 'da' : ap >= .8 ? 'wa' : '';
  return `<div class="card blu">
    ${blMeter('groups', 'الأفراد', p.mem === Infinity ? `${m} · بلا حد` : `${m} من ${p.mem}`, p.mem === Infinity ? null : m / p.mem * 100, '', full ? 'العائلة مكتملة على هذه الخطة. أفرادك باقون، ولا يُضاف فرد جديد.' : '', own && full && S.plan !== 'premium' ? 'go:plan-limit:mem' : '')}
    ${blMeter('sms', 'الرسائل النصية', `${s.used} من ${s.q}`, sp * 100, sc, `${s.top ? `رصيد التعبئة ${s.top} · ينتهي ${blDate(blMonthEnd())}<br>` : ''}${s.left + s.top === 0 ? `نفد الرصيد · بقي للاستغاثة ${s.em} من 3 رسائل احتياطية` : 'للاستغاثة 3 رسائل احتياطية بعد نفاد الرصيد' + (s.em < 3 ? ` · الباقي منها ${s.em}` : '')}`, own ? 'go:topup' : '')}
    ${part ? `<div class="blm"><span class="lead in">${ic('wand_stars')}</span><span class="tx"><span class="hd"><b>المساعد الذكي</b></span><small>تعذّر جلب هذا العدّاد الآن. ${btn('أعد المحاولة', 'blRetry', 'txt t48')}</small></span></div>`
      : blMeter('wand_stars', 'المساعد الذكي', S.aiKill ? 'متوقف' : `${blNum(ai)} من ${blNum(p.ai)}`, S.aiKill ? null : ap * 100, ac, S.aiKill ? 'أوقفته بمفتاح الإيقاف. لا يُحسب عليه شيء.' : ap >= 1 ? `نفدت عملياته لهذا الشهر. كل شيء يعمل يدوياً حتى ${blDate(blNextMonth())}.` : BL_AI[S.plan], 'go:ai')}
  </div>`;
}
/* تنبيه 80% (الرسائل والمساعد). الأفراد حالة لا تنبيه: تُقال عند الاكتمال فقط. */
function blWarn(own) {
  const p = PLAN[S.plan], s = blSms(), W = [];
  if (s.left + s.top > 0 && s.used / s.q >= .8 && !s.top) W.push(callout(`<b>استهلكت ${Math.round(s.used / s.q * 100)}% من رسائل هذا الشهر</b><br>بقي ${s.left} ${s.left > 2 && s.left < 11 ? 'رسائل' : 'رسالة'}. الاستغاثة لا تتوقف: لها 3 رسائل احتياطية.${own ? `<div style="margin-top:8px">${btn('عبّئ 50 رسالة', 'go:topup', 'sm t48')}</div>` : ''}`, 'wa', 'sms'));
  if (!S.aiKill && S.blSt !== 'part' && S.aiUse / p.ai >= .8 && S.aiUse < p.ai) W.push(callout(`<b>استهلكت ${Math.round(S.aiUse / p.ai * 100)}% من عمليات المساعد</b><br>عند نفادها يتوقف المساعد بهدوء ويبقى كل شيء يعمل يدوياً.`, 'wa', 'wand_stars'));
  return W.join('');
}
const blPendCard = () => { const d = BL().pend, it = blItem(d.w, d.yr); return `<button class="card blp" data-a="go:pay-wallet:${d.w}:${d.yr ? 1 : ''}:${d.ch}"><span class="lead">${ic('hourglass_top')}</span><span class="tx"><b>دفعة بانتظار التحقق</b><span>${it.t} · ${blAmt(it.n)} · ${BL_CH[d.ch][0]}</span><span>تتغير الخطة بعد التأكيد. لا تدفع مرة ثانية.</span></span>${ic('chevron_right')}</button>`; };
function blBanners(own) {
  const b = BL(), st = blSt(), H = [];
  if (b.pend && own) H.push(blPendCard());
  if (b.rej && own) H.push(callout(`<b>لم تتأكد دفعتك</b><br>${BL_CH[b.rej.ch][0]} لم تؤكد وصول ${blAmt(blItem(b.rej.w, b.rej.yr).n)}، فلم تتغير خطتك. إن خُصم المبلغ منك فراجع المحفظة.<div class="fx" style="margin-top:8px;gap:8px">${btn('حاول مجدداً', b.rej.w === 'topup' ? 'go:topup' : 'go:plan-change:' + b.rej.w, 'sm t48')}${btn('فهمت', 'blRejOk', 'sm sec t48')}</div>`, 'da', 'error'));
  if (st === 'grace') H.push(`<button class="card blp wa" data-a="go:plan-grace"><span class="lead">${ic('schedule')}</span><span class="tx"><b>${blLeft(blEnd())} من المهلة</b><span>بعدها تعود العائلة إلى ${b.back ? PLAN[b.back.plan].n : 'المجانية'}، بلا قفل ولا حذف.</span></span>${ic('chevron_right')}</button>`);
  if (b.fell) H.push(`<button class="card blp" data-a="go:plan-grace"><span class="lead">${ic('info')}</span><span class="tx"><b>عادت العائلة إلى ${PLAN[b.fell.to].n}</b><span>لم يُقفل شيء ولم تُحذف بيانات. اعرف ما تغيّر.</span></span>${ic('chevron_right')}</button>`);
  if (b.tmp) H.push(callout('<b>تفعيل مؤقت 24 ساعة</b><br>المتجر لم يردّ علينا عند الدفع، ففعّلنا خطتك ونعيد التحقق من أنفسنا. إن لم يثبت الدفع تعود خطتك السابقة.', 'wa', 'schedule'));
  if (own) b.ask.forEach((q, i) => H.push(callout(`<b>${M[q.who].n} ${vb(M[q.who], 'يطلب', 'تطلب')} ترقية الخطة</b><br>${{ mem: 'العائلة مكتملة ولا يُضاف فرد جديد.', sms: 'نفد رصيد الرسائل النصية.', ai: 'نفدت عمليات المساعد لهذا الشهر.' }[q.why]}<div style="margin-top:8px">${btn('تمّ', 'blAskOk:' + i, 'sm sec t48')}</div>`, '', 'person')));
  return H.join('');
}
function blAtt() {
  if (!S.bl && !S.planSt) return [];
  const b = BL(), A = [];
  if (!blCanM()) return A;
  if (blSt() === 'trial' && blDays(blEnd()) <= 2 && b.trSeen !== blDays(blEnd()) + 1) { const d = blDays(blEnd()), to = b.back ? PLAN[b.back.plan].n : '';
    A.push({ k: 'bl:trial', p: 2, c: 'var(--gold)', i: 'redeem', t: d <= 0 ? 'تجربة المميزة تنتهي اليوم' : d === 1 ? 'تجربة المميزة تنتهي غداً' : 'تجربة المميزة تنتهي بعد يومين', s: to ? `بعدها تعود العائلة إلى ${to} · لا نخصم شيئاً` : 'بعدها 3 أيام مهلة ثم المجانية · لا نخصم شيئاً', b: [['اشترك في المميزة', 'go:plan-change:premium', 'ton'], ['لاحقاً', 'blTrSeen', 'sec']] }); }
  if (blSt() === 'grace') A.push({ k: 'bl:grace', p: 1, c: 'var(--warning)', i: 'schedule', t: `انتهى اشتراكك · ${blLeft(blEnd())} من المهلة`, s: `بعدها تعود العائلة إلى ${b.back ? PLAN[b.back.plan].n : 'المجانية'} بلا قفل ولا حذف`, b: [['عرض', 'go:plan-grace', 'ton']] });
  if (b.rej) A.push({ k: 'bl:rej', p: 2, c: 'var(--danger)', i: 'error', t: 'لم تتأكد دفعتك', s: 'لم تتغير خطتك', b: [['التفاصيل', 'go:plan', 'ton'], ['فهمت', 'blRejOk', 'sec']] });
  if (b.fell) A.push({ k: 'bl:fell', p: 2, c: 'var(--info)', i: 'info', t: `عادت العائلة إلى ${PLAN[b.fell.to].n}`, s: 'لم يُقفل شيء ولم تُحذف بيانات', b: [['ما الذي تغيّر؟', 'go:plan-grace', 'ton'], ['فهمت', 'blFellOk', 'sec']] });
  b.ask.forEach((q, i) => A.push({ k: 'bl:ask:' + i, p: 3, c: 'var(--gold)', i: 'workspace_premium', t: `${M[q.who].n} ${vb(M[q.who], 'يطلب', 'تطلب')} ترقية الخطة`, s: { mem: 'العائلة مكتملة', sms: 'نفد رصيد الرسائل النصية', ai: 'نفدت عمليات المساعد' }[q.why], b: [['اعرض الخطط', 'go:plans', 'ton'], ['تمّ', 'blAskOk:' + i, 'sec']] }));
  return A;
}
/* S04-10 بطاقة بلوغ الحد: سبب واضح، إجراء واحد، ولا حظر قاسٍ. البالغ بلا إدارة الاشتراك يطلب من صاحب العائلة. */
const BL_LIM = {
  mem: ['groups', () => `بلغت حدّ الخطة ${PLAN[S.plan].n}`, () => `خطتك تتسع لـ${PLAN[S.plan].mem} أفراد وعائلتك مكتملة. أفرادك الحاليون يبقون كما هم.`],
  sms: ['sms', () => 'نفد رصيد الرسائل النصية', () => `أُرسلت رسائل هذا الشهر كلها (${PLAN[S.plan].sms}). الاستغاثة لا تتوقف: لها ${smsEm()} من 3 رسائل احتياطية، ويتجدد الرصيد في ${blDate(blNextMonth())}.`],
  role: ['tune', () => (roleOver() ? 'أدوارك المخصصة أكثر من حد الخطة' : roleMax() ? 'بلغت حدّ الأدوار المخصصة' : 'الأدوار المخصصة في الخطط المدفوعة'), () => (roleOver() ? `خطتك ${PLAN[S.plan].n} ${roleMax() ? `تتسع لـ${roleMax()} أدوار مخصصة` : 'بلا أدوار مخصصة'} وعندك ${roleCust().length}. أدوارك تبقى تعمل كما هي وتستطيع حذفها، ولا تُعدَّل ولا يُضاف إليها.` : roleMax() ? `خطتك ${PLAN[S.plan].n} تتسع لـ${roleMax()} أدوار مخصصة. احذف دوراً لتضيف غيره${S.plan === 'premium' ? '' : '، أو انتقل إلى خطة أوسع'}.` : 'الأدوار الثلاثة الجاهزة لك دائماً وتعدّلها كما تشاء. الدور المخصص باسمك وصلاحياتك يبدأ من الخطة الأساسية.')],
  ai: ['wand_stars', () => 'نفدت عمليات المساعد لهذا الشهر', () => `المساعد توقف بهدوء، وكل شيء يعمل يدوياً: كل تسليم مهمة يأتيك أنت. يتجدد العدّ في ${blDate(blNextMonth())}.`],
};
function blLimit(why, sheet) {
  const L = BL_LIM[why] || BL_LIM.mem, own = blCanM(), top = S.plan === 'premium', asked = BL().ask.some(q => q.who === me().id && q.why === why);
  const acts = own
    ? (why === 'sms' ? btn('عبّئ 50 رسالة', 'go:topup', '', 'sms') + (top ? '' : `<div class="gap"></div>${btn('اعرض الخطط', 'go:plans', 'sec')}`) : top ? '' : btn('اعرض الخطط', 'go:plans', '', 'arrow_circle_up'))
    : asked ? callout(`طلبتِ ذلك من ${M.ahmad.n} اليوم. القرار له.`, 'nt', 'schedule') : btn(`اطلب من ${M.ahmad.n}`, 'blAsk:' + why, '', 'send');
  return `<div class="bigic gd">${ic(L[0])}</div><p class="ttl md">${L[1]()}</p><p class="sub">${L[2]()}</p>${top && why !== 'sms' ? '' : `<div class="c" style="margin:-4px 0 12px">${avail('requires_upgrade')}</div>`}${own ? '' : `<p class="sm muted c" style="margin:0 0 12px">تغيير الخطة والدفع ل${M.ahmad.n} وحده.</p>`}${acts}${sheet ? `<div class="c" style="margin-top:8px">${btn('لاحقاً', 'close', 'txt t48')}</div>` : ''}`;
}

/* ---------- S04-01 الخطة والاستهلاك ---------- */
surface('plan', {
  t: 'الخطة والفوترة', sys: 'S1-04', p: 'adult', req: '04:1,2,9,11,15,16,17,19,21 09:12,13',
  note: 'S04-01. الخطة وحالتها ونهاية فترتها، ثم ما استُهلك هذا الشهر من الأفراد والرسائل النصية وعمليات المساعد، ثم الأفعال. الرسائل: حصة الخطة ثم رصيد التعبئة ثم ثلاث رسائل احتياطية للاستغاثة وحدها. تنبيه 80% للرسائل والمساعد؛ الأفراد تُذكر عند الاكتمال فقط. البالغ غير المالك يرى ولا يغيّر. دون اتصال تُعرض آخر نسخة محفوظة بعمرها. لا شيء من هذا يظهر لطفل أو مراهق. جرّب من لوحة الضبط: السوق، الخطة، حالة الاشتراك، وأحداث الدفع.',
  r() {
    if (!blCanV()) return blNo();
    const b = BL(), own = blCanM(), st = blSt(), paid = S.plan !== 'free';
    if (S.blSt === 'load') return `<div class="blc"><div class="skel" style="width:40%"></div><div class="skel" style="width:70%;height:22px"></div><div class="skel" style="width:55%"></div></div><div class="card"><div class="skel"></div><div class="skel" style="width:80%"></div><div class="skel"></div><div class="skel" style="width:60%"></div></div>`;
    if (S.blSt === 'err') return `${callout(`<b>تعذّر جلب خطتك الآن</b><br>لم يتغير شيء في اشتراكك. المشكلة في الاتصال بالخادم.<div style="margin-top:8px">${btn('أعد المحاولة', 'blRetry', 'sm t48')}</div>`, 'da', 'error')}${blSafe()}`;
    return `${offline() ? `<p class="xs muted blage">${age(0)}<span>نسخة محفوظة على هاتفك · قد تكون الأرقام تغيّرت</span></p>` : ''}
    ${blCard()}${blBanners(own)}
    ${sec(`استهلاك ${TK_GM[tkDt(TK_TODAY).getMonth()]}`)}${blUsage(own)}<p class="xs muted" style="margin:-4px 4px 12px">يبدأ العدّ من جديد في ${blDate(blNextMonth())}. رصيد التعبئة لا ينتقل للشهر التالي.</p>
    ${blWarn(own)}
    ${own && !b.trialUsed && S.plan !== 'premium' && !st ? `<button class="card bltr" data-a="go:trial"><span class="lead">${ic('redeem')}</span><span class="tx"><b>جرّب المميزة 7 أيام مجاناً</b><span>بلا وسيلة دفع · مرة واحدة للعائلة</span></span>${ic('chevron_right')}</button>` : ''}
    ${own ? `${blWays()}${btn(st === 'grace' ? 'جدّد أو اختر خطة' : 'اعرض الخطط', st === 'grace' ? 'go:plan-grace' : 'go:plans', '', 'workspace_premium')}<div class="gap"></div>
      ${list(row('sms', 'عبّئ الرسائل النصية', 'حزمة 50 رسالة لهذا الشهر', { v: blAmt(BL_TOP[blYE() ? 1 : 0]), a: 'go:topup' }), row('tune', 'إدارة الاشتراك', paid && !st ? (blAuto() ? 'التجديد التلقائي يعمل' : 'لا يتجدد من نفسه') : 'التجديد والاستعادة', { a: 'go:plan-manage' }), row('receipt_long', 'سجل المدفوعات', b.rc.length ? `${b.rc.length} ${b.rc.length === 1 ? 'دفعة' : b.rc.length === 2 ? 'دفعتان' : 'دفعات'}` : 'لا مدفوعات بعد', { a: 'go:receipts' }))}`
      : `<p class="sm muted" style="margin:8px 4px">${ic('lock')} تغيير الخطة والدفع ل${M.ahmad.n} وحده.</p>`}
    ${blSafe()}`;
  },
});

/* ---------- S04-02 الخطط ---------- */
surface('plans', {
  t: 'الخطط', sys: 'S1-04', p: 'owner', req: '04:1,3,4,12,22',
  note: 'S04-02. ما تشترك فيه كل الخطط يُقال مرة واحدة في الأعلى، والبطاقات تعرض ما يختلف فقط: الأفراد والرسائل النصية وعمليات المساعد والسعر. الأسعار بعملة سوق العائلة وحدها (اليمن بالريال، الخليج بالريال السعودي). المجانية تمرّ بتأكيد التخفيض دائماً. لا زر يشتري من هنا: كل اختيار يذهب إلى شاشة التأكيد.',
  r() {
    if (!blCanM()) return blNo(1);
    const b = BL(), yr = !!b.yr, cur = S.plan, st = blSt(), e = blDate(blEnd());
    const F = k => { const p = PLAN[k]; return `<ul><li>${ic('groups')}<span>${p.mem === Infinity ? '<b>أفراد بلا حد</b>' : `حتى <b>${p.mem}</b> أفراد`}</span></li><li>${ic('sms')}<span><b>${p.sms}</b> رسالة نصية في الشهر</span></li><li>${ic('wand_stars')}<span><b>${blNum(p.ai)}</b> عملية للمساعد في الشهر<small>${BL_AI[k]}</small></span></li><li>${ic('tune')}<span>${p.roles ? `<b>${p.roles}</b> أدوار مخصصة` : 'الأدوار الثلاثة الجاهزة'}</span></li></ul>`; };
    const P = k => (k === 'free' ? `<div class="pr">مجاناً <small>دائماً</small></div>` : `<div class="pr">${blNum(blPrice(k, yr))} <small>${blYE() ? 'ريال' : 'ر.س'} ${yr ? 'في السنة' : 'في الشهر'}</small></div>${yr ? `<div class="sv">توفّر ${blAmt(blSave(k))} عن الدفع شهراً بشهر</div>` : ''}`);
    const C = k => {
      const pend = b.pend && b.pend.w === k, down = b.down && b.down.to === k;
      if (pend) return chip('دفعة بانتظار التحقق', 'wa', 'hourglass_top');
      if (down) return chip('تبدأ ' + e, 'in', 'event');
      if (k === cur) return st === 'trial' ? chip('تجربتك الآن', 'go', 'redeem') : st === 'grace' ? chip('انتهت · في المهلة', 'wa', 'schedule') : chip('خطتك الحالية', 'ok', 'check');
      return '';
    };
    const A = k => {
      if (b.pend && b.pend.w === k) return btn('تابع الدفعة', `go:pay-wallet:${k}:${b.pend.yr ? 1 : ''}:${b.pend.ch}`, 'sm sec t48');
      if (b.down && b.down.to === k) return btn('تراجع عن التخفيض', 'blUndown', 'sm sec t48');
      if (k === cur) return st === 'trial' ? btn('اشترك في المميزة', 'go:plan-change:' + k, 'sm t48') : st === 'grace' ? btn('جدّد ' + PLAN[k].n, 'go:plan-change:' + k, 'sm t48') : '';
      if (k === 'free') return st ? `<p class="xs muted" style="margin:8px 0 0">تعود إليها العائلة من نفسها بعد ${st === 'trial' ? 'التجربة والمهلة' : 'المهلة'}.</p>` : btn('انتقل إلى المجانية', 'go:plan-change:free', 'sm sec t48');
      return btn('اختر ' + PLAN[k].n, 'go:plan-change:' + k, 'sm t48') + (k === 'premium' && !b.trialUsed && !st ? btn('أو جرّبها 7 أيام مجاناً', 'go:trial', 'txt t48') : '');
    };
    return `${offline() ? `<p class="xs muted blage">${age(0)}<span>قائمة محفوظة على هاتفك · الاختيار يحتاج اتصالاً</span></p>` : ''}
    <div class="blseg">${seg([['', 'شهري'], ['1', 'سنوي · أوفر']], yr ? '1' : '', 'blYr')}</div>
    <div class="card flat blall"><b>في كل الخطط، مجاناً ودائماً</b><div class="chips">${[['emergency_home', 'الاستغاثة'], ['location_on', 'الموقع'], ['forum', 'المحادثة'], ['task_alt', 'المهام']].map(([i, t]) => chip(t, 'ok', i)).join('')}</div><div class="xs muted">وسجل المواقع 7 أيام، والتحقق من المهام بالمساعد.</div></div>
    ${blWays()}
    ${['free', 'basic', 'premium'].map(k => `<div class="plan ${cur === k ? 'cur' : k === 'premium' ? 'best' : ''}"><div class="fx sb"><h5>${PLAN[k].n}</h5>${C(k)}</div>${P(k)}${F(k)}<div class="pa">${A(k)}</div></div>`).join('')}
    <p class="xs muted c">الأسعار ${blYE() ? 'بالريال اليمني' : 'بالريال السعودي'}. اشتراك واحد يغطي كل أجهزة العائلة.</p>`;
  },
});

/* ---------- S04-03 تأكيد تغيير الخطة ---------- */
const blKind = k => { const st = blSt(), cur = S.plan; return k === cur ? (st === 'trial' ? 'sub' : 'renew') : !st && BL_RANK[k] < BL_RANK[cur] ? 'down' : st && k === 'free' ? 'fall' : 'up'; };
surface('plan-change', {
  t: k => ({ down: 'تأكيد التخفيض', fall: 'العودة إلى المجانية', renew: 'تجديد الخطة', sub: 'الاشتراك في المميزة', up: 'تأكيد الترقية' }[blKind(PLAN[k] ? k : 'basic')]), sys: 'S1-04', p: 'owner', a: ['basic'], req: '04:3,4,5,6,20',
  note: 'S04-03. من أي خطة إلى أي خطة، وماذا يحدث ومتى، بكلام صريح قبل أي دفع. الترقية تبدأ فور تحقق الخادم من الدفع؛ التخفيض يبدأ بنهاية الفترة المدفوعة ولا يُستردّ شيء (Q-420). ما بقي من فترة مدفوعة عند الترقية يتحول إلى أيام على الخطة الأعلى بقيمته، إلا في متجر المنصة فيحسبه المتجر بنظامه. طريقة الدفع تُختار هنا من طرق سوق العائلة. زر واحد للتأكيد، وبعده الرقم السري. دون اتصال الزر معطّل بسببه.',
  r(k) {
    if (!blCanM()) return blNo(1);
    k = PLAN[k] ? k : 'basic'; if (k === 'free' && S.plan === 'free') return empty('check_circle', 'أنت على المجانية', 'بلا تكلفة وبلا مدة.', btn('اعرض الخطط', 'go:plans', 'sm sec t48'));
    const b = BL(), kind = blKind(k), cur = S.plan, yr = !!b.yr, e = blDate(blEnd()), m = blMemN(), pm = blPm(), paidNow = cur !== 'free' && !blSt();
    const ft = `<div class="blft"><div><small>${kind === 'renew' ? 'خطتك' : 'من'}</small><b>${PLAN[cur].n}</b>${blSt() === 'trial' ? '<span>تجربة</span>' : blSt() === 'grace' ? '<span>في المهلة</span>' : ''}</div>${ic('arrow_back')}<div class="to"><small>${kind === 'renew' ? 'تُجدَّد' : 'إلى'}</small><b>${PLAN[k].n}</b></div></div>`;
    const li = (i, t) => `<li>${ic(i)}<span>${t}</span></li>`;
    if (kind === 'down' || kind === 'fall') {
      const p = PLAN[k], over = p.mem !== Infinity && m > p.mem;
      return `${ft}${sec('ماذا يحدث')}<ul class="blwh">
        ${kind === 'fall' ? li('today', `تعود العائلة إلى المجانية الآن، ولا تنتظر نهاية ${blSt() === 'trial' ? 'التجربة' : 'المهلة'}.`) : li('event', `تبقى على ${PLAN[cur].n} حتى <b>${e}</b>، ثم تبدأ ${p.n}.`)}
        ${kind === 'fall' ? '' : li('money_off', 'لا يُستردّ شيء مما دفعته عن الفترة الحالية.')}
        ${li('verified_user', 'لا يُقفل شيء ولا تُحذف بيانات.')}
        ${li('groups', over ? `يبقى أفرادك كلهم (${m}). لا يُضاف فرد جديد حتى ينقص العدد عن ${p.mem}.` : `يبقى أفرادك كلهم (${m}).`)}
        ${li('sms', `الرسائل النصية تصير ${p.sms} في الشهر، وعمليات المساعد ${blNum(p.ai)}.`)}
        ${k !== 'free' ? li('payments', `عند بدء ${p.n} تدفع سعرها: ${blAmt(blPrice(k, 0))} في الشهر.`) : ''}
      </ul>${offline() ? blOff() : ''}${btn(kind === 'fall' ? 'عُد إلى المجانية الآن' : 'خفّض بنهاية الفترة', 'plGo:' + k, offline() ? 'dis" disabled="' : '')}<div class="gap"></div>${btn('إلغاء', 'back', 'sec')}`;
    }
    const n = blPrice(k, yr), cr = kind === 'renew' ? null : blCredit(k, yr, pm), crSrc = paidNow ? cur : b.back ? b.back.plan : '', end = blDate(tkAdd(blAddM(kind === 'renew' && paidNow ? blEnd() : TK_TODAY, yr ? 12 : 1), cr ? cr.add : 0)), store = blIsStore(pm);
    return `${ft}<div class="blseg">${seg([['', `شهر · ${blAmt(blPrice(k, 0))}`], ['1', `سنة · ${blAmt(blPrice(k, 1))}`]], yr ? '1' : '', 'blYr')}</div>
    ${sec('ماذا يحدث')}<ul class="blwh">
      ${kind === 'renew' && paidNow ? li('event', `تبدأ الفترة الجديدة بعد نهاية الحالية في ${e}، وتمتد حتى <b>${end}</b>.`) : li('bolt', `تبدأ ${PLAN[k].n} فور تحققنا من دفعك، وتمتد حتى <b>${end}</b>.`)}
      ${cr ? li('more_time', cr.add ? `ما بقي من ${PLAN[cr.from].n} (${rwDy(cr.left)}) لا يضيع: يتحول إلى <b>${rwDy(cr.add)}</b> على ${PLAN[k].n}، وهي محسوبة في التاريخ أعلاه. لا يُردّ مال.` : `ما بقي من ${PLAN[cr.from].n} (${rwDy(cr.left)}) قيمته أقل من يوم على ${PLAN[k].n}، فلا يُضاف شيء.`) : crSrc && crSrc !== 'free' && BL_RANK[k] > BL_RANK[crSrc] && pm === blStore() ? li('info', `ما بقي من ${PLAN[crSrc].n} يحسبه ${BL_CH[pm][0]} بنظامه عند الترقية، ويعرضه لك قبل أن تدفع.`) : ''}
      ${blSt() === 'grace' ? li('check_circle', 'تنتهي المهلة فور التفعيل.') : ''}
      ${li(pm === blStore() ? 'sync' : 'event_busy', pm === blStore() ? `تتجدد من نفسها كل ${yr ? 'سنة' : 'شهر'} عبر ${BL_CH[pm][0]} حتى تلغيها.` : 'لا تتجدد من نفسها: تجدّدها أنت قبل نهايتها.')}
    </ul>
    ${sec(blHow())}${blMethods().map(id => `<button class="opt" aria-pressed="${pm === id}" data-a="blPm:${id}">${ic(BL_CH[id][1])}<span><b>${BL_CH[id][0]}</b><span>${{ gplay: 'من حسابك في المتجر', appstore: 'من حسابك في المتجر', card: 'تُكتب بياناتها في صفحة الدفع، لا في التطبيق', jaib: 'تدفع من المحفظة ثم تكتب الرقم المرجعي', onecash: 'تدفع من المحفظة ثم تكتب الرقم المرجعي', mahfathati: 'تدفع من المحفظة ثم تكتب الرقم المرجعي' }[id]}</span></span>${ic(pm === id ? 'check_circle-fill' : 'radio_button_unchecked')}</button>`).join('')}
    ${offline() ? blOff() : b.pend ? callout('عندك دفعة بانتظار التحقق. انتظر نتيجتها قبل أن تبدأ دفعاً آخر.', 'wa', 'hourglass_top') : ''}
    ${btn(`${kind === 'renew' ? 'جدّد الآن' : kind === 'sub' ? 'اشترك الآن' : 'رقِّ الآن'} · ${blAmt(n)}`, 'plGo:' + k, offline() || b.pend ? 'dis" disabled="' : '', 'lock')}<div class="gap"></div>${btn('إلغاء', 'back', 'sec')}
    <p class="xs muted c" style="margin-top:12px">${store ? 'تتغير الخطة بعد أن يتحقق خادمنا من الدفع، لا قبله.' : 'تتغير الخطة بعد أن تؤكد المحفظة وصول المبلغ، لا قبله.'}</p>`;
  },
});

/* ---------- S04-04 الدفع عبر المتجر أو البطاقة ---------- */
let blT1, blT2;
surface('pay', {
  t: 'الدفع', sys: 'S1-04', p: 'owner', a: ['premium', '', 'gplay'], req: '04:5,7,10',
  note: 'S04-04. الخليج: متجر المنصة (Google Play على Android وApp Store على iOS) أو بطاقة في صفحة دفع خارج التطبيق. بعد الدفع يتحقق الخادم من الإيصال؛ ولا يُعتد بأي تأكيد من الهاتف. ما يُجرَّب من لوحة الضبط: بطاقة مرفوضة، إيصال لم يُقبل، متجر لا يردّ (تفعيل مؤقت 24 ساعة). ورقة المتجر نفسها من النظام لا من تصميمنا.',
  r(w, yr, ch) {
    if (!blCanM()) return blNo(1);
    if (blYE()) return SC['pay-wallet'].r(w, yr, ch);     /* سوق اليمن لا متجر فيه: الشاشة نفسها تعرض الدفع بالمحفظة */
    w = w === 'topup' || BL_PR[w] ? w : 'premium'; ch = blIsStore(ch) ? ch : blStore(); const b = BL(), it = blItem(w, yr), st = (b.pay || {}).st || '', nm = BL_CH[ch][0];
    const sum = `<div class="card blsum"><div><small>${it.per ? 'اشتراك ' + it.per : 'شراء مرة واحدة'}</small><b>${it.t}</b></div><div class="am">${blNum(it.n)}<small>${blYE() ? 'ريال' : 'ر.س'}</small></div></div><div class="blvia">${ic(BL_CH[ch][1])}<span>عبر ${nm}</span>${st === 'verify' ? '' : btn('غيّر', 'back', 'txt t48')}</div>`;
    if (st === 'verify') return `${sum}<div class="blw" role="status"><i></i><b>نتحقق من الإيصال…</b><span>${b.pay.long ? 'ما زلنا نتحقق مع المتجر. قد يأخذ لحظات. لا تدفع مرة ثانية ولا تغلق الشاشة.' : 'لحظات ويظهر لك الناتج.'}</span></div>`;
    if (st === 'fail') return `${sum}${callout(`<b>تعذّر الدفع</b><br>${ch === 'card' ? 'البطاقة لم تُقبل.' : 'المتجر لم يُتمّ العملية.'} لم يُخصم شيء، و${w === 'topup' ? 'رصيدك كما هو' : 'اشتراكك الحالي يبقى حتى نهاية فترته'}.`, 'da', 'error')}${btn('حاول مجدداً', `payOpen:${w}:${yr || ''}:${ch}`)}<div class="gap"></div>${btn('غيّر طريقة الدفع', 'back', 'sec')}`;
    if (st === 'bad') return `${sum}${callout(`<b>لم نستطع قبول إيصال هذا الشراء</b><br>لم ${w === 'topup' ? 'يُضف رصيد' : 'تتغير خطتك'}. سجّلنا المحاولة في سجل المدفوعات. إن خُصم منك مبلغ فراجع ${nm}.`, 'da', 'gpp_maybe')}${btn('سجل المدفوعات', 'go:receipts', 'sec', 'receipt_long')}<div class="gap"></div>${btn('حاول مجدداً', `payOpen:${w}:${yr || ''}:${ch}`, 'txt t48')}`;
    return `${sum}${offline() ? blOff('الدفع يحتاج اتصالاً بالإنترنت.') : ''}
    ${btn(ch === 'card' ? 'أكمل في صفحة الدفع' : `ادفع عبر ${nm}`, `payOpen:${w}:${yr || ''}:${ch}`, offline() ? 'dis" disabled="' : '', ch === 'card' ? 'open_in_new' : 'lock')}
    <p class="xs muted c" style="margin-top:12px">${ch === 'card' ? 'تُفتح صفحة الدفع خارج التطبيق، وتكتب بيانات البطاقة فيها. ' : ''}${w === 'topup' ? 'يُضاف الرصيد' : 'تتغير الخطة'} بعد أن يتحقق خادمنا من الدفع، لا قبله.</p>`;
  },
});
surface('store-buy', {
  kind: 'sheet', t: 'نافذة الدفع', sys: 'S1-04', p: 'owner', a: ['premium', '', 'gplay'], req: '04:5',
  note: 'بديل عن ورقة الشراء التي يعرضها المتجر أو صفحة الدفع بالبطاقة. شكلها ونصها من المتجر أو مزوّد البطاقة، لا من تصميمنا؛ وُضعت هنا لتكتمل الرحلة فقط.',
  r(w, yr, ch) { w = w === 'topup' || BL_PR[w] ? w : 'premium'; ch = blIsStore(ch) ? ch : blStore(); const it = blItem(w, yr), card = ch === 'card';
    return `<div class="osb"><div class="oh">${ic(BL_CH[ch][1])}<b>${card ? 'صفحة الدفع' : BL_CH[ch][0]}</b>${chip('من خارج التطبيق', 'ol')}</div><div class="oi"><span class="ap">${ic('family_home')}</span><span><b>عائلتي · ${it.t}</b><small>${it.per ? (card ? `دفعة واحدة عن ${it.per}` : `اشتراك يتجدد كل ${it.per} حتى تلغيه`) : 'شراء مرة واحدة'}</small></span><b class="pp">${blAmt(it.n)}</b></div>${btn(card ? `ادفع ${blAmt(it.n)}` : it.per ? 'اشترك' : 'اشترِ', `payBuy:${w}:${yr || ''}:${ch}`, 'ok')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt t48')}</div>`; },
});

/* ---------- S04-05 الدفع بالمحفظة (اليمن) ---------- */
surface('pay-wallet', {
  t: 'الدفع', sys: 'S1-04', p: 'owner', a: ['basic', '', 'jaib'], req: '04:6,7,10',
  note: 'S04-05. اليمن: الدفع بالمحافظ وحدها — محفظة جيب، ون كاش، محفظتي؛ لا قسائم (Q-421) ولا دفع عند وكيل (Q-422). خطوتان: تدفع من المحفظة خارج التطبيق، ثم تكتب الرقم المرجعي كما وصلك. بعدها «بانتظار التحقق»: لا تتغير الخطة حتى تؤكد المحفظة وصول المبلغ. الرقم المكرر يُرفض بجانب الحقل. طريقة تحويل المبلغ إلى المحفظة تُكتب عند التعاقد، ولم يُخترع لها شيء هنا. من لوحة الضبط: «أكّدت الدفعة» و«رفضت الدفعة».',
  r(w, yr, ch) {
    if (!blCanM()) return blNo(1);
    if (!blYE()) return SC.pay.r(w, yr, ch);              /* سوق الخليج لا محافظ يمنية فيه */
    w = w === 'topup' || BL_PR[w] ? w : 'basic'; ch = BL_WAL.includes(ch) ? ch : BL_WAL[0]; const b = BL(), d = b.pend;
    if (b.wErr) { return `<div class="bigic da">${ic('wifi_off')}</div><p class="ttl md">تعذّر التحقق من المحفظة</p><p class="sub">لم يصل رد من بوابة ${BL_CH[ch][0]} بسبب انقطاع الاتصال. لم يُخصم أي مبلغ إضافي.</p>${btn('إعادة التحقق دون خصم مكرر', 'blWRetry', '', 'refresh')}${btn('تغيير طريقة الدفع', 'blWBack', 'sec')}`; }
    if (d) { const it = blItem(d.w, d.yr);
      return `<div class="bigic wa">${ic('hourglass_top')}</div><p class="ttl md">دفعتك بانتظار التحقق</p><p class="sub">${d.w === 'topup' ? 'نضيف الرصيد' : `نفعّل ${it.t}`} فور أن تؤكد ${BL_CH[d.ch][0]} وصول المبلغ، ويصلك إشعار. ${d.w === 'topup' ? 'رصيدك' : 'خطتك'} الآن كما ${d.w === 'topup' ? 'هو' : 'هي'}.</p>
      <dl class="blkv"><dt>ما دفعت له</dt><dd>${it.t}${it.per ? ' · ' + it.per : ''}</dd><dt>المبلغ</dt><dd>${blAmt(it.n)}</dd><dt>الطريقة</dt><dd>${BL_CH[d.ch][0]}</dd><dt>الرقم المرجعي</dt><dd><span class="ltr">${blMask(d.ref)}</span></dd><dt>سُجّلت</dt><dd>${d.at}</dd></dl>
      ${callout('لا تدفع مرة ثانية. إن لم يثبت الدفع أخبرناك، ولا تتغير خطتك.', 'nt', 'info')}${btn('تمّ', 'blToPlan')}`; }
    const it = blItem(w, yr), e = b.pw.err;
    return `<div class="card blsum"><div><small>${it.per ? 'عن ' + it.per : 'شراء مرة واحدة'}</small><b>${it.t}</b></div><div class="am">${blNum(it.n)}<small>ريال</small></div></div>
    <div class="blstep"><i>1</i><div><b>ادفع المبلغ من ${BL_CH[ch][0]}</b><span>حوّل ${blAmt(it.n)} إلى حساب «عائلتي» من تطبيق المحفظة.</span><div class="callout nt" style="margin:8px 0 0">${ic('edit_note')}<div>طريقة التحويل (رقم الحساب أو الرمز) تُكتب هنا عند التعاقد مع المحفظة.</div></div></div></div>
    <div class="blstep"><i>2</i><div><b>اكتب الرقم المرجعي</b><span>كما وصلك في إشعار المحفظة بعد الدفع، دون تغيير.</span>
      <label class="fld ${e ? 'err' : ''}" style="margin:12px 0 0"><span class="sr">الرقم المرجعي</span><input id="pwr" class="mono" dir="ltr" inputmode="text" autocomplete="off" placeholder="مثال: 70451300" value="${b.pw.ref}">${e === 'empty' ? '<small>اكتب الرقم المرجعي أولاً.</small>' : e === 'dup' ? '<small>هذا الرقم المرجعي مستخدم من قبل. تأكد من رقم الدفعة الجديدة.</small>' : '<small>جرّب: أي رقم · والرقم 70451288 مستخدم من قبل</small>'}</label></div></div>
    ${offline() ? blOff('تأكيد الدفع يحتاج اتصالاً بالإنترنت.') : ''}${btn('أكّد الدفع', `pwGo:${w}:${yr || ''}:${ch}`, offline() ? 'dis" disabled="' : '')}
    <p class="xs muted c" style="margin-top:12px">${w === 'topup' ? 'يُضاف الرصيد' : 'تتغير الخطة'} بعد أن تؤكد المحفظة وصول المبلغ، لا قبله.</p>`;
  },
});


/* ---------- S04-07 تعبئة الرسائل النصية ---------- */
surface('topup', {
  t: 'تعبئة الرسائل النصية', sys: 'S1-04', p: 'owner', req: '04:10,11,19 07:17',
  note: 'S04-07. حزمة واحدة: 50 رسالة نصية بسعر سوق العائلة. تُضاف إلى رصيد الشهر الحالي وتنتهي بنهايته ولا تنتقل، فيُقال كم بقي من الشهر قبل الشراء. الحصة والتعبئة ورسائل الاستغاثة الاحتياطية ثلاثة أرقام منفصلة. في اليمن يُضاف الرصيد بعد تأكيد المحفظة لا فور الضغط.',
  r() {
    if (!blCanM()) return blNo(1);
    const b = BL(), s = blSms(), left = blDays(blMonthEnd()) + 1, pm = blPm(), n = BL_TOP[blYE() ? 1 : 0];
    return `<div class="card blbal"><div class="g3"><div><b>${s.left}</b><span>باقٍ من ${s.q}<br>حصة الخطة</span></div><div><b>${s.top}</b><span>رصيد<br>التعبئة</span></div><div><b>${s.em}</b><span>احتياطي<br>الاستغاثة</span></div></div>${s.left + s.top === 0 ? `<p class="sm" style="margin:12px 0 0">${ic('sms')} نفد الرصيد. تُرسل الآن رسائل الاستغاثة وحدها، من الاحتياطي.</p>` : ''}</div>
    <div class="card blsum"><div><small>تُضاف إلى رصيد هذا الشهر</small><b>حزمة 50 رسالة نصية</b></div><div class="am">${blNum(n)}<small>${blYE() ? 'ريال' : 'ر.س'}</small></div></div>
    ${callout(`${left <= 5 ? `<b>بقي من الشهر ${rwDy(left)} فقط.</b> ` : `بقي من الشهر ${rwDy(left)}. `}رصيد التعبئة ينتهي في ${blDate(blMonthEnd())} ولا ينتقل للشهر التالي.`, left <= 5 ? 'wa' : 'nt', 'event')}
    ${sec(blHow())}${blMethods().map(id => `<button class="opt" aria-pressed="${pm === id}" data-a="blPm:${id}">${ic(BL_CH[id][1])}<span><b>${BL_CH[id][0]}</b></span>${ic(pm === id ? 'check_circle-fill' : 'radio_button_unchecked')}</button>`).join('')}
    ${offline() ? blOff('الشراء يحتاج اتصالاً بالإنترنت. الأرقام أعلاه من آخر نسخة محفوظة.') : b.pend ? callout('عندك دفعة بانتظار التحقق. انتظر نتيجتها قبل أن تبدأ دفعاً آخر.', 'wa', 'hourglass_top') : ''}
    ${btn('اشترِ حزمة 50 رسالة', 'topGo', offline() || b.pend ? 'dis" disabled="' : '', 'lock')}
    <p class="xs muted c" style="margin-top:12px">${blYE() ? 'يُضاف الرصيد بعد أن تؤكد المحفظة وصول المبلغ.' : 'يُضاف الرصيد فور تحقق خادمنا من الدفع.'} الاستغاثة لها 3 رسائل احتياطية كل شهر ولو نفد كل شيء.</p>`;
  },
});

/* ---------- S04-08 التجربة ---------- */
surface('trial', {
  t: 'تجربة المميزة', sys: 'S1-04', p: 'owner', req: '04:12,13,14,21',
  note: 'S04-08. سبعة أيام على المميزة، مرة واحدة للعائلة، بلا وسيلة دفع وبلا خصم بعدها. خط زمني بثلاثة تواريخ: اليوم، نهاية التجربة، نهاية المهلة. لا خصم تلقائي أبداً: الاشتراك بضغطة من الأب، وتذكيران قبل النهاية بيومين وفي اليوم الأخير (Q-420). من كان على خطة مدفوعة يعود إليها فور انتهاء التجربة بلا مهلة، وفترته المدفوعة تستمر في العدّ أثناء التجربة.',
  r() {
    if (!blCanM()) return blNo(1);
    const b = BL(), cur = S.plan, st = blSt(), paid = cur !== 'free' && !st, t1 = tkAdd(TK_TODAY, 7), t2 = tkAdd(TK_TODAY, 10);
    if (st === 'trial') return `<div class="bigic gd">${ic('redeem')}</div><p class="ttl md">تجربتك سارية</p><p class="sub">${blLeft(blEnd())} · تنتهي ${blDate(blEnd())}. لا نخصم شيئاً بعدها.</p>${btn('اشترك في المميزة', 'go:plan-change:premium')}<div class="gap"></div>${btn('الخطة والاستهلاك', 'blToPlan', 'sec')}`;
    if (b.trialUsed || cur === 'premium') return `<div class="bigic mu">${ic('redeem')}</div><p class="ttl md">${cur === 'premium' && !b.trialUsed ? 'أنت على المميزة' : 'استخدمت عائلتك التجربة من قبل'}</p><p class="sub">${cur === 'premium' && !b.trialUsed ? 'التجربة لمن لم يجرّب المميزة بعد.' : 'التجربة مرة واحدة لكل عائلة. تستطيع الاشتراك في أي وقت.'}</p>${btn('ابدأ تجربتي 7 أيام', 'trGo', 'dis" disabled="')}<div class="gap"></div>${btn('اعرض الخطط', 'go:plans', 'sec')}`;
    return `<div class="bltop"><span class="bg">${ic('workspace_premium')}</span><b>7 أيام على المميزة، مجاناً</b><span>بلا وسيلة دفع · لا نخصم شيئاً بعدها · مرة واحدة للعائلة</span></div>
    ${sec('ما يُفتح لك')}<ul class="blwh">${cur === 'premium' ? '' : `<li>${ic('groups')}<span>أفراد بلا حد <small>بدل ${PLAN[cur].mem}</small></span></li><li>${ic('sms')}<span>100 رسالة نصية في الشهر <small>بدل ${PLAN[cur].sms}</small></span></li><li>${ic('wand_stars')}<span>3,000 عملية للمساعد <small>بدل ${blNum(PLAN[cur].ai)}</small></span></li>`}</ul>
    ${sec('ما يحدث بعدها')}<div class="tl"><div class="ev ok"><b>اليوم · تبدأ التجربة</b><span>المميزة تعمل على كل أجهزة العائلة</span></div>${paid ? `<div class="ev wa"><b>${blDate(t1)} · تنتهي التجربة وتعود إلى ${PLAN[cur].n}</b><span>خطتك المدفوعة كما كانت، بلا مهلة. فترتها تستمر في العدّ أثناء التجربة${blDays(blEnd()) > 7 ? ` وتنتهي ${blDate(blEnd())} كما هي` : ''}.</span></div>` : `<div class="ev wa"><b>${blDate(t1)} · تنتهي التجربة</b><span>تبقى الميزات 3 أيام مهلة</span></div><div class="ev"><b>${blDate(t2)} · تعود إلى المجانية</b><span>بلا قفل ولا حذف · أفرادك يبقون</span></div>`}</div>
    <div class="gap"></div>${callout('نذكّرك قبل نهايتها بيومين، وفي يومها الأخير. لا نخصم شيئاً من أنفسنا: الاشتراك بضغطة منك.', 'nt', 'notifications')}
    ${offline() ? blOff('بدء التجربة يحتاج اتصالاً بالإنترنت.') : ''}${btn('ابدأ تجربتي 7 أيام', 'trGo', offline() ? 'dis" disabled="' : '')}
    <p class="xs muted c" style="margin-top:12px">إن أعجبتك اشترك قبل ${blDate(paid ? t1 : t2)} لتبقى ميزاتها.</p>`;
  },
});

/* ---------- S04-09 المهلة والعودة إلى المجانية ---------- */
surface('plan-grace', {
  t: () => (blSt() === 'grace' ? 'المهلة' : 'حالة الاشتراك'), sys: 'S1-04', p: 'adult', req: '04:13,14',
  note: 'S04-09. في المهلة: كم بقي، ولماذا دخلتها العائلة، وأن الميزات باقية، وما يحدث في آخرها بالتاريخ. بعد العودة إلى المجانية: ما بقي وما تغيّر، وما يُمنع وحده (إضافة أفراد فوق الحد). «جدّد الآن» يجدد الخطة نفسها بخطوة دفع؛ والترقية تنهي المهلة فوراً. البالغ غير المالك يرى ولا يجدّد.',
  r() {
    if (!blCanV()) return blNo();
    const b = BL(), own = blCanM(), st = blSt(), m = blMemN();
    if (st === 'grace') { const d = Math.max(0, blDays(blEnd())), to = b.back ? b.back.plan : 'free', P = PLAN[to], cur = PLAN[S.plan], why = b.gWhy;
      return `<div class="blcd"><b>${d}</b><span>${d === 1 ? 'يوم باقٍ' : d === 2 ? 'يومان باقيان' : 'أيام باقية'} من المهلة</span></div>
      <p class="sub" style="margin-bottom:16px">${why === 'trial' ? 'انتهت تجربة المميزة.' : why === 'fail' ? `لم ينجح خصم التجديد عبر ${BL_CH[blChan()][0]}.` : `انتهت فترة الخطة ${cur.n} ولم تُجدَّد.`} ميزات ${cur.n} باقية كلها حتى <b>${blDate(blEnd())}</b>.</p>
      ${sec(`في ${blDate(blEnd())}، إن لم ${why === 'trial' ? 'تشترك' : 'تجدّد'}`)}<ul class="blwh">
        <li>${ic('verified_user')}<span>تعود العائلة إلى ${P.n}. لا يُقفل شيء ولا تُحذف بيانات.</span></li>
        <li>${ic('groups')}<span>${P.mem !== Infinity && m > P.mem ? `يبقى أفرادك كلهم (${m}). يُمنع فقط إضافة فرد جديد حتى ينقص العدد عن ${P.mem}.` : `يبقى أفرادك كلهم (${m}).`}</span></li>
        <li>${ic('sms')}<span>الرسائل النصية تصير ${P.sms} في الشهر، وعمليات المساعد ${blNum(P.ai)}.</span></li>
        <li>${ic('emergency_home')}<span>الاستغاثة والموقع والمحادثة والمهام لا تتأثر.</span></li></ul>
      ${own ? `${offline() ? blOff() : ''}${btn(why === 'trial' ? 'اشترك في المميزة' : 'جدّد الآن', 'go:plan-change:' + S.plan, offline() ? 'dis" disabled="' : '')}<div class="gap"></div>${btn('اختر خطة أخرى', 'go:plans', 'sec')}` : `<p class="sm muted" style="margin:8px 4px">${ic('lock')} التجديد ل${M.ahmad.n} وحده.</p>`}`; }
    if (b.fell) { const P = PLAN[b.fell.to], F = PLAN[b.fell.from];
      return `<div class="bigic">${ic('info')}</div><p class="ttl md">عادت العائلة إلى ${P.n}</p><p class="sub">${b.fell.why === 'trial' ? (b.fell.to === 'free' ? 'انتهت تجربة المميزة ومهلتها.' : `انتهت تجربة المميزة. خطتك ${P.n} كما كانت، وتنتهي ${blDate(blEnd())}.`) : b.fell.why === 'me' ? 'اخترت العودة إليها.' : `انتهت الخطة ${F.n} ومهلتها دون تجديد.`}</p>
      ${sec('ما بقي كما هو')}<ul class="blwh"><li>${ic('verified_user')}<span>لم يُقفل شيء ولم تُحذف بيانات.</span></li><li>${ic('groups')}<span>أفرادك كلهم (${m}) في العائلة.</span></li><li>${ic('emergency_home')}<span>الاستغاثة والموقع والمحادثة والمهام تعمل كما كانت.</span></li></ul>
      ${sec('ما تغيّر')}<ul class="blwh">${P.mem !== Infinity && m >= P.mem ? `<li>${ic('person_add')}<span>لا يُضاف فرد جديد${m > P.mem ? ` حتى ينقص العدد عن ${P.mem}` : ''}: ${P.n} تتسع لـ${P.mem}.</span></li>` : ''}<li>${ic('sms')}<span>الرسائل النصية ${P.sms} في الشهر <small>كانت ${F.sms}</small></span></li><li>${ic('wand_stars')}<span>عمليات المساعد ${blNum(P.ai)} <small>كانت ${blNum(F.ai)}</small></span></li></ul>
      ${own ? `${btn('اعرض الخطط', 'go:plans', '', 'workspace_premium')}<div class="gap"></div>${btn('فهمت', 'blFellOk', 'sec')}` : btn('فهمت', 'blToPlan', 'sec')}`; }
    return empty('check_circle', 'لا مهلة الآن', S.plan === 'free' ? 'العائلة على المجانية: بلا تكلفة وبلا مدة.' : `اشتراكك سارٍ حتى ${blDate(blEnd())}.`, btn('الخطة والاستهلاك', 'blToPlan', 'sm sec t48'));
  },
});

/* ---------- S04-10 بطاقة بلوغ الحد ---------- */
surface('plan-limit', {
  kind: 'sheet', t: 'بلغت حد الخطة', sys: 'S1-04', p: 'adult', a: ['mem'], req: '04:9,14,22 03:2',
  note: 'S04-10. تظهر حين يبلغ الأب حداً: الأفراد، أو الرسائل النصية، أو عمليات المساعد، أو الأدوار المخصصة (Q-456). سبب واحد وإجراء واحد و«لاحقاً» بلا عقوبة. للرسائل الإجراء الأول هو التعبئة لأنها الأرخص. على المميزة لا خطة أعلى، فلا زر ترقية. البالغ غير المالك لا يرى زر شراء: «اطلب من أحمد» يرسل طلباً واحداً يظهر عند المالك.',
  r(why) { return isAdult() ? blLimit(BL_LIM[why] ? why : 'mem', 1) : ''; },
});

/* ---------- S04-11 إدارة الاشتراك ---------- */
surface('plan-manage', {
  t: 'إدارة الاشتراك', sys: 'S1-04', p: 'owner', req: '04:4,5,13',
  note: 'S04-11. حالة التجديد بصدق: المتجر يجدّد من نفسه، والمحفظة والبطاقة لا تتجدد من نفسها. إلغاء التجديد يُبقي الميزات حتى نهاية الفترة ثم تعود العائلة إلى المجانية. التجديد المبكر لمن لا يتجدد اشتراكه من نفسه: الفترة الجديدة تبدأ بعد نهاية الحالية (Q-420). استعادة المشتريات من متجر المنصة نفسه، في سوق الخليج فقط، بلا تفعيل مكرر.',
  r() {
    if (!blCanM()) return blNo(1);
    const b = BL(), st = blSt(), paid = S.plan !== 'free' && !st, e = blDate(blEnd()), ch = blChan(), auto = blAuto(), sn = BL_CH[blStore()][0];
    return `${blCard()}
    ${paid ? `${sec('التجديد')}${auto ? `<div class="card"><div class="fx top">${ic('sync')}<div class="grow"><b>يتجدد من نفسه</b><div class="sm muted">الخصم القادم ${blAmt(blPrice(S.plan, b.cyr))} في ${e} عبر ${BL_CH[ch][0]}.</div></div></div><div class="gap"></div>${btn('ألغِ التجديد التلقائي', 'blCancel', 'dng sec')}<p class="xs muted" style="margin:8px 0 0">بعد الإلغاء تبقى ميزاتك حتى ${e}، ثم تعود العائلة إلى المجانية بلا قفل ولا حذف.</p></div>`
      : `<div class="card"><div class="fx top">${ic('event_busy')}<div class="grow"><b>${b.noAuto ? 'أُلغي التجديد التلقائي' : 'لا يتجدد من نفسه'}</b><div class="sm muted">${b.down ? `ينتقل إلى ${PLAN[b.down.to].n} في ${e}.` : `ميزاتك باقية حتى ${e}. بعدها 3 أيام مهلة، ثم المجانية بلا قفل ولا حذف.`}</div></div></div>${b.down ? `<div class="gap"></div>${btn('تراجع عن التخفيض', 'blUndown', 'sec')}` : `<div class="gap"></div>${btn(b.noAuto ? 'اشترك من جديد' : 'جدّد الآن', 'go:plan-change:' + S.plan, offline() ? 'dis" disabled="' : '')}<p class="xs muted" style="margin:8px 0 0">${b.noAuto ? 'يبدأ اشتراكك الجديد بعد نهاية الفترة الحالية.' : `إن جدّدت الآن بدأت الفترة الجديدة بعد ${e}، ولا يضيع عليك يوم.`}</p>`}</div>`}` : ''}
    ${st === 'trial' ? callout(`تجربة تنتهي ${e}. لا نخصم شيئاً بعدها، ولا شيء يُلغى.`, 'nt', 'redeem') : st === 'grace' ? callout('اشتراكك في المهلة. جدّده من صفحة المهلة.', 'wa', 'schedule') + btn('افتح المهلة', 'go:plan-grace', 'sec') + '<div class="gap"></div>' : !paid ? callout('العائلة على المجانية: بلا تكلفة وبلا مدة. لا شيء يتجدد ولا شيء يُلغى.', 'nt', 'info') : ''}
    ${offline() ? blOff('الإلغاء والتجديد والاستعادة تحتاج اتصالاً بالإنترنت.') : ''}
    ${sec('غير ذلك')}${list(blYE() ? '' : row('replay', 'استعد المشتريات', b.busy === 'rest' ? `نبحث في ${sn}…` : `بعد تغيير الهاتف أو إعادة التثبيت · من ${sn}`, { a: 'blRestore' }), row('receipt_long', 'سجل المدفوعات', '', { a: 'go:receipts' }))}`;
  },
});

/* ---------- S04-12 سجل المدفوعات ---------- */
const BL_RS = { ok: ['تم التحقق', 'ok', 'verified'], tmp: ['تفعيل مؤقت · نعيد التحقق', 'wa', 'schedule'], bad: ['لم يُقبل', 'da', 'gpp_maybe'], rej: ['لم تتأكد', 'da', 'error'], pend: ['بانتظار التحقق', 'wa', 'hourglass_top'] };
surface('receipts', {
  t: 'سجل المدفوعات', sys: 'S1-04', p: 'owner', req: '04:7',
  note: 'S04-12. للقراءة فقط: ما اشتُري، وبأي طريقة، وحالة التحقق، ووقته، والرقم المرجعي مخفياً إلا آخر أربع خانات. لا بيانات بطاقة ولا تعديل ولا حذف. الدفعة التي تنتظر التحقق تظهر أولاً. المبلغ وعملته يُعرضان، وأُضيفا إلى سجل الإيصال في المواصفة (Q-420).',
  r() {
    if (!blCanM()) return blNo(1);
    const b = BL(), R = b.rc, d = b.pend, it = d ? blItem(d.w, d.yr) : null;
    const rr = (t, amt, ch, st, at, ref) => `<div class="blr"><div class="fx sb top"><b>${t}</b><b class="am">${amt}</b></div><div class="mt">${BL_CH[ch][0]} · ${at}${ref ? ` · <span class="ltr">${blMask(ref)}</span>` : ''}</div>${chip(BL_RS[st][0], BL_RS[st][1], BL_RS[st][2])}</div>`;
    if (!R.length && !d) return empty('receipt_long', 'لا مدفوعات بعد', 'كل دفعة تتحقق منها خوادمنا تُكتب هنا.');
    return `${offline() ? `<p class="xs muted blage">${age(0)}<span>نسخة محفوظة على هاتفك</span></p>` : ''}
    ${d ? sec('قيد التحقق') + `<div class="card tight">${rr(it.t + (it.per ? ' · ' + it.per : ''), blAmt(it.n), d.ch, 'pend', d.at, d.ref)}</div>` : ''}
    ${R.length ? sec('ما سبق') + `<div class="card tight">${R.map(r => rr(r.t, r.amt, r.ch, r.st, r.at, r.ref)).join('')}</div>` : ''}
    <p class="xs muted c" style="margin-top:8px">للقراءة فقط. لا نعرض هنا بيانات بطاقة ولا رقماً مرجعياً كاملاً.</p>`;
  },
});

/* ---------- الأفعال ---------- */
Object.assign(ACT, {
  blToPlan() { blHome(); },
  blRetry() { S.blSt = ''; toast('حُدّثت', null, 'cloud_done'); },
  blYr(v) { BL().yr = v === '1' ? 1 : 0; },
  blPm(id) { if (BL_CH[id]) BL().pm = id; },
  blRejOk() { BL().rej = null; },
  blTrSeen() { const b = BL(); b.trSeen = blDays(blEnd()) + 1; },
  blFellOk() { BL().fell = null; if (S.stack.some(s => s.id === 'plan-grace')) blHome(); },
  blAskOk(i) { BL().ask.splice(+i, 1); },
  blAsk(why) { const b = BL(); if (!b.ask.some(q => q.who === me().id && q.why === why)) b.ask.push({ who: me().id, why }); S.sheet = null; toast(`أُرسل طلبك إلى ${M.ahmad.n}`, null, 'send'); },
  blUndown() { const b = BL(); if (offline()) { toast('يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; } const to = b.down ? PLAN[b.down.to].n : ''; b.down = null; audit('أُلغي التخفيض المجدول', 'billing.manage'); toast(`أُلغي الانتقال إلى ${to} · تبقى على ${PLAN[S.plan].n}`); },
  plGo(k) {
    if (!blCanM()) return ACT.denied('billing.manage'); if (!PLAN[k]) return;
    if (offline()) { toast('يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    const b = BL(), kind = blKind(k);
    if (kind === 'down') return gate('تغيير الخطة', () => { b.down = { to: k }; audit(`تخفيض مجدول إلى ${PLAN[k].n} في ${blDate(blEnd())}`, 'billing.manage'); blHome(); toast(`تنتقل إلى ${PLAN[k].n} في ${blDate(blEnd())}`); });
    if (kind === 'fall') return gate('تغيير الخطة', () => { b.gWhy = 'me'; b.back = null; blFall(); b.fell = null; blHome(); toast('العائلة الآن على المجانية · لم يُحذف شيء'); });
    if (b.pend) { toast('عندك دفعة بانتظار التحقق. انتظر نتيجتها أولاً.', null, 'hourglass_top'); return; }
    const pm = blPm(), yr = b.yr ? '1' : '';
    gate('الدفع وتغيير الخطة', () => { b.pay = null; b.pw = { ref: '', err: '' }; go(blIsStore(pm) ? 'pay' : 'pay-wallet', k, yr, pm); });
  },
  topGo() {
    if (!can('billing.topup.buy')) return ACT.denied('billing.topup.buy');
    if (offline()) { toast('الشراء يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    const b = BL(); if (b.pend) { toast('عندك دفعة بانتظار التحقق. انتظر نتيجتها أولاً.', null, 'hourglass_top'); return; }
    const pm = blPm(); gate('شراء رصيد رسائل', () => { b.pay = null; b.pw = { ref: '', err: '' }; go(blIsStore(pm) ? 'pay' : 'pay-wallet', 'topup', '', pm); });
  },
  payOpen(w, yr, ch) { if (offline()) { toast('الدفع يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; } BL().pay = null; S.sheet = { id: 'store-buy', a: [w, yr, ch] }; },
  payBuy(w, yr, ch) {
    const b = BL(); S.sheet = null; b.pay = { st: 'verify', long: 0 }; clearTimeout(blT1); clearTimeout(blT2);
    blT1 = setTimeout(() => { if (S.bl === b && b.pay && b.pay.st === 'verify') { b.pay.long = 1; render(); } }, 2000);
    blT2 = setTimeout(() => { if (S.bl === b && b.pay && b.pay.st === 'verify') { ACT.payEnd(w, yr, ch); render(); } }, 3400);
  },
  payEnd(w, yr, ch) {
    const b = BL(), out = S.payDemo || '', it = blItem(w, yr); clearTimeout(blT1); clearTimeout(blT2);
    if (out === 'fail') { b.pay = { st: 'fail' }; return; }
    if (out === 'bad') { b.pay = { st: 'bad' }; blRc(it.t + (it.per ? ' · ' + it.per : ''), blAmt(it.n), ch, 'bad', ''); S.audit.unshift({ t: 'إيصال شراء لم يُقبل · لم تتغير الخطة', w: 'النظام', at: 'الآن', k: 'billing.manage', deny: 1 }); return; }
    blDone(w, yr === '1' || yr === 1, ch, out === 'down' && w !== 'topup');
  },
  pwGo(w, yr, ch) {
    const b = BL(), el = $('#pwr'), v = ((el ? el.value : b.pw.ref) || '').trim(); b.pw.ref = v;
    ch = BL_WAL.includes(ch) ? ch : BL_WAL[0];            /* اليمن محافظ وحدها (Q-422) */
    if (offline()) { toast('تأكيد الدفع يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    if (!v) { b.pw.err = 'empty'; return; }
    if (v === '70451288' || b.rc.some(r => r.ref === v)) { b.pw.err = 'dup'; return; }
    b.pw = { ref: '', err: '' }; b.rej = null; b.pend = { w, yr: yr === '1', ch, ref: v, at: 'اليوم · 5:12 م' };
    audit(`دفعة سُجّلت بانتظار التحقق · ${BL_CH[ch][0]}`, w === 'topup' ? 'billing.topup.buy' : 'billing.manage');
  },
  trGo() {
    if (!blCanM()) return ACT.denied('billing.manage');
    if (offline()) { toast('بدء التجربة يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    const b = BL(); if (b.trialUsed || S.plan === 'premium') { toast('استخدمت عائلتك التجربة من قبل', null, 'info'); return; }
    gate('بدء التجربة', () => { if (S.plan !== 'free') b.back = { plan: S.plan, end: blEnd(), ch: blChan(), cyr: b.cyr }; b.trialUsed = 1; b.trialEnd = tkAdd(TK_TODAY, 7); S.plan = 'premium'; S.planSt = 'trial'; audit('بدأت تجربة المميزة 7 أيام', 'billing.manage'); blHome(); toast('بدأت تجربتك · المميزة مفعّلة 7 أيام'); });
  },
  blCancel() {
    if (offline()) { toast('الإلغاء يحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    const e = blDate(blEnd());
    confirmDlg('إلغاء التجديد التلقائي؟', `تبقى ميزاتك حتى ${e}، ثم تعود العائلة إلى المجانية بلا قفل ولا حذف. لا يُستردّ شيء عن الفترة الحالية.`, 'ألغِ التجديد', () => gate('إلغاء التجديد', () => { BL().noAuto = 1; audit('أُلغي التجديد التلقائي', 'billing.manage'); toast(`أُلغي التجديد · ميزاتك تبقى حتى ${e}`); }), true);
  },
  blRestore() {
    if (offline()) { toast('الاستعادة تحتاج اتصالاً بالإنترنت', null, 'cloud_off'); return; }
    const b = BL(), sn = BL_CH[blStore()][0], paid = S.plan !== 'free' && !blSt();
    if (S.restDemo !== 'found') { toast(`لا مشتريات سابقة لهذا الحساب في ${sn}`, null, 'info'); return; }
    if (paid && blIsStore(blChan())) { toast('اشتراكك مفعّل أصلاً · لا شيء يُستعاد', null, 'info'); return; }
    S.plan = 'premium'; S.planSt = ''; b.ch = blStore(); b.yr = b.cyr = 0; b.end = '2026-12-02'; b.noAuto = 0; b.down = null; b.fell = null; b.back = null;
    audit(`استُعيد اشتراك المميزة من ${sn}`, 'billing.manage'); toast(`استُعيدت مشترياتك · المميزة حتى ${blDate(b.end)}`);
  },
});
/* أحداث الخادم (تُطلق من لوحة الضبط في النموذج) */
function blEv(v) {
  const b = BL(); S.sheet = S.full = S.dlg = null;
  if (v === 'ver' && b.pend) { const d = b.pend, it = blItem(d.w, d.yr); blDone(d.w, d.yr, d.ch); b.pend = null; $('#toast').innerHTML = ''; notif(d.w === 'topup' ? 'أُضيفت 50 رسالة' : 'تمت الترقية', d.w === 'topup' ? 'تأكد الدفع، والرصيد في حسابك الآن' : `تأكد الدفع · ${it.t} فعّالة الآن`, 'workspace_premium', 'go:plan'); }
  else if (v === 'rej' && b.pend) { const d = b.pend, it = blItem(d.w, d.yr); b.rej = { w: d.w, yr: d.yr, ch: d.ch }; blRc(it.t + (it.per ? ' · ' + it.per : ''), blAmt(it.n), d.ch, 'rej', d.ref); b.pend = null; S.audit.unshift({ t: 'دفعة لم تتأكد · لم تتغير الخطة', w: 'النظام', at: 'الآن', k: 'billing.manage', deny: 1 }); notif('لم تتأكد دفعتك', 'لم تتغير خطتك · افتح الخطة للتفاصيل', 'error', 'go:plan'); }
  else if (v === 'tr2' || v === 'tr0') { if (S.planSt !== 'trial') { if (S.plan !== 'free' && !S.planSt) b.back = { plan: S.plan, end: blEnd(), ch: blChan(), cyr: b.cyr }; S.plan = 'premium'; S.planSt = 'trial'; b.trialUsed = 1; } b.trialEnd = tkAdd(TK_TODAY, v === 'tr2' ? 2 : 0); b.trSeen = 0;
    notif(v === 'tr2' ? 'تجربة المميزة تنتهي بعد يومين' : 'تجربة المميزة تنتهي اليوم', b.back ? `بعدها تعود العائلة إلى ${PLAN[b.back.plan].n} · لا نخصم شيئاً` : 'لا نخصم شيئاً · اشترك إن أردت أن تبقى ميزاتها', 'redeem', 'go:trial'); }
  else if (v === 'trend') { if (S.planSt !== 'trial') { if (S.plan !== 'free' && !S.planSt) b.back = { plan: S.plan, end: blEnd(), ch: blChan(), cyr: b.cyr }; S.plan = 'premium'; b.trialUsed = 1; }
    /* من كان على خطة مدفوعة يعود إليها فوراً بلا مهلة (Q-420)؛ وإن انتهت فترتها أثناء التجربة دخلت مهلتها هي */
    if (b.back && blDays(b.back.end) > 0) { S.planSt = 'trial'; b.gWhy = 'trial'; blFall(); }
    else if (b.back) { S.plan = b.back.plan; b.end = b.back.end; b.ch = b.back.ch; b.yr = b.cyr = b.back.cyr; b.back = null; S.planSt = 'grace'; b.gWhy = 'end'; b.graceEnd = tkAdd(TK_TODAY, 3); b.trialEnd = ''; }
    else { S.planSt = 'grace'; b.gWhy = 'trial'; b.graceEnd = tkAdd(TK_TODAY, 3); } }
  else if (v === 'exp') { if (S.plan === 'free') S.plan = 'basic'; b.gWhy = blAuto() ? 'fail' : 'end'; S.planSt = 'grace'; b.graceEnd = tkAdd(TK_TODAY, 3); b.down = null; }
  else if (v === 'fall') { if (S.planSt !== 'grace') { if (S.plan === 'free') S.plan = 'basic'; b.gWhy = b.gWhy || 'end'; } blFall(); }
  else if (v === 'w80') { S.smsOut = false; S.sms.used = Math.ceil(PLAN[S.plan].sms * .85); notif('استهلكت 85% من رسائل الشهر', 'الاستغاثة لا تتوقف · افتح الخطة', 'sms', 'go:plan'); }
  else if (v === 'aiout') { S.aiKill = false; S.aiUse = PLAN[S.plan].ai; }
  render();
}

ACT.blWRetry = () => { BL().wErr = 0; toast('جارٍ التحقق من حالة الدفع…', null, 'sync'); };
ACT.blWBack = () => { BL().wErr = 0; back(); };
