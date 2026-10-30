# معمارية التحكم والإعدادات (Control & Settings Architecture)

> الحالة: معتمد للتنفيذ | القرارات المرتبطة: D-012, D-014, D-015, D-016, D-017, D-018 | يعتمد على: role-experience-model.md, glossary.md
> الملف على جزأين: الجزء 1 (الأقسام 1-5) والجزء 2 (الأقسام 6-14).

## 1. الغرض والمبادئ
هذا الملف هو **العقد المشترك** لكل لوحة تحكم وإعداد في المنصة. أي نظام (S1-xx وما بعده) يعرّف تحكماته بهذا الشكل فقط، ولا يبتكر آلية خاصة به.

المبادئ الملزمة:
1. **التحكم أولًا (D-014):** لا خدمة بلا سطح تحكم كامل (ملف 08-control-surface).
2. **تعريف واحد، عرض متعدد:** التحكم يُعرَّف مرة واحدة (`ControlDefinition`) ويُعرض حسب ملف التجربة (D-016).
3. **قيمة فعالة واحدة:** لكل تحكم لفرد/سياق قيمة فعالة تُحسم بطبقات ثابتة، مع **إسناد المصدر** (لماذا هذه القيمة؟).
4. **قوالب ثم تفاصيل (D-015):** المستخدم يبدأ بقالب جاهز ثم يفتح التفاصيل المتقدمة.
5. **الصدق (D-018):** كل تحكم له حالة توفر صريحة، لا وعد بما لا يعمل.
6. **الأمان بالتقييد:** في تحكمات حماية الطفل، الأكثر تقييدًا يفوز عند التعارض، وتحكمات الطفل نفسه لا تُرخي ما شدّده الأهل.
7. **كل تغيير مُدقَّق وقابل للتراجع.**
8. **الخصوصية بالتصميم:** لا يمنح التحكم وصولًا لمحتوى الرسائل (D-011).

## 2. تعريف التحكم (ControlDefinition)
كل تحكم يُسجَّل في `control_registry` بالشكل التالي (الحقول بالإنجليزية):

```
ControlDefinition {
  key:               string        // "location.share_mode" (domain.name، فريد وثابت)
  system_id:         string        // "S1-03"
  group_key:         string        // مجموعة العرض داخل اللوحة
  title_key, help_key: i18n keys
  kind:              enum          // انظر 3
  value_schema:      JSONSchema    // النوع والقيود والمدى
  default_value:     any           // قيمة L0
  scope:             enum          // family | member | device | context
  applies_to:        member_profile[]   // adult | child | both
  merge_strategy:    enum          // انظر 4.3
  safety_class:      enum          // standard | protective | critical
  read_permission:   permission_key
  write_permission:  permission_key
  child_writable:    boolean|"tighten_only"  // هل يغيّره الطفل نفسه
  requires_approval: ApprovalPolicy?  // انظر الجزء 2
  availability:      AvailabilityRule[] // انظر الجزء 2
  conditions:        ConditionalRule[]? // انظر الجزء 2
  template_tags:     string[]      // لربطه بالقوالب
  advanced:          boolean       // يظهر فقط في «تفاصيل متقدمة»
  platforms:         { android, ios, web } // availability per platform
  audit:             { log: true, redact_value: boolean }
  since_version, deprecated_in?
}
```

قواعد التسجيل:
- `key` لا يتغير أبدًا بعد النشر؛ الإلغاء عبر `deprecated_in`.
- كل `ControlDefinition` يمر باختبار مخطط (schema test) في CI يتحقق من اكتمال الحقول.
- `safety_class = critical` (مثل SOS، حذف البيانات) لا يُعطَّل إلا بإذن المالك.

## 3. أنواع التحكم (kind)
| kind | الوصف | مثال |
|---|---|---|
| `toggle` | تشغيل/إيقاف | مشاركة الموقع |
| `choice` | اختيار واحد | وضع المشاركة: دائم/أثناء الاستخدام/معطل |
| `multi_choice` | عدة اختيارات | فئات المحتوى المحظورة |
| `number` / `duration` | رقم أو مدة بمدى | حد الشاشة اليومي |
| `schedule` | جدول أسبوعي | ساعات النوم |
| `member_set` | مجموعة أفراد | من يرى موقعي |
| `list` | قائمة عناصر | جهات اتصال معتمدة |
| `geofence_set` | مناطق جغرافية | المدرسة، البيت |
| `rule_set` | قواعد شرطية | إذا خرج من المدرسة أرسل تنبيه |
| `action` | إجراء لحظي | قفل الجهاز الآن |
| `template_ref` | قالب مطبق | قالب «طفل صغير» |

