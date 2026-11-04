# تحليل الهندسة العكسية العميق — FamilyWall (com.familywall)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/familywall.md`) الذي سجّل اكتشافين مبكرين: "typed domain SDK" و"FWPermission".
> هذه الوثيقة **تحققهما وتفكّكهما بالكامل**: الطبقة `com.jeronimo.fiz` موثقة حقلاً بحقل،
> ونموذج الصلاحيات موثق **بنسختيه** — صلاحيات نظام أندرويد UX (`FWPermission`) **و** صلاحيات الدوائر
> الخادمية (`FamilyAdminRightEnum` / `IAdminApi`) — مع مسارات الإنفاذ العميلة الدقيقة.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).
> الملفات في `~/workspace/rework/familywall/` (`jadx-out/sources/...` و`apktool-out/...`).

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.familywall` |
| الإصدار المحلَّل | v2026.10.1 [INFERENCE: من اسم الإصدار المعتمد للمهمة؛ versionName لم يُلتقط من الـ manifest في هذا الفحص — يُراجع] |
| smali / java | **82,641** / **14,470** (عُدَّت فعلياً) |
| الخادم | `https://api.familywall.com` [VERIFIED: `com/familywall/Config.java:38` — `URL_WEBSERVICES`] |
| الدفع | FCM: `com.familywall.applicationmanagement.FcmListenerService` + `FcmFirebaseInstanceIdService` [VERIFIED] |
| المصادقة | حساب أندرويد حقيقي عبر `AccountManager` [VERIFIED: `com/familywall/sync/Authenticator.java`، `AuthenticationService.java`] |
| التشويش | **شبه معدوم** — أسماء الحزم والكلاسات حقيقية، أنظف مخرجات بين التطبيقات الثمانية [VERIFIED] |

### البنية الطبقية [VERIFIED]
```
com.jeronimo.fiz.api.*        ← Typed Domain SDK (عقود النطاق: interfaces + beans + enums)
com.jeronimo.fiz.core.codec.* ← طبقة النقل/الترميز (عميل HTTP مخصص، لا Retrofit)
com.familywall.app.*          ← ميزات الواجهة (activity/fragment/viewmodel لكل ميزة)
com.familywall.backend.*      ← الكاش (impl2 + WriteBack)، الأحداث/التذكيرات، الإعدادات
com.familywall.provider.*     ← FamilyProvider (ContentProvider) + SQLite (data/data_list/jobs/jobsdepends)
com.familywall.app.roomdatabase ← كاش Room ثانوي للواجهة (dao + entities)
com.familywall.sync.*         ← Authenticator + AuthenticationService (حساب أندرويد)
com.familywall.multifamily.*  ← CircleInfo (الدوائر متعددة العوائل)
com.familywall.app.permissions.* ← FWPermission + PermissionManager + PermissionRationaleDialog
```

**الملاحظة المعمارية المركزية:** FamilyWall لا يبني "شاشات فوق API" — بل يبني **SDK نطاق مكتوب بعناية** (`com.jeronimo.fiz`) يفصل العقود عن الواجهات فصلاً صارماً. كل نطاق (~27 نطاقاً) له: واجهات `@ApiInterface`، وbeans `@EncodableClass`، وenums مكتوبة، واستثناءات مسماة. هذا هو **القالب المعماري الأقرب لروح Family OS** من بين التطبيقات الثمانية [INFERENCE مدعومة بالبنية المرصودة].

---

## 2. الغوص العميق — Typed Domain SDK (`com.jeronimo.fiz`)

### 2.1 فلسفة التصميم [VERIFIED]
- **العقود أولاً:** كل كيان نطاقي = واجهة Java (`I*`) موسومة `@EncodableClass(id=...)` مع setters موسومة `@Encodable(...)` تحدد: اسم الحقل السلكي (`value=`)، القابلية للـ null (`isNullable`)، حد طول UTF-8 (`maxUTF8length`)، واتجاه الترميز (`serverinput=false` = للقراءة فقط من الخادم).
  المسارات: `jadx-out/sources/com/jeronimo/fiz/api/annotation/{Encodable,EncodableClass,ApiInterface,ApiMethod,Generator}.java`.
- **RPC صريح:** واجهات مثل `IAdminApi` موسومة `@ApiInterface(name="admin")` ودوالها `@ApiMethod(name="change")` — أسماء الطرق السلكية **مكتوبة صراحة** ومستقلة عن أسماء دوال Java.
- **أخطاء مسماة:** عشرات الاستثناءات الخاصة بالنطاق (`FizApiModelRightException`، `FizNotEnougthRightException`، `FizApiPremiumRequiredException`، `FizApiDuplicateModelException`، `FizPersistenceOptimisticLockException`…) — عقد أخطاء قابل للاقتباس حرفياً.
- **التنفيذ:** `com.jeronimo.fiz.core.codec.impl.streamable.*Implem` — مُولَّد آلياً (`Generator.java` في annotations) — العميل يطلب stub عبر `IApiClientRequest.getStub(Class)`.

