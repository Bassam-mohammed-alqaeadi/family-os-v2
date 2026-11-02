# تقرير الفحص الهيكلي T1 لتطبيق Life360 (T1 Structural Inspection Report)
## الحزمة: BIP-04 — Life360 Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-02  
> **مستوى الفحص:** T1 — Structural & Container Architecture  
> **التطبيق المستهدف:** Life360 (Android)  
> **حزمة المانيفست المعتمدة:** `com.life360.android.safetymapd`  
> **المعرفات المرتبطة:** `L360-RES-000016`, `L360-EVD-000001`, `L360-EVD-000002`

---

## 1. ملخص الفحص الهيكلي العام

أُجري فحص هيكلي شامل ومباشر لجميع المكونات والحاويات التنفيذية المستخرجة من تطبيق **Life360** (`com.life360.android.safetymapd`).
يكشف هذا الفحص عن معمارية تشغيلية تعتمد على:
1. **الفصل الثنائي للعمليات (Dual-Process Architecture):** عزل خدمة الموقع الحيوية في عملية منفصلة بالكامل (`:service`) عن عملية واجهة المستخدم الرسومية (`com.life360.android.safetymapd`) عبر المكون `EventController` المعلن بالسمة `foregroundServiceType="location"`. يعمل هذا الفصل على حماية خدمة التتبع من الانهيارات البرمجية التي قد تصيب واجهة المستخدم، مع بقاء العملية خاضعة لقوانين إدارة العمليات وتوفير الطاقة في نظام أندرويد.
2. **تضمين المكتبات الثنائية C++:** تضمين مكتبة `librealm-jni.so` وحزم `io.realm` في بنية التطبيق الأصلية دون رصد استدعاءات مباشرة في كود `com.life360` الرئيسي.
3. **تفويض محرك القيادة والتصادم:** الاعتماد على حزمة `com.arity.coreEngine` (Arity SDK) لرصد القيادة وحسابات التصادم الشديد.

---

## 2. هوية الحزمة وإصدارات النظام المعتمدة

- **اسم الحزمة (Package Name):** `com.life360.android.safetymapd` (مطابق بنسبة 100% لسجل المراجع `reference-registry.json`).
- **معرف الإصدار البرمجي (versionCode):** `258400`
- **اسم الإصدار الظاهري (versionName):** `22.9.0`
- **الحد الأدنى للنظام (minSdkVersion):** `26` (Android 8.0 Oreo — اعتماد قنوات الإشعارات Notification Channels وخدمات الواجهة الأمامية المقيدة).
- **الإصدار المستهدف (targetSdkVersion):** `30` (Android 11)
- **إصدار التجميع (compileSdkVersion):** `33` (Android 13)
- **أصل التوثيق المادي:** `benchmarks/extracted/life360/01_architecture_and_manifest/AndroidManifest.xml` و `apktool_out/apktool.yml`.
- **الحجم الإجمالي للمصادر (T0):** **213,321,357 بايت** (`213.32 MB / 203.44 MiB`) موزعة على 26,433 ملفاً عادياً.

---

## 3. تصنيف وتعداد أذونات النظام (31 إذناً مصرحاً)

يعلن ملف `AndroidManifest.xml` عن **31 إذناً للنظام** تم تصنيفها معمارياً كالتالي:

### 3.1. أذونات الموقع الجغرافي الحساسة ووقت التشغيل (Runtime Permissions):
1. `android.permission.ACCESS_FINE_LOCATION`: استقبال إحداثيات GPS الدقيقة لجميع ميزات التتبع.
2. `android.permission.ACCESS_COARSE_LOCATION`: استقبال إحداثيات الأبراج والواي فاي التقريبية.
3. `android.permission.ACCESS_BACKGROUND_LOCATION`: استمرار تتبع حركة العضو والأطفال في الخلفية عند قفل الشاشة (إذن أندرويد 10+ الإلزامي).
4. `android.permission.ACTIVITY_RECOGNITION`: استشعار وتصنيف نمط الحركة (ثبات، مشي، جري، قيادة).
5. `com.google.android.gms.permission.ACTIVITY_RECOGNITION`: تكامل خدمات Google Play للتعرف على النشاط الحركي.
6. `android.permission.CAMERA`: التقاط الصور لملفات الأعضاء والتحقق من الهوية.
7. `android.permission.CALL_PHONE`: إجراء مكالمات الطوارئ الفورية عند تشغيل استغاثة SOS.
8. `android.permission.POST_NOTIFICATIONS`: إرسال الإشعارات والتنبيهات بنظام أندرويد 13+.

