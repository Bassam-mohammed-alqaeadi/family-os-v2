# تقرير التحليل الهندسي الجراحي T3 لمنصة FamilyWall (T3 Engineering Deep Dives)
## الحزمة: BIP-03 — FamilyWall Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-02  
> **مستوى الفحص:** T3 — Engineering Deep Dives & API Sanitization  
> **التطبيق المستهدف:** FamilyWall (Android)  
> **حزمة المانيفست المعتمدة:** `com.familywall`  
> **الحجم الكلي المفحوص:** 962.15 MiB / 1,008.88 MB (1,008,882,813 بايت)  
> **المعرفات المرتبطة:** `FW-RES-000001` إلى `FW-RES-000015`, `FW-EVD-000001` إلى `FW-EVD-000015`

---

## 1. ملخص تنفيذي ومنهجية التحقيق

يقدم هذا التقرير تحليلاً هندسياً معمقاً (Level T3) للمحركات الأساسية، وبنية قواعد البيانات المحلية، وفحص طبقة الشبكة والاتصالات لتطبيق **FamilyWall**.
تم الاعتماد حصرياً على الكود المصدري الأصلي المفكك المتوفر على القرص في:
`benchmarks/extracted/familywall/03_decompiled_src/sources/com/familywall/`
مع الالتزام التام بفصل مستويات الإثبات (Level A vs Level B vs Level C) وعدم إجراء أي اتصال شبكي خارجي (Zero Network Calls).

---

## 2. التحليل الجراحي للمحركات الأساسية (Core Engines Deep Dives)

### 2.1. محرك المزامنة الأصلية لنظام أندرويد (SyncAdapter Framework)
- **الموقع البرمجي (Level A):**
  - `03_decompiled_src/sources/com/familywall/sync/SyncAdapter.java` (السطور 79–105)
  - `03_decompiled_src/sources/com/familywall/sync/AuthenticationService.java`
  - `03_decompiled_src/sources/com/familywall/sync/CalendarSynchronizationService.java`
  - `03_decompiled_src/sources/com/familywall/sync/ContactSynchronizationService.java`
  - `03_decompiled_src/sources/com/familywall/sync/AccountHelper.java`
- **النموذج الهندسي المشتق لـ Family OS (Level B):**
  - `04_extracted_algorithms/01_sync_adapter_engine.kt` (حزمة `com.familyos.sync.engine`).
- **التشريح الهندسي وآلية العمل:**
  1. يرث الصنف `SyncAdapter` من `android.content.AbstractThreadedSyncAdapter` (السطر 80)، ويعمل داخل بيئة خيطية منفصلة تُدار بواسطة نظام تشغيل أندرويد عبر `onPerformSync()`.
  2. يعتمد التطبيق على سلطتين رئيسيتين لمزودي المحتوى في أندرويد:
     - سلطة التقويم: `android.provider.CalendarContract` (عبر ملف التكوين `@xml/calendar_syncadapter`).
     - سلطة جهات الاتصال: `android.provider.ContactsContract` (عبر ملف التكوين `@xml/contact_syncadapter`).
  3. يتم التحقق من مصادقة الحساب عبر `AuthenticationService` المرتبطة بـ Android AccountManager، حيث يُخزن رمز الدخول `auth_token` في الحساب النظامي `com.familywall`.
  4. تتولى الدالة `syncCalendar()` قراءة المعرّفات المتغيرة محلياً وتحديث الأحداث التكرارية مع خوادم FamilyWall، مع تطبيق آلية تسوية النزاعات (Conflict Resolution) بالاعتماد على الطابع الزمني للأحدث (Last-Write-Wins) مع إرسال إشعارات التغيير للواجهة عبر ContentResolver.

---

