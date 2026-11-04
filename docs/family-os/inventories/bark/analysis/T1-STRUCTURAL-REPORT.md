# التقرير الهيكلي لتشريح الحزمتين والمكونات — Bark (T1 Structural Analysis)

> **المعرف:** `T1-BKP-STRUCTURAL-001`
> **التطبيق:** Bark Parental Controls (`bark`)
> **الحزمتان المفحوصتان:** `cm.pt.barkparent` (الأب) + `com.pt.bark` (الطفل)
> **الإصداران المستخرجان:** `6.5.1` (versionCode `600500103`) / `7.26.0`
> **المعمارية التقنية:** أب React Native (Hermes v98 + Fabric) — طفل Kotlin أصلي — منظومة ثنائية التطبيق

---

## 1. الملخص التنفيذي للهيكلية وتحديد طوبولوجيا المنظومة (Dual-App Discovery)

أثبت الفحص الشامل لملفي `AndroidManifest.xml` والكود المفكك عبر JADX أن Bark **منظومة ثنائية التطبيق (Dual-App Ecosystem)** بتقسيم تقني غير متماثل:

### ركائز الهيكلية الأساسية:
1. **طبيعة المنظومة:** تطبيقان منفصلان بتقنيتين مختلفتين:
   - **تطبيق الأب** (`cm.pt.barkparent` 6.5.1): **React Native** — نشاط واحد (`MainActivity`، المكوّن `"Bark"`)، حزمة JS واحدة (`assets/index.android.bundle`، 3.2MB، Hermes v98)، **Fabric مفعّل** (`DefaultNewArchitectureEntryPoint.getFabricEnabled()`)، حزمة Java الخاصة بالتطبيق **4 ملفات فقط** (`MainActivity`، `MainApplication`، `BuildConfig`، `R`).
   - **تطبيق الطفل** (`com.pt.bark` 7.26.0): **Kotlin أصلي** — `BarkVpnService` + `BarkAccessibilityService` + SDK تحليل خاص (`us.bark.sdk.*`) + نماذج ONNX.
2. **الفصل التام للقنوات:** **لا يوجد أي اتصال مباشر أب←طفل** — كل شيء عبر السحابة وسيطاً (`www.bark.us`).
3. **توزيع الصلاحيات الحساسة:**
   - الأب: **صفر** `DeviceAdminReceiver`، **صفر** `AccessibilityService`، **صفر** `VpnService` — ولا SMS/جهات اتصال/سجل مكالمات/مايك/كاميرا [VERIFIED].
   - الطفل: يحمل كل الإنفاذ — `VpnService` + `AccessibilityService` + مستقبلات أوامر + ONNX Runtime.
4. **التمييز عن FamiSafe:** المراقبة عند Bark **على الجهاز** (نماذج ONNX بأوزانها) لا خادمية.

---

## 2. جدول مكونات تطبيق الأب (Parent Components Breakdown)

| نوع المكون | العدد | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|---|:---:|---|
| **الأنشطة (Activities)** | **14** | `cm.pt.barkparent.MainActivity` (الوحيد للتطبيق) | البقية لمكتبات: Facebook SDK (4)، Google Play Billing (2)، OneSignal، GoogleApi؛ `MainActivity extends ReactActivity`. |
| **الخدمات (Services)** | — | androidx.work (`SystemAlarmService`/`SystemJobService`)، OneSignal (`SyncJobService`)، Firebase، Iterable | لا خدمات إنفاذ — مهام مجدولة وإشعارات فقط. |
| **مستقبلات البث (Receivers)** | — | OneSignal (`BootUpReceiver`، `FCMBroadcastReceiver`، `NotificationDismissReceiver`)، `ProfileInstallReceiver` | الإشعارات الفورية للتنبيهات. |
| **الصلاحيات الوظيفية** | **15** | موقع دقيق/تقريبي، `POST_NOTIFICATIONS`، بصمة، فوترة، إقلاع، `WAKE_LOCK`، AdServices | + حزمة صلاحيات **شارات اللانشر** (badge) متعددة الشركات. بلا أي صلاحية تجسسية. |
| **الروابط العميقة** | **~140** | `*.bark.us` + `www.bark.us/<pathPrefix>` | **خريطة محتوى إرشادي** (`/cyberbullying`، `/depression`، `/suicidal_thoughts`، `/predators`، `/sexting`، `/talk-to-kids`...) — طبقة "توصيات الخبراء". |

