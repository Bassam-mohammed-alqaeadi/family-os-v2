# دليل ومسرد مكونات تطبيق Bark (Parent Dashboard)
## Architectural Components Catalog: cm.pt.barkparent (v6.5.1)

> **حزمة التطبيق:** `cm.pt.barkparent`  
> **الإصدار:** 6.5.1 (Build `600500103`)  
> **إصدارات أندرويد المدعومة:** Min SDK 24 (Android 7.0 Nougat) -> Target SDK 36 (Android 16)  
> **إجمالي المكونات:** 51 مكوناً معمارياً (14 Activities, 12 Services, 18 BroadcastReceivers, 7 ContentProviders)

---

## 1. الملخص الإحصائي للمكونات (Component Distribution)

| نوع المكون (Component Type) | الإجمالي | المصدرة خارجياً (`exported=true`) | الخاصة المحمية (`exported=false`) | محكومة بأذونات خاصة |
|---|---|---|---|---|
| **الأنشطة (Activities)** | 14 | 3 | 11 | 0 |
| **الخدمات (Services)** | 12 | 1 | 11 | 3 (`BIND_JOB_SERVICE`) |
| **مستقبلات البث (BroadcastReceivers)** | 18 | 4 | 14 | 4 (`C2D SEND`, `DUMP`) |
| **موفرو المحتوى (ContentProviders)** | 7 | 0 | 7 | 0 |
| **الإجمالي الكلي** | **51** | **8** | **43** | **7** |

---

## 2. جدول وسجل الأنشطة (Activities — 14 Activities)

### 2.1 `cm.pt.barkparent.MainActivity`
- **الحالة:** `exported=true` | **نمط الإطلاق:** `singleTask` | **السمة (Theme):** `@style/AppTheme`
- **الدور المعماري:** النشاط الأساسي للتطبيق ومضيف محرك React Native Surface مع معالج شبكة الروابط العميقة (Deep Links)
- **التحليل الفني:** يمثل نقطة الدخول الرئيسية للمستخدم عبر أيقونة الإطلاق. يرتبط بمحرك React Native (Hermes VM v98) ويستقبل كافة أحداث الروابط العميقة (App Links) الموثقة للنطاقات الرسمية لـ Bark (أكثر من 90 مساراً لربط الحسابات، التنبيهات، أوقات الشاشة، وإدارة الأجهزة العائلية).
- **فلاتر الـ Intent (Intent Filters):**
  * **فلتر 1:** Actions: `android.intent.action.MAIN` | Categories: `android.intent.category.LAUNCHER`
  * **فلتر 2:** AutoVerify: `true` | Actions: `android.intent.action.VIEW` | Categories: `android.intent.category.DEFAULT`, `android.intent.category.BROWSABLE` | Data: `https://*.bark.us/`
  * **فلتر 3:** AutoVerify: `true` | Actions: `android.intent.action.VIEW` | Categories: `android.intent.category.DEFAULT`, `android.intent.category.BROWSABLE` | Data Summary: AutoVerify مع النطاق www.bark.us وأكثر من 90 بادئة مسار (pathPrefix) تشمل: /children, /screen-time, /snippets, /installed-apps, /connections, /bark-jr, /account, /profile, /recap, /checkins, /notifications, /what-bark-monitors, إلخ.

