# تقرير الهندسة العكسية — Life360

## 1. نظرة عامة
- **الحزمة:** `com.life360.android.safetymapd`
- **الدور في Family OS:** نواة وحدة **الحماية والأمان العائلي** — تتبع الموقع اللحظي، تنبيهات الأماكن (geofencing)، كشف حوادث السيارات، سجل الرحلات، وزر الطوارئ.
- **حجم المخرجات:** ~25 ألف ملف Java في `jadx-out` (أكبر تطبيق في الدفعة)، و`apktool-out` كامل. نقطة الدخول: `com.life360.android.shared.Life360BaseApplication` والنشاط الجذري `com.life360.koko.root.RootActivity`.
- **التشويش:** R8 متوسط — حزم `com.life360` مقروءة بأسماء حقيقية، مع جيوب مشوشة (`defpackage`) و355 خطأ jadx على مستوى الكلاس (0.7% — طبيعي).

## 2. البنية المعمارية (أهم الحزم والطبقات)
- `com.life360.android.location/` — **نواة الموقع**: `controllers/` (التحكم)، `providers/`، `receivers/`، `geofencewindow/` (نوافذ الجيوفنس)، `database/`، `flight_detection/` (كشف الطيران).
- `com.life360.android.sensorframework/` — **طبقة تجريد الحساسات**: `location/`، `geofence/`، `gyroscope/`، `gravity/`، `rotation/`، `sensor_provider/`، `sensor_error/`. فصل نظيف بين مصادر الاستشعار والمنطق.
- `com.life360.koko.collision_response/` — كشف الحوادث والاستجابة (`workers/`).
- `com.life360.android.driving/` — سلوك القيادة (`DriverBehaviorService`، `DriverBehaviorReceiver`).
- `com.life360.model_store/` — **طبقة البيانات**: `member_store/`، `driver_report_store/`، `emergency_call_incidents/`، `crimes/`، `live_progress/`، و`base/localstore/room/` (قاعدة Room محلية).
- `com.life360.watchoverme/` — جلسات SOS ("راقبني").
- `com.life360.android.core/`، `com.life360.koko.push/` — الإشعارات.
- **اعتمادات خارجية ثقيلة:** Sentiance SDK (ذكاء الموقع)، Arity CoreEngine (الرحلات والقيادة)، ML Kit، Firebase، Braze، Zendesk.

## 3. الميزات الرئيسية وربطها بوحدات Family OS
| الميزة في Life360 | الدليل | وحدة Family OS |
|---|---|---|
| تتبع الموقع الخلفي الموفر للبطارية | `FOREGROUND_SERVICE_LOCATION` + `HeartbeatReceiver` + `MovementDetectionReceiver` | الحماية — موقع أفراد العائلة |
| تنبيهات الأماكن (وصول/مغادرة) | `ProximityGeofenceReceiver`، `TripGeofenceReceiver`، `ZoneCoordinatorReceiver`، `geofencewindow/` | الحماية — تنبيهات الأماكن |
| كشف حوادث السيارات | `AutomaticCollisionResponseService` + `CollisionResponseWorkerData` | الحماية — الطوارئ |
| تقارير سلوك القيادة | `DriverBehaviorService` + Arity `CoreEngineForegroundService` | الحماية — قيادة الأبناء |
| جلسات "راقبني" SOS | `watchoverme/data/*` (جلسة + وجهة + تعارض الوجهات) | الحماية — "رافقني" |
| سجل الأحداث والرحلات | `eventhistorycore/`، `eventhistorystore/`، `live_progress/` | الإدارة — سجل العائلة |
| مراقبة الاختراقات | `DarkWebBreachesRoomModel` (في Room) | الحماية — تنبيهات رقمية |

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- `com.life360.koko.collision_response.workers.CollisionResponseWorkerData` — **آلة حالة الاستجابة للحوادث**، أنظف قطعة قابلة للنقل: حقول `gracePeriodDurationInSeconds` (مهلة التراجع)، `notificationIntervalInSeconds`، `detailedConfidence` / `highConfidenceLevel` / `lowConfidenceLevel` (عتبات الثقة)، `isCollisionTruePositive`، `state` من نوع `WORK_STATE`، `alertAttempt`، `isLastWorkerSurvey`، مع `parse()`/`toString()` بتسلسل Gson. تُظهر دورة: كشف → مهلة → تنبيه متكرر → تصعيد.
- `com.life360.android.location.LocationTripMonitoringConfigData` — إعداد مراقبة الرحلات: `monitoringTripEnabled` و`tripGeofenceRadiusMeters` (الافتراضي **100 متر**) بتسلسل kotlinx.serialization.
- `com.life360.model_store.base.localstore.room.activity_transition.ActivityTransitionDao` — واجهة Room جاهزة كنموذج: `saveActivityTransitions(...)`، `deleteActivityTransitionsAfterTime(timestamp)`، `deleteActivityTransitionsSameOrBeforeStartTimeOrAfterEndTime(start, end)`، `getOldestActivityTransition()` — نمط تخزين سجل النشاط المحلي مع التنظيف الزمني.
- `com.life360.android.sensorframework` — الفكرة المعمارية نفسها (تجريد: حساس → حدث → مستهلك) قابلة لإعادة التطبيق في Family OS لتوحيد الموقع والحركة والجيوفنس.
- `com.life360.android.location.geofencewindow.flags.GeofenceWindowingEnabled` — نمط "أعلام الميزات" (feature flags) للتحكم بإطلاق الخصائص.

