# تقرير تدقيق أصل الأدلة وسلامة الالتزام البرمجي — Quizlet (BIP-06)
# Evidence Provenance & Commit Integrity Audit Report

> **المعرف:** `AUD-BIP06-EVD-001`  
> **المشروع:** عائلتي (Family OS)  
> **البرنامج:** Benchmark Intelligence & Platform Fusion Program (BIP / D-039)  
> **المرحلة المستهدفة:** BIP-06 — جرد التعليم والتحفيز (Quizlet Full Inventory & Learning Engines Discovery)  
> **التطبيق:** Quizlet Android (`com.quizlet.quizletandroid`)  
> **الـ Commit المفحوص:** `be65bd32b23d4c6f0770bf03e8fc1813e7107d87`  
> **نقطة البداية المعتمدة (Base Commit):** `81755ab2d4faa8de169f864a9b1e4118446a87e7`  
> **الفرع:** `feat/benchmark-intelligence-program`  
> **تاريخ التدقيق:** 2026-11-03  
> **القرار النهائي للتدقيق:** **ACCEPTED WITH DOCUMENTED LIMITATIONS**

---

## 1. فحص سلامة الـ Commit ونطاق التغييرات (Commit Integrity & Git Preflight)

تم إجراء التحقق الجنائي الصارم من بنية تاريخ Git ونظافة شجرة العمل دون تنفيذ أي عمليات Push أو Force Push:

| معيار الفحص | القيمة الفعلية المسجلة | المطابقة الحوكمية |
|---|---|---|
| **المستودع المحلي** | `Bassam-mohammed-alqaeadi/family-os-v2` | ✅ مطابق 100% |
| **الفرع الحالي** | `feat/benchmark-intelligence-program` | ✅ مطابق للفرع المعتمد |
| **نقطة البداية المعتمدة** | `81755ab2d4faa8de169f864a9b1e4118446a87e7` | ✅ تم حل SHA المختصر `81755ab` بنجاح |
| **Parent SHA للـ Commit** | `81755ab2d4faa8de169f864a9b1e4118446a87e7` | ✅ مطابق تماماً ومباشرة لنقطة البداية المعتمدة |
| **HEAD المحلي** | `be65bd32b23d4c6f0770bf03e8fc1813e7107d87` | ✅ مسجل ومحفوظ محلياً |
| **HEAD البعيد (Remote Origin)** | `81755ab2d4faa8de169f864a9b1e4118446a87e7` | ✅ متطابق، الفرع المحلي متقدم بـ Commit واحد |
| **نظافة شجرة العمل (Working Tree)** | `Clean (0 uncommitted changes)` | ✅ لا توجد أي تعديلات غير ملتزم بها |
| **نطاق الملفات في الـ Commit** | 13 ملفاً فقط (حزمة `quizlet/` + سجل المراجع + حالة البرنامج + التسليم) | ✅ لا مساس بمجلد `benchmarks/` أو التطبيقات السابقة |

---

## 2. مصفوفة تدقيق أصل الأدلة العشرين (Evidence Provenance Matrix)

تم فحص كافة الأدلة العشرين (`QZ-EVD-000001` إلى `QZ-EVD-000020`) المسجلة في `evidence.json` للتحقق من:
1. الوجود الفيزيائي للملف على القرص ومطابقة الـ SHA-256.
2. وجود السجل في `sources.json`.
3. دقة محدد الموقع `location_ref` وأرقام الأسطر.
4. تحديد **أصل الملف (Provenance)** وتمييز الكود الأصلي عن نماذج إعادة البناء.
5. إعادة تصنيف مستوى الإثبات (**Level A / Level B / Level C**) وفق القاعدة الحاكمة: *"إذا كان الملف إعادة بناء أو نموذجاً أنشأه المحلل، فلا يصنف كدليل Level A على أن تطبيق Quizlet الأصلي ينفذ المنطق نفسه"*.

