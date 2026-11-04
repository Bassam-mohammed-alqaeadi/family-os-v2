# التحليلات الهندسية المعمقة للمسارات الثلاثة — Bark (T3 Engineering Deep Dives)

> **المعرف:** `T3-BKP-DEEP-DIVES-001`
> **التطبيق:** Bark Parental Controls (`bark`) — الأب (RN 6.5.1) + الطفل (Kotlin 7.26.0)
> **تاريخ التحديث:** 2026-11-04
> **حالة التحقق:** `Level A Code-Verified` للمسارات المفككة أدناه؛ الاستنتاجات موسومة صراحة

---

## 1. منهجية التحقيق ومستويات الإثبات المعتمدة

- **المستوى A (Ground Truth):** الكود المفكك فعلياً (jadx/smali) المقروء سطراً بسطر — موسوم `[VERIFIED]`.
- **المستوى B (Derived):** نماذج مستخلصة من بنية الكود وتسمياته — موسومة `[INFERENCE]`.
- **المستوى C (Unverified):** ما يتطلب مراقبة شبكية حية أو فك Hermes — موسوم `غير محسوم`.
- **حدود الدليل:** أي رقم سطر مذكور تم التحقق منه بالقراءة المباشرة؛ حيث لم يُتحقق يُذكر الملف دون أرقام.

---

## 2. المسار الهندسي الأول (Track A): جسر React Native في تطبيق الأب

### 2.1 التهيئة والمكوّن [VERIFIED — Level A]
- **المصادر:** `rework/bark/jadx-out/sources/cm/pt/barkparent/MainActivity.java`، `MainApplication.java`، `BuildConfig.java`.
- **التشريح:**
  - `MainActivity extends ReactActivity` — `getMainComponentName()` تُرجع `"Bark"` حرفياً؛ `createReactActivityDelegate()` يستخدم `DefaultReactActivityDelegate` مع `DefaultNewArchitectureEntryPoint.getFabricEnabled()` — **Fabric مفعّل** (المعمارية الجديدة).
  - `MainApplication implements ReactApplication` — `getReactHost()` عبر `Lazy` يُنشئ `DefaultReactHost.getDefaultReactHost(..., "index", "index.android.bundle", ...)` — أسماء الحزمة/الملف مثبتة؛ `onCreate()` تُحمّل RN ثم `IterableApi.setContext()`.
  - `BuildConfig`: `VERSION_NAME="6.5.1"`، `VERSION_CODE=600500103`، `FLAVOR="bark"`، `IS_HERMES_ENABLED=true`، `IS_NEW_ARCHITECTURE_ENABLED=true`، `WEB_AGENT="(Bark Connect)"`.
- **التقسيم أصلي/JS:** حزمة Java الخاصة بالتطبيق **4 ملفات فقط** — **صفر وحدات أصلية مخصصة من Bark** (لا `com.bark.*` أصلي)؛ كل الميزات في JS.

### 2.2 الحزم الأصلية الـ 20 [VERIFIED — Level A]
- **المصدر:** `rework/bark/jadx-out/sources/com/facebook/react/PackageList.java` — `getPackages()` مقروءة حرفياً (20 حزمة: `MainReactPackage` + 19).
- **التحليل الوظيفي:**
  - **البيانات/الجلسة:** `AsyncStoragePackage`، `RNCConfigPackage` (تعكس `BuildConfig` بالـ reflection — `RNCConfigModuleImpl.getConfig()` مقروءة كاملةً)، `RNDeviceInfo`.
  - **الأمان/الدفع:** `ReactNativeBiometricsPackage` (بوابة الأهل)، `NitroIapPackage` + `NitroModulesPackage` + `dev.hyo.openiap` (فوترة Nitro/OpenIAP).
  - **الإشعارات/التسويق:** `ReactNativeOneSignalPackage` (التنبيهات)، `RNIterableAPIPackage` (تسويق).
  - **الواجهات:** `RNCWebViewPackage` (ربط الحسابات)، `RNScreensPackage`، `RNGestureHandlerPackage`، `SafeAreaContextPackage`، `BlurViewPackage`، `RNCMaskedViewPackage`، `RNSharePackage`، `RNRatePackage`، `RNReactNativeHapticFeedbackPackage`، `FBSDKPackage`.
  - **المراقبة:** `RNSentryPackage`.
