# S1-10: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-08 — D-2، بعد موجة الإصلاح 0e4a3e2..f7da470)؛ والمواصفة معتمدة بالكامل في التخطيط [تحديث 2026-11-17 (Q-406): أُغلق تصميم النظام؛ وأُعيد رسم المخططات 2026-11-17 لتطابق Q-405/Q-406 (REQ-032/033، الكيانان `custom_mode` و`mode_session`).]
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** #3 الحماية والتحكم بالجهاز (Child Protection) — `CONTEXT-MAP.md` §2 صف 3
- **القرارات الحاكمة:** Q-001 · Q-007 · Q-134 (هيكل الملف) · Q-002 · Q-031 · Q-061 · Q-065 · Q-067 · Q-106 · Q-141 · Q-142 · Q-143 · Q-144 · Q-145 · Q-146 · Q-168 · Q-343 · Q-405 · Q-406
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

19 حالة استخدام من السيناريوهات الثمانية والمتطلبات (§2/§3): الأب ينشئ القواعد والجداول ويرتب الأنواع ويفعّل الوضع الحر وينشئ الأوضاع الخاصة ويطبّق الأوضاع؛ والبالغ المفوَّض يدير القواعد حسب القالب (حذف القاعدة وإعادة الترتيب قابلان للتفويض — Q-146)؛ والوضع الحر للمالك وحده (Q-143)؛ والطفل والمراهق يفتحان التطبيقات ويطلبان وقتاً إضافياً دون اتصال؛ وأي محاولة تعطيل تتضمن تنبيهاً فورياً وإعادة تفعيل. والتسليم إلى S1-05 (دورة النقاط) وS1-09 (البطاقات والتنبيهات) ممثلان كجهات خارجية. والوضع الحر والأوضاع الجاهزة والخاصة تُطبَّق من شاشة واحدة «الأوضاع» (S10-09 وS10-10 سطح واحد — Q-405).

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
        UC11(تطبيق وضع — جاهز أو خاص — من شاشة الأوضاع)
        UC12(عرض أحداث العبث)
        UC13(مراجعة تدقيق الحماية)
        UC14(ضبط قواعد تصفية الويب لطفل)
        UC15(تجاوز نطاقات التصفية)
        UC16(مراجعة قواعد التصفية — بلوغ 13 سنة / استبدال جهاز)
        UC17(إنشاء وضع خاص — S10-17)
        UC18(تعديل / حذف وضع خاص — S10-17)
        UC19(إنهاء الوضع الساري لطفل)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC11
    Father --> UC12
    Father --> UC13
    Father --> UC14
    Father --> UC15
    Father --> UC16
    Father --> UC17
    Father --> UC18
    Father --> UC19
    Adult --> UC14
    Adult --> UC15
    Adult --> UC17
    Adult --> UC18
    Adult --> UC11
    Adult --> UC19
    Server -->|"زرع الافتراضيات عند الإقران (REQ-031)"| UC14
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
    UC6 -.->|عند الحظر| UC7
    UC7 --> S105
    UC9 --> UC12
    UC9 --> S109
    UC11 --> S109
    UC17 --> S109
    UC5 --> S109
