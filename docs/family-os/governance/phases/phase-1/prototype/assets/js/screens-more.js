/* أسطح «المزيد»: الإعدادات التسعة، الخطة، الخصوصية، الأمان، المساعد، المنصة، وطبقات النظام (بوابة، SOS، تحديث…). */
'use strict';
const PLAN = {
  free: { n: 'المجانية', mem: 5, sms: 20, ai: 300, roles: 0, sar: 0, yer: 0 },
  basic: { n: 'الأساسية', mem: 10, sms: 50, ai: 1000, roles: 3, sar: 9.99, sarY: 89.99, yer: 300 },
  premium: { n: 'المميزة', mem: Infinity, sms: 100, ai: 3000, roles: 10, sar: 19.99, sarY: 179.99, yer: 600 },
};
surface('more', {
  t: 'المزيد', sys: 'S1-09', p: 'adult', req: '09:4,5,12,13,15 01:11,21',
  note: 'مركز الإعدادات: بحث شامل في الأعلى يفتح الإعداد المقصود ويبرزه (يفهم المرادفات: «السهر» ← نافذة النوم، «كلمة السر» ← الأمان)، ثم الأقسام التسعة الثابتة، ثم «حسابي وهذا الجهاز». القسم الذي يحتاج انتباهاً يحمل شارة. كل صف يظهر فقط لمن يملك مفتاحه، وما للمالك حصراً يظهر مقفلاً مع سببه.',
  r() { const m = me(), own = isOwner(), lock = (k, a) => (own || can(k) ? a : 'denied:' + k);
    const full = S.plan !== 'premium' && blMemN() >= PLAN[S.plan].mem;
    return `<label class="srch">${ic('search')}<input type="search" data-gs placeholder="ابحث في الإعدادات" autocomplete="off" aria-label="ابحث في الإعدادات"></label><div id="gsOut" hidden></div><div id="gsBody"><button class="ans fx" data-a="go:account">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(18px*var(--ts))">${m.n}</b><div class="sm muted">${m.rel}</div><div class="sm muted ltr">${byMail() ? 's•••@example.com' : '+967 77• ••• •42'}</div></div>${ic('chevron_right')}</button>
    ${(S.recent || []).filter(x => SC[x]).length ? `${sec('آخر ما فتحته')}<div class="fch" data-recent>${(S.recent || []).filter(x => SC[x]).map(x => `<button data-a="go:${x}">${ic('history')}${SC[x].t}</button>`).join('')}</div>` : ''}
    ${sec('العائلة والأفراد')}${list(row('family_home', 'العائلة', famN() + ' · ' + OB_REG[S.reg || 'YE'][0], { a: 'go:family-settings' }), row('groups', 'الأعضاء', `${Object.keys(M).length} أفراد`, { a: 'tab:family' }), own ? row('checklist', 'قائمة الإعداد الأولي', ckLeft(), { a: 'go:checklist', v: ckRest().length ? chip(`${CK_I.length - ckRest().length} من ${CK_I.length}`, 'in') : chip('مكتملة', 'ok', 'check') }) : '', own ? row('widgets', 'الخدمات', 'خدمات التطبيق وحالتها', { a: 'go:registry' }) : '', row('view_agenda', 'القوالب', 'قوالب العرض والصلاحيات', { a: 'go:templates' }))}
    ${sec('الضبط والمراجعة')}${list(row('pending_actions', 'الموافقات والاستثناءات', attention().length ? `${attention().length} بانتظار قرار` : 'لا شيء ينتظر قرارك', { a: 'go:alerts', v: attention().length ? chip(String(attention().length), 'in') : '' }), row('rule', 'القواعد', 'الحماية ووقت الشاشة', { a: 'go:protection' }), row('receipt_long', 'التدقيق', 'من غيّر ماذا ومتى', { a: lock('roles.audit.view', 'go:audit'), v: own || can('roles.audit.view') ? '' : ic('lock') }), row('privacy_tip', 'الخصوصية والبيانات', 'تصدير · حذف · شفافية', { a: 'go:privacy' }), row('workspace_premium', 'الخطة والفوترة', PLAN[S.plan].n, { a: can('hub.plan.view') ? 'go:plan' : 'denied:hub.plan.view', v: !own ? chip('عرض فقط', 'ol') : full ? chip('بلغت حدّ الأفراد', 'wa') : '' }))}
    ${sec('حسابي وهذا الجهاز')}${list(row('security', 'الأمان', 'البصمة · أجهزتي · إن فقدت الهاتف', { a: 'go:security' }), row('wand_stars', 'المساعد الذكي', S.aiKill ? 'متوقف' : 'يقترح فقط', { a: 'go:ai' }), row('translate', 'اللغة والعرض', L('العربية', 'English'), { a: 'go:display' }), row('sync', 'البيانات والمزامنة', S.outbox.length ? `${S.outbox.length} بانتظار الإرسال` : S.lbw ? 'توفير البيانات مفعّل' : 'كل شيء مُرسل', { a: 'go:outbox' }), row('contact_support', 'المساعدة والدعم', 'أسئلة شائعة · راسلنا', { a: 'go:help' }), row('info', 'عن التطبيق', 'الإصدار 1.0.0 (نموذج أولي)', { a: 'go:about' }))}<button class="c" data-a="go:about" style="display:block;width:100%;padding:22px 0 6px" aria-label="عن التطبيق"><img src="assets/brand/logo-horizontal-ar${S.theme === 'dark' ? '-dark' : ''}.svg" alt="عائلتي" height="64" style="margin:0 auto"><div class="sm muted">الإصدار 1.0.0</div></button></div>`; },
});
surface('account', {
  t: 'حسابي', sys: 'S1-02', p: 'adult', req: '02:1,6,8,22,25,26',
  r() { const d = isRoot() ? S.ownDel : S.delP; return `<div class="c" style="padding:8px 0 12px">${av(me(), 'xl')}<div class="b" style="font-size:20px;margin-top:8px">${me().n}</div></div>
    ${d ? `<button class="callout da" style="width:100%;text-align:start" data-a="go:delete-account">${ic('delete_forever')}<div><b>حسابك يُحذف بعد ${d} يوماً</b><br>اضغط هنا لإلغاء الحذف.</div></button>` : ''}
    ${list(byMail() ? row('mail', 'البريد الإلكتروني', 'طريق الدخول إلى «عائلتي»', { v: '<span class="ltr">s•••@example.com</span>' }) : row('call', 'رقم الهاتف', 'تدخل به إلى «عائلتي»', { v: '<span class="ltr">+967 77• ••• •42</span>' }), byMail() ? row('call', 'رقم الهاتف', ph2St() === 'ok' ? 'طريق دخول ثانٍ' : ph2St() === 'code' ? 'لم يُضف بعد · اكتب الرمز الذي وصل' : 'طريق دخول ثانٍ إن تعذّر البريد', { v: ph2St() === 'ok' ? `<span class="ltr">${ph2Show()}</span>` : ph2St() === 'code' ? chip('بانتظار الرمز', 'wa') : 'أضف', a: 'go:login-add:phone' }) : row('mail', 'البريد الإلكتروني', em2St() === 'ok' ? 'تدخل به أيضاً' : em2St() === 'sent' ? 'لم يُضف بعد · اضغط الرابط الذي وصلك' : 'طريق دخول ثانٍ إن تعذّر الرقم', { v: em2St() === 'ok' ? `<span class="ltr">${em2Mask()}</span>` : em2St() === 'sent' ? chip('بانتظار التأكيد', 'wa') : 'أضف', a: 'go:login-add' }), row('family_home', 'عائلتي', 'عائلة واحدة لكل حساب', { v: famN().replace(/^عائلة\s+/, '') }))}
    ${list(row('logout', 'اخرج من هذا الجهاز', '', { a: 'signOut' }), isRoot() ? '' : row('person_remove', 'غادر العائلة', '', { a: 'go:leave-family', ic: 'var(--danger)' }))}`; },
});
surface('leave-family', {
  t: 'مغادرة العائلة', sys: 'S1-02', p: 'adult', req: '02:26 03:20',
  note: 'حق أصيل لكل بالغ لا يملك الأب سحبه (Q-291)، ولذلك لا حالة «معطَّل من المالك». المغادرة فورية. المالك لا يغادر عائلته (S1-03 · Q-401، Q-402: لا نقل ملكية؛ يحذف العائلة، أو يحذف حسابه والصلاحية الكاملة عند بالغ آخر). إن كان المغادر هو جهة الاسترداد يُنبَّه هو قبل المغادرة ويسقط تعيينه، ويصل الأب تنبيه ليختار غيره (Q-400 — GAP-10 أُغلقت).',
  r() { if (isRoot()) return `${empty('family_home', 'أنت مالك العائلة', 'المالك لا يغادر عائلته. تستطيع أن تعطي بالغاً آخر الصلاحية الكاملة ليدير معك.', btn('الصلاحية الكاملة', 'go:transfer', 'sec', 'admin_panel_settings'), 'off')}`;
    if (S.ownDel && S.co) return empty('admin_panel_settings', 'أنتِ من يدير العائلة الآن', `أحمد يحذف حسابه. لا تغادرين حتى يتراجع أو تكتمل مهلته (${S.ownDel} يوماً) فتصيري المالكة.`, btn('رجوع', 'back', 'sec'));
    return `<div class="bigic da">${ic('person_remove')}</div><p class="ttl md">ماذا يحدث إن غادرتِ؟</p><div class="card"><div class="tl"><div class="ev da"><b>الآن: تخرجين من ${famN()}</b><span>لا ترين الأفراد ولا المحادثات ولا المواقع</span></div><div class="ev"><b>كل ما سمح لك به أحمد يُلغى</b><span>فوراً وعلى كل أجهزتك</span></div><div class="ev ok"><b>حسابك يبقى</b><span>تستطيعين الانضمام مجدداً بدعوة جديدة</span></div></div></div>
    ${S.rec === me().id ? callout('أنتِ من اختارها أحمد لتساعده إن فقد هاتفه ورقمه. بعد مغادرتك يصله تنبيه ليختار غيرك.', 'wa', 'support') : ''}${btn('غادر العائلة', 'leaveFam', 'dng')}<div class="gap"></div>${btn('ابقَ', 'back', 'sec')}`; },
});
Object.assign(ACT, {
  signOut() { confirmDlg('الخروج من هذا الجهاز؟', 'ستحتاج إلى رقمك ورمز التحقق للدخول مجدداً. ما لم يُرسل بعد يبقى محفوظاً على هذا الجهاز.', 'اخرج', () => { setPersona('guest'); S.ob = {}; }); },
  leaveFam() { confirmDlg('مغادرة ' + famN() + '؟', 'المغادرة فورية. للعودة تحتاجين دعوة جديدة.', 'غادر', () => { const was = S.rec === me().id; audit(`غادرت ${me().n} العائلة`, 'identity.family.leave'); if (was) { S.rec = null; S.alerts.unshift({ id: 'a' + Date.now(), k: 'perm', kid: null, t: 'لم تعد لك جهة استرداد', s: 'غادرت سارة العائلة · اختر بالغاً آخر', ago: 'الآن', p: 3, open: 1 }); } setPersona('guest'); S.ob = {}; toast('غادرتِ ' + famN(), null, 'person_remove'); }, true); },
});
surface('family-settings', {
  t: 'العائلة', sys: 'S1-02', p: 'adult', req: '02:7,8,25,28 03:20 01:12',
  note: 'الاسم والبلد والتوقيت. البلد يحدد الأسعار وطرق الدفع وقنوات التحقق. حذف العائلة للمالك (أو صاحب الصلاحية الكاملة) بمهلة تراجع.',
  r() { const own = isOwner(); return list(row('edit', 'اسم العائلة', '', { v: famN(), a: own ? 'famEdit:name' : 'denied:shell.config.edit' }), row('public', 'البلد', 'يحدد الأسعار وطرق الدفع', own ? { v: OB_REG[S.reg || 'YE'][0], a: 'famEdit:reg' } : { v: OB_REG[S.reg || 'YE'][0] }), row('schedule', 'التوقيت', 'تُحسب به أوقات النوم والمدرسة ونهاية اليوم', own ? { v: S.tz || OB_DEV_TZ, a: 'famEdit:tz' } : { v: S.tz || OB_DEV_TZ }), row('today', 'التقويم', '', { v: 'هجري + ميلادي' })) + (own ? sec('منطقة الخطر') + list(isRoot() ? row('admin_panel_settings', 'الصلاحية الكاملة', S.co ? 'عند سارة · اعرضها أو اسحبها' : 'أعطِها لبالغ آخر، وتسحبها متى شئت', { a: 'go:transfer' }) : '', row('delete_forever', S.famDel ? `العائلة تُحذف بعد ${S.famDel} يوماً` : 'احذف العائلة', S.famDel ? 'اعرض أو ألغِ الحذف' : 'مهلة تراجع 30 يوماً ثم حذف نهائي', { a: 'go:family-delete', ic: 'var(--danger)' })) : callout('الصلاحية الكاملة وحذف العائلة للمالك.', 'nt', 'lock')); },
});
/* ---------- طريق دخول ثانٍ، وتعديل العائلة بعد إنشائها (S1-02 REQ-029 · REQ-030 — كانا GAP-18 وGAP-19) ---------- */
const em2St = () => (S.em2 && S.em2.st) || '';
/* الاتجاه الآخر (REQ-029): سارة سجّلت ببريدها، فتضيف رقماً. الرمز التجريبي 246810. */
const byMail = () => S.persona === 'delegate';
const ph2St = () => (S.ph2 && S.ph2.st) || '';
const ph2CC = () => OB_CC.find(c => c[0] === (S.reg || 'YE')) || OB_CC[0];
const ph2Show = () => `${ph2CC()[4]} ${S.ph2.a.slice(0, 2)}• ••• •${S.ph2.a.slice(-2)}`;
function ph2Sheet() { const f = S.ph2F || {}, st = ph2St(), cc = ph2CC();
  if (st === 'ok') return `<h4>رقم الدخول</h4><p class="d">الدخول إلى «عائلتي» بالبريد أو بهذا الرقم، أيهما تيسّر.</p>${list(row('call', `<span class="ltr">${ph2Show()}</span>`, 'مؤكَّد', { chev: false, v: ic('check_circle') }))}${btn('أزِل هذا الرقم', 'ph2Rm', 'sec', 'lock')}<div class="gap"></div>${btn('إغلاق', 'close', 'txt')}`;
  if (st === 'code') { const lk = S.ph2.bad >= 5;
    return `<h4>اكتب الرمز</h4><p class="d">أرسلنا رمزاً من 6 أرقام عبر واتساب إلى <span class="ltr b">${ph2Show()}</span>. لا يُضاف الرقم قبل أن يُكتب الرمز هنا.</p>
    ${lk ? callout('خمس محاولات خاطئة. انتظر 15 دقيقة ثم اطلب رمزاً جديداً. لم يتغير شيء في الحساب.', 'da', 'lock_clock') : `<label class="fld ${S.ph2.bad ? 'err' : ''}"><span>رمز التحقق</span><input id="ph2c" dir="ltr" inputmode="numeric" maxlength="6" autocomplete="one-time-code" style="letter-spacing:4px"><small>${S.ph2.bad ? `الرمز غير صحيح. بقيت ${5 - S.ph2.bad} محاولات.` : 'للتجربة: 246810'}</small></label>${btn('أكّد الرمز', 'ph2Ok')}<div class="gap"></div>${btn('أرسل رمزاً جديداً', 'ph2Again', offline() ? 'sec" disabled="' : 'sec')}`}<div class="gap"></div>${btn('ألغِ الإضافة', 'ph2Cancel', 'txt')}`; }
  const E = { bad: 'الرقم غير مكتمل. اكتبه بلا الصفر الأول، مثل: ' + cc[6].replace(/ /g, ''), used: 'هذا الرقم لحساب آخر. اكتب رقماً غيره.', down: 'لم نستطع إيصال الرمز الآن. حاول بعد قليل؛ الدخول بالبريد يعمل كما هو.' };
  return `<h4>أضف رقماً للدخول</h4><p class="d">طريق دخول ثانٍ إن تعذّر البريد. نرسل إليه رمزاً، ولا يُضاف الرقم قبل أن يُكتب الرمز.</p>
  <label class="fld ${f.e ? 'err' : ''}"><span>رقم الهاتف</span><div class="fx" style="direction:ltr;gap:8px"><span class="inp" style="width:104px;flex:none;display:flex;align-items:center;justify-content:center;gap:4px">${cc[3]} <span class="mono">${cc[4]}</span></span><input id="ph2" inputmode="tel" dir="ltr" placeholder="${cc[6]}" value="${f.a || ''}" style="letter-spacing:1px"></div><small>${f.e ? E[f.e] : 'نطلب الرقم السري قبل الإرسال. الرقم ببلد العائلة.'}</small></label>
  ${offline() ? callout('أنت غير متصل. إرسال الرمز يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('أرسل رمز التحقق', 'ph2Send', offline() ? '" disabled="' : '', 'lock')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt')}`; }