## 4. حسم القيمة الفعالة (Effective Value Resolution)

### 4.1 الطبقات (Layers)
من الأضعف أولوية إلى الأقوى (الأعلى رقمًا يغلب عند الدمج الافتراضي `override`):

| الطبقة | الاسم | المصدر | من يكتب |
|---|---|---|---|
| **L0** | Platform Default | افتراضي المنصة | المنصة فقط |
| **L1** | Plan & Legal | حدود الخطة والقانون والدولة | المنصة (نظام داخلي) |
| **L2** | Family Policy | سياسة العائلة والقالب المطبق | `command` |
| **L3** | Role/Group Policy | سياسة حسب الدور أو المجموعة (كل الأطفال، كل المراهقين) | `command`/`supervisor` مفوَّض |
| **L4** | Member Setting | إعداد فرد محدد (يشمل تفضيلاته الشخصية) | المفوَّض أو الفرد نفسه حسب `child_writable` |
| **L5** | Context Override | جهاز محدد، وقت، مكان، أو **استثناء مؤقت** | المفوَّض أو بموافقة |

ملاحظات:
- **L1 حدود صلبة (Hard Bounds):** لا تُتجاوز بأي طبقة (مثل الحد الأدنى للعمر القانوني، أو ميزة غير مشمولة في الخطة).
- الإعداد الشخصي للفرد (لغة، مظهر، إشعاراته) يقع في L4 بملكية `member_self`.

### 4.2 القفل والاستثناء
- **القفل (Lock):** يستطيع صاحب صلاحية في طبقة ما أن يقفل التحكم، فتصبح قيمته غير قابلة للتغيير في الطبقات الأعلى رقمًا (أو لأفراد معينين). مثال: `command` يقفل «مشاركة الموقع = دائم» على L2 فلا يغيّرها المراهق في L4.
- من يقفل: صلاحية `controls.lock` فقط. يظهر القفل للمتأثر بنص صادق: «مقفل من الأب».
- **الاستثناء (Exception):** قيمة مؤقتة في L5 لها: `expires_at` (إلزامي)، `reason`، `created_by`، `approved_by?`. تنتهي تلقائيًا وتعود القيمة السابقة. لا استثناء دائم؛ الدائم تغيير عادي.
- الاستثناء **لا يكسر قفلًا** إلا لمن يملك `controls.override_lock`.
- طلب الطفل لاستثناء يتحول إلى **طلب موافقة** (الجزء 2).

### 4.3 استراتيجيات الدمج (merge_strategy)
| الاستراتيجية | السلوك |
|---|---|
| `override` (الافتراضي) | أعلى طبقة لها قيمة تغلب |
| `most_restrictive` | الأكثر تقييدًا بين كل الطبقات (للحماية) |
| `most_permissive` | الأكثر سماحًا (نادر) |
| `numeric_min` / `numeric_max` | الأدنى/الأعلى (حدود الوقت مثلًا) |
| `union` | اتحاد القوائم (المحظورات) |
| `intersection` | تقاطع (من يحق له الرؤية) |
| `schedule_overlay` | دمج الجداول: أي فترة منع في أي طبقة تُطبَّق |

قاعدة ذهبية: **أي تحكم `safety_class` أعلى من `standard` يجب أن يستخدم استراتيجية تقييد** (`most_restrictive`/`numeric_min`/`union`/`schedule_overlay`)، ويُرفض تسجيله بغير ذلك.

