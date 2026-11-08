# S1-04: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-08 — D-2، بعد موجة الإصلاح 0e4a3e2..f7da470)؛ والمواصفة معتمدة بالكامل في التخطيط (حكم المالك 2026-11-06)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط، حكم المالك 2026-11-06 · §9 في مرحلة التصميم)
- **السياق المحدد (Bounded Context):** #11 الفوترة والاشتراكات (Billing & Subscriptions) — `CONTEXT-MAP.md` §2 صف 11
- **القرارات الحاكمة:** Q-001 · Q-025 (قنوات الدفع لعالمين) · Q-055 (الخطط أعلام وحصص بلا كود) · Q-106 (عدّاد SMS وتجاوز الطوارئ) · Q-126 (3 خطط) · Q-127 (أسعار الخليج) · Q-129 (حصص SMS) · Q-130 (تجربة 7 أيام) · Q-131 (سماح 3 أيام) · Q-012 (ميزانية الذكاء) · Q-098 (الخطة للقراءة فقط في S1-09) · Q-105 (سجل المواقع 7 أيام) · Q-163 (تجاوز طوارئ SOS — 3 رسائل بعد نفاد الحصة) · Q-056 (الموقع الأساسي في المرحلة 1 — خريطة العائلة + SOS) · Q-007 (رفض-يتغلب — المنع يغلب) · Q-260 (مفتاح `billing.plan.edit` — مالك المنصة وحده) · Q-258 (إصدار القسائم — مشغّل المنصة حصراً) · Q-261 (تصديق Basic = 50 رسالة/شهر) · Q-270 (جدول منتج التعبئة — السعر قرار المالك G-S04-08) · Q-271 (تصديق سعر Basic 9.99/89.99) · Q-128 (سعر اليمن المخفَّض) · Q-239 (مرآة SMS) · Q-251 (تأكيد الدفع اليدوي) · Q-252 (فترة الحصة شهر تقويمي) · Q-216 (تنبيه 80%) · Q-335 (المصنف معفى من ميزانية العائلة) · Q-336 (وحدة الذكاء: 300/1,000/3,000) · Q-337 (سقف المنصة $200) · Q-338 (مفتاح إيقاف الذكاء للمسؤول) · Q-339 (تعبئة الخليج 5.99 ر.س) · Q-340 (تعبئة اليمن 250 ر.ي) · Q-341 (اليمن أساسية 300/2,700) · Q-342 (اليمن مميزة 600/5,400)
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

16 حالة استخدام من السيناريوهات السبعة والمتطلبات (§2/§3): إدارة الاشتراك للأب وحده (`billing.manage` و`billing.voucher.redeem`)، والعرض (`billing.view`) للأب والبالغ المفوَّض حسب القالب، وشراء حزمة التعبئة (`billing.topup.buy`) للأب وحده (المالك)، والفوترة مخفية تماماً عن الأطفال والمراهقين (محاولة وصول مباشر عبر API تردّ 403 — §7)، وحارس الحصص والتجاوز الطارئ والتراجع اللبق عمليات نظام لا أفعال مستخدم.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Minor([الطفل / المراهق — الفوترة مخفية])
    Operator([مشغّل المنصة — المالك/فريقه])
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
        UC15(تنبيه 80% من الحصة ودخول السماح — Q-216)
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
    Adult --> UC10
    Operator --> UC14
    Admin --> UC13
    Store --> UC8
    Wallet --> UC9
    UC2 -.->|يتضمن| UC8
    UC2 -.->|يتضمن| UC9
    UC10 --> S109
    UC11 --> S102
    UC12 --> S107
    UC15 -->|يُطلق عند انتهاء السماح بلا تجديد| UC16
