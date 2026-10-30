---
id: S1-05
title: خطة التنفيذ وحزم العمل — المكافآت وسلاسل الإنجاز
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-05/03-data-model, S1-05/04-api-contracts, D-003, D-005, D-012]
last_updated: 2026-10-30
---
# S1-05: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-05 — rewards-children`  
> **حزم العمل:** موزعة على 4 معالم تنفيذ رئيسية تربط محرك المحفظة والتلعيب في الخادم (`services_backend/rewards_core/`) بحزمة واجهات متجر الأطفال في Flutter (`packages_dart/fos_rewards/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── rewards/
│               ├── controllers/
│               │   ├── rewards-catalog.controller.ts # إدارة متجر الجوائز
│               │   ├── redemptions.controller.ts    # إدارة طلبات الاستبدال
│               │   └── wallet.controller.ts         # استعلام المحفظة والسلسلة
│               ├── services/
│               │   ├── streak-calculator.service.ts # حساب وتحديث السلسلة اليومية
│               │   ├── points-ledger.service.ts     # إدارة المعاملات النقطية ودفتر الأستاذ
│               │   └── points-cap-guard.service.ts  # فرض السقف اليومي للنقاط
│               └── repositories/
│                   └── child-wallet.repository.ts
│
└── apps/mobile/
    └── packages/
        └── fos_rewards/
            ├── lib/
            │   ├── src/
            │   │   ├── bloc/
            │   │   │   ├── rewards_store_bloc.dart   # إدارة متجر الطفل والطلب
            │   │   │   └── parent_approvals_bloc.dart # إدارة موافقات الوالدين
            │   │   ├── widgets/
            │   │   │   ├── fos_reward_card.dart      # بطاقة الجائزة المبهجة
            │   │   │   ├── fos_stars_counter.dart    # عداد النجوم الذهبية التفاعلي
            │   │   │   └── fos_confetti_overlay.dart # مؤثرات الاحتفال والقصاصات
            │   │   ├── repositories/
            │   │   │   └── rewards_drift_repo.dart   # كاش المتجر والمحفظة محلياً
            │   │   └── views/
            │   │       ├── child_rewards_store_screen.dart
            │   │       ├── parent_rewards_manager_view.dart
            │   │       └── streak_celebration_dialog.dart
            └── test/
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: دفتر أستاذ النقاط ومحرك السلاسل في الخادم
- إنشاء جداول `rewards.*` وتطبيق المعاملات المالية الآمنة (`ACID Transactions`).
- برمجة خدمة `StreakCalculatorService` لحساب الاستمرارية اليومية ومنح المكافآت التلقائية عند إتمام الأسبوع.
- ربط الاستماع لأحداث إنجاز المهام `tasks.completed` من S1-06 لإيداع النقاط تلقائياً.

### المعلم M2: الكاش المحلي وإدارة المحفظة في Flutter
- بناء جداول Drift المحلية لرصيد النجوم وسلاسل الإنجاز.
- تطبيق مبدأ عدم انقطاع المتجر دون اتصال (تصفح الجوائز وتقديم الطلب وحفظه في الـ Outbox).

### المعلم M3: واجهة متجر المكافآت المبهجة للأطفال (UI)
- تصميم وبرمجة شاشة متجر الجوائز `SCR-S1-05-01` للأطفال بمكونات `FosRewardCard`.
- بناء عداد النجوم المتألق `FosStarsCounter` مع مؤثرات صوتية ولمسية عند كسب النقاط.
- بناء نافذة الاحتفال بالترقية `SCR-S1-05-03` باستخدام حزمة `confetti` واهتزازات Haptic.

### المعلم M4: لوحة إدارة الوالدين والربط مع مركز القيادة S1-09
- تطوير شاشة الوالدين لإدارة الجوائز واعتماد الطلبات `SCR-S1-05-02`.
- بث طلبات الصرف لمركز القيادة لتظهر في بطاقة «يتطلب انتباهك» واعتمادها بنقرة واحدة.