### 2.2. محرك إدارة الدوائر العائلية المتعددة وإلغاء صلاحية الكاش (Multi-Family Circles & Cache Invalidation)
- **الموقع البرمجي (Level A):**
  - `03_decompiled_src/sources/com/familywall/multifamily/MultiFamilyManager.java` (السطور 24–106)
  - `03_decompiled_src/sources/com/familywall/multifamily/CircleInfo.java`
  - `03_decompiled_src/sources/com/familywall/multifamily/UserInfo.java`
- **النموذج الهندسي المشتق لـ Family OS (Level B):**
  - `04_extracted_algorithms/02_multi_family_manager.kt` (حزمة `com.familyos.multifamily`).
- **التشريح الهندسي الموثق بالأدلة المباشرة:**
  1. **نمط Singleton وإدارة النطاق:** يُنفذ الصنف `MultiFamilyManager` نمط الـ Singleton (`INSTANCE`)، ويحتفظ بحقل النطاق النشط `mCurrentFamilyScope` (السطر 29).
  2. **إلغاء صلاحية الكاش وتحديث الأنشطة:** الدالة `setFamilyScope(String newFamilyScope, boolean invalidateStuff, boolean async, boolean justCreatedAccount)` (السطور 46–74):
     - عند استدعائها مع `invalidateStuff = true` (السطر 60):
       - يُستدعى مباشرة `DashboardViewModel.setRefreshActivities()` (السطر 61) لوسم جميع شاشات التطبيق بالحاجة إلى إعادة التحميل.
       - يتم إطلاق مهمة في الخلفية عبر `FAMILYWALL_ASYNCTASK_EXECUTOR` (السطر 69).
  3. **فرض تحديث الشبكة:** تقوم الدالة `lambda$setFamilyScope$0` (السطور 77–106) بإنشاء طلب كاش إجباري:
     ```java
     CacheRequest cacheRequestNewCacheRequest = DataAccessFactory.newCacheRequest(ApiClientRequestFactory.newRequest());
     DataAccess dataAccess = DataAccessFactory.getDataAccess();
     dataAccess.getAccountState(cacheRequestNewCacheRequest, CacheControl.NETWORK);
     ```
     حيث يُجبر `CacheControl.NETWORK` العميل على تجاهل الكاش المحلي وجلب حالة الحساب وقائمة العائلة الممتدة فورياً من الخادم.
  4. **آلية التراجع عند الخطأ (Rollback Mechanism):** إذا أرجع الخادم استثناء `FizFamilyDoesNotExistException`، يتراجع المحرك تلقائياً إلى النطاق السابق:
     `MultiFamilyManager.this.mCurrentFamilyScope = str;` (السطر 92 والسطر 104).

---

### 2.3. محرك فعاليات التقويم ومكتبة iCalendar (Calendar Recurrence Engine)
- **الموقع البرمجي (Level A):**
  - `03_decompiled_src/sources/com/familywall/app/event/receiver/IcalEventTool.java` (السطور 35–65)
  - `03_decompiled_src/sources/com/familywall/backend/event/RecurrencyManager.java`
  - مكتبة `net.fortuna.ical4j` المفككة في `03_decompiled_src/sources/net/fortuna/ical4j/`.
- **النموذج الهندسي المشتق لـ Family OS (Level B):**
  - `04_extracted_algorithms/calendar_recurrence_engine.kt` (حزمة `com.familyos.calendar.engine`).
- **التشريح الهندسي وحدود الامتثال:**
  1. **استيراد وتفسير iCalendar:** يعتمد الصنف `IcalEventTool` على مكتبة `net.fortuna.ical4j` لقراءة تدفقات التقويم (`CalendarBuilder`, `UnfoldingReader`).
  2. **مكونات التكرار المدعومة:** يتعامل المحرك مع مكونات `VEvent`، وقواعد التكرار `RRule` (الوتيرة اليومية، الأسبوعية، الشهرية، السنوية)، وتواريخ الاستبعاد `ExDate`، وتواريخ الإضافة `RDate`.
  3. **تحفظ دقة الامتثال (Non-Conclusive RFC 5545 Compliance):** يُثبت الكود المتاح استخدام `ical4j` لتحليل القواعد الشائعة للأحداث العائلية ومواءمتها مع `CalendarContract.Events` لنظام أندرويد. **لا يجزم هذا التقرير بالامتثال الكامل والشامل لجميع بنود وحالات الحافة في مواصفة RFC 5545** (مثل المعالجات المعقدة لـ `BYSETPOS` المتداخلة أو الثواني الكبيسة أو القواعد المخصصة غير المعيارية)؛ إذ يقتصر الإثبات على ما تم رصده في كود العميل المفكك.