### 4.4 خوارزمية الحسم
```
resolve(control_key, member_id, context) -> EffectiveValue
 1. layers = collect values for L0..L5 that apply (member, role/group, device, time/place)
 2. apply L1 hard bounds as clamp (always last)
 3. if any layer holds a lock at layer k: ignore writes from layers > k (already rejected at write time)
 4. merge per merge_strategy (expired exceptions dropped)
 5. clamp result by L1 bounds
 6. attach provenance
 return {
   value,
   source_layer,         // الطبقة الحاسمة
   contributing_layers[],
   locked: bool, locked_by?,
   exception?: {expires_at, reason},
   availability,         // من حالات التوفر (D-018)
   resolved_at, version
 }
```
- النتيجة تُخزَّن مؤقتًا (Redis) بمفتاح `(control_key, member_id, context_hash)` وتُبطَل عند أي تغيير في أي طبقة مؤثرة.
- الحسم يتم **على الخادم** والمصدر الحقيقي، والتطبيق يخزن نسخة للعمل دون اتصال مع `version` للمزامنة.
- واجهة «لماذا؟»: كل قيمة تعرض مصدرها (مثال: «من قالب: طفل صغير»، «مقفل من الأب»، «حد الخطة المجانية»).

## 5. الصلاحيات (Permissions Catalog)

### 5.1 الصيغة
`domain.action` بحروف صغيرة. مثل `location.view`, `controls.manage`.

```
PermissionGrant {
  grantee_member_id | role_id,
  permission_key,
  scope: { type: "family" | "members" | "self", member_ids? },
  constraints?: { services[], time_window?, expires_at? },
  granted_by, granted_at
}
```
- الدور (D-012) = مسمى + مجموعة `PermissionGrant`.
- التفويض يمكن أن يكون **محدود النطاق** (مثال: الأم ترى موقع الأطفال فقط).
- **لا يمكن لمفوَّض منح ما لا يملكه، ولا أكثر مما يملكه.** والتفويض الإضافي (re-delegation) يتطلب `delegation.redelegate` مفعّلة صراحة.

### 5.2 مستوى الخطورة (risk)
`low` | `medium` | `high` | `owner_only`. تحدد: هل يحتاج تأكيدًا إضافيًا (PIN/بيومتري)، وهل يُشعر المالك، وهل يمكن تفويضه.

### 5.3 الكتالوج الأساسي للمرحلة 1
| المجال | الصلاحيات (action) | الخطورة |
|---|---|---|
| `family` | `view`, `edit_profile`, `manage_all`, `delete`, `transfer_ownership` | medium / owner_only للحذف والنقل |
| `members` | `view`, `invite`, `create_child`, `edit`, `remove`, `view_as` | medium / high |
| `roles` | `view`, `manage`, `delegate`, `redelegate` | high |
| `controls` | `view`, `manage`, `lock`, `override_lock`, `apply_template`, `view_audit`, `revert` | high |
| `approvals` | `request`, `decide`, `view` | medium |
| `chat` | `use`, `create_group`, `moderate_children`, `set_child_contacts` | low / medium |
| `location` | `view`, `view_history`, `manage_places`, `manage_alerts`, `share_self` | medium / high |
| `safety` | `trigger_sos`, `view_alerts`, `manage_alerts`, `manage_emergency_contacts` | high |
| `monitoring` | `view_summary`, `manage_rules`, `view_flagged` | high (يُنقَّح لاحقًا في المرحلة 2) |
| `screen_time` | `view`, `manage_limits`, `grant_extension` | medium |
| `content` | `view_settings`, `manage_filters`, `manage_allowlist` | medium |
| `rewards` | `view`, `configure`, `grant`, `redeem_approve` | medium |
| `ai` | `use`, `configure`, `view_usage` | medium |
| `education` | `use`, `assign`, `view_progress` | low / medium |
| `religion` | `use`, `configure_content` | low |
| `billing` | `view`, `manage_plan` | owner_only |
| `privacy` | `manage_self`, `export_family_data`, `request_deletion` | high |
| `notifications` | `manage_self`, `manage_family_policy` | low / medium |
| `audit` | `view_own`, `view_family` | medium |

قواعد:
- الأنظمة اللاحقة (المراحل 2-6) تضيف مجالات جديدة بنفس الصيغة وتسجلها في `permission_registry`؛ لا تُنشأ صلاحية خارج السجل.
- `owner_only` لا تُفوَّض أبدًا: `family.delete`, `family.transfer_ownership`, `billing.manage_plan`.
- `view_as` و`monitoring.view_flagged` تُشعر المالك عند منحها لغيره.
- الطفل لا يملك أبدًا صلاحيات `controls.*` ولا `members.*` ولا `roles.*` ولا `billing.*` (حد صلب L1).

