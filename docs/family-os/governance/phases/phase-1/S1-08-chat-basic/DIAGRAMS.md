# S1-08: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **القرارات الحاكمة:** Q-003 · Q-007 · Q-010 · Q-058 · Q-064 · Q-065 · Q-077 · Q-081 · Q-082 · Q-083 · Q-099 · Q-100 · D-011 · D-019 · D-020 · D-021 · D-023 · D-038 · G-006 · G-007 · G-011 · Q-134 (هيكل الملف)
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

14 حالة استخدام من السيناريوهات الستة والمتطلبات (§2/§3 — REQ-001…REQ-005 للقنوات والوسائط، REQ-006/007 للعرض الفوري وحالات التسليم، REQ-009 للحذف، REQ-011/017 لقناة الوالدين والاسترداد، REQ-012 لتنبيه المصنف، REQ-014 للعمل دون اتصال): أي عضو يراسل أي عضو، الأب يرى محادثات القاصرين ويغلقها، قناة الوالدين للبالغين فقط بـ PIN الأب ومخفية عن أجهزة الأطفال، والمصنف الخفيف يحرس رسائل الأطفال فقط. والتسليم إلى أنظمة الهوية (S1-02) والصلاحيات (S1-03) ومركز الأوامر (S1-09) ممثل كجهات خارجية.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ — الأم / المفوَّض])
    Teen([المراهق])
    Child([الطفل])
    S102([نظام الهوية S1-02])
    S103([نظام الصلاحيات S1-03])
    S109([مركز الأوامر S1-09])
    MinIO([MinIO — تخزين الوسائط])
    MQTT([وسيط MQTT])

    subgraph S108 [S1-08: الدردشة العائلية الأساسية]
        direction TB
        UC1(إرسال رسالة — نص / إيموجي / صورة / صوت)
        UC2(قراءة رسائل قناة)
        UC3(إنشاء قناة ثنائية أو جماعية)
        UC4(فتح قناة الوالدين — PIN الأب)
        UC5(إرسال رسالة في قناة الوالدين — E2E)
        UC6(عرض محادثات القاصرين)
        UC7(إغلاق محادثة قاصر)
        UC8(حذف رسالة للجميع)
        UC9(حذف رسالة لنفسي)
        UC10(إرسال دون اتصال — الصندوق الصادر)
        UC11(استرداد سجل قناة الوالدين — PIN + OTP)
        UC12(تلقي تنبيه المصنف عن رسالة طفل)
        UC13(تأكيد القراءة)
        UC14(رؤية مؤشر كتابة حي)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC11
    Father --> UC12
    Adult --> UC1
    Adult --> UC2
    Adult --> UC3
    Adult --> UC4
    Adult --> UC5
    Adult --> UC9
    Adult --> UC13
    Adult --> UC14
    Teen --> UC1
    Teen --> UC2
    Teen --> UC3
    Teen --> UC9
    Teen --> UC10
    Teen --> UC13
    Teen --> UC14
    Child --> UC1
    Child --> UC2
    Child --> UC3
    Child --> UC9
    Child --> UC10
    Child --> UC13
    Child --> UC14
    UC1 -.->|يتضمن| UC10
    UC4 -.->|يتضمن| UC5
    UC1 --> MinIO
    UC1 --> MQTT
    S102 --> UC2
    S103 --> UC6
    S103 --> UC7
    S103 --> UC8
    UC12 --> S109
    UC2 --> S109
