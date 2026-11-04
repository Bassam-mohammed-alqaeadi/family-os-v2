# تقرير الهندسة العكسية — Bark Parental Controls

## 1. نظرة عامة
- **الحزمة:** `cm.pt.barkparent` (اسم الحزمة الفعلي في الـ APK — لاحظ أنه لا يطابق نطاق Bark المعتاد).
- **النسخة:** لم تُذكر `versionName` في مقطع الـ manifest المقروء (تُستكمل من `BuildConfig` عند الحاجة).
- **طبيعة التطبيق — مهم:** **تطبيق React Native** وليس أصليًا. حزمة JS واحدة `assets/index.android.bundle` (~3.2MB) تحوي كل منطق العمل؛ حزمة Java الخاصة بالتطبيق 4 ملفات فقط (`MainActivity`، `MainApplication`، `BuildConfig`، `R`).
- **الدور في Family OS:** تطبيق **الأهل** (parent side) — لوحة المتابعة، مراجعة التنبيهات، الموقع، الاشتراكات. المراقبة والتصنيف الفعلي يتم على السيرفر/تطبيق الطفل — ليس في هذا الـ APK.
- **حجم المخرجات:** ~14k ملف Java — أغلبها إطار React Native والوحدات الأصلية المساعدة، لا منطق التطبيق.

## 2. البنية المعمارية
- **نشاط واحد:** `cm.pt.barkparent.MainActivity extends ReactActivity` باسم المكوّن `"Bark"` — كل الشاشات داخل JS.
- **`MainApplication`** تُهيئ `ReactHost` + `IterableApi` (تسويق/إيميل).
- **19 حزمة أصلية** مسجلة في `com/facebook/react/PackageList.java`:
  - `AsyncStoragePackage` — التخزين المحلي
  - `RNCConfigPackage` (`com.lugg.RNCConfig`) — إعدادات البيئة (روابط API والمفاتيح)
  - `ReactNativeBiometricsPackage` (`com.rnbiometrics`) — القفل بالبصمة
  - `ReactNativeOneSignalPackage` — الإشعارات الفورية
  - `RNIterableAPIPackage` — iterable
  - `NitroIapPackage` + `NitroModulesPackage` — المشتريات عبر Nitro
  - `RNSentryPackage` — تتبع الأعطال
  - `RNCWebViewPackage`، `RNScreensPackage`، `RNGestureHandlerPackage`، `SafeAreaContextPackage`، `BlurViewPackage`، `RNCMaskedViewPackage` — واجهات
  - `RNSharePackage`، `RNRatePackage`، `RNReactNativeHapticFeedbackPackage`، `FBSDKPackage`
- **مكتبات مساعدة:** `com.learnium.RNDeviceInfo` (معلومات الجهاز)، `com.onesignal`، `com.iterable`، `dev.hyo.openiap` (مشتريات مفتوحة المصدر)، `com.swmansion` (reanimated)، `com.margelo` (nitro).

## 3. الميزات الرئيسية وربطها بوحدات Family OS
| قدرة مرصودة في Bark | وحدة Family OS المقابلة |
|---|---|
| لوحة الأهل (JS) | لوحة تحكم الحماية العائلية |
| مراجعة التنبيهات (OneSignal + Iterable) | مركز التنبيهات الموحد |
| الموقع (`ACCESS_FINE_LOCATION`) | خريطة العائلة |
| القفل بالبصمة (`USE_BIOMETRIC`) | قفل التطبيق / صلاحيات الأهل |
| الاشتراكات (`BILLING` + NitroIap) | وحدة الاشتراكات |
| `RNCConfig` (إعدادات البيئة) | إدارة الإعدادات والبيئات |

