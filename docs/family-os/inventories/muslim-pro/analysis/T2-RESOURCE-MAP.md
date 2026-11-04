# خريطة الموارد المعمارية — Muslim Pro (T2 Resource Map)

> **المعرف:** `T2-MP-MAP-001`
> **التطبيق:** Muslim Pro (`muslim-pro`)
> **عدد الموارد:** 18 (`MP-RES-000001` إلى `MP-RES-000018`)

---

## كتالوج الموارد

| المعرف | الاسم | الفئة | العمق | استراتيجية إعادة الاستخدام |
|---|---|---|---|---|
| MP-RES-000001 | محرك الحساب الفلكي (Astronomical Engine) | Algorithms | T3 | **انسخ فوراً** — port من adhan، مكتمل ومجرّب |
| MP-RES-000002 | هرميات طرق الحساب (22 Convention) | Algorithms | T3 | انسخ — MWL/ISNA/Egypt/Makkah... جاهزة |
| MP-RES-000003 | نموذج GeoLocation | Data Models & Schemas | T1 | انسخ كما هو لأي خدمة موقع |
| MP-RES-000004 | فهرس مصادر precalc + Room | Synchronization & Offline | T2 | كيّف — فهرس مناطق اليمن/الخليج أولاً |
| MP-RES-000005 | نموذج AutoSettingDto (إعدادات لكل دولة) | Data Models & Schemas | T2 | انسخ — السيرفر يدفع، الجهاز يحسب |
| MP-RES-000006 | نظام الأذان (كتالوج + Notification.sound) | Engines & Services | T3 | انسخ — أبسط وأوثق معمارية |
| MP-RES-000007 | حزمة موثوقية التنبيهات | Android Platform Integration | T3 | انسخ — `setExactAndAllowWhileIdle` + إعادة الجدولة |
| MP-RES-000008 | محرك القبلة (bearing + حساسات) | Algorithms | T3 | انسخ المعادلة حرفياً |
| MP-RES-000009 | نموذج التاريخ الهجري (ملف سيرفر) | Data Models & Schemas | T2 | **مرجع سلبي** — استبدله بخوارزمية Kuwaiti على الجهاز |
| MP-RES-000010 | نظام حزم المحتوى دون-اتصال | Synchronization & Offline | T3 | انسخ شكل `QuranRecitationDto` حرفياً |
| MP-RES-000011 | مزامنة حالة المستخدم (Firestore DTOs) | Synchronization & Offline | T2 | انسخ — عمود تقدم الأبناء |
| MP-RES-000012 | تشفير الأصول المضمنة المخصص | Security & Cryptography | T2 | كيّف الفكرة — حماية المحتوى المدفوع |
| MP-RES-000013 | خدمات الصوت الأمامية (MediaPlayer) | Engines & Services | T2 | مرجع — 5 خدمات ترث `BaseMediaPlayer` |
| MP-RES-000014 | مزامنة الحفظ (per-ayah) | Features & Business Rules | T2 | كيّف — تتبع لكل آية |
| MP-RES-000015 | محتوى QUL مفتوح المصدر | Features & Business Rules | T1 | **اعتمد قانونياً** — يلغي مشكلة IP النص القرآني |
| MP-RES-000016 | الختمة الاجتماعية | Features & Business Rules | T2 | كيّف — نواة مكافآت دينية |
| MP-RES-000017 | RAG الديني (AskAbdullah) | AI & Gamification | T3 | ابنِ وكيل الأب على هذا النمط |
| MP-RES-000018 | عائلة الودجت (18 incl. AI) | Android Platform Integration | T2 | مرجع لبنية ودجت العائلة |

## مخطط العلاقات (نصي)

```
MP-RES-000001 (المحرك الفلكي)
  ├── DEPENDS_ON → MP-RES-000002 (الـ conventions تزوده بالزوايا)
  ├── DEPENDS_ON → MP-RES-000003 (GeoLocation مدخل الموقع)
  └── COMPLEMENTS → MP-RES-000005 (AutoSettingDto يدفع الإعدادات)

MP-RES-000006 (الأذان)
  ├── DEPENDS_ON → MP-RES-000007 (الموثوقية تجدول التشغيل)
  └── DEPENDS_ON → MP-RES-000001 (المواقيت تُشغّل الأذان)

MP-RES-000010 (حزم المحتوى)
  ├── DEPENDS_ON → MP-RES-000012 (الأصول المشفرة داخل الحزم)
  └── COMPLEMENTS → MP-RES-000011 (المزامنة تتبع حالة الحزم)

MP-RES-000017 (RAG)
  ├── DEPENDS_ON → MP-RES-000015 (QUL مصدر النصوص الموثقة)
  └── COMPLEMENTS → MP-RES-000011 (سياق المستخدم يُغني الإجابات)

MP-RES-000004 (precalc-sources) → COMPLEMENTS → MP-RES-000001
MP-RES-000008 (القبلة) → DEPENDS_ON → MP-RES-000003
MP-RES-000016 (الختمة) → DEPENDS_ON → MP-RES-000011
MP-RES-000018 (الودجت) → DEPENDS_ON → MP-RES-000001 + MP-RES-000006
```

**العلاقات المرقمة** (`REL-000062` إلى `REL-000073`): موثقة كاملة في [`relationships.json`](../relationships.json) — 8 من نوع DEPENDS_ON و4 من نوع COMPLEMENTS، كلها `resolved` ومرتبطة بالأدلة.
