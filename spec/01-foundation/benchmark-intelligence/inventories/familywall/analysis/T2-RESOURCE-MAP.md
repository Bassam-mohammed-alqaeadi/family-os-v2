# خريطة الموارد والقدرات المعمارية T2 لتطبيق FamilyWall (T2 Resource & Capability Map)
## الحزمة: BIP-03 — FamilyWall Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-01 / 2026-11-02  
> **مستوى الفحص:** T2 — Resource & Capability Inventory  
> **التطبيق المستهدف:** FamilyWall (Android)  
> **حزمة المانيفست المعتمدة:** `com.familywall`  
> **المعرفات المرتبطة:** `FW-RES-000001` إلى `FW-RES-000015`

---

## 1. المنهجية والتصنيف المعماري الموحد

أُجري جرد تحليلي شامل لقدرات وموارد تطبيق **FamilyWall** استناداً حصرياً إلى الأدلة المادية على القرص تحت `benchmarks/extracted/familywall/`. تم الالتزام الصارم بقواعد حوكمة البيانات المعتمدة في ميثاق BIP وقرار مجلس القيادة D-039:
- **المستوى A (Level A - أدلة قطعية مباشرة):** مستخرجة مباشرة من كود الـ APK الأصلي، وملف `AndroidManifest.xml` الأصلي، وشفرات Java المفككة عبر JADX في `03_decompiled_src/`، وموارد الـ XML والصور والأيقونات الأصلية.
- **المستوى B (Level B - نماذج هندسية مشتقة):** نماذج ومعادلات مشتقة أُعيدت صياغتها برمجياً لمنصة Family OS (مثل الملفات تحت `04_extracted_algorithms/` ومخطط SQL في `05_data_models_and_schemas/local_db_schema.sql`). يوثق هذا التقرير بوضوح أن نماذج المستوى B **ليست دليلاً على تطبيق APK الأصلي بل تصاميم مقترحة لـ Family OS**.
- **المستوى C (Level C - استنتاجات وافتراضات):** فرضيات تحليلية موسومة بـ `[PARTIAL-EVIDENCE]` تم إخضاعها للفحص والتدقيق.

---

## 2. جدول الموارد المعمارية الـ 16 لتطبيق FamilyWall

| المعرف | اسم المورد المعماري | التصنيف القياسي | مستوى الإثبات | العمق التقني | ملخص السلوك والمكونات | استراتيجية الصهر لـ Family OS |
|---|---|---|---|---|---|---|
| `FW-RES-000001` | Multi-Family Circles Manager | Features & Business Rules | **Level A** | `T3_engineering` | صنف `MultiFamilyManager` لإدارة نطاقات العوائل المتعددة وتخزين معرّف الدائرة النشطة وإلغاء صلاحية الكاش عند التبديل. | `concept_adaptation` (S1-01) |
| `FW-RES-000002` | iCalendar RFC 5545 Recurrence Engine | Engines & Services | **Level A** | `T3_engineering` | معالجة فعاليات التقويم التكرارية عبر `IcalEventTool` ومكتبة `ical4j` وتطبيق قواعد `RRule` واستثناءات `ExDate`. | `concept_adaptation` (S1-03) |
| `FW-RES-000003` | Android Native SyncAdapter Framework | Synchronization & Offline | **Level A** | `T3_engineering` | مزامنة خلفية ثنائية الاتجاه مع تقويم وأسماء أندرويد عبر `SyncAdapter` وخدمات المصادقة والمزامنة. | `concept_adaptation` (S1-01 / S1-02) |
| `FW-RES-000004` | Shared Lists & Grocery Quantity Parser | Features & Business Rules | **Level A** | `T3_engineering` | محلل كميات مقادير التسوق الذكي `GroceryQuantityParser` وفرز عناصر القوائم المشتركة حسب القسم. | `concept_adaptation` (S1-04) |
| `FW-RES-000005` | Geotracking & Geofencing Location Engine | Engines & Services | **Level A** | `T3_engineering` | تتبع جغرافي مستمر للطفل عبر خدمة واجهة `GeotrackingRequestForegroundService` ومراقبة السياج المكاني وتنبيهات الخروج. | `concept_adaptation` (S1-06) |
| `FW-RES-000006` | Family Wall & Realtime Threaded Messaging | Realtime & Messaging | **Level A** | `T2_functional` | حائط العائلة التشاركي والمحادثات المترابطة وتسجيل الملاحظات الصوتية وإرفاق الصور المتعددة. | `concept_adaptation` (S1-07) |
| `FW-RES-000007` | Family Document Vault (Filer) | Features & Business Rules | **Level A** | `T2_functional` | حزمة `com.familywall.app.filer` (76 كلاس برمجياً) مبنية بـ Jetpack Compose لتنظيم وتصنيف وثائق الأسرة الرسمية. | `concept_adaptation` (S1-08) |
| `FW-RES-000008` | School Timetables & Alternating Weeks | Features & Business Rules | **Level A** | `T2_functional` | إدارة الجداول المدرسية الأسبوعية للطلاب ودعم الأسابيع التناوبية (أسبوع فردي / أسبوع زوجي). | `concept_adaptation` (S1-05) |
| `FW-RES-000009` | Birthday & Anniversary Tracker | Features & Business Rules | **Level A** | `T2_functional` | رادار احتساب الأيام المتبقية لأعياد الميلاد والذكرى السنوية وإدارة أفكار الهدايا والتعليقات العائلية. | `concept_adaptation` (S1-03) |
| `FW-RES-000010` | Panic SOS & Family Shout Emergency Subsystem | Security & Cryptography | **Level A** | `T2_functional` | نظام استغاثة طارئ مع عد تنازلي وإشعار دائم ونشر تنبيه صوتي فوري لكافة أفراد العائلة. | `concept_adaptation` (S1-06) |
| `FW-RES-000011` | Child Account Access & Governance | Authentication & Authorization | **Level A / B / C** | `T2_functional` | إدارة دخول الأطفال بدون هاتف عبر ترخيص البريد الأبوي ورمز PIN (مستبعد وجود موديول `kid_account` مستقل كـ Level A). | `cleanroom_reimplementation` (S1-01) |
| `FW-RES-000012` | Android Application Manifest & Identity | Android Platform Integration | **Level A** | `T1_structural` | تعريف حزمة التطبيق `com.familywall`، والأذونات الـ 43، والمكونات الـ 249، والروابط العميقة الـ 10. | `architectural_reference` (S1-01) |
| `FW-RES-000013` | SQLite Local Database Schema (11 Tables) | Data Models & Schemas | **Level B** | `T2_functional` | مخطط قاعدة البيانات المحلية المعاد بناؤه لخدمة Family OS والمبني على جداول العائلة والمزامنة والفعاليات. | `concept_adaptation` (S1-01 / S1-02) |
| `FW-RES-000014` | Sanitized Web Services & Media API Catalog | Network & API | **Level A** | `T3_engineering` | كتالوج نقاط النهاية الرسمية لخوادم FamilyWall (`api.familywall.com`) الموثقة بثوابت كود Java مع تطهير الشوائب. | `architectural_reference` (S1-01) |
| `FW-RES-000015` | Design System Assets (Colors, Lottie, Audio) | Icons & Graphics | **Level A** | `T2_functional` | 1,341 مفتاح لون وتدرج، 41 أنيميشن Lottie تفاعلي، 1,137 أيقونة متجهية، و 5 مؤثرات صوتية عائلية. | `direct_asset_reuse` (S1-09) |

