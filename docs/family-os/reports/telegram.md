# تقرير الهندسة العكسية — Telegram

## 1. نظرة عامة
- **الحزمة:** `org.telegram.messenger`
- **الدور في Family OS:** وحدة **التواصل** + **المرجع المعماري للتوسع** (معيار 10M+ مستخدم متزامن).
- **حجم المخرجات:** ~10,362 ملف Java؛ أسماء الحزم الحقيقية محفوظة في الغالب
  (`org.telegram.messenger` / `tgnet` / `SQLite` / `ui`) مع 148 خطأ فك ترجمة.
- **الخلاصة المعمارية:** نواة شبكات **أصلية (C++)** عبر JNI + طبقة Java كجسر رقيق +
  singletons لكل حساب + حافلة أحداث مركزية + خيوط مخصصة لكل طابور عمل.
- **طريقة التحليل:** المانيفست + هيكل الحزم + قراءة مركزة للفئات الأساسية
  (`ConnectionsManager`، `NotificationCenter`، `DispatchQueue`، `FileLoader`، `AccountInstance`، `UserConfig`).

## 2. البنية المعمارية (أهم الحزم والطبقات)
```
┌──────────────────────────────────────────────────┐
│ UI (org.telegram.ui) — خارج نطاق التقرير         │
├──────────────────────────────────────────────────┤
│ Controllers (messenger): per-account singletons  │
│  AccountInstance → getX() لكل متحكم               │
├──────────────────────────────────────────────────┤
│ NotificationCenter — حافلة أحداث (pub/sub)       │
│ DispatchQueue — خيط+Looper لكل طابور             │
├──────────────────────────────────────────────────┤
│ tgnet/ConnectionsManager — جسر JNI               │
├──────────────────────────────────────────────────┤
│ النواة الأصلية C++ (MTProto) — غير موجودة هنا    │
└──────────────────────────────────────────────────┘
```
- `org.telegram.tgnet/` — مكدس **MTProto**: `ConnectionsManager`، `TLObject`/`TLRPC` (مخطط البروتوكول)،
  `NativeByteBuffer`، `TLClassStore`، `SerializedData`، `RequestDelegate`.
- `org.telegram.messenger/` — 372 ملفًا: المتحكمات، `NotificationCenter.java`، `FileLoader.java` (2375 سطرًا)،
  `DispatchQueue.java`، `UserConfig.java`، `ContactsController`، `DownloadController`، `LocationController`.
- `org.telegram.SQLite/` — غلاف SQLite مخصص بدوال أصلية (`SQLiteDatabase.beginTransaction(long)` native...).
- `org.telegram.messenger.voip/` — المكالمات: `Instance`، `NativeInstance`، `VoIPServiceState`، `ConferenceCall`.
- **نمط الحسابات المتعددة:** كل متحكم singleton لكل حساب عبر مصفوفة `Instance[]` مفهرسة برقم الحساب
  (`ConnectionsManager.getInstance(int)` بنمط double-checked locking)؛ `AccountInstance` يغلّفها،
  و`BaseController` يحمل `currentAccount`. **هذا هو أساس تعدد ملفات العائلة المقترح.**
- **نموذج الخيوط:** `DispatchQueue extends Thread` — خيط مخصص مع `Handler`/`Looper`،
  `CountDownLatch` للجهوزية، `postRunnable` / `postToFrontRunnable` / `cancelRunnable` / `cleanupQueue`.
  فصل صارم: طابور للرفع (`fileUploadQueue`)، طوابير للتنزيل، طابور التخزين.

