# S1-03: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** معتمدة — المخططات الستة معتمدة (حكم المالك 2026-11-08 — D-2، بعد موجة الإصلاح 0e4a3e2..f7da470)؛ والمواصفة معتمدة بالكامل في التخطيط؛ **وأُعيد رسمها كلها 2026-11-16 على التصميم المعتمد (Q-401 · Q-402) — تأكيد المالك للرسم الجديد بكلمة (Q-289) لم يصدر بعد**
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** #2 الصلاحيات (Permissions) — `CONTEXT-MAP.md` §2 صف 2
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-006 · Q-007 · Q-010 · Q-065 · Q-072 · Q-080 · Q-085 · Q-086 · Q-087 · Q-088 · Q-089 · Q-093 · Q-164 · Q-166 · Q-189 · Q-174 · Q-201 · Q-204 · Q-227 · Q-232 · Q-235 · Q-248 · Q-250 · D-006 · D-021 · D-023 · D-038 · G-006 · G-011 · Q-168 · Q-329 · Q-330 · Q-343 · Q-401 · Q-402 · Q-257 · Q-269 · Q-291 · Q-344 — ونُقض بـ Q-401 فخرج من الرسم: Q-139 · Q-162 · Q-259
- **تحديث 2026-11-16 (Q-401 · Q-402) — إعادة رسم كاملة:** المخططات الستة مرسومة الآن على التصميم المعتمد (SPEC §9-8)، والرسم والنص متطابقان فلا ملاحظة تسود على رسم. ما تغيّر: (1) «الصلاحية الكاملة» بدل نقل الملكية — تُعطى فتسري فوراً بلا قبول، والمالك يبقى مالكاً ويسحبها؛ (2) لكل صلاحية حالتها ونطاقها ومدتها، والمنع الصريح ظاهر؛ (3) الأدوار الثلاثة تُعدَّل لكل عائلة؛ (4) كل تغيير من المالك يتبعه إشعار للعضو؛ (5) طلب الصلاحية من البالغ والمراهق؛ (6) حذف حساب المالك يسلّم العائلة لحامل الصلاحية الكاملة بعد 30 يوماً. الجديد في الرسم: فاعل «بالغ يحمل الصلاحية الكاملة»، الجدول `full_authority` وجداول تعديل الأدوار، والتسلسلات 3-ي و3-ك و3-ل.
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

23 حالة استخدام من السيناريوهات الاثني عشر والمتطلبات (§2/§3) ومن التصميم المعتمد (SPEC §9-8 — Q-401 · Q-402)، في أربع مجموعات مرسومة على لوحتين (1-أ و1-ب): **(أ) إدارة صلاحيات الأعضاء** للمالك، ولبالغ يحمل الصلاحية الكاملة بقاعدة المالك؛ **(ب) الصلاحية الكاملة** يعطيها المالك نفسه ويسحبها؛ **(ج) العضو مع صلاحياته** يراها ويطلب ويصله إشعار بكل تغيير؛ **(د) الفحص** — كل فحص صلاحية في المنصة يمر بمحرك التقييم (deny-override — Q-007). البالغ المفوَّض يمارس ما فُوِّض له فقط ولا يفوِّض غيره؛ والمراهق يدير مهامه الخاصة فقط.

**1-أ. من يدير: صلاحيات الأعضاء والصلاحية الكاملة (المجموعتان أ وب)**

```mermaid
flowchart LR
    Father([الأب — المالك])
    Holder([بالغ يحمل الصلاحية الكاملة])
    Adult([البالغ المفوَّض])
    Mgr([من يدير العائلة: المالك أو حامل الصلاحية الكاملة])
    S102([نظام الهوية S1-02 — العضوية])
    S101([نظام الغلاف S1-01 — بوابة الوالدين])
    Eval([محرك التقييم deny-override])

    subgraph S103A [S1-03: إدارة صلاحيات الأعضاء والصلاحية الكاملة]
        direction TB
        UC1(UC1 منح صلاحية — نطاق ومدة لكل صلاحية)
        UC2(UC2 تعديل منح — النطاق / المدة)
        UC3(UC3 سحب منح — فوري)
        UC4(UC4 منع صريح ورفعه)
        UC5(UC5 تطبيق دور على عضو)
        UC6(UC6 تعديل محتوى دور)
        UC7(UC7 عرض الصلاحيات الفعلية لعضو)
        UC8(UC8 عرض سجل المفاتيح)
        UC9(UC9 عرض سجل التدقيق)
        UC10(UC10 قرار في طلب صلاحية)
        UC11(UC11 مراجعة منح الطفل عند بلوغ 13)
        UC12(UC12 حذف العائلة — يتضمن إلغاء الحذف المعلق)
        UC13(UC13 إزالة عضو — يتضمن إلغاء الحذف المعلق)
        UC14(UC14 إعطاء الصلاحية الكاملة لبالغ)
        UC15(UC15 سحب الصلاحية الكاملة)
        UC23(UC23 تسلّم العائلة بعد حذف حساب المالك)
    end

    Father --> Mgr
    Holder --> Mgr
    Mgr --> UC1
    Mgr --> UC2
    Mgr --> UC3
    Mgr --> UC4
    Mgr --> UC5
    Mgr --> UC6
    Mgr --> UC7
    Mgr --> UC8
    Mgr --> UC9
    Mgr --> UC10
    Mgr --> UC11
    Mgr --> UC12
    Mgr --> UC13
    Father -->|المالك نفسه وحده| UC14
    Father -->|المالك نفسه وحده| UC15
    Holder --> UC23
    Adult -->|إن فُوِّض| UC8
    Adult -->|إن فُوِّض| UC9
    S102 --> UC7
    S102 --> UC11
    S102 -->|اكتمال مهلة حذف حساب المالك| UC23
    UC1 -.->|يتضمن عند صلاحية حساسة| S101
    UC5 -.->|يتضمن عند دور فيه صلاحية حساسة| S101
    UC12 -.->|يتضمن| S101
    UC14 -.->|يتضمن| S101
    UC1 --> Eval
    UC3 --> Eval
    UC4 --> Eval
    UC14 --> Eval
    UC15 --> Eval
```

**1-ب. العضو مع صلاحياته والفحص (المجموعتان ج ود)**

```mermaid
flowchart LR
    Adult([البالغ المفوَّض])
    Holder([بالغ يحمل الصلاحية الكاملة])
    Teen([المراهق])
    Child([الطفل])
    Consumers([الأنظمة المستهلكة S1-05/S1-06/S1-07/S1-08/S1-09/S1-10])
    Father([الأب — المالك])
    Eval([محرك التقييم deny-override])

    subgraph S103B [S1-03: العضو مع صلاحياته والفحص]
        direction TB
        UC16(UC16 عرض صلاحياتي وآخر ما تغيّر)
        UC17(UC17 طلب صلاحية)
        UC18(UC18 استلام إشعار بتغيير صلاحياتي)
        UC19(UC19 إدارة المراهق لمهامه الخاصة — REQ-015)
        UC20(UC20 محاولة تصعيد — مرفوضة)
        UC21(UC21 فحص صلاحية خادمي)
        UC22["UC22 فحص صلاحية محلي O(1) على جهاز الطفل"]
    end

    Adult --> UC16
    Adult --> UC17
    Adult --> UC18
    Holder --> UC18
    Teen --> UC16
    Teen --> UC17
    Teen --> UC18
    Teen --> UC19
    Teen --> UC20
    Child --> UC20
    Consumers --> UC21
    Consumers --> UC22
    UC17 -.->|يصل المالك ليقرر — UC10| Father
    Father -.->|كل تغيير منه يتبعه| UC18
    UC19 --> Eval
    UC20 --> Eval
    UC21 --> Eval
    UC22 --> Eval
```

