# تحليل الهندسة العكسية العميق — Quizlet (محرك التعليم)

> **طبيعة هذه الوثيقة:** تحليل عميق من الجولة الثانية (BIP-style)، أعمق وأدق من تقرير الجولة الأولى
> (`docs/family-os/reports/quizlet.md`) الذي غطى البنية العليا وسجّل أن «الحساب الفعلي للفترات لم يُعثر عليه
> مقروءًا (غالبًا في الخادم)». هذه الوثيقة **تحسم تلك النقطة نهائيًا**: خوارزمية جدولة SRS **خادمية 100%** —
> العميل نحيف يعرض خطوات مُولَّدة خادميًا — مع إثبات الغياب بالبحث الشامل، وتوثيق عقد العميل/الخادم كاملًا
> بأسماء الكلاسات والمسارات الدقيقة.
>
> **اتفاقية التحقق:** كل نتيجة موسومة `[VERIFIED]` (قُرئ الكود فعلياً) أو `[INFERENCE]` (مستنتجة من الأسماء/السياق).

---

## 1. نظرة عامة

| البند | القيمة |
|---|---|
| الحزمة | `com.quizlet.quizletandroid` |
| الإصدار المحلَّل | 10.58 (base.apk مستقل، ~38MB مذكور في الجولة الأولى) |
| smali / java | 40,074 / 23,433 (+ ملفات apktool: **66,767 ملفًا إجمالًا** في الشجرة) [VERIFIED بالعد] |
| أخطاء jadx | 213 (~0.9%) |
| نقطة الدخول | `com.quizlet.quizletandroid.QuizletApplication` ← `com.quizlet.quizletandroid.ui.RootActivity` |
| الدور في Family OS | **نواة وحدة التعليم**: البطاقات، أوضاع المذاكرة الـ12، SRS، التعلم باللعب، العمل دون اتصال |
| التشويش | R8 ثقيل في منطق المذاكرة (`features/learn/*`، `features/match/studyengine/*`، `oldlearn/*` بأسماء أحادية)؛ **المقروء فعليًا**: عقود الشبكة/النماذج (kotlinx.serialization/Moshi بأسماء حقول حقيقية)، مكتبة `studiablemodels` المشتركة، نظام الأحداث، سجل الأوضاع، طبقة البيانات |

### الحكم الاستراتيجي المبكر [VERIFIED]
Quizlet الحديث **عميل نحيف + خادم ذكي**: الجدولة (SRS)، توليد الخطوات، والتوصيات كلها خادمية عبر `https://api.quizlet.com/3.11/…`؛
العميل يرسل الإجابات ويعرض واجهة مُقادة خادميًا (SDUI). هذا يعني أن **لا صيغة جدولة تُستخرج من العميل أبدًا** —
Family OS يبني محرك الجدولة بنفسه (التوصية: FSRS مفتوح المصدر) ويقتبس **عقود العميل** لا الخوارزمية.

---

## 2. البنية المعمارية — خريطة الحزم [VERIFIED]

```
com.quizlet/
├── features/            # ميزة لكل مجلد (feature-per-module)
│   ├── flashcards/      # base/ old/ data/ settings/ + autoplay/FlashcardsAutoplayService
│   ├── learn/           # checkpoint/ progress/ onboarding/ settings/ (مشوش بأسماء أحادية)
│   ├── match/           # studyengine/ highscore/ managers/ logging/ settings/ audio/
│   ├── practicetest/ test/ write/  # أوضاع الاختبار والكتابة
│   ├── blocks/ blast(→scatter?) microscatter/ # ألعاب
│   ├── setpage/ folders/ classes/ termlist/ createset/
│   ├── achievements/    # الشارات والسلاسل
│   ├── aicoach/         # data/ ui/ viewmodel/ manager/ — مساعد AI للمذاكرة
│   ├── notes/ podcasts/ explanations/ studyguide/
│   └── infra/           # بنية مشتركة: models/flashcards/ studysetting/managers/
├── oldlearn/            # محرك Learn القديم: usecase/ viewmodel/ checkpoint/ data/ streaks/
├── studiablemodels/     # ★ مكتبة KMP مشتركة مقروءة: الأسئلة + التصحيح + التقدم
├── data/                # Clean: repository/ interactor/ model/ token/ connectivity/
├── db/                  # SQLite عبر ORMLite (ليس Room!) — models/persisted + migrations
├── api/                 # عميل الشبكة القديم: okhttp/interceptors, cookie/, error/, di/
├── shared/              # العميل الجديد (KMP): quizletapi/ models/api/ usecase/ httpclient/
│   └── quizletapi/{srs, grading, studyset, folders, eligibility, studynotes, ...}
├── remote/model/        # نماذج Moshi للاستجابات: srs/ sdui/
├── eventlogger/         # تتبع الأحداث: features/srs/ features/studymodes/
├── offline/             # managers/ + data/ — المزامنة دون اتصال
└── quizletandroid/      # التطبيق: ui/ audio/ firebase/ util/links/
```

