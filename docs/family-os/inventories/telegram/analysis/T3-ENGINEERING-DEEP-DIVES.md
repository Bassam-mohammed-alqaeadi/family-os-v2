# التحليلات الهندسية المعمقة للمسارات الثلاثة — Telegram (T3 Engineering Deep Dives)

> **المعرف:** `T3-TG-DEEP-DIVES-001`
> **التطبيق:** Telegram (`telegram`) — v13.1.1
> **تاريخ التحديث:** 2026-11-04
> **حالة التحقق:** `Level A Code-Verified` للمسارات المفككة أدناه؛ الاستنتاجات موسومة صراحة
> **ملاحظة:** هذا أول تحليل يتتبع مسار التحديثات من JNI إلى الواجهة سطراً بسطر

---

## 1. منهجية التحقيق ومستويات الإثبات المعتمدة

- **المستوى A (Ground Truth):** الكود المفكك فعلياً (jadx/smali) المقروء سطراً بسطر — موسوم `[VERIFIED]`.
- **المستوى B (Derived):** نماذج مستخلصة من بنية الكود وتسمياته — موسومة `[INFERENCE]`.
- **المستوى C (Unverified):** ما يتطلب النواة الأصلية الغائبة أو جهازاً حياً — موسوم `غير محسوم`.
- **حدود الدليل والأمانة العلمية:** أي رقم سطر مذكور تم التحقق منه بالقراءة المباشرة؛
  الفئات الساقطة من jadx حُللت من smali وموسومة Partial.

---

## 2. المسار الهندسي الأول (Track A): آلتا الخيوط والأحداث

### 2.1 `DispatchQueue` — التشريح الكامل
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/telegram/jadx-out/sources/org/telegram/messenger/DispatchQueue.java` (الأسطر #L1-L159 — قُرئ كاملاً).
- **التشريح الهندسي:**
  - `extends Thread` + `Looper.prepare()` + `Handler` خاص لكل نسخة.
  - `CountDownLatch syncLatch` — بوابة جهوزية: كل نشر/إلغاء ينتظر `await()` أولاً (#L28–52).
  - `postRunnable(Runnable, long delayMs)`، `postToFrontRunnable` (عبر `postAtFrontOfQueue`)،
    `sendMessage(Message, delay)`، `cancelRunnable(s)`، `cleanupQueue()`، `recycle()` (#L54–158).
  - `lastTaskTime = SystemClock.elapsedRealtime()` عند كل نشر — `getLastTaskTime()` لمراقبة الجمود (#L64).
  - مُنشئ يقبل `threadPriority` ← `Process.setThreadPriority()` (#L140–158).
  - `indexPointer`/`index` — ترقيم عالمي للطوابير (#L12–13).
- **الطوابير المشتركة** [VERIFIED]: `Utilities.stageQueue` (`Utilities.java#L35,128`)؛
  `FileLoader.fileLoaderQueue` باسم `"fileUploadQueue"` (`FileLoader.java#L70`).
- **حدود الدليل:** سلوك `handleMessage` الافتراضي فارغ — يُورَّث عند الحاجة [INFERENCE].

