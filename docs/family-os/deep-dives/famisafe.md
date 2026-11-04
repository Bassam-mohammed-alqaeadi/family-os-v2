# تحليل الهندسة العكسية العميق — Wondershare FamiSafe (الأب + الطفل)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/famisafe.md`) الذي غطى تطبيق الأب وحده وسجّل فجوة تطبيق الطفل كحد معلن.
> هذه الوثيقة **تغلق تلك الفجوة**: تطبيق الطفل (FamiSafe Jr / Fammy) يُحلَّل هنا **لأول مرة**.
> ملاحظة سياقية: تسوية التناقضات (2026-11-04) حسمت أن FamiSafe لم يُنجز فعلياً في فرع `feat` —
> فهذا أول توثيق حقيقي مكتمل للمنظومة (أب + طفل).
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).

---

## 1. نظرة عامة

| البند | تطبيق الأب (Parent) | تطبيق الطفل (Child) |
|---|---|---|
| الحزمة | `com.wondershare.famisafe` | `com.wondershare.famisafe.kids` (الاسم التجاري: Fammy) |
| الإصدار المحلَّل | 9.1.7.1023 | 9.1.7.1023 |
| نوع الملف | APK مستقل (~68MB) | XAPK ← base APK مستخرج (~77MB) |
| smali / java | 42,451 / 17,110 | 34,874 / 17,950 |
| أخطاء jadx | ~150 (~1.1%) | 64 |
| الدور | تحرير القواعد، التقارير، الفوترة، الإقران | **التنفيذ الفعلي**: حظر، تصفية، مراقبة، موقع |
| المنطق مقسّم على | `com.wondershare.famisafe.parent.*` + `common.*` + `share.*` | `com.wondershare.famisafe.child.*` (مداخل رقيقة) + `com.wondershare.famisafe.kids.*` (كل المنطق) |

### العلاقة أب ↔ طفل ↔ سحابة (الصورة الكاملة) [VERIFIED]
```
الأب: يحرر القواعد (UI)
  → POST v4/app-block/save (form-urlencoded, جداول مُرمَّزة بفواصل)
  → السحابة: data-api.famisafe.com (تخزن + تدفع)
  → الطفل: يستقبل عبر FCM/WebSocket → يسحب ControlsBean كاملاً (GET v4/gather/controls-init)
  → يخزن محلياً (SharedPreferences JSON) → إعادة تحميل ساخنة عبر EventBus
  → التنفيذ: AccessibilityService + DeviceAdmin + Foreground Services
  → التقارير/التنبيهات: تُرفع للسحابة (POST v1/gather/*) → الأب يسحبها دورياً (GET v5/notification/list-get)
```
**لا يوجد أي اتصال مباشر أب←طفل** (لا سوكيت، لا IPC شبكي) — كل شيء عبر السحابة وسيطاً [VERIFIED].

### تدفق الإقران (Pairing) [VERIFIED]
1. الأب: `PairCodeActivity.requestPairCode()` ← `GET v4/match-code/get` → `PairCodeBean{match_code, install_url}` — يعرض الرمز + QR.
2. الطفل: يثبت التطبيق ويدخل الرمز ← `POST v5/member/match-code-login`.
3. الأب: يستطلع `GET /v4/match-code/device-get` + يستمع `ActionMessageEvent` لاكتشاف الربط ← يحدّث قائمة الأجهزة.
- المسارات الدقيقة: `apktool-out/smali_classes5/.../parent/guide/PairCodeActivity.smali` (الأب).

---

## 2. الغوص العميق — تطبيق الأب

### 2.1 جرد الـ Manifest [VERIFIED — قُرئ كاملاً]
`~/workspace/rework/famisafe/apktool-out/AndroidManifest.xml` (415 سطراً):
- **129 نشاطاً** (كلها تقريباً `exported=false`)؛ البوابة `CheckRoleSplashActivity` (مصدَّرة).
- **21 خدمة**: أبرزها `parent.ParentNotifyService` — **مصدَّرة**، `foregroundServiceType="specialUse"` — إشعار أمامي دائم (نمط إبقاء خدمة الرقابة حية).
- **14 مستقبلاً**: `parent.reconnect.NetworkReconnectReceiver` (**مصدَّر**)، Evernote `JobBootReceiver`.
- **8 مزودين**: `FileProvider`، `WhatsAppSlotSyncProvider`، FirebaseInitProvider…
- **37 صلاحية**: موقع دقيق/خلفي، تقويم، كاميرا، بلوتوث، فوترة، منبه دقيق… **ولا SMS/جهات اتصال/سجل مكالمات/مايك في الأب** — كلها في تطبيق الطفل [VERIFIED].
- **روابط عميقة**: `famisafe.page.link`، `famisafe://`، `famisafe.go.link/SubscribePage`؛ رد OAuth يوتيوب حقيقي.
- **علامات حمراء** [VERIFIED]: `usesCleartextTraffic="true"`؛ **مفتاح Google Maps مسرّب في الـ manifest** (`AIzaSyDXMlASBQ6sbSVZsvZn4N3JHRQpP2WURWU`) — لا يُعاد استخدامه أبداً.