const em2Mask = () => S.em2.a.replace(/^(.)[^@]*(@.*)$/, '$1•••$2');
surface('login-add', {
  kind: 'sheet', t: 'طريق دخول ثانٍ', sys: 'S1-02', p: 'adult', req: '02:2,3,22,23,24,29',
  note: 'لمن سجّل برقمه: يضيف بريداً طريقَ دخول ثانياً. لا يُضاف قبل أن يضغط الرابط الذي يصله، وإرسال الرابط بالرقم السري لأن من يملك طريق الدخول يملك الحساب. بريد لحساب آخر يُرفض. إزالته بالرقم السري، والرقم يبقى. للتجربة: بريد ينتهي بـ@down.test يُظهر تعذّر الخدمة، و sara@example.com بريد لحساب آخر. الاتجاه الآخر بالقواعد نفسها: من سجّل ببريده (سارة) يضيف رقماً، ولا يُضاف قبل أن يُكتب رمز التحقق الذي يصله؛ خمس محاولات خاطئة ثم انتظار.',
  r(k) { if (k === 'phone') return ph2Sheet(); const f = S.em2F || {}, st = em2St();
    if (st === 'ok') return `<h4>بريدك للدخول</h4><p class="d">تدخل إلى «عائلتي» برقمك أو بهذا البريد، أيهما تيسّر.</p>${list(row('mail', `<span class="ltr">${S.em2.a}</span>`, 'مؤكَّد', { chev: false, v: ic('check_circle') }))}${btn('أزِل هذا البريد', 'em2Rm', 'sec', 'lock')}<div class="gap"></div>${btn('إغلاق', 'close', 'txt')}`;
    if (st === 'sent') return `<h4>افتح بريدك</h4><p class="d">أرسلنا رابطاً إلى <span class="ltr b">${S.em2.a}</span>. اضغطه من هذا الهاتف فيُضاف البريد إلى حسابك. لا يُضاف شيء قبل ذلك.</p>${btn('جرّب: كأني ضغطت الرابط', 'em2Open', 'ton')}<div class="gap"></div>${btn('أرسل الرابط مرة أخرى', 'em2Again', offline() ? 'sec" disabled="' : 'sec')}<div class="gap"></div>${btn('ألغِ الإضافة', 'em2Cancel', 'txt')}<p class="xs muted c" style="margin-top:12px">لم يصل؟ انظر في مجلد الرسائل غير المرغوبة.</p>`;
    const E = { bad: 'اكتب بريداً صحيحاً مثل name@example.com', used: 'هذا البريد لحساب آخر. اكتب بريداً غيره.', down: 'لم نستطع الوصول إلى خدمة البريد. حاول بعد قليل؛ دخولك برقمك يعمل.' };
    return `<h4>أضف بريداً للدخول</h4><p class="d">طريق دخول ثانٍ إن تعذّر رقمك. نرسل إليه رابطاً، ولا يُضاف البريد قبل أن تضغطه.</p>
    <label class="fld ${f.e ? 'err' : ''}"><span>البريد الإلكتروني</span><input id="em2" dir="ltr" inputmode="email" placeholder="name@example.com" value="${f.a || ''}"><small>${f.e ? E[f.e] : 'نطلب رقمك السري قبل الإرسال.'}</small></label>
    ${offline() ? callout('أنت غير متصل. إرسال الرابط يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('أرسل رابط التأكيد', 'em2Send', offline() ? '" disabled="' : '', 'lock')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt')}`; },
});
surface('fam-edit', {
  kind: 'sheet', t: 'تعديل العائلة', sys: 'S1-02', p: 'owner', req: '02:7,30 01:12',
  note: 'للمالك (أو من أعطاه الصلاحية الكاملة) وحده، بعد إنشاء العائلة. الاسم يُحفظ مباشرة مع تراجع. البلد والتوقيت بالرقم السري: البلد يغيّر الأسعار وطرق الدفع لما يُشترى بعده ولا يمس اشتراكاً قائماً، والتوقيت يحرّك أوقات النوم والمدرسة ونهاية اليوم عند كل الأبناء. تغيير البلد لا يغيّر التوقيت (Q-264). كل تغيير يُسجَّل باسم صاحبه. يحتاج اتصالاً.',
  r(k) { const f = S.fmF || {}, off = offline(), offC = off ? callout('أنت غير متصل. هذا التغيير يحتاج اتصالاً.', 'wa', 'cloud_off') : '';
    if (k === 'reg') { const cur = S.reg || 'YE', v = f.reg || cur;
      return `<h4>بلد العائلة</h4><p class="d">البلد يحدد الأسعار وطرق الدفع وطريقة وصول رمز التحقق. التوقيت لا يتغير معه.</p>${list(Object.keys(OB_REG).map(x => row('', OB_REG[x][3] + ' ' + OB_REG[x][0], x === cur ? 'البلد الحالي' : '', { a: 'famPick:reg:' + x, chev: false, v: x === v ? ic('check') : '' })))}
      ${v !== cur ? callout(`<b>ما يتغير:</b> أسعار ${OB_REG[v][0]} وطرق الدفع فيها تسري على أي شراء أو تجديد بعد الآن.<br><b>ما لا يتغير:</b> اشتراكك الحالي يبقى كما هو حتى نهايته، والتوقيت، وكل القواعد.`, 'nt', 'info') : ''}${offC}${btn('احفظ بالرقم السري', 'famSave:reg', v === cur || off ? '" disabled="' : '', 'lock')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt')}`; }
    if (k === 'tz') { const cur = S.tz || OB_DEV_TZ, v = f.tz || cur;
      return `<h4>توقيت العائلة</h4><p class="d">تُحسب به أوقات النوم والمدرسة ونهاية اليوم لكل الأبناء.</p>${list(OB_TZ.map(([c, u]) => row('', c, c === cur ? 'التوقيت الحالي' : '', { a: 'famPick:tz:' + c, chev: false, v: `<span class="ltr">${u}</span>` + (c === v ? ic('check') : '') })))}
      ${v !== cur ? callout(`<b>يسري فوراً</b> عند كل الأبناء: أوقات النوم والمدرسة ونهاية اليوم تُحسب بتوقيت ${v}. القواعد نفسها لا تتغير.`, 'nt', 'info') : ''}${offC}${btn('احفظ بالرقم السري', 'famSave:tz', v === cur || off ? '" disabled="' : '', 'lock')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt')}`; }
    return `<h4>اسم العائلة</h4><p class="d">يراه كل أفراد العائلة، ويظهر في الدعوات.</p><label class="fld ${f.e ? 'err' : ''}"><span>الاسم</span><input id="fmN" maxlength="30" value="${f.n != null ? f.n : famN()}"><small>${f.e ? 'اكتب اسماً من حرفين إلى 30 حرفاً.' : 'من حرفين إلى 30 حرفاً.'}</small></label>${offC}${btn('احفظ', 'famSave:name', off ? '" disabled="' : '')}<div class="gap"></div>${btn('إلغاء', 'close', 'txt')}`; },
});
Object.assign(ACT, {
  em2Send() { const a = (($('#em2') || {}).value || '').trim().toLowerCase(), f = S.em2F = { a };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a)) { f.e = 'bad'; return; } if (a === 'sara@example.com') { f.e = 'used'; return; } if (/@down\.test$/.test(a)) { f.e = 'down'; return; }
    gate('إضافة بريد للدخول إلى حسابك', () => { S.em2 = { a, st: 'sent' }; S.em2F = null; audit('طُلبت إضافة بريد للدخول إلى الحساب', 'identity.email.login'); }); },
  em2Open() { if (!S.em2) return; S.em2.st = 'ok'; audit('أُضيف بريد للدخول إلى الحساب', 'identity.email.login'); toast('أُضيف البريد · تدخل به أو برقمك', null, 'mark_email_read'); },
  em2Again() { toast('أرسلنا الرابط مرة أخرى', null, 'mail'); },
  em2Cancel() { S.em2 = null; S.em2F = null; S.sheet = null; toast('أُلغيت الإضافة · لم يتغير شيء في حسابك'); },
  em2Rm() { S.sheet = null; gate('إزالة البريد من حسابك', () => { S.em2 = null; audit('أُزيل بريد الدخول من الحساب', 'identity.email.login'); toast('أُزيل البريد · دخولك برقمك كما هو'); }); },
  ph2Send() { const a = phoneOf('#ph2'), f = S.ph2F = { a };
    if (!ph2CC()[5].test(a)) { f.e = 'bad'; return; } if (a === '777000111') { f.e = 'used'; return; } if (/000000$/.test(a)) { f.e = 'down'; return; }
    gate('إضافة رقم للدخول إلى حسابك', () => { S.ph2 = { a, st: 'code', bad: 0 }; S.ph2F = null; audit('طُلبت إضافة رقم للدخول إلى الحساب', 'identity.login'); go('login-add', 'phone'); }); },
  ph2Ok() { const p = S.ph2; if (!p || p.st !== 'code' || p.bad >= 5) return; const v = latinDigits((($('#ph2c') || {}).value || '')).replace(/\D/g, '');
    if (v !== '246810') { p.bad++; return; } p.st = 'ok'; p.bad = 0; audit('أُضيف رقم للدخول إلى الحساب', 'identity.login'); toast('أُضيف الرقم · الدخول به أو بالبريد', null, 'call'); },
  ph2Again() { if (!S.ph2) return; S.ph2.bad = 0; toast('أُرسل رمز جديد عبر واتساب', null, 'sms'); },
  ph2Cancel() { S.ph2 = null; S.ph2F = null; S.sheet = null; toast('أُلغيت الإضافة · لم يتغير شيء في حسابك'); },
  ph2Rm() { S.sheet = null; gate('إزالة الرقم من حسابك', () => { S.ph2 = null; audit('أُزيل رقم الدخول من الحساب', 'identity.login'); toast('أُزيل الرقم · الدخول بالبريد كما هو'); }); },
  famEdit(k) { S.fmF = {}; go('fam-edit', k); },
  famPick(k, v) { S.fmF = S.fmF || {}; S.fmF[k] = v; },
  famSave(k) { const f = S.fmF = S.fmF || {};
    if (k === 'name') { const v = (($('#fmN') || {}).value || '').trim().replace(/\s+/g, ' '); f.n = v; if (v.length < 2 || v.length > 30) { f.e = 1; return; } const was = famN(); S.sheet = null; S.fmF = null; if (v === was) return;
      S.famName = v; audit(`غُيّر اسم العائلة من «${was}» إلى «${v}»`, 'shell.config.edit'); toast('حُفظ اسم العائلة', () => { S.famName = was; render(); }); return; }
    if (k === 'reg') { const v = f.reg, was = S.reg || 'YE'; if (!v || v === was) return; S.sheet = null;
      gate('تغيير بلد العائلة إلى ' + OB_REG[v][0], () => { S.reg = v; S.fmF = null; audit(`غُيّر بلد العائلة من ${OB_REG[was][0]} إلى ${OB_REG[v][0]}`, 'shell.config.edit'); toast(`بلد العائلة الآن ${OB_REG[v][0]} · اشتراكك الحالي كما هو`, null, 'public'); }); return; }
    const v = f.tz, was = S.tz || OB_DEV_TZ; if (!v || v === was) return; S.sheet = null;
    gate('تغيير توقيت العائلة إلى ' + v, () => { S.tz = v; S.fmF = null; audit(`غُيّر توقيت العائلة من ${was} إلى ${v}`, 'shell.config.edit'); toast(`توقيت العائلة الآن ${v} · يسري عند كل الأبناء`, null, 'schedule'); }); },
});
surface('templates', {
  t: 'القوالب', sys: 'S1-01', p: 'adult', req: '01:4 03:13 02:13',
  note: 'قالبا العرض (الطفل والمراهق) وقوالب الصلاحيات الثلاثة. كل صف قالب عرض يفتح معاينة «ما يراه» لابن من ذلك القالب (العرض كـ — Q-425)، ولا يحوّل الأب إلى ابنه. القالبان معتمدان (Q-417 · Q-426). لا قالب خاصاً بمن هم دون 7 في هذه المرحلة: يستعملون قالب الطفل (Q-426).',
  r() { return callout('سنة الميلاد تحدد القالب تلقائياً، ولا يُبدَّل يدوياً في المرحلة 1.', '', 'info') + sec('قوالب العرض') + list(row('face', 'الطفل', 'حتى 12 سنة · أربعة تبويبات', { v: 'ليان', a: 'go:view-as:layan' }), row('person', 'المراهق', '13–17 سنة · استقلالية وشفافية', { v: 'خالد', a: 'go:view-as:khaled' })) + sec('قوالب الصلاحيات') + list(row('handshake', 'شريك', '43 مفتاحاً', { a: isOwner() ? 'go:tpl-diff:partner' : '' }), row('shield_person', 'وصي محدود', '24 مفتاحاً', { a: isOwner() ? 'go:tpl-diff:guardian' : '' }), row('visibility', 'مراقب', '10 مفاتيح', { a: isOwner() ? 'go:tpl-diff:observer' : '' })); },
});
/* ============ «العرض كـ» (DS-CC-09 · DS-NV-10 — كان محمولاً بـ Q-407 إلى مراجعة الربط الأخيرة) ============
   الأب يرى رئيسية ابنه كما تظهر على جهاز الابن: شريط معاينة ثابت، وبلا أي فعل، وبلا محتوى رسائل. */
