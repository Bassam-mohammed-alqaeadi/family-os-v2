# تقرير البحث: آليات الخطط والاشتراكات والدفع في التطبيقات المرجعية (لـ S1-04)

**المنهج:** قراءة مباشرة للكود المفكك (`~/workspace/rework/<app>/jadx-out/sources/` + `apktool-out/res/values/strings.xml` + `ts-sources` لـ Qustodio) ووثائق deep-dives (`family-os-gov/docs/family-os/deep-dives/`) ومواصفة الفرع القديم S1-04 (مرجع فقط) وبحث Q-025 السابق.

**تنبيه منهجي:** مسار `benchmarks/extracted/<app>/` المذكور في المهمة **غير موجود** في هذا الفرع (`benchmarks/` محذوف بأمر المالك 2026-11-06 — Q-172)؛ والمسار البديل الموثوق هو الأشجار المفككة محلياً (`~/workspace/rework/<app>/`) + فهارس `docs/family-os/extracted/`. **لا سعر ثابت واحد** وُجد في كود أي تطبيق — كل الأسعار خادم-المنشأ (Play Billing ProductDetails أو `%1$s`).

---

## 1. الخطط والاشتراكات لكل تطبيق

### Qustodio — 3 مستويات + إضافة (الأغنى توثيقاً)
- **Free:** جهاز واحد، حماية أساسية. **Basic Premium:** حتى 5 أجهزة، المزايا الأساسية (حظر الألعاب والتطبيقات، تتبع الموقع، تصفية الويب). **Complete Premium:** أجهزة غير محدودة + كل مزايا Basic + مراقبة المكالمات والرسائل + قواعد مخصصة للويب والتطبيقات والألعاب + مراقبة YouTube + دعم هاتفي ذو أولوية + فريق Care Plus. (نص حرفي من `ts-sources/src/components/Upgrade/FrequentlyAskedQuestions/FrequentlyAskedQuestions.tsx`).
- **الترخيص خادم-المنشأ:** `LicenseType` = Free / Trial / Premium؛ و`LicenseSubtype` = free / free_no_daily_limits / premium_grandfather / premium_basic / premium_custom_basic / premium_complete / trial / trial_with_subscription (`businessLogic/license/licenseType.ts` + `licenseSubtype.ts`).
- **حارس حصة الأجهزة في الكود:** `license.maxDevices` + `devicesCount > maxDevices` → نافذة تجاوز الحد + ترقية لبقة (`selectors/entitySelectors/account.ts` + `components/Modal/DeviceOverLimitModal.tsx`).
- **إضافة Care Plus:** منتج إضافي (`businessLogic/products/addons/carePlus.ts`) — دعم مخصص.
- **التجربة:** مدة التجربة خادم-المنشأ (`licenseDaysLeft`) — لم يُعثر على عدد الأيام في كود العميل.
- **مسار الدفع:** `v1/payment/{provider}` + `initPurchase` + `activateRetrial` (آلية إعادة تجربة!) — deep-dive qustodio.md سطر 347.

### FamiSafe — مستوى واحد "Premium" + خيارات مدة + دائم
- **SKUs** (`share/payment/BillingConstants.java`): `SKU_GOLD_MONTHLY` / `SKU_GOLD_QUARTERLY` / `SKU_GOLD_YEARLY` + `SKU_KIDS_MONTHLY/QUARTERLY/YEARLY` + `SKU_LIFETIME_SUB` (اشتراك دائم — منتج غير استهلاكي INAPP) + `SKU_ANNUAL_FIRST_COUPON` + `SKU_MONTHLY_DEFAULT`؛ ومعرّفات منتجات: `famisafe_monthly/quarterly/yearly_subscription` (+ نسخ `_uac_` و`_kids_` و`_first_coupon` و`price_adjustment_yearly`).
- **حصة الأجهزة:** "Premium supports up to %s devices" + "Protect up to 10 devices with all features" + "Device limit reached" — **10 أجهزة**.
- **التجربة:** 7 أيام ("Connect a device, then get a 7-day free trial") + سلسلة `free_trial_3_day` موجودة أيضاً.
- **المدد:** Yearly / Monthly / Quarterly (`payment_item1/2` + `quarterly`).
- **الفوترة:** Google Play Billing 9.1.0 + تحقق خادمي `POST v{1,5}/payment/notify` + `GET v1/member/subscription` (deep-dive famisafe.md).

