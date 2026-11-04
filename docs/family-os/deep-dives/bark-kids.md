# تحليل الهندسة العكسية العميق — Bark Kids (تطبيق الطفل)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style) لتطبيق طفل Bark Kids —
> **لا يوجد تقرير جولة أولى** لهذا التطبيق (تقرير `bark.md` غطى تطبيق الأهل `cm.pt.barkparent` فقط، وهو React Native).
> هذا أول توثيق لأي تطبيق طفل من Bark، وهو **أهم تطبيق طفل في البرنامج** لسبب واحد:
> **يشحن ONNX Runtime على الجهاز مع 3 نماذج تصنيف** — التحقق العملي الوحيد لمعمارية "ذكاء خفيف على الجهاز + وكيل خادمي"
> التي اعتمدها Family OS.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).
> الغيابات مثبتة بالبحث الشامل لا بالافتراض.

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.pt.bark` |
| الاسم التجاري | Bark Kids |
| الإصدار المحلَّل | 7.26.0 (versionCode 911) |
| المصدر | `bark.us/download/bark-kids` الرسمي (تحميل مباشر، ليس APKPure) |
| نوع الملف | APK مستقل (~93MB) — **تطبيق واحد** (ليس منظومة ثنائية مثل FamiSafe) |
| smali / java | 17,318 / 8,869 |
| اللغة | **Kotlin أصلي** (ليس React Native مثل تطبيق الأهل) |
| الدور | **وكيل الإنفاذ والمراقبة على جهاز الطفل**: حظر ويب عبر VPN، كشف احتيال بالنصوص، كشف صور إباحية، مراقبة SMS/MMS/جهات اتصال/متصفح/لقطات شاشة/موقع |

### البنية المعمارية العليا [VERIFIED]

```
com.pt.bark.application.BarkApplication (المدخل)
├── com.pt.bark.services.accessibility.BarkAccessibilityService  ← مضاد العبث + كشط المحتوى (~57 مساعداً)
├── com.pt.bark.vpn.BarkVpnService + TunnelVpn (JNA → librltun.so)  ← تصفية الويب بالنفق
├── com.pt.bark.workers.* (19 عامل WorkManager)  ← المراقبة الدورية والرفع
├── com.pt.bark.screenshot.ScreenShotService  ← لقطات الشاشة
├── com.pt.bark.location.BarkLocationService  ← الموقع الخلفي
├── com.pt.bark.databases.MessagesDB  ← مخزن الرسائل المحلي + طابور الرفع
├── com.pt.bark.uninstall.DeviceCodeActivity  ← بوابة رمز الجهاز (مضاد إلغاء التثبيت)
└── us.bark.sdk.*  ← SDK مشترك: التحليل (ONNX)، البثوث، الموقع، الضغط
```

### الفرق الجوهري عن تطبيق الأهل [VERIFIED]
تطبيق الأهل (`cm.pt.barkparent`) = React Native، لوحة تحكم فقط، **صفر منطق مراقبة** — كل التصنيف على الخادم.
تطبيق الطفل (`com.pt.bark`) = Kotlin أصلي، **3 نماذج ONNX على الجهاز** + نفق VPN أصلي + accessibility.
**الاستراتيجية:** المراقبة الثقيلة على جهاز الطفل (حيث البيانات)، والمراجعة البشرية على تطبيق الأهل.

### العلاقة طفل ↔ خادم ↔ أهل [VERIFIED]
```
الطفل: يجمع (SMS/MMS/صور/متصفح/موقع) → يحلل محلياً (ONNX) → يخزن (MessagesDB.scores)
  → يرفع دفعات (POST connections/{id}/activities | inventories | logs)
