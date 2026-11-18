# بحث S1-06: آليات المهام والتقويم والروتين العائلي في التطبيقات المرجعية

**التاريخ:** 2026-11-06
**المنهج:** قراءة مباشرة للكود المفكك (`~/workspace/rework/<app>/jadx-out/sources/` + `apktool-out/smali*`) والفهارس المستخرجة (`docs/family-os/extracted/manifest-<app>.sha256.*`) ومواصفة الفرع القديم S1-06 (مرجع فقط).
**الخلاصة الصادقة مقدماً:** التطبيق الوحيد الذي فيه مهام عائلية حقيقية هو **FamilyWall**. لا تطبيق آخر فيه مهام/أعمال منزلية (chores) إطلاقاً. وكلمة "روتين" في Qustodio وFamiSafe تعني **قواعد حظر شاشة مجدولة** لا مهام. ولا تطبيق يتحقق آلياً من إنجاز مهمة، ولا تطبيق يربط المهام بنقاط أو بوقت شاشة.

---

## 1. FamilyWall: القوائم والمهام المشتركة — الآلية الوحيدة الحقيقية

### 1.1 النموذج (موثّق من الكود المفكك نفسه، لا من إعادة البناء فقط)

**المصدر الأساسي:** `rework/familywall/apktool-out/smali_classes9/com/jeronimo/fiz/api/task/` — `TaskBean.smali`، `TaskListBean.smali`، `TaskInputBean.smali`، `TaskSyncBean.smali`، `ITaskApi.smali` + `rework/familywall/jadx-out/sources/com/jeronimo/fiz/api/task/` (`AssigneeBean.java`، `RecurrencyEnum.java`، `TaskListTypeEnum.java`، `TaskSuggestionBean.java`، `TaskListSettingsBean.java`).

**القائمة (`TaskListBean`):**
- `name` + `description` + `color` + `emoji` + `taskListType` من `TaskListTypeEnum` = ‏`TODOS` / `SHOPPING_LIST` / `OTHER` فقط (لا نوع "مهام أطفال" ولا "أعمال منزلية").
- مشاركة: `sharedMemberIds` (Set) أو `sharedToAll` (كل العائلة) + `rights` من نوع `FizRightBean` (حقوق لكل قائمة).
- عدّادات: `totalTaskNumber` / `remainingTaskNumber` (محسوبة لا مخزنة كنقاط).
- ترتيب: `sortingIndex` (long) + `pinSortingIndex` (للقوائم المثبّتة)؛ والترتيب الكسري `position REAL` في مخطط `local_db_schema.sql` هو **مكافئ مُعاد هندسته** لهذه الآلية، لا حقل أصلي.
- `alexa` (Boolean): تكامل مع أليكسا. `completedHidden` (إخفاء المنجز). `taskCategoriesHidden`.
- `clientOpId`: معرّف عملية العميل (لمنع التكرار عند المزامنة دون اتصال).

**المهمة (`TaskBean`):**
- `complete` (Boolean) + `completedDate` (Date): الإنجاز **علامة بوليانية يضعها أي شخص بنفسه** مع تاريخ — لا حقل موافق، لا حقل تحقق، لا حقل نقاط.
- `assignee` (Set من `AssigneeBean{accountId}`): **إسناد لعدة أشخاص** لا لشخص واحد.
- `dueDate` (في `TaskInputBean`) + `quantity` (Float) + `unit` (String): الكمية/الوحدة (نمط قوائم التسوق).
- `recurrencyDescriptor` (من حزمة الأحداث): تكرار المهمة — انظر 1.3.
- `reminder` (من نوع `IReminder`): تذكير مرتبط بالمهمة — انظر §4.
- `taskCategoryId` + `oldCategories`: تصنيفات.
- طبقة اجتماعية: `comments` (SortedSet) + `medias` (List) + `pictureURIs` + `moodMap` (Map) + `moodStarShortcut` (تفاعلات مزاجية/نجمة).
- `lastAction` (UserActionEnum) + `lastActionAuthor` + `lastActionDate`: سجل آخر إجراء ومن قام به.
- `sortingIndex` (long): ترتيب المهمة داخل القائمة.

