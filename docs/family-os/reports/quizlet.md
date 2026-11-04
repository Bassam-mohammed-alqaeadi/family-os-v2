# تقرير الهندسة العكسية — Quizlet

## 1. نظرة عامة
- **الحزمة:** `com.quizlet.quizletandroid`
- **الدور في Family OS:** نواة وحدة **التعليم** — البطاقات التعليمية، أوضاع المذاكرة المتعددة، التكرار المتباعد (SRS)، التعلم باللعب، والعمل دون اتصال.
- **حجم المخرجات:** ~23 ألف ملف Java في `jadx-out`، و`apktool-out` كامل. نقطة الدخول: `com.quizlet.quizletandroid.QuizletApplication` والنشاط الجذري `com.quizlet.quizletandroid.ui.RootActivity`.
- **التشويش:** R8 **ثقيل** — معظم منطق المذاكرة في كلاسات أحادية الحرف (`a.java`، `b.java`...) داخل `features/` و`oldlearn/`؛ 213 خطأ jadx (0.9%). المقروء: الواجهات، النماذج، البنية العليا، ونظام الأحداث.

## 2. البنية المعمارية (أهم الحزم والطبقات)
- `com.quizlet.features.*` — **ميزة لكل مجلد** (feature-per-module): `flashcards/`، `learn/`، `match/`، `practicetest/`، `setpage/`، `folders/`، `classes/`، `podcasts/`، `notes/`، `aicoach/`، `createset/`، `termlist/`، `settings/`.
- `com.quizlet.data/` — طبقة البيانات بنمط Clean: `repository/`، `interactor/` (حالات الاستخدام)، `model/`، `token/`، `connectivity/`، `exceptions/`.
- `com.quizlet.api/` — عميل الشبكة: `IQuizletApiClient`، `ModelEndpoints`، `IHttpErrorManager`، `HttpStatusRangeConstants`، `cookie/`، `error/`.
- `com.quizlet.db/` — التخزين المحلي.
- `com.quizlet.offline/` — `data/` و`managers/` (مزامنة عدم الاتصال).
- `com.quizlet.eventlogger/` — تتبع الأحداث: `features/srs/`، `features/studymodes/`.
- `com.quizlet.oldlearn/` — محرك التعلم القديم (`usecase/`، `viewmodel/`، `checkpoint/`، `data/`) — مشوش شبه كامل.
- `com.quizlet.features.aicoach/` — مساعد ذكاء اصطناعي (`data/`، `ui/`، `viewmodel/`، `manager/`) — يتقاطع مباشرة مع طبقة AI في Family OS.

## 3. الميزات الرئيسية وربطها بوحدات Family OS
| الميزة في Quizlet | الدليل | وحدة Family OS |
|---|---|---|
| 12 وضع مذاكرة | `StudyModeUrlFragment`: `flashcards`، `learn`، `match`، `test`، `write`، `scatter`، `microscatter`، `blast`، `blocks`، `cards`، `classic-cards`، `spaced-repetition` | التعليم — كل الأوضاع |
| التكرار المتباعد SRS | `x4.SPACED_REPETITION` + `SrsEventLogger` + `SrsEventLog` | التعليم — خوارزمية الحفظ |
| لعبة المطابقة | `features/match/` (`studyengine/`، `highscore/`، `managers/`) | التعليم — التعلم باللعب للأطفال |
| نقاط التعلم والإنجازات | `features/learn/checkpoint/`، `features/achievements/`، `features/match/highscore/` | التعليم — التحفيز |
| التشغيل التلقائي والصوت | `FlashcardsAutoplayService`، `AudioRecordingService`، `PodcastMediaSessionService` | التعليم — صوتيات |
| مساعد AI | `features/aicoach/` | طبقة AI — وكيل التعليم |
| العمل دون إنترنت | `offline/managers/` | التعليم — مناطق ضعيفة الشبكة |

