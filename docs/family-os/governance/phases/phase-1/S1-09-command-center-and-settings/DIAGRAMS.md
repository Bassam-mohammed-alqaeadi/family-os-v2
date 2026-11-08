# S1-09: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-08 — D-2، بعد موجة الإصلاح 0e4a3e2..f7da470)؛ والمواصفة معتمدة بالكامل في التخطيط
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط، حكم المالك 2026-11-05 · §9 في مرحلة التصميم)
- **السياق المحدد (Bounded Context):** بلا سياق خاص — عنصر عابر يعبر كل السياقات (مركز الأوامر، `CONTEXT-MAP.md` §2-أ)
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-007 · Q-055 · Q-061 · Q-063 · Q-064 · Q-065 · Q-089 · Q-092 · Q-094 · Q-095 · Q-096 · Q-097 · Q-098 · D-021 · D-038 · G-006 · G-011
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

كل عنصر في المخططات الستة يتتبع إلى متطلبات SPEC (§3) أو عقودها (§4) أو قرار محكوم — لا عناصر مخترعة.

## 1. حالات الاستخدام

16 حالة استخدام من السيناريوهات الستة والمتطلبات (§2/§3): الأب يرى كل شيء، والبالغ المفوَّض يرى فقط ما فُوِّض به (القسم غير المفوَّض به مخفي تماماً لا مغلقاً برمز)، والأنظمة الأخرى ممثلة كجهات خارجية لأن المركز يجمع ولا يملك (REQ-002)، والتسجيل في السجل المركزي يتم وقت النشر لا وقت التشغيل (§4-1).
- مفاتيح هذا النظام (§6-1 — REQ-004): `hub.dashboard.view` (عرض اللوحة) · `hub.settings.view` (عرض مركز الإعدادات) · `hub.settings.edit` (تعديل تحكم — مع مفتاح التحكم نفسه) · `hub.alerts.view` (عرض التنبيهات) · `hub.alerts.acknowledge` (تأكيد قراءة تنبيه) · `hub.plan.view` (عرض الخطة والاستخدام) — للأب + البالغ المفوَّض (يُصفى حسب منحِه)؛ و`hub.settings.edit` وحده لا يمنح حق التعديل.

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
    S110([نظام الحماية S1-10])
    S101([الغلاف S1-01])
    Kotlin([وحدة Kotlin — اللقطة])

    subgraph S109 [S1-09: مركز الأوامر والإعدادات]
        direction TB
        UC1(فتح لوحة التحكم الموحدة)
        UC2(عرض حالة الأطفال — موقع + قواعد + تنبيهات)
        UC3(الضغط على تنبيه والانتقال إلى النظام صاحبه)
        UC4(فتح مركز الإعدادات — العرض السريع)
        UC5(تطبيق بطاقة سريعة بنقرة واحدة)
        UC6(فتح العرض المتقدم وتعديل شجرة الصلاحيات — REQ-006)
        UC7(تعديل تحكم نظام)
        UC8(عرض اللوحة دون اتصال — آخر حالة + وسم زمني)
        UC9(عرض الخطة والاستخدام — قراءة فقط)
        UC10(الضغط على ترقية والانتقال إلى S1-04)
        UC11(تأكيد قراءة تنبيه)
        UC12(تسجيل نظام جديد في السجل المركزي — وقت النشر)
        UC13(إلغاء تسجيل نظام — إخفاء ودجاته وأسطح تحكمه فوراً)
        UC14(دفع تحديث اللوحة وتنبيه جديد)
        UC15["بطاقة «يتطلب انتباهك» — قرار الأب أو البالغ المفوَّض بنقرة واحدة — REQ-017"]
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
    Adult --> UC15
    UC2 -.->|"قراءة زمن تشغيل — يجمع حالة"| S107
    UC2 -.->|"قراءة زمن تشغيل — يجمع حالة"| S108
    UC2 -.->|"قراءة زمن تشغيل — يجمع حالة"| S105
    UC2 -.->|"قراءة زمن تشغيل — يجمع حالة"| S106
    UC5 -.->|تطبيق وضع مسبق — دراسة/نوم/حر| S110
    S106 -.->|"family/{family_id}/tasks.submitted"| UC15
    S105 -.->|"family/{family_id}/time-request/new"| UC15
    UC15 -.->|قرار بنقرة — منح / رفض / إسناد مهمة| S105
    UC15 -.->|قرار بنقرة — اعتماد / رفض| S106
    UC16 -.->|قراءة السجل| Server
    UC3 -.->|ينقل إلى| S103
    UC6 -.->|يُسجَّل التعديل في تدقيق| S103
    UC6 -.->|"بوابة الوالدين — PIN الأب أو بصمته (Q-174)"| S101
    UC7 -.->|يفحص مفتاح التحكم| S103
    UC10 -.->|إدارة الفوترة| S104
    UC9 -.->|قراءة فقط| S104
    UC12 -.->|تسجيل وقت النشر من §9| Server
    UC13 -.->|إخفاء فوري| Server
    Server --> UC14
    Kotlin --> UC8
