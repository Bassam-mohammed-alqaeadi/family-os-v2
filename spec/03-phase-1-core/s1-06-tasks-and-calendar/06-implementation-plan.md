---
id: S1-06
title: خطة التنفيذ وحزم العمل — المهام والتقويم المشترك
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-06/03-data-model, S1-06/04-api-contracts, D-003, D-005, D-012]
last_updated: 2026-10-30
---
# S1-06: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-06 — tasks-and-calendar`  
> **حزم العمل:** موزعة على 4 معالم تنفيذ رئيسية تربط محرك التقويم والمهام في الخادم (`services_backend/calendar_tasks/`) بحزمة واجهات Flutter (`packages_dart/fos_calendar/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── calendar_tasks/
│               ├── controllers/
│               │   ├── calendar.controller.ts      # إدارة أحداث التقويم
│               │   └── tasks.controller.ts         # إدارة المهام والاعتمادات
│               ├── services/
│               │   ├── rrule-engine.service.ts     # حساب التكرار المطابق لـ RFC 5545
│               │   ├── hijri-converter.service.ts  # محول التقويم الهجري والميلادي
│               │   └── task-approval.service.ts    # ربط إيداع النقاط بـ S1-05
│               └── repositories/
│                   ├── events.repository.ts
│                   └── tasks.repository.ts
│
└── apps/mobile/
    └── packages/
        └── fos_calendar/
            ├── lib/
            │   ├── src/
            │   │   ├── bloc/
            │   │   │   ├── calendar_bloc.dart      # إدارة شبكة وعرض التقويم
            │   │   │   └── tasks_board_bloc.dart   # إدارة بطاقات وقوائم المهام
            │   │   ├── widgets/
            │   │   │   ├── fos_calendar_grid.dart  # شبكة التقويم المتجاوبة
            │   │   │   ├── fos_task_card.dart      # بطاقة المهمة الملونة
            │   │   │   └── hijri_header_strip.dart # شريط التاريخ الهجري المتزامن
            │   │   ├── repositories/
            │   │   │   └── calendar_drift_repo.dart # كاش المهام والمواعيد محلياً
            │   │   └── views/
            │   │       ├── family_calendar_screen.dart
            │   │       ├── tasks_board_screen.dart
            │   │       └── task_editor_dialog.dart
            └── test/
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: محرك RFC 5545 ومحول التاريخ الهجري في الخادم
- إنشاء جداول `calendar_tasks.*` وبرمجة محرك الـ RRULE لحساب التكرار الأسبوعي والمدرسي.
- دمج محول التاريخ الهجري `UmmAlQuraCalendar` وتخزين التواريخ الهجرية المتزامنة.
- ربط حدث `tasks.completed` ببوابة Outbox لتحفيز إيداع نقاط S1-05.

### المعلم M2: الكاش المحلي والعمل دون اتصال في Drift
- بناء جداول `LocalTasksTable` و `LocalEventsTable` لتخزين جدول الأسرة محلياً.
- معالجة إنشاء المهام وتسليمها دون اتصال وربطها بالـ Outbox.

### المعلم M3: واجهة التقويم العائلي المزدوج (UI)
- رندرة شبكة التقويم الشهري والأسبوعي `SCR-S1-06-01` مع تلوين أشرطة المواعيد بألوان الأعضاء.
- دعم التنقل السلس بين الشهور وتصفية المواعيد حسب أفراد الأسرة.

### المعلم M4: لوحة مهام الأسرة واعتماد الوالد
- بناء شاشة لوحة المهام `SCR-S1-06-02` مع شارات النقاط الذهبية (+⭐️).
- ربط تسليم الطفل للمهمة بإشعار مركز القيادة S1-09 واعتمادها بنقرة واحدة.
