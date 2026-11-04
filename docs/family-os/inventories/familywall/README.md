# ملف إرشادات وتوثيق جرد تطبيق FamilyWall — عائلتي (Family OS)

> **معرّف التطبيق:** `familywall`
> **الحزمة المفحوصة:** `com.familywall` (v2026.10.1)
> **البنية المعمارية:** Typed Domain SDK (`com.jeronimo.fiz`) + طبقة واجهات (`com.familywall.app`) + كاش WriteBack مزدوج (ContentProvider + Room)
> **المرحلة:** سلسلة التوثيق العميق للخطة الموحدة #3 (Unified-Plan deep-doc series #3)
> **حالة الاعتماد:** مكتمل ومحقق — الجرد المعماري الأغنى بين التطبيقات الثمانية 🎯

> **فخر هذا الجرد:** FamilyWall هو **أنظف** التطبيقات الثمانية معمارياً (تشويش شبه معدوم، أسماء حقيقية).
> هذا الجرد يوثق لأول مرة في البرنامج: (1) **SDK نطاق مكتوب بالكامل** (27 نطاقاً، `MetaId` بهوية موحدة ~90 نوعاً)،
> (2) **نموذج صلاحيات مزدوج** — `FWPermission` (صلاحيات نظام UX) و`FamilyAdminRightEnum`/`IAdminApi` (صلاحيات دوائر خادمية)،
> (3) **محرك WriteBack كامل** للكتابة الراجعة offline-first (4 جداول + طابور + تبعيات).

---

## 1. الفهرس والوثائق الهندسية المعتمدة في مجلد التحليل (`analysis/`)

- **وثيقة الاستكشاف الوظيفي وتحليل الفجوات:** [`analysis/COVERAGE-AND-GAPS.md`](./analysis/COVERAGE-AND-GAPS.md)
  - تغطية ~46 وظيفة تفصيلية موزعة عبر 12 مجالاً وظيفياً:
    - **مؤكدة بالكود (Confirmed — Level A):** SDK النطاق، MetaId، FWPermission/PermissionManager، WriteBack، RecurrencyDescriptor، الدعوات، AI import، FCM invalidation.
    - **مشتقة (Derived — Level B):** سياسة التعارض (آخر كاتب يفوز)، غياب ذكاء على الجهاز.
    - **جزئية (Partial):** `ISyncBean` (مُعرَّف بلا مستهلك مرصود)، DailyBriefing (نشاط بلا منطق مقروء).
    - **غير موجودة (Not Found):** منطق geotracking/geofencing الدقيق في jadx.
- **تقرير التشريح البنيوي والمكونات (T1):** [`analysis/T1-STRUCTURAL-REPORT.md`](./analysis/T1-STRUCTURAL-REPORT.md)
  - تشريح الـ Manifest (186 نشاطاً، 30 خدمة، 26 مستقبلاً، 43 صلاحية)؛ حصر 27 نطاق SDK؛ طبقات التخزين الثلاث.
- **خريطة الموارد المعمارية (T2):** [`analysis/T2-RESOURCE-MAP.md`](./analysis/T2-RESOURCE-MAP.md)
  - توثيق 20 مورداً معمارياً ووظيفياً من `FW-RES-000001` إلى `FW-RES-000020` + 14 علاقة بينية (`REL-000400` إلى `REL-000413`).
- **التحليلات الهندسية المعمقة (T3):** [`analysis/T3-ENGINEERING-DEEP-DIVES.md`](./analysis/T3-ENGINEERING-DEEP-DIVES.md)
  - المسار A: تشريح `MetaId`/`MetaIdTypeEnum` ونظام الترميز `@Encodable`.
  - المسار B: محرك `FWPermission` + `PermissionManager` سطراً بسطر (من smali) + نموذج الحقوق الخادمي.
  - المسار C: محرك WriteBack (الجداول الأربعة + `jobsdepends` + آلة الحالة) و`CacheObjectType` (~50 نوعاً).

---

## 2. السجلات المصدرية الآلية (JSON Records)

- [`sources.json`](./sources.json): 108,691 مصدراً فيزيائياً ممسوحاً (شجرة `rework/familywall/` كاملة).
- [`resources.json`](./resources.json): 20 مورداً معمارياً ووظيفياً مصنفاً.
- [`evidence.json`](./evidence.json): أدلة مادية مدققة بأرقام الأسطر المادية حيث عُرفت.
- [`relationships.json`](./relationships.json): 14 علاقة بينية داخلية (`REL-000400` إلى `REL-000413`).
- [`report.json`](./report.json): تقرير التطبيق الإحصائي المعتمد `REP-FW-001`.

---

## 3. ملخص بوابات الجودة وحدود الإثبات

1. **طوبولوجيا أحادية التطبيق** بثلاث طبقات: SDK النطاق (`com.jeronimo.fiz`) ← الواجهات (`com.familywall.app`) ← الكاش/المزود (`backend`/`provider`).
2. **الصلاحيات نسختان متمايزتان:** UX نظام (`FWPermission`) وحقوق دوائر خادمية (`FamilyAdminRightEnum`) — لا خلط بينهما في أي وثيقة.
3. **حدود الإثبات الملزمة:** `ISyncBean` مُعرَّف بلا مستهلك عميل مرصود (Level C)؛ منطق التتبع الدقيق غائب من jadx؛ versionName لم يُلتقط.
4. **الأمانة العلمية:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود) أو `[INFERENCE]` (مستنتجة)؛ العدّادات الفعلية (82,641 smali / 14,470 java / 108,691 ملف) مقاسة لا مخمّنة.

> **ملاحظة:** ملف `sources.json` (62M) يبقى محلياً لتعذر دفعه عبر حد GitHub API (4MB) — قابل لإعادة التوليد حتمياً من الأشجار المحلية عند الحاجة.
