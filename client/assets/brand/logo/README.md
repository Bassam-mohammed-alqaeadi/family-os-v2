# شعار «عائلتي» وأيقونة التطبيق

- **الحالة:** مقترح بأمر المالك (Q-398، 2026-11-16) — ينتظر حكمه من الشاشة.
- **القواعد:** `docs/family-os/governance/design-system/brand-and-logo.md` §3 و§4.
- **العرض:** `docs/family-os/governance/phases/phase-1/prototype/brand.html`.

## لا تعدّل ملفات SVG باليد
كل الملفات تُبنى من تعريف واحد:

```
node client/assets/brand/tools/build-brand.mjs
```

الأمر يكتب ملفات هذا المجلد وينسخها إلى `docs/family-os/governance/phases/phase-1/prototype/assets/brand/`.
حدود الاسم محفوظة في `src/wordmark-paths.json`، ويولّدها `tools/extract-wordmark.cjs` من خط IBM Plex Sans Arabic (رخصة OFL 1.1) عند تغيير الخط أو الاسم فقط.

## الملفات
| الاستخدام | الملف |
|---|---|
| الأفقي (رمز + اسم) | `logo-horizontal-ar.svg` · `logo-horizontal-en.svg` |
| الرمز وحده | `logo-symbol.svg` |
| الاسم وحده | `logo-wordmark-ar.svg` · `logo-wordmark-en.svg` |
| أحادي اللون | `…-mono-navy.svg` · `…-mono-white.svg` |
| الداكنة | `…-dark.svg` |
| أيقونة أندرويد التكيفية | `icon/android-adaptive-foreground.svg` + `icon/android-adaptive-background.svg` |
| البديل الكريمي | `icon/android-adaptive-foreground-on-cream.svg` + `icon/android-adaptive-background-cream.svg` |
| أندرويد 13+ (أحادية) | `icon/android-themed-monochrome.svg` |
| iOS | `icon/ios-app-icon.svg` · `icon/ios-app-icon-light.svg` · `icon/ios-app-icon-tinted.svg` |
| الإشعار | `icon/notification-small.svg` |
| شاشة البدء | `icon/splash-light.svg` · `icon/splash-dark.svg` |

## القياسات
- صندوق الرمز 364×337؛ سماكة السقف 52؛ قطر الدائرة 74.
- منطقة الأمان = قطر دائرة واحدة من كل الجهات، وهي مضمَّنة في حدود الملف.
- أصغر حجم: الرمز 24dp، والأفقي بارتفاع 28dp.