الخادم: www.bark.us/api/v2 (إدارة) + data.bark.us (موقع) + screentime.bark.us (أحداث + DNS)
الأهل: تطبيق منفصل cm.pt.barkparent — يسحب التنبيهات من الخادم (لا اتصال مباشر بالطفل)
الرفيق: us.bark.guarddog (تطبيق منفصل) — يستقبل بثوث الاحتيال ويشغّل نموذج النص
```

---

## 2. الغوص العميق — الذكاء الاصطناعي على الجهاز (ONNX Runtime)

> **هذا أهم قسم في الوثيقة.** Bark Kids هو التطبيق الوحيد من بين كل تطبيقات المرجع الذي يشحن
> استدلالاً عصبياً حقيقياً على الجهاز. كل التفاصيل أدناه مقروءة من الكود والموارد.

### 2.1 حزم المكتبات الأصلية [VERIFIED]

`~/workspace/rework/bark-kids/apktool-out/lib/<ABI>/`:

| ABI | `libonnxruntime.so` | `libonnxruntime4j_jni.so` | `librltun.so` |
|---|---|---|---|
| arm64-v8a | 27,072,384 بايت (~25.8MB) | 111,648 | 4,246,712 (~4MB) |
| armeabi-v7a | 19,255,048 (~18.4MB) | 81,536 | 3,461,708 |
| x86 | 32,674,464 | 93,620 | 4,370,888 |
| x86_64 | 32,864,824 | 100,016 | 4,476,968 |

- `libonnxruntime.so` = محرك ONNX Runtime الكامل (C++)؛ `libonnxruntime4j_jni.so` = جسر JNI لواجهة `ai.onnxruntime.*` الجافا [VERIFIED — الأسماء والمسارات].
- تُشحن **لكل المعماريات الأربع** — لا تحميل ديناميكي، الحجم ثابت في الـ APK [VERIFIED].
- التكلفة: ~26MB من أصل 93MB للـ APK على arm64 (≈28%) — ثمن معلن للذكاء على الجهاز [INFERENCE من الأحجام].

### 2.2 النماذج الثلاثة [VERIFIED]

`~/workspace/rework/bark-kids/apktool-out/res/raw/`:

| الملف | الحجم | الصيغة | الغرض |
|---|---|---|---|
| `adultmediamobile_31_1724800699_fp32.ort` | 16,883,648 (~16.1MB) | `.ort` (مُجمَّع ORT) | **تصنيف الصور: محتوى إباحي/مسيء** |
| `mobilemodel_1_1753905899.ort` | 17,641,080 (~16.8MB) | `.ort` | **تصنيف النصوص: 12 فئة احتيال** |
| `mfaondevice_1_1234567890.onnx` | 50,380 (~49KB) | `.onnx` خام | **تصنيف رموز OTP القصيرة: spam/legit** |
| `tokenizer.json` | 742,346 | JSON | مفردات HuggingFace لنموذج النص |
| `tokenizer_config.json` | 1,556 | JSON | إعدادات المُرمِّز |
| `special_tokens_map.json` | 732 | JSON | الرموز الخاصة (cls/sep…) |
| `tfidf_config.json` | 189,397 | JSON | إعدادات TF-IDF لنموذج OTP |

- **لا توجد آلية تحديث للنماذج** [VERIFIED بالبحث الشامل]: صفر إشارة لتحميل `.ort`/`.onnx` في كامل `us/bark` (smali + java)؛
  النماذج تُقرأ حصراً عبر `res.openRawResource(R.raw.*)`؛ التحديث = **إصدار تطبيق جديد فقط**.
- التسمية نفسها هي الإصدار: `getModelVersion()` تُرجع **اسم المورد** (`adultmediamobile_31_1724800699_fp32`)
  ويُضمَّن في JSON النتائج المرفوعة — تتبع النماذج خادمياً بلا قناة تحديث [VERIFIED].

### 2.3 نموذج الصور: `ORTAnalyzer` [VERIFIED — قُرئ كاملاً]

**المسار:** `jadx-out/sources/us/bark/sdk/analysis/ORTAnalyzer.java`

- **المدخل:** `ORTAnalyzer.Companion.getInstance(context)` — **Singleton**؛ الجلسة تُبنى مرة واحدة في الباني عبر `createOrtSession()` ← `ortEnv.createSession(readModel())` حيث `readModel()` = بايتات `R.raw.adultmediamobile_31_1724800699_fp32` [VERIFIED].
- **المعالجة المسبقة** (`preProcess`): تصغير لـ `BuildConfig.MODEL_INPUT_DIMENSIONS = 224`، ثم تطبيع ImageNet حرفياً:
  `R: (x/255 − 0.485)/0.229`، `G: (x/255 − 0.456)/0.224`، `B: (x/255 − 0.406)/0.225` — تخطيط `float[1][3][224][224]` [VERIFIED].
- **الاستدلال:** `session.run({inputName: OnnxTensor})` ← المخرج `float[1][2]` ← `temperedSoftMax(temperature=1.5f)` [VERIFIED].
- **العتبة** (`us/bark/sdk/BuildConfig.java` — قُرئ كاملاً) [VERIFIED]:
  ```java
  EXPLICIT_PROBABILITY_INDEX = 1
  EXPLICIT_PROBABLY_THRESHOLD = 0.98   // abusive = scores[1] >= 0.98
  SCAM_PROBABLY_THRESHOLD = 0.97
  ```
- **المخرج:** `AnalysisResult{scores: List<Float>, abusive: Boolean}`.
- **التحمل:** أي استثناء أو `OutOfMemoryError` ← يُرجع `null` (فشل صامت — لا ينهار التطبيق) [VERIFIED].

### 2.4 نموذج النصوص: `TextAnalyzer` + `TextClassificationEngine` [VERIFIED — قُرئت كاملة]

**المسارات:** `us/bark/sdk/analysis/TextAnalyzer.java`، `TextClassificationEngine.java`، `TokenizationManager.java`، `HuggingFaceTokenizer.java`

- **الفئات الـ 12** (مكتوبة صراحة في `TextAnalyzer`) [VERIFIED]:
  `Bad Investments`، `Catfish / Romance`، `Charity Scams`، `Fake Emergency`، `Fake Tech Support / Virus & Malware`، `Gift Card`، `Impersonation of Family`، `Impersonation of Government`، `Lottery / Sweepstakes`، `Medicare / Medicaid Fraud`، `Wire Transfer / Credit Card`، `neutral`.
- **خط المعالجة** [VERIFIED]:
  1. `preprocessText`: إزالة كل ما ليس `[a-zA-Z0-9\s]` + lowercase (إنجليزية فقط — **لا عربية**)؛
  2. `HuggingFaceTokenizer`: تحميل `tokenizer.json` + `tokenizer_config.json` + `special_tokens_map.json` من `res/raw`؛ ترميز بسيط (تقسيم بالمسافات → بحث في المفردات → `[UNK]` للمجهول) مع `cls_token`/`sep_token`؛
  3. `TokenizationResult{inputIds, attentionMask, tokenTypeIds}` بطول ثابت **512** (`MAX_SEQUENCE_LENGTH`)؛
  4. `TextClassificationEngine.classifyText`: ثلاثة موترات `long[1][seqLen]` (`input_ids`، `token_type_ids`، `attention_mask` — مطابقة بالاسم مع fallback لـ `input_ids` عند اسم مجهول)؛
  5. `extractRawOutput` ← `softMax` عادي ← ترتيب تنازلي ← `ScoreResults{detectedIndices, detectedScore, inferenceTimeMs}`؛
  6. القرار في `TextAnalyzer.analyze`: أول فئة باحتمال `>= 0.97` **وليست** `neutral` — وإلا `null`.
- **التوقيت:** `ScoreResults` تحمل `inferenceTimeMs` (قياس `currentTimeMillis` حول `session.run`) — جاهزية لمراقبة الأداء [VERIFIED].

### 2.5 نموذج OTP: `OTPClassifier` + `TFIDFVectorizer` [VERIFIED — قُرئت كاملة]

**المسارات:** `us/bark/sdk/analysis/shortcodes/OTPClassifier.java`، `TFIDFVectorizer.java`، `TfidfConfig.java`، `TextPreprocessor.java`

- **الغرض:** تصنيف رسائل **الرموز القصيرة** (short codes) — رسائل MFA/OTP من أرقام مجهولة: `Spam` أم `Legit` [VERIFIED].
- **المعالجة:** `TextPreprocessor.cleanText` ← `TFIDFVectorizer.transform` (regex `\b\w+\b`، إزالة التشكيل، n-grams من `tfidf_config.json` بصيغة sklearn: `max_features`، `ngram_range`، `sublinear_tf`، `norm`، `smooth_idf`، `idf_weights`) ← متجه `float[1 × numFeatures]` [VERIFIED].
- **الاستدلال:** `session.run` على `mfaondevice_1_1234567890.onnx` ← المخرج الثاني `result.get(1)` ← `float[1][2]` ← الاحتمال الثاني `f` ← **`SPAM_THRESHOLD = 0.5f`** ← `OTPClassificationResult{isSpam, probability, label="Spam"|"Legit"}` [VERIFIED].
- النموذج 49KB فقط — يعمل حتى على الأجهزة الضعيفة [INFERENCE من الحجم].

### 2.6 من يستدعي ماذا — محفزات الاستدعاء [VERIFIED]

| النموذج | المستدعي | المحفز | الخيط |
|---|---|---|---|
| الصور (`ORTAnalyzer`) | `com.pt.bark.workers.ImageWorker.doWork` | عامل WorkManager يمسح `MediaStore.Images` (الأحدث أولاً) | خلفية WorkManager |
| الصور | `com.pt.bark.workers.ImageHistoryWorker` / `MmsHistoryWorker` | المسح التاريخي + مرفقات MMS | خلفية WorkManager |
| OTP (`OTPClassifier`) | `com.pt.bark.helper.AnalysisManager.analyzeShortCode` | رسالة SMS واردة من **رمز قصير** (انظر §2.7) | خلفية |
| النصوص (`TextAnalyzer`) | **لا مستدعٍ داخل هذا الـ APK** | يُشغَّل في تطبيق `us.bark.guarddog` الرفيق عبر بثوث الاحتيال | — |

- **إثبات غياب مستدعي `TextAnalyzer`**: بحث شامل في كل smali — `Lus/bark/sdk/analysis/TextAnalyzer;` مذكور في ملفَي التعريف فقط (الكلاس + Companion) [VERIFIED].
- `BarkVpnService.onDestroy` (على Bark Phone) يستدعي `ORTAnalyzer.getInstance(...).close()` — إغلاق الجلسة عند تدمير الخدمة [VERIFIED].

### 2.7 كشف الرمز القصير (Short-Code Heuristic) [VERIFIED]

`AnalysisManager.isShortCode(number, message, isSent)`:
1. يُرفض إذا: الرقم فارغ، الرسالة فارغة، **ليس Bark Phone**، الرسالة مرسلة، أو الرقم **موجود في جهات الاتصال**.
2. يُقبل إذا: الرقم يحوي حروفاً، أو طول الأرقام 3–6، أو 7 أرقام تبدأ بـ `1`، أو 8 أرقام.
3. عند القبول ← `OTPClassifier.classify(message)` ← النتيجة تُنسَّق في JSON (§2.8).

### 2.8 صيغة النتائج المرفوعة [VERIFIED]

`AnalysisManager.formatImageAnalysisScores` / `formatShortCodeAnalysisScores`:
```json
{"adult_explicit": {"present": true, "score": 0.9912, "version": "adultmediamobile_31_1724800699_fp32", "deleted": false}}
{"non_otp_unknown_sms": {"abusive": true, "score": 0.87, "version": "mfaondevice_1_1234567890", "deleted": false}}
```
- تُخزن في عمود `scores` (نص) في `MESSAGE_TABLE` وتُرفع مع الرسالة [VERIFIED].
- `deleted`: يُحذف الملف/الرسالة محلياً فقط إذا كانت المراقبة مفعّلة **و** النتيجة إيجابية (`isMediaDeletionEnabled` تتطلب Android 30+ و`MANAGE_EXTERNAL_STORAGE`؛ `isScamDeletionEnabled` من `PersistenceManager`).

### 2.9 قرار الصور الإباحية: الحذف والتحذير [VERIFIED]

`ImageWorker.doWork`:
1. يمسح `MediaStore.Images.Media.EXTERNAL_CONTENT_URI` مرتبة بـ `date_added DESC`.
2. يضغط كل صورة عبر `MediaCompressor.compressImageNative` (أصلي).
3. على Bark Phone: `ORTAnalyzer.analyze(compressedPath)` → إذا `abusive` **و** `getExplicitMediaMonitoringEnabled`:
   - يفتح `ExplicitMediaActivity` (شاشة تحذير للطفل)؛
   - **يحذف الملف** (`new File(path).delete()`).
4. يخزن `BarkMedia` (مع `scores`) في `MessagesDB` ← `UploadWorker` يرفع لاحقاً.

### 2.10 حدود وملاحظات معمارية [VERIFIED/INFERENCE]

- **النصوص إنجليزية فقط**: `preprocessText` يحذف كل ما ليس لاتينياً — النموذج أعمى عن العربية [VERIFIED — قيد مباشر].
- **الصور بلا حدود حجم مدروسة**: `System.gc()` قبل الفك + التقاط `OutOfMemoryError` — معالجة بدائية للذاكرة [VERIFIED].
- **الجلسات Singleton بلا تجمع**: استدعاءات متزامنة على نفس الجلسة من عمال مختلفين قد تتزاحم — لا قفل ظاهر [INFERENCE من غياب التزامن].
- **`.ort` مقابل `.onnx`**: نموذجا الصور والنصوص بصيغة `.ort` (مُجمَّعة مسبقاً لمنصة ORT — تحميل أسرع) بينما OTP خام `.onnx` [VERIFIED من الامتدادات].
- **لا NNAPI/CoreML مُفعَّل**: أعلام المزودين موجودة في `ai/onnxruntime/providers/` لكن لا استدعاء لها في كود Bark — الاستدلال CPU فقط [VERIFIED بالبحث].

---

## 3. الإنفاذ: Accessibility + VPN (البنية المزدوجة)

> Bark Kids **بلا DeviceAdmin** [VERIFIED — لا `DeviceAdminReceiver` في الـ manifest] — خلاف FamiSafe/Qustodio.
> الإنفاذ = Accessibility (مضاد العبث + كشط) + VPN (تصفية الشبكة). طبقتان مستقلتان.

### 3.1 جرد الـ Manifest [VERIFIED — قُرئ كاملاً]

`~/workspace/rework/bark-kids/apktool-out/AndroidManifest.xml` (326 سطراً):
- **الأنشطة (19)**: `LauncherActivity` (البوابة المصدَّرة + deep link `barkchild://`)، `DeviceCodeActivity` (مصدَّرة + `barkuninstall://uninstall`)، `VpnReconnectActivity`، `ScreenShotActivity`، `SettingDisabledActivity` (مصدَّرة)، `AddChildActivity`، `ChildrenActivity`، `HomeActivity`، `PhoneSetupActivity`…
- **الخدمات (16)**: `BarkAccessibilityService` (مصدَّرة، `BIND_ACCESSIBILITY_SERVICE`)، `BarkVpnService` (مصدَّرة، `BIND_VPN_SERVICE`، `SUPPORTS_ALWAYS_ON=true`، نوع `specialUse`)، `BarkLocationService` (نوع `location`)، `ScreenShotService` (نوع `mediaProjection`)، خدمات OneSignal/Firebase/WorkManager.
- **المستقبلات (29)**: `RebootReceiver` (مصدَّر، `BOOT_COMPLETED` + `LOCKED_BOOT_COMPLETED` + `directBootAware`)، `GeofenceReceiver`، `BarkPhoneLocationReceiver`، مستقبلات تفعيل (`EnableScamDetectionReceiver`، `ExplicitMediaMonitoringReceiver`…)، `ContactApprovalPolicyReceiver` (محمي بصلاحية توقيع)، OneSignal/FCM…
- **المزودون (6)**: `FileProvider`، Sentry، Firebase، androidx-startup…
- **52 صلاحية**: `READ_SMS/RECEIVE_SMS/RECEIVE_MMS`، `READ_CONTACTS`، `READ_HISTORY_BOOKMARKS`، موقع دقيق + خلفي، `QUERY_ALL_PACKAGES`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `MANAGE_EXTERNAL_STORAGE`، `FOREGROUND_SERVICE_*`، `CAMERA`، `ACTIVITY_RECOGNITION` + صلاحية مخصصة `us.bark.guarddog.permission.INVALIDATE_SCAMS`.
- **علامات لافتة** [VERIFIED]: `requestLegacyExternalStorage="true"`؛ `allowBackup="true"`؛ مفتاح خرائط Google مكتوب صراحة (`AIzaSyC28kiet81WYwYOuF6RQu80-PFlPyVU878`) — مرفوض إعادة استخدامه؛ Sentry DSN مكتوب صراحة (`https://95aa82c111714bf0b18ad5048c7ce0f6@sentry.bark.us/19`)؛ `meta-data isMonitoringTool=child_monitoring`.

