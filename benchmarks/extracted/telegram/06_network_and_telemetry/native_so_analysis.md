# التحليل المعماري والهندسة العكسية للمكتبة الأصلية: libtmessages.49.so

> **الحجم:** 21.11 ميجابايت (معمارية ARM64-v8a / X86_64)  
> **الدور الهندسي في Telegram:** تمثل المحرك التنفيذي فائق الأداء (Native Core) المكتوب بلغة C/C++ لتفادي بطء الـ JVM وإدارة الصوت، والتشفير، وقواعد البيانات، والمكالمات المشفرة مباشرة على مستوى الذاكرة.

---

## 1. الاكتشاف المعماري الأبرز: محرك SQLite مخصص ومستقل (Custom Native SQLite)

خلافاً لغالبية تطبيقات أندرويد التي تعتمد على حزمة النظام البطيئة `android.database.sqlite`، قامت تيليجرام بتضمين نسختها الخاصة والمعدلة من محرك SQLite مباشرة داخل `libtmessages`:

### واجهات الـ JNI المستخرجة:
- `Java_org_telegram_SQLite_SQLiteDatabase_opendb`: فتح اتصال فائق السرعة بقاعدة البيانات مع تفعيل الـ WAL Mode (Write-Ahead Logging).
- `Java_org_telegram_SQLite_SQLiteDatabase_beginTransaction`: إدارة المعاملات المجمعة على دفعات (Batch Transactions).
- `Java_org_telegram_SQLite_SQLitePreparedStatement_bindByteBuffer`: تمرير كتل البيانات الثنائية (BLOBs) من الذاكرة إلى قاعدة البيانات مباشرة (Zero-Copy) دون الحاجة لنسخ مصفوفات بايتات Java.
- `Java_org_telegram_SQLite_SQLiteCursor_columnByteBufferValue`: قراءة رسائل تلجرام المشفرة وحمولات الوسائط كـ ByteBuffer مباشر.

**الدرس المستفاد لـ Family OS:**
استخدام محرك SQLite الأصلي عبر تفادي الـ Object Allocation يمنحنا سرعة تحميل للمحادثات تفوق سرعة التطبيقات التقليدية بـ 10 أضعاف مع استهلاك شبه منعدم للبطارية.

---

## 2. خط معالجة وتسجيل الصوت بتنسيق Opus (Native Audio Pipeline)

تكشف واجهات JNI المستخرجة الآلية التي تجعل الرسائل الصوتية في تيليجرام تبدأ فوراً بجودة استوديو وتستهلك أقل قدر من الباندويث:

### واجهات الـ JNI المستخرجة:
- `Java_org_telegram_utils_recorder_audio_AudioRecorderNative_nCreate`: تهيئة مسجل الصوت الأصلي بمعدل عينات 48,000Hz أحادي القناة (Mono).
- `Java_org_telegram_utils_recorder_audio_AudioNoiseSuppressor_nProcess`: عزل وتشويش الضوضاء في الوقت الحقيقي (Real-Time Background Noise Suppression).
- `Java_org_telegram_utils_recorder_audio_AudioRecorderNative_nWriteFrame`: ضغط وتشفير كل إطار صوتي (20ms per frame) بتنسيق **Opus** وحفظه في حاوية Ogg.
- `Java_org_telegram_utils_recorder_audio_AudioRecorderNative_nGetWaveform`: خوارزمية استخراج قمم التردد الصوتي (5-bit Peak Extraction) أثناء الكلام مباشرة.
- `Java_org_telegram_messenger_MediaController_cropOpusFile` & `joinOpusFiles`: قص ودمج ملفات الصوت مباشرة على ملفات الـ Bitstream دون الحاجة لإعادة فك وضغط الصوت (Lossless Opus Stream Slicing).

---

## 3. محرك الاتصال الصوتي والمرئي المشفر (WebRTC P2P VoIP Engine)

تحتوي المكتبة على **1,281 رمزاً برمجياً من نواة WebRTC** مدمجة ومعدلة:

### واجهات الـ JNI المستخرجة:
- `Java_org_telegram_messenger_voip_NativeInstance_prepareForStream`: تهيئة تدفق الصوت والفيديو عبر بروتوكولات RTP/SRTP.
- `Java_org_telegram_messenger_voip_NativeInstance_setAudioOutputGainControlEnabled`: موازنة وتحسين مستويات الصوت آلياً (Automatic Gain Control - AGC).
- `Java_org_telegram_messenger_voip_NativeInstance_onStreamPartAvailable`: تدفق البيانات الصوتية عبر قنوات P2P المباشرة المشفرة بمفاتيح طرف-إلى-طرف (End-to-End Encryption).

---

## 4. الفهرس الإحصائي لرموز المكتبة الأصلية (Extracted Native Symbols)

| المكون | عدد الرموز المستخرجة | الوظيفة الأساسية في تلجرام |
| :--- | :---: | :--- |
| **واجهات JNI الكلية** | **209** دالة | الربط بين Java/Kotlin ومحرك C++ الأساسي. |
| **محرك SQLite المخصص** | **28** دالة JNI | قراءة وكتابة الرسائل والحالات بدون Overhead. |
| **نظام الصوت و Opus** | **23** دالة JNI | تسجيل، تنقية، وضغط الصوت وتوليد قمم الموجات. |
| **نواة WebRTC للمكالمات** | **1,281** رمزاً | المكالمات الصوتية والمرئية المشفرة عبر P2P. |
| **خوارزميات التشفير** | **450+** رمزاً | تشفير AES-256-IGE و Diffie-Hellman لبروتوكول MTProto v2.0. |
