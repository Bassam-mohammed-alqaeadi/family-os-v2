# تقرير الفحص الهيكلي T1 لتطبيق Telegram (T1 Structural Inspection Report)
## الحزمة: BIP-02 — Telegram Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-01
> **مستوى الفحص:** T1 — Structural & Container Architecture
> **التطبيق المستهدف:** Telegram Messenger (Android)
> **حزمة المانيفست المعتمدة:** `org.telegram.messenger.web`
> **المعرفات المرتبطة:** `TG-RES-000007`, `TG-RES-000019`, `TG-RES-000020`, `TG-EVD-000007`, `TG-EVD-000024`, `TG-EVD-000025`

---

## 1. ملخص الفحص الهيكلي العام

أُجري فحص شامل ومباشر لجميع المكونات الهيكلية والحاويات التنفيذية المستخرجة من تطبيق Telegram. يوثق هذا التقرير البنية المعمارية لتوزيع الكود، وأذونات النظام، والمكونات الأساسية للواجهة والخدمات، وحسم مطابقة حاويات Dalvik Executable (DEX).

---

## 2. تشريح مانيفست التطبيق (AndroidManifest.xml)

- **مسار الملف الفعلي:** `benchmarks/extracted/telegram/01_architecture_and_manifest/AndroidManifest.xml`
- **حجم الملف:** 15,936 بايت (503 أسطر).
- **اسم الحزمة (Package Name):** `org.telegram.messenger.web` (النسخة المستقلة المباشرة، والمعتمدة كمرجع أساسي في `reference-registry.json`).
- **المكونات الأساسية المسجلة:**
  1. **الأنشطة (Activities):**
     - النشاط الرئيسي والدخول: `org.telegram.ui.LaunchActivity` (مزود بمرشحات نوايا Intent Filters للتعامل مع الروابط العميقة `tg://` و `https://t.me/`).
     - أنشطة فرعية للمكالمات والوسائط وإدارة الجلسات.
  2. **الخدمات (Services):**
     - `org.telegram.messenger.NotificationsService`: خدمة خلفية حارسة تعمل بنمط `START_STICKY` للحفاظ على استمرارية التنبيه الفوري.
     - `org.telegram.messenger.voip.VoIPService`: خدمة إدارة المكالمات الصوتية والمرئية في الخلفية مع إشعار دائم Foreground Notification.
  3. **مستقبلات البث (Broadcast Receivers):**
     - مستقبلات إعادة التشغيل عند إقلاع النظام (`BOOT_COMPLETED`).
     - مستقبلات الاتصال والشبكة والتحقق التلقائي من رمز الرسائل القصيرة SMS.
  4. **مزودو المحتوى (Content Providers):**
     - مشاركة الملفات الآمنة وإدارة المرفقات عبر FileProvider.

---

## 3. مطابقة وحسم ملفات Dalvik Executable (DEX Reconciliation)

### 3.1. الحصر المادي الدقيق لملفات DEX الثمانية على القرص
أثبت الفحص المادي القطعي للقرص وجود **8 ملفات `.dex`** مستقلة بحجم إجمالي قدره **56,631,184 بايت**، موزعة في مسارين محددين:

| # | المسار النسبي على القرص | الحجم بالبايت | بصمة SHA-256 | الدور المعماري |
|---|---|---|---|---|
| 1 | `benchmarks/extracted/telegram/_apktool_raw/classes.dex` | 11,390,396 | `f026a71abfc774f67c348981fcae1329188047021eb1ce5eb037fc09d94191d8` | Multi-DEX Container #1 (Apktool Raw) |
| 2 | `benchmarks/extracted/telegram/_apktool_raw/classes2.dex` | 10,742,752 | `313d33246ebc64d8db190581ea73926615b13cf106b1076f80d754f9235e1837` | Multi-DEX Container #2 (Apktool Raw) |
| 3 | `benchmarks/extracted/telegram/_apktool_raw/classes3.dex` | 6,170,052 | `70ec947dfeb6f6424e6c98ae5306ec1feee0db77526bb0c84cce31245ee33d3c` | Multi-DEX Container #3 (Apktool Raw) |
| 4 | `benchmarks/extracted/telegram/_apktool_raw/classes4.dex` | 12,392 | `ba36130eb5a05b3e648a7b15a6bfa9fca44a7ef752a5da5b6b3e9a7e65147814` | Multi-DEX Container #4 (Apktool Raw) |
| 5 | `benchmarks/extracted/telegram/_target_dex/classes.dex` | 11,390,396 | `f026a71abfc774f67c348981fcae1329188047021eb1ce5eb037fc09d94191d8` | Multi-DEX Container #1 (JADX Target) |
| 6 | `benchmarks/extracted/telegram/_target_dex/classes2.dex` | 10,742,752 | `313d33246ebc64d8db190581ea73926615b13cf106b1076f80d754f9235e1837` | Multi-DEX Container #2 (JADX Target) |
| 7 | `benchmarks/extracted/telegram/_target_dex/classes3.dex` | 6,170,052 | `70ec947dfeb6f6424e6c98ae5306ec1feee0db77526bb0c84cce31245ee33d3c` | Multi-DEX Container #3 (JADX Target) |
| 8 | `benchmarks/extracted/telegram/_target_dex/classes4.dex` | 12,392 | `ba36130eb5a05b3e648a7b15a6bfa9fca44a7ef752a5da5b6b3e9a7e65147814` | Multi-DEX Container #4 (JADX Target) |
| — | **المجموع الكلي لملفات DEX الثمانية** | **56,631,184 بايت** | — | **8 ملفات مادية على القرص** |

### 3.2. التفسير المعماري للمطابقة
1. **أصل الحزم:** التطبيق المترجم يحتوي أصلاً على **4 حاويات Multi-DEX** (`classes.dex` إلى `classes4.dex`) بإجمالي حجم قدره **28,315,592 بايت (~28.32 ميجابايت)**.
2. **سبب وجود 8 ملفات على القرص:** أثناء عملية الهندسة العكسية والاستخراج، تم استخراج الملفات الأربعة الأولى داخل `_apktool_raw/` بواسطة أداة `apktool` (28,315,592 بايت)، وتم عمل نسخة طبق الأصل مطابقة 100% في الحجم وبصمة SHA-256 داخل مجلد `_target_dex/` لتكون هدفاً لأداة التفكيك `jadx` (28,315,592 بايت أخرى).
3. **النتيجة الحسابية:** إجمالي الحجم المادي لجميع ملفات DEX الثمانية على القرص هو `28,315,592 × 2 = 56,631,184 بايت`، وهو الرقم المحسوب بدقة في جدول امتدادات T0 الشامل دون أي استبعاد.

---

## 4. البنية الهيكلية لحزم الكود المصدري المفكك

يتوزع الكود البرمجي المفكك في `benchmarks/extracted/telegram/03_decompiled_src/sources/` عبر 16,388 ملف Java، وتتمركز المعمارية حول الحزم الرئيسية التالية:
- `org.telegram.messenger`: المحرك التشغيلي الرئيسي (إدارة الرسائل، الوسائط، حسابات المستخدمين، والمتحكمات).
- `org.telegram.tgnet`: بروتوكول الشبكة وإدارة اتصالات MTProto وقنوات النقل ومراكز البيانات.
- `org.telegram.SQLite`: طبقة قواعد البيانات المباشرة والوسيط الأصلي Native JNI Bridge.
- `org.telegram.ui`: طبقة الواجهة الرسومية الكاملة والمكونات البصرية المخصصة (Custom Views).
- `org.telegram.messenger.voip`: محرك المكالمات المشفرة ومكتبات WebRTC والصوت المدمجة.

---

## 5. توصيات الصهر والاستفادة لـ Family OS (S1-01 إلى S1-09)

1. **إدارة دورة حياة الخدمات (S1-07):** الاستفادة من نمط `NotificationsService` في الحفاظ على استمرارية الاتصال بالخادم وتوصيل التنبيهات الحرجة دون استنزاف البطارية.
2. **معمارية الحاويات (Platform Packaging):** مراعاة تجزئة الكود وحزم المكتبات الثنائية المترجمة وفق قيود Dalvik 64k methods لضمان سرعة الإقلاع والإدماج في أجهزة أندرويد الاقتصادية.
