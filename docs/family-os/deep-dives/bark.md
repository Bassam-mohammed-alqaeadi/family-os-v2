# تحليل الهندسة العكسية العميق — Bark (الأب + الطفل)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/bark.md`) الذي غطى تطبيق الأب وحده وسجّل تطبيق الطفل كفجوة معلنة.
> هذه الوثيقة **تغلق تلك الفجوة**: تطبيق الطفل (`com.pt.bark`) يُحلَّل هنا بعمق،
> وتُفكَّك فيه لأول مرة منظومة **الذكاء الاصطناعي على الجهاز** (ONNX Runtime + نماذج حقيقية) —
> وهي **أول حالة ذكاء على الجهاز** تُرصد في أي تطبيق من التطبيقات الثمانية.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).

---

## 1. نظرة عامة

| البند | تطبيق الأب (Parent) | تطبيق الطفل (Child) |
|---|---|---|
| الحزمة | `cm.pt.barkparent` | `com.pt.bark` |
| الإصدار المحلَّل | **6.5.1** (versionCode `600500103`) [VERIFIED من `BuildConfig`] | **7.26.0** |
| التقنية | **React Native** — Hermes v98 + **Fabric** (المعمارية الجديدة مفعّلة) | **Kotlin أصلي** |
| حجم الحزمة | ~83MB | ~92.9MB |
| smali / java | 28,770 / 14,216 (أغلبها إطار RN والمكتبات) | 17,318 / 8,869 |
| منطق التطبيق في | `assets/index.android.bundle` (3.2MB، Hermes bytecode مشفّر/minified) | `com.pt.bark.*` + `us.bark.sdk.*` (SDK تحليل خاص) |
| الدور | لوحة الأهل: مراجعة التنبيهات، إدارة الأطفال والأجهزة، الفوترة | **التنفيذ والمراقبة**: VPN + Accessibility، ذكاء اصطناعي على الجهاز، رفع الأنشطة |

### العلاقة أب ↔ طفل ↔ سحابة (الصورة الكاملة) [VERIFIED]
```
الأب (RN): يحرر الأطفال/الأجهزة/الإعدادات (UI في JS)
  → GraphQL باستعلامات محفوظة (persisted queries + SHA256) [VERIFIED الآلية، الرابط مشفّر]
  → السحابة: www.bark.us (الرئيسي) — الوسيط الوحيد
  → الطفل: REST v2 ‏(https://www.bark.us/api/v2/)‏ + ‏(https://data.bark.us/)‏ + ‏(https://screentime.bark.us/)‏
  → التنفيذ: BarkVpnService + BarkAccessibilityService + نماذج ONNX على الجهاز
  → الرفع: POST connections/{id}/activities ← الأنشطة المحللة (رسائل + نتائج التصنيف)
  → الأب: يسحب التنبيهات (GraphQL) + دفع OneSignal الفوري
```
**لا يوجد أي اتصال مباشر أب←طفل** [VERIFIED] — كل شيء عبر السحابة وسيطاً.
**التمييز الجوهري عن FamiSafe:** المراقبة عند Bark **على الجهاز** (نماذج ONNX)،
بينما FamiSafe يرفع المحتوى الخام ويصنّف خادمياً.

### تدفق الإقران برمز الجهاز (Device Code) [VERIFIED — من تطبيق الطفل]
1. **الأب:** يولّد رمز جهاز من **قسم Account في تطبيق الأب** (نص حرفي في تطبيق الطفل: `"Device codes can be found in the Account section of the Bark Parent app."`).
2. **الطفل:** يثبّت Bark Kids ويدخل الرمز ← `SignInPresenterImpl.handleSignInClick()` ← `LoginHelper.createLoginCodeRequestBody(code)` ← **`POST login`** بجسم `{password: <الرمز>, log: {data: {platform: "android", version: <VERSION_NAME>}, name: "child_app_login"}}` — **الرمز يُرسل في حقل `password`** [VERIFIED حرفياً].
3. **الاستجابة:** `SignInResponse{parent, child, capabilities}` — إن كان الرمز مرتبطاً بطفل محدد ← `onDeviceCode(child, parent)`، وإلا ← صفحة اختيار الأطفال.
4. **بوابة القدرات:** `hasMinimumCapability` = قدرة `checkins` مفعّلة؛ `hasPollingForAndroidCapability` = `polling.providers` يحوي `"android"`؛ `hasScreenTimeCapability` — تُخزَّن في `PersistenceManager` وتتحكم بالرفع والميزات.
5. **تسجيل الجهاز:** `POST children/{child_id}/connections/android` بحقول (`name`, `device`=اسم الجهاز, `uid`=معرّف الجهاز) ← `ActivationResponse` [VERIFIED في `AddChildPresenterImpl` و`ChildrenPresenterImpl`].
- المسارات الدقيقة: `~/workspace/rework/bark-kids/jadx-out/sources/com/pt/bark/auth/presenter/SignInPresenterImpl.java`، `.../auth/helper/LoginHelper.java`، `.../network/BarkApi.java`.

---

## 2. الغوص العميق — تطبيق الأب (React Native)

