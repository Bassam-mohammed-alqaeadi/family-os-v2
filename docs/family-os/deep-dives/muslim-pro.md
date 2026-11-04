# تحليل الهندسة العكسية العميق — Muslim Pro

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/muslim-pro.md`).
> **تصحيح جوهري عن التقرير السابق:** التقرير السابق قال "المواقيت محسوبة مسبقاً على السيرفر" — **هذا غير دقيق.**
> ما أثبته هذا التحليل: الـ precalc **فهرس مصادر/مناطق حساب** (1,143 مدخلاً) وليس جداول مواقيت مُنزّلة،
> و**الحساب الفلكي الكامل يتم على الجهاز** بمحرك حقيقي (ظهر كـ stubs في jadx لكنه كامل في الـ smali).
> ملاحظة سياقية: فرع `feat` القديم لم ينتج أي تغطية تركيبية لـ Muslim Pro رغم وجود تفكيكه —
> فهذا أول توثيق حقيقي مكتمل للتطبيق.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.bitsmedia.android.muslimpro` |
| الإصدار المحلَّل | 17.11 (versionCode 1711000201) |
| نوع الملف | XAPK (99MB) ← base APK مستخرج |
| smali / java | 113,557 / 17,240 — **أكبر تطبيق مفكك في البرنامج** |
| حجم المخرجات | ~1.4GB |
| البنية | تطبيق أصلي (Kotlin/Java) + Compose داخل Activities + Hilt DI + KMP (`com.bitsmedia.libs.prayertimes`) |
| الدور في Family OS | **ركيزة الدين**: المواقيت، الأذان، القبلة، القرآن (تلاوة/حفظ/تجويد/ختمة)، التقويم الهجري |
| تطبيق طفل؟ | لا — تطبيق واحد |

### البنية المعمارية العليا [VERIFIED]
- **حزم الميزات** (Feature Modules): `prayer/` (مواقيت/أذان/إعدادات)، `qibla/`، `quran/` (read, sura, juz, audiorecitation, tajweed, khatam, playlist, learn, myquran, myprogress, ayashare, immerse)، `quransearch/`، `quranmemorization/`، `quranlesson/`، `community/`، `journal/`، `timelinev2/`، `today/`، `widget/` (18 ودجت!).
- **Multi-activity (250 نشاطاً)** وليست single-activity — كل ميزة activity مستقل، وCompose يُستخدم داخلها.
- **مكتبة KMP داخلية** `com.bitsmedia.libs.prayertimes` (calculator + precalc + settings + calendar + location).
- **صفر native .so** — كل شيء جافا/Kotlin خالص (حتى فك تشفير الأصول بجافا خالصة).

---

## 2. الغوص العميق — محركات الصلاة

### 2.1 تصحيح الـ precalc: فهرس مصادر لا جداول مواقيت [VERIFIED]
- `PrecalcSourcesRepository` (مموّه باسم `apktool-out/smali_classes2/VolumeUpKt.smali`): يجلب فهرس **مصادر الحساب** (مساجد وجهات) لا جداول مواقيت.
- الـ DTOs غير مموّهة: `PrecalcRegionEntryDto{country_code, precalc_id, source, latitude, longitude, radius}` + `PrecalcSourcesResponse`.
- مثال: `{"country_code":"FR","precalc_id":"FR0000010","source":"Mosquée de Paris (Nantes)","latitude":47.2184,"longitude":-1.5536}`.
- **Fallback مدمج:** `assets/content/precalc_sources.json` (1,143 مدخلاً) يُقرأ عند فشل الشبكة.
- **التخزين:** جدول Room `precalc_region(id, regionId, country, source, locLat, locLong, radius)` في `PrayerDb` — الـ entity: `com.bitsmedia.android.prayer.data.local.entity.PrecalcRegionEntity`.
- طبقة KMP الشبكية **ميتة**: `CalculationApiRepository.downloadSettings()` تُرجع حرفياً `"No Data"` — كل الشبك الحقيقي في طبقة التطبيق عبر router مموّه (DexGuard-style، يحتاج تحليل ديناميكي).

