# كتالوج المكونات والخدمات المعمارية لتطبيق Qustodio Parents App
# Qustodio Architectural Components Catalog (APK v182.41.0 / Build 1824100)

> **الحزمة المعرّفة:** `com.qustodio.family.parental.control.app.screentime`  
> **الإصدار:** 182.41.0 (كود البناء 1824100)  
> **الهدف المعماري:** Android 16 (Target SDK 36, Compile SDK 36, Min SDK 24)  
> **النمط المعماري الأساسي:** Hybrid Enterprise Architecture (Apache Cordova Native Shell + Modern React/TypeScript SPA + Native Shared Libraries)  
> **إجمالي المكونات المعمارية المفككة:** **43 مكوناً نظامياً**

---

## 1. الملخص الإحصائي للمكونات (Components Breakdown Summary)

| نوع المكون (Component Type) | العدد الكلي | المكونات المصدرة (Exported: true) | المكونات المحمية بتصريح (Permission Protected) | المكونات الداخلية (Private / Internal) |
|---|---|---|---|---|
| **الأنشطة (Activities)** | 17 | 7 | 2 (`PushHandlerActivity`, `BackgroundHandlerActivity`) | 10 |
| **الخدمات الخلفية (Services)** | 13 | 2 | 3 (`BIND_JOB_SERVICE`, `REVOCATION_NOTIFICATION`) | 11 |
| **مستقبلات البث (Broadcast Receivers)** | 9 | 3 | 2 (`INSTALL_PACKAGES`, `DUMP`, `C2DM SEND`) | 6 |
| **مزودات المحتوى (Content Providers)** | 4 | 0 (جميعها غير مصدّرة `exported="false"`) | 1 (`grantUriPermissions="true"`) | 4 |
| **الإجمالي العام (Total Components)** | **43** | **12** | **8** | **31** |

---

## 2. جدول الفهرسة السريع للمكونات الـ 43 (Quick Reference Matrix)

### الأنشطة الـ 17 (Activities):
1. `com.qustodio.family.parental.control.app.screentime.MainActivity` (النشاط الجذري - Cordova Shell)
2. `de.niklasmerz.cordova.biometric.BiometricActivity` (نافذة البصمة الحيوية)
3. `com.adobe.phonegap.push.PushHandlerActivity` (معالج إشعارات الدفع المحمي)
4. `com.adobe.phonegap.push.BackgroundHandlerActivity` (معالج الرسائل بالخلفية)
5. `org.apache.cordova.firebase.OnNotificationReceiverActivity` (معالج فتح إشعارات فايربيس)
6. `com.android.billingclient.api.ProxyBillingActivity` (نافذة وسيط الاشتراكات Google Play v1)
7. `com.android.billingclient.api.ProxyBillingActivityV2` (نافذة وسيط الاشتراكات Google Play v2)
8. `com.google.android.gms.tagmanager.TagManagerPreviewActivity` (معاينة حاويات Google Tag Manager)
9. `com.braze.ui.BrazeWebViewActivity` (شاشة رسائل الويب التفاعلية لـ Braze)
10. `com.braze.ui.activities.BrazeFeedActivity` (شاشة تغذية أخبار Braze)
11. `com.braze.ui.activities.ContentCardsActivity` (شاشة بطاقات المحتوى الترويجية لـ Braze)
12. `com.braze.push.NotificationTrampolineActivity` (ترامبولين الإشعارات المتوافق مع Android 12+)
13. `com.google.firebase.auth.internal.GenericIdpActivity` (وسيط تسجيل الدخول الموحد Generic IDP)
14. `com.google.firebase.auth.internal.RecaptchaActivity` (اختبار التحقق ومكافحة البوت reCAPTCHA)
15. `com.google.android.gms.auth.api.signin.internal.SignInHubActivity` (محور تسجيل الدخول عبر Google)
16. `com.google.android.gms.common.api.GoogleApiActivity` (حل مشاكل خدمات Google Play)
17. `com.google.android.play.core.common.PlayCoreDialogWrapperActivity` (حوارات التقييم والتحديث التلقائي)

