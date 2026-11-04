# التقرير الهيكلي لتشريح الحزمة والمكونات — Life360 (T1 Structural Analysis)

> **المعرف:** `T1-L3-STRUCTURAL-001`
> **التطبيق:** Life360 (`life360`)
> **الحزمة المفحوصة:** `com.life360.android.safetymapd`
> **الإصدار المستخرج:** `26.41.0`
> **بيئة التشغيل:** Android (FOREGROUND_SERVICE_LOCATION + ACTIVITY_RECOGNITION + HIGH_SAMPLING_RATE_SENSORS)
> **المعمارية التقنية:** تطبيق أصلي (Native Kotlin/Java) — منظومة سلامة أحادية التطبيق

---

## 1. الملخص التنفيذي للهيكلية

Life360 تطبيق سلامة عائلي **أحادي** (عضو واحد = فرد عائلة؛ لا تطبيق طفل منفصل): كل فرد يثبت التطبيق نفسه،
وتُبنى "الدائرة" (Circle) خادمياً من الأعضاء. التشريح أثبت 4 ركائز:

1. **خط الموقع الخلفي:** خدمة أمامية `EventController` (نوع `location`، عملية `:service`) + كاشف حركة بلا GPS
   + مستقبلا نبضة/حالة + طابور Room غير متصل + رفع MQTT/REST.
2. **آلة الحوادث:** `AutomaticCollisionResponseService` (JobService) + 3 عمال WorkManager (إشعار/تصعيد/شبكة)
   + متحكم UI — كلها بأوسمة وتبقى حية عبر موت العملية.
3. **طبقة الاستشعار:** تجريد `sensorframework` (أحداث Parcelable) فوق Arity (قيادة) وSentiance (موقع/حوادث).
4. **طبقة البيانات:** `model_store` (Room: موقع، جيوفنس، انتقالات نشاط، خروقات) + نموذج العضو/الدائرة.

---

## 2. جدول المكونات (مقاس من AndroidManifest.xml)

| نوع المكون | العدد (مقاس) | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|:---:|---|---|
| **الأنشطة (Activities)** | **41** | `com.life360.koko.root.RootActivity` (الجذر) | بوابة التطبيق؛ أنشطة الإعداد والخريطة والطوارئ. |
| **الخدمات (Services)** | **33** | `EventController` (location, `:service`)؛ `DriverBehaviorService` (location)؛ `NearbyDevicesFgService` (mediaPlayback\|location\|connectedDevice, `:service`)؛ `BluetoothDeviceSosBackgroundService` (location)؛ `CoreEngineForegroundService` (Arity)؛ Sentiance `ForegroundService`؛ `L360FirebaseMessagingService` | أربع خدمات موقع أمامية + دفع FCM + Tile. |
| **مستقبلات البث (Receivers)** | **82** | `HeartbeatReceiver`، `MovementDetectionReceiver`، `MovementStatusReceiver`، `ProximityGeofenceReceiver`، `TripGeofenceReceiver`، `ZoneCoordinatorReceiver`، `CollisionResponseReceiver`، `WatchOverMeNotificationDismissReceiver` | نبضة الموقع، كشف الحركة، الجيوفنس الثلاثي، الحوادث، SOS. (العدد يشمل مستقبلات SDKs.) |
| **مزودات المحتوى (Providers)** | **12** | `FileProvider`، `FirebaseInitProvider`… | مشاركة الملفات وتهيئة Firebase. |
| **الأذونات** | **50** | موقع دقيق/خلفي (`ACCESS_FINE/COARSE/BACKGROUND_LOCATION` + `FOREGROUND_SERVICE_LOCATION`)، `ACTIVITY_RECOGNITION`، `HIGH_SAMPLING_RATE_SENSORS`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `SCHEDULE_EXACT_ALARM`، `WAKE_LOCK`، `RECEIVE_BOOT_COMPLETED`، `READ_CONTACTS`، `CALL_PHONE`، `BLUETOOTH_*`، `RECORD_AUDIO`، `CAMERA`، `POST_NOTIFICATIONS`، `ACCESS_NOTIFICATION_POLICY`، `DETECT_SCREEN_CAPTURE` | حزمة البقاء حياً الكاملة + الاستشعار + الطوارئ. |

**ملاحظات على الأذونات** [VERIFIED]:
- `RECORD_AUDIO` و`READ_USER_DICTIONARY` و`CAMERA` معلنة بلا مبرر وظيفي ظاهر في الكود المفحوص — تُراجع قبل النسخ (سياسة Play).
- إذن مخصص: `com.life360.android.safetymapd.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`.

---

## 3. حصر الواجهات البرمجية (API Surface)