### 3.2. أذونات البقاء بالخلفية وإدارة الطاقة (Persistence & Power Management):
9. `android.permission.FOREGROUND_SERVICE`: تشغيل خدمة واجهة دائمة لمنع نظام أندرويد من قتل العملية بسهولة.
10. `android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: طلب استثناء التطبيق من قيود توفير الطاقة (Doze Mode).
11. `android.permission.WAKE_LOCK`: إبقاء المعالج نشطاً أثناء معالجة نبضات الموقع وحزم التصادم.
12. `android.permission.RECEIVE_BOOT_COMPLETED`: إعادة إحياء خدمات التتبع والـ Watchdog فور إعادة تشغيل الجهاز.

### 3.3. أذونات البلوتوث وتتبع أجهزة Tile (BLE Ecosystem):
13. `android.permission.BLUETOOTH`: الاتصال بأجهزة البلوتوث (حتى Android 11).
14. `android.permission.BLUETOOTH_ADMIN`: إدارة اتصالات البلوتوث (حتى Android 11).
15. `android.permission.BLUETOOTH_SCAN`: مسح إعلانات Tile في الخلفية (Android 12+).
16. `android.permission.BLUETOOTH_ADVERTISE`: بث إشارات البلوتوث (Android 12+).
17. `android.permission.BLUETOOTH_CONNECT`: الاتصال بأجهزة التتبع المقترنة (Android 12+).

### 3.4. أذونات الشبكة والدفع والوسائط:
18. `android.permission.INTERNET`: الاتصال السحابي بالخوادم وبث PubNub.
19. `android.permission.ACCESS_NETWORK_STATE`: مراقبة جودة الاتصال وتغيير وتيرة الرفع.
20. `android.permission.ACCESS_WIFI_STATE`: التعرف على شبكات Wi-Fi المنزلية للتأكد من وصول الأبناء.
21. `android.permission.CHANGE_WIFI_STATE`: إدارة الاتصال بالواي فاي.
22. `android.permission.VIBRATE`: اهتزاز الهاتف عند تنبيهات السرعة وإنذار التصادم.
23. `android.permission.NFC`: قراءة بطاقات NFC.
24. `com.android.vending.BILLING`: إدارة اشتراكات Life360 المدفوعة (Gold / Platinum).
25. `android.permission.ACCESS_NOTIFICATION_POLICY`: تجاوز وضع عدم الإزعاج في حالات طوارئ SOS الحرجة.
26. `android.permission.READ_EXTERNAL_STORAGE`: قراءة الصور والملفات.
27. `android.permission.WRITE_EXTERNAL_STORAGE`: حفظ السجلات (`maxSdkVersion=28`).
28. `android.permission.READ_USER_DICTIONARY`: قاموس النصوص المساعد.
29. `com.google.android.c2dm.permission.RECEIVE`: استقبال رسائل FCM الخلفية.
30. `com.google.android.gms.permission.AD_ID`: معرف الإعلانات المجهول.
31. `com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE`: قياسات التثبيت والإحالة.

---

## 4. تشريح المكونات الهيكلية للمانيفست (Manifest Components Anatomy)

| نوع المكون | العدد | أبرز المكونات ومسؤولياتها المعمارية |
|---|---|---|
| **الأنشطة (Activities)** | **15** | `RootActivity` (النشاط الرئيسي singleTask)، `MessagingRootActivity` (المحادثات)، وأنشطة الدعم والتوثيق الخارجية. |
| **الخدمات (Services)** | **29** | `EventController` (خدمة واجهة أمامية للموقع في عملية `:service`)، `DriverBehaviorService`، `AutomaticCollisionResponseService`، `MqttService`، وخدمات Arity الست. |
| **المستقبلات (Receivers)** | **49** | `LocationReceiver`، `GeofenceReceiver`، `BleReceiver`، `DeviceHealthEventReceiver`، `MpActivityTransitionReceiver`، و `CollisionResponseReceiver`. |
| **الموفرات (Providers)** | **16** | `L360ServiceAppInitProvider` (تهيئة عملية الخدمة)، `BackgroundProcessContentProvider` (IPC بين العمليات)، و `FileProvider`. |

---

## 5. تشريح الحاويات التنفيذية والملفات الثنائية (`binary_dex` و `binary_so`)

تم فصل الحاويات التنفيذية بايتكود عن المكتبات المشتركة الأصلية وفق الفئات المعيارية:

### 5.1. حاويات Dalvik Executable (`binary_dex` - 3 ملفات):
1. `classes.dex`: **9,261,584 بايت** (~9.26 MB) — مكتبات أندرويد الأساسية ومكتبات Google Play Services.
2. `classes2.dex`: **10,302,032 بايت** (~10.30 MB) — كود التطبيق الأساسي (`com.life360.*`) ومحركات الموقع والجيوفنسينغ والـ Koko Core.
3. `classes3.dex`: **5,780,168 بايت** (~5.78 MB) — موديولات الشبكات والدعم والتحليلات.
- **إجمالي حجم ملفات DEX الثلاثة:** **25,343,784 بايت** (25.34 MB / 24.17 MiB).

### 5.2. المكتبات الثنائية الأصلية C++ (`binary_so` - 42 ملفاً):
يحتوي التطبيق على **42 ملف ثنائي (.so)** موزعة بالتساوي عبر 5 معماريات للمعالجات (`arm64-v8a`, `armeabi-v7a`, `mips`, `x86`, `x86_64`) بحجم **53,879,904 بايت** (53.88 MB / 51.38 MiB):
1. `librealm-jni.so`: واجهات JNI الأصلية لمكتبة قاعدة البيانات Realm.
2. `libcrashlytics.so` و `libcrashlytics-handler.so` و `libcrashlytics-trampoline.so` و `libcrashlytics-common.so`: بنية تحتية لاعتراض انهيارات النظام على مستوى POSIX Signals.
