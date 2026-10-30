---
id: S1-01
title: عقود الواجهات البرمجية — غلاف التطبيق والمنصة
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-01/00-analysis, S1-01/03-data-model, D-026, D-031]
last_updated: 2026-10-30
---
# S1-01: عقود الواجهات البرمجية (API Contracts & Integration Protocols)

> **النظام:** `S1-01 — app-shell-and-platform`  
> **البروتوكولات:** REST API (HTTPS/JSON) + WebSocket (WSS) + Flutter Platform Channels  
> **الاستخلاص المرجعي:** `[REF:benchmarks/extracted/telegram/]` (تنسيق الحزم المتسلسلة)، `[REF:benchmarks/extracted/life360/]` (قناة استيعاب الدفعات والبيكون الصامت).

---

## 1. واجهات خادم المنصة (Backend REST APIs)

### 1.1 تهيئة الغلاف ومزامنة الملف الأولي (`POST /v1/platform/bootstrap`)
* **الغرض:** يُستدعى فور فتح التطبيق لتزويد الغلاف بكافة المعايير التشغيلية المخصصة للمستخدم وجهازه.
* **الترويسات (Headers):**
  - `Authorization: Bearer <session_token>`
  - `X-App-Version: 1.0.0`
  - `X-Device-Id: dev_98231a`
  - `X-Country-Code: SA` (أو `YE`)

**جسم الطلب (Request Payload):**
```json
{
  "client_platform": "FLUTTER_ANDROID",
  "device_model": "Samsung Galaxy S23",
  "os_version": "14",
  "app_locale": "ar-SA",
  "cached_config_version": "v1.4.2"
}
```

**الرد الناجح (Response 200 OK):**
```json
{
  "status": "SUCCESS",
  "data": {
    "session_id": "sess_88192a01",
    "active_member": {
      "member_id": "mem_001",
      "display_name": "سعود (الأب)",
      "avatar_url": "https://cdn.familyos.app/avatars/dad.webp",
      "role_level": 0,
      "experience_profile": "command"
    },
    "family_profile": {
      "family_id": "fam_7712",
      "family_name": "عائلة آل سعود",
      "plan_tier": "PREMIUM",
      "members_count": 5
    },
    "country_profile": {
      "country_code": "SA",
      "tier": "TIER_A",
      "primary_currency": "SAR",
      "low_bandwidth_enforced": false,
      "emergency_police": "999"
    },
    "feature_flags": {
      "enable_smart_learning": true,
      "enable_live_audio": true,
      "global_kill_switch": false
    },
    "server_time_utc": 1730248800000
  }
}
```

---

### 1.2 تفريغ طابور العمليات غير المتصلة (`POST /v1/platform/outbox/batch-sync`)
* **الغرض:** رفع الأحداث المجمعة التي أنجزها المستخدم أثناء انقطاع الشبكة (Transactional Outbox Ingestion).
* **دعم الضغط:** يدعم هيدر `Content-Encoding: br` (Brotli) لتوفير الباندويث في اليمن (Tier B).

**جسم الطلب (Request Payload):**
```json
{
  "device_id": "dev_98231a",
  "batch_id": "batch_9921",
  "events_count": 2,
  "events": [
    {
      "event_id": "evt_outbox_01",
      "domain": "chores",
      "action_type": "TASK_COMPLETED",
      "member_id": "mem_003",
      "payload": {
        "task_id": "task_math_hw",
        "completed_at": 1730248500000
      },
      "local_timestamp": 1730248500000
    },
    {
      "event_id": "evt_outbox_02",
      "domain": "learning",
      "action_type": "CARD_REVIEWED",
      "member_id": "mem_003",
      "payload": {
        "card_id": "card_5501",
        "quality": 4
      },
      "local_timestamp": 1730248520000
    }
  ]
}
```

**الرد الناجح (Response 200 OK):**
```json
{
  "status": "PROCESSED",
  "acknowledged_event_ids": ["evt_outbox_01", "evt_outbox_02"],
  "failed_event_ids": []
}
```

---

### 1.3 بيكون رصد صحة الجهاز الصامت (`POST /v1/platform/device/health`)
* **الغرض:** استعارة محرك `devicehealth` في Life360 لإبلاغ الخادم بسلامة التطبيق بالخلفية دون إزعاج المستخدم.

**جسم الطلب (Request Payload):**
```json
{
  "device_id": "dev_98231a",
  "battery_percentage": 78,
  "is_charging": false,
  "network_type": "WIFI",
  "background_service_status": "HEALTHY",
  "storage_free_mb": 4210
}
```

---

## 2. بروتوكول البث اللحظي عبر WebSocket (Platform Event Bus)

* **القناة المشتركة:** `family_{family_id}_platform_stream`
* **رسائل الغلاف اللحظية (Event Frames):**

### أ) حدث تحديث صلاحية أو ملف تجربة فورياً (`PROFILE_ROLE_UPDATED`)
عندما يعدل الأب صلاحية أحد الأبناء، يُرسل الخادم هذا الحدث عبر WebSocket لتحديث واجهة هاتف الابن فورياً دون إعادة تسجيل الدخول:
```json
{
  "event": "PROFILE_ROLE_UPDATED",
  "target_member_id": "mem_003",
  "new_experience_profile": "teen",
  "timestamp": 1730249000000
}
```

### ب) حدث تفعيل مفتاح إيقاف طارئ (`EMERGENCY_KILL_SWITCH`)
إذا اكتُشف خلل في إحدى الميزات، يُبث هذا الأمر لإخفائها فورياً من شاشات المستخدمين:
```json
{
  "event": "EMERGENCY_KILL_SWITCH",
  "target_feature_key": "enable_ambient_listening",
  "action": "FORCE_DISABLE_IMMEDIATELY"
}
```

---

## 3. قنوات الربط المدمجة مع عتاد النظام (Flutter Platform Channels)

للتحكم بالأداء والأمان على مستوى الأجهزة، يوفر S1-01 قنوات تواصل محلية (`MethodChannel` و `EventChannel`):

```dart
// قناة التحكم بالنظام والعتاد
static const platformChannel = MethodChannel('com.familyos.shell/hardware');

// استدعاء التحقق من بصمة الوالد لبوابة Parent Gate
Future<bool> verifyParentBiometrics() async {
  try {
    final bool isVerified = await platformChannel.invokeMethod('verifyParentGate');
    return isVerified;
  } on PlatformException catch (e) {
    return false;
  }
}

// تفعيل الاهتزاز اللمسي عالي الدقة (Haptics)
Future<void> triggerHaptic(String hapticPattern) async {
  await platformChannel.invokeMethod('vibratePattern', {'pattern': hapticPattern});
}
```
