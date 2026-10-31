---
id: S1-03
title: عقود الواجهات والشبكة — الأدوار والصلاحيات
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-03/03-data-model, D-012, D-020, D-038]
last_updated: 2026-10-31
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
  "family_id": "11111111-2222-3333-4444-555555555555",
  "role": "adult",
  "role_title": "أم العائلة",
  "is_owner": false,
  "effective_grants": [
    {
      "permission_key": "tasks.approve_completion",
      "is_granted": true,
      "scope": "children_only",
      "valid_until": null
    },
    {
      "permission_key": "rewards.grant_points",
      "is_granted": true,
      "scope": "children_only",
      "valid_until": "2026-11-07T23:59:59Z"
    },
    {
      "permission_key": "members.invite_new",
      "is_granted": true,
      "scope": "all_members",
      "valid_until": null
    }
  ],
  "version": 5,
  "calculated_at": "2026-10-31T10:00:00Z"
}
```

### ب) تحديث تفويضات صلاحيات العضو: `PUT /v1/permissions/members/:userId/grants`
- **المصادقة:** Bearer Token مطلوب (المالك `owner` حصراً وفق D-038 ومصفوفة الصلاحيات).
- **الطلب (Request Body):**
```json
{
  "grants": [
    {
      "permission_key": "tasks.approve_completion",
      "is_granted": true,
      "scope": "children_only",
      "valid_until": null
    },
    {
      "permission_key": "rewards.grant_points",
      "is_granted": true,
      "scope": "children_only",
      "valid_until": "2026-11-07T23:59:59Z"
    }
  ],
  "expected_version": 4,
  "father_pin": "982143"
}
```
*(ملاحظة: `expected_version` للقفل التفاؤلي، و`father_pin` إلزامي إن تضمن الطلب صلاحيات حساسة).*
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "UPDATED",
  "user_id": "22222222-3333-4444-5555-666666666666",
  "new_version": 5,
  "updated_at": "2026-10-31T10:15:30Z"
}
```

### ج) نقل ملكية العائلة المشدد: `POST /v1/family/transfer-ownership`
- **المصادقة:** Bearer Token مطلوب (`owner` المالك الحالي حصراً).
- **الطلب (Request Body):**
```json
{
  "target_user_id": "22222222-3333-4444-5555-666666666666",
  "father_pin": "982143",
  "otp_verification_code": "512890"
}
```
*(ملاحظة: `target_user_id` يجب أن يكون عضواً بالغاً بدور `adult`).*
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "OWNERSHIP_TRANSFERRED",
  "new_owner_user_id": "22222222-3333-4444-5555-666666666666",
  "previous_owner_new_role": "adult",
  "transferred_at": "2026-10-31T10:16:00Z"
}
```

---

## 2. أحداث المجال والربط اللحظي (Transactional Outbox & WebSocket)

وفق مبدأ D-020، يُصدر النظام الأحداث التالية عبر `permissions_domain_events`:

1. `permissions.member.updated`:
   - يُبث فور تعديل أي صلاحية لأي فرد في الأسرة عبر Outbox و WebSocket.
   - بنية حمولة الحدث (`Event Payload`):
```json
{
  "event_name": "permissions.member.updated",
  "event_id": "99999999-aaaa-bbbb-cccc-dddddddddddd",
  "family_id": "11111111-2222-3333-4444-555555555555",
  "user_id": "22222222-3333-4444-5555-666666666666",
  "updated_by": "00000000-1111-2222-3333-444444444444",
  "grants": [
    {
      "permission_key": "tasks.approve_completion",
      "is_granted": true,
      "scope": "children_only",
      "valid_until": null
    },
    {
      "permission_key": "rewards.grant_points",
      "is_granted": true,
      "scope": "children_only",
      "valid_until": "2026-11-07T23:59:59Z"
    }
  ],
  "version": 5,
  "timestamp": "2026-10-31T10:15:30Z"
}
```
   - **دلالة حقل `grants` في الحدث (اعتمادية معمارية مفتوحة):**
     توضح الوثيقة أن دلالة `grants` داخل حمولة الحدث غير محسومة هندسياً في المواصفات الحالية: هل تمثل الحالة الكاملة الفعالة للصلاحيات (Full State Snapshot)، أم تمثل التغييرات والفروقات الجزئية فقط (Delta Diff)؟ وتُترك طريقة تطبيق الحمولة معلقة رهن حسم مالك المشروع.
   - يستمع تطبيق Flutter العميل لجهاز العضو المعني عبر قناة WebSocket، ويقوم بتحديث كاش Drift المحلي فوراً كهدف تصميمي غير مقاس (<100ms)، مما يعيد تشكيل الواجهة وإظهار أو إخفاء عناصر التحكم تلقائياً.
2. `permissions.ownership.transferred`:
   - يُبث لجميع أجهزة العائلة لتحديث شجرة القيادة والرتب.
3. `permissions.audit.recorded`:
   - يسجل الحدث في سجل التدقيق الأمني للشفافية العائلية.