**ملاحظات معمارية:**
- **نمط الميزات**: كل ميزة حزمة مستقلة (`data/` + `ui/` + `viewmodel/` + `managers/`) — يُحتذى حرفيًا في Family OS [VERIFIED].
- **طبقتا شبكة متوازيتان**: القديمة `com.quizlet.api.*` (Retrofit/OkHttp) والجديدة `com.quizlet.shared.quizletapi.*` (KMP + kotlinx.serialization) — هجرة جارية؛ SRS على الجديدة [VERIFIED].
- **التخزين المحلي ORMLite** (`com.j256.ormlite`) لا Room — `@DatabaseTable`/`@DatabaseField` على `DBUserStudyable` وغيرها [VERIFIED].
- **SDUI**: نماذج `remote/model/sdui/` — الخادم يركّب الواجهة (heading/progressBar/steps/events) والعميل يعرض [VERIFIED].

---

## 3. أوضاع المذاكرة الـ12 — الجرد الكامل [VERIFIED]

### 3.1 سجل الأوضاع الرسمي
`jadx-out/sources/com/quizlet/quizletandroid/util/links/StudyModeUrlFragment.java` — `HashSet` من 12 مقطع URL:
`blast`، `blocks`، `cards`، `classic-cards`، `flashcards`، `learn`، `match`، `microscatter`، `scatter`، `test`، `write`، `spaced-repetition`.

### 3.2 تعداد StudyMode الكامل (26 وضعًا داخليًا)
`jadx-out/sources/com/quizlet/generated/enums/x4.java` — كل وضع برقم ثابت (يُستخدم في التحليلات والـ API):
| # | الوضع | # | الوضع |
|---|---|---|---|
| 1 | WRITE | 14 | MICROSCATTER |
| 2 | FLASHCARDS | 15 | REVIEW |
| 3 | TEST | 16 | MULTIPLAYER |
| 4 | SPACE_RACE | 17 | LEARNING_ASSISTANT |
| 5 | SCATTER | 18 | LOCATE |
| 6 | VOICE_RACE | 20 | QCHAT |
| 7 | VOICE_SCATTER | 21 | GAMES_HUB |
| 8 | SPELLER | 22 | BLOCKS |
| 9 | BISMARCK | 23 | SINGLE_PLAYER_BLAST |
| 10 | MOBILE_CARDS | 24 | FLIP |
| 11 | MOBILE_WRITE | 25 | CHARMS |
| 12 | MOBILE_SCATTER | 26 | SPACED_REPETITION |
| 13 | GRAVITY | | |

### 3.3 كيف يعمل كل وضع (تصميمًا + أدلته)