### 2.1 جرد الـ Manifest [VERIFIED — قُرئ كاملاً]
`~/workspace/rework/bark/apktool-out/AndroidManifest.xml` (418 سطراً):
- **14 نشاطاً** — كلها تقريباً لمكتبات (Facebook SDK، Google Play Billing، OneSignal)؛ نشاط التطبيق الوحيد `cm.pt.barkparent.MainActivity` (`ReactActivity`، المكوّن `"Bark"`).
- **بلا أي خدمة إنفاذ** — الخدمات كلها لـ androidx.work وOneSignal وFirebase/Iterable.
- **الصلاحيات الوظيفية (15):** `INTERNET`، موقع دقيق/تقريبي (`ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION`)، `POST_NOTIFICATIONS`، `USE_BIOMETRIC` + `USE_FINGERPRINT`، `com.android.vending.BILLING`، `RECEIVE_BOOT_COMPLETED`، `WAKE_LOCK`، `FOREGROUND_SERVICE`، `VIBRATE`، `ACCESS_NETWORK_STATE`، صلاحيات AdServices (AD_ID/ATTRIBUTION/...)، + حزمة صلاحيات **شارات اللانشر** (badge) لشركات متعددة (سامسونج/HTC/هواوي/سوني/OPPO...). **ولا SMS/جهات اتصال/سجل مكالمات/مايك/كاميرا** — الأب لوحة تحكم خالصة [VERIFIED].
- **روابط عميقة:** `*.bark.us` + ~140 مسار `www.bark.us/<pathPrefix>` — **ليست روابط تطبيق بقدر ما هي خريطة محتوى إرشادي**: `/cyberbullying`، `/depression`، `/suicidal_thoughts`، `/predators`، `/sexting`، `/talk-to-kids`، `/conversation-suggestions`، `/what-bark-monitors`، `/child-risk-survey`، `/screen-time`، `/webfiltering`، `/youtube-guide`، `/teenslang`... — **هذه هي صفحات "توصيات الخبراء" التي تُفتح من التنبيهات** [VERIFIED — القائمة الكاملة في §5.4].
- **علامات لافتة:** `WEB_AGENT = "(Bark Connect)"` في `BuildConfig` — لاحقة User-Agent تُستخدم على الأرجح في WebView ربط حسابات الأطفال (Google/Microsoft)؛ `FLAVOR = "bark"`.

### 2.2 جسر React Native — التنظيم الدقيق [VERIFIED]
- **`MainActivity`** (`jadx-out/sources/cm/pt/barkparent/MainActivity.java`): `extends ReactActivity`، `getMainComponentName() = "Bark"`، يستخدم `DefaultReactActivityDelegate` مع `DefaultNewArchitectureEntryPoint.getFabricEnabled()` — **Fabric مفعّل** [VERIFIED].
- **`MainApplication`** (`.../MainApplication.java`): تُهيئ `ReactHost` عبر `DefaultReactHost.getDefaultReactHost(..., "index.android.bundle", ...)` — اسم الحزمة `"index"` والملف `"index.android.bundle"` [VERIFIED]؛ ثم `IterableApi.setContext()` (تسويق/إيميل).
- **قائمة الحزم الأصلية (20)** — `jadx-out/sources/com/facebook/react/PackageList.java` (`getPackages()`) [VERIFIED حرفياً]:

| الحزمة الأصلية | المصدر | الدور في التطبيق |
|---|---|---|
| `MainReactPackage` | إطار RN | نواة الجسر |
| `AsyncStoragePackage` | مجتمع RN | التخزين المحلي (الجلسة/الكاش) |
| `RNCConfigPackage` | `com.lugg.RNCConfig` | **إعدادات البيئة**: تعكس حقول `BuildConfig` الأصلية إلى JS (النمط: `RNCConfigModuleImpl.getConfig()` يقرأ كل حقول `cm.pt.barkparent.BuildConfig` بالـ reflection) [VERIFIED بالقراءة الكاملة] |
| `ReactNativeBiometricsPackage` | `com.rnbiometrics` | القفل بالبصمة/الوجه لبوابة الأهل |
| `ReactNativeOneSignalPackage` | `com.onesignal.rnonesignalandroid` | الإشعارات الفورية (التنبيهات) |
| `RNIterableAPIPackage` | `com.iterable.reactnative` | إيميلات/رسائل تسويقية + push تسويقي |
| `NitroIapPackage` + `NitroModulesPackage` | `com.margelo.nitro` | **المشتريات عبر Nitro** (بديل TurboModules أصلي)؛ معه `dev.hyo.openiap` (مشتريات مفتوحة المصدر) |
| `RNSentryPackage` | `io.sentry.react` | تتبع الأعطال (JS) |
| `RNDeviceInfo` | `com.learnium` | معلومات الجهاز |
| `FBSDKPackage` | `com.facebook.reactnative.androidsdk` | Facebook SDK (مشاركة/دخول) |
| `RNGestureHandlerPackage` / `RNScreensPackage` / `SafeAreaContextPackage` / `BlurViewPackage` / `RNCMaskedViewPackage` | مجتمع RN | واجهات/تنقل |
| `RNCWebViewPackage` | مجتمع RN | WebView (ربط الحسابات — "Bark Connect") |
| `RNSharePackage` / `RNRatePackage` / `RNReactNativeHapticFeedbackPackage` | مجتمع RN | مشاركة/تقييم/اهتزاز |

