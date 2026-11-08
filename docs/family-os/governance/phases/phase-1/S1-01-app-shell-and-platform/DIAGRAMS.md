# S1-01: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-06)؛ والمواصفة معتمدة بالكامل في التخطيط
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** بلا سياق خاص — عنصر عابر يعبر كل السياقات (الغلاف، `CONTEXT-MAP.md` §2-أ)
- **القرارات الحاكمة:** Q-001 · Q-007 · Q-010 · Q-134 (هيكل الملف) · Q-062 · Q-063 · Q-065 · Q-067 · Q-068 · Q-070 · Q-234 · Q-236 · Q-244
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

13 حالة استخدام من السيناريوهات الأربعة والمتطلبات (§2/§3): الأب والبالغ يفتحان اللوحة، كل الأدوار تضغط SOS، الطفل والمراهق يعملان دون اتصال، وأي إجراء مقيّد على جهاز طفل يتضمن بوابة PIN. والتسليم لنظام الموقع (S1-07) والإقران (S1-02) ممثلان كجهات خارجية؛ وتقييم القواعد والجداول الأسبوعية ملك نظام الحماية والفرض S1-10 (REQ-003 · Q-141).

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

    subgraph S101 ["S1-01: غلاف التطبيق والمنصة — تطبيق واحد بوضعين (REQ-001)"]
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

- ملاحظة طريق iOS (REQ-019 · Q-005/Q-068): واجهة Flutter مشتركة للوضعين؛ وحدة الفرض Kotlin أندرويد فقط — التحكم العميق أندرويد فقط لقيد Apple؛ فعلى iOS لا توجد وحدة فرض Kotlin ولا خدمة خلفية دائمة للفرض.

- ملاحظة الخصوصية (REQ-016 · Q-046): لا إعلانات ولا تتبع ولا تحليلات في التطبيق؛ ولا أحداث تحليلية لحسابات الأطفال قبل حسم Q-046.

## 2. مخطط قاعدة البيانات (ERD)

الجداول السبعة من §5 كما هي، مع ثلاثة مراجع خارجية: العائلة (S1-02)، ومفتاح الصلاحية (S1-03)، و`AuditEvent` (النواة المشتركة — صيغته في S1-03 §5-6 بنطاق `shell` — SPEC §5). ملاحظتان: `outbox_event` محلي على الجهاز (SQLite) وليس جدول خادم، و`pin_hash` هو **Argon2id (m=64MiB، t=3، p=1) مع ملح عشوائي (Q-164)** — لا يُحفظ PIN نصاً أبداً. و`parent_gate` **مخزن محلي على الجهاز** (Q-142): hash الـ PIN محفوظ في مخزن آمن مدعوم بالعتاد والتحقق يتم محلياً، والخادم لا يستلم PIN ولا hashه أبداً — يسجل إثبات التحقق + القفل فقط في التدقيق عبر Outbox. جداول العائلة تحمل `family_id` + عزل RLS (D-021)؛ أما السجلات العالمية (`shell_registry` كعرض قراءة، و`notification_registry`) وملف المنطقة (`country_profile`) فبلا `family_id`؛ والسجلات المركزية الأربعة (`ControlRegistry`/`PermissionRegistry`/`WidgetRegistry`/`NotificationRegistry` — قيم `shell_registry.registry`: `control`/`permission`/`widget`/`notification`) — ولا مفتاح تحكم يعمل دون تسجيل (REQ-011). **قاعدة الساعة (Q-236/D-18):** كل الطوابع UTC مخزنة؛ و`locked_until` انتهاء صادر من الخادم عند الاتصال، ومنقضٍ رتيب (monotonic) دون اتصال؛ وتُعاد تثبيت المرساة عند كل اتصال. و`family.time_zone` معرَّف في S1-02 §5 (سجل العائلة) — مرساة «منتصف الليل المحلي للعائلة» (Q-183) دون مسّ دلالتها.