## 3. الميزات الرئيسية وربطها بوحدات Family OS
| الميزة | الدليل في المخرجات | وحدة Family OS |
|---|---|---|
| محادثات/قنوات/مجموعات | `TLRPC.java` (~80 ألف سطر: مخطط TL الكامل)، `ChatObject` | التواصل الأساسي |
| إرسال/استقبال الوسائط | `FileLoader.loadFile()` بحمولات مخصصة (`ImageLocation`، `Document`، `WebFile`، `SecureDocument`) | مشاركة الوسائط العائلية |
| الإشعارات الفورية | `NotificationsService`، `GcmPushListenerService`، `KeepAliveJob`، `NotificationRepeat` | التنبيهات الأبوية |
| المكالمات | `voip/` + `CallReceiver` + `android.telecom.ConnectionService` | مكالمات العائلة |
| مشاركة الموقع الحي | `LocationController`، `LocationSharingService`، `ILocationServiceProvider` | تتبع العائلة (بديل Life360) |
| مزامنة جهات الاتصال | `ContactsController`، `ContactsSyncAdapterService`، `AuthenticatorService` | دليل العائلة |
| حسابات متعددة | `AccountInstance` + `UserConfig` (حقول: `loginTime`، `lastSendMessageId`، `draftsLoaded`...) | ملفات أفراد العائلة |
| البقاء حيًا | `BringAppForegroundService`، `KeepAliveJob`، `AppStartReceiver` | خدمة الحماية الدائمة |

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- **نمط `DispatchQueue`** — `org.telegram.messenger.DispatchQueue`:
  خيط + `Handler` مع انتظار الجهوزية، `postRunnable`/`cancelRunnable`/`cleanupQueue`،
  `getLastTaskTime()` لمراقبة الجمود. **أهم نمط قابل للنسخ** — يُفصل به كل حمل ثقيل
  (مزامنة/تخزين/شبكة) عن خيط الواجهة في Family OS.
- **حافلة الأحداث `NotificationCenter`** — `org.telegram.messenger.NotificationCenter`:
  مئات معرّفات الأحداث (`appDidLogout`، `messagesDidLoad`، `chatDidUpdate`...) مع API كامل:
  `addObserver(delegate, eventId)`، `postNotificationNameInternal(...)`،
  `postNotificationNameOnUIThread(...)`، `removeObserver(...)`. نمط pub/sub مركزي
  يغني عن شبكات الـ callbacks — يُنسخ كما هو للتواصل بين وحدات Family OS.
- **إدارة الاتصالات** — `org.telegram.tgnet.ConnectionsManager`:
  أنواع الاتصال (`ConnectionTypeGeneric=1`، `Download=2`، `Upload=4`، `Push=8`)،
  `DownloadConnectionsCount=8`، حالات الاتصال الخمس (`WaitingForNetwork`→`Connected`)،
  أعلام الطلبات (`RequestFlagCanCompress`، `RequestFlagTryDifferentDc`، `RequestFlagNeedQuickAck`...).
  تصميم جاهز لأي عميل بروتوكول مخصص.
- **طوابير الوسائط ذات الأولوية** — `org.telegram.messenger.FileLoader`:
  `largeFilesQueue` / `smallFilesQueue` (`FileLoaderPriorityQueue[]`)،
  `uploadOperationQueue` / `uploadSmallOperationQueue` (`LinkedList<FileUploadOperation>`)،
  و`loadFile()` مثقلة حسب النوع (صورة/مستند/ملف ويب). **نموذج جاهز** لمدير تنزيل Family OS
  (صور العائلة مقابل النسخ الاحتياطي).
- **مخطط البروتوكول** — `org.telegram.tgnet.TLRPC` (~80 ألف سطر): كل طرق وكائنات MTProto
  كفئات Java — مرجع بروتوكولي كامل لتصميم بروتوكول العائلة الداخلي.
- **التسلسل الثنائي** — `NativeByteBuffer` / `SerializedData` / `TLObject.serializeToStream`:
  تسلسل TL مدمج — يُقتبس لبروتوكول خفيف.
- **الجسر الأصلي:** ~30 دالة `native_*` (من `native_init` إلى `native_sendRequest`،
  `native_applyDatacenterAddress`، `native_checkProxy`) — النواة الثقيلة C++ وJava مجرد واجهة.
  **الدرس المعماري:** الأداء الحرج (تشفير/شبكة) يُنقل للأصلي، والمنطق يبقى في Java/Kotlin.

