# S1-10: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة — بانتظار مراجعة Juno واعتماد المالك؛ والمواصفة معتمدة بالكامل في التخطيط
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **القرارات الحاكمة:** Q-134 (هيكل الملف) · Q-002 · Q-031 · Q-061 · Q-065 · Q-067 · Q-106 · Q-141 · Q-142 · Q-143 · Q-144 · Q-145 · Q-146
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

13 حالة استخدام من السيناريوهات السبعة والمتطلبات (§2/§3): الأب ينشئ القواعد والجداول ويرتب الأنواع ويفعّل الوضع الحر؛ والبالغ المفوَّض يدير القواعد حسب القالب (حذف القاعدة وإعادة الترتيب قابلان للتفويض — Q-146)؛ والوضع الحر للمالك وحده (Q-143)؛ والطفل والمراهق يفتحان التطبيقات ويطلبان وقتاً إضافياً دون اتصال؛ وأي محاولة تعطيل تتضمن تنبيهاً فورياً وإعادة تفعيل. والتسليم إلى S1-05 (دورة النقاط) وS1-09 (البطاقات والتنبيهات) ممثلان كجهات خارجية.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ])
    Teen([المراهق])
    Child([الطفل])
    Kotlin([وحدة Kotlin للفرض — S1-01])
    Server([خادم Ktor])
    S105([نظام المكافآت S1-05])
    S109([مركز الأوامر S1-09])

    subgraph S110 [S1-10: الحماية والفرض]
        direction TB
        UC1(إنشاء/تعديل/حذف قاعدة تطبيق)
        UC2(وضع الجدول الأسبوعي)
        UC3(إعادة ترتيب أنواع القواعد)
        UC4(تفعيل الوضع الحر)
        UC5(عرض حالة الفرض والمتبقي)
        UC6(فتح تطبيق — تقييم الفرض)
        UC7(طلب وقت إضافي من شاشة الحظر)
        UC8(تلقي تحذير قبل 5 دقائق)
        UC9(محاولة تعطيل الحماية)
        UC10(استخدام التطبيقات دون اتصال)
        UC11(تطبيق إعداد مسبق)
        UC12(عرض أحداث العبث)
        UC13(مراجعة تدقيق الحماية)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC11
    Father --> UC12
    Father --> UC13
    Adult --> UC1
    Adult --> UC2
    Adult --> UC3
    Adult --> UC5
    Adult --> UC12
    Teen --> UC6
    Teen --> UC7
    Teen --> UC8
    Teen --> UC10
    Child --> UC6
    Child --> UC7
    Child --> UC8
    Child --> UC10
    Kotlin --> UC6
    Kotlin --> UC9
    Kotlin --> UC10
    Server --> UC1
    UC6 -.->|عند الحظر| UC7
    UC7 --> S105
    UC9 --> UC12
    UC9 --> S109
    UC11 --> S109
    UC5 --> S109
