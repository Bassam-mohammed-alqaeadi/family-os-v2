# هيكل المستودع (Repository Structure)

> الحالة: معتمد للتنفيذ | القرارات: D-002, D-003, D-005, D-009, D-010, D-014 | يعتمد على: architecture.md, tech-stack.md

## 1. المبادئ
1. **مستودع واحد (Monorepo) باسم `family-os-v2`** (D-002): الخادم والتطبيق والعقود والمواصفات والبنية في مكان واحد، فيتغير العقد والتنفيذ في طلب دمج واحد.
2. **المواصفات جزء من المستودع** (`spec/`) وهي مصدر الحقيقة: كل وحدة تشير إلى نظامها في المواصفات.
3. **حدود صارمة تفرضها الأدوات** لا الاتفاق الشفهي (architecture §3.3).
4. **كل شيء قابل للتوليد لا يُكتب يدويًا:** عميل Dart، أنواع العقود، وثيقة OpenAPI، مانيفست السجلات.
5. **بنية متوقعة:** وكيل جديد يجد أي شيء في مكانه دون سؤال (D-009: محايد للنموذج).

## 2. الشجرة العليا
```
family-os-v2/
├─ spec/                      # المواصفات (مصدر الحقيقة)
├─ apps/
│  ├─ server/                 # NestJS (TypeScript)
│  └─ mobile/                 # Flutter (Android + iOS)
├─ packages/                  # حزم TypeScript مشتركة (pnpm workspaces)
│  ├─ contracts/              # مخططات Zod + OpenAPI + أنواع الأحداث
│  ├─ registry-kit/           # أنواع وأدوات تعريف التحكمات والصلاحيات والويدجتات
│  ├─ eslint-config/
│  └─ tsconfig/
├─ packages_dart/             # حزم Dart (melos workspace)
│  ├─ fos_design_system/      # الألوان والمكوّنات (من 02-design-system)
│  ├─ fos_api_client/         # عميل مولَّد من OpenAPI
│  ├─ fos_registries/         # نسخة Dart من مانيفست السجلات (مولَّدة)
│  └─ fos_device_control/     # واجهة DeviceControlGateway + Android (Kotlin) + iOS stub
├─ infra/                     # Docker, compose, IaC, سكربتات النشر
├─ tools/                     # سكربتات التوليد والفحص (CI/محلي)
├─ .github/                   # workflows, CODEOWNERS, قوالب PR
├─ README.md  CONTRIBUTING.md  LICENSE
├─ package.json  pnpm-workspace.yaml  turbo.json  melos.yaml
└─ .editorconfig  .gitignore  .nvmrc
```
- **الأدوات:** pnpm workspaces + Turborepo (TypeScript)، وmelos (Dart).
- حزمة `apps/admin` محجوزة اسمًا لمرحلة لاحقة (لوحة ويب) ولا تُنشأ الآن.

## 3. الخادم (`apps/server`)
```
apps/server/
├─ src/
│  ├─ main.ts            # نقطة الدخول (api | worker | migrate) بوسيط تشغيل
│  ├─ app.module.ts
│  ├─ platform/          # بنية مشتركة: config, logging, tracing, db, redis, queue, http, errors
│  ├─ ports/             # SmsPort, PushPort, MapsPort, BillingPort, AiPort, StoragePort + محوّلات
│  └─ modules/
│     ├─ identity/ family/ access/ controls/ approvals/ rules/
│     ├─ audit/ devices/ notifications/ realtime/ experience/ billing/ media/
│     └─ chat/ location/ safety/ ...      # وحدات الخدمات تُضاف بالتتابع
├─ db/
│  ├─ migrations/        # ترحيلات SQL مرقمة، لا تُعدَّل بعد الدمج
│  └─ seeds/
└─ test/                 # اختبارات e2e وتكامل عابرة للوحدات
```

