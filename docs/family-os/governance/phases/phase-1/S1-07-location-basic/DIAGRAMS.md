# S1-07: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-08 — D-2، بعد موجة الإصلاح 0e4a3e2..f7da470)؛ والمواصفة معتمدة بالكامل في التخطيط (حكم المالك 2026-11-06)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط، حكم المالك 2026-11-06) · §9 أُغلق تصميمه مع بنود محمولة — Q-408، 2026-11-17
- **إعادة الرسم 2026-11-18 (Q-428) على التصميم المعتمد (Q-408 · Q-409 · Q-416 · Q-424 · Q-425):** رُسم كل ما كان في تنبيهَي Q-408 وQ-409، فالرسم والنص متطابقان ولا ملاحظة تسود على رسم. ما تغيّر: (1) حالات الاستخدام صارت 19: الكبار على الخريطة ومفتاح «مشاركة موقعي»، «حدّث الآن»، «ما يراه الأبناء» للمالك وحده، «من يرى مكاني»، وحذف الاستغاثات السابقة؛ **وزر الاستغاثة على أجهزة الأبناء وحدها (Q-416)** فحُذف سهما الأب والبالغ إليه؛ (2) مخطط البيانات: جدولا `location_visibility` و`location_sharing` وحقلا `coords_expire_at` و`expires_at` في `sos_alert`؛ وجهة الطوارئ رقم خارجي فقط؛ (3) التسلسل 3-و أُعيد رسمه (أرقام خارجية، وحذف بتأكيد ثم تراجع)، وأربعة تسلسلات جديدة: 3-ط «حدّث الآن»، 3-ي «مشاركة موقعي»، 3-ك «ما يراه الأبناء»، 3-ل حفظ الاستغاثات السابقة؛ (4) تدفق المستخدم أُعيد رسمه: مبدّل الأفراد وبطاقة الفرد، العنوان بسلّمه بلا إحداثيات، ومدخل «أحتاج مساعدة»؛ (5) لا أماكن مسمّاة ولا سور جغرافي في المرحلة 1 (المرحلة 5 — Q-056).
- **السياق المحدد (Bounded Context):** #4 الموقع والسلامة (Location & Safety) — `CONTEXT-MAP.md` §2 صف 4
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-007 · Q-020 · Q-056 · Q-061 · Q-064 · Q-067 · Q-101 · Q-102 · Q-103 · Q-104 · Q-105 · Q-106 · Q-129 · Q-136 · Q-138 · Q-160 · Q-161 · Q-163 · Q-166 · Q-168 · Q-283 · Q-284 · Q-285 · Q-286 · Q-287 · Q-288 · D-021 · D-023 · D-038 · G-006 · G-011
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

19 حالة استخدام من السيناريوهات الستة والمتطلبات (§2/§3) + حالتا REQ-017/REQ-018 (UC13/UC14) + خمس من REQ-019…REQ-022 (UC15…UC19 — Q-409): الأب يرى كل المواقع الدقيقة (طفلاً ومراهقاً)، البالغ المفوَّض يرى حسب منحِه فقط، كل الأدوار تضغط SOS (لا يُحجب أبداً)، والطفل يعمل دون اتصال. وزر SOS يأتي من الغلاف (S1-01)، والرؤية تُصفّى بمنح S1-03، وتنبيهات SOS وودجة الخريطة المصغرة تُسلَّمان إلى S1-09.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Teen([المراهق])
    Child([الطفل])
    S101([غلاف التطبيق S1-01])
    S102([نظام الهوية S1-02])
    S103([الأدوار والصلاحيات S1-03])
    S104([الخطط والفواتير S1-04])
    S109([مركز الأوامر S1-09])
    Ktor([خادم Ktor])
    SMS([بوابة SMS])

    subgraph S107 [S1-07: الموقع الأساسي وSOS]
        direction TB
        UC1(فتح خريطة العائلة — كل الأفراد، الأبناء والكبار — REQ-011/019)
        UC2(عرض مستوى بطارية كل جهاز — REQ-002)
        UC3(عرض آخر موقع معروف بوسم صادق)
        UC4(ضغط زر SOS — 3 ثوانٍ — على أجهزة الأبناء وحدها — Q-416)
        UC5(إطلاق SOS دون اتصال — SMS بالإحداثيات)
        UC6(تأكيد استلام SOS)
        UC7(عرض سجل المواقع — 7 أيام)
        UC8(إدارة جهات الطوارئ — أرقام خارجية)
        UC9(تتبع تكيفي في الخلفية)
        UC10(مزامنة نقاط الصندوق الصادر — REQ-006)
        UC11(تسليم ودجة الخريطة المصغرة)
        UC12(تسليم تنبيهات SOS إلى S1-09 — REQ-016)
        UC13(عدّ حصة SMS والطوارئ الثلاث — REQ-017)
        UC14(حل تنبيه SOS — REQ-018)
        UC15(مشاركة موقعي — البالغ يوقفها ويعيدها — REQ-019)
        UC16(حدّث الآن — قراءة فورية بنتيجة صادقة — REQ-020)
        UC17(ما يراه الأبناء — المالك وحده — REQ-021)
        UC18(من يرى مكاني)
        UC19(حذف الاستغاثات السابقة تلقائياً — REQ-022)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC14
    Adult --> UC1
    Adult --> UC6
    Adult --> UC14
    Father --> UC15
    Adult --> UC15
    Father --> UC16
    Adult --> UC16
    Father -->|المالك وحده — بلا مفتاح يُفوَّض| UC17
    Teen --> UC18
    Child --> UC18
    Adult --> UC18
    UC17 -.->|يحدّ ما يراه الابن| UC1
    UC15 -.->|المتوقف لا يُعرض له موقع| UC1
    Ktor --> UC19
    Teen --> UC1
    Teen --> UC2
    Teen --> UC3
    Teen --> UC4
    Teen --> UC11
    Child --> UC1
    Child --> UC2
    Child --> UC3
    Child --> UC4
    Child --> UC11
    Child --> UC13
    UC13 --> SMS
    S104 --> UC13
    UC14 --> S109
    UC1 -.->|يصفّي حسب المنح| S103
    UC7 -.->|يصفّي حسب المنح| S103
    S101 --> UC4
    UC4 --> UC5
    UC5 --> SMS
    UC9 --> Ktor
    UC10 --> Ktor
    UC11 --> S109
    UC12 --> S109
    S102 -.->|العضوية والأعمار| UC1
