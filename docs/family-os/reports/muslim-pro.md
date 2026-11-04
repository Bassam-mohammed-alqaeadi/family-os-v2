# تقرير الهندسة العكسية — Muslim Pro

## 1. نظرة عامة
- **الحزمة:** `com.bitsmedia.android.muslimpro`
- **النسخة المرصودة:** `17.11` (versionCode `1711000201`) — ملاحظة: تختلف عن v11.2.9 المذكورة في التكليف؛ هذه نسخة APKPure الأحدث.
- **الدور في Family OS:** وحدة الخدمات الدينية واليومية — مواقيت الصلاة، القبلة، القرآن الكريم (تلاوة/حفظ/تجويد)، الأذكار.
- **حجم المخرجات:** ~17,240 ملف Java؛ كود التطبيق الحقيقي تحت `com/bitsmedia/android/` (حزم ميزات واضحة غير مشوشة) + مكتبة داخلية `com/bitsmedia/libs/prayertimes`؛ الباقي مكتبات (Compose في `defpackage` ~6655 ملف).

## 2. البنية المعمارية
- **حزم الميزات** (كل ميزة حزمة مستقلة — نمط Feature Modules):
  - `com.bitsmedia.android.prayer/` — الصلاة: `prayers/` (المواقيت)، `adhan/` (صوت الأذان)، `settings/`، `onboarding/`، `data/`
  - `com.bitsmedia.android.qibla/` — القبلة (`ui/` فقط ظهرت)
  - `com.bitsmedia.android.quran/` — `read`، `sura`، `juz`، `audiorecitation`، `tajweed`، `khatam`، `playlist`، `learn`، `myquran`، `myprogress`، `ayashare`، `immerse`
  - `quransearch/`، `quranmemorization/`، `quranlesson/` — حزم مستقلة للبحث والحفظ والدروس
  - `community/`، `journal/`، `timelinev2/`، `today/`، `onboardingui/` — ميزات اجتماعية ويومية
  - `apimanager/remote/dto/` — نماذج البيانات القادمة من السيرفر
- **حقن الاعتماديات:** Hilt (ملفات `*_HiltModules.java` في كل حزمة).
- **مكتبة داخلية:** `com.bitsmedia.libs.prayertimes` — مكتبة Kotlin Multiplatform (يوجد `Platform_androidKt` و`shared/`) لمنطق المواقيت.

## 3. الميزات الرئيسية وربطها بوحدات Family OS
| ميزة Muslim Pro | وحدة Family OS المقابلة |
|---|---|
| مواقيت الصلاة + تنبيهاتها | الخدمات اليومية / الإشعارات الذكية |
| القبلة (بوصلة) | أدوات مساعدة |
| القرآن: تلاوة صوتية، حفظ، تجويد، ختمة، بحث | التعليم |
| الأذكار والأدعية (`DuaRecitationDto`) | المحتوى اليومي |
| التقويم الهجري (`HijriCalendar`) | التقويم العائلي |
| ودجت المواقيت (`HorizontalPrayerTimeWidget` / `VerticalPrayerTimeWidget`) | ودجت المنصة |

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
> ⚠️ أجسام الدوال في مكتبة KMP ظهرت كـ stubs (انظر §8) — **البِنى والنماذج سليمة وقابلة لإعادة الاستخدام**، أما الأجسام الحسابية فلم تُستخرج.