- **أ (UC1–UC13)** للمالك ولحامل الصلاحية الكاملة بقاعدة المالك (REQ-010/016)؛ الحامل لا يعدّل منح نفسه ولا يزيل المالك (SPEC §7-16)؛ والبالغ المفوَّض لا يفوِّض غيره (لا تفويض متسلسل).
- **UC1/UC2:** لكل صلاحية نطاقها ومدتها وحدها (REQ-011 — Q-401). **UC4:** المنع الصريح ظاهر، ويبقى عند تغيير الدور حتى يُرفع أو تُسحب كل منح العضو (REQ-004/014 — Q-402).
- **UC5/UC6:** الأدوار الثلاثة تُعدَّل لكل عائلة، وتعديل الدور لا يغيّر من طُبّق عليه من قبل (REQ-013/014 — Q-089).
- **ب (UC14/UC15)** للمالك نفسه وحده: الصلاحية الكاملة تسري فوراً بلا قبول، والمالك يبقى مالكاً ويسحبها متى شاء (REQ-016 — Q-401). **UC23:** المالك يحذف حسابه والصلاحية الكاملة عند بالغ، فيصير ذلك البالغ مالكاً بعد 30 يوماً (SPEC §7-18 — Q-402) — مرسوم في 3-ك.
- **ج (UC16–UC18 — R03-17 · R03-11):** العضو يرى منح نفسه فقط، يطلب صلاحية بنقرة (بالغ أو مراهق — Q-402)، ويصله إشعار بكل تغيير من المالك بلا خطوة قبول (REQ-010).
- حذف العائلة وإزالة عضو (UC12/UC13) لا يُمنحان مفردين (REQ-020 · Q-166)؛ وحذف العائلة بشرط PIN/بصمة مثبَتة بالتحدي (Q-164)، وإزالة العضو بشرط مفتاح `identity.member.remove` + PIN؛ وكلاهما حذف ناعم + سماح 30 يوماً ثم حذف صلب، والإلغاء خلال السماح عبر `POST /api/v1/families/{id}/deletion/cancel`.
- `roles.grant.create` و`roles.grant.edit` و`roles.grant.revoke` و`roles.template.apply` للمالك (§6-1) ويشمله حامل الصلاحية الكاملة بقاعدة المالك؛ `roles.ownership.transfer` للمالك نفسه وحده؛ `roles.key.view` و`roles.audit.view` قابلان للتفويض. (سجل المفاتيح الذرية — Q-010)

## 2. مخطط قاعدة البيانات (ERD)

الجداول التسعة من §5 كما هي، مع أربعة مراجع خارجية: العائلة والعضوية (`membership` — الدور {`adult`، `teen`، `child`} + `is_owner` — سنة الميلاد تحدد الدور: دون 13 → `child`؛ 13–17 → `teen` — REQ-001 · Q-006/Q-080) والشخص (`person`) من S1-02، و`AuditEvent` (النواة المشتركة). ملاحظتان: جداول السجل العام (`permission_key` و`role_template` و`template_key`) مشتركة لكل العائلات بلا `family_id` — بذرة واحدة تخدم كل العائلات؛ وما عداها (`permission_grant` و`permission_request` و`full_authority` و`family_role` و`family_role_key` و`member_role`) يحمل `family_id` + عزل RLS (D-021). ولقطة المنح المحلية (REQ-006) مخزن عميل على الجهاز وليست جدول خادم، فلا تظهر جدولاً هنا.

```mermaid
erDiagram
    family ||--o{ permission_grant : "له منح"
    family ||--o{ full_authority : "له حاملو الصلاحية الكاملة"
    family ||--o{ family_role : "عدّل أدواراً"
    membership ||--o{ permission_grant : "الممنوح له عضو"
    membership ||--o{ full_authority : "الحامل بالغ"
    membership ||--o| member_role : "آخر دور طُبّق عليه"
    membership ||--o{ permission_request : "يطلب صلاحية"
    person ||--o{ full_authority : "أعطاها المالك"
    permission_key ||--o{ permission_grant : "مفتاح المنح"
    permission_key ||--o{ template_key : "مفاتيح البذرة"
    permission_key ||--o{ family_role_key : "مفاتيح الدور المعدَّل"
    role_template ||--o{ template_key : "بذرته"
    role_template ||--o{ family_role : "تعديل العائلة له"
    role_template ||--o{ member_role : "الدور المطبَّق"
    family_role ||--o{ family_role_key : "يحوي مفاتيح"
    permission_request ||--o{ permission_grant : "موافقته تنشئ منحاً"
    permission_grant ||--o{ AuditEvent : "منحه يُسجَّل"
    full_authority ||--o{ AuditEvent : "إعطاؤها وسحبها يُسجَّلان"

    %% REQ-008 — سجل المفاتيح المركزي
    permission_key {
        text key PK
        text domain
        text title_ar
        text description_ar
        boolean is_sensitive
        timestamptz created_at
    }
    role_template {
        text template_id PK
        text title_ar
        text description_ar
    }
    template_key {
        text template_id FK
        text permission_key FK
        jsonb default_scope
    }
    family_role {
        uuid family_id FK
        text template_id FK
        text title_ar
        text description_ar
        timestamptz updated_at
        uuid updated_by FK
    }
    family_role_key {
        uuid family_id FK
        text template_id FK
        text permission_key FK
        jsonb default_scope
    }
    member_role {
        uuid member_id PK
        uuid family_id FK
        text template_id FK
        timestamptz applied_at
        uuid applied_by FK
    }
    permission_grant {
        uuid grant_id PK
        uuid family_id FK
        uuid member_id FK
        text grantee_type
        text permission_key FK
        jsonb scope
        timestamptz valid_until
        boolean is_granted
        integer version
        uuid granted_by FK
        timestamptz granted_at
        text verification_method
        timestamptz revoked_at
        uuid revoked_by
    }
    permission_request {
        uuid request_id PK
        uuid family_id FK
        uuid member_id FK
        text permission_key FK
        jsonb scope
        text reason
        text status
        timestamptz requested_at
        timestamptz decided_at
        uuid decided_by
    }
    full_authority {
        uuid id PK
        uuid family_id FK
        uuid member_id FK
        uuid granted_by FK
        text status
        text auth_method
        timestamptz granted_at
        timestamptz revoked_at
        timestamptz notice_seen_at
    }
    family {
        uuid id PK
    }
    membership {
        uuid id PK
        uuid family_id FK
        uuid person_id FK
        text role
        boolean is_owner
    }
    person {
        uuid id PK
    }
    AuditEvent {
        uuid id PK
        text domain
        uuid actor
        uuid target_member
        text action
        text permission_key
        timestamptz at
        text result
        timestamptz valid_until
        uuid family_id
    }
```

- `template_key` مفتاحه المركب (`template_id`, `permission_key`) (§5-3)؛ وصفوف البذرة (شريك 43 / وصي محدود 24 / مراقب 10) في SPEC §5-3-أ (Q-262 · Q-329 · Q-330 · Q-343). [تصحيح 2026-11-08 (D-2): كانت 40/22/10 قبل Q-329/Q-330/Q-343.]
- **تسوية المفاتيح (Q-326…Q-333 · Q-343):** المجموع **95 مفتاحاً**: شريك 43 / وصي محدود 24 / مراقب 10؛ و§5-أ (مالك حصري) **28**؛ و§5-ب 23؛ و§5-ج 1 (`identity.device.pair`)؛ 43+28+23+1 = 95. والمراهق (Q-318…Q-325): المفتاح الوحيد القابل للمنح `tasks.create` (scope=self)؛ و14 متأصلة في الدور (Q-253 — أُضيف `tasks.cancel`، scope=self)؛ و5 حدّية حُسمت؛ و75 مستبعدة (76 ← 75 بنقل `tasks.cancel` منها إلى الملازمة)؛ 1+14+5+75 = 95؛ و`tasks.own.manage` محذوف من وايرفريم R03-09 (Q-325).
- `AuditEvent` في ERD يسرد كل حقل في §5-6 (بعد تصحيح R2-S103-19 في B4) — بأنواع مطابقة.
- `permission_request` جدول جديد (§5-7) — طلبات تعديل الصلاحية (R03-17)؛ و`member_id` مفتاح أجنبي إلى `membership.id` (Q-169).
- **توحيد الهوية (Q-169):** `permission_grant.member_id` مفتاح أجنبي إلى `membership.id` (S1-03 SPEC §5-4) — لا إلى `person`؛ فالمراهق والطفل لهما عضوية وبلا `person` (Q-137). وعند منح الوكيل (`grantee_type='agent'`) يكون `member_id` فارغاً.
- `scope` + `valid_until` إلزاميان في كل منح (Q-007 · Q-087)؛ `is_granted=false` رفض صريح وليس غياباً (Q-007).
- `verification_method` قيمه `pin` / `biometric` — للمنح الحساس فقط (REQ-012).
- **`full_authority` (§5-5 — Q-401):** حلّ محل `ownership_transfer`. `status` قيمتاه `active` / `revoked` فقط — لا `pending` ولا `accepted` ولا `expired` ولا `expires_at`؛ صف `active` واحد على الأكثر لكل عضو؛ `auth_method` PIN أو بصمة (Q-093)؛ `notice_seen_at` متى رأى الحامل إشعاره. و`membership.is_owner` لا ينتقل إلا عند اكتمال مهلة حذف حساب المالك (Q-402).
- **`family_role` + `family_role_key` (§5-3-ب — Q-401):** تعديل العائلة لدور؛ صفوف تُكتب فقط حين تعدّل، ومفتاحاهما المركبان (`family_id`, `template_id`) و(`family_id`, `template_id`, `permission_key`). البذرة (`role_template` + `template_key`) لا تُمس.
- **`member_role` (§5-3-ج):** آخر دور طُبّق على العضو — للعرض فقط، ولا يدخل في التقييم.
- المنع الصريح صف في `permission_grant` بـ `is_granted=false`؛ `valid_until` فيه اختياري وغيابه يعني «حتى يُرفع» (Q-402).