```

- البالغ المفوَّض لا يظهر له UC5 وUC6 وUC7 وUC10 وUC15 إلا إن ملك مفتاح كل عنصر (REQ-004 · Q-096)؛ وUC15 للبالغ مشروط بأن يكون عنصر الانتباه مفوَّضاً به (H09-02 — يرى منه فقط ما فُوِّض به، ويقرر العنصر المفوَّض به وحده — H09-03)؛ والمركز لا يمنح صلاحيات — تعديل أي تحكم يتطلب مفتاح التحكم نفسه عبر S1-03 (§6-2).
- بطاقة "يتطلب انتباهك" (UC15 — REQ-017): تستهلك `family/{family_id}/tasks.submitted` (S1-06 REQ-015) و`family/{family_id}/time-request/new` (S1-05 REQ-014)؛ والأب يقرر بنقرة واحدة (منح / رفض / إسناد مهمة لطلب الوقت؛ اعتماد / رفض لمهمة مسلَّمة)؛ والبالغ المفوَّض بصلاحية القرار يقرر العنصر المفوَّض به وحده (Q-268) — انظر التسلسل 3-و.
- سجل أفعال الوكيل (UC16): يعرض `AgentActionLog` كاملاً للأب؛ والبالغ المفوَّض يرى منه ما يخص ما فُوِّض به (REQ-004)؛ والطفل يرى منه ما يخصه فقط (G-006) — انظر التسلسل 3-ز.
- الحواف المنقطة عبر الأنظمة في §1 (قراءات الحالة، أحداث MQTT، القرارات بنقرة) هي حواف زمن تشغيل — قراءات وأحداث وقت التشغيل لا تبعيات بناء (Q-297)؛ فلا يبني S1-09 على S1-05/06/07/08/10 ولا يبنون عليه.
- الغلاف S1-01 يستضيف المركز (SPEC §1: «يعتمد على» + مخطط السياق)؛ والبطاقات السريعة (UC5) أوضاع S1-10 مسبقة (REQ-007) — تُطبَّق عبر التسلسل 3-ب.

## 2. مخطط قاعدة البيانات (ERD)

الجداول الأربعة الخاصة من §5 كما هي، مع خمسة مراجع خارجية: العائلة والعضوية (S1-02)، ومفتاح الصلاحية والمنح (S1-03)، والخطة (S1-04 — قراءة فقط). ملاحظتان: جدولا السجل (`dashboard_widget` و`control_surface`) مشتركان لكل العائلات بلا `family_id` (نفس المنطق المصحح في S1-03 §5)، و`dashboard_snapshot` لقطة واحدة لكل عائلة (PK = `family_id`). بيانات الأنظمة نفسها لا تُخزَّن هنا أبداً (REQ-002).

```mermaid
erDiagram
    family ||--o{ dashboard_snapshot : "له لقطة واحدة"
    family ||--o{ alert : "له تنبيهات"
    dashboard_widget }o--|| permission_key : "رؤيتها بمفتاح required_key"
    alert }o--|| membership : "العضو المعني target_member_id"
    family }o--|| plan : "خطتها قراءة فقط من S1-04"
    control_surface }o--|| permission_key : "يحرسه مفتاح required_key"
    permission_grant }o--|| permission_key : "المنح مفتاح — جدول S1-03"
    permission_grant }o--|| membership : "المنح عضو — جدول S1-03"

    dashboard_widget {
        text widget_id PK
        text system
        text title_ar
        text kind
        int order
        text required_key FK
    }
    control_surface {
        text system PK
        text control_key PK
        text type
        text default_value
        text values
        text required_key FK
        boolean available_android
        boolean available_ios
    }
    dashboard_snapshot {
        uuid family_id PK
        text snapshot
        int version
        timestamptz updated_at
    }
    alert {
        uuid alert_id PK
        uuid family_id FK
        text kind
        text system
        text source_ref
        uuid target_member_id
        timestamptz at
        boolean read
        uuid acknowledged_by
        timestamptz acknowledged_at
    }
    family {
        uuid id PK
    }
    permission_key {
        text key PK
    }
    permission_grant {
        uuid id PK
    }
    membership {
        uuid id PK
    }
    plan {
        uuid id PK
    }
