---
id: S1-05
title: عقود الواجهات والشبكة — المكافآت وسلاسل الإنجاز
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-05/03-data-model, D-012, D-020, D-038]
last_updated: 2026-10-31
---
# S1-05: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-05 — rewards-children`  
> **البروتوكول:** RESTful JSON عبر HTTPS + أحداث Transactional Outbox (D-020) + بث WebSocket لتحديث الرصيد اللحظي.

---

## 1. نقاط النهاية لمتجر الجوائز والمحفظة (Rewards Store Endpoints)

### أ) جلب رصيد المحفظة وسلسلة الإنجاز: `GET /v1/rewards/wallet/me`
- **المصادقة:** Bearer Token مطلوب (حساب الطفل `child` حصراً وفق D-012؛ ويُرفض أي طلب من البالغين أو المراهقين بكود `403 Forbidden`).
- **الاستجابة (Response 200 OK):**
```json
{
  "child_user_id": "child-uuid-omar",
  "balance_stars": 120,
  "current_streak_days": 7,
  "longest_streak_days": 14,
  "is_streak_frozen_today": false,
  "level_title_ar": "البطل الفضي 🥈",
  "next_milestone_days": 10
}
```

### ب) جلب كتالوج الجوائز المتاحة: `GET /v1/rewards/catalog`
- **المصادقة:** Bearer Token مطلوب.
- **الاستجابة (Response 200 OK):**
```json
{
  "family_id": "fam-uuid-1",
  "rewards": [
    {
      "id": "rew-uuid-1",
      "title_ar": "نزهة مع بابا بالدراجة الهوائية",
      "description_ar": "جولة لمدة ساعة في حديقة الحي مع آيس كريم",
      "cost_stars": 100,
      "category": "ACTIVITY",
      "icon_name": "bicycle_ride",
      "can_afford": true
    },
    {
      "id": "rew-uuid-2",
      "title_ar": "ساعة ألعاب فيديو إضافية",
      "description_ar": "وقت لعب إضافي في عطلة نهاية الأسبوع",
      "cost_stars": 150,
      "category": "ENTERTAINMENT",
      "icon_name": "gamepad",
      "can_afford": false
    }
  ]
}
```

### ج) تقديم طلب صرف مكافأة من الطفل: `POST /v1/rewards/redemptions/request`
- **الطلب (Request Body):**
```json
{
  "reward_id": "rew-uuid-1",
  "idempotency_key": "idemp-req-987654321"
}
```
- **الاستجابة (Response 201 Created):**
```json
{
  "status": "REQUEST_SUBMITTED",
  "request_id": "req-uuid-555",
  "remaining_balance": 20,
  "created_at": "2026-10-30T17:00:00Z"
}
```

---

## 2. نقاط النهاية لإدارة واعتماد الجوائز للوالدين (Parent Approval Endpoints)

### أ) اعتماد أو رفض طلب استبدال: `POST /v1/rewards/redemptions/:requestId/decide`
- **المصادقة:** Bearer Token مطلوب (`owner` أو `adult` مفوض فقط).
- **الطلب (Request Body):**
```json
{
  "decision": "APPROVE",
  "decision_notes": "أحسنت يا عمر موعدنا السبت إن شاء الله",
  "father_pin": "982143"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "DECISION_RECORDED",
  "request_id": "req-uuid-555",
  "new_status": "APPROVED",
  "decided_at": "2026-10-30T17:05:00Z"
}
```

### ب) تجميد السلسلة ليوم واحد (Streak Freeze): `POST /v1/rewards/children/:childId/freeze-streak`
- **المصادقة:** Bearer Token مطلوب (`owner` أو `adult` مفوض).
- **الطلب (Request Body):**
```json
{
  "reason_ar": "إجازة مرضية"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "STREAK_FROZEN_TODAY",
  "child_id": "child-uuid-omar",
  "maintained_streak_days": 7
}
```

---

## 3. أحداث المجال والتكامل عبر Outbox

1. `rewards.request.created`: يُبث لمركز القيادة S1-09 ليظهر كبند عاجل في بطاقة «يتطلب انتباهك».
2. `rewards.request.approved`: يُبث عبر WebSocket لهاتف الطفل لإطلاق الاحتفالية البصرية `SCR-S1-05-03`.
3. `rewards.streak.milestone_reached`: يُبث لمنح رصيد نجوم إضافي وترقية وسام الطفل في شجرة العائلة.
