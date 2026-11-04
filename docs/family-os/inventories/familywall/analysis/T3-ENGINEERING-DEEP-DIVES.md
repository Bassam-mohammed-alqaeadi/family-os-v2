# التحليلات الهندسية المعمقة — FamilyWall (T3 Engineering Deep-Dives)

> **المعرف:** `T3-FW-DEEP-001`
> ثلاثة مسارات تحليلية بمستوى المنفِّذ: الهوية والترميز (A)، الصلاحيات بنسختيها (B)، المزامنة والكاش (C).

---

## المسار A: `MetaId` ونظام الترميز `@Encodable`

### A.1 تشريح `MetaId` [VERIFIED — `com/jeronimo/fiz/api/common/MetaId.java`]
- الحقول الستة: `typeWhenSomethingElse` (String)، `type` (MetaIdTypeEnum)، `ownerId` (Long)، `objectId` (Long)، `metaContent` (Long)، `external` (String).
- البناة: `(type, ownerId)` / `(type, ownerId, objectId)` / `(type, ownerId, objectId, metaContent)` / الكامل مع external.
- **القواعد الصارمة:** `ownerId` غير قابل للـ null (يرمي `FizRuntimeException`)؛ `SOMETHING_ELSE` مرفوض كنوع صريح؛ لأنواع المالك-فقط يجب أن يكون `objectId` null (مثل `family` نفسها).
- `Comparable<MetaId>` + `Serializable` — تُستخدم كمفاتيح فرز وتُسرسل.
- `MetaIdTypeEnum` (~90 قيمة): يغطي كل نطاقات المنتج — من `account` و`family` و`event` إلى `dish` و`recipe` و`budgetTransaction` و`calendarTimetable` وحتى `alexaCredential` — مع `check()` صارم و`fromOrdinal()`.

### A.2 `@Encodable` — عقد الترميز المعلن [VERIFIED — `api/annotation/Encodable.java`]
السمات: `value` (اسم الحقل السلكي)، `isNullable`، `maxUTF8length`، `serverinput` (false = قراءة فقط من الخادم)، `isExtends`، `isInlined`، `isDynamic`/`isDynamicScope`.
- أمثلة سلكية مرصودة: `setAdminRight` ← `"right"`؛ `setFamilyRole` ← `"role"`؛ `setCustomFamilyRole` ← `"customRole"`؛ `setCurrentLocation` ← `"location"`.
- `@EncodableClass(id=...)` تحمل معرفاً عددياً (مثل `-1192827385` لـ `IFamilyMember`، `1896517879` لـ `ISyncBean`) — [INFERENCE: معرف تسجيل الترميز/التوجيه].

### A.3 ماذا ينسخ المنفِّذ؟
1. فكرة `MetaId` (هوية مركبة + enum أنواع + فحص صارم) — تُعاد كتابتها في Dart/Kotlin.
2. فصل اسم الحقل السلكي عن اسم الدالة (`value=`) — يمنع كسر البروتوكول عند إعادة التسمية.
3. `serverinput=false` للحقول المحسوبة خادمياً (مثل `recurrencyDeletedOccurence`).

---

## المسار B: الصلاحيات بنسختيها — التفكيك السطري

### B.1 `FWPermission` (11 حزمة) [VERIFIED — `app/permissions/FWPermission.java`]
كل قيمة = `(icon, title, explicitText, androidPermissions[])`. التفرع `SDK_INT >= 33` في المُنشئ لـ `STORAGE` و`RECORD_AUDIO`.
**خمسة** من الأحد عشر تدور حول الموقع (LOCATION/FOREGROUND_LOCATION/GEOFENCING_GEOTRACKING/GEOFENCING_GEOTRACKING_BACKGROUND/BACKGROUND_FOREGROUND_LOCATION/BACKGROUND_LOCATION) — يعكس أن الموقع قلب المنتج.

### B.2 `PermissionManager` — سطر بسطر [VERIFIED — `apktool-out/smali_classes7/.../permissions/PermissionManager.smali`]
```
checkPermission(ctx, perm):
  for p in perm.getAndroidPermissions():
    if p == "android.permission.ACCESS_FINE_LOCATION": continue  # يُعتبر ممنوحاً دائماً
    if ContextCompat.checkSelfPermission(ctx, p) != GRANTED: return FALSE
  return TRUE

askPermissionAndroid(activity, perm, requestCode):
  if shouldRedirectToSettings(activity, perm):   # شوهد من قبل + غير ممنوح
      askPermissionPopup()                        # → حوار التبرير → الإعدادات
  elif !checkPermission && shouldShowRationale && !fromRationale:
      askPermissionPopup()
  else:
      ActivityCompat.requestPermissions(activity, perm.getAndroidPermissions(), requestCode)
      setHasSeenPermission(ctx, perm)

shouldShowRationale: alwaysRequestRationalePermissions.contains(p) → true
                     وإلا shouldShowRequestPermissionRationale(p) لأي p
الحالة: SharedPreferences "PermissionManager.FWPERMISSION" / key = perm.name()
```
- `PermissionRationaleDialog.newInstance(FWPermission, ...)` يسحب (الأيقونة، العنوان، الوصف) من الـ enum — `BaseActivity.showPermissionRationale` (سطر 1170 smali).
- الاستهلاك: عشرات الشاشات؛ مثال `ContactListActivity` → `PermissionManager.checkPermission(ctx, FWPermission.CONTACT)` ثم طلب برمز `0x2d`.

