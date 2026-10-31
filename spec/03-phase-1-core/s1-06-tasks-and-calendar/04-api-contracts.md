---
id: S1-06
title: عقود الواجهات والشبكة — المهام والتقويم المشترك
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-06/03-data-model, D-012, D-020, D-031]
last_updated: 2026-10-30
---
# S1-06: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-06 — tasks-and-calendar`  
> **البروتوكول:** RESTful JSON عبر HTTPS + أحداث Transactional Outbox (D-020) + بث WebSocket لتحديثات المهام اللحظية.

---

## 1. نقاط النهاية للمهام وإسنادها واعتمادها (Tasks Endpoints)

### أ) جلب مهام الأسرة: `GET /v1/tasks`
- **المعلمات:** `assigned_user_id=...&date=2026-10-30`.
- **الاستجابة (Response 200 OK):**
```json
{
  "tasks": [
    {
      "task_id": "tsk-uuid-1",
      "title_ar": "حل تمارين كتاب الرياضيات ص 45",
      "assigned_user_id": "child-uuid-omar",
      "assigned_user_name": "عمر",
      "reward_stars": 15,
      "due_date": "2026-10-30",
      "due_time": "17:30",
      "category": "SCHOOL",
      "status": "SUBMITTED_BY_CHILD",
      "submitted_at": "2026-10-30T14:10:00Z"
    }
  ]
}
```

### ب) إنشاء مهمة جديدة: `POST /v1/tasks`
- **المصادقة:** Bearer Token مطلوب (L0 أو L1 أو L2 لنفسه).
- **الطلب (Request Body):**
```json
{
  "title_ar": "ترتيب السرير وغرفة النوم",
  "assigned_user_id": "child-uuid-omar",
  "reward_stars": 10,
  "due_date": "2026-10-31",
  "category": "HOME",
  "rrule": "FREQ=DAILY"
}
```
- **الاستجابة (Response 201 Created):**
```json
{
  "task_id": "tsk-uuid-2",
  "status": "PENDING",
  "created_at": "2026-10-30T17:15:00Z"
}
```

### ج) تسليم المهمة بواسطة الطفل: `POST /v1/tasks/:taskId/submit`
- **الوصف:** استدعاء من هاتف الطفل عند إتمام الواجب.
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "SUBMITTED_BY_CHILD",
  "task_id": "tsk-uuid-1",
  "submitted_at": "2026-10-30T14:10:00Z"
}
```

### د) اعتماد إنجاز المهمة بواسطة الوالد: `POST /v1/tasks/:taskId/approve`
- **المصادقة:** Bearer Token مطلوب (البالغين: adult مع الصلاحية المطلوبة).
- **الطلب (Request Body):** (القيم المتاحة للقرار: `"APPROVE"` أو `"REJECT_WITH_NOTES"`)
```json
{
  "decision": "APPROVE",
  "notes_ar": "أحسنت يا بطل عمل متقن!"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "APPROVED",
  "task_id": "tsk-uuid-1",
  "points_awarded": 15,
  "child_user_id": "child-uuid-omar",
  "approved_at": "2026-10-30T17:20:00Z"
}
```

---

## 2. نقاط النهاية للتقويم والمواعيد (Calendar Endpoints)

### أ) جلب مواعيد التقويم العائلي: `GET /v1/calendar/events`
- **المعلمات:** `start_time=2026-10-01T00:00:00Z&end_time=2026-10-31T23:59:59Z`.
- **الاستجابة (Response 200 OK):**
```json
{
  "events": [
    {
      "event_id": "evt-uuid-1",
      "title_ar": "مراجعة أسنان سارة",
      "start_time": "2026-10-28T13:30:00Z",
      "end_time": "2026-10-28T14:30:00Z",
      "assigned_user_id": "child-uuid-sara",
      "location_text": "مستشفى الحبيب",
      "hijri_date": "1448-04-18"
    }
  ]
}
```

---

## 3. أحداث المجال والتكامل مع S1-05 و S1-09 عبر Outbox

1. `tasks.submitted`: يُبث لمركز القيادة S1-09 ليظهر كطلب اعتماد معلق في بطاقة «يتطلب انتباهك».
2. `tasks.completed`: يُبث لنظام المكافآت S1-05 لإيداع النقاط (+15 ⭐️) وتحديث السلسلة اليومية للطفل تلقائياً.
3. `calendar.event.reminder`: يُبث لخدمة التنبيهات المشتركة D-026 لإطلاق الإشعار المسبق على أجهزة الأسرة.