### الخدمات الـ 13 (Services):
1. `com.qustodio.pasa.QustodioPushNotificationService` (موجه الإشعارات وأوامر القفل لـ Qustodio)
2. `com.braze.push.BrazeFirebaseMessagingService` (خدمة إشعارات وتزامن رموز Braze)
3. `com.adobe.phonegap.push.FCMService` (خدمة إشعارات Phonegap Cordova)
4. `org.apache.cordova.firebase.FirebasePluginMessagingService` (خدمة فايربيس المساعدة لـ Cordova)
5. `com.google.firebase.messaging.FirebaseMessagingService` (خدمة فايربيس الأساسية ذات الأولوية المنخفضة)
6. `com.google.firebase.components.ComponentDiscoveryService` (مكتشف ومسجل إضافات فايربيس الـ 19)
7. `com.google.firebase.sessions.SessionLifecycleService` (جامع قياسات الجلسات)
8. `com.google.android.gms.measurement.AppMeasurementService` (خدمة تحليلات Google Analytics)
9. `com.google.android.gms.measurement.AppMeasurementJobService` (خدمة الجدولة الدورية للتحليلات)
10. `com.google.android.gms.auth.api.signin.RevocationBoundService` (خدمة إلغاء توكنات المصادقة)
11. `com.google.android.gms.tagmanager.TagManagerService` (خدمة معالجة حاويات Tag Manager)
12. `com.google.android.datatransport.runtime.backends.TransportBackendDiscovery` (خدمة CCT للنقل الآمن)
13. `com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService` (مجدول مهام النقل)

### مستقبلات البث الـ 9 (Broadcast Receivers):
1. `com.adjust.sdk.AdjustReferrerReceiver` (التقاط رابط الإحالة والتثبيت)
2. `com.adobe.phonegap.push.BackgroundActionButtonHandler` (معالجة النقر على أزرار الإشعار التفاعلية)
3. `com.adobe.phonegap.push.PushDismissedHandler` (معالجة سحب وإغلاق الإشعار)
4. `org.apache.cordova.firebase.OnNotificationOpenReceiver` (معالجة فتح إشعار فايربيس)
5. `com.google.firebase.iid.FirebaseInstanceIdReceiver` (استقبال حزم GCM/FCM الخام من النظام)
6. `com.google.android.gms.measurement.AppMeasurementReceiver` (مستقبل أحداث القياس والشبكة)
7. `com.braze.push.BrazePushReceiver` (مستقبل تفاعلات وحملات Braze)
8. `com.google.android.datatransport.runtime.scheduling.jobscheduling.AlarmManagerSchedulerBroadcastReceiver` (منبه إعادة إرسال القياسات)
9. `androidx.profileinstaller.ProfileInstallReceiver` (تثبيت ملفات تسريع الأداء Baseline Profiles)

### مزودات المحتوى الـ 4 (Content Providers):
1. `androidx.core.content.FileProvider` (مشاركة الملفات والصور والتقارير بأمان)
2. `com.google.firebase.provider.FirebaseInitProvider` (التهيئة التلقائية المبكرة لـ Firebase)
3. `androidx.startup.InitializationProvider` (التهيئة الموحدة لمكتبات AndroidX Jetpack)
4. `com.adjust.sdk.SystemLifecycleContentProvider` (التهيئة التلقائية لمكتبة Adjust لمراقبة دورة حياة التطبيق)

---

## 3. الفحص المعماري التفصيلي للأنشطة (Activities Deep Dive - 17 Activities)

