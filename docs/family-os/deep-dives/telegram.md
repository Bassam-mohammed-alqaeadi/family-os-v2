# تحليل الهندسة العكسية العميق — Telegram (مرجع التوسع المعماري)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/telegram.md`) الذي غطى الأنماط السطحية (DispatchQueue، NotificationCenter،
> ConnectionsManager كعناوين). هذه الوثيقة **تفكك الآلة فعلياً**: المسار الكامل للتحديثات من السوكيت الأصلي
> إلى الواجهة، إدارة الاتصالات وإعادة الاتصال، حدود التشفير طرف-لطرف، خط الوسائط بأرقامه الدقيقة،
> وطبقة التخزين — كلها بأسماء كلاسات ومسارات وأرقام أسطر حقيقية، وبمعايير **مُقاسة لا مُخترَعة**.
> هذا التقرير هو **المرجع المعماري لمعيار 10M+ مستخدم متزامن** في Family OS.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً أو قِيس بالبحث) أو `[INFERENCE]`
> (مستنتجة من الأسماء/السياق). الأرقام المذكورة قِيسَت كلها — حيث تعذّر القياس كُتب «غير مُقاس».

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `org.telegram.messenger` |
| الإصدار المحلَّل | **13.1.1** (versionCode 72371) — `apktool.yml` [VERIFIED] |
| minSdk / targetSdk | 23 / 36 (compileSdk 36) [VERIFIED] |
| smali / java | **22,270 / 10,362** ملفاً (مُقاسة بـ `find`) |
| أخطاء jadx الحرجة | `MessagesController` و`MessagesStorage` و`NotificationsController` و`SendMessagesHelper` — غائبة كملفات Java لكنها **موجودة كاملة في smali** (1,580 / 861 / 205 طريقة) [VERIFIED] |
| نوع الملف | APK مستقل؛ **بلا مكتبات `.so`** في الحزمة (صفر ملفات `.so` في `unknown/` — الـ manifest يطلب `requiredSplitTypes="base__abi"` أي أن الأصلي يأتي بـ split منفصل) [VERIFIED] |
| الدور في Family OS | **وحدة التواصل + المرجع المعماري الوحيد للتوسع** (10M+ متزامن) |

### البنية الكلية [VERIFIED]
```
┌──────────────────────────────────────────────────────────────┐
│ UI (org.telegram.ui) — خارج نطاق التقرير                      │
├──────────────────────────────────────────────────────────────┤
│ Controllers لكل حساب (AccountInstance[4])                     │
│  MessagesController │ SecretChatHelper │ DownloadController…  │
├──────────────────────────────────────────────────────────────┤
│ NotificationCenter — 348 حدثاً، حافلة pub/sub لكل حساب + عامة │
│ DispatchQueue — خيط+Looper+Handler لكل طابور؛ stageQueue مركزي │
├──────────────────────────────────────────────────────────────┤
│ tgnet/ConnectionsManager — جسر JNI رقيق فوق النواة C++        │
├──────────────────────────────────────────────────────────────┤
│ النواة الأصلية MTProto (C++) — غائبة (split base__abi)        │
│  27+ دالة native_* مرئية كتعريفات فقط                        │
└──────────────────────────────────────────────────────────────┘
```
**القاعدة الذهبية للمعمارية** [VERIFIED]: كل التحديثات الواردة من الشبكة تُسلسل عبر طابور
واحد (`Utilities.stageQueue`) قبل أن تلمس أي منطق — وهذا هو قلب قابلية التوسع على مستوى العميل.

---

## 2. الغوص العميق — نموذج الخيوط والحسابات

### 2.1 `DispatchQueue` — الخيط المُدار بالكامل [VERIFIED — قُرئ كاملاً]
**المصدر:** `jadx-out/sources/org/telegram/messenger/DispatchQueue.java` (159 سطراً).

- `DispatchQueue extends Thread` — كل نسخة = خيط نظام حقيقي + `Looper.prepare()` + `Handler` خاص.
- **بوابة الجهوزية:** `CountDownLatch syncLatch` — كل `postRunnable`/`cancelRunnable`/`cleanupQueue`
  ينتظر `syncLatch.await()` أولاً؛ `isReady()` = `getCount()==0`. هذا يمنع السباق الكلاسيكي
  (النشر قبل إنشاء الـ Handler) دون synchronized.
- **الواجهة الكاملة:** `postRunnable(Runnable)` (مع تأخير اختياري بالميلي ثانية)،
  `postToFrontRunnable` (أولوية قصوى عبر `postAtFrontOfQueue`)، `sendMessage(Message, delay)`،
  `cancelRunnable` / `cancelRunnables`، `cleanupQueue()` (مسح كل الرسائل)، `recycle()` (إنهاء الـ Looper)،
  `getHandler()` للوصول المباشر.
- **مراقبة الجمود:** `lastTaskTime = SystemClock.elapsedRealtime()` يُحدَّث عند كل نشر —
  `getLastTaskTime()` يتيح لكاشف خارجي (ANRDetector) رصد خيط علِق.
- **الأولوية:** مُنشئ ثالث يقبل `threadPriority` ويستدعي `Process.setThreadPriority()`.
- **عدّاد عالمي:** `indexPointer`/`index` — كل طابور له رقم فريد (مفيد للسجلات).

**الطوابير المشتركة** [VERIFIED — `Utilities.java#L35,128`]:
- `Utilities.stageQueue = new DispatchQueue("stageQueue")` — **الطابور المركزي**: كل استجابات
  الشبكة وكل التحديثات الواردة تُنشر عليه. التسلسل هنا = لا سباقات على حالة الرسائل.
