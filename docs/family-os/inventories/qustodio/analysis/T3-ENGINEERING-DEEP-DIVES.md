# T3 — التحليلات الهندسية المعمقة: Qustodio Parents App

## المسار A: فك ترميز الجدولة الثلاثي

### A1. قناع البتات (time_restrictions)
```ts
// src/helpers/dates.ts:394-399 — قُرئت
export const isHourState = (timeRanges, weekday, hour) =>
  Boolean((1 << hour) & timeRanges.get(weekday));
```
- كل يوم = عدد صحيح؛ البت `h` المضيء = الساعة `h` مقيدة. 7 أعداد تشفر أسبوعاً كاملاً بدقة الساعة.
- التسلسل: `TimesRecord.serialize` ← `R.zipObj(['mon','tue','wed','thr','fri','sat','sun'], …)` —
  `src/records/profileRules/index.ts:53-58`.
- الحصص `quotas` بالدقائق (افتراضي 1440 = يوم كامل).
- جسم PUT الكامل: `TimeSettingsRecord.serialize` (`:141-164`) — يُرسل لـ
  `PUT v1/accounts/{id}/profiles/{pid}/rules/time_restrictions/{deviceId}` فقط عند `isMultiDevices`.
- خصوصية العرض: اليوم يبدأ **5 صباحاً** — الساعات 0–4 تُنسب لليوم التالي
  (`RestrictedTimesGrid.tsx` — `:HourRow`).

### A2. قيود التقويم (calendar_restrictions)
- الإيقاف المؤقت لمرة واحدة = سطرا iCalendar (RFC 5545):
  `DTSTART:${start}\nRRULE:FREQ=DAILY;COUNT=1;UNTIL=${end}` — `src/ducks/pause/thunks.ts:108-111`.
- `restriction_type: 3` على السلك = PAUSE — `CalendarRestrictionPause.ts`.
- منع تكديس الإيقافات: حذف النشط قبل إنشاء الجديد (`thunks.ts:98-102`).
- **منح الوقت الإضافي** (رد الأب على طلب الطفل) = نفس النقطة POST مع `ExtraTimeRecord{uid, seconds}` —
  `src/ducks/extraTime.ts:130-167`.

### A3. الروتينات (routines)
- `Schedule`: `{weekdays: ['MO'…'SU'], start_time: 'HH:mm', duration_minutes, from_date/to_date, overrides}` —
  صريح ومقروء (`Schedule.types.ts`).
- `Policy`: `{block_type: 0=NONE, 1=LOCK_NAVIGATION, 2=LOCK_DEVICE, app_rules, web_rules,
  counts_towards_daily_time_quota}` (`Policy.types.ts`).
- CRUD كامل: `routines`, `routinesDetails`, `routinesSchedules`, `routinesSchedulesDetails`.

## المسار B: عقد القواعد الموحد

- الحفظ الذري: `modifyProfileRules()` (`src/ducks/profileRules/index.ts:565-600`) —
  PUT time_restrictions (عند الحاجة) ثم `PUT …/profiles/{pid}/rules?app_rules=1` بالسجل الكامل.
- نمط السجل المزدوج `fromPayload`/`serialize` يمنع انحراف العميل/الخادم — `src/records/recordHelpers/`.
- ترشيح الويب: 30 فئة (`category.ts:36-67`) + إجراءات النطاقات `{hostname: 0..3}` +
  `isCategoryList/isAllowUnknownSites/isSafeSearch/isReportBlockedSites`.
- التطبيقات: `action ∈ {0,1,4}` + حصص يومية بالدقائق لكل تطبيق.
- زر الذعر: `{mode: 0/1, contacts: ≤4 (PHONE/EMAIL, PENDING/VERIFIED)}`.
- المكالمات/الرسائل: جهات `{name, phone, mode: ALLOW/BLOCK/REMOVE}`.

## المسار C: مستوى الأوامر والإقران

- المفردات السبع مفكوكة من `MessageV1Interpreter.java` (تطبيق الطفل — نظرة مصرح بها):
  `update_location` (إبلاغ فوري)، `update_policy` (سحب القواعد)، `update_settings`،
  `disable_panic_mode`، `enable_logging` (ثوانٍ، افتراضي 604800)، `upload_logs`، `update_application`.
- الأب يرسل أمرين فقط مباشرة: `POST …/devices/{uid}/notifications {name: 'update_location'|'disable_panic_mode'}` —
  `src/ducks/devices.ts:287-327`، مع منع ارتداد 8 ثوانٍ.
- الباقي يطلقه **الخادم** (بعد `PUT rules` مثلاً) — الأب لا يستدعي `pushNotification` لها.
- الإقران: `sendDownloadLink` → تسجيل ذاتي للجهاز → ربط يدوي
  `POST profiles/{pid}/devices {user_uid, mid}`؛ الفك: `POST devices/{uid}/profiles [{profile_id: null, user_uid}]`.
- `onboarding_token`: معرَّف بلا مستدعاة — **كود ميت** (صفر QR أيضاً).
- التوقيع في المفسّر شكلي (`length() > 0`) — الأصالة من FCM؛ Family OS يضيف HMAC.

## المسار D: الشبكة والملاحظة

- 95 مجموعة نقاط في `QApi` (`src/lib/qapi.ts`) — v1 بالأرقام، v2 بالـ UIDs.
- OAuth2: `POST /v1/oauth2/access_token` (form-urlencoded) + تجديد تلقائي عند 401 + تعطيل عند فشل التجديد.
- بيانات العميل لكل منصة من `qinit.tenant.parents_app.platforms.*` (`helpers/globals.ts`).
- الترويسات: `Qustodio-Client`، `Parent-Device-Id`، `Parent-Device-Action: update-last-seen` (يومياً).
- التنبيهات تُسحَب: `notification_center/items` (15/صفحة، TTL 10s) + `unread_count` + `mark_as_viewed`؛
  التصنيف `NotificationType` (1-8) يوجَّه كل نوع لبطاقته.
- FCM الوارد على الأب عرضي فقط (`deep_link`/`pn_type` → مودال/مسار) — لا مفردات أوامر.
- التخزين: localStorage بنص صريح (الرموز!) — يُنقل لمخزن آمن.
- الغيابات المثبتة: صفر ذكاء على الجهاز، صفر WebSocket، صفر SQLite، صفر QR.
