# تحليل الهندسة العكسية العميق — Qustodio Kids App (تطبيق الطفل)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/qustodio.md`) الذي غطى **تطبيق الأهل** (`com.qustodio.family.parental.control.app.screentime` — غلاف Cordova رقيق + React، 5 ملفات أصلية فقط).
> هذه الوثيقة **تغلق فجوة الجولة الأولى صراحةً**: تقرير الأهل انتهى عند «التنفيذ على جهاز الطفل تخمين مرفوض — يلزم APK تطبيق الطفل المنفصل».
> هنا يُحلَّل تطبيق الطفل **`com.qustodio.qustodioapp`** **لأول مرة** — حيث يعيش الإنفاذ الحقيقي كاملاً:
> DeviceAdmin + AccessibilityService + VPN أصلي (QProxy) + مضاد العبث + محرك الحظر.
>
> **ما غطاه تقرير الأهل (لا يُكرَّر هنا):** بنية Cordova/React لتطبيق الأهل، جسر `QustodioPlugin`، توجيه إشعارات Braze/FCM،
> روابط `qustodio://` العميقة المؤجلة، مسارات `auth.qustodio.com/sso/`، هيكل «القواعد» في واجهة الأهل (تطبيقات/مكالمات/موقع/يوتيوب/زر ذعر/ترشيح ويب)، نموذج freemium.
>
> **الجديد كلياً هنا:** كل ما يلي — آلة الإنفاذ على جهاز الطفل من الصفر.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق/الغياب المثبت بالبحث).

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.qustodio.qustodioapp` (تطبيق الطفل — Kids App) |
| الإصدار المحلَّل | 680.78.1.2-family |
| نوع الملف | APK مستقل |
| smali / java | 13,261 / 6,917 (أخطاء jadx: 36) |
| اللغة | Kotlin (مشوَّشة الأسماء جزئياً — حزم `pNNN` رقمية)، Java للطبقات القديمة |
| الدور | **وكيل الإنفاذ على جهاز الطفل**: حظر تطبيقات، ترشيح ويب عبر VPN أصلي، مراقبة اجتماعية، موقع، مكالمات/SMS، زر ذعر، مضاد عبث |
| المنطق مقسّم على | `com.qustodio.qustodioapp.*` (ميزات الطفل) + `com.qustodio.vpn.*` (طبقة VPN) + `com.qustodio.accessibility.*` (مكتبة accessibility مستقلة `a`/parsers) |

### العلاقة أب ↔ طفل ↔ سحابة (الصورة الكاملة) [VERIFIED من الطفل + تقرير الأهل]
```
الأب (تطبيق منفصل: com.qustodio.family.parental.control.app.screentime — Cordova/React)
  → يحرر القواعد في لوحة الويب/الأهل
  → السحابة (تدفع أمر FCM موقَّعاً اسمياً — انظر §5.3)
  → الطفل: FirebaseMessagingService ← HandlePushDataMessageJob ← MessageV1Interpreter
  → يسحب القواعد (update_policy) / يبلّغ الموقع (update_location) / يزامن الإعدادات
  → التنفيذ: AccessibilityService + DeviceAdmin + VPN(QProxy) + حظر بالطبقة
  → التقارير: أحداث (web/youtube/sms/call/location) تُرفع للسحابة
```
**لا يوجد أي اتصال مباشر أب←طفل** — كل شيء عبر السحابة وسيطاً [VERIFIED: لا سوكيت/لا IPC شبكي في الشفرة].

### تدفق الإقران (Pairing) [VERIFIED جزئياً]
- **لا يوجد رمز إقران** (pair code) في تطبيق الطفل — بحث شامل عن `pairCode/matchCode` يعطي صفراً [VERIFIED بالغياب].
- الإقران يتم عبر **دخول الأهل على جهاز الطفل نفسه**: رابط عميق `qustodio://parent-login` → `LoginPasswordRequestActivity`، ورابط `qustodiofamily://` على شاشة البداية [VERIFIED من المانيفست].
- العلم الدائم `com.qustodio.qustodioapp.utils.IS_ACCOUNT_CONFIGURED` في `utils/n.java` (يُقرأ في `i()`، يُكتب في `y0()`) = «الجهاز مُهيأ كجهاز طفل» [VERIFIED].

---

## 2. جرد الـ Manifest [VERIFIED — قُرئ كاملاً]

`~/workspace/rework/qustodio-kids/apktool-out/AndroidManifest.xml` (307 أسطر):