const vaP = id => (M[id].role === 'teen' ? 'teen' : 'child');
const vaKid = id => (KIDS.includes(id) ? id : 'layan');
surface('view-as', {
  t: id => `ما يراه ${pname(M[vaKid(id)])}`, sys: 'S1-09', p: 'adult', a: ['layan'], req: '09:1,4 01:4 02:13', vmode: id => PERSONA[vaP(vaKid(id))].mode,
  note: '«العرض كـ»: الأب يرى رئيسية ابنه كما تظهر على جهاز الابن، بقالب عمره. شريط المعاينة ثابت في الأعلى، ولا شيء في المعاينة يُضغط، ولا يظهر فيها نص رسالة. يُفتح من ملف الفرد ومن «القوالب». لمن عنده «الرئيسية» من البالغين. الأب لا يتحول إلى ابنه ولا يفعل شيئاً باسمه.',
  r(id) { const k = vaKid(id), m = M[k], p = vaP(k), was = S.persona;
    if (!can('hub.dashboard.view')) return empty('lock_person', 'المعاينة غير مسموحة لكِ', 'يعطيها أحمد مع «الرئيسية».', why('nd:hub.dashboard.view'));
    let h = ''; const wm = PERSONA[p].m; S.persona = p; PERSONA[p].m = k; try { h = SC[TABS[PERSONA[p].mode][0][0]].r(); } finally { S.persona = was; PERSONA[p].m = wm; }   /* المعاينة ببيانات هذا الابن نفسه */
    return `<div class="vabar" role="status">${ic('visibility')}<span class="grow">تعاين الآن ما يراه <b>${pname(m)}</b> على جهازه. للمشاهدة فقط.</span><button class="btn sm sec" data-a="back">أنهِ</button></div><div class="vaw" inert aria-label="معاينة رئيسية ${pname(m)}">${h}</div>`; },
});
surface('registry', {
  t: 'الخدمات', sys: 'S1-09', p: 'owner', req: '09:5,14,15',
  note: 'للمالك وحده: قائمة خدمات التطبيق كما يراها الأب: اسم ووصف وحالة صادقة. الأعداد التقنية (مفاتيح، ودجات، رموز الأنظمة) مخفية. كل صف يفتح صفحة الخدمة. لا واجهة لتسجيل خدمة أو إزالتها: ذلك عند نشر التطبيق؛ والخدمة المُزالة تبقى مذكورة هنا وتنبيهاتها السابقة باقية.',
  r() { if (!isOwner()) return empty('lock_person', 'هذه الصفحة للمالك', 'إعدادات ما سُمح لكِ به تجدينها في «التحكم».', btn('التحكم', 'tab:control', 'sm sec'));
    return `${list(SVC.map(x => row(x.i, x.n, x.d, { a: 'go:svc:' + x.id, v: svcState(x) })))}
    ${sec('خدمات قادمة')}<div class="card flat"><div class="chips">${['التعليم', 'القرآن والصلاة', 'الصحة', 'المالية العائلية'].map(x => chip(x, 'ol', 'hourglass_empty')).join('')}</div><div class="xs muted" style="margin-top:8px">أمثلة فقط؛ الأسماء لم تُحسم بعد. كل خدمة جديدة تظهر هنا من نفسها عند إضافتها للتطبيق.</div></div>`; },
});

/* الخطة والفوترة (S1-04) في screens-billing.js */

