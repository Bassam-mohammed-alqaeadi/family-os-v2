# تقرير الهندسة العكسية — Wondershare FamiSafe

## 1. نظرة عامة
- **الحزمة:** `com.wondershare.famisafe` — رقابة أبوية (Parental Control)؛ compileSdk 36.
- **تحذير معماري حاسم:** هذا الـ APK هو تطبيق **الأب (Parent)** فقط —
  `ParentApplication` وكل الأنشطة تحت `parent.*`. **كود التنفيذ على جهاز الطفل
  (`DeviceAdmin` / `AccessibilityService`) غير موجود هنا إطلاقًا**: لا توجد أي إشارة لـ
  `AccessibilityService` أو `DeviceAdminReceiver` أو `BIND_DEVICE_ADMIN` في كامل المصادر.
  التنفيذ يعيش في تطبيق الطفل (FamiSafe Jr) الذي **لم يُفكك**.
  ما يُعاد استخدامه هنا: **نموذج القواعد، ترميز الجداول، الشبكة، عقد IPC، وواجهات الأب**.
- **الدور في Family OS:** وحدة **الحماية والصلاحيات**: حدود وقت الشاشة، حظر التطبيقات،
  تصفية الويب، السياج الجغرافي، الإشراف على YouTube/WhatsApp، زر SOS.
- **حجم المخرجات:** ~17,110 ملف Java؛ أخطاء jadx = 150 (~1.1% — طبيعية).
  تشويش جزئي (حزم `a`، `b`، ملفات `f.java`) لكن `parent/` و`common/bean` مقروءة جيدًا.
  كوتلن بكثافة (خاصة `screenv5`).

## 2. البنية المعمارية
- **الأب** (`com.wondershare.famisafe.parent.*`): كل الميزات —
  `screenv5` (وقت الشاشة: `applimit`، `screenlimit`، `schedule`، `usage`، `supervised`)،
  `apprules` (`adapter`/`bean`/`constants`/`fragment`)، `appusage`، `location`، `filter`،
  `dashboard80`، `youtube`، `explicit`، `nsfw`، `drive`، `whatsapp`، `screenviewer`، `pin`،
  `report`/`report80`، `sms`، `callmessage`، `audio`، `browser`، `guide`، `connect`، `notify`، `nps`.
- **المشترك** (`com.wondershare.famisafe.common.*`): `network` (عميل Retrofit)،
  `bean` (**مئات** نماذج البيانات)، `ipc`، `data`، `config`، `map`/`mapbox`، `webrtc`،
  `klog`، `util`، `pay`، `language`، `analytical`.
- **الحسابات** (`com.wondershare.famisafe.share.*`): `account` (دخول/تسجيل/تحقق بريد/ضيف)،
  أنشطة WebView.
- **لوحة البطاقات** (`parent/dashboard80`): `card/` (حاملون) + `card/registry` +
  `card/runtime` + `card/model` + `adapter` — **معمارية بطاقات قابلة للتسجيل** للوحة الأب
  (البطاقات تُسجَّل ديناميكيًا بدل ترميزها).
- **النمط العام: تطبيق هجين** — `TotalWebActivity`، `H5WebActivity`، `CommonWebActivity`:
  شاشات كثيرة صفحات H5 داخل WebView (سرعة تطوير على حساب الأداء).

### التدفق المعماري المستنتج
من الأسماء والـ manifest: الأب يحرر القواعد ← تُسلسل (`DeviceRuleBean`) ←
السيرفر (`data-api.famisafe.com`) ← تُدفع لتطبيق الطفل ← **التنفيذ هناك**
(غير مرئي في هذا التحليل — **فجوة معلنة**).

## 3. الميزات الرئيسية وربطها بوحدات Family OS
- **وقت الشاشة** (`parent/screenv5`): حدود التطبيقات (`AppLimitSetActivity`)،
  حد الشاشة (`ScreenLimitActivity`)، الجداول (`ScheduleAddActivity`)،
  الاستخدام (`UsageBlockActivity`/`AppBlockAndroidActivity`)،
  الإشراف (`SupervisedAppSetActivity`) ← **محرك الصلاحيات**.
