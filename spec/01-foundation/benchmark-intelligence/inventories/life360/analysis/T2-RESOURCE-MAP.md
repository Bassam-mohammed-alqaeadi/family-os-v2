# خريطة الموارد والقدرات المعمارية T2 لتطبيق Life360 (T2 Resource & Capability Map)
## الحزمة: BIP-04 — Life360 Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-02  
> **مستوى الفحص:** T2 — Resource & Capability Inventory  
> **التطبيق المستهدف:** Life360 (Android)  
> **حزمة المانيفست المعتمدة:** `com.life360.android.safetymapd`  
> **المعرفات المرتبطة:** `L360-RES-000001` إلى `L360-RES-000016` (مطابقة قطعية لـ `resources.json`)

---

## 1. المنهجية والتصنيف المعماري الموحد

أُجري جرد تحليلي شامل لقدرات وموارد تطبيق **Life360** استناداً حصرياً إلى الأدلة المادية على القرص تحت `benchmarks/extracted/life360/`. تم الالتزام الصارم بقواعد حوكمة البيانات المعتمدة في ميثاق BIP وقرار مجلس القيادة D-039، وتثبيت ملفات JSON كمرجع قطعي موحد:
- **المستوى A (Level A - أدلة قطعية مباشرة):** مستخرجة مباشرة من كود الـ APK الأصلي، وملف `AndroidManifest.xml` الأصلي، وشفرات Java المفككة عبر JADX في `03_decompiled_src/`، والمكتبات الثنائية الأصلية في `lib/`.
- **المستوى B (Level B - نماذج هندسية مشتقة):** نماذج ومعادلات مشتقة أُعيدت صياغتها برمجياً لمنصة Family OS (مثل الملفات تحت `04_extracted_algorithms/` ومخطط SQL في `05_data_models_and_schemas/local_db_schema.sql`). يوثق هذا التقرير بوضوح أن نماذج المستوى B **ليست دليلاً على تطبيق APK الأصلي بل تصاميم مقترحة لـ Family OS**.
- **المستوى C (Level C - استنتاجات وافتراضات):** فرضيات تحليلية موسومة بـ `[PARTIAL-EVIDENCE]` تم إخضاعها للفحص والتدقيق (مثل تفويض كشف التصادم لمحرك Arity SDK).

---

## 2. جدول الموارد المعمارية الـ 16 لتطبيق Life360 (مطابق 100% لـ `resources.json`)

| المعرف | اسم المورد المعماري | التصنيف القياسي | مستوى الإثبات | العمق التقني | ملخص السلوك والمكونات | استراتيجية الصهر لـ Family OS |
|---|---|---|---|---|---|---|
| `L360-RES-000001` | Location Keep-Alive & Service Sentinel | Engines & Services | **Level A** | `T3_engineering` | عزل تتبع الموقع في عملية `:service` عبر `EventController`، وإشعار واجهة دائم، و `LocationWorker` watchdog لحماية التتبع من انهيارات الواجهة. | `cleanroom_reimplementation` (S1-07) |
| `L360-RES-000002` | Fused Location Sampling Controller | Algorithms | **Level A** | `T3_engineering` | تحكم ديناميكي بتوليد إحداثيات GPS استناداً للحركة والحالة الطاقية عبر FusedLocationProviderClient. | `cleanroom_reimplementation` (S1-07) |
| `L360-RES-000003` | Kalman Filter & Motion State Machine | Algorithms | **Level B** | `T3_engineering` | فلتر كالمان وآلة حالات لتنعيم قفزات GPS واكتشاف الثبات والمشي وقيادة المركبة. | `concept_adaptation` (S1-07) |
| `L360-RES-000004` | Device Health & Power Management Sentinel | Performance & Battery | **Level A** | `T2_functional` | مراقبة نسبة شحن البطارية، كشف أوضاع توفير الطاقة، وتنبيه الأسرة عند انخفاض شحن هاتف العضو. | `concept_adaptation` (S1-07) |
| `L360-RES-000005` | Circles & Places Geofencing Boundary Engine | Features & Business Rules | **Level A** | `T3_engineering` | إدارة حدود الأماكن العائلية (المنزل، المدرسة، العمل) مع دعم سياج جغرافي متعدد الطبقات. | `cleanroom_reimplementation` (S2-04) |
| `L360-RES-000006` | Geofence Boundary Hysteresis & Anti-Flapping Filter | Algorithms | **Level B** | `T3_engineering` | منطقة عازلة وشرط زمني للقضاء على التنبيهات الكاذبة والتذبذب عند الحواف الجغرافية. | `concept_adaptation` (S2-04) |
| `L360-RES-000007` | High-Frequency Sensor Telemetry Framework | Engines & Services | **Level A** | `T3_engineering` | إطار جمع قراءات الحساسات (تسارع، جيروسكوب، بارومتر) لتغذية خوارزميات السلامة. | `cleanroom_reimplementation` (S1-07) |
| `L360-RES-000008` | Crash Detection & Impact Physics Engine | Algorithms | **Level B / C** | `T3_engineering` | كشف قوى التباطؤ الشديدة ومطابقة الدلتا الحركية مع مؤقت إنذار قبل الإرسال التلقائي. | `cleanroom_reimplementation` (S1-07) |
| `L360-RES-000009` | Driving Behavior & Safety Scoring Telemetry | Analytics & Telemetry | **Level B / C** | `T3_engineering` | رصد الفرملة الحادة، التسارع المفاجئ، واستخدام الهاتف أثناء القيادة، وتوليد بطاقة أمان أسبوعية. | `concept_adaptation` (S1-07) |
| `L360-RES-000010` | Native Realm JNI Shared Library Component | Local Storage | **Level A** | `T3_engineering` | وجود ثنائيات `librealm-jni.so` وحزم `io.realm` في بنية التطبيق، موثقة كمرجع معماري دون نسب تخزين التلمتري للتطبيق. | `architectural_reference` (معماري) |
| `L360-RES-000011` | Emergency SOS & Safety Dispatch Protocol | Security & Cryptography | **Level A** | `T3_engineering` | بروتوكول استغاثة فورية محمي برمز PIN لمنع الإلغاء القسري مع تصعيد الإشعار ومشاركة الموقع الحي. | `cleanroom_reimplementation` (S1-07) |
| `L360-RES-000012` | BLE Beacon & Tile Tracking Ingestion Subsystem | Features & Business Rules | **Level A** | `T3_engineering` | مسح خلفي لحزم إعلانات بلوتوث أجهزة تتبع Tile ورفع الدفعات لخوادم السحابة (BLE Beacon Ingestion وليس شبكة Mesh). | `concept_adaptation` (S1-07) |
| `L360-RES-000013` | Realtime Location Streaming & PubNub Dispatcher | Realtime & Messaging | **Level B** | `T3_engineering` | بث الإحداثيات اللحظي عبر قنوات مخصصة لكل دائرة عائلية وفق نموذج معماري مشتق. | `concept_adaptation` (S1-07) |
| `L360-RES-000014` | REST Ingestion & Telemetry Upload Gateway | Network & API | **Level A** | `T2_functional` | بوابة استدعاءات Retrofit تضم 182 إعلاناً للدوال (155 مساراً فريداً) لرفع الإحداثيات وسجلات القيادة وإدارة الدوائر. | `concept_adaptation` (S1-07) |
| `L360-RES-000015` | Local Room / SQLite Relational Schema | Data Models & Schemas | **Level B** | `T2_functional` | سكيما قاعدة البيانات المحلية المكونة من 10 جداول علائقية لإدارة الدوائر والأماكن والرحلات. | `cleanroom_reimplementation` (S1-02 / S1-07) |
| `L360-RES-000016` | Android Manifest Platform & Process Architecture | Android Platform Integration | **Level A** | `T1_structural` | تشريح هيكلي للمانيفست والعملية المنفصلة `:service`، و31 إذناً، و29 خدمة، و49 مستقبلاً. | `architectural_reference` (معماري) |