### FamilyWall — مستوى واحد Premium يغطي الدائرة كلها (مقعد عائلي)
- **نموذج المقعد العائلي:** اشتراك Premium واحد يغطي كل أفراد الدائرة وأجهزتهم؛ `CircleInfo{familyId, isPremium, memberCount, ...}` + `isFWPremiumMemberSubscriber` (deep-dive familywall.md).
- **بوابة المزايا:** `Features.java` — enum بكل ميزة ومزاياها الفرعية: Calendar / Google Calendar / Family View / Geotracking / Activity / Contact / Geofencing / STORAGE (تخزين موسّع — بلا حجم محدد في العميل) / Meal Planner / Recipe Box / Gallery / Timetable / Filer / Special Days / BUDGET (تتبع مصاريف + حدود ميزانية + تحليلات) / Video/Audio / Video / Pick Me Up / Temp Location / ALL_CIRCLE / Lists / Messages / Repeating Tasks / Event Email Import. كل ميزة لها شاشة ترقية (interstitial) خاصة.
- **خطأ مسمى:** `FizApiPremiumRequiredException` — الخادم يرفض الميزة المميزة.
- **حزمة فوترة:** `billing` (26 ملفاً) + `PremiumFizInterface` + `BillingClientCannotConnectException`.
- **التجربة:** لم تُعثر على سلاسل تجربة في strings.xml — غير موثقة في العميل.

### Life360 — 4 مستويات (أوضح مصفوفة مزايا)
- **Free:** سجل موقع يومان. **Silver:** سجل 7 أيام. **Gold:** سجل 30 يوماً + حماية سرقة هوية حتى $25K + مساعدة أعطال الطريق. **Platinum:** سجل 30 يوماً + حماية سرقة هوية حتى $1M + مساعدة أعطال أوسع + إرسال طوارئ SOS على مدار الساعة.
- **التجربة:** 7 أيام مجانية ("7 day free trial. Then %1$s/month").
- **الدفع:** شهري/سنوي؛ الأسعار عناصر نائبة خادم-المنشأ (`%1$s/month`).
- **خطة عائلية:** العضوية تغطي الدائرة كلها ("Then %1$s/month — covers everyone in your Circle").
- **تدهور لبق عند الانتهاء:** بعد انتهاء العضوية تُقيَّد تنبيهات الأماكن بعد تاريخ محدد (لا قفل فوري).

### Bark — بلا فوترة داخل التطبيق
- صلاحية `com.android.vending.BILLING` معلنة + مكتبة Play Billing موجودة في الـ APK، **لكن لا منطق اشتراك ولا سلاسل خطط/أسعار في الكود المفكك ولا في strings.xml** — البيع عبر الويب (bark.us). التطبيق الأب لوحة تحكم خالصة.

### Quizlet — Quizlet Plus / Plus Unlimited + Superwall
- **الخطط:** Quizlet Plus وPlus Unlimited (جولات تدريب غير محدودة + حلول + إلغاء الإعلانات ضمنياً).
- **الدفع:** **Superwall paywall SDK** (`com/superwall` + `com/quizlet/superwall`) — التطبيق الوحيد الذي يستخدم Superwall؛ + نموذج محلي `db/billing/model/DBSubscription.java` + صلاحية BILLING.
- **التجربة:** خطة سنوية مع تجربة مجانية ("annual_plan_info_with_free_trial").
- **مسار ويب:** "Upgrade to Quizlet Plus Unlimited on Quizlet.com" — ترقية عبر الويب ممكنة.

### Muslim Pro — Premium + عملة افتراضية (Crescents)
- **الخطط:** "All Premium Plans" — خطط Premium (مددها خادم-المنشأ).
- **Crescents (عملة افتراضية):** نجوم Stars تُحوَّل إلى Crescents ("Convert Stars to Crescents")؛ وCrescents **قابلة للشراء** ("How many Crescents would you like to buy?")؛ وتُستبدل مجاناً بـ Premium ("Redeem Premium for free with your Crescents!") وبالتبرعات وبالقسائم ("Play to win vouchers and rewards!")؛ و"Claim Premium gift without payment".
- **التجربة:** سلسلة "Day %s: Trial Ends" موجودة.

