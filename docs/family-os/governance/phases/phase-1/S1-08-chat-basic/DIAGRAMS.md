# S1-08: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** #6 التواصل (Messaging) — `CONTEXT-MAP.md` §2 صف 6
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-007 · Q-010 · Q-058 · Q-064 · Q-065 · Q-077 · Q-081 · Q-082 · Q-083 · Q-099 · Q-100 · Q-140 · Q-165 · D-011 · D-019 · D-020 · D-021 · D-023 · D-038 · G-006 · G-007 · G-011 · Q-134 (هيكل الملف)
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

15 حالة استخدام من السيناريوهات الستة والمتطلبات (§2/§3 — REQ-001…REQ-017؛ وREQ-010 وREQ-015 بلا حالة استخدام لأنهما بلا واجهة — يُغطَّيان في §9-5 — وREQ-016 سطحه في S1-09 لا حالة استخدام له هنا): أي عضو يراسل أي عضو، الأب يرى محادثات القاصرين ويغلقها، والبالغ المفوَّض يراها حسب قالب التفويض (REQ-013 — `chat.minor.view`)، قناة الوالدين للبالغين فقط بـ PIN الأب ومخفية عن أجهزة الأطفال، والمصنف الخفيف على الخادم (Q-165) يحرس كل رسائل محادثات الأطفال دون 13 سنة بالاتجاهين (Q-292) دائماً، وكل رسائل محادثات المراهقين 13–17 سنة بالاتجاهين بمفتاح تحكم لكل عائلة يملكه مالك العائلة والافتراضي تشغيل (Q-083 كما عدّله Q-140). والتسليم إلى أنظمة الهوية (S1-02) والصلاحيات (S1-03) ومركز الأوامر (S1-09) ممثل كجهات خارجية.

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
    MQTT([وسيط MQTT — Mosquitto 2.x — 8883 + mTLS])

    subgraph S108 [S1-08: الدردشة العائلية الأساسية]
        direction TB
        UC1(إرسال رسالة — نص / إيموجي / صورة / صوت)
        UC2(قراءة رسائل قناة)
        UC3(إنشاء قناة ثنائية)
        UC3b(إنشاء قناة جماعية)
        UC4(فتح قناة الوالدين — PIN الأب)
        UC5(إرسال رسالة في قناة الوالدين — E2E)
        UC6(عرض محادثات القاصرين — الأب كاملة / المفوَّض حسب القالب)
        UC7(إغلاق محادثة قاصر)
        UC8(حذف رسالة للجميع)
        UC9(حذف رسالة لنفسي)
        UC10(إرسال دون اتصال — الصندوق الصادر)
        UC11(استرداد سجل قناة الوالدين — PIN + OTP)
        UC12(تلقي تنبيه المصنف عن رسالة قاصر — دون 13 / 13–17 بمفتاح الأب)
        UC13(تأكيد القراءة)
        UC14(رؤية مؤشر كتابة حي)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC3b
    Father --> UC4
    Father --> UC5
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC10
    Father --> UC11
    Father --> UC12
    Father --> UC13
    Father --> UC14
    Adult --> UC1
    Adult --> UC2
    Adult --> UC3
    Adult --> UC3b
    Adult --> UC4
    Adult --> UC5
    Adult --> UC6
    Adult --> UC7
    Adult --> UC8
    Adult --> UC9
    Adult --> UC10
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

- ملاحظات: قناة الوالدين **لا تظهر أصلاً** على جهاز الطفل أو المراهق — لا في القائمة ولا في البحث (REQ-003)؛ والمراهق والطفل لا يغلقان محادثة ولا يحذفان رسالة للجميع أبداً (§6-1 — `chat.channel.close` و`chat.message.delete.any` للبالغين فقط — Q-010)؛ والبالغ المفوَّض يرى محادثات القاصرين حسب قالب التفويض فقط (REQ-013 — `chat.minor.view` — Q-089).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الخمسة من §5 كما هي، مع أربعة مراجع خارجية: العائلة والعضوية (S1-02)، ومفتاح الصلاحية (S1-03 — مفاتيح `chat.*`)، وتنبيهات المصنف (S1-09 — `alert`)، و`AuditEvent` (النواة المشتركة). ملاحظتان: النسخة المحلية من `channel` + `message` في Drift على العميل مخزن عميل لا جدول خادم (§5-6)، و`payload` في قناة الوالدين نص مشفر E2E فقط — الخادم لا يقرأ محتواها أبداً (REQ-011). كل جدول يحمل `family_id` + عزل RLS (D-021) — بما فيه `channel_member` (§5-2).