### 3.2 `BarkAccessibilityService` — الموزّع العملاق [VERIFIED]

**المسار:** `jadx-out/sources/com/pt/bark/services/accessibility/BarkAccessibilityService.java` (1816 سطراً)

**الإعداد** (`apktool-out/res/xml/bark_accessibility_service_config.xml`): `typeAllMask` + `feedbackAllMask`، `flagReportViewIds|flagRetrieveInteractiveWindows`، `canRetrieveWindowContent=true`، **`canPerformGestures=true`**، **`canTakeScreenshot=true`** [VERIFIED].

**التدفق** (`onAccessibilityEvent`):
1. **وضع الإعداد** (قبل تسجيل الدخول على Bark Phone): الأحداث من `us.bark.guarddog` / `com.android.settings` / `com.android.systemui` تُوَجَّه لـ `GuardDogSetupHelper` (معالج الإعداد الموجَّه) — لا مراقبة قبل الربط [VERIFIED].
2. **كشف إلغاء التثبيت أولاً**: `blockedUninstall(event)` (§4.1) — يُوقف المعالجة إذا اكتُشف.
3. **التوجيه حسب الحزمة**: `switch` على اسم الحزمة → **~57 مساعداً** (`*Helper`) في `com/pt/bark/helper/accessibility/`:
   - **كاشطات المحتوى**: `WhatsAppHelper`، `InstagramHelper`، `TikTokHelper`، `SnapchatHelper`، `DiscordHelper`، `RobloxHelper`، `YouTubeHelper`، `GmailHelper`، `KikHelper`، `SpotifyHelper`، `PinterestHelper`، `SkypeHelper`، `VscoHelper`، `SteamChatHelper`، `BandHelper`، `HollaHelper`، `LipsiHelper`، `MessengerKidsHelper`، `ChatGptHelper`، `GeminiHelper`، `GoogleMeetHelper`…
   - **المتصفحات**: `ChromeHelper`، `FirefoxHelper`، `SamsungBrowserHelper`، `SilkHelper`؛
   - **مضاد العبث**: `PackageInstallerHelper`، `PackagePermissionHelper`، `SettingsHelper`، `SystemAppsHelper`، `UserManagementHelper`، `GuardDogSetupHelper`؛
   - **النظام**: `DialerHelper`، `MyFilesHelper`، `PixelLauncherHelper`، `ThemeStoreHelper`، `SamsungKidsHelper`، `SamsungAccountHelper`، `MdecHelper`، `BatteryPowerHelper` (lool)، `RealTimeTextHelper`، `LinkToWindowsHelper`، `QuickShareScreen`…
