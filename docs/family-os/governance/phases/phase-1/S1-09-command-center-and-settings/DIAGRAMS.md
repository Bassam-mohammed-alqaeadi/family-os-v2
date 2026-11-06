# S1-09: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط، حكم المالك 2026-11-05 · §9 في مرحلة التصميم)
- **القرارات الحاكمة:** Q-003 · Q-007 · Q-055 · Q-061 · Q-063 · Q-064 · Q-065 · Q-089 · Q-092 · Q-094 · Q-095 · Q-096 · Q-097 · Q-098 · D-021 · D-038 · G-006 · G-011
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

كل عنصر في المخططات الستة يتتبع إلى متطلبات SPEC (§3) أو عقودها (§4) أو قرار محكوم — لا عناصر مخترعة.

## 1. حالات الاستخدام

16 حالة استخدام من السيناريوهات الستة والمتطلبات (§2/§3): الأب يرى كل شيء، والبالغ المفوَّض يرى فقط ما فُوِّض به (القسم غير المفوَّض به مخفي تماماً لا مغلقاً برمز)، والأنظمة الأخرى ممثلة كجهات خارجية لأن المركز يجمع ولا يملك (REQ-002)، والتسجيل في السجل المركزي يتم وقت النشر لا وقت التشغيل (§4-1).

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Child([الطفل])
    Server([خادم Ktor])
    S103([نظام الأدوار S1-03])
    S104([نظام الفوترة S1-04])
    S107([نظام الموقع S1-07])
    S108([نظام المحادثة S1-08])
    S105([نظام المكافآت S1-05])
    S106([نظام المهام S1-06])
    Kotlin([وحدة Kotlin — اللقطة])

    subgraph S109 [S1-09: مركز الأوامر والإعدادات]
        direction TB
        UC1(فتح لوحة التحكم الموحدة)
        UC2(عرض حالة الأطفال — موقع + قواعد + تنبيهات)
        UC3(الضغط على تنبيه والانتقال إلى النظام صاحبه)
        UC4(فتح مركز الإعدادات — العرض السريع)
        UC5(تطبيق بطاقة سريعة بنقرة واحدة)
        UC6(فتح العرض المتقدم وتعديل شجرة الصلاحيات)
        UC7(تعديل تحكم نظام)
        UC8(عرض اللوحة دون اتصال — آخر حالة + وسم زمني)
        UC9(عرض الخطة والاستخدام — قراءة فقط)
        UC10(الضغط على ترقية والانتقال إلى S1-04)
        UC11(تأكيد قراءة تنبيه)
        UC12(تسجيل نظام جديد في السجل المركزي — وقت النشر)
        UC13(إلغاء تسجيل نظام — إخفاء ودجاته وأسطح تحكمه فوراً)
        UC14(دفع تحديث اللوحة وتنبيه جديد)
        UC15["بطاقة «يتطلب انتباهك» — قرار الأب بنقرة واحدة"]
        UC16[عرض سجل أفعال الوكيل — شفافية الذكاء]
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC9
    Father --> UC10
    Father --> UC11
    Father --> UC15
    Father --> UC16
    Adult --> UC16
    Child --> UC16
    Adult --> UC1
    Adult --> UC2
    Adult --> UC3
    Adult --> UC4
    Adult --> UC8
    Adult --> UC9
    Adult --> UC11
    UC2 -.->|يجمع حالة| S107
    UC2 -.->|يجمع حالة| S108
    UC2 -.->|يجمع حالة| S105
    UC2 -.->|يجمع حالة| S106
    S106 -.->|tasks.submitted| UC15
    S105 -.->|time-request/new| UC15
    UC15 -.->|قرار بنقرة — منح / رفض / إسناد مهمة| S105
    UC15 -.->|قرار بنقرة — اعتماد / رفض| S106
    UC16 -.->|قراءة السجل| Server
    UC3 -.->|ينقل إلى| S103
    UC6 -.->|يُسجَّل التعديل في تدقيق| S103
    UC7 -.->|يفحص مفتاح التحكم| S103
    UC10 -.->|إدارة الفوترة| S104
    UC9 -.->|قراءة فقط| S104
    UC12 -.->|تسجيل وقت النشر من §9| Server
    UC13 -.->|إخفاء فوري| Server
    Server --> UC14
    Kotlin --> UC8