- **قواعد التطبيقات** (`parent/apprules`: `AppRulesSettingActivity`، `AppLimitCategoriesActivity`) ← الصلاحيات.
- **تصفية الويب** (`parent/filter`: `WebFilterFragment`، `WebFilterEditMode` +
  `common/bean/WebFilterBean`/`WebFilterDataBean`) ← الحماية.
- **السياج الجغرافي** (`parent/location/geofence`: `GeofencesDetailActivity`، `AddPlaceActivity` +
  `common/bean/GeoFenceBean`: `geo_fence_name`، `latitude`/`longitude` (نص)، `radius`،
  `last_transition`، `last_log_time` + `LocationFrequencySettingsBean`، `ScheduleLocationBean`) ← الأمان.
- **أمان القيادة** (`parent/drive`: `DriveSetActivity`، `DriveSpeedSetActivity`، `DriveDetailMapActivity`) ← الأمان.
- **زر SOS** (`parent/location/SosSwitchActivity`) ← الأمان.
- **الإشراف على YouTube** (`parent/youtube`، `parent/explicit` + `YoutubeAuthActivity`
  بربط **OAuth حقيقي** عبر `com.googleusercontent.apps.1049883984305-...`) ← الحماية.
- **كشف المحتوى الحساس** (`parent/nsfw`: `PhotoPreviewActivity`) ← الحماية (نواة AI مستقبلية).
- **الإشراف على WhatsApp** (`parent/whatsapp`: `WhatsAppWebActivitySlot0-3` بعمليات منفصلة
  `:waweb0-3` + `WhatsAppSlotSyncProvider` + `WhatsAppUnlockActivity`) ← المراقبة.
- **عارض الشاشة** (`parent/screenviewer`) ← المراقبة.
- **قفل PIN** (`parent/pin`: `PinActivity`، `PinSettingActivity`) ← الصلاحيات.
- **ربط الأجهزة** (`parent/connect`: `ConnectDeviceActivity` + `parent/guide/PairCodeActivity` —
  **ربط الأب بالطفل برمز إقران**) ← **نموذج الإقران الجاهز** لربط أجهزة العائلة.
- **التقارير** (`parent/report`، `report80`) ← لوحة الأب التي ستغذيها الـ AI.
- **التوجيه الأولي** (`parent/onboarding`: `OnboardingSplitActivity`، `OnboardingCarouselActivity`) ←
  مرجع لتجربة الإعداد.

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- **`parent/screenv5/ScreenTimeTool.java`** — **أثمن ملف**: ترميز الجداول الأسبوعية:
  قوائم 7 عناصر (يوم/أسبوع)، `-1` = بلا حد، `86400` = يوم كامل بالثواني،
  تُسلسل بفاصلة عبر `BLOCKED_NUMBERS_EXPORT_DELIMITER`. الدوال:
  `getLimitString()`، `getScheduleString()` (3 نسخ: خام/مقارن/مفعّل)،
  `HasInvalidSameSchedule()` (**كشف الجداول المتعارضة**)، `isNoLimit()`.
  **يُنسخ كما هو لمحرك صلاحيات Family OS.**
- **`common/bean/DeviceRuleBean.java`** — عقد القاعدة الكامل (أب ← سيرفر ← طفل):
  `apps: List<App1>` + `block_app_icons` + `block_device` (حظر الجهاز كله) +
  `platform` + `schedule: List<List<String>>` + `screen_time: ScreenTime1` +
  `vpn_apps: List<VpnApp>`.
- **`common/bean/App1.java`** — قاعدة التطبيق الواحد: `package_name`، `name`، `block`،
  `block_type`، `allow_time`، `usage_time`، `schedule` (أسبوعي) — **نموذج قاعدة التطبيق**.