```mermaid
erDiagram
    family ||--o{ channel : "له قنوات"
    family ||--o{ channel_member : "له أعضاء قنوات"
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
        text kind
        text title
        uuid created_by
        timestamptz created_at
        timestamptz closed_at
        uuid closed_by
    }
    channel_member {
        uuid channel_id PK
        uuid member_id PK
        uuid family_id FK
        timestamptz joined_at
        bigint last_read_seq
    }
    message {
        uuid message_id PK
        uuid channel_id FK
        uuid family_id FK
        uuid sender_id
        uuid client_message_id
        bigint server_seq_id
        text kind
        jsonb payload
        uuid media_id FK
        text status
        timestamptz created_at
        text deleted_for
        timestamptz deleted_at
    }
    media {
        uuid media_id PK
        uuid family_id FK
        text mime
        int size_bytes
        text storage_ref
        text thumbnail_ref
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
        text key PK
    }
    alert {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
    }
```

- `channel.kind`: `lounge` / `parents` / `direct` / `group` (§5-1 — REQ-001/002) — قناة الوالدين واحدة تُنشأ مع العائلة ولا تُنشأ من نقطة الإنشاء (§6-2). `message.kind`: `text` / `emoji` / `image` / `voice` / `system` (§5-3 — REQ-005). `media.size_bytes`: الحد 10MB للصور / 5MB للرسائل الصوتية (Q-058). `message.status`: `sent` / `delivered` / `read` (§5-3 — REQ-007) — بلا `pending` (قيمة عميل فقط في Drift، لا تُخزَّن على الخادم). `message.deleted_for`: `all` (الأب) أو `self` (العضو) (§5-3 — REQ-009). `payload`: الحمولة المعماة Envelope للقنوات العائلية (REQ-010) وE2E لقناة الوالدين (REQ-011).

## 3. التسلسل (Sequence) — من عقود §4

ستة مخططات، كل واحد لتدفق واحد:
- **عقد MQTT (Q-168 — الإحالة الصريحة إلى `docs/family-os/governance/architecture/MQTT-BROKER-SPEC.md`):** الوسيط Eclipse Mosquitto 2.x — عقدة واحدة في المرحلة 1 — TLS 1.2+ على المنفذ 8883 + mTLS (شهادة خادم + شهادة جهاز)؛ ورسائل الدردشة (`family/{family_id}/chat/{channelId}/message` و`family/{family_id}/chat/{channelId}/typing` و`family/{family_id}/chat/{channelId}/deleted` و`family/{family_id}/chat/{channelId}/read` و`family/{family_id}/chat/{channelId}/created` و`family/{family_id}/chat/{channelId}/closed`) QoS 1 وبلا احتفاظ (retained=false — §4-2)؛ وبلا QoS 2؛ والعزل ببادئة `family/{family_id}/` + ACL خادمي؛ والشهادات سنتان مع تجديد تلقائي وإبطال فوري. لا `command_id` في هذا النظام — عدم التكرار هنا بـ `client_message_id` (§4-1).

### 3-أ. إرسال رسالة فورياً — العرض المتفائل ثم المزامنة (REQ-006/007 — §4.1 + §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Drift as Drift
    participant Ktor as الخادم
    participant MQTT as MQTT
    actor Mother as الأم
    Father->>App: كتابة رسالة وإرسالها
    App->>Drift: حفظ محلياً بـ client_message_id (علامة ساعة)
    App-->>Father: الرسالة تظهر فوراً (<10ms)
    App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/messages {client_message_id, kind, payload}
    Ktor->>Ktor: فحص الصلاحية chat.message.send (S1-03 — Q-010) + منع التكرار بـ client_message_id
    Ktor-->>App: الرسالة + server_seq_id
    App->>Drift: تحديث الحالة (صح التسليم) بـ server_seq_id
    Ktor->>MQTT: family/{family_id}/chat/{channelId}/message (QoS 1)
    MQTT-->>Mother: دفع الرسالة فوراً
    Mother->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/read {last_read_seq}
    Ktor-->>Mother: {ok: true}
    Ktor->>MQTT: family/{family_id}/chat/{channelId}/read (QoS 1)
    MQTT-->>Father: تحديث الحالة (صحا القراءة)
