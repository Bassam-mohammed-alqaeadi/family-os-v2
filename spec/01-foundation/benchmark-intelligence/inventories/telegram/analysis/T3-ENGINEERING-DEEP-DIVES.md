# التحليل الهندسي الجراحي T3 لتطبيق Telegram (T3 Engineering Deep Dives)
## الحزمة: BIP-02 — Telegram Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-01
> **مستوى الفحص:** T3 — Surgical Engineering & Engine Decomposition
> **التطبيق المستهدف:** Telegram Messenger (Android)
> **كود التقرير:** `REP-TG-002`

---

## 1. منهجية التحقيق ومستويات الإثبات المعتمدة (Provenance Governance)

التزاماً بتوجيهات مالك المشروع وقواعد D-039، صُنفت كافة المعطيات الفنية في هذا التحليل بدقة وفق المستويات التالية:
- **المستوى A (Original Ground Truth):** الكود المصدري المفكك لتيليجرام من ملفات APK الرسمية، واستدعاءات JNI، وتوقيعات C++، ومخططات DDL الفعلية.
- **المستوى B (Derived Engineering Models):** النماذج التحليلية المستخلصة وخوارزميات إعادة البناء في `04_extracted_algorithms/*.kt` (بحزم `org.familyos.*`).
- **المستوى C (Architectural Hypotheses & Inferences):** الاستنتاجات المعمارية التي لم يُعثر على كود منبعها المباشر نظراً لوجودها داخل مكتبات ثنائية مجمعة مغلقة (`.so`)، وتوسم صراحة بـ `[PARTIAL-EVIDENCE]` أو `[PENDING-REF]`.

---

## 2. المحاور الهندسية والمحركات المفحوصة بالتفصيل

