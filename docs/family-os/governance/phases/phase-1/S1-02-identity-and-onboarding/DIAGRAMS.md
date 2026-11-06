# S1-02: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط (حكم المالك 2026-11-06)؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط — حكم المالك 2026-11-06 · §9 في مرحلة التصميم Q-091)
- **القرارات الحاكمة:** Q-001 · Q-002 · Q-005 · Q-006 · Q-007 · Q-008 · Q-021 · Q-022 · Q-062 · Q-063 · Q-065 · Q-068 · Q-070 · Q-071 · Q-072 · Q-073 · Q-074 · Q-075 · Q-076 · Q-077 · Q-079 · Q-080 · Q-084 · D-006 · D-007 · D-023 · D-038 · G-006 · G-011
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

13 حالة استخدام من السيناريوهات السبعة والمتطلبات (§2/§3): الأب ينشئ العائلة وملفات الأطفال ويصدر رموز الإقران، البالغ ينضم بدعوة، الطفل يشارك في الإقران والموافقة المشتركة فقط (لا حساب له ولا بيانات اتصال — D-006)، والبصمة للأهل فقط. والإقران يحدد وضع جهاز الغلاف (S1-01)، والأدوار يحكمها نظام S1-03.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ])
    Child([الطفل / المراهق])
    Firebase([Firebase Auth — موصّل مصادقة])
    OTPCh([قنوات OTP: WhatsApp / SMS / مكالمة])
    S101([الغلاف S1-01])
    S103([نظام الأدوار S1-03])

    subgraph S102 [S1-02: الهوية والتهيئة العائلية]
        direction TB
        UC1(تسجيل الدخول بالهاتف + OTP)
        UC2(تسجيل الدخول بالبريد الإلكتروني)
        UC3(إنشاء عائلة جديدة)
        UC4(توليد رمز دعوة)
        UC5(الانضمام برمز دعوة / رابط عميق)
        UC6(إنشاء ملف طفل)
        UC7(اقتران جهاز طفل برمز 6 أحرف)
        UC8(الموافقة المشتركة أب + طفل)
        UC9(فتح سريع بالبصمة / الوجه)
        UC10(تفعيل TOTP داخل التطبيق)
        UC11(تجديد الجلسة / تسجيل الخروج)
        UC12(فك إقران جهاز)
        UC13(استرداد الحساب بعد فقدان الهاتف)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC9
    Father --> UC10
    Father --> UC11
    Father --> UC12
    Father --> UC13
    Adult --> UC1
    Adult --> UC2
    Adult --> UC5
    Adult --> UC9
    Adult --> UC11
    Child --> UC7
    Child --> UC8
    UC1 -.->|يتضمن| UC10
    UC1 --> OTPCh
    UC2 --> Firebase
    UC4 -.->|يُستخدم في| UC5
    UC7 --> S101
    UC7 -.->|يتضمن| UC8
    UC3 --> S103
    UC5 --> S103
    UC6 --> S103