### 2.1 المكونات
| المكوّن | الاسم | ملاحظات |
|---|---|---|
| AccessibilityService | `accessibility.AccessibilityService` (مصدَّرة، `BIND_ACCESSIBILITY_SERVICE`) | الإعداد `@xml/accessibility_config`: `typeAllMask` + `flagIncludeNotImportantViews` + `flagRequestEnhancedWebAccessibility` + `flagReportViewIds` + `flagRetrieveInteractiveWindows`، `canRetrieveWindowContent=true`؛ الـ `notificationTimeout=100` يُضبط برمجياً في `onServiceConnected` |
| VpnService | `vpn.HttpEventVpnService` (غير مصدَّرة، `BIND_VPN_SERVICE`) | `SUPPORTS_ALWAYS_ON=false` |
| DeviceAdmin | `receiver.QustodioDeviceAdminReceiver` (غير مصدَّرة، `BIND_DEVICE_ADMIN`) | الميتا `@xml/device_admin` تعلن `<uses-policies />` **فارغة — صفر سياسات** |
| الخدمة الرئيسية | `service.QustodioService` | `foregroundServiceType="systemExempted"`، إشعار أمامي دائم |
| NotificationListener | `service.RestartServiceNotification` (مصدَّرة، `BIND_NOTIFICATION_LISTENER_SERVICE`) | **7 أسطر فقط** — مجرد امتداد `NotificationListenerService`: مرساة إبقاء حي |
| FCM | `service.messaging.FirebaseMessagingService` (مصدَّرة) | |
| SMS | `callsandsms.sms.SmsOnReceived` (مصدَّرة) | **أولوية قصوى 2147483647** على 5 فلاتر: `SMS_RECEIVED`، `GSM_SMS_RECEIVED`، `SMS_RECEIVED2`، `DATA_SMS_RECEIVED`، `SMS_DELIVER`، `WAP_PUSH_RECEIVED` |
| المكالمات | `callsandsms.call.CallOnProcess` (غير مصدَّرة) | `PHONE_STATE` + `NEW_OUTGOING_CALL` بأولوية قصوى |
| الإقلاع | `receiver.DeviceBootReceiver` | `BOOT_COMPLETED` (أولوية 999) + `MY_PACKAGE_REPLACED` (998) |
| زر الذعر | `receiver.panicmode.PanicButtonEventReceiver` | `HEADSET_PLUG` بأولوية قصوى |
| تبديل المستخدم | `receiver.UserSwitchReceiver` | (مسجَّل برمجياً — `USER_FOREGROUND`/`USER_BACKGROUND`) |
| واجهات الحظر | `ui.blocker.regular.BlockerActivity`، `ui.blocker.blockers.pipblocker.PipBlockerActivity` (singleTask، يدعم PiP) | |
| بوابة كلمة السر | `ui.passwordrequest.blocker.SettingsPasswordRequestActivity` | تُستدعى من الخدمة عند العبث |
| روابط عميقة | `qustodiofamily://` (البداية)، `qustodio://chrome-extension`، `qustodio://parent-login` | |