- **`common/bean/ScreenTime1.java`** — `allow_time`، `allow_time_left`، `screen_time_second` —
  حساب الوقت المتبقي يوميًا.
- **`common/network/UrlFactory.java`** + **`HttpParamUtils.java`** —
  `getBaseParamsMap(... , System.currentTimeMillis())`: **توقيع زمني لكل طلب**
  (مكافحة إعادة التشغيل) + ترميز UTF-8 للمعاملات.
- **`common/network/BuildFactory.java`** / `BaseBuildFactory` / `BaseRetrofitManager` —
  Singleton لعميل Retrofit مع `RetryIntercepter`.
- **`common/network/ApiUrl.java`** — `https://data-api.famisafe.com/`
  (+ `gather/callback` للتيليمتري) مع `init/update` تسمح **بتجاوز المضيف من الخادم**
  عبر `SpLoacalData` — مفيد لبيئات (تطوير/إنتاج) متعددة.
- **`common/ipc/KidIpcInterface.java`** — `getChildInfo()` / `getParentInfo()`
  (عبر `IRaMessageInterface`) — عقد IPC بين تطبيقي الأب والطفل.
- **`parent/ParentNotifyService.java`** — إشعار أمامي دائم
  (`foregroundServiceType="specialUse"`، الوصف: `parental_control_persistent_status_notification`) —
  **النمط الصحيح لإبقاء خدمة الرقابة حية** على أندرويد الحديث.
- **`parent/dashboard80/card/registry`** + **`card/runtime`** — سجل بطاقات ديناميكي للوحة التحكم —
  **قالب لوحة أب قابلة للتوسيع**.

## 5. الصلاحيات والمكونات الحساسة
- **الصلاحيات:** الموقع الدقيق/الخلفي، بلوتوث، كاميرا + فلاش، تقويم، إشعارات، منبه دقيق،
  بيومتري، فوترة، `FOREGROUND_SERVICE_SPECIAL_USE` + `FOREGROUND_SERVICE_DATA_SYNC`.
- **علامات حمراء (لا تُقلَّد):**
  - `android:usesCleartextTraffic="true"` — يسمح بـ HTTP غير مشفر.
  - **مفتاح Google Maps مكتوب صراحة في الـ manifest**
    (`AIzaSyDXMlASBQ6sbSVZsvZn4N3JHRQpP2WURWU`) — **مفتاح مسرّب، لا يُعاد استخدامه أبدًا**.
- **مكوّنات مصدَّرة:** `CheckRoleSplashActivity` (روابط `famisafe.page.link` العميقة)،
  `ParentNotifyService`، `NetworkReconnectReceiver`، `YoutubeAuthActivity` (رد OAuth).

## 6. الشبكة ونقاط التكامل
- **الخوادم:** `https://data-api.famisafe.com/` (قواعد/تقارير)؛
  Retrofit + `RetryIntercepter` + `SSLSocketClient`/`NoSSLv3SocketFactory`.
- Firebase (مراسلة، Crashlytics NDK، قاعدة بيانات، رسائل داخلية)،
  SensorsData للتحليلات، Adjust، Facebook SDK، فوترة Google Play 9.1
  (`GoogleBillingWebActivity` — لاحظ الخطأ الإملائي `famsiafe` في الحزمة، دليل على كود حقيقي).

## 7. توصيات إعادة الاستخدام
1. **الأولوية القصوى:** `ScreenTimeTool` (ترميز الجداول الأسبوعية) + `DeviceRuleBean`/`App1`
   (عقد القواعد) — هما **قلب محرك الصلاحيات** في Family OS ويُقتبسان مباشرة.