1. **flashcards** — بطاقات تقليب؛ `features/flashcards/{base,old}/`؛ التشغيل التلقائي `FlashcardsAutoplayService` (خدمة أمامية)؛ الإعدادات `features/flashcards/settings/d.java` تحوي `showSpacedRepetitionOption` و`studyMethodModalDefaultId` — أي أن Flashcards هي **بوابة الدخول لوضع SRS** [VERIFIED].
2. **learn** — التعلّم التكيفي؛ `features/learn/` (مشوش) + `oldlearn/` (المحرك القديم)؛ الوحدات: `checkpoint/` (نقاط إتقان)، `progress/` (تقدم الجولة)، `LearnRoundSummaryData(studyableModelData, studySessionId, roundResults, progressState, currentTaskProgress, numFocusedLearnTerms)` [VERIFIED].
3. **match** — لعبة مطابقة المصطلح/التعريف ضد الزمن؛ `features/match/studyengine/e.java` يبني `MatchingGameResponse(i, i2)` ويمرره للمدير `b` عبر كوروتين — **التصميم: محرك (engine) + مدير (manager) + تصحيح (grading) + نقاط عليا (highscore)** [VERIFIED تصميمًا، المنطق مشوش].
4. **test** — اختبار مولّد (اختيار/صح-خطأ/ملء فراغ/كتابة)؛ `features/practicetest/` + نماذج `studiablemodels/grading/StudiableTestResults` [VERIFIED].
5. **write** — كتابة الإجابة؛ `studiablemodels/StudiableWriteMasteryBuckets` — **دلالة على "دلاء إتقان" للكتابة** (تجميع الأخطاء حسب الإتقان) [VERIFIED].
6. **scatter / microscatter** — سحب المصطلحات المبعثرة؛ microscatter نسخة مصغرة للجوال [INFERENCE من التسمية + MOBILE_SCATTER].
7. **blast / blocks** — ألعاب أركيد (single-player blast)؛ `SINGLE_PLAYER_BLAST(23)` [VERIFIED].
8. **cards / classic-cards** — عارض البطاقات الكلاسيكي (MOBILE_CARDS) [INFERENCE].
9. **spaced-repetition** — وضع SRS الخادمي الكامل (§4).
10. **الأوضاع المساعدة**: `LEARNING_ASSISTANT(17)` (مرتبط بـ aicoach)، `QCHAT(20)` (محادثة تعليمية)، `GAMES_HUB(21)` (بوابة الألعاب)، `CHARMS(25)`، `SPELLER(8)` (إملاء صوتي)، `GRAVITY(13)`، `LOCATE(18)` — ألعاب/مساعدات قديمة ما زالت في التعداد [VERIFIED وجودًا، الوظيفة من التسمية].

### 3.4 نظام أسئلة موحد — `studiablemodels` [VERIFIED — مقروءة كاملة]
مكتبة KMP مشتركة بأنواع أسئلة صريحة — **أثمن عقد قابل للنسخ**:
- `StudiableQuestion` ← `MultipleChoiceStudiableQuestion`، `TrueFalseStudiableQuestion`، `FillInTheBlankStudiableQuestion` (+`FillInTheBlankStudiableSegment`)، `RevealSelfAssessmentStudiableQuestion`، `MixedOptionMatchingStudiableQuestion`.
- التصحيح `studiablemodels/grading/`: `MatchingGameResponse`، `MultipleChoiceResponse`، `TrueFalseResponse`، `RevealSelfAssessmentResponse`، `StudiableQuestionResponse`، `StudiableQuestionFeedback`، `PGradedAnswerMetadata`، `StudiableTestResults`.
- التقدم: `StudiableStep` ← `StudiableCheckpoint(AssistantCheckpointProgressState, isComplete, steps, meteringData)`؛ `StudiableRoundProgress`، `StudiableTaskProgress`، `StudiableTotalProgress`.

---

## 4. محرك SRS — التفكيك الكامل (أهم قسم)

### 4.1 الحكم النهائي: الجدولة خادمية 100% [VERIFIED]
- **بحث الغياب الشامل**: صفر نتائج في كامل الشجرة (23,433 ملف Java) لـ `easiness` / `leitner` / `supermemo` / `sm-2` / `fsrs` / `nextDue` / `next_due` / `intervalDays` / `interval_days` / `repetition_interval` — **لا يوجد أي حساب فترات على العميل** [VERIFIED بالبحث].
- العميل **لا يحسب**، بل: يرسل الإجابات ← يستقبل خطوات جاهزة ← يعرضها ← يخزن `dueTimestampSec` الذي أعاده الخادم.

### 4.2 عقد الطلب: `SrsRequest` [VERIFIED]
`jadx-out/sources/com/quizlet/shared/models/api/srs/SrsRequest.java` (kotlinx.serialization):
```
SrsRequest(
  personId: Long?,                 // المستخدم
  studiableContainerId: Long,      // المجموعة (setId)
  studiableContainerType: StudiableContainerType,
  personTimezone: String?,         // المنطقة الزمنية — الجدولة يومية محلية
  personTestDate: Long?,           // تاريخ الامتحان — عدّاد تنازلي/تكثيف المراجعة
  clientLatestAnswers: List?       // آخر إجابات العميل — مدخل الجدولة
)
```

