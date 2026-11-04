# تقرير الهندسة العكسية — Qustodio Parental Control

## 1. نظرة عامة
- **الحزمة:** `com.qustodio.family.parental.control.app.screentime`
- **الدور في Family OS:** وحدة **الحماية الأبوية** — مع تحفظ مهم (انظر §5): هذا الـ APK هو
  **تطبيق الأهل (parent app) فقط**، وليس تطبيق الطفل الذي ينفذ الترشيح والحظر.
- **حجم المخرجات:** ~13,628 ملف Java — لكن الكود الأصلي للتطبيق **5 ملفات فقط**؛ الباقي مكتبات.
- **الطبيعة:** تطبيق هجين **Cordova/PhoneGap** — غلاف أصلي رقيق + تطبيق React كامل داخل `assets/www` (94MB).
- **طريقة التحليل:** المانيفست + الكود الأصلي الخمسة + `cordova_plugins.js` + بحث في حزمة JS المضغوطة
  (44MB minified — الاستخلاص من مسارات الـ router والسلاسل النصية).

## 2. البنية المعمارية (أهم الحزم والطبقات)
```
┌─────────────────────────────────────────┐
│  React SPA (assets/www) — كل منطق الأهل │
│  main.df358784.js + vendor + chunks     │
├─────────────────────────────────────────┤
│  Cordova bridge (org.apache.cordova)    │
├─────────────────────────────────────────┤
│  غلاف أصلي: MainActivity (CordovaActivity)│
│  + QustodioPlugin + PushService (3 ملفات)│
└─────────────────────────────────────────┘
```
- **الطبقة الأصلية:**
  - `com.qustodio.family.parental.control.app.screentime.MainActivity` — يرث `CordovaActivity`،
    ينقل المهمة للخلفية إذا فُتح من إشعار (`PushConstants.START_IN_BACKGROUND`)، ثم `loadUrl(launchUrl)`.
  - `com.qustodio.pasa.QustodioPlugin` — الجسر المخصص (انظر §4).
  - `com.qustodio.pasa.QustodioPushNotificationService` — توجيه الإشعارات (انظر §4).
- **طبقة الويب:** `assets/www/index.html` + `static/js/` — تطبيق React كامل (webpack).
- **إضافات Cordova الأصلية** (من `cordova_plugins.js`): الدفع (`@havesource/cordova-plugin-push`)،
  الخرائط (`cordova-plugin-googlemaps` — كامل: `Map`، `Circle`، `Geofence`-ish `LocationService`)،
  البصمة (`cordova-plugin-fingerprint-aio` + `de.niklasmerz.cordova.biometric.BiometricActivity`)،
  `cordova-plugin-firebasex`، `cordova-plugin-braze`، Adjust، `cordova-plugin-device`، `cordova-plugin-dialogs`.

## 3. الميزات الرئيسية وربطها بوحدات Family OS
| الميزة | الدليل في المخرجات | وحدة Family OS |
|---|---|---|
| قواعد التطبيقات | `rules/appRules/premiumFlyover` | الحماية: حظر/تقييد التطبيقات |
| قواعد المكالمات والرسائل | `rules/callsSMSRules/premiumFlyover` | الحماية: مراقبة الاتصالات |
| قواعد الموقع | `rules/locationRules/premiumFlyover` + خرائط Google | الحماية: التتبع الجغرافي |
| زر الذعر | `rules/panicButtonRules/premiumFlyover` + `panicButton` | الحماية: طوارئ الطفل |
| قواعد يوتيوب | `rules/youtube-rules/premiumFlyover` | الحماية: ترشيح المحتوى |
| ترشيح الويب | `webFilter`/`webfilter` | الحماية (التعريف فقط — التنفيذ في تطبيق الطفل) |
| وقت الشاشة والجدولة | `screenTime`، `timeLimit`، `bedtime` | الإدارة: جدولة الاستخدام |
| السياج الجغرافي | `geofence` + `cordova-plugin-googlemaps` | الحماية: تنبيهات المناطق |
| التقارير والتنبيهات | `family.qustodio.com/alert/` | التقارير الأبوية |
| الاشتراكات | `com.android.vending.BILLING` + `/checkout/thank-you` | نموذج الدخل (Premium/Family Pro) |
| المصادقة الموحدة | `auth.qustodio.com/sso/` | هوية العائلة |

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- **نمط الجسر الأصلي-ويب** — `QustodioPlugin.execute(String action, JSONArray args, CallbackContext cb)`:
  توزيع على `action` (`setWebAppReady`...) والرد عبر `callbackContext.success()` / `.error()`.
  نمط نظيف يُنسخ لأي جسر WebView في Family OS.
  المسار: `sources/com/qustodio/pasa/QustodioPlugin.java`.