- **التقسيم أصلي/JS** [VERIFIED من القائمة + الحزمة]: **كل منطق العمل في JS** (الحزمة 3.2MB)؛ الأصلي يقتصر على: الجسر، التخزين، البصمة، الإشعارات، الفوترة، الإعدادات، WebView، وواجهات النظام. **لا يوجد أي وحدة أصلية مخصصة من Bark نفسه** (لا `com.bark.*` أصلي) — حتى توليد رمز الجهاز يتم عبر JS/الشبكة [INFERENCE من غياب أي كود أصلي خاص].
- **الإصدار:** `VERSION_NAME = "6.5.1"`، `VERSION_CODE = 600500103`، `IS_HERMES_ENABLED = true`، `IS_NEW_ARCHITECTURE_ENABLED = true`، `BUILD_TYPE = "release"`، `DEBUG = false` [VERIFIED].

### 2.3 حزمة JS — ما يمكن إثباته من Hermes bytecode [VERIFIED]
- `apktool-out/assets/index.android.bundle` (3,284,704 بايت) = **Hermes bytecode v98** (مؤكد عبر `file`).
- **GraphQL باستعلامات محفوظة** [VERIFIED]: السلاسل `graphql.persisted_query.hash.sha256Hash` و`graphql.persisted_query.version` و`graphql.document` و`graphql.operationType` موجودة نصاً — نمط **Apollo Persisted Queries** (تُرسل بصمة SHA256 بدل نص الاستعلام).
- **الرابط الأساسي للـ GraphQL غير ظاهر كنص صريح** في الحزمة ولا في `BuildConfig` ولا في smali الأصلي [VERIFIED بالبحث الشامل] — [INFERENCE: يُبنى ديناميكياً في JS أو يُستلم عند تسجيل الدخول].
- **الحزمة minified**: أسماء الشاشات/الميزات مدمجة بلا فواصل — البحث عن `alerts`/`Cyberbullying`/`Sexting`/`deviceCode` أعاد **صفراً** [VERIFIED] — **التصنيفات التنبيهية خادمية بالكامل**، لا تُشحن في العميل.
- سلاسل OneSignal المربوطة للـ JS [VERIFIED]: `OneSignal-userStateChanged`، `OneSignal-permissionChanged`، `OneSignal-notificationWillDisplayInForeground`، `OneSignal-inAppMessageClicked`، `OneSignal-inAppMessageDidDisplayed`، `OneSignal-inAppMessageDidDismissing`.

### 2.4 خط التنبيهات (أب) — الدفع والسحب [VERIFIED]
- **OneSignal:** المعرّف مكتوب صراحة — `ONESIGNAL_ANDROID_ID = "9092a37d-6d89-4291-96d7-6e0f0469be0e"` و`ONESIGNAL_IOS_ID = "38a90dc5-c67d-4d5c-8c99-1016df26dd7b"` (`BuildConfig.java` + `res/values/strings.xml`)؛ مستقبلات `BootUpReceiver`/`FCMBroadcastReceiver`/`NotificationDismissReceiver` في الـ manifest.
- **Iterable:** `IterableFirebaseMessagingService` + `IterablePushActionReceiver` + قناة `"General Notifications"` — **تسويقي** (إيميلات/حملات)، لا تنبيهات مراقبة [INFERENCE من التسمية والقناة].
- **Sentry مزدوج** [VERIFIED]: أصلي ← `48f5d8206dfc49c2979564d824a05a29@sentry.bark.us/22` (مستضاف ذاتياً)؛ JS ← `https://o447951.ingest.sentry.io/api/4509632503087104/envelope/?sentry_version=7&sentry_key=c1dfb07d783ad5325c245c1fd3725390`.
- **Firebase:** المشروع `bark-android-parent` — `https://bark-android-parent.firebaseio.com` (Realtime DB)، الحاوية `bark-android-parent.appspot.com`؛ مفاتيح `google_api_key`/`google_crash_reporting_api_key` **مكتوبة صراحة** في `strings.xml` [VERIFIED — تُعامل كأسرار مسرّبة، لا تُعاد].
- **البريد:** `help@bark.us` (نص في الحزمة).

### 2.5 الفوترة والبوابات [VERIFIED]
- **NitroIAP** (`com.margelo.nitro.iap`) + **OpenIAP** (`dev.hyo.openiap`) — مشتريات Google Play عبر Nitro (الأداء الأصلي).
- **البصمة** (`com.rnbiometrics`): `ReactNativeBiometrics` + `CreateSignatureCallback`/`SimplePromptCallback` — بوابة الأهل البيومترية.
- الصلاحيات `USE_BIOMETRIC` + `USE_FINGERPRINT` معلنة.

---

## 3. الغوص العميق — تطبيق الطفل (أول توثيق معمّق)