### 2.2 المحرك الفلكي على الجهاز — حقيقي وكامل [VERIFIED]
- `calculator/AstronomicalMathKt.smali` (626 سطراً): `getJulianDate, sunDeclination, equationOfTime, fixAngle, fixHour, dsin/dcos/dtan/dasin/dacos/datan2...` — نسخة طبق الأصل من مكتبة **batoulapps/adhan** الشهيرة.
- `calculator/Calculator.smali` (3,228 سطراً): `getFajrTime, getIshaTime, getMaghribTime, getZohorTime, getAsrTime, getSunsetTime, getTahajjudTime, getIftarTime, getImsakTime, getAdhanTime, currentPrayer, nextPrayer, previousPrayer, polarResolution, asrAngle, ownAngleFor` (زوايا مخصصة).
- **22 convention جاهزة**: MWL (فجر 18 / عشاء 17 — مؤكد من الثوابت)، ISNA، Egypt، EgyptBis، Makkah، Karachi، Tehran، Jafari، Diyanet، KEMENAG، MUIS، JAKIM، UOIF، Tunisia، Algeria، Basque، FR15، FR18، AwqafUAE، UIPTL، FixedIsha، Custom.
- هرميات sealed: `FajrCalculationMethod` (AngleBased/MinuteBased)، `IshaCalculationMethod` (AngleBased/MaghribDelayBased/SunsetDelayBased)، `MaghribCalculationMethod` (Sunset/PostSunset)، `AsrCalculationMethod`، `HighLatitudeAdjustmentMethod`، `DstSetting`، `PolarResolution`.
- `UiptlTablesKt`: جدولا دقائق `uiptlFajr/uiptlIsha` (365 مدخلاً لكل يوم).
- **النموذج الهجين:** `AutoSettingDto{angleFajr, angleIsha, convention, corrections[], countryCode, dst, hiLat, hijri, imsak, juristic, ramadanIshaDelay, isDefault}` — **السيرفر يدفع إعدادات الحساب لكل دولة، والجهاز يحسب**. أفضل العالمين: مرونة سيرفرية + عمل دون اتصال.

### 2.3 ما يُعاد استخدامه فوراً
- `GeoLocation{latitude, longitude, altitudeMeters, timeZoneId}` — نموذج نظيف لأي خدمة موقع.
- المحرك الفلكي كاملاً (port من adhan — مكتبة مفتوحة المصدر، لا مشكلة IP في الفكرة).

---

## 3. الغوص العميق — الأذان والتنبيهات

### 3.1 نظام الأذان [VERIFIED]
- `AdhanDto{id, type, order, name, filename, checksum, preview_checksum, duration, flag, video_id, free_with_login_countries, is_default, updated_at, legacy_id}` — كتالوج مؤذنين قابل للتنزيل (37 أذاناً في `assets/content/adhans.json`).
- **التنزيل:** `https://download.muslimpro.com/adhan/` + `filename` → تخزين `Download/Adhans` (ملفات `.mp3`) + تفضيل `selected_adhans`.
- **التشغيل — مفاجأة معمارية:** الأذان يُشغَّل كـ **`Notification.sound`** (URI ملف المؤذن) — مؤكد في `PrayerTimeNotificationReceiver.smali` (~سطر 1660) مع `AudioAttributes`، وقبله بث `PLAYER_ACTION_PAUSE` لإيقاف أي تشغيل جارٍ. **لا MediaPlayer/ExoPlayer للأذان** — أبسط وأوثق.
- ملفات مدمجة في `res/raw/`: `adhan_madina.mp3` و`adhan_fajr_madina.mp3` فقط.
- **تفضيلات مستقلة لكل صلاة:** `notification_fajr_97003`, `notification_fajr_alarm_97003`, `notification_sunrise_97003`, `notification_zohor_97003`... (تنبيه + منبّه لكل صلاة).