```

- البالغ المفوَّض لا يظهر له UC5 وUC6 وUC7 وUC10 إلا إن ملك مفتاح كل عنصر (REQ-004 · Q-096)؛ والمركز لا يمنح صلاحيات — تعديل أي تحكم يتطلب مفتاح التحكم نفسه عبر S1-03 (§6-2).
- بطاقة "يتطلب انتباهك" (UC15): تستهلك `family/{family_id}/tasks.submitted` (S1-06 REQ-015) و`family/{family_id}/time-request/new` (S1-05 REQ-014)؛ والأب يقرر بنقرة واحدة (منح / رفض / إسناد مهمة لطلب الوقت؛ اعتماد / رفض لمهمة مسلَّمة) — انظر التسلسل 3-و.
- سجل أفعال الوكيل (UC16): يعرض `AgentActionLog` كاملاً للأب؛ والبالغ المفوَّض يرى منه ما يخص ما فُوِّض به (REQ-004)؛ والطفل يرى منه ما يخصه فقط (G-006) — انظر التسلسل 3-ز.

## 2. مخطط قاعدة البيانات (ERD)

الجداول الأربعة الخاصة من §5 كما هي، مع خمسة مراجع خارجية: العائلة والعضوية (S1-02)، ومفتاح الصلاحية والمنح (S1-03)، والخطة (S1-04 — قراءة فقط). ملاحظتان: جدولا السجل (`dashboard_widget` و`control_surface`) مشتركان لكل العائلات بلا `family_id` (نفس المنطق المصحح في S1-03 §5)، و`dashboard_snapshot` لقطة واحدة لكل عائلة (PK = `family_id`). بيانات الأنظمة نفسها لا تُخزَّن هنا أبداً (REQ-002).

```mermaid
erDiagram
    family ||--o{ dashboard_snapshot : "له لقطة واحدة"
    family ||--o{ alert : "له تنبيهات"
    dashboard_widget }o--|| permission_key : "رؤيتها بمفتاح required_key"
    dashboard_widget }o--|| family : "ودجاتها تُعرض لعائلة"
    control_surface }o--|| family : "أسطحها تُعرض لعائلة"
    alert }o--|| permission_grant : "رؤيته تتبع المنح"
    alert }o--|| membership : "العضو المعني target_member_id"
    family }o--|| plan : "خطتها قراءة فقط من S1-04"

    dashboard_widget {
        string widget_id PK
        string system
        string title_ar
        string kind
        int order
        string required_key FK
    }
    control_surface {
        string system PK
        string control_key PK
        string type
        string default_value
        string values
        boolean available_android
        boolean available_ios
    }
    dashboard_snapshot {
        string family_id PK
        string snapshot
        datetime updated_at
    }
    alert {
        string alert_id PK
        string family_id FK
        string kind
        string system
        string target_member_id
        datetime at
        boolean read
        string acknowledged_by
        datetime acknowledged_at
    }
    family {
        string id PK
    }
    permission_key {
        string key PK
    }
    permission_grant {
        string id PK
    }
    membership {
        string id PK
    }
    plan {
        string id PK
    }
