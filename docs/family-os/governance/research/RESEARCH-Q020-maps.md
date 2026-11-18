# بحث Q-020: مزوّد الخرائط — Google Maps أم بدائل OpenStreetMap؟

**تاريخ البحث:** 2026-11-04
**الحالة:** مكتمل — مع علامات عدم يقين صريحة حيث يلزم
**الأولوية:** B

---

## 1. السؤال

أي مزوّد خرائط نختار لتتبّع الموقع والـ geofencing في Family OS؟ يغطي البحث: جودة تغطية اليمن (Google مقابل OSM)، التسعير عند التوسّع (أسعار Google Maps Platform في 2026، وتكلفة الاستضافة الذاتية لـ OSM)، جدوى الخرائط دون اتصال (offline-first متطلب تصميمي)، وما الذي يعنيه العثور على تنفيذ geofence مخصّص في كود FamiSafe Jr المفكّك لاختيار المزوّد.

---

## 2. النتائج

### 2.1 أسعار Google Maps Platform في 2026 (بعد إصلاح مارس 2025)

- ألغت Google رصيد الـ $200 الشهري الموحّد في 1 مارس 2025 واستبدلته بحدود مجانية **لكل SKU على حدة**: 10,000 طلب/شهر لمنتجات Essentials، و5,000 لـ Pro، و1,000 لـ Enterprise — ولا تُجمَّع الحصص بين المنتجات.
- الأسعار بعد الحد المجاني (أول شريحة حجم، دولار/ألف طلب): Dynamic Maps ‏$7.00، Static Maps ‏$2.00، Geocoding ‏$5.00، Routes ‏$5.00–$6.00، Places Autocomplete ‏$2.83، Place Details ‏$5.00 (Essentials) حتى ‏$32.00 (Advanced).
- أطلقت Google (نوفمبر 2025) خطط اشتراك: Starter ‏$100/شهر (50 ألف حدث)، Essentials ‏$275/شهر (100 ألف)، Pro ‏$1,200/شهر (250 ألف).
- **نقطة حاسمة:** تحميلات الخرائط عبر الـ SDK الأصلي للجوال (Maps SDK for Android/iOS) **غير محدودة ولا تُحاسَب بالاستخدام** في 2026 — لكنها تتطلب مشروع Google Cloud مفعّل الفوترة.
- المصادر:
  - https://www.geoapify.com/is-google-maps-api-free/ (فُحصت الأسعار 22 أكتوبر 2026)
  - https://fluttergo.ai/blog/flutter-maps-2026/ (مقارنة google_maps_flutter مقابل flutter_map، أكتوبر 2026)

### 2.2 جودة تغطية اليمن: Google مقابل OSM

- Google: تغطية كاملة لليمن (طرق، عناوين، POI) بجودة بيانات تجارية — الأفضل في دقة POI والبحث.
- OSM في اليمن: مساهمات قوية من العمل الإنساني (HOT) للطرق والأماكن المأهولة؛ لكن تقييم HDX Data Grids يوصي بمصدر OCHA (وليس HOT/OSM) لمعظم مجموعات بيانات اليمن المكانية، ومن 35 مجموعة HOT موصى بها، 30 مصنّفة "غير مكتملة". خلاصة: **الطرق مقبولة، والـ POI أضعف وبياناته الوصفية غير متسقة.**
- لحالة استخدامنا (لوحة أب تُظهر موقع الطفل + مناطق geofence) خريطة الأساس والطرق تكفيان؛ الـ POI الغني ليس حرجاً.
- المصادر:
  - https://www.hotosm.org/en/news/will-openstreetmap-meet-your-needs-hots-move-towards-more-data-insights/
  - https://www.techsaleratordatashop.com/blogs/news/top-poi-data-vendors-in-yemen-in-2025-mapping-the-heart-of-the-arabian-peninsula

### 2.3 نموذج التكلفة عند التوسّع

| السيناريو | Google (ويب/خادم) | Google (SDK جوال أصلي) | OSM ذاتي الاستضافة |
|---|---|---|---|
| MVP (~1k عائلة) | ضمن الحدود المجانية (10k/SKU) ≈ ‏$0 | ‏$0 | ~‏$10–50/شهر خادم |
| 100k عائلة، 3M تحميل خريطة/شهر | ~‏$21k/شهر ($7/ألف فوق المجاني) | ‏$0 (غير محدود) | ~‏$10–50/شهر خادم |
| Geocoding خادمي مكثّف | $5/ألف — يُخفَّض بالتخزين المؤقت | n/a | Nominatim ذاتي ‏$0 |

- الخلاصة العددية: Google قاتلة التكلفة **فقط** إذا استخدمنا واجهات الويب/الخادم بكثافة؛ عبر الـ SDK الأصلي للجوال التكلفة صفر عملياً. لكن الاعتماد الكامل على Google يربطنا بمنظومة GMS — وهي نفس مشكلة Q-022.
- [ASSUMPTION]: أرقام الاستخدام (30 فتحة خريطة/أب/شهر) تقديرية لغرض النمذجة.

### 2.4 تكلفة الاستضافة الذاتية لـ OSM