## 3. التسلسل (Sequence) — من عقود §4

اثنا عشر مخططاً، كل واحد لتدفق واحد (3-أ … 3-ل):

### 3-أ. إنشاء منح (REQ-010/011/012 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant S101 as البوابة
    participant Ktor as الخادم
    participant Grants as المنح
    participant Audit as التدقيق
    actor Member as العضو
    Father->>App: اختيار عضو + صلاحية + نطاقها + مدتها — لكل صلاحية حدودها (Q-401)
    App->>Ktor: POST /api/v1/families/{id}/members/{memberId}/grants
    alt الطالب ليس المالك ولا يحمل الصلاحية الكاملة
        Ktor-->>App: رفض PERM_NOT_OWNER (§7-6)
    else المفتاح من الثوابت الصلبة
        Ktor-->>App: رفض PERM_HARD_INVARIANT + تنبيه الأب (§7-7)
    else المفتاح غير موجود في السجل
        Ktor->>Audit: تسجيل الرفض خادمياً (لا يُنشأ مفتاح ضمنياً — §7-1)
        Ktor-->>App: رفض PERM_DENIED
    else المفتاح حساس — التحدي أخيراً
        Ktor->>App: تحدٍّ {challenge_id, nonce} — POST /api/v1/shell/verification/challenge (S1-01) — صلاحية 5 دقائق (Q-164)
        App->>S101: طلب تحقق — PIN الأب أو بصمته (Q-088)
        S101-->>App: توقيع nonce بمفتاح الجهاز بعد التحقق المحلي
        App->>Ktor: verification {method, challenge_id, signature, at}
        Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام قبل التنفيذ (Q-164)
        alt بلا verification أو توقيع غير صالح
            Ktor-->>App: رفض PERM_VERIFICATION_REQUIRED
        else التوقيع صالح
            Ktor->>Grants: حفظ المنح (scope + valid_until إلزاميان)
            Ktor->>Audit: تسجيل المنح (من منح / لمن / متى / ينتهي)
            Ktor-->>App: 201 {grant_id}
            App-->>Father: المنح منفَّذ ومسجَّل
            Ktor-->>Member: إشعار — يسري فوراً بلا قبول (Q-401)
        end
    else منح غير حساس
        Ktor->>Grants: حفظ المنح (scope + valid_until إلزاميان)
        Ktor->>Audit: تسجيل المنح (من منح / لمن / متى / ينتهي)
        Ktor-->>App: 201 {grant_id}
        App-->>Father: المنح منفَّذ ومسجَّل
        Ktor-->>Member: إشعار — يسري فوراً بلا قبول (Q-401)
    end
```

- التحقق نفسه محلي (بوابة الوالدين Q-065 / بصمة Q-072) **ويتحقق الخادم من توقيع التحدي بمفتاح الجهاز العام قبل التنفيذ (Q-164)** ويُسجَّل في التدقيق (§4-1)؛ ولو فشل التحقق 3 مرات يعود النظام لطلب PIN (سيناريو 2-4 · Q-072).
- ترتيب الفحص عند إنشاء منح (قاعدة §6-3): المالك أولاً → الثابت الصلب → المفتاح في السجل → التحدي أخيراً؛ فلا تحدٍّ يُصدر لغير المالك ولا لمفتاح ثابت صلب ولا لمفتاح غير موجود. ومنتقي المفتاح يقرأ السجل للعرض فقط (GET /api/v1/permissions/keys) — والتحقق الحاكم خادمي.
- رفض المفتاح غير المعروف يكتبه الخادم في التدقيق (Ktor→Audit) — لا كتابة تدقيق من العميل أبداً (§7-1)؛ وبلا اتصال يُحفظ سجل الرفض محلياً ويُصالح مع الخادم عند عودة الاتصال. والاستثناء Q-174 (تبديل المنح من S1-09 بلا تحدٍّ) يتجاوز التحدي فقط، لا الفحوص قبله.
- رموز الخطأ الموحدة (§4-4): `PERM_DENIED` · `PERM_HARD_INVARIANT` · `PERM_NOT_OWNER` · `PERM_VERIFICATION_REQUIRED` · `PERM_GRANT_EXPIRED` · `PERM_CONFLICT` — والأخير لتعديلين متزامنين على منح عضو واحد: الثاني يفشل ويُطلب إعادة تحميل أحدث حالة قبل إعادة المحاولة (REQ-019 · §7-8).
- حامل الصلاحية الكاملة يسلك هذا التسلسل كالمالك في منح غيره؛ وتعديله منح نفسه يُرفض `403` + `PERM_DENIED` (§7-16). والمنع الصريح يسلك النقطة نفسها بـ `is_granted: false` — مرسوم في 3-ي.

### 3-ب. تطبيق قالب على عضو (REQ-013/014 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant S101 as البوابة
    participant Ktor as الخادم
    participant Roles as الأدوار
    participant Grants as المنح
    participant Audit as التدقيق
    actor Member as العضو
    Father->>App: اختيار عضو + دور (partner | guardian | observer)
    App->>Ktor: GET /api/v1/families/{id}/templates — الأدوار ومفاتيحها عند هذه العائلة
    Ktor->>Roles: تعديل العائلة للدور إن وُجد (family_role_key) وإلا البذرة (template_key)
    Ktor-->>App: [{template_id, title_ar, keys}]
    App-->>Father: معاينة الفرق قبل التطبيق — وما عليه منع صريح «يبقى ممنوعاً» (R03-07)
    Father->>App: اختيار النطاق والمدة ثم «طبّق»
    alt الدور يحوي مفتاحاً حساساً — التحقق أولاً (Q-269)
        App->>Ktor: POST /api/v1/shell/verification/challenge — تحدٍّ {challenge_id, nonce} — صلاحية 5 دقائق (Q-164)
        App->>S101: طلب تحقق — PIN الأب أو بصمته (Q-088)
        S101-->>App: توقيع nonce بمفتاح الجهاز بعد التحقق المحلي
    end
    App->>Ktor: POST /api/v1/families/{id}/members/{memberId}/grants/apply-template {template_id, scope?, valid_until, verification?}
    Ktor->>Roles: قراءة مفاتيح الدور
    Ktor->>Grants: نسخ المفاتيح إلى منح العضو — عدا ما عليه منع صريح قائم (Q-402)
    Ktor->>Roles: كتابة آخر دور للعضو (member_role)
    Ktor->>Audit: تسجيل تطبيق الدور
    Ktor-->>App: المنح المنسوخة من الدور
    App-->>Father: الدور مطبَّق — نقطة انطلاق قابلة للتعديل
    Ktor-->>Member: إشعار — يسري فوراً بلا قبول (Q-401)
    Note over Father,App: تعديل منح العضو بعدها لا يغيّر الدور ولا منح الأعضاء الآخرين (REQ-014)
```

### 3-ج. فحص صلاحية — خادمي ومحلي O(1) (REQ-004/005/006 — §4-1/§4-3)

```mermaid
sequenceDiagram
    autonumber
    actor System as النظام
    participant Ktor as الخادم
    participant Snapshot as اللقطة
    participant K as Kotlin
    System->>Ktor: POST /api/v1/permissions/check {member_id, permission_key, scope?}
    Ktor->>Ktor: قاعدة المالك أولاً (§6-3 — Q-232): adult + is_owner=true ← allowed — وكذلك بالغ له صف active في full_authority (Q-401)
    Ktor->>Ktor: المنح النشط = revoked_at IS NULL و valid_until > now (§6-3)
    alt المالك (is_owner=true) أو حامل الصلاحية الكاملة
        Ktor-->>System: {allowed: true, reason: granted} — قاعدة المالك (Q-232)
    else الثابت الصلب
        Ktor-->>System: {allowed: false, reason: hard_invariant}
    else رفض صريح نشط (is_granted=false)
        Ktor-->>System: {allowed: false, reason: denied}
    else مفتاح غير معروف أو نطاق غامض
        Ktor-->>System: {allowed: false, reason: unknown_key} — الغموض لصالح الحماية (REQ-005)
    else أحدث منح نشط يسمح
        Ktor-->>System: {allowed: true, reason: granted}
    else لا منح
        Ktor-->>System: {allowed: false, reason: not_granted}
    end
    Note over System,K: المسار المحلي على جهاز الطفل — دون شبكة (REQ-006)
    alt المفتاح من الثوابت الصلبة
        K-->>System: {allowed: false, reason: hard_invariant} — قبل lookup المنح (§6-3)
    end
    System->>K: checkPermission({key, scope}) عبر MethodChannel
    K->>Snapshot: قراءة لقطة المنح المحلية (O(1))
    alt اللقطة قديمة أو تالفة
        Snapshot-->>K: إعادة مزامنة كاملة عبر family/{family_id}/permissions/sync
        K-->>System: الفحص يتوقف على الرفض حتى تكتمل المزامنة (§7-13)
    else اللقطة سارية
        Snapshot-->>K: نفس نتيجة الخادم (ACC-004)
        K-->>System: allowed / denied / unknown_key (المفتاح غير المعروف في السجل المخزن — REQ-005)
    end
```

