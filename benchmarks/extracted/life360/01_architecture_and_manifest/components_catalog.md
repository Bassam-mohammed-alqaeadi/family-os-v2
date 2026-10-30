# فهرس المكونات البرمجية الشامل لتطبيق Life360 (Components Catalog 100%)

> وثيقة مرجعية تحصر وتفهرس جميع الأنشطة والخدمات ومستقبلات البث ومزودات المحتوى وروابط Deep Links في الحزمة الرسمية `com.life360.android.safetymapd`.

## 1. ملخص المكونات (Component Overview)
- **إجمالي الأنشطة (Activities):** 15
- **إجمالي الخدمات (Services):** 29
- **إجمالي مستقبلات البث (Broadcast Receivers):** 49
- **إجمالي مزودات المحتوى (Content Providers):** 16
- **فئة التطبيق الرئيسية (Application Class):** `com.life360.android.shared.Life360BaseApplication`

## 2. جدول الأنشطة (Activities & Deep Links)
| اسم النشاط (Activity Name) | Exported | مرشحات النوايا (Intent Filters & Actions) | فئة الاستخدام والوظيفة |
|---|---|---|---|
| `com.appboy.ui.AppboyWebViewActivity` | `false` | *داخلي فقط (Internal)* | رسائل التسويق الداخلي والمحتوى |
| `com.appboy.ui.activities.AppboyFeedActivity` | `false` | *داخلي فقط (Internal)* | رسائل التسويق الداخلي والمحتوى |
| `com.life360.koko.root.RootActivity` | `true` | `MAIN`<br>`VIEW`<br>Scheme: `life360://`<br>`VIEW`<br>Scheme: `Life360://open`<br>`VIEW`<br>Scheme: `https://i.lf360.co`<br>`ACTION_GOOGLE_ASSISTANT` | نشاط واجهة رئيسي |
| `com.theartofdev.edmodo.cropper.CropImageActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `zendesk.support.guide.HelpCenterActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `zendesk.support.guide.ViewArticleActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `zendesk.support.request.RequestActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `zendesk.support.requestlist.RequestListActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `com.life360.message.root.MessagingRootActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `com.berbix.berbixverify.activities.BerbixActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `zendesk.messaging.MessagingActivity` | `not-specified` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `com.appboy.ui.activities.AppboyContentCardsActivity` | `false` | *داخلي فقط (Internal)* | رسائل التسويق الداخلي والمحتوى |
| `com.appboy.push.NotificationTrampolineActivity` | `false` | *داخلي فقط (Internal)* | تنبيهات الطوارئ والاستغاثة |
| `com.google.android.gms.common.api.GoogleApiActivity` | `false` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |
| `com.android.billingclient.api.ProxyBillingActivity` | `false` | *داخلي فقط (Internal)* | نشاط واجهة رئيسي |

## 3. جدول الخدمات الأساسية والخدمات الأمامية (Services & Foreground Services)
| اسم الخدمة (Service Name) | Exported | نوع الخدمة الأمامية (Foreground Service Type) | الصلاحية/المرشحات | الوظيفة الهندسية |
|---|---|---|---|---|
| `com.life360.koko.services.KokoJobIntentService` | `not-specified` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `org.eclipse.paho.android.service.MqttService` | `not-specified` | `None` | `None` | خدمة خلفية نظامية |
| `com.life360.koko.services.L360FirebaseMessagingService` | `false` | `None` | `None` | استقبال الإشعارات الفورية الهادئة والحية |
| `com.life360.android.location.FileLoggerService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | خدمة خلفية نظامية |
| `com.life360.android.location.controllers.EventController` | `false` | `location` | `None` | خدمة خلفية نظامية |
| `com.life360.koko.collision_response.services.AutomaticCollisionResponseService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | خدمة خلفية نظامية |
| `com.life360.koko.services.KokoUserService` | `not-specified` | `None` | `android.permission.BIND_JOB_SERVICE` | خدمة خلفية نظامية |
| `com.life360.android.driving.service.DriverBehaviorService` | `false` | `location` | `None` | خدمة خلفية نظامية |
| `com.life360.attribution.UserAcqReporterService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | خدمة خلفية نظامية |
| `com.life360.message.messaging.MessagingService` | `not-specified` | `None` | `None` | استقبال الإشعارات الفورية الهادئة والحية |
| `com.life360.message.messaging.ui.DismissMessageService` | `not-specified` | `None` | `None` | خدمة خلفية نظامية |
| `com.google.firebase.components.ComponentDiscoveryService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `com.google.firebase.messaging.FirebaseMessagingService` | `false` | `None` | `None` | استقبال الإشعارات الفورية الهادئة والحية |
| `com.google.android.gms.measurement.AppMeasurementService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `com.google.android.gms.measurement.AppMeasurementJobService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `com.google.mlkit.common.internal.MlKitComponentDiscoveryService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `androidx.work.multiprocess.RemoteWorkManagerService` | `false` | `None` | `None` | مجدول المهام الدورية ومزامنة البيانات |
| `androidx.work.impl.background.systemalarm.SystemAlarmService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `androidx.work.impl.background.systemjob.SystemJobService` | `true` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `androidx.work.impl.foreground.SystemForegroundService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `androidx.room.MultiInstanceInvalidationService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `com.google.android.datatransport.runtime.backends.TransportBackendDiscovery` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `com.arity.coreEngine.driving.DrivingEngineService` | `false` | `None` | `None` | خدمة خلفية نظامية |
| `com.arity.coreEngine.webservices.TripUploadJobIntentService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `com.arity.coreEngine.hfd.core.HFDProcessorJobIntentService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `com.arity.coreEngine.webservices.CollisionPayloadJobIntentService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `com.arity.coreEngine.networking.webservices.NetworkingJobIntentService` | `false` | `None` | `android.permission.BIND_JOB_SERVICE` | مجدول المهام الدورية ومزامنة البيانات |
| `com.arity.coreEngine.driving.DriveDetectionService` | `false` | `None` | `None` | خدمة خلفية نظامية |

