# فهرس الملفات المحلية — Family OS

آخر تحديث: 2026-11-04

## سياسة الحفظ (قرار المستخدم 2026-11-04)
- **الملفات الضخمة** (APKs ومخرجات التفكيك، ~6-8GB) **تبقى محليًا** ولا تُرفع إلى GitHub.
- **المستودع يحتفظ بـ:** فهرس الملفات + بصمات SHA256 لكل ملف، في `docs/family-os/extracted/`.
- تُولَّد الفهارس بسكريبت `~/workspace/tools/family-os/generate_manifests.py` وتُدفع للمستودع **عند اكتمال التفكيك** (التفكيك جارٍ حاليًا — أي فهرس الآن سيكون ناقصًا).

## حزم التطبيقات (الأصل)
- **الموقع:** `~/workspace/apks/` (~590MB)
- **المحتوى:** أحدث نسخ التطبيقات الثمانية — 5 ملفات APK مستقلة (familywall، famisafe، life360، qustodio، telegram) + 3 حزم XAPK مقسّمة (muslim-pro، bark، quizlet)، كلها موثقة ومُتحقق منها. التفاصيل في [apps.md](apps.md).

## مخرجات التفكيك
- **الموقع:** `~/workspace/rework/<app>/` (التطبيقات الثمانية كلها لها مجلدات — التفكيك جارٍ في المحادثة الرئيسية)
- **المحتوى:** مخرجات `apktool` (الموارد والـ manifest) ومخرجات `jadx` (الشيفرة المصدرية) لكل تطبيق.
- **في المستودع:** `extracted/manifest-<app>.sha256` (فهرس + بصمة لكل ملف) و`extracted/summary-<app>.md` (ملخص) — تُنشر عند الاكتمال.

## سلسلة أدوات الهندسة العكسية
- **الموقع:** `~/tools`
- **المحتوى:** Temurin JDK 21.0.13، Ghidra 12.1.4، jadx 1.5.6 CLI + jadx-headless-mcp 0.7.1، apktool 3.0.3، platform-tools 37.0.1 (adb)، androguard 4.1.4، REA 6.8.0. البيئة محفوظة في `~/.bashrc` و`~/tools/rea-env.sh`.

## مساحة عمل الهدف
- **الموقع:** `~/workspace/goals/family-os/`
- **المحتوى:** `GOAL.md` (ملاحظات الإعداد)، مجلدات `files/` و`hidden_files/` و`agent_notes/` و`briefs/`.

## هذا التوثيق في GitHub
- **الموقع:** `docs/family-os/` في مستودع `Bassam-mohammed-alqaeadi/family-os-v2` (الفرع `main`).
- **المحتوى:** الهدف، سجل القرارات، خارطة الطريق، جرد التطبيقات، وهذا الفهرس، وفهارس الملفات المستخرجة.
