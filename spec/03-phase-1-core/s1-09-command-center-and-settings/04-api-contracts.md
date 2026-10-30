---
id: S1-09
title: عقود الواجهات والشبكة — مركز القيادة والإعدادات
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-09/03-data-model, D-016, D-017, D-020]
last_updated: 2026-10-30
---
# S1-09: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-09 — command-center-and-settings`  
> **البروتوكول:** RESTful JSON عبر HTTPS + بث WebSocket لتحديثات لوحة القيادة اللحظية + أحداث Transactional Outbox (D-020).

---

## 1. نقاط النهاية لمركز القيادة والتجميع (Command Center Endpoints)

### أ) استعلام ملخص مركز القيادة التجميعي: `GET /v1/command-center/summary`
- **المصادقة:** Bearer Token مطلوب (L0 أو L1).
- **الاستجابة (Response 200 OK):**
```json
{
  "family_name": "عائلة آل ناصر",
  "server_time": "2026-10-30T07:30:00Z",
  "needs_attention": {
    "total_count": 2,
    "items": [
      {
        "id": "item-uuid-1",
        "source_system_id": "S1-05",
        "title": "طلب صرف مكافأة من عمر",
        "summary": "يرغب بصرف 50 نقطة مقابل بطاقة ألعاب",
        "severity": "ACTION_REQUIRED",
        "action_type": "APPROVE_REWARD",
        "payload": { "reward_id": "rew-123", "points": 50 }
      },
      {
        "id": "item-uuid-2",
        "source_system_id": "S1-01",
        "title": "انخفاض بطارية هاتف سارة",
        "summary": "البطارية أقل من 15% والاتصال متاح",
        "severity": "WARNING",
        "action_type": "CHECK_BATTERY",
        "payload": { "child_id": "sara-uuid", "battery_level": 14 }
      }
    ]
  },
  "widgets": [
    {
      "widget_id": "widget.location_mini",
      "display_order": 1,
      "payload": {
        "summary_status": "ALL_AT_SAFE_PLACES",
        "children": [
          { "name": "عمر", "location": "مدرسة الوحدة", "is_safe": true, "since_minutes": 120 },
          { "name": "سارة", "location": "البيت", "is_safe": true, "since_minutes": 300 }
        ]
      }
    },
    {
      "widget_id": "widget.tasks_today",
      "display_order": 2,
      "payload": {
        "total_tasks": 6,
        "completed": 4,
        "next_task": "مراجعة الرياضيات مع بابا (الساعة 5:00 م)"
      }
    }
  ]
}
```

### ب) اتخاذ إجراء سريع على بند معلق: `POST /v1/command-center/needs-attention/:itemId/act`
- **المصادقة:** Bearer Token مطلوب.
- **الطلب (Request Body):**
```json
{
  "action_decision": "APPROVE", // "APPROVE" | "REJECT" | "DISMISS"
  "notes_ar": "أحسنت يا بطل بارك الله فيك"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "ACTION_EXECUTED",
  "item_id": "item-uuid-1",
  "is_resolved": true,
  "resolved_at": "2026-10-30T07:31:00Z"
}
```

### ج) تحديث تفضيلات وترتيب الويدجات: `PUT /v1/command-center/widgets/preferences`
- **الطلب (Request Body):**
```json
{
  "preferences": [
    { "widget_id": "widget.tasks_today", "display_order": 1, "is_visible": true },
    { "widget_id": "widget.location_mini", "display_order": 2, "is_visible": true },
    { "widget_id": "widget.chat_recent", "display_order": 3, "is_visible": false }
  ]
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "PREFERENCES_SAVED",
  "updated_count": 3
}
```

---

## 2. نقاط النهاية لمركز الإعدادات الموحد (Unified Settings Endpoints)

### أ) جلب شجرة أقسام الإعدادات وأسطح التحكم: `GET /v1/settings/hub/tree`
- **الوصف:** يُرجع فهرس الإعدادات الكامل مصنفاً بحسب المانيفست المشترك وصلاحيات المستخدم النشط.
- **الاستجابة (Response 200 OK):**
```json
{
  "sections": [
    {
      "section_id": "sec_account",
      "title_ar": "حسابي والأجهزة",
      "icon": "user_circle",
      "systems": ["S1-01", "S1-02"]
    },
    {
      "section_id": "sec_family_authority",
      "title_ar": "إدارة الأسرة والأدوار",
      "icon": "shield_family",
      "systems": ["S1-03"]
    },
    {
      "section_id": "sec_services",
      "title_ar": "إعدادات خدمات المنصة المشتركة",
      "icon": "grid_apps",
      "systems": ["S1-05", "S1-06", "S1-07", "S1-08"]
    }
  ]
}
```

---

## 3. أحداث البث المباشر (WebSocket Stream)

يستمع مركز القيادة عبر قناة WebSocket `family:{familyId}:hub_stream`:
- `hub.needs_attention.pushed`: إشعار فوري بوصول طلب جديد من أحد الأبناء لتحديث البطاقة وإطلاق صوت تنبيه ناعم.
- `hub.widget_payload.refreshed`: تحديث بيانات أي ويدجت فرعية (مثل تحرك طفل لموقع جديد) ورندرتها في مكانها دون وميض الشاشة.
