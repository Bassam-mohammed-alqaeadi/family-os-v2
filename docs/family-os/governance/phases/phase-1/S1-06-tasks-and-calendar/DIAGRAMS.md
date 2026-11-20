# S1-06: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-08 — D-2، بعد موجة الإصلاح 0e4a3e2..f7da470)؛ والمواصفة معتمدة بالكامل في التخطيط
- **اعتماد المالك بعد إعادة الرسم (Q-289 · Q-445 — 2026-11-19):** المخططات أدناه معتمدة على التصميم المغلق بعد مراجعة المصمم الرئيسي: تُرسم كلها، لا لوحة فوق عرض 1280 (ERD مستثنى)، لا مخالفة شكل، وكل متطلب مذكور في مخطط.
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** #9 إدارة العائلة (Family Management) — `CONTEXT-MAP.md` §2 صف 9
- **القرارات الحاكمة:** Q-001 · Q-109 · Q-110 · Q-118 · Q-120 · Q-121 · Q-122 · Q-123 · Q-124 · Q-125 · Q-064 · Q-054 · Q-058 · Q-022 · Q-167 · Q-168 · Q-007 (رفض-يتغلب — المنع يغلب) · Q-280 · Q-281 · Q-183 · Q-209 · Q-253 · Q-254 · Q-282
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل بطرفين مستديرين = طرف خارج العملية المرسومة (مستخدم، نظام مجاور، خدمة، أو الخادم) · مستطيل = شاشة أو خطوة، وفي مخطط تدفق البيانات عملية مرسومة في لوحة أخرى · مستطيل مستدير الزوايا = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري
- **إعادة الرسم 2026-11-19 (Q-434) على التصميم المعتمد (Q-415 · Q-419):** الرسم والنص متطابقان. ما تغيّر: (1) حالات الاستخدام صارت 18 على لوحتين: المساعد بدرجاته الثلاث وضبط تفويضه وقبول اقتراحه أو صرفه، وتحذير التعارض عند الحفظ؛ (2) ERD: جدولا المساعد `task_suggestion` و`task_agent_delegation` وحقل `task.created_by_type`؛ (3) التسلسل 3-ج قُسّم إلى لوحتين و3-ز قُسّم إلى لوحتين، وتسلسلان جديدان 3-ط (المساعد بدرجاته الثلاث) و3-ي (تحذير التعارض عند الحفظ)؛ (4) تدفق المستخدم قُسّم إلى لوحتين وأُضيف إليه معيّن التعارض وبطاقة التحذير وإعادة التسليم إلى البالغ بعد الرفض؛ (5) DFD قُسّم إلى لوحتين وأُضيف إليه اقتراح المساعد والتفويض وحفظ بوسم «متعارض»؛ (6) النشاط صار TD على ثلاث لوحات وأُضيف إليه التفويض والاقتراح والتعارض وإلغاء التحقق في يومه. ملاحظة: هذا الملف لم يحمل أسطر «تنبيه» مؤرخة، فسُجّل الرسم هنا وفي سطور «أُعيد رسمه» تحت كل مخطط.

## 1. حالات الاستخدام

19 حالة استخدام من السيناريوهات السبعة والمتطلبات (§2/§3): الأب والبالغ المفوَّض ينشئان المهام ويلغيانها، الطفل والمراهق يسلّمان، الذكاء يتحقق والأب احتياطي، والمحفظة (S1-05) ومركز الأوامر (S1-09) ممثلان كجهات خارجية. وإسناد مهمة بدلاً من منح الوقت (6-6) هو نفس حالة إنشاء المهمة، لا حالة مستقلة. والمساعد (REQ-018 · Q-415) بثلاث درجات: لا يُعدّ، يقترح، يسند ضمن حدود يضبطها الأب.

### 1-أ. حالات الاستخدام — إنشاء المهام والفئات والتقويم (REQ-013 — UC10 عرض التقويم المزدوج)

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])

    subgraph S106a [S1-06: المهام — الإنشاء والتقويم]
        direction TB
        UC1(UC1 إنشاء مهمة وإسنادها)
        UC2(UC2 إضافة فئة مهمة)
        UC19(UC19 حذف فئة)
        UC3(UC3 إلغاء مهمة)
        UC9(UC9 إنشاء حدث تقويم)
        UC10(UC10 عرض التقويم المزدوج)
        UC11(UC11 استلام تذكير)
        UC18(UC18 تحذير التعارض عند الحفظ)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC19
    Father --> UC3
    Father --> UC9
    Father --> UC10
    Father --> UC11
    Adult --> UC1
    Adult --> UC3
    Adult --> UC9
    Adult --> UC10
    Adult --> UC11
    UC1 -.->|يتضمن| UC18
    UC9 -.->|يتضمن| UC18
```

- رُسم 2026-11-19 (Q-440): أُضيفت UC19 (حذف فئة — الأب وحده)؛ والحالات 18 ← 19؛ والعقد والأسهم في §1: 42 عقدة/47 سهماً ← 43 عقدة/48 سهماً.

### 1-ب. حالات الاستخدام — الاعتماد والرفض وإلغاء التحقق

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    S105([محفظة النقاط S1-05])

    subgraph S106b [S1-06: المهام — الاعتماد والرفض]
        direction TB
        UC6(UC6 الاعتماد اليدوي للأب)
        UC7(UC7 رفض تسليم مع ملاحظات)
        UC8(UC8 إلغاء تحقق)
        UC14x["UC14 حدث الكسب — 1-د"]
    end

    Father --> UC6
    Father --> UC7
    Father --> UC8
    Adult --> UC6
    UC6 --> UC14x
    UC14x --> S105
    UC8 --> S105
```

### 1-ج. حالات الاستخدام — المساعد بدرجاته الثلاث

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    AI([بوابة الذكاء Q-054])

    subgraph S106c [S1-06: المهام — المساعد]
        direction TB
        UC15(UC15 ضبط تفويض المساعد)
        UC16(UC16 المساعد يقترح أو يسند)
        UC17(UC17 قبول الاقتراح أو صرفه)
        UC1x["UC1 إنشاء مهمة — 1-أ"]
    end

    Father --> UC15
    Father --> UC17
    Adult --> UC17
    AI --> UC16
    UC15 -.->|يضبط| UC16
    UC16 --> UC17
    UC17 --> UC1x
    UC16 --> UC1x
```

### 1-د. حالات الاستخدام — الطفل

```mermaid
flowchart LR
    Child([الطفل])
    AI([بوابة الذكاء Q-054])
    Server([خادم Ktor])
    S105([محفظة النقاط S1-05])
    S109([مركز الأوامر S1-09])
    MinIO([تخزين MinIO Q-058])

    subgraph S106d [S1-06: المهام — الطفل]
        direction TB
        UC4(UC4 تسليم مهمة مع الإثبات)
        UC5(UC5 التحقق بالذكاء من الإنجاز)
        UC13(UC13 تسليم مهمة دون اتصال)
        UC14(UC14 إصدار حدث الكسب)
        UC10x["UC10 عرض التقويم — 1-أ"]
        UC11x["UC11 استلام تذكير — 1-أ"]
    end

    Child --> UC4
    Child --> UC10x
    Child --> UC11x
    Child --> UC13
    UC4 -.->|يتضمن| UC5
    UC4 --> AI
    UC5 --> AI
    UC5 --> UC14
    UC14 --> S105
    UC4 --> S109
    MinIO --> UC5
    UC13 --> Server
```

### 1-هـ. حالات الاستخدام — المراهق

```mermaid
flowchart LR
    Teen([المراهق])

    subgraph S106e [S1-06: المهام — المراهق]
        direction TB
        UC12(UC12 مهمة شخصية — مراهق)
        UC4x["UC4 تسليم مهمة مع الإثبات — 1-د"]
        UC10x["UC10 عرض التقويم — 1-أ"]
        UC11x["UC11 استلام تذكير — 1-أ"]
        UC13x["UC13 تسليم مهمة دون اتصال — 1-د"]
        UC3x["UC3 إلغاء مهمة — 1-أ"]
    end

    Teen --> UC4x
    Teen --> UC10x
    Teen --> UC11x
    Teen --> UC12
    Teen --> UC13x
    Teen -->|self only — Q-253| UC3x
    UC12 -.->|تسليم بلا نقاط Q-109| UC4x