| معرف الدليل | المصدر الفيزيائي المرتبط | أصل الملف (Provenance) | مستوى الإثبات المعدل | حقيقة ما يثبته الدليل واقعياً |
|---|---|---|---|---|
| `QZ-EVD-000001` | `AndroidManifest.xml#L1-L200` | Original Decompiled APK | **Level A** (`verified_direct`) | يثبت قطيعاً اسم الحزمة، minSdk 32، targetSdk 36، الأذونات الـ 25، والمكونات الـ 147. |
| `QZ-EVD-000002` | `colors.xml#L1-L50` | Extracted APK Resource | **Level A** (`verified_direct`) | يثبت قيم الألوان والرموز المعتمدة (`#4255FF`, `#23B26D`, `#2E3856`). |
| `QZ-EVD-000003` | `spaced_repetition_and_mastery_engine.kt#L58-L112` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت معادلات خوارزمية SM-2 المعدلة كنموذج استخلاصي لـ Family OS؛ كود APK الأصلي يدير التقدم عبر خوادم التعلم. |
| `QZ-EVD-000004` | `adaptive_test_generation_engine.kt#L92-L160` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت هيكلية توليد الاختبارات وتحديد المشتتات بفارق طول النص ومعدل الأخطاء (دون POS tags). |
| `QZ-EVD-000005` | `streaks_and_gamification_engine.kt#L81-L150` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت منطق السلاسل اليومية وتجميدها ومنحنى نمو الـ XP التربيعي $L = \lfloor\sqrt{\text{XP}/100}\rfloor + 1$. |
| `QZ-EVD-000006` | `learning_mastery_tracking_engine.kt#L62-L140` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت نموذج حالات الإتقان الثلاث (Unseen, Still Learning, Mastered) كنموذج نظيف مستوحى من واجهات Quizlet. |
| `QZ-EVD-000007` | `offline_study_sync_engine.kt#L48-L87` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت نموذج تجميع أحداث التعلم وتفضيل الإتقان الأعلى عند تعارض حالات المذاكرة المحلية. |
| `QZ-EVD-000008` | `offline_sync_and_conflict_resolution_engine.kt#L83-L152` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت نموذج حل نزاعات النصوص محلياً (LWW) والتراجع الأسي؛ لا يثبت حل النزاعات على خوادم المنبع. |
| `QZ-EVD-000009` | `smart_grading_and_fuzzy_matching_engine.kt#L48-L123` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت قواعد التطبيع العربي وتحويل التاء المربوطة وتسامح Levenshtein بنسبة $\ge 0.85$ كنموذج تطبيقي لـ Family OS. |
| `QZ-EVD-000010` | `match_game_physics_and_scoring_engine.kt#L58-L150` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت آلة حالات شبكة لعبة المطابقة (12 بلاطة) وعقوبة الخطأ ($+1.0\text{s}$) دون أي فيزياء حركية. |
| `QZ-EVD-000011` | `text_to_speech_and_audio_engine.kt#L37-L96` | Analyst Reconstruction Model | **Level B** (`high_inference`) | يثبت تسلسل خطوات القراءة الصوتية وفترات الصمت البيني وفق نطاقات اليونيكود للنصوص. |
| `QZ-EVD-000012` | `local_db_schema.sql#L8-L62` | Extracted Domain Schema Model | **Level B** (`high_inference`) | يثبت معمارية وتصميم 9 جداول علائقية وفهارس مركبة تمثل كيانات المذاكرة في SQLite/Room. |
| `QZ-EVD-000013` | `api_endpoints_catalog.md#L22-L78` | Extracted API Catalog | **Level B** (`high_inference`) | يثبت 195 نقطة نهاية مستخلصة من واجهات Retrofit؛ يثبت بناء الطلبات من العميل ولا يثبت كود الخادم. |
| `QZ-EVD-000014` | `native_so_analysis.md#L22-L36` | Binary Symbol Inspection | **Level B** (`high_inference`) | يثبت تصدير دوال `nativeConvertAndroid420ToBitmap` في مكتبة الكاميرا الثنائية C++. |
| `QZ-EVD-000015` | `native_so_analysis.md#L38-L44` | Vendor Claim / SDK Integration | **Level C** (`medium_inference` / `PARTIAL-EVIDENCE`) | يثبت تكامل حزمة Approov في OkHttp ووجود المكتبة؛ لا يثبت آليات كشف التلاعب الداخلية أو ضمان سلامة الجهاز. |
| `QZ-EVD-000016` | `realtime_sync_and_gamification_protocol.md#L10-L82` | Protocol Specification | **Level B** (`high_inference`) | يثبت هياكل تأطير رسائل WebSocket لمنافسات الفصول الدراسية وتوزيع لوحة الصدارة. |
| `QZ-EVD-000017` | `api_endpoints_catalog.md#L94-L100` | Extracted API Catalog | **Level B** (`high_inference`) | يثبت نقاط نهاية استرجاع حلول الكتب المدرسية بالـ ISBN والبحث المعجمي. |
| `QZ-EVD-000018` | `permissions_strategy.md#L1-L42` | Architectural Synthesis | **Level B** (`high_inference`) | يثبت استراتيجية طلب الأذونات عند الحاجة فقط وتأجيل الكاميرا لوضع المسح الضوئي. |
| `QZ-EVD-000019` | `offline_sync_and_background_scheduling.md#L1-L80` | Architectural Synthesis | **Level B** (`high_inference`) | يثبت معمارية جدولة مهام WorkManager الدورية وإفراغ طابور المزامنة دون اتصال. |
| `QZ-EVD-000020` | `native_so_analysis.md#L10-L19` | Binary Inspection & Decompiled | **Level B** (`high_inference`) | يثبت وجود مكتبة `libcomScore.so` وحزم تحليلات Snowplow لتتبع التفاعل. |