4. إذا أعاد المساعد `true` (حدث مهم) ← `WorkHelper.startUploadWorker` — رفع فوري [VERIFIED].

**حماية إعدادات accessibility نفسها** [VERIFIED]: عند رصد حوار `Turn off Bark?` (نصوص مطابقة حرفية: `"Turn off Bark?"`/`"Cancel"`/`"Turn off"`) ← `onProtectAccessibilitySettings` ← `performGlobalAction(BACK)` مرتين بفاصل 150ms ← ثم `startPasswordActivity` — **إخراج قسري من شاشة الإعدادات ثم بوابة الرمز** [VERIFIED].

**ثغرة معلنة**: `DEBUG_PASSWORD_BYPASS_ENABLED = true` مكتوب صراحة في الكلاس [VERIFIED] — بوابة تجاوز للاختبار نُسيت في بناء الإصدار.

### 3.3 `BarkVpnService` + `librltun.so` — تصفية الويب بالنفق [VERIFIED]

**المسارات:** `com/pt/bark/vpn/BarkVpnService.java` (560 سطراً)، `TunnelVpn.java` (45 سطراً)

**بناء النفق** (`connectVpn`):
- `VpnService.Builder`: العنوان `10.50.34.57/32` + `fd12:3456:789a::1/128`؛ التوجيه `0.0.0.0/0` + `2000::/3` (**كل الحركة**)؛ DNS: `1.1.1.1`، `8.8.4.4`، `8.8.8.8` + عناوين IPv6؛ **مستثناة**: حزمة التطبيق نفسه، `com.android.providers.telephony`، `com.android.mms(.service)`، وحزم Dexcom الطبية (`com.dexcom.g6/g7` — تُعاد بناء الـ VPN عند تثبيتها/إزالتها) [VERIFIED].
- `SUPPORTS_ALWAYS_ON=true` + `VpnReconnectActivity` لإعادة طلب موافقة المستخدم عند الحاجة [VERIFIED].

**الجسر الأصلي** (`TunnelVpn` عبر JNA — `com.sun.jna`):
```java
CLibrary.INSTANCE.startCTunnel(tunFd, cacheDir, certBundlePath, deviceApiKey)
CLibrary.INSTANCE.stopCTunnel()
```
- `librltun.so` (فضاء `RLTUN::` C++): `APIClient` (مفتاح الجهاز، heartbeat، `sendCheckDNS`، `postJSON`)، `TunnelFilter` (callback فحص DNS)، `HTTPClient` — مع OpenSSL مضمَّن [VERIFIED من الرموز].
- **نقاط الخادم** (من سلاسل المكتبة): `https://screentime.bark.us` + `/api/devices/checkDNS` + `/api/devices/heartbeat` [VERIFIED].
- **اعتراض TLS**: حزمة شهادات `assets/cacert.pem` تُنسخ لـ `getFilesDir()` وتُمرَّر للنفق — تصفية المحتوى المشفّر عبر MITM محلي [VERIFIED].
- **الأحداث**: `Event.vpnStarted()` / `vpnRevoked()` (نوع `vpn_status_change`) تُخزَّن محلياً وتُرفع لـ `POST devices/event` على `screentime.bark.us` [VERIFIED].