```

- ملاحظة: حذف القاعدة (`protection.rule.delete`) وإعادة ترتيب الأنواع (`protection.priority.edit`) **قابلان للتفويض حسب القالب** (Q-146) — لذلك يظهر البالغ في UC1 وUC3. والوضع الحر (`protection.free_mode.activate`) **للمالك وحده** (Q-143) — لذلك لا يظهر البالغ في UC4. وزر SOS لا يظهر هنا لأنه ملك S1-01/S1-07 ولا يُحظر أبداً بأي قاعدة (Q-067).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الثمانية من §5 كما هي، مع أربعة مراجع خارجية: العائلة (S1-02)، والعضوية (S1-02)، والوقت الممنوح (S1-05)، و`AuditEvent` (النواة المشتركة). ملاحظات: كل الجداول الثمانية جداول عائلة تحمل `family_id` + عزل RLS (D-021) — ولا جداول سجل عالمية في هذا النظام. وحقول jsonb (`windows` و`order` و`remaining_by_app`) تُرسم `string` لأن Mermaid لا يعرف jsonb — كما في مخططات S1-05. وحقل `minutes_by_weekday` هو `int[7]` — الفهرس 0 = الأحد، 1 = الاثنين، 2 = الثلاثاء، 3 = الأربعاء، 4 = الخميس، 5 = الجمعة، 6 = السبت؛ وكل قيمة 0–1440. و`rule_priority.child_id` فارغ = ترتيب العائلة الافتراضي؛ وصف الطفل تجاوز اختياري عنه (REQ-011). و`enforcement_state` مرآة خادمية لحالة الجهاز — وتقييم الجهاز المحلي هو المرجع دون اتصال (REQ-025). ومخازن العميل (مرآة Drift للقواعد والجدول والترتيب والقناع + Outbox) ليست جداول خادم — انظر §5.

```mermaid
erDiagram
    family ||--o{ app_rule : "له قواعد"
    family ||--o{ daily_total_quota : "له حصص إجمالية"
    family ||--o{ weekly_schedule : "له جدول"
    family ||--o{ rule_priority : "له ترتيب"
    family ||--o{ enforcement_state : "له حالة فرض"
    family ||--o{ app_usage_daily : "له استهلاك يومي"
    family ||--o{ free_mode_session : "له جلسات وضع حر"
    family ||--o{ tamper_event : "له أحداث عبث"
    membership ||--o{ app_rule : "قواعد طفل"
    membership ||--|| daily_total_quota : "حصة طفل"
    membership ||--o{ weekly_schedule : "جدول طفل"
    membership ||--o{ rule_priority : "ترتيب طفل أو العائلة"
    membership ||--|| enforcement_state : "حالة طفل"
    membership ||--o{ app_usage_daily : "استهلاك طفل"
    membership ||--o{ free_mode_session : "جلسات طفل"
    membership ||--o{ tamper_event : "عبث على جهاز طفل"
    granted_time }o--|| enforcement_state : "الممنوح يدخل في المتبقي"
    app_rule ||--o{ AuditEvent : "تغييراته تُسجَّل"
    daily_total_quota ||--o{ AuditEvent : "تغييراتها تُسجَّل"
    weekly_schedule ||--o{ AuditEvent : "تغييراته تُسجَّل"
    rule_priority ||--o{ AuditEvent : "تغييراته تُسجَّل"
    free_mode_session ||--o{ AuditEvent : "تفعيله وانتهاؤه يُسجَّلان"
    tamper_event ||--o{ AuditEvent : "كل حدث يُسجَّل"

    app_rule {
        string rule_id PK
        string family_id FK
        string child_id FK
        string app_package
        string action
        int minutes_by_weekday
        string created_by
        datetime created_at
        datetime updated_at
    }
    daily_total_quota {
        string quota_id PK
        string family_id FK
        string child_id FK
        int minutes_by_weekday
        string created_by
        datetime created_at
        datetime updated_at
    }
    weekly_schedule {
        string schedule_id PK
        string family_id FK
        string child_id FK
        string windows
        int version
        datetime updated_at
    }
    rule_priority {
        string priority_id PK
        string family_id FK
        string child_id FK
        string order
        string updated_by
        datetime updated_at
    }
    enforcement_state {
        string child_id PK
        string family_id FK
        datetime last_evaluated_at
        string active_rule_type
        string remaining_by_app
        datetime next_boundary_at
        datetime free_mode_until
        string tamper_status
        datetime updated_at
    }
    app_usage_daily {
        string usage_id PK
        string family_id FK
        string child_id FK
        string app_package
        datetime usage_date
        int seconds_used
        datetime updated_at
    }
    free_mode_session {
        string session_id PK
        string family_id FK
        string child_id FK
        string activated_by
        datetime activated_at
        datetime expires_at
        datetime cancelled_at
        string status
    }
    tamper_event {
        string event_id PK
        string family_id FK
        string child_id FK
        string device_id
        string kind
        datetime detected_at
        boolean reactivation_attempted
        datetime resolved_at
        boolean notified
    }
    family {
        string id PK
    }
    membership {
        string id PK
    }
    granted_time {
        string id PK
    }
    AuditEvent {
        string id PK
    }
```

## 3. التسلسل (Sequence) — من عقود §4

سبعة مخططات، كل واحد لتدفق واحد:

### 3-أ. إنشاء قاعدة تطبيق + دفع عبر MQTT (REQ-001/026 — §4-2 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant لوحة الأهل as Flutter
    participant الخادم as Ktor
    participant وحدة Kotlin as K
    participant التدقيق as Audit
    Father->>Flutter: إنشاء قاعدة لتطبيق عمر — ALLOW أو BLOCK أو LIMIT + دقائق لكل يوم أسبوع
    Flutter->>Ktor: POST /families/{id}/children/{childId}/app-rules {app_package, action, minutes_by_weekday}
    Ktor->>Ktor: فحص protection.rule.create عبر S1-03 — deny-override (Q-007)
    Ktor-->>Flutter: 201 {rule_id, ...}
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT)
    K->>K: إعادة بناء القناع اليومي
    K-->>Ktor: إقرار (ack) — توصيل الأمر + الإقرار < 5 ثوانٍ (Q-061)
    Ktor->>Audit: AuditEvent (domain=protection — من غيّر وماذا ومتى)
    Ktor-->>Flutter: تأكيد — القاعدة سارية على جهاز الطفل
```

- قاعدة واحدة لكل (طفل، تطبيق) — قيد وحيد (REQ-001)؛ وكل دقيقة في `minutes_by_weekday` بين 0 و1440؛ والتطبيق بلا قاعدة = سماح، لا حظر ضمني.

### 3-ب. حفظ الجدول الأسبوعي مع كشف التعارض (REQ-006 — §4-2)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant لوحة الأهل as Flutter
    participant الخادم as Ktor
    participant وحدة Kotlin as K
    Father->>Flutter: حفظ جدول أسبوعي — نوافذ نوم ومدرسة لكل يوم
    Flutter->>Ktor: PUT /families/{id}/children/{childId}/weekly-schedule {windows, version}
    alt نوافذ متداخلة في اليوم نفسه
        Ktor-->>Flutter: 409 SCHEDULE_CONFLICT + رسالة واضحة
        Flutter-->>Father: صحح التداخل
        Father->>Flutter: تصحيح وإعادة إرسال
        Flutter->>Ktor: PUT .../weekly-schedule {windows, version}
        Ktor->>Ktor: حفظ + رفع version
    else بلا تعارض
        Ktor->>Ktor: حفظ + رفع version
    end
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT)
    K->>K: إعادة بناء القناع اليومي
    K-->>Ktor: إقرار (ack) < 5 ثوانٍ (Q-061)
    Ktor-->>Flutter: الجدول المحفوظ
```

- ملاحظة: تعديل متزامن من والد آخر على نسخة قديمة → `409 VERSION_CONFLICT` — يُعاد تحميل أحدث حالة قبل إعادة المحاولة (نمط S1-03 REQ-019 — قفل تفاؤلي على `version`).

### 3-ج. تقييم الفرض عند فتح تطبيق (REQ-008/010/011/012 — §4-1 evaluateNow + Q-145)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant وحدة Kotlin as K
    participant الغلاف as Shell
    Child->>K: فتح تطبيق — evaluateNow
    K->>K: قراءة موضع القناع اليومي O(1) (REQ-008)
    K->>K: المشي في ترتيب الأب من الأعلى إلى الأسفل — الافتراضي: نوم ثم مدرسة ثم حد تطبيق ثم حصة إجمالية (Q-145)
    alt أول نوع مطابق = نوم
        K->>Shell: شاشة حظر — وقت نوم
    else أول نوع مطابق = مدرسة والتطبيق ليس من تطبيقات الدراسة
        K->>Shell: شاشة حظر — وقت مدرسة، تطبيقات الدراسة فقط
    else أول نوع مطابق = حد تطبيق والمتبقي صفر
        K->>Shell: شاشة حظر + زر اطلب وقتاً إضافياً (إلى 3-د)
    else أول نوع مطابق = حصة إجمالية والمتبقي صفر
        K->>Shell: شاشة حظر — نفاد الحصة اليومية
    else لا نوع مطابق أو بقي رصيد
        K->>Shell: سماح — مع عرض المتبقي
        Note over K,Shell: تحذير قبل 5 دقائق من نفاد الحد (REQ-004) — مرة واحدة في اليوم لكل تطبيق
    end
```

- الترتيب الافتراضي يعمل بلا إعداد؛ والأب يعيد ترتيب الأنواع لكل عائلة ولكل طفل (REQ-011)؛ والوقت المكتسب أو الممنوح يضيف دقائق إلى حد التطبيق فقط — ولا يفتح تطبيقاً في وقت نوم أو مدرسة (REQ-012). وزر SOS لا يُحظر أبداً (Q-067) — خارج هذا التدفق.

### 3-د. نفاد الحد — شاشة الحظر وطلب وقت (REQ-003/004/005 + S1-05)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant وحدة Kotlin as K
    participant المحفظة as S105
    participant مركز الأوامر as S109
    actor الأب as Father
    Child->>K: استخدام اللعبة — بقي 5 دقائق من حدها
    K-->>Child: تحذير بقي 5 دقائق — إشعار + اهتزاز خفيف (REQ-004)
    Child->>K: استمرار الاستخدام حتى النفاد
    K->>K: حظر فوري — بلا مهلة إضافية (REQ-005)
    K-->>Child: شاشة الحظر — اسم التطبيق + المتبقي صفر + زر اطلب وقتاً إضافياً
    Child->>S105: طلب 30 دقيقة إضافية (S1-05 REQ-012)
    S105->>S109: الطلب في بطاقة يتطلب انتباهك
    S109-->>Father: طلب وقت من عمر — قرار بنقرة واحدة
    alt الأب يمنح 30 دقيقة مباشرة
        Father->>S105: منح مباشر (S1-05 REQ-011)
        S105->>K: الوقت الممنوح يضاف إلى حد اللعبة لهذا اليوم فقط
        K->>K: إعادة تقييم — سماح
    else الأب يرفض ويسند مهمة
        Father->>S105: رفض + إسناد مهمة (S1-05 REQ-013)
        Note over S105: يكمل الطفل المهمة — تحقق الذكاء (Q-110) — نقاط — صرفها كوقت إضافي
    end
```

### 3-هـ. الوضع الحر — تفعيل وانتهاء (REQ-018/019/020 — Q-143)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant لوحة الأهل as Flutter
    participant الخادم as Ktor
    participant وحدة Kotlin as K
    Father->>Flutter: ضغط بطاقة وضع حر + اختيار المدة بالدقائق
    Flutter->>Ktor: POST /families/{id}/children/{childId}/free-mode {duration_minutes}
    alt المفعّل ليس المالك
        Ktor-->>Flutter: 403 FREE_MODE_NOT_OWNER (Q-143 — بأمر الأب فقط)
    else وضع حر سارٍ أصلاً
        Ktor-->>Flutter: 409 FREE_MODE_ACTIVE
    else تفعيل صحيح
        Ktor->>Ktor: إنشاء free_mode_session {expires_at}
        Ktor->>K: family/{family_id}/protection/free-mode — تفعيل
        K->>K: activateFreeMode(until) — تعليق كل القواعد
        Ktor-->>Flutter: 201 {session_id, expires_at}
        Flutter-->>Father: لافتة وضع حر — ينتهي خلال X
        Note over Ktor,K: عند انتهاء المدة — انتهاء تلقائي + عودة القواعد + تسجيل في التدقيق (REQ-019)
        Note over Ktor,K: إلغاء مبكر — POST .../free-mode/cancel — {status: cancelled}
    end
```

- أثناء الوضع الحر: زر SOS يعمل كالعادة؛ والاستخدام يُحسب في التقارير ولا يُحدَّد؛ والوضع الحر لا يمسح تنبيهات العبث المعلقة ولا يوقف محاولات إعادة التفعيل (REQ-020).

### 3-و. كشف العبث — تنبيه + إعادة تفعيل (REQ-021/022/023 — Q-144)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant وحدة Kotlin as K
    participant الخادم as Ktor
    participant مركز الأوامر as S109
    actor الأب as Father
    Child->>K: تعطيل خدمة Accessibility من إعدادات النظام
    K->>K: كشف فوري — مستمع حالة الخدمة
    K->>Ktor: family/{family_id}/protection/tamper (MQTT) — حدث عبث
    Ktor->>S109: تنبيه alert نوع system نظام S1-10
    S109-->>Father: تنبيه فوري — محاولة تعطيل الحماية
    K->>K: محاولة إعادة تفعيل تلقائية فوراً
    alt نجحت إعادة التفعيل
        K->>Ktor: تسجيل النجاح في tamper_event
        Ktor->>S109: إشعار الأب بالنجاح
    else فشلت
        K->>K: إعادة المحاولة عند كل نبضة تقييم حتى تنجح أو يتدخل الأب
        Note over K,Father: التنبيه يبقى ظاهراً للأب ولا يُسكَت من جهاز الطفل (REQ-022)
    end
```

- أنواع العبث: `UNINSTALL_ATTEMPT` · `ACCESSIBILITY_DISABLED` · `DEVICE_ADMIN_REVOKED` · `VPN_DISCONNECTED` · `SERVICE_KILLED` (REQ-021). ودون اتصال يُحفظ حدث العبث في Outbox بأولوية قصوى. وإلغاء تثبيت وكيل الطفل يتطلب PIN الأب (REQ-023 — Q-065 · Q-142 — نمط Bark Kids: رمز يصدره الأب).

### 3-ز. مزامنة دون اتصال (REQ-014/015/016/017 — Q-064)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant وحدة Kotlin as K
    participant Outbox as OB
    participant الخادم as Ktor
    actor الأب as Father
    Child->>K: استخدام التطبيقات — لا اتصال يومان
    K->>K: فرض من آخر إعداد مزامَن (REQ-014)
    Note over K: نبضة خصم كل 60 ثانية بالساعة الرتيبة — تغيير الساعة يدوياً لا يؤثر (REQ-015)
    K->>K: إعادة ضبط الحصص منتصف الليل
    K->>OB: تسجيل أحداث الاستخدام محلياً
    Father->>Ktor: تغيير قاعدة أثناء انقطاع عمر
    Ktor->>Ktor: التغيير ينتظر على الخادم — عمر يفرض الإعداد القديم حتى يتصل (REQ-017)
    Note over K,OB: عند عودة الاتصال
    K->>OB: قراءة الأحداث
    K->>Ktor: تفريغ Outbox — idempotent بمفتاح الطفل + التطبيق + التاريخ — لا خصم مكرر (REQ-016)
    Ktor-->>K: rules-updated — القواعد الجديدة
    K->>K: إعادة بناء القناع اليومي وتطبيق القواعد الجديدة
```

## 4. تدفق المستخدم (User Flow) — من السيناريوهات السبعة (§2)

```mermaid
flowchart TD
    FStart([الأب يفتح قواعد طفل من لوحة الأهل]) --> FAct{ماذا يفعل؟}
    FAct -->|قاعدة أو جدول| FEdit[إنشاء أو تعديل قاعدة أو جدول]
    FEdit --> FConf{تعارض؟}
    FConf -->|نعم| FRej[رفض الحفظ + رسالة واضحة — يصحح الأب]
    FRej --> FEdit
    FConf -->|لا| FSave[حفظ + تدقيق + دفع MQTT]
    FAct -->|ترتيب| FOrd[إعادة ترتيب أنواع القواعد — مع معاينة النتيجة بلغة صريحة قبل الحفظ]
    FOrd --> FSave
    FAct -->|وضع حر| FFree[تفعيل وضع حر — المالك وحده + مدة محددة]
    FFree --> FSave
    FSave --> Sync[الجهاز يبني القناع اليومي]
    Sync --> COpen([الطفل يفتح تطبيقاً])
    COpen --> CConn{اتصال؟}
    CConn -->|لا| COff[فرض من آخر إعداد مزامَن + نبضة 60 ثانية بالساعة الرتيبة]
    COff --> CEval
    CConn -->|نعم| CEval[تقييم — أول نوع مطابق في ترتيب الأب يفوز]
    CEval --> CFree{وضع حر سارٍ؟}
    CFree -->|نعم| CAllow[سماح — الاستخدام يُحسب ولا يُحدَّد]
    CFree -->|لا| CMatch{أول نوع مطابق؟}
    CMatch -->|نوم| CBlockN[حظر — وقت نوم]
    CMatch -->|مدرسة والتطبيق ليس دراسة| CBlockS[حظر — وقت مدرسة، تطبيقات الدراسة فقط]
    CMatch -->|حد تطبيق أو حصة والمتبقي صفر| CBlockQ[حظر فوري + شاشة الحظر]
    CMatch -->|بقي رصيد| CWarn{بقي 5 دقائق؟}
    CWarn -->|نعم| CWarn2[تحذير بقي 5 دقائق — مرة في اليوم]
    CWarn2 --> CAllow
    CWarn -->|لا| CAllow
    CBlockN --> CReq[الطفل يطلب وقتاً إضافياً — S1-05]
    CBlockS --> CReq
    CBlockQ --> CReq
    CReq --> FDec{الأب يمنح مباشرة أم يسند مهمة؟}
    FDec -->|يمنح| CGrant[دقائق تضاف إلى حد التطبيق لهذا اليوم فقط]
    CGrant --> CEval
    FDec -->|يسند مهمة| CTask[يكمل المهمة — تحقق الذكاء — نقاط — صرفها كوقت]
    CTask --> CEval
    COpen --> CTamper{محاولة تعطيل الحماية؟}
    CTamper -->|نعم| CTAlert[تنبيه فوري للأب + محاولة إعادة تفعيل تلقائية]
    CTAlert --> COpen
```

- ملاحظة: زر SOS لا يُحظر أبداً — يعمل في كل مسار، في وقت النوم والمدرسة والوضع الحر (Q-067).
- ملاحظة: القواعد تتبع الطفل لا الجهاز — عند بلوغ الطفل 13 سنة تبقى قواعده سارية ويُشعَر الأب ليراجعها؛ وعند استبدال الجهاز تُعاد القواعد نفسها بالإقران الجديد (REQ-027).
- ملاحظة: تغيير الجدول يسري عند الاستلام؛ وإن صار الوقت الحالي محظوراً بالتغيير الجديد يُطبَّق الحظر فوراً حتى لو كان التطبيق مفتوحاً حينها (REQ-009).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D7 جداول خادم (PostgreSQL)، والمخزنان L1–L2 مخازن عميل على جهاز الطفل (Drift/Outbox — محلية، ليست جداول خادم). و`enforcement_state` (D4) مرآة خادمية لحالة الجهاز — وتقييم الجهاز المحلي هو المرجع دون اتصال (REQ-025). والإعدادات المسبقة (REQ-024) تُطبَّق ذرّياً عبر P1+P2 — كل قواعدها أو لا شيء.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: `GET/POST/PATCH/DELETE .../app-rules` (3-أ · P1) · `GET/PUT .../weekly-schedule` (3-ب · P2) · `GET/PUT .../rule-priority` (3-ج · P3) · `POST .../free-mode` و`POST .../free-mode/cancel` (3-هـ · P5) · `GET .../enforcement-state` (P4 · D4) · `POST .../mode-presets/{preset}` (P1+P2 ذرّياً) · `GET .../audit/protection` (التدفقات إلى AuditEvent).

```mermaid
flowchart LR
    Father([الأب / البالغ])
    Child([الطفل / المراهق])
    S101([الغلاف S1-01 — قناة familyos/enforcement])
    S105([نظام المكافآت S1-05 — granted_time])
    S109([مركز الأوامر S1-09 — بطاقات + تنبيهات])

    subgraph S110 [النظام — S1-10]
        P1(1.0 إدارة قواعد التطبيقات)
        P2(2.0 إدارة الجدول الأسبوعي)
        P3(3.0 إدارة ترتيب الأنواع)
        P4(4.0 محرك التقييم — على الجهاز)
        P5(5.0 الوضع الحر)
        P6(6.0 كشف العبث وإعادة التفعيل)
        P7(7.0 مزامنة دون اتصال)
    end

    subgraph ServerStores [مخازن الخادم — PostgreSQL]
        D1[(D1 app_rule)]
        D2[(D2 weekly_schedule)]
        D3[(D3 rule_priority)]
        D4[(D4 enforcement_state)]
        D5[(D5 app_usage_daily)]
        D6[(D6 free_mode_session)]
        D7[(D7 tamper_event)]
    end

    subgraph ClientStores [مخازن العميل — على جهاز الطفل]
        L1[(L1 مرآة Drift — قواعد + جدول + ترتيب + قناع يومي)]
        L2[(L2 Outbox — أحداث استخدام وعبث)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent])

    Father -->|إنشاء أو تعديل أو حذف قاعدة| P1
    P1 -->|حفظ القاعدة| D1
    P1 -->|rules-updated MQTT| Ktor
    Father -->|حفظ جدول| P2
    P2 -->|حفظ الجدول| D2
    P2 -->|rules-updated MQTT| Ktor
    Father -->|إعادة ترتيب| P3
    P3 -->|حفظ الترتيب| D3
    P3 -->|rules-updated MQTT| Ktor
    Father -->|تفعيل أو إلغاء وضع حر| P5
    P5 -->|حفظ الجلسة| D6
    P5 -->|free-mode MQTT| Ktor
    Ktor -->|دفع القواعد والجدول والترتيب| L1
    L1 -->|القواعد + القناع اليومي| P4
    S101 -->|قناة familyos/enforcement| P4
    S105 -->|الممنوح يدخل في الإضافي| P4
    Child -->|فتح تطبيق| P4
    P4 -->|قرار سماح أو حظر| Child
    P4 -->|حالة الفرض| D4
    D4 -->|حالة الفرض| S109
    P4 -->|أحداث استخدام| L2
    L2 -->|تفريغ idempotent| P7
    P7 -->|حفظ الاستهلاك| D5
    P7 -->|القواعد الجديدة| L1
    Child -->|تعطيل Accessibility أو إلغاء تثبيت| P6
    P6 -->|حدث عبث — دون اتصال: Outbox| L2
    P6 -->|تنبيه فوري| S109
    S109 -->|تنبيه alert نوع system نظام S1-10| Father
    P6 -->|محاولة إعادة تفعيل تلقائية| L1
    P7 -->|حفظ حدث العبث| D7
    P1 -->|تسجيل التغيير| Audit
    P2 -->|تسجيل التغيير| Audit
    P3 -->|تسجيل التغيير| Audit
    P5 -->|تسجيل التفعيل والانتهاء| Audit
    P6 -->|تسجيل العبث| Audit
```

## 6. مخطط النشاط (Activity) — دورة حياة القاعدة والفرض

المسارات الأربعة (الأب / الطفل / وحدة Kotlin / الخادم) كمسارات متوازية. والأنشطة الخلفية (نبضة الخصم كل 60 ثانية + مراقبة العبث + تفريغ Outbox) تعمل **بالتوازي** مع استخدام التطبيق.

```mermaid
flowchart LR
    subgraph Father [الأب]
        direction TB
        F1([فتح قواعد طفل])
        F2[إنشاء أو تعديل قاعدة أو جدول]
        F3[إعادة ترتيب الأنواع — مع معاينة النتيجة]
        F4[تفعيل وضع حر — مدة محددة]
        F5[منح وقت مباشرة أو إسناد مهمة]
        F6[مراجعة تنبيه عبث]
        F7([إغلاق لوحة الأهل])
    end
    subgraph Child [الطفل]
        direction TB
        C1([فتح تطبيق])
        C2[استخدام التطبيق]
        C3[طلب وقت إضافي من شاشة الحظر]
        C4[محاولة تعطيل الحماية]
    end
    subgraph Kotlin [وحدة Kotlin — S1-01]
        direction TB
        K1[استلام القواعد وبناء القناع اليومي]
        K2[تقييم — أول نوع مطابق يفوز]
        K3{النتيجة؟}
        K4[سماح + عرض المتبقي]
        K5[تحذير قبل 5 دقائق]
        K6[حظر فوري + شاشة الحظر]
        K7[نبضة خصم كل 60 ثانية — ساعة رتيبة]
        K8[كشف العبث]
        K9[محاولة إعادة تفعيل تلقائية]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[POST .../app-rules]
        V2[PUT .../weekly-schedule]
        V3[PUT .../rule-priority]
        V4[POST .../free-mode]
        V5[MQTT rules-updated / free-mode]
        V6[تسجيل التدقيق]
        V7[تنبيه عبث إلى S1-09]
    end

    F1 --> F2
    F2 --> V1
    F2 --> V2
    V1 --> V5
    V2 --> V5
    V1 --> V6
    V2 --> V6
    F1 --> F3
    F3 --> V3
    V3 --> V5
    V3 --> V6
    F1 --> F4
    F4 --> V4
    V4 --> V5
    V4 --> V6
    V5 --> K1
    K1 --> K2
    K1 --> K7
    C1 --> K2
    K2 --> K3
    K3 -->|سماح| K4
    K3 -->|اقتراب النفاد| K5
    K5 --> K4
    K3 -->|حظر| K6
    K6 --> C3
    C3 --> F5
    F5 -.->|عبر S1-05 — دقائق تضاف إلى حد التطبيق| K2
    C2 --> C4
    C4 --> K8
    K8 --> K9
    K8 --> V7
    V7 --> F6
    K9 -->|نجحت| K1
    K9 -->|فشلت| F6
```

- عند انتهاء الوضع الحر يعود التقييم فوراً — والتطبيق المفتوح المخالف يُغلق مع شاشة الحظر (REQ-019/004).
- الحالات الحدية (§7): تغيير ساعة الجهاز يدوياً لا يؤثر — النبضة بالساعة الرتيبة؛ وتعديلان متزامنان من والدين → `409 VERSION_CONFLICT` وإعادة تحميل؛ واستبدال الجهاز يعيد القواعد نفسها بالإقران الجديد — القواعد تتبع الطفل لا الجهاز.