2. التدفق: الأب يحرر ← تُسلسل القاعدة ← السيرفر ← تُدفع للطفل — **نموذج توزيع الصلاحيات المرن**.
3. `PairCodeActivity` (الإقران برمز) = **نموذج ربط أجهزة العائلة**.
4. `ParentNotifyService` (إشعار دائم) + `dashboard80/card/registry` (لوحة بطاقات قابلة للتوسيع).
5. توقيع الطلبات بالطابع الزمني + تجاوز مضيف الـ API من الخادم.
6. `GeoFenceBean` (الاسم/الإحداثيات/النطاق/آخر انتقال) = نموذج السياج الجغرافي.
7. **لا يُعاد استخدام:** المعمارية الهجينة (H5) — Family OS أصلي؛ `usesCleartextTraffic`؛
   المفاتيح المسرّبة.
8. **فجوة حرجة:** منطق التنفيذ على جهاز الطفل **يتطلب تفكيك تطبيق الطفل (FamiSafe Jr)** —
   بدونه يبقى نموذج الحماية ناقصًا.

## 9. خريطة الملفات المرجعية (مسارات دقيقة)
- `sources/com/wondershare/famisafe/parent/screenv5/ScreenTimeTool.java` — ترميز الجداول.
- `sources/com/wondershare/famisafe/parent/screenv5/` (`applimit`، `screenlimit`، `schedule`، `usage`، `supervised`) — كل شاشات وقت الشاشة.
- `sources/com/wondershare/famisafe/parent/apprules/` — قواعد التطبيقات (واجهة + نماذج).
- `sources/com/wondershare/famisafe/parent/location/geofence/` — واجهات السياج الجغرافي.
- `sources/com/wondershare/famisafe/parent/dashboard80/card/` (`registry`، `runtime`، `model`) — معمارية البطاقات.
- `sources/com/wondershare/famisafe/parent/whatsapp/` — الإشراف على WhatsApp (عمليات `:waweb0-3`).
- `sources/com/wondershare/famisafe/parent/pin/` — قفل PIN.
- `sources/com/wondershare/famisafe/parent/guide/PairCodeActivity.java` — الإقران برمز (يُتحقق من الاسم).
- `sources/com/wondershare/famisafe/parent/ParentNotifyService.java` — الإشعار الدائم.
- `sources/com/wondershare/famisafe/common/bean/DeviceRuleBean.java` — عقد القواعد.
- `sources/com/wondershare/famisafe/common/bean/App1.java` — قاعدة التطبيق الواحد.
- `sources/com/wondershare/famisafe/common/bean/ScreenTime1.java` — الوقت المتبقي.
- `sources/com/wondershare/famisafe/common/bean/GeoFenceBean.java` — نموذج السياج.
- `sources/com/wondershare/famisafe/common/bean/WebFilterBean.java` — نموذج تصفية الويب.
- `sources/com/wondershare/famisafe/common/network/` — `BuildFactory`، `UrlFactory`، `HttpParamUtils`، `ApiUrl`، `RetryIntercepter`.
- `sources/com/wondershare/famisafe/common/ipc/KidIpcInterface.java` — عقد IPC.
- `apktool-out/AndroidManifest.xml` — المكوّنات والصلاحيات (يُنتبه للمفتاح المسرّب و`usesCleartextTraffic`).

## 10. ملاحظات
- التشويش جزئي (حزم مفردة، Kotlin metadata) — المقروئية جيدة في المسارات المهمة.
- `SpLoacalData` رُصد بالاستيراد فقط ولم يُقرأ — **حد معلن**.
- أي استنتاج عن "كيفية الحظر الفعلي على جهاز الطفل" من هذا الـ APK **تخمين مرفوض** —
  التحليل يغطي تطبيق الأب وحده.
- `common/bean` تحوي مئات النماذج؛ فُحصت الأهم
  (`DeviceRuleBean`، `App1`، `ScreenTime1`، `WebFilterBean`، `GeoFenceBean`) والبقية متاحة للجولات التالية.
- وحدة `parent/report` مقابل `report80` تشير لهجرة إصدار (v5→80) — عند الاقتباس يُعتمد الأحدث.