/* ---------- الخصوصية والأمان ---------- */
surface('privacy', {
  t: 'الخصوصية والبيانات', sys: 'S1-02', p: 'adult', req: '02:25,26,27,28 01:15,16 08:15', st: 'un',
  note: 'UNKNOWN (Q-046): سياسة تحليلات استخدام الأطفال ما زالت مفتوحة مع المحامي قبل الإطلاق. حتى تُحسم: لا حدث تحليلي من شاشات الطفل، ولا مفتاح لها هنا (حُذف المفتاح المقترح — Q-458). الخلو من الإعلانات وأدوات التتبع ثابت صلب بلا واجهة.',
  r() { return `${callout('لا إعلانات ولا أدوات تتبع في التطبيق، وهذا ثابت لا يُغيَّر بإعداد.', 'ok', 'verified_user')}${sec('ما نشاركه مع الطفل')}${list(row('visibility', 'الطفل يعرف ما يُتابَع', 'الوقت والموقع والمحادثات، لا تفاصيلها', { a: 'go:consent-view' }), row('notifications', 'الإشعار الدائم', 'يعرض الوقت المتبقي، لا عبارة رقابية', { a: 'go:persist' }))}
    ${sec('نسخة من البيانات')}${list(row('download', 'نسخة من بياناتي', S.exp && S.exp.me ? (S.exp.me === 'ready' ? 'جاهزة للتنزيل' : 'قيد التجهيز') : 'ملف يُجهَّز ويصلك رابطه', { a: 'go:export' }), isOwner() ? KIDS.map(k => row('', 'نسخة من بيانات ' + M[k].n, S.exp && S.exp[k] ? (S.exp[k] === 'ready' ? 'جاهزة للتنزيل' : 'قيد التجهيز') : '', { lead: av(M[k], 'sm'), a: 'go:export:' + k })) : '')}
    ${sec('مدة الحفظ')}${list(row('forum', 'المحادثات', 'تبقى حتى يحذفها الأب', { v: 'دائم' }), row('location_on', 'سجل المواقع', 'يُحذف تلقائياً', { v: '7 أيام' }))}${callout('لا نجمع أي بيانات تحليلية من حسابات الأطفال.', 'ok', 'verified_user')}${sec('منطقة الخطر')}${list(row('delete_forever', 'احذف حسابي', S.delP ? `يُحذف بعد ${S.delP} يوماً · اضغط للإلغاء` : 'مهلة تراجع 30 يوماً', { a: 'go:delete-account', ic: 'var(--danger)' }))}`; },
});
surface('export', {
  t: id => (id && M[id] ? 'نسخة من بيانات ' + M[id].n : 'نسخة من بياناتي'), sys: 'S1-02', p: 'adult', req: '02:27',
  note: 'البالغ يطلب نسخة من بياناته هو، والأب يطلب نسخة من بيانات قاصر. التجهيز في الخلفية؛ يصل إشعار، والرابط صالح 7 أيام. الشاشة تقول ما في الملف بكلام عادي ولا تذكر صيغته التقنية.',
  r(id) { const k = id && M[id] ? id : 'me', st = (S.exp || {})[k], who = k === 'me' ? 'بياناتك' : 'بيانات ' + M[k].n;
    if (k !== 'me' && !isOwner()) return empty('lock', 'للأب فقط', 'نسخة بيانات الطفل يطلبها مالك العائلة.', btn('رجوع', 'back', 'sec'));
    const what = `<div class="card"><b>ما في الملف</b>${list(k === 'me' ? [row('person', 'ملفك', 'الاسم والرقم والبريد'), row('forum', 'رسائلك', 'ما كتبته أنت، مع الصور'), row('history', 'ما فعلته', 'القرارات والتغييرات المسجلة باسمك')] : [row('badge', 'ملفه', 'الاسم وسنة الميلاد'), row('task_alt', 'مهامه ونجومه', ''), row('forum', 'رسائله', 'مع الصور'), row('location_on', 'سجل مواقعه', 'آخر 7 أيام'), row('hourglass_top', 'وقت الشاشة', 'المدة لكل تطبيق')])}</div>`;
    if (!st) return `<p class="sub" style="text-align:start">نجمع ${who} في ملف واحد مضغوط تنزّله على هاتفك.</p>${what}${btn('جهّز النسخة', 'expAsk:' + k, '', 'download')}<p class="c xs muted" style="margin-top:12px">يأخذ التجهيز دقائق إلى ساعات. يصلك إشعار حين تجهز.</p>`;
    if (st === 'prep') return `<div class="bigic">${ic('hourglass_top')}</div><p class="ttl md">نجهّز النسخة</p><p class="sub">تستطيع الخروج من هذه الشاشة. يصلك إشعار حين تجهز.</p>${btn('جرّب: كأنها جهزت', 'expReady:' + k, 'ton')}<div class="gap"></div>${btn('ألغِ الطلب', 'expDrop:' + k, 'txt" style="width:100%')}`;
    return `<div class="bigic ok">${ic('download')}</div><p class="ttl md">النسخة جاهزة</p><p class="sub">ملف مضغوط · 18 م.ب · الرابط يعمل 7 أيام ثم يُحذف الملف.</p>${offline() ? callout('أنت غير متصل. التنزيل يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('نزّل الملف', 'expGet', offline() ? '" disabled="' : '', 'download')}<div class="gap"></div>${btn('احذف النسخة الآن', 'expDrop:' + k, 'txt" style="width:100%')}${callout('الملف فيه بيانات خاصة. احفظه في مكان آمن ولا ترسله عبر محادثة عامة.', 'nt', 'lock')}`; },
});
Object.assign(ACT, {
  expAsk(k) { S.exp = S.exp || {}; S.exp[k] = 'prep'; audit(k === 'me' ? 'طلب نسخة من بياناته' : `طلب نسخة من بيانات ${M[k].n}`, 'identity.data.export'); },
  expReady(k) { S.exp[k] = 'ready'; notif('النسخة جاهزة', 'الرابط يعمل 7 أيام', 'download'); },
  expDrop(k) { delete S.exp[k]; toast('حُذف الطلب والملف', null, 'delete'); },
  expGet() { toast('بدأ التنزيل', null, 'download'); },
});
surface('delete-account', {
  t: 'حذف الحساب', sys: 'S1-02', p: 'adult', req: '02:25,28 03:20',
  note: 'حق أصيل لكل بالغ لا يملك الأب سحبه (Q-291). شرح العواقب ← تأكيد ← الرقم السري. حذف بمهلة 30 يوماً يلغيه صاحب الحساب وحده. المالك (Q-402): إن كانت الصلاحية الكاملة عند بالغ آخر حذف حسابه، ويدير ذلك البالغ العائلة خلال المهلة ويصير مالكها عند اكتمالها؛ وإن تراجع المالك عاد مالكاً. وإن لم تكن عند أحد فعليه أن يعطيها أولاً أو يحذف العائلة.',
  r() { const root = isRoot(), d = root ? S.ownDel : S.delP, lock = !root && S.ownDel && S.co;
    if (d) return `<div class="bigic wa">${ic('auto_delete')}</div><p class="ttl md">حسابك يُحذف بعد ${d} يوماً</p><p class="sub">في 16 ديسمبر 2026 يُمحى نهائياً. إلى ذلك الحين أنت خارج العائلة، وتستطيع التراجع من هنا.</p>${root ? callout('<b>سارة تدير العائلة الآن</b><br>إن تراجعت عدت مالكاً كما كنت. وإن اكتملت المهلة صارت سارة مالكة العائلة.', 'wa', 'admin_panel_settings') : ''}${btn('ألغِ الحذف واستعد حسابي', 'delUndo', '', 'undo')}${callout('لا أحد غيرك يستطيع إلغاء الحذف أو تعجيله.', 'nt', 'info')}`;
    if (lock) return empty('admin_panel_settings', 'أنتِ من يدير العائلة الآن', `أحمد يحذف حسابه. لا يُحذف حسابكِ حتى يتراجع أو تكتمل مهلته (${S.ownDel} يوماً) فتصيري المالكة.`, btn('رجوع', 'back', 'sec'));
    return `<div class="bigic da">${ic('delete_forever')}</div><p class="ttl md">ماذا يحدث عند الحذف؟</p><div class="card"><div class="tl"><div class="ev wa"><b>اليوم: يتوقف الحساب</b><span>تخرج من العائلة ومن كل أجهزتك</span></div><div class="ev"><b>خلال 30 يوماً: تستطيع التراجع</b><span>ادخل برقمك واضغط «ألغِ الحذف»</span></div><div class="ev da"><b>بعد 30 يوماً: محو نهائي</b><span>لا يمكن الاسترجاع</span></div></div></div>${root && S.co ? callout('<b>أنت مالك العائلة، والصلاحية الكاملة عند سارة</b><br>بعد حذف حسابك تدير سارة العائلة وحدها. وإن اكتملت الثلاثون يوماً صارت هي مالكة العائلة. يصلها إشعار الآن.', 'wa', 'admin_panel_settings') + list(row('download', 'خذ نسخة من بياناتك أولاً', '', { a: 'go:export' })) + btn('احذف حسابي', 'delGo', 'dng') : root ? callout('<b>أنت مالك العائلة</b><br>لا يُحذف حسابك والعائلة بلا من يديرها. أعطِ بالغاً آخر الصلاحية الكاملة أولاً فيصير مالكها بعدك، أو احذف العائلة كلها.', 'wa', 'warning') + btn('أعطِ الصلاحية الكاملة أولاً', 'go:transfer', 'sec') + '<div class="gap"></div>' + btn('حذف العائلة', 'go:family-delete', 'txt') : list(row('download', 'خذ نسخة من بياناتك أولاً', '', { a: 'go:export' })) + btn('احذف حسابي', 'delGo', 'dng')}`; },
});
Object.assign(ACT, {
  delGo() { const root = isRoot(); confirmDlg('حذف حسابك؟', root ? 'تخرج من العائلة الآن وتديرها سارة. أمامك 30 يوماً للتراجع، وبعدها تصير سارة المالكة.' : 'تخرج من العائلة الآن. أمامك 30 يوماً للتراجع.', 'تابع', () => gate('حذف الحساب', () => { if (root) S.ownDel = 30; else S.delP = 30; audit('طلب حذف حسابه · مهلة 30 يوماً', 'identity.account.delete_self'); toast('بدأت مهلة الـ30 يوماً', null, 'auto_delete'); }, 'stepup'), true); },
  delUndo() { if (isRoot()) S.ownDel = 0; else S.delP = 0; audit('ألغى حذف حسابه', 'identity.account.delete_self'); toast('أُلغي الحذف · حسابك كما كان'); },
});
surface('security', {
  t: 'الأمان', sys: 'S1-02', p: 'adult', req: '02:5,6,16,20 01:5,23',
  note: 'البصمة مفتاحان منفصلان، وكلاهما مطفأ حتى يشغّله صاحب الهاتف بالرقم السري (Q-219): الأول يفتح التطبيق، والثاني يجعل تأكيد الأفعال الحساسة بالبصمة بدل الرقم السري (Q-418). يبقى الرقم السري مطلوباً على أجهزة الأبناء، ولتغييره ولتشغيل البصمة، وبعد ثلاث محاولات فاشلة أو تغيّر بصمات الهاتف، ومرة كل 30 يوماً. تغيير الرقم السري يطفئ التأكيد بالبصمة. لا تظهر هنا كلمات مثل TOTP أو مفتاح التوقيع: مكانها المواصفة.',
  r() { const own = isOwner(), q = S.recReq, n = S.sess.length;
    return `${S.bioChg ? `<button class="callout wa" style="width:100%;text-align:start" data-a="go:rekey">${ic('fingerprint')}<div><b>تغيّرت بصمات هذا الهاتف</b><br>اكتب رقمك السري مرة واحدة لنتأكد أنك أنت.</div></button>` : ''}${q && q.st !== 'cancelled' ? `<button class="callout da" style="width:100%;text-align:start" data-a="go:recover-review">${ic('lock_reset')}<div><b>طلب استرداد حساب أحمد</b><br>${q.st === 'pending' ? 'بانتظار تأكيد جهة الاسترداد' : 'بقي 7 أيام · اضغط للمراجعة'}</div></button>` : ''}
    ${sec('البصمة أو الوجه')}${list(row('fingerprint', 'افتح التطبيق بالبصمة', 'للدخول إلى «عائلتي» على هذا الهاتف', { tg: !!S.bio, ta: 'bioT' }), row('verified_user', 'أكّد الأفعال الحساسة بالبصمة', S.bioAct ? 'بدل الرقم السري، على هذا الهاتف' : 'الآن تؤكَّد بالرقم السري', { tg: !!S.bioAct, ta: 'bioActT' }))}${S.bioAct ? callout('كل من له بصمة مسجّلة في هذا الهاتف يستطيع تأكيد هذه الأفعال باسمك.', 'wa', 'warning') : ''}<p class="xs muted" style="margin:0 4px 16px">الأفعال الحساسة مثل: تغيير الخطة والدفع، منح صلاحية حساسة، إيقاف القواعد، حذف فرد أو العائلة.${S.bioAct ? ` ويبقى الرقم السري مطلوباً: على أجهزة الأبناء، ولتغيير الرقم أو تشغيل البصمة، وبعد ثلاث محاولات فاشلة أو تغيّر بصمات الهاتف، ومرة كل ${PIN_EVERY} يوماً حتى لا تنساه.` : ''}</p>
    ${sec('الرقم السري')}${list(row('pin', 'الرقم السري', !S.pin.set ? 'لم يُنشأ بعد' : S.bioAct ? ((S.pinAgo || 0) >= PIN_EVERY ? 'غيّر رقمك السري · نطلبه منك في التأكيد القادم' : `غيّر رقمك السري · نطلبه منك مرة بعد ${rwDy(PIN_EVERY - (S.pinAgo || 0))}`) : 'غيّر رقمك السري', { a: own ? 'pinChange' : 'denied:shell.parent_gate.manage', v: own ? (S.pin.set ? '' : chip('أنشئه', 'wa')) : ic('lock') }))}
    ${sec('أجهزتي')}${list(row('devices', 'الأجهزة التي دخلتُ منها', 'هذا الهاتف' + (n > 1 ? ` و${n - 1} آخر` : ' فقط'), { a: 'go:sessions' }), row('password', 'رمز الدخول لجهاز جديد', 'يُطلب منك عند الدخول من هاتف آخر', { a: 'go:login-code' }))}
    ${sec('إن فقدت الهاتف والرقم')}${list(own ? row('support', 'من يساعدك على العودة', S.rec ? '' : 'لم تختر أحداً بعد', { v: S.rec ? M[S.rec].n : chip('اختر', 'wa'), a: 'go:recovery' }) : row('support', 'العودة إلى حسابك', 'يدعوك أحمد من جديد برقمك الجديد', { a: 'go:recovery' }))}`; },
});
Object.assign(ACT, {
  bioT() { if (S.bio) { S.bio = false; toast('أُطفئ الفتح بالبصمة'); return; } gate('اكتب رقمك السري لتشغيل الفتح بالبصمة', () => { S.bio = true; toast('شُغّل الفتح بالبصمة على هذا الهاتف', null, 'fingerprint'); }, 'pin'); },
  /* Q-418: التأكيد بالبصمة يُشغَّل بالرقم السري نفسه (من لا يعرفه لا يشغّله)، ويُطفأ بلا شرط */
  bioActT() {
    if (S.bioAct) { S.bioAct = false; audit('أُطفئ تأكيد الأفعال الحساسة بالبصمة · ' + gateDev(), 'identity.biometric.enable'); toast('عاد التأكيد بالرقم السري', null, 'pin'); return; }
    if (!S.pin.set) return toast('أنشئ الرقم السري أولاً', null, 'pin');
    gate('اكتب رقمك السري لتشغيل التأكيد بالبصمة', () => { S.bioAct = true; audit('شُغّل تأكيد الأفعال الحساسة بالبصمة · ' + gateDev(), 'identity.biometric.enable'); toast('الأفعال الحساسة تؤكَّد الآن بالبصمة على هذا الهاتف', null, 'fingerprint'); }, 'pin');
  },
  /* التغيير يتطلب الرقم الحالي نفسه لا البصمة (S1-01 §7)؛ والإنشاء الأول بلا رقم سابق */
  pinChange() { if (!S.pin.set) return pinSetOpen('create'); gate('أدخل الرقم الحالي لتغييره', () => pinSetOpen('change'), 'pin'); },
});
surface('sessions', {
  t: 'الأجهزة التي دخلتُ منها', sys: 'S1-02', p: 'adult', req: '02:6',
  note: 'يبقى الدخول ما دمت تستخدم التطبيق، وبحد أقصى 30 يوماً ثم يُطلب الرمز من جديد. إخراج جهاز واحد بتأكيد؛ إخراج كل الأجهزة الأخرى بالرقم السري. أجهزة الأطفال ليست هنا: تلك تُفك من ملف الطفل.',
  r() { const o = S.sess.filter(x => !x.cur); return `${list(S.sess.map((x, i) => row(x.i, x.n, x.cur ? 'هذا الهاتف · الآن' : `${x.at} · ${x.pl}`, { v: x.cur ? chip('الحالي', 'ok') : `<button class="btn txt sm" style="color:var(--danger)" data-a="sessEnd:${i}">أخرِجه</button>` })))}
    <p class="xs muted" style="margin:0 4px 12px">يبقى دخولك ما دمت تستخدم التطبيق، وبحد أقصى 30 يوماً ثم نطلب رمز التحقق من جديد.</p>
    ${o.length ? btn('أخرِج كل الأجهزة الأخرى', 'sessAll', 'sec', 'logout') : callout('لا جهاز آخر داخل إلى حسابك.', 'ok', 'verified_user')}<div class="gap"></div>${btn('اخرج من هذا الهاتف', 'signOut', 'txt" style="width:100%')}
    ${callout('ترى جهازاً لا تعرفه؟ أخرِجه ثم غيّر رقمك السري.', 'nt', 'help')}`; },
});
Object.assign(ACT, {
  sessEnd(i) { const x = S.sess[+i]; confirmDlg(`إخراج ${x.n}؟`, 'يخرج فوراً ويحتاج إلى رقمك ورمز التحقق ليدخل مجدداً.', 'أخرِجه', () => { S.sess.splice(+i, 1); audit(`أُخرج الجهاز ${x.n} من الحساب`, 'identity.session.revoke'); toast(`أُخرج ${x.n}`, null, 'logout'); }, true); },
  sessAll() { gate('إخراج كل الأجهزة الأخرى', () => { S.sess = S.sess.filter(x => x.cur); audit('أُخرجت كل الأجهزة الأخرى من الحساب', 'identity.session.revoke'); toast('أُخرجت كل الأجهزة الأخرى', null, 'logout'); }, 'stepup'); },
});
surface('login-code', {
  t: 'رمز الدخول لجهاز جديد', sys: 'S1-02', p: 'adult', req: '02:5',
  note: 'بديل شاشة «تفعيل TOTP»، اعتمده المالك (Q-400): التطبيق نفسه يولّد الرمز على الهاتف الموثوق، فلا تطبيق خارجي ولا QR ولا مفتاح يُنسخ. التفعيل ما زال إلزامياً بلا تخطٍّ (Q-246) لكنه يحدث تلقائياً عند أول تحقق. وإن فشل التسجيل الصامت أُعيد وحده عند كل فتح باتصال، وهذه الصفحة تقول «رمزك يُجهَّز» حتى ينجح (Q-460) — جرّبها من لوحة العرض.',
  r() { if (S.totpPend) return `${empty('hourglass_top', 'رمزك يُجهَّز', 'لم يكتمل تسجيل هذا الهاتف هاتفاً موثوقاً بعد. يكتمل وحده عند فتح التطبيق وهو متصل.')}${callout(offline() ? 'أنت غير متصل الآن. اتصل ثم افتح هذه الصفحة.' : 'نحاول الآن. عُد بعد لحظات.', 'nt', offline() ? 'cloud_off' : 'sync')}`;
    return `<p class="sub" style="text-align:start">إن دخلت من هاتف آخر وطلبنا منك رمزاً، فاكتب هذا الرمز هناك.</p><div class="code">314 159</div><div class="chips" style="justify-content:center;margin-bottom:16px">${chip('يتغير بعد 18 ثانية', 'in', 'timer')}</div>${callout('لا ترسل هذا الرمز لأحد ولا تقله في الهاتف. «عائلتي» لا تتصل بك لتطلبه.', 'wa', 'warning')}${callout('يعمل بلا إنترنت. الرمز يخرج من هذا الهاتف نفسه.', 'nt', 'cloud_off')}`; },
});
surface('bio-unlock', {
  kind: 'full', t: 'الفتح بالبصمة', sys: 'S1-02', p: 'adult', req: '02:16 01:5',
  note: 'يظهر عند فتح التطبيق في وضع الأهل إن شغّل صاحبه الفتح بالبصمة. ثلاث محاولات فاشلة ← الرقم السري. لا يظهر أبداً على جهاز طفل. وهو غير تأكيد الأفعال الحساسة بالبصمة: ذاك مفتاح آخر في «الأمان» (Q-418).',
  r() { const f = S.bioF || 0; return `<div class="body" style="justify-content:center;text-align:center"><img src="assets/brand/logo-symbol.svg" alt="" width="72" height="60" style="margin:0 auto 16px"><p class="ttl">أهلاً ${me().n}</p><p class="sub">${f ? `لم نتعرف على البصمة. بقيت ${3 - f} ${3 - f === 1 ? 'محاولة' : 'محاولتان'}.` : 'المس حساس البصمة لتفتح «عائلتي».'}</p><button class="bigic fp${f ? ' bad' : ''}" data-a="bioOk" aria-label="افتح بالبصمة">${ic('fingerprint')}</button>${btn('استعمل الرقم السري', 'bioPin', 'sec', 'pin')}<div class="gap"></div>${btn('جرّب: بصمة غير معروفة', 'bioBad', 'txt" style="width:100%')}</div>`; },
});
Object.assign(ACT, {
  bioOk() { S.bioF = 0; S.full = null; },
  bioBad() { S.bioF = (S.bioF || 0) + 1; if (S.bioF >= 3) { S.bioF = 0; gate('ثلاث محاولات فاشلة بالبصمة · اكتب رقمك السري', () => {}, 'pin'); } },
  bioPin() { S.bioF = 0; gate('افتح «عائلتي» بالرقم السري', () => {}, 'pin'); },
});
surface('rekey', {
  t: 'تغيّرت بصمات هذا الهاتف', sys: 'S1-02', p: 'adult', req: '02:16 01:23',
  note: 'حين تُضاف بصمة إلى الهاتف أو تُحذف منه، لا نثق بالبصمة حتى يكتب صاحب الحساب رقمه السري مرة واحدة. الشاشة لا تذكر «مفتاح التوقيع»: تقول ما حدث وما المطلوب. إلى أن يفعل، الأفعال الحساسة متوقفة والباقي يعمل.',
  r() { if (!S.bioChg) return empty('verified_user', 'هذا الهاتف موثوق', 'لا شيء مطلوب منك.', btn('رجوع', 'back', 'sec'));
    return `<div class="bigic wa">${ic('fingerprint')}</div><p class="ttl md">أُضيفت بصمة أو حُذفت</p><p class="sub">تغيّرت البصمات المسجلة على هذا الهاتف. لنتأكد أنك أنت، اكتب رقمك السري مرة واحدة.</p>${list(row('lock', 'متوقف إلى أن تكتبه', 'فكّ إقران جهاز · إيقاف القواعد · حذف العائلة'), row('check_circle', 'يعمل كالعادة', 'المتابعة والمحادثة والمهام والاستغاثة'))}${btn('اكتب الرقم السري', 'rekeyGo', '', 'pin')}${callout('لم تغيّر البصمات أنت؟ اكتب الرقم السري ثم غيّره من «الأمان».', 'nt', 'help')}`; },
});
ACT.rekeyGo = () => gate('تأكيد أنك أنت بعد تغيّر البصمات', () => { S.bioChg = 0; audit('أُعيد توثيق هذا الهاتف بالرقم السري بعد تغيّر البصمات', 'shell.device_key'); toast('عاد هذا الهاتف موثوقاً', null, 'verified_user'); }, 'pin');
surface('recovery', {
  t: 'إن فقدت الهاتف والرقم', sys: 'S1-02', p: 'adult', req: '02:20',
  note: 'الأب يختار مسبقاً بالغاً من العائلة يساعده على العودة. تغيير الاختيار بالرقم السري. إن لم يكن في العائلة بالغ آخر فالشاشة تقول ذلك وتفتح الدعوة. البالغ غير المالك لا جهة استرداد له في المواصفة: يدعوه الأب من جديد (يحتاج تأكيد المالك).',
  r() { const own = isOwner(), ad = Object.values(M).filter(m => m.role === 'adult' && !m.owner);
    if (!own) return `${S.rec === me().id ? callout('<b>اختاركِ أحمد لتساعديه.</b> إن فقد هاتفه ورقمه يصلك طلب، وتؤكدين أنه هو بعد أن تسمعي صوته.', 'ok', 'support') : ''}${callout('إن فقدتِ أنتِ هاتفك ورقمك: أخبري أحمد، فيدعوك من جديد برقمك الجديد.', 'nt', 'info')}${S.recReq && S.recReq.st !== 'cancelled' ? btn('راجعي طلب أحمد', 'go:recover-review', '', 'lock_reset') : ''}`;
    return `<p class="sub" style="text-align:start">اختر فرداً بالغاً تثق به. إن ضاع هاتفك ورقمك معاً، يؤكد لنا أنك أنت فتعود برقم جديد.</p>
    ${ad.length ? list(ad.map(m => row('', m.n, m.rel, { lead: av(m), a: 'recPick:' + m.id, chev: false, v: S.rec === m.id ? chip('اختيارك', 'ok', 'check') : '' }))) : empty('group_add', 'لا بالغ آخر في العائلة', 'ادعُ بالغاً تثق به أولاً، ثم اختره هنا.', btn('ادعُ بالغاً', 'go:invite', '', 'person_add'))}
    ${S.rec ? btn('لا أريد أحداً', 'recPick:', 'txt" style="width:100%') : ad.length ? callout('لم تختر أحداً. إن فقدت هاتفك ورقمك معاً فلن نستطيع إعادة حسابك.', 'wa', 'warning') : ''}
    ${sec('كيف تعود')}<div class="card"><div class="tl"><div class="ev"><b>تطلب العودة برقم جديد</b><span>من شاشة الدخول: «فقدت هاتفك ورقمك؟»</span></div><div class="ev"><b>${S.rec ? M[S.rec].n + ' ' + vb(M[S.rec], 'يؤكد', 'تؤكد') : 'من اخترته يؤكد'} أنك أنت</b><span>بعد أن يسمع صوتك</span></div><div class="ev wa"><b>انتظار 7 أيام</b><span>يُبلَّغ كل البالغين · أي اعتراض يلغي الطلب</span></div><div class="ev ok"><b>يعود حسابك</b><span>برقمك الجديد</span></div></div></div>`; },
});
ACT.recPick = id => gate(id ? `اختيار ${M[id].n} لتساعدك على العودة` : 'إزالة من يساعدك على العودة', () => { S.rec = id || null; audit(id ? `اختير ${M[id].n} جهة استرداد` : 'أُزيلت جهة الاسترداد', 'identity.recovery'); toast(id ? `اخترت ${M[id].n} · وصل الإشعار` : 'لم يعد لك من يساعدك على العودة', null, 'support'); }, 'pin');
surface('unpair', {
  t: id => 'فكّ إقران جهاز ' + M[id].n, sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:15 01:5,6 10:27',
  note: 'للمالك فقط وبرقمه السري. الشاشة تقول ما يتوقف وما يبقى قبل التنفيذ. بعده يخرج ذلك الجهاز من العائلة ويصير هاتفاً عادياً، وقواعد الطفل تبقى محفوظة لجهازه القادم.',
  r(id) { const m = M[id]; if (!isOwner()) return empty('lock', 'للأب فقط', 'فكّ الإقران يفعله مالك العائلة برقمه السري.', btn('رجوع', 'back', 'sec'));
    if ((S.unp || {})[id]) return `<div class="bigic ok">${ic('link_off')}</div><p class="ttl md">فُكّ الإقران</p><p class="sub">Samsung Galaxy A14 لم يعد جهاز ${m.n}. قواعد ${m.n} ونجومه ومهامه محفوظة وتنتقل إلى جهازه القادم.</p>${btn('اقرن جهازاً جديداً لـ' + m.n, 'go:pair-code:' + id, '', 'devices')}<div class="gap"></div>${btn('ليس الآن', 'back', 'sec')}`;
    return `<div class="bigic da">${ic('link_off')}</div><p class="ttl md">ماذا يحدث بعد الفك؟</p>${list(row('lock_open', 'تتوقف القواعد على هذا الجهاز', 'وقت الشاشة والتطبيقات والمواقع', { ic: 'var(--danger)' }), row('location_off', 'يتوقف موقعه واستغاثته', 'لا يصلك منه شيء بعد الآن', { ic: 'var(--danger)' }), row('mobile', 'يصير هاتفاً عادياً', 'يمكن بيعه أو إقرانه بعائلة أخرى'), row('inventory_2', `ملف ${m.n} يبقى`, 'قواعده ونجومه ومهامه تنتظر جهازه القادم', { ic: 'var(--success)' }))}
    ${offline() ? callout('أنت غير متصل. فكّ الإقران يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('فكّ الإقران برقمي السري', 'unpairGo:' + id, 'dng' + (offline() ? '" disabled="' : ''), 'pin')}<div class="gap"></div>${btn('تراجع', 'back', 'sec')}`; },
});
ACT.unpairGo = id => gate('فكّ إقران جهاز ' + M[id].n, () => { S.unp = S.unp || {}; S.unp[id] = 1; audit(`فُكّ إقران جهاز ${M[id].n}`, 'identity.device.unpair'); toast('فُكّ الإقران', null, 'link_off'); }, 'stepup');
surface('pin-forgot', {
  t: 'نسيت الرقم السري', sys: 'S1-02', p: 'adult', req: '02:20 01:5',
  note: 'اعتمده المالك (Q-400): S1-01 تمنع إعادة تعيين الرقم السري على الهاتف نفسه وتحيل إلى جهة الاسترداد وانتظار 7 أيام. هذه الشاشة هي ذلك الطريق، وهو نفسه المكتوب لفقدان الرقم (S1-02 REQ-020).',
  r() { const q = S.recReq; if (q && q.kind === 'pin' && q.st !== 'cancelled') return `<div class="bigic">${ic('hourglass_top')}</div><p class="ttl md">${q.st === 'pending' ? 'بانتظار تأكيد ' + M[S.rec || 'sara'].n : 'بقي 7 أيام'}</p><p class="sub">${q.st === 'pending' ? 'اتصل بها وأخبرها أن تفتح «عائلتي».' : 'بعدها تنشئ رقماً سرياً جديداً. أي بالغ في العائلة يستطيع إيقاف الطلب.'}</p>${callout('إلى ذلك الحين: المتابعة والمحادثة والمهام تعمل. الأفعال التي تحتاج الرقم السري متوقفة.', 'nt', 'info')}${btn('ألغِ الطلب — تذكرت الرقم', 'pfDrop', 'sec')}`;
    if (!S.rec) return `${empty('support', 'لم تختر من يساعدك', 'لا نستطيع إنشاء رقم سري جديد على هذا الهاتف وحده، حتى لا يفعلها من يأخذ هاتفك. ولأنك لم تختر فرداً يؤكد أنك أنت، لا طريق الآن.', '')}${callout('ما تحميه بوابة الوالدين يبقى مقفلاً. بقية التطبيق يعمل.', 'wa', 'warning')}`;
    return `<p class="sub" style="text-align:start">لا ننشئ رقماً سرياً جديداً على هذا الهاتف وحده، حتى لا يفعلها من يأخذ هاتفك أو طفلك.</p><div class="card"><div class="tl"><div class="ev"><b>${M[S.rec].n} تؤكد أنك أنت</b><span>من هاتفها</span></div><div class="ev wa"><b>انتظار 7 أيام</b><span>يُبلَّغ كل البالغين · أي اعتراض يلغي الطلب</span></div><div class="ev ok"><b>تنشئ رقماً سرياً جديداً</b><span>على هذا الهاتف</span></div></div></div>${btn('اطلب التأكيد من ' + M[S.rec].n, 'pfAsk', '', 'support')}<div class="gap"></div>${btn('تذكرت الرقم', 'back', 'sec')}`; },
});
Object.assign(ACT, {
  pfAsk() { S.recReq = { st: 'pending', kind: 'pin' }; audit('طلب إنشاء رقم سري جديد عبر جهة الاسترداد', 'identity.recovery'); toast(`أُرسل الطلب إلى ${M[S.rec].n}`, null, 'support'); },
  pfDrop() { S.recReq = null; toast('أُلغي الطلب', null, 'cancel'); },
});

