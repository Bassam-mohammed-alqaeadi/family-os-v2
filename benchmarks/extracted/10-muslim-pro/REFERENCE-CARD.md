# بطاقة المرجع المعماري الشامل (REFERENCE-CARD) — Muslim Pro

> **المشروع:** هندسة المنظومة المعيارية لمنصة `Family OS` (عائلتي)  
> **التطبيق المرجعي:** Muslim Pro v11.2.9 (`com.bitsmedia.android.muslimpro` — 27.75 MB)  
> **مسار التفكيك في المستودع:** `benchmarks/10-muslim-pro/`  
> **تاريخ التوثيق:** 2026-10-30  
> **حالة الاعتماد:** 🏆 **مكتمل بنسبة 100% وفق بروتوكول التنقيب الجراحي الصارم (Zero-Omission Exhaustive Benchmark)**  

---

## 1. الطبقات الهندسية الست المستخلصة من المرجع (The Six Architectural Layers)

### الطبقة 1: آلات الحالة وتدفقات الشاشات (State Machines & Screen Flows)
- **آلة حالة بطاقة الصلاة المركزية (Prayer Cycle State Machine):**
  - الحالات: `WAITING_NEXT_PRAYER` (العد التنازلي الحي) ← `PRE_ADHAN_WINDOW` (نافذة الإشعار المسبق 10-15 دقيقة) ← `ADHAN_TRIGGERED` (الأذان النشط والاستيقاظ) ← `PRAYER_TIME_WINDOW` (وقت أداء الصلاة حتى الفريضة التالية) ← `MISSED_OR_PAST`.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setSharedElementEnterTransition.java` L1040-L1080]
  - [REF: `benchmarks/10-muslim-pro/02_design_system_and_ui/ui_ux_complete_flows.md` §1]
- **آلة حالة بوصلة القبلة (Qibla Compass State Machine):**
  - الحالات: `HARDWARE_PROBING` (فحص الحساسات) ← `CALIBRATION_REQUIRED` (دقة غير موثوقة وعرض حركة 8) ← `ACTIVE_TRACKING` (تنعيم الترددات بالمرشح المنخفض) ← `ALIGNED_FEEDBACK` (اهتزاز وتوهج عند مطابقة زاوية الكعبة) ← `MAP_FALLBACK_MODE` (التحويل لمتجه الخريطة عند غياب الحساسات).
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/main/pages/qibla/QiblaFragment.java` L595-L650]
- **آلة حالة تلاوة القرآن وحفظ المقاطع (Quran Audio Player State Machine):**
  - الحالات: `IDLE` ← `BUFFERING_STREAM` ← `PLAYING` ← `PAUSED` ← `A_B_REPEAT` (تكرار الحفظ) ← `DOWNLOADING_OFFLINE` ← `STOPPED`.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/sura/viewmodel/SuraViewModel.java` L125-L160]

---

### الطبقة 2: مخططات البيانات والجداول (Data Schemas & Local Storage)
- **قاعدة بيانات حصن المسلم والأذكار (`hisnul_v3.sqlite`):**
  - مخطط Room رسمي مدمج يضم 3 جداول أساسية:
    1. `hisnul_categories`: تصنيفات الأذكار (الصباح والمساء، الصلاة، السفر، المرض).
    2. `hisnul_chapters`: أبواب الأذكار المفصلة وربطها بالتصنيف عبر مفتاح أجنبي `category_id`.
    3. `hisnul_items`: نصوص الأذكار بالأصل العربي، النطق اللاتيني (`trans`)، الترجمات متعددة اللغات (`ar`, `en`, `ms`, `de`, `fr`, `ru`)، وسند الحديث ومصدر التخريج (`ref`).
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/hisnul/data/db/HisnulDb_Impl.java` L36-L40]
  - [REF: `benchmarks/10-muslim-pro/05_data_models_and_schemas/hisnul_muslim_schema.sql`]