```

- `kind` في `dashboard_widget` من القيم الأربع فقط: `map` / `list` / `stat` / `alert` (§5-1)؛ و`kind` في `alert` من القيم الأربع فقط: `sos` / `escalation` / `grant_expiring` / `system` (§5-4)؛ و`type` في `control_surface` من القيم الثلاث فقط: `select` / `switch` / `action` (§5-2)؛ وأنواع هذا المخطط تتبع اتفاقية Q-177 (Q-267): يرسم `text` لما نوعه الحقيقي `jsonb` في §5 (`default_value`/`values`/`snapshot`)، و§5 مرجع الأنواع الحقيقية؛ وما عداها يطابق §5 حرفياً (`widget_id` نص، و`acknowledged_by` ‏`uuid`)؛ و`source_ref` في `alert` بصيغة `{system}:{kind}:{id}` (§5-4)؛ و`version` في `dashboard_snapshot` يزيده الخادم وحده (§5-3).

## 3. التسلسل (Sequence) — من عقود §4

ثمانية مخططات، كل واحد لتدفق واحد:

### 3-أ. فتح اللوحة الموحدة (REQ-001/016 — §4-1 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Hub as المركز
    participant Ktor as الخادم
    participant S103 as S103
    participant K as Kotlin
    Father->>Hub: فتح مركز الأوامر
    Hub->>K: getCachedDashboard()
    K-->>Hub: اللقطة المخزنة + وسمها الزمني
    Hub-->>Father: عرض آخر حالة فوراً (قراءات p95 < 300ms — Q-061)
    Hub->>Ktor: GET /api/v1/families/{id}/dashboard?since
    Ktor->>S103: فحص hub.dashboard.view — تصفية الودجات عبر required_key
    S103-->>Ktor: المفاتيح المملوكة فقط
    Ktor-->>Hub: {children, rules, alerts, updated_at}
    Hub->>K: حفظ اللقطة الجديدة محلياً
    Hub-->>Father: تحديث اللوحة في الخلفية
```

- الودجات المخفية لا تُرسَل للعميل أصلاً (§6-3)؛ واللقطة المخزنة تُعرض فوراً ثم يُحدَّث في الخلفية (REQ-016)؛ و`?since` طابع RFC 3339 UTC — بلا `since` لقطة كاملة، ومعه دلتا (المصفوفة الفارغة تعني «لا تغيير») — §4-1؛ واللقطة المحلية نسخة مخزنة من صف الخادم (`family_id`, `version`) لا سجل مستقل — والخادم وحده يكتب الصف (§5-3).