### 3.2 حزمة موثوقية التنبيهات [VERIFIED]
- `AlarmManager.setExactAndAllowWhileIdle` (مؤكد سطر 872 في المجدول المموّه) مع فحص `canScheduleExactAlarms()`.
- `PrayerTimeNotificationReceiver` يستمع: `BOOT_COMPLETED, LOCALE_CHANGED, DATE_CHANGED, TIMEZONE_CHANGED, TIME_SET` + `ADHAN_NOTIFICATION, ADHAN_RESTART, PRE_ADHAN_NOTIFICATION` — **إعادة جدولة كاملة عند الإقلاع وتغيّر المنطقة/الوقت**.
- `AlarmAndRemindersBroadcastReceiver` يراقب `SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED` — **إعادة الجدولة عند سحب إذن المنبهات**.
- `AdhanAlarmPermissionActivity` (Compose) — شاشة توعية بالأذونات.
- `NotificationCycleService` — خدمة foreground للتنبيهات الدورية والودجت.
- الأذونات: `SCHEDULE_EXACT_ALARM` + `USE_FULL_SCREEN_INTENT` + `RECEIVE_BOOT_COMPLETED` + `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.

---

## 4. الغوص العميق — القبلة والتقويم الهجري

### 4.1 القبلة — معادلة كاملة [VERIFIED]
- `smali_classes10/com/bitsmedia/android/qibla/QiblaViewModel.smali`: إحداثيات الكعبة كثوابت `21.4225` و`39.8262`.
- **معادلة الـ bearing مقروءة كاملة** (سطور 593-686): `Δlong = 39.8262 − userLong`، ثم `y = sin(Δlong)·cos(kaabaLat)`، `x = cos(userLat)·sin(kaabaLat) − sin(userLat)·cos(kaabaLat)·cos(Δlong)`، ثم `bearing = (toDegrees(atan2(y,x)) + 360) % 360` — صيغة الدائرة العظمى القياسية.
- الحساسات: `SensorManager.getDefaultSensor(1)` = **TYPE_ACCELEROMETER** و`(2)` = **TYPE_MAGNETIC_FIELD**، مع `registerListener/unregisterListener` في `onCleared`.
- المكونات: `QiblaActivity` + `QiblaTroubleShootActivity` (معايرة) + ودجت `widget/qibla`.
- [INFERENCE] دمج الحساسات (`getRotationMatrix/getOrientation`) في كلاس مساعد مموّه؛ لا استخدام كاميرا/AR ظاهر.

### 4.2 التقويم الهجري — بيانات سيرفر لا خوارزمية [VERIFIED]
- `HijriCalendar.isRamadan()` في KMP تُرجع `false` دائماً (stub مؤكد في الـ smali) — **لا يوجد حساب هجري على الجهاز إطلاقاً**.
- الحقيقة: `assets/hijri.json` (مشفر) + كود يبني **`mHijrMap`** (خريطة ميلادي→هجري) من JSON مُنزّل من السيرفر ("Hijri file saved: success").
- **نقطة ضعف معمارية:** تبعية سيرفرية + تشفير مغلق لتقويم يومي أساسي.

---

## 5. الغوص العميق — القرآن والمنصة

### 5.1 الصوتيات — حزم تنزيل مجزأة [VERIFIED]
- `QuranRecitationDto{s3_path, s3_pathroot, checksums[], timestamps[], sizes[], is_free, is_default, reciter_image}` — حزم ZIP من `download.muslimpro.com`.
- `assets/content/quran_recitations.json`: الافتراضي `abdul-basit-abdus-samad` — `quran-audio/abdul-basit-abdus-samad.zip` بحجم **463MB** مع **115 checksum** (114 سورة + فهرس) — **تنزيل مجزأ لكل سورة** مع تحقق سلامة وتحديث تفاضلي عبر `timestamps`.
- 8 قرّاء مضمنون؛ 71 ترجمة (`translations.json`) بنمط `quran-sql/<id>.sql.zip`.
- المحرك: `android.media.MediaPlayer` (لا ExoPlayer) في `quran/data/audioplayer/QuranAudioPlayer.smali` كـ foreground service (`mediaPlayback`).
- 5 خدمات صوتية ترث `mediaplayer.BaseMediaPlayer`: `QuranAudioPlayer`، `SuraPlayer`، `DuaPlayer`، `NamesPlayer`، `QalboxMediaService`.

### 5.2 الحفظ والتجويد والختمة [VERIFIED]
- **الحفظ:** `MemoriseStatus(id, status)` لكل آية + `MemoriseSyncViewModel` (**مزامنة سحابية**) + `QuranMemorisePlayerViewModel`.
- **التجويد:** 8 قواعد مشروحة في `res/values/strings.xml` + رموز الوقوف + دليل الألوان.
- **المصدر الذهبي:** نص المصحف والخطوط من **Quranic Universal Library (QUL)** مفتوح المصدر من Tarteel — مذكور حرفياً في الـ strings (`https://qul.tarteel.ai`). [INFERENCE] ترميز التلوين لكل كلمة داخل `quran.sqlite`.
- **الختمة اجتماعية:** `NewKhatamRequest(name, endAt, physical)`، `ClaimSegmentDto`، `JuzSegment`/`CompletedJuzSegment`، `NudgeRequest` (تذكير القرّاء)، `ShareKhatamRequest/Response`، `BadgeModel`/`UserBadge` (شارات).
- **البحث:** سيرفر (`FeaturedItem`، `MoodItem`، `SearchFeedbackDto`) مع كاش محلي (`SearchAyaEntity`) — لا فهرس محلي كامل.

