# وثيقة الاستكشاف الوظيفي الشامل وتحليل الفجوات المعمارية — Telegram
# Comprehensive Functional Discovery, Boundary Reconciliation & Gaps Analysis (Unified Plan Deep-Doc #3)

> **التطبيق:** Telegram — `org.telegram.messenger` v13.1.1
> **الدور:** المرجع المعماري لمعيار 10M+ مستخدم متزامن

---

## 1. الإطار المنهجي المعتمد

- **المستوى A (مؤكد بالكود):** قُرئ الكود المفكك فعلياً — `Confirmed`.
- **المستوى B (مشتق):** مستنتج من البنية والتسميات — `Derived`.
- **جزئي (Partial):** smali فقط (ساقط من jadx) أو يتطلب النواة الغائبة.
- **غير موجود (Not Found):** فجوة موثقة.

## 2. مصفوفة حدود الملكية وطوبولوجيا النظام

### توصيف نطاقات الملكية:
- **النواة الأصلية C++ (غائبة):** الشبكة (MTProto)، التشفير، SQLite — تُدار عبر 27+ دالة `native_*`.
- **طبقة Java (موجودة):** التنسيق — الطوابير، الحافلة، الحسابات، التخزين المنطقي، الواجهات.
- **الخادم:** المصدر الوحيد للحقيقة للمحادثات العادية؛ المحادثات السرية **جهازية فقط**.
- **حد الملكية الحرجة:** Java لا تملك أي قرار شبكي/تشفيري — كلها مفوَّضة للأصلي عبر JNI.

## 3. حسم الفروقات المادية والتاريخية

- تقرير الجولة الأولى سجَّل `MessagesController`/`MessagesStorage`/`NotificationsController`
  «غائبة كلياً» — **حُسم هنا:** موجودة كاملة في smali (1,580 / 861 / 205 طريقة) وحُللت منه.
- الإصدار المحلل هنا (13.1.1) أحدث من نسخة أكتوبر (10.x).
- `.so` غائبة لسبب بنيوي (split `base__abi`) — ليست فجوة استخراج.

## 4. الفحص المعماري لطبقة البيانات والتخزين

**الحسم:** قاعدة `cache4.db` **لكل حساب** (WAL) بـ ~80 جدولاً — لا ORM؛ `MessagesStorage`
(861 طريقة smali) هو طبقة الوصول الوحيدة. `requested_holes` + `params` = تتبع فجوات المزامنة.

## 5. المطابقة القطعية للواجهات البرمجية

### 5.1 إحصائيات المطابقة:
- **27+ دالة `native_*`** في `ConnectionsManager` (تعريفات JNI فقط).
- **2,043 فئة `TL_*`** في `TLRPC.java` (80,043 سطراً) — مخطط البروتوكول الكامل.
- **348 حدثاً** في `NotificationCenter`.
- **12 علَم طلب** + 5 أنواع اتصال + 5 حالات اتصال.
- **مفردات الدفع:** `PUSH_TYPE_FIREBASE=2`، `PUSH_TYPE_HUAWEI=13` + اتصال دفع دائم.

---

## 6. مصفوفة الاستكشاف والتغطية الوظيفية الشاملة

### 6.1 الإحصائيات الإجمالية للاستكشاف الوظيفي:
- **إجمالي الوظائف:** 34 وظيفة عبر 8 مجالات.
- **مؤكدة Level A:** 24 | **مشتقة Level B:** 6 | **جزئية:** 3 | **غير موجودة:** 1.

### 6.2 جدول الفهرسة السريع للوظائف الـ 34 (Quick Reference Matrix):