### Telegram — Telegram Premium + Stars
- **Telegram Premium** موثّق في الكود (`PremiumPreview` UI)؛ و**Telegram Stars** (`StarsController`) عملة داخل التطبيق للهدايا والمحتوى المدفوع. الأسعار خادم-المنشأ؛ وstrings.xml المفكك لا يحمل سلاسل Premium (8.6KB فقط — السلاسل في الكود).

---

## 2. آليات الدفع (ما ظهر فعلاً في الكود)

| الآلية | التطبيقات | الدليل |
|---|---|---|
| **Google Play Billing** | Qustodio، FamiSafe، FamilyWall، Life360، Quizlet (عبر Superwall)، Bark (صلاحية فقط) | Qustodio: `cc/fovea/PurchasePlugin.java` (BillingClient كامل: ProductDetails + consume + acknowledge)؛ FamiSafe: `BillingCatalogConfig` + Billing 9.1.0؛ FamilyWall: `premium/` + `BillingClientCannotConnectException`؛ Quizlet: `DBSubscription` + BILLING |
| **Superwall paywall SDK** | Quizlet فقط | `com/superwall` + `com/quizlet/superwall` |
| **RevenueCat** | لا أحد | صفر نتيجة في كل الأشجار الـ 8 |
| **Stripe SDK** | لا أحد | صفر — نتائج "stripe" كلها إيجابيات كاذبة (Guava `Striped`) |
| **تحقق خادمي من الإيصالات (S2S)** | FamiSafe، Qustodio | FamiSafe: `POST v{1,5}/payment/notify`؛ Qustodio: `v1/payment/{provider}` |
| **دفع عبر الويب** | Qustodio (صفحة ترقية)، Quizlet (quizlet.com)، Bark (bark.us) | نصوص الترقية + غياب الفوترة داخل التطبيق في Bark |

---

## 3. القسائم والفاوتشرات والتعبئة

- **FamilyWall:** زر "Promo code?" — أكواد ترويجية (Play Billing promo codes).
- **Life360:** عضوية ذهبية **مهداة** تُستبدل عبر البريد الوارد ("Redeem membership" / "gift has already been redeemed").
- **FamiSafe:** SKUs بكوبون أول (`SKU_ANNUAL_FIRST_COUPON` + `famisafe_monthly_first_coupon_subscription`) — عروض تمهيدية عبر Play Billing.
- **Muslim Pro:** قسائم كمكافآت ("Play to win vouchers and rewards!") + استبدال Crescents.
- **لا تعبئة (top-up packs) ولا قسائم وكلاء ولا حزم رسائل في أي تطبيق.**

---

## 4. الحصص المستهلكة (كيف تُحسب وتُعرض)

- **حصة الأجهزة (الحصة الأساسية في هذا المجال):** Qustodio `maxDevices` (1 / 5 / غير محدود — خادم-المنشأ) مع نافذة تجاوز لبقة؛ FamiSafe 10 أجهزة ("Premium supports up to %s devices").
- **أيام سجل الموقع:** Life360 (2 / 7 / 30 يوماً حسب المستوى).
- **تنبيهات الأماكن:** Life360 تُقيَّد بعد انتهاء العضوية.
- **التخزين:** FamilyWall ميزة STORAGE مميزة (تخزين موسّع — بلا حجم رقمي في العميل).
- **لا حصة رسائل نصية (SMS) ولا حصة رسائل ولا حصة ذكاء اصطناعي في أي تطبيق** (بحث `sms*quota|quota*sms` = صفر).

---

## 5. ما الذي لا يوجد إطلاقاً (بحث سلبي موثّق)

1. **لا تطبيق يدعم محافظ محلية** — بحث `onecash|mahfathati|jawaly|floosak` في كل الأشجار الـ 8 = **صفر**.
2. **لا دفع يدوي مسبق عبر وكلاء** في أي تطبيق.
3. **لا بيع حزم رسائل (SMS packs)** في أي تطبيق.
4. **لا تجديد يدوي مُصمم** — كل التطبيقات تفترض تجديداً تلقائياً عبر المتجر.
5. **لا تسعير حسب الدولة/العملة** في كود العميل — الأسعار خادم-المنشأ بالكامل.

---

## 6. الخلاصة: ما يُعاد استخدامه في S1-04، وما هو تركيب جديد

