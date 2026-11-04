# التحليلات الهندسية المعمقة للمسارات الثلاثة — FamiSafe (T3 Engineering Deep Dives)

> **المعرف:** `T3-FS-DEEP-DIVES-001`
> **التطبيق:** Wondershare FamiSafe (`famisafe`) — الأب + الطفل
> **تاريخ التحديث:** 2026-11-04
> **حالة التحقق:** `Level A Code-Verified` للمسارات المفككة أدناه؛ الاستنتاجات موسومة صراحة
> **ملاحظة:** تطبيق الطفل يُحلَّل هنا لأول مرة ضمن أي جرد — المسارات B و C تعتمد عليه كلياً

---

## 1. منهجية التحقيق ومستويات الإثبات المعتمدة

- **المستوى A (Ground Truth):** الكود المفكك فعلياً (jadx/smali) المقروء سطراً بسطر — موسوم `[VERIFIED]`.
- **المستوى B (Derived):** نماذج مستخلصة من بنية الكود وتسمياته — موسومة `[INFERENCE]`.
- **المستوى C (Unverified):** ما يتطلب مراقبة شبكية حية أو جهازاً حياً — موسوم `غير محسوم`.
- **حدود الدليل والأمانة العلمية:** أي رقم سطر مذكور تم التحقق منه بالقراءة المباشرة؛ حيث لم يُتحقق يُذكر الملف دون أرقام.

---

## 2. المسار الهندسي الأول (Track A): ترميز الجداول وتوزيع القواعد سحابياً