### 3.1 مفردات الأوامر: `BarkBroadcasts` [VERIFIED — قُرئ كاملاً]
`~/workspace/rework/bark-kids/jadx-out/sources/us/bark/sdk/broadcasts/BarkBroadcasts.java` — **~50 فعلاً و~90 مفتاحاً** بأسماء `bark.intent.action.*` / `bark.intent.extra.*`:
- **التحكم:** `ACTION_ENABLE_SCAM_DETECTION`، `ACTION_ENABLE_EXPLICIT_MONITORING`، `ACTION_ALLOW_BROWSING`، `ACTION_EMERGENCY_CALL`، `ACTION_EMERGENCY_CONTACTS_ONLY`، `ACTION_RING`، `ACTION_ALARM`، `ACTION_REQUEST_SHUTDOWN`، `ACTION_START_LOCATION`، `ACTION_VPN_STARTED`، `ACTION_USAGE_CHANGED`، `ACTION_LIMIT_WARNING`، `ACTION_TIMER_EXPIRED`، `ACTION_SUPPORT_MODE`.
- **الاحتيال:** `ACTION_SMS_SCAM_DETECTED` / `ACTION_MMS_SCAM_DETECTED` (خاص، يُرسل لحزمة `us.bark.guarddog`)، `ACTION_SCAM_DELETED`، `ACTION_SCAM_INVALIDATED` (يُرسل لحزمة `us.bark.messages`) — مع مفاتيح كاملة (`SCAM_ADDRESSES/SUBJECT/MESSAGE/DATE/THREAD_ID/SENDER_NAME/LABEL/PHOTO_URI/STATUS/...`).
- **الإقلاع/التهيئة:** `ACTION_RECEIVE_BOOTSTRAP_CONFIG` / `ACTION_SEND_BOOTSTRAP_CONFIG` مع ~15 مفتاح `BOOTSTRAP_*` (child_id، connection_id، parent_token، device_api_key، monitoring/polling/screen_time/checkins enabled...).
- **جهات الاتصال:** `ACTION_ADD_CONTACT`، `ACTION_CONTACT_REQUEST` (+ الرد)، `ACTION_SEND_CONTACTS`.
- **ملاحظة أمنية** [VERIFIED]: مستقبلات الأوامر (`EnableScamDetectionReceiver`، `ExplicitMediaMonitoringReceiver`، `ContactApprovalPolicyReceiver`، `AllowBrowsingReceiver`...) معلنة **`exported=true`** في الـ manifest — أي تطبيق يمكنه بث أوامر لها. **Family OS: كل أمر يُوقَّع ويُتحقق من المرسل.**

### 3.2 استقبال الدفع: `NotificationServiceExtension` [VERIFIED — قُرئ كاملاً]
`.../notification/NotificationServiceExtension.java` (واجهة OneSignal `INotificationServiceExtension`):
1. دفع بلا عنوان/نص + `additionalData.type == "attention"` ← **وضع الانتباه**: `LocationPreferences.setAttentionModeUntilSeconds(now + ttl)` مع **تقليم TTL إلى [0, 1800] ثانية** (الافتراضي 120) ← بث `ACTION_INTERVAL_CHANGED` مع `EXTRA_FORCE_SINGLE_UPDATE` — **تحديث موقع فوري قسري من الأب**.
2. دفع صامت آخر ← `event.preventDefault()` + `WorkHelper.startGeofenceWorker()` — **تحديث السياج الجغرافي**.
3. دفع بعنوان/نص ← إشعار يعرض `LauncherActivity` بأيقونة `ic_dog_new`.

### 3.3 خط الرفع: `ServerUpdate` [VERIFIED — قُرئ كاملاً]
`.../network/ServerUpdate.java`:
- البوابات: `Utils.isPermittedToUploadToServer()` **و** `PersistenceManager.getPollingEnabled()` **و** عدم سبق الرفع (`MessagesDB.isMessageUploadedToServer`).
- الرفع: `barkMessage.convertToMap()` ← **`POST connections/{connection_id}/activities`** (متزامن `.execute()`).
- الأكواد: `204/400` ← `markAsUploaded()`؛ `401` ← `handleUnauthorized()` = `PersistenceManager.disconnect()` (قطع الجلسة)؛ `200/201/202` مقبولة؛ `SocketTimeoutException` ← **لا** يُعلَّم كمرفوع (إعادة المحاولة لاحقاً).
- `BarkMessage` يحمل `scores` (نتائج التصنيف من `AnalysisManager`) — **الرسالة تُرفع مع نتيجة ذكائها**.

### 3.4 الثنائية التنفيذية: VPN + Accessibility [VERIFIED]
- `com.pt.bark.vpn.BarkVpnService extends VpnService` (+ `TunnelVpn`، `DevicesRepository`، `VpnReconnectActivity`) — **تصفية الويب عبر نفق VPN**.
- `com.pt.bark.services.accessibility.BarkAccessibilityService` — مراقبة التطبيقات/النوافذ.
- **بلا DeviceAdmin** [VERIFIED بالبحث الشامل] — مضاد إلغاء التثبيت عبر **رمز الجهاز الأبوي** (`DeviceCodeActivity` + `PasswordProtectedViewModel`) لا عبر إدارة الجهاز.
- مستقبلات إضافية: `FallReceiver` (كشف السقوط)، `EmergencyCallReceiver`، `AppUpdateReceiver`، `DetectNetwork`...

### 3.5 إعادة استخدام رمز الجهاز [VERIFIED]
نفس الرمز الأبوي يُستخدم لثلاثة أغراض (من `strings.xml`):
1. إقران جهاز الطفل أول مرة (`sign_in_code_*`).
2. **الحماية من إلغاء التثبيت** (`DeviceCodeActivity`: `"Failed to request device code..."`).
3. **وصول مؤقت للإعدادات المقيدة** (`restricted_settings_description`: "Bark has detected access to restricted settings. Enter a device code below to provide temporary access").

