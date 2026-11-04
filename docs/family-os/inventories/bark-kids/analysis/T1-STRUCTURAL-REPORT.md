# التقرير الهيكلي لتشريح الحزمة والمكونات — Bark Kids (T1 Structural Analysis)

> **المعرف:** `T1-BKK-STRUCTURAL-001`
> **التطبيق:** Bark Kids (`bark-kids`)
> **الحزمة المفحوصة:** `com.pt.bark`
> **الإصدار المستخرج:** `7.26.0` (versionCode `911`) — من `apktool.yml`
> **بيئة التشغيل:** Android compileSdk 35 — Kotlin أصلي (minSdk غير مستخرج رقمياً)
> **المعمارية التقنية:** وكيل إنفاذ أحادي الـ APK — Accessibility + VPN (بلا DeviceAdmin)

---

## 1. الملخص التنفيذي للهيكلية وتحديد طوبولوجيا المنظومة

أثبت الفحص الشامل لـ `AndroidManifest.xml` والكود المفكك عبر JADX أن Bark Kids **وكيل طفل أحادي**:

### ركائز الهيكلية الأساسية:
1. **طبيعة المنظومة:** APK واحد (`com.pt.bark`) — كل المراقبة والإنفاذ والتحليل على جهاز الطفل؛ تطبيق الأهل (`cm.pt.barkparent`) منفصل تماماً (React Native، لوحة فقط)؛ تطبيقان رفيقان: `us.bark.guarddog` (الإعداد + نموذج النصوص) و`us.bark.messages` (الرسائل).
2. **الإنفاذ المزدوج بلا DeviceAdmin:** `BarkAccessibilityService` (مضاد العبث + كشط المحتوى) + `BarkVpnService` (تصفية الشبكة بالنفق الأصلي) — **صفر `DeviceAdminReceiver`** [VERIFIED بالبحث].
3. **الذكاء على الجهاز:** `libonnxruntime.so` (~25.8MB/arm64) + 3 نماذج في `res/raw` (صور/نصوص/OTP) — التطبيق الوحيد في البرنامج بهذه الخاصية.
4. **لا قناة مباشرة أب↔طفل:** كل شيء عبر `www.bark.us/api/v2` + `data.bark.us` + `screentime.bark.us`.

---

## 2. جدول مكونات التطبيق (Components Breakdown)

| نوع المكون | العدد | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|---|:---:|---|
| **الأنشطة (Activities)** | **19** | `LauncherActivity` (البوابة المصدَّرة + `barkchild://`)، `DeviceCodeActivity` (مصدَّرة + `barkuninstall://uninstall`)، `VpnReconnectActivity`، `ScreenShotActivity`، `SettingDisabledActivity` (مصدَّرة) | بوابة الإطلاق، بوابة رمز إلغاء التثبيت، إعادة موافقة VPN، شاشات التحذير |
| **الخدمات (Services)** | **16** | `BarkAccessibilityService` (مصدَّرة)، `BarkVpnService` (مصدَّرة، `SUPPORTS_ALWAYS_ON`)، `BarkLocationService`، `ScreenShotService` (`mediaProjection`) | الإنفاذ المزدوج + الموقع + لقطات الشاشة (+ خدمات OneSignal/Firebase/WorkManager) |
| **مستقبلات البث (Receivers)** | **29** | `RebootReceiver` (مصدَّر، `directBootAware`)، `GeofenceReceiver`، `EnableScamDetectionReceiver`، `ContactApprovalPolicyReceiver` (محمي بتوقيع) | الإقلاع، تفعيل الميزات، سياسة جهات الاتصال (+ OneSignal/FCM) |
| **مزودات المحتوى (Providers)** | **6** | `FileProvider`، Sentry، Firebase، androidx-startup | مشاركة الملفات وتهيئة الـ SDKs |
| **الأذونات** | **52** | SMS/MMS، جهات الاتصال، سجل المتصفح، موقع خلفي، `QUERY_ALL_PACKAGES`، `MANAGE_EXTERNAL_STORAGE`، `INVALIDATE_SCAMS` | حزمة المراقبة الكاملة — بلا `DeviceAdmin` |

**علامات حمراء في الـ manifest** [VERIFIED]:
- مفتاح Google Maps مكتوب صراحة (`AIzaSyC28kiet81WYwYOuF6RQu80-PFlPyVU878`) — مرفوض إعادة استخدامه.
- Sentry DSN مكتوب صراحة (`https://95aa82c111714bf0b18ad5048c7ce0f6@sentry.bark.us/19`) — مرفوض.
- `requestLegacyExternalStorage="true"` + `allowBackup="true"` — مرفوض (سياسة Play).

---

## 3. المكتبات الأصلية والنماذج (Native + Models)

| الأصل | arm64-v8a | الدور |
|---|---|---|
| `libonnxruntime.so` | 27,072,384 بايت | محرك الاستدلال العصبي |
| `libonnxruntime4j_jni.so` | 111,648 بايت | جسر JNI لـ `ai.onnxruntime.*` |
| `librltun.so` | 4,246,712 بايت | نفق VPN الأصلي (RLTUN::APIClient) |
| `libc++_shared.so` / `libjnidispatch.so` / `libsentry*.so` | — | دعم |

**النماذج** (`apktool-out/res/raw/`): `adultmediamobile_31_1724800699_fp32.ort` (16.1MB — صور)،
`mobilemodel_1_1753905899.ort` (16.8MB — نصوص)، `mfaondevice_1_1234567890.onnx` (49KB — OTP) +
`tokenizer.json` + `tokenizer_config.json` + `special_tokens_map.json` + `tfidf_config.json`.
**بلا آلية تحديث** — النماذج مضمّنة فقط، التحديث بإصدار تطبيق جديد [VERIFIED بالبحث].

---

## 4. حصر الواجهات البرمجية (API Surface)

- **`BarkApi`** (`https://www.bark.us/api/v2/` — 13 نقطة): `login`، `password` (تحقق الرمز)، `versions`، `children` (CRUD)، `children/{id}/connections/android` (الإقران)، `children/{id}/devices` (مفتاح النفق)، `connections/{id}/activities|inventories|logs|events` (الرفع)، `children/{id}/checkins|locations`، `places/{id}/events`.
- **`BarkDataApi`** (`https://data.bark.us/`): `POST locations`.
- **`ScreenTimeApi` + `librltun.so`** (`https://screentime.bark.us/`): `POST devices/event` / `devices/eventBatch` + `/api/devices/checkDNS` + `/api/devices/heartbeat`.
- **المصادقة:** `Authorization` عبر `BarkRestClient.buildAuth(token)`؛ مهلات 60 ثانية؛ Retrofit + RxJava + Gson.
- **الدفع:** OneSignal فوق FCM (`NotificationServiceExtension`)؛ الأعطال Sentry (عينة 0.01).