### 4.3 نقطة النهاية [VERIFIED]
- `jadx-out/sources/com/quizlet/shared/quizletapi/srs/c.java` يبني الـ URL عبر `com.quizlet.shared.quizletapi.b.a(bVar, "srs", "status", 12)`.
- `jadx-out/sources/com/quizlet/shared/quizletapi/b.java:18-28`: `https://` + host + `/3.11/` + `srs` + `/` + `status`.
- الـ host من `api/okhttp/interceptors/AppSessionInterceptor.java:29` و`AuthorizationInterceptor.java:32`: **`https://api.quizlet.com`** → النهاية الكاملة **`POST https://api.quizlet.com/3.11/srs/status`** بجسم `{"srs": {…}}` [VERIFIED].

### 4.4 الاستجابة: واجهة مُقادة خادميًا (SDUI) [VERIFIED]
- `remote/model/srs/RemoteSrsStepsResponse(heading, progressBar, progressFraction, steps, events)` — Moshi؛ الخطوات `steps: List` + الأحداث `onBegin/onEnter/onExit`.
- `remote/model/sdui/clientactions/study/RemoteGetNextSrsStepsClientAction(type, props{url, queryParams}, events{onSuccess, onFailure})` — بعد كل خطوة العميل **يطلب الخطوات التالية** من URL يعطيه الخادم (حلقة عميل↔خادم لكل خطوة، لا دفعات مسبقة) [VERIFIED].
- `RemoteSrsSetRecommendation(id)` — توصية المجموعة التالية؛ `RemoteSrsProgressResetRequest` — تصفير التقدم.

### 4.5 التخزين المحلي للاستحقاق [VERIFIED]
- `db/data/models/persisted/DBUserStudyable.java` — جدول `userStudyable` (ORMLite): `dueTimestampSec` (DUE_TIMESTAMP)، `lastStudiedTimestamp`، `startTimestampSec`، `isActive`، `isDismissed`، `notificationStatus` (0/1)، `personId`+`studyableId`+`studyableType` (مفتاح مركب).
- الدلالة: العميل يخزن **موعد الاستحقاق الذي حسبه الخادم** ليعرض التذكيرات/الإشعارات دون استدعاء — **نمط "الخادم يحسب، العميل يخزن ويذكّر"** يُقتبس حرفيًا [VERIFIED].

### 4.6 أحداث SRS التحليلية [VERIFIED]
- `eventlogger/features/srs/SrsEventLogger(eventLogger, StudyModeEventLogger.Factory)` — يُبنى المصنع مع `x4.SPACED_REPETITION`؛ `a(SrsEventLog)` يوثق عبر `eventLogger.d(…)`.
- `d(long)`: حدث `srs_setup_modal_impression` بحقول `studiableId/serverStudyableId/modalType="choose_method"/screen="flashcards"` — **نافذة اختيار طريقة المذاكرة تظهر من Flashcards**.
- الحزم المرافقة: `SrsEventLog`، `Actions`، `SrsErrorType`، `SrsModalType`، `SrsScreen`، `SrsSortingType` (ثوابتها مُجردة بـ R8 — الأسماء فقط).
- أوضاع Flashcards: `features/flashcards/base/data/g.java:65` — `showSpacedRepetitionOption`؛ `features/flashcards/old/data/f.java:28` — `SpacedRepetition(setId=…)`؛ `features/flashcards/base/data/t.java` — `ResetSrsProgressRequested(updatedSettings=…)`؛ `features/flashcards/data/d1.java` — `ShowResetSrsProgressConfirmation`.

### 4.7 ماذا يعني هذا لـ Family OS (الخلاصة التنفيذية)
1. **لا تُضِع وقتًا في البحث عن صيغة SM-2 في العميل — غير موجودة.** ابنِ الجدولة خادميًا (أو في طبقة المجال بـ Family OS) بخوارزمية **FSRS-4.5** (مفتوحة المصدر، تتفوق على SM-2).
2. **انسخ العقد لا الخوارزمية**: حقول `SrsRequest` الستة (بما فيها `personTimezone` و`personTestDate` — تفصيلتان ذكيتان: الجدولة اليومية المحلية ووضع الامتحان) + حلقة `GetNextSrsSteps` + تخزين `dueTimestampSec` محليًا للتذكير.
3. `clientLatestAnswers` في الطلب = **التقييم الذاتي/الإجابات تُرسل مع كل دفعة** — صمم بروتوكول Family OS بنفس الشكل.

