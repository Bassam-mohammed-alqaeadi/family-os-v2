---
id: S1-08
title: خطة التنفيذ وحزم العمل — الدردشة العائلية
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-08/03-data-model, S1-08/04-api-contracts, D-003, D-005, D-011, D-019]
last_updated: 2026-10-30
---
# S1-08: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-08 — chat-basic`  
> **حزم العمل:** موزعة على 4 معالم تنفيذ رئيسية تربط محرك الرسائل فائق السرعة في الخادم (`services_backend/chat_core/`) بحزمة واجهات الدردشة في Flutter (`packages_dart/fos_chat/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── chat/
│               ├── controllers/
│               │   ├── channels.controller.ts      # إدارة القنوات واسترجاع الرسائل
│               │   └── messages.controller.ts      # نقاط نهاية الإرسال والقراءة
│               ├── gateways/
│               │   └── chat.gateway.ts             # بوابة WebSocket للبث اللحظي
│               ├── services/
│               │   ├── message-sequencer.service.ts # توليد التسلسل ومنع التكرار
│               │   ├── envelope-crypto.service.ts   # تشفير الرسائل المعمى (D-019)
│               │   └── channel-access.service.ts    # حجب قنوات الوالدين عن الأطفال
│               └── repositories/
│                   └── message.repository.ts
│
└── apps/mobile/
    └── packages/
        └── fos_chat/
            ├── lib/
            │   ├── src/
            │   │   ├── bloc/
            │   │   │   ├── chat_inbox_bloc.dart    # إدارة صندوق المحادثات
            │   │   │   └── chat_room_bloc.dart     # إدارة تدفق الرسائل والإرسال
            │   │   ├── widgets/
            │   │   │   ├── fos_chat_bubble.dart    # فقاعة الرسائل المتكيفة
            │   │   │   ├── fos_composer.dart       # شريط الإدخال ومحدد الإيموجي
            │   │   │   └── message_status_icon.dart # أيقونة الساعة/صح/صحان
            │   │   ├── repositories/
            │   │   │   └── chat_drift_repo.dart    # التخزين والمزامنة المحلية في Drift
            │   │   └── views/
            │   │       ├── chat_inbox_screen.dart
            │   │       ├── chat_room_screen.dart
            │   │       └── chat_info_sheet.dart
            └── test/
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: محرك الرسائل المتسلسل والتشفير في الخادم
- إنشاء جداول `chat.channels` و `chat.messages` وتفعيل الـ Sequence Generator.
- برمجة خدمة التشفير المظروفي `EnvelopeCryptoService` لحفظ الحمولات المعماة.
- إعداد بوابة WebSocket لتبادل الرسائل اللحظية ومؤشرات الكتابة وإيصالات القراءة.

### المعلم M2: التخزين المحلي المتفائل في Drift وتدفق الإرسال (Flutter)
- بناء كاش الرسائل في Drift مع مؤشرات الحالة (Pending, Sent, Read).
- ربط حقل الإدخال بتوليد `client_message_id` فريد وإدراج الرسالة فورياً في الـ UI (<10ms).
- معالجة طابور المزامنة في الخلفية عند عودة الاتصال.

### المعلم M3: واجهات المحادثة وفقاعات الرسائل المتجاوبة (UI)
- تصميم وبرمجة شاشة صندوق المحادثات `SCR-S1-08-01` وشاشة غرفة الدردشة `SCR-S1-08-02`.
- برمجة مكوّن `FosChatBubble` ليدعم ألوان الأطفال المخصصة وتمييز رسائل الوالدين.
- دعم اختصارات الرموز التعبيرية للأطفال L4/L5 بنقرة واحدة.

### المعلم M4: حماية قنوات الوالدين المشددة وضغط بيانات Tier B
- تطبيق فحص `Father PIN` عند محاولة فتح قناة الوالدين الخاصة على الأجهزة المشتركة.
- تطبيق ضغط نصوص الرسائل بـ Brotli لدول Tier B (اليمن) لتوفير الباندويث وفق D-031.
