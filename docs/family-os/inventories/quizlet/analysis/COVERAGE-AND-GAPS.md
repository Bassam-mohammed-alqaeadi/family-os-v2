# التغطية الوظيفية والفجوات: Quizlet

> 34 وظيفة عبر 9 مجالات: **21 مؤكدة (A)** / **7 مشتقة (B)** / **4 جزئية** / **2 غير موجودة**.

## المجال 1: أوضاع المذاكرة (12)
| الوضع | المستوى | الدليل |
|---|---|---|
| flashcards | A | `FlashcardsAutoplayService` + إعدادات `showSpacedRepetitionOption` |
| spaced-repetition | A | العقد الكامل: طلب/خطوات/تخزين/أحداث/تصفير |
| learn | B | البنية + `LearnRoundSummaryData`؛ المنطق مشوش |
| match | B | التصميم engine+manager+grading؛ المنطق مشوش |
| test | B | `practicetest/` + `StudiableTestResults` |
| write | B | `StudiableWriteMasteryBuckets` |
| blast | جزئية | `SINGLE_PLAYER_BLAST(23)` — الاسم فقط |
| blocks | جزئية | `BLOCKS(22)` — الاسم فقط |
| scatter / microscatter | جزئية | التعداد + حزم فارغة نسبيًا |
| cards / classic-cards | جزئية | `MOBILE_CARDS(10)` — الاسم فقط |

## المجال 2: SRS (5)
| الوظيفة | المستوى | الدليل |
|---|---|---|
| عقد الطلب `SrsRequest` | A | 6 حقول مقروءة |
| حلقة الخطوات SDUI | A | الاستجابة + `GetNextSrsSteps` |
| تخزين الاستحقاق محليًا | A | `DBUserStudyable.dueTimestampSec` |
| أحداث SRS التحليلية | A | `SrsEventLogger` + `srs_setup_modal_impression` |
| تصفير التقدم | A | `ResetSrsProgressRequested` + `RemoteSrsProgressResetRequest` |

## المجال 3: التحفيز (4)
| الوظيفة | المستوى | الدليل |
|---|---|---|
| الشارات (7 فئات) | A | `AchievementBadgesData` + enum `f` |
| السلاسل اليومية/الأسبوعية | A (الفئات) / B (الميكانيكا) | الفئات A؛ الحساب خادمي/مشوش B |
| نقاط المطابقة العليا | B | `HighScoresState`؛ العتبات مشوشة |
| لوحة الصدارة | **غير موجودة** | بحث كامل: ضربتان نصيتان فقط |

## المجال 4: البيانات والمزامنة (4)
| الوظيفة | المستوى | الدليل |
|---|---|---|
| نموذج `StudySet` (30+ حقلًا) | A | قائمة الحقول الكاملة |
| جداول ORMLite (14) + هجرات | A | `db/data/models/persisted/` |
| الكيانات دون اتصال | A | `DBOfflineEntity` + `offline/managers/` |
| مستودعات المزامنة | B | `data/repository/` + `interactor/` (بنية واضحة، تدفقات جزئية) |

## المجال 5: الشبكة (3) — كلها A
عميل `api.quizlet.com` بنمط `/3.11/`؛ عميل KMP الجديد؛ تحليلات Snowplow.

## المجال 6: الإشعارات (2)
| الوظيفة | المستوى | الدليل |
|---|---|---|
| خدمة FCM | A | manifest: `QuizletFirebaseMessagingService` مصدَّرة |
| تذكير الاستحقاق اليومي | B | `dueTimestampSec` + `notificationStatus` ← [INFERENCE قوية] |

## المجال 7: الصوت (2) — كلها A
التشغيل التلقائي للبطاقات؛ التسجيل الصوتي + البودكاست بعقود.

## المجال 8: مساعد AI (1)
| الوظيفة | المستوى | الدليل |
|---|---|---|
| وحدة `aicoach` | B | البنية (data/ui/viewmodel/manager)؛ الملفات مشوشة |

## المجال 9: الفوترة (1)
| الوظيفة | المستوى | الدليل |
|---|---|---|
| سجل الاشتراك | B | `DBSubscription` + إذن BILLING؛ الـ SKUs غير مستخرجة |

## الفجوات الحرجة لـ Family OS
1. **صيغة الجدولة**: غير موجودة عميلًا — تُبنى (FSRS-4.5 موصى به).
2. **عتبات الشارات**: خادمية — تُصمم من الصفر.
3. **منطق Learn/Match/aicoach**: مشوش — يُعاد التنفيذ من العقود.
4. **XP/عملات/صدارة**: غائبة أصلًا — تُصمم لرفيق Duolingo من الصفر.
