---
id: S1-01
title: خطة التنفيذ الفنية — غلاف التطبيق والمنصة
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-01/00-analysis, S1-01/03-data-model, S1-01/04-api-contracts, D-026, D-027, D-029]
last_updated: 2026-10-30
---
# S1-01: خطة التنفيذ الفنية وهندسة الحزم (Implementation Plan & Package Architecture)

> **النظام:** `S1-01 — app-shell-and-platform`  
> **البيئة التقنية:** Flutter (Mobile Client) + NestJS (Backend Platform Services)  
> **الاستخلاص المرجعي:** `[REF:benchmarks/extracted/telegram/]` (هندسة إدارة الخيوط المتزامنة)، `[REF:benchmarks/extracted/quizlet/]` (بنية الوحدات متعددة المنصات KMP/Modular).

---

## 1. الهيكلية المعمارية للحزم في المونوريبو (Monorepo Package Structure)

توزع مكونات نظام S1-01 داخل مستودع المشروع وفق النمط المعياري النظيف (Clean Architecture):

```
packages_dart/
├── fos_shell/                                    # حزمة غلاف التطبيق المشتركة
│   ├── lib/
│   │   ├── src/
│   │   │   ├── shell/                            # كود الغلاف وشريط التنقل المتكيف
│   │   │   │   ├── app_shell_scaffold.dart       # الحاوية الرئيسية للتطبيق
│   │   │   │   ├── adaptive_navigation_bar.dart  # شريط التنقل المتغير حسب الدور L0-L5
│   │   │   │   └── quick_action_header.dart      # الشريط العلوي وزر SOS
│   │   │   ├── profile/                          # محرك تبديل الحسابات وبوابة الأمان
│   │   │   │   ├── profile_switcher_sheet.dart   # اللوحة السفلية لتبديل الحساب
│   │   │   │   ├── parent_gate_dialog.dart       # بوابة حماية الوالدين والتحدي الرياضي
│   │   │   │   └── role_experience_provider.dart # مدير حالة ملف التجربة
│   │   │   ├── outbox/                           # محرك المزامنة دون اتصال
│   │   │   │   ├── local_outbox_queue.dart       # إدارة طابور SQLite المحلي
│   │   │   │   └── sync_orchestrator.dart        # منظم تفريغ الدفعات والاتصال
│   │   │   ├── registries/                       # السجلات المركزية الأربعة (D-026)
│   │   │   │   ├── control_registry.dart
│   │   │   │   ├── permission_registry.dart
│   │   │   │   ├── widget_registry.dart
│   │   │   │   └── notification_registry.dart
│   │   │   └── country/                          # مزود ملفات الدول والتكيف الإقليمي (D-031)
│   │   │       ├── country_profile_provider.dart
│   │   │       └── low_bandwidth_interceptor.dart # قاطع تقليل استهلاك الباندويث
│   │   └── fos_shell.dart                        # واجهة التصدير العامة للحزمة
apps/
├── mobile/lib/                                   # تطبيق الهواتف الذكية (iOS & Android)
│   ├── main.dart                                 # نقطة الإقلاع وتهيئة الغلاف
│   └── platform_bridge/                          # قنوات الربط بالعتاد (Platform Channels)
services_backend/
└── platform_core/                                # خدمات الخادم المركزية (NestJS)
    ├── src/
    │   ├── bootstrap/                            # وحدة تهيئة الجلسات وملفات الدول
    │   ├── outbox_ingest/                        # مستقبل دفعات المزامنة غير المتصلة
    │   ├── device_health/                        # مراقب صحة الأجهزة والبيكون الصامت
    │   └── ai_gateway/                           # هيكل بوابة الذكاء المركزي (D-029)
```

---

## 2. مراحل وخطوات التنفيذ البرمجي (Implementation Milestones)

### المرحلة الفرعية 1.1: غلاف التطبيق وشريط التنقل المتكيف (Adaptive Navigation Scaffold)
1. إنشاء ويدجت `AppShellScaffold` في Flutter مع دعم `NestedRouter` لتغيير التبويبات بسلاسة دون تدمير حالة الشاشات الفرعية (`IndexedStack / StatefulShellRoute`).
2. ربط الغلاف بمزود الحالة `RoleExperienceNotifier` لتبديل أيقونات وعناوين الشريط السفلي تلقائياً عند تغيير الحساب.
3. دمج زر الطوارئ العائم `SOSFloater` مع منطق الضغط المستمر لمدة 3 ثوانٍ والاهتزاز اللمسي التصاعدي.

