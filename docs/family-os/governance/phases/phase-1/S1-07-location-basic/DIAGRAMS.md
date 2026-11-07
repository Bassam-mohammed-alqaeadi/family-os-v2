# S1-07: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط (حكم المالك 2026-11-06)؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط، حكم المالك 2026-11-06) · §9 في مرحلة التصميم
- **السياق المحدد (Bounded Context):** #4 الموقع والسلامة (Location & Safety) — `CONTEXT-MAP.md` §2 صف 4
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-007 · Q-020 · Q-056 · Q-061 · Q-064 · Q-067 · Q-101 · Q-102 · Q-103 · Q-104 · Q-105 · Q-106 · D-021 · D-023 · D-038 · G-006 · G-011
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

12 حالة استخدام من السيناريوهات الستة والمتطلبات (§2/§3): الأب يرى كل المواقع الدقيقة (طفلاً ومراهقاً)، البالغ المفوَّض يرى حسب منحِه فقط، كل الأدوار تضغط SOS (لا يُحجب أبداً)، والطفل يعمل دون اتصال. وزر SOS يأتي من الغلاف (S1-01)، والرؤية تُصفّى بمنح S1-03، وتنبيهات SOS وودجة الخريطة المصغرة تُسلَّمان إلى S1-09.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Teen([المراهق])
    Child([الطفل])
    S101([غلاف التطبيق S1-01])
    S102([نظام الهوية S1-02])
    S103([الأدوار والصلاحيات S1-03])
    S109([مركز الأوامر S1-09])
    Ktor([خادم Ktor])
    SMS([بوابة SMS])

    subgraph S107 [S1-07: الموقع الأساسي وSOS]
        direction TB
        UC1(فتح خريطة العائلة)
        UC2(عرض مستوى بطارية كل جهاز)
        UC3(عرض آخر موقع معروف بوسم صادق)
        UC4(ضغط زر SOS — 3 ثوانٍ)
        UC5(إطلاق SOS دون اتصال — SMS بالإحداثيات)
        UC6(تأكيد استلام SOS)
        UC7(عرض سجل المواقع — 7 أيام)
        UC8(إدارة جهات الطوارئ العائلية)
        UC9(تتبع تكيفي في الخلفية)
        UC10(مزامنة نقاط الصندوق الصادر)
        UC11(تسليم ودجة الخريطة المصغرة)
        UC12(تسليم تنبيهات SOS)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Adult --> UC1
    Adult --> UC4
    Adult --> UC6
    Teen --> UC4
    Child --> UC4
    UC1 -.->|يصفّي حسب المنح| S103
    UC7 -.->|يصفّي حسب المنح| S103
    S101 --> UC4
    UC4 --> UC5
    UC5 --> SMS
    UC9 --> Ktor
    UC10 --> Ktor
    UC11 --> S109
    UC12 --> S109
    S102 --> UC8
