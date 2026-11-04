# T1 — التقرير البنيوي: Qustodio Parents App (تطبيق الأهل)

> **النطاق:** `com.qustodio.family.parental.control.app.screentime` v182.41.0 — تطبيق الأهل فقط.
> **المنهج:** قراءة مباشرة للكود المستعاد من خرائط المصدر داخل الـ APK + الملفات الأصلية الخمسة + الـ manifest.

## 1. التشريح الكمي للمخرجات

| المكوّن | العدد / الحجم | المصدر |
|---|---|---|
| ملفات smali | 27,629 | عدّ مباشر `rework/qustodio` |
| ملفات java (jadx) | 13,628 | عدّ مباشر |
| إجمالي الملفات | 42,621 | `find -type f` |
| الحجم الكلي | ~376MB | `du -sb` |
| الكود الأصلي (`com.qustodio.*`) | **5 ملفات Java** | `jadx-out/sources/com/qustodio` |
| تطبيق React (`assets/www`) | 94MB | `apktool-out/assets/www` |
| المصدر الأصلي المستعاد | **2,086 ملف TS/JS** | فك `sourcesContent` من 4 ملفات `.map` |
| أسطر الـ manifest | 229 | `apktool-out/AndroidManifest.xml` |

## 2. البنية الطبقية

```
React SPA (assets/www/static/js)
 ├── main.df358784.js (6MB — منطق التطبيق)
 ├── 739.8a78d876.js (4.7MB — مكتبات)
 ├── 471.0f06b72d.js (1.8MB)
 └── *.js.map — خرائط المصدر الكاملة (الاختراق المنهجي)
Cordova bridge + ~30 plugin (push, googlemaps, fingerprint-aio, firebasex, braze, adjust…)
غلاف أصلي: MainActivity + QustodioPlugin + QustodioPushNotificationService
```

## 3. المكدس داخل الـ SPA (مستعاد من المصدر الأصلي)

- **React + react-router v3** (`hashHistory`) — `src/routes.tsx` (~60 مساراً)
- **Redux** (`redux-immutable`) + **redux-thunk** + **redux-observable** (epics) — `src/store/setupStore.ts`
- **Immutable.js Records** بنمط `fromPayload`/`serialize` — `src/records/` (~35 مجلداً)
- **عميل API مخصص** `QApi` فوق `fetch` (لا Axios) — `src/lib/qapi.ts` (1,633 سطراً، 95 مجموعة نقاط)
- **التخزين**: localStorage فقط — `src/ducks/persistentStorage.ts` (لا SQLite: صفر نتائج بحث)

## 4. المكونات الأصلية (الخمسة)

| الملف | الدور |
|---|---|
| `…/screentime/MainActivity.java` | `CordovaActivity`؛ `singleTask`؛ عمودي؛ `loadUrl(launchUrl)` |
| `com/qustodio/pasa/QustodioPlugin.java` | فعل `setWebAppReady` + روابط عميقة مؤجلة (`pendingDeepLink` → `javascript:handleOpenURL`) |
| `com/qustodio/pasa/QustodioPushNotificationService.java` | توجيه Braze-أولاً ثم FCM |
| `…/screentime/BuildConfig.java` | ثوابت البناء |
| `…/screentime/R.java` | الموارد |

## 5. الـ Manifest (229 سطراً)

- نشاط واحد مصدَّر: `MainActivity` (لانشر + مخطط `qustodiofamily://` + `https://family.qustodio.com/parents-app*` بـ autoVerify)
- **صفر** مكونات إنفاذ: لا `VpnService`/`AccessibilityService`/`DeviceAdminReceiver` (مؤكد بالبحث)
- `usesCleartextTraffic="true"` — علامة حمراء
- مفتاح Google Maps مسرّب: `AIzaSyBOq9G49mqvcxZzuKbpesf1U__jfpLZPMU`
- الصلاحيات: الموقع الدقيق، `POST_NOTIFICATIONS`، بصمة، فوترة، `WAKE_LOCK` — لا صلاحيات تجسس

## 6. الغيابات المثبتة بالبحث (لا بالافتراض)

| الغائب | الدليل |
|---|---|
| ذكاء اصطناعي على الجهاز | صفر `onnx/tflite/tensorflow` في كل الحزم |
| WebSocket في الأب | صفر `WebSocket` في المصدر المستعاد |
| QR للإقران | صفر `qrcode/QRCode` |
| SQLite | صفر (إيجابية `realm` الكاذبة = كلمات إسبانية) |
| استدعاء `onboarding_token` | معرَّف في qapi بلا أي مستدعاة — كود ميت |
| اتصال مباشر أب↔طفل | لا سوكيت/لا IPC شبكي — السحابة وسيط وحيد |

## 7. الخلاصة البنيوية

تطبيق الأهل Qustodio **عميل سحابي خالص**: كل القواعد تُحرَّر في React وتُدفَع عبر REST،
والطفل يُبلَّغ عبر FCM. لا منطق إنفاذ، لا تخزين علائقي، لا ذكاء على الجهاز.
القيمة الهندسية كلها في: ترميز الجداول، عقود القواعد، مفردات الأوامر، وكتالوج الـ API —
وهي موثقة في T3.