### 5.4 فحص الصلاحية
```
can(actor, permission, target_member?, context) -> { allowed, reason_code }
```
- يُنفَّذ على الخادم في كل طلب (لا ثقة بالعميل).
- `reason_code` يغذي الحالات الصادقة: `not_delegated`, `disabled_by_owner`, `requires_upgrade`, `pending_approval`.
- أي شاشة تعرض عنصرًا مرتبطًا بصلاحية تستخدم `can()` نفسه، فيتطابق ما يُرى مع ما يُسمح به.

## 6. الموافقات (Approvals)

### 6.1 الغرض
قناة موحّدة لأي إجراء يحتاج قرار شخص آخر: طلب طفل لاستثناء، أو تغيير عالي الخطورة من مفوَّض. لا آلية موافقة خاصة بأي نظام.

### 6.2 السياسة على التحكم (ApprovalPolicy)
```
ApprovalPolicy {
  required_when: "always" | "actor_not_owner" | "actor_is_child" | "risk_at_least:<level>"
  decider_permission: "approvals.decide"
  decider_scope: "owner_only" | "any_guardian" | "member_guardians"
  expiry: duration            // مثال: 24h
  allow_duration_choices: boolean   // موافقة مؤقتة: 30 دقيقة / ساعة / اليوم / دائم
  escalate_after?: duration   // يصعد إلى المالك إن لم يُحسم
}
```

### 6.3 طلب الموافقة (ApprovalRequest)
```
ApprovalRequest {
  id, family_id, requester_id, type, control_key?, target_member_id?,
  proposed_change: { layer, value, duration? },
  reason_text?, status, decided_by?, decided_at?, decision_note?,
  created_at, expires_at
}
type: exception_request | control_change | permission_grant | contact_add
      | reward_redeem | new_device | plan_change
status: pending | approved | denied | expired | cancelled
```

### 6.4 القواعد
1. لا يوافق أحد على طلب هو صاحبه.
2. الموافقة تنفّذ التغيير تلقائيًا (كتابة L5 أو L4 حسب النوع) وتُسجَّل في التدقيق بمصدر `approval`.
3. الطفل له سقف طلبات معلّقة (افتراضي 3) وفاصل بين الطلبات المتكررة لنفس التحكم (افتراضي 15 دقيقة) لمنع الإلحاح، وكلاهما قابل للضبط.
4. الرفض يتيح ملاحظة قصيرة ظاهرة للطالب (ودّية للطفل).
5. انتهاء الصلاحية دون قرار يعني `expired` وليس موافقة ضمنية أبدًا.
6. القرار بنقرة واحدة من الإشعار، مع خيارات المدة عند `allow_duration_choices`.
7. الطلب الحرج (`critical`) من غير المالك يحتاج تأكيد PIN/بيومتري عند القرار.

## 7. القوالب (Templates)

### 7.1 الأنواع
- **قوالب المنصة (system):** جاهزة وموثقة ومُصانة من المنصة، مثل: «طفل صغير»، «طفل»، «مراهق»، «بالغ في العائلة»، «حماية قصوى»، «ثقة متدرجة».
- **قوالب العائلة (family):** ينشئها `command` من إعدادات حالية («احفظ كقالب»).

### 7.2 البنية
```
ControlTemplate {
  id, scope: "system" | "family", name_key|name, description,
  target_profiles: experience_profile[],
  entries: [{ control_key, value, lock?: boolean }],
  version, created_by?
}
TemplateApplication {
  id, template_id, template_version, target: member|group|family,
  layer: L2 | L3 | L4, mode: "snapshot" | "linked",
  applied_by, applied_at, overrides_after[]   // تحكمات عُدّلت بعد التطبيق
}
```

### 7.3 قواعد التطبيق
1. **معاينة فرق (Diff Preview) إلزامية** قبل أي تطبيق: ما الذي سيتغير، وما الذي يتجاوزه قفل أو حد L1، وما غير متاح على الجهاز.
2. الوضع الافتراضي `snapshot`: تُنسخ القيم وتصبح إعدادات عادية. الوضع `linked` اختياري: تحديث القالب ينتشر لكن **بإشعار ومعاينة** ولا يُطبَّق صامتًا.
3. التطبيق لا يكسر قفلًا ولا حد L1، وما تعذّر يُذكر في تقرير النتيجة بحالته الصادقة.
4. التراجع عن تطبيق قالب كاملة عملية واحدة (`revert` على `TemplateApplication`).
5. أي قالب يُعرَض كبطاقات بصورة واضحة أولًا، ثم زر «تفاصيل متقدمة» (D-015).
6. قوالب المنصة تُوصي ولا تفرض: لا يُطبَّق قالب تلقائيًا على طفل جديد دون تأكيد الأب، لكنه يُقترح افتراضيًا بحسب عمره.

