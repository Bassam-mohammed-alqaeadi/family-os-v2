/* الهوية والتهيئة: أول تشغيل، الدخول، OTP، إنشاء العائلة، الدعوات، ملف الطفل، الإقران، الموافقة المشتركة. */
'use strict';
/* طريقا التسجيل والدخول متساويان: رقم الهاتف أو البريد الإلكتروني (حكم المالك Q-400) */
const obWay = cur => `<div style="margin:0 0 16px">${seg([['phone', L('رقم الهاتف', 'Phone number')], ['email', L('البريد الإلكتروني', 'Email')]], cur, 'obWay')}</div>`;
const obTtl = () => ({ new: L('أنشئ حسابك', 'Create your account'), join: L('أنشئ حسابك لتنضم', 'Create your account to join') }[S.ob.flow] || L('ادخل إلى حسابك', 'Sign in'));
const obBar = (step, n = 5) => `<header class="bar"><button class="ib" data-a="back" aria-label="${L('رجوع', 'Back')}">${ic('arrow_back')}</button><div class="grow" style="padding:0 12px">${step ? pbar(step / n * 100) : ''}</div><button class="chip ol" style="min-height:32px" data-a="langT">${ic('translate')}${S.lang === 'ar' ? 'EN' : 'ع'}</button></header>`;
ACT.langT = () => { S.lang = S.lang === 'ar' ? 'en' : 'ar'; };