**واجهة العمليات (`ITaskApi.smali`) — كاملة:**
- `create(text, dueDate, assignees, reminder)` / `create2(TaskInputBean, files)` / `update(...)` / `update2(...)` / `delete(id)`.
- `markCompleted(metaId, Boolean, Date)` + `metamark(ids[], Boolean)` (تعليم جماعي): **الإنجاز والتراجع عنه بنفس الدالة — بلا أي موافقة.**
- `move(...)` (نقل مهمة بين قائمة/تصنيف) / `moveList(...)` / `pinList(id, Boolean)` / `duplicatelist(id)` / `closeList()`.
- `createList(...)` / `updateList(...)` / `deleteList(...)` / `getTaskLists()` / `restoresystemlist()`.
- اقتراحات: `getSuggestedList()` / `getTaskSuggestions(type, ...)` / `getTaskSuggestionsWithCategory(...)` / `respondToSuggested(id, Boolean)` — **اقتراحات عناصر من الخادم يقبلها المستخدم أو يرفضها** (`TaskSuggestionBean{value, categoryId, alternates}`).
- مزامنة: `listforSync(syncToken, date)` → ‏`TaskSyncBean{date, deletedIds, updatedCreated, syncToken, isSync}` — مزامنة دلتا برمز.
- تصنيفات: `putTaskCategory(...)` / `getTaskCategory(...)` / `listTaskCategory(...)` / `deleteTaskCategory(...)`.
- إعدادات: `getSettings()` → ‏`TaskListSettingsBean{taskListSorting}`.

### 1.2 الإسناد والإنجاز والترتيب — الحكم النهائي

| السؤال | الجواب من الكود |
|---|---|
| الإسناد | نعم — مجموعة مسندين (`Set<AssigneeBean>`)، أو "للجميع" (`toAll`)، أو "بلا إسناد" (`common_assignee_none`). نص واجهة مؤكد: "If a task is assigned to a member, it will be displayed using the member's color" + `common_assignee_all` = Everyone. |
| الإنجاز | **ذاتي بالكامل**: من ينجز يعلّم `complete=true` مع التاريخ؛ و`completedByMemberId` يُسجَّل. لا مراجعة ولا اعتماد. |
| الترتيب | `sortingIndex` + سحب وإفلات + تثبيت (`pinList`) + فرز (`TaskSortingEnum` / `TaskListSortingEnum`). |
| نقاط؟ | **لا — صفر.** لا حقل نقاط ولا مكافأة ولا `reward` ولا `point` في أي ملف من حزمة المهام (بحث نصي كامل في `smali_classes7/com/familywall/app/task/` أعاد صفر نتيجة ذات صلة). |
| موافقة أب؟ | **لا — صفر.** كلمة "approved" الوحيدة في حزمة المهام هي `mRecurrentChangeApproved` في `TaskDetailActivity` — وهي علامة واجهة تعني "وافق المستخدم على تطبيق التعديل على سلسلة المهمة المتكررة كلها أم على نسخة واحدة" — لا علاقة لها باعتماد الإنجاز. |
| تحقق آلي؟ | **لا.** لا تحقق إطلاقاً. |

### 1.3 التقويم والروتين في FamilyWall (ملحق بالمهمة نفسها)

- **الأحداث (`EventBean`):** `allDay`، `attendeeIds`/`attendees` (Set)، `eventType`، `isPrivate`، `isToAll`، `eventMasterId` (الحدث الأصل للسلسلة المتكررة)، `externalImportId`، `color`/`colorBean`، `emoji`، `birthDateNoYear` (لأعياد الميلاد بلا سنة).
- **التكرار (`RecurrencyDescriptor`):** نموذج iCalendar كامل — `rrule` (String) + `byDay` + `byMonthDay` + `interval` + `endDate` / `endOccurence` + `exdate` (استثناءات) + `rdate`؛ و`RecurrencyEnum` = ‏`NONE / YEARLY / MONTHLY / WEEKLY / DAILY / DAYWEEK / BIWEEKLY / SEMI_MONTHLY`.
- **التقاويم (`CalendarBean`):** `type` (CalendarTypeEnum)، `url` (اشتراك iCal خارجي)، `reminderActivated` (تذكير مفعّل للتقويم)، مشاركة `sharedMembersId`/`sharedToAll` + `rights`.
- **الجدول المدرسي (`TimetableBean` + جدول `school_timetables`):** حصة/يوم/مادة/معلم/غرفة/وقت + دورة أسبوعية `WEEK_A`/`WEEK_B`.
- **المناسبات (`family_milestones`):** أعياد ميلاد/ذكرى سنوية + `reminder_days_before` (افتراضي 7).
- **الوجبات (`meal_plans`):** تخطيط وجبات أسبوعي + طبّاخ (`cook_member_id`).
- **اشتراكات تقاويم خارجية:** Google / Outlook / Apple iCal عبر `webcal`/`.ics` (جدول `external_calendar_subscriptions`).
- **مزامنة:** محرك Sync Adapter + `listforSync` برمز مزامنة؛ والوثيقة المستخرجة (مسار قديم محذوف من الفرع — Q-172: كان `benchmarks/extracted/familywall/04_extracted_algorithms/calendar_recurrence_engine.kt`؛ والتحقق من الشجرة المفككة محلياً `~/workspace/rework/familywall/` + فهرس `docs/family-os/extracted/manifest-familywall.sha256.*`) هي **إعادة هندسة نظيفة بصيغة Family OS** (حزمة `com.familyos.calendar.engine`) لمحرك توليد نسخ RRULE — المنطق (تثبيت يوم البداية في الشهري/السنوي، حساب `count` من البداية الفعلية، استثناءات، أحداث عابرة لمنتصف الليل) سليم وقابل لإعادة الاستخدام، لكن الملف نفسه ليس كود FamilyWall حرفياً.

