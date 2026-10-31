---
id: S1-02-SCR-03
title: مواصفات الشاشة — إنشاء وتخصيص حساب الطفل (Child Profile Creation)
phase: 1
system: S1-02
screen_id: SCR-S1-02-03
status: drafted
depends_on: [S1-02/02-screens-index, spec/02-design-system/components, D-006]
last_updated: 2026-10-30
---
# SCR-S1-02-03: مواصفات إنشاء وتخصيص حساب الطفل (Child Profile Creation)

> **النظام:** `S1-02 — identity-and-onboarding`  
> **معرف الشاشة:** `SCR-S1-02-03`  
> **نوع العرض:** شاشة تخصيص تفاعلية مبهجة (`Interactive Persona Builder`)  
> **مرجع التصميم:** `spec/02-design-system/child-mode-ui.md`, `spec/02-design-system/components.md` (`FosAvatar`, `FosChip`)  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/familywall/05_data_models_and_schemas/api_dto_models.ts]` (إعداد KidAccountSetupDTO).

---

## 1. عناصر الواجهة والتخصيص (UI Components)

### أ) الاسم المستعار وسنة الميلاد
- **حقل الاسم:** «اسم البطل / البطلة» (مثال: عمر، سارة).
- **قائمة اختيار سنة الميلاد:** لتحديد الفئة العمرية وقالب العرض المعماري تلقائياً (D-038):
  - دون 7 سنوات (3–6 سنوات) ← دور طفل `child` بقالب مصغر `minimal`.
  - 7 إلى 12 سنة ← دور طفل `child` بقالب قياسي `standard`.
  - 13 إلى 17 سنة ← دور مراهق `teen` بتجربة المراهق الناضجة.

### ب) محدد الشخصية الرمزية واللون المفضل (`Avatar & Color Picker`)
- شبكة أفقية من الأفاتار الكرتونية المبهجة (أبطال، حيوانات أليفة، صقور، فضاء) مصممة بأسلوب عصري محبب للأطفال.
- دائرة اختيار اللون الرمزي الخاص بالطفل لتلوين مهامه في التقويم وشاراته في الدردشة.

### ج) أزرار المتابعة والاقتران
- زر بارز: «حفظ ومسح كود الربط بجهاز الطفل 📱» (يفتح شاشة `SCR-S1-02-04`).
- زر ثانوي: «حفظ وتعيين الجهاز لاحقاً» (في حال كان الجهاز غير متوفر الآن).