```

- ملاحظة: الترقية فورية عند الدفع، والتخفيض يسري بنهاية الفترة المدفوعة (REQ-004)؛ والتجربة مرة واحدة لكل عائلة وغير قابلة للتحويل (§6).
- ملاحظة شروط مسبقة (لا تُرسم كتضمين ولا كارتباط): UC6 (استبدال قسيمة) تفترض قسيمة صادرة (UC14) شرطاً مسبقاً لا تضميناً؛ وUC2 (المقارنة والترقية) تفترض فحص حارس الحصص (UC11) شرطاً مسبقاً لا ارتباطاً مباشراً.
- ملاحظة إصدار القسائم (Q-258): UC14 يصدرها مشغّل المنصة حصراً عبر `POST /api/v1/admin/vouchers` بمفتاح `billing.plan.edit` (REQ-018)؛ والعائلات لا تصدر قسائم أبداً في المرحلة 1؛ والتوزيع على الأب عبر وكيل (Q-025) لا الإصدار.
- ملاحظة إخفاء: الفوترة مخفية تماماً عن الأطفال والمراهقين — لا ارتباط للقاصر بالمخطط؛ والقاعدة نصية: محاولة وصول مباشر عبر API تردّ 403 (§7).
- الأسعار (Q-127 للمميزة · Q-271 للأساسية · REQ-003): الخليج — المميزة 19.99 ر.س شهرياً / 179.99 سنوياً، الأساسية 9.99 ر.س شهرياً / 89.99 سنوياً (خصم سنوي ~25%)؛ والمجانية 0 ر.س. اليمن — الأساسية 300 ر.ي شهرياً / 2,700 سنوياً، المميزة 600 ر.ي شهرياً / 5,400 سنوياً (Q-341 · Q-342 — D-11؛ وQ-132 حُكم بهما).

## 2. مخطط قاعدة البيانات (ERD)

الجداول الثمانية من §5 كما هي، مع ثلاثة مراجع خارجية: العائلة (S1-02)، وعدد الأعضاء من S1-02 لحصة الأفراد، و`AuditEvent` (النواة المشتركة — كل شراء/ترقية/إلغاء/استبدال يُسجَّل فيه domain=billing). ملاحظتان: الخطة المحفوظة وحالة الحصص مخزنان على العميل وليستا جدولَي خادم (§5)، و`family_subscription` اشتراك واحد لكل عائلة (`family_id` UNIQUE + RLS).

```mermaid
erDiagram
    family ||--|| family_subscription : "اشتراك واحد"
    plan ||--o{ family_subscription : "يُشترَك فيها"
    plan ||--o{ plan_price : "أسعارها لكل سوق"
    plan ||--o{ voucher : "قسائمها"
    family ||--o{ purchase_receipt : "إيصالاتها"
    family ||--o{ payment_confirmation : "مدفوعاتها"
    payment_confirmation ||--o{ purchase_receipt : "عند التحقق يُكتب إيصال"
    family ||--o{ quota_usage : "عدّاداتها"
    family ||--o{ voucher : "يستبدلها"
    family_subscription ||--o{ AuditEvent : "أحداثها تُسجَّل"
    purchase_receipt ||--o{ AuditEvent : "يُسجَّل"
    voucher ||--o{ AuditEvent : "استبداله يُسجَّل"

    plan {
        uuid plan_id PK
        text tier_level
        text title_ar
        text description_ar
        text billing_interval
        jsonb flags
        jsonb quotas
        boolean is_active
    }
    plan_price {
        uuid plan_id PK, FK
        text market PK
        int price_cents
        text currency
        boolean is_active
    }
    topup_product {
        uuid product_id PK
        text market PK
        int pack_messages
        int price_cents
        text currency
        boolean is_active
    }
    family_subscription {
        uuid id PK
        uuid family_id FK, UK
        uuid plan_id FK
        text status
        text billing_provider
        text provider_subscription_id
        text provider_original_transaction_id
        timestamptz current_period_start
        timestamptz current_period_end
        timestamptz trial_started_at
        timestamptz trial_ends_at
        timestamptz grace_started_at
        timestamptz grace_ends_at
        boolean auto_renew
        boolean trial_used
        uuid purchased_by FK
    }
    purchase_receipt {
        uuid id PK
        uuid family_id FK
        uuid user_id FK
        text provider
        text product_id
        text receipt_data
        text validation_status
        timestamptz server_verified_at
        jsonb raw_provider_response
    }
    payment_confirmation {
        uuid payment_id PK
        uuid family_id FK
        uuid plan_id FK
        text channel
        text provider
        text reference
        text status
        uuid initiated_by
        timestamptz initiated_at
        timestamptz confirmed_at
        timestamptz verified_at
    }
    voucher {
        uuid voucher_id PK
        text code
        uuid plan_id FK
        int duration_months
        text status
        text issued_by
        timestamptz issued_at
        uuid redeemed_by_family_id FK
        timestamptz redeemed_at
        timestamptz expires_at
    }
    quota_usage {
        uuid family_id PK, FK
        text period PK
        int sms_sent
        int sms_emergency_used
        int sms_otp_used
        int ai_calls
        int topup_sms_balance
        timestamptz updated_at
    }
    family {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
    }
```

- `tier_level`: FREE / BASIC / PREMIUM؛ و`billing_interval`: LIFETIME_FREE / MONTHLY / ANNUAL؛ و`status`: ACTIVE / TRIAL / IN_GRACE_PERIOD / EXPIRED / CANCELLED؛ و`billing_provider`: SYSTEM_FREE / GOOGLE_PLAY / APPLE_APP_STORE / WALLET / VOUCHER / MANUAL؛ و`validation_status`: VALIDATED_SUCCESS / FRAUD_SUSPECT / EXPIRED؛ وحالة القسيمة: ISSUED / REDEEMED / REVOKED / EXPIRED؛ و`payment_confirmation.status`: INITIATED / PENDING_VERIFICATION / VERIFIED / REJECTED؛ و`payment_confirmation.channel`: WALLET / MANUAL (§5).
- `flags` و`quotas` من نوع jsonb — تعديل الأعلام والحصص بلا كود ولا تغيير مخطط (Q-055)؛ و`receipt_data` حمولة مشفرة؛ والمفتاح المركب لعدّاد الاستهلاك `family_id + period` (YYYY-MM) (§5) — فترة الحصة شهر تقويمي (Q-252)، مستقلة عن فترة الاشتراك المدفوعة (`current_period_start`/`current_period_end`).
- منتج التعبئة `topup_product` مستوى الكتالوج — يُقرأ عبر `GET /api/v1/plans` لا لكل خطة؛ والمفتاح المركب `product_id + market`؛ وصفوف البذرة محكومة (G-S04-08 أُغلق 2026-11-08 — Q-339 · Q-340): الخليج 5.99 ر.س / اليمن 250 ر.ي لحزمة 50 رسالة.
- مصفوفة الخطط (§1 · REQ-001): المجانية حتى 5 أفراد + 20 SMS شهرياً؛ الأساسية حتى 10 أفراد + 50 SMS؛ المميزة غير محدودة + 100 SMS (Q-261)؛ وسجل المواقع 7 أيام في كل الخطط (Q-105)؛ وميزانية الذكاء (Q-335 · Q-336 — الوحدة = استدعاء ذكاء واحد عبر البوابة؛ والمصنف معفى من ميزانية العائلة): المجانية 300 وحدة/شهر — تحقق المهام فقط؛ الأساسية 1,000 — تحقق + مساعد محدود؛ المميزة 3,000 — كاملة.

## 3. التسلسل (Sequence) — من عقود §4

خمسة مخططات، كل واحد لتدفق واحد — زائد مخططا الدفع اليمني (3-و/3-ز، Q-251) ومخطط إصدار القسائم (3-ح، Q-258): ثمانية مخططات بالمجموع.

### 3-أ. الترقية عبر المتجر — الخليج (REQ-005/007 — §4)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant K as Kotlin
    participant Ktor as الخادم
    participant Store as المتجر
    participant Audit as التدقيق
    Father->>App: اختيار المميزة من شاشة المقارنة
    App->>K: launchStorePurchase
    K->>Store: فتح ورقة شراء Google Play
    Store-->>K: إيصال الشراء
    K->>Ktor: POST /api/v1/families/{id}/billing/purchase/verify-receipt {receipt_data}
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
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Audit as التدقيق
    Father->>App: إدخال كود القسيمة
    App->>Ktor: POST /api/v1/families/{id}/billing/voucher/redeem {code}
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
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Guard as الحارس
    participant S107 as الموقع
    participant Broker as الوسيط MQTT
    rect rgb(235, 245, 235)
        Note over Father,Ktor: شراء حزمة تعبئة
        Father->>App: شراء حزمة تعبئة 50 رسالة (الخليج 5.99 ر.س / اليمن 250 ر.ي — Q-339 · Q-340)
        App->>Ktor: POST /api/v1/families/{id}/billing/topup
        Ktor->>Ktor: تحقق الدفع خادمياً + إضافة 50 إلى topup_sms_balance
        Ktor-->>App: الرصيد أُضيف فوراً لرصيد الشهر
        Note over Ktor: رصيد التعبئة ينتهي بنهاية الشهر التقويمي ولا يتراكم (Q-252)
    end
    rect rgb(255, 243, 224)
        Note over S107,Guard: تجاوز طوارئ SOS
        S107->>Guard: طلب إرسال SMS (SOS)
        Guard->>Ktor: فحص quota_usage (sms_sent + topup_sms_balance)
        alt رصيد متاح
            Guard-->>S107: سماح بالإرسال
        else الحصة نفدت — رسالة SOS
            Guard->>Guard: فحص sms_emergency_used < 3 في الشهر التقويمي (Q-252)
            alt أقل من 3
                Guard-->>S107: سماح — رسالة طوارئ (SOS فقط)
                Guard->>Broker: نشر family/{family_id}/billing/quota-warning
                Broker->>Father: إشعار فوري بكل رسالة طارئة
            else 3 مستخدمة
                Guard-->>S107: حظر حتى التعبئة أو التجديد
                Guard->>Broker: نشر family/{family_id}/billing/quota-warning
                Broker->>Father: إشعار فوري عند النفاد
            end
        end
    end
```

- الحصص تُفرض على الخادم عند كل استخدام؛ وعرض العميل استرشادي فقط (§6)؛ وتنبيه للأب عند 80% (Q-216) من أي حصة (§6)؛ وحصة SMS حسب الخطة: 20 / 50 / 100 شهرياً (Q-126 · Q-261 · REQ-019)؛ وتجاوز الطوارئ 3 رسائل SOS في كل شهر تقويمي (Q-106 · Q-252)؛ وسعر حزمة التعبئة من جدول `topup_product` (§5) عبر الكتالوج: الخليج 5.99 ر.س / اليمن 250 ر.ي (Q-339 · Q-340 — G-S04-08 أُغلق).

### 3-د. التجربة ثم السماح ثم التراجع اللبق (REQ-012/013/014 — §4/§6)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Sched as المجدول
    participant Broker as الوسيط MQTT
    Father->>App: بدء التجربة 7 أيام للمميزة
    App->>Ktor: POST /api/v1/families/{id}/plan/trial/start
    alt لم تُستخدم التجربة من قبل
        Ktor->>Ktor: status=TRIAL + trial_used=true — 7 أيام
        Ktor-->>App: تجربة مفعّلة
    else تجربة سابقة
        Ktor-->>App: TRIAL_ALREADY_USED
    end
    Note over Sched: عند انتهاء التجربة بلا تجديد
    Sched->>Ktor: دخول فترة السماح — status=IN_GRACE_PERIOD — 3 أيام
    Ktor->>Broker: نشر family/{family_id}/billing/sub-grace-period
    Broker->>Father: حدث فترة السماح — الميزات تبقى
    Father->>App: تجديد الآن أثناء السماح (زر S04-09)
    App->>Ktor: POST /api/v1/families/{id}/plan/renew {plan_id} — المفتاح billing.manage
    Ktor-->>App: {plan_id, status: "ACTIVE", current_period_start, current_period_end}
    Note over Sched: عند انتهاء السماح بلا تجديد
    Sched->>Ktor: تراجع لبق — كتابة واحدة: status=ACTIVE على الخطة المجانية + AuditEvent بانتهاء الخطة المدفوعة
    Ktor-->>Father: بلا قفل وبلا حذف بيانات — الأعضاء الحاليون يبقون
```

- الانتهاء بطابع وقت الخادم فقط — ساعة العميل لا يُعتد بها أبداً (§6)؛ والتجربة مرة واحدة لكل عائلة وغير قابلة للتحويل (§6)؛ والترقية أثناء فترة السماح تنهي السماح فوراً وتفعّل الخطة الجديدة (§7).

### 3-هـ. تجاوز حصة الأفراد وبطاقة الترقية اللبقة (REQ-009 — §2 سيناريو 4-6)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant S102 as الهوية
    Father->>App: إضافة العضو السادس (الخطة المجانية — الحد 5)
    App->>Ktor: طلب إضافة عضو
    Ktor->>S102: عدد الأعضاء الحاليين
    S102-->>Ktor: 5 أعضاء
    Ktor->>Ktor: حارس الحصص — 5 >= 5
    Ktor-->>App: QUOTA_EXCEEDED + بطاقة ترقية لبقة
    App-->>Father: بطاقة ترقية لبقة (لا حظر قاسٍ)
    Father->>App: الترقية للأساسية (حتى 10 أفراد)
    App->>Ktor: POST /api/v1/families/{id}/plan/upgrade
    Ktor-->>App: تفاصيل الدفع حسب القناة (المتجر / محفظة / قسيمة) — بلا تفعيل بعد
    Father->>App: إتمام الدفع بالقناة المختارة
    App->>Ktor: POST /api/v1/families/{id}/billing/verify-receipt {provider, receipt_data} — أو wallet/confirm أو voucher/redeem حسب القناة
    alt تحقق خادمي صحيح
        Ktor->>Ktor: تفعيل الاشتراك
        Ktor-->>App: ترقية مفعّلة — إضافة العضو تنجح
    else إيصال مزوَّر أو مكرر
        Ktor-->>App: 409 FRAUD_SUSPECT / REFERENCE_DUPLICATE — بلا تفعيل
    end
```

- الأعضاء الحاليون عند التراجع اللبق يبقون فعالين مع حظر إضافة جدد فقط (REQ-014)؛ وحد الأفراد: 5 / 10 / غير محدود (§1).

### 3-و. بدء دفع محفظة يمنية والتحقق منه (REQ-006 — §4/§5 — Q-251)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Adapter as محول مزوّد المحفظة
    participant Audit as التدقيق
    Father->>App: اختيار محفظة يمنية من S04-05
    App->>Ktor: POST /api/v1/families/{id}/billing/wallet/initiate {plan_id, provider}
    Ktor->>Ktor: إنشاء سجل دفع payment_confirmation (status=INITIATED)
    Ktor-->>App: {payment_id, status: "initiated"}
    Father->>App: إتمام الدفع في تطبيق المحفظة
    App->>Ktor: POST /api/v1/families/{id}/billing/wallet/confirm {payment_id, wallet_reference}
    alt رقم مرجعي مستخدم من قبل
        Ktor-->>App: 409 REFERENCE_DUPLICATE
    else رقم مرجعي جديد
        Ktor->>Ktor: status=PENDING_VERIFICATION — بانتظار تحقق المزوّد
        Ktor-->>App: {payment_id, status: "pending_verification"}
        Adapter->>Ktor: تأكيد المزوّد عبر المحول — بلا تفاصيل API حتى عقد حقيقي
        alt تأكيد صحيح
            Ktor->>Ktor: status=VERIFIED + تفعيل الاشتراك + سجل purchase_receipt
            Ktor->>Audit: AuditEvent (domain=billing)
            Ktor-->>App: اشتراك ACTIVE
        else رفض التحقق
            Ktor->>Ktor: status=REJECTED
            Ktor-->>App: PAYMENT_FAILED — الاشتراك الحالي يبقى حتى نهاية فترته
        end
    end
```

- الرقم المرجعي نص معتم ينقله الأب كما يظهر في تطبيق المحفظة — لا يُعتمد دليل دفع حتى تحقق المزوّد عبر `WalletProviderAdapter` (بلا تفاصيل API حتى عقد حقيقي)؛ ولا يُفعَّل الاشتراك قبل `VERIFIED` (REQ-007)؛ وتفاصيل تمرير المبلغ إلى تطبيق المحفظة من العقد الحقيقي — لا تُخترع هنا (§4).

### 3-ز. تأكيد دفع يدوي مسبق (REQ-006 — §4/§5 — Q-251)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Audit as التدقيق
    Father->>App: إدخال الرقم المرجعي للدفع اليدوي المسبق
    App->>Ktor: POST /api/v1/families/{id}/billing/manual/confirm {plan_id, reference}
    alt رقم مرجعي مستخدم من قبل
        Ktor-->>App: 409 REFERENCE_DUPLICATE
    else رقم مرجعي جديد
        Ktor->>Ktor: إنشاء سجل دفع payment_confirmation (status=PENDING_VERIFICATION)
        Ktor->>Audit: AuditEvent (domain=billing)
        Ktor-->>App: {payment_id, status: "pending_verification"}
        Note over Ktor: لا يُفعَّل الاشتراك قبل التحقق الخادمي (REQ-007)؛ وقناة التحقق تُسمى عند إجراء حقيقي — بلا تفاصيل مخترعة
    end
```

- الدفع اليدوي مسبق: الأب يدفع أولاً خارج التطبيق ثم يؤكد بالرقم المرجعي؛ والسجل يبقى «بانتظار التحقق» حتى يصل التحقق الخادمي؛ ولا تفعيل قبل `VERIFIED` (§4).

### 3-ح. إصدار قسيمة وإلغاؤها — مشغّل المنصة (REQ-018 — §4 — Q-258)

```mermaid
sequenceDiagram
    autonumber
    actor Operator as مشغّل المنصة
    participant Admin as لوحة الإدارة
    participant Ktor as الخادم
    participant Audit as التدقيق
    Operator->>Admin: إنشاء قسيمة — الخطة والمدة والانتهاء
    Admin->>Ktor: POST /api/v1/admin/vouchers {plan_id, duration_months, expires_at}
    Note over Ktor: المفتاح billing.plan.edit — مالك المنصة وحده — غيره 403
    alt مفتاح صالح وخطة موجودة
        Ktor->>Ktor: إنشاء قسيمة status=ISSUED
        Ktor->>Audit: AuditEvent (domain=billing)
        Ktor-->>Admin: {voucher_id, code, status: "ISSUED"}
    else بلا مفتاح أو خطة غير موجودة
        Ktor-->>Admin: 403 / PLAN_NOT_FOUND
    end
    Note over Operator: التوزيع على الأب عبر وكيل — Q-025 — لا الإصدار
    Operator->>Admin: إلغاء قسيمة قبل استخدامها
    Admin->>Ktor: POST /api/v1/admin/vouchers/{code}/revoke
    Ktor->>Ktor: status=REVOKED
    Ktor->>Audit: AuditEvent (domain=billing)
    Ktor-->>Admin: {code, status: "REVOKED"}
```

- الإصدار والإلغاء لمشغّل المنصة حصراً؛ والعائلات لا تصدر قسائم أبداً في المرحلة 1 (Q-258)؛ والقسيمة المصدرة `status=ISSUED` قابلة للإلغاء قبل الاستخدام، وتُرفض عند الاستبدال بعد إلغائها (`VOUCHER_REVOKED` — REQ-008)؛ والتوزيع على الأب عبر وكيل لا الإصدار (Q-025).

### 3-ط. مفتاح إيقاف الذكاء للمسؤول (Q-338 — D-10 — §4-2)

```mermaid
sequenceDiagram
    autonumber
    actor Operator as مشغّل المنصة
    participant App as لوحة المسؤول
    participant Ktor as الخادم
    participant Gateway as بوابة الذكاء
    participant Audit as التدقيق
    Operator->>App: قلب مفتاح إيقاف الذكاء (enabled: true/false)
    App->>Ktor: POST /api/v1/admin/ai/kill-switch — المفتاح billing.plan.edit (Q-260)
    Ktor->>Ktor: قلب المفتاح على مستوى المنصة
    Ktor->>Gateway: إيقاف مزايا الذكاء غير الآمنة (المصنف مستمر — Q-335)
    Ktor->>Audit: AuditEvent (domain=billing) — كل قلب مسجل
    Ktor-->>App: {enabled, updated_at}
```

- وعند بلوغ سقف المنصة الشهري $200 (Q-337) يقلب النظام المفتاح تلقائياً + إشعار المالك؛ والاستئناف يحتاج اعتماداً كتابياً جديداً (Q-013)؛ وتنبيه عند 80% ($160).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات السبعة (§2)

```mermaid
flowchart TD
    Start([عائلة جديدة تُنشأ]) --> Free[بدء تلقائي على المجانية ACTIVE — 0 ر.س — REQ-002]
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
    Quota -->|أفراد / SMS| Card[بطاقة ترقية لبقة]
    Quota -->|"ذكاء — نفاد الميزانية (300/1,000/3,000 وحدة — Q-336) أو مفتاح الإيقاف (Q-338)"| AIOff[إيقاف مزايا الذكاء — السلامة مستمرة]
    Card --> Upgrade[ترقية فورية]
    Upgrade --> Use
    Quota -->|لا| End1([مستمر])
    Trial --> Expire{انتهاء التجربة بلا تجديد؟}
    Expire -->|نعم| Grace[سماح 3 أيام — الميزات تبقى]
    Grace --> Renew{"تجديد الآن؟ — POST /api/v1/families/{id}/plan/renew (زر S04-09)"}
    Renew -->|نعم| Active
    Renew -->|لا| Down[تراجع لبق للمجانية — بلا قفل وبلا حذف]
    Down --> Stay
    View --> Hub{عرض من مركز الأوامر S1-09؟}
    Hub -->|نعم| ReadOnly[عرض قراءة فقط + زر إدارة ينقل إلى S1-04]
    ReadOnly --> View
```

- ملاحظة: الفوترة مخفية تماماً عن الأطفال والمراهقين — لا تُعرض ولا تُذكر (§6)؛ والخطة في S1-09 للقراءة فقط (REQ-015).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D6 وD8–D9 (جداول خادم PostgreSQL). المخزن D7 محفوظ محلياً على الجهاز (للقراءة دون اتصال) وليس جدول خادم.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4 تظهر هنا على الأقل: `POST /api/v1/families/{id}/billing/restore` (استعادة المشتريات — REQ-005 — حافة Father→P2) · `POST /api/v1/families/{id}/plan/cancel-renewal` (إلغاء التجديد التلقائي — تمر عبر P5) · `GET /api/v1/families/{id}/billing/usage` (استهلاك الحصص SMS/أفراد/ذكاء — REQ-017 — حافتا Father→P4 وP4→Father؛ الرد: المستخدم/الحد لكل حصة + الفترة YYYY-MM + رصيد التعبئة + الطوارئ المتبقية) · `PATCH /api/v1/admin/plans/{planId}` (تعديل أعلام/حصص الخطة بلا كود، إداري فقط — حافة Admin→P7 — المفتاح: `billing.plan.edit` — Q-260 — مالك المنصة وحده؛ غيره 403)؛ [تصحيح 2026-11-08 (D-2): كانت النقاط الثلاث الأولى نثراً فقط في هذه الملاحظة؛ رُسمت الآن كحواف.] ونقاط الدفع اليمني الجديدة `POST /api/v1/families/{id}/billing/wallet/initiate` و`POST /api/v1/families/{id}/billing/wallet/confirm` و`POST /api/v1/families/{id}/billing/manual/confirm` تمر عبر P3 (3-و/3-ز — Q-251)؛ وبقية النقاط مرسومة في §3 (plan ترقية، verify-receipt، voucher/redeem، topup، trial/start)؛ و`GET /api/v1/plans` و`GET /api/v1/families/{id}/plan` في §6 (V1).

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Operator([مشغّل المنصة — المالك/فريقه])
    Admin([مسؤول اللوحة])
    S109([مركز الأوامر S1-09])
    S102([نظام الهوية S1-02])
    S107([نظام الموقع S1-07])
    Store([متجر / بوابة بطاقات])
    Wallet([محفظة يمنية])
    Broker([الوسيط MQTT])
    App([التطبيق — Flutter])

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
        D8[(D8 payment_confirmation)]
        D9[(D9 topup_product)]
    end

    Audit([AuditEvent — domain=billing])

    Father -->|اختيار خطة / تجربة / إلغاء تجديد| P1
    Adult -->|عرض الخطة والاستهلاك| P1
    P1 -->|قراءة الخطط والأسعار| D1
    P1 -->|قراءة الأسعار لكل سوق| D2
    P1 -->|قراءة منتجات التعبئة| D9
    P1 -->|قراءة الاشتراك والاستحقاق| D3
    P1 -->|إلغاء تجديد → auto_renew=false| P5
    P1 -->|الخطة + الاستهلاك| Father
    P1 -->|الخطة — قراءة فقط| S109
    S109 -->|زر إدارة| P1
    Father -->|شراء عبر المتجر| P2
    Father -->|"استعادة المشتريات — POST /api/v1/families/{id}/billing/restore (REQ-005)"| P2
    Store -->|إيصال الشراء| P2
    P2 -->|تحقق S2S| Store
    P2 -->|حفظ الإيصال والتحقق| D4
    P2 -->|تفعيل الاشتراك| D3
    Father -->|قسيمة / محفظة / دفع يدوي| P3
    Wallet -->|تأكيد الدفع| P3
    Operator -->|"إصدار قسيمة — مشغّل المنصة عبر POST /api/v1/admin/vouchers بمفتاح billing.plan.edit (Q-258/Q-260)"| P3
    P3 -->|إصدار / استبدال قسيمة| D5
    P3 -->|التحقق من القسيمة| D5
    P3 -->|حفظ سجل الدفع / التأكيد اليدوي| D8
    P3 -->|تفعيل الاشتراك| D3
    S102 -->|عدد الأعضاء| P4
    S107 -->|طلب SMS| P4
    Father -->|"GET /api/v1/families/{id}/billing/usage — استهلاك الحصص (REQ-017)"| P4
    P4 -->|المستخدم/الحد لكل حصة + الفترة YYYY-MM + رصيد التعبئة + الطوارئ المتبقية| Father
    P4 -->|قراءة / تحديث العدّادات| D6
    P4 -->|قراءة سعر الحزمة| D9
    P4 -->|تجاوز → بطاقة ترقية لبقة| Father
    P4 -->|نفاد SMS → 3 طوارئ SOS فقط| S107
    P5 -->|انتهاء تجربة / سماح| D3
    P5 -->|تحديث الحالة| D3
    P6 -->|"family/{family_id}/billing/subscription-changed و family/{family_id}/billing/quota-warning و family/{family_id}/billing/sub-grace-period و family/{family_id}/billing/sub-renewed"| Broker
    Broker -->|المواضيع الأربعة — اشتراك S1-09| S109
    Broker -->|"family/{family_id}/billing/quota-mirror"| S107
    P6 -->|"تنبيه 80% (Q-216) وإشعار طوارئ فوري"| Father
    Admin -->|"تعديل أعلام / حصص — PATCH /api/v1/admin/plans/{planId} (Q-260 — billing.plan.edit)"| P7
    P7 -->|حفظ بلا تغيير مخطط| D1
    P1 -->|الخطة + الاستهلاك| App
    App -->|نسخة محفوظة دون اتصال — يكتبها العميل| D7
    D7 -->|عرض مع وقت صريح| Father
    P2 -->|كل شراء / ترقية / إلغاء / استبدال| Audit
    P3 -->|كل استبدال| Audit
    P5 -->|كل تراجع| Audit
```

- ملاحظة: Webhook المتجر للتجديد التلقائي يُعالج idempotent بمفتاح المعاملة — لا ترقية مزدوجة (§7)؛ وفشل التحقق من الإيصال لعطل اتصال بالمتجر يعطي سماحاً مؤقتاً 24 ساعة (Q-215) ثم إعادة محاولة (§7).

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
        F6(["استلام إشعار 80% (Q-216) أو طارئ"])
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
        V1["GET /api/v1/plans + GET /api/v1/families/{id}/plan"]
        V2[تحقق S2S من الإيصال / القسيمة]
        V3[تفعيل الاشتراك + الاستحقاقات]
        V4[حارس الحصص — أفراد / SMS / ذكاء]
        V5[إصدار أحداث MQTT]
        V6[تسجيل AuditEvent]
        V7[تعيين auto_renew=false — الميزات تبقى حتى نهاية الفترة]
    end
    subgraph Provider [مزودو الدفع]
        direction TB
        R1[Google Play / App Store]
        R2[Tap / Moyasar — بطاقات]
        R3[OneCash / Mahfathati — محافظ]
        R4["وكيل — توزيع قسيمة صادرة من مشغّل المنصة (Q-258)"]
    end
    subgraph Sched [المجدول]
        direction TB
        G1[انتهاء التجربة 7 أيام]
        G2[سماح 3 أيام]
        G3[تراجع لبق للمجانية]
        G4["تصفير الحصص أول كل شهر تقويمي (Q-252)"]
        G5["انتهاء الفترة المدفوعة بلا تجديد (auto_renew=false)"]
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
    V2 -->|"تحقق الدفع — إضافة رصيد التعبئة (Q-180)"| V4
    V3 --> V5
    V3 --> V6
    V3 --> A5
    V4 --> A6
    A6 --> F2
    F4 --> V2
    F5 --> V7
    G1 --> G2
    G2 --> G3
    G3 --> V3
    G5 --> G3
    G4 --> V4
    V5 --> F6
    V4 --> F6
```

- عند انتهاء الفترة دون اتصال بالخادم، تُعرض الخطة المحفوظة مع وقت صريح، ويُتحقق من الانتهاء عند أول اتصال بطابع الخادم (§7)؛ وميزانية ذكاء لكل عائلة حسب خطتها (300/1,000/3,000 وحدة — Q-336) + مفتاح إيقاف، ونفاد الميزانية يوقف مزايا الذكاء دون أن يمس السلامة (REQ-016)؛ وسقف المنصة الشهري $200 (Q-337 — تنبيه 80% / إيقاف صلب 100% لمزايا الذكاء غير الآمنة، والمصنف مستمر)؛ ومفتاح إيقاف المسؤول `POST /api/v1/admin/ai/kill-switch` (Q-338 — مشغّل المنصة وحده، المفتاح `billing.plan.edit` — مرسوم في 3-ط)؛ وإصدار القسائم لمشغّل المنصة حصراً (Q-258) — التوزيع عبر وكيل لا الإصدار.