### 1. `MainActivity` (النشاط المركزي)
* **المسار البرمجي الكامل:** `com.qustodio.family.parental.control.app.screentime.MainActivity`
* **الكلاس الموروث:** `org.apache.cordova.CordovaActivity`
* **الحالة من حيث التصدير:** `android:exported="true"`
* **نمط الإطلاق والسمة:** `android:launchMode="singleTask"` | `android:theme="@style/Theme.App.SplashScreen"`
* **خصائص الشاشة والإدخال:** `android:screenOrientation="portrait"` | `android:windowSoftInputMode="adjustResize"` | `android:resizeableActivity="false"`
* **مرشحات النوايا (Intent Filters):**
  1. **إطلاق التطبيق الأساسي (Launcher Intent):**
     - Action: `android.intent.action.MAIN`
     - Category: `android.intent.category.LAUNCHER`
  2. **الروابط العميقة الخاصة (Custom Scheme Deep Link):**
     - Action: `android.intent.action.VIEW`
     - Categories: `android.intent.category.DEFAULT`, `android.intent.category.BROWSABLE`
     - Data Scheme: `qustodiofamily`
  3. **روابط التطبيق الموثقة تلقائياً (Android App Links with Auto-Verify):**
     - Action: `android.intent.action.VIEW`
     - Categories: `android.intent.category.DEFAULT`, `android.intent.category.BROWSABLE`
     - Data: `android:scheme="https"` | `android:host="family.qustodio.com"` | `android:pathPrefix="/parents-app"`
     - التحقق التلقائي: `android:autoVerify="true"`
* **الدور المعماري:**
  يمثل النشاط الجذري لتطبيق الآباء. يقوم بتهيئة محرك Cordova WebView وتمرير المتغيرات التشغيلية، وفحص معاملات البدء بالخلفية (`PushConstants.START_IN_BACKGROUND -> moveTaskToBack(true)`). كما يستضيف واجهة المستخدم الكاملة المبنية بتقنية React 18 SPA الموجودة في `assets/www/index.html`.

---

### 2. `BiometricActivity` (بوابة التحقق الحيوي للوالدين)
* **المسار البرمجي الكامل:** `de.niklasmerz.cordova.biometric.BiometricActivity`
* **الكلاس الموروث:** `androidx.appcompat.app.AppCompatActivity`
* **الحالة من حيث التصدير:** `android:exported="false"`
* **السمة:** `android:theme="@style/TransparentTheme"`
* **الدور المعماري:**
  يقوم بعرض حوار المصادقة الحيوية المشفرة (بصمة الإصبع أو بصمة الوجه) عبر `androidx.biometric.BiometricPrompt`. يدير ثلاثة أنماط رئيسية: `JUST_AUTHENTICATE`، و `REGISTER_SECRET` (تشفير المفتاح السري `__aio_secret_key` عبر Hardware Keystore Cipher)، و `LOAD_SECRET` (فك تشفير المفتاح السري عند نجاح التحقق). في حال عدم توفر البصمة أو فشلها، يتحول الحوار تلقائياً إلى قفل الشاشة النظامي (PIN/Pattern/Password) عبر `KeyguardManager.createConfirmDeviceCredentialIntent`. يمثل خط الدفاع الأول لمنع الأطفال من تعديل حدود وقت الشاشة أو تعطيل الحظر إذا وقع هاتف الوالد في أيديهم.

---

### 3. `PushHandlerActivity` (معالج الإشعارات المحمي بالتوقيع)
* **المسار البرمجي الكامل:** `com.adobe.phonegap.push.PushHandlerActivity`
* **الكلاس الموروث:** `android.app.Activity`
* **الحالة من حيث التصدير:** `android:exported="true"`
* **الإذن المطلوب للتشغيل:** `com.qustodio.family.parental.control.app.screentime.permission.PushHandlerActivity` (`protectionLevel="signature"`)
* **الدور المعماري:**
  يتم تشغيله عند نقر الوالد على إشعار في شريط النظام (مثل تنبيه استغاثة SOS أو إشعار طلب وقت إضافي). تم تصديره بصيغة `exported="true"` للسماح لخدمة System Notification Manager باستدعائه، ولكنه محمي بتصريح توقيع خاص (`protectionLevel="signature"`) مما يمنع أي تطبيق خبيث مثبت على الجهاز من محاكاة النقر على الإشعار أو حقن أوامر وهمية.

---