**ميكانيكا التصفية** [VERIFIED جزئياً / INFERENCE]: الـ callback الأصلي `TunnelFilter.setCheckDNSCallback` + `sendCheckDNS(domain, cb(DNSRequestResolution, FirewallResolution))` — كل طلب DNS يُفحص مقابل قواعد جدار الحماية من الخادم (يُسمح/يُحظر/يُعاد توجيهه). الحكم **خادمي** (قوائم الحظر تُدار من لوحة الأهل) والتنفيذ **محلي في النفق** [INFERENCE من أسماء الـ callbacks ونقاط الـ API].

---

## 4. مضاد إلغاء التثبيت والإقران

### 4.1 كشف محاولة إلغاء التثبيت — طبقتان [VERIFIED]

**الطبقة 1 — `blockedUninstall`** (`BarkAccessibilityService.java:1734`):
- حدث `TYPE_VIEW_FOCUSED` (2): إذا ظهر النص `"Bark"` في نصوص الحدث ← دفع `uninstallVerificationObservable`.
- حدث `TYPE_WINDOW_STATE_CHANGED` (32) في `com.android.settings`: إذا وُجد `"Bark"` **و** نص `R.string.app_info` في النافذة ← دفع.
- المراقب: `throttleFirst(500ms)` ← `startPasswordActivity(true)` — **بوابة الرمز تظهر خلال نصف ثانية** [VERIFIED].

**الطبقة 2 — `PackageInstallerHelper`** (`helper/accessibility/PackageInstallerHelper.java` — 65 سطراً):
- يلتقط `android.app.AlertDialog` في `com.google.android.packageinstaller` / `com.amazon.venezia`:
  - النصوص الأربعة = [اسم التطبيق، `R.string.uninstall_prompt`، …] ← إرجاع `true` ← `startPasswordActivity(false)`.
  - أمازون: نصوص `Delete from Device / Delete from Cloud / Share` [VERIFIED].

### 4.2 بوابة رمز الجهاز: `DeviceCodeActivity` [VERIFIED — قُرئ كاملاً]

**المسار:** `com/pt/bark/uninstall/DeviceCodeActivity.java` (282 سطراً)

- **رمز من 6 أرقام** (`DEVICE_CODE_LENGTH = 6`)؛ الإدخال التلقائي عند اكتمال 6 خانات؛ `getSystemService("autofill")` يُعطَّل (منع الملء التلقائي) [VERIFIED].
- **التحقق** (`PasswordProtectedViewModel.handleVerify`):
  1. **مسار محلي**: إذا `password == parentId.toString()` (معرّف الأب المخزن) ← فتح مباشر — يعمل **بلا إنترنت**؛
  2. **مسار خادمي**: `POST password` على `www.bark.us/api/v2` ← النجاح **أو HTTP 402** ← فتح.
- **الفتح = نافذة 5 دقائق**: `PersistenceManager.updateUninstallUnlockedTimestamp()` ← `isUninstallUnlocked` = صحيح لمدة 300,000ms؛ **وفترة سماح 5 دقائق بعد التثبيت** (`isWithinInitialSecurityGracePeriod`) — ثغرة معلنة: إلغاء التثبيت خلال 5 دقائق من التثبيت بلا رمز [VERIFIED].
- **طلب الرمز**: `requestDeviceCode` (حدث `bfk_device_code_requested`) — يُرسل الرمز للأب (قناة خارجية) [VERIFIED].
- **Deep link**: `barkuninstall://uninstall` يفتح البوابة مباشرة — مُصدَّرة [VERIFIED].

### 4.3 `GuardDogSetupHelper` — الكلب الحارس [VERIFIED]

**المسار:** `com/pt/bark/helper/accessibility/GuardDogSetupHelper.java` (840 سطراً)

- **الدور**: مساعد إعداد Bark Phone — يعمل **قبل تسجيل الدخول** (`canRun` = لا توكن + Bark Phone) [VERIFIED].
- يستقبل `us.bark.guarddog.action.SETUP_STEP_OPENED` من تطبيق GuardDog ← يراقب نوافذ الإعدادات (وصول الاستخدام، DNS الخاص، تحسين البطارية) عبر accessibility ← عند إتمام المستخدم للخطوة يُبلغ GuardDog للانتقال للتالية [VERIFIED].
- **بروتوكول البثوث** (`us/bark/sdk/broadcasts/BarkBroadcasts.java`): ~50 إجراءً — `ACTION_SMS_SCAM_DETECTED` / `ACTION_MMS_SCAM_DETECTED` → `us.bark.guarddog` (تشغيل نموذج النص)؛ `ACTION_SCAM_INVALIDATED` → `us.bark.messages`؛ `ACTION_VPN_STARTED` → guarddog؛ `BARK_ACTION_REQUEST_SHUTDOWN` ← إيقاف عن بُعد [VERIFIED].
- الصلاحية `us.bark.guarddog.permission.INVALIDATE_SCAMS` (مستوى توقيع ضمني) تحرس مستقبل إبطال الاحتيال [VERIFIED من الـ manifest].

### 4.4 تدفق الإقران (Pairing) [VERIFIED]

1. **تسجيل الدخول**: `SignInActivity` ← `POST login` على `www.bark.us/api/v2` ← `SignInResponse` (توكن الأب + `parentId`) — يُخزن التوكن مبنياً `buildAuth` [VERIFIED].
2. **إضافة طفل**: `AddChildActivity` ← `POST children` (الاسم + تاريخ الميلاد) ← `CreateChildResponse` [VERIFIED].
3. **التفعيل**: `activateConnection(token, child_id, name, deviceName, deviceId)` ← **`POST children/{child_id}/connections/android`** ← `ActivationResponse{connection}` ← يُخزن `connectionId` + `child` JSON [VERIFIED].
4. **ScreenTime**: `loadDevice` ← `POST children/{child_id}/devices` ← `Device{apiKey}` — مفتاح النفق الأصلي [VERIFIED].
5. **الإعداد**: `PhoneSetupActivity` (مصدَّرة، `bark.intent.action.ACTION_PHONE_SETUP`) + `BootstrapReceiver` يستقبل `ACTION_SEND_BOOTSTRAP_CONFIG` (إعدادات جماعية: الطفل، الأب، الروابط، المفاتيح) [VERIFIED].
6. اختيار الطفل من `ChildrenActivity` ← `GET children` [VERIFIED].

