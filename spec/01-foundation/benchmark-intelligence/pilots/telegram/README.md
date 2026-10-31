# عينة اختبار منهجية الجرد (Telegram Pilot)
## BIP-01 Methodology Verification Sample

> **تنبيه حاسم:** هذه العينة ممثلة ومحدودة لغرض اختبار المخططات والقوالب وأدوات التحقق الآلي فقط (`PILOT_ONLY`). **لا تُمثل الجرد الشامل لتطبيق تلغرام**، والمقرر تنفيذه بالكامل في المرحلة BIP-02.  
> **حظر التعديل:** لم يتم إنشاء أي نسخة مكررة من ملفات المصدر ولم يتم تعديل أي ملف أصلي داخل `benchmarks/`.

---

### 1. الموارد المختارة وأنواعها

تم اختيار 6 موارد فعلية من مجلد `benchmarks/extracted/telegram/` تمثل الأنواع الستة المطلوبة في مهمة BIP-01:

| المعرف | النوع المطلوب | الملف الفعلي في المستودع | الفئة في التصنيف الموحد | الحجم الفعلي على القرص | البصمة الرقمية (SHA-256) | فئة التخزين (Storage Tier) |
|---|---|---|---|---|---|---|
| `TG-SRC-000001` | أصل بصري (SVG) | `02_design_system_and_ui/svg_icons/abc_ic_ab_back_material.svg` | Icons & Graphics | 192 B | `d3231f144faf28771829dc3f5a5d7637f1618322a13f231f945a5efdad2be720` | `local_only` (مستثنى بـ `.gitignore`) |
| `TG-SRC-000002` | تخطيط واجهة (Layout) | `02_design_system_and_ui/all_layouts/abc_alert_dialog_material.xml` | UI Screens & Flows | 2,670 B | `0d4da7e694b9faeb77ae8302b7e0010ddce5f68200aa376b18534ba59ad832e4` | `local_only` (مستثنى بـ `.gitignore`) |
| `TG-SRC-000003` | مخطط بيانات (SQL) | `05_data_models_and_schemas/telegram_sqlite_schema.sql` | Data Models & Schemas | 31,564 B | `dbe642759542c496de33e4e8e0d7daea26c951fb9c61f7b54bfe40e782db8499` | `git_tracked` |
| `TG-SRC-000004` | بروتوكول شبكي (Network) | `06_network_and_telemetry/connections_manager_deep_dive.md` | Network & API | 5,587 B | `08b7a7421cad6f774cb70e7348f9cf94904c78c601da56c8664188af117d5bd4` | `git_tracked` |
| `TG-SRC-000005` | خوارزمية ومحرك (Algorithm) | `04_extracted_algorithms/messages_sync_and_gap_engine.kt` | Synchronization & Offline | 7,548 B | `b8347e9c9a5cf59e9d93e76e4732d8d8b07c8a1a1b7677d47f3ae8622195282f` | `git_tracked` |
| `TG-SRC-000006` | خدمات وبيئة أندرويد (Manifest) | `01_architecture_and_manifest/AndroidManifest.xml` | Android Platform Integration | 45,114 B | `cfd6ee17995e41fbb49e1670ebf766aaea3194b62ca3e09af12d7bb3e46f53bd` | `git_tracked` |

- **إجمالي الحجم الفعلي على القرص:** 92,675 بايت (مطابق تماماً لمجموع أحجام الملفات على القرص).
- **التخزين في Git:** 4 ملفات متبعة في Git، وملفان محليان فقط (`local_only`) احتراماً لسياسة `.gitignore` العامة للمستودع ودون إضعاف قواعد الاستثناء.

---

### 2. محتويات ملفات العينة التجريبية

- `sources.json`: يضم 6 سجلات مصادر فعلية موثقة ببيانات الحجم والبصمة على القرص وحالة التتبع في Git وفق `source-record.schema.json`.
- `resources.json`: يضم 6 سجلات موارد مجردة مستوفية لتقييم الملاءمة المعمارية، مع اعتماد التفويض القانوني الصريح الصادر عن مالك المشروع (`authorized_by_project_owner`) وفق `resource-record.schema.json`.
- `evidence.json`: يضم 6 أدلة مدققة بسطور محددة ومحققة على القرص (5 أدلة مباشرة `[REF]` ودليل تحليلي واحد `[PARTIAL-EVIDENCE]` لوثيقة الشبكة المشتقة) وفق `evidence-record.schema.json`.
- `relationships.json`: يضم علاقتي اعتمادية داخلية محققتين بدقة وفق `relationship-record.schema.json`.
- `report.json`: تقرير ملخص تدقيق العينة التجريبية مطابق لمخطط `application-report.schema.json`.

---

### 3. نتائج التحقق والتكامل

- جميع الملفات المرجعية تم التحقق من وجودها الفعلي على القرص بنسبة 100%.
- تم التحقق من تطابق الأحجام والبصمات الرقمية بدقة بايت-ببايت.
- تم ضبط مؤشرات السطور (Lines) على السطور الفعلية بدقة تامة دون تجاوز لحدود الملفات.
- لا توجد أي قرارات صهر نهائية ضمن هذه العينة التجريبية التزاماً بالقرار D-039.