/* ---------- المساعد الذكي ---------- */
const AIK = [['agent.summary.read', 'يلخّص ويقرأ', 'بلا موافقة'], ['agent.plan.create', 'يقترح خطة', 'موافقتك'], ['agent.task.verify', 'يتحقق من المهام', 'يحيل ما لا يجزم به'], ['agent.plan.create', 'يُعدّ المهام', 'بحسب تفويضك', 'tk'], ['agent.message.send', 'يرسل رسالة', 'موافقتك'], ['agent.rule.change', 'يغيّر قاعدة', 'موافقتك + الرقم السري'], ['agent.payment.execute', 'ينفّذ دفعاً', 'موافقتك + الرقم السري'], ['agent.data.delete', 'يحذف بيانات', 'موافقتك + الرقم السري']];
surface('ai', {
  t: 'المساعد الذكي', sys: 'S1-09', p: 'adult', req: '09:18 01:14 04:16 05:17,18 06:7,17',
  note: 'الذكاء مضمَّن في كل خدمة لا تبويباً منفصلاً. الأب يضبط الاستقلالية (الافتراضي «يقترح فقط»). ترتيب الفحص: مفتاح الإيقاف ← مفتاح القدرة + بوابة الموافقة ← الميزانية. السجل يُصفّى بالطفل، وكل صف يفتح تفصيله (إذنه، دليله، نتيجته، التراجع عنه). البالغ المفوَّض يرى ما يخص صلاحياته فقط. أسماء القدرات التقنية مخفية.',
  r() { const own = isOwner(), q = PLAN[S.plan].ai;
    return `<div class="card"><div class="fx sb"><div class="fx">${ic('power_settings_new')}<div><b>مفتاح الإيقاف</b><div class="sm muted">يوقف كل أفعال المساعد فوراً</div></div></div>${tg(!S.aiKill, own ? 'flip:aiKill' : 'denied:agent.rule.change', 'تشغيل المساعد')}</div></div>
    ${S.aiKill ? callout('المساعد متوقف. لا اقتراحات ولا تحقق آلي من المهام؛ كل تسليم يأتيك مباشرة.', 'wa', 'power_settings_new') : `${sec('مستوى الاستقلالية')}${seg([['suggest', 'يقترح فقط'], ['ask', 'ينفّذ بموافقة'], ['auto', 'ينفّذ البسيط']], S.aiLevel, own ? 'set:aiLevel' : 'denied:agent.rule.change')}<p class="xs muted" style="margin:-4px 4px 12px">${{ suggest: 'الافتراضي: لا ينفّذ شيئاً. يعرض اقتراحه وأنت تقرر.', ask: 'يجهّز الفعل ثم ينتظر موافقتك عليه.', auto: 'ينفّذ الأفعال منخفضة الخطورة القابلة للتراجع فقط، ويبلغك.' }[S.aiLevel]}</p>
    <div class="card"><div class="fx sb sm"><b>ميزانية هذا الشهر</b><span>${S.aiUse} من ${q}</span></div><div style="margin:8px 0 4px">${pbar(S.aiUse / q * 100)}</div><div class="xs muted">عند نفادها يتوقف المساعد بهدوء وتبقى كل الخدمات تعمل يدوياً.</div></div>${S.aiUse >= q ? callout(`<b>نفدت عمليات هذا الشهر</b><br>المساعد متوقف بهدوء حتى يبدأ العدّ من جديد. كل تسليم مهمة يأتيك أنت.<div style="margin-top:8px">${btn('ما العمل؟', 'go:plan-limit:ai', 'sm sec')}</div>`, 'wa', 'wand_stars') : ''}
    ${sec('ما يستطيع فعله')}${list(AIK.map(([k, t, g, x], i) => { const tk = x === 'tk', on = tk ? TK().ai.lv !== 'off' : i < 3; return row(on ? 'check_circle' : 'lock', t, tk ? TK_LV[TK().ai.lv][own ? 1 : 4] : g, Object.assign({ ic: on ? 'var(--success)' : 'var(--muted)', v: tk && on ? chip(TK_LV[TK().ai.lv][3], 'ok') : on ? chip('ممنوح', 'ok') : chip('غير ممنوح', '') }, tk ? { a: 'go:tk-ai' } : {})); }))}`}
    ${sec('سجل أفعال المساعد')}${agentLog()}`; },
});
ACT.aiUndo = id => { const g = S.agent.find(x => x.id === id); g.undo = 0; g.st = 'تُرُوجع عنه'; audit('تراجع عن فعل المساعد: ' + g.t, g.k); S.sheet = null; toast('أُعيدت نافذة النوم إلى ما كانت'); };