### 2.2 الصلاحيات (40+) — الأثقل بين كل تطبيقات الأطفال المحلَّلة
`READ_SMS` + `RECEIVE_SMS` + `SEND_SMS`، `READ_CALL_LOG` + `WRITE_CALL_LOG` + `PROCESS_OUTGOING_CALLS` + `ANSWER_PHONE_CALLS` + `CALL_PHONE`، `READ_CONTACTS`، `READ_PHONE_STATE`، `ACCESS_FINE_LOCATION`، `QUERY_ALL_PACKAGES`، `PACKAGE_USAGE_STATS`، `SYSTEM_ALERT_WINDOW`، `KILL_BACKGROUND_PROCESSES`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_SYSTEM_EXEMPTED`، `USE_EXACT_ALARM`، `GET_TASKS`، `com.android.browser.permission.READ_HISTORY_BOOKMARKS`، `DUMP`، `ACCESS_NOTIFICATION_POLICY`…
- `android:persistent="true"` على التطبيق كله + `meta-data isMonitoringTool=child_monitoring` (إعلان Play Store) [VERIFIED].

### 2.3 ملاحظات حمراء/خضراء [VERIFIED]
- **لا `WRITE_SECURE_SETTINGS`** — أنظف من FamiSafe Jr في هذا الباب.
- **`KILL_BACKGROUND_PROCESSES` معلنة لكن لا يُستدعى `killBackgroundProcesses` في أي مكان** (smali كاملاً) — صلاحية ميتة [VERIFIED بالغياب].
- **`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` معلنة لكن لا يوجد أي استدعاء لـ `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`** في كامل smali — الإعفاء من Doze **غير مطلوب برمجياً** [VERIFIED بالغياب].

---

## 3. المكدّس الثلاثي للإنفاذ — DeviceAdmin + Accessibility + VPN

### 3.1 تدفق DeviceAdmin [VERIFIED]
**`jadx-out/sources/com/qustodio/qustodioapp/receiver/QustodioDeviceAdminReceiver.java`** (42 سطراً — قُرئ كاملاً):
- المستقبل **stub شبه فارغ**: `onEnabled`/`onDisabled` تسجّلان فقط؛ `onPasswordChanged` فارغة.
- `onDisableRequested`: تُرجع نص تحذير (`device_admin_disable_warning` + `device_admin_disable_warning2`: «إلغاء تفعيل هذه الميزة قد يسمح بإزالة التطبيق… يمكن للأهل إلغاء التثبيت بأمان بتسجيل الدخول ثم Disable protection > Remove») **فقط إذا** `QustodioApp.n().t().i()` = العلم `IS_ACCOUNT_CONFIGURED` [VERIFIED بتتبع `utils/n.java:545-547` + السطر 223/647].
- **صفر سياسات** في `@xml/device_admin` (`<uses-policies />` فارغة)، و**صفر استدعاء لـ `DevicePolicyManager`** في كامل smali/Java [VERIFIED بالبحث الشامل — لا `lockNow`، لا `wipeData`، لا سياسات كلمة سر].
- **الخلاصة:** الإدارة هنا **مرساة مضادة للإلغاء فقط** — النظام نفسه يمنع إلغاء تثبيت تطبيقٍ إدارته نشطة، والمستقبل يضيف حوار تحذير عند محاولة التعطيل. لا إنفاذ سياسات إطلاقاً.

### 3.2 أنبوب AccessibilityService — خطوة بخطوة [VERIFIED]
**طبقتان:** مكتبة عامة `com.qustodio.accessibility.AccessibilityService` (907 أسطر) + تطبيق الطفل `com.qustodio.qustodioapp.accessibility.AccessibilityService` (1836 سطراً) يرثها.

**أ) الاستقبال والتخزين المؤقت:** `onAccessibilityEvent` في المكتبة **يستنسخ كل حدث عبر Parcel** (`s()`: كتابة/قراءة `Parcel` — لقطة للعقد تبقى صالحة بعد انتهاء الحدث) ثم يدفعه لقائمة متزامنة ويعالجها **كوروتين واحد متسلسل** (يتجاهل الجديد أثناء انشغال السابق — خنق مدمج) [VERIFIED].

**ب) سجل المحلِّلات (29 محللاً):** `R3.c.b()` — `ApplicationParser`، `SettingsParser`، 6 كاشطات محادثات (WhatsApp/Instagram/Line/TikTok/Snapchat/TwitterX)، `SplitScreenParser`، 3 محللات `PopUpView*` (عام/سامسونج+14/شاومي)، محللا لوحة الإشعارات، `SamsungAppsEdgeParser`، `PipScreenParser`، `UninstallLongClickParser`، 5 محللات متصفحات (Chrome/Firefox/Silk/Samsung/Huawei)، `GoogleSearchParser`، 3 محللات يوتيوب (تطبيق/كروم/فايرفوكس)، `DualAppsParser` [VERIFIED].
- كل محلل: `r(package, eventType)` (هل يهمني هذا الحدث؟) ← `v(event, windows)` (افحص العقد) ← يُنتج `K3.a(type: K3.b, data: String, eventTime: Long)` مصنّفاً بفئة `H3.e` (`APPLICATION_USAGE`/`TAMPERING`/`WEB_MONITORING`/`YOUTUBE`/`WHATSAPP`/`INSTAGRAM`/`LINE`/`TIKTOK`/`SNAPCHAT`/`TWITTERX`) [VERIFIED].
- التهيئة `Q(H3.d config)`: تبني المحلِّلات حسب الميزات المفعّلة + **تزرع مطابِق اسم العلامة** `X3.a` (اسم التطبيق + عنوان الإشعار — يُعاد زرعه عند تغيّر اللغة في `onConfigurationChanged`) [VERIFIED].

**ج) كشف التطبيق الأمامي:** `ApplicationParser.v()` يُصدر `K3.b.APPLICATION` مع اسم الحزمة، **مستثنياً**: حزم الإدخال (IME)، اللانشرات (يستعلم `queryIntentActivities(HOME)`)، وقوائم صريحة (`systemui`، خدمات سامسونج/هواوي/شاومي الجانبية، `com.google.android.googlequicksearchbox`، `com.android.settings`) [VERIFIED].

**د) آلية منع إلغاء التثبيت عبر accessibility — `UninstallLongClickParser` [VERIFIED — قُرئ كاملاً]:**
1. على حدث `TYPE_VIEW_LONG_CLICKED` (النوع 2): يقرأ نص العنصر المضغوط (أو عقدة `com.sec.android.app.launcher:id/label` لسامسونج)؛ إذا طابق **اسم التطبيق** عبر `X3.a` (وليس حقل إدخال) ← حدث `UNINSTALL_LONG_CLICK`.
2. على لانشر شاومي (`com.miui.home`): يفتّش عقد `miui:id/parentPanel` ← `com.miui.home:id/uninstall_dialog` ← `com.miui.home:id/title`، ويطابق نص العنوان مع اسم التطبيق.
3. **الرد** (`onUninstallLongClickTamperingEvent`): على SDK>26 يفتح `SettingsPasswordRequestActivity` مباشرة (NEW_TASK من الخدمة)؛ على ≤26 عبر `PendingIntent`؛ ثم يشغّل مسار «العودة للرئيسية» إن كان الحظر مفعّلاً [VERIFIED].
4. إزالة التكرار: `t0()` يتجاهل حدثاً مكرراً خلال **500ms** [VERIFIED].

**هـ) دفاعات العبث الأخرى [VERIFIED]:**
- `SettingsParser` (التجوّل في الإعدادات/الأذونات) ← `onSettingsTamperingEvent`: **بوابة كلمة السر** (`o0()` → `SettingsPasswordRequestActivity`) + رجوع مزدوج + إعادة تقييم الحظر.
- `SplitScreenParser`/`PipScreenParser`/`PopUpView*Parser` (التفاف عبر النوافذ المتعددة/المنبثقة) ← `performToggleSplit` (الإجراء 7)، إيماءات `dispatchGesture` (سحبة من `(width-100, 250)` لمدة 50ms — إغلاق المصغّرات المنبثقة)، و`PipBlockerActivity` لشاشة-داخل-شاشة.
- `NotificationOverlayPanelParser`/`NotificationServicePanelParser` (العبث عبر لوحة الإشعارات).
- الإجراءات العامة: `performBack` (مع حماية من النقر المزدوج — 300ms)، `performHome`، `performDoubleBack` [VERIFIED].

**و) المراقبة الاجتماعية:** `SocialMonitoringParser` (مجرّد، لكل منصة: `WhatsAppChatParser`…) يكشط نصوص المحادثات من العقد؛ يُفعَّل/يُعطَّل عبر `b(socialPlatforms)`/`d()` [VERIFIED هيكلياً — منطق الكشط التفصيلي لكل منصة لم يُقرأ سطراً بسطر].
**ز) يوتيوب:** `YoutubeAppParser` يكشط `com.google.android.youtube:id/title` + `/channel` + `/channel_title` (عنوان الفيديو والقناة من التطبيق)؛ ومحللا متصفح للويب [VERIFIED].
**ح) المتصفحات:** `ChromeParser` يسحب الرابط من `com.android.chrome:id/url_bar` + `/origin` (وهكذا لكل متصفح) — **مراقبة ويب احتياطية عبر accessibility بجانب الـ VPN** [VERIFIED].

### 3.3 محرك قرارات الحظر — `p224v4.c` [VERIFIED]
الدالة `p(foregroundApp: p134m4.a{packageName,…}, allAppsInForeground)` (و`q` المبسّطة) تُقيّم **بالترتيب** وتُرجع أول قرار من تعداد `p224v4.a`:
1. `CLOSE_POPUP_VIEWS` — نوافذ منبثقة مشبوهة ← إغلاقها.
2. `BLOCK_DRAW_OVERLAY_SETTINGS` — شاشة إعداد «العرض فوق التطبيقات» مفتوحة ← حظرها (مضاد عبث!).
3. `LOCK_SETTINGS` — تطبيق الإعدادات في المقدمة ومقفل ← قفل.
4. `LOCK_DEVICE` — قفل الجهاز كله.
5. `BLOCKED_APP` — التطبيق محظور.
6. `DEVICE_TIME_OUT` — انتهت حصة الجهاز اليومية.
7. `APP_TIME_OUT` — انتهت حصة التطبيق.
- التنفيذ (`f`/`l`): `OverlayBlocker` — **طبقة `WindowManager` من النوع 2038 (`TYPE_APPLICATION_OVERLAY`) بملء الشاشة** (`addView` في `OverlayBlocker.java:125-135`) مع عدّاد تنازلي، أو `BlockerActivity` (شاشة الحظر الاعتيادية) [VERIFIED].

### 3.4 عقد القواعد (Rule Contract) [VERIFIED]
`jadx-out/sources/qustodio/qustodioapp/api/network/model/rules/`:
- `ApplicationRules{action: Int, exe: String (الحزمة), platform: Int, monQuota…sunQuota: Int}` — **حصص يومية لكل تطبيق بالأيام السبعة** (الحقل `action` يُرجَّح: سماح/حظر [INFERENCE]).
- `TimeRestrictions{Day, Day, isDailyLimit, isLockComputer, isLockNavigation, isReportAlerts, isWeekdaysQuota, isWeekendQuota}` + `Day{mon,tue,wed,thr,fri,sat,sun: Int}` — نوافذ زمنية/حصص بصيغة أيام صريحة.
- `BrowserRules`، `SocialMonitoringRules`، `ContactBlock`، `Location`، `PanicButtonStatus`، `SafeNetworkRules`، `Services`، `Categories` [VERIFIED وجوداً — الحقول التفصيلية لم تُستخرج كلها].

---

## 4. الـ VPN الأصلي — QProxy [VERIFIED]

### 4.1 البنية
```
HttpEventVpnService (تطبيق الطفل)
  extends com.qustodio.vpn.HttpVpnService (Kotlin مجرّد)
    → VpnService.Builder: العنوان 10.1.10.1/32 (+IPv6)، setHttpProxy(127.0.0.1:port) على SDK 29+
    → per-app: addAllowedApplication(...) لقائمة التطبيقات من إعداد الـ VPN
    → JNI: libvpn-lib.so (55KB — غلاف رفيع) → DT_NEEDED → libqproxy.so (5.2MB — المحرك)
