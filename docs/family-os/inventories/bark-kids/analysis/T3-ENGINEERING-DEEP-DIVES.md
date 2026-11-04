# التحليلات الهندسية المعمقة للمسارات الثلاثة — Bark Kids (T3 Engineering Deep Dives)

> **المعرف:** `T3-BKK-DEEP-DIVES-001`
> **التطبيق:** Bark Kids (`bark-kids`) — `com.pt.bark`
> **تاريخ التحديث:** 2026-11-04
> **حالة التحقق:** `Level A Code-Verified` للمسارات المفككة أدناه؛ الاستنتاجات موسومة صراحة

---

## 1. منهجية التحقيق ومستويات الإثبات المعتمدة

- **المستوى A (Ground Truth):** الكود المفكك فعلياً (jadx/smali) المقروء سطراً بسطر — موسوم `[VERIFIED]`.
- **المستوى B (Derived):** نماذج مستخلصة من بنية الكود وتسمياته — موسومة `[INFERENCE]`.
- **المستوى C (Unverified):** ما يتطلب مراقبة شبكية حية أو جهازاً حياً — موسوم `غير محسوم`.
- **حدود الدليل والأمانة العلمية:** أي رقم سطر مذكور تم التحقق منه بالقراءة المباشرة؛ حيث لم يُتحقق يُذكر الملف دون أرقام.

---

## 2. المسار الهندسي الأول (Track A): النماذج العصبية الثلاثة على الجهاز

### 2.1 مصنف الصور `ORTAnalyzer` — مفكك بالكامل
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/bark-kids/jadx-out/sources/us/bark/sdk/analysis/ORTAnalyzer.java` (قُرئ كاملاً).
- **التشريح الهندسي:**
  - Singleton عبر `Companion.getInstance(context)`؛ الجلسة تُبنى في الباني: `OrtEnvironment.getEnvironment()` ← `createSession(readModel())` حيث `readModel()` = بايتات `R.raw.adultmediamobile_31_1724800699_fp32` (16,883,648 بايت على القرص).
  - `analyze(Bitmap)`: تصغير لـ 224 (`BuildConfig.MODEL_INPUT_DIMENSIONS`) ← `preProcess` بتطبيع ImageNet حرفي `(x/255−0.485)/0.229`… ← موتر `float[1][3][224][224]` ← `session.run` ← `float[1][2]` ← `temperedSoftMax(temperature=1.5f)`.
  - القرار: `abusive = scores[1] >= 0.98` (`EXPLICIT_PROBABLY_THRESHOLD`).
  - التحمل: أي `Exception`/`OutOfMemoryError` ← `null` (فشل صامت).
- **حدود الدليل:** الأوزان ثنائية — الدقة الفعلية تحتاج اختباراً حياً (Level C).

### 2.2 مصنف النصوص `TextAnalyzer` — مفكك بالكامل
- **مستوى الإثبات:** **Level A** للكود، **Level B** لمكان التنفيذ
- **المصادر المفحوصة:** `TextAnalyzer.java` + `TextClassificationEngine.java` + `TokenizationManager.java` + `HuggingFaceTokenizer.java` (قُرئت كاملة).
- **التشريح الهندسي:**
  - الفئات الـ 12 مكتوبة صراحة (11 احتيال + `neutral`).
  - `preprocessText`: حذف `[^a-zA-Z0-9\s]` + lowercase — **إنجليزية فقط**.
  - `HuggingFaceTokenizer`: تحميل `tokenizer.json` (742KB) + `tokenizer_config.json` + `special_tokens_map.json` من `res/raw`؛ تقسيم بالمسافات → بحث مفردات → `[UNK]`؛ `cls`/`sep`؛ حشو/قطع لطول 512.
  - `TextClassificationEngine.classifyText`: ثلاثة موترات `long[1][seqLen]` (`input_ids`/`token_type_ids`/`attention_mask` بمطابقة الاسم) ← `extractRawOutput` ← `softMax` ← ترتيب تنازلي ← `ScoreResults{detectedIndices, detectedScore, inferenceTimeMs}`.
  - القرار: أول فئة غير `neutral` باحتمال `>= 0.97` (`SCAM_PROBABLY_THRESHOLD`) وإلا `null`.
- **حدود الدليل:** **صفر مستدعين داخل الـ APK** [VERIFIED بالبحث الشامل في smali] — التنفيذ في `us.bark.guarddog` عبر بثوث `ACTION_*_SCAM_DETECTED` [INFERENCE].

### 2.3 مصنف OTP `OTPClassifier` — مفكك بالكامل
- **مستوى الإثبات:** **Level A**
- **المصادر المفحوصة:** `shortcodes/OTPClassifier.java` + `TFIDFVectorizer.java` + `TfidfConfig.java` (قُرئت كاملة).
- **التشريح الهندسي:**
  - النموذج `mfaondevice_1_1234567890.onnx` (50,380 بايت) — أصغر نموذج.
  - `TFIDFVectorizer.transform`: regex `\b\w+\b` + إزالة التشكيل + n-grams من `tfidf_config.json` (صيغة sklearn كاملة) ← `float[1 × numFeatures]`.
  - `classify`: مخرج المؤشر 1 ← `float[1][2]` ← `prob = out[0][1]` ← `isSpam = prob >= 0.5f` ← `OTPClassificationResult{isSpam, probability, 'Spam'|'Legit'}`.
  - البوابة: `AnalysisManager.isShortCode` (وارد + غير جهة اتصال + Bark Phone + رقم قصير/حرفي).
- **حدود الدليل:** لا شيء جوهري — المسار مكتمل القراءة.

### 2.4 المحفزات وصيغ النتائج
- **مستوى الإثبات:** **Level A**
- **المصادر:** `com/pt/bark/helper/AnalysisManager.java` + `workers/ImageWorker.java` (قُرئا كاملين).
- **التشريح:**
  - الصور: `ImageWorker.doWork` (WorkManager) يمسح `MediaStore` الأحدث أولاً ← ضغط أصلي ← `ORTAnalyzer.analyze` ← عند `abusive` + مراقبة مفعّلة: `ExplicitMediaActivity` + **حذف الملف**.
  - النتائج: `{"adult_explicit": {"present", "score", "version", "deleted"}}` و`{"non_otp_unknown_sms": {"abusive", "score", "version", "deleted"}}` — `version` = اسم مورد النموذج؛ تُخزن في `MessagesDB.scores`.
  - النماذج **مضمّنة فقط** — صفر تحميل شبكي [VERIFIED بالبحث]؛ التحديث = إصدار تطبيق.

---

## 3. المسار الهندسي الثاني (Track B): بوابة رمز الجهاز ومضاد إلغاء التثبيت

### 3.1 كشف إلغاء التثبيت المزدوج
- **مستوى الإثبات:** **Level A**
- **المصادر:** `BarkAccessibilityService.java#L1734` (`blockedUninstall`) + `PackageInstallerHelper.java` (65 سطراً — قُرئ كاملاً).
- **التشريح:**
  - `blockedUninstall`: `TYPE_VIEW_FOCUSED` مع نص `"Bark"` ← دفع؛ `TYPE_WINDOW_STATE_CHANGED` في `com.android.settings` مع `"Bark"` + `app_info` ← دفع.
  - `PackageInstallerHelper`: `AlertDialog` بأربعة نصوص `[appLabel, uninstall_prompt, …]` ← `true` (متغير أمازون: `Delete from Device/Cloud/Share`).
  - المراقب: `throttleFirst(500ms)` ← `startPasswordActivity(true)` — البوابة خلال نصف ثانية.
  - حماية إضافية: حوار `Turn off Bark?` ← BACK مزدوج + بوابة الرمز.