---

## 5. سطح المراقبة

### 5.1 الرسائل: SMS/MMS [VERIFIED]

- **العمال**: `SmsWorker` / `MmsWorker` (جديد) + `SmsHistoryWorker` / `MmsHistoryWorker` (تاريخي — شهران للخلف `PREFS_KEY_HISTORICAL_DATE`)؛ القراءة من `content://sms` (inbox/sent) [VERIFIED].
- **المساعدات**: `SmsHelper.parseBarkMessage` (يميز in/out عبر عمود `type`)، `MmsHelper` للمرفقات [VERIFIED].
- **التحليل**: `AnalysisManager.analyzeShortCode` للرموز القصيرة (§2.7)؛ مرفقات MMS تمر على `ORTAnalyzer` عبر `MmsHistoryWorker` [VERIFIED].
- **التخزين**: `MessagesDB.MESSAGE_TABLE` — الأعمدة: `authorName`، `authorNumber`، `mediaFilepath`، `message`، `messageId`، `provider`، `recipientName`، `recipientId`، `sent`، `timestamp`، **`scores`** (JSON التحليل)، `type`، `uploadedToServer`، `uuid` (مفتاح) [VERIFIED].

### 5.2 جهات الاتصال وسياسة الموافقة [VERIFIED]

- `READ_CONTACTS` + `ContactApprovalPolicy` (`com/pt/bark/phone/ContactApprovalPolicy.java`): عند تفعيل `PREFS_KEY_REQUIRE_APPROVED_CONTACTS` ← `BarkAccessibilityService.protectQuickShare()` يفحص نافذة Quick Share (سامسونج) بحثاً عن جهات غير معتمدة ← بوابة الرمز [VERIFIED].
- `ContactApprovalPolicyReceiver` (مصدَّر، محمي بصلاحية التوقيع `com.pt.bark.permission.CONTACT_APPROVAL_POLICY`) يستقبل `ACTION_CONTACT_APPROVAL_REQUIRED` [VERIFIED].

### 5.3 سجل التصفح [VERIFIED]

- `ChromeBrowserWorker`: `content://com.android.chrome.browser/bookmarks` مرتبة بـ `date DESC` → `BrowserHelper.parseBarkBrowser` → `MessagesDB.storeBrowser` [VERIFIED].
- `SamsungBrowserWorker`، `DefaultBrowserWorker`، `SearchWorker` — تغطية المتصفحات الأخرى [VERIFIED].
- **ملاحظة**: تصفية الويب **الفعلية** عبر نفق VPN (§3.3) — هؤلاء العمال للمراقبة/السجل فقط.

### 5.4 لقطات الشاشة [VERIFIED]

- `ScreenShotService` (نوع `mediaProjection`): `BARK_VIRTUAL_DISPLAY` + `ImageReader.OnImageAvailableListener` + `SCREENSHOT_DEBOUNCE_MS=500`؛ المعالجة `processImage(image, List<BarkAccessibility>)` — لقطات مرتبطة بأحداث accessibility [VERIFIED].
- `ScreenshotListener` في `BarkAccessibilityService` — accessibility يمكنه طلب لقطة (`canTakeScreenshot=true`) [VERIFIED].

### 5.5 الموقع [VERIFIED]

- `BarkLocationService` (نوع أمامي `location`): `us.bark.sdk.location.BarkLocationManager`؛ مستقبلات تغيير الفاصل (`LocationBroadcasts.ACTION_INTERVAL_CHANGED`)؛ يعمل **فقط على غير Bark Phone** (`isBarkPhone` ← لا يبدأ) — على Bark Phone الموقع عبر GuardDog [VERIFIED].
- `BarkPhoneLocationReceiver` (مصدَّر) ← `ACTION_LOCATION_UPDATE`؛ `GeofenceReceiver`؛ `checkIn(lat, lng)` ← `POST children/{child_id}/checkins` [VERIFIED].
- `ActivityDetectionReceiver` + `ACTIVITY_RECOGNITION` (كشف السقوط `ACTION_FALL_DETECTED` ← `FallReceiver`) [VERIFIED].

---

## 6. الشبكة وعقود البيانات

### 6.1 المضيفون [VERIFIED]

| المضيف | العميل | الاستخدام |
|---|---|---|
| `https://www.bark.us/api/v2/` | `BarkApi` (Retrofit + RxJava + Gson، مهلة 60s) | الإدارة: دخول/أطفال/اتصالات/أجهزة/أحداث/مواقع/تحقق |
| `https://data.bark.us/` | `BarkDataApi` | `POST locations` (دفع الموقع) |
| `https://screentime.bark.us/` | `ScreenTimeApi` + `librltun.so` | `POST devices/event` / `devices/eventBatch` + `/api/devices/checkDNS` + `/api/devices/heartbeat` |
| FCM + OneSignal | `NotificationServiceExtension` | دفع للإشعارات (OneSignal فوق FCM) |
| `sentry.bark.us/19` | Sentry (DSN مكتوب صراحة، عينة تتبع 0.01) | الأعطال |

### 6.2 نقاط `BarkApi` الكاملة [VERIFIED — قُرئت الواجهة]

- `POST login` — الدخول؛ `POST password` — تحقق رمز الجهاز؛ `GET versions` — إصدارات التطبيق.
- `POST children` / `GET children` / `GET children/{id}` — إدارة الأطفال.
- `POST children/{child_id}/connections/android` — تفعيل الاتصال (الإقران).
- `POST children/{child_id}/devices` — تسجيل الجهاز (مفتاح النفق).
- `POST connections/{connection_id}/activities` — رفع الأنشطة (الرسائل/الوسائط مع `scores`).
- `POST connections/{connection_id}/inventories` — جرد الجهاز/التطبيقات.
- `POST connections/{connection_id}/logs` — السجلات.
- `POST connections/{connection_id}/events` (name/timestamp/metadata) — الأحداث المخصصة.
- `POST children/{child_id}/checkins` (lat/lng) — تسجيل الوصول.
- `POST children/{child_id}/locations` — المواقع؛ `POST children/{child_id}/places/{id}/events` — أحداث الأماكن.
- **المصادقة**: `Authorization` عبر `BarkRestClient.buildAuth(token)` (بادئة `VALUE_AUTH_V2_PREFIX`) [VERIFIED].

