# S1-01: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — الأنواع الستة معتمدة (حكم المالك 2026-11-06) · المراجعة النهائية على GitHub
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **القرارات الحاكمة:** Q-134 (هيكل الملف) · Q-062 · Q-063 · Q-065 · Q-067 · Q-068 · Q-070
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط

## 1. حالات الاستخدام

12 حالة استخدام من السيناريوهات الأربعة والمتطلبات (§2/§3): الأب والبالغ يفتحان اللوحة، كل الأدوار تضغط SOS، الطفل والمراهق يعملان دون اتصال، وأي إجراء مقيّد على جهاز طفل يتضمن بوابة PIN. والتسليم لنظام الموقع (S1-07) والإقران (S1-02) ممثلان كجهات خارجية.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ])
    Teen([المراهق])
    Child([الطفل])
    Kotlin([وحدة Kotlin للفرض])
    Server([خادم Ktor])
    S102([نظام الهوية S1-02])
    S107([نظام الموقع S1-07])

    subgraph S101 [S1-01: غلاف التطبيق والمنصة]
        direction TB
        UC1(فتح لوحة الأهل)
        UC2(عرض قراءات العائلة)
        UC3(ضغط زر SOS)
        UC4(فتح التطبيق دون اتصال)
        UC5(محاولة إجراء مقيّد على جهاز طفل)
        UC6(طلب PIN الأب — بوابة الوالدين)
        UC7(تغيير PIN الأب)
        UC8(تعديل إعداد الغلاف)
        UC9(تحديد وضع الجهاز عند الإقران)
        UC10(تطبيق قواعد الفرض)
        UC11(تفريغ طابور Outbox)
        UC12(مراقبة صحة المنصة)
        UC13(تسليم حدث SOS)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC7
    Father --> UC8
    Adult --> UC1
    Adult --> UC3
    Teen --> UC3
    Teen --> UC4
    Child --> UC3
    Child --> UC4
    Child --> UC5
    UC5 -.->|يتضمن| UC6
    S102 --> UC9
    Kotlin --> UC10
    Kotlin --> UC12
    Server --> UC11
    UC3 --> UC13
    UC13 --> S107