- **`com/bitsmedia/libs/prayertimes/location/GeoLocation.java`** — نموذج بيانات نظيف وكامل: `latitude`، `longitude`، `altitudeMeters`، `timeZoneId`. **يُعاد استخدامه كما هو** لأي خدمة موقع في المنصة.
- **`com/bitsmedia/libs/prayertimes/settings/FajrCalculationMethod.java`** — هرم sealed لأنواع حساب الفجر: `AngleBased(angle)`؛ ومعها `IshaCalculationMethod.java` و`MaghribCalculationMethod.java`. **النموذج التصميمي** (طرق الحساب كأنواع مغلقة بزوايا) يُعتمد كمواصفة لإعادة التنفيذ.
- **`com/bitsmedia/libs/prayertimes/precalc/PrecalcConfig.java`** — `(id, location, radius)`: إثبات معماري أن المواقيت **تُحسب على السيرفر مسبقًا** وتُنزَّل حسب المنطقة — لا حاجة لبناء فلك على الجهاز.
- **`com/bitsmedia/android/apimanager/remote/dto/PrecalcRegionEntryDto.java`** — نموذج جدول المواقيت المحسوب مسبقًا لكل منطقة.
- **`com/bitsmedia/android/apimanager/remote/dto/AdhanDto.java`** — نموذج أصوات الأذان القابلة للاختيار.
- **`com/bitsmedia/android/apimanager/remote/dto/QuranRecitationDto.java`** و**`TranslationDto.java`** و**`DuaRecitationDto.java`** — نماذج المحتوى الصوتي والترجمات.
- **معمارية التنبيهات** (من الـ manifest — الكلاسات نفسها مشوشة ولم تُستخرج):
  - `.core.PrayerTimeNotificationReceiver` — استقبال إنذار وقت الصلاة
  - `.core.AlarmAndRemindersBroadcastReceiver` — المنبهات والتذكيرات
  - `.core.NotificationCycleService` — خدمة تدوير الإشعارات
  - النمط القابل لإعادة الاستخدام: `SCHEDULE_EXACT_ALARM` + `USE_FULL_SCREEN_INTENT` (تنبيه بملء الشاشة) + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (تشغيل الأذان كخدمة أمامية) + `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.

## 5. الصلاحيات والمكونات الحساسة
- **الموقع:** `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` (أساس المواقيت والقبلة).
- **المنبهات الدقيقة:** `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM` — حرجة لمواقيت الصلاة.
- **التنبيهات:** `POST_NOTIFICATIONS` + `USE_FULL_SCREEN_INTENT` (إظهار التنبيه فوق شاشة القفل).
- **البطارية:** `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` + `RECEIVE_BOOT_COMPLETED` (إعادة جدولة المنبهات بعد الإقلاع).
- **الوسائط:** `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (صوت الأذان)، `READ_MEDIA_VISUAL_USER_SELECTED`.
- **أخرى:** `CAMERA` (غالبًا للقبلة بالواقع المعزز)، `RECORD_AUDIO` (تلاوة المستخدم)، `SYSTEM_ALERT_WINDOW`.

## 6. الشبكة ونقاط التكامل
- **API الأساسي:** `https://api-mp.muslimpro.com` (و`https://api-mp.staging.muslimpro.com` للتجربة).
- **الدفع:** `com.google.android.gms.permission.AD_ID` + إشارات Purchasely في الكود (`io.purchasely`).
- **الإشعارات:** `.core.MPFirebaseMessagingService` (Firebase Cloud Messaging).
- **المعمارية:** Client يستهلك جداول محسوبة مسبقًا (precalc) + إعدادات حساب تُنزَّل (`CalculationApiRepository`) — أي أن "ذكاء" المواقيت على السيرفر.

## 7. توصيات إعادة الاستخدام
1. **اعتماد نموذج `GeoLocation`** كما هو في وحدة الموقع بالمنصة.
2. **اعتماد معمارية precalc**: لا تُعِد بناء الحسابات الفلكية على الجهاز — صُمم API يقدّم جداول محسوبة مسبقًا حسب `(id, location, radius)`، فهو أرخص بطاريةً وأدقّ صيانةً.
3. **اعتماد نموذج طرق الحساب** (`AngleBased` وأخواتها) كمواصفة — الزوايا المعيارية لكل مذهب جاهزة كبنية.
4. **اعتماد نمط التنبيهات**: منبهات دقيقة + Full-Screen Intent + خدمة أمامية للصوت — يُعمَّم على كل تذكيرات المنصة (دواء، مهام، مواعيد).
5. **نماذج المحتوى** (`QuranRecitationDto`، `TranslationDto`، `DuaRecitationDto`) أساسٌ لوحدة المحتوى التعليمي.
6. **لا تُعِد اختراع التقويم الهجري من هذا الاستخراج** — الكلاس الموجود stub فارغ.

## 8. ملاحظات (التشويش، حدود التحليل)
- أجسام دوال مكتبة `libs/prayertimes` (KMP) ظهرت فارغة (مثل `isRamadan()` تُرجع `false` و`downloadSettings` تُرجع `"No Data"`) — قيد في فك jadx لكود KMP، **وليست** المنطق الحقيقي.
- كلاسات `.core.*` (المسجلة في الـ manifest) لم تُعثر عليها في المصادر — مشوشة الأسماء على الأرجح.
- **خوارزمية اتجاه القبلة (bearing) لم تُستخرج** — لا إحداثيات كعبة ولا `atan2` في الكود المفكك؛ مجلد `qibla/` لا يحوي إلا واجهات.
- `defpackage/` (~6655 ملف) هي مكونات Compose الداخلية — تُتجاهل.
- لم تُعثر على واجهات Retrofit معلنة (`@GET`) — طبقة الشبكة مشوشة أو في dex لم يُفكك نصيًا.