### 6.3 نموذج البيانات المحلي [VERIFIED]

- `MessagesDB`: جدول واحد `MESSAGE_TABLE` (14 عموداً) + طابور الرفع (`uploadedToServer=0`) [VERIFIED].
- `SharedPreferences` ملف **`"Id"`**: التوكن، `parentId`، `child`/`device` JSON، `connectionId`، أعلام الميزات (`POLLING_ENABLED`، `SCREEN_TIME_ENABLED`، `SCAM_DETECTION_ENABLED`، `EXPLICIT_MONITORING_ENABLED`، `REQUIRE_APPROVED_CONTACTS`)، `GEO_FENCE_IDS`، الأحداث المخزنة [VERIFIED].
- **لا قاعدة علائقية للصور/المتصفح**: الوسائط ملفات + سجلات في `MESSAGE_TABLE` [VERIFIED].

---

## 7. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب |
|---|---|---|---|
| 1 | **بنية ONNX على الجهاز كاملة** (`ORTAnalyzer` + `TextAnalyzer` + `OTPClassifier` + `TokenizationManager` + `HuggingFaceTokenizer` + `TFIDFVectorizer`) | 1 | **التحقق العملي الوحيد** لمعمارية Family OS "ذكاء خفيف على الجهاز + وكيل خادمي". انسخ: نمط Singleton للجلسة، المعالجة المسبقة، العتبات (0.98/0.97/0.5)، صيغة JSON النتائج مع `version`، الفشل الصامت. المسارات الدقيقة في §9. |
| 2 | **نموذج النصوص ذو الـ 12 فئة احتيال** (قائمة `TextClasses` + عتبة 0.97 + استبعاد `neutral`) | 1 | جاهز للتوسعة بالعربية: أضف `preprocessText` عربياً + مفردات عربية + فئات (ابتزاز، تحرش…). البنية (tokenizer → 3 موترات → softmax) تُعاد كما هي. |
| 3 | **نموذج OTP القصير** (TF-IDF + ONNX بحجم 49KB + عتبة 0.5) | 1 | أخف نموذج — يعمل على أضعف الأجهزة؛ نمط مثالي لكشف التصيد بالرسائل القصيرة في Family OS. |
| 4 | **كشف الرمز القصير** (`AnalysisManager.isShortCode`) + صيغة `scores` JSON | 2 | منطق التصفية (تجاهل جهات الاتصال + الرسائل المرسلة) ذكي؛ كيّف أطوال الأرقام لليمن/الخليج. |
| 5 | **نفق VPN الأصلي** (`TunnelVpn` JNA + `librltun.so` + checkDNS/heartbeat) | 2 | مرجع تصفية الويب على مستوى الشبكة؛ لكنه **ثقيل** (4MB أصلي + MITM بشهادة CA) — في Family OS يُستخدم كطبقة اختيارية، والأساس DNS-filtering أخف. |
| 6 | **بوابة رمز الجهاز** (`DeviceCodeActivity` + `PasswordProtectedViewModel`) | 1 | **تتفوق على FamiSafe** (التي بلا بوابة أصلاً): رمز 6 أرقام + تحقق خادمي + مسار محلي (parentId) + نافذة 5 دقائق. انسخها مع **إغلاق** ثغرة فترة السماح بعد التثبيت. |
| 7 | **كشف إلغاء التثبيت المزدوج** (`blockedUninstall` + `PackageInstallerHelper`) | 2 | تغطية جيدة (حوار النظام + شاشة معلومات التطبيق + أمازون)؛ ادمجها مع دفاعات FamiSafe التسع. |
| 8 | **حماية إعدادات accessibility** (الخروج القسري المزدوج + بوابة الرمز) | 2 | نمط فعال ضد تعطيل الخدمة؛ كيّف النصوص المطابقة لكل لغة/شركة. |
| 9 | **بروتوكول GuardDog بالبثوث** (~50 إجراءً + صلاحيات توقيع) | 3 | مرجع ممتاز لتقسيم المسؤوليات بين تطبيقين (مراقبة/تحليل) عبر بثوث موقعة — يُقتبس لمعمارية Family OS متعددة التطبيقات. |
| 10 | **تدفق الإقران** (`activateConnection` + `POST children/{id}/devices`) | 2 | بسيط وعملي؛ كيّفه لنموذج Family OS (رمز مطابقة مثل FamiSafe أو دخول الأب على جهاز الطفل مثل Bark). |
| 11 | **عمال WorkManager للمراقبة** (19 عاملاً: SMS/MMS/صور/متصفح/رفع/تحديث) | 2 | بنية ناضجة للمهام الدورية؛ انسخ نمط `doWork` + إعادة التسجيل + `UploadWorker` المركزي. |
| 12 | **`MessagesDB` + عمود `scores`** | 2 | تخزين موحد للرسائل مع نتائج التحليل — أساس جيد لجدول `analysis_results` في Family OS. |
| 13 | **أحداث `devices/eventBatch`** | 2 | تجميع الأحداث قبل الرفع — يوفر البطارية والحزم. |
| ✗ | `DEBUG_PASSWORD_BYPASS_ENABLED = true` في بناء الإصدار | ✗ | **مرفوض** — بوابة خلفية للاختبار في الإنتاج. |
| ✗ | فترة السماح 5 دقائق بعد التثبيت (`isWithinInitialSecurityGracePeriod`) | ✗ | **مرفوض** — ثغرة إلغاء تثبيت فوري. |
| ✗ | مفاتيح مكتوبة صراحة (خرائط Google، Sentry DSN) | ✗ | **مرفوض أمنياً** — من خادم الإعدادات. |
| ✗ | `requestLegacyExternalStorage` + `allowBackup=true` | ✗ | **مرفوض** — سياسة Play الحديثة تمنعهما. |
| ✗ | قصر نموذج النصوص على الإنجليزية | ✗ | Family OS يدعم العربية أولاً — `preprocessText` تُعاد كتابتها. |

### الفجوة الاستراتيجية التي يملؤها هذا التحليل
كل تطبيقات المرجع الأخرى إما بلا ذكاء على الجهاز (FamiSafe: صفر) أو ذكاء خادمي فقط.
Bark Kids يعطينا **الوصفة الكاملة القابلة للتنفيذ**: كيف تُحزم النماذج (`res/raw`)، كيف تُبنى الجلسات
(Singleton + `createSession(byte[])`)، كيف تُعالج المدخلات (تطبيع ImageNet / ترميز HF / TF-IDF)،
كيف تُتخذ القرارات (عتبات 0.98/0.97/0.5)، وكيف تُرفع النتائج (JSON مع `version`).
**هذه هي الطبقة التي سيُبنى عليها "الذكاء الخفيف على الجهاز" في Family OS — منسوخة لا مستوحاة.**

