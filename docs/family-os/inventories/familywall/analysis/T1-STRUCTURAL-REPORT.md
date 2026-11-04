# التقرير الهيكلي لتشريح الحزمة والمكونات — FamilyWall (T1 Structural Analysis)

> **المعرف:** `T1-FW-STRUCTURAL-001`
> **التطبيق:** FamilyWall (`familywall`)
> **الحزمة المفحوصة:** `com.familywall` (v2026.10.1)
> **المعمارية التقنية:** تطبيق أصلي (Native Java/Kotlin + Compose) — Typed Domain SDK + WriteBack Cache

---

## 1. الملخص التنفيذي للهيكلية

أثبت الفحص أن FamilyWall **ليس** تطبيق تنظيم عائلي عادياً — بل **منصة SDK-أولاً**:
1. **عقود النطاق أولاً:** `com.jeronimo.fiz.api.*` (27 نطاقاً) — interfaces موسومة `@ApiInterface`/`@EncodableClass`، تُولَّد تنفيذاتها آلياً (`Generator.java`).
2. **هوية موحدة:** `MetaId{type, ownerId, objectId, metaContent, external}` + `MetaIdTypeEnum` (~90 نوعاً).
3. **نقل مخصص:** `com.jeronimo.fiz.core.codec` — عميل HTTP فوق JSON بلا Retrofit؛ `IApiClientRequest` (طلب/غير متزامن/معاملاتي/نطاق MetaId).
4. **تخزين مزدوج:** `FamilyProvider` (ContentProvider: `data`/`data_list`/`jobs`/`jobsdepends`) + Room (`dao/` + `entities/`).
5. **صلاحيات مزدوجة:** UX نظام (`FWPermission` + `PermissionManager`) وحقوق دوائر خادمية (`FamilyAdminRightEnum` + `IAdminApi`).

---

## 2. جدول مكونات الـ Manifest [VERIFIED]

| نوع المكون | العدد | المكونات الرئيسية | التوصيف |
|---|:---:|---|---|
| الأنشطة | **186** | `EventImportAISettingsActivity`، `DailyBriefingSettingsActivity`، `IcsReceiverActivity`، `PanicCountdownActivity` | كلها تقريباً `exported=false` |
| الخدمات | **30** | `GeotrackingRequestForegroundService` (**مصدَّرة**، نوع location)، `FcmListenerService`، `FcmFirebaseInstanceIdService`، `PostMediaService`، `AuthenticationService` | — |
| المستقبلات | **26** | `GeofencingBroadcastReceiver`/`GeotrackingBroadcastReceiver` (مصدَّرتان)، `DebugReceiver` (**الرمز السري `4242`**)، `ReminderBroadcastReceiver` | — |
| المزودون | — | `FamilyProvider` (`com.familywall.provider`)، `GenericFileProvider` | — |
| الأذونات | **43** | موقع دقيق/تقريبي/خلفي، تقويم، جهات اتصال، وسائط، إشعارات، `SCHEDULE_EXACT_ALARM`+`USE_EXACT_ALARM`، فوترة، `AUTHENTICATE_ACCOUNTS`، `RECORD_AUDIO` | — |
| SyncAdapters | 2 | `contact_syncadapter`، `calendar_syncadapter` | جهات/تقويم العائلة في تطبيقات أندرويد الأصلية |

**علامات حمراء** [VERIFIED]: `DebugReceiver` + `android_secret_code://4242` (يُحذف)؛ `GeotrackingRequestForegroundService` مصدَّرة (تُقيَّد).

---

## 3. حصر نطاقات الـ SDK الـ 27 [VERIFIED — عُدَّت فعلياً]

`account`(52)، `billing`(26)، `common`(23)، `event`(25)، `media`(16)، `place`(15)، `mealplanner`(13)، `push`(13)، `launchpad`(12)، `task`(10)، `addressbook`(9)، `settings`(7)، `auth`(7)، `admin`(6)، `ccare`(6)، `im`(5)، `device`(4)، `budget`(3)، `wall`(3)، `maintenance`(3)، `web`(2)، `stub`(2)، `status`(2)، `filer`(2)، `google`(2)، `outlook`(1)، `externalimport`(1)، `bgthread`(1)، `message`(1)، `profile`(1)، `sync`(1).

**نمط كل نطاق:** `I*Api` (`@ApiInterface(name=...)`) + beans (`@EncodableClass`) + enums + استثناءات `Fiz*Exception` مسماة.

---

## 4. طبقات التخزين [VERIFIED]

| الطبقة | الملفات | الدور |
|---|---|---|
| `FamilyProvider` | `provider/FamilyProvider.java` (authority `com.familywall.provider`، 4 URIs) | ContentProvider للمزامنة |
| SQLite | `provider/FamilySQLiteOpenHelper.java` — DB `familywall_provider.db` v6، جداول `data`/`data_list`/`jobs`/`jobsdepends` | مخزن WriteBack |
| Room | `app/roomdatabase/{dao,entities}/` (`RecentlyUsedTimezones`، `TaskListsClosedCategories`…) | كاش الواجهة |
| الكاش | `backend/cache/impl2/` (`CacheObjectType` ~50 نوعاً، `WriteBackCacheStateEnum`) | سياسة الكاش/الكتابة الراجعة |
| الحساب | `sync/Authenticator.java` + `AuthenticationService.java` | حساب أندرويد حقيقي |

---

## 5. الروابط العميقة [VERIFIED]

`https://api.familywall.com/DPl` (+ `/im`، `/home`، `/map`، `/calendar`، `/list`، `/budget`، `/documents`، `/specialdays`، `/premium`) — http وhttps.
استقبال: `.*.ics` (التقويم)، `ACTION_SEND` (نص/صور/فيديو).

---

## 6. حدود التشريح

- `app/location/geotracking` و`geofencing`: منطق jadx مفقود (manifest فقط).
- `ISettingsApi`: موجود smali فقط (jadx فشل) — لكن `aiinboxcheck`/`aiinboxsave` مرصودة من المستهلكين.
- `aiimport` UI: Compose — smali فقط.
- `FcmListenerService`: smali فقط (jadx فشل) — السلوك مستنتج من الاستدعاءات.