---

## 4. محرك الذكاء الاصطناعي على الجهاز — مفككاً بالكامل

> **هذه أول حالة ذكاء اصطناعي حقيقي على الجهاز في التطبيقات الثمانية** (FamiSafe: صفر؛ البقية: غير مرصود).
> النماذج والشيفرة كلها في تطبيق الطفل — الأب لا يحمل أي ذكاء.

### 4.1 النماذج المشحونة [VERIFIED — ملفات فيزيائية]
`~/workspace/rework/bark-kids/apktool-out/res/raw/`:
| الملف | الحجم | الدور [VERIFIED/INFERENCE] |
|---|---|---|
| `adultmediamobile_31_1724800699_fp32.ort` | 16.9MB | نموذج كشف **الوسائط البالغة** (صور) — الاسم صريح [VERIFIED بالاسم] |
| `mobilemodel_1_1753905899.ort` | 17.6MB | نموذج **تصنيف النصوص** (يُقرأ في `TextAnalyzer.readModel()` حرفياً) [VERIFIED] |
| `mfaondevice_1_1234567890.onnx` | 50KB | نموذج صغير (MFA = على الأرجح تحقق/مصادقة متعددة العوامل على الجهاز) [INFERENCE] |
| `tokenizer.json` | 742KB | مُجزّئ HuggingFace (مع `tokenizer_config.json` + `special_tokens_map.json`) [VERIFIED] |
| `tfidf_config.json` | 189KB | إعداد TF-IDF: `max_features=5000`، `ngram_range=[1,3]`، `sublinear_tf`، `norm=l2`، `lowercase` [VERIFIED حرفياً] |
- **المشغّل:** `lib/arm64-v8a/libonnxruntime.so` + `libonnxruntime4j_jni.so` (ONNX Runtime) [VERIFIED].
- حزمة SDK: `us.bark.sdk.analysis.*` (~2,100 سطر) + `ai.onnxruntime.*` (مكتبة الربط).

### 4.2 خط تصنيف النصوص [VERIFIED — قُرئ كاملاً]
`TextAnalyzer.analyze(input)` (`us/bark/sdk/analysis/TextAnalyzer.java`):
1. `TokenizationManager` + `HuggingFaceTokenizer` ← `TokenizationResult{inputIds, tokenTypeIds, attentionMask}`.
2. `TextClassificationEngine.classifyText(session, tokenization, TextClasses.size())`:
   - يبني 3 موتّرات `OnnxTensor` (`input_ids`، `token_type_ids`، `attention_mask`) بشكل `[1, seq_len]`؛
   - `session.run(...)` ← `extractRawOutput` ← **`softMax`** ← يرتّب التسميات تنازلياً ← `ScoreResults{detectedIndices, detectedScore, latencyMs}`.
3. **عتبة القرار: `probability >= 0.97` و `label != "neutral"`** — وإلا يُرجع `null` (لا تنبيه) [VERIFIED حرفياً — السطر `classificationResult2.getProbability() >= 0.97d`].
4. كل تصنيف يُسجَّل في Log (`"Label : "` / `"Probability : "`) — مفيد للتصحيح الميداني.

### 4.3 تصنيف الاحتيال (12 تسمية) [VERIFIED حرفياً]
```java
TextClasses = ["Bad Investments", "Catfish / Romance", "Charity Scams", "Fake Emergency",
  "Fake Tech Support / Virus & Malware", "Gift Card", "Impersonation of Family",
  "Impersonation of Government", "Lottery / Sweepstakes", "Medicare / Medicaid Fraud",
  "Wire Transfer / Credit Card", "neutral"]
```
مصنّف **احتيال نصي** (scam) — يحمي الطفل من رسائل الاحتيال.

### 4.4 مصنّف الرموز القصيرة + الصور [VERIFIED]
- `OTPClassifier` (`shortcodes/`): `TFIDFVectorizer` + `TextPreprocessor` + `TfidfConfig` + نموذج ONNX — يصنّف رسائل **الأرقام المختصرة** (يُفعَّل فقط عندما: الرقم غير فارغ، الرسالة غير فارغة، جهاز Bark Phone، الرسالة **واردة**، والمرسل **ليس جهة اتصال** — منطق `isShortCode` الكامل في `AnalysisManager`) [VERIFIED].
- `ORTAnalyzer`: استدلال الصور (نموذج `adultmediamobile`).
- `AnalysisManager` ينسّق النتائج كـ JSON:
  - نص/احتيال: `{non_otp_unknown_sms: {abusive, score, version, deleted}}`
  - صور: `{adult_explicit: {present, score, version, deleted}}`
- **الحذف التلقائي** (اختياري بصلاحية الأب): `isMediaDeletionEnabled()` = ‏(API 30+‏) و`MANAGE_EXTERNAL_STORAGE` وتفضيل `ExplicitMediaMonitoring`؛ `isScamDeletionEnabled()` = تفضيل `ScamDetection` [VERIFIED].