---

## 2. FamiSafe وQustodio: لا مهام إطلاقاً — "الروتين" = قواعد حظر شاشة

### 2.1 Qustodio — محرك الجداول والروتين

**المصدر (مسار قديم محذوف من الفرع — Q-172):** كان `benchmarks/extracted/qustodio/04_extracted_algorithms/screen_time_and_app_blocker.kt` (مستخرج من `src/businessLogic/routines/routines.ts` + `src/ducks/familyPause/pause.ts`)؛ والتحقق من الشجرة المفككة محلياً `~/workspace/rework/qustodio/` + فهرس `docs/family-os/extracted/manifest-qustodio.sha256.*`؛ و`05_data_models_and_schemas/offline_enforcement_rules.md` + `schema_catalog.md`.

- `RoutineRecord{uid, name, type, isEnabled, isPaused, blockedAppCategories, allowedAlwaysApps}` حيث `RoutineType` = ‏`ROUTINE_TYPE_BLOCKED / BEDTIME / SCHOOL / STUDY / CUSTOM`.
- `ScheduleEvent{uid, routineUid, routineName, day, startTime "HH:mm", durationMinutes, startWeekMinutes, endWeekMinutes}` — **حساب أسبوع دائري**: الدقيقة داخل الأسبوع 0–10080 (`day.weekOffsetMinutes + دقائق اليوم`)، مع كشف تعارضات بين الفترات.
- **تسلسل حسم التعارضات (موثّق في الملخص التنفيذي سطر 136–137):** وقت النوم (قفل شامل) > وقت الدراسة (حظر ترفيه) > الحصة اليومية.
- التخزين دون اتصال: Firestore SQLite cache يحفظ `routines/{ruid}` و`ScheduleDto` محلياً؛ والفرض يعمل بلا إنترنت؛ وكشف عبث بالساعة (ساعة مزدوجة).
- **لا مهمة، لا إسناد، لا إنجاز، لا نقاط.** "روتين الدراسة" (STUDY) قاعدة حظر تطبيقات في وقت الدراسة — لا قائمة واجبات.

### 2.2 FamiSafe — محرك الجدول الذكي

**المصدر (مسار قديم محذوف من الفرع — Q-172):** كان `benchmarks/extracted/famisafe/04_extracted_algorithms/screen_time_and_smart_schedule_engine.kt` (مستخرج من `com.wondershare.famisafe.parent.screenv5.screenlimit.*` + `.../schedule.*` + `.../supervised.block.*`)؛ والتحقق من الشجرة المفككة محلياً `~/workspace/rework/famisafe/` + فهرس `docs/family-os/extracted/manifest-famisafe.sha256.*`.