```

- أُعيد رسمه 2026-11-19 (Q-434 — REQ-018 · Q-415 · Q-419): الحالات 14 ← 18 على لوحتين؛ وأُضيفت UC15 (ضبط تفويض المساعد — المالك وحده) وUC16 (المساعد يقترح أو يسند ضمن الحدود) وUC17 (قبول الاقتراح أو صرفه) وUC18 (تحذير التعارض عند الحفظ — يتضمنه إنشاء المهمة وإنشاء الحدث)؛ وقُصّرت التسميات إلى 5 كلمات. والعقد والأسهم قبل التقسيم وبعده: 23 عقدة/35 سهماً ← 35 عقدة/47 سهماً (الزيادة: UC15–UC18 الأربع + عقد مرجعية UC14x وUC10x وUC11x وUC3x + تكرار AI وS105 وS109 وMinIO في اللوحتين).

- أُعيد تقسيمه 2026-11-19 (دفعة الشكل 2): اللوحتان ← خمس لوحات (1-أ إنشاء المهام والفئات والتقويم، 1-ب الاعتماد والرفض وإلغاء التحقق، 1-ج المساعد، 1-د الطفل، 1-هـ المراهق)؛ والعقد والأسهم: 35 عقدة/47 سهماً ← 42 عقدة/47 سهماً (تكرار الأب والبالغ وUC1x وUC4x وUC10x وUC11x وUC13x؛ وحُذف إعلان S109 وMinIO غير المرتبطين من لوحات الأب — بلا أسهم لهما هناك، وهما مرسومان في 1-د). وأُعيد REQ-013 إلى عنوان 1-أ (UC10 عرض التقويم المزدوج).

- ملاحظة: إلغاء التحقق (UC8) للأب وحده (§6 `tasks.revoke`)، وإضافة الفئة (UC2) وحذفها (UC19) للأب وحده (§6 `tasks.category.create`) — البالغ المفوَّض لا يملكها. والمهمة الشخصية للمراهق (UC12) تُسلَّم وتُسجَّل منجزة بلا نقاط ولا يصدر عنها حدث كسب (§7). وإلغاء المهمة (UC3) للأب لأي مهمة، وللمراهق لمهامه التي أنشأها بنفسه فقط (Q-253)؛ وإلغاء مهمة لا يودع نقاطاً، ولا يكسر السلسلة ولا يقدّمها؛ وإلغاء مهمة معتمدة يُصدر `verification-revoked` + حالة CANCELLED (REQ-005 — مرسوم في §6).
- المساعد (REQ-018 · Q-415): ضبط التفويض (UC15) للمالك وحده؛ ودرجاته ثلاث: لا يُعدّ، يقترح (يقرر الأب)، يسند ضمن الحدود (أقصى نقاط 5/10/15، 1–3 مهام لكل طفل في اليوم، والمُسند إليهم يحددهم الأب)؛ وكل اقتراح يظهر سببه وأساسه؛ والمساعد لا يلغي ولا يعدّل، ولا يمنح نقاطاً بلا مهمة، ولا يسند مهمة إثباتها شهادة، ولا يقرأ رسائل أو صوراً؛ وإلغاء التحقق (UC8) في يومه فقط وللمالك وحده ويتطلب اتصالاً (Q-415). وتحذير التعارض (UC18 · Q-419) عند حفظ المهمة أو الحدث: بطاقة واحدة بثلاثة مخارج (عدّل / إصلاح جاهز / احفظ كما هو بوسم «متعارض»).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الستة من §5 كما هي، مع أربعة مراجع خارجية: العضوية (`membership` — S1-02)، و`points_ledger` (S1-05)، و`AuditEvent` (النواة المشتركة)، وصور الإثبات في MinIO (Q-058). و`family` جذر تجميع مالك للجداول الستة وليس مرجعاً خارجياً، فلا يدخل في عدّ المراجع الأربعة. ملاحظتان: مرآة Drift والـ Outbox مخزنان محليان على الجهاز (SQLite) وليسا جدولَي خادم (§5)، ونسخ المهام المتكررة محسوبة عند الطلب لا صفوفاً مادية (REQ-010) فلا جدول للنسخ. كل جدول يحمل `family_id` + عزل RLS (D-021).

```mermaid
erDiagram
    family ||--o{ task : "يمتلك"
    family ||--o{ task_category : "يمتلك"
    family ||--o{ calendar_event : "يمتلك"
    family ||--o{ task_suggestion : "يمتلك"
    family ||--|| task_agent_delegation : "يمتلك"
    task_category ||--o{ task : "تصنّف"
    task ||--o{ task_checklist : "يحتوي"
    task ||--o{ AuditEvent : "يسجّل"
    task }o--|| membership : "تُسند إلى"
    task }o--|| membership : "تُنشأ"
    calendar_event }o--|| membership : "يحضر"
    task ||--|| MinIO_proof : "تُثبت بصورة"
    task_suggestion }o--|| membership : "تُسند إلى"
    task_suggestion }o--|| membership : "يقررها"
    task_suggestion }o--|| task_category : "تصنّف"
    task_suggestion |o--o| task : "ينشئ"
    task_agent_delegation }o--|| membership : "يحدّثها"

    task {
        uuid task_id PK
        uuid family_id FK
        uuid assigned_member_id FK
        uuid category_id FK
        uuid created_by FK
        text title_ar
        text description_ar
        text created_by_type
        int reward_points
        text rrule
        text proof_method
        text status
        text proof_ref
        text verified_by
        text approved_by
        text rejection_notes
        int version
        date due_date
        time due_time
        timestamptz submitted_at
        timestamptz verified_at
        timestamptz approved_at
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
        uuid family_id FK "NULL = فئة عامة افتراضية"
        text name_ar
        text color
        text emoji
    }
    calendar_event {
        uuid event_id PK
        uuid family_id FK
        uuid attendee_member_id FK "NULL = كل العائلة"
        uuid created_by FK
        text title_ar
        text description_ar
        text location_text
        boolean is_all_day
        text rrule
        int reminder_minutes
        int version
        timestamptz start_time
        timestamptz end_time
        timestamptz created_at
        timestamptz updated_at
    }
    task_suggestion {
        uuid suggestion_id PK
        uuid family_id FK
        uuid assigned_member_id FK
        uuid category_id FK
        uuid decided_by FK
        text title_ar
        int reward_points
        text proof_method
        text reason_ar
        text basis_ar
        text status
        date due_date
        timestamptz decided_at
    }
    task_agent_delegation {
        uuid family_id PK
        uuid updated_by FK
        text level
        int max_points
        int per_child_per_day
        text member_ids
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

- ملاحظة: `reward_points` افتراضي 10 و≥ 0، و0 دائماً لمهام المراهقين (Q-109 — تُفرض صفراً على الخادم)؛ و`status` أربع قيم فقط: PENDING / SUBMITTED_BY_CHILD / APPROVED / CANCELLED (§5)؛ و`family_id` في `task_category` يكون NULL للفئات الأربع الافتراضية العامة (منزل/مدرسة/صلاة وقرآن/عناية ذاتية — REQ-002) وقيمةً لفئة أضافها الأب لعائلته (§5)؛ و`rrule` في `task` و`calendar_event` قاعدة iCalendar خام تشمل `byDay` و`byMonthDay` و`interval` و`endDate`/`endOccurrence` و`exdate` و`rdate` (REQ-010 · ملحق RE)؛ و`reminder_minutes` في `calendar_event` افتراضي 60 والخيارات 15/30/60 دقيقة أو يوم (REQ-014). و`MinIO_proof` مرجع غير جدولي إلى تخزين كائنات (MinIO) لا جدول في قاعدة البيانات. والإيداع في المحفظة (`points_ledger`) يصل عبر حدث `family/{family_id}/tasks.completed` (REQ-007) لا عبر علاقة قاعدة بيانات — فلا حافة ERD بين `task` و`points_ledger`.
- المساعد (REQ-018 · Q-415 · §5): `task.created_by_type` إحدى member / agent — تمييز المهمة التي أعدّها المساعد؛ و`task_suggestion` اقتراح واحد (سبب `reason_ar` وأساس `basis_ar` ظاهران للأب دائماً)، وحالته إحدى NEW / ACCEPTED / DISMISSED؛ و`task_agent_delegation` صف واحد لكل عائلة (مفتاحه `family_id`) يحمل درجة التفويض `level` إحدى OFF / SUGGEST / ASSIGN وحدوده `max_points` إحدى 5/10/15 و`per_child_per_day` من 1 إلى 3 و`member_ids` قائمة معرّفات الأعضاء المسموح إسناد المهام إليهم؛ وقبول الاقتراح ينشئ صف `task` — لا مفتاح أجنبي مخزَّن بينهما، فالرابط عملية لا علاقة قاعدة بيانات.
- أُعيد رسمه 2026-11-19 (Q-434 — REQ-018 · Q-415): أُضيف جدولا المساعد وحقل `task.created_by_type`؛ وترتيب الحقول موحّد في كل الجداول (أساسي، أجنبية، حقول، تواريخ في الآخر)؛ وتسميات العلاقات فعل قصير بصيغة واحدة. والجداول 4 ← 6 (11 جدولاً مع المراجع).

## 3. التسلسل (Sequence) — من عقود §4

اثنا عشر مخططاً، كل واحد لتدفق واحد — و3-ج على لوحتين (3-ج-1 لا يستطيع التحقق، و3-ج-2 يرفض لعدم المطابقة)، و3-ز على لوحتين (3-ز-1 الشك والإحالة، و3-ز-2 قرار الأب بعد الشك)، و3-ط المساعد بدرجاته الثلاث (REQ-018 · Q-415)، و3-ي تحذير التعارض عند حفظ المهمة أو الحدث (Q-419):

- النقل مزدوج (Q-209): الخادم ينشر `family/{family_id}/tasks.completed` و`family/{family_id}/tasks.verification-revoked` على MQTT (QoS 1) بجانب الحدث الداخلي إلى S1-05 — لا يُحذف التسليم الداخلي.

- **تغطية REQ في التسلسل:** المخططات الاثنا عشر تغطي REQ-001…REQ-018 كلها: REQ-005 له مخططه 3-ح؛ وREQ-004 (قائمة الفحص) مغطى في ERD (§2 — جدول `task_checklist`) وDFD (D2 `task_checklist`) و§4 (نقطتا التسليم: `checklist_completed` في حمولة `submit` و`PATCH .../tasks/{taskId}/checklist/{itemId}`)، لا كحمولة في 3-ب — فـ 3-ب تسلّم `{proof_ref, client_request_id}` فقط؛ وREQ-015 يظهر كحافة `tasks.submitted` إلى S1-09 في 3-ج/3-ز؛ وREQ-018 (المساعد) له مخططه 3-ط.

### 3-أ. إنشاء مهمة وإسنادها (REQ-001/002/003 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant PG as المخزن
    participant Assignee as جهاز المُسند إليه
    Father->>App: إنشاء مهمة (عنوان + مُسند + فئة + نقاط)
    App->>Ktor: إنشاء المهمة
    Ktor->>Ktor: التحقق من الصلاحية + النقاط (0 للمراهق Q-109)
    alt فئة جديدة
        Ktor->>PG: إنشاء فئة مهمة (الأب وحده) — task_category
    end
    Ktor->>PG: إدراج task (status=PENDING)
    Ktor->>Ktor: جدولة تذكير المهمة (قبل 60 دقيقة)
    Note over Ktor,Assignee: المنبّه المحلي احتياط للتسليم فقط؛ والخادم يجدول ولو كان الجهاز مطفأً
    Ktor->>Assignee: نشر إنشاء المهمة
    Ktor-->>App: Task {task_id}
    App-->>Father: المهمة ظهرت للمُسند إليه فوراً
```
- الرسالة 1: إنشاء مهمة (عنوان + مُسند واحد + فئة + نقاط + استحقاق + إثبات).
- الرسالة 2: `POST /api/v1/families/{id}/tasks {tasks.create}`.
- الرسالة 6: جدولة تذكير المهمة (افتراضي قبل 60 دقيقة Q-124 — الخادم مالك الجدولة، مصدر الحقيقة الوحيد Q-280).
- الرسالة 7: نشر `family/{family_id}/tasks.created` (QoS 1 — §4) — المهمة ظهرت للمُسند إليه فوراً.
- ملاحظة: المنبّه المحلي على جهاز المُسند إليه احتياط للتسليم فقط (§6)؛ والخادم يجدول التذكير ولو كان جهاز الطفل مطفأً (Q-280).

### 3-ب. التسليم والتحقق بالذكاء — نجاح (REQ-006/007 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    Child->>App: تسليم المهمة مع الإثبات (صورة/تسجيل/تسليم ذاتي Q-122)
    App->>Ktor: رفع ملف الإثبات
    Ktor-->>App: {proof_ref}
    App->>Ktor: تسليم المهمة
    Ktor->>Ktor: التحقق: المُسند وتسليم نشط واحد
    Ktor->>Ktor: حفظ الإثبات وتحديث الحالة
    Ktor->>AI: تحقق من الإنجاز (عقد Q-167) — agent.task.verify
    Note over Ktor,AI: مهلة الاستدعاء + محاولة واحدة من الميزانية؛ وعند الفشل → احتياطي الأب
    alt دليل مباشر — منح تلقائي
        AI-->>Ktor: مطابق للمطلوب (مباشر)
    else دليل مقدَّم — تحقق ثم منح
        AI-->>Ktor: مطابق للمطلوب (مقدَّم)
    end
    Ktor->>Ktor: status=APPROVED + verified_by=ai
    Ktor->>Ktor: تسجيل الفعل والدليل — AgentActionLog
    Ktor->>S105: نشر اكتمال المهمة
    Ktor->>MQTT: نشر الاكتمال على MQTT
    Note over Ktor,MQTT: فشل النشر لا يفقد الإيداع — MQTT
    S105-->>Ktor: إيداع النقاط في المحفظة
    Ktor-->>App: تم — النقاط دخلت المحفظة
```
- الرسالة 2: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/proof` (ملف الإثبات — رفع عبر Ktor إلى MinIO — §4-1-أ).
- الرسالة 4: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}`.
- الرسالة 5: التحقق — المُسند إليه؟ تسليم نشط واحد؟ (`TSK_ALREADY_SUBMITTED` إن تكرر — والإعادة بنفس `client_request_id` تُعيد التسليم الأصلي).
- الرسالة 6: حفظ الإثبات في MinIO + `proof_ref` في task + `status=SUBMITTED_BY_CHILD`.
- الرسالة 11: `AgentActionLog` — الفعل + المفتاح `agent.task.verify` + الدليل + طبقة الثقة.
- الرسالة 12: `family/{family_id}/tasks.completed {source_system=S1-06}` (Q-118).
- الرسالة 13: `publish family/{family_id}/tasks.completed` (QoS 1 — Q-209).
- ملاحظة: مهلة الاستدعاء + إعادة محاولة واحدة تُحسب من الميزانية؛ وعند الفشل النهائي → احتياطي الأب (Q-121 — §7).
- ملاحظة: فشل نشر MQTT لا يفقد الإيداع: الحدث الداخلي إلى S1-05 هو المرجع (Q-209 — §7).

- لا تُودع نقطة قبل التحقق (Q-110) — التسليم الذاتي وحده لا يودع شيئاً (§6).

### 3-ج-1. الذكاء لا يستطيع التحقق — الاعتماد اليدوي للأب (REQ-008 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Child as الطفل
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S105 as المحفظة
    Child->>App: تسليم المهمة مع الإثبات
    App->>Ktor: تسليم المهمة
    Ktor->>AI: تحقق من الإنجاز
    AI-->>Ktor: لا يستطيع التحقق
    Ktor->>Ktor: تبقى معلّقة (Q-121)
    Note over Ktor: بطاقة "يتطلب انتباهك" هي ما يبلّغ الأب — S1-09
    Father->>App: مراجعة الإثبات والنتيجة المسجلة مع السبب
    Father->>Ktor: اعتماد يدوي
    Ktor->>Ktor: status=APPROVED + verified_by=father
    Ktor->>S105: نشر اكتمال المهمة
    S105-->>Ktor: إيداع النقاط
    Ktor-->>Father: اعتُمدت يدوياً وأُودعت النقاط
```
- الرسالة 2: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}`.
- الرسالة 5: تبقى `SUBMITTED_BY_CHILD` — معلّقة (Q-121).
- الرسالة 7: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {APPROVE, client_request_id}`.
- الرسالة 9: `family/{family_id}/tasks.completed {source_system=S1-06}`.
- ملاحظة: بطاقة "يتطلب انتباهك" في S1-09 (REQ-015) هي ما يبلّغ الأب — والنشر على MQTT موازٍ للحدث الداخلي (Q-209 — انظر 3-ب).

### 3-ج-2. الذكاء يرفض الإنجاز — اعتماد يدوي يتجاوز الرفض (REQ-008 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Child as الطفل
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S105 as المحفظة
    Child->>App: تسليم المهمة مع الإثبات
    App->>Ktor: تسليم المهمة
    Ktor->>AI: تحقق من الإنجاز
    AI-->>Ktor: رفض الإنجاز لعدم المطابقة
    Ktor->>App: إشعار الطفل بسبب الرفض — بلا إيداع
    App-->>Child: أُشعِرت بسبب الرفض
    Note over Ktor: بطاقة "يتطلب انتباهك" — الأب يرى الرفض — S1-09
    Father->>App: مراجعة الرفض
    Father->>Ktor: اعتماد يدوي يتجاوز الرفض
    Ktor->>Ktor: status=APPROVED + verified_by=father
    Ktor->>S105: نشر اكتمال المهمة
    S105-->>Ktor: إيداع النقاط
    Ktor-->>Father: اعتُمدت يدوياً رغم الرفض وأُودعت النقاط
```
- الرسالة 2: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}`.
- الرسالة 8: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {APPROVE, client_request_id}` — اعتماد يدوي يتجاوز الرفض.
- الرسالة 10: `family/{family_id}/tasks.completed {source_system=S1-06}`.
- ملاحظة: بطاقة "يتطلب انتباهك" في S1-09 (REQ-015) — الأب يرى الرفض؛ والنشر على MQTT موازٍ للحدث الداخلي (Q-209 — انظر 3-ب).

