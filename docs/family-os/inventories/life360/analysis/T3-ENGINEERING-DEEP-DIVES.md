# التحليلات الهندسية المعمقة للمسارات الثلاثة — Life360 (T3 Engineering Deep Dives)

> **المعرف:** `T3-L3-DEEP-DIVES-001`
> **التطبيق:** Life360 (`life360`) — `com.life360.android.safetymapd` v26.41.0
> **تاريخ التحديث:** 2026-11-04
> **حالة التحقق:** `Level A Code-Verified` للمسارات المفككة أدناه؛ الاستنتاجات موسومة صراحة

---

## 1. منهجية التحقيق ومستويات الإثبات المعتمدة

- **المستوى A (Ground Truth):** الكود المفكك فعلياً (jadx/smali) المقروء سطراً بسطر — موسوم `[VERIFIED]`.
- **المستوى B (Derived):** نماذج مستخلصة من بنية الكود وتسمياته — موسومة `[INFERENCE]`.
- **المستوى C (Unverified):** ما يتطلب مراقبة شبكية حية أو جهازاً حياً — موسوم `غير محسوم`.
- **حدود الدليل والأمانة العلمية:** أي رقم سطر مذكور تم التحقق منه بالقراءة المباشرة؛ حيث لم يُتحقق يُذكر الملف دون أرقام.

---

## 2. المسار الهندسي الأول (Track A): آلة حالة الحوادث — مفككة انتقالاً بانتقال

### 2.1 الحالات والحمولة — Level A
- **المصادر المفحوصة:**
  - `rework/life360/apktool-out/smali_classes6/com/life360/koko/collision_response/workers/CollisionResponseWorkerUtils$WORK_STATE.smali` (قُرئ كاملاً)
  - `rework/life360/apktool-out/smali_classes6/com/life360/koko/collision_response/workers/CollisionResponseWorkerUtils.smali` (قُرئ كاملاً)
  - `rework/life360/jadx-out/sources/com/life360/koko/collision_response/workers/CollisionResponseWorkerData.java` (قُرئ كاملاً)
- **التشريح الهندسي:**
  - 3 حالات بقيم سلكية: `ALERT="alert"`، `COOLING_PERIOD="cooling_period"`، `SURVEY="survey"`.
  - الحمولة 21 حقلاً بتسلسل Gson (`@oxz`) تُمرَّر بين العمال كنص JSON — التصميم يجعل كل عامل **عديم الحالة** (stateless): الحالة كلها في الحمولة.
  - الجدولة عبر `RemoteWorkManagerClient` (WorkManager متعدد العمليات) — العمال يعملون من عملية `:service` حتى لو ماتت عملية الواجهة.
  - الثبات: نسخة JSON تُحفظ في SharedPreferences بمفتاح `"collisionResponseStateData"` بعد كل مصافحة ناجحة — **استئناف بعد موت العملية** (`rt2.smali`).
- **حدود الدليل:** قيم المهلة/الفاصل الإنتاجية خادمية — الاحتياطي العميل الوحيد المثبت هو 20 ثانية.