### 3-ب. تعديل تحكم نظام (REQ-004/008 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Hub as المركز
    participant Ktor as الخادم
    participant S103 as S103
    participant Owner as النظام
    participant ParentGate as البوابة
    Father->>Hub: تعديل تحكم (control_key, value)
    opt التحكم تبديل منح — بوابة الوالدين (Q-174)
        Hub->>ParentGate: طلب PIN الأب أو بصمته — بلا تحدي خادم
        ParentGate-->>Hub: مفتوح
        Note over Hub,Ktor: تبديل المنح يُنفَّذ عبر S1-03 (POST /api/v1/families/{id}/members/{memberId}/grants) بلا challenge_id/signature — لا عبر PATCH
    end
    Hub->>Ktor: PATCH /api/v1/families/{id}/settings/{system}
    alt النظام غير مسجل في السجل المركزي (§7-1)
        Ktor-->>Hub: 404 HUB_SYSTEM_NOT_REGISTERED + قائمة الأنظمة المسجلة
    else التحكم غير موجود في سطح النظام (§7-2)
        Ktor-->>Hub: 404 HUB_CONTROL_NOT_FOUND
    else القيمة خارج values أو مخالفة النوع (§7-14)
        Ktor-->>Hub: 400 HUB_INVALID_VALUE
    else النظام والتحكم موجودان والقيمة صالحة
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
    end
```

- مفتاح `hub.settings.edit` وحده لا يمنح حق التعديل (§6-1)؛ وحالات رموز HUB: `HUB_SYSTEM_NOT_REGISTERED` و`HUB_CONTROL_NOT_FOUND` خطأا `404`، و`HUB_INVALID_VALUE` خطأ `400` (§4-4)؛ والتعارض المتزامن على نفس التحكم يُمرَّر إلى النظام صاحبه ويُحل بقواعده (مثال S1-03 REQ-019) — المركز لا يبت في التعارض (§7-9).

### 3-ج. تنبيه جديد وتأكيد قراءته (REQ-003 — §4-1 + §4-2)

```mermaid
sequenceDiagram
    autonumber
    participant Owner as النظام
    participant Ktor as الخادم
    participant Hub as المركز
    actor Father as الأب
    Owner->>Ktor: حدث يستحق تنبيهاً (SOS / تصعيد / انتهاء منح)
    Ktor->>Ktor: إنشاء alert {kind, system, source_ref, at, read: false}
    Ktor->>Hub: MQTT family/{family_id}/alerts/new
    Hub-->>Father: التنبيه يظهر في اللوحة
    Father->>Hub: الضغط على التنبيه
    Hub->>Father: الانتقال إلى النظام صاحبه
    Father->>Hub: تأكيد القراءة
    Hub->>Ktor: POST /api/v1/families/{id}/alerts/{alertId}/acknowledge
    Ktor-->>Hub: {alert_id, read: true}
    Note over Hub,Ktor: تأكيد القراءة يفحص hub.alerts.acknowledge عبر S1-03؛ وعرض التنبيهات يفحص hub.alerts.view (§6-1)
