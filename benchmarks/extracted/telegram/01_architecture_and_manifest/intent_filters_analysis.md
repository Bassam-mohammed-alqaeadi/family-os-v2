# تحليل مرشحات النوايا والروابط العميقة لتطبيق Telegram (Intent Filters & Deep Links)

> تم استخراج هذا التحليل مباشرة من `AndroidManifest.xml` لفهم كيفية استقبال تيليجرام للأوامر، الروابط العميقة (Deep Links)، ومشاركة الملفات من التطبيقات الأخرى.

## 1. الأنشطة التي تستقبل النوايا (Activities with Intent Filters)

### `org.telegram.messenger.GoogleVoiceClientActivity`
- **الأوامر (Actions):** `com.google.android.voicesearch.SEND_MESSAGE_TO_CONTACTS`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `text/plain`

### `org.telegram.ui.LaunchActivity`
- **الأوامر (Actions):** `android.intent.action.MAIN`
- **الأوامر (Actions):** `android.intent.action.SEND`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `image/*`
- **الأوامر (Actions):** `android.intent.action.SEND`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `video/*`
- **الأوامر (Actions):** `android.intent.action.SEND_MULTIPLE`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `image/*`
- **الأوامر (Actions):** `android.intent.action.SEND`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `text/plain`
- **الأوامر (Actions):** `android.intent.action.SEND`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `*/*`
- **الأوامر (Actions):** `android.intent.action.SEND_MULTIPLE`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `*/*`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `vnd.android.cursor.item/vnd.org.telegram.messenger.android.profile`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT, android.intent.category.BROWSABLE`
  - **المخططات (Schemes):** `http, https`
  - **النطاقات (Hosts):** `telegram.me, t.me, telegram.dog`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT, android.intent.category.BROWSABLE`
  - **المخططات (Schemes):** `tonsite`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.BROWSABLE, android.intent.category.DEFAULT`
  - **المخططات (Schemes):** `tg`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT, android.intent.category.BROWSABLE`
  - **المخططات (Schemes):** `ton`
  - **النطاقات (Hosts):** `transfer`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT, android.intent.category.BROWSABLE`
  - **المخططات (Schemes):** `tc`
- **الأوامر (Actions):** `org.telegram.messenger.CREATE_STICKER_PACK`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `*/*`

### `org.telegram.ui.ShareActivity`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.BROWSABLE, android.intent.category.DEFAULT`
  - **المخططات (Schemes):** `tgb`

### `org.telegram.ui.ExternalActionActivity`
- **الأوامر (Actions):** `org.telegram.passport.AUTHORIZE`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`

### `org.telegram.ui.ChatsWidgetConfigActivity`
- **الأوامر (Actions):** `android.appwidget.action.APPWIDGET_CONFIGURE`

### `org.telegram.ui.ContactsWidgetConfigActivity`
- **الأوامر (Actions):** `android.appwidget.action.APPWIDGET_CONFIGURE`

### `org.telegram.messenger.DefaultIcon`
- **الأوامر (Actions):** `android.intent.action.MAIN`
  - **التصنيفات (Categories):** `android.intent.category.LAUNCHER, android.intent.category.MULTIWINDOW_LAUNCHER`

### `org.telegram.ui.CallsActivity`
- **الأوامر (Actions):** `android.intent.action.VIEW`
  - **التصنيفات (Categories):** `android.intent.category.DEFAULT`
  - **أنواع الوسائط (MIME Types):** `vnd.android.cursor.item/vnd.org.telegram.messenger.android.call, vnd.android.cursor.item/vnd.org.telegram.messenger.android.call.video`

### `org.telegram.messenger.NoxIcon`
- **الأوامر (Actions):** `android.intent.action.MAIN`
  - **التصنيفات (Categories):** `android.intent.category.LAUNCHER, android.intent.category.MULTIWINDOW_LAUNCHER`

### `org.telegram.messenger.TurboIcon`
- **الأوامر (Actions):** `android.intent.action.MAIN`
  - **التصنيفات (Categories):** `android.intent.category.LAUNCHER, android.intent.category.MULTIWINDOW_LAUNCHER`

### `org.telegram.messenger.PremiumIcon`
- **الأوامر (Actions):** `android.intent.action.MAIN`
  - **التصنيفات (Categories):** `android.intent.category.LAUNCHER, android.intent.category.MULTIWINDOW_LAUNCHER`

### `org.telegram.messenger.AquaIcon`
- **الأوامر (Actions):** `android.intent.action.MAIN`
  - **التصنيفات (Categories):** `android.intent.category.LAUNCHER, android.intent.category.MULTIWINDOW_LAUNCHER`

### `org.telegram.messenger.VintageIcon`
- **الأوامر (Actions):** `android.intent.action.MAIN`
  - **التصنيفات (Categories):** `android.intent.category.LAUNCHER, android.intent.category.MULTIWINDOW_LAUNCHER`