### 2.2 الانتقالات — Level A
- **المصدر المفحوص:** `rework/life360/apktool-out/smali_classes2/com/life360/koko/collision_response/workers/CollisionResponseNotificationWorker.smali` (الأسطر #L1-L891 — قُرئ كاملاً).
- **التشريح الهندسي:**
  - `doWork()`: عرض الإشعار حسب الحالة ← نسخ الحمولة ← `scheduleNextNotification()`.
  - الحد: `alertAttempt >= 4` → توقف حرفي `"max retry limit reached=4"`.
  - `ALERT → COOLING_PERIOD`: `alertAttempt++`، وسم `"cooling_period"`، تأخير `gracePeriodDurationInSeconds`، `REPLACE`.
  - `COOLING_PERIOD → ALERT`: `alertAttempt++`، وسم `"alert"`، تأخير `notificationIntervalInSeconds`، `REPLACE`.
  - `SURVEY → ∅`: `"Don't schedule the next notification due to invalid state"` — نهائية.
  - **العدّ: 5 عروض كحد أقصى** (ALERT, CP, ALERT, CP, ALERT) بالتناوب.
  - العرض: ALERT = إشعار 6000 (`0x1770`) بقناة صامتة/صاخبة حسب إصدار أندرويد؛ COOLING_PERIOD = إشعار 6001 (`0x1771`) صامت؛ SURVEY = قناة بلا صوت.
- **حدود الدليل:** منطق `CollisionResponseNetworkWorker` (680 سطراً) لم يُفكك سطراً بسطر — دوره الشبكي مستنتج من الاسم والمراجع.

### 2.3 البوابات والمصافحة — Level A
- **المصادر المفحوصة:**
  - `rework/life360/apktool-out/smali_classes6/com/life360/koko/collision_response/services/AutomaticCollisionResponseService.smali` (856 سطراً)
  - `rework/life360/apktool-out/smali_classes6/rt2.smali` (774 سطراً — ردّ الشبكة)
- **التشريح الهندسي:**
  - بوابة الإرسال: `detailedConfidence >= min(high, low)` وإلا لا إرسال؛ `isCrashDetectionPremium=true` يتخطى مسار المنصة.
  - المصافحة: `grace = duration − (now − startTime)` باحتياطي 20s؛ `geofiltered=true` قتل-صامت؛ التفعيل يتطلب `cdlaAccepted && detailed >= high && !geofiltered && !premium`.
  - HTTP 400 → بلا إعادة محاولة (قرار صريح).
  - بدء الآلة: `startWorker(NotificationWorker, "alert", delay=1s)` + `EscalationWorker` بتأخير المهلة + نشاط ملء الشاشة (إن فعّل الإعداد).
- **حدود الدليل:** مُجدوِل الـ Job الأصلي غير مرئي في الشجرة (على الأرجح مستمع Arity/Sentiance) — Level C.

### 2.4 تفاعل المستخدم — Level A
- **المصادر المفحوصة:** `rework/life360/apktool-out/smali_classes6/ax6.smali` (921 سطراً)، `sx6.smali` (574 سطراً — مقاطع).
- **التشريح الهندسي:**
  - `v()`: المهلة المتبقية `(startTime + grace) − now` — عدّاد الواجهة.
  - `y(isTruePositive, isMock)`: ردّ المستخدم → `isCollisionTruePositive` + `userFirstName` → استبيان بعد 24 ساعة (`scheduleSurveyNotification`: `state=SURVEY`، `alertAttempt=5`، تأخير 24h).
  - `CRASH_HELP`: اتصال `emergencyNumber` عبر `dk1.a()` ← إلغاء العمال ← إلغاء 6000/6001.
- **حدود الدليل:** آلية حل `emergencyNumber` (`w3i0.b`) غير مقروءة — Level B (جدول حسب الدولة).

---

## 3. المسار الهندسي الثاني (Track B): خط الموقع — من الحركة إلى السحابة

### 3.1 كشف الحركة بلا GPS — Level A
- **المصدر المفحوص:** `rework/life360/apktool-out/smali_classes5/com/life360/android/location/receivers/MovementDetectionReceiver.smali` (1,219 سطراً — مقاطع حرجة).
- **التشريح الهندسي:**
  - بصمة WiFi: `getScanResults()` مقابل `bssid_scan_info` (صيغة `"<=>"` خماسية في `qmp`)؛ الغياب → 3 دقائق.
  - الأبراج: `previous_cells_info` (كائنات `pmp`) بنافذة 3 ساعات (`0xa4cb80`)؛ تغيّر الخلية = حركة.
  - الجدولة: `AlarmManager.set(ELAPSED_REALTIME_WAKEUP, …)` أحادي بفعل `.MovementDetection.ALARM_EXPIRY` — يُعاد تسليحه كل دورة.
  - الحالة: `last_activity_is_still` + `last_activity_update_time`.
- **القيمة:** GPS لا يستيقظ إلا عند حركة مؤكدة — **وصفة البطارية الذهبية** لـ Family OS.

### 3.2 الطابور غير المتصل — Level A
- **المصادر المفحوصة:**
  - `rework/life360/jadx-out/sources/com/life360/model_store/base/localstore/room/location/LocationRoomModel.java`
  - `rework/life360/jadx-out/sources/com/life360/model_store/base/localstore/room/location/LocationDao.java`
- **التشريح الهندسي:**
  - 16 حقلاً للنقطة: إحداثيات، دقة، سرعة، اتجاه، ارتفاع، `lmode`، `batteryLevel`، `userActivity`، `wifiConnected`، `batteryCharging`، `elapsedRealtimeNanos`.
  - DAO: `getMostAccurateLocationBetweenTime` (`ORDER BY accuracy ASC`)، `deleteLocationsAfterTime`، نوافذ زمنية — **خزّن ← ارفع ← احذف**.
- **حدود الدليل:** كاتب الطابور (من يملؤه) مشوش — القارئ/الحاذف مثبتان.

### 3.3 الجيوفنس والنوافذ — Level A
- **المصادر المفحوصة:** `ProximityGeofenceReceiver.smali` (464 سطراً — مقاطع)، `GeofenceWindowingConfigData.smali`، `GeofenceRoomModel.java`، `GeofenceDao.java`.
- **التشريح الهندسي:**
  - GMS `GeofencingEvent`: `DWELL → "geofence dwell detected"`، `EXIT → "geofence egress detected"`؛ حقن `awarenessEngineApi` (Sentiance).
  - النوافذ: `windowSize`، `distanceDeltaMeters`، `movementReconcileMinIntervalSeconds`، `exitGraceSeconds`، `fullReregisterIntervalSeconds` — مهلة خروج ضد الارتداد + إعادة تسجيل دورية ضد موت الجيوفنسات.
  - التخزين: `geofence{id, placeId, type, radius, placeRadius, lat, lng, endTime}` — **جيوفنس مؤقت** ينتهي ذاتياً.
  - `tripGeofenceRadiusMeters = 100.0f` افتراضي في `LocationTripMonitoringConfigData`.
- **حدود الدليل:** القيم الافتراضية للنوافذ خادمية — Level B.

---

## 4. المسار الهندسي الثالث (Track C): الشبكة اللحظية والدائرة

### 4.1 MQTT 5 للموقع اللحظي — Level A (الواجهة) / Level B (المواضيع)
- **المصادر المفحوصة:** `jadx-out/sources/com/life360/android/l360networkkit/internal/Mqtt5HiveClientKt.java`، `RealtimeMqttProvider.java`، `RealtimeMqttAuthProvider*.java`، `RealtimeConnectionState.java`…
- **التشريح الهندسي:**
  - عميل **HiveMQ MQTT5**؛ الواجهة: `addSubscription(topicId, tag)` / `removeSubscription(topicId, tag)` (كوروتين).
  - إدارة حالة كاملة: `RealtimeConnectionState`، `RealtimeLocationClientStatus`، `RealtimeLocationDisconnectInfo(Source)`، `RealtimeLocationException`.
  - المضيفون: `api-cloudfront` (REST)، `auth` (JWT)، `location`/`tracking` (رفع)، `gpi1-6` (أحداث)، `alert`، `share`.
  - `l360networkkit`: OkHttp + `GpiAuthorizationInterceptor` + `UnauthorizedManager` + `CompressRequestBody` + `GpiConnectionWarmer`.
- **حدود الدليل:** صيغة المواضيع الفعلية غير مرئية — تحتاج اعتراضاً حياً (Level C).

### 4.2 نموذج الدائرة والخصوصية — Level A
- **المصادر المفحوصة:** `Member.java`، `MemberRole.java`، `CompoundCircleId.java`، `PrivacySettingsIdentifier.java`، `EmergencyContactEntity.java`، manifest سطر 250.
- **التشريح الهندسي:**
  - `Member{id, isAdmin, role, circleId, firstName, lastName, loginEmail, loginPhone, avatar, createdAt, lastUpdated}`.
  - `CompoundCircleId` — تعدد الدوائر؛ `PrivacySettingsIdentifier` — مشاركة الموقع لكل عضو.
  - `ACTION_DEACTIVATE_ALL_ZONES_ON_SOS` — SOS يعطّل كل مناطق التنبيه (منع الفيض).
- **حدود الدليل:** منطق جلسات WatchOverMe مشوش — الاستثناءات الأربعة + مستقبلا الإشعارات فقط (Partial).

### 4.3 تجريد الحساسات — Level A (العقد) / Level B (الدمج)
- **المصادر المفحوصة:** `jadx-out/sources/com/life360/android/sensorframework/` كاملاً (11 ملفاً).
- **التشريح الهندسي:**
  - `SensorEventData<T>` ← `MultiAxisSensorEventData` (timestamp + 3 محاور، Parcelable، equals كامل) ← `Gyroscope/Gravity/RotationEventData`.
  - `MpLocationTaskEventData`، `GeofenceData`، `TaskEventData` — أحداث مهام قابلة للـ Parcel.
  - استثناءات حراسة الدوران في الخلفية (قيود أندرويد 12+).
  - `UserActivity`: 8 حالات (`UNKNOWN/IN_VEHICLE/OS_WALKING/OS_BIKING/OS_RUNNING/POTENTIAL_FLYER/FLYING/TRAIN`) + دوال `is*`.
- **حدود الدليل:** المستهلكون ومنطق الدمج مشوشون — العقد فقط مثبت.

### 4.4 الكتالوج المرفوض — Level A
- **المصادر:** manifest (الخدمات)، `nqz.smali` (`pswitch_f` → `VehicleCrashEvent`)، `DriverBehavior$CrashEvent.smali`.
- **التشريح:** Sentiance (موقع/حوادث/وعي) + Arity CoreEngine (قيادة/رحلات) — SDKs مدفوعة مغلقة؛ كشف الاصطدام الفيزيائي بداخلهما **غير قابل للاستخراج**. القرار: بديل مملوك على الحساسات المحلية.