### 2.2 `com.facebook.react.devsupport.DevSettingsActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `Default`
- **الدور المعماري:** شاشة إعدادات المطور الخاصة بـ React Native
- **التحليل الفني:** تُستخدم أثناء التطوير وتصحيح الأخطاء لفتح قائمة المطورين (React Native Dev Menu). مغلقة بالكامل في إصدار الإنتاج.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.3 `com.iterable.iterableapi.IterableTrampolineActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `singleTask` | **السمة (Theme):** `@style/TrampolineActivity.Transparent`
- **الدور المعماري:** نشاط وسيط شفاف (Trampoline) لمعالجة التفاعل مع إشعارات Iterable
- **التحليل الفني:** نشاط غير مرئي (`excludeFromRecents=true`, Transparent Theme) يُستدعى فوراً عند نقر الوالد على إشعار قادم من Iterable لتسجيل مقاييس التحليلات (Click Event) وفك الرابط العميق وتمريره إلى `MainActivity` دون إرباك واجهة المستخدم.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.4 `com.facebook.FacebookActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@style/com_facebook_activity_theme`
- **الدور المعماري:** واجهة تسجيل الدخول والمشاركة عبر فيسبوك SDK
- **التحليل الفني:** نشاط معياري من Facebook SDK لمعالجة تدفقات مصادقة الدخول (Login Dialog) وطلب الأذونات الاجتماعية لحساب الوالد.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.5 `com.facebook.CustomTabMainActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `Default`
- **الدور المعماري:** موزع تبويبات Chrome المخصصة لمصادقة فيسبوك
- **التحليل الفني:** يدير إطلاق Chrome Custom Tabs للتفويض عبر متصفح النظام عند غياب تطبيق فيسبوك الرسمي على الجهاز.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.6 `com.facebook.CustomTabActivity`
- **الحالة:** `exported=true` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `Default`
- **الدور المعماري:** مستقبل رد المصادقة الموجه عبر Chrome Custom Tab
- **التحليل الفني:** نشاط مُصدّر يستقبل الـ Callback URI بعد انتهاء عملية تسجيل الدخول بفيسبوك عبر المتصفح.
- **فلاتر الـ Intent (Intent Filters):**
  * **فلتر 1:** Actions: `android.intent.action.VIEW` | Categories: `android.intent.category.DEFAULT`, `android.intent.category.BROWSABLE` | Data: `fbconnect://cct.cm.pt.barkparent`

### 2.7 `com.onesignal.NotificationOpenedActivityHMS`
- **الحالة:** `exported=true` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@android:style/Theme.Translucent.NoTitleBar`
- **الدور المعماري:** معالج فتح الإشعارات الموجهة لأجهزة هواوي (HMS)
- **التحليل الفني:** نشاط وسيط شفاف (`noHistory=true`) يستقبل أحداث النقر على إشعارات Huawei Push Kit على الأجهزة التي تفتقر لخدمات Google Play (GMS).
- **فلاتر الـ Intent (Intent Filters):**
  * **فلتر 1:** Actions: `android.intent.action.VIEW`

### 2.8 `com.onesignal.notifications.activities.NotificationOpenedActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@android:style/Theme.Translucent.NoTitleBar`
- **الدور المعماري:** معالج نقر إشعارات OneSignal القياسية
- **التحليل الفني:** نشاط وسيط شفاف (`excludeFromRecents=true`, `noHistory=true`, `taskAffinity=""`) يقوم بتتبع فتح الإشعار وتحديث عدادات التفاعل وإطلاق الشاشة المحددة في حمولة الإشعار.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.9 `com.onesignal.notifications.activities.NotificationOpenedActivityAndroid22AndOlder`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@android:style/Theme.Translucent.NoTitleBar`
- **الدور المعماري:** معالج فتح الإشعارات المتوافق مع إصدارات أندرويد القديمة (Lollipop فما دون)
- **التحليل الفني:** يوفر التوافق الرجعي لنظام إدارة الأنشطة وإشعارات الأجهزة القديمة التي لا تدعم معمارية الإشعارات الحديثة.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.10 `com.onesignal.core.activities.PermissionsActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@style/OneSignal.Theme.Translucent`
- **الدور المعماري:** شاشة طلب أذونات الإشعارات الديناميكية (Android 13+)
- **التحليل الفني:** نافذة شفافة تنبثق وقت التشغيل لشرح أهمية تفعيل إشعارات تنبيهات أمان الأطفال وطلب إذن `POST_NOTIFICATIONS` بصورة تفاعلية سلسة.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.11 `com.android.billingclient.api.ProxyBillingActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@android:style/Theme.Translucent.NoTitleBar`
- **الدور المعماري:** نشاط وسيط لتنفيذ عمليات الشراء والاشتراك عبر Google Play Billing
- **التحليل الفني:** مدمج بواسطة مكتبة Google Play Billing Client (v8.3.0) لعرض نوافذ اختيار بطاقات الدفع وتأكيد الاشتراكات الشهرية/السنوية في خطط Bark.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.12 `com.android.billingclient.api.ProxyBillingActivityV2`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@android:style/Theme.Translucent.NoTitleBar`
- **الدور المعماري:** نشاط وسيط للنسخة الثانية من Play Billing (Alternative Billing APIs)
- **التحليل الفني:** يدعم مسارات الفوترة البديلة والواجهات الحديثة لمكتبة Google Play Billing عبر معالجة التغييرات في حالة الاتصال والتفويض.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.13 `com.google.android.gms.common.api.GoogleApiActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@android:style/Theme.Translucent.NoTitleBar`
- **الدور المعماري:** نشاط خدمات Google Play لحل مشكلات التوافق والاتصال
- **التحليل الفني:** يعالج الأخطاء الخاصة بـ Google Play Services (مثل الحاجة لتحديث الخدمات أو المصادقة) بعرض الحوار المناسب للمستخدم تلقائياً.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

### 2.14 `com.google.android.play.core.common.PlayCoreDialogWrapperActivity`
- **الحالة:** `exported=false` | **نمط الإطلاق:** `standard` | **السمة (Theme):** `@style/Theme.PlayCore.Transparent`
- **الدور المعماري:** معالج حوارات متجر Google Play (In-App Updates & Reviews)
- **التحليل الفني:** نشاط شفاف (`stateNotNeeded=true`) يدير نوافذ التحديث التلقائي للتطبيق من داخل التطبيق ومربعات تقييم التطبيق دون مغادرة الشاشة.
- **فلاتر الـ Intent:** لا توجد (مكون داخلي يستدعى صراحة)

---

## 3. جدول وسجل الخدمات الخلفية (Services — 12 Services)

### 3.1 `com.iterable.iterableapi.IterableFirebaseMessagingService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `false`
- **الدور المعماري:** معالج ومستقبل إشعارات منصة Iterable التسويقية والتفاعلية
- **التحليل الفني:** يرتبط بـ Firebase Cloud Messaging بأولوية `-1` لاستقبال حملات التفاعل والنشرات الدورية الموجهة للوالدين وفصلها عن إشعارات الأمان الحرجة.
- **فلاتر الـ Intent:**
  * Actions: `com.google.firebase.MESSAGING_EVENT` (Priority: -1)

