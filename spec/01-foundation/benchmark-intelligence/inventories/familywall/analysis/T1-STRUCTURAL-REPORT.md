# تقرير الفحص الهيكلي T1 لتطبيق FamilyWall (T1 Structural Inspection Report)
## الحزمة: BIP-03 — FamilyWall Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-01 / 2026-11-02  
> **مستوى الفحص:** T1 — Structural & Container Architecture  
> **التطبيق المستهدف:** FamilyWall (Android)  
> **حزمة المانيفست المعتمدة:** `com.familywall`  
> **المعرفات المرتبطة:** `FW-RES-000012`, `FW-EVD-000001`, `FW-EVD-000002`, `FW-EVD-000003`

---

## 1. ملخص الفحص الهيكلي العام

أُجري فحص شامل ومباشر لجميع المكونات الهيكلية والحاويات التنفيذية المستخرجة من تطبيق **FamilyWall** (`com.familywall`). يوثق هذا التقرير البنية المعمارية لتوزيع الكود، وأذونات النظام، والمكونات الأساسية للواجهة والخدمات، وحسم مطابقة حاويات Dalvik Executable (DEX) والروابط العميقة.

---

## 2. هوية الحزمة وإصدارات النظام المعتمدة

- **اسم الحزمة (Package Name):** `com.familywall` (معتمد كمرجع أساسي في `reference-registry.json`).
- **معرف الإصدار البرمجي (versionCode):** `2015971059`
- **اسم الإصدار الظاهري (versionName):** `2026.10.1`
- **الحد الأدنى للنظام (minSdkVersion):** `23` (Android 6.0 Marshmallow)
- **الإصدار المستهدف (targetSdkVersion):** `36` (Android 15 / 16 preview)
- **إصدار التجميع (compileSdkVersion):** `36`
- **فئة التطبيق الرئيسية:** `com.familywall.FamilyWallApplication` (تعتمد Dagger-Hilt للحقن و AndroidX App Startup للتهيئة المتزامنة).
- **أصل التوثيق المادي:** `benchmarks/extracted/familywall/01_architecture_and_manifest/AndroidManifest.xml` و `_apktool_raw/apktool.yml`.

---

## 3. تصنيف وتعداد الأذونات المصرحة (43 إذناً مصرحاً + 1 إذن توقيع خاص)

يعلن ملف `AndroidManifest.xml` عن **43 إذناً** للنظام وإذن توقيع مخصص واحد:

### 3.1. الأذونات الخطرة / أذونات وقت التشغيل (Dangerous / Runtime Permissions — 15 إذناً):
تتطلب موافقة صريحة من المستخدم أثناء التشغيل، وتعكس قدرات حيوية للأسرة:
1. `android.permission.ACCESS_FINE_LOCATION`: تحديد الموقع الجغرافي الدقيق للرادار العائلي.
2. `android.permission.ACCESS_COARSE_LOCATION`: تحديد الموقع التقريبي عبر أبراج الاتصال والشبكة.
3. `android.permission.ACCESS_BACKGROUND_LOCATION`: التتبع الجغرافي المستمر للأبناء في الخلفية عند قفل الشاشة.
4. `android.permission.READ_CALENDAR`: قراءة تقويم الهاتف لمزامنته مع تقويم الأسرة.
5. `android.permission.WRITE_CALENDAR`: كتابة فعاليات ومواعيد العائلة في تقويم النظام المحلي.
6. `android.permission.READ_CONTACTS`: قراءة جهات الاتصال لمزامنة دليل العائلة المشترك.
7. `android.permission.WRITE_CONTACTS`: تحديث جهات الاتصال المشتركة في دفتر الهاتف.
8. `android.permission.RECORD_AUDIO`: تسجيل الرسائل والملاحظات الصوتية في المحادثات العائلية.
9. `android.permission.READ_EXTERNAL_STORAGE`: قراءة الصور والوسائط (حتى Android 12).
10. `android.permission.WRITE_EXTERNAL_STORAGE`: حفظ وتصدير الوسائط (`maxSdkVersion=31`).
11. `android.permission.READ_MEDIA_IMAGES`: وصول مخصص للصور بنظام Android 13+.
12. `android.permission.READ_MEDIA_VIDEO`: وصول مخصص للفيديوهات بنظام Android 13+.
13. `android.permission.READ_MEDIA_AUDIO`: وصول مخصص للصوتيات بنظام Android 13+.
14. `android.permission.POST_NOTIFICATIONS`: إرسال الإشعارات والتنبيهات الفورية بنظام Android 13+.
15. `com.google.android.gms.permission.ACTIVITY_RECOGNITION`: استشعار وتصنيف نمط حركة أفراد الأسرة (ثبات، مشي، قيادة).

