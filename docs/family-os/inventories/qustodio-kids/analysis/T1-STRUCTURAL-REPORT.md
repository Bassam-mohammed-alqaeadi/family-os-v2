# T1 — التقرير البنيوي والمكونات: Qustodio Kids (`com.qustodio.qustodioapp`)

> **النطاق:** التشريح البنيوي الكامل لتطبيق الطفل — المانيفست، المكونات، الحزم، المكتبات الأصلية.
> **المصدر:** `~/workspace/rework/qustodio-kids/` — الإصدار 680.78.1.2-family.

## 1. إحصاءات الشجرة [VERIFIED — مسح حتمي]

| البند | القيمة |
|---|---|
| إجمالي الملفات | 21,835 |
| إجمالي الحجم | 122,540,719 بايت (~117MB) |
| smali | 13,261 |
| java (jadx) | 6,917 |
| أخطاء jadx | 36 |
| xml | 691 |
| png | 230 |
| so | 26 (4 معماريات × ~6 مكتبات + crashlytics) |

## 2. تشريح الـ Manifest [VERIFIED — قُرئ كاملاً، 307 أسطر]

### 2.1 الخدمات الكبرى (المكدّس الثلاثي)
| الخدمة | الإعداد |
|---|---|
| `accessibility.AccessibilityService` | مصدَّرة + `BIND_ACCESSIBILITY_SERVICE`؛ `typeAllMask`، أعلام تشمل `flagIncludeNotImportantViews`/`flagRequestEnhancedWebAccessibility`/`flagReportViewIds`/`flagRetrieveInteractiveWindows`؛ `notificationTimeout=100` برمجياً |
| `vpn.HttpEventVpnService` | `BIND_VPN_SERVICE`؛ `SUPPORTS_ALWAYS_ON=false` |
| `receiver.QustodioDeviceAdminReceiver` | `BIND_DEVICE_ADMIN`؛ سياسات `@xml/device_admin` = `<uses-policies/>` فارغة |

### 2.2 الخدمات المساندة
- `service.QustodioService` — `foregroundServiceType="systemExempted"`، إشعار أمامي دائم، `START_STICKY`.
- `service.RestartServiceNotification` — `NotificationListenerService` فارغة (7 أسطر): مرساة إبقاء حي.
- `service.messaging.FirebaseMessagingService` — استقبال أوامر FCM.
- خدمات WorkManager وFirebase القياسية.

### 2.3 المستقبلات
| المستقبل | الفلاتر |
|---|---|
| `callsandsms.sms.SmsOnReceived` (مصدَّر) | 5 فلاتر SMS/MMS **بأولوية 2147483647** (القصوى) |
| `callsandsms.call.CallOnProcess` | `PHONE_STATE` + `NEW_OUTGOING_CALL` (قصوى) |
| `receiver.DeviceBootReceiver` | `BOOT_COMPLETED` (999) + `MY_PACKAGE_REPLACED` (998) |
| `receiver.panicmode.PanicButtonEventReceiver` | `HEADSET_PLUG` (قصوى) |
| `receiver.UserSwitchReceiver` (ديناميكي) | `USER_FOREGROUND`/`USER_BACKGROUND` |

### 2.4 الأنشطة اللافتة
- `SplashScreenActivity` (لانشر) + روابط `qustodiofamily://` / `qustodio://chrome-extension` / `qustodio://parent-login`.
- 13 نشاط إعداد صلاحيات (accessibility لكل OEM + VPN + شهادة + device admin + overlay + autostart شاومي + notification access + app usage).
- `ui.blocker.regular.BlockerActivity` + `ui.blocker.blockers.pipblocker.PipBlockerActivity` (singleTask + PiP).
- `ui.passwordrequest.blocker.SettingsPasswordRequestActivity` (بوابة كلمة السر).
- `ui.panicbutton.PanicButtonActivity` + `TrustedContactsActivity` + `EmergencyCallsActivity`.