- قاعدة المالك أولاً (§6-3 — Q-232): `adult` + `is_owner=true` → `allowed` بلا منح صريح؛ والتجاوز تقييم فقط — لا يشمل التدقيق أبداً ولا فحوص `PERM_HARD_INVARIANT` ولا يمتد لغير المالك. والمسار المحلي يطبق قاعدة المالك نفسها حين يكون العضو المفحوص مالكاً (§6-3).
- أي رفض صريح نشط يفوز على أي منح سامح (§6-3 — deny-override)؛ وإلا يفوز أحدث منح نشط ويُؤخذ نطاقه.
- حامل الصلاحية الكاملة يُقيَّم بقاعدة المالك قبل النظر في منحه، فلا يسري عليه منع صريح أثناء الحمل، ويعود المنع نافذاً لحظة السحب؛ ويُستثنى مما للمالك نفسه: إعطاؤها وسحبها وإزالة المالك وتعديل منح نفسه (SPEC §5-5 · §7-16).
- الثابت الصلب يعطي `reason: "hard_invariant"` (§4-1)؛ والمنح المنتهي `valid_until` يُرفض فوراً (§7-9). والمسار المحلي يميز `unknown_key` بالمفتاح الغائب من نسخة السجل المخزنة على الجهاز (R03-05) — كالخادم في التسمية، ورفض في الأثر. والثابت الصلب يُفحص قبل lookup المنح — خادمياً ومحلياً (§6-3)؛ فلا منح يغطي ثابتاً صلباً.

### 3-د. إلغاء منح — فوري بلا إبطال جلسات (REQ-017 — §4-1/§4-2 · Q-257)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Grants as المنح
    participant MQTT as الوسيط
    participant Device as الجهاز
    participant Audit as التدقيق
    actor Member as العضو
    Father->>App: سحب المنح من ملف العضو
    App->>Ktor: DELETE /api/v1/families/{id}/members/{memberId}/grants/{grantId}
    Ktor->>Grants: revoked_at = now (المفتاح يتوقف لحظياً)
    Ktor->>MQTT: family/{family_id}/permissions/revoked — دفع إبطال فوري
    MQTT->>Device: تحديث اللقطة المحلية — المفتاح متوقف
    Ktor->>Audit: تسجيل الإلغاء (من ألغى / لمن / متى)
    Ktor-->>App: 204
    Ktor-->>Member: إشعار بالسحب (Q-401)
    App-->>Father: أُلغي المنح — لا فترة سماح
```

- إلغاء المنح لا يبطل أي جلسة (Q-257): الجلسات تُبطل فقط بالعمليات الصريحة في S1-02 §4.1 — وتبقى جلسات العضو عاملة لباقي صلاحياتها بعد الإلغاء.
- «اسحب كل صلاحياتها» يسلك `DELETE /api/v1/families/{id}/members/{memberId}/grants`: يسحب كل منح العضو ويرفع كل منع صريح عليه دفعة واحدة، ويفرّغ `member_role` (Q-402 — مرسوم في 3-ي).

### 3-هـ. إعطاء الصلاحية الكاملة لبالغ (REQ-016 — §4-1 · Q-093 · Q-401)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant S101 as البوابة
    participant Ktor as الخادم
    participant FA as الصلاحية الكاملة
    participant Audit as التدقيق
    actor Adult as البالغ

    Father->>App: اختيار بالغ في R03-10
    App->>Ktor: POST /api/v1/families/{id}/full-authority {member_id}
    alt العضو ليس بالغاً
        Ktor-->>App: رفض — للبالغين فقط (§7-11 · ACC-013)
    else العضو يحملها
        Ktor-->>App: رفض 409 بلا تغيير (§7-14)
    else بالغ لا يحملها
        App->>S101: طلب تحقق PIN أو بصمة
        S101-->>App: توقيع التحدي
        App->>Ktor: إعادة الطلب مع verification
        Ktor->>FA: إنشاء صف (status: active, auth_method)
        Ktor->>Audit: تسجيل الإعطاء
        Ktor-->>App: {member_id, status: active}
        App-->>Father: لها الصلاحية الكاملة الآن — أنت المالك كما كنت
        Ktor-->>Adult: إشعار — تسري فوراً بلا قبول (R03-11)
    end
```

- تسري من لحظة نجاح الطلب؛ لا خطوة قبول ولا مهلة ولا حالة معلقة (Q-401 — نُقض Q-139 · Q-259).
- دون اتصال تُرفض ولا تدخل صندوق الصادر (Q-269)؛ و`is_owner` لا ينتقل (Q-006).

### 3-و. تحول الدور عند بلوغ 13 (REQ-003 — §6-3)

```mermaid
sequenceDiagram
    autonumber
    participant S102 as العضوية
    participant Ktor as الخادم
    participant Grants as المنح
    actor Father as الأب
    S102->>Ktor: بلوغ الطفل 13 سنة — حدث member.turned-teen الداخلي (مهمة خادمية يومية عند منتصف الليل المحلي — Q-189؛ تُطلق 1 يناير من سنة بلوغ 13 — Q-235؛ سنة الميلاد — Q-080)
    Ktor->>Ktor: تحويل الدور child → teen تلقائياً
    Ktor->>Grants: مراجعة منح العضو غير الإشرافية عند التحول
    Ktor->>Father: إشعار الأب بالتحول ومراجعة المنح
    Ktor-->>S102: الدور الجديد teen — المنح الإشرافية ممنوعة أصلاً (D-038)
```

- حدث داخلي بلا موضوع MQTT (Q-189)؛ والحمولة والمعالج وكاتب الدور في SPEC §4-2-أ.

### 3-ز. حذف العائلة / إزالة عضو / إلغاء الحذف (REQ-020 — §4-1 · Q-166)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant S102 as الهوية
    participant Audit as التدقيق
    participant MQTT as الوسيط
    participant Device as الجهاز
    Father->>App: حذف العائلة / إزالة عضو من إدارة الأعضاء
    App->>Ktor: DELETE /api/v1/families/{id} — أو DELETE /api/v1/families/{id}/members/{memberId}
    alt الطالب ليس المالك ولا يحمل الصلاحية الكاملة
        Ktor-->>App: رفض PERM_NOT_OWNER (§7-6)
    else حذف العائلة
        Ktor->>App: تحدٍّ {challenge_id, nonce} — POST /api/v1/shell/verification/challenge (S1-01) — صلاحية 5 دقائق (Q-164)
        App->>Ktor: verification {method: pin | biometric, challenge_id, signature, at}
        Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام (Q-164)
    else إزالة عضو
        Ktor->>Ktor: فحص المفتاح identity.member.remove + PIN الأب
    end
    Ktor->>S102: حذف ناعم — deleted_at + scheduled_purge_at (+30 يوماً) + سجل deletion_request
    Ktor->>S102: إبطال كل الجلسات فوراً (العائلة كاملة / العضو)
    Ktor->>Ktor: إزالة عضو يحمل الصلاحية الكاملة تسحبها أولاً (§7-15) — وفي حذف العائلة يبقى الحمل حتى الحذف الصلب
    Ktor->>MQTT: إشعار الأب — وكل البالغين لحذف العائلة
    Ktor->>Device: فك اقتران أجهزة العضو / كل أجهزة العائلة
    Ktor->>Audit: تسجيل الحذف (من / متى / ماذا — بلا محتوى)
    Ktor-->>App: {status: "pending_deletion", purge_at}
    alt إلغاء خلال السماح
        Father->>App: إلغاء حذف معلَّق
        App->>Ktor: POST /api/v1/families/{id}/deletion/cancel (عائلة) أو POST /api/v1/families/{id}/members/{memberId}/deletion/cancel (عضو)
        Ktor->>S102: إعادة التفعيل — حذف سجل الحذف المعلق
        Ktor-->>App: {status: "active"}
    else بلا إلغاء بعد 30 يوماً
        Ktor->>Ktor: حذف صلب — رسائل العضو تُجهَّل («عضو محذوف»)؛ وتطهير النسخ خلال 30 يوماً
    end
