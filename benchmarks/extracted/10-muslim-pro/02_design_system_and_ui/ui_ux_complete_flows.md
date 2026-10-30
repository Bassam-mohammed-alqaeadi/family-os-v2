# مسارات وتدفقات تجربة المستخدم (UI/UX Complete Flows) — Muslim Pro

> **المرجع الهندسي:** تطبيق Muslim Pro v11.2.9 (`com.bitsmedia.android.muslimpro`)  
> **الهدف:** توثيق تدفقات الشاشات، آلات الحالة التفاعلية، ونقاط القوة والضعف المعمارية لاستلهامها في منصة `Family OS` (المرحلة 2 والمرحلة 5).

---

## 1. شاشة المتابعة الرئيسية وبطاقة الصلاة (Home & Prayer Card Flow)

```mermaid
flowchart TD
    Launch[فتح التطبيق] --> GeoCheck{فحص الموقع الجغرافي}
    GeoCheck -->|GPS متاح ومصرح| CalcEngine[تشغيل محرك الحساب الفلكي On-Device]
    GeoCheck -->|GPS غير متاح| CacheCheck{فحص الموقع المخزن أو المدينة اليدوية}
    CacheCheck -->|يوجد موقع سابق| CalcEngine
    CacheCheck -->|لا يوجد موقع| SelectCity[شاشة اختيار المدينة يدويًا legacylocation.json]
    SelectCity --> CalcEngine

    CalcEngine --> RenderCard[رسم بطاقة الصلاة الحالية والقادمة]
    RenderCard --> CountDown[تحديث عداد الوقت المتبقي كل ثانية]
    RenderCard --> HijriBar[عرض التاريخ الهجري المعتمد مع التعديل]
```

### تفاصيل بطاقة الصلاة الحالية:
- **المؤشر الزمني النشط:** إبراز وقت الصلاة القادمة بلون مميز مع شريط تقدم نسبي (Circular / Linear Progress).
- **العداد التنازلي الدقيق (Countdown Timer):** يعرض الساعات والدقائق والثواني حتى موعد الأذان القادم.
- **التاريخ الهجري المزدوج:** عرض التاريخ الميلادي مع التاريخ الهجري المتزامن فلكياً أو المعدل محلياً.

---

## 2. شاشة مواقيت الصلاة الموسعة والضبط اليدوي (Prayer Times Hub)

تتيح الشاشة الانتقال بين العرض اليومي والشهر الكامل (Calendar / Timetable):
- **محدد طريقة الحساب (Calculation Method Picker):** قائمة بـ 21 طريقة حسابية معتمدة دولياً (أم القرى، رابطة العالم الإسلامي، الهيئة المصرية، كراتشي، ديانت، إلخ).
- **محدد مذهب صلاة العصر (Asr Juristic Method):**
  - القياسي (Standard): الشافعي، المالكي، الحنبلي (طول الظل = 1).
  - الحنفي (Hanafi): طول الظل = 2.
- **تعديل الدقائق اليدوي (Manual Minute Adjustments):**
  - منزلق أو حقل رقمي لكل صلاة من الصلوات الست (الفجر، الشروق، الظهر، العصر، المغرب، العشاء) بمعدل $\pm 30$ دقيقة للتزامن الدقيق مع مسجد الحي.
- **قواعد خطوط العرض العالية (High Latitude Adjustment):**
  - منتصف الليل (Midnight).
  - سبع الليل (One Seventh).
  - الزاوية النسبية (Angle-Based).

---

## 3. تدفق التنبيهات والأذان على شاشة القفل (Azan & Alert Flow)

```mermaid
stateDiagram-v2
    [*] --> Idle: جدولة الإنذار عبر setAlarmClock
    Idle --> Triggered: حلول وقت الصلاة بدقة
    Triggered --> CheckMode: فحص نوع التنبيه المختار
    
    CheckMode --> Silent: صامت (إشعار صامت فقط)
    CheckMode --> Beep: نغمة تنبيه قصيرة (Pre-Adhan / Short Tone)
    CheckMode --> FullAdhan: أذان كامل بصوت المؤذن
    
    FullAdhan --> WakeScreen: الاستيقاظ عبر PowerManager WakeLock
    WakeScreen --> HeadsUp: إشعار عالي الأهمية Heads-Up + شاشة كاملة
    HeadsUp --> Playing: تشغيل ملف الصوت MP3
    Playing --> Dismiss: الضغط على إيقاف أو انتهاء الصوت
    Dismiss --> Reschedule: إعادة جدولة اليوم التالي للصلوات
    Reschedule --> [*]
```