- **المضيفون** (`PlatformEnvironments.java` + `ApplicationBaseUrlsKt.java`) [VERIFIED]:
  `api-cloudfront.life360.com` (REST الرئيسي)، `auth.life360.com` (JWT)، `location.life360.com` (رفع الموقع)،
  `tracking.life360.com`، `profile.life360.com`، `gpi1..gpi6.life360.com` (أحداث)، `alert.life360.com`، `share.life360.com`.
- **حزمة الشبكة** (`l360networkkit`): OkHttp + معترضات (`GpiAuthorizationInterceptor`، `UnauthorizedInterceptor`)،
  ضغط الأجسام (`CompressRequestBody`)، تسخين الاتصالات، قياس الأداء [VERIFIED].
- **الموقع اللحظي:** MQTT 5 عبر HiveMQ (`Mqtt5HiveClientKt`، `RealtimeMqttProvider.addSubscription/removeSubscription`) [VERIFIED].
- **رفع الاصطدام:** POST غير متزامن عبر `ex6.a(..., px6.COLLISION, ...)` بردّ `rt2` — الـ endpoint يُحلّ ديناميكياً [PARTIAL].
- **الدفع:** FCM عبر `L360FirebaseMessagingService` [VERIFIED].
- **UX الصلاحيات:** روابط `https://i.lf360.co/` (LocationPermission، BackgroundUsage، BatteryOptimization…) [VERIFIED].

---

## 4. مكونات كشف الحوادث (T1 فرعي)

| المكون | الملف | الدور |
|---|---|---|
| `CollisionResponseWorkerUtils$WORK_STATE` | `smali_classes6/.../workers/` | enum الحالات الثلاث (`alert`/`cooling_period`/`survey`) |
| `CollisionResponseWorkerData` | `jadx-out/.../workers/` | حمولة الحالة (Gson JSON بين العمال) |
| `CollisionResponseWorkerUtils` | `smali_classes6/.../workers/` | `startWorker`/`compileNextWork`/`scheduleSurveyNotification`/الإلغاءات |
| `CollisionResponseNotificationWorker` | `smali_classes2/.../workers/` | العرض حسب الحالة + `scheduleNextNotification` (الانتقالات) |
| `CollisionResponseEscalationWorker` | `smali_classes2/.../workers/` | قياس التصعيد (metrics فقط) |
| `CollisionResponseNetworkWorker` | `smali_classes2/.../workers/` | عامل الشبكة (مرجَع WORK_STATE) |
| `CollisionResponseFactory` | `smali_classes2/.../workers/` | مصنع العمال |
| `AutomaticCollisionResponseService` | `smali_classes6/.../services/` | JobService: البوابات + إرسال الاصطدام |
| `ax6` ("ACR CollisionRespInteractor") | `smali_classes6/` | تفاعل المستخدم: المهلة المتبقية، scheduleSurvey |
| `sx6` | `smali_classes6/` | مسار CRASH_HELP (اتصال الطوارئ) |
| `CollisionResponseReceiver` | `smali_classes8/.../` | مستقبل أحداث الاستجابة |
| `CollisionResponseController` + `CollisionResponseCircleView` | `smali_classes6/.../ui/` | واجهة ملء الشاشة |

---

## 5. مكونات خط الموقع (T1 فرعي)

| المكون | الملف | الدور |
|---|---|---|
| `EventController` | manifest (خدمة أمامية، `:service`) | قلب الموقع الخلفي |
| `MovementDetectionReceiver` | `smali_classes5/.../receivers/` | كشف الحركة (WiFi BSSID + أبراج، 1,219 سطراً) |
| `HeartbeatReceiver` | `smali_classes5/.../receivers/` | ترامبولين النبضة (57 سطراً) |
| `MovementStatusReceiver`/`MovementStatusWorker` | `smali_classes5/` | حالة الحركة |
| `ProximityGeofenceReceiver` | `smali_classes5/.../receivers/` | جيوفنس GMS (dwell/egress) |
| `TripGeofenceReceiver` / `ZoneCoordinatorReceiver` | `smali_classes2/` | سياج الرحلات / منسق المناطق |
| `GeofenceWindowingConfigData` | `smali_classes2/.../geofencewindow/flags/` | ضبط نوافذ الجيوفنس |
| `LocationRoomModel`/`LocationDao` | `jadx-out/.../room/location/` | طابور الموقع غير المتصل (16 حقلاً) |
| `UserActivity` | `jadx-out/.../driver_behavior/` | تصنيف النشاط (8 حالات) |
| `flight_detection/models` | `smali_classes5/` | كشف الإقلاع/الهبوط (مدارج) |