```mermaid
erDiagram
    family ||--o{ device_mode : "له أجهزة"
    family ||--|| parent_gate : "له بوابة"
    family ||--o{ feature_flag : "له أعلام"
    family }o--|| country_profile : "يتبع ملف منطقة"
    device_mode ||--o{ outbox_event : "يسجل أحداثاً"
    parent_gate ||--o{ AuditEvent : "محاولاته تُسجَّل"
    shell_registry }o--|| permission_key : "سجل الصلاحيات يرجع إلى"

    device_mode {
        uuid id PK
        uuid family_id FK
        uuid device_id
        text mode
        timestamptz paired_at
        text paired_by
    }
    parent_gate {
        uuid id PK
        uuid family_id FK
        text pin_hash
        text kdf_params
        uuid device_key_id
        int failed_attempts
        timestamptz locked_until
        timestamptz updated_at
    }
    feature_flag {
        uuid id PK
        uuid family_id FK
        text key
        boolean enabled
        timestamptz valid_until
    }
    outbox_event {
        uuid id PK
        uuid family_id FK
        uuid device_id FK
        text type
        text payload
        text priority
        text idempotency_key
        int retry_count
        timestamptz next_retry_at
        int version
        int synced_status
        timestamptz created_at
    }
    country_profile {
        uuid id PK
        text region
        boolean low_bandwidth
        text otp_channels
        text payment_routes
    }
    shell_registry {
        text registry
        text key
        text metadata
    }
    notification_registry {
        text kind
        text channel
        text owner_system
    }
    family {
        uuid id PK
    }
    permission_key {
        text key PK
    }
    AuditEvent {
        uuid id PK
    }
```

## 3. التسلسل (Sequence) — من عقود §4

ثمانية مخططات، كل واحد لتدفق واحد:

### 3-أ. الإقلاع وتحديد الوضع (REQ-002/012/017)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Shell as الغلاف
    participant Store as التخزين
    participant Ktor as الخادم
    Father->>Shell: فتح التطبيق
    Shell->>Store: قراءة device_mode (الوضع)
    Store-->>Shell: mode = parent
    Shell->>Ktor: GET /api/v1/families/{id}/shell/config
    Ktor-->>Shell: ShellConfig {region, planFlags, featureFlags}
    Shell->>Ktor: GET /api/v1/shell/registries/control
    Ktor-->>Shell: قائمة المفاتيح المسجلة
    Note over Shell,Ktor: control إحدى القيم الأربع لـ registry — control / permission / widget / notification (تثبيت §4)
    Shell->>Store: حفظ الإعداد محلياً
    Shell->>Shell: تطبيق قوالب العرض + إخفاء ما خارج الخطة (REQ-004 · Q-007)
    Shell->>Shell: تطبيق اللغة — العربية افتراضياً + RTL — كل نصوص الواجهة من ملفات ترجمة، لا نصوص مثبتة في الكود (REQ-021 · Q-070)
    Shell-->>Father: لوحة الأهل (إقلاع < 1.2s، قراءات p95 < 300ms)
```

### 3-ب. بوابة الوالدين (REQ-005/006 — §4.1 + §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant K as Kotlin
    participant Audit as التدقيق
    Child->>Shell: محاولة إجراء مقيّد (خروج / فك إقران / إلغاء تثبيت الوكيل / إعداد إداري)
    Shell->>K: requestParentGate(action)
    K-->>Shell: عرض لوحة PIN
    Child->>K: إدخال PIN
    K->>K: التحقق محلياً مقابل pin_hash (Argon2id — Q-164) على الجهاز (Q-142 — لا PIN ولا hash يغادران الجهاز أبداً)
    alt PIN صحيح
        K-->>Shell: GateResult {granted}
        K->>Audit: AuditEvent — إثبات تحقق ناجح (يُسلَّم عبر Outbox عند عدم الاتصال)
        Shell-->>Child: تنفيذ الإجراء
    else PIN خاطئ (أقل من 5)
        K-->>Shell: GateResult {granted: false, attemptsLeft}
        Shell-->>Child: رفض + المحاولات المتبقية
    else 5 أخطاء متتالية
        K->>K: قفل محلي 5 دقائق (locked_until)
        K->>Audit: AuditEvent — إثبات القفل (يُسلَّم عبر Outbox عند عدم الاتصال)
        K-->>Shell: GateResult {lockedUntil}
        Shell-->>Child: البوابة مقفلة 5 دقائق
    end
```