### 4. `BackgroundHandlerActivity` (معالج الرسائل في وضع الخلفية)
* **المسار البرمجي الكامل:** `com.adobe.phonegap.push.BackgroundHandlerActivity`
* **الكلاس الموروث:** `android.app.Activity`
* **الحالة من حيث التصدير:** `android:exported="true"`
* **الإذن المطلوب للتشغيل:** `com.qustodio.family.parental.control.app.screentime.permission.BackgroundHandlerActivity`
* **مرشح النوايا:** Action: `com.adobe.phonegap.push.background.MESSAGING_EVENT` | Category: `DEFAULT`
* **الدور المعماري:**
  يتعامل مع رسائل الدفع الواردة في وضع الخمول لمعالجة حمولات البيانات الصامتة (Data-only FCM payloads) وتحديث شارات الإشعارات دون الحاجة لفتح واجهة التطبيق كاملة.

---

### 5. `OnNotificationReceiverActivity` (معالج فتح إشعارات فايربيس)
* **المسار البرمجي الكامل:** `org.apache.cordova.firebase.OnNotificationReceiverActivity`
* **الكلاس الموروث:** `android.app.Activity`
* **الحالة من حيث التصدير:** `android:exported="true"`
* **الخصائص:** `android:excludeFromRecents="true"` | `android:noHistory="true"` | `android:taskAffinity=""` | `android:theme="@android:style/Theme.Translucent.NoTitleBar"`
* **الدور المعماري:**
  نشاط شفاف سريع ومؤقت يقوم بالتقاط بيانات النقر على إشعارات Firebase، واستخراج الـ Payload وإرساله لحافلة أحداث Cordova في WebView، ثم ينهي نفسه فوراً (`finish()`) دون ترك أثر في شاشة التطبيقات الحديثة (Recent Apps).

---

### 6 & 7. `ProxyBillingActivity` و `ProxyBillingActivityV2` (وسيط فواتير Google Play)
* **المسار البرمجي:** `com.android.billingclient.api.ProxyBillingActivity` & `ProxyBillingActivityV2`
* **الحالة من حيث التصدير:** `android:exported="false"`
* **السمة:** `@android:style/Theme.Translucent.NoTitleBar`
* **الدور المعماري:**
  أنشطة وسيطة تابعة لمكتبة Google Play In-App Billing Client 9.0.0. تدير تدفق شراء الاشتراكات المدفوعة (Qustodio Premium)، وعرض حوار الأسعار وطرق الدفع والاشتراكات العائلية متعددة الأجهزة دون التأثير على دورة حياة النشاط الرئيسي.

---

### 8. `TagManagerPreviewActivity` (معاينة Google Tag Manager)
* **المسار البرمجي:** `com.google.android.gms.tagmanager.TagManagerPreviewActivity`
* **الحالة من حيث التصدير:** `android:exported="true"` | `android:noHistory="true"`
* **مرشح النوايا:** Action: `VIEW` | Data Scheme: `tagmanager.c.com.qustodio.family.parental.control.app.screentime`
* **الدور المعماري:**
  يستقبل روابط معاينة حاويات Tag Manager للاختبار وتتبع الأحداث التسويقية.

---

### 9, 10, 11, 12. أنشطة منصة Braze التسويقية والتفاعلية
* **المسارات البرمجية:**
  - `com.braze.ui.BrazeWebViewActivity` (`exported="false"`): عرض صفحات الويب المنبثقة لرسائل التوعية والتنبيهات الترويجية داخل التطبيق.
  - `com.braze.ui.activities.BrazeFeedActivity` (`exported="false"`): عرض موجز المقالات التوجيهية للوالدين.
  - `com.braze.ui.activities.ContentCardsActivity` (`exported="false"`): عرض بطاقات المحتوى والنصائح التربوية داخل التطبيق.
  - `com.braze.push.NotificationTrampolineActivity` (`exported="false"` | `launchMode="singleInstance"` | `taskAffinity=".NotificationTrampolineActivity"`): ترامبولين خاص بمعالجة النقر على إشعارات Braze متوافق مع قيود Android 12 (Trampoline Restrictions).