```

- نفس `client_message_id` مرتين تُعيد الرسالة الأصلية بلا تكرار (§7-6)؛ والترتيب بـ `server_seq_id` لكل قناة (§6-3). عند إعادة الاتصال: كشف الفجوات وإصلاحها عبر `GET .../messages` بقاعدة §4-2 (مقارنة آخر `server_seq_id` مرئي) — QoS 1 وحده لا يغلق فجوة جلسة ساقطة.

### 3-ب. فتح قناة الوالدين وإرسال رسالة E2E (REQ-003/011 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant K as Kotlin
    participant Ktor as الخادم
    participant Audit as التدقيق
    Father->>App: فتح قناة الوالدين
    App->>K: طلب PIN الأب (بوابة الوالدين — Q-065)
    Father->>K: إدخال PIN
    K->>K: التحقق من PIN محلياً (بوابة الوالدين — Q-142)
    K->>Audit: AuditEvent — إثبات تحقق ناجح (يدخل الصندوق الصادر كإدخال تدقيق عند عدم الاتصال — §6-3)
    K-->>App: فتح القناة + مفاتيح E2E من Android Keystore
    App->>Ktor: GET /api/v1/families/{id}/channels/{channelId}/messages ?before&limit (§4-1)
    Ktor-->>App: سجل الرسائل (نص مشفر E2E فقط)
    App->>App: فك التشفير محلياً — الخادم لا يرى المحتوى أبداً
    Father->>App: كتابة رسالة خاصة
    App->>K: تشفير E2E محلياً
    K-->>App: حمولة مشفرة
    App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/messages (حمولة مشفرة)
    Ktor->>Ktor: حمولة غير مشفرة تُرفض CHAT_E2E_REQUIRED (§7-5)
    Ktor-->>App: الرسالة + server_seq_id
```

- على جهاز الطفل: القناة غير موجودة أصلاً — لا في القائمة ولا في البحث — ولا معاينة محتوى في الإشعارات (REQ-003).

### 3-ج. دون اتصال — الصندوق الصادر والتسليم التسلسلي (REQ-014 — §4.1/§4.3)

```mermaid
sequenceDiagram
    autonumber
    actor Child as الطفل
    participant App as التطبيق
    participant Drift as Drift
    participant K as Kotlin
    participant Ktor as الخادم
    Child->>App: كتابة رسالة دون اتصال
    App->>Drift: حفظ في الصندوق الصادر (علامة ساعة)
    App-->>Child: الرسالة تظهر فوراً — تبقى في Outbox
    Note over App,K: عند عودة الشبكة — startChatSync()
    App->>K: getOutboxStatus() → {pending, failed} — MethodChannel (§4-3)
    App->>Drift: قراءة الرسائل المعلقة تسلسلياً
    App->>K: startChatSync() — تسليم قائمة المعلقة إلى خدمة المزامنة
    K->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/messages — رسالة واحدة (Content-Encoding: br عند النفع — §4-1)
    Ktor-->>K: الرسالة + server_seq_id (بلا تكرار — client_message_id)
    K-->>App: اكتمل التسليم
    App->>Drift: تحديث الحالات (صح التسليم)
    App-->>Child: التسليم مكتمل
    alt رسالة فاشلة عند عودة الاتصال
        K-->>Child: تبقى معلقة مع زر إعادة المحاولة (§7-7)
    end
```

- وضع النطاق المنخفض (Q-064): ضغط Brotli على جسم كل طلب عند النفع (بلا دفعة مجمّعة — §4-1 يعرّف POST واحداً لكل رسالة) + تسليم تسلسلي بلا تكرار (§2 8-5).