## 8. حالات التوفر (Availability States)
مصدر واحد للحالة الصادقة (D-018). تُحسب مع القيمة الفعالة:

| الحالة | المعنى | الإجراء المعروض |
|---|---|---|
| `available` | يعمل | لا شيء |
| `unavailable_on_device` | جهاز الفرد لا يدعمه (مثل iOS لتحكم أندرويد) | شرح + بديل إن وُجد |
| `pending_approval` | تغيير ينتظر قرارًا | عرض الطلب |
| `not_delegated` | لا تملك الصلاحية | «اطلب من الأب» |
| `disabled_by_owner` | عطّله المالك | شرح |
| `requires_upgrade` | خارج الخطة | عرض الترقية (للمالك) |
| `coming_soon` | مخطط وغير مُنفَّذ | تاريخ/مرحلة إن وُجد |

```
AvailabilityRule {
  states_when: [{ condition, state }]   // condition: platform | os_version | plan | permission | feature_flag | device_capability
}
```
قواعد:
- تُقيَّم بالترتيب ويفوز أول شرط غير متاح.
- **ممنوع** عرض تحكم كأنه فعّال وهو لا يُنفَّذ فعليًا. أي تحكم يُسجَّل في الواجهة قبل جاهزية تنفيذه يحمل `coming_soon`.
- يُفحص دعم الجهاز عبر `device_capability_report` يرسله العميل (صلاحيات النظام المُمنوحة، إصدار النظام، حالة خدمات التحكم العميق).
- إذا فقد جهاز الطفل صلاحية مطلوبة (مثلًا أُلغي إذن الوصول)، تتحول التحكمات المتأثرة إلى `unavailable_on_device` فورًا ويُنبَّه الأب (لا فشل صامت).

## 9. القواعد الشرطية (Conditional Rules)

### 9.1 البنية
```
ConditionalRule {
  id, family_id, name, enabled,
  scope: { member_ids[] | group },
  trigger: time_window | place_enter | place_exit | usage_threshold
           | approval_decided | device_event | manual,
  conditions: { all|any: [ predicate ] },
  actions: [ set_exception | notify | require_approval | lock_device | send_message_template ],
  priority: int, cooldown: duration, created_by
}
```
مثال: «إذا خرج [الابن] من المدرسة ولم يصل البيت خلال 45 دقيقة، أنبّه الأب والأم».

### 9.2 الضوابط
1. القاعدة تكتب في **L5** بمصدر `rule` ومدة صلاحية، ولا تعدّل L2-L4.
2. القاعدة لا تكسر قفلًا ولا حد L1، ولا **تخفف** تحكم حماية (قاعدة تقييدية فقط للتحكمات `protective`/`critical`).
3. منع الحلقات: قاعدة لا تُطلق قاعدة أخرى أكثر من عمق 1، وفترة `cooldown` إلزامية.
4. **محاكاة (Dry Run)** قبل التفعيل: تعرض متى كانت ستنطلق خلال آخر 7 أيام.
5. حدود العدد حسب الخطة (L1).
6. الإجراءات التنفيذية على جهاز الطفل (قفل، حجب) تخضع للتوفر (أندرويد فقط من المرحلة 2).
7. كل انطلاق مُدقَّق ويظهر للأب بسبب واضح.

## 10. التدقيق والتراجع (Audit & Revert)

### 10.1 سجل التدقيق
```
AuditEntry {
  id, family_id, actor_id, on_behalf_of?, source,
  action,          // set | lock | unlock | exception_create | exception_expire
                   // | template_apply | rule_fire | approval_decide | grant | revoke | view_as
  control_key?, target_member_id?, layer?,
  old_value?, new_value?, reason?, request_id, device_id?, at
}
source: user | template | rule | approval | exception_expiry | system
```
- **إضافة فقط (append-only)** ولا حذف ولا تعديل.
- `redact_value = true` في تعريف التحكم يخفي القيم الحساسة ويحفظ الحدث فقط.
- الاحتفاظ: افتراضي 12 شهرًا، ويُحسم الحد الأعلى مع data-governance.

