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
├── README.md                  # هذا الملف (دليل بنية البرنامج)
├── PROGRAM-STATUS.md          # جدول المتابعة الحي لمراحل وتطبيقات البرنامج
├── reference-registry.json    # سجل التطبيقات المرجعية التسعة ومساراتها وحالاتها
├── schemas/                   # مخططات JSON Schema الستة الصارمة
│   ├── source-record.schema.json
│   ├── resource-record.schema.json
│   ├── evidence-record.schema.json
│   ├── relationship-record.schema.json
│   ├── fusion-decision.schema.json
│   └── application-report.schema.json
├── templates/                 # قوالب السجلات والتقارير المعتمدة
│   ├── source-record.template.json
│   ├── resource-record.template.json
│   ├── evidence-record.template.json
│   ├── relationship-record.template.json
│   ├── fusion-decision.template.json
│   └── application-report.template.json
├── inventories/               # سجلات الجرد لكل تطبيق (تُملأ في BIP-02 فصاعداً)
├── synthesis/                 # سجلات التحليل المقارن والعلاقات الشاملة والصهر (BIP-07, BIP-08)
└── pilots/                    # العينات التجريبية لاختبار المنهجية (BIP-01: telegram pilot)
```

---

### 2. تدفق البيانات وسلسلة التتبع (Traceability Pipeline)

```
[ملف مادي في benchmarks/] ──(T0)──> [source-record] (مسار + SHA256)
                                        │
                                      (T1-T3)
                                        ↓
[دليل واقعي قابل للتتبع] ──(وسم)──> [evidence-record] (REF / PARTIAL)
                                        │
                                     (ربط)
                                        ↓
[مورد وظيفي أو معماري]  ──────────> [resource-record] (22 فئة تصنيفية)
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

### 3. أدوات التحقق الآلي

تخضع كافة السجلات في هذا المجلد للتحقق الآلي الصارم عبر أداة البرنامج:  
`python tools/benchmark-intelligence/validate-program.py`

تفحص الأداة:
- صحة JSON.
- مطابقة المخططات (Draft-7 JSON Schema).
- تفرد المعرفات عبر المستودع بالكامل.
- سلامة الروابط التكاملية (Referential Integrity).
- التحقق من وجود مسارات الملفات المشار إليها فعلياً على القرص.
- خلو السجلات من أي مصادر مجهولة المصير.
