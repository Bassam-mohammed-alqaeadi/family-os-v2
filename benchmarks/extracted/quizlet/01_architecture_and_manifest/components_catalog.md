# فهرس المكونات الأربعة الشامل والـ Intent Filters في Quizlet (Components Catalog)

> **المسار:** `benchmarks/extracted/quizlet/01_architecture_and_manifest/components_catalog.md`  
> **الإحصائية الإجمالية:** 96 أنشطة، 23 خدمات، 21 مستقبلات، 7 مزودات محتوى  

---

## 1. الأنشطة الرئيسية وواجهات المستخدم (Activities - إجمالي 96 نشاطاً)

| اسم النشاط (Activity Name) | التصدير (Exported) | الغرض والوظيفة التعليمية |
|---|---|---|
| `RootActivity`<br><small>`com.quizlet.quizletandroid.ui.RootActivity`</small> | نعم (متاح للروابط) | النشاط الجذري للتطبيق ومضيف Jetpack Compose و Navigation Graph |
| `ShareSheetReceiverActivity`<br><small>`com.quizlet.quizletandroid.ui.sharereceiver.ShareSheetReceiverActivity`</small> | نعم (متاح للروابط) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `CreateSetShortcutInterstitialActivity`<br><small>`com.quizlet.quizletandroid.ui.shortcuts.CreateSetShortcutInterstitialActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `OldSignupActivity`<br><small>`com.quizlet.quizletandroid.ui.login.OldSignupActivity`</small> | نعم (متاح للروابط) | شاشات تسجيل الدخول والتحقق والمصادقة الموحدة (SSO / OAuth) |
| `GlobalNavigationActivity`<br><small>`com.quizlet.quizletandroid.ui.globalnav.GlobalNavigationActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `GroupActivity`<br><small>`com.quizlet.quizletandroid.ui.group.GroupActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `DeepLinkInterstitialActivity`<br><small>`com.quizlet.quizletandroid.ui.deeplinkinterstitial.DeepLinkInterstitialActivity`</small> | نعم (متاح للروابط) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `SetPageActivity`<br><small>`com.quizlet.features.setpage.SetPageActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `ProfileActivity`<br><small>`com.quizlet.quizletandroid.ui.profile.ProfileActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `WriteModeActivity`<br><small>`com.quizlet.quizletandroid.ui.studymodes.write.WriteModeActivity`</small> | خاص (داخلي) | شاشة وضع الكتابة والإملاء والتحقق من صحة الحروف |
| `WriteSettingsActivity`<br><small>`com.quizlet.quizletandroid.ui.studymodes.write.WriteSettingsActivity`</small> | خاص (داخلي) | شاشة وضع الكتابة والإملاء والتحقق من صحة الحروف |
| `MatchActivity`<br><small>`com.quizlet.quizletandroid.ui.studymodes.match.activity.MatchActivity`</small> | خاص (داخلي) | شاشة لعبة مطابقة المصطلحات بالتعريفات مع مؤقت السرعة التنافسي |
| `MatchSettingsActivity`<br><small>`com.quizlet.quizletandroid.ui.studymodes.match.settings.MatchSettingsActivity`</small> | خاص (داخلي) | شاشة لعبة مطابقة المصطلحات بالتعريفات مع مؤقت السرعة التنافسي |
| `TestStudyModeActivity`<br><small>`com.quizlet.quizletandroid.ui.studymodes.testmode.activities.TestStudyModeActivity`</small> | خاص (داخلي) | شاشة توليد الاختبارات التجريبية (خيارات متعددة، صح/خطأ، أسئلة كتابية) |
| `FullScreenOverlayActivity`<br><small>`com.quizlet.quizletandroid.ui.FullScreenOverlayActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `EditTermImagePreviewActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.EditTermImagePreviewActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `EditSetActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.EditSetActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `EditSetDetailsActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.EditSetDetailsActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `EditSetLanguageSelectionActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.EditSetLanguageSelectionActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `EditSetPermissionSelectionActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.EditSetPermissionSelectionActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `InputPasswordActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.InputPasswordActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `SearchActivity`<br><small>`com.quizlet.quizletandroid.ui.search.SearchActivity`</small> | نعم (متاح للروابط) | شاشة البحث في ملايين المجموعات الدراسية المتاحة للجمهور |
| `SetPreviewActivity`<br><small>`com.quizlet.quizletandroid.ui.preview.SetPreviewActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `WebViewActivity`<br><small>`com.quizlet.quizletandroid.ui.webpages.WebViewActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `FacebookActivity`<br><small>`com.facebook.FacebookActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `ChangeProfileImageActivity`<br><small>`com.quizlet.quizletandroid.ui.usersettings.activities.ChangeProfileImageActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `FacebookAuthActivity`<br><small>`com.quizlet.quizletandroid.ui.login.FacebookAuthActivity`</small> | خاص (داخلي) | شاشات تسجيل الدخول والتحقق والمصادقة الموحدة (SSO / OAuth) |
| `CropImageActivity`<br><small>`com.quizlet.quizletandroid.ui.usersettings.activities.CropImageActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `LearningAssistantActivity`<br><small>`com.quizlet.quizletandroid.ui.studymodes.assistant.LearningAssistantActivity`</small> | خاص (داخلي) | شاشة وضع التعلم الذكي التكراري (Spaced Repetition Learn Mode) |
| `UpgradeActivity`<br><small>`com.quizlet.upgrade.ui.activity.UpgradeActivity`</small> | خاص (داخلي) | شاشة الاشتراك والترقية لباقة Quizlet Plus وميزات الذكاء الاصطناعي |
| `DiagramOverviewActivity`<br><small>`com.quizlet.quizletandroid.ui.diagramming.DiagramOverviewActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `AddSetToClassActivity`<br><small>`com.quizlet.quizletandroid.ui.setpage.addset.AddSetToClassActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `JoinContentToFolderActivity`<br><small>`com.quizlet.quizletandroid.ui.joincontenttofolder.JoinContentToFolderActivity`</small> | خاص (داخلي) | شاشات إدارة المجلدات التعليمية والفصول الدراسية للطلاب والمعلمين |
| `AddClassSetActivity`<br><small>`com.quizlet.quizletandroid.ui.group.addclassset.AddClassSetActivity`</small> | خاص (داخلي) | شاشة إنشاء وتعديل وإدارة المجموعات التعليمية والبطاقات |
| `QuizletLiveActivity`<br><small>`com.quizlet.quizletandroid.ui.live.QuizletLiveActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `QuizletLiveDeepLinkInterstitialActivity`<br><small>`com.quizlet.quizletandroid.ui.live.QuizletLiveDeepLinkInterstitialActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `QuizletLiveInterstitialActivity`<br><small>`com.quizlet.quizletandroid.ui.live.interstitial.QuizletLiveInterstitialActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `QLiveQrCodeReaderActivity`<br><small>`com.quizlet.quizletandroid.ui.qrcodes.QLiveQrCodeReaderActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |
| `ScanDocumentActivity`<br><small>`com.quizlet.quizletandroid.ui.setcreation.activities.ScanDocumentActivity`</small> | خاص (داخلي) | شاشة التقاط ومسح المستندات وتحويلها لبطاقات عبر التعرف الضوئي |
| `AdsActivity`<br><small>`com.quizlet.ads.ui.activity.AdsActivity`</small> | خاص (داخلي) | شاشة فرعية لإدارة الحالات والتنقل والتحكم الداخلي |

*(ملاحظة: يتضمن التطبيق 56 نشاطاً إضافياً لإدارة المكتبة، المعاينة، تسجيل الأحداث، وإعدادات الحساب)*

---

## 2. الروابط العميقة والـ Intent Filters (Deep Links & App Schemes)

يدعم Quizlet بروتوكولين رئيسيين للربط العميق والتنقل السريع من الويب والمحادثات:

### 2.1. المخطط المخصص (`quizlet://`)
- `quizlet://set/{set_id}`: فتح مجموعة دراسية محددة مباشرة.
- `quizlet://class/{class_id}`: الانضمام الفوري لفصل دراسي.
- `quizlet://folder/{folder_id}`: استعراض مجلد مجموعات.
- `quizlet://study/{set_id}?mode=flashcards`: إطلاق وضع البطاقات فوراً.
- `quizlet://study/{set_id}?mode=learn`: إطلاق وضع المذاكرة الذكي.
- `quizlet://study/{set_id}?mode=match`: بدء لعبة المطابقة السريعة.

