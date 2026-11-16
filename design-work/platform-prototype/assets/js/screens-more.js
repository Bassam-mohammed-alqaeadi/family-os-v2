/* أسطح «المزيد»: الإعدادات التسعة، الخطة، الخصوصية، الأمان، المساعد، المنصة، وطبقات النظام (بوابة، SOS، تحديث…). */
'use strict';
const PLAN = {
  free: { n: 'المجانية', mem: 5, sms: 20, ai: 300, sar: 0, yer: 0 },
  basic: { n: 'الأساسية', mem: 10, sms: 50, ai: 1000, sar: 9.99, sarY: 89.99, yer: 300 },
  premium: { n: 'المميزة', mem: Infinity, sms: 100, ai: 3000, sar: 19.99, sarY: 179.99, yer: 600 },
};
surface('more', {
  t: 'المزيد', sys: 'S1-09', p: 'adult', req: '09:5,12,13,15 01:11,21',
  note: 'الإعدادات في تسعة أقسام ثابتة (settings-patterns.md). كل صف يظهر فقط لمن يملك مفتاحه، وما للمالك حصراً يظهر مقفلاً مع سببه.',
  r() { const m = me(), own = isOwner(), lock = (k, a) => (own || can(k) ? a : 'denied:' + k);
    return `<button class="card fx" data-a="go:account">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(18px*var(--ts))">${m.n}</b><div class="sm muted">${m.rel}</div><div class="sm muted ltr">+967 77• ••• •42</div></div>${ic('chevron_right')}</button>
    ${sec('العائلة والأفراد')}${list(row('family_home', 'العائلة', 'عائلة المنصور · اليمن', { a: 'go:family-settings' }), row('groups', 'الأعضاء', '5 أفراد', { a: 'tab:family' }), row('widgets', 'الخدمات', 'ما يظهر في التحكم والرئيسية', { a: 'go:registry' }), row('view_agenda', 'القوالب', 'قوالب العرض والصلاحيات', { a: 'go:templates' }))}
    ${sec('الضبط والمراجعة')}${list(row('pending_actions', 'الموافقات والاستثناءات', `${attention().length} بانتظار قرار`, { a: 'go:alerts' }), row('rule', 'القواعد', 'الحماية ووقت الشاشة', { a: 'go:protection' }), row('receipt_long', 'التدقيق', 'من غيّر ماذا ومتى', { a: lock('roles.audit.view', 'go:audit'), v: own || can('roles.audit.view') ? '' : ic('lock') }), row('privacy_tip', 'الخصوصية والبيانات', 'تصدير · حذف · شفافية', { a: 'go:privacy' }), row('workspace_premium', 'الخطة والفوترة', PLAN[S.plan].n, { a: can('hub.plan.view') ? 'go:plan' : 'denied:hub.plan.view', v: own ? '' : chip('عرض فقط', 'ol') }))}
    ${sec('حسابي وهذا الجهاز')}${list(row('security', 'الأمان', 'التحقق بخطوتين · الجلسات · الاسترداد', { a: 'go:security' }), row('wand_stars', 'المساعد الذكي', S.aiKill ? 'متوقف' : 'يقترح فقط', { a: 'go:ai' }), row('translate', 'اللغة والعرض', L('العربية', 'English'), { a: 'go:display' }), row('sync', 'البيانات والمزامنة', S.outbox.length ? `${S.outbox.length} بانتظار الإرسال` : S.lbw ? 'توفير البيانات مفعّل' : 'كل شيء مُرسل', { a: 'go:outbox' }), row('contact_support', 'المساعدة والدعم', 'أسئلة شائعة · راسلنا', { a: 'go:help' }), row('info', 'عن التطبيق', 'الإصدار 1.0.0 (نموذج أولي)', { a: 'go:about' }))}<button class="c" data-a="go:about" style="display:block;width:100%;padding:22px 0 6px" aria-label="عن التطبيق"><img src="assets/brand/logo-horizontal-ar${S.theme === 'dark' ? '-dark' : ''}.svg" alt="عائلتي" height="64" style="margin:0 auto"><div class="sm muted">الإصدار 1.0.0</div></button>`; },
});
surface('account', {
  t: 'حسابي', sys: 'S1-02', p: 'adult', req: '02:1,6,8,22,26',
  r() { return `<div class="c" style="padding:8px 0 12px">${av(me(), 'xl')}<div class="b" style="font-size:20px;margin-top:8px">${me().n}</div></div>${list(row('call', 'رقم الهاتف', '', { v: '<span class="ltr">+967 77• ••• •42</span>' }), row('mail', 'البريد الإلكتروني', 'بديل موازٍ لتسجيل الدخول · للبالغين فقط', { v: 'أضف', a: 'soonC' }), row('family_home', 'عائلتي', 'عائلة واحدة لكل حساب', { v: 'المنصور' }))}${list(row('logout', 'اخرج من هذا الجهاز', '', { a: 'signOut' }), isOwner() ? '' : row('person_remove', 'غادر العائلة', 'تفقد كل ما مُنح لك فوراً', { a: 'leaveFam', ic: 'var(--danger)' }))}`; },
});
Object.assign(ACT, {
  signOut() { confirmDlg('الخروج من هذا الجهاز؟', 'ستحتاج إلى رقمك ورمز التحقق للدخول مجدداً. ما في الصندوق الصادر يبقى محفوظاً.', 'اخرج', () => { setPersona('guest'); render(); }); },
  leaveFam() { confirmDlg('مغادرة عائلة المنصور؟', 'تُلغى كل صلاحياتك فوراً، ولن ترى بيانات العائلة. يمكن دعوتك مجدداً لاحقاً.', 'غادر', () => { toast('في التطبيق الفعلي تغادر العائلة الآن', null, 'info'); render(); }, true); },
});
surface('family-settings', {
  t: 'العائلة', sys: 'S1-02', p: 'adult', req: '02:7,8,25,28 03:20 01:12',
  note: 'الاسم والمنطقة والمنطقة الزمنية. المنطقة تحدد ملف المنطقة (الأسعار، قنوات OTP، وضع النطاق المنخفض). حذف العائلة للمالك حصراً بمهلة تراجع.',
  r() { const own = isOwner(); return list(row('edit', 'اسم العائلة', '', { v: 'عائلة المنصور', a: own ? 'soonC' : 'denied:shell.config.edit' }), row('public', 'المنطقة', 'تحدد ملف المنطقة: الأسعار وطرق الدفع وقنوات التحقق', { v: 'اليمن' }), row('schedule', 'المنطقة الزمنية', 'تُحسب بها نوافذ النوم والمدرسة ونهاية اليوم', { v: 'صنعاء UTC+3' }), row('today', 'التقويم', '', { v: 'هجري + ميلادي' })) + (own ? sec('منطقة الخطر') + list(row('swap_horiz', 'انقل الملكية', 'إلى بالغ آخر', { a: 'go:transfer' }), row('delete_forever', 'احذف العائلة', 'مهلة تراجع 30 يوماً ثم حذف نهائي', { a: 'famDel', ic: 'var(--danger)' })) : callout('نقل الملكية وحذف العائلة للأب حصراً.', 'nt', 'lock')); },
});
ACT.famDel = () => confirmDlg('حذف عائلة المنصور؟', 'تُجدوَل العائلة للحذف وتبقى قابلة للاسترجاع 30 يوماً، ثم تُمحى بياناتها نهائياً. يُبلَّغ كل البالغين.', 'تابع', () => gate('حذف العائلة فعل لا يُتراجع عنه بعد المهلة', () => toast('في التطبيق الفعلي تبدأ مهلة الحذف الآن', null, 'info'), 'stepup'), true);
surface('templates', {
  t: 'القوالب', sys: 'S1-01', p: 'adult', req: '01:4 03:13 02:13', st: 'un',
  note: 'UNKNOWN (Q-090): محتوى قوالب العرض الثلاثة (ما يظهر في كل قالب بالتفصيل) سؤال مفتوح يُجاب في مرحلة التصميم. ما في هذا النموذج اقتراح للمراجعة لا قرار.',
  r() { return callout('سنة الميلاد تحدد القالب تلقائياً، ولا يُبدَّل يدوياً في المرحلة 1.', '', 'info') + sec('قوالب العرض') + list(row('child_care', 'المبسّط', 'دون 7 سنوات · بلاطات كبيرة وزر «بيت»', { v: 'يوسف', a: 'jumpP:mini' }), row('face', 'القياسي', '7–12 سنة · أربعة تبويبات', { v: 'ليان', a: 'jumpP:child' }), row('person', 'المراهق', '13–17 سنة · استقلالية وشفافية', { v: 'خالد', a: 'jumpP:teen' })) + callout('<b>غير محسوم (Q-090):</b> المحتوى التفصيلي لكل قالب لم يُعتمد بعد. الشاشات المعروضة مقترحة.', 'wa', 'help') + sec('قوالب الصلاحيات') + list(row('handshake', 'شريك', '43 مفتاحاً', { a: isOwner() ? 'go:tpl-diff:partner' : '' }), row('shield_person', 'وصي محدود', '24 مفتاحاً', { a: isOwner() ? 'go:tpl-diff:guardian' : '' }), row('visibility', 'مراقب', '10 مفاتيح', { a: isOwner() ? 'go:tpl-diff:observer' : '' })); },
});
ACT.jumpP = p => { setPersona(p); };
surface('registry', {
  t: 'الخدمات', sys: 'S1-09', p: 'adult', req: '09:5,8,9,15',
  note: 'الأنظمة التي تظهر في «التحكم» و«الرئيسية». الواجهة تُبنى من السجل المركزي لا من قوائم ثابتة. تفاصيل السجلات والأعلام التقنية في «عن التطبيق ← معلومات تشخيصية».',
  r() { const sv = [['S1-10', 'الحماية والفرض', 15, 4], ['S1-07', 'الموقع والاستغاثة', 6, 3], ['S1-06', 'المهام والتقويم', 9, 3], ['S1-05', 'المكافآت', 12, 3], ['S1-08', 'المحادثة', 8, 2], ['S1-04', 'الخطط', 5, 1]], off = S.svcOff || {};
    return `
    ${sec('الأنظمة المسجَّلة')}${list(sv.map(([id, n, k, w]) => row('', n, `${k} مفتاحاً · ${w} ودجات · <span class="mono">${id}</span>`, { tg: !off[id], ta: isOwner() ? 'svcT:' + id : 'denied:shell.config.edit' })))}
    ${callout('إيقاف نظام يخفي ودجاته وأسطح تحكمه من المركز فوراً، دون حذف بياناته.', 'nt', 'visibility_off')}`; },
});
ACT.svcT = id => { S.svcOff = S.svcOff || {}; S.svcOff[id] = !S.svcOff[id]; toast(S.svcOff[id] ? 'أُخفيت أسطح النظام من المركز' : 'عادت أسطح النظام'); };

