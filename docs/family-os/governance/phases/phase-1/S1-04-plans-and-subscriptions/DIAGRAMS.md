# S1-04: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط (حكم المالك 2026-11-06)؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط، حكم المالك 2026-11-06 · §9 في مرحلة التصميم)
- **القرارات الحاكمة:** Q-025 (قنوات الدفع لعالمين) · Q-055 (الخطط أعلام وحصص بلا كود) · Q-106 (عدّاد SMS وتجاوز الطوارئ) · Q-126 (3 خطط) · Q-127 (أسعار الخليج) · Q-129 (حصص SMS) · Q-130 (تجربة 7 أيام) · Q-131 (سماح 3 أيام) · Q-132 (سعر اليمن — مفتوح، بلا رقم) · Q-012 (ميزانية الذكاء) · Q-098 (الخطة للقراءة فقط في S1-09) · Q-105 (سجل المواقع 7 أيام)
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

16 حالة استخدام من السيناريوهات السبعة والمتطلبات (§2/§3): إدارة الاشتراك للأب وحده (`billing.manage` و`billing.voucher.redeem`)، والعرض (`billing.view`) للأب والبالغ المفوَّض حسب القالب، وشراء حزمة التعبئة (`billing.topup.buy`) للأب وحده (المالك)، والفوترة مخفية تماماً عن الأطفال والمراهقين (محاولة وصول مباشر عبر API تردّ 403 — §7)، وحارس الحصص والتجاوز الطارئ والتراجع اللبق عمليات نظام لا أفعال مستخدم.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Minor([الطفل / المراهق — الفوترة مخفية])
    Agent([وكيل القسائم])
    Admin([مسؤول اللوحة])
    Store([متجر Google Play / App Store])
    Wallet([محفظة يمنية OneCash / Mahfathati])
    S109([مركز الأوامر S1-09 — قراءة فقط])
    S102([نظام الهوية S1-02 — عدد الأعضاء])
    S107([نظام الموقع S1-07 — SOS])

    subgraph S104 [S1-04: الخطط والاشتراكات]
        direction TB
        UC1(عرض الخطة والاستهلاك)
        UC2(مقارنة الخطط والترقية)
        UC3(بدء التجربة 7 أيام)
        UC4(إلغاء التجديد التلقائي)
        UC5(شراء حزمة تعبئة SMS)
        UC6(استبدال قسيمة وكيل)
        UC7(استعادة المشتريات)
        UC8(الدفع عبر المتجر أو البطاقة)
        UC9(الدفع عبر محفظة أو دفع يدوي)
        UC10(عرض الخطة في مركز الأوامر)
        UC11(فحص حارس الحصص)
        UC12(تجاوز طوارئ SOS)
        UC13(تعديل أعلام وحصص خطة بلا كود)
        UC14(إصدار قسيمة)
        UC15(تنبيه 80% من الحصة ودخول السماح)
        UC16(تراجع لبق للمجانية)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC6
    Father --> UC7
    Adult --> UC1
    Adult --> UC5
    Adult --> UC10
    Minor -.->|403 — مخفية تماماً| UC1
    Agent --> UC14
    Admin --> UC13
    Store --> UC8
    Wallet --> UC9
    UC2 -.->|يتضمن| UC8
    UC2 -.->|يتضمن| UC9
    UC6 -.->|يتضمن| UC14
    UC10 --> S109
    UC11 --> S102
    UC12 --> S107
    UC2 --> UC11
    UC15 --> UC16