- المكدس: TileServer GL أو Martin (خادم بلاطات vector) + Planetiler لتوليد البلاطات + مقتطف Geofabrik الإقليمي (اليمن ملف صغير؛ لا نحتاج planet الكامل الذي يتطلب ~1TB تخزين و24GB RAM).
- التكلفة: خادم VPS واحد (4vCPU/8GB) ‏$10–50/شهر يكفي المكدس كاملاً (بلاطات + Nominatim + OSRM) — مرجع أسعار الاستضافة في RESEARCH-hosting.md.
- MapLibre (الفرع الحر من Mapbox GL): SDK أصلي أندرويد/iOS + دعم Flutter (maplibre_gl)، يعمل مع أي بلاطات vector ذاتية، ويدعم **حزم offline** أصلاً.
- تحذير: بلاطات tile.openstreetmap.org العامة **ممنوعة** للإنتاج (سياسة OSMF تحظر الاستخدام الكثيف) — إما مزوّد مدفوع أو استضافة ذاتية.
- المصادر:
  - https://github.com/hopkdj/openswap-guide/blob/HEAD/content/posts/self-hosted-maps-geocoding-openstreetmap-alternatives-google-maps-guide.md (أبريل 2026)
  - https://claudeskills.info/skills/maplibre/maplibre-agent-skills/maplibre-tile-sources/

### 2.5 الخرائط دون اتصال (offline-first متطلب)

- Google: الدعم محدود — التنزيل المسبق للمناطق عبر الـ SDK للمستخدم فقط، وشروط الاستخدام تقيّد التخزين المؤقت المسبق خارج الاستخدام المباشر [ASSUMPTION — يحتاج مراجعة قانونية لبنود Google Maps Platform TOS قبل البناء].
- MapLibre/Mapbox: تنزيل مناطق offline ميزة من الدرجة الأولى (حتى 250MB افتراضياً في Mapbox؛ غير محدود عملياً في الاستضافة الذاتية) — تناسب متطلب offline-first تماماً، وحزم MBTiles لمحافظات اليمن تُوزَّع مع التطبيق أو عند أول إعداد.
- المصادر:
  - https://www.woosmap.com/en-gb/blog/alternative-to-mapbox (مقارنة 2026: Mapbox الأقوى في offline)
  - https://docs.mapbox.com/android/maps/examples/offline-map/

### 2.6 ماذا يعني تنفيذ الـ geofence المخصّص في FamiSafe Jr؟

- من تفكيك Family OS الداخلي (2026-11-04): كود FamiSafe Jr يحتوي تنفيذ geofence **مخصّصاً** بدل الاعتماد على Google Geofencing API.
- الدلالة المعمارية: تقييم الـ geofence **منطق يعمل على الجهاز** (مقارنة إحداثيات GPS بحدود المناطق)، لا خدمة خادمية من مزوّد الخرائط. Google Geofencing API نفسها تعمل على الجهاز ومجانية — لكنها تتطلب GMS.
- الاستنتاج: **قرار مزوّد الخرائط يؤثر على عرض الخريطة فقط، لا على ميزة الـ geofencing نفسها.** يمكن (ويجب) بناء تقييم الـ geofence على الجهاز بمعزل عن المزوّد — وهذا يفسر خيار FamiSafe: الاستقلال عن GMS (يرتبط مباشرة بسؤال Q-022) + العمل دون اتصال.
- المصدر: نتائج التفكيك الداخلية لمشروع Family OS (تقارير REP-FS-001) — ليس مصدراً عاماً.

---

## 3. التوصية (توصية — ليست قراراً؛ القرار لك)

1. **(أ) الموصى به: مكدس OSM أساسي** — MapLibre SDK (أندرويد أصلي لوكيل الطفل؛ maplibre_gl أو flutter_map للوحة الأب Flutter) + خادم بلاطات vector ذاتي (Martin/TileServer GL) + حزم MBTiles دون اتصال لليمن. الأسباب: تكلفة صفرية عند التوسّع، offline-first حقيقي، يعمل على أجهزة non-GMS (Q-022)، وفصل تام عن قيود Google.
2. **(ب) بديل لاحق لا يُبنى الآن:** مفتاح تبديل مزوّد في لوحة الأب لعرض Google Maps في الأسواق التي يتوقع فيها الأهل "شكل Google" — لكن المعمارية تُبنى provider-agnostic من اليوم (طبقة تجريد خرائط)، حتى لا نُحبس في مزوّد واحد.
3. **بغض النظر عن المزوّد:** تنفيذ تقييم الـ geofence على الجهاز (على غرار FamiSafe Jr) — خدمة أمامية دائمة + LocationManager/FusedLocation، مع مزامنة المناطق من الخادم. هذا إلزامي لدعم non-GMS والعمل دون اتصال.
4. خطوة تحقق قبل البناء: قياس جودة بلاطات OSM لصنعاء/عدن/تعز فعلياً (عرض تجريبي) للتأكد أن مستوى الطرق مقبول للوحة الأب — [ASSUMPTION] أن الطرق الرئيسية مغطاة جيداً.