- **معالجة الروابط العميقة مع التأجيل** — `handleDeepLinkIntent()` + `processPendingDeepLink()`:
  يقبل مخطط `qustodio://` وروابط `https://*.qustodio.com/parents-app` (regex)،
  يخزن الرابط في `pendingDeepLink` إذا لم تجهز الواجهة، ثم يحقنه كـ
  `javascript:handleOpenURL('<url>')` على خيط الواجهة. **حل كامل لمشكلة cold-start deep links** —
  يُعاد استخدامه حرفيًا.
- **توجيه الإشعارات الثنائي** — `QustodioPushNotificationService.onMessageReceived()`:
  ```java
  if (BrazeFirebaseMessagingService.handleBrazeRemoteMessage(this, msg)) return;
  super.onMessageReceived(msg); // FCM العادي
  ```
  نمط أنيق للتمييز بين دفع تسويقي (Braze) ودفع وظيفي (FCM) في خدمة واحدة.
- **تدفق المصادقة:** `https://auth.qustodio.com/sso/` + `"/v1/oauth2/access_token"` — OAuth2 قياسي
  يُقتبس لتدفق دخول الأهل.
- **قفل البصمة:** `cordova-plugin-fingerprint-aio` + `BiometricActivity` — مرجع لقفل لوحة الأهل.

## 5. الصلاحيات والمكونات الحساسة
الصلاحيات المعلنة: الموقع الدقيق + الخلفية (`ACCESS_FINE_LOCATION`...)، `POST_NOTIFICATIONS`،
`USE_BIOMETRIC`/`USE_FINGERPRINT`، الفوترة (`BILLING`)، `VIBRATE`، `WAKE_LOCK`.
**نقطة حاسمة — تحققت آليًا:** لا يوجد أي أثر لـ `VpnService` أو `AccessibilityService`
أو `DeviceAdminReceiver` في كامل المصادر (بحث شامل في `jadx-out/sources`).
**الاستنتاج:** تقنيات الترشيح والحظر الفعلية (VPN/Accessibility) تعيش في **تطبيق الطفل المنفصل**
(حزمة مختلفة غير موجودة هنا). هذا الـ APK لا يحتوي خوارزميات الترشيح.

## 6. الشبكة ونقاط التكامل
- `https://api.qustodio.com/v1` — واجهة البيانات (مسارات مرصودة: `/v1/metrics`، `/v1/oauth2/access_token`).
- `https://auth.qustodio.com` — المصادقة وSSO ونسيان كلمة المرور.
- `https://family.qustodio.com` — لوحة الويب للأهل (نفس الخلفية — الواجهة الأصلية مجرد WebView لها).
- `https://ff.qustodio.com` — غير مؤكد (على الأرجح feature flags).
- Firebase كاملة: Messaging/Auth/Firestore/Functions/RemoteConfig/Crashlytics/Perf —
  بنية خلفية serverless جاهزة للاقتباس.
- Braze (تسويق/دفع) + Adjust (نسب التثبيت) — مكدس النمو.

## 7. توصيات إعادة الاستخدام
1. **يُنسخ مباشرة:** `QustodioPlugin` (الجسر + الروابط العميقة المؤجلة) و`QustodioPushNotificationService`
   (توجيه Braze/FCM) — حلول مكتملة ومختبرة.
2. **يُقتبس كنموذج بيانات:** هيكل "القواعد" حسب النوع (تطبيقات/مكالمات/موقع/يوتيوب/زر ذعر/ترشيح ويب) —
   أساس ممتاز لوحدة الحماية في Family OS.
3. **يُدرس:** نموذج الـ freemium (مسارات `premiumFlyover` لكل قاعدة) — يطابق خطط Premium/Family Pro المطلوبة.
4. **لا يُطلب من هذا الـ APK:** أي شيء يخص ترشيح الويب أو حظر التطبيقات على جهاز الطفل —
   يلزم الحصول على APK تطبيق الطفل المنفصل وتحليله.
5. **قرار معماري مقترح:** لوحة الأهل في Family OS يمكن أن تكون هجينة (WebView + جسر أصلي)
   على هذا النمط — تطوير أسرع للتقارير والرسوم البيانية.

## 8. ملاحظات (التشويش، حدود التحليل)
- حزمة JS مضغوطة (minified) — الميزات مستخرجة من مسارات الـ router والسلاسل فقط؛ المنطق التفصيلي لم يُحلل.
- الكود الأصلي غير مشوّش لكنه سطحي (5 ملفات) — القيمة في طبقة الويب والأنماط.
- ملفات `.so` (crashlytics فقط) لا تحمل منطقًا تطبيقيًا — لم تُحلل.
- عناوين `api.qustodio.com` الدقيقة للعمليات (CRUD القواعد) غير مرصودة — الحزمة لا تكشفها statically.