---

## 4. تدفق بوصلة القبلة وحالات المعايرة (Qibla Compass Flow)

```mermaid
flowchart TD
    OpenQibla[فتح شاشة القبلة] --> SensorCheck{فحص توفر الحساسات}
    SensorCheck -->|يتوفر Accelerometer + Magnetometer| ReadSensors[قراءة مصفوفة الدوران وحساب السمت]
    SensorCheck -->|الحساسات مفقودة أو تالفة| MapFallback[التحويل التلقائي لخرائط Google Map]
    
    ReadSensors --> AccuracyCheck{فحص دقة الحساس المغناطيسي}
    AccuracyCheck -->|Accuracy Unreliable أو < 2| ShowCalib[عرض شاشة المعايرة بحركة الرقم 8 GIF]
    AccuracyCheck -->|Accuracy High| SmoothRot[تنعيم حركة الإبرة عبر Low-Pass Filter]
    
    ShowCalib --> Calibrated[تمت المعايرة بنجاح]
    Calibrated --> SmoothRot
    SmoothRot --> Aligned{هل الهاتف موجه للكعبة؟}
    Aligned -->|نعم: زاوية < 3 درجات| VibrateFeedback[اهتزاز Haptic Feedback + توهج أخضر]
    Aligned -->|لا| ContinueGuide[استمرار توجيه المستخدم]
```

---

## 5. تدفق قارئ القرآن الكريم والتلاوة (Quran Reader & Audio Flow)

1. **فهرس السور والأجزاء:** قائمة بالسور الـ 114 مع بيانات التنزيل، الآيات، ومكان النزول (مكية / مدنية).
2. **وضع القراءة (Reading View):**
   - دعم خط الرسم العثماني وخط المصحف الإندونيسي (Kemenag) وخط النقاء (Clean).
   - مفتاح إظهار أحكام التجويد الملونة (Tajweed Rules).
   - تمييز الآيات (Highlights) والملاحظات (Notes) والفواصل المرجعية (Bookmarks).
3. **مشغل التلاوة الصوتي (Audio Recitation Bar):**
   - اختيار القارئ (المجاني: قارئ واحد افتراضي؛ المدفوع: فتح باقي القرّاء).
   - تكرار الآية أو المقطع (A-B Repeat) لحفظ القرآن.
   - التحكم في سرعة الصوت (0.75x, 1.0x, 1.25x, 1.5x).

---

## 6. تدفق حصن المسلم والأذكار اليومية (Hisnul Muslim & Dhikr Flow)

1. **تصنيفات الأذكار:** تبويب الأذكار حسب المناسبة (الصباح والمساء، النوم، الاستيقاظ، الصلاة، السفر، المرض).
2. **شاشة الذكر التفاعلية:**
   - عرض النص العربي مشكولاً بالكامل.
   - النص اللاتيني الصوتي (Transliteration) للناطقين بغير العربية.
   - الترجمة المعتمدة باللغات المختلفة.
   - سند الحديث ومصدر التخريج (Ref).
3. **السبحة الرقمية المدمجة (Digital Tasbih):**
   - عداد لمس على الشاشة بالكامل مع اهتزاز لمسي عند كل تسبيحة وعند إتمام الـ 33 أو الـ 100.

---

## 7. تدفق إشعارات تحسين البطارية للأجهزة الآسيوية (OEM Battery Saver Flow)

1. **الرصد:** عند تأخر الأذان أو عند الإقلاع، يفحص التطبيق اسم المصنع والبرمجيات المثبتة.
2. **الكشف عن مديري الطاقة:**
   - شاومي: `com.miui.securitycenter`
   - هواوي: `com.huawei.systemmanager`
   - سامسونج: `com.samsung.android.lool`
   - أوبو وفيفو: برامج الحماية وإدارة الطاقة المخصصة.
3. **الحوار الإرشادي:** عرض بطاقة واضحة بالصور تشرح للمستخدم كيفية منح إذن التشغيل التلقائي (Autostart) واستثناء التطبيق من تحسين البطارية، مع زر ينقل مباشرة إلى صفحة الإعدادات الأصلية الخاصة بذلك المصنع.