```

- تنبيه SOS يصل دون اتصال متأخراً عند عودة الاتصال مع وسمه الزمني الأصلي — لا يُعرض كأنه الآن (§7-10).

### 3-د. دون اتصال — اللقطة المخزنة (REQ-010/011 — §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Hub as المركز
    participant K as Kotlin
    participant Ktor as الخادم
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

- "قبل 25 دقيقة" مثال من السيناريو 9-5؛ والبيانات القديمة لا تُعرض كأنها حية أبداً (§6-2)؛ واللقطة التالفة تُتجاهل وتُعاد من الخادم عند الاتصال (§7-12)؛ واللقطة المحلية نسخة مخزنة من صف الخادم (`family_id`, `version`) — والخادم وحده يكتب الصف ويزيد `version` (§5-3).

### 3-هـ. عرض الخطة والترقية (REQ-012/013 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Hub as المركز
    participant Ktor as الخادم
    participant S104 as S104
    Father->>Hub: فتح قسم الخطة
    Hub->>Ktor: GET /api/v1/families/{id}/plan
    Ktor->>S104: قراءة الخطة والاستخدام (قراءة فقط)
    S104-->>Ktor: {plan, usage: {members, devices}}
    Ktor-->>Hub: الخطة الحالية + الاستخدام
    Note over Hub,Ktor: عرض الخطة يفحص hub.plan.view عبر S1-03 (§6-1)
    Hub-->>Father: عرض فقط — لا إدارة فوترة هنا
    Father->>Hub: الضغط على "ترقية"
    Hub->>S104: الانتقال إلى نظام الفوترة S1-04
    Note over Hub,Ktor: أي محاولة تعديل للخطة من المركز → HUB_READ_ONLY + رابط الانتقال إلى S1-04 (§9-2)
```

### 3-و. بطاقة "يتطلب انتباهك" — قرار الأب — أو البالغ المفوَّض للعنصر المفوَّض به — بنقرة واحدة (REQ-017 · Q-268 · S1-05 REQ-014 · S1-06 REQ-015 — §4-2)

```mermaid
sequenceDiagram
    autonumber
    participant S106 as المهام
    participant S105 as المكافآت
    participant Ktor as الخادم
    participant Hub as المركز
    actor Father as الأب
    S106->>Ktor: family/{family_id}/tasks.submitted — مهمة سُلّمت للتحقق
    S105->>Ktor: family/{family_id}/time-request/new — طلب وقت إضافي جديد
    Ktor->>Ktor: إنشاء alert في بطاقة "يتطلب انتباهك" (kind=system)
    Ktor->>Hub: MQTT family/{family_id}/alerts/new
    Hub-->>Father: البطاقة تعرض العنصر — قرار بنقرة واحدة
    alt طلب وقت — الأب يمنح
        Father->>Hub: منح بنقرة واحدة
        Hub->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide {APPROVED}
        Ktor-->>Hub: family/{family_id}/time-request/decided — التطبيق يستمر
    else طلب وقت — الأب يرفض
        Father->>Hub: رفض بنقرة واحدة
        Hub->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide {REJECTED}
        Ktor-->>Hub: family/{family_id}/time-request/decided — مرفوض
    else طلب وقت — الأب يسند مهمة
        Father->>Hub: إسناد مهمة بنقرة واحدة
        Hub->>Ktor: POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide {TASK_ASSIGNED, assigned_task_id}
        Ktor-->>Hub: المهمة تظهر للطفل مع قيمتها النقطية
    else مهمة مسلَّمة — الأب يعتمد / يرفض
        Father->>Hub: فتح المهمة من البطاقة
        Hub->>Ktor: POST /api/v1/families/{id}/tasks/{taskId}/approve {APPROVE / REJECT_WITH_NOTES}
        Ktor-->>Hub: القرار يُسلَّم للمهمة (S1-06)
    end
    Hub-->>Father: البطاقة تُحدَّث — العنصر يُزال بعد القرار
```

- والبالغ المفوَّض يتبع التدفق نفسه للعنصر المفوَّض به وحده (Q-268)؛ ويُفحص قراره بمفتاح نظام العنصر في S1-05/S1-06.

- المصدران: S1-05 REQ-014 (طلب الوقت الإضافي يظهر في البطاقة؛ والأب يقرر بنقرة واحدة) وS1-06 REQ-015 (`family/{family_id}/tasks.submitted` → البطاقة)؛ والموضوع الوارد الثالث `family/{family_id}/permissions/grant-expiring` (S1-03 §4-2 — Q-227) ينشئ تنبيه `kind=grant_expiring` بالمرجع نفسه (`source_ref`)؛ والبطاقة نفسها تُعرض في S1-09 وتُدفع أحداثها عبر `family/{family_id}/alerts/new` (§4-2). والبالغ المفوَّض يرى في البطاقة فقط ما فُوِّض به (Q-096) — الباقي مخفي تماماً.

