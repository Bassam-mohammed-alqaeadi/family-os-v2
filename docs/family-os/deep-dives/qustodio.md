# تحليل الهندسة العكسية العميق — Qustodio Parents App (تطبيق الأهل)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/qustodio.md`) الذي وصف التطبيق كصندوق أسود (حزمة JS مضغوطة).
> هذه الوثيقة **تكسر الصندوق**: الـ APK يشحن **خرائط المصدر (source maps) الكاملة** داخل `assets/www`،
> فأُعيد بناء **شجرة المصدر الأصلية كاملة** (2,086 ملف TypeScript/JavaScript بأسمائها الأصلية) —
> وهذا أول تحليل يقرأ منطق لوحة الأهل سطراً بسطر: محرك الجدولة، نموذج ترشيح الويب، مفردات الأوامر، وعقود الـ API.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).
> **نطاق صارم:** هذا تحليل **تطبيق الأهل فقط**. أُلقيت نظرة خاطفة على تطبيق الطفل (`~/workspace/rework/qustodio-kids/`)
> **فقط** لاستخراج بروتوكول الإقران وعقد الأوامر عن بُعد (§5) — كما أُذن — وبقي التحليل أبوياً.

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.qustodio.family.parental.control.app.screentime` [VERIFIED — manifest] |
| الإصدار المحلَّل | 182.41.0 (versionCode 1824100) [VERIFIED — apktool.yml] |
| نوع الملف | APK مستقل (~83MB) |
| smali / java | 27,629 / 13,628 بالضبط [VERIFIED — عدّ الملفات] |
| الكود الأصلي للتطبيق | **5 ملفات Java فقط** في `com.qustodio.*` [VERIFIED] |
| الطبيعة | تطبيق هجين **Cordova + React SPA**: غلاف أصلي رقيق + تطبيق React كامل في `assets/www` (94MB) [VERIFIED] |
| الدور | **لوحة تحكم الأهل**: تحرير القواعد، الجداول، التقارير، الإقران، الفوترة — **صفر إنفاذ على الجهاز** |
| تطبيق الطفل (منفصل) | `com.qustodio.qustodioapp` — يُشار إليه في إعدادات التطبيق كرابط Play Store [VERIFIED — `main.df358784.js`: `"android":"https://play.google.com/store/apps/details?id=com.qustodio.qustodioapp"`] |

### الاختراق المنهجي: خرائط المصدر داخل الـ APK [VERIFIED]
على عكس ما افترضه تقرير الجولة الأولى ("حزمة JS مضغوطة — المنطق لم يُحلل")، الـ APK يشحن ملفات `.map`
بجانب كل حزمة JS في `assets/www/static/js/`:
- `main.df358784.js.map` — 2,236 مصدراً، **كلها بمحتواها الكامل** (`sourcesContent`)
- `739.8a78d876.js.map` — 3,027 مصدراً بمحتواها الكامل
- `471.0f06b72d.js.map` — 370 مصدراً، `487.e9cae5d3.js.map` — 17 مصدراً

بفك `sourcesContent` أُعيد بناء الشجرة الأصلية (`webpack://ParentsApp/./src/...`): **2,086 ملف كود**
(TypeScript/JavaScript) بأسمائها ومساراتها الأصلية — أُعيد تجميعها في `/tmp/qsrc/src/`
(مجلد تحليل مؤقت؛ المصدر الأصلي يبقى في الـ APK). كل مسار `src/...` المذكور في هذه الوثيقة
هو مسار **أصلي حقيقي** من خرائط المصدر، لا تخمين.

### البنية الطبقية [VERIFIED]
```
┌──────────────────────────────────────────────────────────┐
│ React SPA (assets/www) — كل منطق الأهل                   │
│  src/routes.tsx + src/ducks/* + src/records/* +          │
│  src/containers/* + src/components/* + src/lib/qapi.ts   │
│  (Redux + redux-observable + Immutable.js + react-router)│
├──────────────────────────────────────────────────────────┤
│ Cordova bridge (org.apache.cordova) + 30+ plugin         │
├──────────────────────────────────────────────────────────┤
│ غلاف أصلي (5 ملفات): MainActivity (CordovaActivity)      │
│  + QustodioPlugin (روابط عميقة) + QustodioPushNotification│
│    Service (توجيه Braze/FCM)                             │
└──────────────────────────────────────────────────────────┘
                    │ HTTPS (fetch)                        ▼
        https://api.qustodio.com (v1/v2) — OAuth2 Bearer
```

### العلاقة أب ↔ طفل ↔ سحابة (الصورة الكاملة) [VERIFIED]
```
الأب: يحرر القواعد (React UI)
  → PUT v1/accounts/{id}/profiles/{pid}/rules?app_rules=1 (القواعد كاملة، snake_case)
  → (إن multi-device) PUT .../rules/time_restrictions/{deviceId} (حدود الوقت)
  → السحابة: api.qustodio.com (تخزن + تدفع أوامر FCM للطفل)
  → الطفل (com.qustodio.qustodioapp): يستقبل FCM {message, signature}
      → MessageV1Interpreter: update_policy ← يسحب القواعد (deviceRules)
  → التقارير/التنبيهات: الطفل يرفع للسحابة → الأب يسحبها:
      GET v2/accounts/{uid}/notification_center/items (صفحات، حد 15)
      + عشرات نقاط الملخصات (v1/v2 summary/*)
```
**لا يوجد أي اتصال مباشر أب←طفل** — كل شيء عبر السحابة وسيطاً [VERIFIED].
**الاستثناء الوحيد**: أمران يرسلهما الأب مباشرة عبر الخادم كإشعارات دفع:
`{name:'update_location'}` و`{name:'disable_panic_mode'}` ←
`POST v1/accounts/{id}/devices/{deviceUId}/notifications` [VERIFIED — `src/ducks/devices.ts:287-295,321-327`].