### قابل لإعادة الاستخدام فعلياً (موثّق بالكود)
1. **الترخيص خادم-المنشأ + الاستحقاقات من الخادم** (Qustodio `licenseType/maxDevices`؛ FamilyWall `isPremium` على الدائرة؛ FamiSafe `GET v1/member/subscription`) → أساس Q-055 (الخطط أعلام مزايا + حصص قابلة للتعديل بلا كود).
2. **حارس الحصة مع ترقية لبقة** (Qustodio: `devicesCount > maxDevices` → نافذة تجاوز + FAQ) → نمط QuotaGuard في S1-04.
3. **مقعد عائلي واحد** (FamilyWall Premium يغطي الدائرة؛ Life360 العضوية تغطي الدائرة) → اشتراك عائلي واحد.
4. **مصفوفة مزايا حسب المستوى** (Life360: أيام السجل + مبالغ حماية الهوية؛ FamilyWall: enum المزايا) → مصفوفة خطط S1-04.
5. **التجربة المجانية 7 أيام** (FamiSafe + Life360) + **إعادة التجربة** (Qustodio `activateRetrial`).
6. **التحقق الخادمي من الإيصالات** (FamiSafe `payment/notify`؛ Qustodio `payment/{provider}`) → لا تحقق محلي من الإيصالات.
7. **التدهور اللبق عند الانتهاء** (Life360: تقييد تدريجي لا قفل فوري).
8. **آليات ترويجية كبذرة لنموذج القسائم:** أكواد FamilyWall الترويجية + عضوية Life360 المهداة + كوبون FamiSafe الأول + Crescents في Muslim Pro (عملة افتراضية قابلة للكسب والشراء والاستبدال).
9. **Play Billing قناة أولى + الويب قناة ثانية** (كل التطبيقات).
10. **الاشتراك الدائم كخيار** (FamiSafe `SKU_LIFETIME_SUB`) — سابقة لخيار شراء لمرة واحدة إن أُريد لاحقاً.

### تركيب جديد من عندنا (لا سابقة له في أي تطبيق)
1. **اليمن: محافظ + قسائم وكلاء + تفعيل يدوي مسبق الدفع** (Q-025) — لا تطبيق يفعل أياً منها؛ وكل التطبيقات تفترض تجديداً تلقائياً عبر المتجر.
2. **حصص SMS مع تعبئة** (Q-106) — لا تطبيق يقيس الرسائل ولا يبيع حزم رسائل.
3. **الخطط كأعلام مزايا قابلة للتعديل بلا كود** (Q-055) — النمط (استحقاقات من الخادم) موجود، لكن لوحة تعديل الخطط بلا كود من عندنا.
4. **تسعير حسب الدولة/العملة وسوق مزدوج (اليمن + الخليج معاً)** — لا سابقة.
5. **اشتراك هجين (Play حيث ينجح + يدوي حيث لا ينجح)** — لا سابقة.

### ملاحظات صدق على مرجع الفرع القديم S1-04
- مواصفته (9 ملفات) تدّعي: Free Starter + Family Premium (شهري/سنوي)؛ وعد أمان مجاني للأبد (D-025)؛ تراجع لبق (BR-BIL-003)؛ تحقق S2S؛ QuotaGuard؛ `plans_catalog` + `family_subscriptions` + كاش Redis `quota_state` — **الأفكار سليمة، لكن استشهاداته `[REF: benchmarks/extracted/...]` تشير لمسارات غير موجودة في هذا الفرع (Q-172) — والمسار البديل: الأشجار المفككة محلياً (`~/workspace/rework/<app>/`) + فهارس `docs/family-os/extracted/` — فلا يمكن التحقق منها من الفرع وحده هنا؛ وقد تحققتُ مستقلاً من ادعائيه الجوهريين في الكود (حارس حصة أجهزة Qustodio؛ المقعد العائلي في FamilyWall).
- المواصفة القديمة تؤجل Stripe للمرحلة 6 وتستشهد بقرارات أشباح D-014…D-018 (ملغاة بـ Q-004) وD-031 (مستبدَل بـ Q-005) — **قديمة مقابل حكم Q-025** (اليمن = محافظ، الخليج = Play Billing أو بطاقات عبر Tap/Moyasar).

**ملاحظة تنفيذية:** لم يفشل أي أمر تنفيذي مؤثر؛ وgrep الذي أعاد exit code 1 كان "لا نتائج مطابقة" فقط (نتيجة سلبية موثقة لا خطأ).
