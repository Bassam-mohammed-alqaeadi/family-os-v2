# كتالوج مكونات وخدمات تطبيق Telegram المعمارية

- **إجمالي الأنشطة (Activities):** 27
- **إجمالي الخدمات الخلفية (Services):** 32
- **إجمالي مستقبلات البث (Broadcast Receivers):** 27
- **إجمالي مزودات المحتوى (Content Providers):** 6

## 1. الخدمات الخلفية الحيوية (Key Services)
- `org.telegram.messenger.GcmPushListenerService`
- `com.google.android.gms.measurement.AppMeasurementService`
- `org.telegram.messenger.GoogleVoiceClientService`
- `org.telegram.messenger.SMSJobsNotification`
- `org.telegram.messenger.AuthenticatorService`
- `org.telegram.messenger.ContactsSyncAdapterService`
- `org.telegram.messenger.KeepAliveJob`
- `org.telegram.messenger.BringAppForegroundService`
- `org.telegram.messenger.NotificationsService`
- `org.telegram.messenger.NotificationRepeat`
- `org.telegram.messenger.VideoEncodingService`
- `org.telegram.ui.Stories.recorder.StoryUploadingService`
- `org.telegram.messenger.ImportingService`
- `org.telegram.messenger.LocationSharingService`
- `org.telegram.messenger.voip.VoIPService`
- `org.telegram.messenger.MusicPlayerService`
- `org.telegram.messenger.MusicBrowserService`
- `org.telegram.messenger.voip.TelegramConnectionService`
- `org.telegram.messenger.WearAuthListenerService`
- `org.telegram.messenger.ChatsWidgetService`
- `org.telegram.messenger.ContactsWidgetService`
- `org.telegram.messenger.FilesMigrationService`
- `androidx.credentials.playservices.CredentialProviderMetadataHolder`
- `com.google.android.gms.cast.framework.ReconnectionService`
- `com.google.mlkit.common.internal.MlKitComponentDiscoveryService`
- `com.google.android.gms.auth.api.signin.RevocationBoundService`
- `com.google.firebase.messaging.FirebaseMessagingService`
- `com.google.firebase.components.ComponentDiscoveryService`
- `androidx.car.app.CarAppMetadataHolderService`
- `androidx.sharetarget.ChooserTargetServiceCompat`
- `com.google.android.datatransport.runtime.backends.TransportBackendDiscovery`
- `com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService`

## 2. مستقبلات البث والإشعارات (Receivers)
- `com.google.android.gms.measurement.AppMeasurementReceiver`
- `org.telegram.messenger.SMSResultService`
- `org.telegram.messenger.AutoMessageHeardReceiver`
- `org.telegram.messenger.CopyCodeReceiver`
- `org.telegram.messenger.NotificationsDisabledReceiver`
- `org.telegram.messenger.SmsReceiver`
- `org.telegram.messenger.CallReceiver`
- `org.telegram.messenger.MusicPlayerReceiver`
- `org.telegram.messenger.voip.VoIPMediaButtonReceiver`
- `org.telegram.messenger.AppStartReceiver`
- `org.telegram.messenger.RefererReceiver`
- `org.telegram.messenger.WearReplyReceiver`
- `org.telegram.messenger.StopLiveLocationReceiver`
- `org.telegram.messenger.PopupReplyReceiver`
- `org.telegram.messenger.NotificationCallbackReceiver`
- `org.telegram.messenger.ShareBroadcastReceiver`
- `org.telegram.messenger.CustomTabsCopyReceiver`
- `org.telegram.messenger.NotificationDismissReceiver`
- `org.telegram.messenger.voip.VoIPActionsReceiver`
- `org.telegram.messenger.ShortcutResultReceiver`
- `org.telegram.messenger.ChatsWidgetProvider`
- `org.telegram.messenger.ContactsWidgetProvider`
- `com.google.android.gms.cast.framework.media.MediaIntentReceiver`
- `com.google.firebase.iid.FirebaseInstanceIdReceiver`
- `androidx.car.app.notification.CarAppNotificationBroadcastReceiver`
- `androidx.profileinstaller.ProfileInstallReceiver`
- `com.google.android.datatransport.runtime.scheduling.jobscheduling.AlarmManagerSchedulerBroadcastReceiver`

