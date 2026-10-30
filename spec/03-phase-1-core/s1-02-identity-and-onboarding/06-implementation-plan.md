---
id: S1-02
title: خطة التنفيذ وحزم العمل — الهوية والتهيئة
phase: 1
file: 06-implementation-plan
status: drafted
depends_on: [S1-02/03-data-model, S1-02/04-api-contracts, D-003, D-005]
last_updated: 2026-10-30
---
# S1-02: خطة التنفيذ وحزم العمل (Implementation Plan)

> **النظام:** `S1-02 — identity-and-onboarding`  
> **حزم العمل:** مقسمة على 4 مراحل هندسية واضحة المعالم، وموزعة بين بنية الخادم (`services_backend/identity_core/`) وتطبيق Flutter العميل (`packages_dart/fos_auth/`).

---

## 1. البنية المعمارية للحزم البرمجية (Package & Directory Structure)

```
family-os-v2/
├── services_backend/
│   └── src/
│       └── modules/
│           └── identity/
│               ├── controllers/
│               │   ├── auth.controller.ts          # نقاط نهاية OTP والدخول
│               │   └── family.controller.ts        # تأسيس العائلة ودعوة الأعضاء
│               ├── services/
│               │   ├── otp.service.ts              # خوارزميات التوليد والتوزيع (SMS/WhatsApp)
│               │   ├── token.service.ts            # إدارة JWT والدوران الآمن
│               │   ├── family-pairing.service.ts   # تشفير ومطابقة أكواد QR
│               │   └── country-gateway.service.ts  # التبديل بين Tier A و Tier B
│               ├── repositories/
│               │   ├── user.repository.ts
│               │   └── family.repository.ts
│               └── schemas/
│                   └── identity.dto.ts
│
└── apps/mobile/
    └── packages/
        └── fos_auth/
            ├── lib/
            │   ├── src/
            │   │   ├── bloc/
            │   │   │   ├── auth_bloc.dart          # إدارة حالة تسجيل الدخول
            │   │   │   └── pairing_bloc.dart       # إدارة مسح كود QR والاقتران
            │   │   ├── repositories/
            │   │   │   ├── auth_repository.dart
            │   │   │   └── secure_storage_repo.dart # حفظ التوكن في Keystore / Keychain
            │   │   ├── views/
            │   │   │   ├── phone_login_screen.dart
            │   │   │   ├── otp_verification_view.dart
            │   │   │   ├── family_setup_wizard.dart
            │   │   │   └── qr_scanner_view.dart
            │   │   └── widgets/
            │   │       ├── country_code_picker.dart
            │   │       └── pin_code_input.dart
            └── test/
```

---

## 2. معالم التنفيذ وحزم المهام (Milestones & Work Packages)

### المعلم M1: محرك الـ OTP الموزع والتحقق (الخادم)
- إعداد جداول `identity.users` و `identity.otp_codes` وربط مزودات SMS (Twilio / Unifonic) وبوت WhatsApp Business API.
- تنفيذ آلية الـ Rate Limiting عبر Redis وتطبيق قاعدة D-031 لليمن.
- كتابة اختبارات تكاملية لطلب والتحقق من الرمز مع معالجة الحالات الحدية (انتهاء الصلاحية، الرمز الخاطئ).

### المعلم M2: واجهات الدخول والتحقق بتطبيق Flutter
- بناء شاشة الهاتف ومحدد الدولة التلقائي بالاعتماد على SIM Card Locale.
- دمج إضافة `sms_autofill` لقراءة الـ SMS تلقائياً على نظام Android بدون إذن قراءة الرسائل الحساس (استخدام `SmsRetriever API` الرسمي لمتجر Google).
- بناء عداد الـ 30 ثانية والانتقال التلقائي لخيار الإرسال عبر واتساب.

### المعلم M3: دورة حياة العائلة والاقتران المشفر عبر QR
- تطوير منطق إنشاء العائلة وحسابات الأطفال في الخادم.
- توليد شفرة QR الديناميكية المشفرة بـ HMAC-SHA256 مع فترة صلاحية 10 دقائق.
- دمج قارئ الكود السريع في تطبيق الطفل عبر كاميرا Flutter وتبادل شهادة الجهاز.

### المعلم M4: التكامل مع الغلاف التكيفي S1-01
- ربط نجاح تسجيل الدخول بمحدث الحالة في `ShellSessionState`.
- تفعيل الانتقال التلقائي للغلاف في أقل من 250ms فور اكتمال التهيئة.
- حفظ حالة الجلسة في Drift و FlutterSecureStorage.
