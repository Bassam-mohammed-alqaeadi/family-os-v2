# PROJECT-ISSUE-REGISTER.md — سجل قضايا D-038 Integration Closure

> **التاريخ:** 2026-10-31  
> **الفرع:** `audit/d038-integration-closure-20261031`  
> **الغرض:** توثيق قضايا D-038 Integration & Consistency Closure بعد جرد فعلي للملفات.  
> **المرجعية:** القرار D-038 المعتمد في `spec/99-decisions/decision-log.md`

---

## منهجية الجرد

كل قضية مدعومة بمسار ملف ورقم سطر محدد تم فتحه والتحقق منه. لا ادعاءات دون دليل.

---

## القضايا المؤكدة

---

### ISSUE-001

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-001 |
| **Category** | ARC |
| **Priority** | P0 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/03-data-model.md` |
| **Evidence** | السطر 57: `role_level VARCHAR(10) NOT NULL DEFAULT 'L2', -- 'L0', 'L1', 'L2', 'L3', 'L4', 'L5'` — وهو استخدام L0-L5 كأدوار عضوية في جدول `identity.family_memberships`. السطر 58: تعليق يتضمن `'مشرف'` وهو الدور الملغى `supervisor`. السطر 106: `target_role_level VARCHAR(10) NOT NULL DEFAULT 'L2'` في جدول `family_invitations`. |
| **Root cause** | ملف S1-02/03-data-model.md كُتب قبل اعتماد D-038 بتاريخ 2026-10-30، ولم يُحدَّث بعده. |
| **Impact** | نموذج البيانات يتعارض مباشرة مع D-038 الذي ألغى L0-L5 كأدوار عضوية. أي تطبيق مستقبلي سيستخدم الحقل الخاطئ. |
| **Proposed resolution** | استبدال `role_level` بـ `role` من نوع `VARCHAR(10) CHECK (role IN ('owner','adult','teen','child'))`. استبدال `target_role_level` بـ `target_role`. حذف كلمة `'مشرف'` من التعليق. |
| **Acceptance criteria** | حقل `role` في `identity.family_memberships` بصيغة enum صريحة ('owner','adult','teen','child'). لا إشارة لـ L0-L5 في هذا الجدول. |
| **Validation method** | مراجعة الملف بعد التعديل والتحقق من غياب L0-L5 في سياق تعريف جدول العضوية. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-002

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-002 |
| **Category** | ARC |
| **Priority** | P0 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/03-data-model.md` |
| **Evidence** | السطر 127: `TextColumn get activeRoleLevel => text().withDefault(const Constant('L0'))()` في `LocalUserSessionTable`. السطر 145: `TextColumn get roleLevel => text()()` في `LocalFamilyMembersTable`. |
| **Root cause** | نموذج Flutter المحلي لم يُحدَّث بعد D-038. |
| **Impact** | الكاش المحلي يخزن بيانات بصيغة L0-L5 بدلاً من ('owner','adult','teen','child')، مما يتعارض مع S1-03 data-model المُحدَّث ومع LocalFamilyRoleTreeTable في S1-03. |
| **Proposed resolution** | استبدال `activeRoleLevel` بـ `activeRole` من نوع `text()` يقبل ('owner','adult','teen','child'). استبدال `roleLevel` بـ `role` في `LocalFamilyMembersTable`. |
| **Acceptance criteria** | حقول Flutter المحلية متوافقة مع الأدوار الأربعة. لا `roleLevel` يحمل قيم L0-L5. |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-003

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-003 |
| **Category** | DAT |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-03-family-roles-and-permissions/03-data-model.md` |
| **Evidence** | السطر 95-106: `LocalFamilyRoleTreeTable` يُعرِّف المفتاح الأساسي كـ `{userId}` فقط دون `familyId`. هذا يعني أن مستخدماً ينتمي لأكثر من عائلة واحدة سيتسبب في تضارب السجلات في الكاش المحلي. |
| **Root cause** | تصميم جدول الكاش المحلي افترض أن المستخدم لا ينتمي إلا لعائلة واحدة، وهو احتمال غير محسوم في الوثائق. |
| **Impact** | خطر تسرب بيانات دور المستخدم من عائلة لأخرى في الكاش المحلي إذا دعمت المنصة متعدد العائلات مستقبلاً (D-021 يطلب عزل `family_id`). |
| **Proposed resolution** | تعديل المفتاح الأساسي ليكون `{userId, familyId}` بدلاً من `{userId}` فقط. |
| **Acceptance criteria** | المفتاح الأساسي لـ `LocalFamilyRoleTreeTable` يتضمن `familyId`. |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-004

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-004 |
| **Category** | ARC |
| **Priority** | P0 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/04-api-contracts.md` |
| **Evidence** | السطر 64: `"role_level": "L0"` في استجابة API تسجيل الدخول. السطر 79: `المستخدم L0`. السطر 99: `L0 أو L1 فقط`. السطر 138: `"role_level": "L4"`. |
| **Root cause** | عقود API كُتبت قبل D-038 ولم تُحدَّث. |
| **Impact** | عقد API يُرجع `role_level` بقيم L0-L5 بينما S1-03 وS1-01 يتوقعان ('owner','adult','teen','child'). تعارض مباشر في واجهة التكامل. |
| **Proposed resolution** | استبدال `role_level` بـ `role` في الاستجابات. استبدال وصف "L0" و"L1" بـ "owner" و"adult" في وصف قيود المصادقة. |
| **Acceptance criteria** | جميع استجابات API تستخدم حقل `role` بقيم ('owner','adult','teen','child'). |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-005

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-005 |
| **Category** | GOV |
| **Priority** | P0 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/05-business-rules-and-permissions.md` |
| **Evidence** | السطر 30: `كل عائلة لها مالك رئيسي واحد فقط (\`Owner - L0\`) عند التأسيس.` السطر 31: `إلا بعد نقل الملكية صراحة لشريك بالغ (\`L1\`)`. |
| **Root cause** | ملف قواعد العمل لم يُحدَّث بعد D-038. |
| **Impact** | القواعد التوثيقية تستخدم L0/L1 كأدوار وظيفية وليس كطبقات أولوية إعدادات، مما يتعارض مع D-038. |
| **Proposed resolution** | استبدال "Owner - L0" بـ "owner". استبدال "شريك بالغ (L1)" بـ "adult". تحديث `depends_on` ليشمل D-038. |
| **Acceptance criteria** | قواعد العمل تستخدم الأدوار الأربعة المعتمدة. `depends_on` يشمل D-038. |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-006

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-006 |
| **Category** | UX |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/01-user-scenarios.md` |
| **Evidence** | السطر 20: `مالك العائلة — دور L0`. السطر 36: `الشريك والمشرف — دور L1` (كلمة "مشرف" = supervisor الملغى). السطر 43: `يتم منحها تلقائياً دور L1`. السطر 50: `الأب وطفله «عمر» — دور L4`. |
| **Root cause** | السيناريوهات كُتبت قبل D-038. |
| **Impact** | السيناريوهات التوثيقية تستخدم نموذج أدوار ملغى. |
| **Proposed resolution** | تحديث أوصاف الأدوار في السيناريوهات لتستخدم (owner/adult/teen/child). حذف لقب "المشرف". |
| **Acceptance criteria** | لا إشارات لـ L0-L5 أو supervisor في سيناريوهات S1-02. |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-007

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-007 |
| **Category** | UX |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/08-control-surface.md` |
| **Evidence** | السطر 20: `الأب (المالك L0)`. السطر 60: `المالك (L0 الأب)`. السطر 61: `الشريك (L1 الأم)`. |
| **Root cause** | ملف سطح التحكم لم يُحدَّث بعد D-038. |
| **Impact** | سطح التحكم يُظهر أدوار L0/L1 بدلاً من owner/adult. |
| **Proposed resolution** | استبدال "L0" بـ "owner" و"L1" بـ "adult" في سياق وصف الأدوار. تحديث `depends_on` ليشمل D-038. |
| **Acceptance criteria** | سطح التحكم يستخدم الأدوار الأربعة المعتمدة. |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-008

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-008 |
| **Category** | ARC |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-01-app-shell-and-platform/00-analysis.md`, `01-user-scenarios.md`, `02-screens-index.md`, `04-api-contracts.md`, `05-business-rules-and-permissions.md`, `07-acceptance-and-tests.md`, `08-control-surface.md` |
| **Evidence** | `00-analysis.md` سطر 75: `L0-L5 Engine`. `01-user-scenarios.md` أسطر 33/44/58/71: L0, L1, L3, L4. `02-screens-index.md` أسطر 42/49: `teen - L3`, `child - L4`. `04-api-contracts.md` سطر 49: `"role_level": 0`. `05-business-rules-and-permissions.md` أسطر 27: `L4 أو L5`. `07-acceptance-and-tests.md` سطر 32: `L4 أو L5`. `08-control-surface.md` سطر 33: `الافتراضي L0`. |
| **Root cause** | ملفات S1-01 كُتبت قبل D-038 (أُنجزت 2026-10-30 ثم صدر D-038 في نفس اليوم). |
| **Impact** | وثائق الغلاف الأساسي تستخدم النموذج القديم L0-L5 لوصف تجارب المستخدم، مما يتناقض مع D-038 و role-experience-model المحدَّث. |
| **Proposed resolution** | تحديث الإشارات النصية لتستخدم الأدوار الأربعة. الإشارات التوضيحية (مثل "أدوار L0-L5" بمعنى طبقات الإعدادات) تُبقى مع إضافة تمييز صريح. |
| **Acceptance criteria** | إشارات L0-L5 كأدوار مستخدمين مستبدلة بالأدوار الأربعة في ملفات S1-01. |
| **Validation method** | مراجعة الملفات بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-009

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-009 |
| **Category** | ARC |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-05-rewards-children/00-analysis.md`, `01-user-scenarios.md`, `04-api-contracts.md`, `07-acceptance-and-tests.md`, `08-control-surface.md` |
| **Evidence** | `00-analysis.md` أسطر 61-63: `L0/L1`, `L3`, `L4/L5`. `01-user-scenarios.md` أسطر 20/35/48: L4, L0, L1. `04-api-contracts.md` سطر 86/106: `L0 أو L1`. `07-acceptance-and-tests.md` سطر 20: `رتبة L0 أو L1`. `08-control-surface.md` سطر 20: `الوالدان (L0 و L1)`. |
| **Root cause** | ملفات S1-05 كُتبت قبل D-038. |
| **Impact** | توثيق نظام المكافآت يستخدم أدوار L0-L5 بدلاً من الأدوار الأربعة. |
| **Proposed resolution** | تحديث الإشارات في الملفات المذكورة. |
| **Acceptance criteria** | لا إشارات L0-L5 كأدوار مستخدمين في ملفات S1-05. |
| **Validation method** | مراجعة الملفات بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-010

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-010 |
| **Category** | GOV |
| **Priority** | P2 |
| **Affected files** | `spec/01-foundation/control-and-settings-architecture.md` |
| **Evidence** | السطر 88: `يقفل التحكم، فتصبح قيمته... مثال: \`command\` يقفل «مشاركة الموقع = دائم» على L2` — كلمة `command` هي اسم ملف التجربة القديم الذي أُعيدت تسميته إلى `owner` وفق D-038 البند الثاني فقرة 3. |
| **Root cause** | مثال في الوثيقة يستخدم الاسم القديم `command` الذي يجب أن يصبح `owner`. |
| **Impact** | خلط بين الاسم القديم والجديد في الوثيقة الأساسية للتحكم. |
| **Proposed resolution** | استبدال `\`command\`` بـ `\`owner\`` في السطر 88. |
| **Acceptance criteria** | لا إشارة لـ `command` كاسم دور في هذه الوثيقة. |
| **Validation method** | مراجعة السطر بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-011

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-011 |
| **Category** | GOV |
| **Priority** | P2 |
| **Affected files** | `spec/99-decisions/open-questions.md` |
| **Evidence** | الملف يحتوي على O-004 فقط ولا يُدرج الأسئلة المفتوحة الجديدة المكتشفة من D-038. `last_updated: 2026-10-25` لم يُحدَّث رغم إضافة O-004 بتاريخ 2026-10-31. |
| **Root cause** | تحديث التاريخ في ترويسة الملف لم يتم مع إضافة O-004. |
| **Impact** | بيانات وصفية خاطئة في ترويسة الملف. |
| **Proposed resolution** | تحديث `last_updated` في ترويسة الملف، وإضافة سؤالين مفتوحين جديدين مكتشفين من هذه المهمة. |
| **Acceptance criteria** | التاريخ محدَّث، الأسئلة المفتوحة الجديدة مسجلة. |
| **Validation method** | مراجعة الملف بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

## قضايا مفتوحة تتطلب قراراً معمارياً (BLOCKED)

---

### ISSUE-012

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-012 |
| **Category** | ARC |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/03-data-model.md`, `spec/03-phase-1-core/s1-03-family-roles-and-permissions/03-data-model.md` |
| **Evidence** | في S1-03 سابقاً: كاش الصلاحيات المحلي `LocalMemberPermissionsTable` كان يفتقر لـ `familyId` في أعمدته ومفتاحه. |
| **Root cause** | افتراض انتماء المستخدم لعائلة واحدة محلياً، مع ترك سياسة تعدد العائلات دون حسم. |
| **Impact** | خطر تسرب الصلاحيات عند تعدد العائلات في الكاش المحلي (خرق D-021). |
| **Proposed resolution** | إضافة `familyId` والمفتاح المركب `{userId, familyId, permissionKey}` إلى `LocalMemberPermissionsTable`، وربط سياسة تعدد العائلات بـ O-007. |
| **Acceptance criteria** | تأمين المفاتيح المركبة في الكاش المحلي، وتوثيق المسألة في O-007. |
| **Validation method** | فحص تعريف الجدول في S1-03/03-data-model.md. |
| **Status** | ⚠️ PARTIALLY RESOLVED — تم تأمين المفتاح المركب في كاش الصلاحيات لمنع تسرب البيانات؛ والسياسة العامة لتعدد العائلات تتابع في O-007. |

---

### ISSUE-013

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-013 |
| **Category** | ARC |
| **Priority** | P2 |
| **Affected files** | `spec/03-phase-1-core/s1-03-family-roles-and-permissions/03-data-model.md` |
| **Evidence** | حقل `action_type` في `permissions.audit_log` سطر 66: يحتوي على `'ROLE_LEVEL_CHANGED'` — وهو يستخدم مصطلح "LEVEL" الذي يوحي بـ L0-L5. |
| **Root cause** | تسمية قيمة enum لم تُحدَّث بعد D-038. |
| **Impact** | ضعف دلالي في سجل التدقيق لكن بدون تأثير وظيفي مباشر. |
| **Proposed resolution** | تغيير `'ROLE_LEVEL_CHANGED'` إلى `'ROLE_CHANGED'` في قيم enum التعليقية. |
| **Acceptance criteria** | مصطلح LEVEL_CHANGED غير موجود في تعريف جدول التدقيق. |
| **Validation method** | مراجعة السطر بعد التعديل. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-014

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-014 |
| **Category** | ARC |
| **Priority** | P2 |
| **Affected files** | متعددة (ملفات S1-06, S1-07, S1-08, S1-09) |
| **Evidence** | احتمال وجود بقايا أدوار قديمة في بقية أنظمة المرحلة الأولى غير المبرمجة بعد. |
| **Root cause** | الحاجة إلى تدقيق استباقي قبل بدء البرمجة لكل نظام لاحق. |
| **Impact** | تفادي تسرب أي تناقضات تاريخية إلى الأنظمة اللاحقة. |
| **Proposed resolution** | إدراج فحص هذه الأنظمة كمهمة استباقية مجدولة ضمن خطة العمل لكل نظام قبل البدء فيه. |
| **Acceptance criteria** | فحص ملفات S1-06 إلى S1-09 قبل بدء التنفيذ البرمجي. |
| **Validation method** | تدقيق regex ومراجعة معمارية عند فتح كل نظام. |
| **Status** | 📋 SCHEDULED — مهمة تدقيق استباقية مجدولة قبل برمجة الأنظمة المعنية |

---

### ISSUE-015

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-015 |
| **Category** | ARC |
| **Priority** | P3 |
| **Affected files** | `spec/99-decisions/decision-log.md` |
| **Evidence** | D-038 يُعلن عن تعديل D-016، لكن D-016 غير مسجل في جدول القرارات المعتمدة. |
| **Root cause** | D-016 كان مسودة تاريخية مبكرة لم تُعتمد بصيغة نهائية. |
| **Impact** | عدم وضوح الرابط التاريخي للإحالة. |
| **Proposed resolution** | توثيق المسألة في O-008 وربطها بسجل القرارات دون ادعاء الإلغاء أو الاستيعاب بصمت. |
| **Acceptance criteria** | تسجيل السؤال المعماري في open-questions.md. |
| **Validation method** | مراجعة سجل القرارات والأسئلة المفتوحة. |
| **Status** | ⚠️ BLOCKED — مسجل في O-008 بانتظار توضيح مالك المشروع |

---

### ISSUE-016

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-016 |
| **Category** | ARC |
| **Priority** | P3 |
| **Affected files** | `spec/03-phase-1-core/s1-03-family-roles-and-permissions/03-data-model.md` |
| **Evidence** | حقل `scope` وحقل `valid_until` لم يكونا موجودين في جدول `permissions.member_grants`. |
| **Root cause** | نقص توصيف الحقلين في مخطط S1-03 الأولي. |
| **Impact** | عدم اكتمال نموذج بيانات الصلاحيات وفق ثوابت D-038. |
| **Proposed resolution** | إضافة `scope` و `valid_until` إلى جدول `permissions.member_grants` مع إبقاء الدلالات التفصيلية لـ specific_members معلقة في O-006. |
| **Acceptance criteria** | وجود الحقول في تعريف الجدول ومطابقتها لـ D-038. |
| **Validation method** | فحص جدول member_grants بعد التعديل. |
| **Status** | ✅ RESOLVED في نموذج البيانات (ودلالات التقييم تتابع في O-006) |

---

### ISSUE-017

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-017 |
| **Category** | UX / ARC |
| **Priority** | P0 |
| **Affected files** | شاشات S1-01, S1-02, S1-04, S1-08 وفهارسها |
| **Evidence** | استمرار وجود مسميات الأدوار الملغاة L0–L5، `supervisor`، و `young_child` في ملفات الشاشات وفهارسها. |
| **Root cause** | عدم اكتمال تطهير ملفات واجهات وشاشات المرحلة الأولى بعد اعتماد D-038. |
| **Impact** | تشتت تجربة المستخدم وخرق نموذج رباعي الأدوار وقوالب العرض المعتمدة. |
| **Proposed resolution** | استبدال شامل ومنضبط سياقياً لجميع مسميات الأدوار الملغاة بالرباعي المعتمد (`owner`, `adult`, `teen`, `child`) وفق دليل المراجعة السياقية لحماية O-005. |
| **Acceptance criteria** | اختفاء تام لمسميات L0-L5 كأدوار للمستخدمين في كافة شاشات وفهارس المرحلة الأولى. |
| **Validation method** | فحص regex آلي على مجلدات screens و screens-index. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-018

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-018 |
| **Category** | ARC / DAT |
| **Priority** | P0 |
| **Affected files** | `spec/03-phase-1-core/s1-03-family-roles-and-permissions/04-api-contracts.md`, `03-data-model.md` |
| **Evidence** | غياب `scope` و `valid_until` عن استجابات `GET /effective`، طلبات `PUT /grants`، وحمولة أحداث WebSocket. |
| **Root cause** | عدم اكتمال دورة حياة محرك الصلاحيات في عقود الواجهات والأحداث. |
| **Impact** | عجز الواجهة وتطبيق Flutter عن معرفة نطاق الصلاحية المفوضة ومهلتها الزمنية. |
| **Proposed resolution** | توسيع استجابة `GET /effective` وطلبات `PUT /grants` وتوثيق حمولة `permissions.member.updated` لتشمل النطاق والمهلة والإصدار. |
| **Acceptance criteria** | ظهور حقلي `scope` و `valid_until` في عقود الواجهات وأحداث Outbox. |
| **Validation method** | فحص وثيقة عقود API والتحقق من صحة كتل JSON. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-019

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-019 |
| **Category** | SEC / DAT |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-03-family-roles-and-permissions/03-data-model.md` |
| **Evidence** | جدول الكاش المحلي `LocalMemberPermissionsTable` كان يعرف المفتاح كـ `{userId, permissionKey}` فقط دون عمود `familyId`. |
| **Root cause** | إغفال العزل الأسري في كاش الصلاحيات المحلي أثناء الصياغة الأولى. |
| **Impact** | خطر تداخل وتسرب الصلاحيات بين العائلات على الأجهزة المشتركة (خرق صريح للقرار D-021). |
| **Proposed resolution** | إضافة عمود `familyId` وتوسيع المفتاح الأساسي ليصبح `{userId, familyId, permissionKey}`. |
| **Acceptance criteria** | وجود `familyId` في أعمدة ومفتاح `LocalMemberPermissionsTable`. |
| **Validation method** | مراجعة تعريف جدول Drift في S1-03/03-data-model.md. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-020

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-020 |
| **Category** | BUS / GOV |
| **Priority** | P1 |
| **Affected files** | ملفات نظام `S1-05 — rewards-children` |
| **Evidence** | إتاحة فتح محافظ النقاط وكسب واستبدال الجوائز للمراهقين (`teen`) في نصوص S1-05. |
| **Root cause** | تأويل غير دقيق لمشاركة المراهقين يتعارض مع النص الحرفي للقرار D-012. |
| **Impact** | تعارض تشغيلي ومعماري مباشر مع القرار D-012 الذي يقصر المكافآت على الأطفال حصراً. |
| **Proposed resolution** | حصر المحافظ والنقاط والاستبدال بدور `child` فقط، وتعليق وضع تصفح الكتالوج للمراهقين رهن القرار في O-009. |
| **Acceptance criteria** | رفض فتح محفظة أو تسجيل نقاط لغير الأطفال، وتعديل مصفوفة الصلاحيات وقواعد العمل. |
| **Validation method** | مراجعة ملفات S1-05 (00-analysis, 02-screens-index, 04-api-contracts, 05-business-rules). |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-021

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-021 |
| **Category** | INT |
| **Priority** | P1 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/04-api-contracts.md` |
| **Evidence** | وجود علامات اقتباس مسبوقة بشرطة مائلة مقلوبة `\"role\": \"owner\"` وتعليقات غير معيارية داخل كتل JSON. |
| **Root cause** | خطأ في إفلات النصوص أثناء عمليات التحرير السابقة. |
| **Impact** | كتل JSON غير صالحة برمجياً، مما يفشل أدوات الفحص والتوليد التلقائي للكود. |
| **Proposed resolution** | إزالة الشُرط المائلة المقلوبة ونقل التعليقات خارج كتل `json` لتصبح كتل JSON معيارية صالحة. |
| **Acceptance criteria** | نجاح فحص `JSON.parse` لجميع كتل JSON في الملف بنسبة 100%. |
| **Validation method** | تشغيل فحص برمجي آلي للتحقق من صحة الـ JSON. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-022

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-022 |
| **Category** | SEC |
| **Priority** | P0 |
| **Affected files** | `spec/03-phase-1-core/s1-02-identity-and-onboarding/03-data-model.md`, `05-business-rules`, `07-acceptance` |
| **Evidence** | قيد `target_role` في جدول `identity.family_invitations` كان يقبل القيمة `'owner'`. |
| **Root cause** | إدراج كافة الأدوار الأربعة تلقائياً دون مراعاة حصرية وسيادة الملكية. |
| **Impact** | ثغرة أمنية تسمح باقتناص دور المالك عبر رمز دعوة عادي دون التأسيس أو نقل الملكية المشدد. |
| **Proposed resolution** | تقييد القيد برمجياً إلى `CHECK (target_role IN ('adult', 'teen', 'child'))` وإضافة قواعد وحالات اختبار ترفض استهداف المالك. |
| **Acceptance criteria** | خلو قيد CHECK من دور owner، ورفض الخادم لأي دعوة تستهدف المالك بكود 400 Bad Request. |
| **Validation method** | فحص كود SQL وحالات الاختبار AC-S1-02-06. |
| **Status** | ✅ RESOLVED في هذه المهمة |

---

### ISSUE-023

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-023 |
| **Category** | ARC / INT |
| **Priority** | P2 |
| **Affected files** | `spec/03-phase-1-core/s1-08-chat-basic/screens/chat-info.md`, `05-business-rules`, `s1-03/05-business-rules` |
| **Evidence** | توثق شاشات وقواعد S1-08 خمس عمليات إدارية وإشرافية (كتم المشارك، إزالته، حذف الرسالة للجميع، تثبيتها، ومسح السجل بـ PIN) دون وجود مفاتيح معتمدة لها في كتالوج ومصفوفة S1-03. |
| **Root cause** | فجوة ربط وتتبع معماري (Traceability Gap) بين ضوابط المحادثة ونظام الصلاحيات. |
| **Impact** | عدم وضوح تمثيل هذه العمليات: هل هي حصرية للمالك أم صلاحيات ذرية مفوضة. |
| **Proposed resolution** | تسجيل الفجوة كمسألة معمارية مفتوحة O-010 لدراسة الخيارين المعتمدين (حصرية المالك أو صلاحيات ذرية domain.action مفوضة صراحة) دون اختراع مفاتيح أو تغيير سلوك المنتج. |
| **Acceptance criteria** | توثيق الفجوة في open-questions.md تحت O-010 وعدم إغلاق القضية قبل اعتماد المالك. |
| **Validation method** | مراجعة S1-08 و O-010. |
| **Status** | ⚠️ BLOCKED — رهن المسألة المعمارية المفتوحة O-010 |

---

## ملخص القضايا

| الحالة | العدد | القضايا |
|---|---|---|
| ✅ RESOLVED في هذه المهمة | 19 | 001-011, 013, 016, 017, 018, 019, 020, 021, 022 |
| ⚠️ PARTIALLY RESOLVED | 1 | 012 |
| ⚠️ BLOCKED — يتطلب قراراً | 2 | 015, 023 |
| 📋 SCHEDULED — مهمة مجدولة | 1 | 014 |
| **المجموع** | **23** | — |

---

> **آخر تحديث:** 2026-10-31<br>
> **المهمة:** D-038 Integration & Consistency Closure (Refined Plan Execution)<br>
> **الفرع:** `audit/d038-integration-closure-20261031`