```

- `kind` في `dashboard_widget` من القيم الأربع فقط: `map` / `list` / `stat` / `alert` (§5-1)؛ و`kind` في `alert` من القيم الأربع فقط: `sos` / `escalation` / `grant_expiring` / `system` (§5-4)؛ و`type` في `control_surface` من القيم الثلاث فقط: `select` / `switch` / `action` (§5-2).

## 3. التسلسل (Sequence) — من عقود §4

ستة مخططات، كل واحد لتدفق واحد:

### 3-أ. فتح اللوحة الموحدة (REQ-001/016 — §4-1 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant المركز as Hub
    participant الخادم as Ktor
    participant S103 as S103
    participant Kotlin as K
    Father->>Hub: فتح مركز الأوامر
    Hub->>K: getCachedDashboard()
    K-->>Hub: اللقطة المخزنة + وسمها الزمني
    Hub-->>Father: عرض آخر حالة فوراً (قراءات p95 < 300ms — Q-061)
    Hub->>Ktor: GET /families/{id}/dashboard?since
    Ktor->>S103: فحص المنح — تصفية الودجات عبر required_key
    S103-->>Ktor: المفاتيح المملوكة فقط
    Ktor-->>Hub: {children, rules, alerts, updated_at}
    Hub->>K: حفظ اللقطة الجديدة محلياً
    Hub-->>Father: تحديث اللوحة في الخلفية
```

- الودجات المخفية لا تُرسَل للعميل أصلاً (§6-3)؛ واللقطة المخزنة تُعرض فوراً ثم يُحدَّث في الخلفية (REQ-016).

### 3-ب. تعديل تحكم نظام (REQ-004/008 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant المركز as Hub
    participant الخادم as Ktor
    participant S103 as S103
    participant النظام as Owner
    Father->>Hub: تعديل تحكم (control_key, value)
    Hub->>Ktor: PATCH /families/{id}/settings/{system}
    Ktor->>S103: هل يملك مفتاح التحكم نفسه؟
    alt يملك المفتاح
        S103-->>Ktor: مسموح
        Ktor->>Owner: تمرير التعديل إلى النظام صاحب التحكم
        Owner-->>Ktor: التحكم المعدَّل
        Ktor-->>Hub: التحكم المعدَّل
        Hub-->>Father: تم التعديل
    else لا يملك المفتاح
        S103-->>Ktor: مرفوض
        Ktor-->>Hub: 403
        Hub-->>Father: رفض + تسجيل المحاولة في التدقيق (§7-8)
    end
```

- مفتاح `hub.settings.edit` وحده لا يمنح حق التعديل (§6-1)؛ والتعارض المتزامن على نفس التحكم يُمرَّر إلى النظام صاحبه ويُحل بقواعده (مثال S1-03 REQ-019) — المركز لا يبت في التعارض (§7-9).

### 3-ج. تنبيه جديد وتأكيد قراءته (REQ-003 — §4-1 + §4-2)

```mermaid
sequenceDiagram
    autonumber
    participant النظام as Owner
    participant الخادم as Ktor
    participant المركز as Hub
    actor الأب as Father
    النظام->>Ktor: حدث يستحق تنبيهاً (SOS / تصعيد / انتهاء منح)
    Ktor->>Ktor: إنشاء alert {kind, system, at, read: false}
    Ktor->>Hub: MQTT family/{family_id}/alerts/new
    Hub-->>Father: التنبيه يظهر في اللوحة
    Father->>Hub: الضغط على التنبيه
    Hub->>Father: الانتقال إلى النظام صاحبه
    Father->>Hub: تأكيد القراءة
    Hub->>Ktor: POST /families/{id}/alerts/{alertId}/acknowledge
    Ktor-->>Hub: {alert_id, read: true}
```

- تنبيه SOS يصل دون اتصال متأخراً عند عودة الاتصال مع وسمه الزمني الأصلي — لا يُعرض كأنه الآن (§7-10).

### 3-د. دون اتصال — اللقطة المخزنة (REQ-010/011 — §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant المركز as Hub
    participant Kotlin as K
    participant الخادم as Ktor
    Father->>Hub: فتح مركز الأوامر دون اتصال
    Hub->>K: getCachedDashboard()
    alt توجد لقطة مخزنة
        K-->>Hub: snapshot + updated_at
        Hub->>Hub: فحص حداثة كل ودجة (يحددها نظامها — §6-3)
        alt اللقطة ضمن الحد المقبول
            Hub-->>Father: آخر حالة معروفة + "آخر تحديث: قبل 25 دقيقة"
        else تجاوزت الحد المقبول
            Hub-->>Father: HUB_STALE + الوسم الزمني ظاهر دائماً
        end
    else لا لقطة أصلاً
        K-->>Hub: لا بيانات مخزنة
        Hub-->>Father: "لا بيانات بعد — اتصل بالإنترنت مرة واحدة لعرض اللوحة"
    end
    Note over Hub,Ktor: عند عودة الاتصال: refreshDashboard() ثم تحديث اللقطة
```