- التحقق من PIN **محلي فقط** (Q-142): hash الـ PIN محفوظ مشفراً على الجهاز وتتحقق منه وحدة Kotlin محلياً؛ والخادم يسجل إثبات التحقق + القفل فقط في التدقيق (عبر Outbox عند عدم الاتصال) ولا يستلم PIN ولا hashه أبداً. ونقطة التحقق الخادمي من PIN **محذوفة** — لا مكالمة Ktor في هذا التدفق. ولا سؤال حسابي في أي مسار (Q-065). وعند تعيين PIN جديد أو تغييره (UC7): 6 أرقام حداً أدنى، مع منع الأنماط الشائعة (123456، أرقام مكررة، سنوات الميلاد) (REQ-005 · Q-164). PIN فقط يفتح Parent Gate؛ البصمة تفتح مفتاح التوقيع بعدها (Q-244). **قاعدة الساعة (Q-236/D-18):** `locked_until` انتهاء صادر من الخادم عند الاتصال، ومنقضٍ رتيب (monotonic) دون اتصال؛ وتُعاد تثبيت المرساة عند كل اتصال.

### 3-ج. تفريغ طابور Outbox (REQ-009 — §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant OB as Outbox
    participant Ktor as الخادم
    Child->>Shell: فعل دون اتصال
    Shell->>OB: تسجيل الحدث (synced_status=0)
    Note over Shell,OB: عند عودة الاتصال
    Shell->>OB: قراءة الأحداث بترتيب الأولوية ثم الزمن (critical أولاً)
    Shell->>Ktor: POST /api/v1/shell/outbox/flush (Idempotency-Key) — دفعة مضغوطة — مفتاح عدم تكرار لكل حدث (idempotency_key)
    Ktor-->>Shell: FlushResult {accepted, rejected[]}
    Shell->>OB: تحديث synced_status=1 للمقبولة
    Shell-->>Child: مزامنة مكتملة
```

- كل حدث يحمل `idempotency_key` (§5)؛ والخادم يزيل التكرار على (`family_id`, `idempotency_key`)؛ ولا يسقط حدث قبل إقرار الخادم أبداً.

### 3-د. زر SOS (REQ-007 — §4.1/§4.3)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant S107 as الموقع
    Child->>Shell: ضغط مطول 3 ثوانٍ (اهتزاز تصاعدي)
    Shell->>S107: تسليم حدث SOS فوراً (EventChannel: sos_triggered — SosEvent §4.3)
    Note over Shell,S107: S1-07 يملك النقل؛ الغلاف يسلّم sos_triggered إلى S1-07 فوراً (Q-234/D-6)؛ وOutbox ليس نقلاً بديلاً لـ SOS
    alt متصل
        S107-->>Shell: إقرار (ack)
    else دون اتصال
        S107->>S107: S1-07 يقرر وسيلة التوصيل
    end
```

### 3-هـ. إثبات التحقق بتحدٍّ من الخادم (REQ-023 — §4.2 · Q-164)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Shell as الغلاف
    participant K as Kotlin
    participant Ktor as الخادم
    Father->>Shell: عملية حساسة تتطلب إثباتاً خادمياً
    Shell->>Ktor: POST /api/v1/shell/verification/challenge
    Ktor-->>Shell: {challenge_id, nonce, expires_at} — صلاحية 5 دقائق، استخدام واحد
    Shell->>K: طلب تحقق — PIN فقط يفتح Parent Gate؛ البصمة تفتح مفتاح التوقيع بعدها (Q-244)
    K->>K: توقيع nonce بمفتاح التوقيع الجهازي (ECDSA P-256) بعد التحقق المحلي
    K-->>Shell: signature
    Shell->>Ktor: POST /api/v1/shell/verification/prove {challenge_id, signature, method}
    Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام المسجَّل (Q-164)
    alt التوقيع صالح
        Ktor-->>Shell: {verified: true}
        Shell-->>Father: تنفيذ العملية الحساسة
    else بلا verification أو توقيع غير صالح أو تحدٍّ منتهٍ
        Ktor-->>Shell: {verified: false} — رفض
    end