### 2.2 `MetaId` — الهوية الموحدة لكل كيان [VERIFIED]
`jadx-out/sources/com/jeronimo/fiz/api/common/MetaId.java`:
- حقول: `type` (`MetaIdTypeEnum`)، `ownerId`، `objectId`، `metaContent`، `external` (String)، `typeWhenSomethingElse`.
- قواعد صارمة في الباني: `ownerId` لا يقبل null؛ `SOMETHING_ELSE` مرفوض كنوع صريح؛ لبعض الأنواع يجب أن يكون `objectId` null (هويات على مستوى المالك).
- `MetaIdTypeEnum` — **~90 نوع كيان** مكتوباً: `account, wall, wallComment, thread, message, profile, family, event, eventComment, place, contact, task, taskComment, media, mediaAlbum, settings, location, invitation, imThread, familymember, placeGeofencing, calendar, taskList, dish, recipe, meal, budget, budgetTransaction, paymentMethod, folder, calendarTimetable, taskCategory, deviceConfig...` [VERIFIED — عُدَّت من الملف].
- خاصية `external` في الـ enum تميّز الكيانات الخارجية (Alexa/externalRecipe).
- `MetaIdTypeEnum.check(metaId, type)` — فحص نوعي صارم يرمي `InvalidParameterException`.

**لماذا يهم Family OS:** هوية موحدة عابرة للنطاقات تجعل المزامنة والتفويض والتدقيق تُبنى مرة واحدة — انسخ المفهوم (وليس بالضرورة الـ 90 نوعاً).

### 2.3 `FizRightBean` — حقوق على مستوى الكائن [VERIFIED]
`jadx-out/sources/com/jeronimo/fiz/api/common/FizRightBean.java`:
```java
private Boolean canDelete = null;
private Boolean canUpdate = null;
```
- `setCanDelete/setCanUpdate` **تُصفّر الـ FALSE إلى null** قبل الترميز — أي "ممنوع" لا يُسرسل سلكياً أبداً، فقط "مسموح" يُسرسل. [VERIFIED — تفصيل دقيق]
- هذا هو **نموذج الحقوق على مستوى الكائن** (per-object rights) — الخادم يرفق بكل كائن ما يستطيع المستخدم فعله به. يُقتبس مباشرة لمحرك الأدوار المرن في Family OS: الحق يُحسب خادمياً ويُستهلك عميلاً بلا منطق.

### 2.4 طبقة النقل `IApiClientRequest` [VERIFIED]
`jadx-out/sources/com/jeronimo/fiz/core/codec/IApiClientRequest.java`:
- `doRequest()` / `doRequestAsync()` (ترجع `IListenableFuture<Reader>`)، `setTransactional(boolean)`، `setScope(MetaId)`، `getCallPrefix()`، `getStub(Class<T>)`، `getResponseMap()`.
- `setScope(MetaId)` — **نطاق الطلب = هوية كيان**: كل طلب API مُنطَّق بنطاقه (العائلة/الحدث/المهمة) — أساس التفويض الخادمي.
- الترميز: `IJsonCodecFormat` / `IRequestParamCodecFormat` / `MapRequestParamCodecFormat` / `ReaderWriterJsonCodecFormat` / `ByteBufferJsonCodecFormat` — ترميز JSON مخصص فوق HTTP مباشرة (لا Retrofit/OkHttp ظاهر في العقود).

### 2.5 خريطة النطاقات الـ 27 [VERIFIED — عُدَّت فعلياً]
| النطاق | ملفات | الأهم فيه |
|---|:---:|---|
| `account` | 52 | `IFamilyMember`، `IExtendedFamilyMember`، `IInvitation`، `FamilyRoleTypeEnum`، `FamilyAdminRightEnum`، `AccessTokenBean`، `InvitationStatusEnum` |
| `billing` | 26 | الاشتراكات/Foترة |
| `common` | 23 | `MetaId`، `MetaIdTypeEnum`، `FizRightBean`، `PaginatedCollection` |
| `event` | 25 | `RecurrencyDescriptor`، `ReminderBean`، `AttendeeBean`، `CalendarBean`، `EventTypeEnum`، `TimetableBean` |
| `media` | 16 | — |
| `place` | 15 | `IGeoApi`، `ILocation` |
| `mealplanner` | 13 | أطباق/وصفات/وجبات |
| `push` | 13 | `PushMessageBean`، `CacheInvalidatedMessageBean`، `WebSocketPushMessage` |
| `launchpad` | 12 | — |
| `task` | 10 | `TaskSuggestionBean`، `TaskListTypeEnum`، `RecurrencyEnum` |
| `addressbook` | 9 | — |
| `settings` | 7 | `AiInboxResponseBean`، `aiinboxcheck/aiinboxsave` (smali فقط) |
| `auth` | 7 | `IApiKey` |
| `admin` | 6 | `IAdminApi`، `AdminRightBean` |
| `ccare` | 6 | `ICCareApi` |
| `im` | 5 | `IIMThread`، `IIMParticipant`، `SyncRequest` |
| `device` | 4 | — |
| `budget` | 3 | `BudgetTransactionType` (EXPENSE/REVENUE) |
| `wall` | 3 | `MoodEnum`، `RefObjectTypeEnum`، `RefObjectActionEnum` |
| `maintenance`/`status`/`stub`/`web` | 3/2/2/2 | `IWebApi` (فيها `importemail` = `iaimportemail`) |
| `filer`/`google`/`outlook`/`externalimport`/`bgthread`/`message`/`profile` | ≤2 | — |
| `sync` | 1 | `ISyncBean` (بروتوكول الدلتا) |

