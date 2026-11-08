# S1-06: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** #9 إدارة العائلة (Family Management) — `CONTEXT-MAP.md` §2 صف 9
- **القرارات الحاكمة:** Q-001 · Q-109 · Q-110 · Q-118 · Q-120 · Q-121 · Q-122 · Q-123 · Q-124 · Q-125 · Q-064 · Q-054 · Q-058 · Q-022 · Q-167 · Q-007 (رفض-يتغلب — المنع يغلب)
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

14 حالة استخدام من السيناريوهات السبعة والمتطلبات (§2/§3): الأب والبالغ المفوَّض ينشئان المهام ويلغيانها، الطفل والمراهق يسلّمان، الذكاء يتحقق والأب احتياطي، والمحفظة (S1-05) ومركز الأوامر (S1-09) ممثلان كجهات خارجية. وإسناد مهمة بدلاً من منح الوقت (6-6) هو نفس حالة إنشاء المهمة، لا حالة مستقلة.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Child([الطفل])
    Teen([المراهق])
    AI([بوابة الذكاء Q-054])
    Server([خادم Ktor])
    S105([محفظة النقاط S1-05])
    S109([مركز الأوامر S1-09])
    MinIO([تخزين MinIO Q-058])

    subgraph S106 [S1-06: المهام والتقويم]
        direction TB
        UC1(إنشاء مهمة وإسنادها)
        UC2(إضافة فئة مهمة)
        UC3(إلغاء مهمة)
        UC4(تسليم مهمة مع الإثبات)
        UC5(التحقق بالذكاء من الإنجاز)
        UC6(الاعتماد اليدوي للأب)
        UC7(رفض تسليم مع ملاحظات)
        UC8(إلغاء تحقق)
        UC9(إنشاء حدث تقويم)
        UC10(عرض التقويم المزدوج هجري/ميلادي)
        UC11(استلام تذكير حدث أو مهمة)
        UC12(إنشاء مهمة شخصية — مراهق)
        UC13(تسليم مهمة دون اتصال)
        UC14["إصدار حدث الكسب family/{family_id}/tasks.completed"]
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC9
    Adult --> UC1
    Adult --> UC3
    Adult --> UC6
    Adult --> UC9
    Child --> UC4
    Child --> UC10
    Child --> UC11
    Child --> UC13
    Teen --> UC4
    Teen --> UC10
    Teen --> UC11
    Teen --> UC12
    UC4 -.->|يتضمن| UC5
    UC4 --> AI
    UC5 --> AI
    UC5 --> UC14
    UC6 --> UC14
    UC14 --> S105
    UC4 --> S109
    UC5 --> MinIO
    UC8 --> S105
    UC13 --> Server
    UC12 -.->|تسليم بلا نقاط Q-109| UC4
