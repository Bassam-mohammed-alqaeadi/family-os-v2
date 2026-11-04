# التقرير الهيكلي لتشريح الحزمة والمكونات — Telegram (T1 Structural Analysis)

> **المعرف:** `T1-TG-STRUCTURAL-001`
> **التطبيق:** Telegram (`telegram`)
> **الحزمة المفحوصة:** `org.telegram.messenger`
> **الإصدار المستخرج:** `13.1.1` (versionCode `72371`) — من `apktool.yml` [VERIFIED]
> **بيئة التشغيل:** Android minSdk 23 (Marshmallow 6.0)، targetSdk 36 [VERIFIED]
> **المعمارية التقنية:** عميل أصلي (Native Java/Kotlin) — نواة شبكات C++ عبر JNI (غائبة: split `base__abi`)

---

## 1. الملخص التنفيذي للهيكلية

أثبت الفحص الشامل لـ `AndroidManifest.xml` والكود المفكك أن Telegram **عميل مراسلة أحادي**
بمعمارية طبقية صارمة:

### ركائز الهيكلية الأساسية:
1. **النواة الأصلية أولاً:** كل الشبكة (MTProto) والتشفير وSQLite في C++ — Java طبقة
   تنسيق رقيقة (27+ دالة `native_*` معلنة، الأجساد في split غائب — صفر `.so` محلياً).
2. **الحسابات كوحدات عزل:** `AccountInstance[4]` — سقف 4 حسابات، كل متحكم singleton
   مفهرس برقم الحساب (`MessagesController.getInstance(i)` بنمط double-checked locking).
3. **تسلسل مركزي واحد:** `Utilities.stageQueue` — كل التحديثات الواردة تُسلسل عليه قبل المنطق.
4. **حافلة أحداث لكل حساب:** `NotificationCenter` — 348 حدثاً، بث آمن الخيط.

---

## 2. جدول مكونات الـ Manifest [VERIFIED — قُرئ كاملاً]

`~/workspace/rework/telegram/apktool-out/AndroidManifest.xml`:

| نوع المكون | العدد (مُقاس) | المكونات الرئيسية | التوصيف المعماري والدور الوظيفي |
|---|:---:|---|---|
| **الأنشطة (Activities)** | **20** | `LaunchActivity` (البوابة) | عدد صغير — الواجهات تُبنى برمجياً (fragments) لا بأنشطة كثيرة. |
| **الخدمات (Services)** | **31** | `GcmPushListenerService`، `NotificationsService`، `BringAppForegroundService`، `VoIP`/`CallReceiver`، `KeepAliveJob` (JobIntentService) | الدفع، الإشعارات، المكالمات، الإبقاء الحي. |
| **مستقبلات البث (Receivers)** | **26** | `AppStartReceiver`، `NotificationRepeat` | الإقلاع/إعادة التشغيل، تكرار الإشعارات. |
| **مزودات المحتوى (Providers)** | **7** | `FileProvider`، `FirebaseInitProvider`، `AuthenticatorService`/`ContactsSyncAdapterService` | مشاركة الملفات، تهيئة Firebase، مزامنة جهات الاتصال مع النظام. |
| **الأذونات** | **71** | كاميرا، مايك، موقع (دقيق/خلفي)، جهات اتصال (قراءة/كتابة/مزامنة)، هاتف، تخزين، بلوتوث، `SYSTEM_ALERT_WINDOW`، `USE_FULL_SCREEN_INTENT`، خدمات أمامية بأنواعها، `REQUEST_INSTALL_PACKAGES` (التحديث الذاتي) | قائمة مرجعية شاملة لنموذج صلاحيات Family OS. |

**ملاحظة التوزيع** [VERIFIED]: `requiredSplitTypes="base__abi"` — المكتبات الأصلية
تُوزَّع كـ split منفصل؛ لهذا صفر `.so` في المخرجات. أي تحليل للنواة C++ **غير ممكن**
من هذه المخرجات.

---

## 3. الحزم الرئيسية (java — مُقاسة)

| الحزمة | الدور | ملاحظة |
|---|---|---|
| `org.telegram.messenger/` | المتحكمات، `NotificationCenter`، `FileLoader`، `DispatchQueue`، `UserConfig` | النواة المنطقية |
| `org.telegram.tgnet/` | مكدس MTProto: `ConnectionsManager`، `TLRPC` (80,043 سطراً / 2,043 فئة)، `NativeByteBuffer`، `TLClassStore` | جسر البروتوكول |
| `org.telegram.SQLite/` | غلاف SQLite الأصلي (4 فئات، 454 سطراً) | التخزين |
| `org.telegram.messenger.voip/` | المكالمات: `Instance`، `NativeInstance` (36 native) | WebRTC أصلي |
| `org.telegram.ui/` | الواجهات | خارج نطاق الجرد |

**حزم مشوّشة** (`a/`، `a0/`…`zg/` — مئات): ناتج R8 — لم تُحلل [معلن].

---

## 4. حصر الجسر الأصلي والفئات الساقطة

- **27+ دالة `native_*`** في `ConnectionsManager.java` (#L1078–1136): `native_init`،
  `native_sendRequest`، `native_applyDatacenterAddress`، `native_moveDatacenter`،
  `native_setNetworkAvailable`، `native_pauseNetwork`/`native_resumeNetwork`،
  `native_checkProxy`، `native_setIpStrategy`، `native_cancelRequest`،
  `native_bindRequestToGuid`، `native_getConnectionState`، `native_getCurrentPingTime`،
  `native_onHostNameResolved`، `native_applyDnsConfig`، `native_setLangCode`…
- **الفئات الساقطة من jadx (موجودة smali كاملاً):**

| الفئة | طرق smali (مُقاسة) | الدور |
|---|---|---|
| `MessagesController` | **1,580** | معالجة التحديثات، الفروق، الحوارات |
| `MessagesStorage` | **861** | كل SQL — `cache4.db` |
| `NotificationsController` | **205** | معالجة الإشعارات |
| `SendMessagesHelper` | (smali موجود) | إرسال الرسائل وإعادة المحاولة |
| `SecretChatHelper` | **101** | المحادثات السرية E2E |

---

## 5. حصر الواجهات البرمجية (API Surface)

- **البروتوكول:** MTProto عبر TCP مباشرة (النواة الأصلية) — لا REST؛ مراكز بيانات
  متعددة (`native_applyDatacenterAddress`/`native_moveDatacenter`)؛ بروكسي
  (`native_checkProxy`)؛ كاش DNS داخلي؛ استراتيجيات IP (`native_setIpStrategy`).
- **الدفع:** FCM (`GcmPushListenerService` — الحمولة المشفرة بالمفتاح `"p"`) +
  Huawei Push (النوع 13) + اتصال دفع دائم (`ConnectionTypePush=8`) — ثلاث طبقات.
- **لا نقاط تكامل خارجية** — النظام مغلق على خوادم Telegram؛ القيمة **معمارية** لا تكاملية.