### 3.2. الأذونات العادية وأذونات التثبيت (Normal & Install-Time — 20 إذناً):
تمنح تلقائياً عند التثبيت وتخدم الربط بالنظام وإدارة الحسابات:
1. `android.permission.INTERNET`: الاتصال بشبكة الإنترنت وخوادم التطبيق.
2. `android.permission.ACCESS_NETWORK_STATE`: رصد حالة الشبكة ونوع الاتصال (Wi-Fi/خلوي).
3. `android.permission.CHANGE_NETWORK_STATE`: التبديل بين حالات الاتصال عند الحاجة.
4. `android.permission.ACCESS_WIFI_STATE`: التعرف على اسم شبكة Wi-Fi المنزلية للتأكد من تواجد الأبناء.
5. `android.permission.WAKE_LOCK`: إبقاء المعالج نشطاً أثناء معالجة الإحداثيات والرسائل العاجلة.
6. `android.permission.RECEIVE_BOOT_COMPLETED`: إعادة تشغيل خدمات المراقبة وتحديث الجداول فور إقلاع الجهاز.
7. `android.permission.VIBRATE`: تشغيل الاهتزاز عند التنبيهات وإشعار الطوارئ العائلي.
8. `android.permission.FOREGROUND_SERVICE`: تشغيل خدمات واجهة دائمة لحماية العمليات الخلفية من الإلغاء.
9. `android.permission.FOREGROUND_SERVICE_LOCATION`: خدمة واجهة مخصصة لتتبع الموقع الجغرافي وفق معايير Android 14+.
10. `android.permission.AUTHENTICATE_ACCOUNTS`: إدارة الحساب العائلي عبر Android AccountManager.
11. `android.permission.GET_ACCOUNTS`: استرجاع الحسابات المسجلة للتحقق من هوية المستخدم.
12. `android.permission.MANAGE_ACCOUNTS`: إضافة أو تعديل الحسابات المرتبطة بنظام التشغيل.
13. `android.permission.READ_SYNC_SETTINGS`: قراءة حالة المزامنة التلقائية للنظام.
14. `android.permission.WRITE_SYNC_SETTINGS`: تفعيل مزامنة التقويم والأسماء تلقائياً.
15. `android.permission.READ_SYNC_STATS`: فحص تقارير وأخطاء المزامنة الدورية.
16. `android.permission.SCHEDULE_EXACT_ALARM`: جدولة تنبيهات المواعيد بدقة (`maxSdkVersion=32`).
17. `android.permission.USE_EXACT_ALARM`: جدولة المنبهات الدقيقة في Android 13+.
18. `android.permission.ACCESS_ADSERVICES_AD_ID`: معالجة معرّف الإعلانات لحزمة Privacy Sandbox.
19. `android.permission.ACCESS_ADSERVICES_ATTRIBUTION`: قياس وتوثيق الإحالات الإعلانية.
20. `android.permission.ACCESS_ADSERVICES_TOPICS`: تصنيف الاهتمامات العامة لخدمات الإعلانات.

