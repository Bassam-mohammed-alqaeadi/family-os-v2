---
id: S1-09
title: خطة التنفيذ وحزم العمل — مركز القيادة والإعدادات
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-09/03-data-model, S1-09/04-api-contracts, D-003, D-005, D-017]
last_updated: 2026-10-30
---
# S1-09: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-09 — command-center-and-settings`  
> **حزم العمل:** موزعة على 4 معالم تنفيذ رئيسية تربط خادم التجميع السريع (`services_backend/command_center/`) بحزم واجهات Flutter (`packages_dart/fos_dashboard/` و `packages_dart/fos_settings/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── command_center/
│               ├── controllers/
│               │   ├── dashboard.controller.ts     # نقاط نهاية الملخص التجميعي
│               │   └── settings-hub.controller.ts  # شجرة الإعدادات الموحدة
│               ├── services/
│               │   ├── summary-aggregator.service.ts # تجميع بيانات الأنظمة من Redis
│               │   ├── needs-attention.service.ts   # إدارة طابور الطلبات المعلقة
│               │   └── widget-registry.service.ts   # إدارة المانيفست المعتمد
│               └── repositories/
│                   └── widget-preferences.repository.ts
│
└── apps/mobile/
    └── packages/
        ├── fos_dashboard/
        │   ├── lib/
        │   │   ├── bloc/
        │   │   │   ├── dashboard_bloc.dart         # إدارة تحديثات مركز القيادة
        │   │   │   └── attention_queue_bloc.dart   # إدارة الطلبات المعلقة
        │   │   ├── widgets/
        │   │   │   ├── needs_attention_card.dart
        │   │   │   ├── quick_actions_strip.dart
        │   │   │   └── base_dashboard_widget.dart  # واجهة مجردة لويدجات الخدمات
        │   │   └── views/
        │   │       ├── command_center_view.dart
        │   │       └── widget_customizer_view.dart
        └── fos_settings/
            ├── lib/
            │   ├── views/
            │   │   ├── unified_settings_hub_screen.dart
            │   │   └── service_settings_wrapper.dart
            │   └── widgets/
            │       └── settings_search_bar.dart
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: خدمة تجميع الملخصات السريعة في الخادم (Aggregator Service)
- برمجة خدمة `SummaryAggregatorService` التي تستعلم من كاش Redis الموزع وتبني الـ JSON التجميعي لمركز القيادة.
- تطبيق نمط الاستماع لأحداث Outbox للأنظمة التابعة (`S1-05`, `S1-06`, `S1-07`) لإبطال الكاش فورياً.
- إعداد مسار WebSocket لبث تحديثات طابور «يتطلب انتباهك».

### المعلم M2: واجهة مركز القيادة والويدجات الديناميكية في Flutter
- بناء شاشة `SCR-S1-09-01` باستخدام شبكة متجاوبة تدعم العرض على الهواتف والأجهزة اللوحية.
- بناء المكوّن الأساسي `BaseDashboardWidget`: واجهة مجردة تمكّن أي نظام لاحق من حقن بطاقته بمرونة متناهية دون تعديل كود مركز القيادة.
- تطبيق كاش Drift المحلي للتحميل الفوري المتفائل في أقل من **150ms**.

### المعلم M3: لوحة التخصيص وإعادة الترتيب بالسحب والإفلات
- برمجة شاشة `SCR-S1-09-03` باستخدام `ReorderableListView` في Flutter مع اهتزاز لمسي خفيف عند تحريك كل بطاقة.
- حفظ التفضيلات محلياً ومزامنتها مع الخادم عبر `PUT /preferences`.

### المعلم M4: شجرة مركز الإعدادات الموحد والتكامل مع ControlRegistry
- بناء شاشة `SCR-S1-09-02` التي تقرأ المانيفست المركزي وتصنف الإعدادات في أقسامها الثلاثة.
- دمج محرك البحث المحلي السريع لتصفية الإعدادات بالكلمات المفتاحية.
- حماية الأقسام الحساسة بطلب نافذة `Father PIN`.