```

## 2. مخطط قاعدة البيانات (ERD)

الجداول الستة من §5 كما هي، مع ثلاثة مراجع خارجية: العائلة (S1-02)، ومفتاح الصلاحية (S1-03)، و`AuditEvent` (النواة المشتركة). ملاحظتان: `outbox_event` محلي على الجهاز (SQLite) وليس جدول خادم، و`pin_hash` مشفر فقط — لا يُحفظ PIN نصاً أبداً. كل جدول يحمل `family_id` + عزل RLS (D-021).

```mermaid
erDiagram
    family ||--o{ device_mode : "له أجهزة"
    family ||--|| parent_gate : "له بوابة"
    family ||--o{ feature_flag : "له أعلام"
    family ||--o{ shell_registry : "له سجلات"
    family }o--|| country_profile : "يتبع ملف منطقة"
    device_mode ||--o{ outbox_event : "يسجل أحداثاً"
    parent_gate ||--o{ AuditEvent : "محاولاته تُسجَّل"
    shell_registry }o--|| permission_key : "سجل الصلاحيات يرجع إلى"

    device_mode {
        string id PK
        string family_id FK
        string device_id
        string mode
        datetime paired_at
        string paired_by
    }
    parent_gate {
        string id PK
        string family_id FK
        string pin_hash
        int failed_attempts
        datetime locked_until
        datetime updated_at
    }
    feature_flag {
        string id PK
        string family_id FK
        string key
        boolean enabled
        datetime valid_until
    }
    outbox_event {
        string id PK
        string family_id FK
        string device_id FK
        string type
        string payload
        int synced_status
        datetime created_at
    }
    country_profile {
        string id PK
        string region
        boolean low_bandwidth
        string otp_channels
        string payment_routes
    }
    shell_registry {
        string id PK
        string family_id FK
        string registry
        string key
        string metadata
    }
    family {
        string id PK
    }
    permission_key {
        string key PK
    }
    AuditEvent {
        string id PK
    }
```

## 3. التسلسل (Sequence) — من عقود §4

أربعة مخططات، كل واحد لتدفق واحد:

### 3-أ. الإقلاع وتحديد الوضع (REQ-002/012/017)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant الغلاف as Shell
    participant التخزين as Store
    participant الخادم as Ktor
    Father->>Shell: فتح التطبيق
    Shell->>Store: قراءة device_mode (الوضع)
    Store-->>Shell: mode = parent
    Shell->>Ktor: GET /api/v1/shell/config?family_id
    Ktor-->>Shell: ShellConfig {region, planFlags, featureFlags}
    Shell->>Ktor: GET /api/v1/shell/registries/control
    Ktor-->>Shell: قائمة المفاتيح المسجلة
    Shell->>Store: حفظ الإعداد محلياً
    Shell->>Shell: تطبيق قوالب العرض + إخفاء ما خارج الخطة
    Shell-->>Father: لوحة الأهل (إقلاع < 1.2s، قراءات p95 < 300ms)
```

### 3-ب. بوابة الوالدين (REQ-005/006 — §4.1 + §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant الغلاف as Shell
    participant Kotlin as K
    participant الخادم as Ktor
    participant التدقيق as Audit
    Child->>Shell: محاولة إجراء مقيّد (خروج / فك إقران / إعداد إداري)
    Shell->>K: requestParentGate(action)
    K-->>Shell: عرض لوحة PIN
    Child->>K: إدخال PIN
    K->>Ktor: POST /shell/parent-gate/verify {family_id, pin_hash}
    alt PIN صحيح
        Ktor-->>K: {granted: true}
        K-->>Shell: GateResult {granted}
        Shell-->>Child: تنفيذ الإجراء
    else PIN خاطئ (أقل من 5)
        Ktor-->>K: {granted: false, attemptsLeft}
        K-->>Shell: GateResult {granted: false}
        Shell-->>Child: رفض + المحاولات المتبقية
    else 5 أخطاء متتالية
        Ktor-->>K: {granted: false, lockedUntil}
        K->>Audit: AuditEvent (محاولة أثناء القفل تُسجَّل)
        K-->>Shell: GateResult {lockedUntil}
        Shell-->>Child: البوابة مقفلة 5 دقائق
    end
```

- التحقق من PIN يتم عبر الخادم (§4.2)؛ وحدة Kotlin تعرض اللوحة وتجمع PIN (§4.1). ولا سؤال حسابي في أي مسار (Q-065).

### 3-ج. تفريغ طابور Outbox (REQ-009 — §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant الغلاف as Shell
    participant Outbox as OB
    participant الخادم as Ktor
    Child->>Shell: فعل دون اتصال
    Shell->>OB: تسجيل الحدث (synced_status=0)
    Note over Shell,OB: عند عودة الاتصال
    Shell->>OB: قراءة الأحداث بترتيب زمني صارم
    Shell->>Ktor: POST /shell/outbox/flush (Idempotency-Key) — دفعة مضغوطة
    Ktor-->>Shell: FlushResult {accepted, rejected[]}
    Shell->>OB: تحديث synced_status=1 للمقبولة
    Shell-->>Child: مزامنة مكتملة
```

### 3-د. زر SOS (REQ-007 — §4.1/§4.3)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant الغلاف as Shell
    participant الموقع as S107
    participant Outbox as OB
    Child->>Shell: ضغط مطول 3 ثوانٍ (اهتزاز تصاعدي)
    Shell->>S107: تسليم حدث SOS فوراً (EventChannel: sos_triggered)
    alt متصل
        S107-->>Shell: إقرار (ack)
    else دون اتصال
        Shell->>OB: تسجيل بأولوية قصوى
        Note over Shell,OB: يُرسَل قبل أي حدث آخر عند عودة الاتصال
    end
```

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الأربعة (§2)

```mermaid
flowchart TD
    Start([فتح التطبيق — إقلاع بارد < 1.2s]) --> Read[قراءة وضع الجهاز من device_mode]
    Read --> Mode{الوضع؟}
    Mode -->|أهل| Config[تحميل الإعداد: region + planFlags + featureFlags]
    Config --> Render[عرض لوحة الأهل بقالب الدور]
    Render --> Hide[إخفاء الميزات خارج الخطة]
    Hide --> Ready[جاهز — قراءات p95 < 300ms]
    Mode -->|طفل| Child[وضع الطفل: فرض + خدمة خلفية]
    Child --> Conn{اتصال؟}
    Conn -->|لا| Banner[شريط حالة عدم اتصال خفيف + بيانات محفوظة]
    Banner --> Act[أي فعل يُسجَّل في Outbox]
    Conn -->|نعم| Sync[تفريغ Outbox + تحديث الإعداد]
    Act --> SOS{زر SOS 3 ثوانٍ؟}
    Sync --> SOS
    SOS -->|نعم| Send[تسليم لنظام الموقع — دون اتصال: Outbox أولوية قصوى]
    SOS -->|لا| Exit{محاولة خروج / فك إقران / إعداد إداري؟}
    Exit -->|نعم| Gate[طلب PIN الأب]
    Gate --> Pin{PIN صحيح؟}
    Pin -->|نعم| Allow[تنفيذ الإجراء]
    Pin -->|لا| Count{5 أخطاء؟}
    Count -->|لا| Retry[رفض + المحاولات المتبقية]
    Count -->|نعم| Lock[قفل 5 دقائق + تسجيل في AuditEvent]
    Exit -->|لا| Stay[البقاء في وضع الطفل]
```

- ملاحظة: تسجيل دخول الأب على جهاز طفل **لا** يبدّل الوضع — الوضع يتحدد بالإقران (REQ-002).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D6. المخزن D4 محلي على الجهاز (SQLite)؛ بقية المخازن جداول خادم (PostgreSQL) مع نسخة محفوظة محلياً للإعداد.

```mermaid
flowchart LR
    Father([الأب / البالغ])
    Child([الطفل / المراهق])
    S102([نظام الهوية S1-02])
    S107([نظام الموقع S1-07])
    Kotlin([وحدة Kotlin للفرض])

    subgraph Shell [الغلاف]
        P1(1.0 تحديد وضع الجهاز)
        P2(2.0 عرض لوحة الأهل وتطبيق القوالب)
        P3(3.0 بوابة الوالدين — التحقق من PIN)
        P4(4.0 طابور Outbox — تسجيل / تفريغ)
        P5(5.0 مراقبة صحة المنصة)
        P6(6.0 تسليم SOS)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 device_mode)]
        D2[(D2 parent_gate)]
        D3[(D3 feature_flag)]
        D4[(D4 outbox_event — محلي)]
        D5[(D5 country_profile)]
        D6[(D6 shell_registry)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent])

    S102 -->|بيانات الإقران| P1
    P1 -->|حفظ وضع الجهاز| D1
    D1 -->|الوضع + القالب| P2
    Father -->|فتح اللوحة| P2
    P2 -->|قراءة الأعلام| D3
    P2 -->|قراءة المنطقة| D5
    P2 -->|قراءة السجلات| D6
    P2 -->|لوحة الأهل| Father
    Child -->|محاولة إجراء مقيّد| P3
    P3 -->|التحقق من pin_hash| D2
    D2 -->|النتيجة + المحاولات| P3
    P3 -->|تسجيل المحاولات والقفل| Audit
    Child -->|فعل دون اتصال| P4
    P4 -->|تسجيل الحدث| D4
    D4 -->|دفعة مضغوطة| Ktor
    Ktor -->|FlushResult| P4
    Kotlin -->|getDeviceHealth| P5
    P5 -->|تنبيه / تعطيل انتقالات| Shell
    Child -->|ضغط SOS 3 ثوانٍ| P6
    P6 -->|حدث SOS| S107