- أُعيد رسمه 2026-11-19 (Q-434): قُسّم 3-ج إلى لوحتين (كان 8 مشاركين و24 رسالة): 3-ج-1 لا يستطيع التحقق (6 مشاركين، 11 رسالة)، و3-ج-2 يرفض لعدم المطابقة (6 مشاركين، 12 رسالة). وبطاقة S1-09 والنشر على MQTT صارا ملاحظتين (المحتوى نفسه في §3 أعلاه و3-ب). والرسائل نفسها قبل التقسيم وبعده.

- ملاحظة: الذكاء "لا يستطيع التحقق" (Q-121) يختلف عن "يرفض الإنجاز" (§7): الرفض لعدم المطابقة لا يودع شيئاً ويُشعَر الطفل بالسبب، والأب يرى الرفض وقد يعتمد يدوياً فيتجاوز الرفض ويُودع النقاط.

### 3-د. الرفض مع ملاحظات وإلغاء تحقق (REQ-009 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Father as الأب
    actor Child as الطفل
    participant App as التطبيق
    participant Ktor as الخادم
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    Father->>App: رفض تسليم مع ملاحظات
    App->>Ktor: رفض مع ملاحظات
    Ktor->>Ktor: status=PENDING + rejection_notes
    Note over Ktor: سجل التحقق يُغلق «مرفوض» (مُسجَّل في التدقيق — Q-254)
    Ktor-->>App: عادت المهمة ليعيدها الطفل — PENDING
    Child->>App: إعادة التسليم بإثبات جديد
    Note over Father,S105: إلغاء تحقق بعد الإيداع (الأب وحده — في اليوم نفسه فقط — Q-254)
    Father->>Ktor: إلغاء التحقق
    Ktor->>S105: إصدار قيد تعويضي
    Ktor->>MQTT: نشر إلغاء التحقق
    S105-->>Ktor: خصم من الرصيد الحالي (صفراً ولا سالب أبداً — §7)
