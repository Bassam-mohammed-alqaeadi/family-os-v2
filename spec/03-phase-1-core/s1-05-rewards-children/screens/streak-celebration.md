---
id: S1-05-SCR-03
title: مواصفات الشاشة — نافذة الاحتفال بسلاسل الإنجاز والترقية (Streak Milestone Celebration)
phase: 1
system: S1-05
screen_id: SCR-S1-05-03
status: drafted
depends_on: [S1-05/02-screens-index, spec/02-design-system/components, spec/02-design-system/motion-and-feedback]
last_updated: 2026-10-30
---
# SCR-S1-05-03: مواصفات نافذة الاحتفال بسلاسل الإنجاز والترقية (Celebration Dialog)

> **النظام:** `S1-05 — rewards-children`  
> **معرف الشاشة:** `SCR-S1-05-03`  
> **نوع العرض:** نافذة حوارية احتفالية معتمة (`Celebration Modal Dialog`)  
> **مرجع التصميم:** `spec/02-design-system/components.md` (`FosRewardCelebration`, `FosBadge`, `FosButton`), `spec/02-design-system/motion-and-feedback.md`  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/quizlet/]` (محركات الاحتفال بالـ Streaks والقصاصات المتطايرة).

---

## 1. عناصر الشاشة والمؤثرات البصرية (Visual & Motion FX)

### أ) المؤثرات البصرية الحركية (Confetti Animation)
- فور انبثاق الشاشة: تتطاير قصاصات رقمية ملونة بألوان الشعار المعتمدة (كحلي، أخضر، برتقالي، وذهبي) لمدة 3 ثوانٍ كاملة في 60 FPS.
- اهتزاز لمسي نغمي احتفالي ثلاثي النبضات (`Triple Success Pulse`).

### ب) شارة الإنجاز المتوهجة (Milestone Trophy Badge)
- أيقونة الكأس الذهبي أو الشعلة النارية ثلاثية الأبعاد تنبثق بحركة تكبير مرنة (`Elastic Scale Animation`).
- العنوان العريض: «مبارك يا بطل! أتممت 7 أيام متتالية من الإنجاز! 🏆🔥».
- رصيد الجائزة الإضافي: «+20 نقطة ذهبية هدية الإنجاز الأسبوعي».

### ج) أزرار المتابعة
- زر عريض مبهج: «رائع، تابع إنجازاتك يا بطل! 🚀».
- إمكانية مشاركة بطاقة الإنجاز في مجلس العائلة العام بنقرة واحدة لتهنئة الأبناء.