- "قبل 25 دقيقة" مثال من السيناريو 9-5؛ والبيانات القديمة لا تُعرض كأنها حية أبداً (§6-2)؛ واللقطة التالفة تُتجاهل وتُعاد من الخادم عند الاتصال (§7-12).

### 3-هـ. عرض الخطة والترقية (REQ-012/013 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant المركز as Hub
    participant الخادم as Ktor
    participant S104 as S104
    Father->>Hub: فتح قسم الخطة
    Hub->>Ktor: GET /families/{id}/plan
    Ktor->>S104: قراءة الخطة والاستخدام (قراءة فقط)
    S104-->>Ktor: {plan, usage: {members, devices}}
    Ktor-->>Hub: الخطة الحالية + الاستخدام
    Hub-->>Father: عرض فقط — لا إدارة فوترة هنا
    Father->>Hub: الضغط على "ترقية"
    Hub->>S104: الانتقال إلى نظام الفوترة S1-04
    Note over Hub,Ktor: أي محاولة تعديل للخطة من المركز → HUB_READ_ONLY + رابط الانتقال إلى S1-04 (§7-3)
```

### 3-و. بطاقة "يتطلب انتباهك" — قرار الأب بنقرة واحدة (S1-05 REQ-014 · S1-06 REQ-015 — §4-2)

```mermaid
sequenceDiagram
    autonumber
    participant المهام as S106
    participant المكافآت as S105
    participant الخادم as Ktor
    participant المركز as Hub
    actor الأب as Father
    S106->>Ktor: family/{family_id}/tasks.submitted — مهمة سُلّمت للتحقق
    S105->>Ktor: family/{family_id}/time-request/new — طلب وقت إضافي جديد
    Ktor->>Ktor: إنشاء alert في بطاقة "يتطلب انتباهك" (kind=system)
    Ktor->>Hub: MQTT family/{family_id}/alerts/new
    Hub-->>Father: البطاقة تعرض العنصر — قرار بنقرة واحدة
    alt طلب وقت — الأب يمنح
        Father->>Hub: منح بنقرة واحدة
        Hub->>Ktor: POST /families/{id}/time-requests/{requestId}/decide {APPROVED}
        Ktor-->>Hub: time-request/decided — التطبيق يستمر
    else طلب وقت — الأب يرفض
        Father->>Hub: رفض بنقرة واحدة
        Hub->>Ktor: POST /families/{id}/time-requests/{requestId}/decide {REJECTED}
        Ktor-->>Hub: time-request/decided — مرفوض
    else طلب وقت — الأب يسند مهمة
        Father->>Hub: إسناد مهمة بنقرة واحدة
        Hub->>Ktor: POST /families/{id}/time-requests/{requestId}/decide {TASK_ASSIGNED, assigned_task_id}
        Ktor-->>Hub: المهمة تظهر للطفل مع قيمتها النقطية
    else مهمة مسلَّمة — الأب يعتمد / يرفض
        Father->>Hub: فتح المهمة من البطاقة
        Hub->>Ktor: POST /families/{id}/tasks/{taskId}/approve {APPROVE / REJECT_WITH_NOTES}
        Ktor-->>Hub: القرار يُسلَّم للمهمة (S1-06)
    end
    Hub-->>Father: البطاقة تُحدَّث — العنصر يُزال بعد القرار