### 2.2 عقد القواعد (Rule Contract) [VERIFIED — قُرئت الملفات كاملة]
- `jadx-out/sources/com/wondershare/famisafe/common/bean/DeviceRuleBean.java` — Kotlin data class بحقول snake_case **بدون `@SerializedName`** (Gson يسرسل بأسماء الحقول): `apps: List<App1>`، `block_app_icons`، `block_device` (حظر الجهاز كله)، `platform`، `schedule: List<List<String>>`، `screen_time: ScreenTime1`، `vpn_apps: List<VpnApp>`.
- `App1.java`: `package_name`، `name`، `block`، `block_type`، `allow_time`، `usage_time`، `schedule` (أسبوعي).
- `ScreenTime1.java`: `allow_time`، `screen_time_second`، `allow_time_left`.
- **المسار الكامل المُتتبَّع** (تعديل الأب → الشبكة) [VERIFIED في smali]:
  `AppRuleLimitAndroidFragment.saveLimitRules()` يبني `Map<String,String>` بالسلاسل المرمزة ← `HttpParamUtils.getPostBody(map)` (form-urlencoded) ← `FamiParentService.requestAppBlockSaveV5` ← **`POST v4/app-block/save`**.
- `DeviceRuleBean` **نموذج قراءة فقط** — لا كُتّاب له في Java/smali [VERIFIED].

### 2.3 خط التنبيهات (طفل → أب) [VERIFIED]
- التنبيهات **مخزنة في السحابة والأب يسحبها دورياً** (ليست دفعاً): `GET v5/notification/list-get` → `NotifyDetailBean{day_marking, filter, list, next_start_primary_key}` (ترقيم صفحات بالمؤشر).
- `NotifyBean`: `id, device_id, type, content, sub_title, image_url, log_time, detected_time, kid_nickname, attr{app_name, is_suspicious, …}`.
- تصنيف `model` (من `parent/notify/NotifyTool.getType`): `youtube_alert`، `screen_time`، `safe_search`، `suspicious_sms`، `suspicious_picture`، `geo_fence`، `drive_safety`، `app_block`… — يُوجَّه كل نوع لبطاقة لوحة تحكم.
- `ParentNotifyService` مجرد **إبقاء حي** (foreground دائم) وليس ناقل تنبيهات [VERIFIED بالقراءة الكاملة].

