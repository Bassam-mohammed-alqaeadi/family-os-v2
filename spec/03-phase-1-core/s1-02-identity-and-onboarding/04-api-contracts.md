---
id: S1-02
title: عقود الواجهات والشبكة — الهوية والتهيئة
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-02/03-data-model, D-007, D-020, D-031, D-038]
last_updated: 2026-10-31
---
# S1-02: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-02 — identity-and-onboarding`  
> **البروتوكول:** RESTful JSON عبر HTTPS + أحداث Transactional Outbox (D-020) + WebSocket لتحديثات الانضمام الفورية.

---

## 1. نقاط النهاية للمصادقة وتدفق الهاتف (Authentication & Phone Endpoints)

### أ) طلب إرسال رمز التحقق: `POST /v1/auth/request-otp`
- **الوصف:** إرسال رمز تحقق مؤقت للرقم المحدد، مع التبديل الذكي للقناة (SMS أو WhatsApp).
- **الطلب (Request Body):**
```json
{
  "phone_e164": "+966501234567",
  "requested_channel": "SMS", // "SMS" | "WHATSAPP" | "VOICE_CALL"
  "device_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "locale": "ar"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "OTP_SENT",
  "phone_masked": "+966 50 *** *567",
  "channel_used": "SMS",
  "retry_after_seconds": 30,
  "can_fallback_to_whatsapp": true,
  "expires_in_seconds": 300
}
```

### ب) التحقق من الرمز واستلام الجلسة: `POST /v1/auth/verify-otp`
- **الوصف:** التحقق من مطابقة الرمز وتوليد جلسة مصادقة JWT جديدة.
- **الطلب (Request Body):**
```json
{
  "phone_e164": "+966501234567",
  "otp_code": "489210",
  "device_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "device_platform": "ANDROID",
  "device_name": "Samsung Galaxy S24"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "VERIFIED",
  "user": {
    "id": "11111111-2222-3333-4444-555555555555",
    "display_name": "سعد آل ناصر",
    "is_new_user": false,
    "has_family": true,
    "active_family_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    \"role\": \"owner\"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "refresh_token": "dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4...",
    "expires_in": 3600
  }
}
```

---

## 2. نقاط النهاية لتأسيس العائلة ودعوة الأعضاء (Family Circle Endpoints)

### أ) إنشاء عائلة جديدة: `POST /v1/family/create`
- **المصادقة:** Bearer Token مطلوب (المستخدم `owner`).
- **الطلب (Request Body):**
```json
{
  "family_name": "عائلة آل ناصر",
  "country_code": "SA",
  "father_pin": "982143" // يُشفر بـ Argon2id في الخادم
}
```
- **الاستجابة (Response 201 Created):**
```json
{
  "family_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "family_name": "عائلة آل ناصر",
  "owner_user_id": "11111111-2222-3333-4444-555555555555",
  "invite_code": "FAM-924-118"
}
```

### ب) إنشاء حساب طفل وتوليد كود الاقتران: `POST /v1/family/children/create-and-pair`
- **المصادقة:** Bearer Token مطلوب (`owner` أو `adult` مفوَّض فقط).
- **الطلب (Request Body):**
```json
{
  "display_name": "عمر",
  "birth_year": 2017,
  "avatar_color_hex": "#CF5B2C",
  "avatar_icon_id": "hero_falcon"
}
```
- **الاستجابة (Response 201 Created):**
```json
{
  "child_user_id": "cccccccc-dddd-eeee-ffff-000000000000",
  "pairing_token": "PAIR-TOKEN-CRYPT-XYZ987654321",
  "pairing_qr_payload": "familyos://pair?childId=cccccccc-dddd-eeee-ffff-000000000000&token=PAIR-TOKEN-CRYPT-XYZ987654321",
  "expires_in_seconds": 600
}
```

### ج) إتمام اقتران جهاز الطفل عبر QR: `POST /v1/auth/pair-child-device`
- **الوصف:** استدعاء من كاميرا هاتف الطفل فور مسح الـ QR.
- **الطلب (Request Body):**
```json
{
  "child_id": "cccccccc-dddd-eeee-ffff-000000000000",
  "pairing_token": "PAIR-TOKEN-CRYPT-XYZ987654321",
  "device_id": "device-uuid-child-phone",
  "device_platform": "ANDROID",
  "device_public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..."
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "PAIRED_SUCCESSFULLY",
  "child_user": {
    "id": "cccccccc-dddd-eeee-ffff-000000000000",
    "display_name": "عمر",
    \"role\": \"child\"
  },
  "tokens": {
    "access_token": "child-jwt-token...",
    "refresh_token": "child-refresh-token...",
    "expires_in": 2592000 // جلسة طويلة الأمد لأجهزة الأطفال (30 يوماً)
  }
}
```

---

## 3. أحداث المجال المشتركة (Transactional Outbox Events)

وفق مبدأ D-020، يُصدر النظام الأحداث التالية عبر `identity_domain_events`:
1. `identity.user.registered`: يُبث عند اكتمال أول دخول ناجح برقم الهاتف.
2. `identity.family.created`: يُبث عند تأسيس العائلة لتنشيط مساحات التخزين ومجلدات المحادثة.
3. `identity.member.joined`: يُبث لتحديث قائمة أعضاء العائلة في أجهزة الجميع فورياً عبر WebSocket.
4. `identity.child_device.paired`: يُبث لتنبيه هاتف الأب بنجاح اقتران هاتف طفله وبدء تفعيل حماية الغلاف.