/* ---------- الخطة والفوترة ---------- */
surface('plan', {
  t: 'الخطة والفوترة', sys: 'S1-04', p: 'adult', req: '04:1,2,9,12,13,14,15,16,17 09:12,13',
  note: 'القسم في مركز الأوامر للقراءة فقط، وزر الترقية ينقل إلى الخطط. الاستهلاك يُقرأ من حارس الحصص. التراجع لبق: عودة للمجانية بلا قفل ولا حذف بيانات.',
  r() { const p = PLAN[S.plan], own = isOwner(), U = (i, t, u, q) => `<div style="margin-bottom:12px"><div class="fx sb sm"><span class="fx" style="gap:6px">${ic(i)}<b>${t}</b></span><span>${u} من ${q === Infinity ? 'غير محدود' : q}</span></div><div style="margin-top:6px">${pbar(q === Infinity ? 8 : u / q * 100, u / q > .9 ? 'da' : u / q > .7 ? 'wa' : '')}</div></div>`;
    return `<div class="plan cur"><div class="fx sb"><h5>الخطة ${p.n}</h5>${chip(S.planSt === 'trial' ? 'تجربة · بقي 7 أيام' : S.planSt === 'grace' ? 'مهلة · بقي 3 أيام' : 'فعّالة', S.planSt === 'grace' ? 'wa' : 'ok', 'check_circle')}</div><div class="sm muted" style="margin:4px 0 14px">${S.plan === 'free' ? 'بلا تكلفة · بلا مدة' : `${p.yer} ر.ي شهرياً · تتجدد 15 ديسمبر`}</div>
    ${U('groups', 'الأفراد', 5, p.mem)}${U('sms', 'رسائل SMS هذا الشهر', S.sms.used, p.sms)}${U('wand_stars', 'ميزانية المساعد', S.aiUse, p.ai)}</div>
    ${S.planSt === 'grace' ? callout('انتهى الاشتراك ولم يُجدَّد. أمامك 3 أيام مهلة، بعدها تعود العائلة إلى المجانية دون قفل ودون حذف أي بيانات، ويبقى كل الأعضاء الحاليين.', 'wa', 'schedule') : ''}
    ${own ? btn(S.plan === 'premium' ? 'قارن الخطط' : 'رقِّ الخطة', 'go:plans', '', 'arrow_circle_up') : callout('الفوترة للأب حصراً. يمكنك الاطلاع على الخطة والاستهلاك فقط.', 'nt', 'lock')}
    ${own ? `<div class="gap"></div>${list(row('sms', 'عبّئ رصيد SMS', '50 رسالة تضاف لرصيد الشهر', { v: '250 ر.ي', a: 'go:topup' }), row('confirmation_number', 'استخدم قسيمة', 'من وكيل معتمد', { a: 'go:voucher' }), row('receipt_long', 'سجل المدفوعات', '', { a: 'soonC' }), row('replay', 'استعد المشتريات', 'من متجر Google Play', { a: 'restoreP' }))}` : ''}`; },
});
ACT.restoreP = () => toast('لا مشتريات سابقة على هذا الحساب', null, 'info');
surface('plans', {
  t: 'الخطط', sys: 'S1-04', p: 'owner', req: '04:1,3,4,5,6,12',
  note: 'ثلاث خطط بمصفوفة حصص قابلة للتعديل من ملف الخطط. الأسعار حسب المنطقة: اليمن بالريال، الخليج بالريال السعودي. لا مشتريات تظهر للطفل أو المراهق أبداً.',
  r() { const yr = S.yr, ye = (S.reg || 'YE') === 'YE', cur = S.plan, price = k => { const p = PLAN[k]; return k === 'free' ? 'مجاناً' : ye ? `${p.yer} <small>ر.ي / شهر</small>` : yr ? `${p.sarY} <small>ر.س / سنة</small>` : `${p.sar} <small>ر.س / شهر</small>`; };
    const F = k => { const p = PLAN[k]; return `<ul><li>${ic('check')}${p.mem === Infinity ? 'أفراد بلا حد' : 'حتى ' + p.mem + ' أفراد'}</li><li>${ic('check')}${p.sms} رسالة SMS شهرياً</li><li>${ic('check')}${p.ai} عملية للمساعد شهرياً</li></ul>`; };
    return `${seg([['YE', 'اليمن'], ['GCC', 'الخليج']], S.reg || 'YE', 'set:reg')}${ye ? '' : seg([['', 'شهري'], ['1', 'سنوي · وفّر ~25%']], yr ? '1' : '', 'set:yr')}
    ${['free', 'basic', 'premium'].map(k => `<div class="plan ${cur === k ? 'cur' : k === 'premium' ? 'best' : ''}"><div class="fx sb"><h5>${PLAN[k].n}</h5>${cur === k ? chip('خطتك الحالية', 'ok', 'check') : k === 'premium' ? chip('تجربة 7 أيام مجاناً', 'go') : ''}</div><div class="pr">${price(k)}</div>${F(k)}${cur === k ? '' : k === 'free' ? btn('عُد إلى المجانية', 'planDown', 'sec sm') : btn(k === 'premium' && cur === 'free' ? 'ابدأ التجربة المجانية' : 'اختر ' + PLAN[k].n, 'go:pay:' + k, 'sm')}</div>`).join('')}
    <p class="xs muted c">الترقية فورية عند تأكيد الدفع من الخادم. يمكنك الإلغاء في أي وقت.</p>`; },
});
ACT.planDown = () => confirmDlg('العودة إلى الخطة المجانية؟', 'لا يُقفل شيء ولا تُحذف بيانات. يبقى أعضاؤك الحاليون، ولا يمكن إضافة أعضاء جدد فوق حد المجانية.', 'عُد إلى المجانية', () => { S.plan = 'free'; S.planSt = ''; toast('أنت الآن على الخطة المجانية'); render(); });
surface('pay', {
  t: 'الدفع', sys: 'S1-04', p: 'owner', a: ['basic'], req: '04:4,5,6,7,8',
  note: 'طرق الدفع من ملف المنطقة. اليمن: محافظ + دفع يدوي مسبق + قسائم وكلاء. الخليج: Google Play + بطاقات عبر الويب. التحقق خادمي دائماً، والترقية لا تتم قبل تأكيده.',
  r(k) { const ye = (S.reg || 'YE') === 'YE', p = PLAN[k], m = S.pm || (ye ? 'onecash' : 'gplay');
    const O = ye ? [['onecash', 'محفظة OneCash', 'account_balance_wallet'], ['mahfathati', 'محفظتي', 'wallet'], ['voucher', 'قسيمة وكيل', 'confirmation_number'], ['manual', 'دفع يدوي مسبق', 'storefront']] : [['gplay', 'Google Play', 'android'], ['card', 'بطاقة عبر الويب (Tap / Moyasar)', 'credit_card']];
    return `<div class="card flat fx sb"><div><b>الخطة ${p.n}</b><div class="sm muted">${k === 'premium' && S.plan === 'free' ? 'تجربة 7 أيام ثم ' : ''}${ye ? p.yer + ' ر.ي شهرياً' : p.sar + ' ر.س شهرياً'}</div></div>${ic('workspace_premium')}</div>${sec('طريقة الدفع')}${list(O.map(([id, n, i]) => row(i, n, id === 'manual' ? 'ادفع لدى وكيل ثم أدخل رقم الإيصال' : '', { a: 'set:pm:' + id, chev: false, v: ic(m === id ? 'check_circle-fill' : 'radio_button_unchecked') })))}
    ${m === 'voucher' ? btn('أدخل رمز القسيمة', 'go:voucher', 'sec') + '<div class="gap"></div>' : ''}${btn(S.paying ? 'نتحقق من الدفع…' : 'ادفع وفعّل', 'payGo:' + k, S.paying ? '" disabled="' : '', 'lock')}<p class="xs muted c" style="margin-top:10px">تُفعَّل الخطة بعد تحقق الخادم من الدفع، لا قبله.</p>`; },
});
ACT.payGo = k => { if (offline()) { toast('الدفع يحتاج اتصالاً. حاول عند عودة الشبكة.', null, 'cloud_off'); return; } S.paying = 1; render(); setTimeout(() => { S.paying = 0; S.planSt = k === 'premium' && S.plan === 'free' ? 'trial' : ''; S.plan = k; S.stack = S.stack.filter(s => !['pay', 'plans'].includes(s.id)); toast(`فُعّلت الخطة ${PLAN[k].n}`); render(); }, 1400); return false; };
surface('voucher', {
  kind: 'sheet', t: 'قسيمة', sys: 'S1-04', p: 'owner', req: '04:6,8',
  note: 'كود لمرة واحدة يُتحقق منه خادمياً ثم يفعّل الاشتراك. الرمز يُعرض LTR معزولاً.',
  r() { return `<h4>استخدم قسيمة</h4><p class="d">أدخل الرمز المطبوع على القسيمة. يُستخدم مرة واحدة فقط.</p><label class="fld ${S.vErr ? 'err' : ''}"><span>رمز القسيمة</span><input id="vc" class="mono" style="text-align:center;letter-spacing:3px" placeholder="FAM-XXXX-XXXX" dir="ltr">${S.vErr ? '<small>الرمز غير صحيح أو استُخدم من قبل. تحقق منه وحاول مجدداً.</small>' : '<small>جرّب: FAM-2026-DEMO</small>'}</label>${btn('فعّل القسيمة', 'vGo')}`; },
});
ACT.vGo = () => { const v = ($('#vc') || {}).value.trim().toUpperCase(); if (v !== 'FAM-2026-DEMO') { S.vErr = 1; return; } S.vErr = 0; S.sheet = null; S.plan = 'basic'; S.planSt = ''; toast('فُعّلت الخطة الأساسية بالقسيمة'); };
surface('topup', {
  kind: 'sheet', t: 'تعبئة SMS', sys: 'S1-04', p: 'owner', req: '04:10,11 07:17',
  r() { return `<h4>عبّئ رصيد الرسائل</h4><p class="d">50 رسالة تُضاف لرصيد هذا الشهر. رسائل الاستغاثة لا تتوقف: تبقى 3 رسائل طوارئ بعد نفاد الرصيد في كل شهر.</p><div class="card flat fx sb"><div><b>حزمة 50 رسالة</b><div class="sm muted">اليمن 250 ر.ي · الخليج 5.99 ر.س</div></div>${ic('sms')}</div>${btn('اشترِ الحزمة', 'topGo')}`; },
});
ACT.topGo = () => { S.sheet = null; S.sms.used = Math.max(0, S.sms.used - 50); S.smsExtra = (S.smsExtra || 0) + 50; toast('أُضيفت 50 رسالة إلى رصيد الشهر'); };