---

## 2. الغوص العميق — بنية لوحة الأهل

### 2.1 المكدس التقني [VERIFIED]
| الطبقة | التقنية | الدليل |
|---|---|---|
| UI | React + react-router **v3** (hashHistory) | `src/routes.tsx`، `src/store/setupStore.ts: hashHistory` |
| الحالة | Redux + **redux-thunk** + **redux-observable** (epics) + **Immutable.js** | `src/store/setupStore.ts`، `src/epics/index.ts: combineEpics` |
| النمذجة | سجلات Immutable مخصصة (`getRecordOperations`: fromPayload/serialize) | `src/records/recordHelpers/` |
| الشبكة | `fetch` مباشر عبر عميل `QApi` مخصص (لا Axios) | `src/lib/qapi.ts` (1,633 سطراً) |
| التوجيه | `src/routes.tsx` — ~60 مساراً تحت `/profiles/:profileId/` | §2.2 |
| التخزين المحلي | **localStorage فقط** (لا SQLite) — الرموز بنص صريح | `src/ducks/persistentStorage.ts` |
| الجسر الأصلي | Cordova + ~30 plugin | `assets/www/cordova_plugins.js` |
| التحليلات | Sentry + OpenTelemetry + Braze + Adjust + Firebase كاملة | manifest + `src/telemetry/` |

### 2.2 خريطة التوجيه (routes.tsx — قُرئ كاملاً، 700 سطر) [VERIFIED]
الجذر `/` ← `MyFamilyContainer` (قائمة العائلة). كل طفل (profile) يعيش تحت `/profiles/:profileId/`:
- `rules/` — مركز القواعد: `appRules`، `webFilters`، `dailyTimeLimit/devices/:deviceId`،
  `restrictedTimes/devices/:deviceId`، `locationRules`، `callsSMSRules`، `panicButtonRules`،
  `youtube-rules`، `socialMonitoringRules` — كلٌّ مع `premiumFlyover` و`addDeviceFlyover` و`startTrial`
- `routines(/edit/:editRoutineUid)` — محرر الروتينات الجديد (متعدد الخطوات)
- `screen-time` — ملخص وقت الشاشة؛ `activity-timeline` — الخط الزمني للنشاط
- `familyLocator` — الخريطة (`places/place/:placeUid` للسياج الجغرافي)
- `devices` — قائمة الأجهزة؛ `add-device` — إقران جهاز (`ProtectADevicePage`)
- `upgrade` / `direct-purchase/:productCode` / `checkout/thank-you` — الفوترة
- `account-settings`، `account-security` (2FA)، `lockScreen` (قفل بصمة)

### 2.3 طبقة البيانات: Records ← Ducks ← Epics [VERIFIED]
- **`src/records/`** (~35 مجلداً): نماذج البيانات غير القابلة للتغيير. كل سجل يعرّف
  `fromPayload` (snake_case ←→ camelCase) و`serialize` (العكس) — **عقد التسلسل لكل API** في مكان واحد.
  الأهم: `records/profileRules/index.ts` (~800 سطر: كل أنواع القواعد)، `records/routines/`،
  `records/device/`، `records/place.ts`، `records/notificationCenter/`.
- **`src/ducks/`** (~60 مجلداً): منطق Redux (reducers + thunks). `ducks/profileRules/index.ts`
  يحوي `modifyProfileRules()` — مسار الحفظ الكامل (§6.2). `ducks/devices.ts` — الأوامر عن بُعد.
  `ducks/pushService/` — تسجيل FCM وتوجيه الإشعارات الواردة.
- **`src/epics/`**: `dataLoaders/` (تحميل البيانات عند دخول المسارات)، `deviceSideEffects/`،
  `location/`، `tracking/` — آثار جانبية تفاعلية بـ RxJS.
- **`src/lib/qapi.ts`**: عميل الـ API — **95 مجموعة نقاط** (`public x = this.endpoint(...)`)،
  كلها موثقة في §6.

### 2.4 الغلاف الأصلي (5 ملفات — قُرئت كاملة) [VERIFIED]
- `com.qustodio.family.parental.control.app.screentime.MainActivity` — يرث `CordovaActivity`؛
  `singleTask`، عمودي إجباري، `loadUrl(launchUrl)` بعد نقل المهمة للخلفية عند الفتح من إشعار.
- `com.qustodio.pasa.QustodioPlugin` — الجسر المخصص: فعل وحيد `setWebAppReady` + **معالجة روابط عميقة
  مؤجلة** (`pendingDeepLink`): يقبل أي رابط يبدأ بـ `qustodio` (المخطط الفعلي في الـ manifest هو
  **`qustodiofamily://`** — تصحيح لتقرير الجولة الأولى الذي ذكر `qustodio://`) وروابط
  `https://*.qustodio.com/parents-app*` (regex)، ثم يحقن `javascript:handleOpenURL('<url>')`.
- `com.qustodio.pasa.QustodioPushNotificationService` — يرث `FCMService` (cordova-plugin-push):
  يجرّب Braze أولاً (`BrazeFirebaseMessagingService.handleBrazeRemoteMessage`) ثم FCM العادي.
