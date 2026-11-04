# وثيقة الاستكشاف الوظيفي الشامل وتحليل الفجوات المعمارية — Life360
# Comprehensive Functional Discovery, Boundary Reconciliation & Gaps Analysis (Unified Plan Deep-Doc #3)

> **التطبيق:** Life360 — `com.life360.android.safetymapd` v26.41.0
> **أعمق جرد لآلة حالة حوادث في البرنامج**

---

## 1. الإطار المنهجي المعتمد

- **المستوى A (مؤكد بالكود):** قُرئ الكود المفكك فعلياً — `Confirmed`.
- **المستوى B (مشتق):** مستنتج من البنية والتسميات — `Derived`.
- **جزئي (Partial):** منفذ جزئياً أو يتطلب طرفاً غير مفحوص (الخادم).
- **غير موجود (Not Found):** فجوة موثقة.

## 2. حسم الفروقات المادية والتاريخية

- تقرير الجولة الأولى (`reports/life360.md`) سجّل خمسة مكونات كـ "smali فقط": `EventController`، `HeartbeatReceiver`،
  `MovementDetectionReceiver`، `AutomaticCollisionResponseService`، `ProximityGeofenceReceiver` — **حُسم هنا**: الأربعة الأخيرة
  قُرئت فعلياً (`EventController` خدمة أمامية في الـ manifest؛ منطقها الداخلي مشوش).
- التقرير ذكر "355 خطأ jadx (0.7%)" — العدد الدقيق غير مُعاد قياسه هنا؛ المقاس: 24,943 java / 82,105 smali.
- التقرير قال "لم أعثر على واجهات Retrofit" — **حُسم**: الشبكة ليست Retrofit أصلاً بل `l360networkkit` (OkHttp مخصص) + MQTT5.

## 3. الفحص المعماري لطبقة البيانات والتخزين

**الحسم:** التخزين المحلي **علائقي بالكامل** (Room) — لا SharedPreferences للقواعد:
- `location` (16 حقلاً/نقطة)، `geofence` (بـ `endTime`)، `activity_transition`، `dark_web_*`، `gpi`، `residency`…
- `LocationDao`/`GeofenceDao`/`ActivityTransitionDao`: نوافذ زمنية + حذف زمني — **نمط الطابور غير المتصل**.
- `collisionResponseStateData` (SharedPreferences): الحالة الوحيدة خارج Room — لاستئناف آلة الحوادث.

## 4. المطابقة القطعية للواجهات البرمجية

### 4.1 إحصائيات المطابقة:
- **المضيفون:** 8 مثبتة (`PlatformEnvironments.java`).
- **القناة اللحظية:** MQTT 5 (HiveMQ) — الواجهة مثبتة، صيغة المواضيع Level C.
- **رفع الاصطدام:** POST غير متزامن بردّ `rt2` — الـ endpoint ديناميكي (Partial).
- **الدفع:** FCM (`L360FirebaseMessagingService`).

---

## 5. مصفوفة الاستكشاف والتغطية الوظيفية الشاملة

### 5.1 الإحصائيات الإجمالية:
- **إجمالي الوظائف:** 34 وظيفة عبر 8 مجالات.
- **مؤكدة Level A:** 26 | **مشتقة Level B:** 5 | **جزئية:** 2 | **غير موجودة:** 1.

### 5.2 جدول الفهرسة السريع للوظائف الـ 34:

| المعرف | الوظيفة | المجال | المستوى |
|---|---|---|---|
| L3-FUN-000001 | WORK_STATE: 3 حالات (`alert`/`cooling_period`/`survey`) | الحوادث | A مؤكدة |
| L3-FUN-000002 | `CollisionResponseWorkerData` (21 حقلاً، Gson) | الحوادث | A مؤكدة |
| L3-FUN-000003 | `scheduleNextNotification`: الانتقالات + حد 4 | الحوادث | A مؤكدة |
| L3-FUN-000004 | العرض حسب الحالة (6000/6001 + القنوات) | الحوادث | A مؤكدة |
| L3-FUN-000005 | `scheduleSurveyNotification` (استبيان 24h) | الحوادث | A مؤكدة |
| L3-FUN-000006 | إلغاء العمال (alert/cooling/survey) | الحوادث | A مؤكدة |
| L3-FUN-000007 | ثبات الحالة (`collisionResponseStateData`) | الحوادث | A مؤكدة |
| L3-FUN-000008 | EscalationWorker: قياس الصامت/DND | الحوادث | A مؤكدة |
| L3-FUN-000009 | `AutomaticCollisionResponseService.onStartJob` | الكشف | A مؤكدة |
| L3-FUN-000010 | بوابات الثقة (إرسال/تفعيل) | الكشف | A مؤكدة |
| L3-FUN-000011 | مصافحة الخادم (GracePeriod + 20s + geofiltered) | الكشف | A مؤكدة |
| L3-FUN-000012 | سياسة HTTP 400 بلا إعادة | الكشف | A مؤكدة |
| L3-FUN-000013 | مصدرا الاصطدام (Arity + Sentiance) | الكشف | A مؤكدة |
| L3-FUN-000014 | عدّاد المهلة المتبقية `v()` | التفاعل | A مؤكدة |
| L3-FUN-000015 | ردّ المستخدم → استبيان (`y()`) | التفاعل | A مؤكدة |
| L3-FUN-000016 | CRASH_HELP: اتصال الطوارئ | التفاعل | A مؤكدة |
| L3-FUN-000017 | كشف الحركة بلا GPS (WiFi + أبراج) | الموقع | A مؤكدة |
| L3-FUN-000018 | منبه أحادي معاد التسليح (ALARM_EXPIRY) | الموقع | A مؤكدة |
| L3-FUN-000019 | `EventController` (أمامية، `:service`) | الموقع | A مؤكدة |
| L3-FUN-000020 | طابور الموقع غير المتصل (16 حقلاً) | الموقع | A مؤكدة |
| L3-FUN-000021 | إعداد مراقبة الرحلات (100m) | الموقع | A مؤكدة |
| L3-FUN-000022 | كشف الطيران (إقلاع/هبوط/مدارج) | الموقع | B مشتقة |
| L3-FUN-000023 | GMS GeofencingEvent (dwell/egress) | الجيوفنس | A مؤكدة |
| L3-FUN-000024 | نوافذ الجيوفنس (exitGrace + reregister) | الجيوفنس | A مؤكدة |
| L3-FUN-000025 | `GeofenceRoomModel` (جيوفنس مؤقت) | الجيوفنس | A مؤكدة |
| L3-FUN-000026 | سياج الرحلات + منسق المناطق | الجيوفنس | B مشتقة |
| L3-FUN-000027 | هرمية أحداث sensorframework (Parcelable) | الحساسات | A مؤكدة |
| L3-FUN-000028 | تصنيف `UserActivity` (8 حالات) | الحساسات | A مؤكدة |
| L3-FUN-000029 | الموقع اللحظي عبر MQTT 5 | الشبكة | B مشتقة |
| L3-FUN-000030 | `l360networkkit` (معترضات/ضغط/تسخين) | الشبكة | A مؤكدة |
| L3-FUN-000031 | FCM (`L360FirebaseMessagingService`) | الشبكة | A مؤكدة |
| L3-FUN-000032 | نموذج العضو/الدائرة (role/isAdmin) | الدائرة | A مؤكدة |
| L3-FUN-000033 | الخصوصية + تعطيل المناطق عند SOS | الدائرة | A مؤكدة |
| L3-FUN-000034 | عقود جلسات WatchOverMe | SOS | جزئية |

### 5.3 السجل التشريحي التفصيلي (نموذج موسع لأهم 12 — الباقي في الجدول):

#### المجال 1: آلة الحالة