/* ---------- الخصوصية والأمان ---------- */
surface('privacy', {
  t: 'الخصوصية والبيانات', sys: 'S1-02', p: 'adult', req: '02:25,26,27,28 01:15,16 08:15', st: 'un',
  note: 'UNKNOWN (Q-046): سياسة تحليلات استخدام الأطفال غير محسومة؛ لذلك لا يُعرض لها مفتاح. الخلو من الإعلانات وأدوات التتبع ثابت صلب بلا واجهة.',
  r() { return `${callout('لا إعلانات ولا أدوات تتبع في التطبيق، وهذا ثابت لا يُغيَّر بإعداد.', 'ok', 'verified_user')}${sec('ما نشاركه مع الطفل')}${list(row('visibility', 'الشفافية عن الفئات لا المحتوى', 'يعرف الطفل ما الذي يُتابَع (الوقت، الموقع، المحادثات) لا تفاصيله', { a: 'go:consent-view' }), row('notifications', 'الإشعار الدائم', 'يعرض الوقت المتبقي، لا عبارة رقابية', { a: 'go:persist' }))}${sec('بياناتي')}${list(row('download', 'صدّر بياناتي', 'ملف يُجهَّز ويصلك رابطه', { a: 'expGo' }), isOwner() ? row('folder', 'صدّر بيانات العائلة', 'للمالك فقط', { a: 'expGo' }) : '', row('delete', 'الاحتفاظ بالمحادثات', 'دائم حتى يحذفها الأب', { v: 'دائم' }), row('location_on', 'سجل المواقع', 'يُحذف تلقائياً', { v: '7 أيام' }))}${callout('<b>غير محسوم (Q-046):</b> سياسة تحليلات الأطفال لم تُعتمد؛ لا يُجمع شيء حتى تُحسم.', 'wa', 'help')}${sec('منطقة الخطر')}${list(row('delete_forever', 'احذف حسابي', 'مهلة تراجع 30 يوماً', { a: 'go:delete-account', ic: 'var(--danger)' }))}`; },
});
ACT.expGo = () => toast('بدأ تجهيز التصدير · يصلك إشعار عند الجاهزية', null, 'download');
surface('delete-account', {
  t: 'حذف الحساب', sys: 'S1-02', p: 'adult', req: '02:25,28 03:20',
  note: 'فعل عالي الخطورة: شرح العواقب ← تأكيد ← رفع أمني. حذف ناعم بمهلة 30 يوماً ثم محو مجدول.',
  r() { return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('delete_forever')}</div><p class="ttl" style="font-size:22px">ماذا يحدث عند الحذف؟</p><div class="card"><div class="tl"><div class="ev wa"><b>اليوم: يُعطَّل الحساب</b><span>تخرج من كل أجهزتك</span></div><div class="ev"><b>خلال 30 يوماً: يمكنك التراجع</b><span>ادخل برقمك لإلغاء الحذف</span></div><div class="ev da"><b>بعد 30 يوماً: محو نهائي</b><span>لا يمكن الاسترجاع</span></div></div></div>${isOwner() ? callout('أنت مالك العائلة. انقل الملكية إلى بالغ آخر أولاً، أو احذف العائلة.', 'wa', 'warning') + btn('انقل الملكية أولاً', 'go:transfer', 'sec') : btn('احذف حسابي', 'delGo', 'dng')}`; },
});
ACT.delGo = () => gate('حذف الحساب', () => toast('في التطبيق الفعلي تبدأ مهلة الـ30 يوماً الآن', null, 'info'), 'stepup');
surface('security', {
  t: 'الأمان', sys: 'S1-02', p: 'adult', req: '02:5,6,16,20 01:5,23',
  note: 'التحقق بخطوتين إلزامي. البصمة تفتح التطبيق في وضع الأهل فقط ولا تتجاوز بوابة الوالدين. الجلسة منزلقة بسقف 30 يوماً.',
  r() { const own = isOwner(); return `${sec('الدخول')}${list(row('verified_user', 'التحقق بخطوتين (TOTP)', 'إلزامي · مفعّل', { v: chip('مفعّل', 'ok', 'check') }), row('fingerprint', 'فتح سريع بالبصمة', 'في وضع الأهل فقط · لا يتجاوز بوابة الوالدين', { tg: S.bio ?? true, ta: own ? 'bioT' : 'denied:identity.biometric.enable' }), row('pin', 'رقم بوابة الوالدين', S.pin.set ? 'غيّر رقمك السري' : 'لم يُنشأ بعد', { a: own ? 'pinChange' : 'denied:shell.parent_gate.manage', v: own ? (S.pin.set ? '' : chip('أنشئه', 'wa')) : ic('lock') }))}
    ${sec('الجلسات النشطة')}${list(row('mobile', 'هذا الجهاز', 'Samsung A54 · صنعاء · الآن', { v: chip('الحالي', 'ok') }), row('tablet_android', 'Lenovo Tab M10', 'آخر نشاط قبل 3 أيام · تنتهي بعد 27 يوماً', { v: own ? `<button class="btn txt sm" data-a="sessEnd">أنهِ</button>` : '' }))}<p class="xs muted" style="margin:0 4px 10px">تبقى الجلسة ما دمت تستخدم التطبيق، وبحد أقصى 30 يوماً من تسجيل الدخول.</p>
    ${sec('الاسترداد')}${list(row('support', 'جهة الاسترداد الموثوقة', 'إن فقدت الهاتف والرقم معاً', { v: 'سارة', a: 'go:recovery' }), row('key', 'مفتاح توقيع هذا الجهاز', 'مربوط بالعتاد · يوقّع العمليات الحساسة', { v: chip('مسجَّل', 'ok', 'check') }))}`; },
});
Object.assign(ACT, {
  bioT() { S.bio = !(S.bio ?? true); if (S.bio) toast('تغيير البصمة لاحقاً يتطلب إعادة تسجيل مفتاح الجهاز بالرقم السري', null, 'fingerprint'); },
  /* التغيير يتطلب الرقم الحالي نفسه لا البصمة (S1-01 §7)؛ والإنشاء الأول بلا رقم سابق */
  pinChange() { if (!S.pin.set) return pinSetOpen('create'); gate('أدخل الرقم الحالي لتغييره', () => pinSetOpen('change')); },
  sessEnd() { toast('أُنهيت الجلسة على Lenovo Tab M10'); },
});
surface('recovery', {
  t: 'استرداد الحساب', sys: 'S1-02', p: 'adult', req: '02:20',
  note: 'الأب يحدد مسبقاً بالغاً موثوقاً. عند الطلب تؤكد الجهة، ثم انتظار 7 أيام مع إشعار كل أجهزة العائلة، والاعتراض يلغي الطلب.',
  r() { return `${callout('إن فقدت هاتفك ورقمك معاً، تساعدك جهة الاسترداد على العودة برقم جديد.')}${list(row('', 'سارة', 'جهة الاسترداد الموثوقة', { lead: av(M.sara), v: 'غيّر', a: 'soonC' }))}${sec('كيف يعمل')}<div class="card"><div class="tl"><div class="ev"><b>تطلب الاسترداد برقم جديد</b><span>من شاشة الدخول</span></div><div class="ev"><b>سارة تؤكد من جهازها</b><span>برقمها السري</span></div><div class="ev wa"><b>انتظار 7 أيام</b><span>يصل إشعار إلى كل أجهزة العائلة · أي اعتراض يلغي الطلب</span></div><div class="ev ok"><b>يُسترد الحساب</b><span>بالرقم الجديد</span></div></div></div>`; },
});

/* ---------- المساعد الذكي ---------- */
const AIK = [['agent.summary.read', 'يلخّص ويقرأ', 'بلا موافقة'], ['agent.plan.create', 'يقترح خطة', 'موافقتك'], ['agent.task.verify', 'يتحقق من المهام', 'يحيل ما لا يجزم به'], ['agent.message.send', 'يرسل رسالة', 'موافقتك'], ['agent.rule.change', 'يغيّر قاعدة', 'موافقتك + الرقم السري'], ['agent.payment.execute', 'ينفّذ دفعاً', 'موافقتك + الرقم السري'], ['agent.data.delete', 'يحذف بيانات', 'موافقتك + الرقم السري']];
surface('ai', {
  t: 'المساعد الذكي', sys: 'S1-09', p: 'adult', req: '09:18 01:14 04:16 05:17,18 06:7,17',
  note: 'الذكاء مضمَّن في كل خدمة لا تبويباً منفصلاً. الأب يضبط الاستقلالية (الافتراضي «يقترح فقط»). ترتيب الفحص: مفتاح الإيقاف ← مفتاح القدرة + بوابة الموافقة ← الميزانية. كل فعل مسجَّل وقابل للتراجع.',
  r() { const own = isOwner(), q = PLAN[S.plan].ai;
    return `<div class="card"><div class="fx sb"><div class="fx">${ic('power_settings_new')}<div><b>مفتاح الإيقاف</b><div class="sm muted">يوقف كل أفعال المساعد فوراً</div></div></div>${tg(!S.aiKill, own ? 'flip:aiKill' : 'denied:agent.rule.change', 'تشغيل المساعد')}</div></div>
    ${S.aiKill ? callout('المساعد متوقف. لا اقتراحات ولا تحقق آلي من المهام؛ كل تسليم يأتيك مباشرة.', 'wa', 'power_settings_new') : `${sec('مستوى الاستقلالية')}${seg([['suggest', 'يقترح فقط'], ['ask', 'ينفّذ بموافقة'], ['auto', 'ينفّذ البسيط']], S.aiLevel, own ? 'set:aiLevel' : 'denied:agent.rule.change')}<p class="xs muted" style="margin:-4px 4px 10px">${{ suggest: 'الافتراضي: لا ينفّذ شيئاً. يعرض اقتراحه وأنت تقرر.', ask: 'يجهّز الفعل ثم ينتظر موافقتك عليه.', auto: 'ينفّذ الأفعال منخفضة الخطورة القابلة للتراجع فقط، ويبلغك.' }[S.aiLevel]}</p>
    <div class="card"><div class="fx sb sm"><b>ميزانية هذا الشهر</b><span>${S.aiUse} من ${q}</span></div><div style="margin:8px 0 4px">${pbar(S.aiUse / q * 100)}</div><div class="xs muted">عند نفادها يتوقف المساعد بهدوء وتبقى كل الخدمات تعمل يدوياً.</div></div>
    ${sec('ما يستطيع فعله')}${list(AIK.map(([k, t, g], i) => row(i < 3 ? 'check_circle' : 'lock', t, `${g} · <span class="mono xs">${k}</span>`, { ic: i < 3 ? 'var(--success)' : 'var(--muted)', v: i < 3 ? chip('ممنوح', 'ok') : chip('غير ممنوح', 'ol') })))}`}
    ${sec('سجل أفعال المساعد')}<div class="card"><div class="tl">${S.agent.map(g => `<div class="ev ${g.st.includes('نُفّذ') || g.st === 'تمّ' ? 'ok' : g.st === 'رُفض' ? 'da' : 'wa'}"><b>${g.t}</b><span>${g.at} · ${g.gate} · <span class="mono">${g.k}</span></span><span>${chip(g.st, g.st === 'بانتظارك' ? 'wa' : '')} ${g.undo ? `<button class="why" data-a="aiUndo:${g.id}">${ic('undo')}تراجع</button>` : ''}</span></div>`).join('')}</div></div>`; },
});
ACT.aiUndo = id => { const g = S.agent.find(x => x.id === id); g.undo = 0; g.st = 'تُرُوجع عنه'; audit('تراجع عن فعل المساعد: ' + g.t, g.k); toast('أُعيدت نافذة النوم إلى ما كانت'); };

/* ---------- العرض، المنصة، الصندوق الصادر ---------- */
surface('display', {
  t: 'اللغة والعرض', sys: 'S1-01', p: 'any', req: '01:21 02:18',
  note: 'التطبيق عربي وإنجليزي في هذه النسخة. في هذا النموذج تُرجم الغلاف (التبويبات، التهيئة) فقط لإثبات انقلاب الاتجاه RTL/LTR؛ بقية النصوص عربية.',
  r() { return `${sec('اللغة')}${list(row('', 'العربية', '', { a: 'set:lang:ar', chev: false, v: ic(S.lang === 'ar' ? 'check_circle-fill' : 'radio_button_unchecked') }), row('', 'English', '', { a: 'set:lang:en', chev: false, v: ic(S.lang === 'en' ? 'check_circle-fill' : 'radio_button_unchecked') }))}${sec('المظهر')}${seg([['light', 'فاتح'], ['dark', 'داكن']], S.theme, 'set:theme')}${sec('حجم النص')}${seg([[0.9, 'صغير'], [1, 'عادي'], [1.15, 'كبير'], [1.3, 'أكبر']], S.ts, 'set:ts')}<div class="card"><b>معاينة</b><p class="sm muted" style="margin:4px 0 0">بقي لليان 24 دقيقة اليوم. الحد الأدنى لحجم النص 12 ولا تُضاف مسافات بين الحروف العربية.</p></div>${list(row('animation', 'تقليل الحركة', 'يوقف الانتقالات والاحتفالات', { tg: S.motion === 'off', ta: 'motionT' }), row('today', 'التقويم', '', { v: 'هجري + ميلادي' }))}${sec('الأرقام')}${seg([['latn', '012 لاتينية'], ['arab', '٠١٢ عربية']], S.num, 'numSet')}${sec('الوصول')}${list(row('emergency_home', 'استغاثة بنقرة ثم تأكيد', 'لمن يصعب عليه الضغط المطوّل 3 ثوانٍ', { tg: S.sos2, ta: 'flip:sos2' }))}`; },
});
ACT.motionT = () => { S.motion = S.motion === 'off' ? 'on' : 'off'; };
ACT.numSet = v => { S.num = v; };
surface('health', {
  t: 'معلومات تشخيصية', sys: 'S1-01', p: 'adult', req: '01:3,10,11,12,13,14,17,19,22,23', st: 'un',
  note: 'شاشة للدعم الفني لا للاستخدام اليومي: قراءات هذا الجهاز، وحدة الفرض، التوفر على المنصة، السجلات الأربعة، أعلام الميزات وملف المنطقة. نُقلت من «المزيد» إلى «عن التطبيق» لأنها لا تخدم الأب مباشرة. UNKNOWN: عتبات تنبيه الذاكرة والبطارية غير محسومة (GAP-S1-01-07).',
  r() {
    const ios = S.os === 'ios';
    return `${callout('هذه الصفحة للدعم الفني. إن طلب منك فريق الدعم معلومة عن جهازك فستجدها هنا.', 'nt', 'support_agent')}
    ${sec('هذا الجهاز')}<div class="g2">${[['memory', 'الذاكرة', '3 GB', 'انتقالات كاملة'], ['wifi', 'الاتصال', offline() ? 'منقطع' : S.lbw ? 'ضعيف' : 'جيد', offline() ? 'يعمل محلياً' : S.lbw ? 'توفير البيانات' : 'Wi‑Fi'], ['battery_5_bar', 'البطارية', '72%', 'عادي'], ['rocket_launch', 'الإقلاع البارد', '0.9 ث', 'الهدف < 1.2 ث']].map(([i, t, v, x]) => `<div class="card">${ic(i)}<div class="b" style="font-size:calc(20px*var(--ts));margin-top:4px">${v}</div><div class="sm muted">${t} · ${x}</div></div>`).join('')}</div>
    ${list(row('speed', 'الانتقالات الثقيلة', 'تُعطَّل تلقائياً على الأجهزة دون 2GB', { v: chip('مفعّلة', 'ok') }), row('shield', 'وحدة الفرض', ios ? 'غير متاحة على iOS · التحكم العميق على أندرويد فقط' : 'تعمل على أجهزة الأطفال فقط · هذا جهاز أهل', { v: ios ? chip('غير متاحة', 'ol') : chip('لا تنطبق', 'ol'), a: ios ? 'why:ios' : '' }), row('key', 'مفتاح توقيع الجهاز', 'مربوط بالعتاد', { v: chip('مسجَّل', 'ok', 'check') }), row('android', 'المنصة', '', { v: ios ? 'iOS' : 'Android' }))}
    ${sec('السجلات المركزية')}${list([['tune', 'ControlRegistry', 'مفاتيح التحكم', ''], ['key', 'PermissionRegistry', 'مفاتيح الصلاحيات', '95'], ['widgets', 'WidgetRegistry', 'ودجات الرئيسية', ''], ['notifications', 'NotificationRegistry', 'قنوات التنبيه', '']].map(([i, n, x, c]) => row(i, x, `<span class="mono">${n}</span>`, { v: c ? `<span class="mono">${c}</span>` : chip('مسجَّل', 'ok', 'check'), chev: false })))}
    ${sec('أعلام الميزات وملف المنطقة')}${list(row('public', 'المنطقة', 'ملف المنطقة يُحمَّل عند الفتح ويُحفظ', { v: '<span class="mono">YE</span>', chev: false }), row('flag', 'low_bandwidth_default', 'صالح حتى إشعار آخر', { v: chip('on', 'ok'), chev: false }), row('flag', 'otp_channels', '', { v: '<span class="mono xs">whatsapp→sms→call</span>', chev: false }), row('flag', 'payment_routes', 'مسارات الدفع من ملف المنطقة · تفاصيلها في «الخطة والفوترة»', { chev: false }), row('smart_toy', 'ai_gateway_hook', 'خطاف العقد فقط · الميزانية ومفتاح الإيقاف في «المساعد الذكي»', { v: chip('hook', 'ol'), chev: false }))}`;
  },
});
ACT.syncNow = () => { if (offline()) return toast('لا يوجد اتصال الآن · يُرسل كل شيء تلقائياً عند عودته', null, 'cloud_off'); flushOutbox(); S.lastSync = S.lastSync || { n: 0, at: 'الآن' }; S.lastSync.at = 'الآن'; toast('تمت المزامنة', null, 'cloud_done'); };
surface('about', {
  t: 'عن التطبيق', sys: 'S1-01', p: 'any', req: '01:1,3,19,20', st: 'un',
  note: 'الشعار من تصميم Q-398 (ينتظر حكم المالك من الشاشة). شخصية المرشد (B-002) ما زالت مفتوحة ولا تظهر.',
  r() { return `<div class="c" style="padding:16px 0"><img src="assets/brand/logo-horizontal-ar${S.theme === 'dark' ? '-dark' : ''}.svg" alt="عائلتي" height="96" style="margin:0 auto"><div class="sm muted">تطبيق واحد لكل العائلة · الإصدار 1.0.0</div></div>${list(S.sys === 'avail' || S.sys === 'soft' ? row('system_update_alt', 'تحديث متاح', S.sys === 'soft' ? 'إصدارك قديم · حدّث لتبقى كل الخدمات تعمل' : 'الإصدار 1.1.0 · عبر متجر Google Play', { a: 'updGo', v: chip('حدّث', S.sys === 'soft' ? 'wa' : 'in') }) : row('system_update_alt', 'تحقق من التحديثات', 'عبر متجر Google Play', { a: 'updCheck' }), row('android', 'المنصة', 'Android: كامل · iOS: واجهة مشتركة، والفرض العميق لاحقاً', { v: S.os === 'ios' ? 'iOS' : 'Android' }), row('description', 'الشروط والخصوصية', 'شروط الاستخدام · سياسة الخصوصية · خصوصية الأطفال', { a: 'go:legal' }), isAdult() ? row('contact_support', 'المساعدة والدعم', '', { a: 'go:help' }) : '', row('gavel', 'تراخيص المصادر المفتوحة', 'IBM Plex Sans Arabic · Material Symbols', { a: 'go:licenses' }))}${isAdult() ? list(row('support_agent', 'معلومات تشخيصية', 'للدعم الفني', { a: 'go:health' })) : ''}`; },
});
ACT.updCheck = () => toast(offline() ? 'لا يوجد اتصال · نتحقق عند عودته' : 'أنت على أحدث إصدار', null, offline() ? 'cloud_off' : 'check_circle');
surface('outbox', {
  t: 'البيانات والمزامنة', sys: 'S1-01', p: 'any', req: '01:8,9,10 06:16 08:14 07:6 05:3 10:16',
  note: 'شاشة واحدة بلغة المستخدم بدل «الصندوق الصادر» و«وضع النطاق المنخفض»: ما ينتظر الإرسال، زر «زامن الآن»، وتوفير البيانات (تلقائي افتراضياً، إعداد شخصي لكل جهاز). جرّب: اقطع الاتصال من الاستوديو، نفّذ أفعالاً، ثم أعد الاتصال. الطفل والمراهق يريان الحالة فقط.',
  r() {
    const n = S.outbox.length, off = offline();
    const head = `<div class="card fx">${ic(off ? 'cloud_off' : n ? 'cloud_upload' : 'cloud_done', `" style="width:34px;height:34px;color:var(--${off ? 'warning' : 'success'})`)}<div class="grow"><b>${off ? 'غير متصل' : n ? 'جارٍ الإرسال…' : 'كل شيء مُرسل'}</b><div class="sm muted">${off ? (n ? 'ما فعلته محفوظ ويُرسل بترتيبه عند عودة الاتصال.' : 'تعمل بآخر بيانات محفوظة. لا شيء ينتظر.') : S.lastSync ? `آخر مزامنة ${S.lastSync.at}${S.lastSync.n ? ` · أُرسلت ${S.lastSync.n}` : ''}` : 'آخر مزامنة قبل 18 د'}</div></div></div>`;
    if (!isAdult()) return head + (n ? callout(n === 1 ? 'عملية واحدة ستُرسل عند عودة الاتصال.' : `${n} عمليات ستُرسل عند عودة الاتصال.`, 'nt', 'schedule') : '');
    return `${head}${btn('زامن الآن', 'syncNow', off ? 'sec" disabled="' : 'sec', 'sync')}
    ${S.syncConflict ? `<div class="gap"></div>${callout('<b>تغيير واحد لم يُطبَّق.</b> عدّلت سارة حصة ليان بعدك، فبقي تعديلها الأحدث (150 د). تعديلك (120 د) لم يُكتب فوقه.', 'wa', 'merge')}<div class="btns">${btn('أبقِ تعديل سارة', 'conflKeep', 'sec')}${btn('أعد تطبيق تعديلي', 'conflRedo', 'ton')}</div>` : ''}
    ${n ? `${sec('بانتظار الإرسال')}${list(S.outbox.map((o, i) => row('schedule', o.t, `${o.at} · يُرسل ${i === 0 ? 'أولاً' : 'بعد ما قبله'}`, { chev: false })))}` : ''}
    ${sec('توفير البيانات')}${seg([['auto', 'تلقائي'], ['on', 'دائماً'], ['off', 'متوقف']], S.saver, 'saverSet')}<p class="sm muted" style="margin:8px 2px 0">${S.saver === 'auto' ? (S.lbw ? 'مفعّل الآن لأن الاتصال ضعيف. يعود للوضع العادي عند تحسّنه.' : 'يتفعّل وحده عند ضعف الاتصال.') : S.saver === 'on' ? 'الصور والخرائط تُحمَّل عند الطلب، ولا تحديث تلقائي في الخلفية.' : 'متوقف على هذا الجهاز. قد يزيد استهلاك البيانات.'}</p>
    ${S.saver !== 'off' ? `<p class="sm" style="margin:14px 2px 6px;font-weight:500">المزامنة عند توفير البيانات</p>${seg([['hour', 'كل ساعة'], ['day', 'يومياً'], ['manual', 'يدوياً فقط']], S.syncSched || 'hour', 'syncSched')}<p class="xs muted" style="margin:6px 2px 0">«زامن الآن» متاح دائماً. الاستغاثة لا تنتظر المزامنة.</p>` : ''}
    <p class="xs muted" style="margin:10px 2px 0">هذا الإعداد لجهازك أنت فقط. الاستغاثة والقواعد على أجهزة الأطفال تعمل في كل الأحوال.</p>`;
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
  r() { return `${isAdult() ? '' : callout(S.notifPerm ? 'هذا الإشعار يبقى ظاهراً ما دام التطبيق يحمي الجهاز. لا يُخفى من داخل التطبيق.' : '<b>الإشعارات متوقفة على هذا الجهاز.</b> الحماية ما زالت تعمل، لكن الوقت المتبقي لا يظهر والتنبيهات لا تصل. أخبر بابا ليفعّلها.', S.notifPerm ? 'nt' : 'wa', S.notifPerm ? 'info' : 'notifications_off')}<p class="sm muted" style="margin:0 4px 6px">هكذا يظهر على جهاز الطفل:</p><div class="lockn"><span class="ap">${ic('hourglass_top')}</span><span><b>بقي لك 24 دقيقة اليوم</b><small>عائلتي · اضغط لترى يومك</small></span></div><p class="sm muted" style="margin:14px 4px 6px">وعلى جهاز ولي الأمر:</p><div class="lockn"><span class="ap">${ic('verified_user')}</span><span><b>عائلتي تعمل</b><small>3 أطفال متصلون · لا شيء يحتاج قرارك</small></span></div>${callout('لا نكتب «أنت مراقَب». الإشعار يخدم صاحب الجهاز بمعلومة تفيده.', 'ok', 'check_circle')}`; },
});
surface('consent-view', {
  t: 'ما اتفقنا عليه', sys: 'S1-02', p: 'any', req: '02:17 01:15',
  note: 'الموافقة المشتركة تُجرى مرة واحدة عند أول اقتران وتُسجَّل في التدقيق؛ وتبقى متاحة للطرفين للاطلاع.',
  r() { return `${callout('اتفق أحمد وليان على هذا في 2 نوفمبر 2026 عند إقران الجهاز.', 'ok', 'handshake')}${list(row('hourglass_top', 'وقت الشاشة', 'كم دقيقة، لا ماذا شاهدتِ بالتفصيل'), row('location_on', 'مشاركة الموقع', 'أين الجهاز الآن وسجل 7 أيام'), row('forum', 'المحادثات داخل العائلة', 'الأب يستطيع رؤيتها'), row('travel_explore', 'فئات المواقع', 'نوع الموقع، لا كل صفحة'))}`; },
});

/* ============ ورقة «لماذا؟» — تفسير موحّد لكل قفل أو قيد أو اقتراح ============ */
const WHY = {
  ios: ['لماذا لا يتوفر على iOS؟', 'التحكم العميق بالتطبيقات يعتمد على وحدة فرض خاصة بأندرويد. على iOS نعرض ما يعمل فعلاً فقط، ولا نَعِد بما لا نستطيع تنفيذه.', 'S1-01 REQ-019 · S1-09 REQ-009'],
  rank: ['كيف تُرتَّب القواعد؟', 'عند تعارض قاعدتين يفوز النوع الأعلى: النوم، ثم المدرسة، ثم حدود التطبيقات، ثم الحصة الإجمالية. يمكن للأب تغيير هذا الترتيب.', 'S1-10 REQ-010/011'],
  extra: ['أين يذهب الوقت الإضافي؟', 'الوقت الممنوح أو المشترى بالنقاط يضاف إلى حدّ التطبيق المطلوب فقط، وينتهي بنهاية اليوم. لا يفتح تطبيقاً في وقت النوم أو المدرسة.', 'S1-10 REQ-012 · S1-05 REQ-008/009'],
  ai: ['لماذا هذا الاقتراح؟', 'استند المساعد إلى أوقات استخدام الجهاز في آخر 7 أيام فقط، لا إلى محتوى أي تطبيق. لا يُنفَّذ شيء دون موافقتك، وكل فعل يُسجَّل ويمكن التراجع عنه.', 'AI-BOUNDARIES · S1-09 REQ-018'],
  stale: ['لماذا «آخر تحديث»؟', 'لا نعرض بيانات قديمة كأنها حية. عندما ينقطع الاتصال نُظهر عمر كل معلومة بوضوح.', 'S1-09 REQ-010/011'],
  classifier: ['كيف رُصدت الرسالة؟', 'مصنّف آلي خفيف يفحص رسائل الأطفال دون 13 دائماً، وللمراهقين بمفتاح يملكه الأب. قد يخطئ، ولذلك يعرضها عليك دون أن يحذف أو يعاقب.', 'S1-08 REQ-012'],
  sleep: ['لماذا التطبيقات مغلقة؟', 'الآن وقت النوم في جدولك. كل التطبيقات تنام معك، وزر الاستغاثة يعمل دائماً.', 'S1-10 REQ-007'],
  kidlimit: ['لماذا توقف التطبيق؟', 'انتهى وقت هذا التطبيق اليوم. تستطيع طلب وقت إضافي من بابا، أو استخدام نقاطك، أو فتح تطبيق آخر.', 'S1-10 REQ-003/005'],
};
surface('why', {
  kind: 'sheet', t: 'لماذا؟', sys: 'S1-09', p: 'any', a: ['rank'], req: '09:4,8,9 03:7',
  note: 'نمط موحّد: كل قفل أو قيمة أو اقتراح له تفسير بلغة بسيطة مع مصدره. محاولة استخدام مفتاح غير ممنوح تُسجَّل ويُنبَّه الأب.',
  r(id) {
    if (id.startsWith('nd:')) { const k = id.slice(3), oo = window.FOS_PERM.ownerOnly.includes(k); return `<div class="bigic" style="width:64px;height:64px;border-radius:22px">${ic('lock_person')}</div><h4 class="c">${oo ? 'هذا الإجراء للأب فقط' : 'غير مفوَّض لك'}</h4><p class="d c">${oo ? 'بعض الإجراءات لا تُفوَّض لأحد: الفوترة والملكية وبعض قواعد الحماية.' : 'لم يمنحك الأب هذه الصلاحية. يمكنك أن تطلبها منه.'}</p><div class="card flat c"><span class="mono sm">${k}</span></div>${callout('سُجّلت المحاولة في التدقيق وأُبلغ الأب، كما في كل محاولة وصول مرفوضة.', 'nt', 'receipt_long')}${btn('فهمت', 'close')}`; }
    const w = WHY[id] || WHY.rank; return `<div class="bigic" style="width:64px;height:64px;border-radius:22px">${ic('help')}</div><h4 class="c">${w[0]}</h4><p class="d c">${w[1]}</p>${isAdult() ? `<div class="card flat c xs muted">المصدر: <span class="mono">${w[2]}</span></div>` : ''}${btn(mode() === 'parent' ? 'فهمت' : 'حسناً', 'close')}`;
  },
});

/* ============ بوابة الوالدين / الرفع الأمني ============ */
surface('pin', {
  kind: 'full', t: 'بوابة الوالدين', sys: 'S1-01', p: 'any', a: ['الخروج من وضع الطفل', 'gate'], req: '01:5,6,23 03:12 02:16',
  note: 'رقم الأب السري، 6 أرقام، محلي ولا يمنح صلاحية بحد ذاته. 5 محاولات خاطئة ← قفل 5 دقائق، وكل فشل وقفل يُسجَّل في التدقيق ويُنبَّه الأب عند القفل. لوحة الأرقام لا تُعكس. زر الاستغاثة يبقى في رأس البوابة. الرقم التجريبي: 482615 (والرقم 123456 نمط ممنوع).',
  r(reason, kind) {
    const locked = S.pin.lock > 0;
    return `<header class="bar"><button class="ib" data-a="pinX" aria-label="إغلاق">${ic('close')}</button><h2></h2>${S.persona === 'guest' ? '' : sosBtn()}</header><div class="body" style="justify-content:center">
    <div class="bigic">${ic(locked ? 'lock_clock' : kind === 'stepup' ? 'shield_lock' : 'lock')}</div><p class="ttl">${locked ? 'البوابة مقفلة مؤقتاً' : kind === 'stepup' ? 'أكّد أنك أنت' : 'بوابة الوالدين'}</p>
    <p class="sub">${locked ? `خمس محاولات خاطئة. حاول بعد <b class="ltr">${Math.floor(S.pin.lock / 60)}:${String(S.pin.lock % 60).padStart(2, '0')}</b>` : reason + ' · أدخل رقم الأب السري'}</p>
    ${locked ? '' : `<div class="dots ${S.pin.shake ? 'bad' : ''}" aria-label="${pinBuf.length} من 6">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i < pinBuf.length ? 'f' : ''}"></i>`).join('')}</div>
    ${S.pin.bad ? `<p class="c sm" style="color:var(--danger);margin:-10px 0 12px">الرقم غير صحيح. بقيت ${5 - S.pin.bad} محاولات.</p>` : ''}
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="pinK:${n}">${n}</button>`).join('')}<button class="gh" data-a="${kind === 'stepup' && (S.bio ?? true) && mode() === 'parent' ? 'pinBio' : 'pinNo'}" aria-label="بصمة">${kind === 'stepup' && (S.bio ?? true) && mode() === 'parent' ? ic('fingerprint') : ''}</button><button data-a="pinK:0">0</button><button class="gh" data-a="pinK:b" aria-label="حذف">${ic('backspace')}</button></div>`}
    ${mode() !== 'parent' ? `<p class="c sm muted" style="margin-top:18px">هذه الصفحة للأهل. ${btn('ارجع', 'pinX', 'txt')}</p>` : S.persona === 'owner' && !locked ? `<p class="c sm" style="margin-top:14px">${btn('نسيت الرقم؟', 'pinForgot', 'txt')}</p>` : ''}</div>`;
  },
});
let pinTimer;
Object.assign(ACT, {
  pinX() { S.full = null; pinCb = null; S.pin.shake = 0; },
  pinNo() { return false; },
  pinForgot() { S.full = null; pinCb = null; go('recovery'); },
  pinBio() { S.full = null; const c = pinCb; pinCb = null; toast('تم التحقق بالبصمة', null, 'fingerprint'); if (c) c(); },
  pinK(k) {
    S.pin.shake = 0;
    if (k === 'b') { pinBuf = pinBuf.slice(0, -1); return; }
    pinBuf += k; if (pinBuf.length < 6) return;
    if (pinBuf === S.pin.code) { pinBuf = ''; S.pin.bad = 0; S.full = null; const c = pinCb; pinCb = null; if (c) c(); return; }
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
    if (done) return `<header class="bar"><h2></h2>${S.persona === 'guest' ? '' : sosBtn()}</header><div class="body" style="justify-content:center"><div class="bigic" style="color:var(--success)">${ic('check_circle')}</div><p class="ttl">${p.kind === 'pair' ? 'حُفظ الرقم على هذا الجهاز' : p.kind === 'create' ? 'أُنشئ رقمك السري' : 'تغيّر الرقم السري'}</p><p class="sub">${p.kind === 'pair' ? 'لن تُفتح إعدادات هذا الجهاز إلا به.' : kidDev ? 'يعمل الرقم الجديد على هذا الجهاز من الآن.' : 'يعمل الرقم الجديد على هاتفك من الآن.'}</p>
      ${p.kind === 'pair' ? callout('الرقم محفوظ على هذا الجهاز وحده ولا يُرسل عبر الإنترنت. إن غيّرته لاحقاً على هاتفك فغيّره هنا أيضاً.', 'nt', 'info') : kidDev ? '' : p.kind === 'create' ? callout('ستدخل هذا الرقم نفسه على جهاز كل طفل عند إقرانه، فيُحفظ هناك أيضاً.', 'nt', 'info') : callout('<b>أجهزة أطفالك ما زالت على الرقم القديم.</b> الرقم لا يغادر الجهاز حفاظاً على أمانه، فغيّره على كل جهاز طفل من: ملفي ← إعدادات هذا الجهاز ← تغيير الرقم السري.', 'wa', 'devices')}
      <div class="gap"></div>${btn('تم', 'psClose')}</div>`;
    return `<header class="bar"><button class="ib" data-a="psClose" aria-label="إغلاق">${ic('close')}</button><h2></h2>${S.persona === 'guest' ? '' : sosBtn()}</header><div class="body" style="justify-content:center">
    <div class="bigic">${ic('pin')}</div><p class="ttl">${p.step === 'new' ? (p.kind === 'pair' ? 'بابا يكتب رقمه السري' : p.kind === 'create' ? 'أنشئ رقمك السري' : 'الرقم الجديد') : 'أعد كتابة الرقم'}</p>
    <p class="sub">${p.step === 'new' ? (p.kind === 'pair' ? 'الرقم نفسه الذي أنشأته على هاتفك. يُحفظ هنا ليحمي إعدادات هذا الجهاز.' : '6 أرقام تعرفها أنت وحدك. يحمي إعدادات أجهزة أطفالك.') : 'للتأكد أنك كتبته كما تريد.'}</p>
    <div class="dots ${p.err ? 'bad' : ''}" aria-label="${psBuf.length} من 6">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i < psBuf.length ? 'f' : ''}"></i>`).join('')}</div>
    ${p.err ? `<p class="c sm" role="alert" style="color:var(--danger);margin:-10px 0 12px">${p.err}</p>` : ''}
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="psK:${n}">${n}</button>`).join('')}<button class="gh" data-a="pinNo" aria-hidden="true"></button><button data-a="psK:0">0</button><button class="gh" data-a="psK:b" aria-label="حذف">${ic('backspace')}</button></div>
    ${p.step === 'confirm' ? `<p class="c sm" style="margin-top:14px">${btn('ابدأ من جديد', 'psBack', 'txt')}</p>` : p.kind === 'change' && !kidDev ? `<p class="c xs muted" style="margin-top:14px">نسيت رقمك مستقبلاً؟ يُستعاد عبر جهة الاسترداد الموثوقة فقط.</p>` : ''}</div>`;
  },
});
Object.assign(ACT, {
  psClose() { const cb = S.ps && S.ps.step === 'done' ? psDone : null; S.full = null; S.ps = null; psBuf = ''; psDone = null; if (cb) cb(); },
  psBack() { psBuf = ''; S.ps.step = 'new'; S.ps.a = ''; S.ps.err = ''; },
  psK(k) {
    const p = S.ps; p.err = '';
    if (k === 'b') { psBuf = psBuf.slice(0, -1); return; }
    psBuf += k; if (psBuf.length < 6) return;
    if (p.step === 'new') {
      const w = weakPin(psBuf); if (w) { p.err = w; psBuf = ''; return; }
      if (p.kind === 'change' && psBuf === S.pin.code) { p.err = 'هذا رقمك الحالي · اختر رقماً مختلفاً'; psBuf = ''; return; }
      p.a = psBuf; psBuf = ''; p.step = 'confirm'; return;
    }
    if (psBuf !== p.a) { p.err = 'الرقمان غير متطابقين · أعد المحاولة'; psBuf = ''; return; }
    S.pin.code = p.a; S.pin.set = true; S.pin.bad = 0; psBuf = ''; p.a = ''; p.step = 'done';
    S.audit.unshift({ t: `${p.kind === 'pair' ? 'حُفظ رقم بوابة الوالدين عند الإقران' : (p.kind === 'create' ? 'أُنشئ' : 'غُيّر') + ' رقم بوابة الوالدين · ' + gateDev()}`, w: 'أحمد', at: 'الآن', k: 'shell.parent_gate.manage' });
    if (S.checklist) S.checklist.pin = 1;
  },
});

