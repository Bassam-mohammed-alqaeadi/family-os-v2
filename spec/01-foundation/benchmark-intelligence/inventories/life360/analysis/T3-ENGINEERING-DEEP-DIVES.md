# التحليل الهندسي الجراحي T3 لتطبيق Life360 (T3 Engineering Deep Dives)
## الحزمة: BIP-04 — Life360 Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-02  
> **مستوى الفحص:** T3 — Engineering Deep Dives & Verified Evidence  
> **التطبيق المستهدف:** Life360 (Android)  
> **حزمة المانيفست المعتمدة:** `com.life360.android.safetymapd`  
> **المعرفات المرتبطة:** `L360-EVD-000001` إلى `L360-EVD-000016` (مطابقة قطعية لـ `evidence.json`)

---

## 1. سجل الأدلة المادية الـ 16 (مطابق 100% لـ `evidence.json`)

| معرف الدليل | المعرف المرتبط | وسام الإثبات | المصدر الفيزيائي المسند | محدد الأسطر الدقيق | الادعاء والحقيقة المادية المثبتة |
|---|---|---|---|---|---|
| `L360-EVD-000001` | `L360-RES-000016` | `REF` (Level A) | `AndroidManifest.xml` | `#L1-L55` | هوية الحزمة `com.life360.android.safetymapd`، وإصدارات النظام (minSdk 26، targetSdk 30، compileSdk 33)، وحصر 31 إذناً للنظام. |
| `L360-EVD-000002` | `L360-RES-000001` | `REF` (Level A) | `AndroidManifest.xml` | `#L180-L268` | عزل عملية التتبع في عملية مخصصة `:service` عبر `EventController` بالسمة `foregroundServiceType="location"`، لحماية الخدمة من انهيارات الواجهة. |
| `L360-EVD-000003` | `L360-RES-000002` | `REF` (Level A) | `EventController.java` | `#L1717-L1750` | استدعاء `onStartCommand` لتشغيل الإشعار الدائم وتفعيل دورة العينات الموجهة بالحركة عبر FusedLocationProviderClient. |
| `L360-EVD-000004` | `L360-RES-000004` | `REF` (Level A) | `LocationReceiver.java` | `#L30-L67` | استقبال إشارات دورية `ACTION_HEARTBEAT_TIMER` وإشعارات البطارية المنخفضة وإدارة إيقاظ المعالج. |
| `L360-EVD-000005` | `L360-RES-000004` | `REF` (Level A) | `LocationWorker.java` | `#L27-L58` | عمل `LocationWorker` كحارس ومراقب دوري عبر WorkManager لفحص نبضات الموقع وحالة قيود توفير الطاقة. |
| `L360-EVD-000006` | `L360-RES-000002` | `REF` (Level A) | `FusedLocationUpdateBroadcastReceiver.java` | `#L11-L38` | استقبال نتائج Fused Location عبر `LocationResult.getLastLocation()` وتمريرها لمصفوفة معالجة الحركة. |
| `L360-EVD-000007` | `L360-RES-000005` | `REF` (Level A) | `GeofenceData.java` | `#L48-L88` | هيكل بيانات السياج الجغرافي Parcelable الذي يحدد معرف الدائرة والإحداثيات ونصف القطر وزمن الانتهاء ونمط الانتقال. |
| `L360-EVD-000008` | `L360-RES-000007` | `REF` (Level A) | `AccelerometerEventData.java` | `#L1-L31` | نمذجة قراءات مستشعر التسارع ثلاثي المحاور لدعم حسابات شدة الحركة والفرملة والتصادم. |
| `L360-EVD-000009` | `L360-RES-000011` | `REF` (Level A) | `PSOSAlertRequest.java` | `#L11-L45` | نمذجة طلب استغاثة SOS بحدثي `START_ALERT` و `CANCEL_ALERT` مع فرض التحقق من معامل `pin_code`. |
| `L360-EVD-000010` | `L360-RES-000012` | `REF` (Level A) | `TileAdvertisementApi.java` | `#L16-L30` | إعلان واجهة Retrofit لرفع حزم إعلانات بلوتوث أجهزة Tile عبر `@POST("/api/v1/clients/{client_uuid}/batch_location_updates")`. |
| `L360-EVD-000011` | `L360-RES-000015` | `REF` (Level B) | `local_db_schema.sql` | `#L9-L75` | مخطط قاعدة البيانات العلائقية المحلية المكون من 10 جداول للدوائر والأعضاء والأماكن وسجلات الرحلات. |
| `L360-EVD-000012` | `L360-RES-000014` | `REF` (Level A) | `api_endpoints_catalog.md` | `#L1-L50` | حصر 182 إعلاناً لدوال Retrofit (182 method declarations) تمثل 155 مساراً فريداً عبر 19 ملف واجهة في الكود المفكك. |
| `L360-EVD-000013` | `L360-RES-000010` | `REF` (Level A) | `native_so_analysis.md` | `#L10-L27` | توثيق وجود مكتبة `librealm-jni.so` وحزم `io.realm` في البنية الثنائية دون رصد استدعاءات في حزم `com.life360` الرئيسية. |
| `L360-EVD-000014` | `L360-RES-000013` | `REF` (Level B) | `realtime_location_streaming_protocol.md` | `#L1-L35` | وثيقة معمارية مشتقة توضح تصميم خط البث اللحظي عبر WebSockets وقنوات الدوائر العائلية. |
| `L360-EVD-000015` | `L360-RES-000003` | `REF` (Level B) | `adaptive_location_and_battery_engine.kt` | `#L1-L60` | نموذج نظيف مشتق لـ Family OS يحدد آلة حالات النشاط الحركي وفلترة كالمان لنقاط GPS. |
| `L360-EVD-000016` | `L360-RES-000008` | `PARTIAL-EVIDENCE` (Level C) | `AndroidManifest.xml` | `#L446-L460` | إثبات تفويض كشف التصادم الشديد وقياسات القيادة لمكتبة Arity SDK (`com.arity.coreEngine.driving.DrivingEngineService`). |