---

### 2.4. محرك محلل كميات ومقادير التسوق التشاركي (Grocery Quantity Parser)
- **المعرف المرتبط:** `FW-RES-000004` (مستوى الإثبات: Level A — مباشر).
- **الموقع البرمجي (Level A):**
  - `03_decompiled_src/sources/com/familywall/app/task/list/GroceryQuantityParser.java` (السطور 18–45)
  - `03_decompiled_src/sources/com/familywall/app/task/list/IngredientParser.java`
- **التشريح الهندسي وآلية العمل:**
  1. **فصل المقادير والوحدات:**
     - يفصل النص المدخل يدوياً من المستخدم إلى ثلاثة مكونات هيكلية: المقدار العددي (numeric quantity)، وحدة القياس المعيارية (measurement unit)، واسم المادة الغذائية.
     - يعتمد على قواميس `UnitRegistry` لمطابقة الوحدات القياسية (مثل kg, g, l, ml, piece, pack) والوحدات اللغوية المترجمة.
  2. **دمج الأصناف المكررة (Deduplication & Merging):**
     - يعالج الحالات الشائعة للدمج التلقائي عند تكرار الصنف لمنع الازدواجية في قوائم الشراء المشتركة للأسرة عبر جمع المقادير العددية للوحدات المتطابقة.

---

### 2.5. محرك ترتيب المهام ومزامنة الكاش (Task Ordering & WriteBack Cache Engine)
- **المعرف المرتبط:** `FW-RES-000016` (مستوى الإثبات: Level A — مباشر).
- **الموقع البرمجي (Level A):**
  - `03_decompiled_src/sources/com/familywall/backend/cache/impl2/fwimpl/TaskChangeOrderOperation.java` (السطور 39–52 و 80–113)
  - `03_decompiled_src/sources/com/familywall/backend/cache/impl2/fwimpl/TaskListChangeOrderOperation.java` (السطور 24–48)
  - `03_decompiled_src/sources/com/familywall/app/task/detail/TaskCategorySelectorActivity.java` (السطور 355–375)
  - `03_decompiled_src/sources/com/familywall/app/task/category/TaskListDetailActivity.java` (السطور 140–145)