### 3.3. أذونات المتاجر والشركاء والتوقيع المخصص (8 أذونات):
1. `com.android.vending.BILLING`: معالجة الاشتراكات المميزة FamilyWall Premium عبر Google Play.
2. `com.google.android.c2dm.permission.RECEIVE`: استقبال رسائل الدفع اللحظي عبر FCM.
3. `com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE`: قياس حملات التثبيت.
4. `com.google.android.gms.permission.AD_ID`: معرّف إعلانات Google Play Services.
5. `com.google.android.providers.gsf.permission.READ_GSERVICES`: قراءة إعدادات Google Services Framework.
6. `com.huawei.appmarket.service.commondata.permission.GET_COMMON_DATA`: تكامل متجر Huawei AppGallery.
7. `com.samsung.android.mapsagent.permission.READ_APP_INFO`: دعم تطبيق خرائط Samsung.
8. `com.familywall.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`: إذن أمني مخصص معرف برتبة `protectionLevel="signature"` لحماية مستقبلات البث الديناميكية من التطبيقات الخارجية وفق معايير Android 14+.

---

## 4. حصر وتشريح مكونات النظام المعمارية (Application Components Census)

| نوع المكون | العدد الكلي | المصدرة للخارج (`exported=true`) | المحمية والداخلية (`exported=false`) |
|---|---|---|---|
| **الأنشطة (Activities & Aliases)** | 186 | 14 | 172 |
| **الخدمات (Services)** | 30 | 8 | 22 |
| **مستقبلات البث (Broadcast Receivers)** | 26 | 9 | 17 |
| **مزودو المحتوى (Content Providers)** | 7 | 0 (لا يوجد أي مزود مصدر للخارج) | 7 |
| **المجموع الكلي للمكونات** | **249** | **31** | **218** |

### 4.1. تشريح الأنشطة المصدرة وروابط النفاذ العميق (Deep Links)
تتمركز نقاط الدخول المصدرة للخارج في:
1. `com.familywall.app.main.MainActivity` (`exported=true`):
   - نشاط الإطلاق الرئيسي (`android.intent.action.MAIN`, `android.intent.category.LAUNCHER`).
   - معالج الروابط العميقة (`android.intent.action.VIEW`, `DEFAULT`, `BROWSABLE`) على نطاق `api.familywall.com` ببروتوكولي `http` و `https` للمسارات العشرة التالية:
     * `/DPl`: لوحة التحكم العائلية الرئيسية
     * `/DPl/im`: حائط المحادثات والمراسلة
     * `/DPl/home`: شاشة المنزل
     * `/DPl/map`: رادار الخريطة وتتبع الأبناء
     * `/DPl/calendar`: التقويم العائلي الموحد
     * `/DPl/list`: القوائم والمهام التشاركية
     * `/DPl/budget`: إدارة الميزانية العائلية
     * `/DPl/documents`: الخزنة العائلية للوثائق
     * `/DPl/specialdays`: رادار أعياد الميلاد والذكرى السنوية
     * `/DPl/premium`: شاشة الترقية للاشتراك الذهبي
2. `com.familywall.app.event.receiver.IcsReceiverActivity` (`exported=true`):
   - استيراد وتلقي ملفات التقويم العالمية `.ics` (`application/ics`, `text/calendar`, `.*.ics`).
3. `com.familywall.app.message.thread.create.ThreadCreateActivity` (`exported=true`):
   - استقبال مشاركة النصوص من التطبيقات الأخرى (`android.intent.action.SEND` مع `text/plain`).
4. `com.familywall.app.media.set.post.MediaPostActivity` (`exported=true`):
   - استقبال مشاركة الصور والفيديوهات الفردية والمتعددة (`SEND`, `SEND_MULTIPLE`).
5. `com.familywall.app.settings.SettingsActivity` (`exported=true`):
   - الدخول المباشر لإعدادات التنبيهات من نظام أندرويد (`NOTIFICATION_PREFERENCES`).
6. `net.openid.appauth.RedirectUriReceiverActivity` (`exported=true`):
   - مصادقة الدخول الموحد OAuth2 مع Google عبر مخطط الرابط الخاص.