### 3.2 `com.onesignal.notifications.services.HmsMessageServiceOneSignal`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `false`
- **الدور المعماري:** معالج رسائل الدفع الخاصة بشبكة Huawei Push Kit (OneSignal)
- **التحليل الفني:** يستقبل أحداث `com.huawei.push.action.MESSAGING_EVENT` لتوصيل تنبيهات OneSignal الفورية لأجهزة أندرويد الخالية من خدمات جوجل (مثل هواتف هواوي الحديثة).
- **فلاتر الـ Intent:**
  * Actions: `com.huawei.push.action.MESSAGING_EVENT`

### 3.3 `com.onesignal.core.services.SyncJobService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `android.permission.BIND_JOB_SERVICE` | **DirectBootAware:** `false`
- **الدور المعماري:** خدمة الجدولة لمزامنة حالة مستخدم OneSignal بالخلفية
- **التحليل الفني:** تُستدعى بواسطة `JobScheduler` للنظام لمزامنة الـ Tags، بيانات الحساب، وحالة الاشتراك مع خوادم OneSignal على فترات دورية دون استنزاف البطارية.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.4 `com.onesignal.SyncJobService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `android.permission.BIND_JOB_SERVICE` | **DirectBootAware:** `false`
- **الدور المعماري:** خدمة مزامنة OneSignal المتوافقة مع الإصدارات السابقة
- **التحليل الفني:** خدمة بديلة لضمان استمرارية المزامنة على مختلف إصدارات SDK ومكونات النظام.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.5 `com.google.firebase.messaging.FirebaseMessagingService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `true`
- **الدور المعماري:** خدمة استقبال وتوزيع رسائل Firebase Cloud Messaging الأساسية
- **التحليل الفني:** المحور الأساسي لتلقي رسائل الدفع السحابية الفورية. تعمل بوضع `directBootAware=true` مما يمكنها من استقبال حزم الإشعارات الحرجة حتى قبل قيام المستخدم بفك قفل الجهاز بعد إعادة التشغيل.
- **فلاتر الـ Intent:**
  * Actions: `com.google.firebase.MESSAGING_EVENT` (Priority: -500)