```

- ملاحظة: حذف العائلة وإزالة العضو غير قابلين للتفويض (REQ-020 — ثابت صلب)؛ والقاصر لا يُزال إلا بيد الأب؛ وطلب حذف دون اتصال يُحفظ في الصندوق الصادر ويُنفَّذ عند الاتصال (بروتوكول الحذف والتصدير — `DELETION-EXPORT-PROTOCOL.md` §6). وحامل الصلاحية الكاملة يفعلهما بقاعدة المالك وبالشروط نفسها — عدا إزالة المالك (Q-402).

### 3-ح. سحب الصلاحية الكاملة (REQ-016 — §4-1 · Q-401)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant FA as الصلاحية الكاملة
    participant Audit as التدقيق
    actor Adult as البالغ

    Father->>App: «اسحب الصلاحية الكاملة» في R03-12 + تأكيد
    App->>Ktor: DELETE /api/v1/families/{id}/full-authority/{memberId}
    alt الطالب ليس المالك نفسه
        Ktor-->>App: رفض 403 PERM_DENIED (§7-16)
    else المالك نفسه
        Ktor->>FA: إغلاق الصف (status: revoked)
        Ktor->>Audit: تسجيل السحب
        Ktor-->>App: {member_id, status: revoked}
        App-->>Father: سُحبت — عاد البالغ إلى دوره السابق
        Ktor-->>Adult: حدث permissions/revoked + إشعار
    end
```

- السحب تأكيد واحد بلا رقم سري، كإلغاء أي منح (REQ-017)؛ ولا تُبطل جلسة (Q-257).
- البالغ يعود إلى منحه في `permission_grant` كما هي؛ ما انتهت مدته أثناء الحمل يبقى منتهياً (SPEC §5-5).

### 3-ط. طلب تعديل صلاحية وقرار الأب (REQ-002/004/015 — §4-1 · R03-17)

```mermaid
sequenceDiagram
    autonumber
    actor Teen as العضو الطالب
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Requests as الطلبات
    participant Grants as المنح
    participant Audit as التدقيق
    Teen->>App: «اطلب» على صلاحية مقفلة — نقرة واحدة (بالغ أو مراهق — Q-402)
    App->>Ktor: POST /api/v1/families/{id}/permission-requests {member_id, permission_key, scope?, reason?}
    Ktor->>Requests: حفظ الطلب (status: pending) — طلب معلق واحد لكل (عضو، مفتاح)
    Ktor->>Audit: تسجيل الطلب
    Ktor-->>App: {request_id, status: "pending"}
    App-->>Teen: الطلب أُرسل إلى الأب — يظهر في بطاقة «يتطلب انتباهك» (S1-09)
    Father->>App: عرض الطلبات المعلقة
    App->>Ktor: GET /api/v1/families/{id}/permission-requests?status=pending
    Ktor-->>App: قائمة الطلبات المعلقة
    alt الأب يوافق
        App->>Ktor: POST /api/v1/families/{id}/permission-requests/{requestId}/decide {decision: "approve", scope, valid_until, verification?}
        Ktor->>Grants: إنشاء المنح (scope + valid_until إلزاميان — REQ-011)
        Ktor->>Audit: تسجيل القرار والمنح
        Ktor-->>App: {request_id, status: "approved", grant_id}
        Ktor-->>Teen: إشعار — مُنحت بالحدود التي اختارها الأب
    else الأب يرفض
        App->>Ktor: POST /api/v1/families/{id}/permission-requests/{requestId}/decide {decision: "deny"}
        Ktor->>Audit: تسجيل الرفض
        Ktor-->>App: {request_id, status: "denied"}
        Ktor-->>Teen: إشعار بالرفض
    end
```

- الطلب قناة طلب لا منح: لا يمنح شيئاً بذاته ولا يُعدّ تصعيداً ولا يُنبَّه به (§7-20)؛ والموافقة تنشئ المنح بقواعد المنح نفسها (REQ-011/012 — والمفتاح الحساس يتطلب `verification`)؛ وطلب ثانٍ لنفس المفتاح وهو معلق → `409`. والطالب بالغ مفوَّض أو مراهق (Q-402)، والأب يختار النطاق والمدة أو يرفض.

### 3-ي. المنع الصريح: إنشاؤه وبقاؤه عند تغيير الدور ورفعه (REQ-004/014 — §4-1 · Q-401 · Q-402)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Grants as المنح
    participant MQTT as الوسيط
    participant Audit as التدقيق
    actor Member as العضو
    Father->>App: «امنع» على صلاحية في ملف العضو (R03-03)
    App->>Ktor: POST /api/v1/families/{id}/members/{memberId}/grants {permission_key, scope, is_granted: false}
    Ktor->>Grants: حفظ المنع الصريح — يفوز على أي منح سامح (deny-override)
    Ktor->>MQTT: family/{family_id}/permissions/revoked — يتوقف المفتاح فوراً
    Ktor->>Audit: تسجيل المنع (block)
    Ktor-->>App: 201 {grant_id}
    App-->>Father: «ممنوع» ظاهرة في ملف العضو
    Ktor-->>Member: إشعار — «ممنوع» ظاهرة في صلاحياته (R03-17)
    opt الأب يطبّق لاحقاً دوراً يحوي المفتاح الممنوع
        Father->>App: تطبيق الدور (3-ب)
        App->>Ktor: POST /api/v1/families/{id}/members/{memberId}/grants/apply-template
        Ktor->>Grants: نسخ مفاتيح الدور — والمفتاح الممنوع يبقى ممنوعاً بلا تغيير (Q-402)
    end
    alt رفع المنع وحده
        Father->>App: «ارفع المنع»
        App->>Ktor: DELETE /api/v1/families/{id}/members/{memberId}/grants/{grantId}
        Ktor->>Grants: revoked_at = now — يعود المفتاح «غير مسموح»
        Ktor->>Audit: تسجيل رفع المنع (unblock)
    else اسحب كل صلاحياتها
        Father->>App: «اسحب كل صلاحياتها» + تأكيد
        App->>Ktor: DELETE /api/v1/families/{id}/members/{memberId}/grants
        Ktor->>Grants: سحب كل المنح ورفع كل منع — العضو بلا منح ولا منع
        Ktor->>Audit: تسجيل السحب (revoke)
    end
    Ktor-->>Member: إشعار بالتغيير
```

- الحالات الثلاث لكل صلاحية كما تظهر للمالك وللعضو: **مسموح** (منح نشط) · **غير مسموح** (لا منح) · **ممنوع** (`is_granted=false`). لا حالة مخفية (Q-401).
- المنع يضيّق ولا يوسّع، فلا يتطلب تحققاً ولو كان المفتاح حساساً؛ ومدته اختيارية وغيابها يعني «حتى يُرفع».
- منحا حق الخروج (`identity.account.delete_self` · `identity.family.leave`) لا يُمنعان ولا يُسحبان (Q-291).

### 3-ك. المالك يحذف حسابه — تسليم العائلة لحامل الصلاحية الكاملة (REQ-016 · S1-02 REQ-025 — §7-18 · Q-402)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant S102 as الهوية
    participant FA as الصلاحية الكاملة
    participant Audit as التدقيق
    actor Adult as البالغ
    Father->>App: «احذف حسابي» (S102-23)
    App->>S102: DELETE /api/v1/identity/me
    S102->>FA: هل لبالغ آخر صف active؟
    alt لا أحد يحملها
        S102-->>App: رفض 403 — نص owner_blocked
        App-->>Father: طريقان — أعطِ الصلاحية الكاملة أولاً (3-هـ) أو احذف العائلة كلها (3-ز)
    else بالغ يحملها
        App-->>Father: نص owner_handover — «بعد حذف حسابك تدير {name} العائلة وحدها»
        Father->>App: تأكيد + إعادة مصادقة (بصمة / PIN)
        S102->>S102: حذف ناعم لحساب المالك + مهلة 30 يوماً (Q-344)
        S102->>Audit: تسجيل طلب الحذف
        S102-->>Adult: إشعار — يدير العائلة وحده خلال المهلة
        Note over S102,Adult: خلال المهلة يُرفض طلب الحامل مغادرة العائلة أو حذف حسابه
        alt المالك يتراجع خلال المهلة
            Father->>App: «تراجع عن الحذف»
            App->>S102: POST /api/v1/identity/me/deletion/cancel
            S102-->>App: {status: "active"} — مالك كما كان
            S102-->>Adult: إشعار — عاد المالك
        else اكتملت 30 يوماً
            S102->>S102: is_owner ينتقل إلى الحامل
            S102->>FA: إغلاق صف الحامل (status: revoked) — صار مالكاً
            S102->>Audit: تسجيل انتقال الملكية (owner_change)
            S102->>S102: حذف صلب لحساب المالك السابق
            S102-->>Adult: «أنت مالك العائلة الآن» (R03-11)
        end
    end
```

