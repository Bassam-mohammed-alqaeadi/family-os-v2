# S1-03: مخططات هندسة البرمجيات (DIAGRAMS)

- **الحالة:** مسودة للمراجعة على GitHub — المواصفة معتمدة بالكامل في التخطيط؛ والمخططات الستة مسودة بانتظار مراجعة المالك على GitHub (لم تُعتمد بعد)
- **المواصفة:** `SPEC.md` (§§1–8 + §10 معتمدة بالكامل في التخطيط)
- **السياق المحدد (Bounded Context):** #2 الصلاحيات (Permissions) — `CONTEXT-MAP.md` §2 صف 2
- **القرارات الحاكمة:** Q-001 · Q-003 · Q-006 · Q-007 · Q-010 · Q-065 · Q-072 · Q-080 · Q-085 · Q-086 · Q-087 · Q-088 · Q-089 · Q-093 · Q-139 · Q-164 · Q-166 · Q-189 · D-006 · D-021 · D-023 · D-038 · G-006 · G-011
- **الأنواع الستة:** 1. حالات الاستخدام · 2. ERD · 3. التسلسل · 4. تدفق المستخدم · 5. DFD · 6. النشاط
- **الأشكال الموحدة:** مستطيل = جهة خارجية · مستطيل مستدير = عملية · معين = قرار · أسطوانة = مخزن بيانات · خط متقطع = يتضمن / اختياري

## 1. حالات الاستخدام

16 حالة استخدام من السيناريوهات الاثني عشر والمتطلبات (§2/§3): المالك وحده يمنح ويلغي ويطبق القوالب وينقل الملكية ويحذف العائلة ويزيل الأعضاء؛ البالغ المفوَّض يمارس ما فُوِّض له فقط ولا يفوِّض غيره؛ المراهق يدير مهامه الخاصة فقط؛ وكل فحص صلاحية في المنصة يمر بمحرك التقييم (deny-override — Q-007). وبوابة الوالدين (S1-01) والعضوية (S1-02) ممثلتان كجهات خارجية، والأنظمة المستهلكة لمفاتيح الصلاحيات (S1-05/S1-06/S1-07/S1-08/S1-09/S1-10) تسأل المحرك — وS1-10 يفحص مفاتيح `protection.*` عبر UC9 (فحص خادمي — S1-10 SPEC §1).

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Teen([المراهق])
    Child([الطفل])
    Eval([محرك التقييم deny-override])
    S101([نظام الغلاف S1-01 — بوابة الوالدين])
    S102([نظام الهوية S1-02 — العضوية])
    Consumers([الأنظمة المستهلكة S1-05/S1-06/S1-07/S1-08/S1-09/S1-10])

    subgraph S103 [S1-03: الأدوار والصلاحيات]
        direction TB
        UC1(منح صلاحية لعضو)
        UC2(تعديل منح — النطاق / المدة)
        UC3(إلغاء منح — فوري)
        UC4(تطبيق قالب على عضو)
        UC5(عرض الصلاحيات الفعلية لعضو)
        UC6(عرض سجل المفاتيح المركزي)
        UC7(عرض سجل التدقيق)
        UC8(نقل الملكية لبالغ)
        UC9(فحص صلاحية خادمي)
        UC10["فحص صلاحية محلي O(1) على جهاز الطفل"]
        UC11(إدارة المراهق لمهامه الخاصة — REQ-015)
        UC12(محاولة تصعيد — مرفوضة)
        UC13(مراجعة منح الطفل عند بلوغ 13)
        UC14(حذف العائلة — يتضمن إلغاء الحذف المعلق)
        UC15(إزالة عضو — يتضمن إلغاء الحذف المعلق)
        UC16(عرض صلاحياتي — قراءة + طلب تعديل)
    end

    Father --> UC1
    Father --> UC2
    Father --> UC3
    Father --> UC4
    Father --> UC5
    Father --> UC6
    Father --> UC7
    Father --> UC8
    Father --> UC13
    Father --> UC14
    Father --> UC15
    Adult --> UC5
    Adult --> UC6
    Adult --> UC7
    Teen --> UC11
    Teen --> UC12
    Teen --> UC16
    Adult --> UC16
    Child --> UC12
    UC1 -.->|يتضمن عند مفتاح حساس| S101
    UC8 -.->|يتضمن| S101
    UC1 --> Eval
    UC3 --> Eval
    UC9 --> Eval
    UC10 --> Eval
    UC11 --> Eval
    UC12 --> Eval
    S102 --> UC5
    S102 --> UC13
    Consumers --> UC9
    Consumers --> UC10
