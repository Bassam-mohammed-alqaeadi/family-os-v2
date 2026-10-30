# دليل ومسرد نماذج البيانات وقواعد البيانات — تطبيق Bark
## Data Models, Schemas & Entity Catalog: Bark Parental Controls (v6.5.1)

> **المستهدف المعماري:** تطبيق Bark Parental Controls (`cm.pt.barkparent` v6.5.1 Build 600500103 & Bark Kids Sentinel)  
> **مرحلة الإنجاز:** Milestone M5 (Data Models, Database & Schemas Extraction)  
> **مسار مجلد الاستخراج:** `benchmarks/extracted/bark/05_data_models_and_schemas/`  
> **حالة مجلد المواصفات:** `spec/` معزول ومجمد بنسبة 100% (Strictly Isolated & Frozen)

---

## 1. الفهرس التنفيذي للوثائق والمخرجات (Deliverables Summary)

| اسم الملف | الصيغة | الحجم / الإحصائيات | الوصف والدور المعماري |
|---|---|---|---|
| **`local_db_schema.sql`** | SQL (SQLite / Room DDL) | 21 جدولاً، 63 فهرساً، 7 محفزات (Triggers) | مخطط قاعدة البيانات المحلية الحقيقية بالكامل للمزامنة والتخزين غير المتصل. |
| **`family_os_bark_dtos.ts`** | TypeScript (NestJS DTOs) | 28 تعداداً (Enums)، 35 واجهة وهيكل بيانات | نماذج نقل البيانات الآمنة نمطياً والجاهزة للدمج المباشر في خادم Family OS. |
| **`family_os_bark_models.dart`** | Dart (Flutter Models) | 18 صنفاً غير قابل للتعديل (Immutable) مع `fromJson` / `toJson` / `copyWith` | نماذج بيانات عميل فلاتر المتوافقة مع معايير المساواة القيمية (`props`). |
| **`offline_enforcement_rules.md`** | Markdown فني معماري | 7 أقسام شاملة ومخططات Mermaid | التوثيق المعماري لكيفية فرض الرقابة الأبوية ووقت الشاشة وفلترة DNS دون إنترنت. |

---

## 2. جدول ومسرد الكيانات الـ 21 في قاعدة البيانات المحلية (`local_db_schema.sql`)

### 2.1 نطاق الحسابات والهوية العائلية (Accounts & Profiles Domain)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المفاتيح الأجنبية (FKs) | عدد الحقول | الدور الوظيفي في Bark |
|---|---|---|---|---|
| **`accounts`** | `account_id` | لا يوجد | 12 | بيانات حساب الوالد الأساسي، خطة الاشتراك (`bark_premium`، `bark_jr`)، ودورة الفوترة. |
| **`children_profiles`** | `child_id` | `account_id` -> `accounts` | 12 | ملفات الأبناء المسجلين، سنة الميلاد، المنطقة الزمنية، ونطاق الرقابة. |
| **`paired_devices`** | `device_id` | `child_id` -> `children_profiles` | 15 | أجهزة الأبناء المقترنة، حالة أذونات الـ VPN وإمكانية الوصول والإشعارات ومستوى البطارية. |

### 2.2 نطاق التقاط الرسائل ومنع التكرار (Captured Chat & Buffers Domain)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المفاتيح الأجنبية (FKs) | عدد الحقول | الدور الوظيفي في Bark |
|---|---|---|---|---|
| **`monitored_messages`** | `message_id` | `device_id` -> `paired_devices`<br>`child_id` -> `children_profiles` | 14 | الذاكرة المؤقتة للرسائل المستخرجة من شجرة Accessibility وتطبيقات الدردشة قبل التقييم. |
| **`deduplication_cache`** | `hash_id` | `device_id` -> `paired_devices` | 9 | مخزن التجزئة الحلقي (LRU Ring Buffer) لمنع إعادة فحص النصوص المكررة وتوفير طاقة المعالج. |

### 2.3 نطاق إشارات المخاطر وتنبيهات الوالدين (Risk Signals & Alerts Domain)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المفاتيح الأجنبية (FKs) | عدد الحقول | الدور الوظيفي في Bark |
|---|---|---|---|---|
| **`risk_signals`** | `signal_id` | `device_id`, `child_id`, `message_id` | 14 | رصد المخاطر المباشرة المصنفة حسب درجات الخطورة (1 إلى 5) مع تشفير Google Tink AEAD. |
| **`alert_history`** | `alert_id` | `signal_id`, `account_id`, `child_id` | 12 | سجل التنبيهات الموجهة للوالد مع حالات المراجعة (`new`, `reviewed`, `resolved`). |
| **`conversation_suggestions`** | `suggestion_id` | `alert_id` -> `alert_history` | 9 | إرشادات المحادثة النفسية المقترحة لمساعدة الوالدين على فتح حوار تربوي بناء مع الطفل. |

