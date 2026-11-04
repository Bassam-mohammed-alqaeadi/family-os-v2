# T2 — خريطة الموارد المعمارية: Qustodio Kids

> 19 مورداً (`QUK-RES-000001` → `QUK-RES-000019`) + 16 علاقة (`REL-000600` → `REL-000615`).
> التفاصيل الكاملة (الأوصاف، المراجع، تقييم إعادة الاستخدام) في `resources.json` / `relationships.json`.

## 1. فهرس الموارد

| المعرف | الاسم | الفئة |
|---|---|---|
| QUK-RES-000001 | Triple-Stack Enforcement Foundation | Android Platform Integration |
| QUK-RES-000002 | DeviceAdmin Anti-Uninstall Anchor | Tamper Defence |
| QUK-RES-000003 | Accessibility Event Pipeline | Monitoring Infrastructure |
| QUK-RES-000004 | UninstallLongClickParser + Password Gate | Tamper Defence |
| QUK-RES-000005 | Tamper-Defence Parser Battery | Tamper Defence |
| QUK-RES-000006 | 7-Decision Blocker Engine | Enforcement Logic |
| QUK-RES-000007 | QProxy Native VPN Stack | Network Filtering |
| QUK-RES-000008 | TLS MITM Certificate Install Flow | Network Filtering |
| QUK-RES-000009 | Signed Command Interpreter (FCM) | Command & Control |
| QUK-RES-000010 | Rule Contract Models | Data Contracts |
| QUK-RES-000011 | Keep-Alive Package | Reliability |
| QUK-RES-000012 | SMS/Call Monitoring | Monitoring Infrastructure |
| QUK-RES-000013 | Social Chat Scrapers (6 platforms) | Monitoring Infrastructure |
| QUK-RES-000014 | YouTube Monitoring | Monitoring Infrastructure |
| QUK-RES-000015 | Browser URL Parsers + Native Search Regexes | Monitoring Infrastructure |
| QUK-RES-000016 | Location Reporting Stack | Monitoring Infrastructure |
| QUK-RES-000017 | Panic Mode (Headset Trigger) | Safety Feature |
| QUK-RES-000018 | Encrypted Remote Config (qinit) | Configuration |
| QUK-RES-000019 | Reporting Pipeline | Telemetry |

## 2. خريطة العلاقات (16)

| العلاقة | من → إلى | النوع | الوصف |
|---|---|---|---|
| REL-000600 | RES-000001 → RES-000003 | DEPENDS_ON | أساس الإنفاذ يعتمد على أنبوب الـ accessibility للأحداث |
| REL-000601 | RES-000004 → RES-000003 | DEPENDS_ON | محلل إلغاء التثبيت يمتد `R3.a` ويُغذَّى من الأنبوب |
| REL-000602 | RES-000005 → RES-000003 | DEPENDS_ON | بطارية الدفاعات تُغذَّى من الأنبوب نفسه |
| REL-000603 | RES-000006 → RES-000003 | DEPENDS_ON | أحداث `APPLICATION` تُغذّي محرك قرارات الحظر |
| REL-000604 | RES-000006 → RES-000010 | DEPENDS_ON | القرارات تُقيَّم مقابل نماذج القواعد |
| REL-000605 | RES-000007 → RES-000008 | DEPENDS_ON | الـ MITM يتطلب شهادة CA مثبتة |
| REL-000606 | RES-000007 → RES-000010 | DEPENDS_ON | محرك الملاحة يُغذَّى من القواعد المسحوبة |
| REL-000607 | RES-000009 → RES-000010 | TRIGGERS | `update_policy` يُطلق سحب القواعد |
| REL-000608 | RES-000009 → RES-000016 | TRIGGERS | `update_location` يُطلق الإبلاغ عن الموقع |
| REL-000609 | RES-000011 → RES-000003 | KEEPS_ALIVE | حزمة الإبقاء تُبقي خدمة الـ accessibility حية |
| REL-000610 | RES-000011 → RES-000007 | KEEPS_ALIVE | حزمة الإبقاء تُبقي خدمة الـ VPN حية |
| REL-000611 | RES-000002 → RES-000001 | PROTECTS | الإدارة تحمي وكيل الإنفاذ من الإلغاء |
| REL-000612 | RES-000004 → RES-000002 | PROTECTS | بوابة كلمة السر تحرس واجهة تعطيل الإدارة |
| REL-000613 | RES-000015 → RES-000007 | COMPLEMENTS | محللات المتصفحات تُكمّل ترشيح الـ VPN |
| REL-000614 | RES-000013 → RES-000019 | FEEDS_INTO | الكاشطات تُغذّي خط التقارير |
| REL-000615 | RES-000018 → RES-000010 | CONFIGURES | الإعداد البعيد يُهيّئ القواعد والمضيفين |

## 3. ملاحظات الخريطة

- **العقدة المركزية:** `QUK-RES-000003` (أنبوب الـ accessibility) — تخدمه 4 موارد وتُغذّي قرارات الحظر.
- **أعلى كثافة أدلة:** `QUK-RES-000007` (QProxy) — تحليل أصلي متعدد الطبقات (Java/JNI/strings/symbols).
- **أعلى مخاطرة إعادة استخدام:** `QUK-RES-000007` (باينري مملوك — يُعاد تنفيذ البروتوكول لا نسخه) و`QUK-RES-000013/14/15` (هشاشة view-ID).
