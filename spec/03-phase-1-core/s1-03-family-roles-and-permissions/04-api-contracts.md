---
id: S1-03
title: عقود الواجهات والشبكة — الأدوار والصلاحيات
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-03/03-data-model, D-012, D-020]
last_updated: 2026-10-30
---
# S1-03: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-03 — family-roles-and-permissions`  
> **البروتوكول:** RESTful JSON عبر HTTPS + أحداث Transactional Outbox (D-020) + بث WebSocket لتحديثات الصلاحيات الفورية.

---

## 1. نقاط النهاية لإدارة وتفويض الصلاحيات (Permission Endpoints)

### أ) جلب الصلاحيات الفعالة للعضو: `GET /v1/permissions/members/:userId/effective`
- **المصادقة:** Bearer Token مطلوب.
- **الاستجابة (Response 200 OK):**
```json
{
  "user_id": "22222222-3333-4444-5555-666666666666",
  "role_level": "L1",
  "role_title": "أم العائلة",
  "is_owner": false,
  "grants": {
    "tasks.create": true,
    "tasks.approve_completion": true,
    "rewards.grant_points": true,
    "members.invite": true,
    "settings.manage": false
  },
  "version": 4
}
```

### ب) تحديث تفويضات صلاحيات العضو: `PUT /v1/permissions/members/:userId/grants`
- **المصادقة:** Bearer Token مطلوب (L0 أو L1 المصرح له).
- **الطلب (Request Body):**
```json
{
  "grants": [
    { "permission_key": "tasks.approve_completion", "is_granted": true },
    { "permission_key": "rewards.grant_points", "is_granted": true },
    { "permission_key": "settings.manage", "is_granted": false }
  ],
  "expected_version": 4, // للقفل التفاؤلي
  "father_pin": "982143" // إلزامي إن تضمن الطلب صلاحيات حساسة
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "UPDATED",
  "user_id": "22222222-3333-4444-5555-666666666666",
  "new_version": 5,
  "updated_at": "2026-10-30T10:15:30Z"
}
```

### ج) نقل ملكية العائلة المشدد: `POST /v1/family/transfer-ownership`
- **المصادقة:** Bearer Token مطلوب (L0 المالك الحالي حصراً).
- **الطلب (Request Body):**
```json
{
  "target_user_id": "22222222-3333-4444-5555-666666666666", // يجب أن يكون L1 بالغ
  "father_pin": "982143",
  "otp_verification_code": "512890"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "OWNERSHIP_TRANSFERRED",
  "new_owner_user_id": "22222222-3333-4444-5555-666666666666",
  "previous_owner_new_role": "L1",
  "transferred_at": "2026-10-30T10:16:00Z"
}
```

---

## 2. أحداث المجال والربط اللحظي (Transactional Outbox & WebSocket)

وفق مبدأ D-020، يُصدر النظام الأحداث التالية عبر `permissions_domain_events`:

1. `permissions.member.updated`:
   - يُبث فور تعديل أي صلاحية لأي فرد في الأسرة.
   - يتضمن `payload`: `{ "family_id": "...", "user_id": "...", "grants": {...}, "version": 5 }`.
   - يستمع تطبيق Flutter العميل لجهاز العضو المعني عبر قفل WebSocket، ويقوم بتحديث كاش Drift المحلي فوراً خلال أقل من **100ms**، مما يعيد تشكيل الواجهة وإظهار أو إخفاء الأزرار تلقائياً.
2. `permissions.ownership.transferred`:
   - يُبث لجميع أجهزة العائلة لتحديث شجرة القيادة والرتب.
3. `permissions.audit.recorded`:
   - يسجل الحدث في سجل التدقيق الأمني للشفافية العائلية.