---

## 3. نموذج الصلاحيات — التفكيك الكامل (نسختان)

> **تصحيح مهم لتقرير الجولة الأولى:** `FWPermission` **ليست** محرك أدوار عائلي — إنها **طبقة UX لصلاحيات نظام أندرويد**.
> محرك الأدوار الحقيقي هو **النسخة الثانية**: `FamilyAdminRightEnum` + `IAdminApi` + `FizRightBean` (خادمية).
> كلتاهما موثقة هنا بدقة لأن Family OS يحتاج الاثنتين.

### 3.1 النسخة أ: `FWPermission` — حزم صلاحيات النظام للواجهة [VERIFIED]
**الملف:** `jadx-out/sources/com/familywall/app/permissions/FWPermission.java` (enum، 11 قيمة):

| القيمة | أيقونة/عنوان/وصف التبرير | صلاحيات أندرويد الفعلية |
|---|---|---|
| `LOCATION` | location | `ACCESS_COARSE_LOCATION` + `ACCESS_FINE_LOCATION` |
| `FOREGROUND_LOCATION` | foreground | نفس السابقتين |
| `GEOFENCING_GEOTRACKING` | geofencing_geolock | نفس السابقتين |
| `GEOFENCING_GEOTRACKING_BACKGROUND` | geofencing_geolock (+وصف خلفي) | نفس السابقتين |
| `BACKGROUND_FOREGROUND_LOCATION` | background_location | نفس السابقتين |
| `BACKGROUND_LOCATION` | background_location | `ACCESS_BACKGROUND_LOCATION` |
| `CALENDAR` | calendar | `READ_CALENDAR` + `WRITE_CALENDAR` |
| `CONTACT` | contact | `READ_CONTACTS` + `WRITE_CONTACTS` |
| `STORAGE` | photo | SDK≥33: `READ_MEDIA_IMAGES` + `READ_MEDIA_VIDEO` / وإلا: `WRITE_EXTERNAL_STORAGE` |
| `RECORD_AUDIO` | audio | SDK≥33: `RECORD_AUDIO` + `READ_MEDIA_AUDIO` / وإلا: `RECORD_AUDIO` + `WRITE_EXTERNAL_STORAGE` |
| `NOTIFICATIONS` | notification | `POST_NOTIFICATIONS` |

**التفرع حسب إصدار النظام يُحسب في مُنشئ الـ enum** (`Build.VERSION.SDK_INT >= 33`) — نمط يُنسخ حرفياً.

### 3.2 `PermissionManager` — محرك الإنفاذ العميل [VERIFIED — قُرئ كاملاً من smali]
**الملف:** `apktool-out/smali_classes7/com/familywall/app/permissions/PermissionManager.smali` (مصدره `PermissionManager.java`):

- **`checkPermission(Context, FWPermission): Boolean`** — يمر على كل صلاحيات أندرويد في الحزمة عبر `ContextCompat.checkSelfPermission`؛ النتيجة AND للكل. **تفصيل دقيق:** `ACCESS_FINE_LOCATION` **يُتخطى ويُعتبر ممنوحاً دائماً** (يُقارن الاسم ويقفز فوق الفحص) — [VERIFIED] على الأرجح لأن التطبيق يقبل الدقة التقريبية.
- **`askPermissionAndroid(activity, fwpermission, requestCode)`** — مسار الطلب الكامل:
  1. إن `shouldRedirectToSettings()` (شوهدت الصلاحية من قبل عبر SharedPreferences **و** غير ممنوحة الآن) → `askPermissionPopup()` — **إعادة توجيه للإعدادات** بدل الطلب (نمط "الرفض الدائم").
  2. وإلا إن لم تُمنح **و** `shouldShowRationale()` **و** ليست من حوار تبرير → `askPermissionPopup()`.
  3. وإلا → `ActivityCompat.requestPermissions(...)` + `setHasSeenPermission()`.