### 3-د. حذف رسالة للجميع وإغلاق محادثة قاصر (REQ-004/009 — §4.1 + §4.2)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant MQTT as MQTT
    participant Audit as التدقيق
    Father->>App: اختيار "حذف للجميع" على رسالة
    App->>Ktor: DELETE /api/v1/families/{id}/channels/{channelId}/messages/{messageId}
    Ktor->>Ktor: فحص chat.message.delete.any (S1-03 — قابل للتفويض Q-010)
    Ktor->>Ktor: deleted_for = all + deleted_at
    Ktor->>Audit: AuditEvent (نطاق chat)
    Ktor->>MQTT: family/{family_id}/chat/{channelId}/deleted (QoS 1)
    MQTT-->>App: مزامنة الحذف على كل الأجهزة
    App-->>Father: مكان الرسالة "حُذفت هذه الرسالة"
    Father->>App: إغلاق محادثة قاصر (محتوى غير مناسب)
    App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/close {reason}
    Ktor->>Ktor: فحص chat.channel.close (Q-010) + closed_at / closed_by
    Ktor->>Audit: AuditEvent (نطاق chat)
    Ktor->>MQTT: family/{family_id}/chat/{channelId}/closed (QoS 1)
    MQTT-->>App: إغلاق متزامن على كل الأجهزة
    Ktor-->>App: {channel_id, closed: true}
    App-->>Father: المحادثة مغلقة
    Note over App,Ktor: أي إرسال لاحق فيها → CHAT_CLOSED + سبب الإغلاق (§7-3)
    Father->>App: إعادة فتح المحادثة المغلقة
    App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/reopen {reason}
    Ktor->>Ktor: فحص الأب وحده (is_owner — Q-242)؛ ليست مفتاحاً قابلاً للتفويض — مفتاح chat.channel.close لا يكفي
    Ktor->>Ktor: closed_at / closed_by = null + reopened_at / reopened_by
    Ktor->>Audit: AuditEvent (نطاق chat)
    Ktor-->>App: {channel_id, closed: false}
    App-->>Father: أُعيد فتح المحادثة — عودة الإرسال
```

- محاولة إعادة فتح من بالغ مفوَّض (أو مراهق/طفل) → `403` + تسجيل في التدقيق (§7-14)؛ وإعادة الفتح لا تعيد رسائل محذوفة — الحذف دائم بلا تراجع، والإغلاق وحده قابل للعكس (Q-242).

- العضو يحذف رسائله لنفسه فقط (`deleted_for = self`)؛ وحذف رسالة محذوفة أصلاً يُعيد النتيجة نفسها (idempotent — §7-8).

### 3-هـ. استرداد سجل قناة الوالدين على جهاز جديد (REQ-017 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant Device as الجهاز
    participant Ktor as الخادم
    Father->>Device: فتح قناة الوالدين على جهاز جديد
    Device->>Ktor: POST /api/v1/families/{id}/parents-channel/recovery/request-otp — إصدار OTP بغرض recovery (موجّه S1-02 — Q-021)
    Ktor-->>Device: {otp_sent_via, expires_in_sec: 300}
    Father->>Device: إدخال OTP (6 خانات — FosOtpField)
    Device->>Ktor: POST /api/v1/families/{id}/parents-channel/backup {otp} — مصادقة الأب (OTP إلى الخادم + PIN محلي لاشتقاق المفتاح — §4-1، بلا مفتاح chat.*)
    alt OTP صحيح
        Ktor-->>Device: النسخة المشفرة (payload) + parents_key_backup.encrypted_key
        Device->>Device: اشتقاق مفتاح الاسترداد من PIN (Argon2id — kdf_params)
        Device->>Device: فك مفتاح القناة ثم فك السجل محلياً
        Device-->>Father: سجل قناة الوالدين مستعاد — الخادم لم يرَ المحتوى أبداً
    else OTP خاطئ
        Ktor-->>Device: CHAT_RECOVERY_OTP_INVALID — لا نسخة تُسلَّم
        Device-->>Father: OTP خاطئ — أعد الإدخال (5 محاولات خاطئة ← قفل 15 دقيقة)
    else تعذرت المصادقة تماماً
        Ktor-->>Device: رفض — السجل غير قابل للاسترداد
        Device-->>Father: رسالة صريحة: لا وعد كاذب (§7-12)
    end
```