```

أُعيد رسمه 2026-11-17 (Q-405 · Q-406): أُضيفت UC17 (إنشاء وضع خاص) وUC18 (تعديل/حذف وضع خاص) وUC19 (إنهاء الوضع الساري لطفل)؛ وصارت UC11 «تطبيق وضع — جاهز أو خاص — من شاشة الأوضاع» ويدخلها البالغ المفوَّض بمفتاح تطبيق الأوضاع كما يدخل UC19؛ والعدد صار 19.

- ملاحظة: حذف القاعدة (`protection.rule.delete`) وإعادة ترتيب الأنواع (`protection.priority.edit`) **قابلان للتفويض حسب القالب** (Q-146) — لذلك يظهر البالغ في UC1 وUC3. والوضع الحر (`protection.free_mode.activate`) **للمالك وحده** (Q-143) — لذلك لا يظهر البالغ في UC4. وزر SOS لا يظهر هنا لأنه ملك S1-01/S1-07 ولا يُحظر أبداً بأي قاعدة (Q-067).
- ملاحظة (Q-405 · Q-406): الأوضاع الخاصة — الإنشاء والتعديل والحذف (UC17/UC18) بمفاتيح قواعد التطبيقات الثلاثة (إنشاء/تعديل/حذف)، والتطبيق (UC11) والإنهاء (UC19) بمفتاح تطبيق الأوضاع (`protection.mode_preset.apply`) — بلا مفتاح جديد؛ والوضع الحر والأوضاع الجاهزة والخاصة من شاشة واحدة «الأوضاع» (S10-09 وS10-10 سطح واحد).
- قواعد تصفية الويب (UC14/UC15 — REQ-028/029/030 — Q-343): التحرير للمالك وحده (`protection.filter.edit`)، والعرض للأب + البالغ المفوَّض حسب القالب (`protection.filter.view`)؛ ومراجعة بلوغ 13 سنة واستبدال الجهاز (UC16 — REQ-027 — S10-14) للمالك.

## 2. مخطط قاعدة البيانات (ERD)

الجداول الاثنا عشر من §5 كما هي، مع أربعة مراجع خارجية: العائلة (S1-02)، والعضوية (S1-02)، والوقت الممنوح (S1-05)، و`AuditEvent` (النواة المشتركة). ملاحظات: أحد عشر من الجداول الاثني عشر جداول عائلة تحمل `family_id` + عزل RLS (D-021)؛ والاستثناء الوحيد `web_category` — قاموس منصة ثابت بلا بيانات عائلة (لا `family_id` ولا RLS — Q-343). وحقول jsonb (`windows` و`order` و`remaining_by_app`) تُرسم `text` (مفردات ERD الموحدة Q-177 — النوع الحقيقي `jsonb` في §5) — كما في مخططات S1-05. وحقل `minutes_by_weekday` هو `int[7]` — الفهرس 0 = الأحد، 1 = الاثنين، 2 = الثلاثاء، 3 = الأربعاء، 4 = الخميس، 5 = الجمعة، 6 = السبت؛ وكل قيمة 0–1440. و`rule_priority.child_id` فارغ = ترتيب العائلة الافتراضي؛ وصف الطفل تجاوز اختياري عنه (REQ-011). و`enforcement_state` مرآة خادمية لحالة الجهاز — وتقييم الجهاز المحلي هو المرجع دون اتصال (REQ-025)؛ وتحمل `active_mode` (الوضع الساري: `study` أو `sleep` أو معرّف وضع خاص) و`active_mode_until`، و`active_rule_type` يأخذ القيمة `mode` حين يحسم وضع سارٍ (Q-405). و`app_rule.action` يقبل الفراغ: صف بلا إجراء يحمل علامة الدراسة `is_study_app` وحدها لتطبيق لا قاعدة له (REQ-007 · Q-405). و`mode_session.mode` نص: `study` أو `sleep` أو معرّف `custom_mode` — بلا مفتاح أجنبي إلى `custom_mode`. ومخازن العميل (مرآة Drift للقواعد والجدول والترتيب والقناع + Outbox) ليست جداول خادم — انظر §5. ولا علاقة مفاتيح بين `granted_time` وأي جدول هنا — الوقت الممنوح من S1-05 يدخل في "الإضافي" لصيغة المتبقي (REQ-002: المتبقي = الحصة + الإضافي − المستهلك) عبر محرك التقييم (DFD: S105→P4)؛ وحقل `remaining_by_app` في `enforcement_state` لقطة محسوبة للمتبقي لا علاقة تخزين.

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
    family ||--o{ custom_mode : "له أوضاع خاصة"
    family ||--o{ mode_session : "له جلسات أوضاع"
    membership ||--o{ app_rule : "قواعد طفل"
    membership ||--o{ mode_session : "جلسات أوضاع طفل"
    membership ||--|| daily_total_quota : "حصة طفل"
    membership ||--o{ weekly_schedule : "جدول طفل"
    membership ||--o{ rule_priority : "ترتيب طفل أو العائلة"
    membership ||--|| enforcement_state : "حالة طفل"
    membership ||--o{ app_usage_daily : "استهلاك طفل"
    membership ||--o{ free_mode_session : "جلسات طفل"
    membership ||--o{ tamper_event : "عبث على جهاز طفل"
    app_rule ||--o{ AuditEvent : "تغييراته تُسجَّل"
    daily_total_quota ||--o{ AuditEvent : "تغييراتها تُسجَّل"
    weekly_schedule ||--o{ AuditEvent : "تغييراته تُسجَّل"
    rule_priority ||--o{ AuditEvent : "تغييراته تُسجَّل"
    free_mode_session ||--o{ AuditEvent : "تفعيله وانتهاؤه يُسجَّلان"
    custom_mode ||--o{ AuditEvent : "إنشاؤه وتعديله وحذفه يُسجَّل"
    mode_session ||--o{ AuditEvent : "بدء الوضع وانتهاؤه يُسجَّلان"
    tamper_event ||--o{ AuditEvent : "كل حدث يُسجَّل"
    family ||--o{ web_filter_rule : "له قواعد تصفية"
    membership ||--o{ web_filter_rule : "قواعد تصفية طفل"
    web_filter_rule }o--|| web_category : "قاعدة فئة"
    web_filter_rule ||--o{ AuditEvent : "تغييراتها تُسجَّل"

    app_rule {
        uuid rule_id PK
        uuid family_id FK
        uuid child_id FK
        text app_package
        text action
        %% action فارغ = صف علامة دراسة فقط لتطبيق لا قاعدة له (REQ-007 · Q-405)
        int[7] minutes_by_weekday
        boolean is_study_app
        int version
        text created_by
        timestamptz created_at
        timestamptz updated_at
    }
    daily_total_quota {
        uuid quota_id PK
        uuid family_id FK
        uuid child_id FK
        int[7] minutes_by_weekday
        int version
        text created_by
        timestamptz created_at
        timestamptz updated_at
    }
    weekly_schedule {
        uuid schedule_id PK
        uuid family_id FK
        uuid child_id FK
        text windows
        int version
        timestamptz updated_at
    }
    rule_priority {
        uuid priority_id PK
        uuid family_id FK
        uuid child_id FK
        text order
        int version
        text updated_by
        timestamptz updated_at
    }
    enforcement_state {
        uuid child_id PK
        uuid family_id FK
        timestamptz last_evaluated_at
        text active_rule_type
        text remaining_by_app
        timestamptz next_boundary_at
        timestamptz free_mode_until
        text active_mode
        timestamptz active_mode_until
        text tamper_status
        timestamptz updated_at
    }
    app_usage_daily {
        uuid usage_id PK
        uuid family_id FK
        uuid child_id FK
        text app_package
        timestamptz usage_date
        int seconds_used
        timestamptz updated_at
    }
    free_mode_session {
        uuid session_id PK
        uuid family_id FK
        uuid child_id FK
        text activated_by
        timestamptz activated_at
        timestamptz expires_at
        timestamptz cancelled_at
        text status
    }
    custom_mode {
        uuid mode_id PK
        uuid family_id FK
        text name
        text name_key
        text icon
        text opens
        text app_packages
        boolean keep_limits
        int version
        text created_by
        timestamptz created_at
        timestamptz updated_at
    }
    mode_session {
        uuid session_id PK
        uuid family_id FK
        uuid child_id FK
        text mode
        text activated_by
        timestamptz activated_at
        timestamptz expires_at
        boolean stops_at_window
        timestamptz ended_at
        text status
    }
    tamper_event {
        uuid event_id PK
        uuid family_id FK
        uuid child_id FK
        uuid device_id
        text kind
        timestamptz detected_at
        boolean reactivation_attempted
        timestamptz resolved_at
        boolean notified
    }
    web_category {
        int category_id PK
        text key
        text label_ar
    }
    web_filter_rule {
        uuid rule_id PK
        uuid family_id FK
        uuid child_id FK
        int category_id
        text action
        text settings
        int version
        text updated_by
        timestamptz updated_at
    }
    family {
        uuid id PK
    }
    membership {
        uuid id PK
    }
    granted_time {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
    }
```

أُعيد رسمه 2026-11-17 (Q-405 · Q-406): أُضيف الكيانان `custom_mode` (تعريف وضع خاص على مستوى العائلة) و`mode_session` (جلسة وضع سارٍ لطفل) مع علاقاتهما والتدقيق؛ وأُضيف إلى `enforcement_state` حقلا `active_mode` و`active_mode_until`؛ و`app_rule.action` يقبل الفراغ لصف علامة الدراسة وحده؛ والعدد صار 12 جدولاً.

## 3. التسلسل (Sequence) — من عقود §4

أحد عشر مخططاً، كل واحد لتدفق واحد:
- **عقد MQTT (Q-168 — الإحالة الصريحة إلى `docs/family-os/governance/architecture/MQTT-BROKER-SPEC.md`):** الوسيط Eclipse Mosquitto 2.x — عقدة واحدة في المرحلة 1 — TLS 1.2+ على المنفذ 8883 + mTLS (شهادة خادم + شهادة جهاز)؛ والأوامر (`family/{family_id}/devices/{device_id}/commands` / `family/{family_id}/protection/rules-updated` / `family/{family_id}/protection/free-mode`) QoS 1 + إقرار تطبيقي إلزامي؛ والعبث (`family/{family_id}/protection/tamper`) QoS 1؛ والحالة الدورية (`family/{family_id}/device/{device_id}/state`) QoS 0 + محفوظة؛ وبلا QoS 2 — التكرار يُغطيه `command_id`؛ وكل أمر يحمل `command_id` (idempotency)؛ والجلسة دائمة (clean session = false)؛ وlast will على `family/{family_id}/devices/{device_id}/status` = `offline`.
- **قنوات المنصة (§4-1 — `MethodChannel("familyos/enforcement")` و`EventChannel("familyos/enforcement/events")`):** الطرق الست الجديدة: `applySchedule(schedule: WeeklySchedule) -> void` (دفع الجدول الأسبوعي) · `applyPriority(order: List<RuleType>) -> void` (دفع ترتيب الأنواع) · `getEnforcementState() -> EnforcementState` (حالة الفرض للعرض) · `activateFreeMode(until: timestamp) -> void` (تفعيل الوضع الحر) · `evaluateNow() -> EnforcementDecision` (تقييم فوري عند فتح تطبيق) · `applyWebFilterRules(rules: WebFilterRules) -> void` (دفع قواعد تصفية الويب إلى VPN QProxy — REQ-028/029/030)؛ والأحداث: `enforcement_state` (موروثة) + `rule_blocked` و`tamper_detected` و`free_mode_changed`.