##### L3-FUN-000003: الانتقالات والحد الأقصى
- **المسار البرمجي:** `CollisionResponseNotificationWorker.doWork()` ← `displayCurrentNotification()` ← `scheduleNextNotification(current, next, context)`
- **المصدر الفيزيائي:** `rework/life360/apktool-out/smali_classes2/com/life360/koko/collision_response/workers/CollisionResponseNotificationWorker.smali` (#L1-L891)
- **القواعد:** `alertAttempt >= 4` → توقف؛ `ALERT→COOLING_PERIOD` (تأخير المهلة)؛ `COOLING_PERIOD→ALERT` (تأخير الفاصل)؛ `SURVEY→∅`
- **الموارد والأدلة:** `L3-RES-000001` — `L3-EVD-000001`
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### L3-FUN-000011: مصافحة الخادم
- **المسار البرمجي:** POST الاصطدام ← `rt2.invoke()` ← `FreeCollisionDetectionResponse$ResponseBase` ← `GracePeriod`
- **المصدر الفيزيائي:** `rework/life360/apktool-out/smali_classes6/rt2.smali` (774 سطراً)
- **القواعد الخوارزمية:** `grace = duration − (now − startTime)`؛ احتياطي 20s؛ `geofiltered` قتل-صامت؛ HTTP 400 بلا إعادة
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 2: خط الموقع

##### L3-FUN-000017: كشف الحركة بلا GPS
- **المسار البرمجي:** `MovementDetectionReceiver` ← `getScanResults()` مقابل `bssid_scan_info` ← `previous_cells_info` (نافذة 3h)
- **المصدر الفيزيائي:** `rework/life360/apktool-out/smali_classes5/com/life360/android/location/receivers/MovementDetectionReceiver.smali` (1,219 سطراً)
- **القواعد:** غياب WiFi → 3 دقائق؛ تغيّر الخلية = حركة؛ `last_activity_is_still`
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### L3-FUN-000020: الطابور غير المتصل
- **المسار البرمجي:** `LocationRoomModel` (16 حقلاً) ← `LocationDao` (نوافذ زمنية + حذف)
- **المصدر الفيزيائي:** `rework/life360/jadx-out/sources/com/life360/model_store/base/localstore/room/location/LocationRoomModel.java` + `LocationDao.java`
- **القواعد:** إثراء النقطة (بطارية/نشاط/WiFi)؛ `ORDER BY accuracy ASC`؛ خزّن ← ارفع ← احذف
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 3: الجيوفنس

##### L3-FUN-000023: معالجة GMS GeofencingEvent
- **المسار البرمجي:** `ProximityGeofenceReceiver.onReceive()` ← `GeofencingEvent.fromIntent()` ← dwell/egress
- **المصدر الفيزيائي:** `rework/life360/apktool-out/smali_classes5/com/life360/android/location/receivers/ProximityGeofenceReceiver.smali` (464 سطراً)
- **القيود:** يتطلب GMS — Family OS يبني المخصص أساساً
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### L3-FUN-000024: نوافذ الجيوفنس
- **المسار البرمجي:** `GeofenceWindowingConfigData{windowSize, distanceDeltaMeters, movementReconcileMinIntervalSeconds, exitGraceSeconds, fullReregisterIntervalSeconds}` ← علَم `GeofenceWindowingEnabled`
- **المصدر الفيزيائي:** `rework/life360/apktool-out/smali_classes2/com/life360/android/location/geofencewindow/flags/GeofenceWindowingConfigData.smali`
- **مستوى الإثبات:** **Level A** — `Confirmed` (الحقول) / **Level B** (القيم الافتراضية خادمية)

#### المجال 4: الشبكة

##### L3-FUN-000029: MQTT 5 اللحظي
- **المسار البرمجي:** `Mqtt5HiveClientKt` ← `RealtimeMqttProvider.addSubscription(topicId, tag)` ← `RealtimeMqttAuthProvider`
- **المصدر الفيزيائي:** `rework/life360/jadx-out/sources/com/life360/android/l360networkkit/internal/`
- **القيود:** صيغة المواضيع Level C (تحتاج اعتراضاً حياً)
- **مستوى الإثبات:** **Level B** — `Derived`

### 5.4 الفجوات الحرجة (Gaps):
- **غير موجودة:** فيزياء كشف الاصطدام (g-force) داخل Arity/Sentiance المغلقين — **Family OS يبنيها ذاتياً** على `HIGH_SAMPLING_RATE_SENSORS`.
- **جزئية:** مسار REST الاصطدام (endpoint ديناميكي)؛ منطق جلسات WatchOverMe (العقود فقط).
- **مرفوضة:** Sentiance/Arity (تبعية مدفوعة مغلقة)؛ Geofencing حصراً (يتطلب GMS)؛ `RECORD_AUDIO` بلا مبرر.