```
- الرسالة 2: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {REJECT_WITH_NOTES, client_request_id}`.
- الرسالة 6: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/revoke-verification {client_request_id}`.
- الرسالة 7: `family/{family_id}/tasks.verification-revoked` → قيد تعويضي يخصم النقاط.
- الرسالة 8: `publish family/{family_id}/tasks.verification-revoked` (QoS 1 — Q-209).

### 3-هـ. التكرار RRULE وحدث التقويم والتذكير (REQ-010/011/012/013/014 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Father as الأب
    actor Family as العائلة
    participant App as التطبيق
    participant Ktor as الخادم
    participant K as وحدة Kotlin
    Father->>App: تفعيل التكرار لهذه المهمة (معطّل افتراضياً — Q-282)
    Father->>App: إنشاء مهمة متكررة (الأحد–الخميس) — RRULE
    App->>Ktor: إنشاء المهمة
    Ktor->>Ktor: التحقق من التكرار — RRULE
    Note over Ktor,App: قاعدة التكرار خام — iCalendar
    Ktor->>Ktor: النسخ محسوبة عند الطلب — لا صفوف مادية
    Ktor-->>App: نسخة اليوم ظاهرة؛ نسخة الغد تظهر صباحاً
    Note over Ktor,App: نسخة اليوم الفائتة تنتهي بنهاية اليوم ولا تتراكم
    Father->>App: إنشاء حدث تقويم (موعد طبيب الأسنان)
    App->>Ktor: إنشاء حدث تقويم
    Note over Ktor: التكرار الماضي يبقى في السجل ولا يتكرر (REQ-012)
    Ktor->>Ktor: عرض مزدوج هجري (أم القرى) / ميلادي (Q-124)
    Ktor->>Ktor: جدولة التذكير (الخادم مالكها)
    Note over Ktor,K: المنبّه المحلي احتياط للتسليم فقط ويعمل دون اتصال
    K->>K: منبّه محلي دقيق يعمل دون اتصال (REQ-014)
    K-->>Family: تذكير لصاحب الحدث والأب قبل الموعد بساعة (Q-281)
    Ktor->>Family: تذكير حدث التقويم
    Note over K,Family: التذكير الواحد لا يُعرض مرتين — أول وصول يفوز
```
- الرسالة 3: `POST /api/v1/families/{id}/tasks {rrule}`.
- الرسالة 4: التحقق من RRULE — `TSK_INVALID_RRULE` إن باطلة.
- الرسالة 8: `POST /api/v1/families/{id}/events`.
- الرسالة 10: جدولة التذكير — الخادم مالك الجدولة، مصدر الحقيقة الوحيد (Q-280).
- الرسالة 13: `family/{family_id}/calendar.event.reminder` — لصاحب الحدث + الأب كمراقب (Q-281 — §4).
- ملاحظة: RRULE خام (iCalendar): `byDay` + `byMonthDay` + `interval` + `endDate`/`endOccurrence` + `exdate` + `rdate` — النسخ محسوبة عند الطلب (REQ-010 · ملحق RE).

- رُسم 2026-11-19 (Q-440): أُزيلت علامتا الاقتباس عن اسم المشارك وحدة Kotlin.
- ملاحظة: نسخة اليوم الفائتة تنتهي بنهاية اليوم ولا تتراكم (Q-123 · Q-183 · REQ-011).
- ملاحظة: المنبّه المحلي احتياط للتسليم فقط: التطبيق يسلّحه بـ `scheduleLocalReminder` من بيانات الحدث المزامَنة (مرآة Drift — §5)؛ ويعمل دون اتصال (REQ-014).
- ملاحظة: التذكير الواحد لا يُعرض مرتين: المنبّه المحلي والحدث نسختا تسليم للتذكير نفسه (`reminder_id` واحد) — أول وصول يفوز ويُكتم الثاني (§6/§7).