### 3.6 `com.google.firebase.components.ComponentDiscoveryService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `true`
- **الدور المعماري:** خدمة الاكتشاف الديناميكي لحزم ومكونات Firebase
- **التحليل الفني:** توفر آلية حقن التبعيات (Dependency Injection) الخاصة بـ Firebase، حيث تسجل 7 وحدات (Registrars) تشمل Messaging, Installations, Common, و DataTransport دون الحاجة لتهيئة يدوية معقدة.
- **المسجلات المكتشفة (Registered Components):** `FirebaseMessagingKtxRegistrar`, `FirebaseMessagingRegistrar`, `FirebaseInstallationsKtxRegistrar`, `FirebaseInstallationsRegistrar`, `FirebaseCommonLegacyRegistrar`, `FirebaseCommonKtxRegistrar`, `TransportRegistrar`
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.7 `androidx.work.impl.background.systemalarm.SystemAlarmService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `false`
- **الدور المعماري:** محرك WorkManager المعتمد على المنبهات (AlarmManager Engine)
- **التحليل الفني:** يُستخدم كآلية تشغيل احتياطية لإدارة مهام الخلفية على الأجهزة القديمة أو عندما يتطلب الأمر دقة توقيت لا يوفرها JobScheduler.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.8 `androidx.work.impl.background.systemjob.SystemJobService`
- **الحالة:** `exported=true` | **الإذن المطلوب:** `android.permission.BIND_JOB_SERVICE` | **DirectBootAware:** `false`
- **الدور المعماري:** محرك WorkManager الأساسي المعتمد على JobScheduler
- **التحليل الفني:** الخدمة المركزية لجدولة وتنفيذ كافة المهام المجدولة في Bark على نظام أندرويد الحديث (Android 5.0+ حتى Android 16). محمية بإذن `BIND_JOB_SERVICE` بحيث لا يستطيع تشغيلها سوى نواة نظام أندرويد.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.9 `androidx.work.impl.foreground.SystemForegroundService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `false`
- **الدور المعماري:** خدمة العمليات الأمامية لتنفيذ المهام طويلة الأمد في WorkManager
- **التحليل الفني:** تسمح لـ WorkManager بترقية مهمة خلفية إلى Foreground Service مع إشعار دائم مرئي، مما يحمي العملية من القتل بواسطة Low Memory Killer (LMK) عند مزامنة ملفات ضخمة أو تصدير التقارير.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.10 `androidx.room.MultiInstanceInvalidationService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `true`
- **الدور المعماري:** خدمة مزامنة وإلغاء صلاحية كاش قاعدة بيانات Room بين العمليات
- **التحليل الفني:** تنسق بين مختلف العمليات (Multi-process architecture) لضمان أن التعديلات في جداول قاعدة البيانات تنعكس فوراً وتلغي الكاش غير الصالح عبر كود IPC (AIDL).
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.11 `com.google.android.datatransport.runtime.backends.TransportBackendDiscovery`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None` | **DirectBootAware:** `false`
- **الدور المعماري:** خدمة اكتشاف وجهات نقل التحليلات والقياس عن بُعد
- **التحليل الفني:** تسجل الواجهة الخلفية `cct` (Google Clearcut Transport) لإرسال إحصائيات الأداء وتسجيل الأعطال.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

### 3.12 `com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `android.permission.BIND_JOB_SERVICE` | **DirectBootAware:** `false`
- **الدور المعماري:** مجدول إرسال حزم القياس عن بُعد والتحليلات عبر JobScheduler
- **التحليل الفني:** تقوم بتجميع حزم التحليلات (Batching) وإرسالها لخوادم جوجل في الخلفية في الأوقات الملائمة مع توفر شبكة غير مقيدة.
- **فلاتر الـ Intent:** لا توجد (تستدعى عبر JobScheduler أو الربط الداخلي)

---

## 4. جدول وسجل مستقبلات البث (BroadcastReceivers — 18 Receivers)