### 3.2 بوابة الرمز من 6 أرقام
- **مستوى الإثبات:** **Level A**
- **المصادر:** `DeviceCodeActivity.java` + `PasswordProtectedViewModel.java` + `PersistenceManager.java` (قُرئت كاملة).
- **التشريح:**
  - `DEVICE_CODE_LENGTH = 6`؛ منع autofill؛ إرسال تلقائي عند 6 خانات؛ deep link `barkuninstall://uninstall` مصدَّر.
  - `handleVerify`: فارغ ← خطأ؛ `password == parentId` ← فتح محلي (بلا إنترنت)؛ وإلا `POST password` ← نجاح **أو HTTP 402** ← فتح.
  - الفتح = `updateUninstallUnlockedTimestamp()` ← نافذة 300,000ms.
  - **ثغرة:** `isWithinInitialSecurityGracePeriod` — 5 دقائق بعد التثبيت بلا حماية [VERIFIED].
  - `requestDeviceCode` (`bfk_device_code_requested`) يرسل الرمز للأب.
- **حدود الدليل والأمانة العلمية:** لا حماية ضد التخمين (brute force) ظاهرة — تُضاف في Family OS.

---

## 4. المسار الهندسي الثالث (Track C): النفق الأصلي والإقران والبروتوكول

### 4.1 `BarkVpnService` + `librltun.so`
- **مستوى الإثبات:** **Level A** للجافا، **Level B** لسلوك النفق الداخلي
- **المصادر:** `BarkVpnService.java` (560 سطراً — قُرئ كاملاً) + `TunnelVpn.java` + سلاسل/رموز `librltun.so`.
- **التشريح:**
  - الباني: `10.50.34.57/32` + `fd12:3456:789a::1/128`؛ `0.0.0.0/0` + `2000::/3`؛ DNS خمسة؛ استثناءات: الذات + telephony/mms + Dexcom G6/G7.
  - `TunnelVpn.startVpn` عبر JNA: `startCTunnel(tunFd, cacheDir, certBundle, deviceApiKey)`؛ `assets/cacert.pem` → اعتراض TLS.
  - الرموز: `RLTUN::APIClient::{sendCheckDNS, sendHeartbeat, postJSON}` + `TunnelFilter::setCheckDNSCallback(DNSRequestResolution, FirewallResolution)`؛ النقاط: `https://screentime.bark.us` + `/api/devices/checkDNS` + `/api/devices/heartbeat`.
  - الأحداث `vpnStarted/vpnRevoked` (نوع `vpn_status_change`) ← `POST devices/event`.
- **حدود الدليل:** صيغة قواعد الجدار الناري غير مرئية عميلاً — تُدفع من الخادم (Level C).

### 4.2 الإقران الرباعي
- **مستوى الإثبات:** **Level A**
- **المصادر:** `AddChildPresenterImpl.java` + `BarkApi.java` (قُرئت الواجهة كاملة).
- **التشريح:** `POST login` ← `POST children` ← `POST children/{id}/connections/android` ← `POST children/{id}/devices` (مفتاح النفق)؛ `BootstrapReceiver` مصدَّر للإعداد الجماعي.

### 4.3 بروتوكول GuardDog
- **مستوى الإثبات:** **Level A**
- **المصادر:** `BarkBroadcasts.java` (~50 إجراءً) + `GuardDogSetupHelper.java` (840 سطراً).
- **التشريح:** بثوث الاحتيال → `us.bark.guarddog` (حيث يعمل نموذج النصوص)؛ الإبطال → `us.bark.messages`؛ `ACTION_VPN_STARTED` → guarddog؛ `REQUEST_SHUTDOWN` وارد؛ المساعد يقود إعداد Bark Phone (وصول الاستخدام، DNS الخاص، البطارية) عبر accessibility قبل تسجيل الدخول.