---

## 3. التدقيق الجنائي لخوارزميات التعلم والادعاءات الهندسية (Critical Algorithm Claims Audit)

### A. خوارزمية التكرار المتباعد (SM-2)
- **الملف المفحوص:** `benchmarks/extracted/quizlet/04_extracted_algorithms/spaced_repetition_and_mastery_engine.kt` (#L58-L112).
- **التحقق من الكود والمعادلات:**
  - معادلة معامل السهولة: $EF' = \max(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)))$.
  - الفواصل الزمنية: $I_1 = 1.0\text{d}, I_2 = 3.0\text{d}, I_n = I_{n-1} \times EF \times 1.2$.
  - معالجة الخطأ ($q < 3$): تصفير التتابع وتعيين الفاصل الزمني إلى $0.1\text{d}$ (ساعتان ونصف).
- **نتيجة التدقيق:** الكود يحتوي بالفعل على هذه المعادلات المنفذة برمجياً؛ ولكن هذا الملف يقع ضمن الحزمة `package com.familyos.education.quizlet.engine` وهو **نموذج استخلاصي وإعادة بناء نظيفة (Cleanroom Model)** تم تصميمه لـ Family OS بناءً على السلوك العام لـ Quizlet. كود APK الأصلي المفكك في `com.quizlet.features.learn` يعتمد على خوادم التعلم السحابية ومؤشرات الإتقان، ولا يحتوي على تصريح حرفي لكود خوارزمية SuperMemo SM-2. تم تصنيف الدليل بدقة كـ **Level B**.

### B. نموذج استبقاء الذاكرة لإبينغهاوس (Ebbinghaus Forgetting Curve)
- **الملف المفحوص:** `spaced_repetition_and_mastery_engine.kt` (#L113-L118).
- **التحقق من الكود والمعادلات:**
  - $R(t) = \exp(-t / S)$ حيث $t$ هو الوقت المنقضي بالأيام، و $S = \max(0.5, \text{intervalDays})$.
- **نتيجة التدقيق:** المعادلة الرياضية مثبتة داخل نموذج إعادة البناء الهندسي، وتوفر أساساً رياضياً متيناً لمحرك التعلم في Family OS، ولكنها لا تمثل كوداً مسحوباً بنصه من APK.

### C. محرك المشتتات الذكية (Smart Distractor Heuristic)
- **الملف المفحوص:** `benchmarks/extracted/quizlet/04_extracted_algorithms/adaptive_test_generation_engine.kt` (#L190-L213).
- **التحقق من الكود والمعادلات:**
  - معادلة المفاضلة: $\text{Score} = |\text{len}_{\text{Candidate}} - \text{len}_{\text{Target}}| - 2 \times \text{Mistakes}_{\text{Candidate}}$.
- **نتيجة التدقيق:** المحرك يعتمد حصرياً على **فارق طول النص وعدد الأخطاء السابقة** لاختيار المشتتات. تم تصحيح الادعاء السابق الذي ذكر استخدام تصنيف أقسام الكلام (POS tags)؛ حيث أثبت التدقيق خلو الكود من أي معالجة لغوية لـ POS tags.

### D. محرك التطبيع اللغوي العربي ومسافة ليفنشتاين (Arabic Normalizer & Levenshtein)
- **الملف المفحوص:** `benchmarks/extracted/quizlet/04_extracted_algorithms/smart_grading_and_fuzzy_matching_engine.kt` (#L60-L140).
- **التحقق من الكود والمعادلات:**
  - تجريد الحركات الثمانية والتطويل (Tatweel).
  - توحيد الهمزات (أ، إ، آ $\rightarrow$ ا)، وتوحيد الياء المقصورة (ى $\rightarrow$ ي).
  - **تحويل التاء المربوطة إلى هاء (ة $\rightarrow$ ه):** وثّق التدقيق هذا التحويل غير المعتاد لغوياً؛ وهو خيار تصميمي عملي في محركات البحث والتصحيح للتسامح مع أخطاء إدخال الطلاب، وتم تثبيته كملاحظة تصميمية دون تعميم صحته اللغوية.
  - معايير Levenshtein: الكلمات $<5$ أحرف (تطابق تام)، $5..9$ أحرف (مسموح بخطأ حرف واحد)، $\ge 10$ أحرف (مسموح بخطأين بشرط similarity $\ge 0.85$).

### E. المزامنة دون اتصال وحل النزاعات (Offline Sync & LWW)
- **الملف المفحوص:** `benchmarks/extracted/quizlet/04_extracted_algorithms/offline_sync_and_conflict_resolution_engine.kt` (#L83-L152).
- **التحقق من الكود والمعادلات:**
  - نصوص البطاقات: الفائز بالختم الزمني الأحدث (Last-Write-Wins).
  - حالة الإتقان: حفظ الرتبة الأعلى (`MASTERED > STILL_LEARNING > UNSEEN`).
  - النجمة: اتحاد منطقي (Logical OR).
  - التراجع الأسي: $\text{Delay} = \min(300, 2 \times 2^{\text{retry}})$.
- **نتيجة التدقيق:** المنطق مثبت بالكامل داخل نموذج المحرك على مستوى العميل؛ ولا يثبت التقرير تفاصيل حل النزاعات على خوادم Quizlet الخلفية نظراً لعدم توفر كود الخادم.

### F. معادلة نمو نقاط الخبرة (XP Progression Formula Audit)
- **الملف المفحوص:** `benchmarks/extracted/quizlet/04_extracted_algorithms/streaks_and_gamification_engine.kt` (#L181-L192).
- **التحقق الحسابي:**
  - دالة المستوى: `calculateLevel(xp) = floor(sqrt(xp / 100)) + 1`.
  - دالة النقاط المطلوبة: `xpRequiredForNextLevel(currentLevel) = (nextLevel - 1)^2 * 100`.
- **نتيجة التدقيق:** المعادلة البرمجية الفعلية هي **دالة تربيعية صريحة (Quadratic)** حيث $\text{XP} = 100 \times (L - 1)^2$. أثبت التدقيق أن الإشارة السابقة في المسودة الشفهية إلى معادلة أسية بمقدار $1.5$ كانت خطأً لفظياً، وأكد أن الكود المكتوب على القرص يطبق الدالة التربيعية الصحيحة $L^2$.

### G. لعبة المطابقة ونفي مصطلح "الفيزياء" (Match Game Mechanics)
- **الملف المفحوص:** `benchmarks/extracted/quizlet/04_extracted_algorithms/match_game_physics_and_scoring_engine.kt` (#L1-L70).
- **نتيجة التدقيق:** أثبت الفحص التفصيلي خلو الكود من أي معادلات فيزيائية (كالجاذبية، الاصطدام، أو المتجهات الحركية). المنطق البرمجي ينحصر في **آلة حالات لشبكة من 12 بلاطة (Tile Grid State Machine)** ومؤقت دقيق وعقوبة زمنية قدرها $+1.0\text{s}$ عند الخطأ. تم تصحيح المسمى رسمياً في كافة السجلات إلى:
  `Match Game State Machine, Tile Grid & Scoring Engine`.

### H. مكتبة Approov وحدود إثبات نزاهة الجهاز (Device Attestation)
- **الملفات المفحوصة:** `AppAttestationInitializer.java` و `native_so_analysis.md` ومكتبة `libapproov.so`.
- **نتيجة التدقيق:**
  - **المثبت كودياً (Level A):** دمج حزمة `io.approov.service.okhttp` وتفعيلها تلقائياً عبر `androidx.startup` وحقن ترويسة `Approov-Token` في طلبات OkHttp.
  - **حدود الإثبات وتصنيف Level C:** الادعاءات القائلة بأن المكتبة الثنائية تفحص الذاكرة وتكشف أدوات Frida/Xposed هي مواصفات صادرة عن الشركة المزودة (Vendor Claims) ولا يمكن إثباتها أو قياس فعاليتها من التحليل الساكن، كما أن وجود الـ SDK لا يثبت نجاح التوثيق في بيئة التشغيل الفعلية. تم تخفيض الدليل `QZ-EVD-000015` إلى **Level C / `PARTIAL-EVIDENCE`**.

---

## 4. تدقيق مصفوفة التغطية الوظيفية (The 85 Functions Audit)

تمت مراجعة الوظائف الـ 85 في `COVERAGE-AND-GAPS.md` والتأكد من وجود كافة المعرفات وتوافقها مع المنهجية:

### توزيع الحالات الخمس المعتمد وتفسيره:
- **المؤكدة قطيعاً (Confirmed — 60 وظيفة):** قدرات واجهة المستخدم والتدفقات المرئية المثبتة بملفات التخطيط XML والأنشطة في المانيفست.
- **المشتقة (Derived — 20 وظيفة):** وظائف مدعومة بنماذج إعادة البناء (Level B) أو عقود الـ REST APIs ومخططات قواعد البيانات.
- **الجزئية (Partial — 5 وظائف):** وظائف ينفذ العميل جزءاً منها ويرسل الباقي إلى خدمات خارجية غير خاضعة للتحليل المباشر:
  1. `QZ-FUN-000033`: تنبيهات السلسلة المعتمدة على خوادم FCM السحابية.
  2. `QZ-FUN-000062`: رفع التسجيلات الصوتية الشخصية لخوادم الوسائط.
  3. `QZ-FUN-000079`: تسجيل الدخول الموحد (Google/Apple SSO).
  4. `QZ-FUN-000082`: حذف الحساب والبيانات التزاماً بـ GDPR على خوادم المنبع.
  5. `QZ-FUN-000084`: فوترة اشتراكات Plus عبر Google Play Billing.
- **غير الموجودة (Not Found — 0 وظيفة):** لم تُسجل أي وظيفة تسويقية وهمية.
- **غير المتاحة (Unavailable — 0 وظيفة):**
  > **تفسير تدقيقي حاسم:** سبب خلو السجل من وظائف `Unavailable` هو أن منهجية الجرد لم تُدرج أي ميزة سحابية نقية في فهرس الوظائف ما لم يكن لها **أثر برمجي ملموس على العميل** (كشاشة، أو نموذج بيانات، أو نقطة نهاية في Retrofit). الميزات التي تعتمد على معالجة سحابية تم تصنيفها كـ `Partial` أو `Derived` مع توثيق حدود العميل بوضوح.

---

## 5. قواعد البيانات وحدود إثبات الـ APIs

1. **جداول قواعد البيانات التسعة:**
   - الجداول التسعة (`study_sets`, `studiable_items`, `card_mastery_states`, `folders`, `folder_sets_cross_ref`, `classes`, `class_members`, `offline_action_queue`, `daily_streaks`) مستخلصة في سكيما DDL نظيفة (`local_db_schema.sql`) تعكس كيانات Room ORM المستخدمة في التطبيق.
   - تم التحقق من أنها جداول أعمال تجارية خاصة بـ Quizlet ومعزولة تماماً عن جداول مكتبات الطرف الثالث (مثل جداول WorkManager أو Firebase).
2. **حدود إثبات الـ APIs:**
   - نقاط النهاية الـ 195 تثبت بناء الطلبات من العميل (`Request Constructed & Sent`).
   - لا يدعي التقرير إثبات العمليات الداخلية لخوادم Quizlet (`Backend Execution`) أو منطق الخادم الداخلي دون دليل مباشر.

---

## 6. تصنيف نتائج التدقيق (Findings Classification)

### النتائج الحرجة المعطلة (P0 Blocking):
- **النتيجة:** `0 (لا توجد موانع حاسمة)`. تاريخ Git ونظافة المستودع وسلامة المخططات محققة 100%.

### النتائج الإلزامية التي تمت معالجتها (P1 Required):
1. **P1-1 (تصنيف أصل الأدلة):** إعادة تصنيف ملفات `04_extracted_algorithms/*.kt` ونماذج DDL من Level A إلى **Level B (High Inference / Reconstruction Models)** لكونها نماذج إعادة بناء نظيفة وليست كوداً خاماً من APK. (تمت المعالجة في `evidence.json`).
2. **P1-2 (تقييد ادعاءات Approov):** تخفيض دليل Approov `QZ-EVD-000015` إلى **Level C (`PARTIAL-EVIDENCE`)**، وقصر الإثبات على تكامل SDK دون ادعاء سلامة الجهاز. (تمت المعالجة في `evidence.json` و `resources.json` و `T3-ENGINEERING-DEEP-DIVES.md`).
3. **P1-3 (تصحيح مصطلح فيزياء لعبة المطابقة):** حذف مصطلح "Physics" واستبداله بـ "Match Game State Machine & Scoring Engine". (تمت المعالجة في `resources.json` و `T2-RESOURCE-MAP.md` و `T3-ENGINEERING-DEEP-DIVES.md` و `README.md`).
4. **P1-4 (تثبيت معادلة الـ XP التربيعية):** إثبات أن كود القرص يطبق بالفعل دالة تربيعية $L^2$ وتصحيح الخطأ اللفظي السابق الذي زعم وجود أس $1.5$. (تم التوثيق الحسابي الدقيق).

### الملاحظات غير المعطلة (P2 Non-blocking):
1. **P2-1 (تحويل التاء المربوطة في التطبيع العربي):** توثيق تحويل `ة` $\rightarrow$ `ه` كخيار تصميمي عملي في النموذج الاستخلاصي للتسامح مع أخطاء الإدخال.

---

## 7. التحقق الآلي والقرار النهائي (Verification & Final Disposition)

- **الفحص الآلي لبرنامج BIP:** اجتازت حزمة Quizlet الفحص المستقل `validate-program.py --app quizlet` بنجاح تام: **صفر أخطاء (0 Errors)**، وتحذير واحد تنظيمي معتمد للمصادر الخام.
- **تنسيق الملفات:** اجتياز `git diff --check` بنجاح تام (Zero whitespace errors).

### القرار الحوكمي الرسمي (Final Disposition):

$$\mathbf{ACCEPTED \ WITH \ DOCUMENTED \ LIMITATIONS}$$

المرحلة **BIP-06 مقفلة ومحققة وموثقة بكامل أدلتها ونماذجها الاستخلاصية**، وهي جاهزة تماماً للاعتماد الحوكمي من مالك المشروع دون الحاجة إلى أي إعادة عمل. يُحظر تنفيذ أي Push أو الانتقال إلى BIP-07 إلا بأمر كتابي صريح من المالك.