```

- المصدران: S1-05 REQ-014 (طلب الوقت الإضافي يظهر في البطاقة؛ والأب يقرر بنقرة واحدة) وS1-06 REQ-015 (`tasks.submitted` → البطاقة)؛ والبطاقة نفسها تُعرض في S1-09 وتُدفع أحداثها عبر `family/{family_id}/alerts/new` (§4-2). والبالغ المفوَّض يرى في البطاقة فقط ما فُوِّض به (Q-096) — الباقي مخفي تماماً.

### 3-ز. عرض سجل أفعال الوكيل — شفافية الذكاء (REQ-018 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    actor البالغ as Adult
    actor الطفل as Child
    participant المركز as Hub
    participant الخادم as Ktor
    participant الأدوار as S103
    Father->>Hub: فتح سجل أفعال الوكيل
    Hub->>Ktor: GET /families/{id}/agent-actions
    Ktor->>S103: فحص hub.dashboard.view + تصفية حسب المنح (deny-override)
    S103-->>Ktor: مسموح / 403
    Ktor-->>Hub: الأفعال — [{action_id, agent_key, gate, approval, result, at, evidence, reverse}]
    Hub-->>Father: السجل كاملاً — كل فعل مع مفتاحه وبوابته ودليله ونتيجته ومسار تراجعه
    Adult->>Hub: فتح السجل
    Hub-->>Adult: ما يخص ما فُوِّض به فقط — الباقي مخفي تماماً
    Child->>Hub: فتح السجل
    Hub-->>Child: ما يخصه فقط (G-006)
    opt الأب يتراجع عن منح ذكاء
        Father->>Hub: تراجع عن المنح من السجل
        Hub->>Ktor: POST .../wallet/grants/{grantId}/reverse (S1-05)
        Ktor-->>Hub: قيد تعويضي — حدث tasks.verification-revoked
    end
```

- المصدر: عقد التحقق Q-167 §3 (`AgentActionLog`) + S1-09 REQ-018 (Q-173)؛ والتراجع نقطة S1-05 (S1-05 REQ-018)؛ والتصفية الخادمية عبر S1-03 (REQ-004 · Q-007).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الستة (§2)

```mermaid
flowchart TD
    Start([فتح مركز الأوامر — قراءات p95 < 300ms]) --> Cached[عرض آخر حالة مخزنة فوراً]
    Cached --> Conn{اتصال؟}
    Conn -->|نعم| Fetch["GET /families/{id}/dashboard — تصفية خادمية عبر required_key"]
    Conn -->|لا| Stamp["عرض اللقطة + وسم «آخر تحديث» الصريح"]
    Fetch --> Dash[لوحة واحدة: مواقع + قواعد + تنبيهات]
    Stamp --> Dash
    Dash --> Attn["بطاقة «يتطلب انتباهك» — مهام مسلَّمة + طلبات وقت"]
    Attn --> Decide[قرار الأب بنقرة واحدة — منح / رفض / إسناد مهمة]
    Decide --> Dash
    Dash --> See{ما الذي يراه المستخدم؟}
    See -->|الأب| All[يرى كل شيء]
    See -->|بالغ مفوَّض| Only[يرى فقط ما فُوِّض به — الباقي مخفي تماماً]
    All --> Act{ماذا يفعل؟}
    Only --> Act
    Act -->|ضغط تنبيه| Nav[الانتقال إلى النظام صاحبه]
    Act -->|عرض سريع| Quick[بطاقات جاهزة بنقرة — دراسة / نوم / حر]
    Quick --> Apply[تُطبَّق القواعد فوراً على أجهزة الأطفال]
    Act -->|عرض متقدم| Adv[شجرة صلاحيات تفصيلية لكل فرد]
    Adv --> Edit[تفعيل / إلغاء مفتاح واحد لعضو واحد]
    Edit --> Audit[يُسجَّل التعديل في سجل التدقيق S1-03]
    Act -->|قسم الخطة| Plan[الخطة + الاستخدام — عرض فقط]
    Plan --> Upg{ترقية؟}
    Upg -->|نعم| S104[الانتقال إلى S1-04]
    Upg -->|لا| Stay[البقاء في المركز]
    Nav --> Stay
    Apply --> Stay
    Audit --> Stay
```