### 4.1 `com.iterable.iterableapi.IterablePushActionReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** معالج أزرار الإجراءات السريعة داخل إشعارات Iterable
- **التحليل الفني:** يلتقط تفاعل الوالد مع الأزرار التفاعلية (Inline Actions) المضمنة داخل الإشعار وينفذ الأمر المطلوب.
- **الإجراءات المستقبلة (Actions Filter):** `com.iterable.push.ACTION_PUSH_ACTION`

### 4.2 `com.onesignal.notifications.receivers.FCMBroadcastReceiver`
- **الحالة:** `exported=true` | **الإذن المطلوب:** `com.google.android.c2dm.permission.SEND`
- **الدور المعماري:** المستقبل عالي الأولوية لرسائل الدفع الواردة لمنصة OneSignal
- **التحليل الفني:** يمتلك أولوية قصوى (`priority=999`) ويستقبل حزم FCM مباشرة من خدمات جوجل لمعالجة تنبيهات أمان الأطفال الفورية قبل أي معالج آخر.
- **الإجراءات المستقبلة (Actions Filter):** `com.google.android.c2dm.intent.RECEIVE (Priority: 999)`

### 4.3 `com.onesignal.notifications.receivers.NotificationDismissReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستقبل أحداث مسح وتجاهل الإشعارات
- **التحليل الفني:** يرصد قيام الوالد بسحب الإشعار لمسحه (Swipe to dismiss) لتسجيل إحصائيات القراءة والتفاعل في OneSignal.
- **الإجراءات المستقبلة:** لا توجد (تستدعى عبر Intent صريح داخلي)

### 4.4 `com.onesignal.notifications.receivers.BootUpReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستقبل استعادة إشعارات OneSignal عند إقلاع النظام
- **التحليل الفني:** يعيد تسجيل توكنات التنبيهات وجدولة الإشعارات المحلية فور اكتمال إقلاع الهاتف.
- **الإجراءات المستقبلة (Actions Filter):** `android.intent.action.BOOT_COMPLETED`

### 4.5 `com.onesignal.notifications.receivers.UpgradeReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستقبل تحديث التطبيق وإعادة التسجيل السحابي
- **التحليل الفني:** يُستدعى تلقائياً عند ترقية إصدار تطبيق Bark عبر متجر Play لإعادة إنشاء قنوات الإشعارات وتحديث توكن الجهاز في السحابة.
- **الإجراءات المستقبلة (Actions Filter):** `android.intent.action.MY_PACKAGE_REPLACED`

### 4.6 `com.google.firebase.iid.FirebaseInstanceIdReceiver`
- **الحالة:** `exported=true` | **الإذن المطلوب:** `com.google.android.c2dm.permission.SEND`
- **الدور المعماري:** مستقبل حزم FCM الأساسي التابع لـ Google Play Services
- **التحليل الفني:** نقطة الدخول الرسمية لكافة رسائل البث المشفرة القادمة من بنية Google Cloud Messaging التحتية.
- **الإجراءات المستقبلة (Actions Filter):** `com.google.android.c2dm.intent.RECEIVE`

### 4.7 `com.facebook.CurrentAccessTokenExpirationBroadcastReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستقبل انتهاء صلاحية توكن تسجيل الدخول بفيسبوك
- **التحليل الفني:** يراقب توكن فيسبوك للتأكد من استمرار صلاحية جلسة الوالد وتنبيهه لإعادة تسجيل الدخول عند انقضائها.
- **الإجراءات المستقبلة (Actions Filter):** `com.facebook.sdk.ACTION_CURRENT_ACCESS_TOKEN_CHANGED`

### 4.8 `com.facebook.AuthenticationTokenManager$CurrentAuthenticationTokenChangedBroadcastReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستقبل تجديد توكن المصادقة الموحدة في فيسبوك
- **التحليل الفني:** يراقب تحديثات توكن OIDC لحساب فيسبوك المرتبط.
- **الإجراءات المستقبلة (Actions Filter):** `com.facebook.sdk.ACTION_CURRENT_AUTHENTICATION_TOKEN_CHANGED`