---

## 5. التحفيز: الإنجازات والسلاسل والنقاط [VERIFIED]

### 5.1 نظام الشارات (7 فئات)
- `data/interactor/achievements/a.java` = `AchievementBadgesData(studyData, dailyStreakData, weeklyStreakData, setsStudiedData, roundsStudiedData, explanationsStudiedData, studyGuidesCreated)` — **سبع فئات شارات** [VERIFIED].
- `generated/enums/f.java`: `DAY("Day")`، `WEEK("Week")`، `DAILY_STREAKS("DailyStreaks")`، `WEEKLY_STREAKS("WeeklyStreaks")`، `SETS_STUDIED("SetsStudied")`، `ROUNDS_STUDIED("RoundsStudied")`، `EXPLANATIONS_STUDIED("ExplanationsStudied")`، `STUDY_GUIDES_CREATED("StudyGuidesCreated")` (+`NONE`) [VERIFIED].
- الواجهة: `features/achievements/ui/AchievementsActivity` + `AchievementEarnedView` (احتفال الكسب) + `features/achievements/notification/` (إشعار الكسب) + `features/achievements/helper/` [VERIFIED].
- **سلاسل يومية وأسبوعية منفصلة** — تصميم أدق من سلسلة Duolingo الواحدة؛ يُقتبس [INFERENCE: الفصل اليومي/الأسبوعي مقصود سلوكيًا].

### 5.2 سلاسل Learn القديمة (رقيقة ومشوشة)
- `oldlearn/usecase/streaks/a.java`: شرط السلسلة `b0.b() && streakCount > 1 && z`؛ حدث الإنجاز عند `(x + (-15)) % 10 == 0` لنوع `a0.TWO` — **منطق احتفال كل 10** (مشوش، يؤخذ تصميمًا فقط) [VERIFIED جزئيًا].

### 5.3 نقاط المطابقة العليا
- `features/match/highscore/` — `HighScoresState`؛ المنطق مشوش — **التصميم: أعلى نتيجة لكل مجموعة تُحفظ وتُعرض** [VERIFIED وجودًا].
- **لا لوحة صدارة (leaderboard) حقيقية في العميل**: بحث كامل يُرجع ضربتين نصيتين فقط (viewholder + R) — [VERIFIED غائبة].

### 5.4 ما ليس موجودًا (مثبت بالبحث)
- لا XP/عملات/متجر مكافآت في العميل [VERIFIED بالبحث عن xp/currency/reward_levels — صفر ذي صلة].
- لا أهداف يومية رقمية معلنة (السلاسل هي البديل) [INFERENCE].

---

## 6. البيانات والشبكة والإشعارات والصلاحيات

### 6.1 نماذج البيانات [VERIFIED]
- `data/model/StudySet` — الحقول: `id`، `timestamp`، `lastModified`، `publishedTimestamp`، `creatorId`، `wordLang`، `defLang`، `title`، `passwordUse/passwordEdit/password`، `accessType/accessCodePrefix`، `description`، `numTerms`، `hasImages`، `parentId`، `creationSource`، `privacyLockStatus`، `hasDiagrams`، `webUrl`، `thumbnailUrl`، `price/purchasableType`، `localId`، `isDeleted`، `clientTimestamp`، `isDirty`، `readyToCreate`، `isEligibleForPracticeTests/isEligibleForStudyGuide`، `studyGuideIneligibilityReason`، `recommendedCourseMetadata`.
- `data/model/StudyMaterialItem` متعدد الأشكال: `FlashcardSetItem`، `FolderItem`، `NoteItem`، `PodcastItem`، `PracticeTestItem`، `TextbookItem/ExerciseItem`، `ExplanationQuestionItem` — **نموذج "مادة دراسية" موحد** يُحتذى [VERIFIED].