---

### 13 & 14. أنشطة التحقق والهوية من Firebase
* **المسارات البرمجية:**
  - `com.google.firebase.auth.internal.GenericIdpActivity` (`exported="true"` | Scheme: `genericidp` | Host: `firebase.auth` | Path: `/`): وسيط تفويض موفري الهوية المخصصين (OAuth / SAML / Apple Sign-In).
  - `com.google.firebase.auth.internal.RecaptchaActivity` (`exported="true"` | Scheme: `recaptcha` | Host: `firebase.auth` | Path: `/`): تنفيذ اختبارات reCAPTCHA للتحقق من هوية المستخدم ومنع الهجمات المؤتمتة عند تسجيل الدخول أو استعادة كلمة المرور.

---

### 15, 16, 17. أنشطة Google Play Services و Play Core
* **المسارات البرمجية:**
  - `com.google.android.gms.auth.api.signin.internal.SignInHubActivity` (`exported="false"`): إدارة حوارات تسجيل الدخول بحساب Google.
  - `com.google.android.gms.common.api.GoogleApiActivity` (`exported="false"`): حوار حل مشاكل خدمات Google Play في حال كانت معطلة أو قديمة.
  - `com.google.android.play.core.common.PlayCoreDialogWrapperActivity` (`exported="false"`): عرض حوار تقييم التطبيق داخل المتجر والتحديث الفوري (In-App Review / In-App Update).

---

## 4. الفحص المعماري التفصيلي للخدمات الخلفية (Services Deep Dive - 13 Services)

### 1. `QustodioPushNotificationService` (المحرك العصبي لإشعارات وأوامر التحكم)
* **المسار البرمجي:** `com.qustodio.pasa.QustodioPushNotificationService`
* **الكلاس الموروث:** `com.adobe.phonegap.push.FCMService` (يمتد أساساً من `FirebaseMessagingService`)
* **الحالة من حيث التصدير:** `android:exported="false"`
* **مرشح النوايا:** Action: `com.google.firebase.MESSAGING_EVENT`
* **الدور المعماري وتحليل الكود المفكك:**
  يمثل نقطة الدخول المركزية لكافة إشعارات الدفع والرسائل القادمة من خوادم Qustodio و Google FCM. يُظهر الكود المفكك تحليلاً دقيقاً للرسائل:
  ```java
  public void onMessageReceived(RemoteMessage remoteMessage) {
      Log.d(TAG, "onMessageReceived type: " + remoteMessage.getMessageType());
      boolean zHandleBrazeRemoteMessage = BrazeFirebaseMessagingService.handleBrazeRemoteMessage(this, remoteMessage);
      if (zHandleBrazeRemoteMessage) {
          return; // تم معالجة الرسالة كحملة تسويقية أو رسالة داخلية من Braze
      }
      super.onMessageReceived(remoteMessage); // معالجة الرسالة كإشعار رقابي (SOS, Limit, Lock)
  }
  ```
  هذه الخدمة هي المسؤولة عن استقبال إشعارات الاستغاثة (SOS Panic)، وتحديثات تجاوز الحدود الزمنية، وتنبيهات محاولات زيارة المواقع المحظورة.

---

### 2, 3, 4, 5. خدمات الرسائل الأخرى (Messaging & Routing Stack)
* `com.braze.push.BrazeFirebaseMessagingService` (`exported="false"`): مزامنة توكنات FCM مع منصة Braze.
* `com.adobe.phonegap.push.FCMService` (`exported="true"`): الخدمة الأساسية لمكتبة Phonegap Push لتمرير حمولة الإشعارات إلى واجهة JavaScript.
* `org.apache.cordova.firebase.FirebasePluginMessagingService` (`exported="false"`): خدمة معالجة أحداث Firebase Plugin.
* `com.google.firebase.messaging.FirebaseMessagingService` (`exported="false"` | `directBootAware="true"` | `priority="-500"`): المعالج الاحتياطي ذو الأولوية المنخفضة لحزم FCM.