```

- ملاحظة: UC9 (التتبع التكيفي) فعل نظامي لا يطلقه المستخدم — 5 دقائق عند السكون، ودقيقة عند الحركة (REQ-004 · Q-101).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الأربعة من §5 كما هي، مع ثلاثة مراجع خارجية: العضوية (S1-02)، وتنبيهات S1-09 (`alert`، النوع `sos`)، و`AuditEvent` (النواة المشتركة، النطاق `location`). ملاحظتان: بلاطات الخرائط دون اتصال (MBTiles) ونقاط الصندوق الصادر مخزنان عميل لا جداول خادم (§5-5)، و`last_known_location` صف واحد لكل عضو (PK = `member_id`). كل جدول يحمل `family_id` + عزل RLS (D-021)، وسجل المواقع يُحذف تلقائياً بعد 7 أيام (REQ-014). و`last_known_location.expires_at` = آخر قراءة + 7 أيام — يُحذف تلقائياً (Q-166).

```mermaid
erDiagram
    family ||--o{ location_point : "له نقاط موقع"
    family ||--o{ last_known_location : "له آخر موقع معروف"
    family ||--o{ sos_alert : "له تنبيهات SOS"
    family ||--o{ emergency_contact : "له جهات طوارئ"
    membership ||--o{ location_point : "عضو يبلّغ نقاطاً"
    membership ||--|| last_known_location : "عضو له آخر موقع"
    membership ||--o{ sos_alert : "عضو يستغيث"
    membership ||--o{ emergency_contact : "بالغ جهة طوارئ"
    sos_alert ||--o{ alert : "تنبيهه يظهر في S1-09"
    sos_alert ||--o{ AuditEvent : "إطلاقه وتأكيده يُدقَّقان"
    emergency_contact }o--|| membership : "أضيف بواسطة عضو"

    location_point {
        uuid point_id PK
        uuid family_id FK
        uuid member_id FK
        double lat
        double lng
        double accuracy
        int battery
        timestamptz at
        bigint server_seq
    }
    last_known_location {
        uuid member_id PK, FK
        uuid family_id FK
        double lat
        double lng
        double accuracy
        int battery
        timestamptz at
        timestamptz expires_at
    }
    sos_alert {
        uuid sos_id PK
        uuid family_id FK
        uuid member_id FK
        double lat
        double lng
        timestamptz at
        text status
        text channel
        uuid acknowledged_by
        timestamptz acknowledged_at
        uuid resolved_by
        timestamptz resolved_at
    }
    emergency_contact {
        uuid contact_id PK
        uuid family_id FK
        uuid member_id FK
        text phone
        uuid added_by
        timestamptz added_at
    }
    family {
        uuid id PK
    }
    membership {
        uuid id PK
    }
    alert {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
    }
```

## 3. التسلسل (Sequence) — من عقود §4

ثمانية مخططات، كل واحد لتدفق واحد:
- **عقد MQTT (Q-168 — الإحالة الصريحة إلى `docs/family-os/governance/architecture/MQTT-BROKER-SPEC.md`):** الوسيط Eclipse Mosquitto 2.x — عقدة واحدة في المرحلة 1 — TLS 1.2+ على المنفذ 8883 + mTLS (شهادة خادم + شهادة جهاز)؛ وSOS (`family/{family_id}/sos/new` + الإقرار) QoS 1 + إقرار إلزامي؛ والموقع الحي (`family/{family_id}/location/updated`) QoS 0؛ وبلا QoS 2؛ والعزل ببادئة `family/{family_id}/` + ACL خادمي؛ والشهادات سنتان مع تجديد تلقائي وإبطال فوري. لا `command_id` في هذا النظام — الأوامر ملك S1-10 (§4-3).

### 3-أ. التتبع التكيفي — الإبلاغ عن نقطة موقع (REQ-004/005/006 — §4-1 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    participant خدمة as Kotlin
    participant الخادم as Ktor
    participant المخزن as PG
    خدمة->>خدمة: حساس الحركة يحدد التردد (5 دقائق سكون / دقيقة حركة)
    خدمة->>خدمة: قراءة GPS + تنعيم Kalman (رفض القفزات الوهمية)
    alt متصل
        خدمة->>الخادم: POST /api/v1/families/{id}/locations {lat, lng, accuracy, battery, at}
        الخادم->>المخزن: حفظ location_point + تحديث last_known_location
        الخادم-->>خدمة: النقطة + server_seq
        الخادم->>الخادم: نشر family/{family_id}/location/updated (MQTT — QoS 0)
    else دون اتصال
        خدمة->>خدمة: حفظ النقطة في الصندوق الصادر (محلي)
        Note over خدمة,الخادم: تُزامَن عند عودة الاتصال بلا تكرار؛ نقاط أقدم من 7 أيام تُتجاهل
    end
```

- بطارية منخفضة جداً تقلّل تردد التتبع تلقائياً لحفظ ما تبقى للطوارئ (§7-8)؛ ولا تنبيه بطارية منخفضة في المرحلة 1 — عرض فقط (§6-3).

### 3-ب. خريطة العائلة — قراءة آخر المواقع (REQ-001/002/003/011/012 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant التطبيق as Flutter
    participant الخادم as Ktor
    participant المخزن as PG
    Father->>التطبيق: فتح خريطة العائلة
    التطبيق->>الخادم: GET /api/v1/families/{id}/locations
    الخادم->>الخادم: تصفية حسب منح location.view (deny-override — Q-007)
    الخادم->>المخزن: قراءة last_known_location لكل عضو مرئي
    المخزن-->>الخادم: المواقع + البطارية + الوسم الزمني
    الخادم-->>التطبيق: [{member_id, lat, lng, accuracy, battery, at}]
    التطبيق->>التطبيق: حي أم آخر موقع معروف؟ (وسم "آخر تحديث: قبل X" — لا يُعرض كحي)
    التطبيق-->>Father: خريطة OSM + مواقع حية + بطارية كل جهاز (قراءات p95 < 300ms — Q-061)
```

- الأب يرى الموقع الدقيق لكل قاصر — طفلاً كان أو مراهقاً (Q-102)؛ والبالغ المفوَّض يرى حسب منحِه فقط (REQ-012).
- قناة المنصة (§4-3): `startLocationService()` تشغّل خدمة الموقع في الخلفية (التتبع التكيفي)؛ و`getLastKnownLocation() → {lat, lng, at}` تقرأ آخر موقع مخزن؛ و`triggerSos()` مرسومة في 3-ج (سطر 208).
- حد قراءات p95 < 300ms مصدره **Q-061 في ARCHITECTURE.md** — نص S1-07 SPEC يذكر SOS <10s فقط (REQ-008)؛ والقيمة صحيحة per Q-061.

### 3-ج. SOS متصل — تنبيه في أقل من 10 ثوانٍ (REQ-007/008 — §4-1 + §4-2 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant الغلاف as Shell
    participant الموقع as S107
    participant الخادم as Ktor
    participant التدقيق as Audit
    participant البالغون as Adults
    Child->>الغلاف: ضغط مطول 3 ثوانٍ على زر SOS (Q-067)
    الغلاف->>الموقع: triggerSos() — MethodChannel (§4-3)
    الموقع->>الخادم: POST /api/v1/families/{id}/sos {lat, lng, at} + ترويسة Idempotency-Key (UUID لكل حدث SOS — يمنع التنبيه المكرر عند إعادة الإرسال)
    alt يوجد SOS نشط
        الخادم-->>الموقع: LOC_SOS_ALREADY_ACTIVE — تُعاد بيانات النشط بدل التكرار
    else لا SOS نشط
        الخادم->>الخادم: إنشاء sos_alert (status=active, channel=server)
        الخادم->>البالغون: نشر family/{family_id}/sos/new (MQTT — QoS 1 — أولوية عالية)
        الخادم->>التدقيق: AuditEvent (إطلاق SOS — النطاق location)
        الخادم-->>الموقع: {sos_id, at}
        البالغون-->>Child: التنبيه يصل للأب وكل البالغين في أقل من 10 ثوانٍ مع الموقع (Q-061 · Q-104)
    end
```

- SOS متاح لكل الأدوار دائماً ولا يُحجب بأي صلاحية (Q-067 · §6-2)؛ ومفتاح `location.sos.trigger` لكل الأدوار — حتى الطفل (§6-1).

### 3-د. SOS دون اتصال — SMS بالإحداثيات (REQ-009/017 — §4-1 + §6-3)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant الموقع as S107
    participant الخادم as Ktor
    participant الوالدان as Parents
    Child->>الموقع: ضغط SOS 3 ثوانٍ — لا اتصال بالخادم
    الموقع->>الموقع: قرار الإرسال من مرآة الحصة المحلية (Q-163) — لا فحص خادمي دون اتصال
    alt الحصة متبقية
        الموقع->>الوالدان: SMS موقّع HMAC-SHA256 (مقتطع إلى 10 أحرف) بمفتاح الجهاز فوق (العائلة، العضو، الوقت، الإحداثيات) — تطبيق الأب يتحقق من التوقيع قبل عرض التنبيه (REQ-017)
        الموقع->>الموقع: تسجيل sos_alert محلياً (channel=sms) للمزامنة لاحقاً
    else الحصة منتهية — الطوارئ الثلاث متبقية
        الموقع->>الوالدان: SMS طارئ موقّع HMAC-SHA256 (10 أحرف — REQ-017) (1 من 3 في الدورة — SOS فقط) (Q-163)
        الموقع->>الوالدان: إشعار الأب فوراً بكل رسالة طارئة
    else الحصة والطوارئ الثلاث مستنفدة
        الموقع->>الموقع: SOS يبقى "معلقاً" على الجهاز — لا يُعرض كأنه أُرسل
        الموقع->>الموقع: إشعار النفاد يُحفظ في طابور على الجهاز للتسليم عند عودة الاتصال
        الموقع-->>Child: عرض محلي للطفل: SOS معلّق — سيُرسَل عند عودة الاتصال
        Note over الموقع,الخادم: لا قناة لإشعار الأب فوراً دون اتصال — لا SMS متبقية ولا مسار خادم؛ ويُسلَّم إشعار النفاد عبر الخادم فور عودة الاتصال (§7-5)
    end
```

- كل SMS صادر يُحسب من حصة الخطة (Q-055)؛ الحصص: مجانية 20 رسالة/شهر، مميزة 100 رسالة/شهر، تعبئة 50 رسالة (Q-129 · REQ-017)؛ والتعبئة وشراء الحزم عبر S1-04 (REQ-017 · Q-106)؛ وتجاوز الطوارئ الثلاث لا يُمنح إلا لـ SOS — لا OTP ولا غيره (§6-2)؛ وقرار الإرسال دون اتصال من مرآة الحصة المحلية، وكل SMS استغاثة موقّع HMAC-SHA256 (مقتطع إلى 10 أحرف) بمفتاح الجهاز فوق (العائلة، العضو، الوقت، الإحداثيات) ويتحقق تطبيق الأب من التوقيع قبل العرض (REQ-017 · Q-163).
- **حد الإشعار دون اتصال (صريح):** عند استنفاد الحصة + الطوارئ الثلاث لا توجد أي قناة لإشعار الأب "فوراً" — فإشعار النفاد يُحفَظ في طابور على الجهاز ويُسلَّم عند عودة الاتصال، ويُعرض محلياً للطفل فقط. (الحد نفسه خطر مقبول موثَّق بحكم المالك — Q-163.)
- **مستلمو SMS دون اتصال (Q-138):** نفس مجموعة المستلمين — الأب + كل البالغين + جهات الطوارئ.

### 3-هـ. تأكيد استلام SOS (REQ-008 — §4-1 + §4-2)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant التطبيق as Flutter
    participant الخادم as Ktor
    participant التدقيق as Audit
    participant البالغون as Adults
    Father->>التطبيق: تأكيد استلام تنبيه SOS
    التطبيق->>الخادم: POST /api/v1/families/{id}/sos/{sosId}/acknowledge
    الخادم->>الخادم: sos_alert.status = acknowledged + acknowledged_by + acknowledged_at
    الخادم->>البالغون: نشر family/{family_id}/sos/acknowledged (MQTT — QoS 1)
    الخادم->>التدقيق: AuditEvent (تأكيد SOS — النطاق location)
    الخادم-->>التطبيق: {sos_id, acknowledged_by, at}
    التطبيق-->>Father: مؤكد — ثم يتصل بالطفل
    Father->>التطبيق: حل التنبيه بعد التعامل معه (Q-136)
    التطبيق->>الخادم: POST /api/v1/families/{id}/sos/{sosId}/resolve
    الخادم->>الخادم: sos_alert.status = resolved + resolved_by + resolved_at
    الخادم->>البالغون: نشر family/{family_id}/sos/resolved (MQTT — QoS 1)
    الخادم->>التدقيق: AuditEvent (حل SOS — النطاق location)
    الخادم-->>التطبيق: {sos_id, resolved_by, at, status: "resolved"}
```

- SOS بالخطأ (ضغط عرضي): الأب يؤكد أو يلغي عبر نقطة الحل `POST /api/v1/families/{id}/sos/{sosId}/resolve` (الأب + البالغ المفوَّض حسب القالب — Q-136)؛ والحالة تصبح `resolved` ويتوقف التصعيد؛ والإلغاء يُسجَّل في التدقيق (§7-10).

### 3-و. إدارة جهات الطوارئ العائلية (REQ-010 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant التطبيق as Flutter
    participant الخادم as Ktor
    participant المخزن as PG
    Father->>التطبيق: فتح إدارة جهات الطوارئ
    التطبيق->>الخادم: GET /api/v1/families/{id}/emergency-contacts
    الخادم-->>التطبيق: [{contact_id, member_id, phone}]
    Father->>التطبيق: إضافة العم (بالغ في العائلة) برقم هاتفه
    التطبيق->>الخادم: POST /api/v1/families/{id}/emergency-contacts {member_id, phone}
    الخادم->>المخزن: حفظ emergency_contact (added_by = الأب)
    الخادم-->>التطبيق: جهة الطوارئ
    Note over Father,الخادم: عند أي SOS لاحق يصل التنبيه للعم أيضاً مع الأب وكل البالغين
    Father->>التطبيق: حذف جهة طوارئ
    التطبيق->>الخادم: DELETE /api/v1/families/{id}/emergency-contacts/{contactId}
    الخادم-->>التطبيق: {ok: true}
```

- إدارة جهات الطوارئ للأب فقط (`location.emergency.manage` — §6-1)؛ وجهة محذوفة أو مبدّلة الرقم لا يصلها SOS لاحق (§7-11).

### 3-ز. سجل المواقع — 7 أيام (REQ-013/014 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant التطبيق as Flutter
    participant الخادم as Ktor
    participant المخزن as PG
    Father->>التطبيق: طلب سجل مواقع عضو (7 أيام كحد أقصى)
    التطبيق->>الخادم: GET /api/v1/families/{id}/members/{memberId}/locations?from&to
    الخادم->>الخادم: فحص منح location.history.view (deny-override — Q-007)
    alt بلا منح رؤية
        الخادم-->>التطبيق: LOC_NOT_VISIBLE
    else عضو غير موجود
        الخادم-->>التطبيق: LOC_MEMBER_NOT_FOUND
    else طلب أقدم من 7 أيام
        الخادم-->>التطبيق: فارغ — محذوف تلقائياً، لا خطأ (§7-12)
    else طلب صالح
        الخادم->>المخزن: قراءة location_point في النطاق
        المخزن-->>الخادم: [{lat, lng, at}]
        الخادم-->>التطبيق: السجل
    end
```

### 3-ح. سلم تصعيد SOS — مهلة إقرار 5 دقائق وإعادة دفع حتى الإقرار أو الحل (REQ-018 — §6-3)

```mermaid
sequenceDiagram
    autonumber
    participant Ktor as الخادم
    participant Adults as البالغون
    participant Audit as التدقيق
    participant Father as الأب
    Ktor->>Adults: دفع تنبيه SOS فوراً — لكل البالغين (family/{family_id}/sos/new — أولوية عالية)
    Ktor->>Ktor: مؤقت مهلة إقرار 5 دقائق
    alt أقرّ أي بالغ خلال 5 دقائق
        Adults-->>Ktor: POST .../sos/{sosId}/acknowledge
        Ktor->>Ktor: sos_alert.status = acknowledged + acknowledged_by + acknowledged_at
        Ktor->>Adults: نشر family/{family_id}/sos/acknowledged (MQTT — QoS 1)
        Ktor->>Audit: AuditEvent (تأكيد SOS — النطاق location)
    else بلا إقرار خلال 5 دقائق
        loop إعادة الدفع والتذكير حتى الإقرار أو الحل
            Ktor->>Adults: إعادة دفع التنبيه + تذكير (دفع + تنبيه)
            Ktor->>Ktor: مؤقت 5 دقائق جديد
        end
    end
    opt الأب أو المفوَّض يحل التنبيه (REQ-018)
        Father->>Ktor: POST /api/v1/families/{id}/sos/{sosId}/resolve
        Ktor->>Ktor: sos_alert.status = resolved + resolved_by + resolved_at — يتوقف التصعيد
        Ktor->>Adults: نشر family/{family_id}/sos/resolved (MQTT — QoS 1)
        Ktor->>Audit: AuditEvent (حل SOS — النطاق location)
    end
```

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الستة (§2)

```mermaid
flowchart TD
    Start([الأب يفتح خريطة العائلة]) --> Load[تحميل آخر المواقع + البطارية]
    Load --> Fresh{الموقع حي؟}
    Fresh -->|نعم| Live[عرض حي على خريطة OSM + بطارية كل جهاز]
    Fresh -->|لا| Stale["عرض آخر موقع معروف + «آخر تحديث: قبل X» — لا يُعرض كحي"]
    Live --> LowBatt{بطارية 15%؟}
    LowBatt -->|نعم| Msg[رسالة للطفل: اشحن هاتفك]
    LowBatt -->|لا| Watch[اطمئنان كامل في نظرة واحدة]
    Stale --> Watch
    Msg --> Watch
    Child([الطفل يضغط SOS 3 ثوانٍ]) --> Net{اتصال بالخادم؟}
    Net -->|نعم| Online[تنبيه للأب + كل البالغين < 10 ثوانٍ مع الموقع]
    Net -->|لا| Quota{حصة SMS أم طوارئ متبقية؟}
    Quota -->|نعم| SMS["SMS بالإحداثيات إلى هواتف الأب وكل البالغين وجهات الطوارئ (Q-138)"]
    Quota -->|لا| Pending[SOS معلّق على الجهاز + إشعار النفاد في الطابور — لا يُعرض كأنه أُرسل]
    Online --> Ack[الأب يؤكد ويتصل بالطفل]
    Ack --> Resolve[الأب يحل التنبيه بعد التعامل — يتوقف التصعيد + نشر sos/resolved]
    SMS --> Ack
    Pending --> Reconnect{عودة الاتصال؟}
    Reconnect -->|نعم| Online
    Teen([الأب يرى المراهق]) --> Precise[موقع دقيق دائماً — مثل الطفل — بلا مشاركة ضبابية]
    Father2([الأب يدير جهات الطوارئ]) --> Contacts[إضافة / حذف بالغ برقم هاتفه]
    Contacts --> Next[SOS اللاحق يصل للعم أيضاً]
```

- ملاحظة: بطارية 15% مثال من السيناريو 7-1 — لا عتبة تنبيه محددة في المواصفة؛ ولا تنبيه بطارية منخفضة في المرحلة 1 (§6-3).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D4 جداول خادم (PostgreSQL) + ثلاثة مخازن عميل (C1–C3) على الجهاز. الأحداث MQTT تنشر من 1.0 و3.0 و4.0؛ وتنبيهات SOS وودجة الخريطة المصغرة تُسلَّمان إلى S1-09 (REQ-015/016).

- **تغطية نقاط §4:** كل نقاط §4-1 التسع مرسومة في §3 (locations قراءة/إبلاغ/سجل، sos إطلاق/تأكيد/حلّ، emergency-contacts قراءة/إضافة/حذف)؛ والتسلسلات تغطي التدفقات الأساسية فقط.

```mermaid
flowchart LR
    Child([الطفل / المراهق])
    Father([الأب / البالغ المفوَّض])
    S101([غلاف التطبيق S1-01])
    S103([الأدوار والصلاحيات S1-03])
    S104([الخطط والفواتير S1-04])
    S109([مركز الأوامر S1-09])

    subgraph S107 [S1-07: الموقع وSOS]
        P1(1.0 التتبع التكيفي — GPS + Kalman)
        P2(2.0 قراءة الخريطة والسجل — تصفية حسب المنح)
        P3(3.0 إطلاق SOS — تصعيد)
        P4(4.0 تأكيد وحل SOS)
        P5(5.0 إدارة جهات الطوارئ)
        P6(6.0 مزامنة الصندوق الصادر)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 location_point)]
        D2[(D2 last_known_location)]
        D3[(D3 sos_alert)]
        D4[(D4 emergency_contact)]
        C1[(C1 نقاط الصندوق الصادر — محلي)]
        C2[(C2 بلاطات MBTiles دون اتصال — محلي)]
        C3[(C3 مرآة الحصة المحلية — رصيد + طوارئ + نهاية الدورة — محلي)]
    end

    Ktor([خادم Ktor])
    MQTT([وسيط MQTT — Mosquitto 2.x — 8883 + mTLS])
    SMS([بوابة SMS])
    Audit([AuditEvent])

    Child -->|قراءات GPS + بطارية| P1
    P1 -->|نقطة منعمّة| D1
    P1 -->|تحديث آخر موقع| D2
    P1 -->|"family/{family_id}/location/updated — QoS 0"| MQTT
    P1 -->|دون اتصال: حفظ النقطة| C1
    C1 -->|عند عودة الاتصال| P6
    P6 -->|نقاط بلا تكرار| D1
    P6 -->|نقاط أقدم من 7 أيام: تُتجاهل| P6
    Father -->|فتح الخريطة / السجل| P2
    S103 -->|منح location.view / history.view| P2
    D2 -->|آخر المواقع + البطارية| P2
    D1 -->|سجل 7 أيام| P2
    C2 -->|بلاطات دون اتصال| P2
    P2 -->|خريطة OSM + مواقع + بطارية| Father
    P2 -->|ودجة الخريطة المصغرة| S109
    S101 -->|ضغط SOS 3 ثوانٍ| P3
    Child -->|ضغط SOS 3 ثوانٍ| P3
    P3 -->|تنبيه SOS| D3
    P3 -->|"family/{family_id}/sos/new — QoS 1"| MQTT
    MQTT -->|تنبيه < 10 ثوانٍ| Father
    P3 -->|دون اتصال: SMS بالإحداثيات| SMS
    SMS -->|إحداثيات| Father
    S104 -->|حصة SMS + 3 طوارئ| P3
    Ktor -->|مزامنة المرآة عند كل اتصال| C3
    C3 -->|قرار الإرسال دون اتصال| P3
    P3 -->|تحديث المرآة بعد كل SMS| C3
    P3 -->|تسجيل الإطلاق| Audit
    Father -->|تأكيد الاستلام| P4
    P4 -->|status = acknowledged| D3
    P4 -->|"family/{family_id}/sos/acknowledged — QoS 1"| MQTT
    P4 -->|"family/{family_id}/sos/resolved — QoS 1"| MQTT
    P4 -->|تسجيل التأكيد| Audit
    P4 -->|تنبيهات SOS تظهر في S1-09| S109
    Father -->|"حل التنبيه (POST .../resolve)"| P4
    P4 -->|status = resolved + resolved_by/at| D3
    P4 -->|تسجيل الحل| Audit
    P4 -->|إيقاف التصعيد + تحديث العرض| S109
    Father -->|إضافة / حذف جهة طوارئ| P5
    P5 -->|حفظ / حذف| D4
    D4 -->|هواتف جهات الطوارئ| P3
```

## 6. مخطط النشاط (Activity) — دورة حياة الموقع وSOS

المسارات الأربعة (جهاز الطفل / وحدة Kotlin / الخادم / الأب والبالغون) كمسارات متوازية. والتتبع التكيفي يعمل **بالتوازي** مع استخدام التطبيق، وSOS له مساران (متصل / SMS) يلتقيان عند التأكيد.

```mermaid
flowchart LR
    subgraph Device [جهاز الطفل]
        direction TB
        U1([فتح التطبيق])
        U2[ضغط SOS 3 ثوانٍ]
        U3[فعل دون اتصال — حفظ في الصندوق]
        U4([إغلاق / فقدان الاتصال])
    end
    subgraph Kotlin [وحدة Kotlin — خدمة الموقع]
        direction TB
        K1[قراءة GPS كل 5 دقائق سكون / دقيقة حركة]
        K2[تنعيم Kalman — رفض القفزات الوهمية]
        K3{اتصال؟}
        K4[إرسال النقطة إلى الخادم]
        K5[حفظ النقطة في الصندوق الصادر]
        K6[مزامنة الصندوق عند عودة الاتصال]
        K7[إطلاق SOS: triggerSos]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[حفظ location_point + تحديث last_known_location]
        V2["نشر family/{family_id}/location/updated"]
        V3["إنشاء sos_alert + نشر family/{family_id}/sos/new"]
        V4[حذف سجل أقدم من 7 أيام تلقائياً]
        V5["تأكيد SOS + نشر family/{family_id}/sos/acknowledged"]
        V6["حل SOS + نشر family/{family_id}/sos/resolved + إيقاف التصعيد"]
    end
    subgraph Parent [الأب / البالغون]
        direction TB
        F1[فتح خريطة العائلة]
        F2{الموقع حي؟}
        F3[عرض حي + بطارية]
        F4[عرض آخر موقع معروف بوسم صادق]
        F5[استلام تنبيه SOS < 10 ثوانٍ]
        F6[تأكيد الاستلام والاتصال بالطفل]
        F7[إدارة جهات الطوارئ]
    end

    U1 --> K1
    K1 --> K2
    K2 --> K3
    K3 -->|نعم| K4
    K3 -->|لا| K5
    K4 --> V1
    V1 --> V2
    K5 --> U3
    U3 --> K6
    K6 --> K4
    V1 --> V4
    U2 --> K7
    K7 --> V3
    V3 --> F5
    V3 -->|بلا إقرار خلال 5 دقائق: إعادة دفع + تذكير حتى الإقرار أو الحل| V3
    F5 --> F6
    F6 --> V5
    V5 --> V6
    F1 --> F2
    F2 -->|نعم| F3
    F2 -->|لا| F4
    F1 --> F7
    U4 --> K5
```

- SOS دون اتصال لا يظهر في هذا المخطط كمسار خادم: الجهاز يرسل SMS بالإحداثيات مباشرة إلى هواتف الأب وكل البالغين وجهات الطوارئ (Q-138) (Q-103) ثم يُزامَن التنبيه عند عودة الاتصال — انظر التسلسل 3-د.
- وعند استنفاد الحصة + الطوارئ الثلاث يُحفظ إشعار النفاد في الطابور ويُعرض محلياً للطفل فقط — لا إشعار فوري للأب دون اتصال (انظر 3-د)؛ ومستلمو SMS دون اتصال هم نفس المجموعة — الأب + كل البالغين + جهات الطوارئ (Q-138).
- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس الشاشة والمدخلات (نمط S1-01 §7)؛ ونقاط الصندوق الصادر أقدم من 7 أيام تُتجاهل عند المزامنة (§7-13).