### 3-أ. إنشاء قاعدة تطبيق + دفع عبر MQTT (REQ-001/026 — §4-2 + §4-3)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Flutter as "لوحة الأهل"
    participant Ktor as الخادم
    participant K as "وحدة Kotlin"
    participant Audit as التدقيق
    Father->>Flutter: إنشاء قاعدة لتطبيق عمر — ALLOW أو BLOCK أو LIMIT + دقائق لكل يوم أسبوع
    Flutter->>Ktor: POST /api/v1/families/{id}/children/{childId}/app-rules {app_package, action, minutes_by_weekday}
    Ktor->>Ktor: فحص protection.rule.create عبر S1-03 — deny-override (Q-007)
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
    K->>K: إعادة بناء القناع اليومي
    K-->>Ktor: إقرار (ack) — QoS 1 — توصيل الأمر + الإقرار < 5 ثوانٍ (Q-061)
    Ktor->>Audit: AuditEvent (domain=protection — من غيّر وماذا ومتى)
    Ktor-->>Flutter: 201 {rule_id, ...} — رد واحد بعد الإقرار (كـ 3-ب)
```

- قاعدة واحدة لكل (طفل، تطبيق) — قيد وحيد (REQ-001)؛ وكل دقيقة في `minutes_by_weekday` بين 0 و1440؛ والتطبيق بلا قاعدة = سماح، لا حظر ضمني؛ والرد `201` واحد بعد الإقرار — لا رد مبكر ولا تأكيد ثانٍ (نموذج 3-ب نفسه — و`POST .../app-rules` في §4-2 يعرّف `201` وحده).

### 3-ب. حفظ الجدول الأسبوعي مع كشف التعارض (REQ-006 — §4-2)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Flutter as "لوحة الأهل"
    participant Ktor as الخادم
    participant K as "وحدة Kotlin"
    participant Shell as الغلاف
    Father->>Flutter: حفظ جدول أسبوعي — نوافذ نوم ومدرسة لكل يوم
    Flutter->>Ktor: PUT /api/v1/families/{id}/children/{childId}/weekly-schedule {windows, version}
    alt نوافذ متداخلة في اليوم نفسه
        Ktor-->>Flutter: 409 SCHEDULE_CONFLICT + رسالة واضحة
        Flutter-->>Father: صحح التداخل
        Father->>Flutter: تصحيح وإعادة إرسال
        Flutter->>Ktor: PUT .../weekly-schedule {windows, version}
        Ktor->>Ktor: حفظ + رفع version
    else بلا تعارض
        Ktor->>Ktor: حفظ + رفع version
    end
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
    K->>K: إعادة بناء القناع اليومي
    K->>K: إعادة تقييم فورية — إن صار الوقت الحالي محظوراً يُطبَّق الحظر فوراً دون انتظار الحد التالي (REQ-009)
    K->>Shell: بث rule_blocked عبر EventChannel — إغلاق التطبيق المفتوح المخالف + شاشة الحظر
    K-->>Ktor: إقرار (ack) — QoS 1 < 5 ثوانٍ (Q-061)
    Ktor-->>Flutter: الجدول المحفوظ
```

- ملاحظة: تعديل متزامن من والد آخر على نسخة قديمة → `409 VERSION_CONFLICT` — يُعاد تحميل أحدث حالة قبل إعادة المحاولة (نمط S1-03 REQ-019 — قفل تفاؤلي على `version`). وكشف التعارض يشمل التداخل الليلي عبر منتصف الليل (REQ-006): نافذة `end_time <= start_time` تمتد إلى اليوم التالي.

### 3-ج. تقييم الفرض عند فتح تطبيق (REQ-008/010/011/012/033 — §4-1 evaluateNow + Q-145 · Q-405)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant Shell as الغلاف
    participant K as "وحدة Kotlin"
    Child->>Shell: فتح تطبيق
    Shell->>K: evaluateNow() — MethodChannel("familyos/enforcement")
    K->>K: الدرجة الأولى: وضع حر سارٍ؟ (free_mode_until لم يمضِ — REQ-018/033)
    alt وضع حر سارٍ
        K->>Shell: سماح — free_mode_active=true — بلا النظر إلى أي قاعدة
    else لا وضع حر
        K->>K: الدرجة الثانية: وضع سارٍ؟ (mode_session — REQ-033)
        alt وضع نوم سارٍ
            K->>Shell: شاشة حظر — وضع النوم
        else وضع دراسة سارٍ
            K->>K: التطبيق من تطبيقات الدراسة؟ والمحظور يبقى مغلقاً (REQ-033 ب)
            alt ليس تطبيق دراسة أو محظور
                K->>Shell: شاشة حظر — وضع الدراسة: تطبيقات الدراسة فقط
            else تطبيق دراسة وبقي رصيد في الحد والحصة
                K->>Shell: سماح — مع عرض المتبقي
            else تطبيق دراسة ونفد الحد أو الحصة
                K->>Shell: شاشة حظر + زر اطلب وقتاً إضافياً (إلى 3-د)
            end
        else وضع خاص NONE
            K->>Shell: شاشة حظر — الوضع لا يفتح شيئاً
        else وضع خاص LIST
            K->>K: التطبيق في قائمة الوضع؟ والمحظور يبقى مغلقاً (REQ-033 ب)
            alt خارج القائمة أو محظور
                K->>Shell: شاشة حظر — خارج قائمة الوضع
            else داخل القائمة وبلا حد داخل الوضع
                K->>Shell: سماح — بلا حد داخل الوضع
            else داخل القائمة والحدود باقية وبقي رصيد
                K->>Shell: سماح — مع عرض المتبقي
            else داخل القائمة والحدود باقية ونفد الحد أو الحصة
                K->>Shell: شاشة حظر + زر اطلب وقتاً إضافياً (إلى 3-د)
            end
        else وضع خاص ALL
            K->>K: المحظور يبقى مغلقاً؛ والحدود والحصة باقية (REQ-033 ج)
            alt التطبيق محظور
                K->>Shell: شاشة حظر — محظور
            else نفد الحد أو الحصة
                K->>Shell: شاشة حظر + زر اطلب وقتاً إضافياً (إلى 3-د)
            else بقي رصيد
                K->>Shell: سماح — مع عرض المتبقي
            end
        else لا وضع سارٍ — الدرجة الثالثة: ترتيب أنواع القواعد
            K->>K: قراءة موضع القناع اليومي O(1) (REQ-008)
            K->>K: المشي في ترتيب الأب من الأعلى إلى الأسفل — الافتراضي: نوم ثم مدرسة ثم حد تطبيق ثم حصة إجمالية (Q-145)
            alt أول نوع مطابق = نوم
                K->>Shell: شاشة حظر — وقت نوم
            else أول نوع مطابق = مدرسة والتطبيق ليس من تطبيقات الدراسة
                K->>Shell: شاشة حظر — وقت مدرسة، تطبيقات الدراسة فقط (REQ-007)
            else أول نوع مطابق = حد تطبيق والمتبقي صفر
                K->>Shell: شاشة حظر + زر اطلب وقتاً إضافياً (إلى 3-د)
            else أول نوع مطابق = حصة إجمالية والمتبقي صفر
                K->>Shell: شاشة حظر — نفاد الحصة اليومية
            else لا نوع مطابق أو بقي رصيد
                K->>Shell: سماح — مع عرض المتبقي
                Note over K,Shell: تحذير قبل 5 دقائق من نفاد الحد (REQ-004) — مرة واحدة في اليوم لكل تطبيق
            end
        end
    end
    Note over K,Shell: عند أي حظر — بث rule_blocked عبر EventChannel("familyos/enforcement/events")