/* ============ الاستغاثة SOS ============ */
let sosTimer;
surface('sos-count', {
  kind: 'full', cls: 'red', t: 'عدّ تنازلي للاستغاثة', sys: 'S1-07', p: 'any', req: '07:7 01:7',
  note: 'ضغط مطوّل 3 ثوانٍ مع اهتزاز، ثم 10 ثوانٍ للإلغاء قبل الإرسال — لمنع الإرسال الخاطئ دون تأخير الطارئ الحقيقي.',
  r() { return `<div class="body" style="justify-content:center"><p class="ttl">تُرسل الاستغاثة بعد</p><div class="cnt">${S.sosN}</div><p class="sub">سيصل موقعك الآن إلى ${me() && me().role === 'adult' ? 'كل البالغين في العائلة' : 'بابا وماما'} وجهات الطوارئ.</p>${btn('ألغِ', 'sosCancel', 'sec" style="background:#fff;color:#B42318;box-shadow:none;min-height:64px;font-size:20px')}<div class="gap"></div>${btn('أرسل الآن', 'sosSend', 'txt" style="color:#fff;width:100%')}</div>`; },
});
surface('sos-sent', {
  kind: 'full', cls: 'red', t: 'الاستغاثة أُرسلت', sys: 'S1-07', p: 'any', req: '07:8,9,17 04:11 01:7',
  note: 'حالة صادقة: «وصلت إلى N من M». دون اتصال تُرسل SMS بالإحداثيات إلى الأب وكل البالغين وجهات الطوارئ، وتُحسب من حصة الخطة مع تجاوز طوارئ.',
  r() { const s = S.sos, R = [['أحمد', 1], ['سارة', s.via.includes('SMS') ? 0 : 1]].concat((S.ec || []).map(c => [c.n, 0])), n = R.filter(r => r[1]).length;
    return `<div class="body"><div style="flex:1;display:flex;flex-direction:column;justify-content:center"><div class="bigic">${ic('sos')}</div><p class="ttl">${s.st === 'resolved' ? 'انتهت الاستغاثة' : 'أُرسلت استغاثتك'}</p><p class="sub">${s.st === 'resolved' ? 'أكّد أحد البالغين أنك بخير.' : `وصلت إلى ${n} من ${R.length} · ${s.via}`}</p>
    <div style="background:#ffffff1a;border-radius:18px;padding:6px 14px">${R.map(([nm, ok]) => `<div class="fx sb" style="padding:9px 0;border-bottom:1px solid #ffffff22"><b>${nm}</b><span class="fx" style="gap:5px;font-size:13px">${ic(ok ? 'done_all' : 'schedule')}${ok ? 'وصلت' : 'في الطريق'}</span></div>`).join('')}<div class="fx sb" style="padding:9px 0"><span>موقعك المرسل</span><b>${s.place}</b></div></div>
    ${s.via.includes('SMS') ? `<p class="c" style="font-size:13px;opacity:.85;margin:12px 0 0">لا يوجد إنترنت، فأرسلنا رسالة SMS بإحداثياتك.</p>` : ''}</div>
    ${s.st === 'resolved' ? btn('أغلق', 'close', 'sec" style="background:#fff;color:#B42318;box-shadow:none') : `${btn('أنا بخير — ألغِ الاستغاثة', 'sosSelfEnd', 'sec" style="background:#fff;color:#B42318;box-shadow:none')}<div class="gap"></div>${btn('أخفِ هذه الشاشة', 'close', 'txt" style="color:#fff;width:100%')}`}</div>`; },
});
surface('sos-status', {
  t: 'استغاثة', sys: 'S1-07', p: 'adult', req: '07:8,16,18 09:3',
  note: 'تنبيه SOS يصل الأب وكل البالغين خلال أقل من 10 ثوانٍ مع الموقع لحظتها، ويظهر في تنبيهات مركز الأوامر. الحل للأب أو للبالغ المفوَّض حسب قالبه.',
  r() { const s = S.sos; if (!s) return empty('sos', 'لا استغاثة نشطة', 'عند ضغط أي فرد على زر SOS ثلاث ثوانٍ يظهر التنبيه هنا مع موقعه.'); const m = M[s.from];
    return `<div class="card" style="border-color:var(--danger);background:var(--danger-soft)"><div class="fx">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(20px*var(--ts))">${m.n} ${vb(m, 'يستغيث', 'تستغيث')}</b><div class="sm">${s.st === 'resolved' ? 'حُلّت' : 'قبل لحظات'} · ${s.via}</div></div></div></div>${miniMap(200, true)}<div class="gap"></div>${list(row('location_on', s.place, 'الموقع لحظة الاستغاثة', {}), row('battery_5_bar', 'بطارية الجهاز', '', { v: S.kid[s.from] ? S.kid[s.from].bat + '%' : '72%' }), row('done_all', 'وصل إلى', 'أحمد · سارة', {}))}
    ${s.st === 'resolved' ? callout('حُلّ التنبيه وسُجّل في التدقيق.', 'ok', 'check_circle') : `<div class="btns">${btn('اتصل', 'sosCall', 'sec', 'call')}${btn('أنا في الطريق', can('location.sos.acknowledge') ? 'sosAck' : 'denied:location.sos.acknowledge', 'ton')}</div><div class="gap"></div>${btn('حُلّ الأمر — أغلق التنبيه', can('location.sos.resolve') ? 'sosResolve' : 'denied:location.sos.resolve', can('location.sos.resolve') ? 'ok' : 'sec', can('location.sos.resolve') ? 'check' : 'lock')}`}`; },
});
Object.assign(ACT, {
  sosStart() { S.sheet = null; S.dlg = null; S.sosN = 10; S.full = { id: 'sos-count', a: [] }; clearInterval(sosTimer); sosTimer = setInterval(() => { S.sosN -= 1; if (S.sosN <= 0) { ACT.sosSend(); render(); } else if (S.full && S.full.id === 'sos-count') renderOv(); }, 1000); },
  sosCancel() { clearInterval(sosTimer); S.full = null; toast('أُلغيت الاستغاثة · لم يُرسل شيء'); },
  sosSend() { clearInterval(sosTimer); const off = offline(), id = PERSONA[S.persona].m; S.sos = { from: id, st: 'sent', via: off ? 'عبر SMS (دون اتصال)' : 'عبر الإنترنت', place: S.kid[id] ? S.kid[id].place : 'البيت' }; if (off) S.sms.used += 2 + (S.ec || []).length; S.full = { id: 'sos-sent', a: [] }; },
  sosSelfEnd() { S.sos.st = 'resolved'; },
  sosCall() { toast('يفتح تطبيق الهاتف للاتصال', null, 'call'); },
  sosAck() { toast('أُبلغ المستغيث أنك في الطريق'); },
  sosResolve() { S.sos.st = 'resolved'; audit(`حُلّت استغاثة ${M[S.sos.from].n}`, 'location.sos.resolve'); toast('أُغلق تنبيه الاستغاثة'); },
});