## 4. جدول مستقبلات البث (Broadcast Receivers)
| اسم المستقبل (Receiver Name) | Exported | الأحداث المرصودة (Observed Actions) | الوظيفة في البقاء وإدارة الحالة |
|---|---|---|---|
| `com.life360.message.messaging.MessagingReceiver` | `false` | `ACTION_DO_LOGOUT`<br>`ACTION_REACTION`<br>`ACTION_START`<br>`ACTION_UPDATE_THREADS`<br>`ACTION_LOAD_CACHE` | مستقبل بث داخلي |
| `com.life360.koko.recievers.KokoReceiver` | `false` | `LOCALE_CHANGED` | مستقبل بث داخلي |
| `com.life360.koko.recievers.AppStatusReceiver` | `false` | `ACTION_APP_TO_FOREGROUND`<br>`ACTION_APP_TO_BACKGROUND` | مستقبل بث داخلي |
| `com.life360.inappmessaging.PushReceiver` | `false` | `APPBOY_PUSH_RECEIVED`<br>`APPBOY_NOTIFICATION_OPENED` | مستقبل بث داخلي |
| `com.appsflyer.MultipleInstallBroadcastReceiver` | `true` | `INSTALL_REFERRER` | مستقبل بث داخلي |
| `com.life360.android.metrics.MetricsReceiver` | `false` | `ACTION_METRIC_EVENT`<br>`ACTION_ANSWERS_EVENT`<br>`ACTION_ANALYTICS_EVENT`<br>`ACTION_METRIC_USER_PROPERTY` | مستقبل بث داخلي |
| `com.life360.android.driving.DriverBehaviorReceiver` | `false` | `EVENT_INITIALIZED`<br>`EVENT_UNAUTHENTICATED`<br>`ACTION_LOGOUT`<br>`ACTIVITY_PERMISSION_GRANTED`<br>`ACTION_APP_TO_FOREGROUND`<br>`BOOT_COMPLETED`<br>`MY_PACKAGE_REPLACED`<br>`ACTION_CRASH_CANCELED`<br>`ACTION_DRIVING_ANALYSIS_TOGGLED`<br>`CRASH_DETECTED`<br>`RAW_DATA_EXCHANGE`<br>`SDK_STARTUP`<br>`SDK_STATE_EVENT`<br>`TRIP_ANALYZED` | إعادة تشغيل محرك التتبع فور إقلاع الهاتف |
| `com.life360.android.sensorframework.activity.ActivityUpdateBroadcastReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.driving.receiver.DrivingMpActivityReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.driving.receiver.DrivingMpActivityTransitionReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.driving.receiver.DrivingMpLocationReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.sensorframework.location.LocationUpdateBroadcastReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.koko.recievers.KokoReinstallReceiver` | `false` | `MY_PACKAGE_REPLACED` | مستقبل بث داخلي |
| `com.life360.koko.recievers.ZoneCoordinatorReceiver` | `false` | `ACTION_DEACTIVATE_ZONE`<br>`ACTION_DEACTIVATE_ALL_ZONES_ON_SOS`<br>`ACTION_DEACTIVATE_ALL_ZONES_ON_COLLISION`<br>`ACTION_EXPIRE_ZONE`<br>`ACTION_REFRESH_CIRCLE_ZONES`<br>`ACTION_REFRESH_ALL_CIRCLES_ZONES`<br>`ACTION_APP_TO_FOREGROUND` | مستقبل بث داخلي |
| `com.life360.android.location.receivers.LocationReceiver` | `false` | `ACTION_HEARTBEAT_TIMER`<br>`ACTION_APP_TO_FOREGROUND`<br>`ACTION_APP_TO_BACKGROUND`<br>`TIME_SET`<br>`EVENT_INITIALIZED`<br>`EVENT_UNAUTHENTICATED`<br>`MY_PACKAGE_REPLACED`<br>`BOOT_COMPLETED`<br>`OUTER_GEOFENCE`<br>`INNER_GEOFENCE`<br>`LOCAL_GEOFENCE`<br>`BOUNCE_OUT_GEOFENCE`<br>`ZONE_GEOFENCE`<br>`HIDE_BATTERY_SAVER_NOTIF`<br>`HIDE_BATTERY_OPTIMIZATION_NOTIF`<br>`ACTION_DRIVE_END`<br>`ACTION_DRIVE_START`<br>`LOCATION_PERMISSION_GRANTED`<br>`ACTIVITY_PERMISSION_GRANTED`<br>`ACTION_ACTIVITY_TRANSITION`<br>`ACTION_SFW_ACTIVITY_TRANSITION`<br>`ACTION_ZONES_STREAM_CHANGED`<br>`ACTION_ZONE_EXPIRED` | إعادة تشغيل محرك التتبع فور إقلاع الهاتف |
| `com.life360.android.location.receivers.BleReceiver` | `false` | `ACTION_BLE_START`<br>`ACTION_BLE_STOP` | مراقبة حالة تشغيل البلوتوث لشبكة Tile |
| `com.life360.android.location.receivers.GeofenceReceiver` | `false` | *داخلي / صريح (Explicit)* | التقاط أحداث الدخول والخروج من الأماكن (Places) |
| `com.life360.android.location.receivers.MpActivityTransitionReceiver` | `false` | `ACTION_SFW_ACTIVITY_TRANSITION` | مستقبل بث داخلي |
| `com.life360.android.location.receivers.MovementDetectionReceiver` | `false` | `ALARM_EXPIRY`<br>`ACTION_ACTIVITY_TRANSITION`<br>`ACTION_SFW_ACTIVITY_TRANSITION`<br>`ACTION_DRIVE_STRATEGY_END`<br>`ACTION_DRIVE_STRATEGY_START` | مستقبل بث داخلي |
| `com.life360.koko.collision_response.CollisionResponseReceiver` | `false` | `ACTION_COLLISION_RESPONSE_SCHEDULE_JOB_SERVICE` | مستقبل بث داخلي |
| `com.life360.android.devicehealth.receiver.DeviceHealthEventReceiver` | `false` | `BOOT_COMPLETED`<br>`ACTION_POWER_CONNECTED`<br>`ACTION_POWER_DISCONNECTED`<br>`ACTION_BATTERY_LOW`<br>`ACTION_APP_TO_FOREGROUND`<br>`ACTION_APP_TO_BACKGROUND`<br>`ACTION_CONNECTION_STATUS_CHANGED`<br>`ACTION_KOKO_FUE_LOGGED_IN`<br>`ACTION_KOKO_FUE_LOGGED_OUT`<br>`ACTION_ACTIVITY_TRANSITION`<br>`ACTION_SFW_ACTIVITY_TRANSITION` | إعادة تشغيل محرك التتبع فور إقلاع الهاتف |
| `com.life360.android.history.DirectionsReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.message.messaging.MessagingService$StartUpReceiver` | `false` | `BOOT_COMPLETED`<br>`MY_PACKAGE_REPLACED` | إعادة تشغيل محرك التتبع فور إقلاع الهاتف |
| `com.life360.android.sensorframework.activity_transition.ActivityTransitionUpdateBroadcastReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.sensorframework.fused.FusedLocationUpdateBroadcastReceiver` | `not-specified` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.genesisengineapi.eventskit.BackgroundProcessWakeUpReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.life360.android.genesisengineapi.eventskit.MainProcessWakeUpReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `zendesk.support.DeepLinkingBroadcastReceiver` | `false` | `support` | مستقبل بث داخلي |
| `com.appboy.BrazePushReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.facebook.CurrentAccessTokenExpirationBroadcastReceiver` | `false` | `ACTION_CURRENT_ACCESS_TOKEN_CHANGED` | مستقبل بث داخلي |
| `com.google.firebase.iid.FirebaseInstanceIdReceiver` | `true` | `RECEIVE` | مستقبل بث داخلي |
| `com.google.android.gms.measurement.AppMeasurementReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `androidx.work.impl.utils.ForceStopRunnable$BroadcastReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `androidx.work.impl.background.systemalarm.ConstraintProxy$BatteryChargingProxy` | `false` | `ACTION_POWER_CONNECTED`<br>`ACTION_POWER_DISCONNECTED` | مراقبة شحن الهاتف وانخفاض البطارية |
| `androidx.work.impl.background.systemalarm.ConstraintProxy$BatteryNotLowProxy` | `false` | `BATTERY_OKAY`<br>`BATTERY_LOW` | مراقبة شحن الهاتف وانخفاض البطارية |
| `androidx.work.impl.background.systemalarm.ConstraintProxy$StorageNotLowProxy` | `false` | `DEVICE_STORAGE_LOW`<br>`DEVICE_STORAGE_OK` | مستقبل بث داخلي |
| `androidx.work.impl.background.systemalarm.ConstraintProxy$NetworkStateProxy` | `false` | `CONNECTIVITY_CHANGE` | إعادة الاتصال وتفريغ ذاكرة التخزين المؤقتة عند توفر الإنترنت |
| `androidx.work.impl.background.systemalarm.RescheduleReceiver` | `false` | `BOOT_COMPLETED`<br>`TIME_SET`<br>`TIMEZONE_CHANGED` | إعادة تشغيل محرك التتبع فور إقلاع الهاتف |
| `androidx.work.impl.background.systemalarm.ConstraintProxyUpdateReceiver` | `false` | `UpdateProxies` | مستقبل بث داخلي |
| `androidx.work.impl.diagnostics.DiagnosticsReceiver` | `true` | `REQUEST_DIAGNOSTICS` | مستقبل بث داخلي |
| `com.launchdarkly.sdk.android.PollingUpdater` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.launchdarkly.sdk.android.ConnectivityReceiver` | `false` | `CONNECTIVITY_CHANGE` | مستقبل بث داخلي |
| `com.google.android.datatransport.runtime.scheduling.jobscheduling.AlarmManagerSchedulerBroadcastReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.arity.coreEngine.sensors.ActivityDataManager$ActivityBroadcastReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.arity.coreEngine.sensors.LocationDataManager$LocationBroadcastReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.arity.coreEngine.InternalConfiguration.InternalConfigurationDownloadHelper$InternalConfigFetchReceiver` | `false` | `ACTION_NEXT_KVM_DOWNLOAD_ALARM` | مستقبل بث داخلي |
| `com.arity.coreEngine.sensors.TransitionDataManager$TransitionBroadcastReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.arity.coreEngine.driving.monitors.ProcessRecreateMonitor$ProcessRecreateBroadCastReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |
| `com.appboy.receivers.AppboyActionReceiver` | `false` | *داخلي / صريح (Explicit)* | مستقبل بث داخلي |