```
- `W7.c` (إعداد الـ VPN): `g()`/`h()` تشغيل/إيقاف عبر intents `com.qustodio.vpn.HttpVpnService.start|stop`؛ **تثبيت شهادة CA للـ MITM عبر `KeyChain.createInstallIntent()`** (الاسم + بايتات `CERT`) مع كشف التثبيت (`HttpEventDetectionSetup.isCertificateInstalled`) [VERIFIED].
- `X7.b{certificate, certificatePrivateKey, clientKey}` تُمرَّر لـ `initQProxy` الأصلي [VERIFIED].

### 4.2 بروتوكول الجسر الأصلي [VERIFIED]
دوال JNI في `libvpn-lib.so`: `initQProxy` / `startQProxy` / `stopQProxy` + ردّات `qProxyDownstreamConnectedAction` / `qProxyTlsDetectedAction` / `qProxyHttpRequestAction` / `qProxyHttpResponseAction` (عبر JNA: `Native.load("vpn-lib", VpnCLib.class)`).
- الإعداد يُسرسل JSON (kotlinx.serialization): نطاق منافذ `[port, port+10]` + **استثناء صريح `*.whatsapp.net ← BAD_REQUEST_THEN_CLOSE`** [VERIFIED حرفياً في `HttpVpnService.o()`].
- الردّات الأصلية → كوروتينات: `onDownstreamConnected` (فحص النطاق: `shouldBlockDomain` ثم `isDomainAllowed` — حظر/سماح/تأجيل)، `onHttpRequest` (يسجَّل الطلب في خريطة `(sessionId,requestId)` ويُرجع `DEFER`)، `onHttpResponse` (يُطابَق الطلب، يُستدعى `vpnNavigationProcessor`، وعند الحظر يُرجع `BLOCK` مع رابط صفحة الحظر)، `onTlsDetected` (دائماً `DEFER`)، `onSessionClosed` (تنظيف الخريطة) [VERIFIED].

### 4.3 ما يفعله `libqproxy.so` (تحليل strings/symbols) [VERIFIED]
- **محرك بروكسي HTTP كامل**: `QProxyServer`/`QProxyWorker`، معالجات `http1` **و`http2`**، `SessionContext`، تعداد إجراءات الجلسة — **يدعم HTTP/2** [VERIFIED من الرموز].
- **MITM للـ TLS**: `sessionHandlers->certificateHandler` + `src/cert/Certificate.cpp` + **OpenSSL 1.1.1m مربوط statically** — يولّد شهادات لكل مضيف موقّعة بالـ CA المثبتة [VERIFIED].
- **صفحة حظر HTML مضمّنة** في الملف نفسه (قالب «Daniel binding block») [VERIFIED].
- **تعابير regex لاستخراج استعلامات البحث** مضمّنة: google/bing/duckduckgo/yahoo/lycos/yandex (`q=`/`p=`/`text=`) — مراقبة البحث الآمن [VERIFIED].
- **محرك مشترك مع نسخة سطح المكتب**: مسارات البناء `/Users/jenkins/jenkins/workspace/desktop-proxy-build_develop/` + سلسلة الوكيل `QustodioProxy/4.7.4` — **نفس المحرك يعمل على أندرويد وسطح المكتب** [VERIFIED].
- الإعداد الافتراضي `{"ffilter":true}` [VERIFIED].

### 4.4 ملاحظة معمارية
الترشيح **مزدوج**: حكم الشبكة في الـ VPN (QProxy) + مراقبة accessibility للمتصفحات (كروم/فايرفوكس/سامسونج/هواوي/Silk) كطبقة احتياطية/تكميلية. لا قائمة حظر روابط محلية ظاهرة في كود الجافا — القرار عبر `navigationPolicyEngine`/`vpnNavigationProcessor` (يُغذَّى من القواعد المسحوبة) [INFERENCE من البنية].

---

## 5. استقبال الأوامر والقواعد والشبكة

### 5.1 خط الأوامر (سحابة ← طفل) [VERIFIED]
`FirebaseMessagingService` ← `HandlePushDataMessageJob` (QWorker) ← **`MessageV1Interpreter`**:
- 7 أفعال موقّعة اسمياً: `update_location` (بلّغ الموقع فوراً)، `update_policy` (اسحب القواعد)، `update_settings` (زامن إعدادات الجهاز)، `update_application` (حدّث التطبيق)، `enable_logging` (تفعيل السجلات لمدة من الترويسة — الافتراضي **604800 ثانية = 7 أيام**)، `upload_logs` (ارفع السجلات)، `disable_panic_mode` (عطّل زر الذعر — يُنفَّذ على خيط الواجهة) [VERIFIED].
- **تحذير أمني [VERIFIED]:** رغم اسم `runSignedMessage` وحقلَي `message`/`signature` في الـ Bundle، التحقق `s()` = **فحص عدم-الفراغ فقط** — لا HMAC ولا توقيع حقيقي في العميل. الثقة كلها في قناة FCM نفسها. (Family OS يجب أن يوقّع فعلياً — انظر §6.)

### 5.2 التقارير (طفل → سحابة) [VERIFIED هيكلياً]
- `reporter/`: `ConfigDeviceReporter` (إبلاغ تلقائي)، `DeviceOptionsReporter` (حالة الميزات)، `EventQueueKt` + نماذج أحداث (`reporter/data/`: application/smscall/web/youtube) [VERIFIED وجوداً].
- `workers/FeaturesStateReportWorker` (CoroutineWorker) + `DailyWorker` (مزامنة يومية: الشبكات الآمنة، التطبيقات المثبتة، أعلام الترخيص، الموقع) [VERIFIED].
- `installedapps/a.java` — مراقبة التطبيقات المثبتة [VERIFIED وجوداً].

### 5.3 المكالمات والرسائل [VERIFIED]
- `SmsOnReceived.onReceive`: يستقبل `SMS_RECEIVED` فقط (يتجاهل البقية رغم الفلاتر) ← `p254y4.a` يفكّك الـ PDU ← `p234w4.b.I(address, body)` (محرك المراقبة) [VERIFIED].
- `CallOnProcess`: `PHONE_STATE` + `NEW_OUTGOING_CALL` ← نفس محرك `p234w4.b` [VERIFIED هيكلياً].
- الصلاحيات المرافقة: قراءة/كتابة سجل المكالمات، معالجة المكالمات الصادرة، الرد على المكالمات، جهات الاتصال [VERIFIED من المانيفست].

### 5.4 الموقع [VERIFIED هيكلياً]
- `Y4.a` (حالة `reportCurrentLocation`) ← مستودع `X4.a` ← `FusedLocationProviderClient` (عبر `V4.a`) + `Geocoder` [VERIFIED]. التفاصيل (الفواصل، الدفعات) مشوَّشة — **Partial**.

### 5.5 زر الذعر [VERIFIED]
- `PanicButtonEventReceiver`: `HEADSET_PLUG` (توصيل ← `e()`، فصل ← `h()`) + زر سماعة البلوتوث (`MEDIA_BUTTON` بالكودين 126/79 عند الرفع `ACTION_UP` ← `d(keyEvent)`) ← المحرك `p225v5.a` ← `PanicModeAlertsWorker` [VERIFIED].
- واجهات: `PanicButtonActivity`، `TrustedContactsActivity`، `EmergencyCallsActivity` [VERIFIED من المانيفست].

### 5.6 الشبكة — حدود الإثبات
- **عناوين API غير ظاهرة statically**: ملفات `assets/qinit/*.json` **مشفرة** (باينري غير مقروء) [VERIFIED]؛ `BaseRequest` يستخدم مسارات نسبية — المضيف الأساسي يُحقن من الإعداد البعيد. → **Partial**: عقد الشبكة الكامل يحتاج مراقبة حية.
- المرصود: `https://qustodio.com` (سلسلة واحدة)، رابط Firebase Database في `strings.xml` [VERIFIED].

### 5.7 الإبقاء الحي (Keep-alive) [VERIFIED]
1. `QustodioService`: `startForeground(12648430, …)` في `onCreate` + `START_STICKY` (عند تفعيل الخدمة) وإلا `START_NOT_STICKY`.
2. `DeviceBootReceiver`: يعيد التشغيل عند `BOOT_COMPLETED`/`MY_PACKAGE_REPLACED` — مع **فحص `wasForceStopped()`** (API 35+: `getHistoricalProcessStartReasons`) — إن أُوقف قسراً **لا يعيد التشغيل** (احترام المنصة).
3. `RestartServiceNotification`: مرساة `NotificationListenerService` فارغة (7 أسطر) — رتبة عملية عالية + إعادة ربط عند الإشعارات.
4. `application android:persistent="true"` [VERIFIED].
5. مستقبلات ديناميكية: `CONNECTIVITY_CHANGE` + `ScreenStateReceiver` (SCREEN_ON/OFF/USER_PRESENT/SHUTDOWN).
6. `UserSwitchReceiver`: يتتبع `USER_FOREGROUND`/`USER_BACKGROUND` ويحدّث العلم `A0` (تكييف مع تعدد المستخدمين).
7. **الغائب المثبت:** لا طلب إعفاء بطارية برمجياً + لا `killBackgroundProcesses` (رغم إعلان الصلاحيتين) — الاعتماد على الخدمة الأمامية + `systemExempted` + الإقلاع.

---

## 6. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**
> ملاحظة معمارية عامة: كل ما يلي «حِيَل» (hacks) تعمل **بدون Device Owner**. في Family OS — حيث المرشّح المعماري هو **Device Owner عبر QR عند الإعداد** — تُستبدل الحيل الـ 4 التالية جذرياً: (أ) مضاد إلغاء التثبيت → `setUninstallBlocked` الأصلية؛ (ب) بوابة كلمة سر الإعدادات → سياسات DO؛ (ج) إخفاء/إظهار الخدمات → امتيازات DO؛ (د) تثبيت CA للـ MITM → `installCaCert` الصامتة. **لكن** تُحفَظ كطبقة توافق للأجهزة التي لا يمكن توفير DO عليها.

| # | المأخوذ | الرتبة | السبب والمسار الدقيق |
|---|---|---|---|
| 1 | **محرك QProxy الأصلي (الفكرة + البروتوكول)** — `com.qustodio.vpn.HttpVpnService` + `VpnCLib` (JNA) + بروتوكول `init/start/stopQProxy` وردّات `qProxy*Action` | 1 | أقوى ترشيح ويب شوهِد: HTTP/2 + MITM + صفحة حظر + regex بحث. المسارات: `jadx-out/sources/com/qustodio/vpn/HttpVpnService.java`، `com/qustodio/vpn/qproxy/VpnCLib.java`، `apktool-out/lib/*/libqproxy.so`. **لا ننسخ الباينري** (ملكية) — نعيد تنفيذ البروتوكول على محرك مفتوح (مثل `tun2socks`/NetGuard-style) بنفس واجهة الردّات. |
| 2 | **جدول قرارات الحظر السباعي** (`p224v4.c.p/q` + تعداد `p224v4.a`) | 1 | `CLOSE_POPUP_VIEWS → BLOCK_DRAW_OVERLAY_SETTINGS → LOCK_SETTINGS → LOCK_DEVICE → BLOCKED_APP → DEVICE_TIME_OUT → APP_TIME_OUT` — أولوية مدروسة تشمل مضاد العبث (حظر شاشة أذونات الـ overlay!). يُعتمد كجدول القرار الرسمي لوكيل الطفل. |
| 3 | **سجل محلِّلات الـ accessibility (29 محللاً)** — `R3.c.b()` | 1 | أشمل تغطية OEM/متصفحات/منصات اجتماعية شوهِدت. انسخ **القائمة** كقائمة متطلبات، وأعد التنفيذ نظيفاً (الأسماء مشوَّشة). `jadx-out/sources/R3/c.java:65-71`. |
| 4 | **آلية `UninstallLongClickParser`** (كشف الضغط المطوّل على الأيقونة + حوارات MIUI بالنص/الـ view-ID + بوابة كلمة السر) | 2 | أفضل مضاد إلغاء بدون DeviceAdmin. الملف: `jadx-out/sources/com/qustodio/accessibility/parser/tampering/UninstallLongClickParser.java` (قُرئ كاملاً). مع DO تُستبدل بـ `setUninstallBlocked`. |
| 5 | **عقد القواعد** (`ApplicationRules` بالحصص اليومية + `TimeRestrictions`/`Day`) | 1 | `api/network/model/rules/` — أنظف من ترميز FamiSafe النصي: حقول صريحة `monQuota…sunQuota`. يُعتمد كنموذج بيانات الحصص. |
| 6 | **استنساخ الأحداث عبر Parcel + المعالجة أحادية الطيران** في خدمة الـ accessibility | 2 | `com/qustodio/accessibility/AccessibilityService.java: s()` + `onAccessibilityEvent` — يحل مشكلة صلاحية العقد بعد انتهاء الحدث + الخنق الطبيعي. انسخ النمط. |
| 7 | **مفردات أوامر FCM السبع** + قناة `HandlePushDataMessageJob` | 2 | `update_location/update_policy/update_settings/update_application/enable_logging/upload_logs/disable_panic_mode` — قائمة جاهزة؛ **أضف توقيع HMAC حقيقي** (هم لا يتحققون!). `service/messaging/interpreter/MessageV1Interpreter.java`. |
| 8 | **حزمة الإبقاء الحي** (أمامية دائمة + `systemExempted` + مرساة NotificationListener + فحص `wasForceStopped` + `persistent=true`) | 2 | مرجع صلابة شامل؛ راجع `systemExempted` (يتطلب إذناً خاصاً) و`persistent` (لا يُمنح إلا لتطبيقات النظام — **تحقق**). |
| 9 | **تثبيت CA للـ MITM عبر KeyChain** + كشف التثبيت | 2 | `W7/c.java` (`createInstallIntent` + `CERT`) — التدفق الصحيح؛ مع DO يُستبدل بـ `installCaCert` الصامت. |
| 10 | **استثناء `*.whatsapp.net ← BAD_REQUEST_THEN_CLOSE`** في إعداد البروكسي | 3 | نمط «الاستثناءات السلوكية» لكل مضيف في إعداد الجلسة — يُعمَّم. `HttpVpnService.o()`. |
| 11 | **كاشطات يوتيوب/المحادثات/المتصفحات** (view-ID لكل تطبيق) | 3 | تغطية واسعة لكن **هشة** (تتكسر مع كل تحديث) — طبقة ثانوية خلف ذكاء خادمي، كما في FamiSafe. |
| 12 | **زر الذعر عبر HEADSET_PLUG + زر السماعة** | 3 | فكرة غير تقليدية (ملحق سماعة = زر ذعر مادي) — تُدرس كميزة تميّز. |
| ✗ | **عدم التحقق من توقيع الأوامر** (`s()` = فحص عدم-الفراغ) | ✗ | ثغرة: أي FCM مخترَق = تنفيذ أوامر. Family OS: HMAC-SHA256 بمفتاح جهاز. |
| ✗ | صلاحيات معلنة بلا استخدام (`KILL_BACKGROUND_PROCESSES`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` بلا كود) | ✗ | تطلب مراجعة Play بلا فائدة — لا تُعلن إلا ما يُستخدم. |
| ✗ | `persistent="true"` (لا يُمنح لتطبيقات المتجر) | ✗ | لا تعتمد عليه في التصميم. |