- **قاعدة بيانات القرآن الكريم وعلامات القراءة (`quran.sqlite`):**
  - إدارة السور والآيات، دعم خطوط الرسم المتعددة (العثماني Uthmani، والإندونيسي Kemenag، والنقي Clean)، وجداول المفضلة `user_bookmarks`، والتمييز اللوني `user_highlights`، ومتابعة الورد الأخير `reading_progress`.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/o/handleOnBackPressed.java` L30-L65]
  - [REF: `benchmarks/10-muslim-pro/05_data_models_and_schemas/quran_schema.sql`]

---

### الطبقة 3: هندسة الصلاحيات والخدمات الخلفية (OS Daemons & Alarms)
- **تجاوز إخماد النظام (Doze Mode Bypass):**
  - الاعتماد المعماري الحصري على `AlarmManager.setAlarmClock()` بدلاً من `setExactAndAllowWhileIdle()` لإنذارات الأذان الرئيسية.
  - تعتبر ساعة النظام المنبهة (`AlarmClockInfo`) أعلى أولويات النواة في أندرويد ولا تخضع لقيود Doze أو Standby Buckets.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setSharedElementEnterTransition.java` L1045-L1050]
- **الاستحواذ على الويك لوك لإضاءة الشاشة (WakeLock & Screen Activation):**
  - استخدام المعامل `PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP` (`268435482 = 0x1000001a`) داخل مستقبل الإنذار لإيقاظ الشاشة وعرض التنبيه المرئي والمسموع حتى عند قفل الهاتف.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/PrayerTimeNotificationReceiver.java` L191]
- **مقاومة إعادة التشغيل والتغيرات الزمنية (Boot & Time Resilience):**
  - تسجيل مستقبل البث لـ 5 أحداث نظام حيوية:
    `BOOT_COMPLETED`, `TIME_SET`, `TIMEZONE_CHANGED`, `DATE_CHANGED`, `LOCALE_CHANGED`.
  - تفريغ الكاش وإعادة بناء جدول المنبهات أوتوماتيكياً فور الإقلاع أو تغير المنطقة الزمنية.
  - [REF: `benchmarks/10-muslim-pro/01_architecture_and_manifest/AndroidManifest.xml`]
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/PrayerTimeNotificationReceiver.java` L200-L240]

---

### الطبقة 4: بروتوكولات المزامنة وتوفير البطارية (Sync & Battery Optimization)
- **الكشف عن مديري الطاقة للشركات المصنعة (OEM Battery Saver Interception):**
  - التطبيق يفحص برمجيات الأمان المخصصة (شاومي: `com.miui.securitycenter`، هواوي: `com.huawei.systemmanager`، سامسونج: `com.samsung.android.lool`، أوبو، فيفو) ويعرض نوافذ إرشادية بالصور لنقل المستخدم لصفحة منح الإذن التلقائي (Autostart Whitelist).
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setReturnTransition.java` L770-L800]
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/model/data/BatterySaverObject.java`]
- **كشف الإنذارات المتأخرة (Delayed Alarm Detection):**
  - فحص الفارق الزمني `System.currentTimeMillis() - scheduledPrayerTime`؛ إذا زاد التأخير عن 60 ثانية بسبب قيود البطارية الصارمة، يُعرض تنبيه فوري للمستخدم `show_notification_delayed_alert` يحثه على استثناء التطبيق من تحسين البطارية.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/PrayerTimeNotificationReceiver.java` L268-L280]
- **التخزين المؤقت المشروط للشبكة (HTTP 304 Caching):**
  - جميع طلبات ملفات التكوين (`settings.json`, `hijri.json`, `precalc.json`, `didyouknow.json`) تستخدم ترويسة `If-Modified-Since` لتقليل استهلاك البيانات والبطارية.
  - [REF: `benchmarks/10-muslim-pro/06_network_and_telemetry/api_endpoints_catalog.md`]

---

### الطبقة 5: خوارزميات الذكاء والتلعيب وسلاسل العادات (AI, Habit Streaks & Gamification)
- **سلاسل الورد والتحفيز (Daily Dhikr & Quran Streaks):**
  - متابعة استكمال ورد الأذكار الصباحي والمسائي، وتتبع ختمة القرآن عبر علامات الإنجاز لكل آية (`AyaCheckmark`).
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/quran/AyaCheckmark.java`]
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/duas/myduas/MyDuasListFragment.java`]
- **إشعارات إعادة التفاعل الذكية (Smart Re-engagement Notifications):**
  - جدولة منبهات دورية للمناسبات الإسلامية، وتذكير صلاة الجمعة (`REENGAGEMENT_REMINDER_FRIDAY`)، وتذكير صيام التطوع كالإثنين والخميس والأيام البيض (`FASTING_TRACKER_NOTIFICATION`).
  - [REF: `benchmarks/10-muslim-pro/01_architecture_and_manifest/AndroidManifest.xml`]

---

### الطبقة 6: حلول الحافة والتعافي من الفشل (Edge Cases & Failure Recovery)
- **غياب الموقع الجغرافي أو رفض الصلاحية:**
  - الانتقال التلقائي إلى قاعدة بيانات المدن الاحتياطية المدمجة `legacylocation.json`، مما يسمح للمستخدم باختيار مدينته دون الحاجة لـ GPS.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setControlState.java` L35]