- تذكير حدث في الماضي يُتجاهل بصمت والحدث نفسه يبقى (§7)؛ وعرض التقويم 3 أشهر مقدماً كحد أقصى (REQ-010)؛ والتكرار معطّل افتراضياً ويُفعَّل صراحةً لكل مهمة (Q-282).

### 3-و. التسليم دون اتصال (REQ-016 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant App as التطبيق
    participant OB as Outbox
    participant Ktor as الخادم
    Child->>App: تسليم مهمة دون اتصال
    App->>OB: حفظ التسليم محلياً — Outbox / Drift
    Note over App,OB: عند عودة الاتصال — إعادة محاولة بتراجع أسي؛ واحتفاظ 7 أيام
    App->>Ktor: تسليم من Outbox
    alt المهمة أُلغيت أثناء الانقطاع
        Ktor-->>App: رفض التسليم + إشعار الطفل (§7)
    else المهمة ما زالت PENDING
        Ktor-->>App: قُبل التسليم — يمضي لمسار التحقق (3-ب/3-ج)
    end
```
- الرسالة 3: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit` (من Outbox) `{proof_ref, client_request_id}`.
- ملاحظة: عند عودة الاتصال — إعادة محاولة محدودة بتراجع أسي؛ وإزالة التكرار بـ `client_request_id` لكل نسخة؛ واحتفاظ 7 أيام (§7).

### 3-ز-1. شك الذكاء — إحالة للأب بنقرة واحدة (REQ-017 — عقد Q-167 §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Child as الطفل
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    participant S109 as مركز الأوامر
    Child->>App: تسليم المهمة مع الإثبات
    App->>Ktor: تسليم المهمة
    Ktor->>AI: تحقق من الإنجاز (عقد Q-167) — agent.task.verify
    AI-->>Ktor: شك — الدليل غير حاسم — confidence_tier
    Ktor->>Ktor: تبقى معلّقة وتُسجَّل
    Ktor->>S109: إحالة بطاقة انتباه
    Father->>App: مراجعة الإثبات + الشك المسجل مع السبب
```
- الرسالة 2: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/submit {proof_ref, client_request_id}`.
- الرسالة 4: شك — الدليل غير حاسم (`confidence_tier=مشكوك`).
- الرسالة 5: تبقى `SUBMITTED_BY_CHILD` — معلّقة + `AgentActionLog` (الشك + الدليل).
- الرسالة 6: `family/{family_id}/tasks.submitted` → بطاقة "يتطلب انتباهك" — اعتماد بنقرة واحدة (REQ-015).

### 3-ز-2. قرار الأب بعد الشك — اعتماد أو رفض (REQ-017 — عقد Q-167 §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    alt الأب يعتمد بنقرة واحدة
        Father->>Ktor: اعتماد بنقرة واحدة
        Ktor->>Ktor: status=APPROVED + verified_by=father
        Ktor->>S105: نشر اكتمال المهمة
        Ktor->>MQTT: نشر الاكتمال على MQTT
        S105-->>Ktor: إيداع النقاط
    else الأب يرفض
        Father->>Ktor: رفض مع ملاحظات
        Ktor->>Ktor: status=PENDING + rejection_notes
        Ktor-->>App: عادت المهمة ليعيدها الطفل — PENDING
    end
```
- الرسالة 1: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {APPROVE, client_request_id}`.
- الرسالة 3: `family/{family_id}/tasks.completed {source_system=S1-06}`.
- الرسالة 4: `publish family/{family_id}/tasks.completed` (QoS 1 — Q-209).
- الرسالة 6: `POST /api/v1/families/{id}/tasks/{taskId}/occurrences/{occurrenceId}/approve {REJECT_WITH_NOTES, client_request_id}`.

- أُعيد رسمه 2026-11-19 (Q-434): قُسّم 3-ز إلى لوحتين (كان 8 مشاركين و15 رسالة): 3-ز-1 الشك والإحالة (6 مشاركين، 7 رسائل)، و3-ز-2 قرار الأب بعد الشك (5 مشاركين، 8 رسائل). والرسائل نفسها قبل التقسيم وبعده.

### 3-ح. إلغاء مهمة (REQ-005 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Canceller as الأب / المراهق
    participant App as التطبيق
    participant Ktor as الخادم
    participant S105 as المحفظة
    participant MQTT as وسيط MQTT
    Canceller->>App: إلغاء مهمة
    App->>Ktor: إلغاء المهمة
    Ktor->>Ktor: التحقق من الصلاحية — scope=self
    alt المهمة APPROVED بعد الإيداع
        Ktor->>Ktor: status=CANCELLED
        Ktor->>S105: إصدار قيد تعويضي
        Ktor->>MQTT: نشر إلغاء التحقق
        S105-->>Ktor: خصم من الرصيد الحالي (صفراً ولا سالب أبداً — §7)
    else المهمة غير معتمدة
        Ktor->>Ktor: إلغاء بلا نقاط
    end
    Ktor->>Ktor: الإلغاء مُسجَّل في التدقيق (AuditEvent — REQ-005)
    Ktor-->>App: {task_id, status: "CANCELLED"}
```
- الرسالة 1: إلغاء مهمة (الأب لأي مهمة؛ والمراهق لمهامه التي أنشأها بنفسه فقط — Q-253).
- الرسالة 2: `DELETE /api/v1/families/{id}/tasks/{taskId} {tasks.cancel}`.
- الرسالة 3: التحقق: الأب لأي مهمة؛ والمراهق `scope=self` فقط (Q-253).
- الرسالة 5: `family/{family_id}/tasks.verification-revoked` → قيد تعويضي واحد يخصم النقاط (REQ-009).
- الرسالة 6: `publish family/{family_id}/tasks.verification-revoked` (QoS 1 — Q-209).
- الرسالة 8: `status=CANCELLED` — بلا نقاط؛ والسلسلة لا تنكسر ولا تتقدم (Q-253).

### 3-ط. المساعد بدرجاته الثلاث — تفويض واقتراح وإسناد (REQ-018 · Q-415 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Owner as المالك
    actor Adult as البالغ
    actor Child as الطفل
    participant App as التطبيق
    participant Ktor as الخادم
    participant AI as الذكاء
    Owner->>App: ضبط تفويض المساعد (المالك وحده)
    App->>Ktor: حفظ تفويض المساعد
    Ktor->>Ktor: حفظ صف التفويض (صف واحد لكل عائلة)
    alt درجة SUGGEST — يقترح والأب يقرر
        Ktor->>AI: اقتراح مهام ضمن الحدود
        AI-->>Ktor: اقتراح + السبب + الأساس
        Ktor->>App: عرض الاقتراح (السبب والأساس ظاهران)
        App-->>Owner: اقتراح مساعد بانتظار قرارك
        alt الأب يقبل
            Owner->>Ktor: قبول الاقتراح
            Ktor->>Ktor: إنشاء مهمة (من المساعد)
            Ktor-->>Child: مهمة جديدة من المساعد
        else الأب يصرف
            Owner->>Ktor: صرف الاقتراح
            Ktor->>Ktor: status=DISMISSED — بلا مهمة
        end
    else درجة ASSIGN — يسند مباشرة ضمن الحدود
        Ktor->>AI: إسناد مهام ضمن الحدود
        AI-->>Ktor: مهمة مسندة
        Ktor->>Ktor: إنشاء مهمة (من المساعد)
        Ktor-->>Child: مهمة جديدة من المساعد
    else درجة OFF — لا يُعدّ
        Note over Ktor: المساعد لا يُعدّ شيئاً — لا اقتراح ولا إسناد
    end
```
- الرسالة 2: `PUT /api/v1/families/{id}/task-delegation {level, max_points, per_child_per_day, member_ids}`.
- الرسالة 4: اقتراح مهام ضمن الحدود (نقاط ≤ الحد، 1–3 مهام/طفل/يوم، المُسند إليهم فقط).
- الرسالة 8: `POST /api/v1/families/{id}/task-suggestions/{suggestionId}/decision {ACCEPTED}`.
- الرسالة 11: `POST /api/v1/families/{id}/task-suggestions/{suggestionId}/decision {DISMISSED}`.
- الرسالتان 9 و15: إنشاء `task {created_by_type=agent}` — مهمة جديدة من المساعد.

