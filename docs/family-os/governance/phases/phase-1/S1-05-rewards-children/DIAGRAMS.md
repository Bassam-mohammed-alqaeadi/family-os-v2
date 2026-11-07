# S1-05: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط · §9 في مرحلة التصميم)
- **السياق المحدد (Bounded Context):** #9 إدارة العائلة (Family Management) — `CONTEXT-MAP.md` §2 صف 9
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-064 · Q-107 · Q-108 · Q-109 · D-012 · Q-009 · Q-110 · Q-111 · Q-112 · Q-113 · Q-114 · Q-116 · Q-117 · Q-118 · Q-119 · Q-054 · Q-167 · Q-115 · Q-007 (رفض-يتغلب — المنع يغلب)
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

13 حالة استخدام من السيناريوهات الثمانية والمتطلبات (§2/§3): الأب يملك كل القرارات (المنح المباشر، إسناد مهمة بدلاً من المنح، ضبط المعاملات، تجميد السلسلة)؛ والبالغ المفوَّض يعمل حسب القالب (S1-03)؛ والطفل يرى محفظته فقط ويطلب ويصرف؛ والمراهق **لا** محفظة له إطلاقاً (Q-109) فيظهر كجهة مرفوضة؛ والكسب يأتي من أي نظام مسجَّل عبر عقد عام (Q-118)؛ والفرض نفسه محرك S1-10 لا S1-05 (REQ-015).

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Child([الطفل])
    Teen([المراهق — بلا محفظة])
    S106([نظام المهام S1-06])
    Other([أنظمة أخرى مسجَّلة — تعليم / دين])
    AI([بوابة الذكاء Q-054])
    S110([محرك الفرض S1-10])
    S109([مركز الأوامر S1-09 — REQ-016])

    subgraph S105 [S1-05: المكافآت للأطفال]
        direction TB
        UC1(عرض محفظة الطفل + السلسلة + سجل الحركات)
        UC2(منح نقاط يدوياً بلا مهمة)
        UC3(منح وقت إضافي مباشر — قيد ليوم واحد)
        UC4(القرار على طلب وقت — منح / رفض / إسناد مهمة)
        UC5(إسناد مهمة بدلاً من المنح)
        UC6(ضبط ضوابط المكافآت — الحد اليومي + مصادر الكسب + مكافأة السلسلة)
        UC7(تجميد السلسلة ليوم واحد)
        UC8(طلب وقت إضافي عند نفاد وقت التطبيق)
        UC9(صرف نقاط كوقت إضافي للتطبيق نفسه)
        UC10(إنجاز مهمة وتسليمها للتحقق)
        UC11(استقبال حدث كسب عام وإيداع النقاط)
        UC12(منح مكافأة سلسلة 7 أيام)
        UC13(عرض المحفظة دون اتصال + حفظ الطلب في Outbox)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC6
    Father --> UC7
    Adult --> UC1
    Adult --> UC2
    Adult --> UC4
    Child --> UC1
    Child --> UC8
    Child --> UC9
    Child --> UC10
    Child --> UC13
    Teen -.->|مرفوض + مسجَّل — Q-109| UC9
    UC4 -.->|يتضمن| UC5
    UC10 --> UC11
    S106 --> UC11
    Other --> UC11
    AI --> UC11
    UC11 -.->|يتضمن| UC12
    UC9 --> S110
    UC8 --> S109
    UC4 --> S109
