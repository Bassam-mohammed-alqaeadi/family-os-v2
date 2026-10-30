# كتالوج عقود ونقاط نهاية الشبكة (API Endpoints Catalog) — Muslim Pro

> **المرجع الهندسي:** تطبيق Muslim Pro v11.2.9 (`com.bitsmedia.android.muslimpro`)  
> **البوابات المركزية المستكشفة:**
> - `https://api2.muslimpro.com`
> - `https://www.muslimpro.com`
> - `https://maps.googleapis.com`

---

## 1. جدول نقاط النهاية المستخلصة من كود Retrofit المفكك

| # | الطريقة | المسار النسبي / الرابط الكامل | المعاملات (Parameters) | الوظيفة التقنية |
|---|---|---|---|---|
| 1 | `POST` | `settings.json` | `key, platform, language, premium_status, version` | تنزيل إعدادات التطبيق وتكوينات البلد والحملات [REF: `onRewardedVideoCompleted.java` L18] |
| 2 | `POST` | `savedevicesettings` | `FieldMap HashMap<String, String>` | مزامنة إعدادات المستخدم وتفضيلات الأذان مع الخادم [REF: `onRewardedVideoCompleted.java` L23] |
| 3 | `POST` | `hijri.json` | `Header(If-Modified-Since), key` | تنزيل جداول تقويم الأشهر الهجرية وتعديلات رؤية الهلال [REF: `MaxFullscreenAdImpl.java` L16] |
| 4 | `POST` | `precalc.json` | `Header(If-Modified-Since), key, id` | تنزيل جداول المواقيت المسبقة الحساب الصادرة رسمياً عن وزارات الأوقاف [REF: `onAdHidden.java` L16] |
| 5 | `POST` | `didyouknow.json` | `Header(If-Modified-Since), key, platform` | جلب الإلهام الإسلامي اليومي والمعلومات الفقهية [REF: `hasVideoUrl.java` L16] |
| 6 | `POST` | `zakat.json` | `key` | جلب أسعار الذهب والفضة اللحظية وحساب نصاب الزكاة [REF: `setHasShown.java` L15] |
| 7 | `POST` | `https://api2.muslimpro.com/api/v1/quran/get_update_url` | `platform, app_version, quran_version, debug` | جلب روابط تحديث حزم القرآن والتفاسير والتراجم [REF: `onRewardedVideoStarted.java` L22] |
| 8 | `POST` | `locationDetails.json` | `key, location` | جلب تفاصيل المدينة، المنطقة الزمنية، وطريقة الحساب الافتراضية [REF: `setControlState.java` L30] |
| 9 | `POST` | `legacylocation.json` | `key, city_id` | قاعدة بيانات المدن الاحتياطية عند غياب خدمة GPS [REF: `setControlState.java` L35] |
| 10 | `POST` | `nearbySearch` | `key, pagetoken, type, location` | البحث عن المساجد والمطاعم الحلال القريبة [REF: `setControlState.java` L25] |
| 11 | `GET` | `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` | `key, input, language, locationbias` | البحث عن الأماكن الدينية بالاسم عبر Google Places [REF: `setControlState.java` L16] |
| 12 | `GET` | `https://maps.googleapis.com/maps/api/geocode/json` | `key, latlng, language` | التحويل العكسي للإحداثيات الجغرافية إلى اسم مدينة وحي [REF: `collectSignal.java` L12] |
| 13 | `POST` | `logevent` | `FieldMap HashMap<String, String>` | إرسال سجلات النشاط وتتبع التفاعل الداخلي [REF: `getAdUnitId.java` L15] |
| 14 | `POST` | `logcontentv2` | `FieldMap HashMap<String, String>` | تسجيل استهلاك المحتوى والمقاطع الصوتية [REF: `getAdUnitId.java` L20] |
| 15 | `POST` | `polls` | `FieldMap HashMap<String, String>` | استطلاعات الرأي المجتمعية للمستخدمين [REF: `setOnClickListener.java` L19] |

---

## 2. آليات التخزين المؤقت وتوفير الشبكة (Caching & Offline Resiliency)

- **ترويسة `If-Modified-Since`:** تستخدم Muslim Pro ترويسة HTTP القياسية لملفات `settings.json`, `hijri.json`, `precalc.json`, `didyouknow.json`. في حال لم يطرأ أي تعديل من الخادم، يُعاد كود `304 Not Modified`، مما يوفر استهلاك البيانات إلى الصفر.
- **العمل الأوفلاين التام (100% Offline Capability):** كافة مواقيت الصلاة، اتجاه القبلة، التقويم الهجري، نصوص القرآن، وأذكار حصن المسلم تُحسب وتُعرض محلياً من الأصول وقواعد SQLite المدمجة في حال غياب الاتصال تماماً.
