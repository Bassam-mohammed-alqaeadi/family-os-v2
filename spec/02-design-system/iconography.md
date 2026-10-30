# الأيقونات (Iconography)

> الحالة: معتمد للتنفيذ | القرارات: D-016, D-018 | يعتمد على: color-tokens.md §6, spacing-and-grid.md §10, accessibility-and-localization.md

## 1. المبادئ
1. **الأيقونة تدعم النص ولا تحل محله** إلا في الأيقونات المتعارف عليها عالميًا وللأطفال الصغار، وكل أيقونة تفاعلية لها اسم قابل للقراءة آليًا.
2. **أسلوب واحد:** خطوط مستديرة الأطراف، حواف ناعمة، تفاصيل قليلة، يشبه شخصية العلامة (دافئ وموثوق).
3. **المعنى أولًا:** لا أيقونة ذات دلالة ثقافية ملتبسة. تُراجع مع الفريق الثقافي (brand-and-logo §7).
4. **أيقونة واحدة لمعنى واحد** عبر التطبيق (SOS دائمًا نفس الأيقونة).
5. **كلفة منخفضة:** تُحزَّم الأيقونات المستخدمة فقط (tree-shaking).

## 2. المصدر والبنية
- **المجموعة الأساسية:** Material Symbols (نمط Rounded، ترخيص Apache 2.0) كمصدر للأيقونات العامة، تُستخرج كـ SVG/خط مجزّأ يحوي المستعمل فقط.
- **المجموعة الخاصة بالعلامة (Custom):** تُرسم لمفاهيم المنتج التي لا تغطيها العامة (مجال §5) بنفس الشبكة والسُمك، وتُسلَّم SVG بتسمية موحدة.
- **السجل المطبوع (`FosIcons`):** تعداد مطبوع (typed) هو المدخل الوحيد في الشيفرة؛ ممنوع `Icons.*` المباشر أو مسارات SVG خارجه (lint).
- **التسمية:** `domain.name` (مثل `nav.home`, `safety.sos`, `role.parent`, `status.locked`)، وتُولَّد منها الثوابت.
- كل أيقونة في السجل: المعرّف، الأصل (عامة/خاصة)، هل يُعكس في RTL (`mirror: true/false`)، الاسم الدلالي بمفاتيح i18n.

## 3. المواصفات التقنية
| البند | القيمة |
|---|---|
| شبكة الرسم | 24×24 مع مساحة آمنة 2dp |
| سُمك الخط | 2dp عند 24 (يتناسب مع الحجم) |
| الأطراف والزوايا | مستديرة |
| الأحجام (dp) | 16، 20، **24 (افتراضي)**، 32، 48 |
| الأحجام للأطفال | 32 و48 و64 كحد أدنى في الأزرار الأساسية |
| الحالات | **خطّية (غير محددة)** و**ممتلئة (محددة/نشطة)** |
| الألوان | من الأدوار الدلالية فقط (`icon.default`, `icon.on-primary`, `icon.success`...) |
| الوضع الداكن | نفس الشكل بألوان الأدوار |
| منطقة اللمس | تمتد للحد الأدنى للملف (spacing §3) |
- التحديد في شريط التنقل: الانتقال من خطّي إلى ممتلئ مع لون `primary`، ولا يعتمد على اللون وحده (الشكل يتغير).

## 4. الاتجاه (RTL)
- **تُعكس:** ما يدل على اتجاه أو تقدم (رجوع، تالي، إرسال، قوائم بنقاط، تراجع/إعادة، سحب، طي).
- **لا تُعكس:** ساعة، علامة صح/إغلاق، بحث (العدسة يميل بحسب الأصل لكن تُعكس عدسة البحث عند الاتجاه الأيمن كما في توصيات المنصات)، الأيقونات الواقعية (سيارة، منزل)، الشعارات، علامات الوسائط (تشغيل عادة لا تُعكس).
- حقل `mirror` إلزامي لكل أيقونة وفحص golden RTL/LTR.

