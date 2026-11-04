# التحليلات الهندسية المعمقة — Muslim Pro (T3 Engineering Deep Dives)

> **المعرف:** `T3-MP-DEEP-DIVES-001`
> **التطبيق:** Muslim Pro (`muslim-pro`)
> **المنهج:** ثلاثة مسارات — A: محرك الصلاة | B: الأذان والقبلة | C: منصة القرآن

---

## المسار A: المحرك الفلكي على الجهاز

### A1. التصحيح الجوهري [VERIFIED]
التقرير السابق قال "المواقيت محسوبة مسبقاً على السيرفر". **الحقيقة:** الـ precalc **فهرس مصادر حساب** (`PrecalcRegionEntryDto{country_code, precalc_id, source, latitude, longitude, radius}` — 1,143 مدخلاً في `assets/content/precalc_sources.json`)، و**الحساب الفلكي الكامل يتم على الجهاز**.

### A2. تشريح المحرك [VERIFIED]
- `calculator/AstronomicalMathKt.smali` (626 سطراً): `getJulianDate, sunDeclination, equationOfTime, fixAngle, fixHour, dsin/dcos/dtan/dasin/dacos/datan2, dtr, rtd, reduceToHalfDayRange` — نسخة طبق الأصل من مكتبة **batoulapps/adhan**.
- `calculator/Calculator.smali` (3,228 سطراً): `getFajrTime, getIshaTime, getMaghribTime, getZohorTime, getAsrTime, getSunsetTime, getTahajjudTime, getIftarTime, getImsakTime, getAdhanTime, currentPrayer, nextPrayer, previousPrayer, polarResolution, minuteWindow, ownAngleFor, asrAngle, getNightPortion`.
- **22 convention**: MWL (فجر 18/عشاء 17 — مؤكد من الثوابت)، ISNA، Egypt، EgyptBis، Makkah، Karachi، Tehran، Jafari، Diyanet، KEMENAG، MUIS، JAKIM، UOIF، Tunisia، Algeria، Basque، FR15، FR18، AwqafUAE، UIPTL، FixedIsha، Custom.
- `UiptlTablesKt`: جدولا `uiptlFajr/uiptlIsha` (365 مدخلاً لكل يوم).
- هرميات sealed كاملة: Fajr (AngleBased/MinuteBased)، Isha (AngleBased/MaghribDelayBased/SunsetDelayBased)، Maghrib (Sunset/PostSunset)، Asr، HighLatitudeAdjustment، DstSetting، PolarResolution.
- **ملاحظة jadx:** الأجسام ظهرت كـ stubs في jadx لكنها **كاملة في الـ smali** — درس منهجي: smali هو المرجع للـ KMP.

### A3. النموذج الهجين [VERIFIED]
`AutoSettingDto{angleFajr, angleIsha, convention, corrections[], countryCode, dst, hiLat, hijri, imsak, juristic, ramadanIshaDelay, isDefault}` — **السيرفر يدفع إعدادات الحساب لكل دولة، والجهاز يحسب**. أفضل العالمين.

---

## المسار B: الأذان والقبلة والموثوقية

### B1. الأذان كـ Notification.sound [VERIFIED]
- الكتالوج: `AdhanDto{id, type, order, name, filename, checksum, preview_checksum, duration, flag, video_id, free_with_login_countries, is_default, updated_at, legacy_id}` — 37 أذاناً.
- التنزيل: `https://download.muslimpro.com/adhan/` + filename → `Download/Adhans` (`.mp3`).
- **التشغيل:** `PrayerTimeNotificationReceiver.smali` (~سطر 1660): `Notification.sound = uri` مع `AudioAttributes` + بث `PLAYER_ACTION_PAUSE` قبله. **لا MediaPlayer للأذان** — قرار تبسيط واعٍ.
- تفضيلات مستقلة لكل صلاة (`notification_fajr_97003`, `notification_fajr_alarm_97003`...).

### B2. حزمة الموثوقية [VERIFIED]
- `AlarmManager.setExactAndAllowWhileIdle` (سطر 872) + فحص `canScheduleExactAlarms()` (سطر 865).
- إعادة جدولة كاملة عند: `BOOT_COMPLETED, LOCALE_CHANGED, DATE_CHANGED, TIMEZONE_CHANGED, TIME_SET` + أحداث `ADHAN_NOTIFICATION/ADHAN_RESTART/PRE_ADHAN_NOTIFICATION`.
- مراقبة `SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED` — إعادة الجدولة عند سحب الإذن.
- `AdhanAlarmPermissionActivity` — شاشة توعية بالأذونات (نمط UX يُنسخ).

### B3. القبلة [VERIFIED]
- الثوابت: الكعبة `21.4225` / `39.8262`.
- المعادلة (سطور 593-686 في `QiblaViewModel.smali`): `Δlong = 39.8262 − userLong`؛ `y = sin(Δlong)·cos(kaabaLat)`؛ `x = cos(userLat)·sin(kaabaLat) − sin(userLat)·cos(kaabaLat)·cos(Δlong)`؛ `bearing = (toDegrees(atan2(y,x)) + 360) % 360`.
- الحساسات: `TYPE_ACCELEROMETER` (1) + `TYPE_MAGNETIC_FIELD` (2) مع register/unregister في `onCleared`.
- [INFERENCE] دمج الحساسات في كلاس مموّه؛ لا كاميرا/AR ظاهر.

---

## المسار C: منصة القرآن

### C1. حزم الصوت المجزأة [VERIFIED]
- `QuranRecitationDto{s3_path, s3_pathroot, checksums[], timestamps[], sizes[], is_free, is_default}` — مثال: `quran-audio/abdul-basit-abdus-samad.zip` (463MB، 115 checksum).
- **التنزيل مجزأ لكل سورة** مع تحقق سلامة وتحديث تفاضلي — لا إعادة تنزيل كاملة.
- المحرك: `android.media.MediaPlayer` (لا ExoPlayer) في foreground service — 5 خدمات ترث `BaseMediaPlayer`.

### C2. البيانات المشفرة والمزامنة [VERIFIED]
- **لا Room إطلاقاً** — DTOs بمزامنة Firestore (`QuranProgressDto`، `QuranHighlightDto`، `QuranSettingsDto`، `QuranNoteDto`) + محرك `SyncPayload` العام.
- `assets/quran.sqlite` (7.2MB): **مشفر بتشفير مخصص** (ليست SQLite حقيقية) — يُفك بجافا خالصة، لا SQLCipher، لا `.so`.
- الاستراتيجية: أصول مشفرة دون-اتصال + Firestore لحالة المستخدم عبر الأجهزة.

### C3. QUL والختمة والـ RAG [VERIFIED]
- نص المصحف من **QUL (Tarteel) مفتوح المصدر** — مذكور حرفياً في الـ strings.
- الختمة اجتماعية: `NewKhatamRequest`، `ClaimSegmentDto`، `NudgeRequest`، `BadgeModel`/`UserBadge`.
- **AskAbdullah RAG**: `QuranSource(page_content, confidence, sura_id, aya_id, translated_by)` + `HadithSource` + `Feedback` — إجابات موثقة بدرجة ثقة. **هذا هو نمط وكيل الأب في Family OS.**

### C4. الغيابات المثبتة [VERIFIED بالبحث الشامل]
- صفر حساب هجري على الجهاز (`isRamadan()` تُرجع `false`).
- صفر نماذج ML (لا tflite/onnx)، صفر `.so`.
- البحث سيرفر فقط (لا فهرس محلي كامل).
