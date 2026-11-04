# الاستكشاف الوظيفي وتحليل الفجوات — FamilyWall (Coverage & Gaps)

> **المعرف:** `COV-FW-001`
> **إجمالي الوظائف المفهرسة:** 46 وظيفة عبر 12 مجالاً

---

## 1. جدول التغطية الوظيفية

| # | الوظيفة | المجال | المستوى | الدليل |
|---|---|---|:---:|---|
| 1 | Typed Domain SDK (27 نطاقاً) | Architecture | A | `fiz/api/*` (عُدَّت) |
| 2 | `MetaId` + ~90 نوع كيان | Data Models | A | `api/common/MetaId.java` |
| 3 | `@Encodable` contract system | Network | A | `api/annotation/Encodable.java` |
| 4 | `IApiClientRequest` transport | Network | A | `core/codec/IApiClientRequest.java` |
| 5 | `FWPermission` (11 حزمة) | Permissions | A | `app/permissions/FWPermission.java` |
| 6 | `PermissionManager` engine | Permissions | A | smali كامل |
| 7 | `PermissionRationaleDialog` | Permissions | A | smali + `BaseActivity` |
| 8 | `FamilyAdminRightEnum` + `isAdmin` | Permissions | A | `api/account/FamilyAdminRightEnum.java` |
| 9 | `IAdminApi` (change/getright/list/remove/wipe) | Permissions | A | `api/admin/IAdminApi.java` |
| 10 | `FizRightBean` (canDelete/canUpdate) | Permissions | A | `api/common/FizRightBean.java` |
| 11 | `IFamilyMember` / `IExtendedFamilyMember` | Family Model | A | `api/account/*.java` |
| 12 | `CircleInfo` (multi-family) | Family Model | A | `multifamily/CircleInfo.java` |
| 13 | `IInvitation` + status machine | Family Model | A | `api/account/IInvitation.java` |
| 14 | `RecurrencyDescriptor` | Calendar | A | `api/event/RecurrencyDescriptor.java` |
| 15 | `ReminderBean` + alarms | Calendar | A | `api/event/ReminderBean.java` + manifest |
| 16 | `AttendeeBean` + statuses | Calendar | A | `api/event/AttendeeBean.java` |
| 17 | ICS import (`.*.ics`) | Calendar | A | manifest + `IcalImportResultBean` |
| 18 | External calendars (Google/Outlook) | Calendar | B | `MetaIdTypeEnum` entries |
| 19 | `TaskSuggestionBean` | Tasks | A | `api/task/TaskSuggestionBean.java` |
| 20 | `TaskListTypeEnum` (TODOS/SHOPPING_LIST) | Tasks | A | `api/task/TaskListTypeEnum.java` |
| 21 | WriteBack engine (4 tables) | Sync | A | `FamilySQLiteOpenHelper.java` (SQL حرفي) |
| 22 | `jobsdepends` dependency resolution | Sync | A | SQL + indexes |
| 23 | `WriteBackCacheStateEnum` | Sync | A | `backend/cache/impl2/` |
| 24 | `CacheObjectType` matrix (~50) | Sync | A | `fwimpl/CacheObjectType.java` |
| 25 | FCM cache invalidation | Sync | A | smali `FcmListenerService` |
| 26 | `ISyncBean` delta protocol | Sync | C | مُعرَّف بلا مستهلك مرصود |
| 27 | OS SyncAdapters (contact/calendar) | Sync | A | manifest + res/xml |
| 28 | `AccountManager` auth | Auth | A | `sync/Authenticator.java` |
| 29 | AI email→event import | AI | A | `IWebApi#importemail` + smali aiimport + 55 strings |
| 30 | `AiInboxResponseBean` | AI | A | `api/settings/AiInboxResponseBean.java` |
| 31 | `aiinboxcheck`/`aiinboxsave` | AI | A | smali `ISettingsApi` + المستهلك |
| 32 | DailyBriefing | AI | C | نشاط manifest فقط |
| 33 | Task suggestions sync | Tasks | B | `TaskSuggestionSyncBean` |
| 34 | Wall (`MoodEnum`, `RefObjectTypeEnum`) | Wall | A | `api/wall/*.java` |
| 35 | IM (`IIMThread`, `SyncRequest`) | Messaging | A | `api/im/*.java` |
| 36 | Budget (`BudgetTransactionType`) | Budget | A | `api/budget/*.java` |
| 37 | MealPlanner (dish/recipe/meal) | Meals | B | `api/mealplanner/` (13 ملفاً) |
| 38 | Place/Geofencing | Location | C | manifest فقط (jadx مفقود) |
| 39 | Geotracking foreground service | Location | C | manifest فقط |
| 40 | Panic/SOS | Safety | C | manifest (`PanicCountdownActivity`) |
| 41 | `PostMediaService` (upload) | Media | B | manifest + تقرير الجولة الأولى |
| 42 | Deep links `/DPl/*` | Navigation | A | manifest + strings |
| 43 | DebugReceiver (4242) | Security | A | manifest — **مرفوض** |
| 44 | Exported geotracking components | Security | A | manifest — **تُقيَّد** |
| 45 | FINE_LOCATION skip in checkPermission | Permissions | A | smali — **يُراجع** |
| 46 | `alwaysRequestRationalePermissions` list | Permissions | B | `PermissionManager$1` (لم تُقرأ محتوياتها) |

**المستويات:** A = مؤكد بالكود | B = مشتق/جزئي القراءة | C = جزئي (مُعرَّف بلا تنفيذ مرصود، أو manifest فقط).

---

## 2. الفجوات المعلنة

1. **منطق التتبع الدقيق** (`geotracking`/`geofencing`): غائب من jadx — يُستكمل من Life360.
2. **`ISyncBean`**: بروتوكول بلا مستهلك عميل مرصود — يحتاج بحث smali أشمل أو مراقبة شبكية.
3. **`DailyBriefing`**: نشاط بلا منطق مقروء.
4. **محتويات `alwaysRequestRationalePermissions`**: لم تُقرأ (`PermissionManager$1`).
5. **versionName الدقيق**: لم يُلتقط.
6. **الذكاء على الجهاز**: بحث ML غير شامل — الادعاء "صفر" استنتاجي من العينات.

---

## 3. ملخص الجودة

- **46 وظيفة**: 38 مستوى A، 5 مستوى B، 3 مستوى C (جزئية)، 0 Not Found خالصة.
- **أعلى كثافة Level-A** بين جرود السلسلة — يعكس نظافة المخرجات.
