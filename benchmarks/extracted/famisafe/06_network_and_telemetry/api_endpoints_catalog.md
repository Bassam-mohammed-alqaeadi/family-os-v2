# Wondershare FamiSafe — REST API Endpoints Catalog (100% Exhaustive)

> **Target Package:** `com.wondershare.famisafe`  
> **Primary Base Domains:**  
> - `https://app-api-pro.famisafe.com` (Main Production API Gateway)  
> - `https://data-api.famisafe.com` (High-Volume Telemetry & Analytics)  
> - `https://accounts.wondershare.com` (Wondershare ID SSO & Profile)  
> - `https://api.wondershare.cc` (Cloud Microservices Backend)  
> **Total Endpoints Documented:** 159

---

## Authentication & User Account (12 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `GET` | `o/oauth2/revoke` | `a` | `@QueryMap Map<String, String> map` | `Call<ResponseBody>` |
| `POST` | `oauth2/v4/token` | `b` | `@FieldMap Map<String, String> map` | `Call<b>` |
| `GET` | `v1/member/auth-auto-login` | `v` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/auth-get` | `F` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<RequestTokenBean>>` |
| `GET` | `v1/member/auth-login` | `m` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<LoginBean>>` |
| `POST` | `v1/member/auth-login` | `o` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<LoginBean>>` |
| `GET` | `v1/member/auth-logout` | `f` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/auth-register` | `n` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<LoginBean>>` |
| `POST` | `v1/sub-account/delete` | `Y` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/sub-account/invite` | `j` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/member/match-code-login` | `h` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<WsidUserBean>>` |
| `POST` | `v5/member/user-client-token` | `C` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<WsidUserBean>>` |

---