- ملاحظة: البطاقات السريعة تستخدم قوالب Q-089 المحكومة (شريك/وصي محدود/مراقب) (REQ-007)؛ و"دراسة / نوم / حر" أمثلة البطاقات من السيناريو 9-3. وتبديل الملفات غير موجود في أي مسار — مؤجل للمرحلة 2 (Q-063).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D4. المخزنان D1 وD2 سجلان مشتركان بلا `family_id`؛ والمخزنان D3 وD4 يحملان `family_id` + عزل RLS (D-021). التسجيل في السجل يتم وقت النشر من تعريف §9 لكل نظام — لا نقطة تسجيل وقت التشغيل (§4-1).

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4-1 تظهر هنا على الأقل: `GET /families/{id}/alerts` (قائمة التنبيهات — REQ-003، تُقرأ عبر P5) · `GET /families/{id}/settings/registry` (السجل المركزي — REQ-005، تُقرأ عبر P3) · `GET /families/{id}/settings/{system}` (سطح تحكم نظام واحد — REQ-008، تُقرأ عبر P3) · `GET /families/{id}/agent-actions` (سجل أفعال الوكيل — REQ-018، تُقرأ عبر P7)؛ وبقية النقاط مرسومة في §3 (dashboard، settings PATCH، plan، alerts acknowledge).

```mermaid
flowchart LR
    Father([الأب / البالغ المفوَّض])
    S103([نظام الأدوار S1-03])
    S104([نظام الفوترة S1-04])
    Systems([الأنظمة S1-05/06/07/08])
    Kotlin([وحدة Kotlin — اللقطة])

    subgraph Hub [مركز الأوامر S1-09]
        P1(1.0 عرض لوحة التحكم الموحدة)
        P2(2.0 محرك الرؤية — تصفية حسب المنح)
        P3(3.0 إدارة السجل المركزي)
        P4(4.0 تعديل تحكمات الأنظمة)
        P5(5.0 إدارة التنبيهات)
        P6(6.0 اللقطة دون اتصال + التحديث)
        P7(7.0 عرض سجل أفعال الوكيل)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 dashboard_widget)]
        D2[(D2 control_surface)]
        D3[(D3 dashboard_snapshot)]
        D4[(D4 alert)]
    end

    Ktor([خادم Ktor])
    MQTT([MQTT — Q-022])

    Father -->|فتح اللوحة| P1
    P1 -->|قراءة الودجات المسجلة| D1
    D1 -->|الودجات + required_key| P2
    S103 -->|المنح المملوكة| P2
    P2 -->|الودجات المسموحة فقط| P1
    P1 -->|اللوحة المصفاة| Father
    Systems -->|حالة كل نظام| P1
    P1 -->|حفظ اللقطة + وسمها| D3
    D3 -->|آخر حالة معروفة| P6
    Kotlin -->|getCachedDashboard| P6
    P6 -->|اللقطة + الوسم| P1
    P6 -->|refreshDashboard عند عودة الاتصال| Ktor
    Father -->|فتح مركز الإعدادات| P3
    P3 -->|قراءة الأسطح المسجلة| D2
    D2 -->|الأسطح + التوفر Android/iOS| P3
    P3 -->|العرض السريع ثم المتقدم| Father
    Father -->|تعديل تحكم| P4
    P4 -->|فحص مفتاح التحكم| S103
    S103 -->|مسموح / 403| P4
    P4 -->|تمرير التعديل| Systems
    Systems -->|التنبيهات والأحداث| P5
    Systems -->|family/.../tasks.submitted + family/.../time-request/new — بطاقة يتطلب انتباهك| P5
    P5 -->|عناصر بطاقة يتطلب انتباهك| P1
    P5 -->|حفظ التنبيه| D4
    D4 -->|قائمة التنبيهات| P5
    P5 -->|التنبيهات في اللوحة| P1
    MQTT -->|dashboard/updated + alerts/new| P1
    Father -->|تأكيد قراءة تنبيه| P5
    Father -->|عرض الخطة| P1
    S104 -->|الخطة + الاستخدام — قراءة فقط| P1
    Father -->|عرض سجل أفعال الوكيل| P7
    P7 -->|فحص hub.dashboard.view + تصفية حسب المنح| S103
    S103 -->|مسموح / 403| P7
    P7 -->|قراءة السجل| Ktor
    Ktor -->|الأفعال + المفتاح + البوابة + الدليل + النتيجة| P7
    P7 -->|السجل المصفى| P1
```