### 2.2. روابط الويب القياسية (`https://quizlet.com/*` عبر Android App Links)
- `https://quizlet.com/{set_id}/{set_slug}/`: فتح ومزامنة المجموعة.
- `https://quizlet.com/join/{invite_code}`: معالجة دعوات الفصول الدراسية وتأكيد الانضمام.
- `https://quizlet.com/explanations/*`: فتح حلول وشروحات الكتب المدرسية خطوة بخطوة.

---

## 3. الخدمات الخلفية (Services - إجمالي 23 خدمة)

| اسم الخدمة (Service Name) | الغرض المعماري والوظيفة |
|---|---|
| `AudioPlaybackService` / `MediaPlayback` | تشغيل قارئ البطاقات التلقائي في الخلفية في وضع الاستماع بالأيدي الحرة |
| `OfflineSyncService` / `SyncEngine` | تحميل ومزامنة المجموعات الدراسية المفضلة للتصفح دون اتصال بالإنترنت |
| `QuizletFirebaseMessagingService` | استقبال إشعارات السحابة FCM، تذكيرات المذاكرة، وتنبيهات المعلم |
| `StreakReminderService` | فحص موعد المذاكرة اليومي وإطلاق تنبيه حماية السلسلة (Daily Streak) |
| `WorkManager` (SystemJobService) | جدولة أعمال الصيانة الخلفية، تفريغ سجلات التلمتري، وتنظيف الكاش |