```

أُعيد رسمه 2026-11-17 (Q-405): التقييم صار سلّم REQ-033 بثلاث درجات — حر، ثم وضع سارٍ (جاهز أو خاص)، ثم ترتيب أنواع القواعد؛ والمحظور يبقى مغلقاً في كل وضع عدا الحر؛ ووضع `ALL` يبقي الحدود والحصة والمحظور؛ ووضع الدراسة يفتح تطبيقات الدراسة وحدها مع بقاء الحد والحصة.

- ملاحظة (تعارض في المواصفة — يُبلَّغ ولا يُحسم): نص `evaluateNow` في SPEC §4-1 ما زال يصف الفحصين القديمين (وضع حر ثم ترتيب الأنواع) ولم يُحدَّث بدرجة الوضع الساري؛ والسلّم هنا من REQ-033 (§3). وكذلك `getEnforcementState` في §4-1 ما زال يرجع الحقول القديمة بلا `active_mode`.

- صيغة المتبقي عند التقييم (REQ-002): المتبقي = الحصة + الإضافي − المستهلك؛ والحصة من `daily_total_quota`، والإضافي من S1-05، والمستهلك من `app_usage_daily`.
- الترتيب الافتراضي يعمل بلا إعداد؛ والأب يعيد ترتيب الأنواع لكل عائلة ولكل طفل (REQ-011)؛ والوقت المكتسب أو الممنوح يضيف دقائق إلى حد التطبيق فقط — ولا يفتح تطبيقاً في وقت نوم أو مدرسة (REQ-012). وزر SOS لا يُحظر أبداً (Q-067) — خارج هذا التدفق.

### 3-د. نفاد الحد — شاشة الحظر وطلب وقت (REQ-003/004/005 + S1-05)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant K as "وحدة Kotlin"
    participant S105 as المحفظة
    participant S109 as "مركز الأوامر"
    actor Father as الأب
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
    actor Father as الأب
    participant Flutter as "لوحة الأهل"
    participant Ktor as الخادم
    participant K as "وحدة Kotlin"
    participant ChildFlutter as "غلاف الطفل (Flutter)"
    Father->>Flutter: ضغط بطاقة وضع حر + اختيار المدة بالدقائق
    Flutter->>Ktor: POST /api/v1/families/{id}/children/{childId}/free-mode {duration_minutes}
    alt المفعّل ليس المالك
        Ktor-->>Flutter: 403 FREE_MODE_NOT_OWNER (Q-143 — بأمر الأب فقط)
    else وضع حر سارٍ أصلاً
        Ktor-->>Flutter: 409 FREE_MODE_ACTIVE
    else تفعيل صحيح
        Ktor->>Ktor: إنشاء free_mode_session {expires_at}
        Ktor->>Ktor: إنهاء أي وضع سارٍ (mode_session) عند الطفل في المعاملة نفسها (REQ-033 أ)
        Ktor->>K: family/{family_id}/protection/free-mode — تفعيل (MQTT — QoS 1)
        K->>ChildFlutter: بث free_mode_changed عبر EventChannel("familyos/enforcement/events")
        ChildFlutter->>K: activateFreeMode(until) — MethodChannel("familyos/enforcement") — تعليق كل القواعد
        Ktor-->>Flutter: 201 {session_id, expires_at}
        Flutter-->>Father: لافتة وضع حر — ينتهي خلال X
        Note over Ktor,K: عند انتهاء المدة — انتهاء تلقائي + عودة القواعد + تسجيل في التدقيق (REQ-019)؛ والجلسة منتهية متى بلغ الوقت expires_at ولو بقي status مخزَّناً ACTIVE — والخادم يصحّح status إلى EXPIRED كسولاً عند أول قراءة/تفعيل/مزامنة لاحقة (بلا وظيفة مسح)، وحدث التدقيق يحمل expires_at
        Note over Ktor,K: إلغاء مبكر — POST .../free-mode/cancel — {status: cancelled}
    end
```

- أثناء الوضع الحر: زر SOS يعمل كالعادة؛ والاستخدام يُحسب في التقارير ولا يُحدَّد؛ والوضع الحر لا يمسح تنبيهات العبث المعلقة ولا يوقف محاولات إعادة التفعيل (REQ-020). ونموذج الرد هنا يختلف عن 3-أ/3-ب قصداً: الجلسة تُنشأ خادمياً فيُرجع `201` فور إرسال أمر التفعيل عبر MQTT — لأن `201` هنا يثبت إنشاء الجلسة لا سريانها على الجهاز؛ وإقرار الجهاز يصل لاحقاً عبر موضوع الإقرارات `devices/{device_id}/acks` (§4-3) — فلا ينتظر الأب الإقرار ليرى اللافتة.

### 3-و. كشف العبث — تنبيه + إعادة تفعيل (REQ-021/022/023 — Q-144)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant K as "وحدة Kotlin"
    participant Ktor as الخادم
    participant S109 as "مركز الأوامر"
    actor Father as الأب
    Child->>K: تعطيل خدمة Accessibility من إعدادات النظام
    K->>K: كشف فوري — مستمع حالة الخدمة
    K->>Ktor: family/{family_id}/protection/tamper (MQTT — QoS 1) — حدث عبث
    K->>K: بث tamper_detected عبر EventChannel("familyos/enforcement/events")
    Ktor->>S109: تنبيه alert نوع system نظام S1-10
    S109-->>Father: تنبيه فوري — محاولة تعطيل الحماية
    alt محاولة إلغاء تثبيت وكيل الطفل
        K->>K: حدث عبث UNINSTALL_ATTEMPT — يُحفظ في Outbox دون اتصال بأولوية قصوى
        K->>K: بوابة الوالدين (S1-01 REQ-006) — إلغاء التثبيت يتطلب PIN الأب (REQ-023)
        K-->>Child: رفض إلغاء التثبيت بلا PIN الأب
    end
    K->>K: محاولة إعادة تفعيل تلقائية فوراً
    alt نجحت إعادة التفعيل
        K->>Ktor: تسجيل النجاح في tamper_event
        Ktor->>S109: إشعار الأب بالنجاح
    else فشلت
        K->>K: إعادة المحاولة عند كل نبضة تقييم حتى تنجح أو يتدخل الأب
        Note over K,Father: التنبيه يبقى ظاهراً للأب ولا يُسكَت من جهاز الطفل (REQ-022)
    end
    opt الأب يفتح تنبيهات العبث (S10-11)
        Father->>Ktor: GET /api/v1/families/{id}/children/{childId}/tamper-events?limit&before — المفتاح protection.tamper.view
        Ktor->>Ktor: قراءة D7 tamper_event
        Ktor-->>Father: {events: [{event_id, kind, detected_at, reactivation_attempted, resolved_at, notified}], next_cursor}
        Father->>Ktor: POST .../tamper-events/{eventId}/resolve — حلّ بعد التدخل (REQ-022)
        Ktor-->>Father: {event_id, resolved_at}
    end
