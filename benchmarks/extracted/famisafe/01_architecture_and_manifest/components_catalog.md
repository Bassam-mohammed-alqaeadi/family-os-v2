# Wondershare FamiSafe — Android Components Catalog (100% Exhaustive)

> **Package:** com.wondershare.famisafe  
> **Version:** 7.2.5.9669 (Build 9669)  
> **Target SDK:** 33 (Android 13) | **Min SDK:** 19 (Android 4.4)  
> **Total Components:** 156 (124 Activities, 15 Services, 11 Receivers, 6 Providers)

---

## 1. Activities Catalog (124 Activities)

| # | Activity Class Name | Exported | Intent Filters / Schemes / Deep Links | Architectural Purpose |
|---|---------------------|----------|---------------------------------------|-----------------------|
| 1 | com.wondershare.famisafe.share.account.RegisterAct | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 2 | com.wondershare.famisafe.CheckRoleSplashActivity | true | Actions: android.intent.action.MAIN<br>Actions: android.intent.action.VIEW<br>Data: http://famisafe.page.link, https://famisafe.page.link<br>Actions: android.intent.action.VIEW<br>Data: famisafe://fb/deeplink1<br>Actions: android.intent.action.VIEW<br>Data: pchjzh://allapp.link | App Startup & Cold Boot Initialization |
| 3 | com.wondershare.famisafe.parent.SplashAgreementActivity | false | None (Internal) | App Startup & Cold Boot Initialization |
| 4 | com.sensorsdata.analytics.android.sdk.dialog.SchemeActivity | true | Actions: android.intent.action.VIEW<br>Data: sa1951ae34:// | Sub-feature Config / Dialog Container |
| 5 | com.wondershare.famisafe.parent.connect.HowToConnectVideoListActivity | false | None (Internal) | QR Code Pairing & Device Registration |
| 6 | com.wondershare.famisafe.parent.report.ReportActivity | false | None (Internal) | Daily / Weekly Activity Timeline & Aggregated Reports |
| 7 | com.wondershare.famisafe.parent.schedule.ScheduleActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 8 | com.wondershare.famisafe.parent.guide.AuthorizeWaitActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 9 | com.wondershare.famisafe.parent.tiro.TiroActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 10 | com.wondershare.famisafe.parent.OldChildFamiSafeErrorActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 11 | com.wondershare.famisafe.parent.account.PinSettingActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 12 | com.wondershare.famisafe.parent.guide.ConnectKidActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 13 | com.wondershare.famisafe.parent.guide.PairCodeActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 14 | com.wondershare.famisafe.parent.connect.ConnectDeviceActivity | false | None (Internal) | QR Code Pairing & Device Registration |
| 15 | com.wondershare.famisafe.parent.connect.ChildInfoSettingActivity | false | None (Internal) | QR Code Pairing & Device Registration |
| 16 | com.wondershare.famisafe.parent.location.LostLocationPermissionActivity | false | None (Internal) | Live GPS Tracking, Geofence Boundaries & Route History |
| 17 | com.wondershare.famisafe.parent.wgp.WGPMessageActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 18 | com.wondershare.famisafe.parent.guide.BenefitsActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 19 | com.wondershare.famisafe.parent.account.SubAccountActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 20 | com.wondershare.famisafe.parent.sms.SmsBaseAddActivity | false | None (Internal) | SMS & Call Log Telemetry UI |
| 21 | com.wondershare.famisafe.parent.screen.TemporarySetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 22 | com.wondershare.famisafe.parent.account.FeedbackActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 23 | com.wondershare.famisafe.parent.pin.PinActivity | false | None (Internal) | Security PIN & Tamper Prevention Gate |
| 24 | com.wondershare.famisafe.parent.account.InviteSubActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 25 | com.wondershare.famisafe.parent.sms.SmsBaseDetailActivity | false | None (Internal) | SMS & Call Log Telemetry UI |
| 26 | com.wondershare.famisafe.parent.explicit.ExplicitConnectActivity | false | None (Internal) | QR Code Pairing & Device Registration |
| 27 | com.wondershare.famisafe.parent.drive.DriveUnitSetActivity | false | None (Internal) | Driving Telemetry, Speed & Hard Braking Analytics |
| 28 | com.wondershare.famisafe.parent.rule.DeviceRuleActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 29 | com.wondershare.famisafe.parent.guide.InstallKidsActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 30 | com.wondershare.famisafe.parent.guide.ChooseRoleActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 31 | com.wondershare.famisafe.parent.location.geofence.GeofencesDetailActivity | false | None (Internal) | Live GPS Tracking, Geofence Boundaries & Route History |
| 32 | com.wondershare.famisafe.parent.feature.SecondMainActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 33 | com.wondershare.famisafe.parent.feature.FeatureContainerActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 34 | com.wondershare.famisafe.parent.feature.DashboardCardEditActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 35 | com.wondershare.famisafe.parent.notify.NotifyDetailActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 36 | com.wondershare.famisafe.parent.notify.NotificationSettingActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 37 | com.wondershare.famisafe.parent.screenv5.applimit.AppLimitSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 38 | com.wondershare.famisafe.parent.screenv5.applimit.AppLimitPCSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 39 | com.wondershare.famisafe.parent.screenv5.applimit.AppLimitMainActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 40 | com.wondershare.famisafe.parent.screenv5.supervised.block.IosOldBlockSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 41 | com.wondershare.famisafe.parent.screenv5.supervised.SupervisedLimitMainActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 42 | com.wondershare.famisafe.parent.screenv5.supervised.SupervisedGuidActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 43 | com.wondershare.famisafe.parent.screenv5.supervised.SupervisedAppSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 44 | com.wondershare.famisafe.parent.screenv5.supervised.SupervisedBlockSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 45 | com.wondershare.famisafe.parent.screenv5.WhiteListIosActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 46 | com.wondershare.famisafe.parent.screenv5.ScreenTimeIosActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 47 | com.wondershare.famisafe.parent.screenv5.usage.UsageBlockActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 48 | com.wondershare.famisafe.parent.screenv5.usage.AppBlockAndroidActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 49 | com.wondershare.famisafe.parent.screenv5.schedule.ScheduleAddActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 50 | com.wondershare.famisafe.parent.screenv5.screenlimit.ScreenLimitActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 51 | com.wondershare.famisafe.parent.account.DeviceManageActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 52 | com.wondershare.famisafe.parent.account.VpnManageActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 53 | com.wondershare.famisafe.parent.audio.activity.RecordingFileActivity | false | None (Internal) | One-Way Ambient Audio Monitor & FFT Analyzer |
| 54 | com.wondershare.famisafe.parent.account.AccountLanguageActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 55 | com.wondershare.famisafe.parent.account.AccountUninstallActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 56 | com.wondershare.famisafe.parent.account.AccountSettingActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 57 | com.wondershare.famisafe.parent.explicit.ExplicitBaseActivity | false | None (Internal) | Suspicious Photos & Dangerous Text Scanner |
| 58 | com.wondershare.famisafe.parent.explicit.ExplicitYoutubeActivity | false | None (Internal) | YouTube & Video History / Keyword Filter |
| 59 | com.wondershare.famisafe.parent.actlog.ActLogDetailsActivity | false | None (Internal) | Daily / Weekly Activity Timeline & Aggregated Reports |
| 60 | com.wondershare.famisafe.parent.filter.SetWebFilterctivity | false | None (Internal) | Web SafeSearch & Domain Blacklist Config |
| 61 | com.wondershare.famisafe.parent.search.SetSearchActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 62 | com.wondershare.famisafe.parent.screen.ScreenTimeSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 63 | com.wondershare.famisafe.parent.account.SubscriptionStatusActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 64 | com.wondershare.famisafe.parent.screen.TimeLimitActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 65 | com.wondershare.famisafe.parent.screenv5.usage.BlockLimitSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 66 | com.wondershare.famisafe.parent.dashboard.card.DashboardMessageActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 67 | com.wondershare.famisafe.parent.dashboard.AndroidMdmGuidActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 68 | com.wondershare.famisafe.parent.guide.Guide3Activity | false | None (Internal) | Onboarding & Permission Wizard |
| 69 | com.wondershare.famisafe.parent.appusage.block.AppBlockIosSetActivity | false | None (Internal) | Instant Block / Overlay Lock Enforcer |
| 70 | com.wondershare.famisafe.parent.screenv5.supervised.block.SupervisedAppBlockSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 71 | com.wondershare.famisafe.parent.screenv5.supervised.block.SupervisedRatingActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 72 | com.wondershare.famisafe.parent.nsfw.NsfwSettingAct | false | None (Internal) | Suspicious Photos & Dangerous Text Scanner |
| 73 | com.wondershare.famisafe.parent.reconnect.ReconnectActivity | false | None (Internal) | QR Code Pairing & Device Registration |
| 74 | com.wondershare.famisafe.parent.home.MainParentActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 75 | com.wondershare.famisafe.parent.sms.SmsBaseActivity | false | None (Internal) | SMS & Call Log Telemetry UI |
| 76 | com.wondershare.famisafe.parent.sms.SmsAdditionAddActivity | false | None (Internal) | SMS & Call Log Telemetry UI |
| 77 | com.wondershare.famisafe.parent.account.AboutAct | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 78 | com.wondershare.famisafe.parent.feature.AllFeatureActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 79 | com.wondershare.famisafe.parent.auth.YoutubeAuthActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 80 | com.wondershare.famisafe.parent.guide.GuideInstallActivity | false | None (Internal) | Onboarding & Permission Wizard |
| 81 | com.wondershare.famisafe.parent.other.WebActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 82 | com.wondershare.famisafe.parent.appusage.AppUsageIosActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 83 | com.wondershare.famisafe.parent.screenv5.schedule.ScheduleMainActivity | false | None (Internal) | Parent Primary Executive Dashboard |
| 84 | com.wondershare.famisafe.parent.location.geofence.SearchLocationActivity | false | None (Internal) | Live GPS Tracking, Geofence Boundaries & Route History |
| 85 | com.wondershare.famisafe.parent.location.geofence.AddPlaceActivity | false | None (Internal) | Live GPS Tracking, Geofence Boundaries & Route History |
| 86 | com.wondershare.famisafe.parent.youtube.YoutubeBlockListActivity | false | None (Internal) | Instant Block / Overlay Lock Enforcer |
| 87 | com.wondershare.famisafe.parent.drive.DriveDetailMapActivity | false | None (Internal) | Driving Telemetry, Speed & Hard Braking Analytics |
| 88 | com.wondershare.famisafe.parent.drive.DriveSpeedSetActivity | false | None (Internal) | Driving Telemetry, Speed & Hard Braking Analytics |
| 89 | com.wondershare.famisafe.parent.drive.DriveSetActivity | false | None (Internal) | Driving Telemetry, Speed & Hard Braking Analytics |
| 90 | com.wondershare.famisafe.parent.nsfw.PhotoPreviewActivity | false | None (Internal) | Suspicious Photos & Dangerous Text Scanner |
| 91 | com.wondershare.famisafe.parent.screenviewer.activity.ScreenViewerPreviewPictureActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 92 | com.wondershare.famisafe.parent.apprules.activity.AppRulesSettingActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 93 | com.wondershare.famisafe.parent.apprules.activity.AppLimitCategoriesActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 94 | com.wondershare.famisafe.parent.apprules.activity.AppLimitCategoriesIosActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 95 | com.wondershare.famisafe.parent.apprules.activity.AppInfoDetailsActivity | false | None (Internal) | Security PIN & Tamper Prevention Gate |
| 96 | com.wondershare.famisafe.parent.apprules.activity.AppRulesLimitActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 97 | com.wondershare.famisafe.parent.location.SosSwitchActivity | false | None (Internal) | Live GPS Tracking, Geofence Boundaries & Route History |
| 98 | com.wondershare.famisafe.parent.screen.AppBlockSetActivity | false | None (Internal) | Screen Time Rules & App Allowance Config |
| 99 | com.wondershare.famsiafe.billing.PayActivity | true | None (Internal) | Subscription Tier & In-App Purchase Gateway |
| 100 | com.wondershare.famisafe.share.CommonWebActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 101 | com.wondershare.famisafe.share.account.LoginHomeActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 102 | com.wondershare.famisafe.share.account.SetPwdActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 103 | com.wondershare.famisafe.share.account.VerifyEmailActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 104 | com.wondershare.famisafe.share.TotalWebActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 105 | com.wondershare.famisafe.share.account.CodeLoginActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 106 | com.wondershare.famisafe.share.account.scan.LiteCaptureActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 107 | com.wondershare.famisafe.share.account.SetLoginInfoActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 108 | com.wondershare.famisafe.share.account.SplashBaseActivity | false | None (Internal) | App Startup & Cold Boot Initialization |
| 109 | com.wondershare.famisafe.share.base.IBaseActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 110 | com.wondershare.famisafe.share.account.AgreementAct | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 111 | com.wondershare.famisafe.share.base.BaseActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 112 | com.wondershare.famisafe.share.account.ForgetPsdActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 113 | com.wondershare.famisafe.share.account.LoginAct | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 114 | com.wondershare.famisafe.share.account.GuestRegisterActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 115 | com.wondershare.famisafe.share.account.RoleActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 116 | com.wondershare.famisafe.share.login.WsidWebActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 117 | com.wondershare.famisafe.share.VideoPlayActivity | false | None (Internal) | YouTube & Video History / Keyword Filter |
| 118 | com.facebook.FacebookActivity |  | None (Internal) | Sub-feature Config / Dialog Container |
| 119 | com.facebook.CustomTabMainActivity |  | None (Internal) | Parent Primary Executive Dashboard |
| 120 | com.facebook.CustomTabActivity | true | Actions: android.intent.action.VIEW<br>Data: fbconnect://cct.com.wondershare.famisafe | Sub-feature Config / Dialog Container |
| 121 | com.google.android.gms.auth.api.signin.internal.SignInHubActivity | false | None (Internal) | Parent/Child Account Authentication & SSO |
| 122 | com.google.android.gms.common.api.GoogleApiActivity | false | None (Internal) | Sub-feature Config / Dialog Container |
| 123 | com.android.billingclient.api.ProxyBillingActivity | false | None (Internal) | Subscription Tier & In-App Purchase Gateway |
| 124 | com.google.android.play.core.common.PlayCoreDialogWrapperActivity | false | None (Internal) | Sub-feature Config / Dialog Container |