/* ---------- العرض، المنصة، الصندوق الصادر ---------- */
surface('display', {
  t: 'اللغة والعرض', sys: 'S1-01', p: 'any', req: '01:21 02:18',
  note: 'التطبيق عربي وإنجليزي في هذه النسخة. في هذا النموذج تُرجم الغلاف (التبويبات، التهيئة) فقط لإثبات انقلاب الاتجاه RTL/LTR؛ بقية النصوص عربية.',
  r() { return `${sec('اللغة')}${list(row('', 'العربية', '', { a: 'set:lang:ar', chev: false, v: ic(S.lang === 'ar' ? 'check_circle-fill' : 'radio_button_unchecked') }), row('', 'English', '', { a: 'set:lang:en', chev: false, v: ic(S.lang === 'en' ? 'check_circle-fill' : 'radio_button_unchecked') }))}${sec('المظهر')}${seg([['light', 'فاتح'], ['dark', 'داكن']], S.theme, 'set:theme')}${sec('حجم النص')}${seg([[0.9, 'صغير'], [1, 'عادي'], [1.15, 'كبير'], [1.3, 'أكبر']], S.ts, 'set:ts')}<div class="card"><b>معاينة</b><p class="sm muted" style="margin:4px 0 0">بقي لليان 24 دقيقة اليوم. الحد الأدنى لحجم النص 12 ولا تُضاف مسافات بين الحروف العربية.</p></div>${list(row('animation', 'تقليل الحركة', 'يوقف الانتقالات والاحتفالات', { tg: S.motion === 'off', ta: 'motionT' }), row('today', 'التقويم', '', { v: 'هجري + ميلادي' }))}${sec('الأرقام')}${seg([['latn', '012 لاتينية'], ['arab', '٠١٢ عربية']], S.num, 'numSet')}${sec('الوصول')}${list(row('emergency_home', 'استغاثة بنقرة ثم تأكيد', 'لمن يصعب عليه الضغط المطوّل 3 ثوانٍ', { tg: S.sos2, ta: 'flip:sos2' }))}`; },
});
ACT.motionT = () => { S.motion = S.motion === 'off' ? 'on' : 'off'; };
ACT.numSet = v => { S.num = v; };
surface('health', {
  t: 'معلومات تشخيصية', sys: 'S1-01', p: 'adult', req: '01:3,10,11,12,13,14,17,19,22,23',
  note: 'شاشة للدعم الفني لا للاستخدام اليومي: قراءات هذا الجهاز، وحدة الفرض، التوفر على المنصة، السجلات الأربعة، أعلام الميزات وملف المنطقة. نُقلت من «المزيد» إلى «عن التطبيق» لأنها لا تخدم الأب مباشرة. تنبيه البطارية عند 15%، ولا تنبيه للذاكرة غير قاعدة 2GB (Q-397 — GAP-S1-01-07 أُغلقت). قسم «متى ننبّه» يعرض الأحكام القائمة: البطارية 15% (Q-397)، وكل محاولة تعطيل تنبّه الأب فوراً (S1-10 REQ-021)؛ وتأخر المزامنة فوق 15 دقيقة علامة في هذه الصفحة فقط بلا إشعار (Q-458).',
  r() {
    const ios = S.os === 'ios';
    return `${callout('هذه الصفحة للدعم الفني. إن طلب منك فريق الدعم معلومة عن جهازك فستجدها هنا.', 'nt', 'support_agent')}
    ${sec('هذا الجهاز')}<div class="g2">${[['memory', 'الذاكرة', '3 GB', 'انتقالات كاملة'], ['wifi', 'الاتصال', offline() ? 'منقطع' : S.lbw ? 'ضعيف' : 'جيد', offline() ? 'يعمل محلياً' : S.lbw ? 'توفير البيانات' : 'Wi‑Fi'], ['battery_5_bar', 'البطارية', '72%', 'عادي'], ['rocket_launch', 'الإقلاع البارد', '0.9 ث', 'الهدف < 1.2 ث']].map(([i, t, v, x]) => `<div class="card">${ic(i)}<div class="b" style="font-size:calc(20px*var(--ts));margin-top:4px">${v}</div><div class="sm muted">${t} · ${x}</div></div>`).join('')}</div>
    ${list(row('speed', 'الانتقالات الثقيلة', 'تُعطَّل تلقائياً على الأجهزة دون 2GB', { v: chip('مفعّلة', 'ok') }), row('shield', 'تطبيق القواعد على الجهاز', ios ? 'غير متاحة على iOS · التحكم العميق على أندرويد فقط' : 'تعمل على أجهزة الأطفال فقط · هذا جهاز أهل', { v: ios ? chip('غير متاحة', '') : chip('لا تنطبق', ''), a: ios ? 'why:ios' : '' }), row('key', 'مفتاح توقيع الجهاز', 'مربوط بالعتاد', { v: chip('مسجَّل', 'ok', 'check') }), row('android', 'المنصة', '', { v: ios ? 'iOS' : 'Android' })), row('shield', 'تطبيق القواعد على الجهاز', ios ? 'عبر «مدة استخدام الجهاز» من Apple' : 'عبر خدمة الوصول وإحصاءات الاستخدام في Android', { v: chip(ios ? 'iOS' : 'Android', 'in'), chev: false })}
    ${sec('السجلات المركزية')}${list([['tune', 'ControlRegistry', 'مفاتيح التحكم', ''], ['key', 'PermissionRegistry', 'مفاتيح الصلاحيات', String(FOS_PERM.all.length)], ['widgets', 'WidgetRegistry', 'ودجات الرئيسية', ''], ['notifications', 'NotificationRegistry', 'قنوات التنبيه', '']].map(([i, n, x, c]) => row(i, x, `<span class="mono">${n}</span>`, { v: c ? `<span class="mono">${c}</span>` : chip('مسجَّل', 'ok', 'check'), chev: false })))}
    ${sec('متى ننبّه')}${list(row('battery_alert', 'انخفاض البطارية', 'تنبيه عند نزولها دون هذا الحد', { v: chip('< 15%', 'wa'), chev: false }), row('gpp_maybe', 'محاولة تعطيل الحماية', 'كل محاولة تنبّه الأب فوراً', { v: chip('كل محاولة', 'da'), chev: false }), row('sync_problem', 'تأخر المزامنة', 'علامة هنا فقط · بلا إشعار', { v: chip('> 15 دقيقة', 'ol'), chev: false }))}${sec('أعلام الميزات وملف المنطقة')}${list(row('public', 'المنطقة', 'ملف المنطقة يُحمَّل عند الفتح ويُحفظ', { v: '<span class="mono">YE</span>', chev: false }), row('flag', 'low_bandwidth_default', 'صالح حتى إشعار آخر', { v: chip('on', 'ok'), chev: false }), row('flag', 'otp_channels', '', { v: '<span class="mono xs">whatsapp→sms→call</span>', chev: false }), row('flag', 'payment_routes', 'مسارات الدفع من ملف المنطقة · تفاصيلها في «الخطة والفوترة»', { chev: false }), row('smart_toy', 'ai_gateway_hook', 'خطاف العقد فقط · الميزانية ومفتاح الإيقاف في «المساعد الذكي»', { v: chip('hook', 'ol'), chev: false }))}`;
  },
});
ACT.syncNow = () => { if (offline()) return toast('لا يوجد اتصال الآن · يُرسل كل شيء تلقائياً عند عودته', null, 'cloud_off'); flushOutbox(); S.lastSync = S.lastSync || { n: 0, at: 'الآن' }; S.lastSync.at = 'الآن'; toast('تمت المزامنة', null, 'cloud_done'); };
surface('about', {
  t: 'عن التطبيق', sys: 'S1-01', p: 'any', req: '01:1,3,19,20',
  note: 'الشعار «القمرية»: اختاره المالك (Q-433). شخصية المرشد (B-002) ما زالت مفتوحة ولا تظهر.',
  r() { return `<div class="c" style="padding:16px 0"><img src="assets/brand/logo-horizontal-ar${S.theme === 'dark' ? '-dark' : ''}.svg" alt="عائلتي" height="96" style="margin:0 auto"><div class="sm muted">تطبيق واحد لكل العائلة · الإصدار 1.0.0</div></div>${list(S.sys === 'avail' || S.sys === 'soft' ? row('system_update_alt', 'تحديث متاح', S.sys === 'soft' ? 'إصدارك قديم · حدّث لتبقى كل الخدمات تعمل' : 'الإصدار 1.1.0 · عبر متجر Google Play', { a: 'updGo', v: chip('حدّث', S.sys === 'soft' ? 'wa' : 'in') }) : row('system_update_alt', 'تحقق من التحديثات', 'عبر متجر Google Play', { a: 'updCheck' }), row('android', 'المنصة', 'Android: كامل · iOS: واجهة مشتركة، والتحكم العميق لاحقاً', { v: S.os === 'ios' ? 'iOS' : 'Android' }), row('description', 'الشروط والخصوصية', 'شروط الاستخدام · سياسة الخصوصية · خصوصية الأطفال', { a: 'go:legal' }), isAdult() ? row('contact_support', 'المساعدة والدعم', '', { a: 'go:help' }) : '', row('gavel', 'تراخيص المصادر المفتوحة', 'IBM Plex Sans Arabic · Material Symbols', { a: 'go:licenses' }))}${isAdult() ? list(row('support_agent', 'معلومات تشخيصية', 'للدعم الفني', { a: 'go:health' })) : ''}`; },
});
ACT.updCheck = () => toast(offline() ? 'لا يوجد اتصال · نتحقق عند عودته' : 'أنت على أحدث إصدار', null, offline() ? 'cloud_off' : 'check_circle');
surface('outbox', {
  t: 'البيانات والمزامنة', sys: 'S1-01', p: 'any', req: '01:8,9,10 06:16 08:14 07:6 05:3 10:16',
  note: 'شاشة واحدة بلغة المستخدم بدل «الصندوق الصادر» و«وضع النطاق المنخفض»: ما ينتظر الإرسال، زر «زامن الآن»، وتوفير البيانات (تلقائي افتراضياً، إعداد شخصي لكل جهاز). جرّب: اقطع الاتصال من الاستوديو، نفّذ أفعالاً، ثم أعد الاتصال. الطفل والمراهق يريان الحالة فقط.',
  r() {
    const n = S.outbox.length, off = offline();
    const head = `<div class="card fx">${ic(off ? 'cloud_off' : n ? 'cloud_upload' : 'cloud_done', `" style="width:34px;height:34px;color:var(--${off ? 'warning' : 'success'})`)}<div class="grow"><b>${off ? 'غير متصل' : n ? 'جارٍ الإرسال…' : 'كل شيء مُرسل'}</b><div class="sm muted">${off ? (n ? 'ما فعلته محفوظ ويُرسل بترتيبه عند عودة الاتصال.' : 'تعمل بآخر بيانات محفوظة. لا شيء ينتظر.') : S.lastSync ? `آخر مزامنة ${S.lastSync.at}${S.lastSync.n ? ` · أُرسلت ${S.lastSync.n}` : ''}` : 'آخر مزامنة قبل 18 د'}</div></div></div>`;
    if (!isAdult()) return head + (n ? callout(n === 1 ? 'عملية واحدة ستُرسل عند عودة الاتصال.' : `${n} عمليات ستُرسل عند عودة الاتصال.`, 'nt', 'schedule') : '') + chOutbox();
    return `${head}${btn('زامن الآن', 'syncNow', off ? 'sec" disabled="' : 'sec', 'sync')}
    ${S.syncConflict ? `<div class="gap"></div>${callout('<b>تغيير واحد لم يُطبَّق.</b> عدّلت سارة حصة ليان بعدك، فبقي تعديلها الأحدث (150 د). تعديلك (120 د) لم يُكتب فوقه.', 'wa', 'merge')}<div class="btns">${btn('أبقِ تعديل سارة', 'conflKeep', 'sec')}${btn('أعد تطبيق تعديلي', 'conflRedo', 'ton')}</div>` : ''}
    ${chOutbox()}
    ${n ? `${sec('بانتظار الإرسال')}${list(S.outbox.map((o, i) => row('schedule', o.t, `${o.at} · يُرسل ${i === 0 ? 'أولاً' : 'بعد ما قبله'}`, { chev: false })))}` : ''}
    ${sec('توفير البيانات')}${seg([['auto', 'تلقائي'], ['on', 'دائماً'], ['off', 'متوقف']], S.saver, 'saverSet')}<p class="sm muted" style="margin:8px 2px 0">${S.saver === 'auto' ? (S.lbw ? 'مفعّل الآن لأن الاتصال ضعيف. يعود للوضع العادي عند تحسّنه.' : 'يتفعّل وحده عند ضعف الاتصال.') : S.saver === 'on' ? 'الصور والخرائط تُحمَّل عند الطلب، ولا تحديث تلقائي في الخلفية.' : 'متوقف على هذا الجهاز. قد يزيد استهلاك البيانات.'}</p>
    ${S.saver !== 'off' ? `<p class="sm" style="margin:16px 2px 8px;font-weight:500">المزامنة عند توفير البيانات</p>${seg([['hour', 'كل ساعة'], ['day', 'يومياً'], ['manual', 'يدوياً فقط']], S.syncSched || 'hour', 'syncSched')}<p class="xs muted" style="margin:8px 2px 0">«زامن الآن» متاح دائماً. الاستغاثة لا تنتظر المزامنة.</p>` : ''}
    <p class="xs muted" style="margin:12px 2px 0">هذا الإعداد لجهازك أنت فقط. الاستغاثة والقواعد على أجهزة الأطفال تعمل في كل الأحوال.</p>`;
  },
});
Object.assign(ACT, {
  syncSched(v) { S.syncSched = v; },
  saverSet(v) { S.saver = v; if (v === 'on') S.lbw = true; if (v === 'off') S.lbw = false; },
  conflKeep() { S.syncConflict = false; toast('بقي تعديل سارة'); },
  conflRedo() { S.syncConflict = false; S.kid.layan.quota = 120; audit('أُعيد تطبيق الحصة اليومية لليان: 120 د', 'protection.rule.edit'); toast('طُبّق تعديلك · 120 د'); },
});
surface('persist', {
  t: 'الإشعار الدائم', sys: 'S1-01', p: 'any', req: '01:15',
  note: 'الإشعار الدائم يعرض معلومة نافعة (الوقت المتبقي) لا عبارة رقابية. لا تحكم لإخفائه في المرحلة 1: الخدمة الخلفية تحتاجه. إن رُفض إذن الإشعارات أو أُوقف من إعدادات الهاتف تبقى الخدمة تعمل، ويظهر بانر صريح على الجهاز.',
  r() { return `${isAdult() ? '' : callout(S.notifPerm ? 'هذا الإشعار يبقى ظاهراً ما دام التطبيق يحمي الجهاز. لا يُخفى من داخل التطبيق.' : '<b>الإشعارات متوقفة على هذا الجهاز.</b> الحماية ما زالت تعمل، لكن الوقت المتبقي لا يظهر والتنبيهات لا تصل. أخبر بابا ليفعّلها.', S.notifPerm ? 'nt' : 'wa', S.notifPerm ? 'info' : 'notifications_off')}<p class="sm muted" style="margin:0 4px 8px">هكذا يظهر على جهاز الطفل:</p><div class="lockn"><span class="ap">${ic('hourglass_top')}</span><span><b>بقي لك 24 دقيقة اليوم</b><small>عائلتي · اضغط لترى يومك</small></span></div><p class="sm muted" style="margin:16px 4px 8px">وعلى جهاز ولي الأمر:</p><div class="lockn"><span class="ap">${ic('verified_user')}</span><span><b>عائلتي تعمل</b><small>3 أطفال متصلون · لا شيء يحتاج قرارك</small></span></div>${callout('لا نكتب «أنت مراقَب». الإشعار يخدم صاحب الجهاز بمعلومة تفيده.', 'ok', 'check_circle')}`; },
});
surface('consent-view', {
  t: 'ما اتفقنا عليه', sys: 'S1-02', p: 'any', req: '02:17 01:15',
  note: 'الموافقة المشتركة تُجرى مرة واحدة عند أول اقتران وتُسجَّل في التدقيق؛ وتبقى متاحة للطرفين للاطلاع.',
  r(id) { const k = !isAdult() && KIDS.includes(me().id) ? me() : M[id] || M.layan; return `${callout(`اتفق أحمد و${k.n} على هذا في 2 نوفمبر 2026 عند إقران الجهاز.`, 'ok', 'handshake')}${list(row('hourglass_top', 'وقت الشاشة', 'كم دقيقة، لا ما يُشاهَد بالتفصيل'), row('location_on', 'مشاركة الموقع', 'أين الجهاز الآن وسجل 7 أيام'), row('forum', 'المحادثات داخل العائلة', 'الأب يستطيع رؤيتها'), row('travel_explore', 'فئات المواقع', 'نوع الموقع، لا كل صفحة'))}`; },
});

/* ============ ورقة «لماذا؟» — تفسير موحّد لكل قفل أو قيد أو اقتراح ============ */
const WHY = {
  ios: ['لماذا لا يتوفر على iOS؟', 'التحكم العميق بالتطبيقات يعتمد على وحدة فرض خاصة بأندرويد. على iOS نعرض ما يعمل فعلاً فقط، ولا نَعِد بما لا نستطيع تنفيذه.', 'S1-01 REQ-019 · S1-09 REQ-009'],
  rank: ['كيف تُرتَّب القواعد؟', 'نمرّ على أنواع القواعد من الأعلى: النوم، ثم المدرسة، ثم قواعد التطبيقات، ثم الحصة اليومية. أول نوع ينطبق على اللحظة يحسم، ولا يُنظر إلى ما تحته. يستطيع الأب تغيير هذا الترتيب للعائلة أو لطفل بعينه.', 'S1-10 REQ-010/011'],
  extra: ['أين يذهب الوقت الإضافي؟', 'الوقت الممنوح أو المشترى بالنقاط يضاف إلى حدّ التطبيق المطلوب فقط، وينتهي بنهاية اليوم. لا يفتح تطبيقاً في وقت النوم أو المدرسة.', 'S1-10 REQ-012 · S1-05 REQ-008/009'],
  ai: ['لماذا هذا الاقتراح؟', 'استند المساعد إلى أوقات استخدام الجهاز في آخر 7 أيام فقط، لا إلى محتوى أي تطبيق. لا يُنفَّذ شيء دون موافقتك، وكل فعل يُسجَّل ويمكن التراجع عنه.', 'AI-BOUNDARIES · S1-09 REQ-018'],
  stale: ['لماذا «آخر تحديث»؟', 'لا نعرض بيانات قديمة كأنها حية. عندما ينقطع الاتصال نُظهر عمر كل معلومة بوضوح.', 'S1-09 REQ-010/011'],
  classifier: ['كيف رُصدت الرسالة؟', 'مصنّف آلي يفحص النص والصور في محادثات الأطفال دون 13 دائماً، وللمراهقين بمفتاح يملكه الأب. ينبّهك بعد وصول الرسالة في أربع حالات: تنمّر أو إهانة، تهديد بالأذى، كلام غير لائق، ضيق شديد. ويوقف الرسالة قبل وصولها في ثلاث فقط: محتوى جنسي يخص قاصراً، تشجيع على إيذاء النفس، استدراج. قد يخطئ، ولذلك يعرض عليك ولا يحذف ولا يعاقب.', 'S1-08 REQ-012'],
  sleep: ['لماذا التطبيقات مغلقة؟', 'الآن وقت النوم في جدولك. كل التطبيقات تنام معك، وزر الاستغاثة يعمل دائماً.', 'S1-10 REQ-007'],
  kidlimit: ['لماذا توقف التطبيق؟', 'انتهى وقت هذا التطبيق اليوم. تستطيع طلب وقت إضافي من بابا، أو استخدام نقاطك، أو فتح تطبيق آخر.', 'S1-10 REQ-003/005'],
  kidschool: ['لماذا التطبيق مغلق؟', 'الآن وقت المدرسة. تطبيقات الدراسة مفتوحة، والباقي يعود بعد المدرسة. زر الاستغاثة يعمل دائماً.', 'S1-10 REQ-007'],
  kidquota: ['لماذا توقفت التطبيقات؟', 'انتهى وقت الشاشة لهذا اليوم. يعود غداً. تستطيع طلب وقت إضافي.', 'S1-10 REQ-002/003'],
  kidblocked: ['لماذا لا يُفتح؟', 'هذا التطبيق غير متاح على جهازك. إن رأيت أنك تحتاجه فتحدّث مع والدك.', 'S1-10 REQ-001'],
  kidmode: ['لماذا التطبيقات مغلقة؟', 'اختار والدك وضعاً لوقت قصير. حين ينتهي تعود تطبيقاتك كما كانت. زر الاستغاثة يعمل دائماً.', 'S1-10 REQ-032'],
};
surface('why', {
  kind: 'sheet', t: 'لماذا؟', sys: 'S1-09', p: 'any', a: ['rank'], req: '09:4,8,9 03:7',
  note: 'نمط موحّد: كل قفل أو قيمة أو اقتراح له تفسير بلغة بسيطة. قفل الصلاحية يقول اسمها بالعربية ويعرض طلبها من المالك. الرفض العادي لا يُبلَّغ عنه؛ ورفض صلاحية حساسة يُسجَّل ويُنبَّه المالك.',
  r(id) {
    if (id.startsWith('nd:')) { const k = id.slice(3), oo = !PGIVE.includes(k), q = S.preq.find(x => x.k === k && x.st === 'pending'), f = me().f; return `<div class="bigic">${ic('lock_person')}</div><h4 class="c">${permName(k)}</h4><p class="d c">${oo ? 'هذا لأحمد وحده. بعض الأمور لا تُعطى لأحد: الاشتراك والملكية وبعض قواعد الحماية.' : `ليست عند${f ? 'كِ' : 'ك'} هذه الصلاحية. ${f ? 'تستطيعين أن تطلبيها' : 'تستطيع أن تطلبها'} من أحمد.`}</p>${SENS.includes(k) ? callout('هذه صلاحية حساسة، فسُجّلت المحاولة وأُبلغ أحمد.', 'nt', 'receipt_long') : ''}${oo ? '' : q ? callout('طلبك عند أحمد. يصلك إشعار حين يرد.', 'nt', 'pending') : btn(f ? 'اطلبيها من أحمد' : 'اطلبها من أحمد', 'preqSend:' + k)}${oo || q ? btn('فهمت', 'close') : `<div class="gap"></div>${btn('ليس الآن', 'close', 'sec')}`}`; }
    const w = WHY[id] || WHY.rank; return `<div class="bigic">${ic('help')}</div><h4 class="c">${w[0]}</h4><p class="d c">${w[1]}</p>${isAdult() ? `<div class="card flat c xs muted">المصدر: <span class="mono">${w[2]}</span></div>` : ''}${btn(mode() === 'parent' ? 'فهمت' : 'حسناً', 'close')}`;
  },
});