---

### 6. `ComponentDiscoveryService` (موزع ومكتشف مكونات فايربيس)
* **المسار البرمجي:** `com.google.firebase.components.ComponentDiscoveryService`
* **الحالة:** `android:exported="false"` | `android:directBootAware="true"`
* **المسجلات المكتشفة (19 Registrars):**
  1. `FirebaseFunctionsKtxRegistrar` & `FunctionsRegistrar` (الدوال السحابية)
  2. `FirebaseMessagingKtxRegistrar` & `FirebaseMessagingRegistrar` (إشعارات الدفع)
  3. `FirebaseInAppMessagingDisplayKtxRegistrar` & `FirebaseInAppMessagingDisplayRegistrar` (الرسائل التفاعلية)
  4. `FirebasePerfKtxRegistrar` & `FirebasePerfRegistrar` (مراقبة الأداء)
  5. `FirebaseRemoteConfigKtxRegistrar` & `RemoteConfigRegistrar` (الإعدادات السحابية الديناميكية)
  6. `FirebaseAuthRegistrar` (المصادقة وتأمين الحسابات)
  7. `FirebaseFirestoreKtxRegistrar` & `FirestoreRegistrar` (قاعدة البيانات السحابية والمزامنة دون اتصال)
  8. `AnalyticsConnectorRegistrar` (ربط التحليلات)
  9. `CrashlyticsNdkRegistrar`, `FirebaseCrashlyticsKtxRegistrar`, `CrashlyticsRegistrar` (رصد الانهيارات على مستوى كود C++ وجافا)
  10. `FirebaseSessionsRegistrar` (تتبع الجلسات)
  11. `FirebaseInstallationsKtxRegistrar` & `FirebaseInstallationsRegistrar` (هوية التثبيت)
  12. `AbtRegistrar` (اختبارات A/B Testing)
  13. `TransportRegistrar` (تأمين نقل البيانات)

---

### 7, 8, 9. خدمات التحليلات والقياس (Telemetry & Measurement Services)
* `com.google.firebase.sessions.SessionLifecycleService` (`exported="false"`): تتبع مدة الجلسات الفعالة واستخدام التطبيق.
* `com.google.android.gms.measurement.AppMeasurementService` (`exported="false"`): خدمة جمع ونقل تحليلات Google Analytics.
* `com.google.android.gms.measurement.AppMeasurementJobService` (`exported="false"` | الإذن المطلوب: `android.permission.BIND_JOB_SERVICE`): خدمة مجدولة عبر Android JobScheduler لتجميع وتصدير دفعات التحليلات دون استنزاف البطارية.

---

### 10. `RevocationBoundService` (إلغاء رموز المصادقة)
* **المسار البرمجي:** `com.google.android.gms.auth.api.signin.RevocationBoundService`
* **الحالة:** `android:exported="true"` | `android:visibleToInstantApps="true"`
* **الإذن المطلوب:** `com.google.android.gms.auth.api.signin.permission.REVOCATION_NOTIFICATION`
* **الدور المعماري:** يستمع لإشعارات إلغاء الوصول لحساب Google عند قيام المستخدم بإلغاء الربط من إعدادات حساب Google الخارجي.

---

### 11, 12, 13. خدمات النقل و Tag Manager
* `com.google.android.gms.tagmanager.TagManagerService` (`exported="false"`): تقييم حاويات Tag Manager بالخلفية.
* `com.google.android.datatransport.runtime.backends.TransportBackendDiscovery` (`exported="false"`): مصنع قنوات النقل لنظام CCT (Google Clearcut Telemetry).
* `com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService` (`exported="false"` | الإذن المطلوب: `android.permission.BIND_JOB_SERVICE`): إعادة جدولة إرسال حزم البيانات الفاشلة بآلية التراجع الأسي (Exponential Backoff).

---

## 5. الفحص المعماري التفصيلي لمستقبلات البث (Broadcast Receivers - 9 Receivers)

