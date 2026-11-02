# برنامج الجرد الشامل وصهر الموارد المرجعية (BIP)
## Benchmark Intelligence & Platform Fusion Repository

> **القرار التأسيسي:** D-039  
> **الوثيقة المرجعية الشاملة:** [benchmark-intelligence-program.md](../benchmark-intelligence-program.md)  
> **سجل المراجع:** [reference-registry.json](./reference-registry.json)  
> **جدول المتابعة الحي:** [PROGRAM-STATUS.md](./PROGRAM-STATUS.md)

---

### 1. بنية المجلد

```
spec/01-foundation/benchmark-intelligence/
├── README.md                      # هذا الملف (دليل بنية البرنامج)
├── PROGRAM-STATUS.md              # جدول المتابعة الحي لمراحل وتطبيقات البرنامج
├── reference-registry.json        # سجل التطبيقات المرجعية التسعة ومساراتها وحالاتها
├── schemas/                       # مخططات JSON Schema السبعة الصارمة (Draft-7)
│   ├── reference-registry.schema.json
│   ├── source-record.schema.json
│   ├── resource-record.schema.json
│   ├── evidence-record.schema.json
│   ├── relationship-record.schema.json
│   ├── fusion-decision.schema.json
│   └── application-report.schema.json
├── templates/                     # قوالب السجلات والتقارير المعتمدة
│   ├── source-record.template.json
│   ├── resource-record.template.json
│   ├── evidence-record.template.json
│   ├── relationship-record.template.json
│   ├── fusion-decision.template.json
│   └── application-report.template.json
├── inventories/                   # سجلات الجرد لكل تطبيق (BIP-02 إلى BIP-10)
├── synthesis/                     # سجلات التحليل المقارن وسجل الصهر وخريطة الخدمات (BIP-11 إلى BIP-13)
└── pilots/                        # العينات التجريبية لاختبار المنهجية (BIP-01: telegram pilot)
```

---

### 2. تدفق البيانات وسلسلة التتبع (Traceability Pipeline)

```
[ملف مادي في benchmarks/] ──(T0)──> [source-record] (مسار + SHA256 + Git Blob)
                                        │
                                      (T1-T3)
                                        ↓
[دليل واقعي قابل للتتبع] ──(وسم)──> [evidence-record] (REF / PARTIAL)
                                        │
                                     (ربط)
                                        ↓
[مورد وظيفي أو معماري]  ──────────> [resource-record] (22 فئة تصنيفية + تفويض قانوني)
                                        │
                                     (علاقة)
                                        ↓
[تكرار / تعارض / اعتمادية] ────────> [relationship-record] (intra / cross)
                                        │
                                     (صهر)
                                        ↓
[قرار صهر واعتماد المالك] ─────────> [fusion-decision] (ADOPT/ADAPT/COMPOSE...)
                                        │
                                     (تغذية)
                                        ↓
                      [أنظمة Family OS الـ44 (S1–S6)]
```

---

### 3. أدوات التحقق الآلي المستقلة

تخضع كافة السجلات في هذا البرنامج للتحقق الآلي الصارم عبر أدوات البرنامج في `tools/benchmark-intelligence/`:

1. **أداة الفحص المستقلة:**  
   `python tools/benchmark-intelligence/validate-program.py`
   - مطابقة مخططات Draft-7 السبعة.
   - تفرد المعرفات عبر المستودع.
   - التحقق من أحجام وبصمات القرص SHA-256.
   - التحقق من كائنات Git Blob وبصماتها وأحجامها للملفات المتتبعة (`git_tracked`).
   - توثيق طبقات التخزين وحماية مسارات التخطي (`..`).
   - فحص حدود مؤشرات السطور الفعلية في الملفات.
   - فحص حزم `AndroidManifest.xml` ومطابقتها للسجل.
   - التحقق من اتساق `app_id` بين الموارد ومصادرها وأدلتها.
   - إعادة الحساب الديناميكي لإحصاءات تقارير التطبيقات.

2. **جناح الاختبارات السلبية والتكاملية:**
   `python -B -m unittest tools/benchmark-intelligence/test_validator.py -v`
   - يضم حالياً 29 اختباراً سلبياً وتكاملياً ووظيفياً للتحقق من الأحجام والبصمات ومراجع الأدلة وعزل النطاقات ومرشحات التطبيقات، بما فيها اختبار نطاق FamilyWall والبادئة FW واختبار تصفية التطبيقات.