/* ============ حالات النظام الكاملة ============ */
surface('sys-update', {
  kind: 'full', cls: 'dark', t: 'تحديث إجباري', sys: 'S1-01', p: 'any', req: '01:20 01:7',
  note: 'للإصدارات الأمنية الحرجة فقط. لا إغلاق لهذه الشاشة، لكن الاستغاثة تبقى متاحة.',
  r() { return `<div class="body" style="justify-content:center"><div class="bigic">${ic('system_update_alt')}</div><p class="ttl">تحديث مطلوب للأمان</p><p class="sub">هذا الإصدار لم يعد مدعوماً. حدّث التطبيق لتواصل استخدامه بأمان. بياناتك وما لم يُرسل بعد محفوظة.</p>${btn('حدّث من المتجر', 'updGo', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'download')}<div class="gap"></div><div class="c">${sosBtn()}</div></div>`; },
});
surface('sys-maint', {
  kind: 'full', cls: 'dark', t: 'صيانة', sys: 'S1-01', p: 'any', req: '01:7,9', st: 'pr',
  note: 'مقترح: حالة «صيانة» مذكورة في نظام التصميم (states) كحالة نظام. القواعد تبقى مفروضة محلياً والاستغاثة عبر SMS تعمل.',
  r() { return `<div class="body" style="justify-content:center"><div class="bigic">${ic('construction')}</div><p class="ttl">نُجري صيانة قصيرة</p><p class="sub">نعود خلال دقائق. قواعد الأطفال ما زالت تعمل على أجهزتهم، وما تفعله الآن يُحفظ ويُرسل لاحقاً.</p>${btn('حاول مجدداً', 'maintTry', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'refresh')}<div class="gap"></div><div class="c">${sosBtn()}</div></div>`; },
});
surface('sys-first', {
  kind: 'full', cls: 'dark', t: 'أول فتح دون اتصال', sys: 'S1-01', p: 'any', req: '01:8',
  note: 'أول فتح للتطبيق دون اتصال وبلا بيانات محفوظة (GAP-S1-01-01): شاشة صادقة مع إعادة المحاولة. لا زر استغاثة هنا لأن الاستغاثة تحتاج عضوية في عائلة.',
  r() { return `<div class="body" style="justify-content:center"><div class="bigic">${ic('cloud_off')}</div><p class="ttl">نحتاج اتصالاً لأول مرة</p><p class="sub">افتح الإنترنت مرة واحدة ليجهز التطبيق. بعدها يعمل معك حتى دون اتصال.</p>${btn('حاول مجدداً', 'maintTry', 'sec" style="background:#fff;color:#142749;box-shadow:none', 'refresh')}</div>`; },
});
Object.assign(ACT, {
  updGo() { S.sys = 'ok'; S.full = null; toast('في التطبيق الفعلي يفتح المتجر', null, 'info'); },
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
];
surface('help', {
  t: 'المساعدة والدعم', sys: 'S1-01', p: 'adult', req: '', st: 'un',
  note: 'لازمة إطلاق غائبة عن المواصفات العشر (بند ب-13). الأسئلة من محتوى التصميم نفسه. قناة المراسلة غير محسومة: عنوان الدعم يسلّمه المالك قبل الإطلاق، لذلك لا يظهر عنوان هنا. الطفل لا يرى هذه الصفحة: طريقه «شيء ما أزعجني» إلى والده.',
  r() { const o = S.helpQ ?? -1; return `${sec('أسئلة شائعة')}${list(HELP_Q.map(([q, a], i) => row('quiz', q, o === i ? a : '', { a: 'helpQ:' + i, chev: false, v: ic(o === i ? 'keyboard_arrow_up' : 'keyboard_arrow_down') })))}${sec('لم تجد جوابك؟')}${list(row('mail', 'راسل الدعم', 'نرد بالعربية أو الإنجليزية', { a: 'helpMail' }), row('support_agent', 'معلومات تشخيصية', 'قد يطلبها منك فريق الدعم', { a: 'go:health' }))}${callout('<b>غير محسوم:</b> عنوان الدعم وساعات الرد يسلّمهما المالك قبل الإطلاق.', 'wa', 'help')}`; },
});
surface('legal', {
  t: 'الشروط والخصوصية', sys: 'S1-01', p: 'any', req: '', st: 'un',
  note: 'لازمة إطلاق ومتاجر (بند ب-13): شروط الاستخدام وسياسة الخصوصية يجب أن تُفتحا من داخل التطبيق ومن صفحة المتجر. النص القانوني لم يُسلَّم ولا يُختلق هنا؛ الشاشة تثبّت الموضع والبنية فقط.',
  r() { return `${callout('<b>غير محسوم:</b> النص القانوني يُسلَّم بعد المراجعة القانونية وقبل الإطلاق. هذه الصفحة تثبّت مكانه في التطبيق.', 'wa', 'help')}${list(row('description', 'شروط الاستخدام', 'ما تلتزم به وما نلتزم به', { a: 'legalDoc' }), row('policy', 'سياسة الخصوصية', 'ما نجمعه ولماذا ومن يراه', { a: 'legalDoc' }), row('child_care', 'خصوصية الأطفال', 'ما يراه ولي الأمر وما لا يراه', { a: isAdult() ? 'go:privacy' : 'go:consent-view' }))}${isAdult() ? sec('بياناتك') + list(row('privacy_tip', 'الخصوصية والبيانات', 'تصدير · حذف · شفافية', { a: 'go:privacy' })) : ''}${callout('لا إعلانات ولا أدوات تتبع في التطبيق.', 'ok', 'verified_user')}`; },
});
ACT.legalDoc = () => toast('النص القانوني لم يُسلَّم بعد', null, 'info');
surface('licenses', {
  t: 'تراخيص المصادر المفتوحة', sys: 'S1-01', p: 'any', req: '',
  note: 'قائمة تولَّد آلياً عند البناء من المكتبات المستعملة فعلاً. هنا خطّ الواجهة ومجموعة الأيقونات المستعملان في النموذج.',
  r() { return list(row('gavel', 'IBM Plex Sans Arabic', 'SIL Open Font License 1.1', { chev: false }), row('gavel', 'Material Symbols', 'Apache License 2.0', { chev: false })) + `<p class="sm muted" style="margin:10px 4px">تُضاف بقية المكتبات آلياً عند بناء التطبيق.</p>`; },
});
