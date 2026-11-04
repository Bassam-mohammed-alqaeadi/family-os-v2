# تقرير الهندسة العكسية — FamilyWall

## 1. نظرة عامة
- **الحزمة:** `com.familywall` — تطبيق "منظّم العائلة" (Family Organizer)؛ compileSdk 36.
- **الدور في Family OS:** وحدة **الإدارة والتنظيم العائلي**: التقويم المشترك، المهام، القوائم،
  الحائط/الخلاصة، المراسلة، معرض الصور، الميزانية، مخطط الوجبات، الجداول الدراسية (`timetables`)،
  الأماكن، وزر الذعر SOS.
- **حجم المخرجات:** ~14,470 ملف Java عبر jadx + موارد apktool كاملة؛ أخطاء jadx = 21 فقط
  (0.06% — من أنظف المخرجات، والتشويش شبه معدوم: أسماء الحزم والكلاسات حقيقية وهذا نادر).
- **الخلاصة المبكرة:** أنظف معمارية بين التطبيقات المفككة — فصل صارم بين "SDK النطاق" والواجهات،
  ويستحق أن يكون **القالب المعماري** لوحدات Family OS.

## 2. البنية المعمارية
ثلاث طبقات رئيسية + بنية تحتية:

- **ميزات الواجهة** (`com.familywall.app.*`): حزمة لكل ميزة —
  `wall`، `message`، `event`، `task`، `photo`، `media`، `family`، `location`، `place`، `budget`،
  `mealplanner`، `timetables`، `premium`، `settings`، `invitation`، `contact`، `filer`، `postmedia`،
  `widgets`، `permissions`، `roomdatabase`، `devtools`، `ads`، `account`، `emailverification`.
- **SDK النطاق** (`com.jeronimo.fiz.api.*`): نماذج API مكتوبة لأكثر من 25 نطاقًا —
  `account`، `addressbook`، `admin`، `auth`، `billing`، `budget`، `event`، `filer`، `im`، `media`،
  `message`، `place`، `profile`، `push`، `settings`، `sync`، `task`، `wall`، `device`، `google`،
  `launchpad`، `maintenance`، `mealplanner`، `outlook`، `externalimport`، `ccare`، `bgthread`، `common`.
- **النقل** (`com.jeronimo.fiz.core.codec`): عميل HTTP مخصص فوق JSON (بدون Retrofit) —
  `IApiClientRequest`، `IJsonCodecFormat`، `ICodecFormat`، `FutureResult`، `HttpIOException`،
  `ICodecConfiguration`.
- **البيانات المحلية** (`com.familywall.provider.*`): `FamilyProvider` (ContentProvider) +
  `FamilySQLiteOpenHelper` + نمط مولّد لكل كيان:
  `*Columns` / `*ContentValues` / `*Cursor` / `*Model` / `*Selection`
  (مجلدات: `data`، `datalist`، `jobs`، `jobsdepends`).
- **كاش Room** (`com.familywall.app.roomdatabase`): `dao/` + `entities/` —
  طبقتا تخزين: ContentProvider للمزامنة + Room لكاش الواجهة.
- **الخلفية** (`com.familywall.backend.*` + `com.familywall.applicationmanagement`):
  `cache`، `event` (التذكيرات)، `preferences`، FCM، مستقبل الإقلاع، مدير الخلفية.
- **المزامنة** (`com.familywall.sync` + `fiz/api/sync`):
  `Authenticator`/`AuthenticationService` (حساب أندرويد حقيقي) + `ISyncBean` (بروتوكول دلتا).
- **دوائر العائلة** (`com.familywall.multifamily`): `CircleInfo` — نموذج الدائرة/العضوية متعددة العوائل.
- **إطار الصلاحيات** (`com.familywall.app.permissions`): `FWPermission.java` — انظر القسم 4.