- النسخة المشفرة ومفتاحها المشفر لا يُسلَّمان إلا بعد مصادقة الأب (PIN + OTP) (§6-2)؛ وإعادة تعيين PIN (Q-077) تُعيد تغليف مفتاح الاسترداد (§6-3).

### 3-و. إرسال صورة/صوت — رفع عبر Ktor ثم إرسال بـ media_id (REQ-005 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor Member as العضو
    participant App as التطبيق
    participant Ktor as الخادم
    participant MinIO as MinIO
    participant MQTT as MQTT
    Member->>App: اختيار صورة / تسجيل صوت
    alt صورة > 10MB أو صوت > 5MB
        App-->>Member: رفض CHAT_MEDIA_TOO_LARGE + الحد ظاهر
    else ضمن الحد
        App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/media (multipart {file}) — الرفع عبر Ktor لا برابط موقّع مباشر
        Ktor->>MinIO: كتابة البايتات (في قناة الوالدين: البايتات مشفرة E2E على الجهاز قبل الرفع — الخادم لا يرى المحتوى)
        MinIO-->>Ktor: storage_ref
        Ktor-->>App: {media_id, storage_ref, size_bytes}
        App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/messages {client_message_id, kind, payload, media_id}
        Ktor->>MQTT: family/{family_id}/chat/{channelId}/message (QoS 1)
        Ktor-->>App: الرسالة + server_seq_id
        App-->>Member: ظهور الرسالة مع الوسائط
    end
```

- `media_id` إلزامي عند `kind` صورة/صوت؛ و`payload` ظرف مشفَّر فقط — لا بايتات وسائط فيه (§4-1)؛ ومخرج `GET .../messages` يسرد `server_seq_id` و`media_id` و`deleted_for` لكل رسالة.

### 3-ز. إرسال في محادثة قاصر — بوابة المصنف والحظر قبل التسليم (REQ-012 — Q-292 · Q-293 · Q-294)

```mermaid
sequenceDiagram
    autonumber
    actor Adult as البالغ
    participant App as التطبيق
    participant Ktor as الخادم
    participant Classifier as المصنف الخفيف (خادم — Q-165)
    participant MQTT as MQTT
    participant S109 as مركز الأوامر S1-09
    Adult->>App: كتابة رسالة إلى قاصر وإرسالها
    App->>Ktor: POST /api/v1/families/{id}/channels/{channelId}/messages {client_message_id, kind, payload}
    Ktor->>Ktor: فحص الصلاحية chat.message.send (S1-03 — Q-010) + منع التكرار بـ client_message_id
    Ktor->>Classifier: فحص الرسالة — المحادثة تضم قاصراً (Q-292) — نص + صور (Q-293)
    alt فئة خطيرة — حظر قبل التسليم (Q-294)
        Classifier-->>Ktor: فئة خطيرة (محتوى جنسي يخص قاصراً / تشجيع إيذاء النفس / استدراج)
        Ktor->>Ktor: حفظ الرسالة موسومة محظورة — بلا نشر ولا ظهور في سجل القناة
        Ktor->>S109: تنبيه المصنف للأب — الفئة + الخطورة + معرّف الرسالة (CH-06 — قائمة المراجعة)
        Ktor-->>App: محظورة قبل التسليم — في قائمة مراجعة الأب
    else خطر غير الفئات الخطيرة — تُسلَّم ثم يُنبَّه الأب
        Classifier-->>Ktor: خطر غير خطير
        Ktor->>MQTT: family/{family_id}/chat/{channelId}/message (QoS 1)
        Ktor->>S109: تنبيه للأب — الفئة + الخطورة + معرّف الرسالة فقط
    else سليم
        Classifier-->>Ktor: سليم
        Ktor->>MQTT: family/{family_id}/chat/{channelId}/message (QoS 1)
    end
