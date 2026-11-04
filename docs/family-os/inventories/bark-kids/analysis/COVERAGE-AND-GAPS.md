# وثيقة الاستكشاف الوظيفي الشامل وتحليل الفجوات المعمارية — Bark Kids
# Comprehensive Functional Discovery, Boundary Reconciliation & Gaps Analysis (Unified Plan Deep-Doc #3)

> **التطبيق:** Bark Kids — `com.pt.bark` (v7.26.0)
> **الإصدار:** 7.26.0 (versionCode 911) | **أول جرد يوثق ذكاءً على الجهاز**

---

## 1. الإطار المنهجي المعتمد

- **المستوى A (مؤكد بالكود):** قُرئ الكود المفكك فعلياً — `Confirmed`.
- **المستوى B (مشتق):** مستنتج من البنية والتسميات — `Derived`.
- **جزئي (Partial):** منفذ جزئياً أو يتطلب طرفاً غير مفحوص (الخادم/تطبيق رفيق).
- **غير موجود (Not Found):** فجوة موثقة.

## 2. مصفوفة حدود الملكية وطوبولوجيا النظام

### توصيف نطاقات الملكية:
- **تطبيق الطفل (`com.pt.bark`):** كل المراقبة والإنفاذ والتحليل على الجهاز — حزمة واحدة.
- **تطبيق الأهل (`cm.pt.barkparent`):** لوحة تحكم React Native — **صفر منطق مراقبة** (من تقرير الجولة الأولى).
- **تطبيق GuardDog (`us.bark.guarddog`):** الإعداد الموجَّه + تنفيذ نموذج النصوص (خارج هذا الجرد).
- **تطبيق الرسائل (`us.bark.messages`):** يستقبل إبطالات الاحتيال.
- **السحابة:** `www.bark.us/api/v2` (إدارة) + `data.bark.us` (موقع) + `screentime.bark.us` (أحداث + أحكام DNS).
- **حد الملكية الحرجة:** الطفل **لا يتلقى أوامر مباشرة من الأهل** — كل السياسات تُدفع من الخادم.

## 3. حسم الفروقات المادية والتاريخية

- لا يوجد تقرير جولة أولى لـ Bark Kids — تقرير `bark.md` غطى تطبيق الأهل فقط وسجّل أن "المراقبة والتصنيف الفعلي يتم على السيرفر/تطبيق الطفل". **هذا الجرد يثبت العكس جزئياً**: التصنيف (صور/OTP) يتم **على الجهاز** بـ ONNX؛ تصنيف النصوص الطويلة في تطبيق GuardDog الرفيق.
- الإصدار المحلل (7.26.0) من `bark.us` الرسمي — أحدث من أي نسخة في الفرع القديم.

## 4. الفحص المعماري لطبقة البيانات والتخزين

**الحسم:** لا جداول علائقية معقدة — التخزين:
- `MessagesDB.MESSAGE_TABLE` (14 عموداً): `authorName`، `authorNumber`، `mediaFilepath`، `message`، `messageId`، `provider`، `recipientName`، `recipientId`، `sent`، `timestamp`، **`scores`** (JSON التحليل)، `type`، `uploadedToServer` (طابور الرفع)، `uuid` (مفتاح).
- SharedPreferences ملف **`"Id"`**: التوكن، `parentId`، `child`/`device` JSON، `connectionId`، أعلام الميزات، `GEO_FENCE_IDS`، الأحداث المخزنة.
- الوسائط: ملفات على القرص + سجلات في `MESSAGE_TABLE`.

## 5. المطابقة القطعية للواجهات البرمجية

### 5.1 إحصائيات المطابقة:
- **`BarkApi`:** 13 نقطة على `www.bark.us/api/v2` (مقروءة من الواجهة).
- **`BarkDataApi`:** `POST locations` على `data.bark.us`.
- **`ScreenTimeApi` + الأصلي:** `devices/event` + `devices/eventBatch` + `/api/devices/checkDNS` + `/api/devices/heartbeat` على `screentime.bark.us`.
- **المصادقة:** `Authorization` ببادئة `buildAuth`؛ مهلات 60s.
- **الدفع:** OneSignal/FCM؛ الأعطال Sentry (DSN مكتوب صراحة — مرفوض).

---

## 6. مصفوفة الاستكشاف والتغطية الوظيفية الشاملة

### 6.1 الإحصائيات الإجمالية للاستكشاف الوظيفي:
- **إجمالي الوظائف:** 44 وظيفة عبر 10 مجالات.
- **مؤكدة Level A:** 41 | **مشتقة Level B:** 1 | **جزئية:** 0 | **غير موجودة:** 2.