```

- ملاحظتان: فك الإقران (UC12) للمالك فقط + PIN الأب (REQ-015/Q-065)؛ والبصمة (UC9) وضع الأهل فقط ولا تتجاوز بوابة الوالدين ولا تفتح وضع الطفل (REQ-016/Q-072).

## 2. مخطط قاعدة البيانات (ERD)

الجداول التسعة من §5 كما هي، مع مرجع خارجي واحد: `AuditEvent` (النواة المشتركة — كل حدث هوية/إقران يُسجَّل فيه). ملاحظات: `code_hash` و`pairing_code_hash` و`refresh_token_hash` مشفرة فقط — لا يُحفظ أي رمز نصاً أبداً؛ `person` بلا هاتف ولا بريد للطفل إطلاقاً (D-006)؛ `child_profile` بلا بيانات اتصال وسنة ميلاد فقط (Q-073). كل جدول يحمل `family_id` + عزل RLS (D-021).

```mermaid
erDiagram
    person ||--o{ membership : "عضو في"
    person ||--o{ session : "له جلسات"
    person ||--o{ phone_verification : "يتحقق برقمه"
    person ||--o{ family : "ينشئ"
    family ||--o{ membership : "لها أعضاء"
    family ||--o{ invite_code : "لها رموز دعوة"
    family ||--o{ child_profile : "لها ملفات أطفال"
    family ||--o{ device_pairing : "لها أجهزة مقترنة"
    family ||--o{ consent_record : "لها سجلات موافقة"
    membership ||--|| child_profile : "ملف الطفل يرجع إلى عضوية"
    invite_code }o--|| person : "أنشأه"
    device_pairing }o--|| person : "أقرانه"
    consent_record }o--|| person : "منحه"
    device_pairing ||--o{ AuditEvent : "أحداثه تُسجَّل"
    membership ||--o{ AuditEvent : "أحداثها تُسجَّل"
    consent_record ||--o{ AuditEvent : "تُسجَّل"

    person {
        string id PK
        string phone
        string email
        string display_name
        datetime created_at
    }
    phone_verification {
        string id PK
        string phone
        string channel
        string code_hash
        int attempts
        datetime expires_at
        datetime verified_at
    }
    session {
        string id PK
        string person_id FK
        string refresh_token_hash
        datetime expires_at
        datetime revoked_at
    }
    family {
        string id PK
        string name
        string region
        string created_by FK
        datetime created_at
    }
    membership {
        string id PK
        string family_id FK
        string person_id FK
        %% person_id فارغ للطفل — صف عضوية بالملف فقط بلا حساب person (Q-137)
        string role
        boolean is_owner
    }
    invite_code {
        string id PK
        string family_id FK
        string code
        string created_by FK
        datetime expires_at
        int uses
    }
    child_profile {
        string id PK
        string family_id FK
        string membership_id FK
        string nickname
        string avatar
        string color
        int birth_year
    }
    device_pairing {
        string id PK
        string family_id FK
        string device_id
        string pairing_code_hash
        string mode
        datetime paired_at
        string paired_by FK
    }
    consent_record {
        string id PK
        string family_id FK
        string type
        string granted_by FK
        datetime granted_at
    }
    AuditEvent {
        string id PK
    }
```

- ملاحظة: `membership.person_id` فارغ للطفل — صف عضوية بالملف فقط بلا حساب `person` (D-006 · Q-137)؛ والعلاقة مرسومة كما نصّ عليها §5 (`child_profile.membership_id`).

## 3. التسلسل (Sequence) — من عقود §4

ستة مخططات، كل واحد لتدفق واحد:

### 3-أ. تسجيل الدخول بالهاتف + OTP (REQ-001/002/003/004/005 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant العميل as Client
    participant الخادم as Ktor
    participant الموجّه as Router
    participant قنوات as Channels
    Father->>Client: إدخال رقم الهاتف
    Client->>Ktor: POST /api/v1/identity/otp/request {phone, region}
    Ktor->>Ktor: التحقق من الصيغة الدولية (REQ-019)
    Ktor->>Router: توجيه OTP — WhatsApp أولاً
    Router->>Channels: إرسال عبر WhatsApp
    alt فشل التوصيل
        Router->>Channels: تحويل تلقائي إلى SMS المجمّع
        alt فشل SMS
            Router->>Channels: تحويل تلقائي إلى مكالمة فائتة
        end
    end
    Channels-->>Father: وصول الرمز (صالح 5 دقائق)
    Father->>Client: إدخال الرمز (أو قراءة تلقائية من SMS حيث يدعم الجهاز)
    Client->>Ktor: POST /api/v1/identity/otp/verify {phone, code}
    alt الرمز صحيح
        Ktor-->>Client: {access_token, refresh_token, totp_enrolled}
        Client->>Ktor: POST /api/v1/identity/totp/enroll {}
        Ktor-->>Client: {secret, qr}
        Client-->>Father: دخول ناجح — جلسة 30 يوماً
    else الرمز خاطئ (أقل من 5)
        Ktor-->>Client: 401 رمز خاطئ
        Client-->>Father: رفض + المحاولات المتبقية
    else 5 أخطاء
        Ktor-->>Client: 423 مقفل مؤقتاً 15 دقيقة
        Client-->>Father: الطلب مقفل 15 دقيقة
    end
```

- إعادة الإرسال بعد 60 ثانية؛ بعد 5 طلبات فاشلة 429 (§4.1)؛ عند فشل كل القنوات: رسالة واضحة «تعذر الإرسال — حاول لاحقاً» ولا يُعرض الرمز على الشاشة أبداً (§7/سيناريو 2-5).

### 3-ب. تسجيل الدخول بالبريد الإلكتروني (REQ-022/023/024 — §4.1/§4.2)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant العميل as Client
    participant Firebase as FBAuth
    participant الخادم as Ktor
    Father->>Client: إدخال البريد الإلكتروني
    Client->>Client: التحقق من صيغة البريد (REQ-022)
    Client->>FBAuth: طلب رمز البريد
    FBAuth-->>Father: رمز إلى البريد
    Father->>Client: إدخال الرمز
    Client->>FBAuth: التحقق من الرمز
    FBAuth-->>Client: ID Token
    Client->>Ktor: POST /api/v1/identity/email/verify {firebase_id_token}
    alt ID Token صالح والبريد غير مسجل لحساب آخر
        Ktor->>FBAuth: التحقق عبر Firebase Admin SDK
        FBAuth-->>Ktor: ID Token صالح
        Ktor-->>Client: {access_token, refresh_token}
        Client-->>Father: دخول ناجح — جلسة 30 يوماً بدوران
    else بريد مسجل لحساب آخر
        Ktor-->>Client: رفض برسالة واضحة (لا يُكشف لمن ينتمي البريد)
    end
```

- البريد للبالغين فقط؛ لا يُطلب من الطفل إطلاقاً (D-006). عند تعذر الوصول إلى Firebase يُعرض خيار الهاتف وOTP تلقائياً دون انقطاع (REQ-024)؛ Firebase موصّل مصادقة لا سلطة — بيانات العائلة لا تعيش فيه (REQ-023).

### 3-ج. إنشاء العائلة + الدعوة والانضمام (REQ-007/008/009/010 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    actor الأم as Mother
    participant العميل as Client
    participant الخادم as Ktor
    participant التدقيق as Audit
    Father->>Client: تسمية العائلة + اختيار المنطقة region
    Client->>Ktor: POST /api/v1/identity/families {name, region}
    alt بلا عائلة بعد
        Ktor-->>Client: {family_id, invite_code}
        Ktor->>Audit: AuditEvent — إنشاء عائلة (المنشئ مالك is_owner)
        Client-->>Father: العائلة أُنشئت — المنشئ مالك تلقائياً
    else لديه عائلة (عائلة واحدة لكل حساب)
        Ktor-->>Client: رفض — عائلة ثانية غير مسموحة (Q-008)
    end
    Father->>Client: طلب رمز دعوة جديد
    Client->>Ktor: POST /api/v1/identity/families/{id}/invite
    Ktor-->>Client: {invite_code, expires_at} — عشوائي، استخدام واحد، 7 أيام
    Father->>Mother: إرسال الرابط العميق الحامل للرمز
    Mother->>Client: فتح الرابط — الرمز معبّأ
    Mother->>Client: تسجيل دخول برقم هاتفها وOTP
    Client->>Ktor: POST /api/v1/identity/families/join {invite_code}
    Ktor->>Audit: AuditEvent — انضمام بالغة بدور adult
    Ktor-->>Client: {family_id, role: adult}
    Client-->>Mother: انضمت للعائلة — بلا صلاحيات إشرافية حتى يفوّضها الأب (Q-007)
```

- المالك يلغي أي رمز دعوة معلق في أي وقت (REQ-010)؛ رمز منتهٍ/غير صالح يُرفض دون كشف إن كان موجوداً أصلاً (§7).

### 3-د. ملف طفل + اقتران جهاز + موافقة مشتركة (REQ-011/012/013/014/017 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    actor الطفل as Child
    participant جهازالأب as ParentApp
    participant جهازالطفل as ChildApp
    participant الخادم as Ktor
    participant التدقيق as Audit
    Father->>ParentApp: إنشاء ملف طفل {nickname, avatar, color, birth_year}
    ParentApp->>Ktor: POST /api/v1/identity/children {nickname, avatar, color, birth_year}
    Ktor->>Ktor: سنة الميلاد ضمن النطاق (السنة الحالية − 99 … السنة الحالية) — REQ-021
    Ktor->>Ktor: تحديد الدور والقالب: دون 7 child/minimal، 7–12 child/standard، 13–17 teen/standard
    Ktor-->>ParentApp: {membership_id}
    Father->>ParentApp: طلب رمز جهاز (6 أحرف)
    ParentApp->>Ktor: إصدار رمز إقران (صالح 15 دقيقة)
    Ktor-->>ParentApp: رمز الجهاز
    Child->>ChildApp: إدخال رمز الجهاز على جهازه
    ChildApp->>Ktor: POST /api/v1/identity/devices/pair {pairing_code, device_cert}
    alt الرمز صحيح والجهاز غير مقترن لعائلة أخرى
        Ktor->>Ktor: تبادل شهادة الجهاز + تحديد الوضع (طفل) نهائياً — Q-062
        Ktor->>Audit: AuditEvent — إقران + موافقة مشتركة (أب + طفل) مرة واحدة
        Ktor-->>ChildApp: {device_id, mode: child}
        ChildApp-->>Child: جهازك في وضع الطفل — لا حساب لك ولا بيانات اتصال
    else الجهاز مقترن لعائلة أخرى
        Ktor-->>ChildApp: رفض — فك الإقران يتطلب PIN أب العائلة الأولى (REQ-015)
    else رمز إقران منتهٍ (بعد 15 دقيقة)
        Ktor-->>ChildApp: رفض — يولّد الأب رمزاً جديداً
    end
```

- الإقران ذري: إما يكتمل كاملاً (شهادة + وضع + عضوية) أو لا شيء (§7). الوضع يتحدد بالإقران ويُسلَّم للغلاف S1-01؛ وتبديل الملفات مؤجل للمرحلة 2 (Q-063) فلا تبديل للوضع في المرحلة 1.

### 3-هـ. الجلسة: تجديد ودوران وتسجيل خروج (REQ-006 — §4.1)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant العميل as Client
    participant الخادم as Ktor
    Father->>Client: فتح التطبيق — Access Token منتهٍ
    Client->>Ktor: POST /api/v1/identity/sessions/refresh {refresh_token}
    alt Refresh صالح
        Ktor->>Ktor: إبطال Refresh القديم (دوران آمن)
        Ktor-->>Client: {access_token, refresh_token}
        Client-->>Father: الجلسة مستمرة (30 يوماً)
    else Refresh منتهٍ أو مبطل
        Ktor-->>Client: 401 — إعادة تسجيل الدخول
    end
    Father->>Client: تسجيل الخروج
    Client->>Ktor: POST /api/v1/identity/sessions/logout
    Ktor->>Ktor: إبطال كل رموز الجلسة فوراً
    Ktor-->>Client: تم تسجيل الخروج
```

### 3-و. استرداد الحساب بعد فقدان الهاتف والرقم (REQ-020 — §4.1/§7)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    actor الموثوق as Trusted
    participant العميل as Client
    participant الخادم as Ktor
    participant إشعار as MQTT
    Father->>Client: طلب استرداد من جهاز جديد برقم جديد
    Client->>Ktor: طلب استرداد — جهة الاسترداد الموثوقة (بالغ حدده الأب مسبقاً)
    Ktor->>Trusted: طلب تأكيد الاسترداد
    Trusted->>Ktor: تأكيد الطلب
    Ktor->>Ktor: بدء فترة انتظار 7 أيام
    Ktor->>MQTT: إشعار كل أجهزة العائلة بالطلب (Q-022)
    MQTT-->>Father: إشعار لكل جهاز في العائلة
    alt اعتراض أي بالغ خلال الانتظار
        Ktor->>Ktor: إلغاء الطلب فوراً
        Ktor-->>Father: أُلغي طلب الاسترداد
    else لا اعتراض بعد 7 أيام
        Ktor-->>Father: استرداد الحساب بالرقم الجديد
    end
```

- لا استيلاء صامت على الحساب: الانتظار + الإشعار + الاعتراض هي الضمانات الثلاث (سيناريو 2-7).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات السبعة (§2)

```mermaid
flowchart TD
    Start([مستخدم جديد — أول تثبيت]) --> Login{طريقة الدخول؟}
    Login -->|هاتف| Phone[إدخال رقم الهاتف]
    Phone --> Fmt{صيغة دولية صالحة؟}
    Fmt -->|لا| BadPhone[رفض فوراً برسالة واضحة]
    BadPhone --> Phone
    Fmt -->|نعم| OTP[طلب OTP — WhatsApp أولاً]
    OTP --> Chan{القناة نجحت؟}
    Chan -->|لا — WhatsApp| SMS[تحويل تلقائي إلى SMS]
    SMS --> Chan2{نجح SMS؟}
    Chan2 -->|لا| Call[تحويل تلقائي إلى مكالمة فائتة]
    Call --> Chan3{نجحت المكالمة؟}
    Chan3 -->|لا| FailAll[رسالة: تعذر الإرسال — حاول لاحقاً]
    FailAll --> Retry{إعادة المحاولة بعد فاصل؟}
    Retry -->|نعم| OTP
    Chan -->|نعم| Code[إدخال الرمز أو قراءته تلقائياً من SMS]
    Chan2 -->|نعم| Code
    Chan3 -->|نعم| Code
    Code --> CodeOK{الرمز صحيح؟}
    CodeOK -->|لا — أقل من 5| Wrong[رفض + المحاولات المتبقية]
    Wrong --> Code
    CodeOK -->|لا — 5 أخطاء| Lock[قفل الطلب 15 دقيقة]
    CodeOK -->|نعم| TOTP[تفعيل TOTP داخل التطبيق]
    Login -->|بريد — بالغ فقط| Email[إدخال البريد الإلكتروني]
    Email --> EmailFmt{صيغة بريد صالحة؟}
    EmailFmt -->|لا| BadEmail[رفض برسالة واضحة]
    BadEmail --> Email
    EmailFmt -->|نعم| FB[Firebase Auth — رمز إلى البريد]
    FB --> FBDown{Firebase متاح؟}
    FBDown -->|لا| FBFail[عرض خيار الهاتف وOTP تلقائياً]
    FBFail --> Phone
    FBDown -->|نعم| EmailCode[إدخال رمز البريد — تحقق الخادم من ID Token]
    EmailCode --> TOTP
    TOTP --> Fam{لديه عائلة؟}
    Fam -->|لا — إنشاء| Create[تسمية العائلة + اختيار المنطقة]
    Create --> Owner[المنشئ مالك تلقائياً — عائلة واحدة للحساب]
    Fam -->|لا — انضمام| Join[رمز دعوة أو رابط عميق + دخول بدور adult]
    Owner --> Bio[فتح سريع بالبصمة — وضع الأهل فقط]
    Join --> Bio
    Bio --> ChildQ{إنشاء ملف طفل؟}
    ChildQ -->|نعم| ChildProf[ملف طفل: اسم مستعار + صورة + لون + سنة ميلاد فقط]
    ChildProf --> Template[تحديد القالب تلقائياً حسب سنة الميلاد]
    Template --> Pair[إصدار رمز جهاز 6 أحرف — إدخاله على جهاز الطفل]
    Pair --> PairOK{الإقران نجح؟}
    PairOK -->|لا — جهاز لعائلة أخرى| PairNo[رفض — فك الإقران يتطلب PIN أب العائلة الأولى]
    PairOK -->|لا — رمز منتهٍ بعد 15 دقيقة| PairExp[يولّد الأب رمزاً جديداً]
    PairOK -->|نعم| Consent[موافقة مشتركة أب + طفل — مرة واحدة]
    Consent --> Mode[وضع الطفل نهائي على الجهاز — تسليم للغلاف S1-01]
    ChildQ -->|لا| Ready[جاهز — جلسة 30 يوماً بدوران]
    Mode --> Ready
```

- ملاحظة: تسجيل دخول الأب على جهاز طفل **لا** يبدّل الوضع — الوضع يتحدد بالإقران (REQ-014/Q-062)؛ وتبديل الملفات مؤجل للمرحلة 2 (Q-063).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D9 هي الجداول التسعة من §5. المخزن D2 يحفظ `code_hash` فقط، وD8 يحفظ `pairing_code_hash` فقط — لا رمز نصاً أبداً.

- **تغطية نقاط §4:** كل نقاط §4.1 الإحدى عشرة مرسومة في §3 (otp request/verify، totp/enroll، sessions refresh/logout، families، invite، join، children، devices/pair، email/verify)؛ والتسلسلات تغطي التدفقات الأساسية فقط.

```mermaid
flowchart LR
    Father([الأب / البالغ])
    Child([الطفل / المراهق])
    Firebase([Firebase Auth])
    OTPCh([قنوات OTP])
    S101([الغلاف S1-01])
    S103([نظام الأدوار S1-03])

    subgraph Identity [S1-02: الهوية والتهيئة]
        P1(1.0 تسجيل الدخول بالهاتف + موجّه OTP)
        P2(2.0 تسجيل الدخول بالبريد عبر Firebase)
        P3(3.0 إدارة الجلسات)
        P4(4.0 إنشاء العائلة والدعوات)
        P5(5.0 ملفات الأطفال)
        P6(6.0 اقتران الأجهزة والموافقة)
        P7(7.0 استرداد الحساب)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 person)]
        D2[(D2 phone_verification)]
        D3[(D3 session)]
        D4[(D4 family)]
        D5[(D5 membership)]
        D6[(D6 invite_code)]
        D7[(D7 child_profile)]
        D8[(D8 device_pairing)]
        D9[(D9 consent_record)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent])
    MQTT([MQTT — إشعار الأجهزة])

    Father -->|رقم الهاتف| P1
    P1 -->|طلب OTP| OTPCh
    OTPCh -->|نجاح / فشل القناة| P1
    P1 -->|حفظ code_hash + المحاولات| D2
    D2 -->|التحقق من الرمز| P1
    P1 -->|إنشاء / تحديث الشخص| D1
    P1 -->|إصدار رموز الجلسة| P3
    Father -->|البريد الإلكتروني| P2
    P2 -->|رمز البريد + ID Token| Firebase
    Firebase -->|ID Token صالح| P2
    P2 -->|إنشاء / تحديث الشخص| D1
    P2 -->|إصدار رموز الجلسة| P3
    P3 -->|حفظ refresh_token_hash| D3
    D3 -->|دوران Refresh / إبطال| P3
    Father -->|اسم العائلة + المنطقة| P4
    P4 -->|إنشاء العائلة| D4
    P4 -->|عضوية مالك is_owner| D5
    P4 -->|توليد رمز دعوة عشوائي| D6
    D6 -->|الرمز + 7 أيام| P4
    Father -->|رمز دعوة / رابط عميق| P4
    P4 -->|عضوية adult| D5
    P4 -->|تسجيل الانضمام| Audit
    Father -->|بيانات ملف الطفل| P5
    P5 -->|حفظ الملف — سنة ميلاد فقط| D7
    D7 -->|الملف + القالب حسب العمر| P5
    P5 -->|عضوية الطفل| D5
    Father -->|إصدار رمز جهاز| P6
    Child -->|إدخال رمز الجهاز| P6
    P6 -->|حفظ pairing_code_hash + شهادة + وضع| D8
    D8 -->|"الوضع (طفل) نهائي"| S101
    P6 -->|تسجيل الموافقة المشتركة| D9
    P6 -->|تسجيل الإقران والموافقة| Audit
    P5 -->|الدور والقالب| S103
    P4 -->|الدور is_owner / adult| S103
    Father -->|طلب استرداد برقم جديد| P7
    P7 -->|تأكيد جهة موثوقة + انتظار 7 أيام| D4
    P7 -->|إشعار كل أجهزة العائلة| MQTT
    P7 -->|تسجيل طلب الاسترداد| Audit
```

## 6. مخطط النشاط (Activity) — دورة حياة التهيئة من أول تثبيت إلى وضع الطفل

المسارات الخمسة (الأب/البالغ / الطفل / العميل / الخادم / الخدمات الخارجية) كمسارات متوازية. والأنشطة الخلفية (دوران Refresh، إشعار الأجهزة عبر MQTT في الاسترداد) تعمل **بالتوازي** مع استخدام التطبيق.

```mermaid
flowchart LR
    subgraph Father [الأب / البالغ]
        direction TB
        F1([فتح التطبيق أول مرة])
        F2[إدخال الهاتف أو البريد]
        F3[إدخال رمز التحقق]
        F4[تسمية العائلة واختيار المنطقة]
        F5[إنشاء ملف طفل]
        F6[إصدار رمز جهاز 6 أحرف]
        F7[المشاركة في الموافقة المشتركة]
        F8[فتح لاحق بالبصمة — وضع الأهل فقط]
    end
    subgraph Child [الطفل]
        direction TB
        C1([استلام جهاز جديد])
        C2[إدخال رمز الجهاز]
        C3[المشاركة في الموافقة المشتركة]
        C4([الجهاز في وضع الطفل])
    end
    subgraph Client [العميل — Flutter + Kotlin]
        direction TB
        CL1[التحقق من صيغة الهاتف / البريد]
        CL2[قراءة OTP تلقائياً من SMS حيث يدعم الجهاز]
        CL3[تفعيل TOTP بعد أول تحقق ناجح]
        CL4[عرض شاشات التهيئة عربي / إنجليزي — الافتراضي العربية]
        CL5[فتح بالبصمة — وضع الأهل فقط]
        CL6[بعد 3 محاولات بصمة فاشلة: طلب PIN/OTP]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[موجّه OTP: WhatsApp ← SMS ← مكالمة]
        V2[التحقق من OTP — 5 دقائق / 5 أخطاء ← قفل 15 دقيقة]
        V3[التحقق من ID Token عبر Firebase Admin SDK]
        V4[إنشاء العائلة — المنشئ مالك، عائلة واحدة للحساب]
        V5[رموز دعوة عشوائية — استخدام واحد، 7 أيام]
        V6[تحديد الدور والقالب من سنة الميلاد]
        V7[إقران ذري: شهادة + وضع + عضوية]
        V8[جلسة 30 يوماً — دوران Refresh]
        V9[استرداد: تأكيد موثوق + انتظار 7 أيام + إشعار كل الأجهزة]
    end
    subgraph Ext [خدمات خارجية]
        direction TB
        E1[WhatsApp / SMS / مكالمة فائتة]
        E2[Firebase Auth]
        E3[MQTT — إشعار أجهزة العائلة]
    end

    F1 --> CL1
    F2 --> CL1
    CL1 --> V1
    V1 --> E1
    E1 --> CL2
    CL2 --> F3
    F3 --> V2
    V2 --> CL3
    V2 --> V3
    F2 --> E2
    E2 --> V3
    V3 --> V2
    CL3 --> F4
    F4 --> V4
    V4 --> V5
    F5 --> V6
    V6 --> F6
    F6 --> C2
    C1 --> C2
    C2 --> V7
    V7 --> F7
    V7 --> C3
    F7 --> C4
    C3 --> C4
    V4 --> V8
    V8 --> F8
    F8 --> CL5
    CL5 --> CL6
    V9 --> E3
```

- عند إعادة الفتح بعد الإغلاق القسري، يعود المستخدم لنفس الشاشة والمدخلات (نمط الغلاف S1-01)؛ وكل حدث هوية/إقران يُسجَّل في `AuditEvent` (§5).