```

- أنواع العبث: `UNINSTALL_ATTEMPT` · `ACCESSIBILITY_DISABLED` · `DEVICE_ADMIN_REVOKED` · `VPN_DISCONNECTED` · `SERVICE_KILLED` (REQ-021). ودون اتصال يُحفظ حدث العبث في Outbox بأولوية قصوى. وإلغاء تثبيت وكيل الطفل يتطلب PIN الأب (REQ-023 — Q-065 · Q-142 — نمط Bark Kids: رمز يصدره الأب).

### 3-ز. مزامنة دون اتصال (REQ-014/015/016/017 — Q-064)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant K as "وحدة Kotlin"
    participant OB as Outbox
    participant Ktor as الخادم
    actor Father as الأب
    Child->>K: استخدام التطبيقات — لا اتصال يومان
    K->>K: فرض من آخر إعداد مزامَن (REQ-014)
    Note over K: نبضة خصم كل 60 ثانية بالساعة الرتيبة — تغيير الساعة يدوياً لا يؤثر (REQ-015)
    K->>K: إعادة ضبط الحصص منتصف الليل بالمرساة (REQ-005): منتصف ليل تقويمي مخزَّن من `family.time_zone` + إزاحة رتيبة — تُعاد تثبيتها عند كل مزامنة/إقلاع؛ وبلا اتصال بعد إعادة تشغيل لا إعادة ضبط حتى إعادة التثبيت
    K->>OB: تسجيل أحداث الاستخدام محلياً
    Father->>Ktor: تغيير قاعدة أثناء انقطاع عمر
    Ktor->>Ktor: التغيير ينتظر على الخادم — عمر يفرض الإعداد القديم حتى يتصل (REQ-017)
    Note over K,OB: عند عودة الاتصال
    K->>OB: قراءة الأحداث
    K->>Ktor: تفريغ Outbox — idempotent بمفتاح الطفل + التطبيق + التاريخ — لا خصم مكرر (REQ-016)
    Ktor-->>K: family/{family_id}/protection/rules-updated — القواعد الجديدة
    K->>K: إعادة بناء القناع اليومي وتطبيق القواعد الجديدة
```

### 3-ح. دورة الأمر والإقرار عبر MQTT (REQ-001/026 — §4-3 + Q-168)

```mermaid
sequenceDiagram
    autonumber
    participant Ktor as الخادم
    participant Mosquitto as الوسيط
    participant K as "وحدة Kotlin"
    Note over Ktor,Mosquitto: الوسيط Eclipse Mosquitto 2.x — TLS 1.2+ على 8883 + mTLS (Q-168)
    Ktor->>Mosquitto: family/{family_id}/devices/{device_id}/commands (MQTT — QoS 1 + command_id)
    Mosquitto->>K: تسليم الأمر — مرة على الأقل (إزالة تكرار بـ command_id)
    K->>K: تنفيذ الأمر (حظر/قاعدة/وضع حر)
    K->>Mosquitto: family/{family_id}/devices/{device_id}/acks (MQTT — QoS 1 + command_id + النتيجة)
    Mosquitto->>Ktor: إقرار التنفيذ — توصيل الأمر + الإقرار < 5 ثوانٍ (Q-061)
    K->>Mosquitto: family/{family_id}/device/{device_id}/state (MQTT — QoS 0 — محفوظة)
    K->>Mosquitto: family/{family_id}/devices/{device_id}/status (MQTT — محفوظة + last will = offline)
```

### 3-ط. تطبيق وضع — جاهز أو خاص (REQ-024/032/033 — §4-2 POST .../mode-presets/{preset} · Q-405)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant S109 as "مركز الأوامر"
    participant Ktor as الخادم
    participant K as "وحدة Kotlin"
    Father->>S109: ضغط بطاقة وضع في شاشة الأوضاع — دراسة / نوم / حر / وضع خاص
    S109->>Ktor: POST /api/v1/families/{id}/children/{childId}/mode-presets/{preset} {duration_minutes, on_schedule_cross?}
    Ktor->>Ktor: فحص المفتاح: دراسة/نوم/خاص protection.mode_preset.apply — والحر protection.free_mode.activate
    alt المعرّف وضع خاص غير موجود
        Ktor-->>S109: 404 MODE_NOT_FOUND
    else وضع حر والمفعّل ليس المالك
        Ktor-->>S109: 403 FREE_MODE_NOT_OWNER (Q-143 — بأمر الأب فقط)
    else نافذة نوم أو مدرسة تبدأ قبل انتهاء المدة وأثرها غير أثر الوضع، ولم يُرسل الاختيار
        Ktor-->>S109: 409 SCHEDULE_CROSS_CHOICE_REQUIRED
        S109-->>Father: يتوقف عند وقت الجدول أم يستمر حتى نهاية المدة؟
        Father->>S109: الاختيار — يتوقف عند وقت الجدول / يستمر حتى نهاية المدة
        S109->>Ktor: POST .../mode-presets/{preset} {duration_minutes, on_schedule_cross: stop | continue}
    end
    alt الإعداد حر (free)
        Ktor->>Ktor: إنشاء free_mode_session {expires_at} — وينهي أي mode_session سارية (REQ-033 أ)
    else دراسة أو نوم أو وضع خاص
        Ktor->>Ktor: إنشاء mode_session {mode, expires_at, stops_at_window} — وينهي أي وضع سارٍ أو وضع حر (REQ-033 أ)
    end
    Ktor->>Ktor: تسجيل التطبيق في AuditEvent (domain=protection)
    alt الإعداد حر
        Ktor->>K: family/{family_id}/protection/free-mode (MQTT — QoS 1)
        K->>K: تعليق كل القواعد — بلا بناء قناع
    else دراسة أو نوم أو وضع خاص
        Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
        K->>K: إعادة بناء القناع اليومي + تطبيق الوضع الساري
    end
    K-->>Ktor: إقرار (ack) < 5 ثوانٍ (Q-061)