### 6.2 جدول الفهرسة السريع للوظائف الـ 44 (Quick Reference Matrix):

| المعرف | الوظيفة | النطاق | المستوى |
|---|---|---|---|
| BKK-FUN-000001 | تصنيف الصور الإباحية (ONNX) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000002 | تطبيع ImageNet للمعالجة المسبقة | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000003 | tempered-softmax + عتبة 0.98 | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000004 | تصنيف النصوص (12 فئة احتيال) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000005 | خط الترميز HF (512 رمزاً) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000006 | تصنيف OTP للرموز القصيرة | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000007 | التجهيز TF-IDF (sklearn) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000008 | كشف الرمز القصير (heuristic) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000009 | مسح صور MediaStore (الأحدث أولاً) | المراقبة | A مؤكدة |
| BKK-FUN-000010 | حذف الصورة الإباحية + شاشة تحذير | الإنفاذ | A مؤكدة |
| BKK-FUN-000011 | صيغة scores JSON (version مضمّن) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000012 | إصدار النماذج باسم المورد | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000013 | النماذج مضمّنة فقط (بلا تحديث OTA) | الذكاء على الجهاز | A مؤكدة |
| BKK-FUN-000014 | توزيع أحداث accessibility (~57 مساعداً) | الإنفاذ | A مؤكدة |
| BKK-FUN-000015 | كشف حوار إلغاء التثبيت | مضاد العبث | A مؤكدة |
| BKK-FUN-000016 | كشف شاشة معلومات التطبيق | مضاد العبث | A مؤكدة |
| BKK-FUN-000017 | حماية إعدادات accessibility (خروج قسري) | مضاد العبث | A مؤكدة |
| BKK-FUN-000018 | بوابة رمز الجهاز (6 أرقام) | مضاد العبث | A مؤكدة |
| BKK-FUN-000019 | تحقق الرمز خادمياً (POST password، 402=مقبول) | مضاد العبث | A مؤكدة |
| BKK-FUN-000020 | تجاوز محلي بـ parentId (بلا إنترنت) | مضاد العبث | A مؤكدة |
| BKK-FUN-000021 | نافذة الفتح 5 دقائق + سماح التثبيت | مضاد العبث | A مؤكدة |
| BKK-FUN-000022 | بناء نفق VPN الكامل | الشبكة | A مؤكدة |
| BKK-FUN-000023 | النفق الأصلي RLTUN عبر JNA | الشبكة | A مؤكدة |
| BKK-FUN-000024 | فحص DNS/جدار الحماية (checkDNS) | الشبكة | A مؤكدة |
| BKK-FUN-000025 | نبض heartbeat للسياسات | الشبكة | A مؤكدة |
| BKK-FUN-000026 | حزمة شهادات CA لاعتراض TLS | الشبكة | A مؤكدة |
| BKK-FUN-000027 | معالجة إلغاء VPN + إشعار | الشبكة | A مؤكدة |
| BKK-FUN-000028 | الإقران (activateConnection) | الإقران | A مؤكدة |
| BKK-FUN-000029 | تسجيل جهاز ScreenTime (مفتاح النفق) | الإقران | A مؤكدة |
| BKK-FUN-000030 | مساعد إعداد GuardDog (قبل الدخول) | الإقران | A مؤكدة |
| BKK-FUN-000031 | بروتوكول بثوث الاحتيال → guarddog | التكامل | A مؤكدة |
| BKK-FUN-000032 | حراسة INVALIDATE_SCAMS | التكامل | B مشتقة |
| BKK-FUN-000033 | مراقبة SMS/MMS (شهران للخلف) | المراقبة | A مؤكدة |
| BKK-FUN-000034 | جهات الاتصال + سياسة الموافقة | المراقبة | A مؤكدة |
| BKK-FUN-000035 | سجل المتصفح (Chrome/Samsung) | المراقبة | A مؤكدة |
| BKK-FUN-000036 | خدمة لقطات الشاشة (MediaProjection) | المراقبة | A مؤكدة |
| BKK-FUN-000037 | تتبع الموقع الخلفي | المراقبة | A مؤكدة |
| BKK-FUN-000038 | مخزن MessagesDB + طابور الرفع | المزامنة | A مؤكدة |
| BKK-FUN-000039 | تجميع الأحداث (eventBatch) | المزامنة | A مؤكدة |
| BKK-FUN-000040 | حماية QuickShare للجهات غير المعتمدة | المراقبة | A مؤكدة |
| BKK-FUN-000041 | تنفيذ نموذج النصوص داخل الـ APK | — | **غير موجودة** |
| BKK-FUN-000042 | إنفاذ DeviceAdmin | — | **غير موجودة** |
| BKK-FUN-000043 | دفع OneSignal/FCM | التكامل | A مؤكدة |
| BKK-FUN-000044 | تقارير الأعطال Sentry | التكامل | A مؤكدة |