### 4.5 أين تُستهلك النتائج [VERIFIED]
- `ImageWorker` / `ImageHistoryWorker` / `MmsHistoryWorker` (workers) ← `AnalysisManager` ← تُرفق `scores` في `BarkMessage` ← `ServerUpdate` ← `POST connections/{id}/activities` ← **السحابة تولّد التنبيه ← OneSignal → تطبيق الأب** [VERIFIED بالربط بين الملفات].
- أي بث `BARK_ACTION_SMS_SCAM_DETECTED` يذهب لحزمة `us.bark.guarddog` (تطبيق Bark Phone المرافق) [VERIFIED].

---

## 5. الشبكة وعقود البيانات (أب / طفل / سحابة)

### 5.1 المضيفون والمصادقة [VERIFIED]

| المضيف | الاستخدام | المصدر |
|---|---|---|
| `https://www.bark.us/api/v2/` | REST الرئيسي (طفل) — Retrofit | `BarkRestClient.java` (`ROOT`) |
| `https://data.bark.us/` | بيانات المواقع (طفل) | `BarkRestClient.java` (`DATA_ROOT`) |
| `https://screentime.bark.us/` | أحداث وقت الشاشة (طفل) | `ScreenTimeRestClient.java` |
| `https://bark-android-parent.firebaseio.com` | Firebase Realtime DB (أب) | `res/values/strings.xml` |
| `https://sentry.bark.us/22` | Sentry الأصلي (مستضاف ذاتياً) | حزمة JS |
| `https://o447951.ingest.sentry.io/...` | Sentry الـ JS | حزمة JS |
| `https://www.bark.us/*` (GraphQL) | API الأب — **الرابط الدقيق غير مستخرج** (مشفر في الحزمة) | [INFERENCE] |

- **المصادقة (طفل):** الترويسة `Authorization: Token token=<token>` (`Constants.Header.VALUE_AUTH_V2_PREFIX = "Token token="`) [VERIFIED].
- **المهلات:** 60 ثانية (اتصال/قراءة/كتابة) في كل العملاء [VERIFIED].
- **المكدس:** Retrofit2 + RxJava + Gson + OkHttp (طفل)؛ GraphQL + persisted queries (أب).

### 5.2 نقاط الطفل الكاملة — `BarkApi` [VERIFIED — قُرئت الواجهة كاملة]
`.../network/BarkApi.java` (16 نقطة):
- **الدخول/الإقران:** `POST login` (رمز الجهاز)، `POST children` (إنشاء طفل: name/birthday)، `POST children/{child_id}/connections/android` (تسجيل الجهاز: name/device/uid)، `GET children`، `GET children/{id}`، `POST children/{child_id}/devices` (uid/name/provider)، `POST password` (تحقق كلمة السر).
- **الرفع:** `POST connections/{connection_id}/activities` (الأنشطة المحللة)، `.../events` (name/timestamp/metadata)، `.../logs`، `.../inventories` (جرد التطبيقات المثبتة!)، `POST children/{child_id}/locations`، `POST children/{child_id}/checkins` (check-in يدوي: lat/lng)، `POST children/{child_id}/places/{id}/events` (أحداث الأماكن/السياج).
- **الصيانة:** `GET versions`.
- **`BarkDataApi`:** `POST locations` (على `data.bark.us`).
- **`ScreenTimeApi`:** `POST devices/event` + `POST devices/eventBatch` (على `screentime.bark.us`).

### 5.3 نقاط الأب (GraphQL) [VERIFIED جزئياً]
- الآلية مؤكدة: persisted queries ببصمات SHA256 (نمط Apollo) — **قائمة العمليات غير مستخرجة** (الحزمة minified والرابط مشفّر) [حد معلن].
- القنوات المؤكدة: OneSignal (دفع التنبيهات)، GraphQL (السحب/التحرير)، Iterable (تسويق).

### 5.4 خريطة محتوى الخبراء (الروابط العميقة) [VERIFIED]
الـ manifest يعلن ~140 مسار `www.bark.us/*` — **طبقة "توصيات الخبراء"** التي تُفتح من التنبيهات. الأبرز للتنبيهات:
`/cyberbullying`، `/depression`، `/suicidal_thoughts`، `/teen-suicide-rates`، `/teensuiciderates`، `/predators`، `/sexting`، `/hatespeech`، `/talk-to-kids`، `/conversation-suggestions`، `/what-bark-monitors`، `/child-risk-survey`، `/online-safety`، `/safetynet`، `/preventsuicide`، `/supportsupportsurvivors`، `/back2school`، `/youtube-guide`، `/text-slang`، `/teenslang`، `/screen-time`، `/webfiltering`، `/spotify`، `/checkins`، `/connections`، `/children`، `/notifications`، `/account`، `/password`، `/forgot_password`، `/download`...
- **النمط المعماري:** التنبيه (فئة خطر) ← رابط عميق ← صفحة إرشاد خبير — **هذا هو "توصيات الخبراء" في Bark: محتوى ويب مرتبط بالفئة، لا نصائح مولّدة** [VERIFIED من البنية].

