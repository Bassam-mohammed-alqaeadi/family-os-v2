---
id: S1-03
title: خطة التنفيذ وحزم العمل — الأدوار والصلاحيات
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-03/03-data-model, S1-03/04-api-contracts, D-003, D-005]
last_updated: 2026-10-30
---
# S1-03: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-03 — family-roles-and-permissions`  
> **حزم العمل:** موزعة على 4 معالم هندسية رئيسية تربط محرك تفويض الخادم (`services_backend/permissions_engine/`) بحارس الصلاحيات المحلي في Flutter (`packages_dart/fos_permissions/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── permissions/
│               ├── controllers/
│               │   ├── permissions.controller.ts    # جلب وتحديث التفويضات
│               │   └── ownership.controller.ts      # نقل الملكية المشدد
│               ├── services/
│               │   ├── permission-evaluator.service.ts # محرك حساب الصلاحية الفعالة
│               │   ├── audit-logger.service.ts      # توثيق سجل التغييرات غير القابل للتعديل
│               │   └── optimistic-lock.service.ts   # إدارة تضارب الوالدين
│               ├── guards/
│               │   ├── family-role.guard.ts         # NestJS Guard لفحص رتبة الـ JWT
│               │   └── permission.guard.ts          # Decorator @RequirePermission(...)
│               └── repositories/
│                   └── permission-grants.repository.ts
│
└── apps/mobile/
    └── packages/
        └── fos_permissions/
            ├── lib/
            │   ├── src/
            │   │   ├── bloc/
            │   │   │   ├── permissions_bloc.dart    # إدارة حالة وتحديث الصلاحيات
            │   │   │   └── ownership_bloc.dart      # إدارة تدفق نقل الملكية
            │   │   ├── guards/
            │   │   │   └── fos_permission_guard.dart # مكوّن واجهة يحجب الأزرار غير المصرحة
            │   │   ├── repositories/
            │   │   │   └── permissions_drift_repo.dart # الكاش المحلي في SQLite
            │   │   └── views/
            │   │       ├── roles_overview_screen.dart
            │   │       ├── member_permission_editor.dart
            │   │       ├── ownership_transfer_view.dart
            │   │       └── audit_trail_timeline_view.dart
            └── test/
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: محرك الصلاحيات في الخادم وقواعد RLS
- إنشاء جداول `permissions.*` وتثبيت الصلاحيات الافتراضية في `permissions.catalog`.
- برمجة فلاتر حراسة الخادم (`PermissionGuard`) لدعم استخدام الديكوريتور على مستوى مسارات الـ API:
  `@RequirePermission('tasks.approve_completion')`.
- ربط أحداث الإبطال والتحديث بـ Transactional Outbox.

### المعلم M2: الكاش المحلي وحارس الصلاحيات في Flutter
- بناء حارس الواجهة `FosPermissionGuard`: مكوّن Flutter ذكي يلف الأزرار والبطاقات (`Widget wrapper`) ويقوم بإخفائها أو تعطيلها في زمن استجابة صفر ميلي ثانية اعتماداً على كاش Drift المحلي.
- معالجة رسائل WebSocket لتحديث الصلاحيات دون تجميد واجهة المستخدم أو الحاجة لإعادة التشغيل.

### المعلم M3: واجهات شجرة العائلة ومحرر الصلاحيات (D-015)
- بناء شاشة شجرة العائلة `SCR-S1-03-01` باستخدام بطاقات `FosMemberCard` وشارات الألوان.
- تطوير محرر الصلاحيات المزدوج (الوضع السريع بالقوالب والوضع المتقدم بالمفاتيح الفردية).
- دمج نافذة تأكيد رمز `Father PIN` عند تعديل الصلاحيات الحساسة.

### المعلم M4: تدفق نقل الملكية وسجل الشفافية
- تطوير واجهة التحقق الثنائي المزدوج (PIN + OTP) لنقل ملكية العائلة.
- بناء شاشة سجل التدقيق الزمني الشفاف للأعضاء البالغين وتنسيق الأحداث زمنياً.