- أُضيف 2026-11-19 (Q-434 — REQ-018 · Q-415): درجات المساعد الثلاث (OFF / SUGGEST / ASSIGN) يضبطها المالك وحده؛ وحدود الإسناد: أقصى نقاط 5/10/15، و1–3 مهام لكل طفل في اليوم، والمُسند إليهم يحددهم الأب؛ وكل اقتراح يظهر سببه وأساسه؛ والمساعد لا يلغي ولا يعدّل، ولا يمنح نقاطاً بلا مهمة، ولا يسند مهمة إثباتها شهادة، ولا يقرأ رسائل أو صوراً. (6 مشاركين، 16 رسالة.)

### 3-ي. تحذير التعارض عند حفظ المهمة أو الحدث (Q-419 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    Father->>App: حفظ مهمة أو حدث (عنوان + وقت + مُسند)
    App->>Ktor: حفظ مهمة أو حدث
    Ktor->>Ktor: فحص التعارض (الحالات السبع Q-419)
    alt تعارض وُجد
        Ktor-->>Father: بطاقة التعارض (السبب + إصلاح جاهز)
        alt الأب يعدّل
            Father->>App: تعديل المهمة أو الحدث (عودة للحفظ)
        else إصلاح جاهز
            Father->>Ktor: تطبيق الإصلاح ثم حفظ
        else احفظ كما هو
            Father->>Ktor: حفظ بوسم «متعارض»
        end
    else لا تعارض
        Ktor->>Ktor: إنشاء مهمة أو حدث تقويم — task / calendar_event
    end
```
- الرسالة 2: `POST /api/v1/families/{id}/tasks {task}` — أو `POST /api/v1/families/{id}/events`.

- أُضيف 2026-11-19 (Q-434 — Q-419): بطاقة تعارض واحدة عند الحفظ بثلاثة مخارج: «عدّل هذا» / زر إصلاح جاهز / «احفظ كما هو» بوسم «متعارض»؛ والحالات السبع المفحوصة: (1) حد تطبيق > الحصة اليومية، (2) «مسموح دائماً» لا يفتح في النوم/المدرسة، (3) وقت إضافي والابن في نوم/مدرسة/وضع سارٍ — انظر S1-05 3-ج، (4) مهمة/حدث داخل نوم/مدرسة — إلا مهام فئة المدرسة وأحداث وقت المدرسة، (5) حدثان لنفس الشخص بفارق < ساعة، (6) تطبيق محظور وموقعه مفتوح في مرشح الويب أو العكس، (7) وضع مخصّص يفتح تطبيقاً محظوراً أو ترتيب يفتح تطبيقات في النوم/المدرسة. (3 مشاركين، 8 رسائل.)

### 3-ك. حذف فئة (REQ-002 · Q-415 — §4)

```mermaid
%%{init: {"sequence": {"wrap": true}}}%%
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant PG as المخزن
    Father->>App: حذف فئة (من قائمة الفئات)
    App->>Ktor: حذف الفئة
    Ktor->>Ktor: فحص مهام الفئة
    alt الفئة بلا مهمة — نجاح
        Ktor->>PG: حذف الفئة
        Ktor-->>Father: الفئة حُذفت
    else الفئة عليها مهمة
        Ktor-->>Father: الفئة عليها مهمة — TSK_CATEGORY_IN_USE
    end
```
- الرسالة 2: `DELETE /api/v1/families/{id}/task-categories/{categoryId}` — مفتاح `tasks.category.create` (Q-415 — REQ-002).
- الرسالة 6: رمز الخطأ `TSK_CATEGORY_IN_USE` — الفئة عليها مهمة فلا تُحذف (REQ-002 · Q-415 · §7).

- رُسم 2026-11-19 (Q-440 — REQ-002 · Q-415): حذف فئة: الحذف ← نجاح، أو TSK_CATEGORY_IN_USE إن كانت عليها مهمة. (4 مشاركين، 6 رسائل.)

## 4. تدفق المستخدم (User Flow) — من السيناريوهات السبعة (§2)

### 4-أ. إنشاء مهمة

```mermaid
flowchart TD
    Start([الأب يفتح المهام والتقويم]) --> Create[إنشاء مهمة]
    Create --> Clash{تعارض في الوقت أو النوع؟}
    Clash -->|لا| TeenQ{المُسند مراهق؟}
    Clash -->|نعم| ClashCard[بطاقة التعارض — ثلاثة مخارج]
    ClashCard --> TeenQ
    TeenQ -->|نعم| Zero[النقاط 0 دائماً]
    TeenQ -->|لا| Points[النقاط افتراضي 10]
    Zero --> Show[تظهر للمُسند فوراً]
    Points --> Show
    Show --> Do[الطفل ينجز — انظر 4-ب]
    Start -.-> Agent[المساعد يقترح أو يسند]
    Agent --> Create
    Show -.-> Recur[تكرار: نسخة جديدة كل يوم]
    Recur --> Do
    Start -.-> CalEv[حدث تقويم + تذكير]
```

### 4-ب. تسليم المهمة والتحقق

```mermaid
flowchart TD
    Do([الطفل ينجز بنود قائمة الفحص]) --> Submit[تسليم مع الإثبات المطلوب]
    Submit --> Who{من يتحقق؟}
    Who -->|الذكاء يستطيع| AIOK{مطابق للمطلوب؟}
    AIOK -->|نعم — مطابق| TeenCheck{مراهق؟}
    AIOK -->|لا — رفض| Notify[لا إيداع + إشعار بالسبب]
    Who -->|الذكاء لا يستطيع| Pending[تبقى معلّقة — بطاقة S1-09]
    Who -->|الذكاء يشك| Doubt[شك — يُحال للأب]
    Doubt --> FatherRev
    Pending --> FatherRev{الأب يراجع}
    FatherRev -->|يعتمد| TeenCheck
    FatherRev -->|يرفض مع ملاحظات| Back[يعيدها الطفل — PENDING]
    Back --> Redo[إعادة التسليم تذهب إلى البالغ]
    Redo --> Submit
    Notify --> FatherRev
    TeenCheck -->|نعم — مراهق| NoEvent[تُسجَّل منجزة بلا نقاط]
    TeenCheck -->|لا — طفل| Deposit[إيداع النقاط إلى S1-05]
    Deposit --> Streak[السلسلة تُحدَّث في S1-05]
    Streak --> Spend[يصرفها الطفل كوقت إضافي]
    NoEvent --> End([منجزة])
    Spend --> End
    Revoke([إلغاء تحقق في يومه]) --> Back
