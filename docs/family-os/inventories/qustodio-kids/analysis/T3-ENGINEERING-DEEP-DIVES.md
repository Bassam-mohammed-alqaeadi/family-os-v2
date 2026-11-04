# T3 — التحليلات الهندسية المعمقة: Qustodio Kids

## المسار A: تشريح QProxy الأصلي (محرك الـ VPN)

### A.1 طبقات الجسر [VERIFIED]
1. **Kotlin:** `com.qustodio.vpn.HttpVpnService` (مجرّدة) — تبني `VpnService.Builder` (العنوان `10.1.10.1/32` + IPv6، `setHttpProxy(127.0.0.1:port)` على SDK 29+، `setUnderlyingNetworks(null)`)، وتضيف التطبيقات المسموحة عبر `addAllowedApplication` من إعداد الـ VPN.
2. **JNA:** `Native.load("vpn-lib", VpnCLib.class)` — الواجهة `VpnCLib` بسبع ردّات (DownstreamConnected/TlsDetected/HttpRequest/HttpResponse/SessionClosed/QProxyError/VpnError).
3. **JNI:** `libvpn-lib.so` (55KB) يصدّر `Java_com_qustodio_vpn_HttpVpnService_initQProxy/startQProxy/stopQProxy` + `qProxy*Action`، ويعتمد (`DT_NEEDED`) على `libqproxy.so`.
4. **المحرك:** `libqproxy.so` (5.2MB) — `QProxyServer`/`QProxyWorker`، `proxy::SessionContext`.

### A.2 بروتوكول الإعداد [VERIFIED]
- `startQProxy(json)`: نطاق منافذ `[port, port+10]` + قاعدة `*.whatsapp.net → BAD_REQUEST_THEN_CLOSE` (استثناء سلوكي لكل مضيف).
- `initQProxy(certificate, certificatePrivateKey, clientKey)` من `X7.b`.
- الردّات → كوروتينات Kotlin: الطلب يُسجَّل في خريطة `(sessionId,requestId)` ويُرجع `DEFER`؛ عند الاستجابة يُستدعى `vpnNavigationProcessor` فإن حكم بالحظر رُجع `BLOCK` مع رابط صفحة الحظر؛ `onTlsDetected` دائماً `DEFER`.

### A.3 قدرات المحرك الأصلي (strings/symbols) [VERIFIED]
- HTTP/1 **وHTTP/2** (`http1DataHandler` + `http2v::Request/Response`).
- MITM: `certificateHandler` + `Certificate.cpp` + OpenSSL 1.1.1m static — توليد شهادات لكل مضيف.
- صفحة حظر HTML مضمّنة + regex استخراج استعلامات البحث (google/bing/duckduckgo/yahoo/lycos/yandex).
- سلسلة الوكيل `QustodioProxy/4.7.4` + مسارات بناء `desktop-proxy-build_develop` — **محرك مشترك موبايل/سطح مكتب**.

### A.4 تثبيت شهادة الـ MITM [VERIFIED]
`W7.c.f()`: إن لم تكن مثبتة ← `KeyChain.createInstallIntent()` مع `name` + بايتات `CERT`؛ الكشف عبر `HttpEventDetectionSetup.isCertificateInstalled`. التدفق القياسي الصحيح — مع Device Owner يُستبدل بـ `installCaCert` الصامت.

---

## المسار B: أنبوب الـ accessibility (29 محللاً)

### B.1 خط الأنابيب [VERIFIED]
```
حدث النظام → onAccessibilityEvent (المكتبة)
  → استنساخ عبر Parcel (s()) — لقطة عقد صالحة بعد انتهاء الحدث
  → قائمة متزامنة + كوروتين واحد متسلسل (خنق: يتجاهل الجديد أثناء الانشغال)
  → R3.c: لكل محلل r(pkg,type)? → v(event,windows) → K3.a(type,data,time)
  → توزيع حسب H3.e → معالجات التطبيق (tampering/password-gate/gestures/blocker)
```

### B.2 آليات الرد [VERIFIED]
- **بوابة كلمة السر:** `SettingsPasswordRequestActivity` (تُفتح NEW_TASK من الخدمة؛ PendingIntent على ≤26).
- **الإيماءات:** `performBack` (حماية 300ms من المزدوج)، `performHome`، `performDoubleBack`، `performToggleSplit`، و`dispatchGesture` (سحبة إغلاق المصغّرات).
- **إزالة تكرار العبث:** 500ms في `t0()`.
- **مطابِق العلامة** `X3.a`: اسم التطبيق + عنوان الإشعار، يُعاد زرعه عند تغيّر اللغة.

### B.3 الكشط [VERIFIED هيكلياً]
- المحادثات: `SocialMonitoringParser` المجرّد (6 منصات) — تفعيل انتقائي عبر `b()/d()`.
- يوتيوب: `title`/`channel`/`channel_title` من عقد التطبيق.
- المتصفحات: `url_bar`/`origin` لكل من Chrome/Firefox/Samsung/Huawei/Silk.
- التطبيق الأمامي: استثناءات IME/لانشر/systemui/services-OEM — قائمة صريحة قابلة للنسخ.

---

## المسار C: الأوامر، القواعد، الإبقاء الحي، الغيابات

### C.1 مستوى الأوامر [VERIFIED]
`FirebaseMessagingService` → `HandlePushDataMessageJob` → `MessageV1Interpreter`: سبعة أفعال (`update_location/update_policy/update_settings/update_application/enable_logging/upload_logs/disable_panic_mode`)؛ مدة التسجيل الافتراضية 604800s. **التوقيع غير متحقق فعلياً** (`s()` = فحص عدم-الفراغ) — ثغرة موثقة.

### C.2 عقد القواعد [VERIFIED]
`ApplicationRules{action, exe, platform, monQuota…sunQuota}` + `TimeRestrictions{Day×2, 6 أعلام}` + `Day{mon…sun}` — حصص يومية صريحة أنظف من ترميز FamiSafe النصي.

### C.3 الإبقاء الحي [VERIFIED]
أمامية دائمة (`START_STICKY`) + مرساة `NotificationListenerService` فارغة + `DeviceBootReceiver` (يفحص `wasForceStopped()` على API 35+ ولا يعيد التشغيل بعده) + `persistent=true` + مستقبلات ديناميكية + `UserSwitchReceiver`. **مثبت الغياب:** لا طلب إعفاء بطارية برمجياً، لا `killBackgroundProcesses`.

### C.4 الغيابات المثبتة بالبحث الشامل [VERIFIED]
- صفر `DevicePolicyManager` (الإدارة = مرساة إلغاء فقط).
- صفر ذكاء على الجهاز (لا onnx/tflite/tensorflow، لا ملفات نماذج).
- صفر WebSocket (الأوامر FCM فقط).
- عناوين API: `assets/qinit/*.json` مشفرة — المضيفون غير مرصودين statically.