```

أُعيد رسمه 2026-11-17 (Q-405): `{preset}` يقبل `study` أو `sleep` أو `free` أو معرّف وضع خاص؛ والمدة مطلوبة لكل وضع؛ والتقاطع مع نافذة جدول أثرها غير أثر الوضع يُرجع `409 SCHEDULE_CROSS_CHOICE_REQUIRED` حتى يختار الأب؛ والتطبيق ينهي أي وضع سارٍ أو وضع حر في المعاملة نفسها (وضع واحد لكل طفل)؛ ومعرّف خاص غير موجود يُرجع `404 MODE_NOT_FOUND`.

- المعاينة قبل التطبيق (S10-10) تذكر أثر الوضع على كل طفل باسمه وتقول إن الجديد ينهي الساري (REQ-033 أ/هـ)؛ وبلا مدة لا تطبيق (Q-087).

### 3-ي. حفظ قواعد تصفية الويب + دفع إلى VPN QProxy (REQ-028/029/030/031 — Q-343)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant K as وحدة Kotlin (VPN QProxy)
    Father->>App: ضبط إجراء pornography على BLOCK وgambling على BLOCK وsocialNetwork على ALERT (S10-15)
    Father->>App: ضبط تجاوز example.com على BLOCK (S10-16)
    App->>Ktor: PUT /api/v1/families/{id}/children/{childId}/web-filter-rules {categories, domains, flags} — protection.filter.edit
    Ktor->>Ktor: تحقق: معرّف فئة غير معروف → 400 INVALID_WEB_FILTER — لا يُخزَّن شيء
    Ktor->>Ktor: حفظ القواعد + تسجيل التغيير في AuditEvent
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
    K->>K: applyWebFilterRules(rules) — تطبيق فوري على مسار التصفية (VPN QProxy)
    K-->>Ktor: إقرار (ack) < 5 ثوانٍ (Q-061)
```

- تجاوز النطاق يفوز على إجراء الفئة (REQ-029)؛ والطفل المقترن حديثاً تُزرع قواعده بالافتراضيات قبل أي إجراء من الأب (REQ-031). والفئات العشر المحظورة من أول يوم (Q-405): 14 إباحية · 12 محتوى ناضج · 7 قمار · 3 مخدرات · 1 كحول · 21 تبغ · 23 عنف · 24 أسلحة · 15 ألفاظ بذيئة · 29 بروكسي/ثغرات؛ والعشرون الباقية `ALLOW`؛ وكلها قابلة لتعديل الأب. والإجراء `IGNORE` (3) لا يُعرض في المرحلة 1 والخادم يرفضه `INVALID_RULE`؛ والمعروض: سماح، حظر، تنبيه (REQ-029 · Q-405).
[تصحيح 2026-11-08 (Q-343 — Q343-01): معرّف الشاشة S10-16 (تجاوزات نطاقات التصفية — REQ-029) كان غائباً من هذا الملف رغم أن مضمونه كان موجوداً: تسلسل 3-ي يحمل `domains` في حمولة PUT، والملاحظة أعلاه تستشهد بـ REQ-029 «تجاوز النطاق يفوز على إجراء الفئة»؛ أُضيف المعرف في تسلسل 3-ي وعقدة FWeb في §4 بنمط S10-15 نفسه، بلا تغيير في عدد التغطية (REQ-029 مغطى بـ S10-16 أصلاً في SPEC :903).]

### 3-ك. إدارة الأوضاع الخاصة — إنشاء وتعديل وحذف وإنهاء (REQ-032/033 — §4-2 · Q-405)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant S110 as "شاشة الأوضاع"
    participant Ktor as الخادم
    participant K as "وحدة Kotlin"
    Father->>S110: إنشاء وضع خاص — اسم + أيقونة + ما يُفتح (S10-17)
    S110->>Ktor: POST /api/v1/families/{id}/custom-modes {name, icon, opens, app_packages?, keep_limits?}
    alt اسم مكرر أو اسم وضع جاهز
        Ktor-->>S110: 409 MODE_NAME_TAKEN
    else LIST بلا تطبيقات
        Ktor-->>S110: 400 INVALID_RULE
    else إنشاء صحيح
        Ktor->>Ktor: حفظ custom_mode {mode_id, name_key} — قيد وحيد (family_id, name_key)
        Ktor->>Ktor: تسجيل الإنشاء في AuditEvent (domain=protection)
        Ktor-->>S110: 201 الوضع المنشأ
    end
    Father->>S110: تعديل وضع خاص — اسم أو أيقونة أو ما يُفتح
    S110->>Ktor: PUT /api/v1/families/{id}/custom-modes/{modeId} {name, icon, opens, app_packages?, keep_limits?, version}
    alt version قديم
        Ktor-->>S110: 409 VERSION_CONFLICT
    else تعديل صحيح
        Ktor->>Ktor: حفظ + رفع version — يسري فوراً على من يسري عليهم (REQ-032)
        Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
        Ktor->>Ktor: تسجيل التعديل في AuditEvent
        Ktor-->>S110: الوضع المحفوظ
    end
    Father->>S110: حذف وضع خاص
    S110->>Ktor: DELETE /api/v1/families/{id}/custom-modes/{modeId}
    Ktor->>Ktor: إنهاء جلساته السارية أولاً عند كل طفل يسري عليه (REQ-032)
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
    Ktor->>Ktor: تسجيل الحذف في AuditEvent
    Ktor-->>S110: 204
    Father->>S110: إنهاء الوضع الساري لطفل قبل وقته
    S110->>Ktor: DELETE /api/v1/families/{id}/children/{childId}/active-mode
    Ktor->>Ktor: إنهاء mode_session {status: ended}
    Ktor->>K: family/{family_id}/protection/rules-updated (MQTT — QoS 1)
    Ktor->>Ktor: تسجيل الإنهاء في AuditEvent
    Ktor-->>S110: {session_id, status: "ended"}