### 10.2 من يرى ماذا
- `command`: كل السجل.
- `supervisor`: ما يخص نطاقه.
- أي فرد: ما غيّره هو، وما غُيِّر بشأنه بصياغة مبسطة (الشفافية: المراهق والطفل يرون «ما الذي تغيّر في إعداداتي» دون تفاصيل المراقبة الداخلية).

### 10.3 التراجع
- `revert(audit_id)` يكتب تغييرًا جديدًا يعيد القيمة السابقة (لا يمحو السجل).
- يُرفض إن تعارض مع قفل أو قيمة أحدث، ويُعرض الفرق ليقرر المستخدم.
- التراجع عن `critical` يحتاج المالك.
- تراجع فوري (Undo) بإشعار 10 ثوانٍ بعد التبديلات البسيطة.

## 11. مركز القيادة ومركز الإعدادات (D-017)
يُنفَّذان في النظام S1-09 **بعد S1-03**، ويقرآن كل شيء من السجلات (registries) دون ترميز يدوي لكل خدمة.

### 11.1 مركز القيادة (الشاشة الرئيسية لـ command)
تفاصيله البصرية في role-experience-model والتصميم. ويعتمد على: `approvals` المعلقة، وأحداث السلامة، وحالة الأفراد، و`WidgetRegistration`.

### 11.2 مركز الإعدادات (Settings Center)
الهيكل الثابت:
1. **العائلة:** الملف، السياسة العامة، القوالب المطبقة.
2. **الأفراد:** صفحة لكل فرد (الدور، الصلاحيات، الملف، الأجهزة، «العرض كـ»).
3. **الخدمات:** بطاقة لكل خدمة تفتح سطح التحكم الخاص بها (08-control-surface).
4. **القوالب.**
5. **الموافقات والاستثناءات.**
6. **القواعد.**
7. **التدقيق.**
8. **الخصوصية والبيانات.**
9. **الخطة والفوترة** (للمالك).

### 11.3 نمط صفحة الخدمة الموحّد (Control Surface Layout)
1. رأس: حالة الخدمة + حالتها الصادقة.
2. **القوالب الجاهزة** (D-015).
3. **المجموعات الرئيسية** (التحكمات غير المتقدمة، مرتبة بحسب `group_key`).
4. **تفاصيل متقدمة** (`advanced = true`).
5. **حسب الفرد:** مبدّل يعرض القيمة الفعالة لكل فرد وإمكانية الاستثناء.

### 11.4 قدرات مشتركة
- **بحث شامل** في كل التحكمات (من `title_key` و`help_key`).
- **«لماذا؟»:** عرض مصدر القيمة وطبقاتها.
- **تعديل جماعي:** تطبيق قيمة على عدة أفراد دفعة واحدة مع معاينة.
- **عرض القيمة الفعالة** لأي فرد (يتكامل مع «العرض كـ»).
- **صحة الإعدادات:** تعارضات، تحكمات مقفلة، أجهزة بإذونات ناقصة، استثناءات قاربت الانتهاء.
- **اقتراحات:** توصيات تُعرض ولا تُطبَّق تلقائيًا على تحكمات الحماية.
- ما لا يملكه المستخدم يُعرض بحالته الصادقة أو يُخفى بحسب `read_permission`.

## 12. نموذج البيانات (PostgreSQL)
```
control_values(
  id, family_id, control_key, layer, target_type, target_id,
  value jsonb, locked bool, locked_by, expires_at, source,
  created_by, created_at, version int,
  UNIQUE(family_id, control_key, layer, target_type, target_id, context_key)
)
permission_grants(id, family_id, grantee_member_id, role_id, permission_key,
  scope jsonb, constraints jsonb, granted_by, granted_at, revoked_at)
roles(id, family_id, title, is_owner_role bool, created_by)
approval_requests(...حقول 6.3...)
control_templates(...)  template_applications(...)
conditional_rules(...)  rule_firings(id, rule_id, fired_at, outcome)
audit_log(...حقول 10.1...)  -- جدول مقسّم بالتاريخ، إضافة فقط
device_capability_reports(device_id, member_id, report jsonb, reported_at)
```
- `control_registry` و`permission_registry` **معرّفان في الشيفرة** (ملفات مخطط)، ويُزرعان ويُتحقق منهما في CI، ولا يُحرَّران من الواجهة.
- كل جدول يحمل `family_id` وعزلًا متعدد المستأجرين (Row-Level Security أو فلترة إلزامية في طبقة الوصول).
- التخزين المؤقت للقيمة الفعالة في Redis مع إبطال بالأحداث.