### الفجوة الاستراتيجية التي يملؤها هذا التحليل
تقرير الجولة الأولى ترك «التنفيذ على جهاز الطفل» كتخمين مرفوض. الآن نملك **الآلة الكاملة**: من أمر FCM (`update_policy`) إلى قرار الحظر السباعي (`p224v4.a`) إلى الطبقة (`TYPE_APPLICATION_OVERLAY`) إلى ترشيح الشبكة (QProxy/MITM). هذا — مع FamiSafe Jr وBark Kids — يعطي Family OS **ثلاثة نماذج إنفاذ** للمقارنة: Qustodio (الأقوى تقنياً: VPN أصلي + 29 محللاً)، FamiSafe (الأبسط: طبقة + دفاعات)، Bark (الأذكى: ONNX على الجهاز).

---

## 7. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **مضيف API الأساسي**: ملفات `assets/qinit/*.json` مشفرة — عناوين السحابة الدقيقة تحتاج مراقبة شبكية حية [Partial].
2. **وحدات الحصص** في `ApplicationRules` (`monQuota` إلخ): دقائق أم ثوانٍ؟ [INFERENCE: دقائق — غير محسوم].
3. **دلالة `action`** في `ApplicationRules` (0/1/2 = ؟) [INFERENCE: سماح/حظر/تقييد].
4. **تغذية `navigationPolicyEngine`**: كيف تصل القواعد المسحوبة إلى حكم الـ VPN — الرابط الدقيق بين `update_policy` و`vpnNavigationProcessor` لم يُتتبَّع [Partial].
5. **منطق كشط المحادثات التفصيلي** لكل منصة (WhatsApp/Instagram/…) — الهيكل مؤكد، الـ view-ID الدقيقة لكل نسخة تطبيق لم تُستخرج [Partial].
6. **سياسة إعادة اتصال الـ VPN** عند سقوطه (watchdog؟) — لم تُرصد آلية مراقبة صريحة [INFERENCE: يعتمد على START_STICKY].
7. **`persistent="true"`**: هل يُمنح فعلياً لتطبيق متجر؟ [INFERENCE: لا — يُتجاهل لغير تطبيقات النظام].
8. **تشفير `qinit`**: الخوارزمية/المفتاح — لم تُحلَّل [Not Found].
9. **لماذا `SUPPORTS_ALWAYS_ON=false`** رغم أن الترشيح يحتاجه؟ [INFERENCE: تجنّب تحذير النظام الدائم / السماح بإيقاف مؤقت].
10. **مصير `DualAppsParser`** (تطبيقات مزدوجة/استنساخ): موجود في السجل — سلوكه لم يُقرأ [Partial].