> ملاحظة: أسماء الشاشات/الميزات داخل حزمة JS **مشوشة** (minified) — لم تُستخرج أسماء شاشات صريحة بالبحث النصي.

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- **لا يوجد منطق مراقبة/تصنيف في هذا الـ APK** — هذه نسخة الأهل؛ التحليل السلوكي يتم على السيرفر. **لا تبحث عن خوارزميات هنا.**
- **`com/facebook/react/PackageList.java`** — قائمة الـ 19 حزمة أعلاه: **أثمن ما في الاستخراج** — خريطة جاهزة "أي وحدات أصلية يحتاجها تطبيق أهل RN" (تخزين، بصمة، دفع، إشعارات، إعدادات بيئة).
- **`com/lugg/RNCConfig/`** (`RNCConfigModule.java`، `RNCConfigPackage.java`) — نمط `react-native-config`: تمرير روابط الـ API والمفاتيح من الإعدادات الأصلية إلى JS. **يُعاد استخدام النمط** لفصل بيئات (تطوير/إنتاج) المنصة.
- **`com/rnbiometrics/`** — وحدة البصمة الجاهزة: تُستخدم كمرجع لقفل الأهل في Family OS.
- **نمط GraphQL بالاستعلامات المحفوظة:** حزمة JS تحوي `graphql.persisted_query.hash.sha256Hash` — الـ API يعمل بـ GraphQL مع persisted queries (بصمات SHA256). **نمط يُعتمد** لتقليل حجم الطلبات في تطبيق المنصة.
- **Firebase:** `https://bark-android-parent.firebaseio.com` (Realtime Database — من `res/values/strings.xml`).

## 5. الصلاحيات والمكونات الحساسة
- **الموقع:** `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION`.
- **القفل الحيوي:** `USE_BIOMETRIC` + `USE_FINGERPRINT`.
- **الفوترة:** `com.android.vending.BILLING`.
- **الإشعارات:** `POST_NOTIFICATIONS` + مستقبلات OneSignal (`BootUpReceiver`، `FCMBroadcastReceiver`، `NotificationDismissReceiver`).
- **الخلفية:** `RECEIVE_BOOT_COMPLETED` + `WAKE_LOCK` + `FOREGROUND_SERVICE` + خدمات `androidx.work` (SystemAlarmService/SystemJobService) — نمط العمل المجدول في الخلفية.
- **مشاركة:** `fbconnect` scheme (Facebook SDK للمشاركة/الدخول).

## 6. الشبكة ونقاط التكامل
- **GraphQL** باستعلامات محفوظة (persisted queries + SHA256) — نقطة التكامل الرئيسية (الرابط الأساسي لم يُستخرج كنص صريح؛ يُستكمل من `RNCConfig` أو تحليل الشبكة).
- **`https://www.bark.us`** — النطاق المرجعي.
- **Firebase Realtime DB:** `bark-android-parent.firebaseio.com`.
- **الإشعارات:** OneSignal (`com.onesignal.*` خدمات ومستقبلات) + Iterable (`IterableFirebaseMessagingService`).
- **الأعطال:** Sentry (`o447951.ingest.sentry.io`).

## 7. توصيات إعادة الاستخدام
1. **لا تُعِد استخدام كود Java** — لا يوجد منطق تطبيق أصلًا؛ القيمة في **قائمة الوحدات** (§4) كوصفة لتطبيق أهل.
2. **اعتماد `RNCConfig`** كنمط لإدارة إعدادات البيئات في أي تطبيق RN/Hybrid بالمنصة.
3. **اعتماد البصمة** (`ReactNativeBiometricsPackage`) لبوابة الأهل — المكوّن ناضج وجاهز.
4. **اعتماد OneSignal + WorkManager** كنمط الإشعارات والمهام الخلفية (مستقبلات الإقلاع + `SystemJobService`).
5. **اعتماد GraphQL persisted queries** لتصميم API المنصة — موفّر للحزم ومقاوم للتلاعب.
6. **لاستخراج أعمق:** يلزم تحليل `index.android.bundle` بأدوات JS (وليس grep) — أو اعتبار أن منطق المراقبة الحقيقي على السيرفر أصلًا.

## 8. ملاحظات (التشويش، حدود التحليل)
- حزمة JS مصغّرة (minified) — البحث النصي عن الميزات (`alerts`، `geofence`، `screen_time`...) أعاد صفرًا أو ضجيجًا؛ الأسماء مدمجة بلا فواصل.
- لم يُعثر على رابط GraphQL الأساسي كنص صريح — على الأرجح يُمرَّر عبر `RNCConfig` الأصلية.
- تطبيق الطفل (المراقبة الفعلية: تصفية الويب، قراءة الرسائل) **تطبيق منفصل** غير مشمول في هذا التحليل.
- `versionName` لم تُقرأ — تُستكمل من `cm/pt/barkparent/BuildConfig.java` عند الحاجة.