| الرقم | اسم الكلاس الكامل | الحالة المصدرة | الإذن المطلوب | الأحداث ومسارات الاستماع (Intent Filters) | الدور المعماري |
|---|---|---|---|---|---|
| **1** | `com.adjust.sdk.AdjustReferrerReceiver` | `true` | `INSTALL_PACKAGES` | `com.android.vending.INSTALL_REFERRER` | التقاط بيانات حملة التثبيت وروابط الدعوة العائلية عند التثبيت من Google Play. |
| **2** | `com.adobe.phonegap.push.BackgroundActionButtonHandler` | `false` (ضمني) | لا يوجد | استدعاء داخلي عبر PendingIntent | معالجة النقر على أزرار الإشعار التفاعلية (مثل زر الموافقة على وقت إضافي). |
| **3** | `com.adobe.phonegap.push.PushDismissedHandler` | `false` (ضمني) | لا يوجد | استدعاء داخلي عبر PendingIntent | تنظيف الذاكرة وتحديث حالة الإشعار كـ "تم الإغلاق" عند سحبه من شريط الإشعارات. |
| **4** | `org.apache.cordova.firebase.OnNotificationOpenReceiver` | `false` (ضمني) | لا يوجد | استدعاء داخلي عبر PendingIntent | إرسال حدث فتح الإشعار إلى بيئة Cordova لتوجيه المستخدم للشاشة المناسبة داخل SPA. |
| **5** | `com.google.firebase.iid.FirebaseInstanceIdReceiver` | `true` | `com.google.android.c2dm.permission.SEND` | `com.google.android.c2dm.intent.RECEIVE` | مستقبل حزم FCM/C2DM المحمي من نظام أندرويد لتسليم رسائل الدفع المشفرة. |
| **6** | `com.google.android.gms.measurement.AppMeasurementReceiver` | `false` | لا يوجد | أحداث دورة الحياة وتغير الاتصال | الاستماع لتغير حالة الشبكة لإعادة إرسال تحليلات الاستخدام المتراكمة. |
| **7** | `com.braze.push.BrazePushReceiver` | `false` | لا يوجد | أحداث النقر والتفاعل مع إشعارات Braze | معالجة تفاعلات حملات التوعية الموجهة لأولياء الأمور. |
| **8** | `AlarmManagerSchedulerBroadcastReceiver` | `false` | لا يوجد | منبهات الجدولة الدورية | استقبال منبهات AlarmManager لإيقاظ خدمة النقل وإرسال البيانات المتأخرة. |
| **9** | `androidx.profileinstaller.ProfileInstallReceiver` | `true` | `android.permission.DUMP` | `INSTALL_PROFILE`, `SKIP_FILE`, `SAVE_PROFILE`, `BENCHMARK_OPERATION` | تثبيت وتحسين ملفات التجميع التمهيدي (ART Baseline Profiles) لتقليل زمن بدء تشغيل التطبيق. |

---

## 6. الفحص المعماري لمزودات المحتوى (Content Providers - 4 Providers)

| الرقم | اسم المزود (Provider Class) | مسار السلطة (Authority) | الحالة المصدرة | الصلاحيات والتهيئات المكتشفة | الدور المعماري |
|---|---|---|---|---|---|
| **1** | `androidx.core.content.FileProvider` | `com.qustodio.family.parental.control.app.screentime.cdv.core.file.provider` | `false` | `grantUriPermissions="true"` <br> المسارات: `@xml/cdv_core_file_provider_paths` | مشاركة ملفات الصور والتقارير والملفات المؤقتة مع التطبيقات الخارجية (مثل الكاميرا أو برامج مشاركة التقارير) باستخدام روابط `content://` الآمنة. |
| **2** | `com.google.firebase.provider.FirebaseInitProvider` | `com.qustodio.family.parental.control.app.screentime.firebaseinitprovider` | `false` | `directBootAware="true"` <br> `initOrder="100"` | التهيئة المبكرة التلقائية لنواة Firebase App قبل استدعاء `Application.onCreate()`. |
| **3** | `androidx.startup.InitializationProvider` | `com.qustodio.family.parental.control.app.screentime.androidx-startup` | `false` | مسجلات التهيئة: <br> - `EmojiCompatInitializer` <br> - `ProcessLifecycleInitializer` <br> - `ProfileInstallerInitializer` | تهيئة موحدة ومحسنة لمكتبات AndroidX لتقليل زمن إقلاع التطبيق ومراقبة حالة العمليات في الخلفية. |
| **4** | `com.adjust.sdk.SystemLifecycleContentProvider` | `com.qustodio.family.parental.control.app.screentime.adjust-lifecycle-provider` | `false` | تهيئة دورة حياة مكتبة Adjust تلقائياً | تسجيل مستمعات دورة حياة النشاط (ActivityLifecycleCallbacks) تلقائياً عند بدء العملية. |

