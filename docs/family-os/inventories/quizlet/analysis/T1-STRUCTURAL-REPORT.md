# T1 — التقرير البنيوي: Quizlet v10.58

> معرّف التقرير: `REP-QZ-001` — تطبيق واحد: `com.quizlet.quizletandroid` (لا نسخة طفل).

## 1. جرد الـ Manifest [VERIFIED — قُرئ كاملاً وتحليل برمجي]
`rework/quizlet/apktool-out/AndroidManifest.xml`:
- **97 نشاطًا**، **26 خدمة**، **21 مستقبلًا**، **8 مزودين**، **26 إذنًا**.
- الخدمات اللافتة: `features.flashcards.old.autoplay.FlashcardsAutoplayService`،
  `quizletandroid.audio.recorder.internal.AudioRecordingService`،
  `quizletandroid.audio.player.internal.PodcastMediaSessionService`،
  `quizletandroid.firebase.services.QuizletFirebaseMessagingService` (**مصدَّرة**، فلتر `MESSAGING_EVENT`).
- الأذونات (26): إنترنت/شبكة/واي فاي، كاميرا، تسجيل صوت + خدمات أمامية (مايك/تشغيل وسائط)،
  إشعارات، إقلاع، منع نوم، اهتزاز، بيومتري، فوترة Play، معرّفات إعلانية (ADSERVICES_*/AD_ID)،
  `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`، `READ_APP_INFO` (سامسونج)، `ATTEST` (أمازون).
- **لا موقع، لا جهات اتصال، لا SMS/سجل مكالمات** — بصمة خفيفة مناسبة للأطفال [VERIFIED].

## 2. طوبولوجيا الحزم (المقروء مقابل المشوش)
| الطبقة | الحالة |
|---|---|
| `studiablemodels/` (KMP مشتركة: أسئلة/تصحيح/تقدم) | **مقروءة كاملة** — أثمن عقد |
| `shared/quizletapi/` + `shared/models/api/` (عميل KMP الجديد) | مقروءة (kotlinx.serialization بأسماء حقيقية) |
| `remote/model/` (Moshi: srs/, sdui/) | مقروءة |
| `data/` (repository/interactor/model) + `db/` (ORMLite) | مقروءة |
| `eventlogger/` | مقروءة |
| `features/learn/`، `features/match/studyengine/`، `oldlearn/`، `features/aicoach/` | **R8 ثقيل** — أسماء أحادية؛ البنية فقط |
| `api/` (العميل القديم) | مقروءة جزئيًا |

## 3. نقاط التكامل الخارجية
- `https://api.quizlet.com` — الـ API (نمط `/3.11/<resource>/<action>`) [VERIFIED].
- `https://com-quizlet-prod1.collector.snplow.net` — تحليلات Snowplow [VERIFIED].
- FCM للدفع؛ Google Play Billing للاشتراكات.

## 4. أحجام المكونات (أرقام فعلية)
- 66,767 ملفًا في الشجرة (63,530 كود مصدري) — 548MB.
- `api/` + `shared/quizletapi/`: 134 ملف Java.
- 213 خطأ jadx (~0.9%).
- 26 وضعًا في تعداد `x4`؛ 12 مقطع URL فعّال؛ 14 جدول ORMLite؛ 8 فئات شارات.