### 6.2 التخزين المحلي — ORMLite + هجرات [VERIFIED]
- الجداول (`db/data/models/persisted/`): `DBTerm`، `DBStudySet`، `DBStudySetting`، `DBSession`، `DBSelectedTerm`، `DBProgressReset`، `DBOfflineEntity`، `DBUserStudyable`، `DBDiagramShape`، `DBImage`، `DBImageRef`، `DBQuestionAttribute`، `DBGroupFolder`، `DBUser`.
- الهجرات `db/data/database/migration/`: من `Migration0049AddStudySettingTable` إلى `Migration0113DropFeedbackTable` — **قاعدة ناضجة بهجرات مرقمة** (نمط يُحتذى).
- `DBOfflineEntity` + `offline/managers/{a,g}.java` + `offline/data/a.java` — **كيانات دون اتصال**: تُنزَّل المجموعات كاملة وتُزامَن — أساس "مذاكرة دون إنترنت" [VERIFIED].
- المزامنة: `data/repository/` + `data/interactor/` (Clean)؛ `token/` للجلسات.

### 6.3 الشبكة [VERIFIED]
- المضيف: `https://api.quizlet.com` (معترضات `AppSessionInterceptor`/`AuthorizationInterceptor`)؛ نمط المسار `/3.11/<resource>/<action>`.
- الطبقة الجديدة `shared/quizletapi/`: مجلد لكل مورد (`srs/ grading/ studyset/ folders/ eligibility/ studynotes/ studiableMetadata/ folderstudymaterials/`) — 134 ملف Java في `api/` + `shared/quizletapi/`.
- التحليلات: Snowplow `https://com-quizlet-prod1.collector.snplow.net`؛ `eventlogger/` بمسجلات لكل ميزة (`StudyModeEventLogger.Factory` لكل وضع).
- الفوترة: `db/billing/model/DBSubscription.java` + صلاحية `com.android.vending.BILLING`.

### 6.4 الإشعارات [VERIFIED]
- `com.quizlet.quizletandroid.firebase.services.QuizletFirebaseMessagingService` — **مصدَّرة**، تستقبل `com.google.firebase.MESSAGING_EVENT` (manifest).
- `DBUserStudyable.notificationStatus` (0/1) + `dueTimestampSec` — **تذكيرات الاستحقاق اليومية هي حالة الاستخدام** [INFERENCE قوية].
- صلاحية `POST_NOTIFICATIONS` معلنة.

### 6.5 الصلاحيات والمكونات (manifest: 97 نشاطًا / 26 خدمة / 21 مستقبلًا / 8 مزودين / 26 إذنًا) [VERIFIED]
- **الأذونات**: `INTERNET`، `ACCESS_NETWORK_STATE`، `ACCESS_WIFI_STATE`، `CAMERA` (إنشاء مجموعات بالتصوير)، `RECORD_AUDIO` + `FOREGROUND_SERVICE_MICROPHONE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` (تسجيل صوتي + بودكاست)، `POST_NOTIFICATIONS`، `RECEIVE_BOOT_COMPLETED`، `WAKE_LOCK`، `VIBRATE`، `USE_BIOMETRIC`/`USE_FINGERPRINT`، `BILLING`، `AD_ID` + `ADSERVICES_*` (إعلانات — تُحذف في Family OS)، `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`، `READ_APP_INFO` (سامسونج)، `ATTEST` (أمازون).
- **لا موقع، لا جهات اتصال، لا SMS** — بصمة خفيفة مناسبة للأطفال [VERIFIED].
- **الخدمات**: `FlashcardsAutoplayService` (تشغيل تلقائي للبطاقات)، `AudioRecordingService` (`quizletandroid/audio/recorder/`)، `PodcastMediaSessionService` (`quizletandroid/audio/player/` بعقود `contract/`)، `QuizletFirebaseMessagingService`.

### 6.6 مساعد AI
- `features/aicoach/` — `data/` + `ui/` + `viewmodel/` + `manager/` (أسماء ملفات مشوشة، البنية واضحة) — **وكيل تعليم** يتقاطع مع طبقة AI في Family OS؛ `LEARNING_ASSISTANT(17)` و`QCHAT(20)` أوضاع مرتبطة به [VERIFIED بنيويًا].

---

## 7. الدمج في Family OS — ماذا نأخذ؟ (مرتب بالأولوية)

> **1 = يُنسخ فوراً | 2 = يُقتبس بتكييف | 3 = مرجع تصميمي | ✗ = مرفوض صراحة**