### 4.9 `androidx.work.impl.utils.ForceStopRunnable$BroadcastReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستكشف الإيقاف القسري واستعادة مهام WorkManager
- **التحليل الفني:** مكون داخلي في WorkManager يستخدم منبهاً دورياً لاكتشاف ما إذا كان المستخدم أو النظام قد قام بإيقاف التطبيق قسرياً (Force Stop)، وعند إعادة التشغيل يقوم بتهيئة قاعدة البيانات وإعادة جدولة المهام.
- **الإجراءات المستقبلة:** لا توجد (تستدعى عبر Intent صريح داخلي)

### 4.10 `androidx.work.impl.background.systemalarm.ConstraintProxy$BatteryChargingProxy`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** وكيل مراقبة حالة شحن البطارية (WorkManager Constraint)
- **التحليل الفني:** يتم تفعيله ديناميكياً فقط عندما تكون هناك مهام مزامنة تشترط اتصال الهاتف بالشاحن.
- **الإجراءات المستقبلة (Actions Filter):** `android.intent.action.ACTION_POWER_CONNECTED`, `android.intent.action.ACTION_POWER_DISCONNECTED`

### 4.11 `androidx.work.impl.background.systemalarm.ConstraintProxy$BatteryNotLowProxy`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** وكيل مراقبة انخفاض مستوى البطارية
- **التحليل الفني:** يوقف المهام الثقيلة تلقائياً عند انخفاض البطارية ويعيد إطلاقها عند شحنها لمستوى مقبول.
- **الإجراءات المستقبلة (Actions Filter):** `android.intent.action.BATTERY_OKAY`, `android.intent.action.BATTERY_LOW`

### 4.12 `androidx.work.impl.background.systemalarm.ConstraintProxy$StorageNotLowProxy`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** وكيل مراقبة مساحة التخزين المتاحة
- **التحليل الفني:** يمنع كاش البيانات والمهام من العمل إذا كانت مساحة تخزين الجهاز ممتلئة لتفادي أخطاء SQLite.
- **الإجراءات المستقبلة (Actions Filter):** `android.intent.action.DEVICE_STORAGE_LOW`, `android.intent.action.DEVICE_STORAGE_OK`

### 4.13 `androidx.work.impl.background.systemalarm.ConstraintProxy$NetworkStateProxy`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** وكيل مراقبة الاتصال بالإنترنت والشبكة
- **التحليل الفني:** يتحسس عودة الاتصال بالإنترنت لإطلاق مهام المزامنة المعلقة فوراً.
- **الإجراءات المستقبلة (Actions Filter):** `android.net.conn.CONNECTIVITY_CHANGE`

### 4.14 `androidx.work.impl.background.systemalarm.RescheduleReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** مستقبل إعادة جدولة مهام WorkManager الشامل
- **التحليل الفني:** يعيد حساب وتجديد كافة مواعيد المهام الدورية عند إقلاع الجهاز أو عند تغيير وقت أو المنطقة الزمنية للهاتف لضمان تطابق جداول وقت شاشة الأطفال.
- **الإجراءات المستقبلة (Actions Filter):** `android.intent.action.BOOT_COMPLETED`, `android.intent.action.TIME_SET`, `android.intent.action.TIMEZONE_CHANGED`

### 4.15 `androidx.work.impl.background.systemalarm.ConstraintProxyUpdateReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** المحدث الديناميكي لوكلاء القيود (Proxy State Manager)
- **التحليل الفني:** يتلقى أوامر داخلية لتمكين أو تعطيل وكلاء القيود الأربعة عبر PackageManager لتوفير استهلاك المعالج والبطارية.
- **الإجراءات المستقبلة (Actions Filter):** `androidx.work.impl.background.systemalarm.UpdateProxies`

### 4.16 `androidx.work.impl.diagnostics.DiagnosticsReceiver`
- **الحالة:** `exported=true` | **الإذن المطلوب:** `android.permission.DUMP`
- **الدور المعماري:** مستقبل تشخيص وفحص WorkManager عبر ADB DUMP
- **التحليل الفني:** مكون تشخيصي محمي بإذن نظامي `DUMP` يتيح للمطورين وأدوات الاختبار فحص حالة المهام في قاعدة البيانات وطباعتها في Logcat.
- **الإجراءات المستقبلة (Actions Filter):** `androidx.work.diagnostics.REQUEST_DIAGNOSTICS`