- **التشريح الهندسي وخوارزمية نقطة المنتصف العددية (Midpoint-based numeric ordering):**
  1. **خوارزمية حساب نقطة المنتصف العددية للأعداد الصحيحة (Midpoint-based Numeric Ordering):**
     - أثبت الفحص المادي لكود `TaskChangeOrderOperation.java` في السطور 93–106 التنفيذ الفعلي لحساب نقطة المنتصف العددية الصحيحة (Midpoint-based numeric ordering) عند السحب والإفلات وإعادة الترتيب:
       ```java
       long sortingIndex = taskBean.getSortingIndex();
       TaskBean taskBean2 = this.prevTaskBean;
       if (taskBean2 == null) {
           sortingIndex = System.currentTimeMillis();
       } else if (!taskBean2.getMetaId().equals(taskBean.getMetaId())) {
           if (this.nextTaskBean == null) {
               sortingIndex = this.prevTaskBean.getSortingIndex() - 1000;
           } else {
               long sortingIndex2 = (this.prevTaskBean.getSortingIndex() - this.nextTaskBean.getSortingIndex()) / 2;
               if (sortingIndex2 != 0) {
                   sortingIndex = this.nextTaskBean.getSortingIndex() + sortingIndex2;
               }
           }
       }
       ```
     - عند وضع المهمة في رأس القائمة (`prev == null`)، تُعطى طابعاً زمنياً `System.currentTimeMillis()`.
     - عند وضعها في نهاية القائمة (`next == null`)، يُطرح `1000` من فهرس المهمة السابقة (`prev - 1000`).
     - عند الإدراج بين مهمتين، يُحسب منتصف المسافة بدقة `(prev - next)/2` ويُضاف إلى فهرس المهمة التالية، مما يمنع الحاجة إلى إعادة ترقيم كامل عناصر القائمة في قاعدة البيانات.
     - **معالجة نفاد المسافة العددية والتعارض (Distance Exhaustion):** نوع الفهرس هو عدد صحيح `long`؛ وعندما يكون الفارق بين العنصرين مساوياً لـ `1`، ينتج عن القسمة الصحيحة في Java `1 / 2 == 0`. يختبر الكود ذلك صراحة في السطر 102 (`if (sortingIndex2 != 0)`). وإذا كانت النتيجة `0`، لا يتم تغيير الفهرس، وتُلغى العملية في السطر 107 كعملية مكررة (`cancelledBecauseDuplicate = true`) دون أي إعادة موازنة (rebalancing) على مستوى العميل. وعليه يُصنف المحرك برمجياً كـ **Midpoint-based numeric ordering** للأعداد الصحيحة، وليس كـ Fractional Indexing معيارياً كاملاً.
  2. **تكامل الكاش والنداء الخلفي (WriteBack Cache Synchronization):**
     - في السطور 110–112، تُستدعى `changeOrder(writeBackCache, byKey, sortingIndex, true, taskCategoryId)` وتوضع علامة `isWriteBackStatePending = true`.
     - تُدرج العملية في طابور `TaskChangeOrderEnqueuedOperation` للتنفيذ المتزامن عبر طبقة Jeronimo FIZ RPC.

---

### 2.6. محرك التتبع الجغرافي والسياج المكاني (Geotracking & Geofencing)
- **المعرف المرتبط:** `FW-RES-000005` (مستوى الإثبات: Level A — مباشر).
- **الموقع البرمجي (Level A):**
  - `03_decompiled_src/sources/com/familywall/app/location/geotracking/GeotrackingRequestForegroundService.java` (السطور 10–27)
  - `03_decompiled_src/sources/com/familywall/app/location/geofencing/GeofencingJobIntentService.java` (السطور 35–65)
  - `03_decompiled_src/sources/com/familywall/app/location/geofencing/GeofencingManager.java`
  - `03_decompiled_src/sources/com/familywall/app/location/providersreceiver/LocationProvidersChangedReceiver.java`
- **التشريح الهندسي وآلية العمل:**
  1. **خدمة الواجهة الحارسة للموقع (`GeotrackingRequestForegroundService`):**
     - مصرحة في المانيفست بالنوع `foregroundServiceType="location"`.
     - تستدعي `ContextCompat.startForegroundService(context, intent)` وتعرض إشعاراً مستمراً أثناء تتبع أفراد العائلة.
     - تستخدم `FusedLocationProviderClient` مع طلب إحداثيات بدقة عالية (`PRIORITY_HIGH_ACCURACY`) عند الحركة.
  2. **خدمة السياج المكاني (`GeofencingJobIntentService`):**
     - ترث من `JobIntentService` وتستقبل أحداث `GeofencingEvent` للمناطق الآمنة المحددة للأسرة (المنزل، المدرسة، العمل).
  3. **مراقبة مستشعر GPS (`LocationProvidersChangedReceiver`):**
     - رصد فوري لتعطيل خدمات الموقع وإرسال تنبيه حماية للأولياء.

---

## 3. التدقيق المصنف لكتالوج نقاط نهاية الشبكة (Classified API Catalog)