```

- رسالة بالغ إلى قاصر تُفحص كرسالة القاصر نفسه (Q-292 — بالاتجاهين)؛ والمحظور لا يُسلَّم ولا يُسقط — يبقى في قائمة المراجعة 30 يوماً حتى يقرر الأب (Q-294 · Q-295 · Q-296).

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
    Sent --> Classify{"المحادثة تضم قاصراً؟ — الفحص على الخادم (Q-165 · Q-292)"}
    Classify -->|قاصر دون 13: فحص دائم| Check["المصنف الخفيف على الخادم يفحص النص والصور — تنمر / محتوى خطر؟ (الصوت بلا فحص في المرحلة 1 — Q-293)"]
    Classify -->|مراهق 13–17: مفتاح مالك العائلة| KeyOn{مفتاح التحكم مفعّل؟ — الافتراضي تشغيل}
    KeyOn -->|نعم| Check
    KeyOn -->|لا| NoCheck[بلا فحص — مفتاح المراهقين موقوف]
    Classify -->|بلا قاصر: بلا فحص| NoCheck
    Check -->|فئة خطيرة: حظر قبل التسليم| Blocked["محظورة قبل التسليم — لا تصل لأي مستلم؛ تذهب لقائمة مراجعة يراها الأب ولا تُسقط بصمت (Q-294)"]
    Check -->|خطر غير الفئات الخطيرة: تُسلَّم ثم يُنبَّه الأب| Alert[تنبيه فوري للأب عبر S1-09 — الفئة + الخطورة + معرّف الرسالة فقط]
    Check -->|سليم| NoCheck
    Blocked --> Alert
    Alert --> Review["الأب يراجع الرسالة المحظورة في تنبيه المصنف CH-06 (Q-296)"]
    Review -->|إيجاب كاذب — تجاهل التنبيه| Dismiss["تجاهل مسجَّل كبيانات وصفية فقط — الرسالة تبقى في قائمة المراجعة 30 يوماً ثم حذف صلب (Q-295 · Q-296)"]
    Review -->|تأكيد — إغلاق المحادثة| Close
    Sent --> FatherAct{الأب يرى محتوى غير مناسب؟}
    FatherAct -->|حذف| Del["حذف للجميع — تُستبدل بعلامة «حُذفت هذه الرسالة» على كل الأجهزة؛ والصف محذوف برمجياً حتى التطهير (Q-295: المُعلَّم 30 يوماً ثم حذف صلب؛ وغير المُعلَّم خلال 7 أيام)"]
    FatherAct -->|إغلاق محادثة قاصر| Close[إغلاق المحادثة — أي إرسال لاحق CHAT_CLOSED]
    FatherAct -->|لا| Stay[البقاء في القناة — مؤشرات كتابة حية]
    TooBig --> Write
    Deny --> Start
```

- ملاحظة: محادثة أي قاصر مرئية للأب دائماً (REQ-004)؛ ومؤشرات الكتابة تظهر فقط لأعضاء القناة (§6-3)؛ ولا حذف تلقائي أبداً — الاحتفاظ دائم حتى يحذف الأب (REQ-015).
- حدود المصنف (Q-165 — REQ-012): آلي فقط — لا قراءة بشرية للمحتوى في أي مسار؛ ولا يُخزَّن نص بعد الفحص — التنبيه يحمل الفئة + الخطورة + معرّف الرسالة فقط، ويرى الأب النص من الرسالة المخزنة بموجب رؤيته الإشرافية (Q-100) لا من نسخة في التنبيه؛ ولا استخدام للمحتوى المفحوص لغير التنبيه — لا تدريب نماذج عليه ولا مشاركة مع طرف ثالث؛ وقناة الوالدين E2E بلا فحص أبداً؛ ويُفصَح عن الفحص الآلي في الإعداد المشترك (C-09). والنطاق (Q-292): كل رسائل محادثات القاصر بالاتجاهين — ما يرسله وما يصله. والوسيلة (Q-293): نص + صور في المرحلة 1 (عبر بوابة الذكاء)؛ وتحويل الصوت لنص مؤجل للمرحلة 2. والتوقيت (Q-294): حظر قبل التسليم للفئات الخطيرة فقط (محتوى جنسي يخص قاصراً، تشجيع إيذاء النفس، أنماط استدراج)؛ وتنبيه للأب لما عداها؛ والمحظور يذهب لقائمة مراجعة يراها الأب ولا يُسقط بصمت أبداً. ومسار الإيجاب الكاذب (Q-296): نافذة المراجعة 30 يوماً كما في Q-295 ثم حذف صلب؛ وبعدها الرسالة غير متاحة للعرض.
- قائمة المراجعة (Q-294) ليست مخزناً منفصلاً: هي الرسائل المحظورة المعروضة في تنبيه المصنف CH-06 + تنبيه S1-09 — والأب يقرر بشأنها (تجاهل التنبيه أو إغلاق المحادثة)؛ ولا تُسقط بصمت أبداً.

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D5. المخازن جداول خادم (PostgreSQL) مع نسخة محلية في Drift على العميل (`channel` + `message`)؛ ووسائط `media` تُخزن في MinIO (Q-058) ومرجعها فقط في قاعدة البيانات.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4.1 تظهر هنا على الأقل: `GET /api/v1/families/{id}/channels` (قائمة القنوات — REQ-001، تُقرأ عبر P1) · `POST /api/v1/families/{id}/channels` (إنشاء قناة ثنائية/جماعية — REQ-002، تمر عبر P1؛ وقناة الوالدين تُنشأ مع العائلة لا هنا)؛ وبقية النقاط مرسومة في §3 (messages إرسال/قراءة/حذف، read، close).

