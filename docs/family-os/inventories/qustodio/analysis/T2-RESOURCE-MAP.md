# T2 — خريطة الموارد: Qustodio Parents App

> 20 مورداً معمارياً ووظيفياً (`QUP-RES-000001` … `QUP-RES-000020`) + 14 علاقة (`REL-000700` … `REL-000713`).
> التفاصيل الكاملة (الأوصاف، المراجع، تقييم إعادة الاستخدام) في `resources.json` و`relationships.json`.

## 1. التكامل مع منصة أندرويد

| المعرف | المورد | الجوهر |
|---|---|---|
| QUP-RES-000001 | الغلاف الهجين (Cordova + React SPA) | 5 ملفات أصلية + SPA بـ 94MB؛ خرائط المصدر مشحونة داخل الـ APK |
| QUP-RES-000002 | جسر الروابط العميقة المؤجلة | `QustodioPlugin`: `pendingDeepLink` → حقن `handleOpenURL` عند جهوزية الويب |
| QUP-RES-000003 | خدمة الدفع الثنائية | `QustodioPushNotificationService`: Braze أولاً ثم FCM |

## 2. بنية التطبيق (SPA)

| المعرف | المورد | الجوهر |
|---|---|---|
| QUP-RES-000004 | بنية Redux + Epics + Records | reducers (`ducks/`) + آثار RxJS (`epics/`) + سجلات Immutable بنمط `fromPayload`/`serialize` |
| QUP-RES-000005 | خريطة التوجيه | `src/routes.tsx`: ~60 مساراً تحت `/profiles/:profileId/` |
| QUP-RES-000006 | عميل QApi | `src/lib/qapi.ts`: 95 مجموعة نقاط فوق `fetch` + تحويلات + تخزين مؤقت |

## 3. المصادقة والجلسة

| المعرف | المورد | الجوهر |
|---|---|---|
| QUP-RES-000007 | نظام OAuth2 | `POST /v1/oauth2/access_token` (form-urlencoded) + تجديد تلقائي عند 401 |
| QUP-RES-000008 | بيانات العميل لكل منصة | `qinit.tenant.parents_app.platforms.*.client_id` عبر `getClientCredentials()` |
| QUP-RES-000009 | التخزين المحلي | localStorage فقط — الرموز بنص صريح (يُنقل لمخزن آمن) |

## 4. محركات الجدولة والقواعد

| المعرف | المورد | الجوهر |
|---|---|---|
| QUP-RES-000010 | ترميز قناع البتات الأسبوعي | `isHourState`: 24 بتاً/يوم؛ مفاتيح `mon…sun`؛ اليوم يبدأ 5ص |
| QUP-RES-000011 | عقد time_restrictions | `TimeSettingsRecord`: أقنعة + حصص (دقائق) + أعلام `isLockNavigation/isLockComputer` |
| QUP-RES-000012 | قيود التقويم RRULE | `restriction_type: 3` + `DTSTART…RRULE:FREQ=DAILY;COUNT=1;UNTIL=…` |
| QUP-RES-000013 | محرك الروتينات | روتين ← جداول (`weekdays/start_time/duration_minutes`) ← سياسة (`block_type` 0/1/2) |
| QUP-RES-000014 | نموذج قواعد التطبيقات | `{id, exe, action: 0/1/4, monQuota…sunQuota}` — القيمتان 2/3 غير مدعومتين |
| QUP-RES-000015 | نموذج ترشيح الويب | 30 فئة بمعرفات رقمية + إجراءات النطاقات 0-3 + 5 أعلام |

## 5. الأوامر والإقران والتنبيهات

| المعرف | المورد | الجوهر |
|---|---|---|
| QUP-RES-000016 | مفردات الأوامر السبع | FCM `{message, signature}`: update_location/update_policy/update_settings/disable_panic_mode/enable_logging/upload_logs/update_application |
| QUP-RES-000017 | قناة أوامر الأب | `POST …/devices/{uid}/notifications {name}` + منع ارتداد 8 ثوانٍ |
| QUP-RES-000018 | بروتوكول الإقران | رابط تحميل ← تسجيل ذاتي ← ربط يدوي `POST profiles/{pid}/devices {user_uid, mid}` |
| QUP-RES-000019 | مركز الإشعارات | سحب صفحي (15/صفحة، TTL 10s) + تصنيف `NotificationType` (1-8) |
| QUP-RES-000020 | نموذج المكان الجغرافي | `{uid, name, latitude, longitude, radius: 100, address}` عبر `v2/…/places` |

## 2. العلاقات البينية (14)

| المعرف | من → إلى | النوع | الوصف |
|---|---|---|---|
| REL-000700 | 000006 → 000007 | DEPENDS_ON | كل نقاط QApi تتطلب رموز OAuth2 |
| REL-000701 | 000004 → 000006 | DEPENDS_ON | الـ ducks تستدعي QApi للحفظ/التحميل |
| REL-000702 | 000010 → 000011 | COMPLEMENTS | القناع يُغلَّف في عقد time_restrictions |
| REL-000703 | 000011 → 000006 | DEPENDS_ON | يُرسل عبر `timeLimits.put` |
| REL-000704 | 000012 → 000006 | DEPENDS_ON | يُرسل عبر `calendarRestrictions.post` |
| REL-000705 | 000013 → 000006 | DEPENDS_ON | يُرسل عبر `routines*` |
| REL-000706 | 000014 → 000006 | DEPENDS_ON | يُرسل ضمن `profileRules.put` |
| REL-000707 | 000015 → 000006 | DEPENDS_ON | يُرسل ضمن `profileRules.put` |
| REL-000708 | 000017 → 000016 | COMPLEMENTS | قناة الأب تُغذي مفردات الطفل عبر الخادم |
| REL-000709 | 000018 → 000006 | DEPENDS_ON | الإقران يستخدم نقاط الأجهزة/الملفات |
| REL-000710 | 000019 → 000006 | DEPENDS_ON | السحب عبر `notificationCenterItems` |
| REL-000711 | 000002 → 000005 | COMPLEMENTS | الروابط العميقة تُوجَّه لمسارات التطبيق |
| REL-000712 | 000003 → 000019 | COMPLEMENTS | دفع FCM يُطبَّع ويُوجَّه لمركز الإشعارات |
| REL-000713 | 000008 → 000007 | DEPENDS_ON | بيانات المنصة تُغذي تدفق OAuth2 |