### 2.1 محرك الترميز الأسبوعي `ScreenTimeTool` — مفكك بالكامل
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:**
  - `rework/famisafe/jadx-out/sources/com/wondershare/famisafe/parent/screenv5/ScreenTimeTool.java` (الأسطر #L1-L160 — قُرئ كاملاً).
- **التشريح الهندسي:**
  - الفاصل `","` (`BLOCKED_NUMBERS_EXPORT_DELIMITER`)؛ الشكل: سلسلة من **7 عناصر** مفهرسة بالأيام 0–6.
  - `-1` = بلا حد؛ `86400` = يوم كامل؛ `0` = علامة تعارض في كشف الجداول.
  - الأعداد الأخرى **ثوانٍ**: في `allow_time` = ثواني الشاشة؛ في `start/end_time` = ثوانٍ منذ منتصف الليل تُعرض `"HH:MM"`.
  - **السطر #L106:** الافتراضي المكتوب صراحة للقائمة الفارغة: `"3600,-1,200,300,300,300,300"`.
  - **السطر #L26:** `HasInvalidSameSchedule(...)` — كشف التعارض **ميت**: صفر مستدعين في كامل smali [VERIFIED بالبحث الشامل].
- **حدود الدليل:** تعيين الفهرس 0–6 ليوم الأسبوع الفعلي غير مسمّى في الكود [INFERENCE: الاثنين أولاً من واجهة اختيار الأسبوع].

### 2.2 عقد التوزيع `ControlsBean` — الأب يكتب والسحابة توزع والطفل يسحب
- **مستوى الإثبات:** **Level A** للمسار الكامل
- **المصادر المفحوصة:**
  - `rework/famisafe/jadx-out/sources/com/wondershare/famisafe/common/bean/DeviceRuleBean.java` (+ `App1.java` + `ScreenTime1.java`).
  - `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/kids/MainService.java` (كتاب `controls_init_v5`).
- **التشريح الهندسي:**
  - الأب: `AppRuleLimitAndroidFragment.saveLimitRules()` ← `HttpParamUtils.getPostBody(map)` (form-urlencoded) ← `FamiParentService.requestAppBlockSaveV5` ← **`POST v4/app-block/save`**.
  - `DeviceRuleBean` **نموذج قراءة فقط** — لا كُتّاب له في Java/smali.
  - الطفل: `GET v4/gather/controls-init` ← JSON كامل في SharedPreferences ملف `"controls_init_v5"` مفتاح `"key_controls_init"` ← إعادة تحميل ساخنة عبر EventBus `MMKVChangeEvent` + `ruleChangeTriggerEventNow()`.
  - **لا يوجد أي اتصال مباشر أب←طفل** [VERIFIED] — كل شيء عبر السحابة وسيطاً.
- **حدود الدليل:** توقيت دفع السحابة للطفل بعد حفظ الأب **غير محسوم** (Level C — يحتاج مراقبة شبكية حية).

### 2.3 توقيع الطلبات والمضيفون
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/famisafe/jadx-out/sources/com/wondershare/famisafe/common/network/ApiConstant.java` (السطر #L6: `APP_KEY = "EE12071A4BC85EE516C78C38E78D1F14"`).
- **التشريح:** `vc` = MD5(`APP_KEY` + معاملات مرتبة + `APP_FP`)؛ المفتاحان مكتوبان صراحة — **مرفوض أمنياً** (`FS-RES-000018`).

---

## 3. المسار الهندسي الثاني (Track B): الحظر بالطبقة ومضاد العبث

### 3.1 سياسة "لا قتل أبداً" — الحظر بالطبقة فوق التطبيق العامل
- **مستوى الإثبات:** **Level A** (بحث شامل + قراءة المسار)
- **المصادر المفحوصة:**
  - `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/kids/accessibility/AppBlockStrategy.java`.
  - `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/child/accessibility/SCAccessibilityService.java` (الأسطر #L1-L180 — قُرئ كاملاً: موزّع فقط، يمرر الأحداث عندما دور المستخدم = 4).
- **التشريح الهندسي:**
  - التقييم بالأولوية عند كل حدث نافذة: **ScreenBlockHelper** ← **ScheduleBlockHelper** ← **AppBlockHelper**.
  - التنفيذ: `InterceptionAppPopupWindow` (WindowManager overlay) ← fallback إلى `InterceptionAppActivity` ← طبقة ملء الشاشة `TYPE_APPLICATION_OVERLAY` مع `BlockView` **يبتلع زر الرجوع** ويخفي أشرطة النظام.
  - **البحث الشامل أثبت الغياب:** صفر `killBackgroundProcesses` / `forceStopPackage` / `Process.killProcess` في كامل مصادر الطفل — التطبيقات المحظورة تبقى عاملة تحت الطبقة.
  - الاحتياطي الاستطلاعي: `HandlerThread("app_block_thread")` + `UsageStatsManager` — إيقاع تكيفي 30 ثانية / ثانيتين.
- **حدود الدليل والأمانة العلمية:** النمط آمن لسياسة Play لكنه **هش** (الوضع الآمن أو adb يقتله) — في Family OS يُستخدم كطبقة احتياطية تحت Device Owner.

### 3.2 بطارية مضاد العبث — 9 دفاعات
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/kids/accessibility/AppDefenceUtils.java` (الأسطر #L1-L374 — قُرئ كاملاً).
- **التشريح الهندسي:**
  - 9 دفاعات تُجرَّب بالترتيب لكل حدث (خنق مرة/60 ثانية): `LauncherHwDefence` / `LauncherMiDefence` / `LauncherLongClickDefence` (لانشرات الشركات)؛ `DateSetDefence` (كشف صفحات التاريخ **بـ 8 لغات** لمنع العبث بالساعة)؛ `MiAppInfoDefence` / `AppInfoDefence`؛ `GooglePermissionController` / `AccessibilityDefence`؛ `AdminDefence` (33 سطراً — يلتقط `com.android.settings:id/admin_warning`).
  - **السطر #L127:** `private void g(...)` = الرد: BACK + HOME + تحذير `HintUninstallActivity` ← **`DevicePolicyManager.lockNow()`** — لهذا وُجدت سياسة `force-lock` الوحيدة.
  - **غير موجود:** لا معالجة للوضع الآمن، لا إخفاء من مدير المهام، **لا بوابة كلمة سر** (نقطة ضعف تُعالَج في Family OS).

### 3.3 مستقبل DeviceAdmin — الـ stub الفارغ
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/child/ui/permission/DeviceAdmin.java` (السطر #L30: `onDisableRequested` تُرجع `super` — أي null).
- **التشريح:** كل الـ callbacks تسجّل فقط؛ الإدارة تُستخدم لـ `lockNow()` فقط لا لسياسات. منع إلغاء التثبيت يأتي من: (أ) النظام يمنع الإلغاء قبل إلغاء تفعيل الإدارة، (ب) accessibility يلتقط حوار الإلغاء، (ج) الرد بقفل الجهاز.

---

## 4. المسار الهندسي الثالث (Track C): مستوى الأوامر وتصفية الويب

### 4.1 FCM + WebSocket — مفردات الـ 30 فعلاً
- **مستوى الإثبات:** **Level A** للمسار، **Level B** لسياسة إعادة الاتصال
- **المصادر المفحوصة:**
  - `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/kids/websocket/WebSocketHelper.java` (250 سطراً).
  - `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/kids/accessibility/browser/BrowserMonitor.java` (السطر #L84: `put("com.android.chrome", "com.android.chrome:id/url_bar")`).
- **التشريح الهندسي:**
  - الناقلان (FCM + WebSocket برمز من `GET v5/member/ws-token`) يغذيان `PushManager`: إزالة تكرار حسب `id` (آخر 50) ← `ChildPushListener` يعالج مباشرة (`screen_limit`، `web_filter_update`، `screenshot`، `recorder_start/stop`…) والباقي ← EventBus.
  - تطبيق القواعد: `MainService.onMessageEvent` ← `GET v4/gather/controls-init` ← كتابة `controls_init_v5` ← إعادة التحميل الساخن.
  - **الأب لا يستطيع الدفع العاجل المباشر** — فقط `GET v1/devices/new-push` كبدائية عامة [VERIFIED].

### 4.2 تصفية الويب بحكم خادمي — التنفيذ محلي والحكم سحابي
- **مستوى الإثبات:** **Level A**
- **التشريح الهندسي:**
  - الطفل يسحب الـ URL عبر accessibility (خريطة view-ID لكل متصفح + مطابقة أي حزمة تحوي "browser") ← استدعاء **حاجب** `GET v1/gather/web-filter-check` (مهلة 10 ثوانٍ).
  - التخزين المؤقت: حظر 60 ثانية / سماح 300 ثانية؛ يُمسح عند دفع `web_filter_update`.
  - عند الحظر: إعادة توجيه بـ intent إلى صفحة حظر مستضافة. **لا قائمة حظر محلية** في كود الطفل.
- **حدود الدليل:** القواعد خادمية بالكامل [INFERENCE من غياب القوائم محلياً].

### 4.3 السياج الجغرافي المخصص — بلا Google
- **مستوى الإثبات:** **Level A** (الملف موجود ومقروء؛ اسم دالة المسافة قيد التثبيت الدقيق)
- **المصدر المفحوص:** `rework/famisafe-jr/jadx-out/sources/com/wondershare/famisafe/kids/geofences/CustomGeoFence.java`.
- **التشريح الهندسي:** تنفيذ مخصص (ليس Google Geofencing API): الأسوار من `ControlsBean.gps_fence`، حساب مسافة يدوي، إزالة تكرار 5 دقائق ← `POST v1/gather/geo-fence-log`.
- **القيمة الاستراتيجية:** يعمل في اليمن والأجهزة بلا GMS — يُنسخ لـ Family OS.

### 4.4 الغياب المثبت: صفر ذكاء اصطناعي على الجهاز
- **مستوى الإثبات:** **Level A** (بحث شامل بالنفي)
- **التشريح:** صفر نتائج لـ `onnx`/`tflite`/`tensorflow`/`mlkit` في كامل المصادر؛ لا ملفات `.so` أصلاً؛ لا نماذج في الأصول. حزمة `kids/socialapp/ai/` تسمية مضللة (كاشطات نصوص فقط). كل "الذكاء" تصنيف خادمي لملفات مرفوعة.
- **التباين الموثق:** Bark Kids يشحن ONNX Runtime على الجهاز — FamiSafe لا.