- هذا **الطريق الوحيد** لانتقال `is_owner` (Q-402)؛ إعطاء الصلاحية الكاملة لا ينقله (Q-006).
- نقطة الحذف وإلغاؤه يملكهما S1-02 (REQ-025 — تسلسله 3-ز)؛ وهذا النظام يجيب «من يحمل الصلاحية الكاملة؟» ويغلق الصف عند الانتقال.
- أكثر من حامل عند حذف حساب المالك: بلا حكم بعد (G-R03-11) — التصميم يعرضها لبالغ واحد.

### 3-ل. تعديل محتوى دور (REQ-013/014 — §4-1 · Q-089 · Q-205 · Q-401)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Roles as الأدوار
    participant Audit as التدقيق
    Father->>App: فتح دور في R03-08 وتبديل صلاحياته
    App-->>Father: شريط «تغييرات غير محفوظة» — لا شيء يُرسل قبل «احفظ»
    Father->>App: «احفظ»
    App->>Ktor: PATCH /api/v1/families/{id}/templates/{templateId} {keys}
    alt في المجموعة مفتاح غير معروف
        Ktor-->>App: رفض 400 PERM_DENIED بلا تطبيق جزئي (§7-17)
    else المجموعة سليمة
        Ktor->>Roles: كتابة الدور لهذه العائلة (family_role + family_role_key) — البذرة لا تُمس
        Ktor->>Audit: تسجيل تعديل الدور (role_edit)
        Ktor-->>App: الدور المعدَّل
        App-->>Father: حُفظ — يسري على من يُطبَّق عليه بعد الآن
    end
    Note over Father,Roles: من طُبّق عليه الدور من قبل لا تتغير منحه (REQ-014)
```

- `keys` تستبدل مجموعة الدور كاملة؛ والأدوار ثلاثة لا رابع لها (Q-089).

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الاثني عشر (§2) والتصميم المعتمد (§9-8)

ثلاثة مداخل: المالك يدير (ومثله حامل الصلاحية الكاملة عدا ما للمالك نفسه)، والعضو يحاول فعلاً، والمالك يحذف حسابه.

```mermaid
flowchart TD
    Start([المالك يفتح «العائلة»]) --> Pick[اختيار بالغ]
    Pick --> How{ماذا يريد؟}

    How -->|صلاحية واحدة| Key[فتح الصلاحية بعنوانها العربي]
    Key --> St{الحالة المطلوبة؟}
    St -->|مسموح| Terms[نطاقها ومدتها وحدها — إلزاميان]
    St -->|غير مسموح| Rev[سحب المنح — فوري]
    St -->|ممنوع| Blk[منع صريح — يبقى حتى يُرفع]

    How -->|دور جاهز| Role[اختيار دور: شريك / وصي محدود / مراقب]
    Role --> Diff[معاينة الفرق — والممنوع يبقى ممنوعاً]
    Diff --> Terms

    Terms --> Sens{فيها صلاحية حساسة؟}
    Sens -->|نعم| Online{متصل؟}
    Online -->|لا| Off[يُرفض — لا يُحفظ للإرسال لاحقاً]
    Online -->|نعم| Verify[الرقم السري أو البصمة — Q-088]
    Verify --> Fail{فشل التحقق 3 مرات؟}
    Fail -->|نعم| Pin[العودة للرقم السري — Q-072]
    Pin --> Verify
    Fail -->|لا| Save[حفظ]
    Sens -->|لا| Save
    Rev --> Save
    Blk --> Save

    How -->|الصلاحية الكاملة| FA{يحملها؟}
    FA -->|لا| Give[إعطاء — الرقم السري أو البصمة، وباتصال]
    FA -->|نعم| Take[سحب — تأكيد واحد]
    Take --> Back[يعود إلى دوره السابق ومنحه كما هي]
    Give --> Now
    Back --> Now

    Save --> Now[يسري فوراً — بلا قبول من العضو]
    Now --> Audit[قيد في سجل التدقيق — من / لمن / متى / ينتهي]
    Audit --> Notice[إشعار للعضو + «آخر ما تغيّر» عنده]
    Notice --> Done([انتهى])

    How -->|تعديل دور| EditRole[تبديل صلاحيات الدور ثم «احفظ»]
    EditRole --> RoleSaved[حُفظ — من طُبّق عليه من قبل لا يتغير]
    RoleSaved --> Done

    How -->|حذف العائلة / إزالة عضو| DelQ{أيهما؟}
    DelQ -->|حذف العائلة| Challenge["اسم العائلة + تحدٍّ من الخادم — PIN/بصمة مثبَتة (Q-164)"]
    DelQ -->|إزالة عضو| PinCheck[مفتاح identity.member.remove + PIN]
    Challenge --> SoftDel[حذف ناعم + سماح 30 يوماً]
    PinCheck --> SoftDel
    SoftDel --> CancelQ{إلغاء خلال السماح؟}
    CancelQ -->|نعم| CancelDel["POST /api/v1/families/{id}/deletion/cancel — عودة نشطاً"]
    CancelDel --> Done
    CancelQ -->|لا — بعد 30 يوماً| HardDel[حذف صلب — تجهيل رسائل العضو + تطهير النسخ خلال 30 يوماً]
    HardDel --> Done

    Member([بالغ مفوَّض أو مراهق يحاول فعلاً]) --> Check{المفتاح ممنوح ونشط؟}
    Check -->|نعم — ضمن النطاق| Allow[يُنفَّذ]
    Check -->|ثابت صلب — إشراف / فوترة / ملكية| Hard[رفض PERM_HARD_INVARIANT + تنبيه المالك]
    Check -->|لا — غير مسموح أو منتهٍ أو ممنوع| Lock[قفل + «لماذا؟»]
    Lock --> SensTap{من الصلاحيات الخمس الحساسة؟}
    SensTap -->|نعم| Log[تسجيل المحاولة + تنبيه المالك — REQ-007]
    SensTap -->|لا| Silent[شرح فقط — بلا سجل ولا تنبيه]
    Lock --> Ask[«اطلب» — نقرة واحدة]
    Ask --> Decide{قرار المالك}
    Decide -->|يوافق| Terms
    Decide -->|يرفض| Refused[إشعار بالرفض]

    OwnerDel([المالك يطلب حذف حسابه]) --> Has{الصلاحية الكاملة عند بالغ؟}
    Has -->|لا| Blocked[يُرفض — أعطِها أولاً أو احذف العائلة]
    Has -->|نعم| Grace[مهلة 30 يوماً — الحامل يدير العائلة ولا يغادر]
    Grace --> Undo{المالك يتراجع؟}
    Undo -->|نعم| Same[مالك كما كان]
    Undo -->|لا| NewOwner[الحامل يصير مالك العائلة + إشعار]