## Child Device Management & Pairing (66 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `GET` | `/v1/member/enter` | `j1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `/v1/member/register-status` | `B` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<RegisterStatus>>` |
| `GET` | `/v4/match-code/device-get` | `w` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<PairCodeBean>>` |
| `POST` | `/v5/member/add-kid-info` | `T` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<ChildBindInfo>>` |
| `GET` | `v1/devices/activate-detail-get` | `D` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<ActDetailBean>>` |
| `GET` | `v1/devices/activate-log-get` | `a1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<ActivityReportLogBean>>>` |
| `POST` | `v1/devices/ad-info` | `j` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/devices/app-block-save` | `l1` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<ExpireBean>>` |
| `GET` | `v1/devices/app-whitelist-get` | `z0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<WhiteAppGetBean>>` |
| `POST` | `v1/devices/app-whitelist-save` | `O` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/browser-log-get` | `D0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<BroswerLogBean>>>` |
| `GET` | `v1/devices/geo-fence-del` | `F0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/geo-fence-get` | `c1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<GeoFenceBean>>>` |
| `GET` | `v1/devices/geo-fence-history-get` | `o0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<FenceBlockBean>>>` |
| `GET` | `v1/devices/geo-fence-save` | `M` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/geo-fence-update` | `d0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/get-device-sos-info` | `Y0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SosInfo>>` |
| `GET` | `v1/devices/get-sos-switch` | `e1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SosSwitchInfo>>` |
| `GET` | `v1/devices/gps-new-get` | `Z0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<GPSBean>>>` |
| `GET` | `v1/devices/gps-recent-get` | `I0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<GPSBean>>>` |
| `GET` | `v1/devices/info` | `N0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<CheckMdmBean>>` |
| `GET` | `v1/devices/live-location` | `i` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<GPSLiveBean>>` |
| `POST` | `v1/devices/location-feedback` | `F` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/new-push` | `R` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/devices/rename` | `X` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/schedule-del` | `g1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/social-apps-setting-get` | `b0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<ExplicitSwitchBean>>>` |
| `POST` | `v1/devices/social-apps-switch` | `l` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/devices/social-apps-switch` | `n0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/devices/sos-switch` | `W0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<SosSwitchInfo>>` |
| `GET` | `v1/devices/suspicious-img-get` | `h0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<NsfwPhotoBean>>>` |
| `GET` | `v1/devices/suspicious-img-ios-get` | `w0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<SusImgIos>>>` |
| `GET` | `v1/devices/suspicious-img-new-data` | `K` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SuspiciousImgSetting>>` |
| `GET` | `v1/devices/suspicious-img-setting-get` | `e` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SuspiciousImgSetting>>` |
| `GET` | `v1/devices/suspicious-img-setting-switch` | `N` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/devices/suspicious-img-url-generate` | `i0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<List<NsfwPhotoBean>>>` |
| `GET` | `v1/devices/unbind` | `t0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/web-filter-del` | `m` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/web-filter-get` | `k1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<WebFilterDataBean>>` |
| `POST` | `v1/devices/web-filter-save` | `C0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/youtube-block-list` | `W` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<YoutubeBlockListBean>>>` |
| `GET` | `v1/devices/youtube-block-save` | `S0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/devices/youtube-suspicious-get` | `J` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<YoutubeSuspicousBean>>>` |
| `GET` | `v1/member/access-refresh` | `B` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/allow` | `b1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/bind-register` | `a` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<LoginBean>>` |
| `GET` | `v1/member/devices` | `G0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DeviceBean>>` |
| `GET` | `v1/member/devices-info` | `Z` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DeviceBean>>` |
| `GET` | `v1/member/devices-info` | `x` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DeviceBean>>` |
| `GET` | `v1/member/monitor-info-save` | `C` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<InstallBean>>` |
| `GET` | `v1/member/password-forget` | `b` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/member/pin-close` | `r` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/pin-forget` | `D` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/pin-get` | `A` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<PinBean>>` |
| `GET` | `v1/member/pin-set` | `y` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/refresh-devices` | `a0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/member/request-gps` | `c` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<GPSLiveResultBean>>` |
| `GET` | `v1/member/subscription` | `y0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SubscriptionStatus>>` |
| `GET` | `v4/device/get-vpn-switch` | `z` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<EnableBean>>` |
| `POST` | `v4/device/save-vpn-switch` | `H` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v4/device/switch` | `J0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/member/email-captcha` | `e` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/member/email-captcha-validate` | `i` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/member/empower` | `d` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<EmpowerBean>>` |
| `POST` | `v5/member/guest-bind-email` | `k` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/member/reset-pwd` | `E` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |

---

## Screen Time & App Blocking (v4/v5) (23 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `POST` | `/v5/app-rules/block-apps` | `w` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `/v5/app-rules/compatible-old-data` | `a` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<RetBean>>` |
| `POST` | `/v5/app-rules/get-app-conflict-list` | `t` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<AppCheckRulesBean>>` |
| `POST` | `/v5/app-rules/none-rule-apps` | `E` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `/v5/app-rules/whitelist-apps` | `h1` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `/v5/screen-time/cancel-old` | `V` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `/v5/supervised/app-block-list` | `Q` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SupervisedBlockBean>>` |
| `POST` | `new-api/v1/screen-viewer/detail_del` | `q` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<ScreenViewResultBean>>` |
| `GET` | `new-api/v1/screen-viewer/get-image-list` | `s0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<ScreenViewerBean>>` |
| `POST` | `new-api/v1/screen-viewer/save-settings` | `l0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<ScreenViewResultBean>>` |
| `PUT` | `new-api/v1/screen-viewer/screenshot` | `x` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<ScreenViewResultBean>>` |
| `GET` | `v4/app-block/del` | `u0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v4/app-block/ios-get` | `o` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AppUsageIosBeanV4>>` |
| `POST` | `v4/app-block/save` | `L0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v4/app-block/save` | `s` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v4/screen-time/set` | `U0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<ScreenTimeBean>>` |
| `GET` | `v5/app-usage/new-get` | `k0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AppUsageChartV5>>` |
| `GET` | `v5/app-usage/new-get-mini` | `c0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AppUsageChartV5>>` |
| `GET` | `v5/screen-time/get` | `x0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<ScreenTimeV5Bean>>` |
| `GET` | `v5/supervised/app-block-del` | `I` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/supervised/app-block-save` | `E0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/supervised/app-block-save` | `g` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `v5/supervised/app-limit-name-set` | `i1` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |

---

## Driving Safety & Telemetry (3 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `GET` | `/v5/drive-safety/list` | `B0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DriveWeekBean>>` |
| `GET` | `v4/drive-safety/list` | `p0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DriveDetailBean>>` |
| `GET` | `v4/drive-safety/report` | `A` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DriveReportBean>>` |

---

## Web Filtering & SafeSearch (2 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `POST` | `v4/safe-search/block-save` | `G` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v4/safe-search/history-get` | `f0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SearchHistory>>` |

---