- **`shouldShowRationale()`** — يفحص قائمة `alwaysRequestRationalePermissions` (تُبنى في `PermissionManager$1` — ArrayList تهيئة ثابتة) أولاً، ثم `shouldShowRequestPermissionRationale` لكل صلاحية.
- **الحالة:** SharedPreferences باسم `"PermissionManager.FWPERMISSION"`، المفتاح = `FWPermission.name()` (اسم الـ enum)، القيمة boolean "شوهد".
- **`PermissionRationaleDialog.newInstance(FWPermission, ...)`** — حوار التبرير يسحب الأيقونة/العنوان/الوصف من الـ enum مباشرة (`BaseActivity.showPermissionRationale`).
- **نقاط الاستدعاء:** تُستهلك عبر عشرات الشاشات (مثلاً `ContactListActivity` تطلب `FWPermission.CONTACT` برمز طلب `0x2d`) [VERIFIED من smali].

**ما يُقتبس لـ Family OS:** البنية الثلاثية (enum الحزم + مدير الحالة + حوار التبرير) كاملة — مع فصل "حزمة منطقية" عن "صلاحيات أندرويد" يتيح إضافة حزم جديدة (كاميرا/مايك للطفل) دون تغيير الشاشات.

### 3.3 النسخة ب: صلاحيات الدوائر الخادمية [VERIFIED]
- **`FamilyAdminRightEnum`** (`fiz/api/account/`): `None, Admin, SuperAdmin, SubAccount, SOMETHING_ELSE` + `isAdmin()` الثابتة (Admin **أو** SuperAdmin). موسومة `@EncodableClass` — تُسرسل سلكياً.
- **`IAdminApi`** (`fiz/api/admin/`، `@ApiInterface(name="admin")`): `changeRight(right, accountIds[])`، `getRight(accountId)`، `listAccountPerRight()` → `AdminRightBean{administrators[], others[]}`، `removeFromFamily(accountId, deleteAuthoredPost)`، `wipeFamily()`، `deleteAccount2(deleteAuthoredPost)`.
- **الإنفاذ خادمي:** الاستثناءات `FizNotEnougthRightException` و`FizApiModelRightException` تُرمى من الـ API — العميل لا يقرر الحقوق، يعرض أخطاءها فقط. `FamilyManageMembersCallbacks.changeAdminRight(member, isAdmin)` هي واجهة الإدارة العميلة الوحيدة المرصودة.
- **التمييز المعماري:** `FamilyRoleTypeEnum` (Mom/Dad/Daughter/Son/GrandFather/GrandMother/Pet/Custom…) = **دور اجتماعي/عرضي**، بينما `FamilyAdminRightEnum` = **حق إداري تنفيذي** — فصل نظيف يُحتذى: الدور للعرض، والحق للإنفاذ.

---

## 4. نموذج بيانات العائلة — الأعضاء والدوائر والدعوات

### 4.1 العضو [VERIFIED]
- **`IFamilyMember`** (`@EncodableClass(id=-1192827385`)): `account`، `adminRight` (يُسرسل باسم `right`)، `familyId` (MetaId)، `familyRole` (يُسرسل باسم `role`)، `customFamilyRole` (يُسرسل `customRole`)، `isFirstFamily`، `joinDate`، `lastLoginDate`.
- **`IExtendedFamilyMember`** (`id=1456840928`): يرث `IFamilyMember + IProfile + IAccount` ويضيف: `currentLocation` (ILocation)، `isLoggedAccount`، `isPanicButtonActivated`، `isFWPremiumMemberSubscriber`، `nullAccount`.
- **`CircleInfo`** (`com/familywall/multifamily/CircleInfo.java` — Kotlin data class): `familyId`، `isPremium`، `isFirstFamily`، `memberCount`، `creationDate`، `role` (String) — **لقطة الدائرة للواجهة** (تبديل الدوائر/الترقية).
- **`AdminRightBean`**: `administrators: List<Long>` مقابل `others: List<Long>` — قوائم حسابات، لا كائنات.

### 4.2 الدعوات [VERIFIED]
- **`IInvitation`** (`id=860376258`): `invitationId`، `familyId`، `accountId`، `ownerId`، `firstname` (max 45 UTF-8)، `familyRole` + `customFamilyRole`، **`adminRights`** (تُمنح الصلاحية **عند الدعوة**)، `token`/`tokenId` (رابط القبول)، `invitationStatus`، `originalSms`، `editable`، `isReminderSet`، صور (`IHasMedia`).
- **`InvitationStatusEnum`**: `PENDING`، `PENDING_EMAIL_DELIVERED`، `ERR_EMAIL_INVALID_ADDRESS`، `ERR_EMAIL_BOUNCED`، `ERR_EMAIL_DEFFERED`، `ERR_SMS_INVALID_ADDRESS`، `OPEN_URL` — **آلة حالة تسليم** بفروع أخطاء SMS/البريد.
- **`InvitationSendingBean`**: `inviteeAccountName` — الإرسال باسم حساب.
- مسار القبول: روابط عميقة `https://api.familywall.com/DPl/...` (انظر §7).

---

## 5. التقويم المشترك والمهام والقوائم — المخططات والمزامنة