/* ============ بوابة الوالدين / الرفع الأمني ============ */
surface('pin', {
  kind: 'full', t: 'بوابة الوالدين', sys: 'S1-01', p: 'any', a: ['الخروج من وضع الطفل', 'gate'], req: '01:5,6,23 03:12 02:16',
  note: 'على هاتف الأهل: إن اختار صاحبه التأكيد بالبصمة (Q-418) لا تظهر هذه اللوحة إلا لسبب يُكتب فيها (مرّ 30 يوماً، تغيّرت البصمات، ثلاث محاولات فاشلة) أو إن اختار هو الرقم. على جهاز الابن هي الطريق الوحيد. رقم الأب السري، 6 أرقام، محلي ولا يمنح صلاحية بحد ذاته. 5 محاولات خاطئة ← قفل 5 دقائق، وكل فشل وقفل يُسجَّل في التدقيق ويُنبَّه الأب عند القفل. لوحة الأرقام لا تُعكس. زر الاستغاثة يبقى في رأس البوابة. الرقم التجريبي: 482615 (والرقم 123456 نمط ممنوع).',
  r(reason, kind, why) {
    const locked = S.pin.lock > 0, canBio = why !== 'fail' && bioWhy(kind) === '';
    const whyT = { month: `مرّ ${PIN_EVERY} يوماً على آخر مرة كتبت فيها رقمك السري. نطلبه مرة حتى لا تنساه.`, chg: 'تغيّرت بصمات هذا الهاتف، فالتأكيد الآن بالرقم السري.', fail: 'ثلاث محاولات لم تنجح بالبصمة.' }[why];
    return `<header class="bar"><button class="ib" data-a="pinX" aria-label="إغلاق">${ic('close')}</button><h2></h2>${S.persona === 'guest' ? '' : sosBtn()}</header><div class="body" style="justify-content:center">
    <div class="bigic">${ic(locked ? 'lock_clock' : kind === 'stepup' ? 'shield_lock' : 'lock')}</div><p class="ttl">${locked ? 'البوابة مقفلة مؤقتاً' : kind === 'stepup' ? 'أكّد أنك أنت' : 'بوابة الوالدين'}</p>
    <p class="sub">${locked ? `خمس محاولات خاطئة. حاول بعد <b class="ltr">${Math.floor(S.pin.lock / 60)}:${String(S.pin.lock % 60).padStart(2, '0')}</b>` : reason + ' · أدخل رقم الأب السري'}</p>
    ${!locked && whyT ? `<p class="c sm pinwhy">${ic('info')} ${whyT}</p>` : ''}${locked ? '' : `<div class="dots ${S.pin.shake ? 'bad' : ''}" aria-label="${pinBuf.length} من 6">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i < pinBuf.length ? 'f' : ''}"></i>`).join('')}</div>
    ${S.pin.bad ? `<p class="c sm" style="color:var(--danger);margin:-10px 0 12px">الرقم غير صحيح. بقيت ${5 - S.pin.bad} محاولات.</p>` : ''}
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="pinK:${n}">${n}</button>`).join('')}<button class="gh" data-a="${canBio ? 'pinBio' : 'pinNo'}" ${canBio ? 'aria-label="أكّد بالبصمة"' : 'aria-hidden="true" tabindex="-1"'}>${canBio ? ic('fingerprint') : ''}</button><button data-a="pinK:0">0</button><button class="gh" data-a="pinK:b" aria-label="حذف">${ic('backspace')}</button></div>`}
    ${mode() !== 'parent' ? `<p class="c sm muted" style="margin-top:16px">هذه الصفحة للأهل. ${btn('ارجع', 'pinX', 'txt')}</p>` : S.persona === 'owner' && !locked ? `<p class="c sm" style="margin-top:16px">${btn('نسيت الرقم؟', 'pinForgot', 'txt')}</p>` : ''}</div>`;
  },
});
/* ---------- التأكيد بالبصمة (Q-418) ---------- */
surface('bio-confirm', {
  kind: 'full', t: 'التأكيد بالبصمة', sys: 'S1-01', p: 'adult', a: ['بدء التجربة', 'stepup'], req: '01:5,23 02:16',
  note: 'يظهر بدل لوحة الرقم السري حين يختار صاحب الهاتف «أكّد الأفعال الحساسة بالبصمة» (Q-418). على هاتف الأهل وحده، ولا يظهر على جهاز ابن أبداً. ثلاث محاولات فاشلة ← الرقم السري. «استعمل الرقم السري» متاح دائماً. يُعرض الفعل الذي يؤكَّد في أعلى الشاشة حتى لا تُلمس البصمة على شيء مجهول. من لوحة الضبط: شغّل «التأكيد بالبصمة».',
  r(reason) {
    const f = S.bioF || 0;
    return `<header class="bar"><button class="ib" data-a="pinX" aria-label="إغلاق">${ic('close')}</button><h2></h2></header><div class="body" style="justify-content:center;text-align:center">
    <p class="ttl">أكّد أنك أنت</p><p class="sub">${reason}</p>
    <button class="bigic bcfp ${f ? 'bad' : ''}" data-a="bcOk" aria-label="أكّد بالبصمة">${ic('fingerprint')}</button>
    <p class="sm ${f ? '' : 'muted'}" style="margin:0 0 16px;${f ? 'color:var(--danger)' : ''}" role="status">${f ? `لم نتعرف على البصمة. بقيت ${3 - f === 1 ? 'محاولة واحدة' : 'محاولتان'}.` : 'المس حساس البصمة'}</p>
    ${btn('استعمل الرقم السري', 'bcPin', 'sec', 'pin')}<div class="gap"></div>${btn('جرّب: بصمة غير معروفة', 'bcBad', 'txt" style="width:100%')}</div>`;
  },
});
let pinTimer;
Object.assign(ACT, {
  bcOk() { S.bioF = 0; S.full = null; const c = pinCb; pinCb = null; if (c) c(); },
  bcBad() { const a = S.full ? S.full.a : []; S.bioF = (S.bioF || 0) + 1; if (S.bioF >= 3) { S.bioF = 0; pinBuf = ''; gateLog('ثلاث محاولات فاشلة بالبصمة عند تأكيد فعل حساس'); S.full = { id: 'pin', a: [a[0], a[1], 'fail'] }; } },
  bcPin() { const a = S.full ? S.full.a : []; S.bioF = 0; pinBuf = ''; S.full = { id: 'pin', a: [a[0], a[1], ''] }; },
  pinX() { S.full = null; pinCb = null; S.pin.shake = 0; },
  pinNo() { return false; },
  pinForgot() { S.full = null; pinCb = null; go('pin-forgot'); },
  /* من لوحة الأرقام إلى البصمة: يعود إلى شاشة التأكيد بالبصمة بالفعل نفسه */
  pinBio() { const a = S.full ? S.full.a : []; if (a[2] === 'fail' || bioWhy(a[1]) !== '') return false; pinBuf = ''; S.bioF = 0; S.full = { id: 'bio-confirm', a: [a[0], a[1]] }; },
  pinK(k) {
    S.pin.shake = 0;
    if (k === 'b') { pinBuf = pinBuf.slice(0, -1); return; }
    pinBuf += k; if (pinBuf.length < 6) return;
    if (pinBuf === S.pin.code) { pinBuf = ''; S.pin.bad = 0; S.pinAgo = 0; S.full = null; const c = pinCb; pinCb = null; if (c) c(); return; }
    pinBuf = ''; S.pin.bad += 1; S.pin.shake = 1; gateLog(`رقم خاطئ في بوابة الوالدين (${S.pin.bad} من 5)`);
    if (S.pin.bad >= 5) { S.pin.bad = 0; S.pin.lock = 300; gateLog('قُفلت بوابة الوالدين 5 دقائق بعد 5 محاولات خاطئة'); S.alerts.unshift({ id: 'a' + Date.now(), k: 'perm', kid: null, t: `قُفلت بوابة الوالدين على ${gateDev()}`, s: 'خمس محاولات خاطئة للرقم السري · القفل 5 دقائق', ago: 'الآن', p: 3, open: 1 }); clearInterval(pinTimer); pinTimer = setInterval(() => { S.pin.lock -= 1; if (S.pin.lock <= 0) { S.pin.lock = 0; clearInterval(pinTimer); } if (S.full && S.full.id === 'pin') renderOv(); }, 1000); }
  },
});

/* ============ إنشاء رقم بوابة الوالدين وتغييره ============ */
/* الأنماط الممنوعة (S1-01 REQ-005): رقم مكرر، تسلسل، نمط متكرر، وسنة ميلاد في أول الرقم أو آخره. */
function weakPin(p) {
  if (/^(\d)\1{5}$/.test(p)) return 'رقم واحد مكرر سهل التخمين';
  const d = [...p].map(Number), up = d.every((x, i) => !i || x === (d[i - 1] + 1) % 10), dn = d.every((x, i) => !i || x === (d[i - 1] + 9) % 10);
  if (up || dn) return 'الأرقام المتتالية سهلة التخمين';
  if (/^(\d\d)\1\1$/.test(p) || /^(\d\d\d)\1$/.test(p)) return 'النمط المتكرر سهل التخمين';
  if (/^(19[4-9]\d|20[0-2]\d)/.test(p) || /(19[4-9]\d|20[0-2]\d)$/.test(p)) return 'يشبه سنة ميلاد · اختر رقماً لا يعرفه أطفالك';
  return '';
}
let psBuf = '';
let psDone = null;
/* kind: create (أول مرة على جهاز الأب) · change · pair (الأب يكتب رقمه على جهاز الطفل عند الإقران فيُحفظ هناك) */
function pinSetOpen(kind, cb) { psBuf = ''; psDone = cb || null; S.ps = { kind, step: 'new', a: '', err: '' }; S.full = { id: 'pin-set', a: [] }; }
surface('pin-set', {
  kind: 'full', t: 'رقم بوابة الوالدين', sys: 'S1-01', p: 'any', req: '01:5,6',
  note: 'إنشاء الرقم أول مرة، وتغييره بعد إدخال الرقم الحالي، وكتابته على جهاز الطفل عند الإقران (إدخال ثم تأكيد، لأن الرقم لا يغادر أي جهاز فلا يمكن مطابقته مع هاتف الأب — Q-142). 6 أرقام، إدخال ثم تأكيد، ورفض الأنماط الشائعة مع السبب. لا تراجع بعد الحفظ، ولا إعادة تعيين عند النسيان إلا عبر جهة الاسترداد. الرقم محلي على كل جهاز: تغييره هنا لا يغيّره على أجهزة الأطفال.',
  r() {
    const p = S.ps || { kind: 'change', step: 'new', a: '', err: '' }, done = p.step === 'done', kidDev = mode() !== 'parent';
    if (done) return `<header class="bar"><h2></h2>${S.persona === 'guest' ? '' : sosBtn()}</header><div class="body" style="justify-content:center"><div class="bigic ok">${ic('check_circle')}</div><p class="ttl">${p.kind === 'pair' ? 'حُفظ الرقم على هذا الجهاز' : p.kind === 'create' ? 'أُنشئ رقمك السري' : 'تغيّر الرقم السري'}</p><p class="sub">${p.kind === 'pair' ? 'لن تُفتح إعدادات هذا الجهاز إلا به.' : kidDev ? 'يعمل الرقم الجديد على هذا الجهاز من الآن.' : 'يعمل الرقم الجديد على هاتفك من الآن.'}</p>
      ${p.kind === 'pair' ? callout('الرقم محفوظ على هذا الجهاز وحده ولا يُرسل عبر الإنترنت. إن غيّرته لاحقاً على هاتفك فغيّره هنا أيضاً.', 'nt', 'info') : kidDev ? '' : p.kind === 'create' ? callout('ستدخل هذا الرقم نفسه على جهاز كل طفل عند إقرانه، فيُحفظ هناك أيضاً.', 'nt', 'info') : callout('<b>أجهزة أطفالك ما زالت على الرقم القديم.</b> الرقم لا يغادر الجهاز حفاظاً على أمانه، فغيّره على كل جهاز طفل من: ملفي ← إعدادات هذا الجهاز ← تغيير الرقم السري.', 'wa', 'devices')}
      <div class="gap"></div>${btn('تم', 'psClose')}</div>`;
    return `<header class="bar"><button class="ib" data-a="psClose" aria-label="إغلاق">${ic('close')}</button><h2></h2>${S.persona === 'guest' ? '' : sosBtn()}</header><div class="body" style="justify-content:center">
    <div class="bigic">${ic('pin')}</div><p class="ttl">${p.step === 'new' ? (p.kind === 'pair' ? 'بابا يكتب رقمه السري' : p.kind === 'create' ? 'أنشئ رقمك السري' : 'الرقم الجديد') : 'أعد كتابة الرقم'}</p>
    <p class="sub">${p.step === 'new' ? (p.kind === 'pair' ? 'الرقم نفسه الذي أنشأته على هاتفك. يُحفظ هنا ليحمي إعدادات هذا الجهاز.' : '6 أرقام تعرفها أنت وحدك. يحمي إعدادات أجهزة أطفالك.') : 'للتأكد أنك كتبته كما تريد.'}</p>
    <div class="dots ${p.err ? 'bad' : ''}" aria-label="${psBuf.length} من 6">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i < psBuf.length ? 'f' : ''}"></i>`).join('')}</div>
    ${p.err ? `<p class="c sm" role="alert" style="color:var(--danger);margin:-10px 0 12px">${p.err}</p>` : ''}
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="psK:${n}">${n}</button>`).join('')}<button class="gh" data-a="pinNo" aria-hidden="true"></button><button data-a="psK:0">0</button><button class="gh" data-a="psK:b" aria-label="حذف">${ic('backspace')}</button></div>
    ${p.step === 'confirm' ? `<p class="c sm" style="margin-top:16px">${btn('ابدأ من جديد', 'psBack', 'txt')}</p>` : p.kind === 'change' && !kidDev ? `<p class="c xs muted" style="margin-top:16px">نسيت رقمك مستقبلاً؟ يُستعاد عبر جهة الاسترداد الموثوقة فقط.</p>` : ''}</div>`;
  },
});
Object.assign(ACT, {
  psClose() { const cb = S.ps && S.ps.step === 'done' ? psDone : null; S.full = null; S.ps = null; psBuf = ''; psDone = null; if (cb) cb(); },
  psBack() { psBuf = ''; S.ps = Object.assign(S.ps || { kind: 'change' }, { step: 'new', a: '', err: '' }); },
  psK(k) {
    const p = S.ps || (S.ps = { kind: 'change', step: 'new', a: '', err: '' }); p.err = '';   /* فُتحت الشاشة مباشرة: تبدأ كما تُعرض */
    if (k === 'b') { psBuf = psBuf.slice(0, -1); return; }
    psBuf += k; if (psBuf.length < 6) return;
    if (p.step === 'new') {
      const w = weakPin(psBuf); if (w) { p.err = w; psBuf = ''; return; }
      if (p.kind === 'change' && psBuf === S.pin.code) { p.err = 'هذا رقمك الحالي · اختر رقماً مختلفاً'; psBuf = ''; return; }
      p.a = psBuf; psBuf = ''; p.step = 'confirm'; return;
    }
    if (psBuf !== p.a) { p.err = 'الرقمان غير متطابقين · أعد المحاولة'; psBuf = ''; return; }
    S.pin.code = p.a; S.pin.set = true; S.pin.bad = 0; S.pinAgo = 0; psBuf = ''; p.a = ''; p.step = 'done';
    /* Q-418: رقم جديد يطفئ التأكيد بالبصمة؛ يُشغَّل من جديد بالرقم الجديد */
    if (S.bioAct && p.kind !== 'create') { S.bioAct = false; audit('أُطفئ تأكيد الأفعال الحساسة بالبصمة بعد تغيير الرقم السري', 'identity.biometric.enable'); }
    S.audit.unshift({ t: `${p.kind === 'pair' ? 'حُفظ رقم بوابة الوالدين عند الإقران' : (p.kind === 'create' ? 'أُنشئ' : 'غُيّر') + ' رقم بوابة الوالدين · ' + gateDev()}`, w: 'أحمد', at: 'الآن', k: 'shell.parent_gate.manage' });
    if (S.checklist) S.checklist.pin = 1;
  },
});