## 4. الخوارزميات والطرق المهمة القابلة لإعادة الاستخدام
- `com.quizlet.eventlogger.features.srs.SrsEventLogger` — **إثبات نظام SRS**: يُبنى عبر `StudyModeEventLogger.Factory` مع `x4.SPACED_REPETITION`، ويوثق `SrsEventLog` عبر `eventLogger.d(...)`. البنية (حدث → نوع وضع → مُسجِّل) قابلة للنقل حرفيًا؛ أما **الحساب الفعلي للفترات** فلم أعثر عليه مقروءًا (غالبًا في الخادم أو داخل `oldlearn` المشوش) — يُبنى من الصفر بخوارزمية SM-2 القياسية.
- `com.quizlet.quizletandroid.util.links.StudyModeUrlFragment` — قائمة الأوضاع الـ12 كـ `HashSet` في annotation — تُعاد استخدامها **كمواصفة تصميم** لأوضاع وحدة التعليم.
- `com.quizlet.features.match/studyengine/` — بنية محرك المطابقة موجودة (ملفات `a`–`g.java`) لكن المنطق غير مقروء — يُؤخذ **التصميم** (محرك + مدير + نقاط) ويُعاد التنفيذ.
- `com.quizlet.api.IQuizletApiClient` — واجهة عميل الشبكة (تواقيع مشوشة `a`–`r` لكن الأنواع دالة: `Map`، `ReauthenticationRequest`، `SubscriptionRequest`، `ChangeEmailRequest`...) — نمط تغليف الاستجابة بـ `f` (غالبًا `Observable`/`Single` من RxJava).
- `com.quizlet.data` (`repository/` + `interactor/`) — مرجع معماري نظيف يُحتذى في Family OS: الواجهة ← المستودع ← (شبكة/محلي).

## 5. الصلاحيات والمكونات الحساسة
- **الشبكة:** `INTERNET`، `ACCESS_NETWORK_STATE`، `ACCESS_WIFI_STATE`.
- **الصوت:** `RECORD_AUDIO` + `FOREGROUND_SERVICE_MICROPHONE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (تسجيل صوتي للبطاقات + بودكاست) — عبر `AudioRecordingService` و`PodcastMediaSessionService`.
- **الكاميرا:** `CAMERA` (مسح/إنشاء مجموعات بالتصوير غالبًا).
- **أخرى:** `RECEIVE_BOOT_COMPLETED`، `POST_NOTIFICATIONS`، `WAKE_LOCK`، `VIBRATE`، `USE_BIOMETRIC`.
- **ملاحظة:** لا موقع، لا جهات اتصال — بصمة صلاحيات أخف بكثير من Life360، مناسبة لتطبيق أطفال.

## 6. الشبكة ونقاط التكامل
- `IQuizletApiClient` + `IHttpErrorManager` + `HttpStatusRangeConstants` — طبقة شبكة منظمة بمعالجة أخطاء موحدة.
- `api/cookie/` و`data/token/` — إدارة الجلسات والتوكنات.
- `QuizletFirebaseMessagingService` — إشعارات FCM.
- `api/di/` — حقن الاعتمادات لطبقة الشبكة (Dagger/Hilt على الأرجح).

## 7. توصيات إعادة الاستخدام
1. **مواصفة الأوضاع الـ12** (`StudyModeUrlFragment`) — تُعتمد كقائمة أوضاع وحدة التعليم في Family OS.
2. **بنية الميزات** (مجلد لكل ميزة + `data/repository/interactor`) — تُحتذى معماريًا.
3. **SRS:** يُؤخذ تصميم الأحداث (`SrsEventLogger`)، وتُبنى خوارزمية الفترات بـ SM-2 من الصفر — لا يُنتظر استخراج الكود المشوش.
4. **`aicoach`** — يُدرس كمفهوم أولي لوكيل التعليم ضمن طبقة AI (بنية: manager + viewmodel + ui).
5. **نمط `offline/managers`** — أساس مزامنة "مذاكرة دون إنترنت".
6. **تحذير:** لا تُبنى خطة على استخراج منطق `oldlearn`/`match/studyengine` — التشويش يجعله غير مجدٍ؛ القيمة في التصميم لا الكود.

## 8. ملاحظات (التشويش، حدود التحليل)
- التشويش الأثقل بين التطبيقات الثمانية في منطق المذاكرة: `oldlearn/data/` عشرات الملفات أحادية الحرف، و`features/learn/*/data/` كذلك.
- المقروء فعليًا: البنية العليا، الواجهات، نماذج البيانات، نظام الأحداث، وقوائم الأوضاع.
- `IQuizletApiClient` بأسماء دوال مشوشة (`a`–`r`) — تُفهم الأدوار من أنواع المعاملات فقط.
- عناوين الخوادم غير مستخرجة — التكامل الشبكي يُبنى على واجهات Family OS الخاصة.