---

## 2. Services Catalog (15 Services)

| # | Service Class Name | Exported | Permission Required | Actions / Trigger |
|---|--------------------|----------|---------------------|-------------------|
| 1 | com.wondershare.famisafe.parent.ParentNotifyService | true | None | Internal |
| 2 | com.wondershare.famisafe.share.FirebaseMessageReceiver | false | None | com.google.firebase.MESSAGING_EVENT |
| 3 | com.google.firebase.components.ComponentDiscoveryService | false | None | Internal |
| 4 | com.google.android.gms.auth.api.signin.RevocationBoundService | true | com.google.android.gms.auth.api.signin.permission.REVOCATION_NOTIFICATION | Internal |
| 5 | com.google.firebase.messaging.FirebaseMessagingService | false | None | com.google.firebase.MESSAGING_EVENT |
| 6 | com.google.android.gms.measurement.AppMeasurementService | false | None | Internal |
| 7 | com.google.android.gms.measurement.AppMeasurementJobService | false | android.permission.BIND_JOB_SERVICE | Internal |
| 8 | com.evernote.android.job.v21.PlatformJobService | false | android.permission.BIND_JOB_SERVICE | Internal |
| 9 | com.evernote.android.job.v14.PlatformAlarmService | false | android.permission.BIND_JOB_SERVICE | Internal |
| 10 | com.evernote.android.job.v14.PlatformAlarmServiceExact | false | None | Internal |
| 11 | com.evernote.android.job.gcm.PlatformGcmService | true | com.google.android.gms.permission.BIND_NETWORK_TASK_SERVICE | com.google.android.gms.gcm.ACTION_TASK_READY |
| 12 | com.evernote.android.job.JobRescheduleService | false | android.permission.BIND_JOB_SERVICE | Internal |
| 13 | androidx.room.MultiInstanceInvalidationService | false | None | Internal |
| 14 | com.google.android.datatransport.runtime.backends.TransportBackendDiscovery | false | None | Internal |
| 15 | com.google.android.datatransport.runtime.scheduling.jobscheduling.JobInfoSchedulerService | false | android.permission.BIND_JOB_SERVICE | Internal |