```

رُسم 2026-11-17 (Q-405): مخطط جديد — نقاط الأوضاع الخاصة الخمس: الإنشاء بمفتاح `protection.rule.create`، والتعديل بمفتاح `protection.rule.edit`، والحذف بمفتاح `protection.rule.delete`، والإنهاء بمفتاح `protection.mode_preset.apply`؛ وتعديل وضع سارٍ يسري فوراً؛ وحذفه ينهي جلساته أولاً.

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الثمانية (§2)

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
    FAct -->|أوضاع| FModes["شاشة الأوضاع — جاهزة (دراسة/نوم/حر) + أوضاعي الخاصة (S10-09 + S10-10 سطح واحد)"]
    FModes --> FFree[تفعيل وضع حر — المالك وحده + مدة محددة]
    FModes --> FApply[تطبيق وضع جاهز أو خاص — مدة + اختيار التقاطع عند الحاجة]
    FModes --> FCustom["إنشاء / تعديل / حذف وضع خاص (S10-17)"]
    FModes --> FEnd[إنهاء الوضع الساري لطفل]
    FApply --> FApplySave["إنشاء mode_session + تدقيق + دفع rules-updated — الجديد ينهي الساري"]
    FCustom --> FCustomSave["حفظ التعريف + تدقيق + دفع rules-updated — التعديل يسري فوراً، والحذف ينهي الساري أولاً"]
    FEnd --> FEndSave["إنهاء mode_session + تدقيق + دفع rules-updated"]
    FAct -->|تصفية ويب| FWeb["ضبط قواعد تصفية الويب لطفل (S10-15) + تجاوزات النطاقات (S10-16) — الفئات الثلاثون + الأعلام الخمسة"]
    FWeb --> FWebVal{معرّف فئة غير معروف؟}
    FWebVal -->|نعم| FWebRej[رفض 400 INVALID_WEB_FILTER — لا يُخزَّن شيء]
    FWebRej --> FWeb
    FWebVal -->|لا| FWebSave[حفظ + تدقيق + دفع MQTT]
    FWebSave --> FWebApply[VPN QProxy يطبق القواعد فوراً عبر applyWebFilterRules]
    RStart([بلوغ الطفل 13 سنة أو استبدال جهازه]) --> RNotify["إشعار الأب لمراجعة قواعد التصفية (S10-14 — REQ-027)"]
    RNotify --> RReview{الأب يراجع القواعد؟}
    RReview -->|نعم| FWeb
    RReview -->|لا| RKeep[القواعد تبقى سارية كما هي]
    FFree --> FFreeSave["إنشاء جلسة وضع حر + تدقيق + دفع family/{family_id}/protection/free-mode MQTT — تعليق كل القواعد، بلا بناء قناع"]
    FSave --> Sync[الجهاز يبني القناع اليومي]
    Sync --> COpen([الطفل يفتح تطبيقاً])
    COpen --> CConn{اتصال؟}
    CConn -->|لا| COff[فرض من آخر إعداد مزامَن + نبضة 60 ثانية بالساعة الرتيبة]
    COff --> CEval
    CConn -->|نعم| CEval[تقييم — سلّم REQ-033: حر ← وضع سارٍ ← ترتيب الأنواع]
    CEval --> CFree{وضع حر سارٍ؟}
    CFree -->|نعم| CAllow[سماح — الاستخدام يُحسب ولا يُحدَّد]
    CFree -->|لا| CMode{وضع سارٍ؟}
    CMode -->|لا| CMatch{أول نوع مطابق؟}
    CMode -->|نوم| CBlockN
    CMode -->|دراسة| CStudy{التطبيق من تطبيقات الدراسة؟}
    CStudy -->|لا| CBlockS
    CStudy -->|نعم — محظور| CBlockB[حظر — محظور]
    CStudy -->|نعم — بقي رصيد| CWarn
    CStudy -->|نعم — نفد الحد أو الحصة| CBlockQ
    CMode -->|خاص NONE| CBlockM[حظر — الوضع لا يفتح شيئاً]
    CMode -->|خاص LIST| CList{التطبيق في قائمة الوضع؟}
    CList -->|لا| CBlockM
    CList -->|نعم — محظور| CBlockB
    CList -->|نعم — بلا حد داخل الوضع| CAllow
    CList -->|نعم — الحدود باقية وبقي رصيد| CWarn
    CList -->|نعم — الحدود باقية ونفد الحد أو الحصة| CBlockQ
    CMode -->|خاص ALL| CAllB{التطبيق محظور؟}
    CAllB -->|نعم| CBlockB
    CAllB -->|لا — بقي رصيد| CWarn
    CAllB -->|لا — نفد الحد أو الحصة| CBlockQ
    CMatch -->|نوم| CBlockN[حظر — وقت نوم]
    CMatch -->|"مدرسة والتطبيق ليس دراسة (REQ-007)"| CBlockS[حظر — وقت مدرسة، تطبيقات الدراسة فقط]
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
    Sync --> CTamper{مراقبة مستمرة — محاولة تعطيل الحماية؟}
    CTamper -->|نعم| CTAlert[تنبيه فوري للأب + محاولة إعادة تفعيل تلقائية]
    CTAlert --> COpen
```

أُعيد رسمه 2026-11-17 (Q-405): فُرع «الأوضاع» صار شاشة واحدة (جاهزة + خاصة + وضع حر) بمسارات التطبيق والإنشاء/التعديل/الحذف والإنهاء؛ والتقييم صار سلّم REQ-033 — حر، ثم وضع سارٍ (نوم/دراسة/NONE/LIST/ALL)، ثم ترتيب الأنواع.