- الـ manifest (229 سطراً — قُرئ كاملاً): نشاط واحد مصدَّر (MainActivity)، **صفر** مكونات إنفاذ
  (لا VpnService/Accessibility/DeviceAdmin — مؤكد)، `usesCleartextTraffic="true"`،
  **مفتاح Google Maps مسرّب**: `AIzaSyBOq9G49mqvcxZzuKbpesf1U__jfpLZPMU` (لا يُعاد استخدامه أبداً)،
  صلاحيات: الموقع الدقيق، `POST_NOTIFICATIONS`، بصمة، فوترة، `WAKE_LOCK`.

---

## 3. محرك الجدولة — مفككاً بالكامل (الملكية الفكرية الجوهرية)

يملك Qustodio **ثلاثة** أنظمة جدولة متعايشة — كلها مفكوكة هنا:

### 3.1 النظام الكلاسيكي: قناع البتات الأسبوعي (time_restrictions) [VERIFIED]
**الملفات:** `src/records/profileRules/index.ts` (`TimesRecord`، `TimeSettingsRecord`) +
`src/helpers/dates.ts` (`isHourState`) + `src/components/TimeLimits/RestrictedTimesGrid.tsx`.

**الترميز** — كل يوم أسبوع يُمثل بعدد صحيح **قناع بتات 24 بتاً**: البت `h` = 1 يعني الساعة `h` محظورة/مقيدة:
```ts
// src/helpers/dates.ts:394-399
export const isHourState = (timeRanges, weekday, hour) =>
  Boolean((1 << hour) & timeRanges.get(weekday));
```
- مفاتيح السلك: `['mon','tue','wed','thr','fri','sat','sun']` (`apiWeekdayKeys` — `src/constants/index.ts:175`)
- الشبكة الأسبوعية في الواجهة: 7 أيام × 24 ساعة، **اليوم يبدأ 5 صباحاً** (الساعات 0–4 تُنسب لليوم التالي)
  [VERIFIED — `RestrictedTimesGrid.tsx`: `realWeekday = hour>=0 && hour<5 ? WEEKDAYS[(index+1)%7] : weekday`]
- `quotas`: حد يومي **بالدقائق** لكل يوم (`COMPLETE_DAY_IN_MINUTES = 1440` هو الافتراضي = بلا حد فعلي)
- جسم الـ PUT (`PUT v1/accounts/{id}/profiles/{pid}/rules/time_restrictions/{deviceId}`):
```json
{ "timeRanges": {"mon": 8375392, "tue": 0, ...},
  "quotas": {"mon": 120, ...},
  "isDailyLimit": true, "isMultiDevices": true,
  "isLockNavigation": false, "isLockComputer": false, "isReportAlerts": true,
  "isWeekendQuota": true, "isWeekdaysQuota": true }
```
[VERIFIED — `TimeSettingsRecord.serialize` — `src/records/profileRules/index.ts:141-164`]

### 3.2 نظام التقويم: RRULE المعياري (calendar_restrictions) [VERIFIED]
**الملفات:** `src/records/calendarRestrictionsPause/CalendarRestrictionPause.ts` +
`src/ducks/pause/thunks.ts` + `src/ducks/extraTime.ts`.

يستخدم **قواعد تكرار iCalendar (RFC 5545)** — الإيقاف المؤقت لمرة واحدة يُرمَّز:
```ts
// src/ducks/pause/thunks.ts:108-111
rrule: `DTSTART:${start}\nRRULE:FREQ=DAILY;COUNT=1;UNTIL=${end}`
```
- `POST/PUT/DELETE v2/accounts/{uid}/profiles/{puid}/rules/calendar_restrictions[/{uid}]`
- `restriction_type: 3` = PAUSE (يُرسل `restriction_type: 3` على السلك، ويُقرأ `restrictionType: 'PAUSE'`)
  [VERIFIED — `CalendarRestrictionPause.ts`: `mapOut: {...commonMapOutFn(record), restriction_type: 3}`]
- **منح الوقت الإضافي** (Extra Time — رد الأب على طلب الطفل) = نفس الآلية: `POST calendar_restrictions`
  بسجل `ExtraTimeRecord{uid, seconds: result.duration}` [VERIFIED — `src/ducks/extraTime.ts:130-167`]
- قبل إيقاف جديد: يُحذف الإيقاف النشط أولاً (منع تكديس الإيقافات) [VERIFIED — `thunks.ts:98-102`]

### 3.3 النظام الجديد: الروتينات (routines) [VERIFIED]
**الملفات:** `src/records/routines/` — `routine.ts`، `schedule/schedule.ts`،
`schedule/types/Schedule.types.ts`، `policy/policy.ts`، `policy/types/Policy.types.ts`.

- **الروتين:** `{uid, name, description, icon (0–17: checkCircle…wifiSlash), color, type: MANAGEMENT(0)|BLOCKED(1), paused, enabled, policy}`
- **الجدول (Schedule):** `{uid, routine_uid, weekdays: ['MO','TU','WE','TH','FR','SA','SU'], overrides: bool, start_time: 'HH:mm', duration_minutes, from_date/to_date: 'YYYY-MM-DD'}` — صريح ومقروء، لا أقنعة
- **السياسة (Policy):** `{counts_towards_daily_time_quota, block_type: NONE(0)|LOCK_NAVIGATION(1)|LOCK_DEVICE(2), app_rules, web_rules}` — سياسة لكل روتين تشمل قواعد تطبيقات وويب
- النقاط: `GET/POST v2/accounts/{uid}/profiles/{puid}/routines`،
  `.../routines/{routineUid}/schedules` (CRUD كامل للجداول)
- ملاحظة معمارية: `overrides` في الجدول = تجاوز تعارضات الجداول الأخرى [INFERENCE من الاسم]