### 5.5 عقود البيانات الأساسية
- **طفل→سحابة:** `BarkMessage.convertToMap()` (+ `scores`) ← `POST .../activities`؛ `Event` ← `devices/event{,Batch}`؛ `PlaceEvent` ← `places/{id}/events`؛ `HashMap` مواقع ← `locations`.
- **سحابة→طفل:** `SignInResponse{parent, child, capabilities}`؛ `ActivationResponse`؛ `ChildrenResponse`/`ChildResponse`؛ `DevicesResponse`؛ `VersionsResponse`.
- **أوامر سحابة→طفل:** OneSignal silent push (`type=attention` + `ttl_in_seconds`) + بثّات `BarkBroadcasts` الداخلية.
- **رمز الجهاز:** `{password: <code>, log: {data: {platform, version}, name: "child_app_login"}}`.

---

## 6. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب والمسار الدقيق |
|---|---|---|---|
| 1 | **خط الذكاء على الجهاز** (`us.bark.sdk.analysis` + نماذج `.ort` + `tokenizer.json` + `tfidf_config.json`) | 1 | **أثمن ما في المنظومة**: مصنّف نصي BERT (عتبة 0.97) + كاشف صور بالغة + مصنّف احتيال TF-IDF — يعمل دون إنترنت ويحمي الخصوصية. المسار: `~/workspace/rework/bark-kids/jadx-out/sources/us/bark/sdk/analysis/` (TextAnalyzer.java، TextClassificationEngine.java، OTPClassifier.java، ORTAnalyzer.java) + `apktool-out/res/raw/`. **انسخ البنية** (tokenize → tensors → softmax → threshold) **ودرّب نماذج Family OS الخاصة** (عربية/إنجليزية). |
| 2 | **تدفق الإقران برمز الجهاز** (`POST login` + `password=<code>`) | 1 | بسيط، بلا حسابات على جهاز الطفل، ويُعاد استخدامه لمضاد إلغاء التثبيت والوصول المؤقت. المسار: `.../auth/helper/LoginHelper.java` + `.../auth/presenter/SignInPresenterImpl.java`. اعتمده مع **انتهاء صلاحية للرمز ومعدل محاولات محدود** (هم بلا حد ظاهر). |
| 3 | **مفردات البث `BarkBroadcasts`** (~50 فعلاً) | 2 | قائمة جاهزة لأوامر/أحداث وكيل الطفل — كيّفها مع **توقيع كل أمر** (مستقبلاتهم `exported=true` — ثغرة). المسار: `.../us/bark/sdk/broadcasts/BarkBroadcasts.java`. |
| 4 | **دفع "الانتباه" الصامت** (موقع فوري قسري + تحديث سياج) | 1 | `NotificationServiceExtension.java`: `type=attention` + `ttl_in_seconds` (تقليم 1800s) ← تحديث موقع فوري؛ الدفع الصامت الآخر ← `startGeofenceWorker()`. انسخ النمط حرفياً (بما فيه `preventDefault()`). |
| 5 | **خط الرفع `ServerUpdate`** (بوابات + idempotency + معالجة 401) | 1 | `.../network/ServerUpdate.java`: بوابة `isPermittedToUploadToServer && pollingEnabled`، عدم تكرار الرفع عبر `MessagesDB`، `SocketTimeoutException` ← إعادة المحاولة، `401` ← قطع الجلسة. |
| 6 | **نمط GraphQL persisted queries** | 2 | `graphql.persisted_query.hash.sha256Hash` في حزمة الأب — موفّر للحزم ومقاوم للتلاعب. اعتمده لـ API المنصة. |
| 7 | **قائمة الحزم الأصلية الـ 20** (`PackageList.java`) | 2 | وصفة جاهزة "ماذا يحتاج تطبيق أهل RN": تخزين/بصمة/دفع/إشعارات/إعدادات بيئة/WebView. كيّفها (استبدل Iterable بما يناسب). |
| 8 | **نمط `RNCConfig`** (reflection على `BuildConfig`) | 2 | فصل إعدادات البيئات أصلياً ← JS. المسار: `.../com/lugg/RNCConfig/RNCConfigModuleImpl.java`. |
| 9 | **طبقة محتوى الخبراء بالروابط العميقة** | 2 | التنبيه ← صفحة إرشاد (`www.bark.us/<category>`) — أساس "توصيات الخبراء" في لوحة الأب؛ في Family OS تُغذّى من وكيل الأب الذكي. |
| 10 | **فصل المضيفين** (`api` / `data` / `screentime`) | 3 | فصل حركة البيانات عالية التردد عن REST الإداري — نمط سليم للتوسع. |
| 11 | **عتبة 0.97 + تصنيف neutral** | 2 | سياسة دقة/استدعاء متحفظة (تفضل عدم التنبيه الكاذب) — اعتمد المبدأ مع معايرة لبيانات Family OS. |
| ✗ | مستقبلات الأوامر `exported=true` بلا توقيع | ✗ | **مرفوض أمنياً** — أي تطبيق يبث أوامر للطفل. Family OS: مستقبلات غير مصدَّرة + توقيع. |
| ✗ | مفاتيح Google/Sentry المكتوبة صراحة (`strings.xml`، الحزمة) | ✗ | **مرفوض** — أسرار مسرّبة؛ Family OS: خادم إعدادات + تثبيت شهادات. |
| ✗ | الاعتماد الكلي على OneSignal/Iterable/Sentry كأطراف ثالثة للتنبيهات | ✗ | Family OS يبني قناة الدفع الخاصة (السيادة على بيانات الأطفال). |