### بروتوكول المزامنة الدلتا
`com/jeronimo/fiz/api/sync/ISyncBean.java` — تصميم يستحق النسخ حرفيًا:
`getSyncToken()` + `getUpdatedCreated()` + `getDeletedIds()` + `getIsSync()` —
مزامنة بالرمز (token-based delta sync) بدل إعادة التحميل الكامل، مع `@EncodableClass` للترميز.

## 3. الميزات الرئيسية وربطها بوحدات Family OS
- **الحائط العائلي** (`app/wall` + `fiz/api/wall`):
  `MoodEnum`، `RefObjectTypeEnum`، `RefObjectActionEnum` —
  منشورات نصية/مزاجية مرتبطة بكائنات (أماكن، أحداث) ← خلاصة العائلة.
- **المراسلة** (`app/message`: إنشاء/قوائم الخيوط `ThreadCreateActivity`/`ThreadListActivity`
  + `fiz/api/im`: `IIMThread`، `IIMParticipant`، `IMMessageTypeEnum`، `ParticipantStatusEnum`، `SyncRequest`) —
  وتدعم `ACTION_SEND` من التطبيقات الخارجية ← التواصل.
- **التقويم** (`app/event` + `fiz/api/event` — **أغنى نطاق**, ~20 كلاسًا):
  `RecurrencyDescriptor` (التكرار)، `ReminderBean` + `ReminderTypeEnum`/`ReminderUnitEnum` (التذكيرات)،
  `IcalImportResultBean`، `CalendarUtil`، `AttendeeBean`/`AttendeeStatusEnum` (الحضور)،
  `TimetableBean`، `CalendarSubscriptionResponseBean` ← الإدارة/التعليم.
  - استيراد ICS (`IcsReceiverActivity`)، ربط تقويم Google (`ConnectExternalCalendarActivity`)،
    و**استيراد الأحداث بالذكاء الاصطناعي من البريد** (`EventImportAISettingsActivity`) —
    سابقة AI داخل التطبيق نفسه تستحق الدراسة.
- **المهام** (`app/task`: فئات، تعيين أعضاء `AssigneesSelectorActivity`، تفاصيل +
  `fiz/api/task`: `AssigneeBean`، `CategoryDescriptor`، `RecurrencyEnum`، `TaskListSettingsBean`،
  **`TaskSuggestionBean`** — اقتراحات مهام، likely مدعومة بمنطق ذكي) ← الإدارة.
- **المعرض** (`app/photo`، `app/media`) + `PostMediaService`
  (`ACTION_POST`/`ACTION_ABORT`/`ACTION_RETRY`) + منتقي وسائط مخصص (`mediapicker`) ← معرض العائلة.
- **الموقع**: `GeotrackingJobIntentService` + `GeofencingJobIntentService` + `LocationMapActivity` +
  طلب الموقع من فرد (`LocationRequestCallActivity`/`LocationRequestConfirmActivity`) +
  تسجيل الوصول (`CheckinDetailActivity`) ← الأمان.
  **ملاحظة:** كلاسات `geotracking`/`geofencing` **غائبة من jadx** (فشل التفكيك) — رُصدت من الـ manifest فقط.
- **الأماكن** (`app/place`: اختيار `PlacePickActivity`/تحرير/تفاصيل/عناوين) ← الأمان.
- **زر الذعر SOS** (`app/panic` في الـ manifest: `PanicCountdownActivity`، `PanicOngoingActivity`،
  `PanicOngoingNotificationJobIntentService`) ← الأمان.
- **العائلة والدعوات** (`app/family`، `app/invitation`، `multifamily/CircleInfo`:
  `familyId`، `role`، `isPremium`، `memberCount`) ← **نموذج الدوائر والأدوار الجاهز لنظام الصلاحيات**.
- **الميزانية** (`app/budget` + `fiz/api/billing`) + **مخطط الوجبات** (`app/mealplanner`) +
  **الجداول** (`app/timetables`) ← إدارة الحياة العائلية.