```

- لكل صلاحية حالتها ونطاقها ومدتها وحدها (Q-401)؛ و«حدود كل الصلاحيات دفعة واحدة» اختصار في الواجهة يسلك مسار «مسموح» لكل منح قائم (REQ-011).
- الدور نقطة انطلاق لا قيد: تعديل منح العضو بعد تطبيقه لا يغيّر الدور ولا منح الآخرين (REQ-014 · سيناريو 2-1)؛ والمنع الصريح يبقى بعد تغيير الدور (Q-402).
- كل ما يفعله المالك يسري فوراً بلا خطوة قبول، ويتبعه قيد وإشعار (REQ-010 — Q-401). والمراهق يصله إشعار حين يتغيّر ما سُمح له به (Q-402).
- بالغ منضم جديداً يبدأ بلا أي منح — لا صلاحية له حتى يمنحه الأب صراحة — عدا منحي بذرة Q-166 (Q-248) (REQ-002).
- القفل: الضغط على عنصر مقفل يشرح السبب دائماً؛ ويُسجَّل ويُنبَّه المالك في الصلاحيات الخمس الحساسة فقط (REQ-007 — Q-402).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–9.0، والمخازن D1–D6. المخزن D5 سجل التدقيق (النواة المشتركة)؛ واللقطة المحلية على جهاز الطفل مخزن عميل (ليست جدول خادم) وتُزامَن عبر MQTT.

- **تغطية نقاط §4:** كل نقطة في §4-1 مرسومة هنا حافةً أو في تسلسلات §3: `PATCH …/grants/{grantId}` (تعديل النطاق/المدة — REQ-010، حافة Father→P2) · `GET …/members/{memberId}/permissions` (الصلاحيات الفعلية — REQ-004، حواف P4 مع المالك ومع العضو لنفسه) · `GET …/audit/permissions` (سجل التدقيق — REQ-018، حواف Father→P6 وD5→P6 وP6→Father، وP6→العضو لأحداث منحه) · `GET …/full-authority` و`POST …/full-authority/{memberId}/seen` (حافتا P8 مع البالغين ومع الحامل)؛ والباقي في §3: keys (3-أ)، grants إنشاء/سحب (3-أ/3-د)، المنع وسحب الكل (3-ي)، apply-template (3-ب)، templates (3-ب/3-ل)، check (3-ج)، full-authority إعطاء/سحب (3-هـ/3-ح)، حذف العائلة/العضو وإلغاؤه (3-ز)، permission-requests (3-ط). [تصحيح 2026-11-08 (D-2): كانت النقاط الثلاث الأولى نثراً فقط؛ رُسمت حوافَّ.] [إعادة رسم 2026-11-16 (Q-401 · Q-402): خرج مسار نقل الملكية وقبوله وإلغاؤه؛ ودخلت العمليتان 8.0 و9.0 والمخزن D6.]

```mermaid
flowchart LR
    Father([الأب — المالك])
    Holder([بالغ يحمل الصلاحية الكاملة])
    Adult([البالغ المفوَّض])
    Teen([المراهق / الطفل])
    S102([نظام الهوية S1-02])
    S101([نظام الغلاف S1-01 — بوابة الوالدين وقناة الإشعارات])
    Consumers([الأنظمة المستهلكة S1-05/S1-06/S1-07/S1-08/S1-09/S1-10])

    subgraph Perm [S1-03: محرك الصلاحيات]
        P1(1.0 إدارة سجل المفاتيح)
        P2(2.0 إدارة المنح — منح / تعديل / سحب / منع)
        P3(3.0 الأدوار — تطبيق وتعديل)
        P4(4.0 محرك التقييم deny-override)
        P5(5.0 مزامنة المنح واللقطة المحلية)
        P6(6.0 التدقيق والتنبيهات وإشعار العضو)
        P7(7.0 حذف العائلة والعضو وإلغاء الحذف)
        P8(8.0 الصلاحية الكاملة — إعطاء / سحب / تسليم)
        P9(9.0 طلبات الصلاحية)
    end

    subgraph Stores [مخازن البيانات]
        D1[("D1 permission_key")]
        D2[("D2 role_template + template_key + family_role + family_role_key + member_role")]
        D3[("D3 permission_grant")]
        D4[("D4 full_authority")]
        D5[("D5 AuditEvent")]
        D6[("D6 permission_request")]
    end

    Ktor([خادم Ktor])
    MQTT([وسيط MQTT])
    Snapshot[(لقطة المنح المحلية — جهاز الطفل)]

    Father -->|"منح / تعديل (PATCH .../grants/{grantId} — REQ-010) / سحب / منع"| P2
    Holder -->|ما للمالك في منح غيره| P2
    Father -->|تطبيق دور / تعديل دور| P3
    Holder -->|تطبيق دور / تعديل دور| P3
    Father -->|"إعطاء الصلاحية الكاملة (PIN أو بصمة) / سحبها"| P8
    Father -->|حذف العائلة / إزالة عضو| P7
    Holder -->|حذف العائلة / إزالة عضو — عدا المالك| P7
    Adult -->|ممارسة ما فُوِّض له| P4
    Teen -->|محاولة فعل| P4
    Adult -->|"طلب صلاحية (3-ط)"| P9
    Teen -->|"طلب صلاحية (3-ط)"| P9

    S102 -->|العضوية والدور و is_owner| P2
    S102 -->|بلوغ 13 — تحول الدور| P2
    S102 -->|"حذف حساب المالك: هل من حامل؟ — ثم اكتمال المهلة (3-ك)"| P8
    P8 -->|is_owner ينتقل إلى الحامل عند اكتمال المهلة| S102

    P1 -->|مفتاح + عنوان عربي + وصف + حساس| D1
    D1 -->|قائمة المفاتيح| P1
    P2 -->|"التحقق من المفتاح في السجل (REQ-009)"| D1
    P2 -->|التحقق PIN / بصمة للمفتاح الحساس| S101
    P2 -->|"حفظ المنح أو المنع (scope + valid_until)"| D3
    D2 -->|مفاتيح الدور — تعديل العائلة وإلا البذرة| P3
    P3 -->|تعديل الدور للعائلة + آخر دور للعضو| D2
    P3 -->|نسخ المفاتيح إلى منح — عدا الممنوع صراحة| D3

    P8 -->|تحقق PIN / بصمة مثبَتة بالتحدي| S101
    P8 -->|"صف active عند الإعطاء — revoked عند السحب"| D4
    D4 -->|من يحمل الصلاحية الكاملة| P4
    P8 -->|من يحملها ومنذ متى — لكل بالغ| Adult
    Holder -->|رأى إشعاره — notice_seen_at| P8
    P7 -->|إزالة حامل الصلاحية الكاملة تسحبها أولاً| P8

    P9 -->|"طلب معلق واحد لكل (عضو، مفتاح)"| D6
    D6 -->|الطلبات المعلقة| P9
    P9 -->|الطلبات المعلقة| Father
    Father -->|قرار — يوافق بنطاق ومدة أو يرفض| P9
    P9 -->|الموافقة تنشئ منحاً| P2

    P7 -->|تحقق PIN / بصمة مثبَتة بالتحدي| S101
    P7 -->|تسجيل طلب الحذف + الحذف الناعم| S102
    P7 -->|إشعار الأب — وكل البالغين لحذف العائلة| MQTT

    Consumers -->|POST /api/v1/permissions/check| P4
    D3 -->|المنح + is_granted + valid_until| P4
    P4 -->|allowed / denied / hard_invariant / unknown_key| Consumers
    Father -->|"GET .../members/{memberId}/permissions — الصلاحيات الفعلية لعضو (REQ-004)"| P4
    P4 -->|الصلاحيات الفعلية للعضو| Father
    P4 -->|صلاحياتي — لنفسي فقط| Adult
    P4 -->|صلاحياتي — لنفسي فقط| Teen
    P4 -->|رفض حساس أو تصعيد| P6

    P2 -->|منح / تعديل / سحب / منع| P6
    P3 -->|تطبيق دور / تعديل دور| P6
    P8 -->|إعطاء / سحب / انتقال ملكية| P6
    P9 -->|طلب / قرار| P6
    P7 -->|تسجيل الحذف / الإلغاء| P6
    P6 -->|أحداث التدقيق| D5
    D5 -->|"سجل التدقيق (REQ-018)"| P6
    Father -->|"GET .../audit/permissions — سجل التدقيق (REQ-018)"| P6
    P6 -->|سجل التدقيق للعرض على الأب| Father
    P6 -->|"تنبيه الأب عند رفض حساس / تصعيد — family/{family_id}/alerts/new (نوع escalation — S1-09)"| Father
    P6 -->|"إشعار العضو بكل تغيير — قناة الدفع (S1-01 §4.4)"| S101
    S101 -->|إشعار| Adult
    S101 -->|إشعار| Teen
    S101 -->|إشعار| Holder
    P6 -->|«آخر ما تغيّر» — أحداث منحي أنا| Adult
    P6 -->|«آخر ما تغيّر» — أحداث منحي أنا| Teen

    P2 -->|تغيير منح| P5
    P8 -->|سحب الصلاحية الكاملة| P5
    P5 -->|"family/{family_id}/permissions/sync"| MQTT
    P5 -->|"family/{family_id}/permissions/revoked — إبطال فوري"| MQTT
    P6 -->|"family/{family_id}/permissions/grant-expiring — فحص يومي (Q-227)"| MQTT
    MQTT -->|لقطة المنح| Snapshot
    Snapshot -->|"فحص محلي O(1) — checkPermission"| Teen

    P2 -->|"POST / PATCH / DELETE .../grants (3-أ/3-د/3-ي)"| Ktor
    Ktor -->|"grant_id (3-أ)"| P2
    P3 -->|"POST .../grants/apply-template (3-ب) + PATCH .../templates/{templateId} (3-ل)"| Ktor
    Ktor -->|"المنح المنسوخة / الدور المعدَّل (3-ب/3-ل)"| P3
    P4 -->|"POST /api/v1/permissions/check (3-ج)"| Ktor
    Ktor -->|"allowed / denied / hard_invariant / unknown_key (3-ج)"| P4
    P7 -->|"DELETE /api/v1/families/{id} + DELETE /api/v1/families/{id}/members/{memberId} + POST /api/v1/families/{id}/deletion/cancel + POST /api/v1/families/{id}/members/{memberId}/deletion/cancel (3-ز)"| Ktor
    Ktor -->|"pending_deletion + purge_at / active (3-ز)"| P7
    P8 -->|"POST / GET / DELETE /api/v1/families/{id}/full-authority (3-هـ/3-ح)"| Ktor
    Ktor -->|"status: active / revoked (3-هـ/3-ح)"| P8
    P9 -->|"POST .../permission-requests + .../decide (3-ط)"| Ktor
    Ktor -->|"request_id — pending / approved / denied (3-ط)"| P9