```

- الإثبات القابل للتحقق **ليس** تحقق PIN خادمياً (Q-142 يبقى: لا نقطة PIN خادمية، ولا PIN ولا hash يغادران الجهاز أبداً) — بل إثبات توقيع: الخادم يتحقق من توقيع التحدي بمفتاح الجهاز العام المسجَّل قبل تنفيذ أي عملية حساسة. والمفتاح وُلد عند الإقران (S1-02 3-د) ومعرّفه `device_key_id` في `parent_gate` (§5).


### 3-و. خطاف عقد بوابة الذكاء — هيكل فقط (REQ-014 — Q-054)

```mermaid
sequenceDiagram
    autonumber
    participant Shell as الغلاف
    participant AIGateway as "بوابة الذكاء"
    Shell->>AIGateway: التحقق من هيكل العقد (الميزانية + مفتاح الإيقاف — Q-054 · Q-167)
    AIGateway-->>Shell: هيكل العقد موجود
    Note over Shell,AIGateway: لا ميزة ذكاء فعلية في هذا النظام (REQ-014)
```

- خطاف هيكلي فقط: العقد والميزانية ومفتاح الإيقاف (Q-054)؛ لا ميزة ذكاء فعلية، ولا استدعاء ذكاء في أي تدفق. ويستشهد الخطاف بعقد تحقق الذكاء الملزم (Q-167): الفحص يثبت وجود العقد وقراءة الميزانية ومفتاح الإيقاف؛ وبلا مفاتيح `agent.*` هنا.

### 3-ز. تدفق التحديث (REQ-020 — Q-069)

```mermaid
sequenceDiagram
    autonumber
    participant Shell as الغلاف
    participant Ktor as الخادم
    participant Store as المتجر
    Shell->>Ktor: GET /api/v1/families/{id}/shell/config
    Ktor-->>Shell: ShellConfig.update {minimum_version, latest_version, forced_update}
    alt تحديث عادي
        Shell->>Store: فتح المتجر للتحديث
        Store-->>Shell: تحديث عبر المتجر
    else إصدار أمني حرج (forced_update)
        Shell->>Shell: تحديث إجباري داخل التطبيق — بلا مسار تجاوز
    else دون الحد الأدنى للإصدار المدعوم
        Shell->>Shell: حث المستخدم على التحديث
    end
```

- التحديثات العادية عبر المتجر؛ والتحديث الإجباري داخل التطبيق للإصدارات الأمنية الحرجة فقط؛ والأجهزة دون الحد الأدنى للإصدار المدعوم تُحث على التحديث (REQ-020 · Q-069). ودون اتصال: يُؤجَّل الفحص؛ ويبقى التطبيق يعمل ومسار SOS يعمل (SCR-12).

### 3-ح. توصيل أمر الأب + الإقرار (REQ-022 — §4.3 · Q-061)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Ktor as الخادم
    participant Agent as "وكيل الطفل"
    participant Shell as الغلاف
    Father->>Ktor: إصدار أمر (command_id + command_type)
    Ktor->>Agent: نشر الأمر على family/{family_id}/devices/{device_id}/commands
    Agent->>Shell: تنفيذ الأمر
    Shell-->>Agent: إقرار الاستلام (ack)
    Agent->>Ktor: نشر الإقرار على family/{family_id}/devices/{device_id}/acks
    Note over Father,Agent: توصيل الأمر + الإقرار < 5 ثوانٍ؛ إعادة المحاولة بتراجع أسّي (REQ-022 · Q-061)
```

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الأربعة (§2)

