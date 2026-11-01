# خريطة الموارد المعمارية T2 لتطبيق Telegram (T2 Architectural Resource Map)
## الحزمة: BIP-02 — Telegram Full Inventory | المستودع: family-os-v2

> **تاريخ التقرير:** 2026-11-01
> **مستوى الفحص:** T2 — Functional & Architectural Resource Mapping
> **التطبيق المستهدف:** Telegram Messenger (Android)
> **كود التقرير:** `REP-TG-002` | **إجمالي الموارد المسجلة:** 14 مورداً معمارياً

---

## 1. نظرة عامة وتوزيع الفئات التصنيفية

يغطي هذا التقرير الجرد الوظيفي والمعماري للموارد المستخلصة من تطبيق Telegram في المرحلة BIP-02. تم تصنيف الموارد بدقة وفق فئات التصنيف القياسية الـ 22 المعتمدة في ميثاق برنامج BIP، مع تقييم جدارة إعادة الاستخدام (Reusability Assessment) ودرجة الملاءمة الهندسية لنظام «عائلتي (Family OS)».

### توزيع الموارد الـ 14 حسب الفئة التصنيفية:
| الفئة التصنيفية القياسية | عدد الموارد | المعرفات المرتبطة |
|---|---|---|
| **Android Platform Integration** | 2 | `TG-RES-000007`, `TG-RES-000015` |
| **Data Models & Schemas** | 1 | `TG-RES-000008` |
| **Local Storage** | 1 | `TG-RES-000009` |
| **Media Processing** | 2 | `TG-RES-000010`, `TG-RES-000011` |
| **Security & Cryptography** | 2 | `TG-RES-000012`, `TG-RES-000013` |
| **Realtime & Messaging** | 3 | `TG-RES-000014`, `TG-RES-000017`, `TG-RES-000018` |
| **Engines & Services** | 2 | `TG-RES-000016`, `TG-RES-000020` |
| **Icons & Graphics** | 1 | `TG-RES-000019` |

---

## 2. كتالوج الموارد المعمارية بالتفصيل

### 1. TG-RES-000007 — Android Application Manifest & Identity
- **الفئة:** Android Platform Integration
- **العمق التقني:** T1_structural
- **الوصف:** إعلان حزمة التطبيق الرسمية (`org.telegram.messenger.web`)، وتحديد الصلاحيات، ومكونات النظام، ومعالجة الروابط العميقة (Deep Links).
- **تقييم إعادة الاستخدام:** `concept_adaptation` | مسموح به بتفويض المالك | الملاءمة المعمارية: `direct`.

### 2. TG-RES-000008 — SQLite Hybrid Storage Schema (95 Tables)
- **الفئة:** Data Models & Schemas
- **العمق التقني:** T2_functional
- **الوصف:** مخطط قاعدة البيانات العلائقية المحلية SQLite المكون من 95 جدولاً و86 فهرساً، يعتمد المفاتيح المركبة (`mid`, `uid`) ونمط WAL للأداء العالي.
- **بيان وتفسير المطابقة:** "ملف DDL يحتوي على 95 أمر CREATE TABLE و86 أمر CREATE INDEX. ترويسة الملف تعلن 96 جدولاً. لم يتم إثبات سبب الاختلاف، ولذلك يحتفظ التقرير بالتعارض كملاحظة مصدر غير محسومة. يشار إلى أن الفحص المصدري لصنف `MessagesStorage.java` أظهر 96 ظهوراً نصياً لأوامر الإنشاء، تكرر فيها أمر جدول `params` مرتين، وهو تفسير محتمل وليس إثباتاً قاطعاً لمصدر رقم الترويسة."
- **المراجع والأدلة:** `telegram_sqlite_schema.sql`, `sqlite_queries_to_code_mapping.md` | `TG-EVD-000008`, `TG-EVD-000009`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لنظام Drift/Sqlite3 في أنظمة المحادثة والحسابات `S1-08` و `S1-01`.