---

## 7. مصفوفة الروابط العميقة ومرشحات النوايا (Intent Filters & Deep Links Matrix)

| نوع الرابط (Link Type) | المخطط (Scheme) | النطاق / المضيف (Host) | المسار البادئ (Path Prefix) | المكون المعالج (Target Component) | الغرض والاستخدام في التطبيق |
|---|---|---|---|---|---|
| **رابط التطبيق الموثق (Android App Link)** | `https` | `family.qustodio.com` | `/parents-app` | `MainActivity` (`autoVerify="true"`) | فتح التطبيق مباشرة عند نقر الوالد على روابط البوابة السحابية أو روابط الدعوات العائلية دون ظهور حوار الاختيار. |
| **الرابط العميق المخصص (Custom Deep Link)** | `qustodiofamily` | غير مقيد | غير مقيد | `MainActivity` | الروابط الداخلية الموجهة من رسائل البريد الإلكتروني أو الإشعارات لفتح شاشات محددة (مثل شاشة حظر موقع معين). |
| **روابط التحقق الموحد (Firebase Auth IDP)** | `genericidp` | `firebase.auth` | `/` | `GenericIdpActivity` | استكمال تدفق المصادقة وإعادة التوجيه لموفري الهوية الخارجيين. |
| **روابط مكافحة البوت (Firebase reCAPTCHA)** | `recaptcha` | `firebase.auth` | `/` | `RecaptchaActivity` | استلام نتيجة التحقق الأمني من اختبارات reCAPTCHA. |
| **روابط معاينة Tag Manager** | `tagmanager.c.com.qustodio.family...` | غير مقيد | غير مقيد | `TagManagerPreviewActivity` | فحص واختبار حاويات تحليلات جوجل الترويجية. |

---

## 8. تقييم الأمان الهندسي لسطح الهجوم (IPC Attack Surface Analysis)

1. **تقليص المكونات المصدرة إلى أدنى حد:**
   - من أصل 43 مكوناً، تم ضبط **31 مكوناً كـ `exported="false"`**، مما يغلق 72% من سطح الهجوم المباشر للعمليات البينية (Inter-Process Communication).
2. **عزل مزودات المحتوى بالكامل:**
   - جميع مزودات المحتوى الأربعة مغلقة تماماً (`exported="false"`), مما يمنع تسريب أي ملفات محلية أو قواعد بيانات لتطبيقات أخرى على الجهاز.
3. **حماية المكونات المصدرة بتصاريح التوقيع (Signature Permissions):**
   - تم تقييد الأنشطة الحساسة مثل `PushHandlerActivity` و `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` بمستوى الحماية `android:protectionLevel="signature"`. هذا يضمن أنه لا يمكن لأي تطبيق خارجي حقن أوامر وهمية أو استدعاء معالجات الإشعارات إلا إذا كان موقعاً بنفس الشهادة الرسمية لـ Qustodio.
4. **تأمين روابط التطبيق (App Links Verification):**
   - تفعيل `android:autoVerify="true"` يمنع هجمات الاستيلاء على الروابط (Link Hijacking) من خلال مطابقة النطاق `family.qustodio.com` مع ملف `assetlinks.json` المرفوع على خادم الشركة.
