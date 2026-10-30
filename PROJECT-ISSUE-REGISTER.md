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
| **Evidence** | في S1-02: `LocalFamilyMembersTable` المفتاح الأساسي `{memberId}` فقط. في S1-03: `LocalFamilyRoleTreeTable` المفتاح الأساسي `{userId}` فقط. كلا الجدولين يحتويان على `familyId` كعمود عادي غير مفتاح. |
| **Root cause** | لم يُحسم في القرارات المعتمدة ما إذا كانت المنصة ستدعم انتماء المستخدم لأكثر من عائلة واحدة في آن واحد. D-021 يُلزم بـ RLS على مستوى `family_id` لكنه لا يحدد ما إذا كان المستخدم يمكنه الانتماء لعائلتين. |
| **Impact** | إذا دُعم تعدد العائلات، ستفشل قواعد الانفراد في الكاش المحلي. |
| **Proposed resolution** | تحديث المفاتيح الأساسية للجداول المحلية ليشمل `familyId` (ISSUE-003 نُفِّذ جزءاً منه). المسألة الكاملة تتطلب قراراً: هل يُسمح لمستخدم بالانتماء لأكثر من عائلة؟ |
| **Acceptance criteria** | قرار معتمد من مالك المشروع بخصوص multi-family membership. |
| **Validation method** | بعد القرار، مراجعة جميع جداول الكاش المحلي للتوافق. |
| **Status** | ⚠️ PARTIALLY RESOLVED — ISSUE-003 نُفِّذ. المسألة الجوهرية تتطلب قراراً من المالك. |

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
| **Evidence** | لم يُفحص هذه الملفات بعمق في هذه المهمة. من المرجح أنها تحتوي على نفس الأنماط (L0-L5 كأدوار وليس طبقات إعدادات) لأنها كُتبت في الجلسة ذاتها قبل أو مع D-038. |
| **Root cause** | نطاق هذه المهمة محدود وفق الأولويات. |
| **Impact** | تناقضات محتملة في توثيق الأنظمة S1-06, S1-07, S1-08, S1-09. |
| **Proposed resolution** | فحص هذه الأنظمة في مهمة منفصلة أو دمجها في مراجعة Phase 1 قبل بدء التنفيذ. |
| **Acceptance criteria** | مراجعة كاملة لملفات S1-06 إلى S1-09. |
| **Validation method** | فحص grep للأنماط ذاتها. |
| **Status** | 📋 OUT OF SCOPE — مسجل للمرحلة التالية |

---

### ISSUE-015

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-015 |
| **Category** | ARC |
| **Priority** | P3 |
| **Affected files** | `spec/99-decisions/decision-log.md` |
| **Evidence** | D-038 يُعلن عن تعديل D-016، لكن D-016 غير موجود في سجل القرارات. جدول القرارات المعتمدة يبدأ من D-001 ويتضمن D-003 حتى D-033 ثم D-038 — لا وجود لـ D-016 بقسم المعتمدة ولا بقسم المفتوحة. |
| **Root cause** | D-016 ربما ألغي أو دُمج في قرار آخر في جلسة سابقة، أو كان قراراً شفهياً غير مسجل. |
| **Impact** | غياب القرار المرجعي الذي يدّعي D-038 تعديله. لا يمكن التحقق من العلاقة. |
| **Proposed resolution** | يحتاج مالك المشروع لتوضيح ما إذا كان D-016 موجوداً في وثيقة خارجية أو ألغي بصمت. لا يُخترع قرار D-016 بدون سند. |
| **Acceptance criteria** | توضيح مصير D-016 من مالك المشروع. |
| **Validation method** | مراجعة أي وثائق تاريخية وإضافة ملاحظة إلى القرار. |
| **Status** | ⚠️ BLOCKED — يتطلب توضيحاً من مالك المشروع |

---

### ISSUE-016

| الحقل | القيمة |
|---|---|
| **Issue ID** | ISSUE-016 |
| **Category** | ARC |
| **Priority** | P3 |
| **Affected files** | `spec/03-phase-1-core/s1-03-family-roles-and-permissions/03-data-model.md` |
| **Evidence** | حقل `scope` غير موجود في جدول `permissions.member_grants` رغم أن D-038 البند 4 ينص على: "لكل صلاحية ممنوحة نطاق يحدده المالك (`all_members`, `specific_members`, `children_only`, `self`)". |
| **Root cause** | حقل `scope` وحقل `valid_until` مذكوران في D-038 لكنهما لم يُضافا لتعريف الجدول في S1-03. |
| **Impact** | نموذج البيانات ناقص وفق ما حدده D-038. |
| **Proposed resolution** | إضافة `scope VARCHAR(20) DEFAULT 'self'` و`valid_until TIMESTAMPTZ` للجدول. لكن هذا يحتاج تحديد قيمة الـ default الصحيحة — مسألة معمارية غير محسومة. |
| **Acceptance criteria** | قرار من مالك المشروع بخصوص القيمة الافتراضية لـ scope وآلية تطبيقها. |
| **Validation method** | بعد القرار، تحديث تعريف الجدول. |
| **Status** | ⚠️ BLOCKED — يتطلب قراراً معمارياً من المالك |

---

## ملخص القضايا

| الحالة | العدد | القضايا |
|---|---|---|
| ✅ RESOLVED في هذه المهمة | 10 | 001-010, 013 |
| ⚠️ PARTIALLY RESOLVED | 1 | 012 |
| ⚠️ BLOCKED — يتطلب قراراً | 2 | 015, 016 |
| 📋 OUT OF SCOPE | 1 | 014 |
| **المجموع** | **16** | — |

---

> **آخر تحديث:** 2026-10-31T02:30+03:00  
> **المهمة:** D-038 Integration & Consistency Closure  
> **الفرع:** `audit/d038-integration-closure-20261031`