```mermaid
flowchart LR
    Father([الأب / البالغ])
    Minor([الطفل / المراهق])
    S102([نظام الهوية S1-02])
    S103([نظام الصلاحيات S1-03])
    S109([مركز الأوامر S1-09])
    MinIO([MinIO — وسائط])
    MQTT([وسيط MQTT — Mosquitto 2.x — 8883 + mTLS])
    Kotlin([وحدة Kotlin — Keystore + مزامنة])

    subgraph Chat [الدردشة S1-08]
        P1(1.0 إدارة القنوات — إنشاء / عرض / إغلاق)
        P2(2.0 إرسال واستقبال الرسائل)
        P3(3.0 التشفير — Envelope / E2E + الاسترداد)
        P4(4.0 الإشراف — رؤية القاصرين + المصنف على الخادم: دون 13 دائماً / 13–17 بمفتاح الأب)
        P5(5.0 الصندوق الصادر دون اتصال)
        P6(6.0 الحذف والمزامنة)
        P7(7.0 تطهير الاحتفاظ — مهمة مجدولة)
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
    S103 -->|"مفاتيح chat.* (Q-010)"| P1
    S103 -->|"مفاتيح chat.* (Q-010)"| P2
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
    P2 -->|"رسالة جديدة — family/{family_id}/chat/{channelId}/message — QoS 1"| MQTT
    P2 -->|"مؤشر كتابة — family/{family_id}/chat/{channelId}/typing — QoS 1"| MQTT
    P2 -->|"إيصال قراءة — family/{family_id}/chat/{channelId}/read — QoS 1"| MQTT
    P1 -->|"إنشاء/إغلاق قناة — family/{family_id}/chat/{channelId}/created | .../closed — QoS 1"| MQTT
    MQTT -->|دفع فوري| Father
    MQTT -->|دفع فوري| Minor
    P2 -->|بايتات الوسائط| Ktor
    Ktor -->|كتابة البايتات| MinIO
    MinIO -->|storage_ref| D4
    D4 -->|مرجع الوسيط| D3
    P3 -->|مفاتيح Envelope| D3
    P3 -->|مفتاح القناة المشفر| D5
    D5 -->|encrypted_key + kdf_params| P3
    Kotlin -->|مفاتيح E2E — Keystore| P3
    P3 -->|حمولة مشفرة| P2
    P4 -->|"قراءة رسائل القاصرين — دون 13 دائماً / 13–17 بمفتاح الأب (Q-165)"| D3
    P4 -->|تنبيه تنمر / خطر| S109
    Father -->|"رؤية محادثات القاصرين — الأب كاملة / البالغ المفوَّض ضمن القالب (REQ-013 — chat.minor.view — Q-010)"| P4
    P4 -->|محادثات القاصرين — حسب القالب| Father
    Minor -->|رسالة دون اتصال| P5
    P5 -->|تسليم تسلسلي — Brotli| Ktor
    Ktor -->|server_seq_id| P5
    P5 -->|حفظ محلي — Drift| D3
    Father -->|حذف للجميع| P6
    P6 -->|deleted_for = all| D3
    P6 -->|"حدث حذف — family/{family_id}/chat/{channelId}/deleted — QoS 1"| MQTT
    P6 -->|تسجيل الحذف / الإغلاق| Audit
    P1 -->|إغلاق محادثة قاصر| Audit
    P6 -->|ودجة أحدث الرسائل — قناة الوالدين عدد فقط| S109
    D3 -->|"رسائل محذوفة برمجياً — المُعلَّم 30 يوماً / غير المُعلَّم 7 أيام (Q-295)"| P7
    P7 -->|حذف صلب| D3
```