```

- أُعيد رسمه 2026-11-19 (Q-434 — REQ-018 · Q-415 · Q-419): قُسّم التدفق الواحد (23 عقدة/29 سهماً) إلى لوحتين TD: 4-أ إنشاء مهمة (12 عقدة/15 سهماً، وأُضيف معيّن التعارض وبطاقته ومدخل المساعد)، و4-ب تسليم المهمة والتحقق (17 عقدة/21 سهماً، وأُضيفت إعادة التسليم إلى البالغ بعد الرفض — Q-415 — ومدخل إلغاء التحقق في يومه). والمسارات نفسها قبل التقسيم وبعده.

- ملاحظة: مسار "مهمة بدلاً من منح الوقت" (6-6) هو نفس دورة الحياة أعلاه: الأب يرفض المنح ويسند مهمة (10 نقاط) فينجزها الطفل فيصرف نقاطها كوقت للعبة عبر S1-05. والمهمة الشخصية للمراهق (6-7) تمر بنفس التدفق لكنها تنتهي عند "منجزة بلا نقاط". والمساران الجانبيان: 6-4 (التكرار — نسخة جديدة كل يوم، REQ-010) فرع من عرض المهمة إلى الإنجاز، و6-5 (حدث التقويم والتذكير — REQ-012/Q-281) مدخل جانبي من البداية؛ فالتدفق يغطي السيناريوهات السبعة. وخيارات النقاط 5/10/15/25 والافتراضي 10 (REQ-003)؛ والتذكير قبل ساعة (Q-281)؛ وإعادة التسليم بعد الرفض تذهب إلى البالغ لا إلى الذكاء (Q-415)؛ وإلغاء التحقق في يومه فقط وللمالك وحده ويتطلب اتصالاً (Q-415)؛ وبطاقة التعارض عند الحفظ بثلاثة مخارج (Q-419 — انظر 3-ي).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D4 وD7–D8 جداول خادم (PostgreSQL). المخزنان المحليان (مرآة Drift D5 + Outbox D6) على الجهاز (SQLite) وليسا جدولَي خادم. والمخازن الخارجية: `points_ledger` (S1-05) و`AuditEvent` (النواة) وMinIO (Q-058). والمخطط على ست لوحات LR: 5-أ إنشاء المهام والفئات والتفويض (مع subgraph يجمّع كل طرف بترتيب واحد)، و5-ب التسليم والإثبات، و5-ج التحقق بالذكاء، و5-د مراجعة الأب والقرار، و5-هـ التكرار والتقويم والتذكير، و5-و المزامنة دون اتصال؛ والعقد المشتركة (P1، D1، الأب، الطفل، AI) تتكرر بالاسم. والحمولات الكاملة في §3 و§4.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 مذكورة هنا على الأقل: `GET /api/v1/families/{id}/tasks` و`GET /api/v1/families/{id}/tasks/{taskId}` و`PATCH /api/v1/families/{id}/tasks/{taskId}` (قراءة/تعديل مهمة — تمر عبر P1) · `DELETE /api/v1/families/{id}/tasks/{taskId}` (إلغاء مهمة — REQ-005، تمر عبر P1) · `GET /api/v1/families/{id}/task-categories` و`POST /api/v1/families/{id}/task-categories` و`DELETE /api/v1/families/{id}/task-categories/{categoryId}` (الفئات — REQ-002 · Q-415، تمر عبر P1) · `GET /api/v1/families/{id}/events` و`PATCH /api/v1/families/{id}/events/{eventId}` و`DELETE /api/v1/families/{id}/events/{eventId}` (أحداث التقويم — تمر عبر P5)؛ و`POST .../occurrences/{occurrenceId}/proof` و`PATCH .../tasks/{taskId}/checklist/{itemId}` (رفع إثبات + تبديل بند — تمر عبر P2)؛ والنقاط الخمس (إنشاء مهمة، submit، approve، revoke-verification، إنشاء حدث) مفصلة في §3 ومذكورة هنا بالإحالة لا مرسومة في مخطط DFD نفسه.

### 5-أ. إنشاء المهام والفئات والتفويض

```mermaid
flowchart LR
    subgraph ExtA [خارجي]
        direction TB
        Father([الأب / البالغ المفوَّض])
        Child([الطفل / المراهق])
        AI([بوابة الذكاء Q-054])
    end
    subgraph ProcA [عمليات]
        direction TB
        P1(1.0 إنشاء المهام والفئات وإلغاؤها)
    end
    subgraph StoresA [مخازن]
        direction TB
        D1[(D1 task)]
        D2[(D2 task_checklist — REQ-004)]
        D3[(D3 task_category)]
        D7[(D7 task_suggestion)]
        D8[(D8 task_agent_delegation)]
    end

    Father -->|إنشاء / إلغاء مهمة| P1
    Father -->|ضبط التفويض| P1
    Father -->|قبول الاقتراح أو صرفه| P1
    AI -->|اقتراح + السبب والأساس| P1
    P1 -->|حفظ المهمة| D1
    P1 -->|فئة جديدة| D3
    P1 -->|بنود قائمة الفحص| D2
    P1 -->|"tasks.created"| Child
    P1 -->|اقتراح جديد| D7
    P1 -->|حفظ التفويض| D8
```

### 5-ب. التسليم والإثبات

```mermaid
flowchart LR
    D1[(D1 task)]
    Child([الطفل / المراهق])
    MinIO([MinIO — صور الإثبات])
    S109([مركز الأوامر S1-09])
    P2(2.0 التسليم والإثبات)
    P3x["P3 التحقق بالذكاء — 5-ج"]

    D1 -->|المهمة + حالتها| P2
    Child -->|تسليم + إثبات| P2
    P2 -->|صورة الإثبات| MinIO
    P2 -->|proof_ref + SUBMITTED_BY_CHILD| D1
    P2 -->|"tasks.submitted"| S109
    P2 -->|الإثبات للتحقق| P3x
```

- يقرأ: الطفل يسلّم مع الإثبات؛ والإثبات يُحفظ ويُحال للتحقق.

### 5-ج. التحقق بالذكاء

```mermaid
flowchart LR
    AI([بوابة الذكاء Q-054])
    S105([محفظة النقاط S1-05])
    D1[(D1 task)]
    AgentActionLog([سجل أفعال الوكيل])
    P3(3.0 التحقق بالذكاء)
    P2x["P2 التسليم والإثبات — 5-ب"]
    P4x["P4 مراجعة الأب والقرار — 5-د"]

    P2x -->|الإثبات للتحقق| P3
    AI -->|نتيجة التحقق + الدليل| P3
    P3 -->|نجاح: tasks.completed| S105
    P3 -->|نجاح التحقق: APPROVED| D1
    P3 -->|لا يستطيع التحقق| P4x
    P3 -->|شك — إحالة للأب بنقرة| P4x
    P3 -->|سجل الفعل + الدليل| AgentActionLog
    P3 -->|"رفض التحقق (غير مطابق)"| P4x
```

- يقرأ: الذكاء يتحقق؛ والنجاح يودع النقاط، والتعذر أو الشك أو الرفض يُحال للأب.

### 5-د. مراجعة الأب والقرار

```mermaid
flowchart LR
    Father([الأب / البالغ المفوَّض])
    D1[(D1 task)]
    S105([محفظة النقاط S1-05])
    Audit([AuditEvent])
    P4(4.0 مراجعة الأب والقرار)
    P3x["P3 التحقق بالذكاء — 5-ج"]

    P3x -->|لا يستطيع التحقق| P4
    P3x -->|شك — إحالة للأب بنقرة| P4
    P3x -->|"رفض التحقق (غير مطابق)"| P4
    Father -->|اعتماد / رفض / إلغاء| P4
    P4 -->|اعتماد: APPROVED| D1
    P4 -->|اعتماد: tasks.completed| S105
    P4 -->|رفض: PENDING| D1
    P4 -->|"verification-revoked"| S105
    P4 -->|تسجيل كل حدث| Audit
```

- يقرأ: الأب يعتمد أو يرفض أو يلغي؛ وكل قرار يُسجَّل.

### 5-هـ. التكرار والتقويم والتذكير

```mermaid
flowchart LR
    Father([الأب / البالغ المفوَّض])
    Child([الطفل / المراهق])
    Kotlin([منبّهات — وحدة Kotlin])
    D1[(D1 task)]
    D4[(D4 calendar_event)]
    P5(5.0 التكرار والتقويم والتذكير)

    P5 -->|حساب النسخ عند الطلب| D1
    Father -->|إنشاء حدث تقويم| P5
    P5 -->|حفظ الحدث| D4
    P5 -->|تسليح منبّه محلي احتياطي| Kotlin
    Kotlin -->|تذكير قبل الموعد| Child
    Kotlin -->|تذكير حدث| Father
    P5 -->|تذكير حدث التقويم| Child
    P5 -->|تذكير حدث التقويم| Father
```

- يقرأ: التقويم والتذكير؛ والنسخ محسوبة عند الطلب.

### 5-و. المزامنة دون اتصال

```mermaid
flowchart LR
    Child([الطفل / المراهق])
    D5[(D5 مرآة محلية — Drift)]
    D6[(D6 Outbox — محلي)]
    Ktor([خادم Ktor])
    P6(6.0 المزامنة دون اتصال)
    P2x["P2 التسليم والإثبات — 5-ب"]

    Child -->|تسليم دون اتصال| P6
    P6 -->|حفظ في Outbox| D6
    P6 -->|قراءة المهام المحفوظة| D5
    D6 -->|عند عودة الاتصال| Ktor
    Ktor -->|قبول / رفض التسليم| P6
    P6 -->|التسليم المقبول| P2x