### 3. TG-RES-000009 — JNI / Native Direct Buffer Deserialization Bridge
- **الفئة:** Local Storage
- **العمق التقني:** T3_engineering
- **الوصف:** جسر JNI للذاكرة المباشرة يلتف حول مؤشرات C++ للبيانات الثنائية (`NativeByteBuffer.wrap`) لقراءة كائنات TL. يثبت الكود المصدري وجود جسر ذاكرة أصلي في طبقة Java، بينما يبقى سلوك النسخ الداخلي في مكتبة C++ ضمن المستوى C غير المحسوم.
- **المراجع والأدلة:** `SQLiteCursor.java`, `SQLitePreparedStatement.java` | `TG-EVD-000010`, `TG-EVD-000011`.
- **تقييم إعادة الاستخدام:** `cleanroom_reimplementation` عبر Dart FFI لتقليل العبء على جامع القمامة.

### 4. TG-RES-000010 — Opus Audio Recording Pipeline with Native Trimming
- **الفئة:** Media Processing
- **العمق التقني:** T3_engineering
- **الوصف:** خط تسجيل الرسائل الصوتية بترميز Opus بتردد 48kHz مع تفويض تشذيب الإطارات الصامتة الأولى لمكتبة C++ الأصلية `AudioRecorderNative.b(...)`. كود Java يقتصر على تمرير مسار الملف وإزاحات الإطارات.
- **المراجع والأدلة:** `AudioRecorderV2Controller.java` | `TG-EVD-000012`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لرسائل الصوت العائلية في `S1-08`.

### 5. TG-RES-000011 — Native Audio Waveform Extraction
- **الفئة:** Media Processing
- **العمق التقني:** T3_engineering
- **الوصف:** استدعاء JNI للتابع الأصلي `getWaveform` في C++ لتوليد بصمة الموجة الصوتية. تفاصيل خوارزمية ضغط العينات وتكميمها إلى 5-بت مستمدة من نموذج المستوى B التحليلي (`audio_waveform_pipeline.kt`).
- **المراجع والأدلة:** `MediaController.java`, `audio_waveform_pipeline.kt` | `TG-EVD-000013`, `TG-EVD-000014`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لعرض المخطط الصوتي التفاعلي في دردشة Family OS.

### 6. TG-RES-000012 — Emoji Key Fingerprint Verification (Calls vs Secret Chats)
- **الفئة:** Security & Cryptography
- **العمق التقني:** T3_engineering
- **الوصف:** التحقق البصري المزدوج من التشفير الطرفي، وتوليد 4 إيموجيات للمكالمات الصوتية والمرئية، و5 إيموجيات للمحادثات السرية بناءً على تجزئة المفتاح المشترك (32 بايت).
- **المراجع والأدلة:** `EncryptionKeyEmojifier.java` | `TG-EVD-000015`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لاعتماد التحقق البصري بـ 4 إيموجيات لمكالمات الأسرة المشفرة في Family OS.

### 7. TG-RES-000013 — Diffie-Hellman Key Exchange & AES-IGE Native Encryption
- **الفئة:** Security & Cryptography
- **العمق التقني:** T3_engineering
- **الوصف:** تبادل المفاتيح ببروتوكول ديفي-هيلمان عبر `BigInteger.modPow`، مع تشفير الكتل بنمط AES-IGE عبر مكتبة C++ مجمعة. طول المعامل (2048-بت) يستند إلى إعدادات خادم المنبع المحفوظة في قاعدة البيانات ومصنف كـ `[PARTIAL-EVIDENCE]`.
- **المراجع والأدلة:** `SecretChatHelper.java`, `Utilities.java` | `TG-EVD-000016`, `TG-EVD-000017`.
- **تقييم إعادة الاستخدام:** `architectural_reference` (مرجع معماري للتدفق، مع تفضيل معيار AES-256-GCM القياسي في Rust/Dart).