surface('ob-welcome', {
  t: 'أول تشغيل', sys: 'S1-02', p: 'guest', bar: false, nonav: true, flush: true, req: '01:1,2,17,21 02:1,18,22', st: 'un',
  note: 'تطبيق واحد لكل الأدوار: الوضع يُحدَّد عند الإقران لا عند التنزيل. البالغ ينشئ عائلة أو ينضم بدعوة، ويسجّل حسابه برقم الهاتف أو بالبريد الإلكتروني وهما متساويان (حكم المالك Q-400). من له حساب يدخل من «لديّ حساب». جهاز الطفل يُقرن برمز. الشعار من تصميم Q-398 (ينتظر حكم المالك). كل شاشات التهيئة بالعربية والإنجليزية.',
  r() { return `<div style="min-height:100%;display:flex;flex-direction:column;background:linear-gradient(170deg,#1F3A6B,#081122);color:#fff;padding:14px 22px 26px"><div style="display:flex;justify-content:flex-end"><button class="chip" style="min-height:36px;background:#ffffff1f;color:#fff" data-a="langT">${ic('translate')}${S.lang === 'ar' ? 'English' : 'العربية'}</button></div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center"><img src="assets/brand/logo-symbol-dark.svg" alt="" width="132" height="125" style="margin:0 auto 2px"><img src="assets/brand/${L('logo-wordmark-ar-dark', 'logo-wordmark-en-dark')}.svg" alt="${L('عائلتي', 'Family OS')}" height="${L('86', '48')}" style="margin:0 auto"><p style="opacity:.85;font-size:17px;margin:8px 0 0;line-height:1.8">${L('أمان العائلة ووقتها ومهامها<br>في تطبيق واحد', 'Family safety, time and tasks<br>in one app')}</p>
    <div class="chips" style="justify-content:center;margin-top:22px">${[['shield', L('حماية', 'Safety')], ['task_alt', L('مهام', 'Tasks')], ['location_on', L('موقع', 'Location')], ['forum', L('محادثة', 'Chat')]].map(([i, t]) => `<span class="chip" style="background:#ffffff14;color:#fff">${ic(i)}${t}</span>`).join('')}</div></div>
    ${btn(L('أنشئ عائلة جديدة', 'Create a family'), 'obStart:new', 'sec" style="background:#fff;color:#142749;box-shadow:none')}<div class="gap"></div>${btn(L('انضم بدعوة', 'Join with an invite'), 'obStart:join', 'sec" style="box-shadow:inset 0 0 0 1.5px #ffffff80;color:#fff')}<div class="gap"></div>${btn(L('هذا جهاز طفل — أدخل رمز الإقران', "This is a child's device"), 'go:ob-pair', 'txt" style="color:#fff;width:100%', 'child_care')}${btn(L('لديّ حساب — دخول', 'I have an account — sign in'), 'obStart:', 'txt" style="color:#ffffffd9;width:100%;min-height:40px;font-size:14px')}</div>`; },
});
surface('ob-phone', {
  t: 'التسجيل برقم الهاتف', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:1,19,22,24 01:10',
  note: 'الحساب يُسجَّل برقم الهاتف أو بالبريد الإلكتروني، والاختيار بينهما في أعلى الشاشة وهما متساويان (حكم المالك Q-400). رقم دولي يُتحقق من صيغته قبل إرسال الرمز، والأرقام العربية تُقبل وتُحوَّل. للتجربة: 771234567 رقم جديد، و777000111 رقم له حساب.',
  r() { const e = S.ob.err; return obBar(1) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${obTtl()}</p><p class="sub" style="text-align:start">${L('برقم هاتفك أو ببريدك الإلكتروني. اختر ما يناسبك.', 'With your phone number or your email. Pick either.')}</p>${obWay('phone')}
    <label class="fld ${e ? 'err' : ''}"><span>${L('رقم الهاتف', 'Phone number')}</span><div class="fx" style="direction:ltr;gap:8px"><button class="inp" style="width:104px;flex:none;display:flex;align-items:center;justify-content:center;gap:4px" data-a="ccT">🇾🇪 <span class="mono">+967</span></button><input id="obP" inputmode="tel" dir="ltr" placeholder="77 123 4567" value="${S.ob.phone || ''}" style="letter-spacing:1px"></div>${e ? `<small>${L('الرقم غير مكتمل. اكتبه بلا الصفر الأول، مثل: 771234567', 'Number looks incomplete. Example: 771234567')}</small>` : `<small>${L('نرسل إليه رمز تحقق. لا نشارك رقمك مع أحد.', "We'll send a code. We never share your number.")}</small>`}</label>
    ${offline() ? callout(L('أنت غير متصل. إرسال الرمز يحتاج اتصالاً.', 'You are offline. Sending the code needs a connection.'), 'wa', 'cloud_off') : ''}${btn(L('أرسل الرمز', 'Send code'), 'obPhone', offline() ? '" disabled="' : '')}<div class="gap"></div>${btn(L('فقدت هاتفك ورقمك؟', 'Lost your phone and number?'), 'go:ob-recover', 'txt" style="width:100%')}
    ${S.lbw ? callout(L('شبكتك ضعيفة: سنجرب واتساب أولاً ثم رسالة نصية ثم مكالمة فائتة.', 'Weak network: WhatsApp first, then SMS, then a missed call.'), 'nt', 'data_saver_on') : ''}</div>`; },
});
surface('ob-email', {
  t: 'التسجيل بالبريد', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:1,22,23,24',
  note: 'طريق مساوٍ لرقم الهاتف في إنشاء الحساب والدخول والانضمام، ومن سجّل به لا يُطلب منه رقم (حكم المالك Q-400). للبالغين فقط. يصل رابط إلى البريد؛ بعد الضغط عليه يُفتح التطبيق ويكمل وحده. ثلاث حالات: الإدخال، انتظار الضغط على الرابط، وتعذّر خدمة البريد (فيبقى الدخول بالهاتف يعمل). للتجربة: بريد ينتهي بـ@down.test يُظهر حالة التعذّر، و ahmad@example.com بريد له حساب.',
  r() { const o = S.ob, m = o.em;
    if (m === 'sent') return obBar(1) + `<div style="padding:24px 6px;text-align:center"><div class="bigic">${ic('mark_email_read')}</div><p class="ttl">${L('افتح بريدك', 'Check your email')}</p><p class="sub">${L('أرسلنا رابطاً إلى', 'We sent a link to')} <span class="ltr b">${o.email}</span>. ${L('اضغطه من هذا الهاتف فيُفتح «عائلتي» وتدخل مباشرة.', 'Tap it on this phone and you are in.')}</p>${btn(L('جرّب: كأني ضغطت الرابط', 'Demo: I tapped the link'), 'emOpen', 'ton')}<div class="gap"></div>${btn(L('أرسل الرابط مرة أخرى', 'Send again'), 'emAgain', 'sec')}<div class="gap"></div>${btn(L('غيّر البريد', 'Change email'), 'emBack', 'txt" style="width:100%')}<p class="xs muted" style="margin-top:12px">${L('لم يصل؟ انظر في مجلد الرسائل غير المرغوبة.', 'Not there? Check spam.')}</p></div>`;
    if (m === 'down') return obBar(1) + `<div style="padding:24px 6px;text-align:center"><div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('cloud_off')}</div><p class="ttl">${L('الدخول بالبريد متوقف الآن', 'Email sign-in is unavailable')}</p><p class="sub">${L('لم نستطع الوصول إلى خدمة البريد. الدخول برقم الهاتف يعمل.', "We couldn't reach the email service. Phone sign-in works.")}</p>${btn(L('ادخل برقم الهاتف', 'Use phone number'), 'emPhone', '', 'call')}<div class="gap"></div>${btn(L('حاول بالبريد مرة أخرى', 'Try email again'), 'emBack', 'sec')}</div>`;
    return obBar(1) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${obTtl()}</p><p class="sub" style="text-align:start">${L('برقم هاتفك أو ببريدك الإلكتروني. اختر ما يناسبك.', 'With your phone number or your email. Pick either.')}</p>${obWay('email')}<label class="fld ${o.eerr ? 'err' : ''}"><span>${L('البريد الإلكتروني', 'Email')}</span><input id="obE" dir="ltr" inputmode="email" placeholder="name@example.com" value="${o.email || ''}"><small>${o.eerr ? L('اكتب بريداً صحيحاً مثل name@example.com', 'Enter a valid email') : L('نرسل إليه رابطاً تضغطه فتدخل. لا نطلب رقم هاتف.', "We'll email you a link. No phone number needed.")}</small></label>${offline() ? callout(L('أنت غير متصل. إرسال الرابط يحتاج اتصالاً.', 'You are offline.'), 'wa', 'cloud_off') : ''}${btn(L('أرسل الرابط', 'Send link'), 'obEmail', offline() ? '" disabled="' : '')}</div>`; },
});
surface('ob-otp', {
  t: 'رمز التحقق', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:2,3,4,19,24 01:10',
  note: 'القنوات بالترتيب: واتساب ← SMS ← مكالمة فائتة. صالح 5 دقائق، إعادة الإرسال بعد 60 ثانية، و5 محاولات خاطئة ← قفل 15 دقيقة. الرمز لا يُعرض على الشاشة أبداً. إن فشلت القنوات الثلاث لا تنتهي الشاشة بطريق مسدود: محاولة لاحقة أو الدخول بالبريد. الرمز التجريبي: 246810.',
  r() { const v = S.ob.otp || '', ch = ['واتساب', 'رسالة SMS', 'مكالمة فائتة'][S.ob.ch || 0], lock = S.ob.lock;
    if (S.ob.fail) return obBar(2) + `<div style="padding:12px 6px"><div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('chat_error')}</div><p class="ttl">${L('لم نستطع إيصال الرمز', "We couldn't deliver the code")}</p><p class="sub">${L('جرّبنا واتساب ثم رسالة نصية ثم مكالمة فائتة إلى', 'We tried WhatsApp, SMS and a missed call to')} <span class="ltr b">+967 ${S.ob.phone || '771234567'}</span>. ${L('المشكلة غالباً من الشبكة، وليست من رقمك.', 'This is usually the network, not your number.')}</p>${btn(L('حاول مرة أخرى', 'Try again'), 'otpRetry')}<div class="gap"></div>${btn(L('ادخل بالبريد الإلكتروني', 'Use email instead'), 'go:ob-email', 'sec', 'mail')}<div class="gap"></div>${btn(L('غيّر الرقم', 'Change number'), 'back', 'txt" style="width:100%')}</div>`;
    return obBar(2) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('أدخل الرمز', 'Enter the code')}</p><p class="sub" style="text-align:start">${L('أرسلناه عبر', 'Sent via')} <b>${ch}</b> ${L('إلى', 'to')} <span class="ltr b">+967 ${S.ob.phone || '771234567'}</span></p>
    ${lock ? callout('خمس محاولات خاطئة. انتظر 15 دقيقة ثم اطلب رمزاً جديداً.', 'da', 'lock_clock') : `<div class="otp">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i === v.length ? 'cur' : ''}">${v[i] || ''}</i>`).join('')}</div>
    ${S.ob.bad ? `<p class="c sm" style="color:var(--danger);margin:-4px 0 10px">الرمز غير صحيح. بقيت ${5 - S.ob.bad} محاولات.</p>` : ''}
    <div class="c" style="margin-bottom:12px"><button class="chip in" style="min-height:36px" data-a="otpAuto">${ic('sms')}${L('اقرأ الرمز من الرسالة تلقائياً', 'Auto-read from SMS')}</button></div>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="otpK:${n}">${n}</button>`).join('')}<span></span><button data-a="otpK:0">0</button><button class="gh" data-a="otpK:b" aria-label="حذف">${ic('backspace')}</button></div>`}
    ${lock ? '' : `<p class="c sm muted" style="margin-top:16px">${L('صالح 5 دقائق', 'Valid for 5 minutes')} · <button class="why" data-a="otpNext">${L(`لم يصل؟ جرّب ${['رسالة SMS', 'مكالمة فائتة', 'مرة أخرى'][S.ob.ch || 0]}`, 'Try another channel')}</button></p>`}</div>`; },
});
surface('ob-totp', {
  t: 'رمز من جهازك الآخر', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:5,20', st: 'pr',
  note: 'بديل مقترح لشاشة «تفعيل TOTP» (Q-246 — ينتظر حكم المالك): الخطوة الثانية بلا تطبيق خارجي ولا رمز QR ولا مفتاح يُنسخ. هاتف البالغ الذي دخل منه يحفظ المفتاح تلقائياً عند أول تحقق، ويعرض الرمز من «الأمان ← رمز الدخول». هذه الشاشة تظهر فقط في الحالات الثلاث المغلقة (REQ-005): دخول من جهاز جديد قبل عملية حساسة، بعد تغيير البصمة، ولإتمام الاسترداد. الدخول اليومي بلا خطوة ثانية. الرمز التجريبي: 314159.',
  r() { const v = S.ob.lc || ''; return obBar(0) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('أدخل الرمز من جهازك الآخر', 'Enter the code from your other device')}</p><p class="sub" style="text-align:start">${L('افتح «عائلتي» على هاتف سبق أن دخلت منه، ثم: المزيد ← الأمان ← رمز الدخول. الرمز يتغير كل 30 ثانية.', 'Open the app on a phone you already use: More → Security → Sign-in code. It changes every 30 seconds.')}</p>
    <div class="otp">${[0, 1, 2, 3, 4, 5].map(i => `<i class="${i === v.length ? 'cur' : ''}">${v[i] || ''}</i>`).join('')}</div>${S.ob.lcBad ? `<p class="c sm" style="color:var(--danger);margin:-4px 0 10px">${L('الرمز غير صحيح أو انتهى وقته. اكتب الرمز الظاهر الآن.', 'Wrong or expired code. Enter the one showing now.')}</p>` : ''}
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-a="lcK:${n}">${n}</button>`).join('')}<span></span><button data-a="lcK:0">0</button><button class="gh" data-a="lcK:b" aria-label="حذف">${ic('backspace')}</button></div>
    <p class="c" style="margin-top:16px"><button class="why" data-a="lcNone">${L('ليس معي جهاز آخر', 'I have no other device')}</button></p></div>`; },
});
surface('ob-choose', {
  t: 'عائلة جديدة أم دعوة؟', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:7,8,9',
  note: 'تظهر لرقم جديد فقط. من له حساب يدخل مباشرة إلى عائلته، ومن فتح رابط دعوة يذهب إلى شاشة الدعوة ورمزه معبّأ.',
  r() { return obBar(3) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('أهلاً بك', 'Welcome')}</p><p class="sub" style="text-align:start">${L('رقمك جديد عندنا. اختر ما يناسبك:', 'Your number is new here. Choose one:')}</p>
    <button class="card fx" data-a="go:ob-family"><span class="av" style="--c:#1F3A6B">${ic('family_home')}</span><div class="grow"><b>${L('أنشئ عائلة جديدة', 'Create a new family')}</b><div class="sm muted">${L('أنت من يدير العائلة ويضيف أفرادها', 'You manage the family and add its members')}</div></div>${ic('chevron_right')}</button>
    <button class="card fx" data-a="go:ob-join"><span class="av" style="--c:#7A3E65">${ic('group_add')}</span><div class="grow"><b>${L('انضم إلى عائلة برمز دعوة', 'Join a family with an invite code')}</b><div class="sm muted">${L('وصلك رمز من أحد أفراد العائلة', 'A family member sent you a code')}</div></div>${ic('chevron_right')}</button>
    ${callout(L('لكل حساب عائلة واحدة. إن كانت عائلتك موجودة فاطلب دعوة ولا تنشئ عائلة ثانية.', 'One family per account. If your family exists, ask for an invite.'), 'nt', 'info')}</div>`; },
});
const OB_REG = { YE: ['اليمن', 'Yemen', 'صنعاء', '🇾🇪'], SA: ['السعودية', 'Saudi Arabia', 'الرياض', '🇸🇦'], AE: ['الإمارات', 'UAE', 'دبي', '🇦🇪'], QA: ['قطر', 'Qatar', 'الدوحة', '🇶🇦'], KW: ['الكويت', 'Kuwait', 'الكويت', '🇰🇼'], BH: ['البحرين', 'Bahrain', 'المنامة', '🇧🇭'], OM: ['عُمان', 'Oman', 'مسقط', '🇴🇲'] };
/* توقيت هاتف المالك في العرض. لا يُشتق من البلد أبداً (Q-264): تغيير البلد لا يغيّره */
const OB_DEV_TZ = 'صنعاء';
const OB_TZ = [['صنعاء', 'UTC+3'], ['الرياض', 'UTC+3'], ['الكويت', 'UTC+3'], ['المنامة', 'UTC+3'], ['الدوحة', 'UTC+3'], ['دبي', 'UTC+4'], ['مسقط', 'UTC+4'], ['القاهرة', 'UTC+2'], ['إسطنبول', 'UTC+3'], ['كوالالمبور', 'UTC+8']];
surface('ob-family', {
  t: 'إنشاء العائلة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:7,8 04:2 01:12',
  note: 'حقل واحد يُكتب: اسم العائلة. البلد يُقترح من مفتاح رقم الهاتف (أو من إعداد الهاتف لمن سجّل بالبريد)، والتوقيت يُقترح من ساعة الهاتف (لا يُشتق من البلد — Q-264)، وكلاهما ظاهر ويُغيَّر بنقرة؛ وضغط «أنشئ العائلة» هو موافقة المالك عليهما. عائلة واحدة لكل حساب.',
  r() { const r = S.ob.reg || 'YE', tz = S.ob.tz || OB_DEV_TZ, pk = S.ob.pick, R = OB_REG[r];
    const body = pk === 'reg' ? `<p class="ttl" style="text-align:start;font-size:22px">${L('في أي بلد تعيش العائلة؟', 'Where does the family live?')}</p>${list(Object.keys(OB_REG).map(k => row('', OB_REG[k][3] + ' ' + L(OB_REG[k][0], OB_REG[k][1]), '', { a: 'obPick:reg:' + k, chev: false, v: k === r ? ic('check') : '' })))}`
      : pk === 'tz' ? `<p class="ttl" style="text-align:start;font-size:22px">${L('توقيت العائلة', 'Family time')}</p><p class="sub" style="text-align:start">${L('تُحسب به أوقات النوم والمدرسة ونهاية اليوم لكل الأطفال.', 'Bedtime, school hours and end of day follow it.')}</p>${list(OB_TZ.map(([c, u]) => row('', c, '', { a: 'obPick:tz:' + c, chev: false, v: `<span class="ltr">${u}</span>` + (c === tz ? ic('check') : '') })))}`
        : `<p class="ttl" style="text-align:start">${L('سمِّ عائلتك', 'Name your family')}</p><p class="sub" style="text-align:start">${L('يراه كل أفراد العائلة. تستطيع تغييره لاحقاً.', 'Everyone in the family sees this. You can change it later.')}</p>
    <label class="fld"><span>${L('اسم العائلة', 'Family name')}</span><input id="obF" placeholder="${L('مثال: عائلة المنصور', 'e.g. The Mansours')}" value="${S.ob.fam || ''}"></label>
    ${list(row('public', L('البلد', 'Country'), S.ob.via === 'email' ? L('من إعداد هاتفك · يحدد الأسعار وطرق الدفع', 'From your phone settings · sets prices and payment') : L('من رقم هاتفك · يحدد الأسعار وطرق الدفع', 'From your number · sets prices and payment'), { v: R[3] + ' ' + L(R[0], R[1]), a: 'obPick:open:reg' }), row('schedule', L('التوقيت', 'Time'), L('من ساعة هاتفك · لأوقات النوم والمدرسة', 'From your phone clock · for bedtime and school'), { v: tz, a: 'obPick:open:tz' }))}
    ${btn(L('أنشئ العائلة', 'Create family'), 'obFam')}<p class="c xs muted" style="margin-top:10px">${L('ستكون أنت مالك العائلة.', "You'll be the family owner.")}</p>`;
    return obBar(4) + `<div style="padding:12px 6px">${body}</div>`; },
});
surface('ob-done', {
  t: 'العائلة جاهزة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '04:2 02:8 01:2',
  r() { return `<div style="padding:40px 22px;text-align:center"><div class="bigic" style="background:var(--success-soft);color:var(--success)">${ic('celebration')}</div><p class="ttl">${L('عائلتك جاهزة', 'Your family is ready')}</p><p class="sub">${L('أنت الآن مالك العائلة على الخطة المجانية. الخطوة التالية: أضف طفلاً واقرن جهازه.', "You're the owner, on the Free plan. Next: add a child and pair their device.")}</p><div class="card" style="text-align:start">${[['check_circle-fill', S.ob.via === 'email' ? L('بريدك موثَّق', 'Email verified') : L('رقمك موثَّق', 'Number verified')], ['check_circle-fill', L('هذا الهاتف صار موثوقاً لحسابك', 'This phone is now trusted')], ['check_circle-fill', L('العائلة والبلد والتوقيت', 'Family, country and time')], ['radio_button_unchecked', L('أضف ملف طفل', 'Add a child')], ['radio_button_unchecked', L('اقرن جهازه', 'Pair their device')]].map(([i, t]) => `<div class="fx" style="padding:6px 0;color:${i.includes('check') ? 'var(--success)' : 'var(--muted)'}">${ic(i)}<span style="color:var(--text)">${t}</span></div>`).join('')}</div>${btn(L('ادخل إلى لوحة العائلة', 'Open the family hub'), 'obEnter')}</div>`; },
});
surface('ob-join', {
  t: 'الانضمام بدعوة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:9,10 03:2',
  note: 'رمز دعوة عشوائي لمرة واحدة صالح 7 أيام. من فتح رابط الدعوة يجد الرمز معبّأً؛ ومن نزّل التطبيق بعد الرابط يكتب الرمز الموجود في نص الرسالة نفسها. اسم العائلة يظهر بعد التحقق من الرمز فقط. البالغ المنضم يبدأ بلا صلاحيات حتى يحددها الأب.',
  r() { const e = S.ob.jerr; if (S.ob.jok) return obBar(4) + `<div style="padding:12px 6px;text-align:center"><div class="bigic">${ic('family_home')}</div><p class="ttl">${L('عائلة المنصور تدعوك', 'The Mansour family invites you')}</p><p class="sub">${L('دعاك أحمد. ستدخل بالغاً في العائلة: ترى الأفراد والمحادثات، ولا تتحكم في أجهزة الأطفال حتى يحدد لك أحمد صلاحياتك.', "Ahmad invited you. You join as an adult: you see members and chats, and can't control children's devices until Ahmad sets your permissions.")}</p>${btn(L('انضم إلى العائلة', 'Join family'), 'obJoinGo')}<div class="gap"></div>${btn(L('ليست عائلتي', 'Not my family'), 'obJoinNo', 'txt" style="width:100%')}</div>`;
    return obBar(4) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('أدخل رمز الدعوة', 'Enter invite code')}</p><p class="sub" style="text-align:start">${L('تجده في الرسالة التي وصلتك. يُستخدم مرة واحدة وصالح 7 أيام.', "It's in the message you received. Single use, valid 7 days.")}</p><label class="fld ${e ? 'err' : ''}"><span>${L('رمز الدعوة', 'Invite code')}</span><input id="obJ" class="mono" dir="ltr" style="text-align:center;letter-spacing:4px" placeholder="XXXX-XXXX" value="${S.ob.link ? 'MNSR-7K2P' : ''}">${e ? '<small>الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً ممن دعاك.</small>' : S.ob.link ? '<small>عُبّئ من رابط الدعوة</small>' : '<small>جرّب: MNSR-7K2P</small>'}</label>${btn(L('تابع', 'Continue'), 'obJoin')}</div>`; },
});
surface('ob-pair', {
  t: 'إقران جهاز الطفل', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:14,15 01:2,18,23',
  note: 'جهاز الطفل لا يحتاج رقماً ولا بريداً: رمز من 6 خانات صالح 15 دقيقة يظهر على هاتف الأب. حقل واحد فقط وبلا كلام تقني. ثلاث حالات خطأ: رمز خاطئ أو منتهٍ، وجهاز مقترن بعائلة أخرى (للتجربة: OTHER1)، وبلا اتصال.',
  r() { const e = S.ob.perr; if (e === 'other') return obBar(1, 3) + `<div style="padding:24px 6px;text-align:center"><div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('link_off')}</div><p class="ttl">هذا الجهاز مع عائلة أخرى</p><p class="sub">لا يُقرن بعائلتين. على مالك العائلة الأولى أن يفكّ إقرانه من تطبيقه، ثم أعيدوا المحاولة.</p>${btn('رجوع', 'pairBack', 'sec')}</div>`;
    return obBar(1, 3) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${L('اكتب الرمز من هاتف بابا', "Type the code from Dad's phone")}</p><p class="sub" style="text-align:start">${L('بابا يفتح «عائلتي» ويضغط: العائلة ← اسمك ← الجهاز.', "Dad opens the app: Family → your name → Device.")}</p><label class="fld ${e ? 'err' : ''}"><span>${L('الرمز · 6 خانات', '6-character code')}</span><input id="obC" class="mono" dir="ltr" maxlength="6" autocapitalize="characters" style="text-align:center;letter-spacing:10px;font-size:24px;min-height:64px" placeholder="······">${e ? '<small>الرمز غير صحيح أو انتهى وقته. اطلب من بابا رمزاً جديداً.</small>' : '<small>للتجربة: LY4N82</small>'}</label>${offline() ? callout('الجهاز غير متصل. الإقران يحتاج اتصالاً.', 'wa', 'cloud_off') : ''}${btn(L('تابع', 'Continue'), 'obPair', offline() ? '" disabled="' : '')}${callout(L('هذا الجهاز يكون لعائلة واحدة فقط.', 'This device pairs with one family only.'), 'nt', 'link')}</div>`; },
});
surface('ob-consent', {
  t: 'الموافقة المشتركة', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:17 01:5,15',
  note: 'على جهاز الطفل، والأب حاضر: يقرآن معاً ما يُتابَع (فئات لا محتوى)، يؤكد كلٌّ منهما، ثم يكتب الأب رقمه السري فيُحفظ على هذا الجهاز. لا يكتمل الإقران بطرف واحد. «ليس الآن» يوقف الإقران بلا لوم ولا يقفل الجهاز. ما يحدث إن رفض الطفل نهائياً، وصيغة من هم دون 7، بانتظار حكم المالك.',
  r() { const c = S.ob.cons || {};
    if (c.no) return obBar(2, 3) + `<div style="padding:24px 6px;text-align:center"><div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('front_hand')}</div><p class="ttl">لم يكتمل الإقران</p><p class="sub">لا بأس. تحدّثا معاً عمّا يتابعه بابا ولماذا، ثم أعيدا المحاولة. الجهاز لم يُقرن ولم يتغير فيه شيء.</p>${btn('نقرأ مرة أخرى', 'consT:no')}<div class="gap"></div>${btn('نكمل في وقت آخر', 'consLater', 'txt" style="width:100%')}</div>`;
    return obBar(2, 3) + `<div style="padding:8px 6px"><div class="fx" style="justify-content:center;margin-bottom:8px">${av(M.ahmad, 'lg')}${ic('handshake')}${av(M.layan, 'lg')}</div><p class="ttl">نتفق معاً يا ليان</p><p class="sub">اقرآ هذا معاً. بابا سيعرف هذه الأشياء فقط ليبقيكِ بأمان.</p>
    ${list(row('hourglass_top', 'كم وقتاً تستخدمين الجهاز', 'المدة، لا ما تشاهدين بالتفصيل'), row('location_on', 'أين الجهاز', 'ليصل إليك بابا عند الحاجة'), row('forum', 'محادثات العائلة', 'بابا يستطيع رؤيتها'), row('travel_explore', 'نوع المواقع', 'لا كل صفحة'))}
    ${list(row('', 'أنا ليان، فهمت', '', { lead: av(M.layan, 'sm'), tg: !!c.k, ta: 'consT:k' }), row('', 'أنا بابا، شرحت لها', '', { lead: av(M.ahmad, 'sm'), tg: !!c.p, ta: 'consT:p' }))}
    ${btn('بابا يكتب رقمه السري', 'consGo', c.k && c.p ? '' : '" disabled="', 'lock')}<div class="gap"></div>${btn('ليس الآن', 'consT:no', 'txt" style="width:100%')}</div>`; },
});
/* ---------- استرداد الحساب: من فقد الهاتف والرقم (REQ-020 · Q-077) ---------- */
surface('ob-recover', {
  t: 'استرداد الحساب', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:19,20',
  note: 'من جهاز جديد برقم جديد. الشاشة تسأل عن الرقم القديم لتعرف أي حساب يُسترد (المواصفة لم تذكر كيف يُعرَّف الحساب). الطلب يذهب إلى جهة الاسترداد التي حددها صاحب الحساب مسبقاً؛ ولا يُكشف اسمها هنا. من له بريد مضاف يدخل به مباشرة بلا انتظار.',
  r() { const o = S.ob; return obBar(1, 3) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">فقدت هاتفك ورقمك؟</p><p class="sub" style="text-align:start">نعيد لك حسابك برقم جديد، بعد أن يؤكد فرد من عائلتك أنك أنت.</p>
    <label class="fld ${o.rerr ? 'err' : ''}"><span>رقمك القديم</span><input id="obRo" inputmode="tel" dir="ltr" placeholder="77 123 4567" value="${o.old || ''}"><small>${o.rerr ? 'اكتب الرقم الذي كنت تدخل به، بلا الصفر الأول.' : 'الرقم الذي كنت تدخل به إلى «عائلتي»'}</small></label>
    <label class="fld"><span>رقمك الجديد</span><input id="obRn" inputmode="tel" dir="ltr" placeholder="73 555 0199" value="${o.neu || ''}"><small>نرسل إليه رمز تحقق الآن</small></label>
    ${btn('تابع', 'recAsk')}<div class="gap"></div>${btn('سجّلتُ ببريدي أو أضفته من قبل — أدخل به', 'go:ob-email', 'txt" style="width:100%', 'mail')}
    ${callout('ما زال رقمك القديم معك؟ ارجع وادخل به كالعادة، ولا تحتاج إلى الاسترداد.', 'nt', 'info')}</div>`; },
});
surface('recover-wait', {
  t: 'طلب الاسترداد', sys: 'S1-02', p: 'guest', bar: false, nonav: true, req: '02:20',
  note: 'حالتان: بانتظار تأكيد جهة الاسترداد، ثم انتظار 7 أيام يُبلَّغ فيها كل البالغين وأي اعتراض يلغي الطلب. صاحب الطلب يلغيه متى شاء. إن لم يكن للحساب جهة استرداد ولا بريد فالشاشة تقول ذلك صراحة.',
  r() { const st = S.ob.rst || 'pending';
    if (st === 'none') return obBar(0) + `<div style="padding:24px 6px;text-align:center"><div class="bigic" style="background:var(--danger-soft);color:var(--danger)">${ic('person_search')}</div><p class="ttl">لا نستطيع استرداد هذا الحساب</p><p class="sub">لم تُحدَّد له جهة استرداد ولم يُضف إليه بريد قبل فقدان الرقم. حمايةً لعائلتك لا نسلّم الحساب لمن لا نستطيع التأكد منه.</p>${callout('إن استعدت شريحتك القديمة من شركة الاتصالات فادخل بها كالعادة.', 'nt', 'sim_card')}${btn('رجوع', 'back', 'sec')}</div>`;
    return obBar(0) + `<div style="padding:12px 6px"><p class="ttl" style="text-align:start">${st === 'pending' ? 'بانتظار تأكيد عائلتك' : 'بقي 7 أيام'}</p><p class="sub" style="text-align:start">${st === 'pending' ? 'أرسلنا طلبك إلى الفرد الذي اخترته من قبل ليساعدك. اتصل به وأخبره أن يفتح «عائلتي».' : 'أكّد فرد من عائلتك أنك أنت. يعود حسابك برقمك الجديد بعد 7 أيام، ما لم يعترض أحد البالغين.'}</p>
    <div class="card"><div class="tl"><div class="ev ok"><b>أرسلت الطلب</b><span>برقمك الجديد · اليوم</span></div><div class="ev ${st === 'pending' ? 'wa' : 'ok'}"><b>${st === 'pending' ? 'بانتظار تأكيد فرد من عائلتك' : 'أكّد فرد من عائلتك'}</b><span>${st === 'pending' ? 'يصله إشعار على هاتفه' : 'اليوم'}</span></div><div class="ev ${st === 'waiting' ? 'wa' : ''}"><b>انتظار 7 أيام</b><span>يُبلَّغ كل البالغين في العائلة · أي اعتراض يلغي الطلب</span></div><div class="ev"><b>يعود حسابك</b><span>تدخل برقمك الجديد</span></div></div></div>
    ${st === 'pending' ? btn('جرّب: كأن الفرد أكّد', 'recDemo', 'ton') : callout('لماذا 7 أيام؟ ليتمكن أي فرد في عائلتك من إيقاف الطلب إن لم يكن منك.', 'nt', 'timer')}<div class="gap"></div>${btn('ألغِ طلبي', 'recCancel', 'txt" style="width:100%;color:var(--danger)')}</div>`; },
});
surface('recover-review', {
  t: 'طلب استرداد', sys: 'S1-02', p: 'adult', req: '02:20',
  note: 'تظهر لمن اختاره الأب (تأكيد أو رفض بزرّين متكافئين) ولكل بالغ خلال الأيام السبعة (اعتراض)، ولصاحب الحساب نفسه على هاتفه القديم إن كان الطلب من محتال. التحذير صريح: تأكد بالصوت أنه هو، لأن المحتال قد ينتحل اسمه.',
  r() { const q = S.recReq || { st: 'pending', kind: 'num' }, own = isOwner(), k = q.kind || 'num';
    const what = { num: 'يطلب العودة إلى حسابه برقم جديد <span class="ltr b">+967 73• ••• •99</span>', pin: 'نسي رقمه السري ويطلب إنشاء رقم جديد', code: 'دخل من هاتف جديد وليس معه هاتفه السابق' }[k], then = { num: 'يدخل أحمد برقمه الجديد', pin: 'ينشئ أحمد رقماً سرياً جديداً', code: 'يصير هاتف أحمد الجديد موثوقاً' }[k];
    if (q.st === 'cancelled') return empty('cancel', 'أُلغي الطلب', 'لم يتغير شيء في حساب أحمد. أُبلغ كل البالغين.', btn('رجوع', 'back', 'sec'));
    const tl = `<div class="card"><div class="tl"><div class="ev ${q.st === 'pending' ? 'wa' : 'ok'}"><b>${q.st === 'pending' ? 'بانتظار تأكيد سارة' : 'أكّدت سارة الطلب'}</b><span>اليوم</span></div><div class="ev ${q.st === 'waiting' ? 'wa' : ''}"><b>انتظار 7 أيام</b><span>أي بالغ في العائلة يستطيع إيقاف الطلب</span></div><div class="ev"><b>${then}</b><span></span></div></div></div>`;
    if (own) return `${callout(`<b>طلب باسمك:</b> ${{ num: 'العودة إلى حسابك برقم جديد <span class="ltr b">+967 73• ••• •99</span>', pin: 'إنشاء رقم سري جديد', code: 'الدخول من هاتف جديد بلا هاتفك السابق' }[k]} · اليوم 4:10 م`, 'da', 'lock_reset')}${tl}${callout('إن لم تكن أنت من طلب فأوقفه الآن. الإيقاف فوري.', 'wa', 'warning')}${btn('لستُ أنا — أوقف الطلب', 'recObject', 'dng')}<div class="gap"></div>${btn('أنا من طلب', 'back', 'sec')}`;
    return `${callout(`<b>أحمد</b> ${what} · اليوم 4:10 م`, 'wa', 'lock_reset')}
    ${q.st === 'pending' ? `<div class="card"><b>قبل أن تؤكدي</b><div class="sm muted" style="margin-top:6px;line-height:1.9">اتصلي بأحمد أو قابليه وتأكدي بصوته أنه هو من طلب. لا تعتمدي على رسالة مكتوبة: المحتال قد ينتحل اسمه.</div></div><div class="btns">${btn('ليس هو — ارفض', 'recRefuse', 'sec')}${btn('نعم هو — أكّد', 'recConfirm')}</div><p class="c xs muted" style="margin-top:10px">بعد التأكيد تبدأ 7 أيام يُبلَّغ فيها كل البالغين.</p>`
      : `${tl}${callout('إن عرفتِ أن الطلب ليس من أحمد فأوقفيه. الإيقاف يلغي الطلب فوراً.', 'da', 'warning')}${btn('ليس من أحمد — أوقف الطلب', 'recObject', 'dng')}`}`; },
});
/* الأرقام العربية-الهندية والفارسية تُحوَّل إلى لاتينية قبل التحقق من الصيغة (REQ-019) */
const latinDigits = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const phoneOf = id => latinDigits(($(id) || {}).value).replace(/\D/g, '').replace(/^0/, '');
/* بعد التحقق من الرقم: الخادم يعرف هل للرقم حساب. 777000111 = حساب موجود في العرض */
function obAfterOtp() { const o = S.ob; o.otp = ''; o.bad = 0;
  if (o.flow === 'recover') { o.rst = o.old === '770000000' ? 'none' : 'pending'; S.recReq = o.rst === 'none' ? null : { st: 'pending', kind: 'num' }; return go('recover-wait'); }
  if (o.via === 'email' ? /^ahmad@example\.com$/i.test(o.email || '') : o.phone === '777000111') { setPersona('owner'); toast('أهلاً بعودتك يا أحمد', null, 'waving_hand'); return; }
  if (o.flow === 'join' || o.link) return go('ob-join');
  if (o.flow === 'new') return go('ob-family');
  go('ob-choose'); }
Object.assign(ACT, {
  obStart(k) { S.ob = { flow: k || '' }; go('ob-phone'); },
  obWay(v) { const p = $('#obP'), e = $('#obE'); if (p) S.ob.phone = p.value; if (e) S.ob.email = e.value; S.ob.em = ''; S.ob.err = 0; S.ob.eerr = 0; S.stack[S.stack.length - 1] = { id: v === 'email' ? 'ob-email' : 'ob-phone', a: [] }; },
  ccT() { toast('قائمة الدول — اليمن محدد من منطقة الجهاز', null, 'public'); },
  obPhone() { const v = phoneOf('#obP'); S.ob.phone = v; if (!/^7\d{8}$/.test(v)) { S.ob.err = 1; return; } S.ob.err = 0; S.ob.otp = ''; S.ob.bad = 0; S.ob.ch = 0; S.ob.fail = 0; go('ob-otp'); },
  obEmail() { const o = S.ob, v = (($('#obE') || {}).value || '').trim(); o.email = v; if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { o.eerr = 1; return; } o.eerr = 0; o.em = /@down\.test$/i.test(v) ? 'down' : 'sent'; },
  emOpen() { S.ob.em = ''; S.ob.via = 'email'; toast('فُتح الرابط · تم التحقق من بريدك', null, 'mark_email_read'); obAfterOtp(); },
  emAgain() { toast('أُرسل الرابط مرة أخرى', null, 'mail'); },
  emBack() { S.ob.em = ''; },
  emPhone() { S.ob.em = ''; S.stack[S.stack.length - 1] = { id: 'ob-phone', a: [] }; },
  pairBack() { S.ob.perr = 0; },
  otpK(k) { const o = S.ob; if (k === 'b') { o.otp = (o.otp || '').slice(0, -1); return; } o.otp = (o.otp || '') + k; if (o.otp.length < 6) return; if (o.otp === '246810') { o.via = 'phone'; return obAfterOtp(); } o.otp = ''; o.bad = (o.bad || 0) + 1; if (o.bad >= 5) o.lock = 1; },
  otpAuto() { toast('قُرئ الرمز من الرسالة', null, 'sms'); S.ob.via = 'phone'; obAfterOtp(); },
  /* واتساب ← SMS ← مكالمة فائتة؛ وبعد فشل الثلاث حالة صادقة بطريقين للخروج */
  otpNext() { const o = S.ob; o.lock = 0; o.bad = 0; if ((o.ch || 0) >= 2) { o.fail = 1; return; } o.ch = (o.ch || 0) + 1; toast('أُرسل رمز جديد عبر ' + ['واتساب', 'رسالة SMS', 'مكالمة فائتة'][o.ch]); },
  otpRetry() { Object.assign(S.ob, { fail: 0, ch: 0, bad: 0, otp: '' }); toast('أُرسل رمز جديد عبر واتساب'); },
  lcK(k) { const o = S.ob; if (k === 'b') { o.lc = (o.lc || '').slice(0, -1); return; } o.lc = (o.lc || '') + k; if (o.lc.length < 6) return; if (o.lc === '314159') { o.lc = ''; o.lcBad = 0; setPersona('owner'); toast('تم التحقق · هذا الجهاز صار موثوقاً', null, 'verified_user'); return; } o.lc = ''; o.lcBad = 1; },
  lcNone() { confirmDlg('ليس معك جهاز آخر؟', 'تستعمل التطبيق كالعادة. العمليات الحساسة فقط (فكّ إقران، إلغاء تثبيت، إيقاف القواعد) تنتظر حتى تؤكد جهة الاسترداد أنك أنت، ثم 7 أيام يُبلَّغ فيها كل البالغين.', 'اطلب التأكيد', () => { S.recReq = { st: 'pending', kind: 'code' }; setPersona('owner'); toast('أُرسل الطلب إلى سارة', null, 'support'); }); },
  cpy() { toast('نُسخ', null, 'content_copy'); },
  obPick(k, v) { const f = $('#obF'); if (f) S.ob.fam = f.value; if (k === 'open') { S.ob.pick = v; return; } S.ob[k] = v; S.ob.pick = ''; },
  obFam() { const v = ($('#obF') || {}).value.trim(); if (!v) { toast('اكتب اسم العائلة', null, 'error'); return; } S.ob.fam = v; go('ob-done'); },
  obEnter() { S.plan = 'free'; setPersona('owner'); S.full = { id: 'perm-notif', a: [] }; },
  obJoin() { const v = ($('#obJ') || {}).value.trim().toUpperCase(); if (v !== 'MNSR-7K2P') { S.ob.jerr = 1; return; } S.ob.jerr = 0; S.ob.jok = 1; },
  obJoinNo() { S.ob.jok = 0; S.ob.link = 0; },
  obJoinGo() { S.tpl = 'none'; setPersona('delegate'); S.full = { id: 'perm-notif', a: [] }; S.alerts.unshift({ id: 'a' + Date.now(), k: 'perm', kid: null, t: 'انضمت سارة إلى العائلة', s: 'بلا صلاحيات بعد · حدّد ما تراه وتتحكم فيه', ago: 'الآن', p: 3, open: 1 }); audit(`انضمت سارة برمز دعوة بعد توثيق ${S.ob.via === 'email' ? 'بريدها' : 'رقمها'}`, 'identity.family.join'); toast('انضممتِ إلى عائلة المنصور · أُبلغ أحمد ليحدد صلاحياتك', null, 'how_to_reg'); },
  obPair() { const v = ($('#obC') || {}).value.trim().toUpperCase(); if (v === 'OTHER1') { S.ob.perr = 'other'; return; } if (v !== 'LY4N82') { S.ob.perr = 1; return; } S.ob.perr = 0; S.ob.cons = {}; go('ob-consent'); },
  consT(k) { S.ob.cons = S.ob.cons || {}; S.ob.cons[k] = !S.ob.cons[k]; },
  consLater() { S.ob = {}; S.stack = [{ id: 'ob-welcome', a: [] }]; toast('لم يُقرن الجهاز · الرمز يبقى صالحاً حتى ينتهي وقته', null, 'info'); },
  consGo() { pinSetOpen('pair', () => { audit('سُجّلت الموافقة المشتركة عند إقران جهاز ليان', 'identity.device.pair'); setPersona('child'); S.full = { id: 'perm-notif', a: [] }; notif('أهلاً ليان!', 'هذا الجهاز الآن جهازك. الوضع ثابت: وضع الطفل.', 'celebration'); confetti(); }); },
  recAsk() { const o = S.ob, a = phoneOf('#obRo'), b = phoneOf('#obRn'); o.old = a; o.neu = b; if (!/^7\d{8}$/.test(a) || !/^7\d{8}$/.test(b) || a === b) { o.rerr = 1; return; } o.rerr = 0; o.flow = 'recover'; o.phone = b; o.otp = ''; o.ch = 0; o.fail = 0; go('ob-otp'); },
  recDemo() { S.ob.rst = 'waiting'; S.recReq = { st: 'waiting', kind: 'num' }; },
  recCancel() { confirmDlg('إلغاء طلب الاسترداد؟', 'لا يتغير شيء في الحساب. تستطيع الطلب مجدداً لاحقاً.', 'ألغِ الطلب', () => { S.recReq = null; S.ob = {}; S.stack = [{ id: 'ob-welcome', a: [] }]; toast('أُلغي طلب الاسترداد', null, 'cancel'); }, true); },
  recConfirm() { confirmDlg('تأكيد أن الطالب هو أحمد؟', 'تبدأ 7 أيام يُبلَّغ فيها كل البالغين.', 'نعم، هو أحمد', () => { S.recReq = { ...S.recReq, st: 'waiting' }; audit('أكّدت سارة طلب استرداد حساب أحمد', 'identity.recovery'); toast('أكّدتِ الطلب · بدأت الأيام السبعة', null, 'check_circle'); }); },
  recRefuse() { S.recReq = { st: 'cancelled' }; audit('رفضت سارة طلب استرداد حساب أحمد', 'identity.recovery'); toast('رُفض الطلب وأُبلغ كل البالغين', null, 'cancel'); },
  recObject() { confirmDlg('إيقاف طلب الاسترداد؟', 'يُلغى الطلب فوراً ويُبلَّغ كل البالغين. إن كان الطلب من أحمد فعلاً فعليه أن يطلب من جديد.', 'أوقف الطلب', () => { S.recReq = { st: 'cancelled' }; audit(`اعترض ${me().n} على طلب استرداد حساب أحمد فأُلغي`, 'identity.recovery'); toast('أُلغي الطلب', null, 'cancel'); }, true); },
  invShare() { toast('فُتحت قائمة المشاركة · الرسالة فيها الرابط والرمز', null, 'share'); },
  invNew() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', r = n => Array.from({ length: n }, () => A[Math.floor(Math.random() * A.length)]).join(''); S.invs.unshift({ c: r(4) + '-' + r(4), d: 'الآن', left: 7 }); audit('أُنشئت دعوة بالغ جديدة', 'identity.family.invite'); toast('دعوة جديدة جاهزة · الدعوات السابقة ما زالت تعمل'); },
  invRevoke(i) { const x = S.invs[+i]; confirmDlg('إلغاء هذه الدعوة؟', `الرمز ${x.c} لن يعمل بعد الآن. الدعوات الأخرى لا تتأثر.`, 'ألغِها', () => { S.invs.splice(+i, 1); audit('أُلغيت دعوة معلقة', 'identity.family.invite'); toast('أُلغيت الدعوة', null, 'cancel'); }, true); },
  cnSet(k, v) { S.cn.n = ($('#cnN') || {}).value; S.cn[k] = k === 'y' ? +v : v; },
  cnGo() { const c = S.cn, n = ($('#cnN') || {}).value.trim(); if (!n) { toast('اكتب اسم الطفل', null, 'error'); return; }
    if (c.id) { const m = M[c.id]; Object.assign(m, { n, i: c.i, c: c.c, by: c.y }); audit(`عُدّل ملف ${n}`, 'identity.child.profile.edit'); S.cn = null; S.stack.pop(); toast('حُفظ الملف'); return; }
    toast(`أُضيف ${n}`); S.cn = null; S.stack.pop(); go('pair-code', 'new'); },
});
/* ---------- إدارة الأفراد من وضع الأهل ---------- */
surface('add-member', {
  t: 'إضافة فرد', sys: 'S1-02', p: 'adult', req: '02:9,11 04:9,14 03:2',
  note: 'حارس الحصص: عدد الأفراد يُفحص على الخادم. على المجانية (5 أفراد) تظهر الترقية بدل خطأ غامض — جرّب تبديل الخطة من الاستوديو.',
  r() { const cap = PLAN[S.plan].mem, full = Object.keys(M).length >= cap;
    return full ? `<div class="bigic" style="background:var(--gold-soft);color:var(--text)">${ic('groups')}</div><p class="ttl" style="font-size:22px">بلغت حدّ الخطة ${PLAN[S.plan].n}</p><p class="sub">خطتك تتسع لـ${cap} أفراد وعائلتك مكتملة. أفرادك الحاليون يبقون كما هم.</p>${isOwner() ? btn('اعرض الخطط', 'go:plans', '', 'arrow_circle_up') : callout('الترقية للأب فقط.', 'nt', 'lock')}<div class="c" style="margin-top:10px">${avail('requires_upgrade')}</div>` :
      `<button class="card fx" data-a="${can('identity.family.invite') ? 'go:invite' : 'denied:identity.family.invite'}"><span class="av" style="--c:#7A3E65">${ic('person_add')}</span><div class="grow"><b>ادعُ بالغاً</b><div class="sm muted">أمّ، جدّ، عمّ… ينضم برمز دعوة، ثم تحدد أنت ما يراه ويتحكم فيه</div></div>${ic('chevron_right')}</button>
      <button class="card fx" data-a="${can('identity.child.create') ? 'go:child-new' : 'denied:identity.child.create'}"><span class="av" style="--c:#CF5B2C">${ic('child_care')}</span><div class="grow"><b>أضف طفلاً أو مراهقاً</b><div class="sm muted">لا يحتاج رقماً ولا بريداً. تقرن جهازه برمز</div></div>${ic('chevron_right')}</button>${callout('الأطفال يضيفهم الأب أو بالغ سمح له الأب بذلك.', 'nt', 'info')}`; },
});
surface('invite', {
  t: 'دعوة بالغ', sys: 'S1-02', p: 'adult', req: '02:9,10 03:2',
  note: 'رمز عشوائي لكل دعوة، لمرة واحدة، صالح 7 أيام، ويُلغى في أي وقت. الرسالة المشارَكة فيها رابط https يُفتح من واتساب، والرمز مكتوب نصاً لمن نزّل التطبيق بعد الرابط. الدعوات المعلقة كلها ظاهرة وكلٌّ منها يُلغى وحده.',
  r() { const I = S.invs, c = I[0]; return `${c ? `<p class="sub" style="text-align:start">أرسل هذه الدعوة لمن تريد ضمّه. تُستخدم مرة واحدة.</p><div class="code" style="font-size:28px;letter-spacing:5px">${c.c}</div><div class="chips" style="justify-content:center;margin-bottom:14px">${chip('صالحة 7 أيام', 'in', 'schedule')}${chip('لشخص واحد', 'ol', 'counter_1')}</div>
    <div class="card flat" style="margin-bottom:12px"><div class="xs muted" style="margin-bottom:4px">نص الرسالة التي تُرسل</div><div class="sm" style="line-height:1.9">أحمد يدعوك إلى عائلة المنصور في «عائلتي».<br>اضغط: <span class="ltr" style="color:var(--info)">https://‹رابط-المنصة›/i/${c.c}</span><br>أو نزّل التطبيق واكتب الرمز: <span class="ltr b">${c.c}</span></div></div>
    <div class="btns">${btn('انسخ الرمز', 'cpy', 'sec', 'content_copy')}${btn('شارك الدعوة', 'invShare', '', 'share')}</div>` : empty('group_add', 'لا دعوات معلقة', 'أنشئ دعوة لمن تريد ضمّه إلى العائلة.')}
    <div class="gap"></div>${btn('أنشئ دعوة لشخص آخر', 'invNew', 'ton', 'add')}
    ${I.length ? sec('دعوات لم تُستخدم بعد') + list(I.map((x, i) => row('forward_to_inbox', `<span class="ltr mono">${x.c}</span>`, `أُنشئت ${x.d} · تنتهي بعد ${x.left} أيام`, { v: `<button class="btn txt sm" style="color:var(--danger)" data-a="invRevoke:${i}">ألغِها</button>` }))) : ''}
    ${callout('كل من ينضم يوثّق رقم هاتفه أو بريده أولاً، ويُسجَّل انضمامه. يبدأ بلا صلاحيات، ويصلك تنبيه لتحدد ما يراه ويتحكم فيه.', '', 'info')}`; },
});
const tplOf = y => { const a = 2026 - y; return a < 0 || a > 17 ? null : a < 7 ? ['طفل', 'واجهة الصغار', 'child_care', 'بلاطات كبيرة بصور، بلا قراءة'] : a < 13 ? ['طفل', 'واجهة الأطفال', 'face', 'مهام ونجوم ووقت الشاشة'] : ['مراهق', 'واجهة المراهقين', 'person', 'استقلالية أكثر وصفحة «ما يراه أهلي»']; };
surface('child-new', {
  t: id => (id && M[id] ? 'تعديل ملف ' + M[id].n : 'طفل جديد'), sys: 'S1-02', p: 'adult', req: '02:11,12,13,21 03:1',
  note: 'الاسم الذي ينادى به + صورة + لون + سنة ميلاد فقط — لا تاريخ ميلاد كامل ولا رقم ولا بريد. سنة الميلاد تختار الواجهة تلقائياً، والشاشة تقول ذلك بكلام عادي لا بأسماء القوالب. الشاشة نفسها للتعديل: تغيير السنة يعرض ما سيتغير قبل الحفظ.',
  r(id) { const ed = id && M[id]; if (!S.cn || S.cn.id !== (ed ? id : '')) S.cn = ed ? { id, n: M[id].n, i: M[id].i, c: M[id].c, y: M[id].by } : { id: '', n: '', i: 'face_2', c: '#2457A6', y: 2018 };
    const c = S.cn, t = tplOf(c.y), was = ed ? tplOf(M[id].by) : null, ys = Array.from({ length: 18 }, (_, k) => 2026 - k);
    return `<div class="c" style="padding:4px 0 12px"><span class="av xl" style="--c:${c.c};margin:auto">${ic(c.i)}</span></div><label class="fld"><span>اسم الطفل</span><input id="cnN" placeholder="مثال: نور" value="${c.n}"><small>كما تنادونه في البيت. لا نطلب الاسم الكامل، ويظهر داخل العائلة فقط.</small></label>
    <div class="fld"><span>الصورة</span><div class="chips">${['face_2', 'face_3', 'face_4', 'face_5', 'face_6', 'pets'].map(i => `<button class="av" style="--c:${c.i === i ? c.c : 'var(--border-strong)'}" data-a="cnSet:i:${i}" aria-pressed="${c.i === i}">${ic(i)}</button>`).join('')}</div></div>
    <div class="fld"><span>اللون</span><div class="chips">${['#2457A6', '#CF5B2C', '#1F6B3B', '#7A3E65', '#1C6E73', '#9A5B00'].map(x => `<button class="av sm" style="--c:${x};${c.c === x ? 'box-shadow:0 0 0 3px var(--surface),0 0 0 5px ' + x : ''}" data-a="cnSet:c:${x}" aria-label="لون" aria-pressed="${c.c === x}"></button>`).join('')}</div></div>
    <div class="fld"><span>سنة الميلاد</span><div class="chips" style="gap:6px">${ys.map(y => `<button class="chip ${c.y === y ? 'in' : 'ol'}" style="min-height:40px;min-width:62px;justify-content:center" data-a="cnSet:y:${y}" aria-pressed="${c.y === y}">${y}</button>`).join('')}</div><small>السنة فقط، لا اليوم ولا الشهر. من عمره 18 فأكثر ادعُه بالغاً.</small></div>
    <div class="card fx" style="border-color:var(--info)">${ic(t[2])}<div class="grow"><b>${2026 - c.y} سنة · ${t[1]}</b><div class="sm muted">${t[3]} · تتغير وحدها حين يكبر</div></div></div>
    ${ed && was[1] !== t[1] ? callout(`بعد الحفظ تتغير شاشة ${c.n || M[id].n} من «${was[1]}» إلى «${t[1]}»، وتُراجَع القواعد المناسبة لعمره.`, 'wa', 'swap_horiz') : ''}
    ${btn(ed ? 'احفظ' : 'أضف وتابع إلى إقران جهازه', 'cnGo')}`; },
});
surface('pair-code', {
  t: 'إقران الجهاز', sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:14,15 01:2,5,23',
  note: 'رمز من 6 خانات صالح 15 دقيقة ولجهاز واحد. لا يُعرض قبل أن ينشئ الأب رقمه السري، لأنه يكتبه على جهاز الطفل في خطوة الموافقة. ثلاث حالات: رمز سارٍ، رمز انتهى (رمز جديد بنقرة)، وجهاز اقترن. الإقران بمسح رمز QR غير محسوم (GAP-02) فلا يظهر.',
  r(id) { const m = M[id] || { n: 'الطفل الجديد' }, st = S.pcSt || 'live';
    if (!S.pin.set) return empty('pin', 'أنشئ رقمك السري أولاً', 'ستدخله على جهاز الطفل عند الإقران، وهو الذي يحمي إعدادات ذلك الجهاز بعدها.', btn('أنشئ الرقم السري', 'pinChange', '', 'pin'));
    if (st === 'done') return `<div class="bigic" style="background:var(--success-soft);color:var(--success)">${ic('devices')}</div><p class="ttl" style="font-size:22px">اقترن جهاز ${m.n}</p><p class="sub">القواعد وصلت إلى الجهاز وبدأت تعمل.</p>${btn('تم', 'pcDone')}`;
    if (st === 'exp') return `<div class="bigic" style="background:var(--warning-soft);color:var(--warning)">${ic('timer')}</div><p class="ttl" style="font-size:22px">انتهى وقت الرمز</p><p class="sub">الرمز يعمل 15 دقيقة فقط. أنشئ رمزاً جديداً وأدخله على جهاز ${m.n}.</p>${btn('رمز جديد', 'pcSet:live', '', 'refresh')}`;
    return `<p class="sub" style="text-align:start">على جهاز ${m.n}: نزّل «عائلتي» ← «هذا جهاز طفل» ← اكتب هذا الرمز.</p><div class="code">LY4N82</div><div class="chips" style="justify-content:center;margin-bottom:14px">${chip('ينتهي بعد 14:32', 'wa', 'timer')}${chip('لجهاز واحد', 'ol', 'mobile')}</div>
    <div class="card"><div class="tl"><div class="ev ok"><b>أُنشئ الرمز</b><span>الآن</span></div><div class="ev"><b>بانتظار كتابته على جهاز ${m.n}</b><span>أبقِ هذه الشاشة مفتوحة</span></div><div class="ev"><b>تتفقان معاً</b><span>تقرآن ما ستتابعه، ثم تكتب رقمك السري على جهازه</span></div></div></div>${btn('جرّب من جهة الطفل', 'jumpPair', 'ton', 'mobile')}<div class="btns" style="margin-top:8px">${btn('جرّب: انتهى الوقت', 'pcSet:exp', 'txt')}${btn('جرّب: اقترن', 'pcSet:done', 'txt')}</div>`; },
});
Object.assign(ACT, {
  jumpPair() { setPersona('guest'); S.ob = {}; S.stack = [{ id: 'ob-welcome', a: [] }, { id: 'ob-pair', a: [] }]; },
  pcSet(v) { S.pcSt = v; if (v === 'live') toast('رمز جديد · الرمز السابق لم يعد يعمل'); },
  pcDone() { S.pcSt = 'live'; S.unp = {}; back(); },
});
surface('device', {
  t: id => 'جهاز ' + M[id].n, sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:14,15 01:18 10:27 03:20',
  note: 'جهاز مُقترن لعائلة لا يُقترن لأخرى دون فك إقران صريح من الأب برقمه السري. القواعد تتبع الطفل إلى جهازه القادم. بعد الفك يتوقف كل شيء على ذلك الجهاز، والشاشة تقول ذلك قبل التنفيذ. تفاصيل المفاتيح التقنية في «معلومات تشخيصية» لا هنا.',
  r(id) { if ((S.unp || {})[id]) return empty('mobile_off', 'لا جهاز مقترن', `ملف ${M[id].n} وقواعده محفوظة وتنتظر جهازه القادم.`, btn('اقرن جهازاً', can('identity.device.pair') || isOwner() ? 'go:pair-code:' + id : 'denied:identity.device.pair', '', 'devices'));
    return list(row('mobile', 'Samsung Galaxy A14', 'Android 13 · مقترن منذ 2 نوفمبر', { v: chip('متصل', 'ok') }), row('lock', 'وضع الجهاز', 'ثابت · لا يتحول إلى جهاز أهل', { v: M[id].role === 'teen' ? 'مراهق' : 'طفل' })) + list(row('devices', 'اقرن جهازاً آخر', 'جهاز ثانٍ أو بديل · القواعد نفسها تنتقل مع ' + M[id].n, { a: can('identity.device.pair') || isOwner() ? 'go:pair-code:' + id : 'denied:identity.device.pair' }), row('link_off', 'فكّ إقران هذا الجهاز', 'عند بيعه أو استبداله · للأب فقط برقمه السري', { a: isOwner() ? 'go:unpair:' + id : 'denied:identity.device.unpair', ic: 'var(--danger)' })); },
});
surface('child-profile', {
  t: id => 'ملف ' + M[id].n, sys: 'S1-02', p: 'adult', a: ['layan'], req: '02:12,13,27',
  note: 'الملف يُعدَّل من شاشة الإضافة نفسها. تصدير بيانات القاصر للأب. من يبلغ 18 في السنة القادمة يظهر له صف يشرح ما سيحدث.',
  r(id) { const m = M[id], t = tplOf(m.by), e = can('identity.child.profile.edit') || isOwner() ? 'go:child-new:' + id : 'denied:identity.child.profile.edit', x = (S.exp || {})[id];
    return `<div class="c" style="padding:4px 0 12px">${av(m, 'xl')}</div>${list(row('badge', 'الاسم', '', { v: m.n, a: e }), row('palette', 'الصورة واللون', '', { a: e, v: `<span class="av sm" style="--c:${m.c}"></span>` }), row('cake', 'سنة الميلاد', 'السنة فقط', { v: m.by, a: e }), row(t[2], 'الواجهة', 'تتبع العمر وتتغير وحدها', { v: t[1] }))}
    ${2026 - m.by >= 15 ? list(row('event_upcoming', `${m.n} يبلغ 18 في ${m.by + 18}`, 'ماذا يحدث لملفه وجهازه؟', { a: 'go:age-up:' + id })) : ''}
    ${isOwner() ? list(row('download', 'نسخة من بيانات ' + m.n, x === 'ready' ? 'جاهزة للتنزيل' : x ? 'قيد التجهيز' : 'ملف يُجهَّز ويصلك رابطه', { a: 'go:export:' + id })) : ''}`; },
});
surface('age-up', {
  t: id => 'حين يبلغ ' + M[id].n + ' 18', sys: 'S1-02', p: 'adult', a: ['khaled'], req: '02:13', st: 'un',
  note: 'ناقص في الحوكمة (يحتاج حكم المالك): Q-250 يجعل من يبلغ 18 بالغاً تلقائياً ويلغي منحه، لكن ملفه بلا رقم ولا بريد وجهازه ثابت على وضع الطفل، فلا طريق مكتوب ليصير حساباً بالغاً. المعروض هنا اقتراح، لا حكم.',
  r(id) { const m = M[id]; return `${callout('<b>غير محسوم:</b> هذه الشاشة اقتراح ينتظر حكم المالك.', 'wa', 'help')}<p class="sub" style="text-align:start">في 1 يناير ${m.by + 18} يصير ${m.n} بالغاً. القواعد على جهازه تتوقف، ولا يبقى ملفه ملف طفل.</p><div class="card"><div class="tl"><div class="ev"><b>قبلها بشهر: يصلك تذكير</b><span>لتتحدث معه وتختار</span></div><div class="ev wa"><b>تفكّ إقران جهازه</b><span>برقمك السري · يصير هاتفاً عادياً</span></div><div class="ev ok"><b>تدعوه بالغاً</b><span>يدخل برقم هاتفه هو، وتحدد ما يراه</span></div></div></div>${callout('محادثاته ومهامه السابقة تبقى في العائلة. سجل مواقعه وقواعد جهازه تُحذف.', 'nt', 'info')}`; },
});
surface('minor-chats', {
  t: id => 'محادثات ' + M[id].n, sys: 'S1-08', p: 'adult', a: ['layan'], req: '08:4,13',
  r(id) { const cs = Object.keys(CH).filter(k => CH[k].mem.includes(id)); return callout('تُعرض للقراءة فقط. ' + M[id].n + ' ' + vb(M[id], 'يعلم', 'تعلم') + ' أن محادثاته مرئية للأب.', 'nt', 'visibility') + list(cs.map(k => row(CH[k].i || 'chat', chName(k, id), lastMsg(k), { a: 'openCh:' + k }))); },
});