## 6. مخطط النشاط (Activity) — دورة حياة استخدام المركز

المسارات الأربعة (المستخدم / المركز — Flutter / الخادم — Ktor / الأنظمة + S1-03) كمسارات متوازية. ودفع MQTT والتحديث الخلفي للقطة يعملان **بالتوازي** مع استخدام المركز.

```mermaid
flowchart LR
    subgraph User [المستخدم — الأب / البالغ المفوَّض]
        direction TB
        U1([فتح مركز الأوامر])
        U2[الاطلاع على اللوحة]
        U3[ضغط تنبيه]
        U4[تطبيق بطاقة سريعة]
        U5[تعديل في العرض المتقدم]
        U6[فتح قسم الخطة]
        U7([إغلاق المركز])
    end
    subgraph Hub [المركز — Flutter]
        direction TB
        H1[عرض اللقطة المخزنة فوراً]
        H2{اتصال؟}
        H3["GET /families/{id}/dashboard + تصفية خادمية"]
        H4["عرض اللوحة + وسم «آخر تحديث»"]
        H5[الانتقال إلى النظام صاحب التنبيه]
        H6[تطبيق البطاقة — PATCH]
        H7[عرض شجرة الصلاحيات]
        H8["GET /families/{id}/plan — عرض فقط"]
        H9[الانتقال إلى S1-04 للترقية]
        H10["بطاقة «يتطلب انتباهك» — قرار بنقرة واحدة"]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1["GET /families/{id}/dashboard"]
        V2["PATCH /families/{id}/settings/{system}"]
        V3["POST /families/{id}/alerts/{alertId}/acknowledge"]
        V4["GET /families/{id}/plan"]
        V5[MQTT: dashboard/updated + alerts/new]
        V6["POST /families/{id}/time-requests/{requestId}/decide + POST /families/{id}/tasks/{taskId}/approve"]
    end
    subgraph Systems [الأنظمة + S1-03]
        direction TB
        G1[فحص المنح — deny-override]
        G2[النظام صاحب التحكم يطبّق التعديل]
        G3[تسجيل التعديل في تدقيق S1-03]
        G4[إلغاء تسجيل نظام يخفي ودجاته فوراً]
    end

    U1 --> H1
    H1 --> H2
    H2 -->|نعم| H3
    H2 -->|لا| H4
    H3 --> V1
    V1 --> G1
    G1 --> V1
    V1 --> H4
    H4 --> U2
    V5 --> H4
    U2 --> U3
    U3 --> H5
    U3 --> V3
    U2 --> H10
    H10 --> V6
    V6 --> H4
    U2 --> U4
    U4 --> H6
    H6 --> V2
    V2 --> G1
    G1 --> G2
    G2 --> G3
    U2 --> U5
    U5 --> H7
    H7 --> V2
    U2 --> U6
    U6 --> H8
    H8 --> V4
    H8 --> H9
    G4 --> H4
    U7 --> H1
```

- سحب منح بالغ مفوَّض أثناء عرضه اللوحة يخفي الأقسام في التحديث التالي فوراً (§7-11)؛ ولوحة فارغة (بلا أطفال أو بلا أنظمة مسجلة) تعرض رسالة إرشادية لا خطأ: "أضف طفلاً من الإعدادات لتبدأ" (§7-4)؛ وتنبيهات نظام أُلغي تسجيله تبقى ظاهرة مع اسم النظام كسجل تدقيق (§7-5).