### 5.3 طبقة البيانات — بلا Room! [VERIFIED]
- **لا Room إطلاقاً** في كود التطبيق (فقط `room-common` كاعتمادية) ولا `SQLiteOpenHelper` مخصص.
- DTOs بمزامنة Firestore: `QuranDto(verse,status,timestamp)`، `QuranProgressDto(quran_last_played_position, quran_last_read_position)`، `QuranHighlightDto(verse, highlight_type, ayas: Map<String,Int>)`، `QuranSettingsDto`، `QuranNoteDto` — annotations بأسماء حقول Firestore.
- محرك مزامنة عام: `syncmanager/.../SyncPayload(HashMap<String,Object>)` + `BasePayload` + `DhkirSyncDto`.
- **الأصول مشفرة بتشفير مخصص:** `assets/quran.sqlite` (7.2MB) + `hisnul_v12.sqlite` — ليست SQLite حقيقية، تُفك بجافا خالصة (لا SQLCipher، لا .so).
- الكيانات: `Page` (Parcelable)، `JuzSuraItem`، `SuraType`، `Playlist/PlaylistSura/PlayedSuras`، `AyaBookmark`، `AyaCheckmark`، `Note`.

### 5.4 Manifest والبنية [VERIFIED]
- **250 نشاطاً / 27 خدمة / 55 مستقبلاً / 11 مزوداً**؛ اللانشر `.core.activities.SplashActivity`؛ صنف التطبيق `.core.MPApplication` + `com.pairip.application.Application` (**PairIP anti-tamper**).
- **18 ودجت** (`widget.*`): صلاة (all/current/horizontal/daily trackers)، قرآن (last-read, last-listened, daily-verse, daily-deen, immerse, duas)، tasbih، fasting، names99، qibla، inspiration، qalbox، و**AiDeenWidget** (ودجت ذكاء اصطناعي!).
- **29 إذناً**: موقع دقيق/تقريبي، منبهات دقيقة، إشعارات، ملء الشاشة، تجاوز تحسين البطارية، تشغيل وسائط أمامي، كاميرا، تسجيل صوت، `SYSTEM_ALERT_WINDOW`.
- FCM: `MPFirebaseMessagingService` + `MPFirebaseTokenService`؛ `allowBackup=false`، `largeHeap=true`، `supportsRtl=true`.
- **AskAiDeen / AskAbdullah (RAG)** [VERIFIED]: ديب-لنك من القرآن (`ai_deen_aya_id/sura_id`) + `PredefinedQuestion`؛ و`QuranSource(page_content, confidence, sura_id, aya_id, translated_by)` + `HadithSource` + `Feedback` — **إجابات موثقة بالمصادر مع درجة ثقة**.
- الفوترة: Purchasely (`io.purchasely`).