### 5.1 مخطط الأحداث [VERIFIED]
- **`EventTypeEnum`**: `UNKNOWN, BIRTHDAY, BIRTHDAY_ACCOUNT, EXTERNAL, TASK, SPECIAL_DAYS, ANNIVERSARY, BIRTHDAY_CUSTOM` — الأحداث والمهام **يتشاركان مخطط التقويم** (TASK كنوع حدث).
- **`RecurrencyDescriptor`** (قُرئ كاملاً): `recurrency` (`RecurrencyEnum`: NONE/DAILY/WEEKLY/BIWEEKLY/MONTHLY/SEMI_MONTHLY/YEARLY/DAYWEEK)، `interval`، `endDate`/`endOccurence`، `rrule` (سلسلة RRULE خام!)، `exdate`/`rdate` (SortedSet<Date>)، `byDay`/`byMonthDay` (String)، `recurrencyDeletedOccurence` (SortedSet<Integer> — **للقراءة فقط من الخادم**: `serverinput=false`).
  - `repairRecurrency()` تُطبّع القيم (NONE تُصفّر كل شيء؛ BIWEEKLY تُجبر interval=2).
  - `isTheSame()` تقارن تكرارين مع تسامح 23 ساعة في تاريخ النهاية.
- **`ReminderBean`/`IReminder`**: `reminderType` + `reminderUnit` + `reminderValue` + `alarmId` (المنبه المحلي) + `localId`.
- **`AttendeeBean`**: `accountId`، `attendeeResponse` (`AttendeeResponseEnum`)، `attendeeStatus` (`AttendeeStatusEnum`).
- **`CalendarBean`**، **`TimetableBean`** (الجداول الدراسية)، **`IcalImportResultBean`**، **`CalendarSubscriptionResponseBean`** — استيراد ICS عبر `IcsReceiverActivity` (يستقبل `pathPattern=".*.ics"`)، واشتراكات تقويم خارجية (Google/Outlook: `extCalendarGoogle`، `extCalendarOutlook` في MetaIdTypeEnum).
- **التذكيرات المحلية:** `com.familywall.backend.event.ReminderJobIntentService` + `ReminderBroadcastReceiver` + صلاحيات `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM` [VERIFIED من الـ manifest والتقرير الأول].

### 5.2 مخطط المهام والقوائم [VERIFIED]
- **`TaskSuggestionBean`** (`id=8012`): `value` + `categoryId` + `alternates[]` — **اقتراحات نصية مصنّفة** (ليست AI بالضرورة؛ `getCategoryMetaId` يبني MetaId من نوع `taskCategory`). تُغذّي `TASKLIST_SUGGESTED` في الكاش.
- **`TaskListTypeEnum`**: `TODOS, SHOPPING_LIST, OTHER` — القوائم نوعٌ من المهمة.
- **`CategoryDescriptor`**، **`AssigneeBean{accountId}`**، **`TaskListSettingsBean`**، **`TaskListSortingEnum`/`TaskSortingEnum`**.
- **`TaskSuggestionSyncBean`** — مزامنة الاقتراحات كبروتوكول منفصل.

### 5.3 بروتوكول المزامنة: الكاش + WriteBack + الدفع [VERIFIED]
**الطبقات الثلاث:**
1. **`CacheObjectType`** (`com/familywall/backend/cache/impl2/fwimpl/CacheObjectType.java` — قُرئ كاملاً): **~50 نوع كائن**، كل واحد يحمل 5 أعلام: `MetaIdTypeEnum` المرتبط، `isFamilyRelated`، `isList` (قائمة أم مفرد)، `isGenericMetaApi`، **`isSyncable`**. أمثلة: `EVENT` و`TASK` و`TASKLIST` و`PLACE` و`CONTACT` و`BUDGET*` كلها (familyRelated + list + genericMetaApi + syncable)؛ `WALL_MESSAGE` syncable=false؛ `IM_THREAD/IM_MESSAGE` كل الأعلام false (تُجلب مباشرة بلا كاش).
2. **SQLite المحلي** (`familywall_provider.db`، الإصدار 6) — 4 جداول [VERIFIED حرفياً من `FamilySQLiteOpenHelper.java`]:
   - `data`: `(family_id, object_type, object_id, list_id)` مفتاح فريد + `object BLOB` (الكيان مُرمَّز) + `fetch_date` + `writeBackState`/`writeBackStatus`.
   - `data_list`: لقطات القوائم لكل `(family_id, object_type, list_id)`.
   - `jobs`: طابور الكتابة الراجعة — `clientModifId` فريد + `job BLOB` + `creation_date` + `retry_nb` + `status` + `next_id`/`previous_id` (سلسلة مرتبطة!).
   - `jobsdepends`: تبعيات المهام (`clientModifId` → `usingClientModifId` + `valueFromServer`) — **حل تبعيات الكتابة الراجعة** (مهمة تعتمد على id خادمي لمهمة سابقة).
   - آلة الحالة: `WriteBackCacheStateEnum`: `NO_OP, PENDING_CREATE, PENDING_UPDATE, PENDING_DELETE`.