| المعرف | الوظيفة | النطاق | المستوى |
|---|---|---|---|
| TG-FUN-000001 | دورة حياة `DispatchQueue` (نشر/إلغاء/تنظيف/تدوير) | الخيوط | A مؤكدة |
| TG-FUN-000002 | بوابة الجهوزية `CountDownLatch` | الخيوط | A مؤكدة |
| TG-FUN-000003 | مراقبة الجمود `getLastTaskTime` | الخيوط | A مؤكدة |
| TG-FUN-000004 | التسلسل المركزي `stageQueue` | الخيوط | A مؤكدة |
| TG-FUN-000005 | بث الأحداث الآمن الخيط (348 حدثاً) | الأحداث | A مؤكدة |
| TG-FUN-000006 | تأجيل الإشعارات أثناء الأنيميشن (5017ms) | الأحداث | A مؤكدة |
| TG-FUN-000007 | إلغاء تكرار الإشعارات (debounce) | الأحداث | A مؤكدة |
| TG-FUN-000008 | مجموعات المراقبين الضعيفة (كشف التسرب) | الأحداث | A مؤكدة |
| TG-FUN-000009 | بوابة العمليات الثقيلة (heavy ops gating) | الأحداث | A مؤكدة |
| TG-FUN-000010 | شبكة الحسابات `AccountInstance[4]` | الحسابات | A مؤكدة |
| TG-FUN-000011 | حالة الجلسة `UserConfig` لكل حساب | الحسابات | A مؤكدة |
| TG-FUN-000012 | دخول التحديثات JNI (`onUnparsedMessageReceived`) | الشبكة | A مؤكدة |
| TG-FUN-000013 | مسار الردود (تسلسل/فك/توجيه `Updates`) | الشبكة | A مؤكدة |
| TG-FUN-000014 | معالجة أغلفة التحديثات (`TL_updates*`) | الشبكة | A مؤكدة |
| TG-FUN-000015 | المزامنة بالفروق (`getDifference`) | الشبكة | A مؤكدة (المُشغِّل) |
| TG-FUN-000016 | تعدد الاتصالات (5 أنواع / 8 تنزيل) | الشبكة | A مؤكدة |
| TG-FUN-000017 | أعلام الطلبات الـ 12 | الشبكة | A مؤكدة |
| TG-FUN-000018 | نشر حالة الاتصال للواجهة | الشبكة | A مؤكدة |
| TG-FUN-000019 | تجاوز DNS عبر HTTPS (Google/Mozilla) | الشبكة | A مؤكدة |
| TG-FUN-000020 | إدارة مراكز البيانات والبروكسي | الشبكة | A مؤكدة |
| TG-FUN-000021 | الدفع ثلاثي الطبقات (دائم+FCM+Huawei) | الدفع | A مؤكدة |
| TG-FUN-000022 | حمولات الدفع المشفرة AES-IGE | الدفع | A مؤكدة |
| TG-FUN-000023 | `KeepAliveJob` (إبقاء الجلسة أثناء الدفع) | الدفع | A مؤكدة |
| TG-FUN-000024 | طوابير الوسائط (5 لكل DC + أولويات) | الوسائط | A مؤكدة |
| TG-FUN-000025 | التنزيل المقطع (32KB/128KB × 4، عتبة 10MB) | الوسائط | A مؤكدة |
| TG-FUN-000026 | الرفع المتسلسل (سقف 1+1) | الوسائط | A مؤكدة |
| TG-FUN-000027 | سياسة التنزيل التلقائي (أقنعة الشبكات) | الوسائط | A مؤكدة |
| TG-FUN-000028 | تنظيم إيقاع التنزيل (`DownloadRequestPacer`) | الوسائط | A مؤكدة |
| TG-FUN-000029 | الغلاف الأصلي لـ SQLite (بلا ORM) | التخزين | A مؤكدة |
| TG-FUN-000030 | `cache4.db` (WAL لكل حساب، ~80 جدولاً) | التخزين | A مؤكدة |
| TG-FUN-000031 | حدود E2E (مفتاح جهازي + AES-IGE) | الأمان | B مشتقة |
| TG-FUN-000032 | دمج الفروق وتتبع الفجوات (`requested_holes`) | المزامنة | B مشتقة |
| TG-FUN-000033 | جسر VoIP الأصلي (36 دالة) | المكالمات | B مشتقة |
| TG-FUN-000034 | النواة الأصلية C++ (سلوك الشبكة الداخلي) | — | **غير موجودة** |

### 6.3 السجل التشريحي التفصيلي للوظائف (نموذج موسع لأهم 12 — الباقي في الجدول):

#### المجال 1: الخيوط

##### TG-FUN-000001: دورة حياة `DispatchQueue`
- **المسار البرمجي:** `new DispatchQueue(name)` ← `Looper.prepare()` + `Handler` ←
  `syncLatch.countDown()` ← `postRunnable`/`postToFrontRunnable`/`sendMessage` ←
  `cancelRunnable`/`cleanupQueue`/`recycle()`