```

- ملاحظة: إلغاء التحقق (UC8) للأب وحده (§6 `tasks.revoke`)، وإضافة الفئة (UC2) للأب وحده (§6 `tasks.category.create`) — البالغ المفوَّض لا يملكهما. والمهمة الشخصية للمراهق (UC12) تُسلَّم وتُسجَّل منجزة بلا نقاط ولا يصدر عنها حدث كسب (§7).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الأربعة من §5 كما هي، مع أربعة مراجع خارجية: العضوية (`membership` — S1-02)، و`points_ledger` (S1-05)، و`AuditEvent` (النواة المشتركة)، وصور الإثبات في MinIO (Q-058). ملاحظتان: مرآة Drift والـ Outbox مخزنان محليان على الجهاز (SQLite) وليسا جدولَي خادم (§5)، ونسخ المهام المتكررة محسوبة عند الطلب لا صفوفاً مادية (REQ-010) فلا جدول للنسخ. كل جدول يحمل `family_id` + عزل RLS (D-021).

```mermaid
erDiagram
    family ||--o{ task : "له مهام"
    family ||--o{ task_category : "له فئات"
    family ||--o{ calendar_event : "له أحداث"
    task_category ||--o{ task : "تصنّف مهام"
    task ||--o{ task_checklist : "له بنود — REQ-004"
    task ||--o{ AuditEvent : "أحداثه تُسجَّل"
    task }o--|| membership : "مُسندة إلى عضو واحد"
    task }o--|| membership : "أنشأها عضو"
    calendar_event }o--|| membership : "حضور عضو أو كل العائلة"
    task ||--o{ points_ledger : "إيداعها عبر family/{family_id}/tasks.completed"
    task ||--|| MinIO_proof : "إثباتها صورة في"

    task {
        uuid task_id PK
        uuid family_id FK
        text title_ar
        text description_ar
        uuid assigned_member_id FK
        uuid category_id FK
        int reward_points
        date due_date
        time due_time
        text rrule
        text proof_method
        text status
        text proof_ref
        timestamptz submitted_at
        text verified_by
        timestamptz verified_at
        text approved_by
        timestamptz approved_at
        text rejection_notes
        text created_by FK
        timestamptz created_at
        timestamptz updated_at
    }
    %% REQ-004: بنود قائمة فحص فرعية
    task_checklist {
        uuid item_id PK
        uuid task_id FK
        text item_title_ar
        boolean is_completed
        int sort_order
    }
    task_category {
        uuid category_id PK
        uuid family_id FK
        text name_ar
        text color
        text emoji
    }
    calendar_event {
        uuid event_id PK
        uuid family_id FK
        text title_ar
        text description_ar
        text location_text
        timestamptz start_time
        timestamptz end_time
        boolean is_all_day
        text rrule
        uuid attendee_member_id FK
        int reminder_minutes
        text created_by FK
        timestamptz created_at
        timestamptz updated_at
    }
    family {
        uuid id PK
    }
    membership {
        uuid id PK
    }
    points_ledger {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
    }
    MinIO_proof {
        text proof_ref PK
    }
```

- ملاحظة: `reward_points` افتراضي 10 و≥ 0، و0 دائماً لمهام المراهقين (Q-109 — تُفرض صفراً على الخادم)؛ و`status` أربع قيم فقط: PENDING / SUBMITTED_BY_CHILD / APPROVED / CANCELLED (§5)؛ و`family_id` في `task_category` يكون NULL للفئات الأربع الافتراضية العامة (منزل/مدرسة/صلاة وقرآن/عناية ذاتية — REQ-002) وقيمةً لفئة أضافها الأب لعائلته (§5)؛ و`rrule` في `task` و`calendar_event` قاعدة iCalendar خام تشمل `byDay` و`byMonthDay` و`interval` و`endDate`/`endOccurence` و`exdate` و`rdate` (REQ-010 · ملحق RE)؛ و`reminder_minutes` في `calendar_event` افتراضي 60 والخيارات 15/30/60 دقيقة أو يوم (REQ-014). و`MinIO_proof` مرجع غير جدولي إلى تخزين كائنات (MinIO) لا جدول في قاعدة البيانات.

## 3. التسلسل (Sequence) — من عقود §4

سبعة مخططات، كل واحد لتدفق واحد:

- النقل مزدوج (Q-209): الخادم ينشر `family/{family_id}/tasks.completed` و`family/{family_id}/tasks.verification-revoked` على MQTT (QoS 1) بجانب الحدث الداخلي إلى S1-05 — لا يُحذف التسليم الداخلي.

### 3-أ. إنشاء مهمة وإسنادها (REQ-001/002/003 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant DB as قاعدة_البيانات
    participant Assignee as جهاز المُسند إليه
    Father->>App: إنشاء مهمة (عنوان + مُسند واحد + فئة + نقاط + استحقاق + إثبات)
    App->>Ktor: POST /api/v1/families/{id}/tasks {tasks.create}
    Ktor->>Ktor: التحقق من الصلاحية + النقاط (0 للمراهق Q-109)
    alt فئة جديدة
        Ktor->>DB: إنشاء task_category (الأب وحده)
    end
    Ktor->>DB: إدراج task (status=PENDING)
    Ktor->>Ktor: جدولة تذكير المهمة (افتراضي قبل 60 دقيقة Q-124)
    Ktor->>Assignee: نشر family/{family_id}/tasks.created (QoS 1 — §4) — المهمة ظهرت للمُسند إليه فوراً
    Ktor-->>App: Task {task_id}
    App-->>Father: المهمة ظهرت للمُسند إليه فوراً
```

### 3-ب. التسليم والتحقق بالذكاء — نجاح (REQ-006/007 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    Child->>App: تسليم المهمة مع الإثبات (صورة/تسجيل/تسليم ذاتي Q-122)
    App->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/proof (ملف الإثبات — رفع عبر Ktor إلى MinIO — §4-1-أ)
    Ktor-->>App: {proof_ref}
    App->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}
    Ktor->>Ktor: التحقق: المُسند إليه؟ تسليم نشط واحد؟ (ALREADY_SUBMITTED إن تكرر — والإعادة بنفس client_request_id تُعيد التسليم الأصلي)
    Ktor->>Ktor: حفظ proof_ref في MinIO + status=SUBMITTED_BY_CHILD
    Ktor->>AI: تحقق من الإنجاز (مفتاح agent.task.verify — عقد Q-167)
    Note over Ktor,AI: مهلة الاستدعاء + إعادة محاولة واحدة تُحسب من الميزانية؛ وعند الفشل النهائي → احتياطي الأب (Q-121 — §7)
    alt دليل مباشر — منح تلقائي
        AI-->>Ktor: مطابق للمطلوب (مباشر)
    else دليل مقدَّم — تحقق ثم منح
        AI-->>Ktor: مطابق للمطلوب (مقدَّم)
    end
    Ktor->>Ktor: status=APPROVED + verified_by=ai
    Ktor->>Ktor: AgentActionLog — الفعل + المفتاح agent.task.verify + الدليل + طبقة الثقة
    Ktor->>S105: family/{family_id}/tasks.completed {source_system=S1-06} (Q-118)
    Ktor->>MQTT: publish family/{family_id}/tasks.completed (QoS 1 — Q-209)
    Note over Ktor,MQTT: فشل نشر MQTT لا يفقد الإيداع: الحدث الداخلي إلى S1-05 هو المرجع (Q-209 — §7)
    S105-->>Ktor: إيداع النقاط في المحفظة
    Ktor-->>App: تم — النقاط دخلت المحفظة
```

- لا تُودع نقطة قبل التحقق (Q-110) — التسليم الذاتي وحده لا يودع شيئاً (§6).

### 3-ج. الذكاء لا يستطيع التحقق — الاعتماد اليدوي للأب (REQ-008 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    participant S109 as المركز
    Child->>App: تسليم المهمة مع الإثبات
    App->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}
    Ktor->>AI: تحقق من الإنجاز
    AI-->>Ktor: لا يستطيع التحقق (مثال: صورة غير واضحة)
    Ktor->>Ktor: تبقى SUBMITTED_BY_CHILD — معلّقة (Q-121)
    Ktor->>S109: family/{family_id}/tasks.submitted → بطاقة "يتطلب انتباهك" (REQ-015)
    Father->>App: مراجعة الإثبات والنتيجة المسجلة مع السبب
    Father->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {APPROVE, client_request_id}
    Ktor->>Ktor: status=APPROVED + verified_by=father
    Ktor->>S105: family/{family_id}/tasks.completed {source_system=S1-06}
    Ktor->>MQTT: publish family/{family_id}/tasks.completed (QoS 1 — Q-209)
    S105-->>Ktor: إيداع النقاط
    Ktor-->>Father: اعتُمدت يدوياً وأُودعت النقاط
```

- ملاحظة: الذكاء "لا يستطيع التحقق" (Q-121) يختلف عن "يرفض الإنجاز" (§7): الرفض لعدم المطابقة لا يودع شيئاً ويُشعَر الطفل بالسبب، والأب يرى الرفض وقد يعتمد يدوياً فيتجاوز الرفض ويُودع النقاط.

### 3-د. الرفض مع ملاحظات وإلغاء تحقق (REQ-009 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    actor Child as الطفل
    participant App as التطبيق
    participant Ktor as الخادم
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    Father->>App: رفض تسليم مع ملاحظات
    App->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {REJECT_WITH_NOTES, client_request_id}
    Ktor->>Ktor: status=PENDING + rejection_notes
    Ktor-->>App: عادت المهمة PENDING ليعيدها الطفل
    Child->>App: إعادة التسليم بإثبات جديد
    Note over Father,S105: إلغاء تحقق بعد الإيداع (الأب وحده)
    Father->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/revoke-verification {client_request_id}
    Ktor->>S105: family/{family_id}/tasks.verification-revoked → قيد تعويضي يخصم النقاط
    Ktor->>MQTT: publish family/{family_id}/tasks.verification-revoked (QoS 1 — Q-209)
    S105-->>Ktor: خصم من الرصيد الحالي (صفراً ولا سالب أبداً — §7)
```

### 3-هـ. التكرار RRULE وحدث التقويم والتذكير (REQ-010/011/012/013/014 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant K as Kotlin
    participant Family as العائلة
    Father->>App: إنشاء مهمة متكررة (RRULE: الأحد–الخميس)
    App->>Ktor: POST /api/v1/families/{id}/tasks {rrule}
    Ktor->>Ktor: التحقق من RRULE (INVALID_RRULE إن باطلة)
    Note over Ktor,App: RRULE خام (iCalendar): byDay + byMonthDay + interval + endDate/endOccurence + exdate + rdate — النسخ محسوبة عند الطلب (REQ-010 · ملحق RE)
    Ktor->>Ktor: النسخ محسوبة عند الطلب — لا صفوف مادية
    Ktor-->>App: نسخة اليوم ظاهرة؛ نسخة الغد تظهر صباحاً
    Note over Ktor,App: نسخة اليوم الفائتة تنتهي بنهاية اليوم ولا تتراكم (Q-123 · Q-183)
    Father->>App: إنشاء حدث تقويم (موعد طبيب الأسنان)
    App->>Ktor: POST /api/v1/families/{id}/events
    Ktor->>Ktor: عرض مزدوج هجري (أم القرى) / ميلادي (Q-124)
    Ktor->>K: scheduleLocalReminder (افتراضي 60 دقيقة؛ والخيارات 15/30/60 دقيقة أو يوم — REQ-014)
    K->>K: منبّه محلي دقيق يعمل دون اتصال (REQ-014)
    K-->>Family: تذكير لكل العائلة قبل الموعد بساعة
    Ktor->>Family: family/{family_id}/calendar.event.reminder — تذكير حدث (لخدمة التنبيهات، §4)
    Note over K,Family: التذكير الواحد لا يُعرض مرتين: المنبّه المحلي والحدث نسختا تسليم للتذكير نفسه (reminder_id واحد) — أول وصول يفوز ويُكتم الثاني (§6/§7)
```

- تذكير حدث في الماضي يُتجاهل بصمت والحدث نفسه يبقى (§7)؛ وعرض التقويم 3 أشهر مقدماً كحد أقصى (REQ-010).

### 3-و. التسليم دون اتصال (REQ-016 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant App as التطبيق
    participant OB as Outbox
    participant Ktor as الخادم
    Child->>App: تسليم مهمة دون اتصال
    App->>OB: حفظ التسليم في Outbox (Drift محلي)
    Note over App,OB: عند عودة الاتصال — إعادة محاولة محدودة بتراجع أسي؛ وإزالة التكرار بـ client_request_id لكل نسخة؛ واحتفاظ 7 أيام (§7)
    App->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit (من Outbox) {proof_ref, client_request_id}
    alt المهمة أُلغيت أثناء الانقطاع
        Ktor-->>App: رفض التسليم + إشعار الطفل (§7)
    else المهمة ما زالت PENDING
        Ktor-->>App: قُبل التسليم — يمضي لمسار التحقق (3-ب/3-ج)
    end
```

### 3-ز. شك الذكاء — إحالة للأب بنقرة واحدة (REQ-017 — عقد Q-167 §4)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    participant S109 as المركز
    Child->>App: تسليم المهمة مع الإثبات
    App->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}
    Ktor->>AI: تحقق من الإنجاز (مفتاح agent.task.verify — عقد Q-167)
    AI-->>Ktor: شك — الدليل غير حاسم (confidence_tier=مشكوك)
    Ktor->>Ktor: تبقى SUBMITTED_BY_CHILD — معلّقة + AgentActionLog (الشك + الدليل)
    Ktor->>S109: family/{family_id}/tasks.submitted → بطاقة "يتطلب انتباهك" — اعتماد بنقرة واحدة (REQ-015)
    Father->>App: مراجعة الإثبات + الشك المسجل مع السبب
    alt الأب يعتمد بنقرة واحدة
        Father->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {APPROVE, client_request_id}
        Ktor->>Ktor: status=APPROVED + verified_by=father
        Ktor->>S105: family/{family_id}/tasks.completed {source_system=S1-06}
        Ktor->>MQTT: publish family/{family_id}/tasks.completed (QoS 1 — Q-209)
        S105-->>Ktor: إيداع النقاط
    else الأب يرفض
        Father->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {REJECT_WITH_NOTES, client_request_id}
        Ktor->>Ktor: status=PENDING + rejection_notes
        Ktor-->>App: عادت المهمة PENDING ليعيدها الطفل
    end
```

## 4. تدفق المستخدم (User Flow) — من السيناريوهات السبعة (§2)

```mermaid
flowchart TD
    Start([الأب يفتح المهام والتقويم]) --> Create[إنشاء مهمة: عنوان + مُسند واحد + فئة + نقاط + استحقاق + إثبات]
    Create --> TeenQ{المُسند مراهق؟}
    TeenQ -->|نعم| Zero[النقاط 0 دائماً — Q-109]
    TeenQ -->|لا| Points[النقاط افتراضي 10 — خيارات 5/10/15/25]
    Zero --> Show[تظهر المهمة للمُسند فوراً + تذكير قبل ساعة]
    Points --> Show
    Show --> Do[الطفل ينجز بنود قائمة الفحص بنداً بنداً]
    Do --> Submit[تسليم مع الإثبات المطلوب]
    Submit --> Who{من يتحقق؟}
    Who -->|الذكاء يستطيع| AIOK{مطابق للمطلوب؟}
    AIOK -->|نعم| TeenCheck{مراهق؟}
    AIOK -->|لا — رفض| Notify[لا إيداع + إشعار الطفل بالسبب + الأب يرى الرفض]
    Who -->|الذكاء لا يستطيع| Pending[تبقى معلّقة — بطاقة S1-09]
    Who -->|الذكاء يشك| Doubt[شك — يُحال للأب بنقرة واحدة]
    Doubt --> FatherRev
    Pending --> FatherRev{الأب يراجع}
    FatherRev -->|يعتمد| TeenCheck
    FatherRev -->|يرفض مع ملاحظات| Back[تعود PENDING — يعيدها الطفل]
    Back --> Do
    Notify --> FatherRev
    TeenCheck -->|نعم| NoEvent[تُسجَّل منجزة بلا نقاط — لا حدث كسب يصدر]
    TeenCheck -->|لا| Deposit["إيداع النقاط — family/{family_id}/tasks.completed إلى S1-05"]
    Deposit --> Streak["إيداع النقاط في المحفظة — السلسلة تُحدَّث في S1-05 (REQ-007)"]
    Streak --> Spend[يصرفها الطفل كوقت إضافي للتطبيق — سيناريو 6-6]
    NoEvent --> End([منجزة])
    Spend --> End
```

- ملاحظة: مسار "مهمة بدلاً من منح الوقت" (6-6) هو نفس دورة الحياة أعلاه: الأب يرفض المنح ويسند مهمة (10 نقاط) فينجزها الطفل فيصرف نقاطها كوقت للعبة عبر S1-05. والمهمة الشخصية للمراهق (6-7) تمر بنفس التدفق لكنها تنتهي عند "منجزة بلا نقاط".

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D4 جداول خادم (PostgreSQL). المخزنان المحليان (مرآة Drift + Outbox) على الجهاز (SQLite) وليسا جدولَي خادم. والمخازن الخارجية: `points_ledger` (S1-05) و`AuditEvent` (النواة) وMinIO (Q-058).

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: `GET /api/v1/families/{id}/tasks` و`GET /api/v1/families/{id}/tasks/{taskId}` و`PATCH /api/v1/families/{id}/tasks/{taskId}` (قراءة/تعديل مهمة — تمر عبر P1) · `DELETE /api/v1/families/{id}/tasks/{taskId}` (إلغاء مهمة — REQ-005، تمر عبر P1) · `GET /api/v1/families/{id}/task-categories` و`POST /api/v1/families/{id}/task-categories` (الفئات — REQ-002، تمر عبر P1) · `GET /api/v1/families/{id}/events` و`PATCH /api/v1/families/{id}/events/{eventId}` و`DELETE /api/v1/families/{id}/events/{eventId}` (أحداث التقويم — تمر عبر P5)؛ و`POST .../occurrences/{occurrenceId}/proof` و`PATCH .../tasks/{taskId}/checklist/{itemId}` (رفع إثبات + تبديل بند — تمر عبر P2)؛ وبقية النقاط مرسومة في §3 (tasks إنشاء، submit، approve، revoke-verification، events إنشاء).

```mermaid
flowchart LR
    Father([الأب / البالغ المفوَّض])
    Child([الطفل / المراهق])
    AI([بوابة الذكاء Q-054])
    S105([محفظة النقاط S1-05])
    S109([مركز الأوامر S1-09])
    Kotlin([وحدة Kotlin — منبّهات])
    AgentActionLog([سجل أفعال الوكيل — عقد Q-167 §3 — يُعرض في S1-09])

    subgraph Tasks [S1-06: المهام والتقويم]
        P1(1.0 إنشاء المهام والفئات وإلغاؤها)
        P2(2.0 التسليم والإثبات)
        P3(3.0 التحقق بالذكاء)
        P4(4.0 مراجعة الأب عند تعذّر التحقق أو اعتراضه — اعتماد / رفض / إلغاء تحقق)
        P5(5.0 التكرار والتقويم والتذكير)
        P6(6.0 المزامنة دون اتصال)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 task)]
        D2[(D2 task_checklist — REQ-004)]
        D3[(D3 task_category)]
        D4[(D4 calendar_event)]
        D5[(D5 مرآة Drift — محلية)]
        D6[(D6 Outbox — محلي)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent])
    MinIO([MinIO — صور الإثبات])
    Notif([خدمة التنبيهات — سياق الإشعارات والتوصيل])

    Father -->|إنشاء / إلغاء مهمة| P1
    P1 -->|حفظ المهمة| D1
    P1 -->|فئة جديدة| D3
    P1 -->|بنود قائمة الفحص| D2
    P1 -->|"family/{family_id}/tasks.created"| Child
    D1 -->|المهمة + حالتها| P2
    Child -->|تسليم + إثبات| P2
    P2 -->|صورة الإثبات| MinIO
    P2 -->|proof_ref + SUBMITTED_BY_CHILD| D1
    P2 -->|"family/{family_id}/tasks.submitted"| S109
    P2 -->|الإثبات للتحقق| P3
    AI -->|"نتيجة التحقق + الدليل + طبقة الثقة (مباشر/مقدَّم/مشكوك)"| P3
    P3 -->|"نجاح التحقق: family/{family_id}/tasks.completed {source_system=S1-06}"| S105
    P3 -->|نجاح التحقق: APPROVED| D1
    P3 -->|لا يستطيع التحقق| P4
    P3 -->|شك — إحالة للأب بنقرة| P4
    P3 -->|"سجل الفعل (المفتاح agent.task.verify + البوابة + الدليل)"| AgentActionLog
    P3 -->|"رفض التحقق (غير مطابق)"| P4
    Father -->|اعتماد / رفض / إلغاء| P4
    P4 -->|اعتماد يدوي فقط: APPROVED| D1
    P4 -->|"اعتماد يدوي فقط: family/{family_id}/tasks.completed {source_system=S1-06}"| S105
    P4 -->|رفض: PENDING| D1
    P4 -->|"family/{family_id}/tasks.verification-revoked"| S105
    P4 -->|تسجيل كل حدث| Audit
    P1 -->|RRULE + استحقاق| P5
    P5 -->|حساب النسخ عند الطلب| D1
    Father -->|إنشاء حدث تقويم| P5
    P5 -->|حفظ الحدث| D4
    P5 -->|جدولة منبّه محلي| Kotlin
    Kotlin -->|"تذكير قبل الموعد (افتراضي 60 دقيقة؛ والخيارات 15/30/60 دقيقة أو يوم — REQ-014)"| Child
    Kotlin -->|تذكير حدث| Father
    P5 -->|"family/{family_id}/calendar.event.reminder"| Notif
    Child -->|تسليم دون اتصال| P6
    P6 -->|حفظ في Outbox| D6
    P6 -->|قراءة المهام المحفوظة| D5
    D6 -->|عند عودة الاتصال| Ktor
    Ktor -->|قبول / رفض التسليم| P6
    P6 -->|التسليم المقبول| P2
```

## 6. مخطط النشاط (Activity) — دورة حياة المهمة والتقويم

المسارات الخمسة (الأب / الطفل / الذكاء / الخادم / المحفظة ومركز الأوامر) كمسارات متوازية. ومسار التقويم والتذكير يعمل **بالتوازي** مع دورة حياة المهمة.

```mermaid
flowchart LR
    subgraph Father [الأب / البالغ المفوَّض]
        direction TB
        F1([إنشاء مهمة وإسنادها])
        F2[مراجعة تسليم معلّق]
        F3{القرار؟}
        F4[اعتماد يدوي]
        F5[رفض مع ملاحظات]
        F6[إلغاء تحقق]
        F7[إنشاء حدث تقويم]
    end
    subgraph Child [الطفل / المراهق]
        direction TB
        C1([استلام المهمة + التذكير])
        C2[إنجاز بنود قائمة الفحص]
        C3[تسليم مع الإثبات]
        C4[إعادة التسليم بعد الرفض]
        C5[صرف النقاط كوقت — عبر S1-05]
    end
    subgraph AI [الذكاء — بوابة Q-054]
        direction TB
        A1[استلام الإثبات]
        A2{يستطيع التحقق؟}
        A3{مطابق للمطلوب؟}
        A4[إثبات النتيجة مع السبب]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[حفظ المهمة PENDING]
        V2[حفظ التسليم SUBMITTED_BY_CHILD]
        V3[تحديث الحالة APPROVED]
        V4[حساب نسخ RRULE عند الطلب]
        V5[إنهاء نسخة اليوم الفائتة]
        V6[تسجيل AuditEvent]
    end
    subgraph WalletHub [المحفظة S1-05 + مركز الأوامر S1-09]
        direction TB
        W1["بطاقة «يتطلب انتباهك» — family/{family_id}/tasks.submitted"]
        W2["إيداع النقاط — family/{family_id}/tasks.completed"]
        W3["قيد تعويضي — family/{family_id}/tasks.verification-revoked"]
    end

    F1 --> V1
    V1 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> V2
    V2 --> W1
    V2 --> A1
    A1 --> A2
    A2 -->|لا يستطيع| F2
    A2 -->|نعم| A3
    A3 -->|مطابق| A4
    A3 -->|غير مطابق| F2
    A4 --> V3
    V3 --> W2
    F2 --> F3
    F3 -->|يعتمد| F4
    F3 -->|يرفض| F5
    F4 --> V3
    F5 --> C4
    V3 --> C4
    C4 --> C3
    F6 --> W3
    V3 --> V6
    V2 --> V6
    W2 --> C5
    F1 --> V4
    V4 --> V5
    F7 --> V4
```

- ملاحظة: نسخة اليوم الفائتة تنتهي بنهاية اليوم ولا تتراكم أبداً (Q-123 · Q-183)؛ وتظهر نسخة الغد صباحاً (§2 مخطط التكرار). والمراهق يمر بنفس المسارات لكن إيداعه صفر نقاط ولا حدث كسب يصدر (§7).
