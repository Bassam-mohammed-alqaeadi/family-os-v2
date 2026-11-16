/* الهوية والتهيئة: أول تشغيل، الدخول، OTP، TOTP، إنشاء العائلة، الدعوات، ملف الطفل، الإقران، الموافقة المشتركة. */
'use strict';
const obBar = (step, n = 5) => `<header class="bar"><button class="ib" data-a="back" aria-label="${L('رجوع', 'Back')}">${ic('arrow_back')}</button><div class="grow" style="padding:0 12px">${step ? pbar(step / n * 100) : ''}</div><button class="chip ol" style="min-height:32px" data-a="langT">${ic('translate')}${S.lang === 'ar' ? 'EN' : 'ع'}</button></header>`;
ACT.langT = () => { S.lang = S.lang === 'ar' ? 'en' : 'ar'; };

surface('ob-welcome', {
  t: 'أول تشغيل', sys: 'S1-02', p: 'guest', bar: false, nonav: true, flush: true, req: '01:1,2,17,21 02:18', st: 'un',
  note: 'تطبيق واحد لكل الأدوار: الوضع يُحدَّد عند الإقران لا عند التنزيل. UNKNOWN (Q-043): لا شعار معتمد بعد — يُعرض الاسم نصاً. كل شاشات التهيئة بالعربية والإنجليزية.',
  r() { return `<div style="min-height:100%;display:flex;flex-direction:column;background:linear-gradient(170deg,#1F3A6B,#081122);color:#fff;padding:14px 22px 26px"><div style="display:flex;justify-content:flex-end"><button class="chip" style="min-height:36px;background:#ffffff1f;color:#fff" data-a="langT">${ic('translate')}${S.lang === 'ar' ? 'English' : 'العربية'}</button></div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center"><div style="font-size:56px;font-weight:700;line-height:1.2">${L('عائلتي', 'Aailati')}</div><p style="opacity:.85;font-size:17px;margin:8px 0 0;line-height:1.8">${L('أمان العائلة ووقتها ومهامها<br>في تطبيق واحد', 'Family safety, time and tasks<br>in one app')}</p>
    <div class="chips" style="justify-content:center;margin-top:22px">${[['shield', L('حماية', 'Safety')], ['task_alt', L('مهام', 'Tasks')], ['location_on', L('موقع', 'Location')], ['forum', L('محادثة', 'Chat')]].map(([i, t]) => `<span class="chip" style="background:#ffffff14;color:#fff">${ic(i)}${t}</span>`).join('')}</div></div>
    ${btn(L('أنشئ عائلة جديدة', 'Create a family'), 'obStart:new', 'sec" style="background:#fff;color:#142749;box-shadow:none')}<div class="gap"></div>${btn(L('انضم بدعوة', 'Join with an invite'), 'obStart:join', 'sec" style="box-shadow:inset 0 0 0 1.5px #ffffff80;color:#fff')}<div class="gap"></div>${btn(L('هذا جهاز طفل — أدخل رمز الإقران', "This is a child's device"), 'go:ob-pair', 'txt" style="color:#fff;width:100%', 'child_care')}</div>`; },
});
surface('ob-phone', {
  t: 'رقم الهاتف', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:1,19,22,24 01:10',
  note: 'رقم دولي يُتحقق من صيغته قبل إرسال الرمز. الحقل LTR داخل واجهة RTL. البريد بديل موازٍ للبالغين فقط، والدخول بالهاتف يبقى يعمل إن تعذّر مزود البريد.',
  r() { const e = S.ob.err; return obBar(1) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('ما رقم هاتفك؟', "What's your number?")}</p><p class="sub" style="text-align:start">${L('نرسل لك رمز تحقق. لا نشارك رقمك مع أحد.', "We'll send a verification code. We never share your number.")}</p>
    <label class="fld ${e ? 'err' : ''}"><span>${L('رقم الهاتف', 'Phone number')}</span><div class="fx" style="direction:ltr;gap:8px"><button class="inp" style="width:104px;flex:none;display:flex;align-items:center;justify-content:center;gap:4px" data-a="ccT">🇾🇪 <span class="mono">+967</span></button><input id="obP" inputmode="tel" dir="ltr" placeholder="77 123 4567" value="${S.ob.phone || ''}" style="letter-spacing:1px"></div>${e ? `<small>${L('الرقم غير مكتمل. اكتبه بلا الصفر الأول، مثل: 771234567', 'Number looks incomplete. Example: 771234567')}</small>` : `<small>${L('اليمن: 9 أرقام بلا الصفر الأول', 'Yemen: 9 digits, no leading zero')}</small>`}</label>
    ${btn(L('أرسل الرمز', 'Send code'), 'obPhone')}<div class="gap"></div>${btn(L('ادخل بالبريد الإلكتروني', 'Use email instead'), 'go:ob-email', 'txt" style="width:100%')}
    ${S.lbw ? callout(L('شبكتك ضعيفة: سنجرب واتساب أولاً ثم رسالة نصية ثم مكالمة فائتة.', 'Weak network: WhatsApp first, then SMS, then a missed call.'), 'nt', 'data_saver_on') : ''}</div>`; },
});
surface('ob-email', {
  t: 'الدخول بالبريد', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:22,23,24',
  r() { return obBar(1) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('ادخل ببريدك', 'Sign in with email')}</p><p class="sub" style="text-align:start">${L('للبالغين فقط. يصلك رابط تحقق على بريدك.', "Adults only. We'll email you a verification link.")}</p><label class="fld"><span>${L('البريد الإلكتروني', 'Email')}</span><input dir="ltr" inputmode="email" placeholder="name@example.com"></label>${btn(L('أرسل رابط التحقق', 'Send link'), 'obEmail')}${callout(L('إن تعذّر الوصول إلى خدمة البريد، يبقى الدخول برقم الهاتف متاحاً دائماً.', 'If email sign-in is unreachable, phone sign-in always works.'), 'nt', 'info')}</div>`; },
});
surface('ob-otp', {
  t: 'رمز التحقق', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:2,3,4,19 01:10',
  note: 'القنوات بالترتيب: واتساب ← SMS ← مكالمة فائتة. صالح 5 دقائق، إعادة الإرسال بعد 60 ثانية، و5 محاولات خاطئة ← قفل 15 دقيقة. الخانات LTR. الرمز التجريبي: 246810.',
  r() { const v = S.ob.otp || '', ch = ['واتساب', 'رسالة SMS', 'مكالمة فائتة'][S.ob.ch || 0], lock = S.ob.lock;
    return obBar(2) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('أدخل الرمز', 'Enter the code')}</p><p class="sub" style="text-align:start">${L('أرسلناه عبر', 'Sent via')} <b>${ch}</b> ${L('إلى', 'to')} <span class="ltr b">+967 ${S.ob.phone || '771234567'}</span></p>
    ${lock ? callout('خمس محاولات خاطئة. انتظر 15 دقيقة ثم اطلب رمزاً جديداً.', 'da', 'lock_clock') : `<div class="otp">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i === v.length ? 'cur' : ''}">${v[i] || ''}</i>`).join('')}</div>
    ${S.ob.bad ? `<p class="c sm" style="color:var(--danger);margin:-4px 0 10px">الرمز غير صحيح. بقيت ${5 - S.ob.bad} محاولات.</p>` : ''}
    <div class="c" style="margin-bottom:12px"><button class="chip in" style="min-height:36px" data-a="otpAuto">${ic('sms')}${L('اقرأ الرمز من الرسالة تلقائياً', 'Auto-read from SMS')}</button></div>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="otpK:${n}">${n}</button>`).join('')}<span></span><button data-a="otpK:0">0</button><button class="gh" data-a="otpK:b" aria-label="حذف">${ic('backspace')}</button></div>`}
    <p class="c sm muted" style="margin-top:16px">${L('صالح 5 دقائق', 'Valid for 5 minutes')} · <button class="why" data-a="otpNext">${L(`لم يصل؟ جرّب ${['رسالة SMS', 'مكالمة فائتة', 'واتساب'][S.ob.ch || 0]}`, 'Try another channel')}</button></p></div>`; },
});
surface('ob-totp', {
  t: 'التحقق بخطوتين', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:5',
  note: 'التسجيل في TOTP إلزامي بعد أول تحقق ناجح — لا زر «تخطَّ». المفتاح السري LTR قابل للنسخ.',
  r() { return obBar(3) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('احمِ حسابك بخطوة ثانية', 'Add a second step')}</p><p class="sub" style="text-align:start">${L('أضف هذا المفتاح إلى تطبيق المصادقة لديك. خطوة إلزامية لحماية عائلتك.', 'Add this key to your authenticator app. Required to protect your family.')}</p>
    <div class="card c"><div style="width:132px;height:132px;margin:4px auto 10px;border-radius:12px;background:repeating-conic-gradient(var(--text) 0 25%,var(--surface) 0 50%) 0 0/22px 22px;opacity:.85"></div><div class="mono b" style="letter-spacing:2px">JBSW Y3DP EHPK 3PXP</div><button class="btn txt sm" data-a="cpy">${ic('content_copy')}${L('انسخ المفتاح', 'Copy key')}</button></div>
    <label class="fld"><span>${L('الرمز من تطبيق المصادقة', 'Code from the app')}</span><input dir="ltr" inputmode="numeric" maxlength="6" placeholder="••••••" style="text-align:center;letter-spacing:8px" class="mono"></label>${btn(L('فعّل وتابع', 'Enable & continue'), 'go:ob-family')}</div>`; },
});
surface('ob-family', {
  t: 'إنشاء العائلة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:7,8 04:2 01:12',
  note: 'التسمية + المنطقة + المنطقة الزمنية. عائلة واحدة لكل حساب. كل عائلة جديدة تبدأ على المجانية ACTIVE بتكلفة صفر.',
  r() { const r = S.ob.reg || 'YE'; return obBar(4) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('سمِّ عائلتك', 'Name your family')}</p><p class="sub" style="text-align:start">${L('تظهر لكل أفراد العائلة. يمكنك تغييرها لاحقاً.', 'Everyone in the family sees this. You can change it later.')}</p>
    <label class="fld"><span>${L('اسم العائلة', 'Family name')}</span><input id="obF" placeholder="${L('مثال: عائلة المنصور', 'e.g. The Mansours')}" value="${S.ob.fam || ''}"></label>
    <div class="fld"><span>${L('المنطقة', 'Region')}</span>${seg([['YE', L('اليمن', 'Yemen')], ['SA', L('السعودية', 'Saudi Arabia')], ['OTHER', L('أخرى', 'Other')]], r, 'obSet:reg')}<small>${r === 'YE' ? L('يُفعَّل وضع النطاق المنخفض، والأسعار بالريال اليمني.', 'Low-bandwidth mode on; prices in YER.') : L('الأسعار وطرق الدفع تتبع منطقتك.', 'Pricing and payment follow your region.')}</small></div>
    ${list(row('schedule', L('المنطقة الزمنية', 'Time zone'), L('تُحسب بها نوافذ النوم ونهاية اليوم', 'Used for bedtime windows and end of day'), { v: r === 'YE' ? 'صنعاء UTC+3' : 'الرياض UTC+3' }))}
    ${btn(L('أنشئ العائلة', 'Create family'), 'obFam')}</div>`; },
});
surface('ob-done', {
  t: 'العائلة جاهزة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '04:2 02:8 01:2',
  r() { return `<div style="padding:40px 22px;text-align:center"><div class="bigic" style="background:var(--success-soft);color:var(--success)">${ic('celebration')}</div><p class="ttl">${L('عائلتك جاهزة', 'Your family is ready')}</p><p class="sub">${L('أنت الآن مالك العائلة على الخطة المجانية. الخطوة التالية: أضف طفلاً واقرن جهازه.', "You're the owner, on the Free plan. Next: add a child and pair their device.")}</p><div class="card" style="text-align:start">${[['check_circle-fill', L('الحساب والتحقق بخطوتين', 'Account & 2-step')], ['check_circle-fill', L('العائلة والمنطقة', 'Family & region')], ['radio_button_unchecked', L('أضف ملف طفل', 'Add a child')], ['radio_button_unchecked', L('اقرن جهازه', 'Pair their device')]].map(([i, t]) => `<div class="fx" style="padding:6px 0;color:${i.includes('check') ? 'var(--success)' : 'var(--muted)'}">${ic(i)}<span style="color:var(--text)">${t}</span></div>`).join('')}</div>${btn(L('ادخل إلى لوحة العائلة', 'Open the family hub'), 'obEnter')}</div>`; },
});
surface('ob-join', {
  t: 'الانضمام بدعوة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:9,10 03:2',
  note: 'رمز دعوة عشوائي لمرة واحدة صالح 7 أيام. البالغ المنضم يبدأ بدور adult بلا أي منح.',
  r() { const e = S.ob.jerr; return obBar(4) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('أدخل رمز الدعوة', 'Enter invite code')}</p><p class="sub" style="text-align:start">${L('اطلبه من مالك العائلة. يُستخدم مرة واحدة وصالح 7 أيام.', 'Ask the family owner. Single use, valid 7 days.')}</p><label class="fld ${e ? 'err' : ''}"><span>${L('رمز الدعوة', 'Invite code')}</span><input id="obJ" class="mono" dir="ltr" style="text-align:center;letter-spacing:4px" placeholder="XXXX-XXXX">${e ? '<small>الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً من مالك العائلة.</small>' : '<small>جرّب: MNSR-7K2P</small>'}</label>${btn(L('انضم إلى العائلة', 'Join family'), 'obJoin')}</div>`; },
});
surface('ob-pair', {
  t: 'إقران جهاز الطفل', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:14,15 01:2,18,23',
  note: 'جهاز الطفل لا يحتاج رقماً ولا بريداً: رمز إقران من 6 خانات صالح 15 دقيقة يولّده الأب. عند الإقران يُثبَّت الوضع ويولّد الجهاز مفتاح توقيعه.',
  r() { const e = S.ob.perr; return obBar(1, 3) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('رمز الإقران', 'Pairing code')}</p><p class="sub" style="text-align:start">${L('يظهر على هاتف بابا في: العائلة ← الطفل ← الجهاز. صالح 15 دقيقة.', "Shown on the parent's phone. Valid 15 minutes.")}</p><label class="fld ${e ? 'err' : ''}"><span>${L('الرمز من 6 خانات', '6-character code')}</span><input id="obC" class="mono" dir="ltr" maxlength="6" style="text-align:center;letter-spacing:10px;font-size:24px;min-height:64px" placeholder="······">${e ? '<small>الرمز غير صحيح أو انتهى وقته. اطلب من بابا رمزاً جديداً.</small>' : '<small>جرّب: LY4N82</small>'}</label>${btn(L('اقرن هذا الجهاز', 'Pair this device'), 'obPair')}${callout(L('هذا الجهاز سيُقرن بعائلة واحدة فقط، ولا يُنقل إلى عائلة أخرى إلا بفك إقران من الأب.', 'This device pairs with one family only.'), 'nt', 'link')}</div>`; },
});
surface('ob-consent', {
  t: 'الموافقة المشتركة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:17 01:15',
  note: 'إعداد مشترك (أب + طفل) مرة واحدة عند أول اقتران: شفافية عن الفئات المتابَعة لا عن المحتوى، وتُسجَّل الموافقة في التدقيق.',
  r() { const c = S.ob.cons || {}; return obBar(2, 3) + `<div style="padding:8px 6px"><div class="fx" style="justify-content:center;margin-bottom:8px">${av(M.ahmad, 'lg')}${ic('handshake')}${av(M.layan, 'lg')}</div><p class="ttl">نتفق معاً يا ليان</p><p class="sub">اقرآ هذا معاً. بابا سيعرف هذه الأشياء فقط ليبقيكِ بأمان.</p>
    ${list(row('hourglass_top', 'كم وقتاً تستخدمين الجهاز', 'المدة، لا ما تشاهدين بالتفصيل'), row('location_on', 'أين الجهاز', 'ليصل إليك بابا عند الحاجة'), row('forum', 'محادثات العائلة', 'بابا يستطيع رؤيتها'), row('travel_explore', 'نوع المواقع', 'لا كل صفحة'))}
    ${list(row('', 'أنا ليان، فهمت', '', { lead: av(M.layan, 'sm'), tg: !!c.k, ta: 'consT:k' }), row('', 'أنا بابا، شرحت لها', '', { lead: av(M.ahmad, 'sm'), tg: !!c.p, ta: 'consT:p' }))}
    ${btn('بابا يؤكد برقمه السري', 'consGo', c.k && c.p ? '' : '" disabled="', 'lock')}</div>`; },
});
Object.assign(ACT, {
  obStart(k) { S.ob = { flow: k }; go('ob-phone'); },
  ccT() { toast('قائمة الدول — اليمن محدد من منطقة الجهاز', null, 'public'); },
  obPhone() { const v = ($('#obP') || {}).value.replace(/\D/g, ''); S.ob.phone = v; if (!/^7\d{8}$/.test(v)) { S.ob.err = 1; return; } S.ob.err = 0; S.ob.otp = ''; S.ob.bad = 0; S.ob.ch = 0; go('ob-otp'); },
  obEmail() { toast('أُرسل رابط التحقق إلى بريدك', null, 'mail'); },
  otpK(k) { const o = S.ob; if (k === 'b') { o.otp = (o.otp || '').slice(0, -1); return; } o.otp = (o.otp || '') + k; if (o.otp.length < 6) return; if (o.otp === '246810') { o.otp = ''; go('ob-totp'); return; } o.otp = ''; o.bad = (o.bad || 0) + 1; if (o.bad >= 5) o.lock = 1; },
  otpAuto() { S.ob.otp = ''; toast('قُرئ الرمز من الرسالة', null, 'sms'); go('ob-totp'); },
  otpNext() { S.ob.ch = ((S.ob.ch || 0) + 1) % 3; S.ob.lock = 0; S.ob.bad = 0; toast('أُرسل رمز جديد عبر ' + ['واتساب', 'رسالة SMS', 'مكالمة فائتة'][S.ob.ch]); },
  cpy() { toast('نُسخ المفتاح', null, 'content_copy'); },
  obSet(k, v) { S.ob.fam = ($('#obF') || {}).value; S.ob[k] = v; },
  obFam() { const v = ($('#obF') || {}).value.trim(); if (!v) { toast('اكتب اسم العائلة', null, 'error'); return; } S.ob.fam = v; if (S.ob.flow === 'join') return go('ob-join'); go('ob-done'); },
  obEnter() { S.plan = 'free'; setPersona('owner'); S.full = { id: 'perm-notif', a: [] }; },
  obJoin() { const v = ($('#obJ') || {}).value.trim().toUpperCase(); if (v !== 'MNSR-7K2P') { S.ob.jerr = 1; return; } S.tpl = 'none'; setPersona('delegate'); S.full = { id: 'perm-notif', a: [] }; toast('انضممتِ إلى عائلة المنصور كبالغ بلا صلاحيات بعد', null, 'how_to_reg'); },
  obPair() { const v = ($('#obC') || {}).value.trim().toUpperCase(); if (v !== 'LY4N82') { S.ob.perr = 1; return; } S.ob.perr = 0; S.ob.cons = {}; go('ob-consent'); },
  consT(k) { S.ob.cons = S.ob.cons || {}; S.ob.cons[k] = !S.ob.cons[k]; },
  consGo() { gate('اكتب رقمك ليُحفظ على هذا الجهاز', () => { audit('سُجّلت الموافقة المشتركة عند إقران جهاز ليان', 'identity.device.pair'); setPersona('child'); S.full = { id: 'perm-notif', a: [] }; notif('أهلاً ليان!', 'هذا الجهاز الآن جهازك. الوضع ثابت: وضع الطفل.', 'celebration'); confetti(); }); },
});
/* في مسار الانضمام: بعد TOTP ننتقل إلى رمز الدعوة لا إلى إنشاء عائلة */
const _totpR = SC['ob-totp'].r; SC['ob-totp'].r = () => _totpR().replace('data-a="go:ob-family"', `data-a="${S.ob.flow === 'join' ? 'go:ob-join' : 'go:ob-family'}"`);

/* ---------- إدارة الأفراد من وضع الأهل ---------- */
surface('add-member', {
  t: 'إضافة فرد', sys: 'S1-02', p: 'adult', req: '02:9,11 04:9,14 03:2',
  note: 'حارس الحصص: عدد الأفراد يُفحص على الخادم. على المجانية (5 أفراد) تظهر الترقية بدل خطأ غامض — جرّب تبديل الخطة من الاستوديو.',
  r() { const cap = PLAN[S.plan].mem, full = Object.keys(M).length >= cap;
    return full ? `<div class="bigic" style="background:var(--gold-soft);color:var(--text)">${ic('groups')}</div><p class="ttl" style="font-size:22px">بلغت حدّ الخطة ${PLAN[S.plan].n}</p><p class="sub">خطتك تتسع لـ${cap} أفراد وعائلتك مكتملة. أفرادك الحاليون يبقون كما هم.</p>${isOwner() ? btn('اعرض الخطط', 'go:plans', '', 'arrow_circle_up') : callout('الترقية للأب فقط.', 'nt', 'lock')}<div class="c" style="margin-top:10px">${avail('requires_upgrade')}</div>` :
      `<button class="card fx" data-a="${can('identity.family.invite') ? 'go:invite' : 'denied:identity.family.invite'}"><span class="av" style="--c:#7A3E65">${ic('person_add')}</span><div class="grow"><b>ادعُ بالغاً</b><div class="sm muted">أمّ، جدّ، عمّ… ينضم برمز دعوة ويبدأ بلا صلاحيات حتى تفوّضه</div></div>${ic('chevron_right')}</button>
      <button class="card fx" data-a="${can('identity.child.create') ? 'go:child-new' : 'denied:identity.child.create'}"><span class="av" style="--c:#CF5B2C">${ic('child_care')}</span><div class="grow"><b>أنشئ ملف طفل أو مراهق</b><div class="sm muted">لا يحتاج رقماً ولا بريداً. تقرن جهازه برمز</div></div>${ic('chevron_right')}</button>${callout('ملفات الأطفال ينشئها الأب أو البالغ المفوَّض فقط.', 'nt', 'info')}`; },
});
surface('invite', {
  t: 'دعوة بالغ', sys: 'S1-02', p: 'adult', req: '02:9,10 03:2',
  note: 'رمز عشوائي يتولد لكل طلب، لمرة واحدة، صالح 7 أيام. يُعرض LTR معزولاً.',
  r() { const c = S.inv || (S.inv = 'MNSR-7K2P'); return `<p class="sub" style="text-align:start">شارك هذا الرمز مع من تدعوه. يستخدمه مرة واحدة فقط.</p><div class="code" style="font-size:28px;letter-spacing:5px">${c}</div><div class="chips" style="justify-content:center;margin-bottom:14px">${chip('صالح 7 أيام', 'in', 'schedule')}${chip('لمرة واحدة', 'ol', 'counter_1')}</div><div class="btns">${btn('انسخ', 'cpy', 'sec', 'content_copy')}${btn('شارك', 'cpy', '', 'share')}</div><div class="gap"></div>${btn('ولّد رمزاً جديداً', 'invNew', 'txt" style="width:100%')}${callout('ينضم المدعو بدور «بالغ» بلا أي منح. تختار له قالباً بعد انضمامه.', '', 'info')}`; },
});
ACT.invNew = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', r = n => Array.from({ length: n }, () => A[Math.floor(Math.random() * A.length)]).join(''); S.inv = r(4) + '-' + r(4); toast('أُلغي الرمز السابق ووُلّد رمز جديد'); };
const tplOf = y => { const a = 2026 - y; return a < 0 || a > 17 ? null : a < 7 ? ['طفل', 'المبسّط', 'child_care'] : a < 13 ? ['طفل', 'القياسي', 'face'] : ['مراهق', 'المراهق', 'person']; };
surface('child-new', {
  t: 'ملف طفل جديد', sys: 'S1-02', p: 'adult', req: '02:11,12,13,21 03:1',
  note: 'اسم مستعار + صورة رمزية + لون + سنة ميلاد فقط — لا تاريخ ميلاد كامل. سنة الميلاد تحدد الدور والقالب تلقائياً وتُقبل ضمن نطاق معقول فقط.',
  r() { const c = S.cn = S.cn || { n: '', i: 'face_2', c: '#2457A6', y: 2018 }, t = tplOf(c.y);
    return `<div class="c" style="padding:4px 0 12px"><span class="av xl" style="--c:${c.c};margin:auto">${ic(c.i)}</span></div><label class="fld"><span>الاسم المستعار</span><input id="cnN" placeholder="مثال: نور" value="${c.n}"><small>يظهر داخل العائلة فقط. لا نطلب الاسم الكامل.</small></label>
    <div class="fld"><span>الصورة الرمزية</span><div class="chips">${['face_2', 'face_3', 'face_4', 'face_5', 'face_6', 'pets'].map(i => `<button class="av" style="--c:${c.i === i ? c.c : 'var(--border-strong)'}" data-a="cnSet:i:${i}" aria-pressed="${c.i === i}">${ic(i)}</button>`).join('')}</div></div>
    <div class="fld"><span>اللون</span><div class="chips">${['#2457A6', '#CF5B2C', '#1F6B3B', '#7A3E65', '#1C6E73', '#9A5B00'].map(x => `<button class="av sm" style="--c:${x};${c.c === x ? 'box-shadow:0 0 0 3px var(--surface),0 0 0 5px ' + x : ''}" data-a="cnSet:c:${x}" aria-label="لون" aria-pressed="${c.c === x}"></button>`).join('')}</div></div>
    <div class="fld ${t ? '' : 'err'}"><span>سنة الميلاد</span><div class="card flat" style="margin:0"><div class="stepper"><button data-a="cnSet:y:${c.y - 1}" aria-label="أقدم">${ic('remove')}</button><b>${c.y}<small>${t ? (2026 - c.y) + ' سنة' : 'خارج النطاق'}</small></b><button data-a="cnSet:y:${c.y + 1}" aria-label="أحدث">${ic('add')}</button></div></div>${t ? '' : '<small>ملف الطفل لمن هم دون 18 سنة. للبالغين استخدم «ادعُ بالغاً».</small>'}</div>
    ${t ? `<div class="card fx" style="border-color:var(--info)">${ic(t[2])}<div class="grow"><b>الدور: ${t[0]} · القالب ${t[1]}</b><div class="sm muted">يُحدَّد تلقائياً من سنة الميلاد ويتغير مع العمر</div></div></div>` : ''}${btn('أنشئ الملف وتابع للإقران', 'cnGo', t ? '' : '" disabled="')}`; },
});
Object.assign(ACT, {
  cnSet(k, v) { S.cn.n = ($('#cnN') || {}).value; S.cn[k] = k === 'y' ? +v : v; },
  cnGo() { const n = ($('#cnN') || {}).value.trim(); if (!n) { toast('اكتب اسماً مستعاراً للطفل', null, 'error'); return; } toast(`أُنشئ ملف ${n}`); S.stack.pop(); go('pair-code', 'new'); },
});
surface('pair-code', {
  t: 'إقران الجهاز', sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:14,15 01:2,5,23',
  note: 'رمز جهاز من 6 خانات صالح 15 دقيقة. بعد الإقران يُثبَّت الوضع ويُزرع على الجهاز آخر إعداد للقواعد. لا يُعرض الرمز قبل أن ينشئ الأب رقمه السري، لأنه يكتبه على جهاز الطفل في خطوة الموافقة فيُحفظ هناك محلياً.',
  r() { if (!S.pin.set) return empty('pin', 'أنشئ رقمك السري أولاً', 'ستدخله على جهاز الطفل عند الإقران، وهو الذي يحمي إعدادات ذلك الجهاز بعدها.', btn('أنشئ الرقم السري', 'pinChange', '', 'pin')); return `<p class="sub" style="text-align:start">على جهاز الطفل: نزّل «عائلتي» ← «هذا جهاز طفل» ← أدخل هذا الرمز.</p><div class="code">LY4N82</div><div class="chips" style="justify-content:center;margin-bottom:14px">${chip('ينتهي بعد 14:32', 'wa', 'timer')}${chip('لجهاز واحد', 'ol', 'mobile')}</div>
    <div class="card"><div class="tl"><div class="ev ok"><b>أُنشئ الرمز</b><span>الآن</span></div><div class="ev"><b>بانتظار إدخاله على جهاز الطفل</b><span>أبقِ هذه الشاشة مفتوحة</span></div><div class="ev"><b>الموافقة المشتركة</b><span>تقرآنها معاً ثم تكتب رقمك السري على جهازه فيُحفظ هناك</span></div></div></div>${btn('جرّب من جهة الطفل', 'jumpPair', 'ton', 'mobile')}`; },
});
ACT.jumpPair = () => { setPersona('guest'); S.ob = {}; S.stack = [{ id: 'ob-welcome', a: [] }, { id: 'ob-pair', a: [] }]; };
surface('device', {
  t: id => 'جهاز ' + M[id].n, sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:15 01:18,23 10:27 03:20',
  note: 'جهاز مُقترن لعائلة لا يُقترن لأخرى دون فك إقران صريح من الأب (مالك حصري). القواعد تتبع الطفل إلى جهازه القادم.',
  r(id) { return list(row('mobile', 'Samsung Galaxy A14', 'Android 13 · مقترن منذ 2 نوفمبر', { v: chip('متصل', 'ok') }), row('lock', 'الوضع', 'ثابت لهذا الجهاز · لا تبديل ملفات في المرحلة 1', { v: M[id].role === 'teen' ? 'مراهق' : 'طفل' }), row('key', 'مفتاح توقيع الجهاز', 'مربوط بالعتاد', { v: chip('مسجَّل', 'ok', 'check') })) + list(row('devices', 'اقرن جهازاً بديلاً', 'القواعد تنتقل مع ' + M[id].n, { a: can('identity.device.pair') || isOwner() ? 'go:pair-code:' + id : 'denied:identity.device.pair' }), row('link_off', 'فكّ إقران هذا الجهاز', 'للأب فقط · برقمه السري', { a: isOwner() ? 'unpairGo:' + id : 'denied:identity.device.unpair', ic: 'var(--danger)' })); },
});
ACT.unpairGo = id => gate('فكّ إقران جهاز ' + M[id].n, () => toast('في التطبيق الفعلي يُفك الإقران الآن وتتوقف القواعد على ذلك الجهاز', null, 'info'), 'stepup');
surface('child-profile', {
  t: id => 'ملف ' + M[id].n, sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:12,13',
  r(id) { const m = M[id], t = tplOf(m.by); return `<div class="c" style="padding:4px 0 12px">${av(m, 'xl')}</div>${list(row('badge', 'الاسم المستعار', '', { v: m.n, a: 'soonC' }), row('palette', 'اللون والصورة الرمزية', '', { a: 'soonC', v: `<span class="av sm" style="--c:${m.c}"></span>` }), row('cake', 'سنة الميلاد', 'لا نحفظ تاريخ الميلاد الكامل', { v: m.by }), row(t[2], 'الدور والقالب', 'يُحدَّدان تلقائياً من سنة الميلاد', { v: `${t[0]} · ${t[1]}` }))}`; },
});
surface('minor-chats', {
  t: id => 'محادثات ' + M[id].n, sys: 'S1-08', p: 'adult', a: ['layan'], req: '08:4,13',
  r(id) { const cs = Object.keys(CH).filter(k => CH[k].mem.includes(id)); return callout('تُعرض للقراءة فقط. ' + M[id].n + ' ' + vb(M[id], 'يعلم', 'تعلم') + ' أن محادثاته مرئية للأب.', 'nt', 'visibility') + list(cs.map(k => row(CH[k].i || 'chat', chName(k, id), lastMsg(k), { a: 'openCh:' + k }))); },
});
