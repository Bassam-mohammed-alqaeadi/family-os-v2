# ملف إرشادات وتوثيق جرد تطبيق Qustodio — عائلتي (Family OS)

> **معرّف التطبيق:** `qustodio`
> **الحزمة المفحوصة:** `com.qustodio.family.parental.control.app.screentime`
> **البنية المعمارية:** تطبيق الوالدين المستقل (Parent App Stand Alone - PASA)
> **المرحلة:** BIP-05 — Post-Commit Quality Audit & Acceleration Protocol
> **حالة الاعتماد:** مكتمل ومحقق ومطابق للسجلات 100%

---

## 1. الفهرس والوثائق الهندسية المعتمدة في مجلد التحليل (`analysis/`)

تستقر كافة وثائق التحليل الهندسي المعمق في مجلد [`analysis/`](./analysis/) وفق المعيار المعماري الموحد لبرنامج BIP:

- **وثيقة الاستكشاف الوظيفي وتحليل الفجوات:** [`analysis/COVERAGE-AND-GAPS.md`](./analysis/COVERAGE-AND-GAPS.md)
  - تغطية 82 دالة تفصيلية موزعة عبر 15 مجالاً وظيفياً:
    - **43 دالة مؤكدة قطيعاً بالكود (Confirmed — Level A):** وظائف تطبيق الوالد المباشرة والمصادقة والإعدادات المحلية.
    - **24 دالة مشتقة من بيانات الخادم والواجهة (Derived — Level B):** الجداول الزمنية والتحليلات والخوارزميات المحلية.
    - **15 دالة جزئية التنفيذ على الجهاز (Partial — Level B/C):** أوامر القفل والحظر التي يرسلها الوالد وتتطلب وكيل الطفل.
    - **0 دالة غير موجودة (Not Found):** 0 ثغرات من أصل 82 قدرة مرصودة.
- **تقرير التشريح البنيوي والمكونات (T1):** [`analysis/T1-STRUCTURAL-REPORT.md`](./analysis/T1-STRUCTURAL-REPORT.md)
  - تشريح 34 إذناً، 17 نشاطاً، 13 خدمة، 9 مستقبلات، و4 موفرات محتوى.
  - حصر 96 مجموعة Endpoints و 130 استدعاء HTTP لتمثيل 99 نقطة نهاية فريدة في `qapi.ts`.
  - حسم معمارية الجداول: "No Qustodio-owned relational business tables were identified in the examined SQL schema."
- **خريطة الموارد المعمارية (T2):** [`analysis/T2-RESOURCE-MAP.md`](./analysis/T2-RESOURCE-MAP.md)
  - توثيق 20 مورداً معمارياً ووظيفياً من `QU-RES-000001` إلى `QU-RES-000020`.
- **التحليلات الهندسية المعمقة (T3):** [`analysis/T3-ENGINEERING-DEEP-DIVES.md`](./analysis/T3-ENGINEERING-DEEP-DIVES.md)
  - التحليل المرحلي الصارم لأمر القفل الفوري (Instant Lock 6-Stage Evidence Lifecycle Trace).
  - خوارزمية الالتفاف الدائري وقيد الـ 1440 دقيقة لحصص الشاشة اليومية.
  - معمارية فلترة الويب وتصنيف المواقع وتكامل Linewize المدرسي.
- **تقرير تدقيق الجودة الختامي:** [`analysis/POST-COMMIT-QUALITY-AUDIT.md`](./analysis/POST-COMMIT-QUALITY-AUDIT.md)
  - التقرير الرسمي لتدقيق الجودة والتحقق المستقل للإغلاق المعتمد للمرحلة BIP-05.

---

## 2. السجلات المصدرية الآلية (JSON Records)

- [`sources.json`](./sources.json): 16,643 مصدراً فيزيائياً ممسوحاً بحجم 122,179,310 بايت.
- [`resources.json`](./resources.json): 20 مورداً معمارياً ووظيفياً مصنفاً.
- [`evidence.json`](./evidence.json): 20 دليلاً مادياً مدققاً بأرقام الأسطر المادية.
- [`relationships.json`](./relationships.json): 15 علاقة بينية داخلية معزولة (`REL-000033` إلى `REL-000047`).
- [`report.json`](./report.json): تقرير التطبيق الإحصائي المعتمد `REP-QU-001`.

---

## 3. ملخص بوابات الجودة وحدود الإثبات

1. **طوبولوجيا التطبيق الأحادية:** الحزمة المفحوصة هي تطبيق الوالدين (PASA) حصراً، ولا تحتوي على خدمات إنفاذ الحظر بنظام أندرويد (تطبيق الطفل Companion مستقل تماماً).
2. **قواعد البيانات:** 22 جدولاً في SQLite (15 لـ Firestore و 6 لـ DataTransport و 1 لـ Cordova NativeStorage)، ولا توجد جداول أعمال علائقية خاصة بـ Qustodio.
3. **أمر القفل الفوري:** مثبت حتى مرحلة الإرسال السحابي (Requested & Accepted)، ومراحله اللاحقة (Delivered & Applied) مصنفة كفجوة دليليّة غير مفحوصة لغياب كود الطفل والخادم.