### 3.4 قواعد التطبيقات لكل تطبيق [VERIFIED]
**الملف:** `src/records/profileRules/index.ts` (`AppRuleRecord`، `AppRulesRecord`).
- لكل تطبيق: `{id, exe, name, action, platform, monQuota…sunQuota (دقائق، افتراضي 1440), blockable, ageRating, categoryId, timeRestrictionsEnabled}`
- مفردات الإجراءات (سلك: أرقام): `0=ALLOWED`، `1=BLOCKED`، `4=ALWAYS_ALLOWED`
  (`APPLICATION_ACTIONS` — `src/constants/index.ts:283-287`)؛ القيمتان 2 (alert) و3 (ignore) **غير مدعومتين للتطبيقات** [VERIFIED — تعليق صريح في الكود]
- وضعان: `isApplicationList` (لكل تطبيق) أو `categoryList` (حظر حسب فئة التطبيق — خلف feature flag)

---

## 4. نموذج ترشيح الويب [VERIFIED]

**الملفات:** `src/records/profileRules/index.ts` (`WebRulesRecord`، `WebCategoryRecord`) +
`src/constants/index.ts` (المفردات) + `src/records/category.ts` (معرفات الفئات) +
`src/businessLogic/profileRules/webCategories.ts`.

```ts
// الشكل المسلسل على السلك (PUT .../rules)
{ isCategoryList: bool,        // وضع القائمة: حظر أم سماح
  isAllowUnknownSites: bool,   // المواقع غير المصنفة
  isSafeSearch: bool,          // فرض البحث الآمن (افتراضي true)
  isReportBlockedSites: bool,  // الإبلاغ عن المحظور (افتراضي true)
  isSearchAlertsNotificationsEnabled: bool,
  categories: [{category: <id رقمي>, action: 'BLOCK'|'ALERT'|'ALLOW'}],
  domains: {"example.com": 1, ...} }  // استثناءات النطاقات
```
- **إجراءات النطاقات** (فهرس رقمي على السلك): `0=ALLOW`، `1=BLOCK`، `2=ALERT`، `3=IGNORE`
  (`WEBFILTER_DOMAIN_ACTIONS` — `src/constants/index.ts:207-213`)
- **30 فئة ويب** بمعرفات رقمية ثابتة (`src/records/category.ts:36-67`): alcohol=1، chat=2، drugs=3،
  educational=4، employment=5، entertainment=6، gambling=7، games=8، government=9، health=10،
  matureContent=12، news=13، pornography=14، profanity=15، religion=16، searchPortals=17،
  shopping=18، socialNetwork=19، sports=20، tobacco=21، travel=22، violence=23، weapons=24،
  webmail=25، business=26، technology=27، fileSharing=28، proxiesLoopholes=29، forums=30، ai=31
  (+ فئة مخفية `safetyNet=40` لا تظهر في الواجهة)
- **الافتراضات** (`DEFAULT_WEB_CATEGORIES`): حظر alcohol/drugs/gambling/matureContent/pornography…
  والسماح لـ entertainment — قائمة "استعادة الافتراضي" مبنية في العميل
- **تصنيف المواقع**: `GET v1/sites/classification?hostname=` — يُستخدم عند إضافة استثناء نطاق
  لعرض فئته [VERIFIED — النقطة معرّفة في qapi؛ الاستخدام الدقيق لم يُتتبَّع سطراً بسطر]
- **سياسة المدارس**: 10 فئات (gambling/proxies/violence/weapons/profanity/mature/pornography/alcohol/drugs/tobacco)
  تُقفل ضد تعديل الأهل في ملفات المدرسة (`SCHOOL_MANAGED_WEB_CATEGORY_IDS`)
- قواعد يوتيوب منفصلة: `PUT v2/accounts/{uid}/profiles/{puid}/rules/videos/{source}`
  (`profileVideoRules` — مصادر الفيديو)
- **التنفيذ على جهاز الطفل**: الأب يعرّف فقط — التنفيذ في `com.qustodio.qustodioapp`
  (خارج نطاق هذا التحليل الأبوي)

---

## 5. مستوى الأوامر والإقران (أب ↔ طفل)

### 5.1 مفردات الأوامر عن بُعد — العقد الكامل [VERIFIED — قُرئ الكود]
**الناقل:** FCM — حزمة `{message: <JSON>, signature: <string>}` تُفسَّر في الطفل بـ
`com.qustodio.qustodioapp.service.messaging.interpreter.MessageV1Interpreter`
(قُرئ كاملاً — 392 سطراً — كنظرة خاطفة مصرح بها لعقد الأوامر).

**المفردات السبع** (`SUPPORTED_ACTIONS`):
| الأمر | سلوك الطفل [VERIFIED من `q()`] |
|---|---|
| `update_location` | إبلاغ فوري عن الموقع ("Reporting Location. Reason: Push Notification") |
| `update_policy` | **سحب القواعد** ("Fetching Rules") — يُستدعى بعد حفظ الأهل للقواعد |
| `update_settings` | مزامنة إعدادات الجهاز (`syncDeviceSettings`) |
| `disable_panic_mode` | إيقاف وضع الذعر |
| `enable_logging` | تفعيل التسجيل التشخيصي لعدد ثوانٍ من الحمولة (افتراضي **604800** = 7 أيام) |
| `upload_logs` | رفع السجلات فوراً |
| `update_application` | تشغيل تحديث التطبيق (مع حمولة `J5.b`) |

**ما يرسله الأب مباشرة** (الوحيدان من واجهة الأهل):
- `POST v1/accounts/{id}/devices/{deviceUId}/notifications` جسم `{name: 'update_location'}`
  — مع **منع ارتداد 8 ثوانٍ** (`LOCATION_REQUEST_DEBOUNCE_TIME = 8000`) وتخطي الأجهزة المطلوبة حديثاً
  [VERIFIED — `src/ducks/devices.ts:271,287-316`]
