# الاستكشاف الوظيفي وتحليل الفجوات — Muslim Pro (Coverage & Gaps)

> **التطبيق:** Muslim Pro (`muslim-pro`) — `com.bitsmedia.android.muslimpro` v17.11
> **المنهجية:** 42 وظيفة تفصيلية عبر 10 مجالات — مستويات الثقة: **Confirmed Level A** (قُرئ الكود) /
> **Derived Level B** (مستنتجة من البنى) / **Partial** / **Not Found** (مثبت الغياب بالبحث الشامل)

---

## 1. المواقيت والحساب الفلكي (8 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000001 | حساب الفجر/الشروق/الظهر/العصر/المغرب/العشاء فلكياً | A | `calculator/Calculator.smali` — `getFajrTime...getIshaTime` |
| MP-FUN-000002 | 22 طريقة حساب (MWL/ISNA/Egypt/Makkah...) | A | ثوابت الزوايا + `UiptlTablesKt` |
| MP-FUN-000003 | زوايا مخصصة (`ownAngleFor`) | A | `Calculator.smali` — `ownAngleFor` |
| MP-FUN-000004 | معالجة خطوط العرض العليا (`polarResolution`) | A | `Calculator.smali` — `polarResolution` |
| MP-FUN-000005 | أوقات فرعية (تهجد/إمساك/إفطار) | A | `getTahajjudTime, getIftarTime, getImsakTime` |
| MP-FUN-000006 | إعدادات الحساب لكل دولة (Auto) | A | `AutoSettingDto` — السيرفر يدفع، الجهاز يحسب |
| MP-FUN-000007 | فهرس مصادر precalc الإقليمية | A | `PrecalcRegionEntryDto` + `precalc_sources.json` (1,143) |
| MP-FUN-000008 | الصلاة الحالية/التالية/السابقة | A | `currentPrayer, nextPrayer, previousPrayer` |

## 2. الأذان والتنبيهات (7 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000009 | كتالوج 37 مؤذناً قابلاً للتنزيل | A | `AdhanDto` + `assets/content/adhans.json` |
| MP-FUN-000010 | تشغيل الأذان كـ `Notification.sound` | A | `PrayerTimeNotificationReceiver.smali` ~L1660 |
| MP-FUN-000011 | تفضيلات مستقلة لكل صلاة (تنبيه+منبّه) | A | `notification_fajr_97003` وأخواتها |
| MP-FUN-000012 | منبهات دقيقة (`setExactAndAllowWhileIdle`) | A | المجدول المموّه L872 + فحص L865 |
| MP-FUN-000013 | إعادة الجدولة (إقلاع/منطقة/وقت/لغة) | A | مستمعات الـ Receiver الخمسة |
| MP-FUN-000014 | مراقبة سحب إذن المنبهات الدقيقة | A | `AlarmAndRemindersBroadcastReceiver` |
| MP-FUN-000015 | شاشة توعية بالأذونات | A | `AdhanAlarmPermissionActivity` |

## 3. القبلة (3 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000016 | معادلة الـ bearing (دائرة عظمى) | A | `QiblaViewModel.smali` L593-686 |
| MP-FUN-000017 | دمج accelerometer + magnetic field | A | `getDefaultSensor(1)/(2)` + register/unregister |
| MP-FUN-000018 | شاشة معايرة/استكشاف أخطاء | A | `QiblaTroubleShootActivity` |

## 4. التقويم الهجري (2 وظيفة)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000019 | عرض التاريخ الهجري (ملف سيرفر) | A | `mHijrMap` من `hijri.json` |
| MP-FUN-000020 | حساب هجري على الجهاز | **Not Found** | `isRamadan()` تُرجع `false` — مثبت بالـ smali |

