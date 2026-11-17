/* أسطح «المزيد»: الإعدادات التسعة، الخطة، الخصوصية، الأمان، المساعد، المنصة، وطبقات النظام (بوابة، SOS، تحديث…). */
'use strict';
const PLAN = {
  free: { n: 'المجانية', mem: 5, sms: 20, ai: 300, sar: 0, yer: 0 },
  basic: { n: 'الأساسية', mem: 10, sms: 50, ai: 1000, sar: 9.99, sarY: 89.99, yer: 300 },
  premium: { n: 'المميزة', mem: Infinity, sms: 100, ai: 3000, sar: 19.99, sarY: 179.99, yer: 600 },
};
surface('more', {
  t: 'المزيد', sys: 'S1-09', p: 'adult', req: '09:4,5,12,13,15 01:11,21',
  note: 'مركز الإعدادات: بحث شامل في الأعلى يفتح الإعداد المقصود ويبرزه (يفهم المرادفات: «السهر» ← نافذة النوم، «كلمة السر» ← الأمان)، ثم الأقسام التسعة الثابتة، ثم «حسابي وهذا الجهاز». القسم الذي يحتاج انتباهاً يحمل شارة. كل صف يظهر فقط لمن يملك مفتاحه، وما للمالك حصراً يظهر مقفلاً مع سببه.',
  r() { const m = me(), own = isOwner(), lock = (k, a) => (own || can(k) ? a : 'denied:' + k);
    const full = S.plan !== 'premium' && Object.keys(M).length >= PLAN[S.plan].mem;
    return `<label class="fld gs" style="margin-bottom:10px"><input type="search" data-gs placeholder="ابحث في الإعدادات" autocomplete="off" aria-label="ابحث في الإعدادات"></label><div id="gsOut" hidden></div><div id="gsBody"><button class="card fx" data-a="go:account">${av(m, 'lg')}<div class="grow"><b style="font-size:calc(18px*var(--ts))">${m.n}</b><div class="sm muted">${m.rel}</div><div class="sm muted ltr">+967 77• ••• •42</div></div>${ic('chevron_right')}</button>
    ${sec('العائلة والأفراد')}${list(row('family_home', 'العائلة', 'عائلة المنصور · اليمن', { a: 'go:family-settings' }), row('groups', 'الأعضاء', '5 أفراد', { a: 'tab:family' }), row('widgets', 'الخدمات', SVC.some(x => !svcOn(x.id)) ? `${SVC.filter(x => !svcOn(x.id)).length} مخفية` : 'ما يظهر في التحكم والرئيسية', { a: 'go:registry' }), row('view_agenda', 'القوالب', 'قوالب العرض والصلاحيات', { a: 'go:templates' }))}
    ${sec('الضبط والمراجعة')}${list(row('pending_actions', 'الموافقات والاستثناءات', attention().length ? `${attention().length} بانتظار قرار` : 'لا شيء ينتظر قرارك', { a: 'go:alerts', v: attention().length ? chip(String(attention().length), 'in') : '' }), row('rule', 'القواعد', 'الحماية ووقت الشاشة', { a: 'go:protection' }), row('receipt_long', 'التدقيق', 'من غيّر ماذا ومتى', { a: lock('roles.audit.view', 'go:audit'), v: own || can('roles.audit.view') ? '' : ic('lock') }), row('privacy_tip', 'الخصوصية والبيانات', 'تصدير · حذف · شفافية', { a: 'go:privacy' }), row('workspace_premium', 'الخطة والفوترة', PLAN[S.plan].n, { a: can('hub.plan.view') ? 'go:plan' : 'denied:hub.plan.view', v: !own ? chip('عرض فقط', 'ol') : full ? chip('بلغت حدّ الأفراد', 'wa') : '' }))}
    ${sec('حسابي وهذا الجهاز')}${list(row('security', 'الأمان', 'البصمة · أجهزتي · إن فقدت الهاتف', { a: 'go:security' }), row('wand_stars', 'المساعد الذكي', S.aiKill ? 'متوقف' : 'يقترح فقط', { a: 'go:ai' }), row('translate', 'اللغة والعرض', L('العربية', 'English'), { a: 'go:display' }), row('sync', 'البيانات والمزامنة', S.outbox.length ? `${S.outbox.length} بانتظار الإرسال` : S.lbw ? 'توفير البيانات مفعّل' : 'كل شيء مُرسل', { a: 'go:outbox' }), row('contact_support', 'المساعدة والدعم', 'أسئلة شائعة · راسلنا', { a: 'go:help' }), row('info', 'عن التطبيق', 'الإصدار 1.0.0 (نموذج أولي)', { a: 'go:about' }))}<button class="c" data-a="go:about" style="display:block;width:100%;padding:22px 0 6px" aria-label="عن التطبيق"><img src="assets/brand/logo-horizontal-ar${S.theme === 'dark' ? '-dark' : ''}.svg" alt="عائلتي" height="64" style="margin:0 auto"><div class="sm muted">الإصدار 1.0.0</div></button></div>`; },
});
surface('account', {
  t: 'حسابي', sys: 'S1-02', p: 'adult', req: '02:1,6,8,22,25,26',
  r() { const d = isRoot() ? S.ownDel : S.delP; return `<div class="c" style="padding:8px 0 12px">${av(me(), 'xl')}<div class="b" style="font-size:20px;margin-top:8px">${me().n}</div></div>
    ${d ? `<button class="callout da" style="width:100%;text-align:start" data-a="go:delete-account">${ic('delete_forever')}<div><b>حسابك يُحذف بعد ${d} يوماً</b><br>اضغط هنا لإلغاء الحذف.</div></button>` : ''}
    ${list(row('call', 'رقم الهاتف', 'تدخل به إلى «عائلتي»', { v: '<span class="ltr">+967 77• ••• •42</span>' }), row('mail', 'البريد الإلكتروني', 'طريق دخول ثانٍ إن تعذّر الرقم', { v: 'أضف', a: 'soonC' }), row('family_home', 'عائلتي', 'عائلة واحدة لكل حساب', { v: 'المنصور' }))}
    ${list(row('logout', 'اخرج من هذا الجهاز', '', { a: 'signOut' }), isRoot() ? '' : row('person_remove', 'غادر العائلة', '', { a: 'go:leave-family', ic: 'var(--danger)' }))}`; },
});
surface('leave-family', {
  t: 'مغادرة العائلة', sys: 'S1-02', p: 'adult', req: '02:26 03:20',
  note: 'حق أصيل لكل بالغ لا يملك الأب سحبه (Q-291)، ولذلك لا حالة «معطَّل من المالك». المغادرة فورية. المالك لا يغادر عائلته (S1-03 · Q-401، Q-402: لا نقل ملكية؛ يحذف العائلة، أو يحذف حسابه والصلاحية الكاملة عند بالغ آخر). إن كان المغادر هو جهة الاسترداد يُنبَّه هو والأب (مقترح — GAP-10).',
  r() { if (isRoot()) return `${empty('family_home', 'أنت مالك العائلة', 'المالك لا يغادر عائلته. تستطيع أن تعطي بالغاً آخر الصلاحية الكاملة ليدير معك.', btn('الصلاحية الكاملة', 'go:transfer', 'sec', 'admin_panel_settings'))}`;
    if (S.ownDel && S.co) return empty('admin_panel_settings', 'أنتِ من يدير العائلة الآن', `أحمد يحذف حسابه. لا تغادرين حتى يتراجع أو تكتمل مهلته (${S.ownDel} يوماً) فتصيري المالكة.`, btn('رجوع', 'back', 'sec'));
    return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('person_remove')}</div><p class="ttl" style="font-size:22px">ماذا يحدث إن غادرتِ؟</p><div class="card"><div class="tl"><div class="ev da"><b>الآن: تخرجين من عائلة المنصور</b><span>لا ترين الأفراد ولا المحادثات ولا المواقع</span></div><div class="ev"><b>كل ما سمح لك به أحمد يُلغى</b><span>فوراً وعلى كل أجهزتك</span></div><div class="ev ok"><b>حسابك يبقى</b><span>تستطيعين الانضمام مجدداً بدعوة جديدة</span></div></div></div>
    ${S.rec === me().id ? callout('أنتِ من اختارها أحمد لتساعده إن فقد هاتفه ورقمه. بعد مغادرتك يصله تنبيه ليختار غيرك.', 'wa', 'support') : ''}${btn('غادر العائلة', 'leaveFam', 'dng')}<div class="gap"></div>${btn('ابقَ', 'back', 'sec')}`; },
});
Object.assign(ACT, {
  signOut() { confirmDlg('الخروج من هذا الجهاز؟', 'ستحتاج إلى رقمك ورمز التحقق للدخول مجدداً. ما لم يُرسل بعد يبقى محفوظاً على هذا الجهاز.', 'اخرج', () => { setPersona('guest'); S.ob = {}; }); },
  leaveFam() { confirmDlg('مغادرة عائلة المنصور؟', 'المغادرة فورية. للعودة تحتاجين دعوة جديدة.', 'غادر', () => { const was = S.rec === me().id; audit(`غادرت ${me().n} العائلة`, 'identity.family.leave'); if (was) { S.rec = null; S.alerts.unshift({ id: 'a' + Date.now(), k: 'perm', kid: null, t: 'لم تعد لك جهة استرداد', s: 'غادرت سارة العائلة · اختر بالغاً آخر', ago: 'الآن', p: 3, open: 1 }); } setPersona('guest'); S.ob = {}; toast('غادرتِ عائلة المنصور', null, 'person_remove'); }, true); },
});
surface('family-settings', {
  t: 'العائلة', sys: 'S1-02', p: 'adult', req: '02:7,8,25,28 03:20 01:12',
  note: 'الاسم والبلد والتوقيت. البلد يحدد الأسعار وطرق الدفع وقنوات التحقق. حذف العائلة للمالك (أو صاحب الصلاحية الكاملة) بمهلة تراجع.',
  r() { const own = isOwner(); return list(row('edit', 'اسم العائلة', '', { v: 'عائلة المنصور', a: own ? 'soonC' : 'denied:shell.config.edit' }), row('public', 'البلد', 'يحدد الأسعار وطرق الدفع', { v: 'اليمن' }), row('schedule', 'التوقيت', 'تُحسب به أوقات النوم والمدرسة ونهاية اليوم', { v: 'صنعاء' }), row('today', 'التقويم', '', { v: 'هجري + ميلادي' })) + (own ? sec('منطقة الخطر') + list(isRoot() ? row('admin_panel_settings', 'الصلاحية الكاملة', S.co ? 'عند سارة · اعرضها أو اسحبها' : 'أعطِها لبالغ آخر، وتسحبها متى شئت', { a: 'go:transfer' }) : '', row('delete_forever', S.famDel ? `العائلة تُحذف بعد ${S.famDel} يوماً` : 'احذف العائلة', S.famDel ? 'اعرض أو ألغِ الحذف' : 'مهلة تراجع 30 يوماً ثم حذف نهائي', { a: 'go:family-delete', ic: 'var(--danger)' })) : callout('الصلاحية الكاملة وحذف العائلة للمالك.', 'nt', 'lock')); },
});
surface('templates', {
  t: 'القوالب', sys: 'S1-01', p: 'adult', req: '01:4 03:13 02:13', st: 'un',
  note: 'UNKNOWN (Q-090): محتوى قوالب العرض الثلاثة (ما يظهر في كل قالب بالتفصيل) سؤال مفتوح يُجاب في مرحلة التصميم. ما في هذا النموذج اقتراح للمراجعة لا قرار.',
  r() { return callout('سنة الميلاد تحدد القالب تلقائياً، ولا يُبدَّل يدوياً في المرحلة 1.', '', 'info') + sec('قوالب العرض') + list(row('child_care', 'المبسّط', 'دون 7 سنوات · بلاطات كبيرة وزر «بيت»', { v: 'يوسف', a: 'jumpP:mini' }), row('face', 'القياسي', '7–12 سنة · أربعة تبويبات', { v: 'ليان', a: 'jumpP:child' }), row('person', 'المراهق', '13–17 سنة · استقلالية وشفافية', { v: 'خالد', a: 'jumpP:teen' })) + callout('<b>غير محسوم (Q-090):</b> المحتوى التفصيلي لكل قالب لم يُعتمد بعد. الشاشات المعروضة مقترحة.', 'wa', 'help') + sec('قوالب الصلاحيات') + list(row('handshake', 'شريك', '43 مفتاحاً', { a: isOwner() ? 'go:tpl-diff:partner' : '' }), row('shield_person', 'وصي محدود', '24 مفتاحاً', { a: isOwner() ? 'go:tpl-diff:guardian' : '' }), row('visibility', 'مراقب', '10 مفاتيح', { a: isOwner() ? 'go:tpl-diff:observer' : '' })); },
});
ACT.jumpP = p => { setPersona(p); };
surface('registry', {
  t: 'الخدمات', sys: 'S1-09', p: 'adult', req: '09:5,14,15',
  note: 'قائمة الخدمات كما يراها الأب: اسم ووصف وحالة صادقة. الأعداد التقنية (مفاتيح، ودجات، رموز الأنظمة) مخفية. كل صف يفتح صفحة الخدمة. الخدمة المخفية تبقى هنا لتُعاد، وتنبيهاتها السابقة باقية في «كل التنبيهات».',
  r() { return `${list(SVC.map(x => row(x.i, x.n, x.d, { a: 'go:svc:' + x.id, v: svcState(x) })))}
    ${callout('إخفاء خدمة يزيل بطاقاتها من الرئيسية ومن «التحكم» فوراً. لا يحذف بياناتها ولا يوقف قواعدها.', 'nt', 'visibility_off')}
    ${sec('خدمات قادمة')}<div class="card flat"><div class="chips">${['التعليم', 'القرآن والصلاة', 'الصحة', 'المالية العائلية'].map(x => chip(x, 'ol', 'hourglass_empty')).join('')}</div><div class="xs muted" style="margin-top:8px">أمثلة فقط؛ الأسماء لم تُحسم بعد.</div></div>`; },
});

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
  r() { return `${callout('لا إعلانات ولا أدوات تتبع في التطبيق، وهذا ثابت لا يُغيَّر بإعداد.', 'ok', 'verified_user')}${sec('ما نشاركه مع الطفل')}${list(row('visibility', 'الطفل يعرف ما يُتابَع', 'الوقت والموقع والمحادثات، لا تفاصيلها', { a: 'go:consent-view' }), row('notifications', 'الإشعار الدائم', 'يعرض الوقت المتبقي، لا عبارة رقابية', { a: 'go:persist' }))}
    ${sec('نسخة من البيانات')}${list(row('download', 'نسخة من بياناتي', S.exp && S.exp.me ? (S.exp.me === 'ready' ? 'جاهزة للتنزيل' : 'قيد التجهيز') : 'ملف يُجهَّز ويصلك رابطه', { a: 'go:export' }), isOwner() ? KIDS.map(k => row('', 'نسخة من بيانات ' + M[k].n, S.exp && S.exp[k] ? (S.exp[k] === 'ready' ? 'جاهزة للتنزيل' : 'قيد التجهيز') : '', { lead: av(M[k], 'sm'), a: 'go:export:' + k })) : '')}
    ${sec('مدة الحفظ')}${list(row('forum', 'المحادثات', 'تبقى حتى يحذفها الأب', { v: 'دائم' }), row('location_on', 'سجل المواقع', 'يُحذف تلقائياً', { v: '7 أيام' }))}${callout('<b>غير محسوم (Q-046):</b> سياسة تحليلات الأطفال لم تُعتمد؛ لا يُجمع شيء حتى تُحسم.', 'wa', 'help')}${sec('منطقة الخطر')}${list(row('delete_forever', 'احذف حسابي', S.delP ? `يُحذف بعد ${S.delP} يوماً · اضغط للإلغاء` : 'مهلة تراجع 30 يوماً', { a: 'go:delete-account', ic: 'var(--danger)' }))}`; },
});
surface('export', {
  t: id => (id && M[id] ? 'نسخة من بيانات ' + M[id].n : 'نسخة من بياناتي'), sys: 'S1-02', p: 'adult', req: '02:27',
  note: 'البالغ يطلب نسخة من بياناته هو، والأب يطلب نسخة من بيانات قاصر. التجهيز في الخلفية؛ يصل إشعار، والرابط صالح 7 أيام. الشاشة تقول ما في الملف بكلام عادي ولا تذكر صيغته التقنية.',
  r(id) { const k = id && M[id] ? id : 'me', st = (S.exp || {})[k], who = k === 'me' ? 'بياناتك' : 'بيانات ' + M[k].n;
    if (k !== 'me' && !isOwner()) return empty('lock', 'للأب فقط', 'نسخة بيانات الطفل يطلبها مالك العائلة.', btn('رجوع', 'back', 'sec'));
    const what = `<div class="card"><b>ما في الملف</b>${list(k === 'me' ? [row('person', 'ملفك', 'الاسم والرقم والبريد'), row('forum', 'رسائلك', 'ما كتبته أنت، مع الصور'), row('history', 'ما فعلته', 'القرارات والتغييرات المسجلة باسمك')] : [row('badge', 'ملفه', 'الاسم وسنة الميلاد'), row('task_alt', 'مهامه ونجومه', ''), row('forum', 'رسائله', 'مع الصور'), row('location_on', 'سجل مواقعه', 'آخر 7 أيام'), row('hourglass_top', 'وقت الشاشة', 'المدة لكل تطبيق')])}</div>`;
    if (!st) return `<p class="sub" style="text-align:start">نجمع ${who} في ملف واحد مضغوط تنزّله على هاتفك.</p>${what}${btn('جهّز النسخة', 'expAsk:' + k, '', 'download')}<p class="c xs muted" style="margin-top:10px">يأخذ التجهيز دقائق إلى ساعات. يصلك إشعار حين تجهز.</p>`;
    if (st === 'prep') return `<div class="bigic">${ic('hourglass_top')}</div><p class="ttl" style="font-size:22px">نجهّز النسخة</p><p class="sub">تستطيع الخروج من هذه الشاشة. يصلك إشعار حين تجهز.</p>${btn('جرّب: كأنها جهزت', 'expReady:' + k, 'ton')}<div class="gap"></div>${btn('ألغِ الطلب', 'expDrop:' + k, 'txt" style="width:100%')}`;
    return `<div class="bigic" style="background:var(--success-soft);color:var(--success)">${ic('download')}</div><p class="ttl" style="font-size:22px">النسخة جاهزة</p><p class="sub">ملف مضغوط · 18 م.ب · الرابط يعمل 7 أيام ثم يُحذف الملف.</p>${offline() ? callout('أنت غير متصل. التنزيل يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('نزّل الملف', 'expGet', offline() ? '" disabled="' : '', 'download')}<div class="gap"></div>${btn('احذف النسخة الآن', 'expDrop:' + k, 'txt" style="width:100%')}${callout('الملف فيه بيانات خاصة. احفظه في مكان آمن ولا ترسله عبر محادثة عامة.', 'nt', 'lock')}`; },
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
    if (d) return `<div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('auto_delete')}</div><p class="ttl" style="font-size:22px">حسابك يُحذف بعد ${d} يوماً</p><p class="sub">في 16 ديسمبر 2026 يُمحى نهائياً. إلى ذلك الحين أنت خارج العائلة، وتستطيع التراجع من هنا.</p>${root ? callout('<b>سارة تدير العائلة الآن</b><br>إن تراجعت عدت مالكاً كما كنت. وإن اكتملت المهلة صارت سارة مالكة العائلة.', 'wa', 'admin_panel_settings') : ''}${btn('ألغِ الحذف واستعد حسابي', 'delUndo', '', 'undo')}${callout('لا أحد غيرك يستطيع إلغاء الحذف أو تعجيله.', 'nt', 'info')}`;
    if (lock) return empty('admin_panel_settings', 'أنتِ من يدير العائلة الآن', `أحمد يحذف حسابه. لا يُحذف حسابكِ حتى يتراجع أو تكتمل مهلته (${S.ownDel} يوماً) فتصيري المالكة.`, btn('رجوع', 'back', 'sec'));
    return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('delete_forever')}</div><p class="ttl" style="font-size:22px">ماذا يحدث عند الحذف؟</p><div class="card"><div class="tl"><div class="ev wa"><b>اليوم: يتوقف الحساب</b><span>تخرج من العائلة ومن كل أجهزتك</span></div><div class="ev"><b>خلال 30 يوماً: تستطيع التراجع</b><span>ادخل برقمك واضغط «ألغِ الحذف»</span></div><div class="ev da"><b>بعد 30 يوماً: محو نهائي</b><span>لا يمكن الاسترجاع</span></div></div></div>${root && S.co ? callout('<b>أنت مالك العائلة، والصلاحية الكاملة عند سارة</b><br>بعد حذف حسابك تدير سارة العائلة وحدها. وإن اكتملت الثلاثون يوماً صارت هي مالكة العائلة. يصلها إشعار الآن.', 'wa', 'admin_panel_settings') + list(row('download', 'خذ نسخة من بياناتك أولاً', '', { a: 'go:export' })) + btn('احذف حسابي', 'delGo', 'dng') : root ? callout('<b>أنت مالك العائلة</b><br>لا يُحذف حسابك والعائلة بلا من يديرها. أعطِ بالغاً آخر الصلاحية الكاملة أولاً فيصير مالكها بعدك، أو احذف العائلة كلها.', 'wa', 'warning') + btn('أعطِ الصلاحية الكاملة أولاً', 'go:transfer', 'sec') + '<div class="gap"></div>' + btn('حذف العائلة', 'go:family-delete', 'txt') : list(row('download', 'خذ نسخة من بياناتك أولاً', '', { a: 'go:export' })) + btn('احذف حسابي', 'delGo', 'dng')}`; },
});
Object.assign(ACT, {
  delGo() { const root = isRoot(); confirmDlg('حذف حسابك؟', root ? 'تخرج من العائلة الآن وتديرها سارة. أمامك 30 يوماً للتراجع، وبعدها تصير سارة المالكة.' : 'تخرج من العائلة الآن. أمامك 30 يوماً للتراجع.', 'تابع', () => gate('حذف الحساب', () => { if (root) S.ownDel = 30; else S.delP = 30; audit('طلب حذف حسابه · مهلة 30 يوماً', 'identity.account.delete_self'); toast('بدأت مهلة الـ30 يوماً', null, 'auto_delete'); }, 'stepup'), true); },
  delUndo() { if (isRoot()) S.ownDel = 0; else S.delP = 0; audit('ألغى حذف حسابه', 'identity.account.delete_self'); toast('أُلغي الحذف · حسابك كما كان'); },
});
surface('security', {
  t: 'الأمان', sys: 'S1-02', p: 'adult', req: '02:5,6,16,20 01:5,23',
  note: 'الفتح بالبصمة مطفأ حتى يشغّله صاحب الحساب (Q-219)، ويفتح التطبيق في وضع الأهل فقط ولا يغني عن الرقم السري. لا تظهر هنا كلمات مثل TOTP أو مفتاح التوقيع: مكانها المواصفة.',
  r() { const own = isOwner(), q = S.recReq, n = S.sess.length;
    return `${S.bioChg ? `<button class="callout wa" style="width:100%;text-align:start" data-a="go:rekey">${ic('fingerprint')}<div><b>تغيّرت بصمات هذا الهاتف</b><br>اكتب رقمك السري مرة واحدة لنتأكد أنك أنت.</div></button>` : ''}${q && q.st !== 'cancelled' ? `<button class="callout da" style="width:100%;text-align:start" data-a="go:recover-review">${ic('lock_reset')}<div><b>طلب استرداد حساب أحمد</b><br>${q.st === 'pending' ? 'بانتظار تأكيد جهة الاسترداد' : 'بقي 7 أيام · اضغط للمراجعة'}</div></button>` : ''}
    ${sec('فتح التطبيق')}${list(row('fingerprint', 'افتح بالبصمة أو الوجه', 'للدخول إلى التطبيق فقط · الأفعال الحساسة تبقى بالرقم السري', { tg: !!S.bio, ta: 'bioT' }), row('pin', 'الرقم السري', S.pin.set ? 'غيّر رقمك السري' : 'لم يُنشأ بعد', { a: own ? 'pinChange' : 'denied:shell.parent_gate.manage', v: own ? (S.pin.set ? '' : chip('أنشئه', 'wa')) : ic('lock') }))}
    ${sec('أجهزتي')}${list(row('devices', 'الأجهزة التي دخلتُ منها', 'هذا الهاتف' + (n > 1 ? ` و${n - 1} آخر` : ' فقط'), { a: 'go:sessions' }), row('password', 'رمز الدخول لجهاز جديد', 'يُطلب منك عند الدخول من هاتف آخر', { a: 'go:login-code' }))}
    ${sec('إن فقدت الهاتف والرقم')}${list(own ? row('support', 'من يساعدك على العودة', S.rec ? '' : 'لم تختر أحداً بعد', { v: S.rec ? M[S.rec].n : chip('اختر', 'wa'), a: 'go:recovery' }) : row('support', 'العودة إلى حسابك', 'يدعوك أحمد من جديد برقمك الجديد', { a: 'go:recovery' }))}`; },
});
Object.assign(ACT, {
  bioT() { if (S.bio) { S.bio = false; toast('أُطفئ الفتح بالبصمة'); return; } gate('اكتب رقمك السري لتشغيل الفتح بالبصمة', () => { S.bio = true; toast('شُغّل الفتح بالبصمة على هذا الهاتف', null, 'fingerprint'); }); },
  /* التغيير يتطلب الرقم الحالي نفسه لا البصمة (S1-01 §7)؛ والإنشاء الأول بلا رقم سابق */
  pinChange() { if (!S.pin.set) return pinSetOpen('create'); gate('أدخل الرقم الحالي لتغييره', () => pinSetOpen('change')); },
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
  t: 'رمز الدخول لجهاز جديد', sys: 'S1-02', p: 'adult', req: '02:5', st: 'pr',
  note: 'مقترح بديل لشاشة «تفعيل TOTP» (ينتظر حكم المالك): التطبيق نفسه يولّد الرمز على الهاتف الموثوق، فلا تطبيق خارجي ولا QR ولا مفتاح يُنسخ. التفعيل ما زال إلزامياً بلا تخطٍّ (Q-246) لكنه يحدث تلقائياً عند أول تحقق.',
  r() { return `<p class="sub" style="text-align:start">إن دخلت من هاتف آخر وطلبنا منك رمزاً، فاكتب هذا الرمز هناك.</p><div class="code">314 159</div><div class="chips" style="justify-content:center;margin-bottom:14px">${chip('يتغير بعد 18 ثانية', 'in', 'timer')}</div>${callout('لا ترسل هذا الرمز لأحد ولا تقله في الهاتف. «عائلتي» لا تتصل بك لتطلبه.', 'wa', 'warning')}${callout('يعمل بلا إنترنت. الرمز يخرج من هذا الهاتف نفسه.', 'nt', 'cloud_off')}`; },
});
surface('bio-unlock', {
  kind: 'full', t: 'الفتح بالبصمة', sys: 'S1-02', p: 'adult', req: '02:16 01:5',
  note: 'يظهر عند فتح التطبيق في وضع الأهل إن شغّل صاحبه الفتح بالبصمة. ثلاث محاولات فاشلة ← الرقم السري. لا يظهر أبداً على جهاز طفل، ولا يغني عن الرقم السري في الأفعال الحساسة.',
  r() { const f = S.bioF || 0; return `<div class="body" style="justify-content:center;text-align:center"><img src="assets/brand/logo-symbol.svg" alt="" width="72" height="68" style="margin:0 auto 18px"><p class="ttl">أهلاً ${me().n}</p><p class="sub">${f ? `لم نتعرف على البصمة. بقيت ${3 - f} ${3 - f === 1 ? 'محاولة' : 'محاولتان'}.` : 'المس حساس البصمة لتفتح «عائلتي».'}</p><button class="bigic" style="width:112px;height:112px;border-radius:50%;${f ? 'background:var(--danger-soft);color:var(--danger)' : ''}" data-a="bioOk" aria-label="افتح بالبصمة">${ic('fingerprint')}</button>${btn('استعمل الرقم السري', 'bioPin', 'sec', 'pin')}<div class="gap"></div>${btn('جرّب: بصمة غير معروفة', 'bioBad', 'txt" style="width:100%')}</div>`; },
});
Object.assign(ACT, {
  bioOk() { S.bioF = 0; S.full = null; },
  bioBad() { S.bioF = (S.bioF || 0) + 1; if (S.bioF >= 3) { S.bioF = 0; gate('ثلاث محاولات فاشلة بالبصمة · اكتب رقمك السري', () => {}); } },
  bioPin() { S.bioF = 0; gate('افتح «عائلتي» بالرقم السري', () => {}); },
});
surface('rekey', {
  t: 'تغيّرت بصمات هذا الهاتف', sys: 'S1-02', p: 'adult', req: '02:16 01:23',
  note: 'حين تُضاف بصمة إلى الهاتف أو تُحذف منه، لا نثق بالبصمة حتى يكتب صاحب الحساب رقمه السري مرة واحدة. الشاشة لا تذكر «مفتاح التوقيع»: تقول ما حدث وما المطلوب. إلى أن يفعل، الأفعال الحساسة متوقفة والباقي يعمل.',
  r() { if (!S.bioChg) return empty('verified_user', 'هذا الهاتف موثوق', 'لا شيء مطلوب منك.', btn('رجوع', 'back', 'sec'));
    return `<div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('fingerprint')}</div><p class="ttl" style="font-size:22px">أُضيفت بصمة أو حُذفت</p><p class="sub">تغيّرت البصمات المسجلة على هذا الهاتف. لنتأكد أنك أنت، اكتب رقمك السري مرة واحدة.</p>${list(row('lock', 'متوقف إلى أن تكتبه', 'فكّ إقران جهاز · إيقاف القواعد · حذف العائلة'), row('check_circle', 'يعمل كالعادة', 'المتابعة والمحادثة والمهام والاستغاثة'))}${btn('اكتب الرقم السري', 'rekeyGo', '', 'pin')}${callout('لم تغيّر البصمات أنت؟ اكتب الرقم السري ثم غيّره من «الأمان».', 'nt', 'help')}`; },
});
ACT.rekeyGo = () => gate('تأكيد أنك أنت بعد تغيّر البصمات', () => { S.bioChg = 0; audit('أُعيد توثيق هذا الهاتف بالرقم السري بعد تغيّر البصمات', 'shell.device_key'); toast('عاد هذا الهاتف موثوقاً', null, 'verified_user'); }, 'stepup');
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
ACT.recPick = id => gate(id ? `اختيار ${M[id].n} لتساعدك على العودة` : 'إزالة من يساعدك على العودة', () => { S.rec = id || null; audit(id ? `اختير ${M[id].n} جهة استرداد` : 'أُزيلت جهة الاسترداد', 'identity.recovery'); toast(id ? `اخترت ${M[id].n} · وصل الإشعار` : 'لم يعد لك من يساعدك على العودة', null, 'support'); });
surface('unpair', {
  t: id => 'فكّ إقران جهاز ' + M[id].n, sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:15 01:5,6 10:27',
  note: 'للمالك فقط وبرقمه السري. الشاشة تقول ما يتوقف وما يبقى قبل التنفيذ. بعده يخرج ذلك الجهاز من العائلة ويصير هاتفاً عادياً، وقواعد الطفل تبقى محفوظة لجهازه القادم.',
  r(id) { const m = M[id]; if (!isOwner()) return empty('lock', 'للأب فقط', 'فكّ الإقران يفعله مالك العائلة برقمه السري.', btn('رجوع', 'back', 'sec'));
    if ((S.unp || {})[id]) return `<div class="bigic" style="background:var(--success-soft);color:var(--success)">${ic('link_off')}</div><p class="ttl" style="font-size:22px">فُكّ الإقران</p><p class="sub">Samsung Galaxy A14 لم يعد جهاز ${m.n}. قواعد ${m.n} ونجومه ومهامه محفوظة وتنتقل إلى جهازه القادم.</p>${btn('اقرن جهازاً جديداً لـ' + m.n, 'go:pair-code:' + id, '', 'devices')}<div class="gap"></div>${btn('ليس الآن', 'back', 'sec')}`;
    return `<div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('link_off')}</div><p class="ttl" style="font-size:22px">ماذا يحدث بعد الفك؟</p>${list(row('lock_open', 'تتوقف القواعد على هذا الجهاز', 'وقت الشاشة والتطبيقات والمواقع', { ic: 'var(--danger)' }), row('location_off', 'يتوقف موقعه واستغاثته', 'لا يصلك منه شيء بعد الآن', { ic: 'var(--danger)' }), row('mobile', 'يصير هاتفاً عادياً', 'يمكن بيعه أو إقرانه بعائلة أخرى'), row('inventory_2', `ملف ${m.n} يبقى`, 'قواعده ونجومه ومهامه تنتظر جهازه القادم', { ic: 'var(--success)' }))}
    ${offline() ? callout('أنت غير متصل. فكّ الإقران يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn('فكّ الإقران برقمي السري', 'unpairGo:' + id, 'dng' + (offline() ? '" disabled="' : ''), 'pin')}<div class="gap"></div>${btn('تراجع', 'back', 'sec')}`; },
});
ACT.unpairGo = id => gate('فكّ إقران جهاز ' + M[id].n, () => { S.unp = S.unp || {}; S.unp[id] = 1; audit(`فُكّ إقران جهاز ${M[id].n}`, 'identity.device.unpair'); toast('فُكّ الإقران', null, 'link_off'); }, 'stepup');
surface('pin-forgot', {
  t: 'نسيت الرقم السري', sys: 'S1-02', p: 'adult', req: '02:20 01:5', st: 'pr',
  note: 'مقترح ينتظر حكم المالك: S1-01 تمنع إعادة تعيين الرقم السري على الهاتف نفسه وتحيل إلى جهة الاسترداد وانتظار 7 أيام، لكن S1-02 لا شاشة فيها لهذا الطريق. المعروض يستعمل الطريق نفسه المكتوب لفقدان الرقم.',
  r() { const q = S.recReq; if (q && q.kind === 'pin' && q.st !== 'cancelled') return `<div class="bigic">${ic('hourglass_top')}</div><p class="ttl" style="font-size:22px">${q.st === 'pending' ? 'بانتظار تأكيد ' + M[S.rec || 'sara'].n : 'بقي 7 أيام'}</p><p class="sub">${q.st === 'pending' ? 'اتصل بها وأخبرها أن تفتح «عائلتي».' : 'بعدها تنشئ رقماً سرياً جديداً. أي بالغ في العائلة يستطيع إيقاف الطلب.'}</p>${callout('إلى ذلك الحين: المتابعة والمحادثة والمهام تعمل. الأفعال التي تحتاج الرقم السري متوقفة.', 'nt', 'info')}${btn('ألغِ الطلب — تذكرت الرقم', 'pfDrop', 'sec')}`;
    if (!S.rec) return `${empty('support', 'لم تختر من يساعدك', 'لا نستطيع إنشاء رقم سري جديد على هذا الهاتف وحده، حتى لا يفعلها من يأخذ هاتفك. ولأنك لم تختر فرداً يؤكد أنك أنت، لا طريق الآن.', '')}${callout('ما تحميه بوابة الوالدين يبقى مقفلاً. بقية التطبيق يعمل.', 'wa', 'warning')}`;
    return `<p class="sub" style="text-align:start">لا ننشئ رقماً سرياً جديداً على هذا الهاتف وحده، حتى لا يفعلها من يأخذ هاتفك أو طفلك.</p><div class="card"><div class="tl"><div class="ev"><b>${M[S.rec].n} تؤكد أنك أنت</b><span>من هاتفها</span></div><div class="ev wa"><b>انتظار 7 أيام</b><span>يُبلَّغ كل البالغين · أي اعتراض يلغي الطلب</span></div><div class="ev ok"><b>تنشئ رقماً سرياً جديداً</b><span>على هذا الهاتف</span></div></div></div>${btn('اطلب التأكيد من ' + M[S.rec].n, 'pfAsk', '', 'support')}<div class="gap"></div>${btn('تذكرت الرقم', 'back', 'sec')}`; },
});
Object.assign(ACT, {
  pfAsk() { S.recReq = { st: 'pending', kind: 'pin' }; audit('طلب إنشاء رقم سري جديد عبر جهة الاسترداد', 'identity.recovery'); toast(`أُرسل الطلب إلى ${M[S.rec].n}`, null, 'support'); },
  pfDrop() { S.recReq = null; toast('أُلغي الطلب', null, 'cancel'); },
});

/* ---------- المساعد الذكي ---------- */
const AIK = [['agent.summary.read', 'يلخّص ويقرأ', 'بلا موافقة'], ['agent.plan.create', 'يقترح خطة', 'موافقتك'], ['agent.task.verify', 'يتحقق من المهام', 'يحيل ما لا يجزم به'], ['agent.message.send', 'يرسل رسالة', 'موافقتك'], ['agent.rule.change', 'يغيّر قاعدة', 'موافقتك + الرقم السري'], ['agent.payment.execute', 'ينفّذ دفعاً', 'موافقتك + الرقم السري'], ['agent.data.delete', 'يحذف بيانات', 'موافقتك + الرقم السري']];
surface('ai', {
  t: 'المساعد الذكي', sys: 'S1-09', p: 'adult', req: '09:18 01:14 04:16 05:17,18 06:7,17',
  note: 'الذكاء مضمَّن في كل خدمة لا تبويباً منفصلاً. الأب يضبط الاستقلالية (الافتراضي «يقترح فقط»). ترتيب الفحص: مفتاح الإيقاف ← مفتاح القدرة + بوابة الموافقة ← الميزانية. السجل يُصفّى بالطفل، وكل صف يفتح تفصيله (إذنه، دليله، نتيجته، التراجع عنه). البالغ المفوَّض يرى ما يخص صلاحياته فقط. أسماء القدرات التقنية مخفية.',
  r() { const own = isOwner(), q = PLAN[S.plan].ai;
    return `<div class="card"><div class="fx sb"><div class="fx">${ic('power_settings_new')}<div><b>مفتاح الإيقاف</b><div class="sm muted">يوقف كل أفعال المساعد فوراً</div></div></div>${tg(!S.aiKill, own ? 'flip:aiKill' : 'denied:agent.rule.change', 'تشغيل المساعد')}</div></div>
    ${S.aiKill ? callout('المساعد متوقف. لا اقتراحات ولا تحقق آلي من المهام؛ كل تسليم يأتيك مباشرة.', 'wa', 'power_settings_new') : `${sec('مستوى الاستقلالية')}${seg([['suggest', 'يقترح فقط'], ['ask', 'ينفّذ بموافقة'], ['auto', 'ينفّذ البسيط']], S.aiLevel, own ? 'set:aiLevel' : 'denied:agent.rule.change')}<p class="xs muted" style="margin:-4px 4px 10px">${{ suggest: 'الافتراضي: لا ينفّذ شيئاً. يعرض اقتراحه وأنت تقرر.', ask: 'يجهّز الفعل ثم ينتظر موافقتك عليه.', auto: 'ينفّذ الأفعال منخفضة الخطورة القابلة للتراجع فقط، ويبلغك.' }[S.aiLevel]}</p>
    <div class="card"><div class="fx sb sm"><b>ميزانية هذا الشهر</b><span>${S.aiUse} من ${q}</span></div><div style="margin:8px 0 4px">${pbar(S.aiUse / q * 100)}</div><div class="xs muted">عند نفادها يتوقف المساعد بهدوء وتبقى كل الخدمات تعمل يدوياً.</div></div>
    ${sec('ما يستطيع فعله')}${list(AIK.map(([k, t, g], i) => row(i < 3 ? 'check_circle' : 'lock', t, g, { ic: i < 3 ? 'var(--success)' : 'var(--muted)', v: i < 3 ? chip('ممنوح', 'ok') : chip('غير ممنوح', 'ol') })))}`}
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
  rank: ['كيف تُرتَّب القواعد؟', 'نمرّ على أنواع القواعد من الأعلى: النوم، ثم المدرسة، ثم قواعد التطبيقات، ثم الحصة اليومية. أول نوع ينطبق على اللحظة يحسم، ولا يُنظر إلى ما تحته. يستطيع الأب تغيير هذا الترتيب للعائلة أو لطفل بعينه.', 'S1-10 REQ-010/011'],
  extra: ['أين يذهب الوقت الإضافي؟', 'الوقت الممنوح أو المشترى بالنقاط يضاف إلى حدّ التطبيق المطلوب فقط، وينتهي بنهاية اليوم. لا يفتح تطبيقاً في وقت النوم أو المدرسة.', 'S1-10 REQ-012 · S1-05 REQ-008/009'],
  ai: ['لماذا هذا الاقتراح؟', 'استند المساعد إلى أوقات استخدام الجهاز في آخر 7 أيام فقط، لا إلى محتوى أي تطبيق. لا يُنفَّذ شيء دون موافقتك، وكل فعل يُسجَّل ويمكن التراجع عنه.', 'AI-BOUNDARIES · S1-09 REQ-018'],
  stale: ['لماذا «آخر تحديث»؟', 'لا نعرض بيانات قديمة كأنها حية. عندما ينقطع الاتصال نُظهر عمر كل معلومة بوضوح.', 'S1-09 REQ-010/011'],
  classifier: ['كيف رُصدت الرسالة؟', 'مصنّف آلي خفيف يفحص رسائل الأطفال دون 13 دائماً، وللمراهقين بمفتاح يملكه الأب. قد يخطئ، ولذلك يعرضها عليك دون أن يحذف أو يعاقب.', 'S1-08 REQ-012'],
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
    if (id.startsWith('nd:')) { const k = id.slice(3), oo = !PGIVE.includes(k), q = S.preq.find(x => x.k === k && x.st === 'pending'), f = me().f; return `<div class="bigic" style="width:64px;height:64px;border-radius:22px">${ic('lock_person')}</div><h4 class="c">${permName(k)}</h4><p class="d c">${oo ? 'هذا لأحمد وحده. بعض الأمور لا تُعطى لأحد: الاشتراك والملكية وبعض قواعد الحماية.' : `ليست عند${f ? 'كِ' : 'ك'} هذه الصلاحية. ${f ? 'تستطيعين أن تطلبيها' : 'تستطيع أن تطلبها'} من أحمد.`}</p>${SENS.includes(k) ? callout('هذه صلاحية حساسة، فسُجّلت المحاولة وأُبلغ أحمد.', 'nt', 'receipt_long') : ''}${oo ? '' : q ? callout('طلبك عند أحمد. يصلك إشعار حين يرد.', 'nt', 'pending') : btn(f ? 'اطلبيها من أحمد' : 'اطلبها من أحمد', 'preqSend:' + k)}${oo || q ? btn('فهمت', 'close') : `<div class="gap"></div>${btn('ليس الآن', 'close', 'sec')}`}`; }
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
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="pinK:${n}">${n}</button>`).join('')}<button class="gh" data-a="${kind === 'stepup' && S.bio && mode() === 'parent' ? 'pinBio' : 'pinNo'}" aria-label="بصمة">${kind === 'stepup' && S.bio && mode() === 'parent' ? ic('fingerprint') : ''}</button><button data-a="pinK:0">0</button><button class="gh" data-a="pinK:b" aria-label="حذف">${ic('backspace')}</button></div>`}
    ${mode() !== 'parent' ? `<p class="c sm muted" style="margin-top:18px">هذه الصفحة للأهل. ${btn('ارجع', 'pinX', 'txt')}</p>` : S.persona === 'owner' && !locked ? `<p class="c sm" style="margin-top:14px">${btn('نسيت الرقم؟', 'pinForgot', 'txt')}</p>` : ''}</div>`;
  },
});
let pinTimer;
Object.assign(ACT, {
  pinX() { S.full = null; pinCb = null; S.pin.shake = 0; },
  pinNo() { return false; },
  pinForgot() { S.full = null; pinCb = null; go('pin-forgot'); },
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