```

- ملاحظة: الترقية فورية عند الدفع، والتخفيض يسري بنهاية الفترة المدفوعة (REQ-004)؛ والتجربة مرة واحدة لكل عائلة وغير قابلة للتحويل (§6).
- الأسعار (Q-127): الخليج — المميزة 19.99 ر.س شهرياً / 179.99 سنوياً، الأساسية 9.99 ر.س شهرياً / 89.99 سنوياً (خصم سنوي ~25%)؛ والمجانية 0 ر.س. سعر اليمن بالريال اليمني مفتوح (Q-132) — لم يُحدد بعد، ولا رقم مخترع هنا.

## 2. مخطط قاعدة البيانات (ERD)

الجداول الستة من §5 كما هي، مع ثلاثة مراجع خارجية: العائلة (S1-02)، وعدد الأعضاء من S1-02 لحصة الأفراد، و`AuditEvent` (النواة المشتركة — كل شراء/ترقية/إلغاء/استبدال يُسجَّل فيه domain=billing). ملاحظتان: الخطة المحفوظة وحالة الحصص مخزنان على العميل وليستا جدولَي خادم (§5)، و`family_subscription` اشتراك واحد لكل عائلة (`family_id` UNIQUE + RLS).

```mermaid
erDiagram
    family ||--|| family_subscription : "اشتراك واحد"
    plan ||--o{ family_subscription : "يُشترَك فيها"
    plan ||--o{ plan_price : "أسعارها لكل سوق"
    plan ||--o{ voucher : "قسائمها"
    family ||--o{ purchase_receipt : "إيصالاتها"
    family ||--o{ quota_usage : "عدّاداتها"
    family ||--o{ voucher : "يستبدلها"
    family_subscription ||--o{ AuditEvent : "أحداثها تُسجَّل"
    purchase_receipt ||--o{ AuditEvent : "يُسجَّل"
    voucher ||--o{ AuditEvent : "استبداله يُسجَّل"

    plan {
        string plan_id PK
        string tier_level
        string title_ar
        string description_ar
        string billing_interval
        string flags
        string quotas
        boolean is_active
    }
    plan_price {
        string plan_id PK_FK
        string market
        int price_cents
        string currency
        boolean is_active
    }
    family_subscription {
        string id PK
        string family_id FK_UK
        string plan_id FK
        string status
        string billing_provider
        string provider_subscription_id
        string provider_original_transaction_id
        datetime current_period_start
        datetime current_period_end
        boolean auto_renew
        boolean trial_used
        string purchased_by
    }
    purchase_receipt {
        string id PK
        string family_id FK
        string user_id FK
        string provider
        string product_id
        string receipt_data
        string validation_status
        datetime server_verified_at
        string raw_provider_response
    }
    voucher {
        string voucher_id PK
        string code
        string plan_id FK
        int duration_months
        string status
        string issued_by
        datetime issued_at
        string redeemed_by_family_id FK
        datetime redeemed_at
        datetime expires_at
    }
    quota_usage {
        string family_id PK_FK
        string period PK
        int sms_sent
        int sms_emergency_used
        int ai_calls
        int topup_sms_balance
        datetime updated_at
    }
    family {
        string id PK
    }
    AuditEvent {
        string id PK
    }
```

- `tier_level`: FREE / BASIC / PREMIUM؛ و`billing_interval`: LIFETIME_FREE / MONTHLY / ANNUAL؛ و`status`: ACTIVE / TRIAL / IN_GRACE_PERIOD / EXPIRED / CANCELLED؛ و`billing_provider`: SYSTEM_FREE / GOOGLE_PLAY / APPLE_APP_STORE / WALLET / VOUCHER / MANUAL؛ و`validation_status`: VALIDATED_SUCCESS / FRAUD_SUSPECT / EXPIRED؛ وحالة القسيمة: ISSUED / REDEEMED / REVOKED / EXPIRED (§5).
- `flags` و`quotas` من نوع jsonb — تعديل الأعلام والحصص بلا كود ولا تغيير مخطط (Q-055)؛ و`receipt_data` حمولة مشفرة؛ والمفتاح المركب لعدّاد الاستهلاك `family_id + period` (YYYY-MM) (§5).
- مصفوفة الخطط (§1): المجانية حتى 5 أفراد + 20 SMS شهرياً؛ الأساسية حتى 10 أفراد + 50 SMS؛ المميزة غير محدودة + 100 SMS؛ وسجل المواقع 7 أيام في كل الخطط (Q-105)؛ وميزانية الذكاء: المجانية تحقق المهام فقط، الأساسية تحقق + مساعد محدود، المميزة كاملة.

## 3. التسلسل (Sequence) — من عقود §4

خمسة مخططات، كل واحد لتدفق واحد:

### 3-أ. الترقية عبر المتجر — الخليج (REQ-005/007 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant Kotlin as K
    participant الخادم as Ktor
    participant المتجر as Store
    participant التدقيق as Audit
    Father->>App: اختيار المميزة من شاشة المقارنة
    App->>K: launchStorePurchase
    K->>Store: فتح ورقة شراء Google Play
    Store-->>K: إيصال الشراء
    K->>Ktor: POST /families/{id}/billing/purchase/verify-receipt {receipt_data}
    Note over Ktor: تحقق خادمي S2S فقط — لا يُعتد بأي تأكيد محلي
    Ktor->>Store: تحقق S2S من الإيصال
    Store-->>Ktor: الإيصال صحيح
    alt إيصال صحيح وغير مكرر
        Ktor->>Ktor: تفعيل الاشتراك + الاستحقاقات فوراً
        Ktor->>Audit: AuditEvent (domain=billing)
        Ktor-->>App: اشتراك ACTIVE — الميزات مفتوحة على كل أجهزة العائلة
    else إيصال مزور أو مكرر
        Ktor->>Audit: AuditEvent — FRAUD_SUSPECT
        Ktor-->>App: 409 RECEIPT_INVALID / RECEIPT_DUPLICATE
    end
```

- لا يُرسَل `father_pin` إطلاقاً في هذا المسار — التحقق من الأب محلي على الجهاز (§4)؛ والإيصالات المكررة تُرفض (409) وتُسجَّل كـ FRAUD_SUSPECT (§6/§7).

### 3-ب. استبدال قسيمة وكيل — اليمن (REQ-006/008 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant الخادم as Ktor
    participant التدقيق as Audit
    Father->>App: إدخال كود القسيمة
    App->>Ktor: POST /families/{id}/billing/voucher/redeem {code}
    Ktor->>Ktor: تحقق خادمي من القسيمة
    alt قسيمة صادرة وغير مستخدمة
        Ktor->>Ktor: تفعيل الاشتراك المميز فوراً + status=REDEEMED
        Ktor->>Audit: AuditEvent (domain=billing)
        Ktor-->>App: اشتراك ACTIVE
    else قسيمة مستخدمة من قبل
        Ktor-->>App: VOUCHER_USED
    else قسيمة ملغاة أو منتهية
        Ktor-->>App: VOUCHER_REVOKED / VOUCHER_INVALID
    end
```

- القسيمة لمرة واحدة، قابلة للإلغاء قبل الاستخدام، ولا استرداد لها عبر التطبيق (§3/§6)؛ ومسارات الدفع اليمنية (المحافظ والقسائم) تصميمنا نحن — لا محافظ محلية ولا قسائم وكلاء في أي تطبيق مفكك (ملحق RE).

### 3-ج. نفاد SMS والتعبئة وتجاوز الطوارئ (REQ-009/010/011 — §4/§6)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant الخادم as Ktor
    participant الحارس as Guard
    participant الموقع as S107
    Father->>App: شراء حزمة تعبئة 50 رسالة
    App->>Ktor: POST /families/{id}/billing/topup
    Ktor->>Ktor: تحقق الدفع خادمياً + إضافة 50 إلى topup_sms_balance
    Ktor-->>App: الرصيد أُضيف فوراً لرصيد الشهر
    Note over Ktor: رصيد التعبئة ينتهي بنهاية الفترة ولا يتراكم
    S107->>Guard: طلب إرسال SMS (SOS)
    Guard->>Ktor: فحص quota_usage (sms_sent + topup_sms_balance)
    alt رصيد متاح
        Guard-->>S107: سماح بالإرسال
    else الحصة نفدت — رسالة SOS
        Guard->>Guard: فحص sms_emergency_used < 3 في الدورة
        alt أقل من 3
            Guard-->>S107: سماح — رسالة طوارئ (SOS فقط)
            Guard->>Father: إشعار فوري بكل رسالة طارئة
        else 3 مستخدمة
            Guard-->>S107: حظر حتى التعبئة أو التجديد
            Guard->>Father: إشعار فوري عند النفاد
        end
    end
```

- الحصص تُفرض على الخادم عند كل استخدام؛ وعرض العميل استرشادي فقط (§6)؛ وتنبيه للأب عند 80% من أي حصة (§6)؛ وحصة SMS حسب الخطة: 20 / 50 / 100 شهرياً (Q-129)؛ وتجاوز الطوارئ 3 رسائل SOS في كل دورة (Q-106).

### 3-د. التجربة ثم السماح ثم التراجع اللبق (REQ-012/013/014 — §4/§6)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant الخادم as Ktor
    participant المجدول as Sched
    Father->>App: بدء التجربة 7 أيام للمميزة
    App->>Ktor: POST /families/{id}/plan/trial/start
    alt لم تُستخدم التجربة من قبل
        Ktor->>Ktor: status=TRIAL + trial_used=true — 7 أيام
        Ktor-->>App: تجربة مفعّلة
    else تجربة سابقة
        Ktor-->>App: TRIAL_ALREADY_USED
    end
    Note over Sched: عند انتهاء التجربة بلا تجديد
    Sched->>Ktor: دخول فترة السماح — status=IN_GRACE_PERIOD — 3 أيام
    Ktor->>Father: حدث billing/sub-grace-period — الميزات تبقى
    Note over Sched: عند انتهاء السماح بلا تجديد
    Sched->>Ktor: تراجع لبق — status=EXPIRED ثم المجانية ACTIVE
    Ktor-->>Father: بلا قفل وبلا حذف بيانات — الأعضاء الحاليون يبقون
```

- الانتهاء بطابع وقت الخادم فقط — ساعة العميل لا يُعتد بها أبداً (§6)؛ والتجربة مرة واحدة لكل عائلة وغير قابلة للتحويل (§6)؛ والترقية أثناء فترة السماح تنهي السماح فوراً وتفعّل الخطة الجديدة (§7).

### 3-هـ. تجاوز حصة الأفراد وبطاقة الترقية اللبقة (REQ-009 — §2 سيناريو 4-6)

```mermaid
sequenceDiagram
    autonumber
    actor الأب as Father
    participant التطبيق as App
    participant الخادم as Ktor
    participant الهوية as S102
    Father->>App: إضافة العضو السادس (الخطة المجانية — الحد 5)
    App->>Ktor: طلب إضافة عضو
    Ktor->>S102: عدد الأعضاء الحاليين
    S102-->>Ktor: 5 أعضاء
    Ktor->>Ktor: حارس الحصص — 5 >= 5
    Ktor-->>App: QUOTA_EXCEEDED + بطاقة ترقية لبقة
    App-->>Father: بطاقة ترقية لبقة (لا حظر قاسٍ)
    Father->>App: الترقية للأساسية (حتى 10 أفراد)
    App->>Ktor: POST /families/{id}/plan/upgrade
    Ktor-->>App: ترقية فورية — إضافة العضو تنجح
```

- الأعضاء الحاليون عند التراجع اللبق يبقون فعالين مع حظر إضافة جدد فقط (REQ-014)؛ وحد الأفراد: 5 / 10 / غير محدود (§1).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات السبعة (§2)

```mermaid
flowchart TD
    Start([عائلة جديدة تُنشأ]) --> Free[بدء تلقائي على المجانية ACTIVE — 0 ر.س]
    Free --> View[عرض الخطة والاستهلاك — الأب أو البالغ المفوَّض]
    View --> Choice{يريد ترقية؟}
    Choice -->|لا| Stay[البقاء على المجانية — الأمان كاملاً]
    Choice -->|نعم| Channel{طريقة الدفع}
    Channel -->|متجر / بطاقة — الخليج| Store[شراء Play / StoreKit أو Tap / Moyasar]
    Channel -->|محفظة يمنية| Wallet[دفع OneCash / Mahfathati]
    Channel -->|قسيمة وكيل| Voucher[إدخال كود القسيمة]
    Channel -->|تجربة| Trial[بدء تجربة 7 أيام — مرة واحدة]
    Store --> Verify[تحقق خادمي S2S من الإيصال]
    Wallet --> Verify
    Voucher --> Verify
    Trial --> Active[مميزة ACTIVE]
    Verify -->|صحيح| Active
    Verify -->|مزور / مكرر| Reject[رفض 409 + تسجيل FRAUD_SUSPECT]
    Active --> Use[استخدام الميزات على كل أجهزة العائلة]
    Use --> Quota{تجاوز حصة؟}
    Quota -->|أفراد / SMS / ذكاء| Card[بطاقة ترقية لبقة]
    Card --> Upgrade[ترقية فورية]
    Upgrade --> Use
    Quota -->|لا| End1([مستمر])
    Trial --> Expire{انتهاء التجربة بلا تجديد؟}
    Expire -->|نعم| Grace[سماح 3 أيام — الميزات تبقى]
    Grace --> Renew{تجديد؟}
    Renew -->|نعم| Active
    Renew -->|لا| Down[تراجع لبق للمجانية — بلا قفل وبلا حذف]
    Down --> Stay
    View --> Hub{عرض من مركز الأوامر S1-09؟}
    Hub -->|نعم| ReadOnly[عرض قراءة فقط + زر إدارة ينقل إلى S1-04]
    ReadOnly --> View
```

- ملاحظة: الفوترة مخفية تماماً عن الأطفال والمراهقين — لا تُعرض ولا تُذكر (§6)؛ والخطة في S1-09 للقراءة فقط (REQ-015).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D6 (جداول خادم PostgreSQL). المخزن D7 محفوظ محلياً على الجهاز (للقراءة دون اتصال) وليس جدول خادم.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: `POST /families/{id}/billing/restore` (استعادة المشتريات — تمر عبر P2) · `POST /families/{id}/plan/cancel-renewal` (إلغاء التجديد التلقائي — تمر عبر P5) · `GET /families/{id}/billing/usage` (استهلاك الحصص SMS/أفراد/ذكاء — تُقرأ عبر P4) · `PATCH /admin/plans/{planId}` (تعديل أعلام/حصص الخطة بلا كود، إداري فقط — تمر عبر P7)؛ وبقية النقاط مرسومة في §3 (plans، plan قراءة/ترقية، verify-receipt، voucher/redeem، topup، trial/start).

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Agent([وكيل القسائم])
    Admin([مسؤول اللوحة])
    S109([مركز الأوامر S1-09])
    S102([نظام الهوية S1-02])
    S107([نظام الموقع S1-07])
    Store([متجر / بوابة بطاقات])
    Wallet([محفظة يمنية])

    subgraph Billing [وحدة الفوترة — Ktor billing]
        P1(1.0 كتالوج الخطط والاستحقاقات)
        P2(2.0 دفع المتجر والبطاقات + تحقق S2S)
        P3(3.0 دفع اليمن — محفظة / يدوي / قسيمة)
        P4(4.0 حارس الحصص والتعبئة)
        P5(5.0 مجدول التجربة والسماح والتراجع)
        P6(6.0 أحداث الفوترة والإشعارات)
        P7(7.0 إدارة الخطط بلا كود)
    end

    subgraph Stores [مخازن البيانات]
        D1[(D1 plan)]
        D2[(D2 plan_price)]
        D3[(D3 family_subscription)]
        D4[(D4 purchase_receipt)]
        D5[(D5 voucher)]
        D6[(D6 quota_usage)]
        D7[(D7 الخطة المحفوظة — محلي)]
    end

    Ktor([خادم Ktor])
    Audit([AuditEvent — domain=billing])

    Father -->|اختيار خطة / تجربة / إلغاء تجديد| P1
    Adult -->|عرض الخطة والاستهلاك| P1
    P1 -->|قراءة الخطط والأسعار| D1
    P1 -->|قراءة الأسعار لكل سوق| D2
    P1 -->|قراءة الاشتراك والاستحقاق| D3
    P1 -->|الخطة + الاستهلاك| Father
    P1 -->|الخطة — قراءة فقط| S109
    S109 -->|زر إدارة| P1
    Father -->|شراء عبر المتجر| P2
    Store -->|إيصال الشراء| P2
    P2 -->|تحقق S2S| Store
    P2 -->|حفظ الإيصال والتحقق| D4
    P2 -->|تفعيل الاشتراك| D3
    Father -->|قسيمة / محفظة / دفع يدوي| P3
    Wallet -->|تأكيد الدفع| P3
    Agent -->|إصدار قسيمة| D5
    P3 -->|التحقق من القسيمة| D5
    P3 -->|تفعيل الاشتراك| D3
    S102 -->|عدد الأعضاء| P4
    S107 -->|طلب SMS| P4
    P4 -->|قراءة / تحديث العدّادات| D6
    P4 -->|تجاوز → بطاقة ترقية لبقة| Father
    P4 -->|نفاد SMS → 3 طوارئ SOS فقط| S107
    P5 -->|انتهاء تجربة / سماح| D3
    P5 -->|تحديث الحالة| D3
    P6 -->|billing/subscription-changed و quota-warning و sub-grace-period و sub-renewed| Ktor
    P6 -->|تنبيه 80% وإشعار طوارئ فوري| Father
    Admin -->|تعديل أعلام / حصص| P7
    P7 -->|حفظ بلا تغيير مخطط| D1
    P1 -->|نسخة محفوظة دون اتصال| D7
    D7 -->|عرض مع وقت صريح| Father
    P2 -->|كل شراء / ترقية / إلغاء / استبدال| Audit
    P3 -->|كل استبدال| Audit
    P5 -->|كل تراجع| Audit
```

- ملاحظة: Webhook المتجر للتجديد التلقائي يُعالج idempotent بمفتاح المعاملة — لا ترقية مزدوجة (§7)؛ وفشل التحقق من الإيصال لعطل اتصال بالمتجر يعطي سماحاً مؤقتاً 24 ساعة ثم إعادة محاولة (§7).

## 6. مخطط النشاط (Activity) — دورة حياة الاشتراك

المسارات الخمسة (الأب / التطبيق / الخادم / مزودو الدفع / المجدول) كمسارات متوازية. وحارس الحصص والمجدول يعملان **بالتوازي** مع استخدام التطبيق، والسلامة (SOS والموقع الأساسي والدردشة والمهام) لا تُحجب بأي خطة أبداً.

```mermaid
flowchart LR
    subgraph Father [الأب — المالك]
        direction TB
        F1([عائلة جديدة])
        F2[اختيار خطة أو بدء تجربة]
        F3[الدفع أو إدخال قسيمة]
        F4[شراء تعبئة SMS]
        F5[إلغاء التجديد التلقائي]
        F6([استلام إشعار 80% أو طارئ])
    end
    subgraph App [التطبيق — Flutter + Kotlin]
        direction TB
        A1[بدء تلقائي على المجانية ACTIVE]
        A2[عرض المقارنة والأسعار]
        A3[فتح ورقة شراء المتجر]
        A4[إرسال الإيصال أو القسيمة للخادم]
        A5[عرض الخطة المحفوظة دون اتصال]
        A6[عرض بطاقة ترقية لبقة]
    end
    subgraph Server [الخادم — Ktor billing]
        direction TB
        V1[GET /plans + GET /families/{id}/plan]
        V2[تحقق S2S من الإيصال / القسيمة]
        V3[تفعيل الاشتراك + الاستحقاقات]
        V4[حارس الحصص — أفراد / SMS / ذكاء]
        V5[إصدار أحداث MQTT]
        V6[تسجيل AuditEvent]
    end
    subgraph Provider [مزودو الدفع]
        direction TB
        R1[Google Play / App Store]
        R2[Tap / Moyasar — بطاقات]
        R3[OneCash / Mahfathati — محافظ]
        R4[وكيل — إصدار قسيمة]
    end
    subgraph Sched [المجدول]
        direction TB
        G1[انتهاء التجربة 7 أيام]
        G2[سماح 3 أيام]
        G3[تراجع لبق للمجانية]
        G4[تصفير الحصص ببداية الفترة]
    end

    F1 --> A1
    A1 --> V1
    F2 --> A2
    A2 --> F3
    F3 --> A3
    A3 --> R1
    A3 --> R2
    F3 --> R3
    F3 --> R4
    R1 --> A4
    R2 --> A4
    R3 --> A4
    R4 --> A4
    A4 --> V2
    V2 --> V3
    V3 --> V5
    V3 --> V6
    V3 --> A5
    V4 --> A6
    A6 --> F2
    F4 --> V4
    F5 --> V3
    G1 --> G2
    G2 --> G3
    G3 --> V3
    G4 --> V4
    V5 --> F6
    V4 --> F6
```

- عند انتهاء الفترة دون اتصال بالخادم، تُعرض الخطة المحفوظة مع وقت صريح، ويُتحقق من الانتهاء عند أول اتصال بطابع الخادم (§7)؛ وميزانية ذكاء لكل عائلة حسب خطتها + مفتاح إيقاف، ونفاد الميزانية يوقف مزايا الذكاء دون أن يمس السلامة (REQ-016).