---

## 3. التحليل المعماري المفصل للمحركات والموارد

### 3.1. محرك البقاء والحراسة المستمرة (`L360-RES-000001`)
- **الأدلة المادية:** `AndroidManifest.xml#L180-L268` و `com/life360/android/location/controllers/EventController.java` (#L1717-L1750) و `LocationWorker.java` (#L27-L58).
- **السلوك والمنطق الهندسي:**
  - ينفذ التطبيق استراتيجية عزل العمليات بتشغيل `EventController` داخل عملية مخصصة باسم `:service`.
  - هذه العزلة تحمي خدمة التتبع من الانهيار البرمجي في حال انهيار عملية الواجهة الرسومية (`RootActivity`).
  - **حدود الاستدلال:** العزلة لا تضمن استمراراً مطلقاً ضد إنهاء الخدمة من قِبل نظام أندرويد تحت ضغط الذاكرة الحاد (OOM Killer) أو سياسات توفير الطاقة الصارمة لدى مصنعي الهواتف (OEM Background Restrictions).

### 3.2. مكون مكتبة Realm JNI الأصلية (`L360-RES-000010`)
- **الأدلة المادية:** `06_network_and_telemetry/native_so_analysis.md` (#L10-L27) وثنائيات `lib/arm64-v8a/librealm-jni.so` وحزم `io.realm`.
- **السلوك والمنطق الهندسي:**
  - يتضمن التطبيق ثنائيات مكتبة `librealm-jni.so` عبر 5 معماريات، بالإضافة إلى حزم وقت التشغيل `io.realm`.
  - **حدود الاستدلال:** أثبت الفحص الشامل لملفات الكود المصدري المفكك عدم وجود أي استدعاءات مباشرة (Direct Call Sites) لمكتبة Realm داخل حزم `com.life360.*` الرئيسية. وبناءً عليه، يقتصر التوثيق المعماري على **مجرد وجود المكتبة الثنائية JNI** دون نسب تخزين التلمتري أو تقليل دورات Garbage Collection لكود التطبيق الأصلي.

### 3.3. نظام استقبال وتمرير إعلانات Tile البلوتوثية (`L360-RES-000012`)
- **الأدلة المادية:** `com/life360/android/awarenessengine/network/TileAdvertisementApi.java` (#L16-L30) و `AndroidManifest.xml#L55-L60`.
- **السلوك والمنطق الهندسي:**
  - يستمع التطبيق لحزم إعلانات البلوتوث منخفض الطاقة (BLE Advertisement Packets) الصادرة عن دبابيس Tile المحيطة.
  - يتم تجميع هذه المعرفات وحزم الإعلانات ورفعها عبر نقطة النهاية:
    `@POST("/api/v1/clients/{client_uuid}/batch_location_updates")`
  - **حدود الاستدلال:** هذه التقنية هي استيعاب لإعلانات البلوتوث الموجهة للمصنع (BLE Beacon / Advertisement Ingestion)، وليست شبكة BLE Mesh قائمة على بروتوكول شبكي بين الأجهزة (P2P Mesh Routing).