---

## 4. مستقبلات البث (Broadcast Receivers - إجمالي 21 مستقبلاً)

| اسم المستقبل (Receiver) | الحدث المعترض (Action / Trigger) | الوظيفة |
|---|---|---|
| `BootCompletedReceiver` | `BOOT_COMPLETED` | إعادة برمجة منبهات المذاكرة بعد إقلاع الهاتف |
| `NetworkChangeReceiver` | `CONNECTIVITY_CHANGE` | استشعار عودة الإنترنت وبدء مزامنة التقدم المعلق تلقائياً |
| `DailyStudyAlarmReceiver` | `com.quizlet.ALARM_STUDY_REMINDER` | إطلاق إشعار المراجعة اليومية في الوقت المحدد للطالب |
| `AudioHeadsetReceiver` | `ACTION_HEADSET_PLUG` | إيقاف القراءة الصوتية مؤقتاً عند فصل سماعات الأذن |

---

## 5. مزودات المحتوى (Content Providers - إجمالي 7 مزودات)

| اسم المزود (Content Provider) | النطاق / Authority | الغرض والوظيفة |
|---|---|---|
| `FileProvider` | `com.quizlet.quizletandroid.fileprovider` | مشاركة صور المستندات الممسوحة ضوئياً وتصدير البطاقات بأمان |
| `AppStartupProvider` | `androidx.startup.InitializationProvider` | تهيئة المكتبات تلقائياً عند بدء التشغيل دون تأخير الإقلاع |
| `FacebookInitProvider` | Facebook SDK Provider | تهيئة مكتبة تسجيل الدخول بحساب فيسبوك |
| `FirebaseInitProvider` | Firebase Analytics & Crashlytics | التهيئة المسبقة لخدمات السحابة وتتبع الأعطال |