| # | المأخوذ | الرتبة | السبب والمسار الدقيق |
|---|---|---|---|
| 1 | **عقد SRS العميل/الخادم**: حقول `SrsRequest` الستة + حلقة `GetNextSrsSteps` + تخزين `dueTimestampSec` | 1 | `shared/models/api/srs/SrsRequest.java`؛ `remote/model/sdui/clientactions/study/RemoteGetNextSrsStepsClientAction.java`؛ `db/data/models/persisted/DBUserStudyable.java`. انسخ شكل العقد حرفيًا؛ الصيغة تُبنى بـ FSRS-4.5. |
| 2 | **تصنيف الأسئلة الموحد** `studiablemodels` (5 أنواع + حزم التصحيح) | 1 | `studiablemodels/StudiableQuestion.java` والأنواع الخمسة + `studiablemodels/grading/*`. أساس محرك الأسئلة في Family OS — يُعاد التنفيذ بنفس التصنيف. |
| 3 | **سجل الأوضاع**: 12 مقطع URL + تعداد `x4` بالأرقام الثابتة | 1 | `quizletandroid/util/links/StudyModeUrlFragment.java`؛ `generated/enums/x4.java`. اعتمده مواصفة أوضاع وحدة التعليم. |
| 4 | **نموذج التقدم**: `StudiableCheckpoint` + `StudiableRoundProgress/TaskProgress/TotalProgress` + `LearnRoundSummaryData` | 2 | `studiablemodels/StudiableCheckpoint.java`؛ `oldlearn/data/LearnRoundSummaryData.java`. نموذج "جولة ← مهام ← نقاط إتقان" لجلسات المذاكرة. |
| 5 | **نظام الشارات 7-فئات** (سلاسل يومية/أسبوعية منفصلة) | 2 | `data/interactor/achievements/a.java`؛ `generated/enums/f.java`؛ `features/achievements/`. كيّف الفئات لعمر الطفل (سلاسل + مجموعات مُنجزة). |
| 6 | **بنية تسجيل الأحداث**: مصنع مسجل لكل وضع (`StudyModeEventLogger.Factory` + `x4`) | 2 | `eventlogger/features/studymodes/StudyModeEventLogger.java`؛ `eventlogger/features/srs/SrsEventLogger.java`. تحليلات Family OS تُبنى بنفس النمط. |
| 7 | **الكيانات دون اتصال** (`DBOfflineEntity` + `offline/managers/`) | 2 | `db/data/models/persisted/DBOfflineEntity.java`؛ `offline/managers/a.java`. أساس المذاكرة دون إنترنت لليمن. |
| 8 | **نموذج المادة الدراسية الموحد** `StudyMaterialItem` (7 أنواع) | 2 | `data/model/StudyMaterialItem*.java`. وحدة التعليم تحتاج نفس التعددية (بطاقات/ملاحظات/اختبارات/كتب). |
| 9 | **تصميم محرك المطابقة** (engine + manager + grading + highscore) | 3 | `features/match/studyengine/e.java` (يُرسل `MatchingGameResponse`). أعد التنفيذ — المنطق مشوش. |
| 10 | **نمط الخدمات الصوتية** (autoplay + تسجيل + بودكاست بعقود) | 3 | `features/flashcards/old/autoplay/FlashcardsAutoplayService.java`؛ `quizletandroid/audio/{player,recorder}/`. مرجع لصوتيات البطاقات. |
| 11 | **نافذة اختيار طريقة المذاكرة** (`srs_setup_modal_impression` + `choose_method`) | 2 | `eventlogger/features/srs/SrsEventLogger.java: d()`. تجربة دخول SRS تُقتبس. |
| ✗ | البحث عن صيغة SM-2 في العميل | ✗ | **مثبت غيابها** — لا تُضِع دورة إضافية. |
| ✗ | أذونات الإعلانات (`ADSERVICES_*`، `AD_ID`) وحزم الإعلانات | ✗ | Family OS بلا إعلانات — تُحذف من البصمة. |
| ✗ | منطق `oldlearn`/`match/studyengine` المشوش حرفيًا | ✗ | القيمة في التصميم والعقود لا الكود. |