- ودجة S1-09 "أحدث الرسائل" تعرض آخر رسائل القنوات العائلية حسب المنح؛ وقناة الوالدين تظهر كعدد فقط بلا محتوى (REQ-016).

## 6. مخطط النشاط (Activity) — دورة حياة الرسالة من الإرسال إلى الإشراف

المسارات الستة (المرسل / التطبيق / وحدة Kotlin / الخادم / الأب / البالغ المفوَّض) كمسارات متوازية — من §2/§7: العرض المتفائل (REQ-006)، حالات التسليم والقراءة (REQ-007)، مؤشرات الكتابة (REQ-008)، فحص المصنف لرسائل القاصرين على الخادم — دون 13 دائماً، و13–17 بمفتاح مالك العائلة والافتراضي تشغيل (REQ-012 — Q-083/Q-140/Q-165)؛ وحدود الفحص الخمسة (Q-165) في ملاحظة §4، رؤية القاصرين (الأب كاملة + البالغ المفوَّض حسب قالب التفويض — REQ-013) وإغلاق الأب (REQ-004)، والحذف (REQ-009). والأنشطة الخلفية (المزامنة الخلفية للصندوق الصادر + دفع MQTT + فحص المصنف) تعمل **بالتوازي** مع استخدام الدردشة.

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
        V1["فحص العضوية والمنح chat.* (Q-010)"]
        V2[حفظ الرسالة — Envelope / E2E]
        V3[رفع الوسائط — MinIO — 10MB صور / 5MB صوت]
        V4[دفع MQTT — رسالة / كتابة / حذف]
        V5["المصنف الخفيف على الخادم — دون 13 دائماً / 13–17 بمفتاح الأب (افتراضي تشغيل) — Q-083/Q-140/Q-165"]
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
    subgraph Delegated [البالغ المفوَّض — حسب قالب التفويض Q-089]
        direction TB
        D1["رؤية محادثات القاصرين ضمن القالب — chat.minor.view (Q-010)"]
    end

    U1 --> A1
    A1 --> A2
    A2 -->|نعم| A3
    A2 -->|لا| U2
    A3 --> U2
    U2 --> U3
    U3 --> A4
    A4 -->|قناة الوالدين فقط| K1
    K1 --> V1
    V1 --> V2
    V1 --> V3
    V3 --> V2
    V2 --> V4
    V4 --> A5
    A5 --> U4
    A4 --> K2
    A4 --> V1
    K2 --> V1
    K2 --> K3
    V2 --> V5
    V5 --> V6
    V6 --> F4
    V4 --> A6
    F1 --> F2
    D1 --> F2
    F2 -->|نعم| F3
    F3 --> V7
    V7 --> V4
    V4 --> A7
    U5 --> V7
```

- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس القناة والمسودة (S1-01 §7 — سلوك الغلاف، يسري على كل الأنظمة)؛ والرسائل الفاشلة في الصندوق الصادر تبقى معلقة حتى تنجح أو يحذفها مرسلها (§6-3). وكل مسار إرسال (عادي عبر A4، أو قناة والدين عبر K1، أو صندوق صادر عبر K2) يمر بفحص العضوية والمنح V1 قبل الحفظ V2؛ ورفع الوسائط (V3) شرط مسبق للحفظ (V2) في رسائل الوسائط (media_id مع الرسالة — 3-و)، لا تالٍ له.
