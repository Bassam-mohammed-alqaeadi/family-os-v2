# تحليل الهندسة العكسية العميق — Life360 (السلامة والموقع العائلي)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/life360.md`) الذي غطى البنية العامة وسجّل فجوات: `EventController` و`HeartbeatReceiver`
> و`MovementDetectionReceiver` و`AutomaticCollisionResponseService` و`ProximityGeofenceReceiver` "لم تُفكَّك — smali فقط"،
> ومنطق الـ heartbeat "يحتاج قراءة smali"، وعناوين الخوادم "مشوشة".
> هذه الوثيقة **تغلق تلك الفجوات**: آلة حالة الحوادث مفككة بالكامل من الـ smali (الحالات الثلاث + الانتقالات +
> عداد المحاولات)، ومسار كشف الحركة مقروء (WiFi BSSID + أبراج خلوية بلا GPS)، ومضيفو الشبكة مستخرجون،
> وقناة الموقع اللحظي محددة (MQTT 5).
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.life360.android.safetymapd` |
| الإصدار المحلَّل | 26.41.0 |
| smali / java (مقاس) | 82,105 / 24,943 |
| كود Life360 الخاص (مقاس) | 1,691 ملف java + 11,255 ملف smali تحت `com/life360` (الباقي مكتبات: Sentiance، Arity، Firebase، Braze، Zendesk…) |
| الـ Manifest (مقاس) | 41 نشاطاً، 33 خدمة، 82 مستقبلاً، 12 مزوداً، 50 إذناً |
| التشويش | R8 متوسط — حزم `com.life360` ظاهرة بأسماء حقيقية جزئياً، منطق التحكم مشوش في `defpackage` وملفات `smali_classes5/6` مجهولة الاسم (`ax6`، `rt2`، `sx6`…) |
| الدور في Family OS | **نواة وحدة الحماية**: تتبع الموقع، الجيوفنس، كشف حوادث السيارات، SOS، نموذج الدائرة العائلية |

### البنية العليا [VERIFIED]
```
com.life360.android.location/        ← نواة الموقع (controllers, providers, receivers, geofencewindow, database, flight_detection)
com.life360.android.sensorframework/ ← تجريد الحساسات (location, geofence, gyroscope, gravity, rotation)
com.life360.koko.collision_response/ ← كشف الحوادث (workers/, services/, ui/)
com.life360.android.driver_behavior/  ← تصنيف النشاط (UserActivity) + أحداث القيادة (Arity wrapper)
com.life360.model_store/             ← طبقة البيانات (member_store, places, privacysettings, room/*)
com.life360.watchoverme/             ← جلسات SOS "راقبني"
com.life360.android.l360networkkit/  ← الشبكة (REST + MQTT5)
com.life360.android.membersengineapi/ ← نموذج العضو/الدائرة
```

---

## 2. آلة حالة الاستجابة للحوادث — مفككة بالكامل [VERIFIED]

**أثمن ما في هذا التطبيق.** الآلة مبنية على **WorkManager متعدد العمليات** (`androidx.work.multiprocess.RemoteWorkManagerClient`)
وتُدار عبر أدوات `CollisionResponseWorkerUtils` — ليست `if/else` في نشاط، بل **عمال مجدولون بأوسمة (tags)**
تبقى حية حتى لو ماتت العملية.

### 2.1 الحالات الثلاث [VERIFIED]
`apktool-out/smali_classes6/com/life360/koko/collision_response/workers/CollisionResponseWorkerUtils$WORK_STATE.smali`:
| الحالة | القيمة السلكية | الدور |
|---|---|---|
| `ALERT` | `"alert"` | تنبيه صاخب للمستخدم — "هل أنت بخير؟" مع عدّاد المهلة |
| `COOLING_PERIOD` | `"cooling_period"` | فترة صمت (المهلة) — المستخدم يستطيع الإلغاء بصمت |
| `SURVEY` | `"survey"` | استبيان لاحق (بعد 24 ساعة) — حالة نهائية |

### 2.2 حمولة الحالة [VERIFIED]
`jadx-out/sources/com/life360/koko/collision_response/workers/CollisionResponseWorkerData.java` — تُسلسل Gson (`@oxz`) وتُمرَّر
بين العمال كنص JSON في `Data{"extraData", "isMock"}`:
- `gracePeriodDurationInSeconds` — مدة المهلة (من الخادم، باحتياطي 20 ثانية)
- `notificationIntervalInSeconds` — الفاصل بين التنبيهات المتكررة (من الخادم)
- `detailedConfidence` / `highConfidenceLevel` / `lowConfidenceLevel` — عتبات الثقة (من حدث الاصطدام)
- `state: WORK_STATE` — الحالة الحالية
- `alertAttempt` — عداد المحاولات (يبدأ 0)
- `isCollisionTruePositive` — هل أكد المستخدم الحادث فعلاً
- `isLastWorkerSurvey` — علَم الاستبيان الأخير
- `startTimeInSeconds` — بداية المهلة (لاستئناف العدّاد بعد موت العملية)
- `emergencyNumber` — رقم الطوارئ المحلي (يُحلّ عبر `w3i0.b(context)` — رقم حسب الدولة [INFERENCE])
- `userId`، `userFirstName`، `sdkVersion`، `crashEventInString` (JSON الحدث الخام)
- `collisionRequest: ceg` — (ثقة، نوع الحدث، الموقع، السرعة، الوقت، tripId، eventId)
- `geofiltered` — قتل-صامت من الخادم (إن صحّ يُلغى كل شيء)
- `originNotificationVolume` / `originRingerMode` / `originNotificationFilter` — **حالة الصوت الأصلية للجهاز** (تُستعاد بعد انتهاء التنبيه — تفصيل UX دقيق) [INFERENCE من أسماء الحقول]

### 2.3 منطق الانتقالات [VERIFIED — قُرئ `CollisionResponseNotificationWorker.smali` كاملاً (891 سطراً)]
`doWork()`: يعرض الإشعار الحالي حسب الحالة ← ينسخ البيانات ← `scheduleNextNotification()`:
1. **إن بلغ `alertAttempt >= 4` → توقف.** السجل الحرفي: `"Not scheduling next notification max retry limit reached=4"`.
2. `ALERT` → الحالة التالية `COOLING_PERIOD`، `alertAttempt++`، جدولة `CollisionResponseNotificationWorker` بوسم `"cooling_period"` وتأخير `gracePeriodDurationInSeconds` (بالثواني)، سياسة `REPLACE`.
3. `COOLING_PERIOD` → الحالة التالية `ALERT`، `alertAttempt++`، جدولة بوسم `"alert"` وتأخير `notificationIntervalInSeconds`.
4. `SURVEY` → **نهائية**: السجل الحرفي `"Don't schedule the next notification due to invalid state"` — لا عمل تالٍ.

**العدّ الفعلي للعروض:** ALERT(0) → CP(1) → ALERT(2) → CP(3) → ALERT(4) → توقف. أي **5 عروض إشعار كحد أقصى** بالتناوب تنبيه/مهلة [VERIFIED بالمحاكاة الذهنية للكود].

### 2.4 العرض حسب الحالة [VERIFIED]
`displayCurrentNotification()` — `switch` على الحالة:
- `ALERT`: إشعار رقم **6000** (`0x1770`)، قناة `COLLISION_RESPONSE_SILENT_ALERT` (أندرويد 7.1+) وإلا `WITH_SOUND_ALERT`؛ ثم metric `"collision-show-notification"`.
- `COOLING_PERIOD`: إشعار رقم **6001** (`0x1771`)، قناة `WITHOUT_SOUND_ALERT` (صامت — لا يوقظ المستخدم أثناء المهلة).
- `SURVEY`: قناة `WITHOUT_SOUND_ALERT` عبر باني مختلف (`hx6.d`).

### 2.5 أدوات الجدولة [VERIFIED — `CollisionResponseWorkerUtils.smali` كاملاً]
- `startWorker(context, data, tag, unit, workerClass, interval, isMock)`: يبني `OneTimeWorkRequest` بتأخير أولي (`setInitialDelay`) و`Data{extraData: JSON, isMock}` ويُدخله عبر `RemoteWorkManagerClient` — **WorkManager متعدد العمليات** (يعمل من عملية `:service`).
- `scheduleSurveyNotification(data, context, isMock)`: يضبط `state=SURVEY` و`alertAttempt=5`، يلغي أعمال وسم `"survey"`، ويجدول `CollisionResponseNotificationWorker` بتأخير **24 ساعة**.
- `clearCollisionResponseAlertCoolingPeriodWorkers()`: يلغي وسمي `"alert"` و`"cooling_period"`.
- `clearAllCollisionResponseWorkers()`: يلغي الثلاثة.

### 2.6 الثبات عبر موت العملية [VERIFIED]
بعد كل استجابة خادم ناجحة تُحفظ نسخة JSON كاملة من `CollisionResponseWorkerData` في SharedPreferences بمفتاح
**`"collisionResponseStateData"`** (عبر مفرد `ux6` كسول) — أي أن الآلة **تُستأنف بعد قتل العملية** من القرص [VERIFIED في `rt2.smali`].

---

## 3. من الاصطدام إلى الآلة: الكشف والبوابات [VERIFIED]

### 3.1 مصدرا الكشف
1. **Arity** (`com.life360.android.driver_behavior.DriverBehavior$CrashEvent`): حقول JSON `confidence`، `detailedConfidence`، `highConfidenceLevel`، `lowConfidenceLevel`، `isMock`، `sdkVersion`؛ وأنواع الأحداث `TRIP_START`، `HARD_BRAKING`، `CRASH`، `SPEEDING`، `RAPID_ACCELERATION`، `DISTRACTED`، `TRIP_END` [VERIFIED].
2. **Sentiance** (`com.sentiance.sdk.crashdetection.api.VehicleCrashEvent`): يُستقبل في موزّع `nqz.smali` (`pswitch_f`) كحدث `"OnVehicleCrash"` [VERIFIED].

### 3.2 خدمة الاستجابة التلقائية [VERIFIED — `AutomaticCollisionResponseService.smali` (856 سطراً)]
`JobService` (مصرّح `BIND_JOB_SERVICE`) — `onStartJob` يقرأ extras: `userId`، `crashEvent` (JSON)، `sdkVersion`، `cdla`، `isPremium`، `isMock`:
- يبني `CollisionResponseWorkerData` الأولي: `alertAttempt=0`، `state=ALERT`، `isLastWorkerSurvey=false`، ورقم الطوارئ.
- يسجل metric `"collision-registered"` (sdk-version، trip-id، confidence، mock-collision).
- **بوابة الإرسال للمنصة:** إن كان `isCrashDetectionPremium` صحيحاً → السجل الحرفي `"Don't send collision to platform…"` ويتوقف [VERIFIED — الدلالة الدقيقة معكوسة ظاهرياً: مسار المميزين يعالَج خارج هذه الآلة؛ INFERENCE].
- **بوابة الثقة قبل الإرسال:** يُرسل فقط إن تحقق `detailedConfidence >= min(highConfidenceLevel, lowConfidenceLevel)` وإلا `"Don't send collision to platform confidence= …"` [VERIFIED].

### 3.3 مصافحة الخادم [VERIFIED — `rt2.smali` (774 سطراً)، يُستدعى بعد POST الاصطدام]
- HTTP 400 → `"handleServerResponse: bad request! No retry."` — **بلا إعادة محاولة**.
- نجاح → تحليل `FreeCollisionDetectionResponse$ResponseBase` (Gson) ثم `GracePeriod{startTime, duration, notificationInterval, geofiltered, type}`:
  - `gracePeriodDurationInSeconds = duration − (now − startTime)`؛ إن كان ≤ 0 → **الاحتياطي 20 ثانية** (`0x14`) [VERIFIED].
  - `notificationIntervalInSeconds = notificationInterval` (إن > 0).
  - `startTimeInSeconds = startTime` (إن > 0) وإلا الآن.
  - `geofiltered` يُنسخ من الاستجابة.
- **بوابة التفعيل:** `!isCrashDetectionPremium && cdlaAccepted && detailedConfidence >= highConfidenceLevel && !geofiltered` →
  metric `"collision-response-initiated"` (type=automated، sdk-version، trip-id، confidence، mock-collision)؛
  إن فعّل الإعداد (`HarmonyAppSettings.w()`) يُبنى intent عبر `hx6.b(data, context, isMock)` ويُفتح **نشاط ملء الشاشة**؛
  ثم `clearAllCollisionResponseWorkers()` + إلغاء الإشعارين 6000/6001؛
  ثم إن كانت الإشعارات مفعّلة: `startWorker(NotificationWorker, tag="alert", delay=1s)` + جدولة `CollisionResponseEscalationWorker`
  (وسم `"CollisionResponseEscalationWorker"`) بتأخير `gracePeriodDurationInSeconds` [VERIFIED].
- الفروع السلبية مسجلة حرفياً: `"Not to show collision notification due to low confidence: …"`،
  `"Not to show collision notification due to false conditions. isCrashDetectionPremium: … cdlaAccepted: …"`.
- `gracePeriod == null` → `"Retry connection"` وإعادة جدولة الـ Job.

### 3.4 عامل التصعيد [VERIFIED — `CollisionResponseEscalationWorker.smali` (308 أسطر)]
`doWork()`: يقرأ `extraData`/`isMock`؛ يتحقق من `NotificationManager`؛ ثم يسجل metrics فقط عبر `bx6.d`:
نوع `automated`، مدة المهلة، **هل الرنين صامت** (`AudioManager.getRingerMode()==0`)، **هل وضع عدم الإزعاج مفعّل**
(`hx6.f(channels, notificationManager)`)، sdkVersion، trip-id، detailedConfidence — ثم نجاح.
**أي أنه مراقب قياس لا منفّذ** — التصعيد الحقيقي هو سلسلة التنبيهات نفسها [INFERENCE].

### 3.5 تفاعل المستخدم [VERIFIED — `ax6.smali` (921 سطراً، "ACR CollisionRespInteractor") + `sx6.smali` (574 سطراً)]
- `v()`: **المهلة المتبقية** = `(startTime + gracePeriod) − now` بالثواني (تُغذّي عدّاد واجهة "أنا بخير") [VERIFIED].
- `y(isTruePositive, isMock)` — `"scheduleSurvey"`: عند ردّ المستخدم ("أنا بخير" / "أحتاج مساعدة") تُضبط
  `isCollisionTruePositive` ويُؤخذ `userFirstName` من العضو الحالي ثم `scheduleSurveyNotification()` — أي **استبيان بعد 24 ساعة** [VERIFIED].
- مسار `CRASH_HELP` في `sx6`: يضبط علَم الطوارئ، **يتصل برقم الطوارئ** عبر `dk1.a(context, emergencyNumber)`،
  ثم `clearCollisionResponseAlertCoolingPeriodWorkers()` + إلغاء 6000/6001 [VERIFIED].

---

## 4. خط الموقع: الكشف عن الحركة بلا GPS [VERIFIED]

### 4.1 كاشف الحركة [VERIFIED — `MovementDetectionReceiver.smali` (1,219 سطراً)]
خوارزمية رخيصة البطارية بمستشعرين بديلين — **لا GPS إطلاقاً**:
1. **بصمة WiFi:** `WifiManager.getScanResults()` تُقارن مع `bssid_scan_info` المخزنة في SharedPreferences
   (الصيغة: 5 مقاطع مفصولة بـ `"<=>"` = ssid/bssid/طابع-زمني/عدد/عدد في كائن `qmp`)؛ غياب النتائج → تأخير افتراضي **3 دقائق** (`0x2bf20` = 180,000ms) [VERIFIED].
2. **أبراج خلوية:** مجموعة `previous_cells_info` (كائنات `pmp` بطوابع زمنية) — تُهمل المدخلات الأقدم من **3 ساعات**
   (`0xa4cb80` = 10,800,000ms)؛ تغيّر الخلية = حركة [VERIFIED].
3. الثوابت الزمنية المرصودة: دقيقة (`0xea60`)، 5 دقائق (`0x493e0`)، 3 دقائق، 3 ساعات [VERIFIED].
4. الجدولة: `AlarmManager.set(ELAPSED_REALTIME_WAKEUP, elapsedRealtime + delay, PendingIntent)` بفعل
   `".MovementDetection.ALARM_EXPIRY"` — **منبه أحادي يُعاد تسليحه كل دورة** (صديق لـ Doze نسبياً) [VERIFIED].
5. الحالة: `last_activity_is_still` + `last_activity_update_time` في SharedPreferences [VERIFIED].

### 4.2 نبضة الموقع والخدمة الأمامية [VERIFIED]
- `HeartbeatReceiver` (57 سطراً): **ترامبولين فقط** — يسجل ويمرر لكوروتين عبر `b78.d(...)`؛ المنطق الحقيقي مشوش [VERIFIED].
- `EventController`: خدمة أمامية `foregroundServiceType="location"` في عملية **`:service`** (manifest سطر 263) —
  قلب خط الموقع الخلفي [VERIFIED].
- `MovementStatusReceiver` + `MovementStatusWorker`: قناة حالة الحركة (تفاصيلها مشوشة) [VERIFIED بالوجود].
- `DriverBehaviorService`: خدمة أمامية `location` — Arity (سلوك القيادة) [VERIFIED].
- `NearbyDevicesFgService`: `mediaPlayback|location|connectedDevice` في `:service` — أجهزة Tile [VERIFIED].

### 4.3 المخزن المحلي كناقل غير متصل [VERIFIED]
`LocationRoomModel` (جدول `location`): **16 حقلاً** — id، type، longitude، latitude، accuracy، time، provider،
elapsedRealtimeNanos، speed، altitude، bearing، **lmode** (وضع الموقع)، **batteryLevel**، **userActivity**،
**wifiConnected**، **batteryCharging`**. أي أن كل نقطة موقع تُثري بسياق الجهاز [VERIFIED].
`LocationDao`: استعلامات بنوافذ زمنية مرتبة بالدقة (`ORDER BY accuracy ASC`) وحذف زمني
(`deleteLocationsAfterTime`، `deleteLocationsSameOrBeforeStartTimeOrAfterEndTime`) — **نمط الطابور غير المتصل:
خزّن محلياً ← ارفع ← احذف ما رُفع** [VERIFIED].
`LocationTripMonitoringConfigData` (kotlinx.serialization): `monitoringTripEnabled` و`tripGeofenceRadiusMeters`
**بقيمة افتراضية 100.0 متر** مكتوبة صراحة [VERIFIED].

### 4.4 تصنيف النشاط المدمج [VERIFIED]
`UserActivity` (enum): `UNKNOWN`، `IN_VEHICLE("vehicle")`، `OS_WALKING`، `OS_BIKING`، `OS_RUNNING`،
`POTENTIAL_FLYER`، `FLYING`، `TRAIN` — مع دوال `isDriving()`/`isBiking()`/`isWalking()`/`isRunning()`/`isFlying()`/`isTrain()`/`isMoving()`.
البادئة `OS_` = التعرف عبر نظام أندرويد (ActivityRecognitionClient)، و`FLYING` من كشف الطيران [VERIFIED].
نماذج كشف الطيران (`flight_detection/models`): `FlightDetectionTakeoffInfo`/`LandingInfo` بحقول
`firstDetectionTime`، `distanceFromRunway`، `runway` — أي **مطابقة مدارج** [VERIFIED جزئياً — أسماء الحقول فقط].

---

## 5. محرك الجيوفنس [VERIFIED]

### 5.1 على Google Play Services — لا رياضيات مخصصة
`ProximityGeofenceReceiver` (464 سطراً): يستخدم **`com.google.android.gms.location.GeofencingEvent`**:
- `GEOFENCE_TRANSITION_DWELL` → السجل `"geofence dwell detected"`.
- `GEOFENCE_TRANSITION_EXIT` → السجل `"geofence egress detected"`.
- غيرهما → `"unexpected geofence transition"`.
- يقرأ من حقن الاعتماديات: `appSettings`، `backgroundLocationTracker`، **`awarenessEngineApi`** (محرك وعي Sentiance) [VERIFIED].
**تباين استراتيجي:** FamiSafe نفّذ سياجاً مخصصاً بلا Google (يعمل بلا GMS)؛ Life360 **يعتمد كلياً على GMS** —
في Family OS (السوق اليمني) يُعتمد المخصص كأساس مع GMS كتحسين [INFERENCE].

### 5.2 مستقبلات الجيوفنس الثلاثة [VERIFIED بالوجود]
- `ProximityGeofenceReceiver` — سياج القرب (الأماكن).
- `TripGeofenceReceiver` — سياج الرحلات (بداية/نهاية قيادة).
- `ZoneCoordinatorReceiver` (`com.life360.koko.recievers`) — منسّق المناطق.
- `TripGeofenceState` (kotlinx.serialization): حالة سياج الرحلة مع `createdTime` [VERIFIED].

### 5.3 نوافذ الجيوفنس — ضبط البطارية [VERIFIED]
`GeofenceWindowingConfigData` (kotlinx.serialization، مشروط بعلَم `GeofenceWindowingEnabled`):
`windowSize`، `distanceDeltaMeters`، `movementReconcileMinIntervalSeconds`، `exitGraceSeconds`،
`fullReregisterIntervalSeconds` [VERIFIED].
القراءة الهندسية: تجميع تسجيلات الجيوفنس في **نوافذ**، **مهلة خروج** لمنع ارتداد الدخول/الخروج الكاذب،
عتبة مسافة، **إعادة تسجيل كاملة دورية** (لأن النظام يقتل الجيوفنسات) [INFERENCE].

### 5.4 تخزين الجيوفنس [VERIFIED]
`GeofenceRoomModel` (جدول `geofence`): id، placeId، type، radius، placeRadius، placeLatitude، placeLongitude، **endTime**
(جيوفنس مؤقت ينتهي ذاتياً). `GeofenceDao`: حذف/اختيار حسب النوع [VERIFIED].

---

## 6. طبقة تجريد الحساسات sensorframework [VERIFIED]

### 6.1 التسلسل الهرمي للأحداث (Parcelable)
- `SensorEventData<T>` (مجرّد): يغلّف كائن حساس خام + `a(obj)` للاستخراج [VERIFIED].
- `MultiAxisSensorEventData`: `timestamp` (long) + 3 محاور (float c/d/e) من `SensorEvent.values`، مع `equals` كامل [VERIFIED].
- `GyroscopeEventData` / `GravityEventData` / `RotationEventData`: تغليف مباشر لحدث المستشعر [VERIFIED].
- `MpLocationTaskEventData extends TaskEventData`: أعلام b/c/d (مهام الموقع متعددة الأغراض) [VERIFIED].
- `GeofenceData`: حدث سياج موحّد [VERIFIED بالوجود].

### 6.2 حراسة حساس الدوران [VERIFIED]
`RotationSensorComponentBackgroundUsageDetectedException` و`RotationSensorComponentStartedInBackgroundException` —
استثناءات مخصصة تُرمى عند **تشغيل حساس الدوران في الخلفية** (قيود أندرويد 12+ على الحساسات عالية المعدل) [VERIFIED بالوجود].
مع `HIGH_SAMPLING_RATE_SENSORS` مصرّح في الـ manifest — الحساسات عالية التردد (كشف الحوادث) تتطلب حارساً [INFERENCE].

### 6.3 حدود الدليل
مستهلكو هذه الأحداث (المكوّنات الفعلية للحساسات ومنطق الدمج) **مشوشة** في `defpackage` — الطبقة المرئية هي
**عقد البيانات فقط** لا الخوارزمية. القيمة لـ Family OS معمارية: نمط (حساس → حدث Parcelable → مستهلك) [VERIFIED/INFERENCE].

---

## 7. الشبكة وعقود البيانات

### 7.1 المضيفون [VERIFIED — `PlatformEnvironments.java` + `ApplicationBaseUrlsKt.java`]
| المضيف | الدور [INFERENCE] |
|---|---|
| `https://api-cloudfront.life360.com/` | واجهة REST الرئيسية (عبر CloudFront) |
| `https://auth.life360.com` | إصدار JWT |
| `https://location.life360.com` | رفع الموقع |
| `https://tracking.life360.com` | التتبع |
| `https://profile.life360.com` | الملفات الشخصية |
| `https://gpi1..gpi6.life360.com` | خط أنابيب الأحداث (GPI = منصة عامة) — 6 نهايات للتوزيع الجغرافي/الحمل |
| `https://alert.life360.com` | تنبيهات no-show |
| `https://share.life360.com` | المشاركة |

### 7.2 حزمة الشبكة [VERIFIED]
`com.life360.android.l360networkkit`: عميل OkHttp بمعترضات (`GpiAuthorizationInterceptor`، `UnauthorizedInterceptor` +
`UnauthorizedManager` لإدارة انتهاء الجلسة)، `CompressRequestBody` (ضغط الأجسام)، `GpiConnectionWarmer`
(تسخين الاتصالات)، `GpiConnectionMetricsCollector` (قياس الأداء)، `BasicAuthRules` [VERIFIED].

### 7.3 الموقع اللحظي عبر MQTT 5 [VERIFIED]
`internal/Mqtt5HiveClientKt.java` + `RealtimeMqttProvider` (واجهة: `addSubscription(topicId, tag)` /
`removeSubscription(topicId, tag)`) + `RealtimeMqttAuthProvider` — **عميل HiveMQ MQTT5**.
`RealtimeConnectionState` / `RealtimeLocationClientStatus` / `RealtimeLocationDisconnectInfo(Source)` — إدارة حالة الاتصال
وانقطاعه [VERIFIED]. **الخريطة اللحظية لا تعمل بالـ polling — بل باشتراكات MQTT** [INFERENCE قوية].

### 7.4 الدفع
`com.life360.koko.services.L360FirebaseMessagingService` (manifest سطر 176) — FCM [VERIFIED].
روابط `https://i.lf360.co/` (LocationPermission، BackgroundUsage، BatteryOptimization، LocationOn، LocationSharing،
PhysicalActivity، PowerSaveMode) — نمط UX طلب الصلاحيات التدريجي [VERIFIED من تقرير الجولة الأولى].

### 7.5 مسار رفع الاصطدام [VERIFIED]
`ex6.a(context, cx6, jsonBody, px6.COLLISION, r22)` — POST غير متزامن (OkHttp ملفّف `ur00`) بردّ `rt2` (§3.3).
المسار الدقيق للـ endpoint يُحلّ ديناميكياً ("invalid update endpoint response") — **غير مستخرج حرفياً** [PARTIAL].

---

## 8. نموذج الدائرة والخصوصية [VERIFIED]

- `Member`: id، **isAdmin**، **role (MemberRole)**، lastUpdated، **circleId**، firstName، lastName، loginEmail، loginPhone، avatar، createdAt [VERIFIED].
- `MemberRole` (enum) + `RemoveMemberQuery`/`MemberQuery` — إدارة العضوية [VERIFIED بالوجود].
- `CompoundCircleId` — معرّف دائرة مركّب (دعم تعدد الدوائر للعضو) [VERIFIED بالوجود].
- `PrivacySettingsIdentifier` — معرّف إعدادات الخصوصية (مشاركة الموقع لكل عضو) [VERIFIED بالوجود].
- `EmergencyContactEntity` + `EmergencyContactId` — جهات الطوارئ [VERIFIED بالوجود].
- `SharedIntents.ACTION_DEACTIVATE_ALL_ZONES_ON_SOS` (manifest سطر 250) — **تفعيل SOS يعطّل كل مناطق التنبيه** (منع فيض التنبيهات الكاذبة أثناء الطوارئ) [VERIFIED].
- جلسات WatchOverMe: `SessionNotFoundException`، `CreateSessionRejectedException`، `DestinationConflictException`،
  `DestinationRejectedException` + مستقبلا الإشعارات (`WatchOverMeNotificationDismissReceiver`،
  `WatchOverMeSuggestedHomeReceiver`) — منطق الجلسات نفسه مشوش [VERIFIED بالوجود].
- `BluetoothDeviceSosBackgroundService` (foreground/location) — زر SOS في أجهزة Tile [VERIFIED].

---

## 9. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب |
|---|---|---|---|
| 1 | **آلة حالة الحوادث** (WORK_STATE الثلاث + `CollisionResponseWorkerData` + عداد 4 + مهلة/فاصل من الخادم) | 1 | أنظف آلة طوارئ موثقة: تُنسخ شبه حرفية — الحالات، الانتقالات، سياسة REPLACE، الثبات في SharedPreferences. |
| 2 | **كشف الحركة بلا GPS** (بصمة WiFi BSSID + تغيّر الأبراج الخلوية + منبه أحادي) | 1 | وصفة البطارية الذهبية: استيقاظ GPS فقط عند الحركة المؤكدة. انسخ الخوارزمية. |
| 3 | **نموذج الطابور غير المتصل** (`LocationRoomModel` الـ16 حقلاً + `LocationDao` بالنوافذ الزمنية) | 1 | إثراء كل نقطة (بطارية/نشاط/WiFi) + تخزين/رفع/حذف — أساس مزامنة Family OS. |
| 4 | **المصافحة الخادمية للاصطدام** (GracePeriod من الخادم + احتياطي 20s + `geofiltered` kill-switch + بوابات الثقة) | 1 | التحكم الخادمي بالمهلة يتيح الضبط دون تحديث التطبيق؛ kill-switch يمنع الكوارث. |
| 5 | **استبيان ما بعد الحادث (24h)** + علَم `isCollisionTruePositive` | 2 | حلقة تغذية راجعة تُحسّن العتبات وتُقلل الإيجابيات الكاذبة — كيّف التوقيت. |
| 6 | **مهلة الخروج للجيوفنس** (`exitGraceSeconds`) + إعادة التسجيل الدورية | 2 | يحل مشكلتي الارتداد الكاذب وموت الجيوفنسات — أضفهما لسياج Family OS المخصص. |
| 7 | **MQTT 5 للموقع اللحظي** (اشتراكات لكل دائرة) | 2 | بديل الـ polling للخريطة الحية؛ كيّف الوسيط (يمكن EMQX مملوك). |
| 8 | **تعطيل المناطق عند SOS** (`ACTION_DEACTIVATE_ALL_ZONES_ON_SOS`) | 1 | تفصيل عملياتي ذكي — انسخه حرفياً. |
| 9 | **حفظ حالة الصوت الأصلية** (`originRingerMode/Volume/Filter`) | 2 | التنبيه الصاخب يجب أن يستعيد وضع المستخدم — تفصيل UX. |
| 10 | **تصنيف `UserActivity`** (8 حالات + دوال is*) | 2 | معجم موحد للنشاط يغذي القيادة والرحلات والبطارية. |
| 11 | **تجريد sensorframework** (حدث Parcelable لكل حساس) | 3 | الفكرة المعمارية لا الكود — أعد صياغتها في Family OS. |
| 12 | **نموذج العضو/الدائرة** (role/isAdmin/circleId/CompoundCircleId) | 2 | أساس صلاحيات Family OS المرنة. |
| 13 | **روابط `i.lf360.co`** لطلب الصلاحيات | 1 | انسخ الفكرة حرفياً (روابط شرح قبل كل إذن). |
| ✗ | الاعتماد على **Sentiance/Arity** (مدفوعان، ثنائيان مغلقان) | ✗ | البديل المملوك: كشف الاصطدام على الحساسات المحلية + `HIGH_SAMPLING_RATE_SENSORS`. |
| ✗ | **Geofencing API حصراً** (يتطلب GMS) | ✗ | Family OS يعمل بلا GMS (اليمن) — السياج المخصص أساساً (من FamiSafe) وGMS تحسين. |
| ✗ | `RECORD_AUDIO` و`READ_USER_DICTIONARY` المعلنة بلا مبرر وظيفي ظاهر | ✗ | لا تُنسخ بلا ضرورة موثقة (سياسة Play). |

---

## 10. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **مسار REST الدقيق لرفع الاصطدام** [PARTIAL]: الـ endpoint يُحلّ ديناميكياً عبر `ex6` — المسار الحرفي غير مستخرج؛ يحتاج اعتراض شبكي حي.
2. **قيم `gracePeriodDurationInSeconds` و`notificationIntervalInSeconds` الإنتاجية** [INFERENCE]: من الخادم؛ الاحتياطي العميل 20s فقط. القيم الحقيقية (دقائق؟) تحتاج مراقبة حية.
3. **دلالة `isCrashDetectionPremium=true`** [INFERENCE]: الكود يتخطى مسار المنصة للمميزين — على الأرجح مركز اتصال بشري؛ غير مؤكد.
4. **من يجدول `AutomaticCollisionResponseService` أصلاً؟** [UNRESOLVED]: لم يُعثر على المُجدوِل في الشجرة — على الأرجح مستمع Arity/Sentiance خارج الكود المرئي.
5. **خوارزمية كشف الاصطدام المحلية** (العتبات الفيزيائية g-force): داخل Arity/Sentiance المغلقين — **غير قابلة للاستخراج**؛ Family OS يبنيها ذاتياً.
6. **مستهلكو أحداث sensorframework**: مشوشون — الدمج الحقيقي (gyro+accel لقيادة/حوادث) غير مرئي.
7. **منطق جلسات WatchOverMe**: الاستثناءات فقط — دورة حياة الجلسة غير مفككة.
8. **صيغة مواضيع MQTT** (topic structure): الواجهة فقط (`topicId`) — التسمية الفعلية للمواضيع تحتاج اعتراضاً حياً.
9. **`w3i0.b(context)`** لحل رقم الطوارئ: آلية الحل (جدول دولة؟ API؟) غير مقروءة.
10. **القيم الافتراضية الخمسة لـ `GeofenceWindowingConfigData`**: من الخادم/الأعلام — غير مستخرجة.

---

## 11. خريطة الملفات المرجعية (مسارات دقيقة)

**التصادم** (`~/workspace/rework/life360/`):
- `apktool-out/smali_classes6/com/life360/koko/collision_response/workers/CollisionResponseWorkerUtils$WORK_STATE.smali` — الحالات الثلاث.
- `apktool-out/smali_classes6/com/life360/koko/collision_response/workers/CollisionResponseWorkerUtils.smali` — أدوات الجدولة/الإلغاء.
- `jadx-out/sources/com/life360/koko/collision_response/workers/CollisionResponseWorkerData.java` — حمولة الحالة.
- `apktool-out/smali_classes2/com/life360/koko/collision_response/workers/CollisionResponseNotificationWorker.smali` — العرض + الانتقالات (891 سطراً).
- `apktool-out/smali_classes2/com/life360/koko/collision_response/workers/CollisionResponseEscalationWorker.smali` — قياس التصعيد.
- `apktool-out/smali_classes6/com/life360/koko/collision_response/services/AutomaticCollisionResponseService.smali` — البوابات والإرسال (856 سطراً).
- `apktool-out/smali_classes6/rt2.smali` — مصافحة الخادم (774 سطراً).
- `apktool-out/smali_classes6/ax6.smali` — تفاعل المستخدم (921 سطراً)؛ `sx6.smali` — مسار CRASH_HELP.
- `apktool-out/smali_classes8/com/life360/koko/collision_response/CollisionResponseReceiver.smali`.
- `apktool-out/smali_classes6/com/life360/koko/network/models/response/FreeCollisionDetectionResponse$GracePeriod.smali`.
- `apktool-out/smali_classes5/com/life360/android/driver_behavior/DriverBehavior$CrashEvent.smali`.

**الموقع والحركة:**
- `apktool-out/smali_classes5/com/life360/android/location/receivers/MovementDetectionReceiver.smali` — كشف الحركة (1,219 سطراً).
- `apktool-out/smali_classes5/com/life360/android/location/receivers/HeartbeatReceiver.smali` — الترامبولين.
- `apktool-out/smali_classes5/com/life360/android/location/receivers/ProximityGeofenceReceiver.smali` — الجيوفنس.
- `apktool-out/smali_classes2/com/life360/android/location/geofencewindow/flags/GeofenceWindowingConfigData.smali`.
- `jadx-out/sources/com/life360/model_store/base/localstore/room/location/LocationRoomModel.java` + `LocationDao.java`.
- `jadx-out/sources/com/life360/android/location/LocationTripMonitoringConfigData.java`.
- `jadx-out/sources/com/life360/android/driver_behavior/UserActivity.java`.
- `jadx-out/sources/com/life360/android/sensorframework/` (التجريد الكامل).

**الشبكة والدائرة:**
- `jadx-out/sources/com/life360/android/shared/PlatformEnvironments.java` — المضيفون.
- `jadx-out/sources/com/life360/android/l360networkkit/` — REST + MQTT5.
- `jadx-out/sources/com/life360/android/membersengineapi/models/member/Member.java`.
- `jadx-out/sources/com/life360/model_store/base/localstore/room/geofence/GeofenceRoomModel.java`.
- `apktool-out/AndroidManifest.xml` — المكونات الـ168 (41+33+82+12).