```mermaid
flowchart TD
    Start([فتح التطبيق — إقلاع بارد < 1.2s]) --> Read[قراءة وضع الجهاز من device_mode]
    Read --> LowBW{"وضع النطاق المنخفض — اليمن (Q-064 · REQ-010)؟"}
    LowBW -->|نعم| Compress["استجابات مضغوطة Brotli/Gzip + لا تحديثات تلقائية + مزامنة يدوية/مجدولة + قنوات OTP بديلة (Q-021)"]
    Compress --> Mode{الوضع؟}
    LowBW -->|لا| Mode
    Mode -->|أهل| Config[تحميل الإعداد: region + planFlags + featureFlags]
    Config --> Render[عرض لوحة الأهل بقالب الدور]
    Render --> Hide[إخفاء الميزات خارج الخطة]
    Hide --> Ready[جاهز — قراءات p95 < 300ms]
    Mode -->|طفل| Child[وضع الطفل: فرض + خدمة خلفية]
    Child --> Notif["إشعار دائم: معلومات نافعة — الوقت المتبقي — لا عبارة رقابية (REQ-015 · G-006)"]
    Notif --> Conn{اتصال؟}
    Conn -->|لا| Banner["شريط حالة عدم اتصال خفيف + بيانات محفوظة (REQ-008)"]
    Banner --> Act[أي فعل يُسجَّل في Outbox]
    Conn -->|نعم| Sync[تفريغ Outbox + تحديث الإعداد]
    Act --> SOS{زر SOS 3 ثوانٍ؟}
    Sync --> SOS
    SOS -->|نعم| Send[تسليم لنظام الموقع فوراً — S1-07 يملك النقل]
    SOS -->|لا| Exit{محاولة خروج / فك إقران / إعداد إداري؟}
    Exit -->|نعم| Gate[طلب PIN الأب]
    Gate --> Pin{PIN صحيح؟}
    Pin -->|نعم| Allow[تنفيذ الإجراء]
    Pin -->|لا| Count{5 أخطاء؟}
    Count -->|لا| Retry[رفض + المحاولات المتبقية]
    Count -->|نعم| Lock[قفل 5 دقائق + تسجيل في AuditEvent]
    Exit -->|لا| Stay[البقاء في وضع الطفل]
    Stay --> Switch{محاولة تبديل الوضع / الملف؟}
    Switch -->|نعم| Refuse["رفض برسالة واضحة — بلا طلب PIN (REQ-018 · Q-063)"]
    Refuse --> Stay
    Switch -->|لا| Stay
```

