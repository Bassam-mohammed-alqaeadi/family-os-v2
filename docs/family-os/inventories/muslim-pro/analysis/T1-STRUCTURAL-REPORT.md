# التقرير الهيكلي لتشريح الحزمة والمكونات — Muslim Pro (T1 Structural Analysis)

> **المعرف:** `T1-MP-STRUCTURAL-001`
> **التطبيق:** Muslim Pro (`muslim-pro`)
> **الحزمة المفحوصة:** `com.bitsmedia.android.muslimpro`
> **الإصدار المستخرج:** `17.11` (versionCode `1711000201`)
> **المعمارية التقنية:** تطبيق أصلي أحادي (Native Kotlin/Java) + Compose داخل Activities + Hilt + KMP

---

## 1. الملخص التنفيذي للهيكلية

Muslim Pro **تطبيق أحادي ضخم** (Single-App Monolith) — 113,557 ملف smali و17,240 ملف java — منظم كحزم ميزات (Feature Modules) تحت `com.bitsmedia.android.*` **غير مشوشة الأسماء** (نادر في التطبيقات التجارية وكنز تحليلي):

| حزمة الميزة | الدور |
|---|---|
| `prayer/` | المواقيت: `prayers/`، `adhan/`، `settings/`، `onboarding/`، `data/` |
| `qibla/` | القبلة (UI + ViewModel) |
| `quran/` | read, sura, juz, audiorecitation, tajweed, khatam, playlist, learn, myquran, myprogress, ayashare, immerse |
| `quransearch/`, `quranmemorization/`, `quranlesson/` | البحث والحفظ والدروس (حزم مستقلة) |
| `community/`, `journal/`, `timelinev2/`, `today/`, `onboardingui/` | اجتماعي ويومي |
| `apimanager/remote/dto/` | نماذج البيانات القادمة من السيرفر (غير مشوشة) |
| `widget/` | **18 ودجت** |
| `com.bitsmedia.libs.prayertimes` | مكتبة KMP: calculator, precalc, settings, calendar, location |

**صفر native `.so`** — كل شيء جافا/Kotlin خالص (حتى فك تشفير الأصول).

---

## 2. جدول المكونات (Components Breakdown) [VERIFIED]

| نوع المكون | العدد | المكونات الرئيسية |
|---|---|---|
| Activities | 250 | اللانشر `.core.activities.SplashActivity` (exported)؛ `QiblaActivity`، `QiblaTroubleShootActivity`، `AdhanSelectorActivity`، `AdhanAlarmPermissionActivity`، `AskAiDeenActivity` |
| Services | 27 | `quran.data.audioplayer.QuranAudioPlayer`، `quran.sura.SuraPlayer`، `dua.screens.DuaPlayer`، `names.utils.NamesPlayer`، `qalboxmobile.playerservice.service.QalboxMediaService` (كلها foreground بنوع mediaPlayback)؛ `core.NotificationCycleService` |
| Receivers | 55 | `core.PrayerTimeNotificationReceiver` (BOOT_COMPLETED, LOCALE_CHANGED, DATE_CHANGED, TIMEZONE_CHANGED, TIME_SET + أحداث ADHAN_*)، `core.AlarmAndRemindersBroadcastReceiver` (يراقب `SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED`)، `core.MPFirebaseMessagingService`، `core.MPFirebaseTokenService` |
| Providers | 11 | FileProvider وموفرو Firebase والتهيئة |
| Widgets | 18 | صلاة (all/current/horizontal/daily trackers)، قرآن (last-read, last-listened, daily-verse, daily-deen, immerse, duas)، tasbih، fasting، names99، qibla، inspiration، qalbox، **AiDeenWidget** |
| Permissions | 29 | موقع دقيق/تقريبي، `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM`، `POST_NOTIFICATIONS`، `USE_FULL_SCREEN_INTENT`، `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`، `FOREGROUND_SERVICE_MEDIA_PLAYBACK`، `CAMERA`، `RECORD_AUDIO`، `SYSTEM_ALERT_WINDOW` |

**علامات حمراء** [VERIFIED]: `usesCleartextTraffic="true"`؛ صنف التطبيق الثاني `com.pairip.application.Application` (**PairIP anti-tamper** — مملوك، لا يُنسخ).

---

## 3. سطح الشبكة [VERIFIED]

| الطبقة | القيمة |
|---|---|
| API الرئيسي | `https://api-mp.muslimpro.com` (مؤكد سطر 75 و168 في `rest_api/network/NetworkModule.smali`) |
| API ثانوي | `https://api-qb.muslimpro.com` (سطر 253 — Qalbox) |
| CDN | `https://download.muslimpro.com` (صوت/صور/ترجمات/أذان) |
| مسارات endpoints | **مموّهة بتشفير سلاسل** (DexGuard-style) — غير مستخرجة حرفياً |
| المصادقة | token عبر api-mp — التفاصيل مموّهة [INFERENCE] |
| الفوترة | Purchasely (`io.purchasely`) |

---

## 4. الأصول المضمنة الكبيرة [VERIFIED]

| الأصل | الحجم/الوصف |
|---|---|
| `assets/quran.sqlite` | 7.2MB — **مشفر بتشفير مخصص** (ليست SQLite حقيقية)، يُفك بجافا خالصة |
| `assets/hisnul_v12.sqlite` | مشفر بالمثل (حصن المسلم) |
| `assets/content/quran_recitations.json` | كتالوج 8 قرّاء (الافتراضي 463MB) |
| `assets/content/adhans.json` | كتالوج 37 أذاناً |
| `assets/content/precalc_sources.json` | فهرس 1,143 مصدر حساب |
| `assets/content/translations.json` | 71 ترجمة |
| `assets/hijri.json` | مشفر — خريطة التاريخ الهجري من السيرفر |
| الخطوط | `uthmanic_hafs.ttf`، `me_quran.otf`، `pdms_saleem_quran_font.ttf`، `scheherazade_reg_ot.ttf`، `noto_naskh_arabic_regular.ttf`، `isep_misbah.ttf`، `droid_sans_arabic.ttf` |
| `res/raw/adhan_madina.mp3` + `adhan_fajr_madina.mp3` | الأذانان المدمجان الوحيدان |

**لا نماذج ML** (لا tflite/onnx) — مثبت بالبحث الشامل.