### 2.1. المحور الأول: جسر فك تسلسل الذاكرة المباشر (JNI / Native Direct Buffer Bridge)
- **مستوى الإثبات:** **Level A (Direct Ground Truth)** لجسر Java/JNI، و **Level C** لعدم النسخ الداخلي في C++.
- **المصدر المفحوص:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/SQLite/SQLiteCursor.java` (الأسطر #L29-L35).
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/SQLite/SQLitePreparedStatement.java` (الأسطر #L27-L32).
- **التشريح الهندسي:**
  - يتجاوز Telegram محول `android.database.Cursor` القياسي الذي ينسخ البيانات إلى `CursorWindow` في ذاكرة JVM المشتركة.
  - بدلاً من ذلك، يستخدم مؤشر C++ أصلي مباشرة:
    ```java
    public NativeByteBuffer byteBufferValue(int i10) {
        long jColumnByteBufferValue = columnByteBufferValue(this.preparedStatement.getStatementHandle(), i10);
        if (jColumnByteBufferValue != 0) {
            return NativeByteBuffer.wrap(jColumnByteBufferValue);
        }
        return null;
    }
    ```
  - الدالة الأصلية `columnByteBufferValue` تستدعي `sqlite3_column_blob` في C++، وتعيد عنوان المؤشر المادي (`long`) الذي يتم لفه في `NativeByteBuffer` في طبقة Java.
  - **حدود الدليل والأمانة العلمية:** يثبت الكود المصدري وجود جسر ذاكرة أصلي (Native Buffer Bridge) على مستوى Java/JNI يتفادى إنشاء مصفوفة `byte[]` جديدة في الـ JVM Heap؛ ولكن لا يمكن الجزم قطعياً بأن طبقة C++ في `libtmessages.so` لا تجري أي نسخ داخلي للذاكرة قبل إرجاع المؤشر (Zero-Copy absolute verification)، لذا يُصنف عدم النسخ الداخلي كاستنتاج Level C غير مثبت من المصدر الثنائي.

---

### 2.2. المحور الثاني: محرك تخزين SQLite والمطابقة الهندسية (SQLite Storage Engine)
- **مستوى الإثبات:** **Level A (Direct Ground Truth)**
- **المصادر المفحوصة:**
  - `benchmarks/extracted/telegram/05_data_models_and_schemas/telegram_sqlite_schema.sql` (1046 سطراً).
  - `benchmarks/extracted/telegram/05_data_models_and_schemas/sqlite_queries_to_code_mapping.md` (57 سطراً).
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/MessagesStorage.java` (الأسطر #L1931-L1978 و #L27695).
- **التدقيق الرقمي والمطابقة:**
  - عدد أوامر `CREATE TABLE`: **95 أمراً**.
  - عدد أسماء الجداول الفريدة: **95 جدولاً**.
  - عدد أوامر `CREATE INDEX`: **86 أمراً**.
  - عدد أسماء الفهارس الفريدة: **86 فهرساً**.
- **بيان وتفسير المطابقة:**
  "ملف DDL يحتوي على 95 أمر CREATE TABLE و86 أمر CREATE INDEX. ترويسة الملف تعلن 96 جدولاً. لم يتم إثبات سبب الاختلاف، ولذلك يحتفظ التقرير بالتعارض كملاحظة مصدر غير محسومة."
  - يشار إلى أن الفحص المصدري لصنف `MessagesStorage.java` أظهر 96 ظهوراً نصياً لأوامر الإنشاء، تكرر فيها أمر إنشاء جدول `params` مرتين:
    1. السطر #L1944: `CREATE TABLE params(...)` ضمن دالة إنشاء الجداول الأساسية.
    2. السطر #L27695: `CREATE TABLE IF NOT EXISTS params(...)` ضمن دالة الإصلاح والترقية.
  - هذا التكرار النصي في كود المنبع يمثل تفسيراً محتملاً لسبب ذكر الرقم 96 في الترويسات مع بقاء عدد الجداول الفريدة المنشأة عند 95 جدولاً، ولكنه ليس إثباتاً قاطعاً لمصدر رقم الترويسة.
- **التشريح المعماري:**
  - الاعتماد على جدول `messages_v2` بنمط المفتاح المركب `PRIMARY KEY(mid, uid)` الذي يدمج معرف الرسالة ومعرف الدردشة/المستخدم، مما يتيح استعلامات النطاق السريعة لمحادثات متعددة دون تجزئة الجداول.
  - استخدام نمط WAL (Write-Ahead Logging) لتمكين القراءة المتزامنة أثناء عمليات الإدراج الكثيفة في الخلفية.

---

### 2.3. المحور الثالث: خط أنابيب تسجيل الصوت وتفويض C++ (Opus Audio Pipeline)
- **مستوى الإثبات:** **Level A (Direct Ground Truth)** لربط واستدعاء JNI، و **Level C** لتنفيذ الترميز في الثنائيات.
- **المصدر المفحوص:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/AudioRecorderV2Controller.java` (الأسطر #L320-L330).
- **التشريح الهندسي:**
  - يتم تفويض المعالجة الصوتية إلى C++ الأصلي عبر:
    ```java
    boolean zB = AudioRecorderNative.b(file.getAbsolutePath(), fileF.getAbsolutePath(), j14, j15);
    if (!zB) throw new IllegalStateException("Unable to trim Opus prefix");
    ```
  - **حدود الدليل والأمانة العلمية:** يقتصر دور صنف Java على التقاط إشارات التحكم وتمرير مسار الملف وعينات البداية والنهاية (`j14`, `j15`). أما خوارزميات ترميز Opus وقص الإطارات الصامتة فهي مدمجة بالكامل داخل المكتبة المجمعة `libtmessages.so` ولم يتم فحص شفرتها المصدرية مباشرة، وبالتالي تظل تفاصيل خوارزميات الترميز ضمن المستوى C.

---

### 2.4. المحور الرابع: استخراج المخطط الموجي للصوت (Native Audio Waveform Extraction)
- **مستوى الإثبات:** **مزدوج — Level A (الكود الأصلي) + Level B (النموذج التحليلي المشتق)**
- **المصادر المفحوصة:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/MediaController.java` (الأسطر #L3514 و #L9448) — **Level A**.
  - `benchmarks/extracted/telegram/04_extracted_algorithms/audio_waveform_pipeline.kt` (الأسطر #L1-L126) — **Level B**.
- **التشريح الهندسي:**
  - في الكود الأصلي (Level A)، توجد دالة JNI أصلية مباشرة:
    ```java
    public static native byte[] getWaveform(String str);
    ```
  - **حدود الدليل والأمانة العلمية:** دالة Java لا تحتوي على أي منطق حسابي؛ المنطق الحسابي لاستخراج القمم وتكميمها يقع داخل ثنائيات C++. ملف `audio_waveform_pipeline.kt` هو نموذج هندسي تحليلي مشتق (Level B) اقترحه فريق التحليل لمحاكاة خوارزمية ضغط العينات (100 عينة معيارية، 5 بت للقمة)، ولا يمثل إثباتاً مباشراً لكود المصدر الداخلي لـ Telegram.

---

### 2.5. المحور الخامس: التحقق التشفيري المزدوج بالرموز التعبيرية (Emoji Key Fingerprint Verification)
- **مستوى الإثبات:** **Level A (Direct Ground Truth)**
- **المصدر المفحوص:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/voip/EncryptionKeyEmojifier.java` (الأسطر #L5-L36).
- **التشريح الهندسي:**
  - أثبت الفحص البرمجي وجود نمطين مختلفين بوضوح داخل نفس الصنف:
    1. **المحادثات السرية (Secret Chats):** توليد **5 إيموجيات** (الأسطر #L17-L27):
       ```java
       public static String[] emojify(byte[] bArr) {
           ...
           return new String[5];
       }
       ```
    2. **المكالمات الصوتية والمرئية (VoIP Calls):** توليد **4 إيموجيات** (الأسطر #L29-L36):
       ```java
       public static String[] emojifyForCall(byte[] bArr) {
           ...
           return new String[4];
       }
       ```
  - يتم أخذ SHA-256 للمفتاح المشترك (32 بايت)، ثم استخدام أول بايتات كفهارس في جدول إيموجيات محدد مسبقاً، مما يتيح مطابقة بصرية سريعة بين المستخدمين.

---

### 2.6. المحور السادس: تبادل المفاتيح وتشفير AES-IGE المتماثل (DH & AES-IGE Encryption)
- **مستوى الإثبات:** **Level A** لحسابات `modPow` وربط `aesIgeEncryption`، و **[PARTIAL-EVIDENCE]** لحجم المعامل 2048-بت.
- **المصادر المفحوصة:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/SecretChatHelper.java` (الأسطر #L327 و #L340).
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/Utilities.java` (الأسطر #L190-L205).
- **التشريح الهندسي:**
  - يعتمد تبادل المفاتيح على ديفي-هيلمان باستخدام حساب الرفع في جافا:
    ```java
    BigInteger bigIntegerModPow = BigInteger.valueOf(getMessagesStorage().getSecretG()).modPow(new BigInteger(1, bArr), bigInteger);
    byte[] byteArray2 = bigInteger2.modPow(new BigInteger(1, bArr2), bigInteger).toByteArray();
    ```
  - يتم التشفير المتماثل للكتل عبر نمط AES-IGE في مكتبة C++ مجمعة عبر JNI:
    ```java
    private static native void aesIgeEncryption(ByteBuffer byteBuffer, byte[] bArr, byte[] bArr2, boolean z10, int i10, int i11);
    ```
  - **حدود الدليل والأمانة العلمية:** يثبت الكود المصدري استخدام `BigInteger.modPow` لتبادل المفاتيح. ومع ذلك، فإن حجم المعامل الأولي (الادعاء بأنه 2048-بت) يستند إلى المعاملات المخزنة في قاعدة البيانات والقادمة من الخادم السحابي (`getSecretPBytes`)، ولا يمكن إثبات ثباته عند 2048-بت من كود Java المجرد وحده، ولذلك يُصنف حجم المعامل كـ `[PARTIAL-EVIDENCE]`.

---

### 2.7. المحور السابع: معمارية المكالمات الهجينة (WebRTC & Native VoIP Engine)
- **مستوى الإثبات:** **Level A** لاستيراد WebRTC وربط JNI، و **Level C** لآليات معالجة الصوت وكبت الضجيج.
- **المصادر المفحوصة:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/voip/VoIPService.java` (الأسطر #L150-L160).
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/voip/NativeInstance.java` (الأسطر #L260-L268).
- **التشريح الهندسي:**
  - يدير صنف `VoIPService` خطين متوازيين:
    1. مسار الفيديو: استيراد مكتبات Google WebRTC الرسمية (`org.webrtc.VideoFrame`, `MediaStreamTrack`, `VideoSink`).
    2. مسار الصوت: يعتمد محرك `tgVoip` عبر أصناف C++ الأصلية `NativeInstance`:
       ```java
       public native void setAudioOutputGainControlEnabled(boolean z10);
       public native void setNoiseSuppressionEnabled(boolean z10);
       ```
  - **حدود الدليل والأمانة العلمية:** وجود الدالة `setNoiseSuppressionEnabled(boolean)` يثبت وجود راية تحكم JNI لكبت الضجيج؛ لكنه **لا يثبت** استخدام مكتبة RNNoise أو WebRTC APM بالتحديد. تفاصيل خوارزمية كبت الضوضاء مدمجة في الثنائيات وتظل فرضية معمارية ضمن المستوى C `[PARTIAL-EVIDENCE]`.

---

### 2.8. المحور الثامن: خدمة التنبيهات ونظام مراكز البيانات (Notifications vs ConnectionsManager)
- **مستوى الإثبات:** **Level A (Direct Ground Truth)**
- **المصادر المفحوصة:**
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/messenger/NotificationsService.java` (الأسطر #L15-L35).
  - `benchmarks/extracted/telegram/03_decompiled_src/sources/org/telegram/tgnet/ConnectionsManager.java` (الأسطر #L1082, #L1130, #L1132, #L1344, #L1455-L1457, #L1686, #L1689-L1830).
- **التشريح الهندسي والتمييز الوظيفي الدقيق:**
  1. **خدمة `NotificationsService`:**
     - خدمة أندرويد خفيفة تعمل بنمط `START_STICKY` (#L20)، وترسل بثاً عند تدميرها (`sendBroadcast(new Intent("org.telegram.start"))` #L27).
     - **حدود الدليل:** الخدمة بحد ذاتها **لا تدير مقابس الشبكة (Sockets)** ولا تنفذ بروتوكول اتصال، بل تعمل حصراً كـ Sentinel Process لحماية العملية من القتل من قبل نظام أندرويد.
  2. **إدارة الشبكة ومراكز البيانات في `ConnectionsManager`:**
     - إدارة السوكت ومراكز البيانات تتم بالكامل عبر دوال محددة في `ConnectionsManager.java`:
       - `native_applyDatacenterAddress` (السطر #L1082) والتابع `applyDatacenterAddress` (الأسطر #L1455-L1457).
       - `native_sendRequest` (السطر #L1132 والسطر #L1344) والتوابع المتعددة لـ `sendRequest` (الأسطر #L1689-L1830).
       - استئناف الشبكة عبر `native_resumeNetwork` (السطر #L1130 والسطر #L1686).
