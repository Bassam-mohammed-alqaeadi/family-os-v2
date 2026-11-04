# التقرير الهيكلي لتشريح الحزمتين والمكونات — FamiSafe (T1 Structural Analysis)

> **المعرف:** `T1-FS-STRUCTURAL-001`
> **التطبيق:** Wondershare FamiSafe (`famisafe`)
> **الحزمتان المفحوصتان:** `com.wondershare.famisafe` (الأب) + `com.wondershare.famisafe.kids` (الطفل / Fammy)
> **الإصدار المستخرج:** `9.1.7.1023` (Build `10786`) — نفس الإصدار للحزمتين
> **بيئة التشغيل:** Android minSdk 21 (Lollipop 5.0)
> **المعمارية التقنية:** تطبيقان أصليان (Native Kotlin/Java) — منظومة ثنائية التطبيق

---

## 1. الملخص التنفيذي للهيكلية وتحديد طوبولوجيا المنظومة (Dual-App Discovery)

أثبت الفحص الشامل لملفي `AndroidManifest.xml` والكود المفكك عبر JADX أن FamiSafe **ليست** تطبيق والدين مستقلاً (PASA) — بل **منظومة ثنائية التطبيق (Dual-App Ecosystem)**:

### ركائز الهيكلية الأساسية:
1. **طبيعة المنظومة:** تطبيقان منفصلان بإصدار موحد:
   - **تطبيق الأب** (`com.wondershare.famisafe`): وحدة تحكم — تحرير القواعد، التقارير، الفوترة، الإقران.
   - **تطبيق الطفل** (`com.wondershare.famisafe.kids`): وكيل الإنفاذ — الحظر، التصفية، المراقبة، الموقع.
2. **الفصل التام للقنوات:** **لا يوجد أي اتصال مباشر أب←طفل** (لا سوكيت، لا IPC شبكي) — كل شيء عبر السحابة وسيطاً (`data-api.famisafe.com`).
3. **توزيع الصلاحيات الحساسة:**
   - الأب: **صفر** `DeviceAdminReceiver`، **صفر** `AccessibilityService`، **صفر** `VpnService` — ولا SMS/جهات اتصال/سجل مكالمات/مايكروفون.
   - الطفل: يحمل كل الإنفاذ — `DeviceAdminReceiver` + `AccessibilityService` + `PACKAGE_USAGE_STATS` + `SYSTEM_ALERT_WINDOW` + `QUERY_ALL_PACKAGES` + `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
4. **أول جرد لتطبيق طفل على الإطلاق:** هذا أول تحليل موثق لتطبيق طفل ضمن برنامج الجرد (كويستوديو وBark في الفرع القديم كانا أباً فقط).

---

## 2. جدول مكونات تطبيق الأب (Parent Components Breakdown)

| نوع المكون | العدد | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|:---:|---|---|
| **الأنشطة (Activities)** | **129** | `CheckRoleSplashActivity` (البوابة المصدَّرة)، `PairCodeActivity` | 129 نشاطاً كلها تقريباً `exported=false`؛ البوابة تفحص الدور قبل الدخول. |
| **الخدمات (Services)** | **21** | `parent.ParentNotifyService` (مصدَّرة، `specialUse`) | إشعار أمامي دائم لإبقاء قناة الرقابة حية — نمط إبقاء حي. |
| **مستقبلات البث (Receivers)** | **14** | `parent.reconnect.NetworkReconnectReceiver` (مصدَّر)، `JobBootReceiver` | إعادة الاتصال عند تغير الشبكة/الإقلاع. |
| **مزودات المحتوى (Providers)** | **8** | `FileProvider`، `WhatsAppSlotSyncProvider`، `FirebaseInitProvider` | مشاركة الملفات وتهيئة Firebase التلقائية. |
| **الأذونات** | **37** | موقع دقيق/خلفي، تقويم، كاميرا، بلوتوث، فوترة، منبه دقيق | بلا أي صلاحية تجسسية — كلها في تطبيق الطفل. |

**علامات حمراء في manifest الأب** [VERIFIED]:
- `usesCleartextTraffic="true"`.
- مفتاح Google Maps مسرّب نصاً في الـ manifest — مرفوض إعادة استخدامه.

---

## 3. جدول مكونات تطبيق الطفل (Child Components Breakdown)

| نوع المكون | العدد | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|:---:|---|---|
| **خدمة الوصول (AccessibilityService)** | **1** | `child.accessibility.SCAccessibilityService` (مصدَّرة) | المدخل الموزِّع الوحيد — 180 سطراً، يمرر الأحداث لـ `AccessibilityManager` عندما دور المستخدم = 4 (طفل). الإعداد: `typeAllMask` + `feedbackAllMask`، `canTakeScreenshot=true`. |
| **مدير الجهاز (DeviceAdmin)** | **1** | `child.ui.permission.DeviceAdmin` (مصدَّرة) | **شبه فارغ** — السياسة الوحيدة `force-lock`؛ يُستخدم لـ `lockNow()` فقط. |
| **الخدمات الأمامية** | **متعددة** | `kids.MainService` (`persistent=true`)، `WatchDogService` + `WatchDogNotificationService` في عملية `:watch` | إبقاء حي ثنائي العمليات + عفريت متبادل (`DaemonProcess`). |
| **مراقب الإشعارات** | **1** | `kids.notify.MyNotificationMonitorService` | نوع أمامي `location\|microphone`. |
| **واجهات الحظر** | **5** | `InterceptionAppActivity`، `UninstallActivity`، `HintUninstallActivity`، `YoutubeInterceptActivity`، `BlockCallActivity` | شاشات الطبقة فوق التطبيقات المحظورة وحوارات التحذير. |
| **المستقبلات** | **متعددة** | `myReceiver` (BOOT/CONNECTIVITY/WIFI/SHUTDOWN)، `WakeUpReceiver`، منبهات `com.famisafe.alarm.*` | الإيقاظ الدوري والبقاء حياً. |
| **الأذونات اللافتة** | — | `QUERY_ALL_PACKAGES`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `SYSTEM_ALERT_WINDOW`، `PACKAGE_USAGE_STATS`، `REQUEST_DELETE_PACKAGES`، `WRITE_SECURE_SETTINGS` (معلنة طموحة)، موقع خلفي، `RECORD_AUDIO`، كاميرا | حزمة الإنفاذ الكاملة — بلا `VpnService` (خلاف Qustodio Kids). |

---

## 4. حصر الواجهات البرمجية (API Surface)

- **تطبيق الأب:** 175 دالة في `FamiParentService` (smali) — كتابة القواعد (`POST v4/app-block/save`)، القراءة (`GET v5/notification/list-get`)، الإقران (`GET v4/match-code/get`)، الدفع العاجل (`GET v1/devices/new-push`).
- **تطبيق الطفل:** `FamiChildService` / `ChildAPIService` — سحب القواعد (`GET v4/gather/controls-init`)، حكم الويب (`GET v1/gather/web-filter-check`)، رفع الموقع (`POST v1/gather/gps`)، رفع المحتوى المشبوه، رمز WebSocket (`GET v5/member/ws-token`).
- **المضيفون:** `data-api.famisafe.com` (قابل للتجاوز عبر `ApiUrl.update()`)، `app-api-pro.famisafe.com`، مضيف تجريبي مكتوب صراحة.
- **التوقيع:** `vc` = MD5(`APP_KEY` + معاملات مرتبة + `APP_FP`) — المفتاحان مكتوبان صراحة في `ApiConstant.java` (مرفوض أمنياً).
