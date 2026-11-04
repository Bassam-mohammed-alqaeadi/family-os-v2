# التطبيقات الثمانية — الجرد والحالة

آخر تحديث: 2026-11-04. جميع النسخ أدناه هي **أحدث النسخ** (نُزّلت من APKPure بتاريخ 2026-11-04، ~590MB إجمالًا)، وهي المعتمدة للتفكيك بدل نسخ أكتوبر 2026 الموجودة في `benchmarks/extracted/`.

| # | التطبيق | الحزمة | النوع | الحجم | حالة التفكيك |
|---|---|---|---|---|---|
| 1 | Muslim Pro | `com.bitsmedia.android.muslimpro` | XAPK (base + config splits) | 99M | بدأ — `base.apk` جاهز، jadx لم يبدأ |
| 2 | Bark Parental Controls | `cm.pt.barkparent` | XAPK (base + config splits) | 58M | ⏳ جارٍ — apktool وjadx لهما مخرجات |
| 3 | FamilyWall | `com.familywall` | APK | 83M | ⬜ لم يبدأ |
| 4 | Wondershare FamiSafe | `com.wondershare.famisafe` | APK | 68M | ⏳ جارٍ — apktool وjadx لهما مخرجات |
| 5 | Life360 | `com.life360.android.safetymapd` | APK | 116M | ⬜ لم يبدأ |
| 6 | Quizlet | `com.quizlet.quizletandroid` | XAPK (base + config splits) | 54M | ⏳ جارٍ — apktool وjadx لهما مخرجات |
| 7 | Qustodio | `com.qustodio.family.parental.control.app.screentime` | APK | 75M | ⬜ لم يبدأ |
| 8 | Telegram | `org.telegram.messenger` | APK | 38M | ⏳ جارٍ — apktool وjadx لهما مخرجات |

## أدوار التطبيقات في المنصة الموحدة (مبدئي)
- **الأمان والحماية:** Bark، FamiSafe، Qustodio، Life360
- **الإدارة والتنظيم العائلي:** FamilyWall
- **التعليم:** Quizlet
- **التواصل:** Telegram
- **الخدمات الدينية/اليومية:** Muslim Pro
- **طبقة الذكاء الاصطناعي:** تعبر كل الوحدات أعلاه (انظر [GOAL.md](GOAL.md))

> كل ملف تم التحقق منه (يحتوي `AndroidManifest.xml`). مواقع الملفات المحلية في [artifacts.md](artifacts.md).