---

### المرحلة الفرعية 1.2: محول الملفات الشخصية وبوابة الوالدين (Profile Switcher & Parent Gate)
1. برمجة لوحة `ProfileSwitcherSheet` المنبثقة من الأسفل لاستعراض وجوه أفراد العائلة ورصيد عملاتهم.
2. برمجة نافذة `ParentGateDialog` لحماية إعدادات النظام ومنع خروج الأطفال عبر:
   - مولد المسائل الرياضية العشوائي (`MathChallengeGenerator`: توليد معادلات مثل $37 \times 4$ مع مهلة 15 ثانية).
   - حقل إدخال رمز PIN الوالد كخيار بديل.
   - جسر التحقق من البصمة الحيوية عبر Android Biometrics / iOS FaceID.

---

### المرحلة الفرعية 1.3: السجلات المركزية المشتركة وقدرات المنصة (D-026 Registries)
1. تأسيس السجلات المركزية الأربعة كـ Singletons في الذاكرة مع إمكانية التسجيل الديناميكي للأنظمة القادمة:
   - `ControlRegistry`: واجهة `registerControl(ControlDefinition control)`.
   - `PermissionRegistry`: واجهة `registerPermission(PermissionDefinition perm)`.
   - `WidgetRegistry`: واجهة `registerWidget(WidgetDefinition widget)`.
   - `NotificationRegistry`: واجهة `registerNotification(NotificationDefinition notif)`.
2. ضمان سرعة استرجاع عناصر التحكم في زمن يقل عن 1 ميلي ثانية.

---

### المرحلة الفرعية 1.4: محرك المزامنة دون اتصال أولاً (Transactional Outbox Engine)
1. إنشاء جدول `platform_offline_outbox` عبر مكتبة `Drift / SQLite` المشفرة.
2. بناء قاطع للشبكة (`Dio / Http Interceptor`) يقوم باعتراض أي طلب كتابة يفشل بسبب انقطاع الإنترنت وتخزينه في جدول Outbox.
3. إعداد خدمة خلفية مجدولة عبر `WorkManager` على أندرويد و `BGAppRefresh` على iOS لرفع الدفعات فور توفر الاتصال.
4. إتاحة زر يدوي في شريط الحالة: "مزامنة الآن" لإجبار رفع الأحداث المعلقة عند رغبة المستخدم.

---

### المرحلة الفرعية 1.5: التكيف الإقليمي مع ملفات الدول (D-031 Implementation)
1. إنشاء `CountryProfileProvider` وتضمين ملفات التهيئة المسبقة للخليج (Tier A) واليمن (Tier B).
2. تطبيق `LowBandwidthInterceptor` الذي يفرض ضغط Brotli، ويمنع استدعاء الصور بدقة عالية، ويقلص دورات الاتصال عند اكتشاف شبكة اتصالات يمنية.

---

### المرحلة الفرعية 1.6: تأسيس هيكل شريان الذكاء المركزي (Spine Core AI Hook — D-029)
1. بناء وحدة `ai-gateway` في خادم NestJS لاستقبال استعلامات الذكاء وتتبع الحصص ومفاتيح الإيقاف الطارئة.
2. تجهيز واجهة الربط الطرفية `OnDeviceAIHook` في تطبيق Flutter لتكون جاهزة لاستقبال النماذج الخفيفة المدمجة (TFLite / ONNX) في المراحل القادمة دون الحاجة لتعديل الغلاف.

---

## 3. الاعتماديات والمكتبات التقنية المعتمدة (Dependencies & Tech Stack)

* **إدارة الحالة:** `flutter_bloc` / `riverpod` لإدارة تدفقات الحالات غير المتزامنة بدقة ونظافة.
* **قاعدة البيانات المحلية:** `drift` (محرك SQLite عالي الأداء مع دعم الـ Type-Safety والتشفير).
* **إدارة التخزين السريع:** `flutter_secure_storage` لحفظ الرموز الحساسة و `shared_preferences` للكاش السريع.
* **الأعمال الخلفية:** `workmanager` لجدولة تفريغ طابور المزامنة دون اتصال في الخلفية.
* **الاهتزاز اللمسي:** `haptic_feedback` لتقديم ردود فعل لمسية مخصصة.
* **الشبكة والاتصال:** `dio` مع قواطع الضغط وإدارة الاتصال اللحظي عبر `web_socket_channel`.