- ملاحظة: زر SOS لا يُحظر أبداً — يعمل في كل مسار، في وقت النوم والمدرسة والوضع الحر (Q-067).
- ملاحظة: القواعد تتبع الطفل لا الجهاز — عند بلوغ الطفل 13 سنة تبقى قواعده سارية ويُشعَر الأب ليراجعها؛ وعند استبدال الجهاز تُعاد القواعد نفسها بالإقران الجديد (REQ-027).
- ملاحظة: تغيير الجدول يسري عند الاستلام؛ وإن صار الوقت الحالي محظوراً بالتغيير الجديد يُطبَّق الحظر فوراً حتى لو كان التطبيق مفتوحاً حينها (REQ-009).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–10.0، والمخازن D1–D12 جداول خادم (PostgreSQL)، والمخزنان L1–L2 مخازن عميل على جهاز الطفل (Drift/Outbox — محلية، ليست جداول خادم). و`enforcement_state` (D4) مرآة خادمية لحالة الجهاز — وتقييم الجهاز المحلي هو المرجع دون اتصال (REQ-025) — وتحمل الوضع الساري (`active_mode` و`active_mode_until` — Q-405). والأوضاع (REQ-024/032/033) عبر P10: دراسة/نوم/خاص بإنشاء `mode_session` (D12) — والحر عبر P5/D6 (إنشاء جلسة — لا قواعد ولا بناء قناع)؛ ووضع واحد لكل طفل، والجديد ينهي السابق. وصيغة المتبقي (REQ-002): المتبقي = الحصة + الإضافي − المستهلك؛ والحصة من `daily_total_quota.minutes_by_weekday` ليوم الأسبوع، والإضافي هو الوقت الممنوح/المصروف من S1-05 (`granted_time`)، والمستهلك من `app_usage_daily.seconds_used`. ولا حافة D5→P4: المستهلك في الصيغة هو `seconds_used` نفسه، لكنه يُحسب على الجهاز محلياً (نبضة خصم كل 60 ثانية) ولا يُقرأ من D5؛ وD5 مرآة خادمية يكتب فيها P7 فقط (مزامنة upsert — REQ-016) (Q-188).

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: `GET/POST/PATCH/DELETE .../app-rules` (3-أ · P1) · `GET/PUT .../weekly-schedule` (3-ب · P2) · `GET/PUT .../rule-priority` (3-ج · P3) · `GET/PUT .../daily-total-quota` (P8 · D8) · `GET/PUT .../web-filter-rules` (3-ي · P9 · D9/D10) · `POST .../free-mode` و`POST .../free-mode/cancel` (3-هـ · P5) · `GET .../enforcement-state` (P4 · D4) · `GET .../tamper-events` و`POST .../tamper-events/{eventId}/resolve` (يقرآن/يكتبان D7 عبر Ktor — S10-11 · 3-و) · `POST .../mode-presets/{preset}` (دراسة/نوم/خاص عبر P10/D12، والحر عبر P5/D6 — 3-ط) · `GET/POST .../custom-modes` و`PUT/DELETE .../custom-modes/{modeId}` و`DELETE .../children/{childId}/active-mode` (P10 · D11/D12 — 3-ك) · `GET .../audit/protection` (التدفقات إلى AuditEvent). و§4-1 (قناة المنصة) و§4-3 (أحداث MQTT) خارج هذه الملاحظة. وهذه الملاحظة مرجع لنقاط §4 (بلا رسم كل نقطة في تسلسل).

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
        P8(8.0 إدارة الحصة الإجمالية اليومية)
        P9(9.0 إدارة قواعد تصفية الويب)
        P10(10.0 إدارة الأوضاع الخاصة وتطبيق الأوضاع)
    end

    subgraph ServerStores [مخازن الخادم — PostgreSQL]
        D1[(D1 app_rule)]
        D2[(D2 weekly_schedule)]
        D3[(D3 rule_priority)]
        D4[(D4 enforcement_state)]
        D5[(D5 app_usage_daily)]
        D6[(D6 free_mode_session)]
        D7[(D7 tamper_event)]
        D8[(D8 daily_total_quota)]
        D9[(D9 web_category)]
        D10[(D10 web_filter_rule)]
        D11[(D11 custom_mode)]
        D12[(D12 mode_session)]
    end

    subgraph ClientStores [مخازن العميل — على جهاز الطفل]
        L1[(L1 مرآة Drift — قواعد + جدول + ترتيب + قناع يومي)]
        L2[(L2 Outbox — أحداث استخدام وعبث)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent])
    MQTT([وسيط MQTT — Mosquitto 2.x — 8883 + mTLS])

    Father -->|إنشاء أو تعديل أو حذف قاعدة| P1
    P1 -->|حفظ القاعدة| D1
    P1 -->|"family/{family_id}/protection/rules-updated — QoS 1"| MQTT
    Father -->|حفظ جدول| P2
    P2 -->|حفظ الجدول| D2
    P2 -->|"family/{family_id}/protection/rules-updated — QoS 1"| MQTT
    Father -->|إعادة ترتيب| P3
    P3 -->|حفظ الترتيب| D3
    P3 -->|"family/{family_id}/protection/rules-updated — QoS 1"| MQTT
    Father -->|"تعيين الحصة (الأب وحده — Q-184)"| P8
    P8 -->|حفظ الحصة| D8
    P8 -->|"family/{family_id}/protection/rules-updated — QoS 1"| MQTT
    Father -->|ضبط قواعد تصفية الويب لطفل| P9
    D9 -->|الفئات الثلاثون بمعرفاتها| P9
    P9 -->|حفظ القواعد| D10
    P9 -->|"family/{family_id}/protection/rules-updated — QoS 1"| MQTT
    Father -->|تفعيل أو إلغاء وضع حر| P5
    P5 -->|حفظ الجلسة| D6
    P5 -->|تفعيل الحر ينهي الجلسة السارية| D12
    P5 -->|"family/{family_id}/protection/free-mode — QoS 1"| MQTT
    Father -->|إنشاء / تعديل / حذف وضع خاص — S10-17| P10
    Father -->|تطبيق وضع / إنهاء الوضع الساري| P10
    P10 -->|حفظ التعريف| D11
    P10 -->|حفظ الجلسة| D12
    P10 -->|تطبيق وضع ينهي جلسة الوضع الحر| D6
    P10 -->|"family/{family_id}/protection/rules-updated — QoS 1"| MQTT
    P10 -->|تسجيل الإنشاء والتعديل والحذف والتطبيق والإنهاء| Audit
    P6 -->|"family/{family_id}/protection/tamper — QoS 1"| MQTT
    P4 -->|"family/{family_id}/device/{device_id}/state — QoS 0 — محفوظة"| MQTT
    Ktor -->|دفع القواعد والجدول والترتيب والوضع الساري| L1
    L1 -->|القواعد + القناع اليومي + الوضع الساري| P4
    S101 -->|قناة familyos/enforcement — evaluateNow / getEnforcementState| P4
    S105 -->|الممنوح يدخل في الإضافي| P4
    D8 -->|الحصة اليومية الإجمالية| P4
    Child -->|فتح تطبيق| P4
    P4 -->|قرار سماح أو حظر| Child
    P4 -->|حالة الفرض| D4
    P4 -->|حالة الفرض + المتبقي| S105
    D4 -->|حالة الفرض| S109
    P4 -->|أحداث استخدام| L2
    L2 -->|تفريغ idempotent| P7
    P7 -->|حفظ الاستهلاك| D5
    P7 -->|القواعد الجديدة| L1
    Child -->|تعطيل Accessibility أو إلغاء تثبيت| P6
    P6 -->|حدث عبث — دون اتصال: Outbox| L2
    P6 -->|تنبيه فوري| S109
    S109 -->|تنبيه alert نوع system نظام S1-10| Father
    P6 -->|محاولة إعادة تفعيل تلقائية — إعادة تشغيل محرك الفرض على الجهاز| P4
    P7 -->|حفظ حدث العبث| D7
    P1 -->|تسجيل التغيير| Audit
    P2 -->|تسجيل التغيير| Audit
    P3 -->|تسجيل التغيير| Audit
    P5 -->|تسجيل التفعيل والانتهاء والإلغاء المبكر| Audit
    P6 -->|تسجيل العبث| Audit
    P9 -->|تسجيل التغيير| Audit
    Audit -->|"نشر ملخص الحدث — family/{family_id}/protection/audit — QoS 1"| MQTT
    MQTT -->|"ملخص حدث التدقيق إلى كل أجهزة الأهل (REQ-026)"| Father
```

أُعيد رسمه 2026-11-17 (Q-405): أُضيفت العملية P10 (إدارة الأوضاع الخاصة وتطبيق الأوضاع) والمخزنان D11 (`custom_mode`) وD12 (`mode_session`)؛ والوضع الساري يُدفع إلى مرآة العميل L1 ويُقرأ في التقييم P4؛ وتفعيل الحر ينهي جلسة الوضع الساري وتطبيق وضع ينهي جلسة الحر.

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
        F4a[تطبيق وضع — جاهز أو خاص — مدة محددة]
        F4b[إنشاء / تعديل / حذف وضع خاص]
        F4c[إنهاء الوضع الساري لطفل]
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
        K2[تقييم — سلّم REQ-033: حر ← وضع سارٍ ← ترتيب الأنواع]
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
        V8["POST .../mode-presets/{preset}"]
        V9["نقاط الأوضاع الخاصة — GET/POST/PUT/DELETE .../custom-modes + DELETE .../active-mode"]
        V5["MQTT family/{family_id}/protection/rules-updated / family/{family_id}/protection/free-mode"]
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
    F1 --> F4a
    F4a --> V8
    V8 --> V5
    V8 --> V6
    F1 --> F4b
    F4b --> V9
    V9 --> V5
    V9 --> V6
    F1 --> F4c
    F4c --> V9
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
    K9 -->|نجحت| K2
    K9 -->|فشلت| F6
    F6 --> F7
```

أُعيد رسمه 2026-11-17 (Q-405): التقييم صار سلّم REQ-033؛ وأُضيفت عقد الأوضاع (تطبيق وضع F4a، وإنشاء/تعديل/حذف وضع خاص F4b، وإنهاء الوضع الساري F4c) مع نقطتي الخادم V8/V9.

- عند انتهاء الوضع الحر يعود التقييم فوراً — والتطبيق المفتوح المخالف يُغلق مع شاشة الحظر (REQ-019/004).
- الحالات الحدية (§7): تغيير ساعة الجهاز يدوياً لا يؤثر — النبضة بالساعة الرتيبة؛ وتعديلان متزامنان من والدين → `409 VERSION_CONFLICT` وإعادة تحميل؛ واستبدال الجهاز يعيد القواعد نفسها بالإقران الجديد — القواعد تتبع الطفل لا الجهاز.
