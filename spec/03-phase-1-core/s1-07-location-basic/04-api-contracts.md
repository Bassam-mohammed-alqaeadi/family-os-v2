---
id: S1-07
title: عقود الواجهات والشبكة — الموقع وزر الاستغاثة
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-07/03-data-model, D-020, D-025, D-031]
last_updated: 2026-10-30
---
# S1-07: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-07 — location-basic`  
> **البروتوكول:** RESTful JSON عبر HTTPS + بث WebSocket اللحظي للخريطة وإنذارات الطوارئ + أحداث Transactional Outbox (D-020).

---

## 1. نقاط النهاية للموقع والخريطة (Location & Map Endpoints)

### أ) بث إحداثيات موقع الجهاز الحالي: `POST /v1/location/ping`
- **الوصف:** إرسال تحديث الموقع الدوري من خدمة الخلفية بعد تصفيته بـ Kalman Filter.
- **الطلب (Request Body):**
```json
{
  "latitude": 24.7136,
  "longitude": 46.6753,
  "accuracy_meters": 4.5,
  "altitude_meters": 612.0,
  "speed_mps": 0.0,
  "battery_level": 82,
  "is_charging": false,
  "recorded_at": "2026-10-30T16:30:00Z"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "ACKNOWLEDGED",
  "next_ping_interval_seconds": 60 // تكيفي بحسب حركة وسكون الهاتف
}
```

### ب) جلب مواقع أفراد الأسرة للخريطة: `GET /v1/location/family/current`
- **المصادقة:** Bearer Token مطلوب.
- **الاستجابة (Response 200 OK):**
```json
{
  "family_id": "fam-uuid-1",
  "members": [
    {
      "user_id": "user-uuid-child",
      "display_name": "عمر",
      "avatar_color_hex": "#CF5B2C",
      "latitude": 24.7136,
      "longitude": 46.6753,
      "accuracy_meters": 4.5,
      "battery_level": 82,
      "is_charging": false,
      "is_online": true,
      "last_seen_at": "2026-10-30T16:30:00Z"
    }
  ]
}
```

---

## 2. نقاط النهاية لنداء الاستغاثة الطارئ SOS (Emergency Endpoints)

### أ) تفعيل إنذار الاستغاثة: `POST /v1/location/sos/trigger`
- **الوصف:** يُستدعى فور اكتمال الضغط المطول لـ 3 ثوانٍ على زر SOS.
- **الطلب (Request Body):**
```json
{
  "latitude": 24.7136,
  "longitude": 46.6753,
  "accuracy_meters": 5.0,
  "trigger_channel": "IN_APP_LONG_PRESS",
  "battery_level": 65
}
```
- **الاستجابة (Response 201 Created):**
```json
{
  "sos_incident_id": "sos-uuid-999",
  "status": "ACTIVE_ESCALATION",
  "notified_contacts_count": 2,
  "created_at": "2026-10-30T16:32:00Z"
}
```

### ب) إلغاء وتأكيد سلامة الطفل: `POST /v1/location/sos/:incidentId/resolve`
- **المصادقة:** Bearer Token مطلوب (L0 أو L1 فقط مع Father PIN).
- **الطلب (Request Body):**
```json
{
  "father_pin": "982143",
  "resolution_status": "RESOLVED_SAFE", // "RESOLVED_SAFE" | "FALSE_ALARM"
  "notes_ar": "تم العثور على عمر وهو بخير ولله الحمد"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "INCIDENT_RESOLVED",
  "incident_id": "sos-uuid-999",
  "resolved_at": "2026-10-30T16:35:00Z"
}
```

---

## 3. إطارات البث اللحظي عبر WebSocket

- **تحديث حركة العضو الحية (`location.member_moved`):**
  - يُبث كل 15-30 ثانية أثناء حركة العضو لتحريك الدبوس بسلاسة على خريطة الوالدين.
- **إنذار الطوارئ عالي الأولوية (`location.sos_triggered`):**
  - يُبث فورياً لجميع أجهزة العائلة مع إطلاق الإنذار الصوتي وتوجيه الكاميرا لموقع الاستغاثة.
