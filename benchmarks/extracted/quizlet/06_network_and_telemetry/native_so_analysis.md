# التحليل الهندسي والأمني للمكتبات المشتركة الأصلية (Native .so Libraries Analysis)

> **المسار:** `benchmarks/extracted/quizlet/06_network_and_telemetry/native_so_analysis.md`  
> **المعمارية المفحوصة:** `arm64-v8a` (مستخرجة من `config.arm64_v8a.apk`)  
> **حالة الفحص:** تحليل ثنائي كامل للدوال والرموز (Symbol & JNI Analysis)

---

## 1. جدول المكتبات الثنائية الأصلية (Native Binaries Inventory)

| اسم المكتبة (SO Binary) | الحجم (Bytes) | الغرض الهندسي والوظيفة |
|---|---|---|
| `libimage_processing_util_jni.so` | 32,528 | محرك معالجة الصور عالي الأداء وتحويل مساحات الألوان YUV420 إلى Bitmap لدعم مسح المستندات OCR |
| `libapproov.so` | 244,664 | محرك توثيق نزاهة التطبيق (Mobile App Attestation) ومكافحة استخراج التوكنات وتزييف الطلبات |
| `libcomScore.so` | 1,851,024 | مكتبة قياس التلمتري والأداء الأكاديمي وسلوك جلسات المذاكرة |
| `libandroidx.graphics.path.so` | 10,096 | تسريع عمليات دمج المنحنيات ومسارات الرسوم المتجهية في الواجهات |
| `libdatastore_shared_counter.so` | 10,360 | عدادات المزامنة ومشاركة البيانات عالية التزامن (IPC) |
| `libsurface_util_jni.so` | 4,896 | جسر الربط المباشر مع أسطح العرض الرسومية لنظام أندرويد |

---

## 2. تفكيك دوال JNI في مكتبة `libimage_processing_util_jni.so` (The OCR Processing Core)

تتولى هذه المكتبة تحويل الإطارات الخام الملتقطة من كاميرا الهاتف بسرعة فائقة قبل تمريرها لنماذج الذكاء الاصطناعي:

### دوال JNI المستخرجة:
1. `Java_androidx_camera_core_ImageProcessingUtil_nativeConvertAndroid420ToBitmap`:  
   تحويل فوري عالي السرعة من مساحة ألوان الفيديو `YUV_420_888` إلى صورة `Bitmap` (ARGB) دون استهلاك المعالج الرئيسي.
2. `Java_androidx_camera_core_ImageProcessingUtil_nativeRotateYUV`:  
   تدوير مستشعر الصورة بزوايا 90 أو 180 أو 270 درجة على المستوى الثنائي قبل التعرف على النصوص.
3. `Java_androidx_camera_core_ImageProcessingUtil_nativeCopyBetweenByteBufferAndBitmap`:  
   نسخ مباشر من الذاكرة الأصلية (Direct Byte Buffers) دون المرور بطبقة إدارة الذاكرة Garbage Collector لتفادي تذبذب الواجهة (Zero-Copy Transfer).
4. `Java_androidx_camera_core_ImageProcessingUtil_nativeWriteJpegToSurface`:  
   كتابة وضغط صور JPEG مباشرة على سطح الشاشة لإظهار بطاقات المعاينة الفورية.

---

## 3. تحليل أمني لمكتبة `libapproov.so` (Mobile App Attestation)

تستخدم Quizlet مكتبة **Approov** كدرع حماية ضد التعديل والهندسة العكسية:
- **التحقق من بصمة التوقيع (Dynamic Attestation):**  
  تقوم المكتبة بحساب هاش ثنائي للذاكرة الحية وكود الـ DEX للتأكد من عدم تشغيل التطبيق داخل بيئة مراقبة ديناميكية مثل `Frida` أو `Xposed`.
- **توليد توكنات صالحة لوقت قصير (Short-lived JWTs):**  
  توقع المكتبة على كل طلب يذهب لخوادم `api.quizlet.com` عبر هيدر مشفر `Approov-Token`. الطلبات التي لا تحتوي على هذا التوكن تُرفض فورياً بكود `403 Forbidden` لمنع أدوات جمع البيانات غير المصرح بها (Scraping Bots).
