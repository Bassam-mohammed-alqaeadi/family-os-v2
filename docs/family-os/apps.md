# التطبيقات الثمانية — الجرد والحالة

آخر تحديث: 2026-11-04 (اكتمل الاستخراج). جميع النسخ أدناه هي **أحدث النسخ** (نُزّلت من APKPure بتاريخ 2026-11-04، ~590MB إجمالًا).

## حالة الاستخراج: مكتمل ✅ 8/8
انتهى `apktool` (الموارد) و`jadx` (الشيفرة) لكل التطبيقات الثمانية. أخطاء jadx هي إخفاقات
على مستوى الكلاس الواحد (طبيعية في التطبيقات المشوّشة: 0.04%–2% من الكلاسات) ولا تمنع الاستخدام.

| # | التطبيق | الحزمة | ملفات Java | أخطاء jadx | الحالة |
|---|---|---|---|---|---|
| 1 | Muslim Pro | `com.bitsmedia.android.muslimpro` | 17,240 | 19 | ✅ مكتمل |
| 2 | Bark Parental Controls | `cm.pt.barkparent` | 14,216 | 200 | ✅ مكتمل |
| 3 | FamilyWall | `com.familywall` | 14,470 | 21 | ✅ مكتمل |
| 4 | Wondershare FamiSafe | `com.wondershare.famisafe` | 17,110 | 150 | ✅ مكتمل |
| 5 | Life360 | `com.life360.android.safetymapd` | 24,943 | 355 | ✅ مكتمل |
| 6 | Quizlet | `com.quizlet.quizletandroid` | 23,433 | 213 | ✅ مكتمل |
| 7 | Qustodio | `com.qustodio.family.parental.control.app.screentime` | 13,628 | 135 | ✅ مكتمل |
| 8 | Telegram | `org.telegram.messenger` | 10,362 | 148 | ✅ مكتمل |

**إجمالي الملفات المستخرجة:** ~6-8GB في `~/workspace/rework/<app>/` (تبقى محليًا بقرار المستخدم؛
الفهارس والبصمات تُنشر في `docs/family-os/extracted/` عند الطلب).

## الخطوة التالية
تقارير الهندسة العكسية لكل تطبيق (المرحلة 2 من [roadmap.md](roadmap.md)) — تُنفَّذ في المحادثة الرئيسية.

## أدوار التطبيقات في المنصة الموحدة (مبدئي)
- **الأمان والحماية:** Bark، FamiSafe، Qustodio، Life360
- **الإدارة والتنظيم العائلي:** FamilyWall
- **التعليم:** Quizlet
- **التواصل:** Telegram
- **الخدمات الدينية/اليومية:** Muslim Pro
- **طبقة الذكاء الاصطناعي:** تعبر كل الوحدات أعلاه (انظر [GOAL.md](GOAL.md))