### 2.5 الصلاحيات (40+) والحقائق المثبتة
- الاتصالات: `READ/RECEIVE/SEND_SMS`، `READ/WRITE_CALL_LOG`، `PROCESS_OUTGOING_CALLS`، `ANSWER_PHONE_CALLS`، `CALL_PHONE`، `READ_CONTACTS`، `READ_PHONE_STATE`.
- المراقبة: `QUERY_ALL_PACKAGES`، `PACKAGE_USAGE_STATS`، `SYSTEM_ALERT_WINDOW`، `ACCESS_FINE_LOCATION`، `READ_HISTORY_BOOKMARKS`.
- الإبقاء: `RECEIVE_BOOT_COMPLETED`، `WAKE_LOCK`، `FOREGROUND_SERVICE`(+`_SYSTEM_EXEMPTED`)، `USE_EXACT_ALARM`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
- **مثبت بالغياب:** `KILL_BACKGROUND_PROCESSES` معلنة ولا استدعاء لها في كامل smali؛ `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` معلنة ولا طلب `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` في كامل smali.
- `application android:persistent="true"` + `meta-data isMonitoringTool=child_monitoring`.

## 3. الحزم الرئيسية (كود التطبيق)

| الحزمة | الدور |
|---|---|
| `com.qustodio.qustodioapp.accessibility/` | معالجات العبث (1836 سطراً) فوق المكتبة |
| `com.qustodio.accessibility/` + `R3/` + `K3/` + `H3/` + `X3/` | مكتبة accessibility: الأنبوب + 29 محللاً + الأحداث |
| `com.qustodio.vpn/` | `HttpVpnService` + `VpnCLib` (JNA) + أخطاء + شهادات |
| `com.qustodio.qustodioapp.vpn/` | `HttpEventVpnService` (الربط) |
| `p224v4/` | محرك قرارات الحظر (التعداد `a` + المنسّق `c`) |
| `qustodio/qustodioapp/api/network/model/rules/` | عقد القواعد (ApplicationRules/TimeRestrictions/…) |
| `com.qustodio.qustodioapp.service/` | `QustodioService` + `DailyWorker` + `messaging/` (FCM) |
| `com.qustodio.qustodioapp.callsandsms/` | SMS/مكالمات |
| `com.qustodio.qustodioapp.receiver/` | الإقلاع/الإدارة/المستخدم/الذعر |
| `com.qustodio.qustodioapp.reporter/` + `workers/` | التقارير والمزامنة |
| `com.qustodio.qustodioapp.ui.blocker/` | طبقة الـ overlay + شاشة الحظر |
| `com.qustodio.qustodioapp.utils/n.java` | الـ SharedPreferences المركزي (مفاتيح `com.qustodio.qustodioapp.*`) |
| `com.qustodio.qustodioapp.screentime/` | `ScreenStateReceiver` |
| `com.qustodio.qustodioapp.safenetworks/` | `SafeNetworks` |

## 4. المكتبات الأصلية [VERIFIED]

| المكتبة | الحجم (arm64) | الدور |
|---|---|---|
| `libqproxy.so` | 5.2MB | محرك البروكسي (QProxyServer/Worker، HTTP/1+2، MITM، OpenSSL 1.1.1m static) |
| `libvpn-lib.so` | 55KB | غلاف JNI (`init/start/stopQProxy` + ردّات `qProxy*Action`) — يعتمد على libqproxy |
| `libjnidispatch.so` | 166KB | JNA runtime |
| `libc++_shared.so` + crashlytics | — | قياسية |

## 5. الطوبولوجيا النهائية [VERIFIED]

تطبيقان منفصلان كلياً (الأهل Cordova/React ↔ الطفل Kotlin أصلي)، بلا قناة مباشرة بينهما؛
الطفل وكيل إنفاذ أحادي يتلقى الأوامر عبر FCM الموقّع اسمياً وينفذ عبر المكدّس الثلاثي،
ويُبقي نفسه حياً بخدمة أمامية + مرساة NotificationListener + مستقبل إقلاع.