---

## 2. توثيق كتالوج واجهات برمجة التطبيقات (API Method Declarations vs Unique Endpoints)

### 2.1. ضبط توصيف رقم الـ 182 مقابل الـ 155:
- **182 إعلاناً لدوال Retrofit (`182 Retrofit method declarations`):** هو العدد الفعلي لجميع تعريفات الدوال المشروحة بالوسوم (`@GET`, `@POST`, `@PUT`, `@DELETE`) المعرفة داخل **19 ملف واجهة برمجية** في كود Java المفكك عبر JADX تحت `com.life360.android.*`.
- **155 نقطة نهاية فريدة (`155 unique HTTP endpoints`):** هو الناتج الدقيق بعد إزالة التكرارات الناتجة عن تكرار استهداف نفس المسار بـ HTTP Method و Path متطابقين عبر دوال متعددة (Overloaded Methods) تختلف في معاملات الترويسة أو أنواع الكائنات المعادة.
- الجدول الكامل موثق ومطابق في:
  `benchmarks/extracted/life360/06_network_and_telemetry/api_endpoints_catalog.md`

### 2.2. عينة ممثلة لأبرز نقاط النهاية ومصادرها المباشرة:
1. **رفع وتحديث المواقع المجمعة:**
   - المسار: `POST /api/v1/clients/{client_uuid}/batch_location_updates`
   - المصدر: `com/life360/android/awarenessengine/network/TileAdvertisementApi.java` (#L26-L28)
2. **سجلات القيادة والتلمتري:**
   - المسار: `POST /v3/driverbehavior/events`
   - المصدر: `com/life360/android/driving/network/DriverBehaviorApi.java` (#L23-L24)
3. **توكن رصد القيادة:**
   - المسار: `GET /v4/driverbehavior/token`
   - المصدر: `com/life360/android/driving/network/DriverBehaviorApi.java` (#L17-L18)
4. **رفع تقارير المواقع والخلفية:**
   - المسار: `POST v3/locations/uploadLog`
   - المصدر: `com/life360/android/Core360Api.java` (#L1-L25)

### 2.3. قنوات البث اللحظي (PubNub Real-Time Channels):
- **قناة تحديث المواقع:** `circle_{circleId}_locations` (مستندة للنموذج المشتق Level B في `realtime_location_streaming_protocol.md` #L18-L25 لتوزيع الدلتا الحركية بزمن وصول منخفض).
- **قناة تنبيهات السياج الجغرافي:** `circle_{circleId}_alerts` (لبث إشعارات الوصول والمغادرة الفورية بين أفراد الأسرة).

### 2.4. إشارات الدفع اللحظية (FCM Signals):
- **المستقبل المصرح:** `com.google.firebase.iid.FirebaseInstanceIdReceiver` في `AndroidManifest.xml#L366-L370`.
- **أذونات الاستقبال:** `com.google.android.c2dm.permission.RECEIVE` في `AndroidManifest.xml#L74`.
- **المعالجة البرمجية:** اعتراض نداءات الإيقاظ الصامتة وتنشيط `LocationReceiver.java` (#L30-L67).

### 2.5. موفرو المحتوى والتكامل الداخلي (Content Providers):
- `L360ServiceAppInitProvider`: مصرح في `AndroidManifest.xml#L267` لتهيئة خدمة التتبع داخل العملية المستقلة `:service`.
- `BackgroundProcessContentProvider`: مصرح في `AndroidManifest.xml#L322` لتوفير قناة IPC آمنة ومحلية لتبادل حالات التتبع بين عملية الواجهة والعملية الخلفية `:service`.