### 3.1 هيكل كل وحدة (ثابت لكل الوحدات)
```
modules/<name>/
├─ README.md             # الغرض + spec_ref (مثال: spec/03-phase-1-core/S1-03-...) + الأحداث المنشورة والمستهلكة
├─ index.ts              # الواجهة العامة الوحيدة المسموح استيرادها
├─ api/                  # controllers + DTOs (تحويل HTTP/WebSocket إلى استدعاءات تطبيقية)
├─ application/          # حالات الاستخدام (services) والمعاملات
├─ domain/               # كيانات وقواعد عمل خالصة بلا بنية تحتية
├─ infrastructure/       # مستودعات البيانات (repositories) والمحوّلات
├─ schema/               # مخطط Drizzle لمخطط PostgreSQL الخاص بالوحدة
├─ events/               # أنواع الأحداث المنشورة والمعالجات
├─ registry/             # controls.ts, permissions.ts, widgets.ts, nav.ts (للتسجيل)
└─ __tests__/            # اختبارات وحدة بجوار الشيفرة
```
- `registry/` هو العقد مع النواة: لا تظهر الخدمة في الإعدادات أو التنقل أو الرئيسية دون تسجيل هنا.
- `domain/` لا يستورد `infrastructure/` ولا إطار NestJS (يختبر دون تشغيل شيء).

### 3.2 قواعد الاستيراد (تُفحص بـ dependency-cruiser وتفشل CI عند المخالفة)
1. من خارج الوحدة: الاستيراد من `modules/<x>` (أي `index.ts`) فقط.
2. `modules/<service>` قد تعتمد على الوحدات النواة، والنواة **لا تعتمد** على وحدات الخدمات.
3. `domain/` لا يعتمد على أي طبقة أخرى.
4. `api/` لا يستدعي `infrastructure/` مباشرة، بل عبر `application/`.
5. لا استيراد دوري بين وحدتين.
6. الوصول للجداول يتم داخل وحدتها فقط.

## 4. التطبيق (`apps/mobile`)
```
apps/mobile/
├─ lib/
│  ├─ main.dart  app.dart
│  ├─ core/              # auth, network, storage, sync(outbox), realtime, permissions, errors
│  ├─ experience/        # ملفات التجربة، التنقل المُركَّب، الرئيسية، العرض كـ
│  ├─ controls/          # محرك عرض التحكمات والإعدادات العام (يقرأ السجلات)
│  └─ features/
│     └─ <service>/      # chat, location, safety, ...
│        ├─ data/ domain/ presentation/
│        └─ registry/    # الويدجتات والتنقل الخاصان بالخدمة
├─ android/              # مشروع أندرويد (يحتضن وحدة Kotlin من المرحلة 2 عبر fos_device_control)
├─ ios/
├─ assets/               # صور، خطوط، رسوم، أصوات (مصدرها 02-design-system)
├─ l10n/                 # ARB: ar (الأساس)، en
└─ test/ integration_test/
```
- التطبيق يستورد من `packages_dart/*` ولا يكرر الألوان أو المكوّنات.
- لا يستورد ميزة ميزةً أخرى مباشرة؛ التواصل عبر `core/` أو واجهات مجردة معلنة.

## 5. الحزم المشتركة
- **`packages/contracts`:** مخططات Zod للطلبات والاستجابات والأحداث، ومنها يُولَّد `openapi.json` (يُلتزم بالمستودع لتظهر الفروقات في المراجعة).
- **`packages/registry-kit`:** أنواع `ControlDefinition` و`PermissionDefinition` و`WidgetRegistration`، ودوال التحقق، ومولّد **المانيفست** `registries.manifest.json` الذي تُبنى منه `fos_registries` وقوائم الاختبار.
- **`fos_design_system`:** مصدر وحيد للألوان (1F3A6B، 1F6B3B، CF5B2C، C8A24A، FCFAED) والخطوط والمسافات والمكوّنات، ولا لون مكتوب بقيمة مباشرة خارجها.
- **`fos_device_control`:** `DeviceControlGateway` (Dart مجرد) + تنفيذ Android (Kotlin) المرحلة 2 + تنفيذ iOS يرجع `unavailable_on_device` (D-018).

## 6. التوليد (Codegen)
| المصدر | المخرج | الأمر |
|---|---|---|
| `packages/contracts` | `openapi.json` | `pnpm gen:openapi` |
| `openapi.json` | `fos_api_client` | `pnpm gen:dart-client` |
| `modules/*/registry` | `registries.manifest.json` ثم `fos_registries` | `pnpm gen:registries` |
| ARB | `AppLocalizations` | `flutter gen-l10n` |
| freezed/json | ملفات `*.g.dart` | `melos run build` |