```

- العملية 4.0 هي الحارس الوحيد: كل فحص صلاحية في المنصة يمر بها (§1) — «لا عملية بلا مفتاح» (REQ-009). وتقرأ D3 للمنح وD4 لحامل الصلاحية الكاملة (قاعدة المالك — §6-3).
- العملية 8.0 بلا حالة معلقة: الإعطاء صف `active` فوراً والسحب `revoked` فوراً؛ وانتقال `is_owner` يكتبه S1-02 عند اكتمال مهلة حذف حساب المالك فقط (Q-402).
- العملية 6.0 تخدم ثلاثة قرّاء: المالك (السجل كله + تنبيه الرفض الحساس والتصعيد)، والعضو (أحداث منحه في «آخر ما تغيّر»)، وقناة الإشعارات.
- سجل المفاتيح D1 وبذرة الأدوار في D2 مشتركان لكل العائلات بلا `family_id`؛ وباقي D2 (تعديل العائلة وآخر دور للعضو) وD3 وD4 وD6 تحمل `family_id` + RLS (D-021).

## 6. مخطط النشاط (Activity) — دورة حياة المنح والفحص

المسارات الخمسة (الأب المالك / العضو: بالغ مفوَّض أو مراهق أو حامل للصلاحية الكاملة / جهاز الطفل / الخادم / وسيط MQTT) كمسارات متوازية. والمزامنة عبر MQTT والإبطال الفوري يعملان **بالتوازي** مع استخدام التطبيق. ولا نشاط ينتظر قبولاً من العضو: كل ما يحفظه المالك يسري ثم يُشعَر به (Q-401).

```mermaid
flowchart LR
    subgraph Father [الأب — المالك]
        direction TB
        F1([فتح «العائلة»])
        F2[اختيار عضو + دور أو صلاحيات]
        F3[نطاق ومدة لكل صلاحية]
        F4{صلاحية حساسة؟}
        F5[تحقق PIN أو بصمة]
        F6[حفظ المنح]
        F7[سحب منح]
        F11[منع صريح / رفعه]
        F12[تعديل محتوى دور ثم «احفظ»]
        F13{قرار في طلب صلاحية}
        F8[إعطاء الصلاحية الكاملة لبالغ — PIN أو بصمة]
        F10[سحب الصلاحية الكاملة — تأكيد واحد]
        F9[حذف العائلة / إزالة عضو — PIN/بصمة مثبَتة بالتحدي]
        F14[طلب حذف حسابه]
    end
    subgraph Member [العضو — بالغ مفوَّض / مراهق / حامل الصلاحية الكاملة]
        direction TB
        M1([محاولة فعل])
        M2[ممارسته ضمن ما فُوِّض له]
        M3[محاولة تصعيد — منح نفسه أو تعديل خارج النطاق]
        M4[«اطلب» صلاحية مقفلة]
        M5[يصله إشعار + «آخر ما تغيّر»]
        M6[حامل الصلاحية الكاملة يدير كالمالك — عدا ما للمالك نفسه]
    end
    subgraph Device [جهاز الطفل — Kotlin]
        direction TB
        K1["فحص محلي O(1) من اللقطة"]
        K2{اللقطة سارية؟}
        K3[إعادة مزامنة كاملة — الفحص على الرفض حتى تكتمل]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[التحقق: المالك أو حامل الصلاحية الكاملة؟ المفتاح في السجل؟ ليس ثابتاً صلباً؟]
        V2[حفظ المنح أو المنع + تسجيل التدقيق]
        V3[تقييم deny-override — قاعدة المالك أولاً، ثم منع صريح يفوز، وإلا أحدث منح]
        V11[رفض التصعيد + تسجيل التدقيق + تنبيه الأب]
        V4[إبطال فوري]
        V13[إشعار العضو بالتغيير]
        V19[حفظ تعديل الدور لهذه العائلة — لا يغيّر من طُبّق عليه]
        V14[حفظ الطلب — معلق واحد لكل عضو ومفتاح]
        V9[الصلاحية الكاملة: صف active فوراً — بلا قبول ولا مهلة]
        V12[سحبها: صف revoked — العودة إلى المنح المحفوظة]
        V5[مراجعة المنح عند بلوغ 13]
        V6[حذف ناعم + سماح 30 يوماً + سجل deletion_request عبر S1-02 + إبطال الجلسات + تجهيل رسائل العضو]
        V7[إلغاء حذف معلَّق خلال السماح]
        V10[عودة نشطاً — حذف سجل الحذف المعلق]
        V8["فحص يومي مجدول — منح قريبة من الانتهاء (7 أيام — Q-227)"]
        V15{حذف حساب المالك: الصلاحية الكاملة عند بالغ؟}
        V18[رفض — أعطِها أولاً أو احذف العائلة]
        V16[مهلة 30 يوماً — الحامل يدير ولا يغادر]
        V17[اكتمال المهلة: is_owner إلى الحامل]
    end
    subgraph Bus [وسيط MQTT]
        direction TB
        Q1["family/{family_id}/permissions/sync — لقطة المنح"]
        Q2["family/{family_id}/permissions/revoked — إبطال فوري"]
        Q3["family/{family_id}/permissions/grant-expiring — تنبيه انتهاء منح قريب"]
    end

    F1 --> F2
    F2 --> F3
    F3 --> F4
    F4 -->|نعم| F5
    F4 -->|لا| F6
    F5 --> F6
    F6 --> V1
    V1 --> V2
    V2 --> Q1
    V2 --> V13
    Q1 --> K1
    F7 --> V4
    F11 --> V2
    V4 --> Q2
    V4 --> V13
    Q2 --> K1
    F12 --> V19
    F8 --> F5
    F5 --> V9
    V9 --> V13
    V9 --> M6
    F10 --> V12
    V12 --> Q2
    V12 --> V13
    V13 --> M5
    M4 --> V14
    V14 --> F13
    F13 -->|يوافق| F3
    F13 -->|يرفض| V13
    F9 --> F5
    F5 --> V6
    F9 --> V7
    V7 --> V10
    V10 --> F1
    F14 --> V15
    V15 -->|لا| V18
    V18 --> F1
    V15 -->|نعم| V16
    V16 -->|المالك يتراجع| F1
    V16 -->|بعد 30 يوماً| V17
    V17 --> V13
    M1 --> K1
    K1 --> K2
    K2 -->|لا| K3
    K3 --> K1
    K1 --> V3
    V3 --> M2
    M3 --> V3
    V3 -->|رفض تصعيد| V11
    V11 --> F1
    V5 --> F1
    V8 --> Q3
    Q3 -->|تنبيه عبر S1-09| F1
```

- عند بلوغ الطفل 13 يتحول دوره تلقائياً وتُراجع منحُه غير الإشرافية ويُشعَر الأب (REQ-003) — المسار V5 إلى F1.
- محاولة التصعيد المرفوضة (M3) تذهب إلى الرفض + التدقيق + تنبيه الأب (V11)؛ ومراجعة العضو تتم من التنبيه (V11 → F1) لا من عقدة التقييم. وطلب الصلاحية (M4) ليس تصعيداً: يُحفظ طلباً (V14) ويقرره الأب (F13).
- كل حفظ من المالك ينتهي بإشعار العضو (V13 → M5): منح، منع، سحب، إعطاء الصلاحية الكاملة وسحبها، ورفض طلب (Q-401).
- الصلاحية الكاملة بلا انتظار: الإعطاء يسري لحظة نجاحه (V9) والسحب كذلك (V12)؛ فلا فحص يومي لانتهاء نقل ولا حالة معلقة (نُقض Q-139).
- حذف حساب المالك (F14) يُرفض ما لم تكن الصلاحية الكاملة عند بالغ (V18)؛ وإلا مهلة 30 يوماً ثم يصير الحامل مالكاً (V16 → V17 — Q-402).
- المنح بلا شبكة لا يُنفَّذ محلياً: الخادم هو المرجع، ويُحفظ طلب المنح غير الحساس في صندوق الصادر ويُعاد عند عودة الاتصال (§7-12 — نمط S1-01). **والمنح الحساس لا يُدرج في صندوق الصادر أبداً (Q-269):** محاولة منح حساس بلا اتصال تُرفض فوراً ولا تُعاد — فلا نجاح على تحدٍّ ميت ولا تنفيذ مكرر (§7-12).
- الفحص اليومي للمنح القريبة من الانتهاء (V8) يصدر `family/{family_id}/permissions/grant-expiring` (عتبة 7 أيام — Q-227)؛ ويستهلكه S1-09 لتنبيهات `grant_expiring` (§4-2).
