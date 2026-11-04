# التغطية والفجوات: Qustodio Parents App

> 41 وظيفة موثقة عبر 8 مجالات. مستويات الثقة: **Confirmed Level A** (قُرئ الكود) /
> **Derived Level B** (مستنتج بدليل) / **Partial** (جزئي) / **Not Found** (غائب مثبت بالبحث).

## 1. مؤكدة — Level A (32)

| # | الوظيفة | الدليل |
|---|---|---|
| 1 | ترميز قناع البتات الأسبوعي | `helpers/dates.ts:394` `isHourState` |
| 2 | عقد `time_restrictions` (أقنعة+حصص+أعلام) | `records/profileRules/index.ts:141` |
| 3 | مفاتيح الأيام `mon…sun` | `constants/index.ts:175` |
| 4 | اليوم يبدأ 5 صباحاً في الشبكة | `RestrictedTimesGrid.tsx` |
| 5 | ترميز RRULE للإيقاف المؤقت | `ducks/pause/thunks.ts:108` |
| 6 | `restriction_type: 3` = PAUSE | `CalendarRestrictionPause.ts` |
| 7 | منع تكديس الإيقافات | `ducks/pause/thunks.ts:98` |
| 8 | منح الوقت الإضافي عبر `calendar_restrictions` | `ducks/extraTime.ts:130` |
| 9 | نموذج الروتينات (روتين/جداول/سياسة) | `records/routines/` |
| 10 | مفردات `block_type` (0/1/2) للسياسة | `Policy.types.ts` |
| 11 | نموذج ترشيح الويب (فئات+نطاقات+أعلام) | `records/profileRules/index.ts:223` |
| 12 | 30 فئة ويب بمعرفات رقمية | `records/category.ts:36` |
| 13 | إجراءات النطاقات 0-3 | `constants/index.ts:207` |
| 14 | نموذج قواعد التطبيقات + `action` 0/1/4 | `records/profileRules/index.ts:395` |
| 15 | حصص التطبيقات اليومية (دقائق) | `APP_RULES_WEEKDAYS_KEYS` |
| 16 | نموذج زر الذعر (≤4 جهات) | `PanicRulesRecord` + `PANIC_RULES_MAX_CONTACTS=4` |
| 17 | قواعد المكالمات/الرسائل | `CallsSmsContactRecord` |
| 18 | مسار حفظ القواعد الذري | `ducks/profileRules/index.ts:565` |
| 19 | نمط السجل المزدوج fromPayload/serialize | `records/recordHelpers/` |
| 20 | 95 مجموعة نقاط QApi | `lib/qapi.ts` (عدّ `public x = this.endpoint`) |
| 21 | تدفق OAuth2 + التجديد عند 401 | `lib/qapi.ts:1147,196` |
| 22 | بيانات العميل لكل منصة | `helpers/globals.ts` |
| 23 | ترويسات العميل (`Qustodio-Client`…) | `lib/qapi.ts:120` |
| 24 | مفردات الأوامر السبع (FCM) | `MessageV1Interpreter.java` (الطفل) |
| 25 | أمرا الأب المباشران + منع الارتداد 8s | `ducks/devices.ts:287` |
| 26 | بروتوكول الإقران (رابط+ربط يدوي) | `ducks/devices.ts:496` |
| 27 | مركز الإشعارات المسحوب (15/صفحة) | `ducks/notificationCenter/` |
| 28 | تصنيف `NotificationType` (1-8) | `constants/index.ts:550` |
| 29 | استقبال FCM العرضي على الأب | `ducks/pushService/` |
| 30 | توجيه Braze/FCM الثنائي | `QustodioPushNotificationService.java` |
| 31 | الروابط العميقة المؤجلة | `QustodioPlugin.java` |
| 32 | نموذج المكان الجغرافي | `records/place.ts` |

## 2. مشتقة — Level B (4)

| # | الوظيفة | الأساس |
|---|---|---|
| 33 | الخادم يدفع `update_policy` بعد `PUT rules` | الأب لا يستدعيه + المفسّر يدعمه + سلوك "Fetching Rules" |
| 34 | الطفل يسحب القواعد عبر `deviceRules` | النقطة معرّفة؛ الشكل الدقيق غير مقروء (الطفل مشوَّش) |
| 35 | `overrides` في الجدول = تجاوز التعارضات | الاسم والسياق؛ المستهلك غير مقروء |
| 36 | أولوية الأنظمة الثلاثة للجدولة تُحسَم في الطفل | التعايش في الأب + غياب منطق الأولوية في الأب |

## 3. جزئية — Partial (2)

| # | الوظيفة | الحد |
|---|---|---|
| 37 | `GET v1/sites/classification?hostname=` | النقطة معرّفة؛ الاستدعاء الدقيق من واجهة الاستثناءات لم يُتتبَّع |
| 38 | حمولة `update_application` (`J5.b`) | الأمر معروف؛ بنية الحمولة غير مقروءة |

## 4. غير موجودة — Not Found (3، مثبتة بالبحث)

| # | الغائب | الإثبات |
|---|---|---|
| 39 | ذكاء اصطناعي على الجهاز في الأب | صفر `onnx/tflite/tensorflow` في كل الحزم |
| 40 | إقران بـ QR أو `onboarding_token` حي | صفر `qrcode` + صفر استدعاءات للنقطة (كود ميت) |
| 41 | قناة مباشرة أب↔طفل / WebSocket في الأب | صفر `WebSocket` في المصدر؛ كل شيء عبر السحابة |

## 5. الفجوات الاستراتيجية

1. **تنفيذ الطفل**: كل ما يخص `com.qustodio.qustodioapp` خارج النطاق الأبوي (مشوَّش `A*`) —
   تُستكمل بنظرة الطفل المخصصة عند الحاجة.
2. **شكل `deviceRules` للطفل**: هل هو `ProfileRulesRecord` أم شكل مضغوط؟ يحتاج قراءة الطفل.
3. **توقيت `update_policy`**: الفاصل بين حفظ الأب ووصول الأمر — يحتاج مراقبة شبكية حية.
4. **أسرار `qinit.tenant`**: القيم في ملفات البناء لكل منصة — لم تُستخرَج عمداً.