```

- يقرأ: التسليم دون اتصال يُحفظ في Outbox ويُزامَن عند عودة الاتصال.

- أُعيد رسمه 2026-11-19 (Q-434 — REQ-018 · Q-415 · Q-419): قُسّم المخطط الواحد (22 عقدة/39 سهماً) إلى لوحتين LR مع subgraph يجمّع كل طرف بترتيب واحد: 5-أ إنشاء المهام والفئات والتفويض (9 عقد/10 أسهم)، و5-ب التسليم والتحقق والمراجعة والتقويم ودون اتصال (19 عقدة/33 سهماً)؛ وأُضيفت خمسة أسهم: ضبط التفويض (المالك وحده) وقبول الاقتراح أو صرفه واقتراح المساعد وحفظ الاقتراح في D7 وحفظ التفويض في D8؛ وحافة P1→P5 (RRULE) صارت قراءة P5 للنسخ من D1 — النسخ محسوبة عند الطلب لا صفوفاً (§5)؛ وفحص التعارض عند الحفظ في P1 (مهمة) وP5 (حدث) بوسم «متعارض» (Q-419 — انظر 3-ي)؛ وقُصّرت التسميات (الحمولات الكاملة في §3 و§4). والتدفقات نفسها قبل التقسيم وبعده.

- أُعيد تقسيمه 2026-11-19 (دفعة الشكل 2): 5-ب (19 عقدة/33 سهماً) ← خمس لوحات: 5-ب 6 عقد/6 أسهم، 5-ج 7/8، 5-د 6/10، 5-هـ 6/8، 5-و 6/6 — المجموع 30 عقدة/38 سهماً (التكرار: D1 ×3 والطفل ×3 وS105 ×2 والأب ×2 + مراجع P2x وP3x وP4x؛ والأسهم الخمسة الزائدة حدود مشتركة مرسومة في لوحتين). ولوحة 5-أ بقيت كما هي (9 عقد/10 أسهم).

## 6. مخطط النشاط (Activity) — دورة حياة المهمة والتقويم

المسارات الخمسة (الأب / الطفل / الذكاء / الخادم / المحفظة ومركز الأوامر) كمسارات متوازية. ومسار التقويم والتذكير يعمل **بالتوازي** مع دورة حياة المهمة.

أربع لوحات TD: 6-أ إنشاء المهمة (بالغ ومساعد)، و6-ب التسليم والتحقق، و6-ج مراجعة الأب — الاعتماد والرفض، و6-د إلغاء التحقق وإلغاء المهمة؛ والعقد المشتركة (C1، C3، C4، F2، V3، W2) تتكرر بالاسم في اللوحات. ومسار التقويم والتذكير يعمل **بالتوازي** مع دورة حياة المهمة.

### 6-أ. إنشاء المهمة — بالغ ومساعد

```mermaid
flowchart TD
    F9[ضبط تفويض المساعد] --> A5[المساعد يقترح مهمة]
    A5 --> F10[قبول الاقتراح أو صرفه]
    F10 -->|يقبل| F1[إنشاء مهمة وإسنادها]
    F10 -->|يصرف| F10d([الاقتراح مصروف])
    F1 --> F9a{تعارض في الوقت أو النوع؟}
    F9a -->|لا — بلا تعارض| V1[حفظ المهمة PENDING]
    F9a -->|نعم — تعارض| F11[بطاقة التعارض — ثلاثة مخارج]
    F11 -->|احفظ كما هو / إصلاح| V1
    F11 -->|عدّل| F1
    V1 --> C1[استلام المهمة + التذكير]
    F1 --> V4[حساب النسخ عند الطلب — RRULE]
    V4 --> V5[إنهاء نسخة اليوم الفائتة]
    F7[إنشاء حدث تقويم] --> V9[جدولة تذكير الحدث]
    V9 --> C1
```

### 6-ب. التسليم والتحقق

```mermaid
flowchart TD
    C1[استلام المهمة + التذكير] --> C2[إنجاز بنود قائمة الفحص]
    C2 --> C3[تسليم مع الإثبات]
    C3 --> V2[حفظ التسليم SUBMITTED_BY_CHILD]
    V2 --> W1[بطاقة «يتطلب انتباهك»]
    V2 --> A1[استلام الإثبات]
    A1 --> A2{يستطيع التحقق؟}
    A2 -->|لا يستطيع| F2[مراجعة تسليم معلّق]
    A2 -->|نعم| A3{مطابق للمطلوب؟}
    A3 -->|مطابق| A4[إثبات النتيجة مع السبب]
    A3 -->|غير مطابق| N1[إشعار الطفل بسبب رفض الذكاء]
    N1 --> F2
    A4 --> V3[تحديث الحالة APPROVED]
    V3 --> W2[إيداع النقاط]
    V2 --> V6[تسجيل AuditEvent]
    V3 --> V6
    W2 --> C5[صرف النقاط كوقت]
```

### 6-ج. مراجعة الأب — الاعتماد والرفض

```mermaid
flowchart TD
    F2[مراجعة تسليم معلّق] --> F3{القرار؟}
    F3 -->|يعتمد| F4[اعتماد يدوي]
    F3 -->|يرفض| F5[رفض مع ملاحظات]
    F4 --> V3[تحديث الحالة APPROVED]
    V3 --> W2[إيداع النقاط]
    V3 --> V6[تسجيل AuditEvent]
    F5 --> C4[إعادة التسليم بعد الرفض]
    C4 --> C3x["C3 إعادة التسليم — 6-ب"]
    C3x --> F2
```

- يقرأ: الأب يراجع التسليم المعلّق فيعتمد أو يرفض؛ والرفض يعيد المهمة للطفل.

### 6-د. إلغاء التحقق وإلغاء المهمة

```mermaid
flowchart TD
    F6[إلغاء تحقق] --> W3[قيد تعويضي]
    F6 --> V7[إعادة الحالة إلى PENDING]
    V7 --> C4x["C4 إعادة التسليم بعد الرفض — 6-ج"]
    F8[إلغاء مهمة] --> V8[حالة الإلغاء بلا نقاط — CANCELLED]
    F8 -->|إن كانت معتمدة| W3
```

- يقرأ: إلغاء التحقق في يومه يعيد الحالة؛ وإلغاء المهمة بلا نقاط.

- أُعيد رسمه 2026-11-19 (Q-434 — REQ-018 · Q-415 · Q-419): صار المخطط TD على ثلاث لوحات بدل LR بخمسة مسارات (30 عقدة/33 سهماً ← 6-أ 13 عقدة/14 سهماً و6-ب 15 عقدة/16 سهماً و6-ج 14 عقدة/14 سهماً)؛ وأُضيفت عقد المساعد (F9 التفويض، A5 الاقتراح، F10 القبول/الصرف) ومعيّن التعارض وبطاقته (F9a/F11)؛ وإعادة التسليم بعد الرفض تذهب إلى البالغ لا إلى الذكاء (Q-415)؛ وإلغاء التحقق في يومه فقط وللمالك وحده ويتطلب اتصالاً (Q-415). ومواضيع الأحداث: W1 ‏`family/{family_id}/tasks.submitted`‏، وW2 ‏`family/{family_id}/tasks.completed`‏، وW3 ‏`family/{family_id}/tasks.verification-revoked`‏.

- أُعيد تقسيمه 2026-11-19 (دفعة الشكل 2): 6-ج (14 عقدة/14 سهماً) ← لوحتين: 6-ج 9 عقد/9 أسهم، 6-د 6/5 — المجموع 15 عقدة/14 سهماً (مرجع C4x).

- ملاحظة: نسخة اليوم الفائتة تنتهي بنهاية اليوم ولا تتراكم أبداً (Q-123 · Q-183)؛ وتظهر نسخة الغد صباحاً (§2 مخطط التكرار). والمراهق يمر بنفس المسارات لكن إيداعه صفر نقاط ولا حدث كسب يصدر (§7). وإنهاء نسخة اليوم الفائتة (REQ-011)؛ وجدولة تذكير الحدث خادمية — الخادم مالك الجدولة (Q-280)؛ وإلغاء مهمة: الأب لأي مهمة والمراهق لمهامه التي أنشأها بنفسه فقط (Q-253)، وإلغاء مهمة معتمدة بلا نقاط والسلسلة لا تنكسر ولا تتقدم.