### 2.4 نطاق وقت الشاشة وقواعد الـ VPN (Screen Time & VPN Rulesets Domain)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المفاتيح الأجنبية (FKs) | عدد الحقول | الدور الوظيفي في Bark |
|---|---|---|---|---|
| **`screen_time_rulesets`** | `ruleset_id` | `child_id` -> `children_profiles` | 10 | الأنماط الرئيسية لوقت الشاشة (`default`, `school`, `bedtime`, `bonus`, `paused`). |
| **`schedule_blocks`** | `block_id` | `ruleset_id`, `child_id` | 8 | كتل الجداول الزمنية الأسبوعية (دقائق البدء والانتهاء من 0 إلى 1439). |
| **`category_block_rules`** | `rule_id` | `ruleset_id` -> `screen_time_rulesets` | 7 | قواعد فلترة فئات المواقع على مستوى DNS وتوجيه الـ Sinkhole إلى `0.0.0.0`. |
| **`custom_exceptions`** | `exception_id` | `ruleset_id`, `child_id` | 9 | استثناءات النطاقات المخصصة وتطبيقات أندرويد (`always_allow` / `always_block`). |

### 2.5 نطاق السياج الجغرافي وتأكيد الموقع (Geofencing & Location Check-ins)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المفاتيح الأجنبية (FKs) | عدد الحقول | الدور الوظيفي في Bark |
|---|---|---|---|---|
| **`geofence_zones`** | `zone_id` | `child_id` -> `children_profiles` | 11 | الدوائر الجغرافية الآمنة (المنزل، المدرسة، النادي) وإعدادات تنبيهات الدخول والخروج. |
| **`location_checkins`** | `checkin_id` | `child_id`, `device_id` | 12 | إحداثيات GPS المسجلة يدparamوياً عبر زر Check-in أو تلقائياً بنظام Fused Location. |
| **`geofence_events`** | `event_id` | `zone_id`, `child_id`, `device_id` | 10 | سجل أحداث اختراق أو دخول وخروج الحدود الجغرافية الآمنة. |

### 2.6 نطاق طابور المزامنة والتشخيصات (Sync Queue & Telemetry Domain)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المفاتيح الأجنبية (FKs) | عدد الحقول | الدور الوظيفي في Bark |
|---|---|---|---|---|
| **`offline_sync_queue`** | `mutation_id` | `device_id` -> `paired_devices` | 13 | طابور العمليات المعلقة غير المتصلة لإعادة إرسالها تلقائياً عبر WorkManager. |
| **`telemetry_logs`** | `log_id` | `device_id` -> `paired_devices` | 7 | سجلات صحة النظام، تشخيصات البطارية، وحالات مكافحة التلاعب (Anti-Tamper). |

### 2.7 جداول الأطر التشغيلية المفككة (Framework Tables)

| اسم الجدول (Table) | المفتاح الأساسي (PK) | المصدر البرمجي المفكك | الدور الوظيفي |
|---|---|---|---|
| **`async_storage_entries`** | `key` | `StorageDatabase_Impl` (`classes4.dex`) | تخزين شجرة حالة Redux لـ React Native تحت مفتاح `bark/@state`. |
| **`onesignal_notifications`** | `_id` | `OSDatabase` (`classes3.dex`) | التخزين الدائم لإشعارات OneSignal وتتبع الجلسات وفترات الصلاحية. |
| **`iterable_offline_tasks`** | `task_id` | `IterableDatabaseManager` (`classes3.dex`) | طابور مهام منصة Iterable للمراسلة ومتابعة الحملات غير المتصلة. |

---

## 3. المحفزات التلقائية وقواعد النزاهة (Triggers & Business Rules)

1. **`trg_accounts_updated_at` & `trg_children_profiles_updated_at` & `trg_rulesets_updated_at` & `trg_geofence_zones_updated_at`:**
   تحديث طابع `updated_at` الزمني تلقائياً بصيغة ISO-8601 عند أي تعديل على الصفوف.
2. **`trg_auto_queue_severe_risk_signal`:**
   الاعتراض التلقائي لأي إشارة خطر ذات درجة خطورة عالية (`severity_score >= 4`) وإدراجها فوراً في طابور المزامنة `offline_sync_queue` بأعلى أولوية طارئة (`priority = 1`).
3. **`trg_prune_deduplication_cache`:**
   تنظيف مخزن الـ Deduplication تلقائياً بالحذف التدريجي لأقدم 500 مدخل عند تجاوز إجمالي المخزن 10,000 إدخال.
4. **`trg_single_active_ruleset`:**
   ضمان تفعيل نمط وقت شاشة واحد فقط لكل طفل في اللحظة الزمنية الواحدة بتعطيل باقي الأنماط تلقائياً.