## 5. القرآن الصوتي (5 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000021 | حزم صوت مجزأة لكل سورة + تحقق | A | `QuranRecitationDto` + 115 checksum |
| MP-FUN-000022 | 8 قرّاء + 71 ترجمة للتنزيل | A | `quran_recitations.json` + `translations.json` |
| MP-FUN-000023 | تشغيل foreground (MediaPlayer) | A | 5 خدمات ترث `BaseMediaPlayer` |
| MP-FUN-000024 | قوائم تشغيل وتتبع الاستماع | A | `Playlist/PlaylistSura/PlayedSuras` |
| MP-FUN-000025 | مشاركة الآيات (ayashare) | B | حزمة `ayashare/` — لم تُقرأ تفصيلياً |

## 6. الحفظ والتجويد (5 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000026 | تتبع الحفظ لكل آية + مزامنة سحابية | A | `MemoriseStatus` + `MemoriseSyncViewModel` |
| MP-FUN-000027 | تلوين التجويد (8 قواعد) | A | `strings.xml` — القواعد الثمانية |
| MP-FUN-000028 | نص QUL مفتوح المصدر | A | مذكور حرفياً في الـ strings |
| MP-FUN-000029 | الختمة الاجتماعية (مطالبة/تذكير/شارات) | A | `NewKhatamRequest`، `NudgeRequest`، `UserBadge` |
| MP-FUN-000030 | البحث (سيرفر + كاش محلي) | Partial | `SearchFeedbackDto` + `SearchAyaEntity` — لا فهرس محلي كامل |

## 7. المحتوى اليومي (4 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000031 | الأذكار (`dhikrs.json`) | A | أصل مضمن |
| MP-FUN-000032 | أسماء الله الحسنى (99 + timecode) | A | `names99.json` + `NamesPlayer` |
| MP-FUN-000033 | أدعية (`deen_mode_dua.json`) | A | أصل مضمن |
| MP-FUN-000034 | الحج/العمرة والزكاة | B | `hajj_umrah.json`، `zakat.json` — محتوى ثابت |

## 8. الودجت (3 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000035 | 17 ودجت دينية (صلاة/قرآن/تسبيح/صيام/قبلة) | A | `widget.*` — 18 مزوداً |
| MP-FUN-000036 | ودجت ذكاء اصطناعي (`AiDeenWidget`) | A | معلن في الـ Manifest |
| MP-FUN-000037 | تحديث الودجت الدوري | B | `NotificationCycleService` — foreground |

## 9. الذكاء الاصطناعي (2 وظيفة)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000038 | AskAbdullah RAG (مصادر + ثقة) | A | `QuranSource` + `HadithSource` + `Feedback` |
| MP-FUN-000039 | نماذج ML على الجهاز | **Not Found** | صفر tflite/onnx/`.so` — مثبت بالبحث |

## 10. المنصة (6 وظائف)

| # | الوظيفة | المستوى | الدليل |
|---|---|---|---|
| MP-FUN-000040 | مزامنة حالة المستخدم (Firestore) | A | `QuranProgressDto` + `SyncPayload` |
| MP-FUN-000041 | تشفير الأصول المضمنة المخصص | A | `quran.sqlite` المشفر + فك بجافا خالصة |
| MP-FUN-000042 | الفوترة (Purchasely) | A | `io.purchasely` |
| MP-FUN-000043 | إشعارات FCM | A | `MPFirebaseMessagingService` |
| MP-FUN-000044 | مسارات API الدقيقة | B | مموّهة بتشفير سلاسل — تُستخرج ديناميكياً |

---

## ملخص الثقة

| المستوى | العدد |
|---|---|
| Confirmed Level A | 32 |
| Derived Level B | 7 |
| Partial | 1 |
| Not Found | 2 |
| **المجموع** | **42** |

## الفجوات الحرجة للخطة الموحدة
1. **مسارات endpoints الدقيقة** — مموّهة؛ تُستخرج بالتحليل الديناميكي لاحقاً (لا تعطل الاقتباس المعماري).
2. **مفتاح فك تشفير `quran.sqlite`** — مموّه + PairIP؛ QUL المفتوح يغني عنه.
3. **الحساب الهجري على الجهاز** — غير موجود أصلاً؛ يُبنى بخوارزمية Kuwaiti (قرار تصميمي مسجل).