## 13. الواجهات (API Contracts)
الأساس: REST تحت `/v1` + أحداث WebSocket. المصادقة D-007. كل كتابة تدعم `Idempotency-Key` و`If-Match: <version>`.

| الطريق | الغرض |
|---|---|
| `GET /controls/effective?member_id=&service=` | القيم الفعالة مع المصدر والتوفر |
| `GET /controls/{key}/resolve?member_id=` | تفصيل الطبقات («لماذا؟») |
| `PUT /controls/{key}/values` | كتابة قيمة في طبقة (مع lock/expires اختياري) |
| `POST /controls/{key}/lock` / `DELETE` | قفل/فك قفل |
| `POST /controls/{key}/exceptions` | إنشاء استثناء مؤقت |
| `POST /templates/{id}/preview` / `/apply` | معاينة وتطبيق |
| `POST /approvals` / `POST /approvals/{id}/decide` / `GET /approvals` | الموافقات |
| `GET/POST/PATCH /rules`, `POST /rules/{id}/dry-run` | القواعد |
| `GET /audit` / `POST /audit/{id}/revert` | التدقيق والتراجع |
| `POST /view-as/sessions` | معاينة تجربة |
| `GET /permissions/me` / `POST /can` | الصلاحيات |

أحداث WebSocket: `control.updated`, `control.expired`, `approval.requested`, `approval.decided`, `rule.fired`, `device.capability_changed`.

رموز الأخطاء الموحدة: `PERMISSION_DENIED`, `LOCKED`, `PLAN_LIMIT`, `LEGAL_BOUND`, `VERSION_CONFLICT`, `UNAVAILABLE_ON_DEVICE`, `APPROVAL_REQUIRED`, `VALIDATION_FAILED`.

## 14. معايير القبول
1. كل تحكم مسجّل يحمل كل الحقول المطلوبة، وفشل ذلك يفشل CI.
2. تسجيل تحكم `protective` أو `critical` باستراتيجية غير تقييدية يُرفض.
3. حسم القيمة الفعالة يطابق جدول اختبارات يغطي كل استراتيجية دمج وكل طبقة، وتجاوز L1 مستحيل.
4. قفل في L2 يمنع كتابة L4 من المراهق ويعرض سبب القفل.
5. الاستثناء ينتهي تلقائيًا في موعده وتعود القيمة السابقة ويُسجَّل الحدث.
6. لا يمكن لمفوَّض منح صلاحية لا يملكها أو أوسع نطاقًا مما يملكه.
7. لا تُنفَّذ موافقة طلبها شخص على نفسه، ولا تنتهي صلاحيتها بموافقة ضمنية.
8. تطبيق قالب يعرض معاينة فرق، ويتجاوز الأقفال بإبلاغ صريح، ويمكن التراجع عنه دفعة واحدة.
9. القاعدة الشرطية لا تخفف تحكم حماية، ويوجد Dry Run قبل التفعيل.
10. أي تغيير ينتج `AuditEntry` غير قابل للتعديل، والتراجع يكتب تغييرًا جديدًا.
11. تحكم على جهاز لا يدعمه يعرض `unavailable_on_device` ولا يظهر كأنه فعّال.
12. فقد جهاز طفل لصلاحية مطلوبة ينبّه الأب خلال دقيقة من وصول التقرير.
13. مركز الإعدادات يولّد صفحات الخدمات من السجلات، وإضافة خدمة بسجلاتها تظهر دون تعديل شيفرة المركز.
14. ما يظهر لأي مستخدم يطابق نتيجة `can()` على الخادم تمامًا.
15. زمن حسم القيمة الفعالة من الذاكرة المؤقتة أقل من 50ms عند p95، وإبطال الذاكرة عند أي تغيير أقل من ثانيتين.