## 5. الفهرس الأساسي (الحد الأدنى لكل مجال)
| المجال | أمثلة (المعرّف) |
|---|---|
| **التنقل** | `nav.home`, `nav.family`, `nav.chat`, `nav.controls`, `nav.more`, `nav.learn`, `nav.rewards`, `nav.me`, `nav.map` |
| **الأدوار والأفراد** | `role.owner`, `role.adult`, `role.teen`, `role.child`, `member.add`, `member.invite`, `member.switch` |
| **السلامة** | `safety.sos`, `safety.alert`, `safety.shield`, `safety.geofence`, `safety.check_in`, `safety.emergency_contact` |
| **الموقع** | `location.pin`, `location.share`, `location.history`, `location.place_home`, `location.place_school` |
| **التواصل** | `chat.message`, `chat.group`, `chat.attachment`, `chat.voice`, `chat.call`, `chat.video` |
| **التحكم والإعدادات** | `control.settings`, `control.template`, `control.rule`, `control.schedule`, `control.lock`, `control.exception`, `control.audit`, `control.undo` |
| **الحالات الصادقة (D-018)** | `status.available`, `status.unavailable_on_device`, `status.pending_approval`, `status.not_delegated`, `status.disabled_by_owner`, `status.requires_upgrade`, `status.coming_soon` |
| **الموافقات** | `approval.request`, `approval.approve`, `approval.deny`, `approval.expired` |
| **الخدمات** | `service.screen_time`, `service.content`, `service.apps`, `service.rewards`, `service.tasks`, `service.calendar`, `service.ai`, `service.education`, `service.religion` |
| **المكافآت** | `reward.star`, `reward.badge`, `reward.level`, `reward.gift`, `reward.points` |
| **الحساب والدفع** | `account.profile`, `account.plan`, `account.privacy`, `account.language`, `account.export`, `account.delete` |
| **الجهاز** | `device.phone`, `device.tablet`, `device.battery`, `device.offline`, `device.permission` |
| **عام** | `action.add`, `action.edit`, `action.delete`, `action.search`, `action.filter`, `action.share`, `action.copy`, `action.close`, `action.back`, `info.help`, `info.why` |
- **ملاحظة «لماذا؟»:** أيقونة `info.why` موحدة تفتح شرح مصدر القيمة (control-and-settings-architecture §4.4).

## 6. حساسية الدين والثقافة
- أيقونات المحتوى الديني **محايدة بنيويًا** (كتاب، نجمة/هلال حيث يلزم لوحدة إسلامية، مصباح، قلب)، ولا تصوير لأشخاص دينيين أو رموز مقدسة في أيقونات الواجهة، ويُراجَع كل رمز مع مجلس المراجعة (AI-004).
- وحدات المحتوى لأديان أخرى لاحقًا لها رموزها الخاصة بمراجعة محلية، لا تعميم رمز واحد.
- اللباس والأشخاص في الأيقونات: تجريد (صور ظلية) أو متنوع، ولا نمطية أدوار (الأم/الأب).

## 7. الأيقونات المتحركة والرسوم
- متحركة (Rive/Lottie) لمفاعيل الأطفال والمكافآت فقط، بحد أقصى 100KB للأيقونة المتحركة، وتوقف عند «تقليل الحركة» وعلى الأجهزة المنخفضة (motion-and-feedback §8).
- الرسوم التوضيحية (Illustrations) منفصلة عن الأيقونات، ومصدرها brand-and-logo §7.

## 8. الرموز التعبيرية (Emoji)
- تُستخدم رموز النظام (لا استبدال مخصص) في المحادثات، وتُراجَع في سياقات الأطفال.
- لا اعتماد على emoji كأيقونات واجهة (اختلاف الأنظمة والدعم).

## 9. الوصول
- كل أيقونة تفاعلية: `Semantics(label)` من i18n؛ الزخرفية `excludeSemantics`.
- لا معنى بالأيقونة وحدها في الحالات الحرجة (نص مصاحب).
- تباين الأيقونة ≥ 3:1 مع الخلفية (color-tokens §4).

## 10. معايير القبول
1. DS-IC-01: لا استخدام لأيقونة خارج `FosIcons` (lint يمنع `Icons.*` وSVG المباشر).
2. DS-IC-02: كل أيقونة في السجل لها `mirror` واسم دلالي مترجم، واختبار يفشل عند غيابها.
3. DS-IC-03: golden لكل أيقونة بالحالتين (خطّي/ممتلئ) واتجاهي RTL وLTR والوضعين.
4. DS-IC-04: حزمة الأيقونات تحوي المستخدم فقط ويُقاس أثرها على الحجم.
5. DS-IC-05: أيقونات الحالات الصادقة السبع موجودة وموحدة في كل المكوّنات (اختبار تغطية).
6. DS-IC-06: مراجعة ثقافية ودينية موثقة قبل الإطلاق في كل دولة (ترتبط بـ B-003 وAI-004).
7. DS-IC-07: حجم الأيقونات المتحركة ≤ الحد وتتوقف عند تقليل الحركة.

## 11. مسائل مفتوحة
- **I-001:** مدى حاجة مجموعة خاصة كاملة مقابل تكييف Material Symbols (يُقرَّر بعد نموذج التصميم).
- **I-002:** ترخيص وتحزيم Rive/Lottie وبدائلها.
