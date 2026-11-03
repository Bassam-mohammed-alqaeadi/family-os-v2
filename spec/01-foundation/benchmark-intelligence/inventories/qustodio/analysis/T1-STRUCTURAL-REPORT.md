# التقرير الهيكلي لتشريح الحزمة والمكونات — Qustodio (T1 Structural Analysis)

> **المعرف:** `T1-QU-STRUCTURAL-001`
> **التطبيق:** Qustodio Parental Control (`com.qustodio.family.parental.control.app.screentime`)
> **الإصدار المستخرج:** `182.41.0` (Build `1824100`)
> **بيئة التشغيل:** Android minSdk 24 (Nougat 7.0) / targetSdk 34 (Android 14)
> **المعمارية التقنية:** تطبيق هجين Apache Cordova مع محرك Ionic WebView (React / Redux / TypeScript)

---

## 1. الملخص التنفيذي للهيكلية وتحديد طوبولوجيا التطبيق (PASA Discovery)

أثبت الفحص الشامل لملف `AndroidManifest.xml` وكود Java المفكك عبر JADX أن هذه الحزمة هي **تطبيق الوالدين المتحكم حصراً (Parent App Standalone - PASA)**، وتخلو تماماً من أدوات الرقابة والإنفاذ المحلية المباشرة.

### ركائز الهيكلية الأساسية:
1. **طبيعة الحزمة:** Parent Controller (لوحة قيادة وتحكم ولي الأمر).
2. **الغياب التام لمكونات الإنفاذ:**
   - **صفر** مستقبِل لسياسة الجهاز (`DeviceAdminReceiver`).
   - **صفر** خدمة إمكانية وصول (`AccessibilityService`).
   - **صفر** خدمة شبكة خاصة افتراضية (`VpnService`).
   - **صفر** إذن وصول لإحصائيات الاستخدام (`PACKAGE_USAGE_STATS`).
3. **آلية الإنفاذ السحابي الفوري:**
   - إدارة السياسات تتم عبر الـ REST API في خوادم Qustodio.
   - إرسال أوامر القفل اللحظي وتغيير الحصص يتم ببث إشارات Firebase Cloud Messaging (FCM) عالية الأولوية نحو أجهزة الأطفال (Companion Devices).
