# COVERAGE-AND-GAPS — التغطية الوظيفية والفجوات: Qustodio Kids

> 40 وظيفة عبر 10 مجالات. المستويات: **Confirmed Level A** (قُرئ الكود) / **Derived Level B** (مستنتجة بقوة) / **Partial** (جزئية) / **Not Found** (غير موجودة — مثبتة بالبحث).

## المجال 1: DeviceAdmin (4)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 1.1 | مستقبل DeviceAdmin يعرض تحذير إلغاء التفعيل عند `IS_ACCOUNT_CONFIGURED` | A | `receiver/QustodioDeviceAdminReceiver.java:16-28` |
| 1.2 | منع إلغاء التثبيت عبر بقاء الإدارة نشطة (آلية النظام) | A | سياسات فارغة + المستقبل stub |
| 1.3 | صفر سياسات معلنة (`<uses-policies/>` فارغة) | A | `apktool-out/res/xml/device_admin.xml` |
| 1.4 | صفر استدعاء DevicePolicyManager في كامل الشفرة | A | بحث شامل smali+java (غياب مثبت) |

## المجال 2: AccessibilityService (10)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 2.1 | استنساخ الأحداث عبر Parcel + معالجة أحادية متسلسلة | A | `com/qustodio/accessibility/AccessibilityService.java: s(), onAccessibilityEvent` |
| 2.2 | سجل 29 محللاً بتوزيع الميزات | A | `R3/c.java:65-71` |
| 2.3 | كشف التطبيق الأمامي مع استثناءات IME/لانشر/OEM | A | `parser/application/ApplicationParser.java:27-33,118-137` |
| 2.4 | كشف الضغط المطوّل على أيقونة التطبيق + حوارات MIUI | A | `parser/tampering/UninstallLongClickParser.java` (كامل) |
| 2.5 | إزالة تكرار أحداث العبث (500ms) | A | `AccessibilityService.java:1161 (t0)` |
| 2.6 | بوابة كلمة السر عند العبث (Settings/إلغاء التثبيت) | A | `o0()` + `onUninstallLongClickTamperingEvent` + `onSettingsTamperingEvent` |
| 2.7 | إيماءات الإغلاق (dispatchGesture) + Back/Home/DoubleBack/ToggleSplit | A | المكتبة: `h()`, `performBack*`, `performHome`, `performToggleSplit` |
| 2.8 | مطابِق اسم العلامة X3.a مع إعادة الزرع عند تغيّر اللغة | A | `Q()` + `onConfigurationChanged` |
| 2.9 | كشط المحادثات (6 منصات) بتفعيل انتقائي | A (هيكلي) | `SocialMonitoringParser` + `b()/d()` |
| 2.10 | مراقبة يوتيوب (عنوان/قناة) + روابط المتصفحات (5) | A | `YoutubeAppParser`, `ChromeParser` (view-ID) |

## المجال 3: محرك الحظر (4)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 3.1 | جدول القرارات السباعي بالأولوية | A | `p224v4/a.java` + `p224v4/c.java:650-700 (p/q)` |
| 3.2 | حظر شاشة إعدادات الـ overlay (مضاد عبث) | A | `BLOCK_DRAW_OVERLAY_SETTINGS` في `p()` |
| 3.3 | طبقة الحظر `TYPE_APPLICATION_OVERLAY` (2038) بملء الشاشة | A | `ui/blocker/overlay/OverlayBlocker.java:125-135` |
| 3.4 | شاشة الحظر `BlockerActivity` + حاظر PiP | A | المانيفست + `ui/blocker/` |

## المجال 4: VPN الأصلي (8)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 4.1 | بناء نفق VPN (10.1.10.1 + setHttpProxy + allowed-apps) | A | `com/qustodio/vpn/HttpVpnService.java: r()` |
| 4.2 | جسر JNI/JNA (init/start/stop + 7 ردّات) | A | `VpnCLib.java` + رموز `libvpn-lib.so` |
| 4.3 | محرك QProxy: HTTP/1+2، جلسات، إجراءات | A | رموز `libqproxy.so` |
| 4.4 | MITM للـ TLS (مولّد شهادات + OpenSSL static) | A | `certificateHandler`, `Certificate.cpp`, رموز OpenSSL |
| 4.5 | تثبيت CA عبر KeyChain + كشف التثبيت | A | `W7/c.java: f()` |
| 4.6 | صفحة حظر HTML مضمّنة | A | strings في `libqproxy.so` |
| 4.7 | regex استخراج استعلامات البحث (6 محركات) | A | strings في `libqproxy.so` |
| 4.8 | استثناء `*.whatsapp.net → BAD_REQUEST_THEN_CLOSE` | A | `HttpVpnService.o()` |