---

## 3. Broadcast Receivers Catalog (11 Receivers)

| # | Receiver Class Name | Exported | Permission Required | Subscribed Actions |
|---|---------------------|----------|---------------------|--------------------|
| 1 | com.wondershare.famisafe.parent.reconnect.NetworkReconnectReceiver | true | None | Internal |
| 2 | com.wondershare.famisafe.parent.abtest.ParentJobCreator$AddReceiver | false | None | com.evernote.android.job.ADD_JOB_CREATOR |
| 3 | com.appsflyer.SingleInstallBroadcastReceiver | true | None | com.android.vending.INSTALL_REFERRER |
| 4 | com.wondershare.famisafe.common.analytical.NetWorkStateReceiver | false | None | android.net.conn.CONNECTIVITY_CHANGE |
| 5 | com.google.firebase.iid.FirebaseInstanceIdReceiver | true | com.google.android.c2dm.permission.SEND | com.google.android.c2dm.intent.RECEIVE |
| 6 | com.google.android.gms.measurement.AppMeasurementReceiver | false | None | Internal |
| 7 | com.facebook.CurrentAccessTokenExpirationBroadcastReceiver | false | None | com.facebook.sdk.ACTION_CURRENT_ACCESS_TOKEN_CHANGED |
| 8 | com.facebook.AuthenticationTokenManager$CurrentAuthenticationTokenChangedBroadcastReceiver | false | None | com.facebook.sdk.ACTION_CURRENT_AUTHENTICATION_TOKEN_CHANGED |
| 9 | com.evernote.android.job.v14.PlatformAlarmReceiver | false | None | com.evernote.android.job.v14.RUN_JOB, net.vrallev.android.job.v14.RUN_JOB |
| 10 | com.evernote.android.job.JobBootReceiver | false | None | android.intent.action.BOOT_COMPLETED, android.intent.action.QUICKBOOT_POWERON, com.htc.intent.action.QUICKBOOT_POWERON, android.intent.action.MY_PACKAGE_REPLACED |
| 11 | com.google.android.datatransport.runtime.scheduling.jobscheduling.AlarmManagerSchedulerBroadcastReceiver | false | None | Internal |

---

## 4. Content Providers Catalog (6 Providers)

| # | Provider Class Name | Authorities | Exported | Architectural Purpose |
|---|---------------------|-------------|----------|-----------------------|
| 1 | androidx.core.content.FileProvider | com.wondershare.famisafe.fileprovider | false | Data Sharing / Jetpack App Startup Init |
| 2 | androidx.startup.InitializationProvider | com.wondershare.famisafe.androidx-startup | false | Data Sharing / Jetpack App Startup Init |
| 3 | com.google.firebase.provider.FirebaseInitProvider | com.wondershare.famisafe.firebaseinitprovider | false | Data Sharing / Jetpack App Startup Init |
| 4 | com.facebook.internal.FacebookInitProvider | com.wondershare.famisafe.FacebookInitProvider | false | Data Sharing / Jetpack App Startup Init |
| 5 | razerdp.basepopup.BasePopupInitializer | com.github.razerdp.com.wondershare.famisafe.BasePopupInitializer | false | Data Sharing / Jetpack App Startup Init |
| 6 | com.sensorsdata.analytics.android.sdk.data.SensorsDataContentProvider | com.wondershare.famisafe.SensorsDataContentProvider | false | Data Sharing / Jetpack App Startup Init |