4. **فحص التحقق من نوع التطبيق (Pre-Onboarding Gate):**
   - كود `ParentOrKidAppChoiceContainer.ts` (#L1-L35) و `WrongAppInstalledContainer.ts` (#L1-L43) يثبت وجود شاشة فحص أولي تلزم المستخدم بالاختيار؛ وفي حال اختيار 'جهاز الطفل'، يقوم التطبيق بإنهاء الجلسة فوراً وتوجيه المستخدم برابط خارجي لتحميل تطبيق الطفل المخصص.

---

## 2. جدول المكونات البرمجية الـ 43 (Android Components Breakdown)

| نوع المكون | العدد | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|:---:|---|---|
| **الأنشطة (Activities)** | **17** | `MainActivity`, `BiometricActivity`, `PushHandlerActivity`, `InAppBrowser`, `CordovaActivity` | `MainActivity` هي النشاط المركزي الحاضن لـ WebView؛ `BiometricActivity` توفر بوابة الدخول الحيوية المشفرة للوالد؛ `PushHandlerActivity` تعالج توجيه الروابط والإشعارات. |
| **الخدمات (Services)** | **13** | `QustodioPushNotificationService`, `BrazeFirebaseMessagingService`, `JobService` | `QustodioPushNotificationService` تستقبل إشعارات FCM وتمررها لـ Braze أو كود Cordova؛ بقية الخدمات تدير مهام المزامنة عبر Android JobScheduler و WorkManager. |
| **مستقبلات البث (Receivers)** | **9** | `PushReceiver`, `BrazeAppboyBroadcastReceiver`, `InstallListener` | استقبال إشارات إقلاع النظام (`BOOT_COMPLETED`)، تحديث حزم التطبيقات، وإحصائيات التثبيت والإحالة. |
| **مزودات المحتوى (Providers)** | **4** | `FileProvider`, `FirebaseInitProvider`, `InitProvider` | مشاركة الصور الرمزية والمستندات محلياً، والتهيئة التلقائية لمكتبات Firebase و Braze أثناء بدء تشغيل العملية. |

---

## 3. تدقيق الأذونات الـ 34 المصرحة (Permissions Audit)

| م | فئة الإذن | اسم الإذن في المانيفست | تصنيف الحماية | الدور الوظيفي في تطبيق الوالدين |
|---|---|---|---|---|
| 1 | **الشبكة** | `android.permission.INTERNET` | Normal | الاتصال بخوادم Qustodio السحابية وخدمات الدفع. |
| 2 | **حالة الشبكة** | `android.permission.ACCESS_NETWORK_STATE` | Normal | مراقبة توفر الاتصال بالإنترنت والتبديل بين Wi-Fi والبيانات. |
| 3 | **الموقع الدقيق** | `android.permission.ACCESS_FINE_LOCATION` | Dangerous | عرض موقع الوالد الحالي على خريطة العائلة التفاعلية مقارنة بالأطفال. |
| 4 | **الموقع التقريبي** | `android.permission.ACCESS_COARSE_LOCATION` | Dangerous | تحديد الموقع التقريبي عند تعذر الاتصال بأقمار GPS الصناعية. |
| 5 | **الإشعارات** | `android.permission.POST_NOTIFICATIONS` | Dangerous | إرسال تنبيهات الأزمات ووصول الأطفال للأماكن المحددة (Android 13+). |
| 6 | **الحيوية** | `android.permission.USE_BIOMETRIC` | Normal | تفعيل بوابة المصادقة الحيوية المشفرة ببصمة الإصبع أو الوجه. |
| 7 | **الكاميرا** | `android.permission.CAMERA` | Dangerous | التقاط صور الأطفال الرمزية لمسح رموز QR لربط الأجهزة. |
| 8 | **التخزين الخارجي** | `android.permission.READ_EXTERNAL_STORAGE` | Dangerous (Legacy) | اختيار صور الملفات الشخصية من معرض الهاتف. |
| 9 | **الاهتزاز** | `android.permission.VIBRATE` | Normal | تشغيل تنبيه الاهتزاز عند استلام إنذار طوارئ أو أزمة. |
| 10 | **بدء التشغيل** | `android.permission.RECEIVE_BOOT_COMPLETED` | Normal | إعادة تهيئة قنوات الإشعارات المحلية عند إعادة إقلاع الهاتف. |

---

## 4. الجسر الهجين بين كوردوفا وحزمة الويب (Hybrid Bridge Architecture)

تعتمد البنية الهندسية للتطبيق على استضافة حزمة ويب متكاملة (Single Page Application) داخل نظام أندرويد عبر محرك هجين:
1. **محرك الاستضافة:** `IonicWebViewEngine` مع خادم الملفات المحلي `WebViewLocalServer`؛ يمنع القيود الأمنية عبر المجال (CORS) ويحمل الأصول من المسار المشفر `https://localhost/`.
2. **فئة التوصيل المركزية (`QustodioPlugin.java`):**
   - توفر جسراً ثنائي الاتجاه بين Native Android وطبقة React.
   - طريقة `setWebAppReady`: تضمن عدم تسليم النوايا والروابط العميقة إلا بعد اكتمال تهيئة Redux Store في الويب.
   - دالة `handleDeepLinkIntent`: اعتراض الروابط العميقة (`qustodio://` و `https://*.qustodio.com/parents-app/*`) وتحويلها إلى استدعاء جافاسكريبت `javascript:handleOpenURL('...')`.
3. **خط أنابيب الإشعارات (`QustodioPushNotificationService.java`):**
   - ترث من `com.adobe.phonegap.push.FCMService`.
   - اعتراض أولي بواسطة `BrazeFirebaseMessagingService`؛ وإذا لم يكن الإشعار تسويقياً، يُسلم للمكتبة الأصلية لتحويله إلى كائن JSON وتمريره فوراً لطبقة TypeScript.