```

- ملاحظة: UC9 (التتبع التكيفي) فعل نظامي لا يطلقه المستخدم — 5 دقائق عند السكون، ودقيقة عند الحركة (REQ-004 · Q-101).
- ملاحظة: الطفل والمراهق يريان مكانهما فقط افتراضاً؛ ومن يظهر لهما من إخوتهما ووالديهما يقرره المالك في «ما يراه الأبناء» (UC17 — REQ-021)، اتجاهاً واحداً، والمكان الحالي فقط بلا بطارية ولا سجل. والبالغ يستقبل الاستغاثة ويؤكدها ويحلّها ولا يرسلها من التطبيق (Q-416). ومدخل «أحتاج مساعدة» عند الطفل والمراهق يفضي إلى الوالدين أو إلى الاستغاثة وليس بديلاً عن زرها (Q-424).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الأربعة من §5 كما هي، مع ثلاثة مراجع خارجية: العضوية (S1-02)، وتنبيهات S1-09 (`alert`، النوع `sos`)، و`AuditEvent` (النواة المشتركة، النطاق `location`). ملاحظتان: بلاطات الخرائط دون اتصال (MBTiles) ونقاط الصندوق الصادر مخزنان عميل لا جداول خادم (§5-5)، و`last_known_location` صف واحد لكل عضو (PK = `member_id`). كل جدول يحمل `family_id` + عزل RLS (D-021)، وسجل المواقع يُحذف تلقائياً بعد 7 أيام (REQ-014). و`last_known_location.expires_at` = آخر قراءة + 7 أيام — يُحذف تلقائياً (Q-166). و`emergency_contact.member_id` قابل للفراغ — NULL لرقم خارجي يضيفه الأب صراحةً (Q-287)؛ والخارجية تستلم SOS دون تتبع مستمر.

```mermaid
erDiagram
    family ||--o{ location_point : "له نقاط موقع"
    family ||--o{ last_known_location : "له آخر موقع معروف"
    family ||--o{ sos_alert : "له تنبيهات SOS"
    family ||--o{ emergency_contact : "له جهات طوارئ"
    membership ||--o{ location_point : "عضو يبلّغ نقاطاً"
    membership ||--|| last_known_location : "عضو له آخر موقع"
    membership ||--o{ sos_alert : "عضو يستغيث"
    family ||--o{ location_visibility : "ما يراه الأبناء — REQ-021"
    membership ||--o{ location_visibility : "قاصر يرى / فرد يُعرض"
    membership ||--o| location_sharing : "بالغ يشارك موقعه — REQ-019"
    sos_alert ||--o{ alert : "تنبيهه يظهر في S1-09"
    sos_alert ||--o{ AuditEvent : "إطلاقه وتأكيده يُدقَّقان"
    emergency_contact }o--|| membership : "أضيف بواسطة عضو"

    location_point {
        uuid point_id PK
        uuid family_id FK
        uuid member_id FK
        uuid device_id FK
        uuid client_point_id
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
        uuid device_id FK
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
        timestamptz coords_expire_at
        timestamptz expires_at
    }
    location_visibility {
        uuid family_id FK
        uuid viewer_member_id PK
        uuid subject_member_id PK
        uuid set_by FK
        timestamptz set_at
    }
    location_sharing {
        uuid member_id PK
        uuid family_id FK
        boolean paused
        timestamptz changed_at
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
    participant Kotlin as خدمة
    participant Ktor as الخادم
    participant PG as المخزن
    Kotlin->>Kotlin: حساس الحركة يحدد التردد (5 دقائق سكون / دقيقة حركة)
    Kotlin->>Kotlin: قراءة GPS + تنعيم Kalman (رفض القفزات الوهمية)
    alt متصل
        Kotlin->>Ktor: POST /api/v1/families/{id}/locations {device_id, client_point_id, lat, lng, accuracy, battery, at}
        Ktor->>PG: حفظ location_point + تحديث last_known_location
        Ktor-->>Kotlin: النقطة + server_seq
        Ktor->>Ktor: نشر family/{family_id}/location/updated (MQTT — QoS 0)
    else دون اتصال
        Kotlin->>Kotlin: حفظ النقطة في الصندوق الصادر (محلي)
        Note over Kotlin,Ktor: تُزامَن عند عودة الاتصال بلا تكرار (مفتاح client_point_id — §7)؛ نقاط أقدم من 7 أيام تُتجاهل؛ وسعة الصندوق LOCATION_OUTBOX_MAX_POINTS (§5-5)
    end
```

- بطارية منخفضة جداً تقلّل تردد التتبع تلقائياً إلى كل `LOW_BATTERY_CADENCE_MIN` دقيقة دون `LOW_BATTERY_THRESHOLD_PCT` (§7-8 — قيمتا مختبر Q-027)؛ ولا تنبيه بطارية منخفضة في المرحلة 1 — عرض فقط (§6-3). و«الحركة» كما عرّفها REQ-004 (عتبات سرعة/إزاحة/تثبيت — قيم مختبر Q-027)؛ ومعيار رفض Kalman كما في REQ-005.

### 3-ب. خريطة العائلة — قراءة آخر المواقع (REQ-001/002/003/011/012 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Flutter as التطبيق
    participant Ktor as الخادم
    participant PG as المخزن
    Father->>Flutter: فتح خريطة العائلة
    Flutter->>Ktor: GET /api/v1/families/{id}/locations
    Ktor->>Ktor: تصفية حسب منح location.view (deny-override — Q-007)
    Ktor->>PG: قراءة last_known_location لكل عضو مرئي
    PG-->>Ktor: المواقع + البطارية + الوسم الزمني
    Ktor-->>Flutter: [{member_id, lat, lng, accuracy, battery, at}]
    Flutter->>Flutter: حي أم آخر موقع معروف؟ (عمر القراءة ≤ عتبة الحداثة LOCATION_STALENESS_THRESHOLD — قيمة مختبر Q-027 — Q-283؛ والأقدم وسم "آخر تحديث: قبل X" — لا يُعرض كحي)
    Flutter-->>Father: خريطة OSM + مواقع حية + بطارية كل جهاز (قراءات p95 < 300ms — Q-061)
```

- الأب يرى الموقع الدقيق لكل قاصر — طفلاً كان أو مراهقاً (Q-102)؛ والبالغ المفوَّض يرى حسب منحِه فقط (REQ-012).
- عتبة الحداثة (Q-283): الحي = جديد ضمن `LOCATION_STALENESS_THRESHOLD` (قيمة مختبر Q-027، ≥ 5 دقائق — أبطأ تردد تتبع)؛ والأقدم «آخر موقع معروف منذ X» ولا يُقدَّم كحي أبداً (REQ-003).
- قناة المنصة (§4-3): `startLocationService()` تشغّل خدمة الموقع في الخلفية (التتبع التكيفي)؛ و`getLastKnownLocation() → {lat, lng, accuracy, battery, at}` تقرأ آخر موقع مخزن مع دقته وبطاريته؛ و`triggerSos()` مرسومة في 3-ج (سطر 228).
- حد قراءات p95 < 300ms مصدره **Q-061 في ARCHITECTURE.md** — نص S1-07 SPEC يذكر SOS <10s فقط (REQ-008)؛ والقيمة صحيحة per Q-061.

### 3-ج. SOS متصل — تنبيه في أقل من 10 ثوانٍ (REQ-007/008 — §4-1 + §4-2 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant S107 as الموقع
    participant Ktor as الخادم
    participant Audit as التدقيق
    participant Adults as البالغون
    Child->>Shell: ضغط مطول 3 ثوانٍ على زر SOS (Q-067)
    Shell->>S107: triggerSos() — MethodChannel (§4-3)
    opt إلغاء محلي خلال 10 ثوانٍ قبل الإرسال (Q-286)
        Child->>S107: إلغاء SOS بالخطأ
        S107->>S107: إلغاء الضغطة المحلية — بلا تنبيه ولا SMS ولا خصم حصة
    end
    S107->>Ktor: POST /api/v1/families/{id}/sos {lat, lng, at, last_known_at?} + ترويسة Idempotency-Key (UUID لكل حدث SOS — يمنع التنبيه المكرر عند إعادة الإرسال)
    alt يوجد SOS نشط
        Ktor-->>S107: LOC_SOS_ALREADY_ACTIVE — تُعاد بيانات النشط بدل التكرار
    else لا SOS نشط
        Ktor->>Ktor: إنشاء sos_alert (status=active, channel=server)
        Ktor->>Adults: نشر family/{family_id}/sos/new (MQTT — QoS 1 — أولوية عالية)
        Ktor->>Audit: AuditEvent (إطلاق SOS — النطاق location)
        Ktor-->>S107: {sos_id, at}
        Note over Ktor,Adults: التنبيه يصل للأب وكل البالغين في أقل من 10 ثوانٍ مع الموقع (Q-061 · Q-104)
    end
```

- SOS لا يُحجب بأي صلاحية (Q-067 · §6-2)؛ ومفتاح `location.sos.trigger` باقٍ لكل الأدوار في السجل (§6-1)، والواجهة تعرض الزر على أجهزة الأبناء فقط (Q-416).
- نافذة إلغاء SOS 10 ثوانٍ (Q-286): تلغي الضغطة المحلية فقط قبل الإرسال؛ وبعد الإرسال لا يلغي SOS إلا الأب عبر الحل (REQ-018).
- بلا إصلاح GPS جديد (Q-288): يُرسَل SOS فوراً بآخر موقع معروف موسوماً «آخر موقع منذ X» (`last_known_at` في الحمولة) مع استمرار محاولة الإصلاح — لا يُحجب SOS على GPS أبداً.

### 3-د. SOS دون اتصال — SMS بالإحداثيات (REQ-009/017 — §4-1 + §6-3)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant S107 as الموقع
    participant Ktor as الخادم
    participant Recipients as المستلمون
    Child->>S107: ضغط SOS 3 ثوانٍ — لا اتصال بالخادم
    opt إلغاء محلي خلال 10 ثوانٍ قبل الإرسال (Q-286)
        Child->>S107: إلغاء SOS بالخطأ
        S107->>S107: إلغاء الضغطة المحلية — بلا SMS ولا خصم حصة
    end
    S107->>S107: قرار الإرسال من مرآة الحصة المحلية (Q-163) — لا فحص خادمي دون اتصال
    alt الحصة متبقية
        alt Android — إرسال SMS مباشر
            S107->>Recipients: SMS موقّع HMAC-SHA256 (مقتطع إلى 10 أحرف) بمفتاح الجهاز فوق (العائلة، العضو، الوقت، الإحداثيات) — تطبيق الأب يتحقق من التوقيع قبل عرض التنبيه (REQ-017)
            S107->>S107: تسجيل sos_alert محلياً (channel=sms) للمزامنة لاحقاً
        else iOS — مؤلف SMS النظام (Q-229)
            S107->>Child: فتح مؤلف SMS النظام معبأً مسبقاً إلى الأب + كل البالغين + جهات الطوارئ (Q-138) — المستخدم يضغط إرسال
            alt المستخدم يضغط إرسال
                S107->>S107: تسجيل sos_alert محلياً (channel=sms) للمزامنة لاحقاً
            else المستخدم ألغى المؤلف دون إرسال (Q-238)
                S107->>S107: حالة نهائية مسماة: معلّقة — مؤلف ملغى (تبقى دائمة على الجهاز)
                S107-->>Child: إعادة عرض المطالبة — إعادة فتح المؤلف لنفس الحدث (نفس Idempotency-Key) — لا SOS ثانٍ مكرر ولا لافتة فشل SOS
                S107->>S107: مزامنة الحالة عند عودة الاتصال
            end
        end
    else الحصة منتهية — الطوارئ الثلاث متبقية
        alt Android — إرسال SMS مباشر
            S107->>Recipients: SMS طارئ موقّع HMAC-SHA256 (10 أحرف — REQ-017) (1 من 3 في الشهر التقويمي — SOS فقط) (Q-163 · Q-252)
            S107->>Recipients: إشعار الأب فوراً بكل رسالة طارئة — دفع فوري (Q-285)؛ ودون اتصال رسالة الطوارئ نفسها إلى الأب هي الإشعار (بلا رسالة ثانية — تُحسب مرة واحدة من الثلاث)
        else iOS — مؤلف SMS النظام (Q-229)
            S107->>Child: فتح مؤلف SMS النظام معبأً مسبقاً إلى الأب + كل البالغين + جهات الطوارئ (Q-138) — المستخدم يضغط إرسال
            alt المستخدم يضغط إرسال
                S107->>S107: تسجيل sos_alert محلياً (channel=sms) للمزامنة لاحقاً
                S107->>Recipients: إشعار الأب فوراً بكل رسالة طارئة — دفع فوري (Q-285)؛ ودون اتصال رسالة الطوارئ نفسها إلى الأب هي الإشعار (بلا رسالة ثانية — تُحسب مرة واحدة من الثلاث)
            else المستخدم ألغى المؤلف دون إرسال (Q-238)
                S107->>S107: حالة نهائية مسماة: معلّقة — مؤلف ملغى (تبقى دائمة على الجهاز)
                S107-->>Child: إعادة عرض المطالبة — إعادة فتح المؤلف لنفس الحدث (نفس Idempotency-Key) — لا SOS ثانٍ مكرر ولا لافتة فشل SOS
                S107->>S107: مزامنة الحالة عند عودة الاتصال
            end
        end
    else الحصة والطوارئ الثلاث مستنفدة
        S107->>S107: SOS يبقى "معلقاً" على الجهاز — لا يُعرض كأنه أُرسل
        S107->>S107: إشعار النفاد يُحفظ في طابور على الجهاز للتسليم عند عودة الاتصال
        S107-->>Child: عرض محلي للطفل: SOS معلّق — سيُرسَل عند عودة الاتصال
        Note over S107,Ktor: لا قناة لإشعار الأب فوراً دون اتصال — لا SMS متبقية ولا مسار خادم؛ ويُسلَّم إشعار النفاد عبر الخادم فور عودة الاتصال (§7-5)
    end
```

- كل SMS صادر يُحسب من حصة الخطة (Q-055)؛ الحصص: مجانية 20 رسالة/شهر، أساسية 50 رسالة/شهر (Q-261 — تصديق)، مميزة 100 رسالة/شهر، تعبئة 50 رسالة منفصلة عن حصة الأساسية (Q-129 · REQ-017)؛ والتعبئة وشراء الحزم عبر S1-04 (REQ-017 · Q-106)؛ وتجاوز الطوارئ الثلاث لا يُمنح إلا لـ SOS — لا OTP ولا غيره (§6-2)؛ وقرار الإرسال دون اتصال من مرآة الحصة المحلية، وكل SMS استغاثة موقّع HMAC-SHA256 (مقتطع إلى 10 أحرف) بمفتاح الجهاز فوق (العائلة، العضو، الوقت، الإحداثيات) ويتحقق تطبيق الأب من التوقيع قبل العرض (REQ-017 · Q-163).
- **المصالحة عند عودة الاتصال (§7):** SOS أُرسل عبر SMS يُصالح بإعادة `POST /api/v1/families/{id}/sos` بنفس `Idempotency-Key` — صف `sos_alert` واحد (`channel=sms`) وخصم حصة واحد؛ ولا تنبيه ثانٍ.
- **ملكية النقل دون اتصال (Q-234): S1-07 يملك النقل؛ الغلاف يسلّم `sos_triggered` إلى S1-07 فوراً**؛ والصندوق الصادر (Outbox) مخزن تأجيل لا نقل بديل — S1-07 وحده يقرر الوسيلة (SMS مباشر عند توفر الحصة، أو تسجيل الحدث في Outbox بأولوية قصوى للمزامنة عند عودة الاتصال) — لا نقلان بديلان بلا مالك.
- **إلغاء المؤلف على iOS (Q-238):** مسار المؤلف (فتح المؤلف + فرع الإلغاء بحالته النهائية المسماة «معلّقة — مؤلف ملغى») ينطبق على فرع الحصة المتبقية وعلى فرع الطوارئ الثلاث معاً — SMS الطارئ على iOS يمر بالمؤلف نفسه؛ وإعادة المحاولة تعيد فتح المؤلف لنفس حدث SOS (نفس `Idempotency-Key`) فلا SOS ثانٍ مكرر ولا لافتة «فشل SOS».
- **حد الإشعار دون اتصال (صريح):** عند استنفاد الحصة + الطوارئ الثلاث لا توجد أي قناة لإشعار الأب "فوراً" — فإشعار النفاد يُحفَظ في طابور على الجهاز ويُسلَّم عند عودة الاتصال، ويُعرض محلياً للطفل فقط. (الحد نفسه خطر مقبول موثَّق بحكم المالك — Q-163.)
- **مستلمو SMS دون اتصال (Q-138):** نفس مجموعة المستلمين — الأب + كل البالغين + جهات الطوارئ.
- **إشعار الأب وعدّاد الطوارئ (Q-285):** الأب يُخطر فوراً بكل رسالة طارئة تُرسل — متصلاً دفع فوري من الخادم (لا يستهلك من الثلاث)؛ ودون اتصال رسالة الطوارئ نفسها إلى الأب هي الإشعار (بلا رسالة ثانية)؛ وعدّاد ظاهر في التطبيق (LO-03/LO-06) يعرض المتبقي من الثلاث من مرآة الحصة المحلية (`sms_emergency_remaining` — §5-5).
- **نافذة الإلغاء (Q-286):** كما في 3-ج — تلغي الضغطة المحلية فقط قبل الإرسال؛ وبعد إرسال SMS لا يلغي SOS إلا الأب عبر الحل (REQ-018).
- **بلا إصلاح GPS جديد (Q-288):** كما في 3-ج — يُرسَل SOS فوراً بآخر موقع معروف موسوماً بعمره (في SMS نفسه دون اتصال) مع استمرار محاولة الإصلاح — لا يُحجب على GPS.

### 3-هـ. تأكيد استلام SOS وحلّه (REQ-008/REQ-018 — §4-1 + §4-2)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب / البالغ المفوَّض
    participant Flutter as التطبيق
    participant Ktor as الخادم
    participant Audit as التدقيق
    participant Adults as البالغون
    Father->>Flutter: تأكيد استلام تنبيه SOS
    Flutter->>Ktor: POST /api/v1/families/{id}/sos/{sosId}/acknowledge
    Ktor->>Ktor: sos_alert.status = acknowledged + acknowledged_by + acknowledged_at
    Ktor->>Adults: نشر family/{family_id}/sos/acknowledged (MQTT — QoS 1)
    Ktor->>Audit: AuditEvent (تأكيد SOS — النطاق location)
    Ktor-->>Flutter: {sos_id, acknowledged_by, at}
    Flutter-->>Father: مؤكد — ثم يتصل بالطفل
    Father->>Flutter: حل التنبيه بعد التعامل معه — الأب أو البالغ المفوَّض حسب القالب (Q-136 · Q-160)
    Flutter->>Ktor: POST /api/v1/families/{id}/sos/{sosId}/resolve
    Ktor->>Ktor: sos_alert.status = resolved + resolved_by + resolved_at
    Ktor->>Adults: نشر family/{family_id}/sos/resolved (MQTT — QoS 1)
    Ktor->>Audit: AuditEvent (حل SOS — النطاق location)
    Ktor-->>Flutter: {sos_id, resolved_by, at, status: "resolved"}
```

- SOS بالخطأ (ضغط عرضي): الأب يؤكد أو يلغي عبر نقطة الحل `POST /api/v1/families/{id}/sos/{sosId}/resolve` (الأب + البالغ المفوَّض حسب القالب — Q-136)؛ والحالة تصبح `resolved` ويتوقف التصعيد؛ والإلغاء يُسجَّل في التدقيق (§7-10).

### 3-و. إدارة جهات الطوارئ — أرقام خارجية (REQ-010 — §4-1 — Q-408)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Flutter as التطبيق
    participant Ktor as الخادم
    participant PG as المخزن
    Father->>Flutter: فتح جهات الطوارئ
    Flutter->>Ktor: GET /api/v1/families/{id}/emergency-contacts
    Ktor-->>Flutter: [{contact_id, member_id: null, phone}]
    Note over Father,Ktor: الأب وكل بالغ في العائلة مستلمون دائماً — لا يُضافون ولا يُحذفون من هنا
    Father->>Flutter: إضافة رقم خارجي — العم أو الجدة — باسمه ورقمه
    Flutter->>Ktor: POST /api/v1/families/{id}/emergency-contacts {member_id: null, phone}
    Ktor->>PG: حفظ emergency_contact (added_by = الأب)
    Ktor-->>Flutter: جهة الطوارئ
    Note over Father,Ktor: عند أي استغاثة لاحقة يصل الرقم الخارجي رسالة بالمكان واسم الابن — بلا تتبع وبلا حساب
    Father->>Flutter: حذف جهة طوارئ
    Flutter-->>Father: تأكيد — ثم شريط تراجع بعد الحذف
    Flutter->>Ktor: DELETE /api/v1/families/{id}/emergency-contacts/{contactId}
    Ktor-->>Flutter: {ok: true}
```

- إدارة جهات الطوارئ للأب فقط (`location.emergency.manage` — §6-1). الجهة رقم خارجي يضيفه الأب صراحةً (`member_id` فارغ — Q-287)، والبالغون في العائلة مستلمون دائماً بحكم عضويتهم (Q-408).

### 3-ز. سجل المواقع — 7 أيام (REQ-013/014 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Flutter as التطبيق
    participant Ktor as الخادم
    participant PG as المخزن
    Father->>Flutter: طلب سجل مواقع عضو (7 أيام كحد أقصى)
    Flutter->>Ktor: GET /api/v1/families/{id}/members/{memberId}/locations?from&to&limit&cursor
    Ktor->>Ktor: فحص منح location.history.view (deny-override — Q-007)
    alt بلا منح رؤية
        Ktor-->>Flutter: LOC_NOT_VISIBLE
    else عضو غير موجود
        Ktor-->>Flutter: LOC_MEMBER_NOT_FOUND
    else طلب أقدم من 7 أيام
        Ktor-->>Flutter: فارغ — محذوف تلقائياً، لا خطأ (§7-12)
    else طلب صالح
        Ktor->>PG: قراءة location_point في النطاق
        PG-->>Ktor: [{lat, lng, accuracy, battery, at, server_seq}]
        Ktor-->>Flutter: {points, next_cursor} — صفحة محدودة (limit افتراضي 100، أقصى 500)
    end
```

### 3-ح. سلم تصعيد SOS — مهلة إقرار 5 دقائق + 5 دفعات إعادة كحد أقصى بتراجع (5/10/20/30/30 دقيقة) ثم الحالة النهائية (REQ-018 — §6-3 — Q-284)

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
        loop إعادة الدفع بحد أقصى 5 مرات — بتراجع مضاعف (5/10/20/30/30 دقيقة) (Q-284)
            Ktor->>Adults: إعادة دفع التنبيه + تذكير (دفع + تنبيه)
            Ktor->>Ktor: مؤقت التراجع التالي (10/20/30/30 دقيقة)
        end
        Ktor->>Ktor: الحالة النهائية: بلا إقرار — استُنفد التصعيد (status=unacknowledged_exhausted — تبقى ظاهرة في LO-06 — لا تُسقط بصمت)
        Ktor->>Father: SMS إلى الأب: التصعيد استُنفد والتنبيه ما زال بلا إقرار (Q-284)
        Ktor->>Audit: AuditEvent (استنفاد التصعيد — النطاق location)
    end
    opt الأب أو المفوَّض يحل التنبيه (REQ-018)
        Father->>Ktor: POST /api/v1/families/{id}/sos/{sosId}/resolve
        Ktor->>Ktor: sos_alert.status = resolved + resolved_by + resolved_at — يتوقف التصعيد
        Ktor->>Adults: نشر family/{family_id}/sos/resolved (MQTT — QoS 1)
        Ktor->>Audit: AuditEvent (حل SOS — النطاق location)
    end
```

- **الحالة النهائية (Q-284):** بعد 5 دفعات إعادة بلا إقرار يدخل التنبيه `unacknowledged_exhausted` «بلا إقرار — استُنفد التصعيد»؛ وتبقى ظاهرة في LO-06 ولا تُسقط بصمت؛ ويُرسل SMS إلى الأب؛ والحل (REQ-018) ما زال ممكناً منها.

### 3-ط. «حدّث الآن» — قراءة فورية بنتيجة صادقة (REQ-020 — §4-1 + §4-2 — Q-409)

```mermaid
sequenceDiagram
    autonumber
    actor Viewer as من يرى موقع الفرد
    participant Flutter as التطبيق
    participant Ktor as الخادم
    participant Broker as الوسيط MQTT
    participant Device as جهاز الفرد
    Viewer->>Flutter: «حدّث الآن» — من بطاقة الفرد أو من مركز التحكم
    Flutter->>Ktor: POST /api/v1/families/{id}/members/{memberId}/locations/refresh
    alt بالغ أوقف مشاركته
        Ktor-->>Flutter: LOC_NOT_VISIBLE — الزر لا يُعرض له أصلاً
    else طلب قائم للفرد نفسه
        Ktor-->>Flutter: LOC_RATE_LIMITED
    else مقبول
        Ktor-->>Flutter: {request_id, status: "requested"}
        Ktor->>Broker: family/{family_id}/location/refresh-requested {request_id, member_id, requested_at}
        Broker->>Device: طلب قراءة فورية
        alt الجهاز ردّ قبل المهلة
            Device->>Ktor: نقطة موقع عادية
            Ktor-->>Flutter: الموقع الجديد
            Flutter-->>Viewer: «حُدّث الآن»
        else انتهت المهلة LOCATION_REFRESH_TIMEOUT_S
            Flutter-->>Viewer: السبب بنصه: بلا اتصال، أو مغلق، أو لم يتصل بعد، أو iPhone لا يرد حتى يُفتح التطبيق
            Note over Flutter: يبقى آخر موقع معروف بوسمه — لا يُعرض كأنه حي
        end
    end
```

- مفتاح `location.view`. طلب واحد قائم لكل فرد. والفعل نفسه معروض في مركز التحكم بنوع «فعل» (S1-09 REQ-008 — Q-425).

### 3-ي. «مشاركة موقعي» للبالغ (REQ-019 — §4-1 — Q-409)

```mermaid
sequenceDiagram
    autonumber
    actor Adult as بالغ عن نفسه
    participant Flutter as التطبيق
    participant Ktor as الخادم
    actor Others as بقية الكبار
    Adult->>Flutter: يوقف «مشاركة موقعي»
    Flutter-->>Adult: تأكيد — ما يتوقف وما يبقى — يحتاج اتصالاً
    Flutter->>Ktor: PUT /api/v1/families/{id}/members/{memberId}/location-sharing {paused: true}
    Ktor->>Ktor: memberId = صاحب الجلسة وبالغ؟ وإلا LOC_UNAUTHORIZED
    Ktor->>Ktor: location_sharing.paused = true
    Ktor-->>Others: GET …/locations يعيد {member_id, sharing_paused: true} — «أوقف مشاركة موقعه» بلا موقع ولا موقع قديم
    Adult->>Flutter: يعيد المشاركة متى شاء
    Flutter->>Ktor: PUT … {paused: false}
```

- لا سجل تنقل للبالغ: المكان الحالي فقط. القاصر لا يملك هذا المفتاح، والأب يراه دائماً (REQ-011).

### 3-ك. «ما يراه الأبناء» — قرار المالك وحده (REQ-021 — §4-1 — Q-409)

```mermaid
sequenceDiagram
    autonumber
    actor Owner as المالك
    participant Flutter as التطبيق
    participant Ktor as الخادم
    actor Minor as الابن
    actor Subject as من يُعرض مكانه
    Owner->>Flutter: يفتح «ما يراه الأبناء»
    Flutter->>Ktor: GET /api/v1/families/{id}/location-visibility
    Ktor-->>Flutter: [{viewer_member_id, subject_member_id}] — الافتراضي فارغ: كل ابن يرى مكانه فقط
    Owner->>Flutter: يُظهر أخاً أو والداً لابن بعينه
    Flutter->>Ktor: PUT /api/v1/families/{id}/location-visibility {viewer_member_id, subject_member_id, visible: true}
    Ktor->>Ktor: المالك أو صاحب الصلاحية الكاملة؟ — بلا مفتاح يُفوَّض — + AuditEvent
    Ktor-->>Minor: GET …/locations مصفّى على صفوفه — المكان الحالي فقط، بلا بطارية ولا سجل ولا تفاصيل
    Ktor-->>Subject: اسم الابن يظهر في «من يرى مكاني»
```

- الإظهار اتجاه واحد لا متبادل. وإظهار بالغ لابن لا يعمل والبالغ موقف مشاركته (REQ-019). التغيير يحتاج اتصالاً.

### 3-ل. حفظ الاستغاثات السابقة (REQ-022 — §5-6 — Q-409)

```mermaid
sequenceDiagram
    autonumber
    participant Ktor as الخادم
    participant Sched as المهمة المجدولة
    participant PG as المخزن
    Ktor->>PG: إغلاق استغاثة — resolved_at
    Ktor->>PG: coords_expire_at = resolved_at + 7 أيام · expires_at = resolved_at + 90 يوماً
    Note over Sched: كل يوم
    Sched->>PG: عند coords_expire_at — محو lat / lng — يبقى من استغاث ومتى ومن أغلقها وملاحظته
    Sched->>PG: عند expires_at — حذف الصف
    Note over PG: الاستغاثة غير المغلقة لا تُحذف مهما طال عمرها — وحدث التدقيق بلا إحداثيات
```

- الشاشة تذكر المدتين بنص صريح (90 يوماً للقائمة و7 أيام للمكان).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الستة (§2) والتصميم المعتمد (§9-8 · §9-9)

```mermaid
flowchart TD
    Start([بالغ يفتح خريطة العائلة]) --> Load[تحميل آخر المواقع والبطارية — الأبناء والكبار]
    Load --> Pick[مبدّل الأفراد — ثم بطاقة الفرد على الخريطة]
    Pick --> Paused{بالغ أوقف مشاركته؟}
    Paused -->|نعم| NoLoc[«أوقف مشاركة موقعه» — بلا موقع ولا موقع قديم ولا زر تحديث]
    Paused -->|لا| Fresh{"الموقع حي؟ (عمر ≤ عتبة الحداثة — Q-283)"}
    Fresh -->|نعم| Live[عرض حي على خريطة OSM + العنوان بسلّمه + البطارية]
    Fresh -->|لا| Stale["آخر موقع معروف + «آخر تحديث: قبل X» — لا يُعرض كحي"]
    Stale --> Refresh[«حدّث الآن»]
    Refresh -->|وصلت قراءة| Live
    Refresh -->|انتهت المهلة| Why[السبب بنصه — ويبقى آخر موقع بوسمه]
    Live --> Detail[تفاصيل الفرد: الاتجاهات، وسجل 7 أيام للقاصر فقط]
    Live --> LowBatt{بطارية 15%؟}
    LowBatt -->|نعم| Msg[رسالة للابن: اشحن هاتفك]
    LowBatt -->|لا| Watch[اطمئنان كامل في نظرة واحدة]
    Msg --> Watch
    Kid([الطفل أو المراهق يفتح الخريطة]) --> Mine[يرى مكانه — ومن أظهره له المالك فقط]
    Mine --> Who[«من يرى مكاني» بالأسماء]
    Child([الابن يضغط SOS 3 ثوانٍ — أو يصل إليه من «أحتاج مساعدة»]) --> Net{اتصال بالخادم؟}
    Net -->|نعم| Online[تنبيه للأب وكل البالغين < 10 ثوانٍ مع المكان]
    Net -->|لا| Quota{حصة SMS أم طوارئ متبقية؟}
    Quota -->|نعم| SMS["SMS بالإحداثيات إلى هواتف الأب وكل البالغين وجهات الطوارئ (Q-138)"]
    Quota -->|لا| Pending[SOS معلّق على الجهاز + إشعار النفاد في الطابور — لا يُعرض كأنه أُرسل]
    Online --> Ack[بالغ يؤكد ويتصل بالابن]
    Ack --> Resolve[بالغ يحل التنبيه — يتوقف التصعيد + نشر sos/resolved]
    Resolve --> Keep[تبقى في القائمة 90 يوماً — ومكانها يُمحى بعد 7 أيام]
    SMS --> Ack
    Pending --> Reconnect{عودة الاتصال؟}
    Reconnect -->|نعم| Online
    Owner([المالك]) --> See[«ما يراه الأبناء»: من يظهر لكل ابن — اتجاه واحد]
    Owner --> Contacts[جهات الطوارئ: أرقام خارجية — حذف بتأكيد ثم تراجع]
    AdultMe([بالغ]) --> Share[«مشاركة موقعي»: يوقفها ويعيدها بتأكيد]
```

- ملاحظة: بطارية 15% هي عتبة البطارية المنخفضة المحكومة (`LOW_BATTERY_THRESHOLD_PCT` = 15% — Q-027)؛ ولا تنبيه بطارية منخفضة في المرحلة 1.
- بلا إصلاح GPS جديد (Q-288): يُرسَل SOS فوراً بآخر موقع معروف موسوماً «آخر موقع منذ X» — لا يُحجب على GPS.
- لا زر استغاثة في وضع الأهل (Q-416): البالغ يستقبل ويؤكد ويحلّ. والمكان يُعرض عنواناً من الخريطة بسلّمه (REQ-023): لا إحداثيات خام في الواجهة، ولا أماكن مسمّاة ولا سور جغرافي في المرحلة 1 (Q-056).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D4 جداول خادم (PostgreSQL) + ثلاثة مخازن عميل (C1–C3) على الجهاز. **كل عملية موسومة: جهاز / خادم** — وكل أحداث MQTT ينشرها الخادم (Ktor) نيابة عن العمليات (مطابقةً للتسلسلات §3 وQ-168 — لا نشر مباشر من عمليات الجهاز)؛ وتنبيهات SOS وودجة الخريطة المصغرة تُسلَّمان إلى S1-09 (REQ-015/016).

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
        P1(1.0 التتبع التكيفي — GPS + Kalman — جهاز)
        P2(2.0 قراءة الخريطة والسجل — تصفية حسب المنح — خادم)
        P3(3.0 إطلاق SOS — جهاز)
        P4(4.0 تأكيد وحل SOS + تصعيد — خادم)
        P5(5.0 إدارة جهات الطوارئ — خادم)
        P6(6.0 مزامنة الصندوق الصادر — جهاز)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 location_point)]
        D2[(D2 last_known_location)]
        D3[(D3 sos_alert)]
        D4[(D4 emergency_contact)]
        C1[(C1 نقاط الصندوق الصادر — محلي)]
        C2[(C2 بلاطات MBTiles دون اتصال — محلي)]
        C3[(C3 مرآة الحصة المحلية — رصيد + طوارئ + نهاية الشهر التقويمي Q-252 — محلي)]
    end

    Ktor([خادم Ktor])
    MQTT([وسيط MQTT — Mosquitto 2.x — 8883 + mTLS])
    SMS([بوابة SMS])
    Audit([AuditEvent])

    Child -->|قراءات GPS + بطارية| P1
    P1 -->|نقطة منعمّة| D1
    P1 -->|تحديث آخر موقع| D2
    P1 -->|نقطة للإبلاغ| Ktor
    Ktor -->|"family/{family_id}/location/updated — QoS 0"| MQTT
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
    P3 -->|POST /sos| Ktor
    Ktor -->|إنشاء sos_alert| D3
    Ktor -->|"family/{family_id}/sos/new — QoS 1"| MQTT
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
    P4 -->|تأكيد / حل| Ktor
    Ktor -->|"family/{family_id}/sos/acknowledged — QoS 1"| MQTT
    Ktor -->|"family/{family_id}/sos/resolved — QoS 1"| MQTT
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
        F2{"الموقع حي؟ (عمر ≤ عتبة الحداثة — Q-283)"}
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
    V3 -->|"بلا إقرار: إعادة دفع بحد أقصى 5 مرات (5/10/20/30/30 دقيقة) ثم الحالة النهائية «بلا إقرار — استُنفد التصعيد» (Q-284)"| V3
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
- التصعيد (Q-284): إعادة الدفع بحد أقصى 5 مرات بتراجع 5/10/20/30/30 دقيقة؛ ثم الحالة النهائية «بلا إقرار — استُنفد التصعيد» الظاهرة في LO-06 مع SMS إلى الأب — بلا إسقاط صامت.
- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس الشاشة والمدخلات (نمط S1-01 §7)؛ ونقاط الصندوق الصادر أقدم من 7 أيام تُتجاهل عند المزامنة (§7-13).