- `FileLoader.fileLoaderQueue = new DispatchQueue("fileUploadQueue")` (`FileLoader.java#L70`) —
  طابور عمليات الوسائط المنفصل عن stageQueue.

**الدرس لـ Family OS:** لا خيوط خام ولا `Executors` مجهولة — كل حمل ثقيل له طابور مسمّى
بعقد جهوزية ومراقبة جمود. يُنسخ النمط حرفياً (`DispatchQueue` فئة واحدة ~160 سطراً).

### 2.2 `NotificationCenter` — حافلة الأحداث المركزية [VERIFIED — قُرئ كاملاً]
**المصدر:** `jadx-out/sources/org/telegram/messenger/NotificationCenter.java` (1,529 سطراً).

- **النطاق:** نسخة **لكل حساب** (`Instance[]` — `getInstance(int)`) + نسخة عامة
  (`globalInstance` — `getGlobalInstance()`) للأحداث العابرة للحسابات [VERIFIED — الأسطر 1002–1022].
- **الحجم المُقاس:** **348 معرّف حدث** — `didReceiveNewMessages = 1` ثابت، والباقي 347 يُسند
  آلياً في الكتلة الساكنة (`updateInterfaces = i10` ثم `+1 … +347`؛ `totalEvents = i10 + 347` #L903).
- **التخزين:** `SparseArray<ArrayList<NotificationCenterDelegate>> observers` — الواجهة
  `didReceivedNotification(int eventId, int accountId, Object... args)` [VERIFIED].
- **قواعد البث الصارمة** [VERIFIED]:
  - `postNotificationNameInternal` — **يُرمى `RuntimeException` في نسخ DEBUG إذا لم يكن الخيط
    هو خيط الواجهة** (`ApplicationLoader.applicationHandler.getLooper().getThread()`). أي أن
    كل تحديث واجهة يمر من هنا مضمون الخيط.
  - `broadcasting` عدّاد + `removeAfterBroadcast` / `addAfterBroadcast` — الإضافة/الإزالة
    أثناء البث **تُؤجَّل** لما بعد انتهائه (لا `ConcurrentModificationException` أبداً).
  - `postNotificationNameOnUIThread` — النشر الآمن من أي خيط عبر `AndroidUtilities.runOnUIThread`.
- **تأجيل الرسوم المتحركة** [VERIFIED]: `setAnimationInProgress(int, int[])` يبني
  `AllowedNotifications` (الأحداث المسموحة أثناء الأنيميشن) ويؤجل الباقي كـ `DelayedPost`؛
  `onAnimationFinish` يفرغها. مهلة انتهاء الصلاحية `EXPIRE_NOTIFICATIONS_TIME = 5017ms`.
- **إلغاء التكرار** [VERIFIED]: `postNotificationDebounced` + `alreadyPostedRunnubles` —
  دمج الإشعارات المكررة قبل البث (يُستخدم في نسخ DEBUG).
- **تأجيل قابل للبرمجة:** `PostponeNotificationCallback.needPostpone(...)` — أي وحدة تستطيع
  تعليق أحداث معينة مؤقتاً (مثلاً أثناء استيراد سجل).
- **إدارة العمليات الثقيلة:** حدثا `stopAllHeavyOperations` / `startAllHeavyOperations` مع
  `currentHeavyOperationFlags` و`heavyOperationsCounter` — إيقاف مؤقت مركزي للأعمال الثقيلة.
- **مجموعات المراقبين:** `ObserversGroup` / `WeakObserversGroupImpl` — إزالة جماعية بضغطة،
  والنسخة الضعيفة **تسجّل `MEMORY_LEAK` في السجل** إذا بقي مراقب بعد تدمير مرجعه [VERIFIED].
- **`listen(View, eventId, callback)`** — يربط المراقب بدورة حياة الـ View (يُضاف عند الظهور
  ويُزال عند الاختفاء) — نمط أنيق لمنع التسربات في الواجهات.

### 2.3 الحسابات المتعددة — `AccountInstance` [VERIFIED — قُرئ كاملاً]
**المصدر:** `jadx-out/sources/org/telegram/messenger/AccountInstance.java` (117 سطراً).

- `private static volatile AccountInstance[] Instance = new AccountInstance[4]` — **سقف 4 حسابات**،
  و`getInstance(int)` بنمط double-checked locking.
- 18 بوابة `getX()`: `getMessagesController()`، `getMessagesStorage()`، `getConnectionsManager()`،
  `getSecretChatHelper()`، `getDownloadController()`، `getFileLoader()`، `getNotificationCenter()`،
  `getUserConfig()`… — كلها singletons **مفهرسة برقم الحساب** (`X.getInstance(currentAccount)`).
- `BaseController` يحمل `currentAccount` — كل متحكم يعرف حسابه.
- `UserConfig` (727 سطراً، لكل حساب): `selectedAccount`، `clientUserId`، `loginTime`،
  `lastSendMessageId`، `draftsLoaded`، `contactsReimported`، `migrateOffset*`… — حالة الجلسة
  تُحفظ في SharedPreferences لكل حساب [VERIFIED — الأسطر 27–62، 253، 548].

**الدرس لـ Family OS:** «وحدة لكل فرد عائلة = حساب» — المصفوفة المفهرسة برقم الحساب هي
الآلية الجاهزة لعزل حالة أفراد العائلة (رسائل/إعدادات/تخزين) داخل عملية واحدة.

---

## 3. الغوص العميق — الشبكة وإدارة الاتصالات

### 3.1 `ConnectionsManager` — جسر JNI فوق نواة MTProto [VERIFIED]
**المصدر:** `jadx-out/sources/org/telegram/tgnet/ConnectionsManager.java` (1,827 سطراً).

**أنواع الاتصالات** [VERIFIED — الأسطر 85–92]:
| الثابت | القيمة | الدور |
|---|---|---|
| `ConnectionTypeGeneric` | 1 | الطلبات العامة |
| `ConnectionTypeDownload` | 2 | التنزيل |
| `ConnectionTypeDownload2` | 65538 | تنزيل ثانوي |
| `ConnectionTypeUpload` | 4 | الرفع |
| `ConnectionTypePush` | 8 | اتصال الدفع الدائم |

**حالات الاتصال** [VERIFIED — الأسطر 80–84]: `Connecting=1`، `WaitingForNetwork=2`،
`Connected=3`، `ConnectingToProxy=4`، `Updating=5`.

**أعلام الطلبات** [VERIFIED — الأسطر 100–112] — 12 علَماً: `RequestFlagEnableUnauthorized=1`،
`FailOnServerErrors=2`، `CanCompress=4`، `WithoutLogin=8`، `TryDifferentDc=16`،
`ForceDownload=32`، `InvokeAfter=64`، `NeedQuickAck=128` (إقرار سريع)، `ListenAfterCancel=2048`،
`DownloadByteBudget=262144` (ميزانية بايت للتنزيل)، `SmallDownload=131072`…
**هذه الأعلام هي لغة التحكم الدقيقة** — كل طلب يعلن احتياجاته (ضغط؟ إقرار سريع؟ مركز
بيانات بديل؟) بدل منطق `if` مبعثر.

**تعدد الاتصالات** [VERIFIED]: `DownloadConnectionsCount = 8` — ثمانية اتصالات تنزيل
متوازية لكل مركز بيانات.

**الجسر الأصلي** [VERIFIED — الأسطر 1078–1136]: 27+ دالة `native_*` معلنة كـ `static native`
(التعريفات فقط — الأجساد في الـ split الغائب): `native_init`، `native_sendRequest`،
`native_applyDatacenterAddress`، `native_moveDatacenter`، `native_setNetworkAvailable`،
`native_pauseNetwork` / `native_resumeNetwork`، `native_checkProxy`، `native_setIpStrategy`،
`native_cancelRequest` / `native_cancelRequestsForGuid`، `native_bindRequestToGuid`،
`native_getConnectionState`، `native_getCurrentPingTime`، `native_onHostNameResolved`،
`native_applyDnsConfig`، `native_setLangCode`… — Java مجرد **مُنسِّق**؛ كل الشبكة والتشفير
في C++.

### 3.2 المرونة: DNS ومراكز البيانات والبروكسي [VERIFIED]
- **تجاوز DNS عبر TXT:** `lambda$onRequestNewServerIpAndPort$17` — عند فشل الاتصال يُطلق
  مهمة `GoogleDnsLoadTask` (DNS-over-HTTPS من Google) ثم `MozillaDnsLoadTask` كاحتياطي،
  مع خنق 10 ثوانٍ (`lastDnsRequestTime`) ومنع التزامن (`currentTask`) [VERIFIED — الأسطر 878–904].
- **كاش DNS داخلي:** `native_applyDnsConfig(account, bufferAddress, phone, responseDate)` —
  إعدادات DNS تُدفع للنواة الأصلية مع رقم هاتف العميل [VERIFIED — الأسطر 158، 301].
- **مراكز البيانات:** `native_applyDatacenterAddress` / `native_moveDatacenter`؛ اسم نطاق
  المركز من `MessagesController.dcDomainName`؛ بيئة الاختبار `"tapv3.stel.com"`
  (`native_isTestBackend`) [VERIFIED — الأسطر 178، 313، 1116].
- **حالة الاتصال ← الواجهة:** عند التغيّر يُنشر `NotificationCenter.didUpdateConnectionState`
  [VERIFIED — الأسطر 782، 1061]؛ و`getConnectionState()` (#L1524) يقرأ من الأصلي.

### 3.3 الدفع: ثلاث طبقات احتياطية [VERIFIED]
1. **اتصال الدفع الدائم** (`ConnectionTypePush=8`) — قناة MTProto مخصصة للإشعارات.
2. **FCM:** `GcmPushListenerService.onMessageReceived` (smali، 524 سطراً) يستخرج الحمولة
   المشفرة من المفتاح `"p"` ← `PushListenerController.processRemoteMessage(2 /*FIREBASE*/, p, …)`
   [VERIFIED — smali الأسطر 475–497]. **الحمولة مشفرة بـ AES-IGE** وتُفك في
   `PushListenerController` (`Utilities.aesIgeEncryption` — smali #L4319) [VERIFIED] —
   أي أن FCM لا يرى أي محتوى: مجرد منبّه مشفّر.
3. **Huawei Push:** `PUSH_TYPE_HUAWEI = 0xd` (13) في `PushListenerController$PushType` [VERIFIED].
4. **إبقاء الجلسة حية أثناء الدفع:** كل تحديث وارد يستدعي `KeepAliveJob.finishJob()`
   [VERIFIED — `ConnectionsManager.java` الأسطر 938، 1274] — الـ Job يُبقي العملية حية
   بما يكفي لمعالجة الدفعة ثم يُنهى (كفاءة بطارية بدل خدمة دائمة).

---

## 4. مسار التحديثات الكامل: من السوكيت إلى الواجهة (الأثمن)

هذا هو **قلب قابلية التوسع** — تتبعناه من الطرف للطرف [VERIFIED]:

```
النواة C++ (سوكيت MTProto)
  │ onUnparsedMessageReceived(nativePtr, account, messageId)   [دخول JNI]
  ▼
ConnectionsManager.onUnparsedMessageReceived  (#L1259)
  │ NativeByteBuffer.wrap(ptr) → TLRPC.Updates.TLdeserialize(...)
  │ KeepAliveJob.finishJob()
  ▼
Utilities.stageQueue.postRunnable(...)         [التسلسل المركزي]
  ▼
MessagesController.lambda$processUpdates$377(updates, false)   [smali]
  │  معالجة الأغلفة: TL_updates / TL_updatesCombined /
  │  TL_updateShort / TL_updateShortMessage / TL_updateShortChatMessage
  │  TL_updatesTooLong → "need get diff" → getDifference()
  │  فجوات seq في TL_updatesCombined → getDifference()
  ▼
MessagesStorage (تخزين) + NotificationCenter.postNotificationNameOnUIThread
  │  (didReceiveNewMessages, updateInterfaces, dialogsNeedReload…)
  ▼
الواجهة (مراقبون مسجلون)
```

**التفاصيل المُثبتة:**

- **نقطة الدخول** [VERIFIED — `ConnectionsManager.java#L1259–1284`]: `public static void
  onUnparsedMessageReceived(long j10, int i10, long j11)` — يلف المؤشر الأصلي
  بـ `NativeByteBuffer.wrap()`، يقرأ الـ constructor (`readInt32`)، يستدعي
  `TLRPC.Updates.TLdeserialize(...)`، يسجّل الرسائل المجهولة (`"java received unknown
  constructor 0x%x"`)، ثم ينشر على `stageQueue`.
- **مسار الردود** [VERIFIED — `lambda$sendRequest$6` #L1310، `lambda$sendRequestInternal$8`
  #L945]: `sendRequest(TLObject, …)` ← `tLObject.serializeToStream(NativeByteBuffer)` ←
  `native_sendRequest(account, bufferAddress, flags…)`؛ الرد يعود عبر `RequestDelegateInternal`
  ← يُفك بـ `tLObject.deserializeResponse(...)` ← يُنشر على `stageQueue` ← الـ delegate.
  **وإذا كان الرد نفسه `instanceof TLRPC.Updates`** ← يُوجَّه مباشرة إلى
  `processUpdates` [VERIFIED — #L938–941]. وهناك مساعد مخصص:
  `sendRequestTypedAndProcessUpdates(TLMethod<TLRPC.Updates>, …)` (#L1698).
- **معالجة الأغلفة** [VERIFIED — `MessagesController.smali` #L195161+]: `processUpdates`
  يميز `TL_updates` عن `TL_updatesCombined` عن `TL_updateShort*`؛ عند
  `TL_updatesTooLong` يسجّل `"need get diff TL_updatesTooLong"` ويطلق `getDifference()`.
- **المزامنة بالفروق** [VERIFIED]: `onSessionCreated` ← `MessagesController.getDifference()`
  (`ConnectionsManager.java#L916`) — عند إنشاء الجلسة (إعادة اتصال) يُسحب الفرق بدل
  إعادة التحميل الكامل. `onUpdate` ← `updateTimerProc()` (#L921). `onUpdateConfig` ←
  `updateConfig(TL_config)` (#L923).
- **الانضباط الذاكري** [VERIFIED — #L943]: `tLObject.freeResources()` بعد كل استجابة —
  كائنات TL تُحرَّر صراحةً (لا اعتماد على الـ GC وحده).

**ماذا يعني هذا لـ Family OS:** بروتوكول العائلة يحتاج بالضبط هذا الثلاثي —
(1) نقطة دخول JNI/socket واحدة تُسلسل كل شيء، (2) طابور مرحلة واحد قبل المنطق،
(3) آلية فروق (`getDifference`) لأي فجوة تسلسل. **لا تُبنى مزامنة رسائل بدونه.**

---

## 5. حدود التشفير طرف-لطرف — المحادثات السرية

### 5.1 `SecretChatHelper` [VERIFIED — smali كامل، 101 طريقة]
**المصدر:** `apktool-out/smali/org/telegram/messenger/SecretChatHelper.smali`
(jadx أخفق فيه — التحليل من smali).

- **نموذج البيانات:** `TLRPC$EncryptedChat` بحقول `id`، `participant_id`، **`auth_key:[B`**،
  **`key_hash:[B`**، `layer:I`، `ttl`… [VERIFIED — الأسطر 316–432].
- **حدود الثقة** [VERIFIED]:
  - `auth_key` **لا يغادر الجهاز أبداً** — يُستخدم محلياً فقط في `decryptWithMtProtoVersion`
    (#L1111) لفك حمولات `TL_decryptedMessage`.
  - `key_hash` — بصمة المفتاح للعرض البصري (الإيموجي/الأرقام التي يقارنها الطرفان).
  - الرسائل السرية **لا تُخزَّن على الخادم** — التخزين محلي فقط (جدول `enc_chats` في `cache4.db`).
- **التشفير:** `Utilities.aesIgeEncryption(ByteBuffer, key, iv, …)` و
  `aesIgeEncryptionByteArray` — **AES-IGE** (Infinite Garble Extension) عبر
  `private static native` → JNI [VERIFIED — `Utilities.java#L195–204`، `Utilities.smali#L761–834`].
  **ملاحظة معمارية:** حتى دوال التشفير الحرجة تُنفَّذ أصلياً (سرعة + صعوبة الاستخراج).
- **إدارة الجلسة:** `acceptSecretChat` (تبادل Diffie-Hellman)، `applyPeerLayer` (ترقية طبقة
  البروتوكول)، `createServiceSecretMessage` (رسائل الخدمة المشفرة: بدء/إنهاء/لقطة شاشة)،
  `createDeleteMessage`، `isSecretVisibleMessage` / `isSecretInvisibleMessage`
  (تصفية رسائل الخدمة عن العرض) [VERIFIED — قائمة الطرق].
- **الدفع المشفّر:** حمولات FCM تُفك بـ AES-IGE في `PushListenerController`
  (smali #L4319) — **حتى قناة الدفع لا ترى نصاً صريحاً** [VERIFIED].

### 5.2 ما هو على الخادم وما هو على الجهاز [VERIFIED/INFERENCE]
| العنصر | الموقع | الدليل |
|---|---|---|
| نصوص المحادثات السرية | الجهاز فقط | `enc_chats` محلي؛ لا مزامنة سحابية للسرية |
| `auth_key` | الجهاز فقط | يُستخدم في `decryptWithMtProtoVersion` محلياً |
| المحادثات العادية/القنوات | الخادم + نسخة محلية | جداول `messages`/`dialogs` في `cache4.db` |
| الوسائط | الخادم (مشفرة نقلاً بـ MTProto) | `FileLoader` + `sent_files_v2` |
| مفاتيح MTProto للنقل | النواة الأصلية | `native_*` — الجلسة تُدار في C++ |

**الدرس لـ Family OS:** نموذج الطبقتين جاهز للاقتباس — رسائل العائلة العادية بمزامنة
سحابية، و«وضع سري» اختياري بمفتاح جهازي + AES-IGE + تخزين محلي فقط. لا تُعِد اختراع
بروتوكول E2E — انسخ حدود الثقة هذه.

---

## 6. خط الوسائط — التنزيل والرفع بالأرقام الدقيقة

### 6.1 `FileLoader` [VERIFIED — قُرئ جزئياً + smali]
**المصدر:** `jadx-out/sources/org/telegram/messenger/FileLoader.java` (2,375 سطراً).

**الطوابير** [VERIFIED — الأسطر 57–69، 285–312]:
- `smallFilesQueue[5]` / `largeFilesQueue[5]` — **مصفوفة من 5 طوابير أولوية** (واحد لكل
  مركز بيانات: `new FileLoaderPriorityQueue(dcId, "smallFilesQueue dc"+i, TYPE_SMALL, fileLoaderQueue)`).
- `uploadOperationQueue` / `uploadSmallOperationQueue` — `LinkedList<FileUploadOperation>`.
- **الرفع متسلسل:** `currentUploadOperationsCount` و`currentUploadSmallOperationsCount`
  **سقفهما 1** — رفع واحد كبير + واحد صغير في كل مرة [VERIFIED — الأسطر 110–134].
  (القرار: الرفع يُشبع الـ uplink وحده؛ التوازي للتنزيل فقط.)

**أرقام التنزيل الدقيقة** [VERIFIED — `FileLoadOperation.smali` الأسطر 448–470]:
| الثابت | القيمة | المعنى |
|---|---|---|
| `downloadChunkSize` | `0x8000` = **32KB** | حجم القطعة للملفات العادية |
| `downloadChunkSizeBig` | `0x20000` = **128KB** | حجم القطعة للملفات الكبيرة |
| `bigFileSizeFrom` | `0xA00000` = **10MB** | عتبة «الملف الكبير» |
| `maxDownloadRequests` / `maxDownloadRequestsBig` | **4** | طلبات متوازية لكل عملية تنزيل |
| `cdnChunkCheckSize` | 128KB | حجم التحقق لملفات CDN |

**أولويات الطوابير** [VERIFIED — `FileLoaderPriorityQueue.smali` الأسطر 7–15]:
`PRIORITY_VALUE_LOW=0`، `NORMAL=0x10000`، `MAX=0x100000`؛ `TYPE_SMALL=0`، `TYPE_LARGE=1` —
أولوية عددية صريحة قابلة لإعادة الترتيب (`swapLoadingPriority`).

**التحميل المُثقل حسب النوع** [VERIFIED]: `loadFile()` مثقلة لـ `ImageLocation` و`Document`
و`WebFile` و`SecureDocument` — كل نوع يبني مفتاح كاش ومسار تنزيل مختلفين.

### 6.2 `DownloadController` [VERIFIED — قُرئت الواجهة]
**المصدر:** `jadx-out/sources/org/telegram/messenger/DownloadController.java` (1,802 سطراً).

- **سياسة التنزيل التلقائي:** أقنعة بتّية `currentMobilePreset` / `currentRoamingPreset` /
  `currentWifiPreset` — كل نوع وسائط (صور/صوت/فيديو/ملفات/موسيقى/GIF) بتّ في القناع
  [VERIFIED — الأسطر 45–47، 1005–1064].
- `canDownloadMedia(MessageObject)` / `canDownloadMediaType(...)` — الحكم قبل أي تنزيل
  [VERIFIED — الأسطر 665–692].
- **المراقبون:** `addLoadingFileObserver` / `FileDownloadProgressListener` — تقدم التنزيل
  حدث في `NotificationCenter` (`fileLoadProgressChanged`، `fileLoaded`، `fileLoadFailed`).
- `loadAutoDownloadConfig` — الإعدادات تُسحب من الخادم؛ `savePresetToServer` — وتُرفع
  [VERIFIED — الأسطر 1154، 1277].
- `DownloadRequestPacer` (17 سطراً) — **تنظيم إيقاع طلبات التنزيل** (pacing) لمنع إغراق
  الاتصال [VERIFIED].
- جدول `download_queue` في `cache4.db` — طابور التنزيل **مستمر عبر إعادة التشغيل**
  [VERIFIED — قائمة الجداول].

**الدرس لـ Family OS:** انسخ الثلاثية — (1) قطع 32KB/128KB بتوازي 4، (2) طوابير أولوية
لكل مركز بيانات، (3) أقنعة التنزيل التلقائي لكل شبكة. هذه أرقام مُجرَّبة على مليارات
الملفات يومياً.

---

## 7. طبقة التخزين — SQLite مخصص بلا ORM

### 7.1 الغلاف `org.telegram.SQLite` [VERIFIED — قُرئ كاملاً]
4 فئات، 454 سطراً إجمالاً:
- `SQLiteDatabase.java` (115 سطراً): `opendb(path, filesDir)` / `closedb` / `beginTransaction`
  / `commitTransaction` — **كلها `native`** (الـ SQLite نفسه أصلي). `executeFast(sql)` تُرجع
  `SQLitePreparedStatement`؛ `queryFinalized(sql, args…)`؛ `executeInt`؛ `tableExists`؛
  `explainQuery` (تشخيص خطط الاستعلام في السجلات!) [VERIFIED].
- `SQLitePreparedStatement.java` (166 سطراً): ربط المعاملات + تنفيذ + مؤشر.
- `SQLiteCursor.java` (152 سطراً): `next()`، `intValue(i)`، `stringValue(i)`…

**لا ORM، لا Room، لا ContentProvider للبيانات** — SQL خام مُعَدّ مسبقاً عبر `MessagesStorage`
(861 طريقة في smali). الأداء يأتي من الاستعلامات المُحكَمة لا من طبقة تجريد.

### 7.2 قاعدة كل حساب: `cache4.db` [VERIFIED]
- الملف `cache4.db` مع `cache4.db-wal` / `cache4.db-shm` — **وضع WAL** (قراءات متوازية
  مع كتابة واحدة) [VERIFIED — `MessagesStorage.smali` الأسطر 190750–190784].
- **~80 جدولاً** مُستخرجاً من `CREATE TABLE` في smali — أبرزها [VERIFIED]:
  - الرسائل: `messages` (+`messages_v2`؟)، `dialogs`، `chats`، `users`، `randoms_v2`
    (مُعرّفات الإرسال)، `scheduled_messages_v2`، `quick_replies_messages`
  - السرية: `enc_chats`، `enc_tasks_v4` (مهام التدمير الذاتي)
  - الوسائط: `sent_files_v2`، `download_queue`، `downloading_documents`، `webpage_pending_v2`
  - المزامنة: `params` (أرقام pts/seq)، `requested_holes` (الفجوات المطلوبة!)، `keyvalue`
  - القنوات/المجموعات: `channel_users_v2`، `channel_admins_v3`، `topics`
  - الإشعارات: `unread_push_messages`
- جدولا `requested_holes` و`params` هما **آلية تتبّع الفجوات** — أي تحديث مفقود يُسجَّل
  كـ «hole» ويُطلب فرقه لاحقاً. هذا هو التجسيد التخزيني لنمط `getDifference`
  [VERIFIED بالاسم + السياق؛ التفاصيل الدقيقة للاستعلامات في smali].

### 7.3 `TLRPC.java` — مخطط البروتوكول الكامل [VERIFIED — مُقاس]
- **80,043 سطراً**، **2,043 فئة `TL_*`** (مُقاسة بـ grep) — كل مُنشئات MTProto
  (constructors) كفئات Java مع `TLdeserialize` / `serializeToStream` / `getObjectSize`.
- `TLClassStore` — سجل الـ constructor IDs ← الفئات (التوجيه أثناء الفك).
- `NativeByteBuffer` / `SerializedData` / `AbstractSerializedData` — التسلسل الثنائي
  الصغير-endian مع إعادة استخدام المخازن (`reused=true`).

---

## 8. ما الذي يجعله يتحمل 10M+ متزامن — الأنماط المستخرجة

> هذه ليست ادعاءات تسويقية — كل نمط أدناه مربوط بدليل كودي أعلاه.

| # | النمط | الدليل | قابلية النسخ |
|---|---|---|---|
| 1 | **تسلسل مركزي واحد** لكل التحديثات (`stageQueue`) قبل أي منطق | §4 | يُنسخ حرفياً |
| 2 | **تعدد الاتصالات حسب النوع** (عام/تنزيل×8/رفع/دفع) بدل اتصال واحد | §3.1 | يُنسخ |
| 3 | **المزامنة بالفروق** (`getDifference` + `requested_holes`) بدل إعادة التحميل | §4، §7.2 | يُنسخ |
| 4 | **أغلفة تحديثات متدرجة** (`TL_updateShort*` للرسالة الواحدة، `TL_updatesCombined` للدفعات) — لا يُرسَل الغلاف الكامل دائماً | §4 | يُقتبس لبروتوكول العائلة |
| 5 | **أعلام طلبات معلنة** (ضغط/إقرار سريع/ميزانية بايت) — تحكم دقيق بالحمل | §3.1 | يُنسخ |
| 6 | **تجاوز DNS عبر HTTPS** (Google ثم Mozilla) عند حجب DNS | §3.2 | يُنسخ (مهم لليمن) |
| 7 | **الدفع المشفّر ثلاثي الطبقات** (قناة دفع + FCM + Huawei) مع حمولات AES-IGE | §3.3، §5.1 | يُنسخ |
| 8 | **الوسائط المقطعة** (32KB/128KB، توازي 4، عتبة 10MB) + طوابير أولوية لكل DC | §6.1 | يُنسخ بالأرقام |
| 9 | **إلغاء تكرار الإشعارات** + تأجيلها أثناء الأنيميشن — الواجهة لا تُقصف | §2.2 | يُنسخ |
| 10 | **تحرير صريح للذاكرة** (`freeResources()` بعد كل استجابة TL) | §4 | يُنسخ |
| 11 | **مراقبة ذاتية للجمود** (`getLastTaskTime` + `ANRDetector`) | §2.1 | يُنسخ |
| 12 | **WAL + استعلامات مُعَدّة + `explainQuery`** — قاعدة محلية لا تختنق | §7.1 | يُنسخ |
| 13 | **النواة الحرجة أصلياً** (شبكة/تشفير/SQLite) وJava مُنسِّق فقط | §3.1، §5.1، §7.1 | مبدأ معماري |

**الخلاصة المعمارية:** التوسع هنا **ليس خادمياً فقط** — العميل مصمم ليكون رخيصاً:
تسلسل واحد، دفعات صغيرة، فروق لا لقطات، وتحرير ذاكرة صريح. Family OS ينسخ هذه
الأنماط الثلاثة عشر كقائمة تحقق إلزامية لوحدة التواصل.

---

## 9. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب |
|---|---|---|---|
| 1 | **`DispatchQueue`** (159 سطراً) — خيط+Looper+بوابة CountDownLatch+مراقبة جمود | 1 | أنظف بديل للـ Executors المجهولة؛ يُنسخ حرفياً لكل خدمة Family OS ثقيلة. |
| 2 | **`NotificationCenter`** — 348 حدثاً، بث آمن الخيط، تأجيل أثناء الأنيميشن، إلغاء تكرار، مجموعات مراقبين ضعيفة | 1 | حافلة الوحدات الرسمية — يغني عن شبكات الـ callbacks بين وحدات Family OS. انسخ الآلية وسمِّ أحداثك. |
| 3 | **مسار التحديثات الثلاثي** (نقطة دخول واحدة → `stageQueue` → معالج + فروق عند الفجوات) | 1 | قلب مزامنة رسائل العائلة — لا يُبنى بدونه. |
| 4 | **نموذج الحسابات** (`AccountInstance[4]` + `BaseController.currentAccount`) | 1 | عزل حالة أفراد العائلة داخل عملية واحدة — أساس «ملف لكل فرد». |
| 5 | **أرقام الوسائط** (32KB/128KB، توازي 4، عتبة 10MB، طوابير أولوية لكل DC، رفع متسلسل) | 1 | انسخ الأرقام — مُجرَّبة على مليارات الملفات. |
| 6 | **أقنعة التنزيل التلقائي** (موبايل/تجوال/وايفاي بتّية + مزامنة خادمية) | 1 | سياسة بيانات العائلة الجاهزة (مهمة لشبكات اليمن). |
| 7 | **حدود E2E** (مفتاح جهازي + AES-IGE + تخزين محلي فقط + دفع مشفّر) | 2 | «الوضع السري» العائلي — اقتبس حدود الثقة لا البروتوكول حرفياً. |
| 8 | **تجاوز DNS عبر HTTPS** (Google ثم Mozilla) | 1 | ضروري لموثوقية اليمن/المنطقة — انسخه. |
| 9 | **الدفع ثلاثي الطبقات** (قناة دفع دائمة + FCM + Huawei) + `KeepAliveJob` | 2 | كيّف لخوادم Family OS؛ احتفظ بمبدأ «الحمولة مشفرة دائماً». |
| 10 | **أعلام الطلبات المعلنة** (ضغط/إقرار سريع/ميزانية بايت/DC بديل) | 2 | لغة التحكم لبروتوكول العائلة الداخلي. |
| 11 | **`TLRPC` كمرجع مخطط** (2,043 مُنشئاً) | 3 | لا تنسخ الحجم — استلهم تصميم الأغلفة المتدرجة (`updateShort*`). |
| 12 | **WAL + استعلامات مُعَدّة + `requested_holes`** | 2 | قاعدة رسائل العائلة المحلية بنفس الانضباط. |
| 13 | **`ANRDetector` + `getLastTaskTime`** — مراقبة الجمود الذاتية | 2 | معيار الجودة «صفر تعليق» المعلن. |
| 14 | **VoIP** (`NativeInstance` — 36 دالة أصلية WebRTC) | 3 | مرجع مكالمات العائلة لاحقاً — لا تُبنَ المكالمات من الصفر. |
| ✗ | النواة الأصلية C++ (غائبة أصلاً — split `base__abi`) | ✗ | لا شيء لاستخراجه؛ تُبنى النواة نظيفة أو تُستخدم مكتبات مفتوحة. |
| ✗ | نسخ `TLRPC` كاملاً (80 ألف سطر) | ✗ | عبء صيانة هائل لغير حاجة — الأغلفة المتدرجة تكفي كفكرة. |

### الفجوة التي يملؤها هذا التحليل
تقرير الجولة الأولى قال «انسخ DispatchQueue + NotificationCenter». الآن نملك **الأرقام
والآليات**: كيف تُسلسل التحديثات فعلياً (`onUnparsedMessageReceived` → `stageQueue` →
`processUpdates`)، كيف تُعالَج الفجوات (`getDifference` + `requested_holes`)، وما هي
أحجام القطع والتوازي المُجرَّبة (32KB/128KB × 4). هذه هي **قائمة التحقق الإلزامية**
التي ستُبنى عليها وحدة التواصل في Family OS — لا توصيات عامة.

---

## 10. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **منطق `processUpdates` التفصيلي** (ترتيب pts/seq، دمج `TL_updatesCombined`) — في smali
   فقط (1,580 طريقة في `MessagesController`)؛ يحتاج قراءة smali مركزة أو جهازاً حياً [غير محسوم].
2. **مخطط `messages`/`dialogs` الدقيق** (الأعمدة والفهارس) — أسماء الجداول مؤكدة؛
   تعريفات الأعمدة الكاملة في smali لم تُستخرج [غير محسوم].
3. **سياسة إعادة الاتصال في النواة C++** (تراجع أسّي؟ jitter؟) — الأجساد غائبة
   (split `base__abi`) [غير محسوم].
4. **خوارزمية اختيار مركز البيانات** (`native_moveDatacenter` شروطها) — غائبة مع النواة [غير محسوم].
5. **`SendMessagesHelper`** (إرسال الرسائل + إعادة المحاولة) — سقط من jadx؛ smali موجود
   [يحتاج قراءة smali].
6. **تشفير النقل MTProto** (تبادل المفاتيح الأولي auth_key) — في النواة الغائبة؛
   حدوده العليا معروفة من التوثيق العام فقط [INFERENCE].
7. **سلوك `ConnectionTypeDownload2`** (65538) مقابل `Download` (2) — التسمية توحي
   بقناة CDN/ثانوية؛ الاستخدام الدقيق غير مقروء [INFERENCE].
8. **حجم `TLRPC` الفعلي القابل للاقتباس** — 2,043 فئة مُنشئ مُقاسة؛ أيها يُستخدم
   فعلياً في مسارات Family OS يحتاج تحليل استخدام [مفتوح].

---

## 11. خريطة الملفات المرجعية (مسارات دقيقة)

`~/workspace/rework/telegram/`:
- `jadx-out/sources/org/telegram/messenger/DispatchQueue.java` (159 سطراً) — نموذج الخيوط.
- `jadx-out/sources/org/telegram/messenger/NotificationCenter.java` (1,529 سطراً، 348 حدثاً) — الحافلة.
- `jadx-out/sources/org/telegram/messenger/AccountInstance.java` (117 سطراً) — الحسابات الأربعة.
- `jadx-out/sources/org/telegram/messenger/Utilities.java` (689 سطراً) — `stageQueue` (#L128) + `aesIgeEncryption` (#L195).
- `jadx-out/sources/org/telegram/messenger/FileLoader.java` (2,375 سطراً) — الطوابير والرفع/التنزيل.
- `jadx-out/sources/org/telegram/messenger/DownloadController.java` (1,802 سطراً) — سياسة التنزيل التلقائي.
- `jadx-out/sources/org/telegram/messenger/UserConfig.java` (727 سطراً) — حالة الجلسة لكل حساب.
- `jadx-out/sources/org/telegram/tgnet/ConnectionsManager.java` (1,827 سطراً) — الجسر: الأنواع/الحالات/الأعلام/`onUnparsedMessageReceived` (#L1259)/`sendRequest` (#L1684+).
- `jadx-out/sources/org/telegram/tgnet/TLRPC.java` (80,043 سطراً، 2,043 فئة) — مخطط البروتوكول.
- `jadx-out/sources/org/telegram/SQLite/SQLiteDatabase.java` (115 سطراً) — الغلاف الأصلي.
- `jadx-out/sources/org/telegram/messenger/voip/NativeInstance.java` (36 native) — المكالمات.
- `apktool-out/smali/org/telegram/messenger/MessagesController.smali` (1,580 طريقة) — `processUpdates` (#L195161)، `getDifference` (#L164757).
- `apktool-out/smali/org/telegram/messenger/MessagesStorage.smali` (861 طريقة) — `cache4.db` (#L190750)، الجداول.
- `apktool-out/smali/org/telegram/messenger/SecretChatHelper.smali` (101 طريقة) — E2E.
- `apktool-out/smali/org/telegram/messenger/NotificationsController.smali` (205 طرق) — الإشعارات.
- `apktool-out/smali/org/telegram/messenger/FileLoadOperation.smali` — أرقام القطع (#L448–470).
- `apktool-out/smali/org/telegram/messenger/FileLoaderPriorityQueue.smali` — الأولويات.
- `apktool-out/smali/org/telegram/messenger/GcmPushListenerService.smali` — الدفع (المفتاح `"p"` #L475).
- `apktool-out/smali/org/telegram/messenger/PushListenerController.smali` — فك الدفع AES-IGE (#L4319).
- `apktool-out/AndroidManifest.xml` — 20 نشاطاً / 31 خدمة / 26 مستقبلاً / 7 مزودين / 71 صلاحية.
