---
id: S1-07
title: خطة التنفيذ وحزم العمل — الموقع وزر الاستغاثة
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-07/03-data-model, S1-07/04-api-contracts, D-003, D-005, D-025]
last_updated: 2026-10-30
---
# S1-07: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-07 — location-basic`  
> **حزم العمل:** موزعة على 4 معالم تنفيذ رئيسية تربط محرك الموقع الجغرافي بالخادم (`services_backend/location_core/`) بحزمة واجهات الخرائط في Flutter (`packages_dart/fos_location/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── location/
│               ├── controllers/
│               │   ├── location.controller.ts      # استقبال إحداثيات الأجهزة
│               │   └── sos.controller.ts           # إدارة وتصعيد إنذارات SOS
│               ├── services/
│               │   ├── kalman-filter.service.ts    # خوارزمية تنعيم المسار
│               │   ├── emergency-escalation.service.ts # مسار التصعيد وتنبيه FCM
│               │   └── sms-gateway.service.ts      # إرسال SMS الطوارئ البديل
│               └── repositories/
│                   └── location.repository.ts
│
└── apps/mobile/
    └── packages/
        └── fos_location/
            ├── lib/
            │   ├── src/
            │   │   ├── bloc/
            │   │   │   ├── family_map_bloc.dart    # إدارة حالة الخريطة والدبابيس
            │   │   │   └── sos_bloc.dart           # إدارة إنذار الطوارئ والعداد
            │   │   ├── services/
            │   │   │   ├── background_locator.dart # خدمة الموقع في الخلفية
            │   │   │   └── battery_optimizer.dart  # محرك توفير البطارية التكيفي
            │   │   ├── widgets/
            │   │   │   ├── fos_map_canvas.dart     # ويدجت الخريطة المتجهية
            │   │   │   ├── fos_member_marker.dart  # دبوس العضو الذكي وشارة البطارية
            │   │   │   └── fos_sos_button.dart     # زر SOS مع الاهتزاز والعداد
            │   │   └── views/
            │   │       ├── family_map_screen.dart
            │   │       ├── sos_active_dialog.dart
            │   │       └── emergency_contacts_view.dart
            └── test/
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: خدمة الموقع وتصعيد SOS في الخادم
- إعداد جداول PostGIS `location.current_locations` و `location.sos_incidents`.
- تطبيق مرشح كالمان (`Kalman Filter`) في الخادم لمعالجة الإحداثيات المستلمة وتحديث ذاكرة Redis في <20ms.
- إعداد مسار إنذار الطوارئ عالي الأولوية عبر FCM مع إشارة الصوت الحرج (`Critical Sound Bypass`).

### المعلم M2: خدمة التتبع التكيفية في خلفية Flutter
- بناء خدمة `BackgroundLocator` المتوافقة مع قيود أندرويد 14+ و iOS Background Modes.
- دمج `BatteryOptimizer`: خفض وتيرة الـ GPS عند سكون الهاتف لأكثر من 5 دقائق لتوفير 60% من استهلاك البطارية.
- حفظ الإحداثيات محلياً في Drift عند انقطاع الشبكة وإرسالها لاحقاً عبر الـ Outbox.

### المعلم M3: واجهة الخريطة العائلية التفاعلية والدبابيس (UI)
- رندرة الخريطة المتجهية السلسة بـ 60 FPS باستخدام مكتبة `flutter_map` مع بلاطات متجهة محلية وسريعة.
- بناء دبوس العضو الذكي `FosMemberMarker` لعرض الصورة الرمزية، إطار اللون، وشارة شحن البطارية.
- ربط الخريطة بـ WebSocket لتحريك دبابيس الأعضاء بسلاسة فورية عند تنقلهم في الواقع.

### المعلم M4: زر الاستغاثة SOS ومسار SMS البديل في اليمن
- بناء زر الاستغاثة العائم `FosSosButton` بالضغط المستمر 3 ثوانٍ والاهتزاز التصاعدي.
- بناء شاشة الطوارئ النشطة `SCR-S1-07-02` مع مسار التصعيد وتأكيد الأمان بـ PIN.
- دمج مسار إرسال إحداثيات الاستغاثة عبر SMS في حال تعذر الاتصال بالإنترنت (D-031).