---

## 6. عقود البيانات والشبكة

- **API:** `https://api-mp.muslimpro.com` (+ `api-qb.muslimpro.com` للـ Qalbox) — المسارات الدقيقة مموّهة بتشفير سلاسل (DexGuard-style).
- **CDN:** `https://download.muslimpro.com` (صوت/صور/ترجمات/أذان).
- **أب→سحابة:** إعدادات الحساب + AutoSettingDto + مزامنة الحالة (SyncPayload) + الفوترة.
- **سحابة→تطبيق:** فهرس precalc-sources + hijri.json + كتالوجات (adhans.json, quran_recitations.json, translations.json) + حزم ZIP.
- **المصادقة:** token عبر api-mp — التفاصيل مموّهة [INFERENCE].
- **ملاحظة:** `usesCleartextTraffic="true"` في الـ Manifest — لا تُنسخ.

---

## 7. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب |
|---|---|---|---|
| 1 | **المحرك الفلكي الكامل** (`calculator/`: AstronomicalMathKt + Calculator + 22 Convention + جداول UIPTL) | 1 | ناضج ومكتمل ومجرّب (port من adhan مفتوحة المصدر) — Family OS تحسب المواقيت على الجهاز 100% بلا أي سيرفر. **أكبر كنز في التطبيق.** |
| 2 | **نظام حزم المحتوى دون-اتصال** (شكل `QuranRecitationDto`: ZIP + checksums/timestamps/sizes لكل قطعة + `is_free` + تحديث تفاضلي) | 1 | انسخه حرفياً — يصلح للقرآن والدروس والصوتيات العائلية. |
| 3 | **نموذج الأذان** (`AdhanDto` + تنزيل CDN + `Download/Adhans` + التشغيل كـ `Notification.sound` + تفضيلات لكل صلاة) | 1 | أبسط وأوثق من خدمة تشغيل — أضف مؤذنين يمنيين/خليجيين لنفس البنية. |
| 4 | **حزمة موثوقية التنبيهات** (`setExactAndAllowWhileIdle` + إعادة الجدولة عند BOOT/TIMEZONE/TIME_SET + مراقبة سحب الإذن + شاشة توعية) | 1 | الوصفة التي تجعل التنبيهات لا تفوت — تُعمَّم على كل تذكيرات المنصة. |
| 5 | **QUL من Tarteel (مفتوح المصدر)** — نص المصحف والخطوط والتجويد | 1 | متاح قانونياً ونظيفاً — يلغي مشكلة IP النص القرآني ويوفر سنوات. |
| 6 | **مزامنة حالة المستخدم** (DTOs: `QuranProgressDto`، `QuranHighlightDto`، `QuranSettingsDto` + `SyncPayload`) | 1 | الأب يرى تقدم الأبناء لحظياً — عمود Family OS. |
| 7 | **نمط RAG للإجابات الدينية** (`QuranSource` + `HadithSource` + `Feedback` بدرجة ثقة) | 2 | يطابق "AI في كل خدمة" ويمنع هلوسة الفتاوى — ابنِ وكيل الأب على هذا النمط. |
| 8 | **معمارية precalc-sources** (فهرس مناطق + Room + fallback مدمج) | 2 | ملف خاص بمناطق اليمن/الخليج أولاً — بلا اعتماد على API أجنبي. |
| 9 | **معادلة القبلة حرفياً** (21.4225/39.8262 + atan2 + accelerometer/magnetometer) | 1 | معادلة قياسية — انسخها كما هي. |
| 10 | **عائلة الودجت** (18 ودجت incl. ودجت AI) | 3 | مرجع لبنية ودجت متابعة الصلاة العائلية. |
| 11 | **الختمة الاجتماعية** (ClaimSegment + Nudge + Badges) | 2 | نواة محرك المكافآت الديني للأطفال. |
| ✗ | `usesCleartextTraffic="true"` | ✗ | مرفوض أمنياً. |
| ✗ | نموذج التاريخ الهجري (ملف سيرفر مشفر) | ✗ | تبعية + تشفير مغلق — الأفضل خوارزمية Kuwaiti على الجهاز مع offset قابل للضبط. |
| ✗ | تشفير السلاسل المموّه (DexGuard-style) وأفكار PairIP | ✗ | نأخذ الأفكار المعمارية والكود النظيف فقط. |