### 8. TG-RES-000014 — WebRTC Video & Native Voice Pipeline Integration
- **الفئة:** Realtime & Messaging
- **العمق التقني:** T3_engineering
- **الوصف:** دمج هجين يعتمد مكتبات Google WebRTC الرسمية لعرض مسارات الفيديو، مع محرك `tgVoip` الأصلي لإدارة الصوت وتفعيل خيار كبت الضوضاء (`setNoiseSuppressionEnabled`). لا يثبت الكود خوارزمية بعينها كـ RNNoise، ويبقى تفصيل المعالجة الصوتية ضمن Level C.
- **المراجع والأدلة:** `VoIPService.java`, `NativeInstance.java` | `TG-EVD-000018`, `TG-EVD-000019`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` بالاعتماد على حزمة `flutter_webrtc` في مكالمات النظام العائلي.

### 9. TG-RES-000015 — Android Background Resurrection Sentinel Service
- **الفئة:** Android Platform Integration
- **العمق التقني:** T2_functional
- **الوصف:** خدمة حارسة خفيفة تعمل بنمط `START_STICKY` مع بث إعادة إحياء `org.telegram.start` عند إيقافها. الخدمة تعمل كحارس حياة للنظام ولا تدير مقابس الشبكة مباشرة.
- **المراجع والأدلة:** `NotificationsService.java` | `TG-EVD-000020`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لضمان وصول تنبيهات الطوارئ وسلامة الأطفال في `S1-07`.

### 10. TG-RES-000016 — Central In-Memory Event Dispatcher (NotificationCenter)
- **الفئة:** Engines & Services
- **العمق التقني:** T2_functional
- **الوصف:** ناقل أحداث مركزي متزامن على خيط الواجهة UI Thread لإشعار المراقبين بتغيرات حالة الحسابات والرسائل والشبكة فورياً.
- **المراجع والأدلة:** `NotificationCenter.java` | `TG-EVD-000021`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` بنمط Broadcast Streams في Dart/Flutter.

### 11. TG-RES-000017 — Optimistic Outbox Message Dispatcher
- **الفئة:** Realtime & Messaging
- **العمق التقني:** T3_engineering
- **الوصف:** إدارة صندوق الإرسال المتفائل (Optimistic Insertion) بإدراج الرسالة محلياً فور ضغط المستخدم وتحديث الواجهة بلا تأخير، ثم إدارتها عبر طابور الإرسال الشبكي.
- **المراجع والأدلة:** `SendMessagesHelper.java` | `TG-EVD-000022`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لإلغاء أي تأخير مرئي في تجربة إرسال الرسائل في `S1-08`.

### 12. TG-RES-000018 — MTProto Connection Manager & Datacenter Transport Waterfall
- **الفئة:** Network & API
- **العمق التقني:** T3_engineering
- **الوصف:** مضاعف اتصالات الشبكة متعدد مراكز البيانات (Multi-DC) وإدارة السوكت عبر التوابع المحددة: `native_applyDatacenterAddress` و `applyDatacenterAddress` و `native_sendRequest` و `sendRequest`.
- **المراجع والأدلة:** `ConnectionsManager.java` | `TG-EVD-000023`.
- **تقييم إعادة الاستخدام:** `concept_adaptation` لتجاوز الشبكات المدرسية المقيدة لضمان اتصال أجهزة الأطفال بخادم الأسرة.

### 13. TG-RES-000019 — Standard Vector Navigation Icon Asset
- **الفئة:** Icons & Graphics
- **العمق التقني:** T1_structural
- **الوصف:** أيقونة متجهية SVG قياسية لزر الرجوع متوافقة مع مواصفات التصميم المادي Material Design.
- **المراجع والأدلة:** `abc_ic_ab_back_material.svg` | `TG-EVD-000024`.
- **تقييم إعادة الاستخدام:** `direct_asset_reuse` في حزمة أيقونات Family OS.

### 14. TG-RES-000020 — Multi-DEX Execution Container Topology
- **الفئة:** Engines & Services
- **العمق التقني:** T1_structural
- **الوصف:** بنية حاويات التجميع المتعددة Multi-DEX الموزعة عبر 4 حاويات لتجاوز قيد 64k دالة في بيئة أندرويد (تظهر كـ 8 ملفات مادية على القرص بحجم 56.63 MB بسبب تكرار مجلدي raw و target).
- **المراجع والأدلة:** `classes.dex` | `TG-EVD-000025`.
- **تقييم إعادة الاستخدام:** `architectural_reference` كمرجع لهيكلة الحزم الكبيرة.