- **حدود الدليل:** أسماء شاشات JS غير مستخرجة (minify) — بنية لوحة الأب التفصيلية `غير محسومة`.

### 2.3 حزمة Hermes وGraphQL [VERIFIED — Level A للآلية]
- **المصدر:** `rework/bark/apktool-out/assets/index.android.bundle` (3,284,704 بايت — `file` يؤكد Hermes v98).
- **المثبت:** سلاسل `graphql.persisted_query.hash.sha256Hash` و`graphql.persisted_query.version` — نمط **Apollo Persisted Queries**.
- **غير المحسوم (Level C):** رابط GraphQL الأساسي وقائمة العمليات — غائبان كنص صريح (تشفير/minify).

---

## 3. المسار الهندسي الثاني (Track B): الإقران برمز الجهاز والأوامر

### 3.1 تدفق الإقران الكامل [VERIFIED — Level A]
- **المصادر:** `rework/bark-kids/jadx-out/sources/com/pt/bark/auth/helper/LoginHelper.java`، `.../auth/presenter/SignInPresenterImpl.java`، `.../network/BarkApi.java`، `.../network/BarkRestClient.java`.
- **التشريح:**
  1. الأب يولّد الرمز في **قسم Account** (نص حرفي في `strings.xml` للطفل).
  2. الطفل: `SignInPresenterImpl.handleSignInClick(code)` ← `LoginHelper.createLoginCodeRequestBody(code)` يبني `{password: code, log: {data: {platform: "android", version: VERSION_NAME}, name: "child_app_login"}}` ← **`POST login`**.
  3. `SignInResponse{parent, child, capabilities}` — رمز مرتبط بطفل ← `view.onDeviceCode(child, parent)`؛ وإلا ← `launchChildrenPage(parent)`.
  4. **بوابات القدرات** (`cacheCapabilities`): `checkins.enabled` (دنيا)، `polling.providers ∋ "android"`، `screenTime.enabled` ← تُخزَّن في `PersistenceManager` وتتحكم بالرفع/الميزات.
  5. تسجيل الجهاز: `POST children/{child_id}/connections/android` بحقول `name`/`device` (اسم الجهاز)/`uid` (معرّف الجهاز) ← `ActivationResponse` (`AddChildPresenterImpl:113,210`، `ChildrenPresenterImpl:152,301`).
- **إعادة الاستخدام الثلاثية للرمز** [VERIFIED من `strings.xml`]: إقران أول + مضاد إلغاء تثبيت (`DeviceCodeActivity`) + وصول مؤقت للإعدادات المقيدة.

### 3.2 مفردات الأوامر والدفع [VERIFIED — Level A]
- **المصدر:** `rework/bark-kids/jadx-out/sources/us/bark/sdk/broadcasts/BarkBroadcasts.java` (قُرئ كاملاً — ~50 فعلاً `bark.intent.action.*` و~90 مفتاح `bark.intent.extra.*`).
- **الدفع الخارجي** (`notification/NotificationServiceExtension.java` — قُرئ كاملاً):
  - `additionalData.type == "attention"` (بلا عنوان/نص) ← وضع الانتباه: `setAttentionModeUntilSeconds(now + ttl)` مع **تقليم `ttl_in_seconds` إلى [0, 1800]** (افتراضي 120) ← بث `ACTION_INTERVAL_CHANGED` + `EXTRA_FORCE_SINGLE_UPDATE` — **موقع فوري قسري**.
  - دفع صامت آخر ← `preventDefault()` + `WorkHelper.startGeofenceWorker()` — **تحديث السياج**.
  - دفع بعنوان/نص ← إشعار يفتح `LauncherActivity`.