## 5. الصلاحيات والمكونات الحساسة
قائمة مرجعية شاملة لنموذج صلاحيات Family OS (~50 صلاحية): الكاميرا، الميكروفون،
الموقع (دقيق/خلفية/وسائط)، جهات الاتصال (قراءة/كتابة/مزامنة عبر `SyncAdapter`)، الهاتف،
التخزين، البلوتوث، `SYSTEM_ALERT_WINDOW`، `USE_FULL_SCREEN_INTENT`، خدمات أمامية بأنواعها،
`REQUEST_INSTALL_PACKAGES` (التحديث الذاتي). **دراسة حالة** في البقاء حيًا وإدارة البطارية
(`KeepAliveJob` + `BringAppForegroundService`) — تُدرس لوحدة الحماية دائمة العمل.

## 6. الشبكة ونقاط التكامل
- **البروتوكول:** MTProto عبر TCP مباشرة (sockets في النواة الأصلية) — لا REST؛
  مراكز بيانات متعددة (`native_applyDatacenterAddress`، `native_moveDatacenter`)،
  دعم البروكسي (`native_checkProxy`)، كاش DNS داخلي (TTL خمس دقائق)، استراتيجيات IP
  (`native_setIpStrategy`).
- **الدفع:** FCM (`GcmPushListenerService`) + Huawei Push (النوع 13 في `getRegId()`) +
  اتصال push مخصص دائم (`ConnectionTypePush=8`) — ثلاث طبقات احتياطية.
- **لا نقاط تكامل خارجية** بالمعنى التقليدي — النظام مغلق على خوادم تيليجرام؛
  القيمة هنا **معمارية** لا تكاملية.

## 7. توصيات إعادة الاستخدام
1. **انسخ الأنماط لا الكود:** `DispatchQueue` + `NotificationCenter` + singletons لكل حساب
   (`AccountInstance`/`BaseController`) — هذا هو "سر" قابلية التوسع على مستوى العميل،
   ويُبنى عليه هيكل Family OS (وحدة لكل فرد عائلة = "حساب").
2. **طوابير `FileLoader`** (كبيرة/صغيرة، رفع/تنزيل) — نموذج مباشر لمدير وسائط Family OS.
3. **استخدم `TLRPC` كمرجع** لتصميم بروتوكول العائلة الداخلي (أو تبنَّ MTProto إن لزم تشفير طرف-لطرف).
4. **نموذج الصلاحيات والبقاء حيًا** يُدرس لوحدة الحماية/التتبع دائمة العمل.
5. **لا تُعِد الاستخدام حرفيًا:** النواة الأصلية (`.so`) غائبة أصلًا، و`MessagesController` /
   `MessagesStorage` / `NotificationsController` أخفق فك ترجمتها — تُعاد كتابتها نظيفةً بالاعتماد على الأنماط.

## 8. ملاحظات (التشويش، حدود التحليل)
- أخفق jadx في 148 فئة — أخطرها `MessagesController` و`MessagesStorage` و`NotificationsController`
  (غائبة كليًا كملفات؛ مراجعها في `AccountInstance` وحزم مشوّشة مثل `a2/` و`ac/` تؤكد وجودها).
- ملفات `.so` الأصلية غائبة من `apktool-out` — النواة C++ غير قابلة للتحليل هنا
  (الـ 30 دالة `native_*` هي كل ما نراه منها).
- بعض الحزم مشوّشة الأسماء (`a2/`، `ac/`، `t/`...) — لم تُحلل.
- حزمة `org.telegram.ui` (الواجهات) خارج نطاق هذا التقرير — التركيز كان الطبقات التحتية
  (شبكة/تخزين/خيوط) لأنها مرجع التوسع المطلوب.