---

## 3. التحليل المعماري المفصل للموارد والمحركات

### 3.1. محرك إدارة الدوائر العائلية المتعددة (`FW-RES-000001`)
- **الأدلة المادية:** `com/familywall/multifamily/MultiFamilyManager.java` (Level A) والنموذج المشتق `04_extracted_algorithms/02_multi_family_manager.kt` (Level B).
- **السلوك والمنطق الهندسي:**
  - يعتمد نمط Singleton لإدارة نطاق العائلة الحالي عبر الحقل `mCurrentFamilyScope`.
  - عند تغيير الدائرة العائلية، يقوم الصنف باستدعاء `setCurrentFamilyId` وتخزين المعرف محلياً في `AppPrefsHelper`، ثم إطلاق إشعار إلغاء صلاحية الذاكرة المؤقتة (Cache Invalidation) لكافة وحدات التقويم والمهام والحائط لضمان عدم تسرب بيانات عائلة لأخرى.
  - يوفر مصفوفة `mAllCircles` للتبديل الفوري دون الحاجة لإعادة تسجيل الدخول.

### 3.2. محرك تقويم وتكرار الفعاليات iCalendar RFC 5545 (`FW-RES-000002`)
- **الأدلة المادية:** `com/familywall/app/event/receiver/IcalEventTool.java` (Level A) والنموذج المشتق `04_extracted_algorithms/calendar_recurrence_engine.kt` (Level B).
- **السلوك والمنطق الهندسي:**
  - يدمج معيار RFC 5545 عبر مكتبة `ical4j` لمعالجة المكونات `VEvent` وتفسير قواعد التكرار `RRule` بمختلف وتائرها (يومي، أسبوعي، شهري، سنوي).
  - يدعم استثناءات التكرار المعقدة: تواريخ الاستبعاد `ExDate`، والتواريخ الإضافية `RDate`، وتوليد كائنات الأحداث `EventBean` مع احتساب فوارق المناطق الزمنية تلقائياً.