### B.3 الحقوق الخادمية [VERIFIED]
- `FamilyAdminRightEnum{None, Admin, SuperAdmin, SubAccount}` + `isAdmin()` (Admin||SuperAdmin).
- `IAdminApi` (`@ApiInterface(name="admin")`): `change`/`getright`/`list`/`remove`/`wipefamily`/`delete2` — أسماء سلكية قصيرة.
- `FizRightBean{canDelete, canUpdate}` — **الـ FALSE تُصفَّر إلى null قبل الترميز** (لا يُسرسل المنع أبداً).
- الإنفاذ: `FizNotEnougthRightException` / `FizApiModelRightException` من الخادم؛ العميل يعرض فقط.
- الفصل: `FamilyRoleTypeEnum` (Mom/Dad/…/Pet/Custom) = عرضي؛ `FamilyAdminRightEnum` = تنفيذي.

### B.4 ماذا ينسخ المنفِّذ؟
1. الثلاثية (`FWPermission` + `PermissionManager` + `PermissionRationaleDialog`) حرفياً — مع قائمة `alwaysRequestRationalePermissions` ومنطق "إعادة التوجيه للإعدادات".
2. نموذج الحقوق المزدوج: حق دائرة خادمي + حق كائن مرفق (`FizRightBean`) — أساس محرك الأدوار المرن.
3. **تحذير:** سلوك `ACCESS_FINE_LOCATION` المتخطى — يُراجع قبل النسخ (قد يكون خطأً).

---

## المسار C: محرك WriteBack والمزامنة

### C.1 الجداول الأربعة [VERIFIED حرفياً — `provider/FamilySQLiteOpenHelper.java`]
```sql
data:      (_id, family_id, object_type, object_id, fetch_date, object BLOB, list_id, extra,
            writeBackState, writeBackStatus,
            UNIQUE(family_id, object_type, object_id, list_id) ON CONFLICT REPLACE)
data_list: (_id, family_id, object_type, fetch_date, list_id, extra_long, extra,
            writeBackState, writeBackStatus,
            UNIQUE(family_id, object_type, list_id) ON CONFLICT REPLACE)
jobs:      (_id, clientModifId TEXT NOT NULL UNIQUE ON CONFLICT ROLLBACK, next_id, previous_id,
            job BLOB NOT NULL, creation_date, retry_nb, status)
jobsdepends: (_id, clientModifId, usingClientModifId, valueFromServer)
INDEX: IDX_JOBS_CLIENTMODIFID, IDX_JOBSDEPENDS_CLIENTMODIFID, IDX_JOBSDEPENDS_USINGCLIENTMODIFID
```
- `jobs.next_id/previous_id` = **سلسلة مرتبطة** للترتيب؛ `jobsdepends` = **حل تبعيات** (مهمة تستخدم id خادمياً أنتجته مهمة سابقة — `valueFromServer`).
- `FamilyProvider`: authority `com.familywall.provider`، مسارات `data`, `data/#`, `data_list`, `data_list/#`, `jobs`, `jobs/#`, `jobsdepends`, `jobsdepends/#`.

### C.2 آلة حالة الكتابة [VERIFIED]
`WriteBackCacheStateEnum{NO_OP, PENDING_CREATE, PENDING_UPDATE, PENDING_DELETE}` (+ `WriteBackCacheStatusEnum`، `JobStatusEnum`).
`DataListModel`: `getWritebackstate()/getWritebackstatus()` + `getFetchDate()` + `getFamilyId()` + `getObjectType()` + `getListId()`.

### C.3 `CacheObjectType` — مصفوفة القدرات [VERIFIED — قُرئ كاملاً، ~50 نوعاً]
كل نوع: `(MetaIdTypeEnum, isFamilyRelated, isList, isGenericMetaApi, isSyncable)`.
- كامل الأعلام: `EVENT, TASK, TASKLIST, CONTACT, PLACE, BUDGET*, MEALPLANNER_*, CATEGORY, TIMETABLE...`
- `syncable=false`: `WALL_MESSAGE, MEDIA, LOCATION` (تُجلب عند الطلب).
- بلا كاش أبداً: `IM_THREAD, IM_MESSAGE` (كل الأعلام false).
- `isSingleton() = !isList` — الكيانات المفردة (SETTINGS, FAMILY) مقابل القوائم.

### C.4 الدفع والمزامنة [VERIFIED]
- `FcmListenerService.onMessageReceived` → `ICodecEngine.decode` → `PushMessageBean` → `handleRegularMessage` → `PushBackgroundService.onPushWakeUpFetchAndShowNotification`.
- `CacheInvalidatedMessageBean{classname, ownerId}` — الدفع **يُبطل** الكاش (لا يحمل بيانات).
- `ISyncBean` (دلتا: `syncToken`/`updatedCreated`/`deletedIds`/`isSync`) — **مُعرَّف بلا مستهلك عميل مرصود** [VERIFIED بالغياب].
- `SyncRequest{itemId, date, syncToken}` في `fiz/api/im` — مزامنة الخيوط.
- SyncAdapters: `contact_syncadapter` + `calendar_syncadapter` — تكامل النظام الأصلي.

### C.5 ماذا ينسخ المنفِّذ؟
1. مخطط الجداول الأربعة **حرفياً** (SQL أعلاه) — بما فيها `jobsdepends` لحل التبعيات.
2. `CacheObjectType` كمصفوفة قرار: ما يُكاش/يُزامن/عائلي — تُعاد كتابتها لموارد Family OS.
3. نمط "الدفع للإبطال" بدل "الدفع بالبيانات".