```

## 6. مخطط النشاط (Activity) — دورة حياة الإقلاع والاستخدام

المسارات الأربعة (المستخدم / الغلاف / وحدة Kotlin / الخادم) كمسارات متوازية. والأنشطة الخلفية (خدمة Kotlin + مراقبة الصحة + تفريغ Outbox) تعمل **بالتوازي** مع استخدام التطبيق.

```mermaid
flowchart LR
    subgraph User [المستخدم]
        direction TB
        U1([فتح التطبيق])
        U2[استخدام التطبيق]
        U3[محاولة إجراء مقيّد]
        U4[ضغط SOS 3 ثوانٍ]
        U5([إغلاق التطبيق])
    end
    subgraph Shell [الغلاف — Flutter]
        direction TB
        S1[قراءة device_mode]
        S2{الوضع؟}
        S3[تحميل الإعداد والأعلام]
        S4[عرض الواجهة حسب الوضع]
        S5[طلب PIN الأب]
        S6{النتيجة؟}
        S7[تنفيذ الإجراء / رفض + عدّاد]
        S8[تسليم SOS لنظام الموقع]
        S9[حفظ حالة الواجهة فوراً]
    end
    subgraph Kotlin [وحدة Kotlin]
        direction TB
        K1[خدمة خلفية دائمة — وضع الطفل]
        K2[مراقبة الصحة]
        K3[تطبيق قواعد الفرض]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[GET /shell/config]
        V2[POST /shell/parent-gate/verify]
        V3[POST /shell/outbox/flush]
    end

    U1 --> S1
    S1 --> S2
    S2 -->|أهل| S3
    S2 -->|طفل| S3
    S3 --> V1
    V1 --> S4
    S4 --> U2
    S4 --> K1
    S4 --> V3
    K1 --> K2
    K1 --> K3
    U2 --> U3
    U3 --> S5
    S5 --> V2
    V2 --> S6
    S6 -->|مقبول| S7
    S6 -->|مرفوض| S7
    U2 --> U4
    U4 --> S8
    U5 --> S9
```

- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس الشاشة والمدخلات (§7).