- **سياسة الالتزام:** يُلتزم بـ `openapi.json` و`registries.manifest.json` (للمراجعة)، ولا يُلتزم بباقي الناتج المولَّد (`*.g.dart`, عميل Dart)، ويُولَّد في CI والمحلي.
- أمر واحد `pnpm gen:all` ينفذ كل التوليد. وCI يفشل إن اختلف الناتج الملتزم عن المولَّد (فحص drift).

## 7. التسمية والاصطلاحات
| العنصر | الصيغة |
|---|---|
| ملفات TS | `kebab-case.ts` (`approval-request.service.ts`) |
| ملفات Dart | `snake_case.dart` |
| أنواع/أصناف | `PascalCase` |
| مفاتيح التحكم والصلاحيات | `domain.name` (control: `location.share_mode`، permission: `location.view`) |
| جداول القاعدة | `snake_case` بصيغة الجمع، ضمن مخطط الوحدة (`controls.control_values`) |
| الأحداث | `<module>.<entity>.<past_verb>` (`approvals.request.decided`) |
| معرّفات الأنظمة | `S1-03` ... وتُذكر في README الوحدة وأوصاف PR |
| مفاتيح i18n | `<module>.<screen>.<element>` |
- المعرّفات والشيفرة بالإنجليزية، والمواصفات وواجهة المستخدم بالعربية (D-001).

## 8. سير العمل مع Git
- فرع `main` محمي ونظيف دائمًا (جاهز للنشر)، وفروع قصيرة العمر: `feat/S1-03-controls-resolution`، `fix/...`، `chore/...`.
- **Conventional Commits** (`feat(controls): ...`) تغذي سجل التغييرات.
- طلب الدمج الواحد يخدم نظامًا واحدًا (D-010) ويحمل: رابط مواصفة، معايير القبول المغطاة، لقطات للشاشات إن وُجدت.
- `CODEOWNERS` يفرض مراجعة على: `spec/99-decisions`، `db/migrations`، `registry/`، `infra/`.
- ترحيلات القاعدة: ملف جديد دائمًا، لا تعديل لملف مدموج.

## 9. التوثيق داخل المستودع
- `spec/` للمواصفات والقرارات (وملفات ADR الصغيرة في `spec/99-decisions/adr/`).
- `README.md` في الجذر: كيف تبدأ، الأوامر الأساسية، خريطة المستودع.
- `CONTRIBUTING.md`: سير العمل، الجودة، تعريف «منجز» (يستند إلى 00-agent-rules).
- لا توثيق منسوخ يتقادم: الأوامر والمخططات تُشتق من الشيفرة حيث أمكن.

## 10. الإعدادات والأسرار
- `.env.example` موثّق لكل متغير (الاسم، الغرض، مثال آمن، إلزامي أم لا). لا `.env` حقيقي في المستودع.
- التحقق من المتغيرات عند الإقلاع بمخطط Zod؛ النظام لا يعمل بإعداد ناقص.
- التهيئة حسب البيئة في `platform/config`، لا شروط بيئة متفرقة في الشيفرة.

## 11. الأوامر الموحّدة (واجهة المطور والوكيل)
```
pnpm i                 # تثبيت
pnpm dev:server        # تشغيل الخادم + تبعياته (compose)
pnpm dev:mobile        # تشغيل التطبيق
pnpm gen:all           # كل التوليد
pnpm lint | pnpm test | pnpm test:integration
pnpm check:boundaries  # حدود الوحدات
pnpm check:registries  # مخطط التحكمات والصلاحيات
pnpm db:migrate | pnpm db:seed
```
- أي أمر جديد يُسجَّل في README الجذر.

## 12. معايير القبول
1. مستودع جديد يبني ويختبر الخادم والتطبيق بأمر واحد لكل منهما.
2. إضافة وحدة جديدة تتم بنسخ هيكل 3.1، وCI يفشل إن غاب `README.md` أو `index.ts` أو `registry/`.
3. أي استيراد يخالف 3.2 يفشل `check:boundaries`.
4. اختلاف ناتج التوليد الملتزم عن المولَّد يفشل CI.
5. لا لون أو نص عربي مكتوب مباشرة في ويدجت (يأتي من `fos_design_system` وARB)، ويُفحص بقاعدة lint.
6. كل وحدة تحمل `spec_ref` صالحًا يشير إلى ملف موجود في `spec/`.
7. يستطيع وكيل جديد، بقراءة `README.md` و`spec/00-agent-rules` فقط، تحديد مكان أي ملف يريد إنشاءه.