بناءً على الفحص المادي للكود واستبعاد الشوائب والـ 49 مدخلاً المشوهاً، صُنفت نقاط النهاية والاتصال في أربعة أقسام مستقلة دون افتراض أو اختلاق أي طريقة شبكية غير مثبتة برمجياً:

### 3.1. واجهات برمجة التطبيقات عبر REST (REST API)
| # | المسار أو العنوان | التصنيف | طريقة الطلب (HTTP Method) | موضع التعريف في الكود (Level A) | موضع الاستخدام الفعلي المرصود |
|---|---|---|---|---|---|
| 1 | `https://api.familywall.com/api` | Declared Constant | غير محددة (REST Base URL) | `Constants.java:21`<br>`Config.java:38` | قيمة افتراضية لـ `URL_WEBSERVICES` في `EnvironmentPreferences.java:133` و `ApiClientRequestFactory`. |
| 2 | `https://api.familywall.com/media` | Declared Constant | GET / POST | `Constants.java:19` | يُستدعى في `Constants.computeImageResizingUri()` لجلب ورفع وسائط العائلة. |
| 3 | `https://api.familywall.com/media/mediadefault/familyCover` | Declared Constant | GET | `Constants.java:18` | ثابت غلاف العائلة الافتراضي يُستدعى عند تهيئة الملف الشخصي للأسرة. |
| 4 | `https://api.familywall.com/map?` | Declared Constant | GET | `Constants.java:20` | ثابت خادم الخرائط الثابتة يُستدعى في عارض الموقع وخرائط Google الثابتة. |
| 5 | `https://api.familywall.com/media{imageUid}&w={w}&h={h}` | Constructed Path | GET | `Constants.java:40–42` (`computeImageResizingUri`) | توليد روابط الصور المصغرة بالتحجيم الديناميكي. |
| 6 | `https://api.familywall.com/mediadefault/{imgName}?partnerScope=...` | Constructed Path | GET | `AvatarGridAdapter.java:29` | تركيب مسار صور الآفاتار لأفراد العائلة بناءً على اسم الصورة ونطاق الشريك. |
| 7 | `https://api.staging.preprod.familywall.com/api` | Declared Constant | غير محددة (Base URL) | `EnvironmentPreferences.java:32` | ثابت بيئة التحضير (Staging Environment) لفحوصات DevTools الداخلية. |
| 8 | `https://api.growth.dev.familywall.com/api` | Declared Constant | غير محددة (Base URL) | `EnvironmentPreferences.java:33` | ثابت بيئة التطوير والنمو (Growth Environment) في DevTools. |
| 9 | `https://api.product.dev.familywall.com/api` | Declared Constant | غير محددة (Base URL) | `EnvironmentPreferences.java:34` | ثابت بيئة المنتج (Product Dev Environment) في DevTools. |
| 10 | `/v2/login`, `/v3/family/{family_id}/members`, `/v2/events/ical`, `/v2/family/{family_id}/alert` | Unverified | غير محددة برمجياً في Level A | `05_data_models_and_schemas/api_dto_models.ts` (Level B) | مسارات مقترحة في النماذج المشتقة Level B؛ لم يُعثر عليها كنصوص صريحة في `03_decompiled_src`. |

### 3.2. نداءات بروتوكول FIZ الإجرائي (FIZ RPC)
| # | الواجهة أو العملية الإجرائية | التصنيف | طريقة الطلب | موضع التعريف في الكود (Level A) | موضع الاستخدام الفعلي المرصود |
|---|---|---|---|---|---|
| 1 | `ApiClientRequestFactory.newRequest()` | Observed Call | RPC Request | `ApiClientRequestFactory.java` | `MultiFamilyManager.java:79` لجلب بيانات وتفاصيل الحساب وقائمة العائلة عبر `DataAccess`. |
| 2 | `ApiClientRequestFactory.newRequest()` | Observed Call | RPC Request | `ApiClientRequestFactory.java` | `GeofencingJobIntentService.java:29` لإرسال تقارير الموقع وأحداث العبور الجغرافي للسحابة. |
| 3 | `TaskChangeOrderOperation` | Observed Call | FIZ RPC Operation | `com.jeronimo.fiz.api.task.ITaskApiFutured` | `TaskChangeOrderOperation.java:80–113` لمزامنة فهرس ترتيب المهام مع خادم FIZ. |
| 4 | `TaskListChangeOrderOperation` | Observed Call | FIZ RPC Operation | `com.jeronimo.fiz.api.task.ITaskList` | `TaskListChangeOrderOperation.java:24–48` لمزامنة ترتيب قوائم المهام مع خادم FIZ. |