### 2.2 `NotificationCenter` — التشريح الكامل
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/telegram/jadx-out/sources/org/telegram/messenger/NotificationCenter.java` (الأسطر #L1-L1529 — قُرئ كاملاً).
- **التشريح الهندسي:**
  - نسخة لكل حساب (`Instance[]`) + نسخة عامة (`globalInstance`) — #L1002–1022.
  - **348 حدثاً مُقاساً**: `didReceiveNewMessages = 1` + 347 تُسند في الكتلة الساكنة
    (`totalEvents = i10 + 347` #L903).
  - `SparseArray<ArrayList<NotificationCenterDelegate>> observers`؛ الواجهة
    `didReceivedNotification(int eventId, int accountId, Object... args)` (#L391–402).
  - **صرامة الخيط:** `RuntimeException` في DEBUG إذا نُشر من غير خيط الواجهة (#L1298–1300).
  - `broadcasting` + `removeAfterBroadcast`/`addAfterBroadcast` — تأجيل التعديل أثناء البث (#L1330–1350).
  - `setAnimationInProgress`/`onAnimationFinish` + `DelayedPost` + `EXPIRE_NOTIFICATIONS_TIME=5017ms` (#L1495–1529).
  - `postNotificationDebounced` + `alreadyPostedRunnubles` — إلغاء تكرار (#L1085–1091).
  - `PostponeNotificationCallback` — تعليق قابل للبرمجة (#L470–476).
  - `stopAllHeavyOperations`/`startAllHeavyOperations` + `heavyOperationsCounter` — بوابة العمليات الثقيلة (#L1241، #L1507).
  - `WeakObserversGroupImpl` — تسجيل `MEMORY_LEAK` عند بقاء مراقب ميت (#L490–520).
  - `listen(View, eventId, callback)` — ربط المراقب بدورة حياة الـ View (#L1204–1230).
- **حدود الدليل:** ترتيب استدعاء المراقبين = ترتيب التسجيل (غير مضمون تعاقدياً) [INFERENCE].

### 2.3 شبكة الحسابات `AccountInstance`
- **مستوى الإثبات:** **Level A**
- **المصدر المفحوص:** `rework/telegram/jadx-out/sources/org/telegram/messenger/AccountInstance.java` (الأسطر #L1-L117 — قُرئ كاملاً).
- **التشريح:** `Instance[4]` + double-checked locking (#L14–36)؛ 18 بوابة `getX()` مفهرسة
  برقم الحساب (#L38–116). `UserConfig` (727 سطراً): `selectedAccount`، `clientUserId`،
  `loginTime`، `lastSendMessageId`، `draftsLoaded`… (#L26–62).

---

## 3. المسار الهندسي الثاني (Track B): التحديثات والاتصالات والدفع

### 3.1 نقطة دخول JNI → stageQueue → processUpdates
- **مستوى الإثبات:** **Level A**
- **المصادر المفحوصة:**
  - `rework/telegram/jadx-out/sources/org/telegram/tgnet/ConnectionsManager.java`
    (#L1259–1284 `onUnparsedMessageReceived`؛ #L945–1000 `lambda$sendRequestInternal$8`؛ #L1310+ `lambda$sendRequest$6`).
  - `rework/telegram/apktool-out/smali/org/telegram/messenger/MessagesController.smali`
    (#L195161+ `processUpdates`؛ #L164757 `getDifference`).
- **التشريح الهندسي:**
  - `onUnparsedMessageReceived(ptr, account, msgId)`: `NativeByteBuffer.wrap(ptr)` ←
    `readInt32` (constructor) ← `TLRPC.Updates.TLdeserialize(...)` ← `KeepAliveJob.finishJob()`
    ← `Utilities.stageQueue.postRunnable(...)`. الرسائل المجهولة تُسجَّل (`"unknown constructor 0x%x"`).
  - `sendRequest`: `serializeToStream(NativeByteBuffer)` ← `native_sendRequest(...)`؛ الرد عبر
    `RequestDelegateInternal` ← `deserializeResponse(...)` ← stageQueue ← الـ delegate؛
    **الرد من نوع `TLRPC.Updates` يُوجَّه مباشرة إلى `processUpdates`** (#L938–941).
  - `sendRequestTypedAndProcessUpdates(TLMethod<TLRPC.Updates>, …)` (#L1698) — مساعد مخصص.
  - `processUpdates` (smali): تمييز `TL_updates` / `TL_updatesCombined` / `TL_updateShort*`؛
    `TL_updatesTooLong` ← `"need get diff"` ← `getDifference()`؛ فجوات seq ← `getDifference()`.
  - `onSessionCreated` ← `getDifference()` (#L916)؛ `onUpdate` ← `updateTimerProc()` (#L921)؛
    `onUpdateConfig` ← `updateConfig(TL_config)` (#L923).
  - `tLObject.freeResources()` بعد كل استجابة (#L943) — تحرير صريح.
- **حدود الدليل:** منطق دمج pts/seq التفصيلي في smali فقط (Partial)؛ سلوك النواة C++ غائب (C).

### 3.2 تعدد الاتصالات والأعلام
- **مستوى الإثبات:** **Level A** (`ConnectionsManager.java` #L80–112).
- **التشريح:** 5 أنواع (`Generic=1`، `Download=2`، `Download2=65538`، `Upload=4`، `Push=8`)؛
  5 حالات (`Connecting=1`، `WaitingForNetwork=2`، `Connected=3`، `ConnectingToProxy=4`، `Updating=5`)؛
  `DownloadConnectionsCount=8` (#L92)؛ 12 علَم طلب (`NeedQuickAck=128`، `DownloadByteBudget=262144`…).
  27+ دالة `native_*` (#L1078–1136) — Java مُنسِّق فقط.
- **المرونة** [VERIFIED]: تجاوز DNS عبر `GoogleDnsLoadTask` ثم `MozillaDnsLoadTask` مع خنق
  10 ثوانٍ (#L878–904)؛ `native_applyDatacenterAddress`/`native_moveDatacenter`؛
  بيئة الاختبار `"tapv3.stel.com"` (#L178)؛ `didUpdateConnectionState` ← الواجهة (#L782، #L1061).

### 3.3 الدفع ثلاثي الطبقات
- **مستوى الإثبات:** **Level A**
- **المصادر:** `GcmPushListenerService.smali` (#L475 `"p"` ← `PushListenerController.processRemoteMessage(2,…)`)؛
  `PushListenerController.smali` (#L4319 `aesIgeEncryption` لفك الحمولة)؛
  `PushType.smali` (`PUSH_TYPE_FIREBASE=0x2`، `PUSH_TYPE_HUAWEI=0xd`).
- **التشريح:** FCM يحمل حمولة **مشفرة بـ AES-IGE** (FCM لا يرى محتوى)؛ `KeepAliveJob`
  (JobIntentService — `startJob`/`finishJob`/`finishJobByTimeoutRunnable`) يُبقي العملية
  أثناء معالجة الدفعة ثم يُنهى.

---

## 4. المسار الهندسي الثالث (Track C): الوسائط والتشفير والتخزين

### 4.1 خط الوسائط بالأرقام
- **مستوى الإثبات:** **Level A**
- **المصادر:** `FileLoader.java` (2,375 سطراً — #L57–69 الطوابير، #L285–312 التهيئة، #L110–134 الرفع)؛
  `FileLoadOperation.smali` (#L448–470 الأرقام)؛ `FileLoaderPriorityQueue.smali` (#L7–15)؛
  `DownloadController.java` (1,802 سطراً).
- **التشريح:**
  - `smallFilesQueue[5]`/`largeFilesQueue[5]` — طابور أولوية لكل مركز بيانات.
  - الرفع متسلسل: سقف `currentUploadOperationsCount = 1` (+1 للصغير).
  - القطع: **32KB** عادي / **128KB** كبير / عتبة **10MB** / **توازي 4** طلبات.
  - الأولويات: `LOW=0` / `NORMAL=0x10000` / `MAX=0x100000`؛ `TYPE_SMALL=0` / `TYPE_LARGE=1`.
  - `DownloadController`: أقنعة `currentMobilePreset`/`currentRoamingPreset`/`currentWifiPreset`
    (#L45–47)؛ `canDownloadMedia(Type)` (#L665–692)؛ `loadAutoDownloadConfig`/`savePresetToServer`
    (#L1154/#L1277)؛ `DownloadRequestPacer` (17 سطراً) لتنظيم الإيقاع؛ جدول `download_queue` للاستمرارية.

### 4.2 حدود التشفير طرف-لطرف
- **مستوى الإثبات:** **Level A** (smali)
- **المصادر:** `SecretChatHelper.smali` (101 طريقة)؛ `Utilities.java` #L195–204
  (`aesIgeEncryption` عبر `private static native`)؛ `PushListenerController.smali` #L4319.
- **التشريح:** `EncryptedChat{auth_key (جهازي فقط)، key_hash (بصمة)، layer، participant_id}`؛
  `decryptWithMtProtoVersion` (#L1111)؛ `acceptSecretChat` (DH)؛ `applyPeerLayer`؛
  `createServiceSecretMessage`؛ جدول `enc_chats` محلي فقط — **لا مزامنة سحابية للسرية**.

### 4.3 التخزين: غلاف أصلي + WAL + تتبع الفجوات
- **مستوى الإثبات:** **Level A**
- **المصادر:** `org/telegram/SQLite/` (4 فئات، 454 سطراً — `SQLiteDatabase.java` #L1–115 قُرئ كاملاً)؛
  `MessagesStorage.smali` (861 طريقة — `cache4.db` #L190750، ~80 `CREATE TABLE`).
- **التشريح:** `opendb`/`beginTransaction`/`commitTransaction` كلها `native`؛
  `executeFast`/`queryFinalized`/`explainQuery`؛ **WAL** (`cache4.db-wal/shm`)؛
  جداول `requested_holes` + `params` = تتبع الفجوات التخزيني؛ `download_queue` للاستمرارية؛
  لا ORM — SQL خام مُعَدّ.

### 4.4 قائمة تحقق التوسع (13 نمطاً)
- **مستوى الإثبات:** **Level A** (كل نمط مربوط بدليل في §2–4.3)
- التسلسل المركزي، تعدد الاتصالات، الفروق لا اللقطات، الأغلفة المتدرجة، أعلام الطلبات،
  تجاوز DNS، الدفع المشفّر، القطع المُجرَّبة، إلغاء تكرار الإشعارات، `freeResources()`،
  مراقبة الجمود، WAL + المُعَدّات، النواة الحرجة أصلياً.