```

- المنح والتعديل والإلغاء وتطبيق القالب ونقل الملكية حصراً للمالك (REQ-010/016)؛ البالغ المفوَّض لا يفوِّض غيره (لا تفويض متسلسل).
- UC16 (عرض صلاحياتي — R03-17): المراهق والبالغ المفوَّض يريان منح نفسيهما فقط ويطلبان تعديلاً؛ ولا يريان منح غيرهما.
- حذف العائلة وإزالة عضو حصراً للمالك (REQ-020 · Q-166) — غير قابلين للتفويض؛ وحذف العائلة بشرط PIN/بصمة مثبَتة بالتحدي (Q-164)، وإزالة العضو بشرط مفتاح `identity.member.remove` + PIN؛ وكلاهما حذف ناعم + سماح 30 يوماً ثم حذف صلب، والإلغاء خلال السماح عبر `POST /api/v1/families/{id}/deletion/cancel`.
- `roles.grant.create` و`roles.grant.edit` و`roles.grant.revoke` و`roles.template.apply` و`roles.ownership.transfer` للمالك حصراً (§6-1)؛ `roles.key.view` و`roles.audit.view` قابلان للتفويض. (سجل المفاتيح الذرية — Q-010)

## 2. مخطط قاعدة البيانات (ERD)

الجداول الستة من §5 كما هي، مع أربعة مراجع خارجية: العائلة والعضوية (`membership` — الدور {`adult`، `teen`، `child`} + `is_owner` — سنة الميلاد تحدد الدور: دون 13 → `child`؛ 13–17 → `teen` — REQ-001 · Q-006/Q-080) والشخص (`person`) من S1-02، و`AuditEvent` (النواة المشتركة). ملاحظتان: جداول السجل العام (`permission_key` و`role_template` و`template_key`) مشتركة لكل العائلات بلا `family_id` — نفس المفتاح والقالب يخدمان كل العائلات؛ وجدولا `permission_grant` و`ownership_transfer` يحملان `family_id` + عزل RLS (D-021). ولقطة المنح المحلية (REQ-006) مخزن عميل على الجهاز وليست جدول خادم، فلا تظهر جدولاً هنا.

```mermaid
erDiagram
    family ||--o{ permission_grant : "له منح"
    family ||--o{ ownership_transfer : "له نقل ملكية"
    person ||--o{ ownership_transfer : "مالك حالي"
    person ||--o{ ownership_transfer : "مالك جديد"
    membership ||--o{ permission_grant : "الممنوح له عضو"
    permission_key ||--o{ permission_grant : "مفتاح المنح"
    permission_key ||--o{ template_key : "مفاتيح القوالب"
    role_template ||--o{ template_key : "يحوي مفاتيح"
    permission_grant ||--o{ AuditEvent : "منحه يُسجَّل"
    ownership_transfer ||--o{ AuditEvent : "نقله يُسجَّل"
    membership ||--o{ permission_request : "يطلب تعديلاً"
    permission_request ||--o{ permission_grant : "موافقته تنشئ منحاً"

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
    ownership_transfer {
        uuid transfer_id PK
        uuid family_id FK
        uuid from_member_id FK
        uuid to_member_id FK
        text status
        text auth_method
        timestamptz expires_at
        timestamptz requested_at
        timestamptz accepted_at
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

- `template_key` مفتاحه المركب (`template_id`, `permission_key`) (§5-3).
- `AuditEvent` في ERD يسرد كل حقل في §5-6 (بعد تصحيح R2-S103-19 في B4) — بأنواع مطابقة.
- `permission_request` جدول جديد (§5-7) — طلبات تعديل الصلاحية (R03-17)؛ و`member_id` مفتاح أجنبي إلى `membership.id` (Q-169).
- **توحيد الهوية (Q-169):** `permission_grant.member_id` مفتاح أجنبي إلى `membership.id` (S1-03 SPEC §5-4) — لا إلى `person`؛ فالمراهق والطفل لهما عضوية وبلا `person` (Q-137). وعند منح الوكيل (`grantee_type='agent'`) يكون `member_id` فارغاً.
- `scope` + `valid_until` إلزاميان في كل منح (Q-007 · Q-087)؛ `is_granted=false` رفض صريح وليس غياباً (Q-007).
- `verification_method` قيمه `pin` / `biometric` — للمنح الحساس فقط (REQ-012)؛ و`auth_method` في نقل الملكية PIN أو بصمة (Q-093).

## 3. التسلسل (Sequence) — من عقود §4

تسعة مخططات، كل واحد لتدفق واحد:

### 3-أ. إنشاء منح (REQ-010/011/012 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant S101 as البوابة
    participant Ktor as الخادم
    participant Keys as السجل
    participant Grants as المنح
    participant Audit as التدقيق
    Father->>App: اختيار عضو + مفتاح + scope + valid_until
    App->>Keys: GET /api/v1/permissions/keys — التحقق أن المفتاح في السجل
    alt المفتاح غير موجود في السجل
        Keys-->>App: غير موجود
        App->>Audit: تسجيل الرفض (لا يُنشأ مفتاح ضمنياً — §7-1)
        App-->>Father: رفض PERM_DENIED
    else المفتاح موجود
        App->>Ktor: POST /api/v1/families/{id}/members/{memberId}/grants
        alt المفتاح حساس
            Ktor->>App: تحدٍّ {challenge_id, nonce} — POST /api/v1/shell/verification/challenge (S1-01) — صلاحية 5 دقائق (Q-164)
            App->>S101: طلب تحقق — PIN الأب أو بصمته (Q-088)
            S101-->>App: توقيع nonce بمفتاح الجهاز بعد التحقق المحلي
            App->>Ktor: verification {method, challenge_id, signature, at}
            Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام قبل التنفيذ (Q-164)
            alt بلا verification أو توقيع غير صالح
                Ktor-->>App: رفض PERM_VERIFICATION_REQUIRED
            end
        end
        alt المفتاح من الثوابت الصلبة
            Ktor-->>App: رفض PERM_HARD_INVARIANT + تنبيه الأب (§7-7)
        else المانح ليس المالك
            Ktor-->>App: رفض PERM_NOT_OWNER (§7-6)
        else منح سارٍ
            Ktor->>Grants: حفظ المنح (scope + valid_until إلزاميان)
            Ktor->>Audit: تسجيل المنح (من منح / لمن / متى / ينتهي)
            Ktor-->>App: 201 {grant_id}
            App-->>Father: المنح منفَّذ ومسجَّل
        end
    end
```

- التحقق نفسه محلي (بوابة الوالدين Q-065 / بصمة Q-072) **ويتحقق الخادم من توقيع التحدي بمفتاح الجهاز العام قبل التنفيذ (Q-164)** ويُسجَّل في التدقيق (§4-1)؛ ولو فشل التحقق 3 مرات يعود النظام لطلب PIN (سيناريو 2-4 · Q-072).
- رموز الخطأ الموحدة (§4-4): `PERM_DENIED` · `PERM_HARD_INVARIANT` · `PERM_NOT_OWNER` · `PERM_VERIFICATION_REQUIRED` · `PERM_GRANT_EXPIRED` · `PERM_CONFLICT` — والأخير لتعديلين متزامنين على منح عضو واحد: الثاني يفشل ويُطلب إعادة تحميل أحدث حالة قبل إعادة المحاولة (REQ-019 · §7-8).

### 3-ب. تطبيق قالب على عضو (REQ-013/014 — §4-1)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Templates as القوالب
    participant Grants as المنح
    participant Audit as التدقيق
    Father->>App: اختيار عضو + قالب (partner | guardian | observer)
    App->>Ktor: GET /api/v1/families/{id}/templates — عرض القوالب ومفاتيحها
    Ktor-->>App: [{template_id, title_ar, keys}]
    Father->>App: تطبيق القالب
    App->>Ktor: POST /api/v1/families/{id}/members/{memberId}/grants/apply-template {template_id}
    Ktor->>Templates: قراءة مفاتيح القالب (template_key + default_scope)
    Ktor->>Grants: نسخ مفاتيح القالب إلى منح العضو (valid_until يحدده الأب)
    Ktor->>Audit: تسجيل تطبيق القالب
    Ktor-->>App: المنح المنسوخة من القالب
    App-->>Father: القالب مطبَّق — نقطة انطلاق قابلة للتعديل
    Note over Father,App: تعديل منح العضو بعدها لا يغيّر القالب ولا منح الأعضاء الآخرين (REQ-014)
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
    Ktor->>Ktor: قاعدة المالك أولاً (§6-3 — Q-232): adult + is_owner=true ← allowed
    Ktor->>Ktor: المنح النشط = revoked_at IS NULL و valid_until > now (§6-3)
    alt المالك (is_owner=true)
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
- الثابت الصلب يعطي `reason: "hard_invariant"` (§4-1)؛ والمنح المنتهي `valid_until` يُرفض فوراً (§7-9). والمسار المحلي يميز `unknown_key` بالمفتاح الغائب من نسخة السجل المخزنة على الجهاز (R03-05) — كالخادم في التسمية، ورفض في الأثر. والثابت الصلب يُفحص قبل lookup المنح — خادمياً ومحلياً (§6-3)؛ فلا منح يغطي ثابتاً صلباً.

### 3-د. إلغاء منح — فوري مع إبطال الجلسات (REQ-017 — §4-1/§4-2)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Grants as المنح
    participant S102 as الجلسات
    participant MQTT as الوسيط
    participant Device as الجهاز
    participant Audit as التدقيق
    Father->>App: إلغاء المنح من إدارة الأعضاء
    App->>Ktor: DELETE /api/v1/families/{id}/members/{memberId}/grants/{grantId}
    Ktor->>Grants: revoked_at = now (المفتاح يتوقف لحظياً)
    Ktor->>S102: إبطال جلسات العضو المعلق فوراً (BR-PERM-005)
    Ktor->>MQTT: family/{family_id}/permissions/revoked — دفع إبطال فوري
    MQTT->>Device: تحديث اللقطة المحلية — المفتاح متوقف
    Ktor->>Audit: تسجيل الإلغاء (من ألغى / لمن / متى)
    Ktor-->>App: 204 + إشعار العضو بالإلغاء
    App-->>Father: أُلغي المنح — لا فترة سماح
```

### 3-هـ. نقل الملكية لبالغ (REQ-016 — §4-1 · Q-093)

```mermaid
sequenceDiagram
    autonumber
    actor Father as الأب
    participant App as التطبيق
    participant S101 as البوابة
    participant Ktor as الخادم
    participant Transfer as النقل
    participant Audit as التدقيق
    Father->>App: اختيار بالغ لنقل الملكية إليه
    App->>Ktor: POST /api/v1/families/{id}/ownership-transfer {to_member_id}
    alt المتلقي طفل أو مراهق
        Ktor-->>App: رفض — النقل للبالغين فقط (§7-11 · ACC-013)
    else المتلقي بالغ
        Ktor->>App: تحدٍّ {challenge_id, nonce} — POST /api/v1/shell/verification/challenge (S1-01) — صلاحية 5 دقائق (Q-164)
        App->>S101: طلب تحقق — PIN أو بصمة (Q-093)
        S101-->>App: توقيع nonce بمفتاح الجهاز بعد التحقق المحلي
        App->>Ktor: verification {method, challenge_id, signature, at}
        Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام قبل التنفيذ (Q-164)
        Ktor->>Transfer: إنشاء نقل (status: pending, auth_method)
        Ktor->>Audit: تسجيل بدء النقل
        Ktor-->>App: {transfer_id, status: pending}
        App-->>Father: النقل بدأ — بانتظار الإكمال
    end
```

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
    alt حذف العائلة
        Ktor->>App: تحدٍّ {challenge_id, nonce} — POST /api/v1/shell/verification/challenge (S1-01) — صلاحية 5 دقائق (Q-164)
        App->>Ktor: verification {method: pin | biometric, challenge_id, signature, at}
        Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام (Q-164)
    else إزالة عضو
        Ktor->>Ktor: فحص المفتاح identity.member.remove + PIN الأب
    end
    Ktor->>S102: حذف ناعم — deleted_at + scheduled_purge_at (+30 يوماً) + سجل deletion_request
    Ktor->>S102: إبطال كل الجلسات فوراً (العائلة كاملة / العضو)
    Ktor->>S102: إلغاء نقل ملكية معلق — إن وجد
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

- ملاحظة: حذف العائلة وإزالة العضو غير قابلين للتفويض (REQ-020 — ثابت صلب)؛ والقاصر لا يُزال إلا بيد الأب؛ وطلب حذف دون اتصال يُحفظ في الصندوق الصادر ويُنفَّذ عند الاتصال (بروتوكول الحذف والتصدير — `DELETION-EXPORT-PROTOCOL.md` §6).

### 3-ح. قبول نقل الملكية (REQ-016 — §4-1 · Q-093 · Q-164)

```mermaid
sequenceDiagram
    autonumber
    actor Recipient as المتلقي
    participant App as التطبيق
    participant S101 as البوابة
    participant Ktor as الخادم
    participant Transfer as النقل
    participant Audit as التدقيق
    Recipient->>App: قبول نقل الملكية {transfer_id}
    App->>Ktor: POST /api/v1/families/{id}/ownership-transfer/{transferId}/accept
    alt المتلقي بالغ
        Ktor->>App: تحدٍّ {challenge_id, nonce} — POST /api/v1/shell/verification/challenge (S1-01) — صلاحية 5 دقائق (Q-164)
        App->>S101: طلب تحقق — PIN أو بصمة (Q-093)
        S101-->>App: توقيع nonce بمفتاح الجهاز بعد التحقق المحلي
        App->>Ktor: verification {method, challenge_id, signature, at}
        Ktor->>Ktor: التحقق من التوقيع بمفتاح الجهاز العام قبل القبول (Q-164)
        alt التوقيع صالح
            Ktor->>Transfer: قبول النقل (status: accepted)
            Ktor->>Audit: تسجيل قبول النقل + نقل الملكية
            Ktor-->>App: {transfer_id, status: "accepted"}
            App-->>Recipient: أنت المالك الآن
        else بلا verification أو توقيع غير صالح
            Ktor-->>App: رفض PERM_VERIFICATION_REQUIRED
        end
    else المتلقي طفل أو مراهق
        Ktor-->>App: رفض — النقل للبالغين فقط (REQ-016)
    end
```

- القبول يثبَّت بالتحدي كالبدء تماماً (REQ-016 · Q-093 · Q-164)؛ والاستثناء Q-174 (بلا تحدي لتبديل المنح من S1-09) لا ينطبق هنا. وينتهي النقل بعد 7 أيام بلا قبول (Q-139).

### 3-ط. طلب تعديل صلاحية وقرار الأب (REQ-002/004/015 — §4-1 · R03-17)

```mermaid
sequenceDiagram
    autonumber
    actor Teen as المراهق
    actor Adult as البالغ المفوَّض
    actor Father as الأب
    participant App as التطبيق
    participant Ktor as الخادم
    participant Requests as الطلبات
    participant Grants as المنح
    participant Audit as التدقيق
    Teen->>App: طلب تعديل — مفتاح + نطاق + سبب
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
    else الأب يرفض
        App->>Ktor: POST /api/v1/families/{id}/permission-requests/{requestId}/decide {decision: "deny"}
        Ktor->>Audit: تسجيل الرفض
        Ktor-->>App: {request_id, status: "denied"}
    end
```

- الطلب قناة طلب لا منح: لا يمنح شيئاً بذاته؛ والموافقة تنشئ المنح بقواعد المنح نفسها (REQ-011/012 — والمفتاح الحساس يتطلب `verification`)؛ وطلب ثانٍ لنفس المفتاح وهو معلق → `409`.

## 4. تدفق المستخدم (User Flow) — من السيناريوهات الاثني عشر (§2)

```mermaid
flowchart TD
    Start([الأب يفتح إدارة الأعضاء]) --> Pick[اختيار العضو]
    Pick --> How{كيف يمنح؟}
    How -->|قالب جاهز| Template[تطبيق قالب: شريك / وصي محدود / مراقب]
    Template --> Copy[نسخ مفاتيح القالب إلى منح العضو]
    How -->|مفتاح مفرد| Key[اختيار مفتاح domain.action]
    Copy --> Edit[تعديل دقيق: إضافة / إزالة مفاتيح]
    Key --> Edit
    Edit --> Scope[تحديد scope + valid_until — إلزاميان]
    Scope --> Sens{المفتاح حساس؟}
    Sens -->|نعم| Verify[تحقق: PIN الأب أو بصمته — Q-088]
    Verify --> Fail{فشل التحقق 3 مرات؟}
    Fail -->|نعم| Pin[العودة لطلب PIN — Q-072]
    Pin --> Verify
    Fail -->|لا| Save[حفظ المنح]
    Sens -->|لا| Save
    Save --> Audit[تسجيل في سجل التدقيق — من / لمن / متى / ينتهي]
    Audit --> Done([العضو بصلاحيات معدّلة حسب رغبة الأب])

    Teen([المراهق يحاول فعلاً]) --> Check{المفتاح ممنوح ونشط؟}
    Check -->|نعم — ضمن النطاق| Allow[يُنفَّذ]
    Check -->|لا — غير ممنوح أو منتهٍ أو مرفوض صراحة| Deny[رفض deny-override]
    Deny --> Log[تسجيل الرفض + تنبيه الأب — REQ-007]
    Check -->|ثابت صلب — إشراف / فوترة / ملكية| Hard[رفض PERM_HARD_INVARIANT + تنبيه الأب]

    Done --> Revoke{الأب يلغي المنح؟}
    Revoke -->|نعم| Rev[إلغاء فوري في كل الأجهزة + إبطال الجلسات]
    Rev --> Notify[تسجيل الإلغاء + إشعار العضو]
    Notify --> DelQ{حذف العائلة / إزالة عضو؟}
    DelQ -->|لا| End([انتهى])
    DelQ -->|نعم — حذف عائلة| Challenge["تحدٍّ من الخادم — PIN/بصمة مثبَتة (Q-164)"]
    DelQ -->|نعم — إزالة عضو| PinCheck[مفتاح identity.member.remove + PIN]
    Challenge --> SoftDel[حذف ناعم + سماح 30 يوماً]
    PinCheck --> SoftDel
    SoftDel --> CancelQ{إلغاء خلال السماح؟}
    CancelQ -->|نعم| CancelDel["POST /api/v1/families/{id}/deletion/cancel — عودة نشطاً"]
    CancelDel --> End
    CancelQ -->|لا — بعد 30 يوماً| HardDel[حذف صلب — تجهيل رسائل العضو + تطهير النسخ خلال 30 يوماً]
    HardDel --> End
```

- ملاحظة: القالب نقطة انطلاق لا قيداً — تعديل منح العضو بعد تطبيقه لا يغيّر القالب ولا منح الآخرين (REQ-014 · سيناريو 2-1).
- ملاحظة: بالغ منضم جديداً يبدأ بلا أي منح — لا صلاحية له حتى يمنحه الأب صراحة — عدا منحي بذرة Q-166 (Q-248) (REQ-002).

## 5. مخطط تدفق البيانات (DFD — المستوى 1) — من §4/§5

العمليات مرقمة 1.0–7.0، والمخازن D1–D5. المخزن D5 سجل التدقيق (النواة المشتركة)؛ واللقطة المحلية على جهاز الطفل مخزن عميل (ليست جدول خادم) وتُزامَن عبر MQTT.

- **تغطية نقاط §4:** التسلسلات في §3 تغطي التدفقات الأساسية فقط؛ وكل نقطة §4-1 تظهر هنا على الأقل: `PATCH /api/v1/families/{id}/members/{memberId}/grants/{grantId}` (تعديل النطاق/المدة — REQ-010، يمر عبر P2) · `GET /api/v1/families/{id}/members/{memberId}/permissions` (الصلاحيات الفعلية لعضو — REQ-004، تُقرأ عبر P4) · `GET /api/v1/families/{id}/audit/permissions` (سجل التدقيق — REQ-018، يُقرأ من D5 عبر P6)؛ وبقية النقاط مرسومة في §3 (keys، grants إنشاء/إلغاء، templates، apply-template، check، ownership-transfer — قبول النقل في 3-ح، حذف العائلة/العضو وإلغاء الحذف — 3-ز، طلبات التعديل — 3-ط)؛ وإلغاء نقل الملكية المعلق عبر P2 في DFD.

```mermaid
flowchart LR
    Father([الأب — المالك])
    Adult([البالغ المفوَّض])
    Teen([المراهق / الطفل])
    Recipient([البالغ المتلقي])
    S102([نظام الهوية S1-02])
    S101([نظام الغلاف S1-01 — بوابة الوالدين])
    Consumers([الأنظمة المستهلكة S1-05/S1-06/S1-07/S1-08/S1-09/S1-10])

    subgraph Perm [S1-03: محرك الصلاحيات]
        P1(1.0 إدارة سجل المفاتيح)
        P2(2.0 إدارة المنح — إنشاء / تعديل / إلغاء)
        P3(3.0 تطبيق القوالب)
        P4(4.0 محرك التقييم deny-override)
        P5(5.0 مزامنة المنح واللقطة المحلية)
        P6(6.0 التدقيق والتنبيهات)
        P7(7.0 حذف العائلة والعضو وإلغاء الحذف)
    end

    subgraph Stores [مخازن البيانات]
        D1[("D1 permission_key")]
        D2[("D2 role_template + template_key")]
        D3[("D3 permission_grant")]
        D4[("D4 ownership_transfer")]
        D5[("D5 AuditEvent")]
    end

    Ktor([خادم Ktor])
    MQTT([وسيط MQTT])
    Snapshot[(لقطة المنح المحلية — جهاز الطفل)]

    Father -->|منح / تعديل / إلغاء| P2
    Father -->|تطبيق قالب| P3
    Father -->|نقل ملكية| P2
    Father -->|حذف العائلة / إزالة عضو| P7
    P7 -->|تحقق PIN / بصمة مثبَتة بالتحدي| S101
    P7 -->|تسجيل طلب الحذف + الحذف الناعم| S102
    P2 -->|"إلغاء نقل ملكية معلق (المالك — Q-162)"| D4
    P7 -->|تسجيل الحذف / الإلغاء| P6
    P7 -->|إشعار الأب — وكل البالغين لحذف العائلة| MQTT
    Adult -->|ممارسة ما فُوِّض له| P4
    Teen -->|محاولة فعل| P4
    Teen -->|"طلب تعديل صلاحية (3-ط)"| P2
    Adult -->|"طلب تعديل صلاحية (3-ط)"| P2
    S102 -->|العضوية والدور و is_owner| P2
    S102 -->|بلوغ 13 — تحول الدور| P2
    P1 -->|مفتاح + عنوان عربي + وصف + حساس| D1
    D1 -->|قائمة المفاتيح| P1
    P2 -->|"التحقق من المفتاح في السجل (REQ-009)"| D1
    P2 -->|التحقق PIN / بصمة للمفتاح الحساس| S101
    P2 -->|"حفظ المنح (scope + valid_until)"| D3
    P3 -->|قراءة مفاتيح القالب| D2
    P3 -->|نسخ المفاتيح إلى منح| D3
    P2 -->|"بدء نقل الملكية (PIN أو بصمة)"| D4
    Recipient -->|"قبول نقل الملكية (3-ح)"| P2
    P2 -->|"قبول النقل — status=accepted"| D4
    Consumers -->|POST /api/v1/permissions/check| P4
    P4 -->|قراءة المنح النشطة| D3
    D3 -->|المنح + is_granted + valid_until| P4
    P4 -->|allowed / denied / hard_invariant| Consumers
    P4 -->|رفض حساس أو تصعيد| P6
    P2 -->|منح / تعديل / إلغاء| P6
    P6 -->|أحداث التدقيق| D5
    D5 -->|سجل قابل للعرض على الأب| Father
    P6 -->|"تنبيه الأب عند رفض / تصعيد — family/{family_id}/alerts/new (نوع escalation — S1-09)"| Father
    P2 -->|تغيير منح| P5
    P5 -->|"family/{family_id}/permissions/sync"| MQTT
    P5 -->|"family/{family_id}/permissions/revoked — إبطال فوري"| MQTT
    P6 -->|"family/{family_id}/permissions/grant-expiring — فحص يومي (Q-227)"| MQTT
    MQTT -->|لقطة المنح| Snapshot
    Snapshot -->|"فحص محلي O(1) — checkPermission"| Teen
    P2 -->|"POST grants + ownership-transfer + accept (3-أ/3-هـ/3-ح) + permission-requests (3-ط)"| Ktor
    Ktor -->|"grant_id / transfer_id — pending / accepted (3-أ/3-هـ/3-ح)"| P2
    P3 -->|"POST /api/v1/families/{id}/members/{memberId}/grants/apply-template (3-ب)"| Ktor
    Ktor -->|"المنح المنسوخة من القالب (3-ب)"| P3
    P4 -->|"POST /api/v1/permissions/check (3-ج)"| Ktor
    Ktor -->|"allowed / denied / hard_invariant (3-ج)"| P4
    P7 -->|"DELETE /api/v1/families/{id} + DELETE /api/v1/families/{id}/members/{memberId} + POST /api/v1/families/{id}/deletion/cancel + POST /api/v1/families/{id}/members/{memberId}/deletion/cancel (3-ز)"| Ktor
    Ktor -->|"pending_deletion + purge_at / active (3-ز)"| P7
```

- العملية 4.0 هي الحارس الوحيد: كل فحص صلاحية في المنصة يمر بها (§1) — «لا عملية بلا مفتاح» (REQ-009).
- قبول النقل (3-ح) مسار مستقل عن بدء النقل: المتلقي → P2 → D4 (`status=accepted`) → P6 (تدقيق). ورفض المتلقي للنقل بلا نقطة مخصصة (G-R03-8) — لا يُمتص هنا.
- سجل المفاتيح D1 مشترك لكل العائلات بلا `family_id`؛ وD3 وD4 يحملان `family_id` + RLS (D-021).

## 6. مخطط النشاط (Activity) — دورة حياة المنح والفحص

المسارات الخمسة (الأب / البالغ المفوَّض والمراهق / جهاز الطفل / الخادم / وسيط MQTT) كمسارات متوازية. والمزامنة عبر MQTT والإبطال الفوري يعملان **بالتوازي** مع استخدام التطبيق.

```mermaid
flowchart LR
    subgraph Father [الأب — المالك]
        direction TB
        F1([فتح إدارة الأعضاء])
        F2[اختيار عضو + قالب أو مفاتيح]
        F3[تحديد scope + valid_until]
        F4{مفتاح حساس؟}
        F5[تحقق PIN أو بصمة]
        F6[حفظ المنح]
        F7[إلغاء منح]
        F8[نقل الملكية لبالغ — PIN أو بصمة]
        F9[حذف العائلة / إزالة عضو — PIN/بصمة مثبَتة بالتحدي]
    end
    subgraph Member [البالغ المفوَّض / المراهق]
        direction TB
        M1([محاولة فعل])
        M2[ممارسته ضمن ما فُوِّض له]
        M3[محاولة تصعيد — منح نفسه أو تعديل خارج النطاق]
    end
    subgraph Device [جهاز الطفل — Kotlin]
        direction TB
        K1["فحص محلي O(1) من اللقطة"]
        K2{اللقطة سارية؟}
        K3[إعادة مزامنة كاملة — الفحص على الرفض حتى تكتمل]
    end
    subgraph Server [الخادم — Ktor]
        direction TB
        V1[التحقق: المالك؟ المفتاح في السجل؟ ليس ثابتاً صلباً؟]
        V2[حفظ المنح + تسجيل التدقيق]
        V3[تقييم deny-override — رفض صريح يفوز، وإلا أحدث منح]
        V11[رفض التصعيد + تسجيل التدقيق + تنبيه الأب]
        V4[إبطال فوري + إبطال الجلسات]
        V5[مراجعة المنح عند بلوغ 13]
        V6[حذف ناعم + سماح 30 يوماً + سجل deletion_request عبر S1-02 + إبطال الجلسات + تجهيل رسائل العضو]
        V7[إلغاء حذف معلَّق خلال السماح]
        V10[عودة نشطاً — حذف سجل الحذف المعلق]
        V8["فحص يومي مجدول — منح قريبة من الانتهاء (7 أيام — Q-227)"]
        V9[فحص يومي مجدول — نقل معلق تجاوز 7 أيام → expired + إشعار الأب والمتلقي]
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
    Q1 --> K1
    F7 --> V4
    V4 --> Q2
    Q2 --> K1
    F8 --> V1
    F9 --> F5
    F5 --> V6
    F9 --> V7
    V7 --> V10
    V10 --> F1
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
    V9 --> F1
    V8 --> Q3
    Q3 -->|تنبيه عبر S1-09| F1
```

- عند بلوغ الطفل 13 يتحول دوره تلقائياً وتُراجع منحُه غير الإشرافية ويُشعَر الأب (REQ-003) — المسار V5 إلى F1.
- محاولة التصعيد المرفوضة (M3) تذهب إلى الرفض + التدقيق + تنبيه الأب (V11)؛ ومراجعة العضو تتم من التنبيه (V11 → F1) لا من عقدة التقييم.
- المنح بلا شبكة لا يُنفَّذ محلياً: الخادم هو المرجع، ويُحفظ الطلب في صندوق الصادر ويُعاد عند عودة الاتصال (§7-12 — نمط S1-01).
- الفحص اليومي للمنح القريبة من الانتهاء (V8) يصدر `family/{family_id}/permissions/grant-expiring` (عتبة 7 أيام — Q-227)؛ ويستهلكه S1-09 لتنبيهات `grant_expiring` (§4-2).
- انتهاء نقل الملكية لا ينتظر قبولاً: الفحص اليومي (V9) يقلب المعلق المنتهي إلى `expired` ويُشعر الأب والمتلقي (§7-14 — Q-139).