### 4.17 `androidx.profileinstaller.ProfileInstallReceiver`
- **الحالة:** `exported=true` | **الإذن المطلوب:** `android.permission.DUMP`
- **الدور المعماري:** مستقبل تثبيت وتحسين ملف تعريف Baseline Profile لتسريع الأداء
- **التحليل الفني:** يدير تجميع كود DEX مسبقاً (AOT Compilation) عبر نظام ART في أندرويد لتسريع إقلاع التطبيق بنسبة تصل إلى 40% وتقليل استهلاك الذاكرة.
- **الإجراءات المستقبلة (Actions Filter):** `androidx.profileinstaller.action.INSTALL_PROFILE`, `androidx.profileinstaller.action.SKIP_FILE`, `androidx.profileinstaller.action.SAVE_PROFILE`, `androidx.profileinstaller.action.BENCHMARK_OPERATION`

### 4.18 `com.google.android.datatransport.runtime.scheduling.jobscheduling.AlarmManagerSchedulerBroadcastReceiver`
- **الحالة:** `exported=false` | **الإذن المطلوب:** `None`
- **الدور المعماري:** منبه إرسال حزم التحليلات والقياس عن بُعد
- **التحليل الفني:** يستيقظ عبر AlarmManager لإطلاق خدمة رفع حزم التحليلات الدورية إلى خوادم Google.
- **الإجراءات المستقبلة:** لا توجد (تستدعى عبر Intent صريح داخلي)

---

## 5. جدول وسجل موفري المحتوى (ContentProviders — 7 ContentProviders)

### 5.1 `com.reactnativecommunity.webview.RNCWebViewFileProvider`
- **النطاق (Authority):** `cm.pt.barkparent.fileprovider` | **الحالة:** `exported=false` | **GrantUriPermissions:** `true`
- **الدور المعماري:** مشارك الملفات والوسائط مع مكونات WebView
- **التحليل الفني:** يوفر أذونات وصول آمنة (Scoped URI Access) للملفات المحلية المؤقتة والمستندات ليتم عرضها بأمان داخل شاشات الويب المدمجة (WebViews) دون منح صلاحيات شاملة لنظام الملفات.
- **البيانات الوصفية (Metadata):** `android.support.FILE_PROVIDER_PATHS = @xml/file_provider_paths`

### 5.2 `cl.json.RNShareFileProvider`
- **النطاق (Authority):** `cm.pt.barkparent.rnshare.fileprovider` | **الحالة:** `exported=false` | **GrantUriPermissions:** `true`
- **الدور المعماري:** مشارك الملفات والتقارير عبر نافذة المشاركة القياسية (Android Share Sheet)
- **التحليل الفني:** مدمج بواسطة مكتبة `react-native-share` لمشاركة روابط التنبيهات، تقارير أمان الأسرة، وتطبيقات Bark مع تطبيقات أخرى كالمراسلة والبريد.
- **البيانات الوصفية (Metadata):** `android.support.FILE_PROVIDER_PATHS = @xml/share_download_paths`

### 5.3 `androidx.startup.InitializationProvider`
- **النطاق (Authority):** `cm.pt.barkparent.androidx-startup` | **الحالة:** `exported=false` | **GrantUriPermissions:** `false`
- **الدور المعماري:** المهيئ الموحد لمكتبات AndroidX و OneSignal عبر إطار App Startup
- **التحليل الفني:** يعالج معضلة بطء الإقلاع (App Cold Start) الناتجة عن تعدد الـ ContentProviders من خلال توحيد عملية بدء تشغيل خمس مكتبات محورية في موفر محتوى واحد يُنفذ تلقائياً قبل `Application.onCreate()`.
- **البيانات الوصفية (Metadata):** `مدمج لتهيئة: ActivityLifecycleInitializer, EmojiCompatInitializer, WorkManagerInitializer, ProcessLifecycleInitializer, ProfileInstallerInitializer`