- **تغير وقت الهاتف يدوياً من قِبل المستخدم:**
  - الاستماع لحدث `android.intent.action.TIME_SET`، تفريغ كاش الحسابات الفلكية القديمة، وإعادة جدولة المنبهات فورياً لمنع تكرار أو تفويت الأذان.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/PrayerTimeNotificationReceiver.java` L220-L235]
- **تشويش الحساس المغناطيسي الداخلي:**
  - عند اكتشاف `SENSOR_STATUS_UNRELIABLE` أو دقة منخفضة، يظهر فوراً مشهد متحرك يرشد المستخدم لتدوير الهاتف بحركة الرقم 8، أو التحويل لعرض المتجه على خريطة Google Map.
  - [REF: `benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/main/pages/qibla/QiblaFragment.java` L997-L1040]

---

## 2. ما يخدم أنظمة Family OS ومراحل خارطة الطريق

### أولاً: المرحلة 2 — حزم المحتوى الديني الأساسية (Religious Core Packs)
1. **مواقيت الصلاة والأذان (S2-xx):**
   - اعتماد محرك الحساب الفلكي النظيف [REF: `04_extracted_algorithms/prayer_calculation_engine.kt`] الذي يعمل On-Device 100% دون أي تبعيات خارجية أو خوادم وسيطة.
   - دعم خوارزمية `setAlarmClock` مع الويك لوك لضمان انطلاق الأذان في موعده بدقة ثانية واحدة حتى في أجهزة شاومي وهواوي وسامسونج.
2. **بوصلة القبلة (Qibla Compass):**
   - دمج خوارزمية المتجه الكروي العظيم (Great Circle) إلى الكعبة المشرفة مع مرشح تنعيم التذبذب Low-Pass Filter [REF: `04_extracted_algorithms/qibla_compass_pipeline.kt`].
3. **حصن المسلم والأذكار اليومية:**
   - اعتماد مخطط قاعدة البيانات العلائقية الثلاثي (فئات ← أبواب ← أذكار) من `hisnul_muslim_schema.sql` [REF: `05_data_models_and_schemas/hisnul_muslim_schema.sql`].

---

### ثانياً: المرحلة 5 — منظومة القرآن الكريم المتقدمة (Advanced Quran Experience)
1. **دعم خطوط المصحف المتعددة:**
   - دعم الرسم العثماني القياسي والمصحف الإندونيسي والرسم الإملائي النقي للبحث السريع [REF: `05_data_models_and_schemas/quran_schema.sql`].
2. **محرك تكرار الآيات والمقاطع للحفظ (A-B Repeat Engine):**
   - الاستفادة من آلة حالة المشغل الصوتي لدعم مهارات الحفظ والتسميع لدى الأبناء [REF: `04_extracted_algorithms/prayer_calculation_engine.kt`].
3. **أحكام التجويد الملونة:**
   - تمكين مفتاح التجويد البصري لتسهيل القراءة السليمة للأطفال والناشئة.

---

### ثالثاً: تأثير ملفات الدول (D-031) — الخليج واليمن
تطبيق القرار المعماري D-031 يقتضي فصل البيانات المعتمدة لكل دولة في ملف تكوين مستقل:
- **المملكة العربية السعودية واليمن:**
  - طريقة الحساب الافتراضية: `MAKKAH_UMM_AL_QURA` (زاوية الفجر 18.5°، العشاء فاصل 90 دقيقة بعد المغرب، ويتوسع إلى 120 دقيقة خلال شهر رمضان المبارك تلقائياً).
  - التقويم الهجري: مرجع تقويم أم القرى هو الأساس (Offset = 0).
- **دولة الإمارات العربية المتحدة:**
  - طريقة الحساب: `AWQAF_UAE` (الهيئة العامة للشؤون الإسلامية والأوقاف).
- **سلطنة عمان:**
  - تطبيق تعديل الهجري الخاص بها (Offset = -1 يوم غالباً) لاعتمادها الرؤية البصرية المحلية المستقلة.
- **قطر والكويت والبحرين:**
  - طريقة الحساب: أم القرى أو الحساب الخليجي الموحد.

---

### رابعاً: معايير جهاز الطفل (Child Device Experience)
- **الأذان على جهاز الطفل:**
  - دعم خيار "الأذان الهادئ" أو التنبيه اللطيف لعدم إفزاع الطفل أثناء نومه، مع مراعاة وضع ساعات الدوام المدرسي (Mute during school mode).
- **منع استخدام الصلاة كأداة عقابية (Strict Ethical Guardrail):**
  - **قاعدة صلبة في Family OS:** يُمنع منعاً باتاً برمجة قفل الهاتف أو سحب الامتيازات كعقاب تلقائي لعدم أداء الصلاة. التنشئة الدينية تقوم على التحفيز الإيجابي (كسب نقاط عملة العائلة `family_coin` عند إتمام الورد أو الصلاة في وقتها)، وليس على القمع التقني الذي يولد النفور.
- **التنبيهات المنزلية التزامنية:**
  - إطلاق تنبيه أذان عائلي موحد عبر سماعات وأجهزة المنزل عند حلول وقت الصلاة لجمع الأسرة.

---

## 3. أسئلة قرارية مفتوحة لمالك المشروع (Open Decision Questions)

> [!IMPORTANT]
> **ملاحظة حوكمية:** وفق بروتوكول الجلسة (§4) وقواعد قفل النطاق، لا نقترح ولا نعتمد أي قرارات في `/spec` بشكل فردي. هذه الأسئلة معروضة هنا لتوجيه المالك للبت فيها لاحقاً بأمر صريح:

1. **مصدر تسجيلات الأذان والتلاوات:**
   - تطبيق Muslim Pro يمتلك حقوق بعض التسجيلات ويستخدم أخرى مجانية. هل نعتمد في `Family OS` حزم تسجيلات مفتوحة المصدر (مثل مصادر EveryAyah.com و Quran.com ذات التراخيص الحرة ومرخصة CC-BY-SA)، أم نسجل أصوات أذان حصرية للمنصة؟
2. **إلزامية تحفيز الصلاة بعملة العائلة (`family_coin`):**
   - هل يُعتمد تسجيل صلاة الطفل ذاتياً عبر الضغط على "صليت"، أم يُربط بموافقة الوالد أو استشعار التواجد في المنزل/المسجد، وما هو الوزن التحفيزي المقترح من النقاط؟
3. **تزامن تعديل التاريخ الهجري بين أفراد الأسرة:**
   - عند قيام الأب بتعديل التاريخ الهجري بمقدار (+1 أو -1 يوم) عبر ملف الدولة أو الإعدادات اليدوية، هل يُعمم التعديل لحظياً على كافة أجهزة الأسرة عبر خادم المزامنة؟
