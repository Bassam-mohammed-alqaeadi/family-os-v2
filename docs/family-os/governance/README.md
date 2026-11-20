# حوكمة Family OS — الفهرس

> الفرع الأساس: `feat/governance-v2` · بُني من الصفر بأمر المالك — الفرع السابق مرجع للقراءة فقط.
> القاعدة: لا يدخل هنا إلا الجاهز المحسوم (G-002).

## القطع

| القطعة | المسار | الحالة |
|---|---|---|
| الميثاق | `CHARTER.md` | ✅ معتمد |
| سجل القرارات الموحد | `decisions/DECISIONS-LOG.md` | ✅ معتمد (يُحدَّث مع كل حكم) |
| قائمة التصفية (48 بنداً) | `OPEN-DECISIONS.md` | ✅ لقطة مجمّدة 2026-11-04 — الحالة الحالية في `OPEN-QUESTIONS.md` وسجل القرارات |
| قواعد الوكلاء | `agent-rules/` | ✅ معتمد |
| المنهجية (ثقة/تتبع/VERIFIED) | `methodology/` | ✅ معتمد |
| القوالب | `templates/` | ✅ معتمد (4 قوالب) |
| نظام التصميم (15 ملف Markdown — بلا Dart) | `design-system/` | ✅ معتمد (15/15 ملفاً؛ المسرد المعتمد `ui-glossary.md` بموجب Q-382، والباليت مثبتة بموجب Q-383) |
| سجل الأصول (23,802 أصلاً من 11 تطبيقاً مفككاً) | `asset-index/` | ✅ مثبّت (فجوة التصميم الجديد محصورة في: رسم الإقلاع/الترحيب + مجموعة الأفاتارات) |
| بوابات الجودة | `QUALITY-GATES.md` | ✅ معتمد |
| ضبط التغيير | `CHANGE-CONTROL.md` | ✅ معتمد |
| سجل المخاطر | `RISK.md` | ✅ معتمد (14 مخاطرة) |
| نموذج التهديد (STRIDE) | `THREAT-MODEL.md` | ✅ معتمد (Q-345 — بوابة Q-241/D-12 مغلقة قبل اعتماد التصميم) |
| الأسئلة المفتوحة المُدارة | `OPEN-QUESTIONS.md` | ✅ حيّ (28 سؤالاً مفتوحاً و48 محسوماً، من 76) |
| طبقة معمارية المنصة | `architecture/` | ✅ معتمدة (خريطة مجالات DDD + وثيقة Arc42) |
| الخارطة الموحدة v2 + نطاق MVP | `ROADMAP.md` | ✅ وثيقة حية (Q-002 محسوم) |
| إعادة حسم المكدس | `architecture/ARCHITECTURE.md` | ✅ محسوم (Q-001: Kotlin/Ktor + PostgreSQL) |
| حدود وكيل الذكاء | `AI-BOUNDARIES.md` | ✅ معتمد (Q-003: استقلالية مرنة يحددها الأب) |
| عقد تحقق الذكاء | `AI-VERIFICATION-CONTRACT.md` | ✅ معتمد (2026-11-06 — مفاتيح الوكيل السبعة وبوابات الموافقة) |
| بروتوكول الحذف والتصدير | `DELETION-EXPORT-PROTOCOL.md` | ✅ معتمد (Q-166) |
| مواصفة وسيط MQTT | `architecture/MQTT-BROKER-SPEC.md` | ✅ معتمدة (Q-168) |
| مواصفات المراحل | `phases/` | ✅ المرحلة 1: 10/10 مواصفات معتمدة؛ مخططاتها معتمدة (Q-445)؛ تصميم الأنظمة العشرة مغلق في المواصفات (§9) وفي النموذج التفاعلي (Q-397 … Q-422)؛ لا كود تطبيق بعد |
| نظرة المرحلة 1 الموحدة ومخططها | `phases/phase-1/OVERVIEW.md` | ✅ معتمدة (D-2) — فيها الأرقام الحالية |
| التحسين البصري للنموذج | `phases/phase-1/VISUAL-REVIEW.md` | ✅ نُفّذ (Q-436 … Q-453 · Q-461)؛ الدفعة 3 سُحبت (Q-437) |
| مراجعات المخططات ووكيل التحقق (`MUSE-*.md`، `DIAGRAMS-COMPLETENESS-AUDIT.md`، `VERIFICATION-AGENT-REVIEW.md`) | `phases/phase-1/` | ✅ سجلات تاريخية (2026-11-19) — أُغلقت بـ Q-439 … Q-445 |
| المراجعة الناقدة الكاملة | `REVIEW-COMPLETE-AUDIT.md` | ✅ تاريخية مجمَّدة (Q-172) |
| الخطة العملية الليلية | `OVERNIGHT-WORKFLOW-PLAN.md` | ✅ تاريخية منتهية — ليست تفويضاً سارياً |
| نقد بنّاء: المرحلة 1 والمرحلة 2 | `REVIEW-PHASE-1-2-CRITIQUE.md` | ✅ تقييم Juno (ليس حكماً — الأحكام للمالك) |
| مراجعة هيكلية الفرع القديم ومقارنتها | `REVIEW-OLD-BRANCH-STRUCTURE.md` | ✅ معتمدة (Q-078: الفكرة فقط، المحتوى خاص بنا) |
| سجل تدقيق التناقضات (جولتا 2026-11-11 و2026-11-18 — GOV-001…048) | `REVIEW-CONTRADICTION-REGISTER.md` | ✅ سجل تاريخي (نُقل من `design-work/` — Q-406)؛ بنوده مغلقة في §8 منه (Q-466) |
| خطة التنفيذ للمرحلة 1 | `phases/phase-1/EXECUTION-PLAN.md` | ⏳ مقترحة — تنتظر اعتماد المالك (Q-464) |
| النموذج التفاعلي للمرحلة 1 (التصميم الأساس — Q-396) | `phases/phase-1/prototype/` | ✅ حيّ: S1-01 وS1-02 وS1-03 وS1-10 مغلقة فيه، وS1-09 (Q-407) وS1-07 (Q-408، ثم ست فجوات أُغلقت بـ Q-409) وS1-08 (Q-410، وأُغلقت فجواته بـ Q-413) مغلقة مع بنود محمولة، وS1-05 مغلق (Q-414)، وS1-06 مغلق (Q-415)، وS1-04 مغلق (Q-420 · Q-421) فاكتمل تصميم الأنظمة العشرة؛ وبنود معلّقة من الأنظمة السابقة حُسمت بـ Q-411 وQ-412؛ والهيكل نفسه لكل مرحلة (Q-406) |