## Explicit Content & NSFW Image Alerts (9 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `POST` | `v5/suspicious/batch-del-keyword` | `H0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v5/suspicious/categories` | `f` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<SuspiciousBaseBean>>>` |
| `POST` | `v5/suspicious/category-switch` | `k` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v5/suspicious/delete-category` | `Q0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<Exception>>` |
| `POST` | `v5/suspicious/keyword-add` | `V0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v5/suspicious/keywords` | `A0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<SuspiciousWordBean>>>` |
| `GET` | `v5/suspicious/text` | `n1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SusTextBean>>` |
| `GET` | `v5/suspicious/top-keywords` | `S` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<TopSuspiciousWordBean>>>` |
| `GET` | `v5/suspicious/update-category-name` | `P` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<Exception>>` |

---

## YouTube & TikTok Monitoring (2 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `GET` | `v1/tiktok/history-get` | `e0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<TikTokBean>>` |
| `GET` | `v5/youtube/history-get` | `d1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<YoutubeControlBean>>` |

---

## Ambient Audio & Microphone (7 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `POST` | `new-api/v1/ambient-sound/delete-record-file` | `n` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<RetBean>>` |
| `GET` | `new-api/v1/ambient-sound/download-record-file` | `X0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBody>` |
| `GET` | `new-api/v1/ambient-sound/get-kid-status` | `L` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AudioStateBean>>` |
| `GET` | `new-api/v1/ambient-sound/get-record-file-list` | `o1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AudioRecordListBean>>` |
| `POST` | `new-api/v1/ambient-sound/modify-record-file-name` | `q0` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<RetBean>>` |
| `POST` | `new-api/v1/ambient-sound/recording-request` | `T0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AudioStartResponse>>` |
| `POST` | `new-api/v1/ambient-sound/recording-stop` | `r` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<RetBean>>` |

---

## Billing & Subscription (4 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `GET` | `/v5/payment/order-detail` | `f1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<OrderCreatedTimeBean>>` |
| `GET` | `v1/payment/get-subscribe` | `H` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<PurchaseBean>>` |
| `POST` | `v5/payment/notify` | `g` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<Object>>` |
| `GET` | `v5/payment/order` | `a` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<OrderBean>>` |

---

## Other Telemetry & Sync (31 Endpoints)

| HTTP Verb | Endpoint Path | Method Name | Parameters | Return Type |
|-----------|---------------|-------------|------------|-------------|
| `GET` | `/api/v1/prodweb/message/list` | `b` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<WGPMessageBean>>` |
| `POST` | `/api/v1/prodweb/message/update/unread` | `a` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `/geocoding/v5/mapbox.places/{longitude},{latitude}.json` | `a` | `@Path("longitude") String str, @Path("latitude") String str2, @Query("access_token") String str3, @Query("limit") int i9` | `Call<r3.a>` |
| `GET` | `/new-api/v1/manage/app-info` | `d` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AppDetailsBean>>` |
| `GET` | `/new-api/v1/manage/apps` | `v` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AppRulesBeans>>` |
| `GET` | `/new-api/v1/manage/category-save` | `g0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<ScheduleBean>>>` |
| `GET` | `/v5/apps/pc-app-list` | `v0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<PcUsageBean>>>` |
| `GET` | `/v5/data/dashboard` | `m1` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DashboardBeanV5>>` |
| `GET` | `/v5/data/rules` | `R0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<ScheduleWeekBean>>` |
| `GET` | `new-api/v1/activity` | `G` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<PromotionBean>>` |
| `GET` | `new-api/v1/manage/switch-get` | `r0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<AppDownloadSwitchBean>>` |
| `GET` | `new-api/v1/manage/switch-save` | `m0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<Boolean>>` |
| `GET` | `new-api/v1/push/callback` | `p` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/data-collect/event` | `s` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/gather/log` | `t` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `POST` | `v1/support/tickets` | `a` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v1/system/init` | `u` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<SystemInitBean>>` |
| `POST` | `v1/system/update-client` | `z` | `@QueryMap Map<String, String> map, @Body RequestBody requestBody` | `Observable<ResponseBean<String>>` |
| `GET` | `v4/dashboard/last-update-time` | `u` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DashboardDetailTimeBean>>` |
| `GET` | `v4/dashboard/limit-detail` | `q` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<DeviceRuleBean>>` |
| `GET` | `v4/match-code/get` | `c` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<PairCodeBean>>` |
| `GET` | `v5/apps/ios-whitelist-get` | `P0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<WhiteListIosBean>>` |
| `GET` | `v5/content-manage/get` | `K0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<ContentManageBean>>>` |
| `GET` | `v5/notification/list-get` | `y` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<NotifyDetailBean>>` |
| `GET` | `v5/notification/menus-get` | `O0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<NotifyMenu>>` |
| `GET` | `v5/notify/del` | `M0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v5/notify/setting-get` | `p` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<NotifySettingBean>>>` |
| `GET` | `v5/schedule/get` | `U` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<ScheduleBeanV5>>>` |
| `GET` | `v5/schedule/save` | `b` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |
| `GET` | `v5/temporary/apps` | `j0` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<List<TemporaryApp>>>` |
| `GET` | `v5/temporary/del` | `h` | `@QueryMap Map<String, String> map` | `Observable<ResponseBean<String>>` |

---