### 3-ز. عرض سجل أفعال الوكيل — شفافية الذكاء (REQ-018 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    actor Adult as البالغ
    actor Child as الطفل
    participant Hub as المركز
    participant Ktor as الخادم
    participant S103 as الأدوار
    Father->>Hub: فتح سجل أفعال الوكيل
    Hub->>Ktor: GET /api/v1/families/{id}/agent-actions
    Ktor->>S103: فحص hub.dashboard.view + تصفية حسب المنح (deny-override — Q-007)
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
        Ktor-->>Hub: قيد تعويضي — حدث family/{family_id}/tasks.verification-revoked
    end
```

- المصدر: عقد التحقق Q-167 §3 (`AgentActionLog`) + S1-09 REQ-018 (Q-173)؛ والتراجع نقطة S1-05 (S1-05 REQ-018)؛ والتصفية الخادمية عبر S1-03 (REQ-004 · Q-007). والبوابات الخمس والمفاتيح السبعة مرجعها عقد التحقق §1/§2 — وكل فعل معروض يحمل مفتاحه وبوابته (REQ-018). والترقيم: `limit` افتراضي 50 وأقصى 100، والأحدث أولاً، و`next_cursor` للصفحة التالية (§4-1)؛ و`member_id` لغير المالك على عضو آخر → `403` بلا استبدال صامت (§7-15)؛ وبلا `member_id` يُفرض معرّف المتصل.

### 3-ح. تسجيل نظام جديد وقت النشر — وظهوره وإلغاؤه (REQ-014/015 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Deployer as الناشر
    participant Ktor as الخادم
    participant Hub as المركز
    actor Father as الأب
    Deployer->>Ktor: نشر نظام جديد — تعريف §9 (ودجات + أسطح تحكم)
    Ktor->>Ktor: تسجيل النظام في السجل المركزي وقت النشر — بلا نقطة تسجيل وقت تشغيل
    Father->>Hub: فتح سجل الأنظمة (H09-11)
    Hub->>Ktor: GET /api/v1/families/{id}/settings/registry
    Ktor-->>Hub: الأنظمة المسجلة — منها النظام الجديد
    Hub-->>Father: النظام الجديد وودجاته وأسطح تحكمه
    Hub-->>Father: ودجات النظام الجديد تظهر في اللوحة (H09-01)
    opt إلغاء تسجيل نظام قائم
        Deployer->>Ktor: إلغاء التسجيل وقت النشر
        Ktor->>Ktor: إخفاء ودجات النظام وأسطح تحكمه فوراً (REQ-015)
        Hub-->>Father: ودجات النظام مختفية من اللوحة؛ وتنبيهاته السابقة تبقى ظاهرة مع اسم النظام (§7-5)
    end
    opt طلب سطح تحكم لنظام غير مسجل
        Hub->>Ktor: GET /api/v1/families/{id}/settings/{system}
        Ktor-->>Hub: 404 HUB_SYSTEM_NOT_REGISTERED + قائمة الأنظمة المسجلة (§7-1)
    end
```

- المحفز: النشر (deploy) بتعريف §9 للنظام؛ والفاعل: الناشر — بلا شاشة تسجيل وبلا نقطة تسجيل وقت تشغيل (سطح هجوم غير ضروري — §4-1)؛ وإلغاء التسجيل يخفي الودجات والأسطح فوراً بينما تبقى التنبيهات السابقة سجل تدقيق (§7-5).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الستة (§2)