## المراجع

- التوثيق العميق للمراجع: `docs/family-os/deep-dives/` (على `main`)
- الجرد الرسمي: `docs/family-os/inventories/` (على `main`)
- أحكام التناقضات: `docs/family-os/unified-plan/contradiction-resolutions.md`
## أبحاث الفئة (ب) — `research/`

فهرس ملفات البحث في `research/` — نتائجها مستخدمة في القرارات والمواصفات (Q-015…Q-031):

- `research/RESEARCH-hosting.md` — الاستضافة (Q-019 / G-005)
- `research/RESEARCH-Q015-legal-advisor.md` — المستشار القانوني (Q-015)
- `research/RESEARCH-Q020-maps.md` — مزود الخرائط (Q-020)
- `research/RESEARCH-Q021-otp-channels.md` — قنوات OTP (Q-021)
- `research/RESEARCH-Q022-non-gms-share.md` — أجهزة بلا GMS (Q-022)
- `research/RESEARCH-Q023-arabic-server-classification.md` — التصنيف العربي (Q-023؛ موضع الفرز على الخادم — Q-165)
- `research/RESEARCH-Q024-arabic-eval-datasets.md` — بيانات التقييم العربية (Q-024)
- `research/RESEARCH-Q025-payments.md` — بوابات الدفع (Q-025)
- `research/RESEARCH-Q026-store-policy.md` — سياسة المتاجر (Q-026)
- `research/RESEARCH-Q027-device-lab.md` — مختبر الأجهزة (Q-027)
- `research/RESEARCH-Q028-trademark.md` — العلامة التجارية (Q-028)
- `research/RESEARCH-Q029-custody-policy.md` — سياسات الوصاية (Q-029)
- `research/RESEARCH-Q030-review-board.md` — مجلس المراجعة (Q-030)
- `research/RESEARCH-Q031-provisioning.md` — تجهيز جهاز الطفل (Q-031)
- `research/RESEARCH-S1-04-billing-subscriptions.md` — الفوترة والاشتراكات (S1-04)
- `research/RESEARCH-S1-06-tasks-calendar.md` — المهام والتقويم (S1-06)