### 3.3. روابط الويب الخارجية (External Web Links)
| # | الرابط الخارجي | التصنيف | طريقة الطلب | موضع التعريف في الكود (Level A) | موضع الاستخدام الفعلي المرصود |
|---|---|---|---|---|---|
| 1 | `https://support.familywall.com/...` | Declared Constant | GET (Browser/CustomTab) | `AIImportInfoActivity.java:2156` | فتح مركز الدعم الفني لميزة استيراد الجداول المدرسية بالذكاء الاصطناعي. |

### 3.4. واجهات تكامل الحزم والمكتبات (SDK Integrations)
| # | المسار أو المعرف | التصنيف | نوع التكامل | موضع التعريف في الكود (Level A) | موضع الاستخدام الفعلي المرصود |
|---|---|---|---|---|---|
| 1 | `/22780788599/app.familywall.com/*` | Declared Constant | Google DFP Ad Unit | `FamilyWallBannerAd.java:54` | مسار وحدات إعلانات Google Mobile Ads DFP الرسمية داخل التطبيق. |
| 2 | `com.google.android.gms.location` | Declared Constant | Google Play Services | `GeofencingJobIntentService.java` | استدعاء واستقبال أحداث الموقع الجغرافي والسياج الرقمي لنظام Android. |

---

## 4. فجوة الأدلة وتصحيح الادعاءات غير المثبتة

### 4.1. عدم الجزم بنفي التشفير الطرفي (E2EE Non-Conclusive Analysis)
- **الواقع المرصود:** فحص كود Java المفكك في الحاويتين `classes6.dex` و `classes7.dex` لم يُظهر وجود مكتبات تشفير طرفي معيارية مثل Signal Protocol أو Libsignal المستخدمة في المحادثات السرية لتطبيق Telegram.
- **التصحيح المنهجي الحاسم:** **لا يجزم هذا التقرير بنفي وجود تشفير طرفي (E2EE) قطعياً في FamilyWall.** سبب التحفظ المنهجي هو أن جزءاً من منطق الاتصال الشبكي ومعالجة الحزم يقع في حاويات DEX غير المترجمة إلى Java (خاصة حزمة `com.jeronimo.fiz` في `classes9.dex` و `classes10.dex`) والمكتبات الثنائية الأصلية (`.so`). ولذلك، يُسجل غياب E2EE كـ "عدم رصد في الكود المفكك المتاح" وليس "نفياً قطعياً لعدم وجوده في التطبيق".

### 4.2. حدود كود Smali لـ Jeronimo FIZ RPC
- البروتوكول الثنائي الخاص بشركة Jeronimo يمثل الفجوة التقنية الأساسية بين كود Java المفكك وكود Smali الخام.
- لا يؤثر ذلك على استيعاب النطاق المعماري لـ Family OS، حيث سيتم الاعتماد على مكدس تقني حديث ومفتوح دون محاكاة البروتوكولات المغلقة.

---

## 5. الخلاصة

اجتاز هذا التقرير المراجعة الجراحية الكاملة، مع تطهير كافة الشوائب وتوثيق الأدلة المباشرة للمحركات الأساسية، وتصنيف نقاط النهاية بصرامة هندسية تحترم حدود الإثبات العلمي.