---

## 8. خريطة الملفات المرجعية (مسارات دقيقة)

كل المسارات تحت `~/workspace/rework/qustodio-kids/`:
- `jadx-out/sources/com/qustodio/qustodioapp/receiver/QustodioDeviceAdminReceiver.java` — مستقبل الإدارة (stub + تحذير).
- `jadx-out/sources/com/qustodio/accessibility/AccessibilityService.java` — مكتبة الـ accessibility (الأنبوب/الإيماءات).
- `jadx-out/sources/com/qustodio/qustodioapp/accessibility/AccessibilityService.java` — معالجات العبث (1836 سطراً).
- `jadx-out/sources/com/qustodio/accessibility/parser/tampering/UninstallLongClickParser.java` — مضاد إلغاء التثبيت.
- `jadx-out/sources/R3/c.java` — سجل المحلِّلات الـ 29.
- `jadx-out/sources/com/qustodio/accessibility/parser/application/ApplicationParser.java` — كشف التطبيق الأمامي.
- `jadx-out/sources/p224v4/c.java` + `p224v4/a.java` — محرك قرارات الحظر السباعي.
- `jadx-out/sources/com/qustodio/qustodioapp/ui/blocker/overlay/OverlayBlocker.java` — طبقة الحظر (2038).
- `jadx-out/sources/com/qustodio/vpn/HttpVpnService.java` — خدمة الـ VPN المجردة.
- `jadx-out/sources/com/qustodio/qustodioapp/vpn/HttpEventVpnService.java` — ربط الأحداث.
- `jadx-out/sources/com/qustodio/vpn/qproxy/VpnCLib.java` — واجهة JNA الأصلية.
- `jadx-out/sources/W7/c.java` — إعداد VPN + تثبيت شهادة MITM.
- `apktool-out/lib/*/libqproxy.so` — محرك QProxy (5.2MB)؛ `libvpn-lib.so` — الغلاف JNI.
- `jadx-out/sources/com/qustodio/qustodioapp/service/messaging/interpreter/MessageV1Interpreter.java` — مفردات الأوامر السبع.
- `jadx-out/sources/com/qustodio/qustodioapp/service/QustodioService.java` — الخدمة الأمامية الدائمة.
- `jadx-out/sources/com/qustodio/qustodioapp/receiver/DeviceBootReceiver.java` — الإقلاع + فحص `wasForceStopped`.
- `jadx-out/sources/qustodio/qustodioapp/api/network/model/rules/` — عقد القواعد.
- `jadx-out/sources/com/qustodio/qustodioapp/callsandsms/` — مراقبة SMS/المكالمات.
- `jadx-out/sources/com/qustodio/qustodioapp/receiver/panicmode/PanicButtonEventReceiver.java` — زر الذعر.
- `apktool-out/AndroidManifest.xml` + `apktool-out/res/xml/accessibility_config.xml` + `apktool-out/res/xml/device_admin.xml`.
- `apktool-out/assets/qinit/` — الإعداد البعيد المشفّر.