## 5. جدول مزودات المحتوى (Content Providers)
| اسم المزود (Content Provider) | Exported | Authorities | الوظيفة المعمارية |
|---|---|---|---|
| `com.life360.android.history.data.HistoryRequestProvider` | `false` | `com.life360.android.safetymapd.HistoryRequests` | مزود محتوى مهيئ |
| `com.life360.android.logging.ServiceProcessLogProvider` | `false` | `com.life360.android.safetymapd.service_file_log_provider` | مزود محتوى مهيئ |
| `androidx.core.content.FileProvider` | `false` | `com.life360.android.safetymapd.file_provider` | مشاركة الصور وسجلات الرحلات بشكل آمن |
| `com.life360.android.shared.L360MainAppInitProvider` | `false` | `com.life360.android.safetymapd.context.l360MainAppInitProvider` | مزود محتوى مهيئ |
| `com.life360.android.shared.L360ServiceAppInitProvider` | `false` | `com.life360.android.safetymapd.context.l360ServiceAppInitProvider` | مزود محتوى مهيئ |
| `com.life360.android.genesisengineapi.eventskit.BackgroundProcessContentProvider` | `false` | `com.life360.android.safetymapd.background_process_events_provider` | مزود محتوى مهيئ |
| `com.life360.android.genesisengineapi.eventskit.MainProcessContentProvider` | `false` | `com.life360.android.safetymapd.main_process_events_provider` | مزود محتوى مهيئ |
| `com.berbix.berbixverify.bitmap.BerbixCameraFileProvider` | `false` | `com.life360.android.safetymapd.berbix.fileprovider` | مشاركة الصور وسجلات الرحلات بشكل آمن |
| `zendesk.support.SupportSdkStartupProvider` | `false` | `com.life360.android.safetymapd.zendesk.support.SupportSdkStartupProvider` | مزود محتوى مهيئ |
| `zendesk.support.guide.GuideSdkStartupProvider` | `false` | `com.life360.android.safetymapd.zendesk.support.GuideSdkStartupProvider` | مزود محتوى مهيئ |
| `com.google.firebase.perf.provider.FirebasePerfProvider` | `false` | `com.life360.android.safetymapd.firebaseperfprovider` | التهيئة التلقائية لمكتبة Firebase بدون كود برمجي |
| `com.facebook.internal.FacebookInitProvider` | `false` | `com.life360.android.safetymapd.FacebookInitProvider` | مزود محتوى مهيئ |
| `com.squareup.picasso.PicassoProvider` | `false` | `com.life360.android.safetymapd.com.squareup.picasso` | مزود محتوى مهيئ |
| `com.google.mlkit.common.internal.MlKitInitProvider` | `false` | `com.life360.android.safetymapd.mlkitinitprovider` | مزود محتوى مهيئ |
| `zendesk.belvedere.BelvedereFileProvider` | `false` | `com.life360.android.safetymapd.belvedere2.attachments` | مشاركة الصور وسجلات الرحلات بشكل آمن |
| `androidx.lifecycle.ProcessLifecycleOwnerInitializer` | `false` | `com.life360.android.safetymapd.lifecycle-process` | مراقبة دورة حياة التطبيق عبر ProcessLifecycleOwner |