3. **الدفع/الإبطال:** `FcmListenerService.onMessageReceived` يفك ترميز `PushMessageBean` عبر `ICodecEngine.decode`، ومنها `CacheInvalidatedMessageBean{classname, ownerId}` — **الدفع يُبطل الكاش** لا يحمل البيانات. `PushTypeEnum` يحمل أعلام iOS (isIosSupported/isCollapsible/isIosMutableContent). [VERIFIED]
4. **بروتوكول الدلتا `ISyncBean`** (`@EncodableClass(id=1896517879)`): `getSyncToken()` + `getUpdatedCreated()` + `getDeletedIds()` + `getIsSync()` — **مُعرَّف لكن لم يُرصد له مستهلك عميل في هذا البناء** (بحث شامل بلا نتائج) [VERIFIED بالغياب — INFERENCE: يُستخدم خادمياً أو في مسار لم يُفكك].
5. **تكامل النظام:** `contact_syncadapter` + `calendar_syncadapter` (SyncAdapter حقيقيان) — جهات/تقويم العائلة **تظهر داخل تطبيقات أندرويد الأصلية** [VERIFIED من الـ manifest].

**نموذج الاتساق:** offline-first بالكتابة الراجعة — الكتابة محلياً (PENDING_*) ← طابور jobs مع retries وتبعيات ← دفع للخادم ← إبطال عبر FCM ← إعادة جلب. لا تعارضات مدمجة ظاهرة (آخر كاتب يفوز ضمنياً) [INFERENCE].

---

## 6. خطافات الذكاء الاصطناعي داخل التطبيق [VERIFIED]

1. **استيراد الأحداث بالذكاء الاصطناعي من البريد (Family Email)** — الميزة الأبرز:
   - العميل: `com.familywall.app.event.browse.rightmenu.aiimport.*` (Compose بالكامل — `EventImportAISettingsActivity`، `EventImportCreateEmailActivity`، `AiImportViewModel`، `AiImportEntryDispatcher`) — موجودة smali فقط (فشل jadx) [VERIFIED].
   - التدفق: المستخدم ينشئ **بريداً عائلياً** (`aiinboxsave`) ← يحوّل إليه رسائل/PDFs ← الخادم يستخرج الأحداث بالذكاء ← `IWebApi.importemail` (`@ApiMethod(name="iaimportemail")`: `email, from, ical`) تُرجع `IcalImportResultBean`.
   - `AiInboxResponseBean{available, current, alternative, domain}` — إدارة العنوان.
   - نصوص الواجهة (55 سلسلة `calendar_email_import_*`): "Turn an email into a calendar event" / "Forward emails, PDFs and more, and we'll create events for you" / **"A Circle admin needs to set up the Family Email first"** — التفعيل **مقيّد بمدير الدائرة** (ربط مباشر بنموذج الصلاحيات §3.3!).
2. **`TaskSuggestionBean`** — اقتراحات مهام مصنّفة (قاعدة بيانات اقتراحات، ليست استدلالاً حياً على الجهاز) [VERIFIED].
3. **`DailyBriefingSettingsActivity`** — موجز يومي (إشعار `daily_briefing_notification_title`) [VERIFIED من الـ manifest؛ المنطق لم يُقرأ].
4. **صفر** ONNX/TFLite على الجهاز في العينات المفحوصة [INFERENCE من غياب المكتبات في المسارات المرصودة — لم يُجرَ بحث شامل].

---

## 7. الشبكة والمكونات الحساسة [VERIFIED]

- **المكونات (186 نشاطاً، 30 خدمة، 26 مستقبلاً، 43 صلاحية):**
  - `GeotrackingRequestForegroundService` (نوع `location`) **مصدَّرة** — تُقيَّد في Family OS.
  - `GeofencingBroadcastReceiver` / `GeotrackingBroadcastReceiver` مصدَّرتان.
  - **`DebugReceiver` يستجيب للرمز السري `4242`** (`android_secret_code`) — **باب خلفي للتصحيح: يُحذف ولا يُعاد استخدامه أبداً**.
- **الروابط العميقة** على `api.familywall.com` (http+https): `/DPl` (main)، `/DPl/im`، `/DPl/home`، `/DPl/map`، `/DPl/calendar`، `/DPl/list`، `/DPl/budget`، `/DPl/documents`، `/DPl/specialdays`، `/DPl/premium` — خريطة أقسام جاهزة.
- **استقبال ICS:** `IcsReceiverActivity` (`pathPattern=".*.ics"`).
- **استقبال مشاركة:** `ACTION_SEND` ثنائي الاتجاه (يستقبل نصاً/صوراً/فيديو).
- **ملاحظة حدود:** منطق `app/location/geotracking` و`geofencing` الدقيق غائب من jadx (ظهر في الـ manifest فقط) — يُستكمل من Life360.

---