```mermaid
flowchart TD
    Start([فتح مركز الأوامر — قراءات p95 < 300ms]) --> Cached[عرض آخر حالة مخزنة فوراً]
    Cached --> Conn{اتصال؟}
    Conn -->|نعم| Fetch["GET /api/v1/families/{id}/dashboard — تصفية خادمية عبر required_key"]
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
    Act -->|عرض سريع| Quick[بطاقات أوضاع S1-10 بنقرة — دراسة / نوم / حر]
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

- ملاحظة: البطاقات السريعة إعدادات وضع مسبقة يملكها نظام الحماية S1-10 — "دراسة / نوم / حر" أمثلة البطاقات من السيناريو 9-3 (REQ-007)؛ وتطبيق قالب صلاحيات Q-089 (شريك/وصي محدود/مراقب) إجراء منفصل في المركز، لا بطاقة سريعة. وتبديل الملفات غير موجود في أي مسار — مؤجل للمرحلة 2 (Q-063).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D4. المخزنان D1 وD2 سجلان مشتركان بلا `family_id`؛ والمخزنان D3 وD4 يحملان `family_id` + عزل RLS (D-021). ومخزن خارجي واحد: `AgentActionLog` — ملك عقد التحقق (Q-167 §3)، لا جدول جديد في S1-09 (§5-5) — تقرؤه P7 عبر Ktor. التسجيل في السجل يتم وقت النشر من تعريف §9 لكل نظام — لا نقطة تسجيل وقت التشغيل (§4-1).

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4-1 تظهر هنا على الأقل: `GET /api/v1/families/{id}/alerts` (قائمة التنبيهات — REQ-003، تُقرأ عبر P5) · `GET /api/v1/families/{id}/settings/registry` (السجل المركزي — REQ-005، تُقرأ عبر P3) · `GET /api/v1/families/{id}/settings/{system}` (سطح تحكم نظام واحد — REQ-008، تُقرأ عبر P3) · `GET /api/v1/families/{id}/agent-actions` (سجل أفعال الوكيل — REQ-018، تُقرأ عبر P7)؛ وبقية النقاط مرسومة في §3 (dashboard، settings PATCH، plan، alerts acknowledge).

```mermaid
flowchart LR
    Father([الأب / البالغ المفوَّض])
    S103([نظام الأدوار S1-03])
    S104([نظام الفوترة S1-04])
    Systems([الأنظمة S1-05/06/07/08/10])
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

    ExtLog[(مخزن خارجي: AgentActionLog — عقد التحقق Q-167 §3 — لا جدول جديد هنا)]

    Ktor([خادم Ktor])
    MQTT([MQTT — Q-022])

    Father -->|فتح اللوحة| P1
    P1 -->|قراءة الودجات المسجلة| D1
    D1 -->|الودجات + required_key| P2
    S103 -->|المنح المملوكة| P2
    P2 -->|الودجات المسموحة فقط| P1
    P1 -->|اللوحة المصفاة| Father
    Systems -->|"حالة كل نظام — قراءة زمن تشغيل (Q-297)"| P1
    P1 -->|حفظ اللقطة + وسمها| D3
    D3 -->|آخر حالة معروفة| P6
    Kotlin -->|getCachedDashboard| P6
    P6 -->|اللقطة + الوسم| P1
    P6 -->|refreshDashboard عند عودة الاتصال| Ktor
    Father -->|فتح مركز الإعدادات| P3
    P3 -->|قراءة الأسطح المسجلة| D2
    D2 -->|"الأسطح + التوفر Android/iOS (REQ-009)"| P3
    P3 -->|العرض السريع ثم المتقدم| Father
    Father -->|تعديل تحكم| P4
    P4 -->|فحص مفتاح التحكم| S103
    S103 -->|مسموح / 403| P4
    P4 -->|تمرير التعديل| Systems
    Systems -->|التنبيهات والأحداث| P5
    Systems -->|"family/{family_id}/tasks.submitted + family/{family_id}/time-request/new — بطاقة يتطلب انتباهك (REQ-017)"| P5
    P5 -->|عناصر بطاقة يتطلب انتباهك| P1
    P5 -->|حفظ التنبيه| D4
    D4 -->|قائمة التنبيهات| P5
    P5 -->|التنبيهات في اللوحة| P1
    MQTT -->|"family/{family_id}/dashboard/updated + family/{family_id}/alerts/new"| P1
    Father -->|تأكيد قراءة تنبيه| P5
    Father -->|عرض الخطة| P1
    S104 -->|الخطة + الاستخدام — قراءة فقط| P1
    Father -->|عرض سجل أفعال الوكيل| P7
    P7 -->|فحص hub.dashboard.view + تصفية حسب المنح| S103
    S103 -->|مسموح / 403| P7
    P7 -->|قراءة السجل| Ktor
    Ktor -->|قراءة من مخزن عقد التحقق| ExtLog
    ExtLog -->|الأفعال + المفتاح + البوابة + الدليل + النتيجة| Ktor
    Ktor -->|السجل| P7
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
        U8[تأكيد قراءة التنبيه]
        U9[الضغط على ترقية]
        U10["فتح سجل إجراءات الوكيل (H09-12)"]
    end
    subgraph Hub [المركز — Flutter]
        direction TB
        H1[عرض اللقطة المخزنة فوراً]
        H2{اتصال؟}
        H3["GET /api/v1/families/{id}/dashboard + تصفية خادمية"]
        H4["عرض اللوحة + وسم «آخر تحديث»"]
        H5[الانتقال إلى النظام صاحب التنبيه]
        H6[تطبيق بطاقة S1-10 — PATCH]
        H7[عرض شجرة الصلاحيات]
        H8["GET /api/v1/families/{id}/plan — عرض فقط"]
        H9[الانتقال إلى S1-04 للترقية]
        H10["بطاقة «يتطلب انتباهك» — قرار بنقرة واحدة"]
        H11[يفعّل / يلغي مفتاحاً واحداً لعضو واحد]
        H12[تأكيد قراءة التنبيه — POST acknowledge]
        H13[رفض — HUB_SYSTEM_NOT_REGISTERED أو HUB_CONTROL_NOT_FOUND]
        H14["عرض سجل إجراءات الوكيل — H09-12 (REQ-018)"]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1["GET /api/v1/families/{id}/dashboard"]
        V2["PATCH /api/v1/families/{id}/settings/{system}"]
        V3["POST /api/v1/families/{id}/alerts/{alertId}/acknowledge"]
        V4["GET /api/v1/families/{id}/plan"]
        V5["MQTT: family/{family_id}/dashboard/updated + family/{family_id}/alerts/new"]
        V6["POST /api/v1/families/{id}/children/{childId}/time-requests/{requestId}/decide + POST /api/v1/families/{id}/tasks/{taskId}/approve"]
        V7{النظام مسجل والتحكم موجود؟}
        V8["GET /api/v1/families/{id}/agent-actions (REQ-018)"]
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
    H4 --> U7
    V5 --> H4
    U2 --> U3
    U3 --> H5
    U8 --> H12
    H12 --> V3
    U2 --> H10
    H10 --> V6
    V6 --> H4
    U2 --> U4
    U4 --> H6
    H6 --> V2
    V2 --> V7
    V7 -->|نعم| G1
    V7 -->|لا| H13
    G1 --> G2
    G2 --> G3
    U2 --> U5
    U5 --> H7
    H7 --> H11
    H11 --> V2
    U2 --> U6
    U10 --> H14
    H14 --> V8
    V8 --> G1
    G1 --> V8
    V8 --> H14
    H14 --> U10
    U6 --> H8
    H8 --> V4
    H8 --> U9
    U9 --> H9
    G4 --> H4
```

- سحب منح بالغ مفوَّض أثناء عرضه اللوحة يخفي الأقسام في التحديث التالي فوراً (§7-11)؛ ولوحة فارغة (بلا أطفال أو بلا أنظمة مسجلة) تعرض رسالة إرشادية لا خطأ: "أضف طفلاً من الإعدادات لتبدأ" (§7-4)؛ وتنبيهات نظام أُلغي تسجيله تبقى ظاهرة مع اسم النظام كسجل تدقيق (§7-5).