### 5.4 `com.google.firebase.provider.FirebaseInitProvider`
- **النطاق (Authority):** `cm.pt.barkparent.firebaseinitprovider` | **الحالة:** `exported=false` | **GrantUriPermissions:** `false`
- **الدور المعماري:** المهيئ التلقائي لمكتبة Firebase Core و GMS Services
- **التحليل الفني:** ينفذ بأولوية `initOrder=100` لتهيئة `FirebaseApp` وقنوات الاتصال السحابي فور بدء العملية وقبل تشغيل أي مكون آخر.
- **البيانات الوصفية (Metadata):** `initOrder = 100, directBootAware = true`

### 5.5 `io.sentry.android.core.SentryInitProvider`
- **النطاق (Authority):** `cm.pt.barkparent.SentryInitProvider` | **الحالة:** `exported=false` | **GrantUriPermissions:** `false`
- **الدور المعماري:** مهيئ نظام رصد الأخطاء والانهيارات البرمجية Sentry
- **التحليل الفني:** يربط محرك التقاط الأخطاء غير المعالجة وتسجيل مسارات الانهيارات في كود Java و C++ الأصلي.
- **البيانات الوصفية (Metadata):** `io.sentry.auto-init = false (تهيئة مخصصة عبر كود التطبيق)`

### 5.6 `io.sentry.android.core.SentryPerformanceProvider`
- **النطاق (Authority):** `cm.pt.barkparent.SentryPerformanceProvider` | **الحالة:** `exported=false` | **GrantUriPermissions:** `false`
- **الدور المعماري:** مهيئ قياس زمن استجابة وأداء التطبيق (APM Tracing)
- **التحليل الفني:** ينفذ بأولوية قصوى `initOrder=200` لقياس زمن بدء تشغيل التطبيق (App Cold Start TTID/TTFD) من اللحظة الأولى للتحميل في الذاكرة.
- **البيانات الوصفية (Metadata):** `initOrder = 200`

### 5.7 `com.facebook.internal.FacebookInitProvider`
- **النطاق (Authority):** `cm.pt.barkparent.FacebookInitProvider` | **الحالة:** `exported=false` | **GrantUriPermissions:** `false`
- **الدور المعماري:** المهيئ التلقائي لمكتبة Facebook SDK
- **التحليل الفني:** يقرأ معرّف التطبيق (`facebook_app_id`) ورمز العميل (`facebook_client_token`) من المانيفست ويهيئ مكتبة فيسبوك للمصادقة وتتبع الحملات.
- **البيانات الوصفية (Metadata):** `None`

---

## 6. استنتاجات معمارية مقارنة (Architectural Takeaways for Family OS)

1. **الفصل المعماري الصارم (Separation of Concerns):**
   - يوضح مسرد مكونات `cm.pt.barkparent` أن التطبيق صُمم كـ **لوحة تحكم وتحليلات للوالدين**، ولذلك يخلو من أذونات `Accessibility` و `VPN` و `Device Admin`.
   - هذا النمط المعماري يماثل تماماً خطة `Family OS` في الفصل بين تطبيق إدارة الوالدين (Parent Control Plane) وتطبيق خدمة الحماية والمراقبة المثبت على جهاز الطفل (Child Sentinel / Companion Agent).
2. **البنية التحتية للإشعارات متعددة القنوات (Multi-Provider Push Architecture):**
   - دمج ثلاثة محركات إشعارات بالتوازي: `Firebase Cloud Messaging` (للرسائل الحساسة والآنية)، `OneSignal` (لتنبيهات الحساب والمخاطر السريعة)، و `Iterable` (للنشرات التوعوية وملخصات الأسبوع).
3. **كفاءة الإقلاع عبر AndroidX App Startup:**
   - استخدام `InitializationProvider` لتوحيد تهيئة 5 مكتبات حرجة يقلل زمن بدء تشغيل التطبيق بنسبة ملحوظة ويوفر نقطة ارتكاز قوية لبناء تطبيق `Family OS` المستقبلي.

---
*تم استخراج وتوثيق هذا الدليل بواسطة خبير المعمارية والمانيفست `worker_m1` — مشروع تفكيك التطبيقات المرجعية Family OS.*