- **المصدر الفيزيائي:** `rework/telegram/jadx-out/sources/org/telegram/messenger/DispatchQueue.java` (#L1-L159)
- **الموارد والأدلة:** `TG-RES-000002` — `TG-EVD-000002`
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### TG-FUN-000004: التسلسل المركزي `stageQueue`
- **المسار البرمجي:** `Utilities.stageQueue = new DispatchQueue("stageQueue")` ← كل
  `onUnparsedMessageReceived` وكل ردود `sendRequest` تُنشر عليه قبل أي منطق
- **المصدر الفيزيائي:** `rework/telegram/jadx-out/sources/org/telegram/messenger/Utilities.java` (#L35, #L128)
- **مستوى الإثبات:** **Level A** — `Confirmed`
- **القاعدة الذهبية:** لا منطق رسائل خارج هذا الطابور — أساس منع السباقات.

#### المجال 2: الأحداث

##### TG-FUN-000005: بث الأحداث الآمن الخيط
- **المسار البرمجي:** `postNotificationNameOnUIThread(id, args)` ← `AndroidUtilities.runOnUIThread`
  ← `postNotificationNameInternal` (يفحص خيط الواجهة في DEBUG) ← بث متزامن على المراقبين
- **المصدر الفيزيائي:** `rework/telegram/jadx-out/sources/org/telegram/messenger/NotificationCenter.java` (#L1298–1350)
- **الموارد والأدلة:** `TG-RES-000003` — `TG-EVD-000003`
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### TG-FUN-000006: تأجيل الإشعارات أثناء الأنيميشن
- **المسار البرمجي:** `setAnimationInProgress(flags, allowedIds)` ← `AllowedNotifications`
  ← `DelayedPost` ← `onAnimationFinish` ← `runDelayedNotifications`؛ انتهاء صلاحية 5017ms
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 3: الشبكة

##### TG-FUN-000012: دخول التحديثات JNI
- **المسار البرمجي:** النواة C++ ← `onUnparsedMessageReceived(ptr, account, msgId)` ←
  `NativeByteBuffer.wrap(ptr)` ← `TLRPC.Updates.TLdeserialize(...)` ← `KeepAliveJob.finishJob()`
  ← `stageQueue.postRunnable` ← `MessagesController.lambda$processUpdates$377`
- **المصدر الفيزيائي:** `rework/telegram/jadx-out/sources/org/telegram/tgnet/ConnectionsManager.java` (#L1259–1284)
- **الموارد والأدلة:** `TG-RES-000005` — `TG-EVD-000005`
- **مستوى الإثبات:** **Level A** — `Confirmed`

##### TG-FUN-000015: المزامنة بالفروق
- **المسار البرمجي:** `TL_updatesTooLong` / فجوة seq ← `"need get diff"` ← `getDifference()`
  ← `updates_GetDifference`؛ `onSessionCreated` ← `getDifference()` (إعادة الاتصال)
- **المصدر الفيزيائي:** `rework/telegram/apktool-out/smali/org/telegram/messenger/MessagesController.smali` (#L195319، #L164757)
- **مستوى الإثبات:** **Level A** للمُشغِّل — `Confirmed`؛ منطق الدمج التفصيلي Partial (smali)

##### TG-FUN-000019: تجاوز DNS عبر HTTPS
- **المسار البرمجي:** فشل الاتصال ← `GoogleDnsLoadTask` ← `MozillaDnsLoadTask` (احتياطي) ←
  خنق 10 ثوانٍ ← `native_applyDnsConfig`
- **المصدر الفيزيائي:** `rework/telegram/jadx-out/sources/org/telegram/tgnet/ConnectionsManager.java` (#L878–904)
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 4: الدفع

##### TG-FUN-000022: حمولات الدفع المشفرة
- **المسار البرمجي:** FCM ← `GcmPushListenerService.onMessageReceived` ← المفتاح `"p"` ←
  `PushListenerController.processRemoteMessage(2, p)` ← فك AES-IGE (#L4319)
- **المصدر الفيزيائي:** `rework/telegram/apktool-out/smali/org/telegram/messenger/GcmPushListenerService.smali` (#L475)
- **مستوى الإثبات:** **Level A** — `Confirmed`
- **القاعدة:** FCM لا يرى أي محتوى — مجرد منبّه مشفّر.

#### المجال 5: الوسائط

##### TG-FUN-000025: التنزيل المقطع
- **المسار البرمجي:** `FileLoadOperation` ← قطع 32KB (عادي) / 128KB (كبير > 10MB) ←
  4 طلبات متوازية ← طابور أولوية لكل DC
- **المصدر الفيزيائي:** `rework/telegram/apktool-out/smali/org/telegram/messenger/FileLoadOperation.smali` (#L448–470)
- **الموارد والأدلة:** `TG-RES-000011` — `TG-EVD-000011`
- **مستوى الإثبات:** **Level A** — `Confirmed`

#### المجال 6: التخزين

##### TG-FUN-000030: `cache4.db`
- **المسار البرمجي:** `MessagesStorage` ← `new SQLiteDatabase("cache4.db")` (WAL) ←
  ~80 جدولاً ← `requested_holes`/`params` لتتبع الفجوات
- **المصدر الفيزيائي:** `rework/telegram/apktool-out/smali/org/telegram/messenger/MessagesStorage.smali` (#L190750)
- **مستوى الإثبات:** **Level A** — `Confirmed`

### 6.4 الفجوات الحرجة (Gaps):
- **TG-FUN-000034 (غير موجودة):** النواة الأصلية C++ — كل سلوك الشبكة الداخلي
  (إعادة الاتصال، اختيار DC، تشفير النقل) **غير قابل للتحليل** من هذه المخرجات.
  **Family OS يبني نواته نظيفة أو يعتمد مكتبات مفتوحة.**
- **Partial موثقة:** منطق `processUpdates` الكامل، استعلامات `MessagesStorage`، تبادل DH
  — smali فقط، تحتاج قراءة مركزة لاحقاً.
- **مرفوض صراحة:** نسخ `TLRPC` كاملاً (80 ألف سطر) — عبء صيانة بلا حاجة.