### 4.2. تشريح الخدمات وإطار المزامنة الخلفية (Services & Sync Framework)
1. **محور المزامنة الأصلية (SyncAdapter Framework — 3 خدمات):**
   - `AuthenticationService`: خدمة حسابات النظام، مرتبطة بمصادق `@xml/authenticator`.
   - `CalendarSynchronizationService`: خدمة مزامنة التقويم التلقائية مع `CalendarContract` و `@xml/calendar_syncadapter`.
   - `ContactSynchronizationService`: خدمة مزامنة جهات الاتصال مع `ContactsContract` و `@xml/contact_syncadapter`.
2. **محور التتبع الجغرافي وحماية الأسرة (4 خدمات):**
   - `GeotrackingRequestForegroundService`: خدمة واجهة حارسة تعمل بالصلاحية `foregroundServiceType="location"`.
   - `GeotrackingJobIntentService`: خدمة مجدولة محمية بـ `BIND_JOB_SERVICE` لتحديثات المواقع في الخلفية.
   - `GeofencingJobIntentService`: خدمة معالجة السياج المكاني ودخول/خروج الأبناء من المناطق المحددة.
   - `LocationProvidersChangedService`: رصد تغيير حالة نظام GPS عند إغلاقه أو فتحه من قبل الطفل.
3. **محور الطوارئ والوسائط (3 خدمات):**
   - `PanicOngoingNotificationJobIntentService`: التنبيه المستمر لنداء الطوارئ والإنذار.
   - `PostMediaService`: خدمة رفع الصور والفيديو في الخلفية مع دعم الاستئناف والإلغاء.
   - `ReminderJobIntentService`: معالجة التذكيرات المجدولة للفعاليات العائلية.
4. **محور البنية التحتية والمهام المجدولة (20 خدمة):**
   - خدمات WorkManager و Firebase Messaging و Glance Widgets و Room MultiInstanceInvalidationService.

### 4.3. تشريح مزودي المحتوى (Content Providers — 7 مزودين)
أثبت الفحص المادي أن **جميع مزودي المحتوى السبعة غير مصدرين للخارج بنسبة 100% (`exported=false`)**، مما يحقق حماية أمنية صارمة لعزل البيانات:
- `com.familywall.provider.FamilyProvider` (السلطة: `com.familywall.provider`): مزود البيانات المحلي المباشر.
- `com.familywall.provider.GenericFileProvider` (السلطة: `com.familywall.file.provider`): مزود مشاركة الملفات الآمنة، مع `grantUriPermissions=true`.
- `androidx.startup.InitializationProvider` (السلطة: `com.familywall.androidx-startup`): مهيئ مركزي للمكتبات.
- مزودو التهيئة الخارجية: `FirebaseInitProvider`, `MobileAdsInitProvider`, `io.purchasely.providers.InitializerProvider`, `com.adjust.sdk.SystemLifecycleContentProvider`.

---

## 5. تسوية ومطابقة أرقام الـ APK والموارد (APK Asset Reconciliation)

### 5.1. الحصر المادي الدقيق لملفات DEX على القرص
- **الادعاء السابق في التقرير التنفيذي (`00_EXECUTIVE_SUMMARY.md:6`):** "تحتوي على 11 ملف DEX بحجم 82.42 MB".
- **الواقع المادي القطعي على القرص:**
  - يوجد على القرص **ملفان فقط (.dex)** داخل المسار: `benchmarks/extracted/familywall/_target_dex/`:
    1. classes6.dex بحجم **12,082,392 بايت** (بصمة SHA-256: 3b412e892e6e8c4603f5029d8e533eb41c9523a4e0e7ba3df5b0d772327e77a6).
    2. classes7.dex بحجم **9,599,212 بايت** (بصمة SHA-256: d3c5de0eff3a685a3c857073209434f982ed5fe8ca55ec12d66a0d4238d35526).
    - إجمالي الحجم المادي لملفات DEX الفعلية على القرص: **21,681,604 بايت (~20.68 ميجابايت)**.
    - عدد البصمات الفريدة: **2 بصمتان فريدتان**.
  - المجلد `_apktool_raw/` لا يحتوي على أي ملف بصيغة `.dex`، بل يحتوي على **11 مجلد smali** (`smali`, `smali_classes2` إلى `smali_classes11`) تمثل الكود الوسيط المفكك من الحاويات الـ 11 لحزمة APK الأصلية.