## 3. الأنشطة الرئيسية (Key Activities)
- `org.telegram.messenger.GoogleVoiceClientActivity`
- `org.telegram.ui.LaunchActivity`
- `org.telegram.ui.BubbleActivity`
- `org.telegram.ui.ShareActivity`
- `org.telegram.ui.ExternalActionActivity`
- `org.telegram.ui.ChatsWidgetConfigActivity`
- `org.telegram.ui.ContactsWidgetConfigActivity`
- `org.telegram.messenger.OpenChatReceiver`
- `org.telegram.messenger.OpenAttachedMenuBotReceiver`
- `org.telegram.ui.PopupNotificationActivity`
- `org.telegram.ui.VoIPPermissionActivity`
- `org.telegram.ui.VoIPFeedbackActivity`
- `androidx.credentials.playservices.controllers.identityauth.HiddenActivity`
- `androidx.credentials.playservices.controllers.identitycredentials.IdentityCredentialApiHiddenActivity`
- `com.android.billingclient.api.ProxyBillingActivity`
- `com.android.billingclient.api.ProxyBillingActivityV2`
- `com.google.android.gms.auth.api.signin.internal.SignInHubActivity`
- `com.google.android.gms.common.api.GoogleApiActivity`
- `androidx.car.app.CarAppPermissionActivity`
- `com.google.android.play.core.common.PlayCoreDialogWrapperActivity`
- `org.telegram.messenger.DefaultIcon`
- `org.telegram.ui.CallsActivity`
- `org.telegram.messenger.NoxIcon`
- `org.telegram.messenger.TurboIcon`
- `org.telegram.messenger.PremiumIcon`
- `org.telegram.messenger.AquaIcon`
- `org.telegram.messenger.VintageIcon`

## 4. مزودات المحتوى (Content Providers)

يحتوي تطبيق Telegram على 6 مزودات محتوى معمارية تدير مشاركة الملفات، إشعارات الوسائط، نغمات الاتصال، ومكتبات التهيئة التلقائية:

| # | اسم مزود المحتوى (Content Provider) | النطاق المصرح (Authority) | التصدير (Exported) | الغرض المعماري والمسوغ الأمني (Security Rationale) |
|---|-------------------------------------|---------------------------|-------------------|---------------------------------------------------|
| 1 | `androidx.core.content.FileProvider` | `org.telegram.messenger.web.provider` | `false` (مع `grantUriPermissions="true"`) | **مشاركة آمنة للملفات**: يتيح مشاركة الصور، الفيديوهات، والمستندات مع تطبيقات خارجية (عبر `content://` URIs مؤقتة ومحددة الصلاحيات) دون منح إذن الوصول الشامل لوحدة التخزين الخارجية (`READ_EXTERNAL_STORAGE`). |
| 2 | `org.telegram.messenger.NotificationImageProvider` | `org.telegram.messenger.web.notification_image_provider` | `false` (مع `grantUriPermissions="true"`) | **تغذية مصغرات الإشعارات**: يزود نظام Android SystemUI بصور البروفايل ومصغرات الوسائط المرفقة بالإشعارات المنبثقة بشكل لحظي مع حصر الصلاحيات عبر الرموز الأمنية. |
| 3 | `org.telegram.messenger.voip.CallNotificationSoundProvider` | `org.telegram.messenger.web.call_sound_provider` | `true` | **نغمات وتنبيهات المكالمات**: مُصدّر للخدمات الصوتية للنظام وأطر الاتصال (Android Telecom Framework) لتشغيل نغمات الرنين المخصصة للمكالمات المشفرة الواردة حتى عند قفل الشاشة. |
| 4 | `com.google.mlkit.common.internal.MlKitInitProvider` | `org.telegram.messenger.web.mlkitinitprovider` | `false` (`initOrder="99"`) | **تهيئة تعلم الآلة والترجمة**: تهيئة مكتبة Google ML Kit في الخلفية لمعالجة الترجمة الفورية للنصوص داخل الدردشات والتعرف على الكيانات دون تأخير تشغيل الواجهة. |
| 5 | `com.google.firebase.provider.FirebaseInitProvider` | `org.telegram.messenger.web.firebaseinitprovider` | `false` (`directBootAware="true"`, `initOrder="100"`) | **التهيئة الفورية للإشعارات (FCM)**: تهيئة ركيزة Firebase Cloud Messaging قبل استدعاء `Application.onCreate()` لمعالجة الإشعارات الفورية ذات الأولوية القصوى ودعم وضع Direct Boot عند الإقلاع المشفر. |
| 6 | `androidx.startup.InitializationProvider` | `org.telegram.messenger.web.androidx-startup` | `false` | **توحيد تهيئة مكتبات Jetpack**: تحسين سرعة إقلاع التطبيق (App Startup Time) عبر توحيد تهيئة مكتبات AndroidX المتعددة داخل مزود محتوى واحد لتفادي استنزاف موارد النظام. |