## 8. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | المسار الدقيق | السبب |
|---|---|---|---|---|
| 1 | **بنية Typed Domain SDK** (عقود `@EncodableClass`/`@ApiInterface`/`@ApiMethod` + beans + enums + أخطاء مسماة) | 1 | `com/jeronimo/fiz/api/**` + `annotation/{Encodable,EncodableClass,ApiInterface,ApiMethod}.java` | أنظف فصل عقود/واجهات بين التطبيقات الثمانية — القالب المعماري لوحدات Family OS. |
| 2 | **`MetaId` + `MetaIdTypeEnum`** (هوية موحدة ~90 نوعاً + فحص نوعي صارم) | 1 | `com/jeronimo/fiz/api/common/MetaId.java` + `MetaIdTypeEnum.java` | هوية عابرة للنطاقات للمزامنة والتفويض والتدقيق. |
| 3 | **ثلاثية صلاحيات النظام** (`FWPermission` + `PermissionManager` + `PermissionRationaleDialog`) | 1 | `com/familywall/app/permissions/FWPermission.java` + `apktool-out/smali_classes7/.../permissions/PermissionManager.smali` | حزم منطقية + تبريرات + تفرع SDK + إعادة توجيه للإعدادات — تُنسخ حرفياً. |
| 4 | **نموذج الحقوق الخادمي** (`FamilyAdminRightEnum` + `IAdminApi` + `FizRightBean` + `FizNotEnougthRightException`) | 1 | `fiz/api/account/FamilyAdminRightEnum.java` + `fiz/api/admin/IAdminApi.java` + `fiz/api/common/FizRightBean.java` | فصل الدور الاجتماعي عن الحق التنفيذي؛ الحقوق تُحسب خادمياً. **قلب محرك الأدوار المرن.** |
| 5 | **محرك WriteBack للمزامنة** (`data/data_list/jobs/jobsdepends` + `WriteBackCacheStateEnum` + `CacheObjectType`) | 1 | `com/familywall/provider/FamilySQLiteOpenHelper.java` (SQL حرفي) + `com/familywall/backend/cache/impl2/` | offline-first كامل: طابور + retries + تبعيات + أعلام syncable — انسخ المخطط كما هو. |
| 6 | **إبطال الكاش بالدفع** (`CacheInvalidatedMessageBean` + `FcmListenerService`) | 2 | `fiz/api/push/CacheInvalidatedMessageBean.java` + `apktool-out/.../applicationmanagement/FcmListenerService.smali` | الدفع للإبطال لا للبيانات — نمط خفيف وصحيح. |
| 7 | **`RecurrencyDescriptor`** (تكرار + RRULE + استثناءات + تطبيع) | 1 | `com/jeronimo/fiz/api/event/RecurrencyDescriptor.java` | منطق تكرار جاهز مع `repairRecurrency()` و`isTheSame()`. |
| 8 | **نموذج الدعوات** (`IInvitation` + `InvitationStatusEnum` + منح `adminRights` عند الدعوة) | 2 | `fiz/api/account/IInvitation.java` + `InvitationStatusEnum.java` | آلة حالة تسليم + تفويض مبكر. |
| 9 | **استيراد البريد بالذكاء** (Family Email: `aiinboxsave/check` + `iaimportemail`) | 2 | `fiz/api/web/IWebApi.java#importemail` + `fiz/api/settings/AiInboxResponseBean.java` + smali `.../event/browse/rightmenu/aiimport/` | سابقة AI خادمية مربوطة بصلاحية المدير — نموذج لوكيل الأب. |
| 10 | **SyncAdapters للنظام** (جهات/تقويم العائلة في تطبيقات أندرويد) | 3 | `apktool-out/res/xml/{contact_syncadapter,calendar_syncadapter}.xml` + الـ manifest | تكامل عميق — يُدرس لاحقاً. |
| 11 | **الروابط العميقة** (`/DPl/*` على `api.familywall.com`) | 3 | الـ manifest + `res/values/strings.xml` (`deeplink_*`) | خريطة أقسام جاهزة لبنية التنقل. |
| 12 | **`TaskSuggestionBean`** (اقتراحات مصنّفة) | 3 | `com/jeronimo/fiz/api/task/TaskSuggestionBean.java` | بذرة اقتراحات مهام AI. |
| ✗ | `DebugReceiver` (الرمز `4242`) | ✗ | الـ manifest | باب خلفي — يُحذف. |
| ✗ | المكوّنات المصدَّرة بلا داعٍ (`GeotrackingRequestForegroundService`…) | ✗ | الـ manifest | تُقيَّد بصلاحية موقعة في Family OS. |
| ✗ | مفاتيح الإعلانات/التحليلات (AdMob/AppsFlyer) | ✗ | — | لا تُعاد. |

---