- نفس النقطة جسم `{name: 'disable_panic_mode'}` — زر إيقاف الذعر (`panicPush`)
  [VERIFIED — `src/ducks/devices.ts:321-327`]
- أوامر `update_policy/update_settings/...` الباقية **يطلقها الخادم** (مثلاً بعد `PUT rules`) —
  الأب لا يستدعي `pushNotification` لها إطلاقاً (موقعا الاستدعاء الوحيدان أعلاه) [VERIFIED بالبحث الشامل]

**ملاحظة أمنية** [VERIFIED]: فحص التوقيع في المفسّر شكلي — `s(message, signature)` يتحقق فقط من
`length() > 0` للطرفين (لا تحقق تشفيري في هذا الملف)؛ الأصالة الفعلية تأتي من FCM نفسه
(مفتاح الخادم). Family OS يجب أن يضيف توقيع HMAC حقيقياً لكل أمر.

### 5.2 تدفق الإقران أب↔طفل [VERIFIED]
1. الأب ينشئ ملف الطفل (profile): `POST v1/accounts/{accountId}/profiles`
2. الأب يرسل رابط التحميل: `POST v2/accounts/{uid}/download_link/send_download_link`
   (SMS/بريد — يوجَّه لمتجر Play: `com.qustodio.qustodioapp`)
3. الطفل يثبت التطبيق ويُكمل الإعداد (الاسم/العمر — `NewKidFragment`) — الجهاز **يسجّل نفسه**
   في الحساب (منطق التسجيل في حزم مشوَّشة `A*` — لم يُتتبَّع)
4. الأب يرى الجهاز في `GET v2/accounts/{uid}/devices?include_lastseen_info=true&include_delegated_devices=true&include_mdm_status=true`
5. الأب **يربط مستخدم الجهاز بالملف**: `POST v1/accounts/{accountId}/profiles/{profileId}/devices`
   جسم `{user_uid, mid: device.uid}` [VERIFIED — `src/ducks/devices.ts:496-508`]
6. فك الربط: `POST v1/accounts/{accountId}/devices/{deviceUId}/profiles` جسم
   `[{profile_id: null, user_uid}]` [VERIFIED — `src/ducks/devices.ts:514-527`]

**نقطة حاسمة** [VERIFIED]: نقطة `POST .../profiles/{profileUid}/onboarding_token` **معرّفة في `lib/qapi.ts:1352`
لكنها غير مستدعاة إطلاقاً** في كامل مصدر التطبيق (بحث شامل — صفر استدعاءات، والـ action
`RECEIVE_ONBOARDING_TOKEN` في `ducks/appOnboarding.ts` لا يُرسَل أبداً، والسجل
`records/onboardingToken.ts` موجود بلا مستهلكين). **رمز الإقران كود ميت في هذا البناء** —
الإقران الحالي: رابط تحميل + تسجيل ذاتي للجهاز + ربط يدوي من الأهل. ولا يوجد QR في التطبيق
[VERIFIED بالبحث عن QRCode/qrcode — صفر نتائج].

### 5.3 استقبال الأب للتنبيهات (طفل → أب) [VERIFIED]
الأب **يسحب** (لا دفع): `GET v2/accounts/{uid}/notification_center/items` (صفحات `limit/offset`،
حد الصفحة 15 — `NC_PAGE_LIMIT`) + `unread_count` + `mark_as_viewed`. تصنيف التنبيهات
(`NotificationType` — `src/constants/index.ts:550-565`): `1=ApplicationUsageIncreased` (مهمل)،
`2=ExtraTimeRequest`، `3=GamingVoiceAlert`، `4=SocialAlert`، `5=MessageAlert`، `6=SearchAlert`،
`7=SmsAlert`، `8=AiChatbotAlert` — كل نوع يوجَّه لبطاقة/تفصيل مختلف (`threatAlertDetails`، `searchAlertDetails`).
إشعارات FCM الواردة على الأب **عرضية فقط**: تُطبَّع (`deep_link`، `pn_type`) وتُوجَّه لمودال أو رابط عميق —
**لا مفردات أوامر على الأب** [VERIFIED — `src/ducks/pushService/`].

---

## 6. الشبكة وعقود البيانات

### 6.1 المضيفون والمصادقة [VERIFIED]
| المضيف | الاستخدام |
|---|---|
| `https://api.qustodio.com` | واجهة البيانات (v1/v2) — `apiBaseUrl` [VERIFIED — bundle] |
| `https://auth.qustodio.com` | OAuth2/SSO (يُشار إليه في تقارير سابقة؛ التدفق عبر `/v1/oauth2/access_token`) |
| `https://family.qustodio.com` | لوحة الويب + روابط عميقة `https://family.qustodio.com/parents-app*` (autoVerify) |

- **OAuth2**: `POST {baseUrl}/v1/oauth2/access_token` بنوع `application/x-www-form-urlencoded`
  (`grant_type=refresh_token` للتجديد) — أي استجابة غير 200 = خطأ [VERIFIED — `lib/qapi.ts:1147-1180`]
- **التجديد التلقائي**: عند 401 يُجدَّد الرمز ويُعاد الطلب مرة واحدة؛ عند فشل التجديد يُعطَّل
  التجديد ويُستدعى `sessionRefreshDeniedCallback` (تسجيل خروج) [VERIFIED — `refreshTokenIfNeeded`]