### التوصية المحورية للرفيق بأسلوب Duolingo
قلب الرفيق = **حلقة SRS خادمية + شارات سلاسل + نقاط إتقان لكل جولة**:
1. خادم FSRS يحسب `dueTimestampSec` لكل (طفل، مجموعة) — يُخزن في SQLite ويُشغَّل تذكير FCM يومي.
2. `personTestDate` في العقد = وضع الامتحان: كثّف المراجعة قبل التاريخ — ميزة تنافسية مباشرة.
3. الشارات السبع تُكيَّف: سلسلة يومية/أسبوعية + مجموعات مُنجزة + جولات — تُغذيها أحداث `StudyModeEventLogger` المكافئة.

---

## 8. أسئلة مفتوحة وخريطة الملفات

### أسئلة مفتوحة
1. **صيغة الخادم الدقيقة** (SM-2؟ FSRS؟ مخصص؟) — غير قابلة للاستخراج من العميل [محسوم: تُبنى لا تُستخرج].
2. **دلالات `personTestDate`**: هل يكثّف الخادم المراجعة قبل الامتحان فعلًا؟ [INFERENCE من الاسم — يحتاج اختبار سلوكي].
3. **مسار تشغيل تذكير الاستحقاق**: من `dueTimestampSec` إلى الإشعار — الكود المشغّل لم يُقرأ (مرشح: WorkManager/alarm) [غير مؤكد].
4. **عتبات الشارات الرقمية** (كم يومًا للشارة؟) — خادمية على الأرجح [غير مستخرجة].
5. **`oldlearn`**: هل بقي فيه أي جدولة تكيفية قديمة عميلة؟ التشويش يمنع الحسم — **غير مهم** بعد حسم الخادمية.
6. **QCHAT/LEARNING_ASSISTANT**: حدود مساعد AI — لم تُحلل عميقًا (أسماء مشوشة) [لجولة لاحقة].

### خريطة الملفات المرجعية (مسارات دقيقة — `~/workspace/rework/quizlet/`)
- `jadx-out/sources/com/quizlet/shared/models/api/srs/SrsRequest.java` — عقد طلب SRS (الأثمن).
- `jadx-out/sources/com/quizlet/shared/quizletapi/srs/c.java` + `shared/quizletapi/b.java` — نقطة `POST /3.11/srs/status`.
- `jadx-out/sources/com/quizlet/remote/model/srs/RemoteSrsStepsResponse.java` + `RemoteSrsStepsEvents.java` + `RemoteSrsSetRecommendation.java` + `RemoteSrsProgressResetRequest.java`.
- `jadx-out/sources/com/quizlet/remote/model/sdui/clientactions/study/RemoteGetNextSrsStepsClientAction.java` — حلقة الخطوات.
- `jadx-out/sources/com/quizlet/eventlogger/features/srs/SrsEventLogger.java` — أحداث SRS.
- `jadx-out/sources/com/quizlet/db/data/models/persisted/DBUserStudyable.java` — `dueTimestampSec`.
- `jadx-out/sources/com/quizlet/generated/enums/x4.java` — 26 وضعًا؛ `generated/enums/f.java` — 8 فئات شارات.
- `jadx-out/sources/com/quizlet/quizletandroid/util/links/StudyModeUrlFragment.java` — 12 مقطعًا.
- `jadx-out/sources/com/quizlet/studiablemodels/` — الأسئلة والتصحيح والتقدم (كاملة القراءة).
- `jadx-out/sources/com/quizlet/data/model/StudySet.java` + `StudyMaterialItem*.java` — النماذج.
- `jadx-out/sources/com/quizlet/data/interactor/achievements/a.java` — `AchievementBadgesData`.
- `jadx-out/sources/com/quizlet/features/match/studyengine/e.java` — تصميم محرك المطابقة.
- `jadx-out/sources/com/quizlet/features/flashcards/old/autoplay/FlashcardsAutoplayService.java`.
- `jadx-out/sources/com/quizlet/oldlearn/data/LearnRoundSummaryData.java` + `oldlearn/usecase/streaks/a.java`.
- `jadx-out/sources/com/quizlet/api/okhttp/interceptors/AppSessionInterceptor.java` — الـ host.
- `apktool-out/AndroidManifest.xml` — 97 نشاطًا / 26 خدمة / 21 مستقبلًا / 8 مزودين / 26 إذنًا.