### الفجوة الاستراتيجية التي يملؤها هذا التحليل
تقرير الجولة الأولى انتهى عند "خوارزمية القبلة لم تُستخرج" و"المواقيت على السيرفر". الآن نملك **الآلة الكاملة**: المحرك الفلكي سطراً بسطر، نموذج الأذان، معادلة القبلة، نظام الحزم، وRAG ديني — وهذا هو الأساس الذي ستُبنى عليه **ركيزة الدين** في Family OS. وفرع `feat` لم ينتج أي تغطية تركيبية لهذا التطبيق — الفجوة أُغلقت هنا.

---

## 8. أسئلة مفتوحة وخريطة الملفات المرجعية

### أسئلة مفتوحة
1. مسارات endpoints الدقيقة لـ api-mp (مموّهة بتشفير سلاسل) — تحتاج تحليل ديناميكي [INFERENCE].
2. آلية المصادقة (token) على api-mp — مموّهة.
3. مفتاح فك تشفير `quran.sqlite` — مموّه + PairIP.
4. دمج الحساسات للقبلة (`getRotationMatrix`) — في كلاس مموّه لم يُحدد.
5. هل `FOREGROUND_SERVICE_MEDIA_PLAYBACK` يُستخدم فعلاً لغير القرآن؟ [INFERENCE: لا].
6. سياسة تحديث `hijri.json` الدورية (التكرار والمصدر).
7. تفاصيل `AskAbdullah` الخلفية (موديل الـ LLM المستخدم).
8. الـ 22 convention: هل كلها مفعّلة للمستخدم أم بعضها مخفي؟

### خريطة الملفات المرجعية (`~/workspace/rework/muslim-pro/`)
- `jadx-out/.../com/bitsmedia/libs/prayertimes/calculator/Calculator.java` — المحرك الفلكي (الأثمن).
- `jadx-out/.../com/bitsmedia/libs/prayertimes/calculator/AstronomicalMathKt.java` — الرياضيات الفلكية.
- `jadx-out/.../com/bitsmedia/libs/prayertimes/settings/FajrCalculationMethod.java` (+ Isha/Maghrib/Asr) — هرميات الطرق.
- `jadx-out/.../com/bitsmedia/libs/prayertimes/location/GeoLocation.java` — نموذج الموقع.
- `jadx-out/.../com/bitsmedia/android/prayer/data/local/entity/PrecalcRegionEntity.java` — كيان المناطق.
- `jadx-out/.../com/bitsmedia/android/apimanager/remote/dto/AdhanDto.java` — كتالوج الأذان.
- `jadx-out/.../com/bitsmedia/android/apimanager/remote/dto/QuranRecitationDto.java` — حزم الصوت.
- `apktool-out/smali_classes10/com/bitsmedia/android/qibla/QiblaViewModel.smali` — معادلة القبلة (سطور 593-686).
- `apktool-out/assets/content/quran_recitations.json` — كتالوج القرّاء.
- `apktool-out/assets/content/adhans.json` — كتالوج الأذان (37).
- `apktool-out/assets/content/precalc_sources.json` — فهرس المناطق (1,143).
- `apktool-out/AndroidManifest.xml` — المكونات (250/27/55/11) والأذونات.