- **خط الرفع** (`network/ServerUpdate.java` — قُرئ كاملاً): بوابات (`isPermittedToUploadToServer && pollingEnabled` + عدم سبق الرفع) ← `POST connections/{id}/activities` (متزامن) ← `204/400` أو `200/201/202` تُعلَّم مرفوعة في `MessagesDB`؛ `SocketTimeoutException` ← إعادة محاولة؛ `401` ← `disconnect()`.

---

## 4. المسار الهندسي الثالث (Track C): محرك الذكاء على الجهاز

### 4.1 النماذج والمشغّل [VERIFIED — Level A]
- **المصدر:** `rework/bark-kids/apktool-out/res/raw/` + `lib/arm64-v8a/`.
- **المثبت فيزيائياً:** `adultmediamobile_31_1724800699_fp32.ort` (16.9MB)، `mobilemodel_1_1753905899.ort` (17.6MB)، `mfaondevice_1_1234567890.onnx` (50KB)، `tokenizer.json` (742KB)، `tfidf_config.json` (189KB: `max_features=5000`، `ngram_range=[1,3]`، `sublinear_tf`، `norm=l2`)، `libonnxruntime.so` + `libonnxruntime4j_jni.so`.

### 4.2 خط الاستدلال النصي [VERIFIED — Level A]
- **المصادر:** `us/bark/sdk/analysis/TextAnalyzer.java`، `TextClassificationEngine.java`، `HuggingFaceTokenizer.java`، `TokenizationManager.java` (قُرئت).
- **التشريح:** `analyze(input)` ← `tokenize` ← `TokenizationResult{inputIds, tokenTypeIds, attentionMask}` ← `classifyText(session, ...)` يبني 3 موتّرات `[1, seq_len]` ← `session.run` ← `softMax` ← ترتيب تنازلي ← `ScoreResults` ← **يُقبل فقط `probability >= 0.97` وغير `neutral`** وإلا `null`.
- **التصنيف (12 تسمية)** [VERIFIED حرفياً]: "Bad Investments"، "Catfish / Romance"، "Charity Scams"، "Fake Emergency"، "Fake Tech Support / Virus & Malware"، "Gift Card"، "Impersonation of Family"، "Impersonation of Government"، "Lottery / Sweepstakes"، "Medicare / Medicaid Fraud"، "Wire Transfer / Credit Card"، "neutral".

### 4.3 مصنّف الرموز القصيرة والصور [VERIFIED — Level A]
- **المصادر:** `us/bark/sdk/analysis/shortcodes/OTPClassifier.java`، `TFIDFVectorizer.java`، `ORTAnalyzer.java`، `com/pt/bark/helper/AnalysisManager.java` (قُرئت).
- **التشريح:** `OTPClassifier` (TF-IDF + ONNX) للرسائل من **أرقام مختصرة** — يُفعَّل فقط إذا: الرقم غير فارغ، الرسالة غير فارغة، جهاز Bark Phone، الرسالة **واردة**، المرسل **ليس جهة اتصال** (`AnalysisManager.isShortCode`).
- **تنسيق النتائج:** `{non_otp_unknown_sms: {abusive, score, version, deleted}}` و`{adult_explicit: {present, score, version, deleted}}` — تُرفق في `BarkMessage.scores` وتُرفع عبر `ServerUpdate`.
- **الحذف التلقائي** (بإذن الأب): `isMediaDeletionEnabled()` = (API 30+) ∧ `MANAGE_EXTERNAL_STORAGE` ∧ تفضيل المراقبة؛ `isScamDeletionEnabled()` = تفضيل كشف الاحتيال.
- **حدود الدليل:** دعم العربية في النماذج `غير مؤكد` [INFERENCE: المُجزّئ إنجليزي].