## 9. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **مستهلك `ISyncBean` العميل** [VERIFIED بالغياب]: البروتوكول مُعرَّف بلا مستهلك مرصود — هل المسار خادمي خالص أم في dex لم يُفكك؟ يحتاج بحث smali أشمل.
2. **تفصيل `ACCESS_FINE_LOCATION` المُتخطى في `checkPermission`** [VERIFIED]: يُعتبر ممنوحاً دائماً — هل هو تسامح مقصود (الدقة التقريبية كافية) أم خطأ؟ يحتاج مراجعة `PermissionManager$1` (قائمة `alwaysRequestRationalePermissions`).
3. **نسخة التطبيق الدقيقة**: versionName لم يُلتقط في هذا الفحص [لم يُقَس].
4. **منطق `geotracking`/`geofencing` الدقيق**: غائب من jadx — يُستكمل من Life360.
5. **توقيت دفع `CacheInvalidatedMessageBean`**: هل كل كتابة تدفع إبطالاً فورياً أم دفعات؟ [يحتاج مراقبة شبكية].
6. **حل تعارضات الكتابة الراجعة**: لا منطق تعارض مرصود — [INFERENCE: آخر كاتب يفوز].
7. **`DailyBriefing`**: المنطق لم يُقرأ (نشاط في الـ manifest فقط).
8. **الذكاء على الجهاز**: لم يُجرَ بحث شامل عن مكتبات ML — الادعاء "صفر" [INFERENCE] من العينات فقط.

---

## 10. خريطة الملفات المرجعية (مسارات دقيقة)

**SDK النطاق** (`~/workspace/rework/familywall/jadx-out/sources/com/jeronimo/fiz/`):
- `api/annotation/` — `Encodable.java`، `EncodableClass.java`، `ApiInterface.java`، `ApiMethod.java`، `Generator.java`
- `api/common/` — `MetaId.java`، `MetaIdTypeEnum.java`، `FizRightBean.java`، `PaginatedCollection.java`
- `api/account/` — `IFamilyMember.java`، `IExtendedFamilyMember.java`، `IInvitation.java`، `InvitationStatusEnum.java`، `FamilyRoleTypeEnum.java`، `FamilyAdminRightEnum.java`، `InvitationSendingBean.java`
- `api/admin/` — `IAdminApi.java`، `AdminRightBean.java`، `FizNotEnougthRightException.java`
- `api/event/` — `RecurrencyDescriptor.java`، `ReminderBean.java`، `AttendeeBean.java`، `EventTypeEnum.java`، `CalendarBean.java`، `TimetableBean.java`
- `api/task/` — `TaskSuggestionBean.java`، `TaskSuggestionSyncBean.java`، `TaskListTypeEnum.java`، `RecurrencyEnum.java`، `CategoryDescriptor.java`، `AssigneeBean.java`
- `api/sync/` — `ISyncBean.java` | `api/im/` — `IIMThread.java`، `IIMParticipant.java`، `SyncRequest.java`، `IMMessageTypeEnum.java`
- `api/push/` — `PushMessageBean.java`، `CacheInvalidatedMessageBean.java`، `WebSocketPushMessage.java`، `PushTypeEnum.java`
- `api/web/` — `IWebApi.java` (فيها `importemail`/`iaimportemail`) | `api/settings/` — `AiInboxResponseBean.java` (+ `ISettingsApi` smali فقط: `aiinboxcheck`/`aiinboxsave`)
- `api/wall/` — `MoodEnum.java`، `RefObjectTypeEnum.java` | `api/budget/` — `BudgetTransactionType.java`
- `core/codec/` — `IApiClientRequest.java`، `IJsonCodecFormat.java`، `FutureResult.java`، `Request.java`/`Response.java`

**التطبيق** (`~/workspace/rework/familywall/`):
- `jadx-out/sources/com/familywall/app/permissions/FWPermission.java` + `apktool-out/smali_classes7/com/familywall/app/permissions/{PermissionManager,PermissionRationaleDialog}.smali`
- `jadx-out/sources/com/familywall/multifamily/CircleInfo.java`
- `jadx-out/sources/com/familywall/provider/{FamilyProvider,FamilySQLiteOpenHelper}.java` (+ `data/`، `datalist/`، `jobs/`، `jobsdepends/`)
- `jadx-out/sources/com/familywall/backend/cache/impl2/fwimpl/CacheObjectType.java` + `../WriteBackCacheStateEnum.java`
- `jadx-out/sources/com/familywall/sync/{Authenticator,AuthenticationService}.java`
- `jadx-out/sources/com/familywall/app/family/manage/members/FamilyManageMembersCallbacks.java`
- `apktool-out/smali_classes6/com/familywall/app/event/browse/rightmenu/aiimport/` (AI import — smali فقط)
- `apktool-out/smali_classes7/com/familywall/applicationmanagement/FcmListenerService.smali`
- `apktool-out/AndroidManifest.xml` (186 نشاطاً / 30 خدمة / 26 مستقبلاً / 43 صلاحية) + `res/values/strings.xml` (`deeplink_*`، `calendar_email_import_*`)

> **الجرد الرسمي الكامل:** `~/workspace/family-os-docs/inventories/familywall/` (10 ملفات — انظر `README.md`).