- ملاحظة: تسجيل دخول الأب على جهاز طفل **لا** يبدّل الوضع — الوضع يتحدد بالإقران (REQ-002).
- ملاحظة: أي محاولة لتبديل الوضع أو الملف في المرحلة 1 تُرفض برسالة واضحة **بلا طلب PIN** (REQ-018 · Q-063) — الوضع ثابت لكل جهاز ولا تبديل ملفات في المرحلة 1. ووضع النطاق المنخفض (Q-064 · REQ-010) إلزامي لليمن: ضغط Brotli/Gzip، ولا تحديثات تلقائية، والمزامنة يدوية أو مجدولة، وقنوات OTP بديلة (Q-021).
- ملاحظة: الإشعار الدائم في وضع الأهل يعرض معلومات نافعة عن حالة العائلة، وفي وضع الطفل يعرض الوقت المتبقي — لا عبارة رقابية في أي وضع (REQ-015 · G-006)؛ والموافقة على المراقبة مرة واحدة في إعداد مشترك (أب + طفل)، والشفافية عن الفئات لا المحتوى.

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D6. المخزن D4 محلي على الجهاز (SQLite)؛ بقية المخازن جداول خادم (PostgreSQL) مع نسخة محفوظة محلياً للإعداد — **عدا D2 (`parent_gate`) فهو مخزن محلي على الجهاز (Q-142)**: hash الـ PIN مشفر على الجهاز ولا يغادر الجهاز أبداً، والخادم يسجل إثبات التحقق + القفل فقط عبر Outbox. ووضع النطاق المنخفض (Q-064 · REQ-010): الاستجابات مضغوطة Brotli/Gzip، ولا تحديثات تلقائية، والمزامنة يدوية/مجدولة (P4).

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: `GET /api/v1/families/{id}/shell/config` (3-أ) · `GET /api/v1/shell/registries/{registry}` (3-أ) · `POST /api/v1/shell/outbox/flush` (3-ج) · `POST /api/v1/shell/verification/challenge` (3-هـ) · `POST /api/v1/shell/verification/prove` (3-هـ) · `POST /api/v1/shell/push/register` (§4.4 — استدعاء واحد عند تسجيل الدخول/الإقران، بلا تسلسل مستقل) · أوامر MQTT `family/{family_id}/devices/{device_id}/commands` + الإقرار على `family/{family_id}/devices/{device_id}/acks` (3-ح · P7). ونقطة التحقق الخادمي من PIN **محذوفة** per Q-142 — التحقق من PIN محلي فقط (P3 ← D2).

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
        P7(7.0 توصيل أمر الأب + الإقرار)
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
    Push(["موفر الدفع — FCM / HMS / APNs"])

    S102 -->|بيانات الإقران| P1
    P1 -->|حفظ وضع الجهاز| D1
    D1 -->|الوضع + القالب| P2
    Father -->|فتح اللوحة| P2
    P2 -->|قراءة الأعلام| D3
    P2 -->|قراءة المنطقة| D5
    P2 -->|قراءة السجلات| D6
    P2 -->|لوحة الأهل| Father
    Child -->|محاولة إجراء مقيّد| P3
    P3 -->|التحقق محلياً من pin_hash المشفر| D2
    D2 -->|النتيجة + المحاولات| P3
    P3 -->|POST /api/v1/shell/verification/challenge| Ktor
    Ktor -->|"{challenge_id, nonce} — 5 دقائق"| P3
    P3 -->|"POST /api/v1/shell/verification/prove {signature}"| Ktor
    Ktor -->|"{verified}"| P3
    P3 -->|إثبات التحقق + القفل فقط — عبر Outbox| P4
    P3 -->|تسجيل المحاولات والقفل| Audit
    Child -->|فعل دون اتصال| P4
    P4 -->|تسجيل الحدث| D4
    D4 -->|دفعة مضغوطة| Ktor
    Ktor -->|FlushResult| P4
    Kotlin -->|getDeviceHealth| P5
    P5 -->|"تنبيه / تعطيل انتقالات — أقل من 2GB: تعطيل Lottie/Blur للحفاظ على 60fps (REQ-013)"| Shell
    Child -->|ضغط SOS 3 ثوانٍ| P6
    P6 -->|حدث SOS| S107
    Ktor -->|"أمر الأب — family/{family_id}/devices/{device_id}/commands"| P7
    Ktor -->|"إشعار (payload — §4.4)"| Push
    Push -->|"دفع للوحة الأهل — احتياطه قناة تنبيهات MQTT (Q-210)"| P2
    P7 -->|تنفيذ الأمر| Shell
    Shell -->|"إقرار الاستلام (ack) < 5 ثوانٍ"| P7
    P7 -->|"نشر الإقرار — family/{family_id}/devices/{device_id}/acks"| Ktor
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
        K2["مراقبة الصحة — أقل من 2GB: تعطيل Lottie/Blur — 60fps (REQ-013)"]
        K3[تطبيق قواعد الفرض]
        K4["التحقق المحلي من PIN — مقابل pin_hash المشفر على الجهاز (Q-142)"]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1["GET /api/v1/families/{id}/shell/config"]
        V3[POST /api/v1/shell/outbox/flush]
        V4["POST /api/v1/shell/verification/challenge + POST /api/v1/shell/verification/prove — إثبات بتوقيع الجهاز (Q-164)"]
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
    S5 --> K4
    K4 --> S6
    K4 -.->|إثبات التحقق + القفل يُحفظ في Outbox| V3
    K4 --> V4
    V4 --> S6
    S6 -->|مقبول| S7
    S6 -->|مرفوض| S7
    U2 --> U4
    U4 --> S8
    U5 --> S9
```

- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس الشاشة والمدخلات (§7).