- **بيانات العميل** (`client_id`/`client_secret`) من إعداد البناء لكل منصة:
  `qinit.tenant.parents_app.platforms.{android,ios,web}.client_id` — تُختار حسب
  `AuthorizationApplication` (`src/helpers/globals.ts: getClientCredentials`)
- **الترويسات**: `Authorization: Bearer`، `Qustodio-Client: QustodioParentsApp/{version} (p:android)`،
  `Parent-Device-Id`، `Parent-Device-Action: update-last-seen` (مرة يومياً)، `User-Agent: ParentsApp …`
  [VERIFIED — `lib/qapi.ts:120-175`]
- **التخزين المحلي**: `accessToken`/`refreshToken` في **localStorage بنص صريح**
  [VERIFIED — `src/ducks/persistentStorage.ts: storageKeys`] — **يُنقل لمخزن آمن في Family OS**
- مهلة الطلب: 10 ثوانٍ (`private timeout = 10000`)؛ تخزين مؤقت انتقائي (`QApiCache` — مثلاً
  عناصر مركز الإشعارات TTL 10 ثوانٍ)

### 6.2 مسار حفظ القواعد (الأب → السحابة) [VERIFIED]
`modifyProfileRules()` — `src/ducks/profileRules/index.ts:565-600`:
1. إن `timeRestrictions.isMultiDevices` ومعرّف جهاز: `PUT .../rules/time_restrictions/{deviceId}`
   (جسم `TimeSettingsRecord.serialize` — §3.1)
2. ثم `PUT v1/accounts/{id}/profiles/{pid}/rules?app_rules=1` بالسجل **الكامل**
   `ProfileRulesRecord.serialize` (يُحوَّل camelCase ←→ snake_case عبر `denormalizeProfileRules`)
3. بعد الحفظ: دمج أي قواعد تطبيقات جديدة أعادها الخادم في الحالة المحلية
4. الخادم يدفع `update_policy` للطفل (الأب لا يرسل أمراً)

### 6.3 كتالوج الـ API (95 مجموعة — `src/lib/qapi.ts`) [VERIFIED]
مختارات مجمعة حسب المجال (المسارات الكاملة في `src/lib/qapi.ts` بالأسطر المذكورة):
- **القواعد**: `profileRules` (PUT `v1/accounts/{id}/profiles/{pid}/rules`)، `timeLimits`
  (GET/PUT `.../rules/time_restrictions/{deviceId}`)، `calendarRestrictions` (CRUD
  `v2/.../rules/calendar_restrictions`)، `deviceRules` (`v2/.../devices/{deviceUId}/rules` —
  ما يسحبه الطفل)، `appCategories`، `appInsights`، `profileVideoRules`، `safeNetworksSettings`
- **الروتينات**: `routines`، `routinesDetails`، `routinesSchedules`، `routinesSchedulesDetails`
- **الأجهزة**: `devices` (v2 + `include_lastseen_info/include_delegated_devices/include_mdm_status`)،
  `device`، `deviceSettings`، `deviceOptions`، `deviceUserStatus`، `deviceUserEvents`،
  `deviceUser`/`deviceUserProfile` (الربط)، `parentDevices`/`parentDevicesOptions`
- **الأوامر**: `pushNotification` (POST `v1/.../devices/{deviceUId}/notifications`)
- **الملخصات**: `summary`، `summaryPerHours`، `screenTimePerDay`، `summaryDomainsAndApps`،
  `summaryDomainActivity`، `youtubeSummary*` (4)، `callsAndSmsSummary`، `searchSummary`
- **التنبيهات**: `notificationCenterItems/unreadCount/markAsViewed`، `threatAlertDetails`، `searchAlertDetails`
- **الموقع**: `places`/`place` (CRUD `v2/accounts/{uid}/places` — `{uid, name, latitude, longitude, radius: 100, address}`)
- **الإقران**: `sendDownloadLink`، `onboardingToken` (ميت — §5.2)
- **الحساب**: `me`، `account`، `password`، `contacts`، `options`، `email`، `autologin`
  (`v1/authentication/single-sign-on/token`)، `invitations`/`invitation` (دعوة أب مشارك)،
  `accessProfile`، `twoFactorAuthSend/Validate`
- **الفوترة**: `products`/`product` (`producttooffer`)، `validateTransaction`، `validateReceipt`
  (`v1/payment/{provider}`)، `initPurchase`، `activateRetrial`
- **المدرسة** (Linewize): `students`، `linkAllPendingStudents`، `studentPolicies` (+`Pause`/`Delegate`)،
  `schoolInfo`، `summaryStudent*`، `signatureDetails` — تكامل مدرسي كامل
- **أخرى**: `extraTimeRequestStatus`، `experiments`، `features`، `profileOptions`، `profileStatuses`،
  `seasonalCampaignTopBar`، `sitesClassification`

### 6.4 عقود البيانات الأساسية
- **أب→سحابة (كتابة)**: JSON بـ snake_case (يُحوَّل من سجلات camelCase) — القواعد كاملة في PUT واحد
- **سحابة→أب (قراءة)**: نفس السجلات (`fromPayload`)؛ الملخصات بأشكال مخصصة لكل نقطة
- **سحابة→طفل**: FCM `{message, signature}` بالمفردات السبع (§5.1)؛ الطفل يسحب القواعد عبر `deviceRules`
- **أب→طفل مباشرة**: لا شيء — دائماً عبر الخادم

---

## 7. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب والمسار الدقيق |
|---|---|---|---|
| 1 | **ترميز قناع البتات الأسبوعي** (`isHourState` + `TimesRecord`) | 1 | 24 بتاً لكل يوم = 7 أعداد صحيحة تشفر أسبوعاً كاملاً — مدمج، رخيص، قابل للقراءة. انسخ الدالة حرفياً: `src/helpers/dates.ts:394-399` + التسلسل `src/records/profileRules/index.ts:41-58`، ومفاتيح الأيام `apiWeekdayKeys` (`src/constants/index.ts:175`). |
| 2 | **نموذج السجل المزدوج** (`fromPayload`/`serialize` لكل Record) | 1 | عقد التسلسل لكل API في مكان واحد — يمنع انحراف العميل/الخادم. انسخ النمط: `src/records/recordHelpers/` + مثال `src/records/profileRules/index.ts`. |
| 3 | **نموذج ترشيح الويب** (30 فئة بمعرفات رقمية + إجراءات النطاقات 0-3 + الأعلام الخمسة) | 1 | جاهز للنسخ: `src/records/category.ts:36-67` (المعرفات)، `src/constants/index.ts:200-213` (المفردات)، `src/records/profileRules/index.ts:223-274` (السجل). |
| 4 | **مفردات الأوامر السبع** + التوقيع | 2 | انسخ المفردات (`update_location/update_policy/update_settings/disable_panic_mode/enable_logging/upload_logs/update_application`) من `MessageV1Interpreter.java` (تطبيق الطفل)؛ **أضف HMAC** — توقيعهم شكلي فقط. |
| 5 | **قناة الأوامر**: `POST .../devices/{uid}/notifications {name}` عبر الخادم | 1 | أبسط عقد أوامر ممكن — لا سوكيت دائم. انسخ: `src/ducks/devices.ts:287-327` + منع الارتداد 8s. |
| 6 | **ترميز RRULE للإيقاف المؤقت** (`DTSTART…RRULE:FREQ=DAILY;COUNT=1;UNTIL=…`) | 1 | معيار RFC 5545 بدل ترميز مخصص — يتعايش مع أي عميل تقويم. انسخ: `src/ducks/pause/thunks.ts:108-111` + `restriction_type: 3` (`src/records/calendarRestrictionsPause/CalendarRestrictionPause.ts`). |
| 7 | **نموذج الروتينات** (روتين ← جداول ← سياسة: حظر/تطبيقات/ويب) | 2 | أنظف نموذج جدولة للمستقبل (صريح لا أقنعة). اقتبس: `src/records/routines/` كاملاً — `Schedule.types.ts` (weekdays/start_time/duration_minutes) + `Policy.types.ts` (block_type 0/1/2). |
| 8 | **تدفق الإقران**: رابط تحميل ← تسجيل ذاتي ← ربط يدوي `POST profiles/{pid}/devices {user_uid, mid}` | 2 | بسيط وآمن (لا أسرار على جهاز الطفل). انسخ: `src/ducks/devices.ts:496-527`. تجاهل `onboarding_token` — كود ميت. |
| 9 | **تصنيف التنبيهات** (`NotificationType` 1-8) + مركز إشعارات مسحوب بصفحات | 2 | أساس بطاقات لوحة الأب: `src/constants/index.ts:550-565` + `src/ducks/notificationCenter/` (حد 15/صفحة، TTL 10s). |
| 10 | **الجسر الأصلي-ويب + الروابط العميقة المؤجلة** (`QustodioPlugin`) | 2 | إن اختيرت واجهة هجينة لأي وحدة — الحل مكتمل: `jadx-out/sources/com/qustodio/pasa/QustodioPlugin.java`. |
| 11 | **ترويسات العميل** (`Qustodio-Client` + `Parent-Device-Id` + `update-last-seen`) | 2 | نمط تتبع الأجهزة نظيف — كيّفه: `src/lib/qapi.ts:120-175`. |
| 12 | **تكامل المدارس** (Linewize: سياسات/تفويض/إيقاف) | 3 | مرجع لمنتج "Family OS للمدارس" لاحقاً — `studentPolicies*` في qapi. |
| ✗ | `usesCleartextTraffic="true"`، الرموز في localStorage بنص صريح، التوقيع الشكلي للأوامر، مفتاح الخرائط المسرّب | ✗ | **مرفوضة أمنياً** — Family OS: HTTPS إجباري + مخزن آمن + HMAC للأوامر. |
| ✗ | `onboarding_token` (كود ميت) | ✗ | لا يُقتبس — ميت في المصدر. |
| ✗ | الاعتماد الكلي على Cordova/WebView للوحة | ✗ | Family OS أصلي (Flutter) — الأداء ميزة معلنة؛ يُقتبس المنطق لا الحاوية. |

### الفجوة الاستراتيجية التي يملؤها هذا التحليل
تقرير الجولة الأولى انتهى عند "المنطق التفصيلي لم يُحلل" و"عناوين API الدقيقة غير مرصودة".
الآن نملك **آلة القواعد الكاملة**: من ضغطة "حفظ" في React (`modifyProfileRules`) إلى بتات القناع
على السلك (`timeRanges: {mon: 8375392…}`) إلى أمر FCM الذي يوقظ الطفل (`update_policy`) —
كل حلقة موثقة بأسماء ملفات وأسطر دقيقة. وهذا هو **مرجع عقد القواعد** الذي ستُبنى عليه
وحدة الحماية في Family OS، جنباً إلى جنب مع عقد FamiSafe (ترميز الفواصل) — فيكون لدينا
نموذجان مجرّبان للمقارنة عند تصميم محرك الصلاحيات L0–L5.

---

## 8. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **أولوية تعارض الأنظمة الثلاثة** [INFERENCE]: عند اجتماع `time_restrictions` (قناع) + `calendar_restrictions`
   (RRULE) + `routines` (سياسات) — أيها يغلب على جهاز الطفل؟ المنطق في تطبيق الطفل المشوَّش (خارج النطاق الأبوي).