### 3.3. إطار المزامنة الأصلية لنظام أندرويد (`FW-RES-000003`)
- **الأدلة المادية:** `com/familywall/sync/SyncAdapter.java`, `AuthenticationService.java`, `CalendarSynchronizationService.java`, `ContactSynchronizationService.java` (Level A) والنموذج `01_sync_adapter_engine.kt` (Level B).
- **السلوك والمنطق الهندسي:**
  - يرتبط بمزود تقويم أندرويد الرسمي عبر السلطة `com.android.calendar` وملف التكوين `@xml/calendar_syncadapter`.
  - يرتبط بمزود جهات الاتصال عبر السلطة `com.android.contacts` وملف التكوين `@xml/contact_syncadapter`.
  - يحقق تكاملاً حقيقياً على مستوى النظام (System-Level Sync)، حيث تظهر أحداث الأسرة في تطبيق التقويم الافتراضي للهاتف وجهات اتصال الأسرة في دفتر عناوين الهاتف تلقائياً مع مزامنة تفاضلية (Incremental Sync) عند توفر الشبكة.

### 3.4. محلل كميات ومقادير التسوق التشاركي (`FW-RES-000004`)
- **الأدلة المادية:** `com/familywall/app/task/list/GroceryQuantityParser.java` (Level A).
- **السلوك والمنطق الهندسي:**
  - يقوم بتحليل العبارات النصية المدخلة من أفراد الأسرة في قوائم التسوق (مثل: "2 كجم بطاطس"، "3 علب حليب") عبر تعبيرات نمطية وقاموس وحدات قياس مدمج (`UnitRegistry`).
  - يعزل الكمية، والوحدة، واسم المادة، مما يتيح تجميع المواد المتشابهة تلقائياً وتصنيفها في فئات المتاجر (مخبوزات، ألبان، خضار).

### 3.5. محرك التتبع الجغرافي والسياج المكاني (`FW-RES-000005`)
- **الأدلة المادية:** `GeotrackingRequestForegroundService.java`, `GeofencingJobIntentService.java` (Level A).
- **السلوك والمنطق الهندسي:**
  - يعتمد تشغيل خدمة واجهة حارسة بصلاحية `foregroundServiceType="location"` لضمان تدفق إحداثيات موقع الطفل بشكل دوري حتى عند تفعيل نمط توفير الطاقة Doze Mode.
  - يدير السياج الجغرافي (Geofencing) عبر Google Location Services مع تحديد مناطق آمنة (المنزل، المدرسة، النادي) وإطلاق تنبيهات لحظية للأبوين فور الدخول أو المغادرة.
  - يراقب حالة مستشعر GPS عبر `LocationProvidersChangedReceiver` لتنبيه الأبوين إذا قام الطفل بإغلاق نظام تحديد المواقع يدوياً.

---

### 3.6. محرك ترتيب المهام والقوائم وخوارزمية نقطة المنتصف العددية (Midpoint-based numeric ordering) (FW-RES-000016)
- **الأدلة المادية:** TaskChangeOrderOperation.java (السطور 39–52 و 80–113) و TaskListChangeOrderOperation.java (Level A).
- **السلوك والمنطق الهندسي:**
  - ينفذ إعادة ترتيب المهام عبر خوارزمية تنصيف الفهرس sortingIndex: عند الإدراج بين عنصرين يتم احتساب (prev - next)/2 والإضافة على 
ext، أو الطرح بمقدار 1000 عند الإضافة في النهاية، أو تعيين System.currentTimeMillis() في المقدمة.
  - يدير التحديث المتزامن عبر طبقة الكاش المكتوب لاحقاً (WriteBack Cache) مع وضع علامة pending لتأكيد المعالجة الخلفية وإرسال طلبات RPC الخادمة.

---

## 4. تقييم الجدارة وإعادة الاستخدام في منصة Family OS

1. **الالتزام ببروتوكول الغرفة النظيفة (Clean-Room Protocol):**
   - كافة كود ومحركات Family OS يجب أن تُكتب من الصفر (Zero Copy) استناداً إلى التوصيف المعماري والمفاهيمي وليس بنسخ شفرات الـ APK.
2. **الأصول الرسومية والمؤثرات الصوتية (`FW-RES-000015`):**
   - تم التحقق من سلامة الألوان، ورسوم Lottie، والأصوات لتغذية النظام التصميمي `S1-09` وفق ما يعتمده مالك المشروع.
3. **تكامل الأنظمة المستهدفة في المرحلة الأولى:**
   - `S1-01` (الحسابات وإدارة الأسرة): يستفيد مباشرة من `FW-RES-000001` و `FW-RES-000011`.
   - `S1-02` (المزامنة والأوفلاين): يستفيد من `FW-RES-000003` و `FW-RES-000013`.
   - `S1-03` (التقويم العائلي): يستفيد من `FW-RES-000002` و `FW-RES-000009`.
   - `S1-04` (القوائم والمهام): يستفيد من `FW-RES-000004`.
   - `S1-06` (رادار الأمان والطوارئ): يستفيد من `FW-RES-000005` و `FW-RES-000010`.
   - `S1-08` (الخزنة العائلية للوثائق): يستفيد من `FW-RES-000007`.