### 5.2. تسوية إحصاءات الكود المصدري (Java vs Kotlin)
- **ملفات Java المفككة:** **7,032 ملف Java** في `03_decompiled_src/sources/` (تضم كود التطبيق المكتوب أصلاً بلغة Kotlin والذي فككته أداة JADX إلى ملفات `.java` مدعومة بوسوم `@Metadata`).
- **ملفات Kotlin المباشرة:** **3 ملفات `.kt`** في `04_extracted_algorithms/` تمثل نماذج هندسية مشتقة لـ Family OS (Level B).
- **الإجمالي الفعلي:** 7,035 ملفاً في مجلدات العمل الأساسية (أو 7,039 ملف Java شاملاً ملفات التعريف في `_apktool_raw`).

### 5.3. تسوية واجهات التخطيط (Layout XML)
- **واجهات التخطيط الرئيسية المفرزة (`key_layouts`):** **432 ملف تخطيط XML** في `02_design_system_and_ui/key_layouts/` (مقابل 438 ادعاها الملخص باحتساب مسودات التوثيق).
- **إجمالي واجهات التخطيط الكاملة على القرص:** **2,198 ملف XML** موزعة عبر مجلدات `_apktool_raw/res/layout*` بمختلف تكوينات ومحددات الشاشات واللغات.

### 5.4. تسوية الأصول الرسومية والبصرية (Vectors, Lottie, Illustrations, Colors)
- **المتجهات الرسومية (Vector Drawables):** **1,137 ملف XML** في مجلد `02_design_system_and_ui/all_vector_drawables/` كأصول رئيسية، وإجمالي **3,841 ملف متجه XML** على كامل القرص.
- **رسوم لوتي المتحركة (Lottie Animations):** **41 ملف JSON** في `02_design_system_and_ui/lottie_animations/` (مطابق بنسبة 100% للملخص التنفيذي).
- **الرسوم التوضيحية عالية الدقة (Illustrations):** **127 ملفاً** بصيغ PNG/WEBP في `02_design_system_and_ui/illustrations_high_res/` (مطابق بنسبة 100% للملخص التنفيذي).
- **رموز الألوان وقيم السمات (Colors & Tokens):** **1,341 مفتاح لون** موثق في `02_design_system_and_ui/colors_and_theme.json`.

### 5.5. تسوية الحجم الكلي ووحدات القياس
- الحجم الفعلي على القرص لجميع ملفات الجرد T0 (103,133 ملفاً) هو:
  **962.15 MiB (بمعيار 1024 بايت = 1008882813 / 1048576) / 1,008.88 MB (بمعيار 1000 بايت)**.
  والخلط السابق في الملخص (82.42 MB) نتج عن قياس الأرشيف المضغوط الأولي قبل استخراج كود Smali وموارد الوسائط.

---

## 6. توصيات الصهر والاستفادة لـ Family OS (S1-01 إلى S1-09)

1. **إدارة دورة حياة المزامنة الأصلية (S1-01 / S1-02):** الاستفادة من معمارية `SyncAdapter` التي تحقق مزامنة ثنائية الاتجاه مع تقويم وأسماء أندرويد دون استنزاف البطارية أو انتهاك خلفية Doze Mode.
2. **أمن مشاركة الملفات (S1-08 / S1-09):** تبني نمط مزود الملفات المعزول تماماً (`exported=false` مع `grantUriPermissions=true`) لحماية وثائق الخزنة العائلية وصور المحادثات من الاختراق الخارجي.
3. **تكامل إشعارات الطوارئ (S1-06):** تبني نمط خدمة الواجهة الحارسة للموقع (`foregroundServiceType="location"`) لتوفير مسار موثوق لنداء الاستغاثة العائلي فور انقطاع الاتصال.