**ملاحظات في manifest الأب** [VERIFIED]:
- `WEB_AGENT = "(Bark Connect)"` — لاحقة User-Agent (ربط حسابات الأطفال عبر WebView على الأرجح).
- `FLAVOR = "bark"`، `IS_HERMES_ENABLED = true`، `IS_NEW_ARCHITECTURE_ENABLED = true`.
- مفاتيح `google_api_key` / `google_crash_reporting_api_key` مكتوبة صراحة في `strings.xml` — **مسرّبة، لا تُعاد**.
- OneSignal IDs مكتوبة صراحة: Android `9092a37d-6d89-4291-96d7-6e0f0469be0e`، iOS `38a90dc5-c67d-4d5c-8c99-1016df26dd7b`.

---

## 3. جدول مكونات تطبيق الطفل (Child Components Breakdown)

| نوع المكون | العدد | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|---|:---:|---|
| **خدمة VPN** | **1** | `com.pt.bark.vpn.BarkVpnService extends VpnService` (+ `TunnelVpn`، `DevicesRepository`) | تصفية الويب عبر النفق — الركيزة الأولى للإنفاذ. |
| **خدمة الوصول** | **1** | `com.pt.bark.services.accessibility.BarkAccessibilityService` | مراقبة التطبيقات/النوافذ — الركيزة الثانية. |
| **مدير الجهاز (DeviceAdmin)** | **0** | — | **غائب تماماً** [VERIFIED بالبحث] — مضاد إلغاء التثبيت عبر **رمز الجهاز الأبوي** لا الإدارة. |
| **محرك الذكاء** | **1** | `us.bark.sdk.analysis.*` (~2,100 سطر) + `libonnxruntime.so` | تصنيف نصوص/صور على الجهاز (الأول في البرنامج). |
| **مستقبلات الأوامر** | **~12** | `EnableScamDetectionReceiver`، `ExplicitMediaMonitoringReceiver`، `ContactApprovalPolicyReceiver`، `AllowBrowsingReceiver`، `EmergencyCallReceiver`... | **معلنة `exported=true`** — ثغرة أمنية موثقة. |
| **مستقبلات النظام** | — | `FallReceiver` (كشف السقوط)، `AppUpdateReceiver`، `RebootReceiver`، `DetectNetwork`، `BarkPhoneLocationReceiver` | أحداث النظام والصحة. |
| **النماذج** | **3+4** | `res/raw/*.ort` (×2)، `*.onnx` (×1)، `tokenizer.json`، `tfidf_config.json` | أوزان النماذج وإعداداتها. |

---

## 4. حصر الواجهات البرمجية (API Surface)

- **تطبيق الأب:** GraphQL باستعلامات محفوظة (persisted queries + SHA256) — الرابط وقائمة العمليات **غير مستخرجة** (تشفير/minify)؛ القنوات المؤكدة: OneSignal (دفع)، Iterable (تسويق)، Sentry مزدوج.
- **تطبيق الطفل:** 16 نقطة في `BarkApi` (Retrofit) — الدخول (`POST login`)، الإقران (`POST children/{id}/connections/android`)، الرفع (`POST connections/{id}/activities|events|logs|inventories`)، المواقع، الـ check-ins؛ + `BarkDataApi` (`POST locations` على `data.bark.us`) + `ScreenTimeApi` (`POST devices/event{,Batch}` على `screentime.bark.us`).
- **المضيفون:** `https://www.bark.us/api/v2/`، `https://data.bark.us/`، `https://screentime.bark.us/`.
- **المصادقة:** `Authorization: Token token=<token>`؛ المهلات 60 ثانية.