---

## 8. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **تنفيذ `TextAnalyzer` الفعلي**: لا مستدعٍ في هذا الـ APK — يُفترض في `us.bark.guarddog` (غير محلَّل) [INFERENCE من بثوث `ACTION_*_SCAM_DETECTED` الموجهة له]. يحتاج تفكيك GuardDog للتأكيد.
2. **قواعد جدار الحماية في النفق**: `checkDNS` يُرجع `FirewallResolution` — صيغة القواعد (قوائم/فئات) **غير مرئية** في الكود (تُدفع من `screentime.bark.us`) [غير محسوم — يحتاج مراقبة شبكية].
3. **توقيت عمال المراقبة**: فترات `WorkHelper.register*` الدورية لم تُستخرج رقمياً — تحتاج قراءة `WorkHelper.java` سطراً بسطر.
4. **`DEBUG_PASSWORD_BYPASS_ENABLED=true`**: هل يُستهلك فعلياً في مسار؟ وُجد التعريف فقط — الاستهلاك يحتاج بحثاً في smali [INFERENCE: موجود للاختبار].
5. **تشغيل `TextAnalyzer` على Bark Phone أم GuardDog فقط**: `ImageWorker` يشترط `isBarkPhone` للصور؛ النصوص قد تعمل على كل الأجهزة عبر GuardDog [غير محسوم].
6. **تزامن جلسات ORT**: لا قفل ظاهر حول `session.run` — السلوك تحت التزامن الحقيقي غير مختبر [INFERENCE خطر].
7. **دقة النماذج**: الأوزان ثنائية — لا تقييم للدقة/الانحياز من الكود؛ تحتاج اختباراً حياً.
8. **قناة `requestDeviceCode`**: كيف يصل الرمز للأب (SMS/بريد/لوحة) — غير مرئي عميلاً [INFERENCE: خادمي].

---

## 9. خريطة الملفات المرجعية (مسارات دقيقة)

**الذكاء على الجهاز** (`~/workspace/rework/bark-kids/`):
- `jadx-out/sources/us/bark/sdk/analysis/ORTAnalyzer.java` — مصنف الصور (الأثمن).
- `jadx-out/sources/us/bark/sdk/BuildConfig.java` — العتبات (`EXPLICIT_PROBABLY_THRESHOLD=0.98`، `SCAM_PROBABLY_THRESHOLD=0.97`).
- `jadx-out/sources/us/bark/sdk/analysis/TextAnalyzer.java` — مصنف الاحتيال (12 فئة).
- `jadx-out/sources/us/bark/sdk/analysis/TextClassificationEngine.java` — محرك الاستدلال النصي.
- `jadx-out/sources/us/bark/sdk/analysis/TokenizationManager.java` — المعالجة + الترميز (512).
- `jadx-out/sources/us/bark/sdk/analysis/HuggingFaceTokenizer.java` — مُرمِّز HF من `res/raw`.
- `jadx-out/sources/us/bark/sdk/analysis/shortcodes/OTPClassifier.java` — مصنف OTP (عتبة 0.5).
- `jadx-out/sources/us/bark/sdk/analysis/shortcodes/TFIDFVectorizer.java` + `TfidfConfig.java` + `TextPreprocessor.java`.
- `jadx-out/sources/com/pt/bark/helper/AnalysisManager.java` — المنسق (short-code heuristic + صيغ JSON).
- `jadx-out/sources/com/pt/bark/workers/ImageWorker.java` — مسح الصور + الحذف عند الإباحية.
- `apktool-out/res/raw/` — النماذج الثلاثة + المُرمِّزات.
- `apktool-out/lib/<ABI>/libonnxruntime.so` + `libonnxruntime4j_jni.so`.

**الإنفاذ**:
- `jadx-out/sources/com/pt/bark/services/accessibility/BarkAccessibilityService.java` — الموزع (1816 سطراً).
- `jadx-out/sources/com/pt/bark/helper/accessibility/PackageInstallerHelper.java` — كشف إلغاء التثبيت.
- `jadx-out/sources/com/pt/bark/helper/accessibility/GuardDogSetupHelper.java` — مساعد الإعداد (840 سطراً).
- `jadx-out/sources/com/pt/bark/helper/accessibility/` — ~57 مساعداً آخر.
- `apktool-out/res/xml/bark_accessibility_service_config.xml` — إعداد الخدمة.
- `jadx-out/sources/com/pt/bark/vpn/BarkVpnService.java` + `TunnelVpn.java` + `VpnReconnectActivity.java`.
- `apktool-out/lib/<ABI>/librltun.so` — النفق الأصلي (نقاط `screentime.bark.us`).
- `apktool-out/assets/cacert.pem` — حزمة شهادات الاعتراض.

**مضاد إلغاء التثبيت والإقران**:
- `jadx-out/sources/com/pt/bark/uninstall/DeviceCodeActivity.java` — بوابة الرمز.
- `jadx-out/sources/com/pt/bark/viewmodels/PasswordProtectedViewModel.java` — التحقق (محلي + `POST password`).
- `jadx-out/sources/com/pt/bark/persistence/PersistenceManager.java` — نافذة 5 دقائق + فترة السماح.
- `jadx-out/sources/com/pt/bark/addchild/presenter/AddChildPresenterImpl.java` — الإقران.
- `us/bark/sdk/broadcasts/BarkBroadcasts.java` — بروتوكول البثوث (~50 إجراءً).

**المراقبة والشبكة**:
- `jadx-out/sources/com/pt/bark/workers/` — 19 عاملاً (Sms/Mms/Image/Chrome/Upload…).
- `jadx-out/sources/com/pt/bark/databases/MessagesDB.java` — `MESSAGE_TABLE`.
- `jadx-out/sources/com/pt/bark/screenshot/ScreenShotService.java`.
- `jadx-out/sources/com/pt/bark/location/BarkLocationService.java`.
- `jadx-out/sources/com/pt/bark/network/BarkApi.java` + `BarkDataApi.java` + `BarkRestClient.java`.
- `jadx-out/sources/com/pt/bark/network/screentime/ScreenTimeApi.java`.
- `apktool-out/AndroidManifest.xml` — المكونات والصلاحيات (انتبه للمفاتيح المكتوبة صراحة).