- **ودجت الشاشة** (`appwidget/UtilsKt.java`) ← التواجد على الشاشة الرئيسية.

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- **`com/familywall/app/permissions/FWPermission.java`** — **إطار صلاحيات UX جاهز**:
  enum يربط كل صلاحية (LOCATION، FOREGROUND_LOCATION، GEOFENCING_GEOTRACKING،
  GEOFENCING_GEOTRACKING_BACKGROUND، BACKGROUND_LOCATION، CALENDAR، CONTACT، STORAGE،
  RECORD_AUDIO، NOTIFICATIONS) بأيقونة + عنوان/وصف التبرير + مصفوفة صلاحيات الأندرويد،
  **مع تفرع حسب إصدار النظام** (SDK≥33: صلاحيات الوسائط الجديدة، وإلا التخزين القديم).
  **يُقتبس مباشرة لنظام الصلاحيات المرن في Family OS.**
- `com/jeronimo/fiz/core/codec/IApiClientRequest.java` — تجريد الطلبات:
  `doRequest()` / `doRequestAsync()`، `setTransactional(boolean)`، `setScope(MetaId)`،
  `getCallPrefix()` — عميل API كامل قابل للاقتباس كواجهات.
- `com/jeronimo/fiz/api/sync/ISyncBean.java` — بروتوكول الدلتا (التوكن/المحذوفات/المحدّثات).
- `com/familywall/provider/datalist/DataListModel.java` — offline-first:
  `getWritebackstate()`/`getWritebackstatus()` (طابور الكتابة الراجعة)، `getFetchDate()`،
  `getFamilyId()`، `getObjectType()`.
- `com/familywall/multifamily/CircleInfo.java` — `familyId`، `role`، `isPremium`، `memberCount`،
  `isFirstFamily` — **نواة نموذج الدوائر والصلاحيات**.
- `com/jeronimo/fiz/api/event/RecurrencyDescriptor.java` + `ReminderBean.java` —
  منطق تكرار الأحداث والتذكيرات جاهز.
- `com/jeronimo/fiz/api/task/TaskSuggestionBean.java` — نموذج اقتراح المهام (يُدرس كمصدر إلهام لاقتراحات الـ AI).
- `com/familywall/Config.java:38` — `URL_WEBSERVICES = "https://api.familywall.com"`.
- `com/familywall/sync/Authenticator.java` + `AuthenticationService.java` —
  حساب أندرويد حقيقي عبر `AccountManager`.
- `com/familywall/app/postmedia/PostMediaService.java` — رفع الوسائط (نشر/إيقاف/إعادة).
- `com/familywall/backend/event/ReminderJobIntentService.java` + `ReminderBroadcastReceiver.java` —
  جدولة التذكيرات.
- `com/familywall/app/location/DurationGetter.java` — أداة المدد الزمنية للموقع.