## المجال 5: الأوامر والتحكم (4)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 5.1 | 7 أوامر FCM (موقع/سياسة/إعدادات/تحديث/سجلات/ذعر) | A | `MessageV1Interpreter.java` |
| 5.2 | مدة التسجيل الافتراضية 7 أيام | A | `f20378l = 604800` |
| 5.3 | قناة FCM عبر WorkManager (`HandlePushDataMessageJob`) | A | `service/messaging/` |
| 5.4 | **التوقيع غير متحقق فعلياً** (فحص عدم-فراغ) | A | `s()` + غياب HMAC |

## المجال 6: القواعد (3)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 6.1 | `ApplicationRules` بالحصص اليومية (monQuota…sunQuota) | A | `api/network/model/rules/ApplicationRules.java` |
| 6.2 | `TimeRestrictions` + `Day` (نوافذ/حصص أسبوعية) | A | `TimeRestrictions.java`, `Day.java` |
| 6.3 | وحدات الحصص (دقائق؟) ودلالة `action` | B | مستنتجة — تحتاج تأكيداً سلوكياً |

## المجال 7: المراقبة والتقارير (4)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 7.1 | SMS بأولوية قصوى ← محلل PDU ← محرك المراقبة | A | `SmsOnReceived.java:72-83,38-42` |
| 7.2 | المكالمات (PHONE_STATE/NEW_OUTGOING_CALL) | A | `CallOnProcess.java` + المانيفست |
| 7.3 | خط التقارير (أحداث app/smscall/web/youtube) + مزامنة يومية | A | `reporter/`, `DailyWorker.java` |
| 7.4 | الموقع (Fused + مستودع + حالة بلاغ) | A (هيكلي) | `Y4/a.java`, `X4.a`, `V4/a.java` |

## المجال 8: الإبقاء الحي (3)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 8.1 | خدمة أمامية دائمة + START_STICKY + إقلاع + مرساة NotificationListener | A | `QustodioService.java:888-959`, المانيفست |
| 8.2 | فحص `wasForceStopped()` (لا إعادة تشغيل بعده) | A | `DeviceBootReceiver.java:37-63` |
| 8.3 | طلب إعفاء البطارية / قتل العمليات — **غائبان برمجياً** | A (غياب مثبت) | بحث smali شامل |

## المجال 9: زر الذعر (2)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 9.1 | تفعيل/تعطيل عبر HEADSET_PLUG + زر السماعة (126/79) | A | `receiver/panicmode/PanicButtonEventReceiver.java` |
| 9.2 | عامل تنبيهات الذعر + واجهات جهات الثقة/طوارئ | A | `PanicModeAlertsWorker.java` + المانيفست |

## المجال 10: الإعداد والشبكة (3)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| 10.1 | الإقران بدخول الأهل على الجهاز (لا رمز إقران) | A | غياب pairCode + روابط `qustodio://parent-login` |
| 10.2 | الإعداد البعيد المشفّر (qinit) | Partial | `assets/qinit/*.json` باينري |
| 10.3 | عناوين API الدقيقة | Partial | غير مرصودة statically |

## ملخص المستويات

- **Confirmed Level A: 31** | **Derived Level B: 4** (6.3 + تغذية محرك الملاحة + سياسة إعادة اتصال VPN + دلالة `exe`) | **Partial: 3** (10.2, 10.3, view-ID لكل نسخة) | **Not Found: 2** (ذكاء على الجهاز — مثبت الغياب؛ WebSocket — مثبت الغياب)

## الفجوات التي تُغلق بمراقبة حية

1. مضيفو API (qinit مشفّر) — وكيل MITM محلي أو اعتراض DNS.
2. وحدات الحصص ودلالة `action` — تغيير قاعدة ومراقبة السلوك.
3. رابط `update_policy` → `vpnNavigationProcessor` — تتبع runtime.