```

- ملاحظتان: قناة الوالدين **لا تظهر أصلاً** على جهاز الطفل أو المراهق — لا في القائمة ولا في البحث (REQ-003)؛ والمراهق والطفل لا يغلقان محادثة ولا يحذفان رسالة للجميع أبداً (§6-1 — `chat.channel.close` و`chat.message.delete.any` للبالغين فقط).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الخمسة من §5 كما هي، مع أربعة مراجع خارجية: العائلة والعضوية (S1-02)، ومفتاح الصلاحية (S1-03 — مفاتيح `chat.*`)، وتنبيهات المصنف (S1-09 — `alert`)، و`AuditEvent` (النواة المشتركة). ملاحظتان: النسخة المحلية من `channel` + `message` في Drift على العميل مخزن عميل لا جدول خادم (§5-6)، و`payload` في قناة الوالدين نص مشفر E2E فقط — الخادم لا يقرأ محتواها أبداً (REQ-011). كل جدول يحمل `family_id` + عزل RLS (D-021) عدا `channel_member` الذي يصل إلى العائلة عبر `channel`.

```mermaid
erDiagram
    family ||--o{ channel : "له قنوات"
    family ||--o{ media : "له وسائط"
    family ||--|| parents_key_backup : "له نسخة مفاتيح"
    family ||--o{ membership : "له أعضاء"
    channel ||--o{ channel_member : "له أعضاء"
    channel ||--o{ message : "فيها رسائل"
    channel ||--|| parents_key_backup : "قناة الوالدين لها نسخة"
    channel_member }o--|| membership : "العضو مسجَّل في"
    message }o--o| media : "قد تحمل وسيطاً"
    message ||--o{ AuditEvent : "حذفها / إغلاقها يُسجَّل"
    channel ||--o{ AuditEvent : "إغلاقها يُسجَّل"
    channel_member }o--|| permission_grant : "رؤيته تُمنح بـ"
    message ||--o{ alert : "تنبيه المصنف عنها — kind=system"

    channel {
        uuid channel_id PK
        uuid family_id FK
        string kind
        string title
        uuid created_by
        timestamptz created_at
        timestamptz closed_at
        uuid closed_by
    }
    channel_member {
        uuid channel_id PK
        uuid member_id PK
        timestamptz joined_at
        bigint last_read_seq
    }
    message {
        uuid message_id PK
        uuid channel_id FK
        uuid family_id FK
        uuid sender_id
        string client_message_id
        bigint server_seq_id
        string kind
        jsonb payload
        uuid media_id FK
        string status
        timestamptz created_at
        string deleted_for
        timestamptz deleted_at
    }
    media {
        uuid media_id PK
        uuid family_id FK
        string mime
        int size_bytes
        string storage_ref
        string thumbnail_ref
        timestamptz created_at
    }
    parents_key_backup {
        uuid family_id PK
        uuid channel_id FK
        bytea encrypted_key
        jsonb kdf_params
        timestamptz updated_at
    }
    family {
        uuid id PK
    }
    membership {
        uuid id PK
    }
    permission_grant {
        string key PK
    }
    alert {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
    }
```

- `channel.kind`: `lounge` / `parents` / `direct` / `group` (§5-1 — REQ-001/002) — قناة الوالدين واحدة تُنشأ مع العائلة ولا تُنشأ من نقطة الإنشاء (§6-2). `message.kind`: `text` / `emoji` / `image` / `voice` / `system` (§5-3 — REQ-005). `media.size_bytes`: الحد 10MB للصور / 5MB للرسائل الصوتية (Q-058). `message.status`: `sent` / `delivered` / `read` (§5-3 — REQ-007). `message.deleted_for`: `all` (الأب) أو `self` (العضو) (§5-3 — REQ-009). `payload`: الحمولة المعماة Envelope للقنوات العائلية (REQ-010) وE2E لقناة الوالدين (REQ-011).

## 3. التسلسل (Sequence) — من عقود §4

خمسة مخططات، كل واحد لتدفق واحد:

### 3-أ. إرسال رسالة فورياً — العرض المتفائل ثم المزامنة (REQ-006/007 — §4.1 + §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant Drift as Drift
    participant الخادم as Ktor
    participant MQTT as MQTT
    actor الأم as Mother
    Father->>App: كتابة رسالة وإرسالها
    App->>Drift: حفظ محلياً بـ client_message_id (علامة ساعة)
    App-->>Father: الرسالة تظهر فوراً (<10ms)
    App->>Ktor: POST /families/{id}/channels/{channelId}/messages {client_message_id, kind, payload}
    Ktor->>Ktor: فحص الصلاحية chat.message.send (S1-03) + منع التكرار بـ client_message_id
    Ktor-->>App: الرسالة + server_seq_id
    App->>Drift: تحديث الحالة (صح التسليم) بـ server_seq_id
    Ktor->>MQTT: family/{family_id}/chat/{channelId}/message
    MQTT-->>Mother: دفع الرسالة فوراً
    Mother->>Ktor: POST /families/{id}/channels/{channelId}/read {last_read_seq}
    Ktor-->>Father: تحديث الحالة (صحا القراءة)
```

- نفس `client_message_id` مرتين تُعيد الرسالة الأصلية بلا تكرار (§7-6)؛ والترتيب بـ `server_seq_id` لكل قناة (§6-3).

### 3-ب. فتح قناة الوالدين وإرسال رسالة E2E (REQ-003/011 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant Kotlin as K
    participant الخادم as Ktor
    Father->>App: فتح قناة الوالدين
    App->>K: طلب PIN الأب (بوابة الوالدين — Q-065)
    Father->>K: إدخال PIN
    K->>Ktor: التحقق من PIN (S1-01 — بوابة الوالدين)
    Ktor-->>K: PIN صحيح
    K-->>App: فتح القناة + مفاتيح E2E من Android Keystore
    App->>Ktor: GET /families/{id}/channels/{channelId}/messages
    Ktor-->>App: سجل الرسائل (نص مشفر E2E فقط)
    App->>App: فك التشفير محلياً — الخادم لا يرى المحتوى أبداً
    Father->>App: كتابة رسالة خاصة
    App->>K: تشفير E2E محلياً
    K-->>App: حمولة مشفرة
    App->>Ktor: POST /families/{id}/channels/{channelId}/messages (حمولة مشفرة)
    Ktor->>Ktor: حمولة غير مشفرة تُرفض CHAT_E2E_REQUIRED (§7-5)
    Ktor-->>App: الرسالة + server_seq_id
```

- على جهاز الطفل: القناة غير موجودة أصلاً — لا في القائمة ولا في البحث — ولا معاينة محتوى في الإشعارات (REQ-003).

### 3-ج. دون اتصال — الصندوق الصادر والتسليم التسلسلي (REQ-014 — §4.1/§4.3)

```mermaid
sequenceDiagram
    autonumber
    actor الطفل as Child
    participant التطبيق as App
    participant Drift as Drift
    participant Kotlin as K
    participant الخادم as Ktor
    Child->>App: كتابة رسالة دون اتصال
    App->>Drift: حفظ في الصندوق الصادر (علامة ساعة)
    App-->>Child: الرسالة تظهر فوراً — تبقى في Outbox
    Note over App,K: عند عودة الشبكة — startChatSync()
    App->>K: startChatSync()
    K->>Drift: قراءة الرسائل المعلقة تسلسلياً
    K->>Ktor: POST /families/{id}/channels/{channelId}/messages — دفعة مضغوطة Brotli
    Ktor-->>K: الرسائل + server_seq_id (بلا تكرار — client_message_id)
    K->>Drift: تحديث الحالات (صح التسليم)
    K-->>Child: التسليم مكتمل
    alt رسالة فاشلة عند عودة الاتصال
        K-->>Child: تبقى معلقة مع زر إعادة المحاولة (§7-7)
    end
```

- وضع النطاق المنخفض (Q-064): ضغط Brotli + تسليم تسلسلي بلا تكرار (§2 8-5).

### 3-د. حذف رسالة للجميع وإغلاق محادثة قاصر (REQ-004/009 — §4.1 + §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant الخادم as Ktor
    participant MQTT as MQTT
    participant التدقيق as Audit
    Father->>App: اختيار "حذف للجميع" على رسالة
    App->>Ktor: DELETE /families/{id}/channels/{channelId}/messages/{messageId}
    Ktor->>Ktor: فحص chat.message.delete.any (S1-03 — قابل للتفويض Q-010)
    Ktor->>Ktor: deleted_for = all + deleted_at
    Ktor->>Audit: AuditEvent (نطاق chat)
    Ktor->>MQTT: family/{family_id}/chat/{channelId}/deleted
    MQTT-->>App: مزامنة الحذف على كل الأجهزة
    App-->>Father: مكان الرسالة "حُذفت هذه الرسالة"
    Father->>App: إغلاق محادثة قاصر (محتوى غير مناسب)
    App->>Ktor: POST /families/{id}/channels/{channelId}/close {reason}
    Ktor->>Ktor: فحص chat.channel.close + closed_at / closed_by
    Ktor->>Audit: AuditEvent (نطاق chat)
    Ktor-->>App: {channel_id, closed: true}
    App-->>Father: المحادثة مغلقة
    Note over App,Ktor: أي إرسال لاحق فيها → CHAT_CLOSED + سبب الإغلاق (§7-3)
```

- العضو يحذف رسائله لنفسه فقط (`deleted_for = self`)؛ وحذف رسالة محذوفة أصلاً يُعيد النتيجة نفسها (idempotent — §7-8).

### 3-هـ. استرداد سجل قناة الوالدين على جهاز جديد (REQ-017 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant الجهاز as Device
    participant الخادم as Ktor
    Father->>Device: فتح قناة الوالدين على جهاز جديد
    Device->>Ktor: مصادقة الأب (PIN + OTP)
    alt المصادقة ناجحة
        Ktor-->>Device: النسخة المشفرة (payload) + parents_key_backup.encrypted_key
        Device->>Device: اشتقاق مفتاح الاسترداد من PIN (Argon2id — kdf_params)
        Device->>Device: فك مفتاح القناة ثم فك السجل محلياً
        Device-->>Father: سجل قناة الوالدين مستعاد — الخادم لم يرَ المحتوى أبداً
    else تعذرت المصادقة تماماً
        Ktor-->>Device: رفض — السجل غير قابل للاسترداد
        Device-->>Father: رسالة صريحة: لا وعد كاذب (§7-12)
    end
```

- النسخة المشفرة ومفتاحها المشفر لا يُسلَّمان إلا بعد مصادقة الأب (PIN + OTP) (§6-2)؛ وإعادة تعيين PIN (Q-077) تُعيد تغليف مفتاح الاسترداد (§6-3).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الستة (§2)

```mermaid
flowchart TD
    Start([فتح الدردشة — قائمة القنوات مصفاة حسب الرؤية والمنح]) --> Pick{اختيار قناة؟}
    Pick -->|مجلس العائلة| Lounge[مجلس العائلة — للجميع]
    Pick -->|قناة الوالدين| Pin[طلب PIN الأب]
    Pick -->|ثنائية| Direct[محادثة ثنائية — أي عضو مع أي عضو]
    Pin --> PinOK{PIN صحيح؟}
    PinOK -->|لا| Deny[رفض — القناة لا تظهر للقاصرين أصلاً]
    PinOK -->|نعم| E2E[فتح قناة الوالدين — E2E + بلا معاينة في الإشعارات]
    Lounge --> Write[كتابة رسالة — نص / إيموجي / صورة / صوت]
    Direct --> Write
    E2E --> Write
    Write --> Media{وسائط؟}
    Media -->|صورة > 10MB أو صوت > 5MB| TooBig[رفض CHAT_MEDIA_TOO_LARGE + الحد ظاهر]
    Media -->|لا / ضمن الحد| Show[ظهور فوري محلي <10ms — علامة ساعة]
    Show --> Conn{اتصال؟}
    Conn -->|لا| Outbox[تبقى في الصندوق الصادر]
    Outbox --> Back[عودة الشبكة — تسليم تسلسلي بلا تكرار — ضغط Brotli]
    Back --> Sent
    Conn -->|نعم| Sent[إرسال للخادم — صح التسليم]
    Sent --> Read{قُرئت؟}
    Read -->|نعم| ReadOK[صحا القراءة]
    Read -->|لا| Sent
    Show --> Classify{رسالة طفل؟}
    Classify -->|نعم| Check[المصنف الخفيف يفحص — تنمر / محتوى خطر؟]
    Check -->|خطر| Alert[تنبيه فوري للأب — مع نص الرسالة]
    Check -->|سليم| Sent
    Classify -->|لا| Sent
    Sent --> FatherAct{الأب يرى محتوى غير مناسب؟}
    FatherAct -->|حذف| Del["حذف للجميع — من الخادم وكل الأجهزة — «حُذفت هذه الرسالة»"]
    FatherAct -->|إغلاق محادثة قاصر| Close[إغلاق المحادثة — أي إرسال لاحق CHAT_CLOSED]
    FatherAct -->|لا| Stay[البقاء في القناة — مؤشرات كتابة حية]
    TooBig --> Write
    Deny --> Start
```

- ملاحظة: محادثة أي قاصر مرئية للأب دائماً (REQ-004)؛ ومؤشرات الكتابة تظهر فقط لأعضاء القناة (§6-3)؛ ولا حذف تلقائي أبداً — الاحتفاظ دائم حتى يحذف الأب (REQ-015).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–6.0، والمخازن D1–D5. المخازن جداول خادم (PostgreSQL) مع نسخة محلية في Drift على العميل (`channel` + `message`)؛ ووسائط `media` تُخزن في MinIO (Q-058) ومرجعها فقط في قاعدة البيانات.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4.1 تظهر هنا على الأقل: `GET /families/{id}/channels` (قائمة القنوات — REQ-001، تُقرأ عبر P1) · `POST /families/{id}/channels` (إنشاء قناة ثنائية/جماعية — REQ-002، تمر عبر P1؛ وقناة الوالدين تُنشأ مع العائلة لا هنا)؛ وبقية النقاط مرسومة في §3 (messages إرسال/قراءة/حذف، read، close).

```mermaid
flowchart LR
    Father([الأب / البالغ])
    Minor([الطفل / المراهق])
    S102([نظام الهوية S1-02])
    S103([نظام الصلاحيات S1-03])
    S109([مركز الأوامر S1-09])
    MinIO([MinIO — وسائط])
    MQTT([وسيط MQTT])
    Kotlin([وحدة Kotlin — Keystore + مزامنة])

    subgraph Chat [الدردشة S1-08]
        P1(1.0 إدارة القنوات — إنشاء / عرض / إغلاق)
        P2(2.0 إرسال واستقبال الرسائل)
        P3(3.0 التشفير — Envelope / E2E + الاسترداد)
        P4(4.0 الإشراف — رؤية القاصرين + المصنف)
        P5(5.0 الصندوق الصادر دون اتصال)
        P6(6.0 الحذف والمزامنة)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 channel)]
        D2[(D2 channel_member)]
        D3[(D3 message)]
        D4[(D4 media)]
        D5[(D5 parents_key_backup)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent])

    S102 -->|العضوية| P1
    S103 -->|مفاتيح chat.*| P1
    S103 -->|مفاتيح chat.*| P2
    Father -->|إنشاء / إغلاق قناة| P1
    Minor -->|بدء ثنائية| P1
    P1 -->|حفظ القناة| D1
    D1 -->|قائمة القنوات المصفاة| P1
    P1 -->|القنوات| Father
    Father -->|رسالة| P2
    Minor -->|رسالة| P2
    P2 -->|فحص العضوية| D2
    D2 -->|last_read_seq| P2
    P2 -->|حفظ الرسالة| D3
    D3 -->|سجل الرسائل| P2
    P2 -->|رسالة جديدة| MQTT
    MQTT -->|دفع فوري| Father
    MQTT -->|دفع فوري| Minor
    P2 -->|وسائط| MinIO
    MinIO -->|storage_ref| D4
    D4 -->|مرجع الوسيط| D3
    P3 -->|مفاتيح Envelope| D3
    P3 -->|مفتاح القناة المشفر| D5
    D5 -->|encrypted_key + kdf_params| P3
    Kotlin -->|مفاتيح E2E — Keystore| P3
    P3 -->|حمولة مشفرة| P2
    P4 -->|قراءة رسائل الأطفال| D3
    P4 -->|تنبيه تنمر / خطر| S109
    Father -->|رؤية محادثات القاصرين| P4
    P4 -->|محادثات القاصرين| Father
    Minor -->|رسالة دون اتصال| P5
    P5 -->|تسليم تسلسلي — Brotli| Ktor
    Ktor -->|server_seq_id| P5
    P5 -->|حفظ محلي — Drift| D3
    Father -->|حذف للجميع| P6
    P6 -->|deleted_for = all| D3
    P6 -->|حدث حذف| MQTT
    P6 -->|تسجيل الحذف / الإغلاق| Audit
    P1 -->|إغلاق محادثة قاصر| Audit
    P6 -->|ودجة أحدث الرسائل — قناة الوالدين عدد فقط| S109
```

- ودجة S1-09 "أحدث الرسائل" تعرض آخر رسائل القنوات العائلية حسب المنح؛ وقناة الوالدين تظهر كعدد فقط بلا محتوى (REQ-016).

## 6. مخطط النشاط (Activity) — دورة حياة الرسالة من الإرسال إلى الإشراف

المسارات الأربعة (المرسل / التطبيق / وحدة Kotlin / الخادم) كمسارات متوازية — من §2/§7: العرض المتفائل (REQ-006)، حالات التسليم والقراءة (REQ-007)، مؤشرات الكتابة (REQ-008)، فحص المصنف لرسائل الأطفال (REQ-012)، رؤية القاصرين وإغلاق الأب (REQ-013/004)، والحذف (REQ-009). والأنشطة الخلفية (المزامنة الخلفية للصندوق الصادر + دفع MQTT + فحص المصنف) تعمل **بالتوازي** مع استخدام الدردشة.

```mermaid
flowchart LR
    subgraph Sender [المرسل — أي عضو]
        direction TB
        U1([فتح قناة])
        U2[كتابة رسالة]
        U3[إرسال]
        U4([رؤية صح التسليم / القراءة])
        U5[حذف رسالة لنفسي]
    end
    subgraph App [التطبيق — Flutter + Drift]
        direction TB
        A1[عرض القنوات المصفاة حسب الرؤية والمنح]
        A2{قناة الوالدين؟}
        A3[طلب PIN الأب]
        A4[حفظ محلي متفائل — client_message_id — علامة ساعة]
        A5[تحديث الحالة بـ server_seq_id]
        A6[عرض مؤشر كتابة حي]
        A7["عرض «حُذفت هذه الرسالة»"]
    end
    subgraph Kotlin [وحدة Kotlin]
        direction TB
        K1[تشفير E2E — مفاتيح في Keystore]
        K2[خدمة مزامنة خلفية — startChatSync]
        K3[حالة الصندوق الصادر — getOutboxStatus]
    end
    subgraph Server [الخادم — Ktor + MQTT + MinIO + المصنف]
        direction TB
        V1[فحص العضوية والمنح chat.*]
        V2[حفظ الرسالة — Envelope / E2E]
        V3[رفع الوسائط — MinIO — 10MB صور / 5MB صوت]
        V4[دفع MQTT — رسالة / كتابة / حذف]
        V5[المصنف الخفيف — رسائل الأطفال فقط]
        V6[تنبيه الأب — عبر S1-09]
        V7[حذف / إغلاق + AuditEvent]
    end
    subgraph Father [الأب — الإشراف]
        direction TB
        F1[رؤية محادثات القاصرين]
        F2{محتوى غير مناسب؟}
        F3[حذف للجميع / إغلاق المحادثة]
        F4[تلقي تنبيه المصنف وتجاهله أو التصرف]
    end

    U1 --> A1
    A1 --> A2
    A2 -->|نعم| A3
    A2 -->|لا| U2
    A3 --> U2
    U2 --> U3
    U3 --> A4
    A4 --> K1
    K1 --> V1
    V1 --> V2
    V2 --> V3
    V2 --> V4
    V4 --> A5
    A5 --> U4
    A4 --> K2
    K2 --> V1
    K2 --> K3
    V2 --> V5
    V5 --> V6
    V6 --> F4
    V4 --> A6
    F1 --> F2
    F2 -->|نعم| F3
    F3 --> V7
    V7 --> V4
    V4 --> A7
    U5 --> V7
```

- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس القناة والمسودة (S1-01 §7 — سلوك الغلاف، يسري على كل الأنظمة)؛ والرسائل الفاشلة في الصندوق الصادر تبقى معلقة حتى تنجح أو يحذفها مرسلها (§6-3).