### 2.4 الاشتراكات [VERIFIED]
- **SKUs** (`share/payment/BillingConstants.java`): `famisafe_monthly/quarterly/annual_subscription` (+ نسخ `_uac_` و`_kids_` و`_first_coupon` و`lifetime_sub` و`price_test_*`). عميل فوترة Google Play 9.1.0؛ تحقق خادمي `POST v{1,5}/payment/notify`.
- **البوابة:** `SpLoacalData.isVip()` = `member_level == 1` **أو** `empower_expire` مستقبلي — الحالة **خادمية** تُحفظ محلياً. أكواد 492/509/**513** تعني انتهاء الاشتراك وتُعطّل الحساب محلياً.
- القمع مُجهَّز تحليلياً بعنف حول التسجيل/الربط (أحداث `Pay00001…Pay00010`) [VERIFIED].

---

## 3. الغوص العميق — تطبيق الطفل (أول تحليل على الإطلاق)

### 3.1 جرد الـ Manifest [VERIFIED — قُرئ كاملاً]
`~/workspace/rework/famisafe-jr/apktool-out/AndroidManifest.xml` (408 أسطر):
- **AccessibilityService**: `com.wondershare.famisafe.child.accessibility.SCAccessibilityService` (مصدَّرة، `BIND_ACCESSIBILITY_SERVICE`)، الإعداد `@xml/accessibility_service_config`: `typeAllMask` + `feedbackAllMask`، `notificationTimeout=100`، `canRetrieveWindowContent=true`، **`canTakeScreenshot=true`** (لقطات شاشة عبر accessibility!).
- **DeviceAdmin**: `com.wondershare.famisafe.child.ui.permission.DeviceAdmin` (مصدَّرة) — الميتا تعلن **`<force-lock />` فقط**.
- **مراقب الإشعارات**: `kids.notify.MyNotificationMonitorService` (نوع أمامي `location|microphone`).
- **MainService** (`kids.MainService`): `persistent=true`، نوع `location|microphone`.
- **WatchDogService** (+ `WatchDogNotificationService`) في عملية **`:watch`** — إبقاء حي ثنائي العمليات.
- **مستقبلات**: `myReceiver` (BOOT/CONNECTIVITY/WIFI/SHUTDOWN)؛ `WakeUpReceiver` + `WakeUpAutoStartReceiver` في `:watch`؛ منبهات `com.famisafe.alarm.*` (موقع/شاشة/مايك/مزامنة).
- **FCM**: `share.FirebaseMessageReceiver`.
- **واجهات الحظر**: `InterceptionAppActivity` (singleTop، noHistory، مستبعدة من الأخيرة)، `UninstallActivity`، `HintUninstallActivity`، `YoutubeInterceptActivity`، `BlockCallActivity`.
- **صلاحيات لافتة**: `QUERY_ALL_PACKAGES`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `SYSTEM_ALERT_WINDOW`، `PACKAGE_USAGE_STATS`، `REQUEST_DELETE_PACKAGES`، `WRITE_SECURE_SETTINGS` (معلنة؛ لا تُمنح إلا لتطبيقات النظام — على الأرجح طموحة)، موقع خلفي، `RECORD_AUDIO`، كاميرا، منبهات دقيقة.

### 3.2 تدفق DeviceAdmin [VERIFIED]
`jadx-out/sources/com/wondershare/famisafe/child/ui/permission/DeviceAdmin.java` — **شبه فارغ**: كل الـ callbacks تسجّل فقط وتستدعي `super`. `onDisableRequested` تُرجع `null` (لا نص تحذيري).
- السياسة الوحيدة `force-lock` → الإدارة تُستخدم لـ **`DevicePolicyManager.lockNow()`** فقط، لا لسياسات.
- التفعيل: `kids/permission/special/AdminActivePermission.java` — intent قياسي `ACTION_ADD_DEVICE_ADMIN`.
- **منع إلغاء التثبيت عبر الإدارة ليس في المستقبل نفسه** — بل: (أ) النظام يمنع الإلغاء قبل إلغاء تفعيل الإدارة، و(ب) طبقة accessibility تلتقط حوار إلغاء التفعيل (`AdminDefence`)، و(ج) الرد بقفل الجهاز (`AppDefenceUtils.g()`). **لا بوابة كلمة سر في الكود.**

### 3.3 تدفق AccessibilityService — خطوة بخطوة [VERIFIED]
**أ) المدخل:** `child/accessibility/SCAccessibilityService.java` (180 سطراً) — **موزّع فقط**: يتجاهل أحداث لوحة المفاتيح نفسها، ويمرر الباقي (عندما `getCurrentUserRole() == 4` أي دور الطفل) إلى `kids.accessibility.AccessibilityManager`.
**ب) الموجّه:** `kids/accessibility/AccessibilityManager.java` — منفذ أحادي `"accessibility_manager"` وقائمتا مراقبين:
- **مراقبون عامون** (يرون كل حدث): `AppUsageStrategy` + `AppBlockStrategy`.
- **مراقبون حسب الحزمة**: `AppDefenceUtils` (مضاد العبث)، `WebBlockHandler` (تصفية الويب)، `TikTokViewHistoryMonitor`، `YoutubeMonitor`، **~38 كاشط محتوى اجتماعي** (`Instagram80Monitor`، `WhatsApp80Monitor`، `Telegram80Monitor`، `Snapchat80Monitor`، `Discord80Monitor`، `Signal80Monitor`، `XTwitter80Monitor`، `Spotify80Monitor`…) — "80" = نسخ تحليل العقد لأندرويد 8.0+؛ تكشط نصوص الرسائل من عقد accessibility.
**ج) مسار الحظر (موجَّه بالأحداث):** `AppBlockStrategy.AppBlockAccessibilityProxy`:
1. يتتبع الحزمة الحالية؛ يتجاهل `systemui` ونوافذ الإدخال؛ يتجاهل إذا ضُغط HOME قبل <5 ثوانٍ.
2. عند `TYPE_WINDOW_STATE_CHANGED`: يتجاهل النوافذ غير المرئية (>100px) — لمنع حظر نوافذ خلفية منبثقة.
3. `AppInterceptionUtils.onAccessibilityEvent(...)` تُرجع null للذات/systemui/القائمة البيضاء (`WhiteAppManager`)/غير تطبيقات اللانشر؛ وإلا تُقيّم بالترتيب: **ScreenBlockHelper (وقت الشاشة) ← ScheduleBlockHelper (الجداول) ← AppBlockHelper (حظر التطبيق)** وتبني intent لـ `InterceptionAppActivity`.
4. **التنفيذ**: نافذة منبثقة `InterceptionAppPopupWindow` (WindowManager overlay)، وإن فشلت ← `InterceptionAppActivity`؛ ثم طبقة **ملء الشاشة** (`TYPE_APPLICATION_OVERLAY=2032`) مع `BlockView` **يبتلع زر الرجوع** ويخفي أشرطة النظام. الحظر = **شاشة فوق التطبيق الذي ما زال يعمل**؛ زرّا السماح/الطلب ينفذان HOME ويبثان `HIDE_BLOCK`.
**د) مسار الحظر (استطلاعي احتياطي):** حلقة `HandlerThread("app_block_thread")`: `UsageStatsManager` على نافذة `[now-1000ms, now]` ← إعادة تقييم. الإيقاع تكيفي: **SLOW_BLOCK=30s** عند عمل مسار UsageStats، **FAST_BLOCK=2s** عند الاعتماد على accessibility وحده.
**هـ) كشف محاولة إلغاء التثبيت:** ليس تحليل intents — بل **كشط واجهة**: `LauncherHwDefence` يراقب `com.google.android.packageinstaller` + اللانشر بحثاً عن حوارات تحوي اسم التطبيق (هواوي).
**و) استخراج روابط الويب:** `BrowserMonitor` يحمل خريطة view-ID لكل متصفح (Chrome `com.android.chrome:id/url_bar`، Firefox، Opera، DuckDuckGo، Edge، متصفح AOSP…) + يطابق **أي حزمة تحوي "browser"**؛ يسحب نص شريط العنوان + regex للروابط ← `WebBlockHandler` على خيط `"BlockHandler"`.
**لا `killBackgroundProcesses` / `forceStopPackage` / `Process.killProcess` في أي مكان** [VERIFIED بالبحث] — التطبيقات المحظورة **لا تُقتل أبداً**؛ تبقى تعمل تحت الطبقة.

### 3.4 مضاد العبث [VERIFIED — قُرئ كاملاً]
**`AppDefenceUtils`** (374 سطراً) — 9 دفاعات تُجرَّب بالترتيب لكل حدث (خنق: مرة/60 ثانية):
- `LauncherHwDefence` / `LauncherMiDefence` / `LauncherLongClickDefence` — اعتراض حوارات إلغاء التثبيت حسب لانشر الشركة.
- `DateSetDefence` — يكشف صفحات "التاريخ والوقت" **بـ 8 لغات** (en/de/es/fr/pt/ja/it/ko) نصاً وحدود عرض — لمنع العبث بالساعة (تجاوز الجداول).
- `MiAppInfoDefence`، `AppInfoDefence` — يلتقطان صفحات معلومات التطبيق (إيقاف إجباري/إلغاء تثبيت/صلاحيات)؛ فرع شاومي.
- `GooglePermissionController`، `AccessibilityDefence` — يلتقطان صفحات تفاصيل خدمة accessibility.
- `AdminDefence` (33 سطراً) — يلتقط تحذير **إلغاء تفعيل مدير الجهاز**: `com.android.settings:id/admin_warning` + اسم التطبيق.
**عند التفعيل** — `g(context, ignoreTime)` = "قفل الجهاز" [VERIFIED]:
```java
BACK + HOME + إظهار HintUninstallActivity (تحذير) … ثم DevicePolicyManager.lockNow()  // قفل الشاشة
```
لهذا وُجدت سياسة `force-lock` الوحيدة!
**استثناءات ذاتية:** نافذة 30 ثانية عند توجيه التطبيق نفسه للطفل نحو الإعدادات؛ نافذة 60 ثانية لتدفق إلغاء التثبيت الخاص به.
**مراقبة الصلاحيات:** كل فتح للإعدادات يجدول بعد 5 ثوانٍ `checkPermissionChange()` ← رفع الحالة الكاملة (`POST v1/gather/permission-update`: accessibility/usage-stats/device-admin/location/mic/…) + `GET /v1/gather/android-supervised-update`.
**غير موجود:** لا معالجة للوضع الآمن، لا إخفاء من مدير المهام.

### 3.5 ميكانيكا الحظر [VERIFIED]
- **مخزن القواعد:** SharedPreferences ملف **`"controls_init_v5"`** مفتاح **`"key_controls_init"`** — كامل `ControlsBean` كـ JSON (Gson). يكتبه `MainService.U()` بعد `requestControlsInit`؛ يعيد `AppBlockHelper.initBlockRule()` تحليله إلى `Map<packageName, List<AppBlockBean>>`.
- **مخطط `AppBlockBean`:** `id`، `package_name[]`، `block_type` (1=تحديد، 2=حظر دائم)، `allow_time[]` (ثواني لكل يوم أسبوع، -1=بلا حد)، `start_time[]/end_time[]` ("HH:mm" لكل يوم، تُعالَج الامتدادات الليلية)، `download_protect`.
- **محاسبة الاستخدام:** ملف `"sp_appusetime_record"` يراكم الميلي ثانية لكل تطبيق.
- **التحديث الساخن:** EventBus `MMKVChangeEvent("key_controls_init")` ← إعادة تحميل القواعد ← يلتقطها التنفيذ عند الحدث التالي (+ `ruleChangeTriggerEventNow()` يجبر إعادة فحص فورية).

### 3.6 تصفية الويب على الطفل [VERIFIED]
- الطفل **ينفذ نعم**، لكن **الحكم خادمي**: `BlockHandler` يستدعي **حاجباً** `ChildAPIService.requestWebFilter(url, …)` ← `GET v1/gather/web-filter-check?url=…&block_keywords=…&device_id=…` (مهلة 10 ثوانٍ) ← `WebFilterBean{block_type, is_search_engine}`.
- **تخزين مؤقت:** block=60 ثانية، allow=300 ثانية؛ يُمسح عند دفع `web_filter_update`.
- **عند الحظر:** يُعيد توجيه المتصفح بـ intent إلى `https://famisafeapp.wondershare.com/site/web-block.html?url=…` (مع معالجة خاصة لأندرويد 13+). **لا قائمة حظر روابط محلية** في كود الطفل [INFERENCE: القواعد خادمية].
- سجل التصفح يُرفع خادمياً (`HistoryCallableTask` + `WebHistoryRepair` للفاشل).

### 3.7 استقبال الأوامر (سحابة ← طفل) [VERIFIED — مُتتبَّع من الطرف للطرف]
1. **الناقلان:** FCM (`FirebaseMessageReceiver`) **و** WebSocket دائم (`kids/websocket/WebSocketHelper`، الرمز من `GET v5/member/ws-token`) ← كلاهما يغذي **`share.u`** ("PushManager"): إزالة تكرار حسب `id` (آخر 50) ← توزيع على المستمعين.
2. **المستمع:** `ChildPushListener` يعالج مباشرة: `screen_limit`، `notify`، `web_filter_update` (مسح كاش الويب)، `log_switch`، `screenshot` (لقطة عبر accessibility API 30+)، `recorder_start/stop` (تسجيل محيطي ← `POST new-api/v1/ambient-sound/upload-audio-file`). **الباقي ← EventBus `ActionMessageEvent`**.
3. **تطبيق القواعد:** `MainService.onMessageEvent` — `controls_init_update` / `settings_update` / `location_frequency` ← `GET v4/gather/controls-init` ← كتابة `controls_init_v5` ← `MMKVChangeEvent` ← إعادة التحميل (§3.5). تردد الموقع (1/2/3) يُعاد تخطيطه إلى **20/5/10 دقائق**.
4. **مفردات FCM الكاملة** (30 فعلاً من `FirebaseAction`): `gather_now`، `controls_init_update`، `query_status`، `start_monitor`، `stop_monitor`، `screen_limit`، `gather_gps`، `log_switch`، `web_filter_update`، `screenshot`، `settings_update`، `recording`، `stop_record`، `location_frequency`، `new_data`، `refresh_devices_list`، `notify`، `update_pin`، `supervised`، `location_sos`…

### 3.8 تقارير الموقع [VERIFIED]
- **المحرك:** `livelocation/collect/LocationHelp.java` — `FusedLocationProviderClient`، `PRIORITY_BALANCED_POWER_ACCURACY`، فاصل ساعة؛ `getLastLocation` بمهلة 1.5 ثانية.
- **الخط:** `LocationAssist` يجمّع `LocationBean` (سقف 100) ← **`POST v1/gather/gps`**؛ `RealtimeHelp.childUploadGps()` للدفعات الفورية.
- **السياج الجغرافي: على الجهاز.** `kids/geofences/CustomGeoFence.java` — تنفيذ **مخصص** (ليس Google Geofencing API): قائمة الأسوار من `ControlsBean.gps_fence`، حساب مسافة يدوي `ComputeDistance`، الدخول/الخروج يُحفظ في `"geofence_check_time"` (إزالة تكرار 5 دقائق) ← **`POST v1/gather/geo-fence-log`**.

### 3.9 التهرب من البطارية [VERIFIED]
- **إعفاء Doze:** `Util.java:217-235` — حوار ثم `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
- **خدمات أمامية:** `MainService` (دائم)؛ `WatchDogService` في عملية `:watch` يفعل `startForeground()` ثم `stopSelf()` — **حيلة إخفاء الإشعار** الكلاسيكية.
- **العفريت المتبادل:** `kids/deamon/DaemonProcess.java` — إعادة تشغيل متبادلة بين العمليتين عند التدمير.
- **المشغلات:** `WakeUpReceiver`/`WakeUpAutoStartReceiver` (BOOT/CONNECTIVITY/POWER/PACKAGE_*)؛ evernote android-job (`KeepAliveJob` كل 15 دقيقة، `DataSyncJob`)؛ androidx.work `DataSyncWorker`؛ منبهات دقيقة `com.famisafe.alarm.*`.
- **قوائم الشركات:** `MIUIStartPermission` (`com.miui.powerkeeper`)، `HwPermission` (هواوي) — **لا Oppo/Vivo** [VERIFIED بالبحث].

### 3.10 خطافات الذكاء الاصطناعي على الجهاز [VERIFIED غائبة]
- **صفر** نتائج لـ `onnx` / `tflite` / `tensorflow` / `mlkit` في كامل المصادر؛ **لا ملفات `.so`** أصلاً (لا مجلد `lib/`)؛ **لا نماذج** `.tflite`/`.onnx`/`.pb` في الأصول.
- حزمة `kids/socialapp/ai/` **تسمية مضللة** — مجرد كاشطات نصوص accessibility، لا استدلال.
- `ControlsBean` تحوي `ai_switch { int fammy }` — علَم عددي لا يستهلكه منطق عميل [INFERENCE: بوابة ميزة خادمية].
- كشف NSFW/المشبوه **خادمي بالكامل**: رفع صور (`POST v1/gather/suspicious-img`)، رسائل مشبوهة بقواعد كلمات مفتاحية عميلة + رفع (`POST v1/gather/suspicious-sms`)، لقطات شاشة (`POST new-api/v1/screen-viewer/save-image`)، صوت محيطي (`POST new-api/v1/ambient-sound/upload-audio-file`).
- **الخلاصة:** الطفل يفعل **صفر استدلال على الجهاز** — كل "الذكاء" تصنيف خادمي لملفات مرفوعة. (تباين: Bark Kids يشحن ONNX Runtime على الجهاز.)

---

## 4. محرك وقت الشاشة — مفككاً بالكامل

### 4.1 ترميز الجداول (تطبيق الأب) [VERIFIED]
**الملف:** `jadx-out/sources/com/wondershare/famisafe/parent/screenv5/ScreenTimeTool.java` (كائن Kotlin، 160 سطراً — قُرئ كاملاً).

| العنصر | القيمة |
|---|---|
| الفاصل | `","` — `BLOCKED_NUMBERS_EXPORT_DELIMITER` (`com/magic/common/extensions/ConstantsKt.java:77`) |
| الشكل | سلسلة من **7 عناصر** مفصولة بفواصل، مفهرسة بالأيام 0–6 [INFERENCE: الاثنين أولاً حسب واجهة اختيار الأسبوع] |
| `-1` | بلا حد لذلك اليوم (`isNoLimit()` = صحيح iff كل العناصر `-1`) |
| `86400` | يوم كامل (86400 ثانية = 24 ساعة) |
| `0` | علامة "مغلق للطرفين" في كشف التعارض |
| أعداد أخرى | **ثوانٍ**: في `allow_time` = ثواني الشاشة المسموحة؛ في `start/end_time` = ثوانٍ منذ منتصف الليل، تُعرض عبر `TimeUtil.getTimeFormatMin(sec)` ← `"HH:MM"` (مثلاً 75600 ← `"21:00"`) |

**دوال التسلسل** (كلها تنتج 7 عناصر):
- `getLimitString(int)` ← `"3600,3600,3600,3600,3600,3600,3600"` (حد موحد).
- `getLimitString(List)` ← عناصر يومية؛ **القائمة الفارغة ← الافتراضي المكتوب صراحة `"3600,-1,200,300,300,300,300"`** [VERIFIED حرفياً].
- `getScheduleString(time, compareTime)` ← `"HH:MM"` ×7 مع تفريغ العنصر إذا `time < 0` أو `time == compareTime`.
- `getScheduleString(List, List)` (بداية مقابل نهاية) ← تفريغ إذا `< 0` أو `start == end`.
- `getScheduleString(List, List, List<Boolean> enable)` ← تفريغ إضافي للأيام غير المفعّلة (جداول الإشراف).
- `HasInvalidSameSchedule(...)` — كشف الجداول المتعارضة: **صفر مستدعين في كامل smali** — كود تحقق ميت في هذا البناء [VERIFIED].

**مثال سلكي حقيقي** (مُتتبَّع في `AppRuleLimitAndroidFragment.saveLimitRules` — smali):
```
allow_time = "3600,3600,3600,3600,3600,3600,3600"   (أو يومي: "3600,-1,200,300,300,300,300")
start_time = "21:00,21:00,21:00,21:00,21:00,21:00,21:00"
end_time   = "07:00,07:00,07:00,07:00,07:00,07:00,07:00"
الأيام المعطلة تُسرسل كمقاطع فارغة: "21:00,,21:00,,,,"
+ حقول: everyday, allow_everyday, enable_allow, enable_time, device_id, package_name, type, block_type, apps
→ POST v4/app-block/save (form-urlencoded)
```

### 4.2 حلقة التنفيذ (تطبيق الطفل) [VERIFIED]
1. حدث accessibility (تغيّر نافذة) ← `AppBlockStrategy` يحدد الحزمة الأمامية.
2. التقييم بالأولوية: **ScreenBlockHelper** (حد وقت الشاشة اليومي من `sp_appusetime_record`) ← **ScheduleBlockHelper** (جداول البداية/النهاية) ← **AppBlockHelper** (حظر التطبيق الدائم/المحدود من `controls_init_v5`).
3. عند المطابقة: طبقة `TYPE_APPLICATION_OVERLAY` ملء الشاشة + ابتلاع BACK + إخفاء أشرطة النظام؛ خيارات: سماح (HOME) / طلب وقت إضافي (بث `REQUEST_MORE_TIME`).
4. الاحتياطي الاستطلاعي: `UsageStatsManager` كل 30 ثانية (أو ثانيتين عند غيابه).
5. تغيير القواعد: `MMKVChangeEvent` ← إعادة تحميل فورية + `ruleChangeTriggerEventNow()`.

---

## 5. الشبكة وعقود البيانات (أب / طفل / سحابة)

### 5.1 المضيفون والمصادقة [VERIFIED]
| المضيف | الاستخدام |
|---|---|
| `https://data-api.famisafe.com/` | واجهة البيانات الرئيسية (**قابل للتجاوز خادمياً** عبر `ApiUrl.update()`) |
| `https://app-api-pro.famisafe.com/` | الحسابات |
| `https://us-west-data-api-famisafe.phonedata.vip/` | مضيف تجريبي/موجَّه جغرافياً مكتوب صراحة |

- **التوقيع:** `vc` = **MD5** لـ `APP_KEY + JSON(المعاملات مرتبة) + APP_FP`؛ `APP_KEY=EE12071A4BC85EE516C78C38E78D1F14` و`APP_FP=3641528A77E9437BDAFABA10DFD532E9` **مكتوبة صراحة** (`ApiConstant.java`).
- **معاملات كل طلب موثّق:** `member_id`، `access_token`، `platform=1`، `client_sign`، `timestamp` (ms — مكافحة إعادة التشغيل)، `lang`، `access_from` (الدور؛ 10 = وضع الطفل)، `device_id`.
- **الترويسات:** `Authorization: Bearer`، `X-App-Key`، `X-Client-Sign/Sn/Type/Ver`، `X-Platform`، `X-Lang`، `X-Country`، `X-Timezone`، `X-Request-ID`.
- **الغلاف:** `ResponseBean{code, msg, data, timestamp}`؛ أكواد لافتة: 424/429 (حساب)، 488 (رمز)، 492/509/513 (اشتراك)، 140013 (وصول).
- **مهلات OkHttp:** 15 ثانية قراءة/كتابة. **`TLS بمدير ثقة يقبل الكل** (`trustAllCerts`) [VERIFIED — ثغرة أمنية]. `RetryIntercepter` موجود لكنه **غير موصول** بالباني الرئيسي [VERIFIED بالغياب].

### 5.2 نقاط الأب (175 دالة في `FamiParentService` — smali) — مختارات مجمعة
- **كتابة القواعد:** `POST v4/app-block/save`، `POST v5/supervised/app-block-save`، `GET v5/schedule/save`، `GET v4/screen-time/set`، `POST /v5/app-rules/{block-apps,whitelist-apps}`، `POST v1/devices/web-filter-save`، `POST v4/device/save-vpn-switch`، `POST v1/devices/sos-switch`، `POST v1/devices/geo-fence-{save,update,del,get}`.
- **القراءة:** `GET v4/dashboard/limit-detail` (قواعد الجهاز)، `GET /v5/data/new-dashboard`، `GET v5/screen-time/get`، `GET /v5/data/rules`، `GET v5/app-usage/new-get`، `GET v5/notification/list-get`.
- **الدفع الفوري:** `GET v1/devices/new-push` (`requestVoipPush(device_id, action)`) — موجود للمواقع الحية، صالح بدائيةً للأوامر العاجلة.
- **الحساب:** `GET v4/match-code/get` (رمز الإقران)، `POST v5/member/match-code-login`، `v1/member/auth-{login,logout,register}`، `GET v1/member/subscription`.
- **مفاتيح ذكاء:** `POST /new-api/v1/famibot-fammy/switch-save`، `GET new-api/v1/suspicious/ai-label-guidance` [INFERENCE: بوابات ميزات ذكاء خادمية].

### 5.3 نقاط الطفل (من `FamiChildService` / `ChildAPIService`)
- `GET v4/gather/controls-init` — سحب القواعد الكاملة (قلب التوزيع).
- `GET v1/gather/web-filter-check?url=…` — حكم تصفية الويب (10s).
- `POST v1/gather/permission-update` + `GET /v1/gather/android-supervised-update` — رفع حالة الصلاحيات.
- `POST v1/gather/gps` — رفع الموقع (دفعات ≤100)؛ `POST v1/gather/geo-fence-log` — أحداث السياج.
- `POST v1/gather/suspicious-{img,sms}` — رفع المحتوى المشبوه؛ `POST new-api/v1/screen-viewer/save-image`؛ `POST new-api/v1/ambient-sound/upload-audio-file`.
- `GET v5/member/ws-token` — رمز WebSocket.

### 5.4 عقود البيانات الأساسية
- **أب→سحابة (كتابة):** خرائط form-urlencoded بسلاسل الجداول المرمزة (§4.1).
- **سحابة→أب (قراءة):** `DeviceRuleBean` (JSON بحقول snake_case).
- **سحابة→طفل:** `ControlsBean` الكامل (JSON في `controls_init_v5`) — يحوي `AppBlockBean[]`، `gps_fence[]`، `ai_switch`…
- **طفل→سحابة:** `LocationBean[]`، `NotifyBean` (عبر أحداث)، `PermissionUpdate`، ملفات وسائط.
- **أوامر سحابة→طفل:** FCM/WebSocket بمفردات الـ 30 فعلاً (§3.7).

---

## 6. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب |
|---|---|---|---|
| 1 | **ترميز الجداول الأسبوعية** (`ScreenTimeTool` + صيغة `"3600,-1,…"`) ومخطط `AppBlockBean` | 1 | مجرّب، مدمج، قابل للقراءة البشرية والتصحيح؛ يصلح حرفياً لقلب محرك صلاحيات Family OS. انسخ الصيغة كما هي لضمان التوافق الذهني. |
| 2 | **نموذج توزيع القواعد عبر السحابة**: الأب POST ← الطفل يسحب `ControlsBean` كاملاً ← تخزين JSON محلي ← إعادة تحميل ساخنة عبر EventBus | 1 | يفصل التحرير عن التنفيذ، يعمل دون اتصال بعد المزامنة، والتحديث الساخن فوري. اعتمده كعقد التوزيع الرسمي. |
| 3 | **نمط الحظر بالطبقة** (`TYPE_APPLICATION_OVERLAY` + ابتلاع BACK + fallback لنشاط ملء الشاشة) | 2 | يعمل بلا صلاحيات خارقة وآمن لسياسة Play؛ لكنه **هش** (وضع آمن/adb يقتله) — في Family OS يُستخدم كطبقة احتياطية تحت Device Owner. |
| 4 | **بطارية مضاد العبث** (9 دفاعات + الرد بقفل الجهاز عبر `lockNow`) | 2 | تغطية OEM واسعة (هواوي/شاومي/سامسونج) وكشف العبث بالساعة بـ 8 لغات — كيّفها؛ وأضف بوابة كلمة سر (نقطة ضعفهم: لا بوابة). |
| 5 | **تدفق الإقران برمز المطابقة** (`GET v4/match-code/get` + استطلاع الربط) | 1 | بسيط، لا حسابات معقدة على جهاز الطفل؛ يصلح نموذجاً لربط أجهزة العائلة. |
| 6 | **حزمة الإبقاء الحي** (خدمة أمامية دائمة + عملية `:watch` + عفريت متبادل + evernote jobs + قوائم إقلاع OEM) | 2 | مرجع شامل لصلابة وكيل الطفل؛ راجع حيلة إخفاء الإشعار (مخاطرة سياسة). |
| 7 | **تخزين أحكام تصفية الويب مؤقتاً** (حظر 60s / سماح 300s + مسح عند `web_filter_update`) | 1 | يوازن زمن الاستجابة والحمل الخادمي؛ انسخ السياسة. |
| 8 | **السياج الجغرافي المخصص على الجهاز** (`CustomGeoFence` + `ComputeDistance`) | 1 | بلا اعتماد على Google Geofencing — يعمل في اليمن/الصين/أجهزة بلا GMS. انسخه. |
| 9 | **تصنيف التنبيهات** (`NotifyBean.model` ← أنواع بطاقات اللوحة) | 2 | أساس ممتاز لبطاقات لوحة الأب التي ستغذيها الـ AI. |
| 10 | **بوابة الاشتراك الخادمية** (`isVip` من `member_level` + إنفاذ محلي) | 3 | النمط صحيح (الحقيقة خادمية)؛ كيّف SKUs لخطط Family OS. |
| 11 | **مفردات أوامر FCM الثلاثينية** + إزالة التكرار في `PushManager` | 2 | قائمة جاهزة لأوامر الأب→الطفل؛ أضف توقيعاً لكل أمر (هم بلا توقيع!). |
| 12 | **كاشطات المحتوى الاجتماعية (~38 مراقباً)** | 3 | تغطية واسعة لكنها **هشة** (تتكسر مع كل تحديث تطبيق) ومثيرة للسياسات — اعتمدها كطبقة ثانوية خلف ذكاء خادمي. |
| ✗ | `trustAllCerts` (TLS يقبل الكل)، `usesCleartextTraffic`، مفاتيح التوقيع المكتوبة صراحة، مفتاح الخرائط المسرّب | ✗ | **مرفوضة أمنياً** — Family OS: تثبيت شهادات + أسرار من خادم الإعدادات. |
| ✗ | الواجهات الهجينة H5 (`TotalWebActivity`…) | ✗ | Family OS أصلي (Flutter) — الأداء ميزة معلنة. |
| ✗ | حيلة إخفاء إشعار الخدمة الأمامية (`startForeground` ثم `stopSelf`) | ✗ | مخاطرة سياسة Play — إشعار صادق دائم بدلاً منها. |

### الفجوة الاستراتيجية التي يملؤها هذا التحليل
تقرير الجولة الأولى انتهى عند "التنفيذ على جهاز الطفل تخمين مرفوض". الآن نملك **الآلة الكاملة**: من ضغطة الأب على "حفظ" (`POST v4/app-block/save`) إلى الطبقة التي تظهر فوق لعبة الطفل (`InterceptionAppActivity`) — كل حلقة موثقة بأسماء كلاسات ومسارات دقيقة. وهذا هو الأساس الذي سيُبنى عليه **محرك الصلاحيات L0–L5** في Family OS.

---

## 7. أسئلة مفتوحة وادعاءات غير مؤكدة

1. **تعيين فهرس اليوم 0–6 ← يوم الأسبوع الفعلي** [INFERENCE]: الكود لا يسمّي؛ التخمين (الاثنين أولاً) من واجهة اختيار الأسبوع — يحتاج تأكيداً بقراءة `ScheduleAddFragment`.
2. **قيمة ثابت `repeat` في `saveLimitRules`** [INFERENCE]: المقارنة `repeat == <const>` تختار الموحد/اليومي؛ القيمة العددية الدقيقة لم تُستخرج.
3. **توقيت دفع السحابة للطفل بعد حفظ الأب**: الحفظ الأبوي لا يستدعي `requestVoipPush`؛ التوصيل للطفل إما دفع خادمي فوري أو انتظار FCM/WebSocket التالي — **غير محسوم** [يحتاج مراقبة شبكية حية].
4. **`ai_switch { int fammy }` في `ControlsBean`**: علَم يُحلل ولا يُستهلك عميلاً [INFERENCE: بوابة مساعد Fammy الخادمي].
5. **WebSocket دائم أم احتياطي؟** البنية توحي بالدائم مع FCM كاحتياطي، لكن سياسة إعادة الاتصال لم تُقرأ.
6. **`WRITE_SECURE_SETTINGS` المعلنة**: لا تُمنح لتطبيقات المتجر — [INFERENCE: بقايا طموح OEM/نظام].
7. **`ParentAPIService` سقط من jadx** (موجود smali فقط) — قائمة الـ 175 نقطة مأخوذة من تحليل annotations الـ smali [VERIFIED لكن آلياً لا يدوياً سطراً بسطر].
8. **كاشطات "80"**: سلوكها مع تحديثات تطبيقات 2026 (إنستغرام/واتساب الحديثة) **غير مختبر** — الهشاشة متوقعة.
9. **مصير `HasInvalidSameSchedule`**: ميت في هذا البناء — هل أُحيي في إصدارات أخرى؟ غير مهم للاقتباس.
10. **التسجيل الصوتي المحيطي** (`RECORD_AUDIO` + `ambient-sound/upload-audio-file`): موجود تقنياً — **قرار سياسة/قانوني معلق** لـ Family OS (يُترك للمالك).

---

## 8. خريطة الملفات المرجعية (مسارات دقيقة)

**تطبيق الأب** (`~/workspace/rework/famisafe/`):
- `jadx-out/sources/com/wondershare/famisafe/parent/screenv5/ScreenTimeTool.java` — ترميز الجداول (الأثمن).
- `jadx-out/sources/com/wondershare/famisafe/common/bean/DeviceRuleBean.java` + `App1.java` + `ScreenTime1.java` — عقد القواعد.
- `jadx-out/sources/com/wondershare/famisafe/common/network/` — `ApiUrl`، `UrlFactory`، `HttpParamUtils`، `BuildFactory`، `ApiConstant` (التوقيع والمفاتيح).
- `apktool-out/smali_classes*/com/wondershare/famisafe/common/network/FamiParentService*.smali` — 175 نقطة (smali فقط).
- `jadx-out/sources/com/wondershare/famisafe/parent/ParentNotifyService.java` — الإبقاء الحي.
- `jadx-out/sources/com/wondershare/famisafe/parent/notify/NotifyTool.java` — تصنيف التنبيهات.
- `jadx-out/sources/com/wondershare/famisafe/share/payment/BillingConstants.java` — SKUs.
- `apktool-out/AndroidManifest.xml` — المكونات (انتبه للمفتاح المسرّب).

**تطبيق الطفل** (`~/workspace/rework/famisafe-jr/`):
- `jadx-out/sources/com/wondershare/famisafe/child/accessibility/SCAccessibilityService.java` — مدخل accessibility.
- `jadx-out/sources/com/wondershare/famisafe/kids/accessibility/AccessibilityManager.java` — الموجّه.
- `jadx-out/sources/com/wondershare/famisafe/kids/accessibility/AppBlockStrategy.java` — مسارا الحظر.
- `jadx-out/sources/com/wondershare/famisafe/kids/accessibility/AppDefenceUtils.java` — الدفاعات التسع.
- `jadx-out/sources/com/wondershare/famisafe/kids/accessibility/defence/AdminDefence.java` — دفاع إلغاء الإدارة.
- `jadx-out/sources/com/wondershare/famisafe/child/ui/permission/DeviceAdmin.java` — مستقبل الإدارة (stub + lockNow).
- `jadx-out/sources/com/wondershare/famisafe/kids/MainService.java` — تطبيق القواعد + التحديث الساخن.
- `jadx-out/sources/com/wondershare/famisafe/kids/websocket/WebSocketHelper.java` — القناة الدائمة.
- `jadx-out/sources/com/wondershare/famisafe/kids/geofences/CustomGeoFence.java` — السياج المخصص.
- `jadx-out/sources/com/wondershare/famisafe/kids/livelocation/collect/LocationHelp.java` — الموقع.
- `jadx-out/sources/com/wondershare/famisafe/kids/deamon/DaemonProcess.java` — العفريت المتبادل.
- `apktool-out/AndroidManifest.xml` + `apktool-out/res/xml/accessibility_service_config.xml` + `res/xml/device_admin.xml`.