### الفجوة الاستراتيجية التي يملؤها هذا التحليل
تقرير الجولة الأولى انتهى عند "المراقبة والتصنيف الفعلي يتم على السيرفر/تطبيق الطفل — ليس في هذا الـ APK" و"لا تبحث عن خوارزميات هنا". الآن نملك **العكس المثبت**: التصنيف **على جهاز الطفل** (نماذج ONNX حقيقية بأوزانها)، وخط الإقران الكامل برمز الجهاز، ومفردات الأوامر الخمسينية، وخط الرفع — وهي اللبنات التي سيُبنى عليها **محرك الذكاء على الجهاز** و**طبقة الإقران** في Family OS.

---

## 7. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **رابط GraphQL للأب** [غير محسوم]: مشفّر في الحزمة المشفرة — يحتاج فك Hermes أو مراقبة شبكية حية.
2. **قائمة عمليات GraphQL للأب** (التنبيهات/الأطفال/الإعدادات): الحزمة minified — [غير محسومة].
3. **توليد رمز الجهاز في الأب**: الطرف الأبوي من التدفق في JS المشفر — [INFERENCE: GraphQL mutation في قسم Account].
4. **صلاحية رمز الجهاز وإعادة التوليد**: غير مرصودة في الكود المفحوص — [غير محسوم].
5. **دقة نماذج ONNX مع العربية**: النماذج إنجليزية (tokenizer إنجليزي) — [INFERENCE: لا تدعم العربية؛ Family OS يحتاج نماذج ثنائية اللغة].
6. **`mfaondevice_1_1234567890.onnx`** (50KB): الدور الدقيق غير مؤكد [INFERENCE: تحقق على الجهاز].
7. **توقيت دفع السحابة للطفل بعد تغيير الأب**: هل هو فوري أم عند الاستطلاع التالي — [غير محسوم، يحتاج مراقبة حية].
8. **تطبيق `us.bark.guarddog` و`us.bark.messages`**: حزمتان مرافقتان (Bark Phone) تُستقبل فيهما بثوث الاحتيال — خارج نطاق هذا التحليل [مرجع].
9. **شاشات الأب الفعلية**: أسماء الشاشات في الحزمة minified — بنية لوحة الأب التفصيلية [غير مستخرجة].

---

## 8. خريطة الملفات المرجعية (مسارات دقيقة)

**تطبيق الأب** (`~/workspace/rework/bark/`):
- `jadx-out/sources/cm/pt/barkparent/MainApplication.java` + `MainActivity.java` + `BuildConfig.java` — المدخل والإصدار (6.5.1 / 600500103).
- `jadx-out/sources/com/facebook/react/PackageList.java` — الحزم الأصلية الـ 20 (أثمن ملف في الأب).
- `jadx-out/sources/com/lugg/RNCConfig/RNCConfigModuleImpl.java` — نمط إعدادات البيئة.
- `apktool-out/assets/index.android.bundle` — حزمة Hermes v98 (GraphQL persisted queries).
- `apktool-out/AndroidManifest.xml` — المكونات + ~140 رابطاً عميقاً (خريطة محتوى الخبراء).
- `apktool-out/res/values/strings.xml` — OneSignal IDs + Firebase (انتبه للمفاتيح المسرّبة).

**تطبيق الطفل** (`~/workspace/rework/bark-kids/`):
- `jadx-out/sources/us/bark/sdk/analysis/` — **محرك الذكاء**: `TextAnalyzer.java` (العتبة 0.97 + 12 تسمية)، `TextClassificationEngine.java` (softmax)، `ORTAnalyzer.java`، `shortcodes/OTPClassifier.java` (+ `TFIDFVectorizer.java`)، `HuggingFaceTokenizer.java`.
- `jadx-out/sources/com/pt/bark/helper/AnalysisManager.java` — تنسيق النتائج + سياسات الحذف.
- `jadx-out/sources/us/bark/sdk/broadcasts/BarkBroadcasts.java` — مفردات الأوامر (~50 فعلاً).
- `jadx-out/sources/com/pt/bark/notification/NotificationServiceExtension.java` — دفع "الانتباه" + تحديث السياج.
- `jadx-out/sources/com/pt/bark/network/` — `BarkApi.java` (16 نقطة)، `BarkRestClient.java` (المضيفون)، `ServerUpdate.java` (خط الرفع)، `screentime/`.
- `jadx-out/sources/com/pt/bark/auth/` — `helper/LoginHelper.java` (جسم `POST login`)، `presenter/SignInPresenterImpl.java` (الإقران).
- `jadx-out/sources/com/pt/bark/vpn/BarkVpnService.java` + `.../services/accessibility/BarkAccessibilityService.java` — الثنائية التنفيذية.
- `apktool-out/res/raw/` — النماذج: `adultmediamobile_31_1724800699_fp32.ort`، `mobilemodel_1_1753905899.ort`، `mfaondevice_1_1234567890.onnx`، `tokenizer.json`، `tfidf_config.json`.
- `apktool-out/lib/arm64-v8a/libonnxruntime.so` + `libonnxruntime4j_jni.so` — مشغّل الاستدلال.
- `apktool-out/AndroidManifest.xml` + `apktool-out/res/values/strings.xml` — المكونات ونصوص رمز الجهاز.