## 5. الصلاحيات والمكونات الحساسة
- **الموقع:** `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` + `ACCESS_BACKGROUND_LOCATION` + `FOREGROUND_SERVICE_LOCATION`.
- **الاستشعار:** `ACTIVITY_RECOGNITION`، `HIGH_SAMPLING_RATE_SENSORS` (ضروريان لكشف القيادة والحوادث).
- **البقاء حيًا:** `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `SCHEDULE_EXACT_ALARM`، `WAKE_LOCK`، `RECEIVE_BOOT_COMPLETED` — وصفة العمل الخلفي المستمر.
- **العائلة والطوارئ:** `READ_CONTACTS`، `CALL_PHONE` (دوائر العائلة والاتصال الطارئ).
- **أجهزة قريبة:** `BLUETOOTH_*` + `NearbyDevicesFgService` و`BleCommandService` (تكامل أجهزة Tile).
- **الدفع:** `L360FirebaseMessagingService` (مبني على FCM).

## 6. الشبكة ونقاط التكامل
- **روابط توجيه الصلاحيات** `https://i.lf360.co/LocationPermission` و`BackgroundUsage` و`BatteryOptimization` و`LocationOn` و`LocationSharing` و`PhysicalActivity` و`PowerSaveMode` — نمط UX ذكي: روابط عميقة تشرح كل صلاحية قبل طلبها (يُعاد استخدامه حرفيًا كفكرة).
- **Sentiance SDK** عبر `com.sentiance.sdk.services.ForegroundService` / `BackgroundService` / `SdkJobTaskService`، مع أعلام تحكم (`CrashDetectionViaSentianceEnabled`، `DeferSentianceInitColdStartKillswitch`) — التكامل اختياري وقابل للإيقاف.
- **Arity CoreEngine** عبر `CoreEngineForegroundService` و`GeofenceInitiatorService` — محرك الرحلات والقيادة الخارجي.
- **ملاحظة:** لم أعثر على واجهات Retrofit مكشوفة داخل `com.life360` — غالبًا مشوشة داخل `defpackage`؛ يحتاج فحصًا أعمق عند الحاجة.

## 7. توصيات إعادة الاستخدام
1. **آلة حالة الحوادث** (`CollisionResponseWorkerData`) — تُنقل شبه حرفية كتصميم لوحدة الطوارئ.
2. **نمط `model_store` + Room** — يُعتمد كطبقة البيانات المحلية في Family OS (كيانات + DAOs + تنظيف زمني).
3. **طبقة `sensorframework`** — تُعاد صياغتها كتجريد موحد للحساسات (موقع/حركة/جيوفنس).
4. **استراتيجية الخلفية** (تجاهل تحسين البطارية + heartbeat + movement detection) — تُدرس من `smali_classes5` حيث فشل jadx.
5. **روابط `i.lf360.co`** — تُنسخ فكرة UX طلب الصلاحيات التدريجي.
6. **تحذير:** الاعتماد على Sentiance/Arity تبعية مدفوعة لطرف ثالث — البديل المملوك: كشف الحوادث على الحساسات المحلية + `HIGH_SAMPLING_RATE_SENSORS`.

## 8. ملاحظات (التشويش، حدود التحليل)
- `EventController` (الخدمة المنسقة للموقع) و`HeartbeatReceiver` و`MovementDetectionReceiver` و`AutomaticCollisionResponseService` و`ProximityGeofenceReceiver` **لم تُفكك** — موجودة smali فقط في `apktool-out/smali_classes5/`؛ منطق الـ heartbeat الدقيق يحتاج قراءة smali.
- `DriverBehavior` (مع `CrashEvent.TAG_*`) يبدو مكتبة AAR خارجية — الكلاسات المرجعية فقط ظهرت في `PremiumFeature.java`.
- `watchoverme` لم يتبقَّ منه مقروءًا سوى استثناءات الجلسات — منطق الجلسات نفسه مشوش.
- لم أتحقق من عناوين خوادم الـ API (مشوشة) — أي تكامل شبكي يُبنى على واجهات Family OS الخاصة.