/* الاستغاثة (S1-07): في screens-location.js */

/* ============ حالات النظام الكاملة ============ */
surface('sys-update', {
  kind: 'full', cls: 'dark', t: 'تحديث إجباري', sys: 'S1-01', p: 'any', req: '01:20 01:7',
  note: 'للإصدارات الأمنية الحرجة فقط. لا إغلاق لهذه الشاشة، لكن الاستغاثة تبقى متاحة.',
  r() { return `<div class="body" style="justify-content:center"><div class="bigic">${ic('system_update_alt')}</div><p class="ttl">تحديث مطلوب للأمان</p><p class="sub">هذا الإصدار لم يعد مدعوماً. حدّث التطبيق لتواصل استخدامه بأمان. بياناتك وما لم يُرسل بعد محفوظة.</p>${btn('حدّث من المتجر', 'updGo', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'download')}<div class="gap"></div><div class="c">${sosBtn()}</div></div>`; },
});
surface('sys-maint', {
  kind: 'full', cls: 'dark', t: 'صيانة', sys: 'S1-01', p: 'any', req: '01:7,9',
  note: 'معتمد (Q-397 · Q-460): تظهر حين يجيب الخادم بأنه في صيانة (الرمز 503 ومعه موعد إعادة المحاولة). القواعد تبقى مفروضة محلياً والاستغاثة عبر SMS تعمل.',
  r() { return `<div class="body" style="justify-content:center"><div class="bigic">${ic('construction')}</div><p class="ttl">نُجري صيانة قصيرة</p><p class="sub">نعود خلال دقائق. قواعد الأطفال ما زالت تعمل على أجهزتهم، وما تفعله الآن يُحفظ ويُرسل لاحقاً.</p>${btn('حاول مجدداً', 'maintTry', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'refresh')}<div class="gap"></div><div class="c">${sosBtn()}</div></div>`; },
});
surface('sys-first', {
  kind: 'full', cls: 'dark', t: 'أول فتح دون اتصال', sys: 'S1-01', p: 'any', req: '01:8',
  note: 'أول فتح للتطبيق دون اتصال وبلا بيانات محفوظة (GAP-S1-01-01): شاشة صادقة مع إعادة المحاولة. لا زر استغاثة هنا لأن الاستغاثة تحتاج عضوية في عائلة.',
  r() { return `<div class="body" style="justify-content:center"><div class="bigic">${ic('cloud_off')}</div><p class="ttl">نحتاج اتصالاً لأول مرة</p><p class="sub">افتح الإنترنت مرة واحدة ليجهز التطبيق. بعدها يعمل معك حتى دون اتصال.</p>${btn('حاول مجدداً', 'maintTry', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'refresh')}</div>`; },
});
Object.assign(ACT, {
  updGo() { S.sys = 'ok'; S.full = null; toast('يفتح المتجر على صفحة «عائلتي» لتحديثه', null, 'open_in_new'); },
  maintTry() { S.sys = 'ok'; S.full = null; toast('عادت الخدمة'); },
});

/* ---------- لوازم الإطلاق في الغلاف: إذن الإشعارات، الشروط والخصوصية، المساعدة ---------- */
surface('perm-notif', {
  kind: 'full', t: 'إذن الإشعارات', sys: 'S1-01', p: 'any', req: '01:15',
  note: 'شاشة تمهيد قبل نافذة النظام (أندرويد 13 فأعلى يطلب الإذن وقت التشغيل). تظهر مرة واحدة: بعد إنشاء العائلة أو الانضمام، وبعد إقران جهاز الطفل. الرفض لا يوقف شيئاً: يبقى بانر صريح أعلى الشاشة مع زر التفعيل.',
  r() { const kid = !isAdult();
    return `<header class="bar"><h2></h2>${sosBtn()}</header><div class="body" style="justify-content:center;text-align:center"><div class="bigic">${ic('notifications_active')}</div><p class="ttl">${kid ? 'اسمح بالإشعارات على هذا الجهاز' : 'اسمح بالإشعارات'}</p><p class="sub">${kid ? 'يقرؤها بابا مع صاحب الجهاز.' : 'لتعرف ما يحتاج قرارك دون أن تفتح التطبيق.'}</p>
    <div class="card" style="text-align:start">${(kid ? [['hourglass_top', 'يظهر الوقت المتبقي في أعلى الهاتف دائماً'], ['chat', 'تصل رسائل العائلة وردّ بابا على الطلبات'], ['emergency_home', 'تصل تنبيهات الاستغاثة من أفراد العائلة']] : [['emergency_home', 'استغاثة أحد أفراد عائلتك تصلك فوراً'], ['pending_actions', 'طلبات أطفالك: وقت إضافي، تطبيق، مهمة'], ['shield', 'تنبيه إن تعطلت الحماية على جهاز طفل']]).map(([i, t]) => `<div class="fx" style="padding:7px 0;gap:10px">${ic(i)}<span>${t}</span></div>`).join('')}</div>
    <p class="sm muted">${kid ? 'إن لم تسمح: تبقى الحماية تعمل، لكن الوقت المتبقي لا يظهر والتنبيهات لا تصل.' : 'لا إعلانات ولا رسائل ترويجية. تغيّر ما يصلك من «الإشعارات» في أي وقت.'}</p><div class="gap"></div>${btn('اسمح بالإشعارات', 'npAllow', '', 'notifications_active')}${btn('ليس الآن', 'npLater', 'txt')}</div>`; },
});
Object.assign(ACT, {
  npAllow() { S.notifPerm = true; S.full = null; toast('الإشعارات مفعّلة'); },
  npLater() { S.notifPerm = false; S.full = null; },
  modeWhy() { S.sheet = { id: 'mode-fixed', a: [] }; },
  helpQ(i) { S.helpQ = S.helpQ === +i ? -1 : +i; },
  helpMail() { toast(offline() ? 'لا يوجد اتصال · رسالتك تُحفظ وتُرسل عند عودته' : 'يفتح بريدك وفيه رقم الإصدار ونوع الجهاز فقط', null, offline() ? 'cloud_off' : 'mail'); },
});
surface('mode-fixed', {
  kind: 'sheet', t: 'وضع الجهاز ثابت', sys: 'S1-01', p: 'kid', req: '01:2,18',
  note: 'رسالة ثبات الوضع تظهر بلا طلب رقم سري (ACC-019). وهي نفسها ما يراه أب يحاول الدخول بحسابه على جهاز طفل.',
  r() { return `<h4>هذا الجهاز يعمل بوضع ${mode() === 'teen' ? 'المراهق' : 'الطفل'}</h4><p class="d">الوضع يُحدَّد مرة واحدة عند إقران الجهاز ولا يتحول إلى وضع الأهل، ولا يُسجَّل عليه دخول بحساب آخر.</p>${callout('ليصير هذا الهاتف جهاز أهل: يفكّ بابا إقرانه من «إعدادات هذا الجهاز» أولاً، ثم يسجّل الدخول بحسابه.', 'nt', 'info')}${btn('فهمت', 'close', 'sec')}`; },
});
const HELP_Q = [
  ['نسيت الرقم السري لبوابة الوالدين', 'لا يُستعاد الرقم. تطلب المساعدة من جهة الاسترداد الموثوقة التي أضفتها في «الأمان»، ثم تنشئ رقماً جديداً.'],
  ['غيّرت الرقم السري ولم يتغير على جهاز طفلي', 'الرقم يُحفظ على كل جهاز وحده ولا يُرسل عبر الإنترنت. غيّره على جهاز الطفل من: ملفي ← إعدادات هذا الجهاز ← تغيير الرقم السري.'],
  ['التطبيق لا يحمي جهاز طفلي كما يجب', 'افتح بطاقة الطفل من «العائلة». إن ظهرت «الحماية تعمل جزئياً» فاتبع خطوات الإصلاح المعروضة هناك على جهازه.'],
  ['أنا بلا إنترنت، هل يتوقف شيء؟', 'القواعد على أجهزة الأطفال تبقى تعمل. ما تغيّره أنت يُحفظ ويُرسل عند عودة الاتصال، وتراه في «البيانات والمزامنة».'],
  ['كيف أنقل جهاز طفل إلى عائلة أخرى؟', 'من جهاز الطفل: ملفي ← إعدادات هذا الجهاز ← فكّ إقران هذا الجهاز. يحتاج الرقم السري واتصالاً بالإنترنت.'],
  ['ما الفرق بين منح النقاط ومنح الوقت؟', 'النقاط تدخل محفظة الطفل وتبقى فيها، ويحوّلها وقتاً متى شاء. الوقت دقائق تضاف الآن إلى تطبيق تختاره وتنتهي عند منتصف الليل. امنح نقاطاً للمكافأة على سلوك، وامنح وقتاً لحاجة آنية.'],
  ['كيف أجعل المساعد يُعدّ المهام لأبنائي؟', 'من: المهام والتقويم ← ضوابط المهام ← المساعد يُعدّ المهام. تختار أن يقترح عليك فتوافق، أو أن يسند بنفسه ضمن حدود تضعها: أقصى نقاط للمهمة، وعدد المهام في اليوم، ولمن يسند. وتلغي أي مهمة أسندها متى شئت.'],
];
surface('help', {
  t: 'المساعدة والدعم', sys: 'S1-01', p: 'adult', req: '',
  note: 'SCR-16 في S1-01: لازمة إطلاق بلا متطلب مرقَّم، أُضيفت بحكم المالك (Q-397 ب-13). الأسئلة من محتوى التصميم نفسه. عنوان الدعم وساعات الرد سلّمهما المالك (Q-412): بريد واحد، ومن 7 صباحاً إلى 8 مساءً. الطفل لا يرى هذه الصفحة: طريقه «شيء ما أزعجني» إلى والده.',
  r() { const o = S.helpQ ?? -1; return `${sec('أسئلة شائعة')}${list(HELP_Q.map(([q, a], i) => row('quiz', q, o === i ? a : '', { a: 'helpQ:' + i, chev: false, v: ic(o === i ? 'keyboard_arrow_up' : 'keyboard_arrow_down') })))}${sec('لم تجد جوابك؟')}${list(row('mail', 'راسل الدعم', '<span class="ltr">alqaedibassam@gmail.com</span>', { a: 'helpMail' }), row('support_agent', 'معلومات تشخيصية', 'قد يطلبها منك فريق الدعم', { a: 'go:health' }))}<p class="sm muted" style="margin:12px 2px 0">نرد من 7 صباحاً إلى 8 مساءً، بالعربية أو الإنجليزية.</p>`; },
});
const LEGAL = [
  ['terms', 'description', 'شروط الاستخدام', 'ما تلتزم به وما نلتزم به', ['من نحن وما الخدمة', 'حسابك ومسؤولية ولي الأمر', 'الاشتراك والدفع والاسترجاع', 'ما لا يجوز في التطبيق', 'إيقاف الحساب وحذفه', 'القانون الحاكم وكيف تراسلنا']],
  ['privacy', 'policy', 'سياسة الخصوصية', 'ما نجمعه ولماذا ومن يراه', ['ما نجمعه', 'لماذا نجمعه', 'من يراه داخل العائلة', 'أين يُحفظ وكم يبقى', 'حقك في التصدير والحذف', 'بيانات الأطفال وموافقة ولي الأمر']],
];
surface('legal', {
  t: 'الشروط والخصوصية', sys: 'S1-01', p: 'any', req: '',
  note: 'SCR-15 في S1-01: لازمة إطلاق ومتاجر بلا متطلب مرقَّم (Q-397 ب-13): شروط الاستخدام وسياسة الخصوصية يجب أن تُفتحا من داخل التطبيق ومن صفحة المتجر. النص القانوني يُكتب بصياغة عادية مرنة ويعتمده المحامي قبل الإطلاق (Q-412)؛ الشاشة تثبّت الموضع والبنية فقط.',
  r() { return `${callout('النص النهائي يعتمده المحامي قبل الإطلاق. هذه الصفحة تثبّت مكانه في التطبيق.', 'nt', 'info')}${list(...LEGAL.map(([k, i, t, d, H]) => row(i, t, S.lgQ === k ? `<span class="lgo">${H.map((h, n) => `<span>${n + 1}. ${h}</span>`).join('')}<em>هذه أبواب الوثيقة. صياغتها النهائية تُنشر هنا بعد اعتماد المحامي.</em></span>` : d, { a: 'legalDoc:' + k, chev: false, v: ic(S.lgQ === k ? 'keyboard_arrow_up' : 'keyboard_arrow_down') })), row('child_care', 'خصوصية الأطفال', 'ما يراه ولي الأمر وما لا يراه', { a: isAdult() ? 'go:privacy' : 'go:consent-view' }))}${isAdult() ? sec('بياناتك') + list(row('privacy_tip', 'الخصوصية والبيانات', 'تصدير · حذف · شفافية', { a: 'go:privacy' })) : ''}${callout('لا إعلانات ولا أدوات تتبع في التطبيق.', 'ok', 'verified_user')}`; },
});
/* الوثيقتان القانونيتان: الضغط يفتح أبواب الوثيقة في مكانها (Q-435: لا صف ينتهي برسالة عابرة). النص نفسه بانتظار المحامي (Q-412). */
ACT.legalDoc = k => { S.lgQ = S.lgQ === k ? '' : k; };
surface('licenses', {
  t: 'تراخيص المصادر المفتوحة', sys: 'S1-01', p: 'any', req: '',
  note: 'من SCR-15 في S1-01 (Q-397 ب-13)، بلا متطلب مرقَّم. قائمة تولَّد آلياً عند البناء من المكتبات المستعملة فعلاً. هنا خطّ الواجهة ومجموعة الأيقونات المستعملان في النموذج.',
  r() { return list(row('gavel', 'IBM Plex Sans Arabic', 'SIL Open Font License 1.1', { chev: false }), row('gavel', 'Material Symbols', 'Apache License 2.0', { chev: false })) + `<p class="sm muted" style="margin:12px 4px">تُضاف بقية المكتبات آلياً عند بناء التطبيق.</p>`; },
});