## 5. الصلاحيات والمكونات الحساسة
- **الصلاحيات:** الموقع الدقيق/التقريبي/**الخلفي**، جهات الاتصال (قراءة/كتابة)، التقويم (قراءة/كتابة)،
  الوسائط، الإشعارات، `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM` (للتذكيرات)، الفوترة،
  `AUTHENTICATE_ACCOUNTS`، `RECORD_AUDIO`.
- **خدمة التتبع الأمامية:** `GeotrackingRequestForegroundService` (نوع `location`) —
  **مصدَّرة** (`exported=true`) — في Family OS تُقيَّد بصلاحية موقعة.
- **مكوّنات مصدَّرة لافتة:** `GeofencingBroadcastReceiver` / `GeotrackingBroadcastReceiver` (مصدَّرة)،
  `AuthenticationService`، و`DebugReceiver` يستجيب لـ **رمز سري `4242`** (`android_secret_code`) —
  **باب تصحيح خلفي: يُحذف ولا يُعاد استخدامه أبدًا**.
- **روابط عميقة** على `api.familywall.com`: main / im / home / map / calendar / list / budget /
  documents / specialdays / promo — **خريطة أقسام جاهزة** لبنية التنقل.

## 6. الشبكة ونقاط التكامل
- الخادم: `https://api.familywall.com`؛ الدفع عبر FCM
  (`FcmListenerService`، `FcmFirebaseInstanceIdService`).
- مزامنة النظام: `ContactSynchronizationService` و`CalendarSynchronizationService`
  (تُظهر جهات/تقويم العائلة داخل تطبيقات أندرويد الأصلية — **تكامل عميق مع النظام**).
- خرائط Google (`key_maps_v2`)، تحليلات AppsFlyer، إعلانات AdMob، تكامل فوترة Play،
  ومشاركة `ACTION_SEND` ثنائية الاتجاه (يستقبل نصًا وصورًا وفيديو).

## 7. توصيات إعادة الاستخدام
1. **الأولوية القصوى:** طبقة `com.jeronimo.fiz` كاملة — فصل "SDK النطاق" عن الواجهات هو
   **القالب المعماري لوحدات Family OS** (كل وحدة: `api` للنطاق + `app` للواجهة).
2. `FWPermission` (enum الصلاحيات مع التبريرات والتفرع حسب الإصدار) = **أساس نظام الصلاحيات المرن**.
3. بروتوكول `ISyncBean` + نموذج `DataListModel` (writeback) = **مزامنة offline-first جاهزة التصميم**.
4. `CircleInfo` (الدور/العائلة/العضوية) = **بذرة الدوائر العائلية**.
5. `AccountManager` للمصادقة، و`PostMediaService` للرفع، و`ReminderJobIntentService` للتذكيرات.
6. نطاق `fiz/api/event` (التكرار/التذكيرات/ICS) يُقتبس لوحدة التقويم والتعليم؛
   و`EventImportAISettingsActivity` تُدرس كأول تكامل AI.
7. **لا يُعاد استخدام:** `DebugReceiver` (4242)، مفاتيح الإعلانات/التحليلات، المكوّنات المصدَّرة بلا داعٍ.

## 9. خريطة الملفات المرجعية (مسارات دقيقة)
- `sources/com/jeronimo/fiz/api/` — كل نطاقات الـ SDK (يُتصفح حسب الميزة).
- `sources/com/jeronimo/fiz/core/codec/IApiClientRequest.java` — واجهة عميل API.
- `sources/com/jeronimo/fiz/api/sync/ISyncBean.java` — بروتوكول الدلتا.
- `sources/com/jeronimo/fiz/api/event/` — نطاق التقويم (~20 كلاسًا).
- `sources/com/jeronimo/fiz/api/task/` — نطاق المهام (اقتراحات).
- `sources/com/jeronimo/fiz/api/im/` — نطاق المراسلة.
- `sources/com/familywall/app/permissions/FWPermission.java` — enum الصلاحيات.
- `sources/com/familywall/multifamily/CircleInfo.java` — نموذج الدائرة.
- `sources/com/familywall/provider/datalist/DataListModel.java` — نموذج المزامنة المحلية.
- `sources/com/familywall/provider/FamilyProvider.java` — الـ ContentProvider.
- `sources/com/familywall/sync/Authenticator.java` — مصادقة الحساب.
- `sources/com/familywall/app/postmedia/PostMediaService.java` — رفع الوسائط.
- `sources/com/familywall/backend/event/ReminderJobIntentService.java` — التذكيرات.
- `sources/com/familywall/Config.java` — ثوابت الخادم (`URL_WEBSERVICES`).
- `apktool-out/AndroidManifest.xml` — كل المكوّنات والصلاحيات والروابط العميقة.

## 10. ملاحظات
- التشويش شبه معدوم — جودة مخرجات استثنائية.
- كلاسات `app/location/geotracking` و`app/location/geofencing` مفقودة من jadx —
  منطق التتبع الدقيق **غير متاح** هنا؛ يُستكمل من Life360.
- لم أحدد كلاس منفّذ HTTP المباشر (الواجهات موجودة؛ التنفيذ ربما في dex فشل تفكيكه) — **حد معلن**.
- بقية الـ manifest (بعد ~السطر 400) لم تُقرأ بالكامل؛ الفحص ركّز على المكوّنات الأساسية.