- `TimeWindow{id, name, startTime, endTime, activeDaysBitmask (7 بت)، associatedGeofenceId?, isEnabled}` — نوافذ متكررة: نوم/مدرسة/**واجب منزلي (Homework)** + دعم الفترات العابرة لمنتصف الليل.
- ⚠️ "Homework" هنا **نافذة زمنية تحظر الترفيه أثناء الواجب** — ليست مهمة واجب منزلي ولا قائمة مهام.
- `DailyScreenQuota{dayOfWeek, allowedMinutes, bonusMinutesApproved}` + `LockReason` = ‏`NONE / DAILY_LIMIT_EXCEEDED / SCHEDULED_BEDTIME / SCHEDULED_SCHOOL_TIME / GEOFENCE_RESTRICTION / INSTANT_MANUAL_BLOCK`.
- **طلب تمديد الوقت:** الطفل يطلب (+15 دقيقة) والأب يوافق بدفع فوري — `approveExtensionRequest(requestedMinutes)` يضيف إلى `grantedBonusMinutes`؛ والمجموع المسموح = الحصة + المنح؛ ويُصفَّر المنح يومياً (`resetDailyBonus`). هذا طلب وقت لا مهمة.
- **جدولة مشروطة بالموقع الجغرافي:** قفل الهاتف أثناء وجوده في المدرسة (Geofence-Conditioned Schedules).
- **لا مهام، لا إسناد، لا إنجاز، لا نقاط.** بحث `chore` في شجرة FamiSafe المفككة أعاد إيجابيات كاذبة فقط (Choreographer/CoordinatorLayout).

---

## 3. باقي التطبيقات: ما فيه "chores" أو "tasks" أو "routines" عائلية؟

| التطبيق | النتيجة | الدليل |
|---|---|---|
| **Bark / Bark Kids** | لا مهام إطلاقاً. بحث `chore`/`task` في `strings.xml` = صفر نتائج ذات صلة. | `rework/bark/apktool-out/res/values/strings.xml` |
| **Life360** | لا مهام. "Check-in" ميزة أمان (عضو يسجّل وصوله/اطمئنان، والعائلة تُشعَر، وجهات الطوارئ تُنبَّه عند عدم الاطمئنان) — ليست مهمة. "Morning check-in" أعلام ميزة (`MorningCheckinEnabled` + `WakeSignalCareRoutineReadEnabled`) ضمن عائلة الاطمئنان الصباحي، لا روتين مهام. | `rework/life360/apktool-out/res/values/strings.xml` (`check_in_button_text`، `ca_card_msg_5`) |
| **Telegram** | رسائل مجدولة + تذكيرات في "الرسائل المحفوظة" — ميزة مراسلة، لا مهام عائلية ولا إسناد ولا إنجاز. | `rework/telegram/jadx-out/sources/org/telegram/ui/oo.java` (ScheduleMessage) |
| **Quizlet** | تذكيرات دراسة فقط: "Get reminders when it's time to review or study a particular set… based on your test date and study activity" — تذكير تعليمي فردي، لا مهام عائلية. | `rework/quizlet/apktool-out/res/values/strings.xml` (`learn_notification_channel_description`) |
| **Muslim Pro** | شاشة "مهام اليوم" (Today/tasks) بلا كود عميل موثّق: الوحيد الموثّق هو `CheckInsDto{date, checkedIn}` + `StreakData` + `Milestones` — **تسجيل حضور (check-in) ذاتي يومي** (صلاة/قرآن/أذكار) مع سلسلة أيام. محتوى المهام نفسه خادم-المنشأ ولم يُعثر عليه في الكود المفكك — **لا أستطيع تأكيد تفاصيله**. لا إسناد ولا موافقة ولا نقاط موثّقة. | `rework/muslim-pro/jadx-out/sources/com/bitsmedia/android/today/data/remote/CheckInsDto.java` |
| **FamiSafe Jr / Qustodio Kids / Bark Kids** | لا مهام. "task" فيها = مهام خلفية برمجية (TimerTask/AsyncTask). `RequestMsgFragmentDialog` في FamiSafe Jr هو حوار طلب (وقت إضافي) لا مهمة. | بحث نصي في `rework/famisafe-jr/.../com/wondershare/` |

**الحصيلة:** من 11 تطبيقاً مفككاً، تطبيق واحد فقط (FamilyWall) يملك نظام مهام عائلي. وكلمة "روتين" في تطبيقين تعني جدولة حظر شاشة.

---

## 4. التذكيرات والإشعارات المرتبطة بالمهام

### FamilyWall (الوحيد الذي يملك تذكيرات مهام)
- **النموذج (`ReminderBean`):** `alarmId` + `localId` + `reminderType` من `ReminderTypeEnum` = ‏`NONE / SNOOZE / EMAIL` + `reminderUnit` من `ReminderUnitEnum` = ‏`DAY / HOUR / MINUTE` + `reminderValue` (عدد صحيح — مثال: 30 دقيقة قبل). التذكير مشترك بين المهام والأحداث (`IHasReminder` / `HasReminderDelegate`).
- **التسليم:** `ReminderBroadcastReceiver` + `ReminderJobIntentService` في الـ Manifest، مع إذنَي `SCHEDULE_EXACT_ALARM` + `USE_EXACT_ALARM` — **منبّهات دقيقة محلية** (AlarmManager) لا دفع خادم فقط.
- **الواجهة:** `ReminderActivity` (ابن `EventEditActivity`) + `MealplannerReminderActivity` (تذكيرات الوجبات).
- **ودجت الشاشة الرئيسية:** `TasklistWidgetReceiver` (ودجت قوائم المهام) + `MealplannerWidgetReceiver` — المهام ظاهرة من الشاشة الرئيسية.
- **ملاحظة:** نوع التذكير `EMAIL` موجود في النموذج — تذكير بريدي، لا إشعار دفع فحسب.

### الآخرون (تذكيرات ليست للمهام)
- **Qustodio:** تحذير قبل 5 دقائق من نفاد الحصة + إشعار طلب وقت إضافي للأب (من بحث S1-05) — تذكيرات وقت شاشة.
- **FamiSafe:** دفع فوري للأب عند طلب التمديد (+15 دقيقة) — إشعار طلب وقت.
- **Quizlet:** تذكيرات دراسة مبنية على تاريخ الاختبار ونشاط الدراسة.
- **Muslim Pro:** تذكيرات أوقات الصلاة (ليست مهام إسناد).

---

## 5. ما الذي لا يوجد إطلاقاً (بحث سلبي موثّق)

1. **لا تطبيق يتحقق آلياً من إنجاز مهمة.** FamilyWall يكتفي بعلامة بوليانية ذاتية؛ والباقون لا مهام لديهم أصلاً. لا تحقق بالصور، لا تحقق بالموقع، لا تحقق بالذكاء — صفر في كل الأشجار الـ 11.
2. **لا تطبيق يربط المهام بنقاط أو بوقت شاشة.** لا حقل نقاط في أي نموذج مهام؛ ولا آلية "أنجزتَ مهمة ← كسبتَ دقائق". أقرب شيء هو **طلب وقت إضافي** (Qustodio Extra Time + FamiSafe +15 دقيقة بموافقة الأب) — والمنح فيه يدوي من الأب لا مقابل مهمة.
3. **لا تطبيق فيه "أعمال منزلية" (chores) كمفهوم مستقل.** بحث `chore` في كل الأشجار = إيجابيات كاذبة فقط (Choreographer/CoordinatorLayout).
4. **لا تطبيق فيه موافقة أب على إنجاز مهمة.** الإنجاز في FamilyWall ذاتي؛ وفي مواصفة الفرع القديم كان الاعتماد يدوياً من الأب (BR-TSK-001) — تصميم قديم لا استخراج.
5. **لا تطبيق يخصّص مهاماً للأطفال مع قيمة نقطية.** حقل `reward_stars` في مواصفة الفرع القديم S1-06 تصميم قديم لا أصل مفكك له.

---

## 6. الخلاصة الصادقة: ما يُعاد استخدامه في S1-06، وما هو تركيب جديد

### قابل لإعادة الاستخدام فعلياً (من FamilyWall — موثّق بالكود)

| الآلية | المصدر | أين تُستخدم في S1-06 |
|---|---|---|
| قوائم مشتركة بأنواع (TODO/SHOPPING/أخرى) + مشاركة لأعضاء أو للجميع + حقوق لكل قائمة | `TaskListBean` + `ITaskApi` | نموذج القوائم/المهام |
| إسناد لعدة أشخاص + "للجميع" + "بلا إسناد"، وعرض بلون العضو المسند | `AssigneeBean` + `TaskInputBean.assigneeIds` + نص الواجهة | الإسناد |
| إنجاز ذاتي بعلامة + تاريخ + من أنجز (`complete`/`completedDate`/`completedByMemberId`) | `TaskBean` + `markCompleted` | حالة المهمة (كخطوة تسليم أولى — لا كاعتماد نهائي) |
| ترتيب بالسحب والإفلات + تثبيت + فرز + نقل بين القوائم | `sortingIndex` + `pinSortingIndex` + `move`/`moveList` + `TaskSortingEnum` | ترتيب المهام |
| موعد نهائي + كمية/وحدة + تصنيفات + تعليقات + وسائط | `TaskInputBean` + `TaskBean` | حقول المهمة |
| تكرار RRULE كامل (يومي/أسبوعي/شهري/سنوي + استثناءات) مشترك بين المهام والأحداث | `RecurrencyDescriptor` + `RecurrencyEnum` | تكرار المهام والمواعيد |
| تذكير موحّد (قيمة + وحدة يوم/ساعة/دقيقة + نوع) بمنبّه دقيق محلي | `ReminderBean` + `ReminderBroadcastReceiver` + `ReminderJobIntentService` | تذكيرات المهام |
| اقتراحات عناصر من الخادم (قبول/رفض) | `TaskSuggestionBean` + `respondToSuggested` | اقتراحات مهام |
| مزامنة دلتا برمز + معرّف عملية عميل لمنع التكرار | `TaskSyncBean` + `clientOpId` | المزامنة دون اتصال |
| تقويم عائلي: أحداث + حضور + استيراد iCal + جدول مدرسي + مناسبات بتذكير مسبق + وجبات | `EventBean` + `CalendarBean` + `TimetableBean` + `family_milestones` + `meal_plans` | التقويم المشترك |

### قابل لإعادة الاستخدام من Qustodio/FamiSafe (جدولة لا مهام)

| الآلية | المصدر | أين تُستخدم |
|---|---|---|
| روتين أسبوعي دائري (دقيقة الأسبوع 0–10080) + كشف تعارض + تسلسل نوم > مدرسة > حصة | Qustodio `RoutineScheduleEngine` | جدولة الروتين في S1-06 (كقاعدة زمنية للمهام المتكررة) — مع التنبيه: هذه آلية حظر لا مهام |
| نوافذ زمنية متكررة بقناع أيام 7 بت + شرط موقع جغرافي + طلب تمديد بموافقة الأب | FamiSafe `TimeWindow` + `approveExtensionRequest` | النوافذ المتكررة + ربط المهام بالنوافذ الزمنية |

### تركيب جديد من عندنا (لا سابقة له في أي تطبيق)

1. **التحقق بالذكاء (Q-110):** لا تطبيق يتحقق من الإنجاز إطلاقاً — التحقق الآلي (صورة/صوت/إثبات) ثم الإيداع هو اختراعنا بالكامل. حتى مواصفة الفرع القديم اكتفت باعتماد يدوي من الأب (BR-TSK-001).
2. **عقد الكسب العام (Q-118):** حدث كسب عام (`source_system` + المهمة + النقاط) تقبله المحفظة من أي نظام (تعليم/دين/غيرهما) — لا نظير له؛ ففي FamilyWall المهام معزولة عن أي مكافأة.
3. **ربط المهام بالنقاط/وقت الشاشة:** `reward_stars` + حدث `tasks.completed` → إيداع في S1-05 → صرف كوقت لتطبيق محدد — الحلقة الكاملة تركيب جديد (راجع بحث S1-05).
4. **حالة المهمة ذات الأربع مراحل** (`PENDING → SUBMITTED_BY_CHILD → APPROVED → إيداع`) — تصميم الفرع القديم، لا استخراج؛ وFamilyWall يعرف مرحلتين فقط (معلّقة/منجزة ذاتياً).
5. **فئات المهام** (منزل/مدرسة/صلاة وقرآن/عناية ذاتية) + **قيمة نقطية افتراضية** (slider 5/10/15/25) — تصميم الفرع القديم، لا أصل مفكك.
6. **أفق توليد RRULE (3 أشهر مقدماً، تجديد شهري)** (BR-TSK-002) — قاعدة تشغيلية من الفرع القديم، لا استخراج.

### تنبيهات صدق للمواصفة

- مخطط `local_db_schema.sql` في FamilyWall موسوم في ترويسته "Reconstructed / Re-engineered for Family OS" — **أُعيد بناؤه**؛ لكن كل آلية جوهرية فيه (قوائم/عناصر/إسناد/إنجاز/موعد نهائي/ترتيب) **تم التحقق منها في الكود المفكك الأصلي** أعلاه. الاستثناء: `position REAL` الكسري مكافئ مُعاد هندسته لـ `sortingIndex` الطويل الأصلي.
- ملف `calendar_recurrence_engine.kt` إعادة هندسة نظيفة (حزمة `com.familyos`) لا كود FamilyWall حرفياً — المنطق سليم وقابل للاستخدام، والتسمية لا تعني استخراجاً حرفياً.
- مواصفة الفرع القديم S1-06 مبنية على TypeScript (D-005 الملغاة) — تُبنى S1-06 من جديد (G-009) وتُؤخذ منها الأفكار لا القرارات.
- Muslim Pro: محتوى "مهام اليوم" غير موثّق في الكود المفكك — لا يُبنى عليه ادعاء.