### 6.3 السجل التشريحي التفصيلي للوظائف (نموذج موسع لأهم 12 — الباقي في الجدول):

#### المجال 1: الذكاء على الجهاز

##### BKK-FUN-000001: تصنيف الصور الإباحية (ONNX)
- **المسار البرمجي:** `ImageWorker.doWork` ← `ORTAnalyzer.getInstance(ctx).analyze(path)` ← `createSession(R.raw.adultmediamobile_31_1724800699_fp32)` ← `preProcess` (224 + ImageNet) ← `session.run` ← `temperedSoftMax(1.5)` ← `scores[1] >= 0.98`
- **المصدر الفيزيائي:** `rework/bark-kids/jadx-out/sources/us/bark/sdk/analysis/ORTAnalyzer.java`
- **الموارد والأدلة:** `BKK-RES-000002` — `BKK-EVD-000003`
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### BKK-FUN-000004: تصنيف النصوص (12 فئة احتيال)
- **المسار البرمجي:** `TextAnalyzer.analyze(text)` ← `TokenizationManager.tokenize` (512) ← `TextClassificationEngine.classifyText` ← أول فئة غير `neutral` باحتمال ≥ 0.97
- **المصدر الفيزيائي:** `rework/bark-kids/jadx-out/sources/us/bark/sdk/analysis/TextAnalyzer.java`
- **الموارد والأدلة:** `BKK-RES-000003` — `BKK-EVD-000005`
- **القيد:** صفر مستدعين داخل الـ APK — التنفيذ في `us.bark.guarddog` [VERIFIED بالبحث]

##### BKK-FUN-000006: تصنيف OTP للرموز القصيرة
- **المسار البرمجي:** `AnalysisManager.analyzeShortCode` ← `isShortCode` (heuristic) ← `OTPClassifier.classify` ← `TFIDFVectorizer.transform` ← `mfaondevice_1_1234567890.onnx` ← `prob >= 0.5`
- **المصدر الفيزيائي:** `rework/bark-kids/jadx-out/sources/us/bark/sdk/analysis/shortcodes/OTPClassifier.java`
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 2: مضاد العبث

##### BKK-FUN-000018: بوابة رمز الجهاز
- **المسار البرمجي:** `blockedUninstall`/`PackageInstallerHelper` ← `throttleFirst(500ms)` ← `DeviceCodeActivity` ← `PasswordProtectedViewModel.handleVerify` ← (محلي: `parentId` | خادمي: `POST password` + 402)
- **القاعدة:** الفتح = نافذة 5 دقائق (`PREFS_KEY_UNINSTALL_TIMESTAMP`)؛ فترة سماح 5 دقائق بعد التثبيت (ثغرة)
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 3: الشبكة

##### BKK-FUN-000023: النفق الأصلي RLTUN
- **المسار البرمجي:** `BarkVpnService.connectVpn` ← `VpnService.Builder` (10.50.34.57، كل المسارات) ← `TunnelVpn.startVpn` ← JNA `startCTunnel(tunFd, cacheDir, certBundle, apiKey)` ← `RLTUN::APIClient`
- **الأحكام:** `sendCheckDNS` ← `https://screentime.bark.us/api/devices/checkDNS`؛ `sendHeartbeat` ← `/api/devices/heartbeat`
- **مستوى الإثبات:** **Level A** (جافا) / **Level B** (سلوك النفق الداخلي)

#### المجال 4: الإقران

##### BKK-FUN-000028: الإقران
- **المسار البرمجي:** `SignInActivity` (`POST login`) ← `AddChildActivity` (`POST children`) ← `activateConnection` (`POST children/{id}/connections/android`) ← `loadDevice` (`POST children/{id}/devices` → `apiKey`)
- **مستوى الإثبات:** **Level A** — `Confirmed`

### 6.4 الفجوات الحرجة (Gaps):
- **BKK-FUN-000041 (غير موجودة):** نموذج النصوص مُعرَّف بلا مستدعٍ داخلي — **Family OS يشغّله محلياً** (لا تطبيق رفيق).
- **BKK-FUN-000042 (غير موجودة):** بلا DeviceAdmin — الاعتماد على accessibility + VPN فقط (هش أمام الوضع الآمن).
- **ثغرات موثقة (مرفوضة):** `DEBUG_PASSWORD_BYPASS_ENABLED=true`، فترة سماح التثبيت، مفاتيح مكتوبة صراحة، `requestLegacyExternalStorage`، `allowBackup=true`، إنجليزية فقط في `preprocessText`.