2. **`deviceRules` (ما يسحبه الطفل)** [INFERENCE]: النقطة معرّفة (`v2/.../devices/{deviceUId}/rules`) لكن شكل
   حمولتها للطفل لم يُقرأ (تطبيق الطفل مشوَّش) — هل هي نفس `ProfileRulesRecord` أم شكل مضغوط؟
3. **توقيت دفع `update_policy`**: حفظ الأب لا يستدعي أمراً مباشراً — الفاصل بين `PUT rules` ووصول
   الأمر للطفل خادمي وغير محسوم [يحتاج مراقبة شبكية حية].
4. **قيم `block_type` للروتينات على جهاز الطفل**: `LOCK_NAVIGATION` مقابل `LOCK_DEVICE` — الدلالة
   التنفيذية الدقيقة في الطفل [غير مؤكدة].
5. **`overrides` في الجدول** [INFERENCE]: يُرجَّح أنه تجاوز تعارض الجداول — لم يُقرأ مستهلكه.
6. **مصير `onboarding_token`**: كود ميت في 182.41.0 — هل كان حياً في إصدارات أقدم؟ غير مهم للاقتباس.
7. **`sitesClassification`**: الاستدعاء الدقيق من واجهة استثناءات النطاقات لم يُتتبَّع سطراً بسطر [PARTIAL].
8. **أسرار `qinit.tenant`** (client_secret لكل منصة): آلية التحميل موثقة (`helpers/globals.ts`) —
   القيم في ملفات البناء لكل منصة (غير مشمولة في خرائط المصدر) ولم تُستخرَج عمداً (أسرار).
9. **حمولة `J5.b` لأمر `update_application`** [غير مؤكدة]: بنية حمولة تحديث التطبيق في الطفل لم تُقرأ.
10. **التحقق التشفيري للأوامر**: `s()` شكلي — هل يوجد تحقق حقيقي في طبقة FCM أخرى بالطفل؟
    لم يُبحث (خارج النطاق الأبوي).

---

## 9. خريطة الملفات المرجعية (مسارات دقيقة)

**المصدر الأصلي المعاد بناؤه** (من خرائط المصدر داخل الـ APK — `/tmp/qsrc/src/` مؤقتاً؛
الأصل: `~/workspace/rework/qustodio/apktool-out/assets/www/static/js/*.map`):
- `src/lib/qapi.ts` (1,633 سطراً) — **عميل الـ API: 95 مجموعة نقاط** (الأثمن)
- `src/records/profileRules/index.ts` (~800 سطر) — كل عقود القواعد: `TimesRecord`، `TimeSettingsRecord`،
  `WebRulesRecord`، `AppRulesRecord`، `PanicRulesRecord`، `CallsSmsContactRecord`
- `src/helpers/dates.ts:394-399` — `isHourState` (فك قناع البتات)
- `src/constants/index.ts` — `apiWeekdayKeys:175`، `WEBFILTER_ACTION_KEYS:200`،
  `WEBFILTER_DOMAIN_ACTIONS:207`، `APPLICATION_ACTIONS:283`، `NotificationType:550`
- `src/records/category.ts:36-67` — معرفات فئات الويب الثلاثون
- `src/records/routines/` — الروتينات: `routine.ts`، `schedule/schedule.ts`،
  `schedule/types/Schedule.types.ts`، `policy/policy.ts`، `policy/types/Policy.types.ts`
- `src/records/calendarRestrictionsPause/CalendarRestrictionPause.ts` — `restriction_type: 3`
- `src/ducks/profileRules/index.ts:565-600` — `modifyProfileRules()` (مسار الحفظ)
- `src/ducks/devices.ts:287-327` — أوامر `update_location`/`disable_panic_mode`؛ `:496-527` — ربط الأجهزة
- `src/ducks/pause/thunks.ts:108-111` — ترميز RRULE للإيقاف
- `src/ducks/extraTime.ts:130-167` — منح الوقت الإضافي
- `src/ducks/pushService/` — تسجيل FCM وتطبيع الإشعارات الواردة
- `src/ducks/notificationCenter/` — سحب التنبيهات (حد 15/صفحة)
- `src/ducks/persistentStorage.ts` — مفاتيح localStorage (الرموز بنص صريح)
- `src/routes.tsx` — خريطة التوجيه الكاملة (~60 مساراً)
- `src/store/setupStore.ts` — Redux + thunk + epics + hashHistory
- `src/helpers/globals.ts` — اختيار بيانات OAuth لكل منصة
- `src/components/TimeLimits/RestrictedTimesGrid.tsx` — شبكة الجدولة (اليوم يبدأ 5ص)
- `src/businessLogic/profileRules/webCategories.ts` — فئات المدارس المقفلة

**الأصلي (5 ملفات)** — `~/workspace/rework/qustodio/jadx-out/sources/com/qustodio/`:
- `pasa/QustodioPlugin.java` — الجسر + الروابط العميقة المؤجلة (يُنسخ حرفياً)
- `pasa/QustodioPushNotificationService.java` — توجيه Braze/FCM
- `family/parental/control/app/screentime/MainActivity.java`
- `apktool-out/AndroidManifest.xml` (229 سطراً) — مخطط `qustodiofamily://` + المفتاح المسرّب

**تطبيق الطفل (نظرة خاطفة مصرح بها فقط)** — `~/workspace/rework/qustodio-kids/`:
- `jadx-out/sources/com/qustodio/qustodioapp/service/messaging/interpreter/MessageV1Interpreter.java`
  — المفردات السبع للأوامر عن بُعد