```

- المصدر: §2 (السيناريوهات 5-1…5-8) · §3 (REQ-001…REQ-018 — ومنها REQ-017/REQ-018 عقد التحقق Q-167: المفتاح `agent.task.verify` + البوابة + السجل + التراجع) · §6 (مفاتيح `rewards.*`)؛ وUC1 يغطي REQ-002 (الرصيد + سجل الحركات ظاهران للطفل وللأب).
- `rewards.settings.edit` و`rewards.streak.freeze` للأب وحده (مالك العائلة) — §6؛ وبقية المفاتيح للأب + البالغ المفوَّض حسب القالب.
- UC9 يستهلك حدود S1-10 وأرصدته ولا يملك الفرض (REQ-015)؛ وUC8/UC4 يظهران في بطاقة "يتطلب انتباهك" في S1-09 (REQ-014). وودجة S1-09 (REQ-016) تعرض الرصيد + السلسلة + الطلبات المعلقة.

## 2. مخطط قاعدة البيانات (ERD)

الجداول الخمسة من §5 كما هي، مع ثلاثة مراجع خارجية موثقة في §5: عضوية الطفل (S1-02)، و`AuditEvent` (النواة المشتركة، domain=rewards)، والعائلة (حاملة `family_id` + RLS). ملاحظتان: مرآة المحفظة في Drift وOutbox مخزنان محليان على الجهاز (ليستا جدولَي خادم)؛ و`enabled_sources` من نوع jsonb في §5 وتظهر هنا كسلسلة نصية لأن مخطط ERD لا يميز jsonb.

```mermaid
erDiagram
    family ||--o{ child_wallet : "له محافظ أطفال"
    family ||--|| rewards_settings : "له ضوابط مكافآت"
    family ||--o{ points_ledger : "له حركات"
    family ||--o{ time_request : "له طلبات وقت"
    family ||--o{ granted_time : "له وقت ممنوح"
    membership ||--|| child_wallet : "عضوية الطفل — S1-02"
    child_wallet ||--o{ points_ledger : "حركاتها تُسجَّل"
    child_wallet ||--o{ time_request : "يطلب وقتاً"
    child_wallet ||--o{ granted_time : "يُمنح وقتاً"
    child_wallet ||--o{ AuditEvent : "منحها وصرفها يُسجَّلان"
    time_request ||--o{ AuditEvent : "قراراته تُسجَّل"

    child_wallet {
        uuid child_id PK
        uuid family_id FK
        int balance_points
        int total_earned_all_time
        int streak_days
        timestamptz streak_frozen_until
        int daily_spent_minutes
        timestamptz daily_spent_date
        timestamptz updated_at
    }
    points_ledger {
        uuid ledger_id PK
        uuid family_id FK
        uuid child_id FK
        text kind
        int amount
        text source_system
        uuid reference_id
        text evidence
        int balance_after
        timestamptz at
    }
    time_request {
        uuid request_id PK
        uuid family_id FK
        uuid child_id FK
        text app_package
        int minutes_requested
        text status
        text decided_by
        timestamptz decided_at
        uuid assigned_task_id
        timestamptz created_at
    }
    objection {
        uuid objection_id PK
        uuid family_id FK
        uuid child_id FK
        text subject_type
        uuid subject_id
        text objection_text
        text status
        text decided_by
        timestamptz decided_at
        text decision_reason
        timestamptz created_at
    }
    granted_time {
        uuid grant_id PK
        uuid family_id FK
        uuid child_id FK
        text app_package
        int minutes
        text source
        timestamptz expires_at
        int used_minutes
        text status
        timestamptz created_at
    }
    rewards_settings {
        uuid family_id PK
        int daily_spend_cap_minutes
        int streak_bonus_points
        text enabled_sources
    }
    family {
        uuid id PK
    }
    membership {
        uuid child_id PK
    }
    AuditEvent {
        uuid id PK
    }
```

- المصدر: §5 كاملاً (الجداول الخمسة وحقولها) · §6 (الثوابت الصلبة).
- `balance_points` لا يقل عن صفر أبداً — والفرض على الخادم لا على العميل (§6)؛ و`kind` في `points_ledger` إحدى: TASK_COMPLETED / STREAK_BONUS / MANUAL_GRANT / TIME_REDEEMED / TIME_GRANTED (§5)؛ و`status` في `time_request` إحدى: PENDING / APPROVED / REJECTED / TASK_ASSIGNED (§5)؛ و`status` في `granted_time` إحدى: ACTIVE / EXPIRED / EXHAUSTED (§5)؛ و`source` في `granted_time` إحدى: REDEEM / GRANT (§5).
- القيم الافتراضية المحكومة: `daily_spend_cap_minutes` = 60 دقيقة (Q-114) · `streak_bonus_points` = 50 نقطة (قابلة للتغيير من الأب — §5) · `enabled_sources` افتراضياً كل الأنظمة المسجلة (Q-118).
- لا محفظة للمراهقين إطلاقاً (Q-109) — فلا صف `child_wallet` لمراهق؛ وكل جدول يحمل `family_id` + عزل RLS (عائلة واحدة لكل حساب في المرحلة 1).

## 3. التسلسل (Sequence) — من عقود §4

سبعة مخططات، كل واحد لتدفق واحد — والتدفق السادس (3-و) قيد تعويضي لإلغاء التحقق، والسابع (3-ز) اعتراض الطفل (REQ-018):

- **نقاط القراءة في §4 (لا تسلسل مستقل لها — قراءات مباشرة):** `GET /api/v1/families/{id}/children/{childId}/wallet` (الرصيد + السلسلة + الطلبات المعلقة) · `GET /api/v1/families/{id}/children/{childId}/wallet/ledger` (سجل حركات المحفظة) · `GET /api/v1/families/{id}/rewards/settings` (ضوابط الأب) · `PATCH /api/v1/families/{id}/rewards/settings` (ضبط المعاملات — UC6).

- النقل مزدوج (Q-209): الخادم ينشر `family/{family_id}/tasks.completed` و`family/{family_id}/tasks.verification-revoked` على MQTT (QoS 1) بجانب الحدث الداخلي — لا يُحذف التسليم الداخلي.

### 3-أ. كسب نقاط عبر تحقق الذكاء (REQ-004 / REQ-005 — §4: `family/{family_id}/tasks.completed`)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant S106 as المهام
    participant AI as الذكاء
    participant Ktor as الخادم
    participant Wallet as المحفظة
    participant MQTT as وسيط MQTT
    participant Father as الأب
    Child->>S106: إنجاز المهمة وتسليمها
    S106->>AI: طلب تحقق — أُنجزت كما هو مطلوب؟ (مفتاح agent.task.verify — عقد Q-167)
    alt دليل مباشر (قراءة جهاز/تطبيق تثبت الإنجاز)
        AI-->>S106: verified = true (مباشر — منح تلقائي)
        S106->>Ktor: family/{family_id}/tasks.completed {source_system, task_id, points}
        Ktor->>Ktor: النظام مسجَّل؟ + لا إيداع مكرر لنفس task_id
        Ktor->>Wallet: إيداع النقاط + سجل في points_ledger مع الدليل (evidence)
        Ktor->>MQTT: publish family/{family_id}/tasks.completed (QoS 1 — Q-209)
        Ktor->>Ktor: AgentActionLog — الفعل + المفتاح agent.task.verify + الدليل + النتيجة
        Ktor->>Wallet: أول كسب موثَّق اليوم؟ أطِل السلسلة
        Ktor-->>Child: family/{family_id}/wallet/updated — نقاط دخلت + احتفالية قصيرة
    else دليل مقدَّم (صورة/إثبات يرفعه الطفل)
        AI-->>S106: verified = true (مقدَّم — تحقق ثم منح)
        S106->>Ktor: family/{family_id}/tasks.completed {source_system, task_id, points}
        Ktor->>Ktor: النظام مسجَّل؟ + لا إيداع مكرر لنفس task_id
        Ktor->>Wallet: إيداع النقاط + سجل في points_ledger مع الدليل (evidence)
        Ktor->>MQTT: publish family/{family_id}/tasks.completed (QoS 1 — Q-209)
        Ktor->>Ktor: AgentActionLog — الفعل + المفتاح agent.task.verify + الدليل + النتيجة
        Ktor-->>Child: family/{family_id}/wallet/updated — نقاط دخلت + احتفالية قصيرة
    else شك (الدليل غير حاسم)
        AI-->>S106: شك — يُحال للأب بنقرة واحدة
        S106->>Ktor: family/{family_id}/tasks.submitted → بطاقة "يتطلب انتباهك" في S1-09
        Note over S106,Ktor: لا إيداع حتى يقرر الأب (اعتماد يودع، رفض يعيد PENDING)
    else إقرار ذاتي وحده (تسليم بلا دليل)
        AI-->>S106: verified = false — الإقرار وحده لا يودع شيئاً (REQ-005)
        Note over S106,Ktor: لا يُصدر حدث family/{family_id}/tasks.completed
        Ktor-->>Child: لا إيداع + إشعار بالسبب
        Ktor->>Ktor: الأب يرى الرفض
    else رفض — لم تُنجز كما هو مطلوب
        AI-->>S106: verified = false
        Note over S106,Ktor: لا يُصدر حدث family/{family_id}/tasks.completed — verified = false تعني لا إيداع
        Ktor-->>Child: لا إيداع + إشعار بالسبب
        Ktor->>Ktor: الأب يرى الرفض
        opt اعتراض الطفل على الرفض (REQ-018 · Q-167)
            Child->>Ktor: اعتراض على الرفض
            Ktor-->>Father: إشعار فوري بالاعتراض
        end
    end
```

- تسليم الطفل الذاتي وحده لا يودع شيئاً (REQ-005/Q-110)؛ وإيداع مكرر لنفس `task_id` + `source_system` يعيد الإيداع الأصلي بلا مضاعفة (§7)؛ وحدث كسب من نظام غير مسجَّل يُرفض ويُسجَّل في التدقيق (§7/REQ-004).

### 3-ب. صرف نقاط كوقت إضافي (REQ-008 / REQ-009 / REQ-010 — §4: `POST /api/v1/families/{id}/children/{childId}/wallet/redeem`)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant Ktor as الخادم
    participant S110 as الفرض
    Child->>Shell: صرف نقاط كوقت للتطبيق الذي نفد وقته
    Shell->>Ktor: POST /api/v1/families/{id}/children/{childId}/wallet/redeem {app_package, points, client_request_id}
    Ktor->>Ktor: معاملة ذرية — فحص الرصيد + الحد اليومي (60 دقيقة افتراضياً)
    alt الرصيد يكفي والحد لم يُبلغ
        Ktor->>Ktor: خصم النقاط — 10 نقاط = 10 دقائق
        Ktor->>Ktor: إنشاء granted_time {source=REDEEM, expires_at=نهاية اليوم}
        Ktor->>Ktor: سجل TIME_REDEEMED في points_ledger + AuditEvent
        Ktor-->>Shell: family/{family_id}/wallet/updated — الرصيد الجديد
        Shell->>S110: الوقت الإضافي متاح للتطبيق (S1-05 لا يفرض)
        S110-->>Child: التطبيق يستمر
    else رصيد غير كافٍ
        Ktor-->>Shell: REW_INSUFFICIENT_POINTS + الرصيد الحالي
    else الحد اليومي بلغ
        Ktor-->>Shell: REW_DAILY_CAP_REACHED — يُرفض حتى الغد
    else صرف مكرر بنفس client_request_id
        Ktor-->>Shell: النتيجة الأصلية بلا خصم جديد
    end
```

- سعر الصرف ثابت 1:1 (Q-111)؛ والصرف على التطبيق الذي نفد وقته تحديداً (Q-116)؛ والوقت المصروف ينتهي بنهاية اليوم وما لم يُستخدم لا يُسترد — النقاط نفسها لا تنتهي (Q-112/REQ-009 · Q-183)؛ والحد اليومي يُفرض على الخادم (Q-114).

### 3-ج. طلب وقت إضافي وقرار الأب (REQ-012 / REQ-013 / REQ-014 — §4: `POST /api/v1/families/{id}/children/{childId}/time-requests` + `POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide`)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant Ktor as الخادم
    participant Father as الأب
    participant S109 as الأوامر
    Child->>Shell: نفد وقت التطبيق — طلب وقت إضافي (من شاشة الحظر)
    Shell->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests {app_package, minutes_requested}
    Ktor->>Ktor: طلب معلَّق لنفس التطبيق؟ أعد الأصلي
    Ktor->>Ktor: إنشاء time_request {status=PENDING}
    Ktor->>S109: family/{family_id}/time-request/new — بطاقة يتطلب انتباهك
    S109-->>Father: الطلب معروض — قرار بنقرة واحدة
    alt الأب يمنح مباشرة
        Father->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide {APPROVED}
        Ktor->>Ktor: إنشاء granted_time {source=GRANT, ينتهي بنهاية اليوم}
        Ktor->>Ktor: سجل TIME_GRANTED + AuditEvent
        Ktor-->>Child: family/{family_id}/time-request/decided — التطبيق يستمر
    else الأب يرفض
        Father->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide {REJECTED}
        Ktor-->>Child: family/{family_id}/time-request/decided — مرفوض
    else الأب يسند مهمة بدلاً من المنح
        Father->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide {TASK_ASSIGNED, assigned_task_id}
        Ktor->>Ktor: الطلب يتحول إلى TASK_ASSIGNED
        Ktor-->>Child: المهمة تظهر فوراً مع قيمتها النقطية
        Note over Child,Ktor: عند إنجاز المهمة + تحقق الذكاء تُودع النقاط — انظر 3-أ
    end
```

- طلب مكرر لنفس التطبيق وهو معلَّق يعيد الطلب الأصلي — لا طلبان معلَّقان لنفس التطبيق (§7)؛ والقرار على طلب سبق القرار عليه يعيد النتيجة الأصلية (`ALREADY_DECIDED` — §7)؛ والمنح المباشر قيد ليوم واحد وينتهي بنهايته (REQ-011).

### 3-د. منح يدوي من الأب + تجميد السلسلة (REQ-006 / REQ-007 / REQ-011 — §4: `POST /api/v1/families/{id}/children/{childId}/wallet/grant` + `POST /api/v1/families/{id}/children/{childId}/streak/freeze`)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Ktor as الخادم
    participant Wallet as المحفظة
    participant Child as الطفل
    Father->>Ktor: POST /api/v1/families/{id}/children/{childId}/wallet/grant {points, note} — مكافأة استثنائية بلا مهمة
    Ktor->>Wallet: إيداع فوري + سجل MANUAL_GRANT في points_ledger
    Ktor->>Ktor: AuditEvent (domain=rewards)
    Ktor-->>Child: family/{family_id}/wallet/updated — نقاط دخلت
    Father->>Ktor: POST /api/v1/families/{id}/children/{childId}/streak/freeze — تجميد ليوم واحد (مرض / سفر)
    Ktor->>Wallet: streak_frozen_until = الغد — التجميد يمدّد السلسلة يوماً واحداً
    Ktor-->>Father: السلسلة مجمَّدة — لن تنقطع
```

- المنح اليدوي بلا مهمة (Q-107/REQ-006)؛ والتجميد بإذن الأب فقط وليوم واحد في كل مرة (§6)؛ والتجميد بعد انقطاع السلسلة لا يعيدها (§7)؛ وسلسلة 7 أيام تكسب مكافأة السلسلة (50 نقطة افتراضياً — §5) مع شارة (§2: 5-5).

### 3-هـ. العمل دون اتصال والمزامنة (REQ-003 — §4: `getCachedWallet` + `queueTimeRequest`)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant K as Kotlin
    participant Ktor as الخادم
    Child->>Shell: عرض المحفظة دون اتصال
    Shell->>K: getCachedWallet
    K-->>Shell: آخر رصيد معروف + وقت صريح
    Shell-->>Child: الرصيد المعروض — آخر رصيد معروف مع وقته
    Child->>Shell: طلب وقت / صرف دون اتصال
    Shell->>K: queueTimeRequest — يُحفظ في Outbox
    Note over Shell,K: عند عودة الاتصال
    Shell->>Ktor: إرسال Outbox بترتيب زمني
    alt الرصيد يكفي
        Ktor-->>Shell: family/{family_id}/wallet/updated — مزامنة بلا خصم مكرر
    else الرصيد لا يكفي — صُرف من جهاز آخر
        Ktor-->>Shell: يُرفض مع إشعار
    end
```

- المحفظة تعمل دون اتصال (مخزن محلي Drift) وتُزامَن عند عودة الاتصال عبر Outbox بلا خصم مكرر (REQ-003/Q-064)؛ والرصيد المعروض دون اتصال هو آخر رصيد معروف مع وقت صريح (§6).

### 3-و. إلغاء تحقق — قيد تعويضي يعكس الإيداع (REQ-007/§6 — §4: `family/{family_id}/tasks.verification-revoked`)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant S106 as المهام
    participant Ktor as الخادم
    participant Wallet as المحفظة
    participant MQTT as وسيط MQTT
    participant Child as الطفل
    Father->>S106: إلغاء تحقق مهمة سبق اعتمادها (POST /api/v1/families/{id}/tasks/{taskId}/revoke-verification — S1-06 §4)
    S106->>Ktor: family/{family_id}/tasks.verification-revoked {source_system=S1-06, task_id, points}
    Ktor->>Ktor: البحث عن الإيداع الأصلي لنفس task_id + source_system
    alt وُجد إيداع أصلي لم يُعكَس بعد
        Ktor->>Wallet: قيد تعويضي سالب بنفس القيمة — الرصيد لا يقل عن صفر أبداً
        Ktor->>MQTT: publish family/{family_id}/tasks.verification-revoked (QoS 1 — Q-209)
        Ktor->>Ktor: AuditEvent (domain=rewards)
        Ktor-->>Child: family/{family_id}/wallet/updated — الرصيد الجديد بعد العكس
    else لا إيداع أصلي / سبق عكسه
        Ktor-->>Father: لا عكس — يعاد الإيداع الأصلي بلا مضاعفة (§7)
    end
```

- الاشتراك في `family/{family_id}/tasks.verification-revoked` إلزامي: إلغاء التحقق في S1-06 يعوَّض الإيداع في S1-05 (S1-06 SPEC §4 `revoke-verification` و§6)؛ والقيد التعويضي سالب بنفس قيمة الإيداع الأصلي، والرصيد لا يقل عن صفر أبداً (§6)؛ وإلغاء مكرر لنفس `task_id` لا يعكس مرتين (§7 — نفس قاعدة عدم التكرار في 3-أ).

### 3-ز. اعتراض الطفل على منح أو رفض + تراجع S1-05 (REQ-018 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant App as التطبيق
    participant Ktor as الخادم
    participant Father as الأب
    participant Wallet as المحفظة
    Child->>App: اعتراض على منح أو رفض
    App->>Ktor: POST /api/v1/families/{id}/children/{childId}/objections — اعتراض الطفل (يُشعَر به الأب فوراً — REQ-018 · Q-193)
    Ktor->>Father: إشعار فوري بالاعتراض + الدليل (AgentActionLog)
    Father->>App: مراجعة المنح/الرفض
    alt الأب يقبل الاعتراض (تراجع عن المنح)
        Father->>Ktor: POST /api/v1/families/{id}/children/{childId}/wallet/grants/{walletGrantId}/reverse
        Ktor->>Wallet: قيد تعويضي — حدث family/{family_id}/tasks.verification-revoked
        Ktor-->>Child: أُلغي المنح
    else الأب يرفض الاعتراض
        Ktor-->>Child: الاعتراض مرفوض + السبب
    end
```

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الثمانية (§2)

```mermaid
flowchart TD
    Start([نفد وقت التطبيق — من S1-10]) --> Req[الطفل يطلب وقتاً إضافياً — من شاشة الحظر]
    Req --> Card[الطلب يظهر في بطاقة يتطلب انتباهك — S1-09]
    Card --> Father{الأب يقرر}
    Father -->|يمنح مباشرة| Grant[وقت إضافي مباشر — قيد ليوم واحد]
    Grant --> Play[التطبيق يستمر]
    Father -->|يرفض| Reject[مرفوض — يُشعَر الطفل]
    Father -->|يسند مهمة| Task[مهمة تظهر للطفل مع قيمتها النقطية]
    Task --> Do[الطفل ينجز ويسلم]
    Do --> AI{الذكاء يتحقق؟}
    AI -->|لا — لم تُنجز كما هو مطلوب| NoCredit[لا نقاط — إشعار الطفل بالسبب + الأب يرى الرفض]
    NoCredit --> Obj["الطفل يعترض على الرفض — يُشعَر الأب فوراً (REQ-018)"]
    AI -->|نعم| Credit[نقاط تدخل المحفظة — أول كسب اليوم يطيل السلسلة]
    Credit --> Streak{سلسلة 7 أيام؟}
    Streak -->|نعم| Bonus[شارة + مكافأة السلسلة — 50 نقطة افتراضياً]
    Streak -->|لا| Wallet[الرصيد ظاهر للطفل وللأب + سجل الحركات]
    Bonus --> Wallet
    Wallet --> Redeem{الطفل يصرف؟}
    Redeem -->|لا| End([الرصيد يبقى — النقاط لا تنتهي])
    Redeem -->|نعم| Cap{وصل الحد اليومي — 60 دقيقة؟}
    Cap -->|نعم| Block[رفض حتى الغد مع رسالة واضحة]
    Cap -->|لا| Check{الرصيد يكفي؟ — 10 نقاط = 10 دقائق}
    Check -->|لا| NoBal[رفض مع الرصيد الحالي — لا رصيد سالب]
    Check -->|نعم| Spend[خصم ذري + وقت إضافي للتطبيق نفسه]
    Spend --> Expire[الوقت المصروف ينتهي بنهاية اليوم — ما لم يُستخدم لا يُسترد]
    Expire --> Play
```

- المصدر: §2 (5-1…5-8) · §3 (REQ-001…REQ-014 + REQ-018) · §7 (الحالات الحدية).
- مساران جانبيان لا يظهران في التدفق الرئيسي: منح الأب الفوري 20 نقطة بلا مهمة (5-6) وتجميد السلسلة يوماً واحداً بإذن الأب عند المرض/السفر (5-5) — انظر 3-د؛ ومراهق يحاول الكسب أو الصرف يُرفض ويُسجَّل (Q-109) قبل أي خطوة في التدفق.

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D5 جداول الخادم من §5، وD6–D7 مخزنان محليان على الجهاز (موثقان في §5: مرآة Drift + Outbox). كل منح/صرف/قرار يُسجَّل في AuditEvent (domain=rewards — §5).

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: نقاط القراءة `GET /api/v1/families/{id}/children/{childId}/wallet` و`GET /api/v1/families/{id}/children/{childId}/wallet/ledger` و`GET /api/v1/families/{id}/rewards/settings` و`PATCH /api/v1/families/{id}/rewards/settings` مذكورة في §3 (تُقرأ عبر P2/P6)؛ وبقية النقاط مرسومة في §3 (grant، redeem، time-requests، decide، streak/freeze)؛ ونقطة `POST …/wallet/grants/{walletGrantId}/reverse` (REQ-018 · Q-167) مرسومة في 3-ز؛ ونقطة `POST …/children/{childId}/objections` (REQ-018 · Q-193) مرسومة في 3-ز.

```mermaid
flowchart LR
    Father([الأب / البالغ المفوَّض])
    Child([الطفل])
    Teen([المراهق])
    S106([نظام المهام S1-06 + أنظمة مسجَّلة أخرى])
    AI([بوابة الذكاء Q-054])
    S110([محرك الفرض S1-10])
    S109([مركز الأوامر S1-09 — REQ-016])

    subgraph Rewards [S1-05: المكافآت]
        P1(1.0 استقبال حدث كسب والتحقق)
        P2(2.0 إدارة المحفظة والسجل)
        P3(3.0 الصرف كوقت إضافي)
        P4(4.0 طلبات الوقت وقرار الأب)
        P5(5.0 محرك السلاسل والتجميد)
        P6(6.0 إعدادات المكافآت والمزامنة دون اتصال)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 child_wallet)]
        D2[(D2 points_ledger)]
        D3[(D3 time_request)]
        D4[(D4 granted_time)]
        D5[(D5 rewards_settings)]
        D6[(D6 مرآة المحفظة Drift — محلي)]
        D7[(D7 Outbox — محلي)]
    end

    Ktor([خادم Ktor — وحدة rewards])
    Audit([AuditEvent — domain=rewards])
    AgentActionLog([سجل أفعال الوكيل — عقد Q-167 §3 — يُعرض في S1-09])

    S106 -->|"family/{family_id}/tasks.completed {source_system=S1-06} — source_system + task_id + نقاط"| P1
    S106 -->|"family/{family_id}/tasks.verification-revoked — قيد تعويضي يخصم النقاط (3-و)"| P1
    AI -->|"نتيجة التحقق + الدليل + طبقة الثقة (مباشر/مقدَّم/مشكوك)"| P1
    P1 -->|"سجل الفعل (المفتاح agent.task.verify + البوابة + الدليل)"| AgentActionLog
    P1 -->|نظام غير مسجَّل: رفض + تسجيل| Audit
    P1 -->|إيداع موثَّق| P2
    P2 -->|الرصيد + السلسلة| D1
    P2 -->|كل حركة| D2
    P2 -->|"family/{family_id}/wallet/updated"| Child
    P2 -->|الرصيد + السلسلة + الطلبات| S109
    Father -->|منح يدوي — نقاط + ملاحظة| P2
    Child -->|صرف — التطبيق + النقاط| P3
    P3 -->|فحص الرصيد + الحد اليومي ذرياً| D1
    P3 -->|فحص الحد| D5
    P3 -->|خصم + سجل TIME_REDEEMED| D2
    P3 -->|وقت ممنوح — ينتهي بنهاية اليوم| D4
    P3 -->|الوقت الإضافي متاح| S110
    Child -->|طلب وقت إضافي| P4
    P4 -->|حفظ الطلب PENDING| D3
    P4 -->|"family/{family_id}/time-request/new — بطاقة يتطلب انتباهك"| S109
    Father -->|قرار: منح / رفض / إسناد مهمة| P4
    P4 -->|القرار + assigned_task_id| D3
    P4 -->|منح مباشر — قيد ليوم واحد| D4
    P4 -->|"family/{family_id}/time-request/decided"| Child
    P2 -->|أول كسب موثَّق اليوم| P5
    P5 -->|السلسلة + التجميد| D1
    Father -->|تجميد يوم واحد| P5
    P5 -->|مكافأة 7 أيام — شارة + نقاط| P2
    Father -->|ضبط الحد + المصادر + مكافأة السلسلة| P6
    P6 -->|الضوابط| D5
    P6 -->|آخر رصيد معروف| D6
    Child -->|طلب / صرف دون اتصال| P6
    P6 -->|حفظ في Outbox| D7
    D7 -->|مزامنة عند عودة الاتصال| Ktor
    Teen -.->|كسب أو صرف: مرفوض + مسجَّل| Audit
    P2 -->|كل منح / صرف| Audit
    P3 -->|كل صرف| Audit
    P4 -->|كل قرار| Audit
```

- المصدر: §4 (REST + MQTT + MethodChannel) · §5 (الجداول الخمسة + مخزنا العميل) · §6 (الصلاحيات والثوابت).
- S1-05 يستهلك حدود S1-10 وأرصدته ولا يملك الفرض (REQ-015) — فلا عملية فرض في هذا المخطط؛ والفرض والحظر يبقيان في S1-10.

## 6. مخطط النشاط (Activity) — دورة حياة المحفظة

المسارات الخمسة (الطفل / الأب / خادم المكافآت / الذكاء / محرك S1-10) كمسارات متوازية. والأنشطة الخلفية (انتهاء الوقت المصروف بنهاية اليوم — Q-183، انقطاع السلسلة في يوم بلا كسب) تعمل **بالتوازي** مع استخدام التطبيق.

```mermaid
flowchart LR
    subgraph Child [الطفل]
        direction TB
        C1([نفد وقت التطبيق])
        C2[طلب وقت إضافي]
        C3[إنجاز مهمة وتسليمها]
        C4[عرض الرصيد + السلسلة + السجل]
        C5[صرف نقاط كوقت للتطبيق]
        C6([التطبيق يستمر])
        C7([مرفوض — يُشعَر الطفل — Q-179])
    end
    subgraph Father [الأب]
        direction TB
        F1[قرار على الطلب — منح / رفض / إسناد مهمة]
        F2[منح نقاط يدوياً]
        F3[منح وقت مباشر — قيد ليوم واحد]
        F4[تجميد السلسلة يوماً واحداً]
        F5[ضبط الحد اليومي والمصادر ومكافأة السلسلة]
        F6[الأب يرى الرفض — والطفل يُشعَر بالسبب]
    end
    subgraph Server [الخادم — Ktor: وحدة rewards]
        direction TB
        V1[استقبال حدث كسب — قبول المسجَّل ورفض غيره]
        V2[إيداع النقاط + سجل + AuditEvent]
        V3[إطالة السلسلة / مكافأة 7 أيام]
        V4[صرف ذري — فحص الرصيد + الحد اليومي]
        V5[إنشاء وقت ممنوح ينتهي بنهاية اليوم]
        V6[تسجيل كل منح / صرف / قرار في AuditEvent]
    end
    subgraph AI [الذكاء — بوابة Q-054]
        direction TB
        A1[التحقق أن المهمة أُنجزت كما هو مطلوب]
        A2{النتيجة؟}
    end
    subgraph S110 [محرك الفرض S1-10]
        direction TB
        E1[تطبيق حدود الوقت والحظر]
        E2[إتاحة الوقت الممنوح للتطبيق]
        E3["انتهاء الوقت المصروف بنهاية اليوم — EXPIRED (Q-183)"]
    end

    C1 --> C2
    C2 --> F1
    F1 -->|يسند مهمة| C3
    F1 -->|يمنح مباشرة| F3
    F1 -->|"يرفض (Q-179)"| C7
    F3 --> V5
    C3 --> A1
    A1 --> A2
    A2 -->|أُنجزت| V1
    A2 -->|لم تُنجز| F6
    F6 --> C3
    V1 --> V2
    V2 --> V3
    V2 --> C4
    V3 --> C4
    F2 --> V2
    C4 --> C5
    C5 --> V4
    V4 --> V5
    V5 --> E2
    E2 --> C6
    V5 --> E3
    F4 --> V3
    F5 --> V4
    V2 --> V6
    V4 --> V6
    F1 --> V6
    E1 --> C1
```

- المصدر: §2 (دورة المحفظة وحلقة §2 البصرية) · §3 (REQ-001…REQ-018) · §6/§7 (الثوابت والحالات الحدية).
- ملاحظتان: يوم بلا كسب يقطع السلسلة إلا إذا جُمّدت، والتجميد بعد انقطاعها لا يعيدها (§7)؛ وتغيير الحد اليومي أثناء اليوم يطبق فوراً على ما تبقى من اليوم وما صُرف قبله لا يُسترجع (§7).
- إلغاء التحقق (S1-06) يصدر `family/{family_id}/tasks.verification-revoked` فيعوَّض الإيداع بقيد سالب — انظر التسلسل 3-و.
- كل منح/صرف/قرار مسجَّل في التدقيق (ACC-015)؛ ولا نقاط للمراهقين إطلاقاً (Q-109)؛ والصرف كوقت فقط في المرحلة 1 — لا كتالوج جوائز (Q-